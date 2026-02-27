

# Reestruturar Hierarquia + Nova Trilha "IA para Profissionais"

## Parte 1 -- Unificar Arquitetura (Trilha -> Jornada -> Aula)

A hierarquia passa a ser a mesma para TODOS os modelos (V7 e V8):

```text
Trilha (container visual no Dashboard)
  └── Jornada (cards clicaveis = tabela "courses")
        └── Aulas/Licoes (tabela "lessons")
```

### O que muda no codigo

**V8 deixa de ser 2 niveis e passa a 3 niveis como o V7.** Isso significa:

1. **Dashboard (`src/pages/Dashboard.tsx`)**: Os cards dentro de cada container de trilha passam a representar **Jornadas** (courses), nao trilhas. Cada card mostra titulo da jornada, icone, progresso (aulas concluidas / total de aulas da jornada). Ao clicar, navega para a pagina de detalhe da jornada com suas aulas.

2. **Queries no Dashboard**: Em vez de buscar `trails` e renderizar cada trail como card, o fluxo sera:
   - Buscar trails (para obter o nome do container)
   - Buscar courses de cada trail (para renderizar como cards)
   - Buscar lessons de cada course (para calcular progresso)

3. **V8TrailCard**: Sera renomeado/adaptado para representar uma **Jornada** (course), nao uma trilha. O componente continua visualmente o mesmo, mas recebe dados de `courses` em vez de `trails`.

4. **Pagina de detalhe V8** (`/v8-trail/:id`): Sera ajustada para mostrar aulas de uma jornada (course), nao de uma trilha inteira.

5. **Admin**: O modal de criacao inline ja suporta courses para V7. Precisamos garantir que V8 tambem passe a usar courses.

### Banco de dados

Nenhuma mudanca de schema necessaria. A tabela `courses` ja existe com `trail_id`, `title`, `description`, `icon`, `order_index`. A tabela `lessons` ja tem `course_id`. Basta popular os dados e ajustar as queries.

---

## Parte 2 -- Nova Trilha "IA para Profissionais" ✅ IMPLEMENTADO

Container emerald adicionado ao Dashboard entre V8 e V7 com:

- Gradiente: `linear-gradient(135deg, #047857, #059669, #10B981)`
- Icone: `Briefcase` em emerald-200
- Titulo: **"IA para Profissionais"**
- Botao "Ver todos ›" em glassmorphism
- Carousel mobile (snap) + grid 3 colunas desktop (paginado)
- 6 cards hardcoded em estado **locked**:

| # | Titulo | Icone |
|---|--------|-------|
| 1 | IA para Corretores | Building2 |
| 2 | IA para Advogados | Scale |
| 3 | Automações com Calendly | Calendar |
| 4 | IA para Médicos | Stethoscope |
| 5 | 10X mais Produtivo com IA | Zap |
| 6 | Criando Modelo de Negócios com IA | Lightbulb |

---

## Parte 3 -- Pendente: Refatorar Queries para Courses

Para completar a unificacao, falta:

1. **Dashboard**: Refatorar V8 e V7 para buscar `courses` de cada trail e renderizar como cards (com fallback se nao houver courses)
2. **Rotas**: Criar rota `/course/:id` para detalhe da jornada
3. **AllTrails**: Ajustar para listar courses em vez de trails
4. **Popular DB**: Criar courses no banco para as trilhas V8 existentes

### Queries alvo

```text
1. trails (containers) -> SELECT * FROM trails WHERE is_active = true
2. courses (jornadas) -> SELECT * FROM courses WHERE trail_id IN (...) AND is_active = true
3. lessons (aulas)    -> SELECT id, course_id FROM lessons WHERE course_id IN (...) AND is_active = true
4. user_progress      -> SELECT lesson_id, status FROM user_progress WHERE user_id = ...
```
