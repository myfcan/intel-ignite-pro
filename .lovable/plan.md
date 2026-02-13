

# TimedQuizExercise — Plano Detalhado

## Resumo

Novo tipo de exercicio `timed-quiz` com cronometro regressivo por pergunta, bonus de XP por tempo restante, efeitos visuais de urgencia progressiva, e sons sintetizados de tick-tock que aceleram nos ultimos segundos. Visual sofisticado (persona 38+), integrado ao pipeline existente de exercicios.

---

## Schema Completo

```typescript
// Em exerciseSchemas.ts

export interface TimedQuizQuestion {
  id: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  timeOverride?: number; // Tempo customizado para esta pergunta (sobrescreve timePerQuestion)
}

export interface TimedQuizExerciseData {
  timePerQuestion: number;       // Segundos por pergunta (default: 15)
  bonusPerSecondLeft: number;    // XP bonus por segundo restante (default: 2)
  timeoutPenalty: 'skip' | 'wrong'; // O que acontece no timeout
  visualTheme: 'cyber' | 'minimal'; // Tema visual
  questions: TimedQuizQuestion[];
  feedback?: {
    perfect: string;
    good: string;
    needsReview: string;
    timeBonus: string;           // "Voce ganhou X pontos bonus por velocidade!"
  };
}
```

---

## Estados do Timer

```text
ESTADO           TEMPO RESTANTE    COMPORTAMENTO
------------------------------------------------------------
normal           > 5s              Timer branco, barra cyan, sem urgencia
warning          3s - 5s           Timer amarelo, barra laranja, pulse sutil
critical         1s - 3s           Timer vermelho, barra vermelha, shake leve,
                                   tick-tock acelera (2x freq)
timeout          0s                Flash vermelho, glitch visual,
                                   som de buzzer, pergunta marcada
answered         (qualquer)        Timer congela, mostra bonus se correto
```

### Maquina de estados simplificada

```text
                 +-----------+
                 |  WAITING  |  (card aparece, timer nao iniciou)
                 +-----+-----+
                       |
                       v
                 +-----------+
            +--->|  NORMAL   |  (> 5s restantes)
            |    +-----+-----+
            |          |
            |          v tempo <= 5s
            |    +-----------+
            |    |  WARNING  |  (3s - 5s)
            |    +-----+-----+
            |          |
            |          v tempo <= 3s
            |    +-----------+
            |    | CRITICAL  |  (1s - 3s, tick acelerado)
            |    +-----+-----+
            |          |
            |    +-----+-----+
            |    |  TIMEOUT  |  tempo = 0 → buzzer + skip/wrong
            |    +-----------+
            |          |
    proxima |    +-----+-----+
    pergunta+----|  ANSWERED  |  usuario clicou uma opcao
                 +-----------+
```

---

## Mecanica de Pontuacao

| Evento | Calculo |
|---|---|
| Resposta correta | 100 pontos base |
| Bonus por tempo | `secondsLeft * bonusPerSecondLeft` pontos extra |
| Resposta incorreta | 0 pontos |
| Timeout (skip) | 0 pontos, avanca para proxima |
| Timeout (wrong) | 0 pontos, marca como errada |
| Score final | `(totalPontos / maxPossivel) * 100` (percentual) |

Exemplo com `timePerQuestion: 15`, `bonusPerSecondLeft: 2`:
- Responde em 5s (10s restantes): 100 + 20 = 120 pontos
- Responde em 12s (3s restantes): 100 + 6 = 106 pontos
- Responde em 15s (timeout): 0 pontos

---

## Efeitos Visuais por Estado

### Estado NORMAL (> 5s)

- Barra de progresso circular ou linear com gradiente `cyan -> emerald`
- Timer numerico grande no centro/topo (MM:SS ou apenas segundos)
- Card de pergunta com borda `border-white/10`
- Background neutro escuro (`from-slate-900 to-slate-950`)

### Estado WARNING (3s - 5s)

- Barra muda para gradiente `amber -> orange`
- Timer muda cor para `text-amber-400`
- Borda do card pulsa: `border-amber-400/30` -> `border-amber-400/60` (keyframe 1s)
- Background sutil pulse (opacity oscila 0.02)

### Estado CRITICAL (1s - 3s)

- Barra muda para `red-500`
- Timer muda para `text-red-400` com `animate-pulse`
- Borda do card: shake leve (`x: [-2, 2, -2, 0]`, loop)
- Vignette escura nas bordas da tela (radial gradient overlay)
- Numeros do timer escalam brevemente (`scale 1.1`) a cada segundo

### Estado TIMEOUT (0s)

- Flash vermelho fullscreen (overlay `bg-red-500/20` por 300ms)
- Card faz glitch visual: `translateX` random + `opacity flicker` por 400ms
- Timer mostra "00" com `text-red-500`
- Mensagem "Tempo esgotado!" com fade-in

### Resposta CORRETA

- Ring de luz expandindo (igual ao FlipCardQuiz)
- Opcao correta pulsa `bg-emerald-500/20` + `border-emerald-400`
- Badge "+Xs bonus" aparece ao lado do timer com `animate-bounce`
- Confetti localizado

### Resposta INCORRETA

- Shake no card (`x: [-4, 4, -4, 0]`)
- Opcao errada: `bg-red-500/20` + `border-red-400`
- Opcao correta revelada com highlight emerald
- Sem confetti

---

## Efeitos Sonoros por Estado

| Estado / Evento | Som | Descricao |
|---|---|---|
| Timer iniciando | `click-confirm` | Pop de inicio |
| Tick normal (cada segundo) | `progress-tick` | Tick sutil, 1x por segundo |
| Warning (< 5s) | `progress-tick` com pitch +20% | Tick mais agudo |
| Critical (< 3s) | `progress-tick` 2x/s, pitch +40% | Tick acelerado e mais agudo |
| Timeout | Novo som `timer-buzzer` | Buzzer curto descendente |
| Selecionar opcao | `snap-success` | Pop de selecao |
| Resposta correta | `combo-hit` + `quiz-correct` (150ms) | Mesmo padrao do FlipCard |
| Resposta incorreta | `quiz-wrong` | Descending minor 2nd |
| Todas corretas | `streak-bonus` + confetti | Streak fire |
| Score perfeito | `level-up` + confetti explosion | Fanfarra heroica |
| Bonus de tempo alto (>10s) | `count-up` rapido (3x) | Coin counter |

### Novo som a adicionar: `timer-buzzer`

Sera adicionado ao `useV7SoundEffects.ts`:
- Descending sweep (800Hz -> 200Hz) em 0.3s com sawtooth
- Noise burst lowpass para "weight"
- Sutil, nao agressivo (persona 38+)

---

## Layout Responsivo

```text
MOBILE                          DESKTOP
+----------------------+        +----------------------------------+
|     [TIMER: 12s]     |        |          [TIMER: 12s]            |
|   ████████░░░░ (80%) |        |     ██████████████░░░░ (80%)     |
|                      |        |                                  |
| +------------------+ |        |    +------------------------+    |
| |   Pergunta aqui   | |        |    |    Pergunta aqui        |    |
| |   com texto       | |        |    |    com texto mais       |    |
| +------------------+ |        |    |    espaco                |    |
|                      |        |    +------------------------+    |
| [  Opcao A         ] |        |                                  |
| [  Opcao B         ] |        |    [  Opcao A  ]  [  Opcao B  ]  |
| [  Opcao C         ] |        |    [  Opcao C  ]  [  Opcao D  ]  |
| [  Opcao D         ] |        |                                  |
|                      |        |    Q 2/5     Bonus: +14 pts      |
| Q 2/5  Bonus: +14   |        +----------------------------------+
+----------------------+
```

- Mobile: opcoes empilhadas verticalmente, timer no topo
- Desktop: opcoes em grid 2x2, mais espaco, timer maior
- Barra de progresso do timer: linear horizontal em ambos

---

## Arquivos a Criar/Modificar

| Arquivo | Acao |
|---|---|
| `src/types/exerciseSchemas.ts` | Adicionar `TimedQuizQuestion`, `TimedQuizExerciseData`, union `ExerciseConfigTyped` |
| `src/types/guidedLesson.ts` | Adicionar `'timed-quiz'` ao union de tipos |
| `src/components/lessons/TimedQuizExercise.tsx` | CRIAR componente completo |
| `src/components/lessons/ExercisesSection.tsx` | Adicionar import + case `timed-quiz` |
| `src/components/lessons/v7/cinematic/useV7SoundEffects.ts` | Adicionar som `timer-buzzer` + `timer-tick` ao SoundType e switch |

---

## Exemplo de JSON para Pipeline

```json
{
  "id": "timed-quiz-1",
  "type": "timed-quiz",
  "title": "Desafio Relampago: IA na Pratica",
  "instruction": "Responda rapido! Cada segundo conta para seu bonus.",
  "data": {
    "timePerQuestion": 15,
    "bonusPerSecondLeft": 2,
    "timeoutPenalty": "skip",
    "visualTheme": "cyber",
    "questions": [
      {
        "id": "q1",
        "question": "Qual ferramenta de IA e mais indicada para gerar imagens a partir de texto?",
        "options": [
          { "id": "a", "text": "ChatGPT", "isCorrect": false },
          { "id": "b", "text": "Midjourney", "isCorrect": true },
          { "id": "c", "text": "Notion AI", "isCorrect": false },
          { "id": "d", "text": "Grammarly", "isCorrect": false }
        ],
        "explanation": "Midjourney e especializado em geracao de imagens por prompt."
      },
      {
        "id": "q2",
        "question": "O que significa 'prompt engineering'?",
        "options": [
          { "id": "a", "text": "Programar uma IA do zero", "isCorrect": false },
          { "id": "b", "text": "Criar instrucoes otimizadas para IAs generativas", "isCorrect": true },
          { "id": "c", "text": "Treinar modelos de machine learning", "isCorrect": false }
        ],
        "explanation": "Prompt engineering e a arte de formular instrucoes que maximizam a qualidade do output da IA."
      }
    ],
    "feedback": {
      "perfect": "Incrivel! Respostas perfeitas e rapidas!",
      "good": "Otimo desempenho! Continue praticando.",
      "needsReview": "Revise os conceitos e tente novamente.",
      "timeBonus": "Voce ganhou bonus de velocidade!"
    }
  }
}
```

