

# Plano Revisado — Fix phase + Redeploy

## Diagnóstico Real (código atual vs logs de produção)

### Erro nos logs (timestamp `1773929829788000`):
```
v10-generate-steps error: Error: Failed to insert step 1: invalid input syntax for type integer: "Preparação"
```

### Causa raiz confirmada — 2 problemas no código:

**Problema 1: Prompt pede string no exemplo de output**

Arquivo: `supabase/functions/_shared/prompt-master.ts`, linha 148-149:
```typescript
"phase": "Preparação",
"phase_number": 1,
```
A IA segue o exemplo e retorna `"phase": "Preparação"` (string).

**Problema 2: Código ignora `phase_number`**

Arquivo: `supabase/functions/v10-generate-steps/index.ts`, linha 238:
```typescript
let phase = step.phase;
```
O código usa `step.phase` (que é `"Preparação"`, string). O campo `step.phase_number` (que é `1`, inteiro) **nunca é verificado**.

O PHASE_MAP (linhas 225-229) existe no código-fonte mas **a edge function não foi re-deployada** — o erro nos logs prova que a versão em produção não tem o PHASE_MAP.

**Problema 3 (secundário): Validação de tools vazia**

Log (timestamp `1773929829552000`):
```
BLOQUEADO: Passo 1 usa "Calendly" que NÃO está nas ferramentas declaradas: []
```
O campo `pipeline.tools` está `[]` (vazio). A validação V1 bloqueia mas é non-blocking (só log). Não causa o crash, mas indica que o pipeline não tem tools configuradas.

## Correções (2 alterações + 1 deploy)

### Alteração 1 — Prompt: mudar exemplo para inteiro

**Arquivo**: `supabase/functions/_shared/prompt-master.ts`

Linha 148-149, de:
```
"phase": "Preparação",
"phase_number": 1,
```
Para:
```
"phase": 1,
```

Remover `phase_number` do exemplo. O campo real no banco é `phase` (integer).

### Alteração 2 — Código: usar `phase_number` como fallback

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`

Linha 238, de:
```typescript
let phase = step.phase;
```
Para:
```typescript
let phase = step.phase_number ?? step.phase;
```

Isso garante que se a IA retornar ambos os campos (como o prompt antigo pedia), o inteiro `phase_number` é usado primeiro. O PHASE_MAP (já existente nas linhas 225-229) serve como fallback caso `phase` ainda seja string.

### Ação 3 — Re-deploy da edge function

Deploy de `v10-generate-steps` para que o PHASE_MAP + fallback `phase_number` entrem em produção.

## Checklist Preditivo

| Cenário | Coberto? |
|---------|----------|
| IA retorna `"phase": "Preparação"` (string) | Sim — PHASE_MAP L225-229 converte |
| IA retorna `"phase": 1` (inteiro, novo prompt) | Sim — passa direto |
| IA retorna `"phase_number": 1` + `"phase": "Preparação"` | Sim — `phase_number` priorizado (Alt. 2) |
| IA retorna `"phase": 99` (fora do range) | Sim — fallback para 1 (L243-245) |
| IA retorna `"phase": null` | Sim — fallback para 1 (L243-245) |
| Edge function deployada com fix | Sim — Ação 3 |
| Tools vazias causam crash? | Não — validação V1 é non-blocking (só log) |

## Riscos Residuais

Nenhum para o erro de crash. O problema de `tools: []` no pipeline é pré-existente e não causa falha — apenas warnings no log.

## Escopo

- 2 arquivos alterados: `prompt-master.ts` (1 linha), `index.ts` (1 linha)
- 1 deploy
- 0 migrations

