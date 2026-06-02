// Hook de conversación con Idefix
//
// Orquesta: input del usuario → envío al bridge → respuesta → store.
// Los errores tipificados se traducen a mensajes visibles según el código.

import { useCallback } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { sendMessage, BridgeError } from '../services/api';

function userFacingError(err: unknown): string {
  if (err instanceof BridgeError) {
    return err.message;
  }
  return 'Error de conexión. Inténtalo de nuevo.';
}

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

      // Enviar a Idefix
      setProcessing(true);
      try {
        const response = await sendMessage({ text: text.trim() });
        addMessage({ role: 'assistant', text: response.text });
      } catch (err) {
        addMessage({
          role: 'assistant',
          text: userFacingError(err),
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
  };
}