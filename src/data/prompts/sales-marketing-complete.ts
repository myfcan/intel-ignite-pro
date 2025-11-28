import { PromptCategory } from '../../types/prompt';

export const salesMarketingPromptsCategory: PromptCategory = {
  id: 'sales-marketing',
  name: 'Marketing e Vendas',
  description: 'Automação, qualificação, SDR, pipeline e métricas de vendas',
  icon: 'TrendingUp',
  color: 'bg-rose-500',
  isPopular: true,
  prompts: [
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
    }
    // Total de 30 prompts: lead scoring, qualificação, inbound, inside sales, account management, upsell, cross-sell, churn, métricas (CAC, LTV, etc), comissionamento, etc.
  ]
};
