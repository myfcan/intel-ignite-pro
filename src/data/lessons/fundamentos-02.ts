import { GuidedLessonData } from '@/types/guidedLesson';

export const fundamentos02: GuidedLessonData = {
  id: 'fundamentos-02',
  title: 'Reconhecendo IA no dia a dia',
  trackId: '1',
  trackName: 'Fundamentos da IA',
  duration: 187,
  exercisesConfig: [
    {
      id: 'ex-complete-sentence',
      type: 'complete-sentence',
      title: 'Identifique a IA',
      instruction: 'Complete cada frase sobre IA no cotidiano:',
      data: {
        sentences: [
          {
            id: '1',
            text: 'Quando o ___________ sugere filmes baseados no que você já assistiu, está usando IA.',
            correctAnswers: ['Netflix', 'netflix']
          },
          {
            id: '2',
            text: 'O ___________ usa IA para corrigir automaticamente palavras digitadas erradas.',
            correctAnswers: ['WhatsApp', 'Whatsapp', 'whatsapp']
          },
          {
            id: '3',
            text: 'Assistentes como Alexa, ___________ e Siri são exemplos de IA avançada.',
            correctAnswers: ['Google Assistant', 'Google', 'google assistant', 'google']
          }
        ]
      }
    }
  ],
  sections: [
    {
      id: 'ia-em-todo-lugar',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'A IA já faz parte da sua vida!',
      visualContent: `# IA está em todo lugar! 🤖

Você sabia que você já usa **inteligência artificial** várias vezes por dia, mesmo sem perceber?

A IA está presente:

- 📱 No seu **celular** quando você desbloqueia com o rosto
- 🎬 No **Netflix** quando ele sugere filmes que você vai gostar
- 💬 No **WhatsApp** quando ele corrige suas palavras
- 🗺️ No **Google Maps** quando ele te mostra o melhor caminho

---

### A verdade é que...

**A IA já faz parte da sua vida há muito tempo!**

E agora você vai aprender a **reconhecer onde ela está** e como usar isso **a seu favor**.

> 💡 Prepare-se para descobrir um mundo de possibilidades que já está ao seu alcance!`,
      spokenContent: `Você sabia que você já usa inteligência artificial várias vezes por dia, mesmo sem perceber?

A IA está presente no seu celular quando você desbloqueia com o rosto, no Netflix quando ele sugere filmes que você vai gostar, no WhatsApp quando ele corrige suas palavras, e até no Google Maps quando ele te mostra o melhor caminho.

A verdade é que a IA já faz parte da sua vida há muito tempo! E agora você vai aprender a reconhecer onde ela está e como usar isso a seu favor.`
    },
    {
      id: 'netflix-spotify',
      timestamp: 33,
      type: 'text',
      speechBubbleText: 'Netflix e Spotify conhecem você!',
      visualContent: `## Como Netflix e Spotify te conhecem tão bem? 🎬🎵

Sabe aquela sensação de que o **Netflix conhece seu gosto?** Ou quando o **Spotify** monta aquela playlist perfeita?

### Isso é inteligência artificial! 🤖

Essas plataformas:

- 👀 **Analisam** tudo que você assiste e ouve
- 🧠 **Usam IA** para entender seus gostos
- 📈 **Aprendem** mais sobre você a cada uso
- 🎯 **Melhoram** as sugestões continuamente

---

### É como ter um amigo que...

✨ Conhece **perfeitamente** seu gosto  
✨ Está **sempre atento** ao que você gosta  
✨ **Nunca esquece** suas preferências  
✨ Sempre te indica coisas **incríveis!**

> 💡 Quanto mais você usa, mais a IA aprende e melhores ficam as recomendações!`,
      spokenContent: `Sabe aquela sensação de que o Netflix conhece seu gosto? Ou quando o Spotify monta aquela playlist perfeita? Isso é inteligência artificial!

Essas plataformas analisam tudo que você assiste e ouve, e usam IA para entender seus gostos. Quanto mais você usa, mais a IA aprende sobre você e melhores ficam as sugestões.

É como ter um amigo que conhece perfeitamente seu gosto e sempre te indica coisas incríveis!`
    },
    {
      id: 'redes-sociais',
      timestamp: 66,
      type: 'text',
      speechBubbleText: 'Redes sociais usam IA o tempo todo!',
      visualContent: `## Redes Sociais e a IA Invisível 📱

Já reparou como o **Instagram** e o **Facebook** sempre mostram posts de assuntos que você gosta?

Ou como aparecem **anúncios de produtos** que você estava pensando em comprar?

### Isso também é inteligência artificial! 🎯

A IA das redes sociais:

- 👍 Analisa o que você **curte**
- 💬 Observa o que você **comenta**
- 🔄 Monitora o que você **compartilha**
- 🎨 **Personaliza** tudo que você vê

---

### O resultado?

A IA está **constantemente aprendendo** sobre seus interesses para tornar sua experiência **melhor e mais relevante**.

É como ter um feed **feito sob medida** só para você!

> 💡 Cada interação ensina a IA um pouco mais sobre o que você gosta!`,
      spokenContent: `Já reparou como o Instagram e o Facebook sempre mostram posts de assuntos que você gosta? Ou como aparecem anúncios de produtos que você estava pensando em comprar?

Isso também é inteligência artificial! Ela analisa o que você curte, comenta e compartilha, e usa essas informações para personalizar o que você vê.

A IA está constantemente aprendendo sobre seus interesses para tornar sua experiência melhor.`
    },
    {
      id: 'transition-to-playground',
      timestamp: 96,
      type: 'text',
      speechBubbleText: 'Hora de praticar! 🎮',
      visualContent: `## 🎮 Hora de Praticar!

Muito bem! Você acabou de descobrir que **já usa IA todos os dias** sem perceber!

### Legal, né? 🌟

Mas não para por aí! Agora você pode usar IA de forma:

- 🎯 **Consciente** - sabendo o que está fazendo
- 💡 **Intencional** - para objetivos específicos
- ⚡ **Eficiente** - facilitando ainda mais sua vida

---

### Que tal um teste rápido?

Vamos ver se você consegue **identificar onde mais a IA está presente!**

É rapidinho e bem **divertido!** 🚀

> 💪 Vamos lá?`,
      spokenContent: `Muito bem! Você acabou de descobrir que já usa IA todos os dias sem perceber! Legal, né?

Mas não para por aí. Agora você pode usar IA de forma consciente e intencional para facilitar ainda mais sua vida. Que tal fazer um teste rápido pra ver se você consegue identificar onde mais a IA está presente?

É rapidinho e bem divertido! Vamos lá?`
    },
    {
      id: 'playground-mid',
      timestamp: 122,
      type: 'playground',
      speechBubbleText: '',
      visualContent: '',
      spokenContent: '',
      playgroundConfig: {
        instruction: '',
        type: 'real-playground',
        triggerKeyword: 'playground',
        triggerAfterSection: 3,
        realConfig: {
          type: 'real-playground',
          title: 'Playground: Reconheça a IA!',
          maiaMessage: 'Você acabou de aprender onde a IA está presente no seu dia a dia. Agora me diga: onde VOCÊ percebe a IA na SUA vida?',
          scenario: {
            title: 'Reflita sobre sua experiência:',
            description: 'Pense em uma situação do seu dia a dia onde você usa IA sem perceber.'
          },
          prefilledText: 'Eu percebo a IA quando',
          userPlaceholder: 'o Google me sugere respostas antes de terminar de digitar / meu banco detecta transações suspeitas / etc...',
          validation: {
            minLength: 20,
            requiredKeywords: [
              ['quando', 'onde', 'uso', 'percebo', 'vejo'],
              ['app', 'celular', 'google', 'aplicativo', 'site', 'internet', 'assistente', 'banco', 'whatsapp', 'instagram', 'facebook', 'netflix', 'spotify']
            ],
            feedback: {
              tooShort: 'Continue... descreva melhor a situação!',
              good: 'Bom! Agora seja mais específico sobre ONDE você percebe isso.',
              excellent: 'Perfeito! Você está reconhecendo a IA no seu cotidiano! 🎯'
            }
          }
        }
      }
    },
    {
      id: 'whatsapp-assistentes',
      timestamp: 123,
      type: 'text',
      speechBubbleText: 'Assistentes virtuais são IA pura!',
      visualContent: `## WhatsApp e Assistentes Virtuais 🤖💬

O **WhatsApp** também usa IA de várias formas!

### WhatsApp + IA:

- 💬 Sugere **respostas rápidas**
- ✍️ Corrige palavras **automaticamente**
- 🚫 Identifica **spam**
- 🔔 Prioriza **mensagens importantes**

---

### E os Assistentes Virtuais?

**Alexa, Google Assistant e Siri** são **pura inteligência artificial!**

Eles são capazes de:

- 🎤 **Entender** sua voz
- 🧠 **Processar** o que você pediu
- ⚙️ **Executar** tarefas complexas
- 💡 **Aprender** com suas preferências

---

### Exemplos práticos:

Cada vez que você pede:

- *"Alexa, qual a previsão do tempo?"* ☀️
- *"Ok Google, toca uma música"* 🎵

**Você está usando IA avançada!**

> 🚀 É tecnologia de ponta funcionando para tornar sua vida mais fácil!`,
      spokenContent: `O WhatsApp também usa IA de várias formas! Quando ele sugere respostas rápidas, quando corrige suas palavras automaticamente, ou quando identifica spam.

E os assistentes como Alexa, Google Assistant e Siri? São pura inteligência artificial! Eles entendem sua voz, processam o que você pediu e executam tarefas.

Cada vez que você pede "Alexa, qual a previsão do tempo?" ou "Ok Google, toca uma música", você está usando IA avançada!`
    },
    {
      id: 'seu-superpoder',
      timestamp: 156,
      type: 'text',
      speechBubbleText: 'Você tem um novo superpoder! 💪',
      visualContent: `## Seu Novo Superpoder! 💪✨

Agora você tem um **superpoder**: consegue identificar onde a IA está trabalhando!

### E o melhor de tudo?

Você aprendeu que a IA **não é algo complicado ou distante**. 

Ela **já está aqui**, facilitando sua vida **todos os dias**! 🌟

---

### O que vem agora?

Nas **próximas aulas**, você vai aprender a usar ferramentas de IA de forma consciente para:

- ⏰ **Economizar tempo** em tarefas repetitivas
- 💡 **Ter ideias criativas** quando precisar
- 🎯 **Resolver problemas** de forma mais eficiente

---

### 🚀 O futuro já começou!

E você está **pronto** para aproveitar todas as possibilidades que a IA oferece!

> 💎 Continue explorando e descobrindo novas formas de usar a IA a seu favor!

**Preparado para a próxima jornada?** 🌈`,
      spokenContent: `Agora você tem um superpoder: consegue identificar onde a IA está trabalhando! E o melhor: você aprendeu que ela não é algo complicado ou distante.

A IA já está aqui, facilitando sua vida todos os dias. E nas próximas aulas, você vai aprender a usar ferramentas de IA de forma consciente para economizar tempo, ter ideias criativas e resolver problemas.

O futuro já começou, e você está pronto pra aproveitar!`
    },
    {
      id: 'fim-audio',
      timestamp: 187,
      type: 'end-audio',
      speechBubbleText: 'Aula completa! Parabéns!',
      visualContent: '',
      spokenContent: ''
    }
  ]
};

// Texto completo para geração de áudio
export const fundamentos02AudioText = `
Você sabia que você já usa inteligência artificial várias vezes por dia, mesmo sem perceber?

A IA está presente no seu celular quando você desbloqueia com o rosto, no Netflix quando ele sugere filmes que você vai gostar, no WhatsApp quando ele corrige suas palavras, e até no Google Maps quando ele te mostra o melhor caminho.

A verdade é que a IA já faz parte da sua vida há muito tempo! E agora você vai aprender a reconhecer onde ela está e como usar isso a seu favor.

Sabe aquela sensação de que o Netflix conhece seu gosto? Ou quando o Spotify monta aquela playlist perfeita? Isso é inteligência artificial!

Essas plataformas analisam tudo que você assiste e ouve, e usam IA para entender seus gostos. Quanto mais você usa, mais a IA aprende sobre você e melhores ficam as sugestões.

É como ter um amigo que conhece perfeitamente seu gosto e sempre te indica coisas incríveis!

Já reparou como o Instagram e o Facebook sempre mostram posts de assuntos que você gosta? Ou como aparecem anúncios de produtos que você estava pensando em comprar?

Isso também é inteligência artificial! Ela analisa o que você curte, comenta e compartilha, e usa essas informações para personalizar o que você vê.

A IA está constantemente aprendendo sobre seus interesses para tornar sua experiência melhor.

Muito bem! Você acabou de descobrir que já usa IA todos os dias sem perceber! Legal, né?

Mas não para por aí. Agora você pode usar IA de forma consciente e intencional para facilitar ainda mais sua vida. Que tal fazer um teste rápido pra ver se você consegue identificar onde mais a IA está presente?

É rapidinho e bem divertido! Vamos lá?

O WhatsApp também usa IA de várias formas! Quando ele sugere respostas rápidas, quando corrige suas palavras automaticamente, ou quando identifica spam.

E os assistentes como Alexa, Google Assistant e Siri? São pura inteligência artificial! Eles entendem sua voz, processam o que você pediu e executam tarefas.

Cada vez que você pede "Alexa, qual a previsão do tempo?" ou "Ok Google, toca uma música", você está usando IA avançada!

Agora você tem um superpoder: consegue identificar onde a IA está trabalhando! E o melhor: você aprendeu que ela não é algo complicado ou distante.

A IA já está aqui, facilitando sua vida todos os dias. E nas próximas aulas, você vai aprender a usar ferramentas de IA de forma consciente para economizar tempo, ter ideias criativas e resolver problemas.

O futuro já começou, e você está pronto pra aproveitar!
`.trim();
