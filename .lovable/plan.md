

# Auditoria: 3 Bugs no Parser do ImportFullScriptModal

## Bug 1 (CRÍTICO): Regex não detecta passos com formatação Markdown

**Linha 118:**
```typescript
const stepPattern = /^PASSO\s+(\d+)\s*[—–-]\s*(.+)$/gm;
```

O script do usuario tem `**PASSO 1 — Criar conta no Make.com**` (bold markers `**`). O `^` exige que a linha comece com `PASSO`, mas começa com `**`. Resultado: 0 matches, botão desabilitado.

**Fix:** Permitir prefixos markdown opcionais:
```typescript
const stepPattern = /^\*{0,2}PASSO\s+(\d+)\s*[—–-]\s*(.+?)\*{0,2}$/gm;
```

Mesmo problema na linha 139 (remoção do header do body):
```typescript
body = body.replace(/^\*{0,2}PASSO\s+\d+\s*[—–-][^\n]*\*{0,2}\n?/, '').trim();
```

---

## Bug 2 (CRÍTICO): Auto-tagger duplica tags quando script JÁ tem anchors

O script do usuario **já contém** `[ANCHOR:pontos_atencao]`, `[ANCHOR:confirmacao]`, etc. Com auto-tag ON, o tagger insere OUTRA tag antes de cada frase-âncora. Exemplo:

```
[ANCHOR:pontos_atencao]        ← original

[ANCHOR:pontos_atencao]        ← inserido pelo auto-tagger
Agora, os pontos de atenção...
```

O dedup (linha 64) exige tags em linhas **consecutivas** (`(\[ANCHOR:[^\]]+\]\n){2,}`), mas a linha em branco entre elas quebra o match. Resultado: tags duplicadas no script salvo.

**Fix:** Antes de rodar `autoTagScript`, detectar se o texto já contém `[ANCHOR:` e pular o auto-tagging. Ou melhor: desativar o checkbox auto-tag automaticamente quando tags existentes são detectadas no input.

```typescript
const hasExistingTags = rawText.includes('[ANCHOR:');
// No useMemo ou no render: se hasExistingTags, forçar autoTag = false e mostrar badge "Tags detectadas no script"
```

---

## Bug 3 (MENOR): Zone A regex pode capturar headers markdown

**Linha 102:**
```typescript
const partAMatch = text.match(/PARTE\s+A[^\n]*\n([\s\S]*?)(?=PARTE\s+B|PASSO\s+1\s*[—–-])/i);
```

O script tem `## PARTE A — CONTEXTO (~2 min)` seguido de `---` (separador). O regex captura corretamente PARTE A, mas o body inclui as linhas `---` como conteúdo. Mesma situação para headers `### FASE 1 —`.

**Fix:** Adicionar pré-processamento que remove:
- Linhas que são apenas `---`
- Linhas que começam com `###` (headers de fase)
- Bold markers `**`

```typescript
function preprocessMarkdown(text: string): string {
  return text
    .replace(/^\*\*/gm, '')           // remove ** no início de linha
    .replace(/\*\*$/gm, '')           // remove ** no fim de linha
    .replace(/^---+\s*$/gm, '')       // remove separadores
    .replace(/^###\s+FASE\s+\d+[^\n]*/gm, ''); // remove headers de fase
}
```

---

## Resumo das alterações

| Arquivo | Alteração |
|---------|-----------|
| `ImportFullScriptModal.tsx` | 1. Adicionar `preprocessMarkdown()` no início do `parseFullScript` |
| | 2. Atualizar regex de step (linha 118) e cleanup (linha 139) para aceitar `**` |
| | 3. Detectar `[ANCHOR:` existentes no input e desabilitar auto-tag automaticamente |
| | 4. Mostrar badge "Tags já presentes no script" quando detectadas |

Nenhum outro arquivo afetado. Sem migration SQL.

