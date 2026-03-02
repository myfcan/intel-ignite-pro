
# Reprocessar Imagens V8 — Contrato Visual

## Contexto

A aula `92da570a-32c0-4df0-ac24-be6de43e3e0f` tem 4 secoes com imagens ja geradas no formato antigo (512x512, sem regra pt-BR). A edge function `v8-generate-section-image` ja foi atualizada com o contrato 1024x1024 + pt-BR. Precisamos reprocessar as 4 imagens e atualizar o JSON da aula.

## Plano

### 1. Criar edge function `v8-reprocess-lesson-images`

Nova edge function que recebe `lessonId` e:

1. Busca a aula no banco (`lessons.content`)
2. Itera sobre cada secao (`sections[0..3]`)
3. Para cada secao, chama internamente a mesma logica de geracao (Gemini + GPT cleanup) com o contrato atualizado
4. Atualiza o `imageUrl` de cada secao no JSON `content`
5. Salva o JSON atualizado no banco via `UPDATE lessons SET content = ...`
6. Retorna relatorio com status de cada secao

Parametros do endpoint:
```json
{
  "lessonId": "92da570a-...",
  "allowText": false,
  "sectionsToReprocess": [0, 1, 2, 3]  // opcional, default = todas
}
```

Processamento sequencial (nao paralelo) para evitar rate limit do Gemini.

### 2. Adicionar botao "Reprocessar Imagens" no Admin

No `V8SectionSetup.tsx`, adicionar um botao no topo que dispara o reprocessamento de todas as secoes de uma vez, com progress indicator por secao.

Alternativa mais rapida: executar via `supabase.functions.invoke` direto do console/admin, sem UI dedicada.

### 3. Execucao imediata

Apos deploy da edge function, chamar via curl ou admin para reprocessar a aula de teste.

## Arquivos

1. **Novo**: `supabase/functions/v8-reprocess-lesson-images/index.ts` — orchestrador de reprocessamento
2. **Editar**: `supabase/config.toml` — NAO (auto-gerenciado)
3. **Editar**: `src/components/admin/V8SectionSetup.tsx` — botao "Reprocessar Todas"

## Validacao pos-reprocessamento

Apos execucao, verificar:
- Resolucao das imagens no storage (1024x1024)
- Ausencia de texto em ingles
- Fundo transparente (alpha channel)
- URLs atualizadas no JSON da aula

## Sem mudancas de banco
A tabela `lessons` ja tem a coluna `content` (JSONB) — so atualizamos o JSON.
