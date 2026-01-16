import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Environment, MeshReflectorMaterial, Float, Trail, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, ChromaticAberration, Noise, HueSaturation } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Camera cinematográfica que orbita automaticamente
function CinematicCamera() {
  const { camera } = useThree();
  const angleRef = useRef(0);
  
  useFrame((state, delta) => {
    angleRef.current += delta * 0.15;
    const radius = 8;
    const height = 3 + Math.sin(state.clock.elapsedTime * 0.3) * 1.5;
    camera.position.x = Math.sin(angleRef.current) * radius;
    camera.position.z = Math.cos(angleRef.current) * radius;
    camera.position.y = height;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Orbe principal com distorção e trail
function HeroOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Trail
      width={4}
      length={8}
      color={new THREE.Color('#ff00ff')}
      attenuation={(t) => t * t}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#ff00ff"
          attach="material"
          distort={0.5}
          speed={3}
          roughness={0}
          metalness={1}
          envMapIntensity={2}
          emissive="#ff00ff"
          emissiveIntensity={0.4}
        />
      </Sphere>
    </Trail>
  );
}

// Orbes orbitando com trails
function OrbitingOrb({ 
  radius, 
  speed, 
  color, 
  size = 0.3,
  offsetY = 0
}: { 
  radius: number; 
  speed: number; 
  color: string; 
  size?: number;
  offsetY?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      meshRef.current.position.x = Math.sin(t) * radius;
      meshRef.current.position.z = Math.cos(t) * radius;
      meshRef.current.position.y = offsetY + Math.sin(t * 2) * 0.3;
    }
  });

  return (
    <Trail
      width={2}
      length={6}
      color={new THREE.Color(color)}
      attenuation={(t) => t * t}
    >
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial
          color={color}
          metalness={1}
          roughness={0}
          envMapIntensity={3}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </Sphere>
    </Trail>
  );
}

// Anéis de energia
function EnergyRing({ radius, color, rotationSpeed }: { radius: number; color: string; rotationSpeed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * rotationSpeed;
      ringRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed * 0.5;
    }
  });
  
  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Partículas flutuantes
function FloatingParticles() {
  const count = 200;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 15
        ],
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      particles.forEach((particle, i) => {
        const matrix = new THREE.Matrix4();
        const y = particle.position[1] + Math.sin(state.clock.elapsedTime * particle.speed + particle.offset) * 0.5;
        matrix.setPosition(particle.position[0], y, particle.position[2]);
        matrix.scale(new THREE.Vector3(0.03, 0.03, 0.03));
        meshRef.current!.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#00ffff"
        emissiveIntensity={2}
      />
    </instancedMesh>
  );
}

// Chão refletivo
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={15}
        depthScale={1}
        minDepthThreshold={0.85}
        color="#050505"
        metalness={0.6}
        roughness={1}
        mirror={0.5}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* HDRI Environment para reflexões realistas */}
      <Environment preset="night" />
      
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Iluminação dramática */}
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 5, 0]} intensity={2} color="#ff00ff" distance={20} />
      <pointLight position={[5, 3, 5]} intensity={1.5} color="#00ffff" distance={15} />
      <pointLight position={[-5, 3, -5]} intensity={1.5} color="#ffff00" distance={15} />
      <spotLight 
        position={[0, 10, 0]} 
        intensity={3} 
        color="#ffffff" 
        angle={0.5} 
        penumbra={1}
        castShadow
      />

      {/* Orbe principal com trail */}
      <HeroOrb />
      
      {/* Orbes orbitando */}
      <OrbitingOrb radius={3} speed={0.8} color="#00ffff" size={0.25} offsetY={0.5} />
      <OrbitingOrb radius={3.5} speed={-0.6} color="#ffff00" size={0.2} offsetY={-0.3} />
      <OrbitingOrb radius={4} speed={0.4} color="#ff6600" size={0.15} offsetY={0.8} />
      
      {/* Anéis de energia */}
      <EnergyRing radius={2} color="#ff00ff" rotationSpeed={0.3} />
      <EnergyRing radius={2.5} color="#00ffff" rotationSpeed={-0.2} />
      <EnergyRing radius={3} color="#ffff00" rotationSpeed={0.15} />
      
      {/* Partículas flutuantes */}
      <FloatingParticles />
      
      {/* Chão refletivo */}
      <ReflectiveFloor />

      {/* Post Processing - Efeitos Cinematográficos */}
      <EffectComposer>
        <Bloom
          intensity={2.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.02}
          bokehScale={3}
          height={480}
        />
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.003, 0.003)}
          radialModulation={true}
          modulationOffset={0.5}
        />
        <Noise opacity={0.02} />
        <HueSaturation saturation={0.15} />
      </EffectComposer>

      {/* Camera cinematográfica automática */}
      <CinematicCamera />
      
      {/* Controles manuais (opcional) */}
      <OrbitControls 
        enableZoom={true} 
        enablePan={false} 
        autoRotate={false}
        maxPolarAngle={Math.PI / 2}
        minDistance={4}
        maxDistance={15}
      />
    </>
  );
}

export function PostProcessingDemo() {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-black">
      <Canvas 
        camera={{ position: [0, 3, 8], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
