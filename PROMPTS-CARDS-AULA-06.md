# PROMPTS PARA CRIAR OS 15 CARDS DA AULA 06

**Instruções:** Copie e cole cada prompt abaixo no Lovable, um por vez.

---

## 📌 CARD 1: Deep Content Intro

```
# CRIAR CARD EFFECT: Deep Content Intro

Crie o componente `CardEffectDeepContentIntro.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `deep-content-intro`
**Arquivo:** `CardEffectDeepContentIntro.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Close-up de uma timeline de rede social rolando rápido, posts sumindo da tela. A câmera desacelera e foca em um grande livro ou curso digital que permanece fixo no centro. Zoom suave mostrando pessoas se aproximando desse material e interagindo com ele, enquanto os posts ao fundo continuam passando e desaparecendo.

**Divisão em 4 cenas:**
- **Cena 1:** Timeline rolando rápido, posts sumindo da tela
- **Cena 2:** Câmera desacelera e foca no livro/curso digital central
- **Cena 3:** Zoom suave no livro, pessoas se aproximando
- **Cena 4:** Pessoas interagindo com o material, posts continuam sumindo ao fundo

## Props padrão:
- title: "Conteúdo que fica, não que desaparece"
- subtitle: "Por que ir além dos posts rápidos"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas** baseadas no visualScript
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20`

5. **Ícones sugeridos:** Instagram, Twitter, Linkedin (timeline), BookOpen (livro), Users (pessoas)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 2: Start From Zero

```
# CRIAR CARD EFFECT: Start From Zero

Crie o componente `CardEffectStartFromZero.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `start-from-zero`
**Arquivo:** `CardEffectStartFromZero.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Animação de uma pessoa diante de uma tela em branco, repetindo o gesto de apagar e recomeçar. Em seguida, os bloquinhos de texto começam a se alinhar sozinhos, formando uma trilha de módulos numerados. A câmera acompanha a trilha como se fosse um corredor iluminado, mostrando progresso.

**Divisão em 4 cenas:**
- **Cena 1:** Pessoa diante de tela em branco, apagando e recomeçando
- **Cena 2:** Bloquinhos de texto começam a se alinhar sozinhos
- **Cena 3:** Trilha de módulos numerados se forma (1, 2, 3...)
- **Cena 4:** Câmera percorre o corredor iluminado mostrando progresso

## Props padrão:
- title: "Sempre começando do zero… ou não"
- subtitle: "Da postagem solta ao caminho contínuo"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20`

5. **Ícones sugeridos:** FileText (tela), Trash2 (apagar), ArrowRight (progresso), CheckCircle

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 3: Memory Stack

```
# CRIAR CARD EFFECT: Memory Stack

Crie o componente `CardEffectMemoryStack.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `memory-stack`
**Arquivo:** `CardEffectMemoryStack.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Pilha de livros e módulos digitais crescendo pouco a pouco, como blocos sendo empilhados com suavidade. Pequenos avatares de alunos aparecem ao redor, com ícones de coração, estrela e check de conclusão surgindo sobre suas cabeças, reforçando confiança e autoridade construída ao longo do tempo.

**Divisão em 4 cenas:**
- **Cena 1:** Pilha de livros/módulos começa a crescer (blocos empilhando)
- **Cena 2:** Pilha continua crescendo com suavidade
- **Cena 3:** Avatares de alunos aparecem ao redor
- **Cena 4:** Ícones de coração, estrela e check surgem sobre avatares

## Props padrão:
- title: "Memória acumulada do seu conhecimento"
- subtitle: "Quando o conteúdo vira patrimônio"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20`

5. **Ícones sugeridos:** BookOpen (livros), Layers (módulos), Users (avatares), Heart, Star, CheckCircle

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 4: Three Decisions

```
# CRIAR CARD EFFECT: Three Decisions

Crie o componente `CardEffectThreeDecisions.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `three-decisions`
**Arquivo:** `CardEffectThreeDecisions.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

A tela mostra três cartões grandes lado a lado: Tema, Público, Promessa. Um a um, eles ganham ícones (lâmpada, grupo de pessoas, alvo) e linhas conectam esses cartões a um quadro central com o título do curso, como se fosse um mapa mental se formando em tempo real.

**Divisão em 4 cenas:**
- **Cena 1:** Três cartões vazios aparecem lado a lado (Tema, Público, Promessa)
- **Cena 2:** Cartões ganham ícones (lâmpada, pessoas, alvo)
- **Cena 3:** Linhas conectam os cartões a um quadro central
- **Cena 4:** Quadro central mostra título do curso (mapa mental completo)

## Props padrão:
- title: "Três decisões que destravam tudo"
- subtitle: "Tema, público e promessa"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-green-50/30 dark:from-slate-950 dark:to-green-950/20`

5. **Ícones sugeridos:** Lightbulb (tema), Users (público), Target (promessa), BookOpen (curso)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 5: Module Map

```
# CRIAR CARD EFFECT: Module Map

Crie o componente `CardEffectModuleMap.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `module-map`
**Arquivo:** `CardEffectModuleMap.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Visão de cima de uma jornada em formato de mapa: um ponto de partida e vários marcos numerados (Módulo 1, 2, 3…). Uma linha animada liga os marcos, enquanto ícones aparecem em cada parada (introdução, exemplos, prática). A câmera acompanha a linha como se estivesse sobrevoando o trajeto.

**Divisão em 4 cenas:**
- **Cena 1:** Visão de cima, ponto de partida e marcos numerados aparecem
- **Cena 2:** Linha animada começa a ligar os marcos
- **Cena 3:** Ícones aparecem em cada marco (introdução, exemplos, prática)
- **Cena 4:** Câmera sobrevoa o trajeto completo

## Props padrão:
- title: "Desenhando o mapa de módulos"
- subtitle: "Do ponto de partida à chegada"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-950 dark:to-cyan-950/20`

5. **Ícones sugeridos:** MapPin (marcos), ArrowRight (linha), BookOpen (introdução), Code (exemplos), Zap (prática)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 6: Objective Lens

```
# CRIAR CARD EFFECT: Objective Lens

Crie o componente `CardEffectObjectiveLens.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `objective-lens`
**Arquivo:** `CardEffectObjectiveLens.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Cards menores representando aulas individuais entram em cena. Cada card recebe um selo animado com verbos como "Entender", "Sentir", "Aplicar". Um foco de luz destaca um card por vez, mostrando que cada parte tem um objetivo específico, quase como um checklist visual.

**Divisão em 4 cenas:**
- **Cena 1:** Cards de aulas individuais entram em cena
- **Cena 2:** Selos animados aparecem com verbos (Entender, Sentir, Aplicar)
- **Cena 3:** Foco de luz destaca um card por vez
- **Cena 4:** Todos os cards com selos, efeito checklist visual completo

## Props padrão:
- title: "Objetivos claros em cada etapa"
- subtitle: "O que o aluno precisa levar de cada pedaço"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-950 dark:to-amber-950/20`

5. **Ícones sugeridos:** FileText (cards), Brain (entender), Heart (sentir), Zap (aplicar), CheckSquare

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 7: Summary Booster

```
# CRIAR CARD EFFECT: Summary Booster

Crie o componente `CardEffectSummaryBooster.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `summary-booster`
**Arquivo:** `CardEffectSummaryBooster.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Uma página em branco aparece e, em poucos segundos, linhas de texto vão surgindo automaticamente, formando um sumário numerado. A câmera faz um zoom suave em alguns títulos de módulos enquanto pequenos ícones de raio indicam que aquilo foi acelerado pela I.A.

**Divisão em 4 cenas:**
- **Cena 1:** Página em branco aparece
- **Cena 2:** Linhas de texto surgindo automaticamente (sumário se formando)
- **Cena 3:** Zoom suave em títulos de módulos
- **Cena 4:** Ícones de raio indicando aceleração por I.A.

## Props padrão:
- title: "De ideia solta a sumário inicial"
- subtitle: "Primeiro rascunho guiado pela I.A."

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-violet-50/30 dark:from-slate-950 dark:to-violet-950/20`

5. **Ícones sugeridos:** FileText (página), List (sumário), Zap (raio I.A.), Sparkles

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 8: Support Materials

```
# CRIAR CARD EFFECT: Support Materials

Crie o componente `CardEffectSupportMaterials.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `support-materials`
**Arquivo:** `CardEffectSupportMaterials.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um painel mostra vários formatos: ícone de vídeo, página de PDF, ficha de aula, texto de descrição. Todos saem de uma mesma "fonte" de conhecimento, como se um feixe de luz central se dividisse em múltiplos raios que formam cada material na tela.

**Divisão em 4 cenas:**
- **Cena 1:** Painel central com fonte de conhecimento (luz/orbe)
- **Cena 2:** Feixe de luz central se divide em múltiplos raios
- **Cena 3:** Raios formam diferentes formatos (vídeo, PDF, ficha, texto)
- **Cena 4:** Todos os materiais completos ao redor da fonte central

## Props padrão:
- title: "Materiais de apoio sem sofrimento"
- subtitle: "Roteiros, PDFs e descrições gerados rápido"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-pink-50/30 dark:from-slate-950 dark:to-pink-950/20`

5. **Ícones sugeridos:** Video (vídeo), FileText (PDF), Clipboard (ficha), AlignLeft (texto)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 9: First Version

```
# CRIAR CARD EFFECT: First Version

Crie o componente `CardEffectFirstVersion.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `first-version`
**Arquivo:** `CardEffectFirstVersion.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Tela dividida ao meio: de um lado, uma página totalmente vazia com um cursor piscando; do outro, um texto rascunhado aparecendo rapidamente. A câmera desliza do lado vazio para o lado com texto, e uma mão estilizada começa a marcar, editar e melhorar aquele rascunho.

**Divisão em 4 cenas:**
- **Cena 1:** Tela dividida - esquerda vazia com cursor, direita com texto aparecendo
- **Cena 2:** Texto rascunhado completa do lado direito
- **Cena 3:** Câmera desliza do lado vazio para o lado com texto
- **Cena 4:** Mão estilizada marca, edita e melhora o rascunho

## Props padrão:
- title: "A mágica da versão 1"
- subtitle: "Melhor editar algo do que encarar o vazio"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-emerald-950/20`

5. **Ícones sugeridos:** Square (página vazia), FileText (rascunho), Edit3 (editar), CheckCircle

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 10: Tool Orchestrator

```
# CRIAR CARD EFFECT: Tool Orchestrator

Crie o componente `CardEffectToolOrchestrator.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `tool-orchestrator`
**Arquivo:** `CardEffectToolOrchestrator.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Vemos um teclado digitando poucas frases e, a partir disso, blocos de texto organizados em módulos surgem numa tela de computador. Ícones de chat flutuam ao redor (balões de conversa), mostrando que esse conteúdo veio de um diálogo com a I.A.

**Divisão em 4 cenas:**
- **Cena 1:** Teclado digitando poucas frases
- **Cena 2:** Blocos de texto organizados em módulos surgem na tela
- **Cena 3:** Ícones de chat/balões de conversa flutuam ao redor
- **Cena 4:** Visual completo mostrando diálogo com I.A.

## Props padrão:
- title: "Ferramentas de texto como aliadas"
- subtitle: "Modelos de linguagem organizando suas ideias"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/20`

5. **Ícones sugeridos:** Keyboard (teclado), Layers (módulos), MessageSquare (chat), Sparkles

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 11: Visual Creator

```
# CRIAR CARD EFFECT: Visual Creator

Crie o componente `CardEffectVisualCreator.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `visual-creator`
**Arquivo:** `CardEffectVisualCreator.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Capas de eBook, miniaturas de vídeo e cartões visuais aparecem um após o outro em um carrossel animado. Pequenas faíscas de cor indicam que essas imagens estão sendo geradas rapidamente, como se fossem renderizadas em tempo real.

**Divisão em 4 cenas:**
- **Cena 1:** Capas de eBook aparecem no carrossel
- **Cena 2:** Miniaturas de vídeo aparecem em sequência
- **Cena 3:** Cartões visuais completam o carrossel
- **Cena 4:** Faíscas de cor indicando geração rápida/renderização

## Props padrão:
- title: "Dando cara ao seu conteúdo"
- subtitle: "Capas, imagens e elementos visuais"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-rose-50/30 dark:from-slate-950 dark:to-rose-950/20`

5. **Ícones sugeridos:** BookOpen (eBook), Video (vídeo), Image (visuais), Sparkles (geração)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 12: Media Expander

```
# CRIAR CARD EFFECT: Media Expander

Crie o componente `CardEffectMediaExpander.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `media-expander`
**Arquivo:** `CardEffectMediaExpander.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Um parágrafo de texto se transforma em uma waveform de áudio e, em seguida, em um player de vídeo com a miniatura do curso. A câmera afasta e mostra o texto original no centro, conectado por linhas a ícones de áudio e vídeo, reforçando a ideia de reaproveitamento.

**Divisão em 4 cenas:**
- **Cena 1:** Parágrafo de texto no centro
- **Cena 2:** Texto se transforma em waveform de áudio
- **Cena 3:** Waveform se transforma em player de vídeo
- **Cena 4:** Câmera afasta, texto central conectado a ícones de áudio e vídeo

## Props padrão:
- title: "Quando o conteúdo ganha voz e movimento"
- subtitle: "Transformando texto em vídeo e áudio"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-950 dark:to-purple-950/20`

5. **Ícones sugeridos:** FileText (texto), Mic (áudio), Video (vídeo), ArrowRight (transformação)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 13: Product Mindset

```
# CRIAR CARD EFFECT: Product Mindset

Crie o componente `CardEffectProductMindset.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `product-mindset`
**Arquivo:** `CardEffectProductMindset.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Uma pilha desorganizada de notas e papéis vai se rearrumando em uma caixa organizada com o rótulo "Curso Completo". Em seguida, essa caixa se duplica digitalmente em vários dispositivos (notebook, tablet, celular), representando escala.

**Divisão em 4 cenas:**
- **Cena 1:** Pilha desorganizada de notas e papéis
- **Cena 2:** Notas se rearranjam em caixa organizada com rótulo "Curso Completo"
- **Cena 3:** Caixa se duplica digitalmente
- **Cena 4:** Caixa aparece em vários dispositivos (notebook, tablet, celular)

## Props padrão:
- title: "Pensar como criador de produto"
- subtitle: "Não é só conteúdo, é um ativo"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-orange-50/30 dark:from-slate-950 dark:to-orange-950/20`

5. **Ícones sugeridos:** FileText (notas), Package (caixa), Laptop, Tablet, Smartphone

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 14: Asset Library

```
# CRIAR CARD EFFECT: Asset Library

Crie o componente `CardEffectAssetLibrary.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `asset-library`
**Arquivo:** `CardEffectAssetLibrary.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

Estantes digitais surgem com ícones de cursos, livros, aulas gravadas e PDFs. Pequenos relógios aparecem ao lado, girando devagar, sugerindo que esses materiais continuam gerando valor com o passar do tempo.

**Divisão em 4 cenas:**
- **Cena 1:** Estantes digitais surgem vazias
- **Cena 2:** Ícones de cursos, livros, aulas e PDFs preenchem as estantes
- **Cena 3:** Pequenos relógios aparecem ao lado dos materiais
- **Cena 4:** Relógios girando, mostrando valor contínuo ao longo do tempo

## Props padrão:
- title: "Sua biblioteca de ativos digitais"
- subtitle: "Conteúdo que trabalha por você"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-950 dark:to-teal-950/20`

5. **Ícones sugeridos:** BookOpen (livros), Video (cursos), FileText (PDFs), Clock (tempo)

Crie o componente COMPLETO agora!
```

---

## 📌 CARD 15: Beyond Selling

```
# CRIAR CARD EFFECT: Beyond Selling

Crie o componente `CardEffectBeyondSelling.tsx` em `src/components/lessons/card-effects/`

## Especificações técnicas:

**Tipo:** `beyond-selling`
**Arquivo:** `CardEffectBeyondSelling.tsx`

**Altura obrigatória:**
```tsx
className="relative w-full min-h-[520px] sm:min-h-[600px] h-[70vh] max-h-[700px] ..."
```

**Interface:**
```tsx
interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
  title?: string;
  subtitle?: string;
}
```

## Visual Script (dividir em 4 cenas):

A tela mostra inicialmente um símbolo de dinheiro, que vai ficando menor enquanto surgem outros ícones maiores: um grupo de pessoas aprendendo, um certificado, uma porta se abrindo. A câmera foca na porta aberta, sugerindo novas oportunidades e impacto duradouro.

**Divisão em 4 cenas:**
- **Cena 1:** Símbolo de dinheiro grande no centro
- **Cena 2:** Dinheiro fica menor, surgem ícones maiores (pessoas, certificado, porta)
- **Cena 3:** Ícones maiores que o dinheiro, representando valor além da venda
- **Cena 4:** Câmera foca na porta aberta (novas oportunidades)

## Props padrão:
- title: "Muito além de vender"
- subtitle: "Impacto, clareza e novas possibilidades"

## Implementação obrigatória:

1. **Usar Framer Motion** com AnimatePresence
2. **4 cenas progressivas**
3. **Timing DINÂMICO**:

```tsx
const sceneDuration = ((duration || 14) * 1000) / 4;

useEffect(() => {
  if (!isActive) return;
  const timer = setInterval(() => {
    setCurrentScene((prev) => (prev + 1) % 4);
  }, sceneDuration);
  return () => clearInterval(timer);
}, [isActive, sceneDuration]);
```

4. **Background:** `bg-gradient-to-br from-slate-50 to-gold-50/30 dark:from-slate-950 dark:to-yellow-950/20`

5. **Ícones sugeridos:** DollarSign (dinheiro), Users (pessoas), Award (certificado), Door (porta)

Crie o componente COMPLETO agora!
```

---

## ✅ FIM DOS 15 PROMPTS

**Próximo passo:** Registrar os 15 componentes no `index.tsx`
