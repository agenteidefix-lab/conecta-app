// Servicio de comunicación con el bridge de Idefix
//
// Modo mock (por defecto): respuestas simuladas con retardo.
// Modo real: HTTP POST al bridge de Idefix (endpoint /api/conecta/message).
//
// Fallback automático: si falta bridgeSecret, vuelve a mock sin romper la app.

import { IDEFIX_CONFIG } from '../config/idefix';
import { FEATURE_FLAGS, TIMEOUTS } from '../constants';
import type { MessageRequest, MessageResponse, HealthResponse } from '../types/api';

// ── Respuestas simuladas (v0.1) ────────────────────────────────────────────

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

// ── Llamada real al bridge ─────────────────────────────────────────────────

function shouldUseRealApi(): boolean {
  return !FEATURE_FLAGS.useMockApi && IDEFIX_CONFIG.bridgeSecret.length > 0;
}

async function realSendMessage(request: MessageRequest): Promise<MessageResponse> {
  const url = `${IDEFIX_CONFIG.bridgeUrl}/api/conecta/message`;
  console.log(`[conecta] sendMessage: real, URL=${url}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${IDEFIX_CONFIG.bridgeSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: request.text }),
  });

  console.log(`[conecta] sendMessage: HTTP ${response.status}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.log(`[conecta] sendMessage: fallo - ${err.error || response.statusText}`);
    throw new Error(err.error || `Bridge error ${response.status}`);
  }

  const data = await response.json();
  console.log(`[conecta] sendMessage: OK - "${data.response?.slice(0, 60)}..."`);
  return {
    text: data.response,
    timestamp: data.timestamp,
  };
}

async function realHealthCheck(): Promise<HealthResponse> {
  const url = `${IDEFIX_CONFIG.bridgeUrl}/health`;
  console.log(`[conecta] healthCheck: real, URL=${url}`);

  const response = await fetch(url);

  console.log(`[conecta] healthCheck: HTTP ${response.status}`);

  if (!response.ok) {
    console.log(`[conecta] healthCheck: fallo - ${response.statusText}`);
    return { status: 'error' };
  }

  const data = await response.json();
  console.log(`[conecta] healthCheck: OK - status=${data.status}`);
  return {
    status: data.status === 'running' ? 'ok' : 'error',
    version: data.service ? `bridge-${data.service}` : undefined,
    uptime: undefined,
  };
}

// ── API pública ────────────────────────────────────────────────────────────

export async function sendMessage(request: MessageRequest): Promise<MessageResponse> {
  const mode = shouldUseRealApi() ? 'real' : 'mock';
  console.log(`[conecta] sendMessage: modo=${mode}, useMockApi=${FEATURE_FLAGS.useMockApi}, hasSecret=${IDEFIX_CONFIG.bridgeSecret.length > 0}`);
  if (shouldUseRealApi()) {
    return realSendMessage(request);
  }
  return mockSendMessage(request);
}

export async function healthCheck(): Promise<HealthResponse> {
  const mode = shouldUseRealApi() ? 'real' : 'mock';
  console.log(`[conecta] healthCheck: modo=${mode}, useMockApi=${FEATURE_FLAGS.useMockApi}, hasSecret=${IDEFIX_CONFIG.bridgeSecret.length > 0}`);
  if (shouldUseRealApi()) {
    return realHealthCheck();
  }
  return mockHealthCheck();
}

// Preparado para futuro:
// export function sendAudioStream(stream: Blob): Promise<MessageResponse> { ... }
// export function connectWebSocket(): WebSocket { ... }