import { AIApp, AICategory, CategoryInfo } from '../../types/aiApp';

// Category information with icons and colors
export const categoryInfo: CategoryInfo[] = [
  {
    id: 'text',
    name: 'Texto e Escrita',
    description: 'IAs para gerar textos, e-mails, artigos e conteúdo escrito',
    icon: 'FileText',
    color: 'bg-blue-500'
  },
  {
    id: 'image',
    name: 'Geração de Imagens',
    description: 'Crie imagens, ilustrações e arte com IA',
    icon: 'Image',
    color: 'bg-purple-500'
  },
  {
    id: 'video',
    name: 'Criação de Vídeo',
    description: 'Gere e edite vídeos com inteligência artificial',
    icon: 'Video',
    color: 'bg-pink-500'
  },
  {
    id: 'audio',
    name: 'Áudio e Voz',
    description: 'Síntese de voz, transcrição e edição de áudio',
    icon: 'Mic',
    color: 'bg-green-500'
  },
  {
    id: 'code',
    name: 'Programação',
    description: 'Assistentes de código e desenvolvimento',
    icon: 'Code',
    color: 'bg-gray-500'
  },
  {
    id: 'research',
    name: 'Pesquisa e Busca',
    description: 'IAs especializadas em busca e pesquisa',
    icon: 'Search',
    color: 'bg-cyan-500'
  },
  {
    id: 'productivity',
    name: 'Produtividade',
    description: 'Ferramentas IA para aumentar sua produtividade',
    icon: 'Zap',
    color: 'bg-orange-500'
  }
];

// All AI apps directory (30 apps)
export const aiAppsDirectory: AIApp[] = [
  // TEXT CATEGORY (8 apps)
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    shortDescription: 'O chatbot IA mais popular do mundo',
    description: 'ChatGPT da OpenAI é o assistente conversacional mais usado globalmente. Gera textos, responde perguntas, escreve código e muito mais.',
    category: 'text',
    logo: '/logos/chatgpt.png',
    url: 'https://chat.openai.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $20/mês (Plus)',
    rating: 4.8,
    features: [
      'Conversação natural em português',
      'Geração de textos e artigos',
      'Escrita e debug de código',
      'GPT-4 na versão paga',
      'Plugins e navegação web (Plus)',
      'Análise de imagens (Plus)'
    ],
    tags: ['chatbot', 'gpt-4', 'openai', 'conversação', 'escrita'],
    isFeatured: true,
    isNew: false
  },
  {
    id: 'claude',
    name: 'Claude',
    shortDescription: 'IA focada em conversas longas e análise',
    description: 'Claude da Anthropic é conhecido por contexto gigante, análise profunda de documentos e respostas éticas e precisas.',
    category: 'text',
    logo: '/logos/claude.png',
    url: 'https://claude.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $20/mês (Pro)',
    rating: 4.7,
    features: [
      'Contexto de 200 mil tokens',
      'Análise de múltiplos documentos',
      'Código limpo e bem estruturado',
      'Raciocínio complexo',
      'Upload de PDFs e arquivos',
      'Foco em segurança e ética'
    ],
    tags: ['anthropic', 'análise', 'documentos', 'código', 'pesquisa'],
    isFeatured: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    shortDescription: 'IA integrada ao ecossistema Google',
    description: 'Gemini do Google se integra com Gmail, Docs, Drive e busca em tempo real. Multimodal (texto, imagem, áudio, vídeo).',
    category: 'text',
    logo: '/logos/gemini.svg',
    url: 'https://gemini.google.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $19.99/mês (Advanced)',
    rating: 4.6,
    features: [
      'Integração com Google Workspace',
      'Busca em tempo real',
      'Análise de vídeos do YouTube',
      'Contexto de 1 milhão de tokens',
      'Geração de imagens (pago)',
      'Extensões Gmail, Drive, Maps'
    ],
    tags: ['google', 'integração', 'workspace', 'multimodal', 'busca'],
    isFeatured: true
  },
  {
    id: 'jasper',
    name: 'Jasper AI',
    shortDescription: 'IA especializada em marketing e copywriting',
    description: 'Jasper é focado em criar conteúdo de marketing, anúncios, posts e copy persuasivo para empresas.',
    category: 'text',
    logo: '/logos/jasper.png',
    url: 'https://www.jasper.ai',
    pricing: 'paid',
    priceRange: '$49-125/mês',
    rating: 4.5,
    features: [
      'Templates de marketing',
      'SEO otimizado',
      'Tom de voz customizável',
      'Integração com Surfer SEO',
      'Geração de imagens integrada',
      'Suporte multiidioma'
    ],
    tags: ['marketing', 'copywriting', 'seo', 'empresas', 'conteúdo']
  },
  {
    id: 'copy-ai',
    name: 'Copy.ai',
    shortDescription: 'Gerador de copy e conteúdo para marketing',
    description: 'Copy.ai ajuda a criar textos de vendas, e-mails, posts de redes sociais e conteúdo de marketing rapidamente.',
    category: 'text',
    logo: 'https://www.copy.ai/favicon.ico',
    url: 'https://www.copy.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $49/mês',
    rating: 4.4,
    features: [
      'Templates prontos',
      'Geração de headlines',
      'E-mails de vendas',
      'Posts para redes sociais',
      'Descrições de produtos',
      'Workflows automatizados'
    ],
    tags: ['copywriting', 'marketing', 'vendas', 'email', 'social-media']
  },
  {
    id: 'writesonic',
    name: 'Writesonic',
    shortDescription: 'Criação de conteúdo e artigos com IA',
    description: 'Writesonic gera artigos de blog, anúncios, landing pages e conteúdo otimizado para SEO.',
    category: 'text',
    logo: 'https://writesonic.com/favicon.ico',
    url: 'https://writesonic.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $16-33/mês',
    rating: 4.3,
    features: [
      'Artigos de blog completos',
      'Otimização SEO',
      'Landing pages',
      'Anúncios Google/Facebook',
      'Paráfrase e resumo',
      'Chatsonic (chatbot similar ao ChatGPT)'
    ],
    tags: ['blog', 'seo', 'artigos', 'landing-page', 'anúncios']
  },
  {
    id: 'rytr',
    name: 'Rytr',
    shortDescription: 'Assistente de escrita IA acessível',
    description: 'Rytr é uma opção econômica para criar e-mails, blogs, posts sociais e copy em mais de 30 idiomas.',
    category: 'text',
    logo: 'https://rytr.me/favicon.ico',
    url: 'https://rytr.me',
    pricing: 'freemium',
    priceRange: 'Grátis / $9-29/mês',
    rating: 4.4,
    features: [
      'Mais de 40 casos de uso',
      '30+ idiomas',
      '20+ tons de voz',
      'Verificação de plágio',
      'Formatação rica',
      'Extensão Chrome'
    ],
    tags: ['escrita', 'blog', 'email', 'acessível', 'multiidioma']
  },
  {
    id: 'anyword',
    name: 'Anyword',
    shortDescription: 'Copy otimizado com análise preditiva',
    description: 'Anyword usa IA para prever performance de copy e otimizar textos de marketing com base em dados.',
    category: 'text',
    logo: 'https://www.anyword.com/favicon.ico',
    url: 'https://www.anyword.com',
    pricing: 'paid',
    priceRange: '$49-499/mês',
    rating: 4.5,
    features: [
      'Análise preditiva de performance',
      'A/B testing de copy',
      'Score de qualidade',
      'Templates de marketing',
      'Integração com plataformas de ads',
      'Blog e landing pages'
    ],
    tags: ['marketing', 'análise', 'performance', 'a/b-testing', 'empresas']
  },

  // IMAGE CATEGORY (6 apps)
  {
    id: 'midjourney',
    name: 'Midjourney',
    shortDescription: 'Gerador de imagens IA premium',
    description: 'Midjourney é referência em qualidade artística, criando imagens impressionantes a partir de texto via Discord.',
    category: 'image',
    logo: '/logos/midjourney.png',
    url: 'https://www.midjourney.com',
    pricing: 'paid',
    priceRange: '$10-120/mês',
    rating: 4.9,
    features: [
      'Qualidade artística excepcional',
      'Estilos diversos (realista, anime, 3D)',
      'Upscale e variações',
      'Controle avançado de parâmetros',
      'Comunidade ativa',
      'App mobile (alpha)'
    ],
    tags: ['arte', 'ilustração', 'conceitual', 'discord', 'premium'],
    isFeatured: true
  },
  {
    id: 'dall-e',
    name: 'DALL-E 3',
    shortDescription: 'Gerador de imagens da OpenAI',
    description: 'DALL-E 3 integrado ao ChatGPT cria imagens de alta qualidade com excelente entendimento de prompts.',
    category: 'image',
    logo: '/logos/dalle.png',
    url: 'https://chat.openai.com',
    pricing: 'freemium',
    priceRange: 'Incluso no ChatGPT Plus ($20/mês)',
    rating: 4.7,
    features: [
      'Integrado ao ChatGPT',
      'Entendimento avançado de prompts',
      'Edição de imagens',
      'Múltiplos estilos',
      'Segurança e filtros',
      'Resolução 1024x1024'
    ],
    tags: ['openai', 'chatgpt', 'geração', 'seguro', 'fácil'],
    isFeatured: true
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    shortDescription: 'IA de imagens open source e customizável',
    description: 'Stable Diffusion é open source, rodando localmente com controle total e modelos customizados.',
    category: 'image',
    logo: '/logos/stable-diffusion.png',
    url: 'https://stability.ai',
    pricing: 'free',
    priceRange: 'Grátis (open source)',
    rating: 4.6,
    features: [
      'Totalmente open source',
      'Roda localmente (GPU necessária)',
      'Modelos customizados',
      'Controle total de parâmetros',
      'Sem censura',
      'Comunidade enorme'
    ],
    tags: ['open-source', 'local', 'customização', 'técnico', 'grátis'],
    isFeatured: true
  },
  {
    id: 'leonardo-ai',
    name: 'Leonardo.ai',
    shortDescription: 'Geração de imagens para games e arte',
    description: 'Leonardo.ai focado em criar assets de games, concept art e ilustrações com controle de estilo.',
    category: 'image',
    logo: '/logos/leonardo.png',
    url: 'https://leonardo.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $12-48/mês',
    rating: 4.5,
    features: [
      'Foco em games e concept art',
      'Modelos customizados',
      'Canvas editor',
      'Controle de pose e composição',
      'Geração em lote',
      'Texturas e assets'
    ],
    tags: ['games', 'concept-art', 'ilustração', 'assets', 'canvas']
  },
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    shortDescription: 'IA generativa da Adobe',
    description: 'Firefly integrado ao Photoshop e Illustrator para geração e edição de imagens com IA.',
    category: 'image',
    logo: '/logos/adobe.png',
    url: 'https://firefly.adobe.com',
    pricing: 'freemium',
    priceRange: 'Grátis / Incluso Creative Cloud',
    rating: 4.4,
    features: [
      'Integração Adobe Creative Cloud',
      'Text to Image',
      'Generative Fill no Photoshop',
      'Efeitos de texto',
      'Recoloração de vetores',
      'Comercialmente seguro'
    ],
    tags: ['adobe', 'photoshop', 'profissional', 'integração', 'comercial']
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    shortDescription: 'Gerador de imagens com texto perfeito',
    description: 'Ideogram se destaca em gerar texto legível dentro de imagens, ideal para logos e designs com tipografia.',
    category: 'image',
    logo: '/logos/ideogram.png',
    url: 'https://ideogram.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $8-48/mês',
    rating: 4.6,
    features: [
      'Texto legível em imagens',
      'Ideal para logos e posters',
      'Editor integrado',
      'Múltiplos estilos',
      'Remix de imagens',
      'API disponível'
    ],
    tags: ['texto', 'logos', 'tipografia', 'design', 'posters']
  },

  // VIDEO CATEGORY (4 apps)
  {
    id: 'sora',
    name: 'Sora',
    shortDescription: 'Gerador de vídeo da OpenAI',
    description: 'Sora cria vídeos realistas de até 1 minuto a partir de prompts de texto com física e movimento coerentes.',
    category: 'video',
    logo: '/logos/sora.png',
    url: 'https://openai.com/sora',
    pricing: 'paid',
    priceRange: 'Incluso ChatGPT Plus/Pro ($20-200/mês)',
    rating: 4.8,
    features: [
      'Vídeos de até 1 minuto',
      'Realismo impressionante',
      'Múltiplos personagens',
      'Movimento de câmera',
      'Vários formatos (16:9, 9:16, 1:1)',
      'Resolução 1080p (Pro)'
    ],
    tags: ['openai', 'vídeo', 'realista', 'cinematográfico', 'premium'],
    isFeatured: true,
    isNew: true
  },
  {
    id: 'runway',
    name: 'Runway',
    shortDescription: 'Suite completa de edição de vídeo IA',
    description: 'Runway oferece ferramentas de vídeo IA: geração, edição, efeitos, remoção de fundo e muito mais.',
    category: 'video',
    logo: '/logos/runway.png',
    url: 'https://runwayml.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $12-76/mês',
    rating: 4.7,
    features: [
      'Text to Video',
      'Image to Video',
      'Remoção de fundo',
      'Motion tracking',
      'Green screen automático',
      'Edição frame-by-frame'
    ],
    tags: ['edição', 'efeitos', 'profissional', 'suite', 'criadores'],
    isFeatured: true
  },
  {
    id: 'pika',
    name: 'Pika',
    shortDescription: 'Gerador de vídeo fácil e rápido',
    description: 'Pika cria vídeos curtos de forma simples e rápida, ideal para redes sociais e conteúdo viral.',
    category: 'video',
    logo: '/logos/pika.png',
    url: 'https://pika.art',
    pricing: 'freemium',
    priceRange: 'Grátis / $8-58/mês',
    rating: 4.5,
    features: [
      'Interface super simples',
      'Text to Video',
      'Image to Video',
      'Edição de vídeos',
      'Extend e loop',
      'Upscale de resolução'
    ],
    tags: ['simples', 'rápido', 'social-media', 'viral', 'acessível']
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    shortDescription: 'Criação de vídeos com avatares IA',
    description: 'HeyGen cria vídeos com avatares virtuais falando, ideal para apresentações e vídeos corporativos.',
    category: 'video',
    logo: '/logos/heygen.png',
    url: 'https://www.heygen.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $24-120/mês',
    rating: 4.6,
    features: [
      'Avatares realistas',
      'Voz clonada',
      'Múltiplos idiomas',
      'Templates prontos',
      'Tradução automática',
      'API para integração'
    ],
    tags: ['avatar', 'apresentação', 'corporativo', 'educação', 'multilíngue']
  },

  // AUDIO CATEGORY (3 apps)
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortDescription: 'Síntese de voz IA ultra-realista',
    description: 'ElevenLabs cria vozes sintéticas indistinguíveis de humanos, com clonagem de voz e múltiplos idiomas.',
    category: 'audio',
    logo: '/logos/elevenlabs.png',
    url: 'https://elevenlabs.io',
    pricing: 'freemium',
    priceRange: 'Grátis / $5-330/mês',
    rating: 4.9,
    features: [
      'Vozes ultra-realistas',
      'Clonagem de voz',
      '29 idiomas',
      'Controle de emoção',
      'API robusta',
      'Audiobooks e podcasts'
    ],
    tags: ['voz', 'tts', 'clonagem', 'realista', 'multilíngue'],
    isFeatured: true
  },
  {
    id: 'descript',
    name: 'Descript',
    shortDescription: 'Editor de áudio e vídeo colaborativo',
    description: 'Descript edita áudio como texto, remove "ãh", clona voz e transcreve automaticamente.',
    category: 'audio',
    logo: 'https://www.descript.com/favicon.ico',
    url: 'https://www.descript.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $12-24/mês',
    rating: 4.7,
    features: [
      'Edição de áudio como texto',
      'Remoção de "ãh" e pausas',
      'Overdub (clonagem de voz)',
      'Transcrição automática',
      'Editor de vídeo integrado',
      'Colaboração em tempo real'
    ],
    tags: ['edição', 'podcast', 'transcrição', 'colaborativo', 'produtividade']
  },
  {
    id: 'adobe-podcast',
    name: 'Adobe Podcast',
    shortDescription: 'Melhoria de qualidade de áudio IA',
    description: 'Adobe Podcast remove ruídos, equaliza e melhora qualidade de gravações de podcasts automaticamente.',
    category: 'audio',
    logo: '/logos/adobe.png',
    url: 'https://podcast.adobe.com',
    pricing: 'free',
    priceRange: 'Grátis',
    rating: 4.6,
    features: [
      'Remoção de ruído avançada',
      'Equalização automática',
      'Melhoria de qualidade',
      'Interface simples',
      'Totalmente grátis',
      'Sem necessidade de plugins'
    ],
    tags: ['podcast', 'áudio', 'limpeza', 'ruído', 'grátis']
  },

  // CODE CATEGORY (4 apps)
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    shortDescription: 'Assistente de código da GitHub/OpenAI',
    description: 'Copilot sugere código em tempo real direto no seu editor, baseado em GPT-4.',
    category: 'code',
    logo: '/logos/github-copilot.png',
    url: 'https://github.com/features/copilot',
    pricing: 'paid',
    priceRange: '$10-19/mês',
    rating: 4.7,
    features: [
      'Sugestões de código em tempo real',
      'Suporte a todas linguagens',
      'Integração VS Code, Vim, Neovim',
      'Chat integrado (GPT-4)',
      'Explicação de código',
      'Geração de testes'
    ],
    tags: ['código', 'vscode', 'github', 'autocompletar', 'programação'],
    isFeatured: true
  },
  {
    id: 'cursor',
    name: 'Cursor',
    shortDescription: 'Editor de código IA-first',
    description: 'Cursor é um fork do VS Code com IA profundamente integrada para edição e refatoração de código.',
    category: 'code',
    logo: '/logos/cursor.png',
    url: 'https://cursor.sh',
    pricing: 'freemium',
    priceRange: 'Grátis / $20/mês',
    rating: 4.8,
    features: [
      'Chat com contexto de codebase',
      'Edição inline com IA',
      'Cmd+K para gerar código',
      'Refatoração automática',
      'Suporte GPT-4 e Claude',
      'Compatível com extensões VS Code'
    ],
    tags: ['editor', 'vscode', 'refatoração', 'ai-first', 'produtividade'],
    isFeatured: true
  },
  {
    id: 'replit-ai',
    name: 'Replit AI',
    shortDescription: 'IA integrada ao ambiente Replit',
    description: 'Replit AI ajuda a escrever, debugar e explicar código diretamente no ambiente de desenvolvimento online.',
    category: 'code',
    logo: 'https://replit.com/public/images/favicon.ico',
    url: 'https://replit.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $7-25/mês',
    rating: 4.5,
    features: [
      'Chat de código integrado',
      'Geração de código completo',
      'Debugging automático',
      'Explicações de código',
      'Deploy com 1 clique',
      'Colaboração em tempo real'
    ],
    tags: ['online', 'ide', 'colaboração', 'deploy', 'aprendizado']
  },
  {
    id: 'tabnine',
    name: 'Tabnine',
    shortDescription: 'Autocompletar de código com IA',
    description: 'Tabnine oferece sugestões inteligentes de código com foco em privacidade e modelos personalizados.',
    category: 'code',
    logo: 'https://www.tabnine.com/favicon.ico',
    url: 'https://www.tabnine.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $12-39/mês',
    rating: 4.4,
    features: [
      'Autocompletar inteligente',
      'Privacidade (pode rodar local)',
      'Modelos customizados',
      'Todas linguagens',
      'Integra com IDEs principais',
      'Modo offline'
    ],
    tags: ['autocompletar', 'privacidade', 'customização', 'offline', 'seguro']
  },

  // RESEARCH CATEGORY (3 apps)
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    shortDescription: 'IA de busca com citações',
    description: 'Perplexity responde perguntas com fontes verificadas em tempo real, ideal para pesquisa factual.',
    category: 'research',
    logo: '/logos/perplexity.svg',
    url: 'https://www.perplexity.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $20/mês (Pro)',
    rating: 4.7,
    features: [
      'Busca em tempo real',
      'Citações de todas fontes',
      'Focus modes (Academic, News, etc)',
      'Pro search (análise profunda)',
      'Upload de arquivos',
      'API disponível'
    ],
    tags: ['busca', 'pesquisa', 'citações', 'fontes', 'acadêmico'],
    isFeatured: true
  },
  {
    id: 'you-com',
    name: 'You.com',
    shortDescription: 'Busca IA personalizável',
    description: 'You.com combina busca tradicional com IA, oferecendo respostas personalizadas e apps especializados.',
    category: 'research',
    logo: 'https://you.com/favicon.ico',
    url: 'https://you.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $15-20/mês',
    rating: 4.4,
    features: [
      'Busca IA + tradicional',
      'Apps especializados (Code, Write, etc)',
      'Personalização de resultados',
      'Privacidade focada',
      'Múltiplos modelos IA',
      'Sem anúncios (pago)'
    ],
    tags: ['busca', 'privacidade', 'personalização', 'apps', 'versatil']
  },
  {
    id: 'phind',
    name: 'Phind',
    shortDescription: 'Busca IA para desenvolvedores',
    description: 'Phind é otimizado para pesquisa técnica e programação, com respostas especializadas e exemplos de código.',
    category: 'research',
    logo: 'https://www.phind.com/favicon.ico',
    url: 'https://www.phind.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $15/mês',
    rating: 4.6,
    features: [
      'Foco em programação',
      'Exemplos de código',
      'Busca em documentações',
      'Respostas técnicas precisas',
      'Integração com GitHub',
      'Modo expert'
    ],
    tags: ['programação', 'código', 'técnico', 'dev', 'documentação']
  },

  // PRODUCTIVITY CATEGORY (2 apps)
  {
    id: 'notion-ai',
    name: 'Notion AI',
    shortDescription: 'IA integrada ao Notion',
    description: 'Notion AI ajuda a escrever, resumir, traduzir e organizar informações dentro do Notion.',
    category: 'productivity',
    logo: '/logos/notion.png',
    url: 'https://www.notion.so/product/ai',
    pricing: 'paid',
    priceRange: '$10/mês (adicional ao Notion)',
    rating: 4.5,
    features: [
      'Escrita e resumo de textos',
      'Tradução integrada',
      'Geração de tabelas e listas',
      'Brainstorming de ideias',
      'Melhoria de textos',
      'Q&A sobre seu workspace'
    ],
    tags: ['notion', 'produtividade', 'workspace', 'organização', 'escrita']
  },
  {
    id: 'gamma',
    name: 'Gamma',
    shortDescription: 'Criação de apresentações com IA',
    description: 'Gamma cria apresentações, documentos e sites lindos em minutos, sem design manual.',
    category: 'productivity',
    logo: '/logos/gamma.png',
    url: 'https://gamma.app',
    pricing: 'freemium',
    priceRange: 'Grátis / $10-20/mês',
    rating: 4.6,
    features: [
      'Apresentações automáticas',
      'Design profissional',
      'Templates modernos',
      'Colaboração em tempo real',
      'Export para PDF/PowerPoint',
      'Analytics de visualizações'
    ],
    tags: ['apresentação', 'slides', 'design', 'pitch', 'colaboração'],
    isFeatured: true
  }
];

// Helper functions
export const getAppsByCategory = (category: AICategory): AIApp[] => {
  return aiAppsDirectory.filter(app => app.category === category);
};

export const getFeaturedApps = (): AIApp[] => {
  return aiAppsDirectory.filter(app => app.isFeatured);
};

export const getNewApps = (): AIApp[] => {
  return aiAppsDirectory.filter(app => app.isNew);
};

export const searchApps = (query: string): AIApp[] => {
  const lowercaseQuery = query.toLowerCase();
  return aiAppsDirectory.filter(app =>
    app.name.toLowerCase().includes(lowercaseQuery) ||
    app.description.toLowerCase().includes(lowercaseQuery) ||
    app.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
