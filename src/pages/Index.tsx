import { useState, useCallback } from "react";
import { Experience } from "@/scene/Experience";
import { OverlayHUD } from "@/components/OverlayHUD";

const Index = () => {
  const [progress, setProgress] = useState(0);
  const [currentAct, setCurrentAct] = useState(1);
  const [isOrbitMode, setIsOrbitMode] = useState(false);
  const [shouldExitOrbit, setShouldExitOrbit] = useState(false);

  const handleExitOrbit = useCallback(() => {
    setShouldExitOrbit(true);
    setTimeout(() => setShouldExitOrbit(false), 100);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {/* 3D Experience */}
      <Experience
        onProgressChange={setProgress}
        onActChange={setCurrentAct}
        onOrbitModeChange={setIsOrbitMode}
        exitOrbit={shouldExitOrbit}
      />

      {/* Overlay HUD */}
      <OverlayHUD
        progress={progress}
        act={currentAct}
        isOrbitMode={isOrbitMode}
        onExitOrbit={handleExitOrbit}
      />

      {/* Act-specific text overlays */}
      {currentAct === 1 && progress < 0.1 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-center animate-pulse-slow">
            <h1 className="font-display text-6xl md:text-8xl text-foreground text-glow-strong tracking-widest mb-4">
              Wahid's Multiverse
            </h1>
            <p className="font-body text-lg text-muted-foreground tracking-wide">
              Scroll forward. Click to enter a world.
            </p>
          </div>
        </div>
      )}

      {currentAct === 5 && !isOrbitMode && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-center">
            <p className="font-display text-2xl text-primary/60 tracking-[0.3em] animate-pulse-slow">
              STILL BECOMING
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
