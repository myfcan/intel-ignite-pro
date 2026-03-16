-- ============================================================
-- AILIV V10 — SEED: Scripts de narração com tags [ANCHOR:*]
-- Migration: 20260316140000_seed_narration_scripts_sdr_voz.sql
-- Data: 16/03/2026
-- Aula: SDR de Voz com IA (27 passos)
-- Lesson ID: b0000001-0001-4000-8000-000000000001
--
-- Cada script contém tags [ANCHOR:tipo] que marcam pontos de
-- sincronização. As tags são removidas antes do ElevenLabs.
-- O pipeline usa as frases após cada tag para match de timestamps.
-- ============================================================

-- Passo 1: Criar conta no Make.com
UPDATE v10_lesson_steps
SET narration_script = 'O Make.com é a ferramenta que vai conectar tudo na sua automação. Pense nele como o cérebro do sistema: quando entra um lead novo, o Make decide o que fazer.

Acesse make.com e crie sua conta gratuita.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Use o mesmo email que usa no Google — vai facilitar na hora de conectar as ferramentas depois. Na hora do cadastro, vai aparecer uma tela pedindo pra escolher a região. Escolha US, não Europe. E se aparecerem perguntas de onboarding, pode pular tudo até chegar no Dashboard.

[ANCHOR:confirmacao]
Deu certo se você vê o Dashboard do Make com o botão "Create a new scenario" no centro.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 1;

-- Passo 2: Criar conta no Bland AI
UPDATE v10_lesson_steps
SET narration_script = '[ANCHOR:troca_ferramenta]
Agora mudamos de ferramenta. Abra uma nova aba no navegador e acesse o Bland AI. Ele é quem vai fazer a ligação telefônica usando inteligência artificial.

Crie sua conta e vá direto pro Dashboard. Depois, no menu lateral, clique em Settings, depois na aba API Keys.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

A chave que aparece na tabela vem cortada — você não consegue copiar ela completa. Clique em "Create new API Key" pra gerar uma nova. Aí sim, copie a chave completa e cole no Bloco de Notas. Ela começa com "org" e vai ser usada no passo 17. Se aparecer um assistente chamado "Blandie", pode fechar — não precisamos dele agora.

[ANCHOR:confirmacao]
Deu certo se você tem a API Key completa salva no Bloco de Notas, começando com "org".'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 2;

-- Passo 3: Criar planilha de leads
UPDATE v10_lesson_steps
SET narration_script = '[ANCHOR:troca_ferramenta]
Agora vamos pro Google Sheets, em uma nova aba do navegador. Essa planilha vai ser o banco de dados dos seus leads — é onde ficam os dados de quem preencheu o formulário.

Crie uma planilha nova e renomeie pra "SDR Leads". Pode deixar ela completamente vazia — os cabeçalhos vão ser criados automaticamente pelo formulário no próximo passo.

[ANCHOR:confirmacao]
Deu certo se você tem uma planilha chamada "SDR Leads" aberta, vazia, no Google Sheets.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 3;

-- Passo 4: Criar formulário de captação
UPDATE v10_lesson_steps
SET narration_script = '[ANCHOR:troca_ferramenta]
Agora abra o Google Forms. Ele vai ser a porta de entrada dos leads — quando alguém preencher, os dados vão direto pra sua planilha.

Crie um formulário com cinco campos: Nome, Telefone com DDD, Email, Interesse, e um checkbox de consentimento.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

O texto do checkbox deve ser exatamente: "Aceito receber uma ligação sobre este assunto". Esse campo é obrigatório por lei — a LGPD exige consentimento antes de ligar. No Forms, marque esse campo como obrigatório clicando no toggle "Obrigatório" no canto inferior do campo.

[ANCHOR:confirmacao]
Deu certo se o formulário tem os 5 campos e o checkbox está marcado como obrigatório.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 4;

-- Passo 5: Conectar Forms à planilha
UPDATE v10_lesson_steps
SET narration_script = 'Agora conectamos o formulário à planilha SDR Leads que você criou no passo 3.

No formulário, clique na aba "Respostas" no topo, depois no ícone verde do Sheets. Escolha "Selecionar planilha existente" e selecione SDR Leads.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Isso vai criar automaticamente uma aba chamada "Form Responses 1" dentro da planilha. Guarde esse nome — é Form Responses 1, com F e R maiúsculos. Vai usar esse nome exato no passo 11. Não confunda com "Sheet1", que é a aba padrão.

[ANCHOR:confirmacao]
Deu certo se a planilha SDR Leads agora tem uma aba chamada "Form Responses 1".'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 5;

-- Passo 6: Testar o formulário
UPDATE v10_lesson_steps
SET narration_script = 'Antes de seguir, vamos testar se tudo funciona até aqui.

Clique no ícone de olho no topo do formulário pra abrir a visualização. Preencha com dados de teste — nome fictício, um telefone qualquer, email inventado — marque o consentimento e clique Enviar.

[ANCHOR:confirmacao]
Deu certo se apareceu a mensagem "Resposta registrada" no formulário.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 6;

-- Passo 7: Verificar dados na planilha
UPDATE v10_lesson_steps
SET narration_script = '[ANCHOR:troca_ferramenta]
Agora volte pra planilha SDR Leads e confira se os dados do teste chegaram.

Clique na aba "Form Responses 1" — não na Sheet1.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Os dados devem estar lá com Timestamp, Nome, Telefone, tudo certinho. Se a aba "Form Responses 1" estiver vazia, volte ao passo 5 e refaça a conexão.

[ANCHOR:confirmacao]
Deu certo se os dados de teste aparecem na planilha com todos os campos preenchidos. Boa! A conexão formulário–planilha está funcionando.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 7;

-- Passo 8: Criar cenário no Make
UPDATE v10_lesson_steps
SET narration_script = '[ANCHOR:troca_ferramenta]
Agora voltamos pro Make.com. Hora de criar a automação propriamente dita — o cenário. Cenário é o nome que o Make dá pra uma receita de automação.

No Dashboard do Make, clique em "Create a new scenario". Você vai ver uma tela em branco com um botão de mais no centro. É aqui que vamos montar toda a lógica.

[ANCHOR:confirmacao]
Deu certo se você está na tela do editor de cenários com o botão de mais no centro.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 8;

-- Passo 9: Adicionar Watch New Rows
UPDATE v10_lesson_steps
SET narration_script = 'Agora adicionamos o primeiro módulo no cenário. Módulo é cada passo dentro do cenário — como um ingrediente da receita.

Clique no mais no centro, busque "Google Sheets" e selecione "Watch New Rows". Esse módulo fica de olho na planilha esperando novos leads — toda vez que entrar uma linha nova, ele dispara o cenário.

[ANCHOR:confirmacao]
Deu certo se o módulo Watch New Rows apareceu como um círculo no editor.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 9;

-- Passo 10: Conectar Google ao Make
UPDATE v10_lesson_steps
SET narration_script = 'O Make precisa de permissão pra acessar sua conta Google. Vamos autorizar essa conexão agora.

No módulo Watch New Rows, clique nele pra abrir. Em Connection, selecione "Add new connection". Vai abrir uma janela do Google — escolha a mesma conta que usou pra criar a planilha.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Não feche a janela do Google até completar toda a autorização. Se fechar antes, a conexão falha e você vai precisar refazer. Clique em "Permitir" em todas as telas que aparecerem.

[ANCHOR:confirmacao]
Deu certo se o campo Connection mostra sua conta do Google com um check verde.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 10;

-- Passo 11: Configurar campos do Watch
UPDATE v10_lesson_steps
SET narration_script = 'Com o Google conectado, agora dizemos pro Watch qual planilha ele deve monitorar.

Configure os campos: Spreadsheet igual a "SDR Leads", Sheet Name igual a "Form Responses 1", Table contains headers igual a "Yes", e Limit igual a 1.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Em Sheet Name, selecione "Form Responses 1" — não "Sheet1". Se escolher Sheet1, o Watch vai monitorar a aba errada e a automação não vai funcionar.

[ANCHOR:confirmacao]
Deu certo se os 4 campos estão preenchidos e você clicou em OK.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 11;

-- Passo 12: Testar o Watch
UPDATE v10_lesson_steps
SET narration_script = 'Vamos ver se o Watch consegue ler os dados da planilha.

Clique em "Run Once" no canto inferior esquerdo do editor. Espere um momento.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Deve aparecer um balão verde no módulo mostrando "1 bundle" com os dados do teste que você inseriu no passo 6. Se aparecer "No data" ou erro 403, verifique se a conexão Google está ativa e se selecionou a planilha correta.

[ANCHOR:confirmacao]
Deu certo se o balão verde mostra os dados do seu teste.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 12;

-- Passo 13: Adicionar filtro
UPDATE v10_lesson_steps
SET narration_script = 'Agora adicionamos um filtro entre o Watch e o próximo módulo. Filtro é como um porteiro — ele decide quem passa e quem não passa. No nosso caso, só passa quem aceitou receber a ligação.

Clique na linha entre os módulos — não no módulo, na linha pontilhada — e selecione "Set up a filter". Um ícone de funil vai aparecer na conexão.

[ANCHOR:confirmacao]
Deu certo se o ícone de funil apareceu entre os dois módulos.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 13;

-- Passo 14: Configurar condição do filtro
UPDATE v10_lesson_steps
SET narration_script = 'Configure a condição do filtro que acabou de criar.

Em Label, coloque "Consentimento OK". No campo de condição, selecione o campo de Consentimento que vem do Watch, operador "Contains", e no valor, cole "Aceito".

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

O valor é case-sensitive — maiúsculas e minúsculas importam. Se na planilha está "Aceito" com A maiúsculo, aqui tem que ser igual. Copie direto da planilha pra não errar. Use "Contains" e não "Equals", porque o Google Forms às vezes retorna o valor como array.

[ANCHOR:confirmacao]
Deu certo se o filtro está salvo com o label "Consentimento OK".'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 14;

-- Passo 15: Adicionar módulo HTTP
UPDATE v10_lesson_steps
SET narration_script = 'Agora adicionamos o módulo que vai se comunicar com o Bland AI pra disparar a ligação. HTTP Request é como um pedido que um app manda pra outro.

Clique no mais após o filtro, busque "HTTP" e escolha "Make a request".

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Existem dois módulos HTTP parecidos. Escolha o "Make a request" simples — não o "Make an API Key Auth request". O segundo parece mais lógico, mas vai dar erro 401 com o Bland. O simples é o correto.

[ANCHOR:confirmacao]
Deu certo se o módulo HTTP apareceu conectado após o filtro.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 15;

-- Passo 16: Configurar URL e Método
UPDATE v10_lesson_steps
SET narration_script = 'Configure a URL e o método do pedido HTTP.

Em URL, cole: https://api.bland.ai/v1/calls. Em Method, selecione POST. POST significa que estamos enviando dados — no caso, o pedido pra fazer a ligação.

[ANCHOR:confirmacao]
Deu certo se a URL está preenchida e o método é POST.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 16;

-- Passo 17: Adicionar Header de autenticação
UPDATE v10_lesson_steps
SET narration_script = 'Agora adicionamos a autenticação — é aqui que entra a API Key do Bland que você copiou no passo 2. API Key é como uma senha que permite o Make acessar sua conta do Bland.

Em Headers, clique em "Add a header". No campo Name, escreva "authorization" — tudo minúsculo. No campo Value, cole sua API Key direto do Bloco de Notas.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Não coloque "Bearer" antes da key. Cole só a key, que começa com "org". Essa é uma particularidade do Bland — a maioria das APIs usa Bearer, mas o Bland não. Se colocar Bearer, vai dar erro 401.

[ANCHOR:confirmacao]
Deu certo se o header "authorization" aparece na lista com o valor da sua API Key.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 17;

-- Passo 18: Montar Body JSON
UPDATE v10_lesson_steps
SET narration_script = 'Agora montamos o corpo do pedido — o conteúdo que vamos enviar pro Bland. Body é como o recheio de uma carta — é onde vão os dados da ligação.

Em Body type, selecione "Raw". Em Content type, selecione "JSON". No campo de conteúdo, cole o template com os campos: phone_number, task, first_sentence, language igual a "pt", voice igual a "June", e max_duration igual a 5.

[ANCHOR:confirmacao]
Deu certo se o JSON está colado no campo de Body com os 6 campos.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 18;

-- Passo 19: Mapear variáveis da planilha
UPDATE v10_lesson_steps
SET narration_script = 'Agora trocamos os valores fixos pelas variáveis dinâmicas da planilha — assim cada lead novo recebe uma ligação personalizada.

No JSON, clique dentro do campo phone_number e selecione a variável Telefone que vem do Watch. No campo task, use as variáveis Nome e Interesse.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

No phone_number, adicione +55 antes da variável do telefone — o Bland precisa do código do Brasil. Se o lead já colocou o DDD, o formato final fica +5527999887766, por exemplo. Sem o +55, a ligação não completa.

[ANCHOR:confirmacao]
Deu certo se os campos phone_number e task mostram as variáveis dinâmicas em vez de texto fixo.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 19;

-- Passo 20: Escrever script do agente
UPDATE v10_lesson_steps
SET narration_script = 'Ainda no Make, vamos definir o que o agente de IA vai falar na ligação.

No campo task do JSON, escreva o roteiro: o agente se apresenta, pergunta sobre o interesse do lead, e se houver interesse, pergunta o melhor horário pra uma reunião. Mantenha curto e natural — máximo 2 minutos de conversa.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Esse é um modelo base pra testar. Depois que tudo funcionar, você personaliza pro seu negócio — troca o nome da empresa, ajusta o tom, adiciona perguntas específicas. A diferença entre um protótipo e uma máquina de vendas está no script.

[ANCHOR:confirmacao]
Deu certo se o campo task tem um roteiro completo de conversa.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 20;

-- Passo 21: Adicionar Update Row
UPDATE v10_lesson_steps
SET narration_script = '[ANCHOR:troca_ferramenta]
Continuamos no Make. Agora adicionamos um módulo pra atualizar a planilha depois que a ligação for feita — assim você sabe quem já foi contatado.

Clique no mais após o HTTP, busque "Google Sheets", e selecione "Update a Row".

[ANCHOR:confirmacao]
Deu certo se o módulo Update a Row apareceu conectado após o HTTP.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 21;

-- Passo 22: Configurar Update Row
UPDATE v10_lesson_steps
SET narration_script = 'Configure o Update Row pra atualizar a planilha SDR Leads, aba Form Responses 1.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Em Row Number, use a variável dinâmica que vem do Watch — não coloque um número fixo como "2". Se colocar número fixo, o Make vai sobrescrever sempre a mesma linha. A variável dinâmica garante que ele atualiza a linha correta do lead que acabou de receber a ligação. Na coluna de Status, coloque "Ligação enviada".

[ANCHOR:confirmacao]
Deu certo se o Row Number mostra a variável dinâmica e a coluna Status está preenchida.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 22;

-- Passo 23: Configurar agendamento
UPDATE v10_lesson_steps
SET narration_script = 'Agora definimos de quanto em quanto tempo o Make verifica se tem novos leads na planilha.

Clique no ícone de relógio no canto inferior do editor. Configure pra executar "At regular intervals" a cada 15 minutos.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

No plano gratuito do Make, 15 minutos é o intervalo mínimo — não dá pra colocar menos. Isso significa que entre o lead preencher o formulário e receber a ligação, pode levar até 15 minutos. Nos planos pagos, dá pra reduzir pra 1 minuto.

[ANCHOR:confirmacao]
Deu certo se o agendamento mostra "Every 15 minutes".'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 23;

-- Passo 24: Salvar e ativar cenário
UPDATE v10_lesson_steps
SET narration_script = 'Hora de ligar tudo. Salve o cenário com Control S e ative o switch no canto inferior esquerdo.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Quando o switch ficar na posição ON, o cenário começa a rodar automaticamente. Sem ativar esse switch, nada funciona — é o erro mais comum. Verifique que o switch está verde e na posição ON.

[ANCHOR:confirmacao]
Deu certo se o switch está verde, na posição ON, e o cenário mostra "Active".'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 24;

-- Passo 25: Teste ponta a ponta
UPDATE v10_lesson_steps
SET narration_script = 'Hora da verdade! Vamos testar o sistema completo com um número real.

Abra o formulário e preencha com seu nome verdadeiro e seu número de celular com DDD. Marque o consentimento e envie.

[ANCHOR:pontos_atencao]
Agora, os pontos de atenção desse passo:

Use seu número de celular real — é o único jeito de testar a ligação de verdade. Espere até 15 minutos, que é o intervalo do Make. Você vai receber uma ligação no seu celular do agente de IA. Se não receber em 15 minutos, verifique no Make se o cenário rodou — clique em "History" no editor.

[ANCHOR:confirmacao]
Deu certo se você recebeu a ligação e o agente fez as perguntas do script.'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 25;

-- Passo 26: Verificar planilha atualizada
UPDATE v10_lesson_steps
SET narration_script = 'Depois de receber a ligação, volte pra planilha SDR Leads.

Na aba Form Responses 1, confira se a coluna Status mostra "Ligação enviada" na linha do seu teste.

[ANCHOR:confirmacao]
Deu certo se a coluna Status está preenchida. Se apareceu, o sistema completo está funcionando — do formulário até a atualização automática. Parabéns!'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 26;

-- Passo 27: SDR de Voz — Completo!
UPDATE v10_lesson_steps
SET narration_script = 'Parabéns! Você acabou de construir um SDR de voz com inteligência artificial.

A partir de agora, quando alguém preencher o formulário, o sistema liga automaticamente. Sem você precisar fazer nada.

Você criou algo que empresas grandes pagam milhares de reais pra montar. E você fez em menos de 15 minutos.

[ANCHOR:confirmacao]
Deu certo se você chegou até aqui. Seu SDR de Voz está completo!'
WHERE lesson_id = 'b0000001-0001-4000-8000-000000000001' AND step_number = 27;
