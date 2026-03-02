# Adicionar Loading Spinner nos Botões do Playground

## Problema

Quando o usuário clica nos botões de ação do Playground (transição de fase ou avaliação), não há indicador visual claro de que algo está sendo processado. Os botões ficam desabilitados mas sem spinner, o que gera incerteza.

## Correção >> Não mude mais nada além disso, ,tudo está indo bem.

### Arquivo: `src/components/lessons/v8/V8PlaygroundInline.tsx`

**Adicionar import do Loader2:**

- Adicionar `Loader2` ao import de `lucide-react` (ícone de spinner padrão do projeto).

**Botões de transição de fase (linhas 178-184, 213-222, 249-258, 281-289):**

- Nos botões que chamam `handleNextPhase`, quando `isLoadingResult` estiver true, substituir o conteúdo por um spinner (`Loader2` com `animate-spin`) + texto "Carregando...".

**Botão "Avaliar Meu Prompt" (linhas 431-445, 450-464):**

- Substituir o `animate-pulse` do texto "Avaliando..." por um `Loader2 animate-spin` + texto, para feedback visual mais claro e consistente.

## Exemplo visual do padrão

```
// De:
<span className="animate-pulse">Avaliando...</span>

// Para:
<><Loader2 className="w-4 h-4 animate-spin" /> Avaliando...</>
```

```
// Botão de transição, de:
Ver Prompt Amador <ArrowRight />

// Para (quando isLoadingResult):
<Loader2 className="w-4 h-4 animate-spin" /> Gerando...
```

## Escopo

- 1 arquivo alterado
- 0 mudancas de banco
- Risco: nenhum (apenas visual)