
# Correção: Imagem com texto errado ("exaztmente") na Seção 3

## Diagnóstico

A imagem da Seção 3 ("A regra prática: 3 peças que mudam tudo") contém texto gerado pela IA com erro de ortografia: **"exaztmente"** em vez de **"exatamente"**.

A edge function `v8-generate-section-image` foi chamada com `allowText: false` (padrão), o que instrui o Gemini a "NEVER include text, labels, banners, arrows, or UI elements inside the image". Porém, o modelo Gemini **ignorou essa instrução** e gerou texto mesmo assim.

O contrato visual V8 v3.0 já define a regra de ortografia, mas ela só se aplica quando `allowText: true`. Quando `allowText: false`, o prompt simplesmente proíbe texto — mas o modelo não obedeceu.

## Plano de Correção (2 passos)

### Passo 1 — Reforçar a proibição de texto no prompt (edge function)

**Arquivo:** `supabase/functions/v8-generate-section-image/index.ts`

Atualizar a regra de `allowText: false` (linha 23) para ser mais enfática e incluir uma instrução de fallback caso o modelo insista em gerar texto:

**De:**
```
- NEVER include text, labels, banners, arrows, or UI elements inside the image
```

**Para:**
```
- ABSOLUTELY NO TEXT of any kind inside the image. No words, no letters, no labels, no numbers, no banners, no captions, no typography. The image must be 100% visual/iconic with ZERO text or written characters. If you feel the urge to add text, replace it with an iconic symbol instead.
```

### Passo 2 — Regenerar apenas a Seção 3 (índice 2)

**Arquivo:** `src/components/admin/V8SectionSetup.tsx`

Adicionar uma opção de regeneração individual por seção (botão pequeno ao lado de cada imagem). Isso permitirá reprocessar apenas a `section-2` sem refazer todas as outras.

Alternativamente, se você preferir uma solução imediata, posso criar um trigger rápido que chama a edge function `v8-reprocess-lesson-images` com `sectionsToReprocess: [2]` diretamente.

---

### Resumo técnico

| Item | Detalhe |
|------|---------|
| Causa | Gemini ignorou "NEVER include text" e gerou texto com typo |
| Arquivo backend | `supabase/functions/v8-generate-section-image/index.ts` (1 linha) |
| Arquivo frontend | `src/components/admin/V8SectionSetup.tsx` (botão regenerar individual) |
| Banco de dados | 0 mudanças |
| Risco | Baixo — apenas reforço de prompt e regeneração de 1 imagem |
