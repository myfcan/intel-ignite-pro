-- ============================================================
-- AILIV V10 — ANCHOR TEXT SYSTEM (Fase 1)
-- Migration: 20260316120000_create_anchor_text_system.sql
-- Data: 16/03/2026
-- Descrição: Cria tabela lesson_step_anchors para sincronização
--            áudio ↔ visual no player V10
-- ============================================================

-- ============================================================
-- 1. TABELA: v10_lesson_step_anchors
-- Conecta momentos da narração a eventos visuais na tela.
-- Cada registro = um anchor (ponto de sincronização).
-- ============================================================
CREATE TABLE IF NOT EXISTS v10_lesson_step_anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES v10_lesson_steps(id) ON DELETE CASCADE,
  anchor_type text NOT NULL CHECK (anchor_type IN (
    'pontos_atencao', 'confirmacao', 'troca_frame', 'troca_ferramenta'
  )),
  timestamp_seconds decimal NOT NULL,
  match_phrase text NOT NULL,
  label text,
  created_at timestamptz DEFAULT now(),

  -- Um step pode ter vários anchors, mas cada tipo só aparece uma vez
  -- por timestamp (exceto troca_frame que pode aparecer N vezes)
  UNIQUE(step_id, anchor_type, timestamp_seconds)
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_v10_anchors_step
  ON v10_lesson_step_anchors(step_id);

CREATE INDEX IF NOT EXISTS idx_v10_anchors_step_timestamp
  ON v10_lesson_step_anchors(step_id, timestamp_seconds);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE v10_lesson_step_anchors ENABLE ROW LEVEL SECURITY;

-- Leitura: mesma lógica dos steps (lesson publicada OU admin/supervisor)
CREATE POLICY "v10_anchors_select" ON v10_lesson_step_anchors
  FOR SELECT USING (
    step_id IN (
      SELECT s.id FROM v10_lesson_steps s
      JOIN v10_lessons l ON s.lesson_id = l.id
      WHERE l.status = 'published'
    )
    OR auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' IN ('admin', 'supervisor')
    )
  );

-- Admin pode tudo
CREATE POLICY "v10_anchors_admin_all" ON v10_lesson_step_anchors
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
