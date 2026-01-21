import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";
import { Project } from "@/data/projects";

import planetBlueTexture from "@/assets/planet_albedo_blue.jpg";
import planetPurpleTexture from "@/assets/planet_albedo_purple.jpg";

interface PlanetProps {
  project: Project;
  isHovered: boolean;
  isActive: boolean;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
}

// Fresnel rim shader material
const FresnelMaterial = () => {
  return useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color("#4fc3f7") },
        intensity: { value: 1.5 },
        power: { value: 2.0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float intensity;
        uniform float power;
        
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        
        void main() {
          vec3 viewDir = normalize(vViewPosition);
          float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), power);
          gl_FragColor = vec4(color * fresnel * intensity, fresnel * 0.8);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
    });
  }, []);
};

export function Planet({ project, isHovered, isActive, onHover, onClick }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Load textures
  const blueTexture = useLoader(TextureLoader, planetBlueTexture);
  const purpleTexture = useLoader(TextureLoader, planetPurpleTexture);

  // Choose texture based on planet role (keeps the look consistent with the camera rail)
  const texture = project.id === "origin" || project.id === "syntax" ? blueTexture : purpleTexture;

  const color = new THREE.Color(project.color);
  const fresnelMaterial = FresnelMaterial();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Slow rotation
      meshRef.current.rotation.y += delta * 0.1;
      
      // Hover effect - pulse
      if (isHovered || isActive) {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(
          meshRef.current.scale.x, 
          1.15, 
          delta * 3
        ));
      } else {
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(
          meshRef.current.scale.x, 
          1, 
          delta * 3
        ));
      }
    }

    if (glowRef.current) {
      // Update glow color
      (glowRef.current.material as THREE.ShaderMaterial).uniforms.color.value = color;
      
      // Pulse intensity on hover
      const targetIntensity = isHovered || isActive ? 2.5 : 1.5;
      const currentIntensity = (glowRef.current.material as THREE.ShaderMaterial).uniforms.intensity.value;
      (glowRef.current.material as THREE.ShaderMaterial).uniforms.intensity.value = THREE.MathUtils.lerp(
        currentIntensity,
        targetIntensity,
        delta * 3
      );
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      ringRef.current.rotation.z += delta * 0.2;
    }
  });

  return (
    <group position={project.position}>
      {/* Main planet sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={isHovered || isActive ? 0.3 : 0.1}
        />
      </mesh>

      {/* Fresnel glow rim */}
      <mesh ref={glowRef} material={fresnelMaterial}>
        <sphereGeometry args={[1.7, 64, 64]} />
      </mesh>

      {/* Orbital ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.02, 16, 100]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.4} />
      </mesh>

      {/* Point light for local illumination */}
      <pointLight
        color={project.color}
        intensity={isHovered || isActive ? 2 : 0.5}
        distance={10}
      />
    </group>
  );
}
