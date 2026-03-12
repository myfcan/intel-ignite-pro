

## Análise de Gaps — Plano Refinado

### Gap 1: Som "coin-collect" NÃO EXISTE
O plano original menciona `playSound("coin-collect")` para moedas na tela de gamificação, mas esse tipo de som **não existe** no `useV7SoundEffects`. Os tipos disponíveis são: `progress-tick`, `count-up`, `combo-hit`, `streak-bonus`, `level-up`, `success`, `completion`.

**Fix**: Usar `playSound("combo-hit")` para moedas (som de impacto satisfatório) e `playSound("count-up")` para XP (já existe no hook).

### Gap 2: Formatação de texto — NÃO é bug de código
O `let paragraphCount = 0` está dentro do corpo do componente `forwardRef`, que reseta a cada render. Como cada seção é uma **instância separada** de `V8ContentSection`, o counter reseta corretamente por seção. A formatação premium (lead paragraph, gradient bullets, callout blockquotes) **já se aplica a todas as seções**. O problema original do usuário pode ter sido cache do navegador ou deploy pendente. Não há mudança necessária aqui — remover do plano.

### Gap 3: Timed Quiz — confirmar que NÃO há botões internos de navegação
O resultado do TimedQuiz (linhas 204-235) NÃO tem botões — delegado ao parent `V8InlineExercise`. O redesign deve manter essa regra. Confirmado seguro.

### Gap 4: Rating stars — animação `filter` com drop-shadow
A prop `filter` de CSS funciona com framer-motion via `style`, não via `animate`. Preciso usar `style` inline com `filter: drop-shadow(...)` ou usar `animate` com a prop `filter` que framer-motion suporta como custom CSS. Verificado: framer-motion suporta `filter` em `animate`. Seguro.

---

## Plano Final Corrigido (3 mudanças, não 4)

### 1. Timed Quiz Redesign (`TimedQuizExercise.tsx`)
- **Timer**: Badge compacto com ícone Timer + tempo, ao lado de barra progress com glow
- **Pergunta**: Card separado com fundo `bg-gradient-to-br from-slate-50 to-slate-100`, borda lateral accent, tipografia `text-[16px] font-semibold`
- **Opções**: Cards individuais com letter badges (A, B, C, D) em círculos coloridos, hover com `ring-2 ring-primary/30`, separação visual clara da pergunta
- **Resultado**: Stats em mini-cards com gradientes (acertos em cyan, bônus em amber)
- Manter toda a lógica de timer/state/sons intacta — só redesenhar JSX e classes

### 2. Sons na Completion Screen (`V8CompletionScreen.tsx`)
- Adicionar `playSound("count-up")` ao iniciar contagem de XP (no CountUp via callback)
- Adicionar `playSound("combo-hit")` ao finalizar contagem de moedas
- Adicionar `playSound("level-up")` quando `isNewPatent` aparece (delay 1.2s synced com animação)
- **Approach**: Passar `playSound` como prop para o CountUp, disparar no `onComplete`

### 3. Rating Stars mais evidentes (`V8LessonRating.tsx`)
- Estrelas maiores: `w-10 h-10` (de `w-9 h-9`)
- Opacidade mais agressiva: `[0.3, 1, 0.3]` (range maior)
- Scale mais visível: `[0.85, 1.25, 0.85]` (de `[1, 1.15, 1]`)
- Duração mais rápida: `1.8s` (de `2.5s`)
- Adicionar `filter` com drop-shadow dourado pulsante
- Texto "Toque nas estrelas ⭐" pulsante abaixo das estrelas quando `rating === 0`

### Arquivos editados
1. `src/components/lessons/TimedQuizExercise.tsx`
2. `src/components/lessons/v8/V8CompletionScreen.tsx`
3. `src/components/lessons/v8/V8LessonRating.tsx`

### O que NÃO muda
- Lógica de timer, pontuação, avanço de questões (TimedQuiz)
- Registro de gamification, fetch de streak (CompletionScreen)
- Upsert de rating no banco (LessonRating)
- Nenhum outro exercício é afetado

