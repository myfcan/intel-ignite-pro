

# Flipcard Quiz Exercise — Layout Responsivo e Efeitos Premium

## Resumo

Criar o componente `FlipCardQuizExercise` com layout responsivo (1 card no mobile, 3 no desktop), flip 3D via Framer Motion, efeitos visuais de "glow/brilho" ao revelar respostas, e sons gamificados integrados. Visual adulto e sofisticado (sem iconografia infantil).

## O que muda

### 1. Novo tipo no schema de exercicios
**Arquivo:** `src/types/exerciseSchemas.ts`
- Adicionar `FlipCardQuizCard` e `FlipCardQuizExerciseData`
- Adicionar ao union `ExerciseConfigTyped`

### 2. Novo tipo no ExerciseConfig
**Arquivo:** `src/types/guidedLesson.ts`  
- Adicionar `'flipcard-quiz'` ao union de tipos na linha 110

### 3. Novo componente FlipCardQuizExercise
**Arquivo:** `src/components/lessons/FlipCardQuizExercise.tsx` (CRIAR)

**Layout responsivo:**
- Mobile (< 768px): 1 card por vez, swipe/botoes para navegar
- Desktop (>= 768px): Ate 3 cards visiveis, card central em destaque

**Visual adulto e sofisticado:**
- Gradientes escuros com acentos em cyan/emerald/purple (paleta do AIliv)
- Bordas sutis com `border-white/10`, sombras com `shadow-2xl`
- Tipografia clean, sem emojis infantis nos cards
- Icones Lucide minimalistas (Brain, Lightbulb, Zap) em vez de emojis cartoon

**Flip 3D com Framer Motion:**
- `rotateY(180deg)` com `perspective(1200px)`
- `backface-visibility: hidden` para ambos os lados
- Duracao de 0.6s com easing `easeInOut`

**Efeito de brilho ao revelar resposta:**
- Ao virar o card: pulse de glow com `box-shadow` animado (cyan/emerald)
- Ao acertar: ring de luz expandindo (`scale 1 -> 1.5, opacity 1 -> 0`) + particulas via canvas-confetti localizado
- Ao errar: shake sutil (`x: [-4, 4, -4, 0]`) com borda vermelha momentanea

**Sons integrados (useV7SoundEffects):**
- Flip: `click-confirm`
- Selecionar opcao: `snap-success`
- Acerto: `combo-hit` + `quiz-correct` (150ms delay)
- Erro: `quiz-wrong`
- Ultimo card correto: `streak-bonus` + confetti
- Score perfeito: `level-up`

### 4. Registro no ExercisesSection
**Arquivo:** `src/components/lessons/ExercisesSection.tsx`
- Import do `FlipCardQuizExercise`
- Novo bloco condicional `currentExercise.type === 'flipcard-quiz'`

## Detalhes Tecnicos

### Schema do FlipCardQuizCard

```typescript
interface FlipCardQuizCard {
  id: string;
  front: {
    icon?: string;       // Nome Lucide (Brain, Zap, Target...)
    label: string;       // "Conceito 1", "Desafio 3"
    color?: string;      // Acento: 'cyan' | 'emerald' | 'purple' | 'amber'
  };
  back: {
    text: string;        // Pergunta ou conceito revelado
    image?: string;      // URL opcional
  };
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}
```

### Responsividade

```text
MOBILE (< 768px)          DESKTOP (>= 768px)
+----------------+        +-------+  +--------+  +-------+
|                |        | Card  |  | CARD   |  | Card  |
|   CARD UNICO   |        |  prev |  | ATUAL  |  |  next |
|   (100% width) |        | (dim) |  | (glow) |  | (dim) |
|                |        +-------+  +--------+  +-------+
+----------------+
  < prev  next >             navegacao por clique
```

- Mobile usa `useIsMobile()` hook existente
- Cards laterais no desktop tem `opacity-50` e `scale-0.85`
- Card central tem `scale-1.05` com sombra glow

### Efeito Glow na Revelacao

Quando o card vira e revela a resposta:
1. `box-shadow` animado: `0 0 0px cyan` -> `0 0 30px cyan` -> `0 0 15px cyan`
2. Borda muda de `border-white/10` para `border-cyan-400/50`
3. Background pulse sutil no card
4. Som `reveal` toca simultaneamente

Quando usuario acerta:
1. Ring de luz expansiva (div absoluto com scale animation)
2. Confetti localizado (origin no card, nao fullscreen)
3. Opcao correta pulsa com `bg-emerald-500/20` e borda `border-emerald-400`
4. Texto "Correto!" com fade-in

### Arquivos Modificados/Criados

| Arquivo | Acao |
|---|---|
| `src/types/exerciseSchemas.ts` | Adicionar schema FlipCardQuiz |
| `src/types/guidedLesson.ts` | Adicionar 'flipcard-quiz' ao union (linha 110) |
| `src/components/lessons/FlipCardQuizExercise.tsx` | CRIAR componente completo |
| `src/components/lessons/ExercisesSection.tsx` | Adicionar import + case |

