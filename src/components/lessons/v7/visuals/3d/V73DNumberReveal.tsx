/**
 * V73DNumberReveal - Revelação de número em 3D
 *
 * Versão 3D dramática do number-reveal
 * Ex: "98%" ou "R$ 30.000" com efeitos cinematográficos
 */

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import V73DScene from './V73DScene';

interface V73DNumberRevealProps {
  number: string;
  subtitle?: string;
  secondaryNumber?: string;
  hookQuestion?: string;
  mood?: 'danger' | 'success' | 'warning' | 'dramatic' | 'mysterious' | 'neutral';
  countUp?: boolean;
  countUpDuration?: number;
}

const MOOD_COLORS = {
  danger: { main: '#ff0040', glow: '#ff0000' },
  success: { main: '#00ff88', glow: '#00ff00' },
  warning: { main: '#ffaa00', glow: '#ff8800' },
  dramatic: { main: '#9b59b6', glow: '#ff00ff' },
  mysterious: { main: '#3498db', glow: '#00ffff' },
  neutral: { main: '#ffffff', glow: '#00ffff' },
};

// Número 3D principal
function MainNumber({ number, color, glow }: { number: string; color: string; glow: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const [scale, setScale] = useState(0);

  // Animação de entrada
  useEffect(() => {
    const timeout = setTimeout(() => {
      setScale(1);
    }, 200);
    return () => clearTimeout(timeout);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Breathing effect
      const breath = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      groupRef.current.scale.setScalar(scale * (1 + breath));

      // Rotação suave
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.1}>
      <group ref={groupRef} scale={scale}>
        <Center>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={2}
            height={0.4}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            {number}
            <meshStandardMaterial
              color={color}
              emissive={glow}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />
          </Text3D>
        </Center>

        {/* Glow layer (duplicado com material emissivo) */}
        <Center>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={2}
            height={0.4}
            curveSegments={12}
          >
            {number}
            <meshBasicMaterial
              color={glow}
              transparent
              opacity={0.3}
            />
          </Text3D>
        </Center>

        {/* Luz pontual para glow */}
        <pointLight color={glow} intensity={2} distance={10} position={[0, 0, 2]} />
      </group>
    </Float>
  );
}

// Texto de subtítulo
function Subtitle({ text, color }: { text: string; color: string }) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setOpacity(1), 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Center position={[0, -1.5, 0]}>
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.3}
        height={0.05}
      >
        {text}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
        />
      </Text3D>
    </Center>
  );
}

// Partículas de impacto
function ImpactParticles({ color, active }: { color: string; active: boolean }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 100;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  const velocities = React.useMemo(() => {
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      vel[i * 3] = Math.cos(angle) * 0.05;
      vel[i * 3 + 1] = (Math.random() - 0.3) * 0.03;
      vel[i * 3 + 2] = Math.sin(angle) * 0.05;
    }
    return vel;
  }, []);

  useFrame(() => {
    if (particlesRef.current && active) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Anéis de energia
function EnergyRings({ color }: { color: string }) {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        const t = state.clock.elapsedTime + i * 0.5;
        ring.scale.setScalar(1 + Math.sin(t * 2) * 0.1);
        ring.rotation.z = t * (0.2 + i * 0.1);
      });
    }
  });

  return (
    <group ref={ringsRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3 + i * 0.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.3 - i * 0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function V73DNumberReveal({
  number,
  subtitle,
  secondaryNumber,
  hookQuestion,
  mood = 'neutral',
  countUp = false,
  countUpDuration = 2,
}: V73DNumberRevealProps) {
  const colors = MOOD_COLORS[mood];
  const [showParticles, setShowParticles] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(countUp ? '0' : number);

  // Efeito de count up
  useEffect(() => {
    if (countUp) {
      const numericValue = parseFloat(number.replace(/[^0-9.]/g, ''));
      const prefix = number.replace(/[0-9.,]/g, '').trim();
      const suffix = number.includes('%') ? '%' : '';
      const isFloat = number.includes('.');

      const startTime = Date.now();
      const duration = countUpDuration * 1000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const current = numericValue * eased;

        if (isFloat) {
          setDisplayNumber(`${prefix}${current.toFixed(1)}${suffix}`);
        } else {
          setDisplayNumber(`${prefix}${Math.floor(current).toLocaleString()}${suffix}`);
        }

        if (progress >= 1) {
          clearInterval(interval);
          setDisplayNumber(number);
          setShowParticles(true);
        }
      }, 16);

      return () => clearInterval(interval);
    }
  }, [countUp, number, countUpDuration]);

  // Trigger particles depois de um tempo
  useEffect(() => {
    if (!countUp) {
      const timeout = setTimeout(() => setShowParticles(true), 500);
      return () => clearTimeout(timeout);
    }
  }, [countUp]);

  return (
    <V73DScene
      mood={mood}
      cameraPosition={[0, 0, 8]}
      bloomIntensity={2}
      showStars={true}
      showSparkles={true}
    >
      {/* Hook question no topo */}
      {hookQuestion && (
        <Center position={[0, 2.5, 0]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.25}
            height={0.02}
          >
            {hookQuestion}
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
          </Text3D>
        </Center>
      )}

      {/* Número principal */}
      <MainNumber number={displayNumber} color={colors.main} glow={colors.glow} />

      {/* Subtítulo */}
      {subtitle && <Subtitle text={subtitle} color={colors.main} />}

      {/* Número secundário (se houver) */}
      {secondaryNumber && (
        <Center position={[0, -2.3, 0]}>
          <Text3D
            font="/fonts/helvetiker_bold.typeface.json"
            size={0.4}
            height={0.05}
          >
            {secondaryNumber}
            <meshStandardMaterial
              color={colors.main}
              emissive={colors.glow}
              emissiveIntensity={0.3}
            />
          </Text3D>
        </Center>
      )}

      {/* Anéis de energia */}
      <EnergyRings color={colors.glow} />

      {/* Partículas de impacto */}
      <ImpactParticles color={colors.glow} active={showParticles} />
    </V73DScene>
  );
}

export type { V73DNumberRevealProps };
