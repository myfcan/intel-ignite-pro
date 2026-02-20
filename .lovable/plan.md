
# Fix: Adicionar mapDifficulty() na Edge Function v7-vv

## Diagnóstico Forense

Linha 7606 de `supabase/functions/v7-vv/index.ts`:
```typescript
difficulty_level: input.difficulty,  // "test" → erro 22P02
```

Não existe função de mapeamento na Edge Function. O frontend tem `mapDifficulty()` em `step6-consolidate.ts`, mas a Edge Function nunca implementou o equivalente.

O enum do banco `difficulty_level` aceita SOMENTE: `beginner`, `intermediate`, `advanced`.

Qualquer valor fora deste conjunto (incluindo `test`, `easy`, `medium`, `hard`, etc.) causa erro 22P02 e o pipeline morre no Step 6.

## Fix Único — 1 Linha no Arquivo Certo

### Arquivo: `supabase/functions/v7-vv/index.ts`

Adicionar a função de mapeamento próximo à linha 7600, antes do `insertPayload`:

```typescript
// Mapear difficulty para enum válido do banco
function mapDifficultyLevel(difficulty: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'beginner';
    case 'intermediate': return 'intermediate';
    case 'advanced': return 'advanced';
    default: return 'beginner'; // fallback seguro para: 'test', 'easy', 'medium', etc.
  }
}
```

Depois, na linha 7606, mudar de:
```typescript
difficulty_level: input.difficulty,
```
Para:
```typescript
difficulty_level: mapDifficultyLevel(input.difficulty),
```

## Por que isso é sistêmico

Qualquer JSON de teste que use `"difficulty": "test"` vai falhar neste ponto. O pipeline inteiro aborta sem gerar áudio, sem testar anchors, sem nada.

Com o fix:
- `"difficulty": "test"` → salva como `beginner` → pipeline continua
- O JSON de teste do usuário passa a funcionar normalmente
- Resultado: você vai conseguir dados reais sobre o comportamento dos anchors determinísticos pela primeira vez

## Sequência de deploy

1. Adicionar `mapDifficultyLevel()` na Edge Function
2. Re-deploy automático do `v7-vv`
3. Reprocessar o JSON de teste
4. Observar os logs do pipeline para validar o sistema determinístico de anchors

## O que NÃO muda

- Nenhum contrato C01-C15 é alterado
- Nenhuma lógica de anchor é tocada
- Nenhum arquivo do frontend é alterado
- É um fix cirúrgico de 1 função + 1 linha
