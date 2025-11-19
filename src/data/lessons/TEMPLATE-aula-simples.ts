import { GuidedLessonData } from '@/types/guidedLesson';

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📋 TEMPLATE SIMPLES - ESTRUTURA MÍNIMA PARA CRIAR UMA AULA
 * ═══════════════════════════════════════════════════════════════════
 *
 * Este é o template MAIS SIMPLES possível.
 * Use como ponto de partida se quiser começar do básico.
 *
 * Contém apenas o essencial:
 * - 4 seções de texto
 * - 2 exercícios básicos
 * - Sem playground
 * - Sem configurações avançadas
 *
 * ═══════════════════════════════════════════════════════════════════
 */

export const templateAulaSimples: GuidedLessonData = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📌 INFORMAÇÕES BÁSICAS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  id: 'minha-aula-01',                    // ID único da aula
  title: 'Título da Minha Aula',          // Título exibido
  trackId: 'trilha-1',                    // ID da trilha
  trackName: 'Nome da Trilha',            // Nome da trilha
  duration: 180,                          // Duração em segundos (3 min = 180)
  contentVersion: 1,                      // Versão do conteúdo
  schemaVersion: 1,                       // Versão do schema

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📖 CONTEÚDO DA AULA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  sections: [
    // ─────────────────────────────────────────────────────────────────
    // SEÇÃO 1: INTRODUÇÃO (sempre timestamp: 0)
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Vamos começar',
      visualContent: `## 🎯 Introdução

Olá! Bem-vindo à aula.

Hoje vamos aprender sobre [tema da aula].

Prepare-se para descobrir como isso pode transformar seu dia a dia!`
    },

    // ─────────────────────────────────────────────────────────────────
    // SEÇÃO 2: CONCEITO
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-2',
      timestamp: 60, // 1 minuto
      type: 'text',
      speechBubbleText: 'O que é [conceito]',
      visualContent: `## 🧠 Entendendo o Conceito

[Seu conceito] é [explicação simples].

Pense nisso como [analogia do dia a dia].

**Exemplo prático:**
[Exemplo que todos conhecem]`
    },

    // ─────────────────────────────────────────────────────────────────
    // SEÇÃO 3: APLICAÇÃO PRÁTICA
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-3',
      timestamp: 120, // 2 minutos
      type: 'text',
      speechBubbleText: 'Como usar na prática',
      visualContent: `## 📱 Aplicação Prática

Você pode usar isso para:

- [Aplicação 1]
- [Aplicação 2]
- [Aplicação 3]

Tudo isso está ao seu alcance agora!`
    },

    // ─────────────────────────────────────────────────────────────────
    // SEÇÃO 4: CONCLUSÃO (sempre type: 'end-audio')
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'sessao-4',
      timestamp: 150, // 2:30 minutos
      type: 'end-audio', // ⚠️ Última seção sempre 'end-audio'
      speechBubbleText: 'Próximos passos',
      visualContent: `## 🚀 Conclusão

Parabéns! Você completou a aula.

Agora você sabe [recapitular aprendizado].

Na próxima aula, vamos [prévia da próxima].

Nos vemos em breve!`
    }
  ],

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✏️ EXERCÍCIOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  exercisesConfig: [
    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 1: PREENCHER LACUNAS
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-1',
      type: 'fill-in-blanks',
      title: 'Complete o Conhecimento',
      instruction: 'Complete as lacunas:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: '[Conceito] é _______ que nos ajuda a [benefício].',
            correctAnswers: ['resposta correta'],
            options: ['resposta correta', 'opção errada 1', 'opção errada 2'],
            hint: 'Dica para ajudar o aluno',
            explanation: 'Explicação da resposta correta.'
          },
          {
            id: 'sent-2',
            text: 'A principal aplicação de [conceito] é _______.',
            correctAnswers: ['aplicação principal'],
            options: ['aplicação principal', 'opção errada 1', 'opção errada 2'],
            hint: 'Outra dica útil',
            explanation: 'Explicação da aplicação.'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Todas corretas!',
          someCorrect: '👍 Muito bem!',
          needsReview: '💡 Revise o conteúdo!'
        }
      }
    },

    // ─────────────────────────────────────────────────────────────────
    // EXERCÍCIO 2: VERDADEIRO OU FALSO
    // ─────────────────────────────────────────────────────────────────
    {
      id: 'ex-2',
      type: 'true-false',
      title: 'Verdadeiro ou Falso',
      instruction: 'Marque V ou F:',
      data: {
        statements: [
          {
            id: 'tf-1',
            text: '[Afirmação sobre o conceito]',
            correct: true,
            explanation: '✅ VERDADEIRO! [Explicação]'
          },
          {
            id: 'tf-2',
            text: '[Outra afirmação]',
            correct: false,
            explanation: '❌ FALSO! [Explicação]'
          },
          {
            id: 'tf-3',
            text: '[Terceira afirmação]',
            correct: true,
            explanation: '✅ VERDADEIRO! [Explicação]'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito!',
          someCorrect: '👍 Você acertou {count}!',
          needsReview: '💡 Você acertou {count}. Revise!'
        }
      }
    }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📝 INSTRUÇÕES DE USO
 * ═══════════════════════════════════════════════════════════════════
 *
 * 1. COPIE ESTE ARQUIVO e renomeie (ex: minha-aula-01.ts)
 *
 * 2. SUBSTITUA OS TEXTOS:
 *    - Troque todos os [placeholders] pelos seus conteúdos
 *    - Mantenha os ## para títulos (são removidos do áudio)
 *    - Use emojis à vontade (também removidos do áudio)
 *
 * 3. AJUSTE OS TIMESTAMPS:
 *    - Seção 1: 0
 *    - Seção 2: ~60 (1 min)
 *    - Seção 3: ~120 (2 min)
 *    - Seção 4: ~150-180 (2:30-3 min)
 *    (Serão recalculados automaticamente após gerar o áudio)
 *
 * 4. PREENCHA OS EXERCÍCIOS:
 *    - Crie perguntas relevantes ao conteúdo
 *    - Mantenha as respostas claras
 *    - Dê dicas úteis
 *
 * 5. GERE O ÁUDIO:
 *    - Use: autoGenerateAudio(suaAula, 'v2')
 *    - O sistema processa automaticamente
 *
 * 6. IMPORTE:
 *    - Adicione em src/data/lessons/index.ts
 *    - Export { suaAula } from './sua-aula'
 *
 * ═══════════════════════════════════════════════════════════════════
 */
