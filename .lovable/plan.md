
# V7 Diagnostic Engine - Plano Completo de Reconstrução

## Resumo Executivo

Este plano detalha a **exclusão completa** do sistema atual de "Debug Hardcore" (que é apenas um dashboard de métricas) e a **reconstrução de um motor de diagnóstico real** que identifica causas raiz e gera outputs acionáveis.

O objetivo final é viabilizar a **geração automática de aulas V7** onde:
- JSON entra → Aula funcional sai
- Erros são detectados com causa raiz específica
- Correções são instruções executáveis, não "verifique o JSON"

---

## Fase 1: Exclusão do Sistema Atual

### Arquivos a Remover

```
FRONTEND:
├── src/pages/AdminV7DebugReports.tsx           # UI do "Debug Hardcore"
├── src/components/admin/V7CorrectionStatus.tsx  # Dashboard de badges
├── src/components/admin/V7PipelineBugTracker.tsx # Checklist manual
├── src/lib/v7Debug/                             # Diretório completo
│   ├── index.ts
│   ├── pipelineDebugger.ts
│   ├── playerDebugger.ts
│   └── saveDebugReport.ts
└── src/types/V7DebugSchema.ts                   # Schema do sistema antigo
```

### Tabela no Banco
A tabela `v7_debug_reports` será **limpa** (dados históricos removidos) pois o novo sistema analisa on-demand direto dos dados da aula.

---

## Fase 2: Arquitetura do Novo Sistema

### Estrutura de Arquivos

```
src/lib/v7Diagnostic/
├── types.ts                    # Tipos: Finding, RootCause, CorrectionAction
├── engine.ts                   # Orquestrador principal
├── modules/
│   ├── anchorCrossRef.ts       # Análise cruzada anchorText × wordTimestamps
│   ├── phaseTiming.ts          # Overlaps, gaps, sequenciamento
│   ├── microVisualValidation.ts # Letter-reveal, triggers, timing
│   ├── interactionRequirements.ts # Quiz, Playground, CTA
│   ├── audioIntegrity.ts       # Truncamento, tags, timestamps
│   ├── jsonStructure.ts        # Schema validation, campos obrigatórios
│   ├── contentTypes.ts         # Validação de tipos visuais/fases
│   └── feedbackAudio.ts        # Áudios de feedback do quiz
└── index.ts                    # Exports
```

### UI Simplificada

```
src/pages/AdminV7Diagnostic.tsx    # Nova página de diagnóstico
```

---

## Fase 3: Tipos do Sistema (types.ts)

```typescript
// ============================================================================
// TIPOS PRINCIPAIS DO V7 DIAGNOSTIC ENGINE
// ============================================================================

export type FindingType = 
  // Âncoras
  | 'anchor_not_found'           // Keyword não existe em nenhum timestamp
  | 'anchor_wrong_phase'         // Keyword existe mas em fase diferente
  | 'anchor_duplicate'           // Múltiplas ocorrências da keyword
  | 'anchor_no_pause_at'         // Fase interativa sem pauseAt
  
  // Timing
  | 'phase_overlap'              // Fases se sobrepõem
  | 'phase_gap'                  // Espaço vazio entre fases
  | 'phase_negative_duration'    // endTime < startTime
  | 'phase_too_short'            // Duração < mínimo requerido
  
  // MicroVisuais
  | 'microvisual_orphan'         // Trigger fora do range da fase
  | 'microvisual_invalid_index'  // Index maior que palavra
  | 'microvisual_missing_asset'  // URL de imagem faltando
  
  // Áudio
  | 'audio_truncated'            // Narração cortada
  | 'audio_leaked_tags'          // Tags [pause] faladas
  | 'audio_missing_timestamps'   // Sem word_timestamps
  | 'audio_gap'                  // Silêncio inesperado
  
  // Interações
  | 'quiz_no_correct_option'     // Quiz sem resposta correta
  | 'quiz_missing_feedback'      // Opção sem áudio de feedback
  | 'playground_no_prompt'       // Playground sem instrução
  | 'cta_invalid_action'         // CTA com ação inválida
  
  // Estrutura
  | 'missing_required_field'     // Campo obrigatório faltando
  | 'invalid_phase_type'         // Tipo de fase não suportado
  | 'invalid_visual_type'        // Tipo visual não suportado
  | 'duplicate_id';              // IDs duplicados

export type RootCauseType = 
  | 'json_structure_error'       // Erro na estrutura do JSON de entrada
  | 'narration_mismatch'         // Narração não corresponde à cena
  | 'pipeline_calculation'       // Erro de cálculo no pipeline
  | 'timing_desync'              // Dessincronização de tempo
  | 'missing_data';              // Dados faltando

export type ActionType = 
  | 'move_element'               // Mover elemento de cena A para B
  | 'add_field'                  // Adicionar campo ao JSON
  | 'fix_timing'                 // Corrigir timing
  | 'regenerate_phase'           // Reprocessar fase específica
  | 'manual_review';             // Requer análise humana

// ============================================================================
// ESTRUTURA DE FINDING (Problema Encontrado)
// ============================================================================

export interface V7Finding {
  id: string;                    // ID único
  type: FindingType;
  severity: 'critical' | 'error' | 'warning' | 'info';
  
  // Localização precisa
  location: {
    phaseId?: string;
    sceneId?: string;
    elementId?: string;
    field?: string;
  };
  
  // DADOS CONCRETOS (não genéricos)
  problem: string;               // "Keyword 'Persona' não está na cena correta"
  evidence: {
    expected: string;            // "cena-9-perfeito (45s - 60s)"
    actual: string;              // "encontrada em 12.5s (cena-1-impacto)"
    data: Record<string, unknown>;
  };
}

// ============================================================================
// ESTRUTURA DE ROOT CAUSE (Causa Raiz)
// ============================================================================

export interface V7RootCause {
  type: RootCauseType;
  description: string;           // "O JSON de entrada colocou microVisuais na cena errada"
  affectedFindings: string[];    // IDs dos findings relacionados
  evidence: string[];            // Dados que comprovam a causa
}

// ============================================================================
// ESTRUTURA DE CORRECTION ACTION (Ação de Correção)
// ============================================================================

export interface V7CorrectionAction {
  id: string;
  priority: 1 | 2 | 3;           // 1 = crítico
  type: ActionType;
  
  // INSTRUÇÃO ESPECÍFICA E EXECUTÁVEL
  instruction: string;           // "Mova microVisual 'mv-p' de cena-1 para cena-9"
  
  // Detalhes da movimentação (quando aplicável)
  target?: {
    from: string;                // "scenes[0].microVisuals[0]"
    to: string;                  // "scenes[8].microVisuals[0]"
  };
  
  // Patch JSON sugerido (quando aplicável)
  suggestedPatch?: {
    op: 'add' | 'remove' | 'move' | 'replace';
    path: string;
    value?: unknown;
    from?: string;
  };
  
  // Findings que esta ação resolve
  resolvesFindings: string[];
}

// ============================================================================
// RELATÓRIO FINAL DE DIAGNÓSTICO
// ============================================================================

export interface V7DiagnosticReport {
  lessonId: string;
  lessonTitle: string;
  analyzedAt: string;
  
  // Inputs analisados
  inputs: {
    hasPhases: boolean;
    phaseCount: number;
    hasWordTimestamps: boolean;
    timestampCount: number;
    hasAudio: boolean;
    audioDuration: number;
  };
  
  // Resultados
  findings: V7Finding[];
  rootCauses: V7RootCause[];
  actions: V7CorrectionAction[];
  
  // Sumário executivo
  summary: {
    healthScore: number;         // 0-100
    totalFindings: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    canAutoFix: boolean;
    primaryAction: string;       // Ação mais importante a tomar
  };
}
```

---

## Fase 4: Módulos de Análise (60+ Verificações)

### Módulo 1: anchorCrossRef.ts (12 verificações)

O **coração do sistema** - cruza cada anchorText com wordTimestamps.

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | Keyword existe globalmente | Critical | Busca keyword em todos os timestamps |
| 2 | Keyword no range correto | Error | Verifica se timestamp está dentro da fase |
| 3 | Keyword duplicada | Warning | Múltiplas ocorrências, qual usar? |
| 4 | Fuzzy matching | Info | Sugestão para typos (Levenshtein) |
| 5 | pauseAt configurado | Error | Fases interativas devem ter pauseAt |
| 6 | transitionAt válido | Warning | Verifica se transição está no range |
| 7 | enterAnchor correto | Warning | Fase começa após keyword |
| 8 | Actions sobrepostas | Error | Múltiplas ações no mesmo timestamp |
| 9 | delayMs válido | Warning | Delay não pode empurrar fora da fase |
| 10 | once logic | Info | Ações únicas marcadas corretamente |
| 11 | targetId existe | Error | Alvo da ação deve existir |
| 12 | anchorAction IDs únicos | Error | Sem duplicação de IDs |

**Lógica Core:**
```typescript
function analyzeAnchorCrossReferences(
  phases: V7Phase[],
  wordTimestamps: WordTimestamp[]
): V7Finding[] {
  const findings: V7Finding[] = [];
  
  for (const phase of phases) {
    const anchors = extractAnchorsFromPhase(phase);
    
    for (const anchor of anchors) {
      // 1. Buscar keyword em TODOS os timestamps
      const globalMatch = findKeywordGlobally(anchor.keyword, wordTimestamps);
      
      if (!globalMatch) {
        // CRITICAL: Keyword não existe
        findings.push({
          id: `anchor_missing_${anchor.id}`,
          type: 'anchor_not_found',
          severity: 'critical',
          location: { phaseId: phase.id, elementId: anchor.id },
          problem: `Keyword "${anchor.keyword}" não existe na narração`,
          evidence: {
            expected: `Deveria existir em ${phase.id}`,
            actual: 'Não encontrada em nenhum timestamp',
            data: { 
              keyword: anchor.keyword,
              similarWords: findSimilarWords(anchor.keyword, wordTimestamps)
            }
          }
        });
        continue;
      }
      
      // 2. Verificar se está no range da fase
      if (globalMatch.time < phase.startTime || globalMatch.time > phase.endTime) {
        const correctPhase = findPhaseByTime(phases, globalMatch.time);
        
        findings.push({
          id: `anchor_wrong_${anchor.id}`,
          type: 'anchor_wrong_phase',
          severity: 'error',
          location: { phaseId: phase.id, elementId: anchor.id },
          problem: `Keyword "${anchor.keyword}" está na fase errada`,
          evidence: {
            expected: `${phase.id} (${phase.startTime.toFixed(1)}s - ${phase.endTime.toFixed(1)}s)`,
            actual: `Encontrada em ${globalMatch.time.toFixed(2)}s (${correctPhase?.id || 'unknown'})`,
            data: {
              keyword: anchor.keyword,
              foundAt: globalMatch.time,
              correctPhaseId: correctPhase?.id
            }
          }
        });
      }
    }
  }
  
  return findings;
}
```

---

### Módulo 2: phaseTiming.ts (10 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | Overlap de fases | Critical | Phase[N+1].startTime < Phase[N].endTime |
| 2 | Gap entre fases | Warning | Espaço vazio > 0.1s causa tela preta |
| 3 | Duração negativa | Critical | endTime < startTime |
| 4 | Duração mínima interativa | Error | Quiz/Playground < 5s |
| 5 | Duração mínima narrativa | Warning | Narrativa < 2s |
| 6 | Sequenciamento de IDs | Info | Ordem lógica (cena-1, cena-2...) |
| 7 | Fase de loading | Warning | Ausência da fase inicial (0-3s) |
| 8 | autoAdvance em interativas | Error | Deve ser false para interações |
| 9 | Transição válida | Warning | Tipo de transição suportado |
| 10 | Cobertura temporal | Error | Fases cobrem todo o áudio |

---

### Módulo 3: microVisualValidation.ts (10 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | triggerTime válido | Error | Dentro do range da fase |
| 2 | Duração vs fase | Warning | MV não ultrapassa fim da fase |
| 3 | Visibilidade | Error | MV inicia antes da fase terminar |
| 4 | Letter-reveal index | Error | Index <= comprimento da palavra |
| 5 | Asset URL válida | Error | image-flash tem URL |
| 6 | Colisão de posição | Warning | Dois MVs no mesmo lugar |
| 7 | number-count params | Error | from, to, prefix válidos |
| 8 | Ordenação cronológica | Warning | MVs em ordem temporal |
| 9 | Uso de fallback | Info | Quantos usaram tempo estimado |
| 10 | Tipo suportado | Error | Tipo de MV válido |

---

### Módulo 4: interactionRequirements.ts (10 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | Quiz com opção correta | Critical | Pelo menos uma correta |
| 2 | Quiz feedback match | Warning | Feedback condiz com resultado |
| 3 | Playground prompt | Error | Instrução obrigatória |
| 4 | CTA action válida | Error | next-phase, complete |
| 5 | Timeout sequence | Warning | soft < medium < hard |
| 6 | Audio behavior | Error | mainVolume: 0 durante quiz |
| 7 | Reward XP | Warning | Valores positivos |
| 8 | Success criteria | Info | Critérios de sucesso |
| 9 | Feedback audio URL | Error | URLs válidas |
| 10 | Post-lesson flow | Warning | Destino válido |

---

### Módulo 5: audioIntegrity.ts (10 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | Truncamento crítico | Critical | < 95% narrado |
| 2 | Tags vazadas | Critical | [pause] narrado |
| 3 | Gaps de silêncio | Warning | Pausas > 3s |
| 4 | Drift de duração | Warning | > 30% diferença |
| 5 | URL acessível | Error | Audio URL 200 OK |
| 6 | Timestamps presentes | Critical | Array existe |
| 7 | Timestamps suficientes | Warning | > 10 palavras |
| 8 | Primeiro/último word | Info | Cobertura temporal |
| 9 | Sound effects trigger | Warning | Fora do range |
| 10 | Feedback audios | Error | Existem para quiz |

---

### Módulo 6: jsonStructure.ts (10 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | Campos raiz | Critical | phases, totalDuration |
| 2 | IDs únicos | Error | Sem duplicação |
| 3 | Tipagem estrita | Error | Match phase/visual type |
| 4 | Metadados | Info | difficulty, tags |
| 5 | Configuração áudio | Error | URLs, estrutura |
| 6 | Content fields | Error | Campos por tipo visual |
| 7 | Timestamps array | Critical | word_timestamps existe |
| 8 | Script integrity | Warning | totalDuration vs último ts |
| 9 | Schema version | Info | Contrato v7-vv |
| 10 | Element targets | Error | targetId existe |

---

### Módulo 7: contentTypes.ts (5 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | Phase type válido | Error | 9 tipos suportados |
| 2 | Visual type válido | Error | 13 tipos suportados |
| 3 | MicroVisual type válido | Error | 7 tipos suportados |
| 4 | Interaction type válido | Error | 4 tipos suportados |
| 5 | Type/visual compatibility | Warning | Combinação válida |

---

### Módulo 8: feedbackAudio.ts (5 verificações)

| # | Verificação | Severidade | Descrição |
|---|-------------|------------|-----------|
| 1 | URL presente | Error | Cada opção tem URL |
| 2 | URL acessível | Warning | 200 OK |
| 3 | ID match | Error | feedback-{optionId} |
| 4 | Duration presente | Info | Duração calculada |
| 5 | Correct feedback exists | Error | Opção correta tem feedback |

---

## Fase 5: Engine Principal (engine.ts)

```typescript
export class V7DiagnosticEngine {
  private findings: V7Finding[] = [];
  private rootCauses: V7RootCause[] = [];
  private actions: V7CorrectionAction[] = [];
  
  async analyze(lessonId: string): Promise<V7DiagnosticReport> {
    // 1. Buscar dados da aula
    const lesson = await this.fetchLesson(lessonId);
    const phases = extractPhases(lesson.content);
    const wordTimestamps = lesson.word_timestamps || [];
    
    // 2. Executar todos os módulos
    this.findings.push(...analyzeAnchorCrossReferences(phases, wordTimestamps));
    this.findings.push(...analyzePhaseTiming(phases));
    this.findings.push(...analyzeMicroVisuals(phases, wordTimestamps));
    this.findings.push(...analyzeInteractions(phases));
    this.findings.push(...analyzeAudioIntegrity(lesson));
    this.findings.push(...analyzeJsonStructure(lesson.content));
    this.findings.push(...analyzeContentTypes(phases));
    this.findings.push(...analyzeFeedbackAudios(phases));
    
    // 3. Identificar causas raiz
    this.rootCauses = this.identifyRootCauses(this.findings);
    
    // 4. Gerar ações de correção
    this.actions = this.generateActions(this.findings, this.rootCauses);
    
    // 5. Montar relatório
    return this.buildReport(lessonId, lesson.title);
  }
  
  private identifyRootCauses(findings: V7Finding[]): V7RootCause[] {
    const causes: V7RootCause[] = [];
    
    // Agrupar findings por padrão
    const anchorWrong = findings.filter(f => f.type === 'anchor_wrong_phase');
    if (anchorWrong.length >= 3) {
      // Múltiplos anchors errados = problema estrutural no JSON
      causes.push({
        type: 'json_structure_error',
        description: 'Múltiplos elementos estão em cenas diferentes da narração correspondente',
        affectedFindings: anchorWrong.map(f => f.id),
        evidence: anchorWrong.map(f => f.problem)
      });
    }
    
    return causes;
  }
  
  private generateActions(findings: V7Finding[], causes: V7RootCause[]): V7CorrectionAction[] {
    const actions: V7CorrectionAction[] = [];
    
    for (const finding of findings) {
      switch (finding.type) {
        case 'anchor_wrong_phase':
          const correctPhase = finding.evidence.data.correctPhaseId;
          actions.push({
            id: `action_${finding.id}`,
            priority: 1,
            type: 'move_element',
            instruction: `Mova "${finding.location.elementId}" de ${finding.location.phaseId} para ${correctPhase}`,
            target: {
              from: `phases[${finding.location.phaseId}]`,
              to: `phases[${correctPhase}]`
            },
            resolvesFindings: [finding.id]
          });
          break;
          
        case 'anchor_not_found':
          actions.push({
            id: `action_${finding.id}`,
            priority: 1,
            type: 'manual_review',
            instruction: `Keyword "${finding.evidence.data.keyword}" não existe na narração. Adicione na cena ou altere para "${finding.evidence.data.similarWords?.[0]}"`,
            resolvesFindings: [finding.id]
          });
          break;
      }
    }
    
    return actions;
  }
}
```

---

## Fase 6: Interface Admin (AdminV7Diagnostic.tsx)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  V7 DIAGNÓSTICO PROFUNDO                                        [?] Ajuda │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Aula: [▼ O Fim da Brincadeira com IA FIX        ]     [🔍 Analisar]       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── HEALTH SCORE ───┐  ┌─── SUMÁRIO ─────────────────────────────────────┐│
│  │                    │  │                                                  ││
│  │   ████████░░ 35    │  │  🔴 8 Critical   🟠 3 Error   🟡 2 Warning      ││
│  │                    │  │                                                  ││
│  └────────────────────┘  │  ✗ Não pode ser corrigido automaticamente       ││
│                          │                                                  ││
│                          └──────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─── CAUSA RAIZ ───────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │  TIPO: json_structure_error                                              ││
│  │                                                                          ││
│  │  Os 8 microVisuais do acrônimo PERFEITO estão posicionados na cena-1,   ││
│  │  mas as keywords são narradas na cena-9 (45s-55s).                      ││
│  │                                                                          ││
│  │  EVIDÊNCIA:                                                              ││
│  │  • mv-p: "Persona" encontrada em 45.2s (cena-9)                         ││
│  │  • mv-e1: "Estrutura" encontrada em 47.8s (cena-9)                      ││
│  │  • mv-r: "Resultado" encontrada em 50.1s (cena-9)                       ││
│  │  • [+5 mais...]                                                         ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  ┌─── AÇÕES PARA CORREÇÃO (PRIORIDADE) ─────────────────────────────────────┐│
│  │                                                                          ││
│  │  [1] CRÍTICO: Mover microVisuais de cena-1 para cena-9                  ││
│  │      ┌────────────────────────────────────────────────────────────────┐ ││
│  │      │ • mv-p: "Persona" → mover para scenes[8]                       │ ││
│  │      │ • mv-e1: "Estrutura" → mover para scenes[8]                    │ ││
│  │      │ • mv-r: "Resultado" → mover para scenes[8]                     │ ││
│  │      │ • ... (8 elementos total)                                      │ ││
│  │      └────────────────────────────────────────────────────────────────┘ ││
│  │                                                                          ││
│  │  [2] ERRO: Verificar pauseAt em cena-6-quiz                             ││
│  │      "decisão" não encontrada no range 25s-30s                          ││
│  │                                                                          ││
│  │  [3] WARNING: Gap de 0.2s entre cena-3 e cena-4                         ││
│  │                                                                          ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  [📋 Copiar Diagnóstico para IA]    [📄 Exportar JSON]    [🔄 Re-analisar] │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 7: Output Exemplo Real

Para a aula "O Fim da Brincadeira com IA FIX", o sistema gerará:

```json
{
  "lessonId": "b840fc4c-c202-41b3-9df0-e05e4aa301e1",
  "lessonTitle": "O Fim da Brincadeira com IA FIX",
  "analyzedAt": "2026-02-02T12:00:00Z",
  
  "summary": {
    "healthScore": 35,
    "totalFindings": 13,
    "criticalCount": 8,
    "errorCount": 3,
    "warningCount": 2,
    "canAutoFix": false,
    "primaryAction": "Mova todos os microVisuais de cena-1 para cena-9"
  },
  
  "rootCauses": [
    {
      "type": "json_structure_error",
      "description": "Os 8 microVisuais do acrônimo PERFEITO estão na cena-1, mas a narração das keywords está na cena-9 (45s-55s)",
      "affectedFindings": ["anchor_wrong_mv-p", "anchor_wrong_mv-e1", ...],
      "evidence": [
        "mv-p 'Persona' → encontrada em 45.2s (fora de cena-1: 0s-12s)",
        "mv-e1 'Estrutura' → encontrada em 47.8s (fora de cena-1: 0s-12s)"
      ]
    }
  ],
  
  "actions": [
    {
      "id": "action_move_microvisuals",
      "priority": 1,
      "type": "move_element",
      "instruction": "Mova os 8 microVisuais do array scenes[0].microVisuals para scenes[8].microVisuals",
      "target": {
        "from": "scenes[0].microVisuals",
        "to": "scenes[8].microVisuals"
      },
      "suggestedPatch": {
        "op": "move",
        "from": "/scenes/0/microVisuals",
        "path": "/scenes/8/microVisuals"
      },
      "resolvesFindings": ["anchor_wrong_mv-p", "anchor_wrong_mv-e1", ...]
    }
  ]
}
```

---

## Fase 8: Ordem de Implementação

### Sprint 1: Core Engine (Prioridade Máxima)
1. `src/lib/v7Diagnostic/types.ts`
2. `src/lib/v7Diagnostic/modules/anchorCrossRef.ts` (o mais crítico)
3. `src/lib/v7Diagnostic/modules/phaseTiming.ts`
4. `src/lib/v7Diagnostic/engine.ts`
5. `src/lib/v7Diagnostic/index.ts`

### Sprint 2: Módulos Adicionais
6. `src/lib/v7Diagnostic/modules/microVisualValidation.ts`
7. `src/lib/v7Diagnostic/modules/interactionRequirements.ts`
8. `src/lib/v7Diagnostic/modules/audioIntegrity.ts`
9. `src/lib/v7Diagnostic/modules/jsonStructure.ts`
10. `src/lib/v7Diagnostic/modules/contentTypes.ts`
11. `src/lib/v7Diagnostic/modules/feedbackAudio.ts`

### Sprint 3: Interface
12. `src/pages/AdminV7Diagnostic.tsx`
13. Atualizar rotas em App.tsx
14. Link no AdminManualHub

### Sprint 4: Limpeza
15. Remover arquivos do sistema antigo
16. Limpar tabela `v7_debug_reports` (opcional)
17. Atualizar documentação

---

## Resultado Esperado

Após implementação completa:

| Antes (Debug Hardcore) | Depois (Diagnostic Engine) |
|------------------------|----------------------------|
| "51 eventos não dispararam" | "8 microVisuais estão na cena-1 mas keywords estão na cena-9" |
| "Verificar JSON" | "Mova scenes[0].microVisuals para scenes[8]" |
| Score: 35 (sem explicação) | Score: 35 (8 critical = anchors errados) |
| Tempo para diagnosticar: 30min+ | Tempo para diagnosticar: <5s |
| Resultado: Manual investigation | Resultado: Ação executável |

---

## Considerações Técnicas

### Performance
- O(n × m) onde n = anchors, m = timestamps
- Para aulas típicas (<100 anchors, <500 timestamps): <100ms

### Dados Necessários
Apenas `lesson.content` e `lesson.word_timestamps` - análise on-demand, sem persistência obrigatória.

### Extensibilidade
Arquitetura modular permite adicionar novos checks sem alterar o engine core.
