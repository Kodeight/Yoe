// src/server/app.ts
import express from "express";
import dotenv from "dotenv";

// src/server/routes.ts
import { Router } from "express";

// src/server/db.ts
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
var STARTER_SCENARIOS = [
  // A1: Level Scenarios (Foundational communication)
  {
    id: "scen_a1_intro_maya",
    title: "Introduce Yourself & Make a Friend",
    description: "Break the ice in a friendly setting, share your name, where you are from, and your favorite hobbies.",
    category: "social",
    targetLanguage: "en",
    cefrLevel: "A1",
    location: "Community Botanical Garden Cafe",
    characterName: "Maya",
    characterRole: "Friendly Local Designer",
    avatar: "\u{1F91D}",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["name", "from", "hobby", "pleasure", "nice to meet you"],
    initialGreeting: "Hi there! Mind if I sit here? I'm Maya. What's your name and where are you from?",
    objectives: [
      { id: "obj_intro_1", text: "Share your name and country or city of origin", completed: false, hint: "Say: Hi Maya, my name is... and I am from..." },
      { id: "obj_intro_2", text: "Tell her what you like doing in your free time", completed: false, hint: "Say: In my free time, I like..." },
      { id: "obj_intro_3", text: "Ask Maya a polite question back", completed: false, hint: "Say: What about you? Do you live nearby?" }
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
    characterName: "Jean-Luc",
    characterRole: "Bistro Server",
    avatar: "\u{1F950}",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["croissant", "caf\xE9 au lait", "l'addition", "s'il vous pla\xEEt", "merci"],
    initialGreeting: "Bonjour ! Bienvenue au Petit Caf\xE9. Vous d\xE9sirez une table en terrasse ou \xE0 l'int\xE9rieur ?",
    objectives: [
      { id: "obj_fr_1", text: "Choose seating preference", completed: false, hint: "Say: Une table en terrasse, s'il vous pla\xEEt." },
      { id: "obj_fr_2", text: "Order a croissant and hot coffee", completed: false, hint: "Say: Je voudrais un croissant et un caf\xE9, s'il vous pla\xEEt." },
      { id: "obj_fr_3", text: "Ask for the bill politely", completed: false, hint: "Say: L'addition, s'il vous pla\xEEt." }
    ]
  },
  {
    id: "scen_cafe_moscow",
    title: "Caf\xE9 in Moscow",
    description: "Order drinks and pastries politely, ask for recommendations and the bill in Russian.",
    category: "dining",
    targetLanguage: "ru",
    cefrLevel: "A1",
    location: "Cafe Pushkin, Moscow",
    characterName: "Dmitry",
    characterRole: "Friendly Cafe Waiter",
    avatar: "\u2615",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["\u043A\u043E\u0444\u0435", "\u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430", "\u0441\u0447\u0435\u0442", "\u0432\u044B\u043F\u0435\u0447\u043A\u0430", "\u0432\u043A\u0443\u0441\u043D\u044B\u0439"],
    initialGreeting: "\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435! \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u043D\u0430\u0448\u0435 \u043A\u0430\u0444\u0435. \u0427\u0442\u043E \u0436\u0435\u043B\u0430\u0435\u0442\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u0442\u044C?",
    objectives: [
      { id: "obj_ru_1", text: "Order a coffee or tea politely", completed: false, hint: "Say: \u042F \u0445\u043E\u0447\u0443 \u043E\u0434\u0438\u043D \u043A\u043E\u0444\u0435, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430." },
      { id: "obj_ru_2", text: "Ask what pastry is fresh today", completed: false, hint: "Say: \u041A\u0430\u043A\u0430\u044F \u0432\u044B\u043F\u0435\u0447\u043A\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0441\u0432\u0435\u0436\u0430\u044F?" },
      { id: "obj_ru_3", text: "Ask for the bill", completed: false, hint: "Say: \u041F\u0440\u0438\u043D\u0435\u0441\u0438\u0442\u0435 \u0441\u0447\u0435\u0442, \u043F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430." }
    ]
  },
  {
    id: "scen_grocery_cairo",
    title: "Fruit Market in Cairo",
    description: "Ask for fresh fruits, inquire about prices per kilo, and make payment in Arabic.",
    category: "shopping",
    targetLanguage: "ar",
    cefrLevel: "A1",
    location: "Khan el-Khalili Market, Cairo",
    characterName: "Hassan",
    characterRole: "Market Vendor",
    avatar: "\u{1F349}",
    imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["\u0641\u0627\u0643\u0647\u0629", "\u0643\u0645 \u0627\u0644\u0633\u0639\u0631", "\u0643\u064A\u0644\u0648", "\u0634\u0643\u0631\u0627", "\u0637\u0627\u0632\u062C"],
    initialGreeting: "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B \u0628\u064E\u0643\u064E \u0641\u064A \u0633\u0648\u0642 \u0627\u0644\u0642\u0627\u0647\u0631\u0629! \u0644\u062F\u064A\u0646\u0627 \u0641\u0648\u0627\u0643\u0647 \u0637\u0627\u0632\u062C\u0629 \u0648\u0644\u0630\u064A\u0630\u0629 \u0627\u0644\u064A\u0648\u0645. \u0643\u064A\u0641 \u0623\u0633\u0627\u0639\u062F\u0643\u061F",
    objectives: [
      { id: "obj_ar_1", text: "Ask for fresh fruit politely", completed: false, hint: "Say: \u0623\u0631\u064A\u062F \u0628\u0631\u062A\u0642\u0627\u0644\u0627\u064B \u0645\u0646 \u0641\u0636\u0644\u0643." },
      { id: "obj_ar_2", text: "Ask how much one kilo costs", completed: false, hint: "Say: \u0643\u0645 \u0633\u0639\u0631 \u0627\u0644\u0643\u064A\u0644\u0648\u061F" },
      { id: "obj_ar_3", text: "Say thank you and goodbye", completed: false, hint: "Say: \u0634\u0643\u0631\u0627\u064B \u062C\u0632\u064A\u0644\u0627\u064B\u060C \u0645\u0639 \u0627\u0644\u0633\u0644\u0627\u0645\u0629." }
    ]
  },
  {
    id: "scen_directions_london",
    title: "Asking for Directions in the City",
    description: "Find your way to the nearest subway station or landmark by asking locals on the street.",
    category: "travel",
    targetLanguage: "en",
    cefrLevel: "A1",
    location: "Covent Garden, Central London",
    characterName: "Sarah",
    characterRole: "Helpful Local Resident",
    avatar: "\u{1F5FA}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["excuse me", "straight ahead", "turn left", "subway station", "near"],
    initialGreeting: "Hello! You look like you might need some help finding your way. Where are you trying to go?",
    objectives: [
      { id: "obj_dir_1", text: "Ask where the nearest tube station is", completed: false, hint: "Say: Excuse me, where is the nearest underground station?" },
      { id: "obj_dir_2", text: "Clarify if it is within walking distance", completed: false, hint: "Say: Can I walk there, or should I take a bus?" },
      { id: "obj_dir_3", text: "Thank Sarah for her directions", completed: false, hint: "Say: Thank you so much for your help!" }
    ]
  },
  // A2: Travel, Dining & Practical Scenarios
  {
    id: "scen_airport_01",
    title: "At the Airport Terminal",
    description: "Practice travel conversations, passport control, and finding your departure gate.",
    category: "travel",
    targetLanguage: "en",
    cefrLevel: "A2",
    location: "London Heathrow Airport Terminal 5",
    characterName: "Officer Davies",
    characterRole: "Border Control & Information Officer",
    avatar: "\u{1F6EB}",
    imageUrl: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["boarding pass", "gate number", "luggage", "customs", "delayed"],
    initialGreeting: "Good day! Passport and boarding pass please. Where are you traveling to today?",
    objectives: [
      { id: "obj_air_1", text: "State your destination and flight purpose", completed: false, hint: "Say: I am flying to Paris for vacation." },
      { id: "obj_air_2", text: "Ask where to find gate or baggage claim", completed: false, hint: "Say: Excuse me, which way to Gate 14?" },
      { id: "obj_air_3", text: "Confirm departure time", completed: false, hint: "Say: Is the flight on time?" }
    ]
  },
  {
    id: "scen_hotel_madrid",
    title: "Hotel Check-In Madrid",
    description: "Check into your boutique hotel room, ask about breakfast hours and WiFi details in Spanish.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Hotel Gran V\xEDa, Madrid",
    characterName: "Carmen",
    characterRole: "Hotel Receptionist",
    avatar: "\u{1F3E8}",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["reserva", "habitaci\xF3n", "desayuno", "clave de wifi", "piso"],
    initialGreeting: "\xA1Buenas tardes! Bienvenido al Hotel Gran V\xEDa. \xBFTiene una reserva con nosotros?",
    objectives: [
      { id: "obj_es_1", text: "Confirm reservation under your name", completed: false, hint: "Say: Tengo una reserva a nombre de..." },
      { id: "obj_es_2", text: "Ask for the WiFi password and breakfast time", completed: false, hint: "Say: \xBFCu\xE1l es la contrase\xF1a del WiFi y a qu\xE9 hora es el desayuno?" },
      { id: "obj_es_3", text: "Inquire about keycard or room floor", completed: false, hint: "Say: \xBFEn qu\xE9 piso est\xE1 la habitaci\xF3n?" }
    ]
  },
  {
    id: "scen_restaurant_rome",
    title: "Dinner at a Roman Trattoria",
    description: "Order authentic regional pasta, ask for house wine pairings, and comment on the meal in Italian.",
    category: "dining",
    targetLanguage: "it",
    cefrLevel: "A2",
    location: "Trattoria da Enzo, Trastevere, Rome",
    characterName: "Matteo",
    characterRole: "Host & Sommelier",
    avatar: "\u{1F35D}",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["pasta", "vino della casa", "delizioso", "il conto", "consiglio"],
    initialGreeting: "Buonasera e benvenuti a Roma! Abbiamo piatti speciali oggi. Desidera accomodarsi?",
    objectives: [
      { id: "obj_it_1", text: "Ask for recommendations on fresh pasta", completed: false, hint: "Say: Quale pasta fresca mi consiglia?" },
      { id: "obj_it_2", text: "Order wine or sparkling water", completed: false, hint: "Say: Vorrei un bicchiere di vino rosso e acqua naturale." },
      { id: "obj_it_3", text: "Compliment the chef and request the bill", completed: false, hint: "Say: Era tutto delizioso! Il conto, per favore." }
    ]
  },
  {
    id: "scen_shopping_tokyo",
    title: "Boutique Shopping in Shibuya",
    description: "Ask for different sizes, try on clothes, and inquire about discounts or tax-free purchases.",
    category: "shopping",
    targetLanguage: "en",
    cefrLevel: "A2",
    location: "Shibuya Fashion Mall, Tokyo",
    characterName: "Kenji",
    characterRole: "Boutique Stylist",
    avatar: "\u{1F6CD}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["size", "fitting room", "discount", "try on", "receipt"],
    initialGreeting: "Welcome! Feel free to look around. Let me know if you need another size or color.",
    objectives: [
      { id: "obj_shop_1", text: "Ask if they have an item in a medium or large size", completed: false, hint: "Say: Excuse me, do you have this in medium?" },
      { id: "obj_shop_2", text: "Ask where the fitting room is located", completed: false, hint: "Say: Where can I try this on?" },
      { id: "obj_shop_3", text: "Confirm payment method (card or cash)", completed: false, hint: "Say: Do you accept credit cards?" }
    ]
  },
  // B1: Professional, Problem-solving & Conversational Mastery
  {
    id: "scen_work_meeting",
    title: "Cross-Functional Team Meeting",
    description: "Present project status updates, negotiate deadlines, and propose innovative ideas in English.",
    category: "work",
    targetLanguage: "en",
    cefrLevel: "B1",
    location: "Innovation Tech Hub, London",
    characterName: "Elena Rostova",
    characterRole: "Senior Product Lead",
    avatar: "\u{1F4BC}",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["deadline", "milestone", "priorities", "proposal", "deliverables"],
    initialGreeting: "Thanks for joining today's sync. Let's review our Q3 launch milestones. Could you share your update?",
    objectives: [
      { id: "obj_biz_1", text: "Provide a structured summary of your progress", completed: false, hint: "Say: Over the past week, we completed the primary phase and tested deliverables." },
      { id: "obj_biz_2", text: "Address a challenge or request more time", completed: false, hint: "Say: We noticed a bottleneck, so we might need two more days to finalize QA." },
      { id: "obj_biz_3", text: "Propose a collaborative next action step", completed: false, hint: "Say: Let's schedule a follow-up review on Friday." }
    ]
  },
  {
    id: "scen_travel_problem",
    title: "Resolving a Lost Baggage Issue",
    description: "Describe your lost luggage clearly, provide baggage claim details, and request immediate tracking.",
    category: "travel",
    targetLanguage: "en",
    cefrLevel: "B1",
    location: "Lost & Found Service Desk",
    characterName: "Agent Miller",
    characterRole: "Customer Relations Representative",
    avatar: "\u{1F9F3}",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["lost baggage", "description", "claim tag", "delivery address", "tracking number"],
    initialGreeting: "I understand your suitcase did not appear on the carousel. Please don't worry. Let's file a report.",
    objectives: [
      { id: "obj_prob_1", text: "Describe your suitcase appearance and color in detail", completed: false, hint: "Say: It is a dark blue hard-case suitcase with four wheels and a red tag." },
      { id: "obj_prob_2", text: "Provide flight number and claim tag number", completed: false, hint: "Say: My flight was BA245 from Madrid, tag number 89402." },
      { id: "obj_prob_3", text: "Give temporary hotel delivery address and phone number", completed: false, hint: "Say: Please deliver it to Hotel Central at 42 Victoria Street." }
    ]
  }
];
var CleanMemoryDatabase = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.userPasswords = /* @__PURE__ */ new Map();
    this.journeys = /* @__PURE__ */ new Map();
    this.vocabulary = /* @__PURE__ */ new Map();
    this.mistakes = /* @__PURE__ */ new Map();
    this.chatHistories = /* @__PURE__ */ new Map();
  }
  getUser(id) {
    return this.users.get(id);
  }
  getUserByEmail(email) {
    const normalized = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        return u;
      }
    }
    return void 0;
  }
  validatePassword(email, password) {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    const stored = this.userPasswords.get(user.id);
    if (stored === password) {
      return user;
    }
    return null;
  }
  createUser(name, email, password, uiLanguage = "en") {
    const normalized = email.trim().toLowerCase();
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || "Learner",
      email: normalized,
      uiLanguage,
      theme: "dark",
      subscriptionStatus: "trial",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString()
    };
    this.users.set(newUser.id, newUser);
    this.userPasswords.set(newUser.id, password);
    return newUser;
  }
  updateUser(user) {
    this.users.set(user.id, user);
    return user;
  }
  getJourneysForUser(userId) {
    return Array.from(this.journeys.values()).filter((j) => j.userId === userId);
  }
  getJourney(id) {
    return this.journeys.get(id);
  }
  saveJourney(journey) {
    this.journeys.set(journey.id, journey);
    return journey;
  }
  getScenarios(targetLang) {
    if (!targetLang) return STARTER_SCENARIOS;
    const directMatches = STARTER_SCENARIOS.filter((s) => s.targetLanguage === targetLang);
    if (directMatches.length > 0) return directMatches;
    return STARTER_SCENARIOS;
  }
  getScenarioById(id) {
    return STARTER_SCENARIOS.find((s) => s.id === id);
  }
  getVocabulary(journeyId) {
    return this.vocabulary.get(journeyId) || [];
  }
  addVocabulary(journeyId, item) {
    let list = this.vocabulary.get(journeyId);
    if (!list) {
      list = [];
      this.vocabulary.set(journeyId, list);
    }
    const existing = list.find((v) => v.word.toLowerCase() === item.word.toLowerCase());
    if (existing) {
      existing.exposureCount += 1;
      existing.lastSeen = (/* @__PURE__ */ new Date()).toISOString();
      return existing;
    }
    const newItem = {
      ...item,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newItem);
    return newItem;
  }
  getMistakes(journeyId) {
    return this.mistakes.get(journeyId) || [];
  }
  addMistake(journeyId, mistake) {
    let list = this.mistakes.get(journeyId);
    if (!list) {
      list = [];
      this.mistakes.set(journeyId, list);
    }
    const existing = list.find((m) => m.pattern.toLowerCase() === mistake.pattern.toLowerCase());
    if (existing) {
      existing.occurrenceCount += 1;
      existing.lastOccurred = (/* @__PURE__ */ new Date()).toISOString();
      return existing;
    }
    const newRecord = {
      ...mistake,
      id: `mstk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newRecord);
    return newRecord;
  }
  getChatHistory(sessionId) {
    return this.chatHistories.get(sessionId) || [];
  }
  saveChatMessage(sessionId, message) {
    let history = this.chatHistories.get(sessionId);
    if (!history) {
      history = [];
      this.chatHistories.set(sessionId, history);
    }
    history.push(message);
    return message;
  }
};
var db = new CleanMemoryDatabase();

// src/server/aiService.ts
import { GoogleGenAI, Type } from "@google/genai";
var apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JQUS-fp1GOZb_2wVDFraAO48nyMYnf4cwhvvkGVCqg-g";
var defaultModel = process.env.GEMINI_MODEL || "gemini-flash-latest";
var ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
async function processScenarioTurn(req) {
  const { scenario, journey, conversationHistory, userMessage, recentMistakes } = req;
  const systemInstruction = `
You are "Yoe", an empathetic, highly skilled AI language tutor playing a specific character in an interactive learning scenario.
Your character: "${scenario.characterName}" (${scenario.characterRole}).
Scenario setting: "${scenario.title}" in ${scenario.location}.

TARGET LANGUAGE: ${journey.targetLanguage.toUpperCase()}
SUPPORT / EXPLANATION LANGUAGE: ${journey.supportLanguage.toUpperCase()}
LEARNER'S ESTIMATED CEFR LEVEL: ${journey.cefrLevel}

CRITICAL PEDAGOGICAL RULES:
1. Maintain character role immersion naturally in ${journey.targetLanguage.toUpperCase()}. Do not break character in your main response.
2. STRICT ROLE FOCUS & NO OFF-TOPIC DRIFT:
   - Your ONLY job is to be an empathetic LANGUAGE TUTOR and your assigned scenario character ("${scenario.characterName}" - ${scenario.characterRole}).
   - You are NEVER a medical doctor, clinical practitioner, attorney, or financial advisor.
   - NEVER diagnose illnesses, recommend medications, offer medical treatment protocols, or lecture on clinical topics.
   - If the learner asks about health, sickness, or unrelated topics:
     - Stay in character, acknowledge in 1 brief conversational sentence in ${journey.targetLanguage.toUpperCase()}, kindly suggest they see a qualified real-world doctor if they feel unwell, and IMMEDIATELY steer the conversation back to the active scenario setting (${scenario.title}) and target language practice.
     - Always keep the primary focus on teaching and practicing ${journey.targetLanguage.toUpperCase()}!
3. Adjust sentence structure, speed, and vocabulary strictly to level ${journey.cefrLevel}.
4. CORRECTION PHILOSOPHY: Flow-preserving and gentle!
   - DO NOT interrupt the scenario or give a huge lecture.
   - If the user made a grammar, vocabulary, or agreement mistake, provide a structured correction in the JSON output, explaining clearly in ${journey.supportLanguage.toUpperCase()}.
   - If the user made no significant mistake, set correction to null.
5. Active Scenario Objectives:
   ${scenario.objectives.map((o) => `- [ID: ${o.id}] ${o.text}`).join("\n")}
   If the user's message successfully fulfills any objective, include its ID in "completedObjectiveIds".
6. Provide 3 helpful "suggestedNextReplies" in ${journey.targetLanguage.toUpperCase()} with translations in ${journey.supportLanguage.toUpperCase()} so the user can keep communicating if stuck.
7. Extract key vocabulary words practiced in this turn in "vocabulary".
8. Explanations and translations MUST be in ${journey.supportLanguage.toUpperCase()}.
  `.trim();
  const formattedHistory = conversationHistory.slice(-10).map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n");
  const mistakesContext = recentMistakes && recentMistakes.length > 0 ? `
LEARNER'S RECENT KNOWN WEAKNESSES:
${recentMistakes.map((m) => `- ${m.pattern}: "${m.exampleUserSaid}" -> "${m.correctedForm}"`).join("\n")}` : "";
  const prompt = `
Scenario: ${scenario.title} (${scenario.description})
${mistakesContext}

CONVERSATION HISTORY:
${formattedHistory}

LATEST USER INPUT:
"${userMessage}"

Respond as character "${scenario.characterName}" in ${journey.targetLanguage.toUpperCase()}, evaluate the user's message, and return JSON matching the specified schema.
  `.trim();
  try {
    const aiResult = await ai.models.generateContent({
      model: defaultModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: {
              type: Type.STRING,
              description: `Character response in target language (${journey.targetLanguage})`
            },
            translation: {
              type: Type.STRING,
              description: `Translation in support language (${journey.supportLanguage})`
            },
            correction: {
              type: Type.OBJECT,
              description: "Gentle correction if the user made an error",
              properties: {
                original: { type: Type.STRING },
                corrected: { type: Type.STRING },
                explanation: { type: Type.STRING },
                grammarNote: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["gentle", "important"] }
              }
            },
            learningSignals: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  phonetic: { type: Type.STRING },
                  example: { type: Type.STRING }
                },
                required: ["word", "translation"]
              }
            },
            completedObjectiveIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            suggestedNextReplies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  translation: { type: Type.STRING }
                },
                required: ["phrase", "translation"]
              }
            }
          },
          required: ["response", "translation"]
        }
      }
    });
    const textOutput = aiResult.text;
    if (!textOutput) {
      throw new Error("Empty response received from AI model");
    }
    const parsed = JSON.parse(textOutput);
    return parsed;
  } catch (error) {
    console.error("Error processing AI scenario turn:", error);
    return {
      response: `I understood you! Let's continue practicing in ${journey.targetLanguage.toUpperCase()}.`,
      translation: "I understood you! Let's continue practicing.",
      suggestedNextReplies: [
        { phrase: "Could you please repeat that?", translation: "Could you please repeat that?" },
        { phrase: "Yes, that sounds great.", translation: "Yes, that sounds great." },
        { phrase: "Thank you very much!", translation: "Thank you very much!" }
      ]
    };
  }
}
async function calibrateLearnerLevel(req) {
  const { targetLanguage, supportLanguage, experienceLevel, motivation, answers } = req;
  const prompt = `
Evaluate a new language learner for Yoe.
Target Language: ${targetLanguage}
Support Language: ${supportLanguage}
Self-reported experience: ${experienceLevel}
Motivation: ${motivation}

Sample baseline responses provided by learner:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

Determine the learner's initial working CEFR level (A1, A2, B1, B2, C1, C2) and return structured JSON.
  `.trim();
  try {
    const res = await ai.models.generateContent({
      model: defaultModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCefrLevel: {
              type: Type.STRING,
              enum: ["A1", "A2", "B1", "B2", "C1", "C2"]
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            welcomeMessage: { type: Type.STRING }
          },
          required: ["estimatedCefrLevel", "strengths", "focusAreas", "welcomeMessage"]
        }
      }
    });
    if (res.text) {
      return JSON.parse(res.text);
    }
  } catch (err) {
    console.error("Calibration error:", err);
  }
  return {
    estimatedCefrLevel: experienceLevel || "A1",
    strengths: ["Enthusiasm to learn", "Good basic comprehension"],
    focusAreas: ["Vocabulary expansion", "Conversational confidence"],
    welcomeMessage: `Welcome to Yoe! We've calibrated your journey. Let's start speaking ${targetLanguage.toUpperCase()} together!`
  };
}

// src/server/routes.ts
var apiRouter = Router();
apiRouter.get("/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer usr_")) {
    res.json({ user: null });
    return;
  }
  const userId = authHeader.replace("Bearer ", "").trim();
  const user = db.getUser(userId);
  if (!user) {
    res.json({ user: null });
    return;
  }
  res.json({ user });
});
apiRouter.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const user = db.validatePassword(email, password);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const journeys = db.getJourneysForUser(user.id);
  res.json({
    user,
    token: `Bearer ${user.id}`,
    journeys
  });
});
apiRouter.post("/auth/register", (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }
  const user = db.createUser(name || "Language Learner", email, password);
  res.json({
    user,
    token: `Bearer ${user.id}`,
    journeys: []
  });
});
apiRouter.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});
apiRouter.get("/languages", (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});
apiRouter.get("/journeys", (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = req.query.userId;
  if (!userId && authHeader && authHeader.startsWith("Bearer usr_")) {
    userId = authHeader.replace("Bearer ", "").trim();
  }
  if (!userId) {
    res.json({ journeys: [] });
    return;
  }
  const journeys = db.getJourneysForUser(userId);
  res.json({ journeys });
});
apiRouter.post("/journeys", (req, res) => {
  const { userId, targetLanguage, supportLanguage, cefrLevel } = req.body;
  if (!userId) {
    res.status(400).json({ error: "User ID is required to create a journey" });
    return;
  }
  const newJourney = {
    id: `jrn_${targetLanguage}_${Date.now()}`,
    userId,
    targetLanguage: targetLanguage || "en",
    supportLanguage: supportLanguage || "en",
    cefrLevel: cefrLevel || "A1",
    streakDays: 0,
    totalMinutesSpoken: 0,
    points: 0,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  db.saveJourney(newJourney);
  res.json({ journey: newJourney });
});
apiRouter.put("/journeys/:id", (req, res) => {
  const journey = db.getJourney(req.params.id);
  if (!journey) {
    res.status(404).json({ error: "Journey not found" });
    return;
  }
  Object.assign(journey, req.body);
  db.saveJourney(journey);
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
apiRouter.post("/ai/chat", async (req, res) => {
  try {
    const { journeyId, scenarioId, userMessage, conversationHistory } = req.body;
    const journey = db.getJourney(journeyId) || {
      id: journeyId || "temp_jrn",
      userId: "temp_user",
      targetLanguage: "en",
      supportLanguage: "en",
      cefrLevel: "A1",
      streakDays: 0,
      totalMinutesSpoken: 0,
      points: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const recentMistakes = journey ? db.getMistakes(journey.id) : [];
    db.saveChatMessage(scenarioId, {
      id: `msg_usr_${Date.now()}`,
      sessionId: scenarioId,
      sender: "user",
      text: userMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const aiResult = await processScenarioTurn({
      scenario,
      journey,
      conversationHistory: conversationHistory || [],
      userMessage,
      recentMistakes
    });
    const tutorMsg = db.saveChatMessage(scenarioId, {
      id: `msg_ttr_${Date.now()}`,
      sessionId: scenarioId,
      sender: "tutor",
      text: aiResult.response,
      translation: aiResult.translation,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      correction: aiResult.correction,
      learningSignals: aiResult.learningSignals,
      vocabularyLearned: aiResult.vocabulary
    });
    if (aiResult.correction && journey.id) {
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
          lastSeen: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    if (journey.id && db.getJourney(journey.id)) {
      const liveJourney = db.getJourney(journey.id);
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
  } catch (err) {
    console.error("Error handling AI chat route:", err);
    res.status(500).json({
      error: "Failed to process AI chat message",
      details: err.message
    });
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
apiRouter.put("/settings", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer usr_")) {
    res.json({ success: true });
    return;
  }
  const userId = authHeader.replace("Bearer ", "").trim();
  const user = db.getUser(userId);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  Object.assign(user, req.body);
  db.updateUser(user);
  res.json({ user });
});

// src/server/app.ts
dotenv.config();
var app = express();
app.use(express.json());
app.use("/api", apiRouter);
var app_default = app;

// api/index.ts
var index_default = app_default;
export {
  index_default as default
};
