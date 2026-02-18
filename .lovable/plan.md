
# AUDITORIA COMPLETA V7 — 100%

**Data:** 2026-02-18
**Escopo:** Pipeline (v7-vv/index.ts), Renderer (V7PhasePlayer.tsx), Contracts, Database, Diagnostic Engine, Image Lab Integration, Runtime

---

## 1. PIPELINE (supabase/functions/v7-vv/index.ts — 7.255 linhas)

### 1.1 Status Geral
- **Version:** v7-vv-1.1.4-forcetest-fix
- **Contract Version:** c10b-boundaryfix-execstate-c11-1.0
- **Contracts Active:** C01, C02, C04, C05, C06, C08, C10, C10B, BOUNDARY_FIX_GUARD, EXEC_STATE_CANONICAL_JSON, C11
- **Contracts Deprecated:** C07 (by C10), C09 (by C10)
- **Known Gaps:** C03 (scenes[] vazio)

### 1.2 BUGS ENCONTRADOS

#### BUG P1 — `scenes[]` Sempre Vazio (KNOWN GAP C03 — Nunca Resolvido)
**Severidade:** MEDIA-ALTA
**Arquivo:** v7-vv/index.ts, linhas 5099-5120
**Evidencia:** A construcao da Phase (linha 5099) gera `visual: { type, content, frames? }` mas NUNCA gera `scenes[]`. O contrato C03 documenta isso como "known_gap" e o renderer usa fallback (`phase.visual`), mas o V7PhaseController.tsx (linha 439) faz `const phaseScenes = currentPhase?.scenes || []` — retornando sempre array vazio.
**Impacto:** 
- Timing interno de cenas NAO funciona (sceneIndex sempre 0)
- `currentScene` no V7PhasePlayer e sempre null ou o ultimo item
- Animacoes por cena nao sao aplicadas
**Observacao:** O contrato registra isso como gap aceito, mas prejudica fases que dependem de multiplas cenas (dramatic, narrative com scenes progressivos).

#### BUG P2 — `audioBehavior` Incompleto para Fases Interativas
**Severidade:** MEDIA
**Arquivo:** v7-vv/index.ts, linhas 5116-5119
**Evidencia:** O pipeline gera:
```
audioBehavior: { onStart: 'pause', onComplete: 'resume' }
```
Mas o V7PhaseController.tsx (linhas 140-148) define a interface completa com `duringInteraction` (mainVolume, ambientVolume, contextualLoops). O campo `duringInteraction` nunca e gerado.
**Impacto:** Volumes de audio durante interacoes nao sao controlados. contextualLoops (whispers de dicas) nunca executam.

#### BUG P3 — `storagePath` Ficticio nos Frames de Image-Sequence
**Severidade:** CRITICA (para aulas C13.2)
**Arquivo:** v7-vv/index.ts, Step 4.9 (linhas 6200-6340)
**Evidencia Real (SQL):** A aula `ba50a2ba` tem:
- `frame0_path: image-lab/assets/23972383.png`
- `frame1_path: image-lab/assets/2d0f33f7.png`
- `frame2_path: image-lab/assets/ec9c7c02.png`

Esses paths NAO existem no bucket `image-lab`. O bucket usa formato `{job-id}/{attempt-id}/0.png`.
**Causa raiz:** O Step 4.9 agora escaneia corretamente frames de image-sequence (apos fix recente), mas o JSON de input ORIGINAL ja tinha esses paths ficticios no campo `storagePath`. O pipeline precisa verificar se `storagePath` aponta para arquivo existente OU sempre gerar via bridge quando `promptScene` esta presente, ignorando paths pre-existentes.
**Status da integracao Image Lab:** O codigo do Step 4.9 (linhas 6207-6223) agora escaneia `phase.visual.frames` e envia para a bridge. Porem, ele NAO verifica se o `storagePath` ja existente e valido antes de decidir gerar. Se o JSON de input traz `storagePath` preenchido (mesmo ficticio), o filtro `!content.storagePath` NAO se aplica a frames (apenas a microVisuals, linha 6236). Para frames, o codigo SEMPRE tenta gerar se `promptScene` existe (linha 6213) — isso e CORRETO. O problema ocorre se a bridge falha ou retorna sem resultados para esse frame.

#### BUG P4 — Duas Declaracoes de `totalDuration`
**Severidade:** BAIXA
**Arquivo:** v7-vv/index.ts, linhas 6348 e 6355
**Evidencia:** `totalDuration` e declarado duas vezes — na linha 6348 (fora do `if`) e 6355 (dentro do `if (!preserveStructureMode)`). A segunda declaracao faz shadow da primeira. Nao causa bug funcional porque ambas calculam o mesmo valor, mas e codigo sujo.

### 1.3 PIPELINE — O QUE FUNCIONA CORRETAMENTE
- Validacao de input (validateInput) com codigos de erro canonicos
- Auto-geracao de pauseAt para fases interativas
- Geracao de audio via ElevenLabs com word timestamps
- Geracao de feedback audios para quiz
- Calculo de timing baseado em palavras (findNarrationRange, calculateWordBasedTimings)
- BoundaryFixGuard (monotonicidade, duracao minima)
- C10/C10B: Hard Pause Anchor Contract com editorial guardrail (1.5s)
- C05: Traceability com SHA-256 hash via SQL RPC
- C06: Single Trigger Contract (anchorActions)
- Audit Gate pos-execucao
- Idempotencia via run_id
- Dry-run mode
- Reprocess mode (preserve_structure e regenerate)
- Debug report automatico

---

## 2. RENDERER (V7PhasePlayer.tsx — 2.160 linhas)

### 2.1 Status Geral
- **Runtime Contract:** v7-runtime-c12.1-1.0
- **State Management:** XState via useV7PlayerAdapter
- **Audio Engine:** useV7AudioManager com RAF-based polling

### 2.2 BUGS ENCONTRADOS

#### BUG R1 — Dependencia de `scenes[]` que Nunca Existem (Ligado a P1)
**Severidade:** MEDIA
**Arquivo:** V7PhasePlayer.tsx, linhas 779-813
**Evidencia:** `currentScene` e calculado buscando em `currentPhase.scenes` mas `scenes` esta sempre vazio para aulas geradas pelo pipeline V7-vv. O fallback na linha 808 retorna `scenes[last]` — que tambem nao existe. O renderer funciona apesar disso porque usa `phase.visual` diretamente (linhas 1298-1314 para narrative/comparison), mas o code path principal (getCombinedSceneContent, getSceneContent) retorna `{}` para aulas V7-vv.

#### BUG R2 — V7VisualRenderer NAO Suporta `image-sequence`
**Severidade:** MEDIA
**Arquivo:** V7VisualRenderer.tsx, linhas 46-134
**Evidencia:** O V7VisualRenderer renderiza tipos: `number-reveal`, `text-reveal`, `split-screen`, `letter-reveal`, `cards-reveal`, `quiz`, `playground`, `result`, `3d-dual-monitors`, `3d-abstract`, `3d-number-reveal`. NAO tem `image-sequence`. Isso NAO causa bug porque o V7PhasePlayer.tsx trata `image-sequence` ANTES de chamar V7VisualRenderer (linhas 1300-1311), renderizando `V7ImageSequenceRenderer` diretamente. Porem, o V7LessonPlayer.tsx (player alternativo) usa V7VisualRenderer diretamente (linha 415) e NAO tem tratamento especial para image-sequence — resultando em tela vazia se usado.

#### BUG R3 — V7LessonPlayer.tsx e V7PhasePlayer.tsx Sao Dois Players Distintos
**Severidade:** INFORMATIVO (design debt)
**Evidencia:** Existem DOIS players V7:
1. `V7LessonPlayer.tsx` (470 linhas) — Player simples baseado em V7Contract.ts, usa V7VisualRenderer, NAO suporta image-sequence, NAO tem XState
2. `V7PhasePlayer.tsx` (2160 linhas) — Player completo com XState, anchor system, scaling, support para todos os tipos

O sistema real usa V7PhasePlayer. V7LessonPlayer parece ser um fallback/legado que pode causar confusao.

### 2.3 RENDERER — O QUE FUNCIONA CORRETAMENTE
- Image-sequence rendering via V7ImageSequenceRenderer (crossfade, preload, signed URLs)
- Anchor crossing detection via RAF (C11 compliant)
- Phase locking para fases interativas
- Seek-back garantido no pause para evitar audio bleed
- Runtime scaling quando audio duration difere do script
- Feedback audio playback para quiz
- C07.2 legacy fallback para JSON sem pause actions
- MicroVisual overlay com crossing detection
- Caption filtering por fase (anti-bleed via pause anchor)
- Phase transition particles
- Debug HUD e v7DebugLogger persistente

---

## 3. IMAGE LAB INTEGRATION

### 3.1 Pipeline Bridge (Step 4.9)
**Status:** FUNCIONAL COM RESSALVA
- Escaneia corretamente `microVisuals` tipo `image` e `image-flash` (linhas 6227-6246)
- Escaneia corretamente `phase.visual.frames` para `image-sequence` (linhas 6207-6223) — fix recente
- Combina ambos em `allScenesForBridge` e envia para `image-lab-pipeline-bridge`
- Injeta `storagePath` e `assetId` de volta nos frames/microVisuals
- **Ressalva:** Se a bridge falha ou retorna sem match para um frame, o `storagePath` original (possivelmente ficticio) permanece, causando fallback no renderer

### 3.2 Renderer (useSignedUrl)
**Status:** FUNCIONAL
- Gera signed URLs a partir do bucket privado `image-lab`
- Validade de 1h
- Usado por V7ImageSequenceRenderer e V7MicroVisualOverlay

### 3.3 Problema Atual da Aula C13.2 (ba50a2ba)
O pipeline run `4ab1098d` completou com sucesso (audit gate passed), mas os frames mantem paths ficticios do JSON de input original. A bridge provavelmente nao conseguiu gerar as imagens (timeout, provider failure, ou os frames nao foram matchados pelo scene_id no resultado da bridge).

**Verificacao necessaria:** Logs da edge function `image-lab-pipeline-bridge` para o run `4ab1098d` para confirmar se a bridge foi chamada e qual foi o resultado.

---

## 4. DATABASE

### 4.1 Tabela `lessons`
- Aula C13.2 (`ba50a2ba`): frames[] persistidos corretamente (3 frames), schema v7-vv, status rascunho, is_active false
- `audio_url` presente, `word_timestamps` implicito via content

### 4.2 Tabela `pipeline_executions`
- 5 runs para C13.2: 2 dry_run (completed), 2 create (completed, 1 com audit gate passed, 1 com audit gate failed por contractVersion mismatch), 1 create failed (AUDIT_GATE_FAILED)
- Rastreabilidade completa: input_data, output_data, run_id, hashes

### 4.3 Tabela `lesson_migrations_audit`
- Usada corretamente para reprocess mode
- Diff summary com C02, C03, C04, C06 stats

---

## 5. CONTRACTS SYSTEM

### 5.1 contracts.ts (Source of Truth)
**Status:** SOLIDO
- 14 contratos registrados com status, invariantes, error codes
- enforceContractMeta() e enforceBoundaryInvariants() como guards
- CONTRACT_VERSION: `c10b-boundaryfix-execstate-c11-1.0`

### 5.2 Audit Gate
**Status:** FUNCIONAL
- Chama `audit-contracts` edge function apos persist
- HARD FAIL: reverte status para failed se gate nao passa
- FAIL SAFE: bloqueia se audit-contracts esta inacessivel
- Persiste `auditGate` stamp com scorecardHash

### 5.3 Gap Identificado
O contrato `EXEC_STATE_CANONICAL_JSON` espera `contractVersion` no output_data.meta, mas o run `355bd8ab` falhou com "mismatch=1" — indicando que o `contractVersion` no meta da aula nao bate com o esperado. Isso foi corrigido no run seguinte (`53def5c0`), mas mostra que o enforcement esta funcionando.

---

## 6. DIAGNOSTIC ENGINE

### 6.1 Status
**FUNCIONAL** — 8 modulos de analise:
1. anchorCrossRef (anchor cross-reference validation)
2. phaseTiming (overlap, gaps, durations)
3. microVisualValidation
4. interactionRequirements
5. audioIntegrity
6. jsonStructure
7. contentTypes
8. feedbackAudio

### 6.2 Limitacao
O Diagnostic Engine opera no frontend (via Supabase client) e analisa o conteudo JA PERSISTIDO no banco. Ele NAO analisa o output ANTES do persist (isso e feito pelo debug report do pipeline). Ambos os sistemas sao complementares.

---

## 7. RUNTIME (CI/CD)

### 7.1 v7-runtime-contract.yml
**Status:** CONFIGURADO
- Unit tests: validator + crossing detector via Vitest
- E2E: Audit replay via Playwright com aula benchmark
- Artefatos: v7-debug-logs, playwright-report
- Concurrency: cancel-in-progress

---

## 8. RESUMO DE TODOS OS BUGS

| # | Bug | Severidade | Camada | Status |
|---|-----|-----------|--------|--------|
| P1 | scenes[] sempre vazio | MEDIA-ALTA | Pipeline | Known Gap (C03) |
| P2 | audioBehavior.duringInteraction nunca gerado | MEDIA | Pipeline | Nao corrigido |
| P3 | storagePath ficticio permanece se bridge falha | CRITICA | Pipeline/Image Lab | Parcialmente corrigido (bridge chamada, mas fallback insuficiente) |
| P4 | Declaracao duplicada totalDuration | BAIXA | Pipeline | Code smell |
| R1 | currentScene depende de scenes[] inexistente | MEDIA | Renderer | Mitigado por fallback visual |
| R2 | V7VisualRenderer nao suporta image-sequence | MEDIA | Renderer (V7LessonPlayer) | Mitigado no V7PhasePlayer |
| R3 | Dois players V7 distintos | INFO | Renderer | Design debt |

---

## 9. PRIORIDADES DE CORRECAO

### Fase 1: Critica (para C13.2 funcionar)
1. **P3:** Verificar logs da bridge para run `4ab1098d`. Se a bridge nao gerou, gerar manualmente via Image Lab e vincular os `storagePath` reais na aula `ba50a2ba`

### Fase 2: Robustez do Pipeline
2. **P2:** Adicionar `duringInteraction` completo ao `audioBehavior`
3. **P4:** Remover declaracao duplicada de `totalDuration`

### Fase 3: Debt Tecnico
4. **P1/R1:** Decidir se `scenes[]` sera implementado ou se o fallback via `visual` e definitivo (atualizar contrato C03)
5. **R3:** Decidir se V7LessonPlayer.tsx deve ser removido ou mantido como fallback
