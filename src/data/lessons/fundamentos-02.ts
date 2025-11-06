import { GuidedLessonData } from '@/types/guidedLesson';

// ID Interno: aula-2-trilha-1 (para referência humana)
export const fundamentos02: GuidedLessonData = {
  id: 'fundamentos-02',
  title: 'Como a IA Aprende com Você',
  trackId: 'trilha-1-fundamentos',
  trackName: 'Fundamentos da IA',
  duration: 360, // 6 minutos

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

É como ter um amigo que presta muita atenção no que você gosta e sempre tem a sugestão perfeita na hora certa! 💡`,
      spokenContent: 'Você já parou pra pensar como o Netflix sempre sabe o que você quer assistir? Ou como o Spotify cria aquela playlist que parece que foi feita especialmente pra você? O segredo está em como a Inteligência Artificial aprende. Ela observa tudo que você faz, identifica padrões e usa essas informações pra melhorar cada vez mais. É como ter um amigo que presta muita atenção no que você gosta e sempre tem a sugestão perfeita na hora certa!'
    },
    {
      id: 'secao-2',
      timestamp: 30,
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

**Quanto mais você usa, mais dados a IA tem. E mais dados significa sugestões cada vez melhores!** 📈`,
      spokenContent: 'Vamos usar o Netflix como exemplo. Toda vez que você assiste algo, a IA registra: qual gênero, quais atores, quanto tempo você assistiu, se você pulou a introdução, se assistiu até o final. Com milhões de pessoas fazendo isso, a IA começa a identificar padrões. Quem assistiu A também gostou de B. Quem para de assistir no episódio três geralmente não gosta desse tipo de série. Quanto mais você usa, mais dados a IA tem. E mais dados significa sugestões cada vez melhores!'
    },
    {
      id: 'secao-3',
      timestamp: 75,
      type: 'text',
      speechBubbleText: 'O Spotify conhece seus humores melhor que ninguém',
      visualContent: `## 🎵 Spotify e a mágica da música

O Spotify funciona parecido, mas vai além. Ele não só vê o que você ouve, mas **QUANDO** você ouve.

🌅 Segunda de manhã → você gosta de um estilo  
🌃 Sexta à noite → outro completamente diferente

A IA aprende seus **humores**, suas **rotinas**, até prevê o que você vai querer ouvir dependendo da hora do dia.

Por isso aquela playlist **"Descobertas da Semana"** parece mágica! ✨

Ela está literalmente aprendendo com você **24 horas por dia, 7 dias por semana**. 🔄`,
      spokenContent: 'O Spotify funciona parecido, mas vai além. Ele não só vê o que você ouve, mas QUANDO você ouve. Segunda de manhã você gosta de um estilo, sexta à noite é outro completamente diferente. A IA aprende seus humores, suas rotinas, até prevê o que você vai querer ouvir dependendo da hora do dia. Por isso aquela playlist Descobertas da Semana parece mágica! Ela está literalmente aprendendo com você vinte e quatro horas por dia, sete dias por semana.'
    },
    {
      id: 'secao-4-playground',
      timestamp: 120,
      type: 'playground',
      speechBubbleText: 'Vamos ver a IA aprendendo em tempo real!',
      visualContent: `## 🎮 Hora de descobrir como funciona

Incrível, né? A IA não é programada com gostos específicos. **Ela aprende observando o que VOCÊ faz!**

Agora que você entendeu o conceito, que tal descobrir na prática como isso funciona?

Vamos fazer um teste rápido onde você vai ver a IA aprendendo em tempo real! 🚀

É super rápido e você vai ter aquele momento **"aha!"** quando entender de verdade.

**Vamos lá?** 👇`,
      spokenContent: 'Incrível, né? A IA não é programada com gostos específicos. Ela aprende observando o que VOCÊ faz! Agora que você entendeu o conceito, que tal descobrir na prática como isso funciona? Vamos fazer um teste rápido onde você vai ver a IA aprendendo em tempo real! É super rápido e você vai ter aquele momento aha quando entender de verdade. Vamos lá?',
      playgroundConfig: {
        instruction: 'Veja a IA Aprendendo em Tempo Real',
        type: 'interactive-simulation',
        simulationConfig: {
          type: 'interactive-simulation',
          title: 'Veja a IA Aprendendo em Tempo Real',
          scenario: {
            icon: '🎬',
            text: 'Você acabou de criar uma conta no Netflix. Vamos ver como a IA aprende com suas escolhas!'
          },
          steps: [
            {
              step: 1,
              prompt: 'Escolha seu primeiro filme:',
              options: [
                { id: 'acao', title: 'Velozes e Furiosos', genre: 'Ação', emoji: '🚗' },
                { id: 'romance', title: 'Diário de uma Paixão', genre: 'Romance', emoji: '💕' },
                { id: 'comedia', title: 'Se Beber Não Case', genre: 'Comédia', emoji: '😂' }
              ],
              feedback: 'A IA registrou: você gostou de {genre}!'
            },
            {
              step: 2,
              prompt: 'Escolha outro filme:',
              options: 'dynamic',
              logic: 'Mostrar 2 filmes do mesmo gênero + 1 diferente',
              feedback: 'A IA está aprendendo! Ela notou seu padrão.'
            },
            {
              step: 3,
              prompt: 'Última escolha:',
              options: 'dynamic',
              logic: 'Mostrar 3 filmes do gênero favorito',
              feedback: 'Pronto! A IA já sabe o que você gosta! 🎯'
            }
          ],
          completion: {
            visual: 'Gráfico mostrando as preferências identificadas',
            message: 'Viu como funciona? A IA aprendeu seu gosto em apenas 3 escolhas! Imagina com centenas de filmes...',
            badge: {
              id: 'badge-entendeu-aprendizado',
              title: 'Entendeu o Aprendizado!',
              icon: '🧠'
            }
          }
        }
      }
    },
    {
      id: 'secao-5',
      timestamp: 180,
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

Por isso duas pessoas vendo o Instagram ao mesmo tempo veem coisas completamente diferentes. **Cada feed é único**, moldado pela IA que aprendeu com você! ✨`,
      spokenContent: 'As redes sociais usam o mesmo princípio, mas de um jeito ainda mais sofisticado. O Instagram analisa em quais fotos você para pra ver, quais você dá like, quais você só passa direto. O Facebook observa quais posts você lê até o final, quais você compartilha, com quem você mais interage. E usa tudo isso pra montar seu feed personalizado. Por isso duas pessoas vendo o Instagram ao mesmo tempo veem coisas completamente diferentes. Cada feed é único, moldado pela IA que aprendeu com você!'
    },
    {
      id: 'secao-6',
      timestamp: 240,
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

**Vai ser incrível!** ✨`,
      spokenContent: 'Aqui está o mais interessante: você não precisa fazer nada especial. Só de usar esses apps normalmente, você está ensinando a IA! Cada curtida, cada busca, cada clique é uma aula pra IA. E ela é uma aluna excelente - nunca esquece nada e está sempre melhorando. Agora você sabe o segredo! E nas próximas aulas, você vai aprender a usar esse conhecimento a seu favor, criando seus próprios comandos para IA. Vai ser incrível!'
    }
  ],

  exercisesConfig: [
    {
      id: 'ex-final-1-aula-2-trilha-1',
      type: 'drag-drop',
      title: 'O que cada IA Aprende?',
      instruction: 'Arraste cada item para a plataforma correta',
      data: {
        items: [
          { id: 'item-1', text: 'Filmes e séries que você assiste', correctZone: 'netflix' },
          { id: 'item-2', text: 'Músicas que você ouve em cada horário', correctZone: 'spotify' },
          { id: 'item-3', text: 'Fotos em que você para pra ver', correctZone: 'instagram' },
          { id: 'item-4', text: 'Posts que você lê completamente', correctZone: 'facebook' },
          { id: 'item-5', text: 'Se você assistiu até o final', correctZone: 'netflix' },
          { id: 'item-6', text: 'Quem você mais interage', correctZone: 'facebook' }
        ],
        zones: [
          { id: 'netflix', label: 'Netflix', icon: '🎬' },
          { id: 'spotify', label: 'Spotify', icon: '🎵' },
          { id: 'instagram', label: 'Instagram', icon: '📸' },
          { id: 'facebook', label: 'Facebook', icon: '👥' }
        ]
      }
    },
    {
      id: 'ex-final-2-aula-2-trilha-1',
      type: 'fill-in-blanks',
      title: 'Complete o que Você Aprendeu',
      instruction: 'Preencha as lacunas com as palavras corretas',
      data: {
        sentences: [
          {
            id: 'sent-1',
            text: 'Quanto mais você usa um app, mais _______ a IA tem para aprender.',
            correctAnswers: ['dados', 'informações', 'informação'],
            hint: 'O que a IA coleta de você?'
          },
          {
            id: 'sent-2',
            text: 'O Spotify não só aprende o que você ouve, mas também _______ você ouve.',
            correctAnswers: ['quando', 'a hora que', 'o horário que'],
            hint: 'Pense no tempo...'
          },
          {
            id: 'sent-3',
            text: 'Você está ensinando IA toda vez que _______ um app normalmente.',
            correctAnswers: ['usa', 'utiliza', 'mexe'],
            hint: 'O que você faz com apps?'
          }
        ],
        feedback: {
          allCorrect: 'Excelente! Você dominou o conceito! 🎯',
          someCorrect: 'Bom trabalho! Você acertou {count} de 3.',
          needsReview: 'Vamos revisar? A IA aprende observando seus dados e quando você age.'
        }
      }
    },
    {
      id: 'ex-final-3-aula-2-trilha-1',
      type: 'true-false',
      title: 'Verdadeiro ou Falso?',
      instruction: 'Marque se cada afirmação é verdadeira ou falsa',
      data: {
        statements: [
          {
            id: 'tf-1',
            text: 'A IA precisa que você ensine manualmente o que você gosta',
            correct: false,
            explanation: 'Falso! A IA aprende sozinha só observando o que você faz.'
          },
          {
            id: 'tf-2',
            text: 'Quanto mais você usa um app, melhor a IA fica',
            correct: true,
            explanation: 'Verdadeiro! Mais uso = mais dados = IA mais inteligente.'
          },
          {
            id: 'tf-3',
            text: 'Duas pessoas veem o mesmo feed no Instagram',
            correct: false,
            explanation: 'Falso! Cada feed é personalizado pela IA que aprendeu com você.'
          },
          {
            id: 'tf-4',
            text: 'O Netflix sabe se você assistiu até o final de um episódio',
            correct: true,
            explanation: 'Verdadeiro! A IA registra tudo que você faz pra aprender melhor.'
          }
        ],
        feedback: {
          perfect: 'Perfeito! Você dominou como a IA aprende! 🏆',
          good: 'Muito bem! Você entendeu a maior parte!',
          needsReview: 'Que tal revisar a aula? O conceito principal é que a IA aprende observando.'
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

// Texto concatenado para geração de áudio (será usado no AdminAudioGenerator)
export const fundamentos02AudioText = fundamentos02.sections
  .map(section => section.spokenContent)
  .join('\n\n---\n\n');
