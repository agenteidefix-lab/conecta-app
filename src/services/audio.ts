// Servicio de audio (placeholder para voz real)
//
// En v0.1: vacío. No hay captura ni reproducción de audio.
// En v1.0: aquí irá la captura de micrófono y reproducción de voz.
//
// APIs candidatas (según lo que decidas):
// - expo-av (Audio.Recording, Audio.Sound)
// - expo-speech (text-to-speech nativo, si algún día Idefix habla directo)
// - react-native-webrtc (si el bridge usa WebRTC para streaming)
// - Web Audio API (si la app va web)

// Placeholder: lanzar error si alguien llama a esto en v0.1
export function isAudioAvailable(): boolean {
  return false;
}

// Preparado para futuro:
// export async function startRecording(): Promise<string> { ... }
// export async function stopRecording(): Promise<Blob> { ... }
// export async function playAudio(uri: string): Promise<void> { ... }
// export async function textToSpeech(text: string): Promise<string> { ... }
