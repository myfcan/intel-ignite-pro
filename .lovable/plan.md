

## Plano: Adicionar Som de Sucesso + Confetti nas Telas de Conclusão (Part C)

### Problema
As telas de conclusão (Part C) não têm som de sucesso nem confetti visível. O confetti só existe na C3 (GamificationPage) usando CSS básico, e não há nenhum som em nenhuma tela. A experiência é "muda e sem graça".

### Solução

**1. `src/components/lessons/v10/PartC/PartCScreen.tsx`** — Adicionar som + confetti canvas
- Importar `useV7SoundEffects` de `../../../v7/cinematic/useV7SoundEffects`
- Importar `canvas-confetti`
- Ao entrar em C1 (RecapPage): disparar som `completion` + confetti (`canvas-confetti` com particleCount: 100, spread: 90)
- Ao entrar em C2 (EngagementPage): disparar som `level-up`
- Ao entrar em C3 (GamificationPage): disparar som `combo-hit`

**2. `src/components/lessons/v10/PartC/RecapPage.tsx`** — Receber prop `onEnter` e disparar ao montar
- Adicionar prop `onEnter?: () => void`
- Chamar `onEnter` no primeiro render quando `isActive=true`

**3. `src/components/lessons/v10/PartC/EngagementPage.tsx`** — Receber e disparar `onEnter`
- Mesmo padrão: prop `onEnter?: () => void`

**4. `src/components/lessons/v10/PartC/GamificationPage.tsx`** — Trocar Confetti CSS por canvas-confetti
- Substituir o componente `<Confetti>` CSS pelo `canvas-confetti` (mesmo que V8 usa)
- Manter o auto-fire ao entrar na página
- Adicionar som `combo-hit` ao entrar

### Abordagem alternativa (mais simples)
Em vez de passar props onEnter, centralizar tudo no `PartCScreen.tsx` usando `useEffect` no `currentPage`:

```
useEffect(() => {
  if (currentPage === 1) { playSound('completion'); confetti(...); }
  if (currentPage === 2) { playSound('level-up'); }
  if (currentPage === 3) { playSound('combo-hit'); confetti(...intenso...); }
}, [currentPage]);
```

Isso é mais limpo e afeta Pipeline V10 automaticamente porque o mesmo componente é usado.

### Arquivos afetados
- `src/components/lessons/v10/PartC/PartCScreen.tsx` — centralizar sons e confetti
- `src/components/lessons/v10/PartC/GamificationPage.tsx` — trocar Confetti CSS por canvas-confetti

### Resultado
- C1: confetti + som "completion" ao entrar
- C2: som "level-up" ao transicionar
- C3: confetti intenso + som "combo-hit" ao chegar na gamificação
- Funciona tanto na aula quanto no Pipeline V10

