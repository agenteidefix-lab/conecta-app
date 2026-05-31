// Pantalla principal de Conecta v0.1
//
// Orquesta los tres componentes base:
// - ConnectionIndicator (estado de conexión mock)
// - TalkButton (botón para hablar)
// - ResponseArea (zona de respuestas)
//
// Los hooks orquestan la lógica, los stores contienen el estado,
// los componentes son solo presentacionales.

import React, { useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ConnectionIndicator } from '../src/components/ConnectionIndicator';
import { TalkButton } from '../src/components/TalkButton';
import { ResponseArea } from '../src/components/ResponseArea';

import { useConnection } from '../src/hooks/useConnection';
import { useConversation } from '../src/hooks/useConversation';

const MOCK_USER_INPUTS = [
  'Hola Idefix',
  '¿Qué tiempo hace hoy?',
  'Recuérdame comprar leche',
  'Apaga la luz del salón',
];

export default function HomeScreen() {
  const { connectionStatus } = useConnection();
  const { messages, isProcessing, sendUserMessage } = useConversation();

  const handleTalkPress = useCallback(() => {
    // En v0.1: envía un texto simulado aleatorio
    // En v1.0: aquí se activará la grabación de voz
    const mockText = MOCK_USER_INPUTS[Math.floor(Math.random() * MOCK_USER_INPUTS.length)];
    sendUserMessage(mockText);
  }, [sendUserMessage]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Conecta</Text>
        <ConnectionIndicator status={connectionStatus} />
      </View>

      {/* Área de respuestas */}
      <ResponseArea messages={messages} />

      {/* Botón hablar + indicador de procesamiento */}
      <View style={styles.footer}>
        {isProcessing && (
          <Text style={styles.processingText}>Idefix está pensando…</Text>
        )}
        <TalkButton
          onPress={handleTalkPress}
          disabled={isProcessing || connectionStatus === 'disconnected'}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderTopColor: '#E9E9EB',
    gap: 8,
  },
  processingText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
