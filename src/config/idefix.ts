// Configuración del bridge con Idefix
//
// Las variables EXPO_PUBLIC_* se resuelven desde .env.local en desarrollo
// (ver .env.example). Si faltan, se usan los valores por defecto (mock).
//
// .env.local está en .gitignore — nunca subir secretos al repo.

export const IDEFIX_CONFIG = {
  // Bridge URL (desde env o valor por defecto)
  bridgeUrl: process.env.EXPO_PUBLIC_CONECTA_BRIDGE_URL || 'http://localhost:3000/api/conecta',

  // Secreto del bridge (desde env o vacío — si vacío, fallback a mock)
  bridgeSecret: process.env.EXPO_PUBLIC_CONECTA_BRIDGE_SECRET || '',

  // Flag mock: desde env, por defecto true
  useMockApi: process.env.EXPO_PUBLIC_CONECTA_USE_MOCK !== 'false',

  // Timeout de conexión (ms)
  connectionTimeout: 5000,

  // Timeout para peticiones al bridge (ms)
  bridgeRequestTimeout: 15000,

  // Intervalo de healthcheck (ms)
  healthCheckInterval: 30000,

  // Modo de la app: 'text-only' | 'voice' | 'hybrid'
  mode: 'text-only' as 'text-only' | 'voice' | 'hybrid',

  // Retardo simulado para respuestas mock (ms)
  mockDelay: 1200,

  // Nombre visible del asistente
  assistantName: 'Idefix',
} as const;
