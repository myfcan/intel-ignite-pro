import { GuidedLessonData } from '@/types/guidedLesson';

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📋 AULA 1 – O QUE É I.A. E POR QUE PRECISAMOS DELA?
 * ═══════════════════════════════════════════════════════════════════
 *
 * Guia: Liv
 * Estrutura: 5 seções + playground + 3 exercícios
 * Duração estimada: ~5 minutos
 * Nível: Fundamentos
 *
 * USE ESTE TEMPLATE como base para as próximas aulas!
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const aula01OQueEIA: GuidedLessonData = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📌 METADADOS DA AULA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  id: 'aula-01-o-que-e-ia',
  title: 'O que é I.A. e por que precisamos dela?',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos de IA',
  duration: 300, // 5 minutos (será ajustado após geração de áudio)
  contentVersion: 1,
  schemaVersion: 1,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 SEÇÕES DA AULA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  sections: [
    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 1 – Introdução: Bem-vindo! Eu sou a Liv
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Eu sou a Liv',

      visualContent: `## 🎯 Introdução: Bem-vindo! Eu sou a Liv

Olá! Eu sou a Liv, sua guia nesta jornada para dominar a Inteligência Artificial — ou simplesmente I.A..

Antes de qualquer coisa, quero te dizer algo importante: você não está entrando em um universo complicado. Você está entrando em um universo poderoso — que transforma carreiras, negócios e vidas reais.

Agora vamos começar pelo mais importante: entender o que realmente é I.A.

I.A. é a capacidade de máquinas realizarem tarefas que antes dependiam exclusivamente da inteligência humana: identificar padrões, interpretar textos, tomar decisões, gerar ideias e criar conteúdos.

**Mas existe um detalhe que quase ninguém te conta:**

I.A. não é magia. Não é ficção científica. Não é um robô consciente.

I.A. é matemática aplicada em escala gigantesca. Ela aprende analisando milhões de exemplos e, a partir disso, consegue prever, sugerir, criar e ajudar em tarefas do dia a dia.

**E o mais incrível:**

Pela primeira vez na história, essa tecnologia está acessível para qualquer pessoa — inclusive você.`
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 2 – Como a I.A. realmente aprende
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-2',
      timestamp: 60,
      type: 'text',
      speechBubbleText: 'Como a I.A. realmente aprende',

      visualContent: `## 🧠 Como a I.A. realmente aprende

Imagine uma criança aprendendo o que é um cachorro. Ela vê várias fotos, escuta explicações, observa padrões… e depois de um tempo, reconhece automaticamente.

A I.A. faz exatamente a mesma coisa — só que em outro nível.

Ela analisa milhões de exemplos, percebe detalhes invisíveis para nós e aprende a:

**O que a I.A. consegue fazer:**
- Identificar comportamentos
- Prever tendências
- Sugerir decisões
- Automatizar processos
- Responder perguntas
- Criar novos conteúdos

É como ter um supercérebro trabalhando a seu favor, 24h por dia.

**E tudo começa com uma única coisa: dados.**

Quanto mais dados, melhor a I.A. aprende. Quanto melhores as instruções, melhores os resultados.

E é aqui que você começa a se diferenciar da maioria: você vai aprender a pedir certo, orientar certo, conduzir certo.`
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 3 – Onde você já usa I.A. sem perceber
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-3',
      timestamp: 120,
      type: 'text',
      speechBubbleText: 'Onde você já usa I.A. sem perceber',

      visualContent: `## 📱 Onde você já usa I.A. sem perceber

Prepare-se, porque isso costuma surpreender.

**Você já usa I.A. todos os dias sem perceber:**

- Netflix recomenda exatamente o filme que combina com você
- WhatsApp sugere respostas prontas que você só toca e envia
- Waze recalcula rotas em segundos
- Seu banco detecta fraude antes de você perceber
- Instagram e YouTube entendem o tipo de conteúdo que você gosta

**Mas aqui vem a verdadeira revelação:**

Pessoas comuns já estão usando I.A. de forma ativa — e estão avançando muito mais rápido do que quem usa só passivamente.

E isso cria uma divisão clara no mercado:

**Os que aprendem I.A. agora** versus **os que vão ficar correndo atrás depois.**

Qual dos dois você quer ser?`
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 4 – Oportunidades reais + Chamada para Playground
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-4',
      timestamp: 180,
      type: 'text',
      speechBubbleText: 'Oportunidades reais para você',

      visualContent: `## 💡 Oportunidades reais para você

Agora quero falar com você como mentora.

Eu vejo isso todos os dias — literalmente. Pessoas comuns, sem formação técnica, estão ganhando de R$ 5 mil a R$ 20 mil por mês usando I.A. de forma estratégica.

Elas criam conteúdos, resolvem problemas, fazem automações simples, ajudam pequenos negócios e entregam resultados que antes levavam horas — agora feitos em minutos.

**E sabe qual é o segredo?**

Saber pedir. Saber orientar. Saber guiar a I.A. com clareza.

Você está prestes a aprender exatamente isso.

**E antes de avançarmos, vamos começar pela prática.**

Agora quero que você experimente falar com a I.A. pela primeira vez.

**Tente algo simples e útil:**

- "Liv, organize meu dia de amanhã em 3 prioridades claras."
- "Liv, escreva uma mensagem profissional pedindo uma reunião."
- "Liv, transforme essa frase em algo mais educado e firme: eu preciso do relatório hoje."

Experimente. É aqui que você começa a dominar de verdade.`,

      showPlaygroundCall: true,

      playgroundConfig: {
        instruction: 'Experimente falar com a I.A. pela primeira vez',
        type: 'chat-interface',
        description: 'Use o playground abaixo para experimentar conversar com a I.A. Tente os exemplos sugeridos ou crie seus próprios pedidos.',
        placeholder: 'Digite seu pedido para a Liv aqui...',
        config: {
          suggestions: [
            'Liv, organize meu dia de amanhã em 3 prioridades claras.',
            'Liv, escreva uma mensagem profissional pedindo uma reunião.',
            'Liv, transforme essa frase em algo mais educado e firme: eu preciso do relatório hoje.'
          ],
          systemPrompt: 'Você é a Liv, uma mentora de I.A. amigável e clara que ajuda iniciantes.',
          maxTokens: 300
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 5 – Conclusão da aula
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-5',
      timestamp: 240,
      type: 'end-audio',
      speechBubbleText: 'Conclusão: você deu um passo enorme',

      visualContent: `## 🚀 Conclusão da aula

Hoje você deu um passo enorme.

**Agora você sabe:**

- O que é I.A.
- Como ela aprende
- Onde ela já faz parte do seu dia
- Por que ela está moldando carreiras e negócios
- Como pessoas comuns estão criando novas fontes de renda com ela

**E principalmente:**

Você está aprendendo a usar I.A. como protagonista — não como espectador.

Agora vamos consolidar tudo isso com os exercícios.`
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✏️ EXERCÍCIOS FINAIS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  exercisesConfig: [
    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 1 – Múltipla Escolha
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-aula01-1',
      type: 'multiple-choice',
      title: 'O que melhor descreve a I.A.?',
      instruction: 'Escolha a alternativa correta:',

      data: {
        question: 'O que melhor descreve a I.A.?',

        options: [
          {
            id: 'opt-1',
            text: 'Um aplicativo comum que faz tarefas básicas',
            isCorrect: false,
            feedback: 'I.A. vai muito além de aplicativos básicos. Ela aprende e evolui!'
          },
          {
            id: 'opt-2',
            text: 'Um sistema capaz de aprender padrões e tomar decisões inteligentes',
            isCorrect: true,
            feedback: '✅ Correto! I.A. é um sistema que aprende com dados e executa tarefas de forma inteligente.'
          },
          {
            id: 'opt-3',
            text: 'Um robô físico que pensa como um humano',
            isCorrect: false,
            feedback: 'I.A. não precisa ser um robô físico. Ela está em softwares, apps e sistemas!'
          }
        ],

        explanation: 'I.A. é um sistema que aprende analisando dados e padrões, conseguindo tomar decisões e executar tarefas de forma inteligente — sem precisar ser um robô físico.',

        feedback: {
          correct: '🎯 Perfeito! Você entendeu o conceito fundamental de I.A.!',
          incorrect: '💡 Pense em como a I.A. aprende com exemplos e dados!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 2 – Verdadeiro ou Falso
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-aula01-2',
      type: 'true-false',
      title: 'Onde a I.A. está presente?',
      instruction: 'Marque V para verdadeiro ou F para falso:',

      data: {
        statements: [
          {
            id: 'tf-1',
            text: 'I.A. está presente apenas em tecnologias avançadas e raras.',
            correct: false,
            explanation: '❌ FALSO! I.A. está nas recomendações da Netflix, no Waze, nos bancos, no WhatsApp e muito mais. Ela está em todos os lugares do nosso dia a dia!'
          }
        ],

        feedback: {
          allCorrect: '🎯 Excelente! Você percebeu que I.A. está em todo lugar!',
          someCorrect: '👍 Você acertou {count}!',
          needsReview: '💡 Revise onde a I.A. aparece no seu dia a dia!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 3 – Complete a frase
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-aula01-3',
      type: 'fill-in-blanks',
      title: 'Como a I.A. aprende?',
      instruction: 'Complete a lacuna:',

      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'A I.A. aprende analisando grandes quantidades de _______.',

            correctAnswers: ['dados', 'data', 'informações', 'exemplos'],

            options: ['dados', 'pessoas', 'computadores'],

            hint: 'Pense no que a I.A. precisa para aprender padrões!',

            explanation: 'Correto! O aprendizado da I.A. depende de grandes volumes de dados. Quanto mais dados, melhor ela aprende!'
          }
        ],

        feedback: {
          allCorrect: '🎯 Perfeito! Você entendeu como a I.A. aprende!',
          someCorrect: '👍 Muito bem!',
          needsReview: '💡 Revise como a I.A. usa dados para aprender!'
        }
      }
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📝 NOTAS SOBRE ESTA ESTRUTURA
 * ═══════════════════════════════════════════════════════════════════
 *
 * CARACTERÍSTICAS PRINCIPAIS:
 *
 * 1. GUIA: Liv (não MAIA)
 *    - Tom mais pessoal e de mentoria
 *    - "Eu vejo isso todos os dias"
 *    - "Quero falar com você como mentora"
 *
 * 2. ESTRUTURA DE 5 SEÇÕES:
 *    - Sessão 1: Introdução e apresentação da Liv
 *    - Sessão 2: Como funciona (explicação técnica simplificada)
 *    - Sessão 3: Exemplos do dia a dia
 *    - Sessão 4: Oportunidades + Playground
 *    - Sessão 5: Conclusão e resumo
 *
 * 3. PLAYGROUND INTEGRADO:
 *    - Aparece na Sessão 4
 *    - Exemplos práticos de prompts
 *    - Interface de chat com sugestões
 *
 * 4. EXERCÍCIOS ESPECÍFICOS:
 *    - 1 múltipla escolha
 *    - 1 verdadeiro/falso
 *    - 1 preencher lacuna
 *    - Total: 3 exercícios (mais focado e direto)
 *
 * 5. TOM E LINGUAGEM:
 *    - Mais assertivo e motivacional
 *    - Uso de "você" constantemente
 *    - Perguntas diretas ao aluno
 *    - Números concretos (R$ 5-20 mil)
 *    - Senso de urgência sutil
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * USE COMO TEMPLATE PARA AS PRÓXIMAS AULAS:
 *
 * ✅ Mantenha a estrutura de 5 seções
 * ✅ Use o tom da Liv (mentora, direta, motivacional)
 * ✅ Integre playground quando relevante
 * ✅ 3 exercícios focados e práticos
 * ✅ Sempre conecte com oportunidades reais
 * ✅ Use perguntas para engajar o aluno
 * ✅ Números e exemplos concretos
 *
 * ═══════════════════════════════════════════════════════════════════
 */
