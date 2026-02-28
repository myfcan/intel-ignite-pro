

# Geração de Imagens no Setup Wizard V8

## Resumo

Adicionar duas opcoes de geracoo de imagem por secao no wizard de setup, utilizando a infraestrutura existente do Lovable AI Gateway (modelo `google/gemini-2.5-flash-image`).

## Opcoes para o usuario

- **Opcao A - Automatica**: O sistema le o conteudo da secao, monta um prompt cinematografico automaticamente e gera a imagem. O usuario so clica um botao.
- **Opcao B - Prompt customizado**: O usuario digita um texto descritivo (ex: "logo do ChatGPT pegando fogo") e a imagem e gerada a partir desse texto.

## Fluxo no Setup Wizard

1. Usuario ativa "Imagem" na secao
2. Dois sub-botoes aparecem:
   - "Gerar do Conteudo" (Opcao A)
   - "Descrever Imagem" (Opcao B) - abre campo de texto
3. Ao clicar em gerar, chama a edge function
4. Imagem aparece como preview dentro do card da secao
5. URL do storage e injetada no `imageUrl` da secao

## Arquivos a criar/editar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/v8-generate-section-image/index.ts` | **Criar** - Edge function que recebe prompt (ou conteudo), gera imagem via Lovable AI Gateway, faz upload no bucket `lesson-audios` (pasta `v8-images/`), retorna URL publica |
| `src/components/admin/V8SectionSetup.tsx` | **Editar** - Substituir campo de URL por dois modos de geracao (A e B), estado de loading por secao, preview da imagem gerada |

## Detalhes tecnicos

### Edge Function `v8-generate-section-image`

- Recebe: `{ mode: 'auto' | 'custom', content?: string, customPrompt?: string, lessonId: string, sectionIndex: number }`
- Modo `auto`: monta prompt a partir do `content` (extrai tema principal, gera prompt cinematografico educacional)
- Modo `custom`: usa `customPrompt` direto como input
- Gera imagem via `google/gemini-2.5-flash-image` (mesmo padrao do Image Lab)
- Upload para storage bucket `lesson-audios` no path `v8-images/{lessonId}/section-{index}.png`
- Retorna `{ imageUrl: string }` (URL publica do storage)
- Usa `LOVABLE_API_KEY` (ja configurada automaticamente)

### V8SectionSetup.tsx - Mudancas

- Novo estado por secao: `imageMode: 'none' | 'auto' | 'custom'`, `customPrompt: string`, `isGenerating: boolean`, `generatedPreview: string`
- Quando ativa imagem: mostra dois botoes (A e B)
- Opcao A: botao "Gerar do Conteudo" com loading spinner
- Opcao B: textarea para digitar descricao + botao "Gerar"
- Apos geracao: mostra thumbnail da imagem com opcao de regenerar
- O `imageUrl` final (URL do storage) e injetado no `handleApply`

### Prompt automatico (Opcao A)

O sistema extrai as primeiras 200 palavras do `section.content`, remove markdown, e monta:

```text
Professional educational illustration: [resumo do conteudo].
Style: modern, clean, cinematic lighting, no text in image, 16:9 landscape, editorial quality.
```

### Limitacoes reais

- Imagens com logos ou texto especifico (ex: "logo do ChatGPT") podem ter distorcoes tipograficas - limitacao do modelo generativo
- Tempo de geracao: 5-15 segundos por imagem
- Custo: utiliza creditos do Lovable AI (inclusos no plano)
