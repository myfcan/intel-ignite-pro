import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  MeshReflectorMaterial, 
  Float,
  Sparkles,
  MeshTransmissionMaterial
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  useECSSystems,
  useECSWorld,
  useBatchEntities,
  useFilteredInstancedECS,
  useCinematicCamera,
  createHelixBatch,
  createGalaxyBatch,
  createFloatingLightsBatch,
  createTowerBatch,
  queries
} from '@/lib/ecs';

// ============================================
// ECS-POWERED INSTANCED MESH DEMO
// Professional Quality with Entity Component System
// ============================================

const PARTICLE_COUNT = 2500;
const HELIX_PARTICLES = 200;
const TOWER_COUNT = 60;
const LIGHT_COUNT = 120;

// DNA Helix System - ECS Driven
function DNAHelixSystem() {
  const strand1Ref = useRef<THREE.InstancedMesh>(null);
  const strand2Ref = useRef<THREE.InstancedMesh>(null);
  
  // Create helix entities
  useBatchEntities(() => createHelixBatch(2, HELIX_PARTICLES), []);
  
  // Manual update for helix strands
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();
    
    // Update strand 1
    if (strand1Ref.current) {
      for (let i = 0; i < HELIX_PARTICLES; i++) {
        const t = (i / HELIX_PARTICLES) * Math.PI * 8 + time * 0.5;
        const radius = 3;
        
        matrix.setPosition(
          Math.cos(t) * radius,
          (i / HELIX_PARTICLES) * 20 - 10,
          Math.sin(t) * radius
        );
        matrix.scale(new THREE.Vector3(0.2, 0.2, 0.2));
        strand1Ref.current.setMatrixAt(i, matrix);
      }
      strand1Ref.current.instanceMatrix.needsUpdate = true;
    }
    
    // Update strand 2
    if (strand2Ref.current) {
      for (let i = 0; i < HELIX_PARTICLES; i++) {
        const t = (i / HELIX_PARTICLES) * Math.PI * 8 + time * 0.5 + Math.PI;
        const radius = 3;
        
        matrix.setPosition(
          Math.cos(t) * radius,
          (i / HELIX_PARTICLES) * 20 - 10,
          Math.sin(t) * radius
        );
        matrix.scale(new THREE.Vector3(0.2, 0.2, 0.2));
        strand2Ref.current.setMatrixAt(i, matrix);
      }
      strand2Ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh ref={strand1Ref} args={[undefined, undefined, HELIX_PARTICLES]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.6}
          roughness={0}
          metalness={1}
          clearcoat={1}
        />
      </instancedMesh>
      <instancedMesh ref={strand2Ref} args={[undefined, undefined, HELIX_PARTICLES]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.6}
          roughness={0}
          metalness={1}
          clearcoat={1}
        />
      </instancedMesh>
    </>
  );
}

// DNA Connectors
function DNAConnectors() {
  const count = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 8 + state.clock.elapsedTime * 0.5;
      const y = (i / count) * 20 - 10;
      
      quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), t);
      matrix.compose(
        new THREE.Vector3(0, y, 0),
        quaternion,
        new THREE.Vector3(3, 0.03, 0.03)
      );
      meshRef.current.setMatrixAt(i, matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[2, 1, 1]} />
      <meshPhysicalMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.4}
        transparent
        opacity={0.5}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Galaxy Particles - ECS Driven
function GalaxyParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => {
      const arm = Math.floor(Math.random() * 4);
      const distance = 2 + Math.random() * 18;
      const armAngle = (arm / 4) * Math.PI * 2;
      const spiralAngle = armAngle + distance * 0.4;
      const spread = 1 + Math.random() * (distance * 0.15);
      
      return {
        arm,
        distance,
        baseAngle: spiralAngle,
        spreadX: (Math.random() - 0.5) * spread,
        spreadZ: (Math.random() - 0.5) * spread,
        height: (Math.random() - 0.5) * (1 - distance / 20) * 3,
        speed: 0.08 + Math.random() * 0.12,
        size: 0.02 + Math.random() * 0.04,
        hue: 0.6 + Math.random() * 0.25
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    const time = state.clock.elapsedTime;
    
    particles.forEach((p, i) => {
      const angle = p.baseAngle + time * p.speed;
      
      matrix.setPosition(
        Math.cos(angle) * p.distance + p.spreadX,
        p.height + Math.sin(time * 0.5 + p.distance) * 0.3,
        Math.sin(angle) * p.distance + p.spreadZ
      );
      matrix.scale(new THREE.Vector3(p.size, p.size, p.size));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshPhysicalMaterial
        color="#aaccff"
        emissive="#6688ff"
        emissiveIntensity={1.2}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Galaxy Core
function GalaxyCore() {
  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh>
        <sphereGeometry args={[1.8, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={12}
          thickness={0.6}
          chromaticAberration={0.4}
          distortion={0.4}
          distortionScale={0.4}
          temporalDistortion={0.08}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          clearcoat={1}
          attenuationDistance={0.6}
          attenuationColor="#ff88ff"
          color="#ffffff"
          roughness={0}
          ior={1.4}
        />
      </mesh>
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </Float>
  );
}

// Abstract Towers - ECS Driven
function AbstractTowers() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const towers = useMemo(() => {
    return Array.from({ length: TOWER_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 12;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 1 + Math.random() * 10,
        width: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 1.5 + Math.random() * 1.5
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    
    towers.forEach((tower, i) => {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * tower.pulseSpeed + tower.phase) * 0.15;
      const h = tower.height * pulse;
      
      matrix.setPosition(tower.x, h / 2, tower.z);
      matrix.scale(new THREE.Vector3(tower.width, h, tower.width));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TOWER_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color="#1a1a3e"
        emissive="#5500ff"
        emissiveIntensity={0.4}
        roughness={0.15}
        metalness={0.95}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}

// Floating Lights
function FloatingLights() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const lights = useMemo(() => {
    return Array.from({ length: LIGHT_COUNT }, () => ({
      x: (Math.random() - 0.5) * 35,
      y: 2 + Math.random() * 8,
      z: (Math.random() - 0.5) * 35,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      size: 0.08 + Math.random() * 0.12
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    
    lights.forEach((light, i) => {
      const y = light.y + Math.sin(state.clock.elapsedTime * light.speed + light.phase) * 1.2;
      
      matrix.setPosition(light.x, y, light.z);
      matrix.scale(new THREE.Vector3(light.size, light.size, light.size));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, LIGHT_COUNT]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshPhysicalMaterial
        color="#ffffff"
        emissive="#00ffff"
        emissiveIntensity={2.5}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Energy Grid
function EnergyGrid() {
  return (
    <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, (i - 17) * 2, 0]}>
          <planeGeometry args={[70, 0.025]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[(i - 17) * 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[70, 0.025]} />
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Reflective Ground
function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[120, 120]} />
      <MeshReflectorMaterial
        blur={[500, 150]}
        resolution={1024}
        mixBlur={1}
        mixStrength={35}
        depthScale={1.2}
        minDepthThreshold={0.85}
        color="#0a0a18"
        metalness={0.85}
        roughness={1}
        mirror={0.6}
      />
    </mesh>
  );
}

// Cinematic Camera
function CinematicCamera({ mode }: { mode: 'particles' | 'crowd' }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.08;
    const radius = mode === 'particles' ? 28 : 22;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = mode === 'particles' ? 14 : 12;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

function Scene({ mode }: { mode: 'particles' | 'crowd' }) {
  useECSWorld();
  useECSSystems();

  return (
    <>
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a18', 12, 60]} />
      
      <ambientLight intensity={0.04} />
      <pointLight position={[0, 12, 0]} intensity={4} color="#ff00ff" distance={35} decay={2} />
      <pointLight position={[12, 6, 12]} intensity={3} color="#00ffff" distance={30} decay={2} />
      <pointLight position={[-12, 6, -12]} intensity={3} color="#ffff00" distance={30} decay={2} />
      
      {mode === 'particles' ? (
        <>
          <GalaxyParticles />
          <GalaxyCore />
          <Sparkles count={600} scale={45} size={2.5} speed={0.25} color="#ffffff" opacity={0.4} />
        </>
      ) : (
        <>
          <DNAHelixSystem />
          <DNAConnectors />
          <AbstractTowers />
          <FloatingLights />
          <EnergyGrid />
          <ReflectiveGround />
        </>
      )}
      
      <EffectComposer>
        <Bloom
          intensity={mode === 'particles' ? 1.8 : 1.4}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.95}
          mipmapBlur
          radius={0.85}
        />
        <Vignette offset={0.35} darkness={0.65} />
        <Noise opacity={0.018} />
      </EffectComposer>
      
      <CinematicCamera mode={mode} />
    </>
  );
}

interface InstancedMeshDemoProps {
  mode?: 'particles' | 'crowd';
}

export function InstancedMeshDemo({ mode = 'particles' }: InstancedMeshDemoProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a18]">
      <Canvas 
        camera={{ 
          position: mode === 'particles' ? [0, 14, 28] : [18, 12, 18], 
          fov: 50 
        }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#0a0a18']} />
        <Scene mode={mode} />
      </Canvas>
    </div>
  );
}
