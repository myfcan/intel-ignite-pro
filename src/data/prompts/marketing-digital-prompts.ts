import { PromptCategory } from '../../types/prompt';

export const marketingDigitalPromptsCategory: PromptCategory = {
  id: 'marketing-digital',
  name: 'Marketing Digital',
  description: 'Prompts para estratégias de marketing digital, campanhas e growth',
  icon: 'Megaphone',
  color: 'bg-purple-500',
  prompts: [
    {
      id: 'md-strategy-complete',
      categoryId: 'marketing-digital',
      title: 'Estratégia de Marketing Digital Completa',
      description: 'Planeje estratégia de marketing digital do zero',
      template: `Crie estratégia completa de marketing digital para:

Empresa: {company}
Produto/Serviço: {product}
Público-alvo: {target_audience}
Orçamento mensal: {budget}
Objetivo principal: {goal}

**ESTRATÉGIA DIGITAL:**

1. **Análise Situacional**
   - Posicionamento atual
   - Concorrência online
   - Presença digital existente

2. **Objetivos SMART**
   - Específicos para cada canal
   - Métricas de sucesso
   - Timeline

3. **Mix de Canais**
   Para cada canal recomendado:
   - Por que esse canal
   - Investimento recomendado (% do budget)
   - Métricas esperadas
   - Conteúdo/estratégia

   Canais: SEO, Paid Ads, Social Media, Email, Content Marketing, Influencers

4. **Funil de Conversão**
   - Topo: Awareness
   - Meio: Consideração
   - Fundo: Conversão
   - Pós-venda: Retenção

5. **Plano de Conteúdo**
   - Pilares de conteúdo
   - Calendário editorial (3 meses)
   - Tipos de conteúdo por canal

6. **Ferramentas Necessárias**
   - Analytics
   - Automação
   - CRM
   - Design

7. **KPIs e Métricas**
   - Métricas por canal
   - Dashboard de acompanhamento
   - Frequência de análise

8. **Cronograma de Implementação**
   - Primeiro mês: Setup
   - Segundo mês: Teste
   - Terceiro mês: Escala`,
      variables: [
        {
          name: 'company',
          label: 'Nome da empresa',
          placeholder: 'Ex: TechFlow Solutions',
          type: 'text',
          required: true
        },
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Software de gestão financeira para PMEs',
          type: 'textarea',
          required: true
        },
        {
          name: 'target_audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Donos de empresas com 5-50 funcionários',
          type: 'textarea',
          required: true
        },
        {
          name: 'budget',
          label: 'Orçamento mensal',
          placeholder: 'Ex: R$ 10.000',
          type: 'text',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo principal',
          placeholder: 'Ex: Gerar 100 leads qualificados/mês',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['estratégia', 'marketing digital', 'planejamento', 'canais'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true,
      usageCount: 0
    },
    {
      id: 'md-landing-page',
      categoryId: 'marketing-digital',
      title: 'Copywriting para Landing Page de Alta Conversão',
      description: 'Crie textos persuasivos para landing pages',
      template: `Crie copy completo para landing page de:

Produto/Oferta: {offer}
Público-alvo: {audience}
Preço: {price}
Principal benefício: {main_benefit}
Urgência/Escassez: {urgency}

**ESTRUTURA DA LANDING PAGE:**

**1. ACIMA DA DOBRA**
- Headline impactante (usar fórmula: [Benefício] sem [Objeção])
- Subheadline (explicar como)
- CTA primário
- Elemento de prova social (número)

**2. PROBLEMA**
- 3-4 dores específicas
- Linguagem do público
- Agitação emocional

**3. SOLUÇÃO**
- Como seu produto resolve
- Headline da solução
- 3 principais benefícios

**4. COMO FUNCIONA**
- 3 passos simples
- Cada passo: ícone + título + descrição curta

**5. BENEFÍCIOS DETALHADOS**
- 5-7 benefícios
- Cada um: ícone + título + parágrafo
- Foco em transformação

**6. PROVA SOCIAL**
- 3 depoimentos detalhados
- Números e resultados
- Logos de empresas/clientes

**7. PREÇO E GARANTIA**
- Apresentação do preço
- Comparação com alternativas
- Garantia de satisfação
- Bônus inclusos

**8. FAQ**
- 5-7 objeções mais comuns
- Respostas que vendem

**9. CTA FINAL**
- Urgência
- Último empurrão
- Garantia repetida

**10. PS**
- Reforçar principal benefício
- Último CTA

Escreva todos os textos prontos para usar.`,
      variables: [
        {
          name: 'offer',
          label: 'Produto/Oferta',
          placeholder: 'Ex: Curso de Excel Avançado',
          type: 'textarea',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Profissionais que querem promoção',
          type: 'text',
          required: true
        },
        {
          name: 'price',
          label: 'Preço',
          placeholder: 'Ex: R$ 497',
          type: 'text',
          required: true
        },
        {
          name: 'main_benefit',
          label: 'Principal benefício',
          placeholder: 'Ex: Economizar 5h/semana em relatórios',
          type: 'text',
          required: true
        },
        {
          name: 'urgency',
          label: 'Urgência/Escassez',
          placeholder: 'Ex: Últimas 20 vagas',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['copywriting', 'landing page', 'conversão', 'vendas'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 0
    },
    {
      id: 'md-ads-facebook',
      categoryId: 'marketing-digital',
      title: 'Campanhas de Facebook Ads',
      description: 'Estruture campanhas lucrativas no Facebook',
      template: `Crie estrutura de campanha Facebook Ads para:

Produto: {product}
Objetivo: {objective}
Público: {audience}
Budget diário: {budget}
Prazo: {timeframe}

**ESTRUTURA DE CAMPANHA:**

**NÍVEL 1: CAMPANHA**
Nome: [objetivo]_[produto]_[mês]
Objetivo: {objetive}
Budget: {budget}/dia
CBO: Sim/Não (recomendar)

**NÍVEL 2: CONJUNTOS DE ANÚNCIOS** (3-5 testes)

Para cada conjunto:

1. **PÚBLICO FRIO - Interesse**
   - Interesses específicos
   - Tamanho: 500k-2M
   - Exclusões
   - Países/idiomas
   - Idade/gênero

2. **PÚBLICO FRIO - Lookalike**
   - LAL 1% clientes
   - LAL 1-2% engajados
   - LAL 1-3% site visitors

3. **PÚBLICO MORNO - Retargeting**
   - Visitantes do site (30 dias)
   - Engajamento no Instagram (30 dias)
   - Video views (30 dias)

4. **PÚBLICO QUENTE - Conversão**
   - Add to cart (30 dias)
   - Iniciou checkout (7 dias)

**Posicionamentos:**
- Feed + Stories (automatic) ou
- Manual (especificar)

**NÍVEL 3: ANÚNCIOS** (3-5 variações por conjunto)

Para cada anúncio:

**Criativos:**
1. Imagem/Vídeo A
2. Imagem/Vídeo B
3. Carrossel (se aplicável)

**Copy A:**
- Hook forte (primeira linha)
- Corpo (benefícios)
- CTA
- Emoji estratégico

**Copy B:**
- Hook diferente
- Storytelling
- CTA

**Copy C:**
- Depoimento/Prova social
- Resultado
- CTA

**Headlines:** 3 variações
**Descrições:** 2 variações

**MÉTRICAS E OTIMIZAÇÃO:**

Dia 1-3:
- CTR > 1.5%
- CPC < R$ X
- Desligar ads com CTR < 1%

Dia 4-7:
- CPA alvo: R$ X
- ROAS mínimo: X
- Escalar winners

**ESCALA:**
- Aumentar budget 20% ao dia
- Duplicar ad sets vencedores
- Testar novos públicos`,
      variables: [
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Curso online de fotografia',
          type: 'text',
          required: true
        },
        {
          name: 'objective',
          label: 'Objetivo da campanha',
          placeholder: 'Ex: Conversão - Vendas',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Descrição do público',
          placeholder: 'Ex: Fotógrafos iniciantes 25-45 anos',
          type: 'textarea',
          required: true
        },
        {
          name: 'budget',
          label: 'Budget diário',
          placeholder: 'Ex: R$ 300',
          type: 'text',
          required: true
        },
        {
          name: 'timeframe',
          label: 'Prazo da campanha',
          placeholder: 'Ex: 30 dias',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['facebook ads', 'tráfego pago', 'campanha', 'anúncios'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 0
    },
    {
      id: 'md-instagram-growth',
      categoryId: 'marketing-digital',
      title: 'Estratégia de Crescimento no Instagram',
      description: 'Cresça organicamente no Instagram',
      template: `Crie estratégia de crescimento Instagram para:

Nicho: {niche}
Público-alvo: {audience}
Seguidores atuais: {current_followers}
Meta de crescimento: {growth_goal}
Tempo disponível/dia: {time_available}

**ESTRATÉGIA DE CRESCIMENTO:**

**1. OTIMIZAÇÃO DO PERFIL**
- Nome de usuário otimizado
- Nome do perfil (palavras-chave)
- Bio persuasiva (150 caracteres)
- Link na bio (estratégia)
- Destaques estratégicos (5-7)

**2. ESTRATÉGIA DE CONTEÚDO**

**Pilares de Conteúdo** (3-4):
1. Educacional (40%)
2. Inspiracional (30%)
3. Vendas/Promocional (20%)
4. Pessoal/Bastidores (10%)

**Formatos:**
- Feed: Posts em carrossel (8-10 slides)
- Reels: [X] por semana
- Stories: [X] por dia
- Lives: [X] por mês

**3. CALENDÁRIO EDITORIAL** (7 dias)

Segunda:
- Feed: [tema]
- Reels: [tema]
- Stories: [rotina]

Terça:
[...]

**4. ESTRATÉGIA DE REELS** (maior alcance)

Tipos de Reels que funcionam:
1. Tutorial rápido (15-30s)
2. Antes/Depois
3. Trending audio + nicho
4. Dicas rápidas
5. Storytelling

Hooks para primeiros 3s:
- [5 exemplos]

Hashtags para Reels:
- [estratégia específica]

**5. ENGAJAMENTO E CRESCIMENTO**

Rotina diária (20-30 min):
- Responder todos comentários (10 min)
- Comentar em 30 contas do nicho (10 min)
- Mensagens DM (10 min)

**6. HASHTAGS**
- 5-10 hashtags pequenas (< 10k)
- 5-10 hashtags médias (10k-100k)
- 5-10 hashtags grandes (> 100k)

Lista específica para o nicho:
[criar lista]

**7. COLLABORATIONS**
- Perfis para parceria (tamanho similar)
- Estratégia de approach
- Tipos de collab (lives, shoutout, etc)

**8. MÉTRICAS**
Acompanhar semanalmente:
- Taxa de crescimento
- Reach (não followers)
- Salvamentos (mais importante)
- Compartilhamentos
- Tempo de visualização (Reels)

**9. CALLS TO ACTION**
- Stories: Box de perguntas, enquetes
- Feed: CTA claro em cada post
- Reels: Comment para [...]

**10. MONETIZAÇÃO**
Quando/como começar a vender:
[estratégia progressiva]`,
      variables: [
        {
          name: 'niche',
          label: 'Nicho/Tema',
          placeholder: 'Ex: Organização e produtividade',
          type: 'text',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Mulheres empreendedoras 25-40 anos',
          type: 'text',
          required: true
        },
        {
          name: 'current_followers',
          label: 'Seguidores atuais',
          placeholder: 'Ex: 2.000',
          type: 'text',
          required: true
        },
        {
          name: 'growth_goal',
          label: 'Meta de crescimento',
          placeholder: 'Ex: 10.000 em 6 meses',
          type: 'text',
          required: true
        },
        {
          name: 'time_available',
          label: 'Tempo disponível por dia',
          placeholder: 'Ex: 2 horas',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['instagram', 'crescimento orgânico', 'redes sociais', 'conteúdo'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 0
    },
    {
      id: 'md-email-sequence',
      categoryId: 'marketing-digital',
      title: 'Sequência de E-mails de Conversão',
      description: 'Crie sequência automatizada de e-mails',
      template: `Crie sequência de e-mail marketing para:

Produto: {product}
Preço: {price}
Lista: {list_type}
Duração da sequência: {duration}
Objetivo: {goal}

**SEQUÊNCIA DE [X] E-MAILS:**

**E-MAIL 1: BEM-VINDO / ENTREGA** (Day 0)
Assunto: [criar 3 opções]

Corpo:
- Agradecer
- Entregar o prometido (lead magnet)
- Apresentar-se brevemente
- Teaser do que vem
- CTA suave

**E-MAIL 2: HISTÓRIA / CONEXÃO** (Day 1)
Assunto: [criar 3 opções]

Corpo:
- Sua história relacionada ao problema
- Empatia profunda
- Como descobriu a solução
- Teaser do produto

**E-MAIL 3: PROBLEMA AGRAVADO** (Day 2)
Assunto: [criar 3 opções]

Corpo:
- Consequências de não resolver
- Custo da inação
- Mitos que atrapalham
- Esperança

**E-MAIL 4: SOLUÇÃO / PRODUTO** (Day 3)
Assunto: [criar 3 opções]

Corpo:
- Apresentar produto
- Como funciona
- Principais benefícios
- CTA forte
- Link de vendas

**E-MAIL 5: PROVA SOCIAL** (Day 4)
Assunto: [criar 3 opções]

Corpo:
- 2-3 case studies detalhados
- Resultados específicos
- Antes/depois
- CTA

**E-MAIL 6: OBJEÇÕES** (Day 5)
Assunto: [criar 3 opções]

Corpo:
- Top 3 objeções
- Responder cada uma
- Garantia
- Urgência começa

**E-MAIL 7: URGÊNCIA** (Day 6)
Assunto: [criar 3 opções]

Corpo:
- Bônus expirando
- Vagas limitadas
- O que perderá
- CTA urgente

**E-MAIL 8: ÚLTIMO AVISO** (Day 7)
Assunto: [criar 3 opções]

Corpo:
- Últimas horas
- Recapitular benefícios
- Perda vs ganho
- CTA final
- PS forte

**MÉTRICAS ESPERADAS:**
- Taxa de abertura: [X]%
- Taxa de clique: [X]%
- Taxa de conversão: [X]%

**SEGMENTAÇÃO:**
- Quem abriu mas não clicou: [tag]
- Quem clicou mas não comprou: [sequência de recuperação]
- Quem comprou: [sequência de onboarding]`,
      variables: [
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Planilha de controle financeiro',
          type: 'text',
          required: true
        },
        {
          name: 'price',
          label: 'Preço',
          placeholder: 'Ex: R$ 97',
          type: 'text',
          required: true
        },
        {
          name: 'list_type',
          label: 'Tipo de lista',
          placeholder: 'Ex: Baixaram e-book sobre economia',
          type: 'text',
          required: true
        },
        {
          name: 'duration',
          label: 'Duração',
          placeholder: 'Ex: 7 dias',
          type: 'text',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo',
          placeholder: 'Ex: Converter 5% da lista',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['email marketing', 'sequência', 'automação', 'conversão'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 0
    }
  ]
};
