/**
 * ECS World - Sistema de Entidades com Miniplex
 *
 * Arquitetura profissional para gerenciar objetos 3D nas aulas V7
 */

import { World } from 'miniplex';
import * as THREE from 'three';

// ============================================================================
// COMPONENTES ECS
// ============================================================================

export interface Transform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface Velocity {
  linear: THREE.Vector3;
  angular: THREE.Vector3;
}

export interface Orbital {
  center: THREE.Vector3;
  radius: number;
  speed: number;
  phase: number;
  axis: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz';
}

export interface Pulse {
  frequency: number;
  amplitude: number;
  phase: number;
  property: 'scale' | 'opacity' | 'emissive';
}

export interface Glow {
  color: THREE.Color;
  intensity: number;
  pulseSpeed?: number;
}

export interface Trail {
  length: number;
  color: THREE.Color;
  width: number;
  positions: THREE.Vector3[];
}

export interface Lifetime {
  current: number;
  max: number;
  fadeStart: number;
}

export interface Mesh3D {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  mesh?: THREE.Mesh;
}

export interface Model3D {
  url: string;
  loaded: boolean;
  scene?: THREE.Group;
}

export interface ScreenContent {
  type: 'text' | 'image' | 'video' | 'code';
  content: string;
  style?: 'amateur' | 'professional' | 'neutral';
}

export interface Device {
  type: 'monitor' | 'smartphone' | 'tablet' | 'laptop';
  screenContent?: ScreenContent;
  screenGlow?: boolean;
}

export interface Crowd {
  count: number;
  spread: THREE.Vector3;
  movement: 'walking' | 'standing' | 'random';
  holdingDevice: boolean;
}

export interface ParticleEmitter {
  rate: number;
  lifetime: number;
  velocity: THREE.Vector3;
  spread: number;
  color: THREE.Color;
  size: number;
}

export interface CameraTarget {
  lookAt: THREE.Vector3;
  distance: number;
  orbitSpeed: number;
}

// ============================================================================
// ENTIDADE
// ============================================================================

export interface Entity {
  id?: string;
  transform?: Transform;
  velocity?: Velocity;
  orbital?: Orbital;
  pulse?: Pulse;
  glow?: Glow;
  trail?: Trail;
  lifetime?: Lifetime;
  mesh3D?: Mesh3D;
  model3D?: Model3D;
  device?: Device;
  crowd?: Crowd;
  particleEmitter?: ParticleEmitter;
  cameraTarget?: CameraTarget;
}

// ============================================================================
// WORLD
// ============================================================================

export const world = new World<Entity>();

// ============================================================================
// QUERIES (para sistemas acessarem entidades específicas)
// ============================================================================

export const queries = {
  // Entidades com transformação
  withTransform: world.with('transform'),

  // Entidades que se movem
  withVelocity: world.with('transform', 'velocity'),

  // Entidades em órbita
  withOrbital: world.with('transform', 'orbital'),

  // Entidades com pulsação
  withPulse: world.with('transform', 'pulse'),

  // Entidades com glow
  withGlow: world.with('glow'),

  // Entidades com trail
  withTrail: world.with('transform', 'trail'),

  // Entidades com tempo de vida
  withLifetime: world.with('lifetime'),

  // Dispositivos
  devices: world.with('device', 'transform'),

  // Multidões
  crowds: world.with('crowd', 'transform'),

  // Emissores de partículas
  particleEmitters: world.with('particleEmitter', 'transform'),

  // Alvos de câmera
  cameraTargets: world.with('cameraTarget'),
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createTransform(
  x = 0, y = 0, z = 0,
  rx = 0, ry = 0, rz = 0,
  sx = 1, sy = 1, sz = 1
): Transform {
  return {
    position: new THREE.Vector3(x, y, z),
    rotation: new THREE.Euler(rx, ry, rz),
    scale: new THREE.Vector3(sx, sy, sz),
  };
}

export function createVelocity(
  lx = 0, ly = 0, lz = 0,
  ax = 0, ay = 0, az = 0
): Velocity {
  return {
    linear: new THREE.Vector3(lx, ly, lz),
    angular: new THREE.Vector3(ax, ay, az),
  };
}

export function createOrbital(
  radius: number,
  speed: number,
  axis: Orbital['axis'] = 'y',
  center = new THREE.Vector3()
): Orbital {
  return {
    center,
    radius,
    speed,
    phase: Math.random() * Math.PI * 2,
    axis,
  };
}

export function createPulse(
  frequency: number,
  amplitude: number,
  property: Pulse['property'] = 'scale'
): Pulse {
  return {
    frequency,
    amplitude,
    phase: Math.random() * Math.PI * 2,
    property,
  };
}

export function createGlow(
  color: string | number,
  intensity: number,
  pulseSpeed?: number
): Glow {
  return {
    color: new THREE.Color(color),
    intensity,
    pulseSpeed,
  };
}

export function createDevice(
  type: Device['type'],
  screenContent?: ScreenContent
): Device {
  return {
    type,
    screenContent,
    screenGlow: true,
  };
}

// ============================================================================
// SISTEMAS
// ============================================================================

export function orbitalSystem(delta: number, time: number): void {
  for (const entity of queries.withOrbital) {
    const { transform, orbital } = entity;
    const angle = time * orbital.speed + orbital.phase;

    switch (orbital.axis) {
      case 'y':
        transform.position.x = orbital.center.x + Math.cos(angle) * orbital.radius;
        transform.position.z = orbital.center.z + Math.sin(angle) * orbital.radius;
        break;
      case 'x':
        transform.position.y = orbital.center.y + Math.cos(angle) * orbital.radius;
        transform.position.z = orbital.center.z + Math.sin(angle) * orbital.radius;
        break;
      case 'z':
        transform.position.x = orbital.center.x + Math.cos(angle) * orbital.radius;
        transform.position.y = orbital.center.y + Math.sin(angle) * orbital.radius;
        break;
      case 'xy':
        transform.position.x = orbital.center.x + Math.cos(angle) * orbital.radius;
        transform.position.y = orbital.center.y + Math.sin(angle) * orbital.radius * 0.5;
        transform.position.z = orbital.center.z + Math.sin(angle * 1.5) * orbital.radius * 0.3;
        break;
    }
  }
}

export function velocitySystem(delta: number): void {
  for (const entity of queries.withVelocity) {
    const { transform, velocity } = entity;
    transform.position.add(velocity.linear.clone().multiplyScalar(delta));
    transform.rotation.x += velocity.angular.x * delta;
    transform.rotation.y += velocity.angular.y * delta;
    transform.rotation.z += velocity.angular.z * delta;
  }
}

export function pulseSystem(time: number): void {
  for (const entity of queries.withPulse) {
    const { transform, pulse } = entity;
    const value = 1 + Math.sin(time * pulse.frequency + pulse.phase) * pulse.amplitude;

    if (pulse.property === 'scale') {
      transform.scale.setScalar(value);
    }
  }
}

export function lifetimeSystem(delta: number): void {
  const toRemove: Entity[] = [];

  for (const entity of queries.withLifetime) {
    entity.lifetime!.current += delta;
    if (entity.lifetime!.current >= entity.lifetime!.max) {
      toRemove.push(entity);
    }
  }

  for (const entity of toRemove) {
    world.remove(entity);
  }
}

export function trailSystem(): void {
  for (const entity of queries.withTrail) {
    const { transform, trail } = entity;
    trail.positions.unshift(transform.position.clone());
    if (trail.positions.length > trail.length) {
      trail.positions.pop();
    }
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

export function clearWorld(): void {
  for (const entity of world.entities) {
    world.remove(entity);
  }
}
