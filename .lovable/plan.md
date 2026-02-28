

# Correcoes V8 Player + Backend — Plano Robusto com Efeitos Sistemicos

---

## Diagnostico Forense Completo

### Problema 1+2: Titulo longo com "Secao X ---"

**Codigo real** (`V8ContentSection.tsx`, linhas 42-47):
```tsx
<h2 className="text-[28px] font-bold leading-[1.2] text-white"
    style={{ letterSpacing: "-0.01em" }}>
  {section.title}
</h2>
```

O titulo vem do banco sem nenhum tratamento. Exemplo: `"Seção 1 — Abertura: o que você vai destravar hoje v2"`.

**Efeito sistemico**: O `V8Header.tsx` (linha 41) tambem renderiza `title` sem limpeza — mas ali e o titulo da AULA, nao da secao, entao nao precisa da mesma regex. Porem, se futuramente o header tambem receber titulos de secao, o mesmo bug apareceria.

---

### Problema 3: Player fixo cobrindo texto

**Codigo real** (`V8ContentSection.tsx`):
- Linha 39: container com `pb-32` (128px de padding-bottom)
- Linhas 125-134: player fixo com `fixed bottom-0` + gradiente `from-slate-950`
- Linhas 138-149: botao "Continuar" NAO e fixo, esta inline no scroll

**Efeito sistemico**: O botao "Continuar" esta DENTRO do container com `pb-32`, mas o player fixo consome ~120px de altura (padding + player + gradient). Isso significa que em secoes longas, o ultimo paragrafo do markdown + o botao "Continuar" ficam cobertos pelo player. O `pb-32` (128px) nao e suficiente porque o player real tem ~140px de altura total (16px pt-2 + player ~100px + 16px pb-4 + gradiente visual).

**Segundo efeito**: Quando `section.audioUrl` nao existe (secao sem audio), o player nao renderiza mas o `pb-32` ainda esta presente, criando um espaco vazio desnecessario no final.

---

### Problema 4: Voz estranha / parecendo espanhol

**Dados forenses reais comparativos (codigo-fonte)**:

| Config | V5 `generate-lesson-audio` (linha 162) | V8 `v8-generate` (linha 12) |
|--------|----------------------------------------|-----------------------------|
| Voice ID | `Xb7hH8MSUJpSbSDYk0k2` | `Xb7hH8MSUJpSbSDYk0k2` |
| Model | `eleven_v3` | `eleven_v3` |
| stability | `0.5` | `0.5` |
| similarity_boost | `0.75` | `0.75` |
| style | **NAO DEFINIDO** | **`0.3`** |
| use_speaker_boost | **NAO DEFINIDO** | **`true`** |
| output_format | **NAO DEFINIDO** (default) | **`mp3_44100_128` NO BODY** |

**Tres bugs encontrados**:

**Bug A** — `style: 0.3` e `use_speaker_boost: true` alteram a prosodia da voz. O V5 nao usa esses parametros, gerando o timbre "natural" da Alice. O V8 adiciona estilizacao que pode causar sotaque/entonacao estranha.

**Bug B** — `output_format: 'mp3_44100_128'` esta sendo enviado DENTRO do body da request (linha 283). A documentacao oficial da ElevenLabs diz explicitamente: "The output_format parameter must be passed as a query parameter in the URL, NOT in the request body." Isso pode causar comportamento imprevisivel — o parametro pode ser ignorado silenciosamente ou causar resposta em formato inesperado.

**Bug C** — A funcao `stripMarkdownForTTS` (linhas 335-350) NAO remove tags de emocao em colchetes como `[confiante]`, `[calmo]`, `[enfático]`, `[pausa curta]`. Se o conteudo da secao comecar com `[confiante] Oi, pessoal...`, o modelo pode:
1. Interpretar como tag de emocao (mas em portugues, nao em ingles)
2. Narrar a palavra "confiante" literalmente com entonacao distorcida
3. Ambos — gerando o efeito "espanhol"

---

## Plano de Correcao

### Arquivo 1: `src/components/lessons/v8/V8ContentSection.tsx`

**Mudanca 1 — Limpeza do titulo** (linhas 42-47):
```tsx
// ANTES
{section.title}

// DEPOIS
const cleanTitle = section.title.replace(/^Seção\s*\d+\s*[—–\-]\s*/i, '');
// Renderizar cleanTitle em vez de section.title
```

**Mudanca 2 — Reducao da fonte do titulo** (linha 43):
```
// ANTES: text-[28px]
// DEPOIS: text-xl (20px)
```

**Mudanca 3 — Padding-bottom condicional** (linha 39):
```tsx
// ANTES: pb-32 (sempre)
// DEPOIS: pb-48 quando audioUrl existe, pb-8 quando nao existe
className={`flex flex-col gap-6 ${section.audioUrl ? 'pb-48' : 'pb-8'}`}
```
Isso resolve dois problemas: padding insuficiente com player E padding excessivo sem player.

**Mudanca 4 — Tema light mode completo**:
- Container: fundo herdado do pai (branco), textos escuros
- Titulo: `text-slate-900` em vez de `text-white`
- Markdown body: `text-slate-700` em vez de `text-slate-300`
- Headers markdown: `text-slate-900` em vez de `text-white`
- Emphasis: `text-indigo-600` em vez de `text-indigo-300`
- Code inline: `bg-slate-100 text-indigo-600` em vez de `bg-white/10 text-indigo-300`
- Blockquote: `text-slate-500` em vez de `text-slate-400`
- Imagem: remover container `rounded-2xl overflow-hidden` e gradiente overlay, usar `object-contain` centralizado com `-mx-4` para efeito flutuante estilo Coursiv

**Mudanca 5 — Player fixo em light mode** (linhas 126):
```
// ANTES: bg-gradient-to-t from-slate-950 via-slate-950/95
// DEPOIS: bg-gradient-to-t from-white via-white/95
```

**Mudanca 6 — Botao "Continuar" fixo no bottom** (linhas 138-149):
Mover o botao para dentro da barra fixa do player (ou logo abaixo), para que fique sempre visivel como no Coursiv. Quando nao ha audio, o botao fica fixo sozinho no bottom.

---

### Arquivo 2: `src/components/lessons/v8/V8LessonPlayer.tsx`

**Mudanca**: Linha 68 — trocar `bg-slate-950 text-white` por `bg-white text-slate-900`.

**Efeito sistemico**: O fallback de completion (linhas 146-155) tambem usa `text-white` — precisa atualizar para `text-slate-900`.

---

### Arquivo 3: `src/components/lessons/v8/V8Header.tsx`

**Mudanca**:
- Linha 20: `bg-slate-950/90` para `bg-white/90`, `border-white/5` para `border-slate-200`
- Linha 22: progress track `bg-white/5` para `bg-slate-100`
- Linha 34: seta `text-slate-400 hover:text-white hover:bg-white/10` para `text-slate-500 hover:text-slate-900 hover:bg-slate-100`
- Linha 41: `text-slate-300` para `text-slate-700`
- Linha 45: `text-slate-500` para `text-slate-400`

---

### Arquivo 4: `src/components/lessons/v8/V8AudioPlayer.tsx`

**Mudanca light mode**:
- Linha 147: `border-white/10 bg-white/5` para `border-slate-200 bg-slate-50`
- Linha 153: progress track `bg-white/10` para `bg-slate-200`
- Linha 171: time text `text-slate-400` para `text-slate-500`
- Linhas 179, 217: seek buttons `text-slate-400 hover:text-white hover:bg-white/10` para `text-slate-500 hover:text-slate-900 hover:bg-slate-100`
- Linha 187: play button mantem gradiente indigo (identico)
- Linha 227: speed text `text-slate-400 hover:text-white hover:bg-white/10` para `text-slate-500 hover:text-slate-900 hover:bg-slate-100`
- Linha 245: audio bars `bg-indigo-400/60` para `bg-indigo-500/60`

---

### Arquivo 5: `src/components/lessons/v8/V8ModeSelector.tsx`

**Mudanca light mode** (efeito sistemico — faz parte do player):
- Linha 37: `text-white` para `text-slate-900`
- Linha 40: `text-slate-400` para `text-slate-500`
- Linha 56: `border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/30` para `border-slate-200 bg-white hover:bg-slate-50 hover:border-indigo-500/30 shadow-sm`
- Linha 61: `text-white` para `text-slate-900`
- Linha 64: `text-slate-400` para `text-slate-500`

---

### Arquivo 6: `src/components/lessons/v8/V8QuizInline.tsx`

**Mudanca light mode** (efeito sistemico — quiz inline aparece no mesmo player):
- Textos `text-white` para `text-slate-900`
- Backgrounds `bg-white/5` para `bg-white border-slate-200`
- Textos `text-slate-300` para `text-slate-700`
- Links `text-indigo-300` para `text-indigo-600`
- Botoes indigo mantidos

---

### Arquivo 7: `supabase/functions/v8-generate/index.ts`

**Mudanca A — Voice settings** (linhas 12-17):
```typescript
// ANTES
const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: true,
};

// DEPOIS (paridade exata com V5)
const VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
};
```

**Mudanca B — output_format como query parameter** (linhas 280-284, 290-291):
```typescript
// ANTES (body)
const body = {
  text,
  model_id: MODEL_ID,
  output_format: 'mp3_44100_128',  // ERRADO — no body
  voice_settings: VOICE_SETTINGS,
};
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,

// DEPOIS (query param)
const body = {
  text,
  model_id: MODEL_ID,
  voice_settings: VOICE_SETTINGS,
};
const response = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
```

**Mudanca C — Strip emotion tags** (linhas 335-349, adicionar na funcao):
```typescript
.replace(/\[(confiante|calmo|enfático|pausa curta|animado|sério|empolgado|excited|pause|whispers|curious|warm)\]/gi, '')
```
Adicionar esta linha ANTES do `.trim()` final.

---

## Mapa de Efeitos Sistemicos

```text
Mudanca                          Componentes Afetados           Risco
─────────────────────────────────────────────────────────────────────────
Light mode no LessonPlayer       V8LessonPlayer, V8Header,      MEDIO
                                 V8ContentSection, V8AudioPlayer,
                                 V8ModeSelector, V8QuizInline,
                                 V8PlaygroundInline
                                 → Todos precisam ser atualizados
                                   juntos ou ficam inconsistentes

Titulo cleanTitle regex          V8ContentSection                BAIXO
                                 → Apenas display, nao altera dados

Padding pb-48 condicional        V8ContentSection                BAIXO
                                 → Pode precisar ajuste fino em
                                   dispositivos pequenos

Botao Continuar fixo             V8ContentSection                MEDIO
                                 → Conflito de z-index com player
                                   se ambos estiverem fixos

Voice settings V8-generate       Todas as aulas FUTURAS          ALTO
                                 → Aulas ja geradas NAO mudam
                                 → Requer reprocessamento manual

output_format query param        Todas as aulas FUTURAS          MEDIO
                                 → Formato atual pode estar OK
                                   (fallback default), mas nao
                                   deterministico

Strip emotion tags               Todas as aulas FUTURAS          ALTO
                                 → Aulas ja geradas NAO mudam
                                 → Tags [confiante] ja estao
                                   gravadas no audio existente
```

---

## Ordem de Execucao

1. **Edge function `v8-generate`** — Corrigir voice_settings, output_format, e strip emotion tags (3 mudancas, 1 arquivo)
2. **V8LessonPlayer.tsx** — Light mode no container raiz
3. **V8Header.tsx** — Light mode completo
4. **V8AudioPlayer.tsx** — Light mode completo
5. **V8ModeSelector.tsx** — Light mode completo
6. **V8ContentSection.tsx** — Titulo, padding, imagem flutuante, light mode, botao fixo
7. **V8QuizInline.tsx** — Light mode (efeito sistemico)

---

## Nota Critica: Reprocessamento de Audio

As correcoes no backend (voice_settings, output_format, emotion tags) so afetam aulas **geradas apos o deploy**. Para corrigir a aula atual (lesson `8ca4cc83-b142-457e-8628-19d3a0b36bbc`), sera necessario **reprocessar o audio** via o wizard de setup, clicando em "Gerar Audio" novamente.

