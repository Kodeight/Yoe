import { CourseUnit, Scenario } from '../types';

/**
 * COMPREHENSIVE CURRICULUM DATABASE: CEFR A1 TO C2
 * Complete structured curriculum with theoretical lessons, grammar rules,
 * vocabulary banks, interactive mini-games, and linked real-world practice scenarios.
 */

export const C1_C2_SCENARIOS: Scenario[] = [
  // ==========================================
  // CEFR C1: ADVANCED PROFESSIONAL & ACADEMIC
  // ==========================================
  {
    id: 'scen_c1_contract_dispute',
    title: 'High-Stakes Partnership Arbitration',
    description: 'Negotiate a complex cross-border joint venture contract revision, addressing liability caps and intellectual property licensing.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'C1',
    location: 'Arbitration Chamber, Paseo de la Castellana, Madrid',
    characterName: 'Yoe',
    characterRole: 'Lead Corporate Counsel',
    avatar: '⚖️',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['responsabilidad mancomunada', 'cláusula resolutoria', 'indemnización', 'arbitraje', 'jurisdicción'],
    initialGreeting: 'Buenos días, letrado. Antes de proceder a la mediación formal sobre el anexo de propiedad intelectual, ¿cuál es la postura de su representado respecto al tope de responsabilidad?',
    initialGreetingTranslation: 'Good morning, counselor. Before proceeding to the formal mediation on the intellectual property addendum, what is your client’s stance regarding the liability cap?',
    objectives: [
      { id: 'obj_c1_cd_1', text: 'State nuanced contractual counterproposal', completed: false, hint: 'Say: Nuestra posición es limitar la responsabilidad por daños consecuenciales al valor anual del contrato.' },
      { id: 'obj_c1_cd_2', text: 'Propose an alternative escrow arbitration clause', completed: false, hint: 'Say: Proponemos establecer un depósito en garantía condicionado al cumplimiento de los hitos técnicos.' },
      { id: 'obj_c1_cd_3', text: 'Synthesize the compromise agreement diplomatically', completed: false, hint: 'Say: Si acordamos esta salvaguarda mutua, considero que podremos redactar el acta de conformidad hoy mismo.' }
    ],
    lessonId: 'les_es_c1_1',
    relatedLessonTitle: 'High-Stakes Multi-Party Contract Negotiations',
    grammarFocus: ['Subjuntivo en oraciones concesivas y condicionales compuestas', 'Voz pasiva refleja e impersonalidad jurídica'],
    recommendedNextScenarioId: 'scen_c1_regulatory_hearing'
  },
  {
    id: 'scen_c1_regulatory_hearing',
    title: 'Municipal Environmental Compliance Hearing',
    description: 'Defend an infrastructure project before a municipal regulatory panel, presenting environmental mitigation audits.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'C1',
    location: 'Comisión de Medio Ambiente y Urbanismo, Valencia',
    characterName: 'Yoe',
    characterRole: 'Panel Chairperson',
    avatar: '🏛️',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['impacto ambiental', 'normativa comunitaria', 'mitigación de emisiones', 'auditoría', 'sostenibilidad'],
    initialGreeting: 'Tiene la palabra la delegación técnica. Hemos analizado el expediente preliminar, pero persisten dudas sustanciales sobre la gestión de residuos hídricos.',
    initialGreetingTranslation: 'The technical delegation has the floor. We have reviewed the preliminary file, but substantial questions remain regarding wastewater management.',
    objectives: [
      { id: 'obj_c1_reg_1', text: 'Present environmental certification and baseline metrics', completed: false, hint: 'Say: Los informes de auditoría externa demuestran una reducción neta del cuarenta por ciento en la huella hídrica.' },
      { id: 'obj_c1_reg_2', text: 'Detail remediation protocols under European directives', completed: false, hint: 'Say: Hemos implementado un sistema terciario de depuración conforme a la directiva comunitaria vigente.' },
      { id: 'obj_c1_reg_3', text: 'Request formal approval subject to quarterly oversight', completed: false, hint: 'Say: Solicitamos la emisión favorable del dictamen sujeta a verificaciones trimestrales independientes.' }
    ],
    lessonId: 'les_es_c1_2',
    relatedLessonTitle: 'Regulatory Frameworks, Compliance & Public Policy',
    grammarFocus: ['Perífrasis verbales de probabilidad y obligación deontológica', 'Nominalización estilística formal'],
    recommendedNextScenarioId: 'scen_c1_pr_crisis'
  },
  {
    id: 'scen_c1_pr_crisis',
    title: 'Corporate Crisis & Media Statement Briefing',
    description: 'Address journalist inquiries during a high-profile corporate security breach, communicating transparent reassurance.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'C1',
    location: 'Auditorio de Prensa Empresarial, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Senior Investigative Journalist',
    avatar: '🎙️',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['declaración institucional', 'protocolo de contingencia', 'integridad de datos', 'comunicado', 'transparencia'],
    initialGreeting: 'Portavoz, la opinión pública exige saber si los datos biométricos de los usuarios estuvieron expuestos y por qué se tardó 48 horas en emitir la alerta.',
    initialGreetingTranslation: 'Spokesperson, the public demands to know whether users’ biometric data was exposed and why it took 48 hours to issue the alert.',
    objectives: [
      { id: 'obj_c1_pr_1', text: 'Acknowledge public concern while maintaining composure', completed: false, hint: 'Say: Comprendemos plenamente la inquietud generada y queremos asegurar que nuestra prioridad absoluta es la seguridad.' },
      { id: 'obj_c1_pr_2', text: 'Clarify the exact scope of perimeter containment', completed: false, hint: 'Say: Las investigaciones forenses confirman que el núcleo de datos cifrados permaneció inviolable en todo momento.' },
      { id: 'obj_c1_pr_3', text: 'Outline restitution and consumer compensation roadmap', completed: false, hint: 'Say: Habilitamos desde hoy una línea prioritaria y auditorías gratuitas para todos los usuarios potencialmente afectados.' }
    ],
    lessonId: 'les_es_c1_3',
    relatedLessonTitle: 'Crisis Management & Executive Public Statements',
    grammarFocus: ['Estructuras de énfasis y focalización (lo que, fue entonces cuando)', 'Conectores concesivos de registro culto'],
    recommendedNextScenarioId: 'scen_c2_diplomatic_mediation'
  },

  // ==========================================
  // CEFR C2: NEAR-NATIVE RHETORIC & NUANCE
  // ==========================================
  {
    id: 'scen_c2_diplomatic_mediation',
    title: 'Cross-Border Diplomatic Summit Mediation',
    description: 'Mediate conflicting socio-economic policies between delegation leaders, reading subtext and formulating consensus phrasing.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'C2',
    location: 'Cumbre Iberoamericana, Palacio de Convenciones, Salamanca',
    characterName: 'Yoe',
    characterRole: 'Plenipotentiary Ambassador',
    avatar: '🌐',
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['declaración conjunta', 'consenso multilateral', 'salvaguardia', 'soberanía compartida', 'retórica'],
    initialGreeting: 'Estimado mediador, si la contraparte insiste en vincular las cuotas arancelarias a las cláusulas de transición energética, nos veremos abocados a suspender el plenario.',
    initialGreetingTranslation: 'Esteemed mediator, if the other party insists on linking tariff quotas to energy transition clauses, we will be forced to suspend the plenary.',
    objectives: [
      { id: 'obj_c2_dm_1', text: 'De-escalate diplomatic tension using subtle hedging', completed: false, hint: 'Say: Entiendo su legítima preocupación; no obstante, tal vez convendría disociar temporalmente ambos instrumentos para evitar un estancamiento indeseado.' },
      { id: 'obj_c2_dm_2', text: 'Propose nuanced bilateral roadmap phrasing', completed: false, hint: 'Say: Cabría redactar una cláusula de convergencia progresiva supeditada a revisiones bienales de mutuo acuerdo.' },
      { id: 'obj_c2_dm_3', text: 'Secure assent for the joint communiqué signature', completed: false, hint: 'Say: Confío en que este redactado equilibra con rigor las prioridades soberanas de ambas delegaciones.' }
    ],
    lessonId: 'les_es_c2_1',
    relatedLessonTitle: 'Diplomatic Mediation & High-Stakes Summit',
    grammarFocus: ['Condicional de cortesía y atenuación pragmática avanzada', 'Recursos estilísticos de diplomacia e ironía velada'],
    recommendedNextScenarioId: 'scen_c2_literary_salon'
  },
  {
    id: 'scen_c2_literary_salon',
    title: 'Literary & Philosophical Salon Discussion',
    description: 'Engage in sophisticated discourse on magical realism, existential irony, and metaphorical depth in modern Hispanic literature.',
    category: 'culture',
    targetLanguage: 'es',
    cefrLevel: 'C2',
    location: 'Ateneo Científico y Literario, Calle del Prado, Madrid',
    characterName: 'Yoe',
    characterRole: 'Literary Critic & Salon Host',
    avatar: '📚',
    imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['realismo mágico', 'metaficción', 'desasosiego', 'analogía', 'polifonía'],
    initialGreeting: 'Bienvenido a la tertulia. Sostenía Borges que la teología es una rama de la literatura fantástica. A la luz de la narrativa contemporánea, ¿sigue siendo la ironía el único baluarte contra el desengaño?',
    initialGreetingTranslation: 'Welcome to the salon. Borges maintained that theology is a branch of fantasy literature. In light of contemporary narrative, does irony remain the sole bulwark against disillusionment?',
    objectives: [
      { id: 'obj_c2_ls_1', text: 'Articulate philosophical critique with literary metaphors', completed: false, hint: 'Say: Lejos de ser un mero recurso escéptico, la ironía funciona aquí como un prisma que desentraña las contradicciones humanas.' },
      { id: 'obj_c2_ls_2', text: 'Contrast narrative polyphony with classical monologue', completed: false, hint: 'Say: La polifonía narrativa descentraliza la voz autoral, invitando al lector a participar en una ontología abierta.' },
      { id: 'obj_c2_ls_3', text: 'Synthesize cultural identity through prose rhythms', completed: false, hint: 'Say: En última instancia, la cadencia del texto refleja la tensión viva entre la memoria histórica y el mito fundacional.' }
    ],
    lessonId: 'les_es_c2_2',
    relatedLessonTitle: 'Irony, Subtext & Literary Critique',
    grammarFocus: ['Uso expresivo de figuras retóricas (oxímoron, quiasmo)', 'Prosodia y alternancia de registros estilísticos'],
    recommendedNextScenarioId: 'scen_c2_spontaneous_debate'
  },
  {
    id: 'scen_c2_spontaneous_debate',
    title: 'Live Television Debate on Heritage & Urban Modernity',
    description: 'Participate in a fast-paced televised roundtable, rebutting arguments with rhetorical precision, wit, and cultural depth.',
    category: 'culture',
    targetLanguage: 'es',
    cefrLevel: 'C2',
    location: 'Estudio Central de Televisión, Prado del Rey, Madrid',
    characterName: 'Yoe',
    characterRole: 'Debate Moderator',
    avatar: '📺',
    imageUrl: 'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['patrimonio histórico', 'gentrificación', 'tejido social', 'demografía', 'sostenibilidad'],
    initialGreeting: 'Estamos en directo. Su interlocutor acaba de calificar la preservación de cascos históricos como "nostalgia paralizante frente a la pujanza económica". Tiene sesenta segundos para su réplica.',
    initialGreetingTranslation: 'We are live on air. Your counter-debater just described historical district preservation as "paralyzing nostalgia facing economic vitality." You have sixty seconds for your rebuttal.',
    objectives: [
      { id: 'obj_c2_deb_1', text: 'Deliver sharp, structured rhetorical counter-argument', completed: false, hint: 'Say: Calificar de nostalgia lo que constituye el tejido vivo de nuestra memoria colectiva es confundir valor con precio de mercado.' },
      { id: 'obj_c2_deb_2', text: 'Present empirical contrast between sustainability and short-term speculation', completed: false, hint: 'Say: La verdadera pujanza económica no nace de la homogeneización turística, sino de la revitalización equilibrada de barrios patrimoniales.' },
      { id: 'obj_c2_deb_3', text: 'Conclude with a memorable rhetorical aphorism', completed: false, hint: 'Say: Una ciudad que arrasa con su pasado en nombre del porvenir no avanza, simplemente pierde el rumbo.' }
    ],
    lessonId: 'les_es_c2_3',
    relatedLessonTitle: 'Fast-Paced Live Media Debate & Spontaneous Rhetoric',
    grammarFocus: ['Inversión enfática y paralelismo sintáctico', 'Aforismos y modismos cultos de debate'],
    recommendedNextScenarioId: 'scen_c1_contract_dispute'
  }
];

export const COMPREHENSIVE_COURSES: CourseUnit[] = [
  // ==========================================
  // SPANISH A1: FOUNDATIONS & ESSENTIAL TRAVEL
  // ==========================================
  {
    id: 'unit_es_a1_1',
    unitNumber: 1,
    title: 'First Connections & Everyday Introductions',
    subtitle: 'Master basic greetings, sharing personal origin details, and forming your first sentences with Yoe.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '🤝',
    category: 'daily',
    description: 'Fundamental building blocks for meeting native speakers and introducing yourself.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_1_1',
        unitId: 'unit_es_a1_1',
        courseId: 'unit_es_a1_1',
        title: 'Greetings & Polite Formality',
        description: 'Understand formal vs informal greetings, time-of-day phrases, and polite conversation openers.',
        level: 'A1',
        category: 'daily',
        order: 1,
        durationMin: 3,
        xpReward: 25,
        type: 'theory',
        learningObjectives: ['Say hello and goodbye based on time of day', 'Ask how someone is doing', 'Distinguish tú vs usted'],
        grammarFocus: ['Verbo llamarse en presente', 'Tú vs Usted'],
        vocabularyList: [
          { word: 'Hola', translation: 'Hello', phonetic: 'OH-lah' },
          { word: 'Buenos días', translation: 'Good morning', phonetic: 'BWEH-nos DEE-ahs' },
          { word: 'Buenas tardes', translation: 'Good afternoon', phonetic: 'BWEH-nas TAR-des' },
          { word: 'Mucho gusto', translation: 'Nice to meet you', phonetic: 'MOO-choh GOOS-toh' },
          { word: '¿Cómo estás?', translation: 'How are you? (informal)', phonetic: 'KOH-moh es-TAHS' }
        ],
        theoryContent: {
          concept: 'Presenting Yourself and Greeting in Spanish',
          explanation: 'In Spanish, "Me llamo..." literally means "I call myself...". To ask someone else\'s name politely, you say "¿Cómo te llamas?" (informal) or "¿Cómo se llama usted?" (formal). Use "Buenos días" until lunch, "Buenas tardes" until nightfall, and "Buenas noches" at night.',
          examples: [
            { original: '¡Hola! Me llamo Sofia. ¿Cómo te llamas?', translation: 'Hello! My name is Sofia. What is your name?' },
            { original: 'Mucho gusto en conocerte.', translation: 'Nice to meet you.' },
            { original: 'Soy de Madrid, pero vivo en Barcelona.', translation: 'I am from Madrid, but I live in Barcelona.' }
          ],
          keyTakeaway: 'Use "Me llamo [name]" or "Soy [name]" to introduce yourself naturally in any situation.'
        },
        speakingScenarioId: 'scen_daily_first_meeting',
        practiceScenarioIds: ['scen_daily_first_meeting', 'scen_social_language_exchange']
      },
      {
        id: 'les_es_1_2',
        unitId: 'unit_es_a1_1',
        courseId: 'unit_es_a1_1',
        title: 'Vocabulary: Countries, Origin & Nationalities',
        description: 'Express your nationality, where you live, and ask others where they are from.',
        level: 'A1',
        category: 'daily',
        order: 2,
        durationMin: 4,
        xpReward: 30,
        type: 'vocabulary',
        learningObjectives: ['State your country of origin with "Soy de..."', 'Ask "¿De dónde eres?"', 'Identify major Spanish-speaking nations'],
        grammarFocus: ['Verbo Ser para origen: Yo soy de...', 'Género de nacionalidades'],
        miniGameData: {
          type: 'word_match',
          items: [
            { target: 'el país', match: 'country' },
            { target: 'la ciudad', match: 'city' },
            { target: '¿de dónde eres?', match: 'where are you from?' },
            { target: 'yo vivo en', match: 'I live in' },
            { target: 'mucho gusto', match: 'nice to meet you' }
          ]
        },
        speakingScenarioId: 'scen_social_language_exchange',
        practiceScenarioIds: ['scen_social_language_exchange']
      }
    ]
  },

  {
    id: 'unit_es_a1_2',
    unitNumber: 2,
    title: 'Travel Logistics & Airport Basics',
    subtitle: 'Confidently check in for flights, handle bag drop, navigate security, and board planes.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '✈️',
    category: 'travel',
    description: 'Essential phrases for smooth airport, boarding, and luggage transactions.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_a1_travel_airport',
        unitId: 'unit_es_a1_2',
        courseId: 'unit_es_a1_2',
        title: 'Airport Check-In & Luggage Handling',
        description: 'Understand airport terminology, request seat preferences, and confirm luggage allowances.',
        level: 'A1',
        category: 'travel',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'theory',
        learningObjectives: ['Present passport and booking reference', 'Request window or aisle seat', 'Confirm baggage check-in'],
        grammarFocus: ['Quisiera / Me gustaría + infinitivo', 'Hay / Dónde está'],
        vocabularyList: [
          { word: 'el pasaporte', translation: 'passport', phonetic: 'el pah-sah-POR-teh' },
          { word: 'la tarjeta de embarque', translation: 'boarding pass', phonetic: 'tahr-HEH-tah deh em-BAR-keh' },
          { word: 'el asiento de ventanilla', translation: 'window seat', phonetic: 'ah-SYEN-toh deh ven-tah-NEE-yah' },
          { word: 'el asiento de pasillo', translation: 'aisle seat', phonetic: 'ah-SYEN-toh deh pah-SEE-yoh' },
          { word: 'la maleta', translation: 'suitcase / luggage', phonetic: 'mah-LEH-tah' }
        ],
        theoryContent: {
          concept: 'Checking In at International Airports',
          explanation: 'When checking in at an airline counter in Spain or Latin America, greet the agent with "¡Buenos días!" and say "Quisiera facturar una maleta, por favor" (I would like to check in a bag, please). Use "asiento de ventanilla" for a window seat and "asiento de pasillo" for an aisle seat.',
          examples: [
            { original: 'Aquí tiene mi pasaporte y el código de reserva.', translation: 'Here is my passport and booking code.' },
            { original: '¿Prefiere ventanilla o pasillo?', translation: 'Do you prefer window or aisle?' },
            { original: 'Prefiero asiento de ventanilla, por favor.', translation: 'I prefer a window seat, please.' }
          ],
          keyTakeaway: 'Always open with "Quisiera..." or "¿Podría tener...?" for polite, fluent requests.'
        },
        speakingScenarioId: 'scen_travel_airport_checkin',
        practiceScenarioIds: ['scen_travel_airport_checkin', 'scen_travel_airport_security', 'scen_travel_boarding_flight']
      },
      {
        id: 'les_es_a1_hotel',
        unitId: 'unit_es_a1_2',
        courseId: 'unit_es_a1_2',
        title: 'Hotel Check-In & Accommodation Essentials',
        description: 'Confirm reservations, ask about WiFi and breakfast, and request quiet rooms.',
        level: 'A1',
        category: 'travel',
        order: 2,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Check in with reservation name', 'Ask about breakfast times and keycard', 'Inquire about WiFi password'],
        grammarFocus: ['Tener una reserva a nombre de...', '¿A qué hora es...?'],
        speakingScenarioId: 'scen_hotel_madrid',
        practiceScenarioIds: ['scen_hotel_madrid']
      }
    ]
  },

  {
    id: 'unit_es_a1_3',
    unitNumber: 3,
    title: 'Food, Tapas & Dining Out',
    subtitle: 'Order regional dishes, express preferences, and easily ask for the restaurant bill.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '🥘',
    category: 'dining',
    description: 'Enjoy Spain and Latin America’s vibrant culinary world with confidence.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_a1_tapas',
        unitId: 'unit_es_a1_3',
        courseId: 'unit_es_a1_3',
        title: 'Ordering Tapas & Drinks at Traditional Bars',
        description: 'Master the polite conditional "Para mí...", ask for recommendations, and request the bill.',
        level: 'A1',
        category: 'dining',
        order: 1,
        durationMin: 4,
        xpReward: 30,
        type: 'theory',
        learningObjectives: ['Order drinks and appetizers', 'Ask for house specialties', 'Politely request the bill (la cuenta)'],
        grammarFocus: ['Poner en imperativo cortés: ¿Me pone...?', 'Querer / Traer'],
        theoryContent: {
          concept: 'Ordering Tapas in Spanish Tabernas',
          explanation: 'In Spain, you often order at the counter or table by saying "¿Nos pone una ración de patatas bravas, por favor?". When ready to pay, catch the waiter’s eye and say "La cuenta, por favor".',
          examples: [
            { original: '¿Qué nos recomienda de la casa?', translation: 'What do you recommend as house specialty?' },
            { original: 'Una copa de vino tinto y un agua con gas.', translation: 'A glass of red wine and sparkling water.' },
            { original: '¿Nos trae la cuenta cuando pueda, por favor?', translation: 'Could you bring us the bill when you can, please?' }
          ],
          keyTakeaway: 'Use "Para mí..." or "¿Me pone...?" when ordering at bars and tabernas.'
        },
        speakingScenarioId: 'scen_dining_tapas_bar',
        practiceScenarioIds: ['scen_dining_tapas_bar', 'scen_social_dinner_friends']
      }
    ]
  },

  // ==========================================
  // SPANISH A2: EVERYDAY INDEPENDENCE & TRAVEL
  // ==========================================
  {
    id: 'unit_es_a2_1',
    unitNumber: 4,
    title: 'Describing Past Experiences & Weekends',
    subtitle: 'Narrate completed events, weekend outings, and memorable personal trips.',
    cefrLevel: 'A2',
    targetLanguage: 'es',
    icon: '📅',
    category: 'social',
    description: 'Learn the Pretérito Indefinido to share what you did yesterday or last week.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_a2_past_events',
        unitId: 'unit_es_a2_1',
        courseId: 'unit_es_a2_1',
        title: 'The Pretérito Indefinido: Talking About Yesterday',
        description: 'Form regular past tense verbs (-ar: -é, -aste, -ó; -er/-ir: -í, -iste, -ió) and key time markers.',
        level: 'A2',
        category: 'social',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'theory',
        learningObjectives: ['Narrate completed actions with ayer / el fin de semana pasado', 'Use regular -ar, -er, -ir past endings', 'Ask what someone did last weekend'],
        grammarFocus: ['Pretérito Indefinido regular', 'Marcadores temporales (ayer, anoche, el año pasado)'],
        theoryContent: {
          concept: 'Pretérito Perfecto Simple (Indefinido)',
          explanation: 'The Pretérito Indefinido describes actions completed at a specific point in the past. Regular endings for -AR verbs: hablé, hablaste, habló, hablamos, hablaron. For -ER/-IR: comí, comiste, comió, comimos, comieron.',
          examples: [
            { original: 'Ayer cené con unos amigos en Gràcia.', translation: 'Yesterday I had dinner with some friends in Gràcia.' },
            { original: '¿Qué hiciste el fin de semana pasado?', translation: 'What did you do last weekend?' },
            { original: 'Visité el Museo del Prado y caminé por el Retiro.', translation: 'I visited the Prado Museum and walked through El Retiro.' }
          ],
          keyTakeaway: 'Combine time markers like "ayer" or "la semana pasada" with the indefinido to tell stories.'
        },
        speakingScenarioId: 'scen_social_dinner_friends',
        practiceScenarioIds: ['scen_social_dinner_friends', 'scen_social_party_mingling']
      },
      {
        id: 'les_es_a2_health',
        unitId: 'unit_es_a2_1',
        courseId: 'unit_es_a2_1',
        title: 'Health, Symptoms & Medical Consultations',
        description: 'Describe bodily symptoms, pain intensity, and ask for pharmacy advice.',
        level: 'A2',
        category: 'practical',
        order: 2,
        durationMin: 5,
        xpReward: 35,
        type: 'theory',
        learningObjectives: ['Use "me duele / me duelen" with body parts', 'Describe fever, cough, and fatigue', 'Understand medication dosage instructions'],
        grammarFocus: ['Verbo doler (me duele / me duelen)', 'Tener + síntoma (tengo fiebre/gripe)'],
        theoryContent: {
          concept: 'Describing Pain with "Doler"',
          explanation: 'Like "gustar", "doler" agrees with the body part causing pain: "Me duele la cabeza" (singular) vs "Me duelen los ojos" (plural). To describe general ailments, use "Tengo fiebre" or "Estoy resfriado".',
          examples: [
            { original: 'Me duele mucho la garganta desde ayer.', translation: 'My throat hurts a lot since yesterday.' },
            { original: 'Tengo un poco de fiebre y dolor muscular.', translation: 'I have a mild fever and muscle aches.' },
            { original: '¿Tiene algún medicamento para el dolor de cabeza?', translation: 'Do you have any medication for headaches?' }
          ],
          keyTakeaway: 'Say "Me duele [singular]" or "Me duelen [plural]" when describing symptoms to a nurse or doctor.'
        },
        speakingScenarioId: 'scen_practical_feeling_sick',
        practiceScenarioIds: ['scen_practical_feeling_sick', 'scen_practical_urgent_clinic']
      }
    ]
  },

  // ==========================================
  // SPANISH B1: CONVERSATIONAL & PROFESSIONAL
  // ==========================================
  {
    id: 'unit_es_b1_1',
    unitNumber: 5,
    title: 'Workplace Syncs & Collaborative Projects',
    subtitle: 'Participate in agile standups, discuss sprint blockers, and resolve transit and apartment issues.',
    cefrLevel: 'B1',
    targetLanguage: 'es',
    icon: '💼',
    category: 'work',
    description: 'Communicate smoothly in professional tech environments and handle everyday service friction.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_b1_standup',
        unitId: 'unit_es_b1_1',
        courseId: 'unit_es_b1_1',
        title: 'Agile Team Standup & Sprint Updates',
        description: 'Provide a structured 90-second update: what you delivered, what you focus on today, and blockers.',
        level: 'B1',
        category: 'work',
        order: 1,
        durationMin: 6,
        xpReward: 40,
        type: 'theory',
        learningObjectives: ['Structure updates concisely with "Ayer completé...", "Hoy me enfocaré en..."', 'Flag technical blockers or need for review', 'Engage in constructive peer feedback'],
        grammarFocus: ['Pretérito Perfecto Compuesto vs Indefinido', 'Conectores de causa y consecuencia (dado que, por lo tanto)'],
        theoryContent: {
          concept: 'Delivering Professional Standup Updates',
          explanation: 'In modern tech teams in Spain and Latin America, standups follow a clear 3-part framework: 1) Achievements (Ayer finalicé...), 2) Today’s focus (Hoy estoy trabajando en...), 3) Blockers (No tengo bloqueos, solo necesitaré code review).',
          examples: [
            { original: 'Ayer completé la integración de la API y pasé las pruebas unitarias.', translation: 'Yesterday I finished the API integration and passed the unit tests.' },
            { original: 'Hoy me enfocaré en rediseñar la vista móvil.', translation: 'Today I will focus on redesigning the mobile view.' },
            { original: 'No tengo bloqueos técnicos por el momento.', translation: 'I have no technical blockers at the moment.' }
          ],
          keyTakeaway: 'Keep standup turns under 90 seconds, clear, and action-oriented.'
        },
        speakingScenarioId: 'scen_work_team_standup',
        practiceScenarioIds: ['scen_work_team_standup', 'scen_work_client_support']
      },
      {
        id: 'les_es_b1_transit_delays',
        unitId: 'unit_es_b1_1',
        courseId: 'unit_es_b1_1',
        title: 'Managing Flight Delays & Transit Desks',
        description: 'Politely inquire about connecting flight guarantees, rebooking, and meal compensation vouchers.',
        level: 'B1',
        category: 'travel',
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Inquire about delay causes and new departure time', 'Request guarantee for connecting flight', 'Ask about meal or accommodation vouchers'],
        grammarFocus: ['Condicional simple para peticiones formales: ¿Podría...?, ¿Sería posible...?'],
        speakingScenarioId: 'scen_travel_flight_delay',
        practiceScenarioIds: ['scen_travel_flight_delay', 'scen_practical_lost_passport']
      }
    ]
  },

  // ==========================================
  // SPANISH B2: PROFESSIONAL MASTERY
  // ==========================================
  {
    id: 'unit_es_b2_1',
    unitNumber: 6,
    title: 'Career Advancement, Interviews & Negotiation',
    subtitle: 'Excel in job interviews, negotiate freelance scope and rates, and handle executive deadlines.',
    cefrLevel: 'B2',
    targetLanguage: 'es',
    icon: '📈',
    category: 'work',
    description: 'High-level business communication for corporate and entrepreneurial environments.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_b2_interview',
        unitId: 'unit_es_b2_1',
        courseId: 'unit_es_b2_1',
        title: 'Job Interviewing: Career Narrative & Strengths',
        description: 'Frame achievements with the STAR method, articulate core professional strengths, and answer behavioral questions.',
        level: 'B2',
        category: 'work',
        order: 1,
        durationMin: 6,
        xpReward: 45,
        type: 'theory',
        learningObjectives: ['Summarize 3-5 years of career experience impactfully', 'Explain a past challenge and the resolution you spearheaded', 'Ask insightful questions about company culture and metrics'],
        grammarFocus: ['Subjuntivo en cláusulas adjetivales y sustantivas', 'Oraciones condicionales mixtas'],
        theoryContent: {
          concept: 'The Professional Interview Pitch',
          explanation: 'At B2 level, answer questions using the STAR framework (Situación, Tarea, Acción, Resultado). Use sophisticated verbs like "liderar", "optimizar", "desarrollar", and "conseguir". Frame weaknesses as areas of continuous growth.',
          examples: [
            { original: 'A lo largo de mi trayectoria he liderado la modernización de sistemas críticos.', translation: 'Throughout my career I have led the modernization of critical systems.' },
            { original: 'Ante una caída imprevista en el tráfico, implementamos un plan de contingencia.', translation: 'Faced with an unexpected traffic drop, we implemented a contingency plan.' },
            { original: '¿Cuáles son los principales objetivos estratégicos del equipo para este trimestre?', translation: 'What are the main strategic objectives for the team this quarter?' }
          ],
          keyTakeaway: 'Use concrete numbers and active leadership verbs to demonstrate value.'
        },
        speakingScenarioId: 'scen_work_job_interview',
        practiceScenarioIds: ['scen_work_job_interview', 'scen_work_contract_negotiation', 'scen_work_project_deadline']
      },
      {
        id: 'les_es_b2_negotiation',
        unitId: 'unit_es_b2_1',
        courseId: 'unit_es_b2_1',
        title: 'Contract Negotiation & Milestone Scoping',
        description: 'Negotiate project scope, hourly vs milestone rates, and align deadlines constructively.',
        level: 'B2',
        category: 'work',
        order: 2,
        durationMin: 5,
        xpReward: 45,
        type: 'speaking',
        learningObjectives: ['Defend the value and scope of project deliverables', 'Propose phased milestones and payment triggers', 'Establish formal agreement on revision rounds'],
        grammarFocus: ['Condicional compuesto para hipótesis no cumplidas', 'Conectores concesivos (a pesar de que, si bien)'],
        speakingScenarioId: 'scen_work_contract_negotiation',
        practiceScenarioIds: ['scen_work_contract_negotiation', 'scen_work_business_lunch']
      }
    ]
  },

  // ==========================================
  // SPANISH C1: ACADEMIC & STRATEGIC FLUENCY
  // ==========================================
  {
    id: 'unit_es_c1_1',
    unitNumber: 7,
    title: 'Institutional Diplomacy & Complex Negotiations',
    subtitle: 'Lead regulatory compliance hearings, cross-border corporate arbitration, and crisis communication.',
    cefrLevel: 'C1',
    targetLanguage: 'es',
    icon: '🏛️',
    category: 'work',
    description: 'Master formal, legal, and academic registers with rhetorical elegance and persuasion.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_c1_1',
        unitId: 'unit_es_c1_1',
        courseId: 'unit_es_c1_1',
        title: 'High-Stakes Multi-Party Contract Negotiations',
        description: 'Navigate complex legal covenants, liability caps, and dispute arbitration clauses with precision.',
        level: 'C1',
        category: 'work',
        order: 1,
        durationMin: 7,
        xpReward: 50,
        type: 'theory',
        learningObjectives: ['Formulate complex conditional counterproposals', 'Use nuanced legal jargon accurately', 'Facilitate consensus without conceding core interests'],
        grammarFocus: ['Subjuntivo imperfecto y pluscuamperfecto en contextos formales', 'Construcciones absolutas de participio'],
        theoryContent: {
          concept: 'Legal Arbitration & Institutional Registers',
          explanation: 'At C1 level, discourse requires syntactic complexity, formal hedging, and precise legal-technical vocabulary. Employ structures like "De convenir ambas partes en..." or "Habiéndose acreditado el cumplimiento...".',
          examples: [
            { original: 'Proponemos supeditar el desembolso a la validación formal de los requerimientos técnicos.', translation: 'We propose conditioning the disbursement on formal validation of the technical requirements.' },
            { original: 'Sin perjuicio de lo estipulado en la cláusula anterior, ambas partes convienen en mediar de buena fe.', translation: 'Without prejudice to what is stipulated in the preceding clause, both parties agree to mediate in good faith.' }
          ],
          keyTakeaway: 'Use precise legal connectors and nominalized phrasing for authoritative diplomacy.'
        },
        speakingScenarioId: 'scen_c1_contract_dispute',
        practiceScenarioIds: ['scen_c1_contract_dispute', 'scen_c1_regulatory_hearing']
      },
      {
        id: 'les_es_c1_2',
        unitId: 'unit_es_c1_1',
        courseId: 'unit_es_c1_1',
        title: 'Regulatory Frameworks, Compliance & Public Policy',
        description: 'Present environmental audits, defend infrastructure projects, and answer regulatory committees.',
        level: 'C1',
        category: 'work',
        order: 2,
        durationMin: 6,
        xpReward: 50,
        type: 'speaking',
        learningObjectives: ['Present technical baseline metrics to public commissions', 'Respond to scrutiny regarding community impact', 'Synthesize multi-faceted policy alignment'],
        grammarFocus: ['Perífrasis de obligación y probabilidad', 'Nominalización estilística'],
        speakingScenarioId: 'scen_c1_regulatory_hearing',
        practiceScenarioIds: ['scen_c1_regulatory_hearing', 'scen_c1_pr_crisis']
      }
    ]
  },

  // ==========================================
  // SPANISH C2: NEAR-NATIVE RHETORIC & NUANCE
  // ==========================================
  {
    id: 'unit_es_c2_1',
    unitNumber: 8,
    title: 'Near-Native Rhetoric, Subtext & Literary Discourse',
    subtitle: 'Participate in live media debates, literary salons, and diplomatic summits with effortless fluency.',
    cefrLevel: 'C2',
    targetLanguage: 'es',
    icon: '🎭',
    category: 'culture',
    description: 'Master idioms, irony, cultural subtext, and spontaneous rhetoric comparable to an educated native speaker.',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_c2_1',
        unitId: 'unit_es_c2_1',
        courseId: 'unit_es_c2_1',
        title: 'Diplomatic Mediation & High-Stakes Summit',
        description: 'Formulate delicate compromise phrasing in bilateral communiqués with exquisite cultural tact.',
        level: 'C2',
        category: 'work',
        order: 1,
        durationMin: 7,
        xpReward: 60,
        type: 'theory',
        learningObjectives: ['Read between the lines of diplomatic posturing', 'Formulate consensual bridge formulas that satisfy opposing delegations', 'De-escalate high-temperature disputes through rhetorical tact'],
        grammarFocus: ['Atenuación pragmática avanzada y lítote', 'Inversión estilística y fórmulas aforísticas'],
        theoryContent: {
          concept: 'Pragmatic Attenuation & Subtle Subtext',
          explanation: 'At C2 level, communication is defined by what remains unsaid as much as what is spoken. Masters of Spanish diplomacy use subtle modal verbs ("cabría plantear", "no dejaría de ser oportuno") and elegant litotes to reconcile opposing stances without confrontation.',
          examples: [
            { original: 'Cabría formular un principio de acuerdo que no menoscabe las legítimas pretensiones de ninguna de las partes.', translation: 'It might be appropriate to formulate a preliminary accord that does not undermine the legitimate claims of either party.' },
            { original: 'Lejos de suponer una renuncia, esta fórmula consagra una vía pragmática hacia el entendimiento mutuo.', translation: 'Far from implying a concession, this formula establishes a pragmatic path toward mutual understanding.' }
          ],
          keyTakeaway: 'Master understatement and refined pragmatic attenuation to build instant diplomatic consensus.'
        },
        speakingScenarioId: 'scen_c2_diplomatic_mediation',
        practiceScenarioIds: ['scen_c2_diplomatic_mediation', 'scen_c2_spontaneous_debate']
      },
      {
        id: 'les_es_c2_2',
        unitId: 'unit_es_c2_1',
        courseId: 'unit_es_c2_1',
        title: 'Irony, Subtext & Literary Critique',
        description: 'Analyze philosophical paradoxes, metaphorical depth, and Hispanic literary masters.',
        level: 'C2',
        category: 'culture',
        order: 2,
        durationMin: 6,
        xpReward: 60,
        type: 'speaking',
        learningObjectives: ['Debate philosophical and literary themes in contemporary Spanish literature', 'Employ irony and stylistic nuance effortlessly', 'Express profound aesthetic critiques without pause'],
        grammarFocus: ['Recursos estilísticos complejos', 'Prosodia y registros cultos'],
        speakingScenarioId: 'scen_c2_literary_salon',
        practiceScenarioIds: ['scen_c2_literary_salon', 'scen_c2_spontaneous_debate']
      },
      {
        id: 'les_es_c2_3',
        unitId: 'unit_es_c2_1',
        courseId: 'unit_es_c2_1',
        title: 'Fast-Paced Live Media Debate & Spontaneous Rhetoric',
        description: 'Rebut aggressive interviewers on live broadcast television with poise, humor, and irrefutable logic.',
        level: 'C2',
        category: 'culture',
        order: 3,
        durationMin: 6,
        xpReward: 60,
        type: 'speaking',
        learningObjectives: ['Rebut sophist arguments under strict television time limits', 'Frame counter-propositions with compelling cultural aphorisms', 'Maintain unassailable poise under hostile cross-examination'],
        grammarFocus: ['Paralelismos retóricos y antítesis', 'Humor sutil e ironía culta'],
        speakingScenarioId: 'scen_c2_spontaneous_debate',
        practiceScenarioIds: ['scen_c2_spontaneous_debate']
      }
    ]
  },

  // ==========================================
  // FRENCH A1 & A2 (CAFÉ CULTURE & TRAVEL)
  // ==========================================
  {
    id: 'unit_fr_1',
    unitNumber: 1,
    title: 'Café Culture & Parisian Life',
    subtitle: 'Order delicious pastries, coffee, and meals with authentic French phrasing.',
    cefrLevel: 'A1',
    targetLanguage: 'fr',
    icon: '🥐',
    category: 'dining',
    description: 'Master polite French conditional ordering at Parisian bistros and boulangeries.',
    isLocked: false,
    lessons: [
      {
        id: 'les_fr_1_1',
        unitId: 'unit_fr_1',
        courseId: 'unit_fr_1',
        title: 'Ordering at French Cafés',
        description: 'Master the polite conditional "Je voudrais..." and table etiquette.',
        level: 'A1',
        category: 'dining',
        order: 1,
        durationMin: 3,
        xpReward: 25,
        type: 'theory',
        learningObjectives: ['Say Bonjour before every request', 'Use "Je voudrais..." instead of "Je veux"', 'Ask for the bill with "L\'addition, s\'il vous plaît"'],
        grammarFocus: ['Conditionnel de politesse: Je voudrais', 'Articles partitifs (du, de la, des)'],
        theoryContent: {
          concept: 'Polite Requests in French',
          explanation: 'In French, always use "Je voudrais..." (I would like...) instead of "Je veux" (I want). End every request with "s\'il vous plaît" (please). Always say "Bonjour" when entering.',
          examples: [
            { original: 'Bonjour, je voudrais un café au lait, s\'il vous plaît.', translation: 'Hello, I would like a coffee with milk, please.' },
            { original: 'L\'addition, s\'il vous plaît.', translation: 'The bill, please.' }
          ],
          keyTakeaway: 'Say "Bonjour" before any request when entering a shop or café in France.'
        },
        speakingScenarioId: 'scen_cafe_paris',
        practiceScenarioIds: ['scen_cafe_paris']
      },
      {
        id: 'les_fr_1_2',
        unitId: 'unit_fr_1',
        courseId: 'unit_fr_1',
        title: 'Live Voice: Bistro in Paris',
        description: 'Order breakfast at Le Petit Café on Boulevard Saint-Germain with Yoe.',
        level: 'A1',
        category: 'dining',
        order: 2,
        durationMin: 5,
        xpReward: 50,
        type: 'speaking',
        learningObjectives: ['Greet the waiter warmly', 'Order coffee and croissant', 'Pay with card or cash'],
        speakingScenarioId: 'scen_cafe_paris',
        practiceScenarioIds: ['scen_cafe_paris']
      }
    ]
  },
  {
    id: 'unit_fr_a2',
    unitNumber: 2,
    title: 'In-Flight Assistance & Transit Navigation',
    subtitle: 'Find luggage storage on Air France flights and report lost property in Paris metro.',
    cefrLevel: 'A2',
    targetLanguage: 'fr',
    icon: '🛫',
    category: 'travel',
    description: 'Navigate flights, overhead compartments, and transit lost property desks.',
    isLocked: false,
    lessons: [
      {
        id: 'les_fr_a2_flight',
        unitId: 'unit_fr_a2',
        courseId: 'unit_fr_a2',
        title: 'Boarding the Flight & Cabin Help',
        description: 'Show boarding pass, find row number, ask to stow overhead baggage, and request water.',
        level: 'A2',
        category: 'travel',
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: 'speaking',
        learningObjectives: ['Show boarding pass and ask where seat is', 'Ask for assistance with overhead compartment', 'Politely request water or blanket'],
        speakingScenarioId: 'scen_travel_boarding_flight',
        practiceScenarioIds: ['scen_travel_boarding_flight', 'scen_practical_lost_phone']
      }
    ]
  },

  // ==========================================
  // ENGLISH B2 (PROFESSIONAL TECH & CAREER)
  // ==========================================
  {
    id: 'unit_en_b2',
    unitNumber: 1,
    title: 'Tech Innovations & Career Interviews',
    subtitle: 'Excel in international product engineering interviews and team onboarding.',
    cefrLevel: 'B2',
    targetLanguage: 'en',
    icon: '💼',
    category: 'work',
    description: 'Master corporate career narratives, system design discussion, and behavioral queries.',
    isLocked: false,
    lessons: [
      {
        id: 'les_en_b2_interview',
        unitId: 'unit_en_b2',
        courseId: 'unit_en_b2',
        title: 'Job Interview & Career Background',
        description: 'Present your professional skills, highlight relevant project deliverables, and answer situational questions.',
        level: 'B2',
        category: 'work',
        order: 1,
        durationMin: 5,
        xpReward: 40,
        type: 'speaking',
        learningObjectives: ['Summarize 3 years of software engineering experience', 'Explain how you resolved a tough technical blocker', 'Ask an insightful question about quarterly goals'],
        speakingScenarioId: 'scen_work_job_interview',
        practiceScenarioIds: ['scen_work_job_interview']
      }
    ]
  }
];
