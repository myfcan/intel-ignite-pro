

# Auditoria Completa — Itens NÃO MAPEADOS no Espelho Anterior

Após varredura exaustiva dos ~28 arquivos do sistema V8, identifiquei **7 categorias/itens** que estavam ausentes ou incompletos no espelho anterior. Abaixo, o delta — tudo que faltava.

---

## NOVA CATEGORIA 19: REVIEW GATE (Social Proof Modal)

**Arquivo:** `src/components/lessons/v8/V8LessonReviewGate.tsx`

**NÃO MAPEADO.** Modal de "social proof" exibido antes de desbloquear uma aula. Funcionalidades:

| Feature | Implementação |
|---|---|
| **Reviews determinísticos** | Hash do `lessonId` seleciona 4 de 5 reviews fixos (sem API) |
| **Delay de CTA** | Botão "Continuar" desabilitado por 3s (`setTimeout`), label muda de "Leia os depoimentos..." → "Continuar" |
| **Bloqueio de fuga** | `onPointerDownOutside` e `onEscapeKeyDown` bloqueados (`preventDefault`) |
| **Upsell** | Botão "Quero desbloquear tudo" com ícone `Crown` navega para `/pricing` |
| **Design** | Header gradiente `violet-600 → indigo-600`, avatares coloridos (`violet, pink, indigo, emerald, amber`), estrelas amarelas |
| **Animação** | Cards entram com `opacity: 0, x: -20` escalonados em 150ms |

---

## NOVA CATEGORIA 20: LIV TRAIL WELCOME (Onboarding Modal)

**Arquivo:** `src/components/lessons/v8/V8LivTrailWelcome.tsx`

**NÃO MAPEADO.** Modal de boas-vindas da "Liv" exibido na primeira visita a uma trilha. Funcionalidades:

| Feature | Implementação |
|---|---|
| **One-time show** | `localStorage.getItem("liv-trail-welcome-{trailId}")` — exibe uma única vez |
| **Delay de abertura** | Modal aparece após 600ms, botão CTA habilita após 2s |
| **Design Dark** | Background `#1F2937 → #111827` com grid pattern SVG + glow violeta + 6 partículas flutuantes animadas |
| **Avatar Liv** | `liv-avatar.png` com borda `purple-400/30`, glow radial pulsante (`blur-2xl`), Sparkles animado girando |
| **CTA** | Gradiente `indigo → violet → pink`, shadow glow violeta, texto muda com estado |
| **Bloqueio** | `onPointerDownOutside` e `onEscapeKeyDown` bloqueados |

---

## NOVA CATEGORIA 21: SKILL TREE (Navegação Visual de Aulas)

**Arquivos:** `V8SkillTree.tsx` + `V8SkillNode.tsx`

**NÃO MAPEADO.** Árvore de habilidades visual tipo "Duolingo" para navegação entre aulas.

| Feature | Implementação |
|---|---|
| **Layout zigzag** | Pattern `[0, 1, 0, -1]` com offset X de 70px, `ROW_HEIGHT = 160px` |
| **Conectores SVG** | Curvas Bézier entre nós, cor gradiente (violeta para completados, cinza para locked) |
| **Nós (V8SkillNode)** | Botões circulares com 4 estados visuais (`completed, in_progress, available, locked`), cada um com gradiente/shadow distintos |
| **Ícones dinâmicos** | `getLessonIcon(title)` baseado em keywords do título (27 mapeamentos em `lessonIconMap.ts`) |
| **Animação** | Spring stiffness 220 com delay escalonado (`index * 0.06`), `whileHover: scale 1.08`, `whileTap: scale 0.94` |
| **Tooltip** | Título da aula em `text-[10px]` abaixo do nó, max 80px |

---

## NOVA CATEGORIA 22: TRAIL CARD (Card de Trilha)

**Arquivo:** `src/components/lessons/v8/V8TrailCard.tsx`

**NÃO MAPEADO.** Card de trilha na tela principal com temas visuais.

| Feature | Implementação |
|---|---|
| **Ícones por trilha** | `V8_ICONS` mapeados por `orderIndex` (Compass, MessageSquare, Sparkles, Brain, Palette, Zap, Bot) |
| **Temas** | 4 variações de accent (`#6366F1, #7C3AED, #4F46E5, #8B5CF6`) rotacionando por `orderIndex` |
| **Progress bar** | `bg-gradient-to-r` com cor do tema, animada via framer-motion |
| **Badge** | "Read & Listen" label em cada tema |

---

## NOVA CATEGORIA 23: LESSON ICON MAP (Ícones Inteligentes)

**Arquivo:** `src/utils/lessonIconMap.ts`

**NÃO MAPEADO.** Sistema de mapeamento automático de ícones Lucide por keywords do título da aula.

| Feature | Implementação |
|---|---|
| **27 keywords** | prompt→MessageSquare, ia→Bot, cérebro→Brain, vídeo→Video, renda→DollarSign, etc. |
| **Fallback** | `BookOpen` quando nenhum keyword matched |
| **Uso** | `V8LessonCard`, `V8SkillNode`, `CourseDetail` |

---

## NOVA CATEGORIA 24: EXERCISE ERROR CARD (Fallback de Erro)

**Arquivo:** `src/components/lessons/ExerciseErrorCard.tsx`

**NÃO MAPEADO.** Componente de fallback exibido quando exercícios têm dados inválidos.

| Feature | Implementação |
|---|---|
| **Design** | Card laranja `bg-orange-50 border-orange-500 border-2` com `AlertTriangle` |
| **Detalhes** | Box `font-mono` para exibir detalhes técnicos do erro |
| **Admin link** | Botão "Ir para Sincronizar Aulas" navegando para `/admin/sync-lessons` |
| **Uso** | Validação defensiva em 6 exercícios: PlatformMatch, ScenarioSelection, TrueFalse, FillInBlanks, CompleteSentence, DataCollection |

---

## NOVA CATEGORIA 25: V8 CONTENT PARSER (Parser de Conteúdo)

**Arquivo:** `src/lib/v8ContentParser.ts` (542 linhas)

**NÃO MAPEADO.** Parser master que converte texto markdown bruto em `V8LessonData` estruturado.

| Feature | Implementação |
|---|---|
| **parseFullContent()** | Extrai título, descrição, seções (##), playgrounds (`[PLAYGROUND]`), quizzes (`[QUIZ]`) |
| **Section 0 auto** | Se há conteúdo entre `#` e primeiro `##`, cria seção de "Abertura" automática |
| **Meta-filter** | Ignora linhas com keywords de instruções (`parser, fix, TODO, FIXME`) |
| **Sanitização** | Aplica `sanitizeV8PedagogicalText()` em todo conteúdo extraído |
| **Output flags** | `hasManualExercises`, `hasManualQuizzes`, `hasManualPlaygrounds`, `manualExerciseTypes` |

---

## ITENS INCOMPLETOS NO ESPELHO ANTERIOR (agora corrigidos)

### CATEGORIA 7 (Audio-First Lock) — Escopo ampliado

O espelho anterior listava o escopo como "V8InlineExercise, V8CompleteSentenceInline, V8QuizInline, V8QuizTrueFalse, V8QuizFillBlank", mas faltou mencionar que:
- `V8QuizFillBlank` suporta **modo dual**: input de texto livre OU chips (`chipOptions`) — o `useAudioFirstLock` bloqueia ambos os modos

### CATEGORIA 8.6 (Scenario Selection) — Detalhe não mapeado

- **Formato dual**: aceita tanto formato simples (`{ scenario, isCorrect }`) quanto formato completo (`{ scenario, options, correctAnswer }`)
- **Scroll integrado**: usa `ensureElementVisible` do `v8ScrollUtils` para garantir visibilidade do feedback

### CATEGORIA 17 (Dedup & Timeline) — Lógica de preload

O espelho mencionou preload mas não detalhou:
- **Preload por tipo**: resolve audioUrl de todos os 7 tipos de timeline item (section, quiz, playground, complete-sentence, inline-exercise, insight, learn-and-grow)
- **Cleanup**: `audio.src = ""` no unmount para liberar recurso

---

## MAPA FINAL ATUALIZADO — 25 CATEGORIAS

```text
 #  │ Categoria                   │ Arquivos
────┼─────────────────────────────┼──────────────────────────
 1  │ Renderização Markdown       │ V8ContentSection
 2  │ Imagens (Trim)              │ V8ContentSection (inline)
 3  │ Scroll & Âncoras            │ V8LessonPlayer + v8ScrollUtils
 4  │ Player UI                   │ V8LessonPlayer
 5  │ Header & Progresso          │ V8Header
 6  │ Audio Player                │ V8AudioPlayer
 7  │ Audio-First Lock            │ useAudioFirstLock + V8AudioLockOverlay
 8  │ Exercícios (8 tipos)        │ 8 componentes filhos
 9  │ Coursiv Prompt Builder      │ V8CompleteSentenceInline
10  │ Playground Interativo       │ V8PlaygroundInline
11  │ Insight Reward              │ V8InsightReward
12  │ Learn & Grow                │ V8LearnAndGrowBlock
13  │ Tela de Conclusão           │ V8CompletionScreen
14  │ Modal de Avaliação          │ V8LessonRating
15  │ Mode Selector               │ V8ModeSelector
16  │ Gamification & XP           │ distributed (3 componentes)
17  │ Timeline & Dedup            │ useV8Player
18  │ Feedback Wrapper            │ V8InlineExercise
19  │ Review Gate (Social Proof)  │ V8LessonReviewGate          ← NOVO
20  │ Liv Trail Welcome           │ V8LivTrailWelcome            ← NOVO
21  │ Skill Tree                  │ V8SkillTree + V8SkillNode    ← NOVO
22  │ Trail Card                  │ V8TrailCard                  ← NOVO
23  │ Lesson Icon Map             │ lessonIconMap.ts             ← NOVO
24  │ Exercise Error Card         │ ExerciseErrorCard            ← NOVO
25  │ Content Parser              │ v8ContentParser.ts           ← NOVO
────┼─────────────────────────────┼──────────────────────────
    │ Sanitização (v8TextSanitizer) │ lib/v8TextSanitizer.ts
    │ Scroll Utils                  │ v8ScrollUtils.ts
    │ CSS (hide-scrollbar)          │ src/index.css
    │ Constants (PASS_SCORE)        │ src/constants/v8Rules.ts
```

**Total: 25 categorias, ~35 arquivos.**

As 7 novas categorias (19-25) cobrem: navegação de trilhas (SkillTree, TrailCard), onboarding (LivWelcome), social proof (ReviewGate), error handling (ExerciseErrorCard), content parsing (v8ContentParser), e ícones inteligentes (lessonIconMap). Tudo já implementado e funcional no sistema.

