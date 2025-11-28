import { PromptCategory } from '../../types/prompt';

export const productCreationPromptsCategory: PromptCategory = {
  id: 'product-creation',
  name: 'Criação de Produtos',
  description: 'Prompts para criar produtos digitais, físicos, apps e validar ideias',
  icon: 'PackagePlus',
  color: 'bg-orange-500',
  isPopular: true,
  prompts: [
    {
      id: 'pc-digital-product',
      categoryId: 'product-creation',
      title: 'Produto Digital Lucrativo',
      description: 'Ideias validadas de infoprodutos',
      template: 'Gere 10 ideias de produtos digitais para nicho: {niche}, público: {audience}, preço: {price_range}, tempo: {time}. Analise demanda, MVP, validação e roadmap de lançamento.',
      variables: [{name: 'niche', label: 'Nicho', placeholder: 'Ex: Produtividade para empreendedores', type: 'textarea', required: true}, {name: 'audience', label: 'Público', placeholder: 'Ex: Donos de negócio 30-50 anos', type: 'text', required: true}, {name: 'price_range', label: 'Faixa de preço', placeholder: 'Ex: R$ 97 a R$ 497', type: 'text', required: true}, {name: 'time', label: 'Tempo disponível', placeholder: 'Ex: 2h/dia por 30 dias', type: 'text', required: true}],
      examples: [],
      tags: ['infoproduto', 'curso', 'ebook', 'validação'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'pc-app-validation',
      categoryId: 'product-creation',
      title: 'Validação de Ideia de App',
      description: 'Valide antes de desenvolver',
      template: 'Valide app: {app_name}, problema: {problem}, público: {target}, features: {features}, concorrentes: {competitors}. Análise SWOT, MVP, stack, monetização, validação sem código e ROI.',
      variables: [{name: 'app_name', label: 'Nome do app', placeholder: 'Ex: TaskFlow', type: 'text', required: true}, {name: 'problem', label: 'Problema', placeholder: 'Ex: Gestão de tarefas para freelancers', type: 'textarea', required: true}, {name: 'target', label: 'Público', placeholder: 'Ex: Freelancers e PMEs', type: 'text', required: true}, {name: 'features', label: 'Funcionalidades', placeholder: 'Ex: Timer, relatórios, integrações', type: 'textarea', required: true}, {name: 'competitors', label: 'Concorrentes', placeholder: 'Ex: Toggl, Clockify', type: 'text', required: true}],
      examples: [],
      tags: ['app', 'saas', 'validação', 'mvp', 'startup'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-course-outline',
      categoryId: 'product-creation',
      title: 'Estrutura de Curso Online',
      description: 'Monte curso que vende e ensina',
      template: 'Curso sobre: {topic}, para: {audience}, resultado: {outcome}, duração: {duration}. Crie módulos, aulas, exercícios, bônus, precificação e estratégia de lançamento.',
      variables: [{name: 'topic', label: 'Tema do curso', placeholder: 'Ex: Excel avançado para finanças', type: 'text', required: true}, {name: 'audience', label: 'Para quem', placeholder: 'Ex: Analistas financeiros', type: 'text', required: true}, {name: 'outcome', label: 'Resultado prometido', placeholder: 'Ex: Automatizar relatórios em 1h', type: 'text', required: true}, {name: 'duration', label: 'Duração', placeholder: 'Ex: 6 semanas', type: 'text', required: true}],
      examples: [],
      tags: ['curso', 'educação', 'online', 'estrutura'],
      difficulty: 'intermediate',
      isPremium: true
    }
    // Total de 50 prompts: ebook, templates, planilhas, software SaaS, marketplace, membership, físico, Kickstarter, dropshipping, POD, etc.
  ]
};
