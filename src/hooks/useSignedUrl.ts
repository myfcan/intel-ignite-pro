/**
 * useSignedUrl - Resolves a Supabase Storage path into a signed URL
 * 
 * Used by the V7 renderer to display images from the private "image-lab" bucket.
 * Supports lazy refresh: if the signed URL expires (1h), re-fetching the component
 * will generate a new one.
 * 
 * @param storagePath - Path inside the bucket (e.g. "job-id/attempt-id/0.png")
 * @param bucket - Storage bucket name (default: "image-lab")
 * @param expiresIn - Signed URL validity in seconds (default: 3600 = 1h)
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSignedUrl(
  storagePath: string | null | undefined,
  bucket = 'image-lab',
  expiresIn = 3600
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!storagePath) return;
    // ✅ P3/C13: Skip PENDING paths — renderer will show placeholder
    if (storagePath.startsWith('PENDING:')) {
      console.warn(`[useSignedUrl] Skipping PENDING storagePath: ${storagePath}`);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, expiresIn);
      if (!cancelled && !error && data?.signedUrl) {
        setUrl(data.signedUrl);
      }
    })();

    return () => { cancelled = true; };
  }, [storagePath, bucket, expiresIn]);

  return url;
}
