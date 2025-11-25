import { PromptCategory } from '../../types/prompt';

export const dailyLifePromptsCategory: PromptCategory = {
  id: 'daily-life',
  name: 'Dia a Dia',
  description: 'Prompts práticos para tarefas cotidianas e uso pessoal',
  icon: 'Home',
  color: 'bg-orange-500',
  prompts: [
    {
      id: 'meal-plan-weekly',
      categoryId: 'daily-life',
      title: 'Planejamento Semanal de Refeições',
      description: 'Crie um plano de refeições balanceado para a semana',
      template: `Crie plano de refeições para {days} dias considerando:

Restrições alimentares: {restrictions}
Orçamento: {budget}
Tempo de preparo: {prep_time}

Inclua:
1. Café da manhã, almoço, jantar e lanches
2. Lista de compras organizada por seção
3. Dicas de meal prep
4. Estimativa de custos
5. Informação nutricional básica`,
      variables: [
        { name: 'days', label: 'Quantos dias', placeholder: 'Ex: 7', type: 'text', required: true },
        { name: 'restrictions', label: 'Restrições', placeholder: 'Ex: Vegetariano, sem lactose', type: 'text', required: false },
        { name: 'budget', label: 'Orçamento semanal', placeholder: 'Ex: R$300', type: 'text', required: true },
        { name: 'prep_time', label: 'Tempo disponível', placeholder: 'Ex: 30 min/refeição', type: 'text', required: true }
      ],
      examples: [{
        title: 'Família de 4 pessoas',
        input: { days: '7', restrictions: 'Sem glúten', budget: 'R$500', prep_time: '45 min' },
        output: 'Segunda:\nCafé: Tapioca com queijo\nAlmoço: Frango grelhado com arroz integral...'
      }],
      tags: ['alimentação', 'saúde', 'organização', 'família'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'travel-itinerary',
      categoryId: 'daily-life',
      title: 'Roteiro de Viagem Personalizado',
      description: 'Monte um roteiro detalhado de viagem',
      template: `Crie roteiro de viagem para {destination} por {duration} dias:

Estilo de viagem: {style}
Orçamento total: {budget}
Interesses: {interests}

Inclua:
1. Roteiro dia a dia com horários
2. Pontos turísticos + restaurantes + hospedagem
3. Custos estimados
4. Dicas de transporte
5. O que levar na mala`,
      variables: [
        { name: 'destination', label: 'Destino', placeholder: 'Ex: Paris', type: 'text', required: true },
        { name: 'duration', label: 'Duração (dias)', placeholder: 'Ex: 5', type: 'text', required: true },
        { name: 'style', label: 'Estilo', placeholder: 'Econômico/Conforto/Luxo', type: 'select', options: ['Econômico', 'Conforto', 'Luxo'], required: true },
        { name: 'budget', label: 'Orçamento', placeholder: 'Ex: R$5000', type: 'text', required: true },
        { name: 'interests', label: 'Interesses', placeholder: 'Ex: Arte, gastronomia', type: 'text', required: false }
      ],
      examples: [{
        title: 'Trip para Roma',
        input: { destination: 'Roma', duration: '4', style: 'Conforto', budget: 'R$8000', interests: 'História e gastronomia' },
        output: 'Dia 1:\n9h: Coliseu (€16)\n13h: Almoço na Trastevere...'
      }],
      tags: ['viagem', 'turismo', 'planejamento', 'férias'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'home-organization',
      categoryId: 'daily-life',
      title: 'Plano de Organização Residencial',
      description: 'Organize sua casa de forma eficiente',
      template: `Crie plano de organização para {space} em {timeframe}:

Objetivo: {goal}
Orçamento para organização: {budget}

Forneça:
1. Checklist de organização por cômodo
2. Cronograma realista
3. Lista de itens necessários (caixas, etiquetas, etc)
4. Técnicas de descarte (Marie Kondo)
5. Sistema de manutenção`,
      variables: [
        { name: 'space', label: 'Espaço', placeholder: 'Ex: Casa toda, só quarto', type: 'text', required: true },
        { name: 'timeframe', label: 'Prazo', placeholder: 'Ex: 1 fim de semana', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo principal', placeholder: 'Ex: Minimalismo, mais espaço', type: 'text', required: true },
        { name: 'budget', label: 'Orçamento', placeholder: 'Ex: R$200', type: 'text', required: false }
      ],
      examples: [{
        title: 'Organização de quarto',
        input: { space: 'Quarto casal', timeframe: '1 sábado', goal: 'Criar mais espaço no armário', budget: 'R$150' },
        output: 'Manhã:\n- Esvaziar armário completamente\n- Separar roupas (manter/doar/descartar)...'
      }],
      tags: ['organização', 'casa', 'minimalismo', 'produtividade'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'personal-budget',
      categoryId: 'daily-life',
      title: 'Orçamento Pessoal Mensal',
      description: 'Organize suas finanças pessoais',
      template: `Crie orçamento mensal para renda de {income}:

Despesas fixas: {fixed_expenses}
Objetivos financeiros: {goals}
Pessoas dependentes: {dependents}

Estruture:
1. Categorias de gastos (50/30/20 ou personalizado)
2. Metas de economia
3. Cortes possíveis
4. Investimentos sugeridos
5. Plano de emergência`,
      variables: [
        { name: 'income', label: 'Renda mensal', placeholder: 'Ex: R$5000', type: 'text', required: true },
        { name: 'fixed_expenses', label: 'Despesas fixas', placeholder: 'Ex: R$2500 (aluguel, contas)', type: 'text', required: true },
        { name: 'goals', label: 'Objetivos', placeholder: 'Ex: Comprar carro, viagem', type: 'text', required: false },
        { name: 'dependents', label: 'Dependentes', placeholder: 'Ex: 2 filhos', type: 'text', required: false }
      ],
      examples: [{
        title: 'Profissional solteiro',
        input: { income: 'R$7000', fixed_expenses: 'R$3000', goals: 'Emergência e investir', dependents: '0' },
        output: 'Necessidades (50%): R$3500\nDesejos (30%): R$2100\nEconomia (20%): R$1400'
      }],
      tags: ['finanças', 'dinheiro', 'orçamento', 'economia'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'fitness-plan',
      categoryId: 'daily-life',
      title: 'Plano de Treino Personalizado',
      description: 'Monte um plano de exercícios para seus objetivos',
      template: `Crie plano de treino para {goal} com {availability} disponível:

Nível atual: {level}
Equipamentos: {equipment}
Restrições: {restrictions}

Forneça:
1. Treinos semanais detalhados
2. Séries, repetições e descanso
3. Progressão mensal
4. Dicas de nutrição básica
5. Como medir resultados`,
      variables: [
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Perder peso, ganhar massa', type: 'text', required: true },
        { name: 'availability', label: 'Disponibilidade', placeholder: 'Ex: 3x/semana, 45min', type: 'text', required: true },
        { name: 'level', label: 'Nível', placeholder: 'Iniciante/Intermediário/Avançado', type: 'select', options: ['Iniciante', 'Intermediário', 'Avançado'], required: true },
        { name: 'equipment', label: 'Equipamentos', placeholder: 'Ex: Academia completa, só peso corporal', type: 'text', required: true },
        { name: 'restrictions', label: 'Restrições', placeholder: 'Ex: Problema no joelho', type: 'text', required: false }
      ],
      examples: [{
        title: 'Emagrecimento em casa',
        input: { goal: 'Perder 8kg', availability: '4x/semana, 30min', level: 'Iniciante', equipment: 'Só peso corporal', restrictions: 'Nenhuma' },
        output: 'Segunda: HIIT 20min\nTerça: Descanso...'
      }],
      tags: ['fitness', 'saúde', 'treino', 'bem-estar'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'learning-schedule',
      categoryId: 'daily-life',
      title: 'Cronograma de Estudos',
      description: 'Organize seus estudos de forma eficaz',
      template: `Crie cronograma de estudos para {subject} em {timeframe}:

Tempo disponível: {availability}
Objetivo: {goal}
Nível atual: {current_level}

Estruture:
1. Divisão de tópicos por semana
2. Métodos de estudo (Pomodoro, revisão espaçada)
3. Materiais necessários
4. Marcos de progresso
5. Técnicas de memorização`,
      variables: [
        { name: 'subject', label: 'Matéria/assunto', placeholder: 'Ex: Python, Inglês, ENEM', type: 'text', required: true },
        { name: 'timeframe', label: 'Prazo', placeholder: 'Ex: 3 meses', type: 'text', required: true },
        { name: 'availability', label: 'Tempo disponível', placeholder: 'Ex: 2h/dia', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Certificação, fluência', type: 'text', required: true },
        { name: 'current_level', label: 'Nível atual', placeholder: 'Ex: Zero, básico', type: 'text', required: true }
      ],
      examples: [{
        title: 'Aprender violão',
        input: { subject: 'Violão', timeframe: '6 meses', availability: '30min/dia', goal: 'Tocar 10 músicas', current_level: 'Zero' },
        output: 'Mês 1: Acordes básicos (C, G, D, Am)\nMês 2: Ritmos simples...'
      }],
      tags: ['estudos', 'aprendizado', 'educação', 'desenvolvimento'],
      difficulty: 'beginner',
      isPremium: false
    }
  ]
};
