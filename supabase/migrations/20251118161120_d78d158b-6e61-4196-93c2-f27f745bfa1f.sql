-- Fase 4: Sistema de Recompensas

-- Criar tabela user_rewards
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.user_daily_missions(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL CHECK (reward_value > 0),
  collected BOOLEAN NOT NULL DEFAULT false,
  collected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_collected ON public.user_rewards(user_id, collected);
CREATE INDEX IF NOT EXISTS idx_user_rewards_mission ON public.user_rewards(mission_id);

-- RLS Policies
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.user_rewards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON public.user_rewards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
  ON public.user_rewards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all rewards"
  ON public.user_rewards
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Função para criar recompensa automaticamente quando missão é completada
CREATE OR REPLACE FUNCTION public.create_reward_on_mission_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_template RECORD;
BEGIN
  -- Só criar recompensa se a missão acabou de ser completada
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    -- Buscar informações do template
    SELECT reward_type, reward_value
    INTO v_template
    FROM missions_daily_templates
    WHERE id = NEW.mission_id;
    
    IF FOUND THEN
      -- Criar recompensa (use INSERT ... ON CONFLICT para evitar duplicatas)
      INSERT INTO user_rewards (user_id, mission_id, reward_type, reward_value, collected)
      VALUES (NEW.user_id, NEW.id, v_template.reward_type, v_template.reward_value, false)
      ON CONFLICT (user_id, mission_id) DO NOTHING;
      
      RAISE LOG 'Recompensa criada para missão %: % %', NEW.id, v_template.reward_value, v_template.reward_type;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para criar recompensas automaticamente
DROP TRIGGER IF EXISTS trigger_create_reward_on_mission_complete ON public.user_daily_missions;
CREATE TRIGGER trigger_create_reward_on_mission_complete
  AFTER UPDATE OF completed ON public.user_daily_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_reward_on_mission_complete();