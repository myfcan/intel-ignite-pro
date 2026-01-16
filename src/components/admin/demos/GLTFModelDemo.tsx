import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  Float, 
  MeshReflectorMaterial, 
  MeshTransmissionMaterial,
  RoundedBox,
  Sparkles,
  Text,
  ContactShadows
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';

// Camera cinematográfica
function CinematicCamera({ mode }: { mode: 'devices' | 'crowd' }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.1;
    const radius = mode === 'devices' ? 12 : 18;
    camera.position.x = Math.sin(t) * radius;
    camera.position.z = Math.cos(t) * radius;
    camera.position.y = mode === 'devices' ? 5 : 8;
    camera.lookAt(0, mode === 'devices' ? 1.5 : 2, 0);
  });
  
  return null;
}

// Monitor futurista premium com tela de vidro
function PremiumMonitor({ position, rotation = 0 }: { 
  position: [number, number, number]; 
  rotation?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const screenGlow = useRef(0);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + rotation) * 0.05;
    }
    screenGlow.current = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
  });

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
        {/* Frame do monitor - metal escuro premium */}
        <RoundedBox args={[4, 2.5, 0.15]} radius={0.08} position={[0, 2, 0]}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            envMapIntensity={2}
          />
        </RoundedBox>
        
        {/* Tela - material de transmissão para efeito de vidro */}
        <mesh position={[0, 2, 0.08]}>
          <planeGeometry args={[3.6, 2.2]} />
          <meshPhysicalMaterial
            color="#000033"
            emissive="#00ffff"
            emissiveIntensity={screenGlow.current}
            roughness={0}
            metalness={0.5}
            clearcoat={1}
            transmission={0.1}
          />
        </mesh>
        
        {/* Borda interna luminosa */}
        <mesh position={[0, 2, 0.075]}>
          <ringGeometry args={[1.8, 1.85, 4]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Suporte vertical elegante */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1, 16]} />
          <meshPhysicalMaterial
            color="#2a2a4e"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>
        
        {/* Base circular com anel de luz */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.9, 0.1, 32]} />
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
          />
        </mesh>
        
        {/* Anel de luz na base */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.75, 64]} />
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* LED indicador */}
        <mesh position={[1.7, 0.85, 0.08]}>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color="#00ff88" />
        </mesh>
      </group>
    </Float>
  );
}

// Smartphone holográfico premium
function HolographicSmartphone({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.7) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={position}>
        {/* Corpo do telefone - vidro escuro */}
        <RoundedBox args={[0.8, 1.6, 0.08]} radius={0.08}>
          <meshPhysicalMaterial
            color="#0a0a15"
            metalness={0.9}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0}
            envMapIntensity={3}
          />
        </RoundedBox>
        
        {/* Tela com gradiente emissivo */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.7, 1.45]} />
          <meshPhysicalMaterial
            color="#000022"
            emissive="#ff00ff"
            emissiveIntensity={0.4}
            roughness={0}
            clearcoat={1}
          />
        </mesh>
        
        {/* Projeção holográfica acima do telefone */}
        <mesh position={[0, 1.2, 0.2]} rotation={[-0.3, 0, 0]}>
          <icosahedronGeometry args={[0.3, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={8}
            thickness={0.3}
            chromaticAberration={0.5}
            distortion={0.3}
            distortionScale={0.3}
            temporalDistortion={0.05}
            iridescence={1}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1400]}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#00ffff"
            color="#ffffff"
            roughness={0}
            ior={1.3}
          />
        </mesh>
        
        {/* Raio de projeção */}
        <mesh position={[0, 0.75, 0.1]}>
          <coneGeometry args={[0.15, 0.5, 16, 1, true]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Camera frontal */}
        <mesh position={[0, 0.65, 0.041]}>
          <circleGeometry args={[0.02, 16]} />
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

// Estrutura abstrata flutuante (substitui a "multidão")
function AbstractStructures() {
  const count = 80;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const structures = useMemo(() => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 10;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 0.5 + Math.random() * 5,
        width: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5
      };
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    structures.forEach((s, i) => {
      const wave = Math.sin(state.clock.elapsedTime * s.speed + s.phase) * 0.5;
      
      const matrix = new THREE.Matrix4();
      matrix.setPosition(s.x, s.height / 2 + wave, s.z);
      matrix.scale(new THREE.Vector3(s.width, s.height + wave * 0.5, s.width));
      meshRef.current!.setMatrixAt(i, matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        color="#1a1a3e"
        emissive="#4400ff"
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.9}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
}

// Esferas de dados flutuantes
function DataSpheres() {
  const count = 150;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const spheres = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 25,
      y: 2 + Math.random() * 8,
      z: (Math.random() - 0.5) * 25,
      speed: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
      size: 0.08 + Math.random() * 0.15,
      color: new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 0.8, 0.6)
    }));
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    spheres.forEach((sphere, i) => {
      const y = sphere.y + Math.sin(state.clock.elapsedTime * sphere.speed + sphere.phase) * 1.5;
      
      const matrix = new THREE.Matrix4();
      matrix.setPosition(sphere.x, y, sphere.z);
      matrix.scale(new THREE.Vector3(sphere.size, sphere.size, sphere.size));
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
        emissiveIntensity={1}
        roughness={0}
        metalness={1}
      />
    </instancedMesh>
  );
}

// Linhas de conexão animadas
function ConnectionLines() {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const lines = useMemo(() => {
    return Array.from({ length: 30 }, () => {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      const r1 = 4 + Math.random() * 8;
      const r2 = 4 + Math.random() * 8;
      return {
        start: [Math.cos(angle1) * r1, 1 + Math.random() * 6, Math.sin(angle1) * r1],
        end: [Math.cos(angle2) * r2, 1 + Math.random() * 6, Math.sin(angle2) * r2]
      };
    });
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((line, i) => {
        const start = new THREE.Vector3(...line.start as [number, number, number]);
        const end = new THREE.Vector3(...line.end as [number, number, number]);
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
            <cylinderGeometry args={[0.01, 0.01, length, 4]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.15}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Grid de energia
function EnergyGrid() {
  return (
    <group position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`h-${i}`} position={[0, (i - 10) * 2, 0]}>
          <planeGeometry args={[40, 0.02]} />
          <meshBasicMaterial
            color="#ff00ff"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      {Array.from({ length: 21 }).map((_, i) => (
        <mesh key={`v-${i}`} position={[(i - 10) * 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[40, 0.02]} />
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

function Scene({ mode }: { mode: 'devices' | 'crowd' }) {
  return (
    <>
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a15', 8, 40]} />
      
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={3} color="#ff00ff" distance={25} />
      <pointLight position={[8, 5, 8]} intensity={2} color="#00ffff" distance={20} />
      <pointLight position={[-8, 5, -8]} intensity={2} color="#ffff00" distance={20} />
      <spotLight
        position={[0, 15, 0]}
        intensity={1}
        color="#ffffff"
        angle={0.5}
        penumbra={1}
      />
      
      {mode === 'devices' ? (
        <>
          <PremiumMonitor position={[-3.5, 0, 0]} rotation={0.3} />
          <PremiumMonitor position={[3.5, 0, 0]} rotation={-0.3} />
          <PremiumMonitor position={[0, 0, -2]} rotation={0} />
          <HolographicSmartphone position={[-1.5, 2, 2]} />
          <HolographicSmartphone position={[1.5, 1.8, 2.5]} />
          <HolographicSmartphone position={[0, 2.2, 1.5]} />
          <Sparkles count={200} scale={15} size={2} speed={0.2} color="#ffffff" opacity={0.3} />
        </>
      ) : (
        <>
          <AbstractStructures />
          <DataSpheres />
          <ConnectionLines />
          <Sparkles count={300} scale={25} size={2} speed={0.2} color="#ffffff" opacity={0.3} />
        </>
      )}
      
      <EnergyGrid />
      <ReflectiveGround />
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.4} 
        scale={30} 
        blur={2} 
        far={4} 
      />
      
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.15}
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
        <Vignette offset={0.3} darkness={0.6} />
        <Noise opacity={0.015} />
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
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-[#0a0a15]">
      <Canvas 
        camera={{ position: mode === 'devices' ? [0, 5, 12] : [12, 8, 12], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0a15']} />
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
    </div>
  );
}
