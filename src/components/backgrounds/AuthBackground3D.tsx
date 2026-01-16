// ============================================
// AUTH BACKGROUND 3D - Professional Auth Page Background
// ============================================

import { Suspense, useMemo, memo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// Props interfaces
interface ParticleFieldProps {
  count?: number;
}

// Glass Orb
const GlassOrb = memo(() => {
  const orbRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={orbRef} position={[0, 0, -2]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshTransmissionMaterial
          color="#6366f1"
          transmission={0.9}
          thickness={0.8}
          roughness={0}
          chromaticAberration={0.3}
        />
      </mesh>
    </Float>
  );
});
GlassOrb.displayName = 'GlassOrb';

// Floating Shapes
const FloatingShapes = memo(() => {
  const shapes = useMemo(() => [
    { position: [-3, 2, -3] as [number, number, number], scale: 0.4, color: '#8b5cf6' },
    { position: [3, -1, -4] as [number, number, number], scale: 0.3, color: '#06b6d4' },
    { position: [-2, -2, -2] as [number, number, number], scale: 0.25, color: '#a78bfa' },
    { position: [2, 2, -5] as [number, number, number], scale: 0.35, color: '#22d3ee' },
  ], []);

  return (
    <>
      {shapes.map((shape, i) => (
        <Float key={i} speed={2 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.6}>
          <mesh position={shape.position} scale={shape.scale}>
            <octahedronGeometry args={[1, 0]} />
            <MeshDistortMaterial
              color={shape.color}
              distort={0.3}
              speed={2}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
});
FloatingShapes.displayName = 'FloatingShapes';

// Particle Field
const ParticleField = memo(({ count = 200 }: ParticleFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#a78bfa"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
});
ParticleField.displayName = 'ParticleField';

// Scene
const Scene = memo(() => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 2]} intensity={1} color="#6366f1" />
      <pointLight position={[-3, 2, 0]} intensity={0.5} color="#06b6d4" />
      
      <GlassOrb />
      <FloatingShapes />
      <ParticleField />
      
      <Sparkles
        count={50}
        scale={12}
        size={1.5}
        speed={0.2}
        color="#c4b5fd"
      />
      
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={0.8}
        />
        <Vignette offset={0.35} darkness={0.6} />
      </EffectComposer>
    </>
  );
});
Scene.displayName = 'Scene';

interface AuthBackground3DProps {
  className?: string;
}

export const AuthBackground3D = memo(({ className = '' }: AuthBackground3DProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Overlay gradients for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10 pointer-events-none" />
    </div>
  );
});
AuthBackground3D.displayName = 'AuthBackground3D';
