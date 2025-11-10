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
  trackName: 'Fundamentos da IA',
  duration: 0, // Será calculado automaticamente após gerar áudios
  contentVersion: 2, // V2 = áudios separados por seção
  
  sections: [
    {
      id: 'intro',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Olá! Vamos descobrir a IA no seu celular? 📱',
      visualContent: `## 🎯 IA Está Mais Perto do Que Você Imagina

Você sabia que já usa Inteligência Artificial várias vezes por dia, sem nem perceber?

Nesta aula, vamos descobrir:
- Como a IA está presente no seu smartphone
- Ferramentas práticas que você pode usar HOJE
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
- Usam IA para interpretar o que você diz e responder de forma natural

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
      visualContent: `## 🚀 Ferramentas de IA para Usar HOJE

### ChatGPT (Conversação)
- Responde perguntas complexas
- Ajuda a escrever textos, emails, posts
- Explica conceitos de forma simples

### Google Tradutor (Idiomas)
- Traduz textos instantaneamente
- Reconhece fala e transcreve
- Traduz até imagens com câmera

### Remini (Fotos)
- Melhora qualidade de fotos antigas
- Aumenta resolução automaticamente
- Restaura fotos borradas

### Canva Magic (Design)
- Cria designs profissionais com IA
- Remove fundos de fotos
- Gera textos criativos

**Todas disponíveis no seu celular AGORA!** 📲`
    },
    {
      id: 'casos-praticos',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Veja como usar no seu dia!',
      visualContent: `## 💼 Casos Práticos do Dia a Dia

### Para Trabalho
- **Escrever emails profissionais**: ChatGPT ajuda com tom correto
- **Fazer apresentações**: Canva cria slides bonitos rapidamente
- **Organizar agenda**: Assistentes virtuais marcam compromissos

### Para Estudos
- **Tirar dúvidas**: ChatGPT explica conceitos difíceis
- **Traduzir artigos**: Google Tradutor para conteúdo em inglês
- **Resumir textos**: IA condensa documentos longos

### Para Vida Pessoal
- **Planejar viagens**: IA sugere roteiros personalizados
- **Receitas**: Encontra receitas baseadas no que você tem em casa
- **Editar fotos**: IA melhora suas selfies automaticamente

> 🎯 **O segredo**: Experimente! Quanto mais você usa, melhor a IA te entende.`
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

**Próximo passo**: Escolha UMA ferramenta da aula e teste HOJE mesmo!

Nos exercícios, você vai aplicar esse conhecimento. Vamos lá! 🚀`
    }
  ],
  
  exercisesConfig: [
    {
      id: 'ex-1',
      type: 'data-collection',
      title: 'Sua Primeira IA',
      instruction: 'Qual ferramenta de IA desta aula você mais quer testar? Por que?',
      data: {
        placeholder: 'Ex: Quero testar o ChatGPT porque preciso melhorar meus emails profissionais...',
        maxLength: 500
      }
    },
    {
      id: 'ex-2',
      type: 'fill-in-blanks',
      title: 'Complete: Apps com IA',
      instruction: 'Preencha as lacunas sobre apps que usam IA:',
      data: {
        text: 'O Instagram usa IA para _____ conteúdo personalizado, enquanto o Google Maps usa IA para calcular a melhor _____ em tempo real.',
        blanks: [
          {
            id: 'blank-1',
            correctAnswer: 'recomendar',
            alternatives: ['sugerir', 'mostrar', 'exibir']
          },
          {
            id: 'blank-2',
            correctAnswer: 'rota',
            alternatives: ['caminho', 'trajetória']
          }
        ]
      }
    },
    {
      id: 'ex-3',
      type: 'true-false',
      title: 'Verdadeiro ou Falso',
      instruction: 'IA só funciona em computadores potentes, não em celulares',
      data: {
        correctAnswer: false,
        explanation: '**Falso!** A IA moderna funciona perfeitamente em smartphones. Apps como ChatGPT, Google Tradutor e Canva rodam direto no seu celular, tornando a IA acessível para todos.'
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
            explanation: '✅ **Perfeito!** Remini foi feito exatamente para isso: restaurar fotos antigas, melhorar qualidade e aumentar resolução usando IA. É a ferramenta ideal para esse caso!'
          },
          {
            id: 'scenario-2',
            title: 'ChatGPT',
            description: 'Assistente de conversação para responder perguntas e escrever textos',
            isCorrect: false,
            explanation: '❌ ChatGPT é excelente para texto e conversação, mas não processa imagens. Para melhorar fotos, você precisa de uma ferramenta especializada como Remini.'
          },
          {
            id: 'scenario-3',
            title: 'Google Tradutor',
            description: 'App para traduzir textos entre diferentes idiomas',
            isCorrect: false,
            explanation: '❌ Google Tradutor é focado em idiomas e tradução. Embora tenha alguns recursos de imagem, não é feito para melhorar qualidade de fotos.'
          }
        ]
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
