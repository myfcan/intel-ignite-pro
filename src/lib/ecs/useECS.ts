/**
 * React Hooks para integrar ECS com React Three Fiber
 * NOTA: Este arquivo está sendo gradualmente substituído por hooks.ts
 * Mantido para compatibilidade com código legado
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { world, queries, resetWorld, Entity } from './world';
import {
  orbitalSystem,
  velocitySystem,
  pulseSystem,
  particleLifecycleSystem,
} from './systems';
import * as THREE from 'three';

// Helper functions para criar componentes
function createTransform(x: number, y: number, z: number) {
  return {
    position: new THREE.Vector3(x, y, z),
    rotation: new THREE.Euler(0, 0, 0),
    scale: new THREE.Vector3(1, 1, 1),
  };
}

function createOrbital(radius: number, speed: number, axis: 'x' | 'y' | 'z' | 'xz' = 'y') {
  return {
    center: new THREE.Vector3(0, 0, 0),
    radius,
    speed,
    phase: Math.random() * Math.PI * 2,
    axis,
  };
}

function createPulse(frequency: number, amplitude: number, _type: 'scale' | 'opacity' = 'scale') {
  return {
    baseScale: 1,
    amplitude,
    frequency,
    phase: Math.random() * Math.PI * 2,
  };
}

function createGlow(color: string, intensity: number, pulseSpeed: number = 1) {
  return {
    color: new THREE.Color(color),
    intensity,
    pulseSpeed,
  };
}

function createVelocity(x: number, y: number, z: number) {
  return {
    linear: new THREE.Vector3(x, y, z),
    angular: new THREE.Vector3(0, 0, 0),
  };
}

/**
 * Hook para executar sistemas ECS a cada frame
 */
export function useECSSystems() {
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    orbitalSystem(time);
    velocitySystem(delta);
    pulseSystem(time);
    particleLifecycleSystem(delta);
  });
}

/**
 * Hook para criar e gerenciar entidade
 */
export function useEntity(initialEntity: Entity) {
  const entityRef = useRef<Entity | null>(null);

  useEffect(() => {
    entityRef.current = world.add(initialEntity);
    return () => {
      if (entityRef.current) {
        world.remove(entityRef.current);
      }
    };
  }, []);

  return entityRef;
}

/**
 * Hook para criar múltiplas entidades (partículas, multidão, etc.)
 */
export function useEntities(count: number, factory: (index: number) => Entity) {
  const entitiesRef = useRef<Entity[]>([]);

  useEffect(() => {
    entitiesRef.current = [];
    for (let i = 0; i < count; i++) {
      entitiesRef.current.push(world.add(factory(i)));
    }

    return () => {
      for (const entity of entitiesRef.current) {
        world.remove(entity);
      }
      entitiesRef.current = [];
    };
  }, [count]);

  return entitiesRef;
}

/**
 * Hook para limpar mundo ao desmontar
 */
export function useClearWorldOnUnmount() {
  useEffect(() => {
    return () => {
      resetWorld();
    };
  }, []);
}

/**
 * Hook para criar órbita de objetos
 */
export function useOrbitalObjects(
  count: number,
  radius: number,
  speed: number,
  color: string = '#00ffff'
) {
  return useEntities(count, (i) => ({
    id: `orbital-${i}`,
    transform: createTransform(
      Math.cos((i / count) * Math.PI * 2) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin((i / count) * Math.PI * 2) * radius
    ),
    orbital: createOrbital(radius, speed + Math.random() * 0.2, 'y'),
    pulse: createPulse(1 + Math.random(), 0.1),
    glow: createGlow(color, 0.5 + Math.random() * 0.5),
  }));
}

/**
 * Hook para criar partículas flutuantes
 */
export function useFloatingParticles(count: number, spread: number = 10) {
  return useEntities(count, (i) => ({
    id: `particle-${i}`,
    transform: createTransform(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    ),
    velocity: createVelocity(
      (Math.random() - 0.5) * 0.1,
      Math.random() * 0.05 + 0.02,
      (Math.random() - 0.5) * 0.1
    ),
    pulse: createPulse(0.5 + Math.random() * 2, 0.3),
    glow: createGlow(
      Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
      0.3 + Math.random() * 0.7
    ),
  }));
}

// Re-export úteis
export { world, queries, resetWorld as clearWorld };
export type { Entity };
