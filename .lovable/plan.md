

# Auditoria do Plano "Import Full Script" — Dados Reais do Código

---

## GAPS CONFIRMADOS

### Gap 1 (CRÍTICO): Duas pipelines de áudio concorrentes — risco de sobrescrita

O Stage5Narration tem **dois caminhos** para gerar áudio de steps:

**Caminho A** — Botão "Gerar Áudios" (linha 704):
```typescript
// Stage5Narration.tsx linha 102
const { error: errA } = await supabase.functions.invoke('v10-generate-audio', {
  body: { pipeline_id: pipeline.id, target: 'part_a' }
});
```
Chama `v10-generate-audio`, que **gera o script via IA** (linha 261: `generateStepScript(step, lovableApiKey)`) e usa ElevenLabs **SEM** `with-timestamps` (linha 402: endpoint normal `text-to-speech/{voiceId}?output_format=mp3_44100_128`). **Não extrai anchors.**

**Caminho B** — Botão "Processar (ElevenLabs + Anchors)" (linha 610):
```typescript
// Stage5Narration.tsx linha 212
const { data, error } = await supabase.functions.invoke('v10-process-anchors', {
  body: { pipeline_id: pipeline.id, step_id: step.id, script }
});
```
Chama `v10-process-anchors`, que usa o script **já colado pelo admin**, ElevenLabs **COM** `with-timestamps`, e **extrai anchors**.

**Problema**: Se o admin clicar "Gerar Áudios" depois de "Processar Todos", o áudio é sobrescrito SEM anchors. Ambos gravam no mesmo `audio_url` e mesmo storage path `v10/{lesson_id}/step_{N}.mp3`.

**O plano NÃO endereça isso.** Deveria ou remover o botão "Gerar Áudios" do fluxo quando scripts manuais existem, ou unificar os caminhos.

---

### Gap 2 (CRÍTICO): Parte A e Parte C são READ-ONLY no UI

O plano diz que o modal vai salvar `script_text` para Partes A e C em `v10_lesson_narrations`. Correto — as colunas existem no banco.

Porém, o UI atual mostra Partes A e C apenas como **preview read-only** (linhas 430-436):
```typescript
// Stage5Narration.tsx linhas 430-436
{partANarration.script_text && (
  <div className="flex items-start gap-1">
    <FileText className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
    <p className="line-clamp-3 text-xs text-muted-foreground">
      {partANarration.script_text}
    </p>
  </div>
)}
```

Não existe textarea para editar `script_text` de Part A/C. Após a importação, o admin não consegue **revisar ou corrigir** o texto importado sem acessar o banco diretamente.

**O plano NÃO menciona transformar os cards de Part A/C em editáveis** após importação.

---

### Gap 3 (MÉDIO): `handleProcessAll` ignora steps com `audio_url`

Confirmado na linha 269:
```typescript
// Stage5Narration.tsx linha 267-269
const stepsWithScript = steps.filter(s => {
  const script = editingScripts[s.id] ?? s.narration_script;
  return script?.trim() && !s.audio_url;  // ← FILTRA steps com áudio
});
```

Se o admin importar scripts, processar todos, e depois quiser reprocessar (ex: corrigiu um script), o "Processar Todos" não reprocessa porque `audio_url` já existe.

O plano anterior mencionou isso (Gap 7) mas **não propôs solução concreta**. Precisa de um checkbox "Reprocessar steps com áudio existente" ou um botão "Limpar áudios e reprocessar".

---

### Gap 4 (MÉDIO): `v10-generate-audio` para steps gera scripts via IA, ignorando `narration_script`

Evidência real — `v10-generate-audio/index.ts` linha 260-261:
```typescript
// 3. Generate narration script for step
const script = await generateStepScript(step, lovableApiKey);
```

Essa função **NUNCA** lê `step.narration_script`. Ela sempre gera um script novo via IA. Portanto, o botão "Gerar Áudios" é completamente independente do campo `narration_script` que o import vai popular.

**Efeito sistêmico**: O fluxo Import → Processar Todos usa `v10-process-anchors` (correto). Mas se o admin clicar "Gerar Áudios" por engano, os áudios são regenerados com scripts da IA (não os importados) e sem anchors.

---

### Gap 5 (BAIXO): Parte A e C não passam por `v10-process-anchors`

O script do usuário tem frases-âncora na Parte A? Não (verificado no texto fornecido — Parte A não tem "Agora, os pontos de atenção" nem "Deu certo se"). Parte C também não.

**Portanto**: Partes A e C não precisam de anchor processing. O plano está correto em apenas salvar `script_text`. O áudio de A/C é gerado via `v10-generate-audio` (sem timestamps). Sem gap aqui.

---

### Gap 6 (BAIXO): O plano não especifica o que acontece com narrations A/C que ainda não existem no banco

O `fetchLessonData` (linha 44) busca narrations existentes. Se `v10_lesson_narrations` para esta aula não tiver rows de Part A ou Part C, o import precisa fazer **INSERT**, não UPDATE.

O plano diz "salva em `v10_lesson_narrations` onde `part = 'A'`" mas não diferencia insert vs update. Precisa de upsert logic.

---

## PLANO REVISADO

### Alterações ao plano anterior

| # | Gap | Correção |
|---|-----|----------|
| 1 | Dois caminhos de áudio | Desabilitar botão "Gerar Áudios" quando existem steps com `narration_script` preenchido. Mostrar tooltip "Use 'Processar Todos' para steps com script manual" |
| 2 | Part A/C read-only | Transformar cards de Part A/C em editáveis (textarea colapsável) após import |
| 3 | `handleProcessAll` ignora steps com áudio | Adicionar checkbox "Incluir steps já processados" no header da seção de scripts |
| 4 | `v10-generate-audio` ignora `narration_script` | Coberto pelo Gap 1 — desabilitar botão errado |
| 6 | Insert vs Update para A/C | Usar upsert no modal (SELECT → existe? UPDATE : INSERT) |

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/admin/v10/stages/ImportFullScriptModal.tsx` | **NOVO** — Modal com textarea, parser 3 zonas, auto-tagging, preview, upsert A/C |
| `src/components/admin/v10/stages/Stage5Narration.tsx` | **EDITAR** — Botão "Importar Script", Part A/C editáveis, checkbox reprocessar, desabilitar "Gerar Áudios" quando scripts manuais existem |

### Sem migration SQL necessária

Todas as colunas existem: `v10_lesson_steps.narration_script` e `v10_lesson_narrations.script_text`.

### Parser do ImportFullScriptModal

```text
Input: texto completo colado pelo admin
         ↓
Zona A: tudo entre "PARTE A" e "PARTE B" (ou primeiro "PASSO 1")
         → salva em v10_lesson_narrations.script_text (part='A')
         ↓
Zona B: split por /^PASSO\s+(\d+)\s*[—–-]/gm
         → 27 blocos → match por step_number → salva em v10_lesson_steps.narration_script
         ↓
Zona C: tudo entre "PARTE C" e marcadores de metadata (MÉTRICAS/MAPEAMENTO/MUDANÇA)
         → salva em v10_lesson_narrations.script_text (part='C')
         ↓
Strip: ignora tudo após "MÉTRICAS", "MAPEAMENTO", "Comparação", "MUDANÇA ESTRUTURAL"
```

Auto-tagging (checkbox, default ON):
- `[ANCHOR:pontos_atencao]` antes de "Agora, os pontos de atenção desse passo:"
- `[ANCHOR:confirmacao]` antes de "Deu certo se"
- `[ANCHOR:troca_ferramenta]` antes de `/Agora (mudamos de ferramenta|vamos pro|voltamos pro|volte pra|abra o)|Abra uma nova aba/i`
- Warning no UI: "Tags `[ANCHOR:troca_frame]` não são detectáveis automaticamente — adicione manualmente após importação"

### Fluxo completo

```text
1. Admin abre Stage 5 → clica "Importar Script Completo"
2. Cola script inteiro (A + B + C + metadata)
3. Preview: "Parte A: 280 palavras | 27 passos | Parte C: 170 palavras | 3 seções ignoradas"
4. Auto-tagging ON → ~44 tags inseridas
5. Clica "Importar" → upsert A, 27 updates, upsert C
6. Stage 5 recarrega → 27 textareas preenchidos, Part A/C editáveis
7. Revisa → adiciona [ANCHOR:troca_frame] onde necessário
8. Marca "Incluir steps já processados" se quiser
9. Clica "Processar Todos" → v10-process-anchors para cada step
10. Resultado: 27 áudios + ~44 anchors
```

