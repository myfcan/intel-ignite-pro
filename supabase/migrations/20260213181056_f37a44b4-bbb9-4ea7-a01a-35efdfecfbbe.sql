
-- PARTE 3: Tornar bucket image-lab privado
UPDATE storage.buckets SET public = false WHERE id = 'image-lab';

-- Remover policy de leitura pública
DROP POLICY IF EXISTS "public_read_image_lab" ON storage.objects;

-- Criar policy de leitura restrita a admin/supervisor
CREATE POLICY "admin_read_image_lab" ON storage.objects
FOR SELECT USING (
  bucket_id = 'image-lab' AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "supervisor_read_image_lab" ON storage.objects
FOR SELECT USING (
  bucket_id = 'image-lab' AND has_role(auth.uid(), 'supervisor'::app_role)
);

-- PARTE 4: Adicionar bytes_out a image_attempts
ALTER TABLE public.image_attempts ADD COLUMN IF NOT EXISTS bytes_out integer;
