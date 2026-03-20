

## Plano: Upgrade Visual dos Mockups — de Wireframe para SaaS Realista

### Diagnóstico

Os mockups atuais são funcionais mas parecem wireframes: flat, sem sombras, sem ícones contextuais, sem a identidade visual das ferramentas reais (Calendly azul, Make roxo, Google colorido, etc). O objetivo é chegar a 80% de fidelidade com interfaces SaaS reais.

### Mudanças (8 arquivos)

---

**1. `MockupChrome.tsx` — Adicionar profundidade e realismo ao container**
- Sombra mais pronunciada (`shadow-lg` + sombra interna sutil no body)
- Barra superior com gradiente sutil em vez de cor sólida
- Borda inferior na barra com 1px mais escuro para separação
- Body com `background: #FAFBFC` em vez de branco puro

**2. `ChromeHeader.tsx` — Browser bar mais realista**
- Adicionar barra de endereço com fundo `#FFFFFF` arredondado dentro do header cinza
- Ícone de cadeado (🔒) antes da URL
- Botões de navegação (← →) antes dos dots
- Separação visual mais clara

**3. `MockupInput.tsx` — Inputs com visual SaaS**
- Adicionar `transition` sutil
- Inner shadow (`inset 0 1px 2px rgba(0,0,0,0.05)`) para profundidade
- Ícone opcional (prop `icon`) — quando presente, mostra à esquerda do input
- Cursor de texto simulado quando vazio (barra piscante via CSS)

**4. `MockupSelect.tsx` — Select mais realista**
- Mesma inner shadow dos inputs
- Chevron com cor que combina com barColor
- Fundo levemente diferente do input para distinção visual

**5. `MockupButton.tsx` — Botões premium**
- Primary: adicionar `boxShadow` com cor do barColor (glow sutil), hover implícito via gradiente mais rico
- Secondary: borda mais definida, ícone com cor contextual
- Adicionar prop `disabled` visual (opacity)
- Cantos levemente mais arredondados (10px)

**6. `WarningCard.tsx` — Card de aviso com ícone**
- Adicionar ícone ⚠️ à esquerda com layout flex
- Borda esquerda amarela (3px) em vez de borda completa
- Tipografia: texto bold para a primeira frase

**7. `NavBreadcrumb.tsx` — Breadcrumb com ícones de app**
- Adicionar ícone de pasta/app antes de cada item
- Setas com animação sutil (opacity)
- Background com gradiente muito sutil

**8. `CelebrationCard.tsx` — Card de celebração mais premium**
- Gradiente de fundo (verde esmeralda sutil)
- Ícone maior com animação de pulse
- Borda com gradiente em vez de sólida

---

### Resultado Esperado
- Inputs/selects com profundidade (inner shadow)
- Botões com glow contextual
- Chrome bar que parece um navegador real
- Cards informativos com ícones e hierarquia visual
- Visual geral: de wireframe → mini-SaaS screenshot

