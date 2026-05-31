# Conecta — Architecture v0.1

## Principios arquitectónicos

### 1. Separación estricta por capas

```
UI (componentes) → Orquestación (hooks) → Estado (stores) → Servicios (api/audio)
```

Cada capa se comunica solo con la inmediatamente inferior:
- Un componente **nunca** llama a `fetch()` ni a la API directamente.
- Un servicio **nunca** importa un componente.
- Un hook orquesta: llama al servicio, actualiza la store.
- Una store solo contiene estado, no tiene lógica de negocio.

### 2. Componentes tontos (presentacionales)

TalkButton no sabe qué pasa cuando se pulsa. Solo llama a `onPress`.
ConnectionIndicator no sabe cómo conectarse. Solo pinta un color.

Esto permite cambiar implementaciones sin tocar el resto del sistema.

### 3. Un servicio por responsabilidad externa

- `api.ts` → comunicación con el bridge de Idefix
- `audio.ts` → hardware de audio (futuro)
- `storage.ts` → persistencia local (futuro)
- `auth.ts` → autenticación (futuro)

Cada uno puede mockearse independientemente.

### 4. La app habla con Idefix, no con OpenClaw

Conecta no conoce OpenClaw. Conecta habla con **Idefix** a través de un bridge.
Ese bridge puede ser:
- Un servicio Node.js que traduce peticiones a OpenClaw.
- Un WebSocket directo a un subagente de Idefix.
- Una API serverless.

El frontend no necesita saberlo. Solo conoce `src/config/idefix.ts`.

### 5. Preparado para crecer sin reescribir

Cada extensión futura está mapeada a un punto de inyección concreto:

| Extensión | Archivo(s) que cambian | Archivos que NO cambian |
|---|---|---|
| Voz real (input) | `audio.ts`, `TalkButton` | `api.ts`, `ResponseArea`, stores |
| Voz real (output) | `audio.ts`, `api.ts` | hooks, componentes |
| Autenticación | `services/auth.ts`, hook `useAuth` | componentes UI |
| Multiusuario | `stores/userStore.ts` | stores de conversación |
| Persistencia | `services/storage.ts`, hook `useHistory` | componentes UI |
| Subagentes | `api.ts` (nuevos endpoints) | todo lo demás |
| Web (migración) | `app/` (rutas) | `src/` se mueve intacta |

## Estructura de carpetas

```
conecta-app/
├── app/                          # Expo Router — rutas
│   ├── _layout.tsx               # Layout raíz (v0.1: vacío, preparado)
│   └── index.tsx                 # Pantalla única (orquestador)
│
├── src/
│   ├── components/               # UI pura (sin lógica de negocio)
│   │   ├── TalkButton.tsx
│   │   ├── ConnectionIndicator.tsx
│   │   └── ResponseArea.tsx
│   │
│   ├── hooks/                    # Lógica de negocio reutilizable
│   │   ├── useConnection.ts      # Ciclo de vida de conexión
│   │   └── useConversation.ts    # Envío/recepción de mensajes
│   │
│   ├── services/                 # Comunicación externa
│   │   ├── api.ts                # Bridge con Idefix (mock → real)
│   │   └── audio.ts              # Captura/reproducción de audio (placeholder)
│   │
│   ├── stores/                   # Estado global (Zustand)
│   │   └── conversationStore.ts  # Mensajes, conexión, modo
│   │
│   ├── types/                    # Contratos TypeScript
│   │   ├── conversation.ts       # Message, ConnectionStatus, AppMode
│   │   └── api.ts                # MessageRequest, MessageResponse
│   │
│   ├── config/                   # Configuración del sistema
│   │   └── idefix.ts             # Bridge URL, timeouts, flags
│   │
│   └── constants.ts              # Feature flags, timeouts, constantes
│
├── assets/
│   └── sounds/                   # Sonidos placeholder (v0.1 vacío)
│
├── docs/
│   ├── MVP.md                    # Qué hace v0.1
│   └── ARCHITECTURE.md           # Este archivo
│
├── app.json                      # Configuración Expo
├── package.json
└── tsconfig.json
```

## Flujo de datos (v0.1)

```
Usuario pulsa "Hablar"
       │
       ▼
TalkButton.onPress()
       │
       ▼
useConversation.sendUserMessage(texto)
       │
       ├─ 1. Añade mensaje del usuario a la store
       ├─ 2. setProcessing(true)
       ├─ 3. Llama a api.sendMessage()
       │         │
       │         ▼
       │    api.ts → mock setTimeout → respuesta simulada
       │
       ├─ 4. Añade respuesta de Idefix a la store
       ├─ 5. setProcessing(false)
       │
       ▼
ResponseArea se re-renderiza (auto-scroll)
```

## Flujo de conexión (v0.1)

```
useConnection se monta
       │
       ▼
Llama a api.healthCheck() tras 500ms
       │
       ├─ mock success → store.setConnectionStatus("connected")
       │
       ▼
Cada 30s: nuevo healthcheck automático
```

## Gestión de estado

Usamos **Zustand** por:
- Sin boilerplate (no Redux, no Context + reducers)
- Fuera de React (se puede leer/escribir desde servicios)
- Tipado completo con TypeScript
- Mínimo tamaño (~1KB)

Store única en v0.1. En v1.0 se separará si crece:
- `conversationStore` → mensajes + UI state
- `connectionStore` → conexión (si se complica)
- `userStore` → multiusuario
- `settingsStore` → preferencias

## Cómo conectar Idefix real

Cuando llegue el momento:

1. Definir el bridge endpoint real en `src/config/idefix.ts`.
2. Cambiar `FEATURE_FLAGS.useMockApi = false` en `src/constants.ts`.
3. Implementar `sendMessage()` real en `src/services/api.ts`.
4. Implementar healthcheck real en `src/services/api.ts`.
5. Opcional: conectar `audio.ts` para voz real.

El resto de la app no necesita cambios.

## Notas sobre decisiones técnicas

- **Expo Router** elegido sobre React Navigation por: file-based routing, esquema URI nativo, preparado para web.
- **Zustand** sobre Context API: sin re-renders innecesarios, accesible fuera de componentes.
- **Sin expo-router en _layout.tsx**: en v0.1 solo hay una pantalla. No necesitamos navegación compleja. Cuando llegue (historial, settings), se activa `<Slot />`.
- **index.ts no borra App.tsx**: Expo Router necesita que `index.ts` use `expo-router/entry` en lugar del `registerRootComponent` tradicional.
- **Configuración aislada**: `src/config/idefix.ts` centraliza todo lo que la app sabe sobre Idefix. Cambiar de entorno (dev/staging/prod) es cambiar un archivo.
