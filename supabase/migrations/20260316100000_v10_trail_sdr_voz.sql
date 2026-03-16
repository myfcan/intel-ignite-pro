-- ============================================================
-- AILIV V10 — Cria trilha V10 e vincula aula SDR de Voz
-- Migration: 20260316100000_v10_trail_sdr_voz.sql
-- Data: 16/03/2026
-- Descrição: Cria a trilha "SDR & Automação com IA" (tipo v10)
--            e vincula a aula "SDR de Voz com IA" a ela
-- ============================================================

-- 1. Criar trilha V10
INSERT INTO trails (id, title, description, icon, order_index, is_active, trail_type)
VALUES (
  'c0000010-0001-4000-8000-000000000001',
  'SDR & Automação com IA',
  'Aprenda a construir sistemas de vendas automatizados usando IA. Ligações, follow-ups e qualificação de leads no piloto automático.',
  '📞',
  100,
  true,
  'v10'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Vincular a aula SDR de Voz à trilha V10
UPDATE v10_lessons
SET trail_id = 'c0000010-0001-4000-8000-000000000001',
    order_in_trail = 1
WHERE id = 'b0000001-0001-4000-8000-000000000001';

-- 3. Vincular também a demo lesson (se existir)
UPDATE v10_lessons
SET trail_id = 'c0000010-0001-4000-8000-000000000001',
    order_in_trail = 2
WHERE slug = 'chatgpt-pesquisa'
  AND trail_id IS NULL;
