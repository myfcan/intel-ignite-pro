import { GuidedLessonData } from '@/types/guidedLesson';
import { cleanAudioText } from '@/lib/audioTextValidator';

/**
 * 🎯 AULA 04: IA NO SEU BOLSO
 * Modelo V2 - Áudios separados por seção
 */

export const fundamentos04: GuidedLessonData = {
  id: 'fundamentos-04',
  title: 'IA no Seu Bolso: Como Usar no Dia a Dia',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos de IA',
  duration: 0, // Será calculado automaticamente após gerar áudios
  contentVersion: 4, // V2 padronizado
  schemaVersion: 1, // 🆕 Para FASE 4
  
  sections: [
    {
      id: 'intro',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Vamos descobrir a IA no seu celular? 📱',
      visualContent: `## 🎯 Você Já Usa IA Todos os Dias e Nem Percebe!

Você sabia que já usa Inteligência Artificial várias vezes por dia?

E muitas vezes nem percebe!

Nesta aula, vamos descobrir:
- Como a IA está presente no seu smartphone
- Ferramentas práticas que você pode usar hoje
- Exemplos reais do dia a dia

**Prepare-se para ver seu celular com outros olhos!** 👀`
    },
    {
      id: 'apps-diarios',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Veja quantas IAs você já usa!',
      visualContent: `## 📱 IA nos Apps que Você Já Usa

### Assistentes Virtuais
- **Siri, Google Assistant, Alexa**: Reconhecem sua voz e entendem comandos
- Usam IA para interpretar o que você diz
- Respondem de forma natural

### Redes Sociais
- **Instagram, TikTok, Facebook**: Recomendam conteúdo personalizado
- A IA aprende o que você gosta e mostra mais do mesmo

### Mapas e Transporte
- **Google Maps, Waze**: Calculam melhor rota em tempo real
- Preveem trânsito usando dados de milhões de usuários

> 💡 **Dica**: Todas essas apps usam IA para aprender com você e melhorar sua experiência!`
    },
    {
      id: 'ferramentas-praticas',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Agora as ferramentas que vão mudar sua vida!',
      visualContent: `## 🚀 Ferramentas de IA para Usar Hoje

### ChatGPT (Conversação)
- Responde perguntas complexas
- Ajuda a escrever textos, emails e posts
- Explica conceitos de forma simples

### Google Tradutor (Idiomas)
- Traduz textos instantaneamente
- Reconhece fala e transcreve
- Traduz até imagens com a câmera

### Remini (Fotos)
- Melhora qualidade de fotos antigas
- Aumenta resolução automaticamente
- Restaura fotos borradas

### Canva Magic (Design)
- Cria designs profissionais com IA
- Remove fundos de fotos automaticamente
- Gera textos criativos

**Todas disponíveis no seu celular!** 📲`
    },
    {
      id: 'casos-praticos',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Veja como usar no seu dia!',
      visualContent: `## 💼 Casos Práticos do Dia a Dia

### Para Trabalho
- **Escrever emails profissionais**: ChatGPT ajuda com o tom correto
- **Fazer apresentações**: Canva cria slides bonitos rapidamente
- **Organizar agenda**: Assistentes virtuais marcam compromissos

### Para Estudos
- **Tirar dúvidas**: ChatGPT explica conceitos difíceis
- **Traduzir artigos**: Google Tradutor para conteúdo em inglês
- **Resumir textos**: IA condensa documentos longos

### Para Vida Pessoal
- **Planejar viagens**: IA sugere roteiros personalizados
- **Receitas**: Encontra receitas com o que você tem em casa
- **Editar fotos**: IA melhora suas selfies automaticamente

> 🎯 **O segredo**: Experimente! 

> Quanto mais você usa, melhor a IA te entende.`
    },
    {
      id: 'conclusao',
      timestamp: 0,
      type: 'end-audio', // ⚠️ CRÍTICO: Última seção
      speechBubbleText: 'Pronto! Agora você sabe usar IA no dia a dia! 🎉',
      visualContent: `## 🎓 Recapitulando

Você aprendeu que:
- ✅ IA já está nos apps que você usa todo dia
- ✅ Existem ferramentas gratuitas e poderosas disponíveis
- ✅ Você pode usar IA para trabalho, estudos e vida pessoal

**Próximo passo**: Escolha uma ferramenta da aula e teste hoje mesmo!

Nos exercícios, você vai aplicar esse conhecimento. Vamos lá! 🚀`
    }
  ],
  
  // 🎯 DESAFIO DO USUÁRIO - Novo playground com feedback de IA
  userChallenge: {
    instruction: 'Agora é sua vez! Escreva um prompt para a IA ajudar você em uma tarefa do seu dia a dia.',
    challengePrompt: 'Me ajuda a escrever um email',
    hints: [
      '💡 Seja específico sobre o que você quer',
      '📝 Inclua contexto: para quem, sobre o quê',
      '🎯 Diga o tom desejado: formal, informal, amigável'
    ]
  },
  
  exercisesConfig: [
    {
      id: 'ex-1',
      type: 'fill-in-blanks',
      title: 'IA nos Apps do Dia a Dia',
      instruction: 'Complete as frases sobre IA em apps que você já usa:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'O _______ usa IA para recomendar posts que você vai gostar no seu feed.',
            correctAnswers: ['Instagram', 'instagram'],
            options: ['Instagram', 'Facebook', 'WhatsApp'],
            hint: 'App de fotos e vídeos muito popular',
            explanation: 'O Instagram usa IA para analisar seu comportamento e mostrar conteúdo personalizado no seu feed!'
          },
          {
            id: 'sent-2',
            text: 'O Google _______ usa IA para calcular a rota mais rápida considerando o trânsito.',
            correctAnswers: ['Maps', 'maps'],
            options: ['Maps', 'Chrome', 'Drive'],
            hint: 'App de navegação e mapas do Google',
            explanation: 'O Google Maps usa IA para prever o trânsito em tempo real e calcular a melhor rota para você!'
          }
        ],
        feedback: {
          allCorrect: '🎉 Perfeito! Você já identifica IA nos apps do dia a dia!',
          someCorrect: '👍 Você acertou {count}! Continue assim!',
          needsReview: '💪 Revise o conteúdo sobre apps com IA e tente novamente!'
        }
      }
    },
    {
      id: 'ex-2',
      type: 'fill-in-blanks',
      title: 'Ferramentas de IA',
      instruction: 'Complete sobre ferramentas práticas de IA:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'O _______ é uma IA que ajuda a escrever textos, emails e responder perguntas.',
            correctAnswers: ['ChatGPT', 'chatgpt', 'Chat GPT'],
            options: ['ChatGPT', 'Google', 'Alexa'],
            hint: 'Começa com Chat...',
            explanation: 'ChatGPT é uma ferramenta de conversação que ajuda a criar textos e responder perguntas complexas!'
          },
          {
            id: 'sent-2',
            text: 'O app _______ usa IA para melhorar qualidade e restaurar fotos antigas.',
            correctAnswers: ['Remini', 'remini'],
            options: ['Remini', 'Instagram', 'Canva'],
            hint: 'App especializado em restauração de fotos',
            explanation: 'Remini usa IA para restaurar fotos antigas, aumentar resolução e melhorar qualidade automaticamente!'
          }
        ],
        feedback: {
          allCorrect: '🎉 Excelente! Você conhece as principais ferramentas de IA!',
          someCorrect: '👍 Acertou {count}! Revise as ferramentas e tente de novo!',
          needsReview: '💪 Volte na aula e veja as ferramentas práticas de IA!'
        }
      }
    },
    {
      id: 'ex-3',
      type: 'true-false',
      title: 'Verdadeiro ou Falso',
      instruction: 'Indique se cada afirmação é verdadeira ou falsa:',
      data: {
        statements: [
          {
            id: 'stmt-1',
            text: 'IA só funciona em computadores potentes, não em celulares',
            correct: false,
            explanation: 'A IA moderna funciona perfeitamente em smartphones. Apps como ChatGPT, Google Tradutor e Canva rodam direto no seu celular, tornando a IA acessível para todos.'
          }
        ],
        feedback: {
          allCorrect: '🎉 Perfeito! Você entendeu como a IA funciona no celular!',
          someCorrect: '👍 Muito bem! Continue aprendendo!',
          needsReview: '💪 Revise o conteúdo sobre IA em dispositivos móveis!'
        }
      }
    },
    {
      id: 'ex-4',
      type: 'scenario-selection',
      title: 'Escolha a Melhor Ferramenta',
      instruction: 'Você precisa melhorar uma foto antiga e borrada da sua família. Qual ferramenta usar?',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Remini',
            description: 'App que usa IA para melhorar qualidade e aumentar resolução de fotos',
            isCorrect: true,
            feedback: '✅ **Perfeito!** Remini foi feito exatamente para isso: restaurar fotos antigas, melhorar qualidade e aumentar resolução usando IA. É a ferramenta ideal para esse caso!'
          },
          {
            id: 'scenario-2',
            title: 'ChatGPT',
            description: 'Assistente de conversação para responder perguntas e escrever textos',
            isCorrect: false,
            feedback: '❌ ChatGPT é excelente para texto e conversação, mas não processa imagens. Para melhorar fotos, você precisa de uma ferramenta especializada como Remini.'
          },
          {
            id: 'scenario-3',
            title: 'Google Tradutor',
            description: 'App para traduzir textos entre diferentes idiomas',
            isCorrect: false,
            feedback: '❌ Google Tradutor é focado em idiomas e tradução. Embora tenha alguns recursos de imagem, não é feito para melhorar qualidade de fotos.'
          }
        ],
        correctExplanation: 'Remini é especializado em melhorar fotos usando IA. Ele aumenta resolução, restaura detalhes e melhora qualidade automaticamente!',
        followUpQuestion: 'Em qual outra situação você usaria Remini?',
        followUpAnswer: 'Você pode usar Remini para melhorar fotos antigas da família, aumentar qualidade de fotos borradas, ou melhorar selfies com baixa resolução!'
      }
    }
  ]
};

/**
 * ✅ CRÍTICO: Gerar audioText LIMPO
 * Remove emojis, markdown e formatação para TTS
 */
export const fundamentos04AudioText = cleanAudioText(
  fundamentos04.sections
    .map(section => section.visualContent)
    .join('\n\n')
);
