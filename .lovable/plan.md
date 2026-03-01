
# Plano Refinado: 3 Correcoes no V8 Player

## Evidencias Reais do Codigo Atual

### Evidencia 1 — Ordem atual (Titulo -> Markdown -> Imagem -> Audio)
Arquivo: `src/components/lessons/v8/V8ContentSection.tsx`, linhas 170-257:
```tsx
{/* Section title */}
<h2 className="text-xl font-bold leading-snug text-slate-900">
  {cleanTitle}
</h2>

{/* Markdown body */}
<div className="v8-markdown text-[17px] leading-[1.75] text-slate-700 mt-[7px] ...">
  <ReactMarkdown ...>{sanitizedContent}</ReactMarkdown>
</div>

{/* Image — AFTER markdown content */}
{section.imageUrl && (
  <div className="flex justify-center mt-[7px]">
    <V8TrimmedImage src={section.imageUrl} alt={cleanTitle}
      className="w-full max-w-md rounded-2xl object-contain" />
  </div>
)}

{/* Audio player — inline */}
{section.audioUrl && (
  <div className="mt-[7px]">
    <V8AudioPlayer ... />
  </div>
)}
```

**Problema**: O usuario quer imagem ANTES do markdown (Titulo -> Imagem -> Conteudo). E a imagem usa `max-w-md` (448px), grande demais.

### Evidencia 2 — Imagem usa `max-w-md` (448px)
Linha 243: `className="w-full max-w-md rounded-2xl object-contain"`

### Evidencia 3 — Audio player esta DENTRO de cada V8ContentSection
Linhas 248-256: cada secao renderiza seu proprio `V8AudioPlayer` inline no rolo.

### Evidencia 4 — Botao "Continuar" esta DENTRO do rolo scrollavel
`V8LessonPlayer.tsx`, linhas 152-165:
```tsx
{state.mode === "read" && currentItem?.type === "section" && (
  <motion.button ... onClick={advance}
    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-600 ...">
    Continuar <ArrowRight className="w-4 h-4" />
  </motion.button>
)}
```

### Evidencia 5 — Pipeline gera imagem 1024x1024
`supabase/functions/v8-generate-section-image/index.ts`, linha 216:
```tsx
form.append("size", "1024x1024");
```

### Evidencia 6 — Quiz e Playground tem seus proprios botoes "Continuar" internos
`V8QuizInline.tsx` linhas 150-153 e `V8PlaygroundInline.tsx` linhas 324-328 renderizam botoes `onContinue` dentro do proprio componente. Esses NAO devem ser movidos para a barra fixa — ficam no rolo.

---

## Correcao 1: Reduzir imagem em ~28%

### Frontend — `V8ContentSection.tsx`
Linha 243: trocar `max-w-md` por `max-w-xs` (320px, reducao de 28.6%).

```tsx
// ANTES:
className="w-full max-w-md rounded-2xl object-contain"

// DEPOIS:
className="w-full max-w-xs rounded-2xl object-contain"
```

### Pipeline — `supabase/functions/v8-generate-section-image/index.ts`
Linha 216: trocar `1024x1024` por `512x512` para aulas futuras.

```tsx
// ANTES:
form.append("size", "1024x1024");

// DEPOIS:
form.append("size", "512x512");
```

**Nota**: Aulas ja geradas com 1024x1024 serao reduzidas pelo `max-w-xs` no CSS. Aulas futuras ja nascerao menores no pipeline.

---

## Correcao 2: Inverter ordem para Titulo -> Imagem -> Markdown

### `V8ContentSection.tsx`
Mover o bloco da imagem (linhas 237-246) para ANTES do bloco de markdown (linha 175).

Nova ordem no JSX:
```text
1. <h2> titulo </h2>
2. {section.imageUrl && <V8TrimmedImage ... />}     ← MOVIDO PARA CIMA
3. <div className="v8-markdown"> ... </div>
4. (audio player removido daqui — vai para barra fixa)
```

---

## Correcao 3: Player de audio + botao "Continuar" fixos no fundo

### Arquitetura da barra fixa

```text
+------------------------------------------+
|  [rolo scrollavel com pb-32]             |
|    Titulo                                |
|    Imagem (max-w-xs)                     |
|    Markdown                              |
|    --- hr ---                            |
|    Quiz (com seu proprio botao)          |
|    Playground (com seu proprio botao)    |
+==========================================+
|  BARRA FIXA (fixed bottom-0 z-50)       |
|  bg-white border-t shadow               |
|  +--------------------------------------+
|  | [AudioPlayer]       [Continuar ->]   |
|  +--------------------------------------+
+==========================================+
```

### Regras de visibilidade da barra fixa

A barra fixa so aparece quando `state.phase === "content"` E o item atual e do tipo `"section"`. Quando o item ativo e quiz ou playground, esses componentes usam seus proprios botoes internos, e a barra fixa fica oculta.

### Mudancas em `V8ContentSection.tsx`

1. Remover o bloco de audio player (linhas 248-256) — o audio sera gerenciado pelo player.
2. A prop `onAudioEnded` e `isActiveAudio` permanecem na interface mas nao serao mais usadas dentro do componente (podem ser removidas da interface tambem para limpeza).
3. Remover import de `V8AudioPlayer` deste arquivo.

### Mudancas em `V8LessonPlayer.tsx`

1. Importar `V8AudioPlayer` diretamente.
2. Adicionar `pb-32` ao container scrollavel para compensar a barra fixa.
3. Remover o `<motion.button>` "Continuar" de dentro do rolo (linhas 152-165).
4. Criar barra fixa no fundo:

```tsx
{state.phase === "content" && currentItem?.type === "section" && (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
      {/* Audio player da secao ativa */}
      {currentSectionAudioUrl && (
        <div className="flex-1">
          <V8AudioPlayer
            audioUrl={currentSectionAudioUrl}
            autoPlay={state.mode === "listen"}
            onEnded={advance}
          />
        </div>
      )}
      {/* Botao Continuar — modo read */}
      {state.mode === "read" && (
        <button onClick={advance}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm ...">
          Continuar <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
)}
```

5. Para obter o `currentSectionAudioUrl`, derivar do timeline + lessonData:

```tsx
const currentSectionAudioUrl = useMemo(() => {
  if (state.phase !== "content" || !currentItem || currentItem.type !== "section") return null;
  return lessonData.sections[currentItem.index]?.audioUrl ?? null;
}, [state.phase, currentItem, lessonData.sections]);
```

### Modo "listen" — auto-advance

No modo `listen`, o audio da secao ativa toca automaticamente (`autoPlay={state.mode === "listen"}`). Quando termina, `onEnded={advance}` avanca para o proximo item. Se o proximo item for quiz ou playground, a barra fixa desaparece e esses componentes assumem o controle com seus proprios botoes.

---

## Gap Analysis — Problemas Identificados e Resolvidos

| Gap | Descricao | Resolucao |
|-----|-----------|-----------|
| G1 | Quiz/Playground tem botoes proprios — conflito com barra fixa? | Barra fixa so aparece quando `currentItem.type === "section"`. Quiz/Playground continuam com botoes internos. |
| G2 | `scrollIntoView` pode rolar item atras da barra fixa | `pb-32` no container scrollavel garante espaco. Tambem usar `block: "center"` no scrollIntoView para melhor posicionamento. |
| G3 | Modo listen: quem dispara `onAudioEnded` agora? | O `V8AudioPlayer` na barra fixa recebe `onEnded={advance}` diretamente. |
| G4 | Audio de quiz tem player proprio? | Sim — `V8QuizInline` ja renderiza seu proprio `V8AudioPlayer` internamente (linhas ~210-216). Nao e afetado. |
| G5 | Prop `onAudioEnded` em V8ContentSection fica orfao? | Remover as props `onAudioEnded` e `isActiveAudio` da interface e do JSX de V8ContentSection. Limpar a interface. |
| G6 | Cache de imagem trimada ja esta com TRIM_VERSION=2? | Sim — ja foi aplicado no commit anterior. Nenhuma acao necessaria. |

---

## Arquivos Alterados (Resumo)

| Arquivo | Tipo de Mudanca |
|---------|----------------|
| `src/components/lessons/v8/V8ContentSection.tsx` | Inverter imagem/markdown, reduzir max-w, remover audio player inline, limpar props |
| `src/components/lessons/v8/V8LessonPlayer.tsx` | Barra fixa com audio + continuar, pb-32, remover botao do rolo |
| `supabase/functions/v8-generate-section-image/index.ts` | size: 1024x1024 -> 512x512 |

## O que NAO muda

- Estrutura do rolo (scroll continuo, `timeline.slice(0, currentIndex+1)`)
- Logica de timeline no `useV8Player.ts`
- `V8QuizInline.tsx` e `V8PlaygroundInline.tsx` (botoes internos intactos)
- `V8Header.tsx`, `V8ModeSelector.tsx`
- Nenhuma tabela ou migracao de banco
- Nenhuma alteracao em `src/integrations/supabase/client.ts`
