/**
 * PACK 4 - PROMPTS PREMIUM
 * 30 prompts: 15 Vendas + 15 Redes Sociais
 */

import { Prompt } from '@/types/prompt';

// ============================================
// VENDAS - 15 PROMPTS PREMIUM
// ============================================

export const vendasPremiumPrompts: Prompt[] = [
  {
    id: 'vendas-premium-1',
    categoryId: 'vendas',
    title: 'Script de Vendas Consultivas',
    description: 'Roteiro completo para vendas consultivas B2B',
    template: `Crie um script completo de vendas consultivas para {produto}.

CONTEXTO:
- Ticket médio: {ticket}
- Ciclo de vendas: {ciclo}
- Principal objeção: {objecao}

ESTRUTURA DO SCRIPT:

**1. ABERTURA (2 min)**
- Quebra-gelo personalizada
- Validação de agenda
- Estabelecimento de rapport

**2. DESCOBERTA (15 min)**
- 5 perguntas de situação
- 5 perguntas de problema
- 3 perguntas de implicação
- 2 perguntas de necessidade-solução

**3. APRESENTAÇÃO (10 min)**
- Conexão problema-solução
- 3 casos de sucesso relevantes
- Demonstração de valor quantificável

**4. PROPOSTA (5 min)**
- Ancoragem de preço
- 3 opções de pacote
- Urgência genuína

**5. OBJEÇÕES**
- Mapeie as 5 objeções mais comuns
- Scripts de resposta para cada
- Técnicas de reversão

**6. FECHAMENTO**
- 3 técnicas de fechamento
- Próximos passos claros
- Follow-up estruturado

Inclua variações para diferentes perfis de decisor.`,
    variables: [
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: Software de gestão', type: 'text', required: true },
      { name: 'ticket', label: 'Ticket médio', placeholder: 'Ex: R$ 5.000/mês', type: 'text', required: true },
      { name: 'ciclo', label: 'Ciclo de vendas', placeholder: 'Ex: 30 dias', type: 'text', required: true },
      { name: 'objecao', label: 'Principal objeção', placeholder: 'Ex: Preço alto', type: 'text', required: true }
    ],
    examples: [],
    tags: ['vendas', 'script', 'consultivo', 'B2B'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true
  },
  {
    id: 'vendas-premium-2',
    categoryId: 'vendas',
    title: 'Proposta Comercial Irresistível',
    description: 'Estrutura de proposta que converte',
    template: `Crie uma proposta comercial irresistível para {cliente}.

CONTEXTO:
- Solução oferecida: {solucao}
- Investimento: {valor}
- Principais dores: {dores}

ESTRUTURA DA PROPOSTA:

**CAPA**
- Título impactante
- Personalização para o cliente

**SUMÁRIO EXECUTIVO (1 página)**
- Situação atual do cliente
- Custo da inação
- Visão do futuro desejado

**DIAGNÓSTICO (2 páginas)**
- Análise da situação
- Gaps identificados
- Oportunidades de melhoria

**SOLUÇÃO PROPOSTA (3 páginas)**
- Metodologia única
- Entregáveis específicos
- Cronograma de implementação
- Equipe envolvida

**RESULTADOS ESPERADOS**
- ROI projetado
- KPIs de sucesso
- Cases similares

**INVESTIMENTO**
- 3 opções de pacote
- Comparativo de valor
- Condições especiais
- Garantias oferecidas

**PRÓXIMOS PASSOS**
- Call to action claro
- Validade da proposta
- Contato direto

Formate de forma profissional e persuasiva.`,
    variables: [
      { name: 'cliente', label: 'Nome do cliente', placeholder: 'Ex: Empresa ABC', type: 'text', required: true },
      { name: 'solucao', label: 'Solução oferecida', placeholder: 'Ex: Consultoria em marketing', type: 'text', required: true },
      { name: 'valor', label: 'Investimento', placeholder: 'Ex: R$ 15.000', type: 'text', required: true },
      { name: 'dores', label: 'Principais dores', placeholder: 'Ex: Baixa conversão, leads frios', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['proposta', 'comercial', 'vendas', 'conversão'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'vendas-premium-3',
    categoryId: 'vendas',
    title: 'Sequência de Follow-up',
    description: '7 touchpoints estratégicos pós-reunião',
    template: `Crie uma sequência de 7 follow-ups pós-reunião para {contexto}.

INFORMAÇÕES:
- Produto/serviço: {produto}
- Valor da proposta: {valor}
- Objeção levantada: {objecao}

SEQUÊNCIA DE 7 TOUCHPOINTS:

**DIA 1 - Email de Recap**
- Resumo da conversa
- Próximos passos acordados
- Material adicional prometido

**DIA 3 - Conteúdo de Valor**
- Case relevante
- Artigo/vídeo educativo
- Sem pedir nada

**DIA 5 - Quebra de Objeção**
- Endereça a objeção principal
- Prova social específica
- Pergunta de engajamento

**DIA 7 - WhatsApp Informal**
- Tom mais pessoal
- Verifica se recebeu materiais
- Oferece esclarecimentos

**DIA 10 - Email de Urgência Suave**
- Novidade ou mudança
- Benefício por decisão rápida
- Sem pressão excessiva

**DIA 14 - Ligação de Valor**
- Insight novo do mercado
- Pergunta sobre timeline
- Identificar bloqueadores

**DIA 21 - Última Chance**
- Recapitulação de valor
- Validade da proposta
- Porta aberta para futuro

Inclua assuntos de email e scripts de ligação.`,
    variables: [
      { name: 'contexto', label: 'Contexto da venda', placeholder: 'Ex: Venda de consultoria', type: 'text', required: true },
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: Mentoria empresarial', type: 'text', required: true },
      { name: 'valor', label: 'Valor da proposta', placeholder: 'Ex: R$ 8.000', type: 'text', required: true },
      { name: 'objecao', label: 'Objeção levantada', placeholder: 'Ex: Preciso pensar', type: 'text', required: true }
    ],
    examples: [],
    tags: ['follow-up', 'vendas', 'prospecção', 'email'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'vendas-premium-4',
    categoryId: 'vendas',
    title: 'Matriz de Objeções',
    description: 'Respostas para as 20 objeções mais comuns',
    template: `Crie uma matriz completa de objeções para {produto}.

CONTEXTO:
- Nicho: {nicho}
- Ticket: {ticket}
- Concorrentes: {concorrentes}

MATRIZ DE 20 OBJEÇÕES:

**CATEGORIA: PREÇO**
1. "Está caro"
2. "Não tenho orçamento agora"
3. "Vi mais barato"
4. "Preciso de desconto"

**CATEGORIA: TEMPO**
5. "Não é o momento"
6. "Estou muito ocupado"
7. "Depois da pandemia/crise"
8. "Ano que vem"

**CATEGORIA: AUTORIDADE**
9. "Preciso falar com sócio/chefe"
10. "A decisão não é minha"
11. "Vou consultar a equipe"

**CATEGORIA: NECESSIDADE**
12. "Não preciso disso"
13. "Já temos algo parecido"
14. "Estamos satisfeitos assim"

**CATEGORIA: CONFIANÇA**
15. "Não conheço a empresa"
16. "Já tive experiência ruim"
17. "Preciso pesquisar mais"

**CATEGORIA: PRIORIDADE**
18. "Tenho outras prioridades"
19. "Talvez no futuro"
20. "Vou pensar"

Para cada objeção:
- Validação empática
- Pergunta de aprofundamento
- Resposta estratégica
- Técnica de reversão
- Exemplo de uso`,
    variables: [
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: Curso online', type: 'text', required: true },
      { name: 'nicho', label: 'Nicho de mercado', placeholder: 'Ex: Empreendedores digitais', type: 'text', required: true },
      { name: 'ticket', label: 'Ticket médio', placeholder: 'Ex: R$ 2.000', type: 'text', required: true },
      { name: 'concorrentes', label: 'Principais concorrentes', placeholder: 'Ex: Empresa X, Empresa Y', type: 'text', required: true }
    ],
    examples: [],
    tags: ['objeções', 'vendas', 'script', 'negociação'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true
  },
  {
    id: 'vendas-premium-5',
    categoryId: 'vendas',
    title: 'Pitch de Elevador',
    description: 'Pitch de 30, 60 e 120 segundos',
    template: `Crie pitches de elevador em 3 durações para {negocio}.

INFORMAÇÕES:
- Público-alvo: {publico}
- Diferencial principal: {diferencial}
- Resultado que entrega: {resultado}

PITCH DE 30 SEGUNDOS:
- Hook de abertura
- Problema que resolve
- Solução em uma frase
- Call to action

PITCH DE 60 SEGUNDOS:
- Hook + estatística impactante
- Problema com dor específica
- Solução com metodologia
- Prova social rápida
- Call to action com próximo passo

PITCH DE 120 SEGUNDOS:
- História de contexto
- Problema detalhado
- Implicações de não resolver
- Solução completa
- 3 benefícios principais
- Case de sucesso
- Diferencial único
- Call to action irresistível

VARIAÇÕES:
- Para investidores
- Para clientes
- Para parceiros
- Para networking

Inclua variações de tom (formal, casual, inspirador).`,
    variables: [
      { name: 'negocio', label: 'Seu negócio', placeholder: 'Ex: Agência de marketing', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Donos de e-commerce', type: 'text', required: true },
      { name: 'diferencial', label: 'Diferencial principal', placeholder: 'Ex: Metodologia própria', type: 'text', required: true },
      { name: 'resultado', label: 'Resultado entregue', placeholder: 'Ex: 3x mais vendas', type: 'text', required: true }
    ],
    examples: [],
    tags: ['pitch', 'vendas', 'apresentação', 'networking'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'vendas-premium-6',
    categoryId: 'vendas',
    title: 'Email de Prospecção Frio',
    description: 'Sequência de 5 emails para cold outreach',
    template: `Crie uma sequência de 5 emails de prospecção fria para {segmento}.

CONTEXTO:
- Produto/serviço: {produto}
- Cargo-alvo: {cargo}
- Dor principal: {dor}

SEQUÊNCIA DE 5 EMAILS:

**EMAIL 1 - O Gatilho**
Assunto: [3 opções de assunto]
- Personalização com pesquisa
- Observação relevante
- Pergunta provocativa
- CTA: responder com 1 palavra

**EMAIL 2 - O Valor (dia 3)**
Assunto: [3 opções]
- Insight de mercado
- Dado surpreendente
- Recurso gratuito
- CTA: acessar conteúdo

**EMAIL 3 - A Prova (dia 6)**
Assunto: [3 opções]
- Case do segmento
- Resultado específico
- Citação de cliente
- CTA: agendar conversa

**EMAIL 4 - A Dor (dia 9)**
Assunto: [3 opções]
- Custo de não agir
- Projeção de perdas
- Competidores avançando
- CTA: 15 min para avaliar

**EMAIL 5 - O Break-up (dia 14)**
Assunto: [3 opções]
- Último contato
- Sem pressão
- Porta aberta
- CTA: sim ou não

Inclua métricas esperadas de abertura e resposta.`,
    variables: [
      { name: 'segmento', label: 'Segmento-alvo', placeholder: 'Ex: SaaS B2B', type: 'text', required: true },
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: Automação de vendas', type: 'text', required: true },
      { name: 'cargo', label: 'Cargo-alvo', placeholder: 'Ex: Diretor comercial', type: 'text', required: true },
      { name: 'dor', label: 'Dor principal', placeholder: 'Ex: Vendedores improdutivos', type: 'text', required: true }
    ],
    examples: [],
    tags: ['email', 'prospecção', 'cold outreach', 'vendas'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'vendas-premium-7',
    categoryId: 'vendas',
    title: 'Script de Qualificação BANT',
    description: 'Perguntas para qualificar leads com BANT',
    template: `Crie um script de qualificação BANT para {produto}.

CONTEXTO:
- Ticket mínimo: {ticket}
- Ciclo ideal: {ciclo}
- ICP: {icp}

ESTRUTURA BANT:

**B - BUDGET (Orçamento)**
5 perguntas para entender:
- Orçamento disponível
- Processo de aprovação
- Histórico de investimentos
- Flexibilidade financeira
- Timeline de budget

**A - AUTHORITY (Autoridade)**
5 perguntas para mapear:
- Decisor final
- Influenciadores
- Processo de decisão
- Stakeholders envolvidos
- Critérios de escolha

**N - NEED (Necessidade)**
5 perguntas para descobrir:
- Dor principal
- Impacto do problema
- Tentativas anteriores
- Urgência da solução
- Expectativas de resultado

**T - TIMELINE (Prazo)**
5 perguntas para alinhar:
- Deadline para decisão
- Eventos gatilho
- Próximos passos
- Implementação desejada
- Prioridades concorrentes

SCORING DE QUALIFICAÇÃO:
- Critérios de pontuação
- Thresholds de avanço
- Red flags de desqualificação
- Próximos passos por score`,
    variables: [
      { name: 'produto', label: 'Produto/Serviço', placeholder: 'Ex: ERP empresarial', type: 'text', required: true },
      { name: 'ticket', label: 'Ticket mínimo', placeholder: 'Ex: R$ 10.000', type: 'text', required: true },
      { name: 'ciclo', label: 'Ciclo de vendas ideal', placeholder: 'Ex: 45 dias', type: 'text', required: true },
      { name: 'icp', label: 'Perfil de cliente ideal', placeholder: 'Ex: Empresas 50-200 funcionários', type: 'text', required: true }
    ],
    examples: [],
    tags: ['qualificação', 'BANT', 'vendas', 'discovery'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'vendas-premium-8',
    categoryId: 'vendas',
    title: 'Apresentação de Vendas',
    description: 'Estrutura de apresentação comercial de 20 slides',
    template: `Crie uma apresentação comercial de 20 slides para {empresa}.

CONTEXTO:
- Solução: {solucao}
- Público da apresentação: {publico}
- Objetivo: {objetivo}

ESTRUTURA DOS 20 SLIDES:

**ABERTURA (Slides 1-3)**
1. Capa impactante com promessa
2. Agenda + expectativas
3. Sobre nós (credenciais rápidas)

**PROBLEMA (Slides 4-7)**
4. O desafio do mercado
5. Dados que comprovam a dor
6. Custo de não resolver
7. A pergunta provocativa

**SOLUÇÃO (Slides 8-12)**
8. A grande ideia
9. Como funciona (visual)
10. Metodologia/processo
11. Diferencial competitivo
12. Resultados possíveis

**PROVA (Slides 13-16)**
13. Case de sucesso 1
14. Case de sucesso 2
15. Depoimentos
16. Números e métricas

**PROPOSTA (Slides 17-19)**
17. O que está incluso
18. Investimento (3 opções)
19. Garantias e bônus

**FECHAMENTO (Slide 20)**
20. Próximos passos + CTA

Para cada slide:
- Título persuasivo
- Bullets de conteúdo
- Sugestão visual
- Nota do apresentador`,
    variables: [
      { name: 'empresa', label: 'Sua empresa', placeholder: 'Ex: TechSolutions', type: 'text', required: true },
      { name: 'solucao', label: 'Solução oferecida', placeholder: 'Ex: Plataforma de automação', type: 'text', required: true },
      { name: 'publico', label: 'Público da apresentação', placeholder: 'Ex: C-Level de varejo', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo da apresentação', placeholder: 'Ex: Fechar contrato anual', type: 'text', required: true }
    ],
    examples: [],
    tags: ['apresentação', 'slides', 'vendas', 'pitch'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'vendas-premium-9',
    categoryId: 'vendas',
    title: 'Mensagens de LinkedIn',
    description: 'Sequência de 4 mensagens para prospecção no LinkedIn',
    template: `Crie uma sequência de 4 mensagens de LinkedIn para {objetivo}.

CONTEXTO:
- Seu cargo: {seu_cargo}
- Cargo-alvo: {cargo_alvo}
- Oferta: {oferta}

SEQUÊNCIA DE 4 MENSAGENS:

**MENSAGEM 1 - Conexão**
[Pedido de conexão]
- Sem vender
- Ponto em comum
- Elogio genuíno
- Interesse no trabalho deles

**MENSAGEM 2 - Valor (após aceitar)**
- Agradecer conexão
- Compartilhar insight
- Fazer pergunta aberta
- Sem anexos ou links

**MENSAGEM 3 - Ponte (3 dias depois)**
- Referência à conversa
- Observação sobre o perfil
- Conteúdo relevante
- Pergunta de engajamento

**MENSAGEM 4 - Proposta (5 dias depois)**
- Contexto da conversa
- Problema que você resolve
- Resultado específico
- Sugestão de conversa
- Easy out (sem pressão)

DICAS DE EXECUÇÃO:
- Melhores horários
- Frequência ideal
- O que evitar
- Como personalizar em escala`,
    variables: [
      { name: 'objetivo', label: 'Objetivo da prospecção', placeholder: 'Ex: Agendar demos', type: 'text', required: true },
      { name: 'seu_cargo', label: 'Seu cargo', placeholder: 'Ex: Fundador', type: 'text', required: true },
      { name: 'cargo_alvo', label: 'Cargo-alvo', placeholder: 'Ex: Head de RH', type: 'text', required: true },
      { name: 'oferta', label: 'Sua oferta', placeholder: 'Ex: Plataforma de recrutamento', type: 'text', required: true }
    ],
    examples: [],
    tags: ['LinkedIn', 'prospecção', 'social selling', 'vendas'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'vendas-premium-10',
    categoryId: 'vendas',
    title: 'Script de Upsell',
    description: 'Roteiro para aumentar ticket de clientes existentes',
    template: `Crie um script de upsell para {produto_upgrade}.

CONTEXTO:
- Produto atual do cliente: {produto_atual}
- Valor do upgrade: {valor_upgrade}
- Benefícios adicionais: {beneficios}

ESTRUTURA DO SCRIPT DE UPSELL:

**1. ABERTURA COM RECONHECIMENTO**
- Parabenizar resultados obtidos
- Dados de uso do cliente
- Marcos alcançados

**2. IDENTIFICAÇÃO DE POTENCIAL**
- Perguntas sobre metas futuras
- Gaps identificados no uso
- Oportunidades não exploradas

**3. APRESENTAÇÃO DO UPGRADE**
- Conexão com objetivos mencionados
- Funcionalidades exclusivas
- Casos de clientes similares
- ROI projetado

**4. ANCORAGEM DE VALOR**
- Custo vs. benefício
- Comparativo antes/depois
- Economia de tempo/dinheiro

**5. OFERTA ESPECIAL**
- Condição exclusiva para cliente
- Bônus de migração
- Período de teste
- Garantia estendida

**6. TRATAMENTO DE OBJEÇÕES**
- "Estou satisfeito assim"
- "Não preciso de mais"
- "O preço aumenta muito"

**7. FECHAMENTO**
- Técnica de fechamento
- Próximos passos
- Timeline de ativação`,
    variables: [
      { name: 'produto_upgrade', label: 'Produto do upgrade', placeholder: 'Ex: Plano Premium', type: 'text', required: true },
      { name: 'produto_atual', label: 'Produto atual', placeholder: 'Ex: Plano Básico', type: 'text', required: true },
      { name: 'valor_upgrade', label: 'Valor do upgrade', placeholder: 'Ex: +R$ 200/mês', type: 'text', required: true },
      { name: 'beneficios', label: 'Benefícios adicionais', placeholder: 'Ex: Suporte 24h, integrações', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['upsell', 'vendas', 'expansão', 'receita'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'vendas-premium-11',
    categoryId: 'vendas',
    title: 'Negociação Estratégica',
    description: 'Táticas de negociação para fechar deals complexos',
    template: `Crie um guia de negociação para {tipo_deal}.

CONTEXTO:
- Valor em jogo: {valor}
- Stakeholders: {stakeholders}
- Concorrente na mesa: {concorrente}

GUIA DE NEGOCIAÇÃO ESTRATÉGICA:

**PREPARAÇÃO**
- BATNA (melhor alternativa)
- ZOPA (zona de acordo possível)
- Pontos inegociáveis
- Concessões planejadas
- Pesquisa do outro lado

**TÁTICAS DE ABERTURA**
- Ancoragem de valor
- Primeira oferta estratégica
- Framing do deal
- Criação de rapport

**DURANTE A NEGOCIAÇÃO**
- Técnicas de escuta ativa
- Perguntas poderosas
- Leitura de sinais
- Gestão de silêncio
- Concessões estratégicas

**TÁTICAS AVANÇADAS**
- O "nibble" final
- Split the difference
- Good cop/bad cop
- Deadline pressure
- Take it or leave it

**BLOQUEIOS E IMPASSES**
- Como identificar
- Técnicas de desbloqueio
- Quando pausar
- Quando escalar

**FECHAMENTO**
- Sinais de fechamento
- Técnicas de commitment
- Documentação do acordo
- Próximos passos claros`,
    variables: [
      { name: 'tipo_deal', label: 'Tipo de negociação', placeholder: 'Ex: Contrato enterprise', type: 'text', required: true },
      { name: 'valor', label: 'Valor em jogo', placeholder: 'Ex: R$ 500.000/ano', type: 'text', required: true },
      { name: 'stakeholders', label: 'Stakeholders envolvidos', placeholder: 'Ex: CEO, CFO, CTO', type: 'text', required: true },
      { name: 'concorrente', label: 'Concorrente na mesa', placeholder: 'Ex: Empresa X', type: 'text', required: true }
    ],
    examples: [],
    tags: ['negociação', 'enterprise', 'vendas', 'fechamento'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true
  },
  {
    id: 'vendas-premium-12',
    categoryId: 'vendas',
    title: 'Playbook de Vendas',
    description: 'Manual completo para time comercial',
    template: `Crie um playbook de vendas para {empresa}.

CONTEXTO:
- Produto principal: {produto}
- Mercado-alvo: {mercado}
- Meta mensal: {meta}

ESTRUTURA DO PLAYBOOK:

**1. VISÃO GERAL**
- Missão do time comercial
- Proposta de valor
- Buyer personas detalhadas
- Jornada do cliente

**2. PROCESSO DE VENDAS**
- Etapas do funil
- Critérios de avanço
- SLAs entre etapas
- Ferramentas por etapa

**3. PROSPECÇÃO**
- Canais prioritários
- Cadências de outreach
- Templates de mensagens
- Critérios de qualificação

**4. DISCOVERY**
- Framework de perguntas
- Metodologia (SPIN/MEDDIC)
- Red flags
- Documentação

**5. DEMONSTRAÇÃO**
- Estrutura da demo
- Pontos obrigatórios
- Customização por persona
- Tratamento de objeções

**6. PROPOSTA E NEGOCIAÇÃO**
- Estrutura de proposta
- Política de preços
- Margens de desconto
- Aprovações necessárias

**7. FECHAMENTO**
- Técnicas de fechamento
- Documentação legal
- Onboarding handoff

**8. MÉTRICAS E KPIs**
- Metas por etapa
- Dashboards
- Reuniões de revisão`,
    variables: [
      { name: 'empresa', label: 'Nome da empresa', placeholder: 'Ex: TechCorp', type: 'text', required: true },
      { name: 'produto', label: 'Produto principal', placeholder: 'Ex: SaaS de gestão', type: 'text', required: true },
      { name: 'mercado', label: 'Mercado-alvo', placeholder: 'Ex: PMEs de tecnologia', type: 'text', required: true },
      { name: 'meta', label: 'Meta mensal', placeholder: 'Ex: R$ 500.000', type: 'text', required: true }
    ],
    examples: [],
    tags: ['playbook', 'vendas', 'processo', 'time comercial'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'vendas-premium-13',
    categoryId: 'vendas',
    title: 'Case de Sucesso',
    description: 'Estrutura de case para prova social',
    template: `Crie um case de sucesso para {cliente}.

INFORMAÇÕES:
- Segmento do cliente: {segmento}
- Desafio enfrentado: {desafio}
- Resultados obtidos: {resultados}

ESTRUTURA DO CASE:

**HEADLINE IMPACTANTE**
- Resultado principal em destaque
- Nome e logo do cliente
- Selo de verificação

**O CLIENTE**
- Sobre a empresa
- Tamanho e contexto
- Mercado de atuação
- Pessoa entrevistada

**O DESAFIO**
- Situação antes
- Dores específicas
- Impacto nos negócios
- Por que buscaram solução
- Citação do cliente

**A SOLUÇÃO**
- Por que escolheram você
- O que foi implementado
- Timeline do projeto
- Equipe envolvida
- Metodologia aplicada

**OS RESULTADOS**
- Métricas principais (números)
- Comparativo antes/depois
- ROI calculado
- Benefícios intangíveis
- Citação de impacto

**PRÓXIMOS PASSOS**
- Planos futuros juntos
- Recomendação do cliente
- CTA para prospects

FORMATOS:
- PDF de 2 páginas
- Versão para site
- Versão para slides
- Versão para redes sociais`,
    variables: [
      { name: 'cliente', label: 'Nome do cliente', placeholder: 'Ex: Empresa ABC', type: 'text', required: true },
      { name: 'segmento', label: 'Segmento do cliente', placeholder: 'Ex: Varejo de moda', type: 'text', required: true },
      { name: 'desafio', label: 'Desafio enfrentado', placeholder: 'Ex: Baixa conversão online', type: 'text', required: true },
      { name: 'resultados', label: 'Resultados obtidos', placeholder: 'Ex: +150% em vendas, -40% CAC', type: 'textarea', required: true }
    ],
    examples: [],
    tags: ['case', 'sucesso', 'prova social', 'vendas'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'vendas-premium-14',
    categoryId: 'vendas',
    title: 'Script de Reativação',
    description: 'Sequência para reativar clientes inativos',
    template: `Crie uma sequência de reativação para {tipo_cliente}.

CONTEXTO:
- Tempo inativo: {tempo_inativo}
- Motivo provável: {motivo}
- Oferta de retorno: {oferta}

SEQUÊNCIA DE REATIVAÇÃO:

**EMAIL 1 - Sentimos sua falta**
- Tom pessoal e genuíno
- Sem vender
- Pergunta de check-in
- Fácil de responder

**EMAIL 2 - O que mudou (dia 4)**
- Novidades desde que saiu
- Melhorias implementadas
- Features pedidas por clientes
- Convite para conhecer

**EMAIL 3 - Oferta especial (dia 8)**
- Reconhecer a história
- Proposta de retorno
- Condição exclusiva
- Prazo limitado

**LIGAÇÃO (dia 10)**
- Script de abordagem
- Perguntas de diagnóstico
- Tratamento de objeções
- Proposta verbal

**WHATSAPP (dia 12)**
- Mensagem curta
- Áudio personalizado
- Último contato
- Porta aberta

**EMAIL FINAL (dia 15)**
- Resumo da oferta
- Urgência final
- Alternativas menores
- Despedida respeitosa

Inclua métricas de sucesso esperadas.`,
    variables: [
      { name: 'tipo_cliente', label: 'Tipo de cliente', placeholder: 'Ex: Assinantes cancelados', type: 'text', required: true },
      { name: 'tempo_inativo', label: 'Tempo inativo', placeholder: 'Ex: 3 meses', type: 'text', required: true },
      { name: 'motivo', label: 'Motivo provável de saída', placeholder: 'Ex: Preço ou falta de uso', type: 'text', required: true },
      { name: 'oferta', label: 'Oferta de retorno', placeholder: 'Ex: 50% off por 3 meses', type: 'text', required: true }
    ],
    examples: [],
    tags: ['reativação', 'churn', 'vendas', 'clientes'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'vendas-premium-15',
    categoryId: 'vendas',
    title: 'Análise de Pipeline',
    description: 'Diagnóstico e otimização do funil de vendas',
    template: `Crie uma análise de pipeline para {empresa}.

DADOS DO FUNIL:
- Leads gerados: {leads}
- Taxa de conversão atual: {conversao}
- Ticket médio: {ticket}
- Ciclo de vendas: {ciclo}

ANÁLISE DO PIPELINE:

**1. DIAGNÓSTICO ATUAL**
- Mapeamento do funil
- Taxas por etapa
- Tempo em cada etapa
- Gargalos identificados
- Leads estagnados

**2. ANÁLISE DE PERDAS**
- Onde perdem mais
- Motivos de perda
- Padrões identificados
- Custo de aquisição perdido

**3. OPORTUNIDADES DE MELHORIA**
- Quick wins (curto prazo)
- Melhorias estruturais (médio)
- Transformações (longo prazo)

**4. BENCHMARKS DO MERCADO**
- Comparativo com indústria
- Melhores práticas
- Gaps de performance

**5. PLANO DE AÇÃO**
- Ações prioritárias
- Responsáveis
- Timeline
- Métricas de sucesso
- Investimentos necessários

**6. PROJEÇÕES**
- Cenário conservador
- Cenário moderado
- Cenário otimista
- ROI esperado

**7. FERRAMENTAS RECOMENDADAS**
- CRM features
- Automações
- Integrações`,
    variables: [
      { name: 'empresa', label: 'Nome da empresa', placeholder: 'Ex: VendasTech', type: 'text', required: true },
      { name: 'leads', label: 'Leads gerados/mês', placeholder: 'Ex: 500 leads', type: 'text', required: true },
      { name: 'conversao', label: 'Taxa de conversão', placeholder: 'Ex: 5%', type: 'text', required: true },
      { name: 'ticket', label: 'Ticket médio', placeholder: 'Ex: R$ 3.000', type: 'text', required: true },
      { name: 'ciclo', label: 'Ciclo de vendas', placeholder: 'Ex: 30 dias', type: 'text', required: true }
    ],
    examples: [],
    tags: ['pipeline', 'análise', 'funil', 'vendas', 'otimização'],
    difficulty: 'advanced',
    isPremium: true
  }
];

// ============================================
// REDES SOCIAIS - 15 PROMPTS PREMIUM
// ============================================

export const redesSociaisPremiumPrompts: Prompt[] = [
  {
    id: 'redes-premium-1',
    categoryId: 'social',
    title: 'Calendário Editorial Mensal',
    description: 'Planejamento completo de 30 dias de conteúdo',
    template: `Crie um calendário editorial de 30 dias para {perfil}.

CONTEXTO:
- Nicho: {nicho}
- Frequência: {frequencia}
- Objetivo principal: {objetivo}

CALENDÁRIO EDITORIAL:

**SEMANA 1: Fundação**
Para cada dia:
- Tipo de conteúdo
- Tema específico
- Hook de abertura
- CTA do post
- Melhor horário
- Hashtags (5-10)

**SEMANA 2: Autoridade**
[Mesma estrutura]
Foco em conteúdo educativo e cases

**SEMANA 3: Engajamento**
[Mesma estrutura]
Foco em interação e comunidade

**SEMANA 4: Conversão**
[Mesma estrutura]
Foco em ofertas e vendas

DISTRIBUIÇÃO DE FORMATOS:
- X% Carrosséis educativos
- X% Reels/vídeos curtos
- X% Stories interativos
- X% Posts estáticos
- X% Lives/colaborações

DATAS ESPECIAIS DO MÊS:
- Identificar e criar conteúdo temático

MÉTRICAS DE SUCESSO:
- KPIs por tipo de conteúdo
- Metas semanais`,
    variables: [
      { name: 'perfil', label: 'Tipo de perfil', placeholder: 'Ex: Nutricionista', type: 'text', required: true },
      { name: 'nicho', label: 'Nicho específico', placeholder: 'Ex: Emagrecimento saudável', type: 'text', required: true },
      { name: 'frequencia', label: 'Frequência de posts', placeholder: 'Ex: 1 post/dia', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo principal', placeholder: 'Ex: Vender mentoria', type: 'text', required: true }
    ],
    examples: [],
    tags: ['calendário', 'planejamento', 'redes sociais', 'conteúdo'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true
  },
  {
    id: 'redes-premium-2',
    categoryId: 'social',
    title: 'Roteiro de Reels Viral',
    description: 'Estrutura de vídeo curto para viralizar',
    template: `Crie um roteiro de Reels viral sobre {tema}.

CONTEXTO:
- Nicho: {nicho}
- Objetivo: {objetivo}
- Duração: {duracao}

ROTEIRO COMPLETO:

**HOOK (0-3 segundos)**
5 opções de abertura impactante:
- Pattern interrupt
- Pergunta provocativa
- Afirmação polêmica
- Curiosidade
- Promessa de valor

**DESENVOLVIMENTO (3-20 segundos)**
- Estrutura do conteúdo
- Pontos principais
- Transições sugeridas
- Momentos de retenção

**CLÍMAX (20-25 segundos)**
- Revelação principal
- Momento "uau"
- Plot twist (se aplicável)

**CTA (25-30 segundos)**
- Chamada clara
- Engajamento solicitado
- Loop para rewatch

ELEMENTOS DE PRODUÇÃO:
- Sugestões de áudio trending
- Movimentos de câmera
- Texto na tela
- Efeitos visuais

LEGENDA OTIMIZADA:
- Texto da legenda
- Hashtags estratégicas
- Call to action

GANCHOS PARA COMENTÁRIOS:
- 5 perguntas para engajar`,
    variables: [
      { name: 'tema', label: 'Tema do Reels', placeholder: 'Ex: 3 erros ao investir', type: 'text', required: true },
      { name: 'nicho', label: 'Seu nicho', placeholder: 'Ex: Finanças pessoais', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo do vídeo', placeholder: 'Ex: Gerar leads', type: 'text', required: true },
      { name: 'duracao', label: 'Duração alvo', placeholder: 'Ex: 30 segundos', type: 'text', required: true }
    ],
    examples: [],
    tags: ['reels', 'viral', 'vídeo', 'Instagram', 'TikTok'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'redes-premium-3',
    categoryId: 'social',
    title: 'Carrossel LinkedIn',
    description: 'Carrossel educativo para autoridade no LinkedIn',
    template: `Crie um carrossel para LinkedIn sobre {tema}.

CONTEXTO:
- Público-alvo: {publico}
- Objetivo: {objetivo}
- Tom de voz: {tom}

ESTRUTURA DO CARROSSEL (10 SLIDES):

**SLIDE 1 - CAPA**
- Título magnético
- Subtítulo com promessa
- Design limpo e profissional

**SLIDE 2 - PROBLEMA/DOR**
- Estatística impactante
- Contexto do problema

**SLIDES 3-8 - CONTEÚDO**
Para cada slide:
- Título do ponto
- Explicação concisa (máx 3 linhas)
- Ícone ou visual sugerido

**SLIDE 9 - RESUMO**
- Recap dos pontos
- Insight final

**SLIDE 10 - CTA**
- Chamada para ação
- Como aprofundar
- Convite para conexão

LEGENDA DO POST:
- Hook de abertura (2 linhas)
- Contexto do tema
- Por que isso importa
- Teaser do conteúdo
- CTA para salvar/compartilhar
- Hashtags (3-5)

DICAS DE DESIGN:
- Cores sugeridas
- Fontes recomendadas
- Elementos visuais`,
    variables: [
      { name: 'tema', label: 'Tema do carrossel', placeholder: 'Ex: Gestão de tempo para líderes', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Gestores e executivos', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo do post', placeholder: 'Ex: Gerar autoridade', type: 'text', required: true },
      { name: 'tom', label: 'Tom de voz', placeholder: 'Ex: Profissional e inspirador', type: 'text', required: true }
    ],
    examples: [],
    tags: ['LinkedIn', 'carrossel', 'autoridade', 'B2B'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'redes-premium-4',
    categoryId: 'social',
    title: 'Bio Magnética',
    description: 'Bio otimizada para conversão em qualquer rede',
    template: `Crie uma bio magnética para {rede_social}.

INFORMAÇÕES:
- Quem você é: {quem}
- O que você faz: {faz}
- Para quem: {para_quem}
- Resultado que entrega: {resultado}

BIO OTIMIZADA:

**VERSÃO INSTAGRAM (150 caracteres)**
- Linha 1: Autoridade/cargo
- Linha 2: O que faz
- Linha 3: Para quem
- Linha 4: Resultado/promessa
- CTA + emoji

**VERSÃO LINKEDIN (2.600 caracteres)**
- Headline magnética
- Sobre (3 parágrafos)
- Destaque de resultados
- Call to action

**VERSÃO TIKTOK (80 caracteres)**
- Uma frase impactante
- Emoji estratégico

**VERSÃO TWITTER/X (160 caracteres)**
- Descrição concisa
- Personalidade
- Interesse

**VERSÃO YOUTUBE (1.000 caracteres)**
- Sobre o canal
- O que esperar
- Frequência de vídeos
- CTA para inscrição

ELEMENTOS EXTRAS:
- Emojis estratégicos por rede
- Palavras-chave
- Link otimizado (sugestões)
- Destaque de autoridade`,
    variables: [
      { name: 'rede_social', label: 'Rede principal', placeholder: 'Ex: Instagram', type: 'text', required: true },
      { name: 'quem', label: 'Quem você é', placeholder: 'Ex: Especialista em finanças', type: 'text', required: true },
      { name: 'faz', label: 'O que você faz', placeholder: 'Ex: Ajudo pessoas a investir', type: 'text', required: true },
      { name: 'para_quem', label: 'Para quem', placeholder: 'Ex: Iniciantes em investimentos', type: 'text', required: true },
      { name: 'resultado', label: 'Resultado que entrega', placeholder: 'Ex: Primeira carteira lucrativa', type: 'text', required: true }
    ],
    examples: [],
    tags: ['bio', 'perfil', 'conversão', 'redes sociais'],
    difficulty: 'beginner',
    isPremium: true
  },
  {
    id: 'redes-premium-5',
    categoryId: 'social',
    title: 'Threads Virais Twitter/X',
    description: 'Thread de 10 tweets para viralizar',
    template: `Crie uma thread viral sobre {tema}.

CONTEXTO:
- Nicho: {nicho}
- Objetivo: {objetivo}
- Público: {publico}

ESTRUTURA DA THREAD (10 TWEETS):

**TWEET 1 - HOOK**
- Promessa irresistível
- Número específico
- Urgência ou curiosidade
- "🧵 Thread:"

**TWEET 2 - CONTEXTO**
- Por que isso importa
- Estabelecer credibilidade

**TWEETS 3-8 - CONTEÚDO**
Para cada tweet:
- Uma ideia por tweet
- Máximo 280 caracteres
- Emoji estratégico
- Formatação clara

**TWEET 9 - RESUMO**
- Recap dos pontos principais
- Insight final

**TWEET 10 - CTA**
- Pedido de retweet
- Convite para seguir
- Link (se aplicável)

OTIMIZAÇÕES:
- Melhores horários para postar
- Como estruturar replies
- Ganchos para engajamento
- Follow-up sugerido

VARIAÇÕES DE HOOK:
- 5 opções alternativas de abertura`,
    variables: [
      { name: 'tema', label: 'Tema da thread', placeholder: 'Ex: Como crescer no Twitter', type: 'text', required: true },
      { name: 'nicho', label: 'Seu nicho', placeholder: 'Ex: Marketing digital', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo da thread', placeholder: 'Ex: Ganhar seguidores', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Empreendedores digitais', type: 'text', required: true }
    ],
    examples: [],
    tags: ['Twitter', 'X', 'thread', 'viral', 'crescimento'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'redes-premium-6',
    categoryId: 'social',
    title: 'Estratégia de Stories',
    description: 'Sequência de 10 stories para engajar e vender',
    template: `Crie uma sequência de 10 stories sobre {tema}.

CONTEXTO:
- Objetivo: {objetivo}
- Produto/serviço: {produto}
- Estilo: {estilo}

SEQUÊNCIA DE 10 STORIES:

**STORY 1 - GANCHO**
- Pergunta ou afirmação
- Gerar curiosidade
- Sticker de enquete

**STORY 2 - CONTEXTO**
- Por que estou falando disso
- Conexão pessoal

**STORIES 3-5 - CONTEÚDO**
- Dicas ou revelações
- Um ponto por story
- Interação em cada

**STORY 6 - PROVA SOCIAL**
- Resultado ou depoimento
- Print ou foto

**STORY 7 - BASTIDORES**
- Humanizar
- Mostrar processo

**STORY 8 - DOR**
- O que acontece se não agir
- Criar urgência

**STORY 9 - SOLUÇÃO**
- Apresentar a oferta
- Benefícios claros

**STORY 10 - CTA**
- Link ou ação clara
- Contagem regressiva
- Urgência

ELEMENTOS INTERATIVOS:
- Enquetes sugeridas
- Caixas de perguntas
- Quizzes
- Sliders

DICAS DE PRODUÇÃO:
- Duração de cada story
- Música/áudio sugerido
- Elementos visuais`,
    variables: [
      { name: 'tema', label: 'Tema dos stories', placeholder: 'Ex: Lançamento de curso', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Gerar vendas', type: 'text', required: true },
      { name: 'produto', label: 'Produto/serviço', placeholder: 'Ex: Mentoria de negócios', type: 'text', required: true },
      { name: 'estilo', label: 'Estilo de comunicação', placeholder: 'Ex: Descontraído e direto', type: 'text', required: true }
    ],
    examples: [],
    tags: ['stories', 'Instagram', 'engajamento', 'vendas'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'redes-premium-7',
    categoryId: 'social',
    title: 'Estratégia de Hashtags',
    description: 'Pesquisa e estratégia de hashtags por nicho',
    template: `Crie uma estratégia de hashtags para {nicho}.

CONTEXTO:
- Rede social principal: {rede}
- Tamanho da conta: {tamanho}
- Objetivo: {objetivo}

ESTRATÉGIA DE HASHTAGS:

**ANÁLISE DO NICHO**
- Hashtags mais usadas
- Volume de posts
- Engajamento médio
- Concorrência

**CATEGORIAS DE HASHTAGS**

1. **Hashtags de Nicho (5)**
   - Alta relevância
   - Médio volume
   - Público qualificado

2. **Hashtags de Comunidade (5)**
   - Engajamento alto
   - Conexão com audiência
   - Tribos específicas

3. **Hashtags de Alcance (5)**
   - Alto volume
   - Competição moderada
   - Descoberta

4. **Hashtags de Localização (3)**
   - Geolocalização
   - Mercado local

5. **Hashtags de Marca (2)**
   - Sua hashtag única
   - Campanha específica

**CONJUNTOS PRONTOS**
- Set 1: Posts educativos
- Set 2: Posts de vendas
- Set 3: Posts pessoais
- Set 4: Reels/vídeos

**ROTAÇÃO ESTRATÉGICA**
- Como alternar
- Frequência de mudança
- Teste A/B

**HASHTAGS A EVITAR**
- Banidas
- Spam
- Genéricas demais`,
    variables: [
      { name: 'nicho', label: 'Seu nicho', placeholder: 'Ex: Fitness feminino', type: 'text', required: true },
      { name: 'rede', label: 'Rede social', placeholder: 'Ex: Instagram', type: 'text', required: true },
      { name: 'tamanho', label: 'Tamanho da conta', placeholder: 'Ex: 5.000 seguidores', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo principal', placeholder: 'Ex: Crescer audiência', type: 'text', required: true }
    ],
    examples: [],
    tags: ['hashtags', 'estratégia', 'alcance', 'Instagram'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'redes-premium-8',
    categoryId: 'social',
    title: 'Roteiro de Live',
    description: 'Estrutura completa para live de 1 hora',
    template: `Crie um roteiro de live sobre {tema}.

CONTEXTO:
- Duração: {duracao}
- Objetivo: {objetivo}
- Oferta (se houver): {oferta}

ROTEIRO DA LIVE:

**PRÉ-LIVE (30 min antes)**
- Checklist técnico
- Post de aviso
- Stories de aquecimento

**ABERTURA (0-10 min)**
- Boas-vindas
- Quem sou eu (breve)
- O que vamos ver
- Pedir para chamar amigos
- Engajamento inicial

**CONTEÚDO PARTE 1 (10-25 min)**
- Tema principal
- Pontos-chave
- Perguntas para audiência
- Responder comentários

**INTERVALO INTERATIVO (25-30 min)**
- Enquete
- Caixa de perguntas
- Sorteio (se houver)

**CONTEÚDO PARTE 2 (30-45 min)**
- Aprofundamento
- Cases e exemplos
- Dicas práticas
- Q&A ao vivo

**OFERTA (45-55 min)**
- Transição natural
- Apresentação da oferta
- Bônus exclusivos
- Urgência/escassez
- Link e instruções

**FECHAMENTO (55-60 min)**
- Resumo
- Agradecimentos
- Próximos passos
- CTA final

PÓS-LIVE:
- Salvar replay
- Post de agradecimento
- Follow-up com leads`,
    variables: [
      { name: 'tema', label: 'Tema da live', placeholder: 'Ex: Como começar no digital', type: 'text', required: true },
      { name: 'duracao', label: 'Duração', placeholder: 'Ex: 1 hora', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Lançar produto', type: 'text', required: true },
      { name: 'oferta', label: 'Oferta (se houver)', placeholder: 'Ex: Curso com 50% off', type: 'text', required: false }
    ],
    examples: [],
    tags: ['live', 'ao vivo', 'roteiro', 'lançamento'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'redes-premium-9',
    categoryId: 'social',
    title: 'Gestão de Crise',
    description: 'Protocolo de resposta a crises nas redes sociais',
    template: `Crie um protocolo de gestão de crise para {marca}.

CONTEXTO:
- Tipo de crise: {tipo_crise}
- Canal principal: {canal}
- Tom da marca: {tom}

PROTOCOLO DE CRISE:

**1. AVALIAÇÃO INICIAL (1ª hora)**
- Classificação da crise (1-5)
- Origem e abrangência
- Sentimento predominante
- Stakeholders afetados
- Potencial de escalada

**2. EQUIPE DE RESPOSTA**
- Quem deve ser acionado
- Responsabilidades
- Fluxo de aprovação
- Canais de comunicação interna

**3. CONTENÇÃO IMEDIATA**
- Pausar posts agendados
- Monitorar menções
- Não deletar comentários
- Documentar tudo

**4. TEMPLATES DE RESPOSTA**

Resposta inicial:
[Template de reconhecimento]

Resposta com solução:
[Template com resolução]

Resposta a críticas:
[Template empático]

Resposta a fake news:
[Template de correção]

**5. COMUNICADO OFICIAL**
- Estrutura do comunicado
- Onde publicar
- Tom e linguagem
- Próximas atualizações

**6. PÓS-CRISE**
- Monitoramento contínuo
- Análise de aprendizados
- Relatório final
- Prevenção futura`,
    variables: [
      { name: 'marca', label: 'Marca/empresa', placeholder: 'Ex: Loja ABC', type: 'text', required: true },
      { name: 'tipo_crise', label: 'Tipo de crise', placeholder: 'Ex: Reclamação viral', type: 'text', required: true },
      { name: 'canal', label: 'Canal principal', placeholder: 'Ex: Twitter', type: 'text', required: true },
      { name: 'tom', label: 'Tom da marca', placeholder: 'Ex: Profissional e acolhedor', type: 'text', required: true }
    ],
    examples: [],
    tags: ['crise', 'reputação', 'gestão', 'redes sociais'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'redes-premium-10',
    categoryId: 'social',
    title: 'Análise de Concorrentes',
    description: 'Benchmark completo de concorrentes nas redes',
    template: `Crie uma análise de concorrentes para {seu_perfil}.

CONCORRENTES A ANALISAR:
- Concorrente 1: {concorrente1}
- Concorrente 2: {concorrente2}
- Concorrente 3: {concorrente3}

ANÁLISE COMPLETA:

**1. VISÃO GERAL**
Para cada concorrente:
- Seguidores por rede
- Taxa de crescimento
- Engajamento médio
- Frequência de posts

**2. ANÁLISE DE CONTEÚDO**
- Tipos de post mais usados
- Temas principais
- Formatos que performam
- Tom de voz
- Estética visual

**3. ANÁLISE DE ENGAJAMENTO**
- Posts com mais likes
- Posts com mais comentários
- Posts com mais compartilhamentos
- Padrões identificados

**4. ANÁLISE DE AUDIÊNCIA**
- Perfil demográfico
- Principais interações
- Horários de atividade
- Sentimento geral

**5. ESTRATÉGIAS IDENTIFICADAS**
- O que funciona para eles
- Diferenciações
- Lacunas não exploradas
- Oportunidades para você

**6. INSIGHTS ACIONÁVEIS**
- O que copiar (adaptando)
- O que evitar
- Diferenciação possível
- Quick wins

**7. PLANO DE AÇÃO**
- Prioridades
- Timeline
- Métricas de comparação`,
    variables: [
      { name: 'seu_perfil', label: 'Seu perfil/marca', placeholder: 'Ex: @meuperfil', type: 'text', required: true },
      { name: 'concorrente1', label: 'Concorrente 1', placeholder: 'Ex: @concorrente1', type: 'text', required: true },
      { name: 'concorrente2', label: 'Concorrente 2', placeholder: 'Ex: @concorrente2', type: 'text', required: true },
      { name: 'concorrente3', label: 'Concorrente 3', placeholder: 'Ex: @concorrente3', type: 'text', required: true }
    ],
    examples: [],
    tags: ['benchmark', 'concorrentes', 'análise', 'estratégia'],
    difficulty: 'advanced',
    isPremium: true,
    isFeatured: true
  },
  {
    id: 'redes-premium-11',
    categoryId: 'social',
    title: 'Conteúdo para YouTube',
    description: 'Roteiro completo de vídeo longo para YouTube',
    template: `Crie um roteiro de vídeo para YouTube sobre {tema}.

CONTEXTO:
- Duração alvo: {duracao}
- Público: {publico}
- Objetivo: {objetivo}

ROTEIRO COMPLETO:

**TÍTULO E THUMBNAIL**
- 5 opções de título (CTR alto)
- Conceito de thumbnail
- Texto na thumbnail

**HOOK (0-30 segundos)**
- Abertura impactante
- Promessa do vídeo
- Por que assistir até o final
- Pattern interrupt

**INTRO (30s - 1min)**
- Breve apresentação
- Credibilidade rápida
- Agenda do vídeo

**CONTEÚDO PRINCIPAL**
Dividido em capítulos:

Capítulo 1: [Título]
- Pontos principais
- Exemplos
- Timestamp sugerido

[Repetir para cada capítulo]

**RETENÇÃO**
- Momentos de loop
- Perguntas retóricas
- Cliffhangers internos
- Pattern interrupts

**CTA INTERMEDIÁRIO**
- Pedido de like
- Inscrição
- Sininho

**CONCLUSÃO**
- Resumo
- Insight final
- Próximos passos

**CTA FINAL**
- Vídeo relacionado
- Playlist
- Comunidade

DESCRIÇÃO OTIMIZADA:
- Primeiras 2 linhas (gancho)
- Timestamps dos capítulos
- Links importantes
- Hashtags e tags`,
    variables: [
      { name: 'tema', label: 'Tema do vídeo', placeholder: 'Ex: Como editar vídeos', type: 'text', required: true },
      { name: 'duracao', label: 'Duração alvo', placeholder: 'Ex: 15 minutos', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Iniciantes em edição', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo do vídeo', placeholder: 'Ex: Tutorial completo', type: 'text', required: true }
    ],
    examples: [],
    tags: ['YouTube', 'roteiro', 'vídeo longo', 'tutorial'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'redes-premium-12',
    categoryId: 'social',
    title: 'Estratégia de Colaborações',
    description: 'Plano para parcerias e collabs com influenciadores',
    template: `Crie uma estratégia de colaborações para {marca}.

CONTEXTO:
- Orçamento disponível: {orcamento}
- Objetivo: {objetivo}
- Nicho: {nicho}

ESTRATÉGIA DE COLABORAÇÕES:

**1. MAPEAMENTO DE INFLUENCIADORES**

Micro (1k-10k):
- Perfil ideal
- Onde encontrar
- Métricas mínimas

Médio (10k-100k):
- Perfil ideal
- Tipos de parceria
- Investimento esperado

Macro (100k+):
- Perfil ideal
- Abordagem diferenciada
- ROI esperado

**2. TIPOS DE PARCERIA**
- Permuta
- Publipost
- Afiliado
- Embaixador
- Co-criação

**3. TEMPLATE DE ABORDAGEM**
- DM inicial
- Email de proposta
- Apresentação comercial
- Contrato modelo

**4. BRIEFING DE CAMPANHA**
- Objetivos claros
- Do's and Don'ts
- Key messages
- Entregáveis
- Timeline

**5. MÉTRICAS E ROI**
- KPIs por tipo de parceria
- Como mensurar
- Relatório modelo
- Benchmark de resultados

**6. GESTÃO DE RELACIONAMENTO**
- CRM de influenciadores
- Follow-up
- Fidelização
- Programas de indicação`,
    variables: [
      { name: 'marca', label: 'Sua marca', placeholder: 'Ex: Loja de cosméticos', type: 'text', required: true },
      { name: 'orcamento', label: 'Orçamento mensal', placeholder: 'Ex: R$ 5.000', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo principal', placeholder: 'Ex: Aumentar vendas', type: 'text', required: true },
      { name: 'nicho', label: 'Nicho', placeholder: 'Ex: Beleza e skincare', type: 'text', required: true }
    ],
    examples: [],
    tags: ['influenciadores', 'parcerias', 'colaborações', 'marketing'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'redes-premium-13',
    categoryId: 'social',
    title: 'Legendas Magnéticas',
    description: '20 templates de legendas para diferentes objetivos',
    template: `Crie 20 templates de legendas para {nicho}.

CONTEXTO:
- Tom de voz: {tom}
- Objetivo principal: {objetivo}
- Público: {publico}

20 TEMPLATES DE LEGENDAS:

**CATEGORIA: EDUCATIVO (5)**

1. O método X para Y
[Hook + 3 pontos + CTA]

2. Verdade vs Mito
[Contraste + revelação + CTA]

3. Antes/Depois
[Transformação + como + CTA]

4. Lista de dicas
[Número + dicas + CTA]

5. Erro comum
[Problema + solução + CTA]

**CATEGORIA: ENGAJAMENTO (5)**

6. Pergunta polêmica
[Afirmação + pergunta + enquete]

7. Isso ou aquilo
[Opções + posicionamento + CTA]

8. Complete a frase
[Início + ... + convite]

9. Marque alguém
[Contexto + @ + engajamento]

10. Salve para depois
[Valor + organização + salvar]

**CATEGORIA: CONEXÃO (5)**

11. História pessoal
[Vulnerabilidade + aprendizado + CTA]

12. Bastidores
[Humanização + processo + CTA]

13. Gratidão
[Reconhecimento + comunidade + CTA]

14. Confissão
[Verdade + identificação + CTA]

15. Celebração
[Marco + jornada + CTA]

**CATEGORIA: VENDAS (5)**

16. Problema-solução
[Dor + agitação + oferta]

17. Prova social
[Resultado + depoimento + CTA]

18. Urgência
[Escassez + benefício + CTA]

19. FAQ invertido
[Objeção + resposta + CTA]

20. Oferta direta
[Benefício + preço + CTA]`,
    variables: [
      { name: 'nicho', label: 'Seu nicho', placeholder: 'Ex: Desenvolvimento pessoal', type: 'text', required: true },
      { name: 'tom', label: 'Tom de voz', placeholder: 'Ex: Inspirador e próximo', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo principal', placeholder: 'Ex: Vender mentorias', type: 'text', required: true },
      { name: 'publico', label: 'Público-alvo', placeholder: 'Ex: Profissionais 25-40 anos', type: 'text', required: true }
    ],
    examples: [],
    tags: ['legendas', 'templates', 'copywriting', 'Instagram'],
    difficulty: 'intermediate',
    isPremium: true
  },
  {
    id: 'redes-premium-14',
    categoryId: 'social',
    title: 'Estratégia de Comunidade',
    description: 'Plano para construir e engajar comunidade',
    template: `Crie uma estratégia de comunidade para {marca}.

CONTEXTO:
- Plataforma: {plataforma}
- Tamanho atual: {tamanho}
- Objetivo: {objetivo}

ESTRATÉGIA DE COMUNIDADE:

**1. PROPÓSITO DA COMUNIDADE**
- Missão clara
- Valores compartilhados
- Promessa de transformação
- Benefício de pertencer

**2. ESTRUTURA**
- Regras e guidelines
- Moderação
- Hierarquia (se houver)
- Rituais e tradições

**3. CONTEÚDO EXCLUSIVO**
- Tipos de conteúdo
- Frequência
- Quem produz
- Formato preferencial

**4. ENGAJAMENTO ATIVO**
- Boas-vindas a novos membros
- Desafios e gincanas
- Lives exclusivas
- Encontros (virtuais/presenciais)
- Reconhecimento de membros

**5. GAMIFICAÇÃO**
- Sistemas de pontos
- Badges e conquistas
- Rankings
- Recompensas

**6. MONETIZAÇÃO**
- Modelo de receita
- Tiers de acesso
- Benefícios por nível
- Preços sugeridos

**7. MÉTRICAS**
- KPIs de comunidade
- Saúde da comunidade
- NPS
- Retenção

**8. CRESCIMENTO**
- Estratégia de aquisição
- Programas de referral
- Eventos de porta aberta
- Parcerias`,
    variables: [
      { name: 'marca', label: 'Sua marca/projeto', placeholder: 'Ex: Clube de Leitura', type: 'text', required: true },
      { name: 'plataforma', label: 'Plataforma', placeholder: 'Ex: Discord, Telegram, Circle', type: 'text', required: true },
      { name: 'tamanho', label: 'Tamanho atual', placeholder: 'Ex: 500 membros', type: 'text', required: true },
      { name: 'objetivo', label: 'Objetivo', placeholder: 'Ex: Engajamento e vendas', type: 'text', required: true }
    ],
    examples: [],
    tags: ['comunidade', 'engajamento', 'Discord', 'membership'],
    difficulty: 'advanced',
    isPremium: true
  },
  {
    id: 'redes-premium-15',
    categoryId: 'social',
    title: 'Relatório de Performance',
    description: 'Modelo de relatório mensal de redes sociais',
    template: `Crie um modelo de relatório mensal para {marca}.

CONTEXTO:
- Redes sociais: {redes}
- Período: {periodo}
- Stakeholders: {stakeholders}

RELATÓRIO DE PERFORMANCE:

**1. SUMÁRIO EXECUTIVO**
- Principais resultados
- Destaques do mês
- Desafios enfrentados
- Próximos passos

**2. MÉTRICAS GERAIS**

Por rede social:
- Seguidores (início vs fim)
- Crescimento %
- Alcance total
- Impressões
- Engajamento médio

**3. ANÁLISE DE CONTEÚDO**

Top 5 posts por:
- Engajamento
- Alcance
- Conversão
- Salvamentos

Análise de padrões:
- Formatos que funcionaram
- Horários de melhor performance
- Temas mais engajados

**4. AUDIÊNCIA**
- Demografia
- Localizações
- Horários ativos
- Crescimento de qualificados

**5. COMPARATIVO**
- vs mês anterior
- vs mesmo período ano anterior
- vs meta estabelecida
- vs benchmark do mercado

**6. AÇÕES REALIZADAS**
- Campanhas
- Parcerias
- Novos formatos testados
- Investimentos

**7. INSIGHTS E APRENDIZADOS**
- O que funcionou
- O que não funcionou
- Hipóteses para testar

**8. PLANO PRÓXIMO MÊS**
- Metas
- Ações planejadas
- Orçamento
- Calendário resumido`,
    variables: [
      { name: 'marca', label: 'Marca/Cliente', placeholder: 'Ex: Empresa XYZ', type: 'text', required: true },
      { name: 'redes', label: 'Redes sociais', placeholder: 'Ex: Instagram, LinkedIn, TikTok', type: 'text', required: true },
      { name: 'periodo', label: 'Período do relatório', placeholder: 'Ex: Janeiro 2025', type: 'text', required: true },
      { name: 'stakeholders', label: 'Para quem é o relatório', placeholder: 'Ex: Diretoria, cliente', type: 'text', required: true }
    ],
    examples: [],
    tags: ['relatório', 'métricas', 'analytics', 'performance'],
    difficulty: 'intermediate',
    isPremium: true
  }
];
