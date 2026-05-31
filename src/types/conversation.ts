// Tipos del estado de conexión
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

// Un mensaje individual en la conversación
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  // Preparado para futuro:
  // audioUri?: string;       // cuando haya voz real
  // userId?: string;         // cuando haya multiusuario
  // pending?: boolean;       // para tracking de envío
}

// Modos de entrada de la app
export type AppMode = 'text-only' | 'voice' | 'hybrid';

// Estado global de la conversación
export interface ConversationState {
  messages: Message[];
  connectionStatus: ConnectionStatus;
  mode: AppMode;
  isProcessing: boolean;
}
