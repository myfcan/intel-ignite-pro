

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

## Parte 2 -- Nova Trilha "IA para Profissionais"

Adicionar um **novo container** no Dashboard, abaixo de "Seu Caminho de Maestria", com:

- Gradiente em tons de **emerald/teal** para diferenciar visualmente
- Icone: `Briefcase` (lucide)
- Titulo: **"IA para Profissionais"**
- Botao "Ver todos" no header (mesmo estilo glassmorphism)

### 6 Cards de Desafios (hardcoded inicialmente)

Como esses desafios ainda nao existem no banco, serao renderizados como **cards estaticos** no Dashboard com status "Em breve" / locked:

| # | Titulo | Icone sugerido |
|---|--------|---------------|
| 1 | IA para Corretores | Building |
| 2 | IA para Advogados | Scale |
| 3 | Automacoes com Calendly | Calendar |
| 4 | IA para Medicos | Stethoscope |
| 5 | 10X mais Produtivo com IA | Zap |
| 6 | Criando Modelo de Negocios com IA | Lightbulb |

Cada card tera o mesmo visual dos TrailCards existentes, mas com estado **locked** (opacidade reduzida, icone de cadeado, sem navegacao).

---

## Detalhes Tecnicos

### Arquivos modificados

1. **`src/pages/Dashboard.tsx`**
   - Refatorar secoes V8 e V7 para buscar `courses` dentro de cada trail e renderizar courses como cards
   - Adicionar nova secao "IA para Profissionais" com gradiente emerald entre V8 e V7
   - Renderizar 6 cards estaticos locked com os desafios listados

2. **`src/components/lessons/v8/V8TrailCard.tsx`**
   - Ajustar props para aceitar dados de course (jornada) em vez de trail
   - Manter design visual identico

3. **`src/components/TrailCard.tsx`**
   - Garantir que aceita dados de course com status locked

4. **`src/pages/AllTrails.tsx`**
   - Ajustar para listar jornadas (courses) de uma trilha, nao trilhas

### Queries refatoradas no Dashboard

```text
1. trails (containers) -> SELECT * FROM trails WHERE is_active = true
2. courses (jornadas) -> SELECT * FROM courses WHERE trail_id IN (...) AND is_active = true
3. lessons (aulas)    -> SELECT id, course_id FROM lessons WHERE course_id IN (...) AND is_active = true
4. user_progress      -> SELECT lesson_id, status FROM user_progress WHERE user_id = ...
```

### Nova secao visual (entre V8 e V7)

O container seguira o mesmo padrao dos existentes:
- `rounded-3xl p-5 sm:p-7 md:p-8`
- Gradiente: `linear-gradient(135deg, #047857, #059669, #10B981)`
- Icone `Briefcase` em branco
- Carousel mobile + grid 3 colunas desktop
- Cards com estado locked (cadeado, opacity-40, cursor-not-allowed)
