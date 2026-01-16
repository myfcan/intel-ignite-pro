// ============================================
// ECS 3D BACKGROUND - Immersive Background Component
// ============================================

import { Suspense, useMemo, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// Props interfaces
interface CoreCrystalProps {
  color?: string;
  position?: [number, number, number];
}

interface OrbitalRingProps {
  radius?: number;
  color?: string;
  speed?: number;
}

interface FloatingParticlesProps {
  count?: number;
  spread?: number;
  color?: string;
}

interface HelixParticlesProps {
  particleCount?: number;
  radius?: number;
  height?: number;
}

// Core Crystal Component
const CoreCrystal = memo(({ color = '#8b5cf6', position = [0, 0, 0] }: CoreCrystalProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
});
CoreCrystal.displayName = 'CoreCrystal';

// Orbital Ring Component
const OrbitalRing = memo(({ radius = 2, color = '#a78bfa', speed = 1 }: OrbitalRingProps) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * speed * 0.2;
      ringRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
});
OrbitalRing.displayName = 'OrbitalRing';

// Floating Particles System
const FloatingParticles = memo(({ count = 50, spread = 5, color = '#c4b5fd' }: FloatingParticlesProps) => {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
      scales[i] = Math.random() * 0.5 + 0.5;
    }
    
    return { positions, scales };
  }, [count, spread]);

  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
});
FloatingParticles.displayName = 'FloatingParticles';

// Helix DNA-style Particles
const HelixParticles = memo(({ particleCount = 30, radius = 1.5, height = 3 }: HelixParticlesProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const t = i / particleCount;
      const angle = t * Math.PI * 4;
      const y = (t - 0.5) * height;
      return {
        strand1: { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius },
        strand2: { x: Math.cos(angle + Math.PI) * radius, y, z: Math.sin(angle + Math.PI) * radius }
      };
    });
  }, [particleCount, radius, height]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {particles.map((p, i) => (
        <group key={i}>
          <mesh position={[p.strand1.x, p.strand1.y, p.strand1.z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.9} />
          </mesh>
          <mesh position={[p.strand2.x, p.strand2.y, p.strand2.z]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#06b6d4" transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
});
HelixParticles.displayName = 'HelixParticles';

// Scene variants
type SceneVariant = 'hero' | 'auth' | 'dashboard' | 'minimal';

interface SceneProps {
  variant: SceneVariant;
}

const Scene = memo(({ variant }: SceneProps) => {
  const config = useMemo(() => {
    switch (variant) {
      case 'hero':
        return {
          showCrystal: true,
          showRings: true,
          showHelix: true,
          showParticles: true,
          showStars: true,
          crystalColor: '#8b5cf6',
          particleCount: 100,
          bloomIntensity: 0.8,
        };
      case 'auth':
        return {
          showCrystal: true,
          showRings: true,
          showHelix: false,
          showParticles: true,
          showStars: true,
          crystalColor: '#6366f1',
          particleCount: 60,
          bloomIntensity: 0.6,
        };
      case 'dashboard':
        return {
          showCrystal: false,
          showRings: false,
          showHelix: false,
          showParticles: true,
          showStars: true,
          crystalColor: '#8b5cf6',
          particleCount: 40,
          bloomIntensity: 0.4,
        };
      case 'minimal':
      default:
        return {
          showCrystal: false,
          showRings: false,
          showHelix: false,
          showParticles: true,
          showStars: false,
          crystalColor: '#8b5cf6',
          particleCount: 30,
          bloomIntensity: 0.3,
        };
    }
  }, [variant]);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#8b5cf6" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#06b6d4" />
      
      {config.showCrystal && <CoreCrystal color={config.crystalColor} />}
      
      {config.showRings && (
        <>
          <OrbitalRing radius={1.5} color="#a78bfa" speed={1} />
          <OrbitalRing radius={2.2} color="#06b6d4" speed={-0.7} />
          <OrbitalRing radius={3} color="#8b5cf6" speed={0.5} />
        </>
      )}
      
      {config.showHelix && <HelixParticles />}
      
      {config.showParticles && (
        <FloatingParticles count={config.particleCount} spread={8} />
      )}
      
      {config.showStars && (
        <Stars 
          radius={50} 
          depth={50} 
          count={500} 
          factor={2} 
          saturation={0.5} 
          fade 
          speed={0.5}
        />
      )}
      
      <Environment preset="night" />
      
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={config.bloomIntensity} 
        />
        <Vignette offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
});
Scene.displayName = 'Scene';

interface ECS3DBackgroundProps {
  variant?: SceneVariant;
  className?: string;
  opacity?: number;
}

export const ECS3DBackground = memo(({ 
  variant = 'minimal', 
  className = '',
  opacity = 0.6
}: ECS3DBackgroundProps) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene variant={variant} />
        </Suspense>
      </Canvas>
    </div>
  );
});
ECS3DBackground.displayName = 'ECS3DBackground';
