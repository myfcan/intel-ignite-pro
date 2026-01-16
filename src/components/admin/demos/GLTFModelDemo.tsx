import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

// Modelo 3D simples - cubo animado representando um "dispositivo"
function AnimatedDevice({ position = [0, 0, 0] as [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} position={position}>
        {/* Monitor/Tela */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1.2, 0.1]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Tela interna (emissiva) */}
        <mesh position={[0, 0.5, 0.06]}>
          <planeGeometry args={[1.8, 1]} />
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#00ffff" 
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Base */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 0.3, 32]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Suporte */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

// Smartphone 3D
function Smartphone({ position = [0, 0, 0] as [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Corpo do celular */}
      <mesh>
        <boxGeometry args={[0.4, 0.8, 0.05]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Tela */}
      <mesh position={[0, 0, 0.026]}>
        <planeGeometry args={[0.35, 0.7]} />
        <meshStandardMaterial 
          color="#0f0f23" 
          emissive="#ff00ff" 
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Câmera */}
      <mesh position={[0.1, 0.35, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
}

// Grupo de pessoas simplificadas
function SimplePerson({ position, color }: { position: [number, number, number]; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Simular caminhada
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(state.clock.elapsedTime * 3)) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Corpo */}
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Cabeça */}
      <mesh position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Celular na mão */}
      <mesh position={[0.2, 0.5, 0.1]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.05, 0.1, 0.01]} />
        <meshStandardMaterial color="#333" emissive="#00ffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function CrowdWithPhones() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
  const positions: [number, number, number][] = [];
  
  for (let x = -3; x <= 3; x += 1.2) {
    for (let z = -2; z <= 2; z += 1.2) {
      positions.push([x + (Math.random() - 0.5) * 0.3, 0, z + (Math.random() - 0.5) * 0.3]);
    }
  }

  return (
    <group>
      {positions.map((pos, i) => (
        <SimplePerson 
          key={i} 
          position={pos} 
          color={colors[i % colors.length]} 
        />
      ))}
      
      {/* Chão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
    </group>
  );
}

function Scene({ mode }: { mode: 'devices' | 'crowd' }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ff00ff" />
      <spotLight position={[0, 10, 0]} intensity={1} color="#00ffff" angle={0.5} />
      
      {mode === 'devices' ? (
        <>
          <AnimatedDevice position={[-2, 0, 0]} />
          <AnimatedDevice position={[2, 0, 0]} />
          <Smartphone position={[0, 0.5, 1]} />
          <Smartphone position={[-1, 0.3, 1.5]} />
          <Smartphone position={[1, 0.4, 1.3]} />
        </>
      ) : (
        <CrowdWithPhones />
      )}
      
      <Environment preset="city" />
      <OrbitControls enableZoom={true} enablePan={true} />
    </>
  );
}

interface GLTFModelDemoProps {
  mode?: 'devices' | 'crowd';
}

export function GLTFModelDemo({ mode = 'devices' }: GLTFModelDemoProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas camera={{ position: mode === 'devices' ? [0, 2, 6] : [5, 4, 8], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
    </div>
  );
}
