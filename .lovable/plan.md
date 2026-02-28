

# Correcao Robusta do V8 Player -- 8 Problemas Criticos

## Diagnostico Forense por Problema

---

### BUG 1: Tags de emocao narradas pelo TTS

**Causa raiz confirmada:** `stripMarkdownForTTS` (linha 346 de `v8-generate/index.ts`) usa lista fechada de tags: `confiante|calmo|enfático|pausa curta|animado|...`. Qualquer tag nao listada (ex: `[pause]` com caixa diferente, `[sério]`, novas tags) passa literal para o ElevenLabs e e narrada como texto.

**Correcao:** Substituir regex de lista fechada por regex generico que remove qualquer `[texto]` com ate 40 caracteres internos. Colocar ANTES da remocao de links markdown (que usa `[texto](url)`) para nao conflitar -- a ordem dos replaces ja garante que links sao tratados antes.

**Arquivo:** `supabase/functions/v8-generate/index.ts` linha 346
```
// DE:
.replace(/\[(confiante|calmo|enfático|...)\]/gi, '')
// PARA:
.replace(/\[(?![^\]]*\]\()[^\]]{1,40}\]/gi, '')
```
O negative lookahead `(?![^\]]*\]\()` garante que links markdown `[texto](url)` nao sejam afetados.

---

### BUG 2: Comentario de meta narrado como "Abertura"

**Causa raiz confirmada:** `v8ContentParser.ts` linhas 46-53 cria automaticamente uma "Secao 0 - Abertura" com qualquer texto entre `#` e `##` que tenha mais de 20 caracteres. Se o usuario escreve "Descricao opcional (vai virar Abertura se voce aplicar o fix do parser)" ali, isso vira conteudo narrado.

**Correcao:** Adicionar filtro de deteccao de meta-comentarios. Se a `description` extraida contem palavras-chave indicativas de instrucoes internas (`parser`, `fix`, `aplicar`, `opcional`, `discutimos`, `TODO`, `FIXME`), ela e descartada e NAO vira secao de Abertura.

**Arquivo:** `src/lib/v8ContentParser.ts` linhas 46-53
```typescript
const META_KEYWORDS = /\b(parser|fix|aplicar|opcional|discutimos|TODO|FIXME|implementar|corrigir)\b/i;
if (description && description.trim().length > 20 && !META_KEYWORDS.test(description)) {
  // ... cria Abertura
}
```

---

### BUG 3: Imagens com fundo quadriculado (checkerboard)

**Causa raiz confirmada:** `V8ContentSection.tsx` linha 52-59 renderiza imagens PNG transparentes sem `background-color`. O navegador mostra checkerboard para transparencia.

**Correcao:** Adicionar `bg-white rounded-2xl p-2` ao container da imagem.

**Arquivo:** `src/components/lessons/v8/V8ContentSection.tsx` linha 52

---

### BUG 4: Tags de emocao visiveis no texto renderizado

**Causa raiz confirmada:** `V8ContentSection.tsx` linha 120 passa `section.content` direto ao ReactMarkdown sem sanitizar tags `[confiante]`, `[pause]`, etc.

**Correcao:** Criar funcao `stripEmotionTags` e aplicar antes do render:
```typescript
const stripEmotionTags = (text: string) =>
  text.replace(/\[(?![^\]]*\]\()[^\]]{1,40}\]/gi, '');
```
Aplicar na linha 120: `{stripEmotionTags(section.content)}`

**Arquivo:** `src/components/lessons/v8/V8ContentSection.tsx`

---

### BUG 5: Navegacao horizontal em vez de vertical

**Causa raiz confirmada:** `V8LessonPlayer.tsx` usa `AnimatePresence mode="wait"` renderizando UMA secao por vez (slide horizontal). O padrao Coursiv e scroll vertical continuo.

**Correcao completa:**

1. **`V8LessonPlayer.tsx`**: Refatorar fase "content" para renderizar TODOS os itens da timeline empilhados verticalmente em scroll. Cada secao, quiz e playground aparece como bloco no fluxo do documento. Usar `IntersectionObserver` para rastrear qual secao esta visivel e atualizar o progresso no header.

2. **`useV8Player.ts`**: Adicionar funcao `goToIndex(index)` para permitir navegacao direta. Manter `currentIndex` como indicador de progresso (secao mais avancada vista), nao como filtro de renderizacao.

3. **`V8ContentSection.tsx`**: Remover botao "Continuar" fixo no rodape individual. O audio player fica inline dentro de cada secao (nao `fixed`). Adicionar `ref` para scroll tracking.

4. **`V8Header.tsx`**: Adicionar mini-dots clicaveis representando as secoes. Cada dot faz `scrollIntoView({ behavior: 'smooth' })` para a secao correspondente.

**Arquivos:** `V8LessonPlayer.tsx`, `useV8Player.ts`, `V8ContentSection.tsx`, `V8Header.tsx`

---

### BUG 6: Tela de conclusao com cores dark mode

**Causa raiz confirmada:** `V8CompletionScreen.tsx` usa extensivamente cores dark: `text-white` (linhas 122, 161, 229), `bg-white/5` (linhas 145, 152, 159), `border-white/10` (linhas 145, 152, 159, 199).

**Correcao -- mapa completo de substituicoes:**

| Linha(s) | De | Para |
|---|---|---|
| 110 | `from-indigo-500/20 to-violet-500/20` | `from-indigo-100 to-violet-100` |
| 110 | `border-indigo-500/30` | `border-indigo-200` |
| 112 | `text-indigo-400` | `text-indigo-500` |
| 122 | `text-white` | `text-slate-900` |
| 130 | `text-slate-400` | `text-slate-500` |
| 145,152,159 | `border-white/10 bg-white/5` | `border-slate-200 bg-slate-50` |
| 146 | `text-indigo-400` | `text-indigo-500` |
| 161 | `text-white` | `text-slate-900` |
| 174 | `from-indigo-500/20 to-violet-500/20` | `from-indigo-100 to-violet-100` |
| 174 | `border-indigo-500/30` | `border-indigo-200` |
| 177 | `text-indigo-300` | `text-indigo-600` |
| 199 | `border-white/10 text-slate-400 hover:text-white hover:bg-white/5` | `border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100` |
| 229 | `text-white` (CountUp) | `text-slate-900` |

**Arquivo:** `src/components/lessons/v8/V8CompletionScreen.tsx`

---

### BUG 7: Modelo ElevenLabs v3 com artefatos de voz

**Causa raiz:** O modelo `eleven_v3` pode estar gerando artefatos de pronuncia. O usuario quer testar `eleven_multilingual_v2` para isolar o problema.

**Correcao:**
1. Trocar `MODEL_ID` de `'eleven_v3'` para `'eleven_multilingual_v2'` (linha 11)
2. Re-habilitar `previous_text`/`next_text` na funcao `generateTTS` (linhas 272-305), pois o v2 suporta request stitching
3. Remover parametros `style` e `use_speaker_boost` se presentes (incompativeis com v2 sem ajuste)

**Arquivo:** `supabase/functions/v8-generate/index.ts`

---

### BUG 8: Player nao navega entre secoes

**Correcao integrada com BUG 5.** Com o layout vertical, a navegacao sera:
- Scroll natural entre secoes
- Dots clicaveis no header que fazem scroll automatico
- Cada secao tem um `id` DOM (`section-{index}`) para ancoragem

**Arquivos:** Mesmos do BUG 5

---

## Resumo de Arquivos e Mudancas

| # | Arquivo | Bugs Corrigidos | Tipo de Mudanca |
|---|---|---|---|
| 1 | `supabase/functions/v8-generate/index.ts` | 1, 7 | Regex generico + modelo v2 + request stitching |
| 2 | `src/lib/v8ContentParser.ts` | 2 | Filtro de meta-comentarios |
| 3 | `src/components/lessons/v8/V8ContentSection.tsx` | 3, 4, 5 | bg-white imagem + strip tags + layout inline |
| 4 | `src/components/lessons/v8/V8LessonPlayer.tsx` | 5, 8 | Scroll vertical + timeline completa renderizada |
| 5 | `src/hooks/useV8Player.ts` | 5, 8 | goToIndex + scroll-based progress |
| 6 | `src/components/lessons/v8/V8Header.tsx` | 8 | Dots de navegacao clicaveis |
| 7 | `src/components/lessons/v8/V8CompletionScreen.tsx` | 6 | Light mode completo |

## Nota sobre Exercicios (Item 8 original)

Verificacao forense: TODOS os 11 componentes de exercicio JA importam e usam `useV7SoundEffects` com `playSound('correct')` e `playSound('wrong')`. Confirmado em: `DragDropLesson.tsx`, `FillInBlanksExercise.tsx`, `CompleteSentenceExercise.tsx`, `ScenarioSelectionExercise.tsx`, `PlatformMatchExercise.tsx`, `DataCollectionExercise.tsx`, `TrueFalseExercise.tsx`, `FlipCardQuizExercise.tsx`, `MultipleChoiceExercise.tsx`, `TimedQuizExercise.tsx`. Se os sons nao estao tocando, o problema e de contexto de AudioContext do browser (requer interacao do usuario antes do primeiro som). Isso sera investigado apos a implementacao dos outros fixes.

