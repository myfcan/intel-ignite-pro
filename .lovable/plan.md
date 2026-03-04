

# Plano: Loading Indicator no Audio + Efeito de Unlock nos Exercicios

## 1. Loading indicator no audio (spinner/pulse quando preload nao completou)

**Onde:** `V8AudioPlayer.tsx`

O componente ja tem estado `isLoaded` que fica `false` ate o `canplaythrough` ou `durationchange` disparar. Basta:

- Quando `autoPlay === true` e `isLoaded === false`: mostrar um indicador de loading (pulse no botao play ou skeleton na barra)
- Quando `isLoaded === true`: transicao suave para o player normal

Implementacao: substituir o botao play por um spinner animado (Loader2 com `animate-spin`) enquanto `!isLoaded && autoPlay`. O resto do player (barra, tempo) mostra skeleton pulse.

## 2. Efeito de "unlock" quando o exercicio libera apos narracao

**Onde:** Todos os wrappers de opcoes nos 5 componentes que usam `audioLocked`

Quando `audioLocked` transiciona de `true` para `false`, as opcoes precisam de um efeito visual que chame a atencao do usuario — indicando "agora voce pode interagir".

**Implementacao:**

- No `useAudioFirstLock.ts`: adicionar estado `justUnlocked` que fica `true` por ~1.5s apos o unlock
- Quando `justUnlocked === true`: aplicar animacao de pulse + glow nas opcoes (ring de indigo com pulse, scale sutil)
- Apos 1.5s: `justUnlocked` volta a `false` e as opcoes ficam no estado normal

**Efeito visual:** As opcoes entram com `scale(0.95) → scale(1)` + um ring pulsante `ring-2 ring-indigo-400 animate-pulse` que desaparece apos 1.5s. Isso cria a sensacao clara de "ativou, pode interagir agora".

## Arquivos editados

1. `V8AudioPlayer.tsx` — loading state visual (spinner no botao, skeleton na barra)
2. `useAudioFirstLock.ts` — adicionar `justUnlocked` com timer de 1.5s
3. `V8QuizInline.tsx` — aplicar classe de unlock effect
4. `V8QuizTrueFalse.tsx` — aplicar classe de unlock effect
5. `V8QuizFillBlank.tsx` — aplicar classe de unlock effect
6. `V8CompleteSentenceInline.tsx` — aplicar classe de unlock effect
7. `V8InlineExercise.tsx` — aplicar classe de unlock effect

## Zero risco

- Loading indicator: so aparece quando `autoPlay && !isLoaded` (nao afeta modo read)
- Unlock effect: so dispara quando `audioLocked` transiciona de true→false (nunca no modo read)

