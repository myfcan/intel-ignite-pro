import { PromptCategory } from '../../types/prompt';

export const productCreationPromptsCategory: PromptCategory = {
  id: 'product-creation',
  name: 'Criação de Produtos',
  description: 'Prompts para criar produtos digitais, físicos, apps e validar ideias',
  icon: 'PackagePlus',
  color: 'bg-orange-500',
  isPopular: true,
  prompts: [
    {
      id: 'pc-digital-product-idea',
      categoryId: 'product-creation',
      title: 'Ideias de Produtos Digitais Lucrativos',
      description: 'Gere ideias validadas de produtos digitais para seu nicho',
      template: `Gere ideias de produtos digitais para:

Nicho/Expertise: {niche}
Público-alvo: {audience}
Faixa de preço: {price_range}
Tempo disponível para criar: {time_available}
Habilidades: {skills}

**ANÁLISE E IDEIAS DE PRODUTOS DIGITAIS:**

**1. ANÁLISE DO MERCADO**

Dores principais do público:
1. [dor específica]
2. [dor específica]
3. [dor específica]

Produtos existentes (gap analysis):
- [produto concorrente]: O que falta
- [produto concorrente]: Oportunidade

**2. TOP 10 IDEIAS DE PRODUTOS DIGITAIS**

Para cada ideia, estruturar:

**IDEIA #1: [Nome do Produto]**
- Formato: [e-book / curso / template / software / etc]
- Descrição: [2 parágrafos]
- Problema que resolve: [específico]
- Público-alvo: [segmento específico]
- Preço sugerido: R$ [valor]
- Tempo para criar: [estimativa]
- Dificuldade: [baixa/média/alta]
- Potencial de receita: [baixo/médio/alto]
- MVP mínimo: [descrição]
- Diferencial: [o que tem de único]
- Validação prévia: [como testar com R$ 0]

**Por que vai funcionar:**
- Demanda comprovada: [evidências]
- Baixa concorrência / Alto preço
- Fácil de escalar
- [outros motivos]

**Conteúdo do produto:**
- Módulo/Capítulo 1: [título]
- Módulo 2: [título]
- [...]

**Estratégia de lançamento:**
- Pré-venda: [como fazer]
- Marketing: [canais principais]
- Preço de lançamento: [estratégia]

---

[Repetir estrutura para ideias 2-10]

**3. MATRIZ DE PRIORIZAÇÃO**

| Produto | Demanda | Facilidade | Lucro | Score |
|---------|---------|------------|-------|-------|
| [ideia 1] | 8/10 | 9/10 | 7/10 | 8.0 |
| [ideia 2] | 9/10 | 6/10 | 9/10 | 8.0 |
| [...] |

**4. RECOMENDAÇÃO FINAL**

🥇 **Comece com:** [Produto X]
**Por quê:**
- Menor tempo de criação
- Validação mais fácil
- Risco baixo
- Pode testar em [prazo]

📅 **Plano de 30 dias:**

Semana 1: Validação
- Pesquisa com público
- Pré-venda / validação de interesse
- Criar landing page simples

Semana 2-3: Criação
- Produzir conteúdo core
- Design básico
- Setup de pagamento

Semana 4: Lançamento
- Campanha de lançamento
- Primeiros clientes
- Feedback e iteração

**5. PRÓXIMOS PRODUTOS** (roadmap)

Trimestre 1: [Produto 1]
Trimestre 2: [Produto 2] (upsell do primeiro)
Trimestre 3: [Produto 3] (assinatura/recorrente)
Trimestre 4: [Produto premium]

**6. FERRAMENTAS NECESSÁRIAS**

Para criar:
- [ferramenta gratuita/paga]
- [...]

Para vender:
- [plataforma]
- [...]

Custo total inicial: R$ [valor]`,
      variables: [
        {
          name: 'niche',
          label: 'Seu nicho/expertise',
          placeholder: 'Ex: Marketing digital para dentistas',
          type: 'textarea',
          required: true
        },
        {
          name: 'audience',
          label: 'Público-alvo detalhado',
          placeholder: 'Ex: Dentistas 30-50 anos que querem atrair pacientes',
          type: 'textarea',
          required: true
        },
        {
          name: 'price_range',
          label: 'Faixa de preço desejada',
          placeholder: 'Ex: R$ 97 a R$ 497',
          type: 'text',
          required: true
        },
        {
          name: 'time_available',
          label: 'Tempo disponível para criar',
          placeholder: 'Ex: 2 horas por dia, 30 dias',
          type: 'text',
          required: true
        },
        {
          name: 'skills',
          label: 'Suas habilidades',
          placeholder: 'Ex: Escrever bem, gravar vídeos, design básico',
          type: 'textarea',
          required: true
        }
      ],
      examples: [],
      tags: ['produto digital', 'infoproduto', 'ideias', 'validação', 'curso'],
      difficulty: 'intermediate',
      isPremium: true,
      isFeatured: true,
      usageCount: 0
    },
    {
      id: 'pc-app-idea-validation',
      categoryId: 'product-creation',
      title: 'Validação de Ideia de App/Software',
      description: 'Valide ideia de app antes de desenvolver',
      template: `Valide ideia de app/software:

Nome do app: {app_name}
Problema que resolve: {problem}
Público-alvo: {target_users}
Principais funcionalidades: {features}
Concorrentes conhecidos: {competitors}

**VALIDAÇÃO COMPLETA DE APP:**

**1. CLAREZA DO PROBLEMA**

Problema específico: {problem}

Análise crítica:
- É um problema real ou imaginário?
- Frequência: Quantas vezes por [dia/semana/mês]?
- Intensidade da dor (1-10): [avaliar]
- Soluções atuais: [como resolvem hoje]
- Disposição para pagar: [baixa/média/alta]

❌ Red flags:
- Problema que ninguém mencionou
- Solução complexa para problema simples
- "Seria legal ter..."

✅ Green flags:
- Usuários pagam solução cara/ruim
- Problema mencionado em fóruns
- Workarounds complexos existem

**2. ANÁLISE DE CONCORRENTES**

| Concorrente | Usuários | Preço | Pontos Fortes | Fraquezas |
|-------------|----------|-------|---------------|-----------|
| [nome] | [qtd] | [R$] | [...] | [...] |
| [nome] | [qtd] | [R$] | [...] | [...] |

**Seu diferencial:**
- O que fará 10x melhor: [específico]
- Nicho não atendido: [qual]
- Tecnologia diferente: [qual vantagem]

**Barreira de entrada:**
- Difícil copiar? [por quê]
- Network effects? [sim/não]
- Dados proprietários? [sim/não]

**3. DEFINIÇÃO DE MVP**

❌ Não faça primeiro:
- [feature complexa que pode esperar]
- [nice-to-have]
- [...]

✅ MVP mínimo (80/20):

Fluxo principal:
1. Usuário [ação simples]
2. App [processa]
3. Usuário [recebe resultado]

Funcionalidades MVP:
- Core feature: [descrição]
- Onboarding: [simplicidade]
- Dashboard: [essencial apenas]

Tempo estimado: [semanas]
Custo estimado: R$ [valor]

**4. STACK TECNOLÓGICO**

Frontend:
- Recomendação: [tecnologia]
- Por quê: [razão]

Backend:
- Recomendação: [tecnologia]
- Por quê: [razão]

Banco de dados:
- Recomendação: [tecnologia]

Infraestrutura:
- Hosting: [serviço]
- Custo inicial: R$ [valor]/mês

**5. MODELO DE MONETIZAÇÃO**

Opções para seu app:

**Opção 1: Freemium**
- Free: [limites]
- Pro (R$ [X]/mês): [recursos]
- Enterprise (R$ [X]/mês): [recursos]
Estimativa conversão free→paid: [%]

**Opção 2: Assinatura simples**
- R$ [X]/mês ou R$ [X]/ano (2 meses grátis)
- Trial: [dias]

**Opção 3: Pay-per-use**
- R$ [X] por [unidade]
- Ideal para: [tipo de uso]

**Recomendação:** [qual e por quê]

**Unit Economics:**
- CAC estimado: R$ [valor]
- LTV estimado: R$ [valor]
- LTV:CAC ratio: [calcular]
- Payback period: [meses]

**6. ESTRATÉGIA DE VALIDAÇÃO** (ANTES de desenvolver)

**Semana 1-2: Pesquisa qualitativa**
- Entrevistar 20-30 usuários potenciais
- Perguntas-chave:
  1. Como resolve [problema] hoje?
  2. Quanto custa/tempo gasta?
  3. O que não gosta na solução atual?
  4. Pagaria R$ [X] por [solução]?

**Semana 3: Landing page**
- Criar página explicando o app
- Formulário de interesse (e-mail)
- Botão "Comprar" (não funcional)
- Meta: [X] e-mails ou [X]% conversão

Ferramentas:
- [sugestão de no-code]
- Custo: R$ [valor]

**Semana 4: Tráfego pago teste**
- Investir R$ [valor pequeno]
- Google Ads ou Facebook Ads
- Medir: CPC, conversão, interesse

**Métricas de validação:**
✅ Prosseguir se:
- [X]% clicou em "Comprar"
- [X] pessoas pediram beta
- [X] aceitaram pré-venda

❌ Pivotar/descartar se:
- < [X]% de interesse
- Feedback negativo consistente
- CAC muito alto

**7. ROADMAP DE DESENVOLVIMENTO**

**Fase 1: MVP (meses 1-3)**
- [ ] Funcionalidade core
- [ ] Interface básica
- [ ] Sistema de cadastro
- [ ] Pagamento básico
Meta: Primeiros 10 usuários pagantes

**Fase 2: Product-Market Fit (meses 4-6)**
- [ ] Iterar com feedback
- [ ] Adicionar features críticas
- [ ] Melhorar UX
Meta: 100 usuários, NPS > 50

**Fase 3: Crescimento (meses 7-12)**
- [ ] Automação de marketing
- [ ] Features de retenção
- [ ] Escalar aquisição
Meta: 1000 usuários

**8. TIME E RECURSOS**

**Opção 1: Fazer sozinho**
- Suas habilidades: [listar]
- Precisa aprender: [listar]
- Tempo: [estimativa]
- Custo: R$ [ferramentas]

**Opção 2: Co-founder técnico**
- Perfil ideal: [descrição]
- Equity: [%]
- Onde encontrar: [comunidades]

**Opção 3: Contratar dev**
- Custo MVP: R$ [valor]
- Tempo: [semanas]
- Risco: [alto - dependência]

**Recomendação:** [qual e por quê]

**9. RISCOS PRINCIPAIS**

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Usuários não pagam | [%] | Alto | Pré-venda |
| Concorrente grande | [%] | Alto | Nicho defensável |
| Complexidade técnica | [%] | Médio | MVP simples |
| [...] |

**10. VEREDICTO FINAL**

**Score de viabilidade: [X]/100**

Breakdown:
- Problema claro: [X]/20
- Mercado: [X]/20
- Diferencial: [X]/20
- Viabilidade técnica: [X]/20
- Modelo de negócio: [X]/20

**Recomendação:**
🟢 Prosseguir - [razão]
🟡 Prosseguir com ajustes - [quais]
🔴 Não prosseguir - [razão]

**Próximos passos (se verde/amarelo):**
1. [ação específica]
2. [ação específica]
3. [ação específica]

**Prazo decisão:** [data para validar ou descartar]`,
      variables: [
        {
          name: 'app_name',
          label: 'Nome do app',
          placeholder: 'Ex: TaskMaster Pro',
          type: 'text',
          required: true
        },
        {
          name: 'problem',
          label: 'Problema que resolve',
          placeholder: 'Ex: Freelancers perdem tempo rastreando tarefas',
          type: 'textarea',
          required: true
        },
        {
          name: 'target_users',
          label: 'Público-alvo',
          placeholder: 'Ex: Freelancers e pequenas agências',
          type: 'text',
          required: true
        },
        {
          name: 'features',
          label: 'Principais funcionalidades',
          placeholder: 'Ex: Timer, relatórios, integrações',
          type: 'textarea',
          required: true
        },
        {
          name: 'competitors',
          label: 'Concorrentes conhecidos',
          placeholder: 'Ex: Toggl, Clockify, RescueTime',
          type: 'text',
          required: true
        }
      ],
      examples: [],
      tags: ['app', 'software', 'validação', 'mvp', 'startup', 'saas'],
      difficulty: 'advanced',
      isPremium: true,
      usageCount: 0
    }
    // ... mais 48 prompts de criação de produtos
  ]
};
