import { GuidedLessonData } from '@/types/guidedLesson';

export const fundamentos03: GuidedLessonData = {
  id: '33333333-3333-3333-3333-333333333303',
  title: 'As 3 Ferramentas de IA que Você Precisa Conhecer',
  trackId: 'efa0c22c-26fb-44d2-b1dc-721724ca5c5b',
  trackName: 'Fundamentos de IA',
  duration: 0, // Will be updated after audio generation
  contentVersion: 1,
  
  sections: [
    {
      id: 'intro',
      title: 'Introdução',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Vamos descobrir as 3 ferramentas essenciais de IA! 🚀',
      visualContent: `# As 3 Ferramentas Essenciais 🎯

Hoje você vai conhecer as **3 principais ferramentas de IA** que podem transformar seu dia a dia.

Cada uma tem um superpoder único! ✨`,
      spokenContent: 'Olá! Hoje vamos descobrir juntos as três ferramentas de inteligência artificial mais importantes que você precisa conhecer. Cada uma delas tem características únicas e pode ser usada em situações diferentes. Vamos começar essa jornada?'
    },
    
    {
      id: 'chatgpt-intro',
      title: 'ChatGPT - O Conversador',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Conheça o ChatGPT - seu assistente virtual! 💬',
      visualContent: `## 🤖 ChatGPT - O Conversador Inteligente

### O que é?
O **ChatGPT** é como ter um assistente pessoal que entende você e pode ajudar com quase tudo!

### Principais características:
- 💬 **Conversa natural** - Entende contexto e mantém diálogo
- 🧠 **Versátil** - Resolve diversos tipos de problemas
- 📝 **Criativo** - Cria textos, ideias e soluções`,
      spokenContent: 'Vamos começar com o ChatGPT. O ChatGPT é como ter um assistente pessoal super inteligente disponível 24 horas por dia. Ele foi criado pela empresa OpenAI e é especializado em manter conversas naturais. O grande diferencial do ChatGPT é sua capacidade de entender o contexto da conversa e lembrar do que vocês já conversaram. Isso significa que você pode fazer perguntas de acompanhamento, pedir para ele melhorar uma resposta ou explorar um tópico mais profundamente.'
    },
    
    {
      id: 'chatgpt-uses',
      title: 'Quando usar ChatGPT',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Veja quando o ChatGPT brilha! ⭐',
      visualContent: `## Quando usar o ChatGPT? 🎯

### ✅ Perfeito para:
- 📧 **Escrever e-mails** profissionais
- 📚 **Resumir textos** longos
- 💡 **Brainstorming** de ideias
- 🎓 **Aprender** novos conceitos
- 🔍 **Pesquisar** informações
- ✍️ **Revisar** textos

### Exemplo prático:
"Me ajude a escrever um e-mail profissional pedindo um aumento de salário"`,
      spokenContent: 'Mas quando você deve usar o ChatGPT especificamente? Ele é perfeito quando você precisa de ajuda com texto e comunicação. Por exemplo, escrever e-mails profissionais, criar apresentações, resumir documentos longos, fazer brainstorming de ideias ou até mesmo aprender um novo conceito. O ChatGPT também é excelente para revisar seus textos e sugerir melhorias. A chave é: se envolve palavras e ideias, o ChatGPT provavelmente pode ajudar.'
    },
    
    {
      id: 'quiz-chatgpt',
      title: 'Quiz ChatGPT',
      timestamp: 0,
      type: 'playground',
      speechBubbleText: 'Vamos testar seu conhecimento! 🎮',
      visualContent: '',
      spokenContent: 'Agora que você conhece o ChatGPT, vamos testar o que aprendeu com algumas perguntas rápidas!',
      playgroundConfig: {
        instruction: 'Responda as questões sobre o ChatGPT',
        type: 'interactive-quiz',
        triggerAfterSection: 2,
      }
    },
    
    {
      id: 'midjourney-intro',
      title: 'Midjourney - O Artista',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Conheça o Midjourney - o criador de imagens! 🎨',
      visualContent: `## 🎨 Midjourney - O Artista Digital

### O que é?
O **Midjourney** transforma suas palavras em imagens incríveis!

### Principais características:
- 🖼️ **Gerador de imagens** - Cria visuais a partir de texto
- 🎭 **Altamente artístico** - Resultados impressionantes
- 🌈 **Diversos estilos** - Realista, cartoon, pintura, etc.
- ⚡ **Rápido** - Gera imagens em segundos`,
      spokenContent: 'Agora vamos conhecer uma ferramenta completamente diferente: o Midjourney. Enquanto o ChatGPT trabalha com texto, o Midjourney é especializado em criar imagens. Você descreve o que quer ver usando palavras, e ele transforma sua descrição em uma imagem real. É como ter um artista profissional à sua disposição! O Midjourney é conhecido por criar imagens extremamente detalhadas e artísticas, com diversos estilos disponíveis.'
    },
    
    {
      id: 'midjourney-uses',
      title: 'Quando usar Midjourney',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Descubra o poder do Midjourney! 🌟',
      visualContent: `## Quando usar o Midjourney? 🎯

### ✅ Perfeito para:
- 🖼️ **Criar logos** e identidade visual
- 📱 **Imagens para redes sociais**
- 🎨 **Ilustrações** para conteúdo
- 🏠 **Visualizar ideias** de design
- 📚 **Capas** de livros e materiais
- 🎭 **Arte conceitual**

### Exemplo prático:
"Um logo moderno para uma cafeteria, estilo minimalista, cores quentes"`,
      spokenContent: 'Quando você deve usar o Midjourney? Sempre que precisar de imagens visuais. Criar logos para seu negócio, ilustrações para suas redes sociais, imagens para apresentações, visualizar como seria um produto ou espaço, criar capas para materiais digitais. Se você precisa de uma imagem e não quer usar fotos genéricas de banco de imagens, o Midjourney é sua melhor escolha. Ele te dá originalidade e personalização.'
    },
    
    {
      id: 'claude-intro',
      title: 'Claude - O Analista',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Conheça o Claude - o especialista em análise! 📊',
      visualContent: `## 📊 Claude - O Analista Profundo

### O que é?
O **Claude** é especialista em análise de documentos e trabalhos complexos!

### Principais características:
- 📄 **Analisa documentos** - Pode ler PDFs, planilhas, etc.
- 🔍 **Contexto grande** - Processa MUITO texto de uma vez
- 🎯 **Preciso** - Excelente para trabalho detalhado
- 📊 **Analítico** - Ótimo com dados e números`,
      spokenContent: 'Por último, mas não menos importante, temos o Claude. O Claude, criado pela Anthropic, é o especialista em análise e trabalho com documentos. Sua grande vantagem é a capacidade de processar uma quantidade enorme de informação de uma só vez. Ele pode ler documentos inteiros, analisar planilhas complexas e fazer conexões entre diferentes partes de um texto longo. É como ter um analista super detalhista que nunca se cansa.'
    },
    
    {
      id: 'claude-uses',
      title: 'Quando usar Claude',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Veja onde o Claude se destaca! 💪',
      visualContent: `## Quando usar o Claude? 🎯

### ✅ Perfeito para:
- 📑 **Analisar contratos** e documentos longos
- 📊 **Revisar planilhas** e relatórios
- 🔍 **Comparar versões** de documentos
- 📝 **Extrair informações** específicas
- 🧮 **Trabalhar com dados** complexos
- ⚖️ **Análises detalhadas** e precisas

### Exemplo prático:
"Analise este contrato e me diga os principais pontos de atenção"`,
      spokenContent: 'Então, quando usar o Claude? Ele é perfeito para trabalhos que exigem análise profunda e atenção aos detalhes. Revisar contratos, analisar relatórios financeiros, comparar diferentes versões de documentos, extrair informações específicas de textos longos, trabalhar com dados complexos. Se você precisa de alguém para mergulhar fundo em um material e trazer insights precisos, o Claude é sua ferramenta ideal.'
    },
    
    {
      id: 'comparison',
      title: 'Comparando as Ferramentas',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Entenda as diferenças! 🔄',
      visualContent: `## 🔄 Comparação Rápida

| Ferramenta | Especialidade | Melhor Para |
|------------|---------------|-------------|
| 🤖 **ChatGPT** | Conversação | Textos, ideias, comunicação |
| 🎨 **Midjourney** | Imagens | Criação visual, arte |
| 📊 **Claude** | Análise | Documentos, dados complexos |

### 💡 Dica Pro:
Você pode (e deve!) usar mais de uma ferramenta para um projeto completo!`,
      spokenContent: 'Agora que conhecemos as três ferramentas, vamos compará-las rapidamente. O ChatGPT é seu assistente de conversação e textos. O Midjourney é seu designer e artista visual. O Claude é seu analista de documentos e dados. Cada um tem seu superpoder único! E aqui vai uma dica importante: você não precisa escolher apenas uma. Na verdade, os melhores resultados vêm quando você combina essas ferramentas. Use o Claude para analisar dados, o ChatGPT para escrever o relatório, e o Midjourney para criar os gráficos visuais.'
    },
    
    {
      id: 'real-example',
      title: 'Exemplo Prático Real',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Veja um caso real de uso! 💼',
      visualContent: `## 💼 Caso Real: Criando uma Apresentação

### Cenário:
Você precisa criar uma apresentação sobre seu novo produto

### 🎯 Como usar as 3 ferramentas:

**1️⃣ Claude:**
- Analisa pesquisas de mercado
- Identifica principais dados e tendências

**2️⃣ ChatGPT:**
- Estrutura o conteúdo da apresentação
- Escreve os textos para cada slide
- Cria o roteiro de fala

**3️⃣ Midjourney:**
- Gera imagens conceituais do produto
- Cria gráficos visuais atraentes
- Produz o design de capa

### ✨ Resultado:
Apresentação profissional completa usando as 3 IAs!`,
      spokenContent: 'Deixa eu te dar um exemplo prático de como usar as três ferramentas juntas. Imagine que você precisa criar uma apresentação sobre um novo produto. Primeiro, você usa o Claude para analisar todas as suas pesquisas de mercado e extrair os dados mais importantes. Depois, usa o ChatGPT para estruturar a apresentação e escrever o conteúdo de cada slide de forma clara e persuasiva. Por fim, usa o Midjourney para criar imagens conceituais bonitas do produto e gráficos visuais atraentes. O resultado? Uma apresentação profissional completa feita em muito menos tempo do que levaria fazendo tudo manualmente.'
    },
    
    {
      id: 'conclusion',
      title: 'Conclusão',
      timestamp: 0,
      type: 'text',
      speechBubbleText: 'Você está pronto para usar as ferramentas! 🎉',
      visualContent: `## 🎉 Parabéns!

Agora você conhece as **3 principais ferramentas de IA**:

### ✅ O que você aprendeu:
- 🤖 **ChatGPT** - Seu assistente de texto e ideias
- 🎨 **Midjourney** - Seu designer visual
- 📊 **Claude** - Seu analista de documentos

### 🚀 Próximos passos:
1. Experimente cada ferramenta
2. Teste em situações reais
3. Combine-as em seus projetos

### 💡 Lembre-se:
A melhor ferramenta é aquela que resolve **seu** problema específico!`,
      spokenContent: 'Parabéns! Agora você conhece as três principais ferramentas de IA e sabe quando usar cada uma delas. O ChatGPT para conversas e textos, o Midjourney para criação visual, e o Claude para análise profunda. Lembre-se: não existe a ferramenta perfeita para tudo, mas existe a ferramenta certa para cada situação. Meu conselho? Experimente todas elas! Crie contas gratuitas, teste em situações reais do seu dia a dia, e descubra como cada uma pode facilitar sua vida. Com o tempo, você vai desenvolver um instinto natural de qual ferramenta usar em cada momento. E agora, vamos praticar o que aprendemos com alguns exercícios!'
    },
    
    {
      id: 'end',
      title: 'Finalização',
      timestamp: 0,
      type: 'end-audio',
      speechBubbleText: 'Hora de praticar! 💪',
      visualContent: '',
      spokenContent: ''
    }
  ],
  
  exercisesConfig: [
    {
      id: 'ex-1',
      type: 'matching',
      title: 'Combine as Ferramentas com suas Especialidades',
      instruction: 'Conecte cada ferramenta com o que ela faz de melhor',
      data: {
        pairs: [
          {
            id: '1',
            left: '🤖 ChatGPT',
            right: 'Conversação natural e criação de textos'
          },
          {
            id: '2',
            left: '🎨 Midjourney',
            right: 'Geração de imagens a partir de descrições'
          },
          {
            id: '3',
            left: '📊 Claude',
            right: 'Análise profunda de documentos e dados'
          }
        ]
      }
    },
    
    {
      id: 'ex-2',
      type: 'scenario-drag-drop',
      title: 'Qual Ferramenta Usar?',
      instruction: 'Arraste cada cenário para a ferramenta mais adequada',
      data: {
        categories: [
          { id: 'chatgpt', title: 'ChatGPT', emoji: '🤖' },
          { id: 'midjourney', title: 'Midjourney', emoji: '🎨' },
          { id: 'claude', title: 'Claude', emoji: '📊' }
        ],
        scenarios: [
          {
            id: 's1',
            text: 'Preciso criar um logo para minha nova empresa',
            correctCategory: 'midjourney'
          },
          {
            id: 's2',
            text: 'Quero revisar um contrato de 50 páginas',
            correctCategory: 'claude'
          },
          {
            id: 's3',
            text: 'Preciso escrever um e-mail profissional',
            correctCategory: 'chatgpt'
          },
          {
            id: 's4',
            text: 'Quero ilustrações para meu blog',
            correctCategory: 'midjourney'
          },
          {
            id: 's5',
            text: 'Preciso analisar dados de vendas em uma planilha',
            correctCategory: 'claude'
          },
          {
            id: 's6',
            text: 'Quero fazer brainstorming de ideias para um projeto',
            correctCategory: 'chatgpt'
          }
        ]
      }
    },
    
    {
      id: 'ex-3',
      type: 'true-false',
      title: 'Verdadeiro ou Falso?',
      instruction: 'Avalie as afirmações sobre as ferramentas de IA',
      data: {
        statements: [
          {
            id: '1',
            text: 'O ChatGPT só pode ser usado para conversas casuais',
            correct: false,
            explanation: 'O ChatGPT é versátil e pode ajudar em tarefas profissionais, criação de conteúdo, aprendizado e muito mais!'
          },
          {
            id: '2',
            text: 'O Midjourney transforma texto em imagens',
            correct: true,
            explanation: 'Correto! O Midjourney é uma ferramenta de geração de imagens a partir de descrições textuais.'
          },
          {
            id: '3',
            text: 'O Claude não consegue trabalhar com documentos longos',
            correct: false,
            explanation: 'Pelo contrário! O Claude é especializado em processar grandes volumes de texto e analisar documentos extensos.'
          },
          {
            id: '4',
            text: 'Você pode combinar múltiplas ferramentas de IA em um projeto',
            correct: true,
            explanation: 'Sim! A combinação de diferentes ferramentas geralmente produz os melhores resultados.'
          },
          {
            id: '5',
            text: 'Todas as três ferramentas fazem exatamente a mesma coisa',
            correct: false,
            explanation: 'Cada ferramenta tem sua especialidade única: ChatGPT (texto), Midjourney (imagens), Claude (análise).'
          }
        ]
      }
    }
  ],
  
  finalPlaygroundConfig: {
    id: 'final-playground',
    type: 'guided-prompt-builder',
    title: '🎯 Projeto Final: Escolha Sua Ferramenta',
    maiaIntro: 'Vamos aplicar o que você aprendeu! Escolha uma situação real e selecione a melhor ferramenta de IA para resolvê-la.',
    steps: [
      {
        stepNumber: 1,
        title: 'Escolha Seu Cenário',
        type: 'radio',
        question: 'Qual destas situações você quer resolver com IA?',
        options: [
          {
            value: 'marketing',
            label: '📱 Marketing Digital',
            description: 'Criar conteúdo para redes sociais',
            icon: '📱'
          },
          {
            value: 'business',
            label: '💼 Trabalho/Negócios',
            description: 'Documentos e apresentações profissionais',
            icon: '💼'
          },
          {
            value: 'creative',
            label: '🎨 Projeto Criativo',
            description: 'Design, arte ou conteúdo visual',
            icon: '🎨'
          },
          {
            value: 'learning',
            label: '📚 Aprendizado',
            description: 'Estudar ou entender conceitos novos',
            icon: '📚'
          }
        ]
      },
      {
        stepNumber: 2,
        title: 'Descreva Seu Desafio',
        type: 'textarea',
        question: 'Descreva em poucas palavras o que você precisa fazer:',
        placeholder: 'Exemplo: Preciso criar posts para Instagram sobre meu novo produto...',
        minLength: 20
      },
      {
        stepNumber: 3,
        title: 'Selecione a Ferramenta',
        type: 'radio',
        question: 'Qual ferramenta você usaria para resolver isso?',
        options: [
          {
            value: 'chatgpt',
            label: '🤖 ChatGPT',
            description: 'Para textos, ideias e conversação',
            icon: '🤖'
          },
          {
            value: 'midjourney',
            label: '🎨 Midjourney',
            description: 'Para criar imagens e arte visual',
            icon: '🎨'
          },
          {
            value: 'claude',
            label: '📊 Claude',
            description: 'Para análise de documentos e dados',
            icon: '📊'
          },
          {
            value: 'multiple',
            label: '🔄 Combinação',
            description: 'Usar mais de uma ferramenta',
            icon: '🔄'
          }
        ]
      },
      {
        stepNumber: 4,
        title: 'Justifique Sua Escolha',
        type: 'textarea',
        question: 'Por que você escolheu essa(s) ferramenta(s)?',
        placeholder: 'Explique brevemente por que essa é a melhor escolha...',
        minLength: 30
      }
    ]
  }
};
