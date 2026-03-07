

## Diagnóstico

O bug é claro: o `dashboard_access_count` incrementa **toda vez que o Dashboard monta** (linha 394-396), ou seja, a cada navegação para `/dashboard`. Quando o usuário entra na trilha e volta, o `checkAuth` roda de novo, incrementa o contador, e o botão dourado some porque `accessCount >= 5` rapidamente ou porque `hasProgress` muda.

O problema tem duas camadas:

1. **Incremento no lugar errado**: O contador deveria incrementar apenas em **login real** (nova sessão), não em cada visita ao Dashboard.
2. **O `hasProgress` interfere na label mas não na visibilidade**: A condição `accessCount < 5` controla a visibilidade corretamente, mas o incremento agressivo faz o contador subir rápido demais.

## Plano de Correção

### 1. Mover o incremento para o login real (sessão nova)

Em vez de incrementar dentro do `checkAuth` (que roda a cada mount do Dashboard), incrementar apenas quando `onAuthStateChange` dispara `SIGNED_IN` — que representa um login real.

**Mecanismo**: Usar uma flag `sessionStorage` (`ailiv_session_counted`) que:
- É setada após incrementar o contador no login
- É limpa automaticamente quando o navegador/aba fecha (comportamento nativo de `sessionStorage`)
- Impede incremento duplicado em navegações dentro da mesma sessão

### 2. Arquivo: `src/pages/Dashboard.tsx`

**Remover** (linhas 391-396):
```typescript
// Track dashboard access count for onboarding features
const currentCount = finalUser.dashboard_access_count ?? 0;
setDashboardAccessCount(currentCount);
if (currentCount < 5) {
  supabase.from('users').update({ dashboard_access_count: currentCount + 1 }).eq('id', userId).then();
}
```

**Substituir por**:
```typescript
// Read access count (never increment here — increment only on real login)
const currentCount = finalUser.dashboard_access_count ?? 0;
setDashboardAccessCount(currentCount);
```

**Adicionar** lógica de incremento no listener de auth (ou no useEffect de mount), verificando `sessionStorage`:

```typescript
// No useEffect de mount ou no checkAuth, APÓS confirmar sessão:
const sessionKey = 'ailiv_session_counted';
if (!sessionStorage.getItem(sessionKey) && currentCount < 5) {
  sessionStorage.setItem(sessionKey, '1');
  supabase.from('users')
    .update({ dashboard_access_count: currentCount + 1 })
    .eq('id', userId)
    .then();
  // Não incrementar o state local — o valor do DB já é o correto para esta sessão
}
```

### 3. Valor default do `accessCount` no `MobileQuickStats`

**Arquivo**: `src/components/dashboard/MobileQuickStats.tsx` (linha 34)

Mudar o default de `accessCount` de `99` para `0`:
```typescript
accessCount = 0
```

Isso garante que enquanto o dado real não chega, o botão dourado aparece (fail-safe para visibilidade).

### 4. Reset do banco (migration SQL)

Resetar o contador inflado dos usuários para refletir a correção:
```sql
UPDATE users SET dashboard_access_count = 0;
```

### Resultado

- O botão dourado só some após **5 logins reais** (sessões distintas)
- Navegar entre Dashboard e trilhas não incrementa o contador
- Refresh da página na mesma sessão não incrementa
- Fechar o navegador e abrir de novo = novo login = incrementa

