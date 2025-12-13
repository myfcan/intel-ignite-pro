# 🎯 PROMPT PARA LOVABLE - ATUALIZAR AULA 06

Cole este prompt completo no chat do Lovable:

---

**Tarefa:** Atualizar a Aula 06 (ID: `e8a82f35-2818-42ff-b71b-565fca199f59`) no banco de dados Supabase com os 15 novos experienceCards.

**Contexto:** Os componentes visuais já foram criados e estão registrados no código (commit 8bc38ac). Agora preciso atualizar APENAS o campo `content.experienceCards` no banco de dados.

**SQL para executar:**

```sql
UPDATE lessons
SET content = jsonb_set(
  content,
  '{experienceCards}',
  '[
    {
      "type": "deep-content-vs-rapido",
      "sectionIndex": 1,
      "anchorText": "conteúdo profundo",
      "props": {
        "title": "Por que conteúdo profundo importa?",
        "subtitle": "Da atenção rápida à confiança duradoura."
      }
    },
    {
      "type": "knowledge-structure",
      "sectionIndex": 1,
      "anchorText": "organizar seu conhecimento em algo maior",
      "props": {
        "title": "Do solto ao estruturado",
        "subtitle": "Quando o que você sabe vira um projeto único."
      }
    },
    {
      "type": "authority-builder",
      "sectionIndex": 1,
      "anchorText": "autoridade e confiança",
      "props": {
        "title": "Autoridade não nasce em um post",
        "subtitle": "Ela é construída em camadas."
      }
    },
    {
      "type": "core-decisions",
      "sectionIndex": 2,
      "anchorText": "tema, público e promessa",
      "props": {
        "title": "As 3 decisões que destravam tudo",
        "subtitle": "Tema, público e promessa."
      }
    },
    {
      "type": "module-map",
      "sectionIndex": 2,
      "anchorText": "mapa de módulos",
      "props": {
        "title": "Mapa de módulos",
        "subtitle": "Seu conhecimento em etapas claras."
      }
    },
    {
      "type": "objective-focus",
      "sectionIndex": 2,
      "anchorText": "objetivos de cada parte",
      "props": {
        "title": "Objetivo de cada etapa",
        "subtitle": "O que o aluno ganha em cada ponto."
      }
    },
    {
      "type": "product-shelf",
      "sectionIndex": 3,
      "anchorText": "curso em vídeo",
      "props": {
        "title": "Curso em vídeo",
        "subtitle": "Quando sua voz e presença guiam o aluno."
      }
    },
    {
      "type": "ebook-creator",
      "sectionIndex": 3,
      "anchorText": "eBook ou livro",
      "props": {
        "title": "eBook ou livro",
        "subtitle": "Quando o conhecimento ganha páginas."
      }
    },
    {
      "type": "lesson-series",
      "sectionIndex": 3,
      "anchorText": "sequência de aulas",
      "props": {
        "title": "Série de aulas",
        "subtitle": "Quando cada encontro empurra o aluno para o próximo nível."
      }
    },
    {
      "type": "text-ai-helper",
      "sectionIndex": 4,
      "anchorText": "I.A. de texto",
      "props": {
        "title": "I.A. de texto em ação",
        "subtitle": "Do briefing solto ao esqueleto pronto."
      }
    },
    {
      "type": "visual-ai-helper",
      "sectionIndex": 4,
      "anchorText": "I.A. de imagem e vídeo",
      "props": {
        "title": "Imagens e vídeos com I.A.",
        "subtitle": "Visuais que reforçam a mensagem."
      }
    },
    {
      "type": "you-are-the-author",
      "sectionIndex": 4,
      "anchorText": "você continua sendo o autor",
      "props": {
        "title": "Você é o diretor criativo",
        "subtitle": "A I.A. acelera, mas não decide por você."
      }
    },
    {
      "type": "ai-limitations",
      "sectionIndex": 5,
      "anchorText": "I.A. não substitui revisão humana",
      "props": {
        "title": "Limites da I.A.",
        "subtitle": "Ela acerta muita coisa, mas não tudo."
      }
    },
    {
      "type": "copy-paste-risk",
      "sectionIndex": 5,
      "anchorText": "copiar e colar sem adaptar",
      "props": {
        "title": "O perigo do copiar e colar",
        "subtitle": "Quando tudo fica com a mesma cara."
      }
    },
    {
      "type": "next-steps-deep-content",
      "sectionIndex": 5,
      "anchorText": "primeiro rascunho, não rascunho final",
      "props": {
        "title": "Próximos passos com segurança",
        "subtitle": "Use a I.A. como ponto de partida, não como ponto final."
      }
    }
  ]'::jsonb
)
WHERE id = 'e8a82f35-2818-42ff-b71b-565fca199f59';
```

**Verificação:** Após executar, rode este SELECT para confirmar:

```sql
SELECT
  id,
  title,
  jsonb_array_length(content->'experienceCards') as total_cards,
  jsonb_pretty(content->'experienceCards') as cards
FROM lessons
WHERE id = 'e8a82f35-2818-42ff-b71b-565fca199f59';
```

Deve retornar `total_cards = 15` com todos os tipos corretos.

---

**Importante:** Execute apenas o UPDATE acima. NÃO modifique outros campos do `content` (sections, exercises, etc.). Apenas substitua o array `experienceCards`.
