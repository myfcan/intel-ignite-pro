

# Verificacao do Plano — v10-process-anchors

## Estado real verificado agora (queries + search executados)

| Item | Plano dizia | Estado real | Correto? |
|---|---|---|---|
| Tabela `v10_lesson_step_anchors` | NÃO EXISTE | Query retornou `[]` — **NÃO EXISTE** | SIM |
| Coluna `narration_script` em `v10_lesson_steps` | NÃO EXISTE | Query retornou `[]` — **NÃO EXISTE** | SIM |
| `v10-process-anchors` em `config.toml` | NÃO LISTADO | Search retornou 0 matches — **NÃO LISTADO** | SIM |
| Bucket `lesson-audio` vs `lesson-audios` | MISMATCH | Código usa `lesson-audio` (linhas 177, 189). Bucket real é `lesson-audios` (plural) | SIM |
| `_shared/anchor-utils.ts` | EXISTE | Confirmado — 25 matches encontrados | SIM |
| `_shared/auth.ts` | EXISTE | Confirmado no codebase (fornecido no contexto) | SIM |
| Secret `ELEVENLABS_API_KEY` | EXISTE | Listado em secrets | SIM |
| Secret `ELEVENLABS_API_KEY_1` | EXISTE | Listado em secrets (connector) | SIM |

## Conclusao

O plano anterior esta **100% correto**. As 4 acoes necessarias permanecem validas:

1. **Migration SQL** — criar tabela `v10_lesson_step_anchors` + adicionar coluna `narration_script` em `v10_lesson_steps`
2. **Corrigir bucket name** — trocar `'lesson-audio'` para `'lesson-audios'` nas linhas 177 e 189 de `v10-process-anchors/index.ts`
3. **Adicionar ao `config.toml`** — entry `[functions.v10-process-anchors]` com `verify_jwt = false`
4. **Deploy** da edge function

Nenhum gap novo encontrado. Pode aprovar para execucao.

