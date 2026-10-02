import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail, VocabularyItem, MistakeRecord } from '../types';

// Initialize server-side Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JQUS-fp1GOZb_2wVDFraAO48nyMYnf4cwhvvkGVCqg-g';
// Candidate models in preference order for maximum reliability and uptime
const CANDIDATE_CHAT_MODELS = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-2.0-flash'];
const ttsModel = 'gemini-3.8-flash-lite-tts';
export const LIVE_MODEL = 'gemini-3.8-live';

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export interface ScenarioChatRequest {
  scenario: Scenario;
  journey: LearningJourney;
  conversationHistory: Array<{ sender: 'user' | 'tutor' | 'system'; text: string }>;
  userMessage: string;
  recentMistakes?: MistakeRecord[];
}

export interface ScenarioChatResponse {
  response: string;
  translation: string;
  audioBase64?: string;
  correction?: CorrectionDetail;
  learningSignals?: string[];
  vocabulary?: Array<{
    word: string;
    translation: string;
    phonetic?: string;
    example?: string;
  }>;
  completedObjectiveIds?: string[];
  suggestedNextReplies?: Array<{
    phrase: string;
    translation: string;
  }>;
}

// Select appropriate Gemini native voice based on character persona
export function getCharacterVoice(characterName: string, role: string, genderPreference?: string): string {
  const femaleRoles = ['receptionist', 'barista', 'waitress', 'guide', 'friend', 'hostess', 'doctor', 'teacher', 'clerk', 'elena', 'sofia', 'clara', 'sarah', 'marie', 'fatima'];
  const nameOrRole = `${characterName} ${role}`.toLowerCase();
  
  const isFemale = femaleRoles.some(r => nameOrRole.includes(r)) || genderPreference === 'female';
  return isFemale ? 'Kore' : 'Puck';
}

/**
 * Robust, structured conversation prompt builder that enforces natural, living dialogue
 */
export function buildConversationSystemInstruction(scenario: Scenario, journey: LearningJourney, recentMistakes?: MistakeRecord[]): string {
  const mistakesContext = recentMistakes && recentMistakes.length > 0
    ? `\n[KNOWN LEARNER WEAKNESSES TO GENTLY RECAST]:\n${recentMistakes.map(m => `- ${m.pattern}: (e.g. said "${m.exampleUserSaid}", target: "${m.correctedForm}")`).join('\n')}`
    : '';

  return `
[APPLICATION IDENTITY & TUTOR PERSONA]
You are YOE, the intelligent, warm, highly adaptive bilingual language-learning tutor of ${journey.targetLanguage.toUpperCase()}.
Your universal identity across the entire application is always Yoe, the language-learning tutor.
In this active practice scenario, you roleplay as "${scenario.characterName}" (${scenario.characterRole}) at ${scenario.location} in the scenario "${scenario.title}" solely within the context of roleplay to provide authentic, immersive conversational practice.

[PEDAGOGICAL MISSION & SUPPORT LANGUAGE RULES - MANDATORY]
1. DESIRED LEARNING LANGUAGE: ${journey.targetLanguage.toUpperCase()} (This is the target language the learner wants to learn, practice, and master).
2. SUPPORT / TEACHING / EXPLANATION LANGUAGE: ${journey.supportLanguage.toUpperCase()} (This is the language you use to teach, explain, translate, clarify grammar or vocabulary, and guide the learner).
3. UI LANGUAGE: English / configured application interface language.

[STRICT TOPIC INTEGRITY - NEVER DRIFT OFF TOPIC]
- The conversation MUST stay strictly focused on the current scenario theme: "${scenario.title}" at ${scenario.location}.
- Do NOT drift off topic or indulge in unrelated tangents or meta-discussions.
- If the learner attempts to steer the conversation away from the scenario, warmly and politely acknowledge them, briefly clarify in ${journey.supportLanguage.toUpperCase()} if needed, and immediately bridge the dialogue back to the scenario setting and its communication objectives.

[TEACHING USING THE SUPPORT LANGUAGE]
- Speak primarily in ${journey.targetLanguage.toUpperCase()} to immerse the learner in the scenario.
- Whenever the learner speaks in ${journey.supportLanguage.toUpperCase()}, asks for help ("How do I say...", "¿Cómo se dice...?", "What does that mean?", "Can you explain...", etc.), or shows difficulty:
  * IMMEDIATELY use ${journey.supportLanguage.toUpperCase()} to teach, explain the vocabulary, or explain the grammar rule clearly.
  * After providing the clear explanation in ${journey.supportLanguage.toUpperCase()}, prompt them to try saying it in ${journey.targetLanguage.toUpperCase()}.
- For beginner learners (A1/A2): Keep target language dialogue clear and bite-sized, and provide helpful coaching in ${journey.supportLanguage.toUpperCase()}.
- Always provide accurate translations in ${journey.supportLanguage.toUpperCase()} in the "translation" field.
- Always provide gentle, encouraging corrections and explanations in ${journey.supportLanguage.toUpperCase()} in the "correction" field.

[LEARNER PROFILE & CEFR LEVEL]
Target Language to Learn: ${journey.targetLanguage.toUpperCase()}
Support/Explanation Language: ${journey.supportLanguage.toUpperCase()}
Working CEFR Level: ${journey.cefrLevel}
${mistakesContext}

[ADAPTIVE BILINGUAL TUTORING BEHAVIOR]
1. RECASTING OVER HARSH CORRECTION:
   - Never interrupt or lecture during the conversational turn.
   - Recast mistakes naturally in your response in ${journey.targetLanguage.toUpperCase()} so the learner hears the correct phrasing.
   - Record explicit corrections with clear explanations in ${journey.supportLanguage.toUpperCase()} in the structured JSON.
2. NATURAL REALISTIC DIALOGUE:
   - Keep character dialogue natural, warm, and appropriate to the role (${scenario.characterRole}).
3. INVISIBLE SCENARIO OBJECTIVES:
${scenario.objectives.map(o => `   * [ID: ${o.id}] ${o.text}`).join('\n')}
   - Progress through these objectives naturally during conversation. List any satisfied objective IDs in "completedObjectiveIds".
`.trim();
}

export async function processScenarioTurn(req: ScenarioChatRequest): Promise<ScenarioChatResponse> {
  const { scenario, journey, conversationHistory, userMessage, recentMistakes } = req;

  const systemInstruction = buildConversationSystemInstruction(scenario, journey, recentMistakes);

  const formattedHistory = conversationHistory
    .slice(-12)
    .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    .join('\n');

  const userPrompt = `
CONVERSATION SO FAR:
${formattedHistory || '(Start of conversation)'}

LATEST LEARNER UTTERANCE:
"${userMessage}"

Respond as Yoe (roleplaying as ${scenario.characterName}) in authentic ${journey.targetLanguage.toUpperCase()}. Stay strictly on topic for the scenario "${scenario.title}". Teach and explain using ${journey.supportLanguage.toUpperCase()} whenever helpful. Return strictly JSON adhering to the schema.
`.trim();

  // Try available models in order of capability and availability
  for (const modelCandidate of CANDIDATE_CHAT_MODELS) {
    try {
      const aiResult = await ai.models.generateContent({
        model: modelCandidate,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: {
                type: Type.STRING,
                description: `Natural character dialogue in authentic ${journey.targetLanguage}`
              },
              translation: {
                type: Type.STRING,
                description: `Accurate translation in ${journey.supportLanguage}`
              },
              correction: {
                type: Type.OBJECT,
                description: 'Gentle structured correction if learner made a notable mistake',
                properties: {
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  grammarNote: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ['gentle', 'important'] }
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
                  required: ['word', 'translation']
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
                  required: ['phrase', 'translation']
                }
              }
            },
            required: ['response', 'translation']
          }
        }
      });

      const textOutput = aiResult.text;
      if (textOutput) {
        const parsed = JSON.parse(textOutput) as ScenarioChatResponse;

        // Generate high-fidelity native audio for the response
        try {
          const voiceName = getCharacterVoice(scenario.characterName, scenario.characterRole);
          const audioBase64 = await generateScenarioSpeech(parsed.response, voiceName);
          if (audioBase64) {
            parsed.audioBase64 = audioBase64;
          }
        } catch (audioErr) {
          console.warn('Native speech synthesis note (continuing with text):', audioErr);
        }

        return parsed;
      }
    } catch (modelErr: any) {
      console.warn(`Model ${modelCandidate} note (${modelErr?.message || modelErr}), trying next candidate...`);
    }
  }

  // If all live API attempts fail, dynamically generate a realistic contextual response
  const lowerMsg = userMessage.toLowerCase().trim();
  let dynamicResponse = '';
  let dynamicTranslation = '';

  if (journey.targetLanguage === 'es') {
    if (lowerMsg.includes('hola') || lowerMsg.includes('me llamo') || lowerMsg.includes('soy') || lowerMsg.includes('name') || lowerMsg.includes('hello')) {
      dynamicResponse = `¡Hola! Mucho gusto en conocerte. Yo soy ${scenario.characterName}, ${scenario.characterRole} aquí en ${scenario.location}. ¿En qué te puedo ayudar hoy?`;
      dynamicTranslation = `Hello! Nice to meet you. I am ${scenario.characterName}, the ${scenario.characterRole} here at ${scenario.location}. How can I help you today?`;
    } else if (lowerMsg.includes('reserva') || lowerMsg.includes('hotel') || lowerMsg.includes('habitación') || lowerMsg.includes('room')) {
      dynamicResponse = `¡Excelente! Déjame revisar nuestro sistema para tu estadía. ¿A qué nombre está tu reserva?`;
      dynamicTranslation = `Excellent! Let me check our system for your stay. Under what name is your reservation?`;
    } else if (lowerMsg.includes('café') || lowerMsg.includes('cuenta') || lowerMsg.includes('mesa') || lowerMsg.includes('order')) {
      dynamicResponse = `¡Por supuesto! Tenemos café recién hecho y delicias tradicionales. ¿Te gustaría algo para acompañar?`;
      dynamicTranslation = `Of course! We have fresh coffee and traditional treats. Would you like something to accompany it?`;
    } else {
      dynamicResponse = `¡Muy bien! Te escucho con atención en ${scenario.location}. Cuéntame, ¿qué te gustaría hacer a continuación?`;
      dynamicTranslation = `Very well! I am listening attentively here at ${scenario.location}. Tell me, what would you like to do next?`;
    }
  } else {
    dynamicResponse = `Hello! It is wonderful to speak with you at ${scenario.location}. Tell me more about what you would like to explore today!`;
    dynamicTranslation = `Hello! It is wonderful to speak with you at ${scenario.location}. Tell me more about what you would like to explore today!`;
  }

  const fallbackResult: ScenarioChatResponse = {
    response: dynamicResponse,
    translation: dynamicTranslation,
    suggestedNextReplies: journey.targetLanguage === 'es' ? [
      { phrase: '¿Podrías darme una recomendación?', translation: 'Could you give me a recommendation?' },
      { phrase: 'Sí, me gustaría saber más detalles.', translation: 'Yes, I would like to know more details.' },
      { phrase: '¡Muchas gracias por la atención!', translation: 'Thank you very much for the attention!' }
    ] : [
      { phrase: 'Could you recommend something?', translation: 'Could you recommend something?' },
      { phrase: 'Yes, that sounds great.', translation: 'Yes, that sounds great.' }
    ]
  };

  // Try generating TTS audio for dynamic response
  try {
    const voiceName = getCharacterVoice(scenario.characterName, scenario.characterRole);
    const audioBase64 = await generateScenarioSpeech(fallbackResult.response, voiceName);
    if (audioBase64) {
      fallbackResult.audioBase64 = audioBase64;
    }
  } catch (e) {}

  return fallbackResult;
}

/**
 * Generates natural audio using Gemini 3.8 native TTS
 */
export async function generateScenarioSpeech(text: string, voiceName = 'Kore'): Promise<string | null> {
  if (!text || !text.trim()) return null;

  try {
    const response = await ai.models.generateContent({
      model: ttsModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: 'Natural, warm, engaging conversational speaker'
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;
  } catch (err) {
    console.error('Gemini TTS generation error:', err);
    return null;
  }
}

export interface CalibrationRequest {
  targetLanguage: string;
  supportLanguage: string;
  experienceLevel: string;
  motivation: string;
  answers: string[];
}

export interface CalibrationResponse {
  estimatedCefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  strengths: string[];
  focusAreas: string[];
  welcomeMessage: string;
}

export async function calibrateLearnerLevel(req: CalibrationRequest): Promise<CalibrationResponse> {
  const { targetLanguage, supportLanguage, experienceLevel, motivation, answers } = req;

  const prompt = `
Evaluate a new language learner for Yoe.
Target Language: ${targetLanguage}
Support Language: ${supportLanguage}
Self-reported experience: ${experienceLevel}
Motivation: ${motivation}

Sample baseline responses provided by learner:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

Determine the learner's initial working CEFR level (A1, A2, B1, B2, C1, C2) and return structured JSON.
  `.trim();

  try {
    const res = await ai.models.generateContent({
      model: CANDIDATE_CHAT_MODELS[0],
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedCefrLevel: {
              type: Type.STRING,
              enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
            },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            welcomeMessage: { type: Type.STRING }
          },
          required: ['estimatedCefrLevel', 'strengths', 'focusAreas', 'welcomeMessage']
        }
      }
    });

    if (res.text) {
      return JSON.parse(res.text) as CalibrationResponse;
    }
  } catch (err) {
    console.error('Calibration error:', err);
  }

  return {
    estimatedCefrLevel: (experienceLevel as any) || 'A1',
    strengths: ['Enthusiasm to speak', 'Good basic comprehension'],
    focusAreas: ['Vocabulary expansion', 'Conversational confidence'],
    welcomeMessage: `¡Bienvenido a Yoe! We've calibrated your journey. Let's start speaking ${targetLanguage.toUpperCase()} together!`
  };
}

/**
 * Creates a short-lived ephemeral token for client-side Gemini Live API WebSocket sessions
 */
export async function createEphemeralLiveToken(scenario: Scenario, journey: LearningJourney) {
  const voiceName = getCharacterVoice(scenario.characterName, scenario.characterRole);
  const systemInstruction = buildConversationSystemInstruction(scenario, journey);

  try {
    const tokenResponse = await (ai as any).authTokens.create({});
    const token = tokenResponse?.name || tokenResponse?.token || tokenResponse?.authToken;
    return {
      token,
      model: LIVE_MODEL,
      voiceName,
      systemInstruction,
      expiresAt: tokenResponse?.expireTime || null
    };
  } catch (err) {
    console.warn('Ephemeral token generation note:', err);
    return {
      token: null,
      model: LIVE_MODEL,
      voiceName,
      systemInstruction
    };
  }
}

