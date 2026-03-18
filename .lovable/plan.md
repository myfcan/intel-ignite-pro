

# Plano: Renomear e Deletar Jornadas no Admin Gerenciar Lições

## O que será feito

Adicionar dois botões de ação em cada linha de Jornada (course) na hierarquia do AdminManageLessons:
1. **Renomear** — abre um dialog inline para editar o título
2. **Deletar** — abre um dialog de confirmação com verificação de jornada vazia

## Mudanças

### Arquivo: `src/pages/AdminManageLessons.tsx`

1. **Novos estados** para os modais de renomear e deletar jornada:
   - `renameCourseId`, `renameCourseTitle`, `showRenameCourseModal`
   - `deleteCourseId`, `showDeleteCourseModal`, `deletingCourse`

2. **Função `handleRenameCourse`**: chama `supabase.from('courses').update({ title }).eq('id', id)` e recarrega dados.

3. **Função `handleDeleteCourse`**: verifica se a jornada está vazia (sem lições V7/V8/V10 vinculadas). Se vazia, deleta via `supabase.from('courses').delete().eq('id', id)`. Se não vazia, mostra aviso impedindo exclusão.

4. **UI — Linha da Jornada** (linhas 674-681): Adicionar dois botões (ícones `Pencil` e `Trash2`) ao lado do badge de contagem de aulas, com `onClick` que abre os respectivos modais. Os botões usam `e.stopPropagation()` para não interferir no Collapsible.

5. **Dois novos Dialogs** no final do JSX:
   - Dialog de Renomear: Input com título atual, botão Salvar
   - Dialog de Deletar: Confirmação com aviso, botão Deletar (desabilitado se jornada tiver aulas)

6. **Import adicional**: `Pencil` do lucide-react

### Segurança
- Operações usam o client autenticado (RLS já garante `has_role(auth.uid(), 'admin')` na tabela `courses`)
- Deletar só é permitido em jornadas vazias (sem lições vinculadas)

