

# Auditoria Completa do Sistema V8 — Inventario e Estado Atual

## 1. Inventario Completo de Ativos V8

### Frontend — Componentes (13 arquivos)

| Arquivo | Funcao | Estado |
|---------|--------|--------|
| `V8LessonPlayer.tsx` | Orquestrador principal (rolo continuo, timeline, fases) | OK |
| `V8ContentSection.tsx` | Renderizador de secao (titulo, imagem trimmed, markdown) | OK |
| `V8AudioPlayer.tsx` | Player de audio por secao (play/pause, seek, speed) | OK |
| `V8ModeSelector.tsx` | Tela de selecao Ler/Ouvir + unlockAudio | OK |
| `V8QuizInline.tsx` | Quiz mid-lesson com SFX e feedback narrado | OK |
| `V8PlaygroundInline.tsx` | Playground mid-lesson (6 fases, avaliacao IA, badges) | OK |
| `V8Header.tsx` | Header fixo com progresso, report button, nav | OK |
| `V8ReportButton.tsx` | Botao de report com Portal (escapa stacking context) | OK |
| `V8CompletionScreen.tsx` | Tela final (gamificacao, confetti, XP/moedas/streak) | OK |
| `V8SkillTree.tsx` | Arvore zigzag de progressao na trilha | OK |
| `V8SkillNode.tsx` | Node individual da skill tree | OK |
| `V8LessonCard.tsx` | Card de aula na listagem | OK |
| `V8TrailCard.tsx` | Card de trilha V8 | OK |
| `v8ScrollUtils.ts` | Utilitarios de scroll deterministico | OK |
| `V8CertificateCard.tsx` | Card de certificado (pos-trilha) | OK |

### Frontend — Tipos e Hooks (2 arquivos)

| Arquivo | Funcao | Estado |
|---------|--------|--------|
| `src/types/v8Lesson.ts` | Tipos canonicos (V8Section, V8InlineQuiz, V8InlinePlayground, V8LessonData, V8PlayerState) | OK |
| `src/hooks/useV8Player.ts` | State machine (timeline, fases, navegacao) | OK |

### Frontend — Paginas (3 arquivos)

| Arquivo | Funcao | Estado |
|---------|--------|--------|
| `src/pages/V8Lesson.tsx` | Pagina de aula (fetch, progress, renderizacao) | OK |
| `src/pages/V8TrailDetail.tsx` | Detalhe da trilha V8 | OK |
| `src/pages/AdminV8Create.tsx` | Wizard de criacao de aula V8 (admin) | OK |

### Backend — Edge Functions (4 funcoes)

| Funcao | Proposito | Estado |
|--------|-----------|--------|
| `v8-generate` | Gera audios (secoes, quizzes, playgrounds) via ElevenLabs | OK |
| `v8-evaluate-prompt` | Avalia prompts do usuario via Lovable AI | OK |
| `v8-generate-section-image` | Gera imagens por secao (contrato visual 1024x1024) | OK |
| `v8-reprocess-lesson-images` | Reprocessamento em lote de imagens | OK |

### Backend — Admin Components (1 arquivo)

| Arquivo | Funcao | Estado |
|---------|--------|--------|
| `src/components/admin/V8SectionSetup.tsx` | Setup wizard de secoes (imagens, config) | OK |

### Database — Tabela dedicada (1)

| Tabela | Proposito | RLS |
|--------|-----------|-----|
| `lesson_reports` | Reports de erro por usuarios | INSERT para auth.uid(), SELECT own, ALL admin |

### Database — Tabelas compartilhadas

| Tabela | Uso V8 |
|--------|--------|
| `lessons` | Armazena content JSONB (contentVersion: 'v8') |
| `trails` | trail_type = 'v8' |
| `user_progress` | Progresso do usuario |
| `user_gamification_events` | Eventos de gamificacao |
| `user_streaks` | Streak de atividade |

---

## 2. Auditoria de Qualidade — Problemas Encontrados

### CRITICO (0 problemas)
Nenhum problema critico encontrado. O sistema esta funcional.

### MEDIO (3 itens)

**M1: V8Lesson.tsx — background dark em loading/error (inconsistencia visual)**
As telas de loading e erro usam `bg-slate-950` (dark mode), enquanto o V8 segue o padrao Premium Light (`bg-white`). Inconsistencia visual quando o usuario entra e sai da aula.

**M2: V8Lesson.tsx — saveProgress nao trata lesson_id como UUID**
O `user_progress.lesson_id` e do tipo UUID, mas o `lessonId` do URL params e uma string. Se alguem acessar com um ID invalido, o insert falhara silenciosamente.

**M3: V8PlaygroundInline.tsx — playSound nao listado no array de deps do useCallback**
Na linha 131, `handleEvaluate` usa `playSound` mas nao o inclui no array de dependencias do `useCallback`. Isso pode causar chamadas stale se o hook for reinstanciado.

### BAIXO (4 itens)

**B1: V8AudioPlayer.tsx — autoPlay useEffect tem dep stale**
`onPlay` esta no array de deps do `useEffect` de autoPlay (linha 88), o que pode causar re-triggers desnecessarios se o callback nao for memoizado pelo pai.

**B2: V8QuizInline.tsx — playSound nao no array de deps do handleConfirm**
Mesmo problema que M3 — `playSound` esta ausente do array de dependencias.

**B3: V8ReportButton.tsx — cast `as any` no insert**
Usa `from("lesson_reports" as any)` e `as any` no objeto de insert. Isso indica que os tipos do Supabase podem nao ter sido regenerados apos a migracao.

**B4: V8CompletionScreen.tsx — saveProgress e useEffect sem lessonId no deps**
O `register` dentro do useEffect chama `registerGamificationEvent` com `lessonId`, mas o deps array ja inclui `lessonId` — OK. Porem o `hasSavedProgress.current` nao protege contra rerenders com lessonId diferente.

---

## 3. Plano de Correcoes

### Passo 1: Corrigir inconsistencia visual (M1)
**Arquivo:** `src/pages/V8Lesson.tsx`
- Trocar `bg-slate-950` por `bg-white` nas telas de loading e erro
- Trocar `text-white` por `text-slate-900` e `text-slate-400` adequados

### Passo 2: Adicionar playSound aos deps dos useCallbacks (M3, B2)
**Arquivos:** `V8PlaygroundInline.tsx`, `V8QuizInline.tsx`
- Adicionar `playSound` ao array de deps dos useCallbacks relevantes

### Passo 3: Remover `as any` do ReportButton (B3)
**Arquivo:** `V8ReportButton.tsx`
- Verificar se `lesson_reports` ja esta nos tipos gerados
- Se sim, remover os casts `as any`

### Passo 4: Estabilizar autoPlay deps (B1)
**Arquivo:** `V8AudioPlayer.tsx`
- Remover `onPlay` do array de deps do autoPlay useEffect (ou memoizar no pai)

---

## 4. Resumo Executivo

| Categoria | Total | Critico | Medio | Baixo |
|-----------|-------|---------|-------|-------|
| Componentes Frontend | 15 | 0 | 1 | 2 |
| Paginas | 3 | 0 | 1 | 0 |
| Edge Functions | 4 | 0 | 0 | 0 |
| Hooks/Tipos | 2 | 0 | 0 | 0 |
| Database | 1 | 0 | 0 | 1 |
| **Total** | **25 ativos** | **0** | **2** | **3** |

**Veredicto: Sistema V8 esta operacional e estavel.** As correcoes identificadas sao de polish (consistencia visual e higiene de deps). Nenhum bug bloqueante ou risco de seguranca encontrado.

### O que sera corrigido na implementacao:
1. Background dark -> Premium Light nas telas de loading/erro
2. Deps arrays dos useCallbacks com playSound
3. Remocao dos `as any` no ReportButton
4. Estabilizacao do autoPlay useEffect

