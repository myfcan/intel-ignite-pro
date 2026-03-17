

# Plano: Atribuir Trilha a Aulas V10 Órfãs

## Problema Real
O `V10LessonRow` (linha 372-397) **não tem botão de mover/atribuir trilha**. Apenas exibe dados e um botão "Assistir". O `handleMoveLesson` (linha 227-273) opera apenas na tabela `lessons`, não em `v10_lessons`. Resultado: aulas V10 sem `trail_id` ficam permanentemente órfãs na UI admin.

## Solução

Adicionar ao `V10LessonRow` um botão "Mover" que abre um modal para atribuir `trail_id` e `order_in_trail` diretamente na tabela `v10_lessons`.

### Alterações em `AdminManageLessons.tsx`

**1. Estado para modal V10 move:**
- Novo state: `showV10MoveModal`, `v10MoveTarget` (lesson id), `v10TargetTrailId`, `v10TargetOrder`

**2. Handler `handleMoveV10Lesson`:**
- Faz `supabase.from('v10_lessons').update({ trail_id, order_in_trail }).eq('id', lessonId)`
- Filtra trilhas pelo tipo `v10` no seletor (mas permite qualquer trilha)
- Chama `loadData()` após sucesso

**3. Botão "Mover" no `V10LessonRow`:**
- Adiciona `<Button>` com ícone `FolderInput` ao lado de "Assistir"
- Ao clicar, seta `v10MoveTarget` e abre `showV10MoveModal`

**4. Modal V10 Move:**
- Seletor de trilha (todas as trilhas disponíveis)
- Input numérico para `order_in_trail`
- Botão confirmar → chama `handleMoveV10Lesson`

### Arquivo único alterado
`src/pages/AdminManageLessons.tsx`

### Sem migration SQL
A tabela `v10_lessons` já possui `trail_id` e `order_in_trail`. Apenas update via client.

