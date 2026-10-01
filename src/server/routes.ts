import { Router, Request, Response } from 'express';
import { db, SUPPORTED_LANGUAGES } from './db';
import { processScenarioTurn, calibrateLearnerLevel } from './aiService';
import { User, LearningJourney } from '../types';

export const apiRouter = Router();

// Auth routes
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let userId = 'usr_demo';
  if (authHeader && authHeader.startsWith('Bearer usr_')) {
    userId = authHeader.replace('Bearer ', '').trim();
  }
  const user = db.getUser(userId) || db.getUser('usr_demo');
  if (!user) {
    res.status(401).json({ error: 'User not authenticated' });
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
  const { email, name, password, targetLanguage, supportLanguage } = req.body;
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

  // Initialize their first journey
  const startingTarget = targetLanguage || 'en';
  const startingSupport = supportLanguage || 'es';
  const journey: LearningJourney = {
    id: `jrn_${startingTarget}_${Date.now()}`,
    userId: user.id,
    targetLanguage: startingTarget,
    supportLanguage: startingSupport,
    cefrLevel: 'A1',
    streakDays: 1,
    totalMinutesSpoken: 0,
    points: 100,
    createdAt: new Date().toISOString()
  };
  db.saveJourney(journey);

  res.json({
    user,
    token: `Bearer ${user.id}`,
    journey
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
  const userId = (req.query.userId as string) || 'usr_demo';
  const journeys = db.getJourneysForUser(userId);
  res.json({ journeys });
});

apiRouter.post('/journeys', (req: Request, res: Response) => {
  const { userId, targetLanguage, supportLanguage, cefrLevel } = req.body;
  const newJourney: LearningJourney = {
    id: `jrn_${targetLanguage}_${Date.now()}`,
    userId: userId || 'usr_demo',
    targetLanguage,
    supportLanguage: supportLanguage || 'en',
    cefrLevel: cefrLevel || 'A1',
    streakDays: 1,
    totalMinutesSpoken: 0,
    points: 100,
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

    const journey = db.getJourney(journeyId) || db.getJourneysForUser('usr_demo')[0];
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const recentMistakes = db.getMistakes(journey.id);

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
    if (aiResult.correction) {
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
    if (aiResult.vocabulary) {
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

    // Award XP points for practice
    journey.points += 15;
    journey.totalMinutesSpoken += 1;
    db.saveJourney(journey);

    res.json({
      replyMessage: tutorMsg,
      aiResult,
      journey
    });
  } catch (error) {
    console.error('Error in /api/ai/chat:', error);
    res.status(500).json({ error: 'Failed to process AI conversation turn' });
  }
});

// Calibration
apiRouter.post('/ai/calibrate', async (req: Request, res: Response) => {
  try {
    const result = await calibrateLearnerLevel(req.body);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: 'Calibration failed' });
  }
});

// Vocabulary
apiRouter.get('/vocabulary', (req: Request, res: Response) => {
  const journeyId = (req.query.journeyId as string) || 'jrn_en_1';
  const vocabulary = db.getVocabulary(journeyId);
  res.json({ vocabulary });
});

// Mistakes
apiRouter.get('/mistakes', (req: Request, res: Response) => {
  const journeyId = (req.query.journeyId as string) || 'jrn_en_1';
  const mistakes = db.getMistakes(journeyId);
  res.json({ mistakes });
});

// Progress overview
apiRouter.get('/progress', (req: Request, res: Response) => {
  const journeyId = (req.query.journeyId as string) || 'jrn_en_1';
  const journey = db.getJourney(journeyId) || db.getJourneysForUser('usr_demo')[0];
  const vocabulary = db.getVocabulary(journeyId);
  const mistakes = db.getMistakes(journeyId);

  res.json({
    journey,
    competencies: {
      listening: 78,
      speaking: 65,
      vocabulary: Math.min(95, vocabulary.length * 15 + 40),
      grammar: 62,
      fluency: 58
    },
    vocabCount: vocabulary.length,
    activeMistakesCount: mistakes.filter(m => !m.resolved).length,
    dailyGoal: {
      spokenMinutes: journey.totalMinutesSpoken % 10,
      targetMinutes: 10,
      completedGoals: 3,
      totalGoals: 5
    }
  });
});

// Settings update
apiRouter.put('/settings', (req: Request, res: Response) => {
  const user = db.getUser('usr_demo');
  if (user) {
    Object.assign(user, req.body);
    db.updateUser(user);
  }
  res.json({ user });
});

// Subscription
apiRouter.get('/subscription', (req: Request, res: Response) => {
  const user = db.getUser('usr_demo');
  res.json({
    status: user?.subscriptionStatus || 'trial',
    trialEndsAt: user?.trialEndsAt,
    plans: [
      { id: 'monthly', name: 'Monthly Pro', price: '$9.99/mo', period: 'monthly' },
      { id: 'yearly', name: 'Yearly Pro', price: '$79.99/yr', period: 'yearly', badge: 'Save 33%' }
    ]
  });
});
