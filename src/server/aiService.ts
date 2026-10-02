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

