

# Plano Forense: Corrigir "Gerar Passos" — Causa Raiz + Correções

## 1. CAUSA RAIZ CONFIRMADA (com evidências)

Existem **3 falhas encadeadas** que impedem "Gerar Passos" de funcionar:

### Falha A — `liv` nulo no passo 13 (causa do 500)

A IA gerou 13 passos, mas o passo 13 retornou `liv: null`. O insert na L270 passa `liv: step.liv` direto, sem sanitização.

**Código real** (`v10-generate-steps/index.ts`, L269-270):
```typescript
frames: step.frames,
liv: step.liv,    // ← null quando IA não gera o campo
```

**Schema real** (`v10_lesson_steps.liv`): `jsonb, NOT NULL, default '{"sos":"","tip":"","analogy":""}'`.

O default do Postgres só se aplica quando a coluna é OMITIDA do INSERT. Ao passar `null` explicitamente, o NOT NULL constraint é violado.

### Falha B — 12 passos órfãos impedem retry (UNIQUE constraint)

Após o crash no passo 13, os passos 1-12 já foram persistidos:
- **Query real**: `SELECT count(*) FROM v10_lesson_steps WHERE lesson_id = '8fd4e972...'` → `12`
- **Pipeline**: `steps_generated = 0`, `total_steps = 0` (inconsistente)

Ao clicar "Gerar Passos" novamente, a função tenta inserir step_number 1 → viola `UNIQUE (lesson_id, step_number)` → novo 500.

**Index real**: `v10_lesson_steps_lesson_id_step_number_key ON (lesson_id, step_number)`

### Falha C — V1 bloqueia alias de ferramenta (causa de 400 intermitente)

**Log anterior**: `V1 validation BLOCKED ... "OpenAI Platform" ... ferramentas declaradas: [Calendly, ChatGPT]`

A IA às vezes usa `"OpenAI Platform"` (nome da TABELA_FERRAMENTAS no prompt-master) em vez de `"ChatGPT"` (nome declarado pelo usuário). A validação em L512 faz comparação `===` literal:
```typescript
if (!declaredTools.includes(step.app_name) && step.app_name !== 'AILIV') {
```

Não há canonicalização de nomes.

### Falha D (latente) — `intermediary_status` coluna inexistente

**Query real**: `SELECT column_name FROM information_schema.columns WHERE table_name = 'v10_bpa_pipeline' AND column_name = 'intermediary_status'` → `[]` (vazio)

Código L223-226:
```typescript
.update({ intermediary_status: steps[0] })
```

Só é atingido no path `INTERMEDIARY_NEEDED` — não é a causa principal, mas vai crashar se atingido.

---

## 2. PLANO DE CORREÇÕES (5 alterações)

### Alteração 1 — Sanitizar `liv` antes do insert

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`, L269-270

Substituir `liv: step.liv` por fallback obrigatório:
```typescript
liv: (step.liv && typeof step.liv === 'object' && step.liv.tip !== undefined)
  ? step.liv
  : { tip: "", analogy: "", sos: "" },
```

### Alteração 2 — Tornar geração idempotente (delete before insert)

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`

Antes do loop de insert (L241), adicionar delete dos passos existentes para a mesma `lesson_id`:
```typescript
// Idempotent: remove any previous steps for this lesson
await supabase
  .from("v10_lesson_steps")
  .delete()
  .eq("lesson_id", lesson_id);
```

Isso resolve tanto o estado atual (12 órfãos) quanto futuras colisões.

### Alteração 3 — Canonicalizar nomes de ferramenta na V1

**Arquivo**: `supabase/functions/_shared/prompt-master.ts`, função `validateTools` (L509-518)

Adicionar mapa de aliases antes da comparação:
```typescript
const TOOL_ALIASES: Record<string, string> = {
  "OpenAI Platform": "ChatGPT",
  "OpenAI": "ChatGPT",
  "OpenAI ChatGPT": "ChatGPT",
  "Make.com": "Make",
  "Google Sheets": "Sheets",
  "Google Forms": "Forms",
  "WhatsApp": "WhatsApp Business",
};

export function validateTools(steps, declaredTools) {
  const canonical = (name: string) => TOOL_ALIASES[name] || name;
  const declaredSet = new Set(declaredTools.map(canonical));
  const errors = [];
  for (const step of steps) {
    const appCanonical = canonical(step.app_name);
    if (!declaredSet.has(appCanonical) && step.app_name !== 'AILIV') {
      errors.push(`BLOQUEADO: Passo ${step.step_number} usa "${step.app_name}" ...`);
    }
  }
  return { passed: errors.length === 0, errors };
}
```

### Alteração 4 — Remover referência a `intermediary_status`

**Arquivo**: `supabase/functions/v10-generate-steps/index.ts`, L221-232

A coluna `intermediary_status` **NÃO EXISTE** no banco. Remover o update e simplesmente retornar o resultado `INTERMEDIARY_NEEDED` sem persistir:
```typescript
if (steps.length === 1 && steps[0]?.status === 'INTERMEDIARY_NEEDED') {
  // Column intermediary_status does NOT exist — just return the response
  return new Response(
    JSON.stringify({ success: true, intermediary_needed: true, options: steps[0].options }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

### Alteração 5 — Corrigir `validateStructure` (phase vs phase_number)

**Arquivo**: `supabase/functions/_shared/prompt-master.ts`, L557

Código atual:
```typescript
const phases = new Set(steps.map((s: any) => s.phase_number));
```

O insert usa `phase` (não `phase_number`). Após sanitização, o campo canônico é `phase`. Corrigir para:
```typescript
const phases = new Set(steps.map((s: any) => s.phase_number ?? s.phase));
```

### Deploy

Re-deploy de `v10-generate-steps` (que puxa `_shared/prompt-master.ts`).

---

## 3. DADOS CORRUPTADOS — estado atual

| Dado | Valor real | Valor correto |
|------|-----------|---------------|
| `v10_lesson_steps` count para lesson `8fd4e972` | 12 | 0 (limpeza via Alteração 2 no próximo run) |
| `v10_bpa_pipeline.steps_generated` | 0 | 0 (correto, pois geração falhou) |
| `v10_lessons.total_steps` | 0 | 0 (correto) |
| `v10_lessons.tools` | `[]` | `[]` (será preenchido após geração bem-sucedida) |

A Alteração 2 (idempotent delete) resolve automaticamente os 12 passos órfãos no próximo clique de "Gerar Passos".

---

## 4. CHECKLIST PREDITIVO PÓS-EXECUÇÃO

| Cenário | Coberto? | Como |
|---------|----------|------|
| `liv` nulo em qualquer passo | Sim | Fallback obrigatório (Alt. 1) |
| Retry após falha parcial | Sim | Delete idempotente (Alt. 2) |
| IA usa "OpenAI Platform" em vez de "ChatGPT" | Sim | Aliases V1 (Alt. 3) |
| IA retorna `INTERMEDIARY_NEEDED` | Sim | Sem update em coluna inexistente (Alt. 4) |
| `validateStructure` conta fases errado | Sim | Usa `phase` com fallback (Alt. 5) |
| JSON truncado/mal formado da IA | Parcial | Já tratado L156-161 (throw com substring do raw) |
| Frontend mostra erro genérico "non-2xx" | Já tratado | L238-246 extrai `data.error` e `error.message` |

## 5. ESCOPO

- 2 arquivos alterados: `v10-generate-steps/index.ts` + `_shared/prompt-master.ts`
- 0 migrations
- 0 alterações frontend
- 1 deploy

