import { AIApp, AICategory, CategoryInfo } from '../../types/aiApp';

// Re-export expanded directory as main
export { 
  aiAppsDirectoryExpanded as aiAppsDirectory,
  categoryInfoExpanded as categoryInfo,
  getHotApps,
  getPremiumApps,
  getFeaturedApps,
  getNewApps,
  getAppsByCategory,
  searchApps,
  getAppsByPricing,
  getTopRatedApps
} from './apps-directory-expanded';
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
    logo: '/logos/copyai.png',
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
    logo: '/logos/writesonic.png',
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
    logo: '/logos/rytr.png',
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
    logo: '/logos/anyword.png',
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
  },

  // MAIS APPS DE TEXTO (7 novos)
  {
    id: 'grammarly',
    name: 'Grammarly',
    shortDescription: 'Correção gramatical e aprimoramento de escrita',
    description: 'Grammarly corrige gramática, ortografia e sugere melhorias de estilo em tempo real.',
    category: 'text',
    logo: 'https://www.grammarly.com/favicon.ico',
    url: 'https://www.grammarly.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $12-15/mês',
    rating: 4.6,
    features: [
      'Correção gramatical avançada',
      'Sugestões de estilo e tom',
      'Detecção de plágio',
      'Integração com navegadores',
      'Apps desktop e mobile',
      'GrammarlyGO (geração IA)'
    ],
    tags: ['gramática', 'correção', 'escrita', 'estilo', 'profissional']
  },
  {
    id: 'quillbot',
    name: 'QuillBot',
    shortDescription: 'Paráfrase e reescrita com IA',
    description: 'QuillBot reescreve textos mantendo o significado, ideal para parafraseamento e resumos.',
    category: 'text',
    logo: 'https://quillbot.com/favicon.ico',
    url: 'https://quillbot.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $8.33-19.95/mês',
    rating: 4.4,
    features: [
      'Paráfrase inteligente',
      'Múltiplos modos de escrita',
      'Resumidor de textos',
      'Verificador gramatical',
      'Tradutor integrado',
      'Co-escritor IA'
    ],
    tags: ['paráfrase', 'reescrita', 'resumo', 'estudantes', 'acadêmico']
  },
  {
    id: 'character-ai',
    name: 'Character.AI',
    shortDescription: 'Conversas com personagens IA customizados',
    description: 'Character.AI permite criar e conversar com personagens virtuais de qualquer tipo.',
    category: 'text',
    logo: 'https://character.ai/favicon.ico',
    url: 'https://character.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $9.99/mês',
    rating: 4.7,
    features: [
      'Crie seus próprios personagens',
      'Milhares de personagens prontos',
      'Conversas naturais',
      'Roleplay e storytelling',
      'Chamadas de voz',
      'Memória persistente'
    ],
    tags: ['chatbot', 'personagens', 'conversação', 'roleplay', 'criativo'],
    isNew: true
  },
  {
    id: 'poe',
    name: 'Poe',
    shortDescription: 'Acesso a múltiplos chatbots IA',
    description: 'Poe da Quora oferece acesso a GPT-4, Claude, Gemini e outros em um só lugar.',
    category: 'text',
    logo: 'https://poe.com/favicon.ico',
    url: 'https://poe.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $19.99/mês',
    rating: 4.5,
    features: [
      'Múltiplos modelos em 1 app',
      'GPT-4, Claude 3, Gemini Pro',
      'Crie seus próprios bots',
      'Apps iOS e Android',
      'Histórico persistente',
      'API para desenvolvedores'
    ],
    tags: ['agregador', 'múltiplos-modelos', 'chatbot', 'conveniente', 'mobile']
  },
  {
    id: 'huggingchat',
    name: 'HuggingChat',
    shortDescription: 'Chatbot IA open source e gratuito',
    description: 'HuggingChat da Hugging Face é totalmente open source e gratuito, com vários modelos.',
    category: 'text',
    logo: 'https://huggingface.co/favicon.ico',
    url: 'https://huggingface.co/chat',
    pricing: 'free',
    priceRange: 'Grátis',
    rating: 4.3,
    features: [
      'Totalmente gratuito',
      'Open source',
      'Múltiplos modelos disponíveis',
      'Busca web integrada',
      'Geração de imagens',
      'Sem necessidade de login'
    ],
    tags: ['open-source', 'grátis', 'huggingface', 'livre', 'comunidade']
  },
  {
    id: 'grok',
    name: 'Grok',
    shortDescription: 'IA conversacional do X (Twitter)',
    description: 'Grok da xAI tem acesso em tempo real ao X e responde com humor e personalidade.',
    category: 'text',
    logo: '/logos/grok.png',
    url: 'https://x.ai',
    pricing: 'paid',
    priceRange: '$16/mês (X Premium+)',
    rating: 4.4,
    features: [
      'Acesso em tempo real ao X',
      'Tom humorístico e direto',
      'Geração de imagens',
      'Contexto de notícias atuais',
      'Integrado ao X',
      'Modo "diversão" ativado'
    ],
    tags: ['twitter', 'x', 'humor', 'tempo-real', 'notícias'],
    isFeatured: true,
    isNew: true
  },
  {
    id: 'pi',
    name: 'Pi',
    shortDescription: 'IA pessoal empática e conversacional',
    description: 'Pi da Inflection é focada em conversas empáticas, apoio emocional e companheirismo.',
    category: 'text',
    logo: 'https://pi.ai/favicon.ico',
    url: 'https://pi.ai',
    pricing: 'free',
    priceRange: 'Grátis',
    rating: 4.5,
    features: [
      'Conversas empáticas',
      'Apoio emocional',
      'Tom pessoal e amigável',
      'Chamadas de voz',
      'Totalmente grátis',
      'Apps iOS e Android'
    ],
    tags: ['empático', 'pessoal', 'bem-estar', 'conversação', 'voz']
  },

  // MAIS APPS DE IMAGEM (7 novos)
  {
    id: 'canva-ai',
    name: 'Canva AI',
    shortDescription: 'Design gráfico com ferramentas IA',
    description: 'Canva integra IA para gerar imagens, remover fundos, expandir fotos e criar designs automaticamente.',
    category: 'image',
    logo: 'https://www.canva.com/favicon.ico',
    url: 'https://www.canva.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $12.99/mês',
    rating: 4.7,
    features: [
      'Text to Image integrado',
      'Magic Eraser (remoção)',
      'Background Remover',
      'Magic Expand',
      'Templates inteligentes',
      'Design suggestions'
    ],
    tags: ['design', 'gráfico', 'social-media', 'templates', 'fácil'],
    isFeatured: true
  },
  {
    id: 'flux',
    name: 'Flux',
    shortDescription: 'Gerador de imagens de última geração',
    description: 'Flux da Black Forest Labs é um dos mais avançados geradores, com qualidade fotorrealista.',
    category: 'image',
    logo: 'https://blackforestlabs.ai/favicon.ico',
    url: 'https://blackforestlabs.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / API paga',
    rating: 4.8,
    features: [
      'Qualidade fotorrealista',
      'Texto em imagens perfeito',
      'Múltiplos modelos (Pro, Dev, Schnell)',
      'Open source (Schnell)',
      'Controle avançado',
      'API disponível'
    ],
    tags: ['fotorrealista', 'avançado', 'qualidade', 'texto', 'moderno'],
    isNew: true,
    isFeatured: true
  },
  {
    id: 'magnific',
    name: 'Magnific AI',
    shortDescription: 'Upscaler de imagens com IA',
    description: 'Magnific aumenta resolução de imagens recriando detalhes com IA de forma impressionante.',
    category: 'image',
    logo: 'https://magnific.ai/favicon.ico',
    url: 'https://magnific.ai',
    pricing: 'paid',
    priceRange: '$39-299/mês',
    rating: 4.9,
    features: [
      'Upscaling até 16x',
      'Recria detalhes realisticamente',
      'Controle de criatividade',
      'HDR e Engine customizável',
      'Qualidade profissional',
      'Restauração de fotos antigas'
    ],
    tags: ['upscale', 'resolução', 'detalhes', 'profissional', 'restauração']
  },
  {
    id: 'krea',
    name: 'Krea AI',
    shortDescription: 'Geração de imagens em tempo real',
    description: 'Krea gera imagens em tempo real enquanto você digita, com canvas editor avançado.',
    category: 'image',
    logo: 'https://www.krea.ai/favicon.ico',
    url: 'https://www.krea.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $24-96/mês',
    rating: 4.6,
    features: [
      'Geração em tempo real',
      'Canvas editor avançado',
      'Upscaler integrado',
      'Patterns e texturas',
      'Controlnet integrado',
      'Video generation'
    ],
    tags: ['tempo-real', 'canvas', 'editor', 'interativo', 'criativo']
  },
  {
    id: 'remove-bg',
    name: 'Remove.bg',
    shortDescription: 'Remoção automática de fundo',
    description: 'Remove.bg remove fundos de imagens instantaneamente com IA, ideal para produtos.',
    category: 'image',
    logo: 'https://www.remove.bg/favicon.ico',
    url: 'https://www.remove.bg',
    pricing: 'freemium',
    priceRange: 'Grátis / $9-209/mês',
    rating: 4.7,
    features: [
      'Remoção instantânea',
      'Alta precisão',
      'API robusta',
      'Processamento em lote',
      'Edição avançada',
      'Plugins Photoshop/Figma'
    ],
    tags: ['remoção', 'fundo', 'produtos', 'e-commerce', 'automação']
  },
  {
    id: 'photoleap',
    name: 'Photoleap',
    shortDescription: 'Editor de fotos IA mobile',
    description: 'Photoleap (ex-Photofox) é um editor mobile poderoso com IA para remixar e criar arte.',
    category: 'image',
    logo: 'https://www.photoleap.app/favicon.ico',
    url: 'https://www.photoleap.app',
    pricing: 'freemium',
    priceRange: 'Grátis / $7.99/mês',
    rating: 4.5,
    features: [
      'Geração de imagens IA',
      'Remoção de objetos',
      'Face swap',
      'Filtros IA avançados',
      'Animação de fotos',
      'Mobile-first'
    ],
    tags: ['mobile', 'editor', 'filtros', 'face-swap', 'animação']
  },
  {
    id: 'photoroom',
    name: 'PhotoRoom',
    shortDescription: 'Editor de fotos para e-commerce',
    description: 'PhotoRoom remove fundos e cria fotos profissionais de produtos para lojas online.',
    category: 'image',
    logo: 'https://www.photoroom.com/favicon.ico',
    url: 'https://www.photoroom.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $9.99-29.99/mês',
    rating: 4.6,
    features: [
      'Remoção de fundo instantânea',
      'Templates de produto',
      'Sombras e reflexos IA',
      'Expansão de imagem',
      'Geração de cenários',
      'API para e-commerce'
    ],
    tags: ['e-commerce', 'produtos', 'loja', 'marketing', 'vendas']
  },

  // MAIS APPS DE VÍDEO (5 novos)
  {
    id: 'capcut',
    name: 'CapCut',
    shortDescription: 'Editor de vídeo mobile com IA',
    description: 'CapCut da ByteDance tem ferramentas IA poderosas para edição de vídeos virais.',
    category: 'video',
    logo: 'https://www.capcut.com/favicon.ico',
    url: 'https://www.capcut.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $7.99-9.99/mês',
    rating: 4.8,
    features: [
      'Remoção de fundo',
      'Auto legendas',
      'Templates virais TikTok',
      'Geração de script IA',
      'Efeitos e transições IA',
      'Text to Speech'
    ],
    tags: ['mobile', 'tiktok', 'viral', 'legendas', 'social-media'],
    isFeatured: true
  },
  {
    id: 'synthesia',
    name: 'Synthesia',
    shortDescription: 'Vídeos com avatares IA profissionais',
    description: 'Synthesia cria vídeos corporativos com avatares realistas falando em +120 idiomas.',
    category: 'video',
    logo: 'https://www.synthesia.io/favicon.ico',
    url: 'https://www.synthesia.io',
    pricing: 'paid',
    priceRange: '$29-89/mês',
    rating: 4.6,
    features: [
      '150+ avatares profissionais',
      '120+ idiomas e sotaques',
      'Avatar personalizado',
      'Templates corporativos',
      'Colaboração em equipe',
      'API enterprise'
    ],
    tags: ['avatar', 'corporativo', 'treinamento', 'multilíngue', 'profissional']
  },
  {
    id: 'pictory',
    name: 'Pictory',
    shortDescription: 'Transforma texto em vídeo automaticamente',
    description: 'Pictory converte artigos e scripts em vídeos com narração IA e imagens relevantes.',
    category: 'video',
    logo: 'https://pictory.ai/favicon.ico',
    url: 'https://pictory.ai',
    pricing: 'paid',
    priceRange: '$23-119/mês',
    rating: 4.5,
    features: [
      'Artigo para vídeo',
      'Script para vídeo',
      'Auto legendas',
      'Biblioteca de mídia',
      'Narração IA',
      'Edição fácil'
    ],
    tags: ['texto-para-vídeo', 'artigos', 'narração', 'legendas', 'rápido']
  },
  {
    id: 'invideo',
    name: 'InVideo AI',
    shortDescription: 'Criador de vídeos com prompts',
    description: 'InVideo AI cria vídeos completos a partir de prompts de texto, com edição inteligente.',
    category: 'video',
    logo: 'https://invideo.io/favicon.ico',
    url: 'https://invideo.io',
    pricing: 'freemium',
    priceRange: 'Grátis / $20-60/mês',
    rating: 4.4,
    features: [
      'Prompt para vídeo completo',
      'Script automático',
      'Narração IA',
      '8M+ assets de mídia',
      'Templates prontos',
      'Clonagem de voz'
    ],
    tags: ['prompt', 'automático', 'script', 'templates', 'fácil']
  },
  {
    id: 'd-id',
    name: 'D-ID',
    shortDescription: 'Avatares falantes a partir de fotos',
    description: 'D-ID anima fotos estáticas criando avatares que falam e têm expressões naturais.',
    category: 'video',
    logo: 'https://www.d-id.com/favicon.ico',
    url: 'https://www.d-id.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $5.90-196/mês',
    rating: 4.5,
    features: [
      'Anima qualquer foto',
      'Expressões faciais realistas',
      'Múltiplas vozes',
      '119 idiomas',
      'API robusta',
      'Apresentadores virtuais'
    ],
    tags: ['avatar', 'animação', 'foto', 'apresentador', 'realista']
  },

  // MAIS APPS DE ÁUDIO (4 novos)
  {
    id: 'murf',
    name: 'Murf AI',
    shortDescription: 'Voiceover profissional com IA',
    description: 'Murf cria voiceovers naturais para vídeos, apresentações e podcasts com 120+ vozes.',
    category: 'audio',
    logo: 'https://murf.ai/favicon.ico',
    url: 'https://murf.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $19-99/mês',
    rating: 4.6,
    features: [
      '120+ vozes IA',
      '20+ idiomas',
      'Controle de pitch e velocidade',
      'Sincronização com vídeo',
      'Clonagem de voz',
      'Colaboração em equipe'
    ],
    tags: ['voiceover', 'narração', 'vídeo', 'profissional', 'multilíngue']
  },
  {
    id: 'play-ht',
    name: 'Play.ht',
    shortDescription: 'Gerador de voz IA ultra realista',
    description: 'Play.ht oferece vozes indistinguíveis de humanos para qualquer tipo de conteúdo.',
    category: 'audio',
    logo: 'https://play.ht/favicon.ico',
    url: 'https://play.ht',
    pricing: 'freemium',
    priceRange: 'Grátis / $31.20-99/mês',
    rating: 4.7,
    features: [
      '900+ vozes IA',
      'Clonagem de voz instantânea',
      '142 idiomas',
      'API poderosa',
      'Pronúncia customizável',
      'Vozes ultra-realistas'
    ],
    tags: ['tts', 'voz', 'clonagem', 'api', 'realista']
  },
  {
    id: 'speechify',
    name: 'Speechify',
    shortDescription: 'Leitor de texto em voz',
    description: 'Speechify converte qualquer texto em áudio natural, ideal para consumir conteúdo.',
    category: 'audio',
    logo: 'https://speechify.com/favicon.ico',
    url: 'https://speechify.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $11.58/mês',
    rating: 4.6,
    features: [
      'Leitura de PDFs e artigos',
      'Vozes naturais',
      'Ajuste de velocidade',
      'Apps mobile e extensões',
      'Scan de documentos',
      'Sincronização cross-device'
    ],
    tags: ['text-to-speech', 'leitura', 'acessibilidade', 'estudos', 'produtividade']
  },
  {
    id: 'resemble',
    name: 'Resemble AI',
    shortDescription: 'Clonagem e síntese de voz avançada',
    description: 'Resemble oferece clonagem de voz de nível profissional e síntese em tempo real.',
    category: 'audio',
    logo: 'https://www.resemble.ai/favicon.ico',
    url: 'https://www.resemble.ai',
    pricing: 'paid',
    priceRange: '$29-499/mês',
    rating: 4.5,
    features: [
      'Clonagem de voz realística',
      'Síntese em tempo real',
      'Edição de áudio IA',
      'Detecção de deepfake',
      'API enterprise',
      'Localização automática'
    ],
    tags: ['clonagem', 'profissional', 'tempo-real', 'enterprise', 'segurança']
  },

  // MAIS APPS DE CODE (5 novos)
  {
    id: 'codeium',
    name: 'Codeium',
    shortDescription: 'Autocompletar de código gratuito',
    description: 'Codeium oferece autocompletar IA de nível profissional totalmente grátis para desenvolvedores.',
    category: 'code',
    logo: 'https://codeium.com/favicon.ico',
    url: 'https://codeium.com',
    pricing: 'free',
    priceRange: 'Grátis (Enterprise disponível)',
    rating: 4.7,
    features: [
      'Totalmente grátis',
      '70+ linguagens',
      'Chat de código',
      'Busca em codebase',
      'Todas IDEs principais',
      'Ilimitado'
    ],
    tags: ['grátis', 'autocompletar', 'ilimitado', 'ide', 'produtivo'],
    isFeatured: true
  },
  {
    id: 'amazon-q',
    name: 'Amazon Q Developer',
    shortDescription: 'Assistente de código da AWS',
    description: 'Amazon Q ajuda a desenvolver, testar e debugar código com conhecimento profundo da AWS.',
    category: 'code',
    logo: 'https://aws.amazon.com/favicon.ico',
    url: 'https://aws.amazon.com/q/developer',
    pricing: 'freemium',
    priceRange: 'Grátis / $19/mês (Pro)',
    rating: 4.4,
    features: [
      'Especialista em AWS',
      'Geração de código',
      'Transformações de código',
      'Análise de segurança',
      'Integração IDEs',
      'Conhecimento da AWS'
    ],
    tags: ['aws', 'cloud', 'amazon', 'segurança', 'infraestrutura']
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    shortDescription: 'IDE com IA integrada profundamente',
    description: 'Windsurf da Codeium é um IDE com IA de última geração que entende todo o contexto.',
    category: 'code',
    logo: 'https://codeium.com/favicon.ico',
    url: 'https://codeium.com/windsurf',
    pricing: 'freemium',
    priceRange: 'Grátis / $15/mês',
    rating: 4.7,
    features: [
      'IA profundamente integrada',
      'Contexto de codebase completo',
      'Edição em múltiplos arquivos',
      'Terminal IA',
      'Cascade mode',
      'Baseado em VS Code'
    ],
    tags: ['ide', 'contexto', 'avançado', 'multi-file', 'moderno'],
    isNew: true
  },
  {
    id: 'pieces',
    name: 'Pieces for Developers',
    shortDescription: 'Gerenciador de snippets com IA',
    description: 'Pieces salva, organiza e sugere code snippets com contexto completo e IA.',
    category: 'code',
    logo: 'https://pieces.app/favicon.ico',
    url: 'https://pieces.app',
    pricing: 'freemium',
    priceRange: 'Grátis / $9-40/mês',
    rating: 4.5,
    features: [
      'Salva snippets automaticamente',
      'Busca IA inteligente',
      'Contexto completo preservado',
      'Offline-first',
      'Integração com IDEs',
      'Copilot pessoal'
    ],
    tags: ['snippets', 'organização', 'busca', 'contexto', 'offline']
  },
  {
    id: 'codium-ai',
    name: 'Codium AI',
    shortDescription: 'Geração automática de testes',
    description: 'Codium AI (CodiumAI) gera testes unitários e sugere melhorias de código automaticamente.',
    category: 'code',
    logo: 'https://www.codium.ai/favicon.ico',
    url: 'https://www.codium.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $19/mês',
    rating: 4.6,
    features: [
      'Geração de testes automática',
      'Sugestões de código',
      'Análise de comportamento',
      'Test cases inteligentes',
      'Integração IDEs',
      'Code review IA'
    ],
    tags: ['testes', 'qualidade', 'unit-tests', 'code-review', 'automação']
  },

  // MAIS APPS DE RESEARCH (4 novos)
  {
    id: 'consensus',
    name: 'Consensus',
    shortDescription: 'Busca IA em papers científicos',
    description: 'Consensus busca e resume papers científicos com citações diretas de estudos.',
    category: 'research',
    logo: 'https://consensus.app/favicon.ico',
    url: 'https://consensus.app',
    pricing: 'freemium',
    priceRange: 'Grátis / $8.99-44.99/mês',
    rating: 4.7,
    features: [
      'Busca em 200M+ papers',
      'Citações diretas',
      'Resumos IA',
      'Análise de consenso científico',
      'Filtros avançados',
      'Export para referências'
    ],
    tags: ['científico', 'papers', 'acadêmico', 'pesquisa', 'citações'],
    isFeatured: true
  },
  {
    id: 'elicit',
    name: 'Elicit',
    shortDescription: 'Assistente de pesquisa científica IA',
    description: 'Elicit automatiza pesquisa científica, resumindo papers e extraindo dados.',
    category: 'research',
    logo: 'https://elicit.com/favicon.ico',
    url: 'https://elicit.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $10-42/mês',
    rating: 4.6,
    features: [
      'Análise de papers',
      'Extração de dados',
      'Tabelas comparativas',
      '125M+ papers',
      'Resumos detalhados',
      'Busca semântica'
    ],
    tags: ['acadêmico', 'papers', 'análise', 'dados', 'pesquisa']
  },
  {
    id: 'scispace',
    name: 'SciSpace',
    shortDescription: 'Leitura e explicação de papers',
    description: 'SciSpace explica papers científicos complexos de forma simples com IA.',
    category: 'research',
    logo: 'https://typeset.io/favicon.ico',
    url: 'https://typeset.io',
    pricing: 'freemium',
    priceRange: 'Grátis / $12-60/mês',
    rating: 4.5,
    features: [
      'Explica papers complexos',
      'Chat com PDFs',
      'Copilot para leitura',
      'Tradutor de papers',
      '200M+ papers',
      'Annotations IA'
    ],
    tags: ['papers', 'explicação', 'simplificação', 'pdf', 'estudantes']
  },
  {
    id: 'scite',
    name: 'Scite',
    shortDescription: 'Análise de citações científicas',
    description: 'Scite analisa como papers são citados (suporte ou contradição) usando IA.',
    category: 'research',
    logo: 'https://scite.ai/favicon.ico',
    url: 'https://scite.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $9-38/mês',
    rating: 4.6,
    features: [
      'Análise de citações',
      'Smart Citations',
      'Verificação de claims',
      'Dashboard de referências',
      'Assistant para pesquisa',
      'Chrome extension'
    ],
    tags: ['citações', 'verificação', 'claims', 'acadêmico', 'qualidade']
  },

  // MAIS APPS DE PRODUTIVIDADE (8 novos)
  {
    id: 'otter',
    name: 'Otter.ai',
    shortDescription: 'Transcrição de reuniões com IA',
    description: 'Otter.ai transcreve reuniões em tempo real e gera resumos automáticos.',
    category: 'productivity',
    logo: 'https://otter.ai/favicon.ico',
    url: 'https://otter.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $8.33-30/mês',
    rating: 4.6,
    features: [
      'Transcrição em tempo real',
      'Resumos automáticos',
      'Action items',
      'Integração Zoom/Meet',
      'Busca em transcrições',
      'Colaboração em equipe'
    ],
    tags: ['transcrição', 'reuniões', 'notas', 'zoom', 'colaboração'],
    isFeatured: true
  },
  {
    id: 'fireflies',
    name: 'Fireflies.ai',
    shortDescription: 'Assistente de reuniões com IA',
    description: 'Fireflies grava, transcreve e resume reuniões automaticamente com insights.',
    category: 'productivity',
    logo: 'https://fireflies.ai/favicon.ico',
    url: 'https://fireflies.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $10-39/mês',
    rating: 4.5,
    features: [
      'Gravação automática',
      'Transcrição de reuniões',
      'Resumos com IA',
      'CRM sync',
      'Analytics de conversas',
      'Integra com tudo'
    ],
    tags: ['reuniões', 'transcrição', 'crm', 'analytics', 'vendas']
  },
  {
    id: 'motion',
    name: 'Motion',
    shortDescription: 'Calendário e tarefas inteligentes',
    description: 'Motion usa IA para organizar seu calendário e priorizar tarefas automaticamente.',
    category: 'productivity',
    logo: 'https://www.usemotion.com/favicon.ico',
    url: 'https://www.usemotion.com',
    pricing: 'paid',
    priceRange: '$19-34/mês',
    rating: 4.7,
    features: [
      'Agendamento automático',
      'Priorização IA',
      'Calendário inteligente',
      'Gestão de projetos',
      'Bloqueio de tempo automático',
      'Integração com tudo'
    ],
    tags: ['calendário', 'tarefas', 'agendamento', 'priorização', 'automação']
  },
  {
    id: 'reclaim',
    name: 'Reclaim.ai',
    shortDescription: 'Agendamento inteligente de tarefas',
    description: 'Reclaim.ai defende seu tempo agendando tarefas, hábitos e breaks automaticamente.',
    category: 'productivity',
    logo: 'https://reclaim.ai/favicon.ico',
    url: 'https://reclaim.ai',
    pricing: 'freemium',
    priceRange: 'Grátis / $8-18/mês',
    rating: 4.6,
    features: [
      'Smart 1:1s',
      'Hábitos automáticos',
      'Task scheduling',
      'Buffer time',
      'Integração Google/Outlook',
      'Analytics de tempo'
    ],
    tags: ['calendário', 'hábitos', 'tempo', 'agendamento', 'foco']
  },
  {
    id: 'mem',
    name: 'Mem',
    shortDescription: 'Workspace de notas com IA',
    description: 'Mem organiza suas notas automaticamente e recupera informações com IA.',
    category: 'productivity',
    logo: 'https://get.mem.ai/favicon.ico',
    url: 'https://get.mem.ai',
    pricing: 'paid',
    priceRange: '$10/mês',
    rating: 4.4,
    features: [
      'Auto-organização de notas',
      'Busca inteligente',
      'Templates IA',
      'Conexões automáticas',
      'Chat com suas notas',
      'Sincronização cross-device'
    ],
    tags: ['notas', 'organização', 'conhecimento', 'busca', 'segundo-cérebro']
  },
  {
    id: 'superhuman',
    name: 'Superhuman',
    shortDescription: 'Cliente de email ultrarrápido com IA',
    description: 'Superhuman é o email mais rápido do mundo, com IA para resumos e respostas.',
    category: 'productivity',
    logo: 'https://superhuman.com/favicon.ico',
    url: 'https://superhuman.com',
    pricing: 'paid',
    priceRange: '$30/mês',
    rating: 4.8,
    features: [
      'Velocidade extrema',
      'Resumos IA de emails',
      'Respostas sugeridas',
      'Atalhos de teclado',
      'Follow-up reminders',
      'Email tracking'
    ],
    tags: ['email', 'produtividade', 'rápido', 'profissional', 'premium']
  },
  {
    id: 'tldv',
    name: 'tl;dv',
    shortDescription: 'Gravação e resumo de reuniões',
    description: 'tl;dv grava reuniões Zoom/Meet e gera resumos, clips e insights automaticamente.',
    category: 'productivity',
    logo: 'https://tldv.io/favicon.ico',
    url: 'https://tldv.io',
    pricing: 'freemium',
    priceRange: 'Grátis / $20-38/mês',
    rating: 4.7,
    features: [
      'Gravação automática',
      'Transcrição em 30+ idiomas',
      'Resumos IA',
      'Clips destacados',
      'CRM sync',
      'Analytics de call'
    ],
    tags: ['reuniões', 'vendas', 'zoom', 'resumos', 'clips']
  },
  {
    id: 'chatpdf',
    name: 'ChatPDF',
    shortDescription: 'Converse com seus PDFs',
    description: 'ChatPDF permite fazer perguntas sobre qualquer PDF e obter respostas instantâneas.',
    category: 'productivity',
    logo: 'https://www.chatpdf.com/favicon.ico',
    url: 'https://www.chatpdf.com',
    pricing: 'freemium',
    priceRange: 'Grátis / $5-14.99/mês',
    rating: 4.5,
    features: [
      'Chat com PDFs',
      'Resumos automáticos',
      'Citações precisas',
      'Multi-idioma',
      'Upload de múltiplos PDFs',
      'Chrome extension'
    ],
    tags: ['pdf', 'documentos', 'pesquisa', 'estudos', 'análise']
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
