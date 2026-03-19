

# Plano: Sistema de Verificação de Completude + Migração para GPT-5

## Problema Real Identificado

1. **`num_steps` hardcoded em 10** — `Stage2Structure.tsx` L231 envia `num_steps: 10`, independente do que as instruções pedem (ex: 13 passos).
2. **Sem verificação de completude** — A edge function aceita qualquer quantidade de passos da IA sem validar contra o pedido.
3. **Modelo atual: `google/gemini-2.5-flash`** — L133 de `v10-generate-steps/index.ts`. Será trocado por `openai/gpt-5`.

## Plano de Correções (3 arquivos)

### Alteração 1 — Extrair `num_steps` das instruções (Frontend)

**Arquivo**: `src/components/admin/v10/stages/Stage2Structure.tsx`, L228-236

Extrair a quantidade de passos das instruções do usuário via regex (ex: "Passo 13:" → 13 passos) e enviar como `num_steps` real em vez do valor fixo `10`.

```typescript
// Parse num_steps from instructions
const stepMatches = instructions?.match(/Passo\s+(\d+)/gi) || [];
const maxStep = stepMatches.reduce((max, m) => {
  const n = parseInt(m.replace(/\D/g, ''));
  return n > max ? n : max;
}, 0);
const numSteps = maxStep > 0 ? maxStep : 13; // fallback 13

body: {
  pipeline_id: pipeline.id,
  num_steps: numSteps,
  instructions: instructions || '',
  ...
}
```

### Alteração 2 — Sistema de Verificação + Completude (Edge Function)

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`

Após receber os passos da IA (L155-165), adicionar loop de verificação:

```
1. Gerar passos (chamada principal)
2. Contar steps recebidos vs num_steps pedido
3. Se completo → segue fluxo padrão
4. Se incompleto → enviar follow-up pedindo APENAS os passos faltantes
5. Mesclar array original + complemento
6. Repetir até completo ou max 2 retries
7. Seguir fluxo padrão com array final
```

Lógica concreta:
```typescript
const MAX_COMPLETION_RETRIES = 2;
let allSteps = steps; // resultado da primeira chamada

for (let retry = 0; retry < MAX_COMPLETION_RETRIES; retry++) {
  if (allSteps.length >= num_steps) break;
  
  const missing = num_steps - allSteps.length;
  const lastStep = allSteps[allSteps.length - 1];
  
  const completionMessage = `Você gerou ${allSteps.length} passos mas eu pedi ${num_steps}.
Faltam os passos ${allSteps.length + 1} até ${num_steps}.
O último passo gerado foi: step_number=${lastStep.step_number}, title="${lastStep.title}".
Gere APENAS os ${missing} passos faltantes (do ${allSteps.length + 1} ao ${num_steps}).
O último passo (${num_steps}) DEVE ser AILIV (celebração).
Retorne APENAS o JSON array dos passos faltantes.`;

  // Segunda chamada à IA (mesma config, prompt de completude)
  const completionResponse = await fetch(gatewayUrl, { ... });
  const completionSteps = parse(completionResponse);
  
  // Renumerar e mesclar
  for (const cs of completionSteps) {
    cs.step_number = allSteps.length + 1;
    allSteps.push(cs);
  }
}

// Log resultado da verificação
console.log(`[v10-generate-steps] Completeness: ${allSteps.length}/${num_steps} steps`);
```

### Alteração 3 — Trocar modelo para GPT-5

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`, L133

```typescript
// ANTES:
model: "google/gemini-2.5-flash",

// DEPOIS:
model: "openai/gpt-5",
```

## Escopo Final

| Item | Arquivo | Tipo |
|------|---------|------|
| Extrair `num_steps` real das instruções | `Stage2Structure.tsx` | Frontend |
| Loop de completude (max 2 retries) | `v10-generate-steps/index.ts` | Edge Function |
| Trocar modelo para `openai/gpt-5` | `v10-generate-steps/index.ts` | Edge Function |
| Deploy automático | — | 1 deploy |

- 2 arquivos alterados
- 0 migrations
- 0 tabelas novas

