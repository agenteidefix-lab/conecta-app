import { create } from 'zustand';
import type { ConversationState, Message, ConnectionStatus, AppMode } from '../types/conversation';

interface ConversationActions {
  // Mensajes
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;

  // Conexión
  setConnectionStatus: (status: ConnectionStatus) => void;

  // Procesamiento
  setProcessing: (processing: boolean) => void;

  // Modo
  setMode: (mode: AppMode) => void;
}

type ConversationStore = ConversationState & ConversationActions;

const initialState: ConversationState = {
  messages: [],
  connectionStatus: 'disconnected',
  mode: 'text-only',
  isProcessing: false,
};

export const useConversationStore = create<ConversationStore>((set) => ({
  ...initialState,

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: Date.now(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setMode: (mode) => set({ mode }),
}));
