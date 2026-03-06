

## Problemas Identificados e Plano de Correção

### Problema 1: "Repetir tarefa" no Playground não funciona visualmente

**Causa raiz**: O botão "Repetir tarefa" (linha 558-566 de `V8PlaygroundInline.tsx`) reseta corretamente o estado interno (`setPhase("intro")`, limpa score, feedback, etc.), MAS:
- O playground está renderizado na posição do timeline onde `isActive={isLast}` — quando o usuário já avançou para a fase "done" (index 5), o componente já está no final do scroll. O reset para "intro" acontece, mas **não há scroll de volta ao topo do componente**.
- Não há efeito visual (fade/pulse) indicando que o campo foi reativado.

**Correção**: Após o reset do estado, fazer scroll suave até o topo do componente playground + adicionar uma animação de "reativação" (pulse/ring) no card de intro.

### Problema 2: "Refazer Desafio" no InsightReward não funciona

**Causa raiz**: O botão chama `onRetryPlayground` → `goToIndex(pgIdx)` no `V8LessonPlayer`. Isso muda o `currentIndex` no state do player, mas:
- `goToIndex` apenas seta o index — **não reseta o estado interno do `V8PlaygroundInline`** (phase, attempts, score, feedback ficam no estado "done").
- O playground é re-renderizado na mesma posição, mas com o estado interno stale (ainda mostra "Playground concluído").

**Correção**: Adicionar um mecanismo de reset externo ao playground (via key ou callback). Quando `goToIndex` é chamado para retornar ao playground, incrementar uma `resetKey` que força re-mount do componente, resetando todo o estado interno.

### Problema 3: Remover o efeito de redução de 25% na re-conclusão

**Causa raiz**: A migração anterior implementou 25% de XP em re-conclusões. O usuário quer remover isso — re-conclusões devem dar o XP proporcional completo (sem redução).

**Correção**: Atualizar a função `register_gamification_event` no banco para remover o multiplicador de 0.25 em re-conclusões de `lesson_completed`. Manter a lógica proporcional baseada em `avg_score`, mas sem penalidade por revisão.

---

### Implementação

#### 1. `V8PlaygroundInline.tsx` — Scroll + visual feedback no "Repetir tarefa"
- Adicionar um `ref` no container raiz do componente
- No handler do "Repetir tarefa", após resetar estado, chamar `scrollIntoView({ behavior: 'smooth' })` no ref raiz
- Adicionar estado temporário `justReset` que ativa um efeito visual (ring/pulse) no card de challenge por 1.5s

#### 2. `V8LessonPlayer.tsx` + `V8PlaygroundInline.tsx` — Reset externo via key
- Manter um `Map<number, number>` de `playgroundResetKeys` no player
- Quando `onRetryPlayground` é chamado e faz `goToIndex(pgIdx)`, incrementar a resetKey daquele index
- Passar a key como prop `key={resetKey}` no `V8PlaygroundInline` para forçar re-mount (estado limpo)
- Após `goToIndex`, fazer scroll suave até o elemento do playground

#### 3. Migração SQL — Remover redução de 25%
- Alterar a função `register_gamification_event`: quando `v_event_exists = true` e `p_event_type = 'lesson_completed'`, usar o XP proporcional completo (sem `* 0.25`).
- Remover label "Revisão +25%" se existir no frontend.

### Arquivos afetados
- `src/components/lessons/v8/V8PlaygroundInline.tsx` — scroll + visual reset
- `src/components/lessons/v8/V8LessonPlayer.tsx` — resetKey mechanism
- `supabase/migrations/` — remover redução 25%

