import { GuidedLessonData } from '@/types/guidedLesson';

export const fundamentos02: GuidedLessonData = {
  id: 'fundamentos-02',
  title: 'Principais Ferramentas Gratuitas',
  trackId: '1',
  trackName: 'Fundamentos da IA',
  duration: 310,
  exercisesConfig: [
    {
      id: 'ex-complete-sentence',
      type: 'complete-sentence',
      title: 'Complete as Frases',
      instruction: 'Complete cada frase com a ferramenta correta:',
      data: {
        sentences: [
          {
            id: '1',
            text: 'Se eu preciso pesquisar informações atualizadas da internet, devo usar o ___________.',
            correctAnswers: ['Google Gemini', 'Gemini', 'google gemini', 'gemini']
          },
          {
            id: '2',
            text: 'Para escrever um email profissional rápido, a ferramenta mais popular é o ___________.',
            correctAnswers: ['ChatGPT', 'Chat GPT', 'chatgpt', 'chat gpt']
          },
          {
            id: '3',
            text: 'Se vou analisar um contrato longo e complexo, o ___________ seria ideal por ser mais detalhista.',
            correctAnswers: ['Claude', 'claude']
          }
        ]
      }
    }
  ],
  sections: [
    {
      id: 'tres-ferramentas',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Você só precisa conhecer três ferramentas!',
      visualContent: `# As três ferramentas essenciais 🎯

Existem **dezenas de ferramentas de IA** disponíveis hoje, mas você só precisa conhecer **três para começar**:

## 🤖 ChatGPT | 🌟 Google Gemini | 💎 Claude

Todas são **completamente gratuitas** e podem resolver **90% das suas necessidades** no dia a dia.

Pense nelas como **três assistentes inteligentes**, cada um com suas especialidades.

---

### A melhor parte?

**Você não precisa escolher apenas uma!**

Muitas pessoas usam as **três no mesmo dia** para tarefas diferentes, aproveitando o melhor de cada ferramenta.

> 💡 Vamos conhecer cada uma delas e descobrir quando usar cada ferramenta!`,
      spokenContent: `Existem dezenas de ferramentas de IA disponíveis hoje, mas você só precisa conhecer três para começar: ChatGPT, Google Gemini e Claude.

Todas são completamente gratuitas e podem resolver noventa por cento das suas necessidades no dia a dia. Pense nelas como três assistentes inteligentes, cada um com suas especialidades.

A melhor parte? Você não precisa escolher apenas uma. Muitas pessoas usam as três no mesmo dia para tarefas diferentes!`
    },
    {
      id: 'chatgpt',
      timestamp: 60,
      type: 'text',
      speechBubbleText: 'ChatGPT é a mais famosa!',
      visualContent: `## ChatGPT - O mais popular 🚀

O **ChatGPT** é a ferramenta de IA mais conhecida do mundo, criada pela **OpenAI**.

É como ter um **assistente que sabe conversar sobre qualquer assunto** de forma natural.

### Melhor para:

- ✍️ **Escrever emails e textos profissionais**
- 💡 **Tirar dúvidas e aprender coisas novas**
- 📋 **Criar listas, roteiros e resumos**
- 🎨 **Gerar ideias criativas**

---

### Como usar:

1. Acesse **chat.openai.com**
2. Crie uma **conta gratuita**
3. Comece a **conversar**

É realmente **tão simples quanto parece!**

> 🎯 ChatGPT é perfeito para começar sua jornada em IA. Interface intuitiva e resultados impressionantes!`,
      spokenContent: `O ChatGPT é a ferramenta de IA mais conhecida do mundo, criada pela OpenAI. É como ter um assistente que sabe conversar sobre qualquer assunto de forma natural.

Melhor para: escrever emails e textos profissionais, tirar dúvidas e aprender coisas novas, criar listas, roteiros e resumos, e gerar ideias criativas.

Para usar, basta acessar chat ponto openai ponto com, criar uma conta gratuita e começar a conversar. É realmente tão simples quanto parece!`
    },
    {
      id: 'google-gemini',
      timestamp: 120,
      type: 'text',
      speechBubbleText: 'Gemini se conecta com tudo do Google!',
      visualContent: `## Google Gemini - Integração poderosa 🌐

O **Gemini** é a resposta do Google para a IA conversacional.

Sua grande vantagem é estar **conectado com todo o ecossistema Google**:

### Integrado com:

- 📧 **Gmail** - Escreve e organiza emails
- 📁 **Drive** - Trabalha com seus arquivos
- 🗺️ **Maps** - Planeja rotas e viagens
- 📺 **YouTube** - Encontra e resume vídeos

---

### Melhor para:

- 🔍 **Pesquisar informações atualizadas na internet**
- 💾 **Trabalhar com seus arquivos do Google Drive**
- ✈️ **Planejar viagens com rotas e mapas**
- 🎬 **Encontrar e resumir vídeos do YouTube**

---

### Como usar:

Acesse **gemini.google.com** com sua conta Google.

> 💡 Se você já usa Gmail ou Drive, vai **adorar essa integração automática!**`,
      spokenContent: `O Gemini é a resposta do Google para a IA conversacional. Sua grande vantagem é estar conectado com todo o ecossistema Google: Gmail, Drive, Maps, YouTube e muito mais.

Melhor para: pesquisar informações atualizadas na internet, trabalhar com seus arquivos do Google Drive, planejar viagens com rotas e mapas, e encontrar e resumir vídeos do YouTube.

Acesse gemini ponto google ponto com com sua conta Google. Se você já usa Gmail ou Drive, vai adorar essa integração automática!`
    },
    {
      id: 'transition-to-playground',
      timestamp: 175,
      type: 'text',
      speechBubbleText: 'Hora de praticar! 🎮',
      visualContent: `## 🎮 Hora de Praticar!

Muito bem! Você acabou de conhecer as **três principais ferramentas de IA**:

- 💬 **ChatGPT** para o dia a dia
- 🔍 **Gemini** para pesquisas e Google
- 📄 **Claude** para textos longos

Mas aprender só na teoria não basta, né? Agora é hora de **colocar a mão na massa**! 

Vamos fazer um teste rápido no nosso **playground** para você ver como funciona na prática.

Fique tranquilo, é bem simples e rapidinho! Vamos lá para o **playground**! 🚀`,
      spokenContent: 'Muito bem! Você acabou de conhecer as três principais ferramentas de IA: ChatGPT para o dia a dia, Gemini para pesquisas e integração com Google, e Claude para textos longos. Mas aprender só na teoria não basta, né? Agora é hora de colocar a mão na massa! Vamos fazer um teste rápido no nosso playground para você ver como funciona na prática. Fique tranquilo, é bem simples e rapidinho! Vamos lá para o playground!'
    },
    {
      id: 'playground-mid',
      timestamp: 180,
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
          title: 'Playground: Teste Rápido',
          maiaMessage: 'Você acabou de aprender sobre ChatGPT, Gemini e Claude. Agora vamos testar na prática criando um prompt REAL!',
          scenario: {
            title: 'Situação Real:',
            description: 'Imagine que você precisa escrever um email profissional para um fornecedor pedindo orçamento de produtos.'
          },
          prefilledText: 'Use o ChatGPT para escrever',
          userPlaceholder: 'um email para meu fornecedor pedindo orçamento de 100 unidades do produto X, com tom formal e objetivo',
          validation: {
            minLength: 30,
            requiredKeywords: [
              ['fornecedor', 'cliente', 'para'],
              ['formal', 'profissional', 'tom']
            ],
            feedback: {
              tooShort: 'Continue... seu prompt está muito curto!',
              good: 'Bom! Agora defina melhor o tom e o destinatário.',
              excellent: 'Perfeito! Seu prompt está completo e bem estruturado! 🎯'
            }
          }
        }
      }
    },
    {
      id: 'claude',
      timestamp: 190,
      type: 'text',
      speechBubbleText: 'Claude é o mais detalhista!',
      visualContent: `## Claude - Para textos longos e detalhados 📚

**Claude**, desenvolvido pela Anthropic, é especialmente bom quando você precisa de **textos mais longos**, **análises detalhadas** ou trabalhar com **documentos complexos**.

### Melhor para:

- 📄 **Escrever relatórios e documentos longos**
- ⚖️ **Analisar contratos e textos jurídicos**
- 💭 **Ter conversas mais profundas e reflexivas**
- 📎 **Trabalhar com arquivos PDF e documentos**

---

### Como usar:

Acesse **claude.ai** e crie sua conta gratuita.

### Por que Claude se destaca?

Claude tem reputação de ser **mais cuidadoso e preciso**, ideal para trabalhos que exigem **atenção aos detalhes!**

> 🎯 Perfeito para quem precisa de qualidade premium em textos profissionais e análises complexas.`,
      spokenContent: `Claude, desenvolvido pela Anthropic, é especialmente bom quando você precisa de textos mais longos, análises detalhadas ou trabalhar com documentos complexos.

Melhor para: escrever relatórios e documentos longos, analisar contratos e textos jurídicos, ter conversas mais profundas e reflexivas, e trabalhar com arquivos PDF e documentos.

Acesse claude ponto ai e crie sua conta gratuita. Claude tem reputação de ser mais cuidadoso e preciso, ideal para trabalhos que exigem atenção aos detalhes!`
    },
    {
      id: 'escolhendo-ferramenta',
      timestamp: 250,
      type: 'text',
      speechBubbleText: 'Agora você sabe qual usar!',
      visualContent: `## Como escolher a ferramenta certa 🎯

Agora você conhece as **três principais ferramentas**. Aqui vai um guia rápido de **quando usar cada uma**:

### Guia Rápido:

| Situação | Ferramenta Ideal |
|----------|------------------|
| 📝 Tarefas rápidas e gerais | **ChatGPT** |
| 🔍 Pesquisas e integração Google | **Gemini** |
| 📚 Textos longos e análises | **Claude** |

---

### A verdade é que todas são excelentes!

Com o tempo você vai descobrir **sua favorita**, mas é muito útil conhecer as três.

Muitos **profissionais alternam** entre elas dependendo da tarefa específica.

---

### 🚀 O mais importante?

**Comece hoje mesmo!**

1. ✅ Crie sua conta em **pelo menos uma** delas
2. ✅ Faça seu **primeiro teste**
3. ✅ Experimente fazer uma **pergunta simples**

> 💡 Você vai se surpreender com o quanto elas podem **facilitar sua vida!**

**Preparado para o próximo passo?**`,
      spokenContent: `Agora você conhece as três principais ferramentas. Aqui vai um guia rápido de quando usar cada uma:

Para tarefas rápidas e gerais, use ChatGPT. Para pesquisas e integração Google, use Gemini. Para textos longos e análises, use Claude.

A verdade é que todas são excelentes! Com o tempo você vai descobrir sua favorita, mas é muito útil conhecer as três. Muitos profissionais alternam entre elas dependendo da tarefa.

O mais importante? Comece hoje mesmo! Crie sua conta em pelo menos uma delas e faça seu primeiro teste. Você vai se surpreender com o quanto elas podem facilitar sua vida!`
    },
    {
      id: 'fim-audio',
      timestamp: 310,
      type: 'end-audio',
      speechBubbleText: 'Aula completa! Parabéns!',
      visualContent: '',
      spokenContent: ''
    }
  ]
};

// Texto completo para geração de áudio
export const fundamentos02AudioText = `
Existem dezenas de ferramentas de IA disponíveis hoje, mas você só precisa conhecer três para começar: ChatGPT, Google Gemini e Claude.

Todas são completamente gratuitas e podem resolver noventa por cento das suas necessidades no dia a dia. Pense nelas como três assistentes inteligentes, cada um com suas especialidades.

A melhor parte? Você não precisa escolher apenas uma. Muitas pessoas usam as três no mesmo dia para tarefas diferentes!

O ChatGPT é a ferramenta de IA mais conhecida do mundo, criada pela OpenAI. É como ter um assistente que sabe conversar sobre qualquer assunto de forma natural.

Melhor para: escrever emails e textos profissionais, tirar dúvidas e aprender coisas novas, criar listas, roteiros e resumos, e gerar ideias criativas.

Para usar, basta acessar chat ponto openai ponto com, criar uma conta gratuita e começar a conversar. É realmente tão simples quanto parece!

O Gemini é a resposta do Google para a IA conversacional. Sua grande vantagem é estar conectado com todo o ecossistema Google: Gmail, Drive, Maps, YouTube e muito mais.

Melhor para: pesquisar informações atualizadas na internet, trabalhar com seus arquivos do Google Drive, planejar viagens com rotas e mapas, e encontrar e resumir vídeos do YouTube.

Acesse gemini ponto google ponto com com sua conta Google. Se você já usa Gmail ou Drive, vai adorar essa integração automática!

Claude, desenvolvido pela Anthropic, é especialmente bom quando você precisa de textos mais longos, análises detalhadas ou trabalhar com documentos complexos.

Melhor para: escrever relatórios e documentos longos, analisar contratos e textos jurídicos, ter conversas mais profundas e reflexivas, e trabalhar com arquivos PDF e documentos.

Acesse claude ponto ai e crie sua conta gratuita. Claude tem reputação de ser mais cuidadoso e preciso, ideal para trabalhos que exigem atenção aos detalhes!

Agora você conhece as três principais ferramentas. Aqui vai um guia rápido de quando usar cada uma:

Para tarefas rápidas e gerais, use ChatGPT. Para pesquisas e integração Google, use Gemini. Para textos longos e análises, use Claude.

A verdade é que todas são excelentes! Com o tempo você vai descobrir sua favorita, mas é muito útil conhecer as três. Muitos profissionais alternam entre elas dependendo da tarefa.

O mais importante? Comece hoje mesmo! Crie sua conta em pelo menos uma delas e faça seu primeiro teste. Você vai se surpreender com o quanto elas podem facilitar sua vida!
`.trim();
