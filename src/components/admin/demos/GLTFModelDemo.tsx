import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Float, MeshReflectorMaterial, Text, Stars, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Camera cinematográfica
function CinematicCamera({ mode }: { mode: 'devices' | 'crowd' }) {
  const { camera } = useThree();
  const angleRef = useRef(0);
  
  useFrame((state, delta) => {
    angleRef.current += delta * 0.08;
    const radius = mode === 'devices' ? 10 : 15;
    const height = mode === 'devices' ? 4 : 8;
    camera.position.x = Math.sin(angleRef.current) * radius;
    camera.position.z = Math.cos(angleRef.current) * radius;
    camera.position.y = height + Math.sin(state.clock.elapsedTime * 0.3) * 1;
    camera.lookAt(0, mode === 'devices' ? 1 : 2, 0);
  });
  
  return null;
}

// Monitor futurista premium
function FuturisticMonitor({ position, rotation = [0, 0, 0] }: { 
  position: [number, number, number]; 
  rotation?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const glowIntensity = useRef(0);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (screenRef.current) {
      // Pulso de luz na tela
      glowIntensity.current = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity.current;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={position} rotation={new THREE.Euler(rotation[0], rotation[1], rotation[2])}>
        {/* Moldura do monitor - metálica */}
        <RoundedBox args={[3, 2, 0.15]} radius={0.05} position={[0, 1.5, 0]}>
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.1}
            envMapIntensity={2}
          />
        </RoundedBox>
        
        {/* Tela com conteúdo animado */}
        <mesh ref={screenRef} position={[0, 1.5, 0.08]}>
          <planeGeometry args={[2.7, 1.7]} />
          <meshStandardMaterial
            color="#000011"
            emissive="#00ffff"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        {/* Brilho da borda da tela */}
        <mesh position={[0, 1.5, 0.075]}>
          <ringGeometry args={[1.35, 1.4, 4]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* LED indicator */}
        <mesh position={[1.2, 0.6, 0.08]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={2}
          />
        </mesh>
        
        {/* Suporte elegante */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial
            color="#2a2a3e"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        
        {/* Base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.08, 32]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={3}
          />
        </mesh>
        
        {/* Anel de luz na base */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.45, 0.55, 32]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={1}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Smartphone holográfico
function HolographicPhone({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        {/* Corpo do celular */}
        <RoundedBox args={[0.6, 1.2, 0.08]} radius={0.05}>
          <meshStandardMaterial
            color="#0a0a15"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={2}
          />
        </RoundedBox>
        
        {/* Tela com efeito holográfico */}
        <mesh ref={screenRef} position={[0, 0, 0.045]}>
          <planeGeometry args={[0.5, 1.05]} />
          <meshStandardMaterial
            color="#000022"
            emissive="#ff00ff"
            emissiveIntensity={0.4}
          />
        </mesh>
        
        {/* Hologram projetado */}
        <mesh position={[0, 0.3, 0.3]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[0.8, 0.5]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Linha de projeção */}
        <mesh position={[0, 0.15, 0.15]}>
          <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={2}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Câmera frontal */}
        <mesh position={[0, 0.5, 0.041]}>
          <circleGeometry args={[0.02, 16]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    </Float>
  );
}

// Pessoa cyberpunk com celular
function CyberpunkPerson({ 
  position, 
  color,
  phoneColor
}: { 
  position: [number, number, number]; 
  color: string;
  phoneColor: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const walkOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const walkSpeed = useMemo(() => 2 + Math.random() * 2, []);
  
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      // Caminhada suave
      groupRef.current.position.y = Math.abs(Math.sin(t * walkSpeed + walkOffset)) * 0.08;
      // Leve balanço
      groupRef.current.rotation.z = Math.sin(t * walkSpeed + walkOffset) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Corpo */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.18, 0.5, 4, 12]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      
      {/* Cabeça */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#ffdbac"
          roughness={0.8}
        />
      </mesh>
      
      {/* Cabelo/capacete cyber */}
      <mesh position={[0, 1.08, -0.02]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Óculos/visor */}
      <mesh position={[0, 0.98, 0.12]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshStandardMaterial
          color={phoneColor}
          emissive={phoneColor}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Braço com celular */}
      <group position={[0.25, 0.6, 0.15]} rotation={[0.3, -0.2, 0]}>
        <mesh>
          <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Celular na mão */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.08, 0.15, 0.01]} />
          <meshStandardMaterial
            color={phoneColor}
            emissive={phoneColor}
            emissiveIntensity={1.5}
          />
        </mesh>
      </group>
    </group>
  );
}

// Multidão cyberpunk
function CyberpunkCrowdScene() {
  const colors = ['#4a4a6a', '#5a3a5a', '#3a5a6a', '#6a4a5a', '#4a5a5a', '#5a5a4a'];
  const phoneColors = ['#00ffff', '#ff00ff', '#ffff00', '#ff6600', '#00ff88'];
  
  const people = useMemo(() => {
    const temp = [];
    for (let x = -4; x <= 4; x += 0.9) {
      for (let z = -4; z <= 4; z += 0.9) {
        temp.push({
          position: [
            x + (Math.random() - 0.5) * 0.4,
            0,
            z + (Math.random() - 0.5) * 0.4
          ] as [number, number, number],
          color: colors[Math.floor(Math.random() * colors.length)],
          phoneColor: phoneColors[Math.floor(Math.random() * phoneColors.length)]
        });
      }
    }
    return temp;
  }, []);

  return (
    <group>
      {people.map((person, i) => (
        <CyberpunkPerson
          key={i}
          position={person.position}
          color={person.color}
          phoneColor={person.phoneColor}
        />
      ))}
    </group>
  );
}

// Estruturas flutuantes de fundo
function FloatingStructures() {
  return (
    <>
      {Array.from({ length: 15 }).map((_, i) => {
        const x = (Math.random() - 0.5) * 30;
        const y = 5 + Math.random() * 10;
        const z = (Math.random() - 0.5) * 30;
        const size = 1 + Math.random() * 2;
        
        return (
          <Float key={i} speed={0.5 + Math.random()} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh position={[x, y, z]}>
              <boxGeometry args={[size, size * 2, size * 0.3]} />
              <meshStandardMaterial
                color="#1a1a2e"
                metalness={0.9}
                roughness={0.2}
                emissive="#00ffff"
                emissiveIntensity={0.1}
              />
            </mesh>
          </Float>
        );
      })}
    </>
  );
}

// Chão refletivo com grid
function CyberFloor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          depthScale={1}
          color="#050508"
          metalness={0.7}
          roughness={0.9}
          mirror={0.3}
        />
      </mesh>
      
      {/* Grid de luz */}
      <group position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {Array.from({ length: 21 }).map((_, i) => (
          <mesh key={`h-${i}`} position={[0, (i - 10) * 1, 0]}>
            <planeGeometry args={[40, 0.02]} />
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
        {Array.from({ length: 21 }).map((_, i) => (
          <mesh key={`v-${i}`} position={[(i - 10) * 1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[40, 0.02]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Scene({ mode }: { mode: 'devices' | 'crowd' }) {
  return (
    <>
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      
      <ambientLight intensity={0.05} />
      <pointLight position={[0, 10, 0]} intensity={3} color="#ff00ff" distance={30} />
      <pointLight position={[10, 5, 10]} intensity={2} color="#00ffff" distance={25} />
      <pointLight position={[-10, 5, -10]} intensity={2} color="#ffff00" distance={25} />
      <spotLight
        position={[0, 15, 0]}
        intensity={2}
        color="#ffffff"
        angle={0.6}
        penumbra={1}
        castShadow
      />
      
      {mode === 'devices' ? (
        <>
          <FuturisticMonitor position={[-2.5, 0, 0]} rotation={[0, 0.3, 0]} />
          <FuturisticMonitor position={[2.5, 0, 0]} rotation={[0, -0.3, 0]} />
          <FuturisticMonitor position={[0, 0, -2]} rotation={[0, 0, 0]} />
          <HolographicPhone position={[-1, 1.5, 1.5]} />
          <HolographicPhone position={[1, 1.2, 2]} />
          <HolographicPhone position={[0, 1.8, 1]} />
        </>
      ) : (
        <>
          <CyberpunkCrowdScene />
          <FloatingStructures />
        </>
      )}
      
      <CyberFloor />
      
      <EffectComposer>
        <Bloom
          intensity={2}
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
        minDistance={4}
        maxDistance={25}
      />
    </>
  );
}

interface GLTFModelDemoProps {
  mode?: 'devices' | 'crowd';
}

export function GLTFModelDemo({ mode = 'devices' }: GLTFModelDemoProps) {
  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden bg-black">
      <Canvas 
        camera={{ position: mode === 'devices' ? [0, 4, 10] : [10, 8, 15], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
    </div>
  );
}
