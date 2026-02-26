
# V8 "Read & Listen" Premium — Plano Mestre Completo

**Documento Vivo — Status atualizado a cada fase concluida**
**Arquivo: `docs/V8-MASTER-PLAN.md`**

---

## 1. VISAO GERAL

V8 e um formato de aula "Read & Listen" Premium com arquitetura simplificada:
- Audio gerado POR SECAO (15-30s cada), sem `word_timestamps`, sem anchors, sem image-sequence triggers
- Hierarquia de 2 niveis (Trail -> Lesson), eliminando a camada de Course
- Coexiste 100% com V7 sem alterar NENHUM arquivo, tabela ou funcao existente

---

## 2. CONTRATO DE IMPLEMENTACAO DE QUALIDADE (CIQ)

### 2.1 Os 3 Pilares

| Pilar | Pergunta | Criterio |
|---|---|---|
| Objetivo | O codigo faz o que a fase exige? | Funcionalidade verificavel no preview |
| Qualidade Tecnica | Build passa? TypeScript strict? Logica correta? | Zero erros, zero `any` nao-justificado |
| Escalabilidade | Modular? Extensivel? | Componentes desacoplados, tipos extensiveis |

### 2.2 Processo

```text
IMPLEMENTAR FASE N
       |
  AUDITAR (relatorio forensic)
       |
  APRESENTAR RELATORIO
       |
  APROVADO? --[NAO]--> CORRIGIR
       |
      [SIM]
       |
  FASE N+1
```

### 2.3 Template de Auditoria

```text
## Auditoria CIQ — Fase N: [Nome]

### Pilar 1 — Objetivo
- [ ] Funcionalidade entregue (evidencia: screenshot/log)?
- [ ] Cenarios cobertos?

### Pilar 2 — Qualidade Tecnica
- [ ] Build sem erros?
- [ ] TypeScript strict?
- [ ] Try/catch em todos os fetches?
- [ ] Estados loading/error/empty?

### Pilar 3 — Escalabilidade
- [ ] Componentes desacoplados?
- [ ] Tipos extensiveis?

### Veredito: APROVADO / REPROVADO
```

---

## 3. SEPARACAO DE DISCIPLINAS

### 3.1 Web Design

**Paleta Premium**:

| Token | Hex | Uso |
|---|---|---|
| `slate-950` | `#020617` | Fundo principal |
| `slate-900` | `#0f172a` | Cards/secoes |
| `slate-800` | `#1e293b` | Elementos elevados |
| `indigo-500` | `hsl(239 84% 67%)` | Primario, progress |
| `violet-500` | `hsl(258 90% 66%)` | Gradientes, badges |
| `emerald-500` | `hsl(158 64% 52%)` | Sucesso, streaks |
| `white/5` | `rgba(255,255,255,0.05)` | Glass background |
| `white/10` | `rgba(255,255,255,0.10)` | Glass border |
| `white/20` | `rgba(255,255,255,0.20)` | Glass hover |
| `slate-300` | `#CBD5E1` | Corpo texto |
| `slate-400` | `#94A3B8` | Labels secundarios |

**Tipografia**:

| Elemento | Tamanho | Peso | Line-height |
|---|---|---|---|
| Titulo secao | `28px` | `700` | `1.2` |
| Corpo markdown | `17px` | `400` | `1.75` |
| Labels/badges | `11px` | `600` | `normal` |

**Glass-morphism**: `bg-white/5 border border-white/10 backdrop-blur-xl`
**Animacoes**: Framer Motion (`^12.23.24` instalado) — fade+slide, scale, width transitions

### 3.2 Frontend

- TypeScript strict, zero `any` nao-justificado
- Lazy loading (padrao do `App.tsx` linhas 22-90)
- Try/catch em TODOS os fetches
- Estados `loading` / `error` / `empty`

### 3.3 Backend

- Migracoes SQL com DEFAULT para nao quebrar V7
- Edge functions com validacao de entrada
- Auth via REST (padrao verificado em `v7-vv/index.ts`)
- CORS: `Access-Control-Allow-Origin: *`
- Secret `ELEVENLABS_API_KEY`: JA CONFIGURADO

---

## 4. HIERARQUIA HIBRIDA

### 4.1 Tabela `trails` — Schema REAL (7 colunas)

```text
id            uuid          DEFAULT uuid_generate_v4()   NOT NULL
title         varchar                                     NOT NULL
description   text                                        NULLABLE
order_index   integer                                     NOT NULL
icon          varchar                                     NULLABLE
is_active     boolean       DEFAULT true                  NULLABLE
created_at    timestamptz   DEFAULT now()                 NULLABLE
```

**NAO tem `trail_type`** — precisa migracao.

RLS policies verificadas:
- `Anyone can view active trails`: SELECT WHERE `is_active = true` (public)
- `trails_public_read`: SELECT WHERE `is_active = true` (public)
- `admins_manage_all_trails`: ALL WHERE `has_role(auth.uid(), 'admin')` (authenticated)

### 4.2 Tabela `lessons` — Schema REAL (23 colunas)

```text
id                  uuid          DEFAULT uuid_generate_v4()   NOT NULL
trail_id            uuid                                        NULLABLE  <-- V8 usa direto
title               varchar                                     NOT NULL
description         text                                        NULLABLE
order_index         integer                                     NOT NULL
estimated_time      integer                                     NULLABLE
difficulty_level    USER-DEFINED                                NULLABLE
is_active           boolean       DEFAULT false                 NULLABLE
created_at          timestamptz   DEFAULT now()                 NULLABLE
lesson_type         varchar       DEFAULT 'fill-blanks'         NULLABLE
content             jsonb         DEFAULT '{}'                  NOT NULL   <-- V8LessonData
passing_score       integer       DEFAULT 70                    NULLABLE
audio_url           text                                        NULLABLE   <-- V8: NULL
word_timestamps     jsonb                                       NULLABLE   <-- V8: NULL
exercises           jsonb         DEFAULT '[]'                  NULLABLE   <-- ExerciseConfig[]
exercises_version   integer       DEFAULT 1                     NULLABLE
status              text          DEFAULT 'rascunho'            NULLABLE
progresso_criacao   integer       DEFAULT 0                     NULLABLE
fase_criacao        text                                        NULLABLE
erro_criacao        text                                        NULLABLE
audio_urls          ARRAY                                       NULLABLE
model               text                                        NULLABLE   <-- V8: 'v8'
course_id           uuid                                        NULLABLE   <-- V8: NULL
```

### 4.3 Diagrama

```text
V7 (INALTERADO):
  Dashboard -> TrailCard -> /trail/:id -> CourseDetail -> /v7/:id

V8 (NOVO):
  Dashboard -> V8TrailCard -> /v8-trail/:trailId -> V8LessonCard -> /v8/:lessonId
```

---

## 5. ESTRUTURA DE DADOS

### 5.1 Arquivo: `src/types/v8Lesson.ts`

```typescript
export interface V8Section {
  id: string;
  title: string;
  content: string;              // Markdown
  imageUrl?: string;
  audioUrl: string;             // Audio individual (15-30s)
  audioDurationSeconds?: number;
}

export interface V8InlineQuiz {
  id: string;
  afterSectionIndex: number;    // Aparece apos sections[N]
  question: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  reinforcement?: string;
  audioUrl?: string;
  reinforcementAudioUrl?: string;
}

export interface V8LessonData {
  contentVersion: 'v8';
  title: string;
  description?: string;
  sections: V8Section[];
  inlineQuizzes: V8InlineQuiz[];
  exercises: ExerciseConfig[];  // Reutiliza tipo existente
}

export interface V8PlayerState {
  currentIndex: number;
  mode: 'read' | 'listen';
  isPlaying: boolean;
  playbackSpeed: number;        // 1 | 1.25 | 1.5 | 2
  phase: 'mode-select' | 'content' | 'exercises' | 'completion';
  scores: number[];
}
```

### 5.2 ExerciseConfig — Codigo REAL (`src/types/guidedLesson.ts` linhas 108-116)

```typescript
export interface ExerciseConfig {
  id: string;
  type: 'drag-drop' | 'complete-sentence' | 'scenario-selection'
      | 'fill-in-blanks' | 'true-false' | 'platform-match'
      | 'data-collection' | 'multiple-choice' | 'flipcard-quiz'
      | 'timed-quiz';
  title: string;
  instruction: string;
  data: any;
  passingScore?: number;
  maxAttempts?: number;
}
```

---

## 6. BANCO DE DADOS — DETALHAMENTO

### 6.1 Migracao

```sql
ALTER TABLE trails ADD COLUMN trail_type TEXT DEFAULT 'v7';
```

Impacto nas RLS: NENHUM. Policies operam sobre `is_active` e `has_role()`.

### 6.2 Como V8 usa `lessons`

| Coluna | Valor V8 | Motivo |
|---|---|---|
| `model` | `'v8'` | Identifica no switch do frontend |
| `trail_id` | UUID da trail V8 | Link direto |
| `course_id` | `NULL` | Sem camada curso |
| `content` | `V8LessonData` JSONB | Secoes + quizzes |
| `exercises` | `ExerciseConfig[]` JSONB | Exercicios finais |
| `audio_url` | `NULL` | Audio por secao |
| `word_timestamps` | `NULL` | Nao usa |

### 6.3 Tabelas reutilizadas SEM alteracao

| Tabela | Colunas chave | Uso V8 |
|---|---|---|
| `user_progress` | `user_id, lesson_id, status, score, completed_at` | Progresso |
| `user_gamification_events` | `user_id, event_type, xp_delta, coins_delta` | XP/moedas |
| `user_streaks` | `user_id, current_streak, best_streak, last_active_date` | Streak |
| `user_achievements` | `user_id, achievement_type, points_earned` | Conquistas |
| `user_daily_missions` | `user_id, mission_id, progress_value, completed` | Missoes |
| `users` | `power_score, coins, patent_level, total_lessons_completed` | Stats |

### 6.4 Funcao `register_gamification_event` — PL/pgSQL REAL (149 linhas)

Eventos e recompensas verificados no codigo SQL:
- `lesson_completed`: +40 XP, +10 coins
- `journey_completed`: +120 XP, +25 coins
- `quiz_answered` (>= 80%): +50 XP, +5 coins
- `quiz_answered` (< 80%): +20 XP, +0 coins

Patentes (thresholds reais do SQL):
- Level 0: "Sem patente" (< 200)
- Level 1: "Operador Basico de I.A." (200-599)
- Level 2: "Executor de Sistemas" (600-1199)
- Level 3: "Estrategista em I.A." (>= 1200)

Idempotencia via `event_reference_id` (verificado no SQL).

### 6.5 Storage

Bucket `lesson-audios`: EXISTE, publico.
Path V8: `v8/{lessonId}/section-{index}.mp3`

---

## 7. DECISAO ARQUITETURAL: SEM ANCHORTEXT NO V8

O V7 usa `useAnchorText` + `word_timestamps` para detectar keywords no audio unico e pausar para interacoes. V8 NAO precisa deste sistema porque:

1. Audio e segmentado por secao (15-30s) — cada secao tem seu proprio arquivo MP3
2. O trigger para quizzes usa `afterSectionIndex` — quando `audio.onEnded` dispara, o quiz aparece
3. Para interacoes "mid-content", basta quebrar a secao em duas (Secao 2a -> Quiz -> Secao 2b)

Isso elimina toda a complexidade de keyword matching, timestamp resolution e anchor contracts.

---

## 8. TELAS — DETALHAMENTO COMPLETO

### 8.1 Dashboard — V8TrailCard

```text
+---------------------------------------------------------------+
|  [HORIZONTAL — Fundo slate-900]                                |
|  +--------+  TITULO DA TRILHA V8          [Read & Listen]      |
|  | ICONE  |  Descricao curta...                                |
|  | (glass)|  3 aulas • Premium                                 |
|  +--------+                                                    |
|  [==========----] 60%              [Continuar ->]              |
+---------------------------------------------------------------+
  Border: 1px solid rgba(99,102,241,0.2)
  Shadow: 0 0 20px rgba(99,102,241,0.15)
  Hover: translateY(-4px)
```

Integracao: `Dashboard.tsx` (771 linhas)
- Linha 169-173: query `trails` — adicionar filtro por `trail_type`
- Linha 567-588: grid de `TrailCard` — adicionar secao separada "Trilhas Premium" com `V8TrailCard`

### 8.2 V8TrailDetail (`/v8-trail/:trailId`)

```text
+----------------------------------------------------------------+
|  [<- Voltar]                                                    |
|  +------------------------------------------------------------+|
|  | HEADER (gradiente indigo-600 -> violet-600)                 ||
|  |  [Icone]  TITULO DA TRILHA V8                               ||
|  |           3 aulas • Read & Listen                           ||
|  |  [====================] 66%                                 ||
|  +------------------------------------------------------------+|
|                                                                  |
|  +------------------------------------------------------------+|
|  | Aula 1: Titulo         [Concluida]     10 min               ||
|  | [==========] 100%                                           ||
|  +------------------------------------------------------------+|
|  | Aula 2: Titulo         [Cursando]      12 min               ||
|  | [====------] 40%                                            ||
|  +------------------------------------------------------------+|
|  | Aula 3: Titulo         [Bloqueada]     8 min                ||
|  +------------------------------------------------------------+|
+----------------------------------------------------------------+
```

Logica de desbloqueio (igual `CourseDetail.tsx` linhas 104-109):
- Aula 0: sempre desbloqueada
- Aula N: desbloqueada se N-1 completa OU usuario e admin

### 8.3 V8Lesson (`/v8/:lessonId`) — Player Principal

**FASE 1: MODE SELECT**
```text
+-------------------------------+
|     Como voce quer            |
|     aprender?                 |
|                               |
| +----------+  +----------+   |
| |  LER     |  |  OUVIR   |   |
| | Leia no  |  | Ouca a   |   |
| | seu ritmo|  | narracao  |   |
| +----------+  +----------+   |
+-------------------------------+
  Glass cards: bg-white/5
  Hover: bg-white/10
```

**FASE 2: CONTENT (secao por secao)**
```text
+-------------------------------+
| [HEADER FIXO]                 |
| [<-] Titulo    2/5  [=====]  |
|-------------------------------|
|  SECAO 2: Titulo (28px bold)  |
|                               |
|  Markdown (17px, slate-300,   |
|  line-height 1.75)            |
|                               |
|  [Imagem rounded-2xl]         |
|                               |
|       [Continuar ->]          |
|-------------------------------|
| [V8AudioPlayer — STICKY]     |
| [<<10] [PLAY] [10>>] [1.5x] |
| [=====---------] 0:23/0:45  |
+-------------------------------+
```

**FASE 2.5: QUIZ INLINE**
```text
+-------------------------------+
|  Quiz Rapido                  |
|  "Qual e a funcao do..."     |
|                               |
|  ( ) Opcao A                  |
|  (*) Opcao B <- selecionada  |
|  ( ) Opcao C                  |
|  ( ) Opcao D                  |
|                               |
|  [Confirmar]                  |
|  [Card de reforco se errou]  |
+-------------------------------+
```

**FASE 3: EXERCISES**
- Renderiza `ExercisesSection.tsx` (307 linhas, codigo real)
- Props: `exercises: ExerciseConfig[]`, `onComplete`, `onScoreUpdate`
- 10 tipos + 2 games

**FASE 4: COMPLETION**
```text
+-------------------------------+
|     Aula Concluida!           |
|     +XP [animacao]            |
|     +Coins [animacao]         |
|     Streak: 5 dias            |
|     Score: 80%                |
|     [Proxima Aula ->]         |
|     [Voltar a Trilha]         |
+-------------------------------+
  registerGamificationEvent('lesson_completed')
  updateMissionProgress('aulas', 1)
  canvas-confetti se score >= 70%
```

### 8.4 AdminV8Create (`/admin/v8/create`)

```text
+----------------------------------------------------------------+
| ADMIN: Criar Aula V8                                           |
| Trilha V8: [Dropdown — trail_type='v8']                        |
| Titulo:    [___________________________]                       |
|                                                                  |
| JSON (V8LessonData):                                           |
| +------------------------------------------------------------+ |
| | { "contentVersion": "v8", "sections": [...] }              | |
| +------------------------------------------------------------+ |
|                                                                  |
| [Validar JSON]  Status: 5 secoes, 2 quizzes, 3 exercicios     |
| [Gerar Audios]  Status: Gerando 5/7 audios...                 |
|                                                                  |
| Preview de audios:                                              |
| Secao 1: [PLAY 0:23]                                           |
| Secao 2: [PLAY 0:18]                                           |
|                                                                  |
| [Salvar Rascunho]  [Salvar e Ativar]                           |
+----------------------------------------------------------------+
```

---

## 9. EXERCICIOS E GAMING — INVENTARIO FORENSE COMPLETO

### 9.1 Orquestrador: ExercisesSection.tsx (307 linhas)

Codigo REAL (linhas 31-37):
```typescript
interface ExercisesSectionProps {
  exercises: ExerciseConfig[];
  onComplete: (data?: { allExercisesCompleted?: boolean }) => void;
  onScoreUpdate?: (scores: number[]) => void;
  onBack?: () => void;
  exerciseMetadata?: Array<{ title: string; type: string }>;
}
```

Logica de score (linhas 55-72 reais):
- Score >= 70%: confetti + `updateMissionProgress('exercicios', 1)`
- Toast: "Exercicio completo! Score: X%"
- Avanca automaticamente apos 1.2s
- Ultimo exercicio: chama `onComplete({ allExercisesCompleted: true })` apos 2s

### 9.2 Os 10 Exercicios + 2 Games

| # | Tipo | Componente | Schema (`exerciseSchemas.ts`) |
|---|---|---|---|
| 1 | `drag-drop` | `DragDropLesson` | `DragDropExerciseData` — items[] + categories[] |
| 2 | `complete-sentence` | `CompleteSentenceExercise` | `CompleteSentenceExerciseData` — sentences[] com options[] opcionais |
| 3 | `scenario-selection` | `ScenarioSelectionExercise` | `ScenarioSelectionExerciseData` — scenarios[] (2 formatos) |
| 4 | `fill-in-blanks` | `FillInBlanksExercise` | `FillInBlanksExerciseData` — sentences[] + feedback{} |
| 5 | `true-false` | `TrueFalseExercise` | `TrueFalseExerciseData` — statements[] + feedback{} |
| 6 | `platform-match` | `PlatformMatchExercise` | `PlatformMatchExerciseData` — scenarios[] + platforms[] |
| 7 | `data-collection` | `DataCollectionExercise` | `DataCollectionExerciseData` — scenario (singular) + dataPoints[] |
| 8 | `multiple-choice` | `MultipleChoiceExercise` | `MultipleChoiceExerciseData` — question + options[] + correctAnswer |
| 9 | `flipcard-quiz` | `FlipCardQuizExercise` | `FlipCardQuizExerciseData` — cards[] (front/back/options) |
| 10 | `timed-quiz` | `TimedQuizExercise` | `TimedQuizExerciseData` — questions[] + timePerQuestion + bonusPerSecondLeft |

Schemas tipados em `src/types/exerciseSchemas.ts` (362 linhas). Union discriminada `ExerciseConfigTyped` (linhas 272-362).

### 9.3 Sons: useV7SoundEffects (478 linhas, Web Audio API)

22 tipos (codigo REAL linhas 7-29):
`transition-whoosh`, `transition-dramatic`, `click-soft`, `click-confirm`, `success`, `error`, `reveal`, `count-up`, `ambient-low`, `dramatic-hit`, `quiz-correct`, `quiz-wrong`, `progress-tick`, `completion`, `letter-reveal`, `snap-success`, `snap-error`, `streak-bonus`, `level-up`, `combo-hit`, `timer-tick`, `timer-buzzer`

V8 reutiliza: `useV7SoundEffects(0.6, true)`.

---

## 10. GAMIFICACAO

### 10.1 Servico: `src/services/gamification.ts` (40 linhas)

```typescript
export async function registerGamificationEvent(
  eventType: GamificationEventType,
  eventReferenceId?: string,
  payload: Record<string, any> = {}
): Promise<GamificationResult | null>
```

### 10.2 Hook: `src/hooks/useUserGamification.ts` (169 linhas)

Retorna: `{ stats, isLoading, refresh, showPatentCelebration, sessionReady }`
Stats: `powerScore, coins, patentLevel, patentName, streakDays, lessonsCompleted`

### 10.3 Missoes: `src/lib/updateMissionProgress.ts` (48 linhas)

```typescript
export async function updateMissionProgress(
  actionType: 'aulas' | 'exercicios',
  increment: number = 1
): Promise<{ success: boolean; error?: string }>
```

---

## 11. AUDIO — ELEVENLABS

| Parametro | Valor | Fonte no codigo |
|---|---|---|
| Modelo | `eleven_v3` | `v7-vv/index.ts` linha 3245 |
| Voz | `Xb7hH8MSUJpSbSDYk0k2` (Alice Brasil) | `v7-vv/index.ts` linha 6872 |
| Stability | `0.5` | `v7-vv/index.ts` linha 3247 |
| Similarity boost | `0.75` | `v7-vv/index.ts` linha 3248 |
| Style | `0.3` | `v7-vv/index.ts` linha 3249 |
| Speaker boost | `true` | `v7-vv/index.ts` linha 3250 |
| Output | `mp3_44100_128` | `elevenlabs-tts-contextual/index.ts` linha 125 |
| Audio tags | `[excited]`, `[pause]`, `[calm]` | Suportados pelo eleven_v3 |
| Secret | `ELEVENLABS_API_KEY` | JA CONFIGURADO |

---

## 12. PIPELINE — EDGE FUNCTION `v8-generate`

Arquivo: `supabase/functions/v8-generate/index.ts`

```text
1. RECEBER JSON
   Body: { lessonId, sections: V8Section[], quizzes: V8InlineQuiz[] }

2. AUTENTICAR
   Header Authorization -> REST /auth/v1/user -> verificar admin

3. GERAR AUDIO POR SECAO
   POST https://api.elevenlabs.io/v1/text-to-speech/Xb7hH8MSUJpSbSDYk0k2
   Body: { text, model_id: 'eleven_v3', voice_settings: {...} }
   previous_text / next_text para request stitching

4. GERAR AUDIO POR QUIZ
   TTS do enunciado + TTS do reforco (se existir)

5. UPLOAD
   Bucket: lesson-audios
   Path: v8/{lessonId}/section-{index}.mp3
   Path: v8/{lessonId}/quiz-{index}.mp3

6. RETORNAR
   { sections: [{ index, audioUrl, duration }], quizzes: [...] }
```

---

## 13. NAVEGACAO E ROTAS

### 13.1 Estado atual (`App.tsx`, 251 linhas)

Rotas V7 (linhas 173, 201-217):
- `/v7/:lessonId` -> `V7CinematicPlayer`
- `/admin/v7/create` -> `AdminV7Create`

### 13.2 Novas rotas V8

```typescript
const V8TrailDetail = lazy(() => import("./pages/V8TrailDetail"));
const V8Lesson = lazy(() => import("./pages/V8Lesson"));
const AdminV8Create = lazy(() => import("./pages/AdminV8Create"));

// Antes do catch-all (linha 241)
<Route path="/v8-trail/:trailId" element={<ProtectedRoute><V8TrailDetail /></ProtectedRoute>} />
<Route path="/v8/:lessonId" element={<ProtectedRoute><V8Lesson /></ProtectedRoute>} />
<Route path="/admin/v8/create" element={<AdminRoute><AdminV8Create /></AdminRoute>} />
```

### 13.3 Integracoes

- `Dashboard.tsx` linha 169-173: separar trails por `trail_type`
- `CourseDetail.tsx` linha 116: adicionar `case 'v8': navigate('/v8/' + lesson.id)`

---

## 14. COMPONENTES V8

### 14.1 Pasta: `src/components/lessons/v8/`

| Componente | Descricao | Props principais |
|---|---|---|
| `V8LessonPlayer.tsx` | Orquestrador de fases | `lessonData`, `onComplete` |
| `V8Header.tsx` | Header fixo + progress bar | `title`, `currentIndex`, `totalSteps`, `onBack` |
| `V8ModeSelector.tsx` | Ler vs Ouvir | `onSelectMode: (mode) => void` |
| `V8ContentSection.tsx` | Markdown + imagem | `section: V8Section`, `mode`, `onContinue` |
| `V8AudioPlayer.tsx` | Player sticky glass | `audioUrl`, `onEnded`, `playbackSpeed` |
| `V8QuizInline.tsx` | Quiz narrado + reforco | `quiz: V8InlineQuiz`, `onAnswer` |
| `V8CompletionScreen.tsx` | Resultado + gamificacao | `scores`, `lessonId`, `onContinue` |

### 14.2 Hooks

| Hook | Descricao |
|---|---|
| `useV8Player` | V8PlayerState, transicoes, indice |
| `useV8Audio` | HTMLAudioElement: play, pause, speed, progress |

### 14.3 Paginas

| Pagina | Rota |
|---|---|
| `V8TrailDetail.tsx` | `/v8-trail/:trailId` |
| `V8Lesson.tsx` | `/v8/:lessonId` |
| `AdminV8Create.tsx` | `/admin/v8/create` |

---

## 15. FLUXO DO USUARIO (10 passos)

1. Dashboard: ve V8TrailCard premium (secao "Trilhas Premium")
2. Clica na trilha: navega `/v8-trail/:trailId`
3. V8TrailDetail: lista aulas direto (sem cursos), desbloqueio sequencial
4. Clica na aula: navega `/v8/:lessonId`
5. V8ModeSelector: escolhe Ler ou Ouvir
6. Modo Ler: texto + audio disponivel (nao auto-play), botao Continuar
7. Modo Ouvir: audio auto-play, avanca ao `onEnded`
8. Quiz Inline: apos certas secoes, enunciado narrado, 4 opcoes, reforco ao errar
9. Exercicios: ExercisesSection (10 tipos + 2 games)
10. Completion: XP, coins, streak, confetti, proxima aula

---

## 16. SEQUENCIA DE IMPLEMENTACAO — 15 FASES

| Fase | Tarefa | Arquivos | Status |
|---|---|---|---|
| 1 | Migracao DB: `trail_type` | SQL migration | PENDENTE |
| 2 | Tipos V8 | `src/types/v8Lesson.ts` | PENDENTE |
| 3 | V8AudioPlayer | `src/components/lessons/v8/V8AudioPlayer.tsx` | PENDENTE |
| 4 | V8ContentSection | `src/components/lessons/v8/V8ContentSection.tsx` | PENDENTE |
| 5 | V8QuizInline | `src/components/lessons/v8/V8QuizInline.tsx` | PENDENTE |
| 6 | V8Header + V8ModeSelector | 2 arquivos | PENDENTE |
| 7 | V8LessonPlayer + hooks | `V8LessonPlayer.tsx` + `useV8Player.ts` + `useV8Audio.ts` | PENDENTE |
| 8 | V8CompletionScreen | `V8CompletionScreen.tsx` | PENDENTE |
| 9 | V8TrailCard + V8LessonCard | 2 componentes | PENDENTE |
| 10 | V8TrailDetail | `src/pages/V8TrailDetail.tsx` | PENDENTE |
| 11 | V8Lesson page + rotas | `V8Lesson.tsx` + `App.tsx` | PENDENTE |
| 12 | Dashboard: integrar V8TrailCard | `Dashboard.tsx` (modificar) | PENDENTE |
| 13 | Edge Function v8-generate | `supabase/functions/v8-generate/index.ts` | PENDENTE |
| 14 | AdminV8Create | `src/pages/AdminV8Create.tsx` | PENDENTE |
| 15 | Teste E2E com aula demo | Todos | PENDENTE |

---

## 17. CHECKLIST PRE-IMPLEMENTACAO

| # | Item | Status | Evidencia |
|---|---|---|---|
| 1 | `trails` NAO tem `trail_type` | CONFIRMADO | Query real: 7 colunas |
| 2 | `lessons.model` TEXT nullable | CONFIRMADO | Query real |
| 3 | `lessons.trail_id` UUID nullable | CONFIRMADO | Query real |
| 4 | `lessons.course_id` nullable | CONFIRMADO | Query real |
| 5 | `ExerciseConfig` 10 tipos + 2 games | CONFIRMADO | `guidedLesson.ts` linhas 108-116 |
| 6 | `ExercisesSection` aceita `ExerciseConfig[]` | CONFIRMADO | Linha 32 |
| 7 | `registerGamificationEvent` disponivel | CONFIRMADO | `services/gamification.ts` |
| 8 | `useV7SoundEffects` 22 sons | CONFIRMADO | 478 linhas |
| 9 | `updateMissionProgress` disponivel | CONFIRMADO | 48 linhas |
| 10 | `ELEVENLABS_API_KEY` configurado | CONFIRMADO | Secrets |
| 11 | `react-markdown ^10.1.0` | CONFIRMADO | package.json |
| 12 | `framer-motion ^12.23.24` | CONFIRMADO | package.json |
| 13 | `canvas-confetti ^1.9.4` | CONFIRMADO | package.json |
| 14 | Bucket `lesson-audios` publico | CONFIRMADO | Query storage.buckets |
| 15 | `CourseDetail.tsx` switch por `lesson.model` | CONFIRMADO | Linha 116 |
| 16 | `App.tsx` padrao lazy loading | CONFIRMADO | Linhas 22-90 |
| 17 | 31 edge functions existentes | CONFIRMADO | `supabase/functions/` listagem |

---

## 18. O QUE NAO MUDA

- V7: 100% intacto (pipeline, player, contratos, hierarquia 3 niveis)
- Tabela `lessons`: schema inalterado
- Tabela `courses`: inalterada
- ExercisesSection + 10 exercicios + 2 games: reutilizados
- useV7SoundEffects (478 linhas): reutilizado
- Gamificacao completa: reutilizada
- Autenticacao e progresso: reutilizados
- Bucket `lesson-audios`: reutilizado (nova pasta `v8/`)
- Todas as 31 edge functions: intactas
