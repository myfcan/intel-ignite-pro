

# Plano: Corrigir viewport + integrar action/check na narração

## Problemas identificados (dados reais)

### 1. PlayerBar invisível no mobile
**Código real** — `LessonContainer.tsx` linha 412:
```
className="w-full max-w-[420px] min-h-screen flex flex-col md:rounded-2xl md:my-6 md:min-h-0 md:h-[calc(100vh-48px)] md:overflow-hidden md:shadow-2xl"
```
No mobile (< md), o container usa `min-h-screen` sem height fixo nem overflow-hidden. O flex column cresce infinitamente, empurrando PlayerBar para fora do viewport.

### 2. `action` e `check` ocupam ~145px como cards visuais separados
Dados reais do banco — Step 1:
- `action`: "Acesse make.com e clique em Sign up. Use seu email do Google para facilitar."
- `check`: null (muitos steps não têm check)
- `tip`: "Use o mesmo email que usa no Google..."
- `description`: "O Make.com (plataforma que conecta apps entre si) é a ferramenta..."

O `action` e `check` são texto curto e instrucional — ideal para narração. Hoje eles renderizam como cards separados abaixo do mockup, consumindo ~75px (action) + ~70px (check) de espaço vertical.

### 3. O `tip` do frame também renderiza como card externo ao mockup
Linha 142-149 de `FrameRenderer.tsx` — card separado abaixo do MockupChrome, ~50px extras.

## Solução em 4 mudanças

### Mudança 1: Fix viewport mobile — `LessonContainer.tsx`
Linha 412: trocar `min-h-screen` por `h-dvh overflow-hidden` no mobile.
```
// ANTES
"w-full max-w-[420px] min-h-screen flex flex-col md:..."

// DEPOIS
"w-full max-w-[420px] h-dvh flex flex-col overflow-hidden md:rounded-2xl md:my-6 md:min-h-0 md:h-[calc(100vh-48px)] md:shadow-2xl"
```
Isso faz o PlayerBar ficar fixo no bottom, StepContent scrollar internamente.

### Mudança 2: Mover `tip` para dentro do MockupChrome — `FrameRenderer.tsx` + `MockupChrome.tsx`
- `FrameRenderer.tsx`: passar `frame.tip` como prop para MockupChrome em vez de renderizar card externo
- `MockupChrome.tsx`: aceitar prop `tip` e renderizar como banner inline no fundo do mockup (fundo indigo-50, texto indigo-700, rounded, dentro do body)
- Economia: ~50px

### Mudança 3: Colapsar `action` e `check` em mini-cards inline — `FrameRenderer.tsx`
Em vez de cards com padding generoso, renderizar action e check como **labels compactos** de 1 linha dentro do mesmo container do mockup, abaixo do tip:
- Action: ícone 👆 + texto em 1-2 linhas, padding mínimo (px-2 py-1.5)
- Check: ícone ✅ + texto em 1-2 linhas, padding mínimo
- Ambos dentro do MockupChrome, não fora
- Economia: ~80px (eliminando 2 cards externos + gaps)

### Mudança 4: Incluir `action` + `check` + `tip` no texto de narração para TTS futuro
Hoje o `audio_url` de todos os steps é `null` (verificado no banco). Quando o áudio for gerado, o texto de narração deve concatenar: `description` + `tip.text` + `action` + `check`. Isso será feito no pipeline de geração de áudio (edge function), não no frontend.

Por ora, **no frontend**: quando não há áudio (`audio_url === null`), o action e check ficam visíveis como mini-cards inline dentro do mockup. Quando houver áudio, eles são narrados e o visual serve apenas como reforço.

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `LessonContainer.tsx` | `h-dvh overflow-hidden` no mobile |
| `MockupChrome.tsx` | Aceitar props `tip`, `action`, `check` e renderizar internamente |
| `FrameRenderer.tsx` | Passar tip/action/check para MockupChrome, remover cards externos |
| `ActionCard.tsx` | Mantido (pode ser usado em outros contextos) |
| `ValidationCard.tsx` | Mantido (pode ser usado em outros contextos) |

Nenhuma alteração no banco de dados.

