Atue como um engenheiro sênior responsável pelo runtime de todo o sistema V8 e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:

&nbsp;

Você NÃO pode mentir.

Você NÃO pode supor.

Você NÃO pode responder com explicações genéricas.

Você NÃO pode omitir dados.

Você deve executar tudo com DADOS REAIS do código atual.

Você deve copiar e colar trechos REAIS do código.

Você deve usar logs reais e timestamps reais.

Se não souber algo, diga explicitamente: “NÃO LOCALIZADO NO CÓDIGO”.  
  
TUDO ISSO É MANDATÓRIO  
  
Fix: JSON parsing quebrado no edge function

## Problema

A regex na linha 159 do edge function (`/\{[\s\S]*?"score"[\s\S]*?\}/`) usa quantificador non-greedy que para no primeiro `}` encontrado. Com objetos aninhados em `criteriaBreakdown`, captura JSON incompleto. O `JSON.parse` falha e o fallback retorna JSON cru como texto na tela do usuario.

## Correcao

### Arquivo: `supabase/functions/v8-evaluate-prompt/index.ts`

**1. Substituir regex por parser de chaves balanceadas (linhas ~157-173):**

```typescript
try {
  const startIdx = content.indexOf('{');
  if (startIdx !== -1) {
    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') {
        depth--;
        if (depth === 0) { endIdx = i; break; }
      }
    }
    if (endIdx !== -1) {
      const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
      return jsonResp({
        score: parsed.score ?? 50,
        verdict: parsed.verdict || "",
        feedback: parsed.feedback || "",
        criteriaBreakdown: parsed.criteriaBreakdown || [],
        suggestions: parsed.suggestions || [],
        improvedExample: parsed.improvedExample || "",
      });
    }
  }
} catch {
  // Fallback below
}
```

**2. Corrigir fallback para nao vazar JSON cru (linha ~175):**

```typescript
return jsonResp({
  score: 50,
  feedback: "Avaliacao indisponivel. Tente novamente.",
  verdict: "Tente novamente",
  criteriaBreakdown: [],
  suggestions: [],
  improvedExample: "",
});
```

**3. Redeploy da edge function.**

## Escopo

- 1 arquivo: `supabase/functions/v8-evaluate-prompt/index.ts`
- 0 mudancas de banco
- 0 mudancas de frontend