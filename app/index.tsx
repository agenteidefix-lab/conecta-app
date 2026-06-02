// Pantalla principal de Conecta v0.1
//
// Orquesta los tres componentes base:
// - ConnectionIndicator (estado de conexión mock)
// - TalkButton (botón para hablar)
// - ResponseArea (zona de respuestas)
//
// Los hooks orquestan la lógica, los stores contienen el estado,
// los componentes son solo presentacionales.

import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ConnectionIndicator } from '../src/components/ConnectionIndicator';
import { TalkButton } from '../src/components/TalkButton';
import { ResponseArea } from '../src/components/ResponseArea';

import { useConnection } from '../src/hooks/useConnection';
import { useConversation } from '../src/hooks/useConversation';

export default function HomeScreen() {
  const { connectionStatus } = useConnection();
  const { messages, isProcessing, sendUserMessage } = useConversation();
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleTalkPress = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    sendUserMessage(text);
    setInputText('');
    inputRef.current?.focus();
  }, [inputText, sendUserMessage]);

  const canSend = inputText.trim().length > 0 && !isProcessing && connectionStatus === 'connected';

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

      {/* Input + botón enviar */}
      <View style={styles.footer}>
        {isProcessing && (
          <Text style={styles.processingText}>Idefix está pensando…</Text>
        )}
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Escribe un mensaje…"
            placeholderTextColor="#A2A2A2"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleTalkPress}
            returnKeyType="send"
            editable={!isProcessing}
          />
          <TalkButton
            onPress={handleTalkPress}
            disabled={!canSend}
            label="Enviar"
          />
        </View>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9E9EB',
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F2F2F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1C1C1E',
  },
  processingText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});