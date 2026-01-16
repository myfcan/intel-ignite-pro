import React, { useRef, useMemo } from 'react';
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

const PARTICLE_COUNT = 2000;

// Camera cinematográfica
function CinematicCamera({ mode }: { mode: 'particles' | 'crowd' }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.1;
    const radius = mode === 'particles' ? 25 : 20;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = mode === 'particles' ? 12 : 10;
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Sistema de partículas DNA helix estilizado
function DNAHelix() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const meshRef2 = useRef<THREE.InstancedMesh>(null);
  const count = 200;
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      t: (i / count) * Math.PI * 8,
      offset: Math.random() * 0.2
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !meshRef2.current) return;
    
    particles.forEach((p, i) => {
      const t = p.t + state.clock.elapsedTime * 0.5;
      const radius = 3;
      
      // Strand 1
      const x1 = Math.cos(t) * radius;
      const y1 = (i / count) * 20 - 10;
      const z1 = Math.sin(t) * radius;
      
      // Strand 2
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;
      
      const matrix1 = new THREE.Matrix4();
      matrix1.setPosition(x1, y1, z1);
      matrix1.scale(new THREE.Vector3(0.2, 0.2, 0.2));
      meshRef.current!.setMatrixAt(i, matrix1);
      
      const matrix2 = new THREE.Matrix4();
      matrix2.setPosition(x2, y1, z2);
      matrix2.scale(new THREE.Vector3(0.2, 0.2, 0.2));
      meshRef2.current!.setMatrixAt(i, matrix2);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef2.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.5}
          roughness={0}
          metalness={1}
          clearcoat={1}
        />
      </instancedMesh>
      <instancedMesh ref={meshRef2} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshPhysicalMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          roughness={0}
          metalness={1}
          clearcoat={1}
        />
      </instancedMesh>
    </>
  );
}

// Linhas conectando os nodos
function DNAConnectors() {
  const count = 40;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 8 + state.clock.elapsedTime * 0.5;
      const y = (i / count) * 20 - 10;
      
      const matrix = new THREE.Matrix4();
      matrix.makeRotationY(t);
      matrix.setPosition(0, y, 0);
      matrix.scale(new THREE.Vector3(3, 0.03, 0.03));
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
        emissiveIntensity={0.3}
        transparent
        opacity={0.4}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Galáxia de partículas
function GalaxyParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 20;
      const spiralOffset = radius * 0.3;
      return {
        angle,
        radius,
        height: (Math.random() - 0.5) * 3 * (1 - radius / 22),
        speed: 0.1 + Math.random() * 0.2,
        spiralOffset,
        size: 0.02 + Math.random() * 0.05,
        color: new THREE.Color().setHSL(
          0.7 + Math.random() * 0.3,
          0.8,
          0.5 + Math.random() * 0.3
        )
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    particles.forEach((p, i) => {
      const t = state.clock.elapsedTime * p.speed;
      const angle = p.angle + t + p.spiralOffset;
      
      const x = Math.cos(angle) * p.radius;
      const z = Math.sin(angle) * p.radius;
      const y = p.height;
      
      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, y, z);
      matrix.scale(new THREE.Vector3(p.size, p.size, p.size));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshPhysicalMaterial
        color="#ffffff"
        emissive="#88aaff"
        emissiveIntensity={1}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Centro da galáxia brilhante
function GalaxyCore() {
  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.5}
          chromaticAberration={0.3}
          distortion={0.3}
          distortionScale={0.3}
          temporalDistortion={0.05}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ff88ff"
          color="#ffffff"
          roughness={0}
          ior={1.3}
        />
      </mesh>
    </Float>
  );
}

// Torres abstratas estilizadas para "crowd" mode
function AbstractTowers() {
  const count = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const towers = useMemo(() => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 12;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 1 + Math.random() * 8,
        width: 0.3 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        color: new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 0.7, 0.3)
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    towers.forEach((tower, i) => {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + tower.phase) * 0.1;
      
      const matrix = new THREE.Matrix4();
      matrix.setPosition(tower.x, tower.height * pulse / 2, tower.z);
      matrix.scale(new THREE.Vector3(tower.width, tower.height * pulse, tower.width));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color="#1a1a3a"
        emissive="#4400ff"
        emissiveIntensity={0.3}
        roughness={0.2}
        metalness={0.9}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}

// Luzes flutuantes na cidade
function FloatingLights() {
  const count = 100;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const lights = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 30,
      y: 2 + Math.random() * 6,
      z: (Math.random() - 0.5) * 30,
      speed: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    lights.forEach((light, i) => {
      const y = light.y + Math.sin(state.clock.elapsedTime * light.speed + light.phase) * 1;
      
      const matrix = new THREE.Matrix4();
      matrix.setPosition(light.x, y, light.z);
      matrix.scale(new THREE.Vector3(0.15, 0.15, 0.15));
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
        emissiveIntensity={2}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Grid de energia no chão
function EnergyGrid() {
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 31 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, (i - 15) * 2, 0]}>
          <planeGeometry args={[60, 0.03]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {Array.from({ length: 31 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[(i - 15) * 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[60, 0.03]} />
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Chão refletivo
function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={30}
        depthScale={1}
        minDepthThreshold={0.85}
        color="#0a0a15"
        metalness={0.8}
        roughness={1}
        mirror={0.5}
      />
    </mesh>
  );
}

function Scene({ mode }: { mode: 'particles' | 'crowd' }) {
  return (
    <>
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a15', 10, 50]} />
      
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={3} color="#ff00ff" distance={30} />
      <pointLight position={[10, 5, 10]} intensity={2} color="#00ffff" distance={25} />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#ffff00" distance={25} />
      
      {mode === 'particles' ? (
        <>
          <GalaxyParticles />
          <GalaxyCore />
          <Sparkles count={500} scale={40} size={2} speed={0.2} color="#ffffff" opacity={0.3} />
        </>
      ) : (
        <>
          <DNAHelix />
          <DNAConnectors />
          <AbstractTowers />
          <FloatingLights />
          <EnergyGrid />
          <ReflectiveGround />
        </>
      )}
      
      <EffectComposer>
        <Bloom
          intensity={mode === 'particles' ? 1.5 : 1.2}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
        <Vignette offset={0.3} darkness={0.6} />
        <Noise opacity={0.015} />
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
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a15]">
      <Canvas 
        camera={{ 
          position: mode === 'particles' ? [0, 12, 25] : [15, 10, 15], 
          fov: 50 
        }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a15']} />
        <Scene mode={mode} />
      </Canvas>
    </div>
  );
}
