import { GuidedLessonData } from '@/types/guidedLesson';

// 🎯 AULA MODELO V2 - Fundamentos 03
// ⏱️ Duração: ~4 minutos (240s) - 5 sessões de ~48s cada
// 🎵 Áudios: 5 arquivos separados (lesson-audios/aula-03/sessao-{1-5}.mp3)
// 📍 Timestamps: Fixos (0, 48, 96, 144, 192s)
export const fundamentos03: GuidedLessonData = {
  id: 'fundamentos-03',
  title: 'Como a IA Aprende: O Cérebro Digital por Trás das Máquinas Inteligentes',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos de IA',
  duration: 240, // ~4 minutos (arredondado para completar todas as seções)
  contentVersion: 4, // Incrementado para forçar re-sync
  schemaVersion: 1, // 🆕 Para FASE 4
  
  sections: [
    {
      id: 'sessao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'A mágica por trás da IA',
      visualContent: `## 🎯 A mágica por trás da IA

Olá, aqui é a Liv novamente.

Hoje você vai descobrir como a Inteligência Artificial realmente aprende.

Muita gente acredita que a IA "pensa" sozinha, mas a verdade é bem mais simples — e até curiosa.

Ela aprende com exemplos, exatamente como nós.

Pense em uma criança aprendendo a reconhecer frutas.

Você mostra várias maçãs, bananas e laranjas.

Depois de um tempo, ela consegue identificar uma fruta nova, mesmo nunca tendo visto antes.

A IA faz a mesma coisa — só que em escala gigante, com milhões de exemplos, o tempo todo.

O segredo dela não é mágica, é repetição e aprendizado com dados.`
    },
    {
      id: 'sessao-2',
      timestamp: 48,
      type: 'text',
      speechBubbleText: 'O papel dos dados',
      visualContent: `## 📊 O papel dos dados

Tudo o que a IA sabe vem dos dados que recebe.

Cada foto, cada texto, cada voz analisada ajuda a IA a entender padrões.

Um padrão é uma semelhança entre coisas diferentes.

Por exemplo: o formato arredondado das frutas, o som das palavras, ou a estrutura de uma frase.

A IA "observa" esses detalhes e aprende a reconhecê-los.

É por isso que ela consegue prever a próxima palavra que você vai digitar, ou recomendar um filme que você provavelmente vai gostar.

Quanto mais dados ela tem, mais inteligente se torna.

Mas lembre-se: sem bons dados, a IA aprende errado — como um aluno que estuda com o material errado.`
    },
    {
      id: 'sessao-3',
      timestamp: 96,
      type: 'text',
      speechBubbleText: 'O treino das máquinas',
      visualContent: `## 🧠 O treino das máquinas

Aprender é como treinar um músculo — e com as máquinas é igual.

Durante o treinamento, a IA erra muito no começo.

Ela tenta, erra, recebe feedback e melhora.

Pense em um atleta aprendendo um novo movimento.

A cada tentativa, ele ajusta a posição, o tempo e a força até acertar.

Na IA, isso é feito com algoritmos de aprendizado de máquina.

Eles testam milhares de combinações até encontrar o melhor resultado.

E quando encontram, a IA "memoriza" esse padrão.

É assim que ela aprende a reconhecer rostos, traduzir idiomas e até diagnosticar doenças.`
    },
    {
      id: 'sessao-4',
      timestamp: 144,
      type: 'text',
      speechBubbleText: 'Como a IA melhora com o tempo',
      visualContent: `## 🔄 Como a IA melhora com o tempo

A IA continua aprendendo mesmo depois de "treinada".

Ela observa o comportamento das pessoas e ajusta suas respostas.

Quando você dá um "like" em um vídeo, ela entende que aquele conteúdo te interessa.

Quando ignora, ela aprende o contrário.

Esse ciclo constante é chamado de aprendizado contínuo.

Quanto mais usamos a IA, mais ela entende o que gostamos.

É por isso que as recomendações ficam cada vez mais precisas — seja no Spotify, Netflix ou nas redes sociais.

Ela está sempre observando, aprendendo e evoluindo, como um aluno dedicado que nunca para de estudar.`
    },
    {
      id: 'sessao-5',
      timestamp: 192,
      type: 'end-audio',
      speechBubbleText: 'O futuro do aprendizado da IA',
      visualContent: `## 🚀 O futuro do aprendizado da IA

A forma como a IA aprende está evoluindo todos os dias.

Hoje, ela já é capaz de criar, imaginar e resolver problemas complexos.

Na medicina, ajuda médicos a prever doenças antes dos sintomas.

Na educação, adapta o conteúdo para o ritmo de cada aluno.

Nos negócios, descobre oportunidades invisíveis aos humanos.

Mas o ponto mais importante é este: quanto mais pessoas entendem como a IA aprende, mais poder elas têm para usá-la bem.

Você não precisa ser programador.

Precisa apenas aprender a conversar com a IA — e é exatamente isso que vai te diferenciar no futuro.`
    }
  ],
  
  exercisesConfig: [
    // Exercício 1: Múltipla Escolha (scenario-selection)
    {
      id: 'ex-final-1-aula-3-trilha-1',
      type: 'scenario-selection',
      title: 'O que faz a IA aprender melhor?',
      instruction: 'Escolha a resposta correta:',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Mais velocidade no computador',
            description: 'Computadores rápidos processam mais rápido',
            emoji: '⚡',
            isCorrect: false,
            feedback: 'Velocidade ajuda, mas não é o principal. Sem bons dados, a IA não aprende corretamente!'
          },
          {
            id: 'scenario-2',
            title: 'Bons dados e muitos exemplos',
            description: 'Dados de qualidade e quantidade são essenciais',
            emoji: '✅',
            isCorrect: true,
            feedback: 'Perfeito! Quanto melhores os dados, mais a IA entende e aprende corretamente.'
          },
          {
            id: 'scenario-3',
            title: 'Ter uma aparência humana',
            description: 'IA precisa parecer com humanos',
            emoji: '🤖',
            isCorrect: false,
            feedback: 'Não! A IA não precisa de corpo ou aparência para aprender. O aprendizado vem dos dados!'
          },
          {
            id: 'scenario-4',
            title: 'Ter acesso à internet',
            description: 'Conexão com a internet é fundamental',
            emoji: '🌐',
            isCorrect: false,
            feedback: 'Internet ajuda, mas o crucial são os DADOS de qualidade que ela recebe para treinar!'
          }
        ],
        correctExplanation: 'A IA aprende melhor com dados de qualidade e em grande quantidade. É isso que permite reconhecer padrões!',
        followUpQuestion: 'Por que dados ruins prejudicam o aprendizado da IA?',
        followUpAnswer: 'Porque a IA aprende com exemplos. Se os exemplos forem ruins, ela aprende errado, como estudar com material incorreto.'
      }
    },
    
    // Exercício 2: Arraste e Solte (platform-match)
    {
      id: 'ex-final-2-aula-3-trilha-1',
      type: 'platform-match',
      title: 'Relacione a IA com seu uso',
      instruction: 'Clique no exemplo que corresponde a cada plataforma:',
      data: {
        platforms: [
          { id: 'netflix', name: 'Netflix', icon: '🎬', color: '#E50914' },
          { id: 'waze', name: 'Waze', icon: '🗺️', color: '#33CCFF' },
          { id: 'chatgpt', name: 'ChatGPT', icon: '💬', color: '#10A37F' }
        ],
        scenarios: [
          {
            id: 'scenario-1',
            text: 'Sugere filmes e séries baseados no seu histórico',
            correctPlatform: 'netflix',
            emoji: '🎬'
          },
          {
            id: 'scenario-2',
            text: 'Calcula a melhor rota evitando trânsito em tempo real',
            correctPlatform: 'waze',
            emoji: '🗺️'
          },
          {
            id: 'scenario-3',
            text: 'Gera textos, responde perguntas e cria conteúdo',
            correctPlatform: 'chatgpt',
            emoji: '💬'
          }
        ]
      }
    },
    
    // Exercício 3: Texto Livre - Reflexão (scenario-selection adaptado)
    {
      id: 'ex-final-3-aula-3-trilha-1',
      type: 'scenario-selection',
      title: 'IA no seu dia a dia',
      instruction: 'Em qual situação você percebe que a IA te ajuda sem perceber?',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Recomendações personalizadas',
            description: 'Quando aplicativos sugerem músicas, vídeos ou produtos que eu gosto',
            emoji: '🎵',
            isCorrect: true,
            feedback: 'Excelente! Quando você identifica isso, começa a enxergar a IA como uma aliada, não como um mistério.'
          },
          {
            id: 'scenario-2',
            title: 'Correção automática',
            description: 'Quando o celular corrige minhas mensagens ou prevê palavras',
            emoji: '✍️',
            isCorrect: true,
            feedback: 'Perfeito! A IA aprende seu estilo de escrita e antecipa o que você vai digitar.'
          },
          {
            id: 'scenario-3',
            title: 'Segurança digital',
            description: 'Quando o e-mail bloqueia spam ou o banco detecta fraudes',
            emoji: '🔒',
            isCorrect: true,
            feedback: 'Muito bem! A IA protege você nos bastidores, identificando padrões suspeitos automaticamente.'
          },
          {
            id: 'scenario-4',
            title: 'Assistentes virtuais',
            description: 'Quando uso comandos de voz ou recebo respostas inteligentes',
            emoji: '🎙️',
            isCorrect: true,
            feedback: 'Ótimo! Assistentes como Alexa e Siri usam IA para entender sua voz e contexto.'
          }
        ],
        correctExplanation: 'A IA está presente em diversas situações do dia a dia, facilitando tarefas sem que percebamos!',
        followUpQuestion: 'Como você pode usar melhor a IA agora que sabe disso?',
        followUpAnswer: 'Identificando onde ela já me ajuda e buscando novas formas de usá-la para economizar tempo e criar oportunidades.'
      }
    },
    
    // Exercício 4: Antes e Depois (scenario-selection)
    {
      id: 'ex-final-4-aula-3-trilha-1',
      type: 'scenario-selection',
      title: 'Antes e Depois da IA',
      instruction: 'Compare os dois cenários e escolha o que mudou:',
      data: {
        scenarios: [
          {
            id: 'scenario-1',
            title: 'Antes da IA',
            description: 'Você precisava procurar manualmente um produto na internet, navegando por várias páginas',
            emoji: '🔍',
            isCorrect: false,
            feedback: 'Este era o cenário antigo. Veja o que a IA mudou!'
          },
          {
            id: 'scenario-2',
            title: 'Depois da IA',
            description: 'O site mostra o produto ideal antes mesmo de você buscar, baseado no seu histórico',
            emoji: '✨',
            isCorrect: true,
            feedback: 'Exatamente! A IA aprende a prever o que você quer — esse é o poder do aprendizado contínuo.'
          }
        ],
        correctExplanation: 'A IA transformou a experiência: de busca manual para antecipação inteligente das suas necessidades!',
        followUpQuestion: 'O que mudou entre esses dois cenários?',
        followUpAnswer: 'A IA aprendeu com seu comportamento e antecipou sua necessidade, tornando a experiência mais eficiente.'
      }
    },
    
    // Exercício 5: Checkbox Múltiplo (data-collection)
    {
      id: 'ex-final-5-aula-3-trilha-1',
      type: 'data-collection',
      title: 'Como a IA aprende com o tempo',
      instruction: 'Marque TODAS as formas como a IA aprende continuamente:',
      data: {
        scenario: {
          id: 'scenario-1',
          emoji: '🧠',
          platform: 'Aprendizado Contínuo',
          situation: 'A IA continua aprendendo mesmo depois de treinada, observando comportamentos e ajustando suas respostas constantemente',
          context: 'Como a IA evolui sem reprogramação',
          dataPoints: [
              {
                id: 'data-1',
                label: 'Corrige seus erros automaticamente',
                isCorrect: true,
                explanation: 'A IA identifica padrões incorretos e se ajusta sem intervenção humana'
              },
              {
                id: 'data-2',
                label: 'Melhora com o uso',
                isCorrect: true,
                explanation: 'Cada interação fornece novos dados para aprimorar suas respostas'
              },
              {
                id: 'data-3',
                label: 'Precisa ser reprogramada toda vez',
                isCorrect: false,
                explanation: 'Falso! A IA aprende sozinha através de aprendizado contínuo'
              },
              {
                id: 'data-4',
                label: 'Aprende com o comportamento humano',
                isCorrect: true,
                explanation: 'A IA observa como você interage e adapta suas sugestões ao seu perfil'
              }
            ]
        },
        feedback: {
          allCorrect: 'Excelente! A IA aprende sozinha com base nos padrões do nosso comportamento — como nós, quando repetimos algo até dominar.',
          someCorrect: 'Muito bem! Você entendeu parte do processo. A IA aprende continuamente, sem precisar de reprogramação manual.',
          needsReview: 'A IA evolui com o tempo através do aprendizado contínuo, observando padrões e ajustando suas respostas automaticamente!'
        }
      }
    }
  ]
};

// Texto concatenado para geração de áudio (limpo, sem emojis/markdown)
import { cleanAudioText } from '@/lib/audioTextValidator';

export const fundamentos03AudioText = cleanAudioText(
  fundamentos03.sections
    .map(section => section.visualContent)
    .join('\n\n')
);
