
# Reorganizacao: Guia de Modelos vs Contratos Ativos

## Problema Atual
A pagina `AdminModelos.tsx` mistura dois conceitos distintos:
1. **Guias de Modelos** (templates JSON, MicroVisual Types, Interactive Scene Types, Visual Effects)
2. **Contratos Ativos C01-C12** (regras do pipeline/runtime)

O usuario quer separar essas responsabilidades.

## Mudancas Planejadas

### 1. AdminModelos.tsx — Limpar para ser APENAS Guias de Modelos
Remover toda a secao de contratos (C01-C12, BoundaryFixGuard, Deprecated/Gaps) e manter apenas:
- JSON Modelo Padrao (card de destaque com botao copiar)
- MicroVisual Types (7 canonicos) — card expandido com documentacao detalhada, exemplos JSON de cada tipo
- Interactive Scene Types — card expandido com mapeamentos e regras
- Visual Effects — card com tipos suportados
- Audit Gate Protocol (referencia)
- Links rapidos

Cada card sera bem detalhado, com exemplos concretos de JSON para cada tipo.

### 2. Nova pagina: AdminContracts.tsx
Criar pagina dedicada `/admin/contracts` contendo:
- Todos os contratos C01-C12 (ContractCard colapsavel)
- BoundaryFixGuard
- Deprecated & Known Gaps
- Badges de versao (contract version, pipeline version, runtime version)

### 3. AdminV7vv.tsx — Adicionar card de acesso aos Contratos
Adicionar um card/botao na pagina de criacao V7-vv (`/admin/v7-vv`) que linka para `/admin/contracts`, para que os contratos fiquem acessiveis no contexto de criacao.

### 4. Admin.tsx — Atualizar navegacao
- Card "Guia de Modelos" mantem descricao focada em templates e documentacao
- Adicionar botao de acesso rapido para "Contratos Ativos"

### 5. App.tsx — Nova rota
Registrar rota `/admin/contracts` apontando para `AdminContracts.tsx`.

---

## Detalhamento Tecnico

### Arquivos modificados:
| Arquivo | Acao |
|---------|------|
| `src/pages/AdminModelos.tsx` | Remover contratos C01-C12, expandir cards de modelos com exemplos JSON detalhados |
| `src/pages/AdminContracts.tsx` | **NOVO** — Toda logica de contratos movida para ca |
| `src/pages/AdminV7vv.tsx` | Adicionar card/link para `/admin/contracts` |
| `src/pages/Admin.tsx` | Atualizar descricao do card Guia de Modelos, adicionar acesso rapido a Contratos |
| `src/App.tsx` | Adicionar rota `/admin/contracts` |

### AdminModelos.tsx — Cards detalhados (exemplo MicroVisual):
Cada tipo canonico tera:
- Nome e descricao
- JSON de exemplo real (copiavel)
- Regras de uso (max 1 por frase, anchorText obrigatorio, etc)
- Mapeamento input -> output do pipeline

### AdminContracts.tsx:
Move todo o codigo existente de contratos (interface `ContractInfo`, array `CONTRACTS`, `ContractCard`, `BOUNDARY_FIX_GUARD`, secoes Active/Deprecated/Gaps) para este novo arquivo, sem alteracoes de logica.
