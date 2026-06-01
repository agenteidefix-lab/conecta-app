import { View, Text } from 'react-native';
import { ConnectionIndicator } from '../src/components/ConnectionIndicator';
import { TalkButton } from '../src/components/TalkButton';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ borderWidth: 4, borderColor: 'yellow', padding: 10, margin: 5 }}>
        <ConnectionIndicator status="disconnected" />
      </View>
      <View style={{ borderWidth: 4, borderColor: 'lime', padding: 10, margin: 5 }}>
        <TalkButton onPress={() => {}} disabled={false} />
      </View>
      <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>CONECTA FUNCIONA</Text>
    </View>
  );
}