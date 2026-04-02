

# Análise de Impacto Sistêmico — 6 Ajustes Propostos

## Resumo Executivo

Dos 6 ajustes, **4 são seguros sem risco**, **1 precisa de cuidado moderado**, e **1 requer atenção especial** para não quebrar o pipeline.

---

## Fix 1: AbortController + Timeout 90s no `callAI()`

**Risco: BAIXO ✅**

- `callAI()` é chamado ~6x por pipeline (exercícios, coursiv, playground, insight, learnAndGrow, exercises finais)
- Adicionar `AbortController` com 90s é seguro — atualmente o fetch pode pendurar infinitamente, o que é pior
- O `AbortError` propagaria como exceção normal, e cada chamador já tem `try/catch`
- **Sem efeito colateral**: o timeout só dispara se o Gemini travar, caso em que já teríamos um pipeline pendurado

## Fix 2: `maxOutputTokens: 8192`

**Risco: BAIXO ✅**

- Atualmente não é especificado (usa default do gateway)
- Definir 8192 dá margem suficiente para qualquer exercício/playground
- **Sem efeito colateral**: não altera o comportamento quando a resposta é curta

## Fix 3: Validar `finish_reason` — retry se `"length"`

**Risco: MODERADO ⚠️ — precisa de cuidado**

- Se implementado com retry, adiciona latência (~90s extra no pior caso)
- O pipeline já é longo (6+ chamadas AI) — um retry por chamada pode fazer o total ultrapassar o timeout da edge function (padrão ~120s)
- **Mitigação necessária**: retry apenas 1x, e só para chamadas de exercício (não para todas as `callAI`)
- **Alternativa mais segura**: em vez de retry, simplesmente rejeitar (throw) com mensagem clara — o frontend já trata erros e mostra fallback

## Fix 4: Validar `arguments` não ser `"{}"` ou vazio

**Risco: NENHUM ✅**

- Adicionaria 3 linhas de validação pós-`JSON.parse`
- Se `arguments` é `{}`, o exercício seria gerado sem dados — hoje isso passa silenciosamente e causa o bug de "1 opção"
- Rejeitar com throw é correto — o pipeline já trata falhas de exercício individualmente sem abortar o resto
- **Sem efeito colateral**

## Fix 5: Log de `finish_reason` para diagnóstico

**Risco: NENHUM ✅**

- Apenas um `console.log` adicional
- Não altera fluxo algum

## Fix 6: Anti-duplicação de "Abertura" no parser

**Risco: MODERADO ⚠️ — precisa de cuidado especial**

Análise detalhada do fluxo atual:
1. `parseSections()` extrai seções a partir de `##` — retorna lista SEM "Abertura"
2. Linha 63: se `description.length > 20`, cria Section 0 "Abertura" com `unshift`
3. O `## Abertura` do raw content JÁ é capturado por `parseSections()` como uma seção normal

**Se o raw content tem `## Abertura`:**
- `parseSections` cria seção com título "Abertura" e posição X
- O bloco 60-73 TAMBÉM cria Section 0 "Abertura" com posição 0
- Resultado: **2 seções "Abertura"** — uma com o description (entre # e ##), outra com o conteúdo sob `## Abertura`

**O fix correto**: antes de `unshift`, verificar se `parsedSections[0].title` começa com "Abertura" (case-insensitive). Se sim, **mesclar** o description no conteúdo dessa seção existente em vez de criar uma nova.

**Risco potencial de NÃO fazer merge**: se simplesmente pular o Section 0, o conteúdo entre `#` e `## Abertura` seria **perdido** (o description descartado). Isso mudaria o comportamento para aulas existentes cujo description é substantivo.

**Risco potencial de fazer merge errado**: se o `## Abertura` já contém o mesmo texto do description (repetição do raw content), o merge criaria conteúdo duplicado.

**Mitigação**:
- Comparar os primeiros 50 chars do description com o conteúdo da seção `## Abertura`
- Se overlap > 80%, skip Section 0 (texto já está na seção)
- Se overlap < 80%, prepend description ao conteúdo da seção existente
- Isso garante zero perda de conteúdo sem duplicação

---

## Impacto em Lições Existentes

**Fixes 1-5**: ZERO impacto em lições já publicadas. Eles só afetam o momento de GERAÇÃO de novas lições.

**Fix 6**: Afeta o PARSER que é usado tanto na criação (AdminV8Create) quanto potencialmente no reprocessamento. Lições já salvas no banco (como JSON) NÃO passam pelo parser novamente — o parser só roda no raw content textual. **Sem impacto em lições publicadas.**

---

## Plano de Implementação (3 arquivos)

### `supabase/functions/v8-generate-lesson-content/index.ts`
- `callAI()`: adicionar AbortController 90s, `maxOutputTokens: 8192`, log de `finish_reason`
- Pós-parse: validar `arguments !== "{}"` e que contém a key esperada
- Retry condicional: apenas 1x, apenas se `finish_reason === "length"`, apenas para chamadas de exercício

### `src/lib/v8ContentParser.ts`
- Antes do `unshift` (linha 69): verificar overlap com `parsedSections[0]` se título contém "Abertura"
- Se overlap alto → skip; se baixo → merge description como prepend

### Nenhum outro arquivo afetado

---

## Veredicto

✅ **Seguro implementar todos os 6 fixes** desde que:
1. O retry do Fix 3 seja limitado a 1 tentativa e apenas para exercícios
2. O Fix 6 use lógica de overlap para evitar perda ou duplicação de conteúdo

Nenhum dos fixes altera a estrutura de dados salva no banco, o schema do V8LessonData, ou o comportamento do player. São todos defensivos (validação, timeout, deduplicação).

