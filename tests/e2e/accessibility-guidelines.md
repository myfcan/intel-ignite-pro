# Guia de Acessibilidade (a11y) - MAIA

Este documento define as diretrizes e práticas de acessibilidade para o projeto MAIA, com foco em WCAG 2.1 Level AA.

## 📚 Índice

1. [Níveis WCAG](#níveis-wcag)
2. [Checklist de Acessibilidade](#checklist-de-acessibilidade)
3. [Testes Automatizados](#testes-automatizados)
4. [Correções Comuns](#correções-comuns)
5. [Ferramentas](#ferramentas)

---

## Níveis WCAG

### WCAG 2.1 Level A (Mínimo)
- Essencial para acessibilidade básica
- Todos os sites devem atender

### WCAG 2.1 Level AA (Recomendado) ⭐
- **Nível alvo do projeto MAIA**
- Exigido por muitas leis de acessibilidade
- Inclui requisitos de contraste, tamanho de toque, etc.

### WCAG 2.1 Level AAA (Avançado)
- Mais rigoroso, nem sempre prático
- Opcional para contextos específicos

---

## Checklist de Acessibilidade

### ✅ 1. Perceptível

#### 1.1 Textos Alternativos
- [ ] Todas as imagens têm `alt` descritivo
- [ ] Imagens decorativas têm `alt=""`
- [ ] Ícones têm `aria-label` quando sozinhos

```tsx
// ✅ CORRETO
<img src="maia.png" alt="Avatar da MAIA, assistente virtual" />
<button aria-label="Reproduzir áudio"><Play /></button>

// ❌ ERRADO
<img src="maia.png" /> // sem alt
<button><Play /></button> // ícone sem label
```

#### 1.2 Mídia Temporal
- [ ] Áudios têm transcrição ou legendas
- [ ] Vídeos têm legendas e/ou audiodescrição
- [ ] Controles de mídia são acessíveis

```tsx
// ✅ Player de áudio acessível
<audio 
  aria-label="Aula sobre IA - Duração 5 minutos"
  controls
>
  <source src="lesson.mp3" type="audio/mpeg" />
  Seu navegador não suporta áudio.
</audio>
```

#### 1.3 Adaptável
- [ ] Uso correto de elementos semânticos (`<nav>`, `<main>`, `<article>`)
- [ ] Headings em ordem lógica (h1 → h2 → h3, sem pulos)
- [ ] Formulários têm `<label>` associados

```tsx
// ✅ Estrutura semântica
<header>
  <nav aria-label="Navegação principal">...</nav>
</header>
<main>
  <article>
    <h1>Título da Aula</h1>
    <h2>Seção 1</h2>
    <h3>Subseção 1.1</h3>
  </article>
</main>
```

#### 1.4 Distinguível
- [ ] Contraste mínimo de 4.5:1 para texto normal
- [ ] Contraste mínimo de 3:1 para texto grande (18pt+)
- [ ] Texto pode ser redimensionado até 200%
- [ ] Informação não depende apenas de cor

```tsx
// ✅ Contraste adequado
<p className="text-slate-900 dark:text-slate-100">
  Texto com bom contraste em ambos os modos
</p>

// ❌ Apenas cor para indicar erro
<span className="text-red-500">Erro!</span> // sem ícone ou texto

// ✅ Cor + ícone + texto
<div className="text-red-500 flex items-center gap-2">
  <AlertCircle /> Erro: Campo obrigatório
</div>
```

---

### ✅ 2. Operável

#### 2.1 Teclado
- [ ] Todos os elementos interativos são alcançáveis via Tab
- [ ] Ordem de foco é lógica
- [ ] Foco visível em todos os elementos
- [ ] Sem armadilhas de teclado

```tsx
// ✅ Elemento focável
<button 
  className="focus:ring-2 focus:ring-primary focus:outline-none"
  onClick={handleClick}
>
  Clique aqui
</button>

// ✅ Foco customizado com boa visibilidade
.focus-visible:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

#### 2.2 Tempo Suficiente
- [ ] Usuário pode pausar/parar animações automáticas
- [ ] Sessões não expiram sem aviso
- [ ] Timeouts podem ser desativados ou estendidos

```tsx
// ✅ Controle de autoplay
<audio 
  controls
  // NÃO usar autoplay sem controle do usuário
>
```

#### 2.3 Convulsões
- [ ] Nenhum conteúdo pisca mais de 3x por segundo
- [ ] Evitar padrões que podem causar convulsões

#### 2.4 Navegação
- [ ] Títulos de página descritivos
- [ ] Links descritivos (não "clique aqui")
- [ ] Múltiplos caminhos para encontrar conteúdo
- [ ] Landmarks ARIA claros

```tsx
// ✅ Link descritivo
<a href="/lesson/1">Iniciar Aula: Fundamentos de IA</a>

// ❌ Link genérico
<a href="/lesson/1">Clique aqui</a>

// ✅ Landmarks
<header role="banner">...</header>
<nav role="navigation" aria-label="Menu principal">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

#### 2.5 Modalidades de Entrada
- [ ] Gestos funcionam com um dedo
- [ ] Alternativas para gestos complexos
- [ ] Alvos de toque têm 44x44px mínimo

```tsx
// ✅ Botão com tamanho adequado
<button className="min-w-[44px] min-h-[44px] p-3">
  <Icon />
</button>
```

---

### ✅ 3. Compreensível

#### 3.1 Legível
- [ ] Idioma da página definido
- [ ] Mudanças de idioma identificadas

```tsx
// ✅ Definir idioma
<html lang="pt-BR">

// ✅ Mudança de idioma inline
<p>O termo <span lang="en">Machine Learning</span> significa...</p>
```

#### 3.2 Previsível
- [ ] Navegação consistente em todas as páginas
- [ ] Identificação consistente de componentes
- [ ] Mudanças de contexto são previsíveis

```tsx
// ✅ Navegação consistente
<nav className="fixed top-0">
  <Link to="/">Home</Link>
  <Link to="/dashboard">Dashboard</Link>
  <Link to="/lessons">Aulas</Link>
</nav>
```

#### 3.3 Assistência de Entrada
- [ ] Labels ou instruções para entradas
- [ ] Sugestões de erro claras
- [ ] Validação de erros descritiva
- [ ] Prevenção de erros em ações irreversíveis

```tsx
// ✅ Label + instrução + erro
<div>
  <label htmlFor="email" className="block mb-1">
    E-mail <span className="text-red-500" aria-label="obrigatório">*</span>
  </label>
  <input 
    id="email"
    type="email"
    aria-describedby="email-hint email-error"
    aria-invalid={hasError}
    required
  />
  <p id="email-hint" className="text-sm text-muted-foreground">
    Usaremos para enviar atualizações
  </p>
  {hasError && (
    <p id="email-error" className="text-sm text-red-500" role="alert">
      Por favor, insira um e-mail válido
    </p>
  )}
</div>
```

---

### ✅ 4. Robusto

#### 4.1 Compatível
- [ ] HTML válido
- [ ] IDs únicos
- [ ] ARIA usado corretamente
- [ ] Status e alertas anunciados

```tsx
// ✅ Toast acessível
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
  className="toast"
>
  Progresso salvo com sucesso
</div>

// ✅ Erro crítico
<div 
  role="alert"
  aria-live="assertive"
  className="error-banner"
>
  Falha ao salvar. Tente novamente.
</div>
```

---

## Testes Automatizados

### Executar Testes

```bash
# Todos os testes a11y
npm run test:e2e -- accessibility.spec.ts

# Apenas um teste específico
npm run test:e2e -- accessibility.spec.ts -g "homepage"

# Com relatório HTML
npm run test:e2e -- accessibility.spec.ts --reporter=html
```

### Verificar Durante Desenvolvimento

```bash
# Modo UI interativo
npm run test:e2e:ui -- accessibility.spec.ts
```

### Gerar Relatórios

Os relatórios HTML são salvos automaticamente em:
```
test-results/a11y-reports/
```

---

## Correções Comuns

### Problema: Contraste Insuficiente

```tsx
// ❌ ANTES
<p className="text-gray-400">Texto difícil de ler</p>

// ✅ DEPOIS
<p className="text-gray-700 dark:text-gray-200">Texto legível</p>
```

### Problema: Botão sem Label

```tsx
// ❌ ANTES
<button onClick={handlePlay}><Play /></button>

// ✅ DEPOIS - Opção 1: aria-label
<button onClick={handlePlay} aria-label="Reproduzir áudio">
  <Play />
</button>

// ✅ DEPOIS - Opção 2: texto visível
<button onClick={handlePlay}>
  <Play />
  <span>Reproduzir</span>
</button>
```

### Problema: Imagem sem Alt

```tsx
// ❌ ANTES
<img src="diagram.png" />

// ✅ DEPOIS - Decorativa
<img src="decoration.png" alt="" role="presentation" />

// ✅ DEPOIS - Informativa
<img src="diagram.png" alt="Diagrama mostrando fluxo de dados entre usuário, IA e banco" />
```

### Problema: Foco Invisível

```tsx
// ❌ ANTES
<button className="outline-none">...</button>

// ✅ DEPOIS
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  ...
</button>
```

### Problema: Link Genérico

```tsx
// ❌ ANTES
<a href="/article">Leia mais</a>

// ✅ DEPOIS - Texto descritivo
<a href="/article">
  Leia mais sobre Como a IA está transformando educação
</a>

// ✅ DEPOIS - aria-label
<a href="/article" aria-label="Leia mais sobre Como a IA está transformando educação">
  Leia mais
</a>
```

---

## Ferramentas

### Desenvolvimento

1. **axe DevTools** (Extensão de navegador)
   - Chrome: [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
   - Firefox: [axe DevTools](https://addons.mozilla.org/firefox/addon/axe-devtools/)

2. **WAVE** (Web Accessibility Evaluation Tool)
   - https://wave.webaim.org/extension/

3. **Lighthouse** (Built-in no Chrome DevTools)
   - Acessibilidade é uma das categorias auditadas

### Testes Manuais

1. **Navegação por Teclado**
   - Use apenas `Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, setas
   - Verifique se tudo é alcançável e operável

2. **Leitores de Tela**
   - Windows: NVDA (gratuito) - https://www.nvaccess.org/
   - macOS: VoiceOver (nativo)
   - iOS: VoiceOver (nativo)
   - Android: TalkBack (nativo)

3. **Zoom**
   - Teste com zoom de 200% no navegador
   - Verifique se nada quebra ou fica ilegível

4. **Modo Alto Contraste**
   - Windows: High Contrast Mode
   - Verificar se elementos ainda são distinguíveis

### Validação de HTML

```bash
# Validador HTML da W3C
npx html-validate "dist/**/*.html"
```

---

## Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [Inclusive Components](https://inclusive-components.design/)

---

## Contato

Para dúvidas sobre acessibilidade no projeto MAIA, abra uma issue com a tag `a11y`.
