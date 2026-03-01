

# Plano de Correção: Layout da Imagem e Verificação do Áudio

## Problema 1: Posicionamento da Imagem

Nas screenshots, a imagem aparece com muito espaço entre o titulo e a imagem, e entre a imagem e o texto. O layout atual usa `gap-6` (24px) uniforme entre todos os elementos (titulo, imagem, conteudo). O usuario quer exatamente **7px** entre titulo-imagem e imagem-conteudo.

### Mudanca no V8ContentSection.tsx

- Remover o `gap-6` do container principal e usar espacamento individual
- Titulo: sem margem inferior (o gap entre ele e a imagem sera controlado)  
- Imagem: `mt-[7px] mb-[7px]` — 7px acima (do titulo) e 7px abaixo (ate o conteudo)
- Conteudo markdown: sem margem extra no topo
- Remover o `p-2` interno e o `-mx-4` do container da imagem (que adicionavam espacamento desnecessario)

### Estrutura final do layout:

```text
[Titulo]
  7px
[Imagem — centralizada, sem padding extra]
  7px
[Conteudo Markdown]
  (audio player)
```

---

## Problema 2: Audio "Dobrado"

### Analise Tecnica

Revisei a Edge Function `v8-generate/index.ts` e o fluxo no `AdminV8Create.tsx`. O pipeline de audio faz **uma unica chamada** ao ElevenLabs por secao — nao ha processamento duplo.

O que pode causar a impressao de audio "dobrado":

1. **Request Stitching**: O parametro `previous_text` envia os ultimos 200 caracteres da secao anterior e `next_text` os primeiros 200 da proxima. Em alguns casos, o ElevenLabs pode repetir trechos do contexto no audio gerado, criando uma sensacao de "eco" ou repeticao.

2. **Cache do Storage**: Como o `upsert: true` sobrescreve o arquivo, se o browser tiver cacheado a versao anterior, pode estar misturando audios.

### Acao proposta

- Adicionar um **cache-buster** (`?t=timestamp`) na URL do audio ao atualizar o JSON, garantindo que o browser sempre busque o arquivo novo
- Manter o request stitching ativo (ele melhora a naturalidade entre secoes), mas monitorar se o problema persiste. Se persistir, podemos desativar o stitching como teste.

---

## Arquivos a modificar

| Arquivo | Mudanca |
|---|---|
| `src/components/lessons/v8/V8ContentSection.tsx` | Ajustar spacing: 7px entre titulo-imagem e imagem-conteudo |
| `src/pages/AdminV8Create.tsx` | Adicionar cache-buster nas URLs de audio geradas |

