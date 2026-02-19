
# Image Sequence Profissional: Plano Unificado Completo (Auditado contra codigo real)

## ACESSO AO REPO: SIM — Todos os arquivos abertos e verificados

---

## EVIDENCIAS FORENSES (verificadas nesta sessao)

| Item | Arquivo | Linha(s) | Trecho Real |
|------|---------|----------|-------------|
| MicroVisual z-index | V7MicroVisualOverlay.tsx | (confirmado) | `className="fixed inset-0 pointer-events-none z-50"` |
| ImageSequence z-index | V7ImageSequenceRenderer.tsx | 162 | `className="relative w-full aspect-video..."` -- NENHUM z-index |
| Botao Continuar z-index | V7PhasePlayer.tsx | 2055 | `className="...z-50"` |
| Phase content wrapper | V7PhasePlayer.tsx | 2014 | `className="absolute inset-0 flex..."` -- NENHUM z-index |
| useAnchorText aceita onTrigger | useAnchorText.ts | 82 | `onTrigger?: (action: AnchorAction) => void;` |
| useAnchorText executa trigger | useAnchorText.ts | 306-308 | `case 'trigger': onTrigger?.(action); break;` |
| Player NAO passa onTrigger | V7PhasePlayer.tsx | 481-516 | Fecha em L516 com `});` -- so passa onPause, onResume, onShow |
| AnchorAction payload | V7Contract.ts | 219 | `payload?: unknown;` |
| AnchorAction keywordTime | V7Contract.ts | 216 | `keywordTime?: number;` |
| V7ImageSequenceContent | V7Contract.ts | 425-427 | `{ frames: V7ImageSequenceFrame[] }` -- SEM displayMode |
| Renderer call no Player | V7PhasePlayer.tsx | 1302-1310 | `frames, effects, phaseId, currentTime` -- 4 props apenas |
| Renderer timer interno | V7ImageSequenceRenderer.tsx | 101,124-150 | `useState(0)` + `setTimeout(... frame.durationMs)` |
| currentPhase derivacao | V7PhasePlayer.tsx | 277-278 | `lockedPhaseIndex ?? rawCurrentPhaseIndex` |
| State insert point | V7PhasePlayer.tsx | 139 | Apos `debugQuizReason` |
| useEffect insert point | V7PhasePlayer.tsx | 557 | Fim do useEffect de lock |
| Seek-back no hook | useAnchorText.ts | 423-454 | Limpa executedActions, re-executa acoes `<= currentTime` |
| TriggerPoint source | useAnchorText.ts | 396 | `if (action.keywordTime !== undefined && action.keywordTime > 0)` |
| DryRun loop | v7-vv/index.ts | 2291 | `input.scenes.forEach((scene, index)` -- itera SCENES, nao phases |
| DryRun frames source | v7-vv/index.ts | 2559 | `const frames = content?.frames;` -- de `visual.content` |
| DryRun anchorActions | v7-vv/index.ts | 1461 | `anchorActions?: AnchorAction[]` -- campo da SCENE de input |
| Pipeline output hoist | v7-vv/index.ts | 5207-5208 | `frames` e copiado para raiz do visual no output |
| DebugLogger tags | v7DebugLogger.ts | 9-16 | Array com 6 tags existentes |
| FrameImage object class | V7ImageSequenceRenderer.tsx | 80 | `className="...object-cover rounded-lg"` -- hardcoded |
| Glow internal z-index | V7ImageSequenceRenderer.tsx | 165 | `z-10` (interno ao renderer) |
| Vignette internal z-index | V7ImageSequenceRenderer.tsx | 170 | `z-10` (interno ao renderer) |
| Dots internal z-index | V7ImageSequenceRenderer.tsx | 191 | `z-20` (interno ao renderer) |

---

## CORRECAO DE ERRO DO PLANO ANTERIOR

O plano anterior afirmava que o DryRun deveria usar `phase.anchorActions` em vez de `scene.anchorActions`. **Isso estava ERRADO.** Evidencia:

- O DryRun itera `input.scenes` (L2291), nao phases
- No DryRun, phases nao existem ainda -- so existem input scenes
- `anchorActions` e um campo da scene de input (L1461)
- Portanto, `scene.anchorActions` e o acesso correto no DryRun

---

## DIAGNOSTICO (5 pontos verificados)

1. **onTrigger existe no hook (L82, L306-308) mas o Player nao conecta (L481-516)**. Solucao: adicionar callback `onTrigger` na chamada do hook. ZERO mudanca no hook.

2. **currentPhase derivacao**: Depende de `lockedPhaseIndex ?? rawCurrentPhaseIndex` (L277). O useEffect de init deve depender de `currentPhase?.id` para evitar resets.

3. **displayMode path canonico**: Pipeline hoist `frames` para raiz do visual no output (L5207-5208). Player le `narrativeVisual.frames` (L1305). Portanto `displayMode` tambem na raiz. Leitura: `narrativeVisual.displayMode ?? 'fullscreen'`. SEM fallback `.content`.

4. **Seek/Jump**: O hook (L423-454) re-executa onTrigger para todas as acoes `<= currentTime` no seek-back. Multiplos `setImageSequenceFrameIndex` podem disparar. Solucao: useEffect derivado de `audio.currentTime` que recalcula deterministicamente usando `keywordTime` (L396).

5. **Payload safety**: `payload?: unknown` (L219). Type guard `isFrameTriggerPayload` elimina todo `as any`.

---

## DECISOES TECNICAS

- Source of truth do frame: **Player** (via onTrigger + seek resync)
- Renderer: **dumb component** (recebe activeFrameIndex)
- Timer: fallback APENAS quando `enableTimerFallback === true` e `activeFrameIndex === null`
- Camadas: imagem z-0, MicroVisuals z-50 (intacto), interacoes z-50 (intacto)
- displayMode canonico na raiz do visual
- Overlay policy: MicroVisuals `fixed inset-0 z-50` (viewport) -- intocado
- Frame trigger NAO reseta microVisuals (states completamente separados)

---

## IMPLEMENTACAO EM 3 FASES

### FASE 1 (CORE): Anchor Control + Controlled Renderer

#### 1A) `src/types/V7Contract.ts` (L425-427)

Adicionar `displayMode`:

```typescript
export interface V7ImageSequenceContent {
  frames: V7ImageSequenceFrame[];
  /**
   * CANONICAL: lives at visual root level (alongside frames).
   * NOT inside visual.content. Same pattern as frames[].
   */
  displayMode?: 'fullscreen' | 'mockup'; // default: 'fullscreen'
}
```

#### 1B) `src/components/lessons/v7/cinematic/phases/V7ImageSequenceRenderer.tsx`

Refatoracao completa (204 linhas -> controlled component):

**Nova interface (substitui L25-35):**

```typescript
interface V7ImageSequenceRendererProps {
  frames: ImageSequenceFrame[];
  activeFrameIndex: number | null;
  displayMode?: 'fullscreen' | 'mockup';
  enableTimerFallback?: boolean;
  fadeMs?: number;
  effects?: {
    mood?: string;
    glow?: boolean;
    particles?: boolean | string;
    vignette?: boolean;
  };
  phaseId: string;
  currentTime: number;
  phaseTitle?: string;
}
```

**Logica principal (substitui L95-203):**

- Calcula `displayIndex`:
  - Se `activeFrameIndex !== null`: usa `activeFrameIndex` (anchor mode)
  - Se `activeFrameIndex === null` e `enableTimerFallback === true`: timer interno via `setTimeout` usando `durationMs` (retrocompat -- logica atual preservada intacta)
  - Se `activeFrameIndex === null` e `enableTimerFallback === false`: default 0, log warning
- Crossfade: `transition={{ duration: (fadeMs ?? 800) / 1000 }}`
- Container master recebe **`z-0`** explicito
- Z-index internos preservados: glow `z-10`, vignette `z-10`, dots `z-20` (todos dentro do container z-0)

**FrameImage muda object class (L80):**

- Fullscreen: `object-cover` (atual)
- Mockup: `object-contain` (novo) -- recebe `displayMode` como prop

**MockupFrame (componente interno novo):**

```typescript
function MockupFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-zinc-900/95 rounded-2xl p-4 md:p-8 shadow-2xl">
      <div className="absolute top-3 left-4 flex gap-1.5 z-10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
      </div>
      <div className="w-full h-full mt-6 rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}
```

**Layout mockup desktop:**

- `displayMode === 'mockup'` e viewport `>= lg`: grid 2 colunas (`lg:grid-cols-[65%_35%]`), mockup a esquerda, titulo a direita
- Mobile: empilhado (titulo acima, mockup abaixo)
- `fullscreen`: render atual (aspect-video, object-cover, sem grid)

**Overlay policy comentario:**

```typescript
// OVERLAY POLICY (C12.1):
// MicroVisuals (z-50, fixed inset-0) anchor to viewport, NOT to this component.
// In mockup mode, overlays may appear over the title column -- intentional.
// The mockup frame (z-0) never obscures overlays.
```

**Debug logs:**

- `IMAGE_SEQUENCE_START`: `{ phaseId, mode: 'anchor'|'timer', frameCount, displayMode }`
- `IMAGE_SEQUENCE_FRAME_CHANGE`: `{ phaseId, fromIndex, toIndex, source: 'anchor'|'timer' }`

#### 1C) `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`

5 mudancas cirurgicas:

**C1) Type guard (antes do componente, nivel de modulo):**

```typescript
function isFrameTriggerPayload(payload: unknown): payload is { frameIndex: number } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'frameIndex' in payload &&
    typeof (payload as { frameIndex: unknown }).frameIndex === 'number'
  );
}
```

**C2) State (apos L139):**

```typescript
const [imageSequenceFrameIndex, setImageSequenceFrameIndex] = useState<number | null>(null);
const [imageSequenceTimerFallback, setImageSequenceTimerFallback] = useState(false);
```

**C3) onTrigger no useAnchorText (L515, antes do `});` em L516):**

```typescript
onTrigger: (action: AnchorAction) => {
  if (isFrameTriggerPayload(action.payload)) {
    setImageSequenceFrameIndex(action.payload.frameIndex);
    pushV7DebugLog('C12.1_IMAGE_SEQUENCE_FRAME_TRIGGER', {
      phaseId: currentPhase?.id,
      frameIndex: action.payload.frameIndex,
      keyword: action.keyword,
      currentTime: audio.currentTime,
    });
  }
},
```

**C4) useEffect de init/reset (apos L557):**

```typescript
useEffect(() => {
  if (!currentPhase) return;
  const narrativeVisual = (currentPhase as any).visual;
  if (narrativeVisual?.type !== 'image-sequence') {
    if (imageSequenceFrameIndex !== null) {
      setImageSequenceFrameIndex(null);
      setImageSequenceTimerFallback(false);
    }
    return;
  }
  const hasFrameTriggers = currentPhase.anchorActions?.some(
    (a: any) => a.type === 'trigger' && isFrameTriggerPayload(a.payload)
  );
  if (hasFrameTriggers) {
    setImageSequenceFrameIndex(0);
    setImageSequenceTimerFallback(false);
    pushV7DebugLog('C12.1_IMAGE_SEQUENCE_MODE_INIT', {
      phaseId: currentPhase.id, mode: 'anchor', currentTime: audio.currentTime,
    });
  } else {
    setImageSequenceFrameIndex(null);
    setImageSequenceTimerFallback(true);
    pushV7DebugLog('C12.1_IMAGE_SEQUENCE_MODE_INIT', {
      phaseId: currentPhase.id, mode: 'timer', currentTime: audio.currentTime,
    });
  }
}, [currentPhase?.id]);
```

**C5) Render atualizado (substitui L1302-1310):**

```typescript
if (narrativeVisual?.type === 'image-sequence' && narrativeVisual?.frames?.length > 0) {
  return (
    <V7ImageSequenceRenderer
      frames={narrativeVisual.frames}
      activeFrameIndex={imageSequenceFrameIndex}
      displayMode={narrativeVisual.displayMode ?? 'fullscreen'}
      enableTimerFallback={imageSequenceTimerFallback}
      fadeMs={800}
      effects={narrativeVisual.effects}
      phaseId={currentPhase.id}
      currentTime={hasAudio ? audio.currentTime : internalTime}
      phaseTitle={currentPhase.title}
    />
  );
}
```

---

### FASE 2 (ESTABILIDADE): Seek Resync Deterministico

#### `V7PhasePlayer.tsx` -- Novo useEffect (apos o init do Fase 1 C4):

```typescript
// SEEK RESYNC: Recalcula frame deterministicamente baseado em currentTime
// Garante que seek/jump atualiza o frame correto independente de onTrigger
useEffect(() => {
  if (imageSequenceFrameIndex === null) return; // modo timer, ignora
  if (!currentPhase?.anchorActions?.length) return;

  const frameTriggers = currentPhase.anchorActions
    .filter((a: any) => a.type === 'trigger' && isFrameTriggerPayload(a.payload))
    .map((a: any) => ({
      frameIndex: (a.payload as { frameIndex: number }).frameIndex,
      triggerTime: a.keywordTime ?? 0, // keywordTime e o campo canonico (useAnchorText.ts L396)
    }))
    .sort((a, b) => a.triggerTime - b.triggerTime);

  if (!frameTriggers.length) return;

  let correctFrame = 0;
  for (const ft of frameTriggers) {
    if (ft.triggerTime <= audio.currentTime) {
      correctFrame = ft.frameIndex;
    }
  }

  // Guard anti-loop: so atualiza se diferente
  if (correctFrame !== imageSequenceFrameIndex) {
    setImageSequenceFrameIndex(correctFrame);
    pushV7DebugLog('C12.1_IMAGE_SEQUENCE_SEEK_RESYNC', {
      phaseId: currentPhase.id,
      fromFrame: imageSequenceFrameIndex,
      toFrame: correctFrame,
      currentTime: audio.currentTime,
    });
  }
}, [audio.currentTime, imageSequenceFrameIndex, currentPhase?.id]);
```

**Performance**: Roda ~4x/s (timeupdate). Custo O(n) com n = triggers (max 3). Negligivel.

**Determinismo**: Nao depende de ordem de setState. Calcula resultado final e aplica uma vez.

---

### FASE 3 (GOVERNANCA): DryRun + Debug Tags

#### 3A) `supabase/functions/v7-vv/index.ts` -- Warnings (entre L2581 e L2582, dentro do `else` que ja tem `frames` em escopo)

**CONTEXTO REAL**: O DryRun itera `input.scenes` (L2291). `frames` vem de `content?.frames` (L2559). `anchorActions` vive na scene (L1461). O bloco `if (vType === 'image-sequence')` (L2555) esta dentro de `if (content)` (L2497). A variavel `frames` ja esta em escopo (L2559).

Inserir ANTES do `}` de fechamento em L2582:

```typescript
            // C12.1 WARNING: image-sequence without frame triggers
            if (frames.length >= 2) {
              const sceneAnchorActions = scene.anchorActions || [];
              const hasFrameTriggers = sceneAnchorActions.some(
                (a: any) => a.type === 'trigger' && typeof a.payload?.frameIndex === 'number'
              );
              if (!hasFrameTriggers) {
                issues.push({
                  severity: 'warning',
                  scene: sceneId,
                  field: 'anchorActions',
                  message: 'image-sequence com 2+ frames sem anchorActions trigger com payload.frameIndex -- usando fallback timer'
                });
              }
            }

            // C12.1 WARNING: promptScene with text indicators
            for (const frame of frames) {
              const ps = (frame.promptScene || '').toLowerCase();
              const textIndicators = ['"', 'r$', '#', 'copy:', 'texto:', 'escrito'];
              const found = textIndicators.filter((t: string) => ps.includes(t));
              if (found.length > 0) {
                issues.push({
                  severity: 'warning',
                  scene: sceneId,
                  field: `frames[${frame.id}].promptScene`,
                  message: `promptScene contem indicadores de texto (${found.join(', ')}) -- texto deve ser overlay via microVisual`
                });
              }
            }
```

#### 3B) `src/components/lessons/v7/cinematic/v7DebugLogger.ts` -- 3 tags novas (L9-16)

```typescript
export const V7_RUNTIME_CONTRACTS = [
  'C11_RUNTIME_ANCHOR_AUDIT',
  'C11_RAF_ANCHOR_TIMING',
  'C12.1_IMAGE_SEQUENCE_START',
  'C12.1_IMAGE_SEQUENCE_FRAME_RENDER',
  'C12.1_IMAGE_SEQUENCE_END',
  'C12.1_IMAGE_SEQUENCE_FALLBACK',
  'C12.1_IMAGE_SEQUENCE_FRAME_TRIGGER',   // NOVO
  'C12.1_IMAGE_SEQUENCE_MODE_INIT',       // NOVO
  'C12.1_IMAGE_SEQUENCE_SEEK_RESYNC',     // NOVO
] as const;
```

---

## NAO MEXER (CONFIRMADO COM EVIDENCIA)

| Arquivo | Motivo |
|---------|--------|
| `V7MicroVisualOverlay.tsx` | z-50 fixed, intacto |
| `useAnchorText.ts` | Ja suporta onTrigger (L82, L306-308), seek-back (L423-454). ZERO mudancas |
| Contratos C10/C10B/C03 | Nao impactados |
| Image Lab | Nao impactado |

---

## RETROCOMPATIBILIDADE

- Aulas sem anchorActions trigger: `imageSequenceFrameIndex = null` + `enableTimerFallback = true` -- timer por `durationMs`, comportamento identico ao atual
- `displayMode` default: `fullscreen` -- visual identico ao atual
- MicroVisuals: z-50 fixo, acima de tudo no renderer (z-0)
- Frame trigger NAO reseta microVisuals (states completamente separados: `imageSequenceFrameIndex` vs `visibleElements`/`activeMvRef`)

---

## FORMATO JSON ESPERADO (OUTPUT DO PIPELINE)

```json
{
  "visual": {
    "type": "image-sequence",
    "displayMode": "mockup",
    "frames": [
      { "id": "f1", "promptScene": "...", "durationMs": 3000, "storagePath": "..." },
      { "id": "f2", "promptScene": "...", "durationMs": 3000, "storagePath": "..." },
      { "id": "f3", "promptScene": "...", "durationMs": 3000, "storagePath": "..." }
    ]
  },
  "anchorActions": [
    { "id": "frame-1", "keyword": "friccao", "type": "trigger", "payload": { "frameIndex": 0 }, "once": true },
    { "id": "frame-2", "keyword": "foco", "type": "trigger", "payload": { "frameIndex": 1 }, "once": true },
    { "id": "frame-3", "keyword": "clareza", "type": "trigger", "payload": { "frameIndex": 2 }, "once": true }
  ]
}
```

---

## CHECKLIST DE TESTES

| ID | Teste | PASS | FAIL |
|----|-------|------|------|
| T1 | Anchor mode: 3 triggers, frames mudam por crossing | Frames mudam na keyword exata | Timer roda ou frames nao mudam |
| T2 | Timer fallback: sem triggers | durationMs + fade 800ms | Crash ou tela vazia |
| T3 | Z-index: MicroVisuals acima | Overlay z-50 visivel sobre imagem z-0 | Overlay atras da imagem |
| T4 | Mockup mode: device frame | object-contain, dots, rounded, fundo escuro | object-cover ou sem moldura |
| T5 | Anti-text DryRun | Warning se promptScene tem `"` ou `R$` | Sem warning |
| T6 | Seek-back resync | Seek para antes de "foco" volta frame 0 | Frame fica no indice antigo |
| T7 | Seek-forward resync | Seek para depois de "clareza" vai frame 2 | Frame nao atualiza |
| T8 | Payload invalido | `payload: { foo: "bar" }` nao causa crash | TypeError |
| T9 | Desktop mockup layout | 65/35 split, titulo lateral em tela >= lg | Espaco vago |
| T10 | Mobile mockup | Empilhado, titulo acima, mockup abaixo | Layout quebrado |
| T11 | Frame trigger nao reseta microVisual | MicroVisuals continuam visiveis apos troca de frame | MicroVisual desaparece |

---

## RESUMO DE ARQUIVOS POR FASE

| Fase | Arquivo | Mudanca |
|------|---------|---------|
| F1 | `src/types/V7Contract.ts` | +displayMode em V7ImageSequenceContent (L425-427) |
| F1 | `V7ImageSequenceRenderer.tsx` | Refatorar para controlled + MockupFrame + z-0 + layout mockup |
| F1 | `V7PhasePlayer.tsx` | Type guard + state + onTrigger (L515) + init useEffect (L557) + render (L1302) |
| F2 | `V7PhasePlayer.tsx` | useEffect de seek resync deterministico |
| F3 | `v7-vv/index.ts` | 2 warnings DryRun (triggers + texto) entre L2581-2582 |
| F3 | `v7DebugLogger.ts` | 3 tags novas no array (L9-16) |
| -- | `useAnchorText.ts` | ZERO mudancas |
| -- | `V7MicroVisualOverlay.tsx` | ZERO mudancas |
