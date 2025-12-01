import { PromptCategory } from '../../types/prompt';

export const businessPromptsCategory: PromptCategory = {
  id: 'business',
  name: 'Negócios',
  description: 'Prompts para gestão, estratégia e crescimento de negócios',
  icon: 'Briefcase',
  color: 'bg-indigo-500',
  prompts: [
    // FREE PROMPTS (6 total)
    {
      id: 'biz-swot',
      categoryId: 'business',
      title: 'Análise SWOT Completa',
      description: 'Forças, fraquezas, oportunidades e ameaças com plano de ação',
      template: `Faça uma análise SWOT completa:

**NEGÓCIO:** {business}
**MERCADO:** {market}
**ESTÁGIO ATUAL:** {stage}

---

**ANÁLISE SWOT:**

**1. FORÇAS (Strengths) - Interno/Positivo**
Analise vantagens competitivas internas:
- Recursos únicos
- Competências da equipe
- Ativos e propriedade intelectual
- Relacionamentos e parcerias
- Processos eficientes
- Reputação e marca

**2. FRAQUEZAS (Weaknesses) - Interno/Negativo**
Identifique limitações internas:
- Gaps de competência
- Recursos limitados
- Processos ineficientes
- Dependências críticas
- Problemas de cultura/equipe
- Dívidas técnicas ou financeiras

**3. OPORTUNIDADES (Opportunities) - Externo/Positivo**
Mapeie tendências favoráveis:
- Mudanças de mercado
- Novas tecnologias
- Mudanças regulatórias
- Comportamento do consumidor
- Gaps dos concorrentes
- Parcerias potenciais

**4. AMEAÇAS (Threats) - Externo/Negativo**
Identifique riscos externos:
- Novos concorrentes
- Mudanças econômicas
- Regulamentação adversa
- Obsolescência tecnológica
- Mudança de comportamento
- Dependência de fornecedores

**5. MATRIZ SWOT**
|  | Positivo | Negativo |
|--|----------|----------|
| Interno | FORÇAS | FRAQUEZAS |
| Externo | OPORTUNIDADES | AMEAÇAS |

**6. ESTRATÉGIAS CRUZADAS**
- SO (Forças + Oportunidades): Como usar forças para aproveitar oportunidades
- WO (Fraquezas + Oportunidades): Como superar fraquezas para aproveitar oportunidades
- ST (Forças + Ameaças): Como usar forças para mitigar ameaças
- WT (Fraquezas + Ameaças): Como minimizar fraquezas e evitar ameaças

**7. PLANO DE AÇÃO**
| Prioridade | Ação | Prazo | Responsável |
|------------|------|-------|-------------|
| Alta | | | |
| Alta | | | |
| Média | | | |
| Média | | | |`,
      variables: [
        { name: 'business', label: 'Negócio', placeholder: 'Ex: Startup de fintech para PMEs', type: 'text', required: true },
        { name: 'market', label: 'Mercado', placeholder: 'Ex: Pagamentos e gestão financeira digital', type: 'text', required: true },
        { name: 'stage', label: 'Estágio', placeholder: 'Ex: Crescimento inicial (Series A)', type: 'text', required: true }
      ],
      examples: [],
      tags: ['swot', 'estratégia', 'análise', 'planejamento'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'biz-competitor-analysis',
      categoryId: 'business',
      title: 'Análise de Concorrentes',
      description: 'Mapeie e analise a competição detalhadamente',
      template: `Faça uma análise completa de concorrentes:

**SEU NEGÓCIO:** {business}
**PRINCIPAIS CONCORRENTES:** {competitors}
**SEUS DIFERENCIAIS:** {differentials}

---

**ANÁLISE COMPETITIVA:**

**1. MAPEAMENTO DE CONCORRENTES**

*Concorrentes Diretos (mesma solução, mesmo público):*
| Concorrente | Tamanho | Posicionamento | Força principal |
|-------------|---------|----------------|-----------------|
| | | | |
| | | | |

*Concorrentes Indiretos (solução diferente, mesmo problema):*
| Concorrente | Solução alternativa | Público |
|-------------|---------------------|---------|
| | | |
| | | |

**2. ANÁLISE DETALHADA POR CONCORRENTE**

*Concorrente 1: [Nome]*
- Website/presença digital:
- Proposta de valor:
- Modelo de negócio:
- Pricing:
- Pontos fortes:
- Pontos fracos:
- Canais de aquisição:
- Público principal:

*[Repetir para outros concorrentes]*

**3. COMPARATIVO**

| Critério | Você | Conc. 1 | Conc. 2 | Conc. 3 |
|----------|------|---------|---------|---------|
| Preço | | | | |
| Qualidade | | | | |
| Features | | | | |
| Suporte | | | | |
| UX/Design | | | | |
| Marca | | | | |

**4. ANÁLISE DE PREÇOS**
| Produto/Plano | Você | Mercado (média) | Líder |
|---------------|------|-----------------|-------|
| Básico | | | |
| Intermediário | | | |
| Premium | | | |

**5. GAPS E OPORTUNIDADES**
- O que ninguém faz bem?
- Reclamações comuns dos clientes deles?
- Nichos mal atendidos?
- Features pedidos e não entregues?

**6. SEUS DIFERENCIAIS**
- Por que um cliente escolheria você?
- O que é difícil de copiar?
- Qual sua "unfair advantage"?

**7. ESTRATÉGIA COMPETITIVA**
- Onde competir de frente
- Onde evitar competição
- Como se posicionar
- Ações prioritárias`,
      variables: [
        { name: 'business', label: 'Seu negócio', placeholder: 'Ex: E-commerce de moda sustentável', type: 'text', required: true },
        { name: 'competitors', label: 'Concorrentes', placeholder: 'Ex: Zara, Renner, Amaro, Insecta Shoes', type: 'text', required: true },
        { name: 'differentials', label: 'Seus diferenciais', placeholder: 'Ex: 100% sustentável, produção local, transparência', type: 'text', required: true }
      ],
      examples: [],
      tags: ['concorrência', 'análise', 'mercado', 'benchmark', 'estratégia'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'biz-elevator-pitch',
      categoryId: 'business',
      title: 'Elevator Pitch Perfeito',
      description: 'Apresente seu negócio de forma impactante em 30 segundos',
      template: `Crie um elevator pitch impactante:

**NEGÓCIO:** {business}
**PROBLEMA QUE RESOLVE:** {problem}
**SUA SOLUÇÃO:** {solution}
**DIFERENCIAL ÚNICO:** {unique}

---

**ESTRUTURA DO PITCH:**

**1. FÓRMULA DO PITCH (30 segundos)**

"Para [PÚBLICO-ALVO] que [TÊM O PROBLEMA],
[NOME DO NEGÓCIO] é [CATEGORIA]
que [BENEFÍCIO PRINCIPAL].
Diferente de [ALTERNATIVAS],
nós [DIFERENCIAL ÚNICO]."

**2. VERSÃO 30 SEGUNDOS (Elevador)**
[Escreva a versão mais concisa]

**3. VERSÃO 1 MINUTO (Networking)**
- Gancho de atenção (problema)
- Sua solução
- Como funciona (1 frase)
- Resultados/prova social
- Call to action

**4. VERSÃO 2 MINUTOS (Apresentação)**
- Contexto do problema
- Tamanho da oportunidade
- Sua solução detalhada
- Modelo de negócio
- Tração/resultados
- Equipe (se relevante)
- Próximos passos

**5. ELEMENTOS-CHAVE**
- Headline memorável:
- Analogia ("Somos o X para Y"):
- Número impactante:
- História pessoal (opcional):

**6. PARA DIFERENTES AUDIÊNCIAS**

*Para Investidores:*
[Foco em oportunidade de mercado e crescimento]

*Para Clientes:*
[Foco em benefícios e resultados]

*Para Parceiros:*
[Foco em sinergia e complementaridade]

*Para Imprensa:*
[Foco em novidade e impacto social]

**7. PERGUNTAS FREQUENTES**
Prepare respostas curtas para:
- Como vocês ganham dinheiro?
- Quem são os concorrentes?
- Por que vocês?
- Qual o tamanho do mercado?
- Qual a tração até agora?`,
      variables: [
        { name: 'business', label: 'Negócio', placeholder: 'Ex: NutriApp - app de nutrição personalizada', type: 'text', required: true },
        { name: 'problem', label: 'Problema', placeholder: 'Ex: Pessoas não conseguem manter dietas porque são genéricas', type: 'text', required: true },
        { name: 'solution', label: 'Solução', placeholder: 'Ex: IA que cria planos alimentares personalizados', type: 'text', required: true },
        { name: 'unique', label: 'Diferencial', placeholder: 'Ex: Adapta em tempo real baseado em feedback e resultados', type: 'text', required: true }
      ],
      examples: [],
      tags: ['pitch', 'apresentação', 'networking', 'vendas', 'investidores'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'biz-cashflow',
      categoryId: 'business',
      title: 'Projeção de Fluxo de Caixa',
      description: 'Monte uma projeção financeira realista de 12 meses',
      template: `Crie uma projeção de fluxo de caixa:

**NEGÓCIO:** {business}
**RECEITA MENSAL ATUAL:** {revenue}
**CUSTOS FIXOS:** {fixed_costs}
**CUSTOS VARIÁVEIS:** {variable_costs}

---

**PROJEÇÃO DE FLUXO DE CAIXA (12 MESES):**

**1. PREMISSAS**
- Crescimento mensal de receita: X%
- Sazonalidade: [meses de alta/baixa]
- Inflação de custos: X%
- Novos custos previstos: [quando/quanto]
- Investimentos planejados: [quando/quanto]

**2. RECEITAS PROJETADAS**
| Mês | Receita Operacional | Outras Receitas | Total |
|-----|---------------------|-----------------|-------|
| Jan | | | |
| Fev | | | |
| Mar | | | |
| Abr | | | |
| Mai | | | |
| Jun | | | |
| Jul | | | |
| Ago | | | |
| Set | | | |
| Out | | | |
| Nov | | | |
| Dez | | | |

**3. CUSTOS FIXOS MENSAIS**
| Item | Valor |
|------|-------|
| Aluguel | R$ |
| Salários | R$ |
| Benefícios | R$ |
| Contabilidade | R$ |
| Software/SaaS | R$ |
| Marketing fixo | R$ |
| Outros | R$ |
| **Total Fixo** | **R$** |

**4. CUSTOS VARIÁVEIS**
| Item | % da Receita | Valor médio |
|------|--------------|-------------|
| CMV/Custo produto | % | R$ |
| Comissões | % | R$ |
| Frete | % | R$ |
| Impostos | % | R$ |
| Taxas cartão | % | R$ |
| **Total Variável** | **%** | **R$** |

**5. FLUXO DE CAIXA MENSAL**
| Mês | Entradas | Saídas | Saldo Mês | Saldo Acum. |
|-----|----------|--------|-----------|-------------|
| Jan | | | | |
| Fev | | | | |
| ... | | | | |
| Dez | | | | |

**6. INDICADORES**
- Ponto de Equilíbrio: R$ [X]/mês
- Margem de Contribuição: X%
- Margem Líquida: X%
- Burn rate (se aplicável): R$ [X]/mês
- Runway: X meses

**7. CENÁRIOS**
| Cenário | Receita | Lucro | Caixa final |
|---------|---------|-------|-------------|
| Pessimista | | | |
| Realista | | | |
| Otimista | | | |

**8. RESERVA E CONTINGÊNCIA**
- Reserva recomendada: X meses de custo fixo
- Valor: R$ [X]
- Plano de contingência se caixa apertar`,
      variables: [
        { name: 'business', label: 'Negócio', placeholder: 'Ex: Agência de marketing digital', type: 'text', required: true },
        { name: 'revenue', label: 'Receita mensal atual', placeholder: 'Ex: R$ 50.000', type: 'text', required: true },
        { name: 'fixed_costs', label: 'Custos fixos', placeholder: 'Ex: Aluguel R$ 3k, Salários R$ 25k, Software R$ 2k', type: 'textarea', required: true },
        { name: 'variable_costs', label: 'Custos variáveis', placeholder: 'Ex: Impostos 15%, Comissões 10%, Ferramentas por projeto 5%', type: 'text', required: true }
      ],
      examples: [],
      tags: ['finanças', 'fluxo de caixa', 'projeção', 'DFC', 'planejamento'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'biz-meeting-agenda',
      categoryId: 'business',
      title: 'Agenda de Reunião Produtiva',
      description: 'Estruture reuniões que geram resultado',
      template: `Estruture uma reunião produtiva:

**TEMA:** {topic}
**PARTICIPANTES:** {participants}
**DURAÇÃO:** {duration}
**DECISÕES NECESSÁRIAS:** {decisions}

---

**PLANEJAMENTO DA REUNIÃO:**

**1. OBJETIVO SMART DA REUNIÃO**
- Específico: O que queremos ao final?
- Mensurável: Como saber se foi produtiva?
- Atingível: É possível nesse tempo?
- Relevante: Por que essa reunião agora?
- Temporal: Deadline das decisões

**2. PRÉ-TRABALHO (Enviar 24h antes)**
*Para todos os participantes:*
- Contexto em 3 bullets
- Materiais para revisar
- Perguntas para preparar
- Decisões que serão tomadas

**3. AGENDA DA REUNIÃO**

| Tempo | Tópico | Responsável | Tipo |
|-------|--------|-------------|------|
| 5 min | Check-in e alinhamento | Facilitador | Abertura |
| X min | [Tópico 1] | [Nome] | Discussão |
| X min | [Tópico 2] | [Nome] | Decisão |
| X min | [Tópico 3] | [Nome] | Informação |
| 5 min | Próximos passos e fechamento | Facilitador | Encerramento |

**4. REGRAS DA REUNIÃO**
- [ ] Começar e terminar no horário
- [ ] Câmeras ligadas (se virtual)
- [ ] Um fala por vez
- [ ] Foco no objetivo
- [ ] Decisões registradas na hora

**5. FRAMEWORK PARA CADA TÓPICO**
1. Contexto (2 min): O que está em discussão
2. Opções (5 min): Quais as alternativas
3. Discussão (X min): Prós e contras
4. Decisão (2 min): O que foi decidido
5. Ação (1 min): Quem faz o quê até quando

**6. TEMPLATE DE REGISTRO**
| Decisão | Ação | Responsável | Prazo |
|---------|------|-------------|-------|
| | | | |
| | | | |
| | | | |

**7. FOLLOW-UP (Enviar em 24h)**
*Email de follow-up contendo:*
- Resumo das decisões
- Lista de ações com responsáveis
- Prazos acordados
- Data da próxima reunião (se houver)
- Materiais complementares

**8. CHECKLIST PÓS-REUNIÃO**
- [ ] Ata enviada para todos
- [ ] Ações adicionadas em ferramenta de gestão
- [ ] Próxima reunião agendada (se necessário)
- [ ] Feedback coletado (se relevante)`,
      variables: [
        { name: 'topic', label: 'Tema da reunião', placeholder: 'Ex: Planejamento estratégico Q1 2025', type: 'text', required: true },
        { name: 'participants', label: 'Participantes', placeholder: 'Ex: Diretoria (CEO, CFO, CMO, CTO) - 4 pessoas', type: 'text', required: true },
        { name: 'duration', label: 'Duração', placeholder: 'Ex: 2 horas', type: 'text', required: true },
        { name: 'decisions', label: 'Decisões necessárias', placeholder: 'Ex: Definir OKRs, aprovar budget de marketing, priorizar projetos', type: 'textarea', required: true }
      ],
      examples: [],
      tags: ['reuniões', 'produtividade', 'gestão', 'agenda', 'facilitação'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'biz-mvp-definition',
      categoryId: 'business',
      title: 'Definição de MVP',
      description: 'Estruture seu Produto Mínimo Viável',
      template: `Defina o MVP do seu produto/serviço:

**IDEIA:** {idea}
**PROBLEMA:** {problem}
**HIPÓTESES A VALIDAR:** {hypotheses}

---

**DEFINIÇÃO DO MVP:**

**1. PROBLEMA E SOLUÇÃO**
- Problema específico que resolve:
- Para quem (persona):
- Alternativas atuais:
- Por que sua solução é melhor:

**2. HIPÓTESES CRÍTICAS**
| Hipótese | Como validar | Métrica de sucesso |
|----------|--------------|-------------------|
| H1: [Pessoas têm esse problema] | | |
| H2: [Estão dispostas a pagar] | | |
| H3: [Nossa solução resolve] | | |
| H4: [Conseguimos entregar] | | |

**3. FEATURES DO MVP**

*Essencial (must have):*
- Feature 1: [Descrição]
- Feature 2: [Descrição]
- Feature 3: [Descrição]

*Nice to have (versão 2):*
- Feature A: [Por que não agora]
- Feature B: [Por que não agora]

*Não terá (por enquanto):*
- Feature X: [Motivo]
- Feature Y: [Motivo]

**4. MÉTRICAS DE VALIDAÇÃO**
| Métrica | Meta MVP | Como medir |
|---------|----------|------------|
| Usuários/clientes | | |
| Retenção | | |
| NPS/Satisfação | | |
| Receita/Conversão | | |

**5. CRITÉRIOS DE SUCESSO**
O MVP é validado se:
- [ ] Critério 1: [quantitativo]
- [ ] Critério 2: [quantitativo]
- [ ] Critério 3: [qualitativo]

**6. TIMELINE**
| Fase | Atividades | Duração |
|------|-----------|---------|
| Semana 1-2 | Design e prototipagem | |
| Semana 3-4 | Desenvolvimento | |
| Semana 5 | Testes internos | |
| Semana 6-8 | Beta com early adopters | |

**7. RECURSOS NECESSÁRIOS**
- Equipe:
- Ferramentas:
- Budget:
- Tempo total:

**8. PRÓXIMOS PASSOS PÓS-MVP**
- Se validado: [plano de escala]
- Se não validado: [opções de pivot]`,
      variables: [
        { name: 'idea', label: 'Ideia', placeholder: 'Ex: App de gestão de tarefas para times remotos', type: 'text', required: true },
        { name: 'problem', label: 'Problema', placeholder: 'Ex: Times remotos perdem produtividade com ferramentas fragmentadas', type: 'textarea', required: true },
        { name: 'hypotheses', label: 'Hipóteses', placeholder: 'Ex: Times pagariam R$ 15/usuário/mês por uma solução unificada', type: 'textarea', required: true }
      ],
      examples: [],
      tags: ['mvp', 'produto', 'validação', 'lean startup', 'startup'],
      difficulty: 'intermediate',
      isPremium: false
    },

    // PREMIUM PROMPTS
    {
      id: 'biz-business-plan',
      categoryId: 'business',
      title: 'Plano de Negócios Completo',
      description: 'Crie um plano de negócios profissional',
      template: `Crie um plano de negócios completo:

**NEGÓCIO:** {business}
**SEGMENTO:** {segment}
**INVESTIMENTO INICIAL:** {investment}

---

**PLANO DE NEGÓCIOS:**

**1. SUMÁRIO EXECUTIVO**
- Descrição do negócio (2-3 parágrafos)
- Missão, visão e valores
- Proposta de valor única
- Objetivos de curto, médio e longo prazo
- Investimento necessário e uso dos recursos
- Projeção de resultados (3 anos)

**2. ANÁLISE DE MERCADO**

*2.1 Setor e Tendências*
- Tamanho do mercado (TAM, SAM, SOM)
- Taxa de crescimento
- Tendências principais
- Regulamentação relevante

*2.2 Público-Alvo*
- Perfil demográfico
- Comportamento de compra
- Necessidades e dores
- Poder aquisitivo

*2.3 Análise Competitiva*
| Concorrente | Forças | Fraquezas | Market share |
|-------------|--------|-----------|--------------|
| | | | |
| | | | |

**3. PRODUTOS/SERVIÇOS**
- Descrição detalhada
- Benefícios e diferenciais
- Ciclo de vida
- Roadmap de desenvolvimento
- Propriedade intelectual

**4. ESTRATÉGIA DE MARKETING**

*4.1 Posicionamento*
- Público-alvo principal
- Proposta de valor
- Mensagem-chave

*4.2 Mix de Marketing*
- Produto
- Preço
- Praça (canais)
- Promoção

*4.3 Plano de Ação*
| Canal | Investimento | Meta | ROI esperado |
|-------|--------------|------|--------------|
| | | | |

**5. PLANO OPERACIONAL**
- Localização e infraestrutura
- Processos principais
- Fornecedores-chave
- Tecnologia necessária
- Equipe e organograma

**6. PLANO FINANCEIRO**

*6.1 Investimento Inicial*
| Item | Valor |
|------|-------|
| | |
| Total | R$ |

*6.2 Projeção de Receitas (3 anos)*
| Ano | Receita | Crescimento |
|-----|---------|-------------|
| 1 | R$ | - |
| 2 | R$ | X% |
| 3 | R$ | X% |

*6.3 Projeção de Custos*
| Tipo | Ano 1 | Ano 2 | Ano 3 |
|------|-------|-------|-------|
| Fixos | | | |
| Variáveis | | | |

*6.4 Indicadores*
- Ponto de equilíbrio:
- Margem líquida:
- ROI:
- Payback:

**7. ANÁLISE DE RISCOS**
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| | | | |

**8. CRONOGRAMA DE IMPLEMENTAÇÃO**
| Fase | Atividades | Prazo |
|------|-----------|-------|
| 1 | | |
| 2 | | |
| 3 | | |`,
      variables: [
        { name: 'business', label: 'Negócio', placeholder: 'Ex: Cafeteria especializada em café artesanal', type: 'text', required: true },
        { name: 'segment', label: 'Segmento', placeholder: 'Ex: Alimentação / Food Service', type: 'text', required: true },
        { name: 'investment', label: 'Investimento inicial', placeholder: 'Ex: R$ 150.000', type: 'text', required: true }
      ],
      examples: [],
      tags: ['plano de negócios', 'estratégia', 'startup', 'empreendedorismo'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'biz-okr',
      categoryId: 'business',
      title: 'Definição de OKRs',
      description: 'Crie objetivos e resultados-chave para seu negócio',
      template: `Defina OKRs (Objectives and Key Results):

**EMPRESA/ÁREA:** {company}
**PERÍODO:** {period}
**CONTEXTO:** {context}

---

**FRAMEWORK OKR:**

**1. OBJETIVOS DA EMPRESA (Top-level)**

*Objetivo 1: [Qualitativo, inspirador]*
- KR 1.1: [Quantitativo, mensurável]
- KR 1.2: [Quantitativo, mensurável]
- KR 1.3: [Quantitativo, mensurável]

*Objetivo 2: [Qualitativo, inspirador]*
- KR 2.1: [Quantitativo, mensurável]
- KR 2.2: [Quantitativo, mensurável]
- KR 2.3: [Quantitativo, mensurável]

**2. OKRs POR ÁREA**

*Marketing:*
- O: [Objetivo]
  - KR: [Resultado-chave]
  - KR: [Resultado-chave]

*Vendas:*
- O: [Objetivo]
  - KR: [Resultado-chave]
  - KR: [Resultado-chave]

*Produto:*
- O: [Objetivo]
  - KR: [Resultado-chave]
  - KR: [Resultado-chave]

*Operações:*
- O: [Objetivo]
  - KR: [Resultado-chave]
  - KR: [Resultado-chave]

**3. ALINHAMENTO**
```
Objetivo Empresa
    ├── Objetivo Marketing → KRs
    ├── Objetivo Vendas → KRs
    └── Objetivo Produto → KRs
```

**4. MÉTRICAS E TRACKING**

| Objetivo | Key Result | Baseline | Meta | Atual | Status |
|----------|------------|----------|------|-------|--------|
| O1 | KR 1.1 | | | | 🟢🟡🔴 |
| O1 | KR 1.2 | | | | |
| O2 | KR 2.1 | | | | |

**5. INICIATIVAS**
Para cada Key Result, quais iniciativas/projetos:

| KR | Iniciativa | Responsável | Prazo |
|----|-----------|-------------|-------|
| | | | |

**6. CADÊNCIA DE REVIEW**
- Weekly: Check-in de progresso
- Monthly: Review e ajustes
- Quarterly: Retrospectiva e novos OKRs

**7. REGRAS DE SCORING**
- 0-30%: Vermelho (em risco)
- 30-70%: Amarelo (em progresso)
- 70-100%: Verde (no caminho)
- >100%: Azul (meta muito fácil?)

**8. BOAS PRÁTICAS**
- Máximo 3-5 objetivos por período
- 3-5 KRs por objetivo
- KRs devem ser difíceis mas atingíveis (70% confiança)
- Separar OKRs comprometidos de aspiracionais`,
      variables: [
        { name: 'company', label: 'Empresa/Área', placeholder: 'Ex: Startup de SaaS - toda a empresa', type: 'text', required: true },
        { name: 'period', label: 'Período', placeholder: 'Ex: Q1 2025 (Janeiro-Março)', type: 'text', required: true },
        { name: 'context', label: 'Contexto', placeholder: 'Ex: Pós-Series A, foco em crescimento de receita e expansão de time', type: 'textarea', required: true }
      ],
      examples: [],
      tags: ['okr', 'objetivos', 'gestão', 'metas', 'planejamento'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'biz-pitch-deck',
      categoryId: 'business',
      title: 'Pitch Deck para Investidores',
      description: 'Crie uma apresentação para captar investimento',
      template: `Crie um pitch deck para investidores:

**STARTUP:** {startup}
**ESTÁGIO:** {stage}
**CAPTAÇÃO:** {raise}
**TRAÇÃO:** {traction}

---

**ESTRUTURA DO PITCH DECK (12 slides):**

**Slide 1: Capa**
- Nome da empresa
- Tagline (1 frase)
- Logo
- Informação de contato

**Slide 2: Problema**
- Qual problema você resolve?
- Quão grande é o problema?
- Por que é urgente resolver?
- Dados que comprovam a dor

**Slide 3: Solução**
- Como você resolve o problema?
- Demonstração visual do produto
- Benefícios principais (3 bullets)
- Por que funciona?

**Slide 4: Mercado**
- TAM (Total Addressable Market)
- SAM (Serviceable Addressable Market)
- SOM (Serviceable Obtainable Market)
- Taxa de crescimento do mercado

**Slide 5: Modelo de Negócio**
- Como você ganha dinheiro?
- Estrutura de pricing
- Unit economics (LTV, CAC, Margem)
- Projeção de receita

**Slide 6: Tração**
- Métricas principais
- Crescimento (MoM, YoY)
- Clientes notáveis
- Gráfico de evolução

**Slide 7: Produto**
- Screenshot ou demo
- Features principais
- Roadmap (próximos 12 meses)
- Propriedade intelectual

**Slide 8: Competição**
- Mapa competitivo (matriz 2x2)
- Principais concorrentes
- Seu diferencial
- Barreiras de entrada

**Slide 9: Go-to-Market**
- Estratégia de aquisição
- Canais principais
- Custo de aquisição
- Parcerias estratégicas

**Slide 10: Time**
- Fundadores (foto + bio 1 linha)
- Advisors
- Por que esse time?
- Contratações planejadas

**Slide 11: Financeiro**
- Receita atual e projetada (3-5 anos)
- Burn rate atual
- Runway com esse raise
- Caminho para profitabilidade

**Slide 12: Ask**
- Quanto está captando
- Valuation (se definido)
- Uso dos recursos (% por área)
- Próximos milestones

**ANEXOS (se pedirem)**
- Projeções financeiras detalhadas
- Contratos relevantes
- Pesquisas de mercado
- Testimonials de clientes`,
      variables: [
        { name: 'startup', label: 'Nome da startup', placeholder: 'Ex: FinanceApp - Gestão financeira para PMEs', type: 'text', required: true },
        { name: 'stage', label: 'Estágio', placeholder: 'Ex: Seed / Pre-Series A', type: 'text', required: true },
        { name: 'raise', label: 'Quanto quer captar', placeholder: 'Ex: R$ 2 milhões', type: 'text', required: true },
        { name: 'traction', label: 'Tração atual', placeholder: 'Ex: R$ 50k MRR, 200 clientes, crescendo 15% ao mês', type: 'text', required: true }
      ],
      examples: [],
      tags: ['pitch deck', 'investidores', 'captação', 'startup', 'apresentação'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'biz-pricing-strategy',
      categoryId: 'business',
      title: 'Estratégia de Precificação',
      description: 'Defina preços que maximizam lucro e valor',
      template: `Crie uma estratégia de precificação:

**PRODUTO/SERVIÇO:** {product}
**CUSTOS:** {costs}
**CONCORRENTES:** {competitors}
**VALOR ENTREGUE:** {value}

---

**ESTRATÉGIA DE PRECIFICAÇÃO:**

**1. ANÁLISE DE CUSTOS**
- Custo variável unitário: R$
- Custo fixo total: R$
- Custo total por unidade: R$
- Margem mínima necessária: X%

**2. ANÁLISE DE MERCADO**
| Concorrente | Produto | Preço | Posicionamento |
|-------------|---------|-------|----------------|
| | | | |
| | | | |
| Média de mercado | | R$ | |

**3. ANÁLISE DE VALOR**
- Quanto o cliente economiza?
- Quanto tempo ganha?
- Qual o custo de não resolver?
- ROI para o cliente:

**4. ESTRATÉGIAS DE PREÇO**

*Opção A: Cost-Plus*
- Preço = Custo + Margem desejada
- Preço sugerido: R$
- Prós e contras

*Opção B: Value-Based*
- Preço = % do valor entregue
- Preço sugerido: R$
- Prós e contras

*Opção C: Competitive*
- Preço = Baseado no mercado
- Preço sugerido: R$
- Prós e contras

**5. ESTRUTURA DE PREÇOS**

| Plano | Features | Preço | Target |
|-------|----------|-------|--------|
| Básico | | R$ | |
| Pro | | R$ | |
| Enterprise | | Sob consulta | |

**6. TÁTICAS DE PRICING**
- Ancoragem: Mostrar plano mais caro primeiro
- Decoy: Plano intermediário para empurrar premium
- Bundling: Pacotes com desconto
- Freemium: Converter free para pago

**7. ELASTICIDADE**
| Preço | Volume esperado | Receita |
|-------|-----------------|---------|
| R$ X | | |
| R$ Y | | |
| R$ Z | | |

**8. DESCONTOS**
| Tipo | Desconto | Condição |
|------|----------|----------|
| Anual vs mensal | % | Pagamento antecipado |
| Volume | % | +X unidades |
| Indicação | % | Cliente indica |

**9. RECOMENDAÇÃO**
- Estratégia escolhida:
- Preço recomendado:
- Justificativa:
- Revisão prevista: [quando]`,
      variables: [
        { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Software de gestão de projetos SaaS', type: 'text', required: true },
        { name: 'costs', label: 'Custos', placeholder: 'Ex: Infra R$ 5/usuário, suporte R$ 2/usuário, CAC R$ 50', type: 'textarea', required: true },
        { name: 'competitors', label: 'Preços concorrentes', placeholder: 'Ex: Monday $10/usuário, Asana $13/usuário, Trello $5/usuário', type: 'text', required: true },
        { name: 'value', label: 'Valor entregue', placeholder: 'Ex: Economia de 5h/semana por usuário, redução de 30% em atrasos', type: 'text', required: true }
      ],
      examples: [],
      tags: ['pricing', 'preço', 'monetização', 'estratégia', 'valor'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'biz-hiring-plan',
      categoryId: 'business',
      title: 'Plano de Contratação',
      description: 'Estruture o crescimento da sua equipe',
      template: `Crie um plano de contratação:

**EMPRESA:** {company}
**ÁREA/DEPARTAMENTO:** {department}
**VAGAS:** {positions}
**PRAZO:** {timeline}

---

**PLANO DE CONTRATAÇÃO:**

**1. CONTEXTO E NECESSIDADE**
- Por que contratar agora?
- O que muda com essas contratações?
- Impacto no negócio
- Budget disponível

**2. PERFIL DA VAGA**

*Vaga 1: [Título]*
| Item | Descrição |
|------|-----------|
| Missão | |
| Responsabilidades (5-7) | |
| Requisitos obrigatórios | |
| Diferenciais | |
| Senioridade | |
| Modelo (PJ/CLT/Remoto) | |
| Salário/Faixa | |

**3. JOB DESCRIPTION**

*[Título da Vaga]*

**Sobre a empresa**
[2-3 parágrafos]

**O desafio**
[O que a pessoa vai fazer]

**Responsabilidades**
- [Lista de responsabilidades]

**Requisitos**
- [Obrigatórios]
- [Diferenciais]

**Benefícios**
- [Lista de benefícios]

**Processo seletivo**
1. Triagem de currículo
2. Entrevista inicial (30 min)
3. Case/teste técnico
4. Entrevista com gestor
5. Fit cultural / referências
6. Proposta

**4. ESTRATÉGIA DE SOURCING**
| Canal | Custo | Qualidade | Volume |
|-------|-------|-----------|--------|
| LinkedIn | | | |
| Indicação | | | |
| Job boards | | | |
| Headhunter | | | |
| Universidades | | | |

**5. CRONOGRAMA**
| Fase | Semana 1 | Semana 2 | Semana 3 | Semana 4 |
|------|----------|----------|----------|----------|
| Divulgação | X | | | |
| Triagem | | X | | |
| Entrevistas | | X | X | |
| Decisão | | | | X |
| Proposta | | | | X |

**6. SCORECARDS DE AVALIAÇÃO**
| Critério | Peso | Nota (1-5) |
|----------|------|------------|
| Hard skills | 30% | |
| Soft skills | 25% | |
| Cultura | 25% | |
| Potencial | 20% | |

**7. ONBOARDING**
- Semana 1: [Atividades]
- Semana 2: [Atividades]
- Mês 1: [Objetivos]
- Mês 3: [Avaliação]

**8. MÉTRICAS DO PROCESSO**
| Métrica | Meta |
|---------|------|
| Time to hire | X dias |
| Cost per hire | R$ |
| Offer acceptance rate | X% |
| Quality of hire (90 dias) | |`,
      variables: [
        { name: 'company', label: 'Empresa', placeholder: 'Ex: Startup de tecnologia, 30 pessoas', type: 'text', required: true },
        { name: 'department', label: 'Área', placeholder: 'Ex: Engenharia / Produto', type: 'text', required: true },
        { name: 'positions', label: 'Vagas', placeholder: 'Ex: 2 desenvolvedores senior, 1 product manager', type: 'text', required: true },
        { name: 'timeline', label: 'Prazo', placeholder: 'Ex: Próximos 2 meses', type: 'text', required: true }
      ],
      examples: [],
      tags: ['contratação', 'RH', 'recrutamento', 'equipe', 'gestão de pessoas'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'biz-partnership',
      categoryId: 'business',
      title: 'Estratégia de Parcerias',
      description: 'Identifique e estruture parcerias estratégicas',
      template: `Crie uma estratégia de parcerias:

**SEU NEGÓCIO:** {business}
**OBJETIVO:** {goal}
**PARCEIROS POTENCIAIS:** {partners}

---

**ESTRATÉGIA DE PARCERIAS:**

**1. OBJETIVOS DA PARCERIA**
- O que você quer alcançar?
- Métricas de sucesso
- Prazo para resultados
- O que você oferece em troca?

**2. TIPOS DE PARCERIA**

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| Distribuição | Acesso a novos canais | Revenda, white-label |
| Co-marketing | Ampliar alcance | Webinars, conteúdo |
| Integração | Produto complementar | APIs, plugins |
| Referral | Indicações mútuas | Comissionamento |
| Licenciamento | Uso de tecnologia | B2B2C |

**3. MAPEAMENTO DE PARCEIROS**

| Parceiro | Tipo | Fit | Benefício para eles | Benefício para nós |
|----------|------|-----|--------------------|--------------------|
| | | | | |
| | | | | |

**4. PROPOSTA DE VALOR PARA O PARCEIRO**
- O que eles ganham:
  - Receita adicional
  - Acesso a mercado
  - Complemento de produto
  - Credibilidade/marca
- Por que fechar com você vs concorrentes
- Cases/provas de sucesso

**5. MODELO DE PARCERIA**

*Modelo 1: Revenue Share*
- Split: X% para cada lado
- Quem faz a venda
- Como rastrear

*Modelo 2: Fee Fixo*
- Valor mensal/anual
- Entregáveis
- SLAs

*Modelo 3: Referral*
- Comissão por lead/venda
- Duração (one-time vs recorrente)
- Condições

**6. ABORDAGEM COMERCIAL**

*Email de primeiro contato:*
[Template de email]

*Deck de parceria:*
- Slide 1: Quem somos
- Slide 2: Proposta
- Slide 3: Benefícios mútuos
- Slide 4: Modelo
- Slide 5: Cases
- Slide 6: Próximos passos

**7. OPERACIONALIZAÇÃO**
- Onboarding do parceiro
- Materiais de apoio
- Treinamento
- Suporte
- Comunicação regular

**8. GOVERNANÇA**
- Reuniões de alinhamento: [frequência]
- KPIs compartilhados
- Processo de escalação
- Renovação/término`,
      variables: [
        { name: 'business', label: 'Seu negócio', placeholder: 'Ex: Plataforma de e-learning para empresas', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo', placeholder: 'Ex: Ampliar distribuição via consultorias de RH', type: 'text', required: true },
        { name: 'partners', label: 'Parceiros potenciais', placeholder: 'Ex: Consultorias de RH, empresas de benefícios, ERPs', type: 'text', required: true }
      ],
      examples: [],
      tags: ['parcerias', 'B2B', 'crescimento', 'distribuição', 'negócios'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'biz-crisis-management',
      categoryId: 'business',
      title: 'Plano de Gestão de Crise',
      description: 'Prepare-se para crises e minimize impactos',
      template: `Crie um plano de gestão de crise:

**EMPRESA:** {company}
**TIPO DE CRISE:** {crisis_type}
**STAKEHOLDERS:** {stakeholders}

---

**PLANO DE GESTÃO DE CRISE:**

**1. IDENTIFICAÇÃO DE RISCOS**

| Tipo de crise | Probabilidade | Impacto | Prioridade |
|---------------|---------------|---------|------------|
| Operacional | | | |
| Financeira | | | |
| Reputacional | | | |
| Legal | | | |
| Tecnológica | | | |

**2. COMITÊ DE CRISE**
| Papel | Nome | Contato | Responsabilidade |
|-------|------|---------|------------------|
| Líder de crise | | | Decisões finais |
| Comunicação | | | Porta-voz |
| Operações | | | Continuidade |
| Jurídico | | | Aspectos legais |
| RH | | | Colaboradores |

**3. PROTOCOLO DE ACIONAMENTO**

*Nível 1 (Baixo):*
- Critérios: [Quando acionar]
- Quem é notificado
- Ações imediatas

*Nível 2 (Médio):*
- Critérios: [Quando acionar]
- Quem é notificado
- Ações imediatas

*Nível 3 (Crítico):*
- Critérios: [Quando acionar]
- Quem é notificado
- Ações imediatas

**4. PRIMEIRAS 24 HORAS**

| Hora | Ação | Responsável |
|------|------|-------------|
| 0-1h | Avaliação inicial | |
| 1-2h | Reunião comitê | |
| 2-4h | Comunicação interna | |
| 4-8h | Comunicação externa | |
| 8-24h | Plano de ação | |

**5. COMUNICAÇÃO**

*Interna (colaboradores):*
- Canal:
- Tom:
- Frequência:
- Template de comunicado:

*Externa (clientes, mídia):*
- Porta-voz designado:
- Mensagens-chave (3):
- Canais:
- Q&A preparado:

*Stakeholders específicos:*
- Investidores:
- Parceiros:
- Fornecedores:

**6. PLANO DE CONTINUIDADE**
- Processos críticos que não podem parar
- Backup de sistemas
- Equipe de contingência
- Local alternativo (se necessário)

**7. DOCUMENTAÇÃO**
- [ ] Log de eventos
- [ ] Decisões tomadas
- [ ] Comunicações enviadas
- [ ] Custos incorridos
- [ ] Lições aprendidas

**8. PÓS-CRISE**
- Avaliação de danos
- Plano de recuperação
- Comunicação de resolução
- Análise de root cause
- Atualização de processos`,
      variables: [
        { name: 'company', label: 'Empresa', placeholder: 'Ex: E-commerce de médio porte, 100 funcionários', type: 'text', required: true },
        { name: 'crisis_type', label: 'Tipo de crise', placeholder: 'Ex: Vazamento de dados de clientes', type: 'text', required: true },
        { name: 'stakeholders', label: 'Stakeholders', placeholder: 'Ex: Clientes, funcionários, investidores, imprensa, reguladores', type: 'text', required: true }
      ],
      examples: [],
      tags: ['crise', 'gestão', 'comunicação', 'risco', 'continuidade'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'biz-board-meeting',
      categoryId: 'business',
      title: 'Apresentação para Board/Conselho',
      description: 'Prepare uma apresentação executiva para diretoria',
      template: `Crie uma apresentação para Board/Conselho:

**EMPRESA:** {company}
**PERÍODO:** {period}
**PAUTA PRINCIPAL:** {agenda}
**DECISÕES ESPERADAS:** {decisions}

---

**ESTRUTURA DA APRESENTAÇÃO:**

**1. SUMÁRIO EXECUTIVO (1 slide)**
- Highlights do período
- Principais conquistas
- Desafios enfrentados
- Decisões necessárias

**2. PERFORMANCE FINANCEIRA (2-3 slides)**

*Receita:*
| Métrica | Meta | Realizado | Var. |
|---------|------|-----------|------|
| Receita | | | |
| Clientes | | | |
| Ticket médio | | | |

*Custos e Margem:*
| Item | Orçado | Real | Var. |
|------|--------|------|------|
| CMV | | | |
| Opex | | | |
| Margem | | | |

*Cash:*
- Posição de caixa
- Burn rate
- Runway

**3. PERFORMANCE OPERACIONAL (2 slides)**

*Métricas-chave:*
| KPI | Meta | Real | Tendência |
|-----|------|------|-----------|
| | | | ↑↓→ |
| | | | |

*Projetos/Iniciativas:*
| Projeto | Status | % | Observação |
|---------|--------|---|------------|
| | 🟢🟡🔴 | | |

**4. PESSOAS (1 slide)**
- Headcount: atual vs planejado
- Contratações/saídas
- eNPS/clima
- Plano de contratação

**5. ANÁLISE COMPETITIVA (1 slide)**
- Movimentos relevantes do mercado
- Impacto para o negócio
- Ações tomadas/planejadas

**6. RISCOS E ISSUES (1 slide)**
| Risco/Issue | Impacto | Mitigação | Status |
|-------------|---------|-----------|--------|
| | | | |

**7. OUTLOOK PRÓXIMO PERÍODO (1 slide)**
- Projeções atualizadas
- Principais iniciativas
- Recursos necessários
- Alertas

**8. ITENS DE DECISÃO (1 slide)**
| Item | Contexto | Recomendação | Decisão |
|------|----------|--------------|---------|
| | | | Aprovar/Rejeitar |
| | | | |

**9. ANEXOS**
- Detalhamento financeiro
- Pipeline de vendas
- Roadmap de produto
- Benchmark competitivo

**DICAS DE APRESENTAÇÃO:**
- Máximo 15-20 slides
- Dados e não opiniões
- Visualizações claras
- Highlight para números importantes
- Prepare backup para perguntas difíceis`,
      variables: [
        { name: 'company', label: 'Empresa', placeholder: 'Ex: TechStartup S.A.', type: 'text', required: true },
        { name: 'period', label: 'Período', placeholder: 'Ex: Q4 2024 / Anual 2024', type: 'text', required: true },
        { name: 'agenda', label: 'Pauta principal', placeholder: 'Ex: Resultados do ano + Plano 2025 + Captação', type: 'text', required: true },
        { name: 'decisions', label: 'Decisões esperadas', placeholder: 'Ex: Aprovação orçamento, autorização para nova rodada', type: 'text', required: true }
      ],
      examples: [],
      tags: ['board', 'conselho', 'apresentação', 'executivo', 'governança'],
      difficulty: 'advanced',
      isPremium: true
    }
  ]
};
