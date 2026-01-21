import { useRef, useState, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Preload } from "@react-three/drei";
import * as THREE from "three";
import { ScrollDirector } from "./ScrollDirector";
import { CameraRail } from "./CameraRail";
import type { ContactInfo, Project } from "@/data/projects";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Background } from "@/components/Background";
import { Planet } from "@/components/Planet";
import { HologramPanel } from "@/components/HologramPanel";
import { ContactBeacon } from "@/components/ContactBeacon";
import { OriginSpark } from "@/components/OriginSpark";
import { AwakeShards } from "@/components/AwakeShards";
import { ConstellationNetwork } from "@/components/ConstellationNetwork";
import { ForgeSatellites } from "@/components/ForgeSatellites";
import { SyntaxSystems } from "@/components/SyntaxSystems";
import { AscentTrajectory } from "@/components/AscentTrajectory";
import { perfManager } from "@/utils/perf";

interface SceneControllerProps {
  scrollDirector: ScrollDirector;
  cameraRail: CameraRail;
  projects: Project[];
  contactInfo: ContactInfo;
  onProgressChange: (progress: number) => void;
  onActChange: (act: number) => void;
  hoveredPlanet: string | null;
  setHoveredPlanet: (id: string | null) => void;
  activePlanet: string | null;
  setActivePlanet: (id: string | null) => void;
}

function SceneController({
  scrollDirector,
  cameraRail,
  projects,
  contactInfo,
  onProgressChange,
  onActChange,
  hoveredPlanet,
  setHoveredPlanet,
  activePlanet,
  setActivePlanet,
}: SceneControllerProps) {
  const { camera } = useThree();
  const lastActRef = useRef(1);
  const targetPlanetRef = useRef<THREE.Vector3 | null>(null);

  useFrame((state, delta) => {
    perfManager.measureFrame();

    // Update scroll state
    const scrollState = scrollDirector.update();
    const progress = scrollState.progress;
    onProgressChange(progress);

    // Check act changes
    const currentAct = scrollDirector.getActFromProgress(progress);
    if (currentAct !== lastActRef.current) {
      lastActRef.current = currentAct;
      onActChange(currentAct);
    }

    // Camera positioning
    if (activePlanet && targetPlanetRef.current) {
      // Orbit mode - orbit around active planet
      const orbitState = cameraRail.getOrbitState(targetPlanetRef.current, delta);
      camera.position.lerp(orbitState.position, delta * 2);
      const lookAtVec = new THREE.Vector3();
      lookAtVec.lerp(orbitState.lookAt, delta * 2);
      camera.lookAt(targetPlanetRef.current);
      
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, orbitState.fov, delta * 2);
        camera.updateProjectionMatrix();
      }
    } else {
      // Normal rail movement
      const cameraState = cameraRail.getCameraState(progress);
      camera.position.lerp(cameraState.position, delta * 3);
      
      const lookAtVec = new THREE.Vector3();
      lookAtVec.copy(cameraState.lookAt);
      camera.lookAt(lookAtVec);

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, cameraState.fov, delta * 3);
        camera.updateProjectionMatrix();
      }
    }

    // Mouse parallax (subtle)
    const mouseX = (state.pointer.x * 0.5);
    const mouseY = (state.pointer.y * 0.3);
    camera.rotation.y += (mouseX * 0.02 - camera.rotation.y * 0.01) * delta;
    camera.rotation.x += (mouseY * 0.01 - camera.rotation.x * 0.01) * delta;
  });

  const handlePlanetClick = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setActivePlanet(projectId);
      targetPlanetRef.current = new THREE.Vector3(...project.position);
      scrollDirector.setOrbitMode(true);
      cameraRail.resetOrbitAngle();
    }
  }, [projects, setActivePlanet, scrollDirector, cameraRail]);

  const progress = scrollDirector.getProgress();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        color="#ffffff"
      />
      <pointLight position={[0, 0, 10]} intensity={0.3} color="#4fc3f7" />

      {/* Background */}
      <Background progress={progress} />

      {/* Act 1: Origin Spark */}
      <OriginSpark visible={progress < 0.18} />

      {/* Act 2: Awakening Shards */}
      <AwakeShards progress={progress} />

      {/* Planets - visible in Acts 2+ */}
      {progress > 0.2 && projects.map((project) => (
        <Suspense key={project.id} fallback={null}>
          <Planet
            project={project}
            isHovered={hoveredPlanet === project.id}
            isActive={activePlanet === project.id}
            onHover={(hovered) => setHoveredPlanet(hovered ? project.id : null)}
            onClick={() => handlePlanetClick(project.id)}
          />
          {activePlanet === project.id && (
            <group position={project.position}>
              {/* Planet-specific visual metaphors */}
              {project.id === "forge" && (
                <ForgeSatellites
                  color={project.color}
                  artifacts={project.planet.forge?.projects ?? []}
                  visible={true}
                />
              )}
              {project.id === "syntax" && (
                <SyntaxSystems
                  clusters={project.planet.syntax?.clusters ?? []}
                  color={project.color}
                  visible={true}
                />
              )}
              {project.id === "ascent" && (
                <AscentTrajectory
                  color={project.color}
                  milestones={project.planet.ascent?.milestones ?? []}
                  certificates={project.planet.ascent?.certificates ?? []}
                  visible={true}
                />
              )}
              <HologramPanel project={project} visible={true} />
            </group>
          )}
        </Suspense>
      ))}

      {/* Act 4: Constellation Network */}
      <ConstellationNetwork progress={progress} />

      {/* Contact beacon - Act 6 */}
      {progress > 0.9 && (
        <ContactBeacon
          visible={true}
          position={[0, 0, -85]}
          contact={contactInfo}
        />
      )}
    </>
  );
}

interface ExperienceProps {
  onProgressChange: (progress: number) => void;
  onActChange: (act: number) => void;
  onOrbitModeChange: (isOrbit: boolean) => void;
  exitOrbit: boolean;
}

export function Experience({ 
  onProgressChange, 
  onActChange, 
  onOrbitModeChange,
  exitOrbit 
}: ExperienceProps) {
  const portfolio = usePortfolio();
  const [scrollDirector] = useState(() => new ScrollDirector());
  const [cameraRail] = useState(() => new CameraRail());
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [activePlanet, setActivePlanet] = useState<string | null>(null);

  const handleSetActivePlanet = useCallback((id: string | null) => {
    setActivePlanet(id);
    scrollDirector.setOrbitMode(!!id);
    onOrbitModeChange(!!id);
  }, [scrollDirector, onOrbitModeChange]);

  // Handle exit orbit
  useEffect(() => {
    if (exitOrbit && activePlanet) {
      handleSetActivePlanet(null);
      cameraRail.resetOrbitAngle();
    }
  }, [exitOrbit, activePlanet, handleSetActivePlanet, cameraRail]);

  useEffect(() => {
    return () => {
      scrollDirector.destroy();
    };
  }, [scrollDirector]);

  const perfConfig = perfManager.getConfig();

  return (
    <Canvas
      dpr={perfConfig.dpr}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: "#050510" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={60} />
      
      <Suspense fallback={null}>
        <SceneController
          scrollDirector={scrollDirector}
          cameraRail={cameraRail}
          projects={portfolio.projects}
          contactInfo={portfolio.contactInfo}
          onProgressChange={onProgressChange}
          onActChange={onActChange}
          hoveredPlanet={hoveredPlanet}
          setHoveredPlanet={setHoveredPlanet}
          activePlanet={activePlanet}
          setActivePlanet={handleSetActivePlanet}
        />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
