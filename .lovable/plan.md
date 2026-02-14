

# Nova Estrutura: Trilha -> Cursos/Jornadas -> Aulas

## O que muda

Hoje a hierarquia e flat: **Trilha -> Aulas** (lessons.trail_id aponta direto para trails).

A nova hierarquia sera: **Trilha -> Cursos -> Aulas**.

Exemplo concreto:
```text
Trilha: Renda Extra com IA
  |
  +-- Curso 1: Marketing Digital com IA
  |     +-- Aula 1
  |     +-- Aula 2
  |     +-- Aula 3
  |
  +-- Curso 2: Criando Apps com IA
  |     +-- Aula 1
  |     +-- Aula 2
  |
  +-- Curso 3: Criando Negocios com IA
        +-- Aula 1
        +-- Aula 2
```

---

## 1. Criar tabela `courses` no banco

Nova tabela intermediaria:

| Coluna | Tipo | Descricao |
|---|---|---|
| id | uuid (PK) | Identificador unico |
| trail_id | uuid (FK -> trails) | A qual trilha pertence |
| title | varchar | Nome do curso/jornada |
| description | text | Subtitulo persuasivo |
| icon | varchar | Icone Lucide |
| order_index | integer | Ordem dentro da trilha |
| is_active | boolean | Visibilidade |
| created_at | timestamptz | Data de criacao |

RLS: leitura publica para cursos ativos, escrita apenas para admins.

## 2. Adicionar `course_id` na tabela `lessons`

- Nova coluna `course_id` (uuid, nullable, FK -> courses)
- A coluna `trail_id` existente sera mantida por compatibilidade (nao quebrar o pipeline)
- Aulas que tiverem `course_id` preenchido pertencem a um curso; as demais continuam funcionando como hoje

## 3. Migrar aulas existentes

- Criar cursos iniciais para cada trilha (1 curso por trilha por enquanto, com as aulas ja existentes)
- Atualizar `course_id` das aulas existentes para apontar ao curso correspondente

## 4. Nova pagina `TrailDetail` (refatorada)

Hoje: `TrailDetail` lista aulas diretamente.

Depois: `TrailDetail` lista **cursos/jornadas** como cards (similar aos TrailCards). Cada card mostra:
- Titulo do curso
- Descricao
- Numero de aulas
- Progresso (aulas concluidas / total)

Ao clicar em um curso, navega para uma nova pagina de detalhe do curso.

## 5. Nova pagina `CourseDetail`

Rota: `/course/:id`

Mostra:
- Header com titulo e progresso do curso
- Lista de aulas (mesma UI que o TrailDetail atual)
- Logica de desbloqueio sequencial (igual a de hoje)

## 6. Atualizar Dashboard

- O card de trilha no dashboard continua igual (1 card por trilha)
- O progresso da trilha agora sera calculado a partir de todas as aulas de todos os cursos daquela trilha
- A query de progresso no Dashboard precisa considerar a nova hierarquia

## 7. Atualizar navegacao de "proxima aula"

Em `Lesson.tsx`, ao completar uma aula, a logica de "proxima aula" precisa considerar:
- Proxima aula dentro do mesmo curso
- Se acabou o curso, voltar para a trilha (nao para o proximo curso automaticamente)

---

## Detalhes tecnicos

### Arquivos criados
1. **Migracao SQL** -- criar tabela `courses`, adicionar `course_id` em `lessons`, criar cursos iniciais
2. **`src/pages/CourseDetail.tsx`** -- nova pagina para listar aulas de um curso
3. **`src/components/CourseCard.tsx`** -- card visual para curso/jornada (similar ao TrailCard mas mais compacto)

### Arquivos modificados
1. **`src/pages/TrailDetail.tsx`** -- refatorar para listar cursos em vez de aulas
2. **`src/pages/Dashboard.tsx`** -- ajustar calculo de progresso por trilha
3. **`src/pages/Lesson.tsx`** -- ajustar navegacao "proxima aula"
4. **`src/App.tsx`** -- adicionar rota `/course/:id`

### Impacto no pipeline de criacao de aulas
- O pipeline existente usa `trail_id` para associar aulas. Esse campo continua funcionando.
- Futuramente, o pipeline pode receber `course_id` para associar aulas a cursos especificos.
- Nenhuma mudanca obrigatoria no pipeline nesta fase.

### Sequencia de execucao
1. Migracao SQL (tabela + dados iniciais)
2. CourseCard component
3. CourseDetail page + rota
4. Refatorar TrailDetail
5. Ajustar Dashboard (progresso)
6. Ajustar Lesson (navegacao)

