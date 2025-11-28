import { PromptCategory } from '../../types/prompt';

export const personalFinancePromptsCategory: PromptCategory = {
  id: 'personal-finance',
  name: 'Organização Financeira Pessoal',
  description: 'Prompts para controle financeiro, investimentos e planejamento pessoal',
  icon: 'Wallet',
  color: 'bg-emerald-500',
  prompts: [
    {
      id: 'pf-budget-complete',
      categoryId: 'personal-finance',
      title: 'Orçamento Pessoal Completo',
      description: 'Monte seu orçamento usando regra 50/30/20',
      template: 'Orçamento para renda: {income}, família: {family}, gastos: {expenses}, dívidas: {debts}. Use 50/30/20, identifique cortes, crie reserva emergência e planeje objetivos.',
      variables: [{name: 'income', label: 'Renda líquida', placeholder: 'Ex: 6000', type: 'text', required: true}, {name: 'family', label: 'Família', placeholder: 'Ex: Casal + 2 filhos', type: 'text', required: true}, {name: 'expenses', label: 'Gastos principais', placeholder: 'Ex: Aluguel 2000, mercado 800', type: 'textarea', required: true}, {name: 'debts', label: 'Dívidas', placeholder: 'Ex: Cartão 5000 (10%am)', type: 'textarea', required: false}],
      examples: [],
      tags: ['orçamento', '50/30/20', 'planejamento', 'finanças'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'pf-debt-payoff',
      categoryId: 'personal-finance',
      title: 'Plano de Quitação de Dívidas',
      description: 'Quite dívidas com método snowball ou avalanche',
      template: 'Plano para quitar dívidas: {debts_list}, renda disponível: {available}, método: {method}. Priorize, calcule tempo de quitação, renegocie e evite novas dívidas.',
      variables: [{name: 'debts_list', label: 'Lista de dívidas', placeholder: 'Ex: Cartão A: 3k (15%am), Empréstimo: 10k (3%am)', type: 'textarea', required: true}, {name: 'available', label: 'Valor disponível/mês', placeholder: 'Ex: R$ 1.000', type: 'text', required: true}, {name: 'method', label: 'Método preferido', placeholder: 'Ex: Snowball ou Avalanche', type: 'select', options: ['Snowball (menor saldo)', 'Avalanche (maior juros)'], required: true}],
      examples: [],
      tags: ['dívidas', 'snowball', 'avalanche', 'quitação'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pf-investment-portfolio',
      categoryId: 'personal-finance',
      title: 'Carteira de Investimentos Balanceada',
      description: 'Monte carteira diversificada por perfil de risco',
      template: 'Carteira para: {amount}, perfil: {risk_profile}, prazo: {timeframe}, objetivo: {goal}. Aloque entre renda fixa, ações, FIIs, internacional, com produtos específicos e rebalanceamento.',
      variables: [{name: 'amount', label: 'Valor', placeholder: 'Ex: 50000', type: 'text', required: true}, {name: 'risk_profile', label: 'Perfil', placeholder: 'Conservador/Moderado/Arrojado', type: 'select', options: ['Conservador', 'Moderado', 'Arrojado'], required: true}, {name: 'timeframe', label: 'Prazo', placeholder: 'Ex: 10 anos', type: 'text', required: true}, {name: 'goal', label: 'Objetivo', placeholder: 'Ex: Aposentadoria', type: 'text', required: true}],
      examples: [],
      tags: ['investimentos', 'carteira', 'alocação', 'diversificação'],
      difficulty: 'intermediate',
      isPremium: true
    }
    // Total de 30 prompts: reserva emergência, aposentadoria, FIRE, renda passiva, declaração IR, planejamento sucessório, previdência, seguros, objetivos financeiros, etc.
  ]
};
