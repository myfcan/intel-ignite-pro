
# Plano de Correção: V7LessonPlayer para Contrato C06/C06.1

**Objetivo:** Atualizar o Renderer V7LessonPlayer.tsx para usar exclusivamente `anchorActions[type='show'].keywordTime` como fonte de verdade para micro-visuals, removendo dependência de `microVisual.triggerTime` (removido pelo Pipeline C06).

---

## Diagnóstico do Estado Atual

### Código Quebrado (V7LessonPlayer.tsx:169-182)
```typescript
// ❌ PROBLEMA: triggerTime pode ser undefined após C06
const active = currentPhase.microVisuals.filter(mv => {
  const isAfterTrigger = currentTime >= mv.triggerTime;  // ❌ undefined
  const isBeforeEnd = currentTime < mv.triggerTime + mv.duration;
  return isAfterTrigger && isBeforeEnd;
});
```

### Contrato C06 do Pipeline
- `metadata.triggerContract = 'anchorActions'`
- `microVisual.triggerTime` é **removido** do JSON final
- `anchorActions[type='show'].targetId` aponta para `microVisual.id`
- `anchorActions[type='show'].keywordTime` contém o timestamp

### Run IDs de Teste
- `d7c18708-43f0-4488-98fd-bbe71f37140a` (show_actions=19, trigger_time=0)
- `e78c5da4-a9ba-4c62-9a45-db1b960fca0b` (verificação adicional)

---

## Fase 1: Contrato + Instrumentação Mínima

### Objetivo
Preparar o código para C06 sem quebrar compatibilidade com aulas legadas.

### Tarefas

#### 1.1 V7Contract.ts (Linha 173)
Tornar `triggerTime` opcional:
```typescript
export interface V7MicroVisual {
  id: string;
  type: V7MicroVisualType;
  anchorText: string;
  triggerTime?: number;  // ← MUDAR para opcional (C06)
  duration: number;
  content: { ... };
}
```

#### 1.2 V7LessonPlayer.tsx - Adicionar Refs
Inserir após as refs existentes (linha ~56):
```typescript
// C06 Compatibility: Refs para crossing detection (não usar state para evitar loops)
const prevTimeRef = useRef<number>(0);
const triggeredIdsRef = useRef<Set<string>>(new Set());
const prevPhaseIndexRef = useRef<number>(-1);
```

#### 1.3 V7LessonPlayer.tsx - Logs de Debug
Adicionar logs no efeito de phase change (linha ~136):
```typescript
if (i !== currentPhaseIndex) {
  console.log(`[V7Player] Phase change: ${currentPhaseIndex} → ${i} (${phase.id})`);
  // C06: Log de instrumentação
  if (process.env.NODE_ENV === 'development') {
    console.log('[V7Player] phase change reset', { from: currentPhaseIndex, to: i });
  }
  setCurrentPhaseIndex(i);
}
```

Adicionar log throttled no time tracking (linha ~106):
```typescript
if (mainAudioRef.current) {
  const newTime = mainAudioRef.current.currentTime;
  setCurrentTime(newTime);
  // C06: Log throttled (apenas a cada 1s em dev)
  if (process.env.NODE_ENV === 'development' && Math.floor(newTime) !== Math.floor(currentTime)) {
    console.log(`[V7Player] currentTime: ${newTime.toFixed(2)}s`);
  }
}
```

### Checklist Fase 1
- [ ] TypeScript compila sem erros
- [ ] Player roda com aulas antigas (com triggerTime) sem regressão
- [ ] Logs aparecem no console: "phase change reset" + "currentTime"

### Risco Conhecido
- Nenhum (apenas preparação, sem mudança de comportamento)

---

## Fase 2: Engine de "show" por anchorActions (Crossing Detection)

### Objetivo
Substituir dependência de `mv.triggerTime` por `anchorActions[type='show']`.

### Tarefas

#### 2.1 Criar Helper: showTimeByTargetId
Adicionar após a linha do `currentPhase` memo (linha ~59):
```typescript
// C06: Mapa de targetId → keywordTime (fonte de verdade)
const showTimeByTargetId = useMemo(() => {
  const map = new Map<string, number>();
  if (!currentPhase?.anchorActions) return map;
  
  for (const aa of currentPhase.anchorActions) {
    if (aa.type === 'show' && aa.targetId && typeof aa.keywordTime === 'number') {
      map.set(aa.targetId, aa.keywordTime);
    }
  }
  return map;
}, [currentPhase?.anchorActions]);
```

#### 2.2 Implementar Crossing Detection
Substituir o efeito de MICRO-VISUALS (linhas 168-182) por:
```typescript
// =========================================================================
// MICRO-VISUALS (C06 Compliant - Crossing Detection)
// =========================================================================
useEffect(() => {
  if (!currentPhase) return;
  if (status !== 'playing') {
    prevTimeRef.current = currentTime;
    return;
  }

  const prevTime = prevTimeRef.current;

  // C06: SEEK BACKWARDS - Reset triggers e recomputar
  if (currentTime < prevTime) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[V7Player] seek backwards recompute', { prevTime, currentTime });
    }
    triggeredIdsRef.current = new Set();
    
    // Reprocessar todos os shows <= currentTime
    for (const [targetId, t] of showTimeByTargetId.entries()) {
      if (t <= currentTime) {
        triggeredIdsRef.current.add(targetId);
      }
    }
    prevTimeRef.current = currentTime;
    return;
  }

  // C06: PLAY FORWARD - Crossing detection
  for (const [targetId, t] of showTimeByTargetId.entries()) {
    const crossed = prevTime < t && currentTime >= t;
    if (crossed && !triggeredIdsRef.current.has(targetId)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[V7Player] show crossed', { 
          phaseId: currentPhase.id, 
          targetId, 
          t: t.toFixed(2), 
          prevTime: prevTime.toFixed(2), 
          currentTime: currentTime.toFixed(2) 
        });
      }
      triggeredIdsRef.current.add(targetId);
    }
  }

  prevTimeRef.current = currentTime;
}, [currentTime, status, currentPhase, showTimeByTargetId]);
```

#### 2.3 Adicionar Reset no Phase Change
Adicionar efeito para reset ao trocar de fase:
```typescript
// C06: Reset ao trocar de fase (evitar "fantasmas")
useEffect(() => {
  if (currentPhaseIndex !== prevPhaseIndexRef.current) {
    triggeredIdsRef.current = new Set();
    prevTimeRef.current = currentTime;
    prevPhaseIndexRef.current = currentPhaseIndex;
    setActiveMicroVisuals([]);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[V7Player] phase reset', { phaseIndex: currentPhaseIndex });
    }
  }
}, [currentPhaseIndex, currentTime]);
```

### Checklist Fase 2
- [ ] Com run_id d7c..., logs mostram "show crossed" para targetIds
- [ ] Seek para trás + play novamente: shows acontecem de novo
- [ ] Sem loop de re-render (verificar console)

### Risco Conhecido
- MicroVisuals ainda não aparecem visualmente (será tratado na Fase 3)

---

## Fase 3: Render de MicroVisuals (Timed vs Sticky)

### Objetivo
MicroVisuals aparecem de fato e letter-reveal mantém efeito consistente (sticky).

### Tarefas

#### 3.1 Definir Tipos Sticky
Adicionar helper no início do componente:
```typescript
// C06: Tipos que permanecem até o fim da fase (sticky)
const isStickyType = (type: string) =>
  type === 'letter-reveal' || 
  type === 'card-reveal' || 
  type === 'text-highlight' || 
  type === 'highlight';
```

#### 3.2 Calcular activeMicroVisuals (C06-Compliant)
Adicionar novo efeito após o crossing detection:
```typescript
// =========================================================================
// COMPUTE ACTIVE MICRO-VISUALS (C06 Compliant)
// =========================================================================
useEffect(() => {
  if (!currentPhase?.microVisuals?.length) {
    setActiveMicroVisuals([]);
    return;
  }

  // Helper: obter tempo do show (C06: anchorActions | fallback: triggerTime legado)
  const getShowTime = (mv: V7MicroVisual): number | null => {
    // C06: Fonte primária = anchorActions
    const anchorTime = showTimeByTargetId.get(mv.id);
    if (typeof anchorTime === 'number') return anchorTime;
    
    // Fallback para lessons antigas (compatibilidade)
    if (typeof mv.triggerTime === 'number') return mv.triggerTime;
    
    return null;
  };

  const active = currentPhase.microVisuals.filter(mv => {
    // C06: Só mostra se o trigger foi disparado
    if (!triggeredIdsRef.current.has(mv.id)) return false;
    
    const showTime = getShowTime(mv);
    if (showTime === null) return false;
    
    // Sticky types: ficam até o fim da fase
    if (isStickyType(mv.type)) {
      return currentTime >= showTime;
    }
    
    // Timed types: respeitam duration
    const endTime = showTime + (typeof mv.duration === 'number' ? mv.duration : 0);
    return currentTime >= showTime && currentTime < endTime;
  });

  setActiveMicroVisuals(active);
}, [currentTime, currentPhase, showTimeByTargetId]);
```

#### 3.3 Verificar Reset Completo
Garantir que o reset de fase (Fase 2.3) está funcionando:
```typescript
// No efeito de phase reset (já adicionado na Fase 2)
triggeredIdsRef.current = new Set();
prevTimeRef.current = currentTime;
setActiveMicroVisuals([]);  // ← CRÍTICO: Limpar visuais ativos
```

### Checklist Fase 3
- [ ] image-flash/text-pop/number-count aparecem no tempo correto
- [ ] letter-reveal (PERFEITO) aparece e permanece (sticky)
- [ ] Sem microVisual "fantasma" ao trocar de fase
- [ ] Seek backwards funciona corretamente

### Risco Conhecido
- letter-reveal no V7MicroVisualOverlay.tsx pode precisar de ajustes visuais (fora do escopo desta correção)

---

## Fase 4: Base do C07 - "Pause Contract"

### Objetivo
Garantir que fases interativas pausam corretamente usando crossing detection.

### Tarefas

#### 4.1 Implementar Crossing Detection para Pause
Substituir o efeito ANCHOR ACTIONS (PAUSE) (linhas 148-164) por:
```typescript
// =========================================================================
// ANCHOR ACTIONS - PAUSE (C07 Base: Crossing Detection)
// =========================================================================
const pauseTriggeredRef = useRef<Set<string>>(new Set());

useEffect(() => {
  if (status !== 'playing' || !currentPhase?.anchorActions) return;

  const prevTime = prevTimeRef.current;

  for (const action of currentPhase.anchorActions) {
    if (action.type === 'pause' && action.id) {
      // C07: Crossing detection (idempotente)
      const crossed = prevTime < action.keywordTime && currentTime >= action.keywordTime;
      
      if (crossed && !pauseTriggeredRef.current.has(action.id)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[V7Player] pause crossed', { 
            phaseId: currentPhase.id,
            actionId: action.id,
            keyword: action.keyword, 
            keywordTime: action.keywordTime?.toFixed(2),
            currentTime: currentTime.toFixed(2)
          });
          console.log('[V7Player] entering waiting-interaction...');
        }
        
        pauseTriggeredRef.current.add(action.id);
        mainAudioRef.current?.pause();
        setStatus('waiting-interaction');
        break;
      }
    }
  }
}, [currentTime, status, currentPhase]);
```

#### 4.2 Reset pauseTriggeredRef ao Trocar de Fase
Atualizar o efeito de reset de fase:
```typescript
useEffect(() => {
  if (currentPhaseIndex !== prevPhaseIndexRef.current) {
    triggeredIdsRef.current = new Set();
    pauseTriggeredRef.current = new Set();  // ← ADICIONAR
    prevTimeRef.current = currentTime;
    prevPhaseIndexRef.current = currentPhaseIndex;
    setActiveMicroVisuals([]);
    
    // ...logs
  }
}, [currentPhaseIndex, currentTime]);
```

#### 4.3 Fallback para Fases Interativas sem Pause Action
Adicionar lógica de fallback (TODO comentado para futuro):
```typescript
// TODO (C07): Fallback para fases interaction/playground sem pause action
// Se phase.type === 'interaction' || 'playground' e não há pause actions:
// Pausar automaticamente no startTime + 0.1s
```

### Checklist Fase 4
- [ ] Quiz não "passa reto": player entra em waiting-interaction
- [ ] Playground: usuário tem tempo de clicar
- [ ] Seek backwards: pauses são rearmados
- [ ] Logs aparecem: "pause crossed" + "entering waiting-interaction"

### Risco Conhecido
- Fases sem `anchorAction[type='pause']` ainda podem "passar reto" (C07 completo tratará isso)

---

## Resumo de Arquivos Modificados

| Arquivo | Modificações |
|---------|--------------|
| `src/types/V7Contract.ts` | `triggerTime?: number` (opcional) |
| `src/components/lessons/v7/V7LessonPlayer.tsx` | Crossing detection, sticky rules, reset, logs |

## Critério DONE Final

```
DONE = (
  Run d7c...: microVisuals aparecem (sem triggerTime) AND
  Run d7c...: PERFEITO funciona (sticky) AND
  Run d7c...: quiz/playground não passam reto AND
  Run e78c...: interações continuam ok AND
  Seek backwards funciona AND
  Nenhum erro TS/build AND
  Logs de crossing detection aparecem em dev
)
```

---

## Seção Técnica: Diagrama de Fluxo

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    V7LessonPlayer - C06 Flow                         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  currentTime (100ms interval)                                        │
│        │                                                             │
│        ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │ Crossing Detection Engine                                    │     │
│  │                                                              │     │
│  │  if (currentTime < prevTime) {                               │     │
│  │    // SEEK BACKWARDS                                         │     │
│  │    triggeredIdsRef.current = new Set();                      │     │
│  │    for each show <= currentTime: add to set                  │     │
│  │  } else {                                                    │     │
│  │    // PLAY FORWARD                                           │     │
│  │    for each show where prevTime < t <= currentTime:          │     │
│  │      triggeredIdsRef.current.add(targetId);                  │     │
│  │  }                                                           │     │
│  └─────────────────────────────────────────────────────────────┘     │
│        │                                                             │
│        ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │ Compute Active MicroVisuals                                  │     │
│  │                                                              │     │
│  │  filter(mv => {                                              │     │
│  │    if (!triggeredIdsRef.has(mv.id)) return false;            │     │
│  │    if (isStickyType(mv.type)) return currentTime >= t;       │     │
│  │    return currentTime >= t && currentTime < t + duration;    │     │
│  │  })                                                          │     │
│  └─────────────────────────────────────────────────────────────┘     │
│        │                                                             │
│        ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │ V7MicroVisualOverlay                                         │     │
│  │   - Renderiza activeMicroVisuals                             │     │
│  │   - AnimatePresence gerencia enter/exit                      │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    Phase Change Reset Flow                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  currentPhaseIndex changes                                           │
│        │                                                             │
│        ▼                                                             │
│  if (currentPhaseIndex !== prevPhaseIndexRef.current) {              │
│    triggeredIdsRef.current = new Set();      // limpa shows          │
│    pauseTriggeredRef.current = new Set();    // rearma pauses        │
│    setActiveMicroVisuals([]);                // limpa visuals        │
│    prevPhaseIndexRef.current = currentPhaseIndex;                    │
│  }                                                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```
