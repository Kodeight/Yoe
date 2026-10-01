import { GoogleGenAI, Type } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail, VocabularyItem, MistakeRecord } from '../types';

// Initialize server-side Gemini AI client
const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6JQUS-fp1GOZb_2wVDFraAO48nyMYnf4cwhvvkGVCqg-g';
const defaultModel = process.env.GEMINI_MODEL || 'gemini-flash-latest';

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

export async function processScenarioTurn(req: ScenarioChatRequest): Promise<ScenarioChatResponse> {
  const { scenario, journey, conversationHistory, userMessage, recentMistakes } = req;

  const systemInstruction = `
You are "Yoe", an empathetic, highly skilled AI language tutor playing a specific character in an interactive learning scenario.
Your character: "${scenario.characterName}" (${scenario.characterRole}).
Scenario setting: "${scenario.title}" in ${scenario.location}.

TARGET LANGUAGE: ${journey.targetLanguage.toUpperCase()}
SUPPORT / EXPLANATION LANGUAGE: ${journey.supportLanguage.toUpperCase()}
LEARNER'S ESTIMATED CEFR LEVEL: ${journey.cefrLevel}

CRITICAL PEDAGOGICAL RULES:
1. Maintain character role immersion naturally in ${journey.targetLanguage.toUpperCase()}. Do not break character in your main response.
2. Adjust sentence structure, speed, and vocabulary strictly to level ${journey.cefrLevel}.
3. CORRECTION PHILOSOPHY: Flow-preserving and gentle!
   - DO NOT interrupt the scenario or give a huge lecture.
   - If the user made a grammar, vocabulary, or agreement mistake, provide a structured correction in the JSON output, explaining clearly in ${journey.supportLanguage.toUpperCase()}.
   - If the user made no significant mistake, set correction to null.
4. Active Scenario Objectives:
   ${scenario.objectives.map(o => `- [ID: ${o.id}] ${o.text}`).join('\n')}
   If the user's message successfully fulfills any objective, include its ID in "completedObjectiveIds".
5. Provide 3 helpful "suggestedNextReplies" in ${journey.targetLanguage.toUpperCase()} with translations in ${journey.supportLanguage.toUpperCase()} so the user can keep communicating if stuck.
6. Extract key vocabulary words practiced in this turn in "vocabulary".
7. Explanations and translations MUST be in ${journey.supportLanguage.toUpperCase()}.
  `.trim();

  const formattedHistory = conversationHistory.slice(-10).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');
  const mistakesContext = recentMistakes && recentMistakes.length > 0
    ? `\nLEARNER'S RECENT KNOWN WEAKNESSES:\n${recentMistakes.map(m => `- ${m.pattern}: "${m.exampleUserSaid}" -> "${m.correctedForm}"`).join('\n')}`
    : '';

  const prompt = `
Scenario: ${scenario.title} (${scenario.description})
${mistakesContext}

CONVERSATION HISTORY:
${formattedHistory}

LATEST USER INPUT:
"${userMessage}"

Respond as character "${scenario.characterName}" in ${journey.targetLanguage.toUpperCase()}, evaluate the user's message, and return JSON matching the specified schema.
  `.trim();

  try {
    const aiResult = await ai.models.generateContent({
      model: defaultModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: {
              type: Type.STRING,
              description: `Character response in target language (${journey.targetLanguage})`
            },
            translation: {
              type: Type.STRING,
              description: `Translation in support language (${journey.supportLanguage})`
            },
            correction: {
              type: Type.OBJECT,
              description: 'Gentle correction if the user made an error',
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
    return parsed;
  } catch (error) {
    console.error('Error processing AI scenario turn:', error);
    // Fallback response if API call fails or key isn't active
    return {
      response: `I understood you! Let's continue practicing in ${journey.targetLanguage.toUpperCase()}.`,
      translation: 'I understood you! Let\'s continue practicing.',
      suggestedNextReplies: [
        { phrase: 'Could you please repeat that?', translation: 'Could you please repeat that?' },
        { phrase: 'Yes, that sounds great.', translation: 'Yes, that sounds great.' },
        { phrase: 'Thank you very much!', translation: 'Thank you very much!' }
      ]
    };
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
    strengths: ['Enthusiasm to learn', 'Good basic comprehension'],
    focusAreas: ['Vocabulary expansion', 'Conversational confidence'],
    welcomeMessage: `Welcome to Yoe! We've calibrated your journey. Let's start speaking ${targetLanguage.toUpperCase()} together!`
  };
}
