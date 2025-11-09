# Testes E2E com Playwright

Testes end-to-end que simulam usuários reais navegando pelas aulas da MAIA.

## 📦 Setup

```bash
# Instalar Playwright e browsers
npx playwright install

# Instalar dependências de sistema (Linux)
npx playwright install-deps
```

## 🚀 Executar Testes

```bash
# Rodar todos os testes
npm run test:e2e

# Rodar em modo UI (visual)
npm run test:e2e:ui

# Rodar apenas em um browser
npm run test:e2e -- --project=chromium

# Rodar teste específico
npm run test:e2e -- lesson-flow.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

## 📝 Scripts Recomendados (adicionar ao package.json)

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## 🔧 Configuração

- **playwright.config.ts**: Configuração principal
- **tests/e2e/fixtures/auth.ts**: Fixtures de autenticação
- **tests/e2e/helpers/lesson-helpers.ts**: Helpers reutilizáveis
- **tests/e2e/data-testid-reference.md**: 📚 **Guia completo de data-testid**

## 📚 Data-TestID Reference

Todos os componentes principais possuem `data-testid` para facilitar os testes:

### Principais:
- `guided-lesson` - Container principal (com `data-current-phase` e `data-current-section`)
- `lesson-section` - Cada seção (com `data-section-index`, `data-is-active`)
- `audio-player` - Player de áudio
- `exercises-section` - Seção de exercícios
- `playground-call` - Convite do playground
- `conclusion-screen` - Tela de conclusão

**Ver documentação completa:** `tests/e2e/data-testid-reference.md`

## 📊 Relatórios

Após executar os testes:

```bash
# Ver relatório HTML
npm run test:e2e:report
```

Relatórios são salvos em `playwright-report/`

## 🎯 Cobertura de Testes

### ✅ Implementado

- **lesson-flow.spec.ts**
  - Carregamento de aula e áudio
  - Sincronização áudio-texto
  - Latência de sincronização
  - Ativação de playground
  - Transição para exercícios
  - Conclusão de aula
  - Validação sem erros de console
  - Performance em conexão lenta

- **accessibility.spec.ts** ⭐ NOVO
  - WCAG 2.1 Level AA compliance
  - Estrutura de headings
  - Landmarks ARIA
  - Contraste de cores
  - Navegação por teclado
  - Labels de formulários
  - Textos alternativos de imagens
  - Simulação de leitores de tela
  - Modo alto contraste
  - Relatórios HTML detalhados

### 🔜 Próximos Testes

- Testes de responsividade (mobile/tablet)
- Testes de múltiplas aulas
- Testes de progresso do usuário
- Testes de gamificação
- Visual regression testing

## 🐛 Debug

### Modo Visual

```bash
npm run test:e2e -- --headed --slowMo=1000
```

### Playwright Inspector

```bash
npm run test:e2e:debug
```

### Traces

Traces são automaticamente capturados em falhas. Para ver:

```bash
npx playwright show-trace test-results/.../trace.zip
```

## 📸 Screenshots e Vídeos

- **Screenshots**: Capturados apenas em falhas
- **Vídeos**: Gravados apenas em falhas
- **Localização**: `test-results/`

## 🌐 Variáveis de Ambiente

Criar arquivo `.env.test`:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123456!
PLAYWRIGHT_BASE_URL=http://localhost:8080
```

## 📈 CI/CD Integration

### GitHub Actions

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎓 Best Practices

1. **Page Object Model**: Use helpers para encapsular lógica
2. **Data Test IDs**: Use `data-testid` nos componentes
3. **Wait Strategies**: Prefira `waitForSelector` sobre `waitForTimeout`
4. **Isolamento**: Cada teste deve ser independente
5. **Fixtures**: Use fixtures para setup compartilhado
6. **Assertions**: Use expect do Playwright para auto-retry

## 📚 Documentação

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
