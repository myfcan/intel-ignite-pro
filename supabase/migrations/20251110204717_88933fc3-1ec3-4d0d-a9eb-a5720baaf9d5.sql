-- 🎯 CORREÇÃO CRÍTICA: Prevenir duplicatas de order_index
-- Adiciona constraint único para impedir que múltiplas lições tenham o mesmo order_index na mesma trilha

ALTER TABLE lessons 
ADD CONSTRAINT unique_trail_order 
UNIQUE (trail_id, order_index);

-- Criar índice para melhorar performance de queries por order_index
CREATE INDEX IF NOT EXISTS idx_lessons_trail_order 
ON lessons(trail_id, order_index);