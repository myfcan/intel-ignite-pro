import { Prompt } from '@/types/prompt';

// Pack 5: SEO Premium Prompts (15 prompts)
export const seoPremiumPrompts: Prompt[] = [
  {
    id: 'seo-keyword-cluster',
    categoryId: 'seo',
    title: 'Cluster de Palavras-Chave Semânticas',
    description: 'Gere clusters de palavras-chave relacionadas para dominar um tópico',
    template: `Atue como especialista em SEO semântico.

PALAVRA-CHAVE PRINCIPAL: {{keyword}}
NICHO: {{niche}}
INTENÇÃO DE BUSCA: {{intent}}

Crie um cluster completo:

1. PALAVRA-CHAVE PILAR
- Termo principal com maior volume
- Dificuldade estimada
- Tipo de conteúdo ideal

2. PALAVRAS-CHAVE DE SUPORTE (10)
Para cada uma:
- Termo exato
- Volume relativo (alto/médio/baixo)
- Intenção (informacional/transacional/navegacional)
- Título de artigo sugerido

3. LONG-TAIL KEYWORDS (15)
- Perguntas que usuários fazem
- Termos de cauda longa específicos
- Oportunidades de featured snippet

4. ESTRUTURA DE LINKS INTERNOS
- Como interligar os conteúdos
- Hierarquia de páginas
- Anchor texts sugeridos

5. CALENDÁRIO DE PUBLICAÇÃO
- Ordem de criação dos conteúdos
- Prioridade por oportunidade`,
    variables: [
      { name: 'keyword', label: 'Palavra-chave Principal', placeholder: 'marketing digital', type: 'text', required: true },
      { name: 'niche', label: 'Nicho', placeholder: 'empreendedorismo', type: 'text', required: true },
      { name: 'intent', label: 'Intenção de Busca', placeholder: 'aprender a vender online', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'keywords', 'cluster', 'semântico'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'seo-meta-tags-pack',
    categoryId: 'seo',
    title: 'Pack de Meta Tags Otimizadas',
    description: 'Crie títulos e descrições SEO que convertem',
    template: `Atue como copywriter especialista em SEO.

PÁGINA: {{page_type}}
PALAVRA-CHAVE: {{keyword}}
PROPOSTA DE VALOR: {{value_prop}}

Gere 5 variações de meta tags:

PARA CADA VARIAÇÃO:

📌 TITLE TAG (máx 60 caracteres)
- Inclua palavra-chave no início
- Use power words
- Crie urgência ou curiosidade

📝 META DESCRIPTION (máx 155 caracteres)
- Inclua palavra-chave naturalmente
- Call-to-action claro
- Benefício principal

🎯 ANÁLISE
- Por que essa versão funciona
- CTR esperado (estimativa)
- Melhor uso (homepage/blog/produto)

VERSÃO RECOMENDADA:
- Escolha a melhor combinação
- Justifique a escolha`,
    variables: [
      { name: 'page_type', label: 'Tipo de Página', placeholder: 'página de vendas', type: 'text', required: true },
      { name: 'keyword', label: 'Palavra-chave', placeholder: 'curso de inglês online', type: 'text', required: true },
      { name: 'value_prop', label: 'Proposta de Valor', placeholder: 'aprenda inglês em 6 meses', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'meta tags', 'títulos', 'descrições'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-content-brief',
    categoryId: 'seo',
    title: 'Brief de Conteúdo SEO Completo',
    description: 'Briefing detalhado para criar conteúdo que rankeia',
    template: `Atue como estrategista de conteúdo SEO.

TEMA: {{topic}}
PALAVRA-CHAVE ALVO: {{keyword}}
CONCORRENTES TOP 3: {{competitors}}

Crie um brief completo:

1. ANÁLISE DA SERP
- O que os top 3 têm em comum
- Gaps de conteúdo identificados
- Oportunidade de diferenciação

2. ESTRUTURA DO ARTIGO
- H1 otimizado
- H2s principais (5-7)
- H3s de suporte
- Contagem de palavras sugerida

3. PALAVRAS-CHAVE SECUNDÁRIAS
- LSI keywords para incluir
- Termos relacionados
- Perguntas para responder

4. ELEMENTOS DE CONTEÚDO
- Listas e bullet points
- Tabelas comparativas
- Imagens/infográficos necessários
- CTAs estratégicos

5. LINKS
- Sugestões de links internos
- Fontes externas autoritativas
- Anchor texts otimizados

6. FEATURED SNIPPET
- Formato ideal para conquistar
- Resposta direta sugerida`,
    variables: [
      { name: 'topic', label: 'Tema do Conteúdo', placeholder: 'como criar um negócio online', type: 'text', required: true },
      { name: 'keyword', label: 'Palavra-chave Alvo', placeholder: 'negócio online do zero', type: 'text', required: true },
      { name: 'competitors', label: 'URLs Concorrentes', placeholder: 'site1.com, site2.com, site3.com', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['seo', 'brief', 'conteúdo', 'estratégia'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'seo-local-optimization',
    categoryId: 'seo',
    title: 'Otimização SEO Local Completa',
    description: 'Domine as buscas locais do seu negócio',
    template: `Atue como especialista em SEO Local.

NEGÓCIO: {{business}}
CIDADE/REGIÃO: {{location}}
SERVIÇOS PRINCIPAIS: {{services}}

Crie estratégia completa:

1. GOOGLE MEU NEGÓCIO
- Título otimizado
- Descrição (750 caracteres)
- Categorias principais e secundárias
- Atributos importantes

2. PALAVRAS-CHAVE LOCAIS
- [serviço] + [cidade] (10 variações)
- "perto de mim" keywords
- Bairros e regiões

3. CONTEÚDO LOCAL
- Páginas de serviço por região
- Blog posts com foco local
- Landing pages por bairro

4. CITAÇÕES E DIRETÓRIOS
- Top 20 diretórios para cadastrar
- Informações NAP consistentes
- Estratégia de reviews

5. SCHEMA MARKUP
- LocalBusiness schema
- Horários, telefone, endereço
- FAQ schema local

6. ESTRATÉGIA DE REVIEWS
- Como solicitar avaliações
- Respostas modelo (positivas/negativas)
- Meta de reviews mensal`,
    variables: [
      { name: 'business', label: 'Tipo de Negócio', placeholder: 'clínica odontológica', type: 'text', required: true },
      { name: 'location', label: 'Cidade/Região', placeholder: 'São Paulo - Zona Sul', type: 'text', required: true },
      { name: 'services', label: 'Serviços Principais', placeholder: 'implantes, clareamento, ortodontia', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'local', 'google meu negócio', 'citações'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-technical-audit',
    categoryId: 'seo',
    title: 'Checklist de Auditoria SEO Técnica',
    description: 'Identifique e corrija problemas técnicos do seu site',
    template: `Atue como especialista em SEO Técnico.

SITE: {{website}}
CMS/PLATAFORMA: {{platform}}
PROBLEMAS CONHECIDOS: {{issues}}

Crie checklist de auditoria:

1. CRAWLABILITY
□ Robots.txt configurado
□ Sitemap XML atualizado
□ Páginas bloqueadas corretamente
□ Estrutura de URLs limpa

2. INDEXAÇÃO
□ Páginas indexadas vs total
□ Canonical tags corretas
□ Páginas duplicadas
□ Conteúdo thin/baixa qualidade

3. VELOCIDADE
□ Core Web Vitals (LCP, FID, CLS)
□ Tempo de carregamento mobile
□ Otimização de imagens
□ Minificação CSS/JS

4. MOBILE
□ Design responsivo
□ Viewport configurado
□ Touch elements espaçados
□ Fontes legíveis

5. SEGURANÇA
□ HTTPS implementado
□ Certificado válido
□ Mixed content
□ Redirecionamentos seguros

6. ESTRUTURA
□ Heading hierarchy
□ Links internos quebrados
□ Profundidade de cliques
□ Breadcrumbs

7. PRIORIZAÇÃO
- Crítico (corrigir imediatamente)
- Alto (próxima semana)
- Médio (próximo mês)
- Baixo (otimização contínua)`,
    variables: [
      { name: 'website', label: 'URL do Site', placeholder: 'www.meusite.com.br', type: 'text', required: true },
      { name: 'platform', label: 'Plataforma', placeholder: 'WordPress, Shopify, etc.', type: 'text', required: true },
      { name: 'issues', label: 'Problemas Conhecidos', placeholder: 'site lento, baixo tráfego', type: 'textarea', required: false }
    ],
    examples: [],
    tags: ['seo', 'técnico', 'auditoria', 'velocidade'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-link-building-strategy',
    categoryId: 'seo',
    title: 'Estratégia de Link Building',
    description: 'Construa autoridade com backlinks de qualidade',
    template: `Atue como especialista em Link Building.

SITE: {{website}}
NICHO: {{niche}}
ORÇAMENTO MENSAL: {{budget}}

Crie estratégia completa:

1. ANÁLISE DE BACKLINKS ATUAL
- Métricas a verificar (DA, DR)
- Identificar links tóxicos
- Gap vs concorrentes

2. TÁTICAS DE LINK BUILDING

Guest Posting:
- 10 sites para prospectar no nicho
- Temas de artigos sugeridos
- Template de outreach

Broken Link Building:
- Como encontrar oportunidades
- Email template

Digital PR:
- Ideias de conteúdo linkável
- Jornalistas/blogs para contatar

Link Bait:
- Tipos de conteúdo que atraem links
- Estudos/pesquisas originais
- Ferramentas gratuitas

3. OUTREACH TEMPLATES
- Email inicial
- Follow-up 1
- Follow-up 2

4. MÉTRICAS E METAS
- Links/mês por tática
- DA mínimo aceitável
- Anchor text diversificado

5. CRONOGRAMA
- Semana 1-4 ações específicas
- Ferramentas necessárias`,
    variables: [
      { name: 'website', label: 'URL do Site', placeholder: 'www.meusite.com.br', type: 'text', required: true },
      { name: 'niche', label: 'Nicho', placeholder: 'marketing digital', type: 'text', required: true },
      { name: 'budget', label: 'Orçamento Mensal', placeholder: 'R$ 2.000', type: 'text', required: false }
    ],
    examples: [],
    tags: ['seo', 'link building', 'backlinks', 'autoridade'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'seo-ecommerce-product',
    categoryId: 'seo',
    title: 'Otimização de Página de Produto E-commerce',
    description: 'SEO completo para páginas de produto que vendem',
    template: `Atue como especialista em SEO para E-commerce.

PRODUTO: {{product}}
CATEGORIA: {{category}}
DIFERENCIAIS: {{differentials}}

Otimize a página:

1. TITLE TAG
- 3 variações otimizadas
- Inclua marca + produto + benefício

2. META DESCRIPTION
- 3 variações com CTA
- Inclua preço/promoção se aplicável

3. URL
- Estrutura ideal
- Hierarquia de categorias

4. DESCRIÇÃO DO PRODUTO
- Parágrafo introdutório (100 palavras)
- Bullet points de benefícios
- Especificações técnicas
- FAQ do produto (5 perguntas)

5. SCHEMA MARKUP
- Product schema completo
- Review schema
- FAQ schema
- Breadcrumb schema

6. IMAGENS
- Alt texts otimizados (5 variações)
- Nomes de arquivo
- Tamanhos recomendados

7. CONTEÚDO ADICIONAL
- Seção "Como usar"
- Comparativo com similares
- Depoimentos estruturados

8. LINKS INTERNOS
- Produtos relacionados
- Categoria pai
- Conteúdos de suporte`,
    variables: [
      { name: 'product', label: 'Nome do Produto', placeholder: 'Tênis Nike Air Max 90', type: 'text', required: true },
      { name: 'category', label: 'Categoria', placeholder: 'Tênis Masculino', type: 'text', required: true },
      { name: 'differentials', label: 'Diferenciais', placeholder: 'conforto, durabilidade, design', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'ecommerce', 'produto', 'conversão'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-content-update',
    categoryId: 'seo',
    title: 'Atualização de Conteúdo para Recuperar Rankings',
    description: 'Revitalize conteúdos antigos que perderam posição',
    template: `Atue como especialista em Content Refresh.

URL DO ARTIGO: {{url}}
PALAVRA-CHAVE: {{keyword}}
POSIÇÃO ATUAL: {{position}}

Crie plano de atualização:

1. DIAGNÓSTICO
- Por que o conteúdo caiu
- O que concorrentes fizeram diferente
- Gaps de informação

2. ATUALIZAÇÕES DE CONTEÚDO
- Seções para adicionar
- Informações desatualizadas
- Estatísticas para atualizar
- Novos exemplos/cases

3. OTIMIZAÇÃO ON-PAGE
- Novo título otimizado
- Nova meta description
- H2s/H3s para adicionar
- Internal links para inserir

4. ENRIQUECIMENTO
- Imagens/vídeos para adicionar
- Infográfico sugerido
- Tabela comparativa
- FAQ section

5. FEATURED SNIPPET
- Oportunidade identificada
- Formato ideal
- Resposta otimizada

6. PROMOÇÃO PÓS-UPDATE
- Republicar em redes sociais
- Atualizar newsletter
- Outreach para novos links

7. MONITORAMENTO
- Métricas para acompanhar
- Prazo esperado para resultados`,
    variables: [
      { name: 'url', label: 'URL do Artigo', placeholder: 'www.site.com/artigo-antigo', type: 'text', required: true },
      { name: 'keyword', label: 'Palavra-chave Alvo', placeholder: 'como ganhar dinheiro online', type: 'text', required: true },
      { name: 'position', label: 'Posição Atual', placeholder: '15-20', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'content refresh', 'atualização', 'rankings'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-competitor-analysis',
    categoryId: 'seo',
    title: 'Análise de Concorrentes SEO',
    description: 'Descubra as estratégias dos seus concorrentes',
    template: `Atue como analista de SEO competitivo.

SEU SITE: {{your_site}}
CONCORRENTE 1: {{competitor1}}
CONCORRENTE 2: {{competitor2}}

Faça análise completa:

1. VISÃO GERAL
- Comparativo de métricas (DA, tráfego estimado)
- Quantidade de keywords rankeadas
- Páginas indexadas

2. TOP KEYWORDS DOS CONCORRENTES
- 20 keywords que eles rankam e você não
- Keywords onde você está abaixo deles
- Oportunidades de quick wins

3. ANÁLISE DE CONTEÚDO
- Tipos de conteúdo que performam
- Tamanho médio dos artigos
- Frequência de publicação
- Formatos utilizados

4. BACKLINK GAP
- Sites que linkam para eles (não você)
- Tipos de links que conseguem
- Estratégias de link building usadas

5. ESTRUTURA DO SITE
- Arquitetura de informação
- Categorização
- Internal linking

6. PONTOS FRACOS DOS CONCORRENTES
- Onde eles falham
- Oportunidades não exploradas
- Gaps de conteúdo

7. PLANO DE AÇÃO
- Top 10 ações prioritárias
- Timeline sugerido
- Recursos necessários`,
    variables: [
      { name: 'your_site', label: 'Seu Site', placeholder: 'www.meusite.com.br', type: 'text', required: true },
      { name: 'competitor1', label: 'Concorrente 1', placeholder: 'www.concorrente1.com.br', type: 'text', required: true },
      { name: 'competitor2', label: 'Concorrente 2', placeholder: 'www.concorrente2.com.br', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'concorrentes', 'análise', 'estratégia'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-faq-schema',
    categoryId: 'seo',
    title: 'Gerador de FAQ Schema Otimizado',
    description: 'Crie FAQs que conquistam featured snippets',
    template: `Atue como especialista em FAQ Schema.

TEMA: {{topic}}
PALAVRA-CHAVE: {{keyword}}
PÚBLICO: {{audience}}

Gere FAQ completo:

1. PERGUNTAS PRINCIPAIS (10)
Para cada pergunta:
- Pergunta otimizada para busca
- Resposta concisa (40-60 palavras)
- Resposta expandida (se necessário)

2. PERGUNTAS LONG-TAIL (10)
- Perguntas específicas do nicho
- "Como fazer X"
- "Quanto custa Y"
- "Qual a diferença entre A e B"

3. FAQ SCHEMA CODE
- JSON-LD pronto para implementar
- Todas as perguntas formatadas

4. OTIMIZAÇÃO PARA FEATURED SNIPPET
- Top 3 perguntas com maior chance
- Formato ideal de resposta
- Posicionamento no conteúdo

5. INTERNAL LINKING
- Perguntas que linkam para outros conteúdos
- Anchor texts sugeridos

6. IMPLEMENTAÇÃO
- Onde colocar no site
- Design sugerido
- Versão expandível (accordion)`,
    variables: [
      { name: 'topic', label: 'Tema', placeholder: 'investimento em criptomoedas', type: 'text', required: true },
      { name: 'keyword', label: 'Palavra-chave Principal', placeholder: 'como investir em bitcoin', type: 'text', required: true },
      { name: 'audience', label: 'Público-Alvo', placeholder: 'iniciantes em investimentos', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'faq', 'schema', 'featured snippet'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-youtube-optimization',
    categoryId: 'seo',
    title: 'SEO para YouTube Completo',
    description: 'Otimize seus vídeos para aparecer nas buscas',
    template: `Atue como especialista em YouTube SEO.

TEMA DO VÍDEO: {{topic}}
PALAVRA-CHAVE: {{keyword}}
CANAL: {{channel}}

Otimize completamente:

1. TÍTULO (5 variações)
- Inclua keyword no início
- Use números quando possível
- Crie curiosidade
- Máximo 60 caracteres

2. DESCRIÇÃO
- Primeiras 2 linhas (aparecem)
- Descrição completa (2000 caracteres)
- Timestamps sugeridos
- Links importantes
- Call-to-action

3. TAGS (30)
- Keyword principal
- Variações
- Termos relacionados
- Termos do canal

4. THUMBNAIL
- Elementos visuais sugeridos
- Texto na thumbnail
- Cores recomendadas
- Expressão facial

5. CARDS E END SCREENS
- Momentos para inserir cards
- Vídeos para recomendar
- CTA de inscrição

6. HASHTAGS (3-5)
- Hashtags relevantes
- Hashtag do canal

7. LEGENDAS
- Importância das legendas
- Keywords nas legendas

8. ENGAJAMENTO
- Pergunta para fixar
- CTA para comentários`,
    variables: [
      { name: 'topic', label: 'Tema do Vídeo', placeholder: 'como criar um canal no YouTube', type: 'text', required: true },
      { name: 'keyword', label: 'Palavra-chave', placeholder: 'criar canal youtube', type: 'text', required: true },
      { name: 'channel', label: 'Nome do Canal', placeholder: 'Meu Canal', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'youtube', 'vídeo', 'otimização'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'seo-content-calendar',
    categoryId: 'seo',
    title: 'Calendário Editorial SEO Trimestral',
    description: 'Planeje 3 meses de conteúdo otimizado',
    template: `Atue como estrategista de conteúdo SEO.

NICHO: {{niche}}
OBJETIVO PRINCIPAL: {{goal}}
FREQUÊNCIA DE POSTS: {{frequency}}

Crie calendário de 3 meses:

MÊS 1 - FUNDAÇÃO
Semana 1:
- Conteúdo pilar 1 (tema + keyword)
- 2 conteúdos de suporte

Semana 2:
- Conteúdo pilar 2
- 2 conteúdos de suporte

Semana 3-4:
- Conteúdos de suporte
- Link building interno

MÊS 2 - EXPANSÃO
- Novos clusters de conteúdo
- Conteúdos de oportunidade
- Guest posts

MÊS 3 - OTIMIZAÇÃO
- Atualização de conteúdos
- Conteúdos de conversão
- Link building externo

PARA CADA CONTEÚDO:
- Título sugerido
- Palavra-chave alvo
- Tipo (blog/vídeo/infográfico)
- Prioridade (alta/média/baixa)
- Objetivo (tráfego/conversão/autoridade)

MÉTRICAS DE SUCESSO:
- KPIs mensais
- Meta de tráfego
- Meta de keywords rankeadas`,
    variables: [
      { name: 'niche', label: 'Nicho', placeholder: 'marketing digital', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'aumentar tráfego orgânico', type: 'text', required: true },
      { name: 'frequency', label: 'Posts por Semana', placeholder: '3', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'calendário', 'editorial', 'planejamento'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-international',
    categoryId: 'seo',
    title: 'SEO Internacional e Multilíngue',
    description: 'Expanda seu site para outros países e idiomas',
    template: `Atue como especialista em SEO Internacional.

SITE ATUAL: {{website}}
IDIOMA ORIGINAL: {{original_lang}}
MERCADOS ALVO: {{target_markets}}

Crie estratégia completa:

1. ESTRUTURA DE URLs
- Subdomínios vs subpastas vs ccTLDs
- Recomendação para seu caso
- Exemplos de implementação

2. HREFLANG
- Tags necessárias
- Implementação correta
- Erros comuns a evitar

3. CONTEÚDO LOCALIZADO
- Não apenas traduzir
- Adaptar para cultura local
- Keywords locais
- Moeda e medidas

4. HOSTING E CDN
- Servidor local vs CDN
- Velocidade por região
- Configurações recomendadas

5. GOOGLE SEARCH CONSOLE
- Segmentação internacional
- Propriedades separadas
- Monitoramento por país

6. LINK BUILDING LOCAL
- Diretórios por país
- Parceiros locais
- Digital PR regional

7. CHECKLIST DE IMPLEMENTAÇÃO
□ Estrutura de URL definida
□ Hreflang implementado
□ Conteúdo traduzido/localizado
□ GSC configurado
□ Analytics segmentado`,
    variables: [
      { name: 'website', label: 'Site Atual', placeholder: 'www.meusite.com.br', type: 'text', required: true },
      { name: 'original_lang', label: 'Idioma Original', placeholder: 'Português Brasil', type: 'text', required: true },
      { name: 'target_markets', label: 'Mercados Alvo', placeholder: 'EUA, Portugal, Espanha', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'internacional', 'multilíngue', 'hreflang'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-core-web-vitals',
    categoryId: 'seo',
    title: 'Otimização de Core Web Vitals',
    description: 'Melhore LCP, FID e CLS para rankear melhor',
    template: `Atue como especialista em Performance Web.

SITE: {{website}}
PLATAFORMA: {{platform}}
NOTA ATUAL PAGESPEED: {{current_score}}

Crie plano de otimização:

1. LCP (Largest Contentful Paint)
Problemas comuns:
- Imagens não otimizadas
- Render-blocking resources
- Slow server response

Soluções:
- Implementar lazy loading
- Otimizar imagens (WebP, sizing)
- Usar CDN
- Preload critical assets

2. FID (First Input Delay)
Problemas comuns:
- JavaScript pesado
- Third-party scripts
- Long tasks

Soluções:
- Code splitting
- Defer non-critical JS
- Otimizar third-party
- Web Workers

3. CLS (Cumulative Layout Shift)
Problemas comuns:
- Imagens sem dimensões
- Ads dinâmicos
- Fontes FOUT/FOIT

Soluções:
- Definir width/height
- Reservar espaço para ads
- Font-display: swap
- Preload fonts

4. CHECKLIST POR PLATAFORMA
- Plugins/apps específicos
- Configurações do servidor
- Cache settings

5. MONITORAMENTO
- Ferramentas para usar
- Métricas a acompanhar
- Meta por métrica`,
    variables: [
      { name: 'website', label: 'URL do Site', placeholder: 'www.meusite.com.br', type: 'text', required: true },
      { name: 'platform', label: 'Plataforma', placeholder: 'WordPress, Shopify, etc.', type: 'text', required: true },
      { name: 'current_score', label: 'Nota Atual PageSpeed', placeholder: '45/100', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'core web vitals', 'velocidade', 'performance'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'seo-report-template',
    categoryId: 'seo',
    title: 'Template de Relatório SEO Mensal',
    description: 'Crie relatórios profissionais para clientes',
    template: `Atue como consultor SEO criando relatório.

CLIENTE: {{client}}
PERÍODO: {{period}}
PRINCIPAIS AÇÕES: {{actions}}

Crie relatório estruturado:

1. RESUMO EXECUTIVO
- Principais conquistas do mês
- Métricas-chave em destaque
- Próximos passos

2. TRÁFEGO ORGÂNICO
- Variação mês a mês
- Variação ano a ano
- Top páginas por tráfego
- Tendências identificadas

3. RANKINGS
- Keywords que subiram
- Keywords que caíram
- Novas keywords rankeadas
- Top 10 conquistas

4. CONTEÚDO
- Novos conteúdos publicados
- Performance dos novos posts
- Conteúdos atualizados

5. BACKLINKS
- Novos backlinks conquistados
- Qualidade dos links
- Comparativo com período anterior

6. TÉCNICO
- Problemas identificados
- Correções realizadas
- Core Web Vitals

7. CONVERSÕES
- Leads/vendas do orgânico
- Taxa de conversão
- Páginas que mais convertem

8. CONCORRÊNCIA
- Movimentos dos concorrentes
- Oportunidades identificadas

9. PLANO PRÓXIMO MÊS
- Prioridades
- Ações planejadas
- Metas`,
    variables: [
      { name: 'client', label: 'Nome do Cliente', placeholder: 'Empresa XYZ', type: 'text', required: true },
      { name: 'period', label: 'Período', placeholder: 'Novembro 2024', type: 'text', required: true },
      { name: 'actions', label: 'Principais Ações Realizadas', placeholder: 'publicação de 10 artigos, link building', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['seo', 'relatório', 'cliente', 'métricas'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  }
];

// Pack 5: Estudo Premium Prompts (15 prompts)
export const estudoPremiumPrompts: Prompt[] = [
  {
    id: 'estudo-plano-estudos',
    categoryId: 'study',
    title: 'Plano de Estudos Personalizado',
    description: 'Crie um cronograma de estudos adaptado às suas necessidades',
    template: `Atue como coach de estudos especializado.

OBJETIVO: {{goal}}
TEMPO DISPONÍVEL: {{time}}
PRAZO: {{deadline}}
NÍVEL ATUAL: {{level}}

Crie plano de estudos:

1. DIAGNÓSTICO
- Análise do objetivo
- Conteúdos necessários
- Priorização por importância

2. CRONOGRAMA SEMANAL
Para cada dia:
- Horário de estudo
- Matéria/tópico
- Duração
- Tipo (teoria/prática/revisão)

3. TÉCNICAS RECOMENDADAS
- Pomodoro adaptado
- Active recall
- Spaced repetition
- Mapas mentais

4. MATERIAIS SUGERIDOS
- Livros essenciais
- Cursos online
- Vídeos/podcasts
- Exercícios práticos

5. MARCOS E METAS
- Metas semanais
- Checkpoints mensais
- Simulados/avaliações

6. GESTÃO DE ENERGIA
- Melhores horários para cada tipo de estudo
- Pausas estratégicas
- Cuidados com burnout

7. AJUSTES
- Como adaptar se atrasar
- Revisão do plano`,
    variables: [
      { name: 'goal', label: 'Objetivo', placeholder: 'passar no concurso X', type: 'text', required: true },
      { name: 'time', label: 'Horas por Dia', placeholder: '4 horas', type: 'text', required: true },
      { name: 'deadline', label: 'Prazo', placeholder: '6 meses', type: 'text', required: true },
      { name: 'level', label: 'Nível Atual', placeholder: 'iniciante, intermediário', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'plano', 'cronograma', 'organização'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'estudo-resumo-inteligente',
    categoryId: 'study',
    title: 'Resumo Inteligente com Técnicas de Memorização',
    description: 'Transforme qualquer conteúdo em resumo memorável',
    template: `Atue como especialista em aprendizagem acelerada.

CONTEÚDO/TEMA: {{content}}
OBJETIVO: {{purpose}}
FORMATO PREFERIDO: {{format}}

Crie resumo otimizado:

1. MAPA MENTAL TEXTUAL
- Conceito central
- Ramos principais (3-5)
- Sub-ramos com detalhes
- Conexões entre conceitos

2. RESUMO EM CAMADAS
Camada 1 - Ultra-resumo (30 palavras)
Camada 2 - Resumo essencial (100 palavras)
Camada 3 - Resumo completo (300 palavras)

3. TÉCNICAS DE MEMORIZAÇÃO
- Acrônimos para listas
- Associações visuais
- Histórias mnemônicas
- Palácio da memória

4. FLASHCARDS
- 10 perguntas-chave
- Respostas concisas
- Dicas de memorização

5. CONEXÕES
- Como relaciona com outros assuntos
- Aplicações práticas
- Exemplos do dia a dia

6. REVISÃO ESPAÇADA
- O que revisar em 1 dia
- O que revisar em 1 semana
- O que revisar em 1 mês`,
    variables: [
      { name: 'content', label: 'Conteúdo a Resumir', placeholder: 'Cole o texto ou descreva o tema', type: 'textarea', required: true },
      { name: 'purpose', label: 'Objetivo', placeholder: 'prova, apresentação, aprendizado', type: 'text', required: true },
      { name: 'format', label: 'Formato Preferido', placeholder: 'texto, bullet points, visual', type: 'text', required: false }
    ],
    examples: [],
    tags: ['estudo', 'resumo', 'memorização', 'mapa mental'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'estudo-simulado-questoes',
    categoryId: 'study',
    title: 'Gerador de Simulado com Questões',
    description: 'Crie questões de prova para testar seu conhecimento',
    template: `Atue como elaborador de provas especializado.

MATÉRIA: {{subject}}
TÓPICOS ESPECÍFICOS: {{topics}}
NÍVEL: {{level}}
ESTILO DA PROVA: {{exam_style}}

Gere simulado completo:

1. QUESTÕES OBJETIVAS (10)
Para cada questão:
- Enunciado claro
- 5 alternativas (A-E)
- Resposta correta
- Explicação detalhada
- Nível (fácil/médio/difícil)

2. QUESTÕES DISSERTATIVAS (3)
- Enunciado
- Pontos-chave da resposta
- Critérios de correção
- Resposta modelo

3. QUESTÕES DE VERDADEIRO/FALSO (5)
- Afirmação
- Resposta
- Justificativa

4. QUESTÕES DE ASSOCIAÇÃO (1)
- Colunas para associar
- Gabarito

5. ANÁLISE DO SIMULADO
- Distribuição por dificuldade
- Tópicos mais cobrados
- Tempo sugerido
- Pontuação por questão

6. ORIENTAÇÕES
- Como usar o simulado
- Quando refazer
- Como analisar erros`,
    variables: [
      { name: 'subject', label: 'Matéria', placeholder: 'Direito Constitucional', type: 'text', required: true },
      { name: 'topics', label: 'Tópicos Específicos', placeholder: 'direitos fundamentais, organização do Estado', type: 'text', required: true },
      { name: 'level', label: 'Nível', placeholder: 'intermediário, avançado', type: 'text', required: true },
      { name: 'exam_style', label: 'Estilo da Prova', placeholder: 'CESPE, FCC, ENEM', type: 'text', required: false }
    ],
    examples: [],
    tags: ['estudo', 'simulado', 'questões', 'prova'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-explicacao-simples',
    categoryId: 'study',
    title: 'Explicação Simples de Tema Complexo',
    description: 'Entenda qualquer assunto como se tivesse 5 anos',
    template: `Atue como professor que simplifica tudo.

TEMA COMPLEXO: {{topic}}
CONTEXTO: {{context}}
DÚVIDA PRINCIPAL: {{doubt}}

Explique de forma progressiva:

1. EXPLICAÇÃO PARA CRIANÇA (5 anos)
- Analogia do dia a dia
- Sem termos técnicos
- Máximo 3 frases

2. EXPLICAÇÃO PARA ADOLESCENTE
- Um pouco mais detalhes
- Exemplos práticos
- Linguagem acessível

3. EXPLICAÇÃO TÉCNICA SIMPLIFICADA
- Termos corretos
- Conceitos fundamentais
- Sem jargões desnecessários

4. EXPLICAÇÃO COMPLETA
- Detalhes técnicos
- Exceções e nuances
- Aplicações avançadas

5. ANALOGIAS PODEROSAS
- 3 analogias diferentes
- Para diferentes estilos de aprendizagem

6. ERROS COMUNS
- O que as pessoas entendem errado
- Por que entendem errado
- Como corrigir

7. PARA LEMBRAR SEMPRE
- Frase-resumo
- Imagem mental
- Conexão com algo conhecido`,
    variables: [
      { name: 'topic', label: 'Tema Complexo', placeholder: 'relatividade, blockchain, RNA', type: 'text', required: true },
      { name: 'context', label: 'Contexto', placeholder: 'estudo para prova, curiosidade', type: 'text', required: false },
      { name: 'doubt', label: 'Dúvida Principal', placeholder: 'não entendo como X funciona', type: 'text', required: false }
    ],
    examples: [],
    tags: ['estudo', 'explicação', 'simplificação', 'aprendizado'],
    difficulty: 'beginner',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'estudo-fichamento-academico',
    categoryId: 'study',
    title: 'Fichamento Acadêmico Completo',
    description: 'Crie fichamentos profissionais de livros e artigos',
    template: `Atue como pesquisador acadêmico.

TIPO DE OBRA: {{work_type}}
TÍTULO: {{title}}
AUTOR(ES): {{author}}
TEMA CENTRAL: {{theme}}

Crie fichamento completo:

1. REFERÊNCIA BIBLIOGRÁFICA
- ABNT completa
- APA (se solicitado)

2. RESUMO DA OBRA
- Síntese geral (200 palavras)
- Objetivo do autor
- Metodologia utilizada

3. FICHAMENTO POR CAPÍTULO
Para cada capítulo:
- Ideias principais
- Citações importantes (com página)
- Conceitos-chave
- Argumentos do autor

4. CITAÇÕES DESTACADAS
- 10 citações mais relevantes
- Contexto de cada uma
- Possíveis usos

5. CONCEITOS E DEFINIÇÕES
- Termos definidos pelo autor
- Novos conceitos apresentados

6. CRÍTICA E ANÁLISE
- Pontos fortes da obra
- Limitações identificadas
- Contribuição para o campo

7. CONEXÕES
- Relação com outras obras
- Aplicações práticas
- Questões para pesquisa

8. FICHAMENTO DE CITAÇÃO
- Formato pronto para usar
- Citação direta e indireta`,
    variables: [
      { name: 'work_type', label: 'Tipo de Obra', placeholder: 'livro, artigo, tese', type: 'text', required: true },
      { name: 'title', label: 'Título da Obra', placeholder: 'Nome completo', type: 'text', required: true },
      { name: 'author', label: 'Autor(es)', placeholder: 'Nome do autor', type: 'text', required: true },
      { name: 'theme', label: 'Tema Central', placeholder: 'do que trata a obra', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'fichamento', 'acadêmico', 'pesquisa'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-redacao-modelo',
    categoryId: 'study',
    title: 'Redação Modelo com Estrutura ENEM',
    description: 'Aprenda a estruturar redações nota 1000',
    template: `Atue como professor de redação nota 1000.

TEMA: {{theme}}
TIPO: {{type}}
REPERTÓRIO DISPONÍVEL: {{repertoire}}

Crie redação modelo:

1. ANÁLISE DO TEMA
- Delimitação do tema
- Palavras-chave
- Possíveis recortes
- Armadilhas a evitar

2. PLANEJAMENTO
- Tese central
- Argumentos (2-3)
- Repertórios para cada argumento
- Proposta de intervenção

3. REDAÇÃO MODELO (30 linhas)

INTRODUÇÃO
- Contextualização
- Apresentação do tema
- Tese

DESENVOLVIMENTO 1
- Tópico frasal
- Argumentação
- Repertório sociocultural
- Fechamento

DESENVOLVIMENTO 2
- Tópico frasal
- Argumentação
- Repertório sociocultural
- Fechamento

CONCLUSÃO
- Retomada
- Proposta de intervenção (5 elementos)
- Fechamento

4. ANÁLISE DA REDAÇÃO
- Competência 1: Norma culta
- Competência 2: Compreensão do tema
- Competência 3: Argumentação
- Competência 4: Coesão
- Competência 5: Proposta de intervenção

5. DICAS EXTRAS
- Conectivos úteis
- Repertórios versáteis
- Erros comuns`,
    variables: [
      { name: 'theme', label: 'Tema da Redação', placeholder: 'desafios para a saúde mental dos jovens', type: 'text', required: true },
      { name: 'type', label: 'Tipo de Texto', placeholder: 'dissertativo-argumentativo', type: 'text', required: true },
      { name: 'repertoire', label: 'Repertório Conhecido', placeholder: 'filósofos, dados, leis', type: 'text', required: false }
    ],
    examples: [],
    tags: ['estudo', 'redação', 'ENEM', 'escrita'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'estudo-idiomas-vocabulario',
    categoryId: 'study',
    title: 'Expansão de Vocabulário em Idiomas',
    description: 'Aprenda vocabulário de forma contextualizada e memorável',
    template: `Atue como professor de idiomas especializado.

IDIOMA: {{language}}
TEMA/CONTEXTO: {{context}}
NÍVEL: {{level}}
OBJETIVO: {{goal}}

Crie material de vocabulário:

1. VOCABULÁRIO ESSENCIAL (20 palavras)
Para cada palavra:
- Palavra no idioma
- Pronúncia (fonética)
- Tradução
- Exemplo de uso
- Dica de memorização

2. EXPRESSÕES IDIOMÁTICAS (10)
- Expressão
- Significado literal
- Significado real
- Quando usar
- Exemplo em contexto

3. FRASES ÚTEIS (15)
- Situações do cotidiano
- Frases formais
- Frases informais
- Perguntas comuns

4. DIÁLOGO MODELO
- Conversa natural usando o vocabulário
- Tradução lado a lado
- Pontos gramaticais destacados

5. EXERCÍCIOS
- Complete as frases
- Associação
- Tradução
- Gabarito

6. TÉCNICAS DE MEMORIZAÇÃO
- Flashcards sugeridos
- Associações visuais
- Músicas/filmes para praticar

7. REVISÃO ESPAÇADA
- Cronograma de revisão
- Quais palavras priorizar`,
    variables: [
      { name: 'language', label: 'Idioma', placeholder: 'inglês, espanhol, francês', type: 'text', required: true },
      { name: 'context', label: 'Tema/Contexto', placeholder: 'viagem, negócios, cotidiano', type: 'text', required: true },
      { name: 'level', label: 'Nível', placeholder: 'iniciante, intermediário', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo', placeholder: 'conversação, prova, trabalho', type: 'text', required: false }
    ],
    examples: [],
    tags: ['estudo', 'idiomas', 'vocabulário', 'aprendizado'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-matematica-passo',
    categoryId: 'study',
    title: 'Resolução de Matemática Passo a Passo',
    description: 'Entenda a resolução de qualquer problema matemático',
    template: `Atue como professor de matemática paciente.

PROBLEMA: {{problem}}
ÁREA: {{area}}
DIFICULDADE ESPECÍFICA: {{difficulty}}

Resolva pedagogicamente:

1. COMPREENSÃO DO PROBLEMA
- O que o problema pede
- Dados fornecidos
- Incógnitas
- Tipo de problema

2. CONCEITOS NECESSÁRIOS
- Fórmulas que serão usadas
- Propriedades importantes
- Pré-requisitos

3. ESTRATÉGIA DE RESOLUÇÃO
- Por que escolher essa abordagem
- Alternativas possíveis
- Dicas para identificar o método

4. RESOLUÇÃO PASSO A PASSO
Passo 1: [explicação detalhada]
Passo 2: [explicação detalhada]
...
Resposta final: [com unidades]

5. VERIFICAÇÃO
- Como conferir se está certo
- Teste com valores
- Análise dimensional

6. VARIAÇÕES DO PROBLEMA
- 2 problemas similares
- Resoluções resumidas

7. ERROS COMUNS
- O que as pessoas erram
- Como evitar

8. PARA FIXAR
- Resumo do método
- Quando usar essa técnica
- Dicas de memorização`,
    variables: [
      { name: 'problem', label: 'Problema', placeholder: 'Cole o problema ou descreva', type: 'textarea', required: true },
      { name: 'area', label: 'Área', placeholder: 'álgebra, geometria, cálculo', type: 'text', required: true },
      { name: 'difficulty', label: 'Dificuldade Específica', placeholder: 'não sei por onde começar', type: 'text', required: false }
    ],
    examples: [],
    tags: ['estudo', 'matemática', 'resolução', 'passo a passo'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-revisao-rapida',
    categoryId: 'study',
    title: 'Revisão Rápida Pré-Prova',
    description: 'Revise todo o conteúdo em tempo limitado',
    template: `Atue como coach de última hora para provas.

MATÉRIA: {{subject}}
TÓPICOS: {{topics}}
TEMPO DISPONÍVEL: {{time}}
TIPO DE PROVA: {{exam_type}}

Crie revisão otimizada:

1. PRIORIZAÇÃO (Lei de Pareto)
- 20% que correspondem a 80% da prova
- Tópicos mais cobrados
- O que não pode esquecer

2. RESUMO ULTRA-CONCENTRADO
Para cada tópico essencial:
- Conceito em 1 frase
- Fórmula/regra principal
- Exemplo rápido
- Pegadinha comum

3. MAPA MENTAL EXPRESSO
- Visão geral da matéria
- Conexões principais
- Palavras-gatilho

4. FLASHCARDS DE EMERGÊNCIA
- 20 perguntas mais importantes
- Respostas diretas

5. DICAS DE PROVA
- Como gerenciar o tempo
- Por onde começar
- O que fazer se travar

6. ÚLTIMOS 30 MINUTOS
- O que revisar
- Técnicas de relaxamento
- Checklist pré-prova

7. NA HORA DA PROVA
- Estratégia de resolução
- Como lidar com questões difíceis
- Revisão final`,
    variables: [
      { name: 'subject', label: 'Matéria', placeholder: 'Física, História, etc.', type: 'text', required: true },
      { name: 'topics', label: 'Tópicos da Prova', placeholder: 'lista dos assuntos', type: 'textarea', required: true },
      { name: 'time', label: 'Tempo para Estudar', placeholder: '2 horas, 1 dia', type: 'text', required: true },
      { name: 'exam_type', label: 'Tipo de Prova', placeholder: 'objetiva, dissertativa, mista', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'revisão', 'prova', 'última hora'],
    difficulty: 'beginner',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'estudo-tcc-estrutura',
    categoryId: 'study',
    title: 'Estrutura de TCC/Monografia',
    description: 'Monte a estrutura completa do seu trabalho acadêmico',
    template: `Atue como orientador de TCC experiente.

TEMA: {{theme}}
ÁREA: {{area}}
TIPO DE TRABALHO: {{work_type}}
PROBLEMA DE PESQUISA: {{problem}}

Estruture o trabalho:

1. ELEMENTOS PRÉ-TEXTUAIS
- Capa (modelo)
- Folha de rosto
- Resumo (estrutura)
- Abstract
- Sumário

2. INTRODUÇÃO
- Contextualização do tema
- Problema de pesquisa
- Objetivos (geral e específicos)
- Justificativa
- Estrutura do trabalho

3. REFERENCIAL TEÓRICO
- Tópicos principais
- Autores-chave para cada tópico
- Estrutura de cada seção
- Como conectar os tópicos

4. METODOLOGIA
- Tipo de pesquisa sugerido
- Procedimentos
- Instrumentos de coleta
- Análise de dados

5. RESULTADOS E DISCUSSÃO
- Como apresentar dados
- Estrutura da análise
- Conexão com referencial

6. CONCLUSÃO
- Retomada dos objetivos
- Principais achados
- Limitações
- Sugestões futuras

7. CRONOGRAMA
- Fases do trabalho
- Tempo sugerido para cada

8. DICAS
- Erros comuns
- Como lidar com orientador
- Gestão do tempo`,
    variables: [
      { name: 'theme', label: 'Tema', placeholder: 'tema do seu TCC', type: 'text', required: true },
      { name: 'area', label: 'Área de Conhecimento', placeholder: 'Administração, Direito, etc.', type: 'text', required: true },
      { name: 'work_type', label: 'Tipo de Trabalho', placeholder: 'TCC, Monografia, Artigo', type: 'text', required: true },
      { name: 'problem', label: 'Problema de Pesquisa', placeholder: 'pergunta que quer responder', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['estudo', 'TCC', 'monografia', 'acadêmico'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-concurso-edital',
    categoryId: 'study',
    title: 'Análise de Edital de Concurso',
    description: 'Extraia o máximo de informações do edital',
    template: `Atue como coach de concursos experiente.

CONCURSO: {{contest}}
CARGO: {{position}}
BANCA: {{examiner}}
INFORMAÇÕES DO EDITAL: {{info}}

Analise estrategicamente:

1. VISÃO GERAL
- Vagas e distribuição
- Remuneração e benefícios
- Requisitos
- Cronograma

2. ANÁLISE DA PROVA
- Disciplinas e pesos
- Quantidade de questões
- Nota de corte estimada
- Tipo de questão

3. PRIORIZAÇÃO DE ESTUDOS
- Matérias com maior peso
- Matérias eliminatórias
- Ordem sugerida de estudo
- Tempo por disciplina

4. ANÁLISE DA BANCA
- Estilo de questões
- Temas mais cobrados
- Pegadinhas comuns
- Perfil das provas anteriores

5. MATERIAIS RECOMENDADOS
- Para cada disciplina
- Gratuitos e pagos
- Questões comentadas

6. CRONOGRAMA DE ESTUDOS
- Até a prova
- Distribuição semanal
- Revisões programadas

7. ESTRATÉGIA DE PROVA
- Tempo por questão
- Ordem de resolução
- Gestão do gabarito

8. DICAS ESPECÍFICAS
- Particularidades do cargo
- Atenção especial a...`,
    variables: [
      { name: 'contest', label: 'Nome do Concurso', placeholder: 'Concurso TRF 2024', type: 'text', required: true },
      { name: 'position', label: 'Cargo', placeholder: 'Técnico Judiciário', type: 'text', required: true },
      { name: 'examiner', label: 'Banca', placeholder: 'CESPE, FCC, FGV', type: 'text', required: true },
      { name: 'info', label: 'Informações do Edital', placeholder: 'cole as principais informações', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['estudo', 'concurso', 'edital', 'estratégia'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'estudo-debate-argumentos',
    categoryId: 'study',
    title: 'Preparação para Debate/Seminário',
    description: 'Prepare argumentos sólidos para qualquer lado',
    template: `Atue como debatedor profissional.

TEMA: {{topic}}
POSIÇÃO: {{position}}
CONTEXTO: {{context}}

Prepare para o debate:

1. ENTENDIMENTO DO TEMA
- Definições-chave
- Contexto histórico
- Estado atual da discussão

2. SEUS ARGUMENTOS (5)
Para cada argumento:
- Premissa
- Evidência/dado
- Lógica
- Exemplo concreto
- Possível contra-argumento
- Refutação do contra-argumento

3. ARGUMENTOS DO OPONENTE (5)
- Provável argumento
- Ponto forte
- Ponto fraco
- Sua refutação

4. DADOS E ESTATÍSTICAS
- Fontes confiáveis
- Números impactantes
- Como citar

5. CITAÇÕES E AUTORIDADES
- Especialistas no tema
- Citações de impacto
- Quando usar

6. RETÓRICA
- Frases de abertura
- Transições
- Frases de fechamento
- Técnicas persuasivas

7. PERGUNTAS DIFÍCEIS
- Perguntas que podem fazer
- Como responder
- Como ganhar tempo

8. POSTURA E APRESENTAÇÃO
- Linguagem corporal
- Tom de voz
- Gestão do tempo`,
    variables: [
      { name: 'topic', label: 'Tema do Debate', placeholder: 'inteligência artificial no trabalho', type: 'text', required: true },
      { name: 'position', label: 'Sua Posição', placeholder: 'a favor, contra, neutro', type: 'text', required: true },
      { name: 'context', label: 'Contexto', placeholder: 'aula, competição, trabalho', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'debate', 'argumentação', 'retórica'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-leitura-dinamica',
    categoryId: 'study',
    title: 'Leitura Dinâmica e Compreensão',
    description: 'Leia mais rápido mantendo a compreensão',
    template: `Atue como instrutor de leitura dinâmica.

TIPO DE MATERIAL: {{material_type}}
OBJETIVO DA LEITURA: {{goal}}
TEMPO DISPONÍVEL: {{time}}

Crie guia personalizado:

1. PREPARAÇÃO
- Ambiente ideal
- Postura correta
- Ferramentas necessárias
- Mindset para leitura

2. TÉCNICAS DE SKIMMING
- Visão geral em 5 minutos
- O que observar primeiro
- Estrutura do texto

3. TÉCNICAS DE SCANNING
- Buscar informações específicas
- Palavras-chave
- Padrões visuais

4. LEITURA EM BLOCOS
- Expandir campo visual
- Evitar subvocalização
- Técnica do dedo/ponteiro

5. ESTRATÉGIA POR TIPO DE TEXTO
- Textos acadêmicos
- Livros técnicos
- Artigos online
- Documentos longos

6. COMPREENSÃO E RETENÇÃO
- Perguntas antes de ler
- Anotações durante
- Resumo após
- Revisão espaçada

7. EXERCÍCIOS PRÁTICOS
- Exercício 1: Campo visual
- Exercício 2: Velocidade
- Exercício 3: Compreensão

8. PROGRESSÃO
- Semana 1: Fundamentos
- Semana 2: Velocidade
- Semana 3: Integração
- Semana 4: Maestria`,
    variables: [
      { name: 'material_type', label: 'Tipo de Material', placeholder: 'livros, artigos, documentos', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo', placeholder: 'estudar para prova, pesquisa', type: 'text', required: true },
      { name: 'time', label: 'Tempo Disponível', placeholder: '30 min por dia', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'leitura', 'dinâmica', 'velocidade'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-apresentacao-oral',
    categoryId: 'study',
    title: 'Preparação para Apresentação Oral',
    description: 'Domine a arte de apresentar trabalhos',
    template: `Atue como coach de apresentações.

TEMA: {{topic}}
DURAÇÃO: {{duration}}
PÚBLICO: {{audience}}
OBJETIVO: {{goal}}

Prepare apresentação:

1. ESTRUTURA
- Abertura impactante (1 min)
- Desenvolvimento (X min)
- Conclusão memorável (1 min)
- Tempo para perguntas

2. ROTEIRO DETALHADO
Para cada slide/parte:
- Tempo alocado
- Pontos principais
- Transição para o próximo
- Notas do apresentador

3. RECURSOS VISUAIS
- Quantidade ideal de slides
- Design sugerido
- Gráficos e imagens
- O que evitar

4. TÉCNICAS DE ORATÓRIA
- Contato visual
- Gesticulação
- Variação de tom
- Pausas estratégicas

5. GESTÃO DO NERVOSISMO
- Antes da apresentação
- Durante
- Técnicas de respiração
- Mindset

6. PERGUNTAS E RESPOSTAS
- Perguntas prováveis
- Como responder
- Se não souber responder
- Como retomar controle

7. CHECKLIST PRÉ-APRESENTAÇÃO
□ Equipamento testado
□ Backup dos slides
□ Roupa adequada
□ Água disponível
□ Cronômetro

8. ENSAIO
- Quantas vezes ensaiar
- Como gravar e analisar
- Feedback útil`,
    variables: [
      { name: 'topic', label: 'Tema', placeholder: 'tema da apresentação', type: 'text', required: true },
      { name: 'duration', label: 'Duração', placeholder: '15 minutos', type: 'text', required: true },
      { name: 'audience', label: 'Público', placeholder: 'colegas, professores, banca', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo', placeholder: 'informar, convencer, defender TCC', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'apresentação', 'oratória', 'comunicação'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },
  {
    id: 'estudo-metodo-cornell',
    categoryId: 'study',
    title: 'Anotações Método Cornell',
    description: 'Faça anotações que realmente ajudam a estudar',
    template: `Atue como especialista em técnicas de estudo.

DISCIPLINA: {{subject}}
AULA/CAPÍTULO: {{content}}
OBJETIVO: {{goal}}

Aplique Método Cornell:

1. PREPARAÇÃO DA PÁGINA
┌────────────────────────────────────┐
│ TÍTULO: [tema]      DATA: [data]   │
├──────────┬─────────────────────────┤
│          │                         │
│ COLUNA   │ COLUNA DE ANOTAÇÕES     │
│ DE       │ (notas durante aula)    │
│ PERGUNTAS│                         │
│ (após)   │                         │
│          │                         │
├──────────┴─────────────────────────┤
│ RESUMO (após aula)                 │
└────────────────────────────────────┘

2. DURANTE A AULA
- O que anotar
- O que ignorar
- Abreviações úteis
- Símbolos padrão

3. APÓS A AULA (24h)
- Criar perguntas na coluna esquerda
- Escrever resumo na parte inferior
- Destacar conceitos-chave

4. REVISÃO
- Como usar para estudar
- Técnica de auto-teste
- Frequência de revisão

5. TEMPLATE PREENCHIDO
[Exemplo completo aplicado ao tema]

6. ADAPTAÇÕES
- Para diferentes tipos de aula
- Para leitura de livros
- Para vídeo-aulas
- Digital vs papel

7. INTEGRAÇÃO COM OUTRAS TÉCNICAS
- Mapas mentais
- Flashcards
- Revisão espaçada`,
    variables: [
      { name: 'subject', label: 'Disciplina', placeholder: 'Biologia, Direito, etc.', type: 'text', required: true },
      { name: 'content', label: 'Aula/Capítulo', placeholder: 'descreva o conteúdo', type: 'textarea', required: true },
      { name: 'goal', label: 'Objetivo', placeholder: 'prova, concurso, aprendizado', type: 'text', required: true }
    ],
    examples: [],
    tags: ['estudo', 'anotações', 'Cornell', 'técnica'],
    difficulty: 'beginner',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  }
];
