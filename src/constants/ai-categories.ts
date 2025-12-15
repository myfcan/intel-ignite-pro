// src/constants/ai-categories.ts
// Categorias e configurações para aulas sobre IA

export const AI_TOOLS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude AI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'grok', label: 'Grok (X AI)' },
  { value: 'copilot', label: 'Microsoft Copilot' },
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'dall-e', label: 'DALL-E' },
  { value: 'stable-diffusion', label: 'Stable Diffusion' },
  { value: 'runway', label: 'Runway (Vídeo)' },
  { value: 'sora', label: 'Sora (Vídeo)' },
  { value: 'elevenlabs', label: 'ElevenLabs (Áudio)' },
] as const;

export const AI_TOPICS = [
  { value: 'prompt-engineering', label: 'Prompt Engineering' },
  { value: 'ai-marketing', label: 'IA para Marketing' },
  { value: 'ai-sales', label: 'IA para Vendas' },
  { value: 'ai-content', label: 'IA para Criação de Conteúdo' },
  { value: 'ai-business', label: 'IA para Negócios' },
  { value: 'ai-automation', label: 'Automação com IA' },
  { value: 'ai-design', label: 'IA para Design' },
  { value: 'ai-productivity', label: 'IA para Produtividade' },
  { value: 'ai-copywriting', label: 'IA para Copywriting' },
  { value: 'ai-research', label: 'IA para Pesquisa' },
  { value: 'ai-analysis', label: 'IA para Análise de Dados' },
  { value: 'ai-social-media', label: 'IA para Redes Sociais' },
] as const;

export const AI_CATEGORIES = [
  {
    group: '🤖 Ferramentas de IA',
    items: AI_TOOLS,
  },
  {
    group: '🎯 Tópicos e Aplicações',
    items: AI_TOPICS,
  },
] as const;

// Exemplos de narrativas por categoria (diversos tipos de aulas)
export const NARRATIVE_EXAMPLES = {
  'chatgpt': `"ChatGPT revolucionou como interagimos com IA.

Mas você sabe realmente como ele funciona por trás das cortinas?

Vamos explorar desde os fundamentos até técnicas avançadas de uso."`,

  'claude': `"Claude se destaca em análise profunda e raciocínio complexo.

Mas quando usar Claude ao invés de ChatGPT?

Vou te mostrar 5 cenários onde cada um brilha."`,

  'gemini': `"Gemini traz a potência do Google para IA conversacional.

Com acesso a dados em tempo real e integração com ferramentas Google.

Descubra como aproveitar esses superpoderes."`,

  'prompt-engineering': `"Um prompt bem construído pode transformar resultados mediocres em extraordinários.

Vamos desvendar a ciência por trás de prompts eficazes.

Você vai aprender frameworks, técnicas e boas práticas."`,

  'ai-marketing': `"IA está transformando o marketing digital.

De criação de conteúdo a análise de dados, segmentação a automação.

Explore como aplicar IA em cada etapa do funil de marketing."`,

  'ai-content': `"Criar conteúdo de qualidade leva tempo e criatividade.

IA pode acelerar o processo sem perder autenticidade.

Descubra como usar IA como copiloto criativo."`,

  'midjourney': `"Midjourney democratizou a criação de imagens com IA.

Mas dominar prompts visuais é uma arte.

Aprenda a anatomia de prompts que geram resultados incríveis."`,

  'perplexity': `"Perplexity combina busca tradicional com poder de IA.

É como ter um pesquisador expert ao seu lado.

Veja como usar Perplexity para pesquisas profundas e precisas."`,

  'ai-automation': `"Automação com IA vai além de bots simples.

Podemos criar fluxos inteligentes que aprendem e se adaptam.

Explore casos práticos de automação inteligente."`,
} as const;

// Objetivos de aprendizado por categoria (diversos focos)
export const LEARNING_OBJECTIVES_TEMPLATES = {
  'chatgpt': [
    'Compreender como ChatGPT processa e gera respostas',
    'Aplicar técnicas avançadas de prompting',
    'Identificar limitações e vieses do modelo',
    'Usar ChatGPT efetivamente em diferentes contextos',
  ],
  'claude': [
    'Entender quando usar Claude vs outros modelos',
    'Aproveitar capacidades analíticas do Claude',
    'Criar documentos técnicos com precisão',
    'Usar Claude para pesquisa e síntese profunda',
  ],
  'gemini': [
    'Explorar integrações do Gemini com Google',
    'Usar busca em tempo real efetivamente',
    'Combinar Gemini com outras ferramentas Google',
    'Aproveitar multimodalidade (texto + imagens)',
  ],
  'prompt-engineering': [
    'Entender a anatomia de prompts eficazes',
    'Aplicar frameworks de prompting (Zero-shot, Few-shot, Chain-of-thought)',
    'Criar prompts específicos por objetivo',
    'Iterar e refinar prompts sistematicamente',
  ],
  'ai-marketing': [
    'Aplicar IA em análise de mercado e personas',
    'Gerar conteúdo otimizado para SEO',
    'Automatizar workflows de marketing',
    'Medir e otimizar campanhas com IA',
  ],
  'ai-content': [
    'Usar IA como copiloto criativo',
    'Manter voz e autenticidade no conteúdo',
    'Escalar produção sem perder qualidade',
    'Editar e refinar output de IA',
  ],
  'midjourney': [
    'Construir prompts visuais efetivos',
    'Entender parâmetros e modificadores',
    'Iterar designs usando variações',
    'Criar estilos consistentes',
  ],
  'perplexity': [
    'Formular queries de pesquisa eficazes',
    'Interpretar e validar fontes',
    'Usar Perplexity para research profundo',
    'Combinar Perplexity com outras ferramentas',
  ],
} as const;

// Tags sugeridas por categoria
export const SUGGESTED_TAGS = {
  'chatgpt': ['prompts', 'gpt-4', 'produtividade', 'automação'],
  'claude': ['análise', 'precisão', 'documentos', 'pesquisa'],
  'gemini': ['google', 'multimodal', 'integração'],
  'prompt-engineering': ['prompts', 'frameworks', 'metodologia', 'avançado'],
  'ai-marketing': ['marketing', 'vendas', 'conversão', 'copywriting'],
  'ai-content': ['conteúdo', 'criação', 'redes sociais', 'blogs'],
  'midjourney': ['imagens', 'design', 'criativo', 'prompts visuais'],
} as const;

export type AICategoryValue =
  | typeof AI_TOOLS[number]['value']
  | typeof AI_TOPICS[number]['value'];

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_LABELS: Record<AIDifficulty, string> = {
  beginner: 'Iniciante - Nunca usei IA',
  intermediate: 'Intermediário - Já uso mas quero melhorar',
  advanced: 'Avançado - Quero dominar e lucrar',
} as const;
