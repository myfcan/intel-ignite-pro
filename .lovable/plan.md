

# Monitor de Pipeline V8 + Correcao do Botao

## Alteracoes em `src/pages/AdminV8Create.tsx`

### 1. Texto do botao
Linha 445: trocar `Gerar Áudios ({validation.sectionCount} seções + {validation.quizCount} quizzes)` por **"Gerar Aula"**.

### 2. Importar V7PipelineMonitor
Importar `V7PipelineMonitor`, `PipelineStep`, `PipelineLog` de `@/components/admin/V7PipelineMonitor`.

### 3. Adicionar estados do pipeline
```text
pipelineSteps: PipelineStep[]   (6 steps V8)
pipelineLogs: PipelineLog[]     (logs em tempo real)
pipelineProgress: number        (0-100)
pipelineError: string | null
```

### 4. Definir steps padrao V8
```text
1. validate       — Validando JSON de entrada
2. create-draft   — Criando rascunho no banco
3. call-api       — Chamando API de geracao (ElevenLabs)
4. process-results — Processando resultados
5. update-content — Atualizando conteudo com URLs de audio
6. finalize       — Finalizando
```

### 5. Instrumentar handleGenerateAudio
Adicionar helpers `updateStep(id, status, message?)` e `addLog(level, message)` para atualizar os estados em cada etapa do fluxo existente (linhas 159-239). O fluxo ja tem as etapas certas — so precisa emitir eventos para o monitor:

- Antes do parse: step `validate` running -> completed
- Antes do `create_lesson_draft`: step `create-draft` running -> completed
- Antes do fetch `v8-generate`: step `call-api` running
- Apos response ok: step `call-api` completed, `process-results` running -> completed
- Apos atualizar JSON com URLs: step `update-content` completed
- Final: step `finalize` completed, progress 100%
- Em caso de erro: marcar step atual como error, adicionar log de erro

### 6. Fix do erro [object Object]
No catch (L233-236), erros do Supabase podem ser objetos. Corrigir:
```
const msg = err instanceof Error ? err.message :
            typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err);
```
(Ja esta correto na L234 atual — manter)

### 7. Substituir spinner generico pelo V7PipelineMonitor
Remover o bloco de spinner (L449-455) e colocar o componente `V7PipelineMonitor` no lugar, passando `isRunning={isGenerating}`, `steps={pipelineSteps}`, `logs={pipelineLogs}`, `progress={pipelineProgress}`, `error={pipelineError}`.

O monitor aparecera abaixo do botao "Gerar Aula" com o mesmo design padrao do V7: barra de progresso, etapas com icones de status, e logs em tempo real.

### Resultado
- Botao diz apenas "Gerar Aula"
- Ao clicar, o monitor aparece com 6 etapas visuais
- Cada etapa muda de pending -> running -> completed em tempo real
- Erros sao exibidos com detalhes no monitor
- Mesmo design do Pipeline V7

