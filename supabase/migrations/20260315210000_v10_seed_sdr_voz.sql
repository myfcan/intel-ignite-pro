-- ============================================================
-- AILIV V10 — SEED: BPA "SDR de Voz com IA" (27 passos)
-- Migration: 20260315210000_v10_seed_sdr_voz.sql
-- Data: 15/03/2026
-- Fonte: bpa-v10-sdr-completo.html (protótipo funcional)
-- Descrição: Popula a aula SDR de Voz completa para produção
-- ============================================================

-- Fixed UUIDs
-- Lesson:   b0000001-0001-4000-8000-000000000001
-- Pipeline: b0000001-0001-4000-8000-000000000002

-- ============================================================
-- 1. v10_lessons
-- ============================================================
INSERT INTO v10_lessons (id, slug, title, description, trail_id, order_in_trail, total_steps, estimated_minutes, tools, badge_icon, badge_name, xp_reward, status)
VALUES (
  'b0000001-0001-4000-8000-000000000001',
  'sdr-voz-ia',
  'SDR de Voz com IA',
  'Construa um sistema que liga automaticamente para leads usando Make.com, Bland AI e Google Sheets. Do formulário à ligação em 27 passos.',
  NULL, 1, 27, 13,
  ARRAY['Make.com', 'Bland AI', 'Google Sheets', 'Google Forms'],
  '📞', 'SDR Builder', 200, 'published'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. v10_lesson_intro_slides (6 slides)
-- ============================================================
INSERT INTO v10_lesson_intro_slides (lesson_id, slide_order, icon, tool_name, tool_color, title, subtitle, appear_at_seconds)
VALUES
  ('b0000001-0001-4000-8000-000000000001', 1, '📞', 'SDR de Voz', '#6366F1', 'SDR de Voz com IA', 'Crie um sistema que liga automaticamente para seus leads', 0),
  ('b0000001-0001-4000-8000-000000000001', 2, '🌐', 'Make.com', '#6366F1', 'Automação com Make', 'Conecte formulário, planilha e telefone sem código', 15),
  ('b0000001-0001-4000-8000-000000000001', 3, '📞', 'Bland AI', '#475569', 'Ligação com IA', 'Um agente de voz que conversa naturalmente por telefone', 35),
  ('b0000001-0001-4000-8000-000000000001', 4, '📊', 'Google Sheets', '#059669', 'Planilha inteligente', 'Organiza seus leads e atualiza o status automaticamente', 55),
  ('b0000001-0001-4000-8000-000000000001', 5, '📝', 'Google Forms', '#7C3AED', 'Formulário de captação', 'Porta de entrada dos leads com consentimento LGPD', 75),
  ('b0000001-0001-4000-8000-000000000001', 6, '🎯', NULL, '#6366F1', 'Pronto para construir?', '27 passos, 13 minutos, 1 SDR completo', 95)
ON CONFLICT (lesson_id, slide_order) DO NOTHING;

-- ============================================================
-- 3. v10_lesson_narrations (Part A + Part C)
-- ============================================================
INSERT INTO v10_lesson_narrations (lesson_id, part, script_text, duration_seconds, audio_url)
VALUES
  ('b0000001-0001-4000-8000-000000000001', 'A',
   'Bem-vindo à aula mais prática da plataforma! Nos próximos treze minutos, você vai construir um SDR de Voz com Inteligência Artificial. Isso significa que, no final desta aula, quando alguém preencher um formulário no seu site, o sistema vai ligar automaticamente para essa pessoa, ter uma conversa natural e qualificar o lead para você. Sem você precisar fazer nada. Vamos usar quatro ferramentas: o Make ponto com para conectar tudo, o Bland AI para fazer as ligações com IA, o Google Sheets para organizar os leads, e o Google Forms para captar os contatos. Tudo gratuito para começar. São vinte e sete passos divididos em três fases: primeiro criamos as contas e preparamos os dados, depois montamos a automação no Make, e por último testamos tudo com uma ligação real pro seu celular. Cada passo é visual, você vai ver exatamente onde clicar e o que digitar. E a LIV está aqui para ajudar se precisar. Vamos começar!',
   112, NULL),
  ('b0000001-0001-4000-8000-000000000001', 'C',
   'Parabéns! Você acabou de construir algo incrível: um SDR de Voz com Inteligência Artificial. Vamos recapitular o que você conquistou. Você criou um formulário de captação de leads com consentimento LGPD. Montou uma planilha que organiza todos os contatos automaticamente. Construiu uma automação no Make que conecta tudo: formulário, planilha e telefone. Configurou um agente de IA que liga e conversa naturalmente com seus leads. E testou tudo de ponta a ponta com uma ligação real. Esse sistema agora funciona sozinho, vinte e quatro horas por dia. Enquanto você dorme, ele está trabalhando. O próximo desafio? Personalizar o script do agente com o tom da sua empresa. Continue praticando e até a próxima aula!',
   68, NULL)
ON CONFLICT (lesson_id, part) DO NOTHING;

-- ============================================================
-- 4. v10_lesson_steps (27 steps)
-- ============================================================

-- Step 1: Criar conta no Make.com (Phase 1 - Preparação)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 1, 'criar-conta-make',
  'Criar conta no Make.com',
  'O Make.com (plataforma que conecta apps entre si) é a ferramenta que vai conectar tudo: quando um lead preencher o formulário, o Make dispara a ligação automaticamente.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 45, 4, 1,
  '[
    {
      "bar_text": "make.com", "bar_sub": "Página inicial", "bar_color": "#6366F1",
      "elements": [
        {"type": "chrome_header", "url": "make.com/en/register"},
        {"type": "text", "content": "Crie sua conta gratuita no Make.com"},
        {"type": "input", "label": "Email", "placeholder": "seu@email.com", "highlight": true},
        {"type": "input", "label": "Senha", "placeholder": "Mínimo 8 caracteres", "highlight": false},
        {"type": "button", "label": "Sign up with email", "primary": true},
        {"type": "divider"},
        {"type": "button", "label": "Continue with Google", "primary": false}
      ],
      "tip": {"text": "Use o mesmo email que usa no Google — vai facilitar na hora de conectar", "position": "bottom"},
      "action": "Acesse make.com e clique em Sign up. Use seu email do Google para facilitar.",
      "check": null
    },
    {
      "bar_text": "make.com", "bar_sub": "Onboarding", "bar_color": "#6366F1",
      "elements": [
        {"type": "chrome_header", "url": "make.com/onboarding"},
        {"type": "text", "content": "O Make vai fazer várias perguntas de personalização."},
        {"type": "warning", "text": "O Make vai fazer várias perguntas. Não importa o que responder — clique Skip ou X em tudo até chegar no Dashboard."},
        {"type": "button", "label": "Skip", "primary": false},
        {"type": "button", "label": "Continue", "primary": true}
      ],
      "tip": {"text": "Skip, Skip, Skip — ignore tudo até ver o Dashboard", "position": "top"},
      "action": "Pule todas as perguntas do onboarding. Clique Skip ou X até chegar no Dashboard.",
      "check": "Você vê o Dashboard do Make com o botão Create a new scenario."
    }
  ]'::jsonb,
  '{"tip": "Nesse passo você cria sua conta no Make.com. É gratuito e leva 2 minutos. Use o email do Google pra facilitar depois.", "analogy": "O Make é tipo uma linha de montagem digital: você programa quando acontecer X, faça Y automaticamente. Tipo: lead preencheu formulário → Make manda ligar pro lead.", "sos": "Se tiver dúvida sobre qual plano escolher: o gratuito já serve. Ele permite 1.000 operações/mês, mais que suficiente pra começar."}'::jsonb,
  '{"warn": "Escolha Hosting Region: US (não Europe). Algumas integrações funcionam melhor na região US.", "ift": {"tag": "SE → ENTÃO", "desc": "Apareceu tela de onboarding com perguntas?", "act": "Clique Skip ou X em tudo até ver o Dashboard."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 2: Criar conta no Bland AI (Phase 1)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 2, 'criar-conta-bland',
  'Criar conta no Bland AI',
  'O Bland AI (plataforma que faz ligações telefônicas usando inteligência artificial) é quem vai ligar pro lead. Ele usa IA pra ter uma conversa natural por telefone e qualificar o contato.',
  'Bland AI', '📞', '#F1F5F9', '#1E293B', '#475569', 60, 7, 1,
  '[
    {
      "bar_text": "bland.ai", "bar_sub": "Sign up", "bar_color": "#1E293B",
      "elements": [
        {"type": "chrome_header", "url": "app.bland.ai/signup"},
        {"type": "text", "content": "Crie sua conta no Bland AI para fazer ligações com IA"},
        {"type": "text", "content": "🔄 Mudamos de ferramenta! Saímos do Make → Entramos no Bland AI. Abra nova aba."},
        {"type": "input", "label": "Email", "placeholder": "seu@email.com", "highlight": true},
        {"type": "input", "label": "Senha", "placeholder": "Crie uma senha", "highlight": false},
        {"type": "button", "label": "Create Account", "primary": true}
      ],
      "tip": {"text": "Use o mesmo email do Make.com pra manter tudo organizado", "position": "bottom"},
      "action": "Acesse app.bland.ai e crie sua conta.",
      "check": null
    },
    {
      "bar_text": "bland.ai", "bar_sub": "Onboarding", "bar_color": "#1E293B",
      "elements": [
        {"type": "chrome_header", "url": "app.bland.ai/dashboard"},
        {"type": "text", "content": "Pode aparecer um assistente chamado Blandie. Ignore e vá direto pro Dashboard."},
        {"type": "warning", "text": "Se aparecer tela de tour/onboarding, clique Skip ou X até chegar no Dashboard."}
      ],
      "tip": {"text": "Pule o tour — vamos direto ao que importa", "position": "top"},
      "action": "Pule qualquer tour ou onboarding. Vá direto pro Dashboard.",
      "check": null
    },
    {
      "bar_text": "bland.ai", "bar_sub": "Settings → API Keys", "bar_color": "#1E293B",
      "elements": [
        {"type": "chrome_header", "url": "app.bland.ai/dashboard/settings"},
        {"type": "text", "content": "Copiar sua API Key (senha de acesso entre apps)"},
        {"type": "nav_breadcrumb", "from": "Dashboard", "to": "Settings → API Keys", "how": "Menu lateral esquerdo → clique em Settings → aba API Keys no topo"},
        {"type": "table", "headers": ["Name", "Key"], "rows": [["Default", "org_e6b9...435 ← truncada!"]]},
        {"type": "warning", "text": "A key na tabela aparece CORTADA. Você precisa criar uma nova pra conseguir copiar."},
        {"type": "button", "label": "+ New API Key", "primary": true},
        {"type": "text", "content": "Quando criar, aparece uma janela com a key completa. Copie ANTES de fechar — depois não aparece mais!"}
      ],
      "tip": {"text": "Copie a key e cole no Bloco de Notas — vai precisar no passo 17", "position": "bottom"},
      "action": "Clique + New API Key. Copie a key completa (começa com org_) e salve no Bloco de Notas.",
      "check": "Você tem uma API Key do Bland salva no Bloco de Notas, começando com org_."
    }
  ]'::jsonb,
  '{"tip": "Aqui você cria conta no Bland AI e pega a API Key. Essa key vai ser usada no passo 17 pra conectar o Make ao Bland.", "analogy": "API Key é tipo a senha do Wi-Fi: sem ela, o Make não consegue entrar no Bland pra mandar fazer a ligação.", "sos": "Se a key na tabela aparece cortada (org_e6b9...435), é normal! Crie uma nova clicando + New API Key. A key completa só aparece uma vez — copie antes de fechar."}'::jsonb,
  '{"warn": "A API Key na tabela aparece truncada (cortada). Você PRECISA criar uma nova pra copiar a versão completa. A key começa com org_ (não SK-).", "ift": {"tag": "SE → ENTÃO", "desc": "Apareceu Meet Blandie ou tour guiado?", "act": "Clique X ou Skip e vá pro Dashboard → Settings → API Keys."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 3: Criar planilha de leads (Phase 1)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 3, 'criar-planilha-leads',
  'Criar planilha de leads',
  'Agora vamos pro Google Sheets. Essa planilha vai ser o banco de dados dos seus leads — onde ficam os contatos que o sistema vai ligar.',
  'Sheets', '📊', '#ECFDF5', '#059669', '#059669', 30, 11, 1,
  '[
    {
      "bar_text": "sheets.google.com", "bar_sub": "Nova planilha", "bar_color": "#0F9D58",
      "elements": [
        {"type": "chrome_header", "url": "sheets.google.com/spreadsheets/d/new"},
        {"type": "text", "content": "🔄 Mudamos de ferramenta! Saímos do Bland AI → Entramos no Google Sheets. Abra uma nova aba."},
        {"type": "input", "label": "Nome da planilha", "placeholder": "SDR Leads", "highlight": true, "value": "SDR Leads"},
        {"type": "text", "content": "Deixe a planilha VAZIA — os cabeçalhos vão ser criados automaticamente pelo formulário no passo 5."}
      ],
      "tip": {"text": "Só renomear pra SDR Leads e pronto! Não precisa preencher nada.", "position": "bottom"},
      "action": "Abra sheets.google.com em nova aba. Crie planilha nova. Renomeie pra SDR Leads. Deixe vazia.",
      "check": null
    },
    {
      "bar_text": "sheets.google.com", "bar_sub": "SDR Leads", "bar_color": "#0F9D58",
      "elements": [
        {"type": "chrome_header", "url": "sheets.google.com/spreadsheets/d/abc123"},
        {"type": "celebration", "text": "Planilha criada!", "next": "Agora vamos criar o formulário que alimenta essa planilha."}
      ],
      "tip": null,
      "action": null,
      "check": "Planilha SDR Leads aberta no Google Sheets, completamente vazia."
    }
  ]'::jsonb,
  '{"tip": "Crie uma planilha chamada SDR Leads no Google Sheets. Deixe ela vazia — o formulário vai criar os cabeçalhos automaticamente.", "analogy": "A planilha é tipo um caderno de contatos digital. Cada linha vai ser um lead. Cada coluna, uma informação (nome, telefone, etc).", "sos": "Se já tem uma planilha de leads, pode usar ela! Só renomeie a aba principal pra Sheet1 pra não dar conflito."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 4: Criar formulário de captação (Phase 1)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 4, 'criar-formulario-captacao',
  'Criar formulário de captação',
  'O Google Forms (ferramenta gratuita do Google pra criar formulários online) vai ser a porta de entrada dos leads. Quando alguém preencher, os dados vão automaticamente pra planilha.',
  'Forms', '📝', '#F5F3FF', '#7C3AED', '#7C3AED', 50, 15, 1,
  '[
    {
      "bar_text": "forms.google.com", "bar_sub": "Novo formulário", "bar_color": "#7C3AED",
      "elements": [
        {"type": "chrome_header", "url": "docs.google.com/forms/d/new"},
        {"type": "text", "content": "🔄 Mudamos de ferramenta! Saímos do Sheets → Entramos no Google Forms. Nova aba no navegador."},
        {"type": "input", "label": "Título do formulário", "placeholder": "Captação de Leads — SDR IA", "highlight": true, "value": "Captação de Leads — SDR IA"},
        {"type": "input", "label": "Nome completo", "placeholder": "Resposta curta", "highlight": false},
        {"type": "input", "label": "Telefone com DDD", "placeholder": "Ex: 27999887766", "highlight": false},
        {"type": "input", "label": "Email", "placeholder": "Resposta curta", "highlight": false},
        {"type": "input", "label": "Interesse", "placeholder": "O que procura?", "highlight": false},
        {"type": "warning", "text": "Obrigatório: Adicione um campo de consentimento (checkbox): Aceito receber uma ligação sobre este assunto"}
      ],
      "tip": {"text": "O campo de consentimento é obrigatório por lei (LGPD)", "position": "bottom"},
      "action": "Acesse forms.google.com. Crie formulário com: Nome, Telefone, Email, Interesse e checkbox de consentimento.",
      "check": null
    },
    {
      "bar_text": "forms.google.com", "bar_sub": "Campo de consentimento", "bar_color": "#7C3AED",
      "elements": [
        {"type": "chrome_header", "url": "docs.google.com/forms/d/abc/edit"},
        {"type": "text", "content": "Adicionar campo de consentimento"},
        {"type": "text", "content": "Tipo: Checkbox. Texto: Aceito receber uma ligação sobre este assunto. Marcar como Obrigatório."}
      ],
      "tip": {"text": "Marque este campo como Obrigatório no Forms", "position": "top"},
      "action": "Adicione campo Checkbox com texto Aceito receber uma ligação. Marque como Obrigatório.",
      "check": "Formulário tem 5 campos: Nome, Telefone, Email, Interesse e Consentimento (checkbox obrigatório)."
    }
  ]'::jsonb,
  '{"tip": "Crie um formulário com 5 campos. O mais importante é o checkbox de consentimento — sem ele, ligar pro lead é ilegal.", "analogy": "O formulário é a porta de entrada. Tipo o balcão de atendimento: a pessoa chega, preenche a ficha, e entra na fila pra ser atendida (ligação).", "sos": "O campo de consentimento deve ser tipo Checkbox (não texto). E marque como obrigatório — assim ninguém envia sem aceitar."}'::jsonb,
  '{"warn": "Campo de consentimento é obrigatório por lei (LGPD). Sem ele, ligar pro lead pode gerar multa.", "ift": null}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 5: Conectar Forms à planilha (Phase 2 - Configuração)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 5, 'conectar-forms-planilha',
  'Conectar Forms à planilha',
  'Agora conectamos o formulário à planilha SDR Leads que você criou no passo 3. Assim, cada resposta vai direto pra planilha.',
  'Forms', '📝', '#F5F3FF', '#7C3AED', '#7C3AED', 35, 19, 2,
  '[{
    "bar_text": "forms.google.com", "bar_sub": "Respostas → Sheets", "bar_color": "#7C3AED",
    "elements": [
      {"type": "chrome_header", "url": "docs.google.com/forms/d/abc/edit"},
      {"type": "dependency", "text": "Usando o formulário do passo 4 e a planilha do passo 3."},
      {"type": "text", "content": "Vincular à planilha existente"},
      {"type": "nav_breadcrumb", "from": "Formulário (aba Editar)", "to": "Aba Respostas → ícone Sheets", "how": "Clique na aba Respostas no topo → Clique no ícone verde do Sheets"},
      {"type": "text", "content": "Selecione: Selecionar planilha existente → SDR Leads"},
      {"type": "warning", "text": "Isso vai criar uma ABA nova chamada Form Responses 1 dentro da sua planilha — NÃO na Sheet1. Isso é normal!"}
    ],
    "tip": {"text": "Escolha Selecionar existente e ache SDR Leads", "position": "bottom"},
    "action": "Na aba Respostas, clique no ícone do Sheets. Escolha Selecionar planilha existente → SDR Leads.",
    "check": "Dentro da planilha SDR Leads aparece uma nova aba chamada Form Responses 1."
  }]'::jsonb,
  '{"tip": "Conecte o Forms à planilha SDR Leads. O Forms vai criar uma aba chamada Form Responses 1 automaticamente.", "analogy": "É como ligar um cano: formulário (torneira) → planilha (balde). Cada resposta enche mais uma linha no balde.", "sos": "Se não achar a planilha na lista, verifique se ela está na mesma conta Google."}'::jsonb,
  '{"warn": "O Forms cria uma aba Form Responses 1 (não Sheet1). No passo 11, você vai precisar usar esse nome EXATO.", "ift": null}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 6: Testar o formulário (Phase 2)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 6, 'testar-formulario',
  'Testar o formulário',
  'Antes de seguir, vamos testar se o formulário funciona. Preencha com dados de teste pra verificar.',
  'Forms', '📝', '#F5F3FF', '#7C3AED', '#7C3AED', 25, 22, 2,
  '[{
    "bar_text": "forms.google.com", "bar_sub": "Preview", "bar_color": "#7C3AED",
    "elements": [
      {"type": "chrome_header", "url": "docs.google.com/forms/d/abc/viewform"},
      {"type": "dependency", "text": "Usando o formulário do passo 4."},
      {"type": "text", "content": "Preencha com dados de teste"},
      {"type": "nav_breadcrumb", "from": "Formulário (edição)", "to": "Preview (visualização)", "how": "Clique no ícone do olho no topo direito"},
      {"type": "input", "label": "Nome completo", "placeholder": "Maria Teste", "highlight": false, "value": "Maria Teste"},
      {"type": "input", "label": "Telefone", "placeholder": "27999887766", "highlight": false, "value": "27999887766"},
      {"type": "input", "label": "Email", "placeholder": "teste@email.com", "highlight": false, "value": "teste@email.com"},
      {"type": "input", "label": "Interesse", "placeholder": "Saber mais sobre o produto", "highlight": false, "value": "Saber mais sobre o produto"},
      {"type": "button", "label": "Enviar", "primary": true}
    ],
    "tip": {"text": "Use dados fictícios — é só um teste", "position": "bottom"},
    "action": "Clique no olho (Preview). Preencha com dados de teste e clique Enviar.",
    "check": "Aparece a mensagem Resposta registrada após enviar."
  }]'::jsonb,
  '{"tip": "Teste o formulário preenchendo com dados fictícios. Use um telefone real se quiser testar a ligação no passo 25.", "analogy": "Testar é como fazer um ensaio antes do show. Garante que tudo funciona antes de colocar em produção.", "sos": "Se der erro ao enviar, verifique se todos os campos obrigatórios estão preenchidos, especialmente o checkbox."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 7: Verificar dados na planilha (Phase 2)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 7, 'verificar-dados-planilha',
  'Verificar dados na planilha',
  'Vamos confirmar que os dados do teste chegaram na planilha SDR Leads (passo 3).',
  'Sheets', '📊', '#ECFDF5', '#059669', '#059669', 20, 26, 2,
  '[{
    "bar_text": "sheets.google.com", "bar_sub": "SDR Leads → Form Responses 1", "bar_color": "#0F9D58",
    "elements": [
      {"type": "chrome_header", "url": "sheets.google.com/spreadsheets/d/abc123"},
      {"type": "dependency", "text": "Verificando a planilha do passo 3 + o teste do passo 6."},
      {"type": "text", "content": "🔄 Voltamos pro Google Sheets"},
      {"type": "table", "headers": ["Timestamp", "Nome", "Telefone", "Email", "Interesse", "Consentimento"], "rows": [["13/03 14:30", "Maria Teste", "27999887766", "teste@email.com", "Saber mais", "Aceito receber uma ligação"]]},
      {"type": "celebration", "text": "Formulário → Planilha funcionando!", "next": "Agora vamos criar a automação no Make."}
    ],
    "tip": null,
    "action": "Abra a planilha SDR Leads. Clique na aba Form Responses 1. Confira os dados.",
    "check": "Os dados de teste (Maria Teste, 27999887766, etc) aparecem na aba Form Responses 1."
  }]'::jsonb,
  '{"tip": "Confira se os dados de teste apareceram na planilha, na aba Form Responses 1.", "analogy": "É como verificar se a carta chegou na caixa de correio. Se os dados estão lá, o cano (formulário → planilha) está funcionando.", "sos": "Se não apareceram: 1) Verifique se está na aba Form Responses 1 (não Sheet1). 2) Espere 30 segundos e recarregue a página."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 8: Criar cenário no Make (Phase 3 - Execução)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 8, 'criar-cenario-make',
  'Criar cenário no Make',
  'Agora entramos no Make pra criar o Cenário (receita de automação). É aqui que a mágica acontece.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 30, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "Dashboard", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios"},
      {"type": "text", "content": "🔄 Voltamos pro Make!"},
      {"type": "dependency", "text": "Usando a conta Make.com que você criou no passo 1."},
      {"type": "text", "content": "Clique em Create a new scenario para criar seu primeiro cenário de automação."},
      {"type": "button", "label": "Create a new scenario", "primary": true}
    ],
    "tip": {"text": "Clique no + grande ou em Create a new scenario", "position": "bottom"},
    "action": "No Dashboard do Make, clique em Create a new scenario.",
    "check": "Você vê uma tela em branco com um círculo + no centro (editor de cenário)."
  }]'::jsonb,
  '{"tip": "Crie um cenário novo no Make. É onde vamos montar a automação: planilha detecta lead → Make dispara ligação.", "analogy": "O cenário é uma receita: ingrediente 1 (lead na planilha) + ingrediente 2 (filtro de consentimento) + ingrediente 3 (ligação) = SDR automático.", "sos": "Se o botão Create a new scenario não aparece, verifique se está logado na conta certa (email do passo 1)."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 9: Adicionar Watch New Rows (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 9, 'adicionar-watch-new-rows',
  'Adicionar Watch New Rows',
  'Agora vamos adicionar o primeiro Módulo (cada passo dentro do cenário) no cenário: o Watch New Rows, que fica de olho na planilha esperando novos leads.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 40, 33, 3,
  '[
    {
      "bar_text": "make.com", "bar_sub": "Cenário → + Módulo", "bar_color": "#6366F1",
      "elements": [
        {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
        {"type": "dependency", "text": "Usando o cenário que você criou no passo 8."},
        {"type": "text", "content": "Adicionar módulo Google Sheets"},
        {"type": "nav_breadcrumb", "from": "Cenário vazio", "to": "Buscar módulo", "how": "Clique no + no centro → Digite Google Sheets na busca"},
        {"type": "text", "content": "Selecione: Google Sheets → Watch New Rows"}
      ],
      "tip": {"text": "Digite Google Sheets e escolha Watch New Rows", "position": "bottom"},
      "action": "Clique no +. Busque Google Sheets. Selecione Watch New Rows.",
      "check": null
    },
    {
      "bar_text": "make.com", "bar_sub": "Watch New Rows adicionado", "bar_color": "#6366F1",
      "elements": [
        {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
        {"type": "text", "content": "Módulo Google Sheets — Watch New Rows adicionado ao cenário ✅"}
      ],
      "tip": null, "action": null,
      "check": "O módulo Google Sheets — Watch New Rows aparece no cenário com ícone verde."
    }
  ]'::jsonb,
  '{"tip": "Adicione o módulo Watch New Rows do Google Sheets. Ele fica monitorando a planilha — quando aparece linha nova, dispara o cenário.", "analogy": "O Watch New Rows é um porteiro que fica na entrada da planilha. Toda vez que alguém novo entra (nova linha), ele avisa.", "sos": "Tem vários módulos do Google Sheets. Escolha especificamente o Watch New Rows, não Search Rows ou Get a Row."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 10: Conectar Google ao Make (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 10, 'conectar-google-make',
  'Conectar Google ao Make',
  'O Make precisa de permissão pra acessar sua conta Google. Vamos autorizar via OAuth (autorização segura).',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 40, 37, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "Configurar conexão", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Usando a conta Make (passo 1) e a mesma conta Google da planilha (passo 3)."},
      {"type": "text", "content": "Autorizar acesso ao Google"},
      {"type": "select", "label": "Connection", "options": ["-- Select --", "Add new connection"], "selected": 1},
      {"type": "warning", "text": "Vai abrir uma janela pop-up do Google. NÃO FECHE essa janela até completar a autorização!"},
      {"type": "text", "content": "1. Abre janela do Google → 2. Escolha sua conta → 3. Clique Permitir → 4. Janela fecha sozinha ✅"}
    ],
    "tip": {"text": "Escolha a mesma conta Google da planilha!", "position": "bottom"},
    "action": "No módulo Watch New Rows, em Connection, selecione Add new connection. Autorize com sua conta Google.",
    "check": "O campo Connection mostra My Google connection (ou similar) com ✅ verde."
  }]'::jsonb,
  '{"tip": "Conecte sua conta Google ao Make. Ele precisa de permissão pra ler a planilha automaticamente.", "analogy": "OAuth é como dar a chave do prédio pro entregador. Ele entra, pega o pacote (dados da planilha) e sai — mas não pode mudar a fechadura.", "sos": "Se a janela do Google não abrir: 1) Verifique se pop-ups estão liberados. 2) Tente outro navegador."}'::jsonb,
  '{"warn": "NÃO feche a janela pop-up do Google antes de completar! Se fechar, a conexão falha.", "ift": {"tag": "SE → ENTÃO", "desc": "Erro 403 ou access denied ao conectar?", "act": "Refaça: Delete a conexão → Add new connection → Use a MESMA conta Google da planilha."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 11: Configurar campos do Watch (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 11, 'configurar-campos-watch',
  'Configurar campos do Watch',
  'Com o Google conectado, agora configuramos qual planilha o Watch New Rows deve monitorar.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 41, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "Watch New Rows → Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Usando a planilha SDR Leads (passo 3) + conexão Google (passo 10)."},
      {"type": "text", "content": "Configurar qual planilha monitorar"},
      {"type": "select", "label": "Spreadsheet", "options": ["-- Select --", "SDR Leads"], "selected": 1},
      {"type": "select", "label": "Sheet Name", "options": ["-- Select --", "Form Responses 1", "Sheet1"], "selected": 1},
      {"type": "input", "label": "Table contains headers", "placeholder": "Yes", "highlight": false, "value": "Yes"},
      {"type": "input", "label": "Limit", "placeholder": "1", "highlight": false, "value": "1"},
      {"type": "warning", "text": "Em Sheet Name, escolha Form Responses 1 (NÃO Sheet1). É a aba criada pelo Forms no passo 5."}
    ],
    "tip": {"text": "Sheet Name = Form Responses 1 (não Sheet1!)", "position": "top"},
    "action": "Configure: Spreadsheet = SDR Leads, Sheet Name = Form Responses 1, Headers = Yes, Limit = 1.",
    "check": "Os 4 campos estão preenchidos corretamente."
  }]'::jsonb,
  '{"tip": "Configure o Watch pra monitorar a planilha SDR Leads, aba Form Responses 1, com headers = Yes e limit = 1.", "analogy": "É como dizer pro porteiro: Fique de olho naquela porta específica (aba) do prédio (planilha), e avise toda vez que entrar 1 pessoa nova.", "sos": "Se SDR Leads não aparece na lista: verifique se a conexão Google (passo 10) está com a mesma conta que criou a planilha."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 12: Testar o Watch (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 12, 'testar-watch',
  'Testar o Watch',
  'Vamos testar se o Watch consegue ler os dados da planilha.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 44, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "Watch → Run Once", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "O teste vai puxar os dados que você inseriu no passo 6 (Maria Teste)."},
      {"type": "text", "content": "Executar teste do Watch"},
      {"type": "nav_breadcrumb", "from": "Editor de cenário", "to": "Botão Run Once", "how": "Canto inferior esquerdo — botão Run Once"},
      {"type": "button", "label": "Run Once", "primary": true},
      {"type": "warning", "text": "Se aparecer No data ou erro 403: delete a conexão Google, refaça o passo 10 e tente de novo."},
      {"type": "text", "content": "Resultado esperado: Um balão verde aparece no módulo mostrando 1 bundle com os dados do teste."}
    ],
    "tip": {"text": "Run Once = executa o cenário uma vez pra testar", "position": "bottom"},
    "action": "Clique em Run Once (canto inferior esquerdo). Espere o balão verde aparecer.",
    "check": "Balão verde no módulo mostra 1 bundle com os dados do teste."
  }]'::jsonb,
  '{"tip": "Clique em Run Once pra testar o Watch. Ele deve mostrar os dados da Maria Teste que você inseriu no passo 6.", "analogy": "É como pedir pro porteiro conferir se ele consegue ler a lista de convidados.", "sos": "Erro No data? Vá ao formulário (passo 6), preencha de novo e clique Run Once outra vez."}'::jsonb,
  '{"warn": "Se der erro 403 ou No data: refaça o passo 10 (conexão Google).", "ift": {"tag": "SE → ENTÃO", "desc": "Resultado No data ou 0 bundles?", "act": "1) Envie nova resposta no formulário. 2) Volte ao Make. 3) Clique Run Once de novo."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 13: Adicionar filtro (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 13, 'adicionar-filtro',
  'Adicionar filtro',
  'Agora adicionamos um Filter (porteiro que decide quem passa) entre o Watch e o próximo módulo. Só leads que aceitaram o consentimento passam.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 48, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "Cenário → Adicionar filtro", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "O filtro fica entre o Watch (passo 9) e o próximo módulo."},
      {"type": "text", "content": "Adicionar filtro de consentimento. O filtro garante que o sistema só liga pra quem aceitou."},
      {"type": "text", "content": "Clique na linha entre os módulos → Set up a filter"}
    ],
    "tip": {"text": "Clique na LINHA entre os módulos (não no módulo)", "position": "bottom"},
    "action": "Clique na linha entre os módulos. Selecione Set up a filter.",
    "check": "Um ícone de filtro (funil) aparece na linha entre os módulos."
  }]'::jsonb,
  '{"tip": "Adicione um filtro clicando na linha entre os módulos. Esse filtro vai bloquear leads que NÃO aceitaram o consentimento.", "analogy": "O filtro é um porteiro na entrada da boate: se você não está na lista (não aceitou), não entra.", "sos": "Não confunda: clique na LINHA entre os módulos, não no módulo em si."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 14: Configurar condição do filtro (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 14, 'configurar-condicao-filtro',
  'Configurar condição do filtro',
  'Configure a condição do filtro: só passa quem marcou Aceito no consentimento.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 52, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "Filter → Condição", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "O valor do filtro vem do checkbox de consentimento do passo 4."},
      {"type": "text", "content": "Configurar condição"},
      {"type": "input", "label": "Label", "placeholder": "Consentimento OK", "highlight": true, "value": "Consentimento OK"},
      {"type": "select", "label": "Campo", "options": ["-- Select --", "Consentimento para contato"], "selected": 1},
      {"type": "select", "label": "Operador", "options": ["Equal to", "Contains", "Starts with"], "selected": 1},
      {"type": "input", "label": "Valor", "placeholder": "Aceito", "highlight": true, "value": "Aceito"},
      {"type": "warning", "text": "Use Contains (não Equal to). O Forms retorna o texto como array. E o valor é case-sensitive: copie exatamente da planilha."}
    ],
    "tip": {"text": "Operador = Contains, Valor = copie da planilha!", "position": "bottom"},
    "action": "Configure: Label = Consentimento OK, Campo = Consentimento, Operador = Contains, Valor = Aceito.",
    "check": "Filtro configurado com operador Contains e valor Aceito."
  }]'::jsonb,
  '{"tip": "Configure o filtro: campo = Consentimento, operador = Contains, valor = Aceito.", "analogy": "É como ensinar o porteiro: Se o documento da pessoa CONTÉM a palavra Aceito, pode entrar.", "sos": "Se no teste o filtro barra tudo: verifique se o valor está EXATAMENTE como aparece na planilha. É case-sensitive."}'::jsonb,
  '{"warn": "Valor é case-sensitive. Copie exatamente da planilha.", "ift": null}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 15: Adicionar módulo HTTP (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 15, 'adicionar-modulo-http',
  'Adicionar módulo HTTP',
  'Agora adicionamos o HTTP Request (pedido que um app manda pra outro) que vai se comunicar com o Bland AI.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 56, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "HTTP Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Este módulo vai se comunicar com o Bland AI (passo 2) pra disparar a ligação."},
      {"type": "text", "content": "Adicionar módulo HTTP"},
      {"type": "nav_breadcrumb", "from": "Editor de cenário", "to": "Novo módulo", "how": "Clique no + à direita do filtro → Busque HTTP"},
      {"type": "text", "content": "Selecione: HTTP → Make a request"},
      {"type": "warning", "text": "Escolha Make a request (pedido simples). NÃO escolha Make an API Key Auth request — vai dar erro 401 no Bland."}
    ],
    "tip": null,
    "action": "Clique + após o filtro. Busque HTTP. Escolha Make a request (NÃO API Key Auth).",
    "check": "Módulo HTTP — Make a request adicionado ao cenário, após o filtro."
  }]'::jsonb,
  '{"tip": "Adicione o módulo HTTP Make a request. Siga as instruções do mockup.", "analogy": "Cada módulo é como uma peça do quebra-cabeça. Quando todas encaixam, a automação funciona sozinha.", "sos": "Se tiver dúvida sobre algum campo, confira os passos anteriores."}'::jsonb,
  '{"warn": "Escolha Make a request (pedido simples). NÃO escolha Make an API Key Auth request.", "ift": {"tag": "SE → ENTÃO", "desc": "Escolheu API Key Auth por engano?", "act": "Delete o módulo e adicione de novo, escolhendo Make a request."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 16: Configurar URL e Método (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 16, 'configurar-url-metodo',
  'Configurar URL e Método',
  'Configure o HTTP Request com a URL do Bland AI e o método POST.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 59, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "HTTP Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "A URL é do Bland AI (conta do passo 2). POST = enviar pedido de ligação."},
      {"type": "text", "content": "URL e Método"},
      {"type": "input", "label": "URL", "placeholder": "https://api.bland.ai/v1/calls", "highlight": true, "value": "https://api.bland.ai/v1/calls"},
      {"type": "select", "label": "Method", "options": ["GET", "POST", "PUT"], "selected": 1},
      {"type": "text", "content": "POST = enviar dados. GET = pedir dados. Aqui queremos ENVIAR o pedido de ligação."}
    ],
    "tip": null,
    "action": "Configure: URL = https://api.bland.ai/v1/calls, Method = POST.",
    "check": "URL e método configurados corretamente."
  }]'::jsonb,
  '{"tip": "Configure URL e método do HTTP request.", "analogy": "A URL é o endereço da casa e o método POST é bater na porta e entregar o pacote.", "sos": "Copie a URL exatamente: https://api.bland.ai/v1/calls"}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 17: Adicionar Header de autenticação (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 17, 'adicionar-header-autenticacao',
  'Adicionar Header de autenticação',
  'Agora adicionamos o Header (cabeçalho do pedido) com a API Key do Bland pra provar que temos permissão.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 63, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "HTTP Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Usando a API Key do Bland que você copiou no passo 2."},
      {"type": "text", "content": "Configurar Header de autenticação"},
      {"type": "input", "label": "Name", "placeholder": "authorization", "highlight": true, "value": "authorization"},
      {"type": "input", "label": "Value", "placeholder": "org_e6b9390ff435...", "highlight": true},
      {"type": "warning", "text": "NÃO use Bearer antes da key! Cole DIRETO: org_e6b9390ff435... Se colocar Bearer org_..., vai dar erro 401."},
      {"type": "text", "content": "✅ CERTO: org_e6b9390ff435..."},
      {"type": "text", "content": "❌ ERRADO: Bearer org_e6b9390ff435..."}
    ],
    "tip": null,
    "action": "Em Headers, adicione: Name = authorization, Value = cole sua API Key do passo 2 (sem Bearer!).",
    "check": "Header configurado com name=authorization e value=sua key (começa com org_)."
  }]'::jsonb,
  '{"tip": "Adicione o header authorization com a API Key do Bland. SEM Bearer!", "analogy": "O header é o crachá de identificação: sem ele, o Bland não sabe quem está mandando o pedido.", "sos": "Se der erro 401: 1) Verifique se NÃO tem Bearer. 2) Verifique se a key começa com org_. 3) Crie nova key no Bland se necessário."}'::jsonb,
  '{"warn": "A autenticação do Bland é: header authorization = org_suakey. SEM a palavra Bearer antes.", "ift": {"tag": "SE → ENTÃO", "desc": "Erro 401 Unauthorized ao testar?", "act": "1) Verifique se NÃO tem Bearer antes da key. 2) Verifique se a key começa com org_."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 18: Montar Body JSON (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 18, 'montar-body-json',
  'Montar Body JSON',
  'Monte o Body (corpo do pedido) em formato JSON (formato de texto que apps usam pra conversar).',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 67, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "HTTP Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "O Body contém os campos do Bland: telefone e script (vêm da planilha, passo 3)."},
      {"type": "text", "content": "Configurar Body do pedido"},
      {"type": "select", "label": "Body type", "options": ["Raw", "Form data", "Multipart"], "selected": 0},
      {"type": "select", "label": "Content type", "options": ["JSON (application/json)", "XML", "Text"], "selected": 0},
      {"type": "code_block", "language": "json", "content": "{\n  \"phone_number\": \"+5527999887766\",\n  \"task\": \"Ligar para o lead...\",\n  \"first_sentence\": \"Olá! Aqui é...\",\n  \"language\": \"pt\",\n  \"voice\": \"June\",\n  \"max_duration\": 5\n}"},
      {"type": "text", "content": "No próximo passo, vamos trocar os valores fixos pelas variáveis da planilha."}
    ],
    "tip": null,
    "action": "Configure: Body type = Raw, Content type = JSON. Cole o template JSON.",
    "check": "Body tipo Raw/JSON com os campos phone_number, task, first_sentence, language, voice, max_duration."
  }]'::jsonb,
  '{"tip": "Monte o body JSON com os campos do Bland AI.", "analogy": "O JSON é como um formulário padronizado entre apps.", "sos": "Copie o JSON exatamente como mostrado. Aspas duplas são obrigatórias no JSON."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 19: Mapear variáveis da planilha (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 19, 'mapear-variaveis-planilha',
  'Mapear variáveis da planilha',
  'Agora trocamos os valores fixos pelas variáveis dinâmicas da planilha — pra cada lead novo, o Bland liga pro número certo.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 35, 70, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "HTTP Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Usando os dados que vêm da planilha (Watch New Rows, passo 9)."},
      {"type": "text", "content": "Trocar valores fixos por variáveis"},
      {"type": "code_block", "language": "json", "content": "{\n  \"phone_number\": \"+55{{Telefone}}\",\n  \"task\": \"Ligue para {{Nome}}...\",\n  \"first_sentence\": \"Olá {{Nome}}!\",\n  \"language\": \"pt\",\n  \"voice\": \"June\",\n  \"max_duration\": 5\n}"},
      {"type": "warning", "text": "O telefone precisa do prefixo +55 antes do DDD. Se na planilha já tem 27999887766, o valor fica: +55{{Telefone}}"}
    ],
    "tip": null,
    "action": "No JSON, troque os valores fixos pelos campos da planilha (clique pra selecionar as variáveis do Watch).",
    "check": "O JSON usa variáveis dinâmicas no phone_number e task."
  }]'::jsonb,
  '{"tip": "Troque os valores fixos pelas variáveis da planilha.", "analogy": "É como fazer mala direta: o mesmo modelo de carta, mas com o nome de cada pessoa diferente.", "sos": "Se não aparecem as variáveis: clique no campo, depois clique no ícone do Watch (módulo anterior) pra ver as opções."}'::jsonb,
  '{"warn": "O telefone na planilha pode não ter o +55. Adicione manualmente no JSON.", "ift": null}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 20: Escrever script do agente (Phase 3)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 20, 'escrever-script-agente',
  'Escrever script do agente',
  'Ainda no Make, defina o que o agente de IA vai falar na ligação — o roteiro da conversa.',
  'Bland AI', '📞', '#EEF2FF', '#6366F1', '#6366F1', 35, 74, 3,
  '[{
    "bar_text": "make.com", "bar_sub": "HTTP Config", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "O script usa variáveis da planilha (passo 3) — Nome e Interesse do lead."},
      {"type": "text", "content": "Script do agente de voz"},
      {"type": "text", "content": "Campo task no JSON:"},
      {"type": "code_block", "language": "text", "content": "Você é um assistente comercial simpático. Ligue para {{Nome}} e:\n1. Apresente-se brevemente\n2. Pergunte sobre o interesse em {{Interesse}}\n3. Se houver interesse, pergunte o melhor horário pra uma reunião\n4. Agradeça e encerre educadamente\nSeja breve, máximo 2 minutos."},
      {"type": "text", "content": "Esse é um modelo base. Depois você personaliza com o tom da sua empresa."}
    ],
    "tip": null,
    "action": "Escreva o script do agente no campo task. Use as variáveis {{Nome}} e {{Interesse}} da planilha.",
    "check": "Campo task tem um script com variáveis dinâmicas da planilha. Fase 2 completa! Script do agente pronto!"
  }]'::jsonb,
  '{"tip": "Escreva o roteiro do agente de voz no campo task do JSON.", "analogy": "O script é como o roteiro de um ator: ele segue as instruções mas improvisa naturalmente.", "sos": "Se não sabe o que colocar no script, use o modelo sugerido. Depois personalize."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 21: Adicionar Update Row (Phase 4 - Validação)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 21, 'adicionar-update-row',
  'Adicionar Update Row',
  'Agora adicionamos um módulo pra atualizar a planilha depois que a ligação for feita — assim você sabe quem já foi contatado.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 78, 4,
  '[{
    "bar_text": "make.com", "bar_sub": "Adicionar Update Row", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Atualiza a planilha SDR Leads (passo 3), aba Form Responses 1 (passo 5)."},
      {"type": "text", "content": "Adicionar módulo Update Row"},
      {"type": "nav_breadcrumb", "from": "Cenário (após HTTP)", "to": "Novo módulo", "how": "Clique no + à direita do HTTP → Busque Google Sheets → Update a Row"}
    ],
    "tip": null,
    "action": "Clique + após o HTTP. Busque Google Sheets → Update a Row.",
    "check": "Módulo Update a Row adicionado ao cenário, após o HTTP."
  }]'::jsonb,
  '{"tip": "Adicione o módulo Update a Row do Google Sheets.", "analogy": "Cada passo te aproxima mais do SDR completo. Já estamos na reta final!", "sos": "Se algo deu errado nos passos anteriores, volte e confira."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 22: Configurar Update Row (Phase 4)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 22, 'configurar-update-row',
  'Configurar Update Row',
  'Configure quais campos atualizar na planilha após a ligação.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 81, 4,
  '[{
    "bar_text": "make.com", "bar_sub": "Configurar Update Row", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Usando a mesma planilha SDR Leads (passo 3) e conexão Google (passo 10)."},
      {"type": "text", "content": "Configurar campos do Update"},
      {"type": "select", "label": "Spreadsheet", "options": ["SDR Leads"], "selected": 0},
      {"type": "select", "label": "Sheet", "options": ["Form Responses 1"], "selected": 0},
      {"type": "input", "label": "Row number", "placeholder": "{{Row number do Watch}}", "highlight": true},
      {"type": "input", "label": "Coluna: Status", "placeholder": "Ligação enviada ✅", "highlight": false, "value": "Ligação enviada ✅"},
      {"type": "warning", "text": "O Row Number deve vir do Watch New Rows (variável dinâmica), NÃO um número fixo. Se colocar número fixo, vai sobrescrever sempre a mesma linha!"}
    ],
    "tip": null,
    "action": "Configure: planilha SDR Leads, aba Form Responses 1. Row number = variável do Watch (dinâmica!). Coluna Status = Ligação enviada ✅.",
    "check": "Update Row configurado com Row Number dinâmico e status Ligação enviada ✅."
  }]'::jsonb,
  '{"tip": "Configure o Update Row com Row Number dinâmico.", "analogy": "É como marcar na lista quem já foi atendido.", "sos": "O Row Number DEVE ser a variável do Watch, não um número fixo."}'::jsonb,
  '{"warn": "O Row Number deve ser a variável dinâmica do Watch, NÃO um número fixo.", "ift": null}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 23: Configurar agendamento (Phase 4)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 23, 'configurar-agendamento',
  'Configurar agendamento',
  'Defina de quanto em quanto tempo o Make verifica novos leads na planilha.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 85, 4,
  '[{
    "bar_text": "make.com", "bar_sub": "Configurar agendamento", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "O agendamento define quando o cenário (passo 8) verifica novos leads."},
      {"type": "text", "content": "Agendar execução automática"},
      {"type": "nav_breadcrumb", "from": "Editor de cenário", "to": "Configuração de scheduling", "how": "Clique no relógio no canto inferior do editor"},
      {"type": "select", "label": "Run scenario", "options": ["At regular intervals", "Once", "Every day"], "selected": 0},
      {"type": "input", "label": "Minutes", "placeholder": "15", "highlight": true, "value": "15"},
      {"type": "warning", "text": "No plano gratuito do Make, o intervalo mínimo é 15 minutos. O lead espera no máximo 15 min pra receber a ligação."}
    ],
    "tip": null,
    "action": "Clique no relógio. Configure: At regular intervals, 15 minutos.",
    "check": "Scheduling configurado para executar a cada 15 minutos."
  }]'::jsonb,
  '{"tip": "Configure o agendamento para 15 minutos.", "analogy": "É como programar o despertador: a cada 15 minutos ele acorda e confere se tem lead novo.", "sos": "15 minutos é o mínimo no plano gratuito."}'::jsonb,
  '{"warn": "Plano gratuito do Make: intervalo mínimo = 15 minutos.", "ift": null}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 24: Salvar e ativar cenário (Phase 4)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 24, 'salvar-ativar-cenario',
  'Salvar e ativar cenário',
  'Salve o cenário e ative o switch pra ele começar a rodar automaticamente.',
  'Make', '🌐', '#EEF2FF', '#6366F1', '#6366F1', 30, 89, 4,
  '[{
    "bar_text": "make.com", "bar_sub": "Salvar e ativar cenário", "bar_color": "#6366F1",
    "elements": [
      {"type": "chrome_header", "url": "make.com/scenarios/1/edit"},
      {"type": "dependency", "text": "Ativa o cenário completo (passos 8-22). Sem ativar, nada funciona automaticamente."},
      {"type": "text", "content": "Ativar o cenário"},
      {"type": "nav_breadcrumb", "from": "Editor de cenário", "to": "Switch ON/OFF", "how": "Canto inferior esquerdo — switch azul"},
      {"type": "text", "content": "Salve (Ctrl+S) e ative o switch ON."},
      {"type": "warning", "text": "O switch fica no canto inferior ESQUERDO. Se esquecer de ligar, o cenário não roda!"}
    ],
    "tip": null,
    "action": "Salve o cenário (Ctrl+S). Ative o switch ON no canto inferior esquerdo.",
    "check": "Switch está na posição ON (azul/verde) e cenário salvo. Automação ativa!"
  }]'::jsonb,
  '{"tip": "Salve e ative o cenário.", "analogy": "Ativar o cenário é como ligar o interruptor da fábrica: sem ele, as máquinas não funcionam.", "sos": "Se o switch não aparece, verifique se todos os módulos estão configurados corretamente."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 25: Teste ponta a ponta (Phase 4)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 25, 'teste-ponta-a-ponta',
  'Teste ponta a ponta',
  'Hora da verdade! Preencha o formulário com um número REAL e veja se a ligação chega.',
  'Forms', '📝', '#F5F3FF', '#7C3AED', '#7C3AED', 30, 93, 4,
  '[{
    "bar_text": "forms", "bar_sub": "Teste ponta a ponta", "bar_color": "#7C3AED",
    "elements": [
      {"type": "chrome_header", "url": "docs.google.com/forms/d/abc/viewform"},
      {"type": "dependency", "text": "Usando o formulário do passo 4 — agora com número de telefone REAL."},
      {"type": "text", "content": "Teste final: preencha o formulário"},
      {"type": "input", "label": "Nome", "placeholder": "Seu Nome Real", "highlight": false},
      {"type": "input", "label": "Telefone", "placeholder": "SEU NÚMERO COM DDD", "highlight": true},
      {"type": "input", "label": "Email", "placeholder": "seu@email.com", "highlight": false},
      {"type": "input", "label": "Interesse", "placeholder": "Testar o sistema", "highlight": false},
      {"type": "button", "label": "Enviar", "primary": true},
      {"type": "warning", "text": "Use seu número REAL com DDD (ex: 27999887766). Espere até 15 minutos pra receber a ligação (intervalo do Make)."}
    ],
    "tip": null,
    "action": "Preencha o formulário com seu número real. Envie e espere até 15 minutos.",
    "check": "Você recebe uma ligação no seu celular do agente de IA!"
  }]'::jsonb,
  '{"tip": "Use número real para o teste final.", "analogy": "É a hora do show! Tudo que você construiu vai funcionar agora.", "sos": "Se a ligação não chegou em 15 min: 1) Confira no Make se houve execução. 2) Verifique se o switch está ON. 3) Confira API Key."}'::jsonb,
  '{"warn": "Use telefone REAL com DDD. Espere até 15 minutos.", "ift": {"tag": "SE → ENTÃO", "desc": "Ligação não chegou em 15 minutos?", "act": "1) Confira no Make → Scenarios se houve execução. 2) Verifique se o switch está ON (passo 24). 3) Confira API Key (passo 17)."}}'::jsonb,
  NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 26: Verificar planilha atualizada (Phase 4)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 26, 'verificar-planilha-atualizada',
  'Verificar planilha atualizada',
  'Confira se a planilha atualizou o status do lead pra Ligação enviada ✅.',
  'Sheets', '📊', '#ECFDF5', '#059669', '#059669', 30, 96, 4,
  '[{
    "bar_text": "sheets", "bar_sub": "Verificar planilha atualizada", "bar_color": "#0F9D58",
    "elements": [
      {"type": "chrome_header", "url": "sheets.google.com/spreadsheets/d/abc123"},
      {"type": "dependency", "text": "Verificando a planilha SDR Leads após o teste do passo 25."},
      {"type": "text", "content": "Verificar status na planilha"},
      {"type": "table", "headers": ["Nome", "Telefone", "Status"], "rows": [["Seu Nome", "27999887766", "Ligação enviada ✅"]]},
      {"type": "celebration", "text": "Planilha atualizada automaticamente!", "next": "Último passo: parabéns!"}
    ],
    "tip": null,
    "action": "Abra a planilha SDR Leads, aba Form Responses 1. Verifique a coluna Status.",
    "check": "Coluna Status mostra Ligação enviada ✅ na linha do seu teste."
  }]'::jsonb,
  '{"tip": "Verifique se a planilha atualizou com o status.", "analogy": "É como conferir o relatório do dia: quem foi atendido, quem falta.", "sos": "Se o status não apareceu: verifique no Make se o módulo Update Row executou com sucesso."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 27: SDR de Voz — Completo! (Phase 5 - Conclusão)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'b0000001-0001-4000-8000-000000000001', 27, 'sdr-voz-completo',
  'SDR de Voz — Completo!',
  'Parabéns! Você criou um sistema de SDR de Voz com IA do zero!',
  'AILIV', '🎉', '#EEF2FF', '#6366F1', '#6366F1', 15, 100, 5,
  '[{
    "bar_text": "AILIV", "bar_sub": "SDR de Voz — Completo!", "bar_color": "#6366F1",
    "elements": [
      {"type": "text", "content": "Parabéns! Você criou um SDR de Voz com IA completo!"},
      {"type": "text", "content": "Agora, quando alguém preencher o formulário, o sistema liga automaticamente pro lead."},
      {"type": "divider"},
      {"type": "text", "content": "O que você construiu:"},
      {"type": "text", "content": "✅ Formulário de captação de leads\n✅ Planilha que organiza tudo\n✅ Automação no Make que conecta tudo\n✅ Agente de IA que liga e conversa\n✅ Atualização automática de status"},
      {"type": "divider"},
      {"type": "celebration", "text": "SDR de Voz com IA — Completo!", "next": "Próximo desafio: personalizar o script do agente pro seu negócio!"}
    ],
    "tip": null, "action": null, "check": null
  }]'::jsonb,
  '{"tip": "Você completou a aula! Agora personalize o script do agente.", "analogy": "Você acabou de montar uma fábrica que funciona sozinha!", "sos": "Se algo não funcionou, revise os passos com warnings (passos 2, 5, 10, 12, 14, 15, 17, 22, 25)."}'::jsonb,
  NULL, NULL
) ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- ============================================================
-- 5. v10_bpa_pipeline
-- ============================================================
INSERT INTO v10_bpa_pipeline (
  id, lesson_id, slug, title, status, current_stage, created_by,
  score_total, score_refero, score_docs, score_pedagogy, score_difficulty, score_relevance, score_semaphore,
  docs_manual_input,
  steps_generated, steps_audited, audit_passed,
  images_needed, images_generated, images_approved,
  mockups_total, mockups_from_refero, mockups_generic, mockups_approved,
  audios_total, audios_generated, audios_approved,
  assembly_checklist, assembly_passed,
  preview_at, approved_at, published_at, approved_by
)
VALUES (
  'b0000001-0001-4000-8000-000000000002',
  'b0000001-0001-4000-8000-000000000001',
  'sdr-voz-ia',
  'SDR de Voz com IA',
  'in_progress', 5, 'fernando',
  92, 95, 85, 90, 80, 100, 'green',
  'Documentação Make.com, Bland AI API docs, Google Forms/Sheets API, LGPD compliance.',
  27, 27, true,
  15, 15, 15,
  27, 15, 12, 27,
  29, 0, 0,
  '{"intro_slides": true, "narration_a": false, "narration_c": false, "all_steps": true, "frames_valid": true, "liv_hints": true, "audio_synced": false, "final_review": false}'::jsonb,
  false,
  NULL, NULL, NULL, NULL
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. v10_bpa_pipeline_log
-- ============================================================
DELETE FROM v10_bpa_pipeline_log WHERE pipeline_id = 'b0000001-0001-4000-8000-000000000002';

INSERT INTO v10_bpa_pipeline_log (pipeline_id, stage, action, details, created_at)
VALUES
  ('b0000001-0001-4000-8000-000000000002', 1, 'score_calculated',
   '{"score_total": 92, "semaphore": "green", "message": "Aula aprovada para produção com score 92/100."}'::jsonb,
   now() - interval '7 days'),
  ('b0000001-0001-4000-8000-000000000002', 2, 'steps_generated',
   '{"steps_count": 27, "source": "bpa-v10-sdr-completo.html", "message": "27 passos convertidos do protótipo HTML para V10 JSON."}'::jsonb,
   now() - interval '5 days'),
  ('b0000001-0001-4000-8000-000000000002', 5, 'audio_pending',
   '{"message": "Narração pendente — 29 áudios (Part A + Part C + 27 steps). Usar v10-generate-audio edge function."}'::jsonb,
   now());
