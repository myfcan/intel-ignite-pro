
## Diagnóstico: Auto-Geração de `stat` e `step` no Pipeline

### Resposta Direta: NÃO, isso ainda não foi feito.

A análise completa do codebase confirma:

**O que existe hoje:**
- Os tipos `stat` e `step` estão definidos no contrato de tipos (`V7Contract.ts`) como opções válidas de `V7MicroVisualType`
- O renderer (`V7MicroVisualOverlay.tsx`) sabe renderizar esses tipos
- O pipeline processa os `microVisuals` definidos manualmente no JSON de entrada, calculando seus timestamps via `anchorText`

**O que NÃO existe (gap confirmado):**
- Nenhuma lógica de inferência automática de micro-visuais no pipeline
- O pipeline é 100% passivo: ele só processa os `microVisuals` que o autor do JSON já declarou explicitamente em `scene.visual.microVisuals[]`
- Não existe nenhum step de "auto-enrich" que analise a narração e gere micro-visuais `stat` ou `step` automaticamente

---

### Onde a Auto-Geração Deve Ser Implementada

O pipeline real que executa em produção é a edge function em `supabase/functions/v7-vv/index.ts` (7.755 linhas). É nele que a lógica deve viver — conforme o padrão arquitetural permanente do projeto (memória: integridade-entrypoint-pipeline).

O Step 3 do pipeline (após gerar o áudio e wordTimestamps, antes de calcular os anchors) é o momento ideal para um novo Step 3.5 de "MicroVisual Enrichment", pois:
- Os wordTimestamps já existem → sabemos onde cada palavra ocorre
- Os anchors ainda não foram calculados → podemos adicionar novos microVisuals antes desse cálculo
- A narração completa está disponível por cena

---

### Design da Solução: Step 3.5 — MicroVisual Auto-Enrichment

**Estratégia: Pattern Matching Determinístico na Narração**

O sistema analisa cada narração de cena buscando padrões textuais específicos e injeta `microVisuals` automáticos quando detecta esses padrões — desde que o autor do JSON não tenha declarado um microVisual com o mesmo `anchorText` (regra de não-duplicação).

**Padrões para `stat`:**
Detectar números monetários, percentuais e métricas na narração:
```
R\$\s*[\d.,]+\w*          → R$ 50.000, R$ 3k
\d+\s*%                    → 98%, 30%
[\d.,]+\s*(mil|reais|k|M)  → 10 mil, 3k
```
A palavra mais próxima ao número na narração vira o `anchorText`.

**Padrões para `step`:**
Detectar marcadores de passos numerados:
```
Passo\s+\d+                → "Passo 1", "Passo 2"
\d+\.\s+[A-Z]              → "1. Defina", "2. Execute"
Etapa\s+\d+               → "Etapa 1"
Primeiro[,:]|Segundo[,:]  → "Primeiro," "Segundo,"
```

**Regras de Governança:**
1. Máximo 1 auto-microVisual por parágrafo/frase (evitar sobrecarga visual)
2. Respeitar `scene.visual.microVisuals[]` existentes — não duplicar anchorText
3. Apenas em cenas do tipo `narrative`, `dramatic`, `comparison` — nunca em cenas interativas
4. Log explícito de cada microVisual injetado automaticamente para rastreabilidade

---

### Arquivos a Alterar

| Arquivo | Operação | Detalhe |
|---|---|---|
| `supabase/functions/v7-vv/index.ts` | Adicionar Step 3.5 | Nova função `enrichMicroVisualsFromNarration()` inserida entre a geração de áudio (Step 3) e o cálculo de anchors (Step 4). Modifica `inputScenes[].visual.microVisuals` in-place. |

**Nenhum outro arquivo precisa ser alterado** — os tipos já estão no contrato (`V7Contract.ts`), o renderer já suporta (`V7MicroVisualOverlay.tsx`), e o Step 4 de cálculo de anchors já processa qualquer microVisual presente no array, independente de ter vindo do autor ou do enriquecimento automático.

---

### Estrutura da Função `enrichMicroVisualsFromNarration`

```
Para cada cena em inputScenes:
  Se cena é interativa (quiz/playground) → skip
  
  Para cada frase/parágrafo da narração:
    1. Detectar padrões de STAT (R$, %, mil, k, M)
       → Se encontrado E sem duplicata:
          Criar microVisual tipo 'stat' com:
            anchorText: palavra mais próxima ao número (ex: "reais", "mil", o próprio número)
            content.value: número extraído
            content.prefix: "R$" se monetário
            content.suffix: "%" se percentual
            content.color: "green" por padrão
            duration: 3.0
    
    2. Detectar padrões de STEP ("Passo N", "Etapa N", "N. Texto")
       → Se encontrado E sem duplicata:
          Criar microVisual tipo 'step' com:
            anchorText: "Passo" ou "Etapa" ou a palavra anterior ao número
            content.stepNumber: N extraído
            content.text: frase resumida após o marcador (até 6 palavras)
            duration: 3.5
    
    Máximo 1 auto-microVisual por período gramatical (.)
  
  Adicionar ao scene.visual.microVisuals[]
  Logar: [ENRICH] Cena X: +N microVisuais injetados (stat: A, step: B)
```

---

### Garantias de Segurança (Non-Breaking)

- Se o regex não encontrar nenhum padrão, a cena não é modificada — pipeline continua idêntico ao atual
- Qualquer exceção dentro do enriquecimento é capturada com try/catch, logada como warning, e o pipeline continua sem o enriquecimento (degraded mode graceful)
- O Step 4 (calculateAnchors) não sabe se o microVisual veio do autor ou do enrichment — trata todos igualmente, o que garante que a lógica de anchorText existente funciona sem modificação
- O log indica claramente `[ENRICH]` vs `[MANUAL]` para auditoria

---

### O Que Não Muda

- Contratos C10, C10B, Boundary Fix Guard, C03, C06 — nenhum é afetado
- O formato de `V7MicroVisual` no banco — idêntico
- O renderer — já suporta os tipos
- O input JSON do autor — continua funcionando igual, com ou sem microVisuals declarados
