import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface OriginSparkProps {
  visible: boolean;
}

export function OriginSpark({ visible }: OriginSparkProps) {
  const sparkRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const sparkData = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Particles emanating from center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3;
      positions[i * 3] = Math.cos(angle) * radius * 0.3;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      // Cyan to white gradient
      const t = Math.random();
      colors[i * 3] = 0.3 + t * 0.7;
      colors[i * 3 + 1] = 0.8 + t * 0.2;
      colors[i * 3 + 2] = 1;

      sizes[i] = Math.random() * 3 + 1;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (!visible) return;

    if (sparkRef.current) {
      sparkRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      sparkRef.current.scale.setScalar(scale);
    }

    if (coreRef.current) {
      // Breathing glow
      const intensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
      (coreRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, 0, 5]}>
      {/* Central core glow */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Spark particles */}
      <points ref={sparkRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkData.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[sparkData.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Point light */}
      <pointLight color="#4fc3f7" intensity={2} distance={10} />
    </group>
  );
}
