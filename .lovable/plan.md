

# Auditoria Forense PR#244 — Dados Reais

---

## 1. VEREDICTO: O auto-fix C2/C3 EXISTE no código mas NÃO FOI EXECUTADO

### Evidência 1 — Código existe (CONFIRMADO)

O bloco 7c de post-processing está em `supabase/functions/v10-generate-steps/index.ts` linhas 386-564:

```typescript
// 7c. POST-PROCESSING: Auto-inject tooltip_term (C2) and nav_breadcrumb (C3)
const TECH_TERMS: Record<string, string> = {
  "api": "Interface que permite dois softwares se comunicarem automaticamente",
  "webhook": "URL que recebe dados automaticamente quando um evento acontece",
  // ... 80+ termos
  "calendly": "Ferramenta de agendamento online que sincroniza com seu calendario",
  // ...
};
```

O fix C2 (linhas 486-528) busca termos no dicionário e injeta `tooltip_term`.
O fix C3 (linhas 536-563) detecta `bar_sub` diferente e injeta `nav_breadcrumb`.

### Evidência 2 — Dados no banco NÃO possuem os fixes (CONFIRMADO)

Query real contra `v10_lesson_steps` para lesson_id `dcefa80b-29a9-4ef6-9fea-38b31b3c7f7a`:

| Step | tooltip_count | breadcrumb_count | description length |
|------|-------------|-----------------|-------------------|
| Criar conta no Calendly | **0** | 0 | 176 chars |
| Criar tipo de evento no Calendly | 1 | 0 | 157 chars |
| Configurar perguntas personalizadas | **0** | 1 | 152 chars |
| Criar conta no OpenAI e API Key | **0** | 1 | 195 chars |
| Criar conta no Make.com | **0** | 0 | 187 chars |
| Adicionar o gatilho do Calendly | **0** | 0 | 142 chars |
| Adicionar o modulo OpenAI (ChatGPT) | **0** | 0 | 161 chars |
| Configurar o prompt do ChatGPT | **0** | 0 | 177 chars |
| Adicionar modulo de Email (Gmail) | **0** | 0 | 176 chars |
| Configurar o Email de Follow-up | **0** | 0 | 117 chars |
| Testar e Ativar o Cenário | **0** | 0 | 153 chars |
| Verificar a automacao | **0** | 1 | 123 chars |
| Desativar ou Excluir o Cenário | **0** | 1 | 172 chars |
| Revisao e próximos passos | **0** | 0 | 162 chars |

**13 de 15 steps têm 0 tooltip_term. 10 de 15 têm 0 nav_breadcrumb.** Todos com description > 50 chars.

### Evidência 3 — Logs da edge function: VAZIOS

```
supabase--edge_function_logs("v10-generate-steps", "C2 fix") → No logs found
supabase--edge_function_logs("v10-generate-steps", "post-processing") → No logs found
supabase--edge_function_logs("v10-generate-steps", "") → No logs found
```

Nenhum log da edge function foi encontrado. Isso indica que **a versão deployada da função NÃO contém o bloco 7c**, ou os logs expiraram.

---

## 2. DIAGNÓSTICO ROOT-CAUSE

O código do auto-fix está no repositório, mas **a edge function precisa ser re-deployada** para que a versão com o bloco 7c entre em produção. Os steps que existem no banco foram gerados por uma versão anterior da function (sem o auto-fix).

**Prova:** Se o auto-fix tivesse rodado, o step "Criar conta no Calendly" (description: 176 chars, contém "Calendly") teria pelo menos 1 `tooltip_term` com `term: "Calendly"` — que está no dicionário TECH_TERMS na linha 459. O banco mostra `tooltip_count: 0`. Logo, o auto-fix **não executou**.

---

## 3. PRECISA DE MIGRATION?

**NÃO.** Nenhuma tabela ou coluna nova é necessária. O fix é puramente lógico na edge function.

---

## 4. AÇÃO NECESSÁRIA

1. **Re-deploy da edge function** `v10-generate-steps` para que o bloco 7c (linhas 386-564) entre em produção
2. **Re-gerar os steps** da lição `dcefa80b-29a9-4ef6-9fea-38b31b3c7f7a` (deletar steps existentes e gerar novamente)

---

## 5. GAPS SISTÊMICOS IDENTIFICADOS

### Gap A: Os steps existentes NO BANCO não serão corrigidos automaticamente
O auto-fix só roda no momento da **geração** (dentro do `v10-generate-steps`). Steps já inseridos no banco permanecem sem `tooltip_term`/`nav_breadcrumb`. Não existe um mecanismo de "re-fix" retroativo.

**Solução proposta:** Adicionar um botão "Corrigir C2/C3" no Stage2Structure que aplica a mesma lógica de auto-fix nos steps existentes via UPDATE direto no banco, sem precisar re-gerar tudo.

### Gap B: A auditoria roda client-side mas o fix roda server-side
Se a edge function falhar silenciosamente no auto-fix (ex: crash antes da linha 386), os steps são inseridos sem fixes e a auditoria reprova. Não há feedback ao admin sobre se o auto-fix rodou ou não.

**Solução proposta:** Incluir `c2_fixes` e `c3_fixes` nos details do log `steps_generated` para que o admin veja quantos fixes foram aplicados.

