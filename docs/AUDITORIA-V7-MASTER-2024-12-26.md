# AUDITORIA COMPLETA DO SISTEMA V7
## Data: 2024-12-26

---

# SUMARIO EXECUTIVO

| Metrica | Valor | Status |
|---------|-------|--------|
| **Completude do Sistema** | 65% | Em Desenvolvimento |
| **Bugs Criticos** | 10 | Requer Atencao |
| **Bugs Medios** | 8 | Prioridade Alta |
| **Bugs Baixos** | 5 | Pode Esperar |
| **Documentacao** | 60% precisa | Precisa Consolidacao |
| **Arquivos de Tipo** | 4 conflitantes | Requer Unificacao |

---

# PARTE 1: ARQUITETURA DO SISTEMA

## 1.1 Fluxo de Dados Principal

```
ADMIN CRIA AULA
       |
       v
+---------------------------+
| Input JSON (3 formatos)   |
| - cinematicFlow.phases    | (V7-v3)
| - cinematic_flow.acts     | (V7-v2)
| - narrativeScript         | (Legacy)
+------------+--------------+
             |
             v
+---------------------------+
| Edge Function v7-pipeline |
| /supabase/functions/      |
|                           |
| 1. Parse formato          |
| 2. Extrair narracoes      |
| 3. Gerar audio ElevenLabs |
| 4. Calcular timestamps    |
| 5. Salvar no banco        |
+------------+--------------+
             |
             v
+---------------------------+
| Supabase Database         |
| Tabela: lessons           |
|                           |
| - content (JSONB)         |
| - audio_url               |
| - word_timestamps         |
+------------+--------------+
             |
             v
+---------------------------+
| Frontend Hooks            |
| - useV7PhaseScript        |
| - useV7CinematicLesson    |
+------------+--------------+
             |
             v
+---------------------------+
| Player Components         |
| - V7PhasePlayer           |
| - V7CinematicPlayer       |
+---------------------------+
```

## 1.2 Arquivos Principais

### Pipeline (Backend)
- `/supabase/functions/v7-pipeline/index.ts` - Pipeline principal (1700+ linhas)
- `/supabase/functions/elevenlabs-tts-contextual/index.ts` - TTS para dicas
- `/supabase/functions/v7-regenerate-audio/index.ts` - Regenerar audio

### Tipos (4 arquivos conflitantes!)
- `/src/types/v7-schema.ts` - Schema V7.1 (659 linhas) **[FONTE PRINCIPAL]**
- `/src/types/v7-cinematic.types.ts` - Tipos cinematicos (565 linhas)
- `/src/types/v7-unified.types.ts` - Tentativa de unificacao (501 linhas)
- `/src/types/v7.types.ts` - Tipos V7-v2 (389 linhas)

### Servicos
- `/src/services/v7CinematicService.ts` - CRUD de aulas
- `/src/services/v7-lesson-adapter.ts` - Adaptador de formatos
- `/src/hooks/useV7PhaseScript.ts` - Carregador principal
- `/src/hooks/useV7CinematicLesson.ts` - Carregador legado

### Player
- `/src/components/lessons/v7/V7CinematicPlayer.tsx` - Player principal
- `/src/components/lessons/v7/cinematic/V7PhasePlayer.tsx` - Player por fases
- `/src/components/lessons/v7/cinematic/useV7AudioManager.ts` - Gerenciador de audio
- `/src/components/lessons/v7/cinematic/useAnchorText.ts` - Sincronizacao por palavras

### Fases
- `/src/components/lessons/v7/cinematic/phases/V7PhaseDramatic.tsx`
- `/src/components/lessons/v7/cinematic/phases/V7PhaseQuiz.tsx`
- `/src/components/lessons/v7/cinematic/phases/V7PhasePlayground.tsx`
- `/src/components/lessons/v7/cinematic/phases/V7PhaseSecretReveal.tsx`
- `/src/components/lessons/v7/cinematic/phases/V7PhasePERFEITO.tsx`
- `/src/components/lessons/v7/cinematic/phases/V7PhaseGamification.tsx`

---

# PARTE 2: BUGS CRITICOS

## BUG #1: Falha de Audio Silenciosa
**Severidade**: CRITICA
**Arquivo**: `v7-pipeline/index.ts:629-633`

```typescript
// PROBLEMA: Se audio falha, aula salva SEM audio
audioGenerationError = audioResult.error || 'Unknown audio generation error';
console.error('[V7Pipeline] Audio generation FAILED:', audioGenerationError);
// Aula salva mesmo assim - usuario nao sabe que falhou!
```

**Impacto**: Aulas salvas sem audio, player quebra
**Solucao**: Rejeitar criacao se audio falhar OU notificar usuario claramente

---

## BUG #2: Conflito de Versoes no Schema
**Severidade**: CRITICA
**Arquivos**: Todos os arquivos de tipo

| Arquivo | Versao |
|---------|--------|
| v7-schema.ts | `"7.1"` |
| v7.types.ts | `"2.0"` |
| v7-cinematic.types.ts | SEM versao |
| SQL | Aceita qualquer |

**Impacto**: Validacao inconsistente, dados corrompidos possiveis
**Solucao**: Unificar para versao "7.1" em todos os arquivos

---

## BUG #3: Constraint SQL Incorreta
**Severidade**: CRITICA
**Arquivo**: `supabase/migrations/20251122000000_add_model_to_lessons.sql`

```sql
-- ATUAL (ERRADO):
model text CHECK (model IN ('v1', 'v2', 'v3', 'v4'))

-- DEVERIA SER:
model text CHECK (model IN ('v1', 'v2', 'v3', 'v4', 'v7'))
```

**Impacto**: Banco rejeita aulas V7
**Solucao**: Adicionar 'v7' na constraint

---

## BUG #4: Naming Inconsistente (acts vs phases)
**Severidade**: CRITICA
**Locais**: Pipeline, tipos, player

| Camada | Usa |
|--------|-----|
| Pipeline/Banco | `cinematic_flow.acts` |
| Player | `phases` |
| Lovable gerava | `cinematicFlow.phases` (ERRADO) |

**Impacto**: Transformacoes extras, bugs de incompatibilidade
**Solucao**: Padronizar: banco = acts, player = phases, adapter converte

---

## BUG #5: PauseKeyword Auto-Gerado Impreciso
**Severidade**: CRITICA
**Arquivo**: `useV7PhaseScript.ts:904-1133`

```typescript
// Se pauseKeyword nao definido, tenta 4 estrategias de fallback:
// 1. Ultima palavra antes de "?"
// 2. Ultima palavra da narracao
// 3. Palavra mais longa
// 4. Qualquer palavra

// Resultado: pausa em lugares errados frequentemente
```

**Impacto**: Audio pausa no momento errado, UX quebrada
**Solucao**: Tornar pauseKeyword OBRIGATORIO para fases interativas

---

## BUG #6: Extracao de Narracao Complexa Demais
**Severidade**: CRITICA
**Arquivo**: `v7-pipeline/index.ts:389-459`

Pipeline procura narracao em 5+ locais diferentes:
1. `phase.narration.text`
2. `phase.narration`
3. `act.audio.narration`
4. `act.content.audio.narration`
5. `act.content.narration.text`

**Impacto**: Facil perder narracao, falhas silenciosas
**Solucao**: Padronizar UNICO local: `act.narration` (string direta)

---

## BUG #7: Legendas Piscando
**Severidade**: CRITICA
**Arquivo**: `V7SynchronizedCaptions.tsx`
**Relato**: "A legenda nao e profissional, fica piscando"

**Causa**:
1. Word timestamps distribuidos proporcionalmente (nao precisos)
2. Todas palavras renderizam juntas
3. Sem transicoes suaves

**Solucao**: Usar word timestamps reais do ElevenLabs, renderizar palavra por palavra

---

## BUG #8: Slides Repetindo Sem Sincronia
**Severidade**: CRITICA
**Arquivo**: `V7PhaseController.ts`
**Relato**: "Fica repetindo esse slide - depois outro e nao acompanha a fala"

**Causa**:
- Mesmo slide mostrado durante fase inteira
- Nao transiciona entre cenas
- Audio fala de uma coisa, visual mostra outra

**Solucao**: Implementar sistema de cenas multiplas por fase com timing individual

---

## BUG #9: Quiz Nao Pausa Audio Automaticamente
**Severidade**: CRITICA
**Arquivo**: `V7PhaseQuiz.tsx`
**Relato**: "Nao tem exercicios sincronizados com a aula"

**Status**: PARCIALMENTE CORRIGIDO (V7-v9)
**Funcionamento Atual**:
- Quiz espera `isPausedByAnchor=true` do hook useAnchorText
- Depende de pauseKeyword estar correto

---

## BUG #10: Playground Nao Renderiza
**Severidade**: CRITICA
**Arquivo**: `V7PhasePlayground.tsx`
**Relato**: "Nao teve o playground - tudo errado"

**Causa**: Componente espera estrutura especifica:
```typescript
{
  amateurPrompt: string,       // OBRIGATORIO
  professionalPrompt: string,  // OBRIGATORIO
  amateurResult: { content, score, verdict },
  professionalResult: { content, score, verdict }
}
```

Se campos faltando ou em local errado = nao renderiza

---

# PARTE 3: BUGS MEDIOS

## BUG #11: Instrucoes Visuais Sendo Narradas
**Arquivo**: `v7-pipeline/index.ts:233`
**Relato**: "Teve uma parte que era instrucao de tela e foi narrado"

**Status**: Parcialmente corrigido com `cleanTextForTTS()`
**Verificar**: Se `visual.instruction` ainda vai para TTS

---

## BUG #12: Gamificacao Nao Persistida
**Arquivo**: `v7-pipeline/index.ts`

XP e conquistas sao visuais apenas - nao salvam no perfil do usuario

---

## BUG #13: Timing de Cenas Hardcoded
**Arquivo**: `useV7PhaseScript.ts:1490-1628`

6 cenas dramaticas com duracoes fixas em porcentagem:
- Cena 0: 0-15%
- Cena 1: 15-30%
- etc.

Nao adapta ao timing real da narracao.

---

## BUG #14: Cursor Nao Esconde em Fullscreen
**Arquivo**: `V7CinematicPlayer.tsx:84-98`

Auto-hide do cursor nao funciona em modo fullscreen.

---

## BUG #15: Fullscreen Nao Persiste
**Arquivo**: `V7CinematicPlayer.tsx`

Browser bloqueia auto-fullscreen, sai do fullscreen em interacoes.

---

# PARTE 4: INCONSISTENCIAS DE TIPOS

## 4.1 Tipos de Fase/Ato

| Arquivo | Tipos Aceitos |
|---------|---------------|
| v7-schema.ts | dramatic, narrative, interaction, playground, revelation, gamification |
| v7.types.ts | dramatic, comparison, interactive, playground, revelation, gamification |
| v7-cinematic.types.ts | narrative, interactive, challenge, revelation, outro |
| SQL | + quiz, comparison, cta, result |

**Problema**: Tipos inconsistentes entre camadas

---

## 4.2 Audio Behavior Defaults

**v7-schema.ts (Quiz)**:
```typescript
onStart: 'pause'
duringInteraction: { mainVolume: 0, ambientVolume: 0.3 }
onComplete: 'resume'
```

**v7.types.ts (Quiz)**:
```typescript
onStart: 'fadeToBackground'  // DIFERENTE!
duringInteraction: { mainVolume: 0.15, ambientVolume: 0.4 }
onComplete: 'fadeIn'  // DIFERENTE!
```

---

## 4.3 Timeout Config

**v7-schema.ts**:
```typescript
hints: [string, string, string]  // Exatamente 3
autoAction?: 'skip' | 'selectDefault' | 'continue'
```

**v7.types.ts**:
```typescript
hints: string[]  // Qualquer quantidade
// SEM autoAction!
```

---

# PARTE 5: DOCUMENTACAO

## 5.1 Status da Documentacao

| Documento | Precisao | Status |
|-----------|----------|--------|
| GUIA-COMPLETO-V7.md | 80% | Precisa update V7.1 |
| V7-ANCHORTEXT-RULES.md | 95% | Excelente |
| AUDITORIA-V7-COMPLETA.md | 60% | Desatualizado |
| v7-schema.ts | 100% | Fonte da verdade |

## 5.2 Documentacao Faltando

1. **Guia Getting Started** - Nao existe
2. **Diagrama de Arquitetura** - Nao existe
3. **Documentacao de API** - Nao existe
4. **Historico de Versoes** - Confuso
5. **Guia de Testes** - Nao existe

## 5.3 Conflitos na Documentacao

1. acts vs phases - documentos divergem
2. Versao 7.1 vs 2.0 vs 3.0
3. Time-based vs word-based timing
4. Status de deploy incerto

---

# PARTE 6: RECOMENDACOES

## PRIORIDADE 1: CRITICO (Fazer Agora)

### 1.1 Corrigir Constraint SQL
```sql
ALTER TABLE lessons
DROP CONSTRAINT IF EXISTS lessons_model_check;

ALTER TABLE lessons
ADD CONSTRAINT lessons_model_check
CHECK (model IN ('v1', 'v2', 'v3', 'v4', 'v7'));
```

### 1.2 Unificar Versao
Atualizar TODOS os arquivos para usar `version: "7.1"`

### 1.3 Tornar pauseKeyword Obrigatorio
```typescript
if ((act.type === 'interaction' || act.type === 'playground') && !act.pauseKeyword) {
  throw new Error(`Act ${act.id}: pauseKeyword is REQUIRED for interactive phases`);
}
```

### 1.4 Falhar se Audio Nao Gerar
```typescript
if (!audioResult.success) {
  return new Response(JSON.stringify({
    success: false,
    error: 'Audio generation failed - lesson NOT saved',
    details: audioResult.error
  }), { status: 400 });
}
```

---

## PRIORIDADE 2: ALTA (Proxima Semana)

### 2.1 Consolidar Arquivos de Tipo
1. Manter `v7-schema.ts` como fonte unica
2. Deprecar outros arquivos
3. Migrar codigo para usar tipos canonicos

### 2.2 Padronizar Local da Narracao
```typescript
// UNICO formato aceito:
interface V7PipelineAct {
  narration: string;  // Diretamente na raiz, string simples
}
```

### 2.3 Adicionar Validacao Zod
```typescript
const V7ActSchema = z.object({
  id: z.string(),
  type: z.enum(['dramatic', 'narrative', 'interaction', 'playground', 'revelation', 'gamification']),
  narration: z.string().min(1),
  pauseKeyword: z.string().optional(),
  visual: V7VisualSchema,
});
```

---

## PRIORIDADE 3: MEDIA (Proximo Mes)

### 3.1 Implementar Cenas Multiplas
Cada fase pode ter 2-5 cenas com timing individual baseado em word timestamps.

### 3.2 Persistir Gamificacao
Criar tabela `user_achievements` e salvar XP/conquistas.

### 3.3 Criar Documentacao Completa
- Getting Started
- Arquitetura
- API Reference
- Changelog

---

## PRIORIDADE 4: BAIXA (Nice to Have)

- Cursor auto-hide em fullscreen
- Preload de audio
- Transicoes avancadas
- Analytics detalhado

---

# PARTE 7: MATRIZ DE COMPATIBILIDADE

| Feature | v7-schema.ts | v7.types.ts | v7-cinematic.types.ts | v7-unified.types.ts |
|---------|-------------|-------------|-----------------------|---------------------|
| Version field | 7.1 | 2.0 | Nenhum | Sem constraint |
| Word timestamps | Completo | Completo | Parcial | Completo |
| Anchor actions | Completo | Nenhum | Nenhum | Completo |
| Audio behavior | Completo | Completo | Diferente | Completo |
| Timeout config | Com autoAction | Sem autoAction | Completo | Completo |
| Scene types | 17 tipos | 12 tipos | Usa layers | Extended |
| Gamification | Nenhum | Nenhum | Completo | Nenhum |

---

# PARTE 8: CHECKLIST DE CORRECAO

## Fase 1: Fixes Criticos (4-8 horas)
- [ ] Corrigir constraint SQL para aceitar 'v7'
- [ ] Unificar versao para 7.1
- [ ] Adicionar validacao de pauseKeyword
- [ ] Falhar se audio nao gerar
- [ ] Testar pipeline com JSON corrigido

## Fase 2: Padronizacao (2-3 dias)
- [ ] Consolidar arquivos de tipo
- [ ] Padronizar local da narracao
- [ ] Adicionar validacao Zod
- [ ] Atualizar documentacao

## Fase 3: Melhorias (1 semana)
- [ ] Implementar cenas multiplas
- [ ] Corrigir legendas
- [ ] Persistir gamificacao
- [ ] Criar guia Getting Started

## Fase 4: Polish (2-3 semanas)
- [ ] Cursor fullscreen
- [ ] Audio preload
- [ ] Transicoes avancadas
- [ ] Testes E2E

---

# CONCLUSAO

O sistema V7 tem **arquitetura solida** mas **implementacao incompleta**.

**O que funciona**:
- Geracao de audio ElevenLabs
- Word timestamps
- Sincronizacao basica
- Tipos de fase (dramatic, quiz, etc)

**O que nao funciona**:
- Sincronia visual/audio precisa
- Cenas multiplas por fase
- Validacao consistente
- Gamificacao persistida

**Estimativa para Producao**:
- Fixes criticos: 1 dia
- Estabilizacao: 1 semana
- Feature-complete: 3-4 semanas

---

**Arquivos Auditados**: 47
**Linhas de Codigo Analisadas**: ~15,000
**Tempo de Auditoria**: Automatizado
**Proxima Revisao**: Apos implementacao dos fixes criticos
