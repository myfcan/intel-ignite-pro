

# Plano: V8-C01/C02/C03 + Formatação Editorial no Prompt

## Resumo

Duas alterações no sistema:
1. **3 mapas de exercícios** (V8-C01/C02/C03) com alternância automática por `orderIndex`
2. **Formatação editorial** reforçada no prompt do `v8-refine-content` para garantir markdown rico

## Alteração 1: Edge Function `v8-generate-lesson-content/index.ts`

**O que muda**: Receber `orderIndex` no request body, definir 3 mapas, selecionar automaticamente.

```text
Recebe: { sections, ..., orderIndex?: number, contractPattern?: string }

V8_C01_MAP (original):
  S2: multiple-choice | flipcard-quiz
  S3: complete-sentence | scenario-selection
  S4: true-false
  S5: platform-match | scenario-selection
  S6: timed-quiz | fill-in-blanks

V8_C02_MAP ("Variedade Invertida"):
  S2: scenario-selection | true-false
  S3: flipcard-quiz | platform-match
  S4: fill-in-blanks | multiple-choice
  S5: timed-quiz | complete-sentence
  S6: true-false | flipcard-quiz

V8_C03_MAP ("Progressão Concentrada"):
  S2: flipcard-quiz | fill-in-blanks
  S3: timed-quiz | true-false
  S4: scenario-selection | platform-match
  S5: multiple-choice | complete-sentence
  S6: fill-in-blanks | scenario-selection

Seleção: contractPattern || ['V8-C01','V8-C02','V8-C03'][orderIndex % 3]
```

Logs atualizados para mostrar qual padrão foi usado. O campo `contractPattern` é salvo no response para rastreabilidade.

## Alteração 2: `AdminV8Create.tsx`

- Buscar `order_index` da última lição do curso selecionado (ou usar 0) e passar como `orderIndex` no body da chamada à edge function
- Adicionar log no pipeline indicando qual padrão (C01/C02/C03) foi selecionado

Trecho específico — na chamada `v8-generate-lesson-content` (~linha 654):
```typescript
body: JSON.stringify({
  sections: ...,
  orderIndex: nextOrderIndex,  // ← novo
  ...
}),
```

Para calcular `nextOrderIndex`, contar lições existentes no curso selecionado.

## Alteração 3: `v8-refine-content/index.ts` — Formatação Editorial

Adicionar ao `REFINE_SYSTEM_PROMPT` instruções explícitas para usar markdown rico:

```text
15. **Formatação Editorial Obrigatória**: O conteúdo DEVE usar elementos de markdown que ativam o design premium do renderer:
   - Use **negrito** para termos-chave e conceitos importantes (2-4 por seção)
   - Use > blockquotes para insights, reflexões ou frases de destaque (1 por seção quando apropriado)
   - Use listas com bullet points para enumerações (quando houver 3+ itens)
   - Use --- (separador horizontal) entre blocos temáticos distintos dentro de uma seção
   - Use *itálico* para exemplos práticos ou analogias
   - O primeiro parágrafo de cada seção deve ser o mais forte (ele recebe estilo drop-cap)
```

## Alteração 4: `src/types/v8Lesson.ts`

Adicionar campo opcional ao `V8LessonData`:
```typescript
contractPattern?: 'V8-C01' | 'V8-C02' | 'V8-C03';
```

## Arquivos modificados

| Arquivo | Tipo |
|---------|------|
| `supabase/functions/v8-generate-lesson-content/index.ts` | Edge function (deploy automático) |
| `supabase/functions/v8-refine-content/index.ts` | Edge function (deploy automático) |
| `src/pages/AdminV8Create.tsx` | Frontend admin |
| `src/types/v8Lesson.ts` | Tipos TypeScript |

## Riscos mitigados

- **Sem breaking changes**: O `orderIndex` é opcional (default 0 → V8-C01), retrocompatível
- **Mesmos índices 2-6**: Todos os 3 mapas usam as mesmas posições, sem risco de seção vazia
- **Hard Gates mantidos**: A validação de integridade (1 exercício por seção, campos obrigatórios) continua idêntica para todos os padrões
- **Coursiv e Playground**: Mantêm posição fixa (`lastIdx-1` e `lastIdx`) em todos os padrões

