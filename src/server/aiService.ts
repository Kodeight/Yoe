import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail, VocabularyItem, MistakeRecord } from '../types';

// Initialize server-side Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JQUS-fp1GOZb_2wVDFraAO48nyMYnf4cwhvvkGVCqg-g';
const defaultModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const ttsModel = 'gemini-3.8-flash-lite-tts';

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

export const LIVE_MODEL = 'gemini-3.8-live';

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
[ROLE & CONVERSATIONAL ENGINE IDENTITY]
You are "${scenario.characterName}", a real human character in this living scenario.
You are NOT a textbook, NOT a language exercise generator, NOT a robotic translator, and NOT an AI assistant.
You are having a REAL, NATURAL, LIVE CONVERSATION with the learner in ${journey.targetLanguage.toUpperCase()}.

[SCENARIO ENVIRONMENT]
Title: "${scenario.title}"
Location: ${scenario.location}
Description: ${scenario.description}
Your Role: ${scenario.characterRole}
Your Initial Context: ${scenario.initialGreeting}

[LEARNER PROFILE]
Target Language: ${journey.targetLanguage.toUpperCase()}
Support/Explanation Language: ${journey.supportLanguage.toUpperCase()}
Estimated CEFR Working Level: ${journey.cefrLevel}
${mistakesContext}

[CORE CONVERSATION RULES - CRITICAL]
1. RESPOND TO WHAT THE LEARNER ACTUALLY SAID:
   - Listen attentively to their actual meaning, intent, and tone.
   - If they ask an unexpected question, answer naturally in character.
   - If they make a joke, react naturally.
   - If they change their mind or correct themselves (e.g., "Wait, I meant 2 nights"), immediately acknowledge and adapt.
2. ADAPTIVE NATURAL LENGTH:
   - Do NOT produce fixed-length paragraph speeches.
   - Speak like a real human: sometimes a short reaction ("¡Ah, perfecto!", "Claro, ¿para cuántas noches?"), sometimes a quick question, sometimes a brief explanation.
   - Keep the rhythm conversational and lively.
3. LANGUAGE LOCK - TARGET LANGUAGE IMMERSION:
   - Speak ONLY in natural, authentic ${journey.targetLanguage.toUpperCase()} in your character dialogue ("response").
   - NEVER randomly speak English or support language in the character dialogue.
   - The translation field is exclusively for the learner's comprehension aid.
4. NATURAL SPEECH, NO TEXTBOOK SLOP:
   - For Spanish: Use natural phrasing (e.g., "Buenas, ¿tienes reserva?" or "¡Hola! Dime, ¿qué te pongo?"), NOT stiff translationese.
   - Match the tone to your character's role and location.
5. FLOW-PRESERVING MICRO-CORRECTIONS:
   - DO NOT break character to give grammar lectures during the live dialogue.
   - Use conversational recasting naturally in dialogue (e.g. User says "Yo querer habitación", you respond: "Claro, una habitación para usted. ¿Cuántas noches?").
   - Record any notable grammatical/lexical error in the "correction" JSON field for post-session learning, with clear explanation in ${journey.supportLanguage.toUpperCase()}.
6. INVISIBLE SCENARIO OBJECTIVES:
   - The scenario has goals, but do NOT announce them like test questions.
   - Scenario Objectives:
${scenario.objectives.map(o => `     * [ID: ${o.id}] ${o.text}`).join('\n')}
   - When the learner naturally covers an objective in conversation, include its ID in "completedObjectiveIds".
7. MEDICAL & LEGAL SAFETY:
   - You are exclusively a language practice companion and scenario character. You never give actual medical, clinical, or legal advice. If a health issue is mentioned, acknowledge briefly in character and advise seeing a local professional.
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

Respond naturally as ${scenario.characterName} in authentic ${journey.targetLanguage.toUpperCase()}. Return strictly JSON adhering to the schema.
`.trim();

  try {
    const aiResult = await ai.models.generateContent({
      model: defaultModel,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.75,
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
    if (!textOutput) {
      throw new Error('Empty response received from AI model');
    }

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
  } catch (error) {
    console.error('Error processing AI scenario turn:', error);
    return {
      response: `¡Entendido! Sigamos con nuestra conversación.`,
      translation: 'Understood! Let\'s continue our conversation.',
      suggestedNextReplies: [
        { phrase: '¿Podrías repetir eso, por favor?', translation: 'Could you repeat that, please?' },
        { phrase: 'Sí, me parece perfecto.', translation: 'Yes, that sounds perfect.' },
        { phrase: '¡Muchas gracias por la ayuda!', translation: 'Thank you very much for the help!' }
      ]
    };
  }
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
      model: defaultModel,
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

