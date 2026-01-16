// ============================================
// HERO BACKGROUND 3D - Cinematic Landing Page Background
// ============================================

import { Suspense, useMemo, memo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useBackground3DSafe } from '@/contexts/Background3DContext';

// Props interfaces
interface GalaxyArmsProps {
  particleCount?: number;
  speedMultiplier?: number;
}

interface EnergyRingProps {
  radius: number;
  speed: number;
  tilt: number;
  color: string;
  speedMultiplier?: number;
}

interface SceneProps {
  bloomIntensity: number;
  particleSpeed: number;
  particleCount: number;
}

// Animated Galaxy Core
const GalaxyCore = memo(({ speedMultiplier = 1 }: { speedMultiplier?: number }) => {
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speedMultiplier;
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
    }
  });

  return (
    <Float speed={1 * speedMultiplier} rotationIntensity={0.3} floatIntensity={0.5}>
      <group>
        {/* Inner Core */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.6, 2]} />
          <MeshTransmissionMaterial
            color="#8b5cf6"
            transmission={0.95}
            thickness={0.5}
            roughness={0}
            chromaticAberration={0.5}
            anisotropy={0.5}
          />
        </mesh>
        
        {/* Outer Glow */}
        <mesh ref={glowRef} scale={1.3}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>
    </Float>
  );
});
GalaxyCore.displayName = 'GalaxyCore';

// Spiral Galaxy Arms
const GalaxyArms = memo(({ particleCount = 2000, speedMultiplier = 1 }: GalaxyArmsProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const arms = 3;
    const armSpread = 0.3;
    
    for (let i = 0; i < particleCount; i++) {
      const arm = i % arms;
      const armAngle = (arm / arms) * Math.PI * 2;
      const distance = Math.random() * 4 + 0.5;
      const spiralAngle = distance * 1.5 + armAngle;
      const spread = (Math.random() - 0.5) * armSpread * distance;
      
      positions[i * 3] = Math.cos(spiralAngle) * distance + spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3 * (1 - distance / 5);
      positions[i * 3 + 2] = Math.sin(spiralAngle) * distance + spread;
      
      // Color gradient from purple to cyan
      const t = distance / 5;
      colors[i * 3] = 0.55 * (1 - t) + 0.02 * t;     // R
      colors[i * 3 + 1] = 0.36 * (1 - t) + 0.71 * t; // G
      colors[i * 3 + 2] = 0.96 * (1 - t) + 0.83 * t; // B
    }
    
    return { positions, colors };
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05 * speedMultiplier;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.03} 
        vertexColors 
        transparent 
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});
GalaxyArms.displayName = 'GalaxyArms';

// Energy Ring Component
const EnergyRing = memo(({ radius, speed, tilt, color, speedMultiplier = 1 }: EnergyRingProps) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * speed * 0.3 * speedMultiplier;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2 + tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
});
EnergyRing.displayName = 'EnergyRing';

// Orbital Energy Rings
const EnergyRings = memo(({ speedMultiplier = 1 }: { speedMultiplier?: number }) => {
  const rings = useMemo(() => [
    { radius: 1.2, speed: 1, tilt: 0.3, color: '#8b5cf6' },
    { radius: 1.8, speed: -0.7, tilt: -0.5, color: '#06b6d4' },
    { radius: 2.5, speed: 0.4, tilt: 0.2, color: '#a78bfa' },
  ], []);

  return (
    <>
      {rings.map((ring, i) => (
        <EnergyRing key={i} {...ring} speedMultiplier={speedMultiplier} />
      ))}
    </>
  );
});
EnergyRings.displayName = 'EnergyRings';

// Scene with configurable settings
const Scene = memo(({ bloomIntensity, particleSpeed, particleCount }: SceneProps) => {
  const actualParticleCount = Math.floor(2000 * particleCount);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#8b5cf6" distance={10} />
      <pointLight position={[3, 2, 2]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[-3, -2, -2]} intensity={0.3} color="#a78bfa" />
      
      {/* Main Elements */}
      <GalaxyCore speedMultiplier={particleSpeed} />
      <GalaxyArms particleCount={actualParticleCount} speedMultiplier={particleSpeed} />
      <EnergyRings speedMultiplier={particleSpeed} />
      
      {/* Ambient Sparkles */}
      <Sparkles
        count={Math.floor(100 * particleCount)}
        scale={10}
        size={2}
        speed={0.3 * particleSpeed}
        color="#a78bfa"
      />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Post Processing */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.1} 
          luminanceSmoothing={0.9} 
          intensity={1.2 * bloomIntensity}
        />
        <Vignette offset={0.4} darkness={0.7} />
      </EffectComposer>
    </>
  );
});
Scene.displayName = 'Scene';

interface HeroBackground3DProps {
  className?: string;
}

export const HeroBackground3D = memo(({ 
  className = ''
}: HeroBackground3DProps) => {
  const settings = useBackground3DSafe();
  
  if (!settings.enabled) return null;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity: settings.opacity }}
    >
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
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
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
    </div>
  );
});
HeroBackground3D.displayName = 'HeroBackground3D';
