import { PromptCategory } from '../../types/prompt';

export const businessPromptsCategory: PromptCategory = {
  id: 'business',
  name: 'Negócios',
  description: 'Prompts para gestão, estratégia e crescimento de negócios',
  icon: 'Briefcase',
  color: 'bg-indigo-500',
  prompts: [
    {
      id: 'business-plan-complete',
      categoryId: 'business',
      title: 'Plano de Negócios Completo',
      description: 'Crie plano de negócios estruturado e detalhado',
      template: `Crie plano de negócios completo para:

Negócio: {business_name}
Segmento: {segment}
Investimento inicial: {initial_investment}
Horizonte: {timeframe}

**SUMÁRIO EXECUTIVO**
- Descrição do negócio
- Missão e visão
- Proposta de valor
- Principais números/projeções
- Investimento necessário

**1. DESCRIÇÃO DO NEGÓCIO**
- Histórico/motivação
- Produtos/serviços detalhados
- Modelo de negócio
- Localização/estrutura

**2. ANÁLISE DE MERCADO**
- Tamanho do mercado (TAM/SAM/SOM)
- Tendências
- Regulamentações
- Barreiras de entrada

**3. ANÁLISE COMPETITIVA**
- Principais concorrentes (5W2H)
- Matriz de posicionamento
- Vantagens competitivas
- Estratégia de diferenciação

**4. PÚBLICO-ALVO**
- Personas detalhadas (3-5)
- Dores e necessidades
- Jornada de compra
- Tamanho de cada segmento

**5. ESTRATÉGIA DE MARKETING**
- Posicionamento
- Canais de aquisição
- Estratégia de precificação
- Projeção de CAC e LTV

**6. PLANO OPERACIONAL**
- Processos principais
- Fornecedores
- Infraestrutura necessária
- Tecnologia/ferramentas

**7. ESTRUTURA ORGANIZACIONAL**
- Organograma
- Cargos e funções
- Plano de contratação
- Cultura organizacional

**8. PROJEÇÃO FINANCEIRA** (3 anos)

Ano 1:
- Receita mês a mês
- Custos fixos e variáveis
- Ponto de equilíbrio
- Fluxo de caixa

Ano 2-3:
- Projeções anuais
- Plano de crescimento
- ROI esperado

**9. ANÁLISE DE RISCOS**
- Principais riscos (5-10)
- Impacto e probabilidade
- Planos de mitigação

**10. ANEXOS**
- Pesquisas de mercado
- Contratos
- Documentação legal`,
      variables: [
        {
          name: 'business_name',
          label: 'Nome do negócio',
          placeholder: 'Ex: Academia Fit Express',
          type: 'text',
          required: true
        },
        {
          name: 'segment',
          label: 'Segmento/Setor',
          placeholder: 'Ex: Fitness e bem-estar',
          type: 'text',
          required: true
        },
        {
          name: 'initial_investment',
          label: 'Investimento inicial',
          placeholder: 'Ex: R$ 150.000',
          type: 'text',
          required: true
        },
        {
          name: 'timeframe',
          label: 'Horizonte de planejamento',
          placeholder: 'Ex: 3 anos',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['plano de negócios', 'estratégia', 'planejamento', 'empresa'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true,
      usageCount: 0
    }
    // ... mais 29 prompts de negócios serão adicionados
  ]
};
