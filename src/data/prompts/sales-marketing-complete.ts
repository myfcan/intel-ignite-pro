import { PromptCategory } from '../../types/prompt';

export const salesMarketingPromptsCategory: PromptCategory = {
  id: 'sales-marketing',
  name: 'Marketing e Vendas',
  description: 'Automação, qualificação, SDR, pipeline e métricas de vendas',
  icon: 'TrendingUp',
  color: 'bg-rose-500',
  isPopular: true,
  prompts: [
    // =====================================================
    // FREE PROMPTS (6 total)
    // =====================================================
    {
      id: 'sm-email-cold',
      categoryId: 'sales-marketing',
      title: 'Email Frio que Gera Resposta',
      description: 'Cold email com 30%+ open rate usando técnicas comprovadas',
      template: `Crie uma sequência de cold emails de alta conversão:

**INFORMAÇÕES DO PROSPECT:**
- Perfil alvo: {prospect}
- Produto/Serviço: {product}
- Benefício principal: {benefit}

---

## 📧 VERSÃO 1: EMAIL CURTO E DIRETO

**Subject Line (3 opções):**
1. [Opção curiosidade]
2. [Opção benefício]
3. [Opção personalizada]

**Corpo do Email:**
\`\`\`
Olá [Nome],

[1 frase de contexto/conexão - máx 15 palavras]

[1 frase sobre o problema que resolvemos]

[1 frase com resultado específico de cliente similar]

Vale uma conversa de 15 min?

[Assinatura]
\`\`\`

---

## 📧 VERSÃO 2: EMAIL STORYTELLING

**Subject Line:** [Opção que gera curiosidade]

**Estrutura:**
1. **Hook** (primeira linha que prende atenção)
2. **História curta** (cliente similar, problema, solução)
3. **Resultado específico** (números, métricas)
4. **CTA suave** (sem pressão)

---

## 📧 VERSÃO 3: EMAIL DATA-DRIVEN

**Subject Line:** [Estatística impactante]

**Estrutura:**
1. **Dado surpreendente** sobre o mercado/problema
2. **Implicação** para o prospect
3. **Nossa solução** em 1 frase
4. **Prova social** (logos ou números)
5. **CTA específico**

---

## 📊 MÉTRICAS DE REFERÊNCIA

| Métrica | Benchmark | Meta |
|---------|-----------|------|
| Open Rate | 20-25% | 35%+ |
| Reply Rate | 2-5% | 10%+ |
| Meeting Rate | 1-2% | 5%+ |

## ✅ CHECKLIST PRÉ-ENVIO
- [ ] Subject line tem menos de 50 caracteres
- [ ] Email tem menos de 150 palavras
- [ ] Há personalização real (não só nome)
- [ ] CTA é claro e único
- [ ] Sem anexos no primeiro email
- [ ] Enviando em horário ideal (terça-quinta, 8-10h)`,
      variables: [
        { name: 'prospect', label: 'Perfil do Prospect', placeholder: 'Ex: Diretores de RH em empresas de tecnologia 100-500 funcionários', type: 'textarea', required: true },
        { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Software de recrutamento com IA', type: 'text', required: true },
        { name: 'benefit', label: 'Benefício Principal', placeholder: 'Ex: Reduz 50% do tempo de contratação', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS B2B', input: { prospect: 'CTOs de startups série A-B', product: 'Plataforma de observabilidade', benefit: 'Reduz MTTR em 70%' }, output: 'Cold email gerado' },
        { title: 'Consultoria', input: { prospect: 'CEOs de indústrias mid-market', product: 'Consultoria em transformação digital', benefit: 'Aumenta eficiência operacional em 40%' }, output: 'Cold email gerado' }
      ],
      tags: ['cold email', 'prospecção', 'outbound', 'sdr'],
      difficulty: 'beginner',
      isPremium: false,
      isFeatured: true
    },
    {
      id: 'sm-followup-sequence',
      categoryId: 'sales-marketing',
      title: 'Sequência de Follow-up Estratégico',
      description: 'Nunca perca um lead por falta de follow-up inteligente',
      template: `Crie uma sequência completa de follow-up:

**CONTEXTO:**
- Situação atual: {situation}
- Produto/Serviço: {product}
- Número de tentativas planejadas: {attempts}

---

## 📅 SEQUÊNCIA DE {attempts} TOUCHPOINTS

### EMAIL 1 - DIA 1 (Imediato)
**Objetivo:** Relembrar e adicionar valor

**Subject:** Re: [Assunto anterior] + [Novo insight]

**Estrutura:**
- Referência à última interação
- 1 novo insight/valor (artigo, caso, dado)
- Pergunta aberta suave
- Sem pressão

---

### EMAIL 2 - DIA 3
**Objetivo:** Compartilhar case relevante

**Subject:** [Nome], achei que você ia gostar disso

**Estrutura:**
- Case de cliente similar
- Resultados específicos
- "Pensei em você porque..."
- CTA: "Faz sentido para [empresa]?"

---

### EMAIL 3 - DIA 7
**Objetivo:** Oferecer novo ângulo

**Subject:** Ideia rápida para [problema específico]

**Estrutura:**
- Insight específico sobre o mercado deles
- Como ajudamos outros
- Oferecer quick win gratuito
- CTA leve

---

### EMAIL 4 - DIA 14
**Objetivo:** Criar urgência sutil

**Subject:** Última tentativa (honesto)

**Estrutura:**
- Reconhecer que está ocupado
- Resumir valor em 2 linhas
- Perguntar se timing ruim
- Oferecer alternativa (conteúdo, webinar)

---

### EMAIL 5 - DIA 30 (BREAKUP)
**Objetivo:** Provocar resposta ou encerrar

**Subject:** Devo fechar seu arquivo?

**Estrutura:**
- Breve e direto
- Assumir que não é prioridade
- Deixar porta aberta
- Pedir feedback se possível

---

## ⏰ TIMING IDEAL POR CANAL

| Canal | Melhor Dia | Melhor Horário |
|-------|-----------|----------------|
| Email | Terça-Quinta | 8-10h ou 14-16h |
| LinkedIn | Terça-Quarta | 7-9h |
| Telefone | Quarta-Quinta | 10-11h ou 15-16h |

## 🎯 REGRAS DE OURO
1. **Sempre adicione valor** - nunca só "checking in"
2. **Varie o canal** - email, LinkedIn, telefone
3. **Personalize** - referência a algo específico
4. **Respeite o não** - 5-7 tentativas máximo
5. **Documente tudo** - para ajustar a sequência`,
      variables: [
        { name: 'situation', label: 'Situação Atual', placeholder: 'Ex: Prospect sumiu após demo, parecia interessado', type: 'textarea', required: true },
        { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: CRM para equipes de vendas', type: 'text', required: true },
        { name: 'attempts', label: 'Número de Tentativas', placeholder: 'Ex: 5 touchpoints em 30 dias', type: 'text', required: true }
      ],
      examples: [
        { title: 'Pós-Demo', input: { situation: 'Fez demo há 1 semana, disse que ia avaliar com o time', product: 'Software de automação de marketing', attempts: '5 touchpoints' }, output: 'Sequência de follow-up gerada' },
        { title: 'Proposta Enviada', input: { situation: 'Enviou proposta há 5 dias, não respondeu', product: 'Consultoria estratégica', attempts: '4 touchpoints' }, output: 'Sequência de follow-up gerada' }
      ],
      tags: ['follow-up', 'persistência', 'vendas', 'sequência'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'sm-linkedin-outreach',
      categoryId: 'sales-marketing',
      title: 'Outreach LinkedIn que Converte',
      description: 'Mensagens que geram reuniões no LinkedIn',
      template: `Crie uma estratégia completa de outreach no LinkedIn:

**PERFIL DO PROSPECT:**
- ICP (Perfil Ideal): {icp}
- Produto/Serviço: {product}
- Diferencial único: {unique}

---

## 🔗 FASE 1: PRÉ-CONEXÃO

### Ações de Aquecimento (7 dias antes)
1. **Dia 1-2:** Curtir 2-3 posts do prospect
2. **Dia 3-4:** Comentar com insight relevante (não genérico)
3. **Dia 5-6:** Compartilhar conteúdo deles com comentário
4. **Dia 7:** Enviar convite

---

## 👋 FASE 2: CONVITE DE CONEXÃO

**Opção A - Conexão em Comum:**
\`\`\`
[Nome], vi que também conhece [Pessoa].
Trabalho com [área] e achei seu conteúdo
sobre [tema] muito relevante. Vamos conectar?
\`\`\`

**Opção B - Conteúdo Deles:**
\`\`\`
[Nome], seu post sobre [tema] me fez
repensar [insight]. Adoraria trocar
ideias sobre [área]. Topa conectar?
\`\`\`

**Opção C - Evento/Grupo:**
\`\`\`
[Nome], vi que também participa de [grupo/evento].
Trabalho ajudando [ICP] com [resultado].
Vamos nos conectar?
\`\`\`

---

## 💬 FASE 3: SEQUÊNCIA PÓS-CONEXÃO

### Mensagem 1 - Imediata (após aceitar)
**Objetivo:** Agradecer + Valor

\`\`\`
Obrigado por conectar, [Nome]!

Vi que você lidera [área] na [empresa].
Recentemente ajudamos [empresa similar]
a [resultado específico].

Preparei um [material/insight] sobre [tema]
que pode ser útil. Posso enviar?
\`\`\`

---

### Mensagem 2 - Dia 3
**Objetivo:** Entregar valor prometido

\`\`\`
[Nome], como prometido, segue o [material].

O ponto X é especialmente relevante para
[situação da empresa deles].

O que achou?
\`\`\`

---

### Mensagem 3 - Dia 7
**Objetivo:** Gerar conversa

\`\`\`
[Nome], curiosidade: como vocês estão
lidando com [desafio comum do ICP]?

Pergunto porque é um tema recorrente
nas conversas que tenho com [cargo similar].

Topa trocar uma ideia rápida sobre isso?
\`\`\`

---

### Mensagem 4 - Dia 14 (CTA)
**Objetivo:** Propor reunião

\`\`\`
[Nome], baseado no que vi da [empresa],
tenho algumas ideias que podem ajudar
com [problema específico].

Que tal 15 min para explorar?
Terça ou quarta funcionam?
\`\`\`

---

## 📊 MÉTRICAS DE LINKEDIN

| Etapa | Taxa Esperada |
|-------|---------------|
| Aceite de conexão | 30-40% |
| Resposta à 1ª msg | 15-25% |
| Reunião agendada | 5-10% |

## ⚠️ ERROS A EVITAR
- ❌ Pitch no convite de conexão
- ❌ Mensagens genéricas (copy-paste óbvio)
- ❌ Ignorar o perfil/conteúdo do prospect
- ❌ Ser muito insistente (máx 4-5 msgs)
- ❌ Não personalizar por empresa/cargo`,
      variables: [
        { name: 'icp', label: 'ICP (Perfil Ideal)', placeholder: 'Ex: VPs de Marketing em empresas SaaS B2B, 50-200 funcionários', type: 'textarea', required: true },
        { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Ferramenta de analytics de marketing', type: 'text', required: true },
        { name: 'unique', label: 'Diferencial Único', placeholder: 'Ex: Relatórios automatizados que economizam 10h/semana', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS para RH', input: { icp: 'Heads de RH em scale-ups', product: 'Plataforma de engajamento', unique: 'Aumenta retenção em 35%' }, output: 'Sequência LinkedIn gerada' }
      ],
      tags: ['linkedin', 'social selling', 'b2b', 'outreach'],
      difficulty: 'beginner',
      isPremium: false
    },
    {
      id: 'sm-discovery-call',
      categoryId: 'sales-marketing',
      title: 'Script de Discovery Call',
      description: 'Qualifique leads e descubra necessidades reais',
      template: `Crie um script completo de Discovery Call:

**CONTEXTO DA CALL:**
- Produto/Serviço: {product}
- Duração planejada: {duration}
- Critérios de qualificação: {qualify_criteria}

---

## 📋 PRÉ-CALL (5 min antes)

### Pesquisa Obrigatória:
- [ ] LinkedIn do prospect (cargo, tempo na empresa)
- [ ] Site da empresa (notícias, funding, crescimento)
- [ ] Interações anteriores (emails, downloads)
- [ ] Competidores que podem usar
- [ ] Preparar 2-3 perguntas personalizadas

---

## 🎯 ESTRUTURA DA CALL ({duration})

### ABERTURA (2-3 min)
\`\`\`
"[Nome], obrigado por reservar esse tempo.
Antes de começar, confirmando que temos [X] minutos, certo?

Meu objetivo hoje é entender sua situação atual
e ver se faz sentido continuarmos a conversa.
Se no final não fizer sentido para você,
está 100% ok me dizer. Combinado?

Para começar, o que te motivou a aceitar essa call?"
\`\`\`

---

### SITUAÇÃO ATUAL (5-7 min) - SPIN: Situation

**Perguntas:**
1. "Me conta um pouco sobre seu papel na [empresa]"
2. "Como funciona hoje o processo de [área relevante]?"
3. "Que ferramentas/soluções vocês usam atualmente?"
4. "Quantas pessoas estão envolvidas nisso?"
5. "Como é medido o sucesso dessa área?"

---

### PROBLEMAS/DOR (7-10 min) - SPIN: Problem + Implication

**Perguntas de Problema:**
1. "Quais são os maiores desafios que você enfrenta com [área]?"
2. "O que não funciona tão bem quanto gostaria?"
3. "Se pudesse mudar uma coisa, o que seria?"

**Perguntas de Implicação:**
1. "Quanto isso custa em termos de tempo/dinheiro?"
2. "Como isso afeta [outras áreas/métricas]?"
3. "O que acontece se não resolver isso em 6 meses?"
4. "Quem mais é impactado por esse problema?"

---

### NECESSIDADE/VALOR (5-7 min) - SPIN: Need-Payoff

**Perguntas:**
1. "Se resolvesse isso, qual seria o impacto ideal?"
2. "O que mudaria para você pessoalmente?"
3. "Como seu chefe mediria o sucesso disso?"
4. "Já tentaram resolver antes? O que aconteceu?"

---

### QUALIFICAÇÃO BANT (5 min)

| Critério | Perguntas |
|----------|-----------|
| **Budget** | "Existe budget alocado para isso?" / "Como funcionam decisões de investimento?" |
| **Authority** | "Quem mais precisaria estar envolvido?" / "Como funciona o processo de decisão?" |
| **Need** | "Isso é prioridade agora?" / "O que compete com isso?" |
| **Timeline** | "Quando idealmente querem resolver?" / "O que pode acelerar/atrasar?" |

---

### FECHAMENTO (3-5 min)

\`\`\`
"[Nome], baseado no que você me contou:
- [Resumo do problema principal]
- [Impacto identificado]
- [Resultado desejado]

Acho que podemos ajudar porque [conexão com solução].

Próximo passo seria [demo/proposta/reunião técnica].
Faz sentido agendarmos? Que tal [data específica]?"
\`\`\`

---

## 📊 SCORECARD DE QUALIFICAÇÃO

| Critério | 🔴 Ruim | 🟡 Ok | 🟢 Bom |
|----------|---------|-------|--------|
| Dor | Vaga | Clara | Urgente |
| Budget | Inexistente | A definir | Alocado |
| Autoridade | Influenciador | Avaliador | Decisor |
| Timeline | 12+ meses | 6 meses | 3 meses |
| Fit | Parcial | Bom | Perfeito |

**Qualificado se:** 3+ critérios verdes ou 2 verdes + 2 amarelos`,
      variables: [
        { name: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Consultoria de transformação digital', type: 'text', required: true },
        { name: 'duration', label: 'Duração da Call', placeholder: 'Ex: 30 minutos', type: 'text', required: true },
        { name: 'qualify_criteria', label: 'Critérios de Qualificação', placeholder: 'Ex: Budget mínimo R$50k, empresa 100+ funcionários, decisor presente', type: 'textarea', required: true }
      ],
      examples: [
        { title: 'SaaS Enterprise', input: { product: 'Plataforma de dados enterprise', duration: '45 minutos', qualify_criteria: 'Budget $100k+, VP ou C-level, timeline 6 meses' }, output: 'Script de discovery call gerado' }
      ],
      tags: ['discovery', 'qualificação', 'spin', 'vendas', 'script'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'sm-proposal-template',
      categoryId: 'sales-marketing',
      title: 'Template de Proposta Comercial',
      description: 'Propostas profissionais que fecham negócios',
      template: `Crie uma proposta comercial completa e persuasiva:

**INFORMAÇÕES DO PROJETO:**
- Serviço/Produto: {service}
- Cliente: {client}
- Investimento: {investment}

---

## 📄 ESTRUTURA DA PROPOSTA

### CAPA
\`\`\`
PROPOSTA COMERCIAL

[Nome do Projeto/Solução]

Preparada para: [Nome do Cliente]
Preparada por: [Sua Empresa]
Data: [Data]
Validade: 15 dias
\`\`\`

---

### 1. SUMÁRIO EXECUTIVO (1 página)

**O Desafio:**
[2-3 frases sobre o problema identificado na discovery]

**Nossa Compreensão:**
[Demonstre que entendeu a situação específica deles]

**A Solução:**
[1 parágrafo sobre como vamos resolver]

**Resultado Esperado:**
[Métricas/benefícios principais]

---

### 2. DIAGNÓSTICO DA SITUAÇÃO

**Situação Atual:**
| Área | Status Atual | Impacto |
|------|--------------|---------|
| [Área 1] | [Problema] | [Custo/Impacto] |
| [Área 2] | [Problema] | [Custo/Impacto] |
| [Área 3] | [Problema] | [Custo/Impacto] |

**Oportunidades Identificadas:**
1. [Oportunidade 1 + potencial ganho]
2. [Oportunidade 2 + potencial ganho]
3. [Oportunidade 3 + potencial ganho]

---

### 3. SOLUÇÃO PROPOSTA

**Visão Geral:**
[Descrição da solução em 1 parágrafo]

**Componentes:**

| Módulo | Descrição | Benefício |
|--------|-----------|-----------|
| [Módulo 1] | [O que inclui] | [Resultado] |
| [Módulo 2] | [O que inclui] | [Resultado] |
| [Módulo 3] | [O que inclui] | [Resultado] |

**Diferenciais da Nossa Abordagem:**
- ✅ [Diferencial 1]
- ✅ [Diferencial 2]
- ✅ [Diferencial 3]

---

### 4. METODOLOGIA E TIMELINE

**Fases do Projeto:**

\`\`\`
FASE 1: [Nome] (Semanas 1-2)
├── Entregável 1
├── Entregável 2
└── Marco: [Resultado]

FASE 2: [Nome] (Semanas 3-4)
├── Entregável 3
├── Entregável 4
└── Marco: [Resultado]

FASE 3: [Nome] (Semanas 5-8)
├── Entregável 5
├── Entregável 6
└── Marco: [Resultado]
\`\`\`

**Cronograma Visual:**

| Fase | Sem 1 | Sem 2 | Sem 3 | Sem 4 | Sem 5-8 |
|------|-------|-------|-------|-------|---------|
| Fase 1 | ████ | ████ | | | |
| Fase 2 | | | ████ | ████ | |
| Fase 3 | | | | | ████████ |

---

### 5. INVESTIMENTO

**Opção Recomendada:**

| Item | Valor |
|------|-------|
| [Componente 1] | R$ X.XXX |
| [Componente 2] | R$ X.XXX |
| [Componente 3] | R$ X.XXX |
| **TOTAL** | **{investment}** |

**Condições de Pagamento:**
- 30% na assinatura
- 40% na entrega da Fase 2
- 30% na conclusão

**Opção Alternativa (se aplicável):**
[Versão simplificada com escopo/preço menor]

---

### 6. ROI ESPERADO

**Cálculo do Retorno:**

| Benefício | Valor Anual Estimado |
|-----------|---------------------|
| [Economia 1] | R$ XX.XXX |
| [Ganho 2] | R$ XX.XXX |
| [Eficiência 3] | R$ XX.XXX |
| **Total Benefícios** | **R$ XXX.XXX** |

**Payback:** X meses
**ROI 12 meses:** XXX%

---

### 7. CREDENCIAIS

**Sobre [Sua Empresa]:**
[2-3 frases sobre a empresa]

**Cases Relevantes:**
- [Cliente similar] - [Resultado alcançado]
- [Cliente similar] - [Resultado alcançado]

**Depoimento:**
> "[Quote de cliente satisfeito]"
> — Nome, Cargo, Empresa

---

### 8. PRÓXIMOS PASSOS

1. ✅ Revisão desta proposta
2. ⬜ Reunião de alinhamento (se necessário)
3. ⬜ Aprovação e assinatura do contrato
4. ⬜ Kick-off do projeto

**Para aceitar esta proposta:**
[Instruções claras de como proceder]

**Contato:**
[Nome] | [Email] | [Telefone]

---

### TERMOS E CONDIÇÕES

- Validade: 15 dias
- Não incluso: [Itens fora do escopo]
- Premissas: [O que esperamos do cliente]
- Confidencialidade: [Cláusula padrão]`,
      variables: [
        { name: 'service', label: 'Serviço/Produto', placeholder: 'Ex: Implementação de CRM Salesforce', type: 'text', required: true },
        { name: 'client', label: 'Cliente', placeholder: 'Ex: Empresa de logística com 100 vendedores', type: 'textarea', required: true },
        { name: 'investment', label: 'Investimento Total', placeholder: 'Ex: R$ 85.000', type: 'text', required: true }
      ],
      examples: [
        { title: 'Consultoria', input: { service: 'Reestruturação comercial', client: 'Distribuidora regional, 50 vendedores', investment: 'R$ 120.000' }, output: 'Proposta comercial gerada' }
      ],
      tags: ['proposta', 'comercial', 'fechamento', 'vendas', 'template'],
      difficulty: 'intermediate',
      isPremium: false
    },
    {
      id: 'sm-sales-playbook',
      categoryId: 'sales-marketing',
      title: 'Sales Playbook Completo',
      description: 'Documente e escale seu processo de vendas',
      template: `Crie um Sales Playbook completo para escalar vendas:

**CONTEXTO DA EMPRESA:**
- Empresa/Produto: {company}
- Ciclo médio de vendas: {sales_cycle}
- Ticket médio: {ticket}

---

## 📘 SALES PLAYBOOK

### PARTE 1: FUNDAMENTOS

#### 1.1 Nossa Proposta de Valor

**O que vendemos:**
[Descrição clara do produto/serviço]

**Para quem vendemos:**
[ICP - Ideal Customer Profile]

**Por que nos escolhem:**
1. [Diferencial 1]
2. [Diferencial 2]
3. [Diferencial 3]

**Por que NÃO somos a escolha certa:**
[Quando desqualificar - importante para não perder tempo]

---

#### 1.2 ICP - Perfil de Cliente Ideal

**Firmográficos:**
| Critério | Ideal | Aceitável | Desqualifica |
|----------|-------|-----------|--------------|
| Setor | | | |
| Tamanho | | | |
| Receita | | | |
| Localização | | | |

**Persona - Decisor:**
- Cargo típico: [Ex: VP de Vendas]
- Dores principais: [Lista]
- Métricas que importam: [Lista]
- Objeções comuns: [Lista]

**Persona - Influenciador:**
- Cargo típico: [Ex: Gerente de Operações]
- Como ajuda/atrapalha: [Descrição]

---

### PARTE 2: PROCESSO DE VENDAS

#### 2.1 Funil e Estágios

\`\`\`
ESTÁGIO 1: LEAD (Entrada)
├── Critério entrada: [Ex: Preencheu formulário]
├── Ações: [Pesquisa, primeiro contato]
├── Tempo máximo: 24h
└── Critério saída: [Contato estabelecido]

ESTÁGIO 2: QUALIFICAÇÃO
├── Critério entrada: [Respondeu/atendeu]
├── Ações: [Discovery call]
├── Tempo máximo: 7 dias
└── Critério saída: [BANT qualificado]

ESTÁGIO 3: DEMONSTRAÇÃO
├── Critério entrada: [BANT ok]
├── Ações: [Demo personalizada]
├── Tempo máximo: 14 dias
└── Critério saída: [Interesse confirmado]

ESTÁGIO 4: PROPOSTA
├── Critério entrada: [Pediu proposta]
├── Ações: [Enviar proposta, negociar]
├── Tempo máximo: 14 dias
└── Critério saída: [Proposta aceita]

ESTÁGIO 5: FECHAMENTO
├── Critério entrada: [Proposta aceita]
├── Ações: [Contrato, pagamento]
├── Tempo máximo: 7 dias
└── Critério saída: [Cliente ativo]
\`\`\`

---

#### 2.2 Métricas por Estágio

| Estágio | Conversão Meta | Tempo Médio | Ações/Dia |
|---------|---------------|-------------|-----------|
| Lead → Qualificado | 30% | 3 dias | 50 contatos |
| Qualificado → Demo | 60% | 5 dias | 3 demos |
| Demo → Proposta | 50% | 7 dias | 2 propostas |
| Proposta → Fechado | 40% | 10 dias | Follow-ups |

**Win Rate Geral Meta:** 7-10%

---

### PARTE 3: SCRIPTS E TEMPLATES

#### 3.1 Script de Cold Call

\`\`\`
ABERTURA (10 seg):
"Oi [Nome], aqui é [Seu nome] da [Empresa].
Peguei você em um momento ruim?"

SE SIM: "Entendo. Qual melhor horário para
uma conversa de 2 minutos?"

SE NÃO: "Ótimo. O motivo da ligação é que
ajudamos [ICPs] a [resultado principal].
[Cliente similar] conseguiu [resultado específico].

Faz sentido eu explicar como em 2 minutos?"
\`\`\`

---

#### 3.2 Framework de Objeções

**"Está caro"**
1. Entender: "Comparado a quê?"
2. Valor: "Se considerarmos [ROI], o retorno é..."
3. Alternativa: "Temos opção de [entrada menor]"

**"Preciso pensar"**
1. Validar: "Claro, faz sentido. O que exatamente
   precisa avaliar melhor?"
2. Descobrir: "É sobre [preço/timing/fit]?"
3. Resolver: Endereçar a real objeção

**"Já tenho fornecedor"**
1. Respeitar: "Ótimo, significa que valoriza [área]"
2. Diferenciar: "O que nos diferencia é [X]"
3. Plantar semente: "Quando for reavaliar,
   podemos conversar?"

---

### PARTE 4: FERRAMENTAS E STACK

#### 4.1 Tech Stack de Vendas

| Função | Ferramenta | Como Usar |
|--------|-----------|-----------|
| CRM | [Ex: HubSpot] | [Processo] |
| Prospecção | [Ex: Apollo] | [Processo] |
| Calls | [Ex: Zoom] | [Processo] |
| Assinatura | [Ex: DocuSign] | [Processo] |
| Análise | [Ex: Gong] | [Processo] |

---

### PARTE 5: ONBOARDING DE REPS

#### Semana 1: Fundamentos
- [ ] Produto: features, benefícios, demo
- [ ] Mercado: ICP, competidores, tendências
- [ ] Processo: CRM, ferramentas, rotina

#### Semana 2: Shadowing
- [ ] Acompanhar 10 calls de qualificação
- [ ] Acompanhar 5 demos
- [ ] Acompanhar 3 negociações

#### Semana 3: Prática Supervisionada
- [ ] Fazer 5 calls com supervisão
- [ ] Fazer 2 demos com suporte
- [ ] Role-play de objeções

#### Semana 4: Ramp
- [ ] Meta: 25% da quota
- [ ] Feedback diário
- [ ] Ajustes de abordagem

**Ramp completo:** 90 dias para 100% produtividade`,
      variables: [
        { name: 'company', label: 'Empresa/Produto', placeholder: 'Ex: SaaS B2B de automação de marketing', type: 'text', required: true },
        { name: 'sales_cycle', label: 'Ciclo de Vendas', placeholder: 'Ex: 45 dias em média', type: 'text', required: true },
        { name: 'ticket', label: 'Ticket Médio', placeholder: 'Ex: R$ 15.000/ano', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS SMB', input: { company: 'Software de gestão financeira', sales_cycle: '21 dias', ticket: 'R$ 500/mês' }, output: 'Playbook de vendas gerado' }
      ],
      tags: ['playbook', 'processo', 'vendas', 'documentação', 'escala'],
      difficulty: 'advanced',
      isPremium: false
    },

    // =====================================================
    // PREMIUM PROMPTS
    // =====================================================
    {
      id: 'sm-pipeline',
      categoryId: 'sales-marketing',
      title: 'Pipeline de Vendas Estruturado',
      description: 'Monte um pipeline previsível e escalável',
      template: `Crie um pipeline de vendas completo e previsível:

**CONTEXTO DO NEGÓCIO:**
- Produto: {product}
- Ticket médio: {ticket}
- Ciclo de venda: {cycle}
- Time atual: {team}
- Meta mensal: {goal}

---

## 🎯 ESTRUTURA DO PIPELINE

### 1. DEFINIÇÃO DE ESTÁGIOS

| # | Estágio | Critério de Entrada | Probabilidade | Ações Obrigatórias |
|---|---------|---------------------|---------------|-------------------|
| 1 | **Lead Novo** | Contato identificado | 5% | Pesquisa, 1º contato |
| 2 | **Conectado** | Conversa estabelecida | 10% | Qualificação inicial |
| 3 | **Qualificado** | BANT confirmado | 25% | Discovery completa |
| 4 | **Demo/Reunião** | Demo agendada | 40% | Demonstração valor |
| 5 | **Proposta** | Proposta enviada | 60% | Negociação |
| 6 | **Negociação** | Termos em discussão | 80% | Ajustes finais |
| 7 | **Fechado Ganho** | Contrato assinado | 100% | Handoff CS |
| 8 | **Fechado Perdido** | Desqualificado/Perdeu | 0% | Post-mortem |

---

### 2. CÁLCULO DE METAS E VOLUME

**Meta: {goal}**

\`\`\`
CÁLCULO REVERSO DO PIPELINE:

Meta mensal:                    {goal}
÷ Ticket médio:                 {ticket}
= Deals necessários:            [X deals]

÷ Taxa fechamento (20%):
= Propostas necessárias:        [X propostas]

÷ Taxa demo→proposta (50%):
= Demos necessárias:            [X demos]

÷ Taxa qualif→demo (60%):
= Leads qualificados:           [X leads]

÷ Taxa conexão (30%):
= Leads totais necessários:     [X leads/mês]
\`\`\`

**Por Rep ({team}):**
| Métrica | Diária | Semanal | Mensal |
|---------|--------|---------|--------|
| Leads contatados | X | X | X |
| Conexões | X | X | X |
| Qualificados | X | X | X |
| Demos | X | X | X |
| Propostas | X | X | X |

---

### 3. CRITÉRIOS DE QUALIFICAÇÃO

**Framework BANT+:**

| Critério | Perguntas-Chave | Score |
|----------|----------------|-------|
| **Budget** | Existe verba? Quem aprova? | 0-25 |
| **Authority** | Quem decide? Quem influencia? | 0-25 |
| **Need** | Dor é urgente? Prioridade? | 0-25 |
| **Timeline** | Quando quer resolver? | 0-25 |

**Qualificado:** Score ≥ 70

**Red Flags (desqualificar):**
- ❌ Budget < {ticket} × 0.5
- ❌ Timeline > 12 meses
- ❌ Sem acesso ao decisor
- ❌ Dor não é prioridade

---

### 4. SLAs E TEMPOS

| Estágio | Tempo Máximo | Ação se Exceder |
|---------|--------------|-----------------|
| Lead → Conexão | 24h | Automação follow-up |
| Conexão → Qualif | 7 dias | Review gerente |
| Qualif → Demo | 7 dias | Nudge + alternativa |
| Demo → Proposta | 5 dias | Call follow-up |
| Proposta → Decisão | 14 dias | Escalação/desconto |

---

### 5. AUTOMAÇÕES DO PIPELINE

**Trigger 1: Lead novo entra**
→ Email boas-vindas (automático)
→ Task para SDR (contato em 24h)
→ Enriquecer dados (Clearbit/Apollo)

**Trigger 2: Sem atividade 7 dias**
→ Alerta para rep
→ Email automático "checking in"
→ Escalar para gerente se 14 dias

**Trigger 3: Proposta enviada**
→ Reminder dia 3
→ Task follow-up dia 7
→ Alerta gerente dia 10

---

### 6. FORECAST E REPORTING

**Forecast Semanal:**
\`\`\`
COMMIT (90%+ probabilidade):     R$ ___
BEST CASE (50-90%):              R$ ___
PIPELINE (25-50%):               R$ ___
EARLY STAGE (<25%):              R$ ___

FORECAST PONDERADO:              R$ ___
vs META:                         ___%
\`\`\`

**Métricas do Pipeline:**
| Métrica | Fórmula | Meta |
|---------|---------|------|
| Velocity | (Deals × Win Rate × Ticket) ÷ Ciclo | > {goal} |
| Coverage | Pipeline ÷ Meta | 3-4x |
| Win Rate | Ganhos ÷ Total | 20-25% |
| Ciclo Médio | Dias lead→fechamento | {cycle} |

---

### 7. REVIEW DE PIPELINE (Semanal)

**Agenda (30 min):**
1. **Forecast update** (5 min) - Commit vs meta
2. **Deals em risco** (10 min) - O que está travado?
3. **Top 5 deals** (10 min) - Próximos passos
4. **Coaching** (5 min) - 1 skill a desenvolver`,
      variables: [
        { name: 'product', label: 'Produto', placeholder: 'Ex: Software de RH para PMEs', type: 'text', required: true },
        { name: 'ticket', label: 'Ticket Médio', placeholder: 'Ex: R$ 5.000/ano', type: 'text', required: true },
        { name: 'cycle', label: 'Ciclo de Venda', placeholder: 'Ex: 30 dias', type: 'text', required: true },
        { name: 'team', label: 'Time', placeholder: 'Ex: 2 SDRs + 3 AEs', type: 'text', required: true },
        { name: 'goal', label: 'Meta Mensal', placeholder: 'Ex: R$ 100.000', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS B2B', input: { product: 'CRM para imobiliárias', ticket: 'R$ 3.000/ano', cycle: '21 dias', team: '1 SDR + 2 AEs', goal: 'R$ 50.000' }, output: 'Pipeline de vendas gerado' }
      ],
      tags: ['pipeline', 'vendas', 'crm', 'processo', 'funil', 'forecast'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true
    },
    {
      id: 'sm-outbound',
      categoryId: 'sales-marketing',
      title: 'Cadência de Prospecção Outbound',
      description: 'Sequência SDR que gera reuniões consistentemente',
      template: `Crie uma cadência de prospecção outbound completa:

**CONFIGURAÇÃO:**
- ICP (Perfil Ideal): {icp}
- Produto: {product}
- Canais disponíveis: {channels}

---

## 📞 CADÊNCIA DE 10 TOUCHPOINTS (21 dias)

### DIA 1 - EMAIL 1 + LINKEDIN

**Email 1: Primeiro Contato**
\`\`\`
Subject: [Pergunta sobre {problema do ICP}]

Oi [Nome],

[1 frase de contexto personalizado - pesquise antes]

Vi que a [Empresa] está [crescendo/contratando/expandindo].
Geralmente quando isso acontece, [problema comum] vira
prioridade.

Ajudamos [empresa similar] a [resultado específico].

Vale 15 min para ver se faz sentido?

[Assinatura]
\`\`\`

**LinkedIn: Pedido de Conexão**
\`\`\`
[Nome], vi que lidera [área] na [Empresa].
Trabalho ajudando [ICPs] com [resultado].
Vamos conectar?
\`\`\`

---

### DIA 3 - CALL 1

**Script Cold Call:**
\`\`\`
ABERTURA:
"[Nome]? Aqui é [Seu nome] da [Empresa].
Tem 30 segundos?"

SE SIM:
"Trabalho com [ICPs] ajudando com [problema].
Recentemente [cliente similar] conseguiu [resultado].

Faz sentido uma conversa de 15 min para
ver se podemos ajudar também?"

SE NÃO ATENDER:
- Deixar voicemail de 20 segundos
- Tentar número alternativo
- Registrar melhor horário para retry
\`\`\`

---

### DIA 5 - EMAIL 2 (Valor)

\`\`\`
Subject: Re: [Subject anterior] - [insight]

[Nome],

Esqueci de mencionar: acabamos de publicar
[estudo/case/conteúdo] sobre [tema relevante].

[1-2 frases do insight principal]

Link: [URL]

Achei que seria relevante dado [contexto da empresa].

Thoughts?

[Assinatura curta]
\`\`\`

---

### DIA 7 - LINKEDIN (Mensagem)

\`\`\`
[Nome], obrigado por conectar!

Vi seu post sobre [tema] - [comentário específico].

Curiosidade: como vocês estão lidando com
[desafio relacionado ao seu produto]?

É um tema comum nas conversas que tenho
com [cargo similar].
\`\`\`

---

### DIA 10 - CALL 2 + EMAIL 3

**Call:** Mesmo script, horário diferente

**Email 3: Case Study**
\`\`\`
Subject: Como [Empresa similar] resolveu [problema]

[Nome],

[Empresa do mesmo setor] tinha o mesmo
desafio que imagino vocês enfrentam: [problema].

Em [X meses], conseguiram:
• [Resultado 1]
• [Resultado 2]
• [Resultado 3]

Posso mostrar como em 15 min?

[Assinatura]
\`\`\`

---

### DIA 12 - LINKEDIN (Engajamento)

- Curtir último post
- Comentar com insight (não pitch)
- Enviar mensagem se não respondeu

---

### DIA 15 - EMAIL 4 (Urgência Sutil)

\`\`\`
Subject: Ideia para [Empresa]

[Nome],

Tive uma ideia específica para [Empresa]
baseado em [algo que pesquisou].

[2-3 frases da ideia - valor real]

Vale uma call rápida para detalhar?

Se não for o melhor momento, me avisa
quando faz mais sentido.

[Assinatura]
\`\`\`

---

### DIA 17 - CALL 3

**Abordagem Diferente:**
\`\`\`
"[Nome], tentei contato algumas vezes.
Queria só confirmar: [problema] é prioridade
para vocês agora ou não faz sentido conversarmos?"
\`\`\`

---

### DIA 19 - EMAIL 5 (Breakup)

\`\`\`
Subject: Devo encerrar?

[Nome],

Tentei algumas vezes sem sucesso.

Geralmente isso significa:
a) Timing ruim (me diz quando voltar)
b) Não é prioridade (100% ok)
c) Está super ocupado (entendo)

Se for (a), quando seria melhor?

De qualquer forma, fico à disposição.

[Assinatura]
\`\`\`

---

### DIA 21 - ÚLTIMA TENTATIVA

**LinkedIn Final + Call:**

LinkedIn:
\`\`\`
[Nome], última tentativa de contato.
Se [problema] virar prioridade no futuro,
estou à disposição. Sucesso!
\`\`\`

---

## 📊 MÉTRICAS DA CADÊNCIA

| Métrica | Meta | Fórmula |
|---------|------|---------|
| Taxa de Contato | 20-30% | Conectados ÷ Tentativas |
| Taxa de Resposta | 10-15% | Respostas ÷ Enviados |
| Taxa de Reunião | 5-8% | Reuniões ÷ Contatos |
| Shows | 80%+ | Compareceram ÷ Agendadas |

## 📋 QUALIFICAÇÃO BANT

| Critério | Qualificado | Desqualificado |
|----------|-------------|----------------|
| Budget | Verba existe/pode existir | Zero budget |
| Authority | Decisor ou acesso a ele | Sem acesso |
| Need | Dor clara e urgente | "Nice to have" |
| Timeline | < 6 meses | > 12 meses |`,
      variables: [
        { name: 'icp', label: 'ICP (Perfil Ideal)', placeholder: 'Ex: CFOs de empresas 50-200 funcionários, setor varejo', type: 'textarea', required: true },
        { name: 'product', label: 'Produto', placeholder: 'Ex: Software de BI e analytics', type: 'text', required: true },
        { name: 'channels', label: 'Canais', placeholder: 'Ex: Cold call, email, LinkedIn', type: 'text', required: true }
      ],
      examples: [
        { title: 'B2B Tech', input: { icp: 'CTOs de startups série A-C, 20-100 pessoas', product: 'Plataforma de DevOps', channels: 'Email, LinkedIn, Cold Call' }, output: 'Cadência de prospecção gerada' }
      ],
      tags: ['outbound', 'sdr', 'prospecção', 'cold call', 'cadência', 'sequência'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'sm-objection-handling',
      categoryId: 'sales-marketing',
      title: 'Framework de Tratamento de Objeções',
      description: 'Responda objeções com confiança e feche mais vendas',
      template: `Crie um framework completo para tratamento de objeções:

**CONTEXTO:**
- Produto: {product}
- Preço: {price}
- Objeções mais comuns: {objections}

---

## 🎯 FRAMEWORK LAER PARA OBJEÇÕES

### O Método LAER:
1. **L**isten - Escute completamente sem interromper
2. **A**cknowledge - Reconheça a preocupação
3. **E**xplore - Explore para entender a raiz
4. **R**espond - Responda de forma adequada

---

## 💰 OBJEÇÃO: "ESTÁ CARO" / "NÃO TENHO BUDGET"

### Listen & Acknowledge:
\`\`\`
"Entendo sua preocupação com o investimento.
Preço é um fator importante e faz sentido
considerar com cuidado."
\`\`\`

### Explore:
\`\`\`
"Me ajuda a entender melhor:
- Caro comparado a quê? [alternativa/expectativa]
- O que seria um investimento confortável?
- O problema de [dor] tem custo para vocês hoje?"
\`\`\`

### Respond (baseado na resposta):

**Se comparado a competidor:**
\`\`\`
"Faz sentido comparar. A diferença é que [diferencial].
[Cliente X] também considerou [competidor] e escolheu
a gente porque [razão]. O resultado foi [métrica].
Se considerarmos o ROI, na verdade [cálculo favorável]."
\`\`\`

**Se não tem budget:**
\`\`\`
"Entendo. Algumas opções:
1. Começar menor com [versão reduzida]
2. Parcelar em [X meses]
3. Iniciar no próximo trimestre quando tiver verba

Qual faz mais sentido para sua situação?"
\`\`\`

**Se não vê valor:**
\`\`\`
"O que te faria sentir que vale o investimento?
[Ouvir resposta]
Perfeito. E se eu mostrar que conseguimos
entregar [o que ele disse]? Aí faz sentido?"
\`\`\`

---

## ⏰ OBJEÇÃO: "PRECISO PENSAR"

### Acknowledge:
\`\`\`
"Claro, é uma decisão importante e faz
sentido refletir. Não quero que tome uma
decisão apressada."
\`\`\`

### Explore:
\`\`\`
"Me ajuda: o que especificamente você
precisa avaliar melhor?

É sobre:
- O fit da solução para vocês?
- O investimento?
- Timing?
- Precisa envolver alguém?

Pergunto para ver se posso ajudar
com alguma informação adicional."
\`\`\`

### Respond:

**Se precisa envolver alguém:**
\`\`\`
"Perfeito. Que tal agendarmos uma call
com [pessoa] presente? Assim posso
responder as dúvidas diretamente."
\`\`\`

**Se é sobre timing:**
\`\`\`
"Entendo. Quando seria o momento ideal?
Pergunto porque [razão para agir agora:
promoção expirando, implementação leva X tempo, etc.]"
\`\`\`

**Se é sobre preço (disfarçado):**
\`\`\`
"Às vezes quando alguém diz que precisa pensar,
é sobre o investimento. É isso?
[Se sim, use framework de preço]"
\`\`\`

---

## 🏢 OBJEÇÃO: "JÁ TENHO FORNECEDOR"

### Acknowledge:
\`\`\`
"Ótimo, isso mostra que [área] é
importante para vocês. Faz sentido
ter um parceiro estabelecido."
\`\`\`

### Explore:
\`\`\`
"Me conta:
- Como tem sido a experiência?
- O que funciona bem?
- Se pudesse melhorar algo, o que seria?
- Quando foi a última vez que avaliaram alternativas?"
\`\`\`

### Respond:

**Se satisfeito:**
\`\`\`
"Que bom que está funcionando.
O que nos diferencia é [diferencial único].
[Cliente similar] também estava satisfeito
com [competidor] até descobrir que [benefício único].

Não precisa trocar agora, mas vale conhecer
para quando for reavaliar. 15 min?"
\`\`\`

**Se insatisfeito:**
\`\`\`
"Parece que [problema mencionado] está
te custando [tempo/dinheiro/stress].
Exatamente isso que resolvemos com [feature].
Posso mostrar como funcionaria para vocês?"
\`\`\`

---

## ⏳ OBJEÇÃO: "NÃO É O MOMENTO"

### Explore:
\`\`\`
"Entendo. Me ajuda a entender:
- O que está tomando prioridade agora?
- Quando seria um momento melhor?
- O que mudaria para virar prioridade?"
\`\`\`

### Respond:

**Se tem prazo:**
\`\`\`
"Perfeito, anoto aqui para retomar em [data].
Enquanto isso, posso enviar [conteúdo relevante]?
Assim quando chegar a hora, você já conhece a solução."
\`\`\`

**Se indefinido:**
\`\`\`
"O desafio é que [problema] geralmente
só piora com o tempo. [Cliente X] adiou
por 6 meses e o custo de resolver depois
foi [X% maior].

E se começássemos pequeno agora?"
\`\`\`

---

## 📊 MATRIZ DE OBJEÇÕES

| Objeção | Tipo Real | Estratégia |
|---------|-----------|------------|
| "Caro" | Valor | Demonstrar ROI |
| "Pensar" | Medo | Identificar real objeção |
| "Tem fornecedor" | Status quo | Criar insatisfação |
| "Não é momento" | Prioridade | Criar urgência |
| "Preciso falar com..." | Autoridade | Envolver decisor |
| "Não funciona pra gente" | Fit | Explorar ou desqualificar |

## 🎭 ROLE-PLAY SCENARIOS

**Cenário 1: O Cético**
- Duvida de tudo, quer provas
- Estratégia: Cases, dados, garantias

**Cenário 2: O Ocupado**
- Não tem tempo, sempre correndo
- Estratégia: Ser objetivo, quick wins

**Cenário 3: O Técnico**
- Quer detalhes de implementação
- Estratégia: Demo técnica, POC

**Cenário 4: O Político**
- Preocupado com percepção interna
- Estratégia: Alinhamento com stakeholders`,
      variables: [
        { name: 'product', label: 'Produto', placeholder: 'Ex: Consultoria de reestruturação empresarial', type: 'text', required: true },
        { name: 'price', label: 'Preço', placeholder: 'Ex: R$ 50.000 projeto / R$ 5.000/mês', type: 'text', required: true },
        { name: 'objections', label: 'Objeções Mais Comuns', placeholder: 'Ex: Preço alto, já tentaram consultoria antes e não funcionou, timing ruim', type: 'textarea', required: true }
      ],
      examples: [
        { title: 'SaaS Enterprise', input: { product: 'Plataforma de dados', price: 'R$ 120.000/ano', objections: 'Preço, tem ferramenta in-house, precisa de aprovação do board' }, output: 'Scripts de objeções gerados' }
      ],
      tags: ['objeções', 'vendas', 'fechamento', 'scripts', 'negociação'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'sm-lead-scoring',
      categoryId: 'sales-marketing',
      title: 'Sistema de Lead Scoring',
      description: 'Priorize leads quentes automaticamente',
      template: `Crie um sistema completo de lead scoring:

**CONTEXTO:**
- Negócio: {business}
- Critérios importantes: {criteria}
- Ferramentas atuais: {tools}

---

## 📊 MODELO DE LEAD SCORING

### PARTE 1: SCORE DEMOGRÁFICO (0-50 pontos)

**Fit com ICP - Quão parecido é com cliente ideal?**

| Critério | Pontuação |
|----------|-----------|
| **Cargo** | |
| C-Level / VP | +15 |
| Diretor / Head | +12 |
| Gerente | +8 |
| Analista | +3 |
| Estagiário/Outro | 0 |
| **Tamanho Empresa** | |
| [Ideal: ex. 100-500] | +15 |
| [Aceitável: ex. 50-100] | +10 |
| [Pequeno: ex. 10-50] | +5 |
| [Fora do fit] | 0 |
| **Setor** | |
| [Setores ideais] | +10 |
| [Setores aceitáveis] | +5 |
| [Outros setores] | 0 |
| **Localização** | |
| [Região principal] | +10 |
| [Região secundária] | +5 |
| [Outras regiões] | 0 |

---

### PARTE 2: SCORE COMPORTAMENTAL (0-50 pontos)

**Engajamento - O que fizeram no seu site/conteúdo?**

| Ação | Pontos | Decay |
|------|--------|-------|
| **Alta Intenção** | | |
| Pediu demo/contato | +20 | - |
| Visitou página de preços | +15 | 7 dias |
| Baixou case study | +10 | 14 dias |
| **Média Intenção** | | |
| Abriu 3+ emails | +8 | 14 dias |
| Visitou 5+ páginas | +8 | 14 dias |
| Baixou ebook/whitepaper | +5 | 30 dias |
| **Baixa Intenção** | | |
| Se inscreveu newsletter | +3 | - |
| Seguiu rede social | +2 | - |
| Visitou 1-2 páginas | +1 | 7 dias |
| **Negativo** | | |
| Unsubscribe | -10 | - |
| Bounce de email | -5 | - |
| Não abre emails 30 dias | -5 | - |

---

### PARTE 3: CLASSIFICAÇÃO DE LEADS

**Thresholds:**

| Score Total | Classificação | Ação |
|-------------|---------------|------|
| 80-100 | 🔥 **Hot Lead** | SDR liga em < 1h |
| 60-79 | 🟠 **Warm Lead** | SDR liga em < 24h |
| 40-59 | 🟡 **MQL** | Nurturing + SDR |
| 20-39 | 🔵 **Lead** | Nurturing automático |
| 0-19 | ⚪ **Subscriber** | Newsletter apenas |

---

### PARTE 4: AUTOMAÇÕES

**Trigger 1: Lead vira Hot (80+)**
\`\`\`
→ Notificação Slack para SDR
→ Task no CRM (prioridade alta)
→ Email interno com contexto
→ SLA: Contato em 1 hora
\`\`\`

**Trigger 2: Lead vira MQL (40+)**
\`\`\`
→ Adicionar à sequência SDR
→ Task no CRM
→ Entrar em lista de prioridade
→ SLA: Contato em 24 horas
\`\`\`

**Trigger 3: Score cai abaixo de 40**
\`\`\`
→ Remover de sequência SDR
→ Voltar para nurturing
→ Email de reengajamento
\`\`\`

**Trigger 4: Lead inativo 30 dias**
\`\`\`
→ Reduzir score em 20%
→ Campanha de reativação
→ Se não engajar: arquivar
\`\`\`

---

### PARTE 5: IMPLEMENTAÇÃO EM {tools}

**Campos Necessários:**
- Lead Score (número)
- Score Demográfico (número)
- Score Comportamental (número)
- Data Último Engajamento
- Classificação (picklist)
- Data MQL
- Data SQL

**Workflows:**
1. Recalcular score a cada ação
2. Atualizar classificação automaticamente
3. Notificar time em mudanças de status
4. Decay automático semanal

---

### PARTE 6: MÉTRICAS E OTIMIZAÇÃO

**Métricas para Acompanhar:**

| Métrica | Fórmula | Meta |
|---------|---------|------|
| MQL→SQL | SQLs ÷ MQLs | 30%+ |
| SQL→Opp | Opps ÷ SQLs | 50%+ |
| Score→Close | Correlação score vs win | >0.5 |
| Velocity | Dias MQL→Cliente | Reduzir |

**Revisão Mensal:**
1. Quais leads de alto score não converteram?
2. Quais leads de baixo score converteram?
3. Ajustar pesos baseado em dados reais
4. A/B testar novos critérios`,
      variables: [
        { name: 'business', label: 'Tipo de Negócio', placeholder: 'Ex: SaaS B2B de automação de marketing', type: 'text', required: true },
        { name: 'criteria', label: 'Critérios Importantes', placeholder: 'Ex: Cargo decisor, tamanho empresa 50-500, setor tech/varejo', type: 'textarea', required: true },
        { name: 'tools', label: 'Ferramentas', placeholder: 'Ex: HubSpot, Salesforce, RD Station', type: 'text', required: true }
      ],
      examples: [
        { title: 'B2B SaaS', input: { business: 'Software de gestão de projetos', criteria: 'PMs e CTOs, empresas 20-200, tech e agências', tools: 'HubSpot' }, output: 'Sistema de lead scoring gerado' }
      ],
      tags: ['lead scoring', 'qualificação', 'automação', 'mql', 'sql'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'sm-demo-script',
      categoryId: 'sales-marketing',
      title: 'Script de Demo Perfeita',
      description: 'Demonstrações que fecham negócios',
      template: `Crie um script completo para demos de vendas:

**CONTEXTO:**
- Produto: {product}
- Duração: {duration}
- Persona: {persona}

---

## 🎯 ESTRUTURA DA DEMO ({duration})

### PRÉ-DEMO (Preparação)

**Pesquisa Obrigatória:**
- [ ] Reviu notas da Discovery Call
- [ ] Pesquisou empresa (notícias, LinkedIn)
- [ ] Identificou 3 dores principais
- [ ] Preparou casos de uso específicos
- [ ] Customizou ambiente demo (logo, dados)

**Setup Técnico:**
- [ ] Testou conexão e compartilhamento
- [ ] Demo environment limpo e funcionando
- [ ] Backup plan se algo falhar
- [ ] Link de gravação (se autorizado)

---

### ABERTURA (3-5 min)

**1. Boas-vindas e Rapport:**
\`\`\`
"[Nome], bom te ver! Como foi a semana?
[Small talk breve]

Antes de começar, quem mais está na call?
[Anotar nomes e cargos]

Perfeito. Temos [X] minutos, certo?"
\`\`\`

**2. Agenda Setting:**
\`\`\`
"Minha sugestão de agenda:
1. Recapitular o que conversamos (2 min)
2. Mostrar como resolvemos [dor principal] (15 min)
3. Perguntas e próximos passos (10 min)

Funciona? Algo mais que queiram ver?"
\`\`\`

**3. Recapitulação da Discovery:**
\`\`\`
"Na nossa última conversa, você mencionou que:
- [Dor 1 - nas palavras deles]
- [Dor 2]
- [Resultado desejado]

Ainda é isso? Mudou algo?"
\`\`\`

---

### CORPO DA DEMO (15-25 min)

**Princípio: MOSTRAR, NÃO CONTAR**

**Framework "Problema → Solução → Resultado"**

**Dor #1: [Nome da dor principal]**

\`\`\`
SETUP: "Você mencionou que [problema].
Deixa eu mostrar como resolvemos isso..."

DEMO: [Mostrar funcionalidade específica]
- Narrar cada clique
- Pausar para verificar entendimento
- Conectar com situação deles

RESULTADO: "Com isso, [cliente similar]
conseguiu [resultado específico]."

CHECK: "Como isso se compara ao que
vocês fazem hoje?"
\`\`\`

**Dor #2: [Segunda dor]**
[Repetir framework]

**Dor #3: [Terceira dor]**
[Repetir framework]

---

### TÉCNICAS DURANTE A DEMO

**1. Narração Contextualizada:**
- ❌ "Aqui você clica em configurações"
- ✅ "Quando [persona] precisa [tarefa], ela vem aqui..."

**2. Pausas Estratégicas:**
- A cada 3-4 minutos: "Alguma dúvida até aqui?"
- Após feature importante: "O que achou?"
- Se silêncio: "Faz sentido para vocês?"

**3. Handling Técnico:**
\`\`\`
Se algo falhar:
"Deixa eu mostrar de outra forma..."
[Ter screenshots/vídeo backup]

Se pergunta técnica profunda:
"Ótima pergunta. Posso trazer nosso
[técnico] para detalhar. Por agora,
o importante é [resumo alto nível]."
\`\`\`

**4. Storytelling com Cases:**
\`\`\`
"Isso me lembra a [Empresa X].
Eles tinham o mesmo desafio.
Depois de implementar, conseguiram [resultado].
O [Cargo] de lá disse: '[quote]'"
\`\`\`

---

### FECHAMENTO (5-10 min)

**1. Resumo de Valor:**
\`\`\`
"Recapitulando, hoje vimos como podemos:
✅ [Resolver dor 1] - economizando [X]
✅ [Resolver dor 2] - melhorando [Y]
✅ [Resolver dor 3] - eliminando [Z]

O que mais chamou sua atenção?"
\`\`\`

**2. Termômetro:**
\`\`\`
"Numa escala de 1-10, onde 10 é 'preciso
disso ontem', onde vocês estão?"

Se < 7: "O que falta para chegar a 10?"
Se 7+: "Ótimo! Qual seria o próximo passo ideal?"
\`\`\`

**3. Próximos Passos Concretos:**
\`\`\`
"Baseado no que vimos, sugiro:
1. [Próximo passo específico]
2. [Prazo definido]
3. [Quem precisa estar envolvido]

Funciona [data específica] às [hora]?"
\`\`\`

**4. Se Precisar de Mais Stakeholders:**
\`\`\`
"Quem mais precisaria ver isso?
Posso fazer uma sessão específica
para [time técnico/financeiro/etc]."
\`\`\`

---

## ⚠️ ERROS COMUNS A EVITAR

| Erro | Por Que É Ruim | O Que Fazer |
|------|----------------|-------------|
| Demo genérica | Não conecta com dor | Customizar 100% |
| Mostrar tudo | Confunde, entedia | Foco em 3-4 features |
| Falar demais | Não engaja | Fazer perguntas |
| Pular discovery | Demo irrelevante | Sempre recapitular |
| Não pedir próximo passo | Oportunidade esfria | Sempre fechar com CTA |

## 📊 MÉTRICAS PÓS-DEMO

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Demo→Proposta | 60%+ | CRM |
| Engajamento | 4+ perguntas | Anotações |
| Tempo de fala | 60% prospect | Gravação |
| Follow-up em 24h | 100% | CRM task |`,
      variables: [
        { name: 'product', label: 'Produto', placeholder: 'Ex: Plataforma de analytics e BI', type: 'text', required: true },
        { name: 'duration', label: 'Duração', placeholder: 'Ex: 30 minutos', type: 'text', required: true },
        { name: 'persona', label: 'Persona Principal', placeholder: 'Ex: Head de Marketing em empresa de e-commerce', type: 'textarea', required: true }
      ],
      examples: [
        { title: 'SaaS B2B', input: { product: 'CRM com automação', duration: '45 minutos', persona: 'Diretor Comercial de distribuidora' }, output: 'Script de demo gerado' }
      ],
      tags: ['demo', 'apresentação', 'vendas', 'script', 'fechamento'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'sm-upsell-strategy',
      categoryId: 'sales-marketing',
      title: 'Estratégia de Upsell e Cross-sell',
      description: 'Aumente receita da base de clientes existente',
      template: `Crie uma estratégia completa de upsell/cross-sell:

**CONTEXTO:**
- Produto base: {product}
- Base de clientes: {customer_base}
- Produtos para upsell: {products}

---

## 📈 ESTRATÉGIA DE EXPANSION REVENUE

### PARTE 1: MAPEAMENTO DE OPORTUNIDADES

**Matriz de Produtos:**

| Produto Base | Upsell Natural | Cross-sell |
|--------------|----------------|------------|
| [Plano Básico] | [Plano Pro] | [Add-on A] |
| [Plano Pro] | [Plano Enterprise] | [Add-on B] |
| [Produto A] | [Versão Premium] | [Produto B] |

**Gatilhos de Upsell:**

| Trigger | Sinal | Ação |
|---------|-------|------|
| Uso alto | >80% do limite | Propor upgrade |
| Feature request | Pede algo do tier acima | Mostrar plano superior |
| Crescimento | +30% usuários/receita | Review de conta |
| Renovação | 60 dias antes | Propor bundle |
| NPS alto | Score 9-10 | Pedir referral + upsell |

---

### PARTE 2: IDENTIFICAÇÃO DE CLIENTES

**Score de Propensão ao Upsell:**

| Critério | Pontos | Como Medir |
|----------|--------|------------|
| Uso de produto | 0-25 | % features usadas |
| Engajamento | 0-25 | Logins, sessões |
| Satisfação | 0-25 | NPS, tickets |
| Fit para upgrade | 0-25 | Crescimento, setor |

**Segmentação:**
- **🔥 Hot (80+):** Abordagem proativa
- **🟠 Warm (60-79):** Nurturing educacional
- **🟡 Cold (<60):** Foco em retenção primeiro

---

### PARTE 3: PLAYBOOKS DE ABORDAGEM

**Playbook 1: Upgrade de Plano**

\`\`\`
TRIGGER: Cliente usando >80% do limite

EMAIL INICIAL:
Subject: [Nome], vi que a [Empresa] está crescendo!

Oi [Nome],

Parabéns pelo crescimento! Vi que vocês estão
usando [X%] do limite do plano atual.

Isso geralmente significa que estão extraindo
muito valor - ótimo sinal!

Para garantir que não tenham interrupções,
temos duas opções:

1. Upgrade para [Plano Superior] - [benefício]
2. Add-on de [recurso extra] - [benefício]

Qual faz mais sentido? Posso mostrar em 15 min.

[Assinatura]
\`\`\`

---

**Playbook 2: Cross-sell de Add-on**

\`\`\`
TRIGGER: Cliente não usa feature relacionada

ABORDAGEM QBR:
"[Nome], revisando a conta de vocês, notei que
não estão usando [feature/add-on].

Clientes similares que implementaram viram
[resultado específico].

Posso mostrar como funcionaria para vocês?"
\`\`\`

---

**Playbook 3: Expansion por Usuários**

\`\`\`
TRIGGER: Empresa cresceu/contratou

EMAIL:
Subject: Mais licenças para [Empresa]?

[Nome],

Vi que a [Empresa] está contratando para [área].

Geralmente quando isso acontece, faz sentido
expandir o uso de [produto] para [benefício].

Temos condições especiais para expansão de
clientes existentes.

Quer saber mais?
\`\`\`

---

### PARTE 4: TIMING IDEAL

**Momentos de Ouro para Upsell:**

| Momento | Por que Funciona | Abordagem |
|---------|------------------|-----------|
| Pós-quick win | Cliente feliz | "Quer mais resultados assim?" |
| QBR | Revisão natural | Mostrar gaps e oportunidades |
| Renovação | Decisão iminente | Bundle com desconto |
| Novo stakeholder | Quer impressionar | Demo expandida |
| Funding/crescimento | Tem budget | Propor escala |

**Momentos a Evitar:**
- ❌ Durante problema/ticket aberto
- ❌ Logo após aumento de preço
- ❌ Quando NPS está baixo
- ❌ Antes de resolver onboarding

---

### PARTE 5: MÉTRICAS DE EXPANSION

**KPIs Principais:**

| Métrica | Fórmula | Meta |
|---------|---------|------|
| **NRR** (Net Revenue Retention) | (MRR início + Expansion - Churn) ÷ MRR início | >110% |
| **Expansion MRR** | Receita adicional de clientes existentes | +15%/ano |
| **Upsell Rate** | Clientes que fizeram upgrade ÷ Total | >20% |
| **Cross-sell Rate** | Clientes com 2+ produtos ÷ Total | >30% |
| **Time to Expand** | Dias do primeiro contrato ao upsell | <180 dias |

---

### PARTE 6: AUTOMAÇÕES

**Fluxo Automático de Identificação:**

\`\`\`
[Uso > 80%]
    ↓
[Criar oportunidade no CRM]
    ↓
[Notificar CSM/AM]
    ↓
[Email automático de awareness]
    ↓
[Task: Ligar em 3 dias]
\`\`\`

**Fluxo de Nurturing para Expansion:**
1. **Semana 1:** Case study de cliente que expandiu
2. **Semana 2:** Feature spotlight do tier superior
3. **Semana 3:** Convite para webinar avançado
4. **Semana 4:** Outreach personalizado do CSM`,
      variables: [
        { name: 'product', label: 'Produto Base', placeholder: 'Ex: SaaS de gestão de projetos - Plano Team', type: 'text', required: true },
        { name: 'customer_base', label: 'Base de Clientes', placeholder: 'Ex: 500 clientes ativos, ticket médio R$ 500/mês', type: 'textarea', required: true },
        { name: 'products', label: 'Produtos para Upsell/Cross-sell', placeholder: 'Ex: Plano Business (+50%), Add-on Analytics, Add-on Automação', type: 'textarea', required: true }
      ],
      examples: [
        { title: 'SaaS B2B', input: { product: 'CRM Plano Starter', customer_base: '200 PMEs, R$ 300/mês médio', products: 'Plano Pro, Plano Enterprise, Add-on BI' }, output: 'Estratégia de upsell gerada' }
      ],
      tags: ['upsell', 'cross-sell', 'expansion', 'crescimento', 'receita'],
      difficulty: 'intermediate',
      isPremium: true
    },
    {
      id: 'sm-account-management',
      categoryId: 'sales-marketing',
      title: 'Account Management Excellence',
      description: 'Retenção e expansão de contas estratégicas',
      template: `Crie um programa de Account Management:

**CONTEXTO:**
- Tipo de contas: {accounts}
- Tamanho do portfolio: {portfolio_size}
- Objetivo principal: {goal}

---

## 🎯 PROGRAMA DE ACCOUNT MANAGEMENT

### PARTE 1: SEGMENTAÇÃO DE CONTAS

**Matriz de Segmentação:**

| Tier | Critério | Frequência Contato | Modelo |
|------|----------|-------------------|--------|
| **🏆 Strategic** | >R$100k ARR ou potencial | Semanal | High-touch dedicado |
| **🥈 Growth** | R$30-100k ARR | Quinzenal | High-touch pool |
| **🥉 Core** | R$10-30k ARR | Mensal | Tech-touch + check-ins |
| **📦 Scale** | <R$10k ARR | Automático | Self-service + triggers |

---

### PARTE 2: FRAMEWORK DE HEALTH SCORE

**Componentes do Health Score:**

| Fator | Peso | Métricas |
|-------|------|----------|
| **Uso do Produto** | 30% | DAU/MAU, features usadas, tempo na plataforma |
| **Engajamento** | 25% | Respostas a emails, participação em calls, eventos |
| **Resultados** | 25% | ROI alcançado, KPIs melhorados, metas atingidas |
| **Relacionamento** | 20% | NPS, qualidade do contato, champions identificados |

**Classificação:**
- 🟢 **Healthy (80-100):** Expandir
- 🟡 **At Risk (50-79):** Monitorar
- 🔴 **Critical (<50):** Intervenção urgente

---

### PARTE 3: CADÊNCIA DE ENGAJAMENTO

**Strategic Accounts (Semanal):**

| Semana | Atividade | Objetivo |
|--------|-----------|----------|
| 1 | Check-in call | Status, blockers |
| 2 | Insight sharing | Valor agregado |
| 3 | Stakeholder mapping | Relacionamento |
| 4 | QBR prep/exec | Estratégia |

**Growth Accounts (Quinzenal):**
- Semana 1 e 3: Email de valor + disponibilidade
- Semana 2: Check-in call (30 min)
- Semana 4: Review de métricas

**Core Accounts (Mensal):**
- Automação de check-in
- Call mensal de 20 min
- QBR trimestral

---

### PARTE 4: QBR - QUARTERLY BUSINESS REVIEW

**Estrutura do QBR (60 min):**

\`\`\`
ABERTURA (5 min)
├── Agenda e objetivos
└── Participantes e papéis

RETROSPECTIVA (15 min)
├── Métricas do trimestre vs metas
├── Wins e cases de sucesso
├── Desafios enfrentados
└── Feedback coletado

VALOR ENTREGUE (10 min)
├── ROI calculado
├── Tempo/dinheiro economizado
└── Comparativo com antes

ROADMAP (15 min)
├── Novidades relevantes
├── Features que atendem suas dores
└── Timeline de lançamentos

PRÓXIMO TRIMESTRE (10 min)
├── Objetivos do cliente
├── Como podemos ajudar
├── Oportunidades de expansão
└── Action items

FECHAMENTO (5 min)
├── Resumo dos próximos passos
├── Agendamento próximo QBR
└── Feedback sobre a sessão
\`\`\`

---

### PARTE 5: EXPANSION PLAYS

**Play 1: Novo Departamento**
\`\`\`
Trigger: Descoberta de área não atendida
Ação: Intro call com novo stakeholder
Script: "Percebi que [área] também poderia
se beneficiar. Posso apresentar para eles?"
\`\`\`

**Play 2: Upgrade de Tier**
\`\`\`
Trigger: Uso próximo do limite
Ação: Mostrar valor do tier superior
Script: "Com o crescimento de vocês, o plano
[superior] desbloquearia [benefícios]..."
\`\`\`

**Play 3: Add-on**
\`\`\`
Trigger: Feature request recorrente
Ação: Demo do add-on específico
Script: "Lembra que você pediu [feature]?
Temos exatamente isso como add-on..."
\`\`\`

---

### PARTE 6: GESTÃO DE RISCOS

**Sinais de Churn:**

| Sinal | Severidade | Ação Imediata |
|-------|-----------|---------------|
| Uso caiu >30% | 🔴 Alta | Call urgente |
| Champion saiu | 🔴 Alta | Mapear novo sponsor |
| Não responde há 30 dias | 🟠 Média | Escalação + campanha |
| NPS caiu | 🟠 Média | Discovery da causa |
| Ticket de cancelamento | 🔴 Crítica | Save call em 24h |

**Playbook de Save:**
1. **Entender:** O que motivou o pedido?
2. **Empatizar:** Validar a frustração
3. **Resolver:** Propor solução específica
4. **Negociar:** Pausa, desconto, suporte extra
5. **Documentar:** Lições aprendidas

---

### PARTE 7: MÉTRICAS DO AM

| Métrica | Fórmula | Meta |
|---------|---------|------|
| **NRR** | MRR final ÷ MRR inicial | >115% |
| **Gross Retention** | MRR sem churn ÷ MRR inicial | >90% |
| **Logo Retention** | Clientes retidos ÷ Total | >95% |
| **NPS do Portfolio** | Score médio | >50 |
| **Health Score Médio** | Média do portfolio | >75 |
| **Expansion Rate** | % clientes que expandiram | >30%/ano |`,
      variables: [
        { name: 'accounts', label: 'Tipo de Contas', placeholder: 'Ex: Enterprise B2B, 1000+ funcionários, tech/varejo', type: 'textarea', required: true },
        { name: 'portfolio_size', label: 'Tamanho do Portfolio', placeholder: 'Ex: 25 contas por AM, R$ 2M ARR', type: 'text', required: true },
        { name: 'goal', label: 'Objetivo Principal', placeholder: 'Ex: Net Revenue Retention de 120%', type: 'text', required: true }
      ],
      examples: [
        { title: 'Enterprise SaaS', input: { accounts: 'Empresas Fortune 500', portfolio_size: '15 contas, R$ 5M ARR', goal: 'NRR 125%, zero churn' }, output: 'Estratégia de account management gerada' }
      ],
      tags: ['account management', 'retenção', 'expansão', 'customer success', 'qbr'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'sm-sales-compensation',
      categoryId: 'sales-marketing',
      title: 'Plano de Compensação de Vendas',
      description: 'Estruture comissões que motivam e retêm',
      template: `Crie um plano de compensação para o time de vendas:

**CONTEXTO:**
- Estrutura do time: {team_structure}
- Ticket médio: {ticket}
- Ciclo de vendas: {sales_cycle}
- Meta mensal por rep: {quota}

---

## 💰 PLANO DE COMPENSAÇÃO DE VENDAS

### PARTE 1: ESTRUTURA BASE

**On-Target Earnings (OTE):**

| Função | Salário Base | Variável | OTE Total | Mix |
|--------|-------------|----------|-----------|-----|
| SDR | R$ X | R$ Y | R$ Z | 70/30 |
| AE Jr | R$ X | R$ Y | R$ Z | 60/40 |
| AE Sr | R$ X | R$ Y | R$ Z | 50/50 |
| Closer | R$ X | R$ Y | R$ Z | 40/60 |

**Princípios:**
- Base: Suficiente para viver sem stress
- Variável: Motivador significativo
- OTE: Competitivo com mercado

---

### PARTE 2: MODELO DE COMISSÃO

**Para SDRs (Geração de Pipeline):**

| Métrica | Valor | Bônus |
|---------|-------|-------|
| Meeting qualificada | R$ XX | - |
| Meeting que vira SQL | R$ XX | +50% |
| SQL que fecha | R$ XX | +100% |

**Aceleradores SDR:**
- 100-120% da meta: 1.2x multiplicador
- 120%+: 1.5x multiplicador

---

**Para AEs (Fechamento):**

| Faixa de Atingimento | Comissão |
|---------------------|----------|
| 0-50% | 0% (sem comissão) |
| 50-80% | 5% do valor fechado |
| 80-100% | 8% do valor fechado |
| 100-120% | 10% do valor fechado |
| 120%+ | 12% do valor fechado |

**Exemplo com quota {quota}:**
\`\`\`
Se fechar 120% da quota ({quota} x 1.2):

Faixa 50-80%: R$ XX × 5% = R$ X
Faixa 80-100%: R$ XX × 8% = R$ X
Faixa 100-120%: R$ XX × 10% = R$ X

TOTAL COMISSÃO: R$ XXXX
\`\`\`

---

### PARTE 3: BONIFICAÇÕES ESPECIAIS

**SPIFs (Sales Performance Incentive Funds):**

| Tipo | Gatilho | Bônus |
|------|---------|-------|
| Produto novo | Primeira venda | R$ XXX |
| Multi-year | Contrato 2+ anos | +15% comissão |
| Upfront | Pagamento anual | +10% comissão |
| Velocidade | Fechamento em <15 dias | +20% comissão |
| Referral | Indicação que fecha | R$ XXX |

**Bônus de Time:**
- Time bate meta coletiva: +R$ XXX por pessoa
- Trimestre sem churn: Bônus adicional

---

### PARTE 4: REGRAS E POLÍTICAS

**Elegibilidade:**
- Comissão paga sobre deals próprios
- Split em vendas colaborativas (definir %)
- Período de cliff: 3 meses (sem comissão)

**Claw-back:**
- Churn em <3 meses: 100% devolvido
- Churn em 3-6 meses: 50% devolvido
- Churn em 6-12 meses: 25% devolvido

**Pagamento:**
- Fechamento: Mês seguinte ao contrato
- Recorrência: Pago no primeiro pagamento
- Multi-year: Pago no primeiro ano

---

### PARTE 5: DEFINIÇÃO DE QUOTA

**Metodologia de Quota:**

\`\`\`
CÁLCULO TOP-DOWN:
Meta da empresa:          R$ X.XXX.XXX
÷ Número de AEs:          Y
= Quota base:             R$ XXX.XXX

AJUSTE POR TERRITÓRIO:
Potencial alto:           +20%
Potencial médio:          Base
Potencial baixo:          -20%

AJUSTE POR SENIORIDADE:
AE Sr (>2 anos):          +15%
AE Mid (1-2 anos):        Base
AE Jr (<1 ano):           -25% (ramp)
\`\`\`

**Ramp para Novos Reps:**
| Mês | % da Quota | Expectativa |
|-----|-----------|-------------|
| 1 | 0% | Onboarding |
| 2 | 25% | Primeiras calls |
| 3 | 50% | Primeiros deals |
| 4 | 75% | Rampando |
| 5+ | 100% | Full productivity |

---

### PARTE 6: DASHBOARD DE PERFORMANCE

**Métricas Individuais:**

| Métrica | Como Medir | Visibilidade |
|---------|-----------|--------------|
| Atingimento vs Quota | Pipeline / Quota | Tempo real |
| Comissão projetada | Deals ponderados | Semanal |
| Ranking do time | vs peers | Semanal |
| Pace vs meta | Tendência | Diária |

**Leaderboard:**
\`\`\`
🥇 [Nome] - 145% - R$ XXXX comissão
🥈 [Nome] - 132% - R$ XXXX comissão
🥉 [Nome] - 118% - R$ XXXX comissão
...
\`\`\`

---

### PARTE 7: REVISÃO ANUAL

**Checklist de Revisão:**
- [ ] Comp está competitivo com mercado?
- [ ] OTE médio atingido pelo time?
- [ ] Turnover está controlado?
- [ ] Comportamentos corretos incentivados?
- [ ] Alinhado com objetivos da empresa?

**Ajustes Comuns:**
- Quotas baseadas em dados históricos
- Aceleradores para produtos prioritários
- SPIFs para comportamentos específicos`,
      variables: [
        { name: 'team_structure', label: 'Estrutura do Time', placeholder: 'Ex: 3 SDRs, 5 AEs, 1 Sales Manager', type: 'textarea', required: true },
        { name: 'ticket', label: 'Ticket Médio', placeholder: 'Ex: R$ 20.000 ACV', type: 'text', required: true },
        { name: 'sales_cycle', label: 'Ciclo de Vendas', placeholder: 'Ex: 45 dias médio', type: 'text', required: true },
        { name: 'quota', label: 'Meta Mensal por Rep', placeholder: 'Ex: R$ 100.000 new ARR', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS B2B', input: { team_structure: '2 SDRs + 4 AEs + 1 Manager', ticket: 'R$ 30.000 ACV', sales_cycle: '60 dias', quota: 'R$ 150.000/mês' }, output: 'Plano de compensação gerado' }
      ],
      tags: ['compensação', 'comissão', 'vendas', 'incentivo', 'quota'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'sm-sales-forecast',
      categoryId: 'sales-marketing',
      title: 'Modelo de Forecast de Vendas',
      description: 'Previsões precisas para planejamento',
      template: `Crie um modelo de forecast de vendas:

**CONTEXTO:**
- Modelo de negócio: {business_model}
- Histórico: {historical_data}
- Objetivo do forecast: {forecast_goal}

---

## 📊 MODELO DE FORECAST DE VENDAS

### PARTE 1: METODOLOGIAS DE FORECAST

**Método 1: Bottom-Up (Pipeline)**

\`\`\`
FÓRMULA:
Forecast = Σ (Valor do Deal × Probabilidade)

EXEMPLO:
| Deal | Valor | Estágio | Prob | Ponderado |
|------|-------|---------|------|-----------|
| A | R$ 50k | Proposta | 60% | R$ 30k |
| B | R$ 30k | Demo | 40% | R$ 12k |
| C | R$ 80k | Negociação | 80% | R$ 64k |
| D | R$ 25k | Discovery | 25% | R$ 6.2k |

FORECAST PONDERADO: R$ 112.2k
\`\`\`

---

**Método 2: Top-Down (Histórico)**

\`\`\`
FÓRMULA:
Forecast = Resultado Mês Anterior × (1 + Taxa Crescimento)

AJUSTES:
+ Sazonalidade do mês
+ Campanhas planejadas
- Feriados/dias úteis
± Mudanças no time
\`\`\`

---

**Método 3: Por Rep (Commit)**

\`\`\`
Cada rep classifica seus deals:

COMMIT: 90%+ de fechar este mês
BEST CASE: 50-90% de fechar
PIPELINE: Possível mas incerto

CÁLCULO:
Forecast = (Commit × 1.0) + (Best Case × 0.5) + (Pipeline × 0.2)
\`\`\`

---

### PARTE 2: CATEGORIAS DE FORECAST

**Níveis de Confiança:**

| Categoria | Critério | Multiplicador |
|-----------|----------|---------------|
| **Commit** | Verbal "sim", contrato em revisão | 90% |
| **Strong Upside** | Campeão ativo, budget confirmado | 70% |
| **Upside** | Demo feita, interesse claro | 50% |
| **Pipeline** | Qualificado, em discussão | 30% |
| **Early Stage** | Conectado, descobrindo | 10% |

---

### PARTE 3: TEMPLATE DE FORECAST SEMANAL

**Report Semanal:**

\`\`\`
FORECAST SEMANA [X] - [MÊS]

📊 RESUMO
---------
Meta do mês:              R$ XXX.XXX
Fechado até agora:        R$ XXX.XXX (XX%)
Commit:                   R$ XXX.XXX
Best Case:                R$ XXX.XXX
Forecast ponderado:       R$ XXX.XXX
Gap vs meta:              R$ XXX.XXX

📈 TENDÊNCIA
-----------
Semana passada:           R$ XXX.XXX
Esta semana:              R$ XXX.XXX (+/- X%)
Direção:                  🔼 / 🔽

🎯 TOP 5 DEALS PARA FECHAR
--------------------------
1. [Cliente A] - R$ XXk - [Próximo passo]
2. [Cliente B] - R$ XXk - [Próximo passo]
3. [Cliente C] - R$ XXk - [Próximo passo]
4. [Cliente D] - R$ XXk - [Próximo passo]
5. [Cliente E] - R$ XXk - [Próximo passo]

⚠️ RISCOS
---------
• [Deal X slipping - motivo]
• [Deal Y em risco - motivo]

✅ AÇÕES ESTA SEMANA
-------------------
• [Ação 1]
• [Ação 2]
• [Ação 3]
\`\`\`

---

### PARTE 4: ANÁLISE DE ACURACIDADE

**Métricas de Precisão:**

| Métrica | Fórmula | Meta |
|---------|---------|------|
| Accuracy | Resultado ÷ Forecast | 90-110% |
| Bias | (Forecast - Resultado) ÷ Resultado | ±10% |
| Volatilidade | Desvio padrão do forecast semanal | <15% |

**Tracking por Rep:**

| Rep | Forecast | Resultado | Accuracy | Tendência |
|-----|----------|-----------|----------|-----------|
| João | R$ 100k | R$ 95k | 95% | Realista |
| Maria | R$ 80k | R$ 110k | 138% | Conservador |
| Pedro | R$ 120k | R$ 70k | 58% | Otimista |

---

### PARTE 5: SAZONALIDADE E AJUSTES

**Padrões Sazonais:**

| Mês | Fator | Motivo |
|-----|-------|--------|
| Janeiro | 0.7x | Volta de férias |
| Fevereiro | 0.9x | Carnaval |
| Março | 1.0x | Normal |
| Abril | 1.0x | Normal |
| Maio | 0.95x | Feriados |
| Junho | 1.1x | Fechamento Q2 |
| Julho | 0.85x | Férias |
| Agosto | 0.9x | Férias |
| Setembro | 1.1x | Retomada |
| Outubro | 1.0x | Normal |
| Novembro | 1.15x | Budget season |
| Dezembro | 1.2x | Fechamento ano |

---

### PARTE 6: FORECAST DE LONGO PRAZO

**Projeção Trimestral:**

\`\`\`
Q[X] FORECAST

Histórico:
- Q anterior: R$ X.XXX.XXX
- Mesmo Q ano passado: R$ X.XXX.XXX
- Crescimento YoY: XX%

Inputs:
- Pipeline atual: R$ X.XXX.XXX
- Conversão histórica: XX%
- Reps ativos: X
- Novos reps (ramp): X

Cenários:
- Conservador: R$ X.XXX.XXX (80% confiança)
- Base: R$ X.XXX.XXX (50% confiança)
- Otimista: R$ X.XXX.XXX (20% confiança)
\`\`\`

---

### PARTE 7: DASHBOARD DE FORECAST

**Visualizações Essenciais:**

1. **Pipeline Waterfall**
   - Início do mês → Ganhos → Perdas → Novos → Atual

2. **Forecast vs Meta (trend)**
   - Linha de meta
   - Linha de forecast por semana
   - Área de fechados acumulado

3. **Heat Map por Rep**
   - Verde: On track
   - Amarelo: Risco
   - Vermelho: Crítico

4. **Distribuição por Estágio**
   - Quantos deals em cada etapa
   - Valor total por etapa`,
      variables: [
        { name: 'business_model', label: 'Modelo de Negócio', placeholder: 'Ex: SaaS B2B, vendas recorrentes, ticket médio R$ 20k ACV', type: 'textarea', required: true },
        { name: 'historical_data', label: 'Dados Históricos', placeholder: 'Ex: 2 anos de dados, média R$ 500k/mês, ciclo 45 dias', type: 'textarea', required: true },
        { name: 'forecast_goal', label: 'Objetivo do Forecast', placeholder: 'Ex: Planejamento de contratações, previsão de caixa, report para investidores', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS Growth', input: { business_model: 'PLG + Sales, ARR R$ 5M', historical_data: '18 meses, 30% crescimento MoM', forecast_goal: 'Série A fundraising' }, output: 'Modelo de forecast gerado' }
      ],
      tags: ['forecast', 'previsão', 'vendas', 'planejamento', 'pipeline'],
      difficulty: 'advanced',
      isPremium: true
    },
    {
      id: 'sm-partner-sales',
      categoryId: 'sales-marketing',
      title: 'Programa de Vendas por Parceiros',
      description: 'Escale vendas através de canais parceiros',
      template: `Crie um programa de vendas por parceiros:

**CONTEXTO:**
- Produto: {product}
- Tipo de parceiros desejados: {partner_type}
- Modelo de partnership: {model}

---

## 🤝 PROGRAMA DE CHANNEL PARTNERS

### PARTE 1: ESTRATÉGIA DE PARCEIROS

**Por que Parceiros?**
- [ ] Alcançar mercados inacessíveis
- [ ] Reduzir CAC
- [ ] Acelerar crescimento
- [ ] Adicionar expertise local/vertical
- [ ] Competir com players maiores

**Tipos de Parceiros:**

| Tipo | Perfil | Valor para Nós | Valor para Eles |
|------|--------|----------------|-----------------|
| **Referral** | Indica leads | Leads qualificados | Comissão |
| **Reseller** | Vende nosso produto | Receita | Margem |
| **VAR** | Vende + implementa | Receita + serviços | Margem + serviços |
| **OEM** | Embarca no produto deles | Escala | Funcionalidade |
| **SI** | Implementa projetos | Serviços vendidos | Projetos maiores |

---

### PARTE 2: PERFIL DE PARCEIRO IDEAL

**ICP de Parceiros:**

| Critério | Ideal | Mínimo |
|----------|-------|--------|
| Tamanho | X clientes | Y clientes |
| Setor | [Setores alvo] | [Setores ok] |
| Capacidade | [Skills necessárias] | [Básico] |
| Reputação | Top do mercado | Boa |
| Modelo | Complementar | Compatível |

**Red Flags:**
- ❌ Vende para competidores
- ❌ Conflito de interesse
- ❌ Reputação questionável
- ❌ Instabilidade financeira

---

### PARTE 3: ESTRUTURA DE COMPENSAÇÃO

**Modelo de Comissões:**

| Tier | Requisitos | Comissão | Benefícios |
|------|-----------|----------|------------|
| **🥉 Bronze** | Cadastrado | 10% | Portal, materiais |
| **🥈 Silver** | 3+ deals/ano | 15% | + Leads, suporte |
| **🥇 Gold** | 10+ deals/ano | 20% | + MDF, eventos |
| **💎 Platinum** | 25+ deals/ano | 25% | + Exclusividade, co-marketing |

**Estrutura de Deal:**
\`\`\`
Referral puro:        10-15% one-time
Resale:               20-30% da venda
Co-sell:              5-10% (nós fechamos)
Serviços:             Parceiro fica com 100%
\`\`\`

---

### PARTE 4: ONBOARDING DE PARCEIROS

**Programa de 30 Dias:**

\`\`\`
SEMANA 1: FOUNDATIONS
├── Dia 1: Welcome call + acesso portal
├── Dia 2-3: Training de produto (online)
├── Dia 4: Training de vendas
└── Dia 5: Certificação básica

SEMANA 2: PRÁTICA
├── Shadowing de 2 demos nossas
├── Role-play de pitch
├── Simulação de objeções
└── Primeiro deal conjunto

SEMANA 3: AUTONOMIA
├── Primeiro deal solo (com suporte)
├── Review do deal
├── Ajustes de abordagem
└── Certificação completa

SEMANA 4: ATIVAÇÃO
├── Meta de atividade definida
├── Primeiros leads enviados
├── Check-in semanal estabelecido
└── Plano de 90 dias acordado
\`\`\`

---

### PARTE 5: ENABLEMENT DE PARCEIROS

**Kit de Materiais:**

| Material | Descrição | Acesso |
|----------|-----------|--------|
| Pitch Deck | Apresentação marca branca | Bronze+ |
| Battle Cards | Competidores + objeções | Silver+ |
| Demo Environment | Ambiente de demo | Silver+ |
| Case Studies | Cases por vertical | Bronze+ |
| ROI Calculator | Calculadora de valor | Bronze+ |
| Proposta Template | Template customizável | Gold+ |

**Portal de Parceiros:**
- Dashboard de performance
- Pipeline compartilhado
- Materiais de marketing
- Registro de deals
- Treinamentos on-demand
- Suporte dedicado

---

### PARTE 6: DEAL REGISTRATION

**Processo:**

\`\`\`
1. REGISTRO
   Parceiro registra deal no portal
   Campos: Empresa, contato, valor estimado, timeline

2. VALIDAÇÃO (24h)
   - Verificamos se não é deal existente
   - Confirmamos ou rejeitamos

3. PROTEÇÃO
   - Deal registrado = proteção 90 dias
   - Exclusividade para o parceiro

4. ACOMPANHAMENTO
   - Updates mensais obrigatórios
   - Suporte de vendas disponível
   - Extensão se necessário

5. FECHAMENTO
   - Parceiro fecha ou passa para nós
   - Comissão paga em 30 dias
\`\`\`

---

### PARTE 7: MÉTRICAS DO PROGRAMA

**KPIs de Parceiros:**

| Métrica | Fórmula | Meta |
|---------|---------|------|
| **Partner Revenue** | Receita via parceiros | 30% do total |
| **Active Partners** | Parceiros com deal no quarter | 50%+ |
| **Partner CAC** | Custo por deal de parceiro | 50% do direto |
| **Deal Velocity** | Ciclo de deals de parceiro | ≤ direto |
| **Win Rate** | Deals ganhos ÷ registrados | 25%+ |

**Scorecard por Parceiro:**

| Parceiro | Deals | Revenue | Pipeline | Health |
|----------|-------|---------|----------|--------|
| Parceiro A | 5 | R$ 250k | R$ 500k | 🟢 |
| Parceiro B | 2 | R$ 80k | R$ 200k | 🟡 |
| Parceiro C | 0 | R$ 0 | R$ 50k | 🔴 |

---

### PARTE 8: GOVERNANÇA

**Regras de Engajamento:**

| Situação | Regra |
|----------|-------|
| Parceiro e direto no mesmo lead | Quem registrou primeiro |
| Dois parceiros no mesmo lead | Primeiro registro |
| Lead nosso, parceiro quer | Passar via deal registration |
| Parceiro inativo 6 meses | Downgrade de tier |
| Conflito | Partner Manager decide |

**QBR com Parceiros:**
1. Review de performance
2. Pipeline conjunto
3. Planejamento próximo quarter
4. Feedback bidirecional
5. Ações de melhoria`,
      variables: [
        { name: 'product', label: 'Produto', placeholder: 'Ex: Software de gestão para e-commerce', type: 'text', required: true },
        { name: 'partner_type', label: 'Tipo de Parceiros', placeholder: 'Ex: Agências de marketing digital, consultorias de e-commerce, integradores', type: 'textarea', required: true },
        { name: 'model', label: 'Modelo de Partnership', placeholder: 'Ex: Referral (10%) + Resale (25%) + Co-sell', type: 'text', required: true }
      ],
      examples: [
        { title: 'SaaS + SI', input: { product: 'ERP em nuvem', partner_type: 'System Integrators, consultorias de gestão', model: 'Resale 30% + Serviços 100% para parceiro' }, output: 'Programa de parceiros gerado' }
      ],
      tags: ['parceiros', 'channel', 'vendas indiretas', 'reseller', 'programa'],
      difficulty: 'advanced',
      isPremium: true
    }
  ]
};
