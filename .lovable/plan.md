

# Plano v4.1: lesson_migrations_audit (Versão Definitiva)

## Ajustes v4 → v4.1

| Ajuste | Problema v4 | Correção v4.1 |
|--------|-------------|---------------|
| 1. Hash determinístico | JSON.stringify sem ordenação = falso negativo se ordem mudar | Ordenar phases por `id`, anchors por chave estável ANTES de hashear |
| 2. buildAnchorKey com índice | Colisão quando `id` ausente + anchors repetidos na phase | Incluir `idx:${i}` no fallback |
| 3. Catch sem .select('id') | updateResult pode ser null mesmo com update executado | Remover `.select('id')` e usar contagem de erro apenas |

---

## Correção 1: Hash Determinístico

```typescript
async function computeStructureHash(phases: any[]): Promise<string> {
  // ORDENAR antes de hashear para garantir determinismo
  const sortedPhases = [...phases]
    .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
    .map(p => ({
      id: p.id,
      type: p.type,
      anchors: [...(p.anchorActions || [])]
        .sort((a, b) => {
          // Ordenar por id se existir, senão por type+keyword
          const keyA = a.id || `${a.type}|${a.keyword}|${a.targetId || ''}`;
          const keyB = b.id || `${b.type}|${b.keyword}|${b.targetId || ''}`;
          return keyA.localeCompare(keyB);
        })
        .map((a: any) => ({
          id: a.id,
          type: a.type,
          keyword: a.keyword,
          targetId: a.targetId
          // keywordTime EXCLUÍDO
        }))
    }));
  
  return computeSHA256(JSON.stringify(sortedPhases));
}

async function computeTimingHash(phases: any[]): Promise<string> {
  // Mesma ordenação para consistência
  const sortedPhases = [...phases]
    .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
    .map(p => ({
      id: p.id,
      anchors: [...(p.anchorActions || [])]
        .sort((a, b) => {
          const keyA = a.id || `${a.type}|${a.keyword}|${a.targetId || ''}`;
          const keyB = b.id || `${b.type}|${b.keyword}|${b.targetId || ''}`;
          return keyA.localeCompare(keyB);
        })
        .map((a: any) => ({
          id: a.id,
          keywordTime: a.keywordTime
        }))
    }));
  
  return computeSHA256(JSON.stringify(sortedPhases));
}
```

---

## Correção 2: buildAnchorKey com Índice

```typescript
function buildAnchorKey(phaseId: string, anchor: any, anchorIndex: number): string {
  // SEMPRE incluir phaseId
  if (anchor.id) {
    return `phase:${phaseId}|id:${anchor.id}`;
  }
  // Fallback: incluir índice para evitar colisão
  if (anchor.targetId) {
    return `phase:${phaseId}|idx:${anchorIndex}|type:${anchor.type}|target:${anchor.targetId}|kw:${anchor.keyword}`;
  }
  return `phase:${phaseId}|idx:${anchorIndex}|type:${anchor.type}|kw:${anchor.keyword}`;
}

// Uso nos mapas:
for (const phase of oldPhases) {
  const anchors = phase.anchorActions || [];
  anchors.forEach((anchor: any, idx: number) => {
    const key = buildAnchorKey(phase.id, anchor, idx);
    oldAnchorsMap.set(key, { phase, anchor, index: idx });
  });
}
```

---

## Correção 3: Catch sem .select('id')

```typescript
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // UPDATE sem .select() - verificar apenas erro
  const { error: updateError } = await supabase
    .from('lesson_migrations_audit')
    .update({
      migration_status: 'failed',
      error_message: errorMessage,
      completed_at: new Date().toISOString()
    })
    .eq('lesson_id', input.existing_lesson_id)
    .eq('run_id', runId);
  
  // Se UPDATE deu erro (não existe registro), fazer INSERT fallback
  if (updateError) {
    console.log(`[V7-vv] AUDIT: Update failed, inserting fallback record`);
    
    await supabase
      .from('lesson_migrations_audit')
      .upsert({
        lesson_id: input.existing_lesson_id,
        run_id: runId,
        migration_version: 'v2.1-c01-fix',
        migration_status: 'failed',
        old_content: oldContent || {},
        error_message: errorMessage,
        triggered_by: 'v7-vv-reprocess-failed',
        completed_at: new Date().toISOString()
      }, { onConflict: 'lesson_id,run_id' });
  }
  
  throw error;
}
```

---

## Schema SQL Final (v4.1)

Sem mudanças em relação ao v4 - o schema está correto:

```sql
CREATE TABLE public.lesson_migrations_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  run_id UUID NOT NULL,
  migration_version TEXT NOT NULL,
  migration_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (migration_status IN ('pending', 'in_progress', 'completed', 'failed')),
  old_content JSONB NOT NULL,
  new_content JSONB,
  diff_summary JSONB,
  triggered_by TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT unique_lesson_run UNIQUE(lesson_id, run_id)
);

CREATE INDEX idx_migrations_lesson ON public.lesson_migrations_audit(lesson_id);
CREATE INDEX idx_migrations_status ON public.lesson_migrations_audit(migration_status);
CREATE INDEX idx_migrations_version ON public.lesson_migrations_audit(migration_version);
CREATE INDEX idx_migrations_run ON public.lesson_migrations_audit(run_id);

ALTER TABLE public.lesson_migrations_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access"
ON public.lesson_migrations_audit
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "admins_read_audits"
ON public.lesson_migrations_audit
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Checklist Final v4.1

| Item | Status |
|------|--------|
| run_id obrigatório do request | ✅ |
| Validação UUID | ✅ |
| 23505 → completed (200) / in_progress (409) / failed (400) | ✅ |
| RLS com USING + WITH CHECK | ✅ |
| catch marca failed + fallback upsert | ✅ |
| buildAnchorKey inclui phaseId + idx sempre | ✅ |
| SHA-256 com ordenação determinística | ✅ |
| structureHashMatch calculado e salvo | ✅ |
| inRange com EPS (0.30s) registrado | ✅ |
| catch sem .select('id') | ✅ |

---

## Sequência de Implementação

1. **Migração SQL**: Criar tabela `lesson_migrations_audit` com schema v4.1
2. **Edge Function v7-vv/index.ts**:
   - Adicionar `computeSHA256()` com crypto.subtle
   - Adicionar `computeStructureHash()` e `computeTimingHash()` com ordenação
   - Adicionar `buildAnchorKey()` com índice
   - Adicionar `computeAnchorDiffStrong()` async
   - Modificar bloco `isReprocess` com validação run_id + 23505 handling + try/catch robusto
3. **Deploy** edge function
4. **Executar reprocess** com run_id gerado pelo client
5. **Consultar audit** e gerar relatório C01 forense

---

## Seção Técnica

### Arquivos a Modificar

| Arquivo | Modificações |
|---------|--------------|
| **Nova migração SQL** | Tabela `lesson_migrations_audit` com schema completo |
| `supabase/functions/v7-vv/index.ts` | ~150 linhas: funções de hash, buildAnchorKey, computeAnchorDiffStrong, bloco isReprocess |

### Funções a Adicionar (v7-vv/index.ts)

1. `computeSHA256(data: string): Promise<string>` - ~8 linhas
2. `computeStructureHash(phases: any[]): Promise<string>` - ~25 linhas (com ordenação)
3. `computeTimingHash(phases: any[]): Promise<string>` - ~20 linhas (com ordenação)
4. `buildAnchorKey(phaseId: string, anchor: any, anchorIndex: number): string` - ~10 linhas
5. `computeAnchorDiffStrong(oldContent: any, newContent: any): Promise<object>` - ~100 linhas

### Payload do Reprocess

```json
{
  "reprocess": true,
  "existing_lesson_id": "19f7e1df-6fb8-435f-ad51-cc44ac67618d",
  "run_id": "uuid-gerado-pelo-client",
  "title": "O Fim da Brincadeira com IA",
  "scenes": [...]
}
```

