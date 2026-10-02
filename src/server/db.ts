import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { User, LearningJourney, VocabularyItem, MistakeRecord, ChatMessage, Language, Scenario } from '../types';

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
  emailVerified: boolean;
  status: string;
  activeJourneyId?: string;
  onboardingCompleted?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

import { SUPPORTED_LANGUAGES } from '../constants/languages';
export { SUPPORTED_LANGUAGES };

export const STARTER_SCENARIOS: Scenario[] = [
  {
    id: 'scen_a1_intro_maya',
    title: 'Introduce Yourself & Make a Friend',
    description: 'Break the ice in a friendly setting, share your name, where you are from, and your favorite hobbies.',
    category: 'social',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Community Botanical Garden Cafe',
    characterName: 'Maya',
    characterRole: 'Friendly Local Designer',
    avatar: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['name', 'from', 'hobby', 'pleasure', 'nice to meet you'],
    initialGreeting: 'Hi there! Mind if I sit here? I\'m Maya. What\'s your name and where are you from?',
    objectives: [
      { id: 'obj_intro_1', text: 'Share your name and country or city of origin', completed: false, hint: 'Say: Hi Maya, my name is... and I am from...' },
      { id: 'obj_intro_2', text: 'Tell her what you like doing in your free time', completed: false, hint: 'Say: In my free time, I like...' },
      { id: 'obj_intro_3', text: 'Ask Maya a polite question back', completed: false, hint: 'Say: What about you? Do you live nearby?' }
    ]
  },
  {
    id: 'scen_cafe_paris',
    title: 'Bistro in Paris',
    description: 'Order breakfast at a quaint Parisian café and practice polite French requests.',
    category: 'dining',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Le Petit Café, Saint-Germain-des-Prés',
    characterName: 'Jean-Luc',
    characterRole: 'Bistro Server',
    avatar: '🥐',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['croissant', 'café au lait', 'l\'addition', 's\'il vous plaît', 'merci'],
    initialGreeting: 'Bonjour ! Bienvenue au Petit Café. Vous désirez une table en terrasse ou à l\'intérieur ?',
    objectives: [
      { id: 'obj_fr_1', text: 'Greet the waiter politely and state your seating preference', completed: false, hint: 'Say: Bonjour! Je voudrais une table en terrasse, s\'il vous plaît.' },
      { id: 'obj_fr_2', text: 'Order a croissant and a coffee', completed: false, hint: 'Say: Je voudrais un croissant et un café au lait, s\'il vous plaît.' },
      { id: 'obj_fr_3', text: 'Ask for the check at the end of breakfast', completed: false, hint: 'Say: L\'addition, s\'il vous plaît.' }
    ]
  },
  {
    id: 'scen_hotel_madrid',
    title: 'Hotel Check-In Madrid',
    description: 'Check into your boutique hotel room, ask about breakfast hours and WiFi details in Spanish.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Hotel Gran Vía, Madrid',
    characterName: 'Sofia',
    characterRole: 'Hotel Receptionist',
    avatar: '🏨',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['reserva', 'habitación', 'desayuno', 'clave de wifi', 'piso'],
    initialGreeting: '¡Buenas tardes! Bienvenido al Hotel Gran Vía. ¿Tiene una reserva con nosotros?',
    objectives: [
      { id: 'obj_es_1', text: 'Confirm reservation under your name', completed: false, hint: 'Say: Tengo una reserva a nombre de...' },
      { id: 'obj_es_2', text: 'Ask for the WiFi password and breakfast time', completed: false, hint: 'Say: ¿Cuál es la contraseña del WiFi y a qué hora es el desayuno?' },
      { id: 'obj_es_3', text: 'Inquire about keycard or room floor', completed: false, hint: 'Say: ¿En qué piso está la habitación?' }
    ]
  }
];

class PersistentDatabase {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;
  private localStore: {
    users: DatabaseUser[];
    journeys: LearningJourney[];
    vocabulary: Record<string, VocabularyItem[]>;
    mistakes: Record<string, MistakeRecord[]>;
    chatHistories: Record<string, ChatMessage[]>;
  } = {
    users: [],
    journeys: [],
    vocabulary: {},
    mistakes: {},
    chatHistories: {}
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
        this.localStore = { ...this.localStore, ...JSON.parse(raw) };
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
                  points, active_scenario_id as "activeScenarioId", created_at as "createdAt"
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
          `INSERT INTO learning_journeys (id, user_id, target_language_code, support_language_code, cefr_level, streak_days, total_minutes_spoken, points, active_scenario_id, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
           ON CONFLICT (id) DO UPDATE SET
             target_language_code = EXCLUDED.target_language_code,
             support_language_code = EXCLUDED.support_language_code,
             cefr_level = EXCLUDED.cefr_level,
             streak_days = EXCLUDED.streak_days,
             total_minutes_spoken = EXCLUDED.total_minutes_spoken,
             points = EXCLUDED.points,
             active_scenario_id = EXCLUDED.active_scenario_id,
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
            journey.activeScenarioId || null
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

  getScenarios(targetLang?: string): Scenario[] {
    if (!targetLang) return STARTER_SCENARIOS;
    const directMatches = STARTER_SCENARIOS.filter(s => s.targetLanguage === targetLang);
    if (directMatches.length > 0) return directMatches;
    return STARTER_SCENARIOS;
  }

  getJourney(id: string): LearningJourney | undefined {
    return this.localStore.journeys.find(j => j.id === id);
  }

  getScenarioById(id: string): Scenario | undefined {
    return STARTER_SCENARIOS.find(s => s.id === id);
  }

  getUser(id: string): DatabaseUser | undefined {
    return this.localStore.users.find(u => u.id === id);
  }

  updateUser(id: string, updates: Partial<DatabaseUser>): DatabaseUser | undefined {
    const user = this.localStore.users.find(u => u.id === id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date().toISOString() });
      this.saveFileStore();
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
