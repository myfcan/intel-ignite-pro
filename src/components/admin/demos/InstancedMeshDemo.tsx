import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

const PARTICLE_COUNT = 2000;

function Particles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, []);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      if (ref.current) {
        const matrix = new THREE.Matrix4();
        matrix.setPosition(
          (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
          (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
          (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
        );
        matrix.scale(new THREE.Vector3(s * 0.3, s * 0.3, s * 0.3));
        ref.current.setMatrixAt(i, matrix);
      }
    });
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, PARTICLE_COUNT]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshPhongMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} />
    </instancedMesh>
  );
}

function CrowdSimulation() {
  const count = 500;
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push({
        position: [
          (Math.random() - 0.5) * 30,
          0,
          (Math.random() - 0.5) * 30
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.3,
        speed: 0.5 + Math.random() * 1,
        offset: Math.random() * Math.PI * 2
      });
    }
    return pos;
  }, []);

  return (
    <Instances limit={count}>
      <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
      <meshStandardMaterial color="#00ffff" metalness={0.5} roughness={0.3} />
      {positions.map((props, i) => (
        <CrowdPerson key={i} {...props} />
      ))}
    </Instances>
  );
}

function CrowdPerson({ position, scale, speed, offset }: { 
  position: [number, number, number]; 
  scale: number; 
  speed: number;
  offset: number;
}) {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
      // Simular movimento de caminhada
      ref.current.position.z = position[2] + Math.sin(state.clock.elapsedTime * speed + offset) * 2;
      ref.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * speed * 2 + offset)) * 0.1;
    }
  });

  return (
    <group ref={ref}>
      <Instance 
        position={position} 
        scale={scale}
      />
    </group>
  );
}

function Scene({ mode }: { mode: 'particles' | 'crowd' }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#ff00ff" />
      
      {mode === 'particles' ? <Particles /> : <CrowdSimulation />}
      
      {mode === 'crowd' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
      )}
      
      <OrbitControls enableZoom={true} enablePan={true} />
    </>
  );
}

interface InstancedMeshDemoProps {
  mode?: 'particles' | 'crowd';
}

export function InstancedMeshDemo({ mode = 'particles' }: InstancedMeshDemoProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-black/50">
      <Canvas camera={{ position: mode === 'particles' ? [0, 0, 40] : [15, 10, 15], fov: 60 }}>
        <Scene mode={mode} />
      </Canvas>
    </div>
  );
}
