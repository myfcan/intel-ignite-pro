-- Criar bucket para cache de áudios TTS contextuais
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Política para leitura pública
CREATE POLICY "TTS cache is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tts-cache');

-- Política para upload (service role via edge function)
CREATE POLICY "Service role can upload TTS cache"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tts-cache');