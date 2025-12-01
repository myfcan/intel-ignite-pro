import { PromptCategory } from '../../types/prompt';

export const productCreationPromptsCategory: PromptCategory = {
  id: 'product-creation',
  name: 'Criação de Produtos',
  description: 'Prompts para criar produtos digitais, físicos, apps e validar ideias',
  icon: 'PackagePlus',
  color: 'bg-orange-500',
  isPopular: true,
  prompts: [
    // FREE PROMPTS (6 total)
    {
      id: 'pc-idea-validation',
      categoryId: 'product-creation',
      title: 'Validação Rápida de Ideia',
      description: 'Valide sua ideia de produto em 48 horas',
      template: `Valide esta ideia de produto/negócio:

**IDEIA:** {idea}
**PROBLEMA QUE RESOLVE:** {problem}
**PÚBLICO-ALVO:** {audience}

---

**ANÁLISE DE VALIDAÇÃO RÁPIDA (48H):**

**1. TESTE DE DEMANDA**
- Crie uma landing page simples (1 página)
- Headline focada no benefício principal
- Formulário de captura de email
- Use Carrd, Notion ou Google Sites (grátis)

**2. PESQUISA DE MERCADO EXPRESS**
- 5 perguntas essenciais para entrevistas:
  1. Você já tentou resolver esse problema? Como?
  2. Quanto tempo/dinheiro você perde com isso?
  3. O que você já tentou que não funcionou?
  4. Quanto pagaria por uma solução?
  5. O que faria você comprar hoje?

**3. VALIDAÇÃO DE PREÇO**
- Teste de willingness-to-pay
- Método Van Westendorp
- Comparação com alternativas

**4. ANÁLISE DE CONCORRÊNCIA**
- 3 concorrentes diretos
- 3 concorrentes indiretos
- Gaps de mercado identificados

**5. SCORECARD DE VALIDAÇÃO**
| Critério | Pontuação (1-10) |
|----------|------------------|
| Dor real e urgente | |
| Público acessível | |
| Disposição para pagar | |
| Tamanho do mercado | |
| Sua capacidade de executar | |

**6. DECISÃO GO/NO-GO**
- Score mínimo recomendado: 35/50
- Próximos passos se aprovado
- Pivots sugeridos se reprovado`,
      variables: [
        { name: 'idea', label: 'Sua ideia', placeholder: 'Ex: App de controle de gastos para casais', type: 'textarea', required: true },
        { name: 'problem', label: 'Problema que resolve', placeholder: 'Ex: Casais brigam por dinheiro por falta de visibilidade', type: 'textarea', required: true },
        { name: 'audience', label: 'Público-alvo', placeholder: 'Ex: Casais jovens 25-35 anos, renda R$5-15k', type: 'text', required: true }
      ],
      examples: [],
      tags: ['validação', 'ideia', 'mvp', 'teste', 'lean startup'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'pc-ebook-outline',
      categoryId: 'product-creation',
      title: 'Estrutura Completa de Ebook',
      description: 'Monte o sumário e estrutura do seu ebook que vende',
      template: `Crie a estrutura completa de um ebook:

**TEMA:** {topic}
**PÚBLICO-ALVO:** {audience}
**PROMESSA/TRANSFORMAÇÃO:** {promise}

---

**ESTRUTURA DO EBOOK:**

**1. PESQUISA PRÉ-ESCRITA**
- Principais dúvidas do público sobre o tema
- Objeções comuns
- Nível de conhecimento atual
- Resultados desejados

**2. TÍTULO E SUBTÍTULO**
- 3 opções de título (usar números, benefícios ou curiosidade)
- Subtítulo que complementa a promessa
- Considerações de SEO para marketplaces

**3. ESTRUTURA DE CAPÍTULOS (7-10)**
Para cada capítulo inclua:
- Título atrativo
- Objetivo do capítulo
- 3-5 tópicos principais
- Exercício prático ou checklist
- Transição para próximo capítulo

**4. ELEMENTOS ESPECIAIS**
- Introdução que prende (história + promessa)
- Cases/exemplos reais por capítulo
- Boxes de destaque ("Dica Pro", "Atenção", "Exemplo")
- Checklists e templates
- Conclusão com próximos passos

**5. BÔNUS SUGERIDOS**
- Checklist resumo
- Templates editáveis
- Acesso a grupo/comunidade
- Atualizações futuras

**6. ESPECIFICAÇÕES**
- Número de páginas estimado
- Formato (PDF, ePub, ambos)
- Design: minimalista ou rico em gráficos
- Preço sugerido baseado no mercado`,
      variables: [
        { name: 'topic', label: 'Tema do ebook', placeholder: 'Ex: Marketing no Instagram para negócios locais', type: 'text', required: true },
        { name: 'audience', label: 'Para quem é', placeholder: 'Ex: Donos de restaurantes e lojas físicas', type: 'text', required: true },
        { name: 'promise', label: 'Promessa/Transformação', placeholder: 'Ex: Atrair 1000 seguidores locais em 30 dias', type: 'text', required: true }
      ],
      examples: [],
      tags: ['ebook', 'conteúdo', 'infoproduto', 'estrutura'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pc-landing-page',
      categoryId: 'product-creation',
      title: 'Landing Page de Validação',
      description: 'Crie uma página para testar demanda antes de criar o produto',
      template: `Crie o copy completo para landing page de validação:

**PRODUTO:** {product}
**PRINCIPAL BENEFÍCIO:** {benefit}
**PREÇO TESTE:** {price}

---

**ESTRUTURA DA LANDING PAGE:**

**1. ABOVE THE FOLD (Primeira tela)**

*Headline (escolha uma fórmula):*
- "Como [benefício] sem [objeção principal]"
- "[Resultado] em [tempo] mesmo [obstáculo]"
- "O método [adjetivo] para [resultado desejado]"

*Subheadline:*
- Explique brevemente como funciona
- Reforce a credibilidade

*CTA Principal:*
- Texto do botão (ação + benefício)
- Ex: "Quero [benefício] Agora"

*Prova Social Rápida:*
- Número de pessoas/empresas atendidas
- Logos de clientes (se tiver)

**2. SEÇÃO DE PROBLEMA**
- 3-4 dores específicas do público
- Use a linguagem deles
- Perguntas retóricas que geram identificação

**3. SEÇÃO DE SOLUÇÃO**
- Apresente seu produto como a resposta
- 3 benefícios principais com ícones
- Diferencial único (por que você?)

**4. COMO FUNCIONA**
- 3 passos simples e visuais
- Passo 1: [Ação inicial]
- Passo 2: [Processo/Uso]
- Passo 3: [Resultado obtido]

**5. PROVA SOCIAL EXPANDIDA**
- 2-3 depoimentos (ou promessa de resultados)
- Resultados em números
- Logos/badges de confiança

**6. OFERTA E PREÇO**
- Ancoragem de valor (quanto vale vs quanto custa)
- Preço com destaque
- Bônus inclusos
- Garantia

**7. FAQ**
- 5-7 perguntas frequentes
- Quebre objeções de compra

**8. CTA FINAL**
- Urgência/escassez (se aplicável)
- Botão de ação
- Texto de segurança (pagamento seguro, etc.)`,
      variables: [
        { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Curso de Excel para Financeiro', type: 'text', required: true },
        { name: 'benefit', label: 'Principal benefício', placeholder: 'Ex: Automatize relatórios e economize 5h por semana', type: 'text', required: true },
        { name: 'price', label: 'Preço teste', placeholder: 'Ex: R$ 197 (ou "a partir de R$ 97")', type: 'text', required: true }
      ],
      examples: [],
      tags: ['landing page', 'validação', 'conversão', 'copy'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pc-pricing-simple',
      categoryId: 'product-creation',
      title: 'Estratégia de Precificação',
      description: 'Defina o preço ideal para seu produto',
      template: `Defina a estratégia de precificação ideal:

**PRODUTO:** {product}
**CUSTO DE PRODUÇÃO:** {cost}
**PREÇOS DO MERCADO:** {market}
**VALOR PERCEBIDO:** {value}

---

**ANÁLISE DE PRECIFICAÇÃO:**

**1. ANÁLISE DE CUSTOS**
- Custo direto de produção/entrega
- Custos indiretos (plataforma, impostos, etc.)
- Margem mínima necessária
- Ponto de equilíbrio

**2. ANÁLISE DE MERCADO**
| Concorrente | Preço | O que inclui | Posicionamento |
|-------------|-------|--------------|----------------|
| | | | |
| | | | |
| | | | |

**3. ANÁLISE DE VALOR**
- Quanto o cliente economiza usando seu produto?
- Quanto tempo ele ganha?
- Qual o custo de NÃO resolver o problema?
- ROI para o cliente

**4. ESTRATÉGIAS DE PREÇO**

*Opção A - Penetração:*
- Preço: [X]
- Objetivo: Ganhar mercado rápido
- Risco: Percepção de baixa qualidade

*Opção B - Premium:*
- Preço: [Y]
- Objetivo: Margem alta, posicionamento
- Risco: Volume menor

*Opção C - Valor:*
- Preço: [Z]
- Objetivo: Equilíbrio valor x preço
- Recomendação: Melhor para maioria

**5. ESTRUTURA DE PREÇOS**
- Preço único vs tiers
- Sugestão de 3 pacotes (se aplicável)
- Ancoragem de preço
- Descontos estratégicos

**6. TESTES RECOMENDADOS**
- A/B test de preços
- Teste de elasticidade
- Pesquisa de willingness-to-pay

**7. RECOMENDAÇÃO FINAL**
- Preço sugerido: R$ [X]
- Justificativa
- Estratégia de aumento futuro`,
      variables: [
        { name: 'product', label: 'Produto', placeholder: 'Ex: Template de Notion para gestão de projetos', type: 'text', required: true },
        { name: 'cost', label: 'Custo de produção', placeholder: 'Ex: R$ 50 (10h de trabalho)', type: 'text', required: true },
        { name: 'market', label: 'Preços do mercado', placeholder: 'Ex: Concorrentes cobram R$ 47 a R$ 197', type: 'text', required: true },
        { name: 'value', label: 'Valor percebido', placeholder: 'Ex: Economiza 5h/semana de organização', type: 'text', required: true }
      ],
      examples: [],
      tags: ['pricing', 'preço', 'monetização', 'estratégia'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pc-customer-persona',
      categoryId: 'product-creation',
      title: 'Persona Detalhada do Cliente',
      description: 'Conheça profundamente seu cliente ideal',
      template: `Crie uma persona detalhada do cliente ideal:

**PRODUTO:** {product}
**PÚBLICO GERAL:** {audience}

---

**PERSONA DO CLIENTE IDEAL:**

**1. DADOS DEMOGRÁFICOS**
- Nome fictício:
- Idade:
- Gênero:
- Localização:
- Estado civil:
- Renda mensal:
- Escolaridade:
- Profissão:

**2. PERFIL PSICOGRÁFICO**
- Valores pessoais (3-5)
- Medos e inseguranças
- Sonhos e aspirações
- Como se vê vs como quer ser visto
- Estilo de vida

**3. COMPORTAMENTO DE COMPRA**
- Onde pesquisa antes de comprar?
- Quanto tempo leva para decidir?
- O que faz ele confiar em uma marca?
- Preferência: preço vs qualidade vs conveniência
- Gatilhos de compra impulsiva

**4. DORES E FRUSTRAÇÕES**
- Problema #1 (mais urgente):
- Problema #2:
- Problema #3:
- O que já tentou para resolver?
- Por que não funcionou?

**5. DESEJOS E OBJETIVOS**
- Objetivo de curto prazo (1-3 meses):
- Objetivo de médio prazo (6-12 meses):
- Objetivo de longo prazo (2-5 anos):
- Como ele medirá sucesso?

**6. OBJEÇÕES DE COMPRA**
- Objeção #1:
- Objeção #2:
- Objeção #3:
- Como quebrar cada objeção

**7. CANAIS E MÍDIA**
- Redes sociais que usa (em ordem)
- Influenciadores que segue
- Podcasts/canais que acompanha
- Onde busca informação profissional
- Horários de maior atividade online

**8. FRASE QUE DEFINE**
"[Uma frase que essa persona diria sobre o problema/desejo]"

**9. UM DIA NA VIDA**
- Rotina típica de um dia
- Momentos de frustração relacionados ao problema
- Quando/onde consumiria seu produto`,
      variables: [
        { name: 'product', label: 'Seu produto', placeholder: 'Ex: App de meditação guiada', type: 'text', required: true },
        { name: 'audience', label: 'Público geral', placeholder: 'Ex: Profissionais estressados 30-45 anos', type: 'text', required: true }
      ],
      examples: [],
      tags: ['persona', 'cliente', 'ICP', 'público-alvo', 'avatar'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'pc-mvp-scope',
      categoryId: 'product-creation',
      title: 'Escopo de MVP',
      description: 'Defina o mínimo viável do seu produto',
      template: `Defina o escopo do MVP (Produto Mínimo Viável):

**IDEIA COMPLETA:** {full_idea}
**PROBLEMA PRINCIPAL:** {core_problem}
**FEATURES DESEJADOS:** {features}

---

**DEFINIÇÃO DO MVP:**

**1. ANÁLISE DA IDEIA COMPLETA**
- Visão final do produto (100%)
- Todos os features listados
- Público-alvo completo
- Modelo de negócio ideal

**2. IDENTIFICAÇÃO DO CORE VALUE**
- Qual é a ÚNICA coisa que seu produto PRECISA fazer?
- Se tivesse que resolver apenas 1 problema, qual seria?
- Qual feature entrega 80% do valor?

**3. MATRIZ DE PRIORIZAÇÃO**
| Feature | Impacto (1-5) | Esforço (1-5) | Prioridade |
|---------|---------------|---------------|------------|
| | | | |
| | | | |
| | | | |
| | | | |
| | | | |

*Prioridade = Impacto / Esforço (maior = primeiro)*

**4. FEATURES DO MVP (Máximo 3-5)**
✅ Feature 1: [Essencial]
✅ Feature 2: [Essencial]
✅ Feature 3: [Importante]
❌ Feature 4: [Versão 2]
❌ Feature 5: [Versão 2]
❌ Feature 6: [Futuro]

**5. O QUE NÃO VAI TER (E POR QUÊ)**
- Feature X: Por que não agora
- Feature Y: Por que não agora
- Design perfeito: MVP pode ser "feio"
- Automações: Fazer manual primeiro

**6. CRITÉRIOS DE SUCESSO DO MVP**
- Métrica #1: [Ex: 100 usuários em 30 dias]
- Métrica #2: [Ex: 20% de conversão]
- Métrica #3: [Ex: NPS > 7]
- Feedback qualitativo necessário

**7. TIMELINE DO MVP**
- Semana 1: [Tarefas]
- Semana 2: [Tarefas]
- Semana 3: [Tarefas]
- Semana 4: [Lançamento beta]

**8. RECURSOS NECESSÁRIOS**
- Ferramentas/tech stack
- Investimento estimado
- Tempo dedicado
- Habilidades (fazer vs terceirizar)

**9. PLANO DE ITERAÇÃO**
- Como coletar feedback
- Ciclo de iteração (semanal/quinzenal)
- Critérios para adicionar features
- Quando pivotar vs persistir`,
      variables: [
        { name: 'full_idea', label: 'Ideia completa', placeholder: 'Ex: Rede social para donos de pets com marketplace, eventos, chat, perfis de pets...', type: 'textarea', required: true },
        { name: 'core_problem', label: 'Problema #1', placeholder: 'Ex: Donos de pets não conseguem encontrar pet sitters confiáveis', type: 'text', required: true },
        { name: 'features', label: 'Features desejados', placeholder: 'Ex: Perfis, chat, marketplace, eventos, reviews, pagamento, notificações...', type: 'textarea', required: true }
      ],
      examples: [],
      tags: ['mvp', 'escopo', 'produto', 'lean', 'priorização'],
      difficulty: 'intermediate',
      isPremium: false
    },

    // PREMIUM PROMPTS
    {
      id: 'pc-digital-product',
      categoryId: 'product-creation',
      title: 'Produto Digital Lucrativo',
      description: 'Gere ideias validadas de infoprodutos',
      template: `Gere ideias de produtos digitais lucrativos:

**NICHO:** {niche}
**PÚBLICO-ALVO:** {audience}
**FAIXA DE PREÇO:** {price_range}
**TEMPO DISPONÍVEL:** {time}

---

**ANÁLISE E IDEIAS DE PRODUTOS DIGITAIS:**

**1. ANÁLISE DO NICHO**
- Tamanho do mercado
- Tendência (crescendo/estável/caindo)
- Nível de concorrência
- Gaps identificados
- Sazonalidade

**2. ANÁLISE DO PÚBLICO**
- Dores principais (top 5)
- Desejos e aspirações
- Poder aquisitivo
- Maturidade digital
- Onde estão online

**3. 10 IDEIAS DE PRODUTOS DIGITAIS**

Para cada ideia:
| # | Produto | Formato | Preço Sugerido | Dificuldade | Potencial |
|---|---------|---------|----------------|-------------|-----------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
...

**4. TOP 3 IDEIAS DETALHADAS**

*Ideia #1: [Nome]*
- Formato: (curso/ebook/template/mentoria)
- Promessa principal:
- Conteúdo/entregáveis:
- Diferencial:
- Estimativa de criação:
- Potencial de receita:

*Ideia #2: [Nome]*
- [Mesma estrutura]

*Ideia #3: [Nome]*
- [Mesma estrutura]

**5. VALIDAÇÃO RÁPIDA**
Para a ideia escolhida:
- 3 formas de validar antes de criar
- Métricas de validação
- MVP sugerido
- Timeline de lançamento

**6. ESTRATÉGIA DE LANÇAMENTO**
- Pré-lançamento (aquecimento)
- Lançamento (semana de vendas)
- Perpétuo (vendas contínuas)
- Canais de aquisição

**7. PROJEÇÃO FINANCEIRA**
- Cenário pessimista:
- Cenário realista:
- Cenário otimista:
- Break-even:`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Produtividade para empreendedores', type: 'textarea', required: true },
        { name: 'audience', label: 'Público', placeholder: 'Ex: Donos de negócio 30-50 anos', type: 'text', required: true },
        { name: 'price_range', label: 'Faixa de preço', placeholder: 'Ex: R$ 97 a R$ 497', type: 'text', required: true },
        { name: 'time', label: 'Tempo disponível', placeholder: 'Ex: 2h/dia por 30 dias', type: 'text', required: true }
      ],
      examples: [],
      tags: ['infoproduto', 'curso', 'ebook', 'validação', 'digital'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'pc-saas-idea',
      categoryId: 'product-creation',
      title: 'Ideia de SaaS Validada',
      description: 'Planeje um Software as a Service lucrativo',
      template: `Planeje uma ideia de SaaS (Software as a Service):

**INDÚSTRIA:** {industry}
**PROBLEMA:** {problem}
**DISPOSIÇÃO A PAGAR:** {wtp}
**CICLO DE VENDA:** {cycle}

---

**PLANEJAMENTO DE SAAS:**

**1. ANÁLISE DE MERCADO**
- TAM (Total Addressable Market):
- SAM (Serviceable Addressable Market):
- SOM (Serviceable Obtainable Market):
- Concorrentes diretos e indiretos
- Tendências do setor

**2. PROBLEMA E SOLUÇÃO**
- Descrição detalhada do problema
- Impacto financeiro do problema
- Soluções atuais e suas falhas
- Sua solução proposta
- Diferencial competitivo (moat)

**3. MODELO DE NEGÓCIO**
- Modelo de receita (subscription, usage, freemium)
- Estrutura de pricing:
  - Tier Free: [features]
  - Tier Starter: R$ [X]/mês - [features]
  - Tier Pro: R$ [Y]/mês - [features]
  - Tier Enterprise: Customizado
- Métricas-chave:
  - CAC target:
  - LTV target:
  - LTV/CAC ratio:
  - Churn aceitável:

**4. MVP TÉCNICO**
- Features essenciais (máximo 5)
- Stack tecnológico sugerido
- Build vs Buy decisions
- Timeline de desenvolvimento
- Custo estimado de MVP

**5. GO-TO-MARKET**
- ICP (Ideal Customer Profile) detalhado
- Canais de aquisição prioritários
- Estratégia de conteúdo
- Parcerias estratégicas
- Primeiros 100 clientes: como conseguir

**6. UNIT ECONOMICS**
| Métrica | Mês 1 | Mês 6 | Mês 12 |
|---------|-------|-------|--------|
| MRR | | | |
| Clientes | | | |
| Churn | | | |
| CAC | | | |
| LTV | | | |

**7. RISCOS E MITIGAÇÕES**
- Risco técnico:
- Risco de mercado:
- Risco de execução:
- Plano de contingência

**8. ROADMAP 12 MESES**
- Q1: MVP e primeiros clientes
- Q2: Product-market fit
- Q3: Escala inicial
- Q4: Otimização e crescimento`,
      variables: [
        { name: 'industry', label: 'Indústria', placeholder: 'Ex: RH Tech / Recursos Humanos', type: 'text', required: true },
        { name: 'problem', label: 'Problema', placeholder: 'Ex: Processo de recrutamento é lento e caro para PMEs', type: 'textarea', required: true },
        { name: 'wtp', label: 'Disposição a pagar', placeholder: 'Ex: R$ 200-500/mês baseado em entrevistas', type: 'text', required: true },
        { name: 'cycle', label: 'Ciclo de venda', placeholder: 'Ex: 30 dias para PMEs, 90 dias para Enterprise', type: 'text', required: true }
      ],
      examples: [],
      tags: ['saas', 'software', 'b2b', 'startup', 'tech'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-course-outline',
      categoryId: 'product-creation',
      title: 'Estrutura de Curso Online Completo',
      description: 'Monte um curso que vende e transforma',
      template: `Crie a estrutura completa de um curso online:

**TEMA:** {topic}
**PARA QUEM:** {audience}
**RESULTADO PROMETIDO:** {outcome}
**DURAÇÃO:** {duration}

---

**ESTRUTURA DO CURSO:**

**1. POSICIONAMENTO**
- Nome do curso (3 opções)
- Tagline/promessa
- Categoria no mercado
- Diferenciais vs concorrentes
- Transformação do aluno (antes → depois)

**2. ESTRUTURA CURRICULAR**

*Módulo 0 - Boas-Vindas*
- Aula 0.1: Como aproveitar o curso
- Aula 0.2: Comunidade e suporte
- Aula 0.3: Definindo suas metas

*Módulo 1 - [Fundamentos]*
- Aula 1.1: [Título] - [X min]
- Aula 1.2: [Título] - [X min]
- Aula 1.3: [Título] - [X min]
- Exercício prático #1
- Checkpoint de progresso

*Módulo 2 - [Desenvolvimento]*
- [Mesma estrutura]

*Módulo 3 - [Avançado]*
- [Mesma estrutura]

*Módulo 4 - [Implementação]*
- [Mesma estrutura]

*Módulo Bônus - [Extra]*
- [Mesma estrutura]

**3. METODOLOGIA**
- Formato das aulas (vídeo, texto, áudio)
- Duração média por aula
- Exercícios práticos por módulo
- Avaliações/quizzes
- Certificado de conclusão

**4. MATERIAIS COMPLEMENTARES**
- Workbooks/apostilas
- Templates e ferramentas
- Checklists por módulo
- Biblioteca de recursos
- Atualizações futuras

**5. SUPORTE E COMUNIDADE**
- Tipo de suporte (grupo, 1-1, fórum)
- Tempo de resposta
- Lives de Q&A (frequência)
- Comunidade de alunos

**6. PRECIFICAÇÃO**
- Análise de concorrentes
- Valor percebido vs preço
- Estrutura de ofertas:
  - Básico: R$ [X]
  - Completo: R$ [Y]
  - Premium/VIP: R$ [Z]
- Parcelamento e condições

**7. ESTRATÉGIA DE LANÇAMENTO**
- Pré-lançamento (lista de espera)
- Semana de conteúdo gratuito
- Carrinho aberto (7 dias)
- Bônus de lançamento
- Estratégia perpétua pós-lançamento

**8. MÉTRICAS DE SUCESSO**
- Taxa de conclusão target
- NPS esperado
- Taxa de reembolso aceitável
- Testimonials por turma`,
      variables: [
        { name: 'topic', label: 'Tema do curso', placeholder: 'Ex: Excel Avançado para Analistas Financeiros', type: 'text', required: true },
        { name: 'audience', label: 'Para quem', placeholder: 'Ex: Analistas e assistentes financeiros', type: 'text', required: true },
        { name: 'outcome', label: 'Resultado prometido', placeholder: 'Ex: Automatizar relatórios e economizar 10h/semana', type: 'text', required: true },
        { name: 'duration', label: 'Duração', placeholder: 'Ex: 6 semanas / 30 horas de conteúdo', type: 'text', required: true }
      ],
      examples: [],
      tags: ['curso', 'educação', 'online', 'estrutura', 'infoproduto'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pc-app-validation',
      categoryId: 'product-creation',
      title: 'Validação Completa de App',
      description: 'Valide sua ideia de aplicativo antes de desenvolver',
      template: `Faça a validação completa de uma ideia de app:

**NOME DO APP:** {app_name}
**PROBLEMA:** {problem}
**PÚBLICO-ALVO:** {target}
**FEATURES PRINCIPAIS:** {features}
**CONCORRENTES:** {competitors}

---

**VALIDAÇÃO COMPLETA:**

**1. ANÁLISE SWOT**

| Forças | Fraquezas |
|--------|-----------|
| | |
| | |

| Oportunidades | Ameaças |
|---------------|---------|
| | |
| | |

**2. ANÁLISE COMPETITIVA DETALHADA**

Para cada concorrente:
| Aspecto | Concorrente 1 | Concorrente 2 | Seu App |
|---------|---------------|---------------|---------|
| Preço | | | |
| Features | | | |
| UX/Design | | | |
| Reviews | | | |
| Market share | | | |

- Gaps não atendidos:
- Diferenciais possíveis:

**3. DEFINIÇÃO DO MVP**
- Core feature (apenas 1):
- Features secundárias (máximo 3):
- O que NÃO terá no MVP:
- Plataforma inicial: iOS / Android / Ambos
- Tech stack sugerido:

**4. VALIDAÇÃO SEM CÓDIGO**
- Landing page de captura
- Formulário de interesse
- Protótipo clicável (Figma)
- Testes de usabilidade
- Entrevistas com usuários potenciais

**5. MÉTRICAS DE VALIDAÇÃO**
| Métrica | Meta | Resultado |
|---------|------|-----------|
| Sign-ups na landing | 500 | |
| Taxa de conversão | 5% | |
| NPS do protótipo | >7 | |
| Entrevistas realizadas | 20 | |
| Willingness to pay | >30% | |

**6. MODELO DE MONETIZAÇÃO**
- Opção A: Freemium
- Opção B: Assinatura
- Opção C: Compra única
- Opção D: In-app purchases
- Recomendação:

**7. ESTIMATIVA DE CUSTOS**
- MVP (desenvolvimento):
- Design:
- Infraestrutura (1 ano):
- Marketing inicial:
- Total estimado:

**8. PROJEÇÃO DE ROI**
| Mês | Usuários | Receita | Custo | Lucro |
|-----|----------|---------|-------|-------|
| 3 | | | | |
| 6 | | | | |
| 12 | | | | |

**9. GO/NO-GO DECISION**
- Checklist de validação
- Riscos identificados
- Recomendação final
- Próximos passos`,
      variables: [
        { name: 'app_name', label: 'Nome do app', placeholder: 'Ex: TaskFlow', type: 'text', required: true },
        { name: 'problem', label: 'Problema', placeholder: 'Ex: Freelancers perdem tempo gerenciando tarefas em múltiplas ferramentas', type: 'textarea', required: true },
        { name: 'target', label: 'Público', placeholder: 'Ex: Freelancers e consultores independentes', type: 'text', required: true },
        { name: 'features', label: 'Features principais', placeholder: 'Ex: Timer, relatórios, integrações, faturamento', type: 'textarea', required: true },
        { name: 'competitors', label: 'Concorrentes', placeholder: 'Ex: Toggl, Clockify, Harvest', type: 'text', required: true }
      ],
      examples: [],
      tags: ['app', 'saas', 'validação', 'mvp', 'startup', 'mobile'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-membership',
      categoryId: 'product-creation',
      title: 'Site de Membros / Assinatura',
      description: 'Crie um negócio de receita recorrente',
      template: `Planeje um site de membros/assinatura:

**NICHO:** {niche}
**TIPO DE CONTEÚDO:** {content_type}
**VALOR MENSAL:** {price}
**ESTRATÉGIA DE RETENÇÃO:** {retention}

---

**PLANEJAMENTO DE MEMBERSHIP:**

**1. PROPOSTA DE VALOR**
- Por que alguém pagaria mensalmente?
- Transformação contínua oferecida
- Diferencial vs conteúdo gratuito
- Diferencial vs cursos únicos

**2. ESTRUTURA DE CONTEÚDO**

*Conteúdo Base (sempre disponível):*
- Biblioteca de [X] recursos
- Templates e ferramentas
- Guias e tutoriais

*Conteúdo Recorrente (novo todo mês):*
- Semana 1: [Tipo de conteúdo]
- Semana 2: [Tipo de conteúdo]
- Semana 3: [Tipo de conteúdo]
- Semana 4: [Tipo de conteúdo]

*Conteúdo ao Vivo:*
- Lives semanais/mensais
- Q&A com especialistas
- Workshops práticos

**3. ESTRUTURA DE TIERS**

| Tier | Preço | Inclui | Para quem |
|------|-------|--------|-----------|
| Essencial | R$ X | | |
| Pro | R$ Y | | |
| VIP | R$ Z | | |

**4. COMUNIDADE**
- Plataforma (Discord, Circle, Slack)
- Estrutura de canais
- Moderação
- Engajamento e gamificação
- Networking entre membros

**5. ESTRATÉGIA ANTI-CHURN**
- Onboarding de novos membros
- Marcos de sucesso (milestones)
- Reconhecimento e badges
- Conteúdo exclusivo por tempo de casa
- Pesquisas de satisfação
- Win-back campaigns

**6. MÉTRICAS-CHAVE**
| Métrica | Meta | Fórmula |
|---------|------|---------|
| MRR | | |
| Churn mensal | <5% | |
| LTV | | |
| CAC | | |
| Engajamento | | |

**7. TECH STACK**
- Plataforma de membership
- Processamento de pagamentos
- Hospedagem de conteúdo
- Comunidade
- Email marketing

**8. LANÇAMENTO**
- Fase 1: Lista de espera
- Fase 2: Beta fechado (fundadores)
- Fase 3: Abertura geral
- Pricing de fundador vs regular

**9. PROJEÇÃO 12 MESES**
| Mês | Membros | MRR | Churn | Receita |
|-----|---------|-----|-------|---------|
| 1 | | | | |
| 6 | | | | |
| 12 | | | | |`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Marketing digital para dentistas', type: 'text', required: true },
        { name: 'content_type', label: 'Tipo de conteúdo', placeholder: 'Ex: Vídeos tutoriais + templates + comunidade + lives', type: 'textarea', required: true },
        { name: 'price', label: 'Preço mensal', placeholder: 'Ex: R$ 97/mês', type: 'text', required: true },
        { name: 'retention', label: 'Estratégia de retenção', placeholder: 'Ex: Novos templates toda semana + acesso a especialistas', type: 'text', required: true }
      ],
      examples: [],
      tags: ['membership', 'recorrência', 'assinatura', 'comunidade', 'MRR'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-micro-saas',
      categoryId: 'product-creation',
      title: 'Micro-SaaS Lucrativo',
      description: 'Software pequeno com grande potencial de lucro',
      template: `Planeje um Micro-SaaS lucrativo:

**NICHO ULTRA-ESPECÍFICO:** {niche}
**PROBLEMA:** {problem}
**MRR ALVO:** {mrr_target}
**SOLO FOUNDER:** {solo}

---

**PLANEJAMENTO MICRO-SAAS:**

**1. FILOSOFIA MICRO-SAAS**
- Foco em 1 problema, 1 solução
- Sem investimento externo necessário
- Operação enxuta (1-2 pessoas)
- Lucro > crescimento a qualquer custo
- Lifestyle business viável

**2. VALIDAÇÃO DO NICHO**
- Tamanho mínimo viável (1000 clientes potenciais?)
- Acessibilidade do público
- Willingness to pay comprovada
- Competição (ideal: pouca ou genérica)
- Sua vantagem unfair

**3. DEFINIÇÃO DO PRODUTO**

*Core Feature (apenas UMA):*
- O que faz:
- Input do usuário:
- Output/resultado:
- Tempo economizado:

*Features v1 (máximo 3):*
1.
2.
3.

*Anti-features (NÃO terá):*
- Por que manter simples

**4. MODELO DE NEGÓCIO**

| Plano | Preço | Limite | Target |
|-------|-------|--------|--------|
| Free | $0 | X uso/mês | Validação |
| Pro | $Y/mês | Ilimitado | Core |
| Team | $Z/mês | + features | Upsell |

**5. TECH STACK ENXUTO**
- Framework:
- Database:
- Hosting:
- Auth:
- Payments:
- Custo mensal total: $

**6. MARKETING DE MICRO-SAAS**
- SEO para long-tail keywords
- Diretórios de produtos (Product Hunt, etc.)
- Comunidades do nicho
- Conteúdo educativo
- Automações de growth

**7. OPERAÇÃO SOLO**
- Horas/semana dedicadas
- Suporte: como escalar sem equipe
- Automações essenciais
- Quando considerar contratar

**8. MÉTRICAS MICRO-SAAS**
| Métrica | Mês 6 | Mês 12 | Mês 24 |
|---------|-------|--------|--------|
| MRR | | | {mrr_target} |
| Clientes pagos | | | |
| Churn | | | |
| Margem | | | |

**9. EXIT STRATEGIES**
- Manter e operar (lifestyle)
- Vender (múltiplos de ARR)
- Automatizar 100%
- Passar bastão para operador`,
      variables: [
        { name: 'niche', label: 'Nicho ultra-específico', placeholder: 'Ex: Gestão de agendamentos para barbearias em cidades pequenas', type: 'text', required: true },
        { name: 'problem', label: 'Problema', placeholder: 'Ex: Barbearias perdem clientes por não ter agenda online simples', type: 'textarea', required: true },
        { name: 'mrr_target', label: 'MRR alvo', placeholder: 'Ex: R$ 10.000 (100 clientes x R$ 100)', type: 'text', required: true },
        { name: 'solo', label: 'Solo founder?', placeholder: 'Ex: Sim, projeto paralelo com 10h/semana', type: 'text', required: true }
      ],
      examples: [],
      tags: ['micro-saas', 'indie hacker', 'bootstrapped', 'solo founder', 'lifestyle'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-no-code-mvp',
      categoryId: 'product-creation',
      title: 'MVP No-Code Completo',
      description: 'Lance seu produto sem saber programar',
      template: `Planeje um MVP usando ferramentas no-code:

**IDEIA:** {idea}
**FUNCIONALIDADES:** {features}
**BUDGET:** {budget}

---

**PLANEJAMENTO MVP NO-CODE:**

**1. ANÁLISE DE VIABILIDADE NO-CODE**
- Complexidade do produto (1-10):
- Integrações necessárias:
- Escala esperada inicial:
- Viável em no-code? Sim/Não/Parcial

**2. STACK NO-CODE RECOMENDADO**

*Para o tipo de produto:*
| Necessidade | Ferramenta | Preço | Alternativa |
|-------------|-----------|-------|-------------|
| Frontend/Site | | | |
| Backend/DB | | | |
| Automações | | | |
| Auth | | | |
| Pagamentos | | | |
| Email | | | |

*Stacks populares:*
- Marketplace: Sharetribe / Bubble
- SaaS simples: Softr + Airtable
- App mobile: Glide / Adalo
- Landing + vendas: Carrd + Gumroad
- Diretório: Softr + Airtable
- Comunidade: Circle / Mighty Networks

**3. ARQUITETURA DO MVP**
\`\`\`
[Usuario] -> [Frontend] -> [Backend/DB] -> [Integracoes]
                |
          [Automacoes]
                |
         [Emails/Notificacoes]
\`\`\`

**4. FEATURES E COMO IMPLEMENTAR**

| Feature | Ferramenta | Como fazer | Tempo |
|---------|-----------|------------|-------|
| | | | |
| | | | |
| | | | |

**5. LIMITAÇÕES E WORKAROUNDS**
- Limitação 1: [Como contornar]
- Limitação 2: [Como contornar]
- Limitação 3: [Aceitar por agora]

**6. CUSTO MENSAL**
| Ferramenta | Plano | Custo |
|------------|-------|-------|
| | | |
| | | |
| Total | | R$ X |

**7. TIMELINE DE DESENVOLVIMENTO**
- Dia 1-2: Setup das ferramentas
- Dia 3-5: Estrutura de dados
- Dia 6-10: Frontend/interface
- Dia 11-12: Integrações
- Dia 13-14: Testes e ajustes
- Dia 15: Lançamento beta

**8. MÉTRICAS PÓS-LANÇAMENTO**
- Usuários cadastrados
- Ações completadas
- Erros/bugs reportados
- Feedback qualitativo
- Conversão (se aplicável)

**9. QUANDO MIGRAR PARA CÓDIGO**
- Sinais de que precisa migrar
- Custo estimado de migração
- Como preparar desde agora`,
      variables: [
        { name: 'idea', label: 'Ideia do produto', placeholder: 'Ex: Diretório de freelancers especializados em Notion', type: 'textarea', required: true },
        { name: 'features', label: 'Features essenciais', placeholder: 'Ex: Cadastro de perfis, busca por especialidade, reviews, contato', type: 'textarea', required: true },
        { name: 'budget', label: 'Budget mensal', placeholder: 'Ex: R$ 500/mês para ferramentas', type: 'text', required: true }
      ],
      examples: [],
      tags: ['no-code', 'mvp', 'bubble', 'airtable', 'sem programar'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pc-ai-tool',
      categoryId: 'product-creation',
      title: 'Ferramenta de IA',
      description: 'Crie um produto powered by inteligência artificial',
      template: `Planeje uma ferramenta baseada em IA:

**PROBLEMA A RESOLVER:** {problem}
**INPUT DO USUÁRIO:** {input}
**OUTPUT ESPERADO:** {output}
**MODELO DE IA:** {model}

---

**PLANEJAMENTO DE FERRAMENTA IA:**

**1. PROPOSTA DE VALOR**
- O que a IA faz melhor que humanos aqui?
- Tempo economizado por uso
- Qualidade do output vs alternativas
- Por que agora? (timing de mercado)

**2. ARQUITETURA TÉCNICA**

*Fluxo do usuário:*
\`\`\`
[Input usuário] → [Pré-processamento] → [API IA] → [Pós-processamento] → [Output]
\`\`\`

*Componentes:*
- Frontend: Interface de input/output
- Backend: Orquestração e lógica
- IA: API ou modelo próprio
- Storage: Histórico e dados

**3. ENGENHARIA DE PROMPT**
- System prompt base
- Variáveis dinâmicas
- Exemplos few-shot
- Guardrails e validações
- Tratamento de edge cases

**4. MODELO DE IA**

| Modelo | Custo/1K tokens | Qualidade | Velocidade | Uso |
|--------|-----------------|-----------|------------|-----|
| GPT-4 | $0.03 | Alta | Média | Premium |
| GPT-3.5 | $0.002 | Média | Alta | Padrão |
| Claude | $0.01 | Alta | Média | Alternativa |
| Llama | $0 (self-host) | Variável | Variável | Economia |

*Recomendação para seu caso:*

**5. CUSTOS E UNIT ECONOMICS**
- Custo médio por request: $
- Margem necessária: X%
- Preço mínimo por uso: $
- Modelo de cobrança: Por uso / Assinatura / Credits

**6. DIFERENCIAÇÃO**
- Wrapper puro vs produto:
  - ❌ Só chamar API = fácil copiar
  - ✅ + UX específica
  - ✅ + Dados proprietários
  - ✅ + Integrações
  - ✅ + Fine-tuning

**7. MONETIZAÇÃO**
| Plano | Limite | Preço | Custo IA | Margem |
|-------|--------|-------|----------|--------|
| Free | X/mês | $0 | | |
| Pro | Y/mês | $ | | |
| Unlimited | ∞ | $ | | |

**8. ROADMAP**
- v1: MVP com modelo base
- v2: Fine-tuning com dados próprios
- v3: Múltiplos modelos/casos de uso
- v4: Modelo próprio (se escala justificar)

**9. RISCOS E MITIGAÇÕES**
- Dependência de API terceira
- Custos escalando com uso
- Qualidade inconsistente
- Concorrência de big techs
- Mitigações para cada risco`,
      variables: [
        { name: 'problem', label: 'Problema a resolver', placeholder: 'Ex: Criar descrições de produtos para e-commerce é demorado e repetitivo', type: 'textarea', required: true },
        { name: 'input', label: 'Input do usuário', placeholder: 'Ex: Nome do produto + 3 características + tom de voz desejado', type: 'text', required: true },
        { name: 'output', label: 'Output esperado', placeholder: 'Ex: 3 variações de descrição otimizadas para SEO', type: 'text', required: true },
        { name: 'model', label: 'Modelo de IA', placeholder: 'Ex: GPT-4 para qualidade ou GPT-3.5 para economia', type: 'text', required: true }
      ],
      examples: [],
      tags: ['ia', 'inteligência artificial', 'gpt', 'llm', 'ferramenta'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-community-paid',
      categoryId: 'product-creation',
      title: 'Comunidade Paga',
      description: 'Monetize uma comunidade engajada',
      template: `Planeje uma comunidade paga:

**NICHO:** {niche}
**TAMANHO ATUAL:** {size}
**PLATAFORMA:** {platform}
**VALOR MENSAL:** {value}

---

**PLANEJAMENTO DE COMUNIDADE PAGA:**

**1. PROPOSTA DE VALOR ÚNICA**
- Por que pagar por comunidade?
- O que não consegue de graça?
- Transformação prometida
- Networking value
- Acesso exclusivo a quê/quem?

**2. ESTRUTURA DA COMUNIDADE**

*Canais/Espaços:*
| Canal | Propósito | Quem pode postar |
|-------|-----------|------------------|
| #boas-vindas | Onboarding | Todos |
| #apresentações | Networking | Todos |
| #dúvidas | Suporte peer | Todos |
| #wins | Celebrações | Todos |
| #recursos | Materiais | Admins |
| #eventos | Lives/encontros | Admins |

**3. CONTEÚDO E PROGRAMAÇÃO**

*Semanal:*
- Segunda: [Tema/atividade]
- Terça: [Tema/atividade]
- Quarta: [Tema/atividade]
- Quinta: [Tema/atividade]
- Sexta: [Tema/atividade]

*Mensal:*
- Semana 1: Live com convidado
- Semana 2: Workshop prático
- Semana 3: Hot seat / mentoria grupo
- Semana 4: Networking event

**4. ENGAJAMENTO E GAMIFICAÇÃO**
- Sistema de níveis/badges
- Reconhecimento de contribuições
- Desafios mensais
- Leaderboards
- Recompensas para top membros

**5. ONBOARDING DE NOVOS MEMBROS**
- Dia 1: Boas-vindas + tour
- Dia 2: Apresentação no canal
- Dia 3: Conexão com 3 membros
- Dia 7: Check-in de progresso
- Dia 30: Feedback + renovação

**6. RETENÇÃO E ANTI-CHURN**
| Ação | Frequência | Responsável |
|------|-----------|-------------|
| Check-in inativos | Semanal | |
| Pesquisa NPS | Mensal | |
| Conteúdo exclusivo | Contínuo | |
| Eventos especiais | Mensal | |
| Benefícios por tempo | Trimestral | |

**7. MODERAÇÃO E CULTURA**
- Regras da comunidade
- Processo de moderação
- Como lidar com conflitos
- Quando remover membros
- Cultivar cultura positiva

**8. MÉTRICAS**
| Métrica | Meta | Como medir |
|---------|------|------------|
| Membros ativos | >60% | Posts/semana |
| Retenção mensal | >90% | Churn |
| NPS | >50 | Pesquisa |
| Engajamento | X posts/dia | Analytics |

**9. CRESCIMENTO**
- Indicação de membros
- Conteúdo público → privado
- Parcerias
- Eventos abertos
- Testimonials e cases`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Growth marketers de startups', type: 'text', required: true },
        { name: 'size', label: 'Tamanho atual', placeholder: 'Ex: 200 membros gratuitos no Discord', type: 'text', required: true },
        { name: 'platform', label: 'Plataforma', placeholder: 'Ex: Discord + Circle', type: 'text', required: true },
        { name: 'value', label: 'Valor mensal', placeholder: 'Ex: R$ 97/mês', type: 'text', required: true }
      ],
      examples: [],
      tags: ['comunidade', 'membership', 'discord', 'network', 'engajamento'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pc-newsletter-business',
      categoryId: 'product-creation',
      title: 'Newsletter como Negócio',
      description: 'Transforme newsletter em fonte de receita',
      template: `Planeje uma newsletter monetizada:

**TEMA:** {topic}
**FREQUÊNCIA:** {frequency}
**BASE ATUAL:** {subscribers}
**MODELO DE MONETIZAÇÃO:** {model}

---

**PLANEJAMENTO DE NEWSLETTER:**

**1. POSICIONAMENTO**
- Nome da newsletter
- Tagline (promessa em 1 frase)
- Para quem é (e para quem não é)
- Diferencial vs outras newsletters
- Tom de voz

**2. ESTRUTURA DO CONTEÚDO**

*Formato padrão de cada edição:*
- Intro/gancho (2-3 linhas)
- Seção 1: [Nome] - [Tipo de conteúdo]
- Seção 2: [Nome] - [Tipo de conteúdo]
- Seção 3: [Nome] - [Tipo de conteúdo]
- CTA/encerramento

*Elementos recorrentes:*
- Quote da semana
- Ferramenta recomendada
- Link mais clicado
- Pergunta para engajamento

**3. CRESCIMENTO DE BASE**

| Canal | Estratégia | Meta/mês |
|-------|-----------|----------|
| SEO | Blog + lead magnet | +X |
| Social | Threads + carrosséis | +X |
| Referral | Programa de indicação | +X |
| Collabs | Cross-promotion | +X |
| Ads | Meta/Google | +X |

**4. MÉTRICAS-CHAVE**

| Métrica | Benchmark | Sua meta |
|---------|-----------|----------|
| Taxa abertura | >40% | |
| Taxa clique | >5% | |
| Crescimento/mês | >10% | |
| Churn/mês | <2% | |

**5. MONETIZAÇÃO**

*Estágio 1 (0-5k subs):*
- Produtos próprios
- Afiliados
- Serviços

*Estágio 2 (5k-20k subs):*
- Patrocínios pequenos
- Produtos digitais
- Comunidade paga

*Estágio 3 (20k+ subs):*
- Patrocínios premium
- Classified ads
- Eventos
- Tier pago

**6. ESTRUTURA DE PATROCÍNIO**

| Posição | Preço | Formato |
|---------|-------|---------|
| Header | R$ X | Logo + 1 linha |
| Feature | R$ Y | 100 palavras |
| Classificado | R$ Z | 50 palavras |
| Exclusivo | R$ W | Edição inteira |

*CPM target: R$ [X] por 1000 subs*

**7. NEWSLETTER PAGA (Tier Premium)**
- O que tem no free
- O que tem no pago
- Preço: R$ X/mês
- Meta de conversão: X%

**8. FERRAMENTAS**
| Necessidade | Ferramenta | Custo |
|-------------|-----------|-------|
| Email | Beehiiv/Substack | |
| Landing | | |
| Analytics | | |
| Referral | | |

**9. PROJEÇÃO 12 MESES**
| Mês | Subs | Receita | Fonte |
|-----|------|---------|-------|
| 1 | | | |
| 6 | | | |
| 12 | | | |`,
      variables: [
        { name: 'topic', label: 'Tema', placeholder: 'Ex: IA aplicada a negócios - ferramentas e estratégias', type: 'text', required: true },
        { name: 'frequency', label: 'Frequência', placeholder: 'Ex: Semanal (toda terça)', type: 'text', required: true },
        { name: 'subscribers', label: 'Inscritos atuais', placeholder: 'Ex: 2.500 inscritos', type: 'text', required: true },
        { name: 'model', label: 'Modelo de monetização', placeholder: 'Ex: Patrocínios + tier pago premium', type: 'text', required: true }
      ],
      examples: [],
      tags: ['newsletter', 'email', 'monetização', 'conteúdo', 'mídia'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pc-template-business',
      categoryId: 'product-creation',
      title: 'Negócio de Templates',
      description: 'Venda templates de Notion, Sheets, Design',
      template: `Planeje um negócio de templates:

**TIPO DE TEMPLATE:** {type}
**NICHO:** {niche}
**ESTRATÉGIA DE PREÇO:** {pricing}

---

**PLANEJAMENTO DE NEGÓCIO DE TEMPLATES:**

**1. ANÁLISE DE MERCADO**
- Demanda existente (buscas, comunidades)
- Concorrentes principais
- Faixa de preço do mercado
- Gaps não atendidos
- Tendências

**2. DEFINIÇÃO DO PRODUTO**

*Pack inicial (5-10 templates):*
| Template | Problema que resolve | Diferencial |
|----------|---------------------|-------------|
| 1 | | |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

*Para cada template:*
- Nome atrativo
- Screenshot/preview
- Descrição de benefícios
- Instruções de uso
- Customizações possíveis

**3. ESTRUTURA DE PREÇOS**

| Opção | Conteúdo | Preço |
|-------|----------|-------|
| Individual | 1 template | R$ X |
| Bundle pequeno | 3 templates | R$ Y |
| Bundle completo | Todos + bônus | R$ Z |
| Lifetime | Todos + futuros | R$ W |

*Estratégia de ancoragem:*
- Mostrar economia do bundle
- Preço riscado vs atual

**4. CANAIS DE VENDA**

| Canal | Comissão | Tráfego | Controle |
|-------|----------|---------|----------|
| Gumroad | 10% | Próprio | Total |
| Notion Market | 0% | Notion | Médio |
| Etsy | 6.5% | Etsy | Baixo |
| Próprio | 3% | Próprio | Total |

**5. MARKETING**

*Conteúdo gratuito:*
- Templates free para captura
- Tutoriais no YouTube
- Posts educativos
- Threads mostrando uso

*Distribuição:*
- SEO (blog + landing)
- Pinterest
- Twitter/X
- Reddit (comunidades do nicho)
- Product Hunt

**6. PRODUÇÃO E ESCALA**
- Tempo médio por template: X horas
- Frequência de novos templates
- Quando terceirizar design
- Atualizações e manutenção

**7. SUPORTE**
- FAQ detalhado
- Vídeos tutoriais
- Email para dúvidas
- Comunidade de usuários

**8. MÉTRICAS**
| Métrica | Meta |
|---------|------|
| Vendas/mês | |
| Ticket médio | |
| Conversão landing | |
| Reembolsos | <5% |

**9. ROADMAP**
- Mês 1: Criar pack inicial + landing
- Mês 2: Lançar + marketing orgânico
- Mês 3: Otimizar + novos templates
- Mês 6: Expandir canais
- Mês 12: [Meta de faturamento]`,
      variables: [
        { name: 'type', label: 'Tipo de template', placeholder: 'Ex: Notion databases para gestão', type: 'text', required: true },
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Criadores de conteúdo e freelancers', type: 'text', required: true },
        { name: 'pricing', label: 'Estratégia de preço', placeholder: 'Ex: R$ 37 individual, R$ 97 bundle completo', type: 'text', required: true }
      ],
      examples: [],
      tags: ['templates', 'notion', 'planilhas', 'design', 'digital'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pc-coaching-program',
      categoryId: 'product-creation',
      title: 'Programa de Coaching/Mentoria',
      description: 'Estruture um programa de mentoria premium',
      template: `Estruture um programa de coaching/mentoria:

**SUA EXPERTISE:** {expertise}
**FORMATO:** {format}
**DURAÇÃO:** {duration}
**PRECIFICAÇÃO:** {pricing}

---

**ESTRUTURA DO PROGRAMA:**

**1. POSICIONAMENTO**
- Nome do programa
- Promessa principal (transformação)
- Para quem é ideal (e quem não é)
- Seu diferencial como mentor
- Resultados esperados

**2. METODOLOGIA**

*Framework proprietário:*
- Nome do método
- Etapas/fases
- Ferramentas utilizadas
- Entregáveis por fase

*Jornada do mentorado:*
| Semana | Tema | Entregável | Marco |
|--------|------|------------|-------|
| 1-2 | Diagnóstico | | |
| 3-4 | Fundamentos | | |
| 5-8 | Implementação | | |
| 9-10 | Otimização | | |
| 11-12 | Escala | | |

**3. FORMATO DAS SESSÕES**

*Se 1-on-1:*
- Duração: X minutos
- Frequência: Semanal/quinzenal
- Plataforma: Zoom/Meet
- Gravação: Sim/Não

*Se grupo:*
- Tamanho máximo: X pessoas
- Calls em grupo: Frequência
- Hot seats: Como funciona
- Suporte assíncrono: Como

**4. MATERIAIS E RECURSOS**
- Workbooks/frameworks
- Templates e ferramentas
- Biblioteca de recursos
- Acesso a comunidade
- Bônus exclusivos

**5. SUPORTE**
- Canais (WhatsApp, Slack, email)
- Tempo de resposta
- Suporte entre sessões
- Emergências/urgências

**6. PRECIFICAÇÃO**

*Análise de valor:*
- Quanto vale o resultado?
- ROI para o mentorado
- Comparação com alternativas

*Estrutura:*
| Plano | Inclui | Preço |
|-------|--------|-------|
| Essencial | | R$ |
| Premium | | R$ |
| VIP | | R$ |

*Condições:*
- À vista: X% desconto
- Parcelamento: até X vezes
- Garantia: X dias

**7. PROCESSO DE VENDAS**
- Aplicação/triagem
- Call de diagnóstico
- Proposta personalizada
- Onboarding

**8. MÉTRICAS DE SUCESSO**
| Métrica | Meta |
|---------|------|
| Taxa de conclusão | >80% |
| NPS | >70 |
| Resultados dos mentorados | |
| Taxa de indicação | |
| Testimonials | |

**9. ESCALA**
- 1-1: Limite de clientes
- Transição para grupo
- Certificar outros mentores
- Programa self-service`,
      variables: [
        { name: 'expertise', label: 'Sua expertise', placeholder: 'Ex: Marketing digital para e-commerce de moda', type: 'textarea', required: true },
        { name: 'format', label: 'Formato', placeholder: 'Ex: 1-on-1 com calls semanais de 1h', type: 'text', required: true },
        { name: 'duration', label: 'Duração', placeholder: 'Ex: 12 semanas (3 meses)', type: 'text', required: true },
        { name: 'pricing', label: 'Precificação', placeholder: 'Ex: R$ 5.000 total ou 6x R$ 997', type: 'text', required: true }
      ],
      examples: [],
      tags: ['coaching', 'mentoria', 'consultoria', 'serviço', 'premium'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'pc-webinar-funnel',
      categoryId: 'product-creation',
      title: 'Funil de Webinar',
      description: 'Venda com webinars ao vivo ou automatizados',
      template: `Planeje um funil de webinar de vendas:

**PRODUTO:** {product}
**TEMA DO WEBINAR:** {webinar_topic}
**PREÇO:** {price}
**TAXA DE CONVERSÃO ALVO:** {conversion}

---

**ESTRUTURA DO FUNIL:**

**1. LANDING PAGE DE INSCRIÇÃO**
- Headline: Promessa + curiosidade
- Data/hora (ou "assista agora" se evergreen)
- 3 bullets do que vai aprender
- Prova social
- Formulário simples (nome + email)
- Urgência (vagas limitadas)

**2. PÁGINA DE OBRIGADO**
- Confirmação da inscrição
- Adicionar ao calendário
- Entrar no grupo WhatsApp/Telegram
- Consumir conteúdo antes (opcional)
- Lembrete para comparecer

**3. SEQUÊNCIA DE EMAILS PRÉ-WEBINAR**

| Timing | Email | Objetivo |
|--------|-------|----------|
| Imediato | Confirmação | Criar expectativa |
| D-1 | Lembrete | Aumentar show-up |
| D-0 (manhã) | Hoje é o dia | Urgência |
| D-0 (1h antes) | Começando | Último lembrete |

**4. ESTRUTURA DO WEBINAR (90 min)**

*Introdução (10 min):*
- Gancho de atenção
- Sua história/credenciais
- Promessa do webinar
- Regras de participação

*Conteúdo (40 min):*
- Ponto 1: [O Problema]
- Ponto 2: [Por que soluções comuns falham]
- Ponto 3: [A Nova Forma]
- Cases/resultados

*Transição (5 min):*
- Resumo do aprendizado
- "Mas e se você quisesse acelerar?"

*Oferta (25 min):*
- Apresentar o produto
- Bullets de benefícios
- Demonstração/preview
- Bônus
- Garantia
- Preço com ancoragem
- CTA urgente

*Q&A (10 min):*
- Responder objeções comuns
- Reforçar oferta
- Último CTA

**5. SEQUÊNCIA PÓS-WEBINAR**

| Timing | Email | Objetivo |
|--------|-------|----------|
| +1h | Replay disponível | Assistir |
| +24h | Testimonials | Prova social |
| +48h | Bônus expirando | Urgência |
| +72h | Última chance | Fechar carrinho |

**6. MÉTRICAS DO FUNIL**

| Etapa | Métrica | Benchmark | Meta |
|-------|---------|-----------|------|
| Inscrição | CPL | R$ X | |
| Show-up | Taxa | 30-40% | |
| Ficou até oferta | % | 50-60% | |
| Conversão | % | 5-15% | |

**7. AUTOMAÇÃO (Evergreen)**
- Plataforma de webinar
- Simular ao vivo ou gravado
- Chat simulado
- Urgência dinâmica
- Datas flexíveis

**8. OTIMIZAÇÃO**
- Testes de headline
- Testes de oferta
- Análise de drop-off
- Melhorar show-up rate
- Aumentar conversão`,
      variables: [
        { name: 'product', label: 'Produto', placeholder: 'Ex: Curso de Copy para Redes Sociais', type: 'text', required: true },
        { name: 'webinar_topic', label: 'Tema do webinar', placeholder: 'Ex: 5 Gatilhos de Copy que Triplicam seu Engajamento', type: 'text', required: true },
        { name: 'price', label: 'Preço', placeholder: 'Ex: R$ 497 (ou 12x R$ 49,70)', type: 'text', required: true },
        { name: 'conversion', label: 'Taxa de conversão alvo', placeholder: 'Ex: 8% dos que assistem até a oferta', type: 'text', required: true }
      ],
      examples: [],
      tags: ['webinar', 'funil', 'vendas', 'evergreen', 'lançamento'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'pc-print-on-demand',
      categoryId: 'product-creation',
      title: 'Print on Demand',
      description: 'Venda produtos físicos sem estoque',
      template: `Planeje um negócio de Print on Demand:

**NICHO:** {niche}
**PRODUTOS:** {products}
**CONCEITO DOS DESIGNS:** {designs}
**PLATAFORMA DE VENDA:** {platform}

---

**PLANEJAMENTO POD:**

**1. ANÁLISE DE NICHO**
- Tamanho do público
- Paixão/identidade (compram com orgulho?)
- Poder aquisitivo
- Concorrência existente
- Tendências de design no nicho

**2. SELEÇÃO DE PRODUTOS**

| Produto | Margem | Demanda | Facilidade |
|---------|--------|---------|------------|
| Camisetas | Alta | Alta | Fácil |
| Moletons | Muito alta | Média | Fácil |
| Canecas | Média | Alta | Fácil |
| Pôsters | Alta | Média | Fácil |
| Adesivos | Baixa | Alta | Fácil |
| Capas celular | Média | Média | Médio |

*Seleção inicial:* Começar com 2-3 produtos

**3. CONCEITO DE DESIGN**
- Estilo visual (minimalista, bold, vintage, etc.)
- Elementos recorrentes
- Paleta de cores
- Tipografia
- Referências visuais

*Categorias de designs:*
- Frases/quotes do nicho
- Ilustrações
- Tipografia criativa
- Mashups/referências
- Humor interno do nicho

**4. PRODUÇÃO DE DESIGNS**
| Opção | Custo | Qualidade | Escala |
|-------|-------|-----------|--------|
| Fazer você | $0 | Variável | Baixa |
| Canva/templates | ~$15/mês | Média | Média |
| Designers Fiverr | $5-50/design | Alta | Média |
| Designer fixo | $X/mês | Alta | Alta |

**5. FORNECEDOR POD**

| Fornecedor | Produtos | Qualidade | Preço | Envio BR |
|------------|----------|-----------|-------|----------|
| Printful | Muitos | Alta | Alto | Sim |
| Printify | Muitos | Variável | Médio | Sim |
| Montink | Brasil | Boa | Médio | Nativo |
| Reserva INK | Brasil | Alta | Alto | Nativo |

**6. ESTRUTURA DE PREÇOS**

| Produto | Custo | Preço | Margem |
|---------|-------|-------|--------|
| Camiseta | R$ 45 | R$ 89 | R$ 44 |
| Moletom | R$ 80 | R$ 159 | R$ 79 |
| Caneca | R$ 25 | R$ 49 | R$ 24 |

**7. LOJA E PLATAFORMA**
- Shopify (completo, pago)
- Etsy (marketplace, taxas)
- Nuvemshop (BR, acessível)
- Próprio Instagram/WhatsApp

**8. MARKETING**
- Pinterest (visual, SEO)
- Instagram (nicho, hashtags)
- TikTok (viral potential)
- Facebook Groups (comunidades)
- Influencers do nicho

**9. OPERAÇÃO**
- Processo de pedidos
- Suporte ao cliente
- Trocas e devoluções
- Controle de qualidade

**10. MÉTRICAS**
| Métrica | Meta |
|---------|------|
| Designs criados/mês | |
| Vendas/mês | |
| Ticket médio | |
| Margem média | |
| CAC | |`,
      variables: [
        { name: 'niche', label: 'Nicho', placeholder: 'Ex: Engenheiros civis / Profissionais de TI', type: 'text', required: true },
        { name: 'products', label: 'Produtos', placeholder: 'Ex: Camisetas, moletons, canecas', type: 'text', required: true },
        { name: 'designs', label: 'Conceito dos designs', placeholder: 'Ex: Frases técnicas engraçadas, piadas internas da profissão', type: 'textarea', required: true },
        { name: 'platform', label: 'Plataforma de venda', placeholder: 'Ex: Loja Shopify + Instagram', type: 'text', required: true }
      ],
      examples: [],
      tags: ['pod', 'print on demand', 'ecommerce', 'sem estoque', 'produtos físicos'],
      difficulty: 'intermediate',
      isPremium: true
    }
  ]
};
