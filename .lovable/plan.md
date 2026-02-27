
# Fix: Esconder campos de Jornada quando tipo V8 for selecionado

## Problema
O modal "Criar Nova Jornada" sempre mostra os campos "Nome da Jornada" e "Icone da Jornada", mesmo quando o tipo V8 e selecionado. No modelo V8, a hierarquia e Trilha -> Aula direta (sem Jornada/Curso), entao esses campos nao fazem sentido.

## Solucao

Modificar `src/pages/AdminManageLessons.tsx` para:

### 1. Detectar o tipo efetivo da trilha selecionada
- Quando "Trilha existente" estiver ativo, verificar o `trail_type` da trilha selecionada
- Quando "Criar trilha nova" estiver ativo, usar o valor do seletor `newTrailType`
- Derivar uma variavel `isV8` para controlar a visibilidade

### 2. Esconder campos de Jornada quando V8
- Os campos "Nome da Jornada" e "Icone (opcional)" ficam visiveis apenas quando `isV8 === false`
- O titulo do modal muda para "Criar Nova Trilha V8" quando V8, ou permanece "Criar Nova Jornada" para V7

### 3. Adaptar a logica de submit (`handleCreateCourse`)
- Quando V8: criar apenas a trilha (sem inserir na tabela `courses`), ja que V8 nao usa jornadas
- Quando V7: manter o comportamento atual (criar trilha + jornada)
- Remover a validacao de `newCourseTitle` quando V8

### 4. Adaptar o botao de submit
- V8: texto "Criar Trilha"
- V7: texto "Criar Jornada"
- Ajustar a condicao `disabled` para nao exigir `newCourseTitle` quando V8

## Arquivos alterados
- `src/pages/AdminManageLessons.tsx` (unico arquivo)
