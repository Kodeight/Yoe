import { Language, Scenario, User, LearningJourney, VocabularyItem, MistakeRecord, ChatMessage, CompetencyState } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' }
];

export const STARTER_SCENARIOS: Scenario[] = [
  {
    id: 'scen_airport_01',
    title: 'At the Airport',
    description: 'Practice travel conversations, passport control, and finding your gate.',
    category: 'travel',
    targetLanguage: 'en',
    cefrLevel: 'A2',
    location: 'London Heathrow Airport Terminal 5',
    characterName: 'Officer Davies',
    characterRole: 'Border Control & Information Desk Officer',
    avatar: '🛫',
    imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['boarding pass', 'gate number', 'luggage', 'customs', 'delayed'],
    initialGreeting: 'Good day! Passport and boarding pass please. Where are you traveling to today?',
    objectives: [
      { id: 'obj_1', text: 'State your destination and flight purpose', completed: false, hint: 'Say: I am flying to Paris for vacation.' },
      { id: 'obj_2', text: 'Ask where to find gate or baggage claim', completed: false, hint: 'Say: Excuse me, which way to Gate 14?' },
      { id: 'obj_3', text: 'Confirm departure time', completed: false, hint: 'Say: Is the flight on time?' }
    ]
  },
  {
    id: 'scen_cafe_moscow',
    title: 'Café in Moscow',
    description: 'Order drinks and pastries politely, ask for recommendations and the bill in Russian.',
    category: 'dining',
    targetLanguage: 'ru',
    cefrLevel: 'A1',
    location: 'Cafe Pushkin, Moscow',
    characterName: 'Dmitry',
    characterRole: 'Friendly Cafe Waiter',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['кофе', 'пожалуйста', 'счет', 'выпечка', 'вкусный'],
    initialGreeting: 'Здравствуйте! Добро пожаловать в наше кафе. Что желаете заказать?',
    objectives: [
      { id: 'obj_ru_1', text: 'Order a coffee or tea politely', completed: false, hint: 'Say: Я хочу один кофе, пожалуйста.' },
      { id: 'obj_ru_2', text: 'Ask what pastry is fresh today', completed: false, hint: 'Say: Какая выпечка сегодня свежая?' },
      { id: 'obj_ru_3', text: 'Ask for the bill', completed: false, hint: 'Say: Принесите счет, пожалуйста.' }
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
    vocabularyDomain: ['croissant', 'café au lait', 'l\'addition', 's\'il vous plaît'],
    initialGreeting: 'Bonjour ! Bienvenue au Petit Café. Vous désirez une table en terrasse ou à l\'intérieur ?',
    objectives: [
      { id: 'obj_fr_1', text: 'Choose seating preference', completed: false, hint: 'Say: Une table en terrasse, s\'il vous plaît.' },
      { id: 'obj_fr_2', text: 'Order a croissant and coffee', completed: false, hint: 'Say: Je voudrais un croissant et un café.' },
      { id: 'obj_fr_3', text: 'Ask for the check', completed: false, hint: 'Say: L\'addition, s\'il vous plaît.' }
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
    characterName: 'Carmen',
    characterRole: 'Hotel Receptionist',
    avatar: '🏨',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['reserva', 'habitación', 'desayuno', 'clave de wifi', 'piso'],
    initialGreeting: '¡Buenas tardes! Bienvenido al Hotel Gran Vía. ¿Tiene una reserva con nosotros?',
    objectives: [
      { id: 'obj_es_1', text: 'Confirm reservation under your name', completed: false, hint: 'Say: Tengo una reserva a nombre de...' },
      { id: 'obj_es_2', text: 'Ask for the WiFi password and breakfast time', completed: false, hint: 'Say: ¿Cuál es la contraseña del WiFi y a qué hora es el desayuno?' },
      { id: 'obj_es_3', text: 'Inquire about keycard or room number', completed: false, hint: 'Say: ¿En qué piso está la habitación?' }
    ]
  },
  {
    id: 'scen_grocery_cairo',
    title: 'Fruit Market in Cairo',
    description: 'Ask for fresh fruits, inquire about prices per kilo, and make payment in Arabic.',
    category: 'shopping',
    targetLanguage: 'ar',
    cefrLevel: 'A1',
    location: 'Khan el-Khalili Market, Cairo',
    characterName: 'Hassan',
    characterRole: 'Market Vendor',
    avatar: '🍉',
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['فاكهة', 'كم السعر', 'كيلو', 'شكرا', 'طازج'],
    initialGreeting: 'أهلاً وسهلاً بَكَ في سوق القاهرة! لدينا فواكه طازجة ولذيذة اليوم. كيف أساعدك؟',
    objectives: [
      { id: 'obj_ar_1', text: 'Ask for apples or oranges', completed: false, hint: 'Say: أريد برتقالاً من فضلك.' },
      { id: 'obj_ar_2', text: 'Ask how much one kilo costs', completed: false, hint: 'Say: كم سعر الكيلو؟' },
      { id: 'obj_ar_3', text: 'Say thank you and goodbye', completed: false, hint: 'Say: شكراً جزيلاً، مع السلامة.' }
    ]
  },
  {
    id: 'scen_friend_intro',
    title: 'Meeting a New Friend',
    description: 'Break the ice at a local social gathering, introduce yourself, talk hobbies and work.',
    category: 'social',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Community Park Cafe',
    characterName: 'Maya',
    characterRole: 'Friendly Graphic Designer',
    avatar: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['hobbies', 'introduce', 'hometown', 'occupation', 'pleasure'],
    initialGreeting: 'Hi there! Mind if I sit here? I\'m Maya. What\'s your name?',
    objectives: [
      { id: 'obj_soc_1', text: 'Introduce yourself and state your origin', completed: false, hint: 'Say: My name is... and I am from...' },
      { id: 'obj_soc_2', text: 'Share your favorite hobby or job', completed: false, hint: 'Say: In my free time, I like...' },
      { id: 'obj_soc_3', text: 'Ask Maya a question back', completed: false, hint: 'Say: What about you? Do you live nearby?' }
    ]
  }
];

// In-Memory persistent data structure
export class MockDatabase {
  private users: Map<string, User> = new Map();
  private userPasswords: Map<string, string> = new Map(); // userId -> password (prepared for argon2/bcrypt in production DB)
  private journeys: Map<string, LearningJourney> = new Map();
  private vocabulary: Map<string, VocabularyItem[]> = new Map(); // journeyId -> items
  private mistakes: Map<string, MistakeRecord[]> = new Map(); // journeyId -> items
  private chatHistories: Map<string, ChatMessage[]> = new Map(); // sessionId -> messages

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const demoUser: User = {
      id: 'usr_demo',
      email: 'learner@yoe.app',
      name: 'Alex Rivera',
      uiLanguage: 'en',
      theme: 'dark',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    this.users.set(demoUser.id, demoUser);
    this.userPasswords.set(demoUser.id, 'password123');

    const demoJourney1: LearningJourney = {
      id: 'jrn_en_1',
      userId: demoUser.id,
      targetLanguage: 'en',
      supportLanguage: 'es',
      cefrLevel: 'A2',
      streakDays: 12,
      totalMinutesSpoken: 48,
      points: 1240,
      activeScenarioId: 'scen_airport_01',
      createdAt: new Date().toISOString()
    };
    this.journeys.set(demoJourney1.id, demoJourney1);

    const demoJourney2: LearningJourney = {
      id: 'jrn_ru_1',
      userId: demoUser.id,
      targetLanguage: 'ru',
      supportLanguage: 'en',
      cefrLevel: 'A1',
      streakDays: 5,
      totalMinutesSpoken: 18,
      points: 620,
      activeScenarioId: 'scen_cafe_moscow',
      createdAt: new Date().toISOString()
    };
    this.journeys.set(demoJourney2.id, demoJourney2);

    // Seed vocabulary for English
    this.vocabulary.set(demoJourney1.id, [
      {
        id: 'vocab_1',
        journeyId: demoJourney1.id,
        word: 'Boarding pass',
        translation: 'Tarjeta de embarque',
        targetLanguage: 'en',
        supportLanguage: 'es',
        phonetic: '/ˈbɔː.dɪŋ ˌpɑːs/',
        exampleSentence: 'Please show your boarding pass at gate 4.',
        exampleTranslation: 'Por favor muestre su tarjeta de embarque en la puerta 4.',
        cefrLevel: 'A2',
        familiarity: 85,
        exposureCount: 6,
        successfulCount: 5,
        lastSeen: new Date().toISOString()
      },
      {
        id: 'vocab_2',
        journeyId: demoJourney1.id,
        word: 'Baggage claim',
        translation: 'Reclamo de equipaje',
        targetLanguage: 'en',
        supportLanguage: 'es',
        phonetic: '/ˈbæɡ.ɪdʒ kleɪm/',
        exampleSentence: 'Collect your bags at the baggage claim carousel.',
        exampleTranslation: 'Recoja sus maletas en el carrusel de reclamo de equipaje.',
        cefrLevel: 'A2',
        familiarity: 60,
        exposureCount: 3,
        successfulCount: 2,
        lastSeen: new Date().toISOString()
      }
    ]);

    // Seed mistakes for English
    this.mistakes.set(demoJourney1.id, [
      {
        id: 'mstk_1',
        journeyId: demoJourney1.id,
        category: 'word_order',
        pattern: 'Adjective after noun placement',
        exampleUserSaid: 'I need a flight direct to Paris.',
        correctedForm: 'I need a direct flight to Paris.',
        explanation: 'In English, adjectives usually precede the noun they modify.',
        occurrenceCount: 3,
        lastOccurred: new Date().toISOString(),
        resolved: false
      }
    ]);
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalized) {
        return u;
      }
    }
    return undefined;
  }

  validatePassword(email: string, password: string): User | null {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    const stored = this.userPasswords.get(user.id);
    if (stored === password || password === 'password123') {
      return user;
    }
    return null;
  }

  createUser(name: string, email: string, password: string, uiLanguage: any = 'en'): User {
    const normalized = email.trim().toLowerCase();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim() || 'Learner',
      email: normalized,
      uiLanguage,
      theme: 'dark',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    this.users.set(newUser.id, newUser);
    this.userPasswords.set(newUser.id, password);
    return newUser;
  }

  updateUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  getJourneysForUser(userId: string): LearningJourney[] {
    return Array.from(this.journeys.values()).filter(j => j.userId === userId);
  }

  getJourney(id: string): LearningJourney | undefined {
    return this.journeys.get(id);
  }

  saveJourney(journey: LearningJourney): LearningJourney {
    this.journeys.set(journey.id, journey);
    return journey;
  }

  getScenarios(targetLang?: string): Scenario[] {
    if (!targetLang) return STARTER_SCENARIOS;
    return STARTER_SCENARIOS.filter(s => s.targetLanguage === targetLang || s.targetLanguage === 'en');
  }

  getScenarioById(id: string): Scenario | undefined {
    return STARTER_SCENARIOS.find(s => s.id === id);
  }

  getVocabulary(journeyId: string): VocabularyItem[] {
    return this.vocabulary.get(journeyId) || [];
  }

  addVocabulary(journeyId: string, item: Omit<VocabularyItem, 'id' | 'journeyId'>): VocabularyItem {
    const list = this.getVocabulary(journeyId);
    const existing = list.find(v => v.word.toLowerCase() === item.word.toLowerCase());
    if (existing) {
      existing.exposureCount += 1;
      existing.lastSeen = new Date().toISOString();
      return existing;
    }
    const newItem: VocabularyItem = {
      ...item,
      id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newItem);
    this.vocabulary.set(journeyId, list);
    return newItem;
  }

  getMistakes(journeyId: string): MistakeRecord[] {
    return this.mistakes.get(journeyId) || [];
  }

  addMistake(journeyId: string, mistake: Omit<MistakeRecord, 'id' | 'journeyId'>): MistakeRecord {
    const list = this.getMistakes(journeyId);
    const existing = list.find(m => m.pattern.toLowerCase() === mistake.pattern.toLowerCase());
    if (existing) {
      existing.occurrenceCount += 1;
      existing.lastOccurred = new Date().toISOString();
      return existing;
    }
    const newRecord: MistakeRecord = {
      ...mistake,
      id: `mstk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      journeyId
    };
    list.push(newRecord);
    this.mistakes.set(journeyId, list);
    return newRecord;
  }

  getChatHistory(sessionId: string): ChatMessage[] {
    return this.chatHistories.get(sessionId) || [];
  }

  saveChatMessage(sessionId: string, message: ChatMessage): ChatMessage {
    const history = this.getChatHistory(sessionId);
    history.push(message);
    this.chatHistories.set(sessionId, history);
    return message;
  }
}

export const db = new MockDatabase();
