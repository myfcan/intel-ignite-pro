
# Plano: Player V8 com Revelacao Progressiva e Scroll Controlado

## Problema Atual (Codigo Real)

O player V8 renderiza TODOS os itens do timeline simultaneamente (`timeline.map(...)` na linha 148 de `V8LessonPlayer.tsx`), permitindo scroll livre para qualquer secao futura. Alem disso, a imagem esta limitada a `max-h-[180px]` (linha 49 de `V8ContentSection.tsx`), tornando-a muito pequena. O botao diz "Finalizar conteudo" (linha 197).

## Mudancas Necessarias

### 1. Imagem maior (V8ContentSection.tsx)
- **Atual**: `max-w-[70%] max-h-[180px]`
- **Novo**: `max-w-[85%] max-h-[280px]` -- imagem maior empurra conteudo para baixo, preenchendo melhor a tela

### 2. Revelacao progressiva de secoes (V8LessonPlayer.tsx)
- **Atual**: `timeline.map(...)` renderiza tudo de uma vez
- **Novo**: Renderizar apenas secoes ate `activeAudioIndex` (modo listen) ou ate `unlockedIndex` (modo read)
- Logica:
  - Modo "Ouvir": secao aparece quando `activeAudioIndex >= idx`
  - Modo "Ler": secao aparece quando usuario clica "Continuar" no botao de cada secao
- Secoes futuras ficam ocultas (nao renderizadas), impedindo scroll para frente

### 3. Scroll controlado para secoes passadas
- Secoes ja reveladas podem ser scrolladas livremente
- Secoes futuras simplesmente nao existem no DOM ate serem desbloqueadas
- Isso elimina o problema de "ver conteudo futuro" naturalmente

### 4. Botao por secao + botao final
- Cada secao (modo "Ler") tera um botao "Continuar" inline que desbloqueia a proxima
- O botao fixo no rodape so aparece quando TODAS as secoes foram desbloqueadas
- Texto do botao final: "Continuar" (nao "Finalizar conteudo")

### 5. Hook useV8Player -- novo estado `unlockedIndex`
- Adicionar `unlockedIndex` ao estado para rastrear ate qual secao do timeline o usuario desbloqueou
- `advanceAudio` ja incrementa `activeAudioIndex` (modo listen) -- agora tambem incrementa `unlockedIndex`
- Nova funcao `unlockNext()` para modo "Ler" (botao manual)

## Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useV8Player.ts` | Adicionar `unlockedIndex` + `unlockNext()` |
| `src/components/lessons/v8/V8LessonPlayer.tsx` | Filtrar timeline por `unlockedIndex`, botao "Continuar" por secao, botao final renomeado |
| `src/components/lessons/v8/V8ContentSection.tsx` | Aumentar tamanho da imagem para `max-w-[85%] max-h-[280px]` |

## Fluxo do Usuario

```text
Modo "Ler":
  Secao 0 visivel -> usuario le -> clica "Continuar" -> Secao 1 aparece -> ...
  Todas desbloqueadas -> botao final "Continuar" aparece

Modo "Ouvir":
  Secao 0 visivel + autoplay -> audio termina -> Secao 1 aparece + autoplay -> ...
  Todas desbloqueadas -> botao final "Continuar" aparece

Em ambos os modos:
  Scroll livre apenas para secoes ja reveladas
  Secoes futuras NAO existem no DOM
```
