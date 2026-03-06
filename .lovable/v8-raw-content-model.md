# Modelo de Conteúdo Bruto V8 — Spec Definitiva

> Referência: Aula Laboratório `0638b200-0fd6-4534-8141-f4e3c5c08c2a`
> Título: "O Cérebro do ChatGPT: Por que ele parece genérico — e como virar o jogo"
> Última atualização: 2026-03-06

---

## Visão Geral

Este documento define **tudo que o pipeline V8 precisa receber** como input bruto para gerar uma aula completa. O conteúdo bruto é transformado em `V8LessonData` (JSON) pelo parser `v8ContentParser.ts` e pelo pipeline `v8-generate`.

---

## ESTRUTURA POR SEÇÃO (9 seções obrigatórias)

### Seção 1 (índice 0) — Abertura
**Objetivo:** Boas-vindas + gancho + lista do que será aprendido + definição de vocabulário.
**Interação:** ❌ Nenhuma (introdução pura)

```markdown
Olá a todos! Sejam muito bem-vindos.

Você já se viu pedindo algo ao ChatGPT e recebendo uma resposta que mais parecia um **"manual de instruções"**? Aquela resposta genérica que, embora não esteja errada, muitas vezes não traz a *ajuda prática* que você realmente busca.

Nesta aula, você vai descobrir:

- **Por que** o ChatGPT dá respostas genéricas
- **Como** guiar a IA para entregar exatamente o que você precisa
- **O que** muda quando você domina a técnica do prompt

Para alinharmos nosso vocabulário: quando eu mencionar **"prompt"**, estarei me referindo à sua solicitação — o texto que você escreve para a inteligência artificial.

> Quanto mais claro e direcionado for esse pedido, mais útil e relevante será a resposta.

Ao final, você terá a oportunidade de aplicar esse conhecimento em **situações reais do seu dia a dia**, com exercícios práticos e sem simulações artificiais. Prepare-se para desvendar o que realmente acontece nos bastidores dos modelos de linguagem!
```

**Requisitos Markdown:**
- Bold (`**texto**`) para ênfase de conceitos
- Itálico (`*texto*`) para destaques suaves
- Lista com `-` para tópicos
- Blockquote (`>`) para insight-chave
- Sem emojis no corpo (exceto se contextual)

---

### Seção 2 (índice 1) — Explicação conceitual
**Objetivo:** Explicar o mecanismo central (como o GPT funciona por dentro).
**Interação:** ❌ Nenhuma (pura teoria)

```markdown
Agora que entendemos o que é um prompt, vamos desmistificar o **funcionamento do GPT**.

É importante saber que o GPT **não "abre o Google"**, não realiza pesquisas na internet nem navega por páginas. O que ele faz é **prever a próxima palavra** mais provável em uma sequência, e depois a próxima, e assim por diante.

Ele consegue isso porque foi treinado com uma **enorme quantidade de texto**, aprendendo a identificar padrões linguísticos e contextuais.

Essa capacidade de predição é extremamente poderosa! Permite que ele:

- Escreva **textos fluidos**
- Organize **ideias complexas**
- Sugira **soluções criativas**

No entanto, há um detalhe crucial:

> O GPT só consegue ser específico e útil com a informação que **você** fornece a ele.

Se o seu prompt for **vago** ou sem um direcionamento claro, o modelo ficará sem referências precisas. Nesses casos, ele tende a gerar uma resposta mais ampla e genérica, para *"jogar pelo seguro"* e tentar abranger diversas possibilidades.

Ou seja, ele responde de forma **genérica e cautelosa**. Para reforçar esse conceito, vamos realizar um pequeno teste prático.
```

---

### Seção 3 (índice 2) — Ponte para primeiro exercício
**Objetivo:** Frase curta de transição para o primeiro exercício.
**Interação:** ✅ **Multiple Choice** (afterSectionIndex: 2)

```markdown
Qual tipo de resposta tem mais chance de aparecer quando você pergunta "Onde pedir uma pizza?"
```

**Exercício gerado (Multiple Choice):**
```json
{
  "type": "multiple-choice",
  "afterSectionIndex": 2,
  "title": "Teste rápido: respostas genéricas",
  "instruction": "Selecione a alternativa correta.",
  "data": {
    "question": "Ao perguntar apenas \"Onde pedir uma pizza?\", qual tipo de resposta o GPT provavelmente vai gerar?",
    "options": [
      { "id": "mc-1", "text": "Uma lista genérica de dicas sobre como escolher pizzarias", "isCorrect": true },
      { "id": "mc-2", "text": "O endereço exato da pizzaria mais próxima de você", "isCorrect": false },
      { "id": "mc-3", "text": "Uma receita de pizza caseira passo a passo", "isCorrect": false }
    ],
    "explanation": "Como o prompt não especifica cidade, bairro, horário ou preferência, o GPT não tem contexto para ser específico. Ele recorre ao padrão mais seguro: dicas genéricas que sirvam para qualquer pessoa."
  },
  "successMessage": "Exato! Sem contexto como bairro ou horário, o GPT recorre ao padrão mais seguro: uma lista genérica de opções que tenta servir a todos.",
  "tryAgainMessage": "Pense no que aprendemos: sem direção clara, o GPT escolhe a resposta mais estatisticamente segura — ampla e genérica."
}
```

---

### Seção 4 (índice 3) — Aprofundamento do conceito
**Objetivo:** Expandir o conceito com os 3 pilares (papel, contexto, formato).
**Interação:** ✅ **FlipCard Quiz** (afterSectionIndex: 3)

```markdown
Continuando nossa jornada, compreendemos que o GPT tende a ser genérico quando **não há direção**.

É importante notar que um prompt vago **não se resume apenas a uma frase curta**. A vagueza ocorre quando faltam elementos essenciais que dão contexto e propósito ao seu pedido.

Um prompt é considerado vago quando **não especifica**:

- **Quem você é** no cenário (seu papel ou perspectiva)
- **Qual é a situação atual** (o contexto específico do seu pedido)
- **O que você espera receber** como resultado final (o formato ou tipo de informação desejada)

Sem essas informações, o GPT adota a abordagem mais segura: ele elabora uma resposta que tenta *"servir a muitos"*, mas que, na realidade, **não atende às suas necessidades específicas**.

> Ele entrega um resultado que é amplo e cauteloso, não direcionado.

Agora, você terá a oportunidade de experimentar a diferença que um bom direcionamento faz, sentindo o **impacto diretamente**.
```

**Exercício gerado (FlipCard Quiz):**
```json
{
  "type": "flipcard-quiz",
  "afterSectionIndex": 3,
  "title": "Conceitos-chave de um bom prompt",
  "instruction": "Vire cada card e responda corretamente.",
  "data": {
    "cards": [
      {
        "id": "fc-1",
        "front": { "label": "Papel", "color": "cyan", "icon": "Target" },
        "back": { "text": "Definir seu papel no prompt ajuda o GPT a filtrar informações. Qual é o efeito principal?" },
        "options": [
          { "id": "fc1-a", "text": "Respostas mais relevantes ao seu contexto", "isCorrect": true },
          { "id": "fc1-b", "text": "Respostas mais longas", "isCorrect": false },
          { "id": "fc1-c", "text": "Respostas mais rápidas", "isCorrect": false }
        ],
        "explanation": "Ao definir quem você é (designer, professor, nutricionista), o GPT filtra o conhecimento e entrega respostas específicas para a sua situação."
      },
      {
        "id": "fc-2",
        "front": { "label": "Contexto", "color": "amber", "icon": "Zap" },
        "back": { "text": "Dar contexto no prompt significa incluir informações sobre sua situação. O que acontece sem contexto?" },
        "options": [
          { "id": "fc2-a", "text": "O GPT escolhe a resposta mais estatisticamente segura (genérica)", "isCorrect": true },
          { "id": "fc2-b", "text": "O GPT não consegue responder", "isCorrect": false },
          { "id": "fc2-c", "text": "O GPT pede mais informações automaticamente", "isCorrect": false }
        ],
        "explanation": "Sem contexto, o GPT recorre a padrões estatísticos genéricos — por isso a resposta parece vaga e pouco útil."
      },
      {
        "id": "fc-3",
        "front": { "label": "Formato", "color": "emerald", "icon": "Lightbulb" },
        "back": { "text": "Especificar o formato (lista, tabela, passo a passo) no prompt melhora o resultado. Por quê?" },
        "options": [
          { "id": "fc3-a", "text": "Organiza a informação de forma mais útil para você", "isCorrect": true },
          { "id": "fc3-b", "text": "Faz o GPT pensar mais devagar", "isCorrect": false },
          { "id": "fc3-c", "text": "Reduz o número de palavras na resposta", "isCorrect": false }
        ],
        "explanation": "O formato é um dos 3 pilares do prompt direcionado. Ele determina como a informação será organizada e entregue para seu uso prático."
      }
    ],
    "feedback": {
      "perfect": "Perfeito! Você dominou os 3 pilares do prompt! 🎯",
      "good": "Bom trabalho! Quase todos corretos! 👏",
      "needsReview": "Revise os conceitos de papel, contexto e formato 📖"
    }
  },
  "successMessage": "Você dominou os 3 pilares! Papel, contexto e formato são a base de todo prompt direcionado.",
  "tryAgainMessage": "Revise os conceitos: Papel define quem você é, Contexto dá a situação, Formato organiza a entrega."
}
```

---

### Seção 5 (índice 4) — Transição para prática
**Objetivo:** Ponte teórica antes de um exercício de verificação.
**Interação:** ✅ **True-False** (afterSectionIndex: 4)

```markdown
Como vimos, o GPT opera **prevendo padrões de texto**. Isso significa que você tem o poder de controlar o tipo de resultado que ele gera, ao aprimorar a forma como você faz seu pedido.

Chegou a hora de levarmos essa ideia para a **prática**.

> Vamos para o playground e experimentar juntos a diferença entre um prompt vago e um útil em um cenário da vida real.
```

**Exercício gerado (True-False):**
```json
{
  "type": "true-false",
  "afterSectionIndex": 4,
  "title": "Verdadeiro ou Falso: Prompts vagos",
  "instruction": "Avalie cada afirmação.",
  "data": {
    "statements": [
      {
        "id": "tf-1",
        "text": "Um prompt curto é sempre um prompt ruim.",
        "isTrue": false,
        "explanation": "Um prompt pode ser curto e ainda assim ser direcionado. O problema não é o tamanho, é a falta de contexto e direção."
      },
      {
        "id": "tf-2",
        "text": "Incluir seu papel ou perspectiva no prompt ajuda o GPT a dar respostas mais relevantes.",
        "isTrue": true,
        "explanation": "Quando você define quem é no cenário, o GPT consegue filtrar as informações mais relevantes para sua situação."
      },
      {
        "id": "tf-3",
        "text": "O GPT dá respostas genéricas porque não tem acesso à internet.",
        "isTrue": false,
        "explanation": "A genericidade vem da falta de direção no prompt, não da falta de acesso à internet. Com um bom prompt, o GPT gera respostas específicas usando seu treinamento."
      },
      {
        "id": "tf-4",
        "text": "Especificar o formato de resposta desejado (lista, passo a passo, tabela) melhora significativamente o resultado.",
        "isTrue": true,
        "explanation": "O formato é um dos 3 pilares de um prompt direcionado. Ele determina como a informação será organizada e entregue."
      }
    ]
  },
  "successMessage": "Perfeito! Você entendeu que a genericidade vem da falta de direção, não de limitações técnicas do GPT.",
  "tryAgainMessage": "Releia a seção sobre prompts vagos vs. direcionados. O tamanho do prompt não determina a qualidade — o contexto sim."
}
```

---

### Seção 6 (índice 5) — Aprofundamento: formato
**Objetivo:** Ensinar que além do contexto, o FORMATO muda a utilidade.
**Interação:** ✅ **Platform Match** (afterSectionIndex: 5)

```markdown
Até agora, percebemos como o **contexto** melhora as respostas do GPT. Mas, além do contexto, o **formato** em que você pede a informação pode transformar completamente a utilidade da resposta.

Quando você inclui solicitações de formato, como:

- *"Liste em 3 opções"*
- *"Monte um plano passo a passo"*
- *"Organize por prioridade"*

Você está direcionando a inteligência artificial para que a resposta seja **estruturada de uma maneira específica**, o que aumenta significativamente sua aplicabilidade e clareza.

Você está, literalmente, ditando a **"embalagem"** do conteúdo.

> Ao pedir um formato específico, você consegue identificar rapidamente se a resposta entregue é realmente boa e útil, ou se o modelo está apenas "enrolando".

A estrutura facilita essa avaliação. Vamos agora aplicar essa técnica em um **novo cenário do seu dia a dia**.
```

**Exercício gerado (Platform Match):**
```json
{
  "type": "platform-match",
  "afterSectionIndex": 5,
  "title": "Escolhendo o formato ideal",
  "instruction": "Associe cada caso de uso ao formato de resposta mais adequado.",
  "data": {
    "platforms": [
      { "id": "plat-1", "name": "Tabela comparativa", "icon": "📊", "color": "#6366f1" },
      { "id": "plat-2", "name": "Passo a passo com prazos", "icon": "📋", "color": "#10b981" },
      { "id": "plat-3", "name": "Lista de ideias criativas", "icon": "💡", "color": "#f59e0b" }
    ],
    "scenarios": [
      { "id": "pm-1", "text": "Preciso comparar 3 ferramentas de IA para edição de imagens", "emoji": "📊", "correctPlatform": "Tabela comparativa" },
      { "id": "pm-2", "text": "Quero implementar um funil de vendas do zero esta semana", "emoji": "📋", "correctPlatform": "Passo a passo com prazos" },
      { "id": "pm-3", "text": "Preciso de inspiração para posts no Instagram sobre IA", "emoji": "💡", "correctPlatform": "Lista de ideias criativas" }
    ]
  },
  "successMessage": "Ótima associação! Escolher o formato certo transforma uma resposta genérica em algo diretamente aplicável.",
  "tryAgainMessage": "Pense no objetivo de cada situação: comparar pede tabela, executar pede passo a passo, criar pede lista de ideias."
}
```

---

### Seção 7 (índice 6) — Preparação para quiz cronometrado
**Objetivo:** Transição + instrução para exercício guiado.
**Interação:** ✅ **Timed Quiz** (afterSectionIndex: 6)

```markdown
Agora é a sua vez de praticar!

Complete a frase que será apresentada a seguir, com o objetivo de transformar um **pedido genérico** em algo que possa ser efetivamente colocado em prática.

Pense em uma situação real que envolva **gerar uma renda extra** ou organizar um serviço simples.

> Você não quer um conselho abstrato; o que você busca é um **plano de ação concreto** e utilizável.
```

**Exercício gerado (Timed Quiz):**
```json
{
  "type": "timed-quiz",
  "afterSectionIndex": 6,
  "title": "Quiz cronometrado: Diagnóstico de prompts",
  "instruction": "Responda rápido! Você tem tempo limitado.",
  "data": {
    "timePerQuestion": 30,
    "questions": [
      {
        "id": "tq-1",
        "question": "Qual é o principal motivo pelo qual o ChatGPT dá respostas genéricas?",
        "options": [
          { "id": "tq-1a", "text": "Falta de direção no prompt", "isCorrect": true },
          { "id": "tq-1b", "text": "Limitação técnica do modelo", "isCorrect": false },
          { "id": "tq-1c", "text": "Restrições de segurança", "isCorrect": false },
          { "id": "tq-1d", "text": "Falta de treinamento em português", "isCorrect": false }
        ],
        "explanation": "O GPT responde de forma genérica quando o prompt não fornece contexto, papel ou formato específico."
      },
      {
        "id": "tq-2",
        "question": "Qual dos elementos abaixo NÃO é um pilar de um prompt direcionado?",
        "options": [
          { "id": "tq-2a", "text": "Papel/perspectiva", "isCorrect": false },
          { "id": "tq-2b", "text": "Número de palavras exato", "isCorrect": true },
          { "id": "tq-2c", "text": "Contexto específico", "isCorrect": false },
          { "id": "tq-2d", "text": "Formato de resposta", "isCorrect": false }
        ],
        "explanation": "Os 3 pilares são: papel, contexto e formato. O número exato de palavras não é um pilar fundamental."
      },
      {
        "id": "tq-3",
        "question": "Qual prompt geraria a resposta mais útil?",
        "options": [
          { "id": "tq-3a", "text": "Me ajuda com marketing", "isCorrect": false },
          { "id": "tq-3b", "text": "Sou dono de uma padaria artesanal. Crie 5 posts para Instagram focados em pães especiais, tom acolhedor, com hashtags", "isCorrect": true },
          { "id": "tq-3c", "text": "Quero vender mais", "isCorrect": false },
          { "id": "tq-3d", "text": "Dicas de marketing digital", "isCorrect": false }
        ],
        "explanation": "Este prompt define quem (dono de padaria), o quê (5 posts), onde (Instagram), foco (pães especiais), tom e formato (com hashtags)."
      }
    ]
  },
  "successMessage": "Rápido e certeiro! Você já internalizou os fundamentos de prompts eficientes.",
  "tryAgainMessage": "Revise os conceitos principais: papel + contexto + formato = prompt direcionado. Tente novamente!"
}
```

---

### Seção 8 (índice 7) — Checklist mental
**Objetivo:** Sintetizar os 3 pilares como checklist rápido + preparação para Coursiv.
**Interação:** ✅ **Complete Sentence / Coursiv** (afterSectionIndex: 7)

```markdown
Antes de enfrentarmos o desafio final, grave bem estas dicas. Elas servirão como um **guia rápido** para você criar prompts eficientes.

Um pedido que realmente gera resultados úteis quase sempre inclui:

1. **Objetivo claro** — O que você quer alcançar com a resposta?
2. **Contexto real** — Qual é a situação ou o cenário em que essa resposta será aplicada?
3. **Formato de saída** — Como você deseja que a informação seja estruturada (listas, passos, prioridades)?

Sem esses elementos, a tendência é que a resposta seja **genérica e ampla**.

> Com eles, a inteligência artificial consegue ser muito mais prática e direcionada, atendendo às suas necessidades de forma eficaz.

Preparado para o desafio? Então, vamos para a **prova relâmpago**.
```

**Exercício gerado (Coursiv / Complete Sentence):**
```json
{
  "afterSectionIndex": 7,
  "id": "coursiv-gen-01",
  "title": "Monte o Prompt Profissional",
  "instruction": "Complete o prompt organizando as palavras que faltam no seu contexto.",
  "sentences": [
    {
      "id": "cs-01",
      "text": "Crie um _______ para _______ no formato _______ com tom _______",
      "options": ["roteiro", "freelancers", "lista", "persuasivo"],
      "correctAnswers": ["roteiro", "freelancers", "lista", "persuasivo"]
    }
  ]
}
```

**Regras V8-C01 do Coursiv:**
- Exatamente **4 lacunas** (`_______`)
- Máximo **14 palavras** no total da sentença
- `options === correctAnswers` (0 distratores, exibidos embaralhados)
- Foco em componentes estruturais: Persona, Objetivo, Contexto, Tom, Restrição, Formato, CTA

---

### Seção 9 (índice 8) — Seção de clímax (transição mínima)
**Objetivo:** Frase mínima de transição para o Playground (desafio final).
**Interação:** ✅ **Playground** + **Insight** + **Learn and Grow** (afterSectionIndex: 8)

```markdown
Qual das versões a seguir tem maior chance de gerar a resposta mais útil? Confie no que você aprendeu e faça a melhor escolha.
```

---

## BLOCO: PLAYGROUND (afterSectionIndex: 8)

O Playground é **sempre o clímax** da aula, posicionado na última seção.

```json
{
  "afterSectionIndex": 8,
  "id": "playground-01",
  "title": "Teste na Prática — Prompts Vagos vs Prompts Úteis",
  "instruction": "Compare os dois prompts abaixo e observe como o nível da resposta muda quando adicionamos contexto e formato.",
  "narration": "[animado] Agora é sua vez. Compare o pedido vago com o pedido detalhado e perceba como a resposta muda de nível.",
  "amateurPrompt": "Planeje uma viagem para Barcelona.",
  "amateurResult": "Barcelona é uma cidade incrível. Você pode visitar a Sagrada Família, o Park Güell, caminhar pela La Rambla e explorar o Bairro Gótico.",
  "professionalPrompt": "Somos um casal, vamos a Barcelona em abril por 2 dias. Gostamos de gastronomia e queremos gastar pouco. Monte um roteiro dividido em manhã/tarde/noite e inclua estimativa simples de custos.",
  "professionalResult": "Dia 1: manhã Bairro Gótico, tarde Park Güell, noite tapas em El Born (€25–€35 por pessoa). Dia 2: manhã praia, tarde Montjuïc, jantar econômico local. Estruturado por período e com custo estimado.",
  "userChallenge": {
    "instruction": "Agora é sua vez. Reescreva um pedido real do seu dia a dia adicionando 3 detalhes concretos e pedindo um formato específico.",
    "challengePrompt": "Escreva primeiro a versão vaga. Depois, a versão melhorada.",
    "maxAttempts": 3,
    "evaluationCriteria": [
      "Inclui contexto real",
      "Define objetivo claro",
      "Pede formato específico"
    ],
    "hints": [
      "Inclua quem está envolvido e quando acontece",
      "Defina uma limitação (tempo ou orçamento)",
      "Peça o formato da resposta"
    ]
  },
  "successMessage": "Ótimo. Você deu cenário + intenção + formato. Isso força a resposta a ser acionável.",
  "tryAgainMessage": "Ainda está amplo. Adicione quem você é, quanto tempo tem e peça o formato da resposta.",
  "offlineFallback": {
    "message": "Se o feedback não aparecer, revise incluindo quem/onde/quando e peça a resposta em formato estruturado.",
    "exampleAnswer": "Pedido vago: \"Me ajuda com uma viagem.\" Pedido melhorado: \"Sou viajante solo, vou a Recife por 3 dias em julho, quero praias e comida barata. Monte manhã/tarde/noite com custo estimado.\""
  }
}
```

**Regras do Playground:**
- `amateurResult`: Máx. 2 linhas, vago e genérico
- `professionalResult`: Estruturado, com dados concretos
- `maxAttempts`: Sempre 3
- `evaluationCriteria`: 3 critérios claros
- `hints`: 3 dicas progressivas
- Áudios obrigatórios: `audioUrl` (narração), `successAudioUrl`, `tryAgainAudioUrl`

---

## BLOCO: INSIGHT REWARD (afterSectionIndex: 8)

Sempre imediatamente após o Playground.

```json
{
  "afterSectionIndex": 8,
  "id": "uuid-gerado",
  "title": "💡 Prompt bem elaborado",
  "insightText": "Dica de ouro: quando precisar de algo específico, inclua no prompt quem você é, o que precisa e em qual formato. Essa fórmula simples transforma qualquer resposta genérica em algo diretamente aplicável ao seu dia a dia.",
  "creditsReward": 10
}
```

**Regras:**
- `creditsReward`: Sempre 10
- Desbloqueado apenas se Playground score ≥ 81 (PASS_SCORE)
- Idempotente via `user_gamification_events`

---

## BLOCO: LEARN AND GROW (último item do timeline)

```json
{
  "id": "lag-manual-01",
  "whatChanged": "Você saiu de prompts genéricos e aprendeu a estruturar pedidos com persona, contexto e formato definido.",
  "beforeAfter": "Antes você escrevia 'me ajuda com isso' — agora monta prompts com objetivo claro, público definido e formato específico.",
  "practicalExample": "Hoje mesmo, abra o ChatGPT e crie um prompt com persona + contexto + formato para resolver uma tarefa real do seu trabalho."
}
```

**Regras:**
- 3 campos obrigatórios: `whatChanged`, `beforeAfter`, `practicalExample`
- Tom: prático e motivacional
- `practicalExample` deve ser executável **hoje**

---

## MAPA DE INTERAÇÕES POR SEÇÃO (V8-C01)

| Seção | Índice | Conteúdo | Interação |
|-------|--------|----------|-----------|
| 1 | 0 | Abertura + gancho + lista | ❌ Nenhuma |
| 2 | 1 | Explicação conceitual | ❌ Nenhuma |
| 3 | 2 | Ponte curta (1-2 frases) | ✅ Multiple Choice |
| 4 | 3 | Aprofundamento (pilares) | ✅ FlipCard Quiz |
| 5 | 4 | Transição para prática | ✅ True-False |
| 6 | 5 | Novo conceito (formato) | ✅ Platform Match |
| 7 | 6 | Preparação para quiz | ✅ Timed Quiz |
| 8 | 7 | Checklist/síntese | ✅ Coursiv (Complete Sentence) |
| 9 | 8 | Transição mínima | ✅ Playground + Insight + Learn&Grow |

---

## ÁUDIOS NECESSÁRIOS POR SEÇÃO

Para cada seção, o pipeline gera:

| Tipo | Padrão de nome | Obrigatório |
|------|---------------|-------------|
| Narração da seção | `section-{i}.mp3` | ✅ Sim (todas as 9 seções) |
| Quiz narração | `quiz-{i}.mp3` | ✅ Se houver quiz legado |
| Quiz explicação | `quiz-{i}-explanation.mp3` | ✅ Se houver quiz legado |
| Quiz reforço | `quiz-{i}-reinforcement.mp3` | ✅ Se houver quiz legado |
| Playground narração | `playground-{i}.mp3` | ✅ Para o playground |
| Playground sucesso | `playground-{i}-success.mp3` | ✅ Para o playground |
| Playground tentar de novo | `playground-{i}-tryagain.mp3` | ✅ Para o playground |

**Modelo de áudio:** `eleven_v3` com `language_code: "pt"` (pt-BR fixo)

---

## IMAGENS NECESSÁRIAS

Uma imagem por seção, gerada pelo Image Lab:

| Seção | Path | Dimensão |
|-------|------|----------|
| Cada seção (0-8) | `v8-images/draft-{timestamp}/section-{i}.png` | 1024x1024 |

**Processamento:** V8TrimmedImage aplica trim automático (bounding box alpha<10, dist<30) no runtime.

---

## REGRAS DE FORMATAÇÃO DO CONTEÚDO MARKDOWN

1. **Bold** (`**texto**`) → renderizado como `text-primary font-semibold` (indigo)
2. **Itálico** (`*texto*`) → highlight marker `bg-primary/10 rounded-md` (NÃO itálico visual)
3. **Listas** (`- item`) → container box `bg-muted/50 rounded-xl border`
4. **Blockquote** (`> texto`) → callout premium com `border-l-4 border-primary/40`
5. **Listas numeradas** (`1. item`) → mesmo container das listas, com numeração
6. **Inline code** (`` `texto` ``) → `bg-muted text-primary font-mono`

---

## SANITIZAÇÃO OBRIGATÓRIA

O `v8TextSanitizer.ts` remove antes da renderização:
- Tags de emoção: `[animado]`, `[confiante]`, `[pausa]`, `[tom calmo]`, etc.
- Meta-labels: `Segmento vida real desta atividade:`, `Atividade prática:`, etc.
- Instruções rush: `Responda rapidamente`, `Confie nos seus instintos`, etc.
- Tags genéricas: `[qualquer coisa entre colchetes]`

**Estas tags SÓ existem no campo `narration` do playground e nos textos de áudio. Nunca no conteúdo renderizado.**

---

## TIMELINE DO PLAYER (ordem de renderização)

Para cada seção `i`, a timeline é construída na ordem:

```
Section[i] → CompleteSentence[i] → InlineExercise[i] → Playground[i] → Insight[i] → Quiz[i]
```

**Regra de dedup:** Se existe `InlineExercise` num índice, o `Quiz` legado nesse mesmo índice é descartado.

---

## CAMPOS OBRIGATÓRIOS DO JSON FINAL (`V8LessonData`)

```typescript
{
  contentVersion: "v8",
  title: string,
  sections: V8Section[],           // 9 seções
  inlineQuizzes: V8InlineQuiz[],   // Quizzes legados (com áudio)
  inlineExercises: V8InlineExercise[], // 6 exercícios inline
  inlinePlaygrounds: V8InlinePlayground[], // 1 playground
  inlineInsights: V8InsightBlock[],  // 1 insight
  inlineCompleteSentences: V8InlineCompleteSentence[], // 1 coursiv
  learnAndGrow: V8LearnAndGrow,    // 1 bloco síntese
  exercises: []                     // Sempre vazio no V8 (exercícios são inline)
}
```
