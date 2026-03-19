

# Plano: Fix Refero — Buscar por app_name dos steps, não por pipeline.title

## BUG REAL — Linha 97 de `Stage4Mockups.tsx`

```typescript
const { data, error } = await supabase.functions.invoke('v10-refero-search', {
  body: { action: 'search_screens', query: pipeline.title, limit: 20 },
});
```

`pipeline.title` = algo como "Automação ChatGPT + Calendly". Refero interpreta como busca genérica e retorna SavvyCal, Luma Calendar, e outros apps irrelevantes.

## DADOS REAIS DISPONÍVEIS

Cada `V10LessonStep` tem `app_name` (coluna na tabela `v10_lesson_steps`):
```
- app_name | text | Nullable: Yes | Default: None
```

Os steps já estão carregados no state `steps` (linha 23, fetchados no useEffect linha 43-55).

## FIX — 1 arquivo, 1 função

### `Stage4Mockups.tsx` — `handleReferoSearch` (linhas 93-109)

**Antes:**
```typescript
const handleReferoSearch = async () => {
  setSearchingRefero(true);
  try {
    const { data, error } = await supabase.functions.invoke('v10-refero-search', {
      body: { action: 'search_screens', query: pipeline.title, limit: 20 },
    });
```

**Depois:**
```typescript
const handleReferoSearch = async () => {
  setSearchingRefero(true);
  try {
    // Extrair app_names únicos dos steps — busca por app, não pelo título genérico
    const appNames = [...new Set(
      steps.map(s => s.app_name).filter(Boolean)
    )] as string[];

    if (appNames.length === 0) {
      toast.warning('Nenhum app_name encontrado nos passos. Defina app_name nos steps primeiro.');
      setSearchingRefero(false);
      return;
    }

    const allScreens: typeof referoScreens = [];
    for (const appName of appNames) {
      const { data, error } = await supabase.functions.invoke('v10-refero-search', {
        body: { action: 'search_screens', query: appName, limit: 10 },
      });
      if (!error && data?.screens) {
        allScreens.push(...data.screens);
      }
    }

    setReferoScreens(allScreens);
    setShowReferoResults(true);
    toast.success(`Refero: ${allScreens.length} telas de ${appNames.join(', ')}`);
```

A edge function `v10-refero-search` não precisa de alteração — ela já aceita `query` como string e passa para `searchScreens(query, limit)`.

## ANÁLISE SISTÊMICA

| Verificação | Resultado |
|---|---|
| Edge function `v10-refero-search` precisa mudar? | NÃO — já aceita qualquer `query` string (linha 53) |
| `_shared/refero.ts` precisa mudar? | NÃO — `searchScreens(query, limit)` já funciona com qualquer query |
| `v10-generate-mockups` usa Refero? | NÃO — enriquece via texto AI, não consulta Refero (confirmado no código linhas 54-157) |
| Outros consumidores de `handleReferoSearch`? | NÃO — função local do componente, usada apenas no botão "Buscar Referências" (linha 229) |
| `app_name` pode ser null? | SIM — por isso o `.filter(Boolean)` remove nulls |
| Texto do fallback "Nenhum screenshot encontrado" (linha 257) | Precisa ajustar para mostrar apps buscados em vez de `pipeline.title` |

### Gap adicional — Linha 257

```typescript
<p className="text-xs text-muted-foreground">Nenhum screenshot encontrado para "{pipeline.title}".</p>
```

Deveria mostrar os apps buscados, não o título do pipeline. Fix: trocar para uma variável que reflita os nomes buscados.

## ARQUIVOS

| Arquivo | Alteração |
|---|---|
| `src/components/admin/v10/stages/Stage4Mockups.tsx` | `handleReferoSearch`: buscar por `app_name` de cada step; ajustar mensagem de fallback |

## RISCOS

| Risco | Severidade | Mitigação |
|---|---|---|
| Nenhum step tem `app_name` preenchido | Baixo | Toast de warning + return early |
| Refero retorna duplicatas entre apps | Baixo | Resultados duplicados são visuais apenas, não afetam funcionalidade |
| Rate limit no Refero com muitos apps | Baixo | Máximo ~5 apps por aula, cada busca é leve |

