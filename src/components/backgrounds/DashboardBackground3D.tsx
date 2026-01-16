// ============================================
// DASHBOARD BACKGROUND 3D - Subtle Professional Background
// ============================================

import { Suspense, useMemo, memo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBackground3DSafe } from '@/contexts/Background3DContext';

// Props interfaces
interface AmbientParticlesProps {
  count?: number;
  speedMultiplier?: number;
}

interface SceneProps {
  bloomIntensity: number;
  particleSpeed: number;
  particleCount: number;
}

// Lightweight Wave Grid - Optimized for performance
const WaveGrid = memo(({ speedMultiplier = 1 }: { speedMultiplier?: number }) => {
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  
  useFrame(({ clock }) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position;
      const time = clock.getElapsedTime() * speedMultiplier;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave = Math.sin(x * 0.3 + time * 0.4) * Math.cos(y * 0.3 + time * 0.3) * 0.3;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh position={[0, -2, -5]} rotation={[-Math.PI / 3.5, 0, 0]}>
      <planeGeometry ref={geometryRef} args={[20, 20, 20, 20]} />
      <meshBasicMaterial 
        color="#a78bfa" 
        wireframe 
        transparent 
        opacity={0.08}
      />
    </mesh>
  );
});
WaveGrid.displayName = 'WaveGrid';

// Lightweight Ambient Particles - Optimized for weak devices
const AmbientParticles = memo(({ count = 40, speedMultiplier = 1 }: AmbientParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime() * speedMultiplier;
      pointsRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#c4b5fd"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
});
AmbientParticles.displayName = 'AmbientParticles';

// Lightweight Scene - Optimized for weak devices
const Scene = memo(({ bloomIntensity, particleSpeed, particleCount }: SceneProps) => {
  const actualParticleCount = Math.floor(40 * particleCount);
  
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 5]} intensity={0.3} color="#8b5cf6" />
      
      <WaveGrid speedMultiplier={particleSpeed} />
      <AmbientParticles count={actualParticleCount} speedMultiplier={particleSpeed} />
      
      <Sparkles
        count={Math.floor(25 * particleCount)}
        scale={15}
        size={1.5}
        speed={0.15 * particleSpeed}
        color="#e9d5ff"
        opacity={0.3}
      />
      
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.4} 
          luminanceSmoothing={0.9} 
          intensity={0.3 * bloomIntensity}
        />
      </EffectComposer>
    </>
  );
});
Scene.displayName = 'Scene';

interface DashboardBackground3DProps {
  className?: string;
}

export const DashboardBackground3D = memo(({ 
  className = ''
}: DashboardBackground3DProps) => {
  const settings = useBackground3DSafe();
  
  if (!settings.enabled) return null;
  
  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: settings.opacity }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1]}
        gl={{ 
          antialias: false, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene 
            bloomIntensity={settings.bloomIntensity}
            particleSpeed={settings.particleSpeed}
            particleCount={settings.particleCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
});
DashboardBackground3D.displayName = 'DashboardBackground3D';
