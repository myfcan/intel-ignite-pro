

# Diagnóstico: Botão Play não funciona na Part A

## Causa raiz

As narrations no seed foram inseridas com `audio_url = NULL`. O `LessonContainer` passa `narrations.A?.audio_url ?? ''` (string vazia) para `PartAScreen`. O `<audio>` element recebe `src=""`, que falha silenciosamente no `.play()`, ativando o overlay "Toque para ativar o áudio" — que também falha ao clicar, pois a source continua inválida.

## Plano de correção

Tornar o `PartAScreen` resiliente à ausência de áudio:

### Arquivo: `src/components/lessons/v10/PartA/PartAScreen.tsx`

1. Detectar `hasAudio = !!audioUrl && audioUrl.length > 0` no topo do componente
2. Se `!hasAudio`:
   - Não renderizar o `<audio>` element
   - Nunca mostrar o overlay "Toque para ativar o áudio"
   - Substituir o botão Play no hero por um botão "Começar aula →" que chama `onComplete` diretamente
   - Não renderizar a barra de progresso de áudio (`IntroAudioBar`)
3. Se `hasAudio`: manter comportamento atual (play → slides sincronizados → "Começar aula")

### Arquivo: `src/components/lessons/v10/PartA/IntroSlides.tsx`

4. Quando `!isPlaying && !hasAudio`, o hero slide mostra "Começar aula →" em vez do botão play circular

Isso resolve o problema imediatamente sem precisar gerar áudio, e o fluxo volta a funcionar quando os áudios forem gerados no futuro.

