

# Plano: Padronização do Execution State Contract - Formato JSON Canônico

## Diagnóstico

### Problema Identificado
O formato atual de `error_message` é **híbrido/misto**, dificultando queries forenses:

```
[PAUSE_ANCHOR_NOT_FOUND] {"error_code":"PAUSE_ANCHOR_NOT_FOUND","error_details":{...}} | Details: {...}
```

### Causa Raiz (Linha 6499-6502 de `v7-vv/index.ts`)
```typescript
const fullErrorMessage = errorDetails 
  ? `[${errorCode}] ${errorMessage} | Details: ${JSON.stringify(errorDetails)}`
  : `[${errorCode}] ${errorMessage}`;
```

Isso concatena prefixos textuais (`[CODE]`) com JSON, resultando em string não-parseável diretamente.

---

## Solução Proposta

### Formato Canônico Oficial

```json
{
  "error_code": "PAUSE_ANCHOR_NOT_FOUND",
  "error_message": "Anchor text not found in narration range",
  "error_details": {
    "phase_id": "cena-6-quiz",
    "pauseAt": "inexistente123xyz",
    "startTime": 43.936,
    "endTime": 50.473
  }
}
```

**Regras:**
- Campo `error_code`: string identificadora (ex: `PAUSE_ANCHOR_NOT_FOUND`)
- Campo `error_message`: descrição legível
- Campo `error_details`: objeto JSON com contexto técnico (pode ser `null` ou `{}`)

---

## Alterações Técnicas

### 1. Modificar `v7-vv/index.ts` - Catch Block (Linhas 6499-6502)

**De:**
```typescript
const fullErrorMessage = errorDetails 
  ? `[${errorCode}] ${errorMessage} | Details: ${JSON.stringify(errorDetails)}`
  : `[${errorCode}] ${errorMessage}`;
```

**Para:**
```typescript
const fullErrorMessage = JSON.stringify({
  error_code: errorCode,
  error_message: errorMessage,
  error_details: errorDetails ?? null,
});
```

### 2. Modificar Validation Errors (se existirem prefixos `[VALIDATION_ERROR]`)

Garantir que erros de validação também sigam o formato:
```json
{
  "error_code": "VALIDATION_ERROR",
  "error_message": "JSON inválido: ...",
  "error_details": null
}
```

---

## Queries Oficiais para Extração

### Query 1: Extrair `error_code`
```sql
SELECT 
  run_id,
  status,
  error_message::jsonb->>'error_code' AS error_code
FROM pipeline_executions
WHERE status = 'failed';
```

### Query 2: Extrair `error_details`
```sql
SELECT 
  run_id,
  status,
  error_message::jsonb->'error_details' AS error_details
FROM pipeline_executions
WHERE status = 'failed';
```

### Query 3: Relatório Completo de Falhas
```sql
SELECT 
  run_id,
  status,
  error_message::jsonb->>'error_code' AS error_code,
  error_message::jsonb->>'error_message' AS error_message_text,
  error_message::jsonb->'error_details' AS error_details,
  completed_at
FROM pipeline_executions
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## Validação e Prova

### Etapa 1: Aplicar Patch no Código
Modificar linhas 6499-6502 para usar formato JSON canônico.

### Etapa 2: Rodar FORCE TEST Novamente (R01-R12)
Executar bateria completa para gerar novos registros com formato correto.

### Etapa 3: Prova SQL em R05 (ou outro FAIL)
```sql
SELECT 
  run_id,
  status,
  error_message::jsonb->>'error_code' AS error_code,
  error_message::jsonb->>'error_message' AS error_msg,
  error_message::jsonb->'error_details'->'phase_id' AS phase_id,
  error_message::jsonb->'error_details'->'pauseAt' AS pauseAt
FROM pipeline_executions
WHERE run_id = '<R05_RUN_ID>';
```

Resultado esperado:
| run_id | status | error_code | error_msg | phase_id | pauseAt |
|--------|--------|------------|-----------|----------|---------|
| f005... | failed | PAUSE_ANCHOR_NOT_FOUND | Anchor text not found... | "cena-6-quiz" | "inexistente123xyz" |

---

## Entregáveis

1. **Código modificado** com formato JSON canônico no catch/finally
2. **2 queries oficiais** para extração de error_code e error_details
3. **Prova SQL** executada em 1 run failed com resultado formatado

