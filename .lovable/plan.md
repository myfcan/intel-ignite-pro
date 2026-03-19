
Diagnóstico sistêmico (com prova real)

1) Estado atual do fluxo (código real)
- Frontend chama a função em loop por chunk:
```ts
// src/components/admin/v10/stages/Stage2Structure.tsx
const { data, error } = await supabase.functions.invoke('v10-generate-steps', { body: { ... } });
if (error) {
  toast.error(`Erro ao gerar passos: ${error.message || 'erro desconhecido'}`);
  return false;
}
```
- Edge usa GPT-5 com timeout fixo:
```ts
// supabase/functions/v10-generate-steps/index.ts
const AI_TIMEOUT_MS = 110_000;
...
const aiModel = "openai/gpt-5";
...
const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
```
- Cada chunk ainda envia contexto pesado completo:
```ts
Documentação/notas do instrutor:
${pipeline.docs_manual_input || "..."}
${instructionsBlock}
```
- A função apaga dados antes de gerar (risco sistêmico):
```ts
if (shouldResetAll) {
  await supabase.from("v10_lesson_steps").delete().eq("lesson_id", lessonId)
  await supabase.from("v10_lesson_intro_slides").delete().eq("lesson_id", lessonId)
}
```

2) Evidência forense real (logs/timestamps)
- Log real de timeout (bloco fornecido):
`2026-03-19T17:38:10Z ERROR v10-generate-steps error: Error: AI timeout after 110000ms`
- Screenshot OCR real:
  - `Captura_de_Tela_2026-03-19_às_13.12.59.png`: “Failed to send a request to the Edge Function”
  - `Captura_de_Tela_2026-03-19_às_13.38.13.png`: “Edge Function returned a non-2xx status code”
- Analytics real (agora): `POST | 400 | .../v10-generate-steps | execution_time_ms: 1526 | version: 98`
- Replay real: toast de exclusão de pipeline em `1773942040241` (“Pipeline ... excluído.”)

3) Gaps do plano anterior (e efeito sistêmico)
- Gap A: chunking sem redução real de payload → timeout permanece.
- Gap B: erro esperado (timeout) retorna 500, UI mostra erro genérico.
- Gap C: telemetria de falha não persiste no banco; hoje só loga sucesso.
- Gap D: reset destrutivo antes da geração (perda de passos/intro se falhar no 1º chunk).
- Gap E: UX inconsistente (“Gerar com IA (10 passos)”) enquanto lógica é dinâmica.
- Gap F: histórico forense pode ser removido ao excluir pipeline (`delete` em `v10_bpa_pipeline_log`).

Plano robusto revisado (implementação)

Escopo de arquivos
- `supabase/functions/v10-generate-steps/index.ts`
- `src/components/admin/v10/stages/Stage2Structure.tsx`
- `src/pages/AdminV10Pipeline.tsx` (forense/retensão)

1) Edge: tornar timeout erro tratável (não genérico)
- Converter timeout de IA em resposta estruturada de negócio (retryable), com:
  - `error_type`, `stage`, `chunk_start/end`, `timings`, `prompt_sizes`, `retry_hint`.
- Manter 500 apenas para falhas inesperadas de infraestrutura.

2) Edge: reduzir payload por chunk de forma determinística
- Extrair somente bloco de instruções do intervalo `Passo N..M`.
- Em chunks > 1, não reenviar contexto completo; usar versão compacta.
- Repetir no mesmo modelo (`openai/gpt-5`) com modo compacto antes de falhar.

3) Edge: eliminar reset destrutivo antes de sucesso
- Remover delete global no início.
- Escrever chunk com `upsert` por `(lesson_id, step_number)` (constraint existente).
- Limpeza final (`> requestedSteps`) só após completar geração.

4) Edge: telemetria forense obrigatória em sucesso e falha
- Inserir `steps_generation_chunk_start`, `steps_generation_chunk`, `steps_generation_chunk_failed` em `v10_bpa_pipeline_log`.
- Incluir `request_id` e `version` em `details`.

5) Frontend: erro útil + retomada
- Ler payload de erro estruturado (stage/timings/chunk), não só `error.message`.
- Em timeout retryable: reduzir chunk dinamicamente e retomar do `next_chunk_start`.
- Corrigir rótulo do botão para não induzir “10 passos”.

6) Forense sistêmico
- Não apagar logs forenses ao excluir pipeline; manter histórico de incidentes.

Validação obrigatória (prova de robustez)
- Caso real com instrução longa (mesmo padrão das capturas).
- Evidências exigidas após correção:
  1. `v10_bpa_pipeline_log` com `steps_generation_chunk_start/chunk/failed` e timings.
  2. Ausência de erro genérico na UI; exibição de stage real em falha.
  3. Sem perda de passos preexistentes quando 1º chunk falhar.
  4. Continuidade de `step_number` sem duplicidade.
  5. Teste de ponta a ponta no fluxo “Gerar Passos” com retomada.

NÃO LOCALIZADO NO CÓDIGO
- Qualquer redirecionamento disparado durante `handleGenerateWithAI` (não há `navigate` nesse fluxo).
- Registro persistido de falhas recentes na tabela `v10_bpa_pipeline_log` com ações `steps_generation_chunk_failed` (consulta retornou vazio).
- Pipeline ativo que originou o último erro (foi excluído no fluxo observado).
