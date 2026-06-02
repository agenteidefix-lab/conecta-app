import { IDEFIX_CONFIG } from './config/idefix';

// Timeouts y flags de feature
export const APP = {
  name: 'Conecta',
  version: '0.1.0',
  schema: 'conecta',
} as const;

export const TIMEOUTS = {
  connection: IDEFIX_CONFIG.connectionTimeout,
  healthCheck: IDEFIX_CONFIG.healthCheckInterval,
  mockDelay: IDEFIX_CONFIG.mockDelay,
  bridgeRequest: IDEFIX_CONFIG.bridgeRequestTimeout,
} as const;

export const FEATURE_FLAGS = {
  // Mock activo por defecto. Cambiar via EXPO_PUBLIC_CONECTA_USE_MOCK=false
  // en .env.local, o desde IDEFIX_CONFIG.useMockApi.
  useMockApi: IDEFIX_CONFIG.useMockApi,
  useMockConnection: IDEFIX_CONFIG.useMockApi,

  // Preparado para fases futuras:
  enableVoiceInput: false,
  enableVoiceOutput: false,
  enableAuth: false,
  enableMultiUser: false,
  enablePersistence: false,
  enableSubagents: false,
} as const;
