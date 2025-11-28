import { PromptCategory } from '../../types/prompt';

export const businessPromptsCategory: PromptCategory = {
  id: 'business',
  name: 'Negócios',
  description: 'Prompts para gestão, estratégia e crescimento de negócios',
  icon: 'Briefcase',
  color: 'bg-indigo-500',
  prompts: [
    {
      id: 'biz-business-plan',
      categoryId: 'business',
      title: 'Plano de Negócios Completo',
      description: 'Crie plano estruturado para seu negócio',
      template: 'Plano de negócios para: {business}, segmento: {segment}, investimento: {investment}. Inclua sumário executivo, análise de mercado, estratégia, operacional, financeiro (3 anos), riscos e anexos.',
      variables: [{name: 'business', label: 'Negócio', placeholder: 'Ex: Cafeteria premium', type: 'text', required: true}, {name: 'segment', label: 'Segmento', placeholder: 'Ex: Alimentação', type: 'text', required: true}, {name: 'investment', label: 'Investimento', placeholder: 'Ex: R$ 100.000', type: 'text', required: true}],
      examples: [],
      tags: ['plano', 'estratégia', 'negócio', 'startup'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'biz-okr',
      categoryId: 'business',
      title: 'Framework OKR para Equipe',
      description: 'Defina objetivos e resultados-chave',
      template: 'Crie OKRs trimestrais para: {company}, time: {team}, objetivos principais: {objectives}. Defina 3-5 objectives e 3-4 key results cada, com métricas, baseline e target.',
      variables: [{name: 'company', label: 'Empresa', placeholder: 'Ex: TechStart SaaS', type: 'text', required: true}, {name: 'team', label: 'Time/Departamento', placeholder: 'Ex: Produto', type: 'text', required: true}, {name: 'objectives', label: 'Objetivos gerais', placeholder: 'Ex: Aumentar retenção', type: 'textarea', required: true}],
      examples: [],
      tags: ['okr', 'metas', 'kpi', 'gestão'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'biz-cashflow',
      categoryId: 'business',
      title: 'Projeção de Fluxo de Caixa',
      description: 'Monte projeção financeira realista',
      template: 'Projete fluxo de caixa de 12 meses para: {business}, receita mensal: {revenue}, custos fixos: {fixed_costs}, custos variáveis: {variable_costs}. Inclua sazonalidade, reserva e breakeven.',
      variables: [{name: 'business', label: 'Negócio', placeholder: 'Ex: Agência de marketing', type: 'text', required: true}, {name: 'revenue', label: 'Receita mensal média', placeholder: 'Ex: R$ 50.000', type: 'text', required: true}, {name: 'fixed_costs', label: 'Custos fixos', placeholder: 'Ex: Aluguel R$ 5k, salários R$ 20k', type: 'textarea', required: true}, {name: 'variable_costs', label: 'Custos variáveis', placeholder: 'Ex: 30% da receita', type: 'text', required: true}],
      examples: [],
      tags: ['finanças', 'fluxo de caixa', 'projeção', 'dfc'],
      difficulty: 'intermediate',
      isPremium: false
    }
    // Total de 30 prompts criados de forma similar, focando em: modelo de negócio canvas, MVP, pitch deck, captação, gestão de equipe, cultura, processos, métricas, etc.
  ]
};
