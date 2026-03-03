# Plano Completo: Refinamento Didatico + Correcoes Sistemicas do Pipeline V8  


&nbsp;

regra: quero que voce execute o plano em 8 fases com diligência e prudencia.  
  
Atue como um engenheiro sênior responsável pelo runtime de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

&nbsp;

REGRA DESTE PROMPT:

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

&nbsp;

## NOVO — STEP 0: Refinamento Didatico via IA (Pre-Pipeline)

### O que e

Um passo novo no pipeline automatizado que envia o conteudo bruto de TODAS as secoes para a IA (Gemini Flash) e recebe de volta o texto refinado, ANTES de gerar quizzes, playgrounds, imagens e audio.

### Onde se encaixa

O fluxo atual em `handleConvertAndGenerate`:

```text
1. Parse conteudo bruto
2. Chamar v8-generate-lesson-content (quizzes, playgrounds, exercicios, imagens)
3. Montar JSON
4. Criar draft
5. Gerar audios
6. Mapear URLs
7. Salvar final
```

O fluxo NOVO:

```text
1. Parse conteudo bruto
2. **NOVO: Refinamento didatico via IA** <-- aqui
3. Chamar v8-generate-lesson-content (com texto ja refinado)
4. Montar JSON
5. Criar draft
6. Gerar audios
7. Mapear URLs
8. Salvar final
```

### Implementacao

**Arquivo novo**: `supabase/functions/v8-refine-content/index.ts`

Uma edge function dedicada que recebe as secoes e retorna o texto refinado.

**Regras do refinamento (system prompt)**:

1. **Clareza**: O conteudo deve ser didatico e facil de entender para qualquer pessoa, inclusive leigos
2. **Vocabulario acessivel**: Eliminar girias ambiguas, expressoes com duplo sentido ou frases coloquiais que confundem. Exemplos reais:
  - "responde no seguro" deve virar algo como "responde de forma generica e cautelosa"
  - "o que ele faz por tras" deve virar "como ele funciona internamente"
  - "dar um tapa" em algo deve virar "melhorar" ou "refinar"
3. **Coerencia narrativa**: Manter o fio condutor da historia, garantindo que cada secao conecte com a anterior de forma logica
4. **Fluencia**: Vocabulario natural, ritmo de leitura agradavel, sem frases truncadas ou transicoes abruptas
5. **Tom conversacional mas preciso**: Manter o tom amigavel e acessivel do original, mas sem sacrificar clareza
6. **Preservar estrutura**: NAO alterar marcadores como `[QUIZ]`, `[PLAYGROUND]`, `[EXERCISE:tipo]`, tags de emocao como `[confiante]`, `[pausa curta]`, `[animado]`, titulos `##`, nem a organizacao das secoes
7. **Preservar intencao**: O refinamento deve melhorar a FORMA, nao mudar o CONTEUDO conceitual. Os exemplos, metaforas e analogias devem ser mantidos ou melhorados, nunca removidos
8. **Eliminar redundancias**: Se uma secao introduz um conceito e a seguinte repete a mesma ideia com outras palavras, condensar
9. **Brevidade**: Secoes de narracoes devem ser objetivas — entre 100 e 300 palavras por secao (15-30s de audio)

**Sugestoes adicionais de regras que proponho adicionar**:

10. **Evitar jargao tecnico nao explicado**: Se um termo tecnico e necessario (ex: "token", "modelo de linguagem"), deve ser explicado na primeira ocorrencia
11. **Transicoes explicitas**: Cada secao deve comecar com uma frase que conecte ao que veio antes ("Agora que voce entendeu X, vamos ver Y...")
12. **Exemplos concretos**: Se o texto fala de algo abstrato, deve ter pelo menos um exemplo do mundo real na mesma secao
13. **Deteccao de texto pre-quiz/playground**: Se a secao termina com uma frase que e literalmente a pergunta do quiz seguinte (como "Responde rapido pra mim: quando o GPT parece generico..."), o refinador deve remover essa frase redundante da secao, pois o quiz ja vai narra-la

### Arquitetura da chamada

```text
callAI(
  LOVABLE_API_KEY,
  REFINE_SYSTEM_PROMPT,
  sections: [{ title, content }],
  tool: "refine_sections" -> retorna [{ title, content }] refinados
)
```

Usar tool calling (structured output) para garantir que o retorno seja um array de secoes com a mesma quantidade de elementos.

### No cliente (`AdminV8Create.tsx`)

Apos o parse e ANTES de chamar `v8-generate-lesson-content`:

1. Enviar secoes parseadas para `v8-refine-content`
2. Receber secoes refinadas
3. Substituir o conteudo das secoes pelo refinado
4. Continuar o pipeline normalmente

Um novo step aparece no pipeline visual:

```text
{ id: 'refine', name: 'Refinando conteudo didatico', status: 'running' }
```

---

## CORRECOES EXISTENTES (mantidas do plano anterior)

### PROBLEMA 1: Quiz narra "De acordo com a Secao 0"

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`
**Correcao**: Adicionar ao `QUIZ_SYSTEM_PROMPT`:

- "NUNCA referencie numeros de secao na pergunta"
- "A pergunta deve ser autocontida"

### PROBLEMA 2: Imagens repetitivas (cerebro, lampada)

**Arquivo**: `supabase/functions/v8-generate-section-image/index.ts`
**Correcoes**:

- Banir simbolos genericos: "NEVER use brains, lightbulbs, gears, or generic AI symbols"
- Rotacao de estilos visuais por indice: isometric, glassmorphism, clay render, papercraft
- Usar titulo da secao + keywords especificas no prompt (nao so o conceito generico)

### PROBLEMA 3: Secoes 0 e 1 nao devem ter quizzes/playgrounds

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`
**Correcao**: Filtrar `i >= 2` na logica de `sectionsNeedingInteraction`

### PROBLEMA 4: Resultado amador do Playground muito robusto

**Arquivo**: `supabase/functions/v8-generate-lesson-content/index.ts`
**Correcoes**:

- Adicionar `amateurResult` e `professionalResult` como required no `PLAYGROUND_TOOLS` schema
- Instruir no prompt: "resultado amador DEVE ser curto, vago, maximo 2 linhas"

### PROBLEMA 5: Quiz repete texto da secao

**Mitigacao**: O refinador (Step 0) ja resolve parcialmente ao detectar texto pre-quiz redundante. Adicionalmente no parser:

- Detectar conteudo residual curto (< 100 chars) quando existe quiz manual na secao
- Mesclar com o quiz ou ocultar

### PROBLEMA 6: Falta de variedade nos quizzes

Limite do contrato atual de quiz inline (multiple-choice). A variedade esta nos exercicios finais. Considerar expansao futura do contrato para true-false e fill-blank inline.

### PROBLEMA 7: Secao fantasma (content vazio)

**Arquivo**: `src/lib/v8ContentParser.ts`
**Correcoes**:

- Apos remover blocos `[QUIZ]`/`[PLAYGROUND]`, verificar se secao ficou vazia
- Se vazia, REMOVER a secao da lista
- Recalcular `afterSectionIndex` de todos os quizzes e playgrounds para compensar indices deslocados

---

## Arquivos Modificados

1. **NOVO**: `supabase/functions/v8-refine-content/index.ts` — Edge function de refinamento didatico
2. `supabase/functions/v8-generate-lesson-content/index.ts` — Problemas 1, 3, 4
3. `supabase/functions/v8-generate-section-image/index.ts` — Problema 2
4. `src/lib/v8ContentParser.ts` — Problemas 5, 7
5. `src/pages/AdminV8Create.tsx` — Integrar step de refinamento no pipeline

## Ordem de Implementacao

1. Criar `v8-refine-content` (edge function nova)
2. Corrigir `v8-generate-lesson-content` (problemas 1, 3, 4)
3. Corrigir `v8-generate-section-image` (problema 2)
4. Corrigir `v8ContentParser.ts` (problemas 5, 7)
5. Integrar refinamento no `AdminV8Create.tsx`