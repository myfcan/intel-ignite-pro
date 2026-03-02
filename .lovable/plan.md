

# Refinamento Visual do Certificado V8

## Problema

Comparando com a referencia do Cursiv, nosso certificado esta:
- **Bordas muito finas e apagadas** — quase invisiveis
- **Textos com opacidade baixa** — "Concedido a", "AIliv Academy" parecem fantasmas
- **Card pequeno demais no desktop** — 280px e pouco impactante
- **Selo (emblem) discreto** — nao chama atencao
- **Progress bar fina demais** — quase imperceptivel
- **Falta motivacao textual** — o Cursiv tem "Voce esta no caminho certo!" + "Continue e desbloqueie seu certificado personalizado"

## Referencia Cursiv (o que funciona)

O design do Cursiv mostra:
1. Card com borda visivel (1.5-2px solida, nao rgba quase transparente)
2. Selo grande e centralizado com contorno forte
3. Texto motivacional abaixo do certificado ("Voce esta no caminho certo!")
4. Sub-texto explicativo ("Continue e desbloqueie seu certificado personalizado de conclusao")
5. Progress bar com porcentagem visivel (0%)
6. Layout do info panel a direita do mini-cert (mobile) com hierarquia clara

## Alteracoes no `V8CertificateCard.tsx`

### Desktop (card vertical sticky)

| Propriedade | Atual | Novo |
|---|---|---|
| Largura | 280px | 320px |
| Borda card | 1px rgba(0,0,0,0.06) | 1.5px solid hsl(250,15%,88%) |
| Shadow | 0 2px 12px rgba(0,0,0,0.06) | 0 4px 20px rgba(0,0,0,0.08) |
| Borda dupla interna cert | 1px, opacity 0.5 | 1.5px, opacity 0.7 |
| Selo tamanho | 52px | 60px |
| Selo outline | 2.5px | 3px |
| Texto "Certificado" | 14px | 16px |
| Texto "de Conclusao" | 12px | 13px |
| Texto "Concedido a" | opacity 0.6 | opacity 0.8 |
| "AIliv Academy" | opacity 0.7, 10px | opacity 1, 12px |
| Progress bar | height 2px | height 4px |
| Texto motivacional | apenas "X aulas restantes" | **"Voce esta no caminho certo!"** + subtexto |

### Mobile (card horizontal)

| Propriedade | Atual | Novo |
|---|---|---|
| Borda card | 1px rgba(0,0,0,0.06) | 1.5px solid hsl(250,15%,88%) |
| Mini-cert width | min(195px, 58vw) | min(180px, 50vw) |
| Texto info | "Complete as aulas para liberar" | **"Obtenha seu certificado"** + subtexto motivacional |
| Progress bar | height 1.5px | height 3px |

### CertificateDocument (interno)

- Bordas duplas: de 1px para **1.5px** com opacidade de 0.5 para **0.7**
- Linhas divisoras (signature, concedido a): de 1px para **1.5px**, cores mais fortes
- Diamond divider: de 8px para **10px** no desktop
- Padding interno: de 20px para **24px**

### Texto motivacional novo (estado locked/in_progress)

```text
Titulo: "Obtenha seu certificado" (ou "Voce esta no caminho certo!" se in_progress)
Sub: "Continue e desbloqueie seu certificado personalizado de conclusao"
```

### Resumo dos arquivos

**Arquivo modificado:** `src/components/lessons/v8/V8CertificateCard.tsx`
- Aumentar bordas, sombras, tamanhos de fonte e opacidades
- Adicionar texto motivacional contextual por estado
- Aumentar largura do card desktop de 280 para 320px
- Engrossar progress bar
- Aumentar selo e seus contornos

Nenhum arquivo novo. Nenhuma mudanca de banco de dados.

