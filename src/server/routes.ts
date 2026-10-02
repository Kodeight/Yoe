import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { db, SUPPORTED_LANGUAGES } from './db';
import { processScenarioTurn, calibrateLearnerLevel, generateScenarioSpeech, getCharacterVoice, createEphemeralLiveToken, LIVE_MODEL } from './aiService';
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

// AI Chat Interaction
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { journeyId, scenarioId, userMessage, conversationHistory } = req.body;

    const journey = db.getJourney(journeyId) || {
      id: journeyId || 'temp_jrn',
      userId: 'temp_user',
      targetLanguage: 'en',
      supportLanguage: 'en',
      cefrLevel: 'A1',
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: new Date().toISOString()
    };

    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const recentMistakes = journey ? db.getMistakes(journey.id) : [];

    // Save user message
    db.saveChatMessage(scenarioId, {
      id: `msg_usr_${Date.now()}`,
      sessionId: scenarioId,
      sender: 'user',
      text: userMessage,
      timestamp: new Date().toISOString()
    });

    // Call Gemini Service
    const aiResult = await processScenarioTurn({
      scenario,
      journey,
      conversationHistory: conversationHistory || [],
      userMessage,
      recentMistakes
    });

    // Save tutor message
    const tutorMsg = db.saveChatMessage(scenarioId, {
      id: `msg_ttr_${Date.now()}`,
      sessionId: scenarioId,
      sender: 'tutor',
      text: aiResult.response,
      translation: aiResult.translation,
      timestamp: new Date().toISOString(),
      correction: aiResult.correction,
      learningSignals: aiResult.learningSignals,
      vocabularyLearned: aiResult.vocabulary
    });

    // Save correction if present
    if (aiResult.correction && journey.id) {
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
    if (aiResult.vocabulary && journey.id) {
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
    if (journey.id && db.getJourney(journey.id)) {
      const liveJourney = db.getJourney(journey.id)!;
      liveJourney.points = (liveJourney.points || 0) + 15;
      liveJourney.totalMinutesSpoken = (liveJourney.totalMinutesSpoken || 0) + 1;
      if (liveJourney.streakDays === 0) {
        liveJourney.streakDays = 1;
      }
      db.saveJourney(liveJourney);
    }

    res.json({
      message: tutorMsg,
      aiResponse: aiResult
    });
  } catch (err: any) {
    console.error('Error handling AI chat route:', err);
    res.status(500).json({
      error: 'Failed to process AI chat message',
      details: err.message
    });
  }
});

// Calibration
apiRouter.post('/api/ai/tts', async (req: Request, res: Response) => {
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

apiRouter.post('/api/ai/live/token', async (req: Request, res: Response) => {
  try {
    const { journeyId, scenarioId } = req.body;
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
    res.json(tokenConfig);
  } catch (err: any) {
    console.error('Live token generation error:', err);
    res.status(500).json({ error: 'Failed to generate live session token', details: err.message });
  }
});

apiRouter.post('/ai/live/token', async (req: Request, res: Response) => {
  try {
    const { journeyId, scenarioId } = req.body;
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
    res.json(tokenConfig);
  } catch (err: any) {
    console.error('Live token generation error:', err);
    res.status(500).json({ error: 'Failed to generate live session token', details: err.message });
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
