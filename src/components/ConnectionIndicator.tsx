// Indicador de conexión con Idefix
//
// Componente presentacional. No tiene lógica de negocio.
// Recibe el estado por props y pinta el indicador visual adecuado.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ConnectionStatus } from '../types/conversation';

interface ConnectionIndicatorProps {
  status: ConnectionStatus;
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: 'Conectado',
  connecting: 'Conectando…',
  disconnected: 'Desconectado',
  error: 'Error de conexión',
};

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: '#34C759',
  connecting: '#FFD60A',
  disconnected: '#8E8E93',
  error: '#FF3B30',
};

export function ConnectionIndicator({ status }: ConnectionIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: STATUS_COLORS[status] }]} />
      <Text style={styles.label}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
