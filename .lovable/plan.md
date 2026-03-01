

# Plano: Player V8 — Modelo de Tela Unica (Uma Secao por Vez)

## Problema Real no Codigo Atual

O player renderiza TODOS os itens desbloqueados simultaneamente em scroll vertical (linha 152 de `V8LessonPlayer.tsx`):
```tsx
{timeline.map((item, idx) => {
  if (idx > unlockedIndex) return null;
  // renders ALL unlocked items stacked
```

Isso causa:
- Modo "Ouvir": audio termina mas usuario continua vendo a mesma tela (secao 0) porque a proxima secao aparece ABAIXO, fora da viewport
- Modo "Ler": botao "Continuar" esta inline mas adiciona conteudo abaixo em vez de trocar a tela
- Botao fixo no rodape cobre a imagem

## Solucao: Modelo de Tela Unica

Trocar de scroll vertical para **uma secao por vez** (card/slide). Apenas o item atual do timeline e renderizado. Avanco troca o conteudo inteiro da tela.

## Mudancas por Arquivo

### 1. `src/hooks/useV8Player.ts`
- Substituir `unlockedIndex` por logica de `currentIndex` que avanca para o proximo item do timeline
- `advanceAudio()` (listen mode): incrementa `currentIndex` para proximo item, causando transicao de tela
- Nova funcao `advanceManual()` (read mode): mesmo efeito, acionada pelo botao "Continuar"
- Quando `currentIndex >= timeline.length`: transita para fase "exercises" ou "completion"

### 2. `src/components/lessons/v8/V8LessonPlayer.tsx`
- Renderizar APENAS `timeline[state.currentIndex]` (um item por vez), com `AnimatePresence` para transicao suave
- Remover o `timeline.map(...)` que renderiza todos
- Remover scroll vertical e `IntersectionObserver` (nao ha scroll entre secoes)
- Botao "Continuar" (modo read): posicionado ABAIXO do conteudo, inline (nao fixo), nao cobre imagem
- Modo listen: sem botao visivel — transicao automatica via `onEnded`
- Botao final fixo removido — a transicao para exercises/completion e automatica quando `currentIndex` ultrapassa o timeline

### 3. `src/components/lessons/v8/V8ContentSection.tsx`
- Sem mudanca funcional. Ja recebe `isActiveAudio` e `onAudioEnded` corretamente
- Layout ja adequado (titulo, imagem 85%/280px, texto, audio player)

## Fluxo do Usuario (Novo)

```text
Modo "Ouvir":
  [Tela: Secao 0] audio toca automaticamente
  -> audio termina (onEnded) -> [Tela: Secao 1] audio toca
  -> ... -> [Tela: Quiz] -> responde -> avanca
  -> timeline acabou -> fase exercises/completion

Modo "Ler":
  [Tela: Secao 0] usuario le conteudo
  -> clica "Continuar" -> [Tela: Secao 1]
  -> ... -> [Tela: Quiz] -> responde -> avanca
  -> timeline acabou -> fase exercises/completion
```

## Estilo do Botao "Continuar"
- Posicao: inline no fim do conteudo da secao (nao fixo, nao cobre imagem)
- Visual: mesmo estilo atual (indigo-600, rounded-xl, sombra)
- Aparece SOMENTE em modo "read"
- Em modo "listen", a transicao e 100% automatica

## Criterios de Aceite
- Apenas UMA secao visivel por vez na tela
- Modo ouvir: secoes avancam automaticamente ao terminar audio
- Modo ler: botao "Continuar" troca a secao (nao adiciona abaixo)
- Botao nunca cobre a imagem
- Quizzes e playgrounds tambem aparecem como tela unica
- Transicao suave (fade/slide) entre secoes
