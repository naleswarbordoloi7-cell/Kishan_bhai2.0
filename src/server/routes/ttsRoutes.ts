import express from 'express';
import { ElevenLabsClient } from 'elevenlabs';
import { Readable } from 'stream';

const router = express.Router();

let elevenlabsClient: ElevenLabsClient | null = null;

function getElevenLabs(): ElevenLabsClient | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  if (!elevenlabsClient) {
    elevenlabsClient = new ElevenLabsClient({
      apiKey,
    });
  }
  return elevenlabsClient;
}

// Recommended Multilingual Voices for Regional Accents
const VOICE_MAP: Record<string, string> = {
  hi: '21m00Tcm4TlvDq8ikWAM', // Hindi/Indian accent
  pa: 'EXAVITQu4vr4xnSDxMaL', // Punjabi/South Asian accent
  en: 'pNInz6obpgDQGcFmaJgB', // English (Adam)
  gu: '21m00Tcm4TlvDq8ikWAM', // Gujarati/Indian accent
  default: '21m00Tcm4TlvDq8ikWAM',
};

router.get('/status', async (_req, res) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.json({
      configured: false,
      status: 'missing_key',
      message: 'ELEVENLABS_API_KEY environment variable is not set.',
    });
  }

  const maskedKey = `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
  try {
    // Check permission with a lightweight test request
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
    });
    const data = await response.json().catch(() => null);

    if (response.ok) {
      return res.json({
        configured: true,
        valid: true,
        maskedKey,
        tier: data?.subscription?.tier || 'active',
        characterLimit: data?.subscription?.character_limit,
        characterCount: data?.subscription?.character_count,
      });
    }

    return res.json({
      configured: true,
      valid: false,
      maskedKey,
      status: data?.detail?.status || 'unauthorized',
      code: data?.detail?.code,
      message: data?.detail?.message || 'Authentication or permissions issue with ElevenLabs.',
      fix: 'In the ElevenLabs Dashboard under API Keys, check the key permissions. Ensure Text to Speech (TTS) is enabled.',
    });
  } catch (err: any) {
    return res.status(500).json({
      configured: true,
      valid: false,
      maskedKey,
      error: err.message,
    });
  }
});

router.post('/text-to-speech', async (req, res) => {
  const { text, lang = 'hi' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const client = getElevenLabs();
  if (!client) {
    return res.status(503).json({
      error: 'ElevenLabs API key not configured on server. Export ELEVENLABS_API_KEY in environment variables.',
      fallback: 'Use browser Web Speech API synthesis',
    });
  }

  try {
    const voiceId = VOICE_MAP[lang] || VOICE_MAP.default;

    // Call ElevenLabs API with low-latency streaming
    const audioStream = await client.generate({
      voice: voiceId,
      text: text,
      model_id: 'eleven_multilingual_v2', // Supports 29+ languages seamlessly
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    // Set streaming headers for low latency playing on frontend
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe audio stream directly to Express response
    if (typeof (audioStream as any).pipe === 'function') {
      (audioStream as any).pipe(res);
    } else {
      Readable.from(audioStream as any).pipe(res);
    }
  } catch (error: any) {
    console.error('ElevenLabs TTS Error:', error);
    const isPermissionError = error?.message?.includes('401') || error?.message?.includes('missing_permissions') || error?.status === 401;
    res.status(500).json({
      error: 'Failed to generate speech via ElevenLabs',
      details: error.message,
      suggestion: isPermissionError
        ? 'Your ElevenLabs API key is missing the "text_to_speech" permission. Check permissions in the ElevenLabs API Keys settings or use browser Web Speech fallback.'
        : undefined,
      fallback: 'Use browser Web Speech API synthesis',
    });
  }
});

export default router;
