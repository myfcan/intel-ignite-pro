/**
 * V73DAbstractScene - Cena abstrata cinematográfica para backgrounds
 *
 * Usado para criar atmosfera visual durante narrações
 * Elementos: formas geométricas flutuantes, partículas, luzes
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Float,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Icosahedron,
  Octahedron,
  Torus,
  TorusKnot,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import V73DScene from './V73DScene';
import { useOrbitalObjects, useFloatingParticles } from '@/lib/ecs';

interface V73DAbstractSceneProps {
  mood?: 'danger' | 'success' | 'warning' | 'dramatic' | 'mysterious' | 'neutral';
  variant?: 'geometric' | 'organic' | 'particles' | 'mixed';
  intensity?: 'subtle' | 'normal' | 'intense';
  primaryColor?: string;
  secondaryColor?: string;
}

const MOOD_PRESETS = {
  danger: { primary: '#ff0040', secondary: '#ff6b6b' },
  success: { primary: '#00ff88', secondary: '#4ecdc4' },
  warning: { primary: '#ffaa00', secondary: '#f39c12' },
  dramatic: { primary: '#9b59b6', secondary: '#ff00ff' },
  mysterious: { primary: '#3498db', secondary: '#00ffff' },
  neutral: { primary: '#00ffff', secondary: '#ffffff' },
};

// Esfera central com distorção
function CentralSphere({ color, intensity }: { color: string; intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 4]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3 * intensity}
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

// Anéis orbitais
function OrbitalRings({ color, count = 3 }: { color: string; count?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  const rings = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      radius: 2.5 + i * 0.8,
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
      speed: 0.5 - i * 0.1,
    }));
  }, [count]);

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation}>
          <torusGeometry args={[ring.radius, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6 - i * 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

// Cubos flutuantes
function FloatingCubes({ color, count = 20 }: { color: string; count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const cubes = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 15,
      ],
      scale: 0.1 + Math.random() * 0.3,
      speed: 0.5 + Math.random() * 1,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    cubes.forEach((cube, i) => {
      const t = state.clock.elapsedTime * cube.speed + cube.phase;
      dummy.position.set(
        cube.position[0] + Math.sin(t) * 0.5,
        cube.position[1] + Math.cos(t * 0.7) * 0.5,
        cube.position[2] + Math.sin(t * 0.5) * 0.5
      );
      dummy.rotation.set(t * 0.5, t * 0.3, t * 0.2);
      dummy.scale.setScalar(cube.scale * (1 + Math.sin(t * 2) * 0.1));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.7}
        metalness={0.8}
        roughness={0.2}
      />
    </instancedMesh>
  );
}

// DNA Helix abstrato
function DNAHelix({ color, secondaryColor }: { color: string; secondaryColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = 30;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const spheres = useMemo(() => {
    return Array.from({ length: count * 2 }, (_, i) => {
      const isFirst = i < count;
      const index = isFirst ? i : i - count;
      const angle = (index / count) * Math.PI * 4;
      const y = (index / count) * 8 - 4;
      const radius = 1.5;
      const offset = isFirst ? 0 : Math.PI;

      return {
        position: [
          Math.cos(angle + offset) * radius,
          y,
          Math.sin(angle + offset) * radius,
        ] as [number, number, number],
        color: isFirst ? color : secondaryColor,
        index,
        isFirst,
      };
    });
  }, [count, color, secondaryColor]);

  return (
    <group ref={groupRef} position={[4, 0, -2]}>
      {spheres.map((sphere, i) => (
        <mesh key={i} position={sphere.position}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color={sphere.color}
            emissive={sphere.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      {/* Conexões */}
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 4;
        const y = (i / count) * 8 - 4;
        return (
          <mesh key={`conn-${i}`} position={[0, y, 0]} rotation={[0, angle, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 3, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Torus Knot decorativo
function DecorativeTorusKnot({ color }: { color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.2}>
      <mesh ref={meshRef} position={[-4, 1, -2]}>
        <torusKnotGeometry args={[0.8, 0.3, 128, 16]} />
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          factor={0.2}
          speed={2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export default function V73DAbstractScene({
  mood = 'neutral',
  variant = 'mixed',
  intensity = 'normal',
  primaryColor,
  secondaryColor,
}: V73DAbstractSceneProps) {
  const preset = MOOD_PRESETS[mood];
  const primary = primaryColor || preset.primary;
  const secondary = secondaryColor || preset.secondary;
  const intensityMultiplier = intensity === 'subtle' ? 0.5 : intensity === 'intense' ? 1.5 : 1;

  return (
    <V73DScene
      mood={mood}
      cameraPosition={[0, 0, 10]}
      enableOrbitControls={false}
      bloomIntensity={1.5 * intensityMultiplier}
      showStars={true}
      showSparkles={true}
    >
      {/* Elementos baseados na variante */}
      {(variant === 'geometric' || variant === 'mixed') && (
        <>
          <OrbitalRings color={primary} count={3} />
          <FloatingCubes color={secondary} count={15} />
        </>
      )}

      {(variant === 'organic' || variant === 'mixed') && (
        <>
          <CentralSphere color={primary} intensity={intensityMultiplier} />
          <DNAHelix color={primary} secondaryColor={secondary} />
          <DecorativeTorusKnot color={secondary} />
        </>
      )}

      {(variant === 'particles') && (
        <>
          <FloatingCubes color={primary} count={50} />
          <Sparkles
            count={200}
            scale={20}
            size={3}
            speed={0.5}
            color={primary}
          />
        </>
      )}

      {/* Sparkles adicionais para todas as variantes */}
      <Sparkles
        count={100}
        scale={15}
        size={2}
        speed={0.3}
        color={secondary}
      />
    </V73DScene>
  );
}

export type { V73DAbstractSceneProps };
