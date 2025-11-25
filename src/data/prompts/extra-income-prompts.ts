import { PromptCategory } from '../../types/prompt';

export const extraIncomePromptsCategory: PromptCategory = {
  id: 'extra-income',
  name: 'Renda Extra',
  description: 'Prompts para criar fontes de renda online e monetizar habilidades',
  icon: 'DollarSign',
  color: 'bg-emerald-500',
  isPopular: true,
  prompts: [
    {
      id: 'freelance-service-package',
      categoryId: 'extra-income',
      title: 'Pacote de Serviço Freelance',
      description: 'Crie um pacote de serviço atrativo para vender como freelancer',
      template: `Crie um pacote de serviço freelance profissional para {skill} voltado para {niche}.

Estruture:
1. Nome do Pacote impactante
2. Descrição de venda (problema-solução-resultado)
3. Três tiers de preço (Básico/Pro/Premium)
4. Entregáveis detalhados
5. Processo de trabalho (5 etapas)
6. FAQ (5 perguntas)
7. Call-to-action forte

Foco em valor para o cliente, não em você.`,
      variables: [
        { name: 'skill', label: 'Sua habilidade/serviço', placeholder: 'Ex: Design de logos', type: 'text', required: true },
        { name: 'niche', label: 'Nicho/público-alvo', placeholder: 'Ex: Startups tech', type: 'text', required: true }
      ],
      examples: [{
        title: 'Design de logos para startups',
        input: { skill: 'Design de logos', niche: 'Startups tech' },
        output: '**Pacote:** Identidade Visual Startup-Ready\n\n**BÁSICO** ($250): Logo vetorial + 2 revisões\n**PRO** ($500): Logo + manual de marca + 5 revisões\n**PREMIUM** ($1000): Identidade completa + aplicações + consultoria'
      }],
      tags: ['freelance', 'serviços', 'vendas', 'monetização'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'digital-product-idea',
      categoryId: 'extra-income',
      title: 'Gerador de Produto Digital',
      description: 'Gere ideias validadas de produtos digitais para vender',
      template: `Gere 5 ideias de produtos digitais rentáveis para {expertise} voltado para {audience} com ticket médio de {price_range}.

Para cada ideia inclua:
- Nome e tipo (ebook/curso/template/planilha)
- Problema específico que resolve
- Conteúdo principal (5-7 tópicos)
- Preço sugerido e justificativa
- Tempo de criação estimado
- Canais de venda ideais
- Potencial de venda (⭐1-5)

Ranqueie do mais fácil de executar ao mais lucrativo.`,
      variables: [
        { name: 'expertise', label: 'Sua área de conhecimento', placeholder: 'Ex: Marketing digital', type: 'text', required: true },
        { name: 'audience', label: 'Público-alvo', placeholder: 'Ex: Pequenos empreendedores', type: 'text', required: true },
        { name: 'price_range', label: 'Faixa de preço', placeholder: 'Ex: $27-97', type: 'text', required: true }
      ],
      examples: [{
        title: 'Produtos para coaches',
        input: { expertise: 'Coaching pessoal', audience: 'Profissionais em transição', price_range: '$47-197' },
        output: '1. **Planilha de Autoconhecimento** ($47)\n- Identifique seus valores e objetivos\n- 7 worksheets interativos\n- Criação: 1 semana\n- Potencial: ⭐⭐⭐⭐'
      }],
      tags: ['infoproduto', 'renda passiva', 'digital', 'criação'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'affiliate-content-strategy',
      categoryId: 'extra-income',
      title: 'Estratégia de Conteúdo para Afiliados',
      description: 'Planeje conteúdo que converte em comissões de afiliados',
      template: `Crie estratégia de conteúdo de afiliados para {product} via {platform}:

1. Análise do produto (pontos fortes, objeções, público ideal)
2. Calendário de 30 dias (4 posts/semana com ganchos)
3. Scripts de venda natural (3 variações)
4. SEO/Hashtags estratégicos
5. Métricas de sucesso e ganho estimado/mês

Foque em agregar valor, não apenas vender.`,
      variables: [
        { name: 'product', label: 'Produto/nicho de afiliação', placeholder: 'Ex: Curso de fotografia', type: 'text', required: true },
        { name: 'platform', label: 'Plataforma principal', placeholder: 'Ex: Instagram', type: 'select', options: ['Instagram', 'YouTube', 'TikTok', 'Blog', 'Pinterest'], required: true }
      ],
      examples: [{
        title: 'Afiliado de ferramentas SaaS',
        input: { product: 'Ferramenta de automação', platform: 'LinkedIn' },
        output: 'Semana 1:\n- Post 1: Como a automação salvou 10h/semana\n- Post 2: Comparativo de ferramentas\n- Post 3: Tutorial básico\n- Post 4: Case de sucesso'
      }],
      tags: ['afiliados', 'monetização', 'conteúdo', 'vendas'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'consulting-positioning',
      categoryId: 'extra-income',
      title: 'Posicionamento de Consultoria',
      description: 'Defina seu posicionamento único como consultor independente',
      template: `Defina posicionamento de consultoria para {experience} no setor {industry}:

1. Nicho ultra-específico (quem atende, problema específico)
2. Oferta principal de consultoria com preço
3. Ofertas complementares (diagnóstico/mentoria/done-for-you)
4. Prova social necessária
5. Estratégia de aquisição de clientes
6. Como conseguir primeiro cliente em 30 dias`,
      variables: [
        { name: 'experience', label: 'Sua experiência/conhecimento', placeholder: 'Ex: 10 anos em vendas B2B', type: 'text', required: true },
        { name: 'industry', label: 'Indústria/setor', placeholder: 'Ex: SaaS', type: 'text', required: true }
      ],
      examples: [{
        title: 'Consultoria de marketing',
        input: { experience: '5 anos em growth marketing', industry: 'E-commerce' },
        output: 'Nicho: Lojas Shopify com $10k-50k/mês que querem dobrar vendas\nOferta: Auditoria + plano de 90 dias ($2500)'
      }],
      tags: ['consultoria', 'posicionamento', 'vendas', 'b2b'],
      difficulty: 'advanced',
      isPremium: false
    },
    {
      id: 'course-outline-creator',
      categoryId: 'extra-income',
      title: 'Estrutura de Curso Online',
      description: 'Crie a estrutura completa de um curso online lucrativo',
      template: `Crie estrutura de curso online sobre {topic} nível {level}:

1. Título + subtítulo impactantes
2. 5-7 módulos com aulas detalhadas
3. Exercícios práticos por módulo
4. Bônus irresistíveis (3)
5. Transformação prometida (antes/depois)
6. Landing page copy
7. Cronograma de produção (6 semanas)

Preço sugerido e justificativa.`,
      variables: [
        { name: 'topic', label: 'Tema do curso', placeholder: 'Ex: Instagram para negócios', type: 'text', required: true },
        { name: 'level', label: 'Nível', placeholder: 'Iniciante/Intermediário/Avançado', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado'], required: true }
      ],
      examples: [{
        title: 'Curso de edição de vídeo',
        input: { topic: 'Edição de vídeo para YouTube', level: 'Iniciante' },
        output: 'Módulo 1: Fundamentos\nMódulo 2: Software essencial\nMódulo 3: Técnicas de corte...\nPreço: $197'
      }],
      tags: ['curso', 'infoproduto', 'educação', 'estrutura'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'service-pricing-calculator',
      categoryId: 'extra-income',
      title: 'Calculadora de Preço de Serviço',
      description: 'Calcule quanto cobrar pelos seus serviços de forma justa e lucrativa',
      template: `Calcule preço ideal para {service_type} com {experience_years} anos de experiência em {market}:

1. Custos base (hora de trabalho, impostos, ferramentas, margem)
2. Benchmark de mercado (baixo/médio/premium)
3. Estrutura de preços (por hora, pacotes, retainer)
4. Tabela de serviços com preços mín/ideal
5. Estratégias de aumento gradual
6. Scripts de negociação`,
      variables: [
        { name: 'service_type', label: 'Tipo de serviço', placeholder: 'Ex: Copy para landing pages', type: 'text', required: true },
        { name: 'experience_years', label: 'Anos de experiência', placeholder: 'Ex: 2', type: 'text', required: true },
        { name: 'market', label: 'Mercado local', placeholder: 'Ex: Brasil, interior de SP', type: 'text', required: true }
      ],
      examples: [{
        title: 'Designer gráfico',
        input: { service_type: 'Design de posts', experience_years: '3', market: 'São Paulo' },
        output: 'Por hora: R$150\nPacote 10 posts: R$1200\nRetainer mensal: R$3500'
      }],
      tags: ['precificação', 'serviços', 'vendas', 'valor'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'youtube-monetization',
      categoryId: 'extra-income',
      title: 'Estratégia de Monetização YouTube',
      description: 'Plano completo para monetizar um canal do YouTube',
      template: `Crie plano de monetização YouTube para nicho {niche} com meta de {revenue_goal}/mês:

1. Fontes de renda (AdSense, membros, patrocínios, afiliados, produtos)
2. Calendário de 30 dias com temas e ganchos
3. Otimização de revenue (duração, ads, CTAs)
4. Metas de crescimento (inscritos, views, CTR, retenção)
5. 10 títulos virais para o nicho
6. Primeiros 90 dias detalhados`,
      variables: [
        { name: 'niche', label: 'Nicho do canal', placeholder: 'Ex: Finanças pessoais', type: 'text', required: true },
        { name: 'revenue_goal', label: 'Meta de receita mensal', placeholder: 'Ex: $2000', type: 'text', required: true }
      ],
      examples: [{
        title: 'Canal de tech reviews',
        input: { niche: 'Reviews de gadgets', revenue_goal: '$3000' },
        output: 'AdSense: $800\nAfiliados Amazon: $1500\nPatrocínios: $700\nTotal: $3000'
      }],
      tags: ['youtube', 'monetização', 'vídeo', 'ads'],
      difficulty: 'intermediate',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'instagram-shop-setup',
      categoryId: 'extra-income',
      title: 'Setup de Loja no Instagram',
      description: 'Monte uma estratégia completa para vender pelo Instagram',
      template: `Crie estratégia Instagram Shop para {product_type} ticket médio {average_ticket}:

1. Perfil de conversão (bio, link, highlights)
2. Grid estratégico (primeiros 9 posts)
3. Funil de vendas (topo/meio/fundo)
4. Stories diários que vendem
5. 10 ideias de Reels virais
6. DM automation e scripts de venda
7. Métricas e metas`,
      variables: [
        { name: 'product_type', label: 'Tipo de produto', placeholder: 'Ex: Bijuterias artesanais', type: 'text', required: true },
        { name: 'average_ticket', label: 'Ticket médio', placeholder: 'Ex: $45', type: 'text', required: true }
      ],
      examples: [{
        title: 'Loja de roupas fitness',
        input: { product_type: 'Roupas fitness femininas', average_ticket: '$80' },
        output: 'Bio: "Looks que te fazem sentir poderosa 💪 | Frete grátis acima de $100"\nPost 1: Before/After de cliente...'
      }],
      tags: ['instagram', 'vendas', 'social media', 'e-commerce'],
      difficulty: 'intermediate',
      isPremium: false
    }
  ]
};
