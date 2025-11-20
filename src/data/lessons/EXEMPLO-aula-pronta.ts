import { GuidedLessonData } from '@/types/guidedLesson';

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📋 EXEMPLO DE AULA PRONTA - TEMA: PRODUTIVIDADE COM IA
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este é um exemplo REAL e COMPLETO de como fica uma aula pronta.
 * Use como referência para criar suas próprias aulas.
 *
 * Tema: Como usar IA para triplicar sua produtividade
 * Duração: ~5 minutos
 * Nível: Iniciante
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const exemploProdutividade: GuidedLessonData = {
  id: 'exemplo-produtividade-01',
  title: 'Como Triplicar sua Produtividade com IA',
  trackId: 'trilha-2-pratica',
  trackName: 'IA na Prática',
  duration: 300, // 5 minutos
  contentVersion: 1,
  schemaVersion: 1,

  sections: [
    // ═══════════════════════════════════════════════════════════════
    // SEÇÃO 1: INTRODUÇÃO
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Vamos triplicar sua produtividade',

      visualContent: `## 🎯 Bem-vindo à Revolução da Produtividade

Olá! Eu sou a MAIA, e hoje vou te mostrar algo incrível.

Você sabia que pessoas comuns estão economizando 15 horas por semana usando IA?

E não, não é exagero. É a realidade de quem aprendeu a usar as ferramentas certas.

**Nesta aula você vai descobrir:**
- As 3 tarefas que mais desperdiçam seu tempo
- Como automatizar essas tarefas com IA
- Ferramentas práticas que você pode usar hoje mesmo

Prepare-se para mudar completamente sua rotina de trabalho!`
    },

    // ═══════════════════════════════════════════════════════════════
    // SEÇÃO 2: O PROBLEMA
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-2',
      timestamp: 60,
      type: 'text',
      speechBubbleText: 'Onde você perde mais tempo',

      visualContent: `## ⏰ Os 3 Ladrões do Seu Tempo

Vamos ser honestos: existem tarefas que consomem horas do seu dia e poderiam ser feitas em minutos.

**1. E-mails e Mensagens (2-3 horas/dia)**
Responder, formatar, revisar... tudo isso manualmente.

**2. Criação de Conteúdo (3-5 horas/dia)**
Textos, posts, apresentações que levam uma eternidade.

**3. Pesquisa e Resumos (2-4 horas/dia)**
Ler dezenas de páginas para extrair informações relevantes.

Somando tudo isso, você pode estar perdendo até 40 horas por semana em tarefas que a IA faz em minutos.

É como ter um assistente trabalhando 24 horas para você, de graça.`
    },

    // ═══════════════════════════════════════════════════════════════
    // SEÇÃO 3: A SOLUÇÃO
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-3',
      timestamp: 120,
      type: 'text',
      speechBubbleText: 'Como a IA resolve isso',

      visualContent: `## 🚀 A Solução: IA como Assistente Pessoal

A boa notícia é que você não precisa fazer tudo isso sozinho.

**Para E-mails:**
IA pode escrever respostas profissionais em 10 segundos. Você só ajusta o tom.

**Para Conteúdo:**
Crie posts, textos e apresentações em 5 minutos ao invés de 3 horas.

**Para Pesquisa:**
IA resume 50 páginas em 5 parágrafos com os pontos principais.

**Exemplo real:**
Maria gastava 2 horas criando posts para redes sociais. Agora ela usa IA e cria o mesmo conteúdo em 15 minutos.

Eduardo levava 1 hora respondendo e-mails. Agora leva 10 minutos com ajuda da IA.

E você? Quanto tempo vai economizar?`
    },

    // ═══════════════════════════════════════════════════════════════
    // SEÇÃO 4: FERRAMENTAS PRÁTICAS
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-4',
      timestamp: 180,
      type: 'text',
      speechBubbleText: 'Ferramentas que você pode usar hoje',

      visualContent: `## 🛠️ Ferramentas Práticas (e Gratuitas!)

Aqui estão as ferramentas que você pode começar a usar AGORA:

**ChatGPT (Gratuito)**
- Escrever e-mails profissionais
- Criar conteúdo para redes sociais
- Resumir textos longos
- Gerar ideias criativas

**Como usar:**
1. Acesse chat.openai.com
2. Descreva o que precisa
3. Copie e ajuste o resultado
4. Pronto!

**Exemplo de prompt:**
"Escreva um e-mail profissional agradecendo o cliente João pela compra e oferecendo suporte. Tom amigável, máximo 3 parágrafos."

Em 10 segundos você tem um e-mail pronto.

**Dica de ouro:**
Quanto mais específico você for no pedido, melhor será o resultado!`
    },

    // ═══════════════════════════════════════════════════════════════
    // SEÇÃO 5: IMPACTO REAL
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-5',
      timestamp: 240,
      type: 'text',
      speechBubbleText: 'O impacto na sua rotina',

      visualContent: `## 💡 O Impacto Real no Seu Dia a Dia

Vamos fazer as contas:

**Economizando 15 horas por semana:**
- São 60 horas por mês
- 720 horas por ano
- Equivalente a 90 dias de trabalho!

**O que você poderia fazer com 15 horas extras por semana?**
- Focar em tarefas estratégicas
- Aprender novas habilidades
- Ter mais tempo com a família
- Criar projetos paralelos

**A diferença entre quem usa e quem não usa IA:**
- Quem usa: Trabalha 4 horas e entrega resultado de 12 horas
- Quem não usa: Trabalha 12 horas e entrega resultado de 12 horas

Ambos entregam o mesmo resultado. Mas quem usa IA tem 8 horas livres.

Qual dos dois você quer ser?`
    },

    // ═══════════════════════════════════════════════════════════════
    // SEÇÃO 6: CONCLUSÃO E PRÓXIMOS PASSOS
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-6',
      timestamp: 270,
      type: 'end-audio',
      speechBubbleText: 'Seu próximo passo',

      visualContent: `## 🎯 Ação Imediata: Comece Hoje!

Parabéns! Agora você sabe exatamente como usar IA para triplicar sua produtividade.

**Seu desafio para hoje:**
1. Acesse o ChatGPT (chat.openai.com)
2. Escolha UMA tarefa que você faz todo dia
3. Peça para a IA te ajudar
4. Compare o resultado com fazer manualmente

**Exemplo prático:**
"ChatGPT, escreva um resumo executivo de 3 parágrafos sobre [seu projeto], destacando objetivos, benefícios e próximos passos."

**Na próxima aula:**
Você vai aprender a criar prompts PERFEITOS que geram resultados incríveis.

Vamos te ensinar a técnica que profissionais usam para extrair 10x mais valor da IA.

**Lembre-se:**
Cada hora que você não usa IA é uma hora perdida que você poderia estar usando para o que realmente importa.

Não deixe para amanhã. Comece agora!

Nos vemos na próxima aula. Até lá, pratique e surpreenda-se com os resultados!`
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  // EXERCÍCIOS
  // ═══════════════════════════════════════════════════════════════

  exercisesConfig: [
    // ─────────────────────────────────────────────────────────────
    // EXERCÍCIO 1: PREENCHER LACUNAS
    // ─────────────────────────────────────────────────────────────
    {
      id: 'ex-prod-1',
      type: 'fill-in-blanks',
      title: 'Quanto Tempo Você Pode Economizar?',
      instruction: 'Complete as lacunas com base no que aprendeu:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'Pessoas que usam IA corretamente economizam até _______ horas por semana em tarefas repetitivas.',
            correctAnswers: ['15', 'quinze'],
            options: ['15', '5', '50'],
            hint: 'Pense no número mencionado no início da aula!',
            explanation: 'Exato! Economizar 15 horas por semana é realista quando você usa IA nas tarefas certas.'
          },
          {
            id: 'sent-2',
            text: 'A principal vantagem de usar IA para e-mails é reduzir o tempo de _______ para cerca de 10 segundos.',
            correctAnswers: ['escrita', 'redação', 'criação'],
            options: ['escrita', 'leitura', 'envio'],
            hint: 'O que a IA faz quando você pede um e-mail?',
            explanation: 'Perfeito! IA acelera drasticamente o processo de escrita mantendo a qualidade.'
          },
          {
            id: 'sent-3',
            text: 'Para obter os melhores resultados da IA, você deve ser _______ no seu pedido.',
            correctAnswers: ['específico', 'claro', 'detalhado'],
            options: ['específico', 'vago', 'breve'],
            hint: 'Lembra da dica de ouro sobre prompts?',
            explanation: 'Isso mesmo! Quanto mais específico o prompt, melhor o resultado da IA.'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Você está pronto para triplicar sua produtividade!',
          someCorrect: '👍 Muito bem! Você já entendeu os conceitos principais!',
          needsReview: '💡 Quase lá! Revise os pontos principais da aula!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // EXERCÍCIO 2: VERDADEIRO OU FALSO
    // ─────────────────────────────────────────────────────────────
    {
      id: 'ex-prod-2',
      type: 'true-false',
      title: 'Mitos e Verdades sobre Produtividade com IA',
      instruction: 'Marque V para verdadeiro ou F para falso:',
      data: {
        statements: [
          {
            id: 'tf-1',
            text: 'Usar IA para escrever e-mails pode reduzir horas de trabalho para minutos',
            correct: true,
            explanation: '✅ VERDADEIRO! IA pode criar e-mails profissionais em segundos, economizando horas.'
          },
          {
            id: 'tf-2',
            text: 'Apenas programadores conseguem usar IA para aumentar produtividade',
            correct: false,
            explanation: '❌ FALSO! Qualquer pessoa pode usar ferramentas como ChatGPT sem conhecimento técnico.'
          },
          {
            id: 'tf-3',
            text: 'Prompts vagos geram resultados melhores que prompts específicos',
            correct: false,
            explanation: '❌ FALSO! Quanto mais específico o prompt, melhor será o resultado da IA.'
          },
          {
            id: 'tf-4',
            text: 'É possível economizar até 90 dias de trabalho por ano usando IA corretamente',
            correct: true,
            explanation: '✅ VERDADEIRO! 15 horas/semana = 720 horas/ano = ~90 dias de trabalho economizados!'
          }
        ],
        feedback: {
          allCorrect: '🎯 Excelente! Você dominou os conceitos de produtividade com IA!',
          someCorrect: '👍 Ótimo trabalho! Você acertou {count} de 4!',
          needsReview: '💡 Você acertou {count} de 4. Revise os exemplos práticos!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // EXERCÍCIO 3: CENÁRIO ANTES/DEPOIS
    // ─────────────────────────────────────────────────────────────
    {
      id: 'ex-prod-3',
      type: 'scenario-selection',
      title: 'Como Pedir Ajuda à IA?',
      instruction: 'Qual é a melhor forma de pedir para a IA criar um e-mail?',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Prompt Vago',
            description: 'Escreva um e-mail.',
            emoji: '❌',
            isCorrect: false,
            feedback: 'Muito vago! A IA não sabe: para quem? sobre o quê? qual tom? qual tamanho?'
          },
          {
            id: 'scenario-2',
            title: 'Prompt Específico',
            description: 'Escreva um e-mail de 2 parágrafos agradecendo a cliente Ana pela compra do produto X, oferecendo suporte caso precise. Tom amigável e profissional.',
            emoji: '✅',
            isCorrect: true,
            feedback: 'Perfeito! Você especificou: destinatário, assunto, tamanho, tom e objetivo. A IA tem tudo que precisa!'
          }
        ],
        correctExplanation: 'Um bom prompt tem CONTEXTO (quem/o quê), OBJETIVO (para que), FORMATO (tamanho) e TOM (como). Isso direciona a IA para o resultado ideal!',
        followUpQuestion: 'O que o prompt específico tem que o vago não tem?',
        followUpAnswer: 'Contexto completo, objetivo claro, formato definido e tom especificado.'
      }
    },

    // ─────────────────────────────────────────────────────────────
    // EXERCÍCIO 4: MÚLTIPLA ESCOLHA
    // ─────────────────────────────────────────────────────────────
    {
      id: 'ex-prod-4',
      type: 'multiple-choice',
      title: 'Aplicação Prática',
      instruction: 'Escolha a melhor aplicação de IA para produtividade:',
      data: {
        question: 'Você precisa criar 5 posts para redes sociais sobre lançamento de produto. Qual a melhor abordagem?',
        options: [
          {
            id: 'opt-1',
            text: 'Escrever os 5 posts manualmente sem ajuda de IA',
            isCorrect: false,
            feedback: 'Isso levaria 2-3 horas. Você pode fazer melhor!'
          },
          {
            id: 'opt-2',
            text: 'Pedir para IA: "Crie 5 posts para Instagram sobre lançamento do produto X, cada um com 3-4 linhas, tom entusiasmado, focando em benefícios diferentes"',
            isCorrect: true,
            feedback: '✅ Perfeito! Prompt específico que gera 5 posts em minutos. Você só ajusta e posta!'
          },
          {
            id: 'opt-3',
            text: 'Pedir para IA: "Escreva sobre meu produto"',
            isCorrect: false,
            feedback: 'Muito vago! A IA não sabe quantos posts, qual formato, qual tom ou quais benefícios destacar.'
          },
          {
            id: 'opt-4',
            text: 'Copiar posts de concorrentes e mudar algumas palavras',
            isCorrect: false,
            feedback: 'Isso não é ético nem criativo. Use IA para criar conteúdo original!'
          }
        ],
        explanation: 'IA bem direcionada transforma horas de trabalho em minutos. Seja específico, defina o formato e o tom, e você terá resultados profissionais instantaneamente!',
        feedback: {
          correct: '🎯 Excelente! Você entendeu como usar IA de forma estratégica!',
          incorrect: '💡 Pense em como ser específico economiza tempo e melhora resultados!'
        }
      }
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📊 ANÁLISE DESTA AULA
 * ═══════════════════════════════════════════════════════════════════
 *
 * ESTRUTURA:
 * - 6 seções (~45-60 segundos cada)
 * - 4 exercícios variados
 * - Tempo total: ~5 minutos
 * - Nível: Iniciante
 *
 * PONTOS FORTES:
 * ✅ Problema claro (perda de tempo)
 * ✅ Solução prática (ferramentas específicas)
 * ✅ Exemplos concretos (Maria, Eduardo)
 * ✅ Números reais (15h/semana, 90 dias/ano)
 * ✅ Call-to-action claro (desafio prático)
 * ✅ Exercícios aplicados ao conteúdo
 *
 * TÉCNICAS USADAS:
 * - Storytelling (casos reais)
 * - Números impactantes (90 dias economizados)
 * - Comparações (com vs sem IA)
 * - Exemplos práticos (prompts prontos)
 * - Urgência sutil (cada hora perdida)
 * - Preview da próxima aula (engajamento)
 *
 * USE COMO REFERÊNCIA para criar suas próprias aulas!
 *
 * ═══════════════════════════════════════════════════════════════════
 */
