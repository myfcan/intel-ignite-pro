# Modelos de Aula (Lesson Models)

Este documento descreve os diferentes modelos/versões de aula disponíveis no sistema MAIA. Cada modelo representa uma estrutura e jornada de aprendizado diferente.

## 📋 Visão Geral

O sistema MAIA suporta múltiplos modelos de aula, cada um com sua própria estrutura, exercícios e experiência de usuário. Ao criar novo conteúdo, especificamos qual modelo usar.

---

## ✅ Modelo V1 - Aula Guiada com Áudio Sincronizado

**Status:** ✅ Implementado

**Exemplo de Referência:** `fundamentos-02` (Como a IA Aprende Com Você)

### Características:

#### 1. **Estrutura de Conteúdo**
- Áudio sincronizado com texto (`GuidedLesson`)
- Seções com `wordTimestamps` para sincronização palavra por palavra
- Balão de fala da MAIA (`speechBubbleText`)
- Conteúdo visual rico com markdown e emojis (`visualContent`)
- Conteúdo falado (`spokenContent`)

#### 2. **Componentes Interativos Mid-Lesson**
- **Playground Real** (`real-playground`): Usuário escreve prompts com validação em tempo real
- **Simulação Interativa** (`interactive-simulation`): Passos guiados com escolhas e feedback
- Cards de transição entre seções
- Chamadas para o playground durante a aula

#### 3. **Exercícios Finais** (`exercisesConfig`)
Tipos disponíveis:
- `data-collection`: Identificar múltiplos pontos de dados em cenários
- `fill-in-blanks`: Completar frases com conceitos-chave
- `true-false`: Avaliar afirmações verdadeiras/falsas
- `platform-match`: Relacionar plataformas com características
- `complete-sentence`: Completar sentenças
- `drag-drop`: Arrastar e soltar elementos
- `scenario-selection`: Selecionar melhor opção em cenários

#### 4. **Playground Final** (`finalPlaygroundConfig`)
- Construtor de prompts guiado (`guided-prompt-builder`)
- Múltiplas etapas com diferentes tipos de input (radio, textarea, prompt-builder)
- Validação por etapa
- Geração de prompt final completo

#### 5. **Tecnologias**
- Tipo de aula: `lesson_type: 'guided'`
- Arquivo de dados: TypeScript (`*.ts`)
- Interface: `GuidedLessonData` (em `src/types/guidedLesson.ts`)
- Componente: `GuidedLesson.tsx`

### Estrutura de Arquivo Típica:

```typescript
export const minhaAulaV1: GuidedLessonData = {
  id: "unique-id",
  title: "Título da Aula",
  trackId: "trail-id",
  trackName: "Nome da Trilha",
  duration: 300, // segundos
  contentVersion: 1,
  
  sections: [
    {
      id: "section-1",
      title: "Seção 1",
      timestamp: 0,
      type: 'text',
      speechBubbleText: "Texto curto para balão",
      visualContent: "## Conteúdo visual com markdown",
      spokenContent: "Texto completo falado pela MAIA"
    },
    // ... mais seções
  ],
  
  exercisesConfig: [
    {
      id: "ex-1",
      type: "data-collection",
      title: "Título",
      instruction: "Instrução",
      data: { /* config específica */ }
    },
    // ... mais exercícios
  ],
  
  finalPlaygroundConfig: {
    id: "final-playground",
    type: "guided-prompt-builder",
    title: "Título",
    maiaIntro: "Introdução da MAIA",
    steps: [ /* etapas */ ]
  }
};
```

---

## ✅ Modelo V2 - Aula com Áudio Separado por Seção

**Status:** ✅ Implementado

**Exemplo de Referência:** `fundamentos-01` (Fundamentos da IA)

### Características:

#### 1. **Estrutura de Conteúdo**
- Áudio separado por seção (cada seção tem seu próprio arquivo de áudio)
- Timestamps reais de palavras (`wordTimestamps`)
- Balão de fala da MAIA (`speechBubbleText`)
- Conteúdo visual rico com markdown e emojis (`visualContent`)
- Sem conteúdo falado separado (o texto visual é o que é falado)

#### 2. **Diferenças do V1**
- **SEM Playground Mid-Lesson**: V2 não usa `showPlaygroundCall` ou `playgroundConfig` durante a aula
- **SEM Playground Final**: V2 não tem `finalPlaygroundConfig`
- **Áudio por Seção**: Cada seção tem `audioUrl` próprio, não um arquivo único para toda aula
- **Foco em Conteúdo**: A experiência é mais linear, focada em consumo de conteúdo

#### 3. **Exercícios Finais** (`exercisesConfig`)
Mesmos tipos disponíveis do V1:
- `data-collection`: Identificar múltiplos pontos de dados em cenários
- `fill-in-blanks`: Completar frases com conceitos-chave
- `true-false`: Avaliar afirmações verdadeiras/falsas
- `scenario-selection`: Selecionar melhor opção em cenários
- E outros tipos suportados

#### 4. **Tecnologias**
- Tipo de aula: `lesson_type: 'guided'`
- Identificador de versão: `contentVersion: 3`
- Arquivo de dados: TypeScript (`*.ts`)
- Interface: `GuidedLessonData` (em `src/types/guidedLesson.ts`)
- Componente: `GuidedLesson.tsx` (com suporte a V2)

#### 5. **Estrutura Padrão de Sections**
- **CRÍTICO**: Usar `audio_url` (não `audioUrl`)
- **CRÍTICO**: Usar `timestamp` (não `startTime`, `endTime`)
- Salvamento no banco: `content: { ...lessonData, sections }`
- Cada seção tem seu próprio áudio e timestamp acumulativo

### Estrutura de Arquivo Típica:

```typescript
export const minhaAulaV2: GuidedLessonData = {
  id: "unique-id",
  title: "Título da Aula",
  trackId: "trail-id",
  trackName: "Nome da Trilha",
  duration: 300, // segundos totais estimados
  contentVersion: 3, // IMPORTANTE: identifica V2 padronizado
  
  sections: [
    {
      id: "section-1",
      title: "Seção 1",
      timestamp: 0,
      type: 'text',
      audio_url: "/audio/secao-1.mp3", // ✅ PADRÃO: audio_url
      speechBubbleText: "Texto curto para balão",
      visualContent: "## Conteúdo visual com markdown"
      // SEM spokenContent - visualContent é usado
      // SEM showPlaygroundCall
      // SEM playgroundConfig
    },
    // ... mais seções
  ],
  
  exercisesConfig: [
    {
      id: "ex-1",
      type: "scenario-selection",
      title: "Título",
      instruction: "Instrução",
      data: { /* config específica */ }
    },
    // ... mais exercícios
  ]
  
  // SEM finalPlaygroundConfig
};
```

### Fluxo de Experiência V2:
1. **Seção 1** → Áudio toca → Texto sincroniza → Termina
2. **Seção 2** → Áudio toca → Texto sincroniza → Termina
3. **Seção 3** → Áudio toca → Texto sincroniza → Termina
4. **Seção 4** → Áudio toca → Texto sincroniza → Termina
5. **Seção 5** (`end-audio`) → Transição para exercícios
6. **Exercícios Finais** → Conclusão

**Sem interrupções de playground durante o fluxo!**

---

## ✅ Modelo V3 - Aula com Áudio Único e Slides Visuais

**Status:** ✅ Implementado

**Exemplo de Referência:** _A ser definido_

### Características:

#### 1. **Estrutura de Conteúdo**
- **Áudio único** para toda a aula (um arquivo de áudio para todos os slides)
- **~7 slides visuais** com imagens (opcional)
- Timestamps calculados dividindo o áudio pelos slides
- Balão de fala da MAIA (`speechBubbleText`)
- Conteúdo visual rico com markdown (`visualContent`)
- Cada seção representa um slide

#### 2. **Diferenças dos Outros Modelos**
- **ÁUDIO ÚNICO**: Diferente de V1 e V2, V3 tem 1 arquivo de áudio para toda a aula
- **SEM Playgrounds Mid-Lesson**: Foco em apresentação visual linear
- **COM Playground Final**: Atividade prática após consumir os slides
- **Slides Visuais**: Cada seção pode ter uma imagem associada
- **Estrutura Simples**: Ideal para conteúdo visual/apresentações

#### 3. **Exercícios Finais** (`exercisesConfig`)
Mesmos tipos disponíveis de V1 e V2:
- `data-collection`
- `fill-in-blanks`
- `true-false`
- `scenario-selection`
- E outros tipos suportados

#### 4. **Playground Final** (`finalPlaygroundConfig`)
- Construtor de prompts guiado (`guided-prompt-builder`)
- Atividade prática após os slides

#### 5. **Tecnologias**
- Tipo de aula: `lesson_type: 'guided'`
- Identificador de versão: `contentVersion: 4`
- Schema: `schemaVersion: 3`
- Arquivo de dados: TypeScript (`*.ts`)
- Interface: `GuidedLessonData` (em `src/types/guidedLesson.ts`)
- Componente: `GuidedLesson.tsx` (com suporte a V3)

### Estrutura de Arquivo Típica:

```typescript
export const minhaAulaV3: GuidedLessonData = {
  id: "unique-id",
  title: "Título da Aula",
  trackId: "trail-id",
  trackName: "Nome da Trilha",
  duration: 300, // segundos totais (áudio único)
  contentVersion: 4, // IMPORTANTE: identifica V3
  schemaVersion: 3,
  
  sections: [
    {
      id: "slide-1",
      title: "Slide 1",
      timestamp: 0,
      type: 'text',
      slideNumber: 1,
      imageUrl: "https://exemplo.com/slide1.jpg", // Opcional
      speechBubbleText: "Texto curto para balão",
      visualContent: "## Conteúdo visual do slide 1"
    },
    // ... mais 6 slides (~7 total recomendado)
  ],
  
  exercisesConfig: [
    {
      id: "ex-1",
      type: "scenario-selection",
      title: "Título",
      instruction: "Instrução",
      data: { /* config específica */ }
    },
  ],
  
  finalPlaygroundConfig: {
    id: "final-playground",
    type: "guided-prompt-builder",
    title: "Título",
    maiaIntro: "Introdução da MAIA",
    steps: [ /* etapas */ ]
  }
};
```

### Fluxo de Experiência V3:
1. **Áudio inicia** → Toca continuamente
2. **Slide 1** → Aparece no timestamp 0s
3. **Slide 2** → Aparece quando timestamp atinge T2
4. **Slide 3** → Aparece quando timestamp atinge T3
5. ... (até ~7 slides)
6. **Áudio termina** → Transição para exercícios
7. **Exercícios Finais** → Atividade prática
8. **Playground Final** → Aplicação do conhecimento
9. **Conclusão**

**Vantagens do V3:**
- ✅ Narrativa contínua (áudio não é interrompido)
- ✅ Experiência cinematográfica/apresentação
- ✅ Ideal para storytelling
- ✅ Simples de produzir (1 áudio + imagens)

---

## 🎯 Como Usar

### Ao Criar Nova Aula:

1. **Receber Especificação**: O conteúdo virá com indicação do modelo (V1, V2 ou V3)
2. **Seguir Estrutura**: Implementar seguindo a estrutura do modelo especificado
3. **Validar Componentes**: Garantir que todos os componentes necessários existem
4. **Testar**: Verificar que a experiência está conforme o modelo

### Identificação no Sistema:

- Cada aula tem `lesson_type` no banco de dados
- V1 usa `lesson_type: 'guided'` com `contentVersion: 1`
- V2 usa `lesson_type: 'guided'` com `contentVersion: 3` (padronizado)
- V3 usa `lesson_type: 'guided'` com `contentVersion: 4` (áudio único + slides)

## 📊 Comparação entre Modelos

| Característica | V1 | V2 | V3 |
|----------------|----|----|---- |
| **Áudio** | Por seção | Por seção | **Único** |
| **Playgrounds Mid** | ✅ Sim | ❌ Não | ❌ Não |
| **Playground Final** | ✅ Sim | ❌ Não | ✅ Sim |
| **Slides Visuais** | ❌ Não | ❌ Não | ✅ ~7 slides |
| **ContentVersion** | 1 | 3 | 4 |
| **SchemaVersion** | 1 | 2 | 3 |
| **Experiência** | Interativa | Linear | Cinematográfica |
| **Melhor para** | Aprendizado ativo | Consumo rápido | Apresentações |

### Estrutura Padrão V2 (CRÍTICO):

```typescript
// ✅ CORRETO - Estrutura padrão V2
sections: [
  {
    id: 'sessao-1',
    timestamp: 0,              // Timestamp acumulativo
    audio_url: 'https://...',  // URL pública do áudio
    speechBubbleText: '...',
    visualContent: '...'
  }
]

// ❌ ERRADO - Não usar
sections: [
  {
    audioUrl: '...',    // ❌ Usar audio_url
    startTime: 0,       // ❌ Usar timestamp
    endTime: 48,        // ❌ Não usar
    duration: 48        // ❌ Não usar
  }
]
```

---

## 📝 Notas de Desenvolvimento

- Sempre incrementar `contentVersion` quando modificar conteúdo de aula existente (cache-busting)
- Manter interfaces TypeScript sincronizadas com os modelos
- Documentar novos tipos de exercícios ou componentes interativos
- Exercícios devem ter feedback imediato e educativo

---

**Última Atualização:** Janeiro 2025  
**Próximo Passo:** Definir e implementar Modelo V2
