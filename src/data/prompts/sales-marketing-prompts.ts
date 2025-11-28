import { PromptCategory } from '../../types/prompt';

export const salesMarketingPromptsCategory: PromptCategory = {
  id: 'sales-marketing',
  name: 'Marketing e Vendas',
  description: 'Prompts para automação, qualificação de leads, SDR, pipeline e métricas',
  icon: 'TrendingUp',
  color: 'bg-rose-500',
  isPopular: true,
  prompts: [
    {
      id: 'sm-sales-pipeline',
      categoryId: 'sales-marketing',
      title: 'Estrutura de Pipeline de Vendas',
      description: 'Monte pipeline de vendas completo e previsível',
      template: `Crie estrutura de pipeline de vendas para:

Produto/Serviço: {product}
Ticket médio: {avg_ticket}
Ciclo de venda atual: {sales_cycle}
Time de vendas: {team_size}
Meta mensal: {monthly_goal}

**PIPELINE DE VENDAS ESTRUTURADO:**

**1. DEFINIÇÃO DE ESTÁGIOS**

**Estágio 1: Lead (MQL - Marketing Qualified Lead)**
- Critério de entrada: [definir]
- Ações: Captura, primeira nutrição
- Tempo médio: [X] dias
- Taxa de conversão esperada: [%]
- Responsável: Marketing

**Estágio 2: Lead Qualificado (SQL - Sales Qualified Lead)**
- Critério: BANT qualificado
  * Budget: Tem orçamento de R$ [valor mínimo]
  * Authority: É tomador de decisão / influenciador
  * Need: Tem necessidade clara
  * Timeline: Vai comprar em [prazo]
- Ações: SDR qualifica e agenda demo
- Tempo médio: [X] dias
- Taxa conversão Lead→SQL: [%]
- Responsável: SDR

**Estágio 3: Oportunidade (Demo Agendada)**
- Critério: Demo confirmada
- Ações: Preparação para demo, pesquisa sobre empresa
- Tempo médio: [X] dias
- Taxa conversão SQL→Oportunidade: [%]
- Responsável: SDR / AE

**Estágio 4: Demo Realizada**
- Critério: Demo feita, follow-up enviado
- Ações: Enviar proposta, trial (se aplicável)
- Tempo médio: [X] dias
- Taxa conversão: [%]
- Responsável: AE (Account Executive)

**Estágio 5: Proposta Enviada**
- Critério: Proposta comercial formalizada
- Ações: Follow-ups, negociação
- Tempo médio: [X] dias
- Taxa conversão: [%]
- Responsável: AE

**Estágio 6: Negociação**
- Critério: Cliente está analisando, pode ter objeções
- Ações: Responder objeções, ajustar proposta
- Tempo médio: [X] dias
- Taxa conversão: [%]
- Responsável: AE / Closer

**Estágio 7: Fechado-Ganho 🎉**
- Critério: Contrato assinado, primeiro pagamento
- Ações: Onboarding, CS (Customer Success)
- Responsável: CS

**Estágio 8: Fechado-Perdido ❌**
- Motivos de perda: [rastrear]
- Ações: Nutrir para futuro, feedback

**2. MÉTRICAS POR ESTÁGIO**

| Estágio | Volume | Conv % | Tempo | Velocidade |
|---------|--------|--------|-------|------------|
| Leads | [X] | - | - | - |
| SQL | [X] | [%] | [dias] | [leads/dia] |
| Oportunidade | [X] | [%] | [dias] | - |
| Demo | [X] | [%] | [dias] | - |
| Proposta | [X] | [%] | [dias] | - |
| Negociação | [X] | [%] | [dias] | - |
| Fechado | [X] | [%] | [dias] | - |

**Taxa conversão geral:** Lead → Cliente = [%]
**Ciclo de venda médio:** [X] dias

**3. CÁLCULO REVERSO (Para bater meta)**

Meta mensal: R$ {monthly_goal}
Ticket médio: R$ {avg_ticket}
Clientes necessários: [calcular]

**Trabalhando de trás para frente:**

- Precisamos de [X] Fechados
- Logo, [X] em Negociação (conv [%])
- Logo, [X] Propostas (conv [%])
- Logo, [X] Demos (conv [%])
- Logo, [X] Oportunidades (conv [%])
- Logo, [X] SQLs (conv [%])
- Logo, [X] Leads no topo do funil

**Leads necessários por dia:** [calcular]
**SQLs necessários por dia:** [calcular]
**Demos necessárias por semana:** [calcular]

**4. PLAYBOOK DE VENDAS**

**Para SDRs:**

Cadência de prospecção (outbound):
- Dia 1: Cold call + email inicial
- Dia 2: LinkedIn message
- Dia 4: Email follow-up + call
- Dia 7: Email value-add + call
- Dia 10: Break-up email + call
- Dia 14: Re-engagement

Scripts:
- Cold call: [criar script]
- Voicemail: [criar script]
- Email templates: [criar 5 templates]

Critérios de qualificação (BANT):
- [perguntas específicas para cada letra]

**Para AEs (Account Executives):**

Preparação para demo:
- [ ] Pesquisar empresa (LinkedIn, site)
- [ ] Identificar dores prováveis
- [ ] Preparar perguntas de descoberta
- [ ] Personalizar demo

Durante demo (60 min):
- 0-10 min: Rapport + descoberta
- 10-40 min: Demo focada nas dores
- 40-55 min: Próximos passos
- 55-60 min: Agendar follow-up

Follow-up pós-demo:
- Dentro de 2h: Email recap
- Dia seguinte: LinkedIn connection
- Dia 3: Enviar conteúdo relevante
- Dia 7: Call de check-in

Tratamento de objeções:
- "Muito caro": [resposta/framework]
- "Preciso pensar": [resposta/framework]
- "Vou consultar": [resposta/framework]
- "Não é prioridade": [resposta/framework]

**5. AUTOMAÇÃO DO PIPELINE**

CRM: [Recomendação: HubSpot/Pipedrive/RD Station]

Automações a configurar:

1. **Lead entra no CRM**
   - Tag automática por fonte
   - Atribuir a SDR (round-robin)
   - Task: "Qualificar em 24h"

2. **SQL criado**
   - Notificar AE
   - Enviar email automático
   - Criar task: "Agendar demo"

3. **Demo realizada**
   - Atualizar estágio
   - Task: "Enviar follow-up"
   - Criar proposta (template)

4. **Proposta enviada**
   - Sequência de follow-up (3x)
   - Alertar se 7 dias sem resposta

5. **Deal estagnado**
   - Alert se > [X] dias sem atualização
   - Sugerir ação: call, email, ou qualificar como perdido

**6. REUNIÕES E CADÊNCIA**

**Daily Standup** (15 min) - 9h
- Cada rep: Fez ontem, fará hoje, blockers
- Revisar deals urgentes

**Reunião Pipeline** (1h) - Segunda
- Revisar cada deal em negociação
- Discutir estratégias
- Identificar riscos

**1-on-1 Manager-Rep** (30 min) - Semanal
- Performance individual
- Coaching
- Remover blockers

**Revisão Mensal** (2h)
- Atingimento de meta
- Análise de perdas
- Ajustes de processo

**7. INDICADORES-CHAVE (KPIs)**

**Para o time:**
- Meta de receita: R$ [valor]
- ARR/MRR: R$ [valor]
- Novos clientes: [qtd]
- Churn: [%]

**Por rep:**
- Atividades/dia:
  * Calls: [qtd]
  * Emails: [qtd]
  * Demos: [qtd]
- Conversões:
  * Lead → SQL: [%]
  * SQL → Oportunidade: [%]
  * Oportunidade → Fechado: [%]
- Receita fechada: R$ [valor]
- Ticket médio: R$ [valor]

**Métricas avançadas:**
- Velocidade do pipeline: R$ [valor/dia]
- Tempo médio por estágio
- Win rate por fonte de lead
- CAC por canal

**8. REMUNERAÇÃO E METAS**

**Estrutura sugerida:**

SDR:
- Salário fixo: R$ [valor]
- Comissão: R$ [valor] por SQL qualificado
- Bônus: [X]% se atingir [meta]
- Meta: [X] SQLs/mês

AE:
- Salário fixo: R$ [valor]
- Comissão: [X]% da receita fechada
- Acelerador: [X+Y]% acima de [%] da meta
- Meta: R$ [valor] ou [qtd] deals/mês

**9. FERRAMENTAS E STACK**

CRM: [recomendação]
Automação de email: [recomendação]
Cold calling: [recomendação]
Enrichment: [recomendação]
Analytics: [recomendação]

Custo total: R$ [valor]/mês

**10. PLANO DE IMPLEMENTAÇÃO**

**Semana 1:**
- [ ] Definir estágios no CRM
- [ ] Criar campos customizados
- [ ] Configurar automações básicas

**Semana 2:**
- [ ] Treinar time nos estágios
- [ ] Criar playbooks
- [ ] Implementar reuniões

**Semana 3:**
- [ ] Migrar deals existentes
- [ ] Começar tracking de métricas
- [ ] Ajustes finos

**Semana 4:**
- [ ] Primeira revisão de pipeline
- [ ] Feedback do time
- [ ] Otimizações

**Mes 2+:**
- Refinar conversões
- Otimizar automações
- Escalar o que funciona`,
      variables: [
        {
          name: 'product',
          label: 'Produto/Serviço',
          placeholder: 'Ex: Software de gestão de RH',
          type: 'text',
          required: true
        },
        {
          name: 'avg_ticket',
          label: 'Ticket médio',
          placeholder: 'Ex: 5000',
          type: 'text',
          required: true
        },
        {
          name: 'sales_cycle',
          label: 'Ciclo de venda atual (dias)',
          placeholder: 'Ex: 30',
          type: 'text',
          required: true
        },
        {
          name: 'team_size',
          label: 'Tamanho do time',
          placeholder: 'Ex: 2 SDRs, 3 AEs',
          type: 'text',
          required: true
        },
        {
          name: 'monthly_goal',
          label: 'Meta mensal de receita',
          placeholder: 'Ex: 100000',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['pipeline', 'vendas', 'crm', 'gestão', 'métricas', 'funil'],
      difficulty: 'advanced',
      isPremium: true,
      isFeatured: true,
      usageCount: 0
    }
    // ... mais 29 prompts de vendas e marketing
  ]
};
