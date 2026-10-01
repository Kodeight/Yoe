import { Language, Scenario, User, LearningJourney, VocabularyItem, MistakeRecord, ChatMessage, CompetencyState } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' }
];

export const STARTER_SCENARIOS: Scenario[] = [
  // A1: Level Scenarios (Foundational communication)
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
      { id: 'obj_fr_1', text: 'Choose seating preference', completed: false, hint: 'Say: Une table en terrasse, s\'il vous plaît.' },
      { id: 'obj_fr_2', text: 'Order a croissant and hot coffee', completed: false, hint: 'Say: Je voudrais un croissant et un café, s\'il vous plaît.' },
      { id: 'obj_fr_3', text: 'Ask for the bill politely', completed: false, hint: 'Say: L\'addition, s\'il vous plaît.' }
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
      { id: 'obj_ar_1', text: 'Ask for fresh fruit politely', completed: false, hint: 'Say: أريد برتقالاً من فضلك.' },
      { id: 'obj_ar_2', text: 'Ask how much one kilo costs', completed: false, hint: 'Say: كم سعر الكيلو؟' },
      { id: 'obj_ar_3', text: 'Say thank you and goodbye', completed: false, hint: 'Say: شكراً جزيلاً، مع السلامة.' }
    ]
  },
  {
    id: 'scen_directions_london',
    title: 'Asking for Directions in the City',
    description: 'Find your way to the nearest subway station or landmark by asking locals on the street.',
    category: 'travel',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Covent Garden, Central London',
    characterName: 'Sarah',
    characterRole: 'Helpful Local Resident',
    avatar: '🗺️',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['excuse me', 'straight ahead', 'turn left', 'subway station', 'near'],
    initialGreeting: 'Hello! You look like you might need some help finding your way. Where are you trying to go?',
    objectives: [
      { id: 'obj_dir_1', text: 'Ask where the nearest tube station is', completed: false, hint: 'Say: Excuse me, where is the nearest underground station?' },
      { id: 'obj_dir_2', text: 'Clarify if it is within walking distance', completed: false, hint: 'Say: Can I walk there, or should I take a bus?' },
      { id: 'obj_dir_3', text: 'Thank Sarah for her directions', completed: false, hint: 'Say: Thank you so much for your help!' }
    ]
  },

  // A2: Travel, Dining & Practical Scenarios
  {
    id: 'scen_airport_01',
    title: 'At the Airport Terminal',
    description: 'Practice travel conversations, passport control, and finding your departure gate.',
    category: 'travel',
    targetLanguage: 'en',
    cefrLevel: 'A2',
    location: 'London Heathrow Airport Terminal 5',
    characterName: 'Officer Davies',
    characterRole: 'Border Control & Information Officer',
    avatar: '🛫',
    imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['boarding pass', 'gate number', 'luggage', 'customs', 'delayed'],
    initialGreeting: 'Good day! Passport and boarding pass please. Where are you traveling to today?',
    objectives: [
      { id: 'obj_air_1', text: 'State your destination and flight purpose', completed: false, hint: 'Say: I am flying to Paris for vacation.' },
      { id: 'obj_air_2', text: 'Ask where to find gate or baggage claim', completed: false, hint: 'Say: Excuse me, which way to Gate 14?' },
      { id: 'obj_air_3', text: 'Confirm departure time', completed: false, hint: 'Say: Is the flight on time?' }
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
      { id: 'obj_es_3', text: 'Inquire about keycard or room floor', completed: false, hint: 'Say: ¿En qué piso está la habitación?' }
    ]
  },
  {
    id: 'scen_restaurant_rome',
    title: 'Dinner at a Roman Trattoria',
    description: 'Order authentic regional pasta, ask for house wine pairings, and comment on the meal in Italian.',
    category: 'dining',
    targetLanguage: 'it',
    cefrLevel: 'A2',
    location: 'Trattoria da Enzo, Trastevere, Rome',
    characterName: 'Matteo',
    characterRole: 'Host & Sommelier',
    avatar: '🍝',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['pasta', 'vino della casa', 'delizioso', 'il conto', 'consiglio'],
    initialGreeting: 'Buonasera e benvenuti a Roma! Abbiamo piatti speciali oggi. Desidera accomodarsi?',
    objectives: [
      { id: 'obj_it_1', text: 'Ask for recommendations on fresh pasta', completed: false, hint: 'Say: Quale pasta fresca mi consiglia?' },
      { id: 'obj_it_2', text: 'Order wine or sparkling water', completed: false, hint: 'Say: Vorrei un bicchiere di vino rosso e acqua naturale.' },
      { id: 'obj_it_3', text: 'Compliment the chef and request the bill', completed: false, hint: 'Say: Era tutto delizioso! Il conto, per favore.' }
    ]
  },
  {
    id: 'scen_shopping_tokyo',
    title: 'Boutique Shopping in Shibuya',
    description: 'Ask for different sizes, try on clothes, and inquire about discounts or tax-free purchases.',
    category: 'shopping',
    targetLanguage: 'en',
    cefrLevel: 'A2',
    location: 'Shibuya Fashion Mall, Tokyo',
    characterName: 'Kenji',
    characterRole: 'Boutique Stylist',
    avatar: '🛍️',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['size', 'fitting room', 'discount', 'try on', 'receipt'],
    initialGreeting: 'Welcome! Feel free to look around. Let me know if you need another size or color.',
    objectives: [
      { id: 'obj_shop_1', text: 'Ask if they have an item in a medium or large size', completed: false, hint: 'Say: Excuse me, do you have this in medium?' },
      { id: 'obj_shop_2', text: 'Ask where the fitting room is located', completed: false, hint: 'Say: Where can I try this on?' },
      { id: 'obj_shop_3', text: 'Confirm payment method (card or cash)', completed: false, hint: 'Say: Do you accept credit cards?' }
    ]
  },

  // B1: Professional, Problem-solving & Conversational Mastery
  {
    id: 'scen_work_meeting',
    title: 'Cross-Functional Team Meeting',
    description: 'Present project status updates, negotiate deadlines, and propose innovative ideas in English.',
    category: 'work',
    targetLanguage: 'en',
    cefrLevel: 'B1',
    location: 'Innovation Tech Hub, London',
    characterName: 'Elena Rostova',
    characterRole: 'Senior Product Lead',
    avatar: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['deadline', 'milestone', 'priorities', 'proposal', 'deliverables'],
    initialGreeting: 'Thanks for joining today\'s sync. Let\'s review our Q3 launch milestones. Could you share your update?',
    objectives: [
      { id: 'obj_biz_1', text: 'Provide a structured summary of your progress', completed: false, hint: 'Say: Over the past week, we completed the primary phase and tested deliverables.' },
      { id: 'obj_biz_2', text: 'Address a challenge or request more time', completed: false, hint: 'Say: We noticed a bottleneck, so we might need two more days to finalize QA.' },
      { id: 'obj_biz_3', text: 'Propose a collaborative next action step', completed: false, hint: 'Say: Let\'s schedule a follow-up review on Friday.' }
    ]
  },
  {
    id: 'scen_travel_problem',
    title: 'Resolving a Lost Baggage Issue',
    description: 'Describe your lost luggage clearly, provide baggage claim details, and request immediate tracking.',
    category: 'travel',
    targetLanguage: 'en',
    cefrLevel: 'B1',
    location: 'Lost & Found Service Desk',
    characterName: 'Agent Miller',
    characterRole: 'Customer Relations Representative',
    avatar: '🧳',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['lost baggage', 'description', 'claim tag', 'delivery address', 'tracking number'],
    initialGreeting: 'I understand your suitcase did not appear on the carousel. Please don\'t worry. Let\'s file a report.',
    objectives: [
      { id: 'obj_prob_1', text: 'Describe your suitcase appearance and color in detail', completed: false, hint: 'Say: It is a dark blue hard-case suitcase with four wheels and a red tag.' },
      { id: 'obj_prob_2', text: 'Provide flight number and claim tag number', completed: false, hint: 'Say: My flight was BA245 from Madrid, tag number 89402.' },
      { id: 'obj_prob_3', text: 'Give temporary hotel delivery address and phone number', completed: false, hint: 'Say: Please deliver it to Hotel Central at 42 Victoria Street.' }
    ]
  }
];

// Clean In-Memory data store (starts completely pristine, no fake users or progress)
export class CleanMemoryDatabase {
  private users: Map<string, User> = new Map();
  private userPasswords: Map<string, string> = new Map();
  private journeys: Map<string, LearningJourney> = new Map();
  private vocabulary: Map<string, VocabularyItem[]> = new Map();
  private mistakes: Map<string, MistakeRecord[]> = new Map();
  private chatHistories: Map<string, ChatMessage[]> = new Map();

  constructor() {
    // Fresh startup: zero fake accounts, zero fake streaks, zero fake vocabulary.
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
    if (stored === password) {
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
    const directMatches = STARTER_SCENARIOS.filter(s => s.targetLanguage === targetLang);
    if (directMatches.length > 0) return directMatches;
    return STARTER_SCENARIOS;
  }

  getScenarioById(id: string): Scenario | undefined {
    return STARTER_SCENARIOS.find(s => s.id === id);
  }

  getVocabulary(journeyId: string): VocabularyItem[] {
    return this.vocabulary.get(journeyId) || [];
  }

  addVocabulary(journeyId: string, item: Omit<VocabularyItem, 'id' | 'journeyId'>): VocabularyItem {
    let list = this.vocabulary.get(journeyId);
    if (!list) {
      list = [];
      this.vocabulary.set(journeyId, list);
    }
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
    return newItem;
  }

  getMistakes(journeyId: string): MistakeRecord[] {
    return this.mistakes.get(journeyId) || [];
  }

  addMistake(journeyId: string, mistake: Omit<MistakeRecord, 'id' | 'journeyId'>): MistakeRecord {
    let list = this.mistakes.get(journeyId);
    if (!list) {
      list = [];
      this.mistakes.set(journeyId, list);
    }
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
    return newRecord;
  }

  getChatHistory(sessionId: string): ChatMessage[] {
    return this.chatHistories.get(sessionId) || [];
  }

  saveChatMessage(sessionId: string, message: ChatMessage): ChatMessage {
    let history = this.chatHistories.get(sessionId);
    if (!history) {
      history = [];
      this.chatHistories.set(sessionId, history);
    }
    history.push(message);
    return message;
  }
}

export const db = new CleanMemoryDatabase();
