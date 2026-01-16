/**
 * V73DScene - Container base para cenas 3D nas aulas V7
 *
 * Fornece:
 * - Canvas R3F configurado
 * - Iluminação cinematográfica
 * - Post-processing (Bloom, Vignette)
 * - Câmera com controles suaves
 * - Integração ECS
 */

import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Stars,
  Float,
  PerspectiveCamera,
  Sparkles,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useECSSystems, useClearWorldOnUnmount } from '@/lib/ecs';

interface V73DSceneProps {
  children: React.ReactNode;
  mood?: 'danger' | 'success' | 'warning' | 'dramatic' | 'mysterious' | 'neutral';
  showStars?: boolean;
  showSparkles?: boolean;
  cameraPosition?: [number, number, number];
  enableOrbitControls?: boolean;
  bloomIntensity?: number;
  className?: string;
}

// Cores por mood
const MOOD_COLORS = {
  danger: { primary: '#ff0040', secondary: '#ff6b6b', ambient: '#1a0008' },
  success: { primary: '#00ff88', secondary: '#4ecdc4', ambient: '#001a0d' },
  warning: { primary: '#ffaa00', secondary: '#f39c12', ambient: '#1a1100' },
  dramatic: { primary: '#9b59b6', secondary: '#8e44ad', ambient: '#0d0014' },
  mysterious: { primary: '#3498db', secondary: '#2980b9', ambient: '#000d1a' },
  neutral: { primary: '#00ffff', secondary: '#00cccc', ambient: '#001a1a' },
};

// Componente interno para sistemas ECS
function ECSRunner() {
  useECSSystems();
  useClearWorldOnUnmount();
  return null;
}

// Iluminação cinematográfica
function CinematicLighting({ mood }: { mood: keyof typeof MOOD_COLORS }) {
  const colors = MOOD_COLORS[mood];

  return (
    <>
      {/* Luz ambiente suave */}
      <ambientLight intensity={0.1} color={colors.ambient} />

      {/* Luz principal (key light) */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        color={colors.primary}
        castShadow
      />

      {/* Luz de preenchimento (fill light) */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.3}
        color={colors.secondary}
      />

      {/* Luz de contorno (rim light) */}
      <pointLight
        position={[0, 5, -5]}
        intensity={0.5}
        color="#ffffff"
        distance={15}
      />

      {/* Spot dramático */}
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color={colors.primary}
        castShadow
      />
    </>
  );
}

// Grid do chão estilo cyberpunk
function CyberGrid({ mood }: { mood: keyof typeof MOOD_COLORS }) {
  const colors = MOOD_COLORS[mood];

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial
        color={colors.primary}
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

// Post-processing
function PostProcessing({ mood, bloomIntensity = 1.5 }: { mood: keyof typeof MOOD_COLORS; bloomIntensity: number }) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.7}
        blendFunction={BlendFunction.NORMAL}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.002, 0.002)}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#00ffff" wireframe />
    </mesh>
  );
}

export default function V73DScene({
  children,
  mood = 'neutral',
  showStars = true,
  showSparkles = true,
  cameraPosition = [0, 2, 8],
  enableOrbitControls = false,
  bloomIntensity = 1.5,
  className = '',
}: V73DSceneProps) {
  const colors = MOOD_COLORS[mood];

  return (
    <div className={`w-full h-full min-h-[400px] bg-black ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Câmera */}
          <PerspectiveCamera makeDefault position={cameraPosition} fov={50} />

          {/* Controles (opcional) */}
          {enableOrbitControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 4}
              autoRotate
              autoRotateSpeed={0.5}
            />
          )}

          {/* Cor de fundo */}
          <color attach="background" args={['#000008']} />

          {/* Fog para profundidade */}
          <fog attach="fog" args={['#000008', 5, 30]} />

          {/* Iluminação */}
          <CinematicLighting mood={mood} />

          {/* Environment map para reflexos */}
          <Environment preset="night" />

          {/* Estrelas de fundo */}
          {showStars && (
            <Stars
              radius={50}
              depth={50}
              count={2000}
              factor={4}
              saturation={0}
              fade
              speed={0.5}
            />
          )}

          {/* Partículas flutuantes */}
          {showSparkles && (
            <Sparkles
              count={100}
              scale={15}
              size={2}
              speed={0.3}
              color={colors.primary}
            />
          )}

          {/* Grid cyberpunk */}
          <CyberGrid mood={mood} />

          {/* Runner ECS */}
          <ECSRunner />

          {/* Conteúdo da cena */}
          {children}

          {/* Post-processing */}
          <PostProcessing mood={mood} bloomIntensity={bloomIntensity} />
        </Suspense>
      </Canvas>
    </div>
  );
}
