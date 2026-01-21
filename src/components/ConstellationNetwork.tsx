import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

import constellationTexture from "@/assets/constellation_network.jpg";

interface ConstellationNetworkProps {
  progress: number; // 0.62 - 0.80 range
}

// Node in the constellation
function ConstellationNode({ 
  position, 
  color, 
  isActive 
}: { 
  position: [number, number, number]; 
  color: string;
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.3 + 1;
      meshRef.current.scale.setScalar(isActive ? 1.5 : pulse * 0.8);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight color={color} intensity={isActive ? 2 : 0.5} distance={5} />
    </group>
  );
}

// Connection line between nodes
function ConnectionLine({ 
  start, 
  end, 
  color 
}: { 
  start: THREE.Vector3; 
  end: THREE.Vector3;
  color: string;
}) {
  const points = useMemo(() => {
    return new Float32Array([
      start.x, start.y, start.z,
      end.x, end.y, end.z,
    ]);
  }, [start, end]);

  return (
    <mesh>
      <tubeGeometry args={[
        new THREE.CatmullRomCurve3([start, end]),
        1,
        0.02,
        8,
        false
      ]} />
      <meshBasicMaterial color={color} transparent opacity={0.4} />
    </mesh>
  );
}

export function ConstellationNetwork({ progress }: ConstellationNetworkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bgPlaneRef = useRef<THREE.Mesh>(null);

  const texture = useLoader(TextureLoader, constellationTexture);

  // Generate constellation nodes
  const nodes = useMemo(() => {
    const nodeData = [];
    const nodeCount = 12;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 8 + Math.random() * 5;
      nodeData.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.6 + (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 10 - 55,
        ] as [number, number, number],
        color: ["#4fc3f7", "#ba68c8", "#4db6ac", "#ff8a65"][i % 4],
      });
    }

    return nodeData;
  }, []);

  // Generate connections
  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodes.length; i++) {
      // Connect to 2-3 nearest nodes
      const connectCount = Math.floor(Math.random() * 2) + 2;
      for (let j = 0; j < connectCount; j++) {
        const targetIdx = (i + j + 1) % nodes.length;
        conns.push({
          start: new THREE.Vector3(...nodes[i].position),
          end: new THREE.Vector3(...nodes[targetIdx].position),
          color: nodes[i].color,
        });
      }
    }
    return conns;
  }, [nodes]);

  useFrame(() => {
    if (groupRef.current) {
      // Subtle rotation
      groupRef.current.rotation.z += 0.0005;
    }

    if (bgPlaneRef.current) {
      // Fade based on progress
      const localProgress = (progress - 0.62) / 0.18;
      const opacity = Math.min(1, localProgress * 2) * 0.4;
      (bgPlaneRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  // Only visible during intelligence act
  if (progress < 0.58 || progress > 0.85) return null;

  const localProgress = (progress - 0.62) / 0.18;

  return (
    <group ref={groupRef}>
      {/* Background constellation texture */}
      <mesh ref={bgPlaneRef} position={[0, 0, -70]}>
        <planeGeometry args={[100, 60]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <ConstellationNode
          key={i}
          position={node.position}
          color={node.color}
          isActive={localProgress > 0.5}
        />
      ))}

      {/* Connections - fade in progressively */}
      {connections.slice(0, Math.floor(connections.length * localProgress)).map((conn, i) => (
        <ConnectionLine
          key={i}
          start={conn.start}
          end={conn.end}
          color={conn.color}
        />
      ))}
    </group>
  );
}
