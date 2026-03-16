-- ============================================================
-- AILIV V10 — Add narration_script column to lesson steps
-- Migration: 20260316130000_add_narration_script_column.sql
-- Data: 16/03/2026
-- Descrição: Armazena o script de narração com tags [ANCHOR:*]
--            para processamento via ElevenLabs with-timestamps
-- ============================================================

ALTER TABLE v10_lesson_steps
  ADD COLUMN IF NOT EXISTS narration_script text;

COMMENT ON COLUMN v10_lesson_steps.narration_script IS
  'Script de narração com tags [ANCHOR:*]. Processado pela edge function v10-process-anchors: '
  'tags são removidas antes de enviar pro ElevenLabs, e as frases após cada tag são usadas '
  'para match de timestamps no alignment retornado.';
