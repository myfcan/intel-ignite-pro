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

// Exemplos de narrativas por categoria
export const NARRATIVE_EXAMPLES = {
  'chatgpt': `"98% das pessoas usa ChatGPT como um brinquedo. Eles pedem piadas, poemas, curiosidades...

Enquanto isso, os 2% que DOMINAM ChatGPT estão fazendo R$ 30.000/mês em 2 horas por dia.

A diferença? Eles sabem exatamente COMO pedir. E você vai aprender isso agora."`,

  'prompt-engineering': `"Vou te mostrar a diferença entre um prompt que vale R$ 0 e um prompt que vale R$ 500.

A diferença? 30 segundos.

Mas esses 30 segundos separam quem brinca de IA de quem LUCRA com IA."`,

  'ai-marketing': `"Enquanto 98% copia e cola respostas genéricas da IA...

Os 2% que dominam IA para Marketing estão criando campanhas que convertem 10x mais.

Mesma IA. Resultados COMPLETAMENTE diferentes."`,

  'claude': `"Claude não é 'só mais uma IA'.

Ele é o MELHOR para análise profunda, raciocínio complexo e trabalhos que exigem precisão.

Vou te mostrar casos que ChatGPT falha e Claude DOMINA."`,

  'midjourney': `"A diferença entre uma imagem amadora e uma imagem profissional de R$ 500?

Não é talento. É PROMPT.

Vou te mostrar a anatomia de um prompt Midjourney que gera resultados vendáveis."`,
} as const;

// Objetivos de aprendizado por categoria
export const LEARNING_OBJECTIVES_TEMPLATES = {
  'chatgpt': [
    'Dominar o Método PERFEITO de prompts',
    'Criar prompts que geram resultados vendáveis',
    'Economizar 20+ horas por semana com IA',
    'Transformar ChatGPT em ferramenta de renda',
  ],
  'prompt-engineering': [
    'Entender a anatomia de prompts profissionais',
    'Aplicar frameworks de prompting avançados',
    'Criar prompts específicos por objetivo',
    'Comparar prompts genéricos vs estratégicos',
  ],
  'ai-marketing': [
    'Criar campanhas de marketing com IA',
    'Gerar copies que convertem usando IA',
    'Automatizar criação de conteúdo para redes sociais',
    'Segmentar público usando análise de IA',
  ],
  'claude': [
    'Entender quando usar Claude vs ChatGPT',
    'Aproveitar capacidades analíticas do Claude',
    'Criar documentos técnicos com precisão',
    'Usar Claude para pesquisa e síntese',
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
