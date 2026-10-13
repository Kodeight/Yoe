import { Scenario, CourseUnit } from '../types';

/**
 * COMPREHENSIVE MULTILINGUAL COURSES AND SCENARIOS
 * Full foundational and progressive curriculum for:
 * Russian (ru), Portuguese (pt), Turkish (tr), French (fr),
 * Arabic (ar), Italian (it), English (en), and Spanish (es).
 */

export const MULTILINGUAL_SCENARIOS: Scenario[] = [
  // =========================================================================
  // RUSSIAN (ru) SCENARIOS
  // =========================================================================
  {
    id: 'scen_ru_a1_greetings',
    title: 'First Meeting & Introductions',
    description: 'Meet Yoe in Moscow, introduce yourself in Russian, exchange names, and share where you are from.',
    category: 'social',
    targetLanguage: 'ru',
    cefrLevel: 'A1',
    location: 'Gorky Park, Moscow',
    characterName: 'Yoe',
    characterRole: 'Local Language Exchange Partner',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['здравствуйте', 'меня зовут', 'очень приятно', 'откуда вы', 'я из'],
    initialGreeting: 'Здравствуйте! Очень приятно познакомиться. Меня зовут Йое. А как вас зовут?',
    initialGreetingTranslation: 'Hello! Nice to meet you. My name is Yoe. And what is your name?',
    objectives: [
      { id: 'obj_ru_gr_1', text: 'Greet Yoe and introduce your name', completed: false, hint: 'Say: Здравствуйте! Меня зовут [ваше имя].' },
      { id: 'obj_ru_gr_2', text: 'State where you are from', completed: false, hint: 'Say: Я из Испании / Америки / Франции.' },
      { id: 'obj_ru_gr_3', text: 'Say that it is very nice to meet them', completed: false, hint: 'Say: Очень приятно познакомиться!' }
    ],
    lessonId: 'les_ru_a1_greetings',
    relatedLessonTitle: 'Russian Greetings & Personal Introductions',
    grammarFocus: ['Личные местоимения (я, вы, он, она)', 'Конструкция "Меня зовут"'],
    recommendedNextScenarioId: 'scen_ru_a1_cafe'
  },
  {
    id: 'scen_ru_a1_cafe',
    title: 'At the Moscow Coffee House',
    description: 'Order your morning coffee, choose a fresh pastry, and ask for the bill politely in Russian.',
    category: 'dining',
    targetLanguage: 'ru',
    cefrLevel: 'A1',
    location: 'Cozy Bakery & Café, Arbat Street, Moscow',
    characterName: 'Yoe',
    characterRole: 'Barista',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['кофе', 'капучино', 'круассан', 'пожалуйста', 'счёт'],
    initialGreeting: 'Добрый день! Добро пожаловать. Что для вас приготовить сегодня?',
    initialGreetingTranslation: 'Good day! Welcome. What can I prepare for you today?',
    objectives: [
      { id: 'obj_ru_cf_1', text: 'Order a coffee with milk or cappuccino', completed: false, hint: 'Say: Здравствуйте! Мне, пожалуйста, капучино.' },
      { id: 'obj_ru_cf_2', text: 'Order a croissant or pastry', completed: false, hint: 'Say: И один круассан, пожалуйста.' },
      { id: 'obj_ru_cf_3', text: 'Ask how much it costs or request the bill', completed: false, hint: 'Say: Сколько это стоит? / Можно счёт, пожалуйста?' }
    ],
    lessonId: 'les_ru_a1_cafe',
    relatedLessonTitle: 'Ordering Food & Drinks in Russian',
    grammarFocus: ['Конструкция "Мне, пожалуйста, ..."', 'Винительный падеж существительных'],
    recommendedNextScenarioId: 'scen_ru_a1_directions'
  },
  {
    id: 'scen_ru_a1_directions',
    title: 'Asking for Directions in the City',
    description: 'Ask a friendly passerby how to get to the nearest metro station and thank them for help.',
    category: 'daily',
    targetLanguage: 'ru',
    cefrLevel: 'A1',
    location: 'Red Square & Okhotny Ryad, Moscow',
    characterName: 'Yoe',
    characterRole: 'Helpful Muscovite',
    avatar: '🗺️',
    imageUrl: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['извините', 'где метро', 'прямо', 'направо', 'налево', 'спасибо'],
    initialGreeting: 'Здравствуйте! Вы ищете метро? Могу я вам помочь?',
    initialGreetingTranslation: 'Hello! Are you looking for the metro? Can I help you?',
    objectives: [
      { id: 'obj_ru_dir_1', text: 'Ask politely where the metro station is', completed: false, hint: 'Say: Извините, пожалуйста, где находится станция метро?' },
      { id: 'obj_ru_dir_2', text: 'Ask if it is far on foot', completed: false, hint: 'Say: Это далеко отсюда пешком?' },
      { id: 'obj_ru_dir_3', text: 'Thank them warmly for directions', completed: false, hint: 'Say: Большое спасибо за помощь!' }
    ],
    lessonId: 'les_ru_a1_directions',
    relatedLessonTitle: 'City Navigation & Directions',
    grammarFocus: ['Предложный падеж (в метро, на площади)', 'Наречия направления: прямо, направо, налево']
  },
  {
    id: 'scen_ru_a2_hotel',
    title: 'Hotel Check-In & Room Preferences',
    description: 'Check into your hotel room in Saint Petersburg, confirm breakfast times, and request Wi-Fi details.',
    category: 'travel',
    targetLanguage: 'ru',
    cefrLevel: 'A2',
    location: 'Boutique Hotel on Nevsky Prospekt, Saint Petersburg',
    characterName: 'Yoe',
    characterRole: 'Front Desk Concierge',
    avatar: '🏨',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['бронь', 'номер', 'ключ', 'паспорт', 'завтрак', 'вай-фай'],
    initialGreeting: 'Добрый вечер! Рады приветствовать вас в Санкт-Петербурге. У вас оформлено бронирование?',
    initialGreetingTranslation: 'Good evening! Happy to welcome you to Saint Petersburg. Do you have a reservation?',
    objectives: [
      { id: 'obj_ru_ht_1', text: 'Confirm reservation name and show passport', completed: false, hint: 'Say: Да, бронь на имя [ваше имя]. Вот мой паспорт.' },
      { id: 'obj_ru_ht_2', text: 'Ask about breakfast hours and location', completed: false, hint: 'Say: Подскажите, во сколько начинается завтрак?' },
      { id: 'obj_ru_ht_3', text: 'Request Wi-Fi password and room key card', completed: false, hint: 'Say: Какой пароль от вай-фая? Спасибо!' }
    ]
  },

  // =========================================================================
  // PORTUGUESE (pt) SCENARIOS
  // =========================================================================
  {
    id: 'scen_pt_a1_greetings',
    title: 'First Meeting & Welcome in Lisbon',
    description: 'Meet your language partner in Chiado, introduce yourself in Portuguese, and share your background.',
    category: 'social',
    targetLanguage: 'pt',
    cefrLevel: 'A1',
    location: 'Praça Luís de Camões, Lisbon',
    characterName: 'Yoe',
    characterRole: 'Local Host & Guide',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['olá', 'muito prazer', 'chamo-me', 'de onde é', 'sou de'],
    initialGreeting: 'Olá! Muito prazer em conhecer-te. Eu sou o Yoe. Como te chamas?',
    initialGreetingTranslation: 'Hello! Nice to meet you. I am Yoe. What is your name?',
    objectives: [
      { id: 'obj_pt_gr_1', text: 'Greet and give your name in Portuguese', completed: false, hint: 'Say: Olá! O meu nome é [seu nome]. Muito prazer!' },
      { id: 'obj_pt_gr_2', text: 'Tell where you are from', completed: false, hint: 'Say: Eu sou de Espanha / do Brasil / dos Estados Unidos.' },
      { id: 'obj_pt_gr_3', text: 'Express enthusiasm for learning Portuguese', completed: false, hint: 'Say: Estou a aprender português!' }
    ],
    lessonId: 'les_pt_a1_greetings',
    relatedLessonTitle: 'Portuguese Greetings & Introductions',
    recommendedNextScenarioId: 'scen_pt_a1_cafe'
  },
  {
    id: 'scen_pt_a1_cafe',
    title: 'Ordering Pastéis de Nata & Bica',
    description: 'Order traditional Portuguese coffee and pastéis de nata at a historical pastelaria in Belém.',
    category: 'dining',
    targetLanguage: 'pt',
    cefrLevel: 'A1',
    location: 'Pastelaria Tradicional, Belém, Lisbon',
    characterName: 'Yoe',
    characterRole: 'Pastelaria Barista',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['bica', 'café', 'pastel de nata', 'por favor', 'conta'],
    initialGreeting: 'Bom dia! O que vai desejar hoje? Temos pastéis de nata quentinhos!',
    initialGreetingTranslation: 'Good morning! What would you like today? We have warm pastéis de nata!',
    objectives: [
      { id: 'obj_pt_cf_1', text: 'Order an espresso and a pastel de nata', completed: false, hint: 'Say: Bom dia! Queria uma bica e dois pastéis de nata, por favor.' },
      { id: 'obj_pt_cf_2', text: 'Ask if cinnamon is available', completed: false, hint: 'Say: Tem canela, por favor?' },
      { id: 'obj_pt_cf_3', text: 'Ask for the bill and thank the server', completed: false, hint: 'Say: Quanto é tudo? A conta, por favor. Muito obrigado!' }
    ],
    lessonId: 'les_pt_a1_cafe',
    relatedLessonTitle: 'Café & Pastry Culture in Portugal'
  },

  // =========================================================================
  // TURKISH (tr) SCENARIOS
  // =========================================================================
  {
    id: 'scen_tr_a1_greetings',
    title: 'First Meeting & Greetings in Istanbul',
    description: 'Meet Yoe in Kadıköy, greet politely in Turkish, introduce yourself, and share your city of origin.',
    category: 'social',
    targetLanguage: 'tr',
    cefrLevel: 'A1',
    location: 'Moda Seaside Promenade, Kadıköy, Istanbul',
    characterName: 'Yoe',
    characterRole: 'Local Language Companion',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['merhaba', 'benim adım', 'memnun oldum', 'nerelisiniz', 'nasılsınız'],
    initialGreeting: 'Merhaba! Tanıştığımıza çok memnun oldum. Benim adım Yoe. Sizin adınız nedir?',
    initialGreetingTranslation: 'Hello! Very nice to meet you. My name is Yoe. What is your name?',
    objectives: [
      { id: 'obj_tr_gr_1', text: 'Return greeting and introduce your name', completed: false, hint: 'Say: Merhaba! Benim adım [adınız]. Memnun oldum.' },
      { id: 'obj_tr_gr_2', text: 'Share your home country or city', completed: false, hint: 'Say: Ben İspanya\'dan / Amerika\'dan geliyorum.' },
      { id: 'obj_tr_gr_3', text: 'Ask how they are doing in Turkish', completed: false, hint: 'Say: Nasılsınız? Türkçe öğreniyorum.' }
    ],
    lessonId: 'les_tr_a1_greetings',
    relatedLessonTitle: 'Turkish Greetings & Introductions',
    recommendedNextScenarioId: 'scen_tr_a1_cafe'
  },
  {
    id: 'scen_tr_a1_cafe',
    title: 'Turkish Coffee & Simit Order',
    description: 'Visit a traditional café overlooking the Bosphorus, order Turkish tea or coffee with fresh simit.',
    category: 'dining',
    targetLanguage: 'tr',
    cefrLevel: 'A1',
    location: 'Historical Çınaraltı Çay Bahçesi, Çengelköy, Istanbul',
    characterName: 'Yoe',
    characterRole: 'Tea Garden Host',
    avatar: '🫖',
    imageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['çay', 'türk kahvesi', 'simit', 'lütfen', 'hesap'],
    initialGreeting: 'Hoş geldiniz! Boğaz manzaralı masamıza buyurun. Ne içmek istersiniz?',
    initialGreetingTranslation: 'Welcome! Please take a seat with the Bosphorus view. What would you like to drink?',
    objectives: [
      { id: 'obj_tr_cf_1', text: 'Order a cup of tea or Turkish coffee', completed: false, hint: 'Say: Merhaba! Bir demli çay ve bir Türk kahvesi rica ederim.' },
      { id: 'obj_tr_cf_2', text: 'Specify sugar preference (orta / şekersiz)', completed: false, hint: 'Say: Kahve orta şekerli olsun, lütfen.' },
      { id: 'obj_tr_cf_3', text: 'Request the bill politely', completed: false, hint: 'Say: Hesap alabilir miyim, lütfen? Teşekkürler!' }
    ],
    lessonId: 'les_tr_a1_cafe',
    relatedLessonTitle: 'Tea & Coffee Culture in Turkey'
  },

  // =========================================================================
  // FRENCH (fr) SCENARIOS
  // =========================================================================
  {
    id: 'scen_fr_a1_greetings',
    title: 'First Meeting & Introductions in Paris',
    description: 'Meet Yoe by the Seine, introduce yourself in French, and practice everyday pleasantries.',
    category: 'social',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Jardin du Luxembourg, Paris',
    characterName: 'Yoe',
    characterRole: 'Parisian Host',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['bonjour', 'je m\'appelle', 'enchanté', 'd\'où venez-vous', 'je viens de'],
    initialGreeting: 'Bonjour ! Enchanté de faire votre connaissance. Je m\'appelle Yoe. Et vous, comment vous vous appelez ?',
    initialGreetingTranslation: 'Hello! Delighted to meet you. My name is Yoe. And you, what is your name?',
    objectives: [
      { id: 'obj_fr_gr_1', text: 'Greet and give your name in French', completed: false, hint: 'Say: Bonjour ! Je m\'appelle [votre nom]. Enchanté !' },
      { id: 'obj_fr_gr_2', text: 'State your home country or city', completed: false, hint: 'Say: Je viens d\'Espagne / des États-Unis / du Canada.' },
      { id: 'obj_fr_gr_3', text: 'Mention that you are learning French', completed: false, hint: 'Say: J\'apprends le français avec Yoe.' }
    ],
    lessonId: 'les_fr_a1_greetings',
    relatedLessonTitle: 'French Greetings & Personal Introductions',
    recommendedNextScenarioId: 'scen_fr_a1_cafe'
  },
  {
    id: 'scen_fr_a1_cafe',
    title: 'Ordering at a Traditional Parisian Bistro',
    description: 'Order café au lait, fresh croissants, and discuss menu specials on a Parisian terrace.',
    category: 'dining',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Café de Flore Terrace, Saint-Germain-des-Prés, Paris',
    characterName: 'Yoe',
    characterRole: 'Bistro Server',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['café', 'croissant', 's\'il vous plaît', 'l\'addition', 'merci'],
    initialGreeting: 'Bonjour Monsieur-Dame ! Installez-vous en terrasse. Que désirez-vous prendre ce matin ?',
    initialGreetingTranslation: 'Good morning! Please take a seat on the terrace. What would you like this morning?',
    objectives: [
      { id: 'obj_fr_cf_1', text: 'Order a café crème and a croissant', completed: false, hint: 'Say: Bonjour ! Je voudrais un café crème et un croissant, s\'il vous plaît.' },
      { id: 'obj_fr_cf_2', text: 'Ask for a glass of tap water', completed: false, hint: 'Say: Une carafe d\'eau aussi, s\'il vous plaît.' },
      { id: 'obj_fr_cf_3', text: 'Ask for the bill politely', completed: false, hint: 'Say: L\'addition, s\'il vous plaît. Merci beaucoup !' }
    ]
  },

  // =========================================================================
  // ARABIC (ar) SCENARIOS
  // =========================================================================
  {
    id: 'scen_ar_a1_greetings',
    title: 'First Meeting & Warm Arab Hospitality',
    description: 'Meet Yoe in Dubai, exchange traditional Arabic greetings, introduce yourself, and share your city.',
    category: 'social',
    targetLanguage: 'ar',
    cefrLevel: 'A1',
    location: 'Al Fahidi Historical Neighbourhood, Dubai',
    characterName: 'Yoe',
    characterRole: 'Cultural Host',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['مرحباً', 'اسمي', 'تشرفنا', 'من أين أنت', 'أنا من'],
    initialGreeting: 'أهلاً وسهلاً! مرحباً بك. أنا اسمي يوي، تشرفنا! ما اسمك الكريم؟',
    initialGreetingTranslation: 'Welcome! Hello to you. My name is Yoe, pleased to meet you! What is your name?',
    objectives: [
      { id: 'obj_ar_gr_1', text: 'Greet and state your name in Arabic', completed: false, hint: 'Say: أهلاً بك! اسمي [اسمك]، فرصة سعيدة.' },
      { id: 'obj_ar_gr_2', text: 'State where you are from', completed: false, hint: 'Say: أنا من إسبانيا / أمريكا / مصر.' },
      { id: 'obj_ar_gr_3', text: 'Say that you are studying Arabic', completed: false, hint: 'Say: أنا أتعلم اللغة العربية.' }
    ],
    lessonId: 'les_ar_a1_greetings',
    relatedLessonTitle: 'Arabic Greetings & Introductions'
  },
  {
    id: 'scen_ar_a1_cafe',
    title: 'Traditional Arabic Coffee & Dates',
    description: 'Experience Arabic coffee hospitality, order Karak tea or Gahwa with dates in a souk café.',
    category: 'dining',
    targetLanguage: 'ar',
    cefrLevel: 'A1',
    location: 'Souk Al Bahar Café, Dubai',
    characterName: 'Yoe',
    characterRole: 'Qahwa Master',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['قهوة عربية', 'شاي كرك', 'تمر', 'من فضلك', 'الحساب'],
    initialGreeting: 'يا هلا! تفضل بالجلوس. هل تحب القهوة العربية مع التمر أم شاي كرك؟',
    initialGreetingTranslation: 'Welcome! Please take a seat. Would you like Arabic coffee with dates or Karak tea?',
    objectives: [
      { id: 'obj_ar_cf_1', text: 'Order Arabic coffee or Karak tea', completed: false, hint: 'Say: من فضلك، أريد فنجان قهوة عربية مع التمر.' },
      { id: 'obj_ar_cf_2', text: 'Compliment the tea or hospitality', completed: false, hint: 'Say: لذيذ جداً، شكراً لك!' },
      { id: 'obj_ar_cf_3', text: 'Request the bill and thank the host', completed: false, hint: 'Say: الحساب من فضلك. جزاك الله خيراً!' }
    ]
  },

  // =========================================================================
  // ITALIAN (it) SCENARIOS
  // =========================================================================
  {
    id: 'scen_it_a1_greetings',
    title: 'First Meeting in Rome Piazza',
    description: 'Meet Yoe in Piazza Navona, greet in Italian, introduce yourself, and practice initial dialogue.',
    category: 'social',
    targetLanguage: 'it',
    cefrLevel: 'A1',
    location: 'Piazza Navona, Rome',
    characterName: 'Yoe',
    characterRole: 'Roman Language Exchange Partner',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['ciao', 'mi chiamo', 'piacere', 'di dove sei', 'sono di'],
    initialGreeting: 'Ciao! Piacere di conoscerti. Io mi chiamo Yoe. E tu come ti chiami?',
    initialGreetingTranslation: 'Hi! Nice to meet you. My name is Yoe. And what is your name?',
    objectives: [
      { id: 'obj_it_gr_1', text: 'Greet and give your name in Italian', completed: false, hint: 'Say: Ciao! Mi chiamo [tuo nome]. Molto piacere!' },
      { id: 'obj_it_gr_2', text: 'Tell where you are from', completed: false, hint: 'Say: Vengo dalla Spagna / dagli Stati Uniti.' },
      { id: 'obj_it_gr_3', text: 'Mention that you love Italy and are learning Italian', completed: false, hint: 'Say: Sto imparando l\'italiano con Yoe!' }
    ],
    lessonId: 'les_it_a1_greetings',
    relatedLessonTitle: 'Italian Greetings & Introductions'
  },
  {
    id: 'scen_it_a1_cafe',
    title: 'Espresso & Cornetto at the Bar',
    description: 'Step up to a Roman coffee bar counter, order your espresso or cappuccino with a pistachio cornetto.',
    category: 'dining',
    targetLanguage: 'it',
    cefrLevel: 'A1',
    location: 'Bar del Fico, Rome',
    characterName: 'Yoe',
    characterRole: 'Barista',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['cappuccino', 'cornetto', 'per favore', 'scontrino', 'grazie'],
    initialGreeting: 'Buongiorno! Cosa le preparo al banco? Abbiamo cornetti freschi al pistacchio!',
    initialGreetingTranslation: 'Good morning! What can I prepare for you at the counter? We have fresh pistachio croissants!',
    objectives: [
      { id: 'obj_it_cf_1', text: 'Order an espresso or cappuccino and a pastry', completed: false, hint: 'Say: Buongiorno! Un cappuccino e un cornetto, per favore.' },
      { id: 'obj_it_cf_2', text: 'Ask for a glass of sparkling or still water', completed: false, hint: 'Say: Anche un bicchiere d\'acqua naturale, grazie.' },
      { id: 'obj_it_cf_3', text: 'Ask how much it is and pay at the register', completed: false, hint: 'Say: Quanto viene? Posso pagare con la carta?' }
    ]
  },

  // =========================================================================
  // ENGLISH (en) SCENARIOS
  // =========================================================================
  {
    id: 'scen_en_a1_greetings',
    title: 'First Meeting & Getting to Know You',
    description: 'Meet Yoe in London, introduce yourself in English, exchange names, and discuss where you come from.',
    category: 'social',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Covent Garden Plaza, London',
    characterName: 'Yoe',
    characterRole: 'Conversation Partner',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['hello', 'my name is', 'nice to meet you', 'where are you from', 'i am from'],
    initialGreeting: 'Hello there! Lovely to meet you. My name is Yoe. What is your name?',
    initialGreetingTranslation: 'Hello there! Lovely to meet you. My name is Yoe. What is your name?',
    objectives: [
      { id: 'obj_en_gr_1', text: 'Greet Yoe and introduce yourself', completed: false, hint: 'Say: Hello! My name is [your name]. Nice to meet you too!' },
      { id: 'obj_en_gr_2', text: 'State your home country or city', completed: false, hint: 'Say: I am from Spain / Brazil / France.' },
      { id: 'obj_en_gr_3', text: 'Mention your goal for practicing English', completed: false, hint: 'Say: I want to practice speaking English every day.' }
    ],
    lessonId: 'les_en_a1_greetings',
    relatedLessonTitle: 'English Greetings & Introductions'
  },
  {
    id: 'scen_en_a1_cafe',
    title: 'Ordering at a Cozy Artisan Café',
    description: 'Order your morning flat white, oat milk, and a pastry at a London coffee shop.',
    category: 'dining',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Artisan Coffee Roasters, Soho, London',
    characterName: 'Yoe',
    characterRole: 'Barista',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['flat white', 'oat milk', 'pastry', 'receipt', 'card payment'],
    initialGreeting: 'Hi there! Good morning. What can I get started for you today?',
    initialGreetingTranslation: 'Hi there! Good morning. What can I get started for you today?',
    objectives: [
      { id: 'obj_en_cf_1', text: 'Order a coffee with milk preference', completed: false, hint: 'Say: Hi! Could I please have a flat white with oat milk?' },
      { id: 'obj_en_cf_2', text: 'Add a pastry or snack', completed: false, hint: 'Say: And one blueberry muffin to go, please.' },
      { id: 'obj_en_cf_3', text: 'Confirm contactless card payment', completed: false, hint: 'Say: Can I pay with contactless card? Thank you!' }
    ]
  },

  // =========================================================================
  // SPANISH (es) FOUNDATIONAL SCENARIOS (Ensures A1 greetings come before airport!)
  // =========================================================================
  {
    id: 'scen_es_a1_greetings',
    title: 'First Meeting & Introductions in Madrid',
    description: 'Meet Yoe in Retiro Park, introduce yourself in Spanish, exchange names, and share where you are from.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Parque del Buen Retiro, Madrid',
    characterName: 'Yoe',
    characterRole: 'Compañero de Conversación',
    avatar: '👋',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['hola', 'me llamo', 'mucho gusto', 'de dónde eres', 'soy de'],
    initialGreeting: '¡Hola! Qué gusto saludarte. Me llamo Yoe. ¿Cómo te llamas tú?',
    initialGreetingTranslation: 'Hello! Nice to meet you. My name is Yoe. What is your name?',
    objectives: [
      { id: 'obj_es_gr_1', text: 'Greet and give your name in Spanish', completed: false, hint: 'Say: ¡Hola! Me llamo [tu nombre]. ¡Mucho gusto!' },
      { id: 'obj_es_gr_2', text: 'Tell where you are from', completed: false, hint: 'Say: Soy de Inglaterra / Estados Unidos / Francia.' },
      { id: 'obj_es_gr_3', text: 'Say that you are happy to learn Spanish', completed: false, hint: 'Say: Estoy muy feliz de aprender español contigo.' }
    ],
    lessonId: 'les_es_a1_greetings',
    relatedLessonTitle: 'Spanish Greetings & Personal Introductions',
    recommendedNextScenarioId: 'scen_es_a1_cafe'
  },
  {
    id: 'scen_es_a1_cafe',
    title: 'Café con Leche y Churros',
    description: 'Order your morning coffee, churros con chocolate, and ask for the bill at a Madrid cafeteria.',
    category: 'dining',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Chocolatería San Ginés, Madrid',
    characterName: 'Yoe',
    characterRole: 'Camarero',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['café con leche', 'churros', 'azúcar', 'por favor', 'la cuenta'],
    initialGreeting: '¡Buenos días! Bienvenidos. ¿Qué les apetece tomar esta mañana?',
    initialGreetingTranslation: 'Good morning! Welcome. What would you like to have this morning?',
    objectives: [
      { id: 'obj_es_cf_1', text: 'Order a café con leche and churros', completed: false, hint: 'Say: ¡Buenos días! Quisiera un café con leche y una ración de churros, por favor.' },
      { id: 'obj_es_cf_2', text: 'Ask for sugar or water', completed: false, hint: 'Say: ¿Me puede traer un vaso de agua, por favor?' },
      { id: 'obj_es_cf_3', text: 'Ask for the bill and pay', completed: false, hint: 'Say: La cuenta cuando pueda, por favor. ¿Aceptan tarjeta?' }
    ]
  }
];

export const MULTILINGUAL_COURSES: CourseUnit[] = [
  // ==========================================
  // RUSSIAN (ru) COURSES
  // ==========================================
  {
    id: 'course_ru_a1_foundations',
    unitNumber: 1,
    title: 'Foundations of Russian: Greetings & Life',
    subtitle: 'Master the Russian Cyrillic basics, everyday greetings, and café conversations.',
    cefrLevel: 'A1',
    targetLanguage: 'ru',
    icon: '🇷🇺',
    category: 'social',
    description: 'Learn Cyrillic alphabet concepts, introductions, pleasantries, and ordering in Moscow.',
    isLocked: false,
    lessons: [
      {
        id: 'les_ru_a1_greetings',
        unitId: 'course_ru_a1_foundations',
        courseId: 'course_ru_a1_foundations',
        title: 'Greetings, Names & Where You Are From',
        description: 'Introduce yourself in Russian, say your name, and learn polite everyday courtesies.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Say Здравствуйте and Привет correctly', 'Introduce yourself with Меня зовут', 'Express your country with Я из...'],
        speakingScenarioId: 'scen_ru_a1_greetings',
        practiceScenarioIds: ['scen_ru_a1_greetings']
      },
      {
        id: 'les_ru_a1_cafe',
        unitId: 'course_ru_a1_foundations',
        courseId: 'course_ru_a1_foundations',
        title: 'Ordering Coffee, Food & Polite Requests',
        description: 'Order your morning coffee, fresh pastries, and request the check in Russian.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Use Мне, пожалуйста, ... to order food', 'Ask Сколько это стоит?', 'Say Спасибо большое'],
        speakingScenarioId: 'scen_ru_a1_cafe',
        practiceScenarioIds: ['scen_ru_a1_cafe']
      }
    ]
  },

  // ==========================================
  // PORTUGUESE (pt) COURSES
  // ==========================================
  {
    id: 'course_pt_a1_foundations',
    unitNumber: 1,
    title: 'Portuguese Foundations & Lisbon Daily Life',
    subtitle: 'Learn conversational Portuguese for everyday life, introductions, and pastelarias.',
    cefrLevel: 'A1',
    targetLanguage: 'pt',
    icon: '🇵🇹',
    category: 'social',
    description: 'Foundations of spoken Portuguese, pronunciation nuances, and ordering in Lisbon and Porto.',
    isLocked: false,
    lessons: [
      {
        id: 'les_pt_a1_greetings',
        unitId: 'course_pt_a1_foundations',
        courseId: 'course_pt_a1_foundations',
        title: 'Introductions & Everyday Pleasantries',
        description: 'Introduce yourself, greet people warmly, and state where you are from.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Say Olá and Muito prazer', 'Use Chamo-me / O meu nome é', 'State home country with Sou de...'],
        speakingScenarioId: 'scen_pt_a1_greetings',
        practiceScenarioIds: ['scen_pt_a1_greetings']
      },
      {
        id: 'les_pt_a1_cafe',
        unitId: 'course_pt_a1_foundations',
        courseId: 'course_pt_a1_foundations',
        title: 'At the Pastelaria: Coffee & Pastries',
        description: 'Order uma bica, pastéis de nata, and ask for the bill politely.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Use Queria ... por favor to order', 'Ask Quanto é? and A conta por favor', 'Express Obrigado / Obrigada'],
        speakingScenarioId: 'scen_pt_a1_cafe',
        practiceScenarioIds: ['scen_pt_a1_cafe']
      }
    ]
  },

  // ==========================================
  // TURKISH (tr) COURSES
  // ==========================================
  {
    id: 'course_tr_a1_foundations',
    unitNumber: 1,
    title: 'Turkish Foundations: Istanbul Conversations',
    subtitle: 'Master basic Turkish greetings, vowel harmony essentials, and tea garden orders.',
    cefrLevel: 'A1',
    targetLanguage: 'tr',
    icon: '🇹🇷',
    category: 'social',
    description: 'Essential Turkish phrases for meeting locals, ordering tea, and asking directions.',
    isLocked: false,
    lessons: [
      {
        id: 'les_tr_a1_greetings',
        unitId: 'course_tr_a1_foundations',
        courseId: 'course_tr_a1_foundations',
        title: 'Greetings, Name & Where You Are From',
        description: 'Exchange polite greetings in Turkish, introduce your name, and ask how someone is.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Say Merhaba and Tanıştığımıza memnun oldum', 'State Benim adım...', 'Ask Nasılsınız?'],
        speakingScenarioId: 'scen_tr_a1_greetings',
        practiceScenarioIds: ['scen_tr_a1_greetings']
      },
      {
        id: 'les_tr_a1_cafe',
        unitId: 'course_tr_a1_foundations',
        courseId: 'course_tr_a1_foundations',
        title: 'Tea & Coffee Culture in Turkey',
        description: 'Order çay, Türk kahvesi, and request the bill at Istanbul tea gardens.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Use ... rica ederim / alabilir miyim', 'Specify sugar level: sade, orta, şekerli', 'Ask Hesap lütfen'],
        speakingScenarioId: 'scen_tr_a1_cafe',
        practiceScenarioIds: ['scen_tr_a1_cafe']
      }
    ]
  },

  // ==========================================
  // FRENCH (fr) COURSES
  // ==========================================
  {
    id: 'course_fr_a1_foundations',
    unitNumber: 1,
    title: 'French Foundations: Parisian Life & Dining',
    subtitle: 'Learn natural French for meeting people, café culture, and everyday conversations.',
    cefrLevel: 'A1',
    targetLanguage: 'fr',
    icon: '🇫🇷',
    category: 'social',
    description: 'Essential French phrases, social etiquette, café ordering, and greetings.',
    isLocked: false,
    lessons: [
      {
        id: 'les_fr_a1_greetings',
        unitId: 'course_fr_a1_foundations',
        courseId: 'course_fr_a1_foundations',
        title: 'Greetings & Introductions',
        description: 'Greet politely with Bonjour, introduce yourself, and share your background.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Use Bonjour and Enchanté', 'Say Je m\'appelle...', 'State Je viens de...'],
        speakingScenarioId: 'scen_fr_a1_greetings',
        practiceScenarioIds: ['scen_fr_a1_greetings']
      },
      {
        id: 'les_fr_a1_cafe',
        unitId: 'course_fr_a1_foundations',
        courseId: 'course_fr_a1_foundations',
        title: 'Ordering at a Parisian Café Terrace',
        description: 'Order café au lait, croissants, and ask for the bill politely.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Use Je voudrais ... s\'il vous plaît', 'Ask for une carafe d\'eau', 'Request L\'addition s\'il vous plaît'],
        speakingScenarioId: 'scen_fr_a1_cafe',
        practiceScenarioIds: ['scen_fr_a1_cafe']
      }
    ]
  },

  // ==========================================
  // ARABIC (ar) COURSES
  // ==========================================
  {
    id: 'course_ar_a1_foundations',
    unitNumber: 1,
    title: 'Arabic Foundations: Greetings & Culture',
    subtitle: 'Master authentic Arabic greetings, hospitality, and café orders.',
    cefrLevel: 'A1',
    targetLanguage: 'ar',
    icon: '🇸🇦',
    category: 'social',
    description: 'Learn modern standard and spoken Arabic pleasantries, introductions, and coffee culture.',
    isLocked: false,
    lessons: [
      {
        id: 'les_ar_a1_greetings',
        unitId: 'course_ar_a1_foundations',
        courseId: 'course_ar_a1_foundations',
        title: 'Arabic Greetings & Introductions',
        description: 'Exchange Ahlan wa Sahlan and Marhaban, introduce your name and origin.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Say Marhaban and Ahlan wa Sahlan', 'State Ismi [your name]', 'Say Ana min...'],
        speakingScenarioId: 'scen_ar_a1_greetings',
        practiceScenarioIds: ['scen_ar_a1_greetings']
      },
      {
        id: 'les_ar_a1_cafe',
        unitId: 'course_ar_a1_foundations',
        courseId: 'course_ar_a1_foundations',
        title: 'Ordering Arabic Coffee & Tea',
        description: 'Order Gahwa, Karak tea, and dates with traditional courtesy.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Say Min fadlik', 'Order Qahwa arabiyya', 'Ask Al-hisab min fadlik'],
        speakingScenarioId: 'scen_ar_a1_cafe',
        practiceScenarioIds: ['scen_ar_a1_cafe']
      }
    ]
  },

  // ==========================================
  // ITALIAN (it) COURSES
  // ==========================================
  {
    id: 'course_it_a1_foundations',
    unitNumber: 1,
    title: 'Italian Foundations: Roman Life & Coffee',
    subtitle: 'Speak Italian with confidence in everyday greetings and bar orders.',
    cefrLevel: 'A1',
    targetLanguage: 'it',
    icon: '🇮🇹',
    category: 'social',
    description: 'Learn authentic Italian for introductions, café counter ordering, and pleasantries.',
    isLocked: false,
    lessons: [
      {
        id: 'les_it_a1_greetings',
        unitId: 'course_it_a1_foundations',
        courseId: 'course_it_a1_foundations',
        title: 'Italian Greetings & First Meeting',
        description: 'Greet with Ciao and Buongiorno, say your name, and express delight.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Say Ciao and Molto piacere', 'Use Mi chiamo...', 'State Vengo da...'],
        speakingScenarioId: 'scen_it_a1_greetings',
        practiceScenarioIds: ['scen_it_a1_greetings']
      },
      {
        id: 'les_it_a1_cafe',
        unitId: 'course_it_a1_foundations',
        courseId: 'course_it_a1_foundations',
        title: 'At the Italian Bar Counter',
        description: 'Order un cappuccino, cornetto al pistacchio, and pay at the register.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Use Vorrei ... per favore', 'Ask for un bicchiere d\'acqua', 'Say Quanto viene?'],
        speakingScenarioId: 'scen_it_a1_cafe',
        practiceScenarioIds: ['scen_it_a1_cafe']
      }
    ]
  },

  // ==========================================
  // ENGLISH (en) COURSES
  // ==========================================
  {
    id: 'course_en_a1_foundations',
    unitNumber: 1,
    title: 'English Foundations: First Steps & Daily Life',
    subtitle: 'Build confidence in conversational English for international communication.',
    cefrLevel: 'A1',
    targetLanguage: 'en',
    icon: '🇬🇧',
    category: 'social',
    description: 'Everyday greetings, introductions, café orders, and basic communication in English.',
    isLocked: false,
    lessons: [
      {
        id: 'les_en_a1_greetings',
        unitId: 'course_en_a1_foundations',
        courseId: 'course_en_a1_foundations',
        title: 'English Greetings & Introductions',
        description: 'Say hello, introduce your name and where you are from with ease.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Say Hello and Nice to meet you', 'Use My name is...', 'State I am from...'],
        speakingScenarioId: 'scen_en_a1_greetings',
        practiceScenarioIds: ['scen_en_a1_greetings']
      },
      {
        id: 'les_en_a1_cafe',
        unitId: 'course_en_a1_foundations',
        courseId: 'course_en_a1_foundations',
        title: 'Ordering at a Coffee Shop',
        description: 'Order your coffee, ask for milk options, and pay with card.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Use Could I please have...', 'Specify milk and size preferences', 'Say Can I pay by card?'],
        speakingScenarioId: 'scen_en_a1_cafe',
        practiceScenarioIds: ['scen_en_a1_cafe']
      }
    ]
  },

  // ==========================================
  // SPANISH (es) COURSES (Foundational Unit 1)
  // ==========================================
  {
    id: 'course_es_a1_foundations',
    unitNumber: 1,
    title: 'Fundamentos de Español: Saludos y Vida Diaria',
    subtitle: 'Domina las presentaciones, los saludos cotidianos y las conversaciones en cafeterías.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '🇪🇸',
    category: 'social',
    description: 'Aprende a presentarte, pedir en cafeterías y mantener tus primeras conversaciones en español.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_a1_greetings',
        unitId: 'course_es_a1_foundations',
        courseId: 'course_es_a1_foundations',
        title: 'Saludos y Presentaciones Personales',
        description: 'Saluda con confianza, di tu nombre y comparte tu país de origen.',
        level: 'A1',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Saludar con Hola y Mucho gusto', 'Usar Me llamo...', 'Decir Soy de...'],
        speakingScenarioId: 'scen_es_a1_greetings',
        practiceScenarioIds: ['scen_es_a1_greetings']
      },
      {
        id: 'les_es_a1_cafe',
        unitId: 'course_es_a1_foundations',
        courseId: 'course_es_a1_foundations',
        title: 'En la Cafetería: Pedir Café y Desayuno',
        description: 'Pide café con leche, tostadas o churros y solicita la cuenta educadamente.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Usar Quisiera / Me gustaría...', 'Pedir un vaso de agua', 'Pedir La cuenta por favor'],
        speakingScenarioId: 'scen_es_a1_cafe',
        practiceScenarioIds: ['scen_es_a1_cafe']
      }
    ]
  }
];
