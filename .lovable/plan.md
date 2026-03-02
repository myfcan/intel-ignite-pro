# Playground Acumulativo — Fases Empilhadas no Rolo

  
Atue como um engenheiro sênior responsável pelo sistema V8 de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.

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
  
  
  
Contexto

O rolo V8 ja renderiza o Playground cumulativamente no DOM (via `timeline.slice(0, currentIndex + 1)`). Porem, **dentro** do Playground, o `AnimatePresence mode="wait"` troca fases de forma exclusiva — ao avançar para "professional", o "amateur" desaparece. Isso contradiz o padrao do rolo.

## Sobre Tokens e Cache

**Nao ha risco de consumo extra de tokens.** Os resultados do amateur e professional ja sao armazenados em estado React (`amateurResult`, `professionalResult`). Uma vez gerados, ficam em memoria ate o componente desmontar. A conversao para acumulativo apenas mantém esses dados visiveis — nao refaz chamadas.

## Sobre o Scroll

**Nao vai quebrar.** O scroll do rolo opera na camada externa (`V8LessonPlayer.tsx`), usando anchors e `scrollIntoView`. O Playground e apenas um bloco dentro desse container. Ao crescer verticalmente (mais conteudo visivel), o scroll simplesmente tem mais area — as regras de `scrollMarginTop`, `scheduleCTAScroll` e o anti-drift continuam funcionando normalmente.

## Plano de Implementacao

### Arquivo: `src/components/lessons/v8/V8PlaygroundInline.tsx`

1. **Substituir `AnimatePresence mode="wait"` por renderizacao condicional acumulativa**
  - Trocar `{phase === "intro" && ...}` por `{phaseIndex >= 0 && ...}`
  - Mapa de indices: intro=0, amateur=1, professional=2, compare=3, challenge=4, done=5
  - Cada bloco renderiza se `phaseIndex >= seuIndice`
2. **Esconder botoes de fases ja concluidas**
  - Botoes como "Ver Prompt Amador", "Agora o Profissional", "Comparar" ficam visiveis apenas quando a fase correspondente e a fase ativa (ultima desbloqueada)
  - Implementar via: `{phaseIndex === 1 && <button>Agora o Profissional</button>}`
3. **Textarea read-only apos done**
  - Quando `phaseIndex >= 5` (done), o textarea do challenge fica `readOnly` com estilo visual desabilitado (`opacity-60`)
  - O prompt digitado pelo usuario permanece visivel como registro
4. **Manter animacao apenas na entrada do bloco mais recente**
  - Blocos ja exibidos ficam estaticos (sem `initial` animation)
  - Apenas o bloco recem-desbloqueado entra com `opacity: 0 -> 1, y: 20 -> 0`
5. **Contador de tentativas permanece visivel**
  - O texto "{attempts}/{maxAttempts} tentativas" continua aparecendo no bloco challenge

### Resultado Visual (scroll para baixo)

```text
[Titulo: Teste na Pratica]
[Card: Instrucao]              <- intro (sempre visivel)
[Card: Prompt Amador + Resultado] <- amateur (visivel apos avancar)
[Card: Prompt Profissional + Resultado] <- professional
[Grid: Comparacao lado a lado] <- compare
[Card: Desafio + textarea + feedback] <- challenge (textarea read-only apos done)
[Card: Mensagem final + Continuar] <- done
```

## Escopo

- 1 arquivo: `V8PlaygroundInline.tsx`
- 0 mudancas de banco
- 0 edge functions
- 0 tokens extras consumidos