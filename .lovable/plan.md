

## Diagnóstico: Service Worker PWA Serve Código Antigo do Cache

### O Problema Real

O Workbox (via `vite-plugin-pwa`) faz **precache** de todos os arquivos do build -- incluindo os chunks JS lazy-loaded como o Dashboard. Quando o site é publicado:

1. O navegador carrega a pagina
2. O Service Worker **antigo** (ainda controlando a pagina) serve os JS **do cache**
3. O Dashboard renderiza com o **codigo do build anterior**
4. Somente depois, o novo SW instala, ativa, e atualiza o cache
5. O `onNeedRefresh` dispara e faz reload -- mas o usuario ja viu o design antigo

### Solucao

Adicionar `navigateFallback` e configurar o Workbox para **nao fazer precache dos chunks JS**, usando `NetworkFirst` para assets dinamicos. Isso garante que o navegador sempre busque os JS mais recentes do servidor.

### Mudancas Tecnicas

**1. `vite.config.ts`** - Ajustar configuracao do Workbox:
- Adicionar `globPatterns` restritivo para precache (apenas `index.html` e assets estaticos como fontes/imagens)
- Adicionar `navigateFallback: '/index.html'` para SPA routing
- Adicionar regra de `runtimeCaching` para arquivos `.js` e `.css` com estrategia `StaleWhileRevalidate` ou `NetworkFirst`
- Isso faz com que os chunks JS do Dashboard sejam sempre buscados do servidor primeiro

```
workbox: {
  skipWaiting: true,
  clientsClaim: true,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  navigateFallback: '/index.html',
  globPatterns: ['**/*.{html,ico,png,svg,woff,woff2}'],
  runtimeCaching: [
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 300,
        },
      },
    },
  ],
},
```

**2. `src/main.tsx`** - Melhorar o handler de update:
- Adicionar verificacao de atualizacao imediata no `onRegisteredSW` (ao inves de esperar 1 hora)
- Verificar atualizacoes a cada 60 segundos (em vez de 1 hora)

### Resultado Esperado

Apos essa mudanca:
- Arquivos JS/CSS serao sempre buscados do servidor primeiro (`NetworkFirst`)
- Se o servidor estiver offline, o cache antigo serve como fallback
- O precache fica restrito a `index.html` e assets estaticos (imagens, fontes)
- O dashboard nunca mais mostra o design antigo apos um deploy

### Risco

Nenhum impacto funcional. O app continua funcionando offline com os assets cacheados. A unica diferenca e que JS/CSS sao buscados via rede primeiro (com fallback para cache), em vez de cache primeiro.

