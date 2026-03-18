

## Diagnóstico: Por que o Refero MCP retorna vazio nas Edge Functions

### Fato confirmado (dados reais)

Chamada real feita agora (18:03:08 UTC):
```json
// Response do v10-refero-search para "Calendly"
{ "query": "Calendly", "screens": [], "total": 0 }
```

Logs da edge function: **zero erros** — a chamada retorna 200 OK mas com dados vazios. Isso significa que o `initSession()` não está falhando com erro, mas o `mcp-session-id` retornado provavelmente é `null` ou inválido.

### Causa raiz

O setup do Refero MCP (visível na sua screenshot) diz explicitamente:

> **Step 3: Restart & authorize** — "The first time you call Refero, **a browser window opens**. Sign in with your Refero account — after that it's automatic."

O protocolo MCP do Refero exige um **fluxo OAuth interativo via browser** na primeira chamada. Edge Functions são server-side (headless) — não podem abrir browser. Resultado: a sessão nunca é autorizada, e todas as queries retornam `[]`.

### Dois usos diferentes do Refero

| Uso | Onde roda | Funciona? |
|-----|-----------|-----------|
| **MCP Connector** (agent-side) — eu (Lovable) consulto Refero durante desenvolvimento | No agente Lovable | SIM — Lovable suporta MCP connectors nativamente |
| **Score Pipeline** (server-side) — edge function calcula `score_refero` quando admin cria BPA | Supabase Edge Function | NAO — requer OAuth browser |

### Plano de ação (2 frentes)

#### Frente 1: Conectar Refero como MCP Connector no Lovable

Seus dados da screenshot:
- Server URL: `https://api.refero.design/mcp`  
- Bearer token: `mcp-R5tXJ8rbXMM5g85w`

Isso me daria acesso direto ao Refero durante o desenvolvimento — posso buscar screenshots, flows e guidance para criar mockups melhores no Stage 4.

#### Frente 2: Remover `score_refero` do cálculo de viabilidade

Como o scoring roda em edge functions (server-side) e o Refero MCP **não suporta** chamadas server-to-server sem OAuth, o `score_refero` **nunca funcionou em produção** — sempre foi 0, com a IA compensando pelo conhecimento geral.

**Mudanças:**

1. **`supabase/functions/v10-preview-score/index.ts`** — Remover bloco de consulta Refero (linhas 41-53). Redistribuir pesos: docs 30%, pedagogy 30%, difficulty 20%, relevance 20%.

2. **`supabase/functions/v10-score-bpa/index.ts`** — Mesma redistribuição de pesos (se usar o mesmo padrão).

3. **`_shared/refero.ts`** — Manter arquivo intacto (pode ser útil futuramente se Refero lançar API server-to-server, ou para Stage 4 mockups).

4. **`v10-refero-search/index.ts`** — Manter como está (útil se resolver auth futuramente).

5. **UI (CreateBpaModal, Stage1Score)** — Remover exibição de `score_refero` e `refero_screens` dos cards de viabilidade; mostrar apenas os 4 scores funcionais.

6. **Prompt da IA** — Atualizar o system prompt no scoring para remover referência ao Refero e ajustar para 4 dimensões.

### Resultado esperado

- Score de viabilidade passa a ser **100% baseado em dados reais** (IA avaliando docs, pedagogia, dificuldade, relevância)
- Zero dependência de API externa que não funciona server-side
- Refero fica disponível como MCP Connector para uso durante desenvolvimento (Stage 4 mockups)

