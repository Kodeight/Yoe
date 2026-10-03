export type LanguageCode = 'en' | 'fr' | 'ar' | 'es' | 'ru' | 'it' | 'tr' | 'pt';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  uiLanguage: LanguageCode;
  theme: 'dark' | 'light';
  subscriptionStatus: 'trial' | 'active' | 'expired';
  activeJourneyId?: string;
  onboardingCompleted?: boolean;
  trialEndsAt?: string;
}

export interface LearnerProfile {
  experienceLevel: CEFRLevel;
  goals: string[];
  interests: string[];
  dailyGoalMinutes: number;
}

export interface LearningJourney {
  id: string;
  userId: string;
  targetLanguage: LanguageCode;
  supportLanguage: LanguageCode;
  cefrLevel: CEFRLevel;
  streakDays: number;
  totalMinutesSpoken: number;
  points: number;
  activeScenarioId?: string;
  createdAt: string;
}

export interface ScenarioObjective {
  id: string;
  text: string;
  completed: boolean;
  hint?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'dining' | 'shopping' | 'social' | 'work' | 'daily' | 'academic' | 'practical' | 'emergency' | 'culture' | 'daily-life';
  targetLanguage: LanguageCode;
  cefrLevel: CEFRLevel;
  location: string;
  characterName: string;
  characterRole: string;
  avatar: string;
  imageUrl?: string;
  objectives: ScenarioObjective[];
  initialGreeting: string;
  initialGreetingTranslation?: string;
  vocabularyDomain: string[];
}

export interface CorrectionDetail {
  original: string;
  corrected: string;
  explanation: string;
  grammarNote?: string;
  severity: 'gentle' | 'important';
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'tutor' | 'system';
  text: string;
  translation?: string;
  audioUrl?: string;
  timestamp: string;
  correction?: CorrectionDetail;
  learningSignals?: string[];
  vocabularyLearned?: Array<{
    word: string;
    translation: string;
    phonetic?: string;
    example?: string;
  }>;
}

export interface VocabularyItem {
  id: string;
  journeyId: string;
  word: string;
  translation: string;
  targetLanguage: LanguageCode;
  supportLanguage: LanguageCode;
  phonetic?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  cefrLevel: CEFRLevel;
  familiarity: number; // 0 - 100
  exposureCount: number;
  successfulCount: number;
  lastSeen: string;
}

export interface MistakeRecord {
  id: string;
  journeyId: string;
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'word_order' | 'agreement';
  pattern: string;
  exampleUserSaid: string;
  correctedForm: string;
  explanation: string;
  occurrenceCount: number;
  lastOccurred: string;
  resolved: boolean;
}

export interface CompetencyState {
  listening: number;
  speaking: number;
  vocabulary: number;
  grammar: number;
  fluency: number;
}

export interface DailyGoalProgress {
  spokenMinutes: number;
  targetMinutes: number;
  completedGoals: number;
  totalGoals: number;
}

export type LessonType = 'theory' | 'vocabulary' | 'grammar' | 'listening' | 'quiz' | 'speaking' | 'mini_game' | 'review';

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_order' | 'vocab_match' | 'true_false' | 'listening';
  question: string;
  audioText?: string;
  options?: string[];
  correctOptionIndex?: number;
  correctPhrase?: string;
  explanation: string;
  pairs?: Array<{ left: string; right: string }>;
}

export interface LessonTheory {
  concept: string;
  explanation: string;
  examples: Array<{ original: string; translation: string; phonetic?: string }>;
  keyTakeaway: string;
}

export interface LessonMiniGame {
  type: 'word_match' | 'sentence_builder';
  items?: Array<{ target: string; match: string }>;
  wordsPool?: string[];
  targetSentence?: string;
  sentenceTranslation?: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  description: string;
  type: LessonType;
  durationMin: number;
  xpReward: number;
  theoryContent?: LessonTheory;
  quizQuestions?: QuizQuestion[];
  miniGameData?: LessonMiniGame;
  speakingScenarioId?: string;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export interface CourseUnit {
  id: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  cefrLevel: CEFRLevel;
  targetLanguage: LanguageCode;
  icon: string;
  lessons: Lesson[];
  isCompleted?: boolean;
  isLocked?: boolean;
}
