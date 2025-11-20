import { GuidedLessonData } from '@/types/guidedLesson';

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📋 TEMPLATE COMPLETO DE AULA - INTEL IGNITE PRO
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este é um template completo com TODOS os recursos disponíveis.
 * Use como base para criar suas próprias aulas.
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo
 * 2. Renomeie para o ID da sua aula (ex: fundamentos-03.ts)
 * 3. Substitua os valores de exemplo pelos seus conteúdos
 * 4. Delete as seções/exercícios que não precisar
 * 5. Mantenha a estrutura e os tipos corretos
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const templateAulaCompleta: GuidedLessonData = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📌 METADADOS DA AULA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /** ID único da aula (formato: trilha-numero, ex: fundamentos-03) */
  id: 'template-aula-01',

  /** Título da aula (exibido no card e no header) */
  title: 'Template de Aula Completa - Exemplo Prático',

  /** ID da trilha à qual pertence (ex: trilha-1-fundamentos) */
  trackId: 'trilha-template',

  /** Nome da trilha (para exibição) */
  trackName: 'Trilha Template',

  /**
   * Duração TOTAL da aula em segundos
   * Exemplo:
   * - 3 minutos = 180
   * - 5 minutos = 300
   * - 10 minutos = 600
   */
  duration: 300,

  /**
   * Versão do conteúdo (incrementar ao fazer updates)
   * Usado para cache-busting
   */
  contentVersion: 1,

  /** Versão do schema (manter em 1, salvo breaking changes) */
  schemaVersion: 1,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 SEÇÕES DA AULA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  sections: [
    // ─────────────────────────────────────────────────────────────────
    // 📍 SEÇÃO 1: INTRODUÇÃO
    // ─────────────────────────────────────────────────────────────────
    {
      /** ID único da seção */
      id: 'sessao-1',

      /**
       * Timestamp de início (em segundos)
       * Primeira seção sempre começa em 0
       */
      timestamp: 0,

      /**
       * Tipo da seção:
       * - 'text': Seção de conteúdo (padrão)
       * - 'playground': Seção interativa
       * - 'end-audio': Última seção com áudio
       */
      type: 'text',

      /**
       * Frase curta da MAIA (exibida no balão de fala)
       * Máximo: 50-60 caracteres
       */
      speechBubbleText: 'Olá! Vamos começar nossa jornada',

      /**
       * Conteúdo visual (exibido na tela + usado para gerar áudio)
       *
       * ⚠️ IMPORTANTE SOBRE ÁUDIO:
       * - Títulos markdown (##) são REMOVIDOS automaticamente do áudio
       * - Emojis são REMOVIDOS automaticamente do áudio
       * - Formatação markdown (**, *, etc.) é REMOVIDA do áudio
       * - Apenas o texto puro é narrado pela MAIA
       *
       * ✅ Pode usar à vontade:
       * - ## Títulos (aparecem na tela, mas não no áudio)
       * - 🎯 Emojis (aparecem na tela, mas não no áudio)
       * - **Negrito**, *itálico*, `código` (formatação removida no áudio)
       * - Listas (marcadores removidos no áudio)
       */
      visualContent: `## 🎯 Introdução e Boas-vindas

Olá! Eu sou a MAIA, sua guia nesta jornada.

Hoje vamos aprender sobre um tema super importante e você vai ver como é mais simples do que parece.

**O que você vai aprender:**
- Conceito principal de forma clara
- Aplicações práticas no dia a dia
- Como usar isso a seu favor

Prepare-se para uma experiência transformadora!`,

      /**
       * URL do áudio (gerado automaticamente pelo pipeline)
       * Deixe vazio/comentado ao criar a aula
       * Será preenchido após a geração do áudio
       */
      // audio_url: 'https://pspvppymcdjbwsudxzdx.supabase.co/storage/v1/object/public/lesson-audios/template/sessao-1.mp3',
    },

    // ─────────────────────────────────────────────────────────────────
    // 📍 SEÇÃO 2: CONCEITO PRINCIPAL
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-2',
      timestamp: 60, // 1 minuto
      type: 'text',
      speechBubbleText: 'Vamos entender o conceito',

      visualContent: `## 🧠 O que é [Seu Conceito]

[Seu conceito] é uma [definição clara e simples].

Pense nisso como [analogia do dia a dia].

**Por exemplo:**
Quando você [exemplo prático], você está usando [conceito] sem perceber.

A diferença é que agora você vai entender como aplicar isso de forma estratégica.

Não é complicado, é questão de prática!`
    },

    // ─────────────────────────────────────────────────────────────────
    // 📍 SEÇÃO 3: APLICAÇÕES PRÁTICAS
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-3',
      timestamp: 120, // 2 minutos
      type: 'text',
      speechBubbleText: 'Onde isso aparece no dia a dia',

      visualContent: `## 📱 Aplicações no Dia a Dia

Você já usa isso sem perceber:

**No trabalho:**
- [Exemplo 1]: Como isso economiza tempo
- [Exemplo 2]: Como isso aumenta produtividade
- [Exemplo 3]: Como isso gera resultados

**Na vida pessoal:**
- [Aplicação pessoal 1]
- [Aplicação pessoal 2]
- [Aplicação pessoal 3]

Tudo isso está ao seu alcance agora!`
    },

    // ─────────────────────────────────────────────────────────────────
    // 📍 SEÇÃO 4: PLAYGROUND INTERATIVO (OPCIONAL)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-4',
      timestamp: 180, // 3 minutos
      type: 'text',
      speechBubbleText: 'Vamos ver isso na prática!',

      visualContent: `## 🎮 Hora de Praticar

Agora vou te mostrar como isso funciona na prática.

Você vai experimentar em tempo real e ver os resultados.

Clique no botão abaixo para começar!`,

      /**
       * Mostra convite para o playground
       * (botão "Abrir Playground" aparece na tela)
       */
      showPlaygroundCall: true,

      /**
       * Configuração do playground interativo
       * Tipos disponíveis:
       * - 'interactive-simulation': Simulação interativa
       * - 'code-editor': Editor de código
       * - 'chat-interface': Interface de chat
       */
      playgroundConfig: {
        /** Título do playground */
        instruction: 'Experimente Você Mesmo',

        /** Tipo de playground */
        type: 'interactive-simulation',

        /** Para simulações, use simulationConfig */
        simulationConfig: {
          type: 'interactive-simulation',
          title: '[Título da Simulação]',
          scenario: { icon: '🎯', text: '[Contexto da simulação]' },
          steps: [
            {
              step: 1,
              prompt: '[Pergunta ou desafio do passo 1]',
              options: 'dynamic',
              feedback: '[Feedback após o passo 1]'
            }
          ],
          completion: {
            visual: '🎉',
            message: '[Mensagem de conclusão]',
            badge: { id: 'badge-1', title: '[Nome do Badge]', icon: '🏆' }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // 📍 SEÇÃO 5: BENEFÍCIOS E IMPACTO
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-5',
      timestamp: 240, // 4 minutos
      type: 'text',
      speechBubbleText: 'Por que isso importa para você',

      visualContent: `## ⚡ Por Que Isso Importa

Existem três motivos práticos para você dominar isso agora:

**1️⃣ Economia de Tempo:**
[Como isso economiza tempo específico - seja concreto!]

**2️⃣ Novas Oportunidades:**
[Como isso abre portas - exemplos reais]

**3️⃣ Vantagem Competitiva:**
[Como isso te diferencia - seja claro]

Quem aprende antes, sai na frente.

E você está no momento certo!`
    },

    // ─────────────────────────────────────────────────────────────────
    // 📍 SEÇÃO 6: CONCLUSÃO (SEMPRE type: 'end-audio')
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-6',
      timestamp: 270, // 4:30 minutos

      /**
       * IMPORTANTE: Última seção SEMPRE deve ser 'end-audio'
       * Isso indica o fim da narração
       */
      type: 'end-audio',

      speechBubbleText: 'Próximos passos',

      visualContent: `## 🚀 O Próximo Passo

Parabéns! Você completou esta aula.

Agora você entende [recapitular conceito principal].

**Na próxima aula:**
- [O que vem a seguir]
- [Como aplicar o aprendido]
- [Próximo nível]

Lembre-se: o mais importante não é saber tudo, é começar.

E você acabou de começar! Nos vemos na próxima aula.`
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✏️ EXERCÍCIOS FINAIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  exercisesConfig: [
    // ─────────────────────────────────────────────────────────────────
    // 📝 EXERCÍCIO TIPO 1: PREENCHER LACUNAS (Fill-in-the-Blanks)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-final-1-template-1',
      type: 'fill-in-blanks',
      title: 'Complete o Conhecimento',
      instruction: 'Complete as lacunas com o que você aprendeu:',

      data: {
        sentences: [
          {
            id: 'sent-1',

            /**
             * Texto com lacuna (use _______ para marcar a lacuna)
             * Máximo: 1 lacuna por frase
             */
            text: 'A principal aplicação de [conceito] no dia a dia é _______, que nos ajuda a economizar tempo.',

            /**
             * Respostas corretas aceitas (pode ter variações)
             * Todas as opções aqui são consideradas corretas
             */
            correctAnswers: ['automatizar tarefas', 'automatização', 'automação'],

            /**
             * Opções de múltipla escolha (3-4 opções)
             * DEVE incluir pelo menos uma resposta correta
             */
            options: ['automatizar tarefas', 'complicar processos', 'perder tempo'],

            /** Dica para ajudar o aluno */
            hint: 'Pense em como a tecnologia facilita trabalhos repetitivos!',

            /** Explicação após responder (certo ou errado) */
            explanation: 'Perfeito! A automatização é uma das principais aplicações práticas que economiza tempo e esforço.'
          },

          {
            id: 'sent-2',
            text: 'Para aplicar [conceito] com sucesso, o mais importante é _______ e praticar regularmente.',
            correctAnswers: ['entender os fundamentos', 'entender o básico', 'conhecer o conceito'],
            options: ['entender os fundamentos', 'decorar fórmulas', 'ter diploma'],
            hint: 'Não precisa saber tudo, só o essencial!',
            explanation: 'Isso mesmo! Dominar os fundamentos é mais importante que decorar detalhes.'
          },

          {
            id: 'sent-3',
            text: 'No futuro, quem dominar [conceito] terá vantagem porque _______ se tornará essencial.',
            correctAnswers: ['essa habilidade', 'esse conhecimento', 'essa competência'],
            options: ['essa habilidade', 'programação avançada', 'matemática complexa'],
            hint: 'Pense no que aprendemos sobre o mercado!',
            explanation: 'Exato! Essa habilidade será cada vez mais valorizada no mercado.'
          }
        ],

        /** Feedback geral baseado no desempenho */
        feedback: {
          allCorrect: '🎯 Perfeito! Você dominou o conteúdo! Todas corretas!',
          someCorrect: '👍 Muito bem! Você acertou a maioria! Continue assim!',
          needsReview: '💡 Quase lá! Releia as explicações e tente novamente!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // 📝 EXERCÍCIO TIPO 2: VERDADEIRO OU FALSO
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-final-2-template-1',
      type: 'true-false',
      title: 'Teste Seus Conhecimentos',
      instruction: 'Marque V para verdadeiro ou F para falso:',

      data: {
        statements: [
          {
            id: 'tf-1',

            /** Afirmação a ser julgada */
            text: '[Conceito] é apenas para profissionais técnicos e programadores',

            /** Se a afirmação é verdadeira ou falsa */
            correct: false,

            /** Explicação da resposta (sempre exibida após responder) */
            explanation: '❌ FALSO! Qualquer pessoa pode aprender e aplicar [conceito], sem precisar ser programador.'
          },

          {
            id: 'tf-2',
            text: '[Conceito] pode economizar tempo em tarefas repetitivas do dia a dia',
            correct: true,
            explanation: '✅ VERDADEIRO! Uma das principais vantagens é a economia de tempo em tarefas rotineiras.'
          },

          {
            id: 'tf-3',
            text: 'É preciso conhecimento avançado de matemática para usar [conceito]',
            correct: false,
            explanation: '❌ FALSO! Você só precisa entender os conceitos básicos. A matemática fica por trás dos panos!'
          },

          {
            id: 'tf-4',
            text: 'Praticar regularmente é mais importante do que saber toda a teoria',
            correct: true,
            explanation: '✅ VERDADEIRO! A prática é essencial para dominar qualquer habilidade nova.'
          }
        ],

        /**
         * Feedback baseado no desempenho
         * Use {count} para mostrar número de acertos
         */
        feedback: {
          allCorrect: '🎯 Perfeito! Você dominou os conceitos! Todas corretas!',
          someCorrect: '👍 Muito bem! Você acertou {count}! Excelente compreensão!',
          needsReview: '💡 Quase lá! Você acertou {count}. Leia as explicações com atenção!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // 📝 EXERCÍCIO TIPO 3: SELEÇÃO DE CENÁRIO (Antes/Depois)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-final-3-template-1',
      type: 'scenario-selection',
      title: 'Qual é a Melhor Abordagem?',
      instruction: 'Compare os exemplos e escolha a abordagem correta:',

      data: {
        scenarios: [
          {
            id: 'scenario-1',

            /** Título do cenário (geralmente "Antes", "Depois", "Opção A", etc.) */
            title: 'Abordagem Errada',

            /** Descrição do cenário */
            description: 'Tentar aprender [conceito] decorando tudo sem praticar, esperando dominar em uma semana.',

            /** Emoji para visual (opcional mas recomendado) */
            emoji: '❌',

            /** Se este cenário é correto ou não */
            isCorrect: false,

            /** Feedback ao selecionar este cenário */
            feedback: 'Esta abordagem não funciona. Decorar sem praticar não gera aprendizado real!'
          },

          {
            id: 'scenario-2',
            title: 'Abordagem Correta',
            description: 'Entender os fundamentos de [conceito], praticar regularmente com exemplos simples, e ir aumentando a complexidade aos poucos.',
            emoji: '✅',
            isCorrect: true,
            feedback: 'Exato! Esta é a melhor forma de aprender: fundamentos + prática constante + evolução gradual!'
          }
        ],

        /** Explicação do por que a resposta correta é melhor */
        correctExplanation: 'Aprendizado efetivo vem da combinação de teoria básica com prática constante. Não adianta querer aprender tudo de uma vez!',

        /** Pergunta de follow-up para reflexão */
        followUpQuestion: 'O que a abordagem correta tem que a errada não tem?',

        /** Resposta esperada para a pergunta de follow-up */
        followUpAnswer: 'Prática constante, evolução gradual e foco nos fundamentos ao invés de decorar tudo.'
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // 📝 EXERCÍCIO TIPO 4: MÚLTIPLA ESCOLHA
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-final-4-template-1',
      type: 'multiple-choice',
      title: 'Pergunta de Múltipla Escolha',
      instruction: 'Escolha a alternativa correta:',

      data: {
        question: 'Qual é o principal benefício de aprender [conceito] agora?',

        options: [
          {
            id: 'opt-1',
            text: 'Conseguir um diploma universitário',
            isCorrect: false,
            feedback: 'Não é necessário diploma. O foco é na habilidade prática!'
          },
          {
            id: 'opt-2',
            text: 'Ganhar vantagem competitiva e economizar tempo no dia a dia',
            isCorrect: true,
            feedback: '✅ Correto! Sair na frente e aumentar produtividade são os principais benefícios!'
          },
          {
            id: 'opt-3',
            text: 'Impressionar os amigos com conhecimento técnico',
            isCorrect: false,
            feedback: 'O objetivo é aplicação prática, não ostentação de conhecimento!'
          },
          {
            id: 'opt-4',
            text: 'Substituir completamente o trabalho humano',
            isCorrect: false,
            feedback: 'O objetivo é potencializar o trabalho humano, não substituí-lo!'
          }
        ],

        /** Explicação adicional após responder */
        explanation: 'O verdadeiro valor está em usar [conceito] como ferramenta para melhorar sua produtividade e se destacar no mercado.',

        feedback: {
          correct: '🎯 Perfeito! Você entendeu o principal benefício!',
          incorrect: '💡 Não é bem isso. Pense no que aprendemos sobre aplicação prática!'
        }
      }
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎮 PLAYGROUND FINAL (OPCIONAL)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Playground que aparece APÓS os exercícios
   * Opcional - use para experiências práticas finais
   */
  finalPlaygroundConfig: {
    instruction: 'Agora é Sua Vez - Playground Final',
    type: 'interactive-simulation',

    simulationConfig: {
      type: 'interactive-simulation',
      title: 'Playground Final',
      scenario: { icon: '🎯', text: 'Aplique tudo que aprendeu!' },
      steps: [
        {
          step: 1,
          prompt: 'Teste livremente o que aprendeu',
          options: 'dynamic',
          feedback: 'Excelente! Continue explorando!'
        }
      ],
      completion: {
        visual: '🎉',
        message: 'Parabéns! Você completou o playground final!',
        badge: { id: 'playground-master', title: 'Mestre do Playground', icon: '🏆' }
      }
    }
  }
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎙️ TEXTOS PARA ÁUDIO (OPCIONAL - PARA CONTROLE MANUAL)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Use este array SOMENTE se quiser controle total sobre o que é narrado.
 *
 * ⚠️ IMPORTANTE:
 * - Se você NÃO exportar este array, o sistema usa o visualContent automaticamente
 * - O sistema remove títulos, emojis e markdown AUTOMATICAMENTE
 * - Só use este método se precisar de algo muito específico
 *
 * ✅ RECOMENDAÇÃO:
 * Deixe o sistema processar automaticamente! É mais simples e menos propenso a erros.
 */
export const templateAulaCompletaAudioTexts = [
  // Sessão 1
  `Olá! Eu sou a Maia, sua guia nesta jornada.

  Hoje vamos aprender sobre um tema super importante e você vai ver como é mais simples do que parece.

  O que você vai aprender: Conceito principal de forma clara, aplicações práticas no dia a dia, e como usar isso a seu favor.

  Prepare-se para uma experiência transformadora!`,

  // Sessão 2
  `[Seu conceito] é uma [definição clara e simples].

  Pense nisso como [analogia do dia a dia].

  Por exemplo: Quando você [exemplo prático], você está usando [conceito] sem perceber.

  A diferença é que agora você vai entender como aplicar isso de forma estratégica.

  Não é complicado, é questão de prática!`,

  // Sessão 3
  `Você já usa isso sem perceber:

  No trabalho: [Exemplo 1] economiza tempo, [Exemplo 2] aumenta produtividade, [Exemplo 3] gera resultados.

  Na vida pessoal: [Aplicação pessoal 1], [Aplicação pessoal 2], [Aplicação pessoal 3].

  Tudo isso está ao seu alcance agora!`,

  // Sessão 4
  `Agora vou te mostrar como isso funciona na prática.

  Você vai experimentar em tempo real e ver os resultados.

  Clique no botão abaixo para começar!`,

  // Sessão 5
  `Existem três motivos práticos para você dominar isso agora:

  Primeiro: Economia de Tempo. [Como isso economiza tempo específico]

  Segundo: Novas Oportunidades. [Como isso abre portas]

  Terceiro: Vantagem Competitiva. [Como isso te diferencia]

  Quem aprende antes, sai na frente. E você está no momento certo!`,

  // Sessão 6
  `Parabéns! Você completou esta aula.

  Agora você entende [recapitular conceito principal].

  Na próxima aula: [O que vem a seguir], [Como aplicar o aprendido], [Próximo nível].

  Lembre-se: o mais importante não é saber tudo, é começar.

  E você acabou de começar! Nos vemos na próxima aula.`
];

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📚 GUIA RÁPIDO DE USO
 * ═══════════════════════════════════════════════════════════════════
 *
 * PASSO A PASSO:
 *
 * 1. COPIE ESTE ARQUIVO
 *    - Renomeie para sua aula (ex: fundamentos-03.ts)
 *
 * 2. EDITE OS METADADOS
 *    - id: 'sua-aula-id'
 *    - title: 'Título da Sua Aula'
 *    - trackId e trackName
 *    - duration (estimativa inicial)
 *
 * 3. ESCREVA AS SEÇÕES
 *    - Substitua os textos de exemplo
 *    - Use ## para títulos (removidos do áudio automaticamente)
 *    - Use emojis à vontade (removidos do áudio)
 *    - Mantenha speechBubbleText curto (max 60 chars)
 *
 * 4. CRIE OS EXERCÍCIOS
 *    - Delete os tipos que não precisar
 *    - Preencha com suas perguntas
 *    - Ajuste feedbacks
 *
 * 5. DELETE SEÇÕES OPCIONAIS
 *    - Playground (se não usar)
 *    - finalPlaygroundConfig (se não usar)
 *    - templateAulaCompletaAudioTexts (se usar processamento automático)
 *
 * 6. GERE O ÁUDIO
 *    - Use o pipeline automático: autoGenerateAudio(suaAula, 'v2')
 *    - O sistema limpa e gera os áudios automaticamente
 *
 * 7. IMPORTE NO INDEX
 *    - Adicione em src/data/lessons/index.ts
 *    - Export { suaAula } from './sua-aula'
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * DICAS:
 *
 * ✅ FAÇA:
 * - Use linguagem simples e direta
 * - Exemplos práticos do dia a dia
 * - Balões de fala curtos e diretos
 * - Títulos markdown para organização visual
 * - 3-6 seções por aula (ideal: 4-5)
 * - 3-4 exercícios variados
 *
 * ❌ EVITE:
 * - Jargões técnicos sem explicação
 * - Seções muito longas (max 2-3 min cada)
 * - Balões de fala longos (quebra a experiência)
 * - Mais de 6 seções (aula fica cansativa)
 * - Exercícios muito difíceis
 *
 * ═══════════════════════════════════════════════════════════════════
 */
