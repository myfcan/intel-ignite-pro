import { PromptCategory } from '../../types/prompt';

export const freePromptsCategory: PromptCategory = {
  id: 'free',
  name: 'Prompts Grátis',
  description: 'Todos os prompts gratuitos disponíveis na plataforma',
  icon: 'Gift',
  color: 'bg-green-500',
  isPopular: true,
  prompts: [
    {
      id: 'brainstorm-ideas',
      categoryId: 'free',
      title: 'Gerador de Ideias Criativas',
      description: 'Brainstorming estruturado para qualquer projeto',
      template: `Gere 15 ideias criativas para {topic} considerando {context}:

Para cada ideia forneça:
- Título curto e impactante
- Descrição em 2 frases
- Nível de esforço (baixo/médio/alto)
- Potencial de impacto (⭐1-5)

Organize das mais inovadoras às mais práticas.`,
      variables: [
        { name: 'topic', label: 'Tema/projeto', placeholder: 'Ex: Campanha de marketing', type: 'text', required: true },
        { name: 'context', label: 'Contexto', placeholder: 'Ex: Lançamento de produto tech', type: 'text', required: true }
      ],
      examples: [{
        title: 'Ideias de conteúdo',
        input: { topic: 'Posts para Instagram', context: 'Loja de roupas sustentáveis' },
        output: '1. **Antes e Depois**: Transformação de looks com peças da loja\n- Esforço: Baixo\n- Impacto: ⭐⭐⭐⭐'
      }],
      tags: ['criatividade', 'brainstorm', 'ideias', 'inovação'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'text-improver',
      categoryId: 'free',
      title: 'Melhorador de Textos',
      description: 'Aprimore qualquer texto tornando-o mais claro e persuasivo',
      template: `Melhore este texto mantendo {tone} e focando em {goal}:

Texto original:
{original_text}

Forneça:
1. Versão melhorada
2. 3 principais mudanças feitas
3. Por que ficou melhor
4. Sugestões adicionais`,
      variables: [
        { name: 'original_text', label: 'Texto original', placeholder: 'Cole seu texto aqui', type: 'textarea', required: true },
        { name: 'tone', label: 'Tom', placeholder: 'Ex: Profissional, amigável', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Conversão, engajamento', type: 'text', required: true }
      ],
      examples: [{
        title: 'Bio Instagram',
        input: { original_text: 'Vendo roupas', tone: 'Inspirador', goal: 'Atrair seguidores' },
        output: '**Melhorado:** "Transformando looks comuns em extraordinários ✨\nModa sustentável que conta sua história"'
      }],
      tags: ['escrita', 'copywriting', 'melhoria', 'revisão'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'social-media-caption',
      categoryId: 'free',
      title: 'Legendas para Redes Sociais',
      description: 'Crie legendas envolventes para suas postagens',
      template: `Crie 5 legendas para {platform} sobre {topic}:

Tom: {tone}
Objetivo: {goal}
Tamanho: {length}

Cada legenda deve incluir:
- Hook inicial forte
- Call-to-action
- Hashtags relevantes (10-15)
- Emojis estratégicos`,
      variables: [
        { name: 'platform', label: 'Plataforma', placeholder: 'Instagram/LinkedIn/TikTok', type: 'select', options: ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Twitter'], required: true },
        { name: 'topic', label: 'Assunto do post', placeholder: 'Ex: Lançamento de produto', type: 'text', required: true },
        { name: 'tone', label: 'Tom', placeholder: 'Ex: Casual, inspirador', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Engagement, vendas', type: 'text', required: true },
        { name: 'length', label: 'Tamanho', placeholder: 'Curta/Média/Longa', type: 'select', options: ['Curta', 'Média', 'Longa'], required: true }
      ],
      examples: [{
        title: 'Post de motivação',
        input: { platform: 'Instagram', topic: 'Produtividade matinal', tone: 'Inspirador', goal: 'Engajamento', length: 'Média' },
        output: '🌅 E se eu te dissesse que seu dia começa na noite anterior?\n\nDescubra a rotina que mudou minha produtividade:\n👇 Comenta "SIM" que te mando o checklist'
      }],
      tags: ['social-media', 'legenda', 'copywriting', 'engagement'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'resume-optimizer',
      categoryId: 'free',
      title: 'Otimizador de Currículo',
      description: 'Otimize seu currículo para passar por ATS e impressionar recrutadores',
      template: `Otimize este currículo para vaga de {position}:

Experiência atual:
{experience}

Forneça:
1. Resumo profissional impactante (3 linhas)
2. Experiências reformuladas (foco em resultados)
3. Habilidades priorizadas
4. Keywords para ATS
5. Formato sugerido`,
      variables: [
        { name: 'position', label: 'Vaga desejada', placeholder: 'Ex: Analista de Marketing', type: 'text', required: true },
        { name: 'experience', label: 'Sua experiência', placeholder: 'Descreva brevemente sua experiência', type: 'textarea', required: true }
      ],
      examples: [{
        title: 'Vaga tech',
        input: { position: 'Desenvolvedor Full Stack', experience: 'Trabalhei 2 anos desenvolvendo sites' },
        output: '**Resumo:** Desenvolvedor Full Stack com 2 anos criando soluções web escaláveis, reduzindo tempo de load em 40% e aumentando conversão em clientes B2B.'
      }],
      tags: ['currículo', 'carreira', 'emprego', 'cv'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    }
  ]
};
