import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import type { ContactInfo, PlanetAction } from "@/data/projects";

interface ContactBeaconProps {
  visible: boolean;
  position: [number, number, number];
  /** Optional — when omitted, a safe placeholder panel is shown. */
  contact?: ContactInfo;
}

function isNonEmptyUrl(url: string | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0;
}

function ActionButton({ label, url }: { label: string; url?: string }) {
  const enabled = isNonEmptyUrl(url);

  if (!enabled) {
    return (
      <button
        className="cosmic-button block text-center w-full"
        disabled
        aria-disabled="true"
        title="Coming soon"
      >
        {label}
      </button>
    );
  }

  const isMail = url.startsWith("mailto:");
  return (
    <a
      href={url}
      className="cosmic-button block text-center w-full"
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
    >
      {label}
    </a>
  );
}

function buildContactActions(contact: ContactInfo): PlanetAction[] {
  // Prefer explicit actions array (lets you add FB/other links later).
  if (Array.isArray(contact.actions) && contact.actions.length) return contact.actions;

  // Fallback to classic fields.
  return [
    { label: "Send Signal", url: contact.email ? `mailto:${contact.email}` : "" },
    { label: "GitHub", url: contact.github ?? "" },
    { label: "LinkedIn", url: contact.linkedin ?? "" },
    { label: "Resume", url: contact.resume ?? "" },
  ];
}

export function ContactBeacon({ visible, position, contact }: ContactBeaconProps) {
  const beaconRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (beaconRef.current && visible) {
      // Gentle floating
      beaconRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }

    if (ringRef.current) ringRef.current.rotation.z += delta * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.2;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.25;
  });

  if (!visible) return null;

  const safeContact: ContactInfo = contact ?? {
    email: "",
    github: "",
    linkedin: "",
    resume: "",
    actions: [
      { label: "Send Signal", url: "" },
      { label: "GitHub", url: "" },
      { label: "LinkedIn", url: "" },
      { label: "Facebook", url: "" },
      { label: "Resume", url: "" },
      { label: "Other Link", url: "" },
    ],
  };

  const actions = buildContactActions(safeContact);
  const primary = actions[0];
  const rest = actions.slice(1);

  return (
    <group ref={beaconRef} position={position}>
      {/* Central beacon core */}
      <mesh>
        <icosahedronGeometry args={[0.55, 2]} />
        <meshStandardMaterial
          color="#4fc3f7"
          emissive="#4fc3f7"
          emissiveIntensity={0.85}
          roughness={0.22}
          metalness={0.85}
        />
      </mesh>

      {/* Glowing aura */}
      <mesh>
        <sphereGeometry args={[0.95, 32, 32]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.16} />
      </mesh>

      {/* Orbital rings */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.65, 0.022, 16, 100]} />
        <meshBasicMaterial color="#4fc3f7" transparent opacity={0.7} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.0, 0.017, 16, 100]} />
        <meshBasicMaterial color="#ba68c8" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 2, Math.PI / 6]}>
        <torusGeometry args={[2.35, 0.012, 16, 100]} />
        <meshBasicMaterial color="#4db6ac" transparent opacity={0.45} />
      </mesh>

      {/* Point light */}
      <pointLight color="#4fc3f7" intensity={3} distance={18} />

      {/* HTML Contact Panel */}
      <Html
        transform
        occlude={false}
        position={[0, 3.2, 0]}
        style={{ width: "360px", pointerEvents: "auto" }}
        distanceFactor={5}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hologram-panel rounded-lg p-6 text-center relative"
        >
          <div className="absolute inset-0 scanline opacity-20 rounded-lg pointer-events-none" />

          <h2 className="font-display text-xl hologram-text tracking-widest mb-2">
            CONTACT
          </h2>
          <p className="font-body text-sm text-foreground/70 mb-6 italic">
            Click to initiate transmission
          </p>

          <div className="space-y-3">
            {primary ? <ActionButton label={primary.label} url={primary.url} /> : null}
            {rest.length ? (
              <div className="grid grid-cols-2 gap-2">
                {rest.map((a) => (
                  <ActionButton key={a.label} label={a.label} url={a.url} />
                ))}
              </div>
            ) : null}
          </div>

          
        </motion.div>
      </Html>
    </group>
  );
}
