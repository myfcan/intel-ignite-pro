# V7-VV Modelo JSON Definitivo

Este documento define o **formato exato** do JSON de entrada para criar aulas V7 cinematográficas.

---

## Schema TypeScript Completo

```typescript
/**
 * V7 Script Input - Formato de entrada para o Pipeline V7-vv
 * Este é o JSON que o administrador deve fornecer
 */
interface V7ScriptInput {
  // ========================================
  // METADADOS (Obrigatórios)
  // ========================================
  
  /** Título principal da aula */
  title: string;
  
  /** Subtítulo explicativo (opcional) */
  subtitle?: string;
  
  /** Nível de dificuldade */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  /** Categoria da aula (slug) */
  category: string;
  
  /** Tags para busca e organização */
  tags: string[];
  
  /** Objetivos de aprendizado (3-5 recomendados) */
  learningObjectives: string[];
  
  // ========================================
  // CONFIGURAÇÕES DE ÁUDIO
  // ========================================
  
  /** ID da voz ElevenLabs (opcional - usa default se não informado) */
  voice_id?: string;
  
  /** Gerar áudio automaticamente (default: true) */
  generate_audio?: boolean;
  
  /** Falhar se geração de áudio falhar (default: false) */
  fail_on_audio_error?: boolean;
  
  // ========================================
  // CENAS (Obrigatório - mínimo 1)
  // ========================================
  
  scenes: V7Scene[];
}

/**
 * V7 Scene - Uma cena/fase da aula
 */
interface V7Scene {
  // ========================================
  // IDENTIFICAÇÃO
  // ========================================
  
  /** ID único da cena (ex: "scene-1-dramatic") */
  id: string;
  
  /** Título descritivo (ex: "Estatística Chocante") */
  title: string;
  
  /** Tipo da cena - determina comportamento */
  type: V7SceneType;
  
  // ========================================
  // NARRAÇÃO
  // ========================================
  
  /** 
   * Texto que será narrado pela IA
   * IMPORTANTE: Deve conter as palavras-chave de anchorText
   */
  narration: string;
  
  // ========================================
  // SINCRONIZAÇÃO (Crítico para interações)
  // ========================================
  
  /** 
   * Configuração de sincronização por palavra-chave
   * OBRIGATÓRIO para: interaction, playground, secret-reveal, cta
   */
  anchorText?: {
    /** 
     * Palavra/frase que pausa o áudio
     * Deve existir EXATAMENTE na narração
     */
    pauseAt?: string;
    
    /** 
     * Palavra/frase que transiciona para próxima fase
     * Usado para transições automáticas baseadas em narração
     */
    transitionAt?: string;
  };
  
  // ========================================
  // VISUAL
  // ========================================
  
  visual: {
    /** Tipo de visual a renderizar */
    type: V7VisualType;
    
    /** Conteúdo específico para o tipo visual */
    content: V7VisualContent;
    
    /** Efeitos visuais opcionais */
    effects?: {
      mood?: 'danger' | 'success' | 'warning' | 'neutral' | 'dramatic';
      particles?: boolean | 'confetti' | 'sparks' | 'ember' | 'stars';
      glow?: boolean;
      shake?: boolean;
      vignette?: boolean;
    };
    
    /** Micro-visuais que aparecem durante a narração */
    microVisuals?: V7MicroVisual[];
  };
  
  // ========================================
  // INTERAÇÃO (Opcional - para tipos interativos)
  // ========================================
  
  interaction?: V7Interaction;
}

// ========================================
// TIPOS DE CENA
// ========================================

type V7SceneType = 
  | 'dramatic'      // Número/estatística impactante
  | 'narrative'     // Texto narrativo com items
  | 'comparison'    // Split-screen lado a lado
  | 'interaction'   // Quiz de múltipla escolha
  | 'playground'    // Comparação prompt amador vs pro
  | 'revelation'    // Revelação letra por letra (PERFEITO)
  | 'secret-reveal' // Revelação com áudio próprio
  | 'cta'          // Call-to-action com botão
  | 'gamification'; // Resultado final com métricas

// ========================================
// TIPOS DE VISUAL
// ========================================

type V7VisualType =
  | 'number-reveal'   // Número grande com animação
  | 'text-reveal'     // Texto progressivo
  | 'split-screen'    // Lado a lado
  | 'letter-reveal'   // Letra por letra
  | 'cards-reveal'    // Cards em sequência
  | 'quiz'            // Tela de quiz
  | 'quiz-feedback'   // Feedback do quiz
  | 'playground'      // Comparação de prompts
  | 'result'          // Resultado/gamificação
  | 'cta';            // Call-to-action

// ========================================
// CONTEÚDO VISUAL POR TIPO
// ========================================

interface V7NumberRevealContent {
  hookQuestion?: string;        // "VOCÊ SABIA?"
  number: string;               // "98%"
  secondaryNumber?: string;     // "2%"
  subtitle?: string;            // "das pessoas fazem errado"
  mood?: 'danger' | 'success' | 'warning' | 'neutral';
  countUp?: boolean;            // Animação de contagem
}

interface V7SplitScreenContent {
  left: {
    label: string;              // "OS 98%"
    mood: 'danger' | 'success' | 'warning';
    items: string[];            // ["Item 1", "Item 2"]
    emoji?: string;             // "❌"
  };
  right: {
    label: string;              // "OS 2%"
    mood: 'danger' | 'success' | 'warning';
    items: string[];
    emoji?: string;             // "✅"
  };
}

interface V7LetterRevealContent {
  word: string;                 // "PERFEITO"
  letters: Array<{
    letter: string;             // "P"
    meaning: string;            // "Persona"
    subtitle?: string;          // Explicação adicional
  }>;
  finalStamp?: string;          // "MÉTODO"
}

interface V7QuizContent {
  question: string;             // "Você faz parte de qual grupo?"
  mood?: 'danger' | 'success' | 'warning' | 'neutral';
}

interface V7ResultContent {
  emoji?: string;               // "🎉"
  title: string;                // "Aula Completa!"
  message?: string;             // "Você está pronto para o próximo passo."
  metrics?: Array<{
    label: string;              // "XP"
    value: string;              // "+100"
    isHighlight?: boolean;
  }>;
  ctaText?: string;             // "Continuar Jornada"
}

// ========================================
// INTERAÇÕES
// ========================================

type V7Interaction = V7QuizInteraction | V7PlaygroundInteraction | V7CTAInteraction;

interface V7QuizInteraction {
  type: 'quiz';
  options: V7QuizOption[];
  correctFeedback?: string;     // Fallback se não tiver feedback individual
  incorrectFeedback?: string;
}

interface V7QuizOption {
  id: string;                   // "opt-1"
  text: string;                 // "Peço piadas e textos criativos"
  
  /** 
   * Categoria para cálculo de resultado
   * 'bad' = resposta negativa
   * 'good' = resposta positiva
   */
  category?: 'good' | 'bad';
  
  /**
   * Feedback específico para esta opção
   * RECOMENDADO: Inclua 'narration' para feedback narrado
   */
  feedback?: {
    title: string;              // "Você Faz Parte dos 98%"
    subtitle: string;           // "Mas calma, vou te mostrar o caminho"
    mood: 'success' | 'warning' | 'danger' | 'neutral';
    
    /** 
     * Texto que será narrado como feedback
     * Se presente, Pipeline gera áudio específico
     */
    narration?: string;         // "Tudo bem, a maioria está assim..."
  };
  
  /** Emoji opcional para a opção */
  emoji?: string;
}

interface V7PlaygroundInteraction {
  type: 'playground';
  
  /** Prompt "amador" para comparação */
  amateurPrompt: string;
  
  /** Prompt "profissional" para comparação */
  professionalPrompt: string;
  
  /** Resultado do prompt amador */
  amateurResult: {
    title: string;
    content: string;
    score: number;              // 0-10
    verdict: 'bad' | 'good' | 'excellent';
  };
  
  /** Resultado do prompt profissional */
  professionalResult: {
    title: string;
    content: string;
    score: number;
    verdict: 'bad' | 'good' | 'excellent';
  };
  
  /** Desafio opcional para o usuário */
  userChallenge?: {
    instruction: string;
    challengePrompt: string;
    hints: string[];
  };
}

interface V7CTAInteraction {
  type: 'cta-button';
  buttonText: string;           // "Começar Agora"
  action: 'next-phase' | 'complete';
}

// ========================================
// MICRO-VISUAIS
// ========================================

interface V7MicroVisual {
  id: string;
  
  /** Palavra-chave que dispara o micro-visual */
  anchorText: string;
  
  type: 'icon' | 'text' | 'number' | 'image' | 'badge' | 'highlight';
  
  content: {
    value?: string;
    icon?: string;
    color?: string;
    animation?: 'fade' | 'pop' | 'slide' | 'bounce';
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  };
  
  /** Duração em segundos */
  duration: number;
}
```

---

## Exemplos Completos

### Exemplo 1: Aula Completa (Estilo Aula 1)

```json
{
  "title": "A Revolução dos Prompts",
  "subtitle": "Como usar IA de forma profissional",
  "difficulty": "beginner",
  "category": "fundamentos-ia",
  "tags": ["prompts", "produtividade", "ia"],
  "learningObjectives": [
    "Entender a diferença entre uso amador e profissional de IA",
    "Conhecer o método PERFEITO de prompts",
    "Aplicar o método em situações reais"
  ],
  "voice_id": "XB0fDUnXU5powFXDhCwa",
  "generate_audio": true,
  
  "scenes": [
    {
      "id": "scene-1-hook",
      "title": "Gancho Inicial",
      "type": "dramatic",
      "narration": "Noventa e oito por cento das pessoas que usam Inteligência Artificial hoje tratam ela como brinquedo. Isso mesmo. Elas fazem da Inteligência Artificial um brinquedo para passar o tempo.",
      "visual": {
        "type": "number-reveal",
        "content": {
          "hookQuestion": "VOCÊ SABIA?",
          "number": "98%",
          "subtitle": "das pessoas tratam IA como brinquedo",
          "mood": "danger"
        },
        "effects": {
          "particles": true,
          "glow": true
        }
      }
    },
    {
      "id": "scene-2-examples",
      "title": "Exemplos Ruins",
      "type": "narrative",
      "narration": "Elas pedem: conta uma piada sobre banana. Escreve como pirata. Faz um poema sobre meu gato.",
      "visual": {
        "type": "text-reveal",
        "content": {
          "title": "O que os 98% pedem:",
          "items": [
            { "icon": "🍌", "text": "Conta uma piada sobre banana" },
            { "icon": "🏴‍☠️", "text": "Escreve como pirata" },
            { "icon": "🐱", "text": "Faz um poema sobre meu gato" }
          ]
        }
      }
    },
    {
      "id": "scene-3-contrast",
      "title": "O Contraste",
      "type": "comparison",
      "narration": "Enquanto isso, outros dois por cento estão faturando mais de trinta mil reais por mês. Um lado brinca. O outro usa como ferramenta. Um lado recebe respostas genéricas. O outro recebe entregas aplicáveis.",
      "visual": {
        "type": "split-screen",
        "content": {
          "left": {
            "label": "OS 98%",
            "emoji": "❌",
            "mood": "danger",
            "items": [
              "Brincam com IA",
              "Respostas genéricas",
              "Passam tempo"
            ]
          },
          "right": {
            "label": "OS 2%",
            "emoji": "✅",
            "mood": "success",
            "items": [
              "Usam como ferramenta",
              "Entregas aplicáveis",
              "Faturam R$30mil/mês"
            ]
          }
        }
      }
    },
    {
      "id": "scene-4-quiz",
      "title": "Auto-Avaliação",
      "type": "interaction",
      "narration": "Seja honesto consigo mesmo. Você faz parte dos noventa e oito por cento, ou dos dois por cento que dominam a IA?",
      "anchorText": {
        "pauseAt": "IA"
      },
      "visual": {
        "type": "quiz",
        "content": {
          "question": "Seja honesto: você faz parte de qual grupo?"
        }
      },
      "interaction": {
        "type": "quiz",
        "options": [
          {
            "id": "opt-amateur",
            "text": "Peço piadas e textos criativos sem propósito",
            "category": "bad",
            "emoji": "🎭",
            "feedback": {
              "title": "Você Faz Parte dos 98%",
              "subtitle": "Mas calma, vou te mostrar o caminho dos 2%",
              "mood": "warning",
              "narration": "Tudo bem, a maioria das pessoas está nesse grupo. Mas a boa notícia é que você está aqui para aprender a diferença."
            }
          },
          {
            "id": "opt-middle",
            "text": "Uso para trabalho, mas sem método definido",
            "category": "bad",
            "emoji": "🤔",
            "feedback": {
              "title": "Você Está no Caminho",
              "subtitle": "Falta apenas o método certo",
              "mood": "neutral",
              "narration": "Você já usa a IA para trabalho, isso é ótimo! Agora vou te dar o método que separa amadores de profissionais."
            }
          },
          {
            "id": "opt-pro",
            "text": "Uso prompts estruturados com estratégia",
            "category": "good",
            "emoji": "🚀",
            "feedback": {
              "title": "Parabéns!",
              "subtitle": "Você já está no caminho dos 2%",
              "mood": "success",
              "narration": "Excelente! Você já entende o poder dos prompts estruturados. Vamos aprofundar ainda mais."
            }
          }
        ]
      }
    },
    {
      "id": "scene-5-method",
      "title": "O Método PERFEITO",
      "type": "revelation",
      "narration": "Existe um método que separa amadores de profissionais. Ele se chama PERFEITO. Cada letra representa um elemento essencial de um prompt profissional.",
      "visual": {
        "type": "letter-reveal",
        "content": {
          "word": "PERFEITO",
          "letters": [
            { "letter": "P", "meaning": "Persona", "subtitle": "Quem a IA deve ser" },
            { "letter": "E", "meaning": "Expectativa", "subtitle": "O que você espera" },
            { "letter": "R", "meaning": "Restrições", "subtitle": "O que evitar" },
            { "letter": "F", "meaning": "Formato", "subtitle": "Como deve vir" },
            { "letter": "E", "meaning": "Exemplos", "subtitle": "Referências" },
            { "letter": "I", "meaning": "Iteração", "subtitle": "Refinamento" },
            { "letter": "T", "meaning": "Tom", "subtitle": "Estilo de comunicação" },
            { "letter": "O", "meaning": "Output", "subtitle": "Resultado esperado" }
          ],
          "finalStamp": "MÉTODO"
        }
      }
    },
    {
      "id": "scene-6-conclusion",
      "title": "Conclusão",
      "type": "gamification",
      "narration": "Parabéns! Você deu o primeiro passo para fazer parte dos dois por cento. Agora você conhece o método PERFEITO.",
      "visual": {
        "type": "result",
        "content": {
          "emoji": "🎉",
          "title": "Aula Completa!",
          "message": "Você aprendeu o método PERFEITO de prompts",
          "metrics": [
            { "label": "XP Ganho", "value": "+100", "isHighlight": true },
            { "label": "Moedas", "value": "+25" },
            { "label": "Progresso", "value": "1/8 aulas" }
          ],
          "ctaText": "Continuar Jornada"
        }
      }
    }
  ]
}
```

### Exemplo 2: Aula com Playground

```json
{
  "title": "Prompts na Prática",
  "subtitle": "Veja a diferença entre amador e profissional",
  "difficulty": "intermediate",
  "category": "pratica-prompts",
  "tags": ["prompts", "pratica", "comparacao"],
  "learningObjectives": [
    "Comparar resultados de prompts amadores vs profissionais",
    "Aplicar o método PERFEITO em um caso real"
  ],
  
  "scenes": [
    {
      "id": "scene-1-intro",
      "title": "Introdução",
      "type": "narrative",
      "narration": "Vamos colocar o método PERFEITO em prática. Você vai ver a diferença real entre um prompt amador e um profissional.",
      "visual": {
        "type": "text-reveal",
        "content": {
          "title": "Hora da Prática",
          "mainText": "Veja com seus próprios olhos a diferença"
        }
      }
    },
    {
      "id": "scene-2-playground",
      "title": "Comparação de Prompts",
      "type": "playground",
      "narration": "Observe os dois prompts abaixo. O primeiro é como a maioria das pessoas escreve. O segundo usa o método PERFEITO. Veja a diferença nos resultados.",
      "anchorText": {
        "pauseAt": "resultados"
      },
      "visual": {
        "type": "playground",
        "content": {
          "title": "Compare os Resultados",
          "instruction": "Qual prompt você usaria?"
        }
      },
      "interaction": {
        "type": "playground",
        "amateurPrompt": "Escreva um email de vendas para meu produto",
        "professionalPrompt": "Aja como um especialista em copywriting B2B com 10 anos de experiência. Escreva um email de vendas para um software de gestão. O tom deve ser profissional mas acessível. O email deve ter: 1) Gancho inicial com problema comum, 2) Apresentação da solução, 3) Prova social, 4) CTA claro. Limite: 200 palavras.",
        "amateurResult": {
          "title": "Resultado Genérico",
          "content": "Prezado cliente,\n\nGostaria de apresentar nosso produto que é muito bom e vai ajudar sua empresa a crescer. Temos muitos clientes satisfeitos.\n\nEntre em contato para saber mais.",
          "score": 3,
          "verdict": "bad"
        },
        "professionalResult": {
          "title": "Resultado Profissional",
          "content": "João,\n\nVocê perde 4 horas por semana procurando informações em planilhas desorganizadas?\n\nO GestãoPro elimina esse caos. É o mesmo sistema que a Magazine Luiza usa para gerenciar 100+ lojas.\n\n\"Reduzimos erros em 78% no primeiro mês\" - Carlos, Diretor da TechCorp\n\nQuer ver funcionando na sua empresa? Responda este email e agendo uma demo de 15 minutos.",
          "score": 9,
          "verdict": "excellent"
        }
      }
    },
    {
      "id": "scene-3-conclusion",
      "title": "Conclusão",
      "type": "gamification",
      "narration": "A diferença é clara. Com o método certo, você transforma respostas genéricas em entregas profissionais.",
      "visual": {
        "type": "result",
        "content": {
          "emoji": "🎯",
          "title": "Prática Completa!",
          "message": "Você viu o poder do método PERFEITO",
          "metrics": [
            { "label": "XP Ganho", "value": "+150" }
          ]
        }
      }
    }
  ]
}
```

---

## Validação

O Pipeline valida automaticamente:

| Campo | Validação |
|-------|-----------|
| `title` | Obrigatório, não vazio |
| `scenes` | Mínimo 1 cena |
| `scenes[].id` | Obrigatório, único |
| `scenes[].narration` | Obrigatório, não vazio |
| `scenes[].visual` | Obrigatório |
| `anchorText.pauseAt` | **Obrigatório** para tipos: interaction, playground, secret-reveal, cta |
| `anchorText.pauseAt` | Palavra deve existir na narração |

---

## Dicas de Escrita

### Narração

1. **Escreva como você fala** - O texto será narrado, então use linguagem natural
2. **Pausas naturais** - Use pontuação para criar pausas
3. **Palavras-chave claras** - A palavra do `pauseAt` deve ser distinta e única na frase

### Timing

- Narração de ~100 palavras ≈ 1 minuto de áudio
- Cena típica: 30-60 segundos de narração
- Quiz: Adicione 30-60 segundos para interação
- Aula completa ideal: 3-5 minutos (300-500 palavras)

### Feedback do Quiz

- Cada opção deve ter feedback único
- Inclua `narration` para feedback falado
- Use `mood` para cores visuais corretas
