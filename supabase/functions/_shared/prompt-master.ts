// supabase/functions/_shared/prompt-master.ts
// ============================================================
// PROMPT MASTER V10 — System prompts para edge functions
// Cada edge function importa apenas a parte que precisa.
// ============================================================

// ---- BLOCO COMPARTILHADO (usado por todas) ----

const REGRA_ZERO = `
A IA NÃO INVENTA. A IA REPLICA.
Você conhece as interfaces das ferramentas. Use esse conhecimento pra replicar telas reais — campos reais, botões reais, cores reais, URLs reais.
Se não conhece uma ferramenta, diga "NÃO CONHEÇO" e bloqueie. NUNCA invente interface.
`;

const TABELA_FERRAMENTAS = `
TABELA DE FERRAMENTAS CONHECIDAS:
| Ferramenta | Cor | Ícone | URL | Signup | Dashboard |
|-----------|-----|-------|-----|--------|-----------|
| Make.com | #6366F1 | 🌐 | make.com | Email+Senha+"Sign up with email"+"Continue with Google" | Botão "Create a new scenario" central |
| Bland AI | #1E293B | 📞 | app.bland.ai | Email+Senha+"Create Account" | Sidebar: Home, Settings, API Keys |
| Google Sheets | #0F9D58 | 📊 | sheets.google.com | Login Google | Grid com colunas A-Z, abas na base |
| Google Forms | #7C3AED | 📝 | docs.google.com/forms | Login Google | Barra roxa topo, campos empilhados |
| Calendly | #006BFF | 📅 | calendly.com | "Enter your email"+"Full name"+"Password"+"Get Started"+"Sign up with Google/Microsoft" | Event Types listados, sidebar esquerda |
| OpenAI Platform | #10A37F | 🤖 | platform.openai.com | Login via auth0 | Sidebar escura: Playground, API Keys, Usage, Settings |
| Zapier | #FF4A00 | ⚡ | zapier.com | Email+"Get started free"+"Continue with Google" | Dashboard com "Create Zap" |
| n8n | #EA4B71 | 🔄 | n8n.io | Email+Senha+"Sign up" | Canvas com "+" central |
| Stripe | #635BFF | 💳 | dashboard.stripe.com | Email+"Continue"+"Sign up with Google" | Dashboard com Payments, Customers |
| WhatsApp Business | #25D366 | 💬 | business.whatsapp.com | Número+verificação | Conversas, catálogo, configurações |
| AILIV (último passo) | #6366F1 | 🎓 | — | — | Usado APENAS no último passo (celebração) |

Se a ferramenta NÃO está nesta tabela:
1. Use seu conhecimento próprio (confiável pra ferramentas populares)
2. Marque "unverified_tool": true no output pra Fernando revisar
3. Se genuinamente NÃO conhece a ferramenta → bloqueie com "FERRAMENTA DESCONHECIDA"
`;

// ---- 15 TYPES DO FRAMERENDERER ----

const FRAME_TYPES = `
Os 15 types disponíveis para elements dos frames:
| type | Quando usar |
|------|------------|
| chrome_header | SEMPRE primeiro — barra do navegador com URL real |
| text | Título ou instrução dentro da tela |
| input | Campo de formulário (highlight=true no campo ativo) |
| select | Dropdown com opções |
| button | Botão de ação (primary=true pro principal) |
| table | Tabela de dados (API keys, lista de items) |
| code_block | Bloco de código (JSON, curl, etc) |
| warning | Aviso ANTES da ação — risco concreto |
| nav_breadcrumb | Navegação entre telas — de onde → pra onde → como |
| dependency | Referência a passo anterior — "usando X do passo N" |
| celebration | Micro-celebração — após teste/criação/conexão |
| tooltip_term | Termo técnico — com tradução simples |
| image | Imagem externa (RARO — só se Refero retornou screenshot) |
| divider | Separador visual entre seções do mockup |
| shimmer | Placeholder animado (campos desabilitados/irrelevantes) |
`;

// ============================================================
// SYSTEM PROMPT 1: v10-generate-steps
// ============================================================

export const PROMPT_GENERATE_STEPS = `
${REGRA_ZERO}

${TABELA_FERRAMENTAS}

FASE 1: ANÁLISE DA AUTOMAÇÃO

1.1 Validar ferramentas
Para cada ferramenta declarada no input, confirmar na tabela: cor, ícone, URL.

1.2 Identificar fluxo real
Identificar como as ferramentas se conectam. Usar APENAS as ferramentas declaradas. NÃO adicionar extras.

1.3 Verificar necessidade de intermediária
Se a conexão requer ferramenta intermediária (ex: endpoint pra receber webhook):
NÃO adicionar silenciosamente. Retornar:
{
  "status": "INTERMEDIARY_NEEDED",
  "reason": "motivo",
  "options": [
    {"tool": "Make.com", "complexity": "baixa", "desc": "HTTP module recebe webhook"},
    {"tool": "n8n", "complexity": "baixa", "desc": "Webhook trigger nativo"},
    {"tool": "Servidor próprio", "complexity": "alta", "desc": "Endpoint Express/Flask"}
  ]
}
O pipeline para até Fernando aprovar. SEM aprovação → NÃO gerar passos com ferramenta extra.

FASE 2: DEFINIÇÃO DOS PASSOS

REGRAS OBRIGATÓRIAS:

R1 — Só ferramentas declaradas (+ aprovadas via intermediária).

R2 — 1 passo = 1 ação atômica. "Criar conta e configurar evento" são 2 passos.

R3 — Frames por complexidade:
  1 frame = PADRÃO (78% dos passos na aula de referência)
  2 frames = EXCEÇÃO: navegação entre telas distantes
  3 frames = RARO: fluxo com 3+ telas distintas
  Média esperada: ~1.3 frames/passo. Se média > 1.5 → erro.

R4 — Dependency em TODO passo que usa resultado de passo anterior. Não só passos >5. Dado real: 85% dos passos precisam.

R5 — Celebration APENAS em:
  - Conta criada com sucesso
  - Teste/verificação bem-sucedida
  - Conexão entre ferramentas confirmada
  - Último passo (sempre)
  Total esperado: 3-5 celebrations por aula. NÃO em passos de configuração intermediária.

R6 — Warning quando existe risco CONCRETO:
  - Opção parecida que confunde (ex: "Make a request" vs "API Key Auth request")
  - Valor case-sensitive
  - Janela/modal pode ser fechada acidentalmente
  - Valor truncado na interface
  - Formato específico necessário (ex: +55 DDD)
  - Limitação do plano gratuito
  NÃO criar warning genérico. Todo warning = risco concreto.

R7 — 3 fases obrigatórias, adaptadas ao tipo:
  TIPO A (automação multi-ferramenta): Setup → Construção → Teste
  TIPO B (tutorial ferramenta única): Conceitos → Prática → Aplicação
  TIPO C (aula conceitual): Fundamentos → Exemplos → Exercícios
  Declarar lesson_type: "automation" | "tutorial" | "conceptual"

R8 — Último passo SEMPRE celebração: app_name="AILIV", app_icon="🎓", sem mockup de ferramenta.

R9 — Contrato pedagógico C1-C9:
  C1: description > 30 caracteres (contexto)
  C2: termos técnicos com tooltip_term
  C3: mudança de tela com nav_breadcrumb
  C4: mudança de app mencionada explicitamente
  C5: referências a passos anteriores com dependency
  C6: frame tem action E check
  C7: warnings ANTES da ação
  C8: milestones têm celebration
  C9: termos obrigatórios com tooltip_term

FORMATO DE SAÍDA POR PASSO:
{
  "step_number": 1,
  "title": "Criar conta no Calendly",
  "app_name": "Calendly",
  "app_icon": "📅",
  "phase": 1,
  "lesson_type": "automation",
  "duration_seconds": 45,
  "description": "O Calendly é a ferramenta de agendamento...",
  "frames": [{ "bar_text": "calendly.com", "bar_sub": "Sign up", "bar_color": "#006BFF", "elements": [{"type": "chrome_header", "url": "calendly.com/signup"}], "action": "...", "check": "..." }],
  "liv": { "tip": "...", "analogy": "...", "sos": "..." },
  "warnings": { "warn": "..." , "ift": null },
  "narration_script": ""
}

MÉTRICAS DE REFERÊNCIA (aula SDR de Voz — 27 passos):
| Métrica | Valor |
|---------|-------|
| Passos 1 frame | 78% |
| Passos 2 frames | 19% |
| Passos 3 frames | 4% |
| Warnings | 59% dos passos |
| Celebrations | 4 (15%) |
| Dependencies | 85% dos passos |
| Nav breadcrumbs | 37% dos passos |
| Tooltip terms | 20 no total |
| Ferramentas | 4 |
| Fases | 3 |
`;

// ============================================================
// SYSTEM PROMPT 2: v10-enrich-frames
// ============================================================

export const PROMPT_ENRICH_FRAMES = `
${REGRA_ZERO}

${TABELA_FERRAMENTAS}

${FRAME_TYPES}

SUA TAREFA: Enriquecer os frames JSON dos passos de uma aula V10.

Você recebe passos com frames básicos (poucos elements). Deve enriquecer cada frame pra que o mockup renderizado pareça a interface REAL do app.

REGRAS:
1. Todo frame DEVE ter como primeiro element: {"type": "chrome_header", "url": "url.real.do.app"}
2. Todo frame DEVE ter bar_text (URL), bar_sub (descrição da tela), bar_color (cor da tabela)
3. Todo frame DEVE ter campo "action" preenchido (texto do que fazer)
4. Todo frame DEVE ter campo "check" preenchido (como saber que deu certo)
5. Usar as cores REAIS do app (da tabela). Botão primary = cor do app.
6. Campos e botões devem ter os textos REAIS da interface do app.
7. NUNCA gerar diagrama ou fluxo. Mockup = tela de interface com campos e botões.
8. Usar highlight=true APENAS no campo/botão principal da ação.

EXEMPLO COMPLETO DE FRAME ENRIQUECIDO (Calendly signup):
{
  "bar_text": "calendly.com",
  "bar_sub": "Sign up",
  "bar_color": "#006BFF",
  "elements": [
    {"type": "chrome_header", "url": "calendly.com/signup"},
    {"type": "text", "content": "Sign up with Calendly for free"},
    {"type": "input", "label": "Enter your email to get started", "placeholder": "seu@email.com", "highlight": true},
    {"type": "input", "label": "Enter your full name", "placeholder": "Seu nome completo", "highlight": false},
    {"type": "input", "label": "Choose a password", "placeholder": "Mínimo 8 caracteres", "highlight": false},
    {"type": "button", "label": "Get Started", "primary": true},
    {"type": "divider"},
    {"type": "button", "label": "Sign up with Google", "primary": false, "icon": "G"},
    {"type": "button", "label": "Sign up with Microsoft", "primary": false, "icon": "M"}
  ],
  "tip": {"text": "Use o email do Google pra facilitar integração", "position": "bottom"},
  "action": "Acesse calendly.com/signup. Preencha email, nome e senha. Clique em Get Started.",
  "check": "Você vê o Dashboard do Calendly com a lista de Event Types."
}

EXEMPLO — OpenAI API Keys:
{
  "bar_text": "platform.openai.com",
  "bar_sub": "API Keys",
  "bar_color": "#10A37F",
  "elements": [
    {"type": "chrome_header", "url": "platform.openai.com/api-keys"},
    {"type": "nav_breadcrumb", "from": "Dashboard", "to": "API Keys", "how": "Sidebar esquerda → API Keys"},
    {"type": "tooltip_term", "term": "API Key", "tip": "Senha de acesso à API — sem ela, nenhum app se conecta"},
    {"type": "table", "headers": ["Name", "Key", "Created"], "rows": [["Default", "sk-proj-abc...xyz ← truncada!", "Mar 15, 2026"]]},
    {"type": "warning", "text": "A key aparece truncada na tabela. Crie uma nova pra copiar completa."},
    {"type": "button", "label": "+ Create new secret key", "primary": true}
  ],
  "tip": {"text": "Copie a key ANTES de fechar o modal. Depois não aparece mais.", "position": "bottom"},
  "action": "Clique em '+ Create new secret key'. No modal, dê um nome e clique Create. COPIE a key imediatamente.",
  "check": "Você tem a API Key completa salva (começa com 'sk-proj-')."
}

EXEMPLO — Make.com editor de cenário:
{
  "bar_text": "make.com",
  "bar_sub": "Editor de cenário",
  "bar_color": "#6366F1",
  "elements": [
    {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
    {"type": "dependency", "text": "Usando o cenário que você criou no passo 8."},
    {"type": "text", "content": "Adicionar módulo Google Sheets"},
    {"type": "nav_breadcrumb", "from": "Cenário vazio", "to": "Buscar módulo", "how": "Clique no + no centro → Digite 'Google Sheets' na busca"},
    {"type": "button", "label": "+ Adicionar módulo", "primary": true, "icon": "➕"}
  ],
  "action": "Clique no + no centro do editor e busque 'Google Sheets'. Selecione 'Watch New Rows'.",
  "check": "O módulo Watch New Rows aparece como um círculo no editor."
}

EXEMPLO — Google Sheets com dados:
{
  "bar_text": "sheets.google.com",
  "bar_sub": "SDR Leads",
  "bar_color": "#0F9D58",
  "elements": [
    {"type": "chrome_header", "url": "sheets.google.com/spreadsheets/d/abc123"},
    {"type": "dependency", "text": "Verificando a planilha do passo 3 + o teste do passo 6."},
    {"type": "table", "headers": ["Timestamp", "Nome", "Telefone", "Email", "Interesse", "Consentimento"], "rows": [["13/03 14:30", "Maria Teste", "27999887766", "teste@email.com", "Saber mais", "Aceito"]]},
    {"type": "celebration", "text": "Formulário → Planilha funcionando!", "next": "Agora vamos criar a automação no Make."}
  ],
  "action": "Abra a planilha SDR Leads. Clique na aba 'Form Responses 1' (não Sheet1).",
  "check": "Os dados de teste aparecem na planilha com todos os campos preenchidos."
}

EXEMPLO — Configuração HTTP com JSON:
{
  "bar_text": "make.com",
  "bar_sub": "Módulo HTTP",
  "bar_color": "#6366F1",
  "elements": [
    {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
    {"type": "dependency", "text": "A URL é do Bland AI (conta do passo 2)."},
    {"type": "input", "label": "URL", "value": "https://api.bland.ai/v1/calls", "highlight": true},
    {"type": "select", "label": "Method", "options": ["GET", "POST", "PUT"], "selected": 1, "highlight": true},
    {"type": "select", "label": "Body type", "options": ["Raw", "Form data", "Multipart"], "selected": 0},
    {"type": "select", "label": "Content type", "options": ["JSON (application/json)", "XML", "Text"], "selected": 0},
    {"type": "code_block", "language": "json", "content": "{\\n  \\"phone_number\\": \\"+5527999887766\\",\\n  \\"task\\": \\"Ligar para o lead...\\",\\n  \\"language\\": \\"pt\\",\\n  \\"voice\\": \\"June\\",\\n  \\"max_duration\\": 5\\n}"}
  ],
  "action": "Em URL cole https://api.bland.ai/v1/calls. Em Method selecione POST.",
  "check": "URL preenchida e método é POST."
}

Retorne APENAS o JSON dos passos com frames enriquecidos. Sem explicação.
`;

// ============================================================
// SYSTEM PROMPT 3: v10-generate-narration
// ============================================================

export const PROMPT_GENERATE_NARRATION = `
Gere o script de narração para cada passo de uma aula V10 da AILIV.

ESTRUTURA POR PASSO:
1. CONTEXTO (o que é + por que) — 2-3 frases
2. AÇÃO (o que fazer) — 1-2 frases (mesmo conteúdo do campo 'action' do frame, parafraseado)
3. [ANCHOR:pontos_atencao] "Agora, os pontos de atenção desse passo:" — SÓ se tem warnings ou dicas críticas
4. DICAS + WARNINGS narrados — 1-3 itens
5. [ANCHOR:confirmacao] "Deu certo se..." — 1 frase (mesmo conteúdo do campo 'check' do frame)

REGRAS DE ANCHORS:
- [ANCHOR:confirmacao] em TODO passo (exceto último)
- [ANCHOR:pontos_atencao] em passos que têm warnings ou dicas críticas
- [ANCHOR:troca_ferramenta] quando muda de app (ex: "Agora mudamos de ferramenta")
- [ANCHOR:troca_frame] em passos multi-frame, quando narração avança pra próxima tela
- Tags [ANCHOR:*] são REMOVIDAS antes de enviar pro ElevenLabs
- A frase IMEDIATAMENTE APÓS a tag é usada pro match de timestamp

REGRAS DE CONTEÚDO:
- "Agora, os pontos de atenção desse passo:" é frase padronizada (marca registrada da LIV)
- "Deu certo se" é frase padronizada
- NUNCA mencionar ferramenta que não foi declarada no BPA
- Tom: amigável, seguro, paciente. Linguagem de 6ª série.
- 20-40 segundos por passo
- Narração do campo 'action' pode ser parafraseada (não exige match exato com o frame)
- Narração do campo 'check' deve começar com "Deu certo se" (pode parafrasear o resto)

EXEMPLO (Passo 1 da aula SDR de Voz):

O Make.com é a ferramenta que vai conectar tudo na sua automação. Pense nele como o cérebro do sistema: quando entra um lead novo, o Make decide o que fazer.

Acesse make.com e crie sua conta gratuita.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Use o mesmo email que usa no Google — vai facilitar na hora de conectar as ferramentas depois. Na hora do cadastro, vai aparecer uma tela pedindo pra escolher a região. Escolha US, não Europe. E se aparecerem perguntas de onboarding, pode pular tudo até chegar no Dashboard.

[ANCHOR:confirmacao]
Deu certo se você vê o Dashboard do Make com o botão Create a new scenario no centro.

Retorne o narration_script completo para cada passo, com todas as tags [ANCHOR:*] inseridas.
`;

// ============================================================
// VALIDAÇÕES V1-V5 (usadas pelo assembly-check e validações intermediárias)
// ============================================================

export interface ValidationResult {
  passed: boolean;
  errors: string[];
}

// ============================================================
// POST-PROCESSING UTILITIES (shared between edge functions)
// ============================================================

const TECH_TERMS: Record<string, string> = {
  "api": "Interface que permite dois softwares se comunicarem automaticamente",
  "webhook": "URL que recebe dados automaticamente quando um evento acontece",
  "endpoint": "Endereço (URL) específico onde uma API recebe requisições",
  "sdk": "Kit de ferramentas de desenvolvimento para integrar com um serviço",
  "oauth": "Protocolo de autorização que permite login seguro sem compartilhar senha",
  "token": "Código temporário usado para autenticar acessos a um serviço",
  "dashboard": "Painel de controle visual com métricas e ações principais",
  "workflow": "Sequência automatizada de tarefas que executa em ordem",
  "trigger": "Evento que dispara uma automação automaticamente",
  "integration": "Conexão entre dois apps que permite troca de dados",
  "pipeline": "Sequência de etapas de processamento de dados em ordem",
  "deploy": "Processo de publicar e disponibilizar um app ou atualização",
  "slug": "Versão simplificada de um texto usada em URLs (sem espaços ou acentos)",
  "json": "Formato padrão de troca de dados entre sistemas (chave: valor)",
  "http": "Protocolo de comunicação usado na web para enviar e receber dados",
  "url": "Endereço único que identifica uma página ou recurso na internet",
  "script": "Código que executa uma sequência de comandos automaticamente",
  "template": "Modelo pré-pronto que serve como base para criar algo novo",
  "scenario": "Automação no Make.com que conecta apps com regras definidas",
  "module": "Bloco funcional dentro de uma automação que executa uma tarefa",
  "node": "Ponto de processamento em um fluxo de automação",
  "zap": "Automação no Zapier que conecta dois ou mais apps",
  "prompt": "Instrução de texto enviada para uma IA gerar uma resposta",
  "model": "Versão treinada de uma IA (ex: GPT-4, Claude, Gemini)",
  "automation": "Processo que executa tarefas sem intervenção humana",
  "crm": "Sistema para gerenciar relacionamento com clientes",
  "lead": "Potencial cliente que demonstrou interesse no produto/serviço",
  "api key": "Chave secreta usada para autenticar acessos a uma API",
  "secret key": "Chave privada que nunca deve ser compartilhada publicamente",
  "csv": "Formato de arquivo com dados separados por vírgula",
  "bot": "Programa automatizado que executa tarefas repetitivas",
  "chatbot": "Bot conversacional que responde perguntas automaticamente",
  "ai": "Inteligência Artificial — sistema que simula raciocínio humano",
  "gpt": "Modelo de linguagem da OpenAI usado para gerar texto",
  "llm": "Modelo de linguagem grande — IA treinada em enormes volumes de texto",
  "stripe": "Plataforma de pagamentos online para cobrar clientes",
  "calendly": "Ferramenta de agendamento online que sincroniza com seu calendário",
  "bland ai": "Plataforma de IA para ligações telefônicas automatizadas",
  "make": "Plataforma de automação visual que conecta apps (antigo Integromat)",
  "zapier": "Plataforma de automação que conecta apps sem código",
  "n8n": "Plataforma open-source de automação de workflows",
  "google sheets": "Planilha online do Google com colaboração em tempo real",
  "google forms": "Ferramenta do Google para criar formulários online",
};

const TOOL_COLORS: Record<string, string> = {
  "Make": "#6366F1",
  "Make.com": "#6366F1",
  "Bland AI": "#1E293B",
  "Google Sheets": "#0F9D58",
  "Sheets": "#0F9D58",
  "Google Forms": "#7C3AED",
  "Forms": "#7C3AED",
  "Calendly": "#006BFF",
  "OpenAI": "#10A37F",
  "OpenAI ChatGPT": "#10A37F",
  "OpenAI Platform": "#10A37F",
  "Zapier": "#FF4A00",
  "n8n": "#EA4B71",
  "Stripe": "#635BFF",
  "WhatsApp Business": "#25D366",
  "WhatsApp": "#25D366",
  "AILIV": "#6366F1",
};

export function postProcessC2C3(steps: any[]): { c2Fixes: number; c3Fixes: number } {
  let c2Fixes = 0;
  let c3Fixes = 0;
  const commonWords = new Set(["Voce", "Esse", "Este", "Esta", "Essa", "Aqui", "Agora", "Depois", "Antes", "Clique", "Acesse", "Configure", "Crie", "Abra", "Vamos", "Nesse", "Nesta", "Para", "Como", "Quando", "Onde", "Qual", "Cada", "Todo", "Toda", "Todos"]);

  for (const step of steps) {
    const desc = (step.description || "").toLowerCase();
    const title = (step.title || "").toLowerCase();
    const combinedText = `${title} ${desc}`;
    const frames = step.frames || [];
    const allElements = frames.flatMap((f: any) => f.elements || []);

    // C2: tooltip_term injection
    const hasTooltipTerm = allElements.some((el: any) => el.type === "tooltip_term");
    if (!hasTooltipTerm && (step.description || "").length > 50) {
      const matchedTerms: Array<{ term: string; definition: string }> = [];
      for (const [term, definition] of Object.entries(TECH_TERMS)) {
        const termRegex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "i");
        if (termRegex.test(combinedText)) {
          matchedTerms.push({ term: term.charAt(0).toUpperCase() + term.slice(1), definition });
        }
        if (matchedTerms.length >= 2) break;
      }
      if (matchedTerms.length === 0) {
        const capitalWords = (step.description || "").match(/\b[A-Z][a-zA-Z]{2,}\b/g);
        if (capitalWords) {
          for (const w of capitalWords) {
            if (!commonWords.has(w) && w.length >= 3) {
              matchedTerms.push({ term: w, definition: `Funcionalidade ou conceito utilizado neste passo da aula` });
              break;
            }
          }
        }
      }
      if (matchedTerms.length > 0 && frames.length > 0) {
        if (!frames[0].elements) frames[0].elements = [];
        for (const mt of matchedTerms) {
          frames[0].elements.push({ type: "tooltip_term", term: mt.term, tip: mt.definition });
        }
        c2Fixes++;
      }
    }

    // C3: nav_breadcrumb injection
    const hasNavBreadcrumb = allElements.some((el: any) => el.type === "nav_breadcrumb");
    const barSubValues = frames.map((f: any) => f.bar_sub).filter(Boolean);
    const barSubChanges = new Set(barSubValues).size > 1;
    if (barSubChanges && !hasNavBreadcrumb) {
      for (let fi = 1; fi < frames.length; fi++) {
        const prevSub = frames[fi - 1].bar_sub;
        const currSub = frames[fi].bar_sub;
        if (currSub && prevSub && currSub !== prevSub) {
          if (!frames[fi].elements) frames[fi].elements = [];
          const pathSoFar: string[] = [];
          const seen = new Set<string>();
          for (let pi = 0; pi <= fi; pi++) {
            const sub = frames[pi].bar_sub;
            if (sub && !seen.has(sub)) { seen.add(sub); pathSoFar.push(sub); }
          }
          frames[fi].elements.unshift({ type: "nav_breadcrumb", from: prevSub, to: currSub, how: pathSoFar.join(" → ") });
        }
      }
      c3Fixes++;
    }
  }
  return { c2Fixes, c3Fixes };
}

export function postProcessFrameDefaults(steps: any[]): void {
  for (const step of steps) {
    const frames = step.frames || [];
    const toolColor = TOOL_COLORS[step.app_name] || null;

    for (const frame of frames) {
      // Ensure bar_color comes from TOOL_TABLE when available
      if (toolColor && (!frame.bar_color || frame.bar_color === "#6366F1")) {
        frame.bar_color = toolColor;
      }
      // Ensure chrome_header is first element
      if (frame.elements?.length > 0 && frame.elements[0].type !== 'chrome_header') {
        const chromeIdx = frame.elements.findIndex((e: any) => e.type === 'chrome_header');
        if (chromeIdx > 0) {
          const [chrome] = frame.elements.splice(chromeIdx, 1);
          frame.elements.unshift(chrome);
        }
      }
      // Ensure action and check are never empty strings
      if (frame.action === '') frame.action = null;
      if (frame.check === '') frame.check = null;
    }
  }
}

export function validateTools(steps: any[], declaredTools: string[]): ValidationResult {
  const errors: string[] = [];
  for (const step of steps) {
    if (!declaredTools.includes(step.app_name) && step.app_name !== 'AILIV') {
      errors.push(
        `BLOQUEADO: Passo ${step.step_number} usa "${step.app_name}" que NÃO está nas ferramentas declaradas: [${declaredTools.join(', ')}]`
      );
    }
  }
  return { passed: errors.length === 0, errors };
}

export function validateFrames(steps: any[]): ValidationResult {
  const errors: string[] = [];
  for (const step of steps) {
    if (!step.frames || step.frames.length === 0) {
      errors.push(`Passo ${step.step_number}: 0 frames (mínimo 1)`);
      continue;
    }
    for (const [i, frame] of step.frames.entries()) {
      if (!frame.elements?.[0] || frame.elements[0].type !== 'chrome_header') {
        errors.push(`Passo ${step.step_number} Frame ${i+1}: primeiro element NÃO é chrome_header`);
      }
      if (!frame.bar_text) {
        errors.push(`Passo ${step.step_number} Frame ${i+1}: bar_text vazio`);
      }
      if (!frame.bar_color) {
        errors.push(`Passo ${step.step_number} Frame ${i+1}: bar_color vazio`);
      }
      if (!frame.action) {
        errors.push(`Passo ${step.step_number} Frame ${i+1}: campo 'action' vazio — LIVSheet vai mostrar item desabilitado`);
      }
      if (!frame.check) {
        errors.push(`Passo ${step.step_number} Frame ${i+1}: campo 'check' vazio — LIVSheet vai mostrar item desabilitado`);
      }
    }
  }
  const totalFrames = steps.reduce((sum: number, s: any) => sum + (s.frames?.length || 0), 0);
  const avg = totalFrames / steps.length;
  if (avg > 1.5) {
    errors.push(`Média de frames/passo = ${avg.toFixed(2)} (máximo 1.5). Frames excessivos.`);
  }
  return { passed: errors.length === 0, errors };
}

export function validateStructure(steps: any[]): ValidationResult {
  const errors: string[] = [];

  const phases = new Set(steps.map((s: any) => s.phase_number));
  if (phases.size !== 3) {
    errors.push(`${phases.size} fases detectadas (obrigatório 3)`);
  }

  const lastStep = steps[steps.length - 1];
  if (lastStep.app_name !== 'AILIV') {
    errors.push(`Último passo: app_name="${lastStep.app_name}" (deve ser "AILIV")`);
  }

  const celebCount = steps.filter((s: any) =>
    s.frames?.some((f: any) => f.elements?.some((e: any) => e.type === 'celebration'))
  ).length;
  if (celebCount < 3 || celebCount > 5) {
    errors.push(`${celebCount} celebrations (esperado 3-5)`);
  }

  const firstHasCeleb = steps[0]?.frames?.some((f: any) =>
    f.elements?.some((e: any) => e.type === 'celebration')
  );
  if (firstHasCeleb) {
    errors.push('Primeiro passo tem celebration (não deveria)');
  }

  const lastHasCeleb = lastStep?.frames?.some((f: any) =>
    f.elements?.some((e: any) => e.type === 'celebration')
  );
  if (!lastHasCeleb) {
    errors.push('Último passo NÃO tem celebration (deveria)');
  }

  const stepsWithDep = steps.slice(1).filter((s: any) =>
    s.frames?.some((f: any) => f.elements?.some((e: any) => e.type === 'dependency'))
  ).length;
  const depRatio = steps.length > 1 ? stepsWithDep / (steps.length - 1) : 1;
  if (depRatio < 0.8) {
    errors.push(`${(depRatio * 100).toFixed(0)}% dos passos têm dependency (mínimo 80%)`);
  }

  return { passed: errors.length === 0, errors };
}

export function validateNarration(steps: any[]): ValidationResult {
  const errors: string[] = [];
  for (const step of steps) {
    const script = step.narration_script || '';
    if (step.step_number < steps.length && !script.includes('[ANCHOR:confirmacao]')) {
      errors.push(`Passo ${step.step_number}: narração sem [ANCHOR:confirmacao]`);
    }
    if (step.warnings?.warn && !script.includes('[ANCHOR:pontos_atencao]')) {
      errors.push(`Passo ${step.step_number}: tem warnings mas narração sem [ANCHOR:pontos_atencao]`);
    }
    if (step.step_number < steps.length && !script.includes('Deu certo se')) {
      errors.push(`Passo ${step.step_number}: narração sem "Deu certo se"`);
    }
  }
  return { passed: errors.length === 0, errors };
}

export function validateAll(steps: any[], declaredTools: string[]): ValidationResult {
  const results = [
    validateTools(steps, declaredTools),
    validateFrames(steps),
    validateStructure(steps),
    validateNarration(steps),
  ];
  return {
    passed: results.every(r => r.passed),
    errors: results.flatMap(r => r.errors),
  };
}
