import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SyntaxCluster } from "@/data/projects";

interface SyntaxSystemsProps {
  clusters: SyntaxCluster[];
  color: string;
  visible: boolean;
}

function tubeBetween(a: THREE.Vector3, b: THREE.Vector3) {
  const curve = new THREE.CatmullRomCurve3([a, b]);
  return new THREE.TubeGeometry(curve, 1, 0.012, 8, false);
}

export function SyntaxSystems({ clusters, color, visible }: SyntaxSystemsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tint = useMemo(() => new THREE.Color(color), [color]);

  const nodes = useMemo(() => {
    const items = clusters.length
      ? clusters
      : [
          { id: "sys-render", name: "Render" },
          { id: "sys-interface", name: "Interface" },
          { id: "sys-data", name: "Data" },
          { id: "sys-logic", name: "Logic" },
          { id: "sys-ops", name: "Ops" },
          { id: "sys-learning", name: "Learning" },
        ];

    const positions = items.map((c, i) => {
      const angle = (i / items.length) * Math.PI * 2;
      const radius = 3.6 + (i % 2) * 0.7;
      return {
        id: (c as any).id as string,
        label: (c as any).name as string,
        pos: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * 0.8,
          Math.sin(angle) * radius
        ),
      };
    });

    const links: Array<[number, number]> = [];
    for (let i = 0; i < positions.length; i++) {
      links.push([i, (i + 1) % positions.length]);
      if (i % 2 === 0) links.push([i, (i + 2) % positions.length]);
    }

    return { positions, links };
  }, [clusters]);

  useFrame((state, delta) => {
    if (!visible) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef}>
      {/* Connections */}
      {nodes.links.map(([a, b], idx) => {
        const start = nodes.positions[a].pos;
        const end = nodes.positions[b].pos;
        const geom = tubeBetween(start, end);
        return (
          <mesh key={`l-${idx}`} geometry={geom}>
            <meshBasicMaterial color={tint} transparent opacity={0.22} />
          </mesh>
        );
      })}

      {/* Nodes */}
      {nodes.positions.map((n, idx) => (
        <group key={n.id} position={n.pos.toArray() as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshBasicMaterial color={tint} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshBasicMaterial color={tint} transparent opacity={0.12} blending={THREE.AdditiveBlending} />
          </mesh>
          <pointLight color={tint} intensity={0.9} distance={4} />
        </group>
      ))}

      {/* A faint shell */}
      <mesh>
        <sphereGeometry args={[4.6, 32, 32]} />
        <meshBasicMaterial color={tint} transparent opacity={0.04} />
      </mesh>
    </group>
  );
}
