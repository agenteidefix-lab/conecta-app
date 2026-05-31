// Hook de conversación con Idefix
//
// Orquesta: input del usuario → envío al bridge → respuesta → store.
// En v0.1: el input es texto simulado desde TalkButton.
// En v1.0: el input puede ser audio transcrito o texto directo.

import { useCallback } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { sendMessage } from '../services/api';

export function useConversation() {
  const addMessage = useConversationStore((s) => s.addMessage);
  const setProcessing = useConversationStore((s) => s.setProcessing);
  const isProcessing = useConversationStore((s) => s.isProcessing);
  const messages = useConversationStore((s) => s.messages);

  const sendUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      // Añadir mensaje del usuario
      addMessage({ role: 'user', text: text.trim() });

      // Enviar a Idefix (mock en v0.1)
      setProcessing(true);
      try {
        const response = await sendMessage({ text: text.trim() });
        addMessage({ role: 'assistant', text: response.text });
      } catch {
        addMessage({
          role: 'assistant',
          text: 'Error de conexión. Inténtalo de nuevo.',
        });
      } finally {
        setProcessing(false);
      }
    },
    [addMessage, setProcessing, isProcessing],
  );

  const clearConversation = useCallback(() => {
    useConversationStore.getState().clearMessages();
  }, []);

  return {
    messages,
    isProcessing,
    sendUserMessage,
    clearConversation,
    // Preparado para futuro:
    // sendAudioMessage: (blob: Blob) => Promise<void>
    // retryLastMessage: () => Promise<void>
  };
}

// En v1.0 este hook también orquestará:
// - Envío de audio (transcripción → texto → API → audio de vuelta)
// - Streaming de respuestas (WebSocket para respuestas parciales)
// - Confirmación de lectura de respuestas de Idefix
