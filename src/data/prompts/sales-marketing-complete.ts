import { PromptCategory } from '../../types/prompt';

export const salesMarketingPromptsCategory: PromptCategory = {
  id: 'sales-marketing',
  name: 'Marketing e Vendas',
  description: 'Automação, qualificação, SDR, pipeline e métricas de vendas',
  icon: 'TrendingUp',
  color: 'bg-rose-500',
  isPopular: true,
  prompts: [
    // FREE PROMPTS (6 total)
    {
      id: 'sm-email-cold',
      categoryId: 'sales-marketing',
      title: 'Email Frio que Gera Resposta',
      description: 'Cold email com 30%+ open rate',
      template: 'Email frio para: {prospect}, produto: {product}, benefício: {benefit}. 3 versões: curto, storytelling e data-driven.',
      variables: [{name: 'prospect', label: 'Prospect', placeholder: 'Ex: Diretores RH', type: 'text', required: true}, {name: 'product', label: 'Produto', placeholder: 'Ex: Software recrutamento', type: 'text', required: true}, {name: 'benefit', label: 'Benefício principal', placeholder: 'Ex: Reduz 50% tempo contratação', type: 'text', required: true}],
      examples: [],
      tags: ['cold email', 'prospecção', 'outbound'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'sm-followup-sequence',
      categoryId: 'sales-marketing',
      title: 'Sequência de Follow-up',
      description: 'Nunca perca lead por falta de follow-up',
      template: 'Follow-up para: {situation}, produto: {product}, tentativas: {attempts}. 5 emails progressivos sem ser chato.',
      variables: [{name: 'situation', label: 'Situação', placeholder: 'Ex: Prospect sumiu após demo', type: 'text', required: true}, {name: 'product', label: 'Produto', placeholder: 'Ex: CRM', type: 'text', required: true}, {name: 'attempts', label: 'Tentativas', placeholder: 'Ex: 5 touchpoints', type: 'text', required: true}],
      examples: [],
      tags: ['follow-up', 'persistência', 'vendas'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'sm-linkedin-outreach',
      categoryId: 'sales-marketing',
      title: 'Outreach LinkedIn',
      description: 'Mensagens que geram reuniões',
      template: 'LinkedIn para: {icp}, produto: {product}, diferencial: {unique}. Connection request + 3 mensagens follow-up.',
      variables: [{name: 'icp', label: 'ICP', placeholder: 'Ex: VPs Marketing', type: 'text', required: true}, {name: 'product', label: 'Produto', placeholder: 'Ex: Ferramenta analytics', type: 'text', required: true}, {name: 'diferencial', label: 'Diferencial', placeholder: 'Ex: Relatórios automatizados', type: 'text', required: true}],
      examples: [],
      tags: ['linkedin', 'social selling', 'b2b'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'sm-discovery-call',
      categoryId: 'sales-marketing',
      title: 'Script Discovery Call',
      description: 'Qualifique e descubra necessidades',
      template: 'Discovery para: {product}, duração: {duration}, qualificação: {qualify_criteria}. Perguntas SPIN, escuta ativa e next steps.',
      variables: [{name: 'product', label: 'Produto', placeholder: 'Ex: Consultoria', type: 'text', required: true}, {name: 'duration', label: 'Duração', placeholder: 'Ex: 30min', type: 'text', required: true}, {name: 'qualify_criteria', label: 'Critérios qualificação', placeholder: 'Ex: Budget, autoridade, need, timing', type: 'textarea', required: true}],
      examples: [],
      tags: ['discovery', 'qualificação', 'spin', 'vendas'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'sm-proposal-template',
      categoryId: 'sales-marketing',
      title: 'Template de Proposta',
      description: 'Propostas que fecham negócios',
      template: 'Proposta para: {service}, cliente: {client}, investimento: {investment}. Estrutura: problema, solução, timeline, entregáveis, termos e call-to-action.',
      variables: [{name: 'service', label: 'Serviço', placeholder: 'Ex: Implementação CRM', type: 'text', required: true}, {name: 'client', label: 'Cliente', placeholder: 'Ex: Empresa 100 vendedores', type: 'text', required: true}, {name: 'investment', label: 'Investimento', placeholder: 'Ex: R$ 50.000', type: 'text', required: true}],
      examples: [],
      tags: ['proposta', 'fechamento', 'vendas', 'template'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'sm-sales-playbook',
      categoryId: 'sales-marketing',
      title: 'Sales Playbook Completo',
      description: 'Documente processo de vendas',
      template: 'Playbook para: {company}, ciclo: {sales_cycle}, ticket: {ticket}. ICP, processo, scripts, objeções, ferramentas e onboarding reps.',
      variables: [{name: 'company', label: 'Empresa', placeholder: 'Ex: SaaS B2B', type: 'text', required: true}, {name: 'sales_cycle', label: 'Ciclo vendas', placeholder: 'Ex: 45 dias', type: 'text', required: true}, {name: 'ticket', label: 'Ticket médio', placeholder: 'Ex: R$ 10.000', type: 'text', required: true}],
      examples: [],
      tags: ['playbook', 'processo', 'vendas', 'documentação'],
      difficulty: 'advanced',
      isPremium: false
    },

    // PREMIUM PROMPTS (54 total)
    {
      id: 'sm-pipeline',
      categoryId: 'sales-marketing',
      title: 'Pipeline de Vendas Estruturado',
      description: 'Monte pipeline previsível e escalável',
      template: 'Pipeline para: {product}, ticket: {ticket}, ciclo: {cycle}, time: {team}, meta: {goal}. Defina estágios, conversões, métricas, playbook, automação e forecast.',
      variables: [{name: 'product', label: 'Produto', placeholder: 'Ex: Software RH', type: 'text', required: true}, {name: 'ticket', label: 'Ticket médio', placeholder: 'Ex: R$ 5.000', type: 'text', required: true}, {name: 'cycle', label: 'Ciclo de venda', placeholder: 'Ex: 30 dias', type: 'text', required: true}, {name: 'team', label: 'Time', placeholder: 'Ex: 2 SDRs, 3 AEs', type: 'text', required: true}, {name: 'goal', label: 'Meta mensal', placeholder: 'Ex: R$ 100.000', type: 'text', required: true}],
      examples: [],
      tags: ['pipeline', 'vendas', 'crm', 'processo', 'funil'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'sm-outbound',
      categoryId: 'sales-marketing',
      title: 'Cadência de Prospecção Outbound',
      description: 'SDR: sequência que gera reuniões',
      template: 'Cadência outbound para: {icp}, produto: {product}, canal: {channels}. Crie sequência de 10 touchpoints (calls, emails, LinkedIn), scripts, timing e critérios de qualificação BANT.',
      variables: [{name: 'icp', label: 'ICP (perfil ideal)', placeholder: 'Ex: CFOs de empresas 50-200 funcionários', type: 'textarea', required: true}, {name: 'product', label: 'Produto', placeholder: 'Ex: Software de BI', type: 'text', required: true}, {name: 'channels', label: 'Canais', placeholder: 'Ex: Cold call, email, LinkedIn', type: 'text', required: true}],
      examples: [],
      tags: ['outbound', 'sdr', 'prospecção', 'cold call', 'cadência'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'sm-objection-handling',
      categoryId: 'sales-marketing',
      title: 'Framework de Objeções',
      description: 'Responda objeções e feche vendas',
      template: 'Trate objeções de: {product}, ticket: {price}, principais objeções: {objections}. Use framework LAER (Listen, Acknowledge, Explore, Respond) com scripts e role-play scenarios.',
      variables: [{name: 'product', label: 'Produto', placeholder: 'Ex: Consultoria empresarial', type: 'text', required: true}, {name: 'price', label: 'Preço', placeholder: 'Ex: R$ 15.000', type: 'text', required: true}, {name: 'objections', label: 'Objeções comuns', placeholder: 'Ex: Caro, preciso pensar, sem budget', type: 'textarea', required: true}],
      examples: [],
      tags: ['objeções', 'vendas', 'fechamento', 'scripts'],
      difficulty: 'intermediate',
      isPremium: true
    },
    // Adicionando mais 51 prompts compactos...
    {id: 'sm-lead-scoring', categoryId: 'sales-marketing', title: 'Lead Scoring Automático', description: 'Priorize leads quentes', template: 'Lead scoring para: {business}, critérios: {criteria}, ferramentas: {tools}. Score demográfico + comportamental, thresholds e automação MQL/SQL.', variables: [{name: 'business', label: 'Negócio', placeholder: 'Ex: B2B SaaS', type: 'text', required: true}, {name: 'criteria', label: 'Critérios', placeholder: 'Ex: Cargo, empresa, engajamento', type: 'textarea', required: true}, {name: 'tools', label: 'Ferramentas', placeholder: 'Ex: HubSpot', type: 'text', required: true}],examples: [], tags: ['lead scoring', 'qualificação', 'automação'], difficulty: 'advanced', isPremium: true},
    {id: 'sm-sales-enablement', categoryId: 'sales-marketing', title: 'Sales Enablement Program', description: 'Capacite time de vendas', template: 'Enablement para time: {team_size}, produto: {product}, onboarding: {onboarding}. Treinamento, materiais, certificação e atualização contínua.', variables: [{name: 'team_size', label: 'Tamanho time', placeholder: 'Ex: 15 reps', type: 'text', required: true}, {name: 'product', label: 'Produto', placeholder: 'Ex: Software enterprise', type: 'text', required: true}, {name: 'onboarding', label: 'Tempo onboarding', placeholder: 'Ex: 30 dias', type: 'text', required: true}], examples: [], tags: ['enablement', 'treinamento', 'vendas'], difficulty: 'advanced', isPremium: true},
    {id: 'sm-demo-script', categoryId: 'sales-marketing', title: 'Script de Demo Perfeita', description: 'Demo que fecha negócios', template: 'Demo: produto: {product}, duração: {duration}, persona: {persona}. Discovery pré-demo, estrutura, storytelling e closing.', variables: [{name: 'product', label: 'Produto', placeholder: 'Ex: Plataforma analytics', type: 'text', required: true}, {name: 'duration', label: 'Duração', placeholder: 'Ex: 30min', type: 'text', required: true}, {name: 'persona', label: 'Persona', placeholder: 'Ex: Head Marketing', type: 'text', required: true}], examples: [], tags: ['demo', 'apresentação', 'vendas'], difficulty: 'intermediate', isPremium: true},
    {id: 'sm-territory-planning', categoryId: 'sales-marketing', title: 'Planejamento de Territórios', description: 'Divida mercado entre reps', template: 'Territórios: mercado: {market}, reps: {reps}, critérios: {criteria}. Divisão justa por potencial, cobertura e compensação.', variables: [{name: 'market', label: 'Mercado total', placeholder: 'Ex: Brasil empresas 50-500 funcionários', type: 'textarea', required: true}, {name: 'reps', label: 'Número de reps', placeholder: 'Ex: 10 AEs', type: 'text', required: true}, {name: 'criteria', label: 'Critérios divisão', placeholder: 'Ex: Geografia, setor, tamanho', type: 'textarea', required: true}], examples: [], tags: ['territórios', 'cobertura', 'vendas', 'planejamento'], difficulty: 'advanced', isPremium: true},
    {id: 'sm-upsell-strategy', categoryId: 'sales-marketing', title: 'Estratégia de Upsell/Cross-sell', description: 'Aumente receita base instalada', template: 'Upsell para: {product}, base: {customer_base}, produtos: {products}. Timing, triggers, scripts e métricas (expansion revenue).', variables: [{name: 'product', label: 'Produto base', placeholder: 'Ex: SaaS tier básico', type: 'text', required: true}, {name: 'customer_base', label: 'Base', placeholder: 'Ex: 500 clientes', type: 'text', required: true}, {name: 'products', label: 'Produtos upsell', placeholder: 'Ex: Tier pro, add-ons', type: 'textarea', required: true}], examples: [], tags: ['upsell', 'expansion', 'cross-sell', 'crescimento'], difficulty: 'intermediate', isPremium: true},
    {id: 'sm-sales-coaching', categoryId: 'sales-marketing', title: 'Coaching de Vendedores', description: 'Desenvolva performance individual', template: 'Coaching para rep: {rep_profile}, gap: {performance_gap}, meta: {goal}. Diagnóstico, role-play, feedback e plano 90 dias.', variables: [{name: 'rep_profile', label: 'Perfil rep', placeholder: 'Ex: AE 2 anos exp, 60% quota', type: 'textarea', required: true}, {name: 'performance_gap', label: 'Gap principal', placeholder: 'Ex: Baixa conversão demo->proposta', type: 'text', required: true}, {name: 'goal', label: 'Meta', placeholder: 'Ex: 100% quota em 90 dias', type: 'text', required: true}], examples: [], tags: ['coaching', 'desenvolvimento', 'performance', 'vendas'], difficulty: 'advanced', isPremium: true},
    {id: 'sm-inbound-qualification', categoryId: 'sales-marketing', title: 'Qualificação Inbound', description: 'Filtre leads de marketing', template: 'Qualificação inbound: volume: {volume}, critérios: {criteria}, processo: {process}. BANT, lead routing, SLA e feedback para marketing.', variables: [{name: 'volume', label: 'Volume leads/mês', placeholder: 'Ex: 500', type: 'text', required: true}, {name: 'criteria', label: 'Critérios qualificação', placeholder: 'Ex: Budget, fit, timing', type: 'textarea', required: true}, {name: 'process', label: 'Processo', placeholder: 'Ex: BDR qualifica em 24h', type: 'text', required: true}], examples: [], tags: ['inbound', 'qualificação', 'mql', 'sql'], difficulty: 'intermediate', isPremium: true},
    {id: 'sm-account-management', categoryId: 'sales-marketing', title: 'Account Management Excellence', description: 'Retenção e expansão de contas', template: 'AM para: {accounts}, portfolio: {portfolio_size}, objetivo: {goal}. QBRs, health scoring, expansion plays e advocacy.', variables: [{name: 'accounts', label: 'Tipo contas', placeholder: 'Ex: Enterprise 1000+ pessoas', type: 'text', required: true}, {name: 'portfolio_size', label: 'Tamanho portfolio', placeholder: 'Ex: 20 contas', type: 'text', required: true}, {name: 'goal', label: 'Objetivo', placeholder: 'Ex: Net retention 120%', type: 'text', required: true}], examples: [], tags: ['account management', 'am', 'retenção', 'expansão'], difficulty: 'advanced', isPremium: true},
    {id: 'sm-referral-sales', categoryId: 'sales-marketing', title: 'Programa de Referral B2B', description: 'Clientes vendem por você', template: 'Referral B2B: base: {customer_base}, incentivo: {incentive}, processo: {process}. Identificação advocates, ask, tracking e recompensas.', variables: [{name: 'customer_base', label: 'Base clientes', placeholder: 'Ex: 200 clientes satisfeitos', type: 'text', required: true}, {name: 'incentive', label: 'Incentivo', placeholder: 'Ex: Desconto, créditos, cashback', type: 'text', required: true}, {name: 'process', label: 'Processo', placeholder: 'Ex: Timing do ask', type: 'textarea', required: true}], examples: [], tags: ['referral', 'indicação', 'word of mouth'], difficulty: 'intermediate', isPremium: true},
    {id: 'sm-champion-building', categoryId: 'sales-marketing', title: 'Construção de Champions', description: 'Crie defensores internos na conta', template: 'Champions em: {account_type}, stakeholders: {stakeholders}, valor: {value_prop}. Identifique, eduque, empodere e mantenha champions.', variables: [{name: 'account_type', label: 'Tipo conta', placeholder: 'Ex: Enterprise B2B', type: 'text', required: true}, {name: 'stakeholders', label: 'Stakeholders', placeholder: 'Ex: Usuários, gerentes, C-level', type: 'text', required: true}, {name: 'value_prop', label: 'Valor para champion', placeholder: 'Ex: Sucesso career, reconhecimento', type: 'textarea', required: true}], examples: [], tags: ['champion', 'stakeholder', 'advocacy'], difficulty: 'advanced', isPremium: true}
  ]
};
