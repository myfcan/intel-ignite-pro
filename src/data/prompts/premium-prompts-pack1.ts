import { Prompt } from '../../types/prompt';

/**
 * PACK 1: PROMPTS PREMIUM SUPER DETALHADOS
 * 50 prompts avançados para Marketing Digital e Negócios
 */

// =====================================================
// MARKETING DIGITAL - PROMPTS PREMIUM (25)
// =====================================================

export const marketingDigitalPremiumPrompts: Prompt[] = [
  {
    id: 'md-premium-001',
    categoryId: 'marketing-digital',
    title: 'Plano de Lançamento Digital Completo',
    description: 'Estrutura completa para lançamento de produto digital com todas as fases',
    template: `Crie um plano de lançamento digital completo para:

Produto: {product_name}
Tipo: {product_type}
Preço de lançamento: {launch_price}
Público-alvo principal: {target_audience}
Data prevista do lançamento: {launch_date}
Orçamento disponível: {budget}

**PLANO DE LANÇAMENTO DIGITAL COMPLETO:**

**FASE 1: PRÉ-LANÇAMENTO (30 dias antes)**

1.1 **Aquecimento de Audiência**
- Estratégia de conteúdo diário
- Temas para gerar curiosidade
- Posts de antecipação
- Stories de bastidores
- Lives de conteúdo relacionado

1.2 **Construção de Lista**
- Isca digital (lead magnet) específica
- Página de captura (copy completo)
- Sequência de emails de aquecimento (7 emails)
- Grupos VIP (Telegram/WhatsApp)

1.3 **Prova Social**
- Estratégia para coletar depoimentos
- Beta testers (quantos e como selecionar)
- Casos de sucesso para documentar
- Screenshots e resultados parciais

**FASE 2: LANÇAMENTO (7 dias)**

2.1 **Dia 1: Abertura do Carrinho**
- Email de abertura (copy completo)
- Posts nas redes (roteiro)
- Stories (sequência de 10-15)
- Live de apresentação (roteiro)
- WhatsApp/Telegram (mensagens)

2.2 **Dias 2-3: Conteúdo de Valor**
- Aula/conteúdo gratuito poderoso
- Emails de relacionamento
- Depoimentos e provas
- FAQ preventivo

2.3 **Dias 4-5: Objeções e Prova Social**
- Vídeos de depoimentos
- Perguntas e respostas
- Lives de dúvidas
- Conteúdo matador de objeções

2.4 **Dias 6-7: Urgência e Escassez**
- Email de últimas horas
- Contagem regressiva
- Bônus de última hora
- Stories de urgência
- Mensagens finais

**FASE 3: PÓS-LANÇAMENTO**

3.1 **Onboarding de Clientes**
- Email de boas-vindas
- Sequência de ativação
- Suporte inicial

3.2 **Análise de Resultados**
- Métricas a acompanhar
- Dashboard de KPIs
- Relatório final

3.3 **Preparação para Próximo Lançamento**
- Melhorias identificadas
- Depoimentos para coletar
- Lista de espera

**CRONOGRAMA VISUAL:**
Calendário dia a dia com todas as ações

**COPY PRONTO PARA:**
- 7 emails de pré-lançamento
- 7 emails de lançamento
- Posts para cada dia
- Mensagens de WhatsApp
- Scripts de Lives

**MÉTRICAS DE SUCESSO:**
- Taxa de abertura de email esperada
- Taxa de conversão por fase
- ROI mínimo aceitável`,
    variables: [
      { name: 'product_name', label: 'Nome do Produto', placeholder: 'Ex: Método 6D de Produtividade', type: 'text', required: true },
      { name: 'product_type', label: 'Tipo de Produto', placeholder: 'Ex: Curso online, Mentoria, eBook', type: 'text', required: true },
      { name: 'launch_price', label: 'Preço de Lançamento', placeholder: 'Ex: R$ 997', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'Ex: Empreendedores que querem organizar sua rotina', type: 'textarea', required: true },
      { name: 'launch_date', label: 'Data do Lançamento', placeholder: 'Ex: 15/03/2024', type: 'text', required: true },
      { name: 'budget', label: 'Orçamento', placeholder: 'Ex: R$ 5.000', type: 'text', required: true }
    ],
    examples: [],
    tags: ['lançamento', 'produto digital', 'marketing', 'infoproduto', 'estratégia'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'md-premium-002',
    categoryId: 'marketing-digital',
    title: 'Estratégia de Tráfego Pago Multicanal',
    description: 'Plano integrado de Google Ads + Meta Ads + TikTok Ads',
    template: `Desenvolva estratégia integrada de tráfego pago para:

Negócio: {business}
Produto/Serviço principal: {product}
Ticket médio: {ticket}
Orçamento mensal total: {budget}
Objetivo principal: {goal}
Região de atuação: {region}

**ESTRATÉGIA MULTICANAL DE TRÁFEGO PAGO:**

**1. DIAGNÓSTICO E PLANEJAMENTO**

1.1 **Análise de Jornada do Cliente**
- Pontos de contato online
- Tempo médio de decisão
- Objeções principais
- Gatilhos de compra

1.2 **Distribuição de Orçamento**
| Canal | % Budget | Valor | Objetivo |
|-------|----------|-------|----------|
| Google Ads | X% | R$ X | [objetivo] |
| Meta Ads | X% | R$ X | [objetivo] |
| TikTok Ads | X% | R$ X | [objetivo] |

**2. GOOGLE ADS**

2.1 **Campanhas de Pesquisa**
- Grupos de palavras-chave (10 grupos)
- Palavras negativas
- Estrutura de anúncios (RSA)
- Extensões recomendadas
- Lances iniciais

2.2 **Campanhas de Display**
- Audiências de remarketing
- Audiências de intenção
- Públicos semelhantes
- Exclusões

2.3 **YouTube Ads**
- Tipos de campanha
- Segmentação
- Roteiro de vídeo (15s, 30s, 60s)

2.4 **Performance Max**
- Assets necessários
- Sinais de audiência
- Metas de conversão

**3. META ADS (Facebook + Instagram)**

3.1 **Estrutura de Campanhas**

**Campanha 1: Aquisição (Topo)**
- Objetivo: Alcance/Engajamento
- Públicos: Interesses amplos
- Criativos: Conteúdo de valor
- Budget: X% do orçamento Meta

**Campanha 2: Consideração (Meio)**
- Objetivo: Tráfego/Engajamento
- Públicos: Engajados, LAL 1-3%
- Criativos: Cases e benefícios
- Budget: X%

**Campanha 3: Conversão (Fundo)**
- Objetivo: Conversões
- Públicos: Retargeting, LAL 1%
- Criativos: Oferta direta
- Budget: X%

3.2 **Matriz de Criativos**
| Formato | Hook | CTA | Público |
|---------|------|-----|---------|
[10 variações]

**4. TIKTOK ADS**

4.1 **Estratégia de Conteúdo Nativo**
- Formatos que funcionam
- Trends a explorar
- Hashtags estratégicas

4.2 **Estrutura de Campanhas**
- Spark Ads vs In-Feed
- Targeting recomendado
- Criativos nativos (roteiros)

**5. TRACKING E ATRIBUIÇÃO**

5.1 **Configuração de Pixels**
- Eventos de conversão
- Valores dinâmicos
- Server-side tracking

5.2 **UTMs Padronizados**
- Nomenclatura de campanhas
- Parâmetros obrigatórios
- Dashboard unificado

**6. OTIMIZAÇÃO CONTÍNUA**

6.1 **Rotina Diária/Semanal**
- Métricas a monitorar
- Sinais de alerta
- Regras automáticas

6.2 **Testes A/B**
- Prioridades de teste
- Metodologia
- Documentação

**7. PROJEÇÃO DE RESULTADOS**
- Mês 1: Aprendizado
- Mês 2: Otimização
- Mês 3: Escala

**KPIs por Canal:**
[tabela detalhada]`,
    variables: [
      { name: 'business', label: 'Nome do Negócio', placeholder: 'Ex: Clínica de Estética Bella', type: 'text', required: true },
      { name: 'product', label: 'Produto/Serviço Principal', placeholder: 'Ex: Harmonização facial', type: 'text', required: true },
      { name: 'ticket', label: 'Ticket Médio', placeholder: 'Ex: R$ 2.500', type: 'text', required: true },
      { name: 'budget', label: 'Orçamento Mensal', placeholder: 'Ex: R$ 15.000', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: 30 leads qualificados/mês', type: 'text', required: true },
      { name: 'region', label: 'Região de Atuação', placeholder: 'Ex: São Paulo capital e região', type: 'text', required: true }
    ],
    examples: [],
    tags: ['tráfego pago', 'google ads', 'facebook ads', 'tiktok', 'multicanal'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-003',
    categoryId: 'marketing-digital',
    title: 'Automação de Marketing com Funil Completo',
    description: 'Configure automações de email marketing e nutrição de leads',
    template: `Crie sistema de automação de marketing para:

Negócio: {business}
Produto/Serviço: {product}
Ferramenta de email: {tool}
Tamanho da lista atual: {list_size}
Objetivo: {goal}

**SISTEMA COMPLETO DE AUTOMAÇÃO DE MARKETING:**

**1. MAPEAMENTO DO FUNIL**

1.1 **Jornada do Cliente**
\`\`\`
[Visitante] → [Lead] → [Lead Qualificado] → [Oportunidade] → [Cliente] → [Promotor]
\`\`\`

1.2 **Pontos de Captura**
- Landing pages (quais criar)
- Pop-ups estratégicos
- Formulários no site
- Lead magnets

**2. SEQUÊNCIAS DE EMAIL**

**SEQUÊNCIA 1: BOAS-VINDAS (5 emails)**

Email 1 (Imediato): Entrega do Lead Magnet
- Assunto: [3 opções]
- Preview: [texto]
- Corpo: [copy completo]
- CTA: [ação esperada]

Email 2 (Dia 1): Apresentação
- Assunto: [3 opções]
- Corpo: [história + posicionamento]
- CTA: [próximo passo]

Email 3 (Dia 2): Valor Rápido
- Assunto: [3 opções]
- Corpo: [dica prática]
- CTA: [engajamento]

Email 4 (Dia 4): Case de Sucesso
- Assunto: [3 opções]
- Corpo: [história de transformação]
- CTA: [conhecer mais]

Email 5 (Dia 6): Convite Suave
- Assunto: [3 opções]
- Corpo: [apresentar solução]
- CTA: [explorar produto]

**SEQUÊNCIA 2: NUTRIÇÃO (10 emails - 1 por semana)**
[Detalhamento de cada email com copy completo]

**SEQUÊNCIA 3: VENDAS (7 emails em 7 dias)**
[Detalhamento de cada email com copy completo]

**SEQUÊNCIA 4: RECUPERAÇÃO DE CARRINHO (3 emails)**
[Detalhamento de cada email com copy completo]

**SEQUÊNCIA 5: PÓS-VENDA (5 emails)**
[Detalhamento de cada email com copy completo]

**3. SEGMENTAÇÃO**

3.1 **Tags e Scoring**
| Ação | Tag | Pontos |
|------|-----|--------|
[lista de 20 ações e pontuações]

3.2 **Segmentos a Criar**
- Leads frios (< 20 pontos)
- Leads mornos (20-50 pontos)
- Leads quentes (> 50 pontos)
- Clientes ativos
- Clientes inativos

**4. AUTOMAÇÕES AVANÇADAS**

4.1 **Gatilhos Comportamentais**
- Visitou página de preços
- Abriu X emails sem clicar
- Clicou mas não converteu
- Completou X% do conteúdo

4.2 **Integrações**
- CRM
- WhatsApp
- Facebook (audience sync)
- Notificações para equipe

**5. DASHBOARD DE MÉTRICAS**

| Métrica | Meta | Alerta |
|---------|------|--------|
| Taxa de abertura | >25% | <15% |
| Taxa de clique | >3% | <1% |
| Taxa de conversão | >2% | <0.5% |
| Unsubscribe | <0.5% | >1% |

**6. CALENDÁRIO DE BROADCASTS**
- Segunda: [tema]
- Quarta: [tema]
- Sexta: [tema]

**7. TEMPLATES DE EMAIL**
[Estrutura visual para cada tipo]`,
    variables: [
      { name: 'business', label: 'Negócio', placeholder: 'Ex: Escola de inglês online', type: 'text', required: true },
      { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Curso de inglês para profissionais', type: 'text', required: true },
      { name: 'tool', label: 'Ferramenta de Email', placeholder: 'Ex: ActiveCampaign, RD Station, Mailchimp', type: 'text', required: true },
      { name: 'list_size', label: 'Tamanho da Lista', placeholder: 'Ex: 5.000 leads', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: Aumentar conversão para 5%', type: 'text', required: true }
    ],
    examples: [],
    tags: ['automação', 'email marketing', 'funil', 'nutrição', 'leads'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-004',
    categoryId: 'marketing-digital',
    title: 'Estratégia de SEO Avançada 12 Meses',
    description: 'Plano completo de SEO com técnicas on-page, off-page e técnico',
    template: `Desenvolva estratégia de SEO completa para:

Site: {website}
Nicho: {niche}
Palavras-chave principais: {main_keywords}
Concorrentes principais: {competitors}
Objetivo de tráfego: {traffic_goal}

**ESTRATÉGIA DE SEO AVANÇADA - 12 MESES:**

**FASE 1: AUDITORIA E DIAGNÓSTICO (Mês 1)**

1.1 **Auditoria Técnica**
- Velocidade de carregamento (Core Web Vitals)
- Mobile-first indexing
- Estrutura de URLs
- Sitemap e robots.txt
- Schema markup
- Canonical tags
- Erros de rastreamento

1.2 **Auditoria On-Page**
- Title tags e meta descriptions
- Estrutura de headings (H1-H6)
- Densidade de palavras-chave
- Links internos
- Imagens (alt text, compressão)
- Conteúdo thin/duplicado

1.3 **Auditoria Off-Page**
- Perfil de backlinks atual
- Domínios de referência
- Anchor text distribution
- Links tóxicos
- Análise de concorrentes

**FASE 2: FUNDAÇÃO TÉCNICA (Mês 2-3)**

2.1 **Correções Prioritárias**
| Problema | Impacto | Solução | Prazo |
|----------|---------|---------|-------|
[lista de 15-20 correções]

2.2 **Estrutura do Site**
- Arquitetura de informação
- Categorias e subcategorias
- Breadcrumbs
- Paginação
- Faceted navigation

2.3 **Implementações Técnicas**
- Schema markup (tipos a implementar)
- Hreflang (se multilíngue)
- AMP (se aplicável)
- PWA considerations

**FASE 3: ESTRATÉGIA DE CONTEÚDO (Mês 3-12)**

3.1 **Pesquisa de Palavras-Chave**

**Cluster 1: [tema principal]**
| Palavra-chave | Volume | Dificuldade | Tipo Conteúdo |
|---------------|--------|-------------|---------------|
[20 palavras-chave com métricas]

**Cluster 2-5:** [repetir estrutura]

3.2 **Calendário Editorial**
| Mês | Conteúdos | Palavras-chave alvo | Tipo |
|-----|-----------|---------------------|------|
[planejamento mês a mês]

3.3 **Estrutura de Conteúdo Pillar-Cluster**
- Páginas pillar (3-5)
- Conteúdos cluster (15-20 cada)
- Estratégia de links internos

3.4 **Template de Conteúdo SEO**
- Estrutura ideal de artigo
- Checklist de otimização
- Elementos obrigatórios

**FASE 4: LINK BUILDING (Mês 4-12)**

4.1 **Estratégias de Aquisição**
- Guest posting (lista de sites)
- Digital PR
- Broken link building
- Resource page link building
- Skyscraper technique
- HARO/SourceBottle

4.2 **Metas de Links**
| Mês | Links | DR Mínimo | Tipo |
|-----|-------|-----------|------|
[metas mensais]

4.3 **Outreach Templates**
[5 templates de email para diferentes estratégias]

**FASE 5: LOCAL SEO (se aplicável)**
- Google Business Profile
- Citações locais
- Reviews strategy
- Schema LocalBusiness

**FASE 6: MONITORAMENTO E RELATÓRIOS**

6.1 **KPIs Semanais**
- Posições de palavras-chave
- Tráfego orgânico
- Impressões e CTR
- Novos backlinks

6.2 **KPIs Mensais**
- Crescimento de autoridade
- Conversões orgânicas
- Receita atribuída
- ROI de SEO

6.3 **Ferramentas Necessárias**
- Pesquisa: [recomendações]
- Tracking: [recomendações]
- Auditoria: [recomendações]
- Link building: [recomendações]

**PROJEÇÃO DE RESULTADOS:**
| Mês | Tráfego Estimado | Keywords Top 10 |
|-----|------------------|-----------------|
[projeção 12 meses]`,
    variables: [
      { name: 'website', label: 'URL do Site', placeholder: 'Ex: www.meusite.com.br', type: 'text', required: true },
      { name: 'niche', label: 'Nicho/Segmento', placeholder: 'Ex: E-commerce de moda feminina', type: 'text', required: true },
      { name: 'main_keywords', label: 'Palavras-chave Principais', placeholder: 'Ex: vestido de festa, moda feminina, roupas online', type: 'textarea', required: true },
      { name: 'competitors', label: 'Concorrentes Principais', placeholder: 'Ex: site1.com, site2.com, site3.com', type: 'textarea', required: true },
      { name: 'traffic_goal', label: 'Meta de Tráfego', placeholder: 'Ex: 50.000 visitas orgânicas/mês em 12 meses', type: 'text', required: true }
    ],
    examples: [],
    tags: ['seo', 'tráfego orgânico', 'link building', 'conteúdo', 'google'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-005',
    categoryId: 'marketing-digital',
    title: 'Estratégia de YouTube para Negócios',
    description: 'Plano completo para crescer canal de YouTube profissional',
    template: `Crie estratégia de YouTube para:

Canal/Negócio: {channel}
Nicho: {niche}
Objetivo principal: {goal}
Frequência de postagem possível: {frequency}
Recursos disponíveis: {resources}

**ESTRATÉGIA COMPLETA DE YOUTUBE PARA NEGÓCIOS:**

**1. FUNDAÇÃO DO CANAL**

1.1 **Otimização do Canal**
- Nome do canal (SEO friendly)
- Handle (@usuario)
- Descrição do canal (5000 caracteres)
- Links importantes
- Banner (especificações e design)
- Foto de perfil
- Trailer do canal (roteiro)
- Watermark

1.2 **Playlists Estratégicas**
- Playlist 1: [tema] - para [objetivo]
- Playlist 2: [tema] - para [objetivo]
- Playlist 3: [tema] - para [objetivo]
- Playlist 4: [tema] - para [objetivo]
- Organização na página inicial

**2. ESTRATÉGIA DE CONTEÚDO**

2.1 **Pilares de Conteúdo**
| Pilar | % do Conteúdo | Objetivo |
|-------|---------------|----------|
| Educacional | 50% | Autoridade |
| Trending | 20% | Alcance |
| Vendas | 15% | Conversão |
| Behind the scenes | 15% | Conexão |

2.2 **Tipos de Vídeo**
- Tutoriais (duração ideal, estrutura)
- Listas (top 5, top 10)
- Vlogs/bastidores
- Reviews/análises
- Entrevistas
- Shorts

2.3 **Calendário de Conteúdo (4 semanas)**
| Semana | Vídeo 1 | Vídeo 2 | Shorts |
|--------|---------|---------|--------|
[calendário detalhado]

**3. SEO PARA YOUTUBE**

3.1 **Pesquisa de Palavras-chave**
- Ferramentas: TubeBuddy, VidIQ, YouTube Search
- Volume de busca no YouTube
- Concorrência
- Tendências

3.2 **Otimização de Vídeo**
- Título (60 caracteres, keyword no início)
- Descrição (estrutura de 5000 caracteres)
- Tags (500 caracteres)
- Hashtags (#)
- Cards e End Screens
- Legendas/CC

3.3 **Lista de Keywords por Vídeo**
| Vídeo | Keyword Principal | Secundárias | Volume Est. |
|-------|-------------------|-------------|-------------|
[20 vídeos mapeados]

**4. PRODUÇÃO**

4.1 **Estrutura de Vídeo Ideal**
- Hook (0-15s): [técnicas]
- Introdução (15-30s): [estrutura]
- Conteúdo principal: [divisão]
- CTA: [tipos]
- Outro: [estratégia]

4.2 **Roteiro Template**
\`\`\`
HOOK: [frase de impacto]
INTRO: [apresentação rápida]
PROMESSA: [o que vai aprender]
CONTEÚDO:
- Ponto 1
- Ponto 2
- Ponto 3
CTA: [ação específica]
OUTRO: [próximo vídeo]
\`\`\`

4.3 **Checklist de Produção**
[lista completa pré e pós gravação]

**5. THUMBNAILS**

5.1 **Elementos Obrigatórios**
- Rosto expressivo
- Texto grande (3-5 palavras)
- Cores contrastantes
- Consistência de marca

5.2 **Templates para Cada Tipo**
[descrição de 5 templates]

5.3 **Testes A/B**
- Como testar
- Métricas a analisar
- Quando trocar

**6. CRESCIMENTO E MONETIZAÇÃO**

6.1 **Estratégias de Crescimento**
- Colaborações
- Shorts strategy
- Community posts
- Lives
- YouTube Premieres

6.2 **Funil de Monetização**
YouTube → Lead Magnet → Email → Produto

6.3 **Métricas-Chave**
- Watch time
- CTR das thumbnails
- Average view duration
- Subscriber conversion rate

**7. PROMOÇÃO**

7.1 **Estratégia Cross-Platform**
- Instagram (como adaptar)
- LinkedIn (quando faz sentido)
- TikTok (cortes)
- Blog (embed + SEO)
- Email (newsletter)

**8. ANÁLISE E OTIMIZAÇÃO**

8.1 **Relatório Semanal**
[métricas a acompanhar]

8.2 **Relatório Mensal**
[análise mais profunda]

**9. EQUIPAMENTOS RECOMENDADOS**
[lista por faixa de investimento]`,
    variables: [
      { name: 'channel', label: 'Nome do Canal/Negócio', placeholder: 'Ex: Finanças Descomplicadas', type: 'text', required: true },
      { name: 'niche', label: 'Nicho', placeholder: 'Ex: Educação financeira para iniciantes', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: 10.000 inscritos em 6 meses', type: 'text', required: true },
      { name: 'frequency', label: 'Frequência de Postagem', placeholder: 'Ex: 2 vídeos por semana', type: 'text', required: true },
      { name: 'resources', label: 'Recursos Disponíveis', placeholder: 'Ex: Celular bom, ring light, microfone lapela', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['youtube', 'vídeo', 'crescimento', 'monetização', 'conteúdo'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-006',
    categoryId: 'marketing-digital',
    title: 'LinkedIn para Geração de Leads B2B',
    description: 'Estratégia completa de LinkedIn para vendas B2B',
    template: `Desenvolva estratégia de LinkedIn B2B para:

Profissional/Empresa: {profile}
Produto/Serviço B2B: {product}
ICP (Perfil de Cliente Ideal): {icp}
Meta de leads: {lead_goal}
Tempo disponível/dia: {time}

**ESTRATÉGIA LINKEDIN B2B PARA GERAÇÃO DE LEADS:**

**1. OTIMIZAÇÃO DO PERFIL (SOCIAL SELLING INDEX)**

1.1 **Headline Magnética**
- Fórmula: [Resultado] para [Público] | [Diferencial]
- 3 opções de headline:
  1. [sugestão]
  2. [sugestão]
  3. [sugestão]

1.2 **Foto e Banner**
- Foto: profissional, sorriso, fundo clean
- Banner: proposta de valor visual

1.3 **Resumo (About)**
\`\`\`
HOOK: [primeira frase impactante]

PROBLEMA: [dor do seu ICP]

SOLUÇÃO: [como você ajuda]

PROVA: [resultados e números]

CTA: [próximo passo claro]

[Keywords naturalmente inseridas]
\`\`\`

1.4 **Experiências**
- Foco em resultados, não tarefas
- Números e métricas
- Keywords do setor

1.5 **Featured Section**
- Lead magnet
- Case de sucesso
- Vídeo de apresentação
- Post viral

**2. ESTRATÉGIA DE CONTEÚDO**

2.1 **Pilares de Conteúdo B2B**
| Pilar | Frequência | Objetivo |
|-------|------------|----------|
| Educacional (insights do mercado) | 40% | Autoridade |
| Storytelling (cases e experiências) | 25% | Conexão |
| Opinião (posicionamentos) | 20% | Engajamento |
| CTA (ofertas/convites) | 15% | Conversão |

2.2 **Formatos de Alta Performance**
- Carrossel (como fazer)
- Documento PDF
- Enquetes
- Texto + imagem
- Vídeo nativo

2.3 **Calendário Semanal**
- Segunda: [tipo + tema]
- Terça: [tipo + tema]
- Quarta: [tipo + tema]
- Quinta: [tipo + tema]
- Sexta: [tipo + tema]

2.4 **Templates de Post**
[5 templates prontos para usar]

**3. ESTRATÉGIA DE CONEXÕES**

3.1 **Busca de ICPs**
- Filtros do LinkedIn
- Boolean search
- Sales Navigator (se aplicável)

3.2 **Mensagem de Conexão**
\`\`\`
Template 1 (Interesse genuíno):
[mensagem completa]

Template 2 (Conexão em comum):
[mensagem completa]

Template 3 (Conteúdo em comum):
[mensagem completa]
\`\`\`

3.3 **Rotina Diária de Conexões**
- Quantas enviar
- Critérios de seleção
- Tracking

**4. SEQUÊNCIA DE MENSAGENS (Social Selling)**

4.1 **Dia 1: Conexão aceita**
\`\`\`
[mensagem de agradecimento + valor]
\`\`\`

4.2 **Dia 3-5: Conteúdo de valor**
\`\`\`
[mensagem com insight/conteúdo]
\`\`\`

4.3 **Dia 7-10: Pergunta consultiva**
\`\`\`
[pergunta que identifica dor]
\`\`\`

4.4 **Dia 14+: Oferta suave**
\`\`\`
[convite para conversa]
\`\`\`

**5. ENGAJAMENTO ESTRATÉGICO**

5.1 **Rotina de 30 minutos/dia**
- 10 min: comentar em posts de ICPs
- 10 min: responder comentários próprios
- 10 min: interagir em grupos relevantes

5.2 **Comentários que Geram Conversas**
[5 frameworks de comentário]

**6. LINKEDIN COMPANY PAGE**

6.1 **Otimização**
- Descrição
- Especialidades
- Showcase pages

6.2 **Conteúdo de Empresa**
- Employee advocacy
- Casos de sucesso
- Cultura

**7. LINKEDIN ADS (Opcional)**

7.1 **Formatos Recomendados**
- Sponsored Content
- InMail
- Lead Gen Forms

7.2 **Segmentação B2B**
- Cargos
- Empresas
- Setores
- Tamanho

**8. MÉTRICAS E KPIs**

| Métrica | Meta Semanal | Meta Mensal |
|---------|--------------|-------------|
| Conexões enviadas | X | X |
| Taxa de aceite | X% | X% |
| Conversas iniciadas | X | X |
| Leads qualificados | X | X |
| Reuniões agendadas | X | X |

**9. FERRAMENTAS COMPLEMENTARES**
- CRM integration
- Automação (limites e cuidados)
- Agendamento de posts`,
    variables: [
      { name: 'profile', label: 'Profissional/Empresa', placeholder: 'Ex: Consultor de Vendas B2B', type: 'text', required: true },
      { name: 'product', label: 'Produto/Serviço B2B', placeholder: 'Ex: Consultoria em processos de vendas', type: 'text', required: true },
      { name: 'icp', label: 'ICP (Cliente Ideal)', placeholder: 'Ex: Diretores comerciais de empresas de tecnologia com 50-200 funcionários', type: 'textarea', required: true },
      { name: 'lead_goal', label: 'Meta de Leads/Mês', placeholder: 'Ex: 20 reuniões qualificadas', type: 'text', required: true },
      { name: 'time', label: 'Tempo Disponível/Dia', placeholder: 'Ex: 1 hora', type: 'text', required: true }
    ],
    examples: [],
    tags: ['linkedin', 'b2b', 'vendas', 'leads', 'social selling'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-007',
    categoryId: 'marketing-digital',
    title: 'Estratégia de Influencer Marketing',
    description: 'Plano completo para campanhas com influenciadores',
    template: `Crie estratégia de influencer marketing para:

Marca: {brand}
Produto: {product}
Orçamento: {budget}
Objetivo: {goal}
Público-alvo: {audience}

**ESTRATÉGIA COMPLETA DE INFLUENCER MARKETING:**

**1. PLANEJAMENTO ESTRATÉGICO**

1.1 **Objetivos da Campanha**
- Objetivo primário: [awareness/conversão/engajamento]
- KPIs principais:
  - Alcance: X
  - Engajamento: X%
  - Cliques: X
  - Conversões: X
  - CPM alvo: R$ X

1.2 **Buyer Persona**
- Demografia detalhada
- Comportamento online
- Influenciadores que seguem
- Tipos de conteúdo que consomem

**2. SELEÇÃO DE INFLUENCIADORES**

2.1 **Tiers de Influenciadores**
| Tier | Seguidores | Custo Médio | Objetivo |
|------|------------|-------------|----------|
| Nano | 1k-10k | R$ X | Autenticidade |
| Micro | 10k-100k | R$ X | Engajamento |
| Médio | 100k-500k | R$ X | Alcance |
| Macro | 500k-1M | R$ X | Awareness |
| Mega | 1M+ | R$ X | Massa |

2.2 **Critérios de Seleção**
- Taxa de engajamento mínima: X%
- Qualidade de comentários
- Fit com a marca
- Histórico de publis
- Audiência real (não comprada)
- Red flags a evitar

2.3 **Ferramentas de Análise**
- HypeAuditor
- Social Blade
- Influencer Marketing Hub

2.4 **Lista de Influenciadores Potenciais**
[Template para 20 influenciadores com métricas]

**3. ESTRUTURA DA CAMPANHA**

3.1 **Tipos de Parceria**
- Post único
- Série de posts
- Takeover
- Embaixador
- Afiliado
- Co-criação de produto

3.2 **Formatos de Conteúdo**
- Feed post (especificações)
- Stories (quantidade)
- Reels/TikTok
- YouTube integration
- Blog post
- Podcast mention

**4. BRIEFING PARA INFLUENCIADORES**

4.1 **Template de Briefing**
\`\`\`
SOBRE A MARCA:
[história e valores]

SOBRE O PRODUTO:
[benefícios e diferenciais]

OBJETIVO DA CAMPANHA:
[o que queremos alcançar]

MENSAGEM-CHAVE:
[3 pontos que devem aparecer]

DO's:
- [lista do que fazer]

DON'Ts:
- [lista do que evitar]

HASHTAGS OBRIGATÓRIAS:
#[branded hashtag]

LINK/CUPOM:
[tracking específico]

PRAZO:
[datas de entrega e publicação]

APROVAÇÃO:
[processo de revisão]
\`\`\`

**5. NEGOCIAÇÃO E CONTRATOS**

5.1 **Modelo de Proposta**
[template de proposta comercial]

5.2 **Cláusulas Essenciais do Contrato**
- Entregáveis
- Prazos
- Exclusividade
- Direitos de uso
- Métricas de performance
- Penalidades
- Pagamento

5.3 **Estrutura de Pagamento**
- Fee fixo vs performance
- Comissão de afiliado
- Pagamento parcelado
- Produtos + fee

**6. EXECUÇÃO E ACOMPANHAMENTO**

6.1 **Timeline da Campanha**
| Fase | Prazo | Ações |
|------|-------|-------|
| Briefing | D-14 | Enviar brief |
| Criação | D-7 | Influencer cria |
| Aprovação | D-5 | Revisar e aprovar |
| Publicação | D-Day | Postar |
| Boost | D+1 | Impulsionar |
| Report | D+7 | Coletar dados |

6.2 **Checklist de Aprovação**
- [ ] Mensagem-chave presente
- [ ] #ad ou #publi incluído
- [ ] Link/cupom correto
- [ ] Qualidade do conteúdo
- [ ] Fit com a marca

**7. MENSURAÇÃO E ROI**

7.1 **Métricas por Influenciador**
| Influenciador | Alcance | Engaj. | Cliques | Conv. | ROI |
|---------------|---------|--------|---------|-------|-----|
[tabela para preenchimento]

7.2 **Cálculo de ROI**
\`\`\`
ROI = (Receita gerada - Investimento) / Investimento x 100
EMV (Earned Media Value) = Impressões x CPM médio
\`\`\`

7.3 **Relatório Final**
[estrutura do relatório]

**8. RELACIONAMENTO CONTÍNUO**

8.1 **Programa de Embaixadores**
- Critérios de seleção
- Benefícios oferecidos
- Expectativas
- Duração

8.2 **Nurturing de Influenciadores**
- Envio de produtos
- Eventos exclusivos
- Primeiros acessos
- Relacionamento pessoal`,
    variables: [
      { name: 'brand', label: 'Nome da Marca', placeholder: 'Ex: Natural Beauty', type: 'text', required: true },
      { name: 'product', label: 'Produto para Promover', placeholder: 'Ex: Linha de skincare vegano', type: 'text', required: true },
      { name: 'budget', label: 'Orçamento da Campanha', placeholder: 'Ex: R$ 30.000', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: 1.000 vendas do produto X', type: 'text', required: true },
      { name: 'audience', label: 'Público-alvo', placeholder: 'Ex: Mulheres 25-40, interessadas em beleza natural', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['influencer', 'marketing', 'parcerias', 'creators', 'campanhas'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-008',
    categoryId: 'marketing-digital',
    title: 'Webinar de Vendas High-Ticket',
    description: 'Roteiro completo para webinar que vende produtos de alto valor',
    template: `Crie estrutura de webinar de vendas para:

Produto: {product}
Preço: {price}
Público: {audience}
Duração: {duration}
Bônus oferecidos: {bonuses}

**WEBINAR DE VENDAS HIGH-TICKET - ESTRUTURA COMPLETA:**

**PRÉ-WEBINAR:**

1. **Página de Inscrição**
- Headline: [3 opções]
- Benefícios da participação (5)
- Prova social
- Urgência (vagas limitadas)
- Formulário simples

2. **Sequência de Emails Pré-Webinar**
- Email 1 (confirmação): [copy]
- Email 2 (D-2): [copy]
- Email 3 (D-1): [copy]
- Email 4 (Dia do evento, manhã): [copy]
- Email 5 (1h antes): [copy]

3. **Lembretes WhatsApp** (se aplicável)
- Mensagem D-1: [texto]
- Mensagem 1h antes: [texto]

**ESTRUTURA DO WEBINAR:**

**BLOCO 1: ABERTURA (0-10 min)**

1.1 **Hook Inicial (0-2 min)**
- Promessa forte
- O que vão aprender
- Por que devem ficar até o final

1.2 **Apresentação Pessoal (2-5 min)**
- Credenciais rápidas
- Por que você pode ensinar isso
- Conexão com a audiência

1.3 **Regras do Jogo (5-10 min)**
- Pedir engajamento no chat
- Avisar sobre a oferta
- Criar antecipação

**BLOCO 2: CONTEÚDO DE VALOR (10-50 min)**

2.1 **O Grande Problema (10-15 min)**
- Nomear a dor
- Consequências de não resolver
- Estatísticas e dados
- Histórias de fracasso

2.2 **O Paradigma Quebrado (15-25 min)**
- Por que o que tentaram não funcionou
- As falsas soluções
- A descoberta/insight
- "Não é culpa sua"

2.3 **O Novo Caminho (25-40 min)**
- Sua metodologia/framework
- Passo 1: [ensinar]
- Passo 2: [ensinar]
- Passo 3: [ensinar]
- Mostrar resultados reais

2.4 **Case de Sucesso (40-50 min)**
- História transformadora
- Antes/depois
- Depoimento em vídeo
- Resultados concretos

**BLOCO 3: TRANSIÇÃO (50-55 min)**

3.1 **O Elefante na Sala**
"Agora, tudo que ensinei funciona... mas..."

3.2 **A Limitação do DIY**
- Tempo que levaria sozinho
- Erros que cometeria
- Custo de oportunidade

3.3 **A Pergunta**
"E se houvesse uma forma mais rápida?"

**BLOCO 4: OFERTA (55-80 min)**

4.1 **Apresentação do Produto (55-65 min)**
- Nome e posicionamento
- O que está incluso:
  - Módulo 1: [descrição + valor]
  - Módulo 2: [descrição + valor]
  - Módulo 3: [descrição + valor]
  - Bônus 1: [descrição + valor]
  - Bônus 2: [descrição + valor]
  - Bônus 3: [descrição + valor]

4.2 **Stack de Valor (65-70 min)**
| Item | Valor |
|------|-------|
| Programa principal | R$ X |
| Bônus 1 | R$ X |
| Bônus 2 | R$ X |
| Bônus 3 | R$ X |
| **Valor Total** | **R$ X** |

4.3 **Preço e Condições (70-75 min)**
- Preço normal: R$ X
- Preço especial hoje: R$ Y
- Condições de pagamento
- Garantia incondicional

4.4 **CTA Principal (75-80 min)**
- Botão de compra
- Passo a passo
- Urgência (tempo/vagas)

**BLOCO 5: Q&A E FECHAMENTO (80-90 min)**

5.1 **FAQ Preparado**
- Objeção 1: [resposta]
- Objeção 2: [resposta]
- Objeção 3: [resposta]
- Objeção 4: [resposta]
- Objeção 5: [resposta]

5.2 **Último Empurrão**
- Recapitular oferta
- Reiterar garantia
- Última chamada

**PÓS-WEBINAR:**

1. **Sequência de Email Replay**
- Email 1 (imediato): [copy]
- Email 2 (D+1 manhã): [copy]
- Email 3 (D+1 noite): [copy]
- Email 4 (D+2): Último dia [copy]

2. **Estratégia de Remarketing**
- Públicos a criar
- Anúncios de replay
- Anúncios de depoimentos

3. **Follow-up Individual**
- Para quem perguntou no chat
- Para quem clicou sem comprar

**SLIDES:**
[Estrutura de X slides com conteúdo de cada]

**CHECKLIST TÉCNICO:**
[Lista de verificação para o dia]`,
    variables: [
      { name: 'product', label: 'Nome do Produto', placeholder: 'Ex: Mentoria Business 360', type: 'text', required: true },
      { name: 'price', label: 'Preço', placeholder: 'Ex: R$ 4.997', type: 'text', required: true },
      { name: 'audience', label: 'Público-alvo', placeholder: 'Ex: Empresários que faturam 50-200k/mês', type: 'textarea', required: true },
      { name: 'duration', label: 'Duração do Webinar', placeholder: 'Ex: 90 minutos', type: 'text', required: true },
      { name: 'bonuses', label: 'Bônus Oferecidos', placeholder: 'Ex: Comunidade VIP, 3 mentorias extras, templates', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['webinar', 'vendas', 'high-ticket', 'apresentação', 'lançamento'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'md-premium-009',
    categoryId: 'marketing-digital',
    title: 'Estratégia de WhatsApp Marketing',
    description: 'Plano completo de vendas e relacionamento via WhatsApp',
    template: `Desenvolva estratégia de WhatsApp Marketing para:

Negócio: {business}
Produto/Serviço: {product}
Volume de leads esperado: {lead_volume}
Equipe disponível: {team}
Objetivo: {goal}

**ESTRATÉGIA COMPLETA DE WHATSAPP MARKETING:**

**1. ESTRUTURA E CONFIGURAÇÃO**

1.1 **WhatsApp Business vs API**
- Recomendação baseada no volume
- Custos envolvidos
- Funcionalidades necessárias

1.2 **Configuração do Perfil**
- Nome comercial
- Foto de perfil
- Descrição
- Horário de atendimento
- Catálogo de produtos
- Links importantes

1.3 **Mensagens Automáticas**
\`\`\`
Mensagem de Ausência:
[texto completo]

Mensagem de Saudação:
[texto completo]

Respostas Rápidas (10):
1. Preço: [resposta]
2. Horários: [resposta]
3. Localização: [resposta]
[...]
\`\`\`

**2. CAPTAÇÃO DE LEADS**

2.1 **Pontos de Entrada**
- Link do WhatsApp no site
- Click-to-WhatsApp Ads
- QR Code (materiais físicos)
- Bio das redes sociais
- Email signature

2.2 **Lead Magnets para WhatsApp**
- Cupom de desconto
- Conteúdo exclusivo
- Atendimento prioritário
- Acesso antecipado

2.3 **Template de Página de Captura**
[estrutura com copy]

**3. FUNIL DE VENDAS NO WHATSAPP**

3.1 **Etapa 1: Primeira Mensagem**
\`\`\`
Cliente: [mensagem típica]
Resposta: [script completo]
\`\`\`

3.2 **Etapa 2: Qualificação**
Perguntas para entender:
- Necessidade
- Urgência
- Budget
- Decisor

\`\`\`
Script de Qualificação:
[perguntas e respostas modelo]
\`\`\`

3.3 **Etapa 3: Apresentação**
\`\`\`
Script de Apresentação do Produto:
[texto + áudio sugerido]
\`\`\`

3.4 **Etapa 4: Objeções**
| Objeção | Resposta |
|---------|----------|
| "Tá caro" | [script] |
| "Vou pensar" | [script] |
| "Não tenho tempo" | [script] |
| "Tenho que falar com..." | [script] |
[10 objeções com respostas]

3.5 **Etapa 5: Fechamento**
\`\`\`
Técnicas de Fechamento:
1. Alternativa: [exemplo]
2. Urgência: [exemplo]
3. Resumo: [exemplo]
4. Pergunta direta: [exemplo]
\`\`\`

**4. AUTOMAÇÕES**

4.1 **Sequência de Boas-vindas**
- Mensagem 1 (imediato): [texto]
- Mensagem 2 (2h depois): [texto]
- Mensagem 3 (24h depois): [texto]

4.2 **Sequência de Nurturing**
- Dia 1: [conteúdo de valor]
- Dia 3: [prova social]
- Dia 5: [oferta suave]
- Dia 7: [urgência]

4.3 **Recuperação de Carrinho**
- 30min: [mensagem]
- 2h: [mensagem]
- 24h: [mensagem]

4.4 **Pós-venda**
- Confirmação: [mensagem]
- Entrega: [mensagem]
- Feedback: [mensagem]
- Upsell: [mensagem]

**5. LISTAS DE TRANSMISSÃO**

5.1 **Segmentação de Listas**
- Lista 1: Leads novos
- Lista 2: Clientes ativos
- Lista 3: Clientes inativos
- Lista 4: VIPs
- Lista 5: Por interesse

5.2 **Calendário de Broadcasts**
| Dia | Tipo | Conteúdo |
|-----|------|----------|
[calendário semanal]

5.3 **Templates de Broadcast**
- Conteúdo educativo: [modelo]
- Oferta/Promoção: [modelo]
- Novidades: [modelo]
- Eventos: [modelo]

**6. GRUPOS DE WHATSAPP**

6.1 **Estratégia de Grupos**
- Grupo de clientes
- Grupo VIP
- Comunidade

6.2 **Regras e Gestão**
[regras modelo]

6.3 **Conteúdo para Grupos**
[calendário de conteúdo]

**7. MÉTRICAS E KPIs**

| Métrica | Meta |
|---------|------|
| Taxa de resposta | >80% |
| Tempo médio de resposta | <5min |
| Taxa de conversão | X% |
| Ticket médio | R$ X |
| NPS via WhatsApp | >8 |

**8. COMPLIANCE E BOAS PRÁTICAS**

- Opt-in obrigatório
- Horários de envio
- Frequência máxima
- Opt-out fácil
- LGPD compliance

**9. FERRAMENTAS RECOMENDADAS**
- Gestão de conversas
- Automação
- CRM integration
- Análise de dados`,
    variables: [
      { name: 'business', label: 'Tipo de Negócio', placeholder: 'Ex: E-commerce de moda', type: 'text', required: true },
      { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Roupas femininas plus size', type: 'text', required: true },
      { name: 'lead_volume', label: 'Volume de Leads/Mês', placeholder: 'Ex: 500 leads', type: 'text', required: true },
      { name: 'team', label: 'Equipe Disponível', placeholder: 'Ex: 2 atendentes', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: Converter 20% dos leads em vendas', type: 'text', required: true }
    ],
    examples: [],
    tags: ['whatsapp', 'vendas', 'atendimento', 'automação', 'conversão'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'md-premium-010',
    categoryId: 'marketing-digital',
    title: 'Estratégia de Podcast para Autoridade',
    description: 'Lance e cresça um podcast profissional para gerar autoridade e negócios',
    template: `Crie estratégia de podcast para:

Nome do Podcast: {podcast_name}
Tema/Nicho: {niche}
Objetivo: {goal}
Frequência desejada: {frequency}
Recursos disponíveis: {resources}

**ESTRATÉGIA COMPLETA DE PODCAST:**

**1. CONCEITO E POSICIONAMENTO**

1.1 **Definição do Podcast**
- Nome: {podcast_name}
- Tagline: [3 opções]
- Descrição (140 caracteres)
- Descrição longa (4000 caracteres)

1.2 **Formato**
- Solo / Entrevistas / Co-host / Híbrido
- Duração ideal: [recomendação]
- Estrutura de episódios

1.3 **Público-Alvo**
- Persona principal
- Persona secundária
- Onde eles estão
- O que buscam

1.4 **Diferenciação**
- Por que este podcast?
- O que só você pode oferecer?
- Competidores e posicionamento

**2. ESTRUTURA DE EPISÓDIO**

2.1 **Template de Episódio Solo**
\`\`\`
INTRO (30s-1min):
- Gancho de abertura
- Apresentação
- O que vai aprender

CONTEÚDO PRINCIPAL (80%):
- Ponto 1 + exemplo
- Ponto 2 + exemplo
- Ponto 3 + exemplo

CONCLUSÃO (2-3min):
- Recap
- Ação prática
- CTA
- Encerramento
\`\`\`

2.2 **Template de Entrevista**
\`\`\`
INTRO (2min):
- Apresentação do tema
- Introdução do convidado
- Por que ele/ela

AQUECIMENTO (5min):
- Pergunta pessoal
- Jornada rápida

CONTEÚDO PRINCIPAL (25-40min):
- Pergunta 1: [tema]
- Pergunta 2: [tema]
- Pergunta 3: [tema]
- Pergunta 4: [tema]
- Pergunta 5: [tema]
- Pergunta curinga

ENCERRAMENTO (5min):
- Pergunta final especial
- Onde encontrar o convidado
- Recado final
- CTAs
\`\`\`

**3. PLANEJAMENTO DE CONTEÚDO**

3.1 **Pilares de Conteúdo**
| Pilar | % Episódios | Objetivo |
|-------|-------------|----------|
[4-5 pilares]

3.2 **Calendário de 12 Semanas**
| Semana | Tipo | Tema | Convidado |
|--------|------|------|-----------|
[12 episódios planejados]

3.3 **Banco de Ideias**
[50 ideias de episódios]

**4. PRODUÇÃO**

4.1 **Equipamentos Necessários**
- Microfone: [recomendações por faixa de preço]
- Fones: [recomendações]
- Interface: [se necessário]
- Software de gravação: [opções]
- Software de edição: [opções]

4.2 **Setup Técnico**
- Configurações de áudio
- Ambiente de gravação
- Backup

4.3 **Workflow de Produção**
1. Pesquisa e roteiro: X horas
2. Gravação: X horas
3. Edição: X horas
4. Assets visuais: X horas
5. Upload e descrição: X horas
6. Promoção: X horas

**5. DISTRIBUIÇÃO**

5.1 **Plataformas**
- Spotify for Podcasters (host)
- Apple Podcasts
- Google Podcasts
- Amazon Music
- Deezer
- YouTube (versão vídeo)

5.2 **Otimização por Plataforma**
- Títulos de episódio (SEO)
- Descrições
- Tags/Categorias
- Artwork

**6. CRESCIMENTO**

6.1 **Estratégias de Lançamento**
- Trailer
- 3 episódios iniciais
- Email para lista
- Social media blitz
- Pedir reviews

6.2 **Estratégias Contínuas**
- Convidados com audiência
- Cross-promotion
- Audiogramas
- Newsletter do podcast
- Comunidade

6.3 **Promoção por Episódio**
| Dia | Plataforma | Conteúdo |
|-----|------------|----------|
[calendário de promoção]

**7. MONETIZAÇÃO**

7.1 **Fases de Monetização**
- Fase 1 (0-1000 plays): Autoridade
- Fase 2 (1000-5000): Produtos próprios
- Fase 3 (5000+): Patrocinadores

7.2 **Modelos de Receita**
- Produtos/serviços próprios
- Afiliados mencionados
- Patrocínio/Ads
- Episódios premium
- Comunidade paga

7.3 **Mídia Kit Template**
[estrutura para apresentar a patrocinadores]

**8. MÉTRICAS**

8.1 **KPIs Principais**
- Downloads por episódio
- Retenção média
- Reviews e ratings
- Conversão para email
- Conversão para produto

8.2 **Ferramentas de Analytics**
- Spotify for Podcasters
- Apple Podcasts Connect
- Chartable
- Podtrac

**9. CONVIDADOS**

9.1 **Critérios de Seleção**
- Relevância para audiência
- Tamanho de audiência
- Fit com valores
- Disponibilidade

9.2 **Outreach Template**
\`\`\`
Assunto: [opções]
Corpo: [email completo]
\`\`\`

9.3 **Lista de Convidados Desejados**
[template para 50 nomes]

9.4 **Briefing para Convidado**
[documento modelo]`,
    variables: [
      { name: 'podcast_name', label: 'Nome do Podcast', placeholder: 'Ex: Empreendedorismo Sem Filtro', type: 'text', required: true },
      { name: 'niche', label: 'Tema/Nicho', placeholder: 'Ex: Negócios digitais e empreendedorismo', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: Gerar autoridade e leads para mentoria', type: 'text', required: true },
      { name: 'frequency', label: 'Frequência', placeholder: 'Ex: Semanal, às terças', type: 'text', required: true },
      { name: 'resources', label: 'Recursos Disponíveis', placeholder: 'Ex: 5h/semana, orçamento R$ 500 para equipamentos', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['podcast', 'áudio', 'autoridade', 'conteúdo', 'entrevistas'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  }
];

// =====================================================
// NEGÓCIOS - PROMPTS PREMIUM (15)
// =====================================================

export const businessPremiumPrompts: Prompt[] = [
  {
    id: 'biz-premium-001',
    categoryId: 'business',
    title: 'Business Plan Completo para Investidores',
    description: 'Plano de negócios profissional para captar investimento',
    template: `Crie business plan profissional para:

Empresa: {company}
Setor: {sector}
Estágio: {stage}
Investimento buscado: {investment}
Problema que resolve: {problem}

**BUSINESS PLAN PARA INVESTIDORES:**

**EXECUTIVE SUMMARY**
- Elevator pitch (30 segundos)
- Problema e solução
- Mercado-alvo
- Modelo de negócio
- Tração atual
- Equipe
- Ask (quanto e para quê)
- Projeção de retorno

**1. O PROBLEMA**

1.1 **Definição do Problema**
- Tamanho do problema
- Quem sofre com ele
- Custo da inação
- Tendências que agravam

1.2 **Soluções Atuais**
- Como as pessoas resolvem hoje
- Limitações das soluções existentes
- Por que não funciona bem

**2. A SOLUÇÃO**

2.1 **Proposta de Valor**
- O que fazemos
- Como resolvemos
- Por que é melhor
- Unique selling proposition

2.2 **Produto/Serviço**
- Descrição detalhada
- Features principais
- Roadmap de produto
- Propriedade intelectual

**3. MERCADO**

3.1 **Dimensionamento**
- TAM (Total Addressable Market)
- SAM (Serviceable Addressable Market)
- SOM (Serviceable Obtainable Market)
- Metodologia de cálculo

3.2 **Tendências**
- Crescimento do mercado
- Mudanças comportamentais
- Regulatórias
- Tecnológicas

**4. MODELO DE NEGÓCIO**

4.1 **Como Ganhamos Dinheiro**
- Streams de receita
- Pricing strategy
- Unit economics:
  - CAC (Custo de Aquisição)
  - LTV (Lifetime Value)
  - LTV/CAC ratio
  - Payback period

4.2 **Business Model Canvas**
[Canvas completo]

**5. TRAÇÃO**

5.1 **Métricas Atuais**
| Métrica | Atual | Meta 12m | Meta 24m |
|---------|-------|----------|----------|
| MRR/ARR | | | |
| Clientes | | | |
| Churn | | | |
| NPS | | | |

5.2 **Marcos Alcançados**
- [data]: [marco]
- [data]: [marco]
- [data]: [marco]

5.3 **Social Proof**
- Clientes relevantes
- Prêmios/reconhecimentos
- Menções na mídia

**6. COMPETIÇÃO**

6.1 **Mapeamento Competitivo**
| Competidor | Forças | Fraquezas | Diferencial nosso |
|------------|--------|-----------|-------------------|
[5-7 competidores]

6.2 **Matriz de Posicionamento**
[gráfico 2x2]

6.3 **Barreiras de Entrada**
- Network effects
- Switching costs
- Escala
- Tecnologia
- Marca

**7. GO-TO-MARKET**

7.1 **Estratégia de Aquisição**
- Canais principais
- CAC por canal
- Estratégia de escala

7.2 **Funil de Vendas**
[descrição do funil]

7.3 **Parcerias Estratégicas**
[potenciais parceiros]

**8. EQUIPE**

8.1 **Founders**
Para cada founder:
- Nome e cargo
- Background relevante
- Por que essa pessoa
- % equity

8.2 **Time Atual**
[organograma]

8.3 **Contratações Planejadas**
| Posição | Prazo | Custo |
|---------|-------|-------|
[próximas 5-10 contratações]

8.4 **Advisors**
[lista com credenciais]

**9. FINANCEIRO**

9.1 **P&L Projetado (5 anos)**
| | Ano 1 | Ano 2 | Ano 3 | Ano 4 | Ano 5 |
|--|-------|-------|-------|-------|-------|
| Receita | | | | | |
| Custo | | | | | |
| Margem Bruta | | | | | |
| Despesas | | | | | |
| EBITDA | | | | | |

9.2 **Premissas**
[explicação das premissas]

9.3 **Cenários**
- Pessimista
- Base
- Otimista

**10. INVESTIMENTO**

10.1 **Ask**
- Valor: R$ {investment}
- Tipo: [equity/convertible/SAFE]
- Valuation: [pre-money]

10.2 **Uso dos Recursos**
| Área | % | Valor | Objetivo |
|------|---|-------|----------|
| Produto | | | |
| Marketing | | | |
| Equipe | | | |
| Operações | | | |

10.3 **Milestones com o Investimento**
- 6 meses: [objetivo]
- 12 meses: [objetivo]
- 18 meses: [objetivo]

10.4 **Próximo Round**
- Quando: [prazo]
- Quanto: [valor]
- Milestone: [trigger]

**11. RISCOS E MITIGAÇÃO**

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
[5-7 riscos principais]

**12. APÊNDICE**
- Cap table atual
- Deck de apresentação
- Demonstrativos financeiros
- Contratos relevantes
- Pipeline de clientes`,
    variables: [
      { name: 'company', label: 'Nome da Empresa', placeholder: 'Ex: TechSolutions LTDA', type: 'text', required: true },
      { name: 'sector', label: 'Setor de Atuação', placeholder: 'Ex: SaaS B2B / Fintech / Healthtech', type: 'text', required: true },
      { name: 'stage', label: 'Estágio Atual', placeholder: 'Ex: Seed / Série A / Growth', type: 'text', required: true },
      { name: 'investment', label: 'Investimento Buscado', placeholder: 'Ex: R$ 2.000.000', type: 'text', required: true },
      { name: 'problem', label: 'Problema que Resolve', placeholder: 'Ex: PMEs perdem 20h/mês em gestão financeira manual', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['business plan', 'investimento', 'startup', 'pitch', 'captação'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },
  {
    id: 'biz-premium-002',
    categoryId: 'business',
    title: 'Plano de Expansão e Escala',
    description: 'Estratégia completa para escalar operações e expandir mercado',
    template: `Desenvolva plano de expansão para:

Empresa: {company}
Faturamento atual: {revenue}
Mercado atual: {current_market}
Mercado-alvo de expansão: {target_market}
Prazo: {timeline}

**PLANO DE EXPANSÃO E ESCALA:**

**1. DIAGNÓSTICO ATUAL**

1.1 **Análise de Maturidade**
| Área | Nível 1-5 | Gaps | Prioridade |
|------|-----------|------|------------|
| Produto | | | |
| Operações | | | |
| Financeiro | | | |
| Equipe | | | |
| Comercial | | | |
| Marketing | | | |

1.2 **Unit Economics Atuais**
- CAC:
- LTV:
- Margem:
- Payback:
- Churn:

1.3 **Capacidade Atual**
- Clientes máximos com estrutura atual
- Gargalos identificados
- Quick wins

**2. ESTRATÉGIA DE EXPANSÃO**

2.1 **Modelo de Expansão**
- [ ] Expansão geográfica
- [ ] Novos segmentos
- [ ] Novos produtos
- [ ] Novos canais
- [ ] Aquisições

2.2 **Análise de Mercado-Alvo**
- Tamanho do mercado
- Competidores locais
- Barreiras de entrada
- Adaptações necessárias

2.3 **Go-to-Market**
- Estratégia de entrada
- Primeiro cliente ideal
- Validação inicial
- Escala

**3. OPERAÇÕES ESCALÁVEIS**

3.1 **Processos a Padronizar**
| Processo | Situação Atual | Meta | Responsável |
|----------|----------------|------|-------------|
[10-15 processos críticos]

3.2 **Automações Necessárias**
- Vendas: [ferramentas]
- Marketing: [ferramentas]
- Operações: [ferramentas]
- Financeiro: [ferramentas]
- Atendimento: [ferramentas]

3.3 **Playbooks a Criar**
- Playbook de vendas
- Playbook de onboarding
- Playbook de suporte
- Playbook de marketing
[estrutura de cada]

**4. ESTRUTURA ORGANIZACIONAL**

4.1 **Organograma Atual vs Futuro**
[desenho organizacional]

4.2 **Plano de Contratações**
| Fase | Posições | Headcount | Custo Mensal |
|------|----------|-----------|--------------|
[por trimestre]

4.3 **Cultura Organizacional**
- Valores a manter
- Mudanças necessárias
- Comunicação de cultura

**5. TECNOLOGIA E INFRAESTRUTURA**

5.1 **Stack Tecnológico**
| Área | Ferramenta Atual | Nova Ferramenta | Prazo |
|------|------------------|-----------------|-------|
[mapeamento completo]

5.2 **Infraestrutura Física**
- Escritórios
- Centros de distribuição
- Equipamentos
- [específico do negócio]

**6. FINANCEIRO**

6.1 **Projeção Financeira de Expansão**
| | Atual | Ano 1 | Ano 2 | Ano 3 |
|--|-------|-------|-------|-------|
| Receita | | | | |
| Clientes | | | | |
| Ticket médio | | | | |
| Custo fixo | | | | |
| Custo variável | | | | |
| EBITDA | | | | |

6.2 **Investimento Necessário**
| Item | Valor | Prazo | Retorno Esperado |
|------|-------|-------|------------------|
[detalhamento do CAPEX/OPEX]

6.3 **Fontes de Financiamento**
- Capital próprio
- Debt
- Equity
- Incentivos fiscais

**7. CRONOGRAMA DE IMPLEMENTAÇÃO**

7.1 **Roadmap Trimestral**
**Q1:**
- Milestone 1
- Milestone 2
- Milestone 3
[KPIs do trimestre]

**Q2:**
[...]

**Q3:**
[...]

**Q4:**
[...]

7.2 **Quick Wins (30 dias)**
- Ação 1: [descrição]
- Ação 2: [descrição]
- Ação 3: [descrição]

**8. RISCOS E MITIGAÇÃO**

| Risco | Impacto | Probabilidade | Mitigação | Plano B |
|-------|---------|---------------|-----------|---------|
[10 riscos principais]

**9. GOVERNANÇA DO PROJETO**

9.1 **Comitê de Expansão**
- Membros
- Frequência de reuniões
- Escopo de decisões

9.2 **OKRs de Expansão**
**Objective 1:** [objetivo]
- KR1: [métrica]
- KR2: [métrica]
- KR3: [métrica]

**Objective 2:** [objetivo]
[...]

**10. INDICADORES DE SUCESSO**

| Fase | Indicador | Meta | Prazo |
|------|-----------|------|-------|
[indicadores por fase]`,
    variables: [
      { name: 'company', label: 'Nome da Empresa', placeholder: 'Ex: Distribuidora ABC', type: 'text', required: true },
      { name: 'revenue', label: 'Faturamento Atual', placeholder: 'Ex: R$ 500.000/mês', type: 'text', required: true },
      { name: 'current_market', label: 'Mercado Atual', placeholder: 'Ex: São Paulo capital, B2B, setor alimentício', type: 'textarea', required: true },
      { name: 'target_market', label: 'Mercado-Alvo', placeholder: 'Ex: Grande São Paulo + interior paulista', type: 'textarea', required: true },
      { name: 'timeline', label: 'Prazo para Expansão', placeholder: 'Ex: 24 meses', type: 'text', required: true }
    ],
    examples: [],
    tags: ['expansão', 'escala', 'crescimento', 'planejamento', 'estratégia'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'biz-premium-003',
    categoryId: 'business',
    title: 'Estruturação de Processos Comerciais',
    description: 'Monte uma máquina de vendas com processos documentados',
    template: `Crie estrutura comercial completa para:

Empresa: {company}
Modelo de vendas: {sales_model}
Ticket médio: {ticket}
Ciclo de vendas: {cycle}
Meta de faturamento: {goal}

**ESTRUTURAÇÃO DE PROCESSOS COMERCIAIS:**

**1. FUNDAÇÃO COMERCIAL**

1.1 **ICP (Ideal Customer Profile)**
\`\`\`
EMPRESA:
- Segmento:
- Tamanho:
- Faturamento:
- Localização:
- Tecnologia:

CONTATO:
- Cargo:
- Idade:
- Dores:
- Objetivos:
- Objeções comuns:

RED FLAGS (não vender para):
-
-
-
\`\`\`

1.2 **Proposta de Valor**
- Promessa principal:
- Diferenciação:
- Prova:

**2. FUNIL DE VENDAS**

2.1 **Etapas do Funil**
| Etapa | Definição | Critério de Entrada | Critério de Saída | Tempo Médio |
|-------|-----------|---------------------|-------------------|-------------|
| Lead | | | | |
| MQL | | | | |
| SQL | | | | |
| Oportunidade | | | | |
| Proposta | | | | |
| Negociação | | | | |
| Fechamento | | | | |

2.2 **Taxa de Conversão Esperada**
\`\`\`
Lead → MQL: X%
MQL → SQL: X%
SQL → Oportunidade: X%
Oportunidade → Proposta: X%
Proposta → Fechamento: X%
\`\`\`

**3. PLAYBOOK DE PROSPECÇÃO**

3.1 **Fontes de Leads**
| Fonte | Volume | Custo | Qualidade | Prioridade |
|-------|--------|-------|-----------|------------|
[lista de fontes]

3.2 **Cadência de Prospecção Outbound**
| Dia | Canal | Template | Objetivo |
|-----|-------|----------|----------|
| D1 | Email | [template] | Abrir |
| D3 | LinkedIn | [template] | Conexão |
| D5 | Email | [template] | Valor |
| D7 | Telefone | [script] | Qualificar |
[cadência completa de 21 dias]

3.3 **Scripts e Templates**
\`\`\`
EMAIL 1 - PRIMEIRO CONTATO:
Assunto: [opções]
Corpo: [texto]

EMAIL 2 - FOLLOW-UP:
[...]

LIGAÇÃO - COLD CALL:
Abertura: [script]
Pitch: [script]
Qualificação: [perguntas]
Next step: [opções]

LINKEDIN - CONEXÃO:
[mensagem]

LINKEDIN - INMAIL:
[mensagem]
\`\`\`

**4. PLAYBOOK DE QUALIFICAÇÃO**

4.1 **Framework de Qualificação (BANT/MEDDIC/etc)**
\`\`\`
BANT:
B - Budget: [perguntas]
A - Authority: [perguntas]
N - Need: [perguntas]
T - Timeline: [perguntas]
\`\`\`

4.2 **Scorecard de Qualificação**
| Critério | Peso | Score 1 | Score 2 | Score 3 |
|----------|------|---------|---------|---------|
[critérios de pontuação]

4.3 **Perguntas de Discovery**
[20 perguntas estratégicas]

**5. PLAYBOOK DE APRESENTAÇÃO**

5.1 **Estrutura da Reunião de Vendas**
\`\`\`
0-5min: Rapport e agenda
5-15min: Discovery (se não feito)
15-35min: Apresentação customizada
35-50min: Demonstração/Prova
50-55min: Próximos passos
55-60min: Compromisso
\`\`\`

5.2 **Deck de Vendas**
[estrutura slide a slide]

5.3 **Demo Flow**
[roteiro de demonstração]

**6. PLAYBOOK DE PROPOSTA**

6.1 **Estrutura da Proposta**
[template completo]

6.2 **Precificação**
| Plano/Produto | Preço | Desconto Máximo | Aprovação |
|---------------|-------|-----------------|-----------|
[tabela de preços e descontos]

6.3 **Templates de Proposta**
[por segmento/produto]

**7. PLAYBOOK DE NEGOCIAÇÃO**

7.1 **Objeções e Respostas**
| Objeção | Tipo | Resposta | Técnica |
|---------|------|----------|---------|
| "Tá caro" | Preço | [resposta] | [técnica] |
| "Preciso pensar" | Stall | [resposta] | [técnica] |
[15-20 objeções mapeadas]

7.2 **Técnicas de Fechamento**
[5-7 técnicas com exemplos]

7.3 **Limites de Negociação**
- Desconto máximo sem aprovação:
- Condições especiais permitidas:
- Escalation path:

**8. PLAYBOOK DE PÓS-VENDA**

8.1 **Handoff para Customer Success**
[processo documentado]

8.2 **Onboarding Comercial**
[primeiros 30 dias]

**9. FERRAMENTAS E STACK**

9.1 **CRM**
- Ferramenta:
- Pipeline stages:
- Campos customizados:
- Automações:

9.2 **Outras Ferramentas**
| Ferramenta | Uso | Custo |
|------------|-----|-------|
[stack completo]

**10. MÉTRICAS E DASHBOARDS**

10.1 **KPIs do Time**
| Métrica | Fórmula | Meta | Frequência |
|---------|---------|------|------------|
[métricas principais]

10.2 **KPIs Individuais**
- Atividades/dia:
- Conversões:
- Pipeline:
- Fechamento:

10.3 **Relatórios**
[frequência e estrutura]

**11. ROTINAS E RITUAIS**

| Ritual | Frequência | Duração | Participantes | Objetivo |
|--------|------------|---------|---------------|----------|
| Daily | Diária | 15min | Time | Pipeline |
| Forecast | Semanal | 1h | Time + Gestão | Previsão |
| 1:1 | Semanal | 30min | Gestor + Rep | Coaching |
| Pipeline Review | Semanal | 1h | Time | Oportunidades |
| All Hands | Mensal | 1h | Empresa | Resultados |

**12. REMUNERAÇÃO E INCENTIVOS**

12.1 **Estrutura de Comissão**
[modelo de comissionamento]

12.2 **Aceleradores**
[bonificações por meta]

12.3 **SPIFs**
[incentivos pontuais]`,
    variables: [
      { name: 'company', label: 'Nome da Empresa', placeholder: 'Ex: SoftwareCorp', type: 'text', required: true },
      { name: 'sales_model', label: 'Modelo de Vendas', placeholder: 'Ex: Inside Sales B2B, Field Sales, Self-service', type: 'text', required: true },
      { name: 'ticket', label: 'Ticket Médio', placeholder: 'Ex: R$ 5.000/mês', type: 'text', required: true },
      { name: 'cycle', label: 'Ciclo de Vendas', placeholder: 'Ex: 45 dias', type: 'text', required: true },
      { name: 'goal', label: 'Meta de Faturamento', placeholder: 'Ex: R$ 500.000/mês', type: 'text', required: true }
    ],
    examples: [],
    tags: ['vendas', 'processos', 'comercial', 'playbook', 'funil'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'biz-premium-004',
    categoryId: 'business',
    title: 'Framework de Precificação Estratégica',
    description: 'Defina preços que maximizam lucro e percepção de valor',
    template: `Desenvolva estratégia de precificação para:

Produto/Serviço: {product}
Custo unitário: {cost}
Preço atual: {current_price}
Concorrentes e preços: {competitors}
Objetivo: {goal}

**FRAMEWORK DE PRECIFICAÇÃO ESTRATÉGICA:**

**1. ANÁLISE DE CUSTOS**

1.1 **Estrutura de Custos**
| Componente | Fixo | Variável | % do Total |
|------------|------|----------|------------|
| Matéria-prima | | | |
| Mão de obra | | | |
| Overhead | | | |
| Marketing | | | |
| Impostos | | | |
| Outros | | | |
| **TOTAL** | | | 100% |

1.2 **Custo por Unidade/Cliente**
- Custo direto:
- Custo indireto alocado:
- Custo total:

1.3 **Break-even Analysis**
- Ponto de equilíbrio: X unidades/mês
- Margem de segurança atual: X%

**2. ANÁLISE DE VALOR**

2.1 **Value Proposition Canvas**
\`\`\`
JOBS TO BE DONE:
- Funcionais:
- Emocionais:
- Sociais:

DORES:
- [dor 1]: intensidade X/10
- [dor 2]: intensidade X/10
- [dor 3]: intensidade X/10

GANHOS DESEJADOS:
- [ganho 1]: importância X/10
- [ganho 2]: importância X/10
- [ganho 3]: importância X/10
\`\`\`

2.2 **Quantificação de Valor**
| Benefício | Como medir | Valor monetário |
|-----------|------------|-----------------|
| Economia de tempo | X horas/mês | R$ X |
| Aumento de receita | X% | R$ X |
| Redução de custo | X% | R$ X |
| Risco evitado | | R$ X |
| **VALOR TOTAL** | | **R$ X** |

2.3 **Price to Value Ratio**
Preço / Valor entregue = X%
(ideal: 10-30% do valor entregue)

**3. ANÁLISE COMPETITIVA**

3.1 **Mapa de Preços do Mercado**
| Concorrente | Preço | Features | Posicionamento |
|-------------|-------|----------|----------------|
[5-10 concorrentes]

3.2 **Positioning Map**
[gráfico preço x qualidade/features]

3.3 **Diferenciais Precificáveis**
| Diferencial | Valor adicional | Preço premium |
|-------------|-----------------|---------------|
[diferenciais únicos]

**4. ANÁLISE DE DEMANDA**

4.1 **Elasticidade de Preço**
- Demanda atual ao preço X: Y unidades
- Estimativa de demanda a preço X+10%: Y unidades
- Estimativa de demanda a preço X-10%: Y unidades

4.2 **Willingness to Pay (WTP)**
Pesquisa recomendada:
- Van Westendorp Price Sensitivity Meter
- Conjoint Analysis
- A/B testing de preços

4.3 **Segmentação por WTP**
| Segmento | % do Mercado | WTP Máximo | Características |
|----------|--------------|------------|-----------------|
| Premium | | | |
| Standard | | | |
| Budget | | | |

**5. ESTRATÉGIAS DE PRECIFICAÇÃO**

5.1 **Modelos de Precificação**
- [ ] Cost-plus (custo + margem)
- [ ] Value-based (baseado em valor)
- [ ] Competition-based (baseado em competidores)
- [ ] Dynamic pricing (dinâmico)
- [ ] Freemium
- [ ] Subscription
- [ ] Usage-based
- [ ] Tiered pricing

5.2 **Recomendação de Modelo**
[análise e recomendação]

5.3 **Estrutura de Preços Proposta**

**OPÇÃO 1: Tier Único**
Preço: R$ X
- Inclui: [lista]

**OPÇÃO 2: Good-Better-Best**
| | Basic | Pro | Enterprise |
|--|-------|-----|------------|
| Preço | R$ X | R$ Y | R$ Z |
| Feature 1 | ✓ | ✓ | ✓ |
| Feature 2 | - | ✓ | ✓ |
| Feature 3 | - | - | ✓ |
| Suporte | Email | Prioritário | Dedicado |

**OPÇÃO 3: Usage-Based**
- Base: R$ X
- Por usuário: R$ Y
- Por transação: R$ Z

**6. TÁTICAS DE PRICING**

6.1 **Âncoras de Preço**
- Preço âncora: R$ X (mostrar primeiro)
- Preço real: R$ Y
- Economia percebida: X%

6.2 **Price Endings**
Recomendação: R$ X,97 / R$ X,90 / R$ X.000

6.3 **Bundling**
| Bundle | Produtos | Preço separado | Preço bundle | Desconto |
|--------|----------|----------------|--------------|----------|
[estratégias de bundle]

6.4 **Descontos Estratégicos**
| Tipo | Valor | Condição | Objetivo |
|------|-------|----------|----------|
| Volume | X% | Y+ unidades | Ticket médio |
| Fidelidade | X% | 12+ meses | Retenção |
| Pagamento antecipado | X% | Anual | Cash flow |
[política de descontos]

**7. IMPLEMENTAÇÃO**

7.1 **Comunicação de Preço**
- Como apresentar o preço
- Objeções e respostas
- Training de equipe

7.2 **Transição de Preços**
- Para novos clientes: [data]
- Para clientes atuais: [estratégia]
- Grandfathering: [política]

7.3 **Monitoramento**
| Métrica | Atual | Meta | Frequência |
|---------|-------|------|------------|
| Preço médio praticado | | | |
| Desconto médio | | | |
| Win rate | | | |
| Margem | | | |

**8. REVISÃO E AJUSTES**

8.1 **Gatilhos de Revisão**
- Custo aumentou X%
- Competidor mudou preço
- NPS caiu abaixo de X
- Win rate caiu abaixo de X%

8.2 **Calendário de Revisão**
- Análise mensal: métricas
- Revisão trimestral: competidores
- Revisão anual: estratégia completa

**RECOMENDAÇÃO FINAL:**
[preço recomendado com justificativa completa]`,
    variables: [
      { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Software de gestão de projetos SaaS', type: 'text', required: true },
      { name: 'cost', label: 'Custo Unitário/Mensal', placeholder: 'Ex: R$ 150 por cliente', type: 'text', required: true },
      { name: 'current_price', label: 'Preço Atual', placeholder: 'Ex: R$ 297/mês', type: 'text', required: true },
      { name: 'competitors', label: 'Concorrentes e Preços', placeholder: 'Ex: Competitor A: R$ 199, Competitor B: R$ 397, Competitor C: R$ 99', type: 'textarea', required: true },
      { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Maximizar receita mantendo market share', type: 'text', required: true }
    ],
    examples: [],
    tags: ['precificação', 'pricing', 'estratégia', 'valor', 'margem'],
    difficulty: 'advanced',
    isPremium: true,
    usageCount: 0
  },
  {
    id: 'biz-premium-005',
    categoryId: 'business',
    title: 'OKRs e Planejamento Estratégico Anual',
    description: 'Estruture objetivos e resultados-chave para o ano',
    template: `Crie planejamento estratégico com OKRs para:

Empresa: {company}
Visão de longo prazo: {vision}
Situação atual: {current_state}
Principais desafios: {challenges}
Período: {period}

**PLANEJAMENTO ESTRATÉGICO E OKRs:**

**1. ANÁLISE ESTRATÉGICA**

1.1 **Onde Estamos (Diagnóstico)**
\`\`\`
FINANCEIRO:
- Faturamento:
- Margem:
- Crescimento:

MERCADO:
- Market share:
- Posicionamento:
- NPS:

OPERACIONAL:
- Eficiência:
- Capacidade:
- Qualidade:

PESSOAS:
- Headcount:
- eNPS:
- Turnover:
\`\`\`

1.2 **Análise SWOT**
| Forças | Fraquezas |
|--------|-----------|
| | |
| **Oportunidades** | **Ameaças** |
| | |

1.3 **Tendências e Cenários**
- Cenário otimista:
- Cenário base:
- Cenário pessimista:

**2. DIRECIONAMENTO ESTRATÉGICO**

2.1 **Visão (3-5 anos)**
{vision}

2.2 **Missão**
[proposta de missão]

2.3 **Valores**
1. [valor + comportamento]
2. [valor + comportamento]
3. [valor + comportamento]
4. [valor + comportamento]
5. [valor + comportamento]

2.4 **Posicionamento Estratégico**
[como a empresa quer ser vista]

**3. PRIORIDADES ESTRATÉGICAS**

3.1 **Apostas Estratégicas (Big Bets)**
| Aposta | Por que | Risco | Investimento |
|--------|---------|-------|--------------|
| 1. | | | |
| 2. | | | |
| 3. | | | |

3.2 **O que NÃO fazer (Estratégico)**
- Não vamos: [decisão 1]
- Não vamos: [decisão 2]
- Não vamos: [decisão 3]

**4. OKRs ANUAIS**

**OBJETIVO 1: [Descrição inspiradora]**
- **KR 1.1:** [métrica de X para Y até data]
- **KR 1.2:** [métrica de X para Y até data]
- **KR 1.3:** [métrica de X para Y até data]
- **Iniciativas:** [projetos que movem os KRs]

**OBJETIVO 2: [Descrição inspiradora]**
- **KR 2.1:** [métrica de X para Y até data]
- **KR 2.2:** [métrica de X para Y até data]
- **KR 2.3:** [métrica de X para Y até data]
- **Iniciativas:** [projetos que movem os KRs]

**OBJETIVO 3: [Descrição inspiradora]**
- **KR 3.1:** [métrica de X para Y até data]
- **KR 3.2:** [métrica de X para Y até data]
- **KR 3.3:** [métrica de X para Y até data]
- **Iniciativas:** [projetos que movem os KRs]

**OBJETIVO 4: [Descrição inspiradora]**
- **KR 4.1:** [métrica de X para Y até data]
- **KR 4.2:** [métrica de X para Y até data]
- **KR 4.3:** [métrica de X para Y até data]
- **Iniciativas:** [projetos que movem os KRs]

**5. OKRs POR ÁREA**

**5.1 Vendas/Comercial**
Objetivo: [...]
- KR 1:
- KR 2:
- KR 3:

**5.2 Marketing**
[...]

**5.3 Produto**
[...]

**5.4 Operações**
[...]

**5.5 Pessoas**
[...]

**5.6 Financeiro**
[...]

**6. CADÊNCIAS E RITUAIS**

6.1 **Revisão de OKRs**
| Ritual | Frequência | Participantes | Duração | Foco |
|--------|------------|---------------|---------|------|
| Check-in semanal | Semanal | Time | 30min | Status |
| Review mensal | Mensal | Lideranças | 2h | Progresso |
| Review trimestral | Trimestral | Empresa | 4h | Ajustes |
| Planning trimestral | Trimestral | Lideranças | 1 dia | Próximo Q |

6.2 **Formato de Check-in**
\`\`\`
OBJETIVO X:
Confiança: 🟢🟡🔴 (X/10)

KR 1: [status atual vs meta]
- Progresso: X%
- Tendência: ↑↓→
- Bloqueios:
- Próximas ações:

KR 2: [...]
\`\`\`

**7. METAS FINANCEIRAS**

7.1 **Budget Anual**
| | Q1 | Q2 | Q3 | Q4 | Total |
|--|----|----|----|----|-------|
| Receita | | | | | |
| Despesas | | | | | |
| EBITDA | | | | | |
| Investimentos | | | | | |

7.2 **KPIs Financeiros**
- Meta de receita:
- Meta de margem:
- Meta de caixa:

**8. ALOCAÇÃO DE RECURSOS**

8.1 **Budget por Área**
| Área | % do Budget | Prioridade | Objetivo |
|------|-------------|------------|----------|
[alocação]

8.2 **Headcount Plan**
| Área | Atual | Meta Q2 | Meta Q4 | Custo |
|------|-------|---------|---------|-------|
[plano de contratações]

**9. GESTÃO DE RISCOS**

| Risco | OKR Afetado | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------------|---------|-----------|
[mapeamento de riscos]

**10. COMUNICAÇÃO E ALINHAMENTO**

10.1 **Plano de Comunicação**
| Audiência | Mensagem-chave | Canal | Frequência |
|-----------|----------------|-------|------------|
| Empresa toda | OKRs e progresso | All Hands | Mensal |
| Lideranças | Decisões estratégicas | Comitê | Semanal |
| Investidores | Resultados | Board | Trimestral |

10.2 **Materiais de Alinhamento**
- One-pager estratégico
- Deck de OKRs
- Dashboard de acompanhamento

**11. CRONOGRAMA DE IMPLEMENTAÇÃO**

| Fase | Ações | Prazo | Responsável |
|------|-------|-------|-------------|
| Setup | Definir OKRs finais | [data] | CEO |
| Cascata | OKRs por área | [data] | VPs |
| Comunicação | All Hands | [data] | CEO |
| Execução | Início do ciclo | [data] | Todos |
| Review | Primeira revisão | [data] | VPs |`,
    variables: [
      { name: 'company', label: 'Nome da Empresa', placeholder: 'Ex: TechStartup LTDA', type: 'text', required: true },
      { name: 'vision', label: 'Visão de Longo Prazo', placeholder: 'Ex: Ser a maior plataforma de educação financeira do Brasil', type: 'textarea', required: true },
      { name: 'current_state', label: 'Situação Atual', placeholder: 'Ex: 10k clientes, R$ 500k MRR, time de 30 pessoas', type: 'textarea', required: true },
      { name: 'challenges', label: 'Principais Desafios', placeholder: 'Ex: Escalar vendas, reduzir churn, lançar novo produto', type: 'textarea', required: true },
      { name: 'period', label: 'Período do Planejamento', placeholder: 'Ex: 2024', type: 'text', required: true }
    ],
    examples: [],
    tags: ['okr', 'planejamento', 'estratégia', 'metas', 'gestão'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  }
];
