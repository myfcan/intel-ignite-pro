-- ============================================================
-- AILIV V10 — SEED: Demo Lesson "ChatGPT para Pesquisa"
-- Migration: 20260315180000_v10_seed_demo_lesson.sql
-- Data: 15/03/2026
-- Descrição: Popula uma aula completa V10 para testes E2E do player
-- ============================================================

-- Fixed UUIDs for easy reference
-- Lesson:   a0000001-0001-4000-8000-000000000001
-- Pipeline: a0000001-0001-4000-8000-000000000002

-- ============================================================
-- 1. v10_lessons
-- ============================================================
INSERT INTO v10_lessons (id, slug, title, description, trail_id, order_in_trail, total_steps, estimated_minutes, tools, badge_icon, badge_name, xp_reward, status)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  'chatgpt-pesquisa',
  'Como usar o ChatGPT para Pesquisa',
  'Aprenda a usar o ChatGPT como ferramenta de pesquisa profissional: prompts eficazes, verificação de fontes e organização de resultados.',
  NULL,
  1,
  10,
  15,
  ARRAY['ChatGPT', 'Chrome', 'Google Docs'],
  '🔍',
  'Pesquisador Digital',
  150,
  'published'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. v10_lesson_intro_slides (5 slides)
-- ============================================================
INSERT INTO v10_lesson_intro_slides (lesson_id, slide_order, icon, tool_name, tool_color, title, subtitle, appear_at_seconds)
VALUES
  ('a0000001-0001-4000-8000-000000000001', 1, '🔍', 'ChatGPT', '#10A37F', 'Pesquisa com IA', 'Descubra como o ChatGPT revoluciona a pesquisa', 0),
  ('a0000001-0001-4000-8000-000000000001', 2, '💡', NULL, '#6366F1', 'O que você vai aprender', 'Prompts eficazes para pesquisa acadêmica e profissional', 5),
  ('a0000001-0001-4000-8000-000000000001', 3, '⚡', NULL, '#6366F1', 'Verificação de fontes', 'Como validar informações geradas por IA', 10),
  ('a0000001-0001-4000-8000-000000000001', 4, '📊', NULL, '#6366F1', 'Organização de resultados', 'Estruture suas descobertas no Google Docs', 15),
  ('a0000001-0001-4000-8000-000000000001', 5, '🎯', NULL, '#6366F1', 'Pronto para começar?', '15 minutos para dominar a pesquisa com IA', 20)
ON CONFLICT (lesson_id, slide_order) DO NOTHING;

-- ============================================================
-- 3. v10_lesson_narrations (Part A + Part C)
-- ============================================================
INSERT INTO v10_lesson_narrations (lesson_id, part, script_text, duration_seconds, audio_url)
VALUES
  ('a0000001-0001-4000-8000-000000000001', 'A',
   'Bem-vindo à aula sobre pesquisa com ChatGPT! Nos próximos 15 minutos, você vai aprender a usar prompts eficazes, verificar fontes e organizar resultados como um pesquisador profissional.',
   30, NULL),
  ('a0000001-0001-4000-8000-000000000001', 'C',
   'Parabéns! Você completou a aula sobre pesquisa com ChatGPT. Agora você sabe criar prompts de pesquisa, verificar fontes e organizar resultados. Continue praticando!',
   20, NULL)
ON CONFLICT (lesson_id, part) DO NOTHING;

-- ============================================================
-- 4. v10_lesson_steps (10 steps)
-- ============================================================

-- Step 1: Abrir o ChatGPT (Phase 1 - Preparação)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  1,
  'abrir-chatgpt',
  'Abrir o ChatGPT',
  'Acesse o navegador Chrome e navegue até o ChatGPT',
  'Chrome',
  '🌐',
  '#e2e8f0', '#1e293b', '#6366f1',
  25, 10, 1,
  '[
    {
      "bar_text": "Abra o Google Chrome",
      "bar_sub": "Clique no ícone do Chrome na barra de tarefas",
      "bar_color": "#4285F4",
      "elements": [
        {"type": "text", "content": "Primeiro, vamos abrir o navegador Google Chrome."},
        {"type": "text", "content": "Procure o ícone do Chrome na sua barra de tarefas ou menu iniciar."},
        {"type": "button", "label": "Chrome", "primary": true},
        {"type": "divider"},
        {"type": "text", "content": "Se o Chrome não estiver instalado, você pode usar qualquer navegador moderno."}
      ],
      "tip": {"text": "O Chrome funciona melhor com o ChatGPT por ser baseado em Chromium."},
      "action": "open_chrome",
      "check": null
    },
    {
      "bar_text": "Acesse chat.openai.com",
      "bar_sub": "Digite o endereço na barra de navegação",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "chrome_header", "url": "https://chat.openai.com"},
        {"type": "text", "content": "Na barra de endereço, digite: chat.openai.com"},
        {"type": "input", "label": "Endereço", "placeholder": "chat.openai.com", "highlight": true},
        {"type": "text", "content": "Pressione Enter para acessar o site."},
        {"type": "tooltip_term", "term": "URL", "tip": "Endereço único de uma página na internet"}
      ],
      "tip": null,
      "action": "navigate_url",
      "check": "url_contains_openai"
    }
  ]'::jsonb,
  '{"tip": "Salve o chat.openai.com nos seus favoritos para acesso rápido.", "analogy": "Abrir o ChatGPT é como abrir uma biblioteca digital — a porta de entrada para todo o conhecimento.", "sos": "Se a página não carregar, verifique sua conexão com a internet e tente atualizar com F5."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 2: Entender a interface (Phase 1 - Preparação)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  2,
  'entender-interface',
  'Entender a interface',
  'Conheça os principais elementos da interface do ChatGPT',
  'ChatGPT',
  '🤖',
  '#e2e8f0', '#1e293b', '#6366f1',
  35, 20, 1,
  '[
    {
      "bar_text": "Explore a tela principal",
      "bar_sub": "Identifique os elementos da interface",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "chrome_header", "url": "https://chat.openai.com"},
        {"type": "text", "content": "Bem-vindo ao ChatGPT! Vamos conhecer a interface."},
        {"type": "text", "content": "No lado esquerdo, você verá a barra lateral com suas conversas anteriores."},
        {"type": "nav_breadcrumb", "from": "Tela Inicial", "to": "Chat", "how": "Clique em Nova conversa"},
        {"type": "divider"},
        {"type": "text", "content": "No centro, está a área principal de conversa onde você digitará seus prompts."}
      ],
      "tip": {"text": "A barra lateral pode ser recolhida clicando no ícone de menu."},
      "action": null,
      "check": null
    },
    {
      "bar_text": "O campo de mensagem",
      "bar_sub": "Onde você vai digitar seus prompts de pesquisa",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "text", "content": "Na parte inferior da tela, você encontra o campo de mensagem."},
        {"type": "input", "label": "Mensagem", "placeholder": "Envie uma mensagem...", "highlight": true},
        {"type": "button", "label": "Enviar", "primary": true},
        {"type": "tooltip_term", "term": "Prompt", "tip": "Instrução dada à IA para gerar uma resposta"},
        {"type": "text", "content": "É aqui que toda a mágica acontece! Digite seu prompt e clique em Enviar."}
      ],
      "tip": null,
      "action": null,
      "check": null
    },
    {
      "bar_text": "Botão de Nova Conversa",
      "bar_sub": "Cada pesquisa pode ter seu próprio chat",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "text", "content": "No topo da barra lateral, encontre o botão ''+ Nova conversa''."},
        {"type": "button", "label": "+ Nova conversa", "primary": true},
        {"type": "text", "content": "Use conversas separadas para cada tema de pesquisa."},
        {"type": "text", "content": "Isso ajuda a manter seus resultados organizados e fáceis de encontrar depois."},
        {"type": "divider"},
        {"type": "text", "content": "Dica: Renomeie suas conversas com o tema da pesquisa para encontrá-las facilmente."}
      ],
      "tip": {"text": "Organize suas conversas por tema de pesquisa para facilitar consultas futuras."},
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Renomeie suas conversas clicando no nome delas na barra lateral. Assim você encontra tudo depois.", "analogy": "A interface do ChatGPT é como uma sala de aula particular — o campo de mensagem é sua carteira e a área de resposta é o quadro.", "sos": "Se a interface parecer diferente, pode ser uma atualização recente. Os elementos principais permanecem no mesmo lugar."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 3: Criar conta ou fazer login (Phase 2 - Configuração)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  3,
  'criar-conta-login',
  'Criar conta ou fazer login',
  'Faça login na sua conta OpenAI ou crie uma nova',
  'ChatGPT',
  '🤖',
  '#e2e8f0', '#1e293b', '#6366f1',
  30, 30, 2,
  '[
    {
      "bar_text": "Faça login ou crie uma conta",
      "bar_sub": "Você precisa de uma conta para usar o ChatGPT",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "chrome_header", "url": "https://chat.openai.com/auth/login"},
        {"type": "text", "content": "Para usar o ChatGPT, você precisa de uma conta na OpenAI."},
        {"type": "input", "label": "Email", "placeholder": "seu.email@exemplo.com", "highlight": true},
        {"type": "input", "label": "Senha", "placeholder": "••••••••", "highlight": false},
        {"type": "button", "label": "Entrar", "primary": true},
        {"type": "text", "content": "Ou clique em ''Criar conta'' se ainda não tem uma."}
      ],
      "tip": {"text": "Use o login com Google para acesso mais rápido."},
      "action": "login",
      "check": "user_logged_in"
    },
    {
      "bar_text": "Confirme o acesso",
      "bar_sub": "Verifique se você está logado corretamente",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "text", "content": "Após fazer login, você verá a tela principal do ChatGPT."},
        {"type": "text", "content": "No canto inferior esquerdo, seu nome ou email aparecerá confirmando o login."},
        {"type": "divider"},
        {"type": "text", "content": "Se estiver vendo a tela de chat com o campo de mensagem, tudo está certo!"},
        {"type": "tooltip_term", "term": "Autenticação", "tip": "Processo de verificar sua identidade para acessar o sistema"}
      ],
      "tip": null,
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Use uma senha forte e única. Considere usar um gerenciador de senhas.", "analogy": "Fazer login é como mostrar seu crachá na portaria — sem ele, você não entra na biblioteca.", "sos": "Se esqueceu a senha, clique em ''Esqueci minha senha'' na tela de login. Você receberá um email para redefinir."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 4: Configurar o modelo GPT-4 (Phase 2 - Configuração)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  4,
  'configurar-modelo-gpt4',
  'Configurar o modelo GPT-4',
  'Selecione o modelo mais avançado para pesquisas',
  'ChatGPT',
  '🤖',
  '#e2e8f0', '#1e293b', '#6366f1',
  25, 40, 2,
  '[
    {
      "bar_text": "Selecione o modelo GPT-4",
      "bar_sub": "O modelo mais avançado gera respostas melhores para pesquisa",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "text", "content": "No topo da tela, você verá um seletor de modelo."},
        {"type": "select", "label": "Modelo", "options": ["GPT-3.5", "GPT-4", "GPT-4o"], "selected": 2},
        {"type": "text", "content": "Selecione GPT-4o para os melhores resultados de pesquisa."},
        {"type": "tooltip_term", "term": "GPT-4o", "tip": "Modelo mais recente da OpenAI, com melhor compreensão e respostas mais precisas"},
        {"type": "divider"},
        {"type": "text", "content": "GPT-4o é mais preciso e detalhado que o GPT-3.5, ideal para pesquisas."}
      ],
      "tip": {"text": "Se você tem conta gratuita, pode ter acesso limitado ao GPT-4. O GPT-3.5 também funciona bem para pesquisas básicas."},
      "action": "select_model",
      "check": "model_selected"
    },
    {
      "bar_text": "Entenda as diferenças",
      "bar_sub": "Cada modelo tem suas vantagens",
      "bar_color": "#10A37F",
      "elements": [
        {"type": "text", "content": "Comparação entre os modelos:"},
        {"type": "table", "headers": ["Modelo", "Velocidade", "Precisão", "Pesquisa"], "rows": [["GPT-3.5", "Rápido", "Boa", "Básica"], ["GPT-4", "Médio", "Excelente", "Avançada"], ["GPT-4o", "Rápido", "Excelente", "Avançada"]]},
        {"type": "text", "content": "Para pesquisa, recomendamos GPT-4o pela combinação de velocidade e precisão."},
        {"type": "warning", "text": "Conta gratuita tem limite de mensagens com GPT-4. Planeje seus prompts!"}
      ],
      "tip": null,
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Se tiver acesso limitado ao GPT-4, escreva prompts mais detalhados no GPT-3.5 para compensar.", "analogy": "Escolher o modelo é como escolher a lente de um telescópio — quanto mais potente, mais detalhes você vê.", "sos": "Se não vir o seletor de modelo, você pode estar usando a versão gratuita. O GPT-3.5 também serve para esta aula."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 5: Primeiro prompt de pesquisa (Phase 3 - Execução)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  5,
  'primeiro-prompt-pesquisa',
  'Primeiro prompt de pesquisa',
  'Escreva seu primeiro prompt de pesquisa eficaz',
  'ChatGPT',
  '🤖',
  '#e2e8f0', '#1e293b', '#6366f1',
  40, 50, 3,
  '[
    {
      "bar_text": "Estruture seu prompt",
      "bar_sub": "Um bom prompt tem contexto, pergunta e formato desejado",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "Agora vamos criar seu primeiro prompt de pesquisa!"},
        {"type": "text", "content": "Um prompt eficaz tem 3 partes: Contexto, Pergunta e Formato."},
        {"type": "divider"},
        {"type": "tooltip_term", "term": "Prompt estruturado", "tip": "Instrução organizada em partes claras para obter respostas mais precisas da IA"},
        {"type": "text", "content": "Exemplo: ''Sou estudante de marketing. Quais são as 5 principais tendências de marketing digital em 2026? Liste com explicação breve de cada uma.''"}
      ],
      "tip": {"text": "Quanto mais contexto você der, melhor será a resposta."},
      "action": null,
      "check": null
    },
    {
      "bar_text": "Digite o prompt",
      "bar_sub": "Copie ou adapte o exemplo para sua pesquisa",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "Agora é sua vez! Digite um prompt de pesquisa no campo abaixo."},
        {"type": "input", "label": "Seu prompt de pesquisa", "placeholder": "Sou estudante de [área]. Quais são as principais [tema] em [ano]? Liste com explicação breve.", "highlight": true},
        {"type": "button", "label": "Enviar", "primary": true},
        {"type": "divider"},
        {"type": "text", "content": "Lembre-se: inclua seu contexto, a pergunta específica e como quer a resposta formatada."}
      ],
      "tip": null,
      "action": "send_prompt",
      "check": "response_received"
    },
    {
      "bar_text": "Analise a resposta",
      "bar_sub": "Leia criticamente o que o ChatGPT retornou",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "O ChatGPT gerou uma resposta! Vamos analisá-la."},
        {"type": "text", "content": "Observe se a resposta: ✅ Respondeu sua pergunta ✅ Está no formato pedido ✅ Tem informações específicas"},
        {"type": "warning", "text": "Nunca aceite a primeira resposta como verdade absoluta. Sempre verifique!"},
        {"type": "text", "content": "Se a resposta não foi satisfatória, vamos refiná-la no próximo passo."},
        {"type": "tooltip_term", "term": "Alucinação", "tip": "Quando a IA gera informações que parecem verdadeiras mas são inventadas"}
      ],
      "tip": {"text": "Copie as informações mais importantes para um documento separado."},
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Use a técnica CREF: Contexto, Requisição, Especificação, Formato. Isso melhora a qualidade das respostas em até 60%.", "analogy": "Um bom prompt é como uma boa pergunta numa entrevista — quanto mais específica, mais valiosa a resposta.", "sos": "Se a resposta for vaga, adicione mais detalhes ao seu prompt. Tente especificar o público-alvo, o nível de profundidade e o formato desejado."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 6: Refinar o prompt (Phase 3 - Execução)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  6,
  'refinar-prompt',
  'Refinar o prompt',
  'Itere sobre o prompt para obter resultados mais precisos',
  'ChatGPT',
  '🤖',
  '#e2e8f0', '#1e293b', '#6366f1',
  45, 60, 3,
  '[
    {
      "bar_text": "Identifique o que melhorar",
      "bar_sub": "Avalie a resposta anterior e encontre lacunas",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "Pesquisa com IA é um processo iterativo. Vamos refinar!"},
        {"type": "text", "content": "Pergunte-se: A resposta foi completa? Faltou profundidade? O formato poderia ser melhor?"},
        {"type": "divider"},
        {"type": "text", "content": "Técnicas de refinamento:"},
        {"type": "text", "content": "1. Pedir mais detalhes sobre um ponto específico\n2. Solicitar fontes e referências\n3. Pedir comparações ou contrapontos\n4. Mudar o formato (tabela, lista, resumo)"}
      ],
      "tip": {"text": "A iteração é a chave para pesquisas de qualidade com IA."},
      "action": null,
      "check": null
    },
    {
      "bar_text": "Envie o prompt refinado",
      "bar_sub": "Use follow-up para aprofundar a pesquisa",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "Agora envie um follow-up refinando sua pesquisa."},
        {"type": "input", "label": "Prompt refinado", "placeholder": "Pode detalhar mais o ponto 3? Inclua dados estatísticos e fontes acadêmicas recentes.", "highlight": true},
        {"type": "button", "label": "Enviar", "primary": true},
        {"type": "tooltip_term", "term": "Follow-up", "tip": "Mensagem de acompanhamento que aprofunda ou direciona a conversa"},
        {"type": "text", "content": "O ChatGPT mantém o contexto da conversa, então não precisa repetir tudo."}
      ],
      "tip": null,
      "action": "send_followup",
      "check": "response_received"
    },
    {
      "bar_text": "Compare as respostas",
      "bar_sub": "A segunda resposta deve ser mais completa",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "Compare a resposta refinada com a original."},
        {"type": "table", "headers": ["Aspecto", "Prompt 1", "Prompt 2"], "rows": [["Detalhes", "Genérico", "Específico"], ["Fontes", "Nenhuma", "Com referências"], ["Formato", "Texto corrido", "Estruturado"]]},
        {"type": "text", "content": "Veja como o refinamento melhorou drasticamente a qualidade!"},
        {"type": "divider"},
        {"type": "text", "content": "Repita este processo quantas vezes necessário até ficar satisfeito."}
      ],
      "tip": {"text": "Salve os melhores prompts em um documento para reutilizar em pesquisas futuras."},
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Guarde seus melhores prompts em um arquivo de referência. Com o tempo, você terá uma biblioteca de prompts eficazes.", "analogy": "Refinar um prompt é como esculpir — cada iteração remove o excesso e revela a forma ideal.", "sos": "Se as respostas continuam genéricas, tente ser ultra-específico: mencione autores, datas, publicações ou contextos exatos."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 7: Pedir fontes e referências (Phase 3 - Execução)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  7,
  'pedir-fontes-referencias',
  'Pedir fontes e referências',
  'Solicite ao ChatGPT que indique fontes verificáveis',
  'ChatGPT',
  '🤖',
  '#e2e8f0', '#1e293b', '#6366f1',
  30, 70, 3,
  '[
    {
      "bar_text": "Solicite fontes explicitamente",
      "bar_sub": "O ChatGPT pode listar referências quando pedido",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "Uma das habilidades mais importantes: pedir fontes!"},
        {"type": "text", "content": "Prompt sugerido: ''Liste as fontes e referências bibliográficas para cada informação apresentada. Inclua links quando disponível.''"},
        {"type": "input", "label": "Peça fontes", "placeholder": "Quais são as fontes das informações acima? Cite artigos, livros ou sites verificáveis.", "highlight": true},
        {"type": "button", "label": "Enviar", "primary": true},
        {"type": "warning", "text": "O ChatGPT pode inventar referências! Sempre verifique se existem de verdade."}
      ],
      "tip": {"text": "Peça especificamente por DOIs, URLs ou ISBNs para facilitar a verificação."},
      "action": "request_sources",
      "check": null
    },
    {
      "bar_text": "Avalie as fontes recebidas",
      "bar_sub": "Nem todas as fontes citadas pela IA são reais",
      "bar_color": "#8B5CF6",
      "elements": [
        {"type": "text", "content": "O ChatGPT listou algumas fontes. Agora vem a parte crítica!"},
        {"type": "text", "content": "Classifique cada fonte recebida:"},
        {"type": "table", "headers": ["Tipo", "Confiabilidade", "Ação"], "rows": [["Artigo com DOI", "Alta", "Verificar DOI"], ["Livro com ISBN", "Alta", "Buscar no Google"], ["Site .gov / .edu", "Alta", "Acessar direto"], ["Blog ou site genérico", "Média", "Verificar autor"], ["Sem referência clara", "Baixa", "Desconsiderar"]]},
        {"type": "divider"},
        {"type": "text", "content": "No próximo passo, vamos verificar essas fontes no Google."}
      ],
      "tip": null,
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Peça fontes em formato acadêmico (ABNT, APA) para facilitar a citação em trabalhos.", "analogy": "Pedir fontes ao ChatGPT é como pedir o cardápio completo ao garçom — você precisa saber de onde vem cada prato.", "sos": "Se o ChatGPT disser que não pode fornecer fontes, reformule: ''Quais artigos ou livros publicados abordam este tema? Cite autores e títulos reais.''"}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 8: Verificar as fontes no Google (Phase 4 - Validação)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  8,
  'verificar-fontes-google',
  'Verificar as fontes no Google',
  'Valide cada fonte citada pelo ChatGPT usando o Google',
  'Chrome',
  '🌐',
  '#e2e8f0', '#1e293b', '#6366f1',
  40, 80, 4,
  '[
    {
      "bar_text": "Abra uma nova aba",
      "bar_sub": "Vamos verificar cada fonte no Google",
      "bar_color": "#EA4335",
      "elements": [
        {"type": "chrome_header", "url": "https://www.google.com"},
        {"type": "text", "content": "Abra uma nova aba no Chrome (Ctrl+T) e acesse o Google."},
        {"type": "text", "content": "Copie o título ou DOI da primeira fonte citada pelo ChatGPT."},
        {"type": "input", "label": "Pesquisar no Google", "placeholder": "Cole aqui o título do artigo ou DOI...", "highlight": true},
        {"type": "button", "label": "Pesquisar", "primary": true}
      ],
      "tip": {"text": "Use Ctrl+T para abrir nova aba sem fechar o ChatGPT."},
      "action": "google_search",
      "check": null
    },
    {
      "bar_text": "Verifique a existência da fonte",
      "bar_sub": "A fonte existe? Os dados batem?",
      "bar_color": "#EA4335",
      "elements": [
        {"type": "chrome_header", "url": "https://www.google.com/search?q=artigo+pesquisa"},
        {"type": "text", "content": "Analise os resultados da pesquisa:"},
        {"type": "text", "content": "✅ A fonte aparece nos resultados? ✅ O autor e ano são os mesmos? ✅ O conteúdo corresponde ao citado?"},
        {"type": "divider"},
        {"type": "warning", "text": "Se a fonte não existe no Google, provavelmente foi inventada pelo ChatGPT!"},
        {"type": "text", "content": "Marque cada fonte como ''verificada'' ou ''não encontrada'' no seu documento."}
      ],
      "tip": null,
      "action": null,
      "check": null
    },
    {
      "bar_text": "Use o Google Scholar",
      "bar_sub": "Para fontes acadêmicas, o Scholar é mais preciso",
      "bar_color": "#EA4335",
      "elements": [
        {"type": "chrome_header", "url": "https://scholar.google.com"},
        {"type": "text", "content": "Para pesquisa acadêmica, use o Google Scholar (scholar.google.com)."},
        {"type": "input", "label": "Google Scholar", "placeholder": "Busque artigos acadêmicos aqui...", "highlight": true},
        {"type": "text", "content": "O Scholar mostra artigos revisados por pares, citações e permite filtrar por data."},
        {"type": "tooltip_term", "term": "Revisão por pares", "tip": "Processo onde outros especialistas avaliam um artigo antes da publicação"},
        {"type": "text", "content": "Compare: as informações do ChatGPT batem com os artigos reais?"}
      ],
      "tip": {"text": "No Google Scholar, clique em ''Citado por'' para encontrar artigos relacionados."},
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Crie o hábito de verificar pelo menos 3 fontes diferentes para cada informação importante.", "analogy": "Verificar fontes é como checar os ingredientes de um produto — o rótulo pode dizer uma coisa, mas a realidade pode ser outra.", "sos": "Se não encontrar a fonte no Google, tente buscar pelo nome do autor + tema no Google Scholar. Se mesmo assim não achar, considere a informação como não verificada."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 9: Comparar com fontes oficiais (Phase 4 - Validação)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  9,
  'comparar-fontes-oficiais',
  'Comparar com fontes oficiais',
  'Cruze as informações do ChatGPT com fontes confiáveis',
  'Chrome',
  '🌐',
  '#e2e8f0', '#1e293b', '#6366f1',
  30, 90, 4,
  '[
    {
      "bar_text": "Acesse fontes oficiais",
      "bar_sub": "Sites governamentais, universidades e organizações reconhecidas",
      "bar_color": "#EA4335",
      "elements": [
        {"type": "chrome_header", "url": "https://scholar.google.com"},
        {"type": "text", "content": "Agora vamos cruzar as informações com fontes oficiais."},
        {"type": "text", "content": "Fontes confiáveis incluem:"},
        {"type": "text", "content": "• Sites .gov (governamentais)\n• Sites .edu (universidades)\n• Organizações como OMS, ONU, IBGE\n• Revistas científicas indexadas"},
        {"type": "divider"},
        {"type": "warning", "text": "Desconfie de informações que só aparecem em uma única fonte!"}
      ],
      "tip": {"text": "Sites com domínio .gov.br e .edu.br são geralmente mais confiáveis que .com.br para dados oficiais."},
      "action": null,
      "check": null
    },
    {
      "bar_text": "Monte sua tabela de validação",
      "bar_sub": "Organize quais informações foram confirmadas",
      "bar_color": "#EA4335",
      "elements": [
        {"type": "text", "content": "Crie uma tabela de validação para cada informação:"},
        {"type": "table", "headers": ["Informação", "ChatGPT disse", "Fonte oficial", "Status"], "rows": [["Dado estatístico X", "valor A", "valor A (IBGE)", "✅ Confirmado"], ["Tendência Y", "descrição B", "Não encontrado", "⚠️ Não verificado"], ["Autor Z", "citação C", "citação C (Scopus)", "✅ Confirmado"]]},
        {"type": "warning", "text": "Informações não verificadas devem ser marcadas como ''segundo o ChatGPT'' no seu trabalho."},
        {"type": "text", "content": "Pronto! Você agora tem informações validadas e confiáveis."},
        {"type": "text", "content": "No próximo passo, vamos organizar tudo no Google Docs."}
      ],
      "tip": null,
      "action": null,
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Sempre cite a fonte original, não o ChatGPT. A IA é uma ferramenta de descoberta, não uma fonte em si.", "analogy": "Comparar fontes é como triangular um sinal de GPS — quanto mais pontos de referência, mais precisa é a localização.", "sos": "Se não consegue encontrar fontes oficiais sobre o tema, pode ser um assunto muito novo ou nicho. Nesse caso, procure especialistas no LinkedIn ou ResearchGate."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- Step 10: Organizar no Google Docs (Phase 5 - Conclusão)
INSERT INTO v10_lesson_steps (lesson_id, step_number, slug, title, description, app_name, app_icon, app_badge_bg, app_badge_color, accent_color, duration_seconds, progress_percent, phase, frames, liv, warnings, audio_url)
VALUES (
  'a0000001-0001-4000-8000-000000000001',
  10,
  'organizar-google-docs',
  'Organizar no Google Docs',
  'Compile e organize todos os resultados da pesquisa em um documento',
  'Google Docs',
  '📝',
  '#e2e8f0', '#1e293b', '#6366f1',
  45, 100, 5,
  '[
    {
      "bar_text": "Abra o Google Docs",
      "bar_sub": "Crie um novo documento para sua pesquisa",
      "bar_color": "#4285F4",
      "elements": [
        {"type": "chrome_header", "url": "https://docs.google.com"},
        {"type": "text", "content": "Abra o Google Docs e crie um novo documento em branco."},
        {"type": "button", "label": "+ Documento em branco", "primary": true},
        {"type": "text", "content": "Dê um título descritivo ao documento, como: ''Pesquisa: [Seu Tema] - [Data]''"},
        {"type": "input", "label": "Título do documento", "placeholder": "Pesquisa: Marketing Digital 2026 - Março", "highlight": true}
      ],
      "tip": {"text": "O Google Docs salva automaticamente. Você não vai perder nada!"},
      "action": "open_docs",
      "check": null
    },
    {
      "bar_text": "Estruture o documento",
      "bar_sub": "Use uma estrutura profissional para organizar a pesquisa",
      "bar_color": "#4285F4",
      "elements": [
        {"type": "text", "content": "Organize seu documento com esta estrutura:"},
        {"type": "text", "content": "1. Título e Data\n2. Objetivo da Pesquisa\n3. Metodologia (prompts usados)\n4. Resultados Principais\n5. Fontes Verificadas\n6. Conclusão"},
        {"type": "divider"},
        {"type": "text", "content": "Use títulos e subtítulos (Heading 1, Heading 2) para organizar as seções."},
        {"type": "tooltip_term", "term": "Heading", "tip": "Título ou subtítulo formatado que organiza o documento em seções"},
        {"type": "text", "content": "Copie e cole os melhores trechos das respostas do ChatGPT nas seções apropriadas."}
      ],
      "tip": null,
      "action": null,
      "check": null
    },
    {
      "bar_text": "Adicione a tabela de fontes",
      "bar_sub": "Registre todas as fontes verificadas no documento",
      "bar_color": "#4285F4",
      "elements": [
        {"type": "text", "content": "No final do documento, crie uma seção ''Referências'' com todas as fontes."},
        {"type": "table", "headers": ["#", "Fonte", "Tipo", "URL/DOI", "Verificada"], "rows": [["1", "Artigo sobre IA na educação", "Artigo científico", "doi:10.xxxx", "Sim"], ["2", "Relatório IBGE 2025", "Dados oficiais", "ibge.gov.br/...", "Sim"], ["3", "Blog TechCrunch", "Mídia especializada", "techcrunch.com/...", "Sim"]]},
        {"type": "divider"},
        {"type": "text", "content": "Parabéns! Você completou uma pesquisa profissional usando o ChatGPT!"},
        {"type": "text", "content": "Agora você sabe: criar prompts eficazes, refinar respostas, verificar fontes e organizar resultados."},
        {"type": "button", "label": "Salvar documento", "primary": true}
      ],
      "tip": {"text": "Compartilhe o documento com colegas usando o botão ''Compartilhar'' no canto superior direito."},
      "action": "save_document",
      "check": null
    }
  ]'::jsonb,
  '{"tip": "Crie um template padrão de pesquisa no Google Docs. Assim você ganha tempo nas próximas pesquisas.", "analogy": "Organizar no Google Docs é como arquivar documentos em pastas etiquetadas — sem organização, mesmo a melhor pesquisa se perde.", "sos": "Se não tem acesso ao Google Docs, use qualquer editor de texto. O importante é documentar e organizar seus achados."}'::jsonb,
  NULL,
  NULL
)
ON CONFLICT (lesson_id, step_number) DO NOTHING;

-- ============================================================
-- 5. v10_bpa_pipeline (1 row)
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
  'a0000001-0001-4000-8000-000000000002',
  'a0000001-0001-4000-8000-000000000001',
  'chatgpt-pesquisa',
  'Como usar o ChatGPT para Pesquisa',
  'published',
  7,
  'fernando',
  85, 90, 80, 85, 75, 95, 'green',
  'Documentação oficial OpenAI, tutoriais de pesquisa acadêmica, guias de fact-checking.',
  10, 10, true,
  5, 5, 5,
  10, 6, 4, 10,
  2, 2, 2,
  '{"intro_slides": true, "narration_a": true, "narration_c": true, "all_steps": true, "frames_valid": true, "liv_hints": true, "audio_synced": true, "final_review": true}'::jsonb,
  true,
  now() - interval '3 days',
  now() - interval '2 days',
  now() - interval '1 day',
  'fernando'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. v10_bpa_pipeline_log (3 entries)
-- Delete existing seed logs first to ensure idempotency (table has no natural unique key)
-- ============================================================
DELETE FROM v10_bpa_pipeline_log
WHERE pipeline_id = 'a0000001-0001-4000-8000-000000000002';

INSERT INTO v10_bpa_pipeline_log (pipeline_id, stage, action, details, created_at)
VALUES
  ('a0000001-0001-4000-8000-000000000002', 1, 'score_calculated',
   '{"score_total": 85, "semaphore": "green", "message": "Aula aprovada para produção com score 85/100."}'::jsonb,
   now() - interval '7 days'),
  ('a0000001-0001-4000-8000-000000000002', 2, 'steps_generated',
   '{"steps_count": 10, "audit_status": "passed", "message": "10 passos gerados e auditados com sucesso."}'::jsonb,
   now() - interval '5 days'),
  ('a0000001-0001-4000-8000-000000000002', 7, 'published',
   '{"published_by": "fernando", "message": "Aula publicada com sucesso. Todos os checklists aprovados."}'::jsonb,
   now() - interval '1 day');
