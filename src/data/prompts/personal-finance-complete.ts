import { PromptCategory } from '../../types/prompt';

export const personalFinancePromptsCategory: PromptCategory = {
  id: 'personal-finance',
  name: 'Organização Financeira Pessoal',
  description: 'Prompts para controle financeiro, investimentos e planejamento pessoal',
  icon: 'Wallet',
  color: 'bg-emerald-500',
  prompts: [
    // FREE PROMPTS (6 total)
    {
      id: 'pf-budget-complete',
      categoryId: 'personal-finance',
      title: 'Orçamento Mensal Completo',
      description: 'Organize todas as suas finanças pessoais',
      template: `Crie um orçamento mensal completo:

**RENDA LÍQUIDA:** {income}
**PRINCIPAIS GASTOS:** {expenses}
**OBJETIVOS FINANCEIROS:** {goals}

---

**ORÇAMENTO MENSAL:**

**1. ANÁLISE DA RENDA**
- Salário líquido:
- Renda extra (freelance, etc):
- Rendimentos (investimentos):
- **Total disponível:** R$

**2. CATEGORIZAÇÃO DE GASTOS**

*Gastos Fixos Essenciais:*
| Categoria | Valor | % da Renda |
|-----------|-------|------------|
| Moradia (aluguel/financ.) | R$ | % |
| Contas básicas (luz, água, gás) | R$ | % |
| Alimentação em casa | R$ | % |
| Transporte | R$ | % |
| Saúde (plano, medicamentos) | R$ | % |
| **Subtotal Essenciais** | **R$** | **%** |

*Gastos Variáveis:*
| Categoria | Valor | % da Renda |
|-----------|-------|------------|
| Alimentação fora | R$ | % |
| Lazer e entretenimento | R$ | % |
| Roupas e pessoal | R$ | % |
| Assinaturas (streaming, etc) | R$ | % |
| Outros | R$ | % |
| **Subtotal Variáveis** | **R$** | **%** |

**3. MÉTODO 50-30-20**
| Categoria | Ideal | Seu Atual | Ajuste |
|-----------|-------|-----------|--------|
| Necessidades (50%) | R$ | R$ | +/- |
| Desejos (30%) | R$ | R$ | +/- |
| Poupança/Investimentos (20%) | R$ | R$ | +/- |

**4. IDENTIFICAÇÃO DE EXCESSOS**
- Gasto #1 para reduzir:
- Gasto #2 para reduzir:
- Gasto #3 para eliminar:
- Economia potencial: R$/mês

**5. PLANO DE AÇÃO**
| Ação | Economia | Dificuldade |
|------|----------|-------------|
| | R$/mês | Fácil/Média/Difícil |
| | R$/mês | |
| | R$/mês | |
| **Total economia** | **R$/mês** | |

**6. DESTINAÇÃO DA ECONOMIA**
- Reserva de emergência: R$
- Investimentos: R$
- Objetivos específicos: R$

**7. ACOMPANHAMENTO**
- App/planilha recomendado:
- Frequência de revisão:
- Alertas de gastos:`,
      variables: [
        { name: 'income', label: 'Renda líquida mensal', placeholder: 'Ex: R$ 5.000 (salário) + R$ 1.000 (freelance)', type: 'text', required: true },
        { name: 'expenses', label: 'Principais gastos', placeholder: 'Ex: Aluguel R$ 1.500, Mercado R$ 800, Transporte R$ 400, etc.', type: 'textarea', required: true },
        { name: 'goals', label: 'Objetivos', placeholder: 'Ex: Quitar dívida, juntar para viagem, começar a investir', type: 'text', required: true }
      ],
      examples: [],
      tags: ['orçamento', 'planejamento', 'controle financeiro', '50-30-20'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'pf-emergency-fund',
      categoryId: 'personal-finance',
      title: 'Reserva de Emergência',
      description: 'Monte sua segurança financeira',
      template: `Planeje sua reserva de emergência:

**GASTOS MENSAIS:** {monthly_expenses}
**MESES DE RESERVA:** {months}
**PRAZO PARA MONTAR:** {timeframe}

---

**PLANO DE RESERVA DE EMERGÊNCIA:**

**1. CÁLCULO DA RESERVA**
- Gasto mensal essencial: R$ {monthly_expenses}
- Meses de cobertura: {months}
- **Valor total da reserva:** R$ [X]

*Nível de proteção:*
- 3 meses: Mínimo (trabalhador CLT)
- 6 meses: Recomendado
- 12 meses: Ideal (autônomo/empreendedor)

**2. QUANTO POUPAR POR MÊS**
- Prazo escolhido: {timeframe}
- Valor mensal necessário: R$ [X]
- % da renda a destinar: X%

**3. ONDE INVESTIR A RESERVA**

*Critérios obrigatórios:*
- ✅ Liquidez diária
- ✅ Baixo risco
- ✅ Rentabilidade > inflação

*Opções recomendadas:*
| Opção | Rentabilidade | Liquidez | Risco | Nota |
|-------|---------------|----------|-------|------|
| Tesouro Selic | ~100% CDI | D+1 | Baixíssimo | ⭐⭐⭐⭐⭐ |
| CDB Liquidez Diária | 100-102% CDI | D+0 | Baixo | ⭐⭐⭐⭐ |
| Conta remunerada | 100% CDI | D+0 | Baixo | ⭐⭐⭐⭐ |
| Poupança | ~70% CDI | D+0 | Baixo | ⭐⭐ |

**4. ESTRATÉGIA DE FORMAÇÃO**
| Mês | Aporte | Acumulado | % da Meta |
|-----|--------|-----------|-----------|
| 1 | R$ | R$ | % |
| 3 | R$ | R$ | % |
| 6 | R$ | R$ | % |
| 12 | R$ | R$ | % |

**5. QUANDO USAR A RESERVA**
✅ Usar:
- Perda de emprego
- Emergência médica
- Conserto urgente (carro, casa)
- Despesa inesperada essencial

❌ NÃO usar:
- Oportunidade de compra
- Viagem
- Presente
- Investimento "imperdível"

**6. COMO REPOR**
- Prioridade máxima após uso
- Suspender outros aportes até repor
- Prazo máximo: X meses`,
      variables: [
        { name: 'monthly_expenses', label: 'Gastos mensais essenciais', placeholder: 'Ex: R$ 4.000 (moradia + alimentação + contas + transporte)', type: 'text', required: true },
        { name: 'months', label: 'Meses de cobertura', placeholder: 'Ex: 6 meses', type: 'text', required: true },
        { name: 'timeframe', label: 'Prazo para juntar', placeholder: 'Ex: 12 meses', type: 'text', required: true }
      ],
      examples: [],
      tags: ['reserva', 'emergência', 'segurança financeira', 'poupança'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pf-debt-payoff',
      categoryId: 'personal-finance',
      title: 'Plano de Quitação de Dívidas',
      description: 'Elimine dívidas de forma estratégica',
      template: `Crie um plano para quitar dívidas:

**LISTA DE DÍVIDAS:** {debts_list}
**VALOR DISPONÍVEL POR MÊS:** {available}
**RENDA MENSAL:** {income}

---

**PLANO DE QUITAÇÃO:**

**1. MAPEAMENTO DAS DÍVIDAS**
| Dívida | Saldo | Juros/mês | Parcela | Prazo |
|--------|-------|-----------|---------|-------|
| | R$ | % | R$ | meses |
| | R$ | % | R$ | meses |
| | R$ | % | R$ | meses |
| **TOTAL** | **R$** | | **R$** | |

**2. ANÁLISE DA SITUAÇÃO**
- Total de dívidas: R$
- Comprometimento da renda: X%
- Dívida mais cara (maior juros):
- Dívida menor (mais rápida de quitar):

**3. ESTRATÉGIA RECOMENDADA**

*Método Avalanche (Matemático):*
- Pague mínimo em todas
- Extra vai para maior juros
- Economiza mais no total
- Indicado: racional, disciplinado

*Método Bola de Neve (Comportamental):*
- Pague mínimo em todas
- Extra vai para menor saldo
- Vitórias rápidas = motivação
- Indicado: precisa ver progresso

**4. PLANO DE AÇÃO**

*Ordem de ataque:*
1. Dívida: [nome] - R$ [valor] - [X meses]
2. Dívida: [nome] - R$ [valor] - [X meses]
3. Dívida: [nome] - R$ [valor] - [X meses]

*Timeline:*
| Mês | Foco | Pago | Saldo restante |
|-----|------|------|----------------|
| 1 | | R$ | R$ |
| 3 | | R$ | R$ |
| 6 | | R$ | R$ |
| 12 | | R$ | R$ |

**5. NEGOCIAÇÃO**
Para cada dívida, tente:
- Desconto para quitação à vista: Pedir 30-50%
- Redução de juros: Mostrar proposta de concorrente
- Parcelamento melhor: Mais parcelas, juros menores

**6. RENDA EXTRA**
Para acelerar:
- Vender o que não usa
- Freelance/bico temporário
- Overtime se possível
- Cortar gasto supérfluo radical

**7. PREVENÇÃO FUTURA**
- Nunca mais parcelar longo prazo
- Ter reserva de emergência
- Limite do cartão = X% da renda
- Regra: não compre se não tem`,
      variables: [
        { name: 'debts_list', label: 'Lista de dívidas', placeholder: 'Ex: Cartão R$ 3.000 (juros 12%/mês), Empréstimo R$ 10.000 (2%/mês), Crediário R$ 1.500 (5%/mês)', type: 'textarea', required: true },
        { name: 'available', label: 'Valor disponível/mês', placeholder: 'Ex: R$ 1.000 além das parcelas mínimas', type: 'text', required: true },
        { name: 'income', label: 'Renda mensal', placeholder: 'Ex: R$ 5.000', type: 'text', required: true }
      ],
      examples: [],
      tags: ['dívidas', 'quitação', 'bola de neve', 'avalanche'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pf-savings-goal',
      categoryId: 'personal-finance',
      title: 'Meta de Poupança com Plano',
      description: 'Realize seus objetivos financeiros',
      template: `Crie um plano para atingir sua meta:

**OBJETIVO:** {goal}
**VALOR NECESSÁRIO:** {amount}
**PRAZO:** {timeframe}
**QUANTO PODE POUPAR:** {available}

---

**PLANO PARA ATINGIR A META:**

**1. ANÁLISE DA META**
- Objetivo: {goal}
- Valor total: R$ {amount}
- Prazo: {timeframe}
- Valor mensal necessário: R$ [X]

**2. VIABILIDADE**
| Cenário | Aporte/mês | Prazo | Viável? |
|---------|------------|-------|---------|
| Ideal | R$ {amount}/prazo | {timeframe} | ? |
| Realista | R$ {available} | X meses | ? |
| Agressivo | R$ {available}*1.5 | X meses | ? |

**3. ESTRATÉGIA DE INVESTIMENTO**

*Prazo curto (até 1 ano):*
- Tesouro Selic
- CDB liquidez diária
- Risco: Zero a baixo

*Prazo médio (1-5 anos):*
- CDB prefixado
- LCI/LCA
- Tesouro IPCA+
- Risco: Baixo a moderado

*Prazo longo (5+ anos):*
- Tesouro IPCA+ longo
- Fundos multimercado
- ETFs/Ações (parte)
- Risco: Moderado

**4. SIMULAÇÃO COM RENTABILIDADE**
| Mês | Aporte | Rendimento | Acumulado |
|-----|--------|------------|-----------|
| 6 | R$ | R$ | R$ |
| 12 | R$ | R$ | R$ |
| 18 | R$ | R$ | R$ |
| 24 | R$ | R$ | R$ |

**5. AUTOMAÇÃO**
- Data do aporte: Dia X (após salário)
- Conta/corretora:
- Investimento automático: Sim/Não
- Alertas de progresso: Mensal

**6. PLANO B (Se não der pra poupar tudo)**
- Reduzir escopo do objetivo
- Aumentar prazo
- Buscar renda extra
- Combinação das três

**7. ACOMPANHAMENTO**
- Meta mensal: R$
- Revisão: Mensal
- App/planilha:
- Celebração em: 25%, 50%, 75%, 100%`,
      variables: [
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Viagem para Europa / Entrada do apartamento / Carro novo', type: 'text', required: true },
        { name: 'amount', label: 'Valor necessário', placeholder: 'Ex: R$ 20.000', type: 'text', required: true },
        { name: 'timeframe', label: 'Prazo', placeholder: 'Ex: 18 meses', type: 'text', required: true },
        { name: 'available', label: 'Quanto pode poupar/mês', placeholder: 'Ex: R$ 800', type: 'text', required: true }
      ],
      examples: [],
      tags: ['poupança', 'meta', 'objetivo', 'investimento'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pf-expense-audit',
      categoryId: 'personal-finance',
      title: 'Auditoria de Gastos',
      description: 'Descubra para onde vai seu dinheiro',
      template: `Faça uma auditoria completa dos seus gastos:

**PERÍODO:** {period}
**EXTRATO/FATURA:** {source}

---

**AUDITORIA DE GASTOS:**

**1. COLETA DE DADOS**
*Fontes para análise:*
- [ ] Extrato conta corrente
- [ ] Fatura cartão de crédito
- [ ] App de pagamentos (Pix, etc)
- [ ] Dinheiro em espécie (estimar)

**2. CATEGORIZAÇÃO**

*Gastos Fixos:*
| Item | Valor | Necessário? |
|------|-------|-------------|
| Moradia | R$ | ✅❌ |
| Água/Luz/Gás | R$ | ✅❌ |
| Internet/Telefone | R$ | ✅❌ |
| Transporte | R$ | ✅❌ |
| Saúde | R$ | ✅❌ |
| Educação | R$ | ✅❌ |

*Gastos Variáveis:*
| Item | Valor | Cortar? |
|------|-------|---------|
| Alimentação fora | R$ | Sim/Não/Reduzir |
| Delivery | R$ | Sim/Não/Reduzir |
| Lazer | R$ | Sim/Não/Reduzir |
| Compras online | R$ | Sim/Não/Reduzir |
| Assinaturas | R$ | Sim/Não/Reduzir |

**3. ANÁLISE DOS VAMPIROS FINANCEIROS**

*Top 5 gastos desnecessários:*
| # | Gasto | Valor/mês | Valor/ano |
|---|-------|-----------|-----------|
| 1 | | R$ | R$ |
| 2 | | R$ | R$ |
| 3 | | R$ | R$ |
| 4 | | R$ | R$ |
| 5 | | R$ | R$ |
| | **TOTAL** | **R$** | **R$** |

**4. ASSINATURAS ESQUECIDAS**
| Serviço | Valor | Usa? | Ação |
|---------|-------|------|------|
| Netflix | R$ | Sim/Não | Manter/Cancelar |
| Spotify | R$ | Sim/Não | Manter/Cancelar |
| Academia | R$ | Sim/Não | Manter/Cancelar |
| Apps | R$ | Sim/Não | Manter/Cancelar |

**5. COMPRAS POR IMPULSO**
- Quantas no mês: X
- Valor total: R$
- Gatilhos identificados:
- Estratégia para evitar:

**6. PLANO DE CORTES**
| Corte | Economia/mês | Dificuldade | Quando |
|-------|--------------|-------------|--------|
| | R$ | Fácil | Imediato |
| | R$ | Média | 30 dias |
| | R$ | Difícil | 60 dias |
| **TOTAL** | **R$** | | |

**7. ECONOMIA ANUAL PROJETADA**
- Cortes mensais: R$ [X]
- Economia anual: R$ [X * 12]
- O que fazer com esse dinheiro:`,
      variables: [
        { name: 'period', label: 'Período analisado', placeholder: 'Ex: Últimos 3 meses', type: 'text', required: true },
        { name: 'source', label: 'Fonte dos dados', placeholder: 'Ex: Extrato Nubank + Fatura Itaú', type: 'text', required: true }
      ],
      examples: [],
      tags: ['auditoria', 'gastos', 'economia', 'cortes'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pf-financial-independence',
      categoryId: 'personal-finance',
      title: 'Calculadora de Independência Financeira',
      description: 'Quanto precisa para viver de renda',
      template: `Calcule sua independência financeira:

**GASTO MENSAL DESEJADO:** {monthly_need}
**IDADE ATUAL:** {current_age}
**PATRIMÔNIO ATUAL:** {current_wealth}
**APORTE MENSAL POSSÍVEL:** {monthly_savings}

---

**PLANO DE INDEPENDÊNCIA FINANCEIRA:**

**1. CÁLCULO DO NÚMERO MÁGICO**

*Regra dos 4% (Método FIRE):*
- Gasto mensal: R$ {monthly_need}
- Gasto anual: R$ [X * 12]
- **Patrimônio necessário:** R$ [Gasto anual / 0.04]

*Explicação:*
Retirar 4% ao ano do patrimônio é seguro para durar 30+ anos

**2. ONDE VOCÊ ESTÁ**
- Patrimônio atual: R$ {current_wealth}
- % do objetivo: X%
- Faltam: R$ [X]

**3. SIMULAÇÃO DE CENÁRIOS**

*Cenário Conservador (0.5% real/mês):*
| Aporte/mês | Tempo | Idade IF |
|------------|-------|----------|
| R$ {monthly_savings} | X anos | X anos |

*Cenário Moderado (0.7% real/mês):*
| Aporte/mês | Tempo | Idade IF |
|------------|-------|----------|
| R$ {monthly_savings} | X anos | X anos |

*Cenário Agressivo (1% real/mês):*
| Aporte/mês | Tempo | Idade IF |
|------------|-------|----------|
| R$ {monthly_savings} | X anos | X anos |

**4. ALAVANCAS PARA ACELERAR**

| Estratégia | Impacto | Como |
|------------|---------|------|
| Aumentar aportes | Alto | Renda extra, cortes |
| Aumentar rentabilidade | Médio | Mais risco (educação) |
| Reduzir gasto futuro | Alto | Lifestyle design |

**5. ESTRATÉGIA DE INVESTIMENTOS**

*Fase de acumulação (agora até IF):*
| Classe | % | Objetivo |
|--------|---|----------|
| Renda Fixa | % | Segurança, liquidez |
| Renda Variável BR | % | Crescimento |
| Renda Variável EUA | % | Dolarização |
| FIIs | % | Renda passiva |

*Fase de usufruto (pós-IF):*
| Classe | % | Objetivo |
|--------|---|----------|
| Renda Fixa | % | Preservação |
| Dividendos | % | Renda mensal |
| FIIs | % | Renda mensal |

**6. MARCOS NO CAMINHO**
| Marco | Valor | Significado |
|-------|-------|-------------|
| 1º milhão | R$ 1M | Milestone psicológico |
| Coast FIRE | R$ X | Pode parar de aportar |
| Barista FIRE | R$ X | Pode reduzir trabalho |
| FIRE completo | R$ X | Independência total |

**7. PRÓXIMOS PASSOS**
1. [Ação imediata]
2. [Ação em 30 dias]
3. [Ação em 90 dias]`,
      variables: [
        { name: 'monthly_need', label: 'Gasto mensal desejado', placeholder: 'Ex: R$ 10.000 (quanto quer para viver)', type: 'text', required: true },
        { name: 'current_age', label: 'Idade atual', placeholder: 'Ex: 30 anos', type: 'text', required: true },
        { name: 'current_wealth', label: 'Patrimônio atual', placeholder: 'Ex: R$ 100.000', type: 'text', required: true },
        { name: 'monthly_savings', label: 'Aporte mensal possível', placeholder: 'Ex: R$ 3.000', type: 'text', required: true }
      ],
      examples: [],
      tags: ['FIRE', 'independência financeira', 'aposentadoria', 'liberdade'],
      difficulty: 'intermediate',
      isPremium: false
    },

    // PREMIUM PROMPTS
    {
      id: 'pf-investment-portfolio',
      categoryId: 'personal-finance',
      title: 'Montagem de Carteira de Investimentos',
      description: 'Crie uma carteira diversificada adequada ao seu perfil',
      template: `Monte uma carteira de investimentos personalizada:

**PERFIL DE RISCO:** {risk_profile}
**VALOR PARA INVESTIR:** {amount}
**OBJETIVO:** {goal}
**PRAZO:** {timeframe}

---

**CARTEIRA DE INVESTIMENTOS:**

**1. ANÁLISE DO PERFIL**
- Perfil: {risk_profile}
- Tolerância a perdas: X%
- Experiência com investimentos:
- Necessidade de liquidez:

**2. ALOCAÇÃO RECOMENDADA**

*Perfil Conservador:*
| Classe | % | Exemplo | Risco |
|--------|---|---------|-------|
| Renda Fixa Pós | 50% | Tesouro Selic, CDB DI | Muito baixo |
| Renda Fixa Pré/IPCA+ | 30% | Tesouro IPCA+, LCI/LCA | Baixo |
| Multimercado | 15% | Fundos MM conservadores | Baixo-Médio |
| Renda Variável | 5% | FIIs ou ETFs | Médio |

*Perfil Moderado:*
| Classe | % | Exemplo | Risco |
|--------|---|---------|-------|
| Renda Fixa | 40% | Mix pós e prefixado | Baixo |
| Multimercado | 20% | Fundos macro, arbitragem | Médio |
| FIIs | 15% | Fundos imobiliários | Médio |
| Ações BR | 15% | Blue chips, ETFs | Alto |
| Internacional | 10% | BDRs, ETFs EUA | Alto |

*Perfil Arrojado:*
| Classe | % | Exemplo | Risco |
|--------|---|---------|-------|
| Renda Fixa | 20% | Reserva + Tesouro IPCA+ | Baixo |
| Ações BR | 30% | Carteira diversificada | Alto |
| FIIs | 20% | Fundos de tijolo e papel | Médio |
| Internacional | 25% | ETFs globais, BDRs | Alto |
| Alternativos | 5% | Cripto, Startups | Muito alto |

**3. SELEÇÃO DE ATIVOS**

*Renda Fixa (R$ X):*
| Ativo | Valor | Vencimento | Taxa |
|-------|-------|------------|------|
| | R$ | | |
| | R$ | | |

*Renda Variável (R$ X):*
| Ativo | Valor | Setor | Tese |
|-------|-------|-------|------|
| | R$ | | |
| | R$ | | |

**4. APORTES MENSAIS**
| Classe | Valor/mês | % |
|--------|-----------|---|
| | R$ | % |
| | R$ | % |
| Total | R$ | 100% |

**5. REBALANCEAMENTO**
- Frequência: Semestral/Anual
- Gatilho: Desvio de X% da alocação
- Como fazer: Aportar na classe defasada

**6. RESERVA DE OPORTUNIDADE**
- Manter X% em liquidez para quedas
- Quando usar: Queda de X%+ do Ibovespa
- Como usar: Aportar gradualmente

**7. MONITORAMENTO**
- App/planilha para tracking
- Métricas: Rentabilidade vs CDI, Volatilidade
- Revisão de tese: Anual`,
      variables: [
        { name: 'risk_profile', label: 'Perfil de risco', placeholder: 'Ex: Moderado (aceito perdas de até 15% no curto prazo)', type: 'text', required: true },
        { name: 'amount', label: 'Valor para investir', placeholder: 'Ex: R$ 50.000 inicial + R$ 2.000/mês', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Aposentadoria / Comprar imóvel / Liberdade financeira', type: 'text', required: true },
        { name: 'timeframe', label: 'Prazo', placeholder: 'Ex: 10 anos', type: 'text', required: true }
      ],
      examples: [],
      tags: ['investimentos', 'carteira', 'alocação', 'diversificação'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'pf-tax-planning',
      categoryId: 'personal-finance',
      title: 'Planejamento Tributário Pessoal',
      description: 'Pague menos impostos legalmente',
      template: `Faça um planejamento tributário pessoal:

**RENDA ANUAL:** {annual_income}
**TIPO DE RENDA:** {income_type}
**DESPESAS DEDUTÍVEIS:** {deductibles}

---

**PLANEJAMENTO TRIBUTÁRIO:**

**1. ANÁLISE DA SITUAÇÃO ATUAL**
- Renda bruta anual: R$ {annual_income}
- Tipo: {income_type}
- IR devido estimado: R$
- Alíquota efetiva: X%

**2. TABELA PROGRESSIVA IR 2024**
| Faixa | Alíquota | Dedução |
|-------|----------|---------|
| Até R$ 2.259,20 | Isento | - |
| R$ 2.259,21 a R$ 2.826,65 | 7,5% | R$ 169,44 |
| R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 381,44 |
| R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 662,77 |
| Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

**3. DEDUÇÕES PERMITIDAS**
| Dedução | Seu valor | Limite | Economia IR |
|---------|-----------|--------|-------------|
| Dependentes | R$ | R$ 2.275,08/dep | R$ |
| Educação | R$ | R$ 3.561,50/pessoa | R$ |
| Saúde | R$ | Sem limite | R$ |
| Previdência privada | R$ | 12% renda bruta | R$ |
| Pensão alimentícia | R$ | Valor judicial | R$ |
| **TOTAL DEDUÇÕES** | **R$** | | **R$** |

**4. ESTRATÉGIAS DE OTIMIZAÇÃO**

*Previdência Privada PGBL:*
- Contribuição máxima: 12% da renda bruta
- Benefício: Dedução do IR agora
- Tributação: Na saída (regressiva ou progressiva)
- Economia imediata: R$ [X]

*Declaração Completa vs Simplificada:*
| Modelo | Base de cálculo | IR devido |
|--------|-----------------|-----------|
| Simplificada (20%) | R$ | R$ |
| Completa | R$ | R$ |
| **Melhor opção:** | | |

**5. INVESTIMENTOS E IR**
| Investimento | Tributação | Estratégia |
|--------------|------------|------------|
| Ações (swing) | 15% s/ lucro | Usar prejuízo para compensar |
| FIIs | 20% s/ lucro | Isento até R$ 20k/mês |
| Renda Fixa | Regressiva (15-22,5%) | Manter +2 anos |
| LCI/LCA | Isento PF | Priorizar se alíquota alta |

**6. ECONOMIA TOTAL POSSÍVEL**
| Estratégia | Economia/ano |
|------------|--------------|
| PGBL | R$ |
| Deduções | R$ |
| Investimentos isentos | R$ |
| **TOTAL** | **R$** |

**7. CALENDÁRIO TRIBUTÁRIO**
| Mês | Ação |
|-----|------|
| Janeiro | Reunir documentos |
| Março | Declarar IRPF |
| Dezembro | Contribuir PGBL |`,
      variables: [
        { name: 'annual_income', label: 'Renda anual bruta', placeholder: 'Ex: R$ 150.000', type: 'text', required: true },
        { name: 'income_type', label: 'Tipo de renda', placeholder: 'Ex: CLT + Freelance / Só CLT / Autônomo', type: 'text', required: true },
        { name: 'deductibles', label: 'Despesas dedutíveis atuais', placeholder: 'Ex: Plano saúde R$ 6.000/ano, 1 dependente, educação R$ 3.000', type: 'textarea', required: true }
      ],
      examples: [],
      tags: ['impostos', 'IR', 'planejamento tributário', 'PGBL'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pf-real-estate-purchase',
      categoryId: 'personal-finance',
      title: 'Planejamento de Compra de Imóvel',
      description: 'Compre seu imóvel de forma inteligente',
      template: `Planeje a compra do seu imóvel:

**VALOR DO IMÓVEL:** {property_value}
**ENTRADA DISPONÍVEL:** {down_payment}
**RENDA MENSAL:** {income}
**PRAZO DESEJADO:** {term}

---

**PLANEJAMENTO DE COMPRA:**

**1. ANÁLISE FINANCEIRA**
- Valor do imóvel: R$ {property_value}
- Entrada disponível: R$ {down_payment} (X%)
- Valor a financiar: R$ [X]
- Renda mensal: R$ {income}

**2. SIMULAÇÃO DE FINANCIAMENTO**

*Sistema SAC (parcelas decrescentes):*
| Item | Valor |
|------|-------|
| Primeira parcela | R$ |
| Última parcela | R$ |
| Total pago | R$ |
| Juros totais | R$ |

*Sistema Price (parcelas fixas):*
| Item | Valor |
|------|-------|
| Parcela fixa | R$ |
| Total pago | R$ |
| Juros totais | R$ |

**Recomendação:** [SAC/Price] porque [motivo]

**3. CAPACIDADE DE PAGAMENTO**
- Renda líquida: R$ {income}
- Máximo comprometido (30%): R$
- Parcela simulada: R$
- Folga mensal: R$
- Status: ✅ Viável / ⚠️ No limite / ❌ Inviável

**4. CUSTOS ADICIONAIS**
| Item | Valor | Quando |
|------|-------|--------|
| ITBI (2-3%) | R$ | Escritura |
| Escritura/Registro | R$ | Cartório |
| Avaliação banco | R$ | Financiamento |
| Mudança | R$ | Pós-compra |
| Reformas | R$ | Opcional |
| **TOTAL** | **R$** | |

**5. COMPARATIVO: COMPRAR vs ALUGAR**
| Critério | Comprar | Alugar |
|----------|---------|--------|
| Custo mensal | R$ (parcela+cond+IPTU) | R$ (aluguel+cond) |
| Patrimônio | Sim | Não |
| Flexibilidade | Baixa | Alta |
| Custo de oportunidade | Entrada investida | - |

*Break-even:* X anos (quando comprar passa a valer mais que alugar)

**6. ESTRATÉGIA DE ENTRADA**
| Opção | Valor | Origem |
|-------|-------|--------|
| Poupança | R$ | Reserva atual |
| FGTS | R$ | Verificar saldo |
| Consórcio contemplado | R$ | Se tiver |
| Venda de bens | R$ | Carro, etc |
| **TOTAL ENTRADA** | **R$** | |

**7. CHECKLIST PRÉ-COMPRA**
- [ ] Entrada de 20%+ (evita juros altos)
- [ ] Parcela < 30% da renda
- [ ] Reserva de emergência mantida
- [ ] Custos adicionais provisionados
- [ ] Documentação do imóvel OK
- [ ] Certidões do vendedor OK

**8. CRONOGRAMA**
| Fase | Prazo | Ação |
|------|-------|------|
| Agora | | Juntar entrada |
| 6 meses | | Pesquisar imóveis |
| 9 meses | | Simular financiamentos |
| 12 meses | | Proposta e negociação |`,
      variables: [
        { name: 'property_value', label: 'Valor do imóvel', placeholder: 'Ex: R$ 500.000', type: 'text', required: true },
        { name: 'down_payment', label: 'Entrada disponível', placeholder: 'Ex: R$ 100.000 (20%)', type: 'text', required: true },
        { name: 'income', label: 'Renda mensal líquida', placeholder: 'Ex: R$ 15.000', type: 'text', required: true },
        { name: 'term', label: 'Prazo desejado', placeholder: 'Ex: 25 anos / 300 meses', type: 'text', required: true }
      ],
      examples: [],
      tags: ['imóvel', 'financiamento', 'casa própria', 'compra'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pf-retirement-planning',
      categoryId: 'personal-finance',
      title: 'Planejamento de Aposentadoria',
      description: 'Prepare-se para uma aposentadoria tranquila',
      template: `Planeje sua aposentadoria:

**IDADE ATUAL:** {current_age}
**IDADE DE APOSENTADORIA:** {retirement_age}
**RENDA DESEJADA:** {desired_income}
**PATRIMÔNIO ATUAL:** {current_wealth}

---

**PLANO DE APOSENTADORIA:**

**1. DIAGNÓSTICO**
- Anos até aposentar: [retirement_age - current_age]
- Renda desejada: R$ {desired_income}/mês
- Patrimônio necessário: R$ [desired_income * 12 / 0.04]
- Patrimônio atual: R$ {current_wealth}
- Gap: R$ [X]

**2. FONTES DE RENDA NA APOSENTADORIA**
| Fonte | Valor estimado/mês | % do total |
|-------|-------------------|------------|
| INSS | R$ | % |
| Previdência privada | R$ | % |
| Investimentos | R$ | % |
| Aluguéis | R$ | % |
| **TOTAL** | **R$** | **100%** |

**3. CÁLCULO DO INSS**
- Tempo de contribuição atual: X anos
- Tempo faltante: X anos
- Benefício estimado: R$ [X]/mês
- Teto INSS atual: R$ 7.507,49

*Observação:* INSS deve ser complemento, não base

**4. PREVIDÊNCIA PRIVADA**
| Aspecto | PGBL | VGBL |
|---------|------|------|
| Dedução IR | Até 12% renda | Não |
| Ideal para | Declara completo | Declara simplificado |
| Tributação | Sobre total | Sobre rendimento |

*Recomendação:* [PGBL/VGBL]
*Contribuição sugerida:* R$ [X]/mês

**5. SIMULAÇÃO DE ACUMULAÇÃO**

| Cenário | Aporte/mês | Rentab. | Patrimônio final |
|---------|------------|---------|------------------|
| Conservador | R$ | 0.5%/mês | R$ |
| Moderado | R$ | 0.7%/mês | R$ |
| Agressivo | R$ | 1%/mês | R$ |

**6. ESTRATÉGIA DE INVESTIMENTOS**

*Fase de acumulação (agora):*
- Mais risco = mais retorno potencial
- Alocação em renda variável: X%
- Horizon longo permite volatilidade

*Fase de transição (5-10 anos antes):*
- Reduzir risco gradualmente
- Migrar para renda fixa
- Proteger o patrimônio acumulado

*Fase de usufruto (aposentado):*
- Priorizar renda passiva
- Dividendos, FIIs, títulos
- Preservar capital

**7. CRONOGRAMA DE AÇÃO**
| Idade | Ação |
|-------|------|
| Agora | Começar/aumentar aportes |
| +5 anos | Revisar estratégia |
| -10 anos | Começar transição |
| -5 anos | Reduzir risco significativo |
| Aposentadoria | Iniciar retiradas |

**8. RISCOS E MITIGAÇÕES**
| Risco | Mitigação |
|-------|-----------|
| Inflação | Títulos IPCA+, ações |
| Longevidade | Margem de segurança 20% |
| Saúde | Plano de saúde, reserva |
| Mudanças legais | Diversificação de fontes |`,
      variables: [
        { name: 'current_age', label: 'Idade atual', placeholder: 'Ex: 35 anos', type: 'text', required: true },
        { name: 'retirement_age', label: 'Idade de aposentadoria', placeholder: 'Ex: 60 anos', type: 'text', required: true },
        { name: 'desired_income', label: 'Renda mensal desejada', placeholder: 'Ex: R$ 15.000 (em valores de hoje)', type: 'text', required: true },
        { name: 'current_wealth', label: 'Patrimônio atual', placeholder: 'Ex: R$ 200.000 (investimentos + previdência)', type: 'text', required: true }
      ],
      examples: [],
      tags: ['aposentadoria', 'previdência', 'INSS', 'longo prazo'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pf-couple-finances',
      categoryId: 'personal-finance',
      title: 'Finanças do Casal',
      description: 'Organize as finanças a dois',
      template: `Organize as finanças do casal:

**RENDA PESSOA 1:** {income1}
**RENDA PESSOA 2:** {income2}
**MODELO PREFERIDO:** {model}
**OBJETIVOS EM COMUM:** {goals}

---

**FINANÇAS DO CASAL:**

**1. ANÁLISE DAS RENDAS**
| Pessoa | Renda líquida | % do total |
|--------|---------------|------------|
| Pessoa 1 | R$ {income1} | % |
| Pessoa 2 | R$ {income2} | % |
| **Total casal** | **R$** | **100%** |

**2. MODELOS DE ORGANIZAÇÃO**

*Modelo 1: Conta Conjunta Total*
- Tudo vai para conta conjunta
- Todas despesas saem dela
- Mesada individual igual
- Ideal para: Casais alinhados, rendas similares

*Modelo 2: Proporcional*
- Cada um contribui % da renda
- Conta conjunta para despesas comuns
- Resto é individual
- Ideal para: Rendas muito diferentes

*Modelo 3: 50/50*
- Despesas divididas igualmente
- Restante é individual
- Simples e claro
- Ideal para: Rendas similares, independência

*Modelo 4: Responsabilidades*
- Cada um paga contas específicas
- Sem conta conjunta
- Ideal para: Quem prefere separação

**Recomendação para vocês:** [Modelo X] porque [motivo]

**3. ORÇAMENTO DO CASAL**

*Despesas Fixas Conjuntas:*
| Item | Valor | Quem paga | Contribuição |
|------|-------|-----------|--------------|
| Moradia | R$ | Conjunto | P1: R$ / P2: R$ |
| Contas | R$ | Conjunto | P1: R$ / P2: R$ |
| Mercado | R$ | Conjunto | P1: R$ / P2: R$ |
| **Total** | **R$** | | |

*Despesas Individuais:*
| Pessoa 1 | Pessoa 2 |
|----------|----------|
| R$ (livre) | R$ (livre) |

**4. METAS FINANCEIRAS CONJUNTAS**
| Meta | Valor | Prazo | Aporte mensal |
|------|-------|-------|---------------|
| Reserva emergência | R$ | X meses | R$ |
| Viagem | R$ | X meses | R$ |
| Casa/Apartamento | R$ | X anos | R$ |
| Filhos | R$ | X anos | R$ |

**5. REGRAS DE CONVIVÊNCIA FINANCEIRA**
- [ ] Transparência total (ou parcial?)
- [ ] Limite para gastos sem consultar: R$
- [ ] Frequência de reunião financeira: Mensal
- [ ] Quem cuida das contas: Pessoa X
- [ ] Como lidar com dívidas anteriores

**6. INVESTIMENTOS DO CASAL**
- Conta conjunta ou separadas?
- Perfil de risco alinhado?
- Objetivos de curto e longo prazo
- Previdência privada

**7. PROTEÇÃO**
- Seguro de vida: Quem, quanto
- Plano de saúde: Individual ou familiar
- Testamento/planejamento sucessório
- Previdência com beneficiário`,
      variables: [
        { name: 'income1', label: 'Renda Pessoa 1', placeholder: 'Ex: R$ 8.000', type: 'text', required: true },
        { name: 'income2', label: 'Renda Pessoa 2', placeholder: 'Ex: R$ 5.000', type: 'text', required: true },
        { name: 'model', label: 'Modelo preferido', placeholder: 'Ex: Conta conjunta / Proporcional / 50-50', type: 'text', required: true },
        { name: 'goals', label: 'Objetivos em comum', placeholder: 'Ex: Casa própria em 3 anos, viagem anual, reserva de emergência', type: 'textarea', required: true }
      ],
      examples: [],
      tags: ['casal', 'família', 'orçamento', 'relacionamento'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pf-side-income',
      categoryId: 'personal-finance',
      title: 'Renda Extra Estruturada',
      description: 'Crie fontes adicionais de renda',
      template: `Planeje fontes de renda extra:

**HABILIDADES:** {skills}
**TEMPO DISPONÍVEL:** {time}
**META DE RENDA EXTRA:** {target}
**RECURSOS DISPONÍVEIS:** {resources}

---

**PLANO DE RENDA EXTRA:**

**1. ANÁLISE DE POSSIBILIDADES**

| Tipo | Exemplos | Investimento | Retorno | Escalável |
|------|----------|--------------|---------|-----------|
| Serviços (tempo) | Freelance, consultoria | Baixo | Médio | Não |
| Produtos digitais | Cursos, ebooks | Médio | Alto | Sim |
| Investimentos | Dividendos, FIIs | Alto | Médio | Sim |
| Aluguel | Imóvel, carro | Alto | Médio | Limitado |
| Afiliados | Comissões | Baixo | Variável | Sim |

**2. MATCH COM SUAS HABILIDADES**

*Baseado em: {skills}*

| Oportunidade | Fit | Potencial | Prioridade |
|--------------|-----|-----------|------------|
| | Alto/Médio/Baixo | R$/mês | 1-5 |
| | | | |
| | | | |

**3. TOP 3 RECOMENDADAS**

*Opção 1: [Nome]*
- O que é:
- Investimento inicial: R$/tempo
- Renda potencial: R$/mês
- Tempo para começar: X semanas
- Prós:
- Contras:

*Opção 2: [Nome]*
- [Mesma estrutura]

*Opção 3: [Nome]*
- [Mesma estrutura]

**4. PLANO DE IMPLEMENTAÇÃO**

*Semana 1-2:*
- [ ] [Ação]
- [ ] [Ação]

*Semana 3-4:*
- [ ] [Ação]
- [ ] [Ação]

*Mês 2:*
- [ ] [Ação]
- [ ] Primeiros ganhos

**5. ESTRUTURA NECESSÁRIA**
| Item | Necessário | Já tem | Investir |
|------|-----------|--------|----------|
| Equipamento | | | R$ |
| Conhecimento | | | R$ |
| Ferramentas | | | R$ |
| Tempo | Xh/semana | | - |

**6. PRECIFICAÇÃO**
| Serviço/Produto | Mercado | Seu preço | Por que |
|-----------------|---------|-----------|---------|
| | R$ | R$ | |

**7. PROJEÇÃO DE RESULTADOS**
| Mês | Receita | Custos | Lucro |
|-----|---------|--------|-------|
| 1 | R$ | R$ | R$ |
| 3 | R$ | R$ | R$ |
| 6 | R$ | R$ | R$ |
| 12 | R$ | R$ | R$ |

**8. O QUE FAZER COM A RENDA EXTRA**
- X% para objetivo principal
- X% para reinvestir no projeto
- X% para reserva/investimentos`,
      variables: [
        { name: 'skills', label: 'Suas habilidades', placeholder: 'Ex: Excel avançado, inglês, escrita, design, programação', type: 'textarea', required: true },
        { name: 'time', label: 'Tempo disponível', placeholder: 'Ex: 10 horas por semana (noites e fins de semana)', type: 'text', required: true },
        { name: 'target', label: 'Meta de renda extra', placeholder: 'Ex: R$ 2.000/mês', type: 'text', required: true },
        { name: 'resources', label: 'Recursos disponíveis', placeholder: 'Ex: Computador, R$ 500 para investir, rede de contatos', type: 'text', required: true }
      ],
      examples: [],
      tags: ['renda extra', 'freelance', 'side hustle', 'extra'],
      difficulty: 'intermediate',
      isPremium: true
    }
  ]
};
