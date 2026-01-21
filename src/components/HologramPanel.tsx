import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import {
  Project,
  PlanetAction,
  OriginEntry,
  ForgeProject,
  SyntaxCluster,
  AscentMilestone,
  Certificate,
} from "@/data/projects";

interface HologramPanelProps {
  project: Project;
  visible: boolean;
}

type ModalLink = { label: string; url: string };

type ModalPayload = {
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  tags?: string[];
  footer?: string;
  links?: ModalLink[];
};

const MODAL_PREFIX = "modal:";

function isModalUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.startsWith(MODAL_PREFIX);
}

function isNonEmptyUrl(url: string | undefined): url is string {
  return typeof url === "string" && url.trim().length > 0 && url.trim() !== "mailto:";
}

function safeLinks(links?: ModalLink[]) {
  return (links ?? []).filter((l) => isNonEmptyUrl(l.url));
}

function ActionLink({
  action,
  onOpenModal,
}: {
  action: PlanetAction;
  onOpenModal: (p: ModalPayload) => void;
}) {
  const enabled = isNonEmptyUrl(action.url) || isModalUrl(action.url);

  if (!enabled) {
    return (
      <button className="cosmic-button cosmic-button--sm" disabled aria-disabled="true">
        <span className="normal-case">{action.label}</span>
      </button>
    );
  }

  // ✅ MODAL: open inside panel (NO navigation)
  if (isModalUrl(action.url)) {
    const modal: ModalPayload = {
      title: action.modal?.title ?? action.label,
      subtitle: action.modal?.subtitle,
      body: action.modal?.body,
      bullets: action.modal?.bullets,
      tags: action.modal?.tags,
      footer: action.modal?.footer,
      links: (action as any).modal?.links,
    };

    return (
      <button
        className="cosmic-button cosmic-button--sm"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenModal(modal);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="normal-case">{action.label}</span>
      </button>
    );
  }

  const isMail = action.url.startsWith("mailto:");

  return (
    <a
      href={action.url}
      className="cosmic-button cosmic-button--sm"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
    >
      <span className="normal-case">{action.label}</span>
    </a>
  );
}

function ItemButton({
  label,
  url,
  modal,
  onOpenModal,
}: {
  label: string;
  url?: string;
  modal?: ModalPayload;
  onOpenModal?: (p: ModalPayload) => void;
}) {
  const enabled = isNonEmptyUrl(url) || isModalUrl(url);

  if (!enabled) {
    return (
      <button className="cosmic-button cosmic-button--sm" disabled aria-disabled="true">
        <span className="normal-case">{label}</span>
      </button>
    );
  }

  // ✅ MODAL: open inside panel (NO navigation)
  if (isModalUrl(url)) {
    const canOpen = Boolean(onOpenModal && modal);
    return (
      <button
        className="cosmic-button cosmic-button--sm"
        type="button"
        onClick={
          canOpen
            ? (e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenModal!(modal!);
              }
            : undefined
        }
        onPointerDown={(e) => e.stopPropagation()}
        disabled={!canOpen}
        aria-disabled={!canOpen ? "true" : undefined}
      >
        <span className="normal-case">{label}</span>
      </button>
    );
  }

  return (
    <a
      href={url}
      className="cosmic-button cosmic-button--sm"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="normal-case">{label}</span>
    </a>
  );
}

function originList(entries: OriginEntry[]): Array<{ label: string; url?: string; modal?: ModalPayload }> {
  if (entries.length) {
    return entries.map((e) => ({
      label: e.title,
      url: e.url,
      modal: {
        title: e.modal?.title ?? e.title,
        subtitle: e.modal?.subtitle,
        body: e.modal?.body ?? e.body,
        bullets: e.modal?.bullets,
        tags: e.modal?.tags,
        footer: e.modal?.footer,
      },
    }));
  }
  return [
    { label: "Memory Capsule", url: "" },
    { label: "Belief System", url: "" },
    { label: "Why I Build", url: "" },
  ];
}

function forgeList(items: ForgeProject[]): Array<{ label: string; url?: string; modal?: ModalPayload }> {
  if (items.length) {
    return items.map((p: any) => ({
      label: p.title,
      url: `modal:${p.id}`,
      modal: {
        title: p.title,
        subtitle: p.tagline,
        tags: p.stack ?? [],
        bullets: p.highlights ?? [],
        links: safeLinks(p.links),
        footer: "",
      },
    }));
  }
  return [
    { label: "Artifact A", url: "" },
    { label: "Artifact B", url: "" },
    { label: "Artifact C", url: "" },
    { label: "Artifact D", url: "" },
  ];
}

/**
 * ✅ SYNTAX: modal + bullet list
 */
function syntaxList(items: SyntaxCluster[]): Array<{ label: string; url?: string; modal?: ModalPayload }> {
  if (items.length) {
    return items.map((c: any) => ({
      label: c.name,
      url: `modal:${c.id ?? c.name.toLowerCase().replace(/\s+/g, "-")}`,
      modal: {
        title: c.name,
        subtitle: "Skill Cluster",
        body: c.summary ?? "",
        bullets: c.skills ?? [],
        footer: "",
      },
    }));
  }

  return [
    {
      label: "Systems",
      url: "modal:systems",
      modal: {
        title: "Systems",
        subtitle: "Skill Cluster",
        body: "Add skills in portfolio.json",
        bullets: [],
        footer: "",
      },
    },
    {
      label: "Patterns",
      url: "modal:patterns",
      modal: {
        title: "Patterns",
        subtitle: "Skill Cluster",
        body: "Add skills in portfolio.json",
        bullets: [],
        footer: "",
      },
    },
    {
      label: "Pipelines",
      url: "modal:pipelines",
      modal: {
        title: "Pipelines",
        subtitle: "Skill Cluster",
        body: "Add skills in portfolio.json",
        bullets: [],
        footer: "",
      },
    },
  ];
}

function ascentList(
  m: AscentMilestone[],
  c: Certificate[]
): Array<{ label: string; url?: string; modal?: ModalPayload }> {
  const out: Array<{ label: string; url?: string; modal?: ModalPayload }> = [];

  for (const mm of m as any[]) {
    out.push({
      label: mm.title,
      url: `modal:${mm.id ?? mm.title.toLowerCase().replace(/\s+/g, "-")}`,
      modal: {
        title: mm.title,
        subtitle: `${mm.year ?? ""}`.trim(),
        body: mm.tagline ?? mm.description ?? "",
        bullets: mm.highlights ?? [],
        links: mm.proofUrl
          ? [{ label: "Proof", url: mm.proofUrl }]
          : [],
        footer: "",
      },
    });
  }

  for (const cc of c as any[]) {
    out.push({
      label: cc.title,
      url: `modal:${cc.id ?? cc.title.toLowerCase().replace(/\s+/g, "-")}`,
      modal: {
        title: cc.title,
        subtitle: `${cc.issuer ?? ""}${cc.year ? " • " + cc.year : ""}`.trim(),
        body: cc.tagline ?? "",
        bullets: cc.highlights ?? [],
        links: cc.proofUrl
          ? [{ label: "Proof", url: cc.proofUrl }]
          : [],
        footer: "",
      },
    });
  }

  if (out.length) return out;

  return [
    {
      label: "Milestone",
      url: "modal:milestone",
      modal: {
        title: "Milestone",
        subtitle: "Add milestones in portfolio.json",
        body: "",
        bullets: [],
        footer: "",
      },
    },
    {
      label: "Certificate",
      url: "modal:certificate",
      modal: {
        title: "Certificate",
        subtitle: "Add certificates in portfolio.json",
        body: "",
        bullets: [],
        footer: "",
      },
    },
    {
      label: "Recognition",
      url: "modal:recognition",
      modal: {
        title: "Recognition",
        subtitle: "Add recognitions in portfolio.json",
        body: "",
        bullets: [],
        footer: "",
      },
    },
  ];
}


export function HologramPanel({ project, visible }: HologramPanelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalPayload | null>(null);

  // ✅ which side should be visible (prevents mirrored UI)
  const [showFront, setShowFront] = useState(true);
  const showFrontRef = useRef(true);

  // temp vectors (no allocations per frame)
  const tmpPos = useRef(new THREE.Vector3());
  const tmpCam = useRef(new THREE.Vector3());
  const tmpDir = useRef(new THREE.Vector3());
  const tmpQuat = useRef(new THREE.Quaternion());
  const tmpNormal = useRef(new THREE.Vector3());

  const DOT_THRESHOLD = 0.08; // hysteresis to prevent flicker near 90°

  const openModal = (payload: ModalPayload) => {
    setModal(payload);
    setOpen(true);
  };

  useFrame((state) => {
    if (!groupRef.current || !visible) return;

    // keep your bobbing
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;

    // front/back detection (so text never mirrors)
    const obj = groupRef.current;

    obj.getWorldPosition(tmpPos.current);
    state.camera.getWorldPosition(tmpCam.current);

    tmpDir.current.subVectors(tmpCam.current, tmpPos.current).normalize();

    obj.getWorldQuaternion(tmpQuat.current);
    tmpNormal.current.set(0, 0, 1).applyQuaternion(tmpQuat.current); // local forward

    const dot = tmpNormal.current.dot(tmpDir.current);

    const current = showFrontRef.current;
    let next = current;

    if (current && dot < -DOT_THRESHOLD) next = false;
    else if (!current && dot > DOT_THRESHOLD) next = true;

    if (next !== current) {
      showFrontRef.current = next;
      setShowFront(next);
    }
  });

  if (!visible) return null;

  const planet = project.planet;

  const listItems = useMemo(() => {
    if (project.id === "origin") return originList(planet.origin?.entries ?? []);
    if (project.id === "forge") return forgeList(planet.forge?.projects ?? []);
    if (project.id === "syntax") return syntaxList(planet.syntax?.clusters ?? []);
    return ascentList(planet.ascent?.milestones ?? [], planet.ascent?.certificates ?? []);
  }, [project.id, planet]);

  const listTitle = useMemo(() => {
    if (project.id === "origin") return "SIGNALS";
    if (project.id === "forge") return "PROJECTS";
    if (project.id === "syntax") return "SYSTEMS";
    return "TRAIL";
  }, [project.id]);

  const PanelContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="hologram-panel rounded-lg p-6 relative"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 scanline opacity-20 rounded-lg pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl hologram-text tracking-[0.18em]">{project.name}</h2>
          <p className="font-body text-sm text-foreground/60 italic">{planet.subtitle}</p>
        </div>
        <span className="font-display text-xs text-primary/60 tracking-widest">{project.year}</span>
      </div>

      <p className="font-body text-sm text-foreground/70 italic mb-5">{planet.poetry}</p>

      <div className="mb-5">
        <span className="font-display text-xs text-primary/80 tracking-wider mb-2 block">{listTitle}</span>
        <div className="flex flex-wrap gap-2">
          {listItems.map((it: any) => (
            <ItemButton key={it.label} label={it.label} url={it.url} modal={it.modal} onOpenModal={openModal} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(planet.actions ?? []).map((a) => (
          <ActionLink key={a.label} action={a} onOpenModal={openModal} />
        ))}
      </div>

      {/* ✅ IN-PANEL POPUP */}
      {open && modal && (
        <div
          className="absolute inset-0 z-[999] rounded-lg p-5 border border-primary/40 bg-background/70 backdrop-blur-md"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 scanline opacity-25 rounded-lg pointer-events-none" />

          <button
            className="cosmic-button cosmic-button--sm absolute top-3 right-3"
            type="button"
            onClick={() => setOpen(false)}
          >
            ✕
          </button>

          <h3 className="font-display text-lg tracking-[0.22em] hologram-text">{modal.title}</h3>

          {modal.subtitle ? (
            <p className="font-body text-sm text-foreground/70 italic mt-1">{modal.subtitle}</p>
          ) : null}

          {modal.tags?.length ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {modal.tags.map((t) => (
                <span key={t} className="tech-ring">
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 max-h-[48vh] overflow-y-auto pr-2">
            {modal.body ? (
              <p className="font-body text-sm text-foreground/85 whitespace-pre-line">{modal.body}</p>
            ) : null}

            {modal.bullets?.length ? (
              <ul className="mt-4 space-y-2 font-body text-sm text-foreground/80 list-disc pl-5">
                {modal.bullets.map((b, idx) => (
                  <li key={`${idx}-${b}`}>{b}</li>
                ))}
              </ul>
            ) : null}

            {modal.footer ? (
              <p className="mt-5 font-body text-xs text-foreground/70">
                <span className="text-primary/80">Memory line:</span> {modal.footer}
              </p>
            ) : null}
          </div>

          {/* ✅ Links inside modal */}
          {modal.links?.length ? (
            <div className="mt-4">
              <div className="font-display text-xs text-primary/80 tracking-[0.2em] mb-2">LINKS</div>
              <div className="flex flex-wrap gap-2">
                {safeLinks(modal.links).map((l) => {
                  const isMail = l.url.startsWith("mailto:");
                  return (
                    <a
                      key={l.label}
                      href={l.url}
                      className="cosmic-button cosmic-button--sm"
                      target={isMail ? undefined : "_blank"}
                      rel={isMail ? undefined : "noopener noreferrer"}
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <span className="normal-case">{l.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <button className="cosmic-button cosmic-button--sm" type="button" onClick={() => setOpen(false)}>
              <span className="normal-case">Close</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <group ref={groupRef} position={[0, 3, 0]}>
      {/* FRONT FACE */}
      <group visible={showFront} position={[0, 0, 0.03]}>
        <Html
          transform
          occlude={false}
          style={{
            width: "420px",
            pointerEvents: showFront ? "auto" : "none",
            display: showFront ? "block" : "none",
          }}
          distanceFactor={5}
        >
          <PanelContent />
        </Html>
      </group>

      {/* BACK FACE (rotated 180°, so it is never mirrored when viewed) */}
      <group visible={!showFront} rotation={[0, Math.PI, 0]} position={[0, 0, 0.03]}>
        <Html
          transform
          occlude={false}
          style={{
            width: "420px",
            pointerEvents: !showFront ? "auto" : "none",
            display: !showFront ? "block" : "none",
          }}
          distanceFactor={5}
        >
          <PanelContent />
        </Html>
      </group>
    </group>
  );
}
