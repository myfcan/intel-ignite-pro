import { GuidedLessonData } from '@/types/guidedLesson';

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📋 TEMPLATE PADRÃO LIV - BASE PARA TODAS AS AULAS
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este é o template oficial baseado na Aula 1.
 * USE ESTE PADRÃO para criar todas as próximas aulas.
 *
 * ESTRUTURA:
 * - Guia: Liv (tom de mentoria)
 * - 5 seções fixas
 * - Playground integrado (quando relevante)
 * - 3 exercícios focados
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo
 * 2. Renomeie (ex: aula-02-prompts-eficazes.ts)
 * 3. Substitua os [PLACEHOLDERS]
 * 4. Mantenha a estrutura e o tom
 * 5. Delete comentários de instrução antes de finalizar
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const templatePadraoLiv: GuidedLessonData = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📌 METADADOS DA AULA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  id: '[aula-XX-titulo-descritivo]',  // Ex: aula-02-prompts-eficazes
  title: '[Título da Aula]',          // Ex: Como Criar Prompts Eficazes
  trackId: 'trilha-1-fundamentos',    // Ajustar conforme a trilha
  trackName: 'Fundamentos de IA',     // Ajustar conforme a trilha
  duration: 300,                      // Estimativa inicial (será ajustado)
  contentVersion: 1,
  schemaVersion: 1,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 SEÇÕES DA AULA (ESTRUTURA FIXA DE 5 SEÇÕES)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  sections: [
    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 1 – Introdução e Hook (SEMPRE timestamp: 0)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: '[Frase de abertura curta]', // Max 60 chars

      visualContent: `## 🎯 [Título da Introdução]

[ABERTURA IMPACTANTE - pergunta ou fato surpreendente]

[CONTEXTO DO PROBLEMA OU OPORTUNIDADE]

[APRESENTAÇÃO DO QUE SERÁ APRENDIDO]

**[Destaque importante ou revelação]**

[CRIAÇÃO DE EXPECTATIVA]

[CONEXÃO COM A REALIDADE DO ALUNO]`
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 2 – Fundamento / Como Funciona
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-2',
      timestamp: 60,
      type: 'text',
      speechBubbleText: '[Conceito principal]',

      visualContent: `## 🧠 [Título do Conceito]

[ANALOGIA SIMPLES - comparar com algo do dia a dia]

[EXPLICAÇÃO TÉCNICA SIMPLIFICADA]

[LISTA DE CAPACIDADES OU CARACTERÍSTICAS]

**[Destaque de pontos importantes]:**
- [Ponto 1]
- [Ponto 2]
- [Ponto 3]

[CONEXÃO COM O BENEFÍCIO PRÁTICO]

[DIFERENCIAÇÃO - o que faz o aluno se destacar]`
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 3 – Exemplos do Dia a Dia / Aplicações Práticas
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-3',
      timestamp: 120,
      type: 'text',
      speechBubbleText: '[Onde isso aparece na prática]',

      visualContent: `## 📱 [Título dos Exemplos Práticos]

[FRASE DE PREPARAÇÃO - "Prepare-se, porque..."]

**[Categoria de exemplos]:**

- [Exemplo 1 - específico e reconhecível]
- [Exemplo 2 - específico e reconhecível]
- [Exemplo 3 - específico e reconhecível]
- [Exemplo 4 - específico e reconhecível]

**[Revelação ou insight importante]**

[DIVISÃO CLARA - quem faz vs quem não faz]

[PERGUNTA DIRETA AO ALUNO - engajamento]`
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 4 – Oportunidades Reais + Playground
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-4',
      timestamp: 180,
      type: 'text',
      speechBubbleText: '[Oportunidades para você]',

      visualContent: `## 💡 [Título das Oportunidades]

[TOM DE MENTORIA - "Agora quero falar com você como mentora"]

[CASOS REAIS - números concretos, histórias de pessoas]

[O QUE ESSAS PESSOAS FAZEM - especificar atividades]

**E sabe qual é o segredo?**

[REVELAÇÃO DO SEGREDO - habilidade específica]

Você está prestes a aprender exatamente isso.

**E antes de avançarmos, vamos começar pela prática.**

[CHAMADA PARA O PLAYGROUND]

**Tente algo simples e útil:**

- "[Exemplo de prompt 1]"
- "[Exemplo de prompt 2]"
- "[Exemplo de prompt 3]"

Experimente. É aqui que você começa a dominar de verdade.`,

      // ⚠️ IMPORTANTE: Se a aula não tiver playground, delete este bloco
      showPlaygroundCall: true,

      playgroundConfig: {
        instruction: '[Instrução do playground]',
        type: 'chat-interface', // ou 'interactive-simulation'
        description: '[Descrição do que fazer no playground]',
        placeholder: 'Digite seu pedido para a Liv aqui...',
        config: {
          suggestions: [
            '[Sugestão 1]',
            '[Sugestão 2]',
            '[Sugestão 3]'
          ],
          systemPrompt: 'Você é a Liv, uma mentora de I.A. amigável e clara que ajuda iniciantes.',
          maxTokens: 300
        }
      }
    },

    // ═══════════════════════════════════════════════════════════════
    // SESSÃO 5 – Conclusão (SEMPRE type: 'end-audio')
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'sessao-5',
      timestamp: 240,
      type: 'end-audio', // ⚠️ OBRIGATÓRIO na última seção
      speechBubbleText: '[Conclusão e próximos passos]',

      visualContent: `## 🚀 Conclusão da aula

Hoje você deu um passo enorme.

**Agora você sabe:**

- [Aprendizado 1]
- [Aprendizado 2]
- [Aprendizado 3]
- [Aprendizado 4]
- [Aprendizado 5]

**E principalmente:**

[MENSAGEM FINAL EMPODERAMENTO - protagonismo do aluno]

Agora vamos consolidar tudo isso com os exercícios.`
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✏️ EXERCÍCIOS FINAIS (SEMPRE 3 EXERCÍCIOS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  exercisesConfig: [
    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 1 – Múltipla Escolha (SEMPRE)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-aulaXX-1',
      type: 'multiple-choice',
      title: '[Título da pergunta]',
      instruction: 'Escolha a alternativa correta:',

      data: {
        question: '[Pergunta principal sobre o conceito-chave]',

        options: [
          {
            id: 'opt-1',
            text: '[Opção incorreta 1 - plausível mas errada]',
            isCorrect: false,
            feedback: '[Explicação do porquê está errado]'
          },
          {
            id: 'opt-2',
            text: '[Opção correta - definição precisa]',
            isCorrect: true,
            feedback: '✅ Correto! [Reforço do conceito]'
          },
          {
            id: 'opt-3',
            text: '[Opção incorreta 2 - mal-entendido comum]',
            isCorrect: false,
            feedback: '[Explicação do porquê está errado]'
          }
        ],

        explanation: '[Explicação adicional aprofundando o conceito]',

        feedback: {
          correct: '🎯 Perfeito! Você entendeu [conceito]!',
          incorrect: '💡 Pense em [dica para reflexão]!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 2 – Verdadeiro ou Falso (SEMPRE)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-aulaXX-2',
      type: 'true-false',
      title: '[Título do conceito a ser testado]',
      instruction: 'Marque V para verdadeiro ou F para falso:',

      data: {
        statements: [
          {
            id: 'tf-1',
            text: '[Afirmação sobre o tema da aula]',
            correct: false, // ou true
            explanation: '❌ FALSO! [Explicação correta detalhada]'
            // ou: '✅ VERDADEIRO! [Reforço do conceito]'
          }
        ],

        feedback: {
          allCorrect: '🎯 Excelente! Você dominou [conceito]!',
          someCorrect: '👍 Você acertou {count}!',
          needsReview: '💡 Revise [aspecto específico]!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 3 – Preencher Lacuna (SEMPRE)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-aulaXX-3',
      type: 'fill-in-blanks',
      title: '[Título do conceito]',
      instruction: 'Complete a lacuna:',

      data: {
        sentences: [
          {
            id: 'sent-1',
            text: '[Frase com _______ para completar]',

            correctAnswers: ['resposta1', 'resposta2', 'resposta3'], // Variações aceitas

            options: ['resposta correta', 'opção errada 1', 'opção errada 2'],

            hint: 'Pense em [dica útil]!',

            explanation: 'Correto! [Explicação aprofundada do conceito]'
          }
        ],

        feedback: {
          allCorrect: '🎯 Perfeito! Você entendeu [conceito]!',
          someCorrect: '👍 Muito bem!',
          needsReview: '💡 Revise [aspecto a revisar]!'
        }
      }
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📚 GUIA DE USO DESTE TEMPLATE
 * ═══════════════════════════════════════════════════════════════════
 *
 * PASSO A PASSO PARA CRIAR UMA NOVA AULA:
 *
 * 1. COPIE ESTE ARQUIVO
 *    ```bash
 *    cp src/data/lessons/TEMPLATE-padrao-liv.ts src/data/lessons/aula-02-seu-tema.ts
 *    ```
 *
 * 2. EDITE OS METADADOS
 *    - id: 'aula-02-seu-tema'
 *    - title: 'Título Atrativo da Aula'
 *    - Ajuste trackId se necessário
 *
 * 3. PREENCHA AS 5 SEÇÕES (MANTENHA A ESTRUTURA)
 *    - Sessão 1: Hook + Introdução
 *    - Sessão 2: Conceito/Fundamento
 *    - Sessão 3: Exemplos práticos
 *    - Sessão 4: Oportunidades + Playground
 *    - Sessão 5: Conclusão
 *
 * 4. ADAPTE OS 3 EXERCÍCIOS
 *    - Ex 1: Múltipla escolha (conceito principal)
 *    - Ex 2: V/F (mal-entendido comum)
 *    - Ex 3: Lacuna (termo-chave)
 *
 * 5. DELETE COMENTÁRIOS DE INSTRUÇÃO
 *    - Mantenha apenas comentários de seção
 *
 * 6. IMPORTE NO INDEX
 *    ```typescript
 *    export { aula02SeuTema } from './aula-02-seu-tema';
 *    ```
 *
 * 7. GERE O ÁUDIO
 *    ```typescript
 *    await autoGenerateAudio(aula02SeuTema, 'v2');
 *    ```
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * ✅ CHECKLIST DE QUALIDADE (ANTES DE FINALIZAR):
 *
 * METADADOS:
 * - [ ] ID único e descritivo
 * - [ ] Título claro e atrativo
 * - [ ] trackId correto
 *
 * ESTRUTURA:
 * - [ ] 5 seções completas
 * - [ ] Primeira seção: timestamp 0
 * - [ ] Última seção: type 'end-audio'
 * - [ ] speechBubbleText curtos (max 60 chars)
 *
 * CONTEÚDO - SESSÃO 1:
 * - [ ] Hook impactante (pergunta ou fato)
 * - [ ] Apresenta o problema/oportunidade
 * - [ ] Lista o que será aprendido
 * - [ ] Cria expectativa
 *
 * CONTEÚDO - SESSÃO 2:
 * - [ ] Analogia simples
 * - [ ] Explicação técnica simplificada
 * - [ ] Lista de pontos importantes
 * - [ ] Conexão com benefício prático
 *
 * CONTEÚDO - SESSÃO 3:
 * - [ ] 4-5 exemplos concretos do dia a dia
 * - [ ] Exemplos reconhecíveis pelo aluno
 * - [ ] Revelação ou insight importante
 * - [ ] Pergunta de engajamento
 *
 * CONTEÚDO - SESSÃO 4:
 * - [ ] Tom de mentoria
 * - [ ] Números concretos (R$, tempo, etc)
 * - [ ] Revelação do "segredo"
 * - [ ] Chamada para playground (se aplicável)
 * - [ ] 3 exemplos de prompts práticos
 *
 * CONTEÚDO - SESSÃO 5:
 * - [ ] Lista de aprendizados (5 itens)
 * - [ ] Mensagem de empoderamento
 * - [ ] Chamada para exercícios
 *
 * EXERCÍCIOS:
 * - [ ] Ex 1: Múltipla escolha sobre conceito-chave
 * - [ ] Ex 2: V/F sobre mal-entendido comum
 * - [ ] Ex 3: Lacuna com termo principal
 * - [ ] Feedbacks motivadores
 * - [ ] Explicações claras
 *
 * TOM E LINGUAGEM:
 * - [ ] Usa "você" (não "vocês")
 * - [ ] Tom de mentora (Liv)
 * - [ ] Linguagem simples e direta
 * - [ ] Perguntas ao aluno
 * - [ ] Números e exemplos concretos
 * - [ ] Senso de urgência sutil
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * 🎨 PADRÕES DE LINGUAGEM DA LIV:
 *
 * ABERTURA:
 * - "Prepare-se, porque..."
 * - "Agora quero falar com você como mentora"
 * - "Eu vejo isso todos os dias"
 *
 * REVELAÇÕES:
 * - "Mas aqui vem a verdadeira revelação:"
 * - "E sabe qual é o segredo?"
 * - "Existe um detalhe que quase ninguém te conta:"
 *
 * EMPODERAMENTO:
 * - "Você está prestes a aprender exatamente isso"
 * - "É aqui que você começa a se diferenciar"
 * - "Você está aprendendo como protagonista"
 *
 * PERGUNTAS DIRETAS:
 * - "Qual dos dois você quer ser?"
 * - "E você? Quanto tempo vai economizar?"
 * - "Prepare-se para descobrir..."
 *
 * URGÊNCIA:
 * - "Pela primeira vez na história..."
 * - "Os que aprendem agora vs os que ficam para trás"
 * - "Cada hora sem usar é uma hora perdida"
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * 💡 DICAS IMPORTANTES:
 *
 * 1. MANTENHA A ESTRUTURA FIXA DE 5 SEÇÕES
 *    Não adicione nem remova seções - isso garante consistência
 *
 * 2. USE NÚMEROS CONCRETOS
 *    ❌ "Você pode ganhar muito"
 *    ✅ "Pessoas ganham de R$ 5 mil a R$ 20 mil por mês"
 *
 * 3. ANALOGIAS SIMPLES
 *    Compare sempre com algo do dia a dia do aluno
 *
 * 4. PLAYGROUND QUANDO RELEVANTE
 *    Se a aula é mais teórica, pode remover o playground
 *    Se é prática, mantenha com exemplos úteis
 *
 * 5. EXERCÍCIOS FOCADOS
 *    Sempre 3 exercícios, testando conceitos diferentes
 *
 * 6. TOM CONSISTENTE
 *    Mantenha o tom da Liv em todas as aulas
 *
 * ═══════════════════════════════════════════════════════════════════
 */
