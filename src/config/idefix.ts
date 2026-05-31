// Configuración del bridge con Idefix
// Esta app NO habla directamente con OpenClaw.
// Habla con Idefix a través de un bridge (API/bridge intermedio).
//
// En v0.1 todo es mock. Cuando llegue la conexión real,
// solo hay que cambiar estos valores y la implementación en services/api.ts.

export const IDEFIX_CONFIG = {
  // Bridge URL (mock en v0.1)
  bridgeUrl: 'http://localhost:3000/api/conecta',

  // Timeout de conexión (ms)
  connectionTimeout: 5000,

  // Intervalo de healthcheck (ms)
  healthCheckInterval: 30000,

  // Modo de la app: 'text-only' | 'voice' | 'hybrid'
  mode: 'text-only' as 'text-only' | 'voice' | 'hybrid',

  // Retardo simulado para respuestas mock (ms)
  mockDelay: 1200,

  // Nombre visible del asistente
  assistantName: 'Idefix',

  // Preparado para futuro:
  // apiKey?: string;
  // userId?: string;
  // reconnectAttempts?: number;
  // audioSampleRate?: number;
} as const;
