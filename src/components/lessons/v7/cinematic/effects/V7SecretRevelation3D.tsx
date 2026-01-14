/**
 * V7SecretRevelation3D - Efeito cinematográfico 3D para revelação do "segredo dos 2%"
 * 
 * Usa Three.js/React Three Fiber para criar efeitos sofisticados:
 * - Túnel de luz com partículas convergentes
 * - Nebulosa mística animada
 * - Ondas de energia cinematográficas
 * - Portal dimensional com distorção
 */

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface V7SecretRevelation3DProps {
  enabled: boolean;
  intensity?: number; // 0-1
  currentTime: number;
}

// Spiral galaxy particles
function SpiralGalaxy({ intensity = 1 }: { intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const particleCount = 3000;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Spiral galaxy distribution
      const radius = Math.random() * 4 + 0.5;
      const spinAngle = radius * 3;
      const branchAngle = (i % 3) * ((2 * Math.PI) / 3);
      
      const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
      const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
      
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
      
      // Purple to cyan gradient colors
      const mixFactor = radius / 4.5;
      colors[i3] = 0.5 + mixFactor * 0.3; // R
      colors[i3 + 1] = 0.2 + mixFactor * 0.6; // G  
      colors[i3 + 2] = 0.9 - mixFactor * 0.2; // B
    }
    
    return [positions, colors];
  }, []);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002 * intensity;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });
  
  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8 * intensity}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Energy vortex particles
function EnergyVortex({ intensity = 1 }: { intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const particleCount = 2000;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Vortex tube distribution
      const t = i / particleCount;
      const angle = t * Math.PI * 20;
      const radius = 0.3 + t * 2;
      const height = (t - 0.5) * 6;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, []);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01 * intensity;
      
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * intensity;
      ref.current.scale.setScalar(scale);
    }
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#a855f7"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6 * intensity}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Light rays emanating from center
function LightRays({ intensity = 1 }: { intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const rayCount = 500;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(rayCount * 3);
    
    for (let i = 0; i < rayCount; i++) {
      const i3 = i * 3;
      
      // Random direction from center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.pow(Math.random(), 0.5) * 5;
      
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.3;
      positions[i3 + 2] = r * Math.cos(phi);
    }
    
    return positions;
  }, []);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      ref.current.rotation.y += 0.003 * intensity;
    }
  });
  
  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#22d3ee"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.5 * intensity}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Nebula cloud effect
function NebulaCloud({ intensity = 1 }: { intensity: number }) {
  const ref = useRef<THREE.Points>(null);
  const cloudCount = 1500;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(cloudCount * 3);
    const colors = new Float32Array(cloudCount * 3);
    
    for (let i = 0; i < cloudCount; i++) {
      const i3 = i * 3;
      
      // Gaussian-like cloud distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const radius = Math.sqrt(-2 * Math.log(u1)) * 2;
      const theta = 2 * Math.PI * u2;
      
      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 3;
      positions[i3 + 2] = Math.sin(theta) * radius + (Math.random() - 0.5);
      
      // Multi-color nebula: purple, cyan, magenta
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.66; colors[i3 + 1] = 0.33; colors[i3 + 2] = 0.97; // Purple
      } else if (colorChoice < 0.66) {
        colors[i3] = 0.13; colors[i3 + 1] = 0.83; colors[i3 + 2] = 0.93; // Cyan
      } else {
        colors[i3] = 0.93; colors[i3 + 1] = 0.29; colors[i3 + 2] = 0.6; // Magenta
      }
    }
    
    return [positions, colors];
  }, []);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001 * intensity;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      
      // Breathing effect
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15 * intensity;
      ref.current.scale.setScalar(breathe);
    }
  });
  
  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.12}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4 * intensity}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// Central portal/orb
function CentralOrb({ intensity = 1 }: { intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * intensity;
      meshRef.current.rotation.y += 0.015 * intensity;
      
      // Pulse
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2 * intensity;
      meshRef.current.scale.setScalar(pulse * 0.5);
    }
    
    if (glowRef.current) {
      const glowPulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3 * intensity;
      glowRef.current.scale.setScalar(glowPulse * 1.2);
    }
  });
  
  return (
    <group>
      {/* Inner orb */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.8 * intensity}
          wireframe
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.15 * intensity}
        />
      </mesh>
    </group>
  );
}

// Main 3D Scene
function Scene({ intensity }: { intensity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle camera sway
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });
  
  return (
    <group ref={groupRef}>
      <SpiralGalaxy intensity={intensity} />
      <EnergyVortex intensity={intensity} />
      <LightRays intensity={intensity} />
      <NebulaCloud intensity={intensity} />
      <CentralOrb intensity={intensity} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1 * intensity} color="#a855f7" />
    </group>
  );
}

export const V7SecretRevelation3D: React.FC<V7SecretRevelation3DProps> = ({
  enabled,
  intensity = 1,
  currentTime,
}) => {
  // Calculate dynamic intensity based on time progression
  const dynamicIntensity = useMemo(() => {
    // Ramp up from 52s to 58s, peak from 58s to 65s, slight fade from 65s to 70s
    if (currentTime < 52) return 0;
    if (currentTime < 58) return ((currentTime - 52) / 6) * intensity; // Ramp up
    if (currentTime < 65) return intensity; // Peak
    if (currentTime <= 70) return ((70 - currentTime) / 5) * 0.7 * intensity + 0.3 * intensity; // Slight fade
    return 0;
  }, [currentTime, intensity]);
  
  if (!enabled) return null;
  
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: dynamicIntensity > 0 ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene intensity={dynamicIntensity} />
        </Suspense>
      </Canvas>
      
      {/* Overlay gradients for depth */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        
        {/* Top/bottom gradient fade */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.3) 100%)',
          }}
        />
        
        {/* Subtle color wash */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      
      {/* Cinematic letterbox bars (subtle) */}
      <div className="absolute top-0 left-0 right-0 h-[5%] bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[5%] bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default V7SecretRevelation3D;
