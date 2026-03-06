

## Gamificacao V8: XP por Exercicio + Bonus Proporcional + Re-conclusao Parcial

### Problema Atual
1. Exercicios inline (quizzes, flipcards, true-false, etc.) nao geram XP durante a aula
2. O evento `lesson_completed` e idempotente: re-conclusoes mostram +0 XP/Moedas sem explicacao
3. Toda a gamificacao depende de um unico evento no final da aula (40 XP fixo)

### Solucao em 3 Partes

---

#### Parte 1: XP Incremental por Exercicio (+5 XP por acerto)

**Novo evento `exercise_correct`** na funcao `register_gamification_event`:
- +5 XP e +1 moeda por exercicio acertado (score >= PASS_SCORE)
- Idempotencia por `event_reference_id` = `{lessonId}_{exerciseIndex}` (evita double-claim)
- Nao requer mudanca de schema (usa a mesma tabela `user_gamification_events`)

**Mudanca no frontend** (`V8InlineExercise.tsx`):
- Quando `handleComplete` recebe score >= 81, disparar `registerGamificationEvent("exercise_correct", compositeId)`
- Mostrar micro-feedback "+5 XP" animado no componente

**Mudanca no DB** (`register_gamification_event`):
- Adicionar `exercise_correct` na logica de switch do event_type
- Adicionar na constraint de validacao do event_type

---

#### Parte 2: Bonus Proporcional na Conclusao

**Mudanca na funcao `register_gamification_event`** para `lesson_completed`:
- Em vez de fixo 40 XP, calcular com base no `avg_score` enviado no payload
- Formula: `XP = ROUND(40 * (avg_score / 100))` — ex: 67% = 27 XP, 100% = 40 XP
- Moedas escalam tambem: `coins = ROUND(10 * (avg_score / 100))`
- O payload ja contem scores (basta passar `avg_score`)

**Mudanca no frontend** (`V8CompletionScreen.tsx`):
- Enviar `{ avg_score: avgScore }` no payload do `registerGamificationEvent`

---

#### Parte 3: Re-conclusao com XP Parcial (25%)

**Mudanca na funcao `register_gamification_event`**:
- Quando `v_event_exists = true` para `lesson_completed`, em vez de retornar 0/0:
  - Calcular XP parcial: `ROUND(base_xp * 0.25)`
  - Registrar como novo evento (permitir multiplas entradas para lesson_completed)
  - OU: remover a checagem de idempotencia apenas para `lesson_completed` e usar multiplicador decrescente

**Abordagem escolhida**: Permitir re-conclusao com 25% do XP calculado. Manter idempotencia para `exercise_correct` e `insight_claimed`.

**Mudanca no frontend** (`V8CompletionScreen.tsx`):
- Quando resultado voltar com XP > 0, mostrar normalmente
- Adicionar label "Revisao +25%" quando for re-conclusao

---

### Detalhes Tecnicos

**Migracao SQL** — Alterar `register_gamification_event`:
1. Adicionar case `exercise_correct` → 5 XP, 1 moeda
2. Modificar case `lesson_completed` para usar `(p_payload->>'avg_score')::INTEGER` no calculo
3. Para re-conclusao: quando `v_event_exists = true` e `p_event_type = 'lesson_completed'`, aplicar 25% do XP proporcional e registrar novo evento (sem bloquear)
4. Atualizar constraint de `event_type` para incluir `exercise_correct`

**Frontend**:
- `V8InlineExercise.tsx`: chamar gamification no `handleComplete` quando score >= 81
- `V8CompletionScreen.tsx`: passar `avg_score` no payload; tratar label de revisao
- Micro-animacao "+5 XP" como toast ou badge inline

**Arquivos afetados**:
- `supabase/migrations/` — nova migracao para alterar a funcao DB
- `src/components/lessons/v8/V8InlineExercise.tsx` — trigger de XP por exercicio
- `src/components/lessons/v8/V8CompletionScreen.tsx` — payload com avg_score + UI de revisao
- `src/services/gamification.ts` — adicionar `exercise_correct` ao tipo

