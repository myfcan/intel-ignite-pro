import { PromptCategory } from '../../types/prompt';

export const businessPromptsCategory: PromptCategory = {
  id: 'business',
  name: 'Negócios Online',
  description: 'Prompts para validar ideias, criar MVPs e estratégias de negócio',
  icon: 'Briefcase',
  color: 'bg-indigo-500',
  prompts: [
    {
      id: 'business-idea-validation',
      categoryId: 'business',
      title: 'Validação de Ideia de Negócio',
      description: 'Analise viabilidade da sua ideia com framework estruturado',
      template: `Analise a viabilidade desta ideia de negócio:

Ideia: {idea}
Público-alvo: {target_audience}
Modelo de monetização: {monetization}

**Análise completa:**

1. **Problema/Dor**
   - Qual problema resolve?
   - Quão intensa é essa dor? (1-10)
   - Frequência do problema
   - Soluções existentes (concorrentes)

2. **Proposta de Valor Única**
   - Por que é melhor que alternativas?
   - Vantagem competitiva sustentável?

3. **Mercado (TAM/SAM/SOM)**
   - Tamanho do mercado total
   - Mercado acessível
   - Mercado realista no ano 1

4. **Modelo de Negócio**
   - Como ganha dinheiro?
   - LTV estimado
   - CAC estimado
   - Margem esperada

5. **Viabilidade de MVP**
   - MVP mínimo necessário
   - Custo estimado (tempo/dinheiro)
   - Métricas de validação

6. **Riscos**
   - Top 3 riscos
   - Como mitigar cada um

7. **Veredicto**
   - Score de 0-100
   - Recomendação: Prosseguir/Pivotar/Descartar
   - Próximos passos específicos

**Faça perguntas difíceis** que empreendedor precisa responder.`,
      variables: [
        {
          name: 'idea',
          label: 'Descrição da ideia',
          placeholder: 'Ex: App que conecta diaristas a clientes via IA',
          type: 'textarea',
          required: true
        },
        {
          name: 'target_audience',
          label: 'Público-alvo',
          placeholder: 'Ex: Mulheres 25-45 anos, classe B, grandes cidades',
          type: 'textarea',
          required: true
        },
        {
          name: 'monetization',
          label: 'Como pretende ganhar dinheiro',
          placeholder: 'Ex: Comissão de 15% por agendamento',
          type: 'textarea',
          required: true
        }
      ],
      examples: [],
      tags: ['validação', 'startup', 'mvp', 'negócio'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true,
      usageCount: 1543
    },
    {
      id: 'business-pitch-deck',
      categoryId: 'business',
      title: 'Estrutura de Pitch Deck',
      description: 'Monte apresentação para investidores',
      template: `Crie estrutura de pitch deck para:

Startup: {startup_name}
Problema: {problem}
Solução: {solution}
Tração atual: {traction}
Meta de investimento: {funding_goal}

**10-12 SLIDES:**

1. **Capa**
   - Nome, tagline, logo
   - Contato

2. **Problema** (⭐ Mais importante)
   - 3 dores específicas
   - Quantificar o problema
   - História/exemplo real

3. **Solução**
   - Como resolve cada dor
   - Demo/screenshot
   - Magic moment

4. **Porquê Agora?**
   - Timing de mercado
   - Tendências favoráveis

5. **Tamanho de Mercado**
   - TAM/SAM/SOM
   - Bottom-up calculation

6. **Produto**
   - Como funciona
   - Diferencial tecnológico

7. **Tração**
   - Números de crescimento
   - Gráfico hockey stick
   - Depoimentos

8. **Modelo de Negócio**
   - Como ganha dinheiro
   - Unit economics
   - Projeção de receita

9. **Concorrência**
   - Matriz de posicionamento
   - Por que vamos vencer

10. **Time**
    - Founders + key hires
    - Por que esse time vai executar

11. **Financeiro**
    - Uso do capital
    - Runway
    - Milestones

12. **Ask**
    - Quanto quer captar
    - Valuation/equity
    - Próximos passos

Texto para cada slide + notas de apresentação.`,
      variables: [
        {
          name: 'startup_name',
          label: 'Nome da startup',
          placeholder: 'Ex: FastFood AI',
          type: 'text',
          required: true
        },
        {
          name: 'problem',
          label: 'Problema principal',
          placeholder: 'Ex: Restaurantes perdem 30% em pedidos errados',
          type: 'textarea',
          required: true
        },
        {
          name: 'solution',
          label: 'Solução',
          placeholder: 'Ex: IA que automatiza pedidos com 99% precisão',
          type: 'textarea',
          required: true
        },
        {
          name: 'traction',
          label: 'Tração atual',
          placeholder: 'Ex: 50 restaurantes, R$ 100k MRR',
          type: 'text',
          required: true
        },
        {
          name: 'funding_goal',
          label: 'Meta de investimento',
          placeholder: 'Ex: R$ 2 milhões',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['pitch', 'investidor', 'startup', 'fundraising'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 892
    },
    {
      id: 'business-swot',
      categoryId: 'business',
      title: 'Análise SWOT Detalhada',
      description: 'Análise estratégica completa do negócio',
      template: `Faça análise SWOT completa para:

Negócio: {business}
Contexto/Mercado: {market_context}
Objetivo: {goal}

**SWOT ANALYSIS:**

**FORÇAS (Strengths) - Fatores internos positivos**
Liste 5-7 forças:
- Cada força específica e mensurável
- Por que é uma vantagem real
- Como capitalizar

**FRAQUEZAS (Weaknesses) - Fatores internos negativos**
Liste 5-7 fraquezas:
- Seja honesto e específico
- Impacto de cada fraqueza
- Plano de mitigação

**OPORTUNIDADES (Opportunities) - Fatores externos positivos**
Liste 5-7 oportunidades:
- Tendências de mercado
- Mudanças tecnológicas/sociais
- Como aproveitar cada uma

**AMEAÇAS (Threats) - Fatores externos negativos**
Liste 5-7 ameaças:
- Concorrência
- Mudanças regulatórias
- Riscos de mercado
- Plano de contingência

**ESTRATÉGIAS RESULTANTES:**
1. **SO** (Strengths + Opportunities): Como usar forças para aproveitar oportunidades
2. **WO** (Weaknesses + Opportunities): Como superar fraquezas para capturar oportunidades
3. **ST** (Strengths + Threats): Como usar forças para reduzir ameaças
4. **WT** (Weaknesses + Threats): Como minimizar fraquezas e evitar ameaças

**Priorização:** Top 3 ações imediatas.`,
      variables: [
        {
          name: 'business',
          label: 'Nome/Descrição do negócio',
          placeholder: 'Ex: E-commerce de produtos sustentáveis',
          type: 'text',
          required: true
        },
        {
          name: 'market_context',
          label: 'Contexto de mercado',
          placeholder: 'Ex: Mercado brasileiro, crescimento 15% aa',
          type: 'textarea',
          required: true
        },
        {
          name: 'goal',
          label: 'Objetivo da análise',
          placeholder: 'Ex: Planejar expansão para novos estados',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['swot', 'estratégia', 'análise', 'planejamento'],
      difficulty: 'intermediate',
      isPremium: false,
      usageCount: 1176
    }
  ]
};
