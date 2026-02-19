/**
 * V7StaticImageRenderer
 * Renders a single static image from Supabase Storage (private bucket)
 * Used by V7PhasePlayer for visual.type === 'image'
 */

import { motion } from 'framer-motion';
import { useSignedUrl } from '@/hooks/useSignedUrl';

interface V7StaticImageRendererProps {
  storagePath: string;
  effects?: {
    mood?: string;
    glow?: boolean;
    vignette?: boolean;
    particles?: string;
  };
  phaseId: string;
}

export default function V7StaticImageRenderer({
  storagePath,
  effects,
  phaseId,
}: V7StaticImageRendererProps) {
  const signedUrl = useSignedUrl(storagePath, 'image-lab', 3600);

  return (
    <motion.div
      key={phaseId}
      className="absolute inset-0 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {signedUrl ? (
        <img
          src={signedUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      ) : (
        // Placeholder while URL resolves
        <div className="w-full h-full bg-background/80" />
      )}

      {/* Vignette overlay */}
      {effects?.vignette && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)'
        }} />
      )}

      {/* Glow overlay */}
      {effects?.glow && (
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20" style={{
          background: 'radial-gradient(ellipse at center, rgba(255,200,100,0.4) 0%, transparent 70%)'
        }} />
      )}
    </motion.div>
  );
}
