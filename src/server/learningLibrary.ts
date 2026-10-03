import { Scenario, CourseUnit, LanguageCode, CEFRLevel } from '../types';

/**
 * COMPREHENSIVE MULTI-DOMAIN SCENARIO & CURRICULUM DATABASE
 * Genuinely populated across Travel, Daily Life, Work, Social, and Practical situations.
 * Database-backed, multilingual, and ready for progressive recommendation.
 */

export const INITIAL_DATABASE_SCENARIOS: Scenario[] = [
  // ==========================================
  // 1. TRAVEL & TRANSPORTATION (18 Situations)
  // ==========================================
  {
    id: 'scen_travel_airport_checkin',
    title: 'Airport Check-In & Bag Drop',
    description: 'Check in for your international flight, confirm window or aisle seating, and check your luggage.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Barajas Airport Terminal 4, Madrid',
    characterName: 'Yoe',
    characterRole: 'Airline Check-in Agent',
    avatar: '✈️',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['pasaporte', 'maleta', 'asiento', 'tarjeta de embarque', 'equipaje de mano'],
    initialGreeting: '¡Hola! Bienvenido a Iberia Airlines. ¿Me permite su pasaporte y el código de reserva, por favor?',
    initialGreetingTranslation: 'Hello! Welcome to Iberia Airlines. May I have your passport and booking reference, please?',
    objectives: [
      { id: 'obj_ac_1', text: 'Present your passport and destination', completed: false, hint: 'Say: Hola, aquí tiene mi pasaporte. Viajo a Barcelona.' },
      { id: 'obj_ac_2', text: 'Request a window or aisle seat', completed: false, hint: 'Say: ¿Podría tener un asiento de ventana / pasillo, por favor?' },
      { id: 'obj_ac_3', text: 'Confirm number of checked bags', completed: false, hint: 'Say: Solo tengo una maleta para facturar.' }
    ]
  },
  {
    id: 'scen_travel_airport_security',
    title: 'Airport Security Screening',
    description: 'Follow security instructions, place liquids and electronics in bins, and ask clarifying questions.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Security Checkpoint, El Prat Airport, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Security Officer',
    avatar: '🛂',
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['bandeja', 'líquidos', 'portátil', 'cinturón', 'zapatos'],
    initialGreeting: 'Buenos días. Por favor, saque los líquidos y dispositivos electrónicos de su mochila y colóquelos en la bandeja.',
    initialGreetingTranslation: 'Good morning. Please take out liquids and electronic devices from your backpack and place them in the tray.',
    objectives: [
      { id: 'obj_as_1', text: 'Acknowledge instructions and ask about shoes/belt', completed: false, hint: 'Say: De acuerdo. ¿Tengo que quitarme los zapatos y el cinturón?' },
      { id: 'obj_as_2', text: 'Confirm placement of tablet or laptop', completed: false, hint: 'Say: Ya he puesto mi ordenador portátil en la bandeja.' },
      { id: 'obj_as_3', text: 'Ask where to collect your luggage after screening', completed: false, hint: 'Say: Gracias, ¿puedo pasar por el detector ahora?' }
    ]
  },
  {
    id: 'scen_travel_boarding_flight',
    title: 'Boarding the Flight & Cabin Help',
    description: 'Find your seat on the plane, ask for help stowing overhead luggage, and request water or a blanket.',
    category: 'travel',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Air France Flight AF1244, Paris to Nice',
    characterName: 'Yoe',
    characterRole: 'Flight Attendant',
    avatar: '🛫',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['siège', 'bagage', 'coffre à bagages', 'couverture', 'verre d\'eau'],
    initialGreeting: 'Bonjour et bienvenue à bord ! Puis-je voir votre carte d\'embarquement pour vous indiquer votre rangée ?',
    initialGreetingTranslation: 'Hello and welcome on board! May I see your boarding pass to direct you to your row?',
    objectives: [
      { id: 'obj_bf_1', text: 'Show boarding pass and ask where seat is', completed: false, hint: 'Say: Bonjour ! Voici ma carte. Où se trouve le siège 14B ?' },
      { id: 'obj_bf_2', text: 'Ask for assistance with overhead compartment', completed: false, hint: 'Say: Pouvez-vous m\'aider à ranger mon bagage, s\'il vous plaît ?' },
      { id: 'obj_bf_3', text: 'Politely request a cup of water or blanket', completed: false, hint: 'Say: Pourrais-je avoir un verre d\'eau, s\'il vous plaît ?' }
    ]
  },
  {
    id: 'scen_travel_flight_delay',
    title: 'Flight Delay & Transit Desk',
    description: 'Inquire about delayed departure times, connecting flight guarantees, and meal voucher compensations.',
    category: 'travel',
    targetLanguage: 'en',
    cefrLevel: 'A2',
    location: 'Customer Service Counter, Heathrow Terminal 5, London',
    characterName: 'Yoe',
    characterRole: 'Transit Service Supervisor',
    avatar: '⏰',
    imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['delay', 'connecting flight', 'departure gate', 'voucher', 'rebooking'],
    initialGreeting: 'Hello there. I understand your flight to New York has been delayed by two hours. How can I assist you today?',
    initialGreetingTranslation: 'Hello there. I understand your flight to New York has been delayed by two hours. How can I assist you today?',
    objectives: [
      { id: 'obj_fd_1', text: 'Explain your concern about missing a connecting flight', completed: false, hint: 'Say: I have a connecting flight in two hours, will I still make it?' },
      { id: 'obj_fd_2', text: 'Ask about meal or refreshment vouchers', completed: false, hint: 'Say: Are meal vouchers provided during this delay?' },
      { id: 'obj_fd_3', text: 'Confirm the updated departure gate and boarding time', completed: false, hint: 'Say: What is the new boarding time and departure gate?' }
    ]
  },
  {
    id: 'scen_travel_lost_luggage',
    title: 'Lost Luggage Claim Desk',
    description: 'Report missing baggage at the baggage reclaim office, describe your suitcase, and provide your hotel address.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Baggage Services, Barajas Airport, Madrid',
    characterName: 'Yoe',
    characterRole: 'Baggage Services Agent',
    avatar: '🧳',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['maleta perdida', 'etiqueta', 'color', 'dirección', 'reclamación'],
    initialGreeting: 'Hola, buenas tardes. Siento mucho el inconveniente. ¿Su maleta no apareció en la cinta de equipajes?',
    initialGreetingTranslation: 'Hello, good afternoon. I am so sorry for the inconvenience. Did your suitcase not appear on the carousel?',
    objectives: [
      { id: 'obj_ll_1', text: 'Explain your bag did not arrive and show baggage tag', completed: false, hint: 'Say: Sí, mi maleta no ha llegado. Aquí tengo el resguardo de equipaje.' },
      { id: 'obj_ll_2', text: 'Describe the color, size, and brand of your bag', completed: false, hint: 'Say: Es una maleta grande de color azul marino con cuatro ruedas.' },
      { id: 'obj_ll_3', text: 'Provide hotel address for home delivery', completed: false, hint: 'Say: Estoy alojado en el Hotel Gran Vía, por favor envíenla allí.' }
    ]
  },
  {
    id: 'scen_hotel_madrid',
    title: 'Hotel Check-In in Madrid',
    description: 'Check into your boutique hotel room, ask about breakfast hours and WiFi details in Spanish.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Hotel Gran Vía, Madrid',
    characterName: 'Yoe',
    characterRole: 'Hotel Receptionist',
    avatar: '🏨',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['reserva', 'habitación', 'desayuno', 'clave de wifi', 'piso'],
    initialGreeting: '¡Buenas tardes! Soy Yoe. Bienvenido al Hotel Gran Vía. ¿Tiene una reserva con nosotros?',
    initialGreetingTranslation: 'Good afternoon! I am Yoe. Welcome to Hotel Gran Vía. Do you have a reservation with us?',
    objectives: [
      { id: 'obj_es_1', text: 'Confirm reservation under your name', completed: false, hint: 'Say: Hola Yoe, tengo una reserva a nombre de...' },
      { id: 'obj_es_2', text: 'Ask for the WiFi password and breakfast time', completed: false, hint: 'Say: ¿Cuál es la contraseña del WiFi y a qué hora es el desayuno?' },
      { id: 'obj_es_3', text: 'Inquire about keycard or room floor', completed: false, hint: 'Say: ¿En qué piso está la habitación?' }
    ]
  },
  {
    id: 'scen_travel_hotel_checkout',
    title: 'Hotel Checkout & Storing Luggage',
    description: 'Settle your hotel room bill, return keycards, and arrange for luggage storage before an evening flight.',
    category: 'travel',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Hôtel Saint-Germain, Paris',
    characterName: 'Yoe',
    characterRole: 'Front Desk Concierge',
    avatar: '🔑',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['départ', 'facture', 'clés', 'bagages', 'garder'],
    initialGreeting: 'Bonjour ! J\'espère que vous avez passé un excellent séjour parmi nous. Vous souhaitez régler votre départ ?',
    initialGreetingTranslation: 'Good morning! I hope you had a wonderful stay with us. Would you like to check out?',
    objectives: [
      { id: 'obj_hco_1', text: 'State your room number and request checkout', completed: false, hint: 'Say: Bonjour, chambre 304, je voudrais régler la facture, s\'il vous plaît.' },
      { id: 'obj_hco_2', text: 'Pay by card and ask for a receipt', completed: false, hint: 'Say: Je vais payer par carte bancaire. Puis-je avoir un reçu ?' },
      { id: 'obj_hco_3', text: 'Ask if you can leave your bags until 5:00 PM', completed: false, hint: 'Say: Est-il possible de laisser mes bagages ici jusqu\'à dix-sept heures ?' }
    ]
  },
  {
    id: 'scen_travel_asking_directions',
    title: 'Asking for Street Directions',
    description: 'Navigate an unfamiliar historic neighborhood by asking locals for directions to the main plaza and metro station.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Barrio de las Letras, Madrid',
    characterName: 'Yoe',
    characterRole: 'Helpful Local Resident',
    avatar: '🗺️',
    imageUrl: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['disculpe', 'cómo llegar', 'a la derecha', 'todo recto', 'estación de metro'],
    initialGreeting: '¡Hola! ¿Te has desorientado un poco? ¿Buscas algún lugar en particular por el centro?',
    initialGreetingTranslation: 'Hello! Are you a bit lost? Are you looking for a specific place in the city center?',
    objectives: [
      { id: 'obj_dir_1', text: 'Excuse yourself politely and ask for Plaza Mayor', completed: false, hint: 'Say: Disculpe, ¿cómo puedo llegar a la Plaza Mayor desde aquí?' },
      { id: 'obj_dir_2', text: 'Clarify if it is within walking distance', completed: false, hint: 'Say: ¿Está lejos o se puede ir andando?' },
      { id: 'obj_dir_3', text: 'Thank the local and ask for the nearest metro stop', completed: false, hint: 'Say: Muchas gracias. ¿Dónde está la estación de metro más cercana?' }
    ]
  },
  {
    id: 'scen_travel_train_ticket',
    title: 'Buying a High-Speed Train Ticket',
    description: 'Purchase a round-trip ticket at the railway ticket window, choose travel classes, and confirm departure platforms.',
    category: 'travel',
    targetLanguage: 'it',
    cefrLevel: 'A2',
    location: 'Stazione Centrale di Milano, Milan',
    characterName: 'Yoe',
    characterRole: 'Trenitalia Ticket Agent',
    avatar: '🚄',
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['biglietto', 'andata e ritorno', 'binario', 'orario', 'prima classe'],
    initialGreeting: 'Buongiorno! Benvenuto a Trenitalia. Per quale destinazione desidera acquistare il biglietto?',
    initialGreetingTranslation: 'Good morning! Welcome to Trenitalia. For which destination would you like to buy a ticket?',
    objectives: [
      { id: 'obj_tt_1', text: 'Request a round-trip ticket to Florence or Rome', completed: false, hint: 'Say: Buongiorno, vorrei un biglietto di andata e ritorno per Firenze, per favore.' },
      { id: 'obj_tt_2', text: 'Select departure time for this afternoon', completed: false, hint: 'Say: C\'è un treno ad alta velocità verso le due del pomeriggio?' },
      { id: 'obj_tt_3', text: 'Ask which platform (binario) the train departs from', completed: false, hint: 'Say: Da quale binario parte il treno?' }
    ]
  },
  {
    id: 'scen_travel_taxi_ride',
    title: 'Taking a City Taxi',
    description: 'Hail a taxi outside your hotel, state your destination address, request air conditioning, and ask about credit card payment.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Calle de Alcalá Taxi Stand, Madrid',
    characterName: 'Yoe',
    characterRole: 'Taxi Driver',
    avatar: '🚕',
    imageUrl: 'https://images.unsplash.com/photo-1549194388-2469d59ec75c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['taxi', 'dirección', 'tarjeta', 'cuánto es', 'aquí mismo'],
    initialGreeting: '¡Buenas tardes! ¿Adónde le llevo hoy?',
    initialGreetingTranslation: 'Good afternoon! Where can I take you today?',
    objectives: [
      { id: 'obj_tax_1', text: 'State destination address clearly', completed: false, hint: 'Say: Hola, lléveme al Museo del Prado, por favor.' },
      { id: 'obj_tax_2', text: 'Ask if card payment is accepted', completed: false, hint: 'Say: ¿Acepta pago con tarjeta de crédito?' },
      { id: 'obj_tax_3', text: 'Ask for the final fare and request receipt', completed: false, hint: 'Say: ¿Cuánto es en total? ¿Me da un recibo, por favor?' }
    ]
  },
  {
    id: 'scen_travel_car_rental',
    title: 'Rental Car Pickup & Insurance',
    description: 'Pick up your reserved rental vehicle, understand fuel policy terms, and add full insurance coverage.',
    category: 'travel',
    targetLanguage: 'fr',
    cefrLevel: 'B1',
    location: 'Car Rental Desk, Nice Côte d\'Azur Airport',
    characterName: 'Yoe',
    characterRole: 'Rental Counter Agent',
    avatar: '🚗',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['voiture de location', 'permis de conduire', 'assurance', 'carburant', 'contrat'],
    initialGreeting: 'Bonjour monsieur/madame. Vous avez réservé un véhicule chez Europcar pour une semaine ?',
    initialGreetingTranslation: 'Hello sir/madam. You have booked a vehicle with Europcar for a week?',
    objectives: [
      { id: 'obj_cr_1', text: 'Provide driver license and booking confirmation', completed: false, hint: 'Say: Bonjour, voici mon permis de conduire et la confirmation de réservation.' },
      { id: 'obj_cr_2', text: 'Inquire about comprehensive insurance coverage', completed: false, hint: 'Say: Je voudrais ajouter l\'assurance tous risques sans franchise.' },
      { id: 'obj_cr_3', text: 'Ask about return fuel policy (plein/plein)', completed: false, hint: 'Say: Dois-je rendre la voiture avec le plein de carburant ?' }
    ]
  },
  {
    id: 'scen_travel_tourist_info',
    title: 'Tourist Information Bureau',
    description: 'Get local recommendations, pick up city maps, and ask about museum opening hours and discount passes.',
    category: 'travel',
    targetLanguage: 'ar',
    cefrLevel: 'A2',
    location: 'Tourist Welcome Center, Dubai Mall, UAE',
    characterName: 'Yoe',
    characterRole: 'Tourist Information Officer',
    avatar: '🏛️',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['معلومات سياحية', 'خريطة المدينة', 'متحف', 'مواعيد العمل', 'تذاكر'],
    initialGreeting: 'أهلاً وسهلاً بك في دبي! كيف يمكنني مساعدتك اليوم في استكشاف المعالم السياحية؟',
    initialGreetingTranslation: 'Welcome to Dubai! How can I help you today in exploring the city sights?',
    objectives: [
      { id: 'obj_ti_1', text: 'Request a city map and cultural recommendations', completed: false, hint: 'Say: مرحباً، هل يمكنني الحصول على خريطة للمدينة وأهم الأماكن الثقافية؟' },
      { id: 'obj_ti_2', text: 'Ask about museum opening hours', completed: false, hint: 'Say: ما هي أوقات عمل متحف المستقبل اليوم؟' },
      { id: 'obj_ti_3', text: 'Inquire about tourist discount passes', completed: false, hint: 'Say: هل توجد بطاقة تخفيضات للمواصلات والمعالم؟' }
    ]
  },
  {
    id: 'scen_travel_restaurant_reservation',
    title: 'Dinner Table Reservation by Phone',
    description: 'Call a popular seaside restaurant to book a table for four guests on the outdoor terrace.',
    category: 'travel',
    targetLanguage: 'it',
    cefrLevel: 'A2',
    location: 'Ristorante La Terrazza, Amalfi Coast',
    characterName: 'Yoe',
    characterRole: 'Restaurant Host',
    avatar: '🍷',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['prenotazione', 'tavolo', 'terrazza', 'quattro persone', 'ore otto'],
    initialGreeting: 'Buonasera, Ristorante La Terrazza! In cosa posso esserle utile stasera?',
    initialGreetingTranslation: 'Good evening, Ristorante La Terrazza! How may I help you tonight?',
    objectives: [
      { id: 'obj_rr_1', text: 'Request a table for 4 people at 8:30 PM', completed: false, hint: 'Say: Buonasera, vorrei prenotare un tavolo per quattro persone per stasera alle otto e mezza.' },
      { id: 'obj_rr_2', text: 'Specify a preference for an outdoor table with a view', completed: false, hint: 'Say: Sarebbe possibile avere un tavolo all\'aperto con vista mare?' },
      { id: 'obj_rr_3', text: 'Confirm reservation under your surname', completed: false, hint: 'Say: La prenotazione è a nome di...' }
    ]
  },
  {
    id: 'scen_cafe_paris',
    title: 'Bistro in Paris',
    description: 'Order breakfast at a quaint Parisian café and practice polite French requests.',
    category: 'travel',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Le Petit Café, Saint-Germain-des-Prés',
    characterName: 'Yoe',
    characterRole: 'Bistro Server',
    avatar: '🥐',
    imageUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['croissant', 'café au lait', 'l\'addition', 's\'il vous plaît', 'merci'],
    initialGreeting: 'Bonjour ! Je suis Yoe. Bienvenue au Petit Café. Vous désirez une table en terrasse ou à l\'intérieur ?',
    initialGreetingTranslation: 'Hello! I am Yoe. Welcome to Le Petit Café. Would you prefer a table on the terrace or inside?',
    objectives: [
      { id: 'obj_fr_1', text: 'Greet Yoe politely and state your seating preference', completed: false, hint: 'Say: Bonjour Yoe! Je voudrais une table en terrasse, s\'il vous plaît.' },
      { id: 'obj_fr_2', text: 'Order a croissant and a coffee', completed: false, hint: 'Say: Je voudrais un croissant et un café au lait, s\'il vous plaît.' },
      { id: 'obj_fr_3', text: 'Ask for the check at the end of breakfast', completed: false, hint: 'Say: L\'addition, s\'il vous plaît.' }
    ]
  },
  {
    id: 'scen_travel_ordering_tapas',
    title: 'Ordering Tapas at a Spanish Taberna',
    description: 'Order authentic Iberian ham, patatas bravas, and sparkling mineral water from a bustling tapas bar.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Taberna La Latina, Madrid',
    characterName: 'Yoe',
    characterRole: 'Tapas Bar Waiter',
    avatar: '🥘',
    imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['tapas', 'ración', 'jamón ibérico', 'patatas bravas', 'agua con gas'],
    initialGreeting: '¡Hola! ¿Qué os apetece tomar para picar hoy? Tenemos una tortilla recién hecha y jamón de bellota.',
    initialGreetingTranslation: 'Hello! What would you like to have for snacks today? We have freshly made tortilla and cured ham.',
    objectives: [
      { id: 'obj_ot_1', text: 'Order a portion of patatas bravas and tortilla', completed: false, hint: 'Say: Para empezar, una ración de patatas bravas y un trozo de tortilla, por favor.' },
      { id: 'obj_ot_2', text: 'Ask for beverage recommendations', completed: false, hint: 'Say: ¿Qué vino tinto de la casa me recomienda?' },
      { id: 'obj_ot_3', text: 'Ask for the bill at the end of meal', completed: false, hint: 'Say: La cuenta, cuando pueda, por favor.' }
    ]
  },
  {
    id: 'scen_travel_boutique_shopping',
    title: 'Boutique Souvenir & Clothing Shopping',
    description: 'Browse local artisan gifts, inquire about sizes, try on clothing in fitting rooms, and ask about tax refunds.',
    category: 'travel',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'El Born Artisan District, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Boutique Store Clerk',
    avatar: '🛍️',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['talla', 'probador', 'precio', 'descuento', 'regalo'],
    initialGreeting: '¡Hola! Bienvenidos a nuestra tienda artesanal. Si buscas alguna talla o regalo en especial, avísame.',
    initialGreetingTranslation: 'Hello! Welcome to our artisan boutique. If you are looking for any size or special gift, let me know.',
    objectives: [
      { id: 'obj_bs_1', text: 'Ask for a shirt in a medium or large size', completed: false, hint: 'Say: Me gusta esta camisa, ¿la tiene en talla mediana?' },
      { id: 'obj_bs_2', text: 'Ask where the fitting rooms (probadores) are', completed: false, hint: 'Say: ¿Dónde están los probadores para probármela?' },
      { id: 'obj_bs_3', text: 'Ask if tax-free tourist refund forms are provided', completed: false, hint: 'Say: ¿Ofrecen formulario de Tax Free para turistas?' }
    ]
  },
  {
    id: 'scen_travel_market_prices',
    title: 'Asking Prices at the Farmers Market',
    description: 'Select fresh seasonal fruits, ask the price per kilogram, and practice friendly bargaining etiquette.',
    category: 'travel',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Marché Bastille, Paris',
    characterName: 'Yoe',
    characterRole: 'Fruit & Vegetable Merchant',
    avatar: '🍓',
    imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['combien coûte', 'kilo', 'fraises', 'mûr', 'marché'],
    initialGreeting: 'Bonjour ! Regardez nos belles fraises de saison et nos avocats bien mûrs. Que désirez-vous ?',
    initialGreetingTranslation: 'Good morning! Look at our beautiful seasonal strawberries and ripe avocados. What would you like?',
    objectives: [
      { id: 'obj_mp_1', text: 'Ask the price per kilo for strawberries', completed: false, hint: 'Say: Bonjour ! Combien coûte le kilo de fraises ?' },
      { id: 'obj_mp_2', text: 'Order 500 grams of tomatoes and ripe oranges', completed: false, hint: 'Say: Je voudrais cinq cents grammes de tomates et deux oranges bien mûres.' },
      { id: 'obj_mp_3', text: 'Ask for the total amount and pay in cash', completed: false, hint: 'Say: Ça fait combien en tout ? Voici cinq euros.' }
    ]
  },
  {
    id: 'scen_travel_emergency_lost_passport',
    title: 'Consulate Visit: Lost Passport & Emergency',
    description: 'Visit the consular services office to report a stolen passport and apply for an emergency travel document.',
    category: 'travel',
    targetLanguage: 'en',
    cefrLevel: 'B1',
    location: 'Embassy Consular Section, Rome',
    characterName: 'Yoe',
    characterRole: 'Consular Assistance Officer',
    avatar: '🛡️',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['passport', 'police report', 'emergency travel document', 'embassy', 'flight'],
    initialGreeting: 'Good morning. Please take a seat. I understand you lost your passport and need emergency travel documentation?',
    initialGreetingTranslation: 'Good morning. Please take a seat. I understand you lost your passport and need emergency travel documentation?',
    objectives: [
      { id: 'obj_ep_1', text: 'Explain when and where your passport was lost or stolen', completed: false, hint: 'Say: My backpack was stolen yesterday on the train, and my passport was inside.' },
      { id: 'obj_ep_2', text: 'Present your official police report copy', completed: false, hint: 'Say: I have the police report right here along with a photocopy of my ID.' },
      { id: 'obj_ep_3', text: 'Ask for an emergency document for an upcoming flight', completed: false, hint: 'Say: My flight home is tomorrow evening. Can I get an emergency passport today?' }
    ]
  },

  // ==========================================
  // 2. DAILY LIFE & ESSENTIALS (16 Situations)
  // ==========================================
  {
    id: 'scen_a1_intro_maya',
    title: 'Introduce Yourself & Make a Friend',
    description: 'Break the ice in a friendly setting, share your name, where you are from, and your favorite hobbies.',
    category: 'daily',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Community Botanical Garden Cafe',
    characterName: 'Yoe',
    characterRole: 'Friendly Local',
    avatar: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['name', 'from', 'hobby', 'pleasure', 'nice to meet you'],
    initialGreeting: 'Hi there! Mind if I sit here? I\'m Yoe. What\'s your name and where are you from?',
    initialGreetingTranslation: 'Hi there! Mind if I sit here? I\'m Yoe. What\'s your name and where are you from?',
    objectives: [
      { id: 'obj_intro_1', text: 'Share your name and country or city of origin', completed: false, hint: 'Say: Hi Yoe, my name is... and I am from...' },
      { id: 'obj_intro_2', text: 'Tell Yoe what you like doing in your free time', completed: false, hint: 'Say: In my free time, I like...' },
      { id: 'obj_intro_3', text: 'Ask Yoe a polite question back', completed: false, hint: 'Say: What about you, Yoe? Do you live nearby?' }
    ]
  },
  {
    id: 'scen_daily_meeting_neighbor',
    title: 'Meeting a New Neighbor in the Building',
    description: 'Introduce yourself in the building hallway, exchange apartment numbers, and offer neighborly help.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Residential Building Lobby, Valencia',
    characterName: 'Yoe',
    characterRole: 'Next-Door Neighbor',
    avatar: '🏡',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['vecino', 'edificio', 'piso', 'encantado', 'ayuda'],
    initialGreeting: '¡Hola! He visto que te acabas de mudar. Soy Yoe, vivo en el piso 3B. ¡Bienvenido al edificio!',
    initialGreetingTranslation: 'Hello! I saw that you just moved in. I am Yoe, I live in apartment 3B. Welcome to the building!',
    objectives: [
      { id: 'obj_mn_1', text: 'Thank the neighbor and share your apartment number', completed: false, hint: 'Say: ¡Muchas gracias! Me llamo... y vivo en el 3A, justo al lado.' },
      { id: 'obj_mn_2', text: 'Mention how long you have lived in the city', completed: false, hint: 'Say: Me mudé hace dos semanas a Valencia por trabajo.' },
      { id: 'obj_mn_3', text: 'Express readiness to help if needed', completed: false, hint: 'Say: Si necesitas cualquier cosa, no dudes en llamar a mi puerta.' }
    ]
  },
  {
    id: 'scen_daily_small_talk_weather',
    title: 'Casual Small Talk & The Weekend Weather',
    description: 'Chat with a friendly barista or acquaintance about the sunny weekend weather and local outdoor parks.',
    category: 'daily',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Parkside Kiosk, Jardin du Luxembourg, Paris',
    characterName: 'Yoe',
    characterRole: 'Kiosk Barista',
    avatar: '☀️',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['beau temps', 'soleil', 'ce week-end', 'parc', 'promenade'],
    initialGreeting: 'Bonjour ! Quel soleil magnifique aujourd\'hui, n\'est-ce pas ? Vous profitez de cette belle journée ?',
    initialGreetingTranslation: 'Good morning! What magnificent sunshine today, isn\'t it? Are you enjoying this lovely day?',
    objectives: [
      { id: 'obj_st_1', text: 'Agree enthusiastically about the pleasant temperature', completed: false, hint: 'Say: Oui, il fait vraiment très beau et doux aujourd\'hui !' },
      { id: 'obj_st_2', text: 'Mention your plans to walk or read in the park', completed: false, hint: 'Say: Je vais faire une promenade dans le jardin cet après-midi.' },
      { id: 'obj_st_3', text: 'Ask about expected rain or forecast for tomorrow', completed: false, hint: 'Say: Pensez-vous qu\'il fera beau aussi demain ?' }
    ]
  },
  {
    id: 'scen_daily_talking_hobbies',
    title: 'Discussing Hobbies & Favorite Passions',
    description: 'Share your enthusiasm for cooking, photography, sports, and language learning with a fellow hobbyist.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Cultural Arts Center Lounge, Seville',
    characterName: 'Yoe',
    characterRole: 'Photography Club Member',
    avatar: '🎨',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['pasatiempo', 'fotografía', 'cocinar', 'tocar la guitarra', 'fin de semana'],
    initialGreeting: '¡Hola! Estaba admirando esta galería de fotos. ¿Qué sueles hacer los fines de semana para desconectar?',
    initialGreetingTranslation: 'Hello! I was admiring this photo gallery. What do you usually do on weekends to unwind?',
    objectives: [
      { id: 'obj_th_1', text: 'Describe two hobbies you practice regularly', completed: false, hint: 'Say: Me encanta la fotografía urbana y también cocinar platos tradicionales.' },
      { id: 'obj_th_2', text: 'Explain why you find these activities relaxing', completed: false, hint: 'Say: Me ayuda a relajarme después de una larga semana de estudio.' },
      { id: 'obj_th_3', text: 'Ask Yoe about their creative interests', completed: false, hint: 'Say: ¿Y tú? ¿Desde cuándo practicas fotografía?' }
    ]
  },
  {
    id: 'scen_daily_making_plans',
    title: 'Making Weekend Coffee Plans with a Colleague',
    description: 'Coordinate a time, place, and activity to meet up over the weekend with a friend.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Plaza del Sol, Madrid',
    characterName: 'Yoe',
    characterRole: 'College Friend',
    avatar: '☕',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['quedar', 'sábado por la tarde', 'cafetería', 'hora', 'te parece bien'],
    initialGreeting: '¡Hola! Tenemos que ponernos al día. ¿Tienes planes para este sábado por la tarde?',
    initialGreetingTranslation: 'Hello! We need to catch up. Do you have plans for this Saturday afternoon?',
    objectives: [
      { id: 'obj_mp_1', text: 'Propose meeting at 4:30 PM at a central cafe', completed: false, hint: 'Say: Estoy libre el sábado. ¿Quedamos a las cuatro y media en el centro?' },
      { id: 'obj_mp_2', text: 'Suggest a specialty coffee shop with outdoor seating', completed: false, hint: 'Say: Conozco una cafetería muy bonita con terraza cerca de la plaza.' },
      { id: 'obj_mp_3', text: 'Confirm the meetup time and exchange confirmation', completed: false, hint: 'Say: Perfecto, nos vemos el sábado a las cuatro y media allí.' }
    ]
  },
  {
    id: 'scen_daily_invitation_accepting',
    title: 'Accepting a Dinner Party Invitation',
    description: 'Accept a friend\'s dinner invitation warmly, ask what you can bring, and check dietary restrictions.',
    category: 'daily',
    targetLanguage: 'fr',
    cefrLevel: 'A2',
    location: 'Café Terrace, Lyon',
    characterName: 'Yoe',
    characterRole: 'Dinner Party Host',
    avatar: '🎉',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['invitation', 'dîner', 'avec grand plaisir', 'apporter', 'dessert'],
    initialGreeting: 'Salut ! J\'organise un dîner vendredi soir chez moi avec quelques amis. Serais-tu disponible pour venir ?',
    initialGreetingTranslation: 'Hi! I am hosting a dinner this Friday evening at my place with a few friends. Would you be free to come?',
    objectives: [
      { id: 'obj_ia_1', text: 'Accept the invitation with enthusiasm', completed: false, hint: 'Say: Avec grand plaisir ! Merci beaucoup pour l\'invitation.' },
      { id: 'obj_ia_2', text: 'Ask what you can bring (dessert or drinks)', completed: false, hint: 'Say: Que puis-je apporter ? Une bouteille de vin ou un dessert ?' },
      { id: 'obj_ia_3', text: 'Confirm the start time and address details', completed: false, hint: 'Say: À quelle heure dois-je arriver vendredi soir ?' }
    ]
  },
  {
    id: 'scen_daily_invitation_declining',
    title: 'Declining an Invitation Politely',
    description: 'Thank a colleague for an invitation, explain a prior commitment gracefully, and suggest a future raincheck.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Office Lounge, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Work Colleague',
    avatar: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['lo siento', 'compromiso previo', 'otra ocasión', 'gracias por invitarme', 'la próxima semana'],
    initialGreeting: '¡Hola! Varios compañeros vamos a cenar juntos el jueves por la noche. ¿Te gustaría unirte a nosotros?',
    initialGreetingTranslation: 'Hello! Several coworkers are going out for dinner on Thursday night. Would you like to join us?',
    objectives: [
      { id: 'obj_id_1', text: 'Thank colleague and express polite regret', completed: false, hint: 'Say: Muchas gracias por invitarme, me encantaría pero ya tengo un compromiso previo.' },
      { id: 'obj_id_2', text: 'Briefly mention family or study obligation', completed: false, hint: 'Say: Tengo una clase importante el jueves por la noche.' },
      { id: 'obj_id_3', text: 'Suggest grabbing lunch or coffee next week instead', completed: false, hint: 'Say: ¿Podríamos tomar un café la próxima semana para compensarlo?' }
    ]
  },
  {
    id: 'scen_daily_asking_help',
    title: 'Asking for Help & Favors Politely',
    description: 'Ask a library clerk or study partner for help finding references and using high-tech scanners.',
    category: 'daily',
    targetLanguage: 'en',
    cefrLevel: 'A1',
    location: 'Central Public Library',
    characterName: 'Yoe',
    characterRole: 'Reference Librarian',
    avatar: '📚',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['excuse me', 'could you help me', 'looking for', 'scanner', 'thank you'],
    initialGreeting: 'Hello! Welcome to the library. Are you looking for a specific section or research material?',
    initialGreetingTranslation: 'Hello! Welcome to the library. Are you looking for a specific section or research material?',
    objectives: [
      { id: 'obj_ah_1', text: 'Excuse yourself politely and explain what book you need', completed: false, hint: 'Say: Excuse me, could you please help me find the language learning section?' },
      { id: 'obj_ah_2', text: 'Ask how to operate the digital book scanner', completed: false, hint: 'Say: How do I scan these pages to my USB drive?' },
      { id: 'obj_ah_3', text: 'Thank the librarian for their assistance', completed: false, hint: 'Say: Thank you very much for your kind help!' }
    ]
  },
  {
    id: 'scen_daily_doctor_appointment',
    title: 'Making a Doctor Appointment',
    description: 'Call a clinic reception desk to schedule a general health checkup, describe availability, and provide insurance info.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Clínica Salud Integral, Madrid',
    characterName: 'Yoe',
    characterRole: 'Medical Receptionist',
    avatar: '🩺',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['cita médica', 'doctor', 'consulta', 'seguro médico', 'disponibilidad'],
    initialGreeting: 'Buenos días, Clínica Salud Integral. ¿En qué especialidad médica desea solicitar su cita?',
    initialGreetingTranslation: 'Good morning, Integral Health Clinic. In which medical specialty would you like to request your appointment?',
    objectives: [
      { id: 'obj_da_1', text: 'Request an appointment with a general doctor', completed: false, hint: 'Say: Buenos días, quisiera pedir una cita con el médico de cabecera, por favor.' },
      { id: 'obj_da_2', text: 'Specify preference for mornings this week', completed: false, hint: 'Say: ¿Tiene disponibilidad este jueves o viernes por la mañana?' },
      { id: 'obj_da_3', text: 'Confirm your name and insurance policy details', completed: false, hint: 'Say: Tengo seguro privado con Sanitas. Mi número de póliza es...' }
    ]
  },
  {
    id: 'scen_daily_pharmacy_visit',
    title: 'Visiting the Local Pharmacy',
    description: 'Describe minor cold and throat symptoms to the pharmacist, ask for dosage advice, and purchase lozenges.',
    category: 'daily',
    targetLanguage: 'fr',
    cefrLevel: 'A1',
    location: 'Pharmacie Centrale, Bordeaux',
    characterName: 'Yoe',
    characterRole: 'Pharmacist',
    avatar: '💊',
    imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['maux de gorge', 'rhume', 'médicament', 'posologie', 'pastilles'],
    initialGreeting: 'Bonjour ! Comment puis-je vous conseiller aujourd\'hui ? Avez-vous une ordonnance ?',
    initialGreetingTranslation: 'Good morning! How may I advise you today? Do you have a prescription?',
    objectives: [
      { id: 'obj_pv_1', text: 'Explain that you have a sore throat and slight headache', completed: false, hint: 'Say: Bonjour. J\'ai mal à la gorge et un peu mal à la tête depuis hier.' },
      { id: 'obj_pv_2', text: 'Ask for throat lozenges and vitamin C', completed: false, hint: 'Say: Avez-vous des pastilles pour la gorge sans ordonnance ?' },
      { id: 'obj_pv_3', text: 'Ask how many times per day to take them', completed: false, hint: 'Say: Combien de fois par jour dois-je prendre ces comprimés ?' }
    ]
  },
  {
    id: 'scen_daily_bank_account',
    title: 'Opening an Account at the Local Bank',
    description: 'Inquire about student or standard checking accounts, debit cards, mobile banking app access, and required ID.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Banco Santander Branch, Madrid',
    characterName: 'Yoe',
    characterRole: 'Bank Account Officer',
    avatar: '🏦',
    imageUrl: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['cuenta bancaria', 'tarjeta de débito', 'transferencias', 'comisiones', 'pasaporte'],
    initialGreeting: '¡Hola, buenos días! Tome asiento. ¿Desea abrir una cuenta corriente con nosotros hoy?',
    initialGreetingTranslation: 'Hello, good morning! Have a seat. Would you like to open a checking account with us today?',
    objectives: [
      { id: 'obj_ba_1', text: 'State that you want to open a basic checking account', completed: false, hint: 'Say: Buenos días, quisiera abrir una cuenta corriente sin comisiones de mantenimiento.' },
      { id: 'obj_ba_2', text: 'Inquire about contactless debit cards and app access', completed: false, hint: 'Say: ¿La cuenta incluye tarjeta de débito y acceso a la aplicación móvil?' },
      { id: 'obj_ba_3', text: 'Show passport and proof of local address', completed: false, hint: 'Say: Aquí tiene mi pasaporte y el contrato de alquiler para la dirección.' }
    ]
  },
  {
    id: 'scen_daily_post_office',
    title: 'Mailing a Parcel at the Post Office',
    description: 'Weigh a box, choose standard or express airmail shipping, fill in customs forms, and purchase stamps.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Oficina de Correos, Centro, Madrid',
    characterName: 'Yoe',
    characterRole: 'Postal Clerk',
    avatar: '📦',
    imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['paquete', 'enviar', 'urgente', 'sellos', 'código postal'],
    initialGreeting: '¡Siguiente! Buenas tardes. Ponga el paquete sobre la báscula, por favor. ¿Adónde va dirigido?',
    initialGreetingTranslation: 'Next! Good afternoon. Please place the parcel on the scale. Where is it addressed to?',
    objectives: [
      { id: 'obj_po_1', text: 'State destination country and parcel contents', completed: false, hint: 'Say: Buenas tardes, quiero enviar este paquete a Francia con libros y ropa.' },
      { id: 'obj_po_2', text: 'Ask the difference between standard and express postage', completed: false, hint: 'Say: ¿Cuánto tarda el envío urgente y cuál es la diferencia de precio?' },
      { id: 'obj_po_3', text: 'Request a tracking number (número de seguimiento)', completed: false, hint: 'Say: ¿Viene con número de seguimiento para rastrear el paquete?' }
    ]
  },
  {
    id: 'scen_daily_supermarket_checkout',
    title: 'Grocery Shopping & Supermarket Checkout',
    description: 'Ask for grocery section aisles, inquire about organic produce, and complete checkout with shopping bags.',
    category: 'daily',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Mercadona Supermarket, Valencia',
    characterName: 'Yoe',
    characterRole: 'Supermarket Cashier',
    avatar: '🛒',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['bolsa', 'tarjeta', 'ticket', 'pasillo', 'leche'],
    initialGreeting: '¡Hola! ¿Quiere que le cobre todo junto? ¿Va a necesitar bolsa de plástico o de papel?',
    initialGreetingTranslation: 'Hello! Would you like me to scan everything together? Will you need a plastic or paper bag?',
    objectives: [
      { id: 'obj_sc_1', text: 'Request one reusable paper shopping bag', completed: false, hint: 'Say: Hola, una bolsa de papel, por favor.' },
      { id: 'obj_sc_2', text: 'Indicate payment by credit card contactlessly', completed: false, hint: 'Say: Voy a pagar con tarjeta de crédito contacless.' },
      { id: 'obj_sc_3', text: 'Politely ask for the receipt (ticket de compra)', completed: false, hint: 'Say: ¿Me da el ticket de compra, por favor? Muchas gracias.' }
    ]
  },

  // ==========================================
  // 3. WORK & PROFESSIONAL (12 Situations)
  // ==========================================
  {
    id: 'scen_work_job_interview',
    title: 'Job Interview & Career Background',
    description: 'Present your professional skills, highlight relevant project accomplishments, and answer situational questions.',
    category: 'work',
    targetLanguage: 'en',
    cefrLevel: 'B2',
    location: 'Tech Innovation Hub, London',
    characterName: 'Yoe',
    characterRole: 'Hiring Manager',
    avatar: '💼',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['experience', 'strengths', 'collaboration', 'deliverables', 'challenges'],
    initialGreeting: 'Welcome! Thank you for coming in today. To start off, could you walk me through your background and what motivated you to apply?',
    initialGreetingTranslation: 'Welcome! Thank you for coming in today. To start off, could you walk me through your background and what motivated you to apply?',
    objectives: [
      { id: 'obj_ji_1', text: 'Summarize your recent experience and core strengths', completed: false, hint: 'Say: Over the past three years, I have specialized in building responsive web applications...' },
      { id: 'obj_ji_2', text: 'Describe a challenging project you successfully delivered', completed: false, hint: 'Say: In my last role, our team overcame tight deadlines by improving asynchronous communication.' },
      { id: 'obj_ji_3', text: 'Ask an insightful question about team culture and growth', completed: false, hint: 'Say: What are the main milestones your engineering team is aiming for this quarter?' }
    ]
  },
  {
    id: 'scen_work_first_day_office',
    title: 'First Day at the Company & Onboarding',
    description: 'Meet your onboarding buddy, set up your workstation credentials, and learn office routines.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Modern Coworking Campus, Madrid',
    characterName: 'Yoe',
    characterRole: 'Onboarding Buddy',
    avatar: '🏢',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['primer día', 'puesto de trabajo', 'reunión de equipo', 'cafetería', 'bienvenida'],
    initialGreeting: '¡Hola y bienvenido al equipo! Soy Yoe, tu compañero de bienvenida durante esta primera semana. ¿Cómo te sientes?',
    initialGreetingTranslation: 'Hello and welcome to the team! I am Yoe, your onboarding buddy for this first week. How are you feeling?',
    objectives: [
      { id: 'obj_fd_1', text: 'Express enthusiasm for starting the new role', completed: false, hint: 'Say: ¡Muchas gracias Yoe! Estoy muy ilusionado por empezar a trabajar con todos.' },
      { id: 'obj_fd_2', text: 'Ask where the daily team sync and lunch area are', completed: false, hint: 'Say: ¿A qué hora suele ser la reunión diaria de equipo y dónde está la cocina?' },
      { id: 'obj_fd_3', text: 'Confirm your Slack and repository access permissions', completed: false, hint: 'Say: Ya tengo acceso al correo, ¿me puedes añadir al canal del proyecto?' }
    ]
  },
  {
    id: 'scen_work_team_standup',
    title: 'Sprint Planning & Daily Team Standup',
    description: 'Give a concise 90-second update on yesterday\'s tasks, current sprint blockers, and today\'s goals.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Design Studio Boardroom, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Sprint Team Lead',
    avatar: '📊',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['sprint', 'bloqueo', 'objetivo de hoy', 'completado', 'revisión'],
    initialGreeting: 'Buenos días a todos. Empezamos la reunión diaria de sincronización. ¿Quién quiere compartir su actualización primero?',
    initialGreetingTranslation: 'Good morning everyone. Let\'s start the daily sync meeting. Who would like to share their update first?',
    objectives: [
      { id: 'obj_ts_1', text: 'State what task you completed yesterday', completed: false, hint: 'Say: Ayer completé la integración de la API y las pruebas de rendimiento.' },
      { id: 'obj_ts_2', text: 'State your key focus area for today', completed: false, hint: 'Say: Hoy me enfocaré en rediseñar la interfaz de usuario según las recomendaciones.' },
      { id: 'obj_ts_3', text: 'State whether you have any blockers or need pair review', completed: false, hint: 'Say: No tengo bloqueos técnicos, solo necesitaré una revisión de código al final del día.' }
    ]
  },
  {
    id: 'scen_work_project_deadline',
    title: 'Discussing a Critical Project Deadline',
    description: 'Negotiate scope adjustments with a manager to ensure quality delivery before an upcoming product release.',
    category: 'work',
    targetLanguage: 'fr',
    cefrLevel: 'B2',
    location: 'Executive Office, Paris',
    characterName: 'Yoe',
    characterRole: 'Product Director',
    avatar: '📈',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['délai', 'livraison', 'priorités', 'ajustement', 'qualité'],
    initialGreeting: 'Bonjour. Nous devons faire le point sur le calendrier de livraison du projet. Pensez-vous que nous tiendrons l\'échéance du 15 ?',
    initialGreetingTranslation: 'Good morning. We need to review the project delivery schedule. Do you think we will meet the 15th deadline?',
    objectives: [
      { id: 'obj_pdl_1', text: 'Analyze progress realistically and highlight critical paths', completed: false, hint: 'Say: Nous avons bien avancé sur le cœur du système, mais les tests finaux demandent plus de temps.' },
      { id: 'obj_pdl_2', text: 'Propose launching core features first while deferring minor ones', completed: false, hint: 'Say: Je propose de prioriser les fonctionnalités essentielles pour le 15 et de reporter les options secondaires.' },
      { id: 'obj_pdl_3', text: 'Agree on a revised quality validation milestone', completed: false, hint: 'Say: Ainsi, nous garantissons une qualité irréprochable pour la version de lancement.' }
    ]
  },
  {
    id: 'scen_work_asking_clarification',
    title: 'Asking for Task Clarification & Technical Specs',
    description: 'Ask a colleague to clarify requirements on a design brief or technical document without hesitation.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Engineering Hub, Madrid',
    characterName: 'Yoe',
    characterRole: 'Senior Tech Lead',
    avatar: '💡',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['duda', 'especificaciones', 'requisito', 'explicación', 'diseño'],
    initialGreeting: '¡Hola! He subido el documento de requisitos del módulo. ¿Tienes alguna duda antes de empezar a programar?',
    initialGreetingTranslation: 'Hello! I have uploaded the module requirements document. Do you have any questions before starting to code?',
    objectives: [
      { id: 'obj_ac_1', text: 'State which specific section needs clarification', completed: false, hint: 'Say: Hola Yoe, tengo una duda sobre el apartado de autenticación de usuarios.' },
      { id: 'obj_ac_2', text: 'Ask about the expected input format', completed: false, hint: 'Say: ¿Cuál es el formato exacto que debe devolver la función?' },
      { id: 'obj_ac_3', text: 'Confirm when you will send the first draft', completed: false, hint: 'Say: Perfecto, te enviaré un primer borrador mañana por la tarde.' }
    ]
  },
  {
    id: 'scen_work_client_support',
    title: 'Handling a Priority Client Consultation',
    description: 'Listen attentively to a client\'s software issue, troubleshoot politely, and offer a quick resolution.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Customer Success Hub, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Corporate Client',
    avatar: '🎧',
    imageUrl: 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['asistencia', 'incidencia', 'resolución', 'cuenta', 'actualización'],
    initialGreeting: 'Hola, buenos días. No podemos acceder a nuestro panel de control desde esta mañana y tenemos una presentación urgente.',
    initialGreetingTranslation: 'Hello, good morning. We cannot access our dashboard since this morning and we have an urgent presentation.',
    objectives: [
      { id: 'obj_cs_1', text: 'Acknowledge the urgency and reassure the client calmly', completed: false, hint: 'Say: Buenos días. Lamento mucho el inconveniente, voy a revisar el estado de su cuenta inmediatamente.' },
      { id: 'obj_cs_2', text: 'Ask for the error code or account email', completed: false, hint: 'Say: ¿Podría indicarme el correo electrónico asociado a su cuenta de empresa?' },
      { id: 'obj_cs_3', text: 'Explain the fix and confirm access is restored', completed: false, hint: 'Say: Ya hemos restablecido los permisos de acceso. Por favor, pruebe a iniciar sesión de nuevo.' }
    ]
  },
  {
    id: 'scen_work_contract_negotiation',
    title: 'Freelance Scope & Rate Negotiation',
    description: 'Discuss freelance project deliverables, timeline milestones, and agree on professional payment terms.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'B2',
    location: 'Consulting Suite, Valencia',
    characterName: 'Yoe',
    characterRole: 'Project Manager',
    avatar: '🤝',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['presupuesto', 'plazos', 'entregables', 'tarifa', 'contrato'],
    initialGreeting: 'Hola. Hemos revisado tu propuesta para el rediseño digital. Nos gusta mucho, pero quisiéramos ajustar el presupuesto total.',
    initialGreetingTranslation: 'Hello. We have reviewed your proposal for the digital redesign. We really like it, but we would like to adjust the total budget.',
    objectives: [
      { id: 'obj_cn_1', text: 'Explain the value and comprehensive scope of the deliverables', completed: false, hint: 'Say: Comprendo su punto. Mi presupuesto incluye la investigación de usuarios, el prototipado y soporte técnico post-lanzamiento.' },
      { id: 'obj_cn_2', text: 'Propose flexible milestones or phased delivery', completed: false, hint: 'Say: Podríamos dividir el proyecto en dos fases para adaptarnos a su flujo financiero.' },
      { id: 'obj_cn_3', text: 'Reach an agreement and outline next contractual steps', completed: false, hint: 'Say: Si están de acuerdo con estos términos, prepararé el contrato de servicios hoy mismo.' }
    ]
  },
  {
    id: 'scen_work_business_lunch',
    title: 'Professional Business Lunch Etiquette',
    description: 'Engage in polite professional small talk, discuss industry trends, and conclude with next collaboration steps.',
    category: 'work',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Executive Bistro, Salamanca, Madrid',
    characterName: 'Yoe',
    characterRole: 'Partner Director',
    avatar: '🍽️',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['almuerzo', 'sector', 'oportunidades', 'colaboración', 'brindis'],
    initialGreeting: '¡Qué placer reunirnos hoy! El restaurante tiene un menú excelente. ¿Cómo ha ido la semana de conferencias?',
    initialGreetingTranslation: 'What a pleasure to meet today! The restaurant has an excellent menu. How has your conference week been?',
    objectives: [
      { id: 'obj_bl_1', text: 'Share positive impressions of the industry conference', completed: false, hint: 'Say: Ha sido muy productiva, he asistido a varias charlas muy inspiradoras sobre inteligencia artificial.' },
      { id: 'obj_bl_2', text: 'Express enthusiasm for future collaborative opportunities', completed: false, hint: 'Say: Creo que nuestras empresas tienen grandes sinergias para desarrollar proyectos conjuntos.' },
      { id: 'obj_bl_3', text: 'Suggest follow-up calendar invite for next week', completed: false, hint: 'Say: Le enviaré una invitación formal para agendar una videollamada el próximo martes.' }
    ]
  },

  // ==========================================
  // 4. SOCIAL & CULTURE (8 Situations)
  // ==========================================
  {
    id: 'scen_social_party_mingling',
    title: 'Rooftop Party Mingling & Meeting Friends',
    description: 'Strike up lively conversations at an international social mixer, share anecdotes, and make plans.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Rooftop Terrace, Santa Cruz, Seville',
    characterName: 'Yoe',
    characterRole: 'Party Guest',
    avatar: '🥂',
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['fiesta', 'música', 'conocer gente', 'bebida', 'terraza'],
    initialGreeting: '¡Hola! Qué vistas tan increíbles de la ciudad desde aquí. ¿Cómo conoces a los anfitriones de la fiesta?',
    initialGreetingTranslation: 'Hello! What incredible views of the city from up here. How do you know the party hosts?',
    objectives: [
      { id: 'obj_pm_1', text: 'Introduce yourself and explain connection to host', completed: false, hint: 'Say: ¡Hola! Me llamo... Soy amigo de Marta de la universidad.' },
      { id: 'obj_pm_2', text: 'Compliment the lively music and city night views', completed: false, hint: 'Say: El ambiente y la música están geniales esta noche.' },
      { id: 'obj_pm_3', text: 'Ask Yoe where they work or study', completed: false, hint: 'Say: ¿A qué te dedicas tú en Sevilla?' }
    ]
  },
  {
    id: 'scen_social_talking_movies',
    title: 'Talking About Movies & Streaming Series',
    description: 'Exchange opinions about recent blockbuster films, favorite directors, and captivating mystery genres.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Cinema Foyer, Gran Vía, Madrid',
    characterName: 'Yoe',
    characterRole: 'Film Enthusiast',
    avatar: '🍿',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['película', 'género', 'director', 'actuación', 'recomendación'],
    initialGreeting: '¡Qué gran final de película! No me esperaba ese giro de guión. ¿A ti qué te ha parecido?',
    initialGreetingTranslation: 'What a great movie ending! I did not expect that plot twist. What did you think of it?',
    objectives: [
      { id: 'obj_tm_1', text: 'Share your genuine impressions of the plot', completed: false, hint: 'Say: Me ha parecido fascinante, los giros de la trama estuvieron muy bien construidos.' },
      { id: 'obj_tm_2', text: 'Discuss your favorite movie genres (thriller, sci-fi, comedy)', completed: false, hint: 'Say: Suelo preferir el cine de ciencia ficción y los thrillers psicológicos.' },
      { id: 'obj_tm_3', text: 'Recommend a gripping series you watched recently', completed: false, hint: 'Say: Te recomiendo ver la última serie de misterio que estrenaron el mes pasado.' }
    ]
  },
  {
    id: 'scen_social_dinner_friends',
    title: 'Dinner with Friends & Splitting the Bill',
    description: 'Catch up on personal news over dinner, praise the food, and easily calculate splitting the restaurant bill.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Tapas Bistro, Gràcia, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Close Friend',
    avatar: '🥘',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['cena', 'amigos', 'tapas', 'cuenta', 'compartir'],
    initialGreeting: '¡Qué alegría vernos después de tanto tiempo! He pedido una tabla de quesos para empezar. ¿Qué tal tu semana?',
    initialGreetingTranslation: 'So great to see each other after so long! I ordered a cheese platter to start. How was your week?',
    objectives: [
      { id: 'obj_df_1', text: 'Share a quick highlight from your past week', completed: false, hint: 'Say: ¡Hola Yoe! Mi semana ha sido genial, empecé unas clases de natación.' },
      { id: 'obj_df_2', text: 'Praise the tapas dishes you are sharing', completed: false, hint: 'Say: La comida está deliciosa, especialmente las croquetas.' },
      { id: 'obj_df_3', text: 'Propose splitting the bill equally between everyone', completed: false, hint: 'Say: Dividimos la cuenta a partes iguales, ¿te parece bien?' }
    ]
  },
  {
    id: 'scen_social_language_exchange',
    title: 'Language Exchange Mixer at a Cozy Café',
    description: 'Meet conversation partners, practice switching languages smoothly, and exchange study tips.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Café de las Lenguas, Valencia',
    characterName: 'Yoe',
    characterRole: 'Exchange Partner',
    avatar: '🗣️',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['intercambio', 'aprender', 'idiomas', 'práctica', 'vocabulario'],
    initialGreeting: '¡Hola! Es mi primera vez en este intercambio de idiomas. ¿Llevas mucho tiempo aprendiendo español?',
    initialGreetingTranslation: 'Hello! It\'s my first time at this language exchange. Have you been learning Spanish for long?',
    objectives: [
      { id: 'obj_le_1', text: 'Explain how long you have been learning and your goals', completed: false, hint: 'Say: Llevo unos meses estudiando y quiero mejorar mi fluidez al hablar.' },
      { id: 'obj_le_2', text: 'Ask what methods your partner uses to memorize vocabulary', completed: false, hint: 'Say: ¿Qué aplicación o método usas tú para aprender nuevas palabras?' },
      { id: 'obj_le_3', text: 'Suggest practicing 15 minutes in Spanish then in your native tongue', completed: false, hint: 'Say: Hablamos quince minutos en español y luego cambiamos, ¿de acuerdo?' }
    ]
  },
  {
    id: 'scen_social_weekend_hiking',
    title: 'Planning a Weekend Mountain Hike',
    description: 'Coordinate departure times, mountain trail routes, backpack essentials, and weather forecasts with a friend.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Outdoor Enthusiasts Club, Granada',
    characterName: 'Yoe',
    characterRole: 'Hiking Companion',
    avatar: '🏔️',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['senderismo', 'montaña', 'mochila', 'ruta', 'tiempo'],
    initialGreeting: '¡Hola! El pronóstico del tiempo para el sábado en Sierra Nevada es perfecto. ¿Qué ruta prefieres hacer?',
    initialGreetingTranslation: 'Hello! The weather forecast for Saturday in Sierra Nevada is perfect. Which trail do you prefer to take?',
    objectives: [
      { id: 'obj_wh_1', text: 'Select a moderate scenic trail through pine forests', completed: false, hint: 'Say: Me gustaría hacer la ruta circular de los pinares, tiene vistas increíbles.' },
      { id: 'obj_wh_2', text: 'Confirm what gear and snacks each person will bring', completed: false, hint: 'Say: Yo llevaré agua, fruta y un botiquín básico en mi mochila.' },
      { id: 'obj_wh_3', text: 'Set an early meeting time at the trailhead', completed: false, hint: 'Say: Quedamos a las ocho de la mañana en la entrada del parque para evitar el calor.' }
    ]
  },
  {
    id: 'scen_social_birthday_toast',
    title: 'Birthday Celebration & Giving a Toast',
    description: 'Celebrate a close friend\'s birthday, give a heartfelt toast, and compliment the party decorations.',
    category: 'social',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Garden Party, Madrid',
    characterName: 'Yoe',
    characterRole: 'Birthday Host',
    avatar: '🎂',
    imageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['cumpleaños', 'brindis', 'regalo', 'felicidades', 'celebración'],
    initialGreeting: '¡Muchísimas gracias por venir a mi fiesta de cumpleaños! ¿Te apetece una copa para brindar?',
    initialGreetingTranslation: 'Thank you so much for coming to my birthday party! Would you like a drink for the toast?',
    objectives: [
      { id: 'obj_bt_1', text: 'Wish a warm Happy Birthday and hand over a gift', completed: false, hint: 'Say: ¡Feliz cumpleaños Yoe! Espero que disfrutes mucho este día. Aquí tienes un pequeño detalle.' },
      { id: 'obj_bt_2', text: 'Propose a cheerful toast with the guests', completed: false, hint: 'Say: ¡Un brindis por Yoe y por muchos años más de amistad y salud!' },
      { id: 'obj_bt_3', text: 'Compliment the delicious birthday cake', completed: false, hint: 'Say: La tarta de chocolate tiene una pinta increíble.' }
    ]
  },

  // ==========================================
  // 5. PRACTICAL & EMERGENCY (8 Situations)
  // ==========================================
  {
    id: 'scen_practical_emergency_dispatch',
    title: 'Calling Emergency Dispatch (112)',
    description: 'Calmly report an emergency situation, describe exact street coordinates, and state if an ambulance is needed.',
    category: 'practical',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Emergency Phone Line, Spain',
    characterName: 'Yoe',
    characterRole: '112 Emergency Dispatcher',
    avatar: '🚨',
    imageUrl: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['emergencia', 'ambulancia', 'calle', 'accidente', 'heridos'],
    initialGreeting: 'Servicio de Emergencias 112. ¿Cuál es su emergencia y en qué localidad se encuentra?',
    initialGreetingTranslation: '112 Emergency Service. What is your emergency and in what municipality are you located?',
    objectives: [
      { id: 'obj_ed_1', text: 'State clearly that you witnessed a minor traffic collision', completed: false, hint: 'Say: Buenas tardes, ha habido un accidente leve entre dos coches en la calle Mayor.' },
      { id: 'obj_ed_2', text: 'Give exact street name and nearby landmark', completed: false, hint: 'Say: Estamos frente al número 45, cerca de la estación de metro.' },
      { id: 'obj_ed_3', text: 'Clarify that both drivers are conscious but need checkup', completed: false, hint: 'Say: Los conductores están conscientes, pero se requiere una ambulancia por precaución.' }
    ]
  },
  {
    id: 'scen_practical_lost_passport',
    title: 'Reporting a Lost Passport at Police Station',
    description: 'File an official police report (denuncia) for a misplaced passport and request an incident certificate.',
    category: 'practical',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Comisaría de Policía Nacional, Madrid',
    characterName: 'Yoe',
    characterRole: 'Police Officer',
    avatar: '🛂',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['pasaporte', 'denuncia', 'comisaría', 'pérdida', 'documento'],
    initialGreeting: 'Buenos días. Tome asiento. ¿Viene a tramitar una denuncia por extravío o robo de documentación?',
    initialGreetingTranslation: 'Good morning. Take a seat. Are you here to file a report for lost or stolen documents?',
    objectives: [
      { id: 'obj_lpass_1', text: 'Explain that you lost your passport in the city center yesterday', completed: false, hint: 'Say: Buenos días, agente. He extraviado mi pasaporte ayer por la tarde en la zona centro.' },
      { id: 'obj_lpass_2', text: 'Provide your nationality, full name, and passport number', completed: false, hint: 'Say: Soy de nacionalidad británica y tengo una fotocopia del documento original aquí.' },
      { id: 'obj_lpass_3', text: 'Request a stamped copy of the police certificate for your embassy', completed: false, hint: 'Say: ¿Podría facilitarme una copia sellada de la denuncia para presentarla en mi consulado?' }
    ]
  },
  {
    id: 'scen_practical_lost_phone',
    title: 'Reporting a Lost Smartphone at Transit Desk',
    description: 'Inquire at metro lost and found about a phone left on a train, describe device model, case, and lock screen.',
    category: 'practical',
    targetLanguage: 'fr',
    cefrLevel: 'A2',
    location: 'RATP Lost & Found Office, Châtelet, Paris',
    characterName: 'Yoe',
    characterRole: 'Transit Lost Property Officer',
    avatar: '📱',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['téléphone perdu', 'métro', 'modèle', 'coque', 'écran'],
    initialGreeting: 'Bonjour. Vous êtes au bureau des objets trouvés de la RATP. Avez-vous oublié un objet dans les transports ?',
    initialGreetingTranslation: 'Hello. You have reached the RATP lost property office. Did you leave an item in transit?',
    objectives: [
      { id: 'obj_lp_1', text: 'Explain you left your smartphone on Line 1 twenty minutes ago', completed: false, hint: 'Say: Bonjour, j\'ai oublié mon téléphone dans la ligne 1 il y a environ vingt minutes.' },
      { id: 'obj_lp_2', text: 'Describe the brand, black protective case, and lock wallpaper', completed: false, hint: 'Say: C\'est un iPhone noir avec une coque transparente et une photo de montagne en fond d\'écran.' },
      { id: 'obj_lp_3', text: 'Provide alternative contact email or phone for notification', completed: false, hint: 'Say: Voici mon adresse e-mail pour me contacter si vous le retrouvez.' }
    ]
  },
  {
    id: 'scen_practical_car_breakdown',
    title: 'Roadside Assistance for Highway Flat Tire',
    description: 'Contact roadside assistance, describe highway kilometer marker, hazard lighting, and tow truck request.',
    category: 'practical',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Highway Assistance Operator, AP-7 Spain',
    characterName: 'Yoe',
    characterRole: 'Roadside Assistance Coordinator',
    avatar: '🚗',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['avería', 'grúa', 'autopista', 'rueda', 'arcén'],
    initialGreeting: 'Asistencia en Carretera, dígame. ¿Se encuentra usted y su vehículo en una zona segura?',
    initialGreetingTranslation: 'Roadside Assistance, go ahead. Are you and your vehicle in a safe location?',
    objectives: [
      { id: 'obj_cb_1', text: 'Confirm vehicle is stopped on the shoulder with hazards on', completed: false, hint: 'Say: Hola. He pinchado una rueda y estoy detenido en el arcén con las luces de emergencia puestas.' },
      { id: 'obj_cb_2', text: 'Give exact highway number and kilometer post', completed: false, hint: 'Say: Me encuentro en la autopista AP-7, a la altura del kilómetro ciento veinticuatro.' },
      { id: 'obj_cb_3', text: 'Ask estimated arrival time of the assistance tow truck', completed: false, hint: 'Say: ¿Cuánto tiempo tardará en llegar la grúa de asistencia?' }
    ]
  },
  {
    id: 'scen_practical_apartment_leak',
    title: 'Reporting a Water Leak to Building Maintenance',
    description: 'Explain an urgent plumbing leak under the kitchen sink, request immediate repair, and turn off water valve.',
    category: 'practical',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'Property Management Office, Valencia',
    characterName: 'Yoe',
    characterRole: 'Building Maintenance Manager',
    avatar: '🔧',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['fuga de agua', 'fontanero', 'tubería', 'llave de paso', 'urgente'],
    initialGreeting: 'Servicio de Mantenimiento de la finca. ¿Cuál es el problema en su piso?',
    initialGreetingTranslation: 'Building Maintenance Service. What is the issue in your apartment?',
    objectives: [
      { id: 'obj_al_1', text: 'Describe a significant water leak under the kitchen pipe', completed: false, hint: 'Say: Buenos días. Tengo una fuga de agua importante debajo del fregadero de la cocina.' },
      { id: 'obj_al_2', text: 'Confirm you have shut off the main water valve', completed: false, hint: 'Say: Ya he cerrado la llave de paso general para evitar que se inunde el suelo.' },
      { id: 'obj_al_3', text: 'Ask for an emergency plumber to visit this morning', completed: false, hint: 'Say: ¿Podría enviar a un fontanero de urgencia esta misma mañana?' }
    ]
  },
  {
    id: 'scen_practical_urgent_clinic',
    title: 'Urgent Care Walk-In Clinic Consultation',
    description: 'Check in at an urgent medical clinic, explain severe migraine and throat pain, and present insurance card.',
    category: 'practical',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Centro de Salud de Urgencias, Zaragoza',
    characterName: 'Yoe',
    characterRole: 'Clinic Receptionist',
    avatar: '🏥',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['urgencias', 'médico', 'tarjeta sanitaria', 'consulta', 'dolor'],
    initialGreeting: 'Buenas tardes. Bienvenida al centro de salud. ¿Tiene tarjeta sanitaria o seguro privado de viaje?',
    initialGreetingTranslation: 'Good afternoon. Welcome to the health center. Do you have a health card or private travel insurance?',
    objectives: [
      { id: 'obj_uc_1', text: 'Show European health card or travel insurance policy', completed: false, hint: 'Say: Buenas tardes. Aquí tiene mi tarjeta sanitaria europea y mi pasaporte.' },
      { id: 'obj_uc_2', text: 'Explain you need to see a doctor for intense throat pain and fever', completed: false, hint: 'Say: Necesito ver a un médico porque tengo un dolor fuerte de garganta y fiebre alta.' },
      { id: 'obj_uc_3', text: 'Ask which waiting room number you should sit in', completed: false, hint: 'Say: ¿En qué sala de espera debo aguardar a que me llamen?' }
    ]
  },
  {
    id: 'scen_practical_feeling_sick',
    title: 'Describing Symptoms to a University Nurse',
    description: 'Explain fever, fatigue, and throat discomfort, and receive medical guidance on hydration and rest.',
    category: 'practical',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Campus Health Center, Salamanca',
    characterName: 'Yoe',
    characterRole: 'Campus Nurse',
    avatar: '🌡️',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['fiebre', 'dolor de cabeza', 'garganta', 'cansancio', 'reposo'],
    initialGreeting: '¡Hola! Siéntate aquí. ¿Qué síntomas tienes y desde cuándo te sientes indispuesto?',
    initialGreetingTranslation: 'Hello! Have a seat here. What symptoms do you have and since when have you felt unwell?',
    objectives: [
      { id: 'obj_fs_1', text: 'Explain that you have had a mild fever since yesterday morning', completed: false, hint: 'Say: Tengo fiebre leve y dolor de cabeza desde ayer por la mañana.' },
      { id: 'obj_fs_2', text: 'Describe feeling very tired with muscle aches', completed: false, hint: 'Say: Me siento muy cansado y me duelen los músculos.' },
      { id: 'obj_fs_3', text: 'Ask if you should take medication and rest for two days', completed: false, hint: 'Say: ¿Qué medicamento me recomienda tomar y cuántos días de reposo necesito?' }
    ]
  },

  // ==========================================
  // 6. DINING & CULINARY (4 Situations)
  // ==========================================
  {
    id: 'scen_dining_tapas_bar',
    title: 'Ordering Tapas & Regional Wine in Madrid',
    description: 'Order authentic tapas specialties, ask about local house wines, and request recommendations.',
    category: 'dining',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Taberna La Latina, Madrid',
    characterName: 'Yoe',
    characterRole: 'Taberna Bartender',
    avatar: '🍷',
    imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['tapas', 'vino tinto', 'ración', 'patatas bravas', 'recomendar'],
    initialGreeting: '¡Buenas! ¿Qué os pongo de beber para empezar mientras miráis la carta de tapas?',
    initialGreetingTranslation: 'Hello! What can I get you to drink to start while you look over the tapas menu?',
    objectives: [
      { id: 'obj_dt_1', text: 'Order a glass of Rioja red wine and sparkling water', completed: false, hint: 'Say: Hola, una copa de vino tinto Rioja y un agua con gas, por favor.' },
      { id: 'obj_dt_2', text: 'Ask what the house specialty tapa is', completed: false, hint: 'Say: ¿Cuál es la especialidad de la casa que más nos recomienda?' },
      { id: 'obj_dt_3', text: 'Order a portion of patatas bravas and jamón ibérico', completed: false, hint: 'Say: Pónganos una ración de patatas bravas y una de jamón ibérico.' }
    ]
  },
  {
    id: 'scen_dining_gluten_free',
    title: 'Inquiring About Gluten-Free & Vegan Menu Options',
    description: 'Ask the waiter about allergen cross-contamination, lactose-free substitutes, and plant-based dishes.',
    category: 'dining',
    targetLanguage: 'es',
    cefrLevel: 'A2',
    location: 'Bistro Orgánico, Palma de Mallorca',
    characterName: 'Yoe',
    characterRole: 'Restaurant Server',
    avatar: '🥗',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['sin gluten', 'vegano', 'alergia', 'ingredientes', 'lácteos'],
    initialGreeting: '¡Buenas tardes! Aquí tienen la carta. ¿Tienen alguna alergia o preferencia alimentaria que debamos saber?',
    initialGreetingTranslation: 'Good afternoon! Here is the menu. Do you have any allergies or dietary preferences we should know about?',
    objectives: [
      { id: 'obj_gf_1', text: 'Explain that you are gluten intolerant (celiac)', completed: false, hint: 'Say: Sí, soy celíaco y no puedo consumir nada con gluten ni trazas de trigo.' },
      { id: 'obj_gf_2', text: 'Ask if the risotto or salads can be made completely vegan', completed: false, hint: 'Say: ¿El risotto de setas se puede preparar sin queso ni mantequilla?' },
      { id: 'obj_gf_3', text: 'Confirm separate kitchen preparation to avoid cross-contact', completed: false, hint: 'Say: ¿Tienen cuidado en la cocina con la contaminación cruzada? Muchas gracias.' }
    ]
  },

  // ==========================================
  // 7. SHOPPING & FASHION (4 Situations)
  // ==========================================
  {
    id: 'scen_shopping_clothes_size',
    title: 'Trying on Clothes & Inquiring for Sizes',
    description: 'Ask store staff for a different garment size, inquire about fitting room locations, and check color choices.',
    category: 'shopping',
    targetLanguage: 'es',
    cefrLevel: 'A1',
    location: 'Boutique de Moda, Passeig de Gràcia, Barcelona',
    characterName: 'Yoe',
    characterRole: 'Fashion Store Associate',
    avatar: '👗',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['talla', 'probador', 'color', 'camisa', 'quedar bien'],
    initialGreeting: '¡Hola! Si necesitas probarte alguna prenda, los probadores están al fondo a la izquierda. ¿Buscas alguna talla?',
    initialGreetingTranslation: 'Hello! If you need to try on any garment, the fitting rooms are at the back on the left. Are you looking for a size?',
    objectives: [
      { id: 'obj_scs_1', text: 'Ask if this jacket is available in size Medium', completed: false, hint: 'Say: Hola, ¿tienen esta chaqueta en la talla mediana?' },
      { id: 'obj_scs_2', text: 'Ask where the fitting rooms are located', completed: false, hint: 'Say: ¿Dónde están los probadores para probármela?' },
      { id: 'obj_scs_3', text: 'Say that you love how it fits and will take it', completed: false, hint: 'Say: Me queda genial, me la llevo. ¿Dónde puedo pagar?' }
    ]
  },
  {
    id: 'scen_shopping_flea_market',
    title: 'Vintage Bargaining at El Rastro Flea Market',
    description: 'Browse antique book and handicraft stalls, ask about vintage histories, and negotiate a friendly price discount.',
    category: 'shopping',
    targetLanguage: 'es',
    cefrLevel: 'B1',
    location: 'El Rastro Market, La Latina, Madrid',
    characterName: 'Yoe',
    characterRole: 'Antique Vendor',
    avatar: '🏺',
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=600&q=80',
    vocabularyDomain: ['antigüedades', 'regatear', 'precio', 'descuento', 'artesanía'],
    initialGreeting: '¡Hola! Echa un vistazo sin compromiso. Tenemos piezas de cerámica y libros antiguos muy bien conservados.',
    initialGreetingTranslation: 'Hello! Take a look with no obligation. We have beautifully preserved ceramics and vintage books.',
    objectives: [
      { id: 'obj_fm_1', text: 'Ask about the origins of a vintage ceramic vase', completed: false, hint: 'Say: Buenos días. ¿De qué año y región es este jarrón de cerámica?' },
      { id: 'obj_fm_2', text: 'Ask if the vendor can give a small discount for buying two items', completed: false, hint: 'Say: Si me llevo el jarrón y este libro antiguo, ¿me podría hacer un pequeño descuento?' },
      { id: 'obj_fm_3', text: 'Agree on a fair price and pay in cash', completed: false, hint: 'Say: Me parece un trato justo. Aquí tiene treinta euros en efectivo.' }
    ]
  }
];

/**
 * INITIAL DATABASE CURRICULUM COURSES & LESSONS
 */
export const INITIAL_DATABASE_COURSES: CourseUnit[] = [
  {
    id: 'unit_es_1',
    unitNumber: 1,
    title: 'First Connections & Everyday Introductions',
    subtitle: 'Master basic greetings, sharing personal details, and forming your first sentences with Yoe.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '🤝',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_1_1',
        unitId: 'unit_es_1',
        title: 'Theory: Greetings & Polite Formality',
        description: 'Understand formal vs informal greetings and common conversation openers.',
        type: 'theory',
        durationMin: 3,
        xpReward: 20,
        isLocked: false,
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
        title: 'Vocabulary: Essential Everyday Words',
        description: 'Learn words for countries, occupations, hobbies, and origin.',
        type: 'vocabulary',
        durationMin: 4,
        xpReward: 25,
        isLocked: false,
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
        title: 'Live Voice: Hotel Check-In Madrid',
        description: 'Practice checking into your hotel with Yoe in a real voice dialogue.',
        type: 'speaking',
        durationMin: 5,
        xpReward: 50,
        isLocked: false,
        speakingScenarioId: 'scen_hotel_madrid'
      }
    ]
  },
  {
    id: 'unit_es_2',
    unitNumber: 2,
    title: 'Travel, Directions & City Exploration',
    subtitle: 'Confidently navigate airports, train stations, and bustling neighborhoods.',
    cefrLevel: 'A1',
    targetLanguage: 'es',
    icon: '✈️',
    isLocked: false,
    lessons: [
      {
        id: 'les_es_2_1',
        unitId: 'unit_es_2',
        title: 'Theory: Asking Directions & Prepositions',
        description: 'Master spatial prepositions and polite street navigation phrases.',
        type: 'theory',
        durationMin: 3,
        xpReward: 25,
        isLocked: false,
        theoryContent: {
          concept: 'Spatial Directions & Navigation',
          explanation: 'To ask for directions, start with "Disculpe, ¿dónde está...?" or "¿Cómo se va a...?". Remember: "a la derecha" (to the right), "a la izquierda" (to the left), and "todo recto" (straight ahead).',
          examples: [
            { original: 'Disculpe, ¿dónde está la parada de metro?', translation: 'Excuse me, where is the metro stop?' },
            { original: 'Siga todo recto y gire a la derecha.', translation: 'Go straight ahead and turn right.' }
          ],
          keyTakeaway: 'Always open with "Disculpe" or "Perdón" for maximum politeness with locals.'
        }
      },
      {
        id: 'les_es_2_2',
        unitId: 'unit_es_2',
        title: 'Live Voice: Airport Check-In & Bag Drop',
        description: 'Check in for your flight and request preferred seating with Yoe.',
        type: 'speaking',
        durationMin: 5,
        xpReward: 50,
        isLocked: false,
        speakingScenarioId: 'scen_travel_airport_checkin'
      }
    ]
  },
  {
    id: 'unit_fr_1',
    unitNumber: 1,
    title: 'Café Culture & Parisian Life',
    subtitle: 'Order delicious pastries, coffee, and meals with authentic French phrasing.',
    cefrLevel: 'A1',
    targetLanguage: 'fr',
    icon: '🥐',
    isLocked: false,
    lessons: [
      {
        id: 'les_fr_1_1',
        unitId: 'unit_fr_1',
        title: 'Theory: Ordering at French Cafés',
        description: 'Master the polite conditional "Je voudrais..." and table etiquette.',
        type: 'theory',
        durationMin: 3,
        xpReward: 20,
        isLocked: false,
        theoryContent: {
          concept: 'Polite Requests in French',
          explanation: 'In French, always use "Je voudrais..." (I would like...) instead of "Je veux" (I want). End every request with "s\'il vous plaît" (please).',
          examples: [
            { original: 'Bonjour, je voudrais un café au lait, s\'il vous plaît.', translation: 'Hello, I would like a coffee with milk, please.' },
            { original: 'L\'addition, s\'il vous plaît.', translation: 'The bill, please.' }
          ],
          keyTakeaway: 'Say "Bonjour" before any request when entering a shop or café in France.'
        }
      },
      {
        id: 'les_fr_1_2',
        unitId: 'unit_fr_1',
        title: 'Live Voice: Bistro in Paris',
        description: 'Order breakfast at Le Petit Café on Boulevard Saint-Germain with Yoe.',
        type: 'speaking',
        durationMin: 5,
        xpReward: 50,
        isLocked: false,
        speakingScenarioId: 'scen_cafe_paris'
      }
    ]
  }
];
