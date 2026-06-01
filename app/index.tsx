import { View, Text } from 'react-native';
import { ConnectionIndicator } from '../src/components/ConnectionIndicator';
import { TalkButton } from '../src/components/TalkButton';
import { ResponseArea } from '../src/components/ResponseArea';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
      <ConnectionIndicator status="disconnected" />
      <TalkButton onPress={() => {}} disabled={false} />
      <ResponseArea messages={[]} />
      <Text style={{ color: 'white', fontSize: 20, marginTop: 20 }}>
        CONECTA FUNCIONA
      </Text>
    </View>
  );
}