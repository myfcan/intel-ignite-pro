

# Contrato Visual V8: Padronizacao de Imagens por Secao

## Problema

As imagens geradas pelo pipeline V8 apresentam inconsistencia visual entre secoes:
- Quantidade de elementos varia (uma secao tem 1 objeto, outra tem 6+ elementos pequenos)
- Composicao interna muda drasticamente (algumas preenchem o frame, outras ficam minusculas)
- Resultado: secoes com imagens "cheias" ao lado de secoes com imagens "vazias"

## Solucao

### 1. Atualizar o prompt de geracao (Edge Function)

**Arquivo:** `supabase/functions/v8-generate-section-image/index.ts`

Reescrever a funcao `buildAutoPrompt` com regras mais rigorosas:

- **Limite de elementos:** Maximo 1-3 objetos por imagem (nunca um diagrama com 6+ pecas)
- **Preenchimento:** O objeto principal deve ocupar 85-95% do frame (nao 80%)
- **Proibicao de diagramas:** Nao gerar flowcharts, setas, labels ou sequencias complexas
- **Foco em objeto unico:** Priorizar um unico objeto 3D icônico que represente o conceito
- **Anti-pattern explicito:** Proibir textos, setas, labels, banners dentro da imagem

O prompt custom tambem recebera as mesmas restricoes.

### 2. Aumentar tamanho de exibicao no player

**Arquivo:** `src/components/lessons/v8/V8ContentSection.tsx`

Alterar `max-w-[256px]` para `max-w-[300px]` para dar mais presenca visual as imagens, mantendo proporcionalidade com o layout mobile.

### Detalhes tecnicos

**Prompt AUTO revisado (trecho chave):**
```
- Single iconic 3D object only — NO diagrams, flowcharts, arrows, or multi-step sequences
- Maximum 1 to 3 visual elements total, tightly composed
- The main object must fill 85-95% of the frame
- NEVER include text, labels, banners, arrows, or UI elements
- NEVER create infographic-style or diagram-style compositions
```

**Player CSS:**
```
className="w-full max-w-[300px] rounded-2xl object-contain"
```

Apos o deploy, todas as novas imagens seguirao o padrao. Imagens existentes precisarao ser regeneradas individualmente.

