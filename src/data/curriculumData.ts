import { CourseUnit, LanguageCode } from '../types';

export const STARTER_COURSE_UNITS: CourseUnit[] = [
  {
    id: 'unit_es_1',
    unitNumber: 1,
    title: 'First Connections & Introductions',
    subtitle: 'Master basic greetings, sharing personal details, and forming your first sentences.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '🤝',
    lessons: [
      {
        id: 'les_es_1_1',
        unitId: 'unit_es_1',
        title: 'Theory: Greetings & Self-Introduction',
        description: 'Understand how Spanish speakers greet each other formally and informally.',
        type: 'theory',
        durationMin: 3,
        xpReward: 20,
        theoryContent: {
          concept: 'Presenting Yourself in Spanish',
          explanation: 'In Spanish, "Me llamo..." literally means "I call myself...". To ask someone else\'s name politely, you say "¿Cómo te llamas?" (informal) or "¿Cómo se llama usted?" (formal).',
          examples: [
            { original: '¡Hola! Me llamo Halim. ¿Cómo te llamas?', translation: 'Hello! My name is Halim. What is your name?' },
            { original: 'Mucho gusto en conocerte.', translation: 'Nice to meet you.' },
            { original: 'Soy de Madrid, pero vivo en Barcelona.', translation: 'I am from Madrid, but I live in Barcelona.' }
          ],
          keyTakeaway: 'Use "Me llamo [name]" or "Soy [name]" to introduce yourself with confidence.'
        }
      },
      {
        id: 'les_es_1_2',
        unitId: 'unit_es_1',
        title: 'Vocabulary: Essential Personal Details',
        description: 'Learn words for countries, occupations, hobbies, and origin.',
        type: 'vocabulary',
        durationMin: 4,
        xpReward: 25,
        miniGameData: {
          type: 'word_match',
          items: [
            { target: 'el nombre', match: 'name' },
            { target: 'el país', match: 'country' },
            { target: 'mucho gusto', match: 'nice to meet you' },
            { target: '¿de dónde eres?', match: 'where are you from?' },
            { target: 'hasta luego', match: 'see you later' }
          ]
        }
      },
      {
        id: 'les_es_1_3',
        unitId: 'unit_es_1',
        title: 'Grammar: Ser vs. Estar Fundamentals',
        description: 'Understand the fundamental difference between identity (Ser) and state/location (Estar).',
        type: 'grammar',
        durationMin: 4,
        xpReward: 25,
        theoryContent: {
          concept: 'Ser (Identity/Origin) vs. Estar (State/Location)',
          explanation: 'Use SER for permanent traits, identity, and origin ("Soy estudiante", "Soy de España"). Use ESTAR for temporary conditions, feelings, and locations ("Estoy feliz", "Estoy en la cafetería").',
          examples: [
            { original: 'Yo soy de México.', translation: 'I am from Mexico. (Origin -> Ser)' },
            { original: 'Yo estoy en el hotel.', translation: 'I am in the hotel. (Location -> Estar)' },
            { original: 'Ella es doctora y está lista.', translation: 'She is a doctor (Ser) and is ready (Estar).' }
          ],
          keyTakeaway: 'Ser for WHAT/WHO you are. Estar for HOW/WHERE you are right now.'
        }
      },
      {
        id: 'les_es_1_4',
        unitId: 'unit_es_1',
        title: 'Listening: Natural Dialogue Comprehension',
        description: 'Listen to a friendly local introducing themselves and test your comprehension.',
        type: 'listening',
        durationMin: 3,
        xpReward: 30,
        quizQuestions: [
          {
            id: 'q_es_listen_1',
            type: 'listening',
            question: 'What does Yoe ask in this phrase?',
            audioText: '¡Hola! Me llamo Yoe. ¿De dónde eres tú?',
            options: [
              'What is your job?',
              'Where are you from?',
              'How old are you?',
              'What time is it?'
            ],
            correctOptionIndex: 1,
            explanation: '"¿De dónde eres tú?" translates directly to "Where are you from?".'
          },
          {
            id: 'q_es_listen_2',
            type: 'listening',
            question: 'Select the best polite response:',
            audioText: 'Mucho gusto en conocerte.',
            options: [
              'El gusto es mío.',
              'Tengo veinticinco años.',
              'No me gusta.',
              'Hasta ayer.'
            ],
            correctOptionIndex: 0,
            explanation: '"El gusto es mío" (The pleasure is mine) is the authentic courteous reply to "Mucho gusto".'
          }
        ]
      },
      {
        id: 'les_es_1_5',
        unitId: 'unit_es_1',
        title: 'Quiz: Introduction Mastery Check',
        description: 'Test your grasp of phrases, grammar, and appropriate responses.',
        type: 'quiz',
        durationMin: 5,
        xpReward: 35,
        quizQuestions: [
          {
            id: 'q_quiz_1',
            type: 'multiple_choice',
            question: 'How do you say "My name is Carlos and I am from Valencia" in Spanish?',
            options: [
              'Me llamo Carlos y soy de Valencia.',
              'Estoy Carlos y estoy de Valencia.',
              'Tengo Carlos y vivo a Valencia.',
              'Soy Carlos y estoy por Valencia.'
            ],
            correctOptionIndex: 0,
            explanation: '"Me llamo Carlos y soy de Valencia" correctly utilizes "Me llamo" for name and "soy de" for origin.'
          },
          {
            id: 'q_quiz_2',
            type: 'fill_blank',
            question: 'Complete the sentence: "Yo _____ muy contento de conocerte hoy."',
            options: ['estoy', 'soy', 'tengo', 'hago'],
            correctOptionIndex: 0,
            explanation: 'Emotional states and current feelings require ESTAR ("estoy muy contento").'
          },
          {
            id: 'q_quiz_3',
            type: 'true_false',
            question: 'True or False: "Mucho gusto" is only used when saying goodbye.',
            options: ['True', 'False'],
            correctOptionIndex: 1,
            explanation: 'False! "Mucho gusto" is used when meeting someone for the first time ("Nice to meet you").'
          }
        ]
      },
      {
        id: 'les_es_1_6',
        unitId: 'unit_es_1',
        title: 'Mini Game: Sentence Builder',
        description: 'Reconstruct fluent Spanish phrases in correct syntactic order.',
        type: 'mini_game',
        durationMin: 3,
        xpReward: 30,
        miniGameData: {
          type: 'sentence_builder',
          targetSentence: 'Hola me llamo María y soy diseñadora',
          sentenceTranslation: 'Hello my name is Maria and I am a designer',
          wordsPool: ['María', 'Hola', 'diseñadora', 'me', 'y', 'llamo', 'soy', 'en']
        }
      },
      {
        id: 'les_es_1_7',
        unitId: 'unit_es_1',
        title: 'Speaking: Live Roleplay with Yoe',
        description: 'Put your knowledge into live spoken conversation with Yoe in the cafe scenario.',
        type: 'speaking',
        durationMin: 5,
        xpReward: 50,
        speakingScenarioId: 'scen_a1_intro_maya'
      },
      {
        id: 'les_es_1_8',
        unitId: 'unit_es_1',
        title: 'Review: Adaptive Memory & Mastery',
        description: 'Solidify your vocabulary and grammar patterns through spaced repetition.',
        type: 'review',
        durationMin: 4,
        xpReward: 40
      }
    ]
  },
  {
    id: 'unit_es_2',
    unitNumber: 2,
    title: 'Café, Dining & Polite Requests',
    subtitle: 'Order food, ask for recommendations, navigate menus, and settle checks politely.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '☕',
    lessons: [
      {
        id: 'les_es_2_1',
        unitId: 'unit_es_2',
        title: 'Theory: Ordering Food Politely',
        description: 'Master polite phrasing with "Quisiera", "¿Me pone...?", and "¿Cuánto cuesta?".',
        type: 'theory',
        durationMin: 3,
        xpReward: 20,
        theoryContent: {
          concept: 'Authentic Spanish Café Requests',
          explanation: 'Instead of translating "I want" directly with "Quiero", native Spanish speakers frequently use "Quisiera..." (I would like) or "¿Me puede traer...?" (Could you bring me...).',
          examples: [
            { original: 'Por favor, ¿me trae un café con leche y un cruasán?', translation: 'Please, could you bring me a coffee with milk and a croissant?' },
            { original: 'La cuenta, por favor.', translation: 'The bill, please.' },
            { original: '¿Tienen opciones vegetarianas?', translation: 'Do you have vegetarian options?' }
          ],
          keyTakeaway: 'Use "Por favor, quisiera..." or "Para mí, un..." for natural dining orders.'
        }
      },
      {
        id: 'les_es_2_2',
        unitId: 'unit_es_2',
        title: 'Vocabulary: Foods, Drinks & Numbers',
        description: 'Common culinary terms, drinks, and numbers for bills.',
        type: 'vocabulary',
        durationMin: 4,
        xpReward: 25,
        miniGameData: {
          type: 'word_match',
          items: [
            { target: 'la cuenta', match: 'the bill' },
            { target: 'el camarero', match: 'waiter' },
            { target: 'sin azúcar', match: 'without sugar' },
            { target: 'el desayuno', match: 'breakfast' },
            { target: 'delicioso', match: 'delicious' }
          ]
        }
      },
      {
        id: 'les_es_2_3',
        unitId: 'unit_es_2',
        title: 'Speaking: Order at Bistro & Café',
        description: 'Practice ordering your morning meal with Yoe at a traditional café.',
        type: 'speaking',
        durationMin: 5,
        xpReward: 50,
        speakingScenarioId: 'scen_cafe_paris'
      }
    ]
  },
  {
    id: 'unit_es_3',
    unitNumber: 3,
    title: 'Hotel Check-In & Travel Logistics',
    subtitle: 'Handle room reservations, inquiries about amenities, and navigation.',
    cefrLevel: 'A2',
    targetLanguage: 'es',
    icon: '🏨',
    lessons: [
      {
        id: 'les_es_3_1',
        unitId: 'unit_es_3',
        title: 'Theory: Inquiring about Services',
        description: 'Express questions about WiFi, keys, schedules, and luggage storage.',
        type: 'theory',
        durationMin: 3,
        xpReward: 25,
        theoryContent: {
          concept: 'Hotel Logistics & Politeness',
          explanation: 'When checking in, say "Tengo una reserva a nombre de [your name]". To ask about schedule or services, use "¿A qué hora es el desayuno?" or "¿Cuál es la contraseña del WiFi?".',
          examples: [
            { original: 'Buenas tardes, tengo una reserva a nombre de Halim.', translation: 'Good afternoon, I have a reservation under the name Halim.' },
            { original: '¿En qué piso está la habitación?', translation: 'On which floor is the room?' },
            { original: '¿Puedo dejar mi equipaje aquí?', translation: 'May I leave my luggage here?' }
          ],
          keyTakeaway: '"A nombre de..." is the universal phrase for hotel and restaurant reservations.'
        }
      },
      {
        id: 'les_es_3_2',
        unitId: 'unit_es_3',
        title: 'Speaking: Hotel Check-In Madrid',
        description: 'Interact with Yoe as the hotel receptionist to check in smoothly.',
        type: 'speaking',
        durationMin: 5,
        xpReward: 50,
        speakingScenarioId: 'scen_hotel_checkin_madrid'
      }
    ]
  }
];

export function getUnitsForLanguage(langCode?: LanguageCode): CourseUnit[] {
  // If target language is Spanish, return Spanish units; for others, adapt dynamically
  const target = langCode || 'es';
  if (target === 'es') {
    return STARTER_COURSE_UNITS;
  }

  // Create customized language units for the selected target language
  return [
    {
      id: `unit_${target}_1`,
      unitNumber: 1,
      title: 'Foundations & Introductions',
      subtitle: `Master essential greetings, introductions, and everyday phrases in ${target.toUpperCase()}.`,
      cefrLevel: 'A1',
      targetLanguage: target,
      icon: '🤝',
      lessons: [
        {
          id: `les_${target}_1_1`,
          unitId: `unit_${target}_1`,
          title: 'Theory: Core Greetings & Polite Phrases',
          description: `Learn how to introduce yourself and greet native ${target.toUpperCase()} speakers.`,
          type: 'theory',
          durationMin: 3,
          xpReward: 20,
          theoryContent: {
            concept: `Essential Introductions in ${target.toUpperCase()}`,
            explanation: `Speaking a new language starts with clear greetings, introducing your name, and basic polite exchanges.`,
            examples: [
              { original: 'Hello! My name is...', translation: 'Universal polite greeting' },
              { original: 'Nice to meet you.', translation: 'Polite acquaintance' },
              { original: 'Where are you from?', translation: 'Asking origin' }
            ],
            keyTakeaway: 'Confidence starts with simple, accurate greetings and authentic pronunciation.'
          }
        },
        {
          id: `les_${target}_1_2`,
          unitId: `unit_${target}_1`,
          title: 'Vocabulary: Everyday Essentials',
          description: 'Acquire high-frequency vocabulary for social interactions.',
          type: 'vocabulary',
          durationMin: 4,
          xpReward: 25,
          miniGameData: {
            type: 'word_match',
            items: [
              { target: 'Greeting', match: 'Hello' },
              { target: 'Gratitude', match: 'Thank you' },
              { target: 'Farewell', match: 'Goodbye' },
              { target: 'Polite request', match: 'Please' },
              { target: 'Agreement', match: 'Yes, perfect' }
            ]
          }
        },
        {
          id: `les_${target}_1_3`,
          unitId: `unit_${target}_1`,
          title: 'Speaking: Live Conversation with Yoe',
          description: `Practice natural conversation with Yoe in ${target.toUpperCase()}.`,
          type: 'speaking',
          durationMin: 5,
          xpReward: 50,
          speakingScenarioId: 'scen_a1_intro_maya'
        }
      ]
    }
  ];
}
