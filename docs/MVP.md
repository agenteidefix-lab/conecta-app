# Conecta — MVP v0.1 (Mock)

## ¿Qué es Conecta?

Conecta es la interfaz de voz/chat para Idefix, el sistema doméstico.
Una app privada (no publicada en stores) para comunicación directa por voz con Idefix.

## Objetivo de esta fase

**Validar la arquitectura** antes de añadir voz real, autenticación, multiusuario o conexión real con Idefix.

En v0.1 todo es **simulado** (mock):
- La conexión con Idefix se simula con un healthcheck falso.
- Las respuestas son textos predefinidos con retardo aleatorio.
- El botón "Hablar" envía textos simulados, no audio.

## Funcionalidad

1. **Indicador de conexión** (mock) → muestra conectado/desconectado/error.
2. **Botón "Hablar"** → pulsa y envía un mensaje simulado a Idefix.
3. **Área de respuestas** → muestra el historial de la conversación con scroll automático.
4. **Indicador de procesamiento** → "Idefix está pensando…" mientras espera respuesta.

## Qué NO incluye v0.1

- ❌ Reconocimiento de voz real
- ❌ Reproducción de audio
- ❌ Autenticación
- ❌ Multiusuario
- ❌ Calendario, correo, domótica
- ❌ Persistencia de datos
- ❌ Conexión real con Idefix
- ❌ Subagentes

## Criterios de éxito

1. La app arranca sin errores.
2. Se muestra el indicador de conexión en verde ("Conectado").
3. Al pulsar "Hablar" aparece un mensaje del usuario y una respuesta de Idefix.
4. El scroll baja automáticamente al último mensaje.
5. Se puede pulsar varias veces y el historial crece.

## Próximos pasos (v1.0)

1. Conexión real con el bridge de Idefix (HTTP/WS).
2. Voz real: captura de micrófono + reproducción.
3. Autenticación básica (token).
4. Persistencia del historial local.
5. Feedback auditivo (sonido al enviar/recibir).
