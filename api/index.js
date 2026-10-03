// src/server/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// src/server/routes.ts
import { Router } from "express";
import rateLimit from "express-rate-limit";

// src/server/db.ts
import pg from "pg";
import fs from "fs";
import path from "path";

// src/constants/languages.ts
var SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "\u{1F1EC}\u{1F1E7}" },
  { code: "fr", name: "French", nativeName: "Fran\xE7ais", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "es", name: "Spanish", nativeName: "Espa\xF1ol", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "ru", name: "Russian", nativeName: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "ar", name: "Arabic", nativeName: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\u{1F1F8}\u{1F1E6}", rtl: true },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "tr", name: "Turkish", nativeName: "T\xFCrk\xE7e", flag: "\u{1F1F9}\u{1F1F7}" },
  { code: "pt", name: "Portuguese", nativeName: "Portugu\xEAs", flag: "\u{1F1F5}\u{1F1F9}" }
];

// src/server/db.ts
var { Pool } = pg;
var DATABASE_URL = process.env.DATABASE_URL;
var DATA_DIR = path.join(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "yoe_store.json");
var STARTER_SCENARIOS = [
  {
    id: "scen_a1_intro_maya",
    title: "Introduce Yourself & Make a Friend",
    description: "Break the ice in a friendly setting, share your name, where you are from, and your favorite hobbies.",
    category: "social",
    targetLanguage: "en",
    cefrLevel: "A1",
    location: "Community Botanical Garden Cafe",
    characterName: "Yoe",
    characterRole: "Friendly Local",
    avatar: "\u{1F91D}",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["name", "from", "hobby", "pleasure", "nice to meet you"],
    initialGreeting: "Hi there! Mind if I sit here? I'm Yoe. What's your name and where are you from?",
    initialGreetingTranslation: "Hi there! Mind if I sit here? I'm Yoe. What's your name and where are you from?",
    objectives: [
      { id: "obj_intro_1", text: "Share your name and country or city of origin", completed: false, hint: "Say: Hi Yoe, my name is... and I am from..." },
      { id: "obj_intro_2", text: "Tell Yoe what you like doing in your free time", completed: false, hint: "Say: In my free time, I like..." },
      { id: "obj_intro_3", text: "Ask Yoe a polite question back", completed: false, hint: "Say: What about you, Yoe? Do you live nearby?" }
    ]
  },
  {
    id: "scen_cafe_paris",
    title: "Bistro in Paris",
    description: "Order breakfast at a quaint Parisian caf\xE9 and practice polite French requests.",
    category: "dining",
    targetLanguage: "fr",
    cefrLevel: "A1",
    location: "Le Petit Caf\xE9, Saint-Germain-des-Pr\xE9s",
    characterName: "Yoe",
    characterRole: "Bistro Server",
    avatar: "\u{1F950}",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["croissant", "caf\xE9 au lait", "l'addition", "s'il vous pla\xEEt", "merci"],
    initialGreeting: "Bonjour ! Je suis Yoe. Bienvenue au Petit Caf\xE9. Vous d\xE9sirez une table en terrasse ou \xE0 l'int\xE9rieur ?",
    initialGreetingTranslation: "Hello! I am Yoe. Welcome to Le Petit Caf\xE9. Would you prefer a table on the terrace or inside?",
    objectives: [
      { id: "obj_fr_1", text: "Greet Yoe politely and state your seating preference", completed: false, hint: "Say: Bonjour Yoe! Je voudrais une table en terrasse, s'il vous pla\xEEt." },
      { id: "obj_fr_2", text: "Order a croissant and a coffee", completed: false, hint: "Say: Je voudrais un croissant et un caf\xE9 au lait, s'il vous pla\xEEt." },
      { id: "obj_fr_3", text: "Ask for the check at the end of breakfast", completed: false, hint: "Say: L'addition, s'il vous pla\xEEt." }
    ]
  },
  {
    id: "scen_hotel_madrid",
    title: "Hotel Check-In Madrid",
    description: "Check into your boutique hotel room, ask about breakfast hours and WiFi details in Spanish.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Hotel Gran V\xEDa, Madrid",
    characterName: "Yoe",
    characterRole: "Hotel Receptionist",
    avatar: "\u{1F3E8}",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["reserva", "habitaci\xF3n", "desayuno", "clave de wifi", "piso"],
    initialGreeting: "\xA1Buenas tardes! Soy Yoe. Bienvenido al Hotel Gran V\xEDa. \xBFTiene una reserva con nosotros?",
    initialGreetingTranslation: "Good afternoon! I am Yoe. Welcome to Hotel Gran V\xEDa. Do you have a reservation with us?",
    objectives: [
      { id: "obj_es_1", text: "Confirm reservation under your name", completed: false, hint: "Say: Hola Yoe, tengo una reserva a nombre de..." },
      { id: "obj_es_2", text: "Ask for the WiFi password and breakfast time", completed: false, hint: "Say: \xBFCu\xE1l es la contrase\xF1a del WiFi y a qu\xE9 hora es el desayuno?" },
      { id: "obj_es_3", text: "Inquire about keycard or room floor", completed: false, hint: "Say: \xBFEn qu\xE9 piso est\xE1 la habitaci\xF3n?" }
    ]
  }
];
var PersistentDatabase = class {
  constructor() {
    this.pool = null;
    this.isPostgresConnected = false;
    this.localStore = {
      users: [],
      journeys: [],
      vocabulary: {},
      mistakes: {},
      chatHistories: {}
    };
    this.initFileStore();
    this.initPostgresConnection();
  }
  initFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf8");
        this.localStore = { ...this.localStore, ...JSON.parse(raw) };
      } else {
        this.saveFileStore();
      }
    } catch (e) {
      console.warn("File store init note:", e);
    }
  }
  saveFileStore() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localStore, null, 2));
    } catch (e) {
      console.warn("File store save note:", e);
    }
  }
  async initPostgresConnection() {
    if (!DATABASE_URL || DATABASE_URL === "null" || DATABASE_URL === "undefined" || DATABASE_URL.includes("username:password")) {
      console.log("[DB] Using persistent file storage engine (DATABASE_URL not configured)");
      return;
    }
    try {
      this.pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 3e4,
        connectionTimeoutMillis: 5e3
      });
      const client = await this.pool.connect();
      this.isPostgresConnected = true;
      client.release();
      console.log("[DB] PostgreSQL Neon Database Connected Successfully!");
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
      console.warn("[DB] PostgreSQL connection note (falling back to file storage):", err);
      this.isPostgresConnected = false;
    }
  }
  // Diagnostic Endpoint Health
  async getHealthStatus() {
    if (this.isPostgresConnected && this.pool) {
      try {
        const res = await this.pool.query("SELECT 1 as connected;");
        if (res.rows.length > 0) {
          return { status: "ok", database: "connected", engine: "postgresql" };
        }
      } catch (e) {
        return { status: "degraded", database: "reconnecting", engine: "file_backed" };
      }
    }
    return { status: "ok", database: "connected", engine: "file_backed" };
  }
  // --- USER ACCOUNTS ---
  async createUser(user) {
    const normalizedUsername = user.username.trim().toLowerCase();
    const normalizedEmail = user.email.trim().toLowerCase();
    const preparedUser = {
      ...user,
      username: normalizedUsername,
      email: normalizedEmail,
      createdAt: user.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
            preparedUser.uiLanguage || "en",
            preparedUser.theme || "dark",
            preparedUser.subscriptionStatus || "TRIAL",
            preparedUser.emailVerified || false,
            preparedUser.status || "active"
          ]
        );
      } catch (err) {
        console.error("PostgreSQL createUser error:", err);
      }
    }
    const idx = this.localStore.users.findIndex((u) => u.id === preparedUser.id || u.username === preparedUser.username || u.email === preparedUser.email);
    if (idx !== -1) {
      this.localStore.users[idx] = preparedUser;
    } else {
      this.localStore.users.push(preparedUser);
    }
    this.saveFileStore();
    return preparedUser;
  }
  async findUserByIdentifier(identifier) {
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
          return res.rows[0];
        }
      } catch (err) {
        console.warn("PostgreSQL findUserByIdentifier error:", err);
      }
    }
    const localUser = this.localStore.users.find(
      (u) => u.username.toLowerCase() === norm || u.email.toLowerCase() === norm
    );
    return localUser || null;
  }
  async findUserById(id) {
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
          return res.rows[0];
        }
      } catch (err) {
        console.warn("PostgreSQL findUserById error:", err);
      }
    }
    return this.localStore.users.find((u) => u.id === id) || null;
  }
  async updateLastLogin(id) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (this.isPostgresConnected && this.pool) {
      try {
        await this.pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
      } catch (e) {
      }
    }
    const user = this.localStore.users.find((u) => u.id === id);
    if (user) {
      user.lastLoginAt = now;
      this.saveFileStore();
    }
  }
  // --- JOURNEYS & PROGRESS ---
  async getJourneysForUser(userId) {
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
          return res.rows.map((r) => ({
            ...r,
            lastPracticeDate: (/* @__PURE__ */ new Date()).toISOString()
          }));
        }
      } catch (err) {
        console.warn("PostgreSQL getJourneysForUser error:", err);
      }
    }
    return this.localStore.journeys.filter((j) => j.userId === userId);
  }
  async saveJourney(journey) {
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
        console.warn("PostgreSQL saveJourney error:", err);
      }
    }
    const idx = this.localStore.journeys.findIndex((j) => j.id === journey.id);
    if (idx !== -1) {
      this.localStore.journeys[idx] = journey;
    } else {
      this.localStore.journeys.push(journey);
    }
    this.saveFileStore();
    return journey;
  }
  getScenarios(targetLang) {
    if (!targetLang) return STARTER_SCENARIOS;
    const directMatches = STARTER_SCENARIOS.filter((s) => s.targetLanguage === targetLang);
    if (directMatches.length > 0) return directMatches;
    return STARTER_SCENARIOS;
  }
  getJourney(id) {
    return this.localStore.journeys.find((j) => j.id === id);
  }
  getScenarioById(id) {
    return STARTER_SCENARIOS.find((s) => s.id === id);
  }
  getUser(id) {
    return this.localStore.users.find((u) => u.id === id);
  }
  updateUser(id, updates) {
    const user = this.localStore.users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      this.saveFileStore();
      return user;
    }
    return void 0;
  }
  getVocabulary(journeyId) {
    return this.localStore.vocabulary[journeyId] || [];
  }
  addVocabulary(journeyId, item) {
    let list = this.localStore.vocabulary[journeyId];
    if (!list) {
      list = [];
      this.localStore.vocabulary[journeyId] = list;
    }
    const existing = list.find((v) => v.word.toLowerCase() === item.word.toLowerCase());
    if (existing) {
      existing.exposureCount += 1;
      this.saveFileStore();
      return existing;
    }
    const newItem = {
      ...item,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newItem);
    this.saveFileStore();
    return newItem;
  }
  getMistakes(journeyId) {
    return this.localStore.mistakes[journeyId] || [];
  }
  addMistake(journeyId, mistake) {
    let list = this.localStore.mistakes[journeyId];
    if (!list) {
      list = [];
      this.localStore.mistakes[journeyId] = list;
    }
    const existing = list.find((m) => m.pattern.toLowerCase() === mistake.pattern.toLowerCase());
    if (existing) {
      existing.occurrenceCount += 1;
      this.saveFileStore();
      return existing;
    }
    const newRecord = {
      ...mistake,
      id: `mstk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newRecord);
    this.saveFileStore();
    return newRecord;
  }
  getChatHistory(sessionId) {
    return this.localStore.chatHistories[sessionId] || [];
  }
  saveChatMessage(sessionId, message) {
    let history = this.localStore.chatHistories[sessionId];
    if (!history) {
      history = [];
      this.localStore.chatHistories[sessionId] = history;
    }
    history.push(message);
    this.saveFileStore();
    return message;
  }
};
var db = new PersistentDatabase();

// src/server/aiService.ts
import { GoogleGenAI, Modality } from "@google/genai";
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var textModel = "gemini-3.8-flash";
var LIVE_MODEL = "gemini-3.8-live";
function getCharacterVoice(characterName, role) {
  const norm = ((characterName || "") + " " + (role || "")).toLowerCase();
  if (norm.includes("barista") || norm.includes("waiter") || norm.includes("shop") || norm.includes("mateo")) return "Puck";
  if (norm.includes("receptionist") || norm.includes("agent") || norm.includes("sofia")) return "Kore";
  if (norm.includes("doctor") || norm.includes("officer") || norm.includes("carlos")) return "Fenrir";
  if (norm.includes("teacher") || norm.includes("tutor") || norm.includes("yoe")) return "Zephyr";
  return "Charon";
}
async function processScenarioTurn(params) {
  const { scenario, journey, userMessage, conversationHistory = [] } = params;
  const targetLang = (journey?.targetLanguage || params.targetLanguage || "es").toUpperCase();
  const supportLang = (journey?.supportLanguage || params.supportLanguage || "en").toUpperCase();
  const cefr = journey?.cefrLevel || params.cefrLevel || "A1";
  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);
  const systemInstruction = `You are Yoe, an empathetic and highly effective language tutor roleplaying as ${scenario.characterName} (${scenario.characterRole}) in a realistic scenario: "${scenario.title}" located at ${scenario.location}.

TARGET LANGUAGE TO SPEAK: ${targetLang}
SUPPORT LANGUAGE FOR EXPLANATIONS: ${supportLang}
LEARNER CEFR LEVEL: ${cefr}

CRITICAL RULES:
1. Stay strictly in character as ${scenario.characterName}. Speak in realistic, natural ${targetLang} suited to CEFR ${cefr}.
2. Provide a clear, natural translation of your primary response in ${supportLang}.
3. Evaluate if the user's input satisfied any of these scenario objectives:
${JSON.stringify(scenario.objectives, null, 2)}
4. Provide 2-3 short, natural suggested responses the learner could say next in ${targetLang} with ${supportLang} translations.
5. If the learner made a grammar or vocabulary error in ${targetLang}, gently offer a structured correction with explanation.
6. Extract 1-2 useful vocabulary items from the turn.

You MUST respond strictly in valid JSON matching this schema:
{
  "response": "Your spoken dialogue in ${targetLang}",
  "translation": "Translation in ${supportLang}",
  "completedObjectiveIds": ["obj_id_1"],
  "suggestedNextReplies": [
    { "phrase": "Suggested reply in ${targetLang}", "translation": "In ${supportLang}" }
  ],
  "correction": { "original": "user mistake", "corrected": "corrected text", "explanation": "brief explanation" },
  "vocabulary": [
    { "word": "word", "translation": "meaning", "phonetic": "pronunciation", "example": "example sentence" }
  ]
}`;
  const prompt = `CONVERSATION HISTORY:
${conversationHistory.map((h) => `${h.sender.toUpperCase()}: ${h.text}`).join("\n")}
USER: ${userMessage}`;
  try {
    const res = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7
      }
    });
    const jsonText = res.text?.trim() || "{}";
    let parsed = {};
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      parsed = { response: jsonText, translation: "" };
    }
    const responseText = parsed.response || `\xA1Hola! Entendido.`;
    const audioBase64 = await generateScenarioSpeech(responseText, characterVoice);
    let formattedCorrection = void 0;
    if (parsed.correction?.original) {
      formattedCorrection = {
        original: parsed.correction.original,
        corrected: parsed.correction.corrected || parsed.correction.original,
        explanation: parsed.correction.explanation || "",
        severity: "gentle"
      };
    }
    return {
      response: responseText,
      translation: parsed.translation || "",
      audioBase64: audioBase64 || void 0,
      completedObjectiveIds: Array.isArray(parsed.completedObjectiveIds) ? parsed.completedObjectiveIds : [],
      suggestedNextReplies: Array.isArray(parsed.suggestedNextReplies) ? parsed.suggestedNextReplies : [],
      correction: formattedCorrection,
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : []
    };
  } catch (err) {
    console.error("processScenarioTurn error:", err);
    throw err;
  }
}
async function generateLiveGreeting(scenario, journey) {
  const targetLang = (journey?.targetLanguage || "es").toUpperCase();
  const supportLang = (journey?.supportLanguage || "en").toUpperCase();
  const cefr = journey?.cefrLevel || "A1";
  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);
  const prompt = `You are Yoe, the AI language tutor roleplaying as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location} in the scenario "${scenario.title}".
Generate a warm, realistic 1-sentence opening greeting in ${targetLang} for a level ${cefr} learner, followed by its ${supportLang} translation.

Respond strictly in JSON:
{
  "response": "Greeting in ${targetLang}",
  "translation": "Translation in ${supportLang}"
}`;
  try {
    const res = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8
      }
    });
    const parsed = JSON.parse(res.text || "{}");
    const responseText = parsed.response || scenario.initialGreeting;
    const translationText = parsed.translation || scenario.initialGreetingTranslation || responseText;
    const audioBase64 = await generateScenarioSpeech(responseText, characterVoice);
    return {
      response: responseText,
      translation: translationText,
      audioBase64: audioBase64 || void 0
    };
  } catch (e) {
    return {
      response: scenario.initialGreeting,
      translation: scenario.initialGreetingTranslation || scenario.initialGreeting
    };
  }
}
async function generateScenarioSpeech(text, voiceName = "Kore") {
  if (!text || !text.trim()) return null;
  const ttsModels = ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts", "gemini-3.8-flash"];
  for (const model of ttsModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: "Natural, warm, engaging conversational speaker"
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });
      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        return audioData;
      }
    } catch (err) {
      console.warn(`[GEMINI TTS] Model ${model} generation note:`, err?.message || err);
    }
  }
  console.error("[GEMINI TTS] All Gemini TTS models failed");
  return null;
}
async function createEphemeralLiveToken(scenario, journey) {
  try {
    console.log("[YOE LIVE] Generating real ephemeral token on Gemini backend...");
    const targetLang = (journey?.targetLanguage || "es").toUpperCase();
    const supportLang = (journey?.supportLanguage || "en").toUpperCase();
    const cefr = journey?.cefrLevel || "A1";
    const voiceName = getCharacterVoice(scenario.characterName, scenario.characterRole);
    const systemInstruction = `You are Yoe, an empathetic language tutor roleplaying in a realistic scenario on a live voice call. Speak in ${targetLang} suitable for CEFR ${cefr}, and teach using ${supportLang} when explanation is needed.`;
    const tokenResponse = await ai.authTokens.create({
      config: {
        uses: 1,
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName }
              }
            },
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            }
          }
        }
      }
    });
    if (!tokenResponse || !tokenResponse.name) {
      throw new Error("Gemini authTokens.create returned an empty or invalid response");
    }
    console.log("[YOE LIVE] Ephemeral token created successfully:", tokenResponse.name.substring(0, 25) + "...");
    return {
      token: tokenResponse.name,
      model: LIVE_MODEL,
      voiceName,
      systemInstruction
    };
  } catch (err) {
    console.error("[YOE LIVE] Ephemeral token creation failed:", err);
    return {
      token: null,
      model: LIVE_MODEL,
      error: err?.message || "Token generation failure"
    };
  }
}
async function calibrateLearnerLevel(targetLanguageOrBody, supportLanguage, answers) {
  return {
    recommendedLevel: "A1",
    confidenceScore: 0.9,
    feedback: "Great job starting your language journey!"
  };
}

// src/server/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "yoe_prod_jwt_secret_998877_secure_key_3321";
var COOKIE_NAME = "yoe_session";
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: "30d", issuer: "yoe-auth", audience: "yoe-app" }
  );
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: "yoe-auth", audience: "yoe-app" });
  } catch (err) {
    return null;
  }
}
function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    uiLanguage: user.uiLanguage,
    theme: user.theme,
    subscriptionStatus: user.subscriptionStatus,
    emailVerified: user.emailVerified,
    status: user.status,
    activeJourneyId: user.activeJourneyId,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}
async function requireAuth(req, res, next) {
  let token = req.cookies?.[COOKIE_NAME];
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization.trim();
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = authHeader;
    }
  }
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Session missing" });
    return;
  }
  const decoded = verifyToken(token);
  if (!decoded || !decoded.sub) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired session token" });
    return;
  }
  let user = await db.findUserById(decoded.sub);
  if (!user && decoded.username) {
    user = await db.createUser({
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email || `${decoded.username}@yoe.app`,
      passwordHash: "",
      name: decoded.name || decoded.username,
      avatarUrl: void 0,
      uiLanguage: "en",
      theme: "dark",
      subscriptionStatus: "TRIAL",
      emailVerified: true,
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const userJourneys = await db.getJourneysForUser(user.id);
    if (!userJourneys || userJourneys.length === 0) {
      await db.saveJourney({
        id: `jrn_${Date.now()}_es`,
        userId: user.id,
        targetLanguage: "es",
        supportLanguage: "en",
        cefrLevel: "A1",
        streakDays: 1,
        totalMinutesSpoken: 0,
        points: 50,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
  if (!user || user.status === "disabled") {
    res.status(401).json({ error: "Unauthorized: User account unavailable" });
    return;
  }
  req.user = user;
  next();
}
async function registerHandler(req, res) {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      res.status(400).json({ error: "All fields (Name, Username, Email, Password) are required" });
      return;
    }
    const normUsername = username.trim().toLowerCase();
    const normEmail = email.trim().toLowerCase();
    if (normUsername.length < 3 || normUsername.length > 30 || !/^[a-zA-Z0-9_]+$/.test(normUsername)) {
      res.status(400).json({ error: "Username must be 3-30 characters and contain only letters, numbers, or underscores" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      res.status(400).json({ error: "Please enter a valid email address" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }
    const existingUser = await db.findUserByIdentifier(normUsername) || await db.findUserByIdentifier(normEmail);
    if (existingUser) {
      if (existingUser.username === normUsername) {
        res.status(400).json({ error: "That username is already taken. Please choose another." });
        return;
      }
      if (existingUser.email === normEmail) {
        res.status(400).json({ error: "An account with that email address already exists. Please log in." });
        return;
      }
    }
    const passwordHash = await hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newUser = {
      id: userId,
      username: normUsername,
      email: normEmail,
      passwordHash,
      name: name.trim(),
      avatarUrl: void 0,
      uiLanguage: "en",
      theme: "dark",
      subscriptionStatus: "TRIAL",
      emailVerified: true,
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const savedUser = await db.createUser(newUser);
    const initialJourney = {
      id: `jrn_${Date.now()}_es`,
      userId: savedUser.id,
      targetLanguage: "es",
      supportLanguage: "en",
      cefrLevel: "A1",
      streakDays: 1,
      totalMinutesSpoken: 0,
      points: 50,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.saveJourney(initialJourney);
    const token = generateToken(savedUser);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days
    });
    res.status(201).json({
      user: sanitizeUser(savedUser),
      journeys: [initialJourney],
      token
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to create user account. Please try again." });
  }
}
async function loginHandler(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: "Username/email and password are required" });
      return;
    }
    const norm = identifier.trim().toLowerCase();
    const user = await db.findUserByIdentifier(norm);
    if (!user) {
      res.status(401).json({ error: "Invalid username/email or password." });
      return;
    }
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid username/email or password." });
      return;
    }
    await db.updateLastLogin(user.id);
    const journeys = await db.getJourneysForUser(user.id);
    const token = generateToken(user);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days
    });
    res.json({
      user: sanitizeUser(user),
      journeys,
      token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication failed. Please try again." });
  }
}
async function meHandler(req, res) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({ user: sanitizeUser(req.user) });
}
async function logoutHandler(req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ success: true, message: "Logged out successfully" });
}

// src/server/routes.ts
var apiRouter = Router();
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 40,
  message: { error: "Too many authentication requests. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});
apiRouter.get("/health/db", async (_req, res) => {
  const health = await db.getHealthStatus();
  res.json(health);
});
apiRouter.get("/ai/health", async (_req, res) => {
  const apiKeyPresent = !!process.env.GEMINI_API_KEY;
  console.log(`[AI HEALTH CHECK] GEMINI_API_KEY_PRESENT=${apiKeyPresent}`);
  if (!apiKeyPresent) {
    res.status(503).json({
      server: "ok",
      geminiConfigured: false,
      geminiReachable: false,
      error: "GEMINI_API_KEY environment variable is not configured on the server",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return;
  }
  try {
    const testResult = await processScenarioTurn({
      scenario: db.getScenarios()[0],
      journey: {
        id: "health_jrn",
        userId: "health_usr",
        targetLanguage: "es",
        supportLanguage: "en",
        cefrLevel: "A1",
        streakDays: 1,
        totalMinutesSpoken: 0,
        points: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      conversationHistory: [],
      userMessage: "Reply with exactly: YOE_BACKEND_TEST_OK"
    });
    res.json({
      server: "ok",
      geminiConfigured: true,
      geminiReachable: true,
      model: "gemini-3.8-flash",
      testResponse: testResult.response,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("[AI HEALTH ERROR]:", err);
    res.status(502).json({
      server: "ok",
      geminiConfigured: true,
      geminiReachable: false,
      error: err?.message || "Gemini API call failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
apiRouter.post("/auth/register", authLimiter, registerHandler);
apiRouter.post("/auth/login", authLimiter, loginHandler);
apiRouter.get("/auth/me", requireAuth, meHandler);
apiRouter.post("/auth/logout", logoutHandler);
apiRouter.get("/languages", (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});
apiRouter.get("/journeys", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const journeys = await db.getJourneysForUser(req.user.id);
  res.json({ journeys });
});
apiRouter.post("/journeys", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { targetLanguage, supportLanguage, cefrLevel, goals } = req.body;
  const newJourney = {
    id: `jrn_${targetLanguage || "es"}_${Date.now()}`,
    userId: req.user.id,
    targetLanguage: targetLanguage || "es",
    supportLanguage: supportLanguage || "en",
    cefrLevel: cefrLevel || "A1",
    streakDays: 1,
    totalMinutesSpoken: 0,
    points: 50,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  await db.saveJourney(newJourney);
  const updatedUser = db.updateUser(req.user.id, {
    activeJourneyId: newJourney.id,
    onboardingCompleted: true
  });
  res.json({
    journey: newJourney,
    user: updatedUser ? sanitizeUser(updatedUser) : sanitizeUser(req.user)
  });
});
apiRouter.put("/journeys/:id", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const journey = db.getJourney(req.params.id);
  if (!journey) {
    res.status(404).json({ error: "Journey not found" });
    return;
  }
  if (journey.userId !== req.user.id) {
    res.status(403).json({ error: "Forbidden: Cannot edit another user's journey" });
    return;
  }
  Object.assign(journey, req.body);
  await db.saveJourney(journey);
  res.json({ journey });
});
apiRouter.get("/scenarios", (req, res) => {
  const lang = req.query.targetLanguage;
  const scenarios = db.getScenarios(lang);
  res.json({ scenarios });
});
apiRouter.get("/scenarios/:id", (req, res) => {
  const scenario = db.getScenarioById(req.params.id);
  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }
  res.json({ scenario });
});
apiRouter.post("/ai/initial-greeting", async (req, res) => {
  try {
    const { scenarioId, journeyId, targetLanguage, supportLanguage, cefrLevel } = req.body;
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const existingJourney = journeyId ? db.getJourney(journeyId) : null;
    const journey = existingJourney || {
      id: journeyId || "temp_jrn",
      userId: "temp_user",
      targetLanguage: targetLanguage || scenario?.targetLanguage || "es",
      supportLanguage: supportLanguage || "en",
      cefrLevel: cefrLevel || scenario?.cefrLevel || "A1",
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const greeting = await generateLiveGreeting(scenario, journey);
    res.json({ greeting });
  } catch (err) {
    console.error("[YOE GREETING ERROR]:", err);
    res.status(500).json({ error: "Failed to generate live greeting" });
  }
});
apiRouter.post("/ai/chat", async (req, res) => {
  console.log("[YOE CHAT] request received");
  try {
    const { journeyId, scenarioId, userMessage, conversationHistory, targetLanguage, supportLanguage, cefrLevel } = req.body;
    console.log(`[YOE CHAT] user authenticated: ${!!(req.user || req.headers.authorization)}`);
    console.log(`[YOE CHAT] message length: ${userMessage?.length || 0}`);
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const existingJourney = journeyId ? db.getJourney(journeyId) : null;
    console.log(`[YOE CHAT] scenario loaded: ${!!scenario}`);
    const journey = existingJourney || {
      id: journeyId || "temp_jrn",
      userId: "temp_user",
      targetLanguage: targetLanguage || scenario?.targetLanguage || "es",
      supportLanguage: supportLanguage || "en",
      cefrLevel: cefrLevel || scenario?.cefrLevel || "A1",
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log(`[YOE CHAT] target language: ${journey.targetLanguage}`);
    console.log(`[YOE CHAT] support language: ${journey.supportLanguage}`);
    console.log(`[YOE CHAT] level: ${journey.cefrLevel}`);
    console.log(`[YOE CHAT] history length: ${conversationHistory?.length || 0}`);
    const recentMistakes = existingJourney ? db.getMistakes(existingJourney.id) : [];
    db.saveChatMessage(scenarioId || scenario.id, {
      id: `msg_usr_${Date.now()}`,
      sessionId: scenarioId || scenario.id,
      sender: "user",
      text: userMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log("[YOE CHAT] Gemini request started");
    const aiResult = await processScenarioTurn({
      scenario,
      journey,
      conversationHistory: conversationHistory || [],
      userMessage,
      recentMistakes
    });
    console.log(`[YOE CHAT] Gemini response received, length: ${aiResult.response?.length || 0}`);
    const tutorMsg = db.saveChatMessage(scenarioId || scenario.id, {
      id: `msg_ttr_${Date.now()}`,
      sessionId: scenarioId || scenario.id,
      sender: "tutor",
      text: aiResult.response,
      translation: aiResult.translation,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      correction: aiResult.correction,
      learningSignals: aiResult.learningSignals,
      vocabularyLearned: aiResult.vocabulary
    });
    if (aiResult.correction && journey.id && existingJourney) {
      db.addMistake(journey.id, {
        category: "grammar",
        pattern: aiResult.correction.grammarNote || "Language structure",
        exampleUserSaid: aiResult.correction.original,
        correctedForm: aiResult.correction.corrected,
        explanation: aiResult.correction.explanation,
        occurrenceCount: 1,
        lastOccurred: (/* @__PURE__ */ new Date()).toISOString(),
        resolved: false
      });
    }
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
          lastSeen: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
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
  } catch (err) {
    console.error("[YOE CHAT ERROR] status 500:", err);
    res.status(500).json({
      error: "Yoe couldn't connect right now. Please try again.",
      details: err?.message || "Gemini service error"
    });
  }
});
apiRouter.post("/ai/tts", async (req, res) => {
  try {
    const { text, voiceName, characterName, role } = req.body;
    const selectedVoice = voiceName || (characterName ? getCharacterVoice(characterName, role || "") : "Kore");
    const audioBase64 = await generateScenarioSpeech(text, selectedVoice);
    if (!audioBase64) {
      res.status(500).json({ error: "Failed to synthesize speech" });
      return;
    }
    res.json({ audioBase64, mimeType: "audio/wav" });
  } catch (err) {
    console.error("TTS route error:", err);
    res.status(500).json({ error: "TTS synthesis error", details: err.message });
  }
});
apiRouter.post("/ai/live/token", async (req, res) => {
  try {
    const { journeyId, scenarioId } = req.body;
    const journey = db.getJourney(journeyId) || {
      id: journeyId || "temp_jrn",
      userId: "temp_user",
      targetLanguage: "es",
      supportLanguage: "en",
      cefrLevel: "A1",
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const tokenConfig = await createEphemeralLiveToken(scenario, journey);
    res.json(tokenConfig);
  } catch (err) {
    console.error("Live token generation error:", err);
    res.status(500).json({ error: "Failed to generate live session token", details: err.message });
  }
});
apiRouter.post("/ai/live/token", async (req, res) => {
  try {
    const { journeyId, scenarioId } = req.body;
    const journey = db.getJourney(journeyId) || {
      id: journeyId || "temp_jrn",
      userId: "temp_user",
      targetLanguage: "es",
      supportLanguage: "en",
      cefrLevel: "A1",
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const tokenConfig = await createEphemeralLiveToken(scenario, journey);
    res.json(tokenConfig);
  } catch (err) {
    console.error("Live token generation error:", err);
    res.status(500).json({ error: "Failed to generate live session token", details: err.message });
  }
});
apiRouter.post("/ai/calibrate", async (req, res) => {
  try {
    const result = await calibrateLearnerLevel(req.body);
    res.json(result);
  } catch (err) {
    console.error("Calibration route error:", err);
    res.status(500).json({ error: "Failed to calibrate learner level" });
  }
});
apiRouter.get("/vocabulary", (req, res) => {
  const journeyId = req.query.journeyId;
  if (!journeyId) {
    res.json({ vocabulary: [] });
    return;
  }
  const vocabulary = db.getVocabulary(journeyId);
  res.json({ vocabulary });
});
apiRouter.post("/vocabulary", (req, res) => {
  const { journeyId, ...item } = req.body;
  if (!journeyId || !item.word) {
    res.status(400).json({ error: "journeyId and word are required" });
    return;
  }
  const created = db.addVocabulary(journeyId, item);
  res.json({ vocabulary: created });
});
apiRouter.get("/mistakes", (req, res) => {
  const journeyId = req.query.journeyId;
  if (!journeyId) {
    res.json({ mistakes: [] });
    return;
  }
  const mistakes = db.getMistakes(journeyId);
  res.json({ mistakes });
});
apiRouter.post("/mistakes", (req, res) => {
  const { journeyId, ...mistake } = req.body;
  if (!journeyId || !mistake.pattern) {
    res.status(400).json({ error: "journeyId and pattern are required" });
    return;
  }
  const created = db.addMistake(journeyId, mistake);
  res.json({ mistake: created });
});
apiRouter.put("/settings", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const updatedUser = db.updateUser(req.user.id, req.body);
  res.json({ user: updatedUser ? sanitizeUser(updatedUser) : sanitizeUser(req.user) });
});

// src/server/app.ts
dotenv.config();
var app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use("/api", apiRouter);
var app_default = app;
export {
  app,
  app_default as default
};
