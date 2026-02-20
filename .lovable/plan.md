
# Fix Sistêmico: C12.1 deve aceitar frames com storagePath sem promptScene

## Causa Raiz Confirmada (Forense)

O audit-contracts (`supabase/functions/audit-contracts/index.ts`, linha 347) exige `promptScene` em TODOS os frames de `image-sequence`, sem exceção:

```typescript
if (!frame.promptScene) c121Violations++;  // sem exceção para storagePath
```

Mas o contrato deveria ter uma exceção: **se o frame já possui `storagePath` explícito, `promptScene` é dispensável** — a imagem já existe (ou foi explicitamente marcada como PENDING).

A regra de negócio correta é:
- `promptScene` é obrigatório quando **não há storagePath** (pipeline precisa gerar a imagem)
- `promptScene` é **opcional** quando **há storagePath** (imagem já resolvida ou placeholder explícito)

O mesmo bug existe na **validação Preflight** da Edge Function `v7-vv` (linha 2612), que também exige `promptScene` sem verificar `storagePath`.

---

## Os 2 Arquivos a Corrigir

### Fix 1 — `supabase/functions/audit-contracts/index.ts` (linha 347)

**Antes (rígido demais):**
```typescript
if (!frame.promptScene) c121Violations++;
```

**Depois (lógica correta):**
```typescript
// promptScene é obrigatório SOMENTE se não há storagePath resolvido
const hasStoragePath = frame.storagePath && 
  !frame.storagePath.startsWith('PENDING:');
const hasPromptScene = !!frame.promptScene?.trim();
if (!hasStoragePath && !hasPromptScene) c121Violations++;
```

**Mas PENDING também deve ser aceito** — o usuário declarou explicitamente um placeholder. A regra deveria ser: se `storagePath` existe (mesmo que PENDING), `promptScene` é dispensável. A intenção do frame está declarada.

```typescript
// Se storagePath está presente (mesmo PENDING), promptScene é dispensável
const hasExplicitStoragePath = !!frame.storagePath;
const hasPromptScene = !!frame.promptScene?.trim();
if (!hasExplicitStoragePath && !hasPromptScene) c121Violations++;
```

### Fix 2 — `supabase/functions/v7-vv/index.ts` (linha 2612, Preflight)

Mesma lógica na validação Preflight que ocorre antes do pipeline rodar:

**Antes:**
```typescript
if (!f.promptScene?.trim()) issues.push({ severity: 'error', ... message: 'promptScene obrigatório' });
```

**Depois:**
```typescript
const hasExplicitPath = !!f.storagePath;
if (!hasExplicitPath && !f.promptScene?.trim()) {
  issues.push({ severity: 'error', scene: sceneId, 
    field: `visual.content.frames[${fi}].promptScene`, 
    message: 'promptScene obrigatório quando storagePath não está definido' });
}
```

---

## Comportamento Após o Fix

| Frame | promptScene | storagePath | Resultado |
|-------|-------------|-------------|-----------|
| Frame com imagem gerada | Presente | Ausente | ✅ Passa (gera imagem) |
| Frame com URL real | Ausente | `image-lab/assets/uuid.png` | ✅ Passa (imagem existente) |
| Frame de teste | Ausente | `PENDING:bridge-failed:frame0.png` | ✅ Passa (placeholder explícito) |
| Frame inválido | Ausente | Ausente | ❌ Falha (correto — sem imagem nem prompt) |

---

## Arquivos a Modificar

1. `supabase/functions/audit-contracts/index.ts` — linha 347: condição `if (!frame.promptScene)`
2. `supabase/functions/v7-vv/index.ts` — linha 2612: validação Preflight do mesmo campo

Após o fix, re-deploy de ambas as edge functions. O JSON de teste do usuário vai passar no pipeline completo e finalmente será possível validar o sistema determinístico de anchors com dados reais.

---

## O Que NÃO Muda

- Nenhuma lógica de anchor é alterada
- Nenhum contrato C01-C11, C13-C15 é afetado
- A Image Lab Bridge continua exigindo `promptScene` para geração (isso é correto — só o audit gate e o preflight são relaxados)
- O player continua usando `storagePath` como fonte primária de imagem
