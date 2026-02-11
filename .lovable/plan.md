
# Plano Definitivo Completo: 4 Patches Sistemicos V7
# Ordem: A1 -> B1 -> A2 -> C1

---

## CONTEXTO REAL DO CODIGO (Estado Atual Verificado)

### Estado atual de cada ponto de bug:

**V7PhasePlayground.tsx (L57-76)** -- useEffect com `[]` pausa audio no mount:
```text
useEffect(() => {
  const ctrl = audioControlRef.current;
  if (!ctrl) return;
  const pauseAudio = async () => {
    if (ctrl.isPlaying) {
      if (ctrl.pauseWithFade) {
        await ctrl.pauseWithFade(300);
      } else {
        ctrl.pause();
      }
      setAudioPausedByPlayground(true);
      console.log('[V7PhasePlayground] Audio pausado com fade');
    }
  };
  pauseAudio();
}, []);  // <-- BUG: dependency vazio = mount imediato
```

**V7PhasePlayer.tsx (L408-414)** -- phaseFilteredTimestamps filtra por endTime:
```text
const phaseFilteredTimestamps = useMemo(() => {
  if (!currentPhase) return wordTimestamps;
  const start = currentPhase.startTime ?? 0;
  const end = currentPhase.endTime ?? Infinity;
  return wordTimestamps.filter(w => w.start >= start && w.end <= end);
}, [wordTimestamps, currentPhase?.startTime, currentPhase?.endTime]);
```

**V7PhasePlayer.tsx (L1580-1606)** -- Playground renderizado SEM shouldPauseAudio:
```text
<V7PhasePlayground
  challengeTitle={pgTitle}
  challengeSubtitle={pgSubtitle}
  amateurPrompt={pgAmateurPrompt}
  amateurResult={{...}}
  professionalPrompt={pgProfessionalPrompt}
  professionalResult={{...}}
  sceneIndex={currentSceneIndex}
  phaseProgress={phaseProgress}
  onComplete={handlePlaygroundComplete}
  audioControl={audio}
  timeoutConfig={playgroundTimeoutConfig}
  userChallenge={pgUserChallenge}
  lessonId={script.id}
/>
```

**V7PhasePlayer.tsx (L534-542)** -- Guard C07.2 ja existe (do last-diff):
```text
const hasExplicitPauseAt = !!(currentPhase as any).anchorText?.pauseAt ||
                           currentPhase.scenes?.some((s: any) => s.anchorText?.pauseAt);
if (hasExplicitPauseAt) {
  console.log(`[C07.2] Phase "${currentPhase.id}" has anchorText.pauseAt - anchor system handles pause, skipping fallback`);
  return;
}
```
NOTA: Este guard JA impede o fallback C07.2 de interferir quando ha pauseAt. MAS nao resolve o bug do Playground porque o pause vem de DENTRO de V7PhasePlayground.tsx (L57-76), NAO do C07.2.

**V7PhasePlayer.tsx (L565-578)** -- Legacy fallback seta c07AutoPaused:
```text
if (audio.isPlaying) {
  audio.pause();
  console.log(`[LEGACY_FALLBACK_USED] Audio paused for legacy interactive phase`);
}
setC07AutoPaused(true);
c07AutoPauseAppliedRef.current = true;
```

**supabase/functions/v7-vv/index.ts (L5372-5374)** -- findLastKeywordTime com includes:
```text
if (normalizedWord === target ||
    normalizedWord.includes(target) ||
    target.includes(normalizedWord)) {
```

**supabase/functions/v7-vv/index.ts (L5399-5401)** -- findFirstKeywordTime com includes:
```text
if (normalizedWord === target ||
    normalizedWord.includes(target) ||
    target.includes(normalizedWord)) {
```

**supabase/functions/v7-vv/index.ts (L1715)** -- INTERACTIVE_SCENE_TYPES incompleto:
```text
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground'] as const;
```
FALTA: `secret-reveal`. O pipeline em L5443 usa `['interaction', 'playground', 'secret-reveal']` diretamente, causando inconsistencia.

**supabase/functions/v7-vv/index.ts (L2012-2016)** -- pauseAt ausente NAO e bloqueante:
```text
if (isInteractive && !scene.anchorText?.pauseAt) {
  console.log(`[V7-vv:Validate] Cena interativa "${sceneId}" sem pauseAt - sera gerado automaticamente`);
}
```
Apenas loga info. Nao gera erro. Depende de `autoGeneratePauseAt()` (L2043-2071) para gerar automaticamente.

**supabase/functions/v7-vv/index.ts (L2043-2071)** -- autoGeneratePauseAt:
```text
function autoGeneratePauseAt(scenes: ScriptScene[]): void {
  scenes.forEach((scene, index) => {
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
    if (isInteractive && !scene.anchorText?.pauseAt && scene.narration) {
      const words = scene.narration
        .replace(/[.,!?;:'"()[\]{}...]+/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2);
      if (words.length > 0) {
        const lastWord = words[words.length - 1];
        if (!scene.anchorText) { scene.anchorText = {}; }
        scene.anchorText.pauseAt = lastWord;
      }
    }
  });
}
```
NOTA: Funciona como fallback, mas tem filtro `w.length > 2` que pode pular palavras curtas. E usa `INTERACTIVE_SCENE_TYPES` (que NAO inclui `secret-reveal`).

**supabase/functions/v7-vv/index.ts (L5508-5530)** -- Calculo de endTime:
```text
if (narrationEndTime !== null) {
  const baseEndTime = narrationEndTime + 0.3;
  if (isInteractive && pauseKeywordTime !== null) {
    const minEndForPause = pauseKeywordTime + 0.5;
    calculatedEndTime = Math.max(baseEndTime, minEndForPause);
  } else {
    calculatedEndTime = baseEndTime;
  }
}
```
NOTA: `narrationEndTime` vem de `findNarrationEndTime()` (L5411-5438) que usa `findLastKeywordTime()` -- portanto herda o bug do `.includes()`.

**supabase/functions/v7-vv/index.ts (L5766-5806)** -- Fail-hard JA EXISTE:
```text
const validationErrors = validateInput(input);
if (validationErrors.length > 0) {
  // ... retorna HTTP 400 com JSON estruturado
  return new Response(
    JSON.stringify({ success: false, error: 'JSON invalido', ... }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```
NOTA: O fail-hard funciona. Basta adicionar novas regras a `validateInput()` e elas serao bloqueantes automaticamente.

**v7-phase-contracts.ts (L254-276)** -- V7PhasePlaygroundProps NAO tem shouldPauseAudio:
```text
export interface V7PhasePlaygroundProps extends V7PhaseWithCompletion {
  challengeTitle: string;
  challengeSubtitle?: string;
  amateurPrompt: string;
  amateurResult: V7PlaygroundResult;
  professionalPrompt: string;
  professionalResult: V7PlaygroundResult;
  userChallenge?: V7UserChallenge;
  lessonId?: string;
  timeoutConfig?: {
    perStep: number;
    hints: string[];
  };
}
```

---

## PATCH A1: Playground NAO pausa no mount

### Objetivo
Eliminar o corte prematuro de audio quando o playground monta. O audio so deve pausar quando:
- O anchor system (useAnchorText) detectar a keyword de pausa (isPausedByAnchor=true), OU
- O fallback legado C07 sinalizar (c07AutoPaused=true)

### Arquivo 1: `src/components/lessons/v7/v7-phase-contracts.ts`

**Localizacao:** L254-276 (interface V7PhasePlaygroundProps)

**Mudanca:** Adicionar `shouldPauseAudio?: boolean` na interface

**Antes (L254-276):**
```text
export interface V7PhasePlaygroundProps extends V7PhaseWithCompletion {
  challengeTitle: string;
  challengeSubtitle?: string;
  amateurPrompt: string;
  amateurResult: V7PlaygroundResult;
  professionalPrompt: string;
  professionalResult: V7PlaygroundResult;
  userChallenge?: V7UserChallenge;
  lessonId?: string;
  timeoutConfig?: {
    perStep: number;
    hints: string[];
  };
}
```

**Depois:**
```text
export interface V7PhasePlaygroundProps extends V7PhaseWithCompletion {
  challengeTitle: string;
  challengeSubtitle?: string;
  amateurPrompt: string;
  amateurResult: V7PlaygroundResult;
  professionalPrompt: string;
  professionalResult: V7PlaygroundResult;
  userChallenge?: V7UserChallenge;
  lessonId?: string;
  timeoutConfig?: {
    perStep: number;
    hints: string[];
  };
  /** Sinaliza que o audio deve ser pausado (anchor system OU fallback legado) */
  shouldPauseAudio?: boolean;
}
```

### Arquivo 2: `src/components/lessons/v7/cinematic/phases/V7PhasePlayground.tsx`

**Mudanca 1 -- Desestruturacao de props (L23-42):**

Adicionar `shouldPauseAudio = false` na desestruturacao. Linha exata: apos `lessonId` (L41).

**Antes (L23-42):**
```text
export const V7PhasePlayground = ({
  challengeTitle,
  challengeSubtitle,
  amateurPrompt,
  amateurResult,
  professionalPrompt,
  professionalResult,
  onComplete,
  audioControl,
  timeoutConfig = {
    perStep: 10,
    hints: [
      'Clique no botao para continuar...',
      'Nao se apresse, analise com calma...',
      'Perceba a diferenca na estrutura...'
    ]
  },
  userChallenge,
  lessonId
}: V7PhasePlaygroundProps) => {
```

**Depois (L23-43):**
```text
export const V7PhasePlayground = ({
  challengeTitle,
  challengeSubtitle,
  amateurPrompt,
  amateurResult,
  professionalPrompt,
  professionalResult,
  onComplete,
  audioControl,
  timeoutConfig = {
    perStep: 10,
    hints: [
      'Clique no botao para continuar...',
      'Nao se apresse, analise com calma...',
      'Perceba a diferenca na estrutura...'
    ]
  },
  userChallenge,
  lessonId,
  shouldPauseAudio = false
}: V7PhasePlaygroundProps) => {
```

**Mudanca 2 -- useEffect de pausa (L57-76):**

Substituir integralmente por useEffect condicionado a `shouldPauseAudio`.

**Antes (L57-76):**
```text
useEffect(() => {
  const ctrl = audioControlRef.current;
  if (!ctrl) return;
  const pauseAudio = async () => {
    if (ctrl.isPlaying) {
      if (ctrl.pauseWithFade) {
        await ctrl.pauseWithFade(300);
      } else {
        ctrl.pause();
      }
      setAudioPausedByPlayground(true);
      console.log('[V7PhasePlayground] Audio pausado com fade');
    }
  };
  pauseAudio();
}, []);
```

**Depois (L57-76):**
```text
useEffect(() => {
  const ctrl = audioControlRef.current;
  if (!ctrl) return;
  // So pausar quando anchor system OU fallback legado sinalizar
  if (!shouldPauseAudio) return;
  const pauseAudio = async () => {
    if (ctrl.isPlaying) {
      if (ctrl.pauseWithFade) {
        await ctrl.pauseWithFade(300);
      } else {
        ctrl.pause();
      }
      setAudioPausedByPlayground(true);
      console.log('[V7PhasePlayground] Audio pausado por anchor/fallback (shouldPauseAudio=true)');
    }
  };
  pauseAudio();
}, [shouldPauseAudio]);
```

**Por que `[shouldPauseAudio]` e nao `[]`:**
- Quando o playground monta, `shouldPauseAudio` e `false` (anchor ainda nao disparou). O `if (!shouldPauseAudio) return` impede o pause.
- Quando o anchor crossing detection dispara (palavra "CLARO" atingida), `isPausedByAnchor` vira `true` no player, que recalcula `shouldPauseAudio = true`, passa a nova prop, e o useEffect re-executa e pausa.
- Para JSON legado sem anchors: o C07.2 fallback (L566-578 do V7PhasePlayer) seta `c07AutoPaused=true`, que tambem faz `shouldPauseAudio=true`.

### Arquivo 3: `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`

**Mudanca -- Renderizacao do Playground (L1580-1606):**

Adicionar prop `shouldPauseAudio`.

**Antes (L1580-1606):**
```text
<V7PhasePlayground
  challengeTitle={pgTitle}
  challengeSubtitle={pgSubtitle}
  amateurPrompt={pgAmateurPrompt}
  amateurResult={{
    title: 'Resultado Amador',
    content: typeof pgAmateurResultText === 'string' ? pgAmateurResultText : JSON.stringify(pgAmateurResultText),
    score: pgAmateurScore,
    maxScore: pgMaxScore,
    verdict: getPlaygroundVerdict(pgAmateurScore)
  }}
  professionalPrompt={pgProfessionalPrompt}
  professionalResult={{
    title: 'Resultado Profissional',
    content: typeof pgProfessionalResultText === 'string' ? pgProfessionalResultText : JSON.stringify(pgProfessionalResultText),
    score: pgProfessionalScore,
    maxScore: pgMaxScore,
    verdict: getPlaygroundVerdict(pgProfessionalScore)
  }}
  sceneIndex={currentSceneIndex}
  phaseProgress={phaseProgress}
  onComplete={handlePlaygroundComplete}
  audioControl={audio}
  timeoutConfig={playgroundTimeoutConfig}
  userChallenge={pgUserChallenge}
  lessonId={script.id}
/>
```

**Depois:**
```text
<V7PhasePlayground
  challengeTitle={pgTitle}
  challengeSubtitle={pgSubtitle}
  amateurPrompt={pgAmateurPrompt}
  amateurResult={{
    title: 'Resultado Amador',
    content: typeof pgAmateurResultText === 'string' ? pgAmateurResultText : JSON.stringify(pgAmateurResultText),
    score: pgAmateurScore,
    maxScore: pgMaxScore,
    verdict: getPlaygroundVerdict(pgAmateurScore)
  }}
  professionalPrompt={pgProfessionalPrompt}
  professionalResult={{
    title: 'Resultado Profissional',
    content: typeof pgProfessionalResultText === 'string' ? pgProfessionalResultText : JSON.stringify(pgProfessionalResultText),
    score: pgProfessionalScore,
    maxScore: pgMaxScore,
    verdict: getPlaygroundVerdict(pgProfessionalScore)
  }}
  sceneIndex={currentSceneIndex}
  phaseProgress={phaseProgress}
  onComplete={handlePlaygroundComplete}
  audioControl={audio}
  timeoutConfig={playgroundTimeoutConfig}
  userChallenge={pgUserChallenge}
  lessonId={script.id}
  shouldPauseAudio={Boolean(isPausedByAnchor || c07AutoPaused)}
/>
```

**Unica linha adicionada:** `shouldPauseAudio={Boolean(isPausedByAnchor || c07AutoPaused)}`

**Analise de cenarios:**
| Cenario | isPausedByAnchor | c07AutoPaused | shouldPauseAudio | Resultado |
|---------|------------------|---------------|-------------------|-----------|
| JSON C10 com pauseAt "CLARO" | false no mount, true apos anchor | false | false -> true | Audio toca ate "CLARO", depois pausa |
| JSON legado sem pauseAt/anchors | false | true (via C07.2 L577) | true | Pausa imediata via fallback legado |
| JSON C10 onde anchor falha | false | false -> true (fallback C07.2 assume) | true | Fallback pausa como safety net |

---

## PATCH B1: Match exato no pipeline (Edge Function)

### Objetivo
Eliminar matches falsos causados por `.includes()`. Exemplo real: target="descobrir" casava com "O" porque `target.includes("o")` = true.

### Arquivo: `supabase/functions/v7-vv/index.ts`

### Mudanca 1 -- findLastKeywordTime (L5372-5374)

**Antes:**
```text
      if (normalizedWord === target ||
          normalizedWord.includes(target) ||
          target.includes(normalizedWord)) {
```

**Depois:**
```text
      if (normalizedWord === target) {
```

### Mudanca 2 -- findFirstKeywordTime (L5399-5401)

**Antes:**
```text
      if (normalizedWord === target ||
          normalizedWord.includes(target) ||
          target.includes(normalizedWord)) {
```

**Depois:**
```text
      if (normalizedWord === target) {
```

### Impacto cascata (B2 resolvido automaticamente):
- `findNarrationEndTime()` (L5411-5438) usa `findLastKeywordTime()` internamente
- Apos B1, `findNarrationEndTime()` vai encontrar a palavra REAL (ex: "descobrir" end=85.554, nao "O" end=85.983)
- O calculo de `baseEndTime = narrationEndTime + 0.3` (L5518) produzira 85.854 em vez de 86.283
- O calculo de `minEndForPause = pauseKeywordTime + 0.5` (L5524) usara o keywordTime CORRETO
- Resultado: boundaries de fase ficam precisos sem mudanca adicional

### Risco:
- Se uma keyword de 1-2 caracteres for usada (ex: "ja"), o match exato pode falhar se o TTS normalizar diferente. Porem: PATCH C1 exige pauseAt como ultima palavra com >2 chars, eliminando esse risco.

---

## PATCH A2: Caption anti-bleed via pause anchor real

### Objetivo
Captions nunca mostram palavras da proxima cena, mesmo se o pipeline tiver gerado boundaries imprecisos. O renderer reencontra a keyword de pausa nos wordTimestamps e usa como cutoff.

### Arquivo: `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`

### Mudanca -- phaseFilteredTimestamps useMemo (L408-414)

**Antes (L408-414):**
```text
  const phaseFilteredTimestamps = useMemo(() => {
    if (!currentPhase) return wordTimestamps;
    const start = currentPhase.startTime ?? 0;
    const end = currentPhase.endTime ?? Infinity;
    return wordTimestamps.filter(w => w.start >= start && w.end <= end);
  }, [wordTimestamps, currentPhase?.startTime, currentPhase?.endTime]);
```

**Depois:**
```text
  const phaseFilteredTimestamps = useMemo(() => {
    if (!currentPhase) return wordTimestamps;
    const start = currentPhase.startTime ?? 0;
    const endFallback = currentPhase.endTime ?? Infinity;

    // Buscar pause action da fase para cutoff preciso
    const pauseAction = (currentPhase as any).anchorActions?.find(
      (a: any) => a.type === 'pause'
    );
    const pauseKeyword = pauseAction?.keyword;

    let captionEnd = endFallback;

    if (pauseKeyword) {
      // Normalizacao consistente (mesma do pipeline: lower + remove acento + remove pontuacao)
      const norm = (s: string) =>
        s.toLowerCase().normalize('NFD')
         .replace(/[\u0300-\u036f]/g, '')
         .replace(/[.,!?;:'"()\[\]{}]/g, '')
         .trim();

      const kw = norm(pauseKeyword);
      // ULTIMA ocorrencia da keyword DENTRO do range da fase
      const inRange = wordTimestamps.filter(
        w => w.start >= start && w.end <= endFallback
      );
      const matched = [...inRange].reverse().find(w => norm(w.word) === kw);
      if (matched) {
        // Micro-margem 0.02s (nao 0.05 -- evita puxar token colado)
        captionEnd = matched.end + 0.02;
        console.log(`[CaptionFilter] Phase "${currentPhase.id}": cutoff by anchor "${pauseKeyword}" at ${matched.end.toFixed(3)}s`);
      } else {
        console.warn(`[CaptionFilter] Phase "${currentPhase.id}": keyword "${pauseKeyword}" not found in range, using endTime fallback`);
      }
    }

    return wordTimestamps.filter(w => w.start >= start && w.end <= captionEnd);
  }, [wordTimestamps, currentPhase?.startTime, currentPhase?.endTime,
      currentPhase?.anchorActions]);
```

### Logica para cena-8-cta (exemplo real):
1. `pauseAction` = anchor com type='pause', keyword='descobrir'
2. `norm('descobrir')` = 'descobrir'
3. `inRange` = palavras com start >= 79.927 e end <= 86.104
4. `matched` = ultima palavra normalizada como 'descobrir' = word com end=85.554
5. `captionEnd` = 85.554 + 0.02 = 85.574
6. Filtro: "descobrir" end=85.554 <= 85.574 = INCLUIDO. "O" end=85.983 <= 85.574 = EXCLUIDO.

### Nota sobre dependencia anchorActions no useMemo:
`currentPhase?.anchorActions` e referencia a objeto. Se causar re-renders excessivos, extrair `pauseKeyword` como string derivada e usar como dependencia. NAO e critico para a correcao -- monitorar apos deploy.

### Fases SEM pause anchor (narrativas, dramaticas, etc.):
- `pauseKeyword` sera `undefined`
- `captionEnd` = `endFallback` (currentPhase.endTime)
- Comportamento identico ao atual -- zero regressao

---

## PATCH C1: Validacao bloqueante pre-TTS (Edge Function)

### Objetivo
Bloquear JSONs invalidos ANTES de consumir TTS/ElevenLabs. Erros claros e acionaveis via HTTP 400.

### Arquivo: `supabase/functions/v7-vv/index.ts`

### Mudanca 1 -- Corrigir INTERACTIVE_SCENE_TYPES (L1715)

**Antes (L1715):**
```text
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground'] as const;
```

**Depois:**
```text
const INTERACTIVE_SCENE_TYPES = ['interaction', 'playground', 'secret-reveal'] as const;
```

**Por que:** O pipeline em L5443 ja usa `['interaction', 'playground', 'secret-reveal']` como literal. A constante em L1715 esta desalinhada. Isso faz com que `secret-reveal` nao seja validado como interativo, nao receba autoGeneratePauseAt, etc.

### Mudanca 2 -- Validacao bloqueante de pauseAt dentro de validateInput() (L2011-2017)

**Antes (L2011-2017):**
```text
    // 2.6 Log de cena interativa (NAO mais erro se falta pauseAt - sera gerado)
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
    if (isInteractive && !scene.anchorText?.pauseAt) {
      console.log(`[V7-vv:Validate] Cena interativa "${sceneId}" sem pauseAt - sera gerado automaticamente`);
    }
  });
```

**Depois:**
```text
    // 2.6 PREFLIGHT BLOQUEANTE para cenas interativas
    const isInteractive = INTERACTIVE_SCENE_TYPES.includes(scene.type as any);
    if (isInteractive) {
      // Regra 1: pauseAt OBRIGATORIO em cenas interativas
      if (!scene.anchorText?.pauseAt) {
        errors.push({
          scene: sceneId,
          field: 'anchorText.pauseAt',
          message: `Cena interativa "${sceneId}" DEVE ter anchorText.pauseAt`,
          severity: 'error'
        });
      } else {
        const pauseAt = scene.anchorText.pauseAt.trim();
        const narration = scene.narration?.trim() || '';

        // Regra 2: pauseAt deve existir literalmente na narracao
        const normNarr = narration.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normPause = pauseAt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!normNarr.includes(normPause)) {
          errors.push({
            scene: sceneId,
            field: 'anchorText.pauseAt',
            message: `pauseAt "${pauseAt}" NAO existe na narracao de "${sceneId}"`,
            severity: 'error'
          });
        }

        // Regra 3: pauseAt deve ser EXATAMENTE 1 palavra
        const pauseWords = pauseAt.split(/\s+/);
        if (pauseWords.length > 1) {
          errors.push({
            scene: sceneId,
            field: 'anchorText.pauseAt',
            message: `pauseAt deve ser 1 palavra, recebeu ${pauseWords.length}: "${pauseAt}"`,
            severity: 'error'
          });
        } else {
          // Regra 4: pauseAt deve ser a ULTIMA PALAVRA da narracao
          const narrWords = narration
            .replace(/[.,!?;:'"()\[\]{}…\-–—]/g, '')
            .trim().split(/\s+/).filter(w => w.length > 0);
          const lastWord = narrWords[narrWords.length - 1] || '';
          const normLast = lastWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (normLast !== normPause) {
            errors.push({
              scene: sceneId,
              field: 'anchorText.pauseAt',
              message: `pauseAt "${pauseAt}" NAO e a ultima palavra da narracao (ultima: "${lastWord}")`,
              severity: 'error'
            });
          }
        }
      }
    }
  });
```

### Mudanca 3 -- Unicidade de pauseAt entre cenas interativas (apos o forEach, antes de L2019)

Inserir ENTRE o `});` do forEach (novo L2017) e o bloco `// 3. LOG RESULTADO` (L2019):

```text
  // Regra 5: pauseAt NAO pode ser ambiguo (repetido entre cenas interativas)
  const pauseAtMap: Record<string, string[]> = {};
  input.scenes.forEach((scene, idx) => {
    if (!INTERACTIVE_SCENE_TYPES.includes(scene.type as any)) return;
    const p = scene.anchorText?.pauseAt?.trim();
    if (!p) return;
    const normP = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    pauseAtMap[normP] = pauseAtMap[normP] || [];
    pauseAtMap[normP].push(scene.id || `scene-${idx + 1}`);
  });
  for (const [kw, ids] of Object.entries(pauseAtMap)) {
    if (ids.length > 1) {
      errors.push({
        scene: ids.join(', '),
        field: 'anchorText.pauseAt',
        message: `pauseAt "${kw}" repetido em ${ids.length} cenas interativas: ${ids.join(', ')}`,
        severity: 'error'
      });
    }
  }
```

### Fail-hard: JA EXISTE (L5766-5806)

O `validateInput()` retorna `errors.filter(e => e.severity === 'error')`. Se array nao vazio, o handler em L5766-5806 retorna HTTP 400 com JSON estruturado e grava status 'failed' em pipeline_executions. NAO precisa de codigo adicional para fail-hard.

### INTERACTIVE_SCENE_TYPES: declarado em L1715 (topo do modulo), usado em:
- `validateInput()` (L2013) -- validacao
- `autoGeneratePauseAt()` (L2047) -- auto-geracao
- Novo bloco de unicidade (apos forEach)
- Zero problema de escopo -- a constante e acessivel em todos esses pontos.

### O que acontece com `autoGeneratePauseAt()` (L2043-2071) apos PATCH C1:
- Se o JSON vem COM pauseAt explicitado, a validacao aplica as 5 regras e bloqueia se invalido.
- Se o JSON vem SEM pauseAt em cena interativa, a Regra 1 bloqueia com erro ANTES de `autoGeneratePauseAt()` ser chamada.
- Resultado: `autoGeneratePauseAt()` so servira para cenas que NAO sao interativas ou que ja passaram pela validacao. Na pratica, cenas interativas SEMPRE precisarao de pauseAt explicito no JSON.
- Isso e o comportamento desejado: pauseAt determinisico, nunca auto-gerado para interativas.

---

## RESUMO COMPLETO DE ARQUIVOS ALTERADOS

| # | Arquivo | Patch | Linhas afetadas | O que muda |
|---|---------|-------|-----------------|------------|
| 1 | `src/components/lessons/v7/v7-phase-contracts.ts` | A1 | L254-276 | Adiciona `shouldPauseAudio?: boolean` na interface |
| 2 | `src/components/lessons/v7/cinematic/phases/V7PhasePlayground.tsx` | A1 | L23-42 (prop), L57-76 (useEffect) | Aceita prop, condiciona pause |
| 3 | `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` | A1+A2 | L408-414 (caption useMemo), L1580-1606 (prop Playground) | Caption anti-bleed + passa shouldPauseAudio |
| 4 | `supabase/functions/v7-vv/index.ts` | B1+C1 | L1715 (types), L2011-2017 (validacao), inserir unicidade apos L2017, L5372-5374 (findLast), L5399-5401 (findFirst) | Match exato + validacao bloqueante |

## CHECKLIST DE SEGURANCA PRE-IMPLEMENTACAO

| Item | Status | Evidencia |
|------|--------|-----------|
| INTERACTIVE_SCENE_TYPES alinhado com pipeline | Corrigido em C1 | L1715 passa a incluir 'secret-reveal' |
| INTERACTIVE_SCENE_TYPES declarado fora de loops | Ja esta (L1715) | Topo do modulo, acessivel em validateInput, autoGeneratePauseAt, unicidade |
| Fail-hard existe | Ja existe (L5766-5806) | Novas regras em validateInput sao automaticamente bloqueantes |
| Fallback legado funciona | Garantido | shouldPauseAudio = isPausedByAnchor OR c07AutoPaused |
| Caption fallback para fases sem anchor | Garantido | Se pauseKeyword undefined, captionEnd = endFallback |
| Guard C07.2 (L534-542) nao conflita com A1 | Compativel | C07.2 impede fallback quando ha pauseAt. A1 impede pause no mount. Ambos complementares |
| autoGeneratePauseAt nao conflita com C1 | Compativel | C1 bloqueia interativas sem pauseAt antes de autoGenerate ser chamado |
| useMemo anchorActions instabilidade | Monitorar | Se re-renders excessivos, extrair pauseKeyword string como dependencia |

## O QUE NAO MUDA (garantias de zero regressao)

1. `useAnchorText.ts` -- zero alteracao. Crossing detection inalterado.
2. `V7SynchronizedCaptions` -- zero alteracao. Recebe array ja filtrado.
3. `V7PhaseQuiz` -- nao afetado. Quiz usa isPausedByAnchor/c07AutoPaused via outro mecanismo.
4. Fases narrativas/dramaticas -- sem pause anchor, caption filtra por endTime (comportamento atual).
5. `findNarrationEndTime()` -- nao alterada diretamente, mas beneficiada por B1 (usa findLastKeywordTime corrigido).
6. Pipeline execution state contract -- nao alterado. Fail-hard ja persiste status 'failed' em pipeline_executions.

## POS-IMPLEMENTACAO (Verificacao obrigatoria)

1. Deploy automatico do Edge Function apos salvar index.ts
2. Testar renderer com aula 837cc44a existente (verificar A1 + A2):
   - Playground: narration toca ate "CLARO" antes de pausar
   - Caption cena-8: NAO mostra "O"
3. Reprocessar aula com pipeline corrigido (verificar B1 + C1):
   - keywordTime de "descobrir" deve ser ~85.554 (nao 85.983)
   - endTime de cena-8 deve ser ~85.854 (nao 86.104)
4. Testar JSON invalido (C1):
   - JSON sem pauseAt em interativa: HTTP 400 com error_code VALIDATION_ERROR
   - JSON com pauseAt que nao e ultima palavra: HTTP 400
   - JSON com pauseAt repetido: HTTP 400
5. Validar 2-3 JSONs diferentes para confirmar robustez sistemica
