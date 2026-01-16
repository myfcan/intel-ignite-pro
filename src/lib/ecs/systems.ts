import * as THREE from 'three';
import { queries, Entity } from './world';

// ============================================
// ECS SYSTEMS - Update Logic
// ============================================

const tempMatrix = new THREE.Matrix4();
const tempVector = new THREE.Vector3();
const tempQuaternion = new THREE.Quaternion();

// Velocity System - Updates positions based on velocity
export function velocitySystem(deltaTime: number) {
  for (const entity of queries.moving) {
    const { transform, velocity } = entity;
    
    // Update position
    transform.position.x += velocity.linear.x * deltaTime;
    transform.position.y += velocity.linear.y * deltaTime;
    transform.position.z += velocity.linear.z * deltaTime;
    
    // Update rotation
    transform.rotation.x += velocity.angular.x * deltaTime;
    transform.rotation.y += velocity.angular.y * deltaTime;
    transform.rotation.z += velocity.angular.z * deltaTime;
  }
}

// Orbital System - Updates entities orbiting around a center
export function orbitalSystem(time: number) {
  for (const entity of queries.orbiting) {
    const { transform, orbital } = entity;
    const t = time * orbital.speed + orbital.phase;
    
    switch (orbital.axis) {
      case 'x':
        transform.position.y = orbital.center.y + Math.cos(t) * orbital.radius;
        transform.position.z = orbital.center.z + Math.sin(t) * orbital.radius;
        transform.position.x = orbital.center.x;
        break;
      case 'y':
        transform.position.x = orbital.center.x + Math.cos(t) * orbital.radius;
        transform.position.z = orbital.center.z + Math.sin(t) * orbital.radius;
        transform.position.y = orbital.center.y;
        break;
      case 'z':
        transform.position.x = orbital.center.x + Math.cos(t) * orbital.radius;
        transform.position.y = orbital.center.y + Math.sin(t) * orbital.radius;
        transform.position.z = orbital.center.z;
        break;
      case 'xz':
        transform.position.x = orbital.center.x + Math.cos(t) * orbital.radius;
        transform.position.z = orbital.center.z + Math.sin(t) * orbital.radius;
        transform.position.y = orbital.center.y + Math.sin(t * 0.5) * orbital.radius * 0.2;
        break;
    }
  }
}

// Pulse System - Updates scale based on pulse parameters
export function pulseSystem(time: number) {
  for (const entity of queries.pulsing) {
    const { transform, pulse } = entity;
    const t = time * pulse.frequency + pulse.phase;
    const scale = pulse.baseScale + Math.sin(t) * pulse.amplitude;
    
    transform.scale.setScalar(scale);
  }
}

// Float System - Gentle floating motion
export function floatSystem(time: number) {
  for (const entity of queries.floating) {
    const { transform, float } = entity;
    
    const offsetX = Math.sin(time * float.frequency.x + float.phase.x) * float.amplitude.x;
    const offsetY = Math.sin(time * float.frequency.y + float.phase.y) * float.amplitude.y;
    const offsetZ = Math.sin(time * float.frequency.z + float.phase.z) * float.amplitude.z;
    
    // Store base position in userData if not already stored
    if (!(entity as any)._basePosition) {
      (entity as any)._basePosition = transform.position.clone();
    }
    
    const base = (entity as any)._basePosition as THREE.Vector3;
    transform.position.set(
      base.x + offsetX,
      base.y + offsetY,
      base.z + offsetZ
    );
  }
}

// Wave System - Wave-like motion
export function waveSystem(time: number) {
  for (const entity of queries.waving) {
    const { transform, wave } = entity;
    const t = time * wave.waveSpeed + wave.waveOffset;
    const offset = Math.sin(t) * wave.amplitude;
    
    transform.position.y += offset;
  }
}

// Helix System - DNA helix motion
export function helixSystem(time: number) {
  for (const entity of queries.helixParticles) {
    const { transform, helix } = entity;
    const t = (helix.index / helix.totalCount) * Math.PI * 8 + time * helix.rotationSpeed;
    const strandOffset = helix.strand === 2 ? Math.PI : 0;
    
    transform.position.x = Math.cos(t + strandOffset) * helix.helixRadius;
    transform.position.y = (helix.index / helix.totalCount) * helix.helixHeight - helix.helixHeight / 2;
    transform.position.z = Math.sin(t + strandOffset) * helix.helixRadius;
  }
}

// Galaxy System - Spiral galaxy motion
export function galaxySystem(time: number) {
  for (const entity of queries.galaxyParticles) {
    const { transform, galaxy } = entity;
    
    // Spiral arm calculation
    const armAngle = (galaxy.arm / 4) * Math.PI * 2;
    const spiralAngle = armAngle + galaxy.distanceFromCenter * 0.5 + time * galaxy.rotationSpeed;
    
    transform.position.x = Math.cos(spiralAngle) * galaxy.distanceFromCenter + 
      (Math.random() - 0.5) * galaxy.armSpread * 0.01; // Slight jitter
    transform.position.z = Math.sin(spiralAngle) * galaxy.distanceFromCenter + 
      (Math.random() - 0.5) * galaxy.armSpread * 0.01;
    transform.position.y = Math.sin(time * 0.5 + galaxy.distanceFromCenter) * galaxy.verticalSpread;
  }
}

// Ring System - Rotating rings
export function ringSystem(time: number) {
  for (const entity of queries.rings) {
    const { transform, ring } = entity;
    
    transform.rotation.z = time * ring.rotationSpeed;
    transform.rotation.x = ring.tilt;
  }
}

// Particle Lifecycle System
export function particleLifecycleSystem(deltaTime: number) {
  const toRemove: Entity[] = [];
  
  for (const entity of queries.particles) {
    const { particle } = entity;
    
    particle.age += deltaTime;
    
    if (particle.age >= particle.lifetime) {
      toRemove.push(entity);
    }
  }
  
  // Remove dead particles (would need world reference)
  // toRemove.forEach(entity => world.remove(entity));
}

// Glow System - Updates glow intensity
export function glowSystem(time: number) {
  for (const entity of queries.glowing) {
    const { glow } = entity;
    glow.intensity = 0.5 + Math.sin(time * glow.pulseSpeed) * 0.3;
  }
}

// Crystal System - Crystal rotation
export function crystalSystem(time: number) {
  for (const entity of queries.crystals) {
    const { transform } = entity;
    transform.rotation.y = time * 0.2;
    transform.rotation.x = Math.sin(time * 0.3) * 0.1;
  }
}

// Master Update System - Runs all systems
export function updateAllSystems(time: number, deltaTime: number) {
  velocitySystem(deltaTime);
  orbitalSystem(time);
  pulseSystem(time);
  floatSystem(time);
  waveSystem(time);
  helixSystem(time);
  galaxySystem(time);
  ringSystem(time);
  glowSystem(time);
  crystalSystem(time);
  particleLifecycleSystem(deltaTime);
}

// Utility: Update instanced mesh matrices
export function updateInstancedMeshMatrices(
  meshRef: React.RefObject<THREE.InstancedMesh>,
  entities: Iterable<Entity>
) {
  if (!meshRef.current) return;
  
  let index = 0;
  for (const entity of entities) {
    const { transform, instanced } = entity;
    if (!instanced) continue;
    
    tempMatrix.compose(
      transform.position,
      tempQuaternion.setFromEuler(transform.rotation),
      transform.scale
    );
    
    meshRef.current.setMatrixAt(instanced.instanceId, tempMatrix);
    index++;
  }
  
  meshRef.current.instanceMatrix.needsUpdate = true;
}
