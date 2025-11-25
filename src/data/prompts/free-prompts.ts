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
    },
    {
      id: 'email-professional',
      categoryId: 'free',
      title: 'Gerador de Email Profissional',
      description: 'Escreva emails profissionais para qualquer situação',
      template: `Escreva email profissional para {situation}:

Para: {recipient}
Tom: {tone}
Objetivo: {goal}

Forneça:
1. Assunto persuasivo (3 opções)
2. Corpo do email
3. Call-to-action claro
4. Dicas de quando enviar
5. Follow-up sugerido se não responder`,
      variables: [
        { name: 'situation', label: 'Situação', placeholder: 'Ex: Proposta comercial, networking', type: 'text', required: true },
        { name: 'recipient', label: 'Destinatário', placeholder: 'Ex: Cliente potencial, recrutador', type: 'text', required: true },
        { name: 'tone', label: 'Tom', placeholder: 'Formal/Amigável/Persuasivo', type: 'select', options: ['Formal', 'Amigável', 'Persuasivo'], required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Marcar reunião, fechar venda', type: 'text', required: true }
      ],
      examples: [{
        title: 'Cold email vendas',
        input: { situation: 'Primeiro contato vendas', recipient: 'Dono de e-commerce', tone: 'Amigável', goal: 'Marcar call de 15 min' },
        output: 'Assunto: Ideia rápida para aumentar suas vendas\n\nOlá {Nome},\n\nNotei que...'
      }],
      tags: ['email', 'comunicação', 'profissional', 'vendas'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'presentation-outline',
      categoryId: 'free',
      title: 'Estrutura de Apresentação',
      description: 'Crie apresentações impactantes e persuasivas',
      template: `Crie estrutura de apresentação sobre {topic} para {audience} em {duration} minutos:

Objetivo: {goal}

Forneça:
1. Abertura impactante
2. Estrutura de slides (títulos + conteúdo)
3. Storytelling e exemplos
4. Call-to-action final
5. Dicas de apresentação
6. Perguntas esperadas (Q&A)`,
      variables: [
        { name: 'topic', label: 'Tema', placeholder: 'Ex: Produto novo, projeto', type: 'text', required: true },
        { name: 'audience', label: 'Audiência', placeholder: 'Ex: Investidores, equipe', type: 'text', required: true },
        { name: 'duration', label: 'Duração', placeholder: 'Ex: 10, 20, 30', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Aprovar orçamento, inspirar', type: 'text', required: true }
      ],
      examples: [{
        title: 'Pitch de startup',
        input: { topic: 'Novo app de delivery', audience: 'Investidores', duration: '15', goal: 'Conseguir seed funding' },
        output: 'Slide 1: O problema (1 min)\nSlide 2: Nossa solução (2 min)\nSlide 3: Tração (2 min)...'
      }],
      tags: ['apresentação', 'pitch', 'slides', 'comunicação'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'meeting-agenda',
      categoryId: 'free',
      title: 'Agenda de Reunião Produtiva',
      description: 'Planeje reuniões eficientes que geram resultados',
      template: `Crie agenda para reunião sobre {topic} com duração de {duration}:

Participantes: {participants}
Objetivo: {goal}

Inclua:
1. Pauta estruturada (timeline)
2. Pontos de discussão
3. Decisões necessárias
4. Responsáveis por ação
5. Próximos passos
6. Template de ata`,
      variables: [
        { name: 'topic', label: 'Tema da reunião', placeholder: 'Ex: Planejamento trimestral', type: 'text', required: true },
        { name: 'duration', label: 'Duração', placeholder: 'Ex: 30min, 1h', type: 'text', required: true },
        { name: 'participants', label: 'Participantes', placeholder: 'Ex: Equipe, diretoria', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Definir metas, alinhar projeto', type: 'text', required: true }
      ],
      examples: [{
        title: 'Reunião de projeto',
        input: { topic: 'Kickoff novo projeto', duration: '1h', participants: 'Equipe de 5', goal: 'Alinhar escopo e deadlines' },
        output: '0-10min: Apresentação do projeto\n10-30min: Definição de escopo\n30-50min: Timeline e responsáveis...'
      }],
      tags: ['reunião', 'produtividade', 'gestão', 'planejamento'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    }
  ]
};
