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
- Identificador de versão: `contentVersion: 2`
- Arquivo de dados: TypeScript (`*.ts`)
- Interface: `GuidedLessonData` (em `src/types/guidedLesson.ts`)
- Componente: `GuidedLesson.tsx` (com suporte a V2)

### Estrutura de Arquivo Típica:

```typescript
export const minhaAulaV2: GuidedLessonData = {
  id: "unique-id",
  title: "Título da Aula",
  trackId: "trail-id",
  trackName: "Nome da Trilha",
  duration: 300, // segundos totais estimados
  contentVersion: 2, // IMPORTANTE: identifica V2
  
  sections: [
    {
      id: "section-1",
      title: "Seção 1",
      timestamp: 0,
      type: 'text',
      audioUrl: "/audio/secao-1.mp3", // Áudio específico desta seção
      wordTimestamps: [ /* timestamps reais */ ],
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

## 🔜 Modelo V3

**Status:** 🚧 A ser implementado

**Descrição:** _A ser definido quando criarmos a primeira aula V3_

### Características Planejadas:
- _A ser especificado_

---

## 🎯 Como Usar

### Ao Criar Nova Aula:

1. **Receber Especificação**: O conteúdo virá com indicação do modelo (V1, V2 ou V3)
2. **Seguir Estrutura**: Implementar seguindo a estrutura do modelo especificado
3. **Validar Componentes**: Garantir que todos os componentes necessários existem
4. **Testar**: Verificar que a experiência está conforme o modelo

### Identificação no Sistema:

- Cada aula tem `lesson_type` no banco de dados
- V1 usa `lesson_type: 'guided'`
- V2 e V3 terão seus próprios `lesson_type` quando forem definidos

---

## 📝 Notas de Desenvolvimento

- Sempre incrementar `contentVersion` quando modificar conteúdo de aula existente (cache-busting)
- Manter interfaces TypeScript sincronizadas com os modelos
- Documentar novos tipos de exercícios ou componentes interativos
- Exercícios devem ter feedback imediato e educativo

---

**Última Atualização:** Janeiro 2025  
**Próximo Passo:** Definir e implementar Modelo V2
