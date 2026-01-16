import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  MeshTransmissionMaterial, 
  Float, 
  MeshReflectorMaterial,
  Sparkles,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { 
  useECSSystems, 
  useECSWorld,
  useBatchEntities,
  useFilteredInstancedECS,
  useCinematicCamera,
  createCoreCrystal,
  createOrbiterBatch,
  createOrbitalRing,
  queries,
  Entity
} from '@/lib/ecs';

// ============================================
// ECS-POWERED POST PROCESSING DEMO
// Professional Quality with Entity Component System
// ============================================

// Core Crystal Component - Rendered from ECS
function CoreCrystal() {
  const meshRef = useRef<THREE.Mesh>(null);
  const coreEntityRef = useRef<Entity | null>(null);
  
  useEffect(() => {
    coreEntityRef.current = createCoreCrystal({
      position: new THREE.Vector3(0, 0, 0),
      size: 1.5,
      iridescence: 1
    });
    
    return () => {
      // Cleanup handled by world reset
    };
  }, []);
  
  useFrame((state) => {
    if (!meshRef.current || !coreEntityRef.current) return;
    
    const entity = coreEntityRef.current;
    meshRef.current.position.copy(entity.transform.position);
    meshRef.current.scale.copy(entity.transform.scale);
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.5}
          chromaticAberration={0.5}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ff88ff"
          color="#ffffff"
          roughness={0}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}

// Orbital Rings - ECS Driven
function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<Entity[]>([]);
  
  const ringColors = useMemo(() => ['#ff00ff', '#00ffff', '#ffff00'], []);
  
  useEffect(() => {
    ringsRef.current = ringColors.map((color, i) => 
      createOrbitalRing({
        radius: 2.5 + i * 0.5,
        thickness: 0.02,
        color: new THREE.Color(color),
        rotationSpeed: 0.2 + i * 0.1,
        tilt: i * 0.3
      })
    );
  }, []);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {ringColors.map((color, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[2.5 + i * 0.5, 0.02, 16, 100]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
            roughness={0}
            metalness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Orbiting Spheres - ECS Instanced Rendering
function OrbitingSpheres() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const SPHERE_COUNT = 16;
  
  // Create entities on mount
  useBatchEntities(() => createOrbiterBatch(SPHERE_COUNT), []);
  
  // Update instanced mesh from ECS
  useFilteredInstancedECS(meshRef, 'orbiters');

  // Color buffer for individual sphere colors
  const colorArray = useMemo(() => {
    const colors = new Float32Array(SPHERE_COUNT * 3);
    for (let i = 0; i < SPHERE_COUNT; i++) {
      const color = new THREE.Color().setHSL(i / SPHERE_COUNT, 0.8, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    return colors;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, SPHERE_COUNT]}>
      <sphereGeometry args={[1, 32, 32]}>
        <instancedBufferAttribute 
          attach="attributes-color" 
          args={[colorArray, 3]} 
        />
      </sphereGeometry>
      <meshPhysicalMaterial
        vertexColors
        emissive="#ffffff"
        emissiveIntensity={0.5}
        roughness={0}
        metalness={1}
        clearcoat={1}
      />
    </instancedMesh>
  );
}

// Background Particles with Sparkles
function BackgroundParticles() {
  return (
    <Sparkles
      count={250}
      scale={18}
      size={4}
      speed={0.4}
      color="#ffffff"
      opacity={0.6}
    />
  );
}

// Reflective Ground
function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={25}
        depthScale={1}
        minDepthThreshold={0.85}
        color="#0a0a18"
        metalness={0.9}
        roughness={1}
        mirror={0.7}
      />
    </mesh>
  );
}

// Volumetric Light Effect
function VolumetricLight() {
  const coneRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coneRef.current) {
      const material = coneRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.04 + Math.sin(state.clock.elapsedTime * 2) * 0.015;
    }
  });

  return (
    <mesh ref={coneRef} position={[0, 6, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[4, 10, 32, 1, true]} />
      <meshBasicMaterial
        color="#ff00ff"
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Energy Wisps - Animated particle trails
function EnergyWisps() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const WISP_COUNT = 50;
  
  const wisps = useMemo(() => 
    Array.from({ length: WISP_COUNT }, (_, i) => ({
      angle: (i / WISP_COUNT) * Math.PI * 2,
      radius: 4 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.4,
      yOffset: (Math.random() - 0.5) * 4,
      ySpeed: 0.5 + Math.random() * 0.5,
      size: 0.03 + Math.random() * 0.05
    }))
  , []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const matrix = new THREE.Matrix4();
    
    wisps.forEach((wisp, i) => {
      const t = state.clock.elapsedTime * wisp.speed + wisp.angle;
      const y = wisp.yOffset + Math.sin(state.clock.elapsedTime * wisp.ySpeed) * 1.5;
      
      matrix.setPosition(
        Math.cos(t) * wisp.radius,
        y,
        Math.sin(t) * wisp.radius
      );
      matrix.scale(new THREE.Vector3(wisp.size, wisp.size, wisp.size));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, WISP_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

// Main Scene Component
function Scene() {
  // Initialize ECS
  useECSWorld();
  useECSSystems();
  useCinematicCamera({ radius: 10, height: 4, speed: 0.12, lookAtY: 0 });

  return (
    <>
      {/* Environment & Atmosphere */}
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a18', 6, 35]} />
      
      {/* Dramatic Lighting */}
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 6, 0]} intensity={4} color="#ff00ff" distance={25} decay={2} />
      <pointLight position={[6, 3, 6]} intensity={3} color="#00ffff" distance={20} decay={2} />
      <pointLight position={[-6, 3, -6]} intensity={3} color="#ffff00" distance={20} decay={2} />
      <spotLight 
        position={[0, 12, 0]} 
        intensity={2.5} 
        color="#ffffff" 
        angle={0.4} 
        penumbra={1}
        castShadow
      />
      
      {/* ECS-Driven Elements */}
      <CoreCrystal />
      <OrbitalRings />
      <OrbitingSpheres />
      <EnergyWisps />
      
      {/* Atmospheric Elements */}
      <BackgroundParticles />
      <VolumetricLight />
      
      {/* Ground & Shadows */}
      <ReflectiveGround />
      <ContactShadows 
        position={[0, -2.99, 0]} 
        opacity={0.6} 
        scale={25} 
        blur={2.5} 
        far={5} 
      />

      {/* Cinematic Post Processing */}
      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.95}
          mipmapBlur
          radius={0.85}
        />
        <DepthOfField
          focusDistance={0.008}
          focalLength={0.015}
          bokehScale={5}
          height={480}
        />
        <Vignette offset={0.35} darkness={0.65} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
}

export function PostProcessingDemo() {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a18]">
      <Canvas 
        camera={{ position: [0, 4, 10], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        shadows
      >
        <color attach="background" args={['#0a0a18']} />
        <Scene />
      </Canvas>
    </div>
  );
}
