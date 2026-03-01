

# Plano Definitivo: Modelo "Rolo" (Scroll Continuo) para V8 Player

## Diagnostico do Problema Real

**Codigo atual** (V8LessonPlayer.tsx, linha 91):
```tsx
<AnimatePresence mode="wait">
```
Isso renderiza **1 item por vez** e o substitui com animacao. Consequencias:
- Imagens verticais ficam comprimidas numa unica tela
- Conteudo desaparece ao avancar (nao ha contexto visual)
- Imagens passam por debaixo do audio player e botao por falta de espaco vertical

**Solucao**: Substituir `AnimatePresence mode="wait"` por um loop `timeline.slice(0, currentIndex + 1).map(...)` que empilha todos os itens ja visitados verticalmente.

---

## Arquivo 1: `V8ContentSection.tsx` — Reordenar e simplificar

### 1A. Mover imagem para DEPOIS do markdown
**Estado atual** (linhas 62-79): Titulo -> Imagem -> Markdown -> Audio
**Estado novo**: Titulo -> Markdown -> Imagem -> Audio

Mover o bloco JSX da imagem (linhas 69-79) para depois do bloco markdown (que termina na linha 127).

### 1B. Eliminar toda logica de zoom/scale adaptativo
**Remover** (linhas 28-53): `handleImageLoad`, `imageRatio`, `isNarrowPortrait`, `isPortrait`, `isSquareOrCompact`, e todas as classes condicionais `imageWrapperClasses` e `imageClasses`.

**Substituir** por imagem simples:
```tsx
{section.imageUrl && (
  <div className="flex justify-center mt-4 mb-2">
    <img
      src={section.imageUrl}
      alt={cleanTitle}
      className="w-full max-w-md rounded-2xl object-contain"
      loading="lazy"
    />
  </div>
)}
```
- `w-full max-w-md` (448px max) limita largura sem forcar altura
- `object-contain` preserva proporcao original
- Sem `overflow-hidden`, sem `scale-[]`, sem `max-h` fixo
- Imagens verticais ocupam seu espaco natural no rolo

### 1C. Remover `useState` de `imageRatio`
Limpar import de `useState` se nao for mais usado (atualmente linha 1).

---

## Arquivo 2: `V8LessonPlayer.tsx` — Renderizacao em rolo

### 2A. Adicionar `useRef` para scroll automatico
```tsx
import { useCallback, useRef } from "react";
```
Criar array de refs:
```tsx
const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
```

### 2B. Substituir `AnimatePresence mode="wait"` por loop acumulativo
**Remover** (linhas 91-153): O bloco inteiro do `AnimatePresence` que renderiza `currentItem`.

**Substituir** por:
```tsx
{state.phase === "content" && (
  <div className="flex flex-col gap-8">
    {timeline.slice(0, state.currentIndex + 1).map((item, idx) => {
      const isLast = idx === state.currentIndex;
      return (
        <motion.div
          key={`timeline-${idx}`}
          ref={(el) => { itemRefs.current[idx] = el; }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col"
        >
          {item.type === "section" && (
            <V8ContentSection
              section={lessonData.sections[item.index]}
              mode={state.mode}
              sectionIndex={idx}
              isActiveAudio={state.mode === "listen" && isLast}
              onAudioEnded={state.mode === "listen" && isLast ? advance : undefined}
            />
          )}

          {item.type === "quiz" && (
            <V8QuizInline
              quiz={item.quiz}
              onAnswer={handleQuizAnswer}
              onContinue={isLast ? advance : undefined}
              isActiveAudio={state.mode === "listen" && isLast}
            />
          )}

          {item.type === "playground" && (
            <V8PlaygroundInline
              playground={item.playground}
              onContinue={isLast ? advance : undefined}
              onScore={(s) => addScore(s)}
            />
          )}
        </motion.div>
      );
    })}

    {/* Botao "Continuar" — somente modo leitura + item atual eh secao */}
    {state.mode === "read" && currentItem?.type === "section" && (
      <motion.button
        key={`continue-${state.currentIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={advance}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-colors"
      >
        Continuar
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    )}
  </div>
)}
```

### 2C. Auto-scroll ao avancar
Adicionar `useEffect` para scroll suave quando `currentIndex` muda:
```tsx
useEffect(() => {
  if (state.phase === "content" && state.currentIndex > 0) {
    const timer = setTimeout(() => {
      itemRefs.current[state.currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
    return () => clearTimeout(timer);
  }
}, [state.currentIndex, state.phase]);
```
O `setTimeout(100ms)` garante que o DOM ja renderizou o novo item antes do scroll.

### 2D. Separador visual entre secoes
Adicionar um `<hr>` ou divisor entre itens no rolo para clareza visual:
```tsx
{idx > 0 && <hr className="border-slate-100" />}
```
Dentro do gap-8 do container, isso cria separacao sutil.

### 2E. Quiz/Playground `onContinue` condicional
**Problema potencial**: No modelo atual, quiz e playground recebem `onContinue={advance}` sempre. No rolo, se o usuario ja passou do quiz (idx < currentIndex), nao deve chamar `advance` novamente.

**Solucao**: Passar `onContinue` apenas para o item mais recente (`isLast`). Items anteriores ficam visiveis mas sem botao de avanco funcional. Isso esta coberto no codigo acima com `isLast ? advance : undefined`.

**Impacto no V8QuizInline.tsx**: O componente usa `onContinue` nos botoes "Continuar" dos feedbacks (linhas 151, 190, 216). Se `onContinue` for `undefined`, o botao nao fara nada. Precisamos condicionar a renderizacao desses botoes:
```tsx
{onContinue && (
  <button onClick={onContinue} ...>Continuar</button>
)}
```
Aplicar nas linhas 150-155 (feedback correto), 186-191 (feedback errado), 214-219 (reforco).

**Impacto no V8PlaygroundInline.tsx**: O botao "Continuar Aula" na fase "done" (linha 324-330) tambem precisa da mesma condicional:
```tsx
{onContinue && (
  <button onClick={onContinue} ...>Continuar Aula</button>
)}
```

---

## Arquivo 3: `useV8Player.ts` — Sem mudancas estruturais

O hook ja funciona corretamente para o modelo rolo:
- `currentIndex` controla quantos itens sao visiveis (slice 0..currentIndex)
- `advance()` incrementa currentIndex (linha 74-82)
- `timeline` permanece identico
- `totalContentSteps` permanece identico

Nenhuma alteracao necessaria.

---

## Arquivo 4: `V8QuizInline.tsx` — Condicionar botoes "Continuar"

Tornar `onContinue` opcional na interface:
```tsx
onContinue?: () => void;  // era obrigatorio
```

Condicionar renderizacao dos 3 botoes "Continuar" (linhas 150-155, 186-191, 214-219):
```tsx
{onContinue && (
  <button onClick={onContinue}>Continuar <ArrowRight /></button>
)}
```

---

## Arquivo 5: `V8PlaygroundInline.tsx` — Condicionar botao final

Tornar `onContinue` opcional:
```tsx
onContinue?: () => void;
```

Condicionar botao "Continuar Aula" na fase "done" (linhas 324-330).

---

## Resumo de Arquivos Modificados

| Arquivo | Mudanca | Linhas afetadas |
|---|---|---|
| `V8ContentSection.tsx` | Imagem depois do markdown, remover zoom/scale | ~30 linhas removidas, ~8 adicionadas |
| `V8LessonPlayer.tsx` | Loop acumulativo + scrollIntoView + useEffect | ~60 linhas reescritas |
| `V8QuizInline.tsx` | `onContinue` opcional, condicionar 3 botoes | ~6 linhas |
| `V8PlaygroundInline.tsx` | `onContinue` opcional, condicionar 1 botao | ~3 linhas |
| `useV8Player.ts` | Nenhuma | 0 |

## Riscos e Mitigacoes

| Risco | Mitigacao |
|---|---|
| Audio de secoes anteriores tocando simultaneamente | `isActiveAudio` ja eh `false` para itens anteriores (idx !== currentIndex) — autoPlay nao dispara |
| Scroll nao funciona se item ainda nao renderizou | `setTimeout(100ms)` antes do `scrollIntoView` |
| Quiz anterior permite clicar "Continuar" de novo | `onContinue={undefined}` para itens nao-ultimos |
| Performance com muitas secoes renderizadas | V8 tem tipicamente 5-8 secoes — sem impacto |

