

## Plano: Tipografia Premium para Conteudo V8

### Diagnostico

O conteudo atual no `V8ContentSection.tsx` usa estilos basicos: `text-[17px] leading-[1.75] text-slate-700`. O resultado e funcional mas parece um blog generico, nao um curso premium. Os problemas:

1. **Paragrafos sem hierarquia** — todos iguais, sem destaque visual
2. **Bold (`strong`)** — apenas `font-semibold text-slate-900`, pouco impacto
3. **Italico (`em`)** — `text-indigo-600` puro, sem refinamento
4. **Listas** — bullets padrao `list-disc`, sem personalidade
5. **Sem separacao visual** entre blocos de ideias
6. **Blockquote** — borda fina, pouco destaque

### Mudancas no `V8ContentSection.tsx`

**Container do markdown:**
- Aumentar `leading-[1.85]` para mais respiro
- `text-[16.5px]` levemente menor mas mais elegante
- `tracking-[-0.01em]` para tipografia mais apertada e pro

**Paragrafos (`p`):**
- `mb-[12px]` mais espaco entre paragrafos (atual: 7px)
- Primeiro paragrafo de cada secao com `text-[17.5px]` e `text-slate-800` (lead paragraph)

**Bold (`strong`):**
- `font-bold text-slate-900` (trocar semibold por bold)
- Adicionar sutil `bg-indigo-50/60 px-1 py-0.5 rounded` para dar destaque tipo "marcador"

**Italico (`em`):**
- `text-slate-500 italic` (remover indigo, mais sutil e elegante)
- Ou manter indigo mas com `text-indigo-500/80` mais suave

**Listas (`ul/ol`):**
- Trocar `list-disc` por custom bullets via CSS pseudo-element
- `space-y-2.5` mais espaco entre itens
- Items com `pl-2` e indicador visual indigo

**Blockquote:**
- `border-l-3 border-indigo-400 bg-indigo-50/40 rounded-r-xl pl-5 py-3`
- Mais presenca visual como "callout"

**Separador horizontal (`hr`):**
- Adicionar componente `hr` no ReactMarkdown
- Linha sutil `border-slate-200/60 my-6`

### Arquivo Afetado

| Arquivo | Acao |
|---------|------|
| `V8ContentSection.tsx` | Refinar todos os componentes do ReactMarkdown |

### Resultado Visual

```text
Antes:                          Depois:
─────────────────               ─────────────────
Texto plano 17px                Texto elegante 16.5px
texto texto texto               com tracking tight
                                
**bold** simples                **bold** com highlight sutil
                                em fundo indigo-50
                                
• bullet padrao                 ◦ bullet custom indigo
• sem espaco                      com espaco 2.5
                                
> quote fino                    ┃ quote callout
                                ┃ com fundo suave
```

