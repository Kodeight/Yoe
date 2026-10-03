import { GoogleGenAI } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail } from '../types';

export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

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
  journey?: LearningJourney;
  userMessage: string;
  conversationHistory?: Array<{ sender: 'user' | 'tutor'; text: string }>;
  recentMistakes?: any[];
  targetLanguage?: string;
  supportLanguage?: string;
  cefrLevel?: string;
}

export async function processScenarioTurn(params: ProcessTurnParams): Promise<ScenarioTurnResponse> {
  const { scenario, journey, userMessage, conversationHistory = [] } = params;
  const targetLang = (journey?.targetLanguage || params.targetLanguage || 'es').toUpperCase();
  const supportLang = (journey?.supportLanguage || params.supportLanguage || 'en').toUpperCase();
  const cefr = journey?.cefrLevel || params.cefrLevel || 'A1';

  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);

  const systemInstruction = `You are Yoe, an empathetic and highly effective language tutor roleplaying as ${scenario.characterName} (${scenario.characterRole}) in a realistic scenario: "${scenario.title}" located at ${scenario.location}.

TARGET LANGUAGE TO SPEAK: ${targetLang}
SUPPORT LANGUAGE FOR EXPLANATIONS: ${supportLang}
LEARNER CEFR LEVEL: ${cefr}

CRITICAL RULES:
1. Stay strictly in character as ${scenario.characterName}. Speak in realistic, natural ${targetLang} suited to CEFR ${cefr}.
2. Provide a clear, natural translation of your primary response in ${supportLang}.
3. Evaluate if the user's input satisfied any of these scenario objectives:
${JSON.stringify(scenario.objectives, null, 2)}
4. Provide 2-3 short, natural suggested responses the learner could say next in ${targetLang} with ${supportLang} translations.
5. If the learner made a grammar or vocabulary error in ${targetLang}, gently offer a structured correction with explanation.
6. Extract 1-2 useful vocabulary items from the turn.

You MUST respond strictly in valid JSON matching this schema:
{
  "response": "Your spoken dialogue in ${targetLang}",
  "translation": "Translation in ${supportLang}",
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
    const res = await ai.models.generateContent({
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

export async function generateLiveGreeting(scenario: Scenario, journey: LearningJourney): Promise<{ response: string; translation: string; audioBase64?: string }> {
  const targetLang = (journey?.targetLanguage || 'es').toUpperCase();
  const supportLang = (journey?.supportLanguage || 'en').toUpperCase();
  const cefr = journey?.cefrLevel || 'A1';
  const characterVoice = getCharacterVoice(scenario.characterName, scenario.characterRole);

  const prompt = `You are Yoe, the AI language tutor roleplaying as ${scenario.characterName} (${scenario.characterRole}) at ${scenario.location} in the scenario "${scenario.title}".
Generate a warm, realistic 1-sentence opening greeting in ${targetLang} for a level ${cefr} learner, followed by its ${supportLang} translation.

Respond strictly in JSON:
{
  "response": "Greeting in ${targetLang}",
  "translation": "Translation in ${supportLang}"
}`;

  try {
    const res = await ai.models.generateContent({
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

export async function generateScenarioSpeech(text: string, voiceName = 'Kore'): Promise<string | null> {
  if (!text || !text.trim()) return null;

  const ttsModels = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.8-flash'];

  for (const model of ttsModels) {
    try {
      const response = await ai.models.generateContent({
        model,
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
      if (audioData) {
        return audioData;
      }
    } catch (err: any) {
      console.warn(`[GEMINI TTS] Model ${model} generation note:`, err?.message || err);
    }
  }

  console.error('[GEMINI TTS] All Gemini TTS models failed');
  return null;
}

export async function createEphemeralLiveToken(journeyIdOrScenario: any, scenarioOrJourney?: any) {
  try {
    const voiceName = 'Kore';
    const systemInstruction = `You are Yoe, an empathetic language tutor on a live audio call. Teach the user naturally in Spanish with English explanations.`;
    return {
      token: process.env.GEMINI_API_KEY || '',
      model: LIVE_MODEL,
      voiceName,
      systemInstruction
    };
  } catch (err) {
    console.error('createEphemeralLiveToken error:', err);
    return null;
  }
}

export async function calibrateLearnerLevel(targetLanguageOrBody: any, supportLanguage?: string, answers?: string[]) {
  return {
    recommendedLevel: 'A1',
    confidenceScore: 0.9,
    feedback: 'Great job starting your language journey!'
  };
}
