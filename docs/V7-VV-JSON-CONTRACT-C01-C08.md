# V7-vv JSON Contract (C01-C08)

> **Versão:** `v7-vv-1.0.0-c08`  
> **Commit Hash:** `c08-phase-drift-monotonicity-fix-2024`  
> **Gerado em:** 2025-02-06

Este documento define o **contrato JSON exato** do Pipeline V7-vv, extraído diretamente do código fonte (`supabase/functions/v7-vv/index.ts`).

---

## 📥 ESTRUTURA DE INPUT (ScriptInput)

Este é o JSON que você envia para o pipeline processar:

```typescript
interface ScriptInput {
  // ========== CAMPOS OBRIGATÓRIOS ==========
  title: string;                                    // Título da aula
  scenes: ScriptScene[];                            // Array de cenas (mínimo 1)
  
  // ========== CAMPOS OPCIONAIS ==========
  subtitle?: string;                                // Subtítulo da aula
  difficulty: 'beginner' | 'intermediate' | 'advanced';  // Default: 'beginner'
  category: string;                                 // Categoria (ex: "Fundamentos de IA")
  tags: string[];                                   // Tags de busca
  learningObjectives: string[];                     // Objetivos de aprendizado
  
  // ========== CONFIGURAÇÃO DE ÁUDIO ==========
  voice_id?: string;                                // ID da voz ElevenLabs (default: "JBFqnCBsd6RMkjVDRZzb")
  generate_audio?: boolean;                         // Se deve gerar áudio (default: true)
  fail_on_audio_error?: boolean;                    // Falhar se áudio der erro (default: true)
  
  // ========== MODOS DE EXECUÇÃO ==========
  dry_run?: boolean;                                // Validação sem gerar áudio
  reprocess?: boolean;                              // C01: Reprocessar com áudio existente
  existing_audio_url?: string;                      // URL do áudio existente (reprocess)
  existing_word_timestamps?: WordTimestamp[];       // Timestamps existentes (reprocess)
  existing_lesson_id?: string;                      // ID da lição existente (reprocess)
  
  // ========== C05: RASTREABILIDADE ==========
  run_id?: string;                                  // UUID único para idempotência (auto-gerado se não fornecido)
  
  // ========== PASSTHROUGH PARA OUTPUT ==========
  postLessonExercises?: any[];                      // Exercícios pós-aula (passados direto)
  postLessonFlow?: Record<string, unknown>;         // Fluxo pós-aula (passado direto)
  gamification?: Record<string, unknown>;           // Configuração de gamificação (passado direto)
}
```

---

## 📄 ESTRUTURA DE CENA (ScriptScene)

```typescript
interface ScriptScene {
  // ========== IDENTIFICAÇÃO ==========
  id: string;                                       // ID único da cena (ex: "cena-1-intro")
  title: string;                                    // Título da cena
  
  // ========== TIPO DE CENA ==========
  // TIPOS VÁLIDOS para scene.type:
  // - "dramatic"     → Cenas de impacto/hook
  // - "narrative"    → Cenas explicativas
  // - "revelation"   → Revelações (ex: PERFEITO)
  // - "comparison"   → Comparativos (split-screen)
  // - "interaction"  → Quiz com opções
  // - "playground"   → Chat/playground de prática
  // - "gamification" → Resultado de pontos (mapeado para "narrative" no output)
  // - "secret-reveal"→ Revelação especial (mapeado para "revelation" no output)
  //
  // ⚠️ PROIBIDO: scene.type="cta" → Use scene.type="narrative" com visual.type="cta"
  type: string;
  
  // ========== NARRAÇÃO (TTS) ==========
  narration: string;                                // Texto para geração de áudio
  
  // ========== ANCHOR TEXT (C07) ==========
  // Controla pausas e transições baseadas em palavras-chave
  anchorText?: {
    pauseAt?: string;                               // Palavra para pausar (fases interativas)
    transitionAt?: string;                          // Palavra para transição de fase
  };
  // NOTA: pauseAt é AUTO-GERADO para fases interativas se não fornecido
  
  // ========== VISUAL ==========
  visual: {
    type: string;                                   // Tipo do visual (ver lista abaixo)
    content: Record<string, unknown>;               // Conteúdo específico do visual
    effects?: Record<string, unknown>;              // Efeitos visuais opcionais
    microVisuals?: MicroVisualInput[];              // Micro-visuais sincronizados
  };
  
  // ========== INTERAÇÃO (Quiz/Playground) ==========
  interaction?: {
    type: 'quiz' | 'playground' | 'cta-button';
    options?: QuizOptionInput[];                    // Opções do quiz
    amateurPrompt?: string;                         // Prompt amador (playground)
    professionalPrompt?: string;                    // Prompt profissional (playground)
    [key: string]: unknown;
  };
}
```

---

## 🎨 TIPOS DE VISUAL VÁLIDOS

```typescript
const VALID_VISUAL_TYPES = [
  'number-reveal',      // Revelação de número com animação
  'text-reveal',        // Revelação de texto
  'split-screen',       // Comparativo lado a lado
  'letter-reveal',      // Acrônimo letra por letra (ex: PERFEITO)
  'cards-reveal',       // Cards revelados sequencialmente
  'quiz',               // Visual de quiz
  'quiz-feedback',      // Feedback após resposta
  'playground',         // Interface de playground
  'result',             // Resultado/conquista
  'cta',                // Call to action com botão
  '3d-dual-monitors',   // Visual 3D com monitores
  '3d-abstract',        // Visual 3D abstrato
  '3d-number-reveal'    // Número 3D com reveal
];
```

### Schemas por Tipo de Visual

| visual.type | Campos Obrigatórios | Campos Opcionais |
|-------------|---------------------|------------------|
| `number-reveal` | `number` | `secondaryNumber`, `subtitle`, `hookQuestion`, `mood`, `countUp` |
| `text-reveal` | (nenhum) | `title`, `mainText`, `items`, `highlightWord` |
| `split-screen` | `left`, `right` | - |
| `letter-reveal` | `letters` | `word`, `finalStamp` |
| `cards-reveal` | `cards` | `title` |
| `quiz` | (nenhum) | `question`, `subtitle` |
| `quiz-feedback` | (nenhum) | `title`, `subtitle` |
| `playground` | (nenhum) | `title`, `subtitle` |
| `result` | `title` | `emoji`, `message`, `metrics` |
| `cta` | `buttonText` | `title`, `subtitle` |

---

## 🔵 MICRO-VISUAIS (INPUT)

```typescript
interface MicroVisualInput {
  id: string;                                       // ID único
  type: string;                                     // Tipo (moderno ou legado)
  anchorText: string;                               // Palavra-âncora na narração
  content: Record<string, unknown>;                 // Conteúdo específico
}
```

### Tipos de MicroVisual

| Input (Moderno) | Output (Legado) | Descrição |
|-----------------|-----------------|-----------|
| `image` | `image-flash` | Flash de imagem |
| `text` | `text-pop` | Pop de texto |
| `number` | `number-count` | Contador numérico |
| `badge` | `card-reveal` | Card/badge |
| `highlight` | `highlight` | Destaque (passthrough) |
| `letter-reveal` | `letter-reveal` | Letra (passthrough) |

⚠️ **Tipo `icon` é REJEITADO** - Use `image` com `imageUrl`/`emoji` ou `badge`.

---

## 🎯 ANCHOR ACTIONS (C06 Single Trigger Contract)

```typescript
interface AnchorAction {
  id: string;                                       // ID único
  keyword: string;                                  // Palavra-âncora
  keywordTime: number;                              // Tempo em segundos (calculado pelo pipeline)
  type: 'pause' | 'show' | 'highlight' | 'trigger'; // Tipo de ação
  targetId?: string;                                // ID do elemento alvo (para show/highlight)
  
  // ========== C07.2 CAMPOS ==========
  c07OriginalTime?: number;                         // Tempo original da pausa (não recalculado)
  c07PriorityApplied?: boolean;                     // Se C07.2 Priority Rule foi aplicada
  c07Applied?: boolean;                             // Se C07 foi aplicado
  c07Version?: string;                              // Versão do C07 (ex: "2.1")
  c07Reason?: string;                               // Motivo da inserção/correção
}
```

### Estratégias de Anchor (R3)

| Tipo de Anchor | Estratégia | Descrição |
|----------------|------------|-----------|
| `pause` | `LAST_IN_RANGE` | Última ocorrência no range da fase |
| `show` | `FIRST_IN_RANGE` | Primeira ocorrência no range da fase |
| `highlight` | `FIRST_IN_RANGE` | Primeira ocorrência no range da fase |

---

## 📤 ESTRUTURA DE OUTPUT (LessonData)

Este é o JSON gerado pelo pipeline e salvo no banco:

```typescript
interface LessonData {
  // ========== METADADOS RAIZ ==========
  schema: string;                                   // "v7-vv"
  version: string;                                  // "1.0.0"
  title: string;                                    // Título da aula
  subtitle: string;                                 // Subtítulo
  difficulty: string;                               // "beginner" | "intermediate" | "advanced"
  category: string;                                 // Categoria
  tags: string[];                                   // Tags
  learningObjectives: string[];                     // Objetivos
  estimatedDuration: number;                        // Duração em segundos
  
  // ========== METADATA ==========
  metadata: {
    version: string;                                // "1.0.0"
    phaseCount: number;                             // Total de fases
    totalDuration: number;                          // Duração total em segundos
    hasInteractivePhases: boolean;                  // Se tem fases interativas
    hasPlayground: boolean;                         // Se tem playground
    hasPostLessonExercises: boolean;                // Se tem exercícios pós-aula
    triggerContract: 'anchorActions';               // C06: Contrato único de triggers
  };
  
  // ========== FASES ==========
  phases: Phase[];                                  // Array de fases processadas
  
  // ========== ÁUDIO ==========
  audio: {
    mainAudio: AudioSegment;                        // Áudio principal
    feedbackAudios?: FeedbackAudiosObject;          // Áudios de feedback (quiz)
  };
  
  // ========== PASSTHROUGH ==========
  postLessonExercises?: any[];
  postLessonFlow?: Record<string, unknown>;
  gamification?: Record<string, unknown>;
}
```

---

## 📊 ESTRUTURA DE FASE (OUTPUT)

```typescript
interface Phase {
  id: string;                                       // ID da fase
  title: string;                                    // Título
  type: string;                                     // Tipo da fase
  startTime: number;                                // Início em segundos
  endTime: number;                                  // Fim em segundos
  
  visual: {
    type: string;                                   // Tipo do visual
    content: Record<string, unknown>;               // Conteúdo
  };
  
  effects?: Record<string, unknown>;                // Efeitos visuais
  microVisuals?: MicroVisual[];                     // Micro-visuais processados
  anchorActions?: AnchorAction[];                   // Ações de anchor (C06)
  interaction?: Record<string, unknown>;            // Dados de interação
  
  audioBehavior?: {
    onStart: string;                                // 'play' | 'pause'
    onComplete: string;                             // 'continue' | 'pause'
  };
  
  // ========== CAMPOS DE DEBUG/AUDIT ==========
  pauseKeywords?: string[];                         // Keywords de pausa (deprecated, use anchorActions)
  
  // ========== C07/C08 CAMPOS ==========
  c07Applied?: boolean;
  c07Version?: string;
  c07Reason?: string;
  phaseDriftFixed?: boolean;                        // C08: Se drift foi corrigido
  phaseDriftReason?: string;                        // C08: Motivo da correção
  phaseDriftOldStartTime?: number;                  // C08: startTime original
}
```

---

## 🔊 ESTRUTURA DE ÁUDIO

```typescript
interface AudioSegment {
  id: string;                                       // ID do segmento
  url: string;                                      // URL do arquivo de áudio
  duration: number;                                 // Duração em segundos
  wordTimestamps: WordTimestamp[];                  // Timestamps por palavra
}

interface WordTimestamp {
  word: string;                                     // Palavra falada
  start: number;                                    // Início em segundos
  end: number;                                      // Fim em segundos
}

// Feedback audios são indexados por ID
interface FeedbackAudiosObject {
  [key: string]: {
    id: string;
    url: string;
    duration: number;
    wordTimestamps: WordTimestamp[];
    trigger: string;
  };
}
```

---

## ⚙️ REGRAS DO PIPELINE (C01-C08)

### C01: Reprocess Mode
- Permite reprocessar com áudio existente
- `reprocess: true` + `existing_audio_url` + `existing_word_timestamps`
- Apenas recalcula timings, não regenera áudio

### C02: Anchor Recalculation
- Recalcula `keywordTime` de todos os anchors
- Usa estratégia `LAST_IN_RANGE` para pauses
- Usa estratégia `FIRST_IN_RANGE` para show/highlight
- Tolerância EPS: 0.30s

### C04: Timeline Normalization
- Garante monotonicidade (startTime >= prevEndTime)
- Clamp em [0, audioDuration]
- Duração mínima: 5s para interativas, 0.5s para narrativas

### C05: Traceability
- `run_id` para idempotência
- `pipeline_version` e `commit_hash`
- `output_content_hash` (SHA-256 via SQL RPC)
- Tabela `pipeline_executions` com input/output

### C06: Single Trigger Contract
- `anchorActions` é a única fonte de verdade
- `triggerTime` é REMOVIDO de microVisuals
- Metadata inclui `triggerContract: 'anchorActions'`

### C07: Interactive Phase Timing
- **C07.1**: Auto-geração de pauseAt para fases interativas
- **C07.2**: Priority Rule - c07OriginalTime não é recalculado
- **C07.3**: PREPASS Alignment - startTime = firstWordTime - 0.2s
- Duração mínima garantida de 5s

### C08: Phase Drift Monotonicity Fix
- Detecta quando narração está ANTES do startTime da fase
- Expande startTime para cobrir narração
- Ajusta endTime da fase anterior para manter monotonicidade
- Janela de busca: 30s antes do startTime

---

## 📋 EXEMPLO COMPLETO DE INPUT

```json
{
  "title": "Dominando Prompts com PERFEITO",
  "subtitle": "O método dos 8 pilares",
  "difficulty": "beginner",
  "category": "Fundamentos de IA",
  "tags": ["prompts", "método", "iniciante"],
  "learningObjectives": [
    "Entender os 8 elementos do método PERFEITO",
    "Aplicar cada elemento em prompts reais"
  ],
  "scenes": [
    {
      "id": "cena-1-intro",
      "title": "Introdução",
      "type": "dramatic",
      "narration": "Você sabia que 90% das pessoas usam a IA de forma errada? Hoje isso vai mudar.",
      "visual": {
        "type": "number-reveal",
        "content": {
          "number": "90%",
          "subtitle": "das pessoas desperdiçam o potencial da IA",
          "mood": "danger",
          "countUp": true
        }
      }
    },
    {
      "id": "cena-2-perfeito",
      "title": "Método PERFEITO",
      "type": "revelation",
      "narration": "Esse é o método PERFEITO. Persona específica. Estrutura clara. Resultado esperado. Formato definido. Exemplos práticos. Iteração contínua. Tom adequado. Otimização constante. Com esse método, seus prompts serão imbatíveis.",
      "anchorText": {
        "pauseAt": "imbatíveis"
      },
      "visual": {
        "type": "letter-reveal",
        "content": {
          "word": "PERFEITO",
          "finalStamp": "PERFEITO",
          "letters": [
            { "letter": "P", "meaning": "Persona Específica" },
            { "letter": "E", "meaning": "Estrutura Clara" },
            { "letter": "R", "meaning": "Resultado Esperado" },
            { "letter": "F", "meaning": "Formato Definido" },
            { "letter": "E", "meaning": "Exemplos Práticos" },
            { "letter": "I", "meaning": "Iteração Contínua" },
            { "letter": "T", "meaning": "Tom Adequado" },
            { "letter": "O", "meaning": "Otimização Constante" }
          ]
        },
        "microVisuals": [
          { "id": "mv-p", "anchorText": "Persona", "type": "letter-reveal", "content": { "index": 0 } },
          { "id": "mv-e1", "anchorText": "Estrutura", "type": "letter-reveal", "content": { "index": 1 } },
          { "id": "mv-r", "anchorText": "Resultado", "type": "letter-reveal", "content": { "index": 2 } },
          { "id": "mv-f", "anchorText": "Formato", "type": "letter-reveal", "content": { "index": 3 } },
          { "id": "mv-e2", "anchorText": "Exemplos", "type": "letter-reveal", "content": { "index": 4 } },
          { "id": "mv-i", "anchorText": "Iteração", "type": "letter-reveal", "content": { "index": 5 } },
          { "id": "mv-t", "anchorText": "Tom", "type": "letter-reveal", "content": { "index": 6 } },
          { "id": "mv-o", "anchorText": "Otimização", "type": "letter-reveal", "content": { "index": 7 } }
        ]
      }
    },
    {
      "id": "cena-3-quiz",
      "title": "Quiz",
      "type": "interaction",
      "narration": "Agora me diga, qual é a primeira letra do método e o que ela representa?",
      "visual": {
        "type": "quiz",
        "content": {
          "question": "O que significa o 'P' do método PERFEITO?"
        }
      },
      "interaction": {
        "type": "quiz",
        "options": [
          {
            "id": "opt-a",
            "text": "Persona Específica",
            "isCorrect": true,
            "feedback": {
              "title": "Excelente!",
              "subtitle": "Você prestou atenção!",
              "mood": "success",
              "narration": "Isso mesmo! A Persona é fundamental para direcionar a IA."
            }
          },
          {
            "id": "opt-b",
            "text": "Prompt Perfeito",
            "isCorrect": false,
            "feedback": {
              "title": "Quase!",
              "subtitle": "Revise o método",
              "mood": "warning",
              "narration": "Não é isso. O P significa Persona Específica."
            }
          }
        ]
      }
    },
    {
      "id": "cena-4-cta",
      "title": "Finalização",
      "type": "narrative",
      "narration": "Parabéns! Você aprendeu o método PERFEITO. Continue praticando!",
      "visual": {
        "type": "cta",
        "content": {
          "emoji": "🏆",
          "title": "Método Dominado!",
          "message": "Você conhece os 8 elementos do PERFEITO",
          "buttonText": "Próxima Aula"
        }
      },
      "interaction": {
        "type": "cta-button"
      }
    }
  ]
}
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

| Item | Regra |
|------|-------|
| ✅ `title` | Obrigatório, string não vazia |
| ✅ `scenes` | Mínimo 1 cena |
| ✅ `scene.type` | Não pode ser "cta" (use visual.type="cta") |
| ✅ `visual.type` | Deve estar em VALID_VISUAL_TYPES |
| ✅ `microVisual.type` | Deve estar em VALID_MICROVISUAL_TYPES |
| ✅ `microVisual.anchorText` | Deve existir na narração da mesma cena |
| ✅ Quiz options | Pelo menos 1 opção com `isCorrect: true` |
| ✅ Playground | Requer `amateurPrompt` e `professionalPrompt` |
| ✅ letter-reveal | Narração do acrônimo deve estar na mesma cena |

---

## 🔗 Referências

- **Pipeline:** `supabase/functions/v7-vv/index.ts`
- **Renderer:** `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`
- **Letter-Reveal Guide:** `docs/V7-JSON-TEMPLATE-LETTER-REVEAL.md`
- **Rastreabilidade:** Tabela `pipeline_executions`
