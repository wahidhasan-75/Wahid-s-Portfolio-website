import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortfolio } from "@/hooks/usePortfolio";

interface OverlayHUDProps {
  progress: number;
  act: number;
  isOrbitMode: boolean;
  onExitOrbit?: () => void;
}

const actNames = [
  "",
  "ORIGIN",
  "FORGE",
  "SYNTAX",
  "ASCENT",
  "HORIZON",
  "CONTACT",
];

const actPoetry = [
  "",
  "Not a biography. A frequency.",
  "Where problems become artifacts.",
  "Skills are not listed. They connect.",
  "Trajectory, not trophies.",
  "Still becoming.",
  "One signal in the infinite.",
];

export function OverlayHUD({ progress, act, isOrbitMode, onExitOrbit }: OverlayHUDProps) {
  const [showScrollHint, setShowScrollHint] = useState(true);
  const { brand } = usePortfolio();

  useEffect(() => {
    if (progress > 0.05) {
      setShowScrollHint(false);
    }
  }, [progress]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline opacity-30" />

      {/* Tagline (ONLY first act = ORIGIN) */}
      <AnimatePresence>
        {act === 1 && (
          <motion.div
            key="tagline"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="absolute top-7 inset-x-0 flex justify-center"
          >
            <div className="font-body text-sm md:text-base text-primary/70 italic tracking-wide text-center drop-shadow-[0_0_14px_rgba(79,195,247,0.35)]">

              {brand?.tagline || "Travel through a Universe."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="absolute top-8 left-8 flex flex-col gap-2">
        <div className="w-1 h-32 bg-muted/20 rounded-full overflow-hidden">
          <motion.div
            className="w-full bg-primary rounded-full"
            style={{ height: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="font-display text-xs text-muted-foreground tracking-widest">
          {Math.round(progress * 100)}%
        </span>
      </div>

      {/* Act indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={act}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-8 right-8 text-right"
        >
          <div className="font-display text-xs text-primary tracking-[0.3em] mb-1">
            ACT {act}
          </div>
          <div className="font-display text-lg text-foreground text-glow">
            {actNames[act]}
          </div>
          <div className="font-body text-sm text-muted-foreground italic max-w-48">
            {actPoetry[act]}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Scroll hint */}
      <AnimatePresence>
        {showScrollHint && !isOrbitMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-12 inset-x-0 flex flex-col items-center justify-center gap-3"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center pt-2"
            >
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-2 bg-primary rounded-full"
              />
            </motion.div>
            <span className="font-display text-xs text-primary/70 tracking-[0.2em]">
              SCROLL TO JOURNEY
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbit mode exit */}
      <AnimatePresence>
        {isOrbitMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-12 inset-x-0 flex justify-center pointer-events-auto"
          >
            <button onClick={onExitOrbit} className="cosmic-button">
              ← Return to Journey
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner decorations */}
      <div className="absolute bottom-8 left-8">
        <svg width="40" height="40" viewBox="0 0 40 40" className="text-primary/30">
          <path d="M0 40 L0 20 L20 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-8">
        <svg width="40" height="40" viewBox="0 0 40 40" className="text-primary/30">
          <path d="M40 40 L40 20 L20 0" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}


