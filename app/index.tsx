import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
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
    const mockText = MOCK_USER_INPUTS[Math.floor(Math.random() * MOCK_USER_INPUTS.length)];
    sendUserMessage(mockText);
  }, [sendUserMessage]);

  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
      <View style={{ borderWidth: 4, borderColor: 'yellow', padding: 10, margin: 5 }}>
        <ConnectionIndicator status={connectionStatus} />
      </View>
      <View style={{ borderWidth: 4, borderColor: 'lime', padding: 10, margin: 5 }}>
        <TalkButton onPress={handleTalkPress} disabled={isProcessing || connectionStatus === 'disconnected'} />
      </View>
      <View style={{ flex: 1, borderWidth: 4, borderColor: 'cyan', margin: 5, backgroundColor: 'darkblue', minHeight: 100 }}>
        <ResponseArea messages={messages} />
      </View>
      {isProcessing && <Text style={{ color: 'white', textAlign: 'center' }}>Idefix está pensando…</Text>}
      <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', margin: 20 }}>CONECTA FUNCIONA</Text>
    </View>
  );
}