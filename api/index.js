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

// src/server/curriculumLibrary.ts
var C1_C2_SCENARIOS = [
  // ==========================================
  // CEFR C1: ADVANCED PROFESSIONAL & ACADEMIC
  // ==========================================
  {
    id: "scen_c1_contract_dispute",
    title: "High-Stakes Partnership Arbitration",
    description: "Negotiate a complex cross-border joint venture contract revision, addressing liability caps and intellectual property licensing.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "C1",
    location: "Arbitration Chamber, Paseo de la Castellana, Madrid",
    characterName: "Yoe",
    characterRole: "Lead Corporate Counsel",
    avatar: "\u2696\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["responsabilidad mancomunada", "cl\xE1usula resolutoria", "indemnizaci\xF3n", "arbitraje", "jurisdicci\xF3n"],
    initialGreeting: "Buenos d\xEDas, letrado. Antes de proceder a la mediaci\xF3n formal sobre el anexo de propiedad intelectual, \xBFcu\xE1l es la postura de su representado respecto al tope de responsabilidad?",
    initialGreetingTranslation: "Good morning, counselor. Before proceeding to the formal mediation on the intellectual property addendum, what is your client\u2019s stance regarding the liability cap?",
    objectives: [
      { id: "obj_c1_cd_1", text: "State nuanced contractual counterproposal", completed: false, hint: "Say: Nuestra posici\xF3n es limitar la responsabilidad por da\xF1os consecuenciales al valor anual del contrato." },
      { id: "obj_c1_cd_2", text: "Propose an alternative escrow arbitration clause", completed: false, hint: "Say: Proponemos establecer un dep\xF3sito en garant\xEDa condicionado al cumplimiento de los hitos t\xE9cnicos." },
      { id: "obj_c1_cd_3", text: "Synthesize the compromise agreement diplomatically", completed: false, hint: "Say: Si acordamos esta salvaguarda mutua, considero que podremos redactar el acta de conformidad hoy mismo." }
    ],
    lessonId: "les_es_c1_1",
    relatedLessonTitle: "High-Stakes Multi-Party Contract Negotiations",
    grammarFocus: ["Subjuntivo en oraciones concesivas y condicionales compuestas", "Voz pasiva refleja e impersonalidad jur\xEDdica"],
    recommendedNextScenarioId: "scen_c1_regulatory_hearing"
  },
  {
    id: "scen_c1_regulatory_hearing",
    title: "Municipal Environmental Compliance Hearing",
    description: "Defend an infrastructure project before a municipal regulatory panel, presenting environmental mitigation audits.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "C1",
    location: "Comisi\xF3n de Medio Ambiente y Urbanismo, Valencia",
    characterName: "Yoe",
    characterRole: "Panel Chairperson",
    avatar: "\u{1F3DB}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["impacto ambiental", "normativa comunitaria", "mitigaci\xF3n de emisiones", "auditor\xEDa", "sostenibilidad"],
    initialGreeting: "Tiene la palabra la delegaci\xF3n t\xE9cnica. Hemos analizado el expediente preliminar, pero persisten dudas sustanciales sobre la gesti\xF3n de residuos h\xEDdricos.",
    initialGreetingTranslation: "The technical delegation has the floor. We have reviewed the preliminary file, but substantial questions remain regarding wastewater management.",
    objectives: [
      { id: "obj_c1_reg_1", text: "Present environmental certification and baseline metrics", completed: false, hint: "Say: Los informes de auditor\xEDa externa demuestran una reducci\xF3n neta del cuarenta por ciento en la huella h\xEDdrica." },
      { id: "obj_c1_reg_2", text: "Detail remediation protocols under European directives", completed: false, hint: "Say: Hemos implementado un sistema terciario de depuraci\xF3n conforme a la directiva comunitaria vigente." },
      { id: "obj_c1_reg_3", text: "Request formal approval subject to quarterly oversight", completed: false, hint: "Say: Solicitamos la emisi\xF3n favorable del dictamen sujeta a verificaciones trimestrales independientes." }
    ],
    lessonId: "les_es_c1_2",
    relatedLessonTitle: "Regulatory Frameworks, Compliance & Public Policy",
    grammarFocus: ["Per\xEDfrasis verbales de probabilidad y obligaci\xF3n deontol\xF3gica", "Nominalizaci\xF3n estil\xEDstica formal"],
    recommendedNextScenarioId: "scen_c1_pr_crisis"
  },
  {
    id: "scen_c1_pr_crisis",
    title: "Corporate Crisis & Media Statement Briefing",
    description: "Address journalist inquiries during a high-profile corporate security breach, communicating transparent reassurance.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "C1",
    location: "Auditorio de Prensa Empresarial, Barcelona",
    characterName: "Yoe",
    characterRole: "Senior Investigative Journalist",
    avatar: "\u{1F399}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["declaraci\xF3n institucional", "protocolo de contingencia", "integridad de datos", "comunicado", "transparencia"],
    initialGreeting: "Portavoz, la opini\xF3n p\xFAblica exige saber si los datos biom\xE9tricos de los usuarios estuvieron expuestos y por qu\xE9 se tard\xF3 48 horas en emitir la alerta.",
    initialGreetingTranslation: "Spokesperson, the public demands to know whether users\u2019 biometric data was exposed and why it took 48 hours to issue the alert.",
    objectives: [
      { id: "obj_c1_pr_1", text: "Acknowledge public concern while maintaining composure", completed: false, hint: "Say: Comprendemos plenamente la inquietud generada y queremos asegurar que nuestra prioridad absoluta es la seguridad." },
      { id: "obj_c1_pr_2", text: "Clarify the exact scope of perimeter containment", completed: false, hint: "Say: Las investigaciones forenses confirman que el n\xFAcleo de datos cifrados permaneci\xF3 inviolable en todo momento." },
      { id: "obj_c1_pr_3", text: "Outline restitution and consumer compensation roadmap", completed: false, hint: "Say: Habilitamos desde hoy una l\xEDnea prioritaria y auditor\xEDas gratuitas para todos los usuarios potencialmente afectados." }
    ],
    lessonId: "les_es_c1_3",
    relatedLessonTitle: "Crisis Management & Executive Public Statements",
    grammarFocus: ["Estructuras de \xE9nfasis y focalizaci\xF3n (lo que, fue entonces cuando)", "Conectores concesivos de registro culto"],
    recommendedNextScenarioId: "scen_c2_diplomatic_mediation"
  },
  // ==========================================
  // CEFR C2: NEAR-NATIVE RHETORIC & NUANCE
  // ==========================================
  {
    id: "scen_c2_diplomatic_mediation",
    title: "Cross-Border Diplomatic Summit Mediation",
    description: "Mediate conflicting socio-economic policies between delegation leaders, reading subtext and formulating consensus phrasing.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "C2",
    location: "Cumbre Iberoamericana, Palacio de Convenciones, Salamanca",
    characterName: "Yoe",
    characterRole: "Plenipotentiary Ambassador",
    avatar: "\u{1F310}",
    imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["declaraci\xF3n conjunta", "consenso multilateral", "salvaguardia", "soberan\xEDa compartida", "ret\xF3rica"],
    initialGreeting: "Estimado mediador, si la contraparte insiste en vincular las cuotas arancelarias a las cl\xE1usulas de transici\xF3n energ\xE9tica, nos veremos abocados a suspender el plenario.",
    initialGreetingTranslation: "Esteemed mediator, if the other party insists on linking tariff quotas to energy transition clauses, we will be forced to suspend the plenary.",
    objectives: [
      { id: "obj_c2_dm_1", text: "De-escalate diplomatic tension using subtle hedging", completed: false, hint: "Say: Entiendo su leg\xEDtima preocupaci\xF3n; no obstante, tal vez convendr\xEDa disociar temporalmente ambos instrumentos para evitar un estancamiento indeseado." },
      { id: "obj_c2_dm_2", text: "Propose nuanced bilateral roadmap phrasing", completed: false, hint: "Say: Cabr\xEDa redactar una cl\xE1usula de convergencia progresiva supeditada a revisiones bienales de mutuo acuerdo." },
      { id: "obj_c2_dm_3", text: "Secure assent for the joint communiqu\xE9 signature", completed: false, hint: "Say: Conf\xEDo en que este redactado equilibra con rigor las prioridades soberanas de ambas delegaciones." }
    ],
    lessonId: "les_es_c2_1",
    relatedLessonTitle: "Diplomatic Mediation & High-Stakes Summit",
    grammarFocus: ["Condicional de cortes\xEDa y atenuaci\xF3n pragm\xE1tica avanzada", "Recursos estil\xEDsticos de diplomacia e iron\xEDa velada"],
    recommendedNextScenarioId: "scen_c2_literary_salon"
  },
  {
    id: "scen_c2_literary_salon",
    title: "Literary & Philosophical Salon Discussion",
    description: "Engage in sophisticated discourse on magical realism, existential irony, and metaphorical depth in modern Hispanic literature.",
    category: "culture",
    targetLanguage: "es",
    cefrLevel: "C2",
    location: "Ateneo Cient\xEDfico y Literario, Calle del Prado, Madrid",
    characterName: "Yoe",
    characterRole: "Literary Critic & Salon Host",
    avatar: "\u{1F4DA}",
    imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["realismo m\xE1gico", "metaficci\xF3n", "desasosiego", "analog\xEDa", "polifon\xEDa"],
    initialGreeting: "Bienvenido a la tertulia. Sosten\xEDa Borges que la teolog\xEDa es una rama de la literatura fant\xE1stica. A la luz de la narrativa contempor\xE1nea, \xBFsigue siendo la iron\xEDa el \xFAnico baluarte contra el desenga\xF1o?",
    initialGreetingTranslation: "Welcome to the salon. Borges maintained that theology is a branch of fantasy literature. In light of contemporary narrative, does irony remain the sole bulwark against disillusionment?",
    objectives: [
      { id: "obj_c2_ls_1", text: "Articulate philosophical critique with literary metaphors", completed: false, hint: "Say: Lejos de ser un mero recurso esc\xE9ptico, la iron\xEDa funciona aqu\xED como un prisma que desentra\xF1a las contradicciones humanas." },
      { id: "obj_c2_ls_2", text: "Contrast narrative polyphony with classical monologue", completed: false, hint: "Say: La polifon\xEDa narrativa descentraliza la voz autoral, invitando al lector a participar en una ontolog\xEDa abierta." },
      { id: "obj_c2_ls_3", text: "Synthesize cultural identity through prose rhythms", completed: false, hint: "Say: En \xFAltima instancia, la cadencia del texto refleja la tensi\xF3n viva entre la memoria hist\xF3rica y el mito fundacional." }
    ],
    lessonId: "les_es_c2_2",
    relatedLessonTitle: "Irony, Subtext & Literary Critique",
    grammarFocus: ["Uso expresivo de figuras ret\xF3ricas (ox\xEDmoron, quiasmo)", "Prosodia y alternancia de registros estil\xEDsticos"],
    recommendedNextScenarioId: "scen_c2_spontaneous_debate"
  },
  {
    id: "scen_c2_spontaneous_debate",
    title: "Live Television Debate on Heritage & Urban Modernity",
    description: "Participate in a fast-paced televised roundtable, rebutting arguments with rhetorical precision, wit, and cultural depth.",
    category: "culture",
    targetLanguage: "es",
    cefrLevel: "C2",
    location: "Estudio Central de Televisi\xF3n, Prado del Rey, Madrid",
    characterName: "Yoe",
    characterRole: "Debate Moderator",
    avatar: "\u{1F4FA}",
    imageUrl: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["patrimonio hist\xF3rico", "gentrificaci\xF3n", "tejido social", "demograf\xEDa", "sostenibilidad"],
    initialGreeting: 'Estamos en directo. Su interlocutor acaba de calificar la preservaci\xF3n de cascos hist\xF3ricos como "nostalgia paralizante frente a la pujanza econ\xF3mica". Tiene sesenta segundos para su r\xE9plica.',
    initialGreetingTranslation: 'We are live on air. Your counter-debater just described historical district preservation as "paralyzing nostalgia facing economic vitality." You have sixty seconds for your rebuttal.',
    objectives: [
      { id: "obj_c2_deb_1", text: "Deliver sharp, structured rhetorical counter-argument", completed: false, hint: "Say: Calificar de nostalgia lo que constituye el tejido vivo de nuestra memoria colectiva es confundir valor con precio de mercado." },
      { id: "obj_c2_deb_2", text: "Present empirical contrast between sustainability and short-term speculation", completed: false, hint: "Say: La verdadera pujanza econ\xF3mica no nace de la homogeneizaci\xF3n tur\xEDstica, sino de la revitalizaci\xF3n equilibrada de barrios patrimoniales." },
      { id: "obj_c2_deb_3", text: "Conclude with a memorable rhetorical aphorism", completed: false, hint: "Say: Una ciudad que arrasa con su pasado en nombre del porvenir no avanza, simplemente pierde el rumbo." }
    ],
    lessonId: "les_es_c2_3",
    relatedLessonTitle: "Fast-Paced Live Media Debate & Spontaneous Rhetoric",
    grammarFocus: ["Inversi\xF3n enf\xE1tica y paralelismo sint\xE1ctico", "Aforismos y modismos cultos de debate"],
    recommendedNextScenarioId: "scen_c1_contract_dispute"
  }
];
var COMPREHENSIVE_COURSES = [
  // ==========================================
  // SPANISH A1: FOUNDATIONS & ESSENTIAL TRAVEL
  // ==========================================
  {
    id: "unit_es_a1_1",
    unitNumber: 1,
    title: "First Connections & Everyday Introductions",
    subtitle: "Master basic greetings, sharing personal origin details, and forming your first sentences with Yoe.",
    cefrLevel: "A1",
    targetLanguage: "es",
    icon: "\u{1F91D}",
    category: "daily",
    description: "Fundamental building blocks for meeting native speakers and introducing yourself.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_1_1",
        unitId: "unit_es_a1_1",
        courseId: "unit_es_a1_1",
        title: "Greetings & Polite Formality",
        description: "Understand formal vs informal greetings, time-of-day phrases, and polite conversation openers.",
        level: "A1",
        category: "daily",
        order: 1,
        durationMin: 3,
        xpReward: 25,
        type: "theory",
        learningObjectives: ["Say hello and goodbye based on time of day", "Ask how someone is doing", "Distinguish t\xFA vs usted"],
        grammarFocus: ["Verbo llamarse en presente", "T\xFA vs Usted"],
        vocabularyList: [
          { word: "Hola", translation: "Hello", phonetic: "OH-lah" },
          { word: "Buenos d\xEDas", translation: "Good morning", phonetic: "BWEH-nos DEE-ahs" },
          { word: "Buenas tardes", translation: "Good afternoon", phonetic: "BWEH-nas TAR-des" },
          { word: "Mucho gusto", translation: "Nice to meet you", phonetic: "MOO-choh GOOS-toh" },
          { word: "\xBFC\xF3mo est\xE1s?", translation: "How are you? (informal)", phonetic: "KOH-moh es-TAHS" }
        ],
        theoryContent: {
          concept: "Presenting Yourself and Greeting in Spanish",
          explanation: `In Spanish, "Me llamo..." literally means "I call myself...". To ask someone else's name politely, you say "\xBFC\xF3mo te llamas?" (informal) or "\xBFC\xF3mo se llama usted?" (formal). Use "Buenos d\xEDas" until lunch, "Buenas tardes" until nightfall, and "Buenas noches" at night.`,
          examples: [
            { original: "\xA1Hola! Me llamo Sofia. \xBFC\xF3mo te llamas?", translation: "Hello! My name is Sofia. What is your name?" },
            { original: "Mucho gusto en conocerte.", translation: "Nice to meet you." },
            { original: "Soy de Madrid, pero vivo en Barcelona.", translation: "I am from Madrid, but I live in Barcelona." }
          ],
          keyTakeaway: 'Use "Me llamo [name]" or "Soy [name]" to introduce yourself naturally in any situation.'
        },
        speakingScenarioId: "scen_daily_first_meeting",
        practiceScenarioIds: ["scen_daily_first_meeting", "scen_social_language_exchange"]
      },
      {
        id: "les_es_1_2",
        unitId: "unit_es_a1_1",
        courseId: "unit_es_a1_1",
        title: "Vocabulary: Countries, Origin & Nationalities",
        description: "Express your nationality, where you live, and ask others where they are from.",
        level: "A1",
        category: "daily",
        order: 2,
        durationMin: 4,
        xpReward: 30,
        type: "vocabulary",
        learningObjectives: ['State your country of origin with "Soy de..."', 'Ask "\xBFDe d\xF3nde eres?"', "Identify major Spanish-speaking nations"],
        grammarFocus: ["Verbo Ser para origen: Yo soy de...", "G\xE9nero de nacionalidades"],
        miniGameData: {
          type: "word_match",
          items: [
            { target: "el pa\xEDs", match: "country" },
            { target: "la ciudad", match: "city" },
            { target: "\xBFde d\xF3nde eres?", match: "where are you from?" },
            { target: "yo vivo en", match: "I live in" },
            { target: "mucho gusto", match: "nice to meet you" }
          ]
        },
        speakingScenarioId: "scen_social_language_exchange",
        practiceScenarioIds: ["scen_social_language_exchange"]
      }
    ]
  },
  {
    id: "unit_es_a1_2",
    unitNumber: 2,
    title: "Travel Logistics & Airport Basics",
    subtitle: "Confidently check in for flights, handle bag drop, navigate security, and board planes.",
    cefrLevel: "A1",
    targetLanguage: "es",
    icon: "\u2708\uFE0F",
    category: "travel",
    description: "Essential phrases for smooth airport, boarding, and luggage transactions.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_a1_travel_airport",
        unitId: "unit_es_a1_2",
        courseId: "unit_es_a1_2",
        title: "Airport Check-In & Luggage Handling",
        description: "Understand airport terminology, request seat preferences, and confirm luggage allowances.",
        level: "A1",
        category: "travel",
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: "theory",
        learningObjectives: ["Present passport and booking reference", "Request window or aisle seat", "Confirm baggage check-in"],
        grammarFocus: ["Quisiera / Me gustar\xEDa + infinitivo", "Hay / D\xF3nde est\xE1"],
        vocabularyList: [
          { word: "el pasaporte", translation: "passport", phonetic: "el pah-sah-POR-teh" },
          { word: "la tarjeta de embarque", translation: "boarding pass", phonetic: "tahr-HEH-tah deh em-BAR-keh" },
          { word: "el asiento de ventanilla", translation: "window seat", phonetic: "ah-SYEN-toh deh ven-tah-NEE-yah" },
          { word: "el asiento de pasillo", translation: "aisle seat", phonetic: "ah-SYEN-toh deh pah-SEE-yoh" },
          { word: "la maleta", translation: "suitcase / luggage", phonetic: "mah-LEH-tah" }
        ],
        theoryContent: {
          concept: "Checking In at International Airports",
          explanation: 'When checking in at an airline counter in Spain or Latin America, greet the agent with "\xA1Buenos d\xEDas!" and say "Quisiera facturar una maleta, por favor" (I would like to check in a bag, please). Use "asiento de ventanilla" for a window seat and "asiento de pasillo" for an aisle seat.',
          examples: [
            { original: "Aqu\xED tiene mi pasaporte y el c\xF3digo de reserva.", translation: "Here is my passport and booking code." },
            { original: "\xBFPrefiere ventanilla o pasillo?", translation: "Do you prefer window or aisle?" },
            { original: "Prefiero asiento de ventanilla, por favor.", translation: "I prefer a window seat, please." }
          ],
          keyTakeaway: 'Always open with "Quisiera..." or "\xBFPodr\xEDa tener...?" for polite, fluent requests.'
        },
        speakingScenarioId: "scen_travel_airport_checkin",
        practiceScenarioIds: ["scen_travel_airport_checkin", "scen_travel_airport_security", "scen_travel_boarding_flight"]
      },
      {
        id: "les_es_a1_hotel",
        unitId: "unit_es_a1_2",
        courseId: "unit_es_a1_2",
        title: "Hotel Check-In & Accommodation Essentials",
        description: "Confirm reservations, ask about WiFi and breakfast, and request quiet rooms.",
        level: "A1",
        category: "travel",
        order: 2,
        durationMin: 5,
        xpReward: 35,
        type: "speaking",
        learningObjectives: ["Check in with reservation name", "Ask about breakfast times and keycard", "Inquire about WiFi password"],
        grammarFocus: ["Tener una reserva a nombre de...", "\xBFA qu\xE9 hora es...?"],
        speakingScenarioId: "scen_hotel_madrid",
        practiceScenarioIds: ["scen_hotel_madrid"]
      }
    ]
  },
  {
    id: "unit_es_a1_3",
    unitNumber: 3,
    title: "Food, Tapas & Dining Out",
    subtitle: "Order regional dishes, express preferences, and easily ask for the restaurant bill.",
    cefrLevel: "A1",
    targetLanguage: "es",
    icon: "\u{1F958}",
    category: "dining",
    description: "Enjoy Spain and Latin America\u2019s vibrant culinary world with confidence.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_a1_tapas",
        unitId: "unit_es_a1_3",
        courseId: "unit_es_a1_3",
        title: "Ordering Tapas & Drinks at Traditional Bars",
        description: 'Master the polite conditional "Para m\xED...", ask for recommendations, and request the bill.',
        level: "A1",
        category: "dining",
        order: 1,
        durationMin: 4,
        xpReward: 30,
        type: "theory",
        learningObjectives: ["Order drinks and appetizers", "Ask for house specialties", "Politely request the bill (la cuenta)"],
        grammarFocus: ["Poner en imperativo cort\xE9s: \xBFMe pone...?", "Querer / Traer"],
        theoryContent: {
          concept: "Ordering Tapas in Spanish Tabernas",
          explanation: 'In Spain, you often order at the counter or table by saying "\xBFNos pone una raci\xF3n de patatas bravas, por favor?". When ready to pay, catch the waiter\u2019s eye and say "La cuenta, por favor".',
          examples: [
            { original: "\xBFQu\xE9 nos recomienda de la casa?", translation: "What do you recommend as house specialty?" },
            { original: "Una copa de vino tinto y un agua con gas.", translation: "A glass of red wine and sparkling water." },
            { original: "\xBFNos trae la cuenta cuando pueda, por favor?", translation: "Could you bring us the bill when you can, please?" }
          ],
          keyTakeaway: 'Use "Para m\xED..." or "\xBFMe pone...?" when ordering at bars and tabernas.'
        },
        speakingScenarioId: "scen_dining_tapas_bar",
        practiceScenarioIds: ["scen_dining_tapas_bar", "scen_social_dinner_friends"]
      }
    ]
  },
  // ==========================================
  // SPANISH A2: EVERYDAY INDEPENDENCE & TRAVEL
  // ==========================================
  {
    id: "unit_es_a2_1",
    unitNumber: 4,
    title: "Describing Past Experiences & Weekends",
    subtitle: "Narrate completed events, weekend outings, and memorable personal trips.",
    cefrLevel: "A2",
    targetLanguage: "es",
    icon: "\u{1F4C5}",
    category: "social",
    description: "Learn the Pret\xE9rito Indefinido to share what you did yesterday or last week.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_a2_past_events",
        unitId: "unit_es_a2_1",
        courseId: "unit_es_a2_1",
        title: "The Pret\xE9rito Indefinido: Talking About Yesterday",
        description: "Form regular past tense verbs (-ar: -\xE9, -aste, -\xF3; -er/-ir: -\xED, -iste, -i\xF3) and key time markers.",
        level: "A2",
        category: "social",
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: "theory",
        learningObjectives: ["Narrate completed actions with ayer / el fin de semana pasado", "Use regular -ar, -er, -ir past endings", "Ask what someone did last weekend"],
        grammarFocus: ["Pret\xE9rito Indefinido regular", "Marcadores temporales (ayer, anoche, el a\xF1o pasado)"],
        theoryContent: {
          concept: "Pret\xE9rito Perfecto Simple (Indefinido)",
          explanation: "The Pret\xE9rito Indefinido describes actions completed at a specific point in the past. Regular endings for -AR verbs: habl\xE9, hablaste, habl\xF3, hablamos, hablaron. For -ER/-IR: com\xED, comiste, comi\xF3, comimos, comieron.",
          examples: [
            { original: "Ayer cen\xE9 con unos amigos en Gr\xE0cia.", translation: "Yesterday I had dinner with some friends in Gr\xE0cia." },
            { original: "\xBFQu\xE9 hiciste el fin de semana pasado?", translation: "What did you do last weekend?" },
            { original: "Visit\xE9 el Museo del Prado y camin\xE9 por el Retiro.", translation: "I visited the Prado Museum and walked through El Retiro." }
          ],
          keyTakeaway: 'Combine time markers like "ayer" or "la semana pasada" with the indefinido to tell stories.'
        },
        speakingScenarioId: "scen_social_dinner_friends",
        practiceScenarioIds: ["scen_social_dinner_friends", "scen_social_party_mingling"]
      },
      {
        id: "les_es_a2_health",
        unitId: "unit_es_a2_1",
        courseId: "unit_es_a2_1",
        title: "Health, Symptoms & Medical Consultations",
        description: "Describe bodily symptoms, pain intensity, and ask for pharmacy advice.",
        level: "A2",
        category: "practical",
        order: 2,
        durationMin: 5,
        xpReward: 35,
        type: "theory",
        learningObjectives: ['Use "me duele / me duelen" with body parts', "Describe fever, cough, and fatigue", "Understand medication dosage instructions"],
        grammarFocus: ["Verbo doler (me duele / me duelen)", "Tener + s\xEDntoma (tengo fiebre/gripe)"],
        theoryContent: {
          concept: 'Describing Pain with "Doler"',
          explanation: 'Like "gustar", "doler" agrees with the body part causing pain: "Me duele la cabeza" (singular) vs "Me duelen los ojos" (plural). To describe general ailments, use "Tengo fiebre" or "Estoy resfriado".',
          examples: [
            { original: "Me duele mucho la garganta desde ayer.", translation: "My throat hurts a lot since yesterday." },
            { original: "Tengo un poco de fiebre y dolor muscular.", translation: "I have a mild fever and muscle aches." },
            { original: "\xBFTiene alg\xFAn medicamento para el dolor de cabeza?", translation: "Do you have any medication for headaches?" }
          ],
          keyTakeaway: 'Say "Me duele [singular]" or "Me duelen [plural]" when describing symptoms to a nurse or doctor.'
        },
        speakingScenarioId: "scen_practical_feeling_sick",
        practiceScenarioIds: ["scen_practical_feeling_sick", "scen_practical_urgent_clinic"]
      }
    ]
  },
  // ==========================================
  // SPANISH B1: CONVERSATIONAL & PROFESSIONAL
  // ==========================================
  {
    id: "unit_es_b1_1",
    unitNumber: 5,
    title: "Workplace Syncs & Collaborative Projects",
    subtitle: "Participate in agile standups, discuss sprint blockers, and resolve transit and apartment issues.",
    cefrLevel: "B1",
    targetLanguage: "es",
    icon: "\u{1F4BC}",
    category: "work",
    description: "Communicate smoothly in professional tech environments and handle everyday service friction.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_b1_standup",
        unitId: "unit_es_b1_1",
        courseId: "unit_es_b1_1",
        title: "Agile Team Standup & Sprint Updates",
        description: "Provide a structured 90-second update: what you delivered, what you focus on today, and blockers.",
        level: "B1",
        category: "work",
        order: 1,
        durationMin: 6,
        xpReward: 40,
        type: "theory",
        learningObjectives: ['Structure updates concisely with "Ayer complet\xE9...", "Hoy me enfocar\xE9 en..."', "Flag technical blockers or need for review", "Engage in constructive peer feedback"],
        grammarFocus: ["Pret\xE9rito Perfecto Compuesto vs Indefinido", "Conectores de causa y consecuencia (dado que, por lo tanto)"],
        theoryContent: {
          concept: "Delivering Professional Standup Updates",
          explanation: "In modern tech teams in Spain and Latin America, standups follow a clear 3-part framework: 1) Achievements (Ayer finalic\xE9...), 2) Today\u2019s focus (Hoy estoy trabajando en...), 3) Blockers (No tengo bloqueos, solo necesitar\xE9 code review).",
          examples: [
            { original: "Ayer complet\xE9 la integraci\xF3n de la API y pas\xE9 las pruebas unitarias.", translation: "Yesterday I finished the API integration and passed the unit tests." },
            { original: "Hoy me enfocar\xE9 en redise\xF1ar la vista m\xF3vil.", translation: "Today I will focus on redesigning the mobile view." },
            { original: "No tengo bloqueos t\xE9cnicos por el momento.", translation: "I have no technical blockers at the moment." }
          ],
          keyTakeaway: "Keep standup turns under 90 seconds, clear, and action-oriented."
        },
        speakingScenarioId: "scen_work_team_standup",
        practiceScenarioIds: ["scen_work_team_standup", "scen_work_client_support"]
      },
      {
        id: "les_es_b1_transit_delays",
        unitId: "unit_es_b1_1",
        courseId: "unit_es_b1_1",
        title: "Managing Flight Delays & Transit Desks",
        description: "Politely inquire about connecting flight guarantees, rebooking, and meal compensation vouchers.",
        level: "B1",
        category: "travel",
        order: 2,
        durationMin: 5,
        xpReward: 40,
        type: "speaking",
        learningObjectives: ["Inquire about delay causes and new departure time", "Request guarantee for connecting flight", "Ask about meal or accommodation vouchers"],
        grammarFocus: ["Condicional simple para peticiones formales: \xBFPodr\xEDa...?, \xBFSer\xEDa posible...?"],
        speakingScenarioId: "scen_travel_flight_delay",
        practiceScenarioIds: ["scen_travel_flight_delay", "scen_practical_lost_passport"]
      }
    ]
  },
  // ==========================================
  // SPANISH B2: PROFESSIONAL MASTERY
  // ==========================================
  {
    id: "unit_es_b2_1",
    unitNumber: 6,
    title: "Career Advancement, Interviews & Negotiation",
    subtitle: "Excel in job interviews, negotiate freelance scope and rates, and handle executive deadlines.",
    cefrLevel: "B2",
    targetLanguage: "es",
    icon: "\u{1F4C8}",
    category: "work",
    description: "High-level business communication for corporate and entrepreneurial environments.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_b2_interview",
        unitId: "unit_es_b2_1",
        courseId: "unit_es_b2_1",
        title: "Job Interviewing: Career Narrative & Strengths",
        description: "Frame achievements with the STAR method, articulate core professional strengths, and answer behavioral questions.",
        level: "B2",
        category: "work",
        order: 1,
        durationMin: 6,
        xpReward: 45,
        type: "theory",
        learningObjectives: ["Summarize 3-5 years of career experience impactfully", "Explain a past challenge and the resolution you spearheaded", "Ask insightful questions about company culture and metrics"],
        grammarFocus: ["Subjuntivo en cl\xE1usulas adjetivales y sustantivas", "Oraciones condicionales mixtas"],
        theoryContent: {
          concept: "The Professional Interview Pitch",
          explanation: 'At B2 level, answer questions using the STAR framework (Situaci\xF3n, Tarea, Acci\xF3n, Resultado). Use sophisticated verbs like "liderar", "optimizar", "desarrollar", and "conseguir". Frame weaknesses as areas of continuous growth.',
          examples: [
            { original: "A lo largo de mi trayectoria he liderado la modernizaci\xF3n de sistemas cr\xEDticos.", translation: "Throughout my career I have led the modernization of critical systems." },
            { original: "Ante una ca\xEDda imprevista en el tr\xE1fico, implementamos un plan de contingencia.", translation: "Faced with an unexpected traffic drop, we implemented a contingency plan." },
            { original: "\xBFCu\xE1les son los principales objetivos estrat\xE9gicos del equipo para este trimestre?", translation: "What are the main strategic objectives for the team this quarter?" }
          ],
          keyTakeaway: "Use concrete numbers and active leadership verbs to demonstrate value."
        },
        speakingScenarioId: "scen_work_job_interview",
        practiceScenarioIds: ["scen_work_job_interview", "scen_work_contract_negotiation", "scen_work_project_deadline"]
      },
      {
        id: "les_es_b2_negotiation",
        unitId: "unit_es_b2_1",
        courseId: "unit_es_b2_1",
        title: "Contract Negotiation & Milestone Scoping",
        description: "Negotiate project scope, hourly vs milestone rates, and align deadlines constructively.",
        level: "B2",
        category: "work",
        order: 2,
        durationMin: 5,
        xpReward: 45,
        type: "speaking",
        learningObjectives: ["Defend the value and scope of project deliverables", "Propose phased milestones and payment triggers", "Establish formal agreement on revision rounds"],
        grammarFocus: ["Condicional compuesto para hip\xF3tesis no cumplidas", "Conectores concesivos (a pesar de que, si bien)"],
        speakingScenarioId: "scen_work_contract_negotiation",
        practiceScenarioIds: ["scen_work_contract_negotiation", "scen_work_business_lunch"]
      }
    ]
  },
  // ==========================================
  // SPANISH C1: ACADEMIC & STRATEGIC FLUENCY
  // ==========================================
  {
    id: "unit_es_c1_1",
    unitNumber: 7,
    title: "Institutional Diplomacy & Complex Negotiations",
    subtitle: "Lead regulatory compliance hearings, cross-border corporate arbitration, and crisis communication.",
    cefrLevel: "C1",
    targetLanguage: "es",
    icon: "\u{1F3DB}\uFE0F",
    category: "work",
    description: "Master formal, legal, and academic registers with rhetorical elegance and persuasion.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_c1_1",
        unitId: "unit_es_c1_1",
        courseId: "unit_es_c1_1",
        title: "High-Stakes Multi-Party Contract Negotiations",
        description: "Navigate complex legal covenants, liability caps, and dispute arbitration clauses with precision.",
        level: "C1",
        category: "work",
        order: 1,
        durationMin: 7,
        xpReward: 50,
        type: "theory",
        learningObjectives: ["Formulate complex conditional counterproposals", "Use nuanced legal jargon accurately", "Facilitate consensus without conceding core interests"],
        grammarFocus: ["Subjuntivo imperfecto y pluscuamperfecto en contextos formales", "Construcciones absolutas de participio"],
        theoryContent: {
          concept: "Legal Arbitration & Institutional Registers",
          explanation: 'At C1 level, discourse requires syntactic complexity, formal hedging, and precise legal-technical vocabulary. Employ structures like "De convenir ambas partes en..." or "Habi\xE9ndose acreditado el cumplimiento...".',
          examples: [
            { original: "Proponemos supeditar el desembolso a la validaci\xF3n formal de los requerimientos t\xE9cnicos.", translation: "We propose conditioning the disbursement on formal validation of the technical requirements." },
            { original: "Sin perjuicio de lo estipulado en la cl\xE1usula anterior, ambas partes convienen en mediar de buena fe.", translation: "Without prejudice to what is stipulated in the preceding clause, both parties agree to mediate in good faith." }
          ],
          keyTakeaway: "Use precise legal connectors and nominalized phrasing for authoritative diplomacy."
        },
        speakingScenarioId: "scen_c1_contract_dispute",
        practiceScenarioIds: ["scen_c1_contract_dispute", "scen_c1_regulatory_hearing"]
      },
      {
        id: "les_es_c1_2",
        unitId: "unit_es_c1_1",
        courseId: "unit_es_c1_1",
        title: "Regulatory Frameworks, Compliance & Public Policy",
        description: "Present environmental audits, defend infrastructure projects, and answer regulatory committees.",
        level: "C1",
        category: "work",
        order: 2,
        durationMin: 6,
        xpReward: 50,
        type: "speaking",
        learningObjectives: ["Present technical baseline metrics to public commissions", "Respond to scrutiny regarding community impact", "Synthesize multi-faceted policy alignment"],
        grammarFocus: ["Per\xEDfrasis de obligaci\xF3n y probabilidad", "Nominalizaci\xF3n estil\xEDstica"],
        speakingScenarioId: "scen_c1_regulatory_hearing",
        practiceScenarioIds: ["scen_c1_regulatory_hearing", "scen_c1_pr_crisis"]
      }
    ]
  },
  // ==========================================
  // SPANISH C2: NEAR-NATIVE RHETORIC & NUANCE
  // ==========================================
  {
    id: "unit_es_c2_1",
    unitNumber: 8,
    title: "Near-Native Rhetoric, Subtext & Literary Discourse",
    subtitle: "Participate in live media debates, literary salons, and diplomatic summits with effortless fluency.",
    cefrLevel: "C2",
    targetLanguage: "es",
    icon: "\u{1F3AD}",
    category: "culture",
    description: "Master idioms, irony, cultural subtext, and spontaneous rhetoric comparable to an educated native speaker.",
    isLocked: false,
    lessons: [
      {
        id: "les_es_c2_1",
        unitId: "unit_es_c2_1",
        courseId: "unit_es_c2_1",
        title: "Diplomatic Mediation & High-Stakes Summit",
        description: "Formulate delicate compromise phrasing in bilateral communiqu\xE9s with exquisite cultural tact.",
        level: "C2",
        category: "work",
        order: 1,
        durationMin: 7,
        xpReward: 60,
        type: "theory",
        learningObjectives: ["Read between the lines of diplomatic posturing", "Formulate consensual bridge formulas that satisfy opposing delegations", "De-escalate high-temperature disputes through rhetorical tact"],
        grammarFocus: ["Atenuaci\xF3n pragm\xE1tica avanzada y l\xEDtote", "Inversi\xF3n estil\xEDstica y f\xF3rmulas afor\xEDsticas"],
        theoryContent: {
          concept: "Pragmatic Attenuation & Subtle Subtext",
          explanation: 'At C2 level, communication is defined by what remains unsaid as much as what is spoken. Masters of Spanish diplomacy use subtle modal verbs ("cabr\xEDa plantear", "no dejar\xEDa de ser oportuno") and elegant litotes to reconcile opposing stances without confrontation.',
          examples: [
            { original: "Cabr\xEDa formular un principio de acuerdo que no menoscabe las leg\xEDtimas pretensiones de ninguna de las partes.", translation: "It might be appropriate to formulate a preliminary accord that does not undermine the legitimate claims of either party." },
            { original: "Lejos de suponer una renuncia, esta f\xF3rmula consagra una v\xEDa pragm\xE1tica hacia el entendimiento mutuo.", translation: "Far from implying a concession, this formula establishes a pragmatic path toward mutual understanding." }
          ],
          keyTakeaway: "Master understatement and refined pragmatic attenuation to build instant diplomatic consensus."
        },
        speakingScenarioId: "scen_c2_diplomatic_mediation",
        practiceScenarioIds: ["scen_c2_diplomatic_mediation", "scen_c2_spontaneous_debate"]
      },
      {
        id: "les_es_c2_2",
        unitId: "unit_es_c2_1",
        courseId: "unit_es_c2_1",
        title: "Irony, Subtext & Literary Critique",
        description: "Analyze philosophical paradoxes, metaphorical depth, and Hispanic literary masters.",
        level: "C2",
        category: "culture",
        order: 2,
        durationMin: 6,
        xpReward: 60,
        type: "speaking",
        learningObjectives: ["Debate philosophical and literary themes in contemporary Spanish literature", "Employ irony and stylistic nuance effortlessly", "Express profound aesthetic critiques without pause"],
        grammarFocus: ["Recursos estil\xEDsticos complejos", "Prosodia y registros cultos"],
        speakingScenarioId: "scen_c2_literary_salon",
        practiceScenarioIds: ["scen_c2_literary_salon", "scen_c2_spontaneous_debate"]
      },
      {
        id: "les_es_c2_3",
        unitId: "unit_es_c2_1",
        courseId: "unit_es_c2_1",
        title: "Fast-Paced Live Media Debate & Spontaneous Rhetoric",
        description: "Rebut aggressive interviewers on live broadcast television with poise, humor, and irrefutable logic.",
        level: "C2",
        category: "culture",
        order: 3,
        durationMin: 6,
        xpReward: 60,
        type: "speaking",
        learningObjectives: ["Rebut sophist arguments under strict television time limits", "Frame counter-propositions with compelling cultural aphorisms", "Maintain unassailable poise under hostile cross-examination"],
        grammarFocus: ["Paralelismos ret\xF3ricos y ant\xEDtesis", "Humor sutil e iron\xEDa culta"],
        speakingScenarioId: "scen_c2_spontaneous_debate",
        practiceScenarioIds: ["scen_c2_spontaneous_debate"]
      }
    ]
  },
  // ==========================================
  // FRENCH A1 & A2 (CAFÉ CULTURE & TRAVEL)
  // ==========================================
  {
    id: "unit_fr_1",
    unitNumber: 1,
    title: "Caf\xE9 Culture & Parisian Life",
    subtitle: "Order delicious pastries, coffee, and meals with authentic French phrasing.",
    cefrLevel: "A1",
    targetLanguage: "fr",
    icon: "\u{1F950}",
    category: "dining",
    description: "Master polite French conditional ordering at Parisian bistros and boulangeries.",
    isLocked: false,
    lessons: [
      {
        id: "les_fr_1_1",
        unitId: "unit_fr_1",
        courseId: "unit_fr_1",
        title: "Ordering at French Caf\xE9s",
        description: 'Master the polite conditional "Je voudrais..." and table etiquette.',
        level: "A1",
        category: "dining",
        order: 1,
        durationMin: 3,
        xpReward: 25,
        type: "theory",
        learningObjectives: ["Say Bonjour before every request", 'Use "Je voudrais..." instead of "Je veux"', `Ask for the bill with "L'addition, s'il vous pla\xEEt"`],
        grammarFocus: ["Conditionnel de politesse: Je voudrais", "Articles partitifs (du, de la, des)"],
        theoryContent: {
          concept: "Polite Requests in French",
          explanation: `In French, always use "Je voudrais..." (I would like...) instead of "Je veux" (I want). End every request with "s'il vous pla\xEEt" (please). Always say "Bonjour" when entering.`,
          examples: [
            { original: "Bonjour, je voudrais un caf\xE9 au lait, s'il vous pla\xEEt.", translation: "Hello, I would like a coffee with milk, please." },
            { original: "L'addition, s'il vous pla\xEEt.", translation: "The bill, please." }
          ],
          keyTakeaway: 'Say "Bonjour" before any request when entering a shop or caf\xE9 in France.'
        },
        speakingScenarioId: "scen_cafe_paris",
        practiceScenarioIds: ["scen_cafe_paris"]
      },
      {
        id: "les_fr_1_2",
        unitId: "unit_fr_1",
        courseId: "unit_fr_1",
        title: "Live Voice: Bistro in Paris",
        description: "Order breakfast at Le Petit Caf\xE9 on Boulevard Saint-Germain with Yoe.",
        level: "A1",
        category: "dining",
        order: 2,
        durationMin: 5,
        xpReward: 50,
        type: "speaking",
        learningObjectives: ["Greet the waiter warmly", "Order coffee and croissant", "Pay with card or cash"],
        speakingScenarioId: "scen_cafe_paris",
        practiceScenarioIds: ["scen_cafe_paris"]
      }
    ]
  },
  {
    id: "unit_fr_a2",
    unitNumber: 2,
    title: "In-Flight Assistance & Transit Navigation",
    subtitle: "Find luggage storage on Air France flights and report lost property in Paris metro.",
    cefrLevel: "A2",
    targetLanguage: "fr",
    icon: "\u{1F6EB}",
    category: "travel",
    description: "Navigate flights, overhead compartments, and transit lost property desks.",
    isLocked: false,
    lessons: [
      {
        id: "les_fr_a2_flight",
        unitId: "unit_fr_a2",
        courseId: "unit_fr_a2",
        title: "Boarding the Flight & Cabin Help",
        description: "Show boarding pass, find row number, ask to stow overhead baggage, and request water.",
        level: "A2",
        category: "travel",
        order: 1,
        durationMin: 5,
        xpReward: 35,
        type: "speaking",
        learningObjectives: ["Show boarding pass and ask where seat is", "Ask for assistance with overhead compartment", "Politely request water or blanket"],
        speakingScenarioId: "scen_travel_boarding_flight",
        practiceScenarioIds: ["scen_travel_boarding_flight", "scen_practical_lost_phone"]
      }
    ]
  },
  // ==========================================
  // ENGLISH B2 (PROFESSIONAL TECH & CAREER)
  // ==========================================
  {
    id: "unit_en_b2",
    unitNumber: 1,
    title: "Tech Innovations & Career Interviews",
    subtitle: "Excel in international product engineering interviews and team onboarding.",
    cefrLevel: "B2",
    targetLanguage: "en",
    icon: "\u{1F4BC}",
    category: "work",
    description: "Master corporate career narratives, system design discussion, and behavioral queries.",
    isLocked: false,
    lessons: [
      {
        id: "les_en_b2_interview",
        unitId: "unit_en_b2",
        courseId: "unit_en_b2",
        title: "Job Interview & Career Background",
        description: "Present your professional skills, highlight relevant project deliverables, and answer situational questions.",
        level: "B2",
        category: "work",
        order: 1,
        durationMin: 5,
        xpReward: 40,
        type: "speaking",
        learningObjectives: ["Summarize 3 years of software engineering experience", "Explain how you resolved a tough technical blocker", "Ask an insightful question about quarterly goals"],
        speakingScenarioId: "scen_work_job_interview",
        practiceScenarioIds: ["scen_work_job_interview"]
      }
    ]
  }
];

// src/server/learningLibrary.ts
var INITIAL_DATABASE_SCENARIOS = [
  // ==========================================
  // 1. TRAVEL & TRANSPORTATION (18 Situations)
  // ==========================================
  {
    id: "scen_travel_airport_checkin",
    title: "Airport Check-In & Bag Drop",
    description: "Check in for your international flight, confirm window or aisle seating, and check your luggage.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Barajas Airport Terminal 4, Madrid",
    characterName: "Yoe",
    characterRole: "Airline Check-in Agent",
    avatar: "\u2708\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["pasaporte", "maleta", "asiento", "tarjeta de embarque", "equipaje de mano"],
    initialGreeting: "\xA1Hola! Bienvenido a Iberia Airlines. \xBFMe permite su pasaporte y el c\xF3digo de reserva, por favor?",
    initialGreetingTranslation: "Hello! Welcome to Iberia Airlines. May I have your passport and booking reference, please?",
    objectives: [
      { id: "obj_ac_1", text: "Present your passport and destination", completed: false, hint: "Say: Hola, aqu\xED tiene mi pasaporte. Viajo a Barcelona." },
      { id: "obj_ac_2", text: "Request a window or aisle seat", completed: false, hint: "Say: \xBFPodr\xEDa tener un asiento de ventana / pasillo, por favor?" },
      { id: "obj_ac_3", text: "Confirm number of checked bags", completed: false, hint: "Say: Solo tengo una maleta para facturar." }
    ],
    lessonId: "les_es_a1_travel_airport",
    relatedLessonTitle: "Airport Check-In & Luggage Handling",
    grammarFocus: ["Quisiera / Me gustar\xEDa + infinitivo", "Hay / D\xF3nde est\xE1"],
    recommendedNextScenarioId: "scen_travel_airport_security"
  },
  {
    id: "scen_travel_airport_security",
    title: "Airport Security Screening",
    description: "Follow security instructions, place liquids and electronics in bins, and ask clarifying questions.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Security Checkpoint, El Prat Airport, Barcelona",
    characterName: "Yoe",
    characterRole: "Security Officer",
    avatar: "\u{1F6C2}",
    imageUrl: "https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["bandeja", "l\xEDquidos", "port\xE1til", "cintur\xF3n", "zapatos"],
    initialGreeting: "Buenos d\xEDas. Por favor, saque los l\xEDquidos y dispositivos electr\xF3nicos de su mochila y col\xF3quelos en la bandeja.",
    initialGreetingTranslation: "Good morning. Please take out liquids and electronic devices from your backpack and place them in the tray.",
    objectives: [
      { id: "obj_as_1", text: "Acknowledge instructions and ask about shoes/belt", completed: false, hint: "Say: De acuerdo. \xBFTengo que quitarme los zapatos y el cintur\xF3n?" },
      { id: "obj_as_2", text: "Confirm placement of tablet or laptop", completed: false, hint: "Say: Ya he puesto mi ordenador port\xE1til en la bandeja." },
      { id: "obj_as_3", text: "Ask where to collect your luggage after screening", completed: false, hint: "Say: Gracias, \xBFpuedo pasar por el detector ahora?" }
    ],
    lessonId: "les_es_a1_travel_airport",
    relatedLessonTitle: "Airport Check-In & Luggage Handling",
    grammarFocus: ["Tener que + infinitivo", "Por favor + imperativo formal"],
    recommendedNextScenarioId: "scen_travel_boarding_flight"
  },
  {
    id: "scen_travel_boarding_flight",
    title: "Boarding the Flight & Cabin Help",
    description: "Find your seat on the plane, ask for help stowing overhead luggage, and request water or a blanket.",
    category: "travel",
    targetLanguage: "fr",
    cefrLevel: "A1",
    location: "Air France Flight AF1244, Paris to Nice",
    characterName: "Yoe",
    characterRole: "Flight Attendant",
    avatar: "\u{1F6EB}",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["si\xE8ge", "bagage", "coffre \xE0 bagages", "couverture", "verre d'eau"],
    initialGreeting: "Bonjour et bienvenue \xE0 bord ! Puis-je voir votre carte d'embarquement pour vous indiquer votre rang\xE9e ?",
    initialGreetingTranslation: "Hello and welcome on board! May I see your boarding pass to direct you to your row?",
    objectives: [
      { id: "obj_bf_1", text: "Show boarding pass and ask where seat is", completed: false, hint: "Say: Bonjour ! Voici ma carte. O\xF9 se trouve le si\xE8ge 14B ?" },
      { id: "obj_bf_2", text: "Ask for assistance with overhead compartment", completed: false, hint: "Say: Pouvez-vous m'aider \xE0 ranger mon bagage, s'il vous pla\xEEt ?" },
      { id: "obj_bf_3", text: "Politely request a cup of water or blanket", completed: false, hint: "Say: Pourrais-je avoir un verre d'eau, s'il vous pla\xEEt ?" }
    ]
  },
  {
    id: "scen_travel_flight_delay",
    title: "Flight Delay & Transit Desk",
    description: "Inquire about delayed departure times, connecting flight guarantees, and meal voucher compensations.",
    category: "travel",
    targetLanguage: "en",
    cefrLevel: "A2",
    location: "Customer Service Counter, Heathrow Terminal 5, London",
    characterName: "Yoe",
    characterRole: "Transit Service Supervisor",
    avatar: "\u23F0",
    imageUrl: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["delay", "connecting flight", "departure gate", "voucher", "rebooking"],
    initialGreeting: "Hello there. I understand your flight to New York has been delayed by two hours. How can I assist you today?",
    initialGreetingTranslation: "Hello there. I understand your flight to New York has been delayed by two hours. How can I assist you today?",
    objectives: [
      { id: "obj_fd_1", text: "Explain your concern about missing a connecting flight", completed: false, hint: "Say: I have a connecting flight in two hours, will I still make it?" },
      { id: "obj_fd_2", text: "Ask about meal or refreshment vouchers", completed: false, hint: "Say: Are meal vouchers provided during this delay?" },
      { id: "obj_fd_3", text: "Confirm the updated departure gate and boarding time", completed: false, hint: "Say: What is the new boarding time and departure gate?" }
    ]
  },
  {
    id: "scen_travel_lost_luggage",
    title: "Lost Luggage Claim Desk",
    description: "Report missing baggage at the baggage reclaim office, describe your suitcase, and provide your hotel address.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Baggage Services, Barajas Airport, Madrid",
    characterName: "Yoe",
    characterRole: "Baggage Services Agent",
    avatar: "\u{1F9F3}",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["maleta perdida", "etiqueta", "color", "direcci\xF3n", "reclamaci\xF3n"],
    initialGreeting: "Hola, buenas tardes. Siento mucho el inconveniente. \xBFSu maleta no apareci\xF3 en la cinta de equipajes?",
    initialGreetingTranslation: "Hello, good afternoon. I am so sorry for the inconvenience. Did your suitcase not appear on the carousel?",
    objectives: [
      { id: "obj_ll_1", text: "Explain your bag did not arrive and show baggage tag", completed: false, hint: "Say: S\xED, mi maleta no ha llegado. Aqu\xED tengo el resguardo de equipaje." },
      { id: "obj_ll_2", text: "Describe the color, size, and brand of your bag", completed: false, hint: "Say: Es una maleta grande de color azul marino con cuatro ruedas." },
      { id: "obj_ll_3", text: "Provide hotel address for home delivery", completed: false, hint: "Say: Estoy alojado en el Hotel Gran V\xEDa, por favor env\xEDenla all\xED." }
    ]
  },
  {
    id: "scen_hotel_madrid",
    title: "Hotel Check-In in Madrid",
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
  },
  {
    id: "scen_travel_hotel_checkout",
    title: "Hotel Checkout & Storing Luggage",
    description: "Settle your hotel room bill, return keycards, and arrange for luggage storage before an evening flight.",
    category: "travel",
    targetLanguage: "fr",
    cefrLevel: "A1",
    location: "H\xF4tel Saint-Germain, Paris",
    characterName: "Yoe",
    characterRole: "Front Desk Concierge",
    avatar: "\u{1F511}",
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["d\xE9part", "facture", "cl\xE9s", "bagages", "garder"],
    initialGreeting: "Bonjour ! J'esp\xE8re que vous avez pass\xE9 un excellent s\xE9jour parmi nous. Vous souhaitez r\xE9gler votre d\xE9part ?",
    initialGreetingTranslation: "Good morning! I hope you had a wonderful stay with us. Would you like to check out?",
    objectives: [
      { id: "obj_hco_1", text: "State your room number and request checkout", completed: false, hint: "Say: Bonjour, chambre 304, je voudrais r\xE9gler la facture, s'il vous pla\xEEt." },
      { id: "obj_hco_2", text: "Pay by card and ask for a receipt", completed: false, hint: "Say: Je vais payer par carte bancaire. Puis-je avoir un re\xE7u ?" },
      { id: "obj_hco_3", text: "Ask if you can leave your bags until 5:00 PM", completed: false, hint: "Say: Est-il possible de laisser mes bagages ici jusqu'\xE0 dix-sept heures ?" }
    ]
  },
  {
    id: "scen_travel_asking_directions",
    title: "Asking for Street Directions",
    description: "Navigate an unfamiliar historic neighborhood by asking locals for directions to the main plaza and metro station.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Barrio de las Letras, Madrid",
    characterName: "Yoe",
    characterRole: "Helpful Local Resident",
    avatar: "\u{1F5FA}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["disculpe", "c\xF3mo llegar", "a la derecha", "todo recto", "estaci\xF3n de metro"],
    initialGreeting: "\xA1Hola! \xBFTe has desorientado un poco? \xBFBuscas alg\xFAn lugar en particular por el centro?",
    initialGreetingTranslation: "Hello! Are you a bit lost? Are you looking for a specific place in the city center?",
    objectives: [
      { id: "obj_dir_1", text: "Excuse yourself politely and ask for Plaza Mayor", completed: false, hint: "Say: Disculpe, \xBFc\xF3mo puedo llegar a la Plaza Mayor desde aqu\xED?" },
      { id: "obj_dir_2", text: "Clarify if it is within walking distance", completed: false, hint: "Say: \xBFEst\xE1 lejos o se puede ir andando?" },
      { id: "obj_dir_3", text: "Thank the local and ask for the nearest metro stop", completed: false, hint: "Say: Muchas gracias. \xBFD\xF3nde est\xE1 la estaci\xF3n de metro m\xE1s cercana?" }
    ]
  },
  {
    id: "scen_travel_train_ticket",
    title: "Buying a High-Speed Train Ticket",
    description: "Purchase a round-trip ticket at the railway ticket window, choose travel classes, and confirm departure platforms.",
    category: "travel",
    targetLanguage: "it",
    cefrLevel: "A2",
    location: "Stazione Centrale di Milano, Milan",
    characterName: "Yoe",
    characterRole: "Trenitalia Ticket Agent",
    avatar: "\u{1F684}",
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["biglietto", "andata e ritorno", "binario", "orario", "prima classe"],
    initialGreeting: "Buongiorno! Benvenuto a Trenitalia. Per quale destinazione desidera acquistare il biglietto?",
    initialGreetingTranslation: "Good morning! Welcome to Trenitalia. For which destination would you like to buy a ticket?",
    objectives: [
      { id: "obj_tt_1", text: "Request a round-trip ticket to Florence or Rome", completed: false, hint: "Say: Buongiorno, vorrei un biglietto di andata e ritorno per Firenze, per favore." },
      { id: "obj_tt_2", text: "Select departure time for this afternoon", completed: false, hint: "Say: C'\xE8 un treno ad alta velocit\xE0 verso le due del pomeriggio?" },
      { id: "obj_tt_3", text: "Ask which platform (binario) the train departs from", completed: false, hint: "Say: Da quale binario parte il treno?" }
    ]
  },
  {
    id: "scen_travel_taxi_ride",
    title: "Taking a City Taxi",
    description: "Hail a taxi outside your hotel, state your destination address, request air conditioning, and ask about credit card payment.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Calle de Alcal\xE1 Taxi Stand, Madrid",
    characterName: "Yoe",
    characterRole: "Taxi Driver",
    avatar: "\u{1F695}",
    imageUrl: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["taxi", "direcci\xF3n", "tarjeta", "cu\xE1nto es", "aqu\xED mismo"],
    initialGreeting: "\xA1Buenas tardes! \xBFAd\xF3nde le llevo hoy?",
    initialGreetingTranslation: "Good afternoon! Where can I take you today?",
    objectives: [
      { id: "obj_tax_1", text: "State destination address clearly", completed: false, hint: "Say: Hola, ll\xE9veme al Museo del Prado, por favor." },
      { id: "obj_tax_2", text: "Ask if card payment is accepted", completed: false, hint: "Say: \xBFAcepta pago con tarjeta de cr\xE9dito?" },
      { id: "obj_tax_3", text: "Ask for the final fare and request receipt", completed: false, hint: "Say: \xBFCu\xE1nto es en total? \xBFMe da un recibo, por favor?" }
    ]
  },
  {
    id: "scen_travel_car_rental",
    title: "Rental Car Pickup & Insurance",
    description: "Pick up your reserved rental vehicle, understand fuel policy terms, and add full insurance coverage.",
    category: "travel",
    targetLanguage: "fr",
    cefrLevel: "B1",
    location: "Car Rental Desk, Nice C\xF4te d'Azur Airport",
    characterName: "Yoe",
    characterRole: "Rental Counter Agent",
    avatar: "\u{1F697}",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["voiture de location", "permis de conduire", "assurance", "carburant", "contrat"],
    initialGreeting: "Bonjour monsieur/madame. Vous avez r\xE9serv\xE9 un v\xE9hicule chez Europcar pour une semaine ?",
    initialGreetingTranslation: "Hello sir/madam. You have booked a vehicle with Europcar for a week?",
    objectives: [
      { id: "obj_cr_1", text: "Provide driver license and booking confirmation", completed: false, hint: "Say: Bonjour, voici mon permis de conduire et la confirmation de r\xE9servation." },
      { id: "obj_cr_2", text: "Inquire about comprehensive insurance coverage", completed: false, hint: "Say: Je voudrais ajouter l'assurance tous risques sans franchise." },
      { id: "obj_cr_3", text: "Ask about return fuel policy (plein/plein)", completed: false, hint: "Say: Dois-je rendre la voiture avec le plein de carburant ?" }
    ]
  },
  {
    id: "scen_travel_tourist_info",
    title: "Tourist Information Bureau",
    description: "Get local recommendations, pick up city maps, and ask about museum opening hours and discount passes.",
    category: "travel",
    targetLanguage: "ar",
    cefrLevel: "A2",
    location: "Tourist Welcome Center, Dubai Mall, UAE",
    characterName: "Yoe",
    characterRole: "Tourist Information Officer",
    avatar: "\u{1F3DB}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0633\u064A\u0627\u062D\u064A\u0629", "\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u062F\u064A\u0646\u0629", "\u0645\u062A\u062D\u0641", "\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0639\u0645\u0644", "\u062A\u0630\u0627\u0643\u0631"],
    initialGreeting: "\u0623\u0647\u0644\u0627\u064B \u0648\u0633\u0647\u0644\u0627\u064B \u0628\u0643 \u0641\u064A \u062F\u0628\u064A! \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645 \u0641\u064A \u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0627\u0644\u0645\u0639\u0627\u0644\u0645 \u0627\u0644\u0633\u064A\u0627\u062D\u064A\u0629\u061F",
    initialGreetingTranslation: "Welcome to Dubai! How can I help you today in exploring the city sights?",
    objectives: [
      { id: "obj_ti_1", text: "Request a city map and cultural recommendations", completed: false, hint: "Say: \u0645\u0631\u062D\u0628\u0627\u064B\u060C \u0647\u0644 \u064A\u0645\u0643\u0646\u0646\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062E\u0631\u064A\u0637\u0629 \u0644\u0644\u0645\u062F\u064A\u0646\u0629 \u0648\u0623\u0647\u0645 \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u062B\u0642\u0627\u0641\u064A\u0629\u061F" },
      { id: "obj_ti_2", text: "Ask about museum opening hours", completed: false, hint: "Say: \u0645\u0627 \u0647\u064A \u0623\u0648\u0642\u0627\u062A \u0639\u0645\u0644 \u0645\u062A\u062D\u0641 \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644 \u0627\u0644\u064A\u0648\u0645\u061F" },
      { id: "obj_ti_3", text: "Inquire about tourist discount passes", completed: false, hint: "Say: \u0647\u0644 \u062A\u0648\u062C\u062F \u0628\u0637\u0627\u0642\u0629 \u062A\u062E\u0641\u064A\u0636\u0627\u062A \u0644\u0644\u0645\u0648\u0627\u0635\u0644\u0627\u062A \u0648\u0627\u0644\u0645\u0639\u0627\u0644\u0645\u061F" }
    ]
  },
  {
    id: "scen_travel_restaurant_reservation",
    title: "Dinner Table Reservation by Phone",
    description: "Call a popular seaside restaurant to book a table for four guests on the outdoor terrace.",
    category: "travel",
    targetLanguage: "it",
    cefrLevel: "A2",
    location: "Ristorante La Terrazza, Amalfi Coast",
    characterName: "Yoe",
    characterRole: "Restaurant Host",
    avatar: "\u{1F377}",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["prenotazione", "tavolo", "terrazza", "quattro persone", "ore otto"],
    initialGreeting: "Buonasera, Ristorante La Terrazza! In cosa posso esserle utile stasera?",
    initialGreetingTranslation: "Good evening, Ristorante La Terrazza! How may I help you tonight?",
    objectives: [
      { id: "obj_rr_1", text: "Request a table for 4 people at 8:30 PM", completed: false, hint: "Say: Buonasera, vorrei prenotare un tavolo per quattro persone per stasera alle otto e mezza." },
      { id: "obj_rr_2", text: "Specify a preference for an outdoor table with a view", completed: false, hint: "Say: Sarebbe possibile avere un tavolo all'aperto con vista mare?" },
      { id: "obj_rr_3", text: "Confirm reservation under your surname", completed: false, hint: "Say: La prenotazione \xE8 a nome di..." }
    ]
  },
  {
    id: "scen_cafe_paris",
    title: "Bistro in Paris",
    description: "Order breakfast at a quaint Parisian caf\xE9 and practice polite French requests.",
    category: "travel",
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
    id: "scen_travel_ordering_tapas",
    title: "Ordering Tapas at a Spanish Taberna",
    description: "Order authentic Iberian ham, patatas bravas, and sparkling mineral water from a bustling tapas bar.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Taberna La Latina, Madrid",
    characterName: "Yoe",
    characterRole: "Tapas Bar Waiter",
    avatar: "\u{1F958}",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["tapas", "raci\xF3n", "jam\xF3n ib\xE9rico", "patatas bravas", "agua con gas"],
    initialGreeting: "\xA1Hola! \xBFQu\xE9 os apetece tomar para picar hoy? Tenemos una tortilla reci\xE9n hecha y jam\xF3n de bellota.",
    initialGreetingTranslation: "Hello! What would you like to have for snacks today? We have freshly made tortilla and cured ham.",
    objectives: [
      { id: "obj_ot_1", text: "Order a portion of patatas bravas and tortilla", completed: false, hint: "Say: Para empezar, una raci\xF3n de patatas bravas y un trozo de tortilla, por favor." },
      { id: "obj_ot_2", text: "Ask for beverage recommendations", completed: false, hint: "Say: \xBFQu\xE9 vino tinto de la casa me recomienda?" },
      { id: "obj_ot_3", text: "Ask for the bill at the end of meal", completed: false, hint: "Say: La cuenta, cuando pueda, por favor." }
    ]
  },
  {
    id: "scen_travel_boutique_shopping",
    title: "Boutique Souvenir & Clothing Shopping",
    description: "Browse local artisan gifts, inquire about sizes, try on clothing in fitting rooms, and ask about tax refunds.",
    category: "travel",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "El Born Artisan District, Barcelona",
    characterName: "Yoe",
    characterRole: "Boutique Store Clerk",
    avatar: "\u{1F6CD}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["talla", "probador", "precio", "descuento", "regalo"],
    initialGreeting: "\xA1Hola! Bienvenidos a nuestra tienda artesanal. Si buscas alguna talla o regalo en especial, av\xEDsame.",
    initialGreetingTranslation: "Hello! Welcome to our artisan boutique. If you are looking for any size or special gift, let me know.",
    objectives: [
      { id: "obj_bs_1", text: "Ask for a shirt in a medium or large size", completed: false, hint: "Say: Me gusta esta camisa, \xBFla tiene en talla mediana?" },
      { id: "obj_bs_2", text: "Ask where the fitting rooms (probadores) are", completed: false, hint: "Say: \xBFD\xF3nde est\xE1n los probadores para prob\xE1rmela?" },
      { id: "obj_bs_3", text: "Ask if tax-free tourist refund forms are provided", completed: false, hint: "Say: \xBFOfrecen formulario de Tax Free para turistas?" }
    ]
  },
  {
    id: "scen_travel_market_prices",
    title: "Asking Prices at the Farmers Market",
    description: "Select fresh seasonal fruits, ask the price per kilogram, and practice friendly bargaining etiquette.",
    category: "travel",
    targetLanguage: "fr",
    cefrLevel: "A1",
    location: "March\xE9 Bastille, Paris",
    characterName: "Yoe",
    characterRole: "Fruit & Vegetable Merchant",
    avatar: "\u{1F353}",
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["combien co\xFBte", "kilo", "fraises", "m\xFBr", "march\xE9"],
    initialGreeting: "Bonjour ! Regardez nos belles fraises de saison et nos avocats bien m\xFBrs. Que d\xE9sirez-vous ?",
    initialGreetingTranslation: "Good morning! Look at our beautiful seasonal strawberries and ripe avocados. What would you like?",
    objectives: [
      { id: "obj_mp_1", text: "Ask the price per kilo for strawberries", completed: false, hint: "Say: Bonjour ! Combien co\xFBte le kilo de fraises ?" },
      { id: "obj_mp_2", text: "Order 500 grams of tomatoes and ripe oranges", completed: false, hint: "Say: Je voudrais cinq cents grammes de tomates et deux oranges bien m\xFBres." },
      { id: "obj_mp_3", text: "Ask for the total amount and pay in cash", completed: false, hint: "Say: \xC7a fait combien en tout ? Voici cinq euros." }
    ]
  },
  {
    id: "scen_travel_emergency_lost_passport",
    title: "Consulate Visit: Lost Passport & Emergency",
    description: "Visit the consular services office to report a stolen passport and apply for an emergency travel document.",
    category: "travel",
    targetLanguage: "en",
    cefrLevel: "B1",
    location: "Embassy Consular Section, Rome",
    characterName: "Yoe",
    characterRole: "Consular Assistance Officer",
    avatar: "\u{1F6E1}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["passport", "police report", "emergency travel document", "embassy", "flight"],
    initialGreeting: "Good morning. Please take a seat. I understand you lost your passport and need emergency travel documentation?",
    initialGreetingTranslation: "Good morning. Please take a seat. I understand you lost your passport and need emergency travel documentation?",
    objectives: [
      { id: "obj_ep_1", text: "Explain when and where your passport was lost or stolen", completed: false, hint: "Say: My backpack was stolen yesterday on the train, and my passport was inside." },
      { id: "obj_ep_2", text: "Present your official police report copy", completed: false, hint: "Say: I have the police report right here along with a photocopy of my ID." },
      { id: "obj_ep_3", text: "Ask for an emergency document for an upcoming flight", completed: false, hint: "Say: My flight home is tomorrow evening. Can I get an emergency passport today?" }
    ]
  },
  // ==========================================
  // 2. DAILY LIFE & ESSENTIALS (16 Situations)
  // ==========================================
  {
    id: "scen_a1_intro_maya",
    title: "Introduce Yourself & Make a Friend",
    description: "Break the ice in a friendly setting, share your name, where you are from, and your favorite hobbies.",
    category: "daily",
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
    id: "scen_daily_meeting_neighbor",
    title: "Meeting a New Neighbor in the Building",
    description: "Introduce yourself in the building hallway, exchange apartment numbers, and offer neighborly help.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Residential Building Lobby, Valencia",
    characterName: "Yoe",
    characterRole: "Next-Door Neighbor",
    avatar: "\u{1F3E1}",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["vecino", "edificio", "piso", "encantado", "ayuda"],
    initialGreeting: "\xA1Hola! He visto que te acabas de mudar. Soy Yoe, vivo en el piso 3B. \xA1Bienvenido al edificio!",
    initialGreetingTranslation: "Hello! I saw that you just moved in. I am Yoe, I live in apartment 3B. Welcome to the building!",
    objectives: [
      { id: "obj_mn_1", text: "Thank the neighbor and share your apartment number", completed: false, hint: "Say: \xA1Muchas gracias! Me llamo... y vivo en el 3A, justo al lado." },
      { id: "obj_mn_2", text: "Mention how long you have lived in the city", completed: false, hint: "Say: Me mud\xE9 hace dos semanas a Valencia por trabajo." },
      { id: "obj_mn_3", text: "Express readiness to help if needed", completed: false, hint: "Say: Si necesitas cualquier cosa, no dudes en llamar a mi puerta." }
    ]
  },
  {
    id: "scen_daily_small_talk_weather",
    title: "Casual Small Talk & The Weekend Weather",
    description: "Chat with a friendly barista or acquaintance about the sunny weekend weather and local outdoor parks.",
    category: "daily",
    targetLanguage: "fr",
    cefrLevel: "A1",
    location: "Parkside Kiosk, Jardin du Luxembourg, Paris",
    characterName: "Yoe",
    characterRole: "Kiosk Barista",
    avatar: "\u2600\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["beau temps", "soleil", "ce week-end", "parc", "promenade"],
    initialGreeting: "Bonjour ! Quel soleil magnifique aujourd'hui, n'est-ce pas ? Vous profitez de cette belle journ\xE9e ?",
    initialGreetingTranslation: "Good morning! What magnificent sunshine today, isn't it? Are you enjoying this lovely day?",
    objectives: [
      { id: "obj_st_1", text: "Agree enthusiastically about the pleasant temperature", completed: false, hint: "Say: Oui, il fait vraiment tr\xE8s beau et doux aujourd'hui !" },
      { id: "obj_st_2", text: "Mention your plans to walk or read in the park", completed: false, hint: "Say: Je vais faire une promenade dans le jardin cet apr\xE8s-midi." },
      { id: "obj_st_3", text: "Ask about expected rain or forecast for tomorrow", completed: false, hint: "Say: Pensez-vous qu'il fera beau aussi demain ?" }
    ]
  },
  {
    id: "scen_daily_talking_hobbies",
    title: "Discussing Hobbies & Favorite Passions",
    description: "Share your enthusiasm for cooking, photography, sports, and language learning with a fellow hobbyist.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Cultural Arts Center Lounge, Seville",
    characterName: "Yoe",
    characterRole: "Photography Club Member",
    avatar: "\u{1F3A8}",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["pasatiempo", "fotograf\xEDa", "cocinar", "tocar la guitarra", "fin de semana"],
    initialGreeting: "\xA1Hola! Estaba admirando esta galer\xEDa de fotos. \xBFQu\xE9 sueles hacer los fines de semana para desconectar?",
    initialGreetingTranslation: "Hello! I was admiring this photo gallery. What do you usually do on weekends to unwind?",
    objectives: [
      { id: "obj_th_1", text: "Describe two hobbies you practice regularly", completed: false, hint: "Say: Me encanta la fotograf\xEDa urbana y tambi\xE9n cocinar platos tradicionales." },
      { id: "obj_th_2", text: "Explain why you find these activities relaxing", completed: false, hint: "Say: Me ayuda a relajarme despu\xE9s de una larga semana de estudio." },
      { id: "obj_th_3", text: "Ask Yoe about their creative interests", completed: false, hint: "Say: \xBFY t\xFA? \xBFDesde cu\xE1ndo practicas fotograf\xEDa?" }
    ]
  },
  {
    id: "scen_daily_making_plans",
    title: "Making Weekend Coffee Plans with a Colleague",
    description: "Coordinate a time, place, and activity to meet up over the weekend with a friend.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Plaza del Sol, Madrid",
    characterName: "Yoe",
    characterRole: "College Friend",
    avatar: "\u2615",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["quedar", "s\xE1bado por la tarde", "cafeter\xEDa", "hora", "te parece bien"],
    initialGreeting: "\xA1Hola! Tenemos que ponernos al d\xEDa. \xBFTienes planes para este s\xE1bado por la tarde?",
    initialGreetingTranslation: "Hello! We need to catch up. Do you have plans for this Saturday afternoon?",
    objectives: [
      { id: "obj_mp_1", text: "Propose meeting at 4:30 PM at a central cafe", completed: false, hint: "Say: Estoy libre el s\xE1bado. \xBFQuedamos a las cuatro y media en el centro?" },
      { id: "obj_mp_2", text: "Suggest a specialty coffee shop with outdoor seating", completed: false, hint: "Say: Conozco una cafeter\xEDa muy bonita con terraza cerca de la plaza." },
      { id: "obj_mp_3", text: "Confirm the meetup time and exchange confirmation", completed: false, hint: "Say: Perfecto, nos vemos el s\xE1bado a las cuatro y media all\xED." }
    ]
  },
  {
    id: "scen_daily_invitation_accepting",
    title: "Accepting a Dinner Party Invitation",
    description: "Accept a friend's dinner invitation warmly, ask what you can bring, and check dietary restrictions.",
    category: "daily",
    targetLanguage: "fr",
    cefrLevel: "A2",
    location: "Caf\xE9 Terrace, Lyon",
    characterName: "Yoe",
    characterRole: "Dinner Party Host",
    avatar: "\u{1F389}",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["invitation", "d\xEEner", "avec grand plaisir", "apporter", "dessert"],
    initialGreeting: "Salut ! J'organise un d\xEEner vendredi soir chez moi avec quelques amis. Serais-tu disponible pour venir ?",
    initialGreetingTranslation: "Hi! I am hosting a dinner this Friday evening at my place with a few friends. Would you be free to come?",
    objectives: [
      { id: "obj_ia_1", text: "Accept the invitation with enthusiasm", completed: false, hint: "Say: Avec grand plaisir ! Merci beaucoup pour l'invitation." },
      { id: "obj_ia_2", text: "Ask what you can bring (dessert or drinks)", completed: false, hint: "Say: Que puis-je apporter ? Une bouteille de vin ou un dessert ?" },
      { id: "obj_ia_3", text: "Confirm the start time and address details", completed: false, hint: "Say: \xC0 quelle heure dois-je arriver vendredi soir ?" }
    ]
  },
  {
    id: "scen_daily_invitation_declining",
    title: "Declining an Invitation Politely",
    description: "Thank a colleague for an invitation, explain a prior commitment gracefully, and suggest a future raincheck.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Office Lounge, Barcelona",
    characterName: "Yoe",
    characterRole: "Work Colleague",
    avatar: "\u{1F91D}",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["lo siento", "compromiso previo", "otra ocasi\xF3n", "gracias por invitarme", "la pr\xF3xima semana"],
    initialGreeting: "\xA1Hola! Varios compa\xF1eros vamos a cenar juntos el jueves por la noche. \xBFTe gustar\xEDa unirte a nosotros?",
    initialGreetingTranslation: "Hello! Several coworkers are going out for dinner on Thursday night. Would you like to join us?",
    objectives: [
      { id: "obj_id_1", text: "Thank colleague and express polite regret", completed: false, hint: "Say: Muchas gracias por invitarme, me encantar\xEDa pero ya tengo un compromiso previo." },
      { id: "obj_id_2", text: "Briefly mention family or study obligation", completed: false, hint: "Say: Tengo una clase importante el jueves por la noche." },
      { id: "obj_id_3", text: "Suggest grabbing lunch or coffee next week instead", completed: false, hint: "Say: \xBFPodr\xEDamos tomar un caf\xE9 la pr\xF3xima semana para compensarlo?" }
    ]
  },
  {
    id: "scen_daily_asking_help",
    title: "Asking for Help & Favors Politely",
    description: "Ask a library clerk or study partner for help finding references and using high-tech scanners.",
    category: "daily",
    targetLanguage: "en",
    cefrLevel: "A1",
    location: "Central Public Library",
    characterName: "Yoe",
    characterRole: "Reference Librarian",
    avatar: "\u{1F4DA}",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["excuse me", "could you help me", "looking for", "scanner", "thank you"],
    initialGreeting: "Hello! Welcome to the library. Are you looking for a specific section or research material?",
    initialGreetingTranslation: "Hello! Welcome to the library. Are you looking for a specific section or research material?",
    objectives: [
      { id: "obj_ah_1", text: "Excuse yourself politely and explain what book you need", completed: false, hint: "Say: Excuse me, could you please help me find the language learning section?" },
      { id: "obj_ah_2", text: "Ask how to operate the digital book scanner", completed: false, hint: "Say: How do I scan these pages to my USB drive?" },
      { id: "obj_ah_3", text: "Thank the librarian for their assistance", completed: false, hint: "Say: Thank you very much for your kind help!" }
    ]
  },
  {
    id: "scen_daily_doctor_appointment",
    title: "Making a Doctor Appointment",
    description: "Call a clinic reception desk to schedule a general health checkup, describe availability, and provide insurance info.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Cl\xEDnica Salud Integral, Madrid",
    characterName: "Yoe",
    characterRole: "Medical Receptionist",
    avatar: "\u{1FA7A}",
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["cita m\xE9dica", "doctor", "consulta", "seguro m\xE9dico", "disponibilidad"],
    initialGreeting: "Buenos d\xEDas, Cl\xEDnica Salud Integral. \xBFEn qu\xE9 especialidad m\xE9dica desea solicitar su cita?",
    initialGreetingTranslation: "Good morning, Integral Health Clinic. In which medical specialty would you like to request your appointment?",
    objectives: [
      { id: "obj_da_1", text: "Request an appointment with a general doctor", completed: false, hint: "Say: Buenos d\xEDas, quisiera pedir una cita con el m\xE9dico de cabecera, por favor." },
      { id: "obj_da_2", text: "Specify preference for mornings this week", completed: false, hint: "Say: \xBFTiene disponibilidad este jueves o viernes por la ma\xF1ana?" },
      { id: "obj_da_3", text: "Confirm your name and insurance policy details", completed: false, hint: "Say: Tengo seguro privado con Sanitas. Mi n\xFAmero de p\xF3liza es..." }
    ]
  },
  {
    id: "scen_daily_pharmacy_visit",
    title: "Visiting the Local Pharmacy",
    description: "Describe minor cold and throat symptoms to the pharmacist, ask for dosage advice, and purchase lozenges.",
    category: "daily",
    targetLanguage: "fr",
    cefrLevel: "A1",
    location: "Pharmacie Centrale, Bordeaux",
    characterName: "Yoe",
    characterRole: "Pharmacist",
    avatar: "\u{1F48A}",
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["maux de gorge", "rhume", "m\xE9dicament", "posologie", "pastilles"],
    initialGreeting: "Bonjour ! Comment puis-je vous conseiller aujourd'hui ? Avez-vous une ordonnance ?",
    initialGreetingTranslation: "Good morning! How may I advise you today? Do you have a prescription?",
    objectives: [
      { id: "obj_pv_1", text: "Explain that you have a sore throat and slight headache", completed: false, hint: "Say: Bonjour. J'ai mal \xE0 la gorge et un peu mal \xE0 la t\xEAte depuis hier." },
      { id: "obj_pv_2", text: "Ask for throat lozenges and vitamin C", completed: false, hint: "Say: Avez-vous des pastilles pour la gorge sans ordonnance ?" },
      { id: "obj_pv_3", text: "Ask how many times per day to take them", completed: false, hint: "Say: Combien de fois par jour dois-je prendre ces comprim\xE9s ?" }
    ]
  },
  {
    id: "scen_daily_bank_account",
    title: "Opening an Account at the Local Bank",
    description: "Inquire about student or standard checking accounts, debit cards, mobile banking app access, and required ID.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Banco Santander Branch, Madrid",
    characterName: "Yoe",
    characterRole: "Bank Account Officer",
    avatar: "\u{1F3E6}",
    imageUrl: "https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["cuenta bancaria", "tarjeta de d\xE9bito", "transferencias", "comisiones", "pasaporte"],
    initialGreeting: "\xA1Hola, buenos d\xEDas! Tome asiento. \xBFDesea abrir una cuenta corriente con nosotros hoy?",
    initialGreetingTranslation: "Hello, good morning! Have a seat. Would you like to open a checking account with us today?",
    objectives: [
      { id: "obj_ba_1", text: "State that you want to open a basic checking account", completed: false, hint: "Say: Buenos d\xEDas, quisiera abrir una cuenta corriente sin comisiones de mantenimiento." },
      { id: "obj_ba_2", text: "Inquire about contactless debit cards and app access", completed: false, hint: "Say: \xBFLa cuenta incluye tarjeta de d\xE9bito y acceso a la aplicaci\xF3n m\xF3vil?" },
      { id: "obj_ba_3", text: "Show passport and proof of local address", completed: false, hint: "Say: Aqu\xED tiene mi pasaporte y el contrato de alquiler para la direcci\xF3n." }
    ]
  },
  {
    id: "scen_daily_post_office",
    title: "Mailing a Parcel at the Post Office",
    description: "Weigh a box, choose standard or express airmail shipping, fill in customs forms, and purchase stamps.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Oficina de Correos, Centro, Madrid",
    characterName: "Yoe",
    characterRole: "Postal Clerk",
    avatar: "\u{1F4E6}",
    imageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["paquete", "enviar", "urgente", "sellos", "c\xF3digo postal"],
    initialGreeting: "\xA1Siguiente! Buenas tardes. Ponga el paquete sobre la b\xE1scula, por favor. \xBFAd\xF3nde va dirigido?",
    initialGreetingTranslation: "Next! Good afternoon. Please place the parcel on the scale. Where is it addressed to?",
    objectives: [
      { id: "obj_po_1", text: "State destination country and parcel contents", completed: false, hint: "Say: Buenas tardes, quiero enviar este paquete a Francia con libros y ropa." },
      { id: "obj_po_2", text: "Ask the difference between standard and express postage", completed: false, hint: "Say: \xBFCu\xE1nto tarda el env\xEDo urgente y cu\xE1l es la diferencia de precio?" },
      { id: "obj_po_3", text: "Request a tracking number (n\xFAmero de seguimiento)", completed: false, hint: "Say: \xBFViene con n\xFAmero de seguimiento para rastrear el paquete?" }
    ]
  },
  {
    id: "scen_daily_supermarket_checkout",
    title: "Grocery Shopping & Supermarket Checkout",
    description: "Ask for grocery section aisles, inquire about organic produce, and complete checkout with shopping bags.",
    category: "daily",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Mercadona Supermarket, Valencia",
    characterName: "Yoe",
    characterRole: "Supermarket Cashier",
    avatar: "\u{1F6D2}",
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["bolsa", "tarjeta", "ticket", "pasillo", "leche"],
    initialGreeting: "\xA1Hola! \xBFQuiere que le cobre todo junto? \xBFVa a necesitar bolsa de pl\xE1stico o de papel?",
    initialGreetingTranslation: "Hello! Would you like me to scan everything together? Will you need a plastic or paper bag?",
    objectives: [
      { id: "obj_sc_1", text: "Request one reusable paper shopping bag", completed: false, hint: "Say: Hola, una bolsa de papel, por favor." },
      { id: "obj_sc_2", text: "Indicate payment by credit card contactlessly", completed: false, hint: "Say: Voy a pagar con tarjeta de cr\xE9dito contacless." },
      { id: "obj_sc_3", text: "Politely ask for the receipt (ticket de compra)", completed: false, hint: "Say: \xBFMe da el ticket de compra, por favor? Muchas gracias." }
    ]
  },
  // ==========================================
  // 3. WORK & PROFESSIONAL (12 Situations)
  // ==========================================
  {
    id: "scen_work_job_interview",
    title: "Job Interview & Career Background",
    description: "Present your professional skills, highlight relevant project accomplishments, and answer situational questions.",
    category: "work",
    targetLanguage: "en",
    cefrLevel: "B2",
    location: "Tech Innovation Hub, London",
    characterName: "Yoe",
    characterRole: "Hiring Manager",
    avatar: "\u{1F4BC}",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["experience", "strengths", "collaboration", "deliverables", "challenges"],
    initialGreeting: "Welcome! Thank you for coming in today. To start off, could you walk me through your background and what motivated you to apply?",
    initialGreetingTranslation: "Welcome! Thank you for coming in today. To start off, could you walk me through your background and what motivated you to apply?",
    objectives: [
      { id: "obj_ji_1", text: "Summarize your recent experience and core strengths", completed: false, hint: "Say: Over the past three years, I have specialized in building responsive web applications..." },
      { id: "obj_ji_2", text: "Describe a challenging project you successfully delivered", completed: false, hint: "Say: In my last role, our team overcame tight deadlines by improving asynchronous communication." },
      { id: "obj_ji_3", text: "Ask an insightful question about team culture and growth", completed: false, hint: "Say: What are the main milestones your engineering team is aiming for this quarter?" }
    ]
  },
  {
    id: "scen_work_first_day_office",
    title: "First Day at the Company & Onboarding",
    description: "Meet your onboarding buddy, set up your workstation credentials, and learn office routines.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Modern Coworking Campus, Madrid",
    characterName: "Yoe",
    characterRole: "Onboarding Buddy",
    avatar: "\u{1F3E2}",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["primer d\xEDa", "puesto de trabajo", "reuni\xF3n de equipo", "cafeter\xEDa", "bienvenida"],
    initialGreeting: "\xA1Hola y bienvenido al equipo! Soy Yoe, tu compa\xF1ero de bienvenida durante esta primera semana. \xBFC\xF3mo te sientes?",
    initialGreetingTranslation: "Hello and welcome to the team! I am Yoe, your onboarding buddy for this first week. How are you feeling?",
    objectives: [
      { id: "obj_fd_1", text: "Express enthusiasm for starting the new role", completed: false, hint: "Say: \xA1Muchas gracias Yoe! Estoy muy ilusionado por empezar a trabajar con todos." },
      { id: "obj_fd_2", text: "Ask where the daily team sync and lunch area are", completed: false, hint: "Say: \xBFA qu\xE9 hora suele ser la reuni\xF3n diaria de equipo y d\xF3nde est\xE1 la cocina?" },
      { id: "obj_fd_3", text: "Confirm your Slack and repository access permissions", completed: false, hint: "Say: Ya tengo acceso al correo, \xBFme puedes a\xF1adir al canal del proyecto?" }
    ]
  },
  {
    id: "scen_work_team_standup",
    title: "Sprint Planning & Daily Team Standup",
    description: "Give a concise 90-second update on yesterday's tasks, current sprint blockers, and today's goals.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Design Studio Boardroom, Barcelona",
    characterName: "Yoe",
    characterRole: "Sprint Team Lead",
    avatar: "\u{1F4CA}",
    imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["sprint", "bloqueo", "objetivo de hoy", "completado", "revisi\xF3n"],
    initialGreeting: "Buenos d\xEDas a todos. Empezamos la reuni\xF3n diaria de sincronizaci\xF3n. \xBFQui\xE9n quiere compartir su actualizaci\xF3n primero?",
    initialGreetingTranslation: "Good morning everyone. Let's start the daily sync meeting. Who would like to share their update first?",
    objectives: [
      { id: "obj_ts_1", text: "State what task you completed yesterday", completed: false, hint: "Say: Ayer complet\xE9 la integraci\xF3n de la API y las pruebas de rendimiento." },
      { id: "obj_ts_2", text: "State your key focus area for today", completed: false, hint: "Say: Hoy me enfocar\xE9 en redise\xF1ar la interfaz de usuario seg\xFAn las recomendaciones." },
      { id: "obj_ts_3", text: "State whether you have any blockers or need pair review", completed: false, hint: "Say: No tengo bloqueos t\xE9cnicos, solo necesitar\xE9 una revisi\xF3n de c\xF3digo al final del d\xEDa." }
    ]
  },
  {
    id: "scen_work_project_deadline",
    title: "Discussing a Critical Project Deadline",
    description: "Negotiate scope adjustments with a manager to ensure quality delivery before an upcoming product release.",
    category: "work",
    targetLanguage: "fr",
    cefrLevel: "B2",
    location: "Executive Office, Paris",
    characterName: "Yoe",
    characterRole: "Product Director",
    avatar: "\u{1F4C8}",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["d\xE9lai", "livraison", "priorit\xE9s", "ajustement", "qualit\xE9"],
    initialGreeting: "Bonjour. Nous devons faire le point sur le calendrier de livraison du projet. Pensez-vous que nous tiendrons l'\xE9ch\xE9ance du 15 ?",
    initialGreetingTranslation: "Good morning. We need to review the project delivery schedule. Do you think we will meet the 15th deadline?",
    objectives: [
      { id: "obj_pdl_1", text: "Analyze progress realistically and highlight critical paths", completed: false, hint: "Say: Nous avons bien avanc\xE9 sur le c\u0153ur du syst\xE8me, mais les tests finaux demandent plus de temps." },
      { id: "obj_pdl_2", text: "Propose launching core features first while deferring minor ones", completed: false, hint: "Say: Je propose de prioriser les fonctionnalit\xE9s essentielles pour le 15 et de reporter les options secondaires." },
      { id: "obj_pdl_3", text: "Agree on a revised quality validation milestone", completed: false, hint: "Say: Ainsi, nous garantissons une qualit\xE9 irr\xE9prochable pour la version de lancement." }
    ]
  },
  {
    id: "scen_work_asking_clarification",
    title: "Asking for Task Clarification & Technical Specs",
    description: "Ask a colleague to clarify requirements on a design brief or technical document without hesitation.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Engineering Hub, Madrid",
    characterName: "Yoe",
    characterRole: "Senior Tech Lead",
    avatar: "\u{1F4A1}",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["duda", "especificaciones", "requisito", "explicaci\xF3n", "dise\xF1o"],
    initialGreeting: "\xA1Hola! He subido el documento de requisitos del m\xF3dulo. \xBFTienes alguna duda antes de empezar a programar?",
    initialGreetingTranslation: "Hello! I have uploaded the module requirements document. Do you have any questions before starting to code?",
    objectives: [
      { id: "obj_ac_1", text: "State which specific section needs clarification", completed: false, hint: "Say: Hola Yoe, tengo una duda sobre el apartado de autenticaci\xF3n de usuarios." },
      { id: "obj_ac_2", text: "Ask about the expected input format", completed: false, hint: "Say: \xBFCu\xE1l es el formato exacto que debe devolver la funci\xF3n?" },
      { id: "obj_ac_3", text: "Confirm when you will send the first draft", completed: false, hint: "Say: Perfecto, te enviar\xE9 un primer borrador ma\xF1ana por la tarde." }
    ]
  },
  {
    id: "scen_work_client_support",
    title: "Handling a Priority Client Consultation",
    description: "Listen attentively to a client's software issue, troubleshoot politely, and offer a quick resolution.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Customer Success Hub, Barcelona",
    characterName: "Yoe",
    characterRole: "Corporate Client",
    avatar: "\u{1F3A7}",
    imageUrl: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["asistencia", "incidencia", "resoluci\xF3n", "cuenta", "actualizaci\xF3n"],
    initialGreeting: "Hola, buenos d\xEDas. No podemos acceder a nuestro panel de control desde esta ma\xF1ana y tenemos una presentaci\xF3n urgente.",
    initialGreetingTranslation: "Hello, good morning. We cannot access our dashboard since this morning and we have an urgent presentation.",
    objectives: [
      { id: "obj_cs_1", text: "Acknowledge the urgency and reassure the client calmly", completed: false, hint: "Say: Buenos d\xEDas. Lamento mucho el inconveniente, voy a revisar el estado de su cuenta inmediatamente." },
      { id: "obj_cs_2", text: "Ask for the error code or account email", completed: false, hint: "Say: \xBFPodr\xEDa indicarme el correo electr\xF3nico asociado a su cuenta de empresa?" },
      { id: "obj_cs_3", text: "Explain the fix and confirm access is restored", completed: false, hint: "Say: Ya hemos restablecido los permisos de acceso. Por favor, pruebe a iniciar sesi\xF3n de nuevo." }
    ]
  },
  {
    id: "scen_work_contract_negotiation",
    title: "Freelance Scope & Rate Negotiation",
    description: "Discuss freelance project deliverables, timeline milestones, and agree on professional payment terms.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "B2",
    location: "Consulting Suite, Valencia",
    characterName: "Yoe",
    characterRole: "Project Manager",
    avatar: "\u{1F91D}",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["presupuesto", "plazos", "entregables", "tarifa", "contrato"],
    initialGreeting: "Hola. Hemos revisado tu propuesta para el redise\xF1o digital. Nos gusta mucho, pero quisi\xE9ramos ajustar el presupuesto total.",
    initialGreetingTranslation: "Hello. We have reviewed your proposal for the digital redesign. We really like it, but we would like to adjust the total budget.",
    objectives: [
      { id: "obj_cn_1", text: "Explain the value and comprehensive scope of the deliverables", completed: false, hint: "Say: Comprendo su punto. Mi presupuesto incluye la investigaci\xF3n de usuarios, el prototipado y soporte t\xE9cnico post-lanzamiento." },
      { id: "obj_cn_2", text: "Propose flexible milestones or phased delivery", completed: false, hint: "Say: Podr\xEDamos dividir el proyecto en dos fases para adaptarnos a su flujo financiero." },
      { id: "obj_cn_3", text: "Reach an agreement and outline next contractual steps", completed: false, hint: "Say: Si est\xE1n de acuerdo con estos t\xE9rminos, preparar\xE9 el contrato de servicios hoy mismo." }
    ]
  },
  {
    id: "scen_work_business_lunch",
    title: "Professional Business Lunch Etiquette",
    description: "Engage in polite professional small talk, discuss industry trends, and conclude with next collaboration steps.",
    category: "work",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Executive Bistro, Salamanca, Madrid",
    characterName: "Yoe",
    characterRole: "Partner Director",
    avatar: "\u{1F37D}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["almuerzo", "sector", "oportunidades", "colaboraci\xF3n", "brindis"],
    initialGreeting: "\xA1Qu\xE9 placer reunirnos hoy! El restaurante tiene un men\xFA excelente. \xBFC\xF3mo ha ido la semana de conferencias?",
    initialGreetingTranslation: "What a pleasure to meet today! The restaurant has an excellent menu. How has your conference week been?",
    objectives: [
      { id: "obj_bl_1", text: "Share positive impressions of the industry conference", completed: false, hint: "Say: Ha sido muy productiva, he asistido a varias charlas muy inspiradoras sobre inteligencia artificial." },
      { id: "obj_bl_2", text: "Express enthusiasm for future collaborative opportunities", completed: false, hint: "Say: Creo que nuestras empresas tienen grandes sinergias para desarrollar proyectos conjuntos." },
      { id: "obj_bl_3", text: "Suggest follow-up calendar invite for next week", completed: false, hint: "Say: Le enviar\xE9 una invitaci\xF3n formal para agendar una videollamada el pr\xF3ximo martes." }
    ]
  },
  // ==========================================
  // 4. SOCIAL & CULTURE (8 Situations)
  // ==========================================
  {
    id: "scen_social_party_mingling",
    title: "Rooftop Party Mingling & Meeting Friends",
    description: "Strike up lively conversations at an international social mixer, share anecdotes, and make plans.",
    category: "social",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Rooftop Terrace, Santa Cruz, Seville",
    characterName: "Yoe",
    characterRole: "Party Guest",
    avatar: "\u{1F942}",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["fiesta", "m\xFAsica", "conocer gente", "bebida", "terraza"],
    initialGreeting: "\xA1Hola! Qu\xE9 vistas tan incre\xEDbles de la ciudad desde aqu\xED. \xBFC\xF3mo conoces a los anfitriones de la fiesta?",
    initialGreetingTranslation: "Hello! What incredible views of the city from up here. How do you know the party hosts?",
    objectives: [
      { id: "obj_pm_1", text: "Introduce yourself and explain connection to host", completed: false, hint: "Say: \xA1Hola! Me llamo... Soy amigo de Marta de la universidad." },
      { id: "obj_pm_2", text: "Compliment the lively music and city night views", completed: false, hint: "Say: El ambiente y la m\xFAsica est\xE1n geniales esta noche." },
      { id: "obj_pm_3", text: "Ask Yoe where they work or study", completed: false, hint: "Say: \xBFA qu\xE9 te dedicas t\xFA en Sevilla?" }
    ]
  },
  {
    id: "scen_social_talking_movies",
    title: "Talking About Movies & Streaming Series",
    description: "Exchange opinions about recent blockbuster films, favorite directors, and captivating mystery genres.",
    category: "social",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Cinema Foyer, Gran V\xEDa, Madrid",
    characterName: "Yoe",
    characterRole: "Film Enthusiast",
    avatar: "\u{1F37F}",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["pel\xEDcula", "g\xE9nero", "director", "actuaci\xF3n", "recomendaci\xF3n"],
    initialGreeting: "\xA1Qu\xE9 gran final de pel\xEDcula! No me esperaba ese giro de gui\xF3n. \xBFA ti qu\xE9 te ha parecido?",
    initialGreetingTranslation: "What a great movie ending! I did not expect that plot twist. What did you think of it?",
    objectives: [
      { id: "obj_tm_1", text: "Share your genuine impressions of the plot", completed: false, hint: "Say: Me ha parecido fascinante, los giros de la trama estuvieron muy bien construidos." },
      { id: "obj_tm_2", text: "Discuss your favorite movie genres (thriller, sci-fi, comedy)", completed: false, hint: "Say: Suelo preferir el cine de ciencia ficci\xF3n y los thrillers psicol\xF3gicos." },
      { id: "obj_tm_3", text: "Recommend a gripping series you watched recently", completed: false, hint: "Say: Te recomiendo ver la \xFAltima serie de misterio que estrenaron el mes pasado." }
    ]
  },
  {
    id: "scen_social_dinner_friends",
    title: "Dinner with Friends & Splitting the Bill",
    description: "Catch up on personal news over dinner, praise the food, and easily calculate splitting the restaurant bill.",
    category: "social",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Tapas Bistro, Gr\xE0cia, Barcelona",
    characterName: "Yoe",
    characterRole: "Close Friend",
    avatar: "\u{1F958}",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["cena", "amigos", "tapas", "cuenta", "compartir"],
    initialGreeting: "\xA1Qu\xE9 alegr\xEDa vernos despu\xE9s de tanto tiempo! He pedido una tabla de quesos para empezar. \xBFQu\xE9 tal tu semana?",
    initialGreetingTranslation: "So great to see each other after so long! I ordered a cheese platter to start. How was your week?",
    objectives: [
      { id: "obj_df_1", text: "Share a quick highlight from your past week", completed: false, hint: "Say: \xA1Hola Yoe! Mi semana ha sido genial, empec\xE9 unas clases de nataci\xF3n." },
      { id: "obj_df_2", text: "Praise the tapas dishes you are sharing", completed: false, hint: "Say: La comida est\xE1 deliciosa, especialmente las croquetas." },
      { id: "obj_df_3", text: "Propose splitting the bill equally between everyone", completed: false, hint: "Say: Dividimos la cuenta a partes iguales, \xBFte parece bien?" }
    ]
  },
  {
    id: "scen_social_language_exchange",
    title: "Language Exchange Mixer at a Cozy Caf\xE9",
    description: "Meet conversation partners, practice switching languages smoothly, and exchange study tips.",
    category: "social",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Caf\xE9 de las Lenguas, Valencia",
    characterName: "Yoe",
    characterRole: "Exchange Partner",
    avatar: "\u{1F5E3}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["intercambio", "aprender", "idiomas", "pr\xE1ctica", "vocabulario"],
    initialGreeting: "\xA1Hola! Es mi primera vez en este intercambio de idiomas. \xBFLlevas mucho tiempo aprendiendo espa\xF1ol?",
    initialGreetingTranslation: "Hello! It's my first time at this language exchange. Have you been learning Spanish for long?",
    objectives: [
      { id: "obj_le_1", text: "Explain how long you have been learning and your goals", completed: false, hint: "Say: Llevo unos meses estudiando y quiero mejorar mi fluidez al hablar." },
      { id: "obj_le_2", text: "Ask what methods your partner uses to memorize vocabulary", completed: false, hint: "Say: \xBFQu\xE9 aplicaci\xF3n o m\xE9todo usas t\xFA para aprender nuevas palabras?" },
      { id: "obj_le_3", text: "Suggest practicing 15 minutes in Spanish then in your native tongue", completed: false, hint: "Say: Hablamos quince minutos en espa\xF1ol y luego cambiamos, \xBFde acuerdo?" }
    ]
  },
  {
    id: "scen_social_weekend_hiking",
    title: "Planning a Weekend Mountain Hike",
    description: "Coordinate departure times, mountain trail routes, backpack essentials, and weather forecasts with a friend.",
    category: "social",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Outdoor Enthusiasts Club, Granada",
    characterName: "Yoe",
    characterRole: "Hiking Companion",
    avatar: "\u{1F3D4}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["senderismo", "monta\xF1a", "mochila", "ruta", "tiempo"],
    initialGreeting: "\xA1Hola! El pron\xF3stico del tiempo para el s\xE1bado en Sierra Nevada es perfecto. \xBFQu\xE9 ruta prefieres hacer?",
    initialGreetingTranslation: "Hello! The weather forecast for Saturday in Sierra Nevada is perfect. Which trail do you prefer to take?",
    objectives: [
      { id: "obj_wh_1", text: "Select a moderate scenic trail through pine forests", completed: false, hint: "Say: Me gustar\xEDa hacer la ruta circular de los pinares, tiene vistas incre\xEDbles." },
      { id: "obj_wh_2", text: "Confirm what gear and snacks each person will bring", completed: false, hint: "Say: Yo llevar\xE9 agua, fruta y un botiqu\xEDn b\xE1sico en mi mochila." },
      { id: "obj_wh_3", text: "Set an early meeting time at the trailhead", completed: false, hint: "Say: Quedamos a las ocho de la ma\xF1ana en la entrada del parque para evitar el calor." }
    ]
  },
  {
    id: "scen_social_birthday_toast",
    title: "Birthday Celebration & Giving a Toast",
    description: "Celebrate a close friend's birthday, give a heartfelt toast, and compliment the party decorations.",
    category: "social",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Garden Party, Madrid",
    characterName: "Yoe",
    characterRole: "Birthday Host",
    avatar: "\u{1F382}",
    imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["cumplea\xF1os", "brindis", "regalo", "felicidades", "celebraci\xF3n"],
    initialGreeting: "\xA1Much\xEDsimas gracias por venir a mi fiesta de cumplea\xF1os! \xBFTe apetece una copa para brindar?",
    initialGreetingTranslation: "Thank you so much for coming to my birthday party! Would you like a drink for the toast?",
    objectives: [
      { id: "obj_bt_1", text: "Wish a warm Happy Birthday and hand over a gift", completed: false, hint: "Say: \xA1Feliz cumplea\xF1os Yoe! Espero que disfrutes mucho este d\xEDa. Aqu\xED tienes un peque\xF1o detalle." },
      { id: "obj_bt_2", text: "Propose a cheerful toast with the guests", completed: false, hint: "Say: \xA1Un brindis por Yoe y por muchos a\xF1os m\xE1s de amistad y salud!" },
      { id: "obj_bt_3", text: "Compliment the delicious birthday cake", completed: false, hint: "Say: La tarta de chocolate tiene una pinta incre\xEDble." }
    ]
  },
  // ==========================================
  // 5. PRACTICAL & EMERGENCY (8 Situations)
  // ==========================================
  {
    id: "scen_practical_emergency_dispatch",
    title: "Calling Emergency Dispatch (112)",
    description: "Calmly report an emergency situation, describe exact street coordinates, and state if an ambulance is needed.",
    category: "practical",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Emergency Phone Line, Spain",
    characterName: "Yoe",
    characterRole: "112 Emergency Dispatcher",
    avatar: "\u{1F6A8}",
    imageUrl: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["emergencia", "ambulancia", "calle", "accidente", "heridos"],
    initialGreeting: "Servicio de Emergencias 112. \xBFCu\xE1l es su emergencia y en qu\xE9 localidad se encuentra?",
    initialGreetingTranslation: "112 Emergency Service. What is your emergency and in what municipality are you located?",
    objectives: [
      { id: "obj_ed_1", text: "State clearly that you witnessed a minor traffic collision", completed: false, hint: "Say: Buenas tardes, ha habido un accidente leve entre dos coches en la calle Mayor." },
      { id: "obj_ed_2", text: "Give exact street name and nearby landmark", completed: false, hint: "Say: Estamos frente al n\xFAmero 45, cerca de la estaci\xF3n de metro." },
      { id: "obj_ed_3", text: "Clarify that both drivers are conscious but need checkup", completed: false, hint: "Say: Los conductores est\xE1n conscientes, pero se requiere una ambulancia por precauci\xF3n." }
    ]
  },
  {
    id: "scen_practical_lost_passport",
    title: "Reporting a Lost Passport at Police Station",
    description: "File an official police report (denuncia) for a misplaced passport and request an incident certificate.",
    category: "practical",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Comisar\xEDa de Polic\xEDa Nacional, Madrid",
    characterName: "Yoe",
    characterRole: "Police Officer",
    avatar: "\u{1F6C2}",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["pasaporte", "denuncia", "comisar\xEDa", "p\xE9rdida", "documento"],
    initialGreeting: "Buenos d\xEDas. Tome asiento. \xBFViene a tramitar una denuncia por extrav\xEDo o robo de documentaci\xF3n?",
    initialGreetingTranslation: "Good morning. Take a seat. Are you here to file a report for lost or stolen documents?",
    objectives: [
      { id: "obj_lpass_1", text: "Explain that you lost your passport in the city center yesterday", completed: false, hint: "Say: Buenos d\xEDas, agente. He extraviado mi pasaporte ayer por la tarde en la zona centro." },
      { id: "obj_lpass_2", text: "Provide your nationality, full name, and passport number", completed: false, hint: "Say: Soy de nacionalidad brit\xE1nica y tengo una fotocopia del documento original aqu\xED." },
      { id: "obj_lpass_3", text: "Request a stamped copy of the police certificate for your embassy", completed: false, hint: "Say: \xBFPodr\xEDa facilitarme una copia sellada de la denuncia para presentarla en mi consulado?" }
    ]
  },
  {
    id: "scen_practical_lost_phone",
    title: "Reporting a Lost Smartphone at Transit Desk",
    description: "Inquire at metro lost and found about a phone left on a train, describe device model, case, and lock screen.",
    category: "practical",
    targetLanguage: "fr",
    cefrLevel: "A2",
    location: "RATP Lost & Found Office, Ch\xE2telet, Paris",
    characterName: "Yoe",
    characterRole: "Transit Lost Property Officer",
    avatar: "\u{1F4F1}",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["t\xE9l\xE9phone perdu", "m\xE9tro", "mod\xE8le", "coque", "\xE9cran"],
    initialGreeting: "Bonjour. Vous \xEAtes au bureau des objets trouv\xE9s de la RATP. Avez-vous oubli\xE9 un objet dans les transports ?",
    initialGreetingTranslation: "Hello. You have reached the RATP lost property office. Did you leave an item in transit?",
    objectives: [
      { id: "obj_lp_1", text: "Explain you left your smartphone on Line 1 twenty minutes ago", completed: false, hint: "Say: Bonjour, j'ai oubli\xE9 mon t\xE9l\xE9phone dans la ligne 1 il y a environ vingt minutes." },
      { id: "obj_lp_2", text: "Describe the brand, black protective case, and lock wallpaper", completed: false, hint: "Say: C'est un iPhone noir avec une coque transparente et une photo de montagne en fond d'\xE9cran." },
      { id: "obj_lp_3", text: "Provide alternative contact email or phone for notification", completed: false, hint: "Say: Voici mon adresse e-mail pour me contacter si vous le retrouvez." }
    ]
  },
  {
    id: "scen_practical_car_breakdown",
    title: "Roadside Assistance for Highway Flat Tire",
    description: "Contact roadside assistance, describe highway kilometer marker, hazard lighting, and tow truck request.",
    category: "practical",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Highway Assistance Operator, AP-7 Spain",
    characterName: "Yoe",
    characterRole: "Roadside Assistance Coordinator",
    avatar: "\u{1F697}",
    imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["aver\xEDa", "gr\xFAa", "autopista", "rueda", "arc\xE9n"],
    initialGreeting: "Asistencia en Carretera, d\xEDgame. \xBFSe encuentra usted y su veh\xEDculo en una zona segura?",
    initialGreetingTranslation: "Roadside Assistance, go ahead. Are you and your vehicle in a safe location?",
    objectives: [
      { id: "obj_cb_1", text: "Confirm vehicle is stopped on the shoulder with hazards on", completed: false, hint: "Say: Hola. He pinchado una rueda y estoy detenido en el arc\xE9n con las luces de emergencia puestas." },
      { id: "obj_cb_2", text: "Give exact highway number and kilometer post", completed: false, hint: "Say: Me encuentro en la autopista AP-7, a la altura del kil\xF3metro ciento veinticuatro." },
      { id: "obj_cb_3", text: "Ask estimated arrival time of the assistance tow truck", completed: false, hint: "Say: \xBFCu\xE1nto tiempo tardar\xE1 en llegar la gr\xFAa de asistencia?" }
    ]
  },
  {
    id: "scen_practical_apartment_leak",
    title: "Reporting a Water Leak to Building Maintenance",
    description: "Explain an urgent plumbing leak under the kitchen sink, request immediate repair, and turn off water valve.",
    category: "practical",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "Property Management Office, Valencia",
    characterName: "Yoe",
    characterRole: "Building Maintenance Manager",
    avatar: "\u{1F527}",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["fuga de agua", "fontanero", "tuber\xEDa", "llave de paso", "urgente"],
    initialGreeting: "Servicio de Mantenimiento de la finca. \xBFCu\xE1l es el problema en su piso?",
    initialGreetingTranslation: "Building Maintenance Service. What is the issue in your apartment?",
    objectives: [
      { id: "obj_al_1", text: "Describe a significant water leak under the kitchen pipe", completed: false, hint: "Say: Buenos d\xEDas. Tengo una fuga de agua importante debajo del fregadero de la cocina." },
      { id: "obj_al_2", text: "Confirm you have shut off the main water valve", completed: false, hint: "Say: Ya he cerrado la llave de paso general para evitar que se inunde el suelo." },
      { id: "obj_al_3", text: "Ask for an emergency plumber to visit this morning", completed: false, hint: "Say: \xBFPodr\xEDa enviar a un fontanero de urgencia esta misma ma\xF1ana?" }
    ]
  },
  {
    id: "scen_practical_urgent_clinic",
    title: "Urgent Care Walk-In Clinic Consultation",
    description: "Check in at an urgent medical clinic, explain severe migraine and throat pain, and present insurance card.",
    category: "practical",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Centro de Salud de Urgencias, Zaragoza",
    characterName: "Yoe",
    characterRole: "Clinic Receptionist",
    avatar: "\u{1F3E5}",
    imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["urgencias", "m\xE9dico", "tarjeta sanitaria", "consulta", "dolor"],
    initialGreeting: "Buenas tardes. Bienvenida al centro de salud. \xBFTiene tarjeta sanitaria o seguro privado de viaje?",
    initialGreetingTranslation: "Good afternoon. Welcome to the health center. Do you have a health card or private travel insurance?",
    objectives: [
      { id: "obj_uc_1", text: "Show European health card or travel insurance policy", completed: false, hint: "Say: Buenas tardes. Aqu\xED tiene mi tarjeta sanitaria europea y mi pasaporte." },
      { id: "obj_uc_2", text: "Explain you need to see a doctor for intense throat pain and fever", completed: false, hint: "Say: Necesito ver a un m\xE9dico porque tengo un dolor fuerte de garganta y fiebre alta." },
      { id: "obj_uc_3", text: "Ask which waiting room number you should sit in", completed: false, hint: "Say: \xBFEn qu\xE9 sala de espera debo aguardar a que me llamen?" }
    ]
  },
  {
    id: "scen_practical_feeling_sick",
    title: "Describing Symptoms to a University Nurse",
    description: "Explain fever, fatigue, and throat discomfort, and receive medical guidance on hydration and rest.",
    category: "practical",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Campus Health Center, Salamanca",
    characterName: "Yoe",
    characterRole: "Campus Nurse",
    avatar: "\u{1F321}\uFE0F",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["fiebre", "dolor de cabeza", "garganta", "cansancio", "reposo"],
    initialGreeting: "\xA1Hola! Si\xE9ntate aqu\xED. \xBFQu\xE9 s\xEDntomas tienes y desde cu\xE1ndo te sientes indispuesto?",
    initialGreetingTranslation: "Hello! Have a seat here. What symptoms do you have and since when have you felt unwell?",
    objectives: [
      { id: "obj_fs_1", text: "Explain that you have had a mild fever since yesterday morning", completed: false, hint: "Say: Tengo fiebre leve y dolor de cabeza desde ayer por la ma\xF1ana." },
      { id: "obj_fs_2", text: "Describe feeling very tired with muscle aches", completed: false, hint: "Say: Me siento muy cansado y me duelen los m\xFAsculos." },
      { id: "obj_fs_3", text: "Ask if you should take medication and rest for two days", completed: false, hint: "Say: \xBFQu\xE9 medicamento me recomienda tomar y cu\xE1ntos d\xEDas de reposo necesito?" }
    ]
  },
  // ==========================================
  // 6. DINING & CULINARY (4 Situations)
  // ==========================================
  {
    id: "scen_dining_tapas_bar",
    title: "Ordering Tapas & Regional Wine in Madrid",
    description: "Order authentic tapas specialties, ask about local house wines, and request recommendations.",
    category: "dining",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Taberna La Latina, Madrid",
    characterName: "Yoe",
    characterRole: "Taberna Bartender",
    avatar: "\u{1F377}",
    imageUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["tapas", "vino tinto", "raci\xF3n", "patatas bravas", "recomendar"],
    initialGreeting: "\xA1Buenas! \xBFQu\xE9 os pongo de beber para empezar mientras mir\xE1is la carta de tapas?",
    initialGreetingTranslation: "Hello! What can I get you to drink to start while you look over the tapas menu?",
    objectives: [
      { id: "obj_dt_1", text: "Order a glass of Rioja red wine and sparkling water", completed: false, hint: "Say: Hola, una copa de vino tinto Rioja y un agua con gas, por favor." },
      { id: "obj_dt_2", text: "Ask what the house specialty tapa is", completed: false, hint: "Say: \xBFCu\xE1l es la especialidad de la casa que m\xE1s nos recomienda?" },
      { id: "obj_dt_3", text: "Order a portion of patatas bravas and jam\xF3n ib\xE9rico", completed: false, hint: "Say: P\xF3nganos una raci\xF3n de patatas bravas y una de jam\xF3n ib\xE9rico." }
    ]
  },
  {
    id: "scen_dining_gluten_free",
    title: "Inquiring About Gluten-Free & Vegan Menu Options",
    description: "Ask the waiter about allergen cross-contamination, lactose-free substitutes, and plant-based dishes.",
    category: "dining",
    targetLanguage: "es",
    cefrLevel: "A2",
    location: "Bistro Org\xE1nico, Palma de Mallorca",
    characterName: "Yoe",
    characterRole: "Restaurant Server",
    avatar: "\u{1F957}",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["sin gluten", "vegano", "alergia", "ingredientes", "l\xE1cteos"],
    initialGreeting: "\xA1Buenas tardes! Aqu\xED tienen la carta. \xBFTienen alguna alergia o preferencia alimentaria que debamos saber?",
    initialGreetingTranslation: "Good afternoon! Here is the menu. Do you have any allergies or dietary preferences we should know about?",
    objectives: [
      { id: "obj_gf_1", text: "Explain that you are gluten intolerant (celiac)", completed: false, hint: "Say: S\xED, soy cel\xEDaco y no puedo consumir nada con gluten ni trazas de trigo." },
      { id: "obj_gf_2", text: "Ask if the risotto or salads can be made completely vegan", completed: false, hint: "Say: \xBFEl risotto de setas se puede preparar sin queso ni mantequilla?" },
      { id: "obj_gf_3", text: "Confirm separate kitchen preparation to avoid cross-contact", completed: false, hint: "Say: \xBFTienen cuidado en la cocina con la contaminaci\xF3n cruzada? Muchas gracias." }
    ]
  },
  // ==========================================
  // 7. SHOPPING & FASHION (4 Situations)
  // ==========================================
  {
    id: "scen_shopping_clothes_size",
    title: "Trying on Clothes & Inquiring for Sizes",
    description: "Ask store staff for a different garment size, inquire about fitting room locations, and check color choices.",
    category: "shopping",
    targetLanguage: "es",
    cefrLevel: "A1",
    location: "Boutique de Moda, Passeig de Gr\xE0cia, Barcelona",
    characterName: "Yoe",
    characterRole: "Fashion Store Associate",
    avatar: "\u{1F457}",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["talla", "probador", "color", "camisa", "quedar bien"],
    initialGreeting: "\xA1Hola! Si necesitas probarte alguna prenda, los probadores est\xE1n al fondo a la izquierda. \xBFBuscas alguna talla?",
    initialGreetingTranslation: "Hello! If you need to try on any garment, the fitting rooms are at the back on the left. Are you looking for a size?",
    objectives: [
      { id: "obj_scs_1", text: "Ask if this jacket is available in size Medium", completed: false, hint: "Say: Hola, \xBFtienen esta chaqueta en la talla mediana?" },
      { id: "obj_scs_2", text: "Ask where the fitting rooms are located", completed: false, hint: "Say: \xBFD\xF3nde est\xE1n los probadores para prob\xE1rmela?" },
      { id: "obj_scs_3", text: "Say that you love how it fits and will take it", completed: false, hint: "Say: Me queda genial, me la llevo. \xBFD\xF3nde puedo pagar?" }
    ]
  },
  {
    id: "scen_shopping_flea_market",
    title: "Vintage Bargaining at El Rastro Flea Market",
    description: "Browse antique book and handicraft stalls, ask about vintage histories, and negotiate a friendly price discount.",
    category: "shopping",
    targetLanguage: "es",
    cefrLevel: "B1",
    location: "El Rastro Market, La Latina, Madrid",
    characterName: "Yoe",
    characterRole: "Antique Vendor",
    avatar: "\u{1F3FA}",
    imageUrl: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80",
    vocabularyDomain: ["antig\xFCedades", "regatear", "precio", "descuento", "artesan\xEDa"],
    initialGreeting: "\xA1Hola! Echa un vistazo sin compromiso. Tenemos piezas de cer\xE1mica y libros antiguos muy bien conservados.",
    initialGreetingTranslation: "Hello! Take a look with no obligation. We have beautifully preserved ceramics and vintage books.",
    objectives: [
      { id: "obj_fm_1", text: "Ask about the origins of a vintage ceramic vase", completed: false, hint: "Say: Buenos d\xEDas. \xBFDe qu\xE9 a\xF1o y regi\xF3n es este jarr\xF3n de cer\xE1mica?" },
      { id: "obj_fm_2", text: "Ask if the vendor can give a small discount for buying two items", completed: false, hint: "Say: Si me llevo el jarr\xF3n y este libro antiguo, \xBFme podr\xEDa hacer un peque\xF1o descuento?" },
      { id: "obj_fm_3", text: "Agree on a fair price and pay in cash", completed: false, hint: "Say: Me parece un trato justo. Aqu\xED tiene treinta euros en efectivo." }
    ]
  },
  // Advanced CEFR C1 & C2 Practice Scenarios from Curriculum
  ...C1_C2_SCENARIOS
];
var INITIAL_DATABASE_COURSES = [
  ...COMPREHENSIVE_COURSES
];

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
var PersistentDatabase = class {
  constructor() {
    this.pool = null;
    this.isPostgresConnected = false;
    this.localStore = {
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

        -- Safe column migrations for learner personalization
        ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_goal TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS motivation TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_areas TEXT[];
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS motivation TEXT;
        ALTER TABLE learning_journeys ADD COLUMN IF NOT EXISTS focus_areas TEXT[];
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
                  learning_goal as "learningGoal", motivation, focus_areas as "focusAreas",
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
                  learning_goal as "learningGoal", motivation, focus_areas as "focusAreas",
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
                  points, active_scenario_id as "activeScenarioId",
                  motivation, focus_areas as "focusAreas",
                  created_at as "createdAt"
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
          `INSERT INTO learning_journeys (id, user_id, target_language_code, support_language_code, cefr_level, streak_days, total_minutes_spoken, points, active_scenario_id, motivation, focus_areas, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
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
            journey.focusAreas || null
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
  getScenarios(targetLang, category, cefrLevel) {
    const all = this.localStore.scenarios && this.localStore.scenarios.length > 0 ? this.localStore.scenarios : INITIAL_DATABASE_SCENARIOS;
    return all.filter((s) => {
      if (targetLang && s.targetLanguage !== targetLang) {
        return true;
      }
      if (category && category !== "all" && s.category !== category) return false;
      if (cefrLevel && cefrLevel !== "all" && s.cefrLevel !== cefrLevel) return false;
      return true;
    });
  }
  getScenarioById(id) {
    const all = this.localStore.scenarios && this.localStore.scenarios.length > 0 ? this.localStore.scenarios : INITIAL_DATABASE_SCENARIOS;
    return all.find((s) => s.id === id);
  }
  getCourses(targetLang, cefrLevel) {
    const all = this.localStore.courses && this.localStore.courses.length > 0 ? this.localStore.courses : INITIAL_DATABASE_COURSES;
    return all.filter((c) => {
      if (targetLang && c.targetLanguage !== targetLang) return false;
      if (cefrLevel && cefrLevel !== "all" && c.cefrLevel !== cefrLevel) return false;
      return true;
    });
  }
  getCourseById(id) {
    const all = this.localStore.courses && this.localStore.courses.length > 0 ? this.localStore.courses : INITIAL_DATABASE_COURSES;
    return all.find((c) => c.id === id);
  }
  getLessonById(lessonId) {
    const courses = this.localStore.courses && this.localStore.courses.length > 0 ? this.localStore.courses : INITIAL_DATABASE_COURSES;
    for (const course of courses) {
      const lesson = course.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, course };
      }
    }
    return void 0;
  }
  /**
   * Resolves both the curriculum Lesson and Course for any active Scenario.
   * Guarantees that the AI tutor always knows both what the learner is learning
   * (curriculum context) and where/how they are practicing (scenario context).
   */
  getLessonAndCourseForScenario(scenarioId, preferredLessonId, targetLanguage, cefrLevel) {
    const courses = this.localStore.courses && this.localStore.courses.length > 0 ? this.localStore.courses : INITIAL_DATABASE_COURSES;
    const scenario = this.getScenarioById(scenarioId);
    if (preferredLessonId) {
      const match = this.getLessonById(preferredLessonId);
      if (match) return match;
    }
    if (scenario?.lessonId) {
      const match = this.getLessonById(scenario.lessonId);
      if (match) return match;
    }
    for (const course of courses) {
      if (targetLanguage && course.targetLanguage !== targetLanguage) continue;
      for (const lesson of course.lessons) {
        if (lesson.speakingScenarioId === scenarioId || lesson.practiceScenarioIds?.includes(scenarioId)) {
          return { lesson, course };
        }
      }
    }
    const lang = targetLanguage || scenario?.targetLanguage || "es";
    const level = cefrLevel || scenario?.cefrLevel || "A1";
    const langCourses = courses.filter((c) => c.targetLanguage === lang);
    const levelCourses = langCourses.filter((c) => c.cefrLevel === level);
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
    if (candidateCourses.length > 0 && candidateCourses[0].lessons.length > 0) {
      return { lesson: candidateCourses[0].lessons[0], course: candidateCourses[0] };
    }
    if (courses.length > 0 && courses[0].lessons.length > 0) {
      return { lesson: courses[0].lessons[0], course: courses[0] };
    }
    return void 0;
  }
  getCompletedScenarioIds(userId) {
    return this.localStore.completedScenarios[userId] || [];
  }
  async recordCompletedScenario(userId, journeyId, scenarioId, stats) {
    let completed = this.localStore.completedScenarios[userId];
    if (!completed) {
      completed = [];
      this.localStore.completedScenarios[userId] = completed;
    }
    if (!completed.includes(scenarioId)) {
      completed.push(scenarioId);
    }
    const durationMins = stats.durationMinutes || (stats.durationSeconds ? Math.max(1, Math.round(stats.durationSeconds / 60)) : 2);
    const errors = typeof stats.errorCount === "number" ? stats.errorCount : 0;
    const earnedXp = Math.max(stats.xpEarned || 50, 10);
    const resolvedContext = this.getLessonAndCourseForScenario(scenarioId, stats.lessonId);
    const lessonId = stats.lessonId || resolvedContext?.lesson.id;
    const courseId = stats.courseId || resolvedContext?.course.id;
    const journey = this.getJourney(journeyId);
    if (journey) {
      journey.points += earnedXp;
      journey.totalMinutesSpoken += durationMins;
      journey.streakDays = Math.max(journey.streakDays, 1);
      await this.saveJourney(journey);
    }
    const sessionRecord = {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      journeyId,
      scenarioId,
      lessonId: lessonId || void 0,
      courseId: courseId || void 0,
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
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
    const nextRecommended = this.getRecommendations(userId, journey?.targetLanguage, journey?.cefrLevel);
    return { journey, nextRecommended, sessionRecord };
  }
  getRecommendations(userId, targetLang, cefrLevel) {
    const completed = this.getCompletedScenarioIds(userId);
    const all = this.getScenarios(targetLang, void 0, cefrLevel);
    const uncompleted = all.filter((s) => !completed.includes(s.id));
    if (uncompleted.length >= 3) {
      return uncompleted.slice(0, 6);
    }
    return all.slice(0, 6);
  }
  getJourney(id) {
    return this.localStore.journeys.find((j) => j.id === id);
  }
  getUser(id) {
    return this.localStore.users.find((u) => u.id === id);
  }
  updateUser(id, updates) {
    const user = this.localStore.users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updates, { updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      this.saveFileStore();
      if (this.isPostgresConnected && this.pool) {
        const fields = [];
        const values = [];
        let i = 1;
        if (updates.name !== void 0) {
          fields.push(`name = $${i++}`);
          values.push(updates.name);
        }
        if (updates.theme !== void 0) {
          fields.push(`theme = $${i++}`);
          values.push(updates.theme);
        }
        if (updates.uiLanguage !== void 0) {
          fields.push(`ui_language = $${i++}`);
          values.push(updates.uiLanguage);
        }
        if (updates.learningGoal !== void 0) {
          fields.push(`learning_goal = $${i++}`);
          values.push(updates.learningGoal);
        }
        if (updates.motivation !== void 0) {
          fields.push(`motivation = $${i++}`);
          values.push(updates.motivation);
        }
        if (updates.focusAreas !== void 0) {
          fields.push(`focus_areas = $${i++}`);
          values.push(updates.focusAreas);
        }
        if (updates.activeJourneyId !== void 0) {
          fields.push(`active_journey_id = $${i++}`);
          values.push(updates.activeJourneyId);
        }
        if (updates.onboardingCompleted !== void 0) {
          fields.push(`onboarding_completed = $${i++}`);
          values.push(updates.onboardingCompleted);
        }
        if (fields.length > 0) {
          values.push(id);
          this.pool.query(
            `UPDATE users SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${i}`,
            values
          ).catch((e) => console.warn("PostgreSQL updateUser sync note:", e));
        }
      }
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
function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
}
function getGeminiClient() {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var ai = getGeminiClient();
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
  const { scenario, lesson, course, journey, learnerProfile, userMessage, conversationHistory = [] } = params;
  const targetLang = (journey?.targetLanguage || params.targetLanguage || "es").toUpperCase();
  const supportLang = (journey?.supportLanguage || params.supportLanguage || "en").toUpperCase();
  const cefr = journey?.cefrLevel || params.cefrLevel || scenario.cefrLevel || "A1";
  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);
  const learnerName = learnerProfile?.name || journey?.learnerName || "";
  const learnerMotivation = learnerProfile?.motivation || journey?.motivation || journey?.goals || "Everyday practical conversation";
  const learnerFocus = learnerProfile?.focusAreas && learnerProfile.focusAreas.length > 0 ? learnerProfile.focusAreas.join(", ") : learnerProfile?.learningGoal || "Speaking confidence and natural vocabulary";
  const courseTitle = course?.title || `${targetLang} Curriculum`;
  const lessonTitle = lesson?.title || scenario.relatedLessonTitle || "Foundational Communication & Practice";
  const lessonDesc = lesson?.description || "Core vocabulary, grammar patterns, and spoken fluency";
  const lessonObjectives = lesson?.learningObjectives && lesson.learningObjectives.length > 0 ? lesson.learningObjectives : [
    `Use natural ${targetLang} expressions suited to CEFR ${cefr}`,
    "Ask and answer essential situational questions"
  ];
  const grammarFocus = lesson?.grammarFocus && lesson.grammarFocus.length > 0 ? lesson.grammarFocus : scenario.grammarFocus || ["Conversational phrasing and questions"];
  const lessonVocab = lesson?.vocabularyList && lesson.vocabularyList.length > 0 ? lesson.vocabularyList.map((v) => `${v.word} (${v.translation})`) : scenario.vocabularyDomain || [];
  const systemInstruction = `You are Yoe, an empathetic and highly effective language tutor roleplaying in an integrated educational framework:

==================================================
1. CURRICULUM CONTEXT (WHAT THE LEARNER IS LEARNING)
==================================================
COURSE: ${courseTitle} (CEFR ${cefr})
LESSON: "${lessonTitle}"
LESSON DESCRIPTION: ${lessonDesc}
LESSON OBJECTIVES:
${lessonObjectives.map((o) => `- ${o}`).join("\n")}
GRAMMAR FOCUS:
${grammarFocus.map((g) => `- ${g}`).join("\n")}
TARGET LESSON VOCABULARY:
${lessonVocab.map((v) => `- ${v}`).join("\n")}

==================================================
2. ACTIVE SCENARIO CONTEXT (WHERE & HOW THE LEARNER IS PRACTICING)
==================================================
SCENARIO: "${scenario.title}"
SETTING / LOCATION: ${scenario.location}
YOUR ROLE: ${scenario.characterName} (${scenario.characterRole})
SCENARIO DESCRIPTION: ${scenario.description}
SCENARIO OBJECTIVES:
${scenario.objectives.map((o) => `- [${o.id}] ${o.text}`).join("\n")}
SCENARIO VOCABULARY DOMAIN:
${(scenario.vocabularyDomain || []).join(", ")}

==================================================
3. LEARNER CONTEXT & PERSONALIZATION
==================================================
LEARNER NAME: ${learnerName || "Learner"}
LEARNING PURPOSE / MOTIVATION: ${learnerMotivation} (e.g. Travel, Work, School, Conversation, Just for fun)
PRIMARY IMPROVEMENT FOCUS: ${learnerFocus} (e.g. Speaking, Listening, Vocabulary, Grammar, Everything)
TARGET LANGUAGE TO SPEAK: ${targetLang}
SUPPORT LANGUAGE FOR EXPLANATIONS & TRANSLATIONS: ${supportLang}
LEARNER CEFR LEVEL: ${cefr}

* PERSONALIZATION DIRECTIVES:
- Warmly address the learner by name (${learnerName || "friend"}) when greeting or encouraging them.
- Tailor examples, comments, and roleplay nuances to their purpose (${learnerMotivation}). For Travel, highlight helpful journey phrases; for Work, keep it crisp and professional; for Conversation or Fun, keep it friendly and relaxed.
- Actively emphasize their chosen improvement focus (${learnerFocus}):
  * Speaking: Ask questions that invite longer conversational turns from the learner.
  * Listening: Speak in natural, clear sentences with authentic pacing.
  * Vocabulary: Highlight useful scenario words and phrases.
  * Grammar: Gently model clean sentence structure and agreements.
  * Everything: Provide a well-rounded immersion.

==================================================
CRITICAL TEACHING & ROLEPLAY PRINCIPLES:
==================================================
1. ROLEPLAY FIDELITY:
   You MUST stay strictly in character as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location}.
   The active scenario strictly dictates your persona, profession, actions, and tone (e.g. as an airport agent, ask for passport, boarding pass, luggage; as a waiter, present menu, ask about drinks; as a receptionist, ask for reservation name).
   Never break character to become a generic classroom assistant.

2. WEAVE LESSON INTO SCENARIO:
   The lesson provides educational content (grammar, vocabulary, concepts).
   The scenario provides the practical situation to practice them.
   Both must coexist: use the scenario's authentic dialogue to elicit, practice, and reinforce the lesson's target expressions.

3. "WHAT ARE WE LEARNING TODAY?" / TOPIC QUESTIONS:
   If the user asks "What are we learning today?", "What is the topic for today?", "\xBFQu\xE9 estamos aprendiendo hoy?", or any question asking about the session's focus, you MUST synthesize BOTH the lesson and the scenario:
   Explain that we are working on the curriculum lesson ("${lessonTitle}") and practicing it through the real-world situation of "${scenario.title}" at ${scenario.location}!
   Example in English: "Today we're practicing ${lessonTitle} in an airport check-in situation."
   Example in Spanish: "Hoy estamos trabajando en ${lessonTitle}, y lo estamos practicando en la situaci\xF3n de ${scenario.title} en ${scenario.location}."
   NEVER answer with only the lesson alone or only the scenario alone. Always provide the integrated connection.

4. NATURAL OFF-TOPIC HANDLING:
   If the learner asks an unrelated but reasonable side question (e.g. "Is the airport usually crowded?", "What is the weather like in Madrid?"), answer naturally and warmly in character (1-2 brief sentences), and then smoothly and naturally steer the conversation back to the active scenario and its objectives.
   Never let a side question erase or overwrite the active scenario.

5. CEFR SUITABILITY & CORRECTIONS:
   Speak in realistic, natural ${targetLang} suited to CEFR ${cefr}.
   Evaluate if the user's input satisfied any of the scenario objectives.
   If the learner made a grammar or vocabulary error in ${targetLang}, gently offer a structured correction in the JSON.
   Extract 1-2 useful vocabulary items from the turn.
   Provide 2-3 short, natural suggested responses the learner could say next in ${targetLang} with ${supportLang} translations.

You MUST respond strictly in valid JSON matching this schema:
{
  "response": "Your spoken dialogue in ${targetLang}",
  "translation": "Natural translation in ${supportLang}",
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
    const client = getGeminiClient();
    const res = await client.models.generateContent({
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
async function generateLiveGreeting(scenario, journey, lesson, course, learnerProfile) {
  const targetLang = (journey?.targetLanguage || "es").toUpperCase();
  const supportLang = (journey?.supportLanguage || "en").toUpperCase();
  const cefr = journey?.cefrLevel || scenario.cefrLevel || "A1";
  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);
  const learnerName = learnerProfile?.name || journey?.learnerName || "";
  const learnerMotivation = learnerProfile?.motivation || journey?.motivation || journey?.goals || "";
  const courseTitle = course?.title || `${targetLang} Curriculum`;
  const lessonTitle = lesson?.title || scenario.relatedLessonTitle || "Everyday Communication";
  const prompt = `You are Yoe, the AI language tutor roleplaying as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location} in the scenario "${scenario.title}".
The learner ${learnerName ? `is named ${learnerName}` : ""}${learnerMotivation ? ` and is practicing for "${learnerMotivation}"` : ""}.
They are studying the curriculum lesson "${lessonTitle}" (${courseTitle}, Level ${cefr}) and practicing it in this scenario.
Generate a warm, realistic 1-sentence opening greeting in ${targetLang} suited for CEFR ${cefr} that immediately establishes your character role at ${scenario.location}${learnerName ? ` and warmly greets ${learnerName}` : ""}, followed by its ${supportLang} translation.

Respond strictly in JSON:
{
  "response": "Greeting in ${targetLang}",
  "translation": "Translation in ${supportLang}"
}`;
  try {
    const client = getGeminiClient();
    const res = await client.models.generateContent({
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
function pcmToWav(pcmData, sampleRate = 24e3, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcmData]);
}
async function generateScenarioSpeech(text, voiceName = "Kore") {
  if (!text || !text.trim()) return null;
  const client = getGeminiClient();
  try {
    const pcmChunks = [];
    let onDoneCallback = null;
    const donePromise = new Promise((resolve) => {
      onDoneCallback = resolve;
    });
    const tServer0 = Date.now();
    const session = await client.live.connect({
      model: LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        },
        systemInstruction: {
          parts: [{ text: "You are an accurate voice synthesizer for language tutoring. Read the requested text aloud clearly and naturally." }]
        }
      },
      callbacks: {
        onmessage: (msg) => {
          const parts = msg.serverContent?.modelTurn?.parts || [];
          for (const p of parts) {
            if (p.inlineData?.data) {
              pcmChunks.push(Buffer.from(p.inlineData.data, "base64"));
            }
          }
          if (msg.serverContent?.turnComplete && onDoneCallback) {
            onDoneCallback();
          }
        }
      }
    });
    const tConnected = Date.now();
    session.sendClientContent({
      turns: [
        {
          role: "user",
          parts: [{ text: `Say clearly: ${text.trim()}` }]
        }
      ],
      turnComplete: true
    });
    await Promise.race([donePromise, new Promise((r) => setTimeout(r, 4500))]);
    try {
      session.close();
    } catch (e) {
    }
    const tGenerationDone = Date.now();
    console.log(`[SERVER TTS DIAGNOSTICS] Text: "${text.slice(0, 30)}..." | Connect: ${tConnected - tServer0}ms | Gen: ${tGenerationDone - tConnected}ms | Total: ${tGenerationDone - tServer0}ms | Chunks: ${pcmChunks.length}`);
    if (pcmChunks.length === 0) return null;
    const fullPcm = Buffer.concat(pcmChunks);
    const wav = pcmToWav(fullPcm, 24e3);
    return wav.toString("base64");
  } catch (err) {
    console.error("[GEMINI TTS] Speech synthesis error:", err?.message || err);
    return null;
  }
}
async function createEphemeralLiveToken(scenario, journey, lesson, course, learnerProfile) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini Live credentials are not configured");
  }
  const targetLang = (journey?.targetLanguage || "es").toUpperCase();
  const supportLang = (journey?.supportLanguage || "en").toUpperCase();
  const cefr = journey?.cefrLevel || scenario?.cefrLevel || "A1";
  const voiceName = scenario ? getCharacterVoice(scenario.characterName, scenario.characterRole) : "Kore";
  const learnerName = learnerProfile?.name || journey?.learnerName || "";
  const learnerMotivation = learnerProfile?.motivation || journey?.motivation || journey?.goals || "Practical real-world conversation";
  const learnerFocus = learnerProfile?.focusAreas && learnerProfile.focusAreas.length > 0 ? learnerProfile.focusAreas.join(", ") : learnerProfile?.learningGoal || "Speaking confidence and natural vocabulary";
  const courseTitle = course?.title || `${targetLang} Curriculum`;
  const lessonTitle = lesson?.title || scenario?.relatedLessonTitle || "Everyday Communication & Practice";
  const grammarFocus = lesson?.grammarFocus && lesson.grammarFocus.length > 0 ? lesson.grammarFocus.join(", ") : scenario?.grammarFocus?.join(", ") || "Conversational fluency and question structures";
  const systemInstruction = scenario ? `You are Yoe, an empathetic and highly effective language tutor roleplaying in an integrated educational framework on a live voice call:

1. CURRICULUM CONTEXT:
   - COURSE: ${courseTitle} (CEFR ${cefr})
   - LESSON: "${lessonTitle}"
   - GRAMMAR FOCUS: ${grammarFocus}

2. ACTIVE SCENARIO CONTEXT:
   - SCENARIO: "${scenario.title}"
   - SETTING / LOCATION: ${scenario.location}
   - YOUR ROLE: ${scenario.characterName} (${scenario.characterRole})
   - OBJECTIVES: ${scenario.objectives.map((o) => o.text).join("; ")}

3. LEARNER CONTEXT & PERSONALIZATION:
   - LEARNER NAME: ${learnerName || "Learner"}
   - LEARNING PURPOSE: ${learnerMotivation}
   - IMPROVEMENT FOCUS: ${learnerFocus}
   - Warmly address the learner by name (${learnerName || "friend"}), and actively adapt roleplay dialogue and encouragement to support their purpose (${learnerMotivation}) and focus (${learnerFocus}).

4. CRITICAL INSTRUCTIONS:
   - Stay strictly in character as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location}.
   - The scenario is the practical context; the lesson is what the learner is mastering. Weave them together naturally.
   - If asked "What are we learning today?", "What's the topic?", or similar, explain that today we are working on "${lessonTitle}" and practicing it in the real-world situation of "${scenario.title}" at ${scenario.location}. Never state only one without the other.
   - If the user asks a reasonable side question, answer briefly and naturally in character, then smoothly steer back to the active scenario.
   - Speak in natural, realistic ${targetLang} suited to CEFR ${cefr}. Use ${supportLang} when the learner needs explanation or encouragement.` : `You are Yoe, an empathetic language tutor on a live audio call. Teach the user naturally in Spanish with English explanations.`;
  const client = getGeminiClient();
  const tokenResponse = await client.authTokens.create({
    config: {
      uses: 1,
      liveConnectConstraints: {
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
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
  if (!tokenResponse?.name) {
    throw new Error("Gemini authTokens.create returned an empty or invalid response");
  }
  return {
    success: true,
    token: tokenResponse.name,
    model: LIVE_MODEL,
    voiceName,
    systemInstruction
  };
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
    learningGoal: user.learningGoal,
    motivation: user.motivation,
    focusAreas: user.focusAreas,
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
  const category = req.query.category;
  const level = req.query.cefrLevel;
  const scenarios = db.getScenarios(lang, category, level);
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
apiRouter.get("/courses", (req, res) => {
  const lang = req.query.targetLanguage;
  const level = req.query.cefrLevel;
  const courses = db.getCourses(lang, level);
  res.json({ courses });
});
apiRouter.get("/courses/:id", (req, res) => {
  const course = db.getCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json({ course });
});
apiRouter.get("/lessons/:id", (req, res) => {
  const match = db.getLessonById(req.params.id);
  if (!match) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }
  res.json(match);
});
apiRouter.get("/recommendations", (req, res) => {
  const userId = req.query.userId || "guest_user";
  const targetLanguage = req.query.targetLanguage;
  const cefrLevel = req.query.cefrLevel;
  const recommendations = db.getRecommendations(userId, targetLanguage, cefrLevel);
  res.json({ recommendations });
});
apiRouter.post("/progress/complete-scenario", async (req, res) => {
  try {
    const { userId, journeyId, scenarioId, lessonId, courseId, xpEarned, durationMinutes, durationSeconds, errorCount } = req.body;
    const result = await db.recordCompletedScenario(
      userId || "guest_user",
      journeyId,
      scenarioId,
      {
        xpEarned: Number(xpEarned) || 50,
        durationMinutes: Number(durationMinutes) || (durationSeconds ? Math.max(1, Math.round(Number(durationSeconds) / 60)) : 3),
        durationSeconds: Number(durationSeconds) || void 0,
        errorCount: typeof errorCount === "number" ? errorCount : 0,
        lessonId: lessonId || void 0,
        courseId: courseId || void 0
      }
    );
    res.json({
      success: true,
      journey: result.journey,
      nextRecommended: result.nextRecommended,
      sessionRecord: result.sessionRecord
    });
  } catch (err) {
    console.error("[COMPLETE SCENARIO ERROR]:", err);
    res.status(500).json({ error: "Failed to record completed scenario" });
  }
});
apiRouter.post("/ai/initial-greeting", async (req, res) => {
  try {
    const { scenarioId, journeyId, lessonId, courseId, targetLanguage, supportLanguage, cefrLevel } = req.body;
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
    const curriculum = db.getLessonAndCourseForScenario(
      scenario.id,
      lessonId,
      journey.targetLanguage,
      journey.cefrLevel
    );
    const user = existingJourney ? db.getUser(existingJourney.userId) : null;
    const learnerProfile = req.body?.learnerProfile || {
      name: user?.name || existingJourney?.learnerName,
      motivation: user?.motivation || existingJourney?.motivation || existingJourney?.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || existingJourney?.focusAreas
    };
    const greeting = await generateLiveGreeting(
      scenario,
      journey,
      curriculum?.lesson,
      curriculum?.course,
      learnerProfile
    );
    res.json({
      greeting,
      lesson: curriculum?.lesson ? { id: curriculum.lesson.id, title: curriculum.lesson.title } : void 0,
      course: curriculum?.course ? { id: curriculum.course.id, title: curriculum.course.title } : void 0
    });
  } catch (err) {
    console.error("[YOE GREETING ERROR]:", err);
    res.status(500).json({ error: "Failed to generate live greeting" });
  }
});
apiRouter.post("/ai/chat", async (req, res) => {
  console.log("[YOE CHAT] request received");
  try {
    const {
      journeyId,
      scenarioId,
      lessonId,
      courseId,
      userMessage,
      conversationHistory,
      targetLanguage,
      supportLanguage,
      cefrLevel
    } = req.body;
    console.log(`[YOE CHAT] user authenticated: ${!!(req.user || req.headers.authorization)}`);
    console.log(`[YOE CHAT] message length: ${userMessage?.length || 0}`);
    const scenario = db.getScenarioById(scenarioId) || db.getScenarios()[0];
    const existingJourney = journeyId ? db.getJourney(journeyId) : null;
    console.log(`[YOE CHAT] scenario loaded: ${!!scenario} (${scenario.title})`);
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
    const curriculum = db.getLessonAndCourseForScenario(
      scenario.id,
      lessonId,
      journey.targetLanguage,
      journey.cefrLevel
    );
    console.log(`[YOE CHAT] target language: ${journey.targetLanguage}, level: ${journey.cefrLevel}`);
    console.log(`[YOE CHAT] curriculum lesson: ${curriculum?.lesson?.title || "None"}, course: ${curriculum?.course?.title || "None"}`);
    const recentMistakes = existingJourney ? db.getMistakes(existingJourney.id) : [];
    db.saveChatMessage(scenarioId || scenario.id, {
      id: `msg_usr_${Date.now()}`,
      sessionId: scenarioId || scenario.id,
      sender: "user",
      text: userMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    const user = existingJourney ? db.getUser(existingJourney.userId) : null;
    const learnerProfile = req.body?.learnerProfile || {
      name: user?.name || existingJourney?.learnerName,
      motivation: user?.motivation || existingJourney?.motivation || existingJourney?.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || existingJourney?.focusAreas
    };
    console.log("[YOE CHAT] Gemini request started with dual curriculum + scenario context + learner personalization");
    const aiResult = await processScenarioTurn({
      scenario,
      lesson: curriculum?.lesson,
      course: curriculum?.course,
      journey,
      learnerProfile,
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
      audioUrl: aiResult.audioBase64 ? `data:audio/wav;base64,${aiResult.audioBase64}` : void 0,
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
      aiResponse: aiResult,
      activeContext: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        lessonId: curriculum?.lesson?.id,
        lessonTitle: curriculum?.lesson?.title,
        courseId: curriculum?.course?.id,
        courseTitle: curriculum?.course?.title
      }
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
var handleLiveToken = async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      success: false,
      error: "Gemini Live credentials are not configured"
    });
  }
  try {
    const scenarioId = req.body?.scenarioId || req.query?.scenarioId;
    const journeyId = req.body?.journeyId || req.query?.journeyId;
    const lessonId = req.body?.lessonId || req.query?.lessonId;
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
    const curriculum = db.getLessonAndCourseForScenario(
      scenario.id,
      lessonId,
      journey.targetLanguage,
      journey.cefrLevel
    );
    const user = journey ? db.getUser(journey.userId) : null;
    const learnerProfile = req.body?.learnerProfile || {
      name: user?.name || journey?.learnerName,
      motivation: user?.motivation || journey?.motivation || journey?.goals,
      learningGoal: user?.learningGoal,
      focusAreas: user?.focusAreas || journey?.focusAreas
    };
    const tokenConfig = await createEphemeralLiveToken(
      scenario,
      journey,
      curriculum?.lesson,
      curriculum?.course,
      learnerProfile
    );
    if (!tokenConfig || !tokenConfig.token) {
      throw new Error("Gemini Live ephemeral token was not created");
    }
    res.json({
      success: true,
      token: tokenConfig.token,
      model: LIVE_MODEL,
      voiceName: tokenConfig.voiceName,
      activeContext: {
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        lessonId: curriculum?.lesson?.id,
        lessonTitle: curriculum?.lesson?.title,
        courseId: curriculum?.course?.id,
        courseTitle: curriculum?.course?.title
      }
    });
  } catch (err) {
    console.error("[YOE LIVE] Token creation failure:", err?.message || err);
    res.status(500).json({
      success: false,
      error: err?.message || "Failed to generate live session token"
    });
  }
};
apiRouter.get("/ai/live/token", handleLiveToken);
apiRouter.post("/ai/live/token", handleLiveToken);
apiRouter.get("/ai/live/health", async (req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  const geminiConfigured = Boolean(getGeminiApiKey());
  if (!geminiConfigured) {
    return res.status(503).json({
      success: false,
      geminiConfigured: false,
      tokenCreatable: false,
      error: "Gemini Live credentials are not configured"
    });
  }
  try {
    const tokenResult = await createEphemeralLiveToken();
    const tokenCreatable = Boolean(tokenResult?.token);
    res.json({
      success: tokenCreatable,
      geminiConfigured: true,
      tokenCreatable,
      model: LIVE_MODEL
    });
  } catch (err) {
    console.error("[YOE LIVE] Health test error:", err?.message || err);
    res.status(500).json({
      success: false,
      geminiConfigured: true,
      tokenCreatable: false,
      error: err?.message || "Token creation verification failed"
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
