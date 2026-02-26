# 🔎 Auditoria Robusta V7-vv (pós-Merge 208)

**Data:** 2026-02-26  
**Escopo:** backend `v7-vv`, player V7, contratos de runtime, qualidade de build/testes.  
**Objetivo:** verificar estabilidade real após o ciclo de correções até o Merge 208 e identificar gargalos remanescentes.

---

## 1) Resumo executivo

Status geral do sistema: **PARCIALMENTE ESTÁVEL**.

- ✅ **Lint**: sem erros.
- ✅ **Build de produção**: concluído com sucesso.
- ✅ **Guardrail de pipeline legado**: sem uso proibido de `invoke("v7-pipeline")`.
- ❌ **Testes unitários (runner)**: suíte falha por dois arquivos com sufixo `.test.ts` sem `describe/it` (não são testes Vitest, e sim utilitários de console).
- ❌ **E2E contrato V7**: falha no bootstrap por uso de `__dirname` em arquivo ESM.

> Conclusão: o núcleo compila, porém há problemas de **infra de testes** que impedem validação contínua confiável do V7-vv.

---

## 2) Evidências de auditoria (checks executados)

1. `npm run lint` → **PASSOU**.  
2. `npm run build` → **PASSOU** (com warnings de chunk e import dinâmico/estático).  
3. `npm run check:no-legacy-pipeline` → **PASSOU**.  
4. `npm run test:unit` → **FALHOU** por descoberta inválida de suítes em arquivos utilitários `.test.ts`.  
5. `npm run test:e2e:v7` → **FALHOU** por erro de ambiente ESM (`ReferenceError: __dirname is not defined in ES module scope`).

---

## 3) Achados críticos

### CRÍTICO A — Falso negativo no pipeline de testes unitários

**Impacto:** CI/CD pode marcar regressão inexistente; reduz confiança no gate de qualidade.

**Causa técnica:** arquivos `src/lib/exerciseValidator.test.ts` e `src/lib/lessonDataProcessor.test.ts` são scripts manuais para uso em `window`/console, não suítes Vitest.

- O primeiro exporta `runExerciseValidationTests()` e injeta em `window`, sem `describe/it`.
- O segundo exporta `testLessonProcessor()` e também injeta em `window`, sem `describe/it`.

**Risco operacional:** a cada execução do `vitest run`, esses arquivos são incluídos e derrubam a suíte com “No test suite found”.

**Ação recomendada (prioridade alta):**
- Renomear para `*.manual.ts` **ou** mover para pasta fora do padrão de descoberta do Vitest.
- Alternativa complementar: ajustar `vitest.config.ts` para incluir apenas padrões válidos (ex.: `**/*.spec.ts`, `**/*.test.spec.ts`).

---

### CRÍTICO B — Quebra da suíte E2E de contrato V7 em ambiente ESM

**Impacto:** contrato de runtime V7 não é validado em pipeline automatizado.

**Causa técnica:** `tests/e2e/v7-runtime-contract.spec.ts` usa `path.resolve(__dirname, ...)` em projeto `type: module`, onde `__dirname` não existe.

**Risco operacional:** regressões de contrato (anchor timing, pause state, forensic logs) podem entrar em produção sem cobertura.

**Ação recomendada (prioridade alta):**
- Migrar para padrão ESM:

```ts
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

ou substituir diretamente por `new URL('../../artifacts', import.meta.url)` + conversão apropriada quando necessário.

---

## 4) Achados relevantes (não bloqueantes)

### ALTO C — Warnings de bundle e chunk size

Build passa, mas há alertas de chunk acima de 500 kB e mistura de import dinâmico + estático para o client Supabase.

**Impacto provável:** piora de performance inicial e cache inefficiency, especialmente em rotas administrativas e player.

**Ação recomendada:** planejar fase de performance (code-splitting/manualChunks e limpeza de fronteiras de importação).

---

### MÉDIO D — Dependência de baseline-browser-mapping desatualizada

A ferramenta alerta dataset com mais de 2 meses.

**Impacto:** apenas diagnóstico de compatibilidade de browser potencialmente defasado; não bloqueia build.

**Ação recomendada:** atualizar dev dependency conforme instrução do próprio tooling.

---

## 5) Diagnóstico do estado do V7-vv pós-Merge 208

Com base na execução de checks e no comportamento observado:

- O **produto compila** e mantém guardrails de não regressão contra pipeline legado.
- O **gargalo principal agora é operacional de QA automatizado** (unit/e2e), não de compilação.
- Sem corrigir os pontos A e B, qualquer auditoria futura continuará com sinal misturado (falhas de infraestrutura mascarando qualidade real do domínio V7).

---

## 6) Plano de ação objetivo (próxima iteração)

1. **Hotfix Test Discovery (A)**
   - Renomear/mover scripts manuais de console.
   - Validar `npm run test:unit` verde.

2. **Hotfix ESM no E2E (B)**
   - Corrigir resolução de paths no `v7-runtime-contract.spec.ts`.
   - Reexecutar `npm run test:e2e:v7`.

3. **Aprimoramento de Performance (C)**
   - Definir `manualChunks` e reduzir acoplamento de imports no client Supabase.

4. **Higiene de Ferramentas (D)**
   - Atualizar `baseline-browser-mapping` em devDeps.

---

## 7) Veredito da auditoria

**Veredito atual:** 🟡 **Aprovado com ressalvas críticas de infraestrutura de teste**.

O sistema V7-vv está funcional no build, mas a confiança de regressão automática está comprometida até a correção dos dois pontos bloqueantes de testes (A e B).
