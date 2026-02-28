

# Redesign Premium do Certificado — Compacto, Realista e Responsivo

## Resumo

Redesenhar completamente o card de certificado na pagina V8TrailDetail para parecer um documento real e premium, sem competir visualmente com as aulas. No mobile, o certificado sera compacto (max 170px de altura) com modal para visualizacao ampliada.

---

## Mudancas Principais

### 1. Componente Separado: `V8CertificateCard`

Extrair o certificado para `src/components/lessons/v8/V8CertificateCard.tsx` com:

- **Props**: `completedCount`, `totalLessons`, `allCompleted`, `trailTitle`
- **3 estados visuais**: bloqueado, em progresso, liberado
- **Modal integrado** para visualizacao ampliada no mobile

### 2. Layout Mobile Compacto (max 170px altura)

- Card horizontal compacto com mini-preview do certificado a esquerda e info a direita
- Altura maxima: `max-h-[170px]`
- Largura: `w-full` com padding lateral do container
- Toque abre modal com certificado em tamanho real
- Garantir que a primeira aula fique visivel acima da dobra

### 3. Layout Desktop (lateral, 280px)

- Manter posicao sticky lateral
- Reduzir de 300px para 280px para dar mais espaco a skill tree
- Proporcao vertical ~4:5
- Hover sutil com elevacao minima

### 4. Design Premium do Certificado

**Estrutura visual:**

```text
+------------------------------------------+
|  [Header fino: icone + "Certificado"]    |
+------------------------------------------+
|                                          |
|   ┌─ borda interna fina ──────────────┐  |
|   │                                    │  |
|   │      [Selo circular discreto]      │  |
|   │                                    │  |
|   │   CERTIFICADO DE CONCLUSAO         │  |
|   │   (serifada, tracking largo)       │  |
|   │                                    │  |
|   │   ─── ✦ ───                        │  |
|   │                                    │  |
|   │   [Linhas simulando texto]         │  |
|   │   (cinza sutil, nao placeholder)   │  |
|   │                                    │  |
|   │   ─────────────────                │  |
|   │   AIliv Academy                    │  |
|   └────────────────────────────────────┘  |
|                                          |
|   2 aulas restantes        ████░░ 0/2   |
+------------------------------------------+
```

**Detalhes de acabamento:**

- Fundo: branco quente `#FDFCFA` com textura SVG noise muito sutil (opacity 0.02)
- Borda externa: `1px solid rgba(0,0,0,0.08)` — discreta, sem dourado exagerado
- Borda interna ornamental: `1px solid` cinza/dourado conforme estado
- Cantos ornamentais: L-shapes nos 4 cantos, finos (1.5px)
- Selo: circulo de 48px (reduzido de 64px), gradiente metalico sutil
- Sombra: `0 4px 20px rgba(0,0,0,0.06)` — suave, sem glow
- Border radius: 20px
- Tipografia "CERTIFICADO DE CONCLUSAO": Georgia serif, 11px, tracking 0.12em
- Linhas de texto simulado: retangulos com cantos arredondados, opacity 0.35
- "AIliv Academy": 9px, Georgia, cor suave

### 5. Estados do Card

| Estado | Selo | CTA | Opacidade |
|--------|------|-----|-----------|
| Bloqueado | Cadeado cinza, selo opacity 0.6 | "Complete as aulas" (texto discreto) | Certificado com opacity 0.7 |
| Em progresso | Sem cadeado, selo neutro | Barra de progresso ativa | Certificado com opacity 0.85 |
| Liberado | Trofeu dourado, selo brilho sutil | "Ver certificado" primario | Certificado opacity 1, borda dourada fina |

### 6. Modal de Certificado (Mobile)

- Usa componente Dialog existente do projeto
- Certificado renderizado em tamanho completo dentro do modal
- Fundo escurecido `bg-black/60`
- Botao fechar no topo
- Se liberado: botoes "Baixar" e "Fechar"

---

## Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `src/components/lessons/v8/V8CertificateCard.tsx` | **Criar** — componente extraido |
| `src/pages/V8TrailDetail.tsx` | **Editar** — substituir bloco inline pelo novo componente |

---

## Detalhes Tecnicos

- Usar `framer-motion` para animacoes sutis (entrada, hover)
- Usar Dialog do `@radix-ui/react-dialog` (ja disponivel) para modal mobile
- Breakpoint mobile/desktop: `lg:` (1024px) — consistente com layout atual
- No mobile: card usa `flex-row` com mini-preview (80px de largura) + texto ao lado
- No desktop: card usa layout vertical completo
- Zero layout shift — sem animacoes que alterem dimensoes

