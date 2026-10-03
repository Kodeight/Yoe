import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail, VocabularyItem, MistakeRecord } from '../types/index.ts';

// Initialize server-side Gemini AI client (inherits GEMINI_API_KEY from environment)
const ai = new GoogleGenAI({});

// Supported Gemini Models in preference order
const CANDIDATE_CHAT_MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
const ttsModel = 'gemini-3.8-flash-lite-tts';
export const LIVE_MODEL = 'gemini-3.8-live';

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
  const femaleRoles = ['receptionist', 'barista', 'waitress', 'guide', 'friend', 'hostess', 'doctor', 'teacher', 'clerk', 'elena', 'sofia', 'clara', 'sarah', 'marie', 'fatima', 'maya'];
  const nameOrRole = `${characterName} ${role}`.toLowerCase();
  
  const isFemale = femaleRoles.some(r => nameOrRole.includes(r)) || genderPreference === 'female';
  return isFemale ? 'Kore' : 'Puck';
}

/**
 * Structured conversation system instruction builder
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

[PEDAGOGICAL MISSION & MANDATORY LANGUAGE RULES]
1. DESIRED LEARNING LANGUAGE: ${journey.targetLanguage.toUpperCase()} (This is the target language the learner wants to learn, practice, and master).
2. SUPPORT / TEACHING / EXPLANATION LANGUAGE: ${journey.supportLanguage.toUpperCase()} (This is the language you use to teach, explain, translate, clarify grammar or vocabulary, and guide the learner).
3. CEFR Level: ${journey.cefrLevel || 'A1'}

[CONVERSATION RULES - STRICT ADHERENCE]
- Directly and contextually respond to the learner's actual utterance.
- If the learner asks your name, introduce yourself as ${scenario.characterName}.
- If the learner asks if you speak English or asks for clarification, respond helpfully in ${journey.targetLanguage.toUpperCase()} and provide the explanation.
- If the learner states what they need (e.g., booking a room, ordering food, checking in), advance the scenario dialogue naturally.
- Keep character dialogue natural, concise, and appropriate for ${journey.cefrLevel || 'A1'} level in ${journey.targetLanguage.toUpperCase()}.
- ALWAYS provide an accurate, natural translation of your response in ${journey.supportLanguage.toUpperCase()} in the "translation" field.
- If the learner makes an obvious grammatical or vocabulary mistake, provide a gentle note in the "correction" field.
- Provide 2-3 relevant suggested responses in "suggestedNextReplies" with translations in ${journey.supportLanguage.toUpperCase()}.
- PROGRESS OBJECTIVES: Check if the learner satisfied any of the scenario objectives:
${scenario.objectives.map(o => `  * [ID: ${o.id}] ${o.text}`).join('\n')}
  List satisfied IDs in "completedObjectiveIds".
${mistakesContext}
`.trim();
}

/**
 * Execute real turn against Gemini API with multi-model resilience
 */
export async function processScenarioTurn(req: ScenarioChatRequest): Promise<ScenarioChatResponse> {
  const { scenario, journey, conversationHistory, userMessage, recentMistakes } = req;

  const systemInstruction = buildConversationSystemInstruction(scenario, journey, recentMistakes);

  const formattedHistory = conversationHistory
    .slice(-10)
    .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
    .join('\n');

  const userPrompt = `
CONVERSATION SO FAR:
${formattedHistory || '(Start of conversation)'}

LATEST LEARNER UTTERANCE:
"${userMessage}"

Respond as Yoe (roleplaying as ${scenario.characterName}) in authentic ${journey.targetLanguage.toUpperCase()} for scenario "${scenario.title}" at ${scenario.location}. Respond directly to what the learner said. Return strictly JSON.
`.trim();

  let lastError: any = null;

  // Try available models in order of speed and capability
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
          console.warn('Native speech synthesis note (continuing with text response):', audioErr);
        }

        return parsed;
      }
    } catch (modelErr: any) {
      lastError = modelErr;
      console.warn(`Model ${modelCandidate} error (${modelErr?.message || modelErr}), trying next candidate...`);
    }
  }

  // If all models fail, throw the real error to be properly handled by caller
  throw new Error(`Gemini API connection error: ${lastError?.message || 'Service unavailable'}`);
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

  for (const model of CANDIDATE_CHAT_MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
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
      console.warn(`Calibration model ${model} error, trying next...`, err);
    }
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


