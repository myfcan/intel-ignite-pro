

# Auditoria Forense do Plano: Modelo 2 — Editor de Variações (3 variações)

## ANÁLISE COM DADOS REAIS

---

## 1. CONFIRMADO: O ponto de inserção na UI está claro

**Evidência real — `AdminV8Create.tsx` linhas 1331-1381:**
O bloco "Gerar Conteúdo com IA" ocupa as linhas 1331-1381 e contém: `genTitle`, `genVariation` (Select com 3 opções), `genObjectives` (textarea), botão "Gerar Preview com IA". O Modelo 2 precisa ser inserido como alternativa dentro desse bloco.

**Risco: ZERO.** O ponto de inserção é claro e isolado.

---

## 2. CONFIRMADO: `handleGenerateWithAI` é o handler de referência

**Evidência real — `AdminV8Create.tsx` linhas 577-631:**
```typescript
const handleGenerateWithAI = useCallback(async () => {
  // ...
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/v8-generate-raw-content`,
    // ...
  );
  const data = await res.json();
  const markdown = sectionsToMarkdown(data.title, data.description, data.sections);
  setContentText(markdown);
```

O handler chama a edge function, converte resultado para markdown via `sectionsToMarkdown()`, e popula `contentText`. O Modelo 2 terá um handler análogo mas **não usa `sectionsToMarkdown`** — ele popula `contentText` com o texto da variação escolhida diretamente.

---

## 3. GAP SISTÊMICO CONFIRMADO: `narrativeVariation` contaminação

**Evidência real — `AdminV8Create.tsx` linha 883:**
```typescript
narrativeVariation: genVariation,
```

O `genVariation` (linha 247, default `"everyday"`) é sempre salvo no `finalData`. Se o admin usa Modelo 2 e depois roda "Converter e Gerar Tudo", o `narrativeVariation` será `"everyday"` em vez de refletir que veio do Editor de Variações.

**Correção obrigatória:** Quando Modelo 2 for usado e o admin clicar "Usar esta variação", setar `genVariation` para um valor que identifique o Modelo 2 — ou adicionar lógica condicional na linha 883 baseada em `genModel`.

**Impacto sem correção:** Metadado incorreto no JSON salvo. Não quebra o pipeline, mas compromete rastreabilidade.

---

## 4. GAP UX CONFIRMADO: Texto curto ≠ 9 seções

**Evidência real — `AdminV8Create.tsx` linha 642:**
```typescript
const parsed = parseFullContent(contentText);
```

**Evidência real — linha 869:**
```typescript
if (preFinalSections.length < 9) {
  throw new Error(`Pipeline abortado: apenas ${preFinalSections.length} seções encontradas (mínimo 9)`);
}
```

O Modelo 2 gera variações de um **texto narrativo curto** (3-6 linhas). Se o admin clicar "Converter e Gerar Tudo" diretamente com esse texto, `parseFullContent` vai encontrar 0-1 seções e o Hard Gate aborta.

**Isso NÃO é um bug** — é o comportamento esperado do pipeline V8-C01. Mas a UX deve guiar:
- Opção A: Mostrar aviso no card da variação escolhida: "Este texto precisa ser estruturado em 9 seções antes do pipeline."
- Opção B: Usar a variação como inspiração/conteúdo de 1 seção, e o admin monta as outras 8 manualmente.

**Risco: MÉDIO.** O admin pode se confundir achando que o texto da variação é a aula completa.

---

## 5. ANÁLISE: Edge Function `v8-generate-variations` — Riscos

### 5a. Prompt injection via âncoras
O admin cola âncoras livremente no textarea. Essas strings vão direto para o prompt do sistema. Se alguém colar instruções maliciosas nas âncoras, pode alterar o comportamento da IA.

**Risco: BAIXO** (apenas admins autenticados usam, não é user-facing). Mitigação: sanitizar âncoras removendo `\n---\n`, `SYSTEM:`, etc.

### 5b. Custo e latência
3 variações de texto curto (3-6 linhas cada) via `google/gemini-2.5-flash` com tool calling. Estimativa: ~3-5 segundos, ~$0.002 por chamada.

**Risco: NENHUM.**

### 5c. Formato da resposta
Com tool calling e schema estrito (`variations: [{ lever, leverName, text, anchorChecklist }]`), o risco de formato inesperado é baixo. O `v8-generate-raw-content` já usa o mesmo padrão com sucesso (linha 82-111).

**Risco: BAIXO.**

### 5d. Shuffle de alavancas
O plano propõe embaralhar 6 alavancas e selecionar 3 aleatórias. Usar `Math.random()` com Fisher-Yates no Deno é seguro.

**Risco: NENHUM.**

---

## 6. ANÁLISE: Efeito sistêmico no pipeline downstream

| Componente | Impacto | Justificativa |
|------------|---------|---------------|
| `parseFullContent()` | **NENHUM** | Só é chamado quando admin clica "Converter e Gerar Tudo", não na geração do Modelo 2 |
| `v8-refine-content` | **NENHUM** | Só é chamado dentro de `handleConvertAndGenerate`, não pelo Modelo 2 |
| Hard Gate V8-C01 | **NENHUM** | O Modelo 2 popula `contentText`, não dispara o pipeline |
| `handleSave` | **NENHUM** | Salva o `jsonText`, não o `contentText` bruto |
| Audio pipeline | **NENHUM** | Só roda após JSON válido |
| `create_lesson_draft` RPC | **NENHUM** | Só chamado no pipeline completo |

**Conclusão: ZERO efeito sistêmico.** O Modelo 2 opera exclusivamente no textarea `contentText` (pré-pipeline). É uma ferramenta de escrita, não de geração estruturada.

---

## 7. ANÁLISE: Tamanho do arquivo `AdminV8Create.tsx`

**Atual: 1581 linhas.** Adicionar o Modelo 2 (seletor + 2 textareas + handler + display de 3 cards) adiciona ~100-130 linhas.

**Risco: BAIXO.** O arquivo já é grande mas a adição é modular (confinada ao bloco 1331-1381).

---

## 8. RESUMO DE RISCOS

| Risco | Severidade | Probabilidade | Ação |
|-------|-----------|--------------|------|
| `narrativeVariation` contaminada | Baixo | 100% sem fix | Setar valor condicional na linha 883 |
| Admin confunde variação com aula completa | Médio | Alto sem UX | Adicionar aviso no card da variação |
| IA ignora âncoras | Baixo | ~5% | Checklist no output + log de warning |
| IA retorna <3 variações | Baixo | ~2% | Padding defensivo como no `v8-generate-raw-content` linha 195 |
| Timeout da edge function | Desprezível | <1% | Texto curto, resposta rápida |

---

## 9. PLANO VALIDADO — Pronto para execução

### Arquivos

| Arquivo | Ação |
|---------|------|
| `supabase/functions/v8-generate-variations/index.ts` | **NOVO** |
| `supabase/config.toml` | **EDITAR** — Adicionar entry |
| `src/pages/AdminV8Create.tsx` | **EDITAR** — Seletor + campos + handler + cards |
| `src/types/v8Lesson.ts` | **EDITAR** — Expandir `narrativeVariation` |

### Correções obrigatórias incluídas no plano
1. Linha 883 de `AdminV8Create.tsx`: `narrativeVariation` condicional baseada em `genModel`
2. UI: aviso no card da variação sobre necessidade de estruturar em 9 seções
3. Edge function: padding defensivo se IA retornar <3 variações
4. Edge function: sanitização básica de âncoras (strip de instruções)

