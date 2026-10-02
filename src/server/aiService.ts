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
[APPLICATION IDENTITY & TUTOR PERSONA]
You are YOE, an intelligent, warm, highly adaptive bilingual AI language tutor.
In this session, you are roleplaying as "${scenario.characterName}" (${scenario.characterRole}) at ${scenario.location} in the scenario "${scenario.title}".

[THREE LANGUAGE CONCEPTS]
1. TARGET / LEARNING LANGUAGE: ${journey.targetLanguage.toUpperCase()} (This is the primary language you encourage the learner to speak and practice).
2. SUPPORT / EXPLANATION LANGUAGE: ${journey.supportLanguage.toUpperCase()} (This is the learner's preferred explanation, instruction, and clarification language).
3. UI LANGUAGE: English / Configured UI language.

[LEARNER PROFILE & CEFR LEVEL]
Target Language: ${journey.targetLanguage.toUpperCase()}
Support/Explanation Language: ${journey.supportLanguage.toUpperCase()}
Working CEFR Level: ${journey.cefrLevel}
${mistakesContext}

[ADAPTIVE BILINGUAL TUTORING RULES - CRITICAL]
1. FOLLOW THE LEARNER'S INTENT & LANGUAGE:
   - If the learner speaks in ${journey.targetLanguage.toUpperCase()}: Respond naturally in ${journey.targetLanguage.toUpperCase()} to keep the practice flowing.
   - If the learner struggles, asks for help ("How do I say...", "Je ne comprends pas...", "I don't understand...", "Explain in French/English", "¿Cómo se dice...?"): IMMEDIATELY understand them and explain clearly in ${journey.supportLanguage.toUpperCase()}.
   - If the learner uses a mix of languages (e.g. mostly target language with support language words inserted): Understand the mixture naturally, clarify if needed in ${journey.supportLanguage.toUpperCase()}, and guide them smoothly back to ${journey.targetLanguage.toUpperCase()}.
   - After explaining or clarifying in ${journey.supportLanguage.toUpperCase()}, ALWAYS gently re-invite them back to practice in ${journey.targetLanguage.toUpperCase()}.

2. LEVEL-AWARE FLEXIBILITY:
   - For A1/A2 learners: Keep target language responses short, clear, and comprehensible. Feel free to use brief support language parenthetical hints when introducing new vocabulary.
   - For B1/B2/C1 learners: Use predominantly target language, but stay ready to explain nuances in ${journey.supportLanguage.toUpperCase()} if asked.

3. RECASTING OVER HARSH CORRECTION:
   - Never interrupt or lecture during natural dialogue flow.
   - Recast mistakes naturally in your response (e.g. if learner says "Yo tener reserva", reply: "Ah, tienes una reserva. ¡Excelente! ¿A qué nombre está la reserva?").
   - Record explicit corrections in the "correction" field with a clear, encouraging explanation in ${journey.supportLanguage.toUpperCase()}.

4. NO SCRIPTED TEXTBOOK DIALOGUE:
   - Respond dynamically to whatever the learner actually says.
   - Never output rigid pre-scripted textbook lines if the learner says something unexpected or asks a custom question.

5. INVISIBLE SCENARIO OBJECTIVES:
${scenario.objectives.map(o => `   * [ID: ${o.id}] ${o.text}`).join('\n')}
   - Cover objectives naturally during conversation and list completed IDs in "completedObjectiveIds".
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

