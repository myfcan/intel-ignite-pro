-- Permitir visualização pública de rankings (sem expor dados sensíveis)
CREATE POLICY "Anyone can view user rankings"
  ON public.users FOR SELECT
  USING (true);

-- Habilitar realtime para tabela users (para atualizar ranking em tempo real)
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;