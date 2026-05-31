// Payload de solicitud al bridge de Idefix
export interface MessageRequest {
  text: string;
  userId?: string;
  timestamp?: number;
  // Preparado para futuro:
  // audioBase64?: string;    // cuando haya voz real
  // sessionId?: string;      // cuando haya sesiones persistentes
}

// Payload de respuesta del bridge de Idefix
export interface MessageResponse {
  text: string;
  timestamp: number;
  // Preparado para futuro:
  // audioBase64?: string;    // cuando Idefix responda con voz
  // action?: string;         // cuando Idefix ejecute comandos
  // subagentId?: string;     // cuando haya subagentes dedicados
}

// Estado de salud del bridge
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version?: string;
  uptime?: number;
}
