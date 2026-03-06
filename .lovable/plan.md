
# Espelho Completo V8 — 25 Categorias (~35 arquivos)

## Auditoria Final: Todas as Melhorias Mapeadas

---

## CAT 1: Renderização Markdown (V8ContentSection)
- Bold: `font-semibold text-primary`
- Itálico: highlight marker `bg-primary/10 px-1.5 py-0.5 rounded-md`
- Listas: container `bg-muted/50 rounded-xl border-border/40`, bullets `bg-primary/60`
- Blockquotes: callout `border-l-4 border-primary/40 bg-primary/5 rounded-r-xl`
- Code inline: `bg-muted text-primary rounded-md font-mono`
- Base: `text-[16.5px] leading-[1.85] tracking-[-0.01em]`
- Sanitização: `v8TextSanitizer.ts` remove marcadores narração
- Título: strip automático "Seção X —" via `cleanSectionTitle()`

## CAT 2: Imagens — V8TrimmedImage
- Trim automático via bounding box (alpha<10, dist<30)
- Cache in-memory `trimmedImageCache` com `TRIM_VERSION=2`
- Shimmer loading + fade-in 500ms + `img.decode()` assíncrono
- Posição: antes do markdown, centralizada, `max-w-[300px] rounded-2xl`

## CAT 3: Scroll & Âncoras (v8ScrollUtils)
- Âncora estática `scroll-margin-top: 88px` separada do motion.div
- Drift correction 420ms pós-scroll (threshold 4px)
- Double-rAF antes do scroll
- CTA scroll: 300ms + 600ms safety-net
- Safe zones: TOP=88px, BOTTOM=120px, DELTA=16px

## CAT 4: Player UI (V8LessonPlayer)
- Background: `bg-white text-slate-900` (Premium Light)
- Hide scrollbar, padding unificado `pb-36`
- Barra fixa bottom: `bg-white/95 backdrop-blur-sm`
- Animação entrada: `opacity 0→1, y 14→0` condicional
- Preload áudio do próximo item

## CAT 5: Header & Progresso (V8Header)
- Barra progresso: `h-1 bg-gradient-to-r from-indigo-500 to-violet-500`
- Glassmorphism: `bg-white/90 backdrop-blur-lg`
- Contador: `tabular-nums text-[11px]`
- Report button + drawer de navegação por seções

## CAT 6: Audio Player (V8AudioPlayer)
- Play button: gradiente `indigo-500 → violet-500`, 36px
- Progress bar clicável `h-1.5`
- Velocidade: ciclo `1x → 1.25x → 1.5x → 2x`
- Timer `font-mono tabular-nums`
- Loading: spinner + animate-pulse

## CAT 7: Audio-First Lock (useAudioFirstLock + V8AudioLockOverlay)
- Lock: `opacity-40 pointer-events-none` durante narração
- Overlay: `Headphones animate-pulse` + mensagem
- Unlock visual: `ring-2 ring-indigo-400/60` por 1.5s
- Escopo: V8InlineExercise, V8CompleteSentenceInline, V8QuizInline, V8QuizTrueFalse, V8QuizFillBlank (modo dual: texto + chips)

## CAT 8: Exercícios Inline (8 tipos)
1. **Multiple Choice** — botões com feedback verde/vermelho, ícone Target
2. **FlipCard Quiz** — Light Theme, COLOR_MAP/ICON_MAP, confetti localizado, progress bar
3. **True/False** — 4 afirmações com toggle
4. **Platform Match** — match cenários↔plataformas, validação defensiva
5. **Timed Quiz** — 4 timer states, bônus tempo, SFX, max 2 perguntas
6. **Scenario Selection** — formato dual (simples + completo), scroll integrado
7. **Fill-in-Blanks** — chips arrastáveis
8. **Complete Sentence** — lacunas inline com chip bank

## CAT 9: Coursiv Prompt Builder (V8CompleteSentenceInline)
- Badge: `Puzzle` icon em `bg-cyan-50 border-cyan-200`
- Blank states: active/filled/empty com cores distintas
- Word bank: chips shuffled, tap-to-fill, auto-advance
- Submit: só quando `allFilled`
- Feedback: erros com `line-through` + correção verde
- Retry: grid 2 colunas
- Contrato V8-C01: 4 lacunas, 0 distratores

## CAT 10: Playground Interativo (V8PlaygroundInline)
- Fases: intro→amateur→professional→compare→challenge→done (acumulativas)
- Badge: `Sparkles` em `bg-violet-50`
- Comparação: grid 2 colunas ❌/✅
- Challenge: avaliação IA via edge function `v8-evaluate-prompt`
- Anti-copy context, feedback estruturado, max 3 tentativas
- Reset externo via `useImperativeHandle`

## CAT 11: Insight Reward (V8InsightReward)
- Card `border-2 border-amber-300 bg-amber-50`
- Claim idempotente (verifica events antes)
- Confetti 100 partículas + SFX
- Estado locked se playground score < 81

## CAT 12: Learn & Grow (V8LearnAndGrowBlock)
- Design: `border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50`
- 3 linhas numeradas: whatChanged, beforeAfter, practicalExample
- Último item do timeline

## CAT 13: Tela de Conclusão (V8CompletionScreen)
- Troféu com gradiente indigo-violet
- Stats grid 3 colunas: XP, Moedas, Streak
- CountUp 750ms com delay escalonado
- Confetti condicional (só se avgScore > 0)
- Patent badge com spring animation

## CAT 14: Modal de Avaliação (V8LessonRating)
- 5 estrelas Lucide com hover/active scale
- Textarea 500 chars, upsert no banco
- Thank you auto-close 1.2s

## CAT 15: Mode Selector (V8ModeSelector)
- 2 cards: Ler (BookOpen) / Ouvir (Headphones)
- Hover spring animation
- `unlockAudio()` no iOS

## CAT 16: Gamification & XP (distributed)
- XP por exercício: `registerGamificationEvent` idempotente
- Micro-feedback: badge flutuante `+5 XP` animado
- XP por insight e conclusão
- `playgroundScores` para conditional insight unlock

## CAT 17: Timeline & Dedup (useV8Player)
- Ordem: Section→CompleteSentence→InlineExercise→Playground→Insight→Quiz
- Dedup: inlineExercise tem prioridade sobre quiz legado
- Preload por tipo: 7 tipos de timeline item
- Cleanup: `audio.src = ""` no unmount

## CAT 18: Feedback Wrapper (V8InlineExercise)
- Feedback card: `border-l-4` emerald/amber
- Retry: `exerciseKey` incrementado para remount
- Botões: grid 2 colunas (fail) ou full-width (pass)
- CTA scroll integrado

## CAT 19: Review Gate — Social Proof (V8LessonReviewGate)
- Reviews determinísticos via hash do lessonId (4 de 5)
- CTA delay 3s, label dinâmico
- Bloqueio de fuga (pointerDown + escape)
- Upsell: Crown → /pricing
- Design: gradiente violet→indigo, avatares coloridos
- Animação: cards escalonados 150ms

## CAT 20: Liv Trail Welcome (V8LivTrailWelcome)
- One-time show via localStorage
- Delay abertura 600ms, CTA habilita 2s
- Design Dark: #1F2937→#111827, grid SVG, glow violeta
- 6 partículas flutuantes animadas
- Avatar Liv: borda purple, glow radial pulsante, Sparkles girando
- CTA: gradiente indigo→violet→pink

## CAT 21: Skill Tree (V8SkillTree + V8SkillNode)
- Layout zigzag: pattern [0,1,0,-1], offset 70px, ROW_HEIGHT=160px
- Conectores SVG: Bézier quadrática, cor por estado
- 4 estados visuais: completed, in_progress, available, locked
- Ícones dinâmicos via getLessonIcon(title)
- Spring stiffness 220, delay escalonado

## CAT 22: Trail Card (V8TrailCard)
- V8_ICONS por orderIndex (Compass, MessageSquare, Sparkles, Brain, Palette, Zap, Bot)
- 4 temas accent rotacionando
- Progress bar animada com cor do tema

## CAT 23: Lesson Icon Map (lessonIconMap.ts)
- 27 keyword→ícone mappings
- Fallback: BookOpen
- Usado em: V8LessonCard, V8SkillNode, CourseDetail

## CAT 24: Exercise Error Card (ExerciseErrorCard)
- Card laranja com AlertTriangle
- Detalhes técnicos font-mono
- Link admin sync
- Usado em 6 exercícios como validação defensiva

## CAT 25: Content Parser (v8ContentParser.ts — 542 linhas)
- parseFullContent(): extrai título, descrição, seções, playgrounds, quizzes
- Section 0 auto-criada se conteúdo entre # e ##
- Meta-filter: ignora parser/fix/TODO/FIXME
- Sanitização pedagógica integrada
- Output flags: hasManualExercises, hasManualQuizzes, etc.

---

## Utilitários Transversais
- `v8TextSanitizer.ts` — sanitização de narração
- `v8ScrollUtils.ts` — scroll helpers
- `src/index.css` — hide-scrollbar
- `src/constants/v8Rules.ts` — PASS_SCORE

**Total: 25 categorias, ~35 arquivos.**
