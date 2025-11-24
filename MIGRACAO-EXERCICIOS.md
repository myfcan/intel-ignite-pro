# 🔧 Migração: Exercícios Corrompidos

## ⚠️ Quando Usar Este Guia

Use este guia **APENAS SE** você fez upload de lições com exercícios **ANTES** da correção do bug e elas foram salvas no banco com dados corrompidos.

---

## 📋 Passo a Passo

### 1️⃣ Verificar Se Precisa Migrar

Execute no **Supabase SQL Editor**:

```sql
SELECT
  COUNT(*) as total_licoes_corrompidas,
  array_agg(title) as titulos
FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND jsonb_array_length((content->'exercisesConfig')::jsonb) > 0
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
```

**Resultado:**
- **0 lições** → ✅ **NÃO precisa migração!** Tudo certo!
- **1+ lições** → ⚠️ Continue para o passo 2

---

### 2️⃣ Ver Detalhes das Lições Corrompidas

Execute:

```sql
SELECT
  id,
  title,
  created_at,
  trail_id,
  is_active,
  jsonb_pretty((content->'exercisesConfig')::jsonb) as exercises_json
FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  )
ORDER BY created_at DESC;
```

Isso mostra:
- Quais lições estão corrompidas
- Quando foram criadas
- Se estão ativas (`is_active`)

---

### 3️⃣ Escolher Estratégia de Migração

Escolha UMA das 3 opções:

#### **Opção A: Deletar Lições Corrompidas** (Recomendado para testes)

✅ Use se:
- As lições são apenas testes
- Você pode recriar facilmente

```sql
DELETE FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
```

---

#### **Opção B: Desativar Lições** (Recomendado para produção)

✅ Use se:
- Quer manter histórico
- Remover de produção mas não deletar

```sql
UPDATE lessons
SET is_active = false
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
```

---

#### **Opção C: Remover Apenas Exercícios Corrompidos** (Mais cirúrgico)

✅ Use se:
- Quer manter a lição
- Remover apenas exercícios problemáticos
- A lição tem outros exercícios válidos

```sql
UPDATE lessons
SET content = jsonb_set(
  content,
  '{exercisesConfig}',
  (
    SELECT jsonb_agg(ex)
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE NOT (
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
    )
  ),
  true
)
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
```

---

### 4️⃣ Verificar Migração

Após executar UMA das opções, verifique:

```sql
SELECT COUNT(*) as licoes_corrompidas_restantes
FROM lessons
WHERE
  content->'exercisesConfig' IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements((content->'exercisesConfig')::jsonb) as ex
    WHERE
      ex->>'type' = 'multiple-choice'
      AND (
        ex->'data'->>'options' IS NULL
        OR ex->'data'->>'correctAnswer' IS NULL
      )
  );
```

**Resultado esperado:** `0` (zero lições corrompidas)

---

## 🚀 Após a Migração

1. ✅ Faça **merge/pull** do branch `claude/fix-json-parsing-014hFnfJofgbQBPeAXNrE1DF`
2. ✅ Use o arquivo `7-prompts-magicos-v2.json` para recriar lições
3. ✅ Faça upload pelo **Admin Pipeline Create Batch**
4. ✅ Novos uploads **NÃO terão mais** o bug!

---

## 📌 Resumo

| Situação | Precisa Migração? | O que fazer |
|----------|-------------------|-------------|
| Nenhuma lição criada antes da correção | ❌ NÃO | Nada! Só usar o sistema normalmente |
| Lições de teste corrompidas | ⚠️ SIM | Opção A: Deletar e recriar |
| Lições em produção corrompidas | ⚠️ SIM | Opção B: Desativar + recriar novas |
| Lições com mix de exercícios válidos/corrompidos | ⚠️ SIM | Opção C: Remover apenas corrompidos |

---

## ❓ Dúvidas?

Execute o **Passo 1** primeiro. Se retornar **0 lições**, você **NÃO precisa fazer nada**! 🎉
