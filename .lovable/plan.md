

# Análise de Gaps do Plano — 4 Correções V8 Mobile

## Veredicto: O plano contém 1 gap CRÍTICO que causará regressão, 1 gap de diagnóstico incorreto, e 2 itens sólidos.

---

## Gap CRÍTICO: Bug 1 — Som duplicado (Double-Play)

O plano anterior já adicionou `playSound` ao `V8InlineExercise.tsx` (linha 49):
```ts
playSound(didPass ? "quiz-correct" : "quiz-wrong");
```

**Porém, TODOS os 8 sub-exercícios já possuem seu próprio `useV7SoundEffects` e tocam sons internamente:**

| Exercício | Linha | Sons próprios |
|---|---|---|
| TimedQuizExercise | L35 | quiz-correct, quiz-wrong, timer-tick, level-up, streak-bonus |
| TrueFalseExercise | L39 | quiz-correct, quiz-wrong |
| MultipleChoiceExercise | L29 | quiz-correct, quiz-wrong |
| FlipCardQuizExercise | L50 | quiz-correct, quiz-wrong, combo-hit, level-up, completion |
| ScenarioSelectionExercise | L50 | quiz-correct, quiz-wrong |
| PlatformMatchExercise | L42 | snap-success, snap-error, level-up, completion |
| FillInBlanksExercise | L44 | level-up, streak-bonus, error |
| CompleteSentenceExercise | L35 | completion, success, error |

**Resultado atual**: Cada exercício toca o som DUAS vezes — uma vez internamente, outra vez via `V8InlineExercise.handleComplete`. Isso causa efeitos sonoros sobrepostos/duplicados.

**Correção necessária**: Remover o `playSound` do `V8InlineExercise.handleComplete` (linha 49). Os sub-exercícios já cuidam dos seus próprios sons. O V8InlineExercise NÃO deve duplicar.

---

## Gap de Diagnóstico: Bug 1 & 2 — Causa raiz real do "sem som"

O plano propõe remover `{ once: true }` dos listeners e remover o `sharedAudioContext.close()`. A análise da causa raiz está **parcialmente correta**:

**AudioContext close (linhas 463-469)**: É real — quando `sharedAudioContextUsers` cai a 0 durante transições entre timeline items, após 5s o contexto é fechado. O próximo componente cria um novo contexto que nasce `suspended` no iOS sem gesto do usuário. **Esta correção é válida.**

**`{ once: true }` (linhas 446-448)**: Os listeners de unlock são registrados a cada mount de `useV7SoundEffects`. Como cada sub-exercício e o V8InlineExercise cada um instanciam o hook, os listeners são re-registrados frequentemente. Remover `{ once: true }` fará os listeners persistirem, mas há um risco: cada clique/toque chamará `ctx.resume()` para CADA instância ativa do hook. Com 2+ instâncias simultâneas (V8InlineExercise + sub-exercício), cada toque dispara 2+ chamadas a `resume()`. Isso não é destrutivo, mas é desperdício. **A correção é válida mas o impacto é menor do que descrito.**

**A causa raiz REAL do "sem som" no Timed Quiz e CompletionScreen**: O TimedQuizExercise JÁ tem `playSound` interno. Se o som não saiu, a única causa possível é o AudioContext estar `closed` ou `suspended`. A correção de remover o `close()` resolve isto.

---

## Item sólido: Bug 3 — Shimmer nas estrelas

O plano de adicionar animação golden shimmer em loop com stagger delay por índice está correto. O código atual em `V8LessonRating.tsx` (linhas 155-172) renderiza estrelas estáticas `text-slate-300`. A adição de `framer-motion` animate com loop infinito e parada condicional (`rating > 0`) é implementável sem efeitos colaterais.

---

## Item com diagnóstico incorreto: Bug 4 — Formatação do conteúdo

O plano propõe "enriquecer o markdown renderer para que texto simples tenha visual premium" adicionando auto-detecção de padrões como "Primeiro:", "Segundo:" e renderizando como callout cards.

**Evidência forense**: O `V8ContentSection.tsx` JÁ possui formatação completa:
- Listas: `bg-muted/50 rounded-xl px-4 py-3 border border-border/40` (linha 214)
- Bold: `text-primary` (linha 230)
- Itálico: `bg-primary/10 px-1.5 py-0.5 rounded-md` (linha 233)
- Blockquote: `border-l-4 border-primary/40 bg-primary/5 rounded-r-xl` (linha 248)

**O problema é de DADOS, não de código.** Se o conteúdo V2 da bridge não usa markdown (sem `**bold**`, sem `- listas`, sem `> blockquotes`), o renderer não tem nada para estilizar. Adicionar heurísticas de auto-detecção (tipo "Primeiro:") cria fragilidade — falsos positivos em conteúdos futuros.

**Abordagem correta**: Verificar se o pipeline da bridge V2 está gerando conteúdo com markdown formatting. Se não estiver, a correção pertence ao pipeline, não ao renderer.

---

## Plano corrigido (3 correções + 1 investigação)

### 1. AudioContext lifecycle — remover close()
**Arquivo:** `src/components/lessons/v7/cinematic/useV7SoundEffects.ts`
- Linhas 463-469: remover o bloco que fecha o `sharedAudioContext`
- Manter o contador `sharedAudioContextUsers` apenas para debug
- Isto resolve o "sem som" no TimedQuiz e na CompletionScreen

### 2. Remover playSound duplicado do V8InlineExercise
**Arquivo:** `src/components/lessons/v8/V8InlineExercise.tsx`
- Linha 49: remover `playSound(didPass ? "quiz-correct" : "quiz-wrong")`
- Linha 38: remover `const { playSound } = useV7SoundEffects(0.6, true)`
- Linha 20: remover import de `useV7SoundEffects`
- Todos os 8 sub-exercícios já tocam sons internamente — o wrapper NÃO deve duplicar

### 3. Shimmer dourado nas estrelas do rating
**Arquivo:** `src/components/lessons/v8/V8LessonRating.tsx`
- Adicionar animação `framer-motion` nas estrelas com stagger sequencial (estrela 1→5)
- Animate: `opacity: [0.3, 1, 0.3]`, `scale: [1, 1.15, 1]` com cor `text-amber-400/fill-amber-400`
- Condição de parada: `rating > 0` → estrelas fixas, sem shimmer
- Transition: `repeat: Infinity`, duration 2.5s, delay `i * 0.3`

### 4. Conteúdo — investigar pipeline (NÃO alterar renderer)
**Ação:** NÃO modificar `V8ContentSection.tsx`. O renderer está correto.
- Investigar se o prompt da bridge V2 está gerando markdown formatting no conteúdo das seções
- Se necessário, ajustar o prompt do pipeline para incluir `**bold**`, `- listas` e `> blockquotes`

### Arquivos a editar
1. `src/components/lessons/v7/cinematic/useV7SoundEffects.ts` — remover close()
2. `src/components/lessons/v8/V8InlineExercise.tsx` — remover playSound duplicado
3. `src/components/lessons/v8/V8LessonRating.tsx` — shimmer dourado

