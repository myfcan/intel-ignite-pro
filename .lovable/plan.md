

# Auditoria Forense: Plano Consolidado (Slides + Autoplay)

## Código Real Auditado

- `PartBScreen.tsx` (462 linhas)
- `useAnchorEvents.ts` (73 linhas)

---

## Fix 1 — Synthetic Anchors: 2 Gaps Identificados

### Gap 1A: Synthetic anchors não têm campos obrigatórios do tipo `StepAnchor`

O tipo `StepAnchor` (v10.types.ts linha 295) exige:
```typescript
export interface StepAnchor {
  id: string;
  step_id: string;
  anchor_type: AnchorType;
  timestamp_seconds: number;
  match_phrase: string;
  label: string | null;
}
```

O plano propõe criar objetos com apenas `anchor_type` e `timestamp_seconds`. Faltam `id`, `step_id`, `match_phrase`. O TypeScript vai rejeitar isso.

**Correção:** Gerar campos dummy: `id: crypto.randomUUID()`, `step_id: currentStep.id`, `match_phrase: ''`, `label: null`.

### Gap 1B: `firedRef` reset por referência de array

`useAnchorEvents.ts` linha 26-28:
```typescript
useEffect(() => {
  firedRef.current = new Set();
}, [anchors]);
```

O `useMemo` retorna referência estável quando deps não mudam, mas se `currentAnchors` (state via `setCurrentAnchors`) é atualizada com o mesmo conteúdo (ex: re-fetch), o `useMemo` recalcula, gerando nova referência → `firedRef` reseta → anchors re-disparam. Risco baixo pois o fetch só ocorre quando `currentStep.id` muda. **Sem correção necessária.**

### Plano Fix 1 está correto no restante

Lógica de distribuição: `interval = duration / frameCount`, timestamps em `interval * (i + 1)`, merge com sort. O handler `onTrocaFrame` (linha 141-144) faz `setCurrentFrameIndex(prev => prev + 1)`, ou seja, cada anchor dispara um incremento. Correto.

---

## Fix 2 — Autoplay: 1 Gap Real Identificado

### Gap 2A: `handleContinue` não pausa áudio antes de mudar step

Código real (linha 264-279):
```typescript
const handleContinue = useCallback(() => {
  if (!currentStep) return;
  if (currentFrameIndex < (currentStep.frames?.length ?? 1) - 1) {
    setCurrentFrameIndex((prev) => prev + 1);
  } else if (currentStepIndex < steps.length - 1) {
    setCurrentStepIndex((prev) => prev + 1);
    setCurrentFrameIndex(0);
    setCurrentTime(0);
  } else {
    onComplete();
  }
}, [...]);
```

O `useEffect` de audio load (linha 179-198) reage a `currentStepIndex` e faz:
```typescript
audio.src = currentStep.audio_url;
audio.playbackRate = playbackSpeed;
audio.load();
audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
```

**O autoplay JÁ funciona** quando o step muda — o `useEffect` chama `audio.play()`. Porém, o `.catch` silencia falhas. Como o usuário acabou de clicar "Continuar" (interação ativa), o browser permite autoplay. **O plano de "pausar antes" é uma melhoria de robustez, não um bug crítico.**

O gap real é: se `audio.load()` não completou quando `play()` é chamado, o play falha silenciosamente. Adicionar um listener `canplay` antes de chamar `play()` resolve isso.

### Correção proposta para robustez:
```typescript
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;
  if (currentStep?.audio_url) {
    audio.src = currentStep.audio_url;
    audio.playbackRate = playbackSpeed;
    audio.load();
    const onCanPlay = () => {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      audio.removeEventListener('canplay', onCanPlay);
    };
    audio.addEventListener('canplay', onCanPlay);
    return () => audio.removeEventListener('canplay', onCanPlay);
  }
  // ...
}, [currentStepIndex, currentStep?.audio_url]);
```

---

## Resumo Final: Alterações Necessárias

| Arquivo | Mudança | Linhas aprox. |
|---------|---------|--------------|
| `PartBScreen.tsx` | 1. Adicionar `useMemo` para `effectiveAnchors` com synthetic `troca_frame` (campos completos do tipo `StepAnchor`) | Após linha 115 |
| `PartBScreen.tsx` | 2. Passar `effectiveAnchors` ao `useAnchorEvents` (linha 153) | 153 |
| `PartBScreen.tsx` | 3. No `handleContinue`, pausar áudio e resetar `isPlaying` antes de avançar step | 270-274 |
| `PartBScreen.tsx` | 4. No `useEffect` de audio load, usar `canplay` event para garantir play confiável | 179-198 |

Nenhuma migration SQL. Nenhuma edge function. Correção puramente frontend em 1 arquivo.

