
# Correcoes Estruturais do Player V8 — Execucao Imediata

## 3 mudancas cirurgicas, sem reestruturacao

### Mudanca 1: Quiz para de auto-avancar no modo ouvir
**Arquivo**: `src/components/lessons/v8/V8QuizInline.tsx`

- **Linha 68**: Remover `onEnded={onContinue}` do audio da pergunta do quiz
  - De: `<V8AudioPlayer audioUrl={quiz.audioUrl} autoPlay onEnded={onContinue} />`
  - Para: `<V8AudioPlayer audioUrl={quiz.audioUrl} autoPlay />`
- **Linha 212**: Remover `onEnded={onContinue}` do audio de reforco
  - De: `<V8AudioPlayer ... onEnded={onContinue} />`
  - Para: `<V8AudioPlayer ... />`

Resultado: o audio do quiz toca, mas o quiz ESPERA a interacao do usuario antes de avancar.

### Mudanca 2: Modo leitura nao avanca ao terminar audio
**Arquivo**: `src/components/lessons/v8/V8LessonPlayer.tsx`

- **Linha 118**: Condicionar `onAudioEnded` ao modo
  - De: `onAudioEnded={advance}`
  - Para: `onAudioEnded={state.mode === "listen" ? advance : undefined}`

Resultado: no modo "ler", o audio pode tocar livremente mas nunca avanca a tela sozinho. Apenas o botao "Continuar" avanca.

### Mudanca 3: Layout adaptativo para imagens verticais
**Arquivo**: `src/components/lessons/v8/V8ContentSection.tsx`

- Adicionar `useState` para detectar orientacao da imagem
- No `<img>`, adicionar `onLoad` que verifica `naturalWidth / naturalHeight`
- Se ratio < 0.85 (retrato): aplicar `max-w-[55%] max-h-[340px] rounded-xl`
- Se paisagem/quadrada: manter `max-w-[85%] max-h-[280px]` atual

Resultado: imagens verticais (como "previsao de palavras") aparecem com tamanho proporcional e elegante, sem ficar comprimidas no centro.

## Arquivos modificados (3 total)

| Arquivo | Linhas | Tipo |
|---------|--------|------|
| `V8QuizInline.tsx` | 68, 212 | Remover props |
| `V8LessonPlayer.tsx` | 118 | Condicional |
| `V8ContentSection.tsx` | 1, 22-54 | Estado + layout |
