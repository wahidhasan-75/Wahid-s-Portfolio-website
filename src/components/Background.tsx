import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

import starfieldTexture from "@/assets/bg_starfield_void.jpg";
import nebulaTexture from "@/assets/bg_nebula_fog.jpg";

interface BackgroundProps {
  progress: number;
}

// Starfield particles
function Starfield({ count = 2000 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Distribute stars in a large box
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300 - 50;
      
      // Random sizes
      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, sizes };
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      // Very slow rotation for parallax
      points.current.rotation.y = state.clock.elapsedTime * 0.01;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particlesPosition.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Cosmic dust particles
function CosmicDust({ count = 500, progress }: { count?: number; progress: number }) {
  const points = useRef<THREE.Points>(null);

  const particlesData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color("#4fc3f7"),
      new THREE.Color("#ba68c8"),
      new THREE.Color("#4db6ac"),
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = -progress * 100 + (Math.random() - 0.5) * 100;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, [count, Math.floor(progress * 5)]); // Update in chunks

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particlesData.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Background({ progress }: BackgroundProps) {
  const starfieldBgRef = useRef<THREE.Mesh>(null);
  const nebulaBgRef = useRef<THREE.Mesh>(null);

  const starfieldTex = useLoader(TextureLoader, starfieldTexture);
  const nebulaTex = useLoader(TextureLoader, nebulaTexture);

  useFrame((state) => {
    // Subtle background movement
    if (starfieldBgRef.current) {
      starfieldBgRef.current.position.z = -150 - progress * 50;
      starfieldBgRef.current.rotation.z = state.clock.elapsedTime * 0.002;
    }
    if (nebulaBgRef.current) {
      nebulaBgRef.current.position.z = -120 - progress * 30;
      // Fade in nebula during Acts 2-3
      const opacity = progress > 0.16 && progress < 0.62 
        ? Math.sin((progress - 0.16) * Math.PI / 0.46) * 0.4 
        : 0;
      (nebulaBgRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <>
      {/* Static starfield background */}
      <mesh ref={starfieldBgRef} position={[0, 0, -150]}>
        <planeGeometry args={[300, 200]} />
        <meshBasicMaterial
          map={starfieldTex}
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>

      {/* Nebula fog overlay */}
      <mesh ref={nebulaBgRef} position={[0, 0, -120]}>
        <planeGeometry args={[250, 150]} />
        <meshBasicMaterial
          map={nebulaTex}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Particle systems */}
      <Starfield count={3000} />
      <CosmicDust count={800} progress={progress} />

      {/* Ambient fog */}
      <fog attach="fog" args={["#050510", 30, 150]} />
    </>
  );
}
