import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshReflectorMaterial, 
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  useECSSystems,
  useECSWorld
} from '@/lib/ecs';

// ============================================
// ECS-POWERED GLTF MODEL DEMO
// Professional Quality with Entity Component System
// ============================================

// Premium Monitor with holographic screen
function PremiumMonitor({ position, rotation = 0 }: { 
  position: [number, number, number]; 
  rotation?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const screenIntensity = useRef(0.5);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + rotation) * 0.06;
    }
    screenIntensity.current = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
  });

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.12}>
      <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
        {/* Monitor Frame */}
        <RoundedBox args={[4.2, 2.7, 0.18]} radius={0.1} position={[0, 2, 0]}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.97}
            roughness={0.03}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={2.5}
          />
        </RoundedBox>
        
        {/* Screen */}
        <mesh position={[0, 2, 0.1]}>
          <planeGeometry args={[3.8, 2.4]} />
          <meshPhysicalMaterial
            color="#000044"
            emissive="#00ffff"
            emissiveIntensity={screenIntensity.current}
            roughness={0}
            metalness={0.6}
            clearcoat={1}
            transmission={0.15}
          />
        </mesh>
        
        {/* Inner glow border */}
        <mesh position={[0, 2, 0.095]}>
          <ringGeometry args={[1.9, 1.95, 4]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.25}
          />
        </mesh>
        
        {/* Stand */}
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 1.1, 16]} />
          <meshPhysicalMaterial
            color="#2a2a4e"
            metalness={0.97}
            roughness={0.03}
            clearcoat={1}
          />
        </mesh>
        
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.9, 1, 0.12, 32]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.97}
            roughness={0.03}
            clearcoat={1}
          />
        </mesh>
        
        {/* Base light ring */}
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.85, 64]} />
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.85}
          />
        </mesh>
        
        {/* Status LED */}
        <mesh position={[1.85, 0.9, 0.1]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      </group>
    </Float>
  );
}

// Holographic Smartphone
function HolographicSmartphone({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.25;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.12;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.12} floatIntensity={0.35}>
      <group ref={groupRef} position={position}>
        {/* Phone body */}
        <RoundedBox args={[0.85, 1.7, 0.09]} radius={0.09}>
          <meshPhysicalMaterial
            color="#0a0a18"
            metalness={0.92}
            roughness={0.04}
            clearcoat={1}
            clearcoatRoughness={0}
            envMapIntensity={3.5}
          />
        </RoundedBox>
        
        {/* Screen */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[0.75, 1.55]} />
          <meshPhysicalMaterial
            color="#000028"
            emissive="#ff00ff"
            emissiveIntensity={0.45}
            roughness={0}
            clearcoat={1}
          />
        </mesh>
        
        {/* Holographic projection */}
        <mesh position={[0, 1.3, 0.25]} rotation={[-0.25, 0, 0]}>
          <icosahedronGeometry args={[0.35, 3]} />
          <MeshTransmissionMaterial
            backside
            samples={10}
            thickness={0.35}
            chromaticAberration={0.6}
            distortion={0.35}
            distortionScale={0.35}
            temporalDistortion={0.06}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#00ffff"
            color="#ffffff"
            roughness={0}
            ior={1.35}
          />
        </mesh>
        
        {/* Projection beam */}
        <mesh position={[0, 0.8, 0.12]}>
          <coneGeometry args={[0.18, 0.6, 16, 1, true]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Front camera */}
        <mesh position={[0, 0.72, 0.046]}>
          <circleGeometry args={[0.025, 16]} />
          <meshPhysicalMaterial
            color="#000000"
            metalness={1}
            roughness={0}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Abstract Data Structures
function AbstractStructures() {
  const count = 90;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const structures = useMemo(() => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 11;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 0.6 + Math.random() * 6,
        width: 0.2 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    
    structures.forEach((s, i) => {
      const wave = Math.sin(state.clock.elapsedTime * s.speed + s.phase) * 0.6;
      const h = s.height + wave * 0.5;
      
      matrix.setPosition(s.x, h / 2 + wave, s.z);
      matrix.scale(new THREE.Vector3(s.width, h, s.width));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color="#1a1a42"
        emissive="#5500ff"
        emissiveIntensity={0.25}
        roughness={0.08}
        metalness={0.95}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}

// Data Orbs
function DataOrbs() {
  const count = 180;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const orbs = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 28,
      y: 2 + Math.random() * 10,
      z: (Math.random() - 0.5) * 28,
      speed: 0.25 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
      size: 0.06 + Math.random() * 0.12
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    
    orbs.forEach((orb, i) => {
      const y = orb.y + Math.sin(state.clock.elapsedTime * orb.speed + orb.phase) * 1.8;
      
      matrix.setPosition(orb.x, y, orb.z);
      matrix.scale(new THREE.Vector3(orb.size, orb.size, orb.size));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshPhysicalMaterial
        color="#ffffff"
        emissive="#00ffff"
        emissiveIntensity={1.2}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Connection Network Lines
function ConnectionNetwork() {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.04;
    }
  });

  const lines = useMemo(() => {
    return Array.from({ length: 40 }, () => {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      const r1 = 4 + Math.random() * 9;
      const r2 = 4 + Math.random() * 9;
      return {
        start: [Math.cos(angle1) * r1, 1 + Math.random() * 7, Math.sin(angle1) * r1] as [number, number, number],
        end: [Math.cos(angle2) * r2, 1 + Math.random() * 7, Math.sin(angle2) * r2] as [number, number, number]
      };
    });
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => {
        const start = new THREE.Vector3(...line.start);
        const end = new THREE.Vector3(...line.end);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const length = start.distanceTo(end);
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        
        return (
          <mesh 
            key={i} 
            position={mid}
            quaternion={new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              direction
            )}
          >
            <cylinderGeometry args={[0.012, 0.012, length, 4]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.18}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Energy Grid
function EnergyGrid() {
  return (
    <group position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, (i - 12) * 2, 0]}>
          <planeGeometry args={[50, 0.022]} />
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {Array.from({ length: 25 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[(i - 12) * 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[50, 0.022]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.1}
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
        metalness={0.88}
        roughness={1}
        mirror={0.55}
      />
    </mesh>
  );
}

// Cinematic Camera
function CinematicCamera({ mode }: { mode: 'devices' | 'crowd' }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.08;
    const radius = mode === 'devices' ? 14 : 20;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = mode === 'devices' ? 6 : 10;
    camera.lookAt(0, mode === 'devices' ? 1.8 : 2.5, 0);
  });
  
  return null;
}

function Scene({ mode }: { mode: 'devices' | 'crowd' }) {
  useECSWorld();
  useECSSystems();

  return (
    <>
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a18', 10, 50]} />
      
      <ambientLight intensity={0.04} />
      <pointLight position={[0, 12, 0]} intensity={4} color="#ff00ff" distance={30} decay={2} />
      <pointLight position={[10, 6, 10]} intensity={3} color="#00ffff" distance={25} decay={2} />
      <pointLight position={[-10, 6, -10]} intensity={3} color="#ffff00" distance={25} decay={2} />
      <spotLight
        position={[0, 18, 0]}
        intensity={1.5}
        color="#ffffff"
        angle={0.55}
        penumbra={1}
        castShadow
      />
      
      {mode === 'devices' ? (
        <>
          <PremiumMonitor position={[-4, 0, 0]} rotation={0.35} />
          <PremiumMonitor position={[4, 0, 0]} rotation={-0.35} />
          <PremiumMonitor position={[0, 0, -2.5]} rotation={0} />
          <HolographicSmartphone position={[-1.8, 2.2, 2.2]} />
          <HolographicSmartphone position={[1.8, 2, 2.8]} />
          <HolographicSmartphone position={[0, 2.4, 1.8]} />
          <Sparkles count={250} scale={18} size={2.5} speed={0.25} color="#ffffff" opacity={0.35} />
        </>
      ) : (
        <>
          <AbstractStructures />
          <DataOrbs />
          <ConnectionNetwork />
          <Sparkles count={350} scale={30} size={2.5} speed={0.25} color="#ffffff" opacity={0.35} />
        </>
      )}
      
      <EnergyGrid />
      <ReflectiveGround />
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.45} 
        scale={35} 
        blur={2.5} 
        far={5} 
      />
      
      <EffectComposer>
        <Bloom
          intensity={1.7}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.95}
          mipmapBlur
          radius={0.85}
        />
        <DepthOfField
          focusDistance={0.012}
          focalLength={0.025}
          bokehScale={4}
          height={480}
        />
        <Vignette offset={0.35} darkness={0.65} />
        <Noise opacity={0.018} />
      </EffectComposer>
      
      <CinematicCamera mode={mode} />
    </>
  );
}

interface GLTFModelDemoProps {
  mode?: 'devices' | 'crowd';
}

export function GLTFModelDemo({ mode = 'devices' }: GLTFModelDemoProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a18]">
      <Canvas 
        camera={{ position: mode === 'devices' ? [0, 6, 14] : [14, 10, 14], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        shadows
      >
        <color attach="background" args={['#0a0a18']} />
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
    </div>
  );
}
