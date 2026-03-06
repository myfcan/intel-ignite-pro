

## Plano: Sistema de Avaliações de Aulas

### Visão Geral

Criar um sistema completo de ratings/avaliações ao final de cada aula V8, com armazenamento no banco, painel de gestão admin, e preparação para uso estratégico em funis de conversão.

### 1. Tabela `lesson_ratings` no banco

```sql
CREATE TABLE public.lesson_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;
```

RLS policies:
- Users insert/view own ratings
- Admins manage all
- Public SELECT for ratings (para exibir em funis de conversão sem autenticação)

### 2. Componente `V8LessonRating.tsx`

Design baseado no screenshot anexo, adaptado ao padrão V8 (sem emojis, Lucide icons):
- Ícone hexagonal com estrela (Star icon do Lucide, estilizado como badge indigo)
- Titulo: "Sua opinião importa!"
- Subtitulo: "Como você avaliaria esta lição?"
- 5 estrelas clicáveis (Star icon Lucide, preenchidas/vazias)
- Labels: "Não é a minha praia" / "Adorei!"
- **Campo de texto** (Textarea) para comentário opcional
- Botão "Enviar feedback"
- Renderizado **entre** o completion screen e os botões de ação (Próxima Aula / Voltar)

### 3. Integração no fluxo V8

No `V8CompletionScreen.tsx`:
- Após as stats de gamificação (XP, Moedas, Dias)
- Antes dos botões de ação
- O rating é salvo no banco via upsert (user_id + lesson_id unique)
- Após enviar, o card muda para estado "Obrigado" e revela os botões

### 4. Página Admin `AdminLessonRatings.tsx`

Card no painel principal (`Admin.tsx`) + página dedicada:
- KPIs: total de avaliações, média geral, distribuição por estrelas
- Lista de avaliações recentes com: aula, usuário, rating, comentário, data
- Filtros: por aula, por rating, por data
- Rota: `/admin/ratings`

### 5. Arquivos afetados

| Arquivo | Ação |
|---------|------|
| **Migration SQL** | Criar tabela `lesson_ratings` + RLS |
| `src/components/lessons/v8/V8LessonRating.tsx` | Novo componente de rating |
| `src/components/lessons/v8/V8CompletionScreen.tsx` | Integrar rating antes dos botões |
| `src/pages/AdminLessonRatings.tsx` | Nova página admin |
| `src/pages/Admin.tsx` | Adicionar card "Avaliações" |
| `src/App.tsx` | Adicionar rota `/admin/ratings` |

