import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, MeshReflectorMaterial, Trail, Float, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

const PARTICLE_COUNT = 3000;

// Camera cinematográfica
function CinematicCamera({ mode }: { mode: 'particles' | 'crowd' }) {
  const { camera } = useThree();
  const angleRef = useRef(0);
  
  useFrame((state, delta) => {
    if (mode === 'particles') {
      angleRef.current += delta * 0.1;
      const radius = 35;
      camera.position.x = Math.sin(angleRef.current) * radius;
      camera.position.z = Math.cos(angleRef.current) * radius;
      camera.position.y = 15 + Math.sin(state.clock.elapsedTime * 0.2) * 5;
      camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
}

// Sistema de partículas avançado com cores variadas
function AdvancedParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const colorRef = useRef<THREE.InstancedBufferAttribute>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 40;
      temp.push({
        angle,
        radius,
        y: (Math.random() - 0.5) * 30,
        speed: 0.1 + Math.random() * 0.3,
        orbitSpeed: (Math.random() - 0.5) * 0.5,
        size: 0.1 + Math.random() * 0.3,
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5)
      });
    }
    return temp;
  }, []);

  // Inicializar cores
  useMemo(() => {
    if (meshRef.current) {
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      particles.forEach((p, i) => {
        colors[i * 3] = p.color.r;
        colors[i * 3 + 1] = p.color.g;
        colors[i * 3 + 2] = p.color.b;
      });
      meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    }
  }, [particles]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime;
      particle.angle += particle.orbitSpeed * 0.01;
      
      const x = Math.cos(particle.angle) * particle.radius;
      const z = Math.sin(particle.angle) * particle.radius;
      const y = particle.y + Math.sin(t * particle.speed + i) * 2;
      
      const matrix = new THREE.Matrix4();
      matrix.setPosition(x, y, z);
      matrix.scale(new THREE.Vector3(particle.size, particle.size, particle.size));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        vertexColors
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={2}
        emissive="#ffffff"
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
}

// Partícula com trail para efeito principal
function TrailParticle({ color, radius, speed, yOffset }: { 
  color: string; 
  radius: number; 
  speed: number; 
  yOffset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * speed;
      meshRef.current.position.x = Math.cos(t) * radius;
      meshRef.current.position.z = Math.sin(t) * radius;
      meshRef.current.position.y = yOffset + Math.sin(t * 2) * 2;
    }
  });
  
  return (
    <Trail
      width={3}
      length={10}
      color={new THREE.Color(color)}
      attenuation={(t) => t * t}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          metalness={1}
          roughness={0}
        />
      </mesh>
    </Trail>
  );
}

// Multidão cyberpunk melhorada
function CyberpunkCrowd() {
  const count = 800;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const phoneRef = useRef<THREE.InstancedMesh>(null);
  
  const people = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 40,
          0,
          (Math.random() - 0.5) * 40
        ] as [number, number, number],
        speed: 0.5 + Math.random() * 1.5,
        direction: Math.random() * Math.PI * 2,
        walkOffset: Math.random() * Math.PI * 2,
        height: 0.8 + Math.random() * 0.4,
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.4)
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !phoneRef.current) return;
    
    const t = state.clock.elapsedTime;
    
    people.forEach((person, i) => {
      // Movimento de caminhada
      const walkY = Math.abs(Math.sin(t * 4 + person.walkOffset)) * 0.08;
      
      // Movimento lento na direção
      const newX = person.position[0] + Math.cos(person.direction) * 0.01 * person.speed;
      const newZ = person.position[2] + Math.sin(person.direction) * 0.01 * person.speed;
      
      // Wrap around
      person.position[0] = ((newX + 20) % 40) - 20;
      person.position[2] = ((newZ + 20) % 40) - 20;
      
      // Matriz para pessoa
      const matrix = new THREE.Matrix4();
      matrix.setPosition(person.position[0], person.height / 2 + walkY, person.position[2]);
      matrix.scale(new THREE.Vector3(0.3, person.height, 0.3));
      meshRef.current!.setMatrixAt(i, matrix);
      
      // Matriz para celular
      const phoneMatrix = new THREE.Matrix4();
      phoneMatrix.setPosition(
        person.position[0] + 0.2, 
        person.height * 0.6 + walkY, 
        person.position[2] + 0.1
      );
      phoneMatrix.scale(new THREE.Vector3(0.08, 0.15, 0.02));
      phoneRef.current!.setMatrixAt(i, phoneMatrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    phoneRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {/* Pessoas */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial
          color="#333344"
          metalness={0.3}
          roughness={0.7}
        />
      </instancedMesh>
      
      {/* Celulares com glow */}
      <instancedMesh ref={phoneRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
        />
      </instancedMesh>
    </>
  );
}

// Hologramas flutuantes
function FloatingHolograms() {
  const count = 20;
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={2}
          position={[
            (Math.random() - 0.5) * 30,
            3 + Math.random() * 5,
            (Math.random() - 0.5) * 30
          ]}
        >
          <mesh>
            <boxGeometry args={[2, 3, 0.02]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Chão da cidade cyberpunk
function CyberpunkFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={50}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050510"
        metalness={0.8}
        roughness={0.8}
        mirror={0.3}
      />
    </mesh>
  );
}

// Grid de luzes neon no chão
function NeonGrid() {
  const gridRef = useRef<THREE.Group>(null);
  
  return (
    <group ref={gridRef} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, (i - 10) * 4, 0]}>
          <planeGeometry args={[80, 0.05]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[(i - 10) * 4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[80, 0.05]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ mode }: { mode: 'particles' | 'crowd' }) {
  return (
    <>
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 20, 0]} intensity={2} color="#ff00ff" distance={50} />
      <pointLight position={[20, 10, 20]} intensity={1.5} color="#00ffff" distance={40} />
      <pointLight position={[-20, 10, -20]} intensity={1.5} color="#ffff00" distance={40} />
      
      {mode === 'particles' ? (
        <>
          <AdvancedParticles />
          {/* Partículas principais com trails */}
          <TrailParticle color="#ff00ff" radius={8} speed={0.5} yOffset={0} />
          <TrailParticle color="#00ffff" radius={12} speed={-0.3} yOffset={3} />
          <TrailParticle color="#ffff00" radius={15} speed={0.4} yOffset={-2} />
          <TrailParticle color="#ff6600" radius={20} speed={-0.2} yOffset={5} />
        </>
      ) : (
        <>
          <CyberpunkCrowd />
          <FloatingHolograms />
          <NeonGrid />
          <CyberpunkFloor />
        </>
      )}
      
      {mode === 'particles' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
          <planeGeometry args={[200, 200]} />
          <MeshReflectorMaterial
            blur={[400, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={30}
            color="#000005"
            metalness={0.9}
            roughness={1}
            mirror={0.4}
          />
        </mesh>
      )}
      
      <EffectComposer>
        <Bloom
          intensity={mode === 'particles' ? 2 : 1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
        <Vignette offset={0.3} darkness={0.6} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.002, 0.002)}
          radialModulation={false}
          modulationOffset={0}
        />
      </EffectComposer>
      
      <CinematicCamera mode={mode} />
      <OrbitControls 
        enableZoom={true} 
        enablePan={true}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={60}
      />
    </>
  );
}

interface InstancedMeshDemoProps {
  mode?: 'particles' | 'crowd';
}

export function InstancedMeshDemo({ mode = 'particles' }: InstancedMeshDemoProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-black">
      <Canvas 
        camera={{ 
          position: mode === 'particles' ? [0, 15, 35] : [20, 12, 20], 
          fov: 60 
        }}
        shadows
        dpr={[1, 2]}
      >
        <Scene mode={mode} />
      </Canvas>
    </div>
  );
}
