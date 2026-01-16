// ============================================
// DASHBOARD BACKGROUND 3D - Subtle Professional Background
// ============================================

import { Suspense, useMemo, memo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Props interfaces
interface AmbientParticlesProps {
  count?: number;
}

// Subtle Wave Grid
const WaveGrid = memo(() => {
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  
  useFrame(({ clock }) => {
    if (geometryRef.current) {
      const positions = geometryRef.current.attributes.position;
      const time = clock.getElapsedTime();
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const wave = Math.sin(x * 0.5 + time * 0.5) * Math.cos(y * 0.5 + time * 0.3) * 0.3;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
    }
  });

  return (
    <mesh position={[0, -3, -5]} rotation={[-Math.PI / 3, 0, 0]}>
      <planeGeometry ref={geometryRef} args={[20, 20, 30, 30]} />
      <meshBasicMaterial 
        color="#8b5cf6" 
        wireframe 
        transparent 
        opacity={0.08}
      />
    </mesh>
  );
});
WaveGrid.displayName = 'WaveGrid';

// Ambient Particles
const AmbientParticles = memo(({ count = 80 }: AmbientParticlesProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#a78bfa"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
});
AmbientParticles.displayName = 'AmbientParticles';

// Scene
const Scene = memo(() => {
  return (
    <>
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 5]} intensity={0.3} color="#8b5cf6" />
      
      <WaveGrid />
      <AmbientParticles />
      
      <Sparkles
        count={30}
        scale={15}
        size={1}
        speed={0.1}
        color="#c4b5fd"
        opacity={0.3}
      />
      
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.9} 
          intensity={0.3}
        />
      </EffectComposer>
    </>
  );
});
Scene.displayName = 'Scene';

interface DashboardBackground3DProps {
  className?: string;
  enabled?: boolean;
}

export const DashboardBackground3D = memo(({ 
  className = '',
  enabled = true
}: DashboardBackground3DProps) => {
  if (!enabled) return null;
  
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
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
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
});
DashboardBackground3D.displayName = 'DashboardBackground3D';
