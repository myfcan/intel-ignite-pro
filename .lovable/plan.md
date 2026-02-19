

## Problema

O botao "Assistir" na pagina de gerenciamento de licoes navega para `/admin/v7/preview/{id}`, que carrega o **AdminV7Preview.tsx** -- um player LEGADO que usa o antigo `V7CinematicPlayer` (componente de `@/components/lessons/v7/V7CinematicPlayer`). Esse player nao suporta `image-sequence`, anchor text triggers, nem o formato v7-vv. Por isso a aula nao roda.

O player correto (V7PhasePlayer) ja esta disponivel na rota `/admin/v7/play/{id}`.

## Correcao

Alterar **uma unica linha** em `AdminManageLessons.tsx`:

**Antes (L332):**
```
navigate(`/admin/v7/preview/${lesson.id}`)
```

**Depois:**
```
navigate(`/admin/v7/play/${lesson.id}`)
```

Isso faz o botao "Assistir" abrir o player V7 PhasePlayer real (que suporta image-sequence, anchor text, quiz, etc.) em vez do player legado.

## Detalhes Tecnicos

- Arquivo: `src/pages/AdminManageLessons.tsx`, linha 332
- A rota `/admin/v7/play/:lessonId` ja existe em `App.tsx` (L210) e carrega o `V7CinematicPlayer` page (que internamente usa `V7PhasePlayer`)
- A rota esta protegida por `AdminRoute`, entao a seguranca se mantem
- Nenhum outro arquivo precisa ser alterado
- O `AdminV7Preview.tsx` continua existindo para uso legado, mas nao sera mais o destino do botao "Assistir"

