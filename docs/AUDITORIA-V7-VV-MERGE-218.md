# 🔎 Auditoria Robusta V7-vv (até o Merge 218)

**Data:** 2026-02-26  
**Baseline auditado:** estado atual após integração até o commit de merge `f301238` (PR #218).  
**Escopo:** pipeline `v7-vv`, runtime contracts C11, qualidade operacional de lint/build/testes.

---

## 1) Resumo executivo

Status geral observado: **PARCIALMENTE ESTÁVEL** (mesmo padrão do checkpoint anterior, sem resolução dos bloqueios de QA automatizado).

- ✅ Lint passa sem erros.
- ✅ Build de produção conclui com sucesso.
- ✅ Guardrail contra pipeline legado permanece íntegro.
- ❌ Unit tests continuam falhando por descoberta inválida de arquivos `.test.ts` que não contêm suíte Vitest.
- ❌ E2E de contrato V7 continua falhando em bootstrap por `__dirname` em escopo ESM.

**Leitura prática:** o produto compila e mantém controles importantes, mas ainda não possui gate automatizado confiável para regressão do V7-vv.

---

## 2) Evidências executadas nesta auditoria (Merge 218)

1. `npm run lint` → **PASSOU**.
2. `npm run build` → **PASSOU** (com warnings de chunk size e import dinâmico/estático no client Supabase).
3. `npm run check:no-legacy-pipeline` → **PASSOU**.
4. `npm run test:unit` → **FALHOU** com `No test suite found` para:
   - `src/lib/exerciseValidator.test.ts`
   - `src/lib/lessonDataProcessor.test.ts`
5. `npm run test:e2e:v7` → **FALHOU** com:
   - `ReferenceError: __dirname is not defined in ES module scope`
   - arquivo: `tests/e2e/v7-runtime-contract.spec.ts`.

---

## 3) Achados críticos (ainda abertos)

### CRÍTICO 1 — Quebra do gate unitário por arquivos manuais com sufixo `.test.ts`

**Sintoma:** Vitest inclui scripts utilitários de console como se fossem suíte automatizada, resultando em falha de execução global.

**Impacto:** sinal falso-negativo no CI; perda de confiabilidade no quality gate.

**Recomendação objetiva:**
- Renomear os dois arquivos para padrão não coletável pelo Vitest (ex.: `*.manual.ts`), **ou**
- mover para pasta fora da convenção de testes, **ou**
- restringir `include` no `vitest.config.ts` para padrões de suíte reais.

---

### CRÍTICO 2 — E2E C11 indisponível por incompatibilidade ESM

**Sintoma:** teste falha antes de iniciar por uso de `__dirname` em módulo ESM.

**Impacto:** contratos de runtime C11 (anchor audit/timing) não são validados automaticamente.

**Recomendação objetiva:** migrar para padrão ESM com `import.meta.url` + `fileURLToPath`, ou `new URL(...)` para resolver caminhos de artefatos e storage state.

---

## 4) Achados relevantes (não bloqueantes)

### ALTO — Bundle/Chunk warnings persistentes

- Há chunks > 500kB no build.
- Há mistura de import dinâmico e estático envolvendo `src/integrations/supabase/client.ts`.

**Risco:** pior tempo de carregamento inicial e chunking subótimo.

---

### MÉDIO — Aviso de `baseline-browser-mapping` desatualizado

**Risco:** baixo para funcionamento; médio para assertividade de baseline de compatibilidade.

---

## 5) Delta de status: Merge 208 → Merge 218

**Resultado do delta:** **sem mudança estrutural** nos bloqueios de QA automatizado.

- O estado de compilação/guardrails continua positivo.
- Os dois bloqueios críticos de testes permanecem abertos.
- Portanto, o risco operacional de regressão não detectada no V7-vv segue maior do que o aceitável para um gate “verde” confiável.

---

## 6) Plano de ação recomendado (prioridade imediata)

1. **Hotfix A (Unit Discovery):** retirar scripts manuais da descoberta Vitest.
2. **Hotfix B (E2E ESM):** ajustar path resolution do `v7-runtime-contract.spec.ts` para ESM.
3. **Revalidação completa:** repetir os 5 comandos de auditoria e exigir verde em lint/build/check/testes.
4. **Fase 2:** tratar performance de chunking e atualizar baseline-browser-mapping.

---

## 7) Veredito final desta rodada

🟡 **Aprovado com ressalvas críticas**.

Até o Merge 218, o V7-vv segue funcional para build, porém ainda com **infra de testes parcialmente quebrada** (unit + e2e), impedindo uma auditoria de regressão plenamente confiável.
