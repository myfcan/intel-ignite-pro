

# A1 Fix: `getAudioCurrentTime` getter para V7PhasePlayground

## Diagnostico (dados reais do codigo)

**`useV7AudioManager.ts` linhas 57-59 e 171-173:**
```typescript
const [currentTime, setCurrentTime] = useState(0);
// ...
const handleTimeUpdate = () => {
  setCurrentTime(audio.currentTime);
};
```

`currentTime` e React state atualizado pelo evento `timeupdate` do browser (~250ms de intervalo). Passar como prop numerica resultaria em valor potencialmente stale no instante exato dos eventos 3 e 4.

**Solucao: getter function** que le `mainAudioRef.current.currentTime` no instante da chamada.

---

## Alteracoes (3 arquivos)

### 1. `src/components/lessons/v7/v7-phase-contracts.ts` (linha 277)

Adicionar na interface `V7PhasePlaygroundProps`:

```typescript
// ANTES (linha 276-278):
  shouldPauseAudio?: boolean;
}

// DEPOIS:
  shouldPauseAudio?: boolean;
  /** Getter para currentTime real do audio (evita stale state) */
  getAudioCurrentTime?: () => number;
}
```

### 2. `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` (linha 1630)

Adicionar prop getter no render do Playground:

```typescript
// ANTES (linhas 1629-1631):
            lessonId={script.id}
            shouldPauseAudio={Boolean(isPausedByAnchor || c07AutoPaused)}
          />

// DEPOIS:
            lessonId={script.id}
            shouldPauseAudio={Boolean(isPausedByAnchor || c07AutoPaused)}
            getAudioCurrentTime={() => audio.currentTime}
          />
```

**Nota:** `audio` aqui e o retorno de `useV7AudioManager` (linha 557: `currentTime`). Porem, para o getter ser instantaneo, precisamos verificar se `audio.currentTime` no scope do render nao e o state. Verificacao: o return do hook na linha 555-558 retorna `currentTime` (state). Entao `() => audio.currentTime` captura o state, nao o ref.

**Correcao necessaria:** Expor um getter do ref real no hook. Alternativa mais simples: expor `getCurrentTime` no hook.

### 2b. `src/components/lessons/v7/cinematic/useV7AudioManager.ts`

Adicionar getter que le direto do ref (nao do state):

```typescript
// No return do hook (apos linha 558):
getCurrentTime: () => mainAudioRef.current?.currentTime ?? -1,
```

Entao no Player:

```typescript
getAudioCurrentTime={() => audio.getCurrentTime()}
```

### 3. `src/components/lessons/v7/cinematic/phases/V7PhasePlayground.tsx`

**3a.** Destructure (linha 43):
```typescript
// ANTES:
  shouldPauseAudio = false
// DEPOIS:
  shouldPauseAudio = false,
  getAudioCurrentTime = () => -1
```

**3b.** Evento SHOULD_PAUSE_TRANSITION (linhas 65-69):
```typescript
// ANTES:
pushV7DebugLog('SHOULD_PAUSE_TRANSITION', {
  prev,
  current: shouldPauseAudio,
  currentTime: -1, // V7AudioControl doesn't expose currentTime; use wallclock via `t`
});

// DEPOIS:
pushV7DebugLog('SHOULD_PAUSE_TRANSITION', {
  prev,
  current: shouldPauseAudio,
  currentTime: getAudioCurrentTime(),
});
```

**3c.** Evento PLAYGROUND_PAUSED_AUDIO (linhas 90-93):
```typescript
// ANTES:
pushV7DebugLog('PLAYGROUND_PAUSED_AUDIO', {
  shouldPauseAudio: true,
  currentTime: -1, // V7AudioControl doesn't expose currentTime; use wallclock via `t`
});

// DEPOIS:
pushV7DebugLog('PLAYGROUND_PAUSED_AUDIO', {
  shouldPauseAudio: true,
  currentTime: getAudioCurrentTime(),
});
```

---

## Resumo de arquivos

| Arquivo | Acao |
|---------|------|
| `useV7AudioManager.ts` | Adicionar `getCurrentTime` getter do ref |
| `v7-phase-contracts.ts` | Adicionar `getAudioCurrentTime?: () => number` |
| `V7PhasePlayer.tsx` | Passar `getAudioCurrentTime={() => audio.getCurrentTime()}` |
| `V7PhasePlayground.tsx` | Consumir getter nos 2 pushV7DebugLog |

## Criterio de aceite A1

Export JSON com 4 eventos onde `currentTime >= 0` e coerentes (delta < 0.2s entre ANCHOR e TRANSITION/PAUSED):

| Evento | currentTime esperado |
|--------|---------------------|
| PLAYGROUND_ENTRY | ~113.886, shouldPauseAudio=false |
| ANCHOR_PAUSE_EXECUTED | ~118.410 |
| SHOULD_PAUSE_TRANSITION | ~118.410 (era -1, corrigido) |
| PLAYGROUND_PAUSED_AUDIO | ~118.410 (era -1, corrigido) |

