

# Plano: Adicionar constraint e re-executar seed SDR de Voz

## Problema confirmado

O seed `20260315210000_v10_seed_sdr_voz.sql` (linha 39) usa:
```sql
ON CONFLICT (lesson_id, slide_order) DO NOTHING;
```

Mas a tabela `v10_lesson_intro_slides` **não possui unique constraint em `(lesson_id, slide_order)`**. Isso causa falha na migration inteira — nenhum dado é inserido.

## Plano (2 passos)

### Passo 1 — Migration: adicionar unique constraint

```sql
ALTER TABLE v10_lesson_intro_slides
  ADD CONSTRAINT v10_lesson_intro_slides_lesson_id_slide_order_key
  UNIQUE (lesson_id, slide_order);
```

Usar o **migration tool** (é alteração de schema).

### Passo 2 — Re-executar o seed via insert tool

Usar o **insert tool** (é inserção de dados) para executar o conteúdo completo do arquivo `20260315210000_v10_seed_sdr_voz.sql` (880 linhas):
- 1 lesson em `v10_lessons`
- 6 slides em `v10_lesson_intro_slides`
- 2 narrations em `v10_lesson_narrations`
- 27 steps em `v10_lesson_steps`

Todos os INSERTs usam `ON CONFLICT ... DO NOTHING`, então é seguro e idempotente.

### Resultado esperado

A página `/admin/pipeline/manage-lessons` exibirá **1 aula** ("SDR de Voz com IA") com **27 steps** e status `published`.

