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

export function calculateStreakFromDates(dates: string[], todayStr?: string): {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  totalActiveDays: number;
} {
  const dateSet = new Set(dates);
  const now = new Date();
  const today = todayStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const completedToday = dateSet.has(today);

  const [y, m, d] = today.split('-').map(Number);
  const todayDate = new Date(y, m - 1, d);

  let streak = 0;
  let checkDate = new Date(todayDate);

  if (completedToday) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const cy = checkDate.getFullYear();
      const cm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const cd = String(checkDate.getDate()).padStart(2, '0');
      const dStr = `${cy}-${cm}-${cd}`;
      if (dateSet.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    // If not completed today, check if yesterday was completed
    checkDate.setDate(checkDate.getDate() - 1);
    const cy = checkDate.getFullYear();
    const cm = String(checkDate.getMonth() + 1).padStart(2, '0');
    const cd = String(checkDate.getDate()).padStart(2, '0');
    const yStr = `${cy}-${cm}-${cd}`;
    if (dateSet.has(yStr)) {
      streak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const ny = checkDate.getFullYear();
        const nm = String(checkDate.getMonth() + 1).padStart(2, '0');
        const nd = String(checkDate.getDate()).padStart(2, '0');
        const dStr = `${ny}-${nm}-${nd}`;
        if (dateSet.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      streak = 0;
    }
  }

  // Calculate longest streak from all historical dates
  let longestStreak = streak;
  if (dates.length > 0) {
    const sorted = Array.from(dateSet).sort();
    let currentRun = 1;
    let maxRun = 1;
    for (let i = 1; i < sorted.length; i++) {
      const [y1, m1, d1] = sorted[i - 1].split('-').map(Number);
      const [y2, m2, d2] = sorted[i].split('-').map(Number);
      const prevD = new Date(y1, m1 - 1, d1);
      const currD = new Date(y2, m2 - 1, d2);
      const diffDays = Math.round((currD.getTime() - prevD.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun++;
        if (currentRun > maxRun) maxRun = currentRun;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    }
    longestStreak = Math.max(maxRun, streak);
  }

  return {
    currentStreak: streak,
    longestStreak,
    completedToday,
    totalActiveDays: dateSet.size
  };
}

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
    activityDates: Record<string, string[]>;
  } = {
    users: [],
    journeys: [],
    scenarios: INITIAL_DATABASE_SCENARIOS,
    courses: INITIAL_DATABASE_COURSES,
    completedScenarios: {},
    vocabulary: {},
    mistakes: {},
    chatHistories: {},
    sessions: [],
    activityDates: {}
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

        // Merge latest hardcoded library scenarios so new languages are guaranteed
        const mergedScenarios = [...INITIAL_DATABASE_SCENARIOS];
        if (Array.isArray(parsed.scenarios)) {
          for (const s of parsed.scenarios) {
            if (!mergedScenarios.some(m => m.id === s.id)) {
              mergedScenarios.push(s);
            }
          }
        }

        const mergedCourses = [...INITIAL_DATABASE_COURSES];
        if (Array.isArray(parsed.courses)) {
          for (const c of parsed.courses) {
            if (!mergedCourses.some(m => m.id === c.id)) {
              mergedCourses.push(c);
            }
          }
        }

        this.localStore = {
          ...this.localStore,
          ...parsed,
          scenarios: mergedScenarios,
          courses: mergedCourses,
          completedScenarios: parsed.completedScenarios || {},
          activityDates: parsed.activityDates || {}
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

        -- Safe column migrations for learner personalization & multi-journey tracking
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
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0;
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS last_activity_date VARCHAR(16);
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS active_lesson_id VARCHAR(64);

        CREATE TABLE IF NOT EXISTS user_activity_events (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          journey_id VARCHAR(64),
          activity_type VARCHAR(32) NOT NULL,
          local_date VARCHAR(16) NOT NULL,
          xp_earned INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
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
                  streak_days as "streakDays", longest_streak as "longestStreak",
                  total_minutes_spoken as "totalMinutesSpoken", points,
                  active_scenario_id as "activeScenarioId", active_lesson_id as "activeLessonId",
                  is_archived as "isArchived", last_activity_date as "lastActivityDate",
                  motivation, focus_areas as "focusAreas",
                  known_languages as "knownLanguages", previous_experience as "previousExperience",
                  created_at as "createdAt", updated_at as "updatedAt"
           FROM learning_journeys WHERE user_id = $1 AND (is_archived IS FALSE OR is_archived IS NULL) ORDER BY updated_at DESC`,
          [userId]
        );
        if (res.rows.length > 0) {
          return res.rows.map(r => ({
            ...r,
            streakDays: Number(r.streakDays) || 0,
            longestStreak: Number(r.longestStreak) || Number(r.streakDays) || 0,
            totalMinutesSpoken: Number(r.totalMinutesSpoken) || 0,
            points: Number(r.points) || 0,
            isArchived: Boolean(r.isArchived)
          })) as LearningJourney[];
        }
      } catch (err) {
        console.warn('PostgreSQL getJourneysForUser error:', err);
      }
    }

    return this.localStore.journeys
      .filter(j => j.userId === userId && !j.isArchived)
      .map(j => ({
        ...j,
        streakDays: Number(j.streakDays) || 0,
        longestStreak: Number(j.longestStreak) || Number(j.streakDays) || 0,
        totalMinutesSpoken: Number(j.totalMinutesSpoken) || 0,
        points: Number(j.points) || 0,
        isArchived: Boolean(j.isArchived)
      }));
  }

  async saveJourney(journey: LearningJourney): Promise<LearningJourney> {
    const preparedJourney: LearningJourney = {
      ...journey,
      streakDays: Number(journey.streakDays) || 0,
      longestStreak: Math.max(Number(journey.longestStreak) || 0, Number(journey.streakDays) || 0),
      totalMinutesSpoken: Number(journey.totalMinutesSpoken) || 0,
      points: Number(journey.points) || 0,
      isArchived: Boolean(journey.isArchived),
      updatedAt: new Date().toISOString()
    };

    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO learning_journeys (
             id, user_id, target_language_code, support_language_code, cefr_level,
             streak_days, longest_streak, total_minutes_spoken, points,
             active_scenario_id, active_lesson_id, is_archived, last_activity_date,
             motivation, focus_areas, known_languages, previous_experience, updated_at
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
           ON CONFLICT (id) DO UPDATE SET
             target_language_code = EXCLUDED.target_language_code,
             support_language_code = EXCLUDED.support_language_code,
             cefr_level = EXCLUDED.cefr_level,
             streak_days = EXCLUDED.streak_days,
             longest_streak = EXCLUDED.longest_streak,
             total_minutes_spoken = EXCLUDED.total_minutes_spoken,
             points = EXCLUDED.points,
             active_scenario_id = EXCLUDED.active_scenario_id,
             active_lesson_id = EXCLUDED.active_lesson_id,
             is_archived = EXCLUDED.is_archived,
             last_activity_date = EXCLUDED.last_activity_date,
             motivation = EXCLUDED.motivation,
             focus_areas = EXCLUDED.focus_areas,
             known_languages = EXCLUDED.known_languages,
             previous_experience = EXCLUDED.previous_experience,
             updated_at = NOW()`,
          [
            preparedJourney.id,
            preparedJourney.userId,
            preparedJourney.targetLanguage,
            preparedJourney.supportLanguage,
            preparedJourney.cefrLevel,
            preparedJourney.streakDays,
            preparedJourney.longestStreak,
            preparedJourney.totalMinutesSpoken,
            preparedJourney.points,
            preparedJourney.activeScenarioId || null,
            preparedJourney.activeLessonId || null,
            preparedJourney.isArchived || false,
            preparedJourney.lastActivityDate || null,
            preparedJourney.motivation || null,
            preparedJourney.focusAreas || null,
            preparedJourney.knownLanguages || null,
            preparedJourney.previousExperience || null
          ]
        );
      } catch (err) {
        console.warn('PostgreSQL saveJourney error:', err);
      }
    }

    const idx = this.localStore.journeys.findIndex(j => j.id === preparedJourney.id);
    if (idx !== -1) {
      this.localStore.journeys[idx] = preparedJourney;
    } else {
      this.localStore.journeys.push(preparedJourney);
    }
    this.saveFileStore();

    return preparedJourney;
  }

  getScenarios(targetLang?: string, category?: string, cefrLevel?: string): Scenario[] {
    const all = this.localStore.scenarios && this.localStore.scenarios.length > 0
      ? this.localStore.scenarios
      : INITIAL_DATABASE_SCENARIOS;

    return all.filter(s => {
      // STRICT targetLanguage filtering: never leak scenarios of other languages!
      if (targetLang && s.targetLanguage !== targetLang) {
        return false;
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

  getCompletedScenarioIds(userId: string, journeyId?: string): string[] {
    if (journeyId) {
      return [...(this.localStore.completedScenarios[journeyId] || [])];
    }
    const list: string[] = [];
    if (this.localStore.completedScenarios[userId]) {
      for (const s of this.localStore.completedScenarios[userId]) {
        if (!list.includes(s)) list.push(s);
      }
    }
    return list;
  }

  getUserActivityDates(userId: string): string[] {
    return this.localStore.activityDates[userId] || [];
  }

  async recordUserActivity(
    userId: string,
    journeyId?: string,
    activityType: string = 'practice',
    localDate?: string,
    xpEarned: number = 0
  ): Promise<{ streak: number; longestStreak: number; completedToday: boolean }> {
    const now = new Date();
    const today = localDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let dates = this.localStore.activityDates[userId];
    if (!dates) {
      dates = [];
      this.localStore.activityDates[userId] = dates;
    }

    if (!dates.includes(today)) {
      dates.push(today);
      dates.sort();
    }

    const streakData = calculateStreakFromDates(dates, today);

    // Save event in PostgreSQL if connected
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO user_activity_events (id, user_id, journey_id, activity_type, local_date, xp_earned, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            userId,
            journeyId || null,
            activityType,
            today,
            xpEarned
          ]
        );
      } catch (e) {}
    }

    // Update active journey streak fields
    if (journeyId) {
      const journey = this.getJourney(journeyId);
      if (journey) {
        journey.streakDays = streakData.currentStreak;
        journey.longestStreak = Math.max(journey.longestStreak || 0, streakData.longestStreak);
        journey.lastActivityDate = today;
        await this.saveJourney(journey);
      }
    }

    this.saveFileStore();
    return {
      streak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      completedToday: streakData.completedToday
    };
  }

  async recordCompletedScenario(
    userId: string,
    journeyId: string,
    scenarioId: string,
    stats: {
      xpEarned?: number;
      durationMinutes?: number;
      durationSeconds?: number;
      errorCount?: number;
      lessonId?: string;
      courseId?: string;
      sessionToken?: string;
    },
    localDate?: string
  ): Promise<{ journey: LearningJourney | undefined; nextRecommended: Scenario[]; sessionRecord?: any }> {
    const now = new Date();
    const today = localDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 1. Check if scenario was already completed for this journey
    let journeyCompleted = this.localStore.completedScenarios[journeyId];
    if (!journeyCompleted) {
      journeyCompleted = [];
      this.localStore.completedScenarios[journeyId] = journeyCompleted;
    }

    let userCompleted = this.localStore.completedScenarios[userId];
    if (!userCompleted) {
      userCompleted = [];
      this.localStore.completedScenarios[userId] = userCompleted;
    }

    const isFirstTimeCompletion = !journeyCompleted.includes(scenarioId);
    if (isFirstTimeCompletion) {
      journeyCompleted.push(scenarioId);
    }
    if (!userCompleted.includes(scenarioId)) {
      userCompleted.push(scenarioId);
    }

    // Idempotent XP calculation:
    // First time completion: full 50 XP (or provided xpEarned)
    // Repeat replay of completed content: review reward 10 XP
    const earnedXp = isFirstTimeCompletion ? Math.max(stats.xpEarned || 50, 20) : 10;
    const durationMins = stats.durationMinutes || (stats.durationSeconds ? Math.max(1, Math.round(stats.durationSeconds / 60)) : 2);
    const errors = typeof stats.errorCount === 'number' ? stats.errorCount : 0;

    // 2. Record qualifying activity date for streak
    await this.recordUserActivity(userId, journeyId, 'scenario_completion', today, earnedXp);

    // 3. Update journey points and spoken minutes
    const journey = this.getJourney(journeyId);
    if (journey) {
      journey.points = (journey.points || 0) + earnedXp;
      journey.totalMinutesSpoken = (journey.totalMinutesSpoken || 0) + durationMins;
      await this.saveJourney(journey);
    }

    // 4. Create Session Record
    const resolvedContext = this.getLessonAndCourseForScenario(scenarioId, stats.lessonId);
    const lessonId = stats.lessonId || resolvedContext?.lesson.id;
    const courseId = stats.courseId || resolvedContext?.course.id;

    const sessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      journeyId,
      scenarioId,
      lessonId: lessonId || undefined,
      courseId: courseId || undefined,
      completedAt: new Date().toISOString(),
      localDate: today,
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

    // 5. Generate dynamic recommendations prioritizing uncompleted scenarios
    const nextRecommended = this.getRecommendations(userId, journey?.targetLanguage, journey?.cefrLevel, journeyId, journey?.goals || journey?.motivation);

    return { journey, nextRecommended, sessionRecord };
  }

  async recordVoiceDuration(
    userId: string,
    journeyId: string,
    durationSeconds: number,
    durationMinutes: number,
    localDate?: string
  ): Promise<{ success: boolean; journey?: LearningJourney; totalMinutesSpoken: number; sessionRecord?: any }> {
    if (durationSeconds < 3) {
      return { success: false, totalMinutesSpoken: 0 };
    }

    const now = new Date();
    const today = localDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const minsToAdd = durationMinutes > 0 ? durationMinutes : Math.max(1, Math.round(durationSeconds / 60));

    const journey = this.getJourney(journeyId);
    if (!journey) {
      return { success: false, totalMinutesSpoken: 0 };
    }

    journey.totalMinutesSpoken = (journey.totalMinutesSpoken || 0) + minsToAdd;

    // If active speaking lasted >= 30 seconds, it counts as meaningful qualifying activity for streak!
    if (durationSeconds >= 30) {
      await this.recordUserActivity(userId, journeyId, 'voice_practice', today, 15);
      journey.points = (journey.points || 0) + 15;
    }

    await this.saveJourney(journey);

    const sessionRecord = {
      id: `sess_voice_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId,
      journeyId,
      activityType: 'voice_session',
      completedAt: new Date().toISOString(),
      localDate: today,
      durationSeconds,
      durationMinutes: minsToAdd,
      xpEarned: durationSeconds >= 30 ? 15 : 0
    };

    if (!this.localStore.sessions) {
      this.localStore.sessions = [];
    }
    this.localStore.sessions.push(sessionRecord);
    this.saveFileStore();

    return {
      success: true,
      journey,
      totalMinutesSpoken: journey.totalMinutesSpoken,
      sessionRecord
    };
  }

  getRecommendations(
    userId: string,
    targetLang?: string,
    cefrLevel?: string,
    journeyId?: string,
    learningGoal?: string
  ): Scenario[] {
    const completed = this.getCompletedScenarioIds(userId, journeyId);
    const all = this.getScenarios(targetLang, undefined, cefrLevel);

    if (all.length === 0) {
      return [];
    }

    // Score and rank scenarios:
    // 1. Uncompleted scenarios are prioritized over completed ones.
    // 2. Foundational categories ('social', 'daily') and titles with 'Greeting' / 'Introduction' get highest rank for beginners.
    // 3. Learning goal matching (e.g. Travel, Work) gets a boost, but does not displace greetings.
    // 4. Completed scenarios are kept at the end for review/replay.
    const scored = all.map(scenario => {
      let score = 100;
      const isCompleted = completed.includes(scenario.id);
      if (isCompleted) {
        score -= 200; // Deprioritize completed scenarios
      }

      const titleLower = scenario.title.toLowerCase();
      if (titleLower.includes('greeting') || titleLower.includes('introduction') || titleLower.includes('first meeting')) {
        score += 80;
      } else if (titleLower.includes('café') || titleLower.includes('cafe') || titleLower.includes('coffee') || titleLower.includes('order')) {
        score += 50;
      } else if (titleLower.includes('direction') || titleLower.includes('city')) {
        score += 40;
      }

      if (learningGoal) {
        const goalLower = learningGoal.toLowerCase();
        if (goalLower.includes('travel') && scenario.category === 'travel') {
          score += 30;
        } else if (goalLower.includes('work') && scenario.category === 'work') {
          score += 30;
        } else if (goalLower.includes('conversation') && scenario.category === 'social') {
          score += 30;
        }
      }

      return { scenario, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 8).map(s => s.scenario);
  }

  async switchActiveJourney(userId: string, journeyId: string): Promise<{ user: DatabaseUser | undefined; journey: LearningJourney | undefined }> {
    const journey = this.getJourney(journeyId);
    if (!journey || journey.userId !== userId) {
      return { user: undefined, journey: undefined };
    }

    const updatedUser = this.updateUser(userId, { activeJourneyId: journeyId });
    return { user: updatedUser, journey };
  }

  async archiveJourney(userId: string, journeyId: string): Promise<{ success: boolean; nextActiveJourney?: LearningJourney }> {
    const journey = this.getJourney(journeyId);
    if (!journey || journey.userId !== userId) {
      return { success: false };
    }

    journey.isArchived = true;
    await this.saveJourney(journey);

    // If this was the user's active journey, switch to another non-archived journey
    const user = this.getUser(userId);
    let nextJourney: LearningJourney | undefined;
    if (user && user.activeJourneyId === journeyId) {
      const otherJourneys = this.localStore.journeys.filter(j => j.userId === userId && j.id !== journeyId && !j.isArchived);
      if (otherJourneys.length > 0) {
        nextJourney = otherJourneys[0];
        this.updateUser(userId, { activeJourneyId: nextJourney.id });
      }
    }

    return { success: true, nextActiveJourney: nextJourney };
  }

  getJourneyStats(userId: string, journeyId?: string, localDate?: string) {
    const now = new Date();
    const today = localDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const dates = this.getUserActivityDates(userId);
    const streakInfo = calculateStreakFromDates(dates, today);

    const userJourneys = this.localStore.journeys.filter(j => j.userId === userId && !j.isArchived);
    const activeJourney = journeyId ? this.getJourney(journeyId) : userJourneys[0];

    const totalUserPoints = userJourneys.reduce((sum, j) => sum + (j.points || 0), 0);
    const totalUserMinutes = userJourneys.reduce((sum, j) => sum + (j.totalMinutesSpoken || 0), 0);

    // Calculate actual spoken minutes for current week from sessions
    const userSessions = (this.localStore.sessions || []).filter(s => s.userId === userId);
    
    // Past 7 days breakdown
    const dayBreakdown: Array<{ date: string; day: string; minutes: number; xp: number }> = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [y, m, d] = today.split('-').map(Number);
    const baseDate = new Date(y, m - 1, d);

    let weeklyMinutes = 0;
    const weeklyActiveDaySet = new Set<string>();

    for (let offset = 6; offset >= 0; offset--) {
      const dt = new Date(baseDate);
      dt.setDate(baseDate.getDate() - offset);
      const curStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const dayName = offset === 0 ? 'Today' : dayNames[dt.getDay()];

      const daySessions = userSessions.filter(s => {
        const sDate = s.localDate || (s.completedAt ? s.completedAt.slice(0, 10) : '');
        return sDate === curStr && (!journeyId || s.journeyId === journeyId);
      });

      const dayMins = daySessions.reduce((acc, s) => acc + (s.durationMinutes || Math.round((s.durationSeconds || 0) / 60) || 0), 0);
      const dayXp = daySessions.reduce((acc, s) => acc + (s.xpEarned || 0), 0);

      if (dayMins > 0 || dayXp > 0 || dates.includes(curStr)) {
        weeklyActiveDaySet.add(curStr);
      }
      weeklyMinutes += dayMins;

      dayBreakdown.push({
        date: curStr,
        day: dayName,
        minutes: dayMins,
        xp: dayXp
      });
    }

    return {
      journeyPoints: activeJourney?.points || 0,
      totalUserPoints,
      journeyMinutesSpoken: activeJourney?.totalMinutesSpoken || 0,
      totalUserMinutes,
      streakDays: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      completedToday: streakInfo.completedToday,
      totalActiveDays: streakInfo.totalActiveDays,
      weeklyMinutesSpoken: Math.max(weeklyMinutes, activeJourney?.totalMinutesSpoken ? Math.min(activeJourney.totalMinutesSpoken, 30) : 0),
      weeklyActiveDays: weeklyActiveDaySet.size,
      dayBreakdown,
      completedScenarioIds: this.getCompletedScenarioIds(userId, activeJourney?.id)
    };
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
