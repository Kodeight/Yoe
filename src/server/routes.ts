import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { db, SUPPORTED_LANGUAGES } from './db';
import { processScenarioTurn, generateLiveGreeting, calibrateLearnerLevel, generateScenarioSpeech, getCharacterVoice, createEphemeralLiveToken, getGeminiApiKey, LIVE_MODEL } from './aiService';
import { registerHandler, loginHandler, meHandler, logoutHandler, requireAuth, AuthRequest, sanitizeUser } from './auth';
import { User, LearningJourney } from '../types';

export const apiRouter = Router();

// Rate limiting for sensitive authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many authentication requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Database Health Check Endpoint
apiRouter.get('/health/db', async (_req: Request, res: Response) => {
  const health = await db.getHealthStatus();
  res.json(health);
});

// Real Gemini AI Health Check Endpoint
apiRouter.get('/ai/health', async (_req: Request, res: Response) => {
  const apiKeyPresent = !!process.env.GEMINI_API_KEY;
  console.log(`[AI HEALTH CHECK] GEMINI_API_KEY_PRESENT=${apiKeyPresent}`);

  if (!apiKeyPresent) {
    res.status(503).json({
      server: 'ok',
      geminiConfigured: false,
      geminiReachable: false,
      error: 'GEMINI_API_KEY environment variable is not configured on the server',
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const testResult = await processScenarioTurn({
      scenario: db.getScenarios()[0],
      journey: {
        id: 'health_jrn',
        userId: 'health_usr',
        targetLanguage: 'es',
        supportLanguage: 'en',
        cefrLevel: 'A1',
        streakDays: 1,
        totalMinutesSpoken: 0,
        points: 0,
        createdAt: new Date().toISOString()
      },
      conversationHistory: [],
      userMessage: 'Reply with exactly: YOE_BACKEND_TEST_OK'
    });

    res.json({
      server: 'ok',
      geminiConfigured: true,
      geminiReachable: true,
      model: 'gemini-3.8-flash',
      testResponse: testResult.response,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[AI HEALTH ERROR]:', err);
    res.status(502).json({
      server: 'ok',
      geminiConfigured: true,
      geminiReachable: false,
      error: err?.message || 'Gemini API call failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Production Auth Routes
apiRouter.post('/auth/register', authLimiter, registerHandler);
apiRouter.post('/auth/login', authLimiter, loginHandler);
apiRouter.get('/auth/me', requireAuth, meHandler);
apiRouter.post('/auth/logout', logoutHandler);

// Languages
apiRouter.get('/languages', (req: Request, res: Response) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

// Journeys
apiRouter.get('/journeys', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const journeys = await db.getJourneysForUser(req.user.id);
  res.json({ journeys });
});

apiRouter.post('/journeys', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const {
    targetLanguage,
    supportLanguage,
    cefrLevel,
    goals,
    motivation,
    focusAreas,
    knownLanguages,
    previousExperience,
    activateImmediately
  } = req.body;

  const targetLang = targetLanguage || 'es';
  const supportLang = supportLanguage || req.user.supportLanguage || 'en';
  const level = cefrLevel || 'A1';

  // Check if an existing archived journey exists for this language to resume
  const existingJourneys = await db.getJourneysForUser(req.user.id);
  const existingArchived = (db as any).localStore?.journeys?.find(
    (j: LearningJourney) => j.userId === req.user!.id && j.targetLanguage === targetLang && j.isArchived
  );

  let targetJourney: LearningJourney;

  if (existingArchived) {
    existingArchived.isArchived = false;
    existingArchived.cefrLevel = level;
    existingArchived.supportLanguage = supportLang;
    if (motivation || goals) existingArchived.motivation = motivation || goals;
    if (focusAreas) existingArchived.focusAreas = focusAreas;
    existingArchived.updatedAt = new Date().toISOString();
    await db.saveJourney(existingArchived);
    targetJourney = existingArchived;
  } else {
    // Find starter scenario for this language
    const langScenarios = db.getScenarios(targetLang, undefined, level);
    const starterScen = langScenarios.length > 0 ? langScenarios[0] : undefined;

    targetJourney = {
      id: `jrn_${targetLang}_${Date.now()}`,
      userId: req.user.id,
      targetLanguage: targetLang,
      supportLanguage: supportLang,
      cefrLevel: level,
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      motivation: motivation || goals || req.user.motivation || 'Daily Conversation',
      focusAreas: focusAreas || req.user.focusAreas || ['Speaking'],
      knownLanguages: knownLanguages || req.user.knownLanguages || [supportLang],
      previousExperience: previousExperience || req.user.previousExperience || 'beginner',
      activeScenarioId: starterScen?.id,
      createdAt: new Date().toISOString()
    };

    await db.saveJourney(targetJourney);
  }

  // Activate journey if requested (default true)
  const shouldActivate = activateImmediately !== false;
  let updatedUser = req.user;
  if (shouldActivate) {
    updatedUser = db.updateUser(req.user.id, {
      activeJourneyId: targetJourney.id,
      onboardingCompleted: true
    }) || req.user;
  }

  const allJourneys = await db.getJourneysForUser(req.user.id);

  res.json({
    journey: targetJourney,
    journeys: allJourneys,
    user: sanitizeUser(updatedUser)
  });
});

apiRouter.post('/journeys/:id/activate', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = await db.switchActiveJourney(req.user.id, req.params.id);
  if (!result.journey) {
    res.status(404).json({ error: 'Journey not found or unauthorized' });
    return;
  }

  const allJourneys = await db.getJourneysForUser(req.user.id);

  res.json({
    success: true,
    journey: result.journey,
    journeys: allJourneys,
    user: result.user ? sanitizeUser(result.user) : sanitizeUser(req.user)
  });
});

apiRouter.post('/journeys/:id/archive', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = await db.archiveJourney(req.user.id, req.params.id);
  if (!result.success) {
    res.status(404).json({ error: 'Journey not found or unauthorized' });
    return;
  }

  const remainingJourneys = await db.getJourneysForUser(req.user.id);
  const updatedUser = db.getUser(req.user.id);

  res.json({
    success: true,
    nextActiveJourney: result.nextActiveJourney,
    journeys: remainingJourneys,
    user: updatedUser ? sanitizeUser(updatedUser) : sanitizeUser(req.user)
  });
});

apiRouter.delete('/journeys/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = await db.archiveJourney(req.user.id, req.params.id);
  if (!result.success) {
    res.status(404).json({ error: 'Journey not found or unauthorized' });
    return;
  }

  const remainingJourneys = await db.getJourneysForUser(req.user.id);
  const updatedUser = db.getUser(req.user.id);

  res.json({
    success: true,
    nextActiveJourney: result.nextActiveJourney,
    journeys: remainingJourneys,
    user: updatedUser ? sanitizeUser(updatedUser) : sanitizeUser(req.user)
  });
});

apiRouter.put('/journeys/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const journey = db.getJourney(req.params.id);
  if (!journey) {
    res.status(404).json({ error: 'Journey not found' });
    return;
  }

  if (journey.userId !== req.user.id) {
    res.status(403).json({ error: 'Forbidden: Cannot edit another user\'s journey' });
    return;
  }

  Object.assign(journey, req.body);
  await db.saveJourney(journey);
  res.json({ journey });
});

// Scenarios & Learning Library (Database-Driven)
apiRouter.get('/scenarios', (req: Request, res: Response) => {
  const lang = req.query.targetLanguage as string;
  const category = req.query.category as string;
  const level = req.query.cefrLevel as string;
  const scenarios = db.getScenarios(lang, category, level);
  res.json({ scenarios });
});

apiRouter.get('/scenarios/:id', (req: Request, res: Response) => {
  const scenario = db.getScenarioById(req.params.id);
  if (!scenario) {
    res.status(404).json({ error: 'Scenario not found' });
    return;
  }
  res.json({ scenario });
});

// Courses & Lessons (Database-Driven)
apiRouter.get('/courses', (req: Request, res: Response) => {
  const lang = req.query.targetLanguage as string;
  const level = req.query.cefrLevel as string;
  const courses = db.getCourses(lang, level);
  res.json({ courses });
});

apiRouter.get('/courses/:id', (req: Request, res: Response) => {
  const course = db.getCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json({ course });
});

apiRouter.get('/lessons/:id', (req: Request, res: Response) => {
  const match = db.getLessonById(req.params.id);
  if (!match) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json(match);
});

// Dynamic Scenario Recommendations (Never forces completed scenario repeatedly)
apiRouter.get('/recommendations', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'guest_user';
  const targetLanguage = req.query.targetLanguage as string;
  const cefrLevel = req.query.cefrLevel as string;
  const learningGoal = req.query.learningGoal as string;
  const journeyId = req.query.journeyId as string;
  const recommendations = db.getRecommendations(userId, targetLanguage, cefrLevel, learningGoal, journeyId);
  res.json({ recommendations });
});

// Real Learning Statistics & Streak Breakdown (Database-Backed)
apiRouter.get('/progress/stats', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'guest_user';
  const journeyId = req.query.journeyId as string | undefined;
  const localDate = req.query.localDate as string | undefined;
  const stats = db.getJourneyStats(userId, journeyId, localDate);
  res.json({ stats });
});

// Speaking Session & Real Voice Practice Duration Tracker
apiRouter.post('/progress/speaking-session', async (req: Request, res: Response) => {
  try {
    const { userId, journeyId, scenarioId, durationMinutes, durationSeconds, turnsCount, localDate } = req.body;
    const durMins = Number(durationMinutes) || (durationSeconds ? Math.max(1, Math.round(Number(durationSeconds) / 60)) : 1);
    const turns = Number(turnsCount) || 1;
    // Meaningful conversation practice rewards real XP: 15 base + 5 per 2 turns (capped at 40 XP)
    const earnedXp = Math.min(40, 15 + Math.floor(turns / 2) * 5);

    const uid = userId || 'guest_user';
    const now = new Date();
    const today = localDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Record qualifying activity date for streak calculation
    const streakResult = await db.recordUserActivity(uid, journeyId, 'voice_conversation', today, earnedXp);

    let updatedJourney: LearningJourney | undefined;
    if (journeyId) {
      const journey = db.getJourney(journeyId);
      if (journey) {
        journey.totalMinutesSpoken = (journey.totalMinutesSpoken || 0) + durMins;
        journey.points = (journey.points || 0) + earnedXp;
        await db.saveJourney(journey);
        updatedJourney = journey;
      }
    }

    res.json({
      success: true,
      earnedXp,
      durationMinutes: durMins,
      streak: streakResult.streak,
      longestStreak: streakResult.longestStreak,
      journey: updatedJourney
    });
  } catch (err: any) {
    console.error('[SPEAKING SESSION ERROR]:', err);
    res.status(500).json({ error: 'Failed to record speaking session' });
  }
});

// Scenario Completion & Progress Tracking (Database Persistence)
apiRouter.post('/progress/complete-scenario', async (req: Request, res: Response) => {
  try {
    const { userId, journeyId, scenarioId, lessonId, courseId, xpEarned, durationMinutes, durationSeconds, errorCount, localDate } = req.body;
    const result = await db.recordCompletedScenario(
      userId || 'guest_user',
      journeyId,
      scenarioId,
      {
        xpEarned: Number(xpEarned) || 50,
        durationMinutes: Number(durationMinutes) || (durationSeconds ? Math.max(1, Math.round(Number(durationSeconds) / 60)) : 3),
        durationSeconds: Number(durationSeconds) || undefined,
        errorCount: typeof errorCount === 'number' ? errorCount : 0,
        lessonId: lessonId || undefined,
        courseId: courseId || undefined
      },
      localDate
    );
    res.json({
      success: true,
      journey: result.journey,
      nextRecommended: result.nextRecommended,
      sessionRecord: result.sessionRecord
    });
  } catch (err: any) {
    console.error('[COMPLETE SCENARIO ERROR]:', err);
    res.status(500).json({ error: 'Failed to record completed scenario' });
  }
});

// AI Live Initial Greeting Endpoint (Dual Lesson + Scenario Awareness)
apiRouter.post('/ai/initial-greeting', async (req: Request, res: Response) => {
  try {
    const { scenarioId, journeyId, lessonId, courseId, targetLanguage, supportLanguage, cefrLevel } = req.body;
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const existingJourney = journeyId ? db.getJourney(journeyId) : null;

    const journey: LearningJourney = existingJourney || {
      id: journeyId || 'temp_jrn',
      userId: 'temp_user',
      targetLanguage: (targetLanguage || scenario?.targetLanguage || 'es') as any,
      supportLanguage: (supportLanguage || 'en') as any,
      cefrLevel: (cefrLevel || scenario?.cefrLevel || 'A1') as any,
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: new Date().toISOString()
    };

    // Resolve curriculum context (lesson + course)
    const curriculum = db.getLessonAndCourseForScenario(
      scenario.id,
      lessonId,
      journey.targetLanguage,
      journey.cefrLevel
    );

    // Resolve learner profile for personalization
    const user = existingJourney ? db.getUser(existingJourney.userId) : null;
    const learnerProfile = req.body?.learnerProfile || {
      name: user?.name || existingJourney?.learnerName,
      motivation: user?.motivation || existingJourney?.motivation || existingJourney?.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || existingJourney?.focusAreas,
      knownLanguages: user?.knownLanguages || existingJourney?.knownLanguages,
      supportLanguage: user?.supportLanguage || existingJourney?.supportLanguage,
      previousExperience: user?.previousExperience || existingJourney?.previousExperience
    };

    const greeting = await generateLiveGreeting(
      scenario,
      journey,
      curriculum?.lesson,
      curriculum?.course,
      learnerProfile
    );
    res.json({
      greeting,
      lesson: curriculum?.lesson ? { id: curriculum.lesson.id, title: curriculum.lesson.title } : undefined,
      course: curriculum?.course ? { id: curriculum.course.id, title: curriculum.course.title } : undefined
    });
  } catch (err: any) {
    console.error('[YOE GREETING ERROR]:', err);
    res.status(500).json({ error: 'Failed to generate live greeting' });
  }
});

// AI Chat Interaction (Dual Lesson + Scenario Context)
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  console.log('[YOE CHAT] request received');
  try {
    const {
      journeyId,
      scenarioId,
      lessonId,
      courseId,
      userMessage,
      conversationHistory,
      targetLanguage,
      supportLanguage,
      cefrLevel
    } = req.body;

    console.log(`[YOE CHAT] user authenticated: ${!!((req as any).user || req.headers.authorization)}`);
    console.log(`[YOE CHAT] message length: ${userMessage?.length || 0}`);

    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const existingJourney = journeyId ? db.getJourney(journeyId) : null;

    console.log(`[YOE CHAT] scenario loaded: ${!!scenario} (${scenario.title})`);

    const journey: LearningJourney = existingJourney || {
      id: journeyId || 'temp_jrn',
      userId: 'temp_user',
      targetLanguage: (targetLanguage || scenario?.targetLanguage || 'es') as any,
      supportLanguage: (supportLanguage || 'en') as any,
      cefrLevel: (cefrLevel || scenario?.cefrLevel || 'A1') as any,
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: new Date().toISOString()
    };

    // Resolve curriculum context (lesson + course)
    const curriculum = db.getLessonAndCourseForScenario(
      scenario.id,
      lessonId,
      journey.targetLanguage,
      journey.cefrLevel
    );

    console.log(`[YOE CHAT] target language: ${journey.targetLanguage}, level: ${journey.cefrLevel}`);
    console.log(`[YOE CHAT] curriculum lesson: ${curriculum?.lesson?.title || 'None'}, course: ${curriculum?.course?.title || 'None'}`);

    const recentMistakes = existingJourney ? db.getMistakes(existingJourney.id) : [];

    // Save user message
    db.saveChatMessage(scenarioId || scenario.id, {
      id: `msg_usr_${Date.now()}`,
      sessionId: scenarioId || scenario.id,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    });

    // Resolve learner profile for personalization
    const user = existingJourney ? db.getUser(existingJourney.userId) : null;
    const learnerProfile = req.body?.learnerProfile || {
      name: user?.name || existingJourney?.learnerName,
      motivation: user?.motivation || existingJourney?.motivation || existingJourney?.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || existingJourney?.focusAreas,
      knownLanguages: user?.knownLanguages || existingJourney?.knownLanguages,
      supportLanguage: user?.supportLanguage || existingJourney?.supportLanguage,
      previousExperience: user?.previousExperience || existingJourney?.previousExperience
    };

    console.log('[YOE CHAT] Gemini request started with dual curriculum + scenario context + learner personalization');

    // Call Gemini Service with dual lesson + scenario context + learner personalization
    const aiResult = await processScenarioTurn({
      scenario,
      lesson: curriculum?.lesson,
      course: curriculum?.course,
      journey,
      learnerProfile,
      conversationHistory: conversationHistory || [],
      userMessage,
      recentMistakes
    });

    console.log(`[YOE CHAT] Gemini response received, length: ${aiResult.response?.length || 0}`);

    // Save tutor message
    const tutorMsg = db.saveChatMessage(scenarioId || scenario.id, {
      id: `msg_ttr_${Date.now()}`,
      sessionId: scenarioId || scenario.id,
      sender: 'tutor',
      text: aiResult.response,
      translation: aiResult.translation,
      audioUrl: aiResult.audioBase64 ? `data:audio/wav;base64,${aiResult.audioBase64}` : undefined,
      timestamp: new Date().toISOString(),
      correction: aiResult.correction,
      learningSignals: aiResult.learningSignals,
      vocabularyLearned: aiResult.vocabulary
    });

    // Save correction if present
    if (aiResult.correction && journey.id && existingJourney) {
      db.addMistake(journey.id, {
        category: 'grammar',
        pattern: aiResult.correction.grammarNote || 'Language structure',
        exampleUserSaid: aiResult.correction.original,
        correctedForm: aiResult.correction.corrected,
        explanation: aiResult.correction.explanation,
        occurrenceCount: 1,
        lastOccurred: new Date().toISOString(),
        resolved: false
      });
    }

    // Save vocabulary items if present
    if (aiResult.vocabulary && journey.id && existingJourney) {
      for (const item of aiResult.vocabulary) {
        db.addVocabulary(journey.id, {
          word: item.word,
          translation: item.translation,
          targetLanguage: journey.targetLanguage,
          supportLanguage: journey.supportLanguage,
          phonetic: item.phonetic,
          exampleSentence: item.example,
          cefrLevel: journey.cefrLevel,
          familiarity: 50,
          exposureCount: 1,
          successfulCount: 1,
          lastSeen: new Date().toISOString()
        });
      }
    }

    // Award real practice metrics
    if (existingJourney) {
      existingJourney.points = (existingJourney.points || 0) + 15;
      existingJourney.totalMinutesSpoken = (existingJourney.totalMinutesSpoken || 0) + 1;
      if (existingJourney.streakDays === 0) {
        existingJourney.streakDays = 1;
      }
      db.saveJourney(existingJourney);
    }

    res.json({
      message: tutorMsg,
      aiResponse: aiResult,
      activeContext: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        lessonId: curriculum?.lesson?.id,
        lessonTitle: curriculum?.lesson?.title,
        courseId: curriculum?.course?.id,
        courseTitle: curriculum?.course?.title
      }
    });
  } catch (err: any) {
    console.error('[YOE CHAT ERROR] status 500:', err);
    res.status(500).json({
      error: "Yoe couldn't connect right now. Please try again.",
      details: err?.message || 'Gemini service error'
    });
  }
});

// TTS Endpoint
apiRouter.post('/ai/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName, characterName, role } = req.body;
    const selectedVoice = voiceName || (characterName ? getCharacterVoice(characterName, role || '') : 'Kore');
    const audioBase64 = await generateScenarioSpeech(text, selectedVoice);
    if (!audioBase64) {
      res.status(500).json({ error: 'Failed to synthesize speech' });
      return;
    }
    res.json({ audioBase64, mimeType: 'audio/wav' });
  } catch (err: any) {
    console.error('TTS route error:', err);
    res.status(500).json({ error: 'TTS synthesis error', details: err.message });
  }
});

// Live Token Handler (Supports both GET and POST with strict no-cache headers)
const handleLiveToken = async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: 'Gemini Live credentials are not configured'
    });
  }

  try {
    const scenarioId = req.body?.scenarioId || (req.query?.scenarioId as string);
    const journeyId = req.body?.journeyId || (req.query?.journeyId as string);
    const lessonId = req.body?.lessonId || (req.query?.lessonId as string);

    const journey: LearningJourney = db.getJourney(journeyId) || {
      id: journeyId || 'temp_jrn',
      userId: 'temp_user',
      targetLanguage: 'es',
      supportLanguage: 'en',
      cefrLevel: 'A1',
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: new Date().toISOString()
    };
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];

    // Resolve curriculum context (lesson + course)
    const curriculum = db.getLessonAndCourseForScenario(
      scenario.id,
      lessonId,
      journey.targetLanguage,
      journey.cefrLevel
    );

    // Resolve learner profile for personalization
    const user = journey ? db.getUser(journey.userId) : null;
    const learnerProfile = req.body?.learnerProfile || {
      name: user?.name || journey?.learnerName,
      motivation: user?.motivation || journey?.motivation || journey?.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || journey?.focusAreas,
      knownLanguages: user?.knownLanguages || journey?.knownLanguages,
      supportLanguage: user?.supportLanguage || journey?.supportLanguage,
      previousExperience: user?.previousExperience || journey?.previousExperience
    };

    const tokenConfig = await createEphemeralLiveToken(
      scenario,
      journey,
      curriculum?.lesson,
      curriculum?.course,
      learnerProfile
    );
    if (!tokenConfig || !tokenConfig.token) {
      throw new Error('Gemini Live ephemeral token was not created');
    }

    res.json({
      success: true,
      token: tokenConfig.token,
      model: LIVE_MODEL,
      voiceName: tokenConfig.voiceName,
      activeContext: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        lessonId: curriculum?.lesson?.id,
        lessonTitle: curriculum?.lesson?.title,
        courseId: curriculum?.course?.id,
        courseTitle: curriculum?.course?.title
      }
    });
  } catch (err: any) {
    console.error('[YOE LIVE] Token creation failure:', err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to generate live session token'
    });
  }
};

apiRouter.get('/ai/live/token', handleLiveToken);
apiRouter.post('/ai/live/token', handleLiveToken);

// Real Live Health Check Endpoint
apiRouter.get('/ai/live/health', async (req: Request, res: Response) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  const geminiConfigured = Boolean(getGeminiApiKey());
  if (!geminiConfigured) {
    return res.status(503).json({
      success: false,
      geminiConfigured: false,
      tokenCreatable: false,
      error: 'Gemini Live credentials are not configured'
    });
  }

  try {
    const tokenResult = await createEphemeralLiveToken();
    const tokenCreatable = Boolean(tokenResult?.token);

    res.json({
      success: tokenCreatable,
      geminiConfigured: true,
      tokenCreatable,
      model: LIVE_MODEL
    });
  } catch (err: any) {
    console.error('[YOE LIVE] Health test error:', err?.message || err);
    res.status(500).json({
      success: false,
      geminiConfigured: true,
      tokenCreatable: false,
      error: err?.message || 'Token creation verification failed'
    });
  }
});

apiRouter.post('/ai/calibrate', async (req: Request, res: Response) => {
  try {
    const result = await calibrateLearnerLevel(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('Calibration route error:', err);
    res.status(500).json({ error: 'Failed to calibrate learner level' });
  }
});

// Vocabulary
apiRouter.get('/vocabulary', (req: Request, res: Response) => {
  const journeyId = req.query.journeyId as string;
  if (!journeyId) {
    res.json({ vocabulary: [] });
    return;
  }
  const vocabulary = db.getVocabulary(journeyId);
  res.json({ vocabulary });
});

apiRouter.post('/vocabulary', (req: Request, res: Response) => {
  const { journeyId, ...item } = req.body;
  if (!journeyId || !item.word) {
    res.status(400).json({ error: 'journeyId and word are required' });
    return;
  }
  const created = db.addVocabulary(journeyId, item);
  res.json({ vocabulary: created });
});

// Mistakes
apiRouter.get('/mistakes', (req: Request, res: Response) => {
  const journeyId = req.query.journeyId as string;
  if (!journeyId) {
    res.json({ mistakes: [] });
    return;
  }
  const mistakes = db.getMistakes(journeyId);
  res.json({ mistakes });
});

apiRouter.post('/mistakes', (req: Request, res: Response) => {
  const { journeyId, ...mistake } = req.body;
  if (!journeyId || !mistake.pattern) {
    res.status(400).json({ error: 'journeyId and pattern are required' });
    return;
  }
  const created = db.addMistake(journeyId, mistake);
  res.json({ mistake: created });
});

// Settings
apiRouter.put('/settings', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const updatedUser = db.updateUser(req.user.id, req.body);
  res.json({ user: updatedUser ? sanitizeUser(updatedUser) : sanitizeUser(req.user) });
});
