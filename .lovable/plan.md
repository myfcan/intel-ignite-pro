
# Plano: Consolidar scenes[] Canonico + JSON References + Gap V7Contract

## Contexto

A implementacao C03 ja esta feita:
- `V7Contract.ts`: `V7Phase.scenes: V7Scene[]` obrigatorio
- `v7-vv/index.ts`: Pipeline popula `phase.scenes[]` (1:1)
- `audit-contracts/index.ts`: C03 validacao ativa
- `docs/contracts/v7-vv-contracts.md`: Secao D documentada
- Compat guard 60 dias ativo

O que **falta** para fechar a decisao do CTO:

---

## 1. Gap Critico: `image-sequence` ausente em V7Contract.ts

`image-sequence` existe em `V7ScriptInput.ts` (input) mas NAO existe em `V7Contract.ts` (output/runtime). Isso significa que o tipo `V7VisualContent` (union discriminada) nao inclui `image-sequence`, criando uma desconexao entre pipeline output e renderer contract.

**Acao:**
- Adicionar `'image-sequence'` ao `V7VisualType`
- Criar `V7ImageSequenceContent` interface com `frames[]`
- Adicionar ao union `V7VisualContent`

```typescript
// V7Contract.ts
export type V7VisualType = /* existentes */ | 'image-sequence';

export interface V7ImageSequenceFrame {
  id: string;
  promptScene: string;
  durationMs: number;
  presetKey?: string;
  storagePath?: string;
  assetId?: string;
}

export interface V7ImageSequenceContent {
  frames: V7ImageSequenceFrame[];
}

// No union V7VisualContent:
| { type: 'image-sequence'; content: V7ImageSequenceContent }
```

---

## 2. JSON Reference Minimal (1 cena)

**Arquivo:** `docs/references/v7-reference-minimal.json`

Um JSON minimo valido com:
- 1 scene tipo `narrative`
- `scenes[]` no root (obrigatorio)
- Visual simples (`text-reveal`)
- 1 microVisual
- anchorText com transitionAt
- Todas as invariantes C03/C10/C10B/C14 satisfeitas

---

## 3. JSON Reference Image-Sequence 3 Frames

**Arquivo:** `docs/references/v7-reference-image-sequence.json`

Um JSON com:
- 3+ scenes (pelo menos 1 com `image-sequence`)
- Scene image-sequence com 3 frames, cada um com `promptScene` e `durationMs >= 2000`
- Total de sequencia >= 6000ms
- Sem microVisuals tipo `image` na mesma cena (exclusao mutua C12.1)
- `storagePath` com UUIDs validos (formato `image-lab/generated/{uuid}/{uuid}.png`)

---

## 4. Verificacao de consistencia AdminContracts.tsx

Confirmar que C03 esta com status `ACTIVE` na pagina de contratos admin. (Ja foi feito na implementacao anterior, mas validar que nao houve regressao.)

---

## Sequencia de Execucao

1. `src/types/V7Contract.ts` — Adicionar `image-sequence` ao type system
2. `docs/references/v7-reference-minimal.json` — Criar JSON Reference Minimal
3. `docs/references/v7-reference-image-sequence.json` — Criar JSON Reference Image-Sequence
4. Validar AdminContracts.tsx (leitura, sem mudanca se ja correto)

## O Que NAO Sera Feito

- Nao remover scenes[] de nenhum lugar
- Nao marcar como BY_DESIGN (rejeitado)
- Nao alterar compat guard (permanece 60 dias)
- Nao modificar pipeline ou audit gate (ja corretos)
