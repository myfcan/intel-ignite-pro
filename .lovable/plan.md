
# Feedback Didático Robusto para o Playground V8

## Problema Atual

O prompt de sistema da avaliação pede "feedback em 1-2 frases, ação concreta", o que gera respostas superficiais como:
> "Quase. Coloque 3 detalhes: onde você está, quando você precisa e o formato do retorno."

Isso nao ensina nada. O usuario nao entende O QUE faltou, POR QUE faltou, e COMO corrigir.

## Solucao

Duas mudancas coordenadas: backend (prompt de avaliacao) + frontend (renderizacao do feedback).

---

### A) Edge Function: `supabase/functions/v8-evaluate-prompt/index.ts`

Alterar o system prompt do modo "evaluate" para forcar resposta JSON estruturada:

**De:**
```
{"score": <numero>, "feedback": "<feedback em 1-2 frases>"}
```

**Para:**
```json
{
  "score": 75,
  "verdict": "Quase la!",
  "feedback": "Seu prompt tem objetivo claro, mas falta contexto de uso e formato de saida.",
  "criteriaBreakdown": [
    {"criterion": "Clareza do objetivo", "met": true, "detail": "Voce pediu exatamente o que queria — bom!"},
    {"criterion": "Contexto de uso", "met": false, "detail": "Faltou dizer ONDE voce vai usar isso (ferramenta, plataforma, situacao)."},
    {"criterion": "Formato de saida", "met": false, "detail": "Nao especificou COMO quer receber (lista, paragrafo, tabela, JSON)."}
  ],
  "suggestions": [
    "Adicione: 'Estou usando o ChatGPT para criar conteudo para Instagram'",
    "Termine com: 'Me entregue em formato de lista com 5 itens, cada um com titulo e descricao de 1 linha'"
  ],
  "improvedExample": "Crie 5 ideias de post para Instagram sobre produtividade para freelancers. Cada ideia deve ter: titulo chamativo (max 8 palavras) e descricao do conteudo (1 frase). Formato: lista numerada."
}
```

O novo prompt de sistema vai:
- Exigir breakdown por criterio (o que acertou e o que errou, com explicacao)
- Forcar sugestoes acionaveis com EXEMPLOS concretos de texto para adicionar
- Incluir um exemplo melhorado do proprio prompt do usuario
- Usar tom encorajador ("Voce esta quase la!" em vez de "Quase.")

### B) Frontend: `src/components/lessons/v8/V8PlaygroundInline.tsx`

Na area de feedback (linhas 279-294), substituir o bloco de texto plano por um componente estruturado que renderiza:

1. **Verdict** (header): Ex. "Voce esta quase la!" com emoji e cor baseada no score
2. **Feedback geral**: Frase resumo do que funcionou e o que faltou
3. **Breakdown por criterio**: Lista visual com check/X por criterio + explicacao detalhada
4. **Sugestoes**: Caixa destacada com acoes concretas que o usuario pode copiar
5. **Exemplo melhorado**: Bloco `font-mono` mostrando como o prompt DELE ficaria melhor (nao um prompt generico)

Layout visual:
```text
+------------------------------------------+
| Voce esta quase la!          Score: 75    |
|                                          |
| Seu prompt tem objetivo claro, mas...    |
|                                          |
| [check] Clareza do objetivo              |
|   Voce pediu exatamente o que queria.    |
|                                          |
| [X] Contexto de uso                      |
|   Faltou dizer ONDE voce vai usar isso.  |
|                                          |
| [X] Formato de saida                     |
|   Nao especificou COMO quer receber.     |
|                                          |
| --- Sugestoes ---                        |
| - Adicione: "Estou usando o ChatGPT..." |
| - Termine com: "Me entregue em..."       |
|                                          |
| --- Versao Melhorada ---                 |
| "Crie 5 ideias de post para..."         |
+------------------------------------------+
```

### C) Compatibilidade

- O frontend fara parse do JSON e, se vier no formato antigo (so `score` + `feedback` string), renderiza como hoje — sem quebrar nada
- O edge function retorna os novos campos mas mantem `score` e `feedback` como campos obrigatorios

---

## Arquivos Modificados

1. `supabase/functions/v8-evaluate-prompt/index.ts` — novo system prompt + parse do JSON expandido
2. `src/components/lessons/v8/V8PlaygroundInline.tsx` — renderizacao estruturada do feedback

## Sem mudancas de banco/backend adicionais
A edge function ja existe e o contrato HTTP nao muda (mesmo endpoint, mesmo mode "evaluate").
