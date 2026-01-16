import { useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { world, queries, resetWorld, Entity } from './world';
import { updateAllSystems, updateInstancedMeshMatrices } from './systems';

// ============================================
// ECS REACT HOOKS - Integration with R3F
// ============================================

// Hook to run ECS systems every frame
export function useECSSystems() {
  const lastTime = useRef(0);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const deltaTime = time - lastTime.current;
    lastTime.current = time;
    
    updateAllSystems(time, deltaTime);
  });
}

// Hook to manage world lifecycle
export function useECSWorld() {
  useEffect(() => {
    return () => {
      resetWorld();
    };
  }, []);
  
  return world;
}

// Hook to update instanced mesh from ECS entities
export function useInstancedECS(
  meshRef: React.RefObject<THREE.InstancedMesh>,
  queryKey: keyof typeof queries
) {
  useFrame(() => {
    const query = queries[queryKey];
    if (!query || !meshRef.current) return;
    
    const tempMatrix = new THREE.Matrix4();
    const tempQuaternion = new THREE.Quaternion();
    
    let index = 0;
    for (const entity of query) {
      if (!entity.instanced) continue;
      
      tempMatrix.compose(
        entity.transform.position,
        tempQuaternion.setFromEuler(entity.transform.rotation),
        entity.transform.scale
      );
      
      meshRef.current.setMatrixAt(entity.instanced.instanceId, tempMatrix);
      index++;
    }
    
    if (index > 0) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });
}

// Hook for custom instanced mesh update with filter
export function useFilteredInstancedECS(
  meshRef: React.RefObject<THREE.InstancedMesh>,
  meshId: string
) {
  useFrame(() => {
    if (!meshRef.current) return;
    
    const tempMatrix = new THREE.Matrix4();
    const tempQuaternion = new THREE.Quaternion();
    
    for (const entity of queries.instanced) {
      if (entity.instanced?.meshId !== meshId) continue;
      
      tempMatrix.compose(
        entity.transform.position,
        tempQuaternion.setFromEuler(entity.transform.rotation),
        entity.transform.scale
      );
      
      meshRef.current.setMatrixAt(entity.instanced.instanceId, tempMatrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });
}

// Hook for single entity updates
export function useEntityTransform(entity: Entity | null) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!entity || !meshRef.current) return;
    
    meshRef.current.position.copy(entity.transform.position);
    meshRef.current.rotation.copy(entity.transform.rotation);
    meshRef.current.scale.copy(entity.transform.scale);
  });
  
  return meshRef;
}

// Hook to get entity glow data
export function useEntityGlow(entity: Entity | null) {
  const intensity = useRef(1);
  
  useFrame(() => {
    if (!entity?.glow) return;
    intensity.current = entity.glow.intensity;
  });
  
  return intensity;
}

// Hook for creating and cleaning up entities
export function useEntityFactory<T extends Entity>(
  factory: () => T | T[],
  deps: React.DependencyList = []
) {
  const entitiesRef = useRef<Entity[]>([]);
  
  useEffect(() => {
    const result = factory();
    const entities = Array.isArray(result) ? result : [result];
    entitiesRef.current = entities;
    
    return () => {
      entities.forEach(entity => {
        try {
          world.remove(entity);
        } catch (e) {
          // Entity might already be removed
        }
      });
      entitiesRef.current = [];
    };
  }, deps);
  
  return entitiesRef;
}

// Hook for batch entity creation with proper cleanup
export function useBatchEntities(
  createBatch: () => Entity[],
  deps: React.DependencyList = []
) {
  return useEntityFactory(createBatch, deps);
}

// Hook for camera that follows entities
export function useCameraFollowEntity(
  entity: Entity | null,
  offset: THREE.Vector3 = new THREE.Vector3(0, 5, 10)
) {
  useFrame((state) => {
    if (!entity) return;
    
    const targetPosition = entity.transform.position.clone().add(offset);
    state.camera.position.lerp(targetPosition, 0.02);
    state.camera.lookAt(entity.transform.position);
  });
}

// Hook for cinematic camera around scene center
export function useCinematicCamera(options: {
  radius?: number;
  height?: number;
  speed?: number;
  lookAtY?: number;
} = {}) {
  const {
    radius = 12,
    height = 6,
    speed = 0.1,
    lookAtY = 0
  } = options;
  
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    
    state.camera.position.x = Math.sin(t) * radius;
    state.camera.position.z = Math.cos(t) * radius;
    state.camera.position.y = height + Math.sin(t * 0.5) * 2;
    state.camera.lookAt(0, lookAtY, 0);
  });
}

// Export query access for components
export function useECSQueries() {
  return queries;
}
