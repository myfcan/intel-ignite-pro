# Data-TestID Reference Guide

Guia completo de todos os `data-testid` disponíveis nos componentes principais para testes E2E.

## 🎓 GuidedLesson (Componente Principal)

**Arquivo:** `src/components/lessons/GuidedLesson.tsx`

```typescript
// Container principal
data-testid="guided-lesson"
data-current-phase="audio|playground-mid|transition|exercises|playground-final|completed"
data-current-section="0" // índice da seção atual

// Seções individuais
data-testid="lesson-section"
data-section-index="0" // índice da seção
data-is-active="true|false"
data-section-updated="true|false" // indica se acabou de mudar
```

### Exemplo de uso:
```typescript
// Esperar seção específica estar ativa
await page.locator('[data-testid="lesson-section"][data-section-index="2"][data-is-active="true"]').waitFor();

// Verificar fase atual
const currentPhase = await page.locator('[data-testid="guided-lesson"]').getAttribute('data-current-phase');
expect(currentPhase).toBe('audio');
```

---

## 🎵 AudioPlayer

**Arquivo:** `src/components/lesson/AudioPlayer.tsx`

```typescript
// Container principal
data-testid="audio-player"

// Elemento de áudio
data-testid="audio-element"

// Controles
data-testid="audio-play-pause-button"
data-testid="audio-seek-slider"
data-testid="audio-playback-rate"
```

### Exemplo de uso:
```typescript
// Play/Pause
await page.locator('[data-testid="audio-play-pause-button"]').click();

// Avançar para tempo específico
await page.locator('[data-testid="audio-seek-slider"]').evaluate((slider, time) => {
  // Simular arraste do slider
}, timeInSeconds);

// Verificar duração do áudio
const duration = await page.evaluate(() => {
  const audio = document.querySelector('[data-testid="audio-element"]') as HTMLAudioElement;
  return audio?.duration || 0;
});
```

---

## 📝 ExercisesSection

**Arquivo:** `src/components/lessons/ExercisesSection.tsx`

```typescript
// Container principal
data-testid="exercises-section"
data-exercise-index="0" // índice do exercício atual
data-total-exercises="6" // total de exercícios

// Exercícios individuais
data-testid="exercise-drag-drop-{index}"
data-testid="exercise-complete-sentence-{index}"
data-testid="exercise-scenario-selection-{index}"
// ... etc para cada tipo
```

### Exemplo de uso:
```typescript
// Verificar qual exercício está ativo
const currentIndex = await page.locator('[data-testid="exercises-section"]').getAttribute('data-exercise-index');

// Verificar total
const total = await page.locator('[data-testid="exercises-section"]').getAttribute('data-total-exercises');
```

---

## 🎮 PlaygroundCallCard

**Arquivo:** `src/components/lessons/PlaygroundCallCard.tsx`

```typescript
// Container principal
data-testid="playground-call"

// Botões
data-testid="playground-call-open" // "Vamos lá!"
data-testid="playground-call-skip" // "Deixar pra depois"
```

### Exemplo de uso:
```typescript
// Esperar playground aparecer
await page.locator('[data-testid="playground-call"]').waitFor({ state: 'visible' });

// Aceitar playground
await page.locator('[data-testid="playground-call-open"]').click();

// Ou pular
await page.locator('[data-testid="playground-call-skip"]').click();
```

---

## 🎯 PlaygroundMidLesson

**Arquivo:** `src/components/lessons/PlaygroundMidLesson.tsx`

```typescript
// Container principal
data-testid="playground-mid-lesson"
data-playground-type="real|multiple-choice"

// Botão de continuar
data-testid="playground-mid-continue"
```

### Exemplo de uso:
```typescript
// Verificar tipo de playground
const playgroundType = await page.locator('[data-testid="playground-mid-lesson"]').getAttribute('data-playground-type');

// Preencher e continuar
if (playgroundType === 'real') {
  await page.locator('textarea').fill('meu prompt completo aqui');
  await page.locator('[data-testid="playground-mid-continue"]').click();
}
```

---

## 🛠️ GuidedPlayground

**Arquivo:** `src/components/lessons/GuidedPlayground.tsx`

```typescript
// Container principal
data-testid="guided-playground"
data-current-step="0" // índice do passo atual
data-total-steps="3" // total de passos

// Botão de próximo/finalizar
data-testid="guided-playground-next"
```

### Exemplo de uso:
```typescript
// Verificar passo atual
const currentStep = await page.locator('[data-testid="guided-playground"]').getAttribute('data-current-step');

// Avançar
await page.locator('[data-testid="guided-playground-next"]').click();
```

---

## 🏁 ConclusionScreen

**Arquivo:** `src/components/lessons/ConclusionScreen.tsx`

```typescript
// Container principal
data-testid="conclusion-screen"

// Botões de ação
data-testid="conclusion-next-lesson" // Ir para próxima aula
data-testid="conclusion-dashboard" // Voltar ao dashboard
```

### Exemplo de uso:
```typescript
// Esperar tela de conclusão
await page.locator('[data-testid="conclusion-screen"]').waitFor({ state: 'visible' });

// Ir para próxima aula
await page.locator('[data-testid="conclusion-next-lesson"]').click();
```

---

## 🔄 TransitionCard

**Arquivo:** `src/components/lessons/TransitionCard.tsx`

```typescript
// Container principal
data-testid="transition-card"

// Botões
data-testid="transition-continue" // Continuar para exercícios
data-testid="transition-back" // Voltar para aula
```

### Exemplo de uso:
```typescript
// Esperar transição
await page.locator('[data-testid="transition-card"]').waitFor({ state: 'visible' });

// Continuar
await page.locator('[data-testid="transition-continue"]').click();
```

---

## 📄 SyncedText (Seções de Texto)

**Arquivo:** `src/components/lessons/SyncedText.tsx`

```typescript
// Container de cada seção
data-testid="synced-text-section"
data-is-active="true|false"
data-is-past="true|false"
data-is-future="true|false"
```

### Exemplo de uso:
```typescript
// Verificar quantas seções já foram completadas
const pastSections = await page.locator('[data-testid="synced-text-section"][data-is-past="true"]').count();

// Verificar seção ativa
const activeSection = page.locator('[data-testid="synced-text-section"][data-is-active="true"]');
```

---

## 🎯 Fluxos Completos de Teste

### Fluxo 1: Completar Aula Inteira

```typescript
test('completar aula do início ao fim', async ({ page }) => {
  // 1. Navegar para aula
  await page.goto('/lessons-interactive/lesson-id');
  
  // 2. Esperar áudio carregar
  await page.locator('[data-testid="audio-element"]').waitFor();
  
  // 3. Verificar que está na fase de áudio
  const phase = await page.locator('[data-testid="guided-lesson"]').getAttribute('data-current-phase');
  expect(phase).toBe('audio');
  
  // 4. Avançar rápido até playground
  await page.evaluate(() => {
    const audio = document.querySelector('[data-testid="audio-element"]') as HTMLAudioElement;
    audio.currentTime = 128; // tempo do playground
  });
  
  // 5. Esperar playground aparecer
  await page.locator('[data-testid="playground-call"]').waitFor({ state: 'visible' });
  await page.locator('[data-testid="playground-call-open"]').click();
  
  // 6. Completar playground
  await page.locator('[data-testid="playground-mid-lesson"]').waitFor();
  // ... preencher campos
  await page.locator('[data-testid="playground-mid-continue"]').click();
  
  // 7. Aguardar transição
  await page.locator('[data-testid="transition-card"]').waitFor({ state: 'visible' });
  await page.locator('[data-testid="transition-continue"]').click();
  
  // 8. Fazer exercícios
  await page.locator('[data-testid="exercises-section"]').waitFor();
  // ... responder exercícios
  
  // 9. Verificar conclusão
  await page.locator('[data-testid="conclusion-screen"]').waitFor({ state: 'visible' });
});
```

### Fluxo 2: Testar Sincronização de Áudio

```typescript
test('sincronização de áudio-texto', async ({ page }) => {
  await page.goto('/lessons-interactive/lesson-id');
  await page.locator('[data-testid="audio-element"]').waitFor();
  
  const testPoints = [
    { time: 0, section: 0 },
    { time: 10, section: 1 },
    { time: 30, section: 2 },
  ];
  
  for (const point of testPoints) {
    // Avançar áudio
    await page.evaluate((time) => {
      const audio = document.querySelector('[data-testid="audio-element"]') as HTMLAudioElement;
      audio.currentTime = time;
    }, point.time);
    
    // Aguardar sincronização
    await page.waitForTimeout(300);
    
    // Verificar seção ativa
    const activeSection = await page.locator(
      `[data-testid="lesson-section"][data-is-active="true"]`
    ).getAttribute('data-section-index');
    
    expect(parseInt(activeSection || '0')).toBe(point.section);
  }
});
```

---

## 📊 Tabela de Resumo

| Componente | data-testid | Atributos Adicionais |
|-----------|-------------|---------------------|
| GuidedLesson | `guided-lesson` | `data-current-phase`, `data-current-section` |
| LessonSection | `lesson-section` | `data-section-index`, `data-is-active`, `data-section-updated` |
| AudioPlayer | `audio-player` | - |
| AudioElement | `audio-element` | - |
| PlayPause | `audio-play-pause-button` | - |
| Slider | `audio-seek-slider` | - |
| PlaybackRate | `audio-playback-rate` | - |
| ExercisesSection | `exercises-section` | `data-exercise-index`, `data-total-exercises` |
| PlaygroundCall | `playground-call` | - |
| PlaygroundCallOpen | `playground-call-open` | - |
| PlaygroundCallSkip | `playground-call-skip` | - |
| PlaygroundMid | `playground-mid-lesson` | `data-playground-type` |
| PlaygroundContinue | `playground-mid-continue` | - |
| GuidedPlayground | `guided-playground` | `data-current-step`, `data-total-steps` |
| GuidedPlaygroundNext | `guided-playground-next` | - |
| Conclusion | `conclusion-screen` | - |
| ConclusionNext | `conclusion-next-lesson` | - |
| ConclusionDashboard | `conclusion-dashboard` | - |
| Transition | `transition-card` | - |
| TransitionContinue | `transition-continue` | - |
| TransitionBack | `transition-back` | - |
| SyncedText | `synced-text-section` | `data-is-active`, `data-is-past`, `data-is-future` |

---

## 💡 Dicas e Best Practices

1. **Sempre use `waitFor()`** antes de interagir com elementos que podem aparecer assincronamente
2. **Combine data-testid com atributos** para seletores mais específicos
3. **Use timeouts generosos** para sincronização de áudio (latência de rede)
4. **Verifique estados intermediários** não apenas o resultado final
5. **Capture screenshots em falhas** configurando no playwright.config.ts
6. **Use data attributes para assertions** em vez de classes CSS que podem mudar
