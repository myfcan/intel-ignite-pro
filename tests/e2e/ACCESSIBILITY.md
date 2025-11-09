# Testes de Acessibilidade (a11y) - Guia Rápido

## 🎯 Objetivo

Garantir que a plataforma MAIA seja acessível para **todos os usuários**, incluindo pessoas com deficiências visuais, auditivas, motoras e cognitivas.

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Rodar todos os testes a11y
npm run test:e2e -- accessibility.spec.ts

# Rodar em modo UI interativo
npm run test:e2e:ui -- accessibility.spec.ts

# Gerar relatório HTML
npm run test:e2e -- accessibility.spec.ts --reporter=html
```

## 📊 O que é testado?

### ✅ Conformidade WCAG 2.1 AA

- **Perceptível**: Textos alternativos, contraste, legendas
- **Operável**: Navegação por teclado, tempo suficiente, landmarks
- **Compreensível**: Labels, instruções, previsibilidade
- **Robusto**: HTML válido, ARIA correto, compatibilidade

### 🧪 Testes Específicos

| Teste | O que valida |
|-------|-------------|
| Homepage a11y | Estrutura geral, contraste, headings |
| Dashboard a11y | Navegação por teclado, cards |
| Lesson a11y | Player acessível, imagens com alt |
| Exercises a11y | Formulários com labels, feedback |
| Keyboard Navigation | Tab sequence, escape, enter |
| Screen Reader | ARIA labels, roles, announcements |

## 📈 Níveis de Severidade

| Impacto | Descrição | Ação |
|---------|-----------|------|
| 🔴 **Critical** | Bloqueia usuários completamente | **Corrigir imediatamente** |
| 🟠 **Serious** | Dificulta muito o uso | Corrigir em até 1 sprint |
| 🟡 **Moderate** | Causa inconvenientes | Corrigir quando possível |
| 🟢 **Minor** | Pequenas melhorias | Backlog |

## 🛠️ Ferramentas

### Durante Desenvolvimento

```bash
# Browser DevTools
- Chrome: Lighthouse Accessibility Audit
- axe DevTools Extension
- WAVE Extension

# Terminal
npm run test:e2e:ui -- accessibility.spec.ts
```

### Testes Manuais

1. **Teclado**: Navegue usando apenas `Tab`, `Enter`, `Escape`
2. **Zoom**: Teste com 200% de zoom
3. **Leitor de Tela**: 
   - Windows: NVDA (gratuito)
   - Mac: VoiceOver (cmd + F5)
4. **Alto Contraste**: Windows High Contrast Mode

## 🔧 Correções Comuns

### Problema: Botão sem label
```tsx
// ❌ ANTES
<button><Play /></button>

// ✅ DEPOIS
<button aria-label="Reproduzir áudio"><Play /></button>
```

### Problema: Imagem sem alt
```tsx
// ❌ ANTES
<img src="maia.png" />

// ✅ DEPOIS
<img src="maia.png" alt="Avatar da MAIA assistente" />
```

### Problema: Contraste baixo
```tsx
// ❌ ANTES
<p className="text-gray-400">Texto difícil</p>

// ✅ DEPOIS
<p className="text-gray-700 dark:text-gray-200">Texto legível</p>
```

### Problema: Foco invisível
```tsx
// ❌ ANTES
<button className="outline-none">...</button>

// ✅ DEPOIS
<button className="focus-visible:ring-2 focus-visible:ring-primary">
  ...
</button>
```

## 📄 Relatórios

### Localização

```
test-results/
  ├── a11y-reports/          # Relatórios HTML detalhados
  │   └── homepage-*.html
  ├── playwright-report/     # Relatório geral do Playwright
  └── traces/                # Traces de falhas
```

### Como Visualizar

```bash
# Relatório geral
npm run test:e2e:report

# Abrir relatório a11y específico
open test-results/a11y-reports/homepage-latest.html
```

## 📚 Recursos

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe Rules Documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM](https://webaim.org/)

## 🎯 Metas

- ✅ **100%** das páginas principais passam em WCAG AA
- ✅ **0** violações críticas ou sérias
- ⚠️ Máximo de **5** violações moderadas por página
- ℹ️ Violações menores são aceitáveis mas devem ser documentadas

## 🤝 Contribuindo

Ao criar novos componentes:

1. Adicione `data-testid` apropriados
2. Inclua testes a11y no PR
3. Teste manualmente com teclado
4. Verifique contraste de cores
5. Execute `npm run test:e2e -- accessibility.spec.ts`

## ❓ FAQ

**P: Quanto tempo demora para rodar os testes?**
R: ~2-3 minutos para todos os testes a11y

**P: Posso ignorar algumas violações?**
R: Apenas violações menores e documentadas. Críticas/sérias devem ser corrigidas.

**P: Como testar em produção?**
R: Use as extensões de browser (axe DevTools, WAVE) na URL de produção

**P: O que fazer se um teste falhar?**
R: 
1. Veja o relatório HTML gerado
2. Entenda a violação no link "helpUrl"
3. Corrija seguindo as guidelines
4. Re-execute o teste

## 📞 Suporte

Para dúvidas sobre acessibilidade:
- Abra issue com tag `a11y`
- Consulte `accessibility-guidelines.md`
- Verifique `data-testid-reference.md`
