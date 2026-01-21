import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AscentMilestone, Certificate } from "@/data/projects";

interface AscentTrajectoryProps {
  color: string;
  milestones: AscentMilestone[];
  certificates: Certificate[];
  visible: boolean;
}

export function AscentTrajectory({ color, milestones, certificates, visible }: AscentTrajectoryProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tint = useMemo(() => new THREE.Color(color), [color]);

  const points = useMemo(() => {
    const count = Math.max(4, milestones.length + certificates.length);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, 0.2, 0.2),
      new THREE.Vector3(1.5, 1.4, -1.2),
      new THREE.Vector3(-0.6, 2.8, -2.8),
      new THREE.Vector3(0.8, 4.4, -4.6),
    ]);
    return {
      curve,
      samples: Array.from({ length: count }, (_, i) => curve.getPoint(i / (count - 1))),
    };
  }, [milestones.length, certificates.length]);

  const tube = useMemo(() => new THREE.TubeGeometry(points.curve, 80, 0.03, 12, false), [points.curve]);

  useFrame((state) => {
    if (!visible) return;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.12;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[0, 0.8, 0]}>
      <mesh geometry={tube}>
        <meshBasicMaterial color={tint} transparent opacity={0.28} />
      </mesh>

      {points.samples.map((p, idx) => (
        <group key={idx} position={p.toArray() as [number, number, number]}>
          <mesh>
            <icosahedronGeometry args={[0.14, 0]} />
            <meshStandardMaterial
              color={tint}
              emissive={tint}
              emissiveIntensity={0.65}
              roughness={0.25}
              metalness={0.7}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshBasicMaterial color={tint} transparent opacity={0.12} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight color={tint} intensity={1.2} distance={4} />
        </group>
      ))}
    </group>
  );
}
