import { GuidedLessonData } from '@/types/guidedLesson';
import { cleanAudioText } from '@/lib/audioTextValidator';

/**
 * 🎯 TEMPLATE PADRÃO PARA AULAS MODELO V2
 * 
 * REGRAS DE OURO:
 * ✅ contentVersion: 2 (áudios separados por seção)
 * ✅ speechBubbleText → Máx 60 caracteres, sem emojis
 * ✅ visualContent → PODE ter formatação, emojis, markdown
 * ✅ Última seção → type: 'end-audio'
 * ✅ audioText → SEMPRE usar cleanAudioText()
 */

export const templateLesson: GuidedLessonData = {
  id: 'fundamentos-XX', // Substituir XX pelo número da aula
  title: 'Título da Aula', // Título curto e objetivo
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos da IA',
  duration: 0, // Será calculado automaticamente após gerar áudios
  contentVersion: 2, // ⚠️ CRÍTICO: V2 = áudios separados
  
  sections: [
    {
      id: 'intro',
      timestamp: 0, // Será calculado automaticamente
      type: 'text',
      speechBubbleText: 'Olá! Vamos começar?', // Máx 60 caracteres
      visualContent: `## 🎯 Introdução

Bem-vindo a esta aula!

Aqui você pode usar:
- **Markdown** formatado
- Emojis 🎵
- Listas numeradas
- > Blockquotes para destaque

Esse é o conteúdo que o usuário **VÊ** na tela.`
    },
    {
      id: 'secao-2',
      timestamp: 0, // Calculado automaticamente (tempo acumulado)
      type: 'text',
      speechBubbleText: 'Veja este conceito importante!',
      visualContent: `## 📊 Conceito Principal

Explique o conceito principal da seção.

Use parágrafos curtos e objetivos para facilitar a leitura.`
    },
    {
      id: 'secao-3',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Mais um ponto importante...',
      visualContent: `## 💡 Exemplo Prático

Traga exemplos concretos que ajudem na compreensão.

> Dica: Use blockquotes para destacar informações importantes!`
    },
    {
      id: 'conclusao',
      timestamp: 0,
      type: 'end-audio', // ⚠️ CRÍTICO: Última seção SEMPRE type: 'end-audio'
      speechBubbleText: 'Parabéns! Você concluiu a aula!',
      visualContent: `## 🎓 Conclusão

Recapitule os pontos principais da aula.

Agora vamos praticar com exercícios! 🚀`
    }
  ],
  
  exercisesConfig: [
    {
      id: 'ex-1',
      type: 'data-collection',
      title: 'Pense em uma Aplicação',
      instruction: 'Como você poderia usar o que aprendeu no seu dia a dia?',
      data: {
        placeholder: 'Digite sua resposta aqui...',
        maxLength: 500
      }
    },
    {
      id: 'ex-2',
      type: 'fill-in-blanks',
      title: 'Complete as Lacunas',
      instruction: 'Preencha os espaços em branco:',
      data: {
        text: 'A Inteligência Artificial permite que máquinas _____ e tomem _____.',
        blanks: [
          {
            id: 'blank-1',
            correctAnswer: 'aprendam',
            alternatives: ['executem', 'funcionem']
          },
          {
            id: 'blank-2',
            correctAnswer: 'decisões',
            alternatives: ['cálculos', 'escolhas']
          }
        ]
      }
    },
    {
      id: 'ex-3',
      type: 'true-false',
      title: 'Verdadeiro ou Falso',
      instruction: 'A IA pode substituir completamente o trabalho humano',
      data: {
        correctAnswer: false,
        explanation: 'A IA é uma ferramenta que **aumenta** a capacidade humana, mas não substitui completamente o trabalho criativo, estratégico e emocional que apenas humanos podem fazer.'
      }
    },
    {
      id: 'ex-4',
      type: 'scenario-selection',
      title: 'Escolha o Melhor Cenário',
      instruction: 'Qual seria a melhor forma de usar IA nesta situação?',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Automatizar tarefa repetitiva',
            description: 'Usar IA para processar dados automaticamente',
            isCorrect: true,
            explanation: 'Excelente! A IA é ideal para automatizar tarefas repetitivas e processar grandes volumes de dados.'
          },
          {
            id: 'scenario-2',
            title: 'Substituir decisões estratégicas',
            description: 'Deixar a IA tomar todas as decisões do negócio',
            isCorrect: false,
            explanation: 'A IA deve **auxiliar** decisões estratégicas, não substituí-las completamente. O julgamento humano continua essencial.'
          }
        ]
      }
    }
  ]
};

/**
 * ✅ CRÍTICO: Gerar audioText LIMPO
 * 
 * Esta função:
 * - Remove emojis
 * - Remove markdown (**, ##, ---, etc)
 * - Remove caracteres especiais
 * - Mantém estrutura de parágrafos
 */
export const templateLessonAudioText = cleanAudioText(
  templateLesson.sections
    .map(section => section.visualContent)
    .join('\n\n')
);

/**
 * 📝 CHECKLIST ANTES DE CRIAR AULA:
 * 
 * [ ] contentVersion: 2
 * [ ] Última seção tem type: 'end-audio'
 * [ ] speechBubbleText ≤ 60 caracteres em todas as seções
 * [ ] visualContent usa markdown e formatação
 * [ ] audioText usa cleanAudioText()
 * [ ] Todos os exercícios têm propriedade 'data'
 * [ ] Exercício scenario-selection usa 'data.scenarios', não 'scenarios'
 * [ ] IDs únicos para todas as seções e exercícios
 */
