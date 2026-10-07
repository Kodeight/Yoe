import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { User, LearningJourney, VocabularyItem, MistakeRecord, ChatMessage, Language, Scenario, CourseUnit, Lesson } from '../types';
import { INITIAL_DATABASE_SCENARIOS, INITIAL_DATABASE_COURSES } from './learningLibrary';

const { Pool } = pg;

// Database Configuration
const DATABASE_URL = process.env.DATABASE_URL;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'yoe_store.json');

export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  uiLanguage: string;
  theme: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
  isPremium?: boolean;
  trialStartedAt?: string;
  trialEndsAt?: string;
  emailVerified: boolean;
  status: string;
  activeJourneyId?: string;
  onboardingCompleted?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  learningGoal?: string;
  motivation?: string;
  focusAreas?: string[];
  knownLanguages?: string[];
  supportLanguage?: string;
  previousExperience?: string;
}

import { SUPPORTED_LANGUAGES } from '../constants/languages';
export { SUPPORTED_LANGUAGES };

export const STARTER_SCENARIOS: Scenario[] = INITIAL_DATABASE_SCENARIOS;
export const STARTER_COURSES: CourseUnit[] = INITIAL_DATABASE_COURSES;

class PersistentDatabase {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;
  private localStore: {
    users: DatabaseUser[];
    journeys: LearningJourney[];
    scenarios: Scenario[];
    courses: CourseUnit[];
    completedScenarios: Record<string, string[]>;
    vocabulary: Record<string, VocabularyItem[]>;
    mistakes: Record<string, MistakeRecord[]>;
    chatHistories: Record<string, ChatMessage[]>;
    sessions: any[];
  } = {
    users: [],
    journeys: [],
    scenarios: INITIAL_DATABASE_SCENARIOS,
    courses: INITIAL_DATABASE_COURSES,
    completedScenarios: {},
    vocabulary: {},
    mistakes: {},
    chatHistories: {},
    sessions: []
  };

  constructor() {
    this.initFileStore();
    this.initPostgresConnection();
  }

  private initFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.localStore = {
          ...this.localStore,
          ...parsed,
          scenarios: parsed.scenarios && parsed.scenarios.length >= INITIAL_DATABASE_SCENARIOS.length ? parsed.scenarios : INITIAL_DATABASE_SCENARIOS,
          courses: parsed.courses && parsed.courses.length >= INITIAL_DATABASE_COURSES.length ? parsed.courses : INITIAL_DATABASE_COURSES,
          completedScenarios: parsed.completedScenarios || {}
        };
      } else {
        this.saveFileStore();
      }
    } catch (e) {
      console.warn('File store init note:', e);
    }
  }

  private saveFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localStore, null, 2));
    } catch (e) {
      console.warn('File store save note:', e);
    }
  }

  private async initPostgresConnection() {
    if (!DATABASE_URL || DATABASE_URL === 'null' || DATABASE_URL === 'undefined' || DATABASE_URL.includes('username:password')) {
      console.log('[DB] Using persistent file storage engine (DATABASE_URL not configured)');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000
      });

      const client = await this.pool.connect();
      this.isPostgresConnected = true;
      client.release();

      console.log('[DB] PostgreSQL Neon Database Connected Successfully!');

      // Run DDL migrations to ensure database tables and indexes exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          username VARCHAR(64) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name VARCHAR(128) NOT NULL,
          avatar_url TEXT,
          ui_language VARCHAR(16) DEFAULT 'en',
          theme VARCHAR(16) DEFAULT 'dark',
          subscription_status VARCHAR(32) DEFAULT 'TRIAL',
          email_verified BOOLEAN DEFAULT false,
          status VARCHAR(32) DEFAULT 'active',
          active_journey_id VARCHAR(64),
          onboarding_completed BOOLEAN DEFAULT false,
          last_login_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));
        CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

        CREATE TABLE IF NOT EXISTS learning_journeys (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          target_language_code VARCHAR(16) NOT NULL,
          support_language_code VARCHAR(16) NOT NULL,
          cefr_level VARCHAR(16) DEFAULT 'A1',
          goals TEXT,
          streak_days INT DEFAULT 0,
          total_minutes_spoken INT DEFAULT 0,
          points INT DEFAULT 0,
          active_scenario_id VARCHAR(64),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS vocabulary_items (
          id VARCHAR(64) PRIMARY KEY,
          journey_id VARCHAR(64) REFERENCES learning_journeys(id) ON DELETE CASCADE,
          word TEXT NOT NULL,
          translation TEXT NOT NULL,
          phonetic TEXT,
          example_sentence TEXT,
          exposure_count INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS mistakes (
          id VARCHAR(64) PRIMARY KEY,
          journey_id VARCHAR(64) REFERENCES learning_journeys(id) ON DELETE CASCADE,
          category TEXT NOT NULL,
          pattern TEXT NOT NULL,
          example_user_said TEXT NOT NULL,
          corrected_form TEXT NOT NULL,
          explanation TEXT NOT NULL,
          occurrence_count INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Safe column migrations for learner personalization
        ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_goal TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS motivation TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_areas TEXT[];
        ALTER TABLE users ADD COLUMN IF NOT EXISTS known_languages TEXT[];
        ALTER TABLE users ADD COLUMN IF NOT EXISTS support_language VARCHAR(16);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS previous_experience TEXT;
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS motivation TEXT;
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS focus_areas TEXT[];
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS known_languages TEXT[];
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS previous_experience TEXT;
      `);
    } catch (err) {
      console.warn('[DB] PostgreSQL connection note (falling back to file storage):', err);
      this.isPostgresConnected = false;
    }
  }

  // Diagnostic Endpoint Health
  async getHealthStatus() {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT 1 as connected;');
        if (res.rows.length > 0) {
          return { status: 'ok', database: 'connected', engine: 'postgresql' };
        }
      } catch (e) {
        return { status: 'degraded', database: 'reconnecting', engine: 'file_backed' };
      }
    }
    return { status: 'ok', database: 'connected', engine: 'file_backed' };
  }

  // --- USER ACCOUNTS ---
  async createUser(user: DatabaseUser): Promise<DatabaseUser> {
    const normalizedUsername = user.username.trim().toLowerCase();
    const normalizedEmail = user.email.trim().toLowerCase();

    const preparedUser: DatabaseUser = {
      ...user,
      username: normalizedUsername,
      email: normalizedEmail,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO users (id, username, email, password_hash, name, avatar_url, ui_language, theme, subscription_status, email_verified, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
          [
            preparedUser.id,
            preparedUser.username,
            preparedUser.email,
            preparedUser.passwordHash,
            preparedUser.name,
            preparedUser.avatarUrl || null,
            preparedUser.uiLanguage || 'en',
            preparedUser.theme || 'dark',
            preparedUser.subscriptionStatus || 'TRIAL',
            preparedUser.emailVerified || false,
            preparedUser.status || 'active'
          ]
        );
      } catch (err) {
        console.error('PostgreSQL createUser error:', err);
      }
    }

    // Always update file store for dual persistence
    const idx = this.localStore.users.findIndex(u => u.id === preparedUser.id || u.username === preparedUser.username || u.email === preparedUser.email);
    if (idx !== -1) {
      this.localStore.users[idx] = preparedUser;
    } else {
      this.localStore.users.push(preparedUser);
    }
    this.saveFileStore();

    return preparedUser;
  }

  async findUserByIdentifier(identifier: string): Promise<DatabaseUser | null> {
    const norm = identifier.trim().toLowerCase();

    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `SELECT id, username, email, password_hash as "passwordHash", name, avatar_url as "avatarUrl",
                  ui_language as "uiLanguage", theme, subscription_status as "subscriptionStatus",
                  email_verified as "emailVerified", status, active_journey_id as "activeJourneyId",
                  onboarding_completed as "onboardingCompleted", last_login_at as "lastLoginAt",
                  learning_goal as "learningGoal", motivation, focus_areas as "focusAreas",
                  known_languages as "knownLanguages", support_language as "supportLanguage",
                  previous_experience as "previousExperience",
                  created_at as "createdAt", updated_at as "updatedAt"
           FROM users
           WHERE LOWER(username) = $1 OR LOWER(email) = $1 LIMIT 1`,
          [norm]
        );
        if (res.rows.length > 0) {
          return res.rows[0] as DatabaseUser;
        }
      } catch (err) {
        console.warn('PostgreSQL findUserByIdentifier error:', err);
      }
    }

    const localUser = this.localStore.users.find(
      u => u.username.toLowerCase() === norm || u.email.toLowerCase() === norm
    );
    return localUser || null;
  }

  async findUserById(id: string): Promise<DatabaseUser | null> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `SELECT id, username, email, password_hash as "passwordHash", name, avatar_url as "avatarUrl",
                  ui_language as "uiLanguage", theme, subscription_status as "subscriptionStatus",
                  email_verified as "emailVerified", status, active_journey_id as "activeJourneyId",
                  onboarding_completed as "onboardingCompleted", last_login_at as "lastLoginAt",
                  learning_goal as "learningGoal", motivation, focus_areas as "focusAreas",
                  known_languages as "knownLanguages", support_language as "supportLanguage",
                  previous_experience as "previousExperience",
                  created_at as "createdAt", updated_at as "updatedAt"
           FROM users WHERE id = $1 LIMIT 1`,
          [id]
        );
        if (res.rows.length > 0) {
          return res.rows[0] as DatabaseUser;
        }
      } catch (err) {
        console.warn('PostgreSQL findUserById error:', err);
      }
    }

    return this.localStore.users.find(u => u.id === id) || null;
  }

  async updateLastLogin(id: string) {
    const now = new Date().toISOString();
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
      } catch (e) {}
    }
    const user = this.localStore.users.find(u => u.id === id);
    if (user) {
      user.lastLoginAt = now;
      this.saveFileStore();
    }
  }

  // --- JOURNEYS & PROGRESS ---
  async getJourneysForUser(userId: string): Promise<LearningJourney[]> {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", target_language_code as "targetLanguage",
                  support_language_code as "supportLanguage", cefr_level as "cefrLevel",
                  streak_days as "streakDays", total_minutes_spoken as "totalMinutesSpoken",
                  points, active_scenario_id as "activeScenarioId",
                  motivation, focus_areas as "focusAreas",
                  known_languages as "knownLanguages", previous_experience as "previousExperience",
                  created_at as "createdAt"
           FROM learning_journeys WHERE user_id = $1 ORDER BY updated_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            ...r,
            lastPracticeDate: new Date().toISOString()
          })) as LearningJourney[];
        }
      } catch (err) {
        console.warn('PostgreSQL getJourneysForUser error:', err);
      }
    }

    return this.localStore.journeys.filter(j => j.userId === userId);
  }

  async saveJourney(journey: LearningJourney): Promise<LearningJourney> {
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO learning_journeys (id, user_id, target_language_code, support_language_code, cefr_level, streak_days, total_minutes_spoken, points, active_scenario_id, motivation, focus_areas, known_languages, previous_experience, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
           ON CONFLICT (id) DO UPDATE SET
             target_language_code = EXCLUDED.target_language_code,
             support_language_code = EXCLUDED.support_language_code,
             cefr_level = EXCLUDED.cefr_level,
             streak_days = EXCLUDED.streak_days,
             total_minutes_spoken = EXCLUDED.total_minutes_spoken,
             points = EXCLUDED.points,
             active_scenario_id = EXCLUDED.active_scenario_id,
             motivation = EXCLUDED.motivation,
             focus_areas = EXCLUDED.focus_areas,
             known_languages = EXCLUDED.known_languages,
             previous_experience = EXCLUDED.previous_experience,
             updated_at = NOW()`,
          [
            journey.id,
            journey.userId,
            journey.targetLanguage,
            journey.supportLanguage,
            journey.cefrLevel,
            journey.streakDays,
            journey.totalMinutesSpoken,
            journey.points,
            journey.activeScenarioId || null,
            journey.motivation || null,
            journey.focusAreas || null,
            journey.knownLanguages || null,
            journey.previousExperience || null
          ]
        );
      } catch (err) {
        console.warn('PostgreSQL saveJourney error:', err);
      }
    }

    const idx = this.localStore.journeys.findIndex(j => j.id === journey.id);
    if (idx !== -1) {
      this.localStore.journeys[idx] = journey;
    } else {
      this.localStore.journeys.push(journey);
    }
    this.saveFileStore();

    return journey;
  }

  getScenarios(targetLang?: string, category?: string, cefrLevel?: string): Scenario[] {
    const all = this.localStore.scenarios && this.localStore.scenarios.length > 0
      ? this.localStore.scenarios
      : INITIAL_DATABASE_SCENARIOS;

    return all.filter(s => {
      if (targetLang && s.targetLanguage !== targetLang) {
        // Fallback matching if exact target language has fewer scenarios
        return true;
      }
      if (category && category !== 'all' && s.category !== category) return false;
      if (cefrLevel && cefrLevel !== 'all' && s.cefrLevel !== cefrLevel) return false;
      return true;
    });
  }

  getScenarioById(id: string): Scenario | undefined {
    const all = this.localStore.scenarios && this.localStore.scenarios.length > 0
      ? this.localStore.scenarios
      : INITIAL_DATABASE_SCENARIOS;
    return all.find(s => s.id === id);
  }

  getCourses(targetLang?: string, cefrLevel?: string): CourseUnit[] {
    const all = this.localStore.courses && this.localStore.courses.length > 0
      ? this.localStore.courses
      : INITIAL_DATABASE_COURSES;

    return all.filter(c => {
      if (targetLang && c.targetLanguage !== targetLang) return false;
      if (cefrLevel && cefrLevel !== 'all' && c.cefrLevel !== cefrLevel) return false;
      return true;
    });
  }

  getCourseById(id: string): CourseUnit | undefined {
    const all = this.localStore.courses && this.localStore.courses.length > 0
      ? this.localStore.courses
      : INITIAL_DATABASE_COURSES;
    return all.find(c => c.id === id);
  }

  getLessonById(lessonId: string): { lesson: Lesson; course: CourseUnit } | undefined {
    const courses = this.localStore.courses && this.localStore.courses.length > 0
      ? this.localStore.courses
      : INITIAL_DATABASE_COURSES;

    for (const course of courses) {
      const lesson = course.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return { lesson, course };
      }
    }
    return undefined;
  }

  /**
   * Resolves both the curriculum Lesson and Course for any active Scenario.
   * Guarantees that the AI tutor always knows both what the learner is learning
   * (curriculum context) and where/how they are practicing (scenario context).
   */
  getLessonAndCourseForScenario(
    scenarioId: string,
    preferredLessonId?: string,
    targetLanguage?: string,
    cefrLevel?: string
  ): { lesson: Lesson; course: CourseUnit } | undefined {
    const courses = this.localStore.courses && this.localStore.courses.length > 0
      ? this.localStore.courses
      : INITIAL_DATABASE_COURSES;
    const scenario = this.getScenarioById(scenarioId);

    // 1. Explicit preferredLessonId from learner's active flow
    if (preferredLessonId) {
      const match = this.getLessonById(preferredLessonId);
      if (match) return match;
    }

    // 2. Direct scenario.lessonId metadata
    if (scenario?.lessonId) {
      const match = this.getLessonById(scenario.lessonId);
      if (match) return match;
    }

    // 3. Search courses for a lesson with speakingScenarioId or practiceScenarioIds containing scenarioId
    for (const course of courses) {
      if (targetLanguage && course.targetLanguage !== targetLanguage) continue;
      for (const lesson of course.lessons) {
        if (lesson.speakingScenarioId === scenarioId || lesson.practiceScenarioIds?.includes(scenarioId)) {
          return { lesson, course };
        }
      }
    }

    // 4. Match by domain/category and CEFR level within target language
    const lang = targetLanguage || scenario?.targetLanguage || 'es';
    const level = cefrLevel || scenario?.cefrLevel || 'A1';

    const langCourses = courses.filter(c => c.targetLanguage === lang);
    const levelCourses = langCourses.filter(c => c.cefrLevel === level);
    const candidateCourses = levelCourses.length > 0 ? levelCourses : langCourses;

    if (scenario?.category) {
      for (const course of candidateCourses) {
        for (const lesson of course.lessons) {
          if (lesson.category === scenario.category) {
            return { lesson, course };
          }
        }
      }
    }

    // 5. Fallback to first available lesson of target language and level
    if (candidateCourses.length > 0 && candidateCourses[0].lessons.length > 0) {
      return { lesson: candidateCourses[0].lessons[0], course: candidateCourses[0] };
    }

    // 6. Global safe fallback
    if (courses.length > 0 && courses[0].lessons.length > 0) {
      return { lesson: courses[0].lessons[0], course: courses[0] };
    }

    return undefined;
  }

  getCompletedScenarioIds(userId: string): string[] {
    return this.localStore.completedScenarios[userId] || [];
  }

  async recordCompletedScenario(
    userId: string,
    journeyId: string,
    scenarioId: string,
    stats: {
      xpEarned: number;
      durationMinutes: number;
      durationSeconds?: number;
      errorCount?: number;
      lessonId?: string;
      courseId?: string;
    }
  ): Promise<{ journey: LearningJourney | undefined; nextRecommended: Scenario[]; sessionRecord?: any }> {
    // 1. Mark scenario as completed in user's completed history (Scenario progress)
    let completed = this.localStore.completedScenarios[userId];
    if (!completed) {
      completed = [];
      this.localStore.completedScenarios[userId] = completed;
    }
    if (!completed.includes(scenarioId)) {
      completed.push(scenarioId);
    }

    const durationMins = stats.durationMinutes || (stats.durationSeconds ? Math.max(1, Math.round(stats.durationSeconds / 60)) : 2);
    const errors = typeof stats.errorCount === 'number' ? stats.errorCount : 0;
    const earnedXp = Math.max(stats.xpEarned || 50, 10);

    // Resolve lesson context for traceability
    const resolvedContext = this.getLessonAndCourseForScenario(scenarioId, stats.lessonId);
    const lessonId = stats.lessonId || resolvedContext?.lesson.id;
    const courseId = stats.courseId || resolvedContext?.course.id;

    // 2. Update user journey points and minutes
    const journey = this.getJourney(journeyId);
    if (journey) {
      journey.points += earnedXp;
      journey.totalMinutesSpoken += durationMins;
      journey.streakDays = Math.max(journey.streakDays, 1);
      await this.saveJourney(journey);
    }

    // 3. Create Session Record with full educational metadata
    const sessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      journeyId,
      scenarioId,
      lessonId: lessonId || undefined,
      courseId: courseId || undefined,
      completedAt: new Date().toISOString(),
      durationSeconds: stats.durationSeconds || durationMins * 60,
      durationMinutes: durationMins,
      errorCount: errors,
      xpEarned: earnedXp
    };

    if (!this.localStore.sessions) {
      this.localStore.sessions = [];
    }
    this.localStore.sessions.push(sessionRecord);

    this.saveFileStore();

    // 4. Generate dynamic next scenario recommendations (Never force completed scenario!)
    const nextRecommended = this.getRecommendations(userId, journey?.targetLanguage, journey?.cefrLevel);

    return { journey, nextRecommended, sessionRecord };
  }

  getRecommendations(userId: string, targetLang?: string, cefrLevel?: string): Scenario[] {
    const completed = this.getCompletedScenarioIds(userId);
    const all = this.getScenarios(targetLang, undefined, cefrLevel);

    // Prioritize uncompleted scenarios matching user language and level
    const uncompleted = all.filter(s => !completed.includes(s.id));
    if (uncompleted.length >= 3) {
      return uncompleted.slice(0, 6);
    }

    // If all completed or fewer available, shuffle across other rich categories
    return all.slice(0, 6);
  }

  getJourney(id: string): LearningJourney | undefined {
    return this.localStore.journeys.find(j => j.id === id);
  }

  getUser(id: string): DatabaseUser | undefined {
    return this.localStore.users.find(u => u.id === id);
  }

  updateUser(id: string, updates: Partial<DatabaseUser>): DatabaseUser | undefined {
    const user = this.localStore.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date().toISOString() });
      this.saveFileStore();

      if (this.isPostgresConnected && this.pool) {
        const fields: string[] = [];
        const values: any[] = [];
        let i = 1;

        if (updates.name !== undefined) { fields.push(`name = $${i++}`); values.push(updates.name); }
        if (updates.theme !== undefined) { fields.push(`theme = $${i++}`); values.push(updates.theme); }
        if (updates.uiLanguage !== undefined) { fields.push(`ui_language = $${i++}`); values.push(updates.uiLanguage); }
        if (updates.learningGoal !== undefined) { fields.push(`learning_goal = $${i++}`); values.push(updates.learningGoal); }
        if (updates.motivation !== undefined) { fields.push(`motivation = $${i++}`); values.push(updates.motivation); }
        if (updates.focusAreas !== undefined) { fields.push(`focus_areas = $${i++}`); values.push(updates.focusAreas); }
        if (updates.knownLanguages !== undefined) { fields.push(`known_languages = $${i++}`); values.push(updates.knownLanguages); }
        if (updates.supportLanguage !== undefined) { fields.push(`support_language = $${i++}`); values.push(updates.supportLanguage); }
        if (updates.previousExperience !== undefined) { fields.push(`previous_experience = $${i++}`); values.push(updates.previousExperience); }
        if (updates.activeJourneyId !== undefined) { fields.push(`active_journey_id = $${i++}`); values.push(updates.activeJourneyId); }
        if (updates.onboardingCompleted !== undefined) { fields.push(`onboarding_completed = $${i++}`); values.push(updates.onboardingCompleted); }

        if (fields.length > 0) {
          values.push(id);
          this.pool.query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
            values
          ).catch((e) => console.warn('PostgreSQL updateUser sync note:', e));
        }
      }

      return user;
    }
    return undefined;
  }

  getVocabulary(journeyId: string): VocabularyItem[] {
    return this.localStore.vocabulary[journeyId] || [];
  }

  addVocabulary(journeyId: string, item: Omit<VocabularyItem, 'id' | 'journeyId'>): VocabularyItem {
    let list = this.localStore.vocabulary[journeyId];
    if (!list) {
      list = [];
      this.localStore.vocabulary[journeyId] = list;
    }
    const existing = list.find(v => v.word.toLowerCase() === item.word.toLowerCase());
    if (existing) {
      existing.exposureCount += 1;
      this.saveFileStore();
      return existing;
    }
    const newItem: VocabularyItem = {
      ...item,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newItem);
    this.saveFileStore();
    return newItem;
  }

  getMistakes(journeyId: string): MistakeRecord[] {
    return this.localStore.mistakes[journeyId] || [];
  }

  addMistake(journeyId: string, mistake: Omit<MistakeRecord, 'id' | 'journeyId'>): MistakeRecord {
    let list = this.localStore.mistakes[journeyId];
    if (!list) {
      list = [];
      this.localStore.mistakes[journeyId] = list;
    }
    const existing = list.find(m => m.pattern.toLowerCase() === mistake.pattern.toLowerCase());
    if (existing) {
      existing.occurrenceCount += 1;
      this.saveFileStore();
      return existing;
    }
    const newRecord: MistakeRecord = {
      ...mistake,
      id: `mstk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newRecord);
    this.saveFileStore();
    return newRecord;
  }

  getChatHistory(sessionId: string): ChatMessage[] {
    return this.localStore.chatHistories[sessionId] || [];
  }

  saveChatMessage(sessionId: string, message: ChatMessage): ChatMessage {
    let history = this.localStore.chatHistories[sessionId];
    if (!history) {
      history = [];
      this.localStore.chatHistories[sessionId] = history;
    }
    history.push(message);
    this.saveFileStore();
    return message;
  }
}

export const db = new PersistentDatabase();
