import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ForgeProject } from "@/data/projects";

interface ForgeSatellitesProps {
  color: string;
  artifacts: ForgeProject[];
  visible: boolean;
}

export function ForgeSatellites({ color, artifacts, visible }: ForgeSatellitesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tint = useMemo(() => new THREE.Color(color), [color]);

  const orbits = useMemo(() => {
    const items = artifacts.length
      ? artifacts
      : Array.from({ length: 5 }, (_, i) => ({ id: `placeholder-${i}`, title: "Artifact", tagline: "" } as ForgeProject));

    return items.map((a, i) => {
      const angle = (i / items.length) * Math.PI * 2;
      const radius = 3.2 + (i % 2) * 0.8;
      const height = (Math.sin(angle * 2) * 0.6);
      return {
        key: a.id,
        baseAngle: angle,
        radius,
        height,
        size: 0.18 + (i % 3) * 0.06,
      };
    });
  }, [artifacts]);

  useFrame((state, delta) => {
    if (!visible) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
      groupRef.current.rotation.z += delta * 0.08;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {orbits.map((o, idx) => (
        <mesh
          key={o.key}
          position={[
            Math.cos(o.baseAngle) * o.radius,
            o.height,
            Math.sin(o.baseAngle) * o.radius,
          ]}
          rotation={[0.2 * idx, 0.4 * idx, 0.1 * idx]}
        >
          <dodecahedronGeometry args={[o.size, 0]} />
          <meshStandardMaterial
            color={tint}
            emissive={tint}
            emissiveIntensity={0.55}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
      ))}

      {/* A soft ring to suggest an orbital workshop */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.8, 0.02, 16, 160]} />
        <meshBasicMaterial color={tint} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
