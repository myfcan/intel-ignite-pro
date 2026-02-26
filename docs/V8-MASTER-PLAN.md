# V8 "Read & Listen" Premium — Plano Mestre Completo

**Documento Vivo — Status atualizado a cada fase concluída**

---

## 1. VISÃO GERAL

V8 é um formato de aula "Read & Listen" Premium com arquitetura simplificada:
- Áudio gerado POR SEÇÃO (15-30s cada), sem `word_timestamps`, sem anchors, sem image-sequence triggers
- Hierarquia de 2 níveis (Trail → Lesson), eliminando a camada de Course
- Coexiste 100% com V7 sem alterar NENHUM arquivo, tabela ou função existente

---

## 2. CONTRATO DE IMPLEMENTAÇÃO DE QUALIDADE (CIQ)

### 2.1 Os 3 Pilares

| Pilar | Pergunta | Critério |
|---|---|---|
| Objetivo | O código faz o que a fase exige? | Funcionalidade verificável no preview |
| Qualidade Técnica | Build passa? TypeScript strict? Lógica correta? | Zero erros, zero `any` não-justificado |
| Escalabilidade | Modular? Extensível? | Componentes desacoplados, tipos extensíveis |

### 2.2 Processo

```text
IMPLEMENTAR FASE N
       |
  AUDITAR (relatório forense)
       |
  APRESENTAR RELATÓRIO
       |
  APROVADO? --[NÃO]--> CORRIGIR
       |
      [SIM]
       |
  FASE N+1
```

### 2.3 Template de Auditoria

```text
## Auditoria CIQ — Fase N: [Nome]

### Pilar 1 — Objetivo
- [ ] Funcionalidade entregue (evidência: screenshot/log)?
- [ ] Cenários cobertos?

### Pilar 2 — Qualidade Técnica
- [ ] Build sem erros?
- [ ] TypeScript strict?
- [ ] Try/catch em todos os fetches?
- [ ] Estados loading/error/empty?

### Pilar 3 — Escalabilidade
- [ ] Componentes desacoplados?
- [ ] Tipos extensíveis?

### Veredito: APROVADO / REPROVADO
```

---

## 3. SEPARAÇÃO DE DISCIPLINAS

### 3.1 Web Design

**Paleta Premium**:

| Token | Hex | Uso |
|---|---|---|
| `slate-950` | `#020617` | Fundo principal |
| `slate-900` | `#0f172a` | Cards/seções |
| `slate-800` | `#1e293b` | Elementos elevados |
| `indigo-500` | `hsl(239 84% 67%)` | Primário, progress |
| `violet-500` | `hsl(258 90% 66%)` | Gradientes, badges |
| `emerald-500` | `hsl(158 64% 52%)` | Sucesso, streaks |
| `white/5` | `rgba(255,255,255,0.05)` | Glass background |
| `white/10` | `rgba(255,255,255,0.10)` | Glass border |
| `white/20` | `rgba(255,255,255,0.20)` | Glass hover |
| `slate-300` | `#CBD5E1` | Corpo texto |
| `slate-400` | `#94A3B8` | Labels secundários |

**Tipografia**:

| Elemento | Tamanho | Peso | Line-height |
|---|---|---|---|
| Título seção | `28px` | `700` | `1.2` |
| Corpo markdown | `17px` | `400` | `1.75` |
| Labels/badges | `11px` | `600` | `normal` |

**Glass-morphism**: `bg-white/5 border border-white/10 backdrop-blur-xl`
**Animações**: Framer Motion (`^12.23.24` instalado) — fade+slide, scale, width transitions

### 3.2 Frontend

- TypeScript strict, zero `any` não-justificado
- Lazy loading (padrão do `App.tsx` linhas 22-90)
- Try/catch em TODOS os fetches
- Estados `loading` / `error` / `empty`

### 3.3 Backend

- Migrações SQL com DEFAULT para não quebrar V7
- Edge functions com validação de entrada
- Auth via REST (padrão verificado em `v7-vv/index.ts`)
- CORS: `Access-Control-Allow-Origin: *`
- Secret `ELEVENLABS_API_KEY`: JÁ CONFIGURADO

---

## 4. HIERARQUIA HÍBRIDA

### 4.1 Tabela `trails` — Schema REAL (7 colunas + 1 nova)

```text
id            uuid          DEFAULT uuid_generate_v4()   NOT NULL
title         varchar                                     NOT NULL
description   text                                        NULLABLE
order_index   integer                                     NOT NULL
icon          varchar                                     NULLABLE
is_active     boolean       DEFAULT true                  NULLABLE
created_at    timestamptz   DEFAULT now()                 NULLABLE
trail_type    text          DEFAULT 'v7'                  NULLABLE  <-- NOVA (Fase 1)
```

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
import { ExerciseConfig } from './guidedLesson';

export interface V8Section {
  id: string;
  title: string;
  content: string;              // Markdown
  imageUrl?: string;
  audioUrl: string;             // Áudio individual (15-30s)
  audioDurationSeconds?: number;
}

export interface V8InlineQuiz {
  id: string;
  afterSectionIndex: number;    // Aparece após sections[N]
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
  exercises: ExerciseConfig[];
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

### 5.2 ExerciseConfig — Código REAL (`src/types/guidedLesson.ts` linhas 108-116)

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

### 6.1 Migração

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
| `content` | `V8LessonData` JSONB | Seções + quizzes |
| `exercises` | `ExerciseConfig[]` JSONB | Exercícios finais |
| `audio_url` | `NULL` | Áudio por seção |
| `word_timestamps` | `NULL` | Não usa |

### 6.3 Tabelas reutilizadas SEM alteração

| Tabela | Colunas chave | Uso V8 |
|---|---|---|
| `user_progress` | `user_id, lesson_id, status, score, completed_at` | Progresso |
| `user_gamification_events` | `user_id, event_type, xp_delta, coins_delta` | XP/moedas |
| `user_streaks` | `user_id, current_streak, best_streak, last_active_date` | Streak |
| `user_achievements` | `user_id, achievement_type, points_earned` | Conquistas |
| `user_daily_missions` | `user_id, mission_id, progress_value, completed` | Missões |
| `users` | `power_score, coins, patent_level, total_lessons_completed` | Stats |

### 6.4 Função `register_gamification_event` — PL/pgSQL REAL (149 linhas)

Eventos e recompensas verificados no código SQL:
- `lesson_completed`: +40 XP, +10 coins
- `journey_completed`: +120 XP, +25 coins
- `quiz_answered` (>= 80%): +50 XP, +5 coins
- `quiz_answered` (< 80%): +20 XP, +0 coins

Patentes (thresholds reais do SQL):
- Level 0: "Sem patente" (< 200)
- Level 1: "Operador Básico de I.A." (200-599)
- Level 2: "Executor de Sistemas" (600-1199)
- Level 3: "Estrategista em I.A." (>= 1200)

Idempotência via `event_reference_id` (verificado no SQL).

### 6.5 Storage

Bucket `lesson-audios`: EXISTE, público.
Path V8: `v8/{lessonId}/section-{index}.mp3`

---

## 7. DECISÃO ARQUITETURAL: SEM ANCHORTEXT NO V8

O V7 usa `useAnchorText` + `word_timestamps` para detectar keywords no áudio único e pausar para interações. V8 NÃO precisa deste sistema porque:

1. Áudio é segmentado por seção (15-30s) — cada seção tem seu próprio arquivo MP3
2. O trigger para quizzes usa `afterSectionIndex` — quando `audio.onEnded` dispara, o quiz aparece
3. Para interações "mid-content", basta quebrar a seção em duas (Seção 2a → Quiz → Seção 2b)

Isso elimina toda a complexidade de keyword matching, timestamp resolution e anchor contracts.

---

## 8. TELAS — DETALHAMENTO COMPLETO

### 8.1 Dashboard — V8TrailCard

```text
+---------------------------------------------------------------+
|  [HORIZONTAL — Fundo slate-900]                                |
|  +--------+  TÍTULO DA TRILHA V8          [Read & Listen]      |
|  | ÍCONE  |  Descrição curta...                                |
|  | (glass)|  3 aulas • Premium                                 |
|  +--------+                                                    |
|  [==========----] 60%              [Continuar →]               |
+---------------------------------------------------------------+
  Border: 1px solid rgba(99,102,241,0.2)
  Shadow: 0 0 20px rgba(99,102,241,0.15)
  Hover: translateY(-4px)
```

Integração: `Dashboard.tsx` (771 linhas)
- Linha 169-173: query `trails` — adicionar filtro por `trail_type`
- Linha 567-588: grid de `TrailCard` — adicionar seção separada "Trilhas Premium" com `V8TrailCard`

### 8.2 V8TrailDetail (`/v8-trail/:trailId`)

```text
+----------------------------------------------------------------+
|  [← Voltar]                                                     |
|  +------------------------------------------------------------+|
|  | HEADER (gradiente indigo-600 → violet-600)                  ||
|  |  [Ícone]  TÍTULO DA TRILHA V8                               ||
|  |           3 aulas • Read & Listen                           ||
|  |  [====================] 66%                                 ||
|  +------------------------------------------------------------+|
|                                                                  |
|  +------------------------------------------------------------+|
|  | Aula 1: Título         [Concluída]     10 min               ||
|  | [==========] 100%                                           ||
|  +------------------------------------------------------------+|
|  | Aula 2: Título         [Cursando]      12 min               ||
|  | [====------] 40%                                            ||
|  +------------------------------------------------------------+|
|  | Aula 3: Título         [Bloqueada]     8 min                ||
|  +------------------------------------------------------------+|
+----------------------------------------------------------------+
```

Lógica de desbloqueio (igual `CourseDetail.tsx` linhas 104-109):
- Aula 0: sempre desbloqueada
- Aula N: desbloqueada se N-1 completa OU usuário é admin

### 8.3 V8Lesson (`/v8/:lessonId`) — Player Principal

**FASE 1: MODE SELECT**
```text
+-------------------------------+
|     Como você quer            |
|     aprender?                 |
|                               |
| +----------+  +----------+   |
| |  LER     |  |  OUVIR   |   |
| | Leia no  |  | Ouça a   |   |
| | seu ritmo|  | narração  |   |
| +----------+  +----------+   |
+-------------------------------+
  Glass cards: bg-white/5
  Hover: bg-white/10
```

**FASE 2: CONTENT (seção por seção)**
```text
+-------------------------------+
| [HEADER FIXO]                 |
| [←] Título    2/5  [=====]   |
|-------------------------------|
|  SEÇÃO 2: Título (28px bold)  |
|                               |
|  Markdown (17px, slate-300,   |
|  line-height 1.75)            |
|                               |
|  [Imagem rounded-2xl]         |
|                               |
|       [Continuar →]           |
|-------------------------------|
| [V8AudioPlayer — STICKY]     |
| [⏪10] [▶ PLAY] [10⏩] [1.5x]|
| [=====---------] 0:23/0:45   |
+-------------------------------+
```

**FASE 2.5: QUIZ INLINE**
```text
+-------------------------------+
|  Quiz Rápido                  |
|  "Qual é a função do..."     |
|                               |
|  ( ) Opção A                  |
|  (●) Opção B ← selecionada   |
|  ( ) Opção C                  |
|  ( ) Opção D                  |
|                               |
|  [Confirmar]                  |
|  [Card de reforço se errou]   |
+-------------------------------+
```

**FASE 3: EXERCISES**
- Renderiza `ExercisesSection.tsx` (307 linhas, código real)
- Props: `exercises: ExerciseConfig[]`, `onComplete`, `onScoreUpdate`
- 10 tipos + 2 games

**FASE 4: COMPLETION**
```text
+-------------------------------+
|     Aula Concluída!           |
|     +XP [animação]            |
|     +Coins [animação]         |
|     Streak: 5 dias            |
|     Score: 80%                |
|     [Próxima Aula →]          |
|     [Voltar à Trilha]         |
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
| Título:    [___________________________]                       |
|                                                                  |
| JSON (V8LessonData):                                           |
| +------------------------------------------------------------+ |
| | { "contentVersion": "v8", "sections": [...] }              | |
| +------------------------------------------------------------+ |
|                                                                  |
| [Validar JSON]  Status: 5 seções, 2 quizzes, 3 exercícios     |
| [Gerar Áudios]  Status: Gerando 5/7 áudios...                 |
|                                                                  |
| Preview de áudios:                                              |
| Seção 1: [▶ 0:23]                                              |
| Seção 2: [▶ 0:18]                                              |
|                                                                  |
| [Salvar Rascunho]  [Salvar e Ativar]                           |
+----------------------------------------------------------------+
```

---

## 9. EXERCÍCIOS E GAMING — INVENTÁRIO FORENSE COMPLETO

### 9.1 Orquestrador: ExercisesSection.tsx (307 linhas)

Código REAL (linhas 31-37):
```typescript
interface ExercisesSectionProps {
  exercises: ExerciseConfig[];
  onComplete: (data?: { allExercisesCompleted?: boolean }) => void;
  onScoreUpdate?: (scores: number[]) => void;
  onBack?: () => void;
  exerciseMetadata?: Array<{ title: string; type: string }>;
}
```

Lógica de score (linhas 55-72 reais):
- Score >= 70%: confetti + `updateMissionProgress('exercicios', 1)`
- Toast: "Exercício completo! Score: X%"
- Avança automaticamente após 1.2s
- Último exercício: chama `onComplete({ allExercisesCompleted: true })` após 2s

### 9.2 Os 10 Exercícios + 2 Games

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

22 tipos (código REAL linhas 7-29):
`transition-whoosh`, `transition-dramatic`, `click-soft`, `click-confirm`, `success`, `error`, `reveal`, `count-up`, `ambient-low`, `dramatic-hit`, `quiz-correct`, `quiz-wrong`, `progress-tick`, `completion`, `letter-reveal`, `snap-success`, `snap-error`, `streak-bonus`, `level-up`, `combo-hit`, `timer-tick`, `timer-buzzer`

V8 reutiliza: `useV7SoundEffects(0.6, true)`.

---

## 10. GAMIFICAÇÃO

### 10.1 Serviço: `src/services/gamification.ts` (40 linhas)

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

### 10.3 Missões: `src/lib/updateMissionProgress.ts` (48 linhas)

```typescript
export async function updateMissionProgress(
  actionType: 'aulas' | 'exercicios',
  increment: number = 1
): Promise<{ success: boolean; error?: string }>
```

---

## 11. ÁUDIO — ELEVENLABS

| Parâmetro | Valor | Fonte no código |
|---|---|---|
| Modelo | `eleven_v3` | `v7-vv/index.ts` linha 3245 |
| Voz | `Xb7hH8MSUJpSbSDYk0k2` (Alice Brasil) | `v7-vv/index.ts` linha 6872 |
| Stability | `0.5` | `v7-vv/index.ts` linha 3247 |
| Similarity boost | `0.75` | `v7-vv/index.ts` linha 3248 |
| Style | `0.3` | `v7-vv/index.ts` linha 3249 |
| Speaker boost | `true` | `v7-vv/index.ts` linha 3250 |
| Output | `mp3_44100_128` | `elevenlabs-tts-contextual/index.ts` linha 125 |
| Audio tags | `[excited]`, `[pause]`, `[calm]` | Suportados pelo eleven_v3 |
| Secret | `ELEVENLABS_API_KEY` | JÁ CONFIGURADO |

---

## 12. PIPELINE — EDGE FUNCTION `v8-generate`

Arquivo: `supabase/functions/v8-generate/index.ts`

```text
1. RECEBER JSON
   Body: { lessonId, sections: V8Section[], quizzes: V8InlineQuiz[] }

2. AUTENTICAR
   Header Authorization → REST /auth/v1/user → verificar admin

3. GERAR ÁUDIO POR SEÇÃO
   POST https://api.elevenlabs.io/v1/text-to-speech/Xb7hH8MSUJpSbSDYk0k2
   Body: { text, model_id: 'eleven_v3', voice_settings: {...} }
   previous_text / next_text para request stitching

4. GERAR ÁUDIO POR QUIZ
   TTS do enunciado + TTS do reforço (se existir)

5. UPLOAD
   Bucket: lesson-audios
   Path: v8/{lessonId}/section-{index}.mp3
   Path: v8/{lessonId}/quiz-{index}.mp3

6. RETORNAR
   { sections: [{ index, audioUrl, duration }], quizzes: [...] }
```

---

## 13. NAVEGAÇÃO E ROTAS

### 13.1 Estado atual (`App.tsx`, 251 linhas)

Rotas V7 (linhas 173, 201-217):
- `/v7/:lessonId` → `V7CinematicPlayer`
- `/admin/v7/create` → `AdminV7Create`

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

### 13.3 Integrações

- `Dashboard.tsx` linha 169-173: separar trails por `trail_type`
- `CourseDetail.tsx` linha 116: adicionar `case 'v8': navigate('/v8/' + lesson.id)`

---

## 14. COMPONENTES V8

### 14.1 Pasta: `src/components/lessons/v8/`

| Componente | Descrição | Props principais |
|---|---|---|
| `V8LessonPlayer.tsx` | Orquestrador de fases | `lessonData`, `onComplete` |
| `V8Header.tsx` | Header fixo + progress bar | `title`, `currentIndex`, `totalSteps`, `onBack` |
| `V8ModeSelector.tsx` | Ler vs Ouvir | `onSelectMode: (mode) => void` |
| `V8ContentSection.tsx` | Markdown + imagem | `section: V8Section`, `mode`, `onContinue` |
| `V8AudioPlayer.tsx` | Player sticky glass | `audioUrl`, `onEnded`, `playbackSpeed` |
| `V8QuizInline.tsx` | Quiz narrado + reforço | `quiz: V8InlineQuiz`, `onAnswer` |
| `V8CompletionScreen.tsx` | Resultado + gamificação | `scores`, `lessonId`, `onContinue` |

### 14.2 Hooks

| Hook | Descrição |
|---|---|
| `useV8Player` | V8PlayerState, transições, índice |
| `useV8Audio` | HTMLAudioElement: play, pause, speed, progress |

### 14.3 Páginas

| Página | Rota |
|---|---|
| `V8TrailDetail.tsx` | `/v8-trail/:trailId` |
| `V8Lesson.tsx` | `/v8/:lessonId` |
| `AdminV8Create.tsx` | `/admin/v8/create` |

---

## 15. FLUXO DO USUÁRIO (10 passos)

1. Dashboard: vê V8TrailCard premium (seção "Trilhas Premium")
2. Clica na trilha: navega `/v8-trail/:trailId`
3. V8TrailDetail: lista aulas direto (sem cursos), desbloqueio sequencial
4. Clica na aula: navega `/v8/:lessonId`
5. V8ModeSelector: escolhe Ler ou Ouvir
6. Modo Ler: texto + áudio disponível (não auto-play), botão Continuar
7. Modo Ouvir: áudio auto-play, avança ao `onEnded`
8. Quiz Inline: após certas seções, enunciado narrado, 4 opções, reforço ao errar
9. Exercícios: ExercisesSection (10 tipos + 2 games)
10. Completion: XP, coins, streak, confetti, próxima aula

---

## 16. SEQUÊNCIA DE IMPLEMENTAÇÃO — 15 FASES

| Fase | Tarefa | Arquivos | Status |
|---|---|---|---|
| 1 | Migração DB: `trail_type` | SQL migration | ✅ CONCLUÍDA |
| 2 | Tipos V8 | `src/types/v8Lesson.ts` | ✅ CONCLUÍDA |
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

## 17. CHECKLIST PRÉ-IMPLEMENTAÇÃO

| # | Item | Status | Evidência |
|---|---|---|---|
| 1 | `trails` tem `trail_type` | ✅ MIGRADO | Fase 1 concluída |
| 2 | `lessons.model` TEXT nullable | CONFIRMADO | Query real |
| 3 | `lessons.trail_id` UUID nullable | CONFIRMADO | Query real |
| 4 | `lessons.course_id` nullable | CONFIRMADO | Query real |
| 5 | `ExerciseConfig` 10 tipos + 2 games | CONFIRMADO | `guidedLesson.ts` linhas 108-116 |
| 6 | `ExercisesSection` aceita `ExerciseConfig[]` | CONFIRMADO | Linha 32 |
| 7 | `registerGamificationEvent` disponível | CONFIRMADO | `services/gamification.ts` |
| 8 | `useV7SoundEffects` 22 sons | CONFIRMADO | 478 linhas |
| 9 | `updateMissionProgress` disponível | CONFIRMADO | 48 linhas |
| 10 | `ELEVENLABS_API_KEY` configurado | CONFIRMADO | Secrets |
| 11 | `react-markdown ^10.1.0` | CONFIRMADO | package.json |
| 12 | `framer-motion ^12.23.24` | CONFIRMADO | package.json |
| 13 | `canvas-confetti ^1.9.4` | CONFIRMADO | package.json |
| 14 | Bucket `lesson-audios` público | CONFIRMADO | Query storage.buckets |
| 15 | `CourseDetail.tsx` switch por `lesson.model` | CONFIRMADO | Linha 116 |
| 16 | `App.tsx` padrão lazy loading | CONFIRMADO | Linhas 22-90 |
| 17 | 31 edge functions existentes | CONFIRMADO | `supabase/functions/` listagem |

---

## 18. O QUE NÃO MUDA

- V7: 100% intacto (pipeline, player, contratos, hierarquia 3 níveis)
- Tabela `lessons`: schema inalterado
- Tabela `courses`: inalterada
- ExercisesSection + 10 exercícios + 2 games: reutilizados
- useV7SoundEffects (478 linhas): reutilizado
- Gamificação completa: reutilizada
- Autenticação e progresso: reutilizados
- Bucket `lesson-audios`: reutilizado (nova pasta `v8/`)
- Todas as 31 edge functions: intactas
