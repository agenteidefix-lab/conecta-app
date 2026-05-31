// Hook de conexión con Idefix
//
// Gestiona el ciclo de vida de la conexión con el bridge de Idefix.
// En v0.1: simula conexión al montar el hook.
// En v1.0: healthcheck real con backoff y reconexión.

import { useEffect, useRef, useCallback } from 'react';
import { useConversationStore } from '../stores/conversationStore';
import { healthCheck } from '../services/api';
import { TIMEOUTS } from '../constants';
import type { ConnectionStatus } from '../types/conversation';

export function useConnection() {
  const setConnectionStatus = useConversationStore((s) => s.setConnectionStatus);
  const connectionStatus = useConversationStore((s) => s.connectionStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = useCallback(async () => {
    setConnectionStatus('connecting');
    try {
      const result = await healthCheck();
      setConnectionStatus(result.status === 'ok' ? 'connected' : 'error');
    } catch {
      setConnectionStatus('error');
    }
  }, [setConnectionStatus]);

  useEffect(() => {
    // Simular conexión inicial
    const initTimeout = setTimeout(() => {
      check();
    }, 500);

    // Healthcheck periódico
    intervalRef.current = setInterval(check, TIMEOUTS.healthCheck);

    return () => {
      clearTimeout(initTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [check]);

  return {
    connectionStatus,
    reconnect: check,
  };
}

// Preparado para futuro:
// - Reconexión automática con backoff exponencial
// - Detección de cambios de red (NetInfo)
// - Autenticación al conectar
// - Multi-sesión (un usuario por dispositivo)
