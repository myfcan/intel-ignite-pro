
# Plano: Auditoria C01 Real com lesson_migrations_audit

## Diagnóstico Honesto da Situação Atual

### O que Existe Hoje:

1. **Tabela `lesson_migrations_audit`**: NÃO EXISTE
   - Consulta retornou resultado vazio
   - Não há infraestrutura para armazenar snapshots ANTES/DEPOIS

2. **Modo Reprocess na Edge Function `v7-vv`**: EXISTE E FUNCIONA
   - Linhas 2946-2988: Carrega `audio_url` e `word_timestamps` do banco via `existing_lesson_id`
   - Linhas 3161-3180: Faz `UPDATE` no campo `content` (não INSERT)
   - **PROBLEMA**: Não salva snapshot do `old_content` antes de sobrescrever

3. **Aula Golden Standard (19f7e1df)**: EXISTE NO BANCO
   - Título: "O Fim da Brincadeira com IA"
   - Criada em: 2025-12-31
   - 10 phases com word_timestamps

### Por que C01 Não Fecha:

O problema identificado pelo usuário é correto:
- Para provar que um bug de timing foi corrigido, precisamos comparar o **MESMO registro** ANTES e DEPOIS
- Atualmente, quando o reprocess roda, ele **sobrescreve** o `content` sem guardar o valor anterior
- Sem snapshot, é impossível provar que "só mudou o keywordTime"

---

## Plano de Implementação

### Fase 1: Criar Tabela `lesson_migrations_audit`

```sql
CREATE TABLE public.lesson_migrations_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  migration_version TEXT NOT NULL,
  migration_status TEXT NOT NULL DEFAULT 'pending',
  old_content JSONB NOT NULL,
  new_content JSONB,
  old_word_timestamps JSONB,
  new_word_timestamps JSONB,
  diff_summary JSONB,
  triggered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_migrations_lesson ON public.lesson_migrations_audit(lesson_id);
CREATE INDEX idx_migrations_status ON public.lesson_migrations_audit(migration_status);
```

**Campos:**
- `old_content`: Snapshot COMPLETO do content antes do reprocess
- `new_content`: Snapshot COMPLETO do content após o reprocess
- `diff_summary`: Resumo das diferenças (quais campos mudaram)
- `migration_status`: 'pending' → 'in_progress' → 'completed' | 'failed'
- `migration_version`: Versão do pipeline (ex: "v2.1-c01-fix")

---

### Fase 2: Atualizar Edge Function `v7-vv` para Suportar Audit

Modificar o handler do modo reprocess (linhas 3161-3180) para:

1. **Antes do UPDATE**:
   - Buscar o `content` atual da lição
   - Inserir registro em `lesson_migrations_audit` com `old_content` e status='in_progress'

2. **Após o UPDATE**:
   - Atualizar o registro de audit com `new_content` e status='completed'
   - Gerar `diff_summary` comparando os campos alterados

```text
Pseudocódigo:

IF isReprocess:
  // 1. Buscar estado atual
  oldContent = SELECT content FROM lessons WHERE id = existing_lesson_id
  
  // 2. Criar registro de audit
  auditId = INSERT INTO lesson_migrations_audit (
    lesson_id, old_content, migration_version, migration_status
  ) VALUES (existing_lesson_id, oldContent, 'v2.1-c01', 'in_progress')
  
  // 3. Executar UPDATE normal
  UPDATE lessons SET content = newContent WHERE id = existing_lesson_id
  
  // 4. Completar audit
  diffSummary = computeDiff(oldContent, newContent)
  UPDATE lesson_migrations_audit SET 
    new_content = newContent,
    diff_summary = diffSummary,
    migration_status = 'completed',
    completed_at = NOW()
  WHERE id = auditId
```

---

### Fase 3: Executar Reprocess Real com Audit

1. **Capturar ANTES**:
   - Extrair `content->'phases'` da aula 19f7e1df via SQL
   - Salvar em `lesson_migrations_audit.old_content`

2. **Executar Reprocess**:
   - Chamar `v7-vv` com payload:
```json
{
  "reprocess": true,
  "existing_lesson_id": "19f7e1df-6fb8-435f-ad51-cc44ac67618d",
  "title": "O Fim da Brincadeira com IA",
  "scenes": [ ... cenas do JSON input ... ]
}
```

3. **Capturar DEPOIS**:
   - Extrair `new_content` do registro de audit

4. **Gerar Relatório Forense**:
   - Para cada phase que tem `anchorActions`:
     - Comparar `old_content.phases[X].anchorActions[Y].keywordTime` vs `new_content`
     - Verificar se APENAS `keywordTime` mudou
     - Verificar se outras propriedades (keyword, type, phaseId) permanecem IGUAIS

---

### Fase 4: Formato do Relatório C01 Final

```text
=== C01 FORENSIC AUDIT REPORT ===
Lesson ID: 19f7e1df-6fb8-435f-ad51-cc44ac67618d
Migration Version: v2.1-c01
Timestamp: 2026-02-03T19:XX:XXZ

=== BASELINE (BEFORE) ===
| Phase ID | Anchor Type | Keyword | keywordTime | Range |
|----------|-------------|---------|-------------|-------|
| cena-6-quiz | pause | representa você | 51.246 | [44.801, 51.546] |
| cena-7-promessa | pause | você faz | 63.425 | [51.546, 63.725] |
| cena-10-playground | pause | teste agora | 86.737 | [87.000, 87.037] |

=== AFTER REPROCESS ===
| Phase ID | Anchor Type | Keyword | keywordTime | Range | Status |
|----------|-------------|---------|-------------|-------|--------|
| cena-6-quiz | pause | representa você | 51.XXX | [44.801, 51.546] | ✅ SAME |
| cena-7-promessa | pause | você faz | 63.XXX | [51.546, 63.725] | ✅ SAME |
| cena-10-playground | pause | teste agora | 86.XXX | [87.000, 87.037] | ✅ SAME |

=== DIFF ANALYSIS ===
Properties Changed: keywordTime only ✅
Properties Unchanged: keyword, type, phaseId, targetId ✅
T1 Failures Before: X
T1 Failures After: 0

=== VERDICT ===
C01 DONE: Only keywordTime changed, all other properties preserved.
```

---

## Seção Técnica

### Arquivos a Modificar:

1. **Migração SQL**: Nova tabela `lesson_migrations_audit`
2. **supabase/functions/v7-vv/index.ts**: 
   - Adicionar lógica de snapshot antes do UPDATE (linhas ~3161-3180)
   - Adicionar função `computeDiff()` para comparar old vs new
3. **Opcional**: Script de debug `scripts/c01-audit.ts` para gerar relatório formatado

### Riscos e Mitigações:

| Risco | Mitigação |
|-------|-----------|
| Reprocess pode quebrar a aula | Tabela audit permite rollback via `old_content` |
| Edge function timeout | Audit INSERT é síncrono; UPDATE do audit pode ser async |
| Diff muito grande | Limitar `diff_summary` a campos críticos (anchorActions) |

### Sequência de Execução:

1. Criar migração SQL para `lesson_migrations_audit`
2. Modificar `v7-vv/index.ts` para gravar audit
3. Deploy da edge function
4. Executar reprocess da aula 19f7e1df
5. Consultar `lesson_migrations_audit` e gerar relatório

