
# Plano: Consolidar scenes[] Canonico + JSON References + Gap V7Contract

## Status: ✅ COMPLETO (2026-02-18)

Todas as 4 ações foram executadas:

1. ✅ `V7Contract.ts` — `image-sequence` adicionado ao type system (V7VisualType, V7ImageSequenceFrame, V7ImageSequenceContent, V7VisualContent union)
2. ✅ `docs/references/v7-reference-minimal.json` — JSON Reference Minimal (1 cena narrative, text-reveal, 1 microVisual, anchorText)
3. ✅ `docs/references/v7-reference-image-sequence.json` — JSON Reference Image-Sequence (3 scenes, 3 frames com promptScene/durationMs/storagePath UUID, exclusão mútua C12.1)
4. ✅ `AdminContracts.tsx` — C03 confirmado como ACTIVE (sem regressão)

## Decisão registrada
- scenes[] = canônico (input oficial)
- phase.visual = artefato compilado (derivado de scene[0])
- BY_DESIGN rejeitado
- Compat guard 60 dias mantido (até 2026-04-18)
