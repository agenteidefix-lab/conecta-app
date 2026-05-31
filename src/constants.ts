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
} as const;

export const FEATURE_FLAGS = {
  // En v0.1 todo mock. Cambiar a false cuando haya backend real.
  useMockApi: true,
  useMockConnection: true,

  // Preparado para fases futuras:
  enableVoiceInput: false,
  enableVoiceOutput: false,
  enableAuth: false,
  enableMultiUser: false,
  enablePersistence: false,
  enableSubagents: false,
} as const;
