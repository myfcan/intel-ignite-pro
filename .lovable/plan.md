

# Diagnóstico e Plano — LIV FAB posicionamento + Audio overlap A/B

---

## Bug 1: LIV e menu flutuantes no canto da tela (desktop)

### Causa raiz real

`LIVFab.tsx` usa `position: fixed` com valores `right` em pixels (linhas 48-51, 65-68):

```tsx
// linha 48-51:
className="fixed z-[9999] w-14 h-14 ..."
style={{
  right: pos.avatarRight,   // 80px no desktop
  bottom: pos.avatarBottom,  // 185px no desktop
}}
```

Com `position: fixed`, o FAB se posiciona relativo ao **viewport**, não ao container da aula. Agora que o container usa `max-w-[960px]` centralizado, o FAB flutua no canto direito da tela, fora da área visual da aula.

### Correção

Mudar de `fixed` para `absolute` e posicionar dentro do container `relative` já existente em `PartBScreen.tsx` (linha 408: `<div className="flex flex-col flex-1 min-w-0 h-full relative">`).

**`LIVFab.tsx`:**
- Trocar `fixed` por `absolute` nos dois botões (linhas 48 e 65)
- Remover `useResponsivePosition()` — os valores fixos de `right/bottom` em pixels ficam desnecessários
- Usar classes Tailwind com valores fixos: `right-4 bottom-28` (avatar) e `right-5 bottom-16` (menu button)
- Mobile não é afetado — o container `relative` ocupa 100% da tela, `absolute` se comporta identicamente a `fixed`

### Efeito sistêmico
- O parent `relative` já existe (`PartBScreen.tsx` linha 408). Sem mudança necessária.
- `z-[9999]` pode ser reduzido para `z-50` já que `absolute` opera dentro do stacking context do container.
- `LIVSheet` (Drawer) usa portal do Radix — não é afetado pela mudança de posicionamento do FAB.

---

## Bug 2: Áudios de Part A e Part B tocam simultaneamente

### Causa raiz real

`LessonContainer.tsx` usa `display: none/flex` para alternar partes (linhas 427-454):

```tsx
// linha 429:
style={{ display: currentPart === 'A' ? 'flex' : 'none' }}
// linha 442:
style={{ display: currentPart === 'B' ? 'flex' : 'none' }}
```

Quando `handlePartAComplete` é chamado (linha 234), `setCurrentPart('B')` muda o display de Part A para `none` — **mas o componente NÃO é desmontado**. O `<audio>` de Part A continua tocando em background.

Simultaneamente, `PartBScreen.tsx` auto-inicia o áudio do step 1 via listener `canplay` (linhas 220-224):

```tsx
const onCanPlay = () => {
  audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  audio.removeEventListener('canplay', onCanPlay);
};
audio.addEventListener('canplay', onCanPlay);
```

Resultado: **dois áudios tocando ao mesmo tempo**.

O cleanup em `PartAScreen.tsx` (linhas 90-98) só executa no **unmount**, que nunca acontece:

```tsx
useEffect(() => {
  return () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };
}, []);
```

### Correção

Parar o áudio de Part A **antes** de chamar `onComplete`. Nos 3 pontos de `PartAScreen.tsx` onde `onComplete` é chamado (linhas 162, 198, 210), adicionar `audioRef.current?.pause()` antes:

```tsx
// Padrão: parar áudio, depois chamar onComplete
const stopAndComplete = useCallback(() => {
  const audio = audioRef.current;
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
  onComplete();
}, [onComplete]);
```

Substituir todas as chamadas `onComplete()` por `stopAndComplete()` nos 3 pontos:
- Linha 162: `onComplete={onComplete}` no `IntroSlides` → `onComplete={stopAndComplete}`
- Linha 198: botão "Começar aula" (sem áudio) → `onClick={stopAndComplete}`
- Linha 210: botão "Começar aula" (áudio ended) → `onClick={stopAndComplete}`
- Linha 218: botão "Pular introdução" → `onClick={stopAndComplete}`

### Efeito sistêmico
- Part C (`PartCScreen`) não tem auto-play de áudio no mount — sem risco de overlap B→C.
- O `currentTime = 0` garante que ao retornar a Part A (via botão "Voltar" em Part B), o áudio recomeça do início.
- O display:none já impede interação visual — esta correção alinha o comportamento de áudio.

---

## Resumo

| Arquivo | Mudança |
|---|---|
| `LIVFab.tsx` | `fixed` → `absolute`, remover `useResponsivePosition`, usar classes Tailwind estáticas |
| `PartAScreen.tsx` | Criar `stopAndComplete` que para áudio antes de chamar `onComplete`; substituir em 4 pontos |

Total: 2 arquivos. Zero risco em mobile (absolute dentro de container fullscreen = mesmo resultado que fixed). Zero impacto no banco de dados.

