import { GoogleGenAI, Modality } from '@google/genai';
import { Scenario, LearningJourney, CorrectionDetail } from '../types';

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
        }
      }
    });

    session.sendClientContent({
      turns: [
        {
          role: 'user',
          parts: [{ text: `Say clearly: ${text.trim()}` }]
        }
      ],
      turnComplete: true
    });

    await new Promise((r) => setTimeout(r, 2200));
    try { session.close(); } catch (e) {}

    if (pcmChunks.length === 0) return null;
    const fullPcm = Buffer.concat(pcmChunks);
    const wav = pcmToWav(fullPcm, 24000);
    return wav.toString('base64');
  } catch (err: any) {
    console.error('[GEMINI TTS] Speech synthesis error:', err?.message || err);
    return null;
  }
}

export async function createEphemeralLiveToken(scenario?: Scenario, journey?: LearningJourney) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini Live credentials are not configured');
  }

  const targetLang = (journey?.targetLanguage || 'es').toUpperCase();
  const supportLang = (journey?.supportLanguage || 'en').toUpperCase();
  const cefr = journey?.cefrLevel || 'A1';
  const voiceName = scenario ? getCharacterVoice(scenario.characterName, scenario.characterRole) : 'Kore';

  const systemInstruction = scenario
    ? `You are Yoe, an empathetic language tutor roleplaying in a realistic scenario on a live voice call. Speak in ${targetLang} suitable for CEFR ${cefr}, and teach using ${supportLang} when explanation is needed.`
    : `You are Yoe, an empathetic language tutor on a live audio call. Teach the user naturally in Spanish with English explanations.`;

  const client = getGeminiClient();
  const tokenResponse = await client.authTokens.create({
    config: {
      uses: 1,
      liveConnectConstraints: {
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
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
