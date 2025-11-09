# Template para Criar Componentes Acessíveis

Este documento serve como guia prático para criar componentes acessíveis no projeto MAIA.

## 📋 Checklist Rápida

Antes de criar/modificar um componente, verifique:

- [ ] Elemento semântico correto (`<button>` não `<div onClick>`)
- [ ] Labels e ARIA quando necessário
- [ ] Navegável por teclado (Tab, Enter, Escape)
- [ ] Foco visível
- [ ] Contraste adequado (4.5:1 texto, 3:1 UI)
- [ ] `data-testid` para testes E2E
- [ ] Testado com axe-core

---

## 🎯 Exemplos Práticos

### 1. Botão

```tsx
// ❌ ERRADO
<div className="button" onClick={handleClick}>
  Click me
</div>

// ✅ CORRETO
<button
  data-testid="my-button"
  onClick={handleClick}
  className="focus-visible:ring-2 focus-visible:ring-primary"
  aria-label="Descrição clara do que o botão faz"
>
  Click me
</button>
```

**Teste a11y:**
```typescript
test('botão deve ser acessível', async ({ page }) => {
  const a11y = new AccessibilityHelpers(page);
  
  // Verificar se é focável
  await page.locator('[data-testid="my-button"]').focus();
  const isFocused = await page.evaluate(() => 
    document.activeElement?.getAttribute('data-testid') === 'my-button'
  );
  expect(isFocused).toBe(true);
  
  // Verificar label
  const announcement = await a11y.simulateScreenReader('[data-testid="my-button"]');
  expect(announcement.announcement).toContain('Descrição clara');
});
```

---

### 2. Botão com Ícone

```tsx
// ❌ ERRADO - sem texto
<button>
  <Play />
</button>

// ✅ CORRETO - Opção 1: aria-label
<button
  data-testid="play-button"
  aria-label="Reproduzir áudio"
  className="focus-visible:ring-2"
>
  <Play />
</button>

// ✅ CORRETO - Opção 2: texto visível + ícone
<button
  data-testid="play-button"
  className="flex items-center gap-2 focus-visible:ring-2"
>
  <Play />
  <span>Reproduzir</span>
</button>

// ✅ CORRETO - Opção 3: texto visualmente oculto
<button
  data-testid="play-button"
  className="focus-visible:ring-2"
>
  <Play />
  <span className="sr-only">Reproduzir áudio</span>
</button>
```

**CSS para .sr-only:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

### 3. Input com Label

```tsx
// ❌ ERRADO
<input placeholder="Nome" />

// ✅ CORRETO
<div>
  <label htmlFor="name" className="block mb-1 font-medium">
    Nome <span className="text-red-500" aria-label="obrigatório">*</span>
  </label>
  <input
    id="name"
    data-testid="name-input"
    type="text"
    required
    aria-describedby="name-hint"
    className="focus-visible:ring-2 focus-visible:ring-primary"
  />
  <p id="name-hint" className="text-sm text-muted-foreground mt-1">
    Digite seu nome completo
  </p>
</div>
```

**Com validação de erro:**
```tsx
<div>
  <label htmlFor="email" className="block mb-1 font-medium">
    E-mail
  </label>
  <input
    id="email"
    data-testid="email-input"
    type="email"
    required
    aria-invalid={hasError}
    aria-describedby="email-hint email-error"
    className={`focus-visible:ring-2 ${
      hasError 
        ? 'border-red-500 focus-visible:ring-red-500' 
        : 'focus-visible:ring-primary'
    }`}
  />
  <p id="email-hint" className="text-sm text-muted-foreground mt-1">
    Usaremos para notificações
  </p>
  {hasError && (
    <p 
      id="email-error" 
      className="text-sm text-red-500 mt-1" 
      role="alert"
    >
      Por favor, insira um e-mail válido
    </p>
  )}
</div>
```

---

### 4. Card Clicável

```tsx
// ❌ ERRADO
<div onClick={() => navigate('/lesson/1')}>
  <img src="thumb.jpg" />
  <h3>Aula 1</h3>
</div>

// ✅ CORRETO - Opção 1: Link
<Link 
  to="/lesson/1"
  data-testid="lesson-card"
  className="block p-4 rounded-lg hover:bg-muted focus-visible:ring-2"
>
  <img 
    src="thumb.jpg" 
    alt="Miniatura da Aula 1: Fundamentos de IA" 
  />
  <h3>Aula 1: Fundamentos de IA</h3>
</Link>

// ✅ CORRETO - Opção 2: Button (se não for navegação)
<button
  data-testid="lesson-card"
  onClick={handleCardClick}
  className="w-full text-left p-4 rounded-lg hover:bg-muted focus-visible:ring-2"
>
  <img 
    src="thumb.jpg" 
    alt="Miniatura da Aula 1: Fundamentos de IA" 
  />
  <h3>Aula 1: Fundamentos de IA</h3>
</button>
```

---

### 5. Modal/Dialog

```tsx
// ✅ CORRETO
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent 
    data-testid="confirmation-dialog"
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
  >
    <DialogHeader>
      <DialogTitle id="dialog-title">
        Confirmar ação
      </DialogTitle>
      <DialogDescription id="dialog-description">
        Esta ação não pode ser desfeita. Tem certeza?
      </DialogDescription>
    </DialogHeader>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsOpen(false)}
        data-testid="dialog-cancel"
      >
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        data-testid="dialog-confirm"
        autoFocus // Foco inicial no botão principal
      >
        Confirmar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Teste a11y:**
```typescript
test('modal deve ser acessível', async ({ page }) => {
  // Abrir modal
  await page.locator('[data-testid="open-modal-button"]').click();
  
  // Verificar role e aria
  const dialog = page.locator('[data-testid="confirmation-dialog"]');
  expect(await dialog.getAttribute('role')).toBe('dialog');
  expect(await dialog.getAttribute('aria-labelledby')).toBeTruthy();
  
  // Verificar que Escape fecha
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
```

---

### 6. Toast/Notificação

```tsx
// ✅ CORRETO - Status info
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  data-testid="toast-info"
  className="toast"
>
  <CheckCircle />
  <p>Progresso salvo com sucesso</p>
</div>

// ✅ CORRETO - Alerta crítico
<div
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  data-testid="toast-error"
  className="toast-error"
>
  <AlertCircle />
  <p>Erro ao salvar. Tente novamente.</p>
</div>
```

**Regras:**
- `role="status"` + `aria-live="polite"` para notificações informativas
- `role="alert"` + `aria-live="assertive"` para erros/alertas urgentes
- `aria-atomic="true"` para ler o conteúdo completo

---

### 7. Lista de Itens

```tsx
// ✅ CORRETO
<nav aria-label="Navegação de lições">
  <ul>
    {lessons.map((lesson) => (
      <li key={lesson.id}>
        <Link 
          to={`/lesson/${lesson.id}`}
          data-testid={`lesson-link-${lesson.id}`}
          className="focus-visible:ring-2"
          aria-current={currentLessonId === lesson.id ? 'page' : undefined}
        >
          {lesson.title}
        </Link>
      </li>
    ))}
  </ul>
</nav>
```

---

### 8. Tabs/Abas

```tsx
// ✅ CORRETO (usando Radix UI)
<Tabs defaultValue="tab1" data-testid="lesson-tabs">
  <TabsList role="tablist" aria-label="Seções da aula">
    <TabsTrigger 
      value="tab1" 
      role="tab"
      aria-selected={selected === 'tab1'}
      data-testid="tab-overview"
    >
      Visão Geral
    </TabsTrigger>
    <TabsTrigger 
      value="tab2" 
      role="tab"
      data-testid="tab-exercises"
    >
      Exercícios
    </TabsTrigger>
  </TabsList>
  
  <TabsContent 
    value="tab1" 
    role="tabpanel"
    data-testid="panel-overview"
  >
    Conteúdo da Visão Geral
  </TabsContent>
  
  <TabsContent 
    value="tab2" 
    role="tabpanel"
    data-testid="panel-exercises"
  >
    Conteúdo dos Exercícios
  </TabsContent>
</Tabs>
```

---

### 9. Imagem

```tsx
// ❌ ERRADO
<img src="diagram.png" />

// ✅ CORRETO - Imagem informativa
<img 
  src="diagram.png" 
  alt="Diagrama mostrando o fluxo: Entrada → Processamento → Saída"
  data-testid="flow-diagram"
/>

// ✅ CORRETO - Imagem decorativa
<img 
  src="decoration.png" 
  alt="" 
  role="presentation"
  aria-hidden="true"
/>

// ✅ CORRETO - Ícone decorativo com contexto
<div className="flex items-center gap-2">
  <Sparkles aria-hidden="true" />
  <span>Novidade!</span>
</div>
```

---

### 10. Loading/Carregando

```tsx
// ✅ CORRETO
<div 
  role="status" 
  aria-live="polite"
  aria-label="Carregando conteúdo"
  data-testid="loading-spinner"
>
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span className="sr-only">Carregando...</span>
</div>
```

---

## 🧪 Template de Teste a11y

```typescript
import { test, expect } from './fixtures/auth';
import { AccessibilityHelpers } from './helpers/accessibility-helpers';

test.describe('Acessibilidade - [Nome do Componente]', () => {
  test('deve passar em todas verificações WCAG AA', async ({ page }) => {
    await page.goto('/rota-do-componente');
    
    const a11y = new AccessibilityHelpers(page);
    await a11y.assertNoViolations({ allowMinor: true });
  });

  test('deve ser navegável por teclado', async ({ page }) => {
    await page.goto('/rota-do-componente');
    
    const a11y = new AccessibilityHelpers(page);
    const results = await a11y.testKeyboardNavigation([
      '[data-testid="element-1"]',
      '[data-testid="element-2"]',
    ]);

    results.forEach(r => {
      expect(r.focusable, `${r.selector} deve ser focável`).toBe(true);
    });
  });

  test('deve ter labels descritivos', async ({ page }) => {
    await page.goto('/rota-do-componente');
    
    const a11y = new AccessibilityHelpers(page);
    const sr = await a11y.simulateScreenReader('[data-testid="button"]');
    
    expect(sr.announcement).toBeTruthy();
    expect(sr.announcement.length).toBeGreaterThan(5);
  });
});
```

---

## 📚 Recursos

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
- [a11y Coffee](https://a11y.coffee/)

---

## ✅ Aprovação de PR

Antes de submeter PR com novos componentes:

1. [ ] Adicionei `data-testid` relevantes
2. [ ] Implementei navegação por teclado
3. [ ] Verifiquei contraste de cores
4. [ ] Adicionei testes a11y
5. [ ] Executei `npm run test:e2e -- accessibility.spec.ts`
6. [ ] Testei manualmente com Tab + Enter
7. [ ] (Opcional) Testei com leitor de tela
