
# Plano de Correção: Renderização do PERFEITO Letter-Reveal

## Diagnóstico Técnico Confirmado

### O que está CORRETO
| Componente | Status | Detalhe |
|------------|--------|---------|
| JSON no banco | ✅ | `cena-9-perfeito` tem `visual.type: "letter-reveal"` e `visual.content.word: "PERFEITO"` |
| useV7PhaseScript.ts | ✅ | Linha 481: `phases: phasesArray` - passa direto sem perder campo `visual` |
| Propagação de dados | ✅ | `scaleScriptToAudioDuration` usa spread operator que preserva `visual` |

### O que está INCORRETO
| Problema | Localização | Causa |
|----------|-------------|-------|
| Detecção case-sensitive | Linha 1610-1612 | `visual.content.word` é `"PERFEITO"` (maiúsculo) mas comparação usa `.toLowerCase() === 'perfeito'` |
| Dados hardcoded | V7PhasePERFEITOSynced linhas 24-33 | Componente ignora `visual.content.letters` do banco e usa array fixo |
| Falta de fallback | Linha 1632-1650 | Se detecção falha, não há log de erro antes do fallback CTA |

## Arquivos a Modificar

```text
src/components/lessons/v7/cinematic/V7PhasePlayer.tsx
```

## Correções Necessárias

### Correção 1: Adicionar Log Diagnóstico Antes da Decisão

Arquivo: `V7PhasePlayer.tsx`, dentro do `case 'revelation':` (~linha 1620)

Adicionar log detalhado para capturar exatamente o que está sendo recebido:

```typescript
console.log('[V7PhasePlayer] 🔴 REVELATION FULL DEBUG:', {
  phaseId: currentPhase.id,
  phaseType: currentPhase.type,
  phaseTitle: currentPhase.title,
  // Check visual object
  hasVisual: !!(currentPhase as any).visual,
  visualType: (currentPhase as any).visual?.type,
  visualWord: (currentPhase as any).visual?.content?.word,
  // Check detection results
  isPerfeitoByTitle,
  isPerfeitoByVisualType,
  isPerfeitoByVisualWord,
  isPerfeitoBySceneContent,
  shouldRenderLetterReveal,
  // Raw visual for inspection
  rawVisual: JSON.stringify((currentPhase as any).visual || {}).slice(0, 300),
});
```

### Correção 2: Expandir Detecção com Mais Fontes

Adicionar verificações adicionais para garantir detecção robusta:

```typescript
// ✅ V7-v51: Detecção adicional por phase.id
const isPerfeitoByPhaseId = currentPhase.id?.toLowerCase().includes('perfeito');

// ✅ V7-v51: Detecção por visual.content.letters (array de letras)
const hasLettersArray = Array.isArray((currentPhase as any).visual?.content?.letters);

// ✅ UNIFIED DETECTION - qualquer sinal positivo = renderizar V7PhasePERFEITOSynced
const shouldRenderLetterReveal = 
  isPerfeitoByVisualType || 
  isPerfeitoByTitle || 
  isPerfeitoByVisualWord || 
  isPerfeitoBySceneContent ||
  isPerfeitoByPhaseId ||      // NOVO
  hasLettersArray;            // NOVO
```

### Correção 3: Passar Dados do Banco para o Componente

Modificar a chamada do `V7PhasePERFEITOSynced` para usar dados do banco:

```typescript
if (shouldRenderLetterReveal) {
  // ✅ V7-v51: Extrair dados do visual.content do banco
  const visualContent = (currentPhase as any).visual?.content || {};
  const lettersFromDB = visualContent.letters || [];
  
  console.log('[V7PhasePlayer] ✅ RENDERING V7PhasePERFEITOSynced:', {
    word: visualContent.word,
    lettersCount: lettersFromDB.length,
    finalStamp: visualContent.finalStamp,
  });
  
  return (
    <V7PhasePERFEITOSynced
      wordTimestamps={wordTimestamps}
      currentTime={audio.currentTime}
      isPlaying={audio.isPlaying}
      // ✅ NOVO: Passar dados do banco
      lettersData={lettersFromDB}
      word={visualContent.word || 'PERFEITO'}
      finalStamp={visualContent.finalStamp}
      onComplete={() => {
        console.log('[V7PhasePlayer] Letter-reveal animation complete - advancing');
        const fromIndex = lockedPhaseIndex ?? currentPhaseIndex;
        if (lockedPhaseIndex !== null) {
          console.log('[V7PhasePlayer] 🔓 Unlocking revelation phase');
          machineAdapter.unlockPhase();
        }
        machineAdapter.setInteractionComplete(true);
        goToNextPhase(false, fromIndex);
      }}
    />
  );
}
```

### Correção 4: Atualizar Interface do V7PhasePERFEITOSynced

Arquivo: `src/components/lessons/v7/cinematic/phases/V7PhasePERFEITOSynced.tsx`

Modificar interface para aceitar dados dinâmicos:

```typescript
interface V7PhasePERFEITOSyncedProps {
  wordTimestamps: WordTimestamp[];
  currentTime: number;
  isPlaying: boolean;
  onComplete?: () => void;
  exitAnchor?: string;
  // ✅ V7-v51: Dados dinâmicos do banco
  lettersData?: Array<{
    letter: string;
    meaning: string;
    subtitle: string;
  }>;
  word?: string;
  finalStamp?: string;
}
```

E usar esses dados com fallback para o array hardcoded:

```typescript
// Dentro do componente
const letters = lettersData?.length ? lettersData.map((l, i) => ({
  letter: l.letter,
  meaning: l.meaning,
  subtitle: l.subtitle,
  anchorText: l.meaning,  // Usar meaning como anchorText para sincronização
})) : PERFEITO_MEANINGS;
```

## Ordem de Implementação

1. **Etapa 1**: Adicionar logs diagnósticos no `case 'revelation'` do V7PhasePlayer
2. **Etapa 2**: Testar e capturar logs para confirmar valores em runtime
3. **Etapa 3**: Expandir lógica de detecção com `isPerfeitoByPhaseId` e `hasLettersArray`
4. **Etapa 4**: Modificar V7PhasePERFEITOSynced para aceitar dados dinâmicos
5. **Etapa 5**: Passar dados do banco para o componente
6. **Etapa 6**: Testar renderização completa da animação letter-reveal

## Seção Técnica Detalhada

### Fluxo de Dados Atual
```text
Banco (lessons.content.phases[8]) 
  → useV7PhaseScript.ts (linha 481: phases: phasesArray)
    → V7PhasePlayer (scaledScript.phases[currentPhaseIndex])
      → case 'revelation'
        → shouldRenderLetterReveal = false (BUG: detecção falhando)
          → Fallback para V7PhaseCTA (texto estático)
```

### Fluxo de Dados Corrigido
```text
Banco (lessons.content.phases[8]) 
  → useV7PhaseScript.ts (linha 481: phases: phasesArray)
    → V7PhasePlayer (scaledScript.phases[currentPhaseIndex])
      → case 'revelation'
        → shouldRenderLetterReveal = true (detecção robusta)
          → V7PhasePERFEITOSynced com lettersData do banco
            → Animação vertical P-E-R-F-E-I-T-O sincronizada com áudio
```

### Campos do Banco Utilizados
| Campo | Valor Esperado | Uso |
|-------|----------------|-----|
| `phase.id` | `"cena-9-perfeito"` | Detecção por ID |
| `phase.type` | `"revelation"` | Switch case |
| `phase.visual.type` | `"letter-reveal"` | Detecção primária |
| `phase.visual.content.word` | `"PERFEITO"` | Palavra central |
| `phase.visual.content.letters` | Array de 8 objetos | Dados para animação |
| `phase.visual.content.finalStamp` | `"MÉTODO PERFEITO"` | Texto final |

## Resultado Esperado

Após implementação:
- Fase `cena-9-perfeito` renderiza `V7PhasePERFEITOSynced` corretamente
- Palavra "PERFEITO" aparece vertical no centro
- Cada letra (P, E, R, F, E, I, T, O) revela seu significado sincronizado com áudio
- Som de "reveal" toca a cada letra revelada
- Após todas as letras reveladas, transição automática para próxima fase
