# Plano: Padronizar estilo visual V8 para Flat Vector Illustration

&nbsp;

Atue como um engenheiro sênior responsável pelo runtime de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:  
  
Execute todo o plano, mas caso não execute por alguma razão, você é obrigado é dizer:  
Não implementei todo o plano ou não executei todas asa correções. 

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

## Problema

O sistema atual usa rotacao de 6 estilos diferentes (isometric, glassmorphism, clay, papercraft, low-poly, flat vector) no `buildAutoPrompt` da edge function `v8-generate-section-image/index.ts` (linhas 19-26). Isso gera inconsistencia visual entre secoes da mesma aula.

## Mudanca

Eliminar a rotacao de estilos e fixar **flat vector illustration** como estilo unico, com prompt refinado baseado nas imagens de referencia fornecidas:

- Personagens humanos estilizados com proporcoes simplificadas
- Paleta vibrante mas harmonica (azul, violeta, amarelo, rosa, verde)
- Formas geometricas limpas, sem gradientes complexos
- Linhas de contorno finas e definidas
- Objetos do cotidiano (laptop, tablet, calendario, pasta, documentos)
- Composicao centrada com 1-3 elementos
- Fundo branco/transparente (regras existentes mantidas)
- Sem sombras realistas, apenas sombras planas sutis

## Arquivos modificados

1. `**supabase/functions/v8-generate-section-image/index.ts**` - funcao `buildAutoPrompt` (linhas 10-53):
  - Remover array `styles[]` e rotacao por `sectionIndex`
  - Fixar estilo flat vector com prompt detalhado inspirado nas referencias
  - Atualizar tambem o prompt do modo `custom` (linha 96-98)
2. `**supabase/functions/generate-slide-images/index.ts**` - prompt de geracao (linhas 155-165):
  - Alinhar o prompt do pipeline de slides ao mesmo padrao flat vector

## Detalhes do prompt atualizado

```text
Style: modern flat vector illustration with clean bold shapes, 
thin defined outlines, and vibrant harmonious color palette 
(blues, violets, warm yellows, soft pinks). 

Character style: stylized human figures with simplified proportions, 
expressive poses, minimal facial detail but clear emotion. 

Objects: everyday items (laptops, tablets, documents, folders, charts) 
rendered in flat geometric shapes with no realistic shadows — 
only subtle flat color shadows for depth.

Composition: single cohesive scene, centered, 1-3 visual elements max.
NO 3D rendering, NO gradients, NO realistic textures.
Professional editorial illustration quality.
```

## Regras mantidas (sem alteracao)

- Tamanho 1024x1024
- Fundo transparente (cleanup via GPT step 2)
- Proibicao de texto
- Proibicao de simbolos genericos de IA (cerebros, engrenagens, lampadas)
- Proibicao de diagramas/flowcharts

## Ordem de execucao

1. Atualizar `buildAutoPrompt` em `v8-generate-section-image/index.ts`
2. Atualizar prompt do modo `custom` no mesmo arquivo
3. Atualizar prompt em `generate-slide-images/index.ts`
4. Deploy das edge functions