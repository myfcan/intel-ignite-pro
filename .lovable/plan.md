

# A1-v3 Patch Final — Codigo exato baseado no estado atual dos arquivos

## Estado atual confirmado (leitura real)

- `useV7AudioManager.ts` linha 593: `getCurrentTime: () => mainAudioRef.current?.currentTime ?? -1` -- OK, existe.
- `v7-phase-contracts.ts` linha 279: `getAudioCurrentTime?: () => number` -- OK, existe.
- `V7PhasePlayer.tsx` linha 1631: `getAudioCurrentTime={() => audio.getCurrentTime()}` -- OK, existe.
- `V7PhasePlayground.tsx` linha 44: `getAudioCurrentTime = () => -1` -- OK, existe.

## 3 alteracoes necessarias (2 arquivos)

### Alteracao 1: `V7PhasePlayer.tsx` linhas 1577-1585 — PLAYGROUND_ENTRY com getter + inPhase

Codigo ATUAL (linha 1581):
```typescript
currentTime: audio.currentTime,
```

Codigo NOVO (linhas 1577-1587):
```typescript
const _pgCurrentTime = audio.getCurrentTime();
const _pgEntryPayload = {
  phaseId: currentPhase.id,
  startTime: currentPhase.startTime,
  endTime: currentPhase.endTime,
  currentTime: _pgCurrentTime,
  inPhase: _pgCurrentTime >= (currentPhase.startTime ?? 0) &&
           _pgCurrentTime <= (currentPhase.endTime ?? Infinity),
  isPausedByAnchor,
  c07AutoPaused,
  shouldPauseAudio: Boolean(isPausedByAnchor || c07AutoPaused),
};
```

Corrige objecao (A): `audio.currentTime` era React state (stale ~250ms). `audio.getCurrentTime()` le o ref instantaneo. `inPhase` prova que o audio esta dentro dos bounds da fase.

### Alteracao 2: `V7PhasePlayer.tsx` apos linha 610 — novo useEffect edge-triggered

Inserir APOS linha 610 (fim do bloco C07.2 legacy fallback):
```typescript
// A1-v3: Edge-triggered log quando isPausedByAnchor transiciona false->true
const prevPausedByAnchorRef = useRef<boolean>(false);
useEffect(() => {
  const prev = prevPausedByAnchorRef.current;
  const next = Boolean(isPausedByAnchor);
  if (!prev && next) {
    pushV7DebugLog('PLAYER_PAUSE_STATE_TRUE', {
      phaseId: currentPhase?.id ?? null,
      isPausedByAnchor: true,
      c07AutoPaused: Boolean(c07AutoPaused),
      shouldPauseAudio: true,
      currentTime: audio.getCurrentTime(),
    });
  }
  prevPausedByAnchorRef.current = next;
}, [isPausedByAnchor, c07AutoPaused, currentPhase?.id, audio]);
```

Corrige objecao (B): preenche o buraco causal entre ANCHOR_PAUSE_EXECUTED e SHOULD_PAUSE_TRANSITION. Deps array inclui todos os valores lidos dentro do callback conforme exigido pelo CTO.

### Alteracao 3: `V7PhasePlayground.tsx` — 3 sub-alteracoes

**3a. Linha 62: `prevShouldPauseRef` inicializado com prop**

ATUAL:
```typescript
const prevShouldPauseRef = useRef<boolean | null>(null);
```
NOVO:
```typescript
const prevShouldPauseRef = useRef<boolean>(shouldPauseAudio);
```

Corrige objecao (D): `prev:null` nao aparece mais. O ref comeca com o valor real da prop no mount.

**3b. Linhas 63-74: SHOULD_PAUSE_TRANSITION com `audioIsPlaying` + deps corretas**

ATUAL:
```typescript
useEffect(() => {
  const prev = prevShouldPauseRef.current;
  if (prev !== shouldPauseAudio) {
    console.log(`[V7PhasePlayground] 🔄 shouldPauseAudio: ${prev} -> ${shouldPauseAudio}`);
    pushV7DebugLog('SHOULD_PAUSE_TRANSITION', {
      prev,
      current: shouldPauseAudio,
      currentTime: getAudioCurrentTime(),
    });
    prevShouldPauseRef.current = shouldPauseAudio;
  }
}, [shouldPauseAudio]);
```

NOVO:
```typescript
useEffect(() => {
  if (prevShouldPauseRef.current !== shouldPauseAudio) {
    const prev = prevShouldPauseRef.current;
    console.log(`[V7PhasePlayground] 🔄 shouldPauseAudio: ${prev} -> ${shouldPauseAudio}`);
    pushV7DebugLog('SHOULD_PAUSE_TRANSITION', {
      prev,
      current: shouldPauseAudio,
      currentTime: getAudioCurrentTime(),
      audioIsPlaying: audioControlRef.current?.isPlaying ?? null,
    });
    prevShouldPauseRef.current = shouldPauseAudio;
  }
}, [shouldPauseAudio, getAudioCurrentTime]);
```

Adiciona `audioIsPlaying` para contexto e `getAudioCurrentTime` nos deps.

**3c. Linhas 82-98: Pausa efetiva vs redundante (eventos separados)**

ATUAL:
```typescript
const pauseAudio = async () => {
  // Tentar pausar se ainda tocando
  if (ctrl.isPlaying) {
    if (ctrl.pauseWithFade) {
      await ctrl.pauseWithFade(300);
    } else {
      ctrl.pause();
    }
    setAudioPausedByPlayground(true);
  }
  // CRITICAL: Logar SEMPRE que shouldPauseAudio=true, mesmo que audio já esteja pausado pelo anchor
  console.log('[V7PhasePlayground] 🔇 Audio pausado por anchor/fallback (shouldPauseAudio=true)');
  pushV7DebugLog('PLAYGROUND_PAUSED_AUDIO', {
    shouldPauseAudio: true,
    audioWasPlaying: ctrl.isPlaying,
    currentTime: getAudioCurrentTime(),
  });
};
```

NOVO:
```typescript
const pauseAudio = async () => {
  const wasPlaying = Boolean(ctrl.isPlaying);
  if (wasPlaying) {
    if (ctrl.pauseWithFade) {
      await ctrl.pauseWithFade(300);
    } else {
      ctrl.pause();
    }
    setAudioPausedByPlayground(true);
  }
  console.log(
    `[V7PhasePlayground] Audio ${wasPlaying ? 'PAUSED by playground' : 'already paused by anchor'}`
  );
  pushV7DebugLog(
    wasPlaying ? 'PLAYGROUND_PAUSED_AUDIO' : 'PLAYGROUND_AUDIO_ALREADY_PAUSED',
    {
      shouldPauseAudio: true,
      audioWasPlaying: wasPlaying,
      currentTime: getAudioCurrentTime(),
    }
  );
};
```

Corrige objecao (C): captura `wasPlaying` ANTES da chamada `pause()`, e separa os eventos para distinguir pausa efetiva de redundante.

## Resumo de impacto

| Arquivo | Linhas | Mudanca | Risco |
|---------|--------|---------|-------|
| V7PhasePlayer.tsx | 1577-1585 | `getCurrentTime()` + `inPhase` | Zero (log only) |
| V7PhasePlayer.tsx | apos 610 | Novo `PLAYER_PAUSE_STATE_TRUE` edge-triggered | Zero (novo useEffect readonly) |
| V7PhasePlayground.tsx | 62 | `useRef<boolean>(shouldPauseAudio)` | Zero |
| V7PhasePlayground.tsx | 63-74 | `audioIsPlaying` + deps | Zero |
| V7PhasePlayground.tsx | 82-98 | PAUSED vs ALREADY_PAUSED | Zero (mesma logica, nomes distintos) |

## Criterio de aceite A1-v3

JSON exportado de `window.__v7debugLogs` deve conter:

1. **PLAYGROUND_ENTRY**: `inPhase: true`, `currentTime <= endTime + 0.05`
2. **ANCHOR_PAUSE_EXECUTED** e **PLAYER_PAUSE_STATE_TRUE**: ambos com `currentTime` ~118.41 (+-0.15s), delta wallclock `t` <= 200ms
3. **SHOULD_PAUSE_TRANSITION**: `currentTime` ~118.41 (+-0.15s), `audioIsPlaying` presente
4. **PLAYGROUND_PAUSED_AUDIO** ou **PLAYGROUND_AUDIO_ALREADY_PAUSED**: `currentTime` ~118.41 (+-0.15s)

Condicoes globais: nenhum `currentTime = -1`, `t` monotonicamente crescente.

## Entregaveis pos-implementacao

1. JSON bruto exportado do `window.__v7debugLogs` (sem recorte)
2. Screenshot do Debug HUD no momento do pause
3. Commit com apenas V7PhasePlayer.tsx e V7PhasePlayground.tsx

