import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { app } from './src/server/app';
import { ai, LIVE_MODEL } from './src/server/aiService';
import { LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

async function start() {
  const isProd = process.env.NODE_ENV === 'production';
  const PORT = process.env.PORT || 3000;

  const server = http.createServer(app);

  // Setup Server-Side Gemini Live WebSocket Bridge
  const wss = new WebSocketServer({ server, path: '/api/ai/live/socket' });

  wss.on('connection', async (clientWs: WebSocket, req: http.IncomingMessage) => {
    console.log('[YOE LIVE] WebSocket client connected from:', req.socket.remoteAddress);
    let session: any = null;

    try {
      console.log('[YOE LIVE] Connecting to Gemini Live API session...');
      session = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }
            }
          },
          systemInstruction: {
            parts: [{ text: 'You are Yoe, an empathetic language tutor roleplaying in a realistic scenario on a live audio call. Keep turns natural and concise.' }]
          }
        },
        callbacks: {
          onmessage: (msg: LiveServerMessage) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            // 1. Forward model turn PCM audio chunks
            const parts = msg.serverContent?.modelTurn?.parts;
            if (parts && Array.isArray(parts)) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ type: 'audio', audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ type: 'text', text: part.text }));
                }
              }
            }

            // 2. Forward Interruption / Barge-In signal
            if (msg.serverContent?.interrupted) {
              console.log('[YOE LIVE] Gemini detected interruption');
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            // 3. Forward Turn Complete signal
            if (msg.serverContent?.turnComplete) {
              console.log('[YOE LIVE] Gemini turn complete');
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          },
          onclose: () => {
            console.log('[YOE LIVE] Gemini Live session closed');
          },
          onerror: (err: any) => {
            console.error('[YOE LIVE] Gemini Live session error:', err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'error', error: 'Live session error' }));
            }
          }
        }
      });

      console.log('[YOE LIVE] Connected to Gemini Live API successfully');
      clientWs.send(JSON.stringify({ type: 'connected' }));

    } catch (err: any) {
      console.error('[YOE LIVE] Session initiation failed:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Failed to establish Live session' }));
      }
      return;
    }

    clientWs.on('message', (rawMsg: any) => {
      try {
        const data = JSON.parse(rawMsg.toString());

        if (data.type === 'audio' && data.audio && session) {
          // Stream 16kHz PCM audio chunk to Gemini
          session.sendRealtimeInput({
            audio: {
              data: data.audio,
              mimeType: 'audio/pcm;rate=16000'
            }
          });
        }
      } catch (e) {
        console.warn('[YOE LIVE] Client message parse note:', e);
      }
    });

    clientWs.on('close', async () => {
      console.log('[YOE LIVE] Client WebSocket closed');
      if (session) {
        try {
          await session.close();
        } catch (e) {}
      }
    });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server with Live WebSocket running at http://0.0.0.0:${PORT}`);
  });
}

start();
