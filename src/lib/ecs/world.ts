import { World } from 'miniplex';
import * as THREE from 'three';

// ============================================
// ENTITY COMPONENT SYSTEM - Professional 3D
// ============================================

// Component Types
export interface TransformComponent {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface VelocityComponent {
  linear: THREE.Vector3;
  angular: THREE.Vector3;
}

export interface OrbitalComponent {
  center: THREE.Vector3;
  radius: number;
  speed: number;
  phase: number;
  axis: 'x' | 'y' | 'z' | 'xz';
}

export interface PulseComponent {
  baseScale: number;
  amplitude: number;
  frequency: number;
  phase: number;
}

export interface GlowComponent {
  color: THREE.Color;
  intensity: number;
  pulseSpeed: number;
}

export interface TrailComponent {
  length: number;
  width: number;
  color: THREE.Color;
  decay: number;
}

export interface ParticleComponent {
  lifetime: number;
  age: number;
  fadeIn: number;
  fadeOut: number;
}

export interface InstancedComponent {
  meshId: string;
  instanceId: number;
}

export interface MaterialComponent {
  type: 'physical' | 'transmission' | 'basic' | 'emissive';
  color: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  transmission?: number;
  opacity?: number;
}

export interface HelixComponent {
  strand: 1 | 2;
  index: number;
  totalCount: number;
  helixRadius: number;
  helixHeight: number;
  rotationSpeed: number;
}

export interface GalaxyComponent {
  arm: number;
  distanceFromCenter: number;
  armSpread: number;
  verticalSpread: number;
  rotationSpeed: number;
}

export interface FloatComponent {
  amplitude: THREE.Vector3;
  frequency: THREE.Vector3;
  phase: THREE.Vector3;
}

export interface WaveComponent {
  amplitude: number;
  frequency: number;
  waveSpeed: number;
  waveOffset: number;
}

export interface ConnectionComponent {
  targetId: string;
  pulseSpeed: number;
  pulsePhase: number;
}

export interface RingComponent {
  innerRadius: number;
  outerRadius: number;
  rotationSpeed: number;
  tilt: number;
}

export interface CrystalComponent {
  facets: number;
  iridescence: number;
  refractionIndex: number;
}

// Complete Entity Type
export type Entity = {
  id: string;
  transform: TransformComponent;
  velocity?: VelocityComponent;
  orbital?: OrbitalComponent;
  pulse?: PulseComponent;
  glow?: GlowComponent;
  trail?: TrailComponent;
  particle?: ParticleComponent;
  instanced?: InstancedComponent;
  material?: MaterialComponent;
  helix?: HelixComponent;
  galaxy?: GalaxyComponent;
  float?: FloatComponent;
  wave?: WaveComponent;
  connection?: ConnectionComponent;
  ring?: RingComponent;
  crystal?: CrystalComponent;
  // Tags
  isCore?: true;
  isOrbiter?: true;
  isParticle?: true;
  isStructure?: true;
  isLight?: true;
  isConnector?: true;
  needsMatrixUpdate?: true;
};

// Create the main world
export const world = new World<Entity>();

// Queries for different entity types
export const queries = {
  // All entities with transform (basically everything)
  withTransform: world.with('transform'),
  
  // Moving entities
  moving: world.with('transform', 'velocity'),
  
  // Orbital entities
  orbiting: world.with('transform', 'orbital'),
  
  // Pulsing entities
  pulsing: world.with('transform', 'pulse'),
  
  // Glowing entities
  glowing: world.with('glow'),
  
  // Floating entities
  floating: world.with('transform', 'float'),
  
  // Wave-affected entities
  waving: world.with('transform', 'wave'),
  
  // Particles
  particles: world.with('transform', 'particle'),
  
  // Helix particles
  helixParticles: world.with('transform', 'helix'),
  
  // Galaxy particles
  galaxyParticles: world.with('transform', 'galaxy'),
  
  // Ring entities
  rings: world.with('transform', 'ring'),
  
  // Crystals
  crystals: world.with('transform', 'crystal'),
  
  // Instanced mesh entities
  instanced: world.with('transform', 'instanced'),
  
  // Entities that need matrix updates
  needsUpdate: world.with('transform', 'needsMatrixUpdate'),
  
  // Core entities
  cores: world.with('transform', 'isCore'),
  
  // Orbiters
  orbiters: world.with('transform', 'isOrbiter'),
  
  // Structures
  structures: world.with('transform', 'isStructure'),
  
  // Lights
  lights: world.with('transform', 'isLight'),
  
  // Connectors
  connectors: world.with('transform', 'isConnector'),
};

// Utility function to create entity IDs
let entityIdCounter = 0;
export const createEntityId = (prefix: string = 'entity') => {
  return `${prefix}_${++entityIdCounter}`;
};

// Reset world (useful for cleanup)
export const resetWorld = () => {
  for (const entity of world) {
    world.remove(entity);
  }
  entityIdCounter = 0;
};
