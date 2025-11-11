import { GuidedLessonData } from '@/types/guidedLesson';

// ID Interno: aula-2-trilha-1 (para referência humana)
// 🔄 CACHE BUSTING: Sempre que alterar o conteúdo, incremente contentVersion
export const fundamentos02: GuidedLessonData = {
  id: 'fundamentos-02',
  title: 'Como a IA Aprende com Você',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos de IA',
  duration: 198, // 3min 18s
  contentVersion: 3, // Versão atual do conteúdo (incrementar quando alterar exercícios)
  schemaVersion: 1, // 🆕 Para FASE 4

  sections: [
    {
      id: 'secao-1',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Já reparou como o Netflix sempre sabe o que você quer ver?',
      visualContent: `## 🎯 O segredo por trás das sugestões perfeitas

Você já parou pra pensar como o **Netflix** sempre sabe o que você quer assistir? 

Ou como o **Spotify** cria aquela playlist que parece que foi feita especialmente pra você? 🎵

O segredo está em como a Inteligência Artificial **aprende**. Ela observa tudo que você faz, identifica padrões e usa essas informações pra melhorar cada vez mais.

É como ter um amigo que presta muita atenção no que você gosta e sempre tem a sugestão perfeita na hora certa! 💡`
    },
    {
      id: 'secao-2',
      timestamp: 31,
      type: 'text',
      speechBubbleText: 'A IA registra cada detalhe do que você assiste',
      visualContent: `## 🎬 Netflix - A escola da IA

Vamos usar o Netflix como exemplo. Toda vez que você assiste algo, a IA registra:

- 📊 Qual gênero
- 👥 Quais atores
- ⏱️ Quanto tempo você assistiu
- ⏭️ Se você pulou a introdução
- ✅ Se assistiu até o final

Com milhões de pessoas fazendo isso, a IA começa a identificar padrões:

> "Quem assistiu A também gostou de B"  
> "Quem para de assistir no episódio três geralmente não gosta desse tipo de série"

**Quanto mais você usa, mais dados a IA tem. E mais dados significa sugestões cada vez melhores!** 📈`
    },
    {
      id: 'secao-3',
      timestamp: 66,
      type: 'text',
      speechBubbleText: 'O Spotify conhece seus humores melhor que ninguém',
      visualContent: `## 🎵 Spotify e a mágica da música

O Spotify funciona parecido, mas vai além. Ele não só vê o que você ouve, mas **QUANDO** você ouve.

🌅 Segunda de manhã → você gosta de um estilo  
🌃 Sexta à noite → outro completamente diferente

A IA aprende seus **humores**, suas **rotinas**, até prevê o que você vai querer ouvir dependendo da hora do dia.

Por isso aquela playlist **"Descobertas da Semana"** parece mágica! ✨

Ela está literalmente aprendendo com você **24 horas por dia, 7 dias por semana**. 🔄`
    },
    {
      id: 'secao-4',
      timestamp: 101,
      type: 'text',
      speechBubbleText: 'Vamos ver a IA aprendendo em tempo real!',
      visualContent: `## 🎮 Hora de descobrir na prática

Incrível, né? A IA não é programada com gostos específicos. **Ela aprende observando o que VOCÊ faz!**

Agora que você entendeu o conceito, que tal descobrir na prática como isso funciona?

Vamos fazer um teste rápido onde você vai ver a IA aprendendo em tempo real! 🚀

É super rápido e você vai ter aquele momento **"aha!"** quando entender de verdade.

**Vamos lá?** 👇`,
      showPlaygroundCall: true,
      playgroundConfig: {
        instruction: 'Como o Netflix Aprendeu o Que Você Gosta',
        type: 'interactive-simulation',
        simulationConfig: {
          type: 'interactive-simulation',
          title: 'Como o Netflix Aprendeu o Que Você Gosta',
          intro: {
            icon: '🎬',
            title: 'Simulação: Seu Primeiro Mês no Netflix',
            description: 'Vamos simular como a IA aprende com você. Cada escolha sua ensina algo novo para a inteligência artificial!',
            visual: 'Linha do tempo: Semana 1 → Semana 2 → Semana 3 → Resultado'
          },
          scenario: {
            icon: '🎬',
            text: 'Você acabou de criar uma conta no Netflix. A IA ainda não sabe NADA sobre você!'
          },
          steps: [
            {
              step: 1,
              week: 'Semana 1 - Primeira Escolha',
              context: 'Você acabou de criar sua conta. O Netflix ainda não sabe NADA sobre você.',
              iaKnowledge: '🤷 IA sabe: Nada ainda',
              prompt: 'Escolha seu primeiro filme para assistir hoje à noite:',
              options: [
                { id: 'acao', title: 'Velozes e Furiosos 7', genre: 'Ação', emoji: '🚗', description: 'Carros, explosões, adrenalina' },
                { id: 'romance', title: 'Diário de uma Paixão', genre: 'Romance', emoji: '💕', description: 'História de amor emocionante' },
                { id: 'comedia', title: 'Se Beber Não Case', genre: 'Comédia', emoji: '😂', description: 'Risadas garantidas' }
              ],
              feedback: {
                title: 'O que a IA Aprendeu:',
                learning: [
                  '✓ Você gostou de {genre}',
                  '✓ Assistiu em horário noturno',
                  '✓ Primeira impressão registrada'
                ],
                visual: 'Barra de aprendizado: 33% completa',
                confidence: 'Confiança da IA: 25%'
              }
            },
            {
              step: 2,
              week: 'Semana 2 - IA Fazendo Sugestões',
              context: 'Uma semana depois. A IA já começou a aprender!',
              iaKnowledge: '🧠 IA sabe: Você gostou de {previousGenre}',
              prompt: 'O Netflix montou sugestões pra você. Escolha um filme:',
              options: 'dynamic',
              logic: '2 filmes do mesmo gênero escolhido + 1 diferente',
              feedback: {
                title: 'A IA Está Ficando Mais Esperta:',
                learning: [
                  '✓✓ CONFIRMOU: Você realmente gosta de {genre}',
                  '✓ IA aumentou confiança nessa preferência',
                  '✓ Próximas sugestões serão ainda mais precisas'
                ],
                confidence: 'Confiança da IA: 60%',
                visual: 'Barra de aprendizado: 66% completa'
              }
            },
            {
              step: 3,
              week: 'Semana 3 - IA Experiente',
              context: 'Três semanas depois. A IA já te conhece bem!',
              iaKnowledge: '🎯 IA sabe: Suas preferências + padrões + horários',
              prompt: 'Sexta-feira, 21h. Veja as sugestões personalizadas:',
              options: 'dynamic',
              logic: '3 filmes altamente personalizados baseados no perfil',
              feedback: {
                title: 'IA Totalmente Treinada! 🎯',
                learning: [
                  '✓✓✓ IA dominou suas preferências',
                  '✓ Conhece seus gêneros favoritos',
                  '✓ Sabe seus horários típicos',
                  '✓ Prevê o que você vai gostar'
                ],
                confidence: 'Confiança da IA: 95%',
                visual: 'Barra de aprendizado: 100% completa! 🎉'
              }
            }
          ],
          completion: {
            visual: 'Gráfico de progressão mostrando evolução',
            chart: {
              type: 'progressionChart',
              data: [
                { week: 'Semana 1', accuracy: 25, label: 'IA não sabia nada' },
                { week: 'Semana 2', accuracy: 60, label: 'IA começou a aprender' },
                { week: 'Semana 3', accuracy: 95, label: 'IA te conhece bem!' }
              ]
            },
            summary: {
              icon: '📊',
              title: 'Veja o que aconteceu:',
              insights: [
                '🎬 Você escolheu {totalPicks} filmes',
                '🧠 A IA aprendeu {learnedPatterns} padrões',
                '🎯 Taxa de acerto final: {accuracy}%',
                '⚡ Em 3 semanas a IA te conheceu!'
              ],
              realWorldContext: {
                title: 'Na vida real:',
                points: [
                  'O Netflix analisa CENTENAS de escolhas suas',
                  'Aprende com MILHÕES de usuários ao mesmo tempo',
                  'Por isso as sugestões ficam TÃO boas!',
                  'Você ensina IA só de usar o app normalmente'
                ]
              }
            },
            message: 'Viu como funciona? A IA aprendeu seu gosto em apenas 3 escolhas! Imagina com centenas de filmes...',
            badge: { 
              id: 'badge-entendeu-aprendizado-ia', 
              title: 'Mestre do Aprendizado de IA!', 
              icon: '🧠' 
            }
          }
        }
      }
    },
    {
      id: 'secao-5',
      timestamp: 128,
      type: 'text',
      speechBubbleText: 'As redes sociais são ainda mais sofisticadas',
      visualContent: `## 📱 Instagram e Facebook - IA social

As redes sociais usam o mesmo princípio, mas de um jeito ainda mais sofisticado.

### Instagram 📸
O Instagram analisa:
- Em quais fotos você **para pra ver**
- Quais você dá **like**
- Quais você só **passa direto**

### Facebook 👥
O Facebook observa:
- Quais posts você **lê até o final**
- Quais você **compartilha**
- Com quem você **mais interage**

E usa tudo isso pra montar seu **feed personalizado**. 🎯

Por isso duas pessoas vendo o Instagram ao mesmo tempo veem coisas completamente diferentes. **Cada feed é único**, moldado pela IA que aprendeu com você! ✨`
    },
    {
      id: 'secao-6',
      timestamp: 166,
      type: 'end-audio',
      speechBubbleText: 'Você ensina IA sem perceber, a cada clique!',
      visualContent: `## 🎓 Você está ensinando IA o tempo todo

Aqui está o mais interessante: **você não precisa fazer nada especial**. 

Só de usar esses apps normalmente, você está ensinando a IA! 🎯

- Cada **curtida** 👍
- Cada **busca** 🔍
- Cada **clique** 🖱️

...é uma aula pra IA. E ela é uma aluna excelente - **nunca esquece nada** e está **sempre melhorando**. 📚

---

### 🚀 Agora você sabe o segredo!

E nas próximas aulas, você vai aprender a usar esse conhecimento **a seu favor**, criando seus próprios comandos para IA.

**Vai ser incrível!** ✨`
    }
  ],

  exercisesConfig: [
    {
      id: 'ex-final-1-aula-2-trilha-1',
      type: 'data-collection',
      title: 'O que a IA Está Aprendendo?',
      instruction: 'Veja cada situação e identifique TODOS os dados que a IA está coletando ao mesmo tempo:',
      data: {
        scenarios: [
          {
            id: 'scenario-netflix',
            emoji: '🎬',
            platform: 'Netflix',
            context: 'Sexta-feira, 22h',
            situation: 'Você começou uma série de comédia, assistiu 3 episódios seguidos sem pausar, pulou a intro de todos, e deu like no último episódio.',
            dataPoints: [
              { id: 'genre', label: 'Qual gênero você prefere (comédia)', isCorrect: true, explanation: '✅ Sim! A IA registra o gênero para sugerir conteúdo similar.' },
              { id: 'binge', label: 'Que você assiste vários episódios seguidos', isCorrect: true, explanation: '✅ Correto! Padrão de "binge watching" é importante.' },
              { id: 'skip-intro', label: 'Que você sempre pula a introdução', isCorrect: true, explanation: '✅ Exato! A IA aprende suas preferências de navegação.' },
              { id: 'timing', label: 'Horário que você costuma assistir (noite)', isCorrect: true, explanation: '✅ Sim! Horários ajudam a personalizar notificações.' },
              { id: 'engagement', label: 'Seu nível de engajamento (like)', isCorrect: true, explanation: '✅ Perfeito! Likes são sinais fortes de preferência.' },
              { id: 'device', label: 'Qual dispositivo você está usando', isCorrect: false, explanation: '❌ Não mencionado neste cenário específico.' },
              { id: 'volume', label: 'Volume que você prefere assistir', isCorrect: false, explanation: '❌ Volume não é coletado neste contexto.' }
            ]
          },
          {
            id: 'scenario-spotify',
            emoji: '🎵',
            platform: 'Spotify',
            context: 'Segunda-feira, 7h da manhã',
            situation: 'Você está se arrumando para trabalhar e coloca uma playlist de rock animado. Pula 2 músicas lentas, adiciona 3 músicas aos favoritos, e ouve tudo no volume alto.',
            dataPoints: [
              { id: 'time-context', label: 'Horário e contexto (manhã, preparação)', isCorrect: true, explanation: '✅ Sim! Contexto temporal é essencial para sugestões.' },
              { id: 'energy-level', label: 'Preferência por músicas animadas de manhã', isCorrect: true, explanation: '✅ Correto! Energia da música vs horário é padrão importante.' },
              { id: 'skips', label: 'Quais tipos de música você rejeita (lentas)', isCorrect: true, explanation: '✅ Exato! Pulos ensinam o que você NÃO quer.' },
              { id: 'favorites', label: 'Músicas que você realmente ama (favoritos)', isCorrect: true, explanation: '✅ Perfeito! Favoritos são sinais muito fortes.' },
              { id: 'genre-rock', label: 'Seu gênero favorito (rock)', isCorrect: true, explanation: '✅ Sim! Gênero é fundamental para curadoria.' },
              { id: 'lyrics', label: 'Se você prefere músicas com ou sem letra', isCorrect: false, explanation: '❌ Não foi mencionado no cenário.' },
              { id: 'volume-pref', label: 'Preferência de volume (alto)', isCorrect: false, explanation: '❌ Volume é configuração pessoal, não padrão de gosto musical.' }
            ]
          },
          {
            id: 'scenario-instagram',
            emoji: '📸',
            platform: 'Instagram',
            context: 'Domingo à tarde',
            situation: 'Você está rolando o feed. Para por 30 segundos numa foto de viagem, dá like, salva nos favoritos, e clica no perfil para ver mais fotos daquele lugar.',
            dataPoints: [
              { id: 'time-spent', label: 'Quanto tempo você para em cada foto', isCorrect: true, explanation: '✅ Sim! Tempo de visualização é métrica-chave de interesse.' },
              { id: 'interest-topic', label: 'Seus interesses (viagens)', isCorrect: true, explanation: '✅ Correto! Tópicos de interesse direcionam seu feed.' },
              { id: 'engagement-like', label: 'Conteúdo que você considera bom (like)', isCorrect: true, explanation: '✅ Exato! Likes indicam aprovação.' },
              { id: 'save-intent', label: 'Intenção de rever depois (salvar)', isCorrect: true, explanation: '✅ Perfeito! Salvos mostram alto interesse.' },
              { id: 'explore-more', label: 'Curiosidade para explorar mais do mesmo tema', isCorrect: true, explanation: '✅ Sim! Clicar no perfil mostra interesse profundo.' },
              { id: 'friends', label: 'Quais amigos você mais interage', isCorrect: false, explanation: '❌ Não houve interação com amigos neste cenário.' },
              { id: 'location', label: 'Sua localização atual', isCorrect: false, explanation: '❌ Localização não foi relevante nesta ação.' }
            ]
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Você identificou TODOS os dados que a IA coleta!',
          someCorrect: '👍 Muito bem! Você acertou {count}! Continue observando os padrões!',
          needsReview: '💡 Revise o conteúdo sobre coleta de dados e tente novamente!'
        }
      }
    },
    {
      id: 'ex-final-2-aula-2-trilha-1',
      type: 'fill-in-blanks',
      title: 'Complete o que Você Aprendeu',
      instruction: 'Preencha as lacunas com as palavras corretas:',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'Quanto mais você usa um app, mais _______ a IA tem para aprender.',
            correctAnswers: ['dados', 'informações', 'informação', 'data'],
            hint: 'O que a IA coleta de você?',
            explanation: 'A IA precisa de DADOS (informações) para aprender. Quanto mais você usa, mais dados ela coleta!'
          },
          {
            id: 'sent-2',
            text: 'O Spotify não só aprende o que você ouve, mas também _______ você ouve.',
            correctAnswers: ['quando', 'a hora que', 'o horário que', 'em que momento', 'que horas'],
            hint: 'Pense no TEMPO...',
            explanation: 'O Spotify aprende QUANDO você ouve cada estilo de música (manhã, tarde, noite) para sugerir no momento certo!'
          },
          {
            id: 'sent-3',
            text: 'Você está ensinando IA toda vez que _______ um app normalmente.',
            correctAnswers: ['usa', 'utiliza', 'mexe', 'acessa', 'abre', 'interage'],
            hint: 'O que você FAZ com apps?',
            explanation: 'Só de USAR o app normalmente, você já está ensinando a IA! Cada clique, cada scroll, cada like é uma aula.'
          },
          {
            id: 'sent-4',
            text: 'Duas pessoas vendo o Instagram ao mesmo tempo veem feeds _______, moldados pela IA.',
            correctAnswers: ['diferentes', 'distintos', 'únicos', 'personalizados', 'variados'],
            hint: 'O que é o oposto de iguais?',
            explanation: 'Cada feed é DIFERENTE porque a IA personalizou baseado no que VOCÊ gosta, não no que todo mundo gosta!'
          }
        ],
        feedback: {
          allCorrect: '🎯 Perfeito! Você dominou os conceitos! Todas as 4 frases corretas!',
          someCorrect: '👍 Muito bem! Você acertou {count} de 4! Excelente compreensão!',
          needsReview: '💡 Quase lá! Você acertou {count} de 4. Leia as explicações para entender melhor!'
        }
      }
    },
    {
      id: 'ex-final-3-aula-2-trilha-1',
      type: 'true-false',
      title: 'Verdadeiro ou Falso?',
      instruction: 'Marque V para verdadeiro ou F para falso em cada afirmação:',
      data: {
        statements: [
          {
            id: 'tf-1',
            text: 'A IA precisa que você ensine manualmente o que você gosta',
            correct: false,
            explanation: '❌ FALSO! A IA aprende sozinha só observando o que você faz. Você não precisa ensinar nada manualmente!'
          },
          {
            id: 'tf-2',
            text: 'Quanto mais você usa um app, melhor a IA fica',
            correct: true,
            explanation: '✅ VERDADEIRO! Mais uso = mais dados = IA mais inteligente e precisa nas sugestões!'
          },
          {
            id: 'tf-3',
            text: 'Duas pessoas veem o mesmo feed no Instagram',
            correct: false,
            explanation: '❌ FALSO! Cada feed é personalizado pela IA que aprendeu com VOCÊ. Por isso você e seu amigo veem coisas diferentes!'
          },
          {
            id: 'tf-4',
            text: 'O Netflix sabe se você assistiu até o final de um episódio',
            correct: true,
            explanation: '✅ VERDADEIRO! A IA registra tudo: quanto tempo você assistiu, se pulou, se voltou... Ela usa isso para aprender!'
          },
          {
            id: 'tf-5',
            text: 'O Spotify só aprende quais músicas você ouve',
            correct: false,
            explanation: '❌ FALSO! O Spotify vai ALÉM: aprende QUANDO você ouve cada estilo (manhã, tarde, noite) e sugere no momento certo!'
          },
          {
            id: 'tf-6',
            text: 'Você ensina IA toda vez que usa um app normalmente',
            correct: true,
            explanation: '✅ VERDADEIRO! Cada clique, scroll, like é uma "aula" para a IA. Você é professor sem perceber!'
          }
        ],
        feedback: {
          perfect: '🏆 Perfeito! 6 de 6 corretas! Você é um expert em como a IA aprende!',
          good: '⭐ Excelente! Você dominou o conteúdo!',
          needsReview: '📚 Revise o conteúdo. Leia as explicações com atenção!'
        }
      }
    }
  ],

  finalPlaygroundConfig: {
    id: 'pg-final-aula-2-trilha-1',
    type: 'guided-prompt-builder',
    title: 'Crie Seu Primeiro Pedido Personalizado',
    maiaIntro: 'Você aprendeu como a IA aprende com você. Agora vamos criar um pedido personalizado usando seus próprios gostos!',
    steps: [
      {
        stepNumber: 1,
        title: 'Escolha o que você quer',
        type: 'radio',
        question: 'O que você gostaria de receber?',
        options: [
          { 
            value: 'filme', 
            label: 'Sugestão de filme/série', 
            description: 'Receba recomendações personalizadas',
            icon: '🎬' 
          },
          { 
            value: 'musica', 
            label: 'Playlist personalizada', 
            description: 'Monte uma playlist perfeita',
            icon: '🎵' 
          },
          { 
            value: 'receita', 
            label: 'Receita baseada no seu gosto', 
            description: 'Encontre receitas que você vai amar',
            icon: '🍳' 
          },
          { 
            value: 'presente', 
            label: 'Ideia de presente', 
            description: 'Ache o presente perfeito',
            icon: '🎁' 
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Conte seus gostos',
        type: 'textarea',
        question: 'O que você costuma gostar?',
        placeholder: 'Ex: filmes de ação, comédias românticas, terror...',
        minLength: 10
      },
      {
        stepNumber: 3,
        title: 'Adicione contexto',
        type: 'radio',
        question: 'Para qual situação?',
        options: [
          { value: 'sozinho', label: 'Para assistir sozinho(a)', description: '', icon: '🧘' },
          { value: 'familia', label: 'Para ver com a família', description: '', icon: '👨‍👩‍👧‍👦' },
          { value: 'fimdesemana', label: 'Para o fim de semana', description: '', icon: '🎉' },
          { value: 'relaxar', label: 'Para relaxar depois do trabalho', description: '', icon: '😌' },
          { value: 'animar', label: 'Para animar o dia', description: '', icon: '✨' }
        ]
      }
    ]
  }
};

// Texto concatenado para geração de áudio (limpo, sem emojis/markdown)
import { cleanAudioText } from '@/lib/audioTextValidator';

export const fundamentos02AudioText = cleanAudioText(
  fundamentos02.sections
    .map(section => section.visualContent)
    .join('\n\n')
);
