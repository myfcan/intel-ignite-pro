/**
 * V73DDualMonitors - Dois monitores 3D com conteúdo nas telas
 *
 * Usado para mostrar comparações visuais:
 * - Prompt amador vs Prompt profissional
 * - Antes vs Depois
 * - 98% vs 2%
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  RoundedBox,
  Text,
  Float,
  MeshTransmissionMaterial,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import V73DScene from './V73DScene';

interface ScreenContent {
  title: string;
  content: string;
  style: 'amateur' | 'professional';
}

interface V73DDualMonitorsProps {
  leftScreen: ScreenContent;
  rightScreen: ScreenContent;
  mood?: 'danger' | 'success' | 'warning' | 'dramatic' | 'mysterious' | 'neutral';
  animation?: 'float' | 'static' | 'pulse';
}

// Cores por estilo
const STYLE_COLORS = {
  amateur: {
    screen: '#1a0505',
    border: '#ff3333',
    text: '#ff6666',
    glow: '#ff0000',
    label: 'AMADOR',
  },
  professional: {
    screen: '#051a0a',
    border: '#00ff88',
    text: '#00ffaa',
    glow: '#00ff00',
    label: 'PROFISSIONAL',
  },
};

// Componente do Monitor individual
function Monitor({
  position,
  screenContent,
  delay = 0,
}: {
  position: [number, number, number];
  screenContent: ScreenContent;
  delay?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const colors = STYLE_COLORS[screenContent.style];

  // Animação de hover/breathing
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime + delay;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.05;
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.1;
    }
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      if (material.emissiveIntensity !== undefined) {
        material.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
      }
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.1}
      floatIntensity={0.3}
      floatingRange={[-0.05, 0.05]}
    >
      <group ref={groupRef} position={position}>
        {/* Base/Suporte do monitor */}
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.3, 0.4, 0.1, 32]} />
          <meshStandardMaterial
            color="#111111"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Haste do monitor */}
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.5, 16]} />
          <meshStandardMaterial
            color="#222222"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Corpo do monitor (moldura) */}
        <RoundedBox
          args={[3.2, 2.2, 0.15]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.3, 0]}
        >
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.7}
            roughness={0.3}
          />
        </RoundedBox>

        {/* Borda luminosa */}
        <RoundedBox
          args={[3.25, 2.25, 0.12]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.3, -0.02]}
        >
          <meshStandardMaterial
            color={colors.border}
            emissive={colors.glow}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </RoundedBox>

        {/* Tela do monitor */}
        <mesh ref={screenRef} position={[0, 0.3, 0.08]}>
          <planeGeometry args={[2.9, 1.9]} />
          <meshStandardMaterial
            color={colors.screen}
            emissive={colors.glow}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Label do estilo (AMADOR / PROFISSIONAL) */}
        <Text
          position={[0, 1.6, 0.1]}
          fontSize={0.2}
          color={colors.text}
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {colors.label}
        </Text>

        {/* Título do conteúdo */}
        <Text
          position={[0, 1.0, 0.1]}
          fontSize={0.15}
          color={colors.text}
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
        >
          {screenContent.title}
        </Text>

        {/* Conteúdo da tela */}
        <Text
          position={[0, 0.2, 0.1]}
          fontSize={0.08}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.5}
          lineHeight={1.4}
          textAlign="left"
        >
          {screenContent.content.slice(0, 200)}
          {screenContent.content.length > 200 ? '...' : ''}
        </Text>

        {/* Indicador de status (LED) */}
        <mesh position={[1.4, -0.6, 0.08]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial
            color={colors.glow}
            emissive={colors.glow}
            emissiveIntensity={2}
          />
        </mesh>

        {/* Luz pontual para glow */}
        <pointLight
          position={[0, 0.3, 1]}
          color={colors.glow}
          intensity={0.5}
          distance={3}
        />
      </group>
    </Float>
  );
}

// Partículas de conexão entre os monitores
function ConnectionParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2; // X entre monitores
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5; // Z
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.002;
        positions[i * 3 + 1] += Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.002;

        // Reset se sair do range
        if (positions[i * 3] > 1) positions[i * 3] = -1;
        if (positions[i * 3] < -1) positions[i * 3] = 1;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#00ffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Texto "VS" central
function VSText() {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (textRef.current) {
      textRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <Text
      ref={textRef}
      position={[0, 0, 0.5]}
      fontSize={0.5}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      VS
    </Text>
  );
}

export default function V73DDualMonitors({
  leftScreen,
  rightScreen,
  mood = 'neutral',
  animation = 'float',
}: V73DDualMonitorsProps) {
  return (
    <V73DScene
      mood={mood}
      cameraPosition={[0, 1, 7]}
      enableOrbitControls={false}
      bloomIntensity={1.8}
    >
      {/* Monitor esquerdo (amador) */}
      <Monitor
        position={[-2.5, 0, 0]}
        screenContent={leftScreen}
        delay={0}
      />

      {/* Monitor direito (profissional) */}
      <Monitor
        position={[2.5, 0, 0]}
        screenContent={rightScreen}
        delay={Math.PI}
      />

      {/* VS central */}
      <VSText />

      {/* Partículas de conexão */}
      <ConnectionParticles />
    </V73DScene>
  );
}

// Export do tipo para uso no JSON
export type { V73DDualMonitorsProps, ScreenContent };
