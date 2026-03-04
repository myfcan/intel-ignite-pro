

# Plano: Audio-First Lock + Preload para Exercicios no Modo "Ouvir"

## Dois Problemas

1. **Exercicios interativos ficam liberados imediatamente** no modo "ouvir" — o usuario pode clicar antes de ouvir o enunciado narrado
2. **Latencia no start do audio** — quando uma secao ou exercicio entra, o audio demora a comecar porque so inicia o `preload` no momento da renderizacao

## Solucao

### 1. Audio-First Lock (todos os componentes interativos)

Quando `mode === "listen"` e o componente tem `audioUrl`, as opcoes/inputs ficam bloqueados ate o audio terminar.

**Componentes afetados:**

| Componente | audioUrl | Lock |
|---|---|---|
| `V8QuizInline` | `quiz.audioUrl` | Opcoes disabled ate `onEnded` |
| `V8QuizTrueFalse` | `quiz.audioUrl` | Botoes V/F disabled ate `onEnded` |
| `V8QuizFillBlank` | `quiz.audioUrl` | Input/chips disabled ate `onEnded` |
| `V8CompleteSentenceInline` | `completeSentence.audioUrl` | Chips disabled ate `onEnded` |
| `V8InlineExercise` | `exercise.audioUrl` | Exercicio inteiro locked ate `onEnded` |
| `V8PlaygroundInline` | `playground.audioUrl` | Ja tem fluxo de fases — sem mudanca |

**Implementacao por componente:**

- Estado `audioLocked = true` quando `isActiveAudio && audioUrl` existe
- `V8AudioPlayer` com `onEnded={() => setAudioLocked(false)}`
- Overlay visual: opcoes com `opacity-40 pointer-events-none` + badge "🎧 Ouça o enunciado..."
- Transicao suave via `motion.div` ao desbloquear
- No modo "read" ou sem audioUrl: `audioLocked = false` (sem impacto)

### 2. Audio Preload Antecipado (eliminar latencia)

O audio da **proxima secao/exercicio** deve comecar a carregar ANTES de ser necessario.

**Implementacao no `V8LessonPlayer`:**

- Calcular o `nextAudioUrl` olhando `timeline[currentIndex + 1]` e extraindo o audioUrl do proximo item (secao, quiz, exercise, etc)
- Renderizar um `<link rel="preload" as="audio" href={nextAudioUrl}>` no head OU criar um `new Audio(url)` com `preload="auto"` sem play
- Isso garante que quando o item ativo muda, o audio ja esta no cache do browser e o `autoPlay` dispara instantaneamente

**Alteracao no `V8AudioPlayer`:**

- Adicionar evento `canplaythrough` para garantir que o `autoPlay` so dispara quando o buffer esta pronto (ja existe parcialmente)
- Nenhuma mudanca estrutural necessaria

### 3. Arquivos Editados

1. `V8QuizInline.tsx` — adicionar `audioLocked` state + overlay
2. `V8QuizTrueFalse.tsx` — adicionar `audioLocked` state + overlay
3. `V8QuizFillBlank.tsx` — adicionar `audioLocked` state + overlay
4. `V8CompleteSentenceInline.tsx` — adicionar player de audio + `audioLocked` + overlay
5. `V8InlineExercise.tsx` — receber `mode` prop, renderizar player + lock quando `mode === "listen"` e `audioUrl` existe
6. `V8LessonPlayer.tsx` — passar `mode` para componentes + logica de preload do proximo audio

### 4. Riscos

- **Zero risco no modo "read"**: lock so ativa quando `isActiveAudio === true` ou `mode === "listen"` + `audioUrl` presente
- **Zero mudanca no backend**: apenas frontend
- **Preload**: se o proximo item nao tiver audio, nada acontece (graceful no-op)

