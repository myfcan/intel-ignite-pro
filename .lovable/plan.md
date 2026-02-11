

# Plano Refinado: Correcao 1 (Caption Bleed) + Correcao 2 (Pausa Prematura no Playground)

## Contexto dos Erros (Dados Reais - Run 5622c999, Lesson 837cc44a)

### Erro 1: Legenda vaza texto da proxima cena
- cena-8-cta endTime = 86.104s, mas a palavra "O" de cena-9 comeca em 85.763s
- O componente `V7SynchronizedCaptions` recebe os `wordTimestamps` GLOBAIS (toda a aula)
- Resultado: a legenda mostra "...clique para descobrir O nome do metodo e CLARO"

### Erro 2: Playground para em "vai" ao inves de "CLARO"
- cena-11-playground e um `blockingPhase`
- O `isPlayLocked` (L270-297) retorna `true` imediatamente ao entrar na fase
- O legacy fallback C07.2 (L514-561) detecta a fase como interativa e, se nao encontra pause action no JSON processado, pausa o audio imediatamente
- Resultado: audio para antes do anchor "CLARO" ser atingido

---

## Correcao 1 (Segura e Cirurgica): Filtrar wordTimestamps por fase

**Arquivo:** `V7PhasePlayer.tsx` (linha ~1980)

**O que muda:** Adicionar um `useMemo` que filtra os `wordTimestamps` pelo range temporal da fase atual (`currentPhase.startTime` / `currentPhase.endTime`). Passar o array filtrado ao `V7SynchronizedCaptions`.

**Impacto:** Zero risco. Apenas restringe quais palavras a legenda pode exibir. Nao altera audio, anchors, transitions, lock, ou qualquer outro sistema.

```text
// ANTES (L1980):
wordTimestamps={wordTimestamps}

// DEPOIS:
wordTimestamps={phaseFilteredTimestamps}

// Onde phaseFilteredTimestamps e um useMemo:
const phaseFilteredTimestamps = useMemo(() => {
  if (!currentPhase) return wordTimestamps;
  const start = currentPhase.startTime ?? 0;
  const end = currentPhase.endTime ?? Infinity;
  return wordTimestamps.filter(w => w.start >= start && w.end <= end);
}, [wordTimestamps, currentPhase?.startTime, currentPhase?.endTime]);
```

---

## Correcao 2 (Detalhamento de Seguranca): Audio continua ate o anchor pausar

### Diagnostico Preciso da Cadeia de Eventos

Quando o player entra em `cena-11-playground`, esta cadeia executa:

```text
1. useEffect (L468-507): detecta playground como blockingPhase
   -> isInBlockingPhaseRef.current = true  (CORRETO - impede onComplete)
   -> machineAdapter.lockPhase()           (CORRETO - impede transicao)

2. useEffect C07.2 Legacy Fallback (L514-561):
   -> detecta playground como interativo
   -> verifica hasPauseActionForInteractivePhase
   -> SE false: pausa audio IMEDIATAMENTE (L554-556)  <-- AQUI ESTA O BUG
```

### O Que Realmente Acontece

A variavel `hasPauseActionForInteractivePhase` verifica se existem `pause` actions no array de `anchorActions` da fase atual. Se o JSON foi processado corretamente pelo pipeline C10, a fase playground DEVE ter uma pause action para "CLARO". Portanto:

**Hipotese A:** O pipeline gerou a pause action corretamente, mas o `hasPauseActionForInteractivePhase` nao a detecta (bug de deteccao).
**Hipotese B:** O pipeline nao gerou a pause action para esta fase (bug de pipeline).

### Correcao Segura (Funciona para Ambas as Hipoteses)

**Arquivo:** `V7PhasePlayer.tsx`, useEffect C07.2 (L514-561)

**Principio:** O legacy fallback C07.2 so deve pausar o audio se a fase NAO tiver `anchorText.pauseAt` no JSON de input. Se a fase tem `pauseAt`, o sistema de anchors (useAnchorText) e responsavel por pausar no momento correto. O fallback nao deve interferir.

```text
// ANTES (L526-528):
const interactivePhaseTypes = ['interaction', 'playground', 'quiz'];
const isInteractive = interactivePhaseTypes.includes(currentPhase.type) || 
                      currentPhase.interaction !== undefined;

// DEPOIS - Adicionar guard: se a fase tem anchorText.pauseAt, NAO usar fallback
const hasExplicitPauseAt = !!(currentPhase as any).anchorText?.pauseAt ||
                           currentPhase.scenes?.some((s: any) => s.anchorText?.pauseAt);

if (hasExplicitPauseAt) {
  console.log(`[C07.2] Phase "${currentPhase.id}" has anchorText.pauseAt - anchor system handles pause, skipping fallback`);
  return;
}
```

### Analise de Risco Detalhada

| Cenario | Comportamento ANTES | Comportamento DEPOIS | Seguro? |
|---------|---------------------|----------------------|---------|
| Playground COM pauseAt (ex: "CLARO") | Legacy fallback para audio imediatamente | Audio continua, anchor para em "CLARO" | SIM - comportamento desejado |
| Playground SEM pauseAt (JSON legado) | Legacy fallback para audio imediatamente | Legacy fallback para audio imediatamente (sem mudanca) | SIM - fallback preservado |
| Quiz COM pauseAt (ex: "agora") | Anchor para no momento certo | Anchor para no momento certo (sem mudanca) | SIM |
| Quiz SEM pauseAt (JSON legado) | Legacy fallback para audio | Legacy fallback para audio (sem mudanca) | SIM |
| CTA | Ja tem early-return na L521-523 | Sem mudanca | SIM |

### O Que NAO Muda (Garantias)

1. **`isInBlockingPhaseRef`** - Continua `true` para playground. O `audio.onEnded` continua bloqueado. A aula NAO termina prematuramente.
2. **`machineAdapter.lockPhase()`** - Continua executando. A fase NAO avanca automaticamente.
3. **`isPlayLocked`** - Continua `true` para playground. O usuario NAO pode dar play/pause manual durante a narracao (botao bloqueado).
4. **Anchor system** - `useAnchorText` continua monitorando e vai pausar exatamente em "CLARO" via crossing detection.
5. **Quiz enabled** - So ativa quando `isPausedByAnchor === true` (L568-571). Playground so mostra interacao apos o anchor pausar.

### O Unico Efeito da Mudanca

O audio continua tocando de "No playground voce vai ver a diferenca..." ate "...usando CLARO", e SO ENTAO o anchor crossing detection pausa o audio e habilita a interacao do playground.

---

## Sequencia de Implementacao

1. Adicionar `phaseFilteredTimestamps` useMemo (Correcao 1)
2. Passar `phaseFilteredTimestamps` ao `V7SynchronizedCaptions`
3. Adicionar guard `hasExplicitPauseAt` no useEffect C07.2 (Correcao 2)
4. Log de auditoria para confirmar comportamento

## Arquivo Unico Modificado

`src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`

- ~5 linhas novas para o useMemo do filtro
- ~1 linha alterada na prop do caption
- ~6 linhas novas para o guard do C07.2

Total: ~12 linhas de codigo. Nenhum arquivo novo. Nenhuma mudanca no pipeline.

