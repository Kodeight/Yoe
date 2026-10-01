import { Router, Request, Response } from 'express';
import { db, SUPPORTED_LANGUAGES } from './db';
import { processScenarioTurn, calibrateLearnerLevel } from './aiService';
import { User, LearningJourney } from '../types';

export const apiRouter = Router();

// Auth routes
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer usr_')) {
    res.json({ user: null });
    return;
  }
  const userId = authHeader.replace('Bearer ', '').trim();
  const user = db.getUser(userId);
  if (!user) {
    res.json({ user: null });
    return;
  }
  res.json({ user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = db.validatePassword(email, password);
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const journeys = db.getJourneysForUser(user.id);
  res.json({
    user,
    token: `Bearer ${user.id}`,
    journeys
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' });
    return;
  }

  const user = db.createUser(name || 'Language Learner', email, password);

  res.json({
    user,
    token: `Bearer ${user.id}`,
    journeys: []
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Languages
apiRouter.get('/languages', (req: Request, res: Response) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});

// Journeys
apiRouter.get('/journeys', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let userId = req.query.userId as string;
  if (!userId && authHeader && authHeader.startsWith('Bearer usr_')) {
    userId = authHeader.replace('Bearer ', '').trim();
  }
  if (!userId) {
    res.json({ journeys: [] });
    return;
  }
  const journeys = db.getJourneysForUser(userId);
  res.json({ journeys });
});

apiRouter.post('/journeys', (req: Request, res: Response) => {
  const { userId, targetLanguage, supportLanguage, cefrLevel } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'User ID is required to create a journey' });
    return;
  }
  const newJourney: LearningJourney = {
    id: `jrn_${targetLanguage}_${Date.now()}`,
    userId,
    targetLanguage: targetLanguage || 'en',
    supportLanguage: supportLanguage || 'en',
    cefrLevel: cefrLevel || 'A1',
    streakDays: 0,
    totalMinutesSpoken: 0,
    points: 0,
    createdAt: new Date().toISOString()
  };
  db.saveJourney(newJourney);
  res.json({ journey: newJourney });
});

apiRouter.put('/journeys/:id', (req: Request, res: Response) => {
  const journey = db.getJourney(req.params.id);
  if (!journey) {
    res.status(404).json({ error: 'Journey not found' });
    return;
  }
  Object.assign(journey, req.body);
  db.saveJourney(journey);
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
apiRouter.put('/settings', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer usr_')) {
    res.json({ success: true });
    return;
  }
  const userId = authHeader.replace('Bearer ', '').trim();
  const user = db.getUser(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  Object.assign(user, req.body);
  db.updateUser(user);
  res.json({ user });
});
