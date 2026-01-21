import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AwakeShardsProps {
  progress: number; // 0.16 - 0.32 range
}

export function AwakeShards({ progress }: AwakeShardsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<THREE.InstancedMesh>(null);

  const shardCount = 50;
  
  const shardData = useMemo(() => {
    const data = [];
    for (let i = 0; i < shardCount; i++) {
      data.push({
        initialPos: new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20 - 10
        ),
        targetPos: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          -5
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        rotationSpeed: Math.random() * 2 + 0.5,
        scale: Math.random() * 0.5 + 0.2,
        color: new THREE.Color().setHSL(
          0.5 + Math.random() * 0.2, // Cyan to blue
          0.8,
          0.5 + Math.random() * 0.3
        ),
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (!shardsRef.current || !groupRef.current) return;

    // Calculate local progress within awakening act
    const localProgress = Math.max(0, Math.min(1, (progress - 0.16) / 0.16));
    
    const dummy = new THREE.Object3D();

    for (let i = 0; i < shardCount; i++) {
      const shard = shardData[i];
      
      // Lerp from scattered to assembled based on progress
      const pos = new THREE.Vector3().lerpVectors(
        shard.initialPos,
        shard.targetPos,
        localProgress
      );

      // Add some floating motion
      pos.x += Math.sin(state.clock.elapsedTime * shard.rotationSpeed + i) * 0.3 * (1 - localProgress);
      pos.y += Math.cos(state.clock.elapsedTime * shard.rotationSpeed * 0.7 + i) * 0.2 * (1 - localProgress);

      dummy.position.copy(pos);
      
      // Rotation
      dummy.rotation.x = shard.rotation.x + state.clock.elapsedTime * shard.rotationSpeed * 0.5;
      dummy.rotation.y = shard.rotation.y + state.clock.elapsedTime * shard.rotationSpeed * 0.3;
      
      // Scale - grow as they assemble
      const scale = shard.scale * (0.5 + localProgress * 0.5);
      dummy.scale.setScalar(scale);

      dummy.updateMatrix();
      shardsRef.current.setMatrixAt(i, dummy.matrix);
      shardsRef.current.setColorAt(i, shard.color);
    }

    shardsRef.current.instanceMatrix.needsUpdate = true;
    if (shardsRef.current.instanceColor) {
      shardsRef.current.instanceColor.needsUpdate = true;
    }

    // Move group forward with camera
    groupRef.current.position.z = -5 - (progress - 0.16) * 30;
  });

  // Only render during awakening act
  if (progress < 0.14 || progress > 0.35) return null;

  return (
    <group ref={groupRef}>
      <instancedMesh ref={shardsRef} args={[undefined, undefined, shardCount]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.8}
          emissive="#4fc3f7"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </instancedMesh>

      {/* Central light during assembly */}
      <pointLight
        color="#4fc3f7"
        intensity={2 * Math.max(0, (progress - 0.16) / 0.16)}
        distance={20}
      />
    </group>
  );
}
