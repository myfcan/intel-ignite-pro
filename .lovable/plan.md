

# Plano de Correcao: Canonizar `scenes[]` — Contrato C03 Resolvido

**Decisao do CTO:** `scenes[]` no root e o input oficial. O pipeline compila `scenes[]` para `phases[]` com sub-array `scenes` populado. `phase.visual` passa a ser artefato derivado (compilado da primeira cena).

---

## Contexto Tecnico

Hoje existe uma inconsistencia estrutural:

- O **input** (`V7ScriptInput`) ja tem `scenes[]` como campo obrigatorio (e funciona)
- O **pipeline** converte cada `scene` em uma `phase`, mas NUNCA popula `phase.scenes[]`
- O **renderer** (`V7PhaseController`) tenta ler `phase.scenes` mas recebe array vazio
- O **fallback** via `phase.visual` funciona, mas perde granularidade de auditoria e segmentacao temporal

### Impacto no AnchorText

- **Positivo**: Com `scenes[]` populado, cada `anchorText` vive num escopo menor (uma cena dentro da phase), reduzindo ambiguidade em narrações longas
- **Sem breaking change**: O matching de anchors continua sendo feito por `wordTimestamps` + `anchorActions` — a presenca de `scenes[]` nao altera essa logica, apenas melhora a rastreabilidade ("anchor X pertence a cena Y da phase Z")

---

## Alteracoes Necessarias

### 1. V7Contract.ts — Adicionar `scenes` ao `V7Phase`

**Arquivo:** `src/types/V7Contract.ts`

Adicionar campo tipado na interface `V7Phase`:

```typescript
export interface V7Phase {
  id: string;
  title: string;
  type: V7PhaseType;
  startTime: number;
  endTime: number;
  visual: V7VisualContent;        // Artefato compilado (derivado da cena)
  scenes: V7Scene[];              // NOVO: Sub-cenas com timing granular
  effects?: V7PhaseEffects;
  microVisuals?: V7MicroVisual[];
  anchorActions?: V7AnchorAction[];
  interaction?: V7Interaction;
  audioBehavior?: V7AudioBehavior; // Tambem atualizar tipo para usar interface completa
  timeout?: V7TimeoutConfig;
}
```

Enriquecer `V7Scene` com campos que o renderer precisa:

```typescript
export interface V7Scene {
  id: string;
  type: string;
  startTime: number;      // Obrigatorio (antes era opcional)
  endTime: number;         // NOVO
  duration: number;        // Obrigatorio (antes era opcional)
  narration: string;       // NOVO: texto narrado desta cena
  content: Record<string, unknown>;
  animation?: V7AnimationType;
}
```

---

### 2. Pipeline v7-vv/index.ts — Popular `phase.scenes[]`

**Arquivo:** `supabase/functions/v7-vv/index.ts`

Na construcao da Phase (em torno da linha 5197), ADICIONAR a geracao de `scenes[]` com 1 scene por phase (modelo 1:1 atual):

```typescript
const phase: Phase = {
  id: scene.id,
  title: scene.title,
  type: persistiblePhaseType,
  startTime,
  endTime,
  visual: { /* ... como ja esta ... */ },
  // NOVO C03: Popular scenes[] — 1:1 com phase (scene completa)
  scenes: [{
    id: `${scene.id}-s1`,
    type: scene.type,
    startTime,
    endTime,
    duration: endTime - startTime,
    narration: scene.narration,
    content: scene.visual.content || {},
    animation: scene.visual.effects?.particles ? 'particle-burst' : 'fade',
  }],
  effects: scene.visual.effects,
  // ... resto igual
};
```

Isso garante que TODA phase tera pelo menos 1 scene, eliminando o array vazio.

---

### 3. Compatibilidade Temporaria (Auto-conversao)

**Arquivo:** `supabase/functions/v7-vv/index.ts`

Adicionar um guard de compatibilidade no inicio do pipeline (apos validacao). Se um input antigo vier sem `scenes[]` populadas no output (reprocess de aula legacy), o pipeline auto-converte:

```typescript
// C03 COMPAT GUARD: Se phases ja existem (reprocess) mas nao tem scenes[], auto-converter
if (preserveStructureMode && existingContent?.phases) {
  existingContent.phases = existingContent.phases.map(phase => ({
    ...phase,
    scenes: phase.scenes?.length > 0 ? phase.scenes : [{
      id: `${phase.id}-s1-auto`,
      type: phase.type,
      startTime: phase.startTime,
      endTime: phase.endTime,
      duration: phase.endTime - phase.startTime,
      narration: '', // Legacy: narration nao disponivel
      content: phase.visual?.content || {},
    }],
  }));
  console.log('[C03_COMPAT] Auto-converted legacy phases without scenes[]');
}
```

Prazo de compatibilidade: 60 dias (ate ~2026-04-18). Apos isso, o guard sera removido e aulas sem `scenes[]` falharao no audit gate.

---

### 4. Audit Gate — Adicionar validacao C03

**Arquivo:** `supabase/functions/audit-contracts/index.ts`

Adicionar contrato C03 no audit:

```typescript
// C03: Scenes Array Integrity
const c03Result = { passed: true, details: '' };
const phasesWithoutScenes = phases.filter(p => !p.scenes || p.scenes.length === 0);
if (phasesWithoutScenes.length > 0) {
  c03Result.passed = false;
  c03Result.details = `${phasesWithoutScenes.length} phases sem scenes[]: ${phasesWithoutScenes.map(p => p.id).join(', ')}`;
}
// Validar que scene.startTime/endTime estao dentro dos bounds da phase
phases.forEach(phase => {
  (phase.scenes || []).forEach(scene => {
    if (scene.startTime < phase.startTime || scene.endTime > phase.endTime) {
      c03Result.passed = false;
      c03Result.details += ` | Scene ${scene.id} fora dos bounds da phase ${phase.id}`;
    }
  });
});
```

---

### 5. Renderer — Remover fallback e usar `scenes[]` diretamente

**Arquivo:** `src/components/lessons/v7/cinematic/phases/V7PhaseController.tsx`

Atualizar a linha 439:

```typescript
// ANTES (fallback para array vazio):
const phaseScenes = currentPhase?.scenes || [];

// DEPOIS (scenes[] agora e garantido pelo pipeline):
const phaseScenes = currentPhase?.scenes ?? [];
// Log de warning se vazio (nao deveria acontecer com C03 ativo)
if (phaseScenes.length === 0) {
  console.warn(`[C03] Phase ${currentPhase?.id} has empty scenes[] — possible legacy content`);
}
```

**Arquivo:** `src/components/lessons/v7/state/v7PlayerMachine.ts`

O `scaledScenes` na linha 156 ja funciona corretamente — apenas garantir que nao quebra com scenes[] populado (ja compativel).

---

### 6. AdminContracts.tsx — Atualizar status do C03

**Arquivo:** `src/pages/AdminContracts.tsx`

```typescript
{
  id: 'C03',
  name: 'Scenes Array',
  status: 'ACTIVE',  // <-- era KNOWN_GAP
  category: 'Pipeline',
  icon: <CheckCircle className="w-4 h-4" />,
  summary: 'Cada phase DEVE conter scenes[] populado (min 1 scene). Input oficial e scenes[], phase.visual e artefato compilado.',
  invariants: [
    'scenes[].length >= 1 por phase',
    'scene.startTime >= phase.startTime',
    'scene.endTime <= phase.endTime',
    'scene.duration == scene.endTime - scene.startTime',
    'Compat guard ativo ate 2026-04-18 para aulas legacy',
  ],
  filePaths: ['supabase/functions/v7-vv/index.ts', 'supabase/functions/audit-contracts/index.ts'],
}
```

---

### 7. Contracts Doc — Atualizar v7-vv-contracts.md

**Arquivo:** `docs/contracts/v7-vv-contracts.md`

Adicionar nova secao:

```markdown
## D — Scene Array Contract (C03)

### Status: ACTIVE (was KNOWN_GAP)
### Effective: 2026-02-18
### Compat Deadline: 2026-04-18

### Invariants
1. Every `phase` MUST contain `scenes[]` with at least 1 scene
2. `scene.startTime >= phase.startTime`
3. `scene.endTime <= phase.endTime`
4. `scene.narration` contains the narration text for audit scope
5. Legacy phases without scenes[] are auto-converted (compat guard)

### Rationale (CTO Decision)
- scenes[] is the canonical input format
- phase.visual is a compiled artifact derived from scene[0]
- Anchor scoping improves with per-scene narration boundaries
- Audit trail gains granularity (anchor X belongs to scene Y of phase Z)
```

---

### 8. Pipeline Contract Version Bump

Atualizar `CONTRACT_VERSION` no pipeline:

```
c10b-boundaryfix-execstate-c11-1.0 --> c10b-boundaryfix-execstate-c11-c03-1.0
```

E adicionar `C03` ao array `contracts` no `output_data.meta`.

---

## Sequencia de Execucao

1. **V7Contract.ts** — Tipar `scenes` e `V7Scene` corretamente
2. **v7-vv/index.ts** — Popular `scenes[]` + compat guard + version bump
3. **audit-contracts/index.ts** — Adicionar validacao C03
4. **V7PhaseController.tsx** — Remover fallback silencioso, adicionar warning
5. **AdminContracts.tsx** — Status ACTIVE
6. **v7-vv-contracts.md** — Documentar decisao
7. **Deploy** — v7-vv + audit-contracts
8. **Validacao** — Reprocessar aula benchmark para confirmar `scenes[]` populado

---

## Riscos e Mitigacoes

| Risco | Mitigacao |
|-------|----------|
| Aulas existentes no banco nao tem scenes[] | Compat guard auto-converte no reprocess |
| Renderer quebra com scenes[] novo? | Nao — o renderer JA tenta ler scenes[], agora tera dados reais |
| Audit gate bloqueia aulas antigas | C03 e WARNING por 60 dias, depois HARD FAIL |
| Contract version mismatch no audit | Bump sincronizado pipeline + audit gate |

