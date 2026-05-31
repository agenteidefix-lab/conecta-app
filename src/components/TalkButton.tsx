// Botón para hablar con Idefix
//
// Componente presentacional. No tiene lógica de negocio.
// En v0.1: botón táctil que envía un mensaje simulado.
// En v1.0: botón con hold-to-talk para grabar audio.
//
// Punto de extensión para voz:
// - onPress → onStartRecording / onStopRecording
// - disabled → isRecording (para cambiar color/icono)
// - Se puede añadir un waveform visual cuando haya audio real

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TalkButtonProps {
  onPress: () => void;
  disabled: boolean;
  label?: string;
}

export function TalkButton({ onPress, disabled, label = 'Hablar' }: TalkButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#A2A2A2',
    shadowOpacity: 0.1,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  labelDisabled: {
    color: '#D1D1D6',
  },
});
