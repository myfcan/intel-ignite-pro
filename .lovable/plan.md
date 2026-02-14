

# Dashboard Limpo: 1 Card por Trilha

## Conceito

Ao inves de mostrar todas as aulas no dashboard, cada trilha aparece como **um unico card**. Ao clicar, o usuario entra na pagina `TrailDetail` (que ja existe) onde ve os cards de aulas. Isso deixa o dashboard muito mais limpo e focado.

## O que muda

### 1. Renomear as 5 trilhas no banco de dados

| # | Nome Atual | Novo Nome |
|---|---|---|
| 1 | Fundamentos de IA | Fundamentos IA |
| 2 | DOMINANDO AS IAs | Domando as IAs nos Negocios |
| 3 | IA PARA SUA VIDA | Dominando Copyright Com IA |
| 4 | APRENDIZADO ACELERADO | Renda Extra com IA |
| 5 | ORGANIZACAO TOTAL | IA para Empresas de Servicos |

Execucao via migracao SQL (UPDATE nos titulos por order_index).

### 2. Layout da secao "Suas Trilhas" no Dashboard

O grid de TrailCards ja existe e ja funciona -- cada card ja navega para `/trail/:id`. O comportamento desejado **ja esta implementado**. O que muda:

- **Desktop**: manter grid de 3 colunas (`lg:grid-cols-3`), com os 5 cards distribuidos (3 + 2)
- **Mobile**: manter 1 coluna (como esta hoje)
- Nao precisa de scroll horizontal/stories -- com apenas 5 cards compactos, a pagina nao fica poluida

### 3. Atualizar cores e labels no TrailCard

Cada trilha tera uma cor distinta no `TRAIL_THEMES`:

| Trilha | Cor | Label no badge |
|---|---|---|
| Fundamentos IA | Indigo (#6366F1) | FUNDAMENTOS |
| Domando as IAs nos Negocios | Violeta (#8B5CF6) | NEGOCIOS |
| Dominando Copyright Com IA | Roxo (#7C3AED) | COPYRIGHT |
| Renda Extra com IA | Dourado (#D4A017) | RENDA EXTRA - estilo gold premium |
| IA para Empresas de Servicos | Azul (#3B82F6) | SERVICOS |

### 4. Atualizar mapeamentos no Dashboard.tsx

- `TRAIL_ICONS`: mapear os icones corretos para cada trilha
- `TRAIL_GRADIENTS`: ajustar para novos nomes
- `TRAIL_CATEGORY_MAP`: refletir as 5 categorias

### 5. Remover a secao "Continue Aprendendo" (opcional)

Com apenas 5 cards de trilha, a secao "Continue Aprendendo" (linhas 437-499) se torna redundante -- o proprio card da trilha ativa ja mostra o progresso. Podemos manter ou remover conforme preferencia.

## Detalhes tecnicos

### Arquivos modificados

1. **Migracao SQL** -- renomear as 5 trilhas e atualizar icones
2. **`src/components/TrailCard.tsx`** -- atualizar `TRAIL_THEMES` com 5 entradas, cores e labels corretos
3. **`src/pages/Dashboard.tsx`** -- atualizar `TRAIL_ICONS`, `TRAIL_GRADIENTS`, `TRAIL_CATEGORY_MAP` para os novos nomes

### Nenhuma pagina nova necessaria

A pagina `TrailDetail.tsx` ja existe e funciona perfeitamente: mostra header da trilha, progresso, e lista de aulas com status (desbloqueada/bloqueada/completa). O clique no TrailCard ja navega para ela.

### Nenhuma dependencia nova

Usa React, framer-motion, lucide-react (ja instalados).

