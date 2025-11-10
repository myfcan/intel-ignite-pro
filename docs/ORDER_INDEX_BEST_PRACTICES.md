# ⚠️ Guia de Boas Práticas: order_index

## 📌 O Que é order_index?

O `order_index` é um campo **obrigatório** que define a **ordem de apresentação** das lições dentro de uma trilha. Ele garante que as lições sejam mostradas sequencialmente e que a navegação entre elas funcione corretamente.

### 🎯 Regras Fundamentais

- **ÚNICO**: Cada lição em uma trilha deve ter um `order_index` único
- **SEQUENCIAL**: Valores devem ser sequenciais (0, 1, 2, 3...) para evitar gaps
- **TRAIL-SPECIFIC**: Valores são únicos por trilha (trilhas diferentes podem ter os mesmos valores)
- **PROTEGIDO**: O banco de dados tem constraint `UNIQUE (trail_id, order_index)` que rejeita duplicatas

---

## ✅ SEMPRE FAZER

### 1. Especificar order_index Explicitamente

```typescript
// ✅ CORRETO: orderIndex especificado
await syncLessonV2Generic(
  lessonData,
  audioText,
  'Fundamentos de IA',
  'aula-05',
  4  // ← orderIndex explícito
);
```

### 2. Usar AdminBatchLessons para Criar Múltiplas Lições

- Acesse `/admin-batch-lessons`
- Selecione as lições desejadas
- O sistema **calcula automaticamente** os próximos índices disponíveis
- Edite manualmente se necessário
- Valide duplicatas antes de sincronizar

### 3. Verificar Índices Existentes Antes de Criar Nova Lição

```sql
-- Consultar order_index atual de uma trilha
SELECT order_index, title 
FROM lessons 
WHERE trail_id = (
  SELECT id FROM trails WHERE title = 'Fundamentos de IA'
)
ORDER BY order_index;
```

Resultado esperado:
```
order_index | title
------------|------------------------
0           | Aula 1: Introdução à IA
1           | Aula 2: Como a IA Aprende
2           | Aula 3: Fundamentos de ML
3           | Aula 4: IA no Dia a Dia
```

**Próximo índice disponível**: `4`

### 4. Testar Navegação Após Adicionar Novas Lições

Após criar novas lições, **sempre teste**:
- ✅ Navegação "Próxima Aula" funciona corretamente
- ✅ Última lição da trilha não mostra botão "Próxima Aula"
- ✅ `order_index` está correto no Dashboard Admin

---

## ❌ NUNCA FAZER

### 1. Confiar em Valores Default (0)

```typescript
// ❌ ERRADO: Omitir orderIndex (pode causar duplicatas)
await syncLessonV2Generic(
  lessonData,
  audioText,
  'Fundamentos de IA',
  'aula-05'
  // orderIndex será auto-calculado (menos seguro)
);
```

**Por quê?** Se múltiplas lições forem criadas sem `orderIndex`, todas podem receber `0` como fallback, causando conflito.

### 2. Reutilizar order_index na Mesma Trilha

```typescript
// ❌ ERRADO: Usar índice já existente
const orderIndex = 2; // Já existe uma lição com order_index = 2

await syncLessonV2Generic(
  newLesson,
  audioText,
  'Fundamentos de IA',
  'aula-nova',
  2  // ❌ ERRO: Duplicata!
);
```

**Resultado**: `ERROR: duplicate key value violates unique constraint "unique_trail_order"`

### 3. Criar Lições Manualmente Sem Verificar Último Índice

Sempre consulte o último `order_index` usado antes de criar uma nova lição manualmente.

### 4. Ignorar Erros de Constraint Único

Se receber erro de duplicata, **NÃO tente forçar**. Corrija o `order_index` ou atualize a lição existente.

---

## 🛠️ Como Adicionar Nova Lição

### Opção 1: Via AdminBatchLessons (RECOMENDADO) ⭐

1. Acesse `/admin-batch-lessons`
2. Selecione as lições que deseja criar
3. **Verificação automática**:
   - Sistema busca automaticamente o próximo `order_index` disponível
   - Preenche os campos com valores sequenciais
4. **Edição manual** (se necessário):
   - Ajuste os valores manualmente
   - Sistema valida duplicatas antes de enviar
5. Clique em "Sincronizar X Aulas Selecionadas"
6. Aguarde processamento e veja o relatório

**Vantagens**:
- ✅ Auto-cálculo de índices
- ✅ Validação de duplicatas integrada
- ✅ Interface visual
- ✅ Relatório detalhado

---

### Opção 2: Via syncLessonV2Generic Diretamente

```typescript
import { syncLessonV2Generic } from '@/lib/syncLessonV2Generic';
import { fundamentos05 } from '@/data/lessons/fundamentos-05';

// 1. Consultar último order_index (via Supabase ou SQL)
// Assumindo que o último é 3, o próximo é 4

// 2. Chamar função com orderIndex explícito
const result = await syncLessonV2Generic(
  fundamentos05,
  audioText,
  'Fundamentos de IA',
  'aula-05',
  4  // ← Especificar orderIndex
);

console.log(result);
```

**⚠️ IMPORTANTE**: 
- **SEMPRE** especifique `orderIndex` explicitamente
- Se omitir, a função irá **auto-calcular** o próximo índice, mas isso é menos previsível em ambientes concorrentes

---

### Opção 3: Via batchSyncLessons

```typescript
import { batchSyncLessons, createBatchLesson } from '@/lib/batchSyncLessons';

const batch = [
  createBatchLesson(fundamentos05, audioText05, {
    trailTitle: 'Fundamentos de IA',
    folderName: 'aula-05',
    orderIndex: 4  // ← Especificar
  }),
  createBatchLesson(fundamentos06, audioText06, {
    trailTitle: 'Fundamentos de IA',
    folderName: 'aula-06',
    orderIndex: 5  // ← Especificar
  })
];

const result = await batchSyncLessons(batch);
console.log(result);
```

**Validação**: A função valida duplicatas **dentro do batch** antes de processar.

---

## 🐛 Troubleshooting

### ❌ Erro: "duplicate key value violates unique constraint 'unique_trail_order'"

**Causa**: Tentando inserir uma lição com `order_index` que já existe na mesma trilha.

**Solução**:

1. **Consulte os índices existentes**:
```sql
SELECT order_index, title, id
FROM lessons 
WHERE trail_id = (SELECT id FROM trails WHERE title = 'Fundamentos de IA')
ORDER BY order_index;
```

2. **Use o próximo índice disponível**:
   - Se o último é `3`, use `4`
   - Se há gaps (ex: 0, 1, 3), você pode usar `2` ou `4`

3. **Ou atualize a lição existente**:
   - Se está tentando recriar uma lição, ela será **atualizada** automaticamente se o título for igual

---

### ❌ Erro: "Batch contém order_index duplicados"

**Causa**: Você está tentando criar múltiplas lições no mesmo batch com o mesmo `order_index`.

**Solução**:

1. Revise os valores de `orderIndex` no batch
2. Certifique-se de que cada lição tem um índice único
3. Use valores sequenciais (4, 5, 6...)

**Exemplo de correção**:

```typescript
// ❌ ERRADO
const batch = [
  createBatchLesson(lesson1, text1, { orderIndex: 4 }),
  createBatchLesson(lesson2, text2, { orderIndex: 4 })  // Duplicata!
];

// ✅ CORRETO
const batch = [
  createBatchLesson(lesson1, text1, { orderIndex: 4 }),
  createBatchLesson(lesson2, text2, { orderIndex: 5 })
];
```

---

### ⚠️ Aviso: "orderIndex foi auto-calculado"

**Causa**: Você omitiu o parâmetro `orderIndex` ao chamar `syncLessonV2Generic`.

**O que acontece**:
- A função consulta automaticamente o último `order_index` da trilha
- Incrementa +1 e usa esse valor
- Funciona, mas é **menos previsível** em ambientes concorrentes

**Solução**: Sempre especifique `orderIndex` explicitamente para evitar surpresas.

---

### 🔍 Como Verificar order_index de uma Lição Específica

```sql
SELECT id, title, order_index, trail_id
FROM lessons
WHERE title = 'Aula 4: IA no Dia a Dia';
```

---

### 🔄 Como Reorganizar order_index de uma Trilha

Se você tem gaps ou ordem errada, pode reorganizar:

```sql
-- Buscar todas as lições da trilha
SELECT id, title, order_index
FROM lessons
WHERE trail_id = (SELECT id FROM trails WHERE title = 'Fundamentos de IA')
ORDER BY order_index;

-- Atualizar manualmente cada lição (cuidado com constraint!)
UPDATE lessons SET order_index = 0 WHERE id = 'lesson-id-1';
UPDATE lessons SET order_index = 1 WHERE id = 'lesson-id-2';
-- etc...
```

**⚠️ CUIDADO**: Você não pode ter duas lições com o mesmo `order_index` ao mesmo tempo. Atualize uma de cada vez ou use uma transação.

---

## 📊 Fluxo de Validação do Sistema

```
1. Usuario cria lição
   ↓
2. syncLessonV2Generic recebe orderIndex (ou calcula automaticamente)
   ↓
3. Valida se orderIndex já existe na mesma trilha
   ↓
4. Se existir e for UPDATE → OK, atualiza
5. Se existir e for INSERT → ❌ ERRO
   ↓
6. Banco de dados valida constraint UNIQUE (trail_id, order_index)
   ↓
7. Se passar → ✅ Lição criada
8. Se falhar → ❌ ERRO de constraint
```

---

## 🎯 Resumo das Proteções Implementadas

| Camada | Proteção | Quando Ocorre |
|--------|----------|---------------|
| **AdminBatchLessons** | Validação visual de duplicatas | Antes de enviar |
| **batchSyncLessons** | Validação de duplicatas no batch | Início do processamento |
| **syncLessonV2Generic** | Validação pré-INSERT + auto-cálculo | Antes de inserir no banco |
| **Banco de Dados** | UNIQUE constraint `(trail_id, order_index)` | Nível SQL (última linha de defesa) |

---

## 🔗 Links Úteis

- **Admin Batch Lessons**: `/admin-batch-lessons`
- **Admin Sync Tester**: `/admin-sync-tester`
- **Código fonte**: 
  - `src/lib/syncLessonV2Generic.ts`
  - `src/lib/batchSyncLessons.ts`
  - `src/pages/AdminBatchLessons.tsx`

---

## ✅ Checklist de Criação de Lição

Antes de criar uma nova lição, verifique:

- [ ] Consultei o último `order_index` da trilha
- [ ] Calculei o próximo índice disponível (último + 1)
- [ ] Especifiquei `orderIndex` explicitamente
- [ ] Verifiquei que não há duplicatas no batch (se usando batch)
- [ ] Testei navegação após criar a lição
- [ ] Confirmei que a última lição não mostra botão "Próxima Aula"

---

## 📝 Notas Finais

- **Proteção em múltiplas camadas**: UI → Aplicação → Banco de dados
- **Auto-cálculo disponível**: Mas sempre prefira especificar explicitamente
- **Erros são informativos**: Leia a mensagem de erro para entender o problema
- **AdminBatchLessons é seu amigo**: Use sempre que possível para criar múltiplas lições

---

**Última atualização**: 2025-01-10
**Versão**: 1.0
