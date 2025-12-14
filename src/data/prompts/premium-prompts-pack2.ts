import { Prompt } from '@/types/prompt';

// Helper to add examples field to all prompts
const addExamples = (prompts: Omit<Prompt, 'examples'>[]): Prompt[] => 
  prompts.map(p => ({ ...p, examples: [] }));

export const premiumPromptsPack2: Prompt[] = addExamples([
  // ==================== FINANÇAS PESSOAIS (25 prompts) ====================
  
  {
    id: 'fp-premium-001',
    categoryId: 'personal-finance',
    title: 'Plano Completo de Independência Financeira',
    description: 'Estratégia detalhada para alcançar independência financeira em 10-20 anos',
    template: `Crie um plano completo de independência financeira para:

Perfil: {profile}
Renda atual: {income}
Patrimônio atual: {assets}
Idade: {age}
Objetivo de renda passiva: {passive_income_goal}
Tolerância a risco: {risk_tolerance}

**PLANO DE INDEPENDÊNCIA FINANCEIRA:**

1. **Diagnóstico Atual**
   - Patrimônio líquido atual
   - Taxa de poupança atual
   - Análise de despesas
   - Score de saúde financeira

2. **Definição do Número FIRE**
   - Cálculo do patrimônio necessário
   - Regra dos 4% adaptada
   - Fatores de segurança
   - Cenários (conservador/moderado/otimista)

3. **Estratégia de Acumulação**
   - Meta de taxa de poupança
   - Alocação por classe de ativos
   - Rebalanceamento periódico
   - Aporte mensal recomendado

4. **Fontes de Renda Passiva**
   - Dividendos de ações
   - FIIs e renda imobiliária
   - Renda fixa e juros
   - Negócios passivos
   - Royalties e licenciamentos

5. **Otimização Fiscal**
   - Uso de PGBL/VGBL
   - Isenções e benefícios
   - Planejamento tributário
   - Estruturas eficientes

6. **Proteção Patrimonial**
   - Seguros necessários
   - Fundo de emergência robusto
   - Diversificação geográfica
   - Proteção contra inflação

7. **Marcos e Checkpoints**
   - Ano 1-3: Fundação
   - Ano 4-7: Aceleração
   - Ano 8-12: Consolidação
   - Ano 13+: Independência

8. **Plano de Transição**
   - Quando reduzir carga de trabalho
   - Teste de renda passiva
   - Atividades pós-FIRE
   - Legado e sucessão`,
    variables: [
      { name: 'profile', label: 'Perfil profissional', placeholder: 'ex: CLT, empresário, autônomo', type: 'text', required: true },
      { name: 'income', label: 'Renda mensal atual', placeholder: 'ex: R$ 15.000', type: 'text', required: true },
      { name: 'assets', label: 'Patrimônio atual', placeholder: 'ex: R$ 200.000', type: 'text', required: true },
      { name: 'age', label: 'Idade atual', placeholder: 'ex: 35 anos', type: 'text', required: true },
      { name: 'passive_income_goal', label: 'Meta de renda passiva', placeholder: 'ex: R$ 10.000/mês', type: 'text', required: true },
      { name: 'risk_tolerance', label: 'Tolerância a risco', placeholder: 'ex: moderada', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado', 'Agressivo'] }
    ],
    tags: ['FIRE', 'independência financeira', 'renda passiva', 'investimentos', 'aposentadoria'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-002',
    categoryId: 'personal-finance',
    title: 'Análise Completa de Carteira de Investimentos',
    description: 'Diagnóstico profundo e recomendações para otimização de carteira',
    template: `Faça uma análise completa da minha carteira de investimentos:

Composição atual: {portfolio}
Valor total: {total_value}
Perfil de investidor: {investor_profile}
Horizonte de investimento: {time_horizon}
Objetivos: {goals}

**ANÁLISE COMPLETA DA CARTEIRA:**

1. **Diagnóstico da Alocação Atual**
   - Distribuição por classe de ativos
   - Concentração de risco
   - Exposição setorial
   - Diversificação geográfica
   - Correlação entre ativos

2. **Análise de Performance**
   - Rentabilidade vs benchmarks
   - Volatilidade histórica
   - Sharpe ratio estimado
   - Drawdown máximo
   - Consistência de retornos

3. **Gaps e Vulnerabilidades**
   - Ativos sobreexpostos
   - Classes ausentes
   - Riscos não diversificados
   - Custos e taxas excessivas

4. **Recomendações de Ajuste**
   - Ativos para reduzir
   - Ativos para aumentar
   - Novos ativos sugeridos
   - Cronograma de rebalanceamento

5. **Alocação Ideal Proposta**
   - Renda fixa: % e produtos
   - Renda variável: % e estratégia
   - Fundos imobiliários: % e critérios
   - Internacional: % e veículos
   - Alternativos: % e opções

6. **Estratégia de Rebalanceamento**
   - Frequência recomendada
   - Bandas de tolerância
   - Considerações fiscais
   - Ordem de execução

7. **Proteções Recomendadas**
   - Hedge contra inflação
   - Proteção cambial
   - Reserva de oportunidade
   - Seguro de carteira

8. **Monitoramento Contínuo**
   - KPIs principais
   - Gatilhos de ação
   - Revisões periódicas
   - Ferramentas sugeridas`,
    variables: [
      { name: 'portfolio', label: 'Composição atual', placeholder: 'ex: 50% Tesouro Direto, 30% ações, 20% FIIs', type: 'textarea', required: true },
      { name: 'total_value', label: 'Valor total investido', placeholder: 'ex: R$ 500.000', type: 'text', required: true },
      { name: 'investor_profile', label: 'Perfil de investidor', placeholder: 'ex: moderado', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado', 'Agressivo'] },
      { name: 'time_horizon', label: 'Horizonte de investimento', placeholder: 'ex: 15 anos', type: 'text', required: true },
      { name: 'goals', label: 'Objetivos principais', placeholder: 'ex: aposentadoria, renda passiva', type: 'text', required: true }
    ],
    tags: ['carteira', 'investimentos', 'alocação', 'diversificação', 'rebalanceamento'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-003',
    categoryId: 'personal-finance',
    title: 'Plano de Quitação de Dívidas Acelerado',
    description: 'Estratégia completa para eliminar dívidas no menor tempo possível',
    template: `Crie um plano acelerado de quitação de dívidas para:

Lista de dívidas: {debts}
Renda mensal: {income}
Despesas fixas: {expenses}
Capacidade de pagamento extra: {extra_payment}
Prazo desejado: {deadline}

**PLANO DE QUITAÇÃO ACELERADA:**

1. **Mapeamento Completo das Dívidas**
   - Ranking por taxa de juros
   - Ranking por valor
   - Custo efetivo total de cada
   - Projeção se não pagar extra

2. **Estratégia de Ataque**
   - Método avalanche vs bola de neve
   - Recomendação personalizada
   - Ordem de pagamento
   - Justificativa da estratégia

3. **Renegociação e Portabilidade**
   - Dívidas renegociáveis
   - Oportunidades de portabilidade
   - Scripts de negociação
   - Metas de redução de juros

4. **Geração de Renda Extra**
   - Oportunidades identificadas
   - Venda de ativos dispensáveis
   - Trabalhos extras viáveis
   - Meta de renda adicional

5. **Corte de Despesas Estratégico**
   - Despesas elimináveis
   - Despesas reduzíveis
   - Substituições inteligentes
   - Economia projetada

6. **Cronograma de Pagamentos**
   - Mês a mês detalhado
   - Marcos de celebração
   - Dívida zerada em cada etapa
   - Economia de juros acumulada

7. **Proteções Durante o Processo**
   - Fundo de emergência mínimo
   - Seguros essenciais
   - Evitar novas dívidas
   - Gatilhos de alerta

8. **Pós-Quitação**
   - Redirecionamento do valor
   - Construção de patrimônio
   - Novos objetivos financeiros
   - Prevenção de reincidência`,
    variables: [
      { name: 'debts', label: 'Lista de dívidas', placeholder: 'ex: Cartão R$10k (12%am), Empréstimo R$30k (2%am)', type: 'textarea', required: true },
      { name: 'income', label: 'Renda mensal líquida', placeholder: 'ex: R$ 8.000', type: 'text', required: true },
      { name: 'expenses', label: 'Despesas fixas mensais', placeholder: 'ex: R$ 5.000', type: 'text', required: true },
      { name: 'extra_payment', label: 'Valor disponível para pagamento extra', placeholder: 'ex: R$ 1.500', type: 'text', required: true },
      { name: 'deadline', label: 'Prazo desejado para quitação', placeholder: 'ex: 18 meses', type: 'text', required: true }
    ],
    tags: ['dívidas', 'quitação', 'juros', 'renegociação', 'liberdade financeira'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-004',
    categoryId: 'personal-finance',
    title: 'Planejamento Financeiro Familiar Completo',
    description: 'Organização financeira detalhada para famílias',
    template: `Crie um planejamento financeiro familiar completo para:

Composição familiar: {family}
Renda familiar total: {income}
Despesas atuais: {expenses}
Patrimônio: {assets}
Objetivos familiares: {goals}
Principais desafios: {challenges}

**PLANEJAMENTO FINANCEIRO FAMILIAR:**

1. **Diagnóstico Financeiro Familiar**
   - Renda per capita
   - Taxa de comprometimento
   - Saúde financeira geral
   - Pontos de atenção

2. **Orçamento Familiar Otimizado**
   - Método 50-30-20 adaptado
   - Alocação por categoria
   - Despesas individuais vs conjuntas
   - Mesadas e educação financeira infantil

3. **Gestão de Contas e Responsabilidades**
   - Modelo de gestão (conjunto/separado/híbrido)
   - Divisão de responsabilidades
   - Ferramentas de controle
   - Reuniões financeiras periódicas

4. **Fundo de Emergência Familiar**
   - Valor ideal para a família
   - Onde manter
   - Regras de uso
   - Reposição após uso

5. **Proteção da Família**
   - Seguros essenciais
   - Plano de saúde adequado
   - Previdência privada
   - Testamento e inventário

6. **Objetivos por Horizonte**
   - Curto prazo (1 ano)
   - Médio prazo (2-5 anos)
   - Longo prazo (5+ anos)
   - Plano de ação para cada

7. **Educação Financeira dos Filhos**
   - Por faixa etária
   - Mesada educativa
   - Investimentos para filhos
   - Exemplo prático dos pais

8. **Investimentos Familiares**
   - Carteira de curto prazo
   - Carteira de longo prazo
   - Previdência educacional
   - Diversificação adequada`,
    variables: [
      { name: 'family', label: 'Composição familiar', placeholder: 'ex: casal com 2 filhos (8 e 12 anos)', type: 'text', required: true },
      { name: 'income', label: 'Renda familiar total', placeholder: 'ex: R$ 20.000', type: 'text', required: true },
      { name: 'expenses', label: 'Despesas mensais atuais', placeholder: 'ex: R$ 15.000', type: 'text', required: true },
      { name: 'assets', label: 'Patrimônio familiar', placeholder: 'ex: casa própria + R$ 100k investidos', type: 'text', required: true },
      { name: 'goals', label: 'Objetivos familiares', placeholder: 'ex: intercâmbio dos filhos, aposentadoria', type: 'text', required: true },
      { name: 'challenges', label: 'Principais desafios', placeholder: 'ex: gastos com saúde, escola particular', type: 'text', required: true }
    ],
    tags: ['família', 'orçamento', 'planejamento', 'filhos', 'proteção'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-005',
    categoryId: 'personal-finance',
    title: 'Estratégia de Investimento em Dividendos',
    description: 'Plano completo para construir renda passiva com dividendos',
    template: `Crie uma estratégia de investimento focada em dividendos para:

Capital disponível: {capital}
Aporte mensal: {monthly_investment}
Meta de dividendos: {dividend_goal}
Horizonte: {time_horizon}
Perfil de risco: {risk_profile}

**ESTRATÉGIA DE DIVIDENDOS:**

1. **Fundamentos da Estratégia**
   - Filosofia de investimento
   - Dividend yield vs dividend growth
   - Poder dos juros compostos
   - Expectativa realista de retorno

2. **Critérios de Seleção de Ativos**
   - Histórico de pagamentos
   - Payout ratio saudável
   - Crescimento de lucros
   - Solidez do balanço
   - Governança corporativa

3. **Alocação por Setor**
   - Utilities e energia
   - Bancos e financeiras
   - Telecomunicações
   - Commodities
   - Consumo
   - Proporção recomendada

4. **Carteira Inicial Sugerida**
   - 8-12 ações recomendadas
   - Justificativa de cada escolha
   - Peso na carteira
   - Dividend yield esperado

5. **FIIs para Complementar**
   - Tipos de FIIs indicados
   - Critérios de seleção
   - 5-8 FIIs sugeridos
   - Alocação recomendada

6. **Estratégia de Aportes**
   - Frequência ideal
   - Critérios de compra
   - Rebalanceamento
   - Reinvestimento de dividendos

7. **Projeção de Renda**
   - Ano 1-3: fase de construção
   - Ano 4-7: fase de aceleração
   - Ano 8-10: fase de colheita
   - Renda projetada por período

8. **Gestão e Monitoramento**
   - Indicadores-chave
   - Quando vender
   - Substituição de ativos
   - Proteções e hedges`,
    variables: [
      { name: 'capital', label: 'Capital inicial disponível', placeholder: 'ex: R$ 50.000', type: 'text', required: true },
      { name: 'monthly_investment', label: 'Aporte mensal', placeholder: 'ex: R$ 3.000', type: 'text', required: true },
      { name: 'dividend_goal', label: 'Meta de dividendos mensais', placeholder: 'ex: R$ 5.000/mês', type: 'text', required: true },
      { name: 'time_horizon', label: 'Horizonte de investimento', placeholder: 'ex: 10 anos', type: 'text', required: true },
      { name: 'risk_profile', label: 'Perfil de risco', placeholder: 'ex: moderado', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado'] }
    ],
    tags: ['dividendos', 'renda passiva', 'ações', 'FIIs', 'longo prazo'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-006',
    categoryId: 'personal-finance',
    title: 'Planejamento de Aposentadoria Personalizado',
    description: 'Estratégia completa para uma aposentadoria confortável',
    template: `Crie um planejamento de aposentadoria personalizado para:

Idade atual: {current_age}
Idade desejada de aposentadoria: {retirement_age}
Renda atual: {current_income}
Patrimônio acumulado: {current_assets}
Renda desejada na aposentadoria: {desired_income}
Estilo de vida planejado: {lifestyle}

**PLANEJAMENTO DE APOSENTADORIA:**

1. **Diagnóstico de Preparação**
   - Anos até a aposentadoria
   - Gap entre patrimônio atual e necessário
   - Taxa de poupança atual
   - Projeção com cenário atual

2. **Cálculo do Patrimônio Necessário**
   - Método de cálculo utilizado
   - Considerando inflação
   - Margem de segurança
   - Cenários (pessimista/realista/otimista)

3. **Fontes de Renda na Aposentadoria**
   - INSS (estimativa)
   - Previdência privada
   - Investimentos
   - Imóveis para renda
   - Outras fontes

4. **Estratégia de Acumulação**
   - Aporte mensal necessário
   - Alocação de ativos por fase
   - Produtos recomendados
   - Otimização tributária

5. **Previdência Privada**
   - PGBL vs VGBL
   - Quando faz sentido
   - Quanto alocar
   - Portabilidade e taxas

6. **Transição para Aposentadoria**
   - Realocação gradual
   - De acumulação para renda
   - Redução de volatilidade
   - Fontes de liquidez

7. **Riscos e Proteções**
   - Risco de longevidade
   - Risco de saúde
   - Inflação
   - Seguros recomendados

8. **Plano de Ação por Década**
   - Década atual: prioridades
   - Próxima década: ajustes
   - Década da aposentadoria: preparação
   - Pós-aposentadoria: gestão`,
    variables: [
      { name: 'current_age', label: 'Idade atual', placeholder: 'ex: 40 anos', type: 'text', required: true },
      { name: 'retirement_age', label: 'Idade desejada para aposentadoria', placeholder: 'ex: 60 anos', type: 'text', required: true },
      { name: 'current_income', label: 'Renda atual', placeholder: 'ex: R$ 25.000', type: 'text', required: true },
      { name: 'current_assets', label: 'Patrimônio acumulado', placeholder: 'ex: R$ 500.000', type: 'text', required: true },
      { name: 'desired_income', label: 'Renda desejada na aposentadoria', placeholder: 'ex: R$ 15.000/mês', type: 'text', required: true },
      { name: 'lifestyle', label: 'Estilo de vida planejado', placeholder: 'ex: viagens, hobbies, casa de praia', type: 'text', required: true }
    ],
    tags: ['aposentadoria', 'previdência', 'INSS', 'longo prazo', 'renda'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-007',
    categoryId: 'personal-finance',
    title: 'Planejamento Tributário Pessoal',
    description: 'Estratégias legais para otimizar impostos',
    template: `Crie um planejamento tributário pessoal para:

Fontes de renda: {income_sources}
Renda anual total: {annual_income}
Regime tributário atual: {tax_regime}
Investimentos: {investments}
Despesas dedutíveis: {deductions}

**PLANEJAMENTO TRIBUTÁRIO PESSOAL:**

1. **Diagnóstico Tributário**
   - Carga tributária atual
   - Comparativo entre regimes
   - Oportunidades identificadas
   - Riscos a evitar

2. **Escolha do Regime Ideal**
   - Declaração completa vs simplificada
   - Simulação comparativa
   - Recomendação fundamentada
   - Pontos de atenção

3. **Maximização de Deduções**
   - Despesas médicas
   - Educação
   - Previdência privada (PGBL)
   - Dependentes
   - Pensão alimentícia
   - Livro-caixa (se aplicável)

4. **Investimentos Isentos/Vantajosos**
   - LCI/LCA
   - Debêntures incentivadas
   - Fundos imobiliários
   - Ações (isenção até R$20k)
   - Estratégias de compensação

5. **Estruturas Otimizadas**
   - Quando abrir empresa
   - Holding familiar
   - Distribuição de lucros
   - Pró-labore vs dividendos

6. **Carnê-Leão e Ganhos de Capital**
   - Obrigatoriedade
   - Cálculo correto
   - Compensações possíveis
   - Datas e prazos

7. **Planejamento para o Ano**
   - Ações mensais
   - Ações trimestrais
   - Preparação para declaração
   - Documentos a organizar

8. **Economia Projetada**
   - Economia estimada por estratégia
   - Total de economia anual
   - Investimento da economia
   - Retorno no longo prazo`,
    variables: [
      { name: 'income_sources', label: 'Fontes de renda', placeholder: 'ex: CLT, aluguel, investimentos, freelance', type: 'textarea', required: true },
      { name: 'annual_income', label: 'Renda anual total', placeholder: 'ex: R$ 300.000', type: 'text', required: true },
      { name: 'tax_regime', label: 'Regime tributário atual', placeholder: 'ex: declaração completa', type: 'select', required: true, options: ['Simplificada', 'Completa', 'Não declaro'] },
      { name: 'investments', label: 'Investimentos atuais', placeholder: 'ex: R$ 200k em renda fixa, R$ 100k em ações', type: 'textarea', required: true },
      { name: 'deductions', label: 'Despesas dedutíveis', placeholder: 'ex: R$ 30k saúde, R$ 15k educação', type: 'text', required: true }
    ],
    tags: ['imposto de renda', 'tributação', 'deduções', 'IRPF', 'economia fiscal'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-008',
    categoryId: 'personal-finance',
    title: 'Estratégia de Compra de Imóvel',
    description: 'Planejamento completo para aquisição de imóvel',
    template: `Crie uma estratégia de compra de imóvel para:

Objetivo: {purpose}
Valor aproximado do imóvel: {property_value}
Renda mensal: {monthly_income}
Poupança atual para entrada: {savings}
Prazo para compra: {timeline}
Cidade/região: {location}

**ESTRATÉGIA DE COMPRA DE IMÓVEL:**

1. **Análise de Viabilidade**
   - Capacidade de financiamento
   - Comprometimento ideal da renda
   - Entrada recomendada
   - Valor máximo viável

2. **Preparação Financeira**
   - Meta de entrada (% do imóvel)
   - Plano de acumulação
   - Onde investir a entrada
   - Reserva para custos extras

3. **Custos Totais da Compra**
   - ITBI
   - Escritura e registro
   - Taxa de corretagem
   - Mudança e reformas
   - Buffer de segurança

4. **Modalidades de Financiamento**
   - SAC vs PRICE
   - Taxa fixa vs TR
   - Bancos e taxas atuais
   - FGTS: uso estratégico
   - Consórcio: quando vale

5. **Análise do Mercado**
   - Momento do mercado
   - Tendências de preço
   - Valorização da região
   - Melhores oportunidades

6. **Checklist de Avaliação**
   - Documentação do imóvel
   - Situação jurídica
   - Vistoria técnica
   - Pontos de negociação

7. **Estratégia de Negociação**
   - Pesquisa de preços
   - Argumentos para desconto
   - Condições de pagamento
   - Quando fechar

8. **Plano Pós-Compra**
   - Quitação antecipada
   - Portabilidade de crédito
   - Amortização extra
   - Proteção do patrimônio`,
    variables: [
      { name: 'purpose', label: 'Objetivo da compra', placeholder: 'ex: moradia, investimento, casa de praia', type: 'select', required: true, options: ['Moradia própria', 'Investimento para alugar', 'Casa de férias', 'Comercial'] },
      { name: 'property_value', label: 'Valor aproximado do imóvel', placeholder: 'ex: R$ 600.000', type: 'text', required: true },
      { name: 'monthly_income', label: 'Renda mensal familiar', placeholder: 'ex: R$ 20.000', type: 'text', required: true },
      { name: 'savings', label: 'Poupança atual para entrada', placeholder: 'ex: R$ 100.000', type: 'text', required: true },
      { name: 'timeline', label: 'Prazo para compra', placeholder: 'ex: 2 anos', type: 'text', required: true },
      { name: 'location', label: 'Cidade/região desejada', placeholder: 'ex: São Paulo - zona sul', type: 'text', required: true }
    ],
    tags: ['imóvel', 'financiamento', 'casa própria', 'investimento imobiliário', 'FGTS'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-009',
    categoryId: 'personal-finance',
    title: 'Gestão Financeira para Autônomos e Freelancers',
    description: 'Organização financeira completa para profissionais autônomos',
    template: `Crie um sistema de gestão financeira para autônomo/freelancer:

Área de atuação: {field}
Faturamento médio mensal: {revenue}
Variação de renda: {variation}
Despesas profissionais: {business_expenses}
Regime tributário: {tax_regime}
Objetivos: {goals}

**GESTÃO FINANCEIRA PARA AUTÔNOMOS:**

1. **Estruturação de Contas**
   - Separação PF x PJ
   - Conta operacional
   - Conta de reserva
   - Conta de impostos
   - Ferramentas de gestão

2. **Precificação Estratégica**
   - Cálculo do custo/hora real
   - Margem de lucro ideal
   - Precificação por projeto
   - Reajustes periódicos

3. **Gestão da Sazonalidade**
   - Mapeamento de picos e vales
   - Reserva para meses fracos
   - Estratégias de estabilização
   - Diversificação de clientes

4. **Pró-Labore e Distribuição**
   - Definição do pró-labore fixo
   - Quando distribuir lucros
   - Reserva para reinvestimento
   - Benefícios e perks

5. **Impostos e Obrigações**
   - MEI, Simples ou Presumido
   - Calendário tributário
   - DAS, IRPF, ISS
   - Contador: quando contratar

6. **Proteções Essenciais**
   - INSS como autônomo
   - Previdência privada
   - Seguro profissional
   - Reserva de emergência ampliada

7. **Crescimento Sustentável**
   - Quando contratar
   - Investimento em capacitação
   - Ferramentas e estrutura
   - Escalabilidade do negócio

8. **Planejamento de Longo Prazo**
   - Aposentadoria do autônomo
   - Construção de patrimônio
   - Renda passiva paralela
   - Eventual transição`,
    variables: [
      { name: 'field', label: 'Área de atuação', placeholder: 'ex: designer, desenvolvedor, consultor', type: 'text', required: true },
      { name: 'revenue', label: 'Faturamento médio mensal', placeholder: 'ex: R$ 15.000', type: 'text', required: true },
      { name: 'variation', label: 'Variação de renda', placeholder: 'ex: alta - varia 50% entre meses', type: 'select', required: true, options: ['Baixa (até 20%)', 'Média (20-40%)', 'Alta (40-60%)', 'Muito alta (60%+)'] },
      { name: 'business_expenses', label: 'Despesas profissionais mensais', placeholder: 'ex: R$ 3.000 (ferramentas, coworking)', type: 'text', required: true },
      { name: 'tax_regime', label: 'Regime tributário atual', placeholder: 'ex: MEI', type: 'select', required: true, options: ['Pessoa Física', 'MEI', 'Simples Nacional', 'Lucro Presumido'] },
      { name: 'goals', label: 'Objetivos financeiros', placeholder: 'ex: estabilizar renda, investir 30%', type: 'text', required: true }
    ],
    tags: ['autônomo', 'freelancer', 'MEI', 'PJ', 'gestão financeira'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-010',
    categoryId: 'personal-finance',
    title: 'Estratégia de Proteção Patrimonial',
    description: 'Blindagem legal e proteção de patrimônio familiar',
    template: `Crie uma estratégia de proteção patrimonial para:

Patrimônio total: {total_assets}
Composição: {asset_composition}
Estrutura familiar: {family_structure}
Atividade profissional: {profession}
Riscos identificados: {risks}
Objetivos de proteção: {protection_goals}

**ESTRATÉGIA DE PROTEÇÃO PATRIMONIAL:**

1. **Diagnóstico de Exposição**
   - Ativos expostos a risco
   - Passivos potenciais
   - Riscos profissionais
   - Riscos familiares
   - Score de vulnerabilidade

2. **Estruturas de Proteção**
   - Holding familiar
   - Doação com usufruto
   - Bem de família
   - Regime de bens no casamento
   - Testamento e cláusulas

3. **Blindagem de Ativos**
   - Imóveis
   - Investimentos financeiros
   - Participações societárias
   - Veículos e outros bens
   - Ativos no exterior

4. **Planejamento Sucessório**
   - Inventário em vida
   - Doação estratégica
   - Seguro de vida para sucessão
   - Minimização de ITCMD
   - Continuidade dos negócios

5. **Proteção Contra Credores**
   - Estratégias legais
   - Timing das estruturas
   - Limites e cuidados
   - Documentação necessária

6. **Seguros Estratégicos**
   - Responsabilidade civil
   - D&O para executivos
   - Seguro de vida
   - Seguro patrimonial
   - Análise custo-benefício

7. **Governança Familiar**
   - Acordo de sócios familiar
   - Protocolo familiar
   - Conselho de família
   - Educação dos herdeiros

8. **Implementação**
   - Ordem de prioridade
   - Custos estimados
   - Profissionais necessários
   - Cronograma de execução`,
    variables: [
      { name: 'total_assets', label: 'Patrimônio total estimado', placeholder: 'ex: R$ 5.000.000', type: 'text', required: true },
      { name: 'asset_composition', label: 'Composição do patrimônio', placeholder: 'ex: 2 imóveis, empresa, investimentos', type: 'textarea', required: true },
      { name: 'family_structure', label: 'Estrutura familiar', placeholder: 'ex: casado, 3 filhos maiores', type: 'text', required: true },
      { name: 'profession', label: 'Atividade profissional', placeholder: 'ex: empresário, médico, advogado', type: 'text', required: true },
      { name: 'risks', label: 'Riscos identificados', placeholder: 'ex: processos trabalhistas, dívidas de empresa', type: 'textarea', required: true },
      { name: 'protection_goals', label: 'Objetivos de proteção', placeholder: 'ex: proteger para filhos, blindar de processos', type: 'text', required: true }
    ],
    tags: ['proteção patrimonial', 'holding', 'sucessão', 'blindagem', 'herança'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-011',
    categoryId: 'personal-finance',
    title: 'Análise de Viabilidade de Investimento Imobiliário',
    description: 'Estudo completo para investir em imóveis para renda',
    template: `Analise a viabilidade de investimento imobiliário para:

Tipo de imóvel: {property_type}
Valor do imóvel: {property_value}
Localização: {location}
Capital disponível: {available_capital}
Objetivo: {investment_goal}
Horizonte: {time_horizon}

**ANÁLISE DE VIABILIDADE IMOBILIÁRIA:**

1. **Análise do Imóvel**
   - Características físicas
   - Documentação e regularidade
   - Estado de conservação
   - Potencial de valorização
   - Pontos fortes e fracos

2. **Análise de Mercado**
   - Preço/m² da região
   - Comparativo com similares
   - Tendência de preços
   - Oferta e demanda local
   - Infraestrutura futura

3. **Projeção de Receitas**
   - Aluguel de mercado
   - Taxa de vacância esperada
   - Reajustes projetados
   - Outras receitas possíveis
   - Cenários (conservador/realista)

4. **Projeção de Custos**
   - IPTU
   - Condomínio
   - Manutenção
   - Seguro
   - Taxa de administração
   - IR sobre aluguel

5. **Indicadores Financeiros**
   - Cap rate
   - Yield bruto e líquido
   - Payback simples
   - TIR projetada
   - Comparativo com alternativas

6. **Estrutura de Aquisição**
   - À vista vs financiado
   - Pessoa física vs PJ
   - Uso de FGTS
   - Consórcio contemplado
   - Custo de oportunidade

7. **Riscos do Investimento**
   - Risco de vacância
   - Risco de inadimplência
   - Risco de desvalorização
   - Risco de liquidez
   - Mitigações possíveis

8. **Recomendação Final**
   - Parecer técnico
   - Condições para investir
   - Pontos de negociação
   - Alternativas a considerar`,
    variables: [
      { name: 'property_type', label: 'Tipo de imóvel', placeholder: 'ex: apartamento 2 quartos', type: 'select', required: true, options: ['Apartamento residencial', 'Casa', 'Sala comercial', 'Loja', 'Galpão', 'Terreno'] },
      { name: 'property_value', label: 'Valor do imóvel', placeholder: 'ex: R$ 400.000', type: 'text', required: true },
      { name: 'location', label: 'Localização', placeholder: 'ex: Belo Horizonte - Savassi', type: 'text', required: true },
      { name: 'available_capital', label: 'Capital disponível', placeholder: 'ex: R$ 200.000', type: 'text', required: true },
      { name: 'investment_goal', label: 'Objetivo do investimento', placeholder: 'ex: renda passiva mensal', type: 'select', required: true, options: ['Renda passiva', 'Valorização', 'Ambos'] },
      { name: 'time_horizon', label: 'Horizonte do investimento', placeholder: 'ex: 10 anos', type: 'text', required: true }
    ],
    tags: ['imóveis', 'investimento', 'aluguel', 'renda', 'análise'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-012',
    categoryId: 'personal-finance',
    title: 'Plano de Reserva de Emergência Estruturado',
    description: 'Estratégia completa para construir e manter reserva de emergência',
    template: `Crie um plano de reserva de emergência para:

Renda mensal: {monthly_income}
Despesas mensais: {monthly_expenses}
Reserva atual: {current_reserve}
Estabilidade do emprego: {job_stability}
Dependentes: {dependents}
Perfil de risco: {risk_profile}

**PLANO DE RESERVA DE EMERGÊNCIA:**

1. **Cálculo da Reserva Ideal**
   - Fórmula personalizada
   - Meses de cobertura recomendados
   - Valor total necessário
   - Justificativa do cálculo

2. **Estratégia de Acumulação**
   - Meta mensal de aporte
   - Prazo para completar
   - Prioridade vs outras metas
   - Aceleração com extras

3. **Onde Manter a Reserva**
   - Critérios: liquidez, segurança, rentabilidade
   - Produtos recomendados
   - Alocação entre produtos
   - O que evitar

4. **Estrutura em Camadas**
   - Camada 1: Imediata (conta corrente)
   - Camada 2: Rápida (CDB liquidez)
   - Camada 3: Reserva principal (Tesouro Selic)
   - Proporção entre camadas

5. **Regras de Uso**
   - O que é emergência
   - O que NÃO é emergência
   - Processo de decisão
   - Reposição obrigatória

6. **Proteção da Reserva**
   - Conta separada
   - Automatização
   - Disciplina mental
   - Revisões periódicas

7. **Situações Especiais**
   - Desemprego
   - Doença/acidente
   - Gastos inesperados
   - Oportunidades

8. **Evolução da Reserva**
   - Quando aumentar
   - Quando redirecionar excesso
   - Integração com investimentos
   - Manutenção de longo prazo`,
    variables: [
      { name: 'monthly_income', label: 'Renda mensal líquida', placeholder: 'ex: R$ 10.000', type: 'text', required: true },
      { name: 'monthly_expenses', label: 'Despesas mensais essenciais', placeholder: 'ex: R$ 7.000', type: 'text', required: true },
      { name: 'current_reserve', label: 'Reserva atual', placeholder: 'ex: R$ 15.000', type: 'text', required: true },
      { name: 'job_stability', label: 'Estabilidade do emprego', placeholder: 'ex: média', type: 'select', required: true, options: ['Alta (servidor/estável)', 'Média (CLT sólido)', 'Baixa (autônomo/instável)'] },
      { name: 'dependents', label: 'Número de dependentes', placeholder: 'ex: 2 (cônjuge e filho)', type: 'text', required: true },
      { name: 'risk_profile', label: 'Perfil de risco geral', placeholder: 'ex: conservador', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado'] }
    ],
    tags: ['reserva de emergência', 'segurança', 'liquidez', 'poupança', 'proteção'],
    difficulty: 'beginner',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-013',
    categoryId: 'personal-finance',
    title: 'Estratégia de Investimento Internacional',
    description: 'Diversificação global de investimentos',
    template: `Crie uma estratégia de investimento internacional para:

Patrimônio investível: {investable_assets}
Alocação atual no exterior: {current_international}
Objetivos: {goals}
Horizonte: {time_horizon}
Conhecimento de inglês: {english_level}
Experiência com investimentos: {experience}

**ESTRATÉGIA DE INVESTIMENTO INTERNACIONAL:**

1. **Por Que Investir no Exterior**
   - Diversificação de moeda
   - Acesso a mercados maiores
   - Proteção patrimonial
   - Empresas não disponíveis no Brasil

2. **Alocação Internacional Ideal**
   - % recomendado do patrimônio
   - Distribuição geográfica
   - Distribuição por classe de ativo
   - Evolução gradual

3. **Veículos de Investimento**
   - ETFs domiciliados no Brasil (BDRs)
   - ETFs via corretora americana
   - Fundos internacionais
   - Ações diretamente
   - Prós e contras de cada

4. **ETFs Recomendados**
   - Mercado americano total
   - Mercados desenvolvidos
   - Mercados emergentes
   - Bonds internacionais
   - REITs globais
   - Alocação sugerida

5. **Aspectos Operacionais**
   - Corretoras indicadas
   - Remessa de dinheiro
   - Custos envolvidos
   - Documentação necessária

6. **Tributação**
   - IR sobre ganhos no exterior
   - Carnê-leão mensal
   - Declaração de bens
   - Compensação de prejuízos
   - Planejamento tributário

7. **Gestão de Câmbio**
   - Quando comprar dólar
   - Hedge natural
   - Impacto na volatilidade
   - Estratégia de remessas

8. **Manutenção e Rebalanceamento**
   - Frequência de revisão
   - Critérios de rebalanceamento
   - Acompanhamento
   - Ferramentas úteis`,
    variables: [
      { name: 'investable_assets', label: 'Patrimônio investível total', placeholder: 'ex: R$ 500.000', type: 'text', required: true },
      { name: 'current_international', label: 'Alocação atual no exterior', placeholder: 'ex: 0% ou R$ 50.000 em BDRs', type: 'text', required: true },
      { name: 'goals', label: 'Objetivos com investimento internacional', placeholder: 'ex: diversificação, proteção cambial', type: 'text', required: true },
      { name: 'time_horizon', label: 'Horizonte de investimento', placeholder: 'ex: 15 anos', type: 'text', required: true },
      { name: 'english_level', label: 'Nível de inglês', placeholder: 'ex: intermediário', type: 'select', required: true, options: ['Básico', 'Intermediário', 'Avançado', 'Fluente'] },
      { name: 'experience', label: 'Experiência com investimentos', placeholder: 'ex: 3 anos', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] }
    ],
    tags: ['investimento internacional', 'dólar', 'ETFs', 'diversificação', 'exterior'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-014',
    categoryId: 'personal-finance',
    title: 'Planejamento para Compra de Veículo',
    description: 'Análise completa para aquisição inteligente de veículo',
    template: `Crie um planejamento para compra de veículo:

Veículo desejado: {vehicle}
Valor aproximado: {vehicle_value}
Renda mensal: {monthly_income}
Economia atual para entrada: {savings}
Veículo atual: {current_vehicle}
Uso principal: {main_usage}

**PLANEJAMENTO PARA COMPRA DE VEÍCULO:**

1. **Análise de Necessidade**
   - Realmente preciso?
   - Uso vs custo
   - Alternativas ao carro próprio
   - Impacto no orçamento

2. **Capacidade de Pagamento**
   - Comprometimento máximo da renda
   - Parcela ideal
   - Impacto no orçamento total
   - Custo total de propriedade

3. **Modalidades de Aquisição**
   - À vista (cenário ideal)
   - Financiamento (taxas, prazos)
   - Consórcio (quando vale)
   - Leasing (para empresas)
   - Comparativo detalhado

4. **Preparação da Entrada**
   - % ideal de entrada
   - Plano de acumulação
   - Onde investir a entrada
   - Timeline

5. **Custos de Propriedade**
   - IPVA anual
   - Seguro (estimativa)
   - Manutenção preventiva
   - Combustível mensal
   - Estacionamento
   - Depreciação anual
   - Custo mensal total

6. **Novo vs Usado vs Seminovo**
   - Prós e contras de cada
   - Depreciação comparada
   - Custo-benefício
   - Recomendação personalizada

7. **Estratégia de Negociação**
   - Pesquisa de preços
   - Melhor época para comprar
   - Pontos de negociação
   - Troca do usado

8. **Decisão e Próximos Passos**
   - Recomendação final
   - Cronograma de ação
   - Checklist de compra
   - Cuidados pós-compra`,
    variables: [
      { name: 'vehicle', label: 'Veículo desejado', placeholder: 'ex: SUV compacto 2023/2024', type: 'text', required: true },
      { name: 'vehicle_value', label: 'Valor aproximado', placeholder: 'ex: R$ 120.000', type: 'text', required: true },
      { name: 'monthly_income', label: 'Renda mensal', placeholder: 'ex: R$ 15.000', type: 'text', required: true },
      { name: 'savings', label: 'Economia para entrada', placeholder: 'ex: R$ 30.000', type: 'text', required: true },
      { name: 'current_vehicle', label: 'Veículo atual', placeholder: 'ex: Carro popular 2018 (vale ~R$ 40k)', type: 'text', required: true },
      { name: 'main_usage', label: 'Uso principal', placeholder: 'ex: trabalho (30km/dia), família', type: 'text', required: true }
    ],
    tags: ['carro', 'veículo', 'financiamento', 'consórcio', 'compra'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-015',
    categoryId: 'personal-finance',
    title: 'Estratégia de Investimento em Renda Fixa',
    description: 'Montagem de carteira de renda fixa otimizada',
    template: `Crie uma estratégia de investimento em renda fixa para:

Capital para investir: {capital}
Objetivo: {goal}
Prazo: {time_horizon}
Perfil de risco: {risk_profile}
Conhecimento atual: {knowledge_level}
Reserva de emergência: {emergency_fund}

**ESTRATÉGIA DE RENDA FIXA:**

1. **Diagnóstico e Objetivos**
   - Objetivo principal do investimento
   - Necessidade de liquidez
   - Expectativa de rentabilidade
   - Tolerância a volatilidade

2. **Classes de Renda Fixa**
   - Pós-fixados (CDI)
   - Prefixados
   - Atrelados à inflação (IPCA+)
   - Características de cada
   - Quando usar cada tipo

3. **Produtos Recomendados**
   
   **Tesouro Direto:**
   - Tesouro Selic
   - Tesouro Prefixado
   - Tesouro IPCA+
   - Alocação sugerida

   **CDBs/LCIs/LCAs:**
   - Critérios de seleção
   - Bancos e emissores
   - Taxas mínimas aceitáveis
   - Cobertura do FGC

   **Debêntures:**
   - Incentivadas vs tradicionais
   - Análise de crédito
   - Quando incluir

4. **Alocação Recomendada**
   - Por tipo de indexador
   - Por prazo
   - Por emissor
   - Diversificação de crédito

5. **Estratégia de Vencimentos**
   - Escadinha (ladder)
   - Casamento com objetivos
   - Reinvestimento
   - Gestão de liquidez

6. **Aspectos Tributários**
   - Tabela regressiva de IR
   - IOF nos primeiros dias
   - Isenções (LCI/LCA)
   - Come-cotas (fundos)
   - Planejamento tributário

7. **Riscos e Proteções**
   - Risco de crédito
   - Risco de mercado
   - Risco de liquidez
   - FGC e limites
   - Marcação a mercado

8. **Gestão e Acompanhamento**
   - Frequência de revisão
   - Quando vender antecipado
   - Reinvestimento
   - Ferramentas e plataformas`,
    variables: [
      { name: 'capital', label: 'Capital para investir', placeholder: 'ex: R$ 100.000', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo do investimento', placeholder: 'ex: aposentadoria, compra de imóvel', type: 'text', required: true },
      { name: 'time_horizon', label: 'Prazo do investimento', placeholder: 'ex: 5 anos', type: 'text', required: true },
      { name: 'risk_profile', label: 'Perfil de risco', placeholder: 'ex: conservador', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado'] },
      { name: 'knowledge_level', label: 'Conhecimento em renda fixa', placeholder: 'ex: básico', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] },
      { name: 'emergency_fund', label: 'Já tem reserva de emergência?', placeholder: 'ex: sim, 6 meses', type: 'text', required: true }
    ],
    tags: ['renda fixa', 'Tesouro Direto', 'CDB', 'LCI', 'LCA', 'conservador'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-016',
    categoryId: 'personal-finance',
    title: 'Plano Financeiro para Casamento',
    description: 'Organização financeira completa para casais',
    template: `Crie um plano financeiro para casamento de:

Renda combinada: {combined_income}
Despesas individuais atuais: {current_expenses}
Patrimônio combinado: {combined_assets}
Dívidas: {debts}
Objetivos do casal: {couple_goals}
Data prevista para casamento: {wedding_date}

**PLANO FINANCEIRO PARA O CASAMENTO:**

1. **Diagnóstico Financeiro do Casal**
   - Perfil financeiro de cada um
   - Compatibilidade financeira
   - Pontos de atenção
   - Conversa sobre dinheiro

2. **Modelo de Gestão Financeira**
   - Tudo junto
   - Tudo separado
   - Híbrido (recomendado)
   - Prós e contras de cada
   - Implementação prática

3. **Orçamento do Casamento (Evento)**
   - Cerimônia e festa
   - Lua de mel
   - Documentação
   - Buffer para imprevistos
   - Estratégia de economia

4. **Orçamento da Vida a Dois**
   - Despesas conjuntas
   - Despesas individuais
   - Divisão proporcional
   - Novo padrão de vida

5. **Metas Financeiras Conjuntas**
   - Curto prazo (1 ano)
   - Médio prazo (2-5 anos)
   - Longo prazo (5+ anos)
   - Priorização

6. **Proteções e Seguros**
   - Regime de bens
   - Seguros recomendados
   - Beneficiários
   - Planejamento sucessório básico

7. **Investimentos em Conjunto**
   - Estratégia unificada
   - Contas conjuntas vs individuais
   - Aposentadoria do casal
   - Herança e família

8. **Acordo Financeiro do Casal**
   - Regras e combinados
   - Reuniões financeiras
   - Resolução de conflitos
   - Revisão periódica`,
    variables: [
      { name: 'combined_income', label: 'Renda combinada do casal', placeholder: 'ex: R$ 20.000', type: 'text', required: true },
      { name: 'current_expenses', label: 'Despesas individuais atuais', placeholder: 'ex: Ele R$ 5k, Ela R$ 4k', type: 'text', required: true },
      { name: 'combined_assets', label: 'Patrimônio combinado', placeholder: 'ex: R$ 100.000 em investimentos', type: 'text', required: true },
      { name: 'debts', label: 'Dívidas existentes', placeholder: 'ex: financiamento carro R$ 30k', type: 'text', required: true },
      { name: 'couple_goals', label: 'Objetivos do casal', placeholder: 'ex: casa própria em 3 anos, filhos em 5', type: 'text', required: true },
      { name: 'wedding_date', label: 'Data prevista para casamento', placeholder: 'ex: dezembro 2025', type: 'text', required: true }
    ],
    tags: ['casamento', 'casal', 'finanças conjuntas', 'regime de bens', 'orçamento'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-017',
    categoryId: 'personal-finance',
    title: 'Estratégia para Quitar Financiamento Imobiliário',
    description: 'Plano para acelerar quitação de financiamento de imóvel',
    template: `Crie uma estratégia de quitação de financiamento imobiliário:

Saldo devedor atual: {outstanding_balance}
Parcela atual: {current_payment}
Taxa de juros: {interest_rate}
Prazo restante: {remaining_term}
Renda mensal: {monthly_income}
Capacidade de amortização extra: {extra_capacity}

**ESTRATÉGIA DE QUITAÇÃO ANTECIPADA:**

1. **Diagnóstico do Financiamento**
   - Custo efetivo total
   - Juros totais projetados
   - Sistema de amortização (SAC/Price)
   - Cláusulas do contrato
   - Potencial de economia

2. **Amortização: Prazo vs Parcela**
   - Impacto de reduzir prazo
   - Impacto de reduzir parcela
   - Simulação comparativa
   - Recomendação personalizada

3. **Uso do FGTS**
   - Saldo disponível
   - Regras de utilização
   - Frequência permitida
   - Estratégia de uso

4. **Portabilidade de Crédito**
   - Taxas atuais de mercado
   - Bancos com melhores condições
   - Processo de portabilidade
   - Custos envolvidos
   - Vale a pena?

5. **Plano de Amortização Extra**
   - Frequência ideal
   - Valor recomendado
   - Melhor período do mês
   - Metas progressivas

6. **Equilíbrio com Investimentos**
   - Amortizar vs investir
   - Taxa de equilíbrio
   - Cenários comparativos
   - Estratégia híbrida

7. **Cronograma de Quitação**
   - Projeção mês a mês
   - Marcos de celebração
   - Economia acumulada
   - Data estimada de quitação

8. **Pós-Quitação**
   - Redirecionamento da parcela
   - Construção de patrimônio
   - Novos objetivos
   - Celebração!`,
    variables: [
      { name: 'outstanding_balance', label: 'Saldo devedor atual', placeholder: 'ex: R$ 250.000', type: 'text', required: true },
      { name: 'current_payment', label: 'Parcela atual', placeholder: 'ex: R$ 3.500', type: 'text', required: true },
      { name: 'interest_rate', label: 'Taxa de juros anual', placeholder: 'ex: 9% ao ano', type: 'text', required: true },
      { name: 'remaining_term', label: 'Prazo restante', placeholder: 'ex: 15 anos', type: 'text', required: true },
      { name: 'monthly_income', label: 'Renda mensal', placeholder: 'ex: R$ 18.000', type: 'text', required: true },
      { name: 'extra_capacity', label: 'Capacidade de amortização extra', placeholder: 'ex: R$ 2.000/mês', type: 'text', required: true }
    ],
    tags: ['financiamento', 'imóvel', 'amortização', 'FGTS', 'quitação'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-018',
    categoryId: 'personal-finance',
    title: 'Análise de Fundos Imobiliários (FIIs)',
    description: 'Estratégia completa para investir em FIIs',
    template: `Crie uma estratégia de investimento em FIIs para:

Capital para investir: {capital}
Objetivo de renda mensal: {income_goal}
Perfil de risco: {risk_profile}
Experiência com FIIs: {experience}
Prazo do investimento: {time_horizon}
Já possui FIIs?: {current_fiis}

**ESTRATÉGIA DE INVESTIMENTO EM FIIs:**

1. **Fundamentos de FIIs**
   - Como funcionam
   - Rendimentos (isentos de IR)
   - Valorização de cotas
   - Vantagens vs imóvel físico
   - Riscos específicos

2. **Tipos de FIIs**
   - Tijolo (imóveis físicos)
   - Papel (CRIs)
   - Híbridos
   - FOFs (fundos de fundos)
   - Desenvolvimento
   - Prós e contras de cada

3. **Setores Imobiliários**
   - Lajes corporativas
   - Logístico
   - Shopping centers
   - Agro
   - Residencial
   - Análise atual de cada setor

4. **Critérios de Seleção**
   - P/VP (preço/valor patrimonial)
   - Dividend yield
   - Vacância
   - Qualidade dos ativos
   - Gestão e governança
   - Liquidez

5. **Carteira Recomendada**
   - 8-12 FIIs sugeridos
   - Diversificação por setor
   - Diversificação por tipo
   - Peso de cada fundo
   - Justificativa das escolhas

6. **Estratégia de Compra**
   - Timing de entrada
   - Aportes regulares
   - Preço-teto por FII
   - Ordem de prioridade

7. **Gestão de Carteira**
   - Reinvestimento de dividendos
   - Rebalanceamento
   - Quando vender
   - Troca de ativos

8. **Projeção de Renda**
   - Dividendos esperados
   - Crescimento projetado
   - Cenários (conservador/otimista)
   - Meta de patrimônio`,
    variables: [
      { name: 'capital', label: 'Capital para investir', placeholder: 'ex: R$ 50.000', type: 'text', required: true },
      { name: 'income_goal', label: 'Objetivo de renda mensal', placeholder: 'ex: R$ 500/mês', type: 'text', required: true },
      { name: 'risk_profile', label: 'Perfil de risco', placeholder: 'ex: moderado', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado'] },
      { name: 'experience', label: 'Experiência com FIIs', placeholder: 'ex: iniciante', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] },
      { name: 'time_horizon', label: 'Prazo do investimento', placeholder: 'ex: longo prazo (10+ anos)', type: 'text', required: true },
      { name: 'current_fiis', label: 'Já possui FIIs?', placeholder: 'ex: sim, XPML11 e HGLG11', type: 'text', required: true }
    ],
    tags: ['FIIs', 'fundos imobiliários', 'dividendos', 'renda passiva', 'imóveis'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-019',
    categoryId: 'personal-finance',
    title: 'Planejamento para Intercâmbio ou Estudos no Exterior',
    description: 'Organização financeira completa para estudar fora',
    template: `Crie um planejamento financeiro para intercâmbio/estudos no exterior:

Destino: {destination}
Duração: {duration}
Tipo de programa: {program_type}
Prazo para viagem: {timeline}
Renda atual: {current_income}
Economia atual: {current_savings}

**PLANEJAMENTO PARA ESTUDOS NO EXTERIOR:**

1. **Mapeamento de Custos**
   - Curso/programa
   - Visto e documentação
   - Passagem aérea
   - Seguro saúde
   - Moradia
   - Alimentação
   - Transporte local
   - Lazer e extras
   - Total estimado

2. **Estratégia de Acumulação**
   - Meta total em reais
   - Meta em moeda estrangeira
   - Prazo disponível
   - Aporte mensal necessário
   - Onde investir

3. **Gestão de Câmbio**
   - Quando comprar moeda
   - Compras parceladas
   - Conta no exterior
   - Cartões internacionais
   - Estratégia de proteção

4. **Fontes de Financiamento**
   - Economia própria
   - Apoio familiar
   - Bolsas e financiamentos
   - Trabalho durante estudos
   - Mix recomendado

5. **Preparação Antes da Viagem**
   - Documentação
   - Conta bancária
   - Cartões
   - Seguro
   - Checklist completo

6. **Orçamento Durante o Intercâmbio**
   - Orçamento mensal
   - Controle de gastos
   - Reserva de emergência
   - Ferramentas de gestão

7. **Questões Fiscais e Legais**
   - Saída fiscal
   - Declaração de IR
   - Impostos no exterior
   - Remessas

8. **Retorno e Reintegração**
   - Planejamento de volta
   - Recolocação profissional
   - Gestão de dívidas (se houver)
   - Próximos passos financeiros`,
    variables: [
      { name: 'destination', label: 'País/cidade de destino', placeholder: 'ex: Canadá - Toronto', type: 'text', required: true },
      { name: 'duration', label: 'Duração do programa', placeholder: 'ex: 1 ano', type: 'text', required: true },
      { name: 'program_type', label: 'Tipo de programa', placeholder: 'ex: MBA, intercâmbio, mestrado', type: 'select', required: true, options: ['Intercâmbio de idiomas', 'Graduação', 'Pós-graduação/MBA', 'Mestrado/Doutorado', 'Work and Travel'] },
      { name: 'timeline', label: 'Prazo para viagem', placeholder: 'ex: 18 meses', type: 'text', required: true },
      { name: 'current_income', label: 'Renda atual', placeholder: 'ex: R$ 8.000', type: 'text', required: true },
      { name: 'current_savings', label: 'Economia atual para o projeto', placeholder: 'ex: R$ 30.000', type: 'text', required: true }
    ],
    tags: ['intercâmbio', 'estudos exterior', 'câmbio', 'planejamento', 'educação'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-020',
    categoryId: 'personal-finance',
    title: 'Estratégia de Construção de Patrimônio em 10 Anos',
    description: 'Plano acelerado de construção de riqueza',
    template: `Crie uma estratégia de construção de patrimônio em 10 anos:

Patrimônio atual: {current_assets}
Renda atual: {current_income}
Potencial de crescimento de renda: {income_growth}
Taxa de poupança atual: {savings_rate}
Meta de patrimônio: {wealth_goal}
Perfil de risco: {risk_profile}

**ESTRATÉGIA DE CONSTRUÇÃO DE PATRIMÔNIO:**

1. **Diagnóstico Inicial**
   - Patrimônio líquido atual
   - Potencial de geração de renda
   - Gap para a meta
   - Taxa de crescimento necessária

2. **Pilares da Construção de Riqueza**
   - Aumentar renda
   - Maximizar taxa de poupança
   - Investir com sabedoria
   - Proteger patrimônio
   - Peso de cada pilar

3. **Estratégia de Renda**
   - Evolução na carreira
   - Fontes alternativas
   - Renda passiva
   - Meta de renda por ano

4. **Otimização de Despesas**
   - Lifestyle design
   - Gastos que cortam
   - Gastos que mantém
   - Taxa de poupança alvo

5. **Estratégia de Investimentos**
   
   **Anos 1-3: Fundação**
   - Alocação agressiva
   - Foco em crescimento
   
   **Anos 4-7: Aceleração**
   - Rebalanceamento
   - Diversificação
   
   **Anos 8-10: Consolidação**
   - Proteção de ganhos
   - Geração de renda

6. **Metas Anuais**
   - Ano 1: patrimônio e ações
   - Ano 2-3: marcos
   - Ano 4-5: checkpoints
   - Ano 6-7: ajustes
   - Ano 8-10: chegada

7. **Riscos e Contingências**
   - Cenários adversos
   - Plano B
   - Proteções
   - Flexibilidade

8. **Acompanhamento**
   - KPIs mensais
   - Revisões trimestrais
   - Ajustes anuais
   - Celebrações de marco`,
    variables: [
      { name: 'current_assets', label: 'Patrimônio atual', placeholder: 'ex: R$ 50.000', type: 'text', required: true },
      { name: 'current_income', label: 'Renda mensal atual', placeholder: 'ex: R$ 12.000', type: 'text', required: true },
      { name: 'income_growth', label: 'Potencial de crescimento de renda', placeholder: 'ex: alto (carreira em TI)', type: 'select', required: true, options: ['Baixo', 'Médio', 'Alto', 'Muito alto'] },
      { name: 'savings_rate', label: 'Taxa de poupança atual', placeholder: 'ex: 25%', type: 'text', required: true },
      { name: 'wealth_goal', label: 'Meta de patrimônio em 10 anos', placeholder: 'ex: R$ 1.000.000', type: 'text', required: true },
      { name: 'risk_profile', label: 'Perfil de risco', placeholder: 'ex: arrojado', type: 'select', required: true, options: ['Conservador', 'Moderado', 'Arrojado', 'Agressivo'] }
    ],
    tags: ['patrimônio', 'riqueza', 'longo prazo', 'investimentos', 'metas'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-021',
    categoryId: 'personal-finance',
    title: 'Plano de Educação Financeira dos Filhos',
    description: 'Estratégia completa para ensinar finanças aos filhos',
    template: `Crie um plano de educação financeira para filhos:

Idade dos filhos: {children_ages}
Objetivo principal: {main_goal}
Renda familiar: {family_income}
Valor disponível para investir nos filhos: {investment_capacity}
Valores familiares: {family_values}

**PLANO DE EDUCAÇÃO FINANCEIRA INFANTIL:**

1. **Diagnóstico por Idade**
   - Fase de desenvolvimento de cada filho
   - Capacidade de compreensão
   - Interesses atuais
   - Abordagem recomendada

2. **Conceitos por Faixa Etária**
   
   **3-6 anos:**
   - Conceito de dinheiro
   - Trocar vs comprar
   - Esperar e poupar
   - Atividades lúdicas

   **7-11 anos:**
   - Mesada educativa
   - Escolhas e prioridades
   - Poupança com objetivo
   - Primeira conta bancária

   **12-17 anos:**
   - Orçamento pessoal
   - Investimentos básicos
   - Renda (trabalhos leves)
   - Consumo consciente

3. **Sistema de Mesada**
   - Valor adequado por idade
   - Frequência (semanal/mensal)
   - Regras de uso
   - Sistema de potes (gastar/poupar/doar)
   - Evolução progressiva

4. **Investimentos para os Filhos**
   - Tesouro Direto educacional
   - Previdência infantil
   - Carteira de ações educativa
   - Valor mensal sugerido
   - Envolvimento do filho

5. **Experiências Práticas**
   - Feirinha de trocas
   - Primeiro "negócio"
   - Acompanhar compras
   - Visita ao banco
   - Jogos educativos

6. **Conversa sobre Dinheiro**
   - Como abordar
   - Transparência adequada
   - Erros são aprendizado
   - Exemplo dos pais

7. **Recursos e Ferramentas**
   - Livros por idade
   - Apps educativos
   - Jogos recomendados
   - Conteúdo em vídeo

8. **Metas de Longo Prazo**
   - Faculdade
   - Primeiro carro
   - Intercâmbio
   - Primeiro apartamento
   - Planejamento financeiro`,
    variables: [
      { name: 'children_ages', label: 'Idade dos filhos', placeholder: 'ex: 8 anos e 12 anos', type: 'text', required: true },
      { name: 'main_goal', label: 'Objetivo principal', placeholder: 'ex: ensinar a poupar e investir', type: 'text', required: true },
      { name: 'family_income', label: 'Renda familiar', placeholder: 'ex: R$ 15.000', type: 'text', required: true },
      { name: 'investment_capacity', label: 'Valor para investir mensalmente nos filhos', placeholder: 'ex: R$ 500/mês por filho', type: 'text', required: true },
      { name: 'family_values', label: 'Valores familiares importantes', placeholder: 'ex: trabalho, gratidão, generosidade', type: 'text', required: true }
    ],
    tags: ['filhos', 'educação financeira', 'mesada', 'crianças', 'família'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-022',
    categoryId: 'personal-finance',
    title: 'Análise de Viabilidade para Morar Sozinho',
    description: 'Planejamento financeiro completo para sair de casa',
    template: `Faça uma análise de viabilidade para morar sozinho:

Renda atual: {current_income}
Despesas atuais: {current_expenses}
Economia atual: {savings}
Cidade onde pretende morar: {city}
Tipo de moradia desejada: {housing_type}
Prazo para sair de casa: {timeline}

**ANÁLISE PARA MORAR SOZINHO:**

1. **Viabilidade Financeira**
   - Renda mínima necessária
   - Sua renda é suficiente?
   - Gap a ser preenchido
   - Recomendação inicial

2. **Custo de Vida Estimado**
   - Aluguel (região/tipo)
   - Condomínio + IPTU
   - Contas (água, luz, gás, internet)
   - Alimentação
   - Transporte
   - Lazer e extras
   - Total mensal estimado

3. **Custos de Montagem**
   - Depósito e garantias
   - Móveis essenciais
   - Eletrodomésticos
   - Utensílios
   - Decoração básica
   - Total de setup

4. **Preparação Financeira**
   - Reserva de emergência (3-6 meses)
   - Fundo de montagem
   - Colchão de segurança
   - Prazo para juntar
   - Plano de acumulação

5. **Otimização de Custos**
   - Bairros mais em conta
   - Dividir apartamento
   - Móveis usados/doados
   - Negociação de aluguel
   - Economia mensal

6. **Documentação Necessária**
   - Para alugar
   - Para contratar serviços
   - Garantias locatícias
   - Checklist completo

7. **Orçamento do Primeiro Ano**
   - Mês a mês detalhado
   - Adaptação gradual
   - Margem para imprevistos
   - Evolução esperada

8. **Decisão e Próximos Passos**
   - Parecer: está pronto?
   - Se sim: cronograma de ação
   - Se não: o que falta
   - Alternativas a considerar`,
    variables: [
      { name: 'current_income', label: 'Renda mensal atual', placeholder: 'ex: R$ 5.000', type: 'text', required: true },
      { name: 'current_expenses', label: 'Despesas mensais atuais', placeholder: 'ex: R$ 2.000 (morando com pais)', type: 'text', required: true },
      { name: 'savings', label: 'Economia atual', placeholder: 'ex: R$ 20.000', type: 'text', required: true },
      { name: 'city', label: 'Cidade onde pretende morar', placeholder: 'ex: São Paulo - zona norte', type: 'text', required: true },
      { name: 'housing_type', label: 'Tipo de moradia desejada', placeholder: 'ex: apartamento 1 quarto', type: 'select', required: true, options: ['Kitnet/studio', 'Apartamento 1 quarto', 'Apartamento 2 quartos', 'Casa', 'República/dividido'] },
      { name: 'timeline', label: 'Prazo para sair de casa', placeholder: 'ex: 6 meses', type: 'text', required: true }
    ],
    tags: ['morar sozinho', 'aluguel', 'independência', 'primeiro apartamento', 'jovem'],
    difficulty: 'beginner',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-023',
    categoryId: 'personal-finance',
    title: 'Estratégia de Investimento em Ações',
    description: 'Plano completo para investir em renda variável',
    template: `Crie uma estratégia de investimento em ações para:

Capital para investir: {capital}
Aporte mensal: {monthly_investment}
Horizonte de investimento: {time_horizon}
Experiência com ações: {experience}
Tolerância a volatilidade: {volatility_tolerance}
Objetivo principal: {main_goal}

**ESTRATÉGIA DE INVESTIMENTO EM AÇÕES:**

1. **Fundamentos da Estratégia**
   - Filosofia de investimento
   - Buy and hold vs trading
   - Dividendos vs crescimento
   - Expectativa realista de retorno

2. **Educação e Preparação**
   - Conceitos essenciais
   - Análise fundamentalista básica
   - Leitura de demonstrativos
   - Indicadores importantes

3. **Perfil de Carteira**
   - Blue chips (estabilidade)
   - Mid caps (crescimento)
   - Small caps (potencial)
   - Setores defensivos vs cíclicos
   - Alocação recomendada

4. **Critérios de Seleção**
   - Lucro consistente
   - ROE adequado
   - Endividamento saudável
   - Dividend yield
   - Crescimento de receita
   - Governança corporativa

5. **Carteira Inicial Recomendada**
   - 10-15 ações sugeridas
   - Peso de cada ação
   - Justificativa
   - Preço-teto indicativo

6. **Estratégia de Aportes**
   - Dollar cost averaging
   - Quando comprar mais
   - Quando segurar
   - Rebalanceamento

7. **Gestão de Riscos**
   - Diversificação setorial
   - Exposição máxima por ação
   - Stop loss: usar ou não?
   - Proteção da carteira

8. **Acompanhamento e Evolução**
   - Indicadores a monitorar
   - Frequência de revisão
   - Quando vender
   - Evolução da estratégia`,
    variables: [
      { name: 'capital', label: 'Capital inicial para investir', placeholder: 'ex: R$ 30.000', type: 'text', required: true },
      { name: 'monthly_investment', label: 'Aporte mensal', placeholder: 'ex: R$ 2.000', type: 'text', required: true },
      { name: 'time_horizon', label: 'Horizonte de investimento', placeholder: 'ex: 10 anos', type: 'text', required: true },
      { name: 'experience', label: 'Experiência com ações', placeholder: 'ex: iniciante', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] },
      { name: 'volatility_tolerance', label: 'Tolerância a volatilidade', placeholder: 'ex: aceito quedas de até 30%', type: 'select', required: true, options: ['Baixa (até 10%)', 'Média (até 20%)', 'Alta (até 30%)', 'Muito alta (30%+)'] },
      { name: 'main_goal', label: 'Objetivo principal', placeholder: 'ex: crescimento de patrimônio', type: 'select', required: true, options: ['Dividendos/renda', 'Crescimento de patrimônio', 'Ambos'] }
    ],
    tags: ['ações', 'renda variável', 'bolsa', 'investimentos', 'carteira'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'fp-premium-024',
    categoryId: 'personal-finance',
    title: 'Planejamento Financeiro para Demissão/Transição',
    description: 'Estratégia para enfrentar período sem renda fixa',
    template: `Crie um planejamento financeiro para período de transição:

Situação: {situation}
Última renda: {last_income}
Reserva de emergência: {emergency_fund}
FGTS disponível: {fgts}
Despesas mensais: {monthly_expenses}
Perspectiva de recolocação: {reemployment_outlook}

**PLANEJAMENTO PARA TRANSIÇÃO DE CARREIRA:**

1. **Diagnóstico da Situação**
   - Recursos disponíveis
   - Tempo de autonomia financeira
   - Direitos trabalhistas
   - Urgência de recolocação

2. **Verbas Rescisórias**
   - Saldo de salário
   - Férias + 1/3
   - 13° proporcional
   - Multa FGTS (40%)
   - Aviso prévio
   - Total esperado

3. **Gestão do FGTS**
   - Valor disponível
   - Quando sacar
   - Onde aplicar
   - Reserva estratégica

4. **Seguro-Desemprego**
   - Direito a quantas parcelas
   - Valor de cada parcela
   - Datas de recebimento
   - Prazo para dar entrada

5. **Ajuste de Despesas**
   - Modo economia
   - Cortes prioritários
   - Negociação de dívidas
   - Novo orçamento mensal

6. **Estratégia da Reserva**
   - Uso racionado
   - Priorização
   - Alocação durante a crise
   - Preservação de capital

7. **Geração de Renda Temporária**
   - Freelances e bicos
   - Monetização de habilidades
   - Venda de itens
   - Renda extra realista

8. **Plano de Recolocação**
   - Prazo estimado
   - Ações semanais
   - Investimento em capacitação
   - Rede de contatos
   - Quando aceitar proposta menor`,
    variables: [
      { name: 'situation', label: 'Situação atual', placeholder: 'ex: demitido sem justa causa', type: 'select', required: true, options: ['Demitido sem justa causa', 'Pediu demissão', 'Acordo mútuo', 'Contrato encerrado', 'Transição voluntária'] },
      { name: 'last_income', label: 'Última renda mensal', placeholder: 'ex: R$ 8.000', type: 'text', required: true },
      { name: 'emergency_fund', label: 'Reserva de emergência disponível', placeholder: 'ex: R$ 30.000', type: 'text', required: true },
      { name: 'fgts', label: 'FGTS disponível', placeholder: 'ex: R$ 25.000', type: 'text', required: true },
      { name: 'monthly_expenses', label: 'Despesas mensais essenciais', placeholder: 'ex: R$ 5.000', type: 'text', required: true },
      { name: 'reemployment_outlook', label: 'Perspectiva de recolocação', placeholder: 'ex: área aquecida, 2-3 meses', type: 'select', required: true, options: ['Rápida (1-2 meses)', 'Média (3-6 meses)', 'Demorada (6+ meses)', 'Incerta'] }
    ],
    tags: ['demissão', 'transição', 'desemprego', 'FGTS', 'emergência'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'fp-premium-025',
    categoryId: 'personal-finance',
    title: 'Estratégia Financeira para Empreender',
    description: 'Planejamento financeiro para abrir um negócio',
    template: `Crie uma estratégia financeira para empreender:

Ideia de negócio: {business_idea}
Capital disponível para investir: {available_capital}
Renda atual (emprego): {current_income}
Reserva pessoal: {personal_reserve}
Tempo para dedicar: {available_time}
Dependentes: {dependents}

**ESTRATÉGIA FINANCEIRA PARA EMPREENDER:**

1. **Análise de Viabilidade Pessoal**
   - Você está preparado financeiramente?
   - Colchão de segurança pessoal
   - Tempo para breakeven
   - Risco tolerável

2. **Preparação Pré-Abertura**
   - Reserva pessoal recomendada
   - Plano enquanto ainda empregado
   - Timeline de transição
   - Quando pedir demissão

3. **Capital Necessário**
   - Investimento inicial
   - Capital de giro (6-12 meses)
   - Reserva para imprevistos
   - Total recomendado

4. **Fontes de Capital**
   - Recursos próprios
   - Sócios investidores
   - Família e amigos
   - Financiamentos
   - Prós e contras de cada

5. **Separação PF x PJ**
   - Contas separadas
   - Pró-labore definido
   - Retiradas controladas
   - Nunca misturar

6. **Pró-labore x Lucro**
   - Quando começar a retirar
   - Valor inicial prudente
   - Evolução gradual
   - Reinvestimento

7. **Cenários e Contingências**
   - Cenário otimista
   - Cenário realista
   - Cenário pessimista
   - Plano B pessoal

8. **Proteções Essenciais**
   - Manter INSS pessoal
   - Seguro de vida
   - Reserva pessoal intocável
   - Acordo conjugal (se aplicável)`,
    variables: [
      { name: 'business_idea', label: 'Ideia de negócio', placeholder: 'ex: loja de roupas online', type: 'text', required: true },
      { name: 'available_capital', label: 'Capital disponível para investir', placeholder: 'ex: R$ 50.000', type: 'text', required: true },
      { name: 'current_income', label: 'Renda atual do emprego', placeholder: 'ex: R$ 10.000', type: 'text', required: true },
      { name: 'personal_reserve', label: 'Reserva pessoal (fora do negócio)', placeholder: 'ex: R$ 60.000', type: 'text', required: true },
      { name: 'available_time', label: 'Tempo disponível para o negócio', placeholder: 'ex: full-time após sair do emprego', type: 'select', required: true, options: ['Tempo integral desde já', 'Part-time + emprego', 'Full-time após transição', 'Fins de semana'] },
      { name: 'dependents', label: 'Dependentes financeiros', placeholder: 'ex: cônjuge e 1 filho', type: 'text', required: true }
    ],
    tags: ['empreendedorismo', 'negócio', 'startup', 'MEI', 'transição'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  // ==================== CRIAÇÃO DE PRODUTOS (25 prompts) ====================

  {
    id: 'pc-premium-001',
    categoryId: 'product-creation',
    title: 'Blueprint de Curso Online Completo',
    description: 'Estrutura detalhada para criar um curso online de sucesso',
    template: `Crie um blueprint completo de curso online sobre:

Tema do curso: {course_topic}
Público-alvo: {target_audience}
Nível do aluno: {student_level}
Transformação prometida: {transformation}
Duração estimada: {duration}
Preço pretendido: {price}

**BLUEPRINT DO CURSO ONLINE:**

1. **Pesquisa e Validação**
   - Análise da demanda
   - Concorrência existente
   - Diferenciais do seu curso
   - Validação da ideia
   - Proposta de valor única

2. **Estrutura do Curso**
   - Jornada do aluno
   - Módulos principais (8-12)
   - Aulas por módulo (4-8)
   - Duração de cada aula
   - Sequência lógica

3. **Detalhamento dos Módulos**
   
   **Módulo 1: [Nome]**
   - Objetivo do módulo
   - Aulas e conteúdos
   - Materiais de apoio
   - Exercício prático
   
   [Repetir para todos os módulos]

4. **Materiais Complementares**
   - PDFs e checklists
   - Templates e planilhas
   - Scripts e modelos
   - Recursos extras
   - Comunidade/suporte

5. **Produção de Conteúdo**
   - Formato das aulas
   - Equipamentos necessários
   - Roteiro de gravação
   - Edição e pós-produção
   - Timeline de produção

6. **Plataforma e Tecnologia**
   - Hospedagem do curso
   - Sistema de pagamento
   - Área de membros
   - Automações
   - Integrações

7. **Estratégia de Lançamento**
   - Pré-lançamento
   - Captação de leads
   - Sequência de emails
   - Webinário/aula ao vivo
   - Abertura de carrinho

8. **Pós-Venda e Escalabilidade**
   - Onboarding do aluno
   - Suporte e comunidade
   - Upsells e cross-sells
   - Atualizações do curso
   - Métricas de sucesso`,
    variables: [
      { name: 'course_topic', label: 'Tema do curso', placeholder: 'ex: marketing digital para iniciantes', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: empreendedores que querem vender online', type: 'text', required: true },
      { name: 'student_level', label: 'Nível do aluno', placeholder: 'ex: iniciante', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] },
      { name: 'transformation', label: 'Transformação prometida', placeholder: 'ex: sair de 0 para primeiras vendas em 30 dias', type: 'text', required: true },
      { name: 'duration', label: 'Duração estimada do curso', placeholder: 'ex: 20 horas de conteúdo', type: 'text', required: true },
      { name: 'price', label: 'Preço pretendido', placeholder: 'ex: R$ 497', type: 'text', required: true }
    ],
    tags: ['curso online', 'infoproduto', 'educação', 'lançamento', 'estrutura'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-002',
    categoryId: 'product-creation',
    title: 'Plano de Criação de E-book Profissional',
    description: 'Guia completo para escrever e vender e-books',
    template: `Crie um plano de e-book profissional sobre:

Tema do e-book: {ebook_topic}
Público-alvo: {target_audience}
Problema que resolve: {problem}
Extensão planejada: {length}
Objetivo (venda/isca): {goal}
Prazo de criação: {deadline}

**PLANO DE CRIAÇÃO DO E-BOOK:**

1. **Pesquisa e Planejamento**
   - Validação do tema
   - Análise de concorrentes
   - Ângulo diferenciado
   - Promessa principal
   - Big idea do e-book

2. **Estrutura do Conteúdo**
   - Título magnético (5 opções)
   - Subtítulo explicativo
   - Capítulos principais (8-12)
   - Subcapítulos
   - Fluxo de leitura

3. **Outline Detalhado**
   
   **Introdução**
   - Gancho inicial
   - Promessa
   - Sobre o autor
   
   **Capítulo 1: [Nome]**
   - Objetivo
   - Pontos principais
   - Exemplos/cases
   - Exercício/ação
   
   [Repetir para todos os capítulos]
   
   **Conclusão**
   - Recapitulação
   - Próximos passos
   - CTA final

4. **Produção do Conteúdo**
   - Cronograma de escrita
   - Meta diária de palavras
   - Fontes de pesquisa
   - Citações e dados
   - Revisão e edição

5. **Design e Formatação**
   - Capa profissional
   - Layout interno
   - Elementos visuais
   - Tipografia
   - Cores e estilo

6. **Elementos de Valor**
   - Checklists
   - Templates
   - Exercícios
   - Recursos extras
   - Bônus complementares

7. **Publicação e Distribuição**
   - Formatos (PDF/ePub)
   - Plataformas
   - Preço (se for venda)
   - Página de vendas
   - Entrega automática

8. **Estratégia de Promoção**
   - Lançamento
   - Tráfego/divulgação
   - Parcerias
   - Reviews e depoimentos
   - Escalabilidade`,
    variables: [
      { name: 'ebook_topic', label: 'Tema do e-book', placeholder: 'ex: produtividade para empreendedores', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: profissionais que trabalham de casa', type: 'text', required: true },
      { name: 'problem', label: 'Problema que resolve', placeholder: 'ex: procrastinação e falta de foco', type: 'text', required: true },
      { name: 'length', label: 'Extensão planejada', placeholder: 'ex: 80-100 páginas', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo do e-book', placeholder: 'ex: venda direta', type: 'select', required: true, options: ['Venda direta', 'Isca digital (lead magnet)', 'Bônus de curso', 'Autoridade/branding'] },
      { name: 'deadline', label: 'Prazo para criação', placeholder: 'ex: 30 dias', type: 'text', required: true }
    ],
    tags: ['e-book', 'escrita', 'infoproduto', 'digital', 'conteúdo'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-003',
    categoryId: 'product-creation',
    title: 'Estratégia de Lançamento de Produto Digital',
    description: 'Plano completo de lançamento para infoprodutos',
    template: `Crie uma estratégia de lançamento para:

Produto: {product}
Tipo de produto: {product_type}
Público-alvo: {target_audience}
Tamanho da audiência atual: {audience_size}
Preço do produto: {price}
Data de lançamento: {launch_date}

**ESTRATÉGIA DE LANÇAMENTO:**

1. **Pré-Pré-Lançamento (30-60 dias antes)**
   - Construção de audiência
   - Conteúdo de aquecimento
   - Identificação de dores
   - Pesquisas e enquetes
   - Lista de espera

2. **Pré-Lançamento (14-30 dias antes)**
   - CPL (Conteúdo de Pré-Lançamento)
   - Vídeo/aula 1: Oportunidade
   - Vídeo/aula 2: Transformação
   - Vídeo/aula 3: Método
   - Antecipação do carrinho

3. **Evento de Lançamento**
   - Webinário ou live
   - Roteiro de vendas
   - Oferta irresistível
   - Bônus especiais
   - Abertura do carrinho

4. **Carrinho Aberto (5-7 dias)**
   - Sequência de emails
   - Dia 1: Abertura
   - Dia 2-3: Provas/resultados
   - Dia 4-5: Objeções
   - Dia 6-7: Urgência/escassez

5. **Comunicação Multicanal**
   - Emails (sequência completa)
   - WhatsApp/Telegram
   - Stories e Reels
   - Lives de Q&A
   - Remarketing

6. **Prova Social e Gatilhos**
   - Depoimentos
   - Resultados de alunos
   - Escassez real
   - Bônus por tempo
   - Garantia

7. **Fechamento do Carrinho**
   - Últimas 48h
   - Últimas 24h
   - Últimas horas
   - Contagem regressiva
   - Despedida

8. **Pós-Lançamento**
   - Onboarding dos novos clientes
   - Análise de métricas
   - Reengajamento de não-compradores
   - Planejamento do próximo lançamento
   - Evergreen (perpétuo)`,
    variables: [
      { name: 'product', label: 'Nome do produto', placeholder: 'ex: Método XYZ de Vendas', type: 'text', required: true },
      { name: 'product_type', label: 'Tipo de produto', placeholder: 'ex: curso online', type: 'select', required: true, options: ['Curso online', 'Mentoria', 'Comunidade', 'E-book', 'Template/ferramenta'] },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: empreendedores digitais', type: 'text', required: true },
      { name: 'audience_size', label: 'Tamanho da audiência atual', placeholder: 'ex: 5.000 seguidores, 2.000 emails', type: 'text', required: true },
      { name: 'price', label: 'Preço do produto', placeholder: 'ex: R$ 997', type: 'text', required: true },
      { name: 'launch_date', label: 'Data prevista de lançamento', placeholder: 'ex: março 2025', type: 'text', required: true }
    ],
    tags: ['lançamento', 'infoproduto', 'vendas', 'marketing', 'webinário'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-004',
    categoryId: 'product-creation',
    title: 'Criação de Programa de Mentoria',
    description: 'Estrutura completa para criar e vender mentoria',
    template: `Crie um programa de mentoria sobre:

Área de expertise: {expertise}
Transformação oferecida: {transformation}
Público ideal: {ideal_client}
Formato pretendido: {format}
Duração do programa: {duration}
Investimento: {price}

**PROGRAMA DE MENTORIA COMPLETO:**

1. **Posicionamento da Mentoria**
   - Proposta de valor única
   - Diferencial competitivo
   - Por que você é o mentor ideal
   - Resultados que entrega
   - Promessa central

2. **Estrutura do Programa**
   - Formato (grupo/individual)
   - Duração total
   - Frequência de encontros
   - Canais de comunicação
   - Suporte entre sessões

3. **Metodologia de Trabalho**
   
   **Fase 1: Diagnóstico (Semana 1)**
   - Análise inicial
   - Definição de metas
   - Plano personalizado
   
   **Fase 2: Implementação (Semanas 2-8)**
   - Sessões semanais
   - Tarefas práticas
   - Acompanhamento
   
   **Fase 3: Aceleração (Semanas 9-12)**
   - Otimização
   - Escalabilidade
   - Autonomia

4. **Entregáveis**
   - Sessões ao vivo
   - Gravações
   - Materiais exclusivos
   - Templates e frameworks
   - Acesso a comunidade

5. **Processo de Seleção**
   - Formulário de aplicação
   - Call de qualificação
   - Critérios de aceite
   - Onboarding do mentorado

6. **Precificação e Condições**
   - Ticket do programa
   - Formas de pagamento
   - Política de reembolso
   - Renovação/continuidade

7. **Vendas e Marketing**
   - Página de vendas
   - Sequência de emails
   - Conteúdo de atração
   - Cases e depoimentos
   - Funil de vendas

8. **Gestão e Escalabilidade**
   - Ferramentas necessárias
   - Gestão de agenda
   - Limite de mentorados
   - Evolução do programa
   - Equipe de suporte`,
    variables: [
      { name: 'expertise', label: 'Área de expertise', placeholder: 'ex: marketing digital para coaches', type: 'text', required: true },
      { name: 'transformation', label: 'Transformação oferecida', placeholder: 'ex: de 0 a 100k/mês em 6 meses', type: 'text', required: true },
      { name: 'ideal_client', label: 'Cliente ideal', placeholder: 'ex: coaches que já têm método mas não sabem vender', type: 'text', required: true },
      { name: 'format', label: 'Formato pretendido', placeholder: 'ex: grupo pequeno (10 pessoas)', type: 'select', required: true, options: ['Individual (1:1)', 'Grupo pequeno (até 10)', 'Grupo médio (10-30)', 'Mastermind (até 20)'] },
      { name: 'duration', label: 'Duração do programa', placeholder: 'ex: 3 meses', type: 'text', required: true },
      { name: 'price', label: 'Investimento', placeholder: 'ex: R$ 5.000', type: 'text', required: true }
    ],
    tags: ['mentoria', 'coaching', 'high ticket', 'transformação', 'programa'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-005',
    categoryId: 'product-creation',
    title: 'Plano de Podcast de Sucesso',
    description: 'Estratégia completa para criar e monetizar podcast',
    template: `Crie um plano de podcast sobre:

Tema central: {topic}
Público-alvo: {target_audience}
Formato pretendido: {format}
Frequência: {frequency}
Objetivo principal: {main_goal}
Equipamento disponível: {equipment}

**PLANO DE PODCAST:**

1. **Conceito e Posicionamento**
   - Nome do podcast (5 opções)
   - Tagline/slogan
   - Proposta de valor
   - Tom e personalidade
   - Diferencial no mercado

2. **Estrutura dos Episódios**
   - Formato padrão
   - Duração ideal
   - Vinheta e música
   - Roteiro base
   - Chamadas para ação

3. **Planejamento de Conteúdo**
   - Pilares temáticos
   - Banco de pautas (50+)
   - Calendário de gravação
   - Episódios especiais
   - Séries temáticas

4. **Produção Técnica**
   - Equipamentos
   - Software de gravação
   - Edição e pós-produção
   - Arte e identidade visual
   - Hospedagem

5. **Distribuição**
   - Spotify
   - Apple Podcasts
   - Google Podcasts
   - YouTube (versão vídeo)
   - Outras plataformas

6. **Crescimento de Audiência**
   - SEO para podcasts
   - Divulgação nas redes
   - Participação em outros podcasts
   - Parcerias estratégicas
   - Comunidade de ouvintes

7. **Monetização**
   - Patrocinadores
   - Produtos próprios
   - Afiliados
   - Conteúdo exclusivo
   - Eventos e meetups

8. **Métricas e Evolução**
   - Downloads/streams
   - Taxa de conclusão
   - Reviews e ratings
   - Crescimento
   - Metas mensais`,
    variables: [
      { name: 'topic', label: 'Tema central', placeholder: 'ex: empreendedorismo para mulheres', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: mulheres 25-45 que querem empreender', type: 'text', required: true },
      { name: 'format', label: 'Formato pretendido', placeholder: 'ex: entrevistas', type: 'select', required: true, options: ['Solo', 'Entrevistas', 'Co-host (dupla)', 'Mesa redonda', 'Storytelling'] },
      { name: 'frequency', label: 'Frequência de episódios', placeholder: 'ex: semanal', type: 'select', required: true, options: ['Diário', 'Semanal', 'Quinzenal', 'Mensal'] },
      { name: 'main_goal', label: 'Objetivo principal', placeholder: 'ex: autoridade e vendas do curso', type: 'select', required: true, options: ['Autoridade/branding', 'Vendas de produtos', 'Patrocínios', 'Networking', 'Hobby/prazer'] },
      { name: 'equipment', label: 'Equipamento disponível', placeholder: 'ex: microfone USB básico', type: 'text', required: true }
    ],
    tags: ['podcast', 'áudio', 'conteúdo', 'audiência', 'monetização'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-006',
    categoryId: 'product-creation',
    title: 'Criação de Canal no YouTube',
    description: 'Estratégia completa para crescer no YouTube',
    template: `Crie uma estratégia de YouTube para:

Nicho: {niche}
Público-alvo: {target_audience}
Objetivo do canal: {channel_goal}
Frequência de postagem: {frequency}
Estilo de vídeo: {video_style}
Experiência com vídeo: {experience}

**ESTRATÉGIA DE YOUTUBE:**

1. **Conceito do Canal**
   - Nome do canal (5 opções)
   - Proposta de valor
   - Posicionamento único
   - Avatar do inscrito ideal
   - Promessa do canal

2. **Identidade Visual**
   - Logo e banner
   - Thumbnail padrão
   - Cores e fontes
   - Vinheta e encerramento
   - Consistência visual

3. **Estratégia de Conteúdo**
   - Pilares de conteúdo
   - Tipos de vídeo:
     - Tutoriais/how-to
     - Vlogs/bastidores
     - Reviews/opiniões
     - Entrevistas
     - Shorts
   - Proporção de cada tipo

4. **SEO para YouTube**
   - Pesquisa de palavras-chave
   - Títulos otimizados
   - Descrições estratégicas
   - Tags relevantes
   - CTR de thumbnails

5. **Produção de Conteúdo**
   - Equipamentos necessários
   - Setup de gravação
   - Iluminação
   - Roteiro e teleprompter
   - Edição (software e estilo)

6. **Planejamento Editorial**
   - Banco de ideias (100+)
   - Calendário mensal
   - Datas especiais
   - Trends e atualidades
   - Séries e playlists

7. **Crescimento e Engajamento**
   - Primeiros 1.000 inscritos
   - Algoritmo do YouTube
   - Comunidade e comentários
   - Collabs e participações
   - Chamadas para ação

8. **Monetização**
   - Programa de Parcerias
   - Patrocínios e merchans
   - Produtos próprios
   - Super Chat e membros
   - Funil para outros produtos`,
    variables: [
      { name: 'niche', label: 'Nicho do canal', placeholder: 'ex: finanças pessoais', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: jovens 20-35 que querem investir', type: 'text', required: true },
      { name: 'channel_goal', label: 'Objetivo do canal', placeholder: 'ex: educar e vender curso', type: 'select', required: true, options: ['Monetização AdSense', 'Vender produtos próprios', 'Autoridade/branding', 'Patrocínios', 'Diversão/hobby'] },
      { name: 'frequency', label: 'Frequência de postagem', placeholder: 'ex: 2x por semana', type: 'select', required: true, options: ['Diário', '3x por semana', '2x por semana', 'Semanal', 'Quinzenal'] },
      { name: 'video_style', label: 'Estilo de vídeo', placeholder: 'ex: educativo com animações', type: 'text', required: true },
      { name: 'experience', label: 'Experiência com vídeo', placeholder: 'ex: iniciante', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] }
    ],
    tags: ['YouTube', 'vídeo', 'conteúdo', 'monetização', 'crescimento'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-007',
    categoryId: 'product-creation',
    title: 'Plano de Comunidade Paga',
    description: 'Estrutura para criar e gerir comunidade de membros',
    template: `Crie um plano de comunidade paga sobre:

Tema da comunidade: {topic}
Público-alvo: {target_audience}
Proposta de valor: {value_prop}
Plataforma: {platform}
Modelo de cobrança: {pricing_model}
Meta de membros: {member_goal}

**PLANO DE COMUNIDADE PAGA:**

1. **Conceito e Posicionamento**
   - Nome da comunidade
   - Missão e visão
   - Proposta de valor única
   - Diferencial vs alternativas gratuitas
   - Cultura e valores

2. **Entregáveis para Membros**
   - Conteúdo exclusivo
   - Encontros ao vivo
   - Networking estruturado
   - Recursos e templates
   - Suporte e mentoria

3. **Estrutura de Conteúdo**
   
   **Semanal:**
   - Posts diários
   - Q&A semanal
   - Conteúdo exclusivo
   
   **Mensal:**
   - Workshop ao vivo
   - Membro destaque
   - Desafio do mês
   
   **Trimestral:**
   - Evento especial
   - Bônus extra

4. **Engajamento e Retenção**
   - Onboarding de novos membros
   - Gamificação
   - Reconhecimento
   - Desafios e metas
   - Networking facilitado

5. **Tecnologia e Plataforma**
   - Plataforma principal
   - Integrações necessárias
   - App/acesso mobile
   - Automações
   - Métricas e analytics

6. **Precificação**
   - Modelo de assinatura
   - Níveis/tiers
   - Trial/teste gratuito
   - Desconto anual
   - Política de cancelamento

7. **Aquisição de Membros**
   - Funil de entrada
   - Conteúdo de atração
   - Webinários/eventos abertos
   - Indicação de membros
   - Parcerias estratégicas

8. **Gestão e Operação**
   - Time necessário
   - Moderação
   - Calendário operacional
   - Métricas-chave
   - Evolução e escala`,
    variables: [
      { name: 'topic', label: 'Tema da comunidade', placeholder: 'ex: investimentos em criptomoedas', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: investidores iniciantes em cripto', type: 'text', required: true },
      { name: 'value_prop', label: 'Proposta de valor central', placeholder: 'ex: acesso a análises e alertas diários', type: 'text', required: true },
      { name: 'platform', label: 'Plataforma preferida', placeholder: 'ex: Discord', type: 'select', required: true, options: ['Discord', 'Telegram', 'Circle', 'Skool', 'Slack', 'Outra'] },
      { name: 'pricing_model', label: 'Modelo de cobrança', placeholder: 'ex: R$ 97/mês', type: 'text', required: true },
      { name: 'member_goal', label: 'Meta de membros', placeholder: 'ex: 500 membros ativos', type: 'text', required: true }
    ],
    tags: ['comunidade', 'membership', 'recorrência', 'engajamento', 'SaaS'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-008',
    categoryId: 'product-creation',
    title: 'Criação de Templates e Recursos Digitais',
    description: 'Plano para criar e vender templates, planilhas e recursos',
    template: `Crie um plano de produtos digitais (templates) para:

Tipo de recurso: {resource_type}
Nicho/área: {niche}
Problema que resolve: {problem}
Ferramenta utilizada: {tool}
Público-alvo: {target_audience}
Faixa de preço: {price_range}

**PLANO DE TEMPLATES/RECURSOS:**

1. **Pesquisa de Mercado**
   - Demanda existente
   - Concorrência e preços
   - Gaps de mercado
   - Tendências
   - Oportunidades identificadas

2. **Linha de Produtos**
   - Produto principal (hero)
   - Produtos complementares
   - Bundle/pacotes
   - Versões (básica/pro)
   - Roadmap de lançamentos

3. **Criação do Produto Hero**
   
   **Especificações:**
   - Funcionalidades principais
   - Diferenciais
   - Nível de customização
   - Compatibilidade
   
   **Design:**
   - Estilo visual
   - Organização
   - Facilidade de uso
   - Documentação

4. **Produção e Qualidade**
   - Processo de criação
   - Testes de funcionalidade
   - Feedback beta testers
   - Iterações
   - Versão final

5. **Entregáveis Complementares**
   - Tutorial de uso
   - Vídeo walkthrough
   - FAQ
   - Suporte básico
   - Atualizações futuras

6. **Plataformas de Venda**
   - Gumroad
   - Hotmart
   - Site próprio
   - Marketplaces (Etsy, Creative Market)
   - Comparativo e escolha

7. **Precificação Estratégica**
   - Custo de produção
   - Valor percebido
   - Preços da concorrência
   - Testes de preço
   - Descontos e promoções

8. **Marketing e Vendas**
   - Página de vendas
   - Redes sociais
   - SEO (Pinterest, Google)
   - Email marketing
   - Parcerias e afiliados`,
    variables: [
      { name: 'resource_type', label: 'Tipo de recurso', placeholder: 'ex: planilha de orçamento', type: 'select', required: true, options: ['Planilha Excel/Sheets', 'Template Notion', 'Template Canva', 'Template PowerPoint', 'Preset/filtro', 'Código/plugin', 'Outro'] },
      { name: 'niche', label: 'Nicho/área', placeholder: 'ex: finanças pessoais', type: 'text', required: true },
      { name: 'problem', label: 'Problema que resolve', placeholder: 'ex: organizar gastos e investimentos', type: 'text', required: true },
      { name: 'tool', label: 'Ferramenta utilizada', placeholder: 'ex: Google Sheets', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: pessoas que querem organizar finanças', type: 'text', required: true },
      { name: 'price_range', label: 'Faixa de preço', placeholder: 'ex: R$ 47-97', type: 'text', required: true }
    ],
    tags: ['templates', 'planilhas', 'recursos digitais', 'Notion', 'Canva'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-009',
    categoryId: 'product-creation',
    title: 'Plano de Newsletter Monetizada',
    description: 'Estratégia para criar newsletter com receita recorrente',
    template: `Crie um plano de newsletter monetizada sobre:

Tema central: {topic}
Público-alvo: {target_audience}
Frequência: {frequency}
Modelo de monetização: {monetization}
Meta de inscritos: {subscriber_goal}
Experiência com escrita: {writing_experience}

**PLANO DE NEWSLETTER:**

1. **Conceito e Posicionamento**
   - Nome da newsletter
   - Proposta de valor única
   - O que o leitor ganha
   - Tom e estilo
   - Diferencial competitivo

2. **Estrutura de Cada Edição**
   - Formato padrão
   - Seções fixas
   - Seções rotativas
   - Extensão ideal
   - CTA principal

3. **Planejamento de Conteúdo**
   - Pilares temáticos
   - Banco de pautas
   - Curadoria de fontes
   - Conteúdo original vs curado
   - Calendário editorial

4. **Crescimento de Lista**
   
   **Fase 1: 0 a 1.000 inscritos**
   - Rede pessoal
   - Redes sociais
   - Lead magnets
   - Cross-promotion
   
   **Fase 2: 1.000 a 10.000**
   - SEO de newsletter
   - Parcerias
   - Recomendações
   - Ads (opcional)

5. **Plataforma e Tecnologia**
   - Ferramenta de envio
   - Landing page
   - Automações
   - Analytics
   - Segmentação

6. **Monetização**
   
   **Gratuita com:**
   - Patrocinadores
   - Afiliados
   - Produtos próprios
   - Leads para serviços
   
   **Paga:**
   - Conteúdo premium
   - Níveis de assinatura
   - Comunidade exclusiva

7. **Engajamento e Retenção**
   - Taxa de abertura ideal
   - Cliques
   - Respostas/interação
   - Reduzir cancelamentos
   - Reativação de inativos

8. **Escala e Evolução**
   - Métricas-chave
   - Monetização crescente
   - Time e delegação
   - Produtos derivados
   - Metas de 12 meses`,
    variables: [
      { name: 'topic', label: 'Tema central', placeholder: 'ex: tendências de tecnologia', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: profissionais de tech', type: 'text', required: true },
      { name: 'frequency', label: 'Frequência de envio', placeholder: 'ex: semanal', type: 'select', required: true, options: ['Diária', '3x por semana', 'Semanal', 'Quinzenal', 'Mensal'] },
      { name: 'monetization', label: 'Modelo de monetização principal', placeholder: 'ex: patrocinadores', type: 'select', required: true, options: ['Patrocinadores', 'Assinatura paga', 'Afiliados', 'Produtos próprios', 'Híbrido'] },
      { name: 'subscriber_goal', label: 'Meta de inscritos (12 meses)', placeholder: 'ex: 10.000', type: 'text', required: true },
      { name: 'writing_experience', label: 'Experiência com escrita', placeholder: 'ex: intermediário', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado'] }
    ],
    tags: ['newsletter', 'email', 'substack', 'conteúdo', 'monetização'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-010',
    categoryId: 'product-creation',
    title: 'Criação de SaaS/Ferramenta Digital',
    description: 'Plano para desenvolver e lançar uma ferramenta SaaS',
    template: `Crie um plano de SaaS para:

Ideia do produto: {product_idea}
Problema que resolve: {problem}
Público-alvo: {target_audience}
Modelo de negócio: {business_model}
Conhecimento técnico: {technical_level}
Budget disponível: {budget}

**PLANO DE DESENVOLVIMENTO SAAS:**

1. **Validação da Ideia**
   - Pesquisa de mercado
   - Concorrência existente
   - Diferencial competitivo
   - TAM/SAM/SOM
   - MVP mínimo viável

2. **Definição do Produto**
   - Features core (v1.0)
   - Features nice-to-have (v2.0+)
   - User stories principais
   - Jornada do usuário
   - UX/UI básico

3. **Modelo de Negócio**
   - Precificação
   - Planos e tiers
   - Freemium vs trial
   - Métricas de viabilidade
   - Unit economics

4. **Desenvolvimento**
   
   **Opção 1: No-code**
   - Ferramentas indicadas
   - Limitações
   - Custos
   - Timeline
   
   **Opção 2: Low-code**
   - Plataformas
   - Custos
   - Timeline
   
   **Opção 3: Desenvolvimento tradicional**
   - Stack sugerido
   - Custo de desenvolvimento
   - Time necessário
   - Timeline

5. **Infraestrutura**
   - Hospedagem
   - Banco de dados
   - Segurança
   - Escalabilidade
   - Custos mensais

6. **Go-to-Market**
   - Estratégia de lançamento
   - Early adopters
   - Pricing de entrada
   - Canais de aquisição
   - Conteúdo/marketing

7. **Métricas Essenciais**
   - MRR/ARR
   - Churn rate
   - CAC
   - LTV
   - NPS

8. **Roadmap de 12 Meses**
   - Mês 1-3: MVP
   - Mês 4-6: Lançamento beta
   - Mês 7-9: Iteração
   - Mês 10-12: Escala`,
    variables: [
      { name: 'product_idea', label: 'Ideia do produto', placeholder: 'ex: ferramenta de gestão de tarefas para freelancers', type: 'text', required: true },
      { name: 'problem', label: 'Problema que resolve', placeholder: 'ex: freelancers perdem tempo organizando projetos', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: freelancers e autônomos', type: 'text', required: true },
      { name: 'business_model', label: 'Modelo de negócio', placeholder: 'ex: assinatura mensal', type: 'select', required: true, options: ['Assinatura mensal', 'Assinatura anual', 'Freemium', 'Pay-per-use', 'Lifetime'] },
      { name: 'technical_level', label: 'Conhecimento técnico', placeholder: 'ex: básico', type: 'select', required: true, options: ['Nenhum (precisará contratar)', 'Básico (pode usar no-code)', 'Intermediário (low-code)', 'Avançado (pode programar)'] },
      { name: 'budget', label: 'Budget disponível para MVP', placeholder: 'ex: R$ 20.000', type: 'text', required: true }
    ],
    tags: ['SaaS', 'produto', 'startup', 'tecnologia', 'MVP'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-011',
    categoryId: 'product-creation',
    title: 'Plano de Workshop/Evento Online',
    description: 'Estrutura completa para criar workshops rentáveis',
    template: `Crie um plano de workshop/evento online sobre:

Tema do workshop: {topic}
Público-alvo: {target_audience}
Duração: {duration}
Formato: {format}
Transformação prometida: {transformation}
Preço: {price}

**PLANO DE WORKSHOP ONLINE:**

1. **Conceito e Promessa**
   - Nome do workshop (5 opções)
   - Promessa principal
   - O que o participante sai sabendo fazer
   - Diferencial vs cursos
   - Por que ao vivo

2. **Estrutura do Conteúdo**
   
   **Bloco 1: Contexto (30min)**
   - Abertura e conexão
   - Problema e oportunidade
   - Overview do método
   
   **Bloco 2: Conteúdo Core (2-3h)**
   - Passo 1: [tema]
   - Passo 2: [tema]
   - Passo 3: [tema]
   - Exercícios práticos
   
   **Bloco 3: Fechamento (30min)**
   - Recapitulação
   - Próximos passos
   - Q&A
   - Oferta (se houver)

3. **Materiais de Apoio**
   - Slides/apresentação
   - Workbook/apostila
   - Templates práticos
   - Gravação
   - Certificado

4. **Tecnologia**
   - Plataforma de transmissão
   - Interação/chat
   - Breakout rooms (se aplicável)
   - Pagamento e inscrição
   - Entrega de materiais

5. **Lançamento e Vendas**
   - Página de vendas
   - Sequência de emails
   - Redes sociais
   - Early bird
   - Últimas vagas

6. **Experiência do Participante**
   - Pré-workshop (preparo)
   - Durante (engajamento)
   - Pós (acompanhamento)
   - Comunidade
   - Suporte

7. **Monetização Adicional**
   - Upsell para programa maior
   - Mentoria pós-workshop
   - Recursos complementares
   - Próximos workshops
   - Pacotes

8. **Métricas e Otimização**
   - Taxa de comparecimento
   - Engajamento
   - NPS
   - Conversões (se houver upsell)
   - Iterações para próximas edições`,
    variables: [
      { name: 'topic', label: 'Tema do workshop', placeholder: 'ex: como criar seu primeiro infoproduto', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: profissionais que querem criar renda extra', type: 'text', required: true },
      { name: 'duration', label: 'Duração total', placeholder: 'ex: 4 horas', type: 'text', required: true },
      { name: 'format', label: 'Formato', placeholder: 'ex: ao vivo via Zoom', type: 'select', required: true, options: ['Ao vivo único', 'Ao vivo (múltiplos dias)', 'Gravado + Q&A ao vivo', '100% gravado'] },
      { name: 'transformation', label: 'Transformação prometida', placeholder: 'ex: sair com esboço do produto pronto', type: 'text', required: true },
      { name: 'price', label: 'Preço do workshop', placeholder: 'ex: R$ 197', type: 'text', required: true }
    ],
    tags: ['workshop', 'evento', 'ao vivo', 'transformação', 'intensivo'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-012',
    categoryId: 'product-creation',
    title: 'Estratégia de Afiliados para Produtos Próprios',
    description: 'Criar e gerenciar programa de afiliados para infoprodutos',
    template: `Crie uma estratégia de programa de afiliados para:

Produto: {product}
Preço do produto: {price}
Nicho: {niche}
Audiência atual: {current_audience}
Meta de vendas via afiliados: {affiliate_sales_goal}
Plataforma: {platform}

**ESTRATÉGIA DE PROGRAMA DE AFILIADOS:**

1. **Estrutura do Programa**
   - Comissão oferecida (%)
   - Período de cookie
   - Modelo de atribuição
   - Pagamento e frequência
   - Regras e termos

2. **Perfil do Afiliado Ideal**
   - Características
   - Tamanho de audiência
   - Nicho relacionado
   - Tipo de conteúdo
   - Red flags

3. **Recrutamento de Afiliados**
   
   **Tier 1: Top afiliados**
   - Abordagem direta
   - Condições especiais
   - Parceria próxima
   
   **Tier 2: Afiliados médios**
   - Programa aberto
   - Suporte padrão
   
   **Tier 3: Micro afiliados**
   - Fácil entrada
   - Automatizado

4. **Materiais de Apoio**
   - Página de afiliado
   - Criativos (banners, posts)
   - Emails prontos
   - Vídeos de review
   - Depoimentos de alunos

5. **Treinamento de Afiliados**
   - Onboarding
   - Melhores práticas
   - Estratégias que funcionam
   - O que evitar
   - Cases de sucesso

6. **Gestão e Comunicação**
   - Grupo exclusivo de afiliados
   - Atualizações frequentes
   - Ranking e gamificação
   - Suporte dedicado
   - Feedback loop

7. **Incentivos e Campanhas**
   - Bônus de performance
   - Concursos
   - Condições especiais em lançamentos
   - Materiais exclusivos
   - Reconhecimento público

8. **Métricas e Otimização**
   - Vendas por afiliado
   - Taxa de conversão
   - LTV de clientes via afiliado
   - Custo por venda
   - Retenção de afiliados`,
    variables: [
      { name: 'product', label: 'Nome do produto', placeholder: 'ex: Curso de Marketing Digital', type: 'text', required: true },
      { name: 'price', label: 'Preço do produto', placeholder: 'ex: R$ 997', type: 'text', required: true },
      { name: 'niche', label: 'Nicho do produto', placeholder: 'ex: marketing digital', type: 'text', required: true },
      { name: 'current_audience', label: 'Audiência atual', placeholder: 'ex: 20.000 seguidores', type: 'text', required: true },
      { name: 'affiliate_sales_goal', label: 'Meta de vendas via afiliados', placeholder: 'ex: 30% do total', type: 'text', required: true },
      { name: 'platform', label: 'Plataforma do produto', placeholder: 'ex: Hotmart', type: 'select', required: true, options: ['Hotmart', 'Eduzz', 'Kiwify', 'Monetizze', 'Própria'] }
    ],
    tags: ['afiliados', 'programa', 'parcerias', 'vendas', 'comissão'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-013',
    categoryId: 'product-creation',
    title: 'Plano de Produtização de Serviço',
    description: 'Transformar serviço personalizado em produto escalável',
    template: `Crie um plano de produtização para:

Serviço atual: {current_service}
Público-alvo: {target_audience}
Preço médio atual: {current_price}
Demanda típica: {typical_demand}
Gargalo principal: {main_bottleneck}
Meta de escalabilidade: {scale_goal}

**PLANO DE PRODUTIZAÇÃO:**

1. **Análise do Serviço Atual**
   - O que você entrega
   - Tempo gasto por cliente
   - Margem de lucro
   - Limitação de capacidade
   - Padrões identificados

2. **Identificação de Oportunidades**
   - Partes padronizáveis
   - Processos repetitivos
   - Conhecimento codificável
   - Ferramentas utilizadas
   - Resultados replicáveis

3. **Modelos de Produtização**
   
   **Opção A: Done-for-You Padronizado**
   - Escopo fixo
   - Preço único
   - Timeline definida
   
   **Opção B: Template + Implementação**
   - Template pronto
   - Sessão de implementação
   - Suporte limitado
   
   **Opção C: DIY (curso/tutorial)**
   - Metodologia em vídeo
   - Templates
   - Comunidade de suporte
   
   **Opção D: Software/Ferramenta**
   - Automatização do processo
   - Self-service
   - Assinatura

4. **Design do Produto**
   - Escopo exato
   - Entregáveis
   - Nível de customização
   - Limitações
   - Garantias

5. **Precificação do Produto**
   - Custo de produção
   - Valor percebido
   - Comparativo com serviço
   - Margem objetivo
   - Teste de preço

6. **Operação Escalável**
   - Processos documentados
   - Checklist e SOPs
   - Ferramentas de automação
   - Contratação (se necessário)
   - Capacidade ampliada

7. **Transição de Clientes**
   - Comunicação do novo modelo
   - Migração de clientes atuais
   - Upsells e downsells
   - Gestão de expectativas
   - Período de transição

8. **Escala e Evolução**
   - Versões do produto
   - Complementos
   - White label
   - Licenciamento
   - Metas de 12 meses`,
    variables: [
      { name: 'current_service', label: 'Serviço que você presta', placeholder: 'ex: consultoria de marketing', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: pequenas empresas de e-commerce', type: 'text', required: true },
      { name: 'current_price', label: 'Preço médio atual', placeholder: 'ex: R$ 3.000/projeto', type: 'text', required: true },
      { name: 'typical_demand', label: 'Demanda típica do serviço', placeholder: 'ex: 5 clientes/mês', type: 'text', required: true },
      { name: 'main_bottleneck', label: 'Principal gargalo', placeholder: 'ex: meu tempo é limitado', type: 'text', required: true },
      { name: 'scale_goal', label: 'Meta de escalabilidade', placeholder: 'ex: atender 50 clientes/mês', type: 'text', required: true }
    ],
    tags: ['produtização', 'serviço', 'escalabilidade', 'processo', 'automação'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-014',
    categoryId: 'product-creation',
    title: 'Criação de Desafio Online (Challenge)',
    description: 'Plano para criar challenges que vendem e engajam',
    template: `Crie um plano de desafio online sobre:

Tema do desafio: {challenge_topic}
Duração: {duration}
Público-alvo: {target_audience}
Transformação prometida: {transformation}
Produto para upsell: {upsell_product}
Modelo: {model}

**PLANO DE DESAFIO ONLINE:**

1. **Conceito do Desafio**
   - Nome atrativo (5 opções)
   - Promessa central
   - Resultado ao final
   - Por que participar
   - Diferencial

2. **Estrutura do Challenge**
   
   **Dia 0: Aquecimento**
   - Boas-vindas
   - Comunidade
   - Expectativas
   
   **Dia 1-5 (ou 7, 14, 21...):**
   - Tema de cada dia
   - Tarefa prática
   - Entregável
   - Live/conteúdo
   
   **Dia Final:**
   - Celebração
   - Próximos passos
   - Oferta

3. **Conteúdo Diário**
   - Formato (vídeo/texto/live)
   - Duração
   - Elementos fixos
   - Chamadas para ação
   - Engajamento

4. **Engajamento e Comunidade**
   - Grupo (WhatsApp/Telegram/Facebook)
   - Regras e combinados
   - Gamificação
   - Premiações
   - Moderação

5. **Captação de Participantes**
   - Landing page
   - Ads/tráfego
   - Orgânico/viral
   - Parcerias
   - Meta de inscritos

6. **Tecnologia e Operação**
   - Plataforma de entrega
   - Automação de emails
   - Lembretes
   - Suporte
   - Métricas

7. **Monetização**
   - Gratuito → upsell
   - Pago desde o início
   - Modelo híbrido
   - Sequência de vendas
   - Ofertas e bônus

8. **Execução e Pós**
   - Checklist pré-lançamento
   - Durante o desafio
   - Fechamento
   - Análise de resultados
   - Próximas edições`,
    variables: [
      { name: 'challenge_topic', label: 'Tema do desafio', placeholder: 'ex: 7 dias para organizar sua rotina', type: 'text', required: true },
      { name: 'duration', label: 'Duração do desafio', placeholder: 'ex: 5 dias', type: 'select', required: true, options: ['3 dias', '5 dias', '7 dias', '14 dias', '21 dias', '30 dias'] },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: pessoas que se sentem desorganizadas', type: 'text', required: true },
      { name: 'transformation', label: 'Transformação prometida', placeholder: 'ex: ter uma rotina produtiva', type: 'text', required: true },
      { name: 'upsell_product', label: 'Produto para vender após', placeholder: 'ex: curso de produtividade', type: 'text', required: true },
      { name: 'model', label: 'Modelo do desafio', placeholder: 'ex: gratuito', type: 'select', required: true, options: ['Gratuito (captação de leads)', 'Pago (ticket baixo)', 'Gratuito com upsell VIP'] }
    ],
    tags: ['challenge', 'desafio', 'engajamento', 'comunidade', 'lançamento'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-015',
    categoryId: 'product-creation',
    title: 'Plano de Consultoria em Grupo',
    description: 'Estrutura para criar programa de consultoria escalável',
    template: `Crie um plano de consultoria em grupo sobre:

Área de atuação: {expertise_area}
Público-alvo: {target_audience}
Resultado prometido: {promised_result}
Formato pretendido: {format}
Duração do programa: {duration}
Ticket pretendido: {price}

**PLANO DE CONSULTORIA EM GRUPO:**

1. **Posicionamento**
   - Expertise central
   - Diferenciais vs individual
   - Proposta de valor
   - Por que grupo funciona
   - Resultados esperados

2. **Estrutura do Programa**
   
   **Componentes:**
   - Encontros ao vivo (frequência)
   - Conteúdo gravado base
   - Implementação guiada
   - Suporte assíncrono
   - Comunidade
   
   **Timeline:**
   - Semana 1-2: Diagnóstico
   - Semana 3-X: Implementação
   - Semana final: Consolidação

3. **Metodologia de Trabalho**
   - Framework principal
   - Passos sequenciais
   - Ferramentas e templates
   - Métricas de progresso
   - Checkpoints

4. **Formato dos Encontros**
   - Hot seats rotativos
   - Q&A coletivo
   - Workshops temáticos
   - Mastermind sessions
   - Apresentações de progresso

5. **Dinâmica de Grupo**
   - Tamanho ideal do grupo
   - Critérios de seleção
   - Nivelamento
   - Networking interno
   - Accountability pairs

6. **Entregáveis**
   - Materiais exclusivos
   - Templates personalizáveis
   - Gravações
   - Suporte entre encontros
   - Acesso por quanto tempo

7. **Seleção e Onboarding**
   - Formulário de aplicação
   - Call de qualificação
   - Critérios de aceite
   - Onboarding estruturado
   - Primeiros passos

8. **Precificação e Vendas**
   - Ticket por participante
   - Turmas: frequência e tamanho
   - Forma de pagamento
   - Upsells (individual, extensão)
   - Funil de vendas`,
    variables: [
      { name: 'expertise_area', label: 'Área de expertise', placeholder: 'ex: estratégia de vendas B2B', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: donos de agências', type: 'text', required: true },
      { name: 'promised_result', label: 'Resultado prometido', placeholder: 'ex: dobrar faturamento em 90 dias', type: 'text', required: true },
      { name: 'format', label: 'Formato pretendido', placeholder: 'ex: semanal com hot seats', type: 'text', required: true },
      { name: 'duration', label: 'Duração do programa', placeholder: 'ex: 3 meses', type: 'text', required: true },
      { name: 'price', label: 'Ticket por participante', placeholder: 'ex: R$ 3.000', type: 'text', required: true }
    ],
    tags: ['consultoria', 'grupo', 'mastermind', 'escalável', 'high ticket'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-016',
    categoryId: 'product-creation',
    title: 'Criação de Audiobook',
    description: 'Plano completo para produzir e distribuir audiobooks',
    template: `Crie um plano de audiobook para:

Título do livro/conteúdo: {book_title}
Tema: {topic}
Público-alvo: {target_audience}
Extensão do conteúdo: {content_length}
Objetivo: {goal}
Narração: {narration_type}

**PLANO DE AUDIOBOOK:**

1. **Preparação do Conteúdo**
   - Adaptação para áudio
   - Divisão em capítulos
   - Tempo estimado de áudio
   - Introdução e encerramento
   - Créditos e extras

2. **Roteiro de Gravação**
   - Estrutura por sessão
   - Marcações de pausa
   - Pronúncias especiais
   - Notas de entonação
   - Recursos sonoros

3. **Narração**
   
   **Opção 1: Você mesmo**
   - Preparo vocal
   - Técnicas de leitura
   - Consistência
   
   **Opção 2: Narrador profissional**
   - Seleção de vozes
   - Briefing
   - Direção de gravação
   
   **Opção 3: IA + edição**
   - Ferramentas
   - Limitações
   - Pós-produção

4. **Produção Técnica**
   - Equipamentos
   - Ambiente de gravação
   - Software de edição
   - Tratamento de áudio
   - Masterização

5. **Distribuição**
   - Audible/Amazon
   - Spotify
   - Google Play Books
   - Outras plataformas
   - Site próprio

6. **Arte e Materiais**
   - Capa do audiobook
   - Descrição otimizada
   - Sample para preview
   - Material promocional
   - ISBN/registro

7. **Monetização**
   - Preço de venda
   - Royalties por plataforma
   - Pacotes (e-book + audiobook)
   - Membership/assinatura
   - Projeção de receita

8. **Promoção**
   - Lançamento
   - Reviews
   - Podcast/YouTube
   - Redes sociais
   - Parcerias`,
    variables: [
      { name: 'book_title', label: 'Título do livro/conteúdo', placeholder: 'ex: Como Vencer a Procrastinação', type: 'text', required: true },
      { name: 'topic', label: 'Tema central', placeholder: 'ex: produtividade pessoal', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: profissionais ocupados', type: 'text', required: true },
      { name: 'content_length', label: 'Extensão do conteúdo escrito', placeholder: 'ex: 200 páginas (~6h de áudio)', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo principal', placeholder: 'ex: venda e autoridade', type: 'select', required: true, options: ['Vendas diretas', 'Autoridade/branding', 'Lead magnet', 'Complemento de produto'] },
      { name: 'narration_type', label: 'Tipo de narração', placeholder: 'ex: própria', type: 'select', required: true, options: ['Própria', 'Narrador profissional', 'IA com edição'] }
    ],
    tags: ['audiobook', 'áudio', 'livro', 'narração', 'distribuição'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-017',
    categoryId: 'product-creation',
    title: 'Estratégia de Conteúdo Perpétuo',
    description: 'Sistema de vendas contínuas para infoprodutos',
    template: `Crie uma estratégia de conteúdo perpétuo para:

Produto: {product}
Preço: {price}
Público-alvo: {target_audience}
Canais de tráfego: {traffic_channels}
Investimento mensal em ads: {ads_budget}
Meta de vendas: {sales_goal}

**ESTRATÉGIA DE VENDAS PERPÉTUAS:**

1. **Estrutura do Funil**
   - Topo: Conteúdo de atração
   - Meio: Lead magnet / isca
   - Fundo: Página de vendas
   - Checkout e upsells
   - Pós-venda

2. **Lead Magnet Estratégico**
   - Opções de isca digital
   - Relação com produto pago
   - Landing page otimizada
   - Entrega automatizada
   - Métricas esperadas

3. **Sequência de Email**
   
   **Nutrição (Dias 1-7):**
   - Dia 1: Entrega + boas-vindas
   - Dia 2: História/conexão
   - Dia 3: Conteúdo de valor
   - Dia 4: Problema/solução
   - Dia 5: Prova social
   - Dia 6: Oferta
   - Dia 7: Última chance
   
   **Pós-sequência:**
   - Conteúdo semanal
   - Reoferta mensal
   - Automações comportamentais

4. **Página de Vendas Otimizada**
   - Headline magnética
   - Problema → solução
   - O que está incluso
   - Prova social
   - Garantia
   - FAQ
   - CTA's estratégicos

5. **Tráfego Contínuo**
   
   **Orgânico:**
   - SEO
   - YouTube
   - Redes sociais
   - Parcerias
   
   **Pago:**
   - Facebook/Instagram Ads
   - Google Ads
   - YouTube Ads
   - Remarketing

6. **Otimização Constante**
   - Testes A/B
   - Análise de métricas
   - Ajustes de copy
   - Novos criativos
   - Iteração semanal

7. **Escalabilidade**
   - Quando escalar
   - Novas audiências
   - Novos canais
   - Upsells e cross-sells
   - LTV maximizado

8. **Dashboard de Métricas**
   - Custo por lead
   - Taxa de conversão
   - CAC
   - LTV
   - ROAS`,
    variables: [
      { name: 'product', label: 'Nome do produto', placeholder: 'ex: Curso de Fotografia Básica', type: 'text', required: true },
      { name: 'price', label: 'Preço do produto', placeholder: 'ex: R$ 297', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: iniciantes em fotografia', type: 'text', required: true },
      { name: 'traffic_channels', label: 'Canais de tráfego', placeholder: 'ex: Instagram, YouTube, Google', type: 'text', required: true },
      { name: 'ads_budget', label: 'Investimento mensal em ads', placeholder: 'ex: R$ 5.000', type: 'text', required: true },
      { name: 'sales_goal', label: 'Meta de vendas mensais', placeholder: 'ex: 50 vendas/mês', type: 'text', required: true }
    ],
    tags: ['perpétuo', 'evergreen', 'funil', 'automação', 'vendas'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-018',
    categoryId: 'product-creation',
    title: 'Plano de Franquia Digital/Licenciamento',
    description: 'Estrutura para licenciar ou franquear seu método',
    template: `Crie um plano de licenciamento/franquia digital para:

Método/produto: {method}
Resultados comprovados: {proven_results}
Público para licenciados: {licensee_audience}
Modelo pretendido: {model}
Ticket de licença: {license_price}
Meta de licenciados: {licensee_goal}

**PLANO DE LICENCIAMENTO DIGITAL:**

1. **Análise de Viabilidade**
   - O método é replicável?
   - Resultados são consistentes?
   - Demanda existe?
   - Você consegue treinar outros?
   - Proteção intelectual

2. **Empacotamento do Método**
   - Documentação completa
   - Processos passo a passo
   - Materiais replicáveis
   - Scripts e templates
   - Identidade e marca

3. **Modelo de Licenciamento**
   
   **Opção A: Licença simples**
   - Acesso ao método
   - Uso da marca
   - Suporte básico
   
   **Opção B: Certificação**
   - Treinamento formal
   - Prova/avaliação
   - Certificado
   - Uso do selo
   
   **Opção C: Franquia digital**
   - Território exclusivo
   - Suporte completo
   - Marketing conjunto
   - Revenue share

4. **O Que o Licenciado Recebe**
   - Treinamento inicial
   - Materiais de marketing
   - Scripts de vendas
   - Suporte contínuo
   - Comunidade de licenciados
   - Atualizações

5. **Precificação**
   - Taxa inicial
   - Mensalidade/royalties
   - Revenue share
   - Renovação
   - Upsells

6. **Seleção de Licenciados**
   - Perfil ideal
   - Critérios de aceite
   - Processo de aplicação
   - Contrato e termos
   - Exclusividade (se houver)

7. **Suporte e Gestão**
   - Onboarding
   - Suporte recorrente
   - Comunidade
   - Encontros periódicos
   - Controle de qualidade

8. **Escala e Proteção**
   - Registro de marca
   - Contratos robustos
   - Gestão de conflitos
   - Evolução do programa
   - Metas de crescimento`,
    variables: [
      { name: 'method', label: 'Método/produto a licenciar', placeholder: 'ex: Método XYZ de Coaching Financeiro', type: 'text', required: true },
      { name: 'proven_results', label: 'Resultados comprovados', placeholder: 'ex: 200 clientes atendidos com 90% satisfação', type: 'text', required: true },
      { name: 'licensee_audience', label: 'Público para licenciados', placeholder: 'ex: coaches que querem nichar em finanças', type: 'text', required: true },
      { name: 'model', label: 'Modelo pretendido', placeholder: 'ex: certificação', type: 'select', required: true, options: ['Licença simples', 'Certificação', 'Franquia digital', 'White label'] },
      { name: 'license_price', label: 'Ticket da licença', placeholder: 'ex: R$ 10.000 + R$ 500/mês', type: 'text', required: true },
      { name: 'licensee_goal', label: 'Meta de licenciados', placeholder: 'ex: 50 licenciados em 12 meses', type: 'text', required: true }
    ],
    tags: ['licenciamento', 'franquia', 'certificação', 'escala', 'método'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-019',
    categoryId: 'product-creation',
    title: 'Criação de App de Conteúdo/Educação',
    description: 'Plano para criar aplicativo educacional ou de conteúdo',
    template: `Crie um plano de app educacional sobre:

Tema/conteúdo: {content_theme}
Público-alvo: {target_audience}
Problema que resolve: {problem}
Formato principal: {main_format}
Modelo de monetização: {monetization}
Budget estimado: {budget}

**PLANO DE APP EDUCACIONAL:**

1. **Conceito e Proposta de Valor**
   - Nome do app (5 opções)
   - O que faz
   - Por que app (vs web)
   - Diferencial competitivo
   - Experiência prometida

2. **Funcionalidades Core**
   
   **MVP (versão 1):**
   - Login/cadastro
   - Biblioteca de conteúdo
   - Player/consumo
   - Progresso do usuário
   - Notificações
   
   **Versão 2+:**
   - Gamificação
   - Comunidade
   - Downloads offline
   - Personalização

3. **Conteúdo e Estrutura**
   - Formato do conteúdo
   - Organização (módulos/trilhas)
   - Frequência de atualização
   - Curadoria vs UGC
   - Qualidade mínima

4. **UX/UI Design**
   - Wireframes principais
   - Identidade visual
   - Jornada do usuário
   - Acessibilidade
   - Testes de usabilidade

5. **Desenvolvimento**
   
   **Opções:**
   - No-code (Glide, Adalo)
   - Low-code (FlutterFlow)
   - Nativo (React Native, Flutter)
   
   **Considerações:**
   - iOS e Android
   - Custo e timeline
   - Manutenção
   - Escalabilidade

6. **Monetização**
   - Freemium
   - Assinatura
   - Compras in-app
   - Ads
   - Modelo híbrido

7. **Lançamento e Crescimento**
   - ASO (App Store Optimization)
   - Estratégia de lançamento
   - Aquisição de usuários
   - Retenção
   - Viralização

8. **Métricas e Evolução**
   - Downloads
   - DAU/MAU
   - Retenção D1/D7/D30
   - LTV
   - Roadmap de features`,
    variables: [
      { name: 'content_theme', label: 'Tema do conteúdo', placeholder: 'ex: meditação guiada', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: pessoas ansiosas que querem meditar', type: 'text', required: true },
      { name: 'problem', label: 'Problema que resolve', placeholder: 'ex: dificuldade de manter prática de meditação', type: 'text', required: true },
      { name: 'main_format', label: 'Formato principal do conteúdo', placeholder: 'ex: áudios de 5-15min', type: 'select', required: true, options: ['Vídeo', 'Áudio', 'Texto', 'Interativo/quiz', 'Misto'] },
      { name: 'monetization', label: 'Modelo de monetização', placeholder: 'ex: assinatura mensal', type: 'select', required: true, options: ['Assinatura', 'Freemium', 'Compra única', 'In-app purchases', 'Ads'] },
      { name: 'budget', label: 'Budget para desenvolvimento', placeholder: 'ex: R$ 50.000', type: 'text', required: true }
    ],
    tags: ['app', 'aplicativo', 'educação', 'conteúdo', 'mobile'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-020',
    categoryId: 'product-creation',
    title: 'Plano de Websérie Educativa',
    description: 'Estratégia para criar série de vídeos educativos',
    template: `Crie um plano de websérie educativa sobre:

Tema central: {topic}
Público-alvo: {target_audience}
Objetivo: {goal}
Formato: {format}
Número de episódios: {episode_count}
Canal de distribuição: {distribution}

**PLANO DE WEBSÉRIE EDUCATIVA:**

1. **Conceito da Série**
   - Nome da série (5 opções)
   - Premissa
   - Tom e estilo
   - Diferencial
   - Arco narrativo geral

2. **Estrutura da Série**
   - Número de temporadas
   - Episódios por temporada
   - Duração de cada episódio
   - Frequência de lançamento
   - Progressão de conteúdo

3. **Planejamento de Episódios**
   
   **Episódio Piloto:**
   - Gancho inicial
   - Apresentação do tema
   - Promessa da série
   
   **Episódios 2-X:**
   - Tema de cada
   - Conteúdo principal
   - Conexão entre episódios
   
   **Episódio Final:**
   - Conclusão
   - Recapitulação
   - CTA / próxima temporada

4. **Roteiro e Produção**
   - Formato do roteiro
   - Elementos visuais
   - Recursos de produção
   - Música e trilha
   - Branding consistente

5. **Produção Técnica**
   - Equipamentos
   - Cenário/locação
   - Equipe necessária
   - Cronograma de gravação
   - Pós-produção

6. **Distribuição**
   - Plataforma principal
   - Plataformas secundárias
   - Estratégia de lançamento
   - SEO e descoberta
   - Promoção cruzada

7. **Engajamento da Audiência**
   - Comunidade
   - Interação nos comentários
   - Conteúdo de bastidores
   - Q&A e lives
   - User-generated content

8. **Monetização**
   - Patrocinadores
   - Produto relacionado
   - Afiliados
   - Conteúdo premium
   - Próximas temporadas pagas`,
    variables: [
      { name: 'topic', label: 'Tema central', placeholder: 'ex: história do empreendedorismo no Brasil', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: empreendedores e interessados em negócios', type: 'text', required: true },
      { name: 'goal', label: 'Objetivo da série', placeholder: 'ex: educar e vender consultoria', type: 'select', required: true, options: ['Branding/autoridade', 'Vendas de produto', 'Patrocínio', 'Crescimento de canal', 'Educação pura'] },
      { name: 'format', label: 'Formato dos episódios', placeholder: 'ex: documentário com entrevistas', type: 'select', required: true, options: ['Documentário', 'Tutorial/how-to', 'Entrevistas', 'Storytelling', 'Animação', 'Híbrido'] },
      { name: 'episode_count', label: 'Número de episódios', placeholder: 'ex: 8 episódios', type: 'text', required: true },
      { name: 'distribution', label: 'Canal principal de distribuição', placeholder: 'ex: YouTube', type: 'select', required: true, options: ['YouTube', 'Instagram/IGTV', 'TikTok', 'Plataforma própria', 'Streaming (Netflix style)'] }
    ],
    tags: ['websérie', 'vídeo', 'conteúdo', 'storytelling', 'YouTube'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-021',
    categoryId: 'product-creation',
    title: 'Criação de Bootcamp Intensivo',
    description: 'Estrutura para bootcamp transformador de curta duração',
    template: `Crie um plano de bootcamp intensivo sobre:

Tema: {topic}
Duração total: {duration}
Público-alvo: {target_audience}
Transformação prometida: {transformation}
Formato: {format}
Investimento: {price}

**PLANO DE BOOTCAMP INTENSIVO:**

1. **Conceito e Posicionamento**
   - Nome do bootcamp
   - Proposta de valor
   - Por que intensivo funciona
   - Diferencial vs curso tradicional
   - Resultado garantido

2. **Estrutura do Programa**
   
   **Dia 1: Fundação**
   - Abertura e mindset
   - Diagnóstico inicial
   - Framework geral
   - Primeira implementação
   
   **Dias 2-X: Imersão**
   - Módulos diários
   - Teoria + prática
   - Exercícios hands-on
   - Revisões e feedback
   
   **Dia Final: Consolidação**
   - Integração do aprendizado
   - Plano de ação
   - Apresentações
   - Certificação

3. **Metodologia de Ensino**
   - Aprendizado acelerado
   - Learn by doing
   - Sprints de execução
   - Feedback loops
   - Accountability

4. **Suporte Intensivo**
   - Mentoria diária
   - Correção de exercícios
   - Q&A ao vivo
   - Grupo exclusivo
   - Suporte async

5. **Comunidade e Networking**
   - Dinâmicas de grupo
   - Trabalhos em equipe
   - Networking estruturado
   - Alumni network
   - Eventos pós-bootcamp

6. **Materiais e Recursos**
   - Workbooks
   - Templates prontos
   - Checklists
   - Gravações (se aplicável)
   - Recursos extras

7. **Logística e Execução**
   - Plataforma
   - Horários e fusos
   - Pré-trabalho
   - Comunicação
   - Contingências

8. **Resultados e Continuidade**
   - Métricas de sucesso
   - Depoimentos
   - Certificação
   - Upsells
   - Próximas turmas`,
    variables: [
      { name: 'topic', label: 'Tema do bootcamp', placeholder: 'ex: lançamento de infoproduto', type: 'text', required: true },
      { name: 'duration', label: 'Duração total', placeholder: 'ex: 5 dias intensivos', type: 'select', required: true, options: ['3 dias', '5 dias', '1 semana', '2 semanas', '1 mês intensivo'] },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: infoprodutores iniciantes', type: 'text', required: true },
      { name: 'transformation', label: 'Transformação prometida', placeholder: 'ex: ter produto e funil prontos para lançar', type: 'text', required: true },
      { name: 'format', label: 'Formato', placeholder: 'ex: 100% online ao vivo', type: 'select', required: true, options: ['Online ao vivo', 'Presencial', 'Híbrido', 'Online assíncrono + lives'] },
      { name: 'price', label: 'Investimento', placeholder: 'ex: R$ 1.997', type: 'text', required: true }
    ],
    tags: ['bootcamp', 'intensivo', 'imersão', 'transformação', 'aceleração'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-022',
    categoryId: 'product-creation',
    title: 'Estratégia de Mini-Cursos como Front-End',
    description: 'Usar mini-cursos baratos para vender produtos maiores',
    template: `Crie uma estratégia de mini-cursos front-end para:

Produto principal (back-end): {main_product}
Preço do produto principal: {main_price}
Público-alvo: {target_audience}
Tema para mini-curso: {mini_course_topic}
Preço do mini-curso: {mini_price}
Meta de conversão: {conversion_goal}

**ESTRATÉGIA DE MINI-CURSO FRONT-END:**

1. **Conceito da Estratégia**
   - O que é front-end/back-end
   - Por que funciona
   - Jornada do cliente
   - Fluxo de receita
   - LTV esperado

2. **Design do Mini-Curso**
   - Tema específico (recorte)
   - Relação com produto principal
   - Duração (1-3 horas)
   - Entregável tangível
   - Quick win garantido

3. **Estrutura do Conteúdo**
   
   **Módulo 1: Fundação**
   - Contexto
   - Por que isso importa
   - Overview do método
   
   **Módulo 2: Implementação**
   - Passo a passo
   - Exemplos práticos
   - Exercício guiado
   
   **Módulo 3: Próximo Nível**
   - Resultados até aqui
   - Limitações
   - Introdução ao produto principal
   - CTA para back-end

4. **Precificação Estratégica**
   - Preço de entrada (R$ 27-97)
   - Valor percebido
   - ROI para o cliente
   - Breakeven com ads

5. **Funil de Conversão**
   - Ads → Página do mini-curso
   - Compra do mini-curso
   - Consumo do conteúdo
   - Oferta do produto principal
   - Upsell/downsell

6. **Sequência de Email/Automação**
   - Pós-compra imediato
   - Durante consumo
   - Após conclusão
   - Oferta do back-end
   - Follow-up de não-compradores

7. **Métricas-Chave**
   - Custo por venda do front-end
   - Taxa de consumo
   - Taxa de conversão para back-end
   - LTV
   - ROAS do funil completo

8. **Escala**
   - Otimização do funil
   - Múltiplos mini-cursos
   - Diferentes ângulos
   - Públicos lookalike
   - Expansão de canais`,
    variables: [
      { name: 'main_product', label: 'Produto principal (back-end)', placeholder: 'ex: Programa de Mentoria XYZ', type: 'text', required: true },
      { name: 'main_price', label: 'Preço do produto principal', placeholder: 'ex: R$ 2.997', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: empreendedores digitais', type: 'text', required: true },
      { name: 'mini_course_topic', label: 'Tema do mini-curso', placeholder: 'ex: como criar sua primeira oferta', type: 'text', required: true },
      { name: 'mini_price', label: 'Preço do mini-curso', placeholder: 'ex: R$ 47', type: 'text', required: true },
      { name: 'conversion_goal', label: 'Meta de conversão front → back', placeholder: 'ex: 10%', type: 'text', required: true }
    ],
    tags: ['front-end', 'mini-curso', 'funil', 'conversão', 'escalabilidade'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  },

  {
    id: 'pc-premium-023',
    categoryId: 'product-creation',
    title: 'Plano de Retiro/Imersão Presencial',
    description: 'Estrutura para criar experiências presenciais premium',
    template: `Crie um plano de retiro/imersão presencial sobre:

Tema: {topic}
Duração: {duration}
Local pretendido: {location}
Público-alvo: {target_audience}
Transformação: {transformation}
Investimento: {price}

**PLANO DE RETIRO/IMERSÃO:**

1. **Conceito e Experiência**
   - Nome do retiro
   - Proposta de valor única
   - Experiência prometida
   - Por que presencial
   - Diferencial exclusivo

2. **Estrutura do Programa**
   
   **Dia 1: Chegada e Conexão**
   - Check-in
   - Abertura
   - Alinhamento de expectativas
   - Dinâmica de conexão
   - Jantar de abertura
   
   **Dias Intermediários:**
   - Sessões de conteúdo
   - Workshops práticos
   - Atividades experienciais
   - Tempo de reflexão
   - Networking estruturado
   
   **Dia Final:**
   - Integração
   - Plano de ação
   - Celebração
   - Encerramento

3. **Logística e Infraestrutura**
   - Escolha do local
   - Hospedagem
   - Alimentação
   - Transporte
   - Materiais e recursos

4. **Experiências Complementares**
   - Atividades outdoor
   - Bem-estar (yoga, meditação)
   - Gastronomia especial
   - Atividades culturais
   - Momentos de lazer

5. **Equipe e Suporte**
   - Facilitadores
   - Equipe de apoio
   - Fornecedores
   - Emergências
   - Seguros

6. **Precificação Premium**
   - Custo por participante
   - Margem de lucro
   - O que está incluso
   - Opcionais e upgrades
   - Early bird e condições

7. **Marketing e Vendas**
   - Página de vendas
   - Vídeo/fotos de edições anteriores
   - Depoimentos
   - Escassez real
   - Processo de inscrição

8. **Pós-Evento**
   - Follow-up
   - Comunidade de alumni
   - Próximas oportunidades
   - Depoimentos e cases
   - Próximas edições`,
    variables: [
      { name: 'topic', label: 'Tema do retiro', placeholder: 'ex: estratégia de negócios para 2025', type: 'text', required: true },
      { name: 'duration', label: 'Duração', placeholder: 'ex: 3 dias e 2 noites', type: 'text', required: true },
      { name: 'location', label: 'Local pretendido', placeholder: 'ex: hotel fazenda em SP', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: empresários faturando 100k+/mês', type: 'text', required: true },
      { name: 'transformation', label: 'Transformação prometida', placeholder: 'ex: sair com plano estratégico completo', type: 'text', required: true },
      { name: 'price', label: 'Investimento (all-inclusive)', placeholder: 'ex: R$ 15.000', type: 'text', required: true }
    ],
    tags: ['retiro', 'imersão', 'presencial', 'premium', 'experiência'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-024',
    categoryId: 'product-creation',
    title: 'Criação de Ferramenta/Calculadora Online',
    description: 'Plano para criar ferramentas interativas como lead magnets',
    template: `Crie um plano de ferramenta/calculadora online para:

Tipo de ferramenta: {tool_type}
Problema que resolve: {problem}
Público-alvo: {target_audience}
Produto relacionado: {related_product}
Objetivo principal: {main_goal}
Complexidade técnica: {technical_complexity}

**PLANO DE FERRAMENTA ONLINE:**

1. **Conceito da Ferramenta**
   - Nome atrativo
   - O que faz
   - Valor entregue
   - Diferencial
   - Conexão com produto pago

2. **Funcionalidades**
   
   **Inputs (o que o usuário informa):**
   - Campo 1: [descrição]
   - Campo 2: [descrição]
   - Campo 3: [descrição]
   
   **Processamento:**
   - Lógica/cálculo
   - Fórmulas
   - Condicionais
   
   **Outputs (resultado):**
   - Resultado principal
   - Insights complementares
   - Recomendações
   - CTA para produto

3. **Experiência do Usuário**
   - Fluxo de uso
   - Design/interface
   - Mobile-friendly
   - Compartilhamento
   - Salvamento de resultados

4. **Desenvolvimento**
   
   **Opções:**
   - No-code (Typeform, Outgrow)
   - Low-code (Webflow + lógica)
   - Desenvolvimento customizado
   
   **Considerações:**
   - Custo
   - Timeline
   - Manutenção
   - Escalabilidade

5. **Captação de Leads**
   - Quando pedir email
   - O que oferecer em troca
   - Resultado por email
   - LGPD/compliance

6. **Integração com Funil**
   - Automação pós-uso
   - Segmentação por resultado
   - Nutrição personalizada
   - Oferta do produto

7. **Promoção**
   - Landing page
   - Ads
   - Conteúdo orgânico
   - Parcerias
   - Viralização

8. **Métricas e Otimização**
   - Usuários
   - Taxa de conclusão
   - Leads gerados
   - Conversão para produto
   - Iterações`,
    variables: [
      { name: 'tool_type', label: 'Tipo de ferramenta', placeholder: 'ex: calculadora de ROI', type: 'select', required: true, options: ['Calculadora', 'Quiz/diagnóstico', 'Gerador', 'Comparador', 'Simulador', 'Assessment'] },
      { name: 'problem', label: 'Problema que resolve', placeholder: 'ex: entender se investimento vale a pena', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: gestores de marketing', type: 'text', required: true },
      { name: 'related_product', label: 'Produto relacionado para vender', placeholder: 'ex: consultoria de marketing', type: 'text', required: true },
      { name: 'main_goal', label: 'Objetivo principal', placeholder: 'ex: gerar leads qualificados', type: 'select', required: true, options: ['Gerar leads', 'Educar o mercado', 'Qualificar leads', 'Viralização', 'Demonstrar expertise'] },
      { name: 'technical_complexity', label: 'Complexidade técnica', placeholder: 'ex: média', type: 'select', required: true, options: ['Baixa (no-code)', 'Média (low-code)', 'Alta (desenvolvimento)'] }
    ],
    tags: ['ferramenta', 'calculadora', 'lead magnet', 'interativo', 'quiz'],
    difficulty: 'intermediate',
    isPremium: true,
    isFeatured: false,
    usageCount: 0
  },

  {
    id: 'pc-premium-025',
    categoryId: 'product-creation',
    title: 'Plano de Livro Físico como Autoridade',
    description: 'Estratégia para escrever e publicar livro físico',
    template: `Crie um plano de livro físico sobre:

Tema do livro: {book_topic}
Público-alvo: {target_audience}
Objetivo principal: {main_goal}
Experiência de escrita: {writing_experience}
Modelo de publicação: {publishing_model}
Prazo para lançamento: {timeline}

**PLANO DE LIVRO FÍSICO:**

1. **Estratégia e Posicionamento**
   - Por que escrever um livro
   - Objetivos (autoridade, vendas, legado)
   - Como o livro se encaixa no seu negócio
   - ROI esperado
   - Competição no tema

2. **Conceito do Livro**
   - Título e subtítulo (5 opções)
   - Premissa central
   - Promessa ao leitor
   - Diferencial
   - Big idea

3. **Estrutura e Outline**
   - Número de capítulos
   - Título de cada capítulo
   - Pontos principais por capítulo
   - Fluxo narrativo
   - Elementos especiais (cases, exercícios)

4. **Processo de Escrita**
   - Meta de palavras diárias
   - Cronograma de escrita
   - Ferramentas e métodos
   - Revisões
   - Feedback e beta readers

5. **Publicação**
   
   **Tradicional:**
   - Editoras potenciais
   - Proposta editorial
   - Negociação
   
   **Independente:**
   - Amazon KDP
   - Gráfica/impressão
   - ISBN e direitos
   - Distribuição

6. **Produção Editorial**
   - Revisão profissional
   - Diagramação
   - Capa
   - Ficha catalográfica
   - Formato (físico/e-book)

7. **Lançamento**
   - Pré-venda
   - Evento de lançamento
   - Campanha de marketing
   - Assessoria de imprensa
   - Redes sociais

8. **Pós-Lançamento**
   - Vendas contínuas
   - Palestras e eventos
   - Upsell para produtos
   - Novas edições
   - Próximos livros`,
    variables: [
      { name: 'book_topic', label: 'Tema do livro', placeholder: 'ex: liderança para novos gestores', type: 'text', required: true },
      { name: 'target_audience', label: 'Público-alvo', placeholder: 'ex: gestores em início de carreira', type: 'text', required: true },
      { name: 'main_goal', label: 'Objetivo principal', placeholder: 'ex: autoridade no mercado', type: 'select', required: true, options: ['Autoridade/posicionamento', 'Vendas do livro', 'Lead para serviços', 'Legado pessoal', 'Complemento de negócio'] },
      { name: 'writing_experience', label: 'Experiência com escrita', placeholder: 'ex: intermediário', type: 'select', required: true, options: ['Iniciante', 'Intermediário', 'Avançado', 'Autor publicado'] },
      { name: 'publishing_model', label: 'Modelo de publicação', placeholder: 'ex: independente', type: 'select', required: true, options: ['Editora tradicional', 'Autopublicação', 'Híbrido', 'Ainda não decidi'] },
      { name: 'timeline', label: 'Prazo para lançamento', placeholder: 'ex: 12 meses', type: 'text', required: true }
    ],
    tags: ['livro', 'autor', 'publicação', 'autoridade', 'escrita'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true,
    usageCount: 0
  }
];
