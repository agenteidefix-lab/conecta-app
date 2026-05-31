// Servicio de comunicación con el bridge de Idefix
//
// En v0.1: respuestas simuladas (mock) con retardo.
// En v1.0: HTTP POST o WebSocket real hacia el bridge de Idefix.
//
// Nota: desde esta app NO se llama a OpenClaw directamente.
// Toda la comunicación pasa por el bridge de Idefix (src/config/idefix.ts).

import { IDEFIX_CONFIG } from '../config/idefix';
import { FEATURE_FLAGS, TIMEOUTS } from '../constants';
import type { MessageRequest, MessageResponse, HealthResponse } from '../types/api';

// --- Respuestas simuladas (v0.1) ---

const MOCK_RESPONSES: string[] = [
  'Entendido. ¿Algo más?',
  'Perfecto, lo he registrado.',
  'Recibido. Estoy en ello.',
  'Anotado. ¿Necesitas algo más?',
  'De acuerdo, queda hecho.',
  'Vale, lo tengo.',
  'Entendido. Avísame si necesitas algo.',
  'Hecho.',
];

function mockSendMessage(_req: MessageRequest): Promise<MessageResponse> {
  return new Promise((resolve) => {
    const delay = TIMEOUTS.mockDelay + Math.random() * 500;
    setTimeout(() => {
      const response =
        MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      resolve({
        text: response,
        timestamp: Date.now(),
      });
    }, delay);
  });
}

function mockHealthCheck(): Promise<HealthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'ok',
        version: '0.1.0-mock',
        uptime: Math.floor(Math.random() * 86400),
      });
    }, 200);
  });
}

// --- API pública ---

export async function sendMessage(request: MessageRequest): Promise<MessageResponse> {
  if (FEATURE_FLAGS.useMockApi) {
    return mockSendMessage(request);
  }

  // En v1.0 esto será:
  // const response = await fetch(`${IDEFIX_CONFIG.bridgeUrl}/message`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // });
  // return response.json();

  throw new Error('API real no implementada. Usar FEATURE_FLAGS.useMockApi = true');
}

export async function healthCheck(): Promise<HealthResponse> {
  if (FEATURE_FLAGS.useMockConnection) {
    return mockHealthCheck();
  }

  // En v1.0 esto será:
  // const response = await fetch(`${IDEFIX_CONFIG.bridgeUrl}/health`);
  // return response.json();

  throw new Error('Healthcheck real no implementado. Usar FEATURE_FLAGS.useMockConnection = true');
}

// Preparado para futuro:
// export function sendAudioStream(stream: Blob): Promise<MessageResponse> { ... }
// export function connectWebSocket(): WebSocket { ... }
