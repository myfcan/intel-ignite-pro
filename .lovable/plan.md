
## Plano corrigido (robusto): impedir narração de `[ANCHOR:*]` no Pipeline V10

### Diagnóstico real (com evidência)
1. **Existe um gap no backend hoje**:  
   em `supabase/functions/v10-generate-audio/index.ts`, o fluxo de **Part A/C** chama TTS com `script` bruto (`generateTTSAudio(script, ...)`), sem sanitizar.
2. No mesmo arquivo, o fluxo de **steps** já sanitiza (`removeAnchorTags`) antes do TTS.
3. No banco da aula atual (`Automação com Calendly e GPT 3.0`), `v10_lesson_narrations` (partes A e C) está com tags `[ANCHOR:*]` no `script_text`, e os áudios foram gerados recentemente — logo, se esse texto vai cru para TTS, ele pode ser narrado.

---

### Implementação (o que será feito)

1. **Fechar o gap no `v10-generate-audio` (Part A/C)**
   - Em `handlePartNarration`, aplicar sanitização **antes** de chamar ElevenLabs:
     - `cleanScript = removeAnchorTags(script)`
     - TTS passa a usar `cleanScript`, nunca `script` bruto.
   - Preservar `script_text` original no banco (anchors continuam disponíveis para lógica/auditoria).

2. **Blindagem de sanitização para casos reais (futuras aulas)**
   - Em `supabase/functions/_shared/anchor-utils.ts`, separar regex de:
     - **parse** (estrito para tipos válidos)
     - **remove** (tolerante para variações de formatação, ex.: espaços/case)
   - Objetivo: mesmo tag fora do formato ideal não pode “vazar” para narração.

3. **Padronizar uso da sanitização nos dois caminhos de áudio**
   - `v10-generate-audio` (Part A/C e steps) e `v10-process-anchors` passam a usar a mesma lógica de limpeza compartilhada.
   - Evita regressão por divergência de implementação entre funções.

4. **Observabilidade no log do pipeline**
   - Incluir no `v10_bpa_pipeline_log` metadados de sanitização:
     - `script_length_original`
     - `script_length_clean`
     - `anchor_tags_removed`
   - Isso dá prova objetiva de que a limpeza ocorreu em cada geração.

5. **Remediação imediata da aula já afetada**
   - Após o patch, regenerar **Part A e Part C** da aula atual no Stage 5 (ou chamada direta da função), para substituir os MP3 já contaminados.
   - Steps não precisam retrabalho se já vieram via `v10-process-anchors` com limpeza correta.

6. **Validação final (obrigatória)**
   - Teste técnico: gerar áudio de teste com texto contendo anchors e confirmar no retorno/log que houve remoção.
   - Teste funcional end-to-end no player:
     - abrir a aula no mobile (viewport atual),
     - ouvir Part A/C e confirmar ausência total de “anchor/anxhor/...”
     - validar que progresso da aula segue normal.

---

### Arquivos impactados
- `supabase/functions/v10-generate-audio/index.ts`
- `supabase/functions/_shared/anchor-utils.ts`
- (opcional para observabilidade extra) util/log helper dentro de `v10-generate-audio`

---

### Critério de aceite
- Nenhum áudio novo (Part A/C/steps) narra tokens de controle `[ANCHOR:*]`.
- Anchors continuam preservados no script para uso lógico.
- Aula atual reprocessada e validada sem vazamento de tags.
