
Objetivo: corrigir o fluxo de navegação V8 para que, ao clicar em uma **Jornada** no Dashboard, abra a página da jornada (não a página da trilha com todas as jornadas).

1) Causa raiz confirmada
- O card usado no Dashboard é `V8TrailCard`, e ele sempre navega para `/v8-trail/:id`.
- No Dashboard, esse card recebe dados de jornada (`course`), mas está passando `trail_id`, então o clique leva para a trilha.
- Resultado: usuário clica em “Jornada 2” e cai na tela da trilha com todas as jornadas.

2) Correção de navegação (principal)
- Arquivo: `src/components/lessons/v8/V8TrailCard.tsx`
  - Tornar o card reutilizável com destino explícito:
    - modo `trail` → `/v8-trail/:id`
    - modo `journey` (course) → `/course/:id`
  - Manter padrão compatível para não quebrar telas existentes.

- Arquivo: `src/pages/Dashboard.tsx`
  - Nos cards da seção V8 (mobile e desktop), passar o ID da jornada (`course.id`) e destino `journey`.
  - Assim, “Jornada 2” abrirá `/course/<id-da-jornada-2>`.

- Arquivo: `src/pages/AllTrails.tsx`
  - Manter comportamento de trilha (destino `trail`) para não alterar a navegação dessa página.

3) Ajuste de UI da página de Jornada (pedido explícito)
- Arquivo: `src/pages/CourseDetail.tsx`
  - Já lista lições por `course_id` (isso está correto).
  - Incluir contexto visual no topo para V8:
    - “Trilha: Caminho da Maestria”
    - “Jornada: <nome da jornada>”
  - Para isso, ampliar a query da trilha (hoje busca só `trail_type`) para trazer também `title`.

4) Validações após implementação
- Fluxo 1: Dashboard → clicar Jornada 2 → abre `/course/:id` da Jornada 2.
- Fluxo 2: página aberta exibe “Trilha + Jornada” e abaixo apenas lições daquela jornada.
- Fluxo 3: clicar jornada na tela `/v8-trail/:trailId` continua abrindo a jornada correta.
- Fluxo 4: AllTrails V8 continua abrindo a trilha (sem regressão).

5) Escopo técnico
- Sem mudanças de banco.
- Sem alterações de regras de acesso.
- Apenas correção de roteamento + apresentação de contexto na UI.
