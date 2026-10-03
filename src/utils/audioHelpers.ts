/**
 * Audio Decoding & Formatting Utilities
 * Handles both standard RIFF WAV and raw 16-bit linear PCM from Gemini Live.
 */

export function base64ToUint8Array(base64Str: string): Uint8Array {
  const cleanBase64 = base64Str.includes('base64,') ? base64Str.split('base64,')[1] : base64Str;
  const binary = atob(cleanBase64.trim());
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isWavFormat(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const wave = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  return riff === 'RIFF' && wave === 'WAVE';
}

export async function decodeAudioPayload(
  ctx: AudioContext,
  base64Audio: string,
  sampleRate = 24000
): Promise<AudioBuffer> {
  const bytes = base64ToUint8Array(base64Audio);

  // If already WAV format, use native Web Audio decoder
  if (isWavFormat(bytes)) {
    try {
      const bufferCopy = new Uint8Array(bytes).buffer;
      return await ctx.decodeAudioData(bufferCopy);
    } catch (e) {
      console.warn('[AUDIO] Native decodeAudioData failed on WAV, attempting raw PCM fallback:', e);
    }
  }

  // Raw 16-bit PCM little-endian fallback
  const pcmBytes = new Uint8Array(bytes);
  const int16 = new Int16Array(pcmBytes.buffer, 0, Math.floor(pcmBytes.byteLength / 2));
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }

  const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32);
  return audioBuffer;
}
