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

  const { targetLanguage, supportLanguage, cefrLevel, goals } = req.body;
  const newJourney: LearningJourney = {
    id: `jrn_${targetLanguage || 'es'}_${Date.now()}`,
    userId: req.user.id,
    targetLanguage: targetLanguage || 'es',
    supportLanguage: supportLanguage || 'en',
    cefrLevel: cefrLevel || 'A1',
    streakDays: 1,
    totalMinutesSpoken: 0,
    points: 50,
    createdAt: new Date().toISOString()
  };

  await db.saveJourney(newJourney);

  // Set as user's active journey and mark onboarding completed
  const updatedUser = db.updateUser(req.user.id, {
    activeJourneyId: newJourney.id,
    onboardingCompleted: true
  });

  res.json({
    journey: newJourney,
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

// Scenarios
apiRouter.get('/scenarios', (req: Request, res: Response) => {
  const lang = req.query.targetLanguage as string;
  const scenarios = db.getScenarios(lang);
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

// AI Live Initial Greeting Endpoint
apiRouter.post('/ai/initial-greeting', async (req: Request, res: Response) => {
  try {
    const { scenarioId, journeyId, targetLanguage, supportLanguage, cefrLevel } = req.body;
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

    const greeting = await generateLiveGreeting(scenario, journey);
    res.json({ greeting });
  } catch (err: any) {
    console.error('[YOE GREETING ERROR]:', err);
    res.status(500).json({ error: 'Failed to generate live greeting' });
  }
});

// AI Chat Interaction
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  console.log('[YOE CHAT] request received');
  try {
    const { journeyId, scenarioId, userMessage, conversationHistory, targetLanguage, supportLanguage, cefrLevel } = req.body;

    console.log(`[YOE CHAT] user authenticated: ${!!((req as any).user || req.headers.authorization)}`);
    console.log(`[YOE CHAT] message length: ${userMessage?.length || 0}`);

    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const existingJourney = journeyId ? db.getJourney(journeyId) : null;

    console.log(`[YOE CHAT] scenario loaded: ${!!scenario}`);

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

    console.log(`[YOE CHAT] target language: ${journey.targetLanguage}`);
    console.log(`[YOE CHAT] support language: ${journey.supportLanguage}`);
    console.log(`[YOE CHAT] level: ${journey.cefrLevel}`);
    console.log(`[YOE CHAT] history length: ${conversationHistory?.length || 0}`);

    const recentMistakes = existingJourney ? db.getMistakes(existingJourney.id) : [];

    // Save user message
    db.saveChatMessage(scenarioId || scenario.id, {
      id: `msg_usr_${Date.now()}`,
      sessionId: scenarioId || scenario.id,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    });

    console.log('[YOE CHAT] Gemini request started');

    // Call Gemini Service
    const aiResult = await processScenarioTurn({
      scenario,
      journey,
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
      aiResponse: aiResult
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

    const journey = db.getJourney(journeyId) || {
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

    const tokenConfig = await createEphemeralLiveToken(scenario, journey);
    if (!tokenConfig || !tokenConfig.token) {
      throw new Error('Gemini Live ephemeral token was not created');
    }

    res.json({
      success: true,
      token: tokenConfig.token,
      model: LIVE_MODEL,
      voiceName: tokenConfig.voiceName
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
