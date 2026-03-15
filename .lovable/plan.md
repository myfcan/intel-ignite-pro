

# Auditoria Forense: Gaps Reais do Plano Atual

## GAP CRÍTICO: Edge function gera texto curto, NÃO 9 seções

**Evidência real — `v8-generate-variations/index.ts` linha 77:**
```
2. Cada variação DEVE ter entre 3-8 linhas
```

**Evidência real — `v8-generate-variations/index.ts` linha 100:**
```typescript
text: { type: "string", description: "Texto da variação (3-8 linhas)" },
```

O schema do tool calling retorna `text: string` (parágrafo curto), enquanto o pipeline downstream exige 9 seções com 100+ palavras cada.

**Evidência real — `handleUseVariation` linhas 692-700:**
```typescript
const handleUseVariation = useCallback((variation: { lever: string; leverName: string; text: string }) => {
    setContentText(variation.text);  // ← popula textarea com parágrafo curto
    ...
```

**Evidência real — Hard Gate linhas 937-940:**
```typescript
if (preFinalSections.length < 9) {
    throw new Error(`Pipeline abortado: apenas ${preFinalSections.length} seções encontradas (mínimo 9)`);
}
```

**Efeito**: Admin gera variação → clica "Usar" → textarea recebe 3-8 linhas → clica "Converter e Gerar Tudo" → `parseFullContent` encontra 0-1 seções → Hard Gate aborta. **O Modelo 2 é inutilizável no pipeline atual.**

---

## Plano de Correção

### 1. Reescrever `supabase/functions/v8-generate-variations/index.ts`

Reutilizar a mesma estrutura pedagógica de 9 seções do `v8-generate-raw-content` (evidência: linhas 38-80, tabela de índices 0-8, regras de formatação, mínimo 100 palavras por seção).

**Mudanças concretas:**
- **Prompt**: Substituir o prompt curto (linhas 62-80) pela estrutura de 9 seções do `v8-generate-raw-content` (SYSTEM_PROMPT linhas 38-80), adicionando as regras de fidelidade do usuário:
  - NÃO crie novos fatos
  - Mantenha as ÂNCORAS exatamente (conteúdo e causalidade)
  - Só pode variar: palavras, ordem de frases, ritmo, diálogo curto, detalhes sensoriais leves
  - Cada variação aplica APENAS 1 ALAVANCA
- **Schema tool calling**: Trocar `text: string` por `sections: [{ title, content }]` (array de 9 objetos), idêntico ao `generate_lesson_sections` do `v8-generate-raw-content` (linhas 82-111)
- **Modelo**: Trocar `google/gemini-2.5-flash` por `google/gemini-2.5-pro` — output 3x maior (3 lições completas) exige modelo mais capaz
- **Validação defensiva**: Replicar as validações do `v8-generate-raw-content` (linhas 192-223): padding para 9 seções, forçar "Abertura" em index 0, word count check, strip trailing questions

### 2. Editar `handleUseVariation` em `AdminV8Create.tsx`

**De** (linha 693):
```typescript
setContentText(variation.text);
```
**Para**:
```typescript
const markdown = sectionsToMarkdown(variation.title, variation.description, variation.sections);
setContentText(markdown);
setLessonTitle(variation.title);
```
Isso garante que o textarea recebe markdown com `## Seção X` headers, compatível com `parseFullContent`.

### 3. Atualizar tipo do state `generatedVariations`

**De** (linha 254):
```typescript
useState<Array<{ lever: string; leverName: string; text: string; anchorChecklist?: Record<string, boolean> }>>
```
**Para**:
```typescript
useState<Array<{ lever: string; leverName: string; title: string; description: string; sections: Array<{ title: string; content: string }>; anchorChecklist?: Record<string, boolean> }>>
```

### 4. Atualizar UI dos cards de preview

**De** (linha 1523):
```typescript
<p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{v.text}</p>
```
**Para**: Mostrar título + contagem de seções/palavras + preview colapsável das primeiras 3 seções (truncadas a 200 chars cada).

### 5. Remover texto helper incorreto

**De** (linha 1497):
```
Gera 3 variações estilísticas com alavancas aleatórias (~5s). Escolha uma e depois estruture em 9 seções.
```
**Para**:
```
Gera 3 variações completas (9 seções cada) com alavancas aleatórias (~15-25s). Escolha a melhor.
```

### 6. Remover toast de warning incorreto

**De** (linha 698):
```
"⚠️ Este texto é uma variação narrativa. Estruture em 9 seções com ## Título antes de rodar o pipeline."
```
**Para**: Toast simples confirmando uso, sem warning sobre estruturação.

---

## Riscos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Timeout 60s (3 lições completas) | Médio | Gemini 2.5 Pro gera ~9 seções em ~15s; 3 variações via tool calling single-call deve caber em 45-55s |
| Custo maior (~$0.02 vs $0.002) | Baixo | Ferramenta admin, uso esporádico |
| IA gera <9 seções em alguma variação | Baixo | Padding defensivo por variação (replicar lógica do raw-content linhas 195-201) |

## Arquivos afetados

| Arquivo | Ação |
|---------|------|
| `supabase/functions/v8-generate-variations/index.ts` | **REESCREVER** — prompt 9 seções + schema sections[] + gemini-2.5-pro |
| `src/pages/AdminV8Create.tsx` | **EDITAR** — state type, handleUseVariation, cards preview, helper text, toast |

