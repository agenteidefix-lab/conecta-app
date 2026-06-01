import { View, Text } from 'react-native';
import { ConnectionIndicator } from '../src/components/ConnectionIndicator';
import { TalkButton } from '../src/components/TalkButton';
import { ResponseArea } from '../src/components/ResponseArea';
import { useConnection } from '../src/hooks/useConnection';

export default function HomeScreen() {
  const { connectionStatus } = useConnection();

  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
      <View style={{ borderWidth: 4, borderColor: 'yellow', padding: 10, margin: 5 }}>
        <ConnectionIndicator status={connectionStatus} />
      </View>
      <View style={{ borderWidth: 4, borderColor: 'lime', padding: 10, margin: 5 }}>
        <TalkButton onPress={() => {}} disabled={false} />
      </View>
      <View style={{ flex: 1, borderWidth: 4, borderColor: 'cyan', margin: 5, backgroundColor: 'darkblue', minHeight: 100 }}>
        <ResponseArea messages={[]} />
      </View>
      <Text style={{ color: 'white', fontSize: 20, textAlign: 'center', margin: 20 }}>CONECTA FUNCIONA</Text>
    </View>
  );
}