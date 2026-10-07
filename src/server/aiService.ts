import { GoogleGenAI, Modality } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail, Lesson, CourseUnit } from '../types';

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

export const ai = getGeminiClient();

export const textModel = 'gemini-3.8-flash';
export const LIVE_MODEL = 'gemini-3.8-live';

export function getCharacterVoice(characterName: string, role: string): string {
  const norm = ((characterName || '') + ' ' + (role || '')).toLowerCase();
  if (norm.includes('barista') || norm.includes('waiter') || norm.includes('shop') || norm.includes('mateo')) return 'Puck';
  if (norm.includes('receptionist') || norm.includes('agent') || norm.includes('sofia')) return 'Kore';
  if (norm.includes('doctor') || norm.includes('officer') || norm.includes('carlos')) return 'Fenrir';
  if (norm.includes('teacher') || norm.includes('tutor') || norm.includes('yoe')) return 'Zephyr';
  return 'Charon';
}

export interface ScenarioTurnResponse {
  response: string;
  translation: string;
  audioBase64?: string;
  completedObjectiveIds?: string[];
  suggestedNextReplies?: Array<{ phrase: string; translation: string }>;
  correction?: CorrectionDetail;
  learningSignals?: string[];
  vocabulary?: Array<{ word: string; translation: string; phonetic?: string; example?: string }>;
}

export interface ProcessTurnParams {
  scenario: Scenario;
  lesson?: Lesson;
  course?: CourseUnit;
  journey?: LearningJourney;
  learnerProfile?: {
    name?: string;
    learningGoal?: string;
    motivation?: string;
    focusAreas?: string[];
    knownLanguages?: string[];
    supportLanguage?: string;
    previousExperience?: string;
  };
  userMessage: string;
  conversationHistory?: Array<{ sender: 'user' | 'tutor'; text: string }>;
  recentMistakes?: any[];
  targetLanguage?: string;
  supportLanguage?: string;
  cefrLevel?: string;
}

export async function processScenarioTurn(params: ProcessTurnParams): Promise<ScenarioTurnResponse> {
  const { scenario, lesson, course, journey, learnerProfile, userMessage, conversationHistory = [] } = params;
  const targetLang = (journey?.targetLanguage || params.targetLanguage || 'es').toUpperCase();
  const supportLang = (journey?.supportLanguage || params.supportLanguage || 'en').toUpperCase();
  const cefr = journey?.cefrLevel || params.cefrLevel || scenario.cefrLevel || 'A1';

  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);

  const learnerName = learnerProfile?.name || journey?.learnerName || '';
  const learnerMotivation = learnerProfile?.motivation || journey?.motivation || journey?.goals || 'Everyday practical conversation';
  const learnerFocus = learnerProfile?.focusAreas && learnerProfile.focusAreas.length > 0
    ? learnerProfile.focusAreas.join(', ')
    : (learnerProfile?.learningGoal || 'Speaking confidence and natural vocabulary');
  const previousExperience = learnerProfile?.previousExperience || journey?.previousExperience || 'beginner';
  const knownLangs = (learnerProfile?.knownLanguages && learnerProfile.knownLanguages.length > 0)
    ? learnerProfile.knownLanguages.join(', ')
    : (journey?.knownLanguages ? journey.knownLanguages.join(', ') : supportLang);

  // Curriculum Context
  const courseTitle = course?.title || `${targetLang} Curriculum`;
  const lessonTitle = lesson?.title || scenario.relatedLessonTitle || 'Foundational Communication & Practice';
  const lessonDesc = lesson?.description || 'Core vocabulary, grammar patterns, and spoken fluency';
  const lessonObjectives = lesson?.learningObjectives && lesson.learningObjectives.length > 0
    ? lesson.learningObjectives
    : [
        `Use natural ${targetLang} expressions suited to CEFR ${cefr}`,
        'Ask and answer essential situational questions'
      ];
  const grammarFocus = lesson?.grammarFocus && lesson.grammarFocus.length > 0
    ? lesson.grammarFocus
    : (scenario.grammarFocus || ['Conversational phrasing and questions']);
  const lessonVocab = lesson?.vocabularyList && lesson.vocabularyList.length > 0
    ? lesson.vocabularyList.map(v => `${v.word} (${v.translation})`)
    : (scenario.vocabularyDomain || []);

  const systemInstruction = `You are Yoe, an empathetic and highly effective language tutor roleplaying in an integrated educational framework:

==================================================
1. CURRICULUM CONTEXT (WHAT THE LEARNER IS LEARNING)
==================================================
COURSE: ${courseTitle} (CEFR ${cefr})
LESSON: "${lessonTitle}"
LESSON DESCRIPTION: ${lessonDesc}
LESSON OBJECTIVES:
${lessonObjectives.map(o => `- ${o}`).join('\n')}
GRAMMAR FOCUS:
${grammarFocus.map(g => `- ${g}`).join('\n')}
TARGET LESSON VOCABULARY:
${lessonVocab.map(v => `- ${v}`).join('\n')}

==================================================
2. ACTIVE SCENARIO CONTEXT (WHERE & HOW THE LEARNER IS PRACTICING)
==================================================
SCENARIO: "${scenario.title}"
SETTING / LOCATION: ${scenario.location}
YOUR ROLE: ${scenario.characterName} (${scenario.characterRole})
SCENARIO DESCRIPTION: ${scenario.description}
SCENARIO OBJECTIVES:
${scenario.objectives.map(o => `- [${o.id}] ${o.text}`).join('\n')}
SCENARIO VOCABULARY DOMAIN:
${(scenario.vocabularyDomain || []).join(', ')}

==================================================
3. LEARNER CONTEXT & PERSONALIZATION
==================================================
LEARNER NAME: ${learnerName || 'Learner'}
LEARNING PURPOSE / MOTIVATION: ${learnerMotivation} (e.g. Travel, Work, School, Conversation, Just for fun)
PRIMARY IMPROVEMENT FOCUS: ${learnerFocus} (e.g. Speaking, Listening, Vocabulary, Grammar, Everything)
TARGET LANGUAGE TO SPEAK: ${targetLang}
SUPPORT LANGUAGE FOR EXPLANATIONS & TRANSLATIONS: ${supportLang}
KNOWN LANGUAGES: ${knownLangs}
PREVIOUS EXPERIENCE: ${previousExperience}
LEARNER CEFR LEVEL: ${cefr}

* PERSONALIZATION DIRECTIVES:
- Warmly address the learner by name (${learnerName || 'friend'}) when greeting or encouraging them.
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
   If the user asks "What are we learning today?", "What is the topic for today?", "¿Qué estamos aprendiendo hoy?", or any question asking about the session's focus, you MUST synthesize BOTH the lesson and the scenario:
   Explain that we are working on the curriculum lesson ("${lessonTitle}") and practicing it through the real-world situation of "${scenario.title}" at ${scenario.location}!
   Example in English: "Today we're practicing ${lessonTitle} in an airport check-in situation."
   Example in Spanish: "Hoy estamos trabajando en ${lessonTitle}, y lo estamos practicando en la situación de ${scenario.title} en ${scenario.location}."
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

  const prompt = `CONVERSATION HISTORY:\n${conversationHistory.map(h => `${h.sender.toUpperCase()}: ${h.text}`).join('\n')}\nUSER: ${userMessage}`;

  try {
    const client = getGeminiClient();
    const res = await client.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const jsonText = res.text?.trim() || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      parsed = { response: jsonText, translation: '' };
    }

    const responseText = parsed.response || `¡Hola! Entendido.`;
    const audioBase64 = await generateScenarioSpeech(responseText, characterVoice);

    let formattedCorrection: CorrectionDetail | undefined = undefined;
    if (parsed.correction?.original) {
      formattedCorrection = {
        original: parsed.correction.original,
        corrected: parsed.correction.corrected || parsed.correction.original,
        explanation: parsed.correction.explanation || '',
        severity: 'gentle'
      };
    }

    return {
      response: responseText,
      translation: parsed.translation || '',
      audioBase64: audioBase64 || undefined,
      completedObjectiveIds: Array.isArray(parsed.completedObjectiveIds) ? parsed.completedObjectiveIds : [],
      suggestedNextReplies: Array.isArray(parsed.suggestedNextReplies) ? parsed.suggestedNextReplies : [],
      correction: formattedCorrection,
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : []
    };
  } catch (err: any) {
    console.error('processScenarioTurn error:', err);
    throw err;
  }
}

export async function generateLiveGreeting(
  scenario: Scenario,
  journey: LearningJourney,
  lesson?: Lesson,
  course?: CourseUnit,
  learnerProfile?: {
    name?: string;
    learningGoal?: string;
    motivation?: string;
    focusAreas?: string[];
  }
): Promise<{ response: string; translation: string; audioBase64?: string }> {
  const targetLang = (journey?.targetLanguage || 'es').toUpperCase();
  const supportLang = (journey?.supportLanguage || 'en').toUpperCase();
  const cefr = journey?.cefrLevel || scenario.cefrLevel || 'A1';
  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);

  const learnerName = learnerProfile?.name || journey?.learnerName || '';
  const learnerMotivation = learnerProfile?.motivation || journey?.motivation || journey?.goals || '';

  const courseTitle = course?.title || `${targetLang} Curriculum`;
  const lessonTitle = lesson?.title || scenario.relatedLessonTitle || 'Everyday Communication';

  const prompt = `You are Yoe, the AI language tutor roleplaying as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location} in the scenario "${scenario.title}".
The learner ${learnerName ? `is named ${learnerName}` : ''}${learnerMotivation ? ` and is practicing for "${learnerMotivation}"` : ''}.
They are studying the curriculum lesson "${lessonTitle}" (${courseTitle}, Level ${cefr}) and practicing it in this scenario.
Generate a warm, realistic 1-sentence opening greeting in ${targetLang} suited for CEFR ${cefr} that immediately establishes your character role at ${scenario.location}${learnerName ? ` and warmly greets ${learnerName}` : ''}, followed by its ${supportLang} translation.

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
        responseMimeType: 'application/json',
        temperature: 0.8
      }
    });

    const parsed = JSON.parse(res.text || '{}');
    const responseText = parsed.response || scenario.initialGreeting;
    const translationText = parsed.translation || scenario.initialGreetingTranslation || responseText;
    const audioBase64 = await generateScenarioSpeech(responseText, characterVoice);

    return {
      response: responseText,
      translation: translationText,
      audioBase64: audioBase64 || undefined
    };
  } catch (e) {
    return {
      response: scenario.initialGreeting,
      translation: scenario.initialGreetingTranslation || scenario.initialGreeting
    };
  }
}

export function pcmToWav(pcmData: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

export async function generateScenarioSpeech(text: string, voiceName = 'Kore'): Promise<string | null> {
  if (!text || !text.trim()) return null;
  const client = getGeminiClient();

  try {
    const pcmChunks: Buffer[] = [];
    let onDoneCallback: (() => void) | null = null;
    const donePromise = new Promise<void>((resolve) => {
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
          parts: [{ text: 'You are an accurate voice synthesizer for language tutoring. Read the requested text aloud clearly and naturally.' }]
        }
      },
      callbacks: {
        onmessage: (msg) => {
          const parts = msg.serverContent?.modelTurn?.parts || [];
          for (const p of parts) {
            if (p.inlineData?.data) {
              pcmChunks.push(Buffer.from(p.inlineData.data, 'base64'));
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
          role: 'user',
          parts: [{ text: `Say clearly: ${text.trim()}` }]
        }
      ],
      turnComplete: true
    });

    await Promise.race([donePromise, new Promise((r) => setTimeout(r, 4500))]);
    try { session.close(); } catch (e) {}

    const tGenerationDone = Date.now();
    console.log(`[SERVER TTS DIAGNOSTICS] Text: "${text.slice(0, 30)}..." | Connect: ${tConnected - tServer0}ms | Gen: ${tGenerationDone - tConnected}ms | Total: ${tGenerationDone - tServer0}ms | Chunks: ${pcmChunks.length}`);

    if (pcmChunks.length === 0) return null;
    const fullPcm = Buffer.concat(pcmChunks);
    const wav = pcmToWav(fullPcm, 24000);
    return wav.toString('base64');
  } catch (err: any) {
    console.error('[GEMINI TTS] Speech synthesis error:', err?.message || err);
    return null;
  }
}

export async function createEphemeralLiveToken(
  scenario?: Scenario,
  journey?: LearningJourney,
  lesson?: Lesson,
  course?: CourseUnit,
  learnerProfile?: {
    name?: string;
    learningGoal?: string;
    motivation?: string;
    focusAreas?: string[];
  }
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini Live credentials are not configured');
  }

  const targetLang = (journey?.targetLanguage || 'es').toUpperCase();
  const supportLang = (journey?.supportLanguage || 'en').toUpperCase();
  const cefr = journey?.cefrLevel || scenario?.cefrLevel || 'A1';
  const voiceName = scenario ? getCharacterVoice(scenario.characterName, scenario.characterRole) : 'Kore';

  const learnerName = learnerProfile?.name || journey?.learnerName || '';
  const learnerMotivation = learnerProfile?.motivation || journey?.motivation || journey?.goals || 'Practical real-world conversation';
  const learnerFocus = learnerProfile?.focusAreas && learnerProfile.focusAreas.length > 0
    ? learnerProfile.focusAreas.join(', ')
    : (learnerProfile?.learningGoal || 'Speaking confidence and natural vocabulary');

  const courseTitle = course?.title || `${targetLang} Curriculum`;
  const lessonTitle = lesson?.title || scenario?.relatedLessonTitle || 'Everyday Communication & Practice';
  const grammarFocus = lesson?.grammarFocus && lesson.grammarFocus.length > 0
    ? lesson.grammarFocus.join(', ')
    : (scenario?.grammarFocus?.join(', ') || 'Conversational fluency and question structures');

  const systemInstruction = scenario
    ? `You are Yoe, an empathetic and highly effective language tutor roleplaying in an integrated educational framework on a live voice call:

1. CURRICULUM CONTEXT:
   - COURSE: ${courseTitle} (CEFR ${cefr})
   - LESSON: "${lessonTitle}"
   - GRAMMAR FOCUS: ${grammarFocus}

2. ACTIVE SCENARIO CONTEXT:
   - SCENARIO: "${scenario.title}"
   - SETTING / LOCATION: ${scenario.location}
   - YOUR ROLE: ${scenario.characterName} (${scenario.characterRole})
   - OBJECTIVES: ${scenario.objectives.map(o => o.text).join('; ')}

3. LEARNER CONTEXT & PERSONALIZATION:
   - LEARNER NAME: ${learnerName || 'Learner'}
   - LEARNING PURPOSE: ${learnerMotivation}
   - IMPROVEMENT FOCUS: ${learnerFocus}
   - Warmly address the learner by name (${learnerName || 'friend'}), and actively adapt roleplay dialogue and encouragement to support their purpose (${learnerMotivation}) and focus (${learnerFocus}).

4. CRITICAL INSTRUCTIONS:
   - Stay strictly in character as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location}.
   - The scenario is the practical context; the lesson is what the learner is mastering. Weave them together naturally.
   - If asked "What are we learning today?", "What's the topic?", or similar, explain that today we are working on "${lessonTitle}" and practicing it in the real-world situation of "${scenario.title}" at ${scenario.location}. Never state only one without the other.
   - If the user asks a reasonable side question, answer briefly and naturally in character, then smoothly steer back to the active scenario.
   - Speak in natural, realistic ${targetLang} suited to CEFR ${cefr}. Use ${supportLang} when the learner needs explanation or encouragement.`
    : `You are Yoe, an empathetic language tutor on a live audio call. Teach the user naturally in Spanish with English explanations.`;

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
    throw new Error('Gemini authTokens.create returned an empty or invalid response');
  }

  return {
    success: true,
    token: tokenResponse.name,
    model: LIVE_MODEL,
    voiceName,
    systemInstruction
  };
}

export async function calibrateLearnerLevel(targetLanguageOrBody: any, supportLanguage?: string, answers?: string[]) {
  return {
    recommendedLevel: 'A1',
    confidenceScore: 0.9,
    feedback: 'Great job starting your language journey!'
  };
}
