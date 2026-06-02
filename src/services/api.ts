// Servicio de comunicación con el bridge de Idefix
//
// Modo mock (por defecto): respuestas simuladas con retardo.
// Modo real: HTTP POST al bridge de Idefix con timeout y errores tipificados.
//
// Fallback automático: si falta bridgeSecret, vuelve a mock sin romper la app.

import { IDEFIX_CONFIG } from '../config/idefix';
import { FEATURE_FLAGS, TIMEOUTS } from '../constants';
import type { MessageRequest, MessageResponse, HealthResponse } from '../types/api';

// ── Tipos de error ─────────────────────────────────────────────────────────

export class BridgeError extends Error {
  constructor(
    message: string,
    public readonly code: 'TIMEOUT' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'NETWORK' | 'BUSY' | 'UNKNOWN',
  ) {
    super(message);
    this.name = 'BridgeError';
  }
}

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

function classifyError(err: unknown): BridgeError {
  if (err instanceof BridgeError) return err;

  const msg = err instanceof Error ? err.message : String(err);

  if (err && typeof err === 'object' && 'name' in err) {
    const name = (err as Error).name;
    if (name === 'AbortError') {
      return new BridgeError('El bridge no respondió a tiempo. Inténtalo de nuevo.', 'TIMEOUT');
    }
    if (name === 'TypeError' && (msg.includes('fetch') || msg.includes('Network') || msg.includes('network'))) {
      return new BridgeError('No se pudo conectar con el bridge.', 'NETWORK');
    }
  }

  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('Token')) {
    return new BridgeError('Error de autenticación con el bridge.', 'UNAUTHORIZED');
  }

  if (msg.includes('503') && msg.includes('agent_busy')) {
    return new BridgeError('Idefix está ocupado ahora. Inténtalo en unos segundos.', 'BUSY');
  }

  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return new BridgeError('El bridge tuvo un error interno.', 'SERVER_ERROR');
  }

  return new BridgeError('Error inesperado. Inténtalo de nuevo.', 'UNKNOWN');
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function realSendMessage(request: MessageRequest): Promise<MessageResponse> {
  const url = `${IDEFIX_CONFIG.bridgeUrl}/api/conecta/message`;

  let response: Response;
  try {
    response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${IDEFIX_CONFIG.bridgeSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: request.text }),
      },
      TIMEOUTS.bridgeRequest,
    );
  } catch (err) {
    throw classifyError(err);
  }

  if (response.status === 401) {
    throw new BridgeError('Error de autenticación con el bridge.', 'UNAUTHORIZED');
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    console.warn(`[conecta] bridge error: HTTP ${response.status} - ${errBody.error || response.statusText}`);

    // 503 agent_busy — Idefix está ocupado
    if (response.status === 503 && errBody.code === 'agent_busy') {
      throw new BridgeError('Idefix está ocupado ahora. Inténtalo en unos segundos.', 'BUSY');
    }

    throw new BridgeError(
      errBody.error || `Error del bridge (${response.status}).`,
      response.status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN',
    );
  }

  const data = await response.json();
  return {
    text: data.response,
    timestamp: data.timestamp,
  };
}

async function realHealthCheck(): Promise<HealthResponse> {
  const url = `${IDEFIX_CONFIG.bridgeUrl}/health`;

  try {
    const response = await fetchWithTimeout(url, { method: 'GET' }, 5000);
    if (!response.ok) {
      return { status: 'error' };
    }
    const data = await response.json();
    return {
      status: data.status === 'running' ? 'ok' : 'error',
      version: data.service ? `bridge-${data.service}` : undefined,
      uptime: undefined,
    };
  } catch {
    return { status: 'error' };
  }
}

// ── API pública ────────────────────────────────────────────────────────────

export async function sendMessage(request: MessageRequest): Promise<MessageResponse> {
  if (shouldUseRealApi()) {
    return realSendMessage(request);
  }
  return mockSendMessage(request);
}

export async function healthCheck(): Promise<HealthResponse> {
  if (shouldUseRealApi()) {
    return realHealthCheck();
  }
  return mockHealthCheck();
}

// Preparado para futuro:
// export function sendAudioStream(stream: Blob): Promise<MessageResponse> { ... }
// export function connectWebSocket(): WebSocket { ... }