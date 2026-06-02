# Voz en Conecta — Arquitectura de proveedores

> Documento de diseño. No implementado todavía.

## Principios

1. **Conecta no sabe qué proveedor genera la voz.** La app solo pide "texto → audio" al bridge. El bridge decide quién lo genera.
2. **El bridge expone una interfaz común** para todos los proveedores de TTS. El proveedor activo se configura por variable de entorno, no en código.
3. **Fallback obligatorio.** Si falla el proveedor principal, el bridge cae a un secundario (Piper local) sin que Conecta lo note.
4. **Coste explícito.** Cada proveedor externo debe tener coste medible antes de activarse como principal.
5. **Sin claves en GitHub.** Las API keys van en variables de entorno del bridge, no en el repositorio.
6. **Pruebas aisladas.** Cada proveedor debe poder probarse individualmente por curl sin tocar Conecta.

## Arquitectura

```
Conecta app                   Bridge                         OpenClaw Gateway
───────────                   ──────                         ────────────────
                               ┌──────────────┐
[TalkButton]                   │  TTS Router   │              ┌─────────────┐
  │                           │              │              │             │
  ├─ texto ──────────────────▶│  decide según │              │  Idefix     │
  │                           │  ENV config   │              │  (agente)   │
  │                           │              │              │             │
  │      ◀──── audio/blob ────│              │              └─────────────┘
  │                           │  Proveedores: │
  │                           │  ┌──────────┐ │
  │                           │  │ Piper    │ │  local, sin API key
  │                           │  │ Edge TTS │ │  Azure, sin coste adicional
  │                           │  │ ElevenLabs│ │  API key, coste por carácter
  │                           │  │ OpenAI   │ │  API key, coste por token
  │                           │  └──────────┘ │
  └───────────────────────────┘  └──────────────┘
```

### Capas

| Capa | Responsabilidad | Tecnología |
|---|---|---|
| **Conecta app** | Enviar texto, recibir audio, reproducirlo | Expo AV / Web Audio API |
| **Bridge** (`server.js`) | Rutear TTS al proveedor activo, gestionar fallbacks, caché | Node.js nativo, sin dependencias |
| **Proveedor TTS** | Convertir texto → audio (binario o URL) | CLI / HTTP API |

## Interfaz común del proveedor

Cada proveedor implementa la misma firma desde el punto de vista del bridge:

```
Input:  text (string), voice (string opcional)
Output: ReadableStream | Buffer | URL de audio descargable
```

El bridge mantiene un mapa de proveedores y elige según `TTS_PROVIDER` (env var):

```
TTS_PROVIDER=piper        # local, por defecto
TTS_PROVIDER=edge         # Microsoft Edge TTS
TTS_PROVIDER=elevenlabs   # ElevenLabs API
TTS_PROVIDER=openai       # OpenAI TTS API
```

### Formato de respuesta del bridge a Conecta

El endpoint actual `POST /api/conecta/message` se amplía con un campo `audio` opcional:

```json
{
  "ok": true,
  "response": "Texto de la respuesta",
  "audio": {
    "mimeType": "audio/wav",
    "data": "<base64 del audio>",
    "durationMs": 2400
  },
  "timestamp": 1712345678901
}
```

O alternativamente:

```json
{
  "ok": true,
  "response": "Texto de la respuesta",
  "audio": {
    "mimeType": "audio/mpeg",
    "url": "http://127.0.0.1:18790/api/conecta/audio/abc123.wav",
    "durationMs": 2400
  },
  "timestamp": 1712345678901
}
```

## Proveedores candidatos

### 1. Piper TTS (local, por defecto)

| Campo | Valor |
|---|---|
| **Tipo** | CLI local, sin API key |
| **Calidad** | Media. Voz `es_ES-carlfm-x_low` |
| **Latencia** | Baja (local, sin red) |
| **Coste** | 0 € |
| **Uso** | Fallback por defecto. Principal si no se configura otro |
| **Instalación** | Ya instalado en el VPS (`/home/tomas/tts/piper/piper`) |
| **Endpoint bridge** | `exec()` de `piper --model es_ES-carlfm-x_low --output_file <tmp>.wav` |

### 2. Microsoft Edge TTS (Azure, sin coste adicional)

| Campo | Valor |
|---|---|
| **Tipo** | API HTTP gratuita (no oficial) |
| **Calidad** | Alta. Voz `es-ES-AlvaroNeural` (ya configurada en OpenClaw) |
| **Latencia** | Media (depende de red a Azure) |
| **Coste** | 0 € (API no oficial de Edge) |
| **Riesgo** | Puede dejar de funcionar si Microsoft cambia la API |
| **Endpoint bridge** | `fetch()` contra `https://api-edge.cognitive.microsofttranslator.com/...` |

### 3. ElevenLabs API

| Campo | Valor |
|---|---|
| **Tipo** | API REST con API key |
| **Calidad** | Muy alta. Voces naturales con emoción |
| **Latencia** | Media-alta (procesamiento en servidor) |
| **Coste** | Por caracteres. Starter ~5€/mes (hasta 30k caracteres) |
| **Uso** | Solo si la calidad de Piper/Edge no es suficiente |
| **Endpoint bridge** | `fetch()` contra `https://api.elevenlabs.io/v1/text-to-speech/<voice-id>` |

### 4. OpenAI TTS API

| Campo | Valor |
|---|---|
| **Tipo** | API REST con API key |
| **Calidad** | Alta. Voces `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer` |
| **Latencia** | Media |
| **Coste** | ~15€/1M caracteres (TTS-1-HD: ~30€/1M) |
| **Uso** | Si ya hay API key de OpenAI, explorar como opción |
| **Endpoint bridge** | `fetch()` contra `https://api.openai.com/v1/audio/speech` |

### 5. Futuros / experimentales

- **Google Cloud TTS** — calidad alta, ~4€/1M caracteres, soporte español latino/peninsular
- **Amazon Polly** — calidad media, ~4€/1M caracteres, voces estándar y neuronales
- **Cartesia (Sonic)** — calidad muy alta, modelo nuevo, latencia baja, ~10€/1M caracteres
- **Coqui TTS** — open source, auto-hospedado, calidad media-buena, sin coste API
- **Whisper + RVC** — pipeline local clonación de voz, experimental

## Estrategia de fallback

```
TTS_PROVIDER=elevenlabs
       │
       ▼
Bridge intenta ElevenLabs
       │
       ├─ Éxito → devuelve audio
       │
       └─ Falla (timeout, 429, 5xx, API key inválida)
              │
              ▼
       Bridge intenta Edge TTS
              │
              ├─ Éxito → devuelve audio
              │
              └─ Falla
                     │
                     ▼
              Bridge intenta Piper (local)
                     │
                     └─ Siempre funciona → devuelve audio
```

El bridge incluye un log de cada intento:

```
[voice] proveedor=elevenlabs, estado=error, error="Rate limit exceeded"
[voice] proveedor=edge, estado=ok, duracion=1234ms, size=45KB
```

Conecta nunca ve los fallos internos. Solo recibe el audio final (o un error genérico si todo falla, incluido Piper).

## Configuración en entorno

### Bridge `.env` (el del servidor, no el de Conecta)

```env
# Proveedor activo
TTS_PROVIDER=piper

# Piper (local, no necesita credenciales)
PIPER_BIN=/home/tomas/tts/piper/piper
PIPER_MODEL=/home/tomas/tts/voices/es_ES-carlfm-x_low.onnx

# Edge TTS (sin API key, usa API pública)
# No necesita configuración adicional

# ElevenLabs (solo si TTS_PROVIDER=elevenlabs)
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=...

# OpenAI (solo si TTS_PROVIDER=openai)
OPENAI_API_KEY=sk-...
OPENAI_TTS_VOICE=alloy
```

## Caché de audio

El bridge puede cachear fragmentos de audio para reducir latencia y coste:

- **Clave de caché:** hash del texto + proveedor + voz
- **TTL:** 1 hora (configurable)
- **Almacenamiento:** `/tmp/conecta-audio-cache/` (volátil, se limpia al reiniciar)
- **Tamaño máximo:** 500 MB (configurable, se limpia LRU)

## Medición y decisión de proveedor

Antes de elegir un proveedor como principal:

| Métrica | Cómo medirla | Objetivo |
|---|---|---|
| Latencia p50 | curl + time | < 2 s |
| Latencia p95 | curl + time 10 veces | < 4 s |
| Calidad subjetiva | Prueba humana con 5 frases | Aceptable |
| Coste por mes | Estimación según uso | < 5 €/mes |
| Disponibilidad | Healthcheck periódico | > 99 % |

Procedimiento propuesto:

1. Configurar `TTS_PROVIDER=<candidato>` en el bridge
2. Probar con curl: `curl -X POST ... -d '{"text":"Hola, soy Idefix","tts":"true"}'`
3. Medir latencia con `time` y `httpx` (opcional)
4. Repetir 10 veces, calcular p50 y p95
5. Escuchar el resultado y valorar calidad
6. Si cumple todos los criterios, proponer como principal
7. Mantener Piper como fallback siempre

## Seguridad

- Las API keys de ElevenLabs/OpenAI van en el `.env` del bridge, nunca en el repositorio
- El `.env` del bridge está en el VPS, no accesible desde Conecta
- El bridge no expone las API keys en ninguna respuesta
- El caché de audio se limpia al reiniciar el bridge
- Los logs del bridge no incluyen claves ni textos completos de las peticiones (solo longitud y hash)

## Próximos pasos (cuando se decida implementar)

1. Añadir al bridge el router de TTS con interfaz de proveedor
2. Implementar proveedor Piper (ya existe el binario)
3. Probar flujo completo: texto → bridge → Piper → audio → Conecta
4. Implementar proveedor Edge TTS
5. Añadir campo `audio` a la respuesta del bridge
6. En Conecta: recibir audio y reproducirlo con expo-av
7. Implementar proveedor ElevenLabs (si se decide contratar)
8. Implementar caché de audio
9. Documentar costes reales tras 1 mes de uso
