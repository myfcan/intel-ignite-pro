

# Redesign Completo do Certificado — Design Premium Real

## Problemas Diagnosticados

O card atual parece um wireframe/placeholder por causa de:
- Cantos L-shapes artificiais que nao existem em certificados reais
- Selo circular generico sem peso visual
- Texto "CERTIFICADO DE CONCLUSAO" minusculo (7px no compact) sem presenca
- Linhas retangulares simulando texto parecem mockup de Figma, nao documento
- Fundo flat sem profundidade real
- **Mini-preview mobile com apenas 90px de largura — muito pequeno, parece thumbnail amador**

---

## Nova Direcao de Design

### Mobile: Mini-preview maior e com presenca real

O mini-preview do certificado no mobile sera significativamente ampliado:

- **Largura do preview: 130px** (antes 90px) — ganho de 44% de area visual
- **Padding interno do preview: 12px** (antes 10px)
- **Selo compact: 36px** (antes 28px) — mais presenca
- **Titulo compact: 9px** (antes 7px) — legivel de verdade
- **"AIliv Academy" compact: 7.5px** (antes 6px)
- **Icones compact: 16px** (antes 12-13px)
- **Altura maxima do card: 180px** (antes 170px) — ligeiro aumento para acomodar preview maior
- **Borda do preview**: sombra inset sutil + borda dourada/cinza fina para dar "moldura" ao documento
- Incluir divisor estrela e mini-linhas de texto mesmo no compact (versao reduzida) para parecer documento completo em miniatura

```text
+----------------------------------------------------------+
|  ┌────────────────┐                                      |
|  │                │                                      |
|  │   [Selo 36px]  │  [Medal] CERTIFICADO                 |
|  │                │                                      |
|  │  CERTIFICADO   │  Complete as aulas para liberar      |
|  │  DE CONCLUSAO  │                                      |
|  │   ── ◆ ──     │  ████████████░░░░░░░  0/2            |
|  │  ──────────   │                                      |
|  │  AIliv Academy │                                      |
|  │                │                                      |
|  └────────────────┘                                      |
+----------------------------------------------------------+
```

### Desktop: Documento com texto real, sem placeholders

Substituir as linhas retangulares por texto real formatado:

- **Remover**: L-shapes nos cantos, linhas retangulares cinza
- **Adicionar**: texto real com `trailTitle`, "Concedido a", linha de assinatura
- **Selo**: 52px com borda dupla (outline + border)
- **Tipografia**: "CERTIFICADO" 14px tracking 0.2em, "DE CONCLUSAO" 12px tracking 0.15em
- **Fundo**: gradiente radial `radial-gradient(ellipse at 30% 20%, #FFFEF8, #FBF9F4)`
- **Divisor**: linha fina com losango central em CSS puro

### Estados

| Estado | Selo | Borda doc | Opacidade |
|--------|------|-----------|-----------|
| Bloqueado | Lock cinza 20px, selo opacity 0.6 | cinza `hsl(0,0%,88%)` | 0.6 + overlay Lock central |
| Em progresso | Award violeta | violeta sutil | 0.85 |
| Completo | Trophy dourado com glow ring | dourada `hsl(43,55%,65%)` | 1.0, sombra dourada |

### Barra de progresso
- Cores violeta (consistente com app)
- Altura: 2px desktop, 1.5px mobile
- Track: `bg-violet-100`

---

## Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `src/components/lessons/v8/V8CertificateCard.tsx` | **Reescrever** — novo design completo com preview mobile maior |

Nenhuma mudanca em V8TrailDetail.tsx (props e importacao ja estao corretos).

---

## Detalhes Tecnicos

- Manter mesma interface de props (zero breaking changes)
- Usar `trailTitle` para texto real no documento desktop
- Compact mode renderiza documento completo em miniatura (com divisor, linhas, assinatura) em vez de versao cortada
- Sem dependencias novas
- Manter modal mobile com mesmo fluxo
- Remover toda logica de L-shapes e noise SVG

