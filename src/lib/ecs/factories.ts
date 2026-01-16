import * as THREE from 'three';
import { world, createEntityId, Entity } from './world';

// ============================================
// ENTITY FACTORIES - Professional Entity Creation
// ============================================

// Create a core crystal entity
export function createCoreCrystal(options: {
  position?: THREE.Vector3;
  size?: number;
  color?: THREE.Color;
  iridescence?: number;
} = {}): Entity {
  const {
    position = new THREE.Vector3(0, 0, 0),
    size = 1.5,
    color = new THREE.Color('#ffffff'),
    iridescence = 1
  } = options;

  const entity = world.add({
    id: createEntityId('core'),
    transform: {
      position: position.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(size, size, size)
    },
    pulse: {
      baseScale: size,
      amplitude: size * 0.1,
      frequency: 0.5,
      phase: 0
    },
    glow: {
      color: color.clone(),
      intensity: 1,
      pulseSpeed: 2
    },
    crystal: {
      facets: 20,
      iridescence,
      refractionIndex: 1.5
    },
    isCore: true
  });

  return entity;
}

// Create orbital ring entity
export function createOrbitalRing(options: {
  radius?: number;
  thickness?: number;
  color?: THREE.Color;
  rotationSpeed?: number;
  tilt?: number;
} = {}): Entity {
  const {
    radius = 2.5,
    thickness = 0.02,
    color = new THREE.Color('#ff00ff'),
    rotationSpeed = 0.3,
    tilt = 0
  } = options;

  const entity = world.add({
    id: createEntityId('ring'),
    transform: {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
      scale: new THREE.Vector3(1, 1, 1)
    },
    ring: {
      innerRadius: radius,
      outerRadius: radius + thickness,
      rotationSpeed,
      tilt
    },
    glow: {
      color: color.clone(),
      intensity: 2,
      pulseSpeed: 1
    }
  });

  return entity;
}

// Create orbiting sphere entity
export function createOrbitingSphere(options: {
  center?: THREE.Vector3;
  radius?: number;
  size?: number;
  speed?: number;
  phase?: number;
  color?: THREE.Color;
  instanceId?: number;
} = {}): Entity {
  const {
    center = new THREE.Vector3(0, 0, 0),
    radius = 3,
    size = 0.15,
    speed = 0.5,
    phase = 0,
    color = new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
    instanceId = 0
  } = options;

  const entity = world.add({
    id: createEntityId('orbiter'),
    transform: {
      position: new THREE.Vector3(
        center.x + Math.cos(phase) * radius,
        center.y,
        center.z + Math.sin(phase) * radius
      ),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(size, size, size)
    },
    orbital: {
      center: center.clone(),
      radius,
      speed,
      phase,
      axis: 'xz'
    },
    glow: {
      color: color.clone(),
      intensity: 1,
      pulseSpeed: 2
    },
    instanced: {
      meshId: 'orbiters',
      instanceId
    },
    isOrbiter: true,
    needsMatrixUpdate: true
  });

  return entity;
}

// Create helix particle entity
export function createHelixParticle(options: {
  strand: 1 | 2;
  index: number;
  totalCount: number;
  helixRadius?: number;
  helixHeight?: number;
  rotationSpeed?: number;
  size?: number;
  color?: THREE.Color;
  instanceId?: number;
} = { strand: 1, index: 0, totalCount: 100 }): Entity {
  const {
    strand,
    index,
    totalCount,
    helixRadius = 3,
    helixHeight = 20,
    rotationSpeed = 0.5,
    size = 0.2,
    color = strand === 1 ? new THREE.Color('#ff00ff') : new THREE.Color('#00ffff'),
    instanceId = index
  } = options;

  const t = (index / totalCount) * Math.PI * 8;
  const strandOffset = strand === 2 ? Math.PI : 0;

  const entity = world.add({
    id: createEntityId(`helix_${strand}`),
    transform: {
      position: new THREE.Vector3(
        Math.cos(t + strandOffset) * helixRadius,
        (index / totalCount) * helixHeight - helixHeight / 2,
        Math.sin(t + strandOffset) * helixRadius
      ),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(size, size, size)
    },
    helix: {
      strand,
      index,
      totalCount,
      helixRadius,
      helixHeight,
      rotationSpeed
    },
    glow: {
      color: color.clone(),
      intensity: 0.5,
      pulseSpeed: 2
    },
    instanced: {
      meshId: `helix_strand_${strand}`,
      instanceId
    },
    isParticle: true,
    needsMatrixUpdate: true
  });

  return entity;
}

// Create galaxy particle entity
export function createGalaxyParticle(options: {
  arm?: number;
  distanceFromCenter?: number;
  armSpread?: number;
  verticalSpread?: number;
  rotationSpeed?: number;
  size?: number;
  color?: THREE.Color;
  instanceId?: number;
} = {}): Entity {
  const {
    arm = Math.floor(Math.random() * 4),
    distanceFromCenter = 2 + Math.random() * 18,
    armSpread = 1 + Math.random() * 2,
    verticalSpread = (1 - distanceFromCenter / 20) * 2,
    rotationSpeed = 0.1 + Math.random() * 0.15,
    size = 0.02 + Math.random() * 0.04,
    color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.3),
    instanceId = 0
  } = options;

  const armAngle = (arm / 4) * Math.PI * 2;
  const spiralAngle = armAngle + distanceFromCenter * 0.5;

  const entity = world.add({
    id: createEntityId('galaxy'),
    transform: {
      position: new THREE.Vector3(
        Math.cos(spiralAngle) * distanceFromCenter + (Math.random() - 0.5) * armSpread,
        (Math.random() - 0.5) * verticalSpread,
        Math.sin(spiralAngle) * distanceFromCenter + (Math.random() - 0.5) * armSpread
      ),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(size, size, size)
    },
    galaxy: {
      arm,
      distanceFromCenter,
      armSpread,
      verticalSpread,
      rotationSpeed
    },
    instanced: {
      meshId: 'galaxy_particles',
      instanceId
    },
    isParticle: true,
    needsMatrixUpdate: true
  });

  return entity;
}

// Create floating light entity
export function createFloatingLight(options: {
  position?: THREE.Vector3;
  size?: number;
  color?: THREE.Color;
  floatAmplitude?: number;
  floatSpeed?: number;
  instanceId?: number;
} = {}): Entity {
  const {
    position = new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      2 + Math.random() * 6,
      (Math.random() - 0.5) * 30
    ),
    size = 0.1 + Math.random() * 0.1,
    color = new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
    floatAmplitude = 0.5 + Math.random() * 1,
    floatSpeed = 0.5 + Math.random() * 1,
    instanceId = 0
  } = options;

  const entity = world.add({
    id: createEntityId('light'),
    transform: {
      position: position.clone(),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(size, size, size)
    },
    float: {
      amplitude: new THREE.Vector3(0, floatAmplitude, 0),
      frequency: new THREE.Vector3(0, floatSpeed, 0),
      phase: new THREE.Vector3(0, Math.random() * Math.PI * 2, 0)
    },
    glow: {
      color: color.clone(),
      intensity: 2,
      pulseSpeed: 1
    },
    instanced: {
      meshId: 'floating_lights',
      instanceId
    },
    isLight: true,
    needsMatrixUpdate: true
  });

  return entity;
}

// Create abstract tower entity
export function createAbstractTower(options: {
  position?: THREE.Vector3;
  height?: number;
  width?: number;
  pulsePhase?: number;
  instanceId?: number;
} = {}): Entity {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 12;
  
  const {
    position = new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    ),
    height = 1 + Math.random() * 8,
    width = 0.3 + Math.random() * 0.5,
    pulsePhase = Math.random() * Math.PI * 2,
    instanceId = 0
  } = options;

  const entity = world.add({
    id: createEntityId('tower'),
    transform: {
      position: new THREE.Vector3(position.x, height / 2, position.z),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(width, height, width)
    },
    wave: {
      amplitude: 0.5,
      frequency: 1,
      waveSpeed: 2,
      waveOffset: pulsePhase
    },
    pulse: {
      baseScale: 1,
      amplitude: 0.1,
      frequency: 2,
      phase: pulsePhase
    },
    instanced: {
      meshId: 'towers',
      instanceId
    },
    isStructure: true,
    needsMatrixUpdate: true
  });

  return entity;
}

// Batch creation utilities
export function createOrbiterBatch(count: number, options: Partial<Parameters<typeof createOrbitingSphere>[0]> = {}) {
  const entities: Entity[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radiusVariation = 3 + Math.random() * 0.5;
    const yOffset = (Math.random() - 0.5) * 2;
    
    entities.push(createOrbitingSphere({
      ...options,
      radius: radiusVariation,
      phase: angle,
      speed: 0.3 + Math.random() * 0.2,
      size: 0.1 + Math.random() * 0.15,
      color: new THREE.Color().setHSL(i / count, 0.8, 0.5),
      instanceId: i
    }));
  }
  return entities;
}

export function createHelixBatch(strandCount: number, particlesPerStrand: number) {
  const entities: Entity[] = [];
  
  for (let strand = 1; strand <= 2; strand++) {
    for (let i = 0; i < particlesPerStrand; i++) {
      entities.push(createHelixParticle({
        strand: strand as 1 | 2,
        index: i,
        totalCount: particlesPerStrand,
        instanceId: i
      }));
    }
  }
  
  return entities;
}

export function createGalaxyBatch(count: number) {
  const entities: Entity[] = [];
  
  for (let i = 0; i < count; i++) {
    entities.push(createGalaxyParticle({
      instanceId: i
    }));
  }
  
  return entities;
}

export function createFloatingLightsBatch(count: number) {
  const entities: Entity[] = [];
  
  for (let i = 0; i < count; i++) {
    entities.push(createFloatingLight({
      instanceId: i
    }));
  }
  
  return entities;
}

export function createTowerBatch(count: number) {
  const entities: Entity[] = [];
  
  for (let i = 0; i < count; i++) {
    entities.push(createAbstractTower({
      instanceId: i
    }));
  }
  
  return entities;
}
