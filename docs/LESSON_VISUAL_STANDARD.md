# 🎨 Padrão Visual de Aulas - Modelo V2

Este documento define os padrões visuais, animações e comportamentos para todas as aulas criadas no Modelo V2.

## 📦 Estrutura Visual

### 1. Avatar da Maia
**Componente:** Renderizado em `GuidedLesson.tsx`

**Especificações:**
- Posição: Fixed, bottom-20, right-6
- Tamanho: 64x64px (w-16 h-16)
- Borda: 4px branca com sombra XL
- Imagem: `/maia-avatar-v3.png`
- Z-index: 50

**Responsividade:**
- Mobile: 48x48px (w-12 h-12), bottom-16, right-4
- Desktop: 64x64px (w-16 h-16), bottom-20, right-6

### 2. Speech Bubble
**Componente:** Renderizado junto ao avatar

**Especificações:**
- Fundo: Branco (`bg-white`)
- Borda: 2px primary/10 (`border-2 border-primary/10`)
- Raio: 16px (`rounded-2xl`)
- Padding: 16px horizontal, 12px vertical (`px-4 py-3`)
- Sombra: Large (`shadow-lg`)
- Largura máxima: 250px (`max-w-[250px]`)
- Animação: Fade in (`animate-fade-in`)

**Conteúdo:**
- Texto: Máximo 60 caracteres
- Tamanho: Small (`text-sm`)
- Cor: Slate 700 (`text-slate-700`)
- Fonte: Semibold

### 3. Header Fixo
**Componente:** Player de áudio no topo

**Especificações:**
- Posição: Sticky top-0
- Background: Glassmorphism (`bg-white/80 backdrop-blur-xl`)
- Borda inferior: Slate 200/50 (`border-b border-slate-200/50`)
- Sombra: Small (`shadow-sm`)
- Z-index: 50

**Elementos:**
- Botão voltar (ghost, icon)
- Título da aula (truncate)
- Controles de áudio (play/pause, speed)
- Barra de progresso
- Timestamps (atual/total)

### 4. Seções de Conteúdo
**Componente:** `SyncedText.tsx`

**Estados Visuais:**

#### Past (Seção já passada)
```css
opacity: 0.5
check icon: ✓ verde
```

#### Active (Seção atual)
```css
opacity: 1
scale: 1.02
background: bg-primary/5
icon: 🔊 volume
animation: animate-scale-in
```

#### Future (Próxima seção)
```css
opacity: 0.3
sem icon
```

**Transições:**
```css
transition: all 500ms
easing: ease-in-out
```

## ⚡ Animações

### 1. Animações de Entrada

#### Fade In
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
**Uso:** Speech bubbles, cards de exercício

#### Scale In
```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```
**Uso:** Seção ativa

#### Slide In Right
```css
@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```
**Uso:** Avatar, elementos laterais

### 2. Transições de Estado

**Duração:** 500ms
**Easing:** cubic-bezier(0.4, 0, 0.2, 1)

**Propriedades animadas:**
- `opacity`
- `transform` (scale, translateY)
- `background-color`
- `border-color`

### 3. Scroll Automático

**Comportamento:**
- Dispara ao mudar de seção (`currentSection`)
- Offset: -80px (altura do header)
- Behavior: smooth
- Usa `requestAnimationFrame` para suavidade

**Implementação:**
```typescript
useEffect(() => {
  if (!hasScrolledRef.current[currentSection]) {
    const element = document.getElementById(`section-${currentSection}`);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
      hasScrolledRef.current[currentSection] = true;
    }
  }
}, [currentSection]);
```

### 4. Confetti (Conclusão)

**Quando disparar:**
- Última seção de áudio concluída
- Todos os exercícios completados
- Badge conquistado

**Configuração:**
```typescript
const duration = 3000; // 3 segundos
const colors = ['#06b6d4', '#8b5cf6', '#fbbf24', '#f472b6'];
const particleCount = 50;
const spread = 360;
const startVelocity = 30;
const ticks = 60;
const zIndex = 9999;
```

## 🔄 Sincronização Áudio-Texto

### Modelo V2 (Áudios Separados)

**Características:**
- Cada seção tem seu próprio áudio (`section.audio_url`)
- Troca de fonte de áudio ao avançar seção
- Evento `ended` dispara próxima seção
- Timestamps acumulados (soma dos áudios anteriores)

**Loop de Sincronização:**
```typescript
// requestAnimationFrame (60fps)
useEffect(() => {
  let rafId: number;
  
  const syncLoop = () => {
    const currentTime = audioRef.current?.currentTime || 0;
    setCurrentTime(currentTime);
    
    rafId = requestAnimationFrame(syncLoop);
  };
  
  rafId = requestAnimationFrame(syncLoop);
  return () => cancelAnimationFrame(rafId);
}, []);
```

**Troca de Áudio:**
```typescript
// Evento 'ended'
audio.addEventListener('ended', () => {
  if (currentSection < sections.length - 1) {
    const nextSection = currentSection + 1;
    const nextAudioUrl = sections[nextSection].audio_url;
    
    audio.src = nextAudioUrl;
    audio.load();
    audio.play();
    setCurrentSection(nextSection);
  } else {
    // Última seção → Ir para exercícios
    setCurrentPhase('transition');
  }
});
```

## 📱 Responsividade

### Breakpoints

**Mobile:** `< 768px`
```css
text-sm
px-4
gap-2
w-12 h-12 (avatar)
```

**Tablet:** `768px - 1024px`
```css
text-base
px-6
gap-3
w-14 h-14 (avatar)
```

**Desktop:** `> 1024px`
```css
text-lg
px-8
gap-4
w-16 h-16 (avatar)
```

### Mobile First

**Princípio:** Todos os componentes são projetados primeiro para mobile, depois adaptados para telas maiores.

**Exemplo:**
```tsx
<div className="text-sm px-4 md:text-base md:px-6 lg:text-lg lg:px-8">
  Conteúdo responsivo
</div>
```

## 🎨 Design Tokens

### Cores (HSL)

**Principais:**
- `primary` - Cor principal do tema
- `primary-foreground` - Texto sobre primary
- `accent` - Cor de destaque
- `muted` - Cor secundária
- `muted-foreground` - Texto secundário

**Background:**
- `background` - Fundo principal
- `foreground` - Texto principal
- `card` - Fundo de cards
- `card-foreground` - Texto em cards

### Sombras

```css
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1)
```

### Raios de Borda

```css
rounded-sm: 0.125rem (2px)
rounded: 0.25rem (4px)
rounded-md: 0.375rem (6px)
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-2xl: 1rem (16px)
rounded-full: 9999px
```

## ✅ Checklist de Implementação

### Antes de Criar Aula:
- [ ] `contentVersion: 2`
- [ ] Última seção tem `type: 'end-audio'`
- [ ] `speechBubbleText` ≤ 60 caracteres
- [ ] `visualContent` usa markdown
- [ ] `audioText` usa `cleanAudioText()`
- [ ] Exercícios têm propriedade `data`

### Após Sincronizar:
- [ ] Testar no player `/lessons-interactive/[id]`
- [ ] Áudios trocam entre seções
- [ ] Texto sincroniza com áudio
- [ ] Scroll automático funciona
- [ ] Exercícios são clicáveis
- [ ] Confetti dispara ao finalizar
- [ ] Mobile funciona corretamente

### Qualidade Visual:
- [ ] Avatar visível em todas as seções
- [ ] Speech bubble atualiza a cada seção
- [ ] Seções têm estados visuais corretos
- [ ] Animações suaves (sem glitches)
- [ ] Header fixo não sobrepõe conteúdo
- [ ] Responsividade testada (mobile/tablet/desktop)

## 📚 Componentes Relacionados

### Principais:
- `src/components/lessons/GuidedLesson.tsx` - Componente principal
- `src/components/lessons/SyncedText.tsx` - Renderização de seções
- `src/components/lessons/AnimatedMarkdown.tsx` - Markdown animado
- `src/components/lesson/AudioPlayer.tsx` - Player de áudio

### Hooks:
- `src/hooks/useLesson.ts` - Lógica de lição

### Utilitários:
- `src/lib/audioTextValidator.ts` - Limpeza de texto
- `src/lib/lessonDataProcessor.ts` - Processamento de dados
- `src/lib/syncLessonV2.ts` - Sincronização V2

## 🚀 Próximos Passos

1. Criar nova aula seguindo template
2. Usar `cleanAudioText()` para audioText
3. Adicionar ao `src/data/lessons/index.ts`
4. Sincronizar via `/admin/batch-lessons`
5. Testar no player
6. Ajustar `order_index` se necessário

---

**Última atualização:** 2025-11-10
**Versão:** 2.0
**Modelo:** V2 (Áudios Separados)
