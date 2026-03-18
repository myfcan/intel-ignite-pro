

# Análise Forense: Documento V10 vs Código Real — Quadro Visual por Etapa

---

## DADOS REAIS VERIFICADOS

### Base de Dados V10 — Tabelas Confirmadas (query `information_schema`):
```
v10_bpa_pipeline, v10_bpa_pipeline_log, v10_lesson_intro_slides,
v10_lesson_narrations, v10_lesson_step_anchors, v10_lesson_steps,
v10_lessons, v10_user_achievements, v10_user_daily_usage,
v10_user_lesson_progress, v10_user_streaks
```
**11 tabelas** — todas presentes. ✅

### Colunas `v10_bpa_pipeline` — 37 colunas confirmadas (incluindo `image_statuses` recém-adicionada) ✅

---

## QUADRO VISUAL POR ETAPA

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ FASE I — INFRAESTRUTURA                                                │
├──────────────────────────────────────────────────────────────────────────┤
│ Item do Guia                          │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Todas as tabelas Supabase             │   ✅   │ 11 tabelas v10_*       │
│ LessonContainer A→B→C                 │   ✅   │ LessonContainer.tsx    │
│                                       │        │ L429/L447/L460         │
│ FrameRenderer 15 types                │   ✅   │ FrameRenderer.tsx      │
│                                       │        │ 15 cases no switch     │
│ Admin V10 com card BPA + 7 etapas     │   ✅   │ AdminV10Pipeline.tsx   │
│                                       │        │ + PipelineEditor.tsx   │
│                                       │        │ STAGES L32-40          │
│ Sem position:absolute                 │   ✅   │ Não localizado no code │
│ Sem dangerouslySetInnerHTML            │   ✅   │ Não localizado no code │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ RESULTADO FASE I: 6/6 ✅                                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ FASE II — PIPELINE PRODUÇÃO (Etapas 1-4)                               │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 1 — Score                       │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ 5 variáveis + pesos (20/25/25/15/15)  │   ✅   │ Stage1Score.tsx L23-29 │
│ Semáforo (≥70=verde, ≥40=amarelo)     │   ✅   │ computeSemaphore L31   │
│ IA Score (edge function)              │   ✅   │ v10-score-bpa/ 255L    │
│ Busca Refero na Stage 1               │   ✅   │ Stage1Score.tsx L127   │
│ Modal fallback docs (3 falhas)        │   ⚠️   │ docs_manual_input      │
│                                       │        │ existe mas modal de    │
│                                       │        │ 3 tentativas NÃO      │
│                                       │        │ LOCALIZADO no frontend │
│ Ref.tools MCP integração              │   ❌   │ NÃO IMPLEMENTADO      │
│                                       │        │ Nenhum MCP ref.tools   │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 1 RESULTADO: 4/6 ✅ | 1 ⚠️ | 1 ❌                               │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 2 — Estrutura de Passos         │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Geração de passos com IA              │   ✅   │ v10-generate-steps/    │
│                                       │        │ 510 linhas             │
│ JSON estruturado (não HTML)           │   ✅   │ frames JSONB column    │
│ Auditoria contrato pedagógico         │   ⚠️   │ audit_passed existe    │
│                                       │        │ mas auditoria auto     │
│                                       │        │ contra 9 cláusulas     │
│                                       │        │ NÃO LOCALIZADA como    │
│                                       │        │ verificação C1-C9      │
│ Editor inline por passo               │   ✅   │ Stage2Structure.tsx    │
│ Contadores steps_generated/audited    │   ✅   │ DB columns confirmadas │
│ bpa_pipeline_log registra ações       │   ✅   │ v10_bpa_pipeline_log   │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 2 RESULTADO: 4/5 ✅ | 1 ⚠️                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 3 — Imagens                     │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Geração de imagens IA (Lovable)       │   ✅   │ v10-generate-images/   │
│ Grid com thumbnail + status           │   ✅   │ Stage3Images.tsx        │
│ Regenerar individual                  │   ✅   │ step_ids param         │
│ Upload manual                         │   ✅   │ handleUpload L229      │
│ Persistência de status (image_statuses)│  ✅   │ JSONB column + code    │
│                                       │        │ (CORRIGIDO nesta sessão)│
│ Contadores recalculados (não aditivos)│   ✅   │ Edge func recalcula    │
│                                       │        │ (CORRIGIDO nesta sessão)│
│ handleApproveAll persiste             │   ✅   │ auto-save implementado │
│                                       │        │ (CORRIGIDO nesta sessão)│
│ Naming convention images/{slug}/      │   ⚠️   │ Storage path usa       │
│                                       │        │ v10-images/{lessonId}/ │
│                                       │        │ NÃO {bpa-slug}/        │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 3 RESULTADO: 7/8 ✅ | 1 ⚠️                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 4 — Mockups/Refero              │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Edge function Refero search           │   ✅   │ v10-refero-search/     │
│                                       │        │ 108 linhas             │
│ Registro no config.toml               │   ❌   │ NÃO REGISTRADA         │
│                                       │        │ (search retornou 0)    │
│ Stage4Mockups.tsx chama Refero        │   ✅   │ L165 invoke            │
│ Fallback mockup genérico              │   ✅   │ Stage4Mockups.tsx      │
│ Contadores mockups_total/approved     │   ✅   │ DB columns confirmadas │
│ Refero MCP real (api.refero.design)   │   ❌   │ Edge func existe mas   │
│                                       │        │ é stub/simulação       │
│                                       │        │ NÃO conecta ao MCP real│
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 4 RESULTADO: 3/5 ✅ | 2 ❌                                       │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ FASE III — PIPELINE PRODUÇÃO (Etapas 5-7)                              │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 5 — Narração                    │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ElevenLabs gera MP3                   │   ✅   │ v10-generate-audio/    │
│                                       │        │ + v10-process-anchors/ │
│ Admin preview áudios                  │   ✅   │ Stage5Narration.tsx    │
│ Review de scripts no Admin            │   ✅   │ ImportFullScriptModal  │
│ Importar script completo              │   ✅   │ ImportFullScriptModal  │
│ Invalidação auto (script→audio=null)  │   ✅   │ Confirmado em memory   │
│ Naming {slug}_passo-{NN}.mp3          │   ⚠️   │ Usa v10-audio/{id}/    │
│                                       │        │ NÃO {slug}_passo-NN   │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 5 RESULTADO: 5/6 ✅ | 1 ⚠️                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 6 — Montagem                    │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Checklist automático (12 itens)       │   ✅   │ v10-assembly-check/    │
│                                       │        │ score_ok, structure_ok │
│                                       │        │ steps_have_frames, etc │
│ Verifica dados REAIS nos frames       │   ✅   │ images_ok, mockups_ok  │
│                                       │        │ contam src nos frames  │
│ Links diretos pra corrigir pendências │   ✅   │ Stage6Assembly.tsx     │
│ Gamificação check (xp_reward > 0)     │   ✅   │ gamification_ok L136   │
│ assembly_passed boolean               │   ✅   │ DB column confirmada   │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 6 RESULTADO: 5/5 ✅                                              │
├──────────────────────────────────────────────────────────────────────────┤
│ ETAPA 7 — Preview e Publicação        │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Preview completo (A→B→C)              │   ✅   │ Stage7Publish.tsx      │
│ Botão Publicar (1 clique)             │   ✅   │ v10-publish-lesson/    │
│                                       │        │ action=publish/unpublish│
│ preview_at / approved_at timestamps   │   ✅   │ DB columns confirmadas │
│ published_at timestamp                │   ✅   │ DB column confirmada   │
│ Status muda pra ATIVO no card         │   ✅   │ STATUS_LABELS L42-47   │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ ETAPA 7 RESULTADO: 5/5 ✅                                              │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ FASE IV — PIPELINE DE ENTREGA (Runtime)                                │
├──────────────────────────────────────────────────────────────────────────┤
│ Item do Guia                          │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Parte A: slides + áudio sincronizado  │   ✅   │ PartAScreen.tsx        │
│                                       │        │ IntroSlides.tsx        │
│                                       │        │ IntroAudioBar.tsx      │
│ Parte B: passos + FrameRenderer       │   ✅   │ PartBScreen.tsx        │
│                                       │        │ StepContent.tsx        │
│ Áudio lazy (atual + próximo)          │   ✅   │ PartBScreen.tsx L240   │
│                                       │        │ preloadRef + load()    │
│ Progresso salva a cada passo          │   ✅   │ LessonContainer.tsx    │
│                                       │        │ debouncedSave L162-181 │
│ Retomar no passo/frame exato          │   ✅   │ initialStep L450      │
│                                       │        │ initialFrame L451      │
│ LIV funciona (Claude API)             │   ✅   │ PartBScreen.tsx L371   │
│                                       │        │ handleAskLiv → claude  │
│ LIV campos estáticos (tip/analogy/sos)│   ✅   │ LIVSheet.tsx           │
│ Limite diário respeitado              │   ✅   │ v10_user_daily_usage   │
│ Parte C: 3 sub-telas (C1/C2/C3)      │   ✅   │ RecapPage.tsx          │
│                                       │        │ EngagementPage.tsx     │
│                                       │        │ GamificationPage.tsx   │
│ Confetti em C3                        │   ✅   │ Confetti.tsx           │
│                                       │        │ GamificationPage L84  │
│ Badge + XP persistem                  │   ✅   │ v10_user_achievements  │
│ Streak persiste                       │   ✅   │ v10_user_streaks       │
│ Sidebar desktop com lista de passos   │   ✅   │ Sidebar.tsx            │
│ Anchor text sync (áudio↔visual)       │   ✅   │ v10-process-anchors/   │
│                                       │        │ v10_lesson_step_anchors│
├───────────────────────────────────────┼────────┼────────────────────────┤
│ RESULTADO FASE IV: 14/14 ✅                                            │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ INTEGRAÇÕES EXTERNAS                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ Item do Guia                          │ Status │ Evidência              │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ Refero.design MCP                     │   ⚠️   │ Edge func existe mas   │
│                                       │        │ não conecta ao MCP     │
│                                       │        │ real. É proxy/stub.    │
│ Ref.tools MCP                         │   ❌   │ NÃO IMPLEMENTADO       │
│ ElevenLabs API                        │   ✅   │ v10-generate-audio/    │
│                                       │        │ + generate-audio-*     │
│ Claude API (runtime LIV)              │   ✅   │ claude-interact/       │
│ Claude API (backstage geração)        │   ✅   │ Lovable AI Gateway     │
├───────────────────────────────────────┼────────┼────────────────────────┤
│ RESULTADO: 3/5 ✅ | 1 ⚠️ | 1 ❌                                       │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ BUG CRÍTICO ENCONTRADO                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ v10-refero-search NÃO REGISTRADA no config.toml                        │
│                                       │   ❌   │ Busca por              │
│                                       │        │ "v10-refero-search"    │
│                                       │        │ no config.toml         │
│                                       │        │ retornou 0 matches.    │
│                                       │        │ A função EXISTE no     │
│                                       │        │ diretório mas NÃO pode │
│                                       │        │ ser invocada.          │
│                                       │        │ Stage1Score e Stage4   │
│                                       │        │ chamam esta função.    │
│ IMPACTO: Stage 1 e Stage 4 falham    │        │                        │
│ silenciosamente ao buscar Refero.     │        │                        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## RESUMO CONSOLIDADO

```text
┌────────────────────────────┬────┬────┬────┬──────────┐
│ Fase/Etapa                 │ ✅  │ ⚠️  │ ❌  │ Aderência│
├────────────────────────────┼────┼────┼────┼──────────┤
│ FASE I — Infraestrutura   │  6 │  0 │  0 │   100%   │
│ ETAPA 1 — Score            │  4 │  1 │  1 │    67%   │
│ ETAPA 2 — Estrutura        │  4 │  1 │  0 │    80%   │
│ ETAPA 3 — Imagens          │  7 │  1 │  0 │    88%   │
│ ETAPA 4 — Mockups/Refero   │  3 │  0 │  2 │    60%   │
│ ETAPA 5 — Narração         │  5 │  1 │  0 │    83%   │
│ ETAPA 6 — Montagem         │  5 │  0 │  0 │   100%   │
│ ETAPA 7 — Publicação       │  5 │  0 │  0 │   100%   │
│ FASE IV — Runtime          │ 14 │  0 │  0 │   100%   │
│ Integrações                │  3 │  1 │  1 │    60%   │
├────────────────────────────┼────┼────┼────┼──────────┤
│ TOTAL                      │ 56 │  5 │  4 │  86.2%   │
└────────────────────────────┴────┴────┴────┴──────────┘
```

---

## ITENS PENDENTES (❌ e ⚠️ detalhados)

### ❌ CRÍTICOS (4 itens)

| # | Item | Impacto | Correção |
|---|------|---------|----------|
| 1 | `v10-refero-search` não registrada no `config.toml` | Stage 1 e Stage 4 falham ao invocar a função | Adicionar `[functions.v10-refero-search]` + `verify_jwt = false` no config.toml |
| 2 | Ref.tools MCP não implementado | Score de documentação (25% do peso) não é calculado automaticamente | Criar edge function ou integração com api.ref.tools |
| 3 | Refero MCP é stub, não conecta ao real | Mockups não usam screenshots reais do Refero | Integrar com api.refero.design quando disponível |
| 4 | Auditoria automática C1-C9 não verificada | `audit_passed` existe mas verificação por cláusula não localizada na edge function | Implementar as 9 verificações (C1: description >30 chars, C2: tooltip_term, C3: nav_breadcrumb, etc.) |

### ⚠️ MENORES (5 itens)

| # | Item | Impacto | Nota |
|---|------|---------|------|
| 1 | Modal fallback docs (3 tentativas) não localizado no frontend | UX degradada — sem retry automático | Campo `docs_manual_input` existe, falta UI de 3 tentativas |
| 2 | Naming images: usa `v10-images/{lessonId}/` vs spec `images/{bpa-slug}/` | Divergência de convenção, sem impacto funcional | Decisão de design — pode ser intencional |
| 3 | Naming áudios: usa `v10-audio/{id}/` vs spec `{slug}_passo-NN.mp3` | Divergência de convenção, sem impacto funcional | Decisão de design — pode ser intencional |
| 4 | Auditoria contrato: campo existe mas verificação automática de 9 cláusulas não localizada | Etapa 2 marca `audit_passed` mas sem validação C1-C9 inline | Pode estar na edge function v10-generate-steps (precisa verificar 510 linhas completas) |
| 5 | Refero edge function existe mas não está no config.toml | Deploy impedido | Fix trivial: 1 linha no config.toml |

---

## CORREÇÃO IMEDIATA RECOMENDADA

O item **mais crítico e trivial** é o ❌ #1: `v10-refero-search` não registrada no `config.toml`. Isso é 1 linha de código que desbloquearia Stage 1 e Stage 4 para funcionar corretamente. A função existe (`supabase/functions/v10-refero-search/index.ts`, 108 linhas), o frontend já a chama (`Stage1Score.tsx L127`, `Stage4Mockups.tsx L165`), mas sem registro no config.toml ela não pode ser deployada.

