
# Fix: Adicionar botao "Continuar Aula" apos falha no Playground

## Problema

No `V8PlaygroundInline.tsx`, quando o usuario falha no desafio (score < 70) mas ainda tem tentativas restantes, a unica opcao visivel e "Tentar Novamente". Nao ha como pular e continuar a aula, prendendo o usuario no playground.

## Correcao

### Arquivo: `src/components/lessons/v8/V8PlaygroundInline.tsx` (linhas ~383-416)

Adicionar um botao "Continuar Aula" secundario que aparece **sempre apos a primeira tentativa com falha**, independente de ter retries restantes. O botao "Tentar Novamente" continua disponivel, mas agora como opcao, nao obrigacao.

**Layout pos-correcao:**
- Score >= 70: Botao "Continuar" (primario, como ja funciona)
- Score < 70, com retries: Botao "Tentar Novamente" (primario) + Botao "Continuar Aula" (secundario/outline)
- Score < 70, sem retries: Botao "Continuar" (primario, como ja funciona)

O botao secundario tera estilo `outline` (borda slate, texto slate) para diferenciar visualmente do CTA principal, incentivando o retry sem forcar.

### Mudanca especifica

Substituir o bloco de botoes (linhas 383-416) para que, apos `attempts > 0 && challengeScore < 70 && canRetry`, renderize ambos os botoes lado a lado.

## Escopo

- 1 arquivo: `src/components/lessons/v8/V8PlaygroundInline.tsx`
- 0 mudancas de banco
- 0 mudancas de edge function
