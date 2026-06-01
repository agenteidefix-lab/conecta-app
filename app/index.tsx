import { View, Text } from 'react-native';
import { ConnectionIndicator } from '../src/components/ConnectionIndicator';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ borderWidth: 4, borderColor: 'yellow', padding: 20, margin: 10 }}>
        <ConnectionIndicator status="disconnected" />
      </View>
      <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>CONECTA FUNCIONA</Text>
    </View>
  );
}