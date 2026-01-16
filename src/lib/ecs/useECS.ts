/**
 * React Hooks para integrar ECS com React Three Fiber
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import {
  world,
  queries,
  orbitalSystem,
  velocitySystem,
  pulseSystem,
  lifetimeSystem,
  trailSystem,
  clearWorld,
  Entity,
  createTransform,
  createOrbital,
  createPulse,
  createGlow,
  createVelocity,
} from './world';

/**
 * Hook para executar sistemas ECS a cada frame
 */
export function useECSSystems() {
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    orbitalSystem(delta, time);
    velocitySystem(delta);
    pulseSystem(time);
    lifetimeSystem(delta);
    trailSystem();
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
      clearWorld();
    };
  }, []);
}

/**
 * Hook para criar dispositivo (monitor, smartphone, etc.)
 */
export function useDevice(
  type: 'monitor' | 'smartphone' | 'tablet' | 'laptop',
  position: [number, number, number],
  screenContent?: { type: 'text' | 'code'; content: string; style?: 'amateur' | 'professional' }
) {
  return useEntity({
    id: `device-${type}-${Math.random().toString(36).slice(2)}`,
    transform: createTransform(...position),
    device: {
      type,
      screenContent,
      screenGlow: true,
    },
    pulse: createPulse(0.5, 0.02, 'scale'),
    glow: createGlow('#00ffff', 0.5, 2),
  });
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
    pulse: createPulse(1 + Math.random(), 0.1, 'scale'),
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
    pulse: createPulse(0.5 + Math.random() * 2, 0.3, 'scale'),
    glow: createGlow(
      Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
      0.3 + Math.random() * 0.7
    ),
  }));
}

// Re-export úteis
export { world, queries, clearWorld };
export type { Entity };
