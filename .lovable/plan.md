
# PLANO DE CORREÇÃO V7 — ENGENHARIA SENIOR

**Data:** 2026-02-18
**Auditor:** Claude (Engenheiro Sênior)
**Base:** Auditoria forense 100% com evidências SQL reais

---

## INVENTÁRIO COMPLETO — BUGS

### BUG P1 — `scenes[]` Sempre Vazio (C03 Known Gap)
- **Severidade:** MÉDIA-ALTA
- **Camada:** Pipeline (`v7-vv/index.ts`, ~linha 5099)
- **Evidência SQL:** `content->'phases'->0->'scenes'` retorna `NULL` para aula `ba50a2ba`
- **Causa:** A construção da Phase gera `visual: { type, content, frames? }` mas nunca popula `scenes[]`
- **Impacto:** currentScene = null, timing por cena não funciona, animações por cena ignoradas
- **Contrato:** C03 registra como `known_gap` — renderer usa `phase.visual` como fallback
- **Decisão necessária:** Implementar `scenes[]` OU oficializar `visual` como definitivo e remover código morto do renderer

### BUG P2 — `audioBehavior.duringInteraction` Nunca Gerado
- **Severidade:** MÉDIA
- **Camada:** Pipeline (`v7-vv/index.ts`, ~linha 5116)
- **Evidência SQL:** `content->'phases'->0->'audioBehavior'` retorna `NULL`
- **Causa:** Pipeline só gera `{ onStart, onComplete }`, nunca inclui `duringInteraction: { mainVolume, ambientVolume, contextualLoops }`
- **Impacto:** Volumes de áudio não controlados durante interações; contextualLoops (whispers) nunca executam
- **Fix:** Adicionar `duringInteraction` com defaults sensatos ao pipeline

### BUG P3 — `storagePath` Fictício Permanece Após Pipeline
- **Severidade:** CRÍTICA
- **Camada:** Pipeline/Image Lab Bridge
- **Evidência SQL:** Frames de `ba50a2ba` apontam para `image-lab/assets/23972383.png` — formato INCORRETO (deveria ser `{job-id}/{attempt-id}/0.png`)
- **Evidência Bridge:** `image_lab_bridge_report` no `output_data` retorna `NULL` — **a bridge NÃO foi chamada ou não registrou resultado**
- **Evidência Logs:** Logs da edge function `image-lab-pipeline-bridge` estão VAZIOS para este run
- **Causa raiz provável:** O Step 4.9 pode não ter sido deployado no momento do run, OU os frames não foram matchados no `allScenesForBridge`, OU a bridge retornou erro que foi silenciado
- **Fix:** (1) Validar que Step 4.9 está deployado; (2) Adicionar log obrigatório de bridge call/response; (3) Marcar `storagePath` como `PENDING` se bridge falha (em vez de manter path fictício)

### BUG P4 — Declaração Duplicada de `totalDuration`
- **Severidade:** BAIXA
- **Camada:** Pipeline (`v7-vv/index.ts`, ~linhas 6348/6355)
- **Causa:** `totalDuration` declarado duas vezes (shadow variable)
- **Fix:** Remover a declaração redundante

### BUG P5 — `contentVersion` Ausente no Root do Content
- **Severidade:** MÉDIA
- **Camada:** Pipeline
- **Evidência SQL:** `content->'contentVersion'` retorna `NULL` para `ba50a2ba`
- **Causa:** O pipeline persiste `contentVersion` dentro de `metadata` ou `output_data.meta`, mas NÃO no root do `content` JSON
- **Impacto:** Queries de busca por `content->>'contentVersion' = 'v7-vv'` retornam vazio. Impossível filtrar aulas V7 por versão via SQL direto no content
- **Fix:** Adicionar `contentVersion: 'v7-vv'` no root do JSON de content no step de consolidação

### BUG P6 — `anchorActions` NULL no Content Root
- **Severidade:** MÉDIA
- **Camada:** Pipeline
- **Evidência SQL:** `jsonb_array_length(content->'anchorActions')` retorna `NULL` para `ba50a2ba` (1 fase, sem interação, então pode ser esperado para esta aula)
- **Verificação necessária:** Confirmar se aulas com fases interativas TÊM `anchorActions` populado no content root

### BUG R1 — `currentScene` Depende de `scenes[]` Inexistente
- **Severidade:** MÉDIA
- **Camada:** Renderer (`V7PhasePlayer.tsx`, ~linha 779)
- **Causa:** Consequência direta de P1. `scenes || []` sempre retorna vazio
- **Impacto:** `getCombinedSceneContent()` e `getSceneContent()` retornam `{}`
- **Fix:** Vinculado a decisão de P1

### BUG R2 — `V7VisualRenderer` Não Suporta `image-sequence`
- **Severidade:** MÉDIA
- **Camada:** Renderer (`V7VisualRenderer.tsx`)
- **Impacto:** Não afeta o V7PhasePlayer (que trata image-sequence diretamente), mas afeta V7LessonPlayer (player legado)
- **Fix:** Adicionar case `image-sequence` ao V7VisualRenderer OU deprecar V7LessonPlayer

### BUG R3 — Dois Players V7 Distintos (Design Debt)
- **Severidade:** INFORMATIVA
- **Camada:** Renderer
- **V7LessonPlayer.tsx:** 470 linhas, sem XState, sem image-sequence, sem anchor system
- **V7PhasePlayer.tsx:** 2160 linhas, completo
- **Fix:** Deprecar V7LessonPlayer oficialmente ou removê-lo

---

## INVENTÁRIO COMPLETO — CONTRATOS

### Contratos ATIVOS (Funcionando)
| Contrato | Nome | Status | Verificação |
|----------|------|--------|-------------|
| C01 | Idempotency | ✅ PASS | "1 runs, 0 duplicates" |
| C02 | Phase Structure | ✅ PASS | Validado no audit gate |
| C04 | Content Integrity | ✅ PASS | Validado no audit gate |
| C05 | Traceability (SHA-256) | ✅ PASS | "1 completed, 0 missing hash" |
| C06 | Single Trigger (anchorActions) | ✅ PASS | "0 runs with wrong triggerContract" |
| C08 | Phase Drift Fix | ✅ PASS | Boundary alignment funcional |
| C10 | Hard Pause Anchor | ✅ PASS | "0 interactive phases missing pause" |
| C10B | Editorial Guardrail (1.5s) | ✅ PASS | "0 violations" |
| BOUNDARY_FIX_GUARD | Timeline Monotonic | ✅ PASS | "1 phases checked, 0 violations" |
| EXEC_STATE_CANONICAL_JSON | Error Format + State | ✅ PASS | Enforced (run 355bd8ab falhou por mismatch, corrigido em 53def5c0) |
| C11 | Runtime Anchor Audit | ✅ REGISTRADO | RAF timing + causal chain |

### Contratos DEPRECADOS
| Contrato | Nome | Substituído por |
|----------|------|----------------|
| C07 | Pause Priority Rule | C10 |
| C09 | Pause at Last Word | C10 |

### Contratos com GAPS
| Contrato | Nome | Gap |
|----------|------|-----|
| C03 | Scenes Array Population | `scenes[]` sempre vazio — aceito como known_gap, renderer usa fallback |

### Contratos AUSENTES (Não Existem mas Deveriam)
| ID Proposto | Nome | Justificativa |
|-------------|------|---------------|
| C12.1 | Image-Sequence Validation | Valida frames[], durationMs, max 3 frames — existe no DryRun mas NÃO no audit gate |
| C13 | StoragePath Integrity | Valida que storagePaths apontam para assets reais OU estão marcados como PENDING |
| C14 | ContentVersion Root | Garante `contentVersion` no root do content JSON |
| C15 | Image Lab Bridge Traceability | Garante que bridge call/response é registrado no output_data |

---

## PLANO DE CORREÇÃO — 4 FASES

### FASE 1: CRÍTICA — Resolver P3 (Image Lab Bridge) 
**Objetivo:** Aulas C13.2 com imagens reais
**Tarefas:**
1. **Diagnosticar bridge:** Verificar se Step 4.9 foi deployado no momento do run `4ab1098d`. Redeploy se necessário
2. **Adicionar logging obrigatório:** Step 4.9 deve registrar em `output_data.debugReport.imageLabBridge`:
   - `bridgeCalled: boolean`
   - `scenesSubmitted: number`
   - `scenesResolved: number`
   - `errors: string[]`
3. **Fallback seguro:** Se bridge falha para um frame, marcar `storagePath: 'PENDING:bridge-failed'` em vez de manter path fictício. Renderer deve detectar prefix `PENDING:` e exibir placeholder neutro
4. **Teste:** Reprocessar aula `ba50a2ba` e verificar se bridge é chamada e assets são gerados

### FASE 2: ROBUSTEZ — Resolver P2, P4, P5
**Objetivo:** Pipeline gera output completo e limpo
**Tarefas:**
1. **P2 — audioBehavior completo:**
   ```typescript
   audioBehavior: isInteractive ? {
     onStart: 'pause',
     duringInteraction: {
       mainVolume: 0,
       ambientVolume: 0.3,
       contextualLoops: scene.interaction?.contextualLoops || [],
     },
     onComplete: 'resume',
   } : undefined,
   ```
2. **P4 — Remover totalDuration duplicado:** Consolidar em uma única declaração
3. **P5 — contentVersion no root:** Adicionar `contentVersion: 'v7-vv'` no root do content JSON no step de consolidação

### FASE 3: CONTRATOS — Adicionar C12.1, C13, C14, C15 ao Audit Gate
**Objetivo:** Audit gate cobre todas as invariantes críticas
**Tarefas:**
1. **C12.1 — Image-Sequence Validation no Audit Gate:**
   - Fases com `visual.type === 'image-sequence'` DEVEM ter `frames[]` com 1-3 items
   - Cada frame DEVE ter `durationMs >= 1000`
   - Total `durationMs >= 2000`
2. **C13 — StoragePath Integrity:**
   - Todo `storagePath` em frames/microVisuals DEVE seguir formato `{uuid}/{uuid}/N.png` OU ser `PENDING:*`
   - Paths com formato `image-lab/assets/*` são REJEITADOS (fictícios)
3. **C14 — ContentVersion Root:**
   - `content.contentVersion` DEVE existir e ser `'v7-vv'`
4. **C15 — Image Lab Bridge Traceability:**
   - Se aula tem visual do tipo `image` ou `image-sequence`, `output_data.debugReport.imageLabBridge` DEVE existir

### FASE 4: DEBT TÉCNICO — Resolver P1/R1, R2, R3
**Objetivo:** Código limpo, sem ambiguidades
**Tarefas:**
1. **P1/R1 — Decisão sobre scenes[]:**
   - **Opção A:** Implementar `scenes[]` no pipeline a partir do `visual` (transformação `visual → scenes[{...}]`)
   - **Opção B:** Oficializar `visual` como definitivo, remover todo código de `scenes[]` do renderer, atualizar C03 para `resolved:visual_is_canonical`
   - **Recomendação:** Opção B — menos complexidade, alinhado com a realidade atual
2. **R2 — V7VisualRenderer:**
   - Adicionar case `image-sequence` ao switch OU deprecar V7LessonPlayer
   - **Recomendação:** Deprecar V7LessonPlayer (R3 resolve ambos)
3. **R3 — Remover V7LessonPlayer.tsx:**
   - Verificar se alguma rota usa V7LessonPlayer
   - Se não, remover arquivo e imports

---

## REGRAS DE EXECUÇÃO

1. **Nenhuma alteração de código sem aprovação explícita do usuário**
2. **Cada fase deve ter diagnóstico → proposta → aprovação → implementação → verificação**
3. **Toda correção no pipeline DEVE ser verificada via reprocess + SQL forense**
4. **Contratos novos DEVEM ser adicionados ao `contracts.ts` E ao `audit-contracts` edge function**
5. **Deploy de edge functions DEVE ser verificado com curl antes de considerar "feito"**

---

## MATRIZ DE PRIORIDADE

```
URGÊNCIA ↑
│
│  P3 (CRÍTICA)          
│  ████████████████       
│                         
│  P5 (MÉDIA)   P2 (MÉDIA)
│  ██████████   ██████████
│                         
│  C12-C15      P1/R1-R3
│  ██████████   ██████████
│  (Contratos)  (Debt)
│                         
│  P4 (BAIXA)            
│  ████                   
└────────────────────────→ COMPLEXIDADE
```

**Sequência recomendada:** P3 → P5 → P2 → P4 → C12.1/C13/C14/C15 → P1/R1 → R2/R3
