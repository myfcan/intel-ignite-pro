

# Correção Direta da Aula 0638b200 + Registro de Bugs no Pipeline

## Diagnóstico Forense Confirmado

Aula: `0638b200-0fd6-4534-8141-f4e3c5c08c2a` — "O Cérebro do ChatGPT: Por que ele parece genérico — e como virar o jogo"

**Estado atual:** 9 seções, 3 inlineExercises (todos com dados quebrados/incompletos), 1 coursiv, 0 playground

### Problemas encontrados:

| # | Tipo | afterSectionIndex | Bug |
|---|------|-------------------|-----|
| 1 | `scenario-selection` | 3 | Cenários vazios: `[{id:sc-1},{id:sc-2},{id:sc-3},{id:sc-4}]` — sem `situation`, `options`, `correctAnswer`, `explanation` |
| 2 | `platform-match` | 5 | Cenários vazios: `[{id:pm-1},{id:pm-2},{id:pm-3}]` — sem `text`, `correctPlatform`, `emoji` |
| 3 | AUSENTE | 2 | Nenhum exercício para seção 3 (MC/FlipCard conforme V8-C01) |
| 4 | AUSENTE | 4 | Nenhum exercício para seção 5 (True-False conforme V8-C01) |
| 5 | `timed-quiz` | 6 | Dados OK (3 questions com texto completo) ✅ |

---

## Plano de Execução (2 fases)

### Fase 1 — Criar edge function `patch-lesson-content` + aplicar patch

**1.1** Criar `supabase/functions/patch-lesson-content/index.ts` — Edge function mínima que:
- Recebe `{ lessonId, patches }` via POST
- Verifica admin via auth token
- Busca `content` atual da lição
- Aplica patches (ex: `set_inline_exercises`)
- Atualiza no banco

**1.2** Deploy + chamar via curl com os 5 exercícios inline completos:

Exercício idx 2 (MC — Seção 3: "Primeiro teste: você entendeu o genérico?"):
```json
{
  "id": "inline-ex-00",
  "afterSectionIndex": 2,
  "type": "multiple-choice",
  "title": "Teste rápido: respostas genéricas",
  "instruction": "Selecione a alternativa correta.",
  "data": {
    "question": "Por que o ChatGPT tende a dar respostas genéricas quando o prompt é vago?",
    "options": [
      {"id": "mc-1", "text": "Porque ele prevê padrões estatísticos e escolhe o mais seguro", "isCorrect": true},
      {"id": "mc-2", "text": "Porque ele não entende português muito bem", "isCorrect": false},
      {"id": "mc-3", "text": "Porque ele foi programado para dar respostas curtas", "isCorrect": false},
      {"id": "mc-4", "text": "Porque ele só funciona bem com perguntas em inglês", "isCorrect": false}
    ],
    "explanation": "O GPT opera por previsão de padrões. Sem contexto específico, ele escolhe a resposta mais estatisticamente segura — que acaba sendo genérica."
  }
}
```

Exercício idx 3 (scenario-selection — Seção 4: "O erro não é ser curto. É ser sem direção"):
```json
{
  "id": "inline-ex-01",
  "afterSectionIndex": 3,
  "type": "scenario-selection",
  "title": "A importância da direção no prompt",
  "instruction": "Selecione a melhor opção que demonstra um prompt bem direcionado.",
  "data": {
    "scenarios": [
      {
        "id": "sc-1",
        "situation": "Você quer ideias para gerar renda extra com design gráfico. Qual prompt dá mais direção ao GPT?",
        "options": ["Me dá ideias de renda extra", "Sou designer gráfico freelancer com 2 anos de experiência. Quero 5 ideias práticas para gerar renda extra usando minhas habilidades, com estimativa de ganho mensal", "Ideias de negócio com design", "Como ganhar dinheiro online"],
        "correctAnswer": "Sou designer gráfico freelancer com 2 anos de experiência. Quero 5 ideias práticas para gerar renda extra usando minhas habilidades, com estimativa de ganho mensal",
        "explanation": "Este prompt inclui os 3 elementos essenciais: papel (designer freelancer), contexto (2 anos de experiência) e formato esperado (5 ideias com estimativa de ganho)."
      },
      {
        "id": "sc-2",
        "situation": "Você precisa de ajuda para escrever um e-mail profissional. Qual prompt é mais direcionado?",
        "options": ["Escreve um e-mail pra mim", "Preciso de um e-mail profissional para um cliente que atrasou o pagamento. Tom firme mas educado, máximo 5 linhas", "E-mail de cobrança", "Como cobrar um cliente"],
        "correctAnswer": "Preciso de um e-mail profissional para um cliente que atrasou o pagamento. Tom firme mas educado, máximo 5 linhas",
        "explanation": "Especifica o contexto (cobrança), o tom (firme mas educado) e o formato (máximo 5 linhas) — três pilares de um prompt direcionado."
      },
      {
        "id": "sc-3",
        "situation": "Você quer montar um plano de estudos. Qual prompt evita a resposta genérica?",
        "options": ["Monta um plano de estudos", "Quero um plano de estudos de 4 semanas para aprender marketing digital do zero, dedicando 1h por dia, com foco em tráfego pago", "Plano para estudar marketing", "Como aprender marketing digital"],
        "correctAnswer": "Quero um plano de estudos de 4 semanas para aprender marketing digital do zero, dedicando 1h por dia, com foco em tráfego pago",
        "explanation": "Inclui duração (4 semanas), tempo disponível (1h/dia), nível (do zero) e foco específico (tráfego pago)."
      },
      {
        "id": "sc-4",
        "situation": "Você quer criar uma bio para o Instagram profissional. Qual prompt dá mais contexto?",
        "options": ["Cria uma bio pro meu Instagram", "Sou nutricionista esportiva, atendo online, meu diferencial é dieta para atletas amadores. Crie 3 opções de bio para Instagram com no máximo 150 caracteres, tom acessível", "Bio para Instagram de nutricionista", "Me ajuda com meu perfil"],
        "correctAnswer": "Sou nutricionista esportiva, atendo online, meu diferencial é dieta para atletas amadores. Crie 3 opções de bio para Instagram com no máximo 150 caracteres, tom acessível",
        "explanation": "Define profissão, diferencial, formato (3 opções, 150 chars) e tom — tudo que o GPT precisa para gerar algo útil."
      }
    ]
  }
}
```

Exercício idx 4 (true-false — Seção 5: "Playground: Vago vs Útil"):
```json
{
  "id": "inline-ex-tf",
  "afterSectionIndex": 4,
  "type": "true-false",
  "title": "Verdadeiro ou Falso: Prompts vagos",
  "instruction": "Avalie cada afirmação.",
  "data": {
    "statements": [
      {"id": "tf-1", "text": "Um prompt curto é sempre um prompt ruim.", "isTrue": false, "explanation": "Um prompt pode ser curto e ainda assim ser direcionado. O problema não é o tamanho, é a falta de contexto e direção."},
      {"id": "tf-2", "text": "Incluir seu papel ou perspectiva no prompt ajuda o GPT a dar respostas mais relevantes.", "isTrue": true, "explanation": "Quando você define quem é no cenário, o GPT consegue filtrar as informações mais relevantes para sua situação."},
      {"id": "tf-3", "text": "O GPT dá respostas genéricas porque não tem acesso à internet.", "isTrue": false, "explanation": "A genericidade vem da falta de direção no prompt, não da falta de acesso à internet. Com um bom prompt, o GPT gera respostas específicas usando seu treinamento."},
      {"id": "tf-4", "text": "Especificar o formato de resposta desejado (lista, passo a passo, tabela) melhora significativamente o resultado.", "isTrue": true, "explanation": "O formato é um dos 3 pilares de um prompt direcionado. Ele determina como a informação será organizada e entregue."}
    ]
  }
}
```

Exercício idx 5 (platform-match — Seção 6: "O poder do formato"):
```json
{
  "id": "inline-ex-02",
  "afterSectionIndex": 5,
  "type": "platform-match",
  "title": "Escolhendo o formato ideal",
  "instruction": "Associe cada caso de uso ao formato de resposta mais adequado.",
  "data": {
    "scenarios": [
      {"id": "pm-1", "text": "Preciso comparar 3 ferramentas de IA para edição de imagens", "correctPlatform": "Tabela comparativa", "emoji": "📊"},
      {"id": "pm-2", "text": "Quero implementar um funil de vendas do zero esta semana", "correctPlatform": "Passo a passo com prazos", "emoji": "📋"},
      {"id": "pm-3", "text": "Preciso de inspiração para posts no Instagram sobre IA", "correctPlatform": "Lista de ideias criativas", "emoji": "💡"}
    ],
    "platforms": [
      {"id": "plat-1", "name": "Tabela comparativa", "icon": "📊", "color": "#6366f1"},
      {"id": "plat-2", "name": "Passo a passo com prazos", "icon": "📋", "color": "#10b981"},
      {"id": "plat-3", "name": "Lista de ideias criativas", "icon": "💡", "color": "#f59e0b"}
    ]
  }
}
```

Exercício idx 6 (timed-quiz) — **manter o existente** (já está OK com 3 questions completas).

### Fase 2 — Registrar correções como bugs do pipeline

Criar registro (neste chat) das 3 classes de bugs encontrados para aplicar ao pipeline depois:

| Bug ID | Classe | Descrição | Correção Pipeline |
|--------|--------|-----------|-------------------|
| BUG-001 | Schema vazio | IA retorna objetos com só `id` em arrays (scenarios, platforms) | CONTENT_DEPTH_RULES já aplicado (último patch) ✅ |
| BUG-002 | Seções faltantes | V8-C01 exige 5 exercícios (idx 2-6), mas IA gerou apenas 3 | MISSING SECTIONS GATE já aplicado ✅ |
| BUG-003 | platform-match sem platforms | Componente exige `scenarios` + `platforms`, filtro aceitava só `scenarios` | `.every()` + required keys já aplicado ✅ |

**Status dos 3 bugs no pipeline: TODOS JÁ CORRIGIDOS** nas 7 edições anteriores. A aula `0638b200` foi gerada ANTES dessas correções e precisa de patch manual.

---

## Implementação técnica

1. Criar `supabase/functions/patch-lesson-content/index.ts` (edge function admin-only para patching direto)
2. Deploy
3. Chamar via curl com os 5 exercícios inline completos
4. Verificar resultado via SQL query

