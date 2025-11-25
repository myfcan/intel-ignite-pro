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
      isPremium: true
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
      isPremium: true
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
      isPremium: true,
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
      isPremium: true
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
      isPremium: true,
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
      isPremium: true
    },
    {
      id: 'ebook-creator',
      categoryId: 'extra-income',
      title: 'Criador de E-book Lucrativo',
      description: 'Estruture um e-book que vende',
      template: `Crie estrutura completa de e-book sobre {topic} para {target_audience}:

1. Título e subtítulo magnéticos
2. Sumário (7-10 capítulos)
3. Conteúdo de cada capítulo (pontos-chave)
4. Bônus exclusivos (3)
5. Landing page copy
6. Preço sugerido e justificativa
7. Estratégia de lançamento (30 dias)

Foco em transformação e resultados.`,
      variables: [
        { name: 'topic', label: 'Tema do e-book', placeholder: 'Ex: Produtividade para mães', type: 'text', required: true },
        { name: 'target_audience', label: 'Público-alvo', placeholder: 'Ex: Mães empreendedoras', type: 'text', required: true }
      ],
      examples: [{
        title: 'E-book de investimentos',
        input: { topic: 'Investir com pouco dinheiro', target_audience: 'Iniciantes em finanças' },
        output: 'Cap 1: Mindset do investidor\nCap 2: Primeiros R$100...\nPreço: $27'
      }],
      tags: ['ebook', 'infoproduto', 'digital', 'escrita'],
      difficulty: 'beginner',
      isPremium: true
    },
    {
      id: 'dropshipping-niche',
      categoryId: 'extra-income',
      title: 'Validador de Nicho Dropshipping',
      description: 'Valide nichos lucrativos para dropshipping',
      template: `Analise viabilidade de dropshipping para {niche}:

1. Demanda (volume de busca, tendências)
2. Concorrência (nível, gaps de mercado)
3. Margem de lucro (custo vs preço de venda)
4. Fornecedores confiáveis
5. Produtos específicos (5 sugestões)
6. Estratégia de marketing
7. Investimento inicial necessário
8. Projeção de faturamento (3 meses)`,
      variables: [
        { name: 'niche', label: 'Nicho a validar', placeholder: 'Ex: Pet tech, fitness home', type: 'text', required: true }
      ],
      examples: [{
        title: 'Nicho pet',
        input: { niche: 'Acessórios tech para pets' },
        output: 'Demanda: Alta (15k buscas/mês)\nConcorrência: Média\nMargem: 40-60%\nProduto #1: Coleira GPS...'
      }],
      tags: ['dropshipping', 'e-commerce', 'validação', 'nicho'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'membership-model',
      categoryId: 'extra-income',
      title: 'Modelo de Assinatura/Membership',
      description: 'Crie um modelo de negócio recorrente',
      template: `Desenvolva modelo de membership para {expertise} com ticket de {monthly_price}/mês:

1. Formato (comunidade/conteúdo/serviço)
2. Tiers de preço (3 níveis)
3. Benefícios de cada tier
4. Conteúdo mensal esperado
5. Estratégia de retenção
6. Processo de onboarding
7. Como chegar a 100 membros
8. Projeção de MRR (6 meses)`,
      variables: [
        { name: 'expertise', label: 'Sua expertise', placeholder: 'Ex: Marketing digital', type: 'text', required: true },
        { name: 'monthly_price', label: 'Preço mensal base', placeholder: 'Ex: $47', type: 'text', required: true }
      ],
      examples: [{
        title: 'Membership fitness',
        input: { expertise: 'Treinos em casa', monthly_price: '$29' },
        output: 'Básico: $29 (treinos + comunidade)\nPro: $49 (+ plano nutricional)\nVIP: $99 (+ coaching 1-1)'
      }],
      tags: ['membership', 'assinatura', 'recorrente', 'mrr'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'printables-store',
      categoryId: 'extra-income',
      title: 'Loja de Printables Lucrativos',
      description: 'Monte uma loja de produtos imprimíveis',
      template: `Crie estratégia de printables para {niche}:

1. Top 10 produtos mais vendidos no nicho
2. Preços sugeridos
3. Ferramentas de criação (Canva, etc)
4. Plataformas de venda (Etsy, Gumroad)
5. SEO e keywords
6. Mock-ups de produtos
7. Plano de lançamento (primeiro mês)
8. Meta de vendas realista`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Planejamento, educação infantil', type: 'text', required: true }
      ],
      examples: [{
        title: 'Printables educação',
        input: { niche: 'Atividades para crianças' },
        output: '1. Calendário de rotinas ($5)\n2. Flash cards alfabeto ($7)\n3. Jogos de matemática ($8)...'
      }],
      tags: ['printables', 'etsy', 'digital', 'passivo'],
      difficulty: 'beginner',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'podcast-monetization',
      categoryId: 'extra-income',
      title: 'Monetização de Podcast',
      description: 'Transforme seu podcast em fonte de renda',
      template: `Crie plano de monetização de podcast sobre {topic} com {listeners} ouvintes:

1. Fontes de renda (patrocínios, ads, produtos, membership)
2. Estrutura de episódios otimizada para monetização
3. Kit de mídia para patrocinadores
4. Precificação de anúncios
5. Produtos próprios para vender
6. Estratégia de crescimento para 10k ouvintes
7. Projeção de receita (6 meses)`,
      variables: [
        { name: 'topic', label: 'Tema do podcast', placeholder: 'Ex: Empreendedorismo', type: 'text', required: true },
        { name: 'listeners', label: 'Ouvintes mensais', placeholder: 'Ex: 1000', type: 'text', required: true }
      ],
      examples: [{
        title: 'Podcast de tech',
        input: { topic: 'Tecnologia e inovação', listeners: '2000' },
        output: 'Patrocínios: $500/mês\nProdutos próprios: $300\nMembership: $400\nTotal: $1200/mês'
      }],
      tags: ['podcast', 'áudio', 'monetização', 'conteúdo'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'notion-templates',
      categoryId: 'extra-income',
      title: 'Vendedor de Templates Notion',
      description: 'Crie e venda templates Notion lucrativos',
      template: `Desenvolva linha de templates Notion para {niche}:

1. Top 5 templates mais vendáveis
2. Funcionalidades de cada um
3. Preços sugeridos
4. Demo e screenshots necessários
5. Plataformas de venda (Gumroad, Etsy)
6. Marketing no Twitter/LinkedIn
7. Bundle e upsells
8. Previsão de vendas mensal`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Estudantes, freelancers, startups', type: 'text', required: true }
      ],
      examples: [{
        title: 'Templates para freelancers',
        input: { niche: 'Freelancers criativos' },
        output: '1. CRM de clientes ($19)\n2. Controle financeiro ($15)\n3. Portfólio interativo ($25)...'
      }],
      tags: ['notion', 'templates', 'digital', 'produtividade'],
      difficulty: 'beginner',
      isPremium: true
    },
    {
      id: 'stock-photos',
      categoryId: 'extra-income',
      title: 'Estratégia de Stock Photos',
      description: 'Monetize suas fotos em bancos de imagens',
      template: `Crie estratégia de stock photos para {style}:

1. Nichos mais lucrativos
2. Tipos de fotos em alta demanda
3. Plataformas (Shutterstock, Adobe Stock, etc)
4. Requisitos técnicos
5. Keywords e tags otimizadas
6. Plano de produção (100 fotos/mês)
7. Precificação e royalties
8. Meta de renda passiva (6 meses)`,
      variables: [
        { name: 'style', label: 'Estilo de fotografia', placeholder: 'Ex: Lifestyle, business, natureza', type: 'text', required: true }
      ],
      examples: [{
        title: 'Fotos de trabalho remoto',
        input: { style: 'Lifestyle de trabalho remoto' },
        output: 'Nichos: Home office, coworking, videoconferências\nPlataformas: Shutterstock + Adobe Stock\nMeta: $500/mês passivo'
      }],
      tags: ['fotografia', 'stock', 'passivo', 'imagens'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'amazon-kdp',
      categoryId: 'extra-income',
      title: 'Publicação Amazon KDP',
      description: 'Publique livros lucrativos na Amazon',
      template: `Crie estratégia Amazon KDP para {book_type} no nicho {niche}:

1. Validação de nicho (demanda, concorrência)
2. Tipos de livro mais lucrativos
3. Estrutura/template do livro
4. Processo de criação (ghostwriter, DIY)
5. Capa e formatação
6. Preço e royalties
7. Keywords e categorias
8. Lançamento e promoção
9. Meta: 10 livros em 6 meses`,
      variables: [
        { name: 'book_type', label: 'Tipo de livro', placeholder: 'Ex: Caderno, diário, guia', type: 'text', required: true },
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Gratidão, fitness tracking', type: 'text', required: true }
      ],
      examples: [{
        title: 'Cadernos de gratidão',
        input: { book_type: 'Diário guiado', niche: 'Gratidão e mindfulness' },
        output: 'Conteúdo: 365 prompts de gratidão\nPreço: $7.99\nRoyalty: 70% ($5.59)\nMeta: 30 vendas/mês por livro'
      }],
      tags: ['kdp', 'amazon', 'livros', 'publishing'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'tiktok-creator-fund',
      categoryId: 'extra-income',
      title: 'Monetização TikTok',
      description: 'Ganhe dinheiro com TikTok Creator Fund e mais',
      template: `Crie estratégia TikTok monetizada para nicho {niche}:

1. Fontes de renda (Creator Fund, Live, afiliados, marcas)
2. Tipo de conteúdo viral para o nicho
3. Calendário de 30 dias
4. Hooks e trends adaptados
5. Como chegar a 10k seguidores
6. Parcerias com marcas
7. Produtos próprios para vender
8. Meta de renda (3 meses)`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Finanças, lifestyle, tech', type: 'text', required: true }
      ],
      examples: [{
        title: 'TikTok finanças',
        input: { niche: 'Educação financeira' },
        output: 'Conteúdo: Dicas rápidas de economia\nCreator Fund: $200/mês\nAfiliados: $500\nConsultoria: $800\nTotal: $1500'
      }],
      tags: ['tiktok', 'social media', 'viral', 'criador'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'coaching-package',
      categoryId: 'extra-income',
      title: 'Pacote de Coaching Lucrativo',
      description: 'Estruture pacotes de coaching que vendem',
      template: `Crie pacotes de coaching para {expertise} com ticket de {price_range}:

1. Nicho ultra-específico
2. Transformação prometida
3. Três pacotes (Básico/Intensivo/VIP)
4. Estrutura de sessões
5. Materiais de suporte
6. Processo de vendas
7. Prova social necessária
8. Como fechar 5 clientes/mês`,
      variables: [
        { name: 'expertise', label: 'Sua expertise', placeholder: 'Ex: Transição de carreira', type: 'text', required: true },
        { name: 'price_range', label: 'Faixa de preço', placeholder: 'Ex: $500-2000', type: 'text', required: true }
      ],
      examples: [{
        title: 'Coaching de carreira',
        input: { expertise: 'Transição para tech', price_range: '$800-2500' },
        output: 'Básico: $800 (4 sessões + workbook)\nIntensivo: $1500 (8 sessões + currículo)\nVIP: $2500 (12 sessões + mentoria LinkedIn)'
      }],
      tags: ['coaching', 'mentoria', 'serviços', 'alto ticket'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'virtual-assistant',
      categoryId: 'extra-income',
      title: 'Negócio de Assistência Virtual',
      description: 'Monte um serviço de VA lucrativo',
      template: `Estruture serviço de assistência virtual em {specialty}:

1. Serviços específicos oferecidos
2. Pacotes e preços
3. Nicho ideal de clientes
4. Ferramentas necessárias
5. Processo de entrega
6. Portfólio e casos de uso
7. Onde encontrar clientes
8. Escala: de solo para agência`,
      variables: [
        { name: 'specialty', label: 'Especialidade', placeholder: 'Ex: Social media, admin, email', type: 'text', required: true }
      ],
      examples: [{
        title: 'VA de social media',
        input: { specialty: 'Gestão de Instagram' },
        output: 'Pacote Básico: $500/mês (planejamento + agendamento)\nPlus: $800 (+ stories diários)\nPremium: $1200 (+ Reels + relatórios)'
      }],
      tags: ['va', 'assistência virtual', 'serviços', 'remoto'],
      difficulty: 'beginner',
      isPremium: true
    },
    {
      id: 'webinar-sales',
      categoryId: 'extra-income',
      title: 'Webinar de Vendas',
      description: 'Crie um webinar que converte em vendas',
      template: `Desenvolva webinar de vendas para {product} no valor de {price}:

1. Título e promessa irresistível
2. Estrutura de 60 minutos (minuto a minuto)
3. Slides-chave e ganchos
4. Oferta e stack de valor
5. Urgência e escassez
6. Script de venda natural
7. Follow-up sequence
8. Meta: 10% de conversão`,
      variables: [
        { name: 'product', label: 'Produto/serviço', placeholder: 'Ex: Curso online, consultoria', type: 'text', required: true },
        { name: 'price', label: 'Preço', placeholder: 'Ex: $497', type: 'text', required: true }
      ],
      examples: [{
        title: 'Webinar de curso',
        input: { product: 'Curso de Instagram', price: '$297' },
        output: '0-10min: Apresentação e prova social\n10-40min: Conteúdo de valor\n40-60min: Oferta e CTA'
      }],
      tags: ['webinar', 'vendas', 'conversão', 'ao vivo'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'lead-magnet',
      categoryId: 'extra-income',
      title: 'Lead Magnet Irresistível',
      description: 'Crie iscas digitais que geram leads qualificados',
      template: `Crie lead magnet para {business} que atrai {target_audience}:

1. Tipo ideal (checklist/guia/template/quiz)
2. Título magnético
3. Conteúdo do lead magnet
4. Landing page copy
5. Email de boas-vindas
6. Sequência de nurturing (5 emails)
7. Oferta principal no final
8. Meta de conversão lead→cliente`,
      variables: [
        { name: 'business', label: 'Seu negócio', placeholder: 'Ex: Consultoria de marketing', type: 'text', required: true },
        { name: 'target_audience', label: 'Público-alvo', placeholder: 'Ex: Donos de e-commerce', type: 'text', required: true }
      ],
      examples: [{
        title: 'Lead magnet para coaches',
        input: { business: 'Coaching de produtividade', target_audience: 'Empreendedores sobrecarregados' },
        output: 'Tipo: Checklist\nTítulo: "21 Hacks de Produtividade que Economizam 10h/Semana"\nOferta: Sessão diagnóstico ($197)'
      }],
      tags: ['lead magnet', 'funil', 'captação', 'email'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'online-workshop',
      categoryId: 'extra-income',
      title: 'Workshop Online Pago',
      description: 'Estruture workshops que as pessoas pagam para participar',
      template: `Crie workshop online sobre {topic} por {price}:

1. Transformação em 2-4 horas
2. Estrutura hora a hora
3. Exercícios práticos
4. Materiais de suporte (workbook, templates)
5. Copy de vendas
6. Estratégia de divulgação
7. Como fazer ao vivo e vender gravado
8. Meta: 20 participantes/mês`,
      variables: [
        { name: 'topic', label: 'Tema do workshop', placeholder: 'Ex: LinkedIn para vendas', type: 'text', required: true },
        { name: 'price', label: 'Preço', placeholder: 'Ex: $47', type: 'text', required: true }
      ],
      examples: [{
        title: 'Workshop de vendas',
        input: { topic: 'Fechamento de vendas por WhatsApp', price: '$67' },
        output: 'Hora 1: Mindset e objeções\nHora 2: Scripts testados\nHora 3: Role-play ao vivo\nBônus: 50 templates'
      }],
      tags: ['workshop', 'evento', 'ao vivo', 'educação'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'canva-templates',
      categoryId: 'extra-income',
      title: 'Templates Canva para Vender',
      description: 'Crie e venda templates Canva lucrativos',
      template: `Desenvolva linha de templates Canva para {niche}:

1. Top 10 tipos de templates mais vendidos
2. Kits e bundles
3. Preços por template e por pacote
4. Plataformas de venda
5. Marketing visual no Pinterest/Instagram
6. Como criar 50 templates/mês
7. Diferenciação da concorrência
8. Meta: $1000/mês passivo`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Instagram para coaches, Pinterest para e-commerce', type: 'text', required: true }
      ],
      examples: [{
        title: 'Templates Instagram',
        input: { niche: 'Posts motivacionais' },
        output: '1. Pack 30 posts ($15)\n2. Stories templates ($12)\n3. Bundle completo ($35)\nTotal estimado: $800/mês'
      }],
      tags: ['canva', 'templates', 'design', 'passivo'],
      difficulty: 'beginner',
      isPremium: true
    },
    {
      id: 'newsletter-paid',
      categoryId: 'extra-income',
      title: 'Newsletter Paga',
      description: 'Monte uma newsletter por assinatura lucrativa',
      template: `Crie newsletter paga sobre {topic} por {monthly_price}/mês:

1. Diferencial único (por que pagar?)
2. Formato e frequência
3. Conteúdo exclusivo
4. Primeiras 5 edições (temas)
5. Estratégia de crescimento
6. Copy de vendas
7. Como chegar a 100 assinantes
8. Projeção MRR (6 meses)`,
      variables: [
        { name: 'topic', label: 'Tema da newsletter', placeholder: 'Ex: Tendências de IA, dicas de investimento', type: 'text', required: true },
        { name: 'monthly_price', label: 'Preço mensal', placeholder: 'Ex: $9', type: 'text', required: true }
      ],
      examples: [{
        title: 'Newsletter de mercado',
        input: { topic: 'Análises de ações', monthly_price: '$15' },
        output: 'Diferencial: Análise semanal + alertas em tempo real\n100 assinantes = $1500 MRR\n500 assinantes (6 meses) = $7500 MRR'
      }],
      tags: ['newsletter', 'assinatura', 'conteúdo', 'mrr'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'marketplace-seller',
      categoryId: 'extra-income',
      title: 'Vendedor em Marketplaces',
      description: 'Venda produtos físicos em marketplaces com sucesso',
      template: `Crie estratégia de venda em {marketplace} para {product_category}:

1. Validação de produtos (demanda, margem)
2. Top 5 produtos para começar
3. Fornecedores confiáveis
4. Precificação competitiva
5. Otimização de listagem (SEO, fotos)
6. Gestão de estoque
7. Estratégia de reviews
8. Meta: $5000 faturamento/mês`,
      variables: [
        { name: 'marketplace', label: 'Marketplace', placeholder: 'Ex: Mercado Livre, Amazon, Shopee', type: 'text', required: true },
        { name: 'product_category', label: 'Categoria', placeholder: 'Ex: Eletrônicos, moda, casa', type: 'text', required: true }
      ],
      examples: [{
        title: 'Amazon FBA',
        input: { marketplace: 'Amazon', product_category: 'Organização doméstica' },
        output: 'Produto 1: Organizador de gavetas ($19.99, margem 35%)\nInvestimento inicial: $1500\nMeta 3 meses: $4000/mês'
      }],
      tags: ['marketplace', 'e-commerce', 'vendas', 'físico'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'chatbot-service',
      categoryId: 'extra-income',
      title: 'Serviço de Chatbot/Automação',
      description: 'Venda automações e chatbots para negócios',
      template: `Estruture serviço de automação para {industry}:

1. Soluções específicas oferecidas
2. Pacotes e preços (setup + mensal)
3. Ferramentas (ManyChat, Zapier, Make)
4. Processo de implementação
5. Casos de uso e ROI
6. Portfólio de demos
7. Onde encontrar clientes
8. Como escalar para agência`,
      variables: [
        { name: 'industry', label: 'Indústria', placeholder: 'Ex: E-commerce, clínicas, imobiliárias', type: 'text', required: true }
      ],
      examples: [{
        title: 'Automação para e-commerce',
        input: { industry: 'Lojas online' },
        output: 'Setup: $800 (chatbot + automações)\nMensal: $200 (manutenção)\n10 clientes = $2800 MRR'
      }],
      tags: ['automação', 'chatbot', 'tech', 'serviços'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'audit-service',
      categoryId: 'extra-income',
      title: 'Serviço de Auditoria',
      description: 'Venda auditorias como produto de entrada',
      template: `Crie serviço de auditoria em {area} por {price}:

1. Checklist completo de análise
2. Deliverables (relatório, vídeo loom)
3. Template de relatório
4. Processo de execução (2-3 dias)
5. Upsell para implementação
6. Script de vendas
7. Onde divulgar
8. Meta: 10 auditorias/mês`,
      variables: [
        { name: 'area', label: 'Área de expertise', placeholder: 'Ex: SEO, Instagram, site, anúncios', type: 'text', required: true },
        { name: 'price', label: 'Preço da auditoria', placeholder: 'Ex: $297', type: 'text', required: true }
      ],
      examples: [{
        title: 'Auditoria de Instagram',
        input: { area: 'Instagram para negócios', price: '$197' },
        output: 'Análise: perfil, conteúdo, engajamento\nRelatório: 15 páginas + vídeo 10min\nUpsell: Gestão mensal ($800/mês)'
      }],
      tags: ['auditoria', 'consultoria', 'vendas', 'entrada'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'saas-affiliate',
      categoryId: 'extra-income',
      title: 'Afiliado SaaS Recorrente',
      description: 'Ganhe comissões recorrentes promovendo ferramentas SaaS',
      template: `Crie estratégia de afiliado SaaS para {niche_tools}:

1. Top 10 ferramentas com melhor comissão
2. Público-alvo ideal
3. Conteúdo que converte (reviews, comparativos)
4. SEO para "melhor ferramenta de X"
5. Email nurturing sequence
6. YouTube + Blog strategy
7. Como conseguir primeiros 20 afiliados
8. Projeção: $3000 MRR em 6 meses`,
      variables: [
        { name: 'niche_tools', label: 'Nicho de ferramentas', placeholder: 'Ex: Email marketing, design, produtividade', type: 'text', required: true }
      ],
      examples: [{
        title: 'Afiliado de ferramentas marketing',
        input: { niche_tools: 'Email marketing' },
        output: 'ConvertKit: 30% recorrente\nMailerLite: 30%\nConteúdo: Review completo + tutoriais\nMeta: $2500 MRR'
      }],
      tags: ['afiliados', 'saas', 'recorrente', 'passivo'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'group-coaching',
      categoryId: 'extra-income',
      title: 'Coaching em Grupo',
      description: 'Monetize conhecimento com coaching coletivo',
      template: `Estruture programa de coaching em grupo sobre {topic}:

1. Duração e formato (6-12 semanas)
2. Número ideal de participantes
3. Estrutura das sessões
4. Materiais e exercícios
5. Comunidade privada
6. Preço por pessoa vs valor percebido
7. Como preencher primeira turma
8. Meta: 3 turmas/ano, 15 pessoas cada`,
      variables: [
        { name: 'topic', label: 'Tema', placeholder: 'Ex: Transição de carreira, emagrecimento', type: 'text', required: true }
      ],
      examples: [{
        title: 'Coaching financeiro',
        input: { topic: 'Organização financeira' },
        output: '8 semanas, $397/pessoa\n15 participantes = $5955/turma\n3 turmas/ano = $17865'
      }],
      tags: ['coaching', 'grupo', 'educação', 'escalável'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'local-seo-service',
      categoryId: 'extra-income',
      title: 'SEO Local para Negócios',
      description: 'Venda serviços de SEO para negócios locais',
      template: `Crie oferta de SEO local para {business_type}:

1. Pacotes (básico/completo/premium)
2. Deliverables específicos
3. Setup inicial vs mensal
4. Processo de otimização
5. Resultados esperados (timeline)
6. Como prospectar clientes locais
7. Automação do serviço
8. Meta: 10 clientes a $300/mês`,
      variables: [
        { name: 'business_type', label: 'Tipo de negócio', placeholder: 'Ex: Restaurantes, dentistas, advocacia', type: 'text', required: true }
      ],
      examples: [{
        title: 'SEO para clínicas',
        input: { business_type: 'Clínicas médicas' },
        output: 'Setup: $800 (GMB + site + citações)\nMensal: $400 (conteúdo + otimização)\n10 clientes = $4000 MRR'
      }],
      tags: ['seo', 'local', 'serviços', 'recorrente'],
      difficulty: 'intermediate',
      isPremium: false
    }
  ]
};
