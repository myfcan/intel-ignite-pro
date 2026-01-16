import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  MeshTransmissionMaterial, 
  Float, 
  Sphere,
  MeshReflectorMaterial,
  useTexture,
  Sparkles,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

// Camera cinematográfica suave
function CinematicCamera() {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.15;
    camera.position.x = Math.sin(t) * 8;
    camera.position.z = Math.cos(t) * 8;
    camera.position.y = 3 + Math.sin(t * 0.5) * 1;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Esfera de cristal principal com transmissão de luz
function CrystalSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
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

// Anéis orbitais elegantes
function OrbitalRings() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, i * 0.5, 0]}>
          <torusGeometry args={[2.5 + i * 0.5, 0.02, 16, 100]} />
          <meshPhysicalMaterial
            color={['#ff00ff', '#00ffff', '#ffff00'][i]}
            emissive={['#ff00ff', '#00ffff', '#ffff00'][i]}
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

// Esferas orbitais flutuantes
function OrbitingSpheres() {
  const groupRef = useRef<THREE.Group>(null);
  
  const spheres = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 3 + Math.random() * 0.5,
      speed: 0.3 + Math.random() * 0.2,
      size: 0.1 + Math.random() * 0.15,
      yOffset: (Math.random() - 0.5) * 2,
      color: new THREE.Color().setHSL(i / 12, 0.8, 0.5)
    }))
  , []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const sphere = spheres[i];
        const t = state.clock.elapsedTime * sphere.speed + sphere.angle;
        child.position.x = Math.cos(t) * sphere.radius;
        child.position.z = Math.sin(t) * sphere.radius;
        child.position.y = sphere.yOffset + Math.sin(t * 2) * 0.3;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {spheres.map((sphere, i) => (
        <mesh key={i}>
          <sphereGeometry args={[sphere.size, 32, 32]} />
          <meshPhysicalMaterial
            color={sphere.color}
            emissive={sphere.color}
            emissiveIntensity={1}
            roughness={0}
            metalness={1}
            clearcoat={1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Partículas brilhantes de fundo
function BackgroundParticles() {
  return (
    <Sparkles
      count={200}
      scale={15}
      size={3}
      speed={0.3}
      color="#ffffff"
      opacity={0.5}
    />
  );
}

// Chão com reflexo suave
function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={20}
        depthScale={1}
        minDepthThreshold={0.85}
        color="#0a0a15"
        metalness={0.8}
        roughness={1}
        mirror={0.6}
      />
    </mesh>
  );
}

// Luz volumétrica simulada
function VolumetricLight() {
  const coneRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (coneRef.current) {
      const material = coneRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.03 + Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  return (
    <mesh ref={coneRef} position={[0, 5, 0]} rotation={[Math.PI, 0, 0]}>
      <coneGeometry args={[3, 8, 32, 1, true]} />
      <meshBasicMaterial
        color="#ff00ff"
        transparent
        opacity={0.03}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* HDRI de alta qualidade */}
      <Environment preset="night" />
      
      {/* Fog para atmosfera */}
      <fog attach="fog" args={['#0a0a15', 5, 30]} />
      
      {/* Iluminação dramática */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 0]} intensity={3} color="#ff00ff" distance={20} />
      <pointLight position={[5, 2, 5]} intensity={2} color="#00ffff" distance={15} />
      <pointLight position={[-5, 2, -5]} intensity={2} color="#ffff00" distance={15} />
      <spotLight 
        position={[0, 10, 0]} 
        intensity={2} 
        color="#ffffff" 
        angle={0.3} 
        penumbra={1}
      />
      
      {/* Elementos principais */}
      <CrystalSphere />
      <OrbitalRings />
      <OrbitingSpheres />
      <BackgroundParticles />
      <VolumetricLight />
      
      {/* Chão e sombras */}
      <ReflectiveGround />
      <ContactShadows 
        position={[0, -2.99, 0]} 
        opacity={0.5} 
        scale={20} 
        blur={2} 
        far={4} 
      />

      {/* Post Processing cinematográfico */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
        <DepthOfField
          focusDistance={0.005}
          focalLength={0.01}
          bokehScale={4}
          height={480}
        />
        <Vignette offset={0.3} darkness={0.6} />
        <Noise opacity={0.015} />
      </EffectComposer>

      {/* Camera cinematográfica */}
      <CinematicCamera />
    </>
  );
}

export function PostProcessingDemo() {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a15]">
      <Canvas 
        camera={{ position: [0, 3, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a15']} />
        <Scene />
      </Canvas>
    </div>
  );
}
