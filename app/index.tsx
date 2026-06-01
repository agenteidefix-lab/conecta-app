import { View, Text } from 'react-native';
import { ConnectionIndicator } from '../src/components/ConnectionIndicator';
import { TalkButton } from '../src/components/TalkButton';
import { ResponseArea } from '../src/components/ResponseArea';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'red' }}>
      {/* Bloque 1: ConnectionIndicator con borde amarillo */}
      <View style={{ borderWidth: 4, borderColor: 'yellow', margin: 10, padding: 10 }}>
        <ConnectionIndicator status="disconnected" />
      </View>

      {/* Bloque 2: TalkButton con borde verde lima */}
      <View style={{ borderWidth: 4, borderColor: 'lime', margin: 10, padding: 10, alignItems: 'center' }}>
        <TalkButton onPress={() => {}} disabled={false} />
      </View>

      {/* Bloque 3: ResponseArea con borde cian y fondo azul marino */}
      <View style={{ borderWidth: 4, borderColor: 'cyan', margin: 10, padding: 10, backgroundColor: 'darkblue' }}>
        <ResponseArea messages={[]} />
      </View>

      <Text style={{ color: 'white', fontSize: 20, marginTop: 20, textAlign: 'center' }}>
        CONECTA FUNCIONA
      </Text>
    </View>
  );
}