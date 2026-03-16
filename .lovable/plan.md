

# Plano: Reduzir peso visual dos Steps — Description → Narração, Warning → Tooltip

## Problema

Os steps mostram título + description + warning + mockup + tip + action + check — tudo visível de uma vez, gerando scroll excessivo em telas de 390px.

## Mudanças

### 1. Esconder `description` da UI visual

**Arquivo: `StepContent.tsx`** (linhas 38-43)

Remover o bloco `{step.description && <p>...}` do render. A description continua no banco como script de narração para o pipeline de TTS futuro, mas não aparece mais na tela.

Adicionar um botão discreto "Ver contexto" (ícone de texto) que expande/colapsa a description inline, para acessibilidade — só aparece se `step.description` existir.

### 2. Warning block → Tooltip compacto

**Arquivo: `StepContent.tsx`** (linhas 61-67)

Substituir o bloco `<div className="bg-amber-50 ...">` por um chip inline compacto:
- Ícone ⚠️ + texto curto truncado (1 linha)
- Ao tocar/clicar, abre um Popover (já existe em `src/components/ui/popover.tsx`) com o texto completo
- Usa os componentes Popover/PopoverTrigger/PopoverContent existentes

### Resultado visual esperado

```text
ANTES (scroll pesado):
┌─────────────────────┐
│ Passo 1 de 27       │
│ Criar conta Make.com│
│                     │
│ O Make.com (plata-  │
│ forma que conecta   │
│ apps entre si)...   │  ← description (5+ linhas)
│                     │
│ ┌─────────────────┐ │
│ │ ⚠ Escolha Host- │ │
│ │ ing Region: US  │ │  ← warning card (3+ linhas)
│ │ (não Europe)... │ │
│ └─────────────────┘ │
│                     │
│ ┌─ Mockup ────────┐ │
│ │                 │ │
│ └─────────────────┘ │
└─────────────────────┘

DEPOIS (limpo):
┌─────────────────────┐
│ Passo 1 de 27       │
│ Criar conta Make.com│
│ 📄 Ver contexto     │  ← botão colapsável
│ ⚠ Hosting Region ▸ │  ← chip compacto, toca → popover
│                     │
│ ┌─ Mockup ────────┐ │
│ │                 │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `StepContent.tsx` | Esconder description (colapsável), warning → chip com Popover |

Nenhuma alteração no banco de dados.

