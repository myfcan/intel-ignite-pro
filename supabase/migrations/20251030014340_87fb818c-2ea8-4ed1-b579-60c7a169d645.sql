-- ============================================
-- SEED DATA COMPLETO - INTELIGÊNCIA IGNITE
-- ============================================
-- 4 Trilhas + 20 Aulas + Exercícios
-- Primeiras 3 aulas com conteúdo COMPLETO
-- ============================================

-- ============================================
-- 1. TRILHAS (4 principais)
-- ============================================

INSERT INTO trails (id, title, description, icon, order_index, is_active) VALUES
('efa0c22c-26fb-4a1e-b5a8-1234567890a1', 
 'Fundamentos de IA', 
 'Aprenda os conceitos básicos de Inteligência Artificial de forma simples e prática',
 'graduation-cap',
 1,
 true),

('efa0c22c-26fb-4a1e-b5a8-1234567890a2',
 'IA no Dia a Dia',
 'Descubra como usar IA em tarefas cotidianas para ganhar tempo e produtividade',
 'smartphone',
 2,
 true),

('efa0c22c-26fb-4a1e-b5a8-1234567890a3',
 'IA nos Negócios',
 'Aplique IA no seu trabalho e negócio para resultados profissionais',
 'briefcase',
 3,
 true),

('efa0c22c-26fb-4a1e-b5a8-1234567890a4',
 'Renda Extra com IA',
 'Aprenda a monetizar suas habilidades com IA e gerar renda extra',
 'dollar-sign',
 4,
 true);

-- ============================================
-- 2. AULAS - TRILHA 1: FUNDAMENTOS DE IA
-- ============================================

INSERT INTO lessons (id, trail_id, title, description, content_text, estimated_time, difficulty_level, order_index, is_active) VALUES
('11111111-1111-1111-1111-111111111101',
 'efa0c22c-26fb-4a1e-b5a8-1234567890a1',
 'O que é IA e por que você precisa dela',
 'Entenda o que realmente é Inteligência Artificial e como ela vai transformar sua vida',
 '# O que é Inteligência Artificial?

Imagine ter um assistente pessoal que nunca dorme, nunca fica cansado e está sempre pronto para ajudar. Esse é o poder da Inteligência Artificial.

## A definição simples

Inteligência Artificial (IA) são programas de computador que conseguem aprender e tomar decisões, quase como um ser humano faria. Mas em vez de ter um cérebro biológico, a IA usa dados e padrões para "pensar".

**Pense assim:** Se você mostra 1000 fotos de gatos para uma criança, ela aprende a reconhecer gatos. A IA funciona parecido - você mostra milhões de exemplos, e ela aprende padrões.

## Por que isso importa para VOCÊ?

Se você tem mais de 38 anos, provavelmente cresceu sem internet, depois viu ela mudar tudo. A IA é **ainda maior** que a internet. E a boa notícia? Você não precisa ser programador para usar.

### 3 coisas que a IA pode fazer por você HOJE:

**1. Escrever textos profissionais em segundos**
- Emails de trabalho
- Propostas comerciais
- Posts para redes sociais
- Respostas para clientes

**2. Organizar sua vida e negócio**
- Criar listas de tarefas inteligentes
- Planejar eventos e viagens
- Fazer planilhas e análises
- Resumir documentos longos

**3. Gerar ideias e resolver problemas**
- Brainstorming instantâneo
- Soluções criativas para desafios
- Aprender qualquer assunto novo
- Tomar decisões mais informadas

## A verdade que ninguém te conta

Muita gente acha que IA é "coisa de jovem" ou "muito complicado". **Isso é mentira.**

A IA moderna foi feita para ser CONVERSACIONAL. Você literalmente fala com ela como falaria com uma pessoa. Se você sabe mandar WhatsApp, você sabe usar IA.

## O que vem por aí neste curso

Nas próximas aulas, você vai:
- Conhecer as principais ferramentas de IA (são gratuitas!)
- Aprender a "conversar" com a IA do jeito certo
- Ver exemplos práticos que você pode usar hoje mesmo
- Descobrir como evitar erros comuns

**A revolução já começou. E você acabou de entrar nela.**',
 8,
 'beginner',
 1,
 true),

('11111111-1111-1111-1111-111111111102',
 'efa0c22c-26fb-4a1e-b5a8-1234567890a1',
 'Principais ferramentas de IA gratuitas',
 'Conheça as 3 ferramentas essenciais que você vai usar todos os dias',
 '# As 3 Ferramentas de IA que Você Precisa Conhecer

Existem centenas de ferramentas de IA. Mas para começar, você só precisa de 3. E são todas **100% gratuitas**.

## 1. ChatGPT (OpenAI)

**O que é:** O mais famoso. É como ter um assistente super inteligente que responde qualquer pergunta.

**Para que serve:**
- Escrever textos de qualquer tipo
- Traduzir idiomas
- Explicar conceitos difíceis
- Criar listas e organizar ideias
- Dar conselhos e sugestões

**Como criar sua conta:**
1. Acesse: chat.openai.com
2. Clique em "Sign up"
3. Use seu email ou conta Google
4. Pronto! Já pode começar a usar

**Versão grátis vs paga:**
- Grátis (GPT-3.5): Rápido, ótimo para 90% das tarefas
- Pago (GPT-4): Mais inteligente, melhor para textos complexos
- **Nossa recomendação:** Comece com o grátis!

## 2. Google Gemini

**O que é:** A IA do Google. Integrada com Gmail, Docs e outras ferramentas que você já usa.

**Para que serve:**
- Buscar informações atualizadas (conectado com Google)
- Resumir emails longos
- Criar apresentações no Google Slides
- Analisar imagens e documentos

**Como acessar:**
1. Acesse: gemini.google.com
2. Faça login com sua conta Google
3. Comece a usar imediatamente

**Diferencial:** Se você já usa Gmail e Google Docs, o Gemini se integra perfeitamente com tudo.

## 3. Claude (Anthropic)

**O que é:** O "pensador profundo". Melhor para textos longos e análises complexas.

**Para que serve:**
- Escrever artigos e relatórios extensos
- Analisar documentos grandes (contratos, manuais)
- Conversas mais naturais e contextuais
- Programação e tarefas técnicas

**Como acessar:**
1. Acesse: claude.ai
2. Crie conta com email
3. Comece a usar (versão gratuita é muito generosa)

**Diferencial:** Consegue "lembrar" de conversas anteriores melhor que os outros.

## Qual usar quando?

**Use ChatGPT quando:**
- Precisar de algo rápido
- Quiser fazer listas e organizar
- Precisar de criatividade (ideias, nomes, slogans)

**Use Google Gemini quando:**
- Precisar de informações atualizadas
- Já estiver trabalhando no Google Docs/Gmail
- Quiser buscar na web junto com IA

**Use Claude quando:**
- Precisar escrever textos longos
- Tiver documentos grandes para analisar
- Quiser uma conversa mais aprofundada

## A verdade sobre "qual é o melhor"

**Não existe "o melhor".** Cada um é melhor para coisas diferentes. Profissionais usam os 3!

Pense assim: você tem WhatsApp, Instagram e Email. Não usa só um, certo? Com IA é igual - cada ferramenta tem seu momento.

## Exercício prático

Depois desta aula, **crie conta nas 3 ferramentas**. Leva só 5 minutos cada.

Na próxima aula, vamos aprender a CONVERSAR com essas ferramentas do jeito certo.',
 10,
 'beginner',
 2,
 true),

('11111111-1111-1111-1111-111111111103',
 'efa0c22c-26fb-4a1e-b5a8-1234567890a1',
 'Como conversar com a IA: o segredo dos prompts',
 'Aprenda a técnica que multiplica a qualidade das respostas da IA',
 '# O Segredo para Resultados Incríveis com IA

A diferença entre uma pessoa que usa IA "mais ou menos" e alguém que tira resultados incríveis está em **UMA COISA**: saber fazer as perguntas certas.

Chamamos isso de **"prompts"** - é como você se comunica com a IA.

## O que você vai aprender agora muda tudo

Imagine a diferença entre estas duas situações:

**Pergunta ruim:** "escreve um email"
**Resultado:** Email genérico, sem personalidade, não serve pra nada

**Pergunta boa:** "Escreva um email profissional para meu cliente João agradecendo a reunião de ontem e confirmando o orçamento de R$ 5.000 que discutimos. Tom cordial mas objetivo."
**Resultado:** Email perfeito, pronto para enviar

Viu a diferença? Mesma IA, resultados COMPLETAMENTE diferentes.

## A Fórmula dos 4 Elementos

Todo prompt poderoso tem 4 elementos. Memorize isso:

### 1. CONTEXTO (Quem é você?)
Diga à IA quem você é e o que está fazendo.

❌ Ruim: "me ajuda com vendas"
✅ Bom: "Sou dentista e preciso enviar uma proposta de tratamento"

### 2. TAREFA (O que você quer?)
Seja específico sobre o que precisa.

❌ Ruim: "escreve algo"
✅ Bom: "Escreva um email de 3 parágrafos"

### 3. DETALHES (Como deve ser?)
Dê informações importantes.

❌ Ruim: (sem detalhes)
✅ Bom: "Para uma cliente chamada Ana, que tem medo de dentista, sobre um clareamento dental, valor R$ 800"

### 4. TOM (Que estilo?)
Defina como quer que a IA "fale".

❌ Ruim: (sem especificar)
✅ Bom: "Tom amigável e tranquilizador, sem ser informal demais"

## Exemplos Práticos: Antes e Depois

### Exemplo 1: Email Profissional

**ANTES (prompt ruim):**
"escreve email pra cliente"

**DEPOIS (prompt bom):**
"Sou contador e preciso enviar um email para meu cliente Carlos lembrando que o prazo para enviar documentos do imposto de renda é sexta-feira. O email deve ser educado mas criar senso de urgência, com no máximo 2 parágrafos."

### Exemplo 2: Post para Instagram

**ANTES (prompt ruim):**
"cria post instagram"

**DEPOIS (prompt bom):**
"Sou personal trainer e quero criar um post para Instagram sobre a importância de beber água durante o treino. O post deve ter um gancho chamativo na primeira linha, 3 benefícios principais, e terminar com uma pergunta para engajar os seguidores. Máximo 150 palavras. Tom motivacional mas não exagerado."

### Exemplo 3: Lista de Tarefas

**ANTES (prompt ruim):**
"organiza meu dia"

**DEPOIS (prompt bom):**
"Preciso organizar minha terça-feira. Tenho reunião às 10h, preciso ir ao banco, fazer 3 orçamentos, e buscar meu filho às 17h30. Me ajude a criar uma lista de tarefas priorizando o mais importante primeiro, considerando 1h de almoço entre 12h-13h."

## A Técnica Secreta: Iteração

Profissionais não acertam de primeira. Eles **conversam** com a IA.

**Passo 1:** Faça seu primeiro prompt
**Passo 2:** Veja o resultado
**Passo 3:** Diga: "Ótimo, mas agora deixe mais curto" ou "Mude o tom para mais formal"
**Passo 4:** IA ajusta especificamente o que você pediu

É uma **conversa**, não uma única pergunta!

## Erros Comuns (e como evitar)

### Erro 1: Ser vago demais
❌ "me ajuda com meu negócio"
✅ "Sou dono de uma loja de roupas e preciso criar uma promoção para o Dia das Mães"

### Erro 2: Pedir tudo de uma vez
❌ "Crie um plano de marketing completo, site, logos e estratégia de vendas"
✅ Divida em etapas: primeiro "me ajude a definir meu público-alvo", depois "crie uma estratégia de posts", etc.

### Erro 3: Não dar exemplos
❌ "escreve no meu estilo"
✅ "Escreva no meu estilo. Exemplo de como eu escrevo: [cole um texto seu]"

## Template Pronto (Copie e Use!)

```
Contexto: [Sua profissão/situação]
Tarefa: [O que você quer que a IA faça]
Detalhes importantes:
- [Detalhe 1]
- [Detalhe 2]
- [Detalhe 3]
Tom desejado: [Como deve soar]
```

## Exercício Prático

Vá agora mesmo no ChatGPT e teste estes dois prompts:

**Teste 1 (ruim):** "me ajuda com vendas"
**Teste 2 (bom):** "Sou [sua profissão] e preciso criar uma mensagem de WhatsApp para clientes inativos voltarem a comprar. A mensagem deve ser curta (máximo 3 linhas), oferecer 10% de desconto, e ter tom amigável mas profissional."

Compare os resultados. A diferença vai te surpreender!

**Próxima aula:** Vamos ver os erros mais comuns que iniciantes cometem e como evitar.',
 12,
 'beginner',
 3,
 true),

('11111111-1111-1111-1111-111111111104', 'efa0c22c-26fb-4a1e-b5a8-1234567890a1', 'Erros comuns e como evitar', 'Os 7 erros que iniciantes cometem e como nunca cair neles', 'Conteúdo será adicionado em breve...', 10, 'beginner', 4, true),
('11111111-1111-1111-1111-111111111105', 'efa0c22c-26fb-4a1e-b5a8-1234567890a1', 'Sua primeira tarefa real com IA', 'Exercício prático: crie algo útil para usar hoje mesmo', 'Conteúdo será adicionado em breve...', 15, 'beginner', 5, true);

-- Trilha 2: IA no Dia a Dia
INSERT INTO lessons (id, trail_id, title, description, content_text, estimated_time, difficulty_level, order_index, is_active) VALUES
('22222222-2222-2222-2222-222222222201', 'efa0c22c-26fb-4a1e-b5a8-1234567890a2', 'Organizar sua rotina com IA', 'Como usar IA para gerenciar tarefas e aumentar produtividade', 'Conteúdo será adicionado...', 8, 'beginner', 1, true),
('22222222-2222-2222-2222-222222222202', 'efa0c22c-26fb-4a1e-b5a8-1234567890a2', 'Escrever emails profissionais', 'Crie emails perfeitos em segundos para qualquer situação', 'Conteúdo será adicionado...', 10, 'beginner', 2, true),
('22222222-2222-2222-2222-222222222203', 'efa0c22c-26fb-4a1e-b5a8-1234567890a2', 'Planejar viagens e eventos', 'Use IA como seu assistente pessoal de planejamento', 'Conteúdo será adicionado...', 9, 'beginner', 3, true),
('22222222-2222-2222-2222-222222222204', 'efa0c22c-26fb-4a1e-b5a8-1234567890a2', 'Aprender qualquer assunto novo', 'Técnica para usar IA como professor particular', 'Conteúdo será adicionado...', 12, 'intermediate', 4, true),
('22222222-2222-2222-2222-222222222205', 'efa0c22c-26fb-4a1e-b5a8-1234567890a2', 'Criar apresentações e documentos', 'De slides a relatórios: tudo mais rápido com IA', 'Conteúdo será adicionado...', 11, 'intermediate', 5, true);

-- Trilha 3: IA nos Negócios
INSERT INTO lessons (id, trail_id, title, description, content_text, estimated_time, difficulty_level, order_index, is_active) VALUES
('33333333-3333-3333-3333-333333333301', 'efa0c22c-26fb-4a1e-b5a8-1234567890a3', 'IA para atendimento ao cliente', 'Responda clientes mais rápido e profissionalmente', 'Conteúdo será adicionado...', 10, 'intermediate', 1, true),
('33333333-3333-3333-3333-333333333302', 'efa0c22c-26fb-4a1e-b5a8-1234567890a3', 'Criar propostas e orçamentos', 'Documentos profissionais em minutos', 'Conteúdo será adicionado...', 12, 'intermediate', 2, true),
('33333333-3333-3333-3333-333333333303', 'efa0c22c-26fb-4a1e-b5a8-1234567890a3', 'Marketing digital com IA', 'Posts, anúncios e estratégias de marketing', 'Conteúdo será adicionado...', 15, 'intermediate', 3, true),
('33333333-3333-3333-3333-333333333304', 'efa0c22c-26fb-4a1e-b5a8-1234567890a3', 'Análise de dados e relatórios', 'Transforme números em insights com IA', 'Conteúdo será adicionado...', 13, 'advanced', 4, true),
('33333333-3333-3333-3333-333333333305', 'efa0c22c-26fb-4a1e-b5a8-1234567890a3', 'Automatizar processos', 'Economize horas com automações inteligentes', 'Conteúdo será adicionado...', 14, 'advanced', 5, true);

-- Trilha 4: Renda Extra com IA
INSERT INTO lessons (id, trail_id, title, description, content_text, estimated_time, difficulty_level, order_index, is_active) VALUES
('44444444-4444-4444-4444-444444444401', 'efa0c22c-26fb-4a1e-b5a8-1234567890a4', 'Serviços rentáveis com IA', 'Os 10 serviços mais lucrativos que você pode oferecer', 'Conteúdo será adicionado...', 12, 'intermediate', 1, true),
('44444444-4444-4444-4444-444444444402', 'efa0c22c-26fb-4a1e-b5a8-1234567890a4', 'Como precificar seus serviços', 'Calcule quanto cobrar e como justificar seu valor', 'Conteúdo será adicionado...', 10, 'intermediate', 2, true),
('44444444-4444-4444-4444-444444444403', 'efa0c22c-26fb-4a1e-b5a8-1234567890a4', 'Encontrar seus primeiros clientes', 'Estratégias práticas para conseguir trabalho', 'Conteúdo será adicionado...', 15, 'intermediate', 3, true),
('44444444-4444-4444-4444-444444444404', 'efa0c22c-26fb-4a1e-b5a8-1234567890a4', 'Criar portfólio e proposta', 'Monte uma apresentação profissional irresistível', 'Conteúdo será adicionado...', 11, 'intermediate', 4, true),
('44444444-4444-4444-4444-444444444405', 'efa0c22c-26fb-4a1e-b5a8-1234567890a4', 'Escalar sua renda com IA', 'De R$ 500 para R$ 5.000/mês: o passo a passo', 'Conteúdo será adicionado...', 18, 'advanced', 5, true);

-- ============================================
-- EXERCÍCIOS
-- ============================================

INSERT INTO exercises (id, lesson_id, type, question, options, correct_answer, explanation, order_index) VALUES
-- Aula 1 - Exercícios
('e1111111-1111-1111-1111-111111111101', '11111111-1111-1111-1111-111111111101', 'multiple_choice', 'O que melhor define Inteligência Artificial?', '["Robôs que vão dominar o mundo", "Programas que aprendem com dados e tomam decisões", "Apenas computadores muito rápidos", "Tecnologia que só empresas grandes podem usar"]', 'Programas que aprendem com dados e tomam decisões', 'IA são programas que aprendem padrões a partir de dados, similar a como humanos aprendem com experiência.', 1),
('e1111111-1111-1111-1111-111111111102', '11111111-1111-1111-1111-111111111101', 'multiple_choice', 'Você precisa ser programador para usar IA no dia a dia?', '["Verdadeiro - precisa saber programar", "Falso - qualquer pessoa pode usar", "Só pessoas jovens conseguem usar", "Precisa fazer curso técnico antes"]', 'Falso - qualquer pessoa pode usar', 'IA moderna é conversacional. Se você sabe usar WhatsApp, consegue usar IA!', 2),
('e1111111-1111-1111-1111-111111111103', '11111111-1111-1111-1111-111111111101', 'multiple_choice', 'Qual destas tarefas a IA NÃO pode fazer por você hoje?', '["Escrever emails profissionais", "Ler sua mente e saber o que você quer sem você falar", "Criar listas de tarefas organizadas", "Resumir textos longos"]', 'Ler sua mente e saber o que você quer sem você falar', 'IA precisa que você diga o que quer. Ela não lê mentes - você precisa se comunicar claramente!', 3),

-- Aula 2 - Exercícios  
('e1111111-1111-1111-1111-111111111201', '11111111-1111-1111-1111-111111111102', 'multiple_choice', 'Você precisa buscar informações atualizadas sobre notícias de hoje. Qual ferramenta é melhor?', '["ChatGPT", "Google Gemini", "Claude", "Todas funcionam igual"]', 'Google Gemini', 'Gemini está conectado com o Google Search, então tem acesso a informações mais recentes.', 1),
('e1111111-1111-1111-1111-111111111202', '11111111-1111-1111-1111-111111111102', 'multiple_choice', 'Para escrever um artigo longo e detalhado, qual ferramenta é mais indicada?', '["ChatGPT - é o mais rápido", "Google Gemini - está conectado à web", "Claude - é melhor para textos longos", "Não importa, todas são iguais"]', 'Claude - é melhor para textos longos', 'Claude se destaca em textos extensos e mantém contexto melhor em conversas longas.', 2),
('e1111111-1111-1111-1111-111111111203', '11111111-1111-1111-1111-111111111102', 'multiple_choice', 'Quantas dessas ferramentas (ChatGPT, Gemini, Claude) têm versão gratuita funcional?', '["Nenhuma - todas são pagas", "Apenas uma delas", "Duas delas", "Todas as três têm versão grátis"]', 'Todas as três têm versão grátis', 'Excelente notícia! Todas têm versão gratuita que já resolve 90% das suas necessidades.', 3),

-- Aula 3 - Exercícios
('e1111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111103', 'multiple_choice', 'Qual destes prompts vai gerar um resultado melhor?', '["escreve um email", "Preciso de um email profissional para meu cliente Pedro agradecendo a reunião de ontem e confirmando o prazo de entrega para sexta-feira. Tom cordial.", "faz um texto", "me ajuda com email pro cliente"]', 'Preciso de um email profissional para meu cliente Pedro agradecendo a reunião de ontem e confirmando o prazo de entrega para sexta-feira. Tom cordial.', 'Este prompt tem TODOS os 4 elementos: contexto, tarefa específica, detalhes importantes e tom desejado!', 1),
('e1111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111103', 'multiple_choice', 'Quantos elementos principais um prompt poderoso deve ter?', '["2 elementos", "4 elementos (contexto, tarefa, detalhes, tom)", "Quanto mais elementos, melhor", "Só precisa da tarefa"]', '4 elementos (contexto, tarefa, detalhes, tom)', 'Memorize: Contexto + Tarefa + Detalhes + Tom = Resultado incrível!', 2),
('e1111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111103', 'multiple_choice', 'Se o primeiro resultado da IA não ficou perfeito, o que você deve fazer?', '["Desistir e escrever você mesmo", "Trocar de ferramenta de IA", "Continuar a conversa pedindo ajustes específicos", "Fazer o mesmo prompt de novo"]', 'Continuar a conversa pedindo ajustes específicos', 'Profissionais CONVERSAM com a IA! Diga: "Ótimo, mas deixe mais curto" ou "Mude para tom mais formal".', 3),

-- Aula 4 - Exercícios
('e1111111-1111-1111-1111-111111111401', '11111111-1111-1111-1111-111111111104', 'multiple_choice', 'Qual o erro mais comum ao usar IA?', '["Ser específico demais", "Ser vago demais", "Conversar muito com a IA", "Pedir exemplos"]', 'Ser vago demais', 'Quanto mais vago, pior o resultado. Seja específico!', 1),
('e1111111-1111-1111-1111-111111111402', '11111111-1111-1111-1111-111111111104', 'multiple_choice', 'A IA sempre dá respostas 100% corretas?', '["Sim, sempre", "Não, você deve verificar informações importantes", "Só quando você paga", "Depende da ferramenta"]', 'Não, você deve verificar informações importantes', 'IA é poderosa mas pode errar. Sempre verifique fatos importantes!', 2),

-- Exercícios básicos outras trilhas
('e2222222-2222-2222-2222-222222222201', '22222222-2222-2222-2222-222222222201', 'multiple_choice', 'Como a IA pode ajudar na organização?', '["Criando listas priorizadas", "Fazendo o trabalho por você", "Não ajuda em nada", "Só para empresas"]', 'Criando listas priorizadas', 'IA ajuda a organizar e priorizar suas tarefas de forma inteligente.', 1),
('e2222222-2222-2222-2222-222222222202', '22222222-2222-2222-2222-222222222202', 'multiple_choice', 'O que torna um email profissional bom?', '["Ser longo", "Ser claro e objetivo", "Ter muitas cores", "Usar gírias"]', 'Ser claro e objetivo', 'Emails profissionais devem ser diretos, claros e respeitosos.', 1),
('e3333333-3333-3333-3333-333333333301', '33333333-3333-3333-3333-333333333301', 'multiple_choice', 'IA pode ajudar no atendimento ao cliente?', '["Não, só humanos atendem", "Sim, criando respostas rápidas e personalizadas", "Só em inglês", "Só para grandes empresas"]', 'Sim, criando respostas rápidas e personalizadas', 'IA acelera atendimento mantendo qualidade e personalização!', 1),
('e4444444-4444-4444-4444-444444444401', '44444444-4444-4444-4444-444444444401', 'multiple_choice', 'Qual serviço mais rentável com IA?', '["Criar posts para redes sociais", "Todos listados na aula", "Nenhum dá dinheiro", "Só para quem já é rico"]', 'Todos listados na aula', 'Diversos serviços com IA são rentáveis - escolha o que combina com você!', 1)