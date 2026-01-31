

# Diagnóstico Definitivo: Service Worker Bloqueando Atualização

## Problema Identificado

O projeto usa **VitePWA com Service Worker** (configurado em `vite.config.ts` linhas 16-50) que está cacheando agressivamente os arquivos JavaScript e impedindo que o navegador carregue a versão atualizada do código.

### Evidências Conclusivas

| Verificação | Resultado |
|-------------|-----------|
| Mensagem no screenshot | "Verifique o conteúdo no banco de dados" |
| Mensagem no código atual | "Keys: [...]. Phases info:..." |
| Busca no código | ❌ Texto antigo **não existe** em nenhum arquivo |
| Banco de dados | ✅ 10 phases, `v7-vv`, correto |
| PWA Service Worker | ✅ Ativo (`registerType: 'autoUpdate'`) |

O Service Worker com `registerType: 'autoUpdate'` pode demorar para detectar novas versões, e enquanto isso, continua servindo o bundle JavaScript antigo.

---

## Solução: Desregistrar Service Worker + Limpar Cache

### Para o Usuário - Passo a Passo

1. **Abrir DevTools** (F12)
2. **Ir para aba "Application"** (Chrome) ou "Armazenamento" (Firefox)
3. **No menu lateral, clicar em "Service Workers"**
4. **Clicar em "Unregister"** em todos os service workers listados
5. **No menu lateral, clicar em "Clear storage" (Chrome) ou "Limpar dados" (Firefox)**
6. **Marcar TODAS as opções** (Cache storage, Indexed DB, Local storage, etc.)
7. **Clicar em "Clear site data"**
8. **Fechar TODAS as abas** do projeto
9. **Abrir uma nova aba** e acessar a URL da aula novamente

### Alternativa: DevTools Network Tab

1. Abrir DevTools (F12)
2. Ir para aba "Network"
3. **Marcar checkbox "Disable cache"**
4. Manter DevTools aberto
5. Navegar para a aula
6. Os logs devem mostrar `[useV7PhaseScript] ✅ FOUND: content.phases with 10 items`

---

## Correção Permanente no Código

Para evitar esse problema no futuro, recomendo adicionar um mecanismo de **cache-busting automático** que força o Service Worker a atualizar quando há nova versão do código.

### Arquivos a Modificar

#### 1. `vite.config.ts`
Adicionar `skipWaiting: true` e `clientsClaim: true` ao workbox para forçar atualizações imediatas:

```typescript
workbox: {
  skipWaiting: true,      // NOVO: Força o novo SW a assumir imediatamente
  clientsClaim: true,     // NOVO: Toma controle de todos os clientes
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  // ... resto da config
}
```

#### 2. `src/main.tsx`
Adicionar lógica para detectar e forçar atualização do Service Worker:

```typescript
import { registerSW } from 'virtual:pwa-register';

// Forçar atualização do SW quando nova versão disponível
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível! Atualizar agora?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App pronta para uso offline');
  },
});
```

---

## Validação Esperada

Após limpar o Service Worker e cache corretamente:

1. Console deve mostrar: `[useV7PhaseScript] ✅ FOUND: content.phases with 10 items`
2. A aula deve carregar normalmente
3. O erro "Verifique o conteúdo no banco de dados" não deve aparecer mais

---

## Resumo Técnico

| Componente | Status |
|------------|--------|
| Banco de dados | ✅ 100% correto (10 phases) |
| Código fonte | ✅ Atualizado (mensagem diferente) |
| Navegador do usuário | ❌ Service Worker servindo bundle antigo |
| Solução | Desregistrar SW + Clear site data |
| Correção permanente | Adicionar `skipWaiting` + `clientsClaim` ao PWA config |

