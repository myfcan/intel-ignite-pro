import { PromptCategory } from '../../types/prompt';

export const personalFinancePromptsCategory: PromptCategory = {
  id: 'personal-finance',
  name: 'Organização Financeira Pessoal',
  description: 'Prompts para controle financeiro, investimentos e planejamento pessoal',
  icon: 'Wallet',
  color: 'bg-emerald-500',
  prompts: [
    {
      id: 'pf-budget-plan',
      categoryId: 'personal-finance',
      title: 'Planejamento Orçamentário Pessoal',
      description: 'Monte seu orçamento mensal completo',
      template: `Crie planejamento orçamentário para:

Renda mensal líquida: {income}
Pessoas na família: {family_size}
Principais gastos: {main_expenses}
Objetivos financeiros: {goals}
Dívidas atuais: {debts}

**ORÇAMENTO PESSOAL:**

**1. ANÁLISE DA SITUAÇÃO ATUAL**
- Renda total mensal: R$ {income}
- Gastos médios atuais: [calcular]
- Taxa de poupança: [calcular]%
- Situação: [superávit/déficit]

**2. REGRA 50/30/20** (adaptada)

**Essenciais (50%)** - R$ [valor]
- Moradia (aluguel/financiamento): %
- Condomínio/IPTU: %
- Alimentação: %
- Transporte: %
- Saúde/medicamentos: %
- Educação: %
- Contas básicas (luz, água, internet): %

**Estilo de Vida (30%)** - R$ [valor]
- Lazer e entretenimento: %
- Restaurantes: %
- Assinaturas (streaming, etc): %
- Roupas e cuidados pessoais: %
- Hobbies: %
- Presentes: %

**Poupança e Investimentos (20%)** - R$ [valor]
- Reserva de emergência: % (prioridade 1)
- Investimentos de longo prazo: %
- Objetivos específicos: %

**3. PLANO DE REDUÇÃO DE GASTOS**

Onde cortar (sem perder qualidade de vida):
1. [categoria]: Economia de R$ [valor]/mês
   Como: [estratégia específica]

2. [categoria]: Economia de R$ [valor]/mês
   Como: [estratégia específica]

3. [categoria]: Economia de R$ [valor]/mês
   Como: [estratégia específica]

Total economizado: R$ [valor]/mês

**4. ESTRATÉGIA PARA DÍVIDAS** (se houver)

Método Snowball (menor dívida primeiro):
- Dívida 1: [nome] - R$ [valor] - taxa [%] - pagar em [meses]
- Dívida 2: [...]

Ou Método Avalanche (maior juros primeiro):
[reorganizar]

Plano de quitação:
- Mês 1-3: [ações]
- Mês 4-6: [ações]
- Mês 7-12: [ações]

**5. RESERVA DE EMERGÊNCIA**

Meta: 6 meses de gastos essenciais = R$ [calcular]
Prazo: [X] meses
Aporte mensal: R$ [calcular]
Onde aplicar: [CDB liquidez diária, Tesouro Selic, etc]

**6. OBJETIVOS FINANCEIROS**

Curto prazo (até 1 ano):
- Objetivo: [descrição]
- Valor necessário: R$ [valor]
- Prazo: [meses]
- Aporte mensal: R$ [calcular]
- Onde investir: [sugestão]

Médio prazo (1-5 anos):
[repetir estrutura]

Longo prazo (5+ anos):
[repetir estrutura]

**7. CONTROLE E ACOMPANHAMENTO**

Ferramentas recomendadas:
- App de controle: [sugestão]
- Planilha: [modelo]
- Frequência de revisão: [semanal/mensal]

Indicadores para acompanhar:
- Taxa de poupança mensal
- Evolução do patrimônio
- Avanço dos objetivos
- Redução de dívidas

**8. CALENDÁRIO FINANCEIRO**

Todo dia 1:
- Registrar receitas do mês
- Transferir para investimentos

Todo dia 5:
- Pagar contas fixas

Toda semana:
- Revisar gastos

Todo mês:
- Balanço mensal
- Ajustar orçamento se necessário

**9. DICAS DE ECONOMIA IMEDIATA**

10 maneiras de economizar R$ [X] este mês:
1. [dica específica com valor]
2. [...]

**10. PLANO DE AÇÃO - PRIMEIROS 30 DIAS**

Dia 1-7:
- [ ] Baixar app de controle financeiro
- [ ] Listar todos os gastos do mês passado
- [ ] Cancelar assinaturas não usadas

Dia 8-14:
- [ ] Abrir conta investimento
- [ ] Transferir reserva emergência
- [ ] Renegociar dívidas (se houver)

Dia 15-21:
- [ ] Definir limites por categoria
- [ ] Configurar alertas no app
- [ ] Pesquisar seguros/preços

Dia 22-30:
- [ ] Primeira revisão
- [ ] Ajustes necessários
- [ ] Comemorar conquistas`,
      variables: [
        {
          name: 'income',
          label: 'Renda mensal líquida',
          placeholder: 'Ex: 5000',
          type: 'text',
          required: true
        },
        {
          name: 'family_size',
          label: 'Pessoas na família',
          placeholder: 'Ex: 3 (casal + 1 filho)',
          type: 'text',
          required: true
        },
        {
          name: 'main_expenses',
          label: 'Principais gastos mensais',
          placeholder: 'Ex: Aluguel R$ 1500, Mercado R$ 800',
          type: 'textarea',
          required: true
        },
        {
          name: 'goals',
          label: 'Objetivos financeiros',
          placeholder: 'Ex: Comprar carro em 2 anos, aposentadoria',
          type: 'textarea',
          required: true
        },
        {
          name: 'debts',
          label: 'Dívidas atuais',
          placeholder: 'Ex: Cartão R$ 3000 (5%am), Empréstimo R$ 10000',
          type: 'textarea',
          required: false
        }
      ],
      examples: [],
      tags: ['orçamento', 'finanças pessoais', 'planejamento', 'controle'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true,
      usageCount: 0
    },
    {
      id: 'pf-investment-strategy',
      categoryId: 'personal-finance',
      title: 'Estratégia de Investimentos Personalizada',
      description: 'Monte carteira de investimentos ideal para seu perfil',
      template: `Crie estratégia de investimentos para:

Valor para investir: {amount}
Prazo: {timeframe}
Perfil de risco: {risk_profile}
Objetivo: {objective}
Conhecimento de investimentos: {knowledge_level}

**ESTRATÉGIA DE INVESTIMENTOS:**

**1. ANÁLISE DO PERFIL**
- Perfil de risco: {risk_profile}
- Horizonte: {timeframe}
- Objetivo: {objective}
- Liquidez necessária: [avaliar]

**2. ALOCAÇÃO DE ATIVOS RECOMENDADA**

Total a investir: R$ {amount}

**Renda Fixa ({conservative}%)** - R$ [valor]
Objetivo: Segurança e liquidez

- Reserva de emergência:
  * Tesouro Selic: [%] - R$ [valor]
  * CDB liquidez diária (>100% CDI): [%] - R$ [valor]
  
- Renda fixa conservadora:
  * CDB DI (>110% CDI): [%] - R$ [valor]
  * LCI/LCA: [%] - R$ [valor]
  * Tesouro IPCA+: [%] - R$ [valor]

**Renda Variável ({moderate}%)** - R$ [valor]
Objetivo: Crescimento

- Ações Brasil:
  * ETF BOVA11 (Ibovespa): [%] - R$ [valor]
  * Ações individuais blue chips: [%] - R$ [valor]
  
- Fundos Imobiliários (FIIs):
  * FIIs papel: [%] - R$ [valor]
  * FIIs tijolo: [%] - R$ [valor]

**Internacional ({aggressive}%)** - R$ [valor]
Objetivo: Diversificação

- ETFs internacionais:
  * IVVB11 (S&P 500): [%] - R$ [valor]
  * WRLD11 (Mundial): [%] - R$ [valor]

**Alternativos ({alternative}%)** - R$ [valor]
- Criptomoedas (máx 5%): [%] - R$ [valor]
- Outros: [%] - R$ [valor]

**3. SELEÇÃO DE PRODUTOS** (top picks)

Renda Fixa:
1. [Nome do CDB] - [banco] - [%] CDI - Por quê
2. [Nome do Tesouro] - Vencimento [ano] - Por quê
3. [...]

Ações:
1. [Ticker] - [empresa] - Preço alvo - Tese
2. [...]

FIIs:
1. [Ticker] - [tipo] - Dividend Yield - Por quê
2. [...]

ETFs:
1. [Ticker] - TER [%] - Por quê
2. [...]

**4. PLANO DE APORTES**

Se for investir mensalmente:
- Valor mensal: R$ [calcular]
- Dia do aporte: [sugerir]
- Distribuição mensal: [por ativo]

Estratégia de entrada (se valor único):
- Entrar tudo de uma vez? Não!
- Dividir em [X] aportes
- Frequência: [semanal/mensal]
- Razão: evitar timing risk

**5. ESTRATÉGIA DE REBALANCEAMENTO**

Frequência: [trimestral/semestral/anual]

Quando rebalancear:
- Ativo está [X]% acima do target → vender parte
- Ativo está [X]% abaixo do target → comprar mais

Exemplo:
- Target ações: 30%
- Atual: 40%
- Ação: Vender [X]% e realocar

**6. TRIBUTOS E CUSTOS**

Para cada tipo de investimento:
- Renda Fixa: IR [%] tabela regressiva
- Ações: 15% sobre ganho (isenção até R$ 20k/mês)
- FIIs: isento
- ETFs: 15% sobre ganho

Custos da corretora:
- Taxa de corretagem: [verificar]
- Custódia: [verificar]
- Recomendação: [corretora sem custos]

**7. ERROS A EVITAR**

❌ Não faça:
1. Investir sem reserva de emergência
2. Colocar tudo em um ativo
3. Vender no susto
4. Seguir dicas de "guru"
5. Investir em  que não entende

✅ Faça:
1. Diversifique
2. Pense em longo prazo
3. Rebalanceie regularmente
4. Estude antes de investir
5. Ignore o ruído do mercado

**8. EDUCAÇÃO CONTINUADA**

Livros recomendados:
1. [título] - [autor]
2. [...]

Canais do YouTube:
1. [canal] - Por quê
2. [...]

Podcasts:
1. [nome]
2. [...]

**9. PROJEÇÃO DE RENDIMENTOS**

Cenário conservador (6% aa):
- 1 ano: R$ [calcular]
- 5 anos: R$ [calcular]
- 10 anos: R$ [calcular]

Cenário moderado (10% aa):
- 1 ano: R$ [calcular]
- 5 anos: R$ [calcular]
- 10 anos: R$ [calcular]

Cenário otimista (14% aa):
- 1 ano: R$ [calcular]
- 5 anos: R$ [calcular]
- 10 anos: R$ [calcular]

**10. CHECKLIST DE IMPLEMENTAÇÃO**

Antes de começar:
- [ ] Tenho reserva de emergência?
- [ ] Paguei dívidas caras?
- [ ] Escolhi a corretora?
- [ ] Entendo cada investimento?

Primeira semana:
- [ ] Abrir conta na corretora
- [ ] Transferir recursos
- [ ] Comprar primeiro ativo

Primeiro mês:
- [ ] Acompanhar carteira
- [ ] Estudar próximos ativos
- [ ] Planejar próximo aporte

Acompanhamento:
- Semanal: [verificar notícias importantes]
- Mensal: [revisar rentabilidade]
- Trimestral/Semestral: [rebalancear se necessário]`,
      variables: [
        {
          name: 'amount',
          label: 'Valor para investir',
          placeholder: 'Ex: 10000',
          type: 'text',
          required: true
        },
        {
          name: 'timeframe',
          label: 'Prazo do investimento',
          placeholder: 'Ex: 5 anos',
          type: 'text',
          required: true
        },
        {
          name: 'risk_profile',
          label: 'Perfil de risco',
          placeholder: 'Ex: Moderado',
          type: 'select',
          options: ['Conservador', 'Moderado', 'Arrojado'],
          required: true
        },
        {
          name: 'objective',
          label: 'Objetivo do investimento',
          placeholder: 'Ex: Aposentadoria',
          type: 'text',
          required: true
        },
        {
          name: 'knowledge_level',
          label: 'Conhecimento de investimentos',
          placeholder: 'Ex: Iniciante',
          type: 'select',
          options: ['Iniciante', 'Intermediário', 'Avançado'],
          required: true
        }
      ],
      examples: [],
      tags: ['investimentos', 'carteira', 'renda fixa', 'ações', 'alocação'],
      difficulty: 'intermediate',
      isPremium: true,
      usageCount: 0
    }
    // ... mais 28 prompts de finanças pessoais
  ]
};
