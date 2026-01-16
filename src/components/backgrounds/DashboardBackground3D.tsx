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

// Vibrant Wave Grid - More visible and dynamic
const WaveGrid = memo(({ speedMultiplier = 1 }: { speedMultiplier?: number }) => {
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  
  useFrame(({ clock }) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position;
      const time = clock.getElapsedTime() * speedMultiplier;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave = Math.sin(x * 0.4 + time * 0.6) * Math.cos(y * 0.4 + time * 0.4) * 0.5;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh position={[0, -2, -4]} rotation={[-Math.PI / 3.5, 0, 0]}>
      <planeGeometry ref={geometryRef} args={[25, 25, 40, 40]} />
      <meshBasicMaterial 
        color="#a78bfa" 
        wireframe 
        transparent 
        opacity={0.15}
      />
    </mesh>
  );
});
WaveGrid.displayName = 'WaveGrid';

// Vibrant Ambient Particles - More visible and alive
const AmbientParticles = memo(({ count = 150, speedMultiplier = 1 }: AmbientParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3;
      siz[i] = Math.random() * 0.03 + 0.02;
    }
    return { positions: pos, sizes: siz };
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime() * speedMultiplier;
      pointsRef.current.rotation.y = time * 0.03;
      pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#c4b5fd"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
});
AmbientParticles.displayName = 'AmbientParticles';

// Glowing Orb for depth effect
const GlowingOrb = memo(({ speedMultiplier = 1 }: { speedMultiplier?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime() * speedMultiplier;
      meshRef.current.position.y = Math.sin(time * 0.5) * 0.5 + 2;
      meshRef.current.position.x = Math.cos(time * 0.3) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[3, 2, -8]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial 
        color="#8b5cf6" 
        transparent 
        opacity={0.15}
      />
    </mesh>
  );
});
GlowingOrb.displayName = 'GlowingOrb';

// Scene with configurable settings - Enhanced for visibility
const Scene = memo(({ bloomIntensity, particleSpeed, particleCount }: SceneProps) => {
  const actualParticleCount = Math.floor(150 * particleCount);
  
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[-5, 3, -3]} intensity={0.3} color="#c4b5fd" />
      
      <WaveGrid speedMultiplier={particleSpeed} />
      <AmbientParticles count={actualParticleCount} speedMultiplier={particleSpeed} />
      <GlowingOrb speedMultiplier={particleSpeed} />
      
      <Sparkles
        count={Math.floor(60 * particleCount)}
        scale={18}
        size={2}
        speed={0.2 * particleSpeed}
        color="#e9d5ff"
        opacity={0.5}
      />
      
      <Sparkles
        count={Math.floor(30 * particleCount)}
        scale={12}
        size={1.5}
        speed={0.15 * particleSpeed}
        color="#a78bfa"
        opacity={0.4}
      />
      
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.3} 
          luminanceSmoothing={0.8} 
          intensity={0.5 * bloomIntensity}
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
