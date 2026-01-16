// ============================================
// ECS MODULE - Main Export
// ============================================

// World and types
export { 
  world, 
  queries, 
  createEntityId, 
  resetWorld,
  type Entity,
  type TransformComponent,
  type VelocityComponent,
  type OrbitalComponent,
  type PulseComponent,
  type GlowComponent,
  type TrailComponent,
  type ParticleComponent,
  type InstancedComponent,
  type MaterialComponent,
  type HelixComponent,
  type GalaxyComponent,
  type FloatComponent,
  type WaveComponent,
  type ConnectionComponent,
  type RingComponent,
  type CrystalComponent
} from './world';

// Systems
export {
  velocitySystem,
  orbitalSystem,
  pulseSystem,
  floatSystem,
  waveSystem,
  helixSystem,
  galaxySystem,
  ringSystem,
  particleLifecycleSystem,
  glowSystem,
  crystalSystem,
  updateAllSystems,
  updateInstancedMeshMatrices
} from './systems';

// Factories
export {
  createCoreCrystal,
  createOrbitalRing,
  createOrbitingSphere,
  createHelixParticle,
  createGalaxyParticle,
  createFloatingLight,
  createAbstractTower,
  createOrbiterBatch,
  createHelixBatch,
  createGalaxyBatch,
  createFloatingLightsBatch,
  createTowerBatch
} from './factories';

// Hooks
export {
  useECSSystems,
  useECSWorld,
  useInstancedECS,
  useFilteredInstancedECS,
  useEntityTransform,
  useEntityGlow,
  useEntityFactory,
  useBatchEntities,
  useCameraFollowEntity,
  useCinematicCamera,
  useECSQueries
} from './hooks';
