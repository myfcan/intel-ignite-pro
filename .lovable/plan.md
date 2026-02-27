

# Centralizar Gestao de Aulas: Suporte V8 no Gerenciador

## Problema Atual

O Gerenciador de Licoes (`AdminManageLessons.tsx`) foi construido exclusivamente para o modelo V7 (3 niveis: Trilha -> Jornada -> Aula). Ele tem 3 problemas concretos para V8:

1. **Modal "Mover" exige Jornada** (L204-216): bloqueia se a trilha nao tem cursos. V8 nao usa cursos.
2. **Botao "Assistir" hardcoded para V7** (L332): `navigate(/admin/v7/play/${lesson.id})` — V8 usa rota `/v8/${lesson.id}`.
3. **Hierarquia visual ignora V8**: Trilhas V8 mostram "Sem jornadas" com warning amarelo e aulas V8 sem `course_id` aparecem como "orfas" com alerta.

Alem disso, o **Criador V8** (`AdminV8Create.tsx`) tem campos "Trilha V8" e "Ordem" (L366-408) que sao redundantes — a organizacao deve ser feita no Gerenciador.

## Plano de Execucao

### 1. AdminV8Create.tsx — Remover campos desnecessarios

**Remover:**
- State `selectedTrailId` e `orderIndex` (L129, L131)
- Query `v8-trails-admin` (L144-157)
- Campos "Trilha V8" e "Ordem" do grid de metadados (L366-408)

**Manter:** Titulo + Tempo estimado (2 campos)

**Ajustar saves:** `handleGenerateAudio` e `handleSave` passam `trail_id: null`, `order_index: 0`

### 2. AdminManageLessons.tsx — Interface Trail

Adicionar `trail_type` a interface `Trail` (L52-56) e ao SELECT da query (L98).

### 3. AdminManageLessons.tsx — Hierarquia visual V8

Na construcao da hierarquia (L112-131), para trilhas com `trail_type === 'v8'`:
- Mostrar aulas diretamente sob a trilha (sem nivel de Jornada)
- Nao exibir warning "Sem jornadas" nem "Aulas sem jornada"
- Exibir badge "V8" na trilha
- Subtitulo mostra apenas "X aula(s)" sem mencionar jornadas

### 4. AdminManageLessons.tsx — Modal "Mover" com suporte V8

No modal de mover (L530-604):
- Se a trilha selecionada tem `trail_type === 'v8'`: esconder seletor de Jornada
- `handleMoveLesson`: se trail e V8, salvar com `course_id: null` e pular validacao de curso

### 5. AdminManageLessons.tsx — Botao "Assistir" inteligente

No `LessonRow` (L332):
- `model === 'v8'` -> navega para `/v8/${lesson.id}`
- Qualquer outro -> mantém `/admin/v7/play/${lesson.id}`

## Resultado Esperado

- Criador V8: formulario limpo (Titulo + Tempo + JSON). Aula nasce orfã.
- Gerenciador: trilhas V8 mostram aulas direto, sem falso alerta de "orfã".
- Modal Mover: permite mover aulas para trilhas V8 sem exigir Jornada.
- Botao Assistir: abre o player correto por modelo.

