export type PlanetId = "origin" | "forge" | "syntax" | "ascent";

export interface PlanetAction {
  label: string;
  /** Empty string means: placeholder (renders disabled). */
  url: string;
  /** Optional inline modal content (used when url starts with "modal:"). */
  modal?: {
    title?: string;
    subtitle?: string;
    body?: string;
    bullets?: string[];
    tags?: string[];
    footer?: string;
  };
}

export interface OriginEntry {
  id: string;
  title: string;
  body: string;
  url?: string;
  /** Optional modal content (used when url starts with "modal:"). */
  modal?: PlanetAction["modal"];
}

export interface ForgeProject {
  id: string;
  title: string;
  tagline: string;
  tech?: string[];
  links?: { label: string; url: string }[];
}

export interface SyntaxCluster {
  id: string;
  name: string;
  nodes?: string[];
  links?: { from: string; to: string }[];
}

export interface AscentMilestone {
  id: string;
  title: string;
  year?: string;
  proofUrl?: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
  proofUrl?: string;
}

export interface PlanetContent {
  subtitle: string;
  poetry: string;
  actions: PlanetAction[];
  origin?: { entries: OriginEntry[] };
  forge?: { projects: ForgeProject[] };
  syntax?: { clusters: SyntaxCluster[] };
  ascent?: { milestones: AscentMilestone[]; certificates: Certificate[] };
}

export interface Project {
  /** Planet id */
  id: PlanetId;
  /** Planet name, shown as the big title */
  name: string;
  /** Short cinematic line */
  tagline: string;
  /** Optional small badge (kept for backwards compatibility) */
  year: string;
  role: string;
  impact: string;
  tech: string[];
  links: { label: string; url: string }[];
  color: string;
  position: [number, number, number];
  planet: PlanetContent;
}

export interface Brand {
  name: string;
  tagline: string;
  logo: string;
}

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  resume?: string;
  actions?: PlanetAction[];
}

export interface PortfolioJson {
  brand?: Partial<Brand>;
  planets?: Array<{
    id: PlanetId;
    title?: string;
    subtitle?: string;
    poetry?: string;
    color?: string;
    position?: [number, number, number];
    actions?: PlanetAction[];
    origin?: { entries?: OriginEntry[] };
    forge?: { projects?: ForgeProject[] };
    syntax?: { clusters?: SyntaxCluster[] };
    ascent?: { milestones?: AscentMilestone[]; certificates?: Certificate[] };
  }>;
  contact?: Partial<ContactInfo>;
}

export interface PortfolioData {
  brand: Brand;
  projects: Project[];
  contactInfo: ContactInfo;
}

const placeholderActions = (labels: string[]): PlanetAction[] =>
  labels.map((label) => ({ label, url: "" }));

export const fallbackPortfolio: PortfolioData = {
  brand: {
    name: "Wahid's Multiverse",
    tagline: "Travel through a .",
    logo: "/brand-mark.svg",
  },
  projects: [
    {
      id: "origin",
      name: "ORIGIN",
      tagline: "Where the first signal formed",
      year: "ACT I",
      role: "",
      impact: "",
      tech: [],
      links: [],
      color: "#4fc3f7",
      position: [-4, 0, -15],
      planet: {
        subtitle: "Where the first signal formed",
        poetry: "Not a biography. A frequency.",
        actions: placeholderActions(["Origin Log", "Philosophy", "Journey Fragment"]),
        origin: { entries: [] },
      },
    },
    {
      id: "forge",
      name: "FORGE",
      tagline: "Where problems become artifacts",
      year: "ACT II",
      role: "",
      impact: "",
      tech: [],
      links: [],
      color: "#ba68c8",
      position: [3, 2, -25],
      planet: {
        subtitle: "Where problems become artifacts",
        poetry: "Entering the workshop of creation.",
        actions: placeholderActions(["Project Portals", "Case Files", "Source Links"]),
        forge: { projects: [] },
      },
    },
    {
      id: "syntax",
      name: "SYNTAX",
      tagline: "Systems of thought, wired in light",
      year: "ACT III",
      role: "",
      impact: "",
      tech: [],
      links: [],
      color: "#4db6ac",
      position: [-2, -1, -35],
      planet: {
        subtitle: "Systems of thought, wired in light",
        poetry: "Skills are not listed. They connect.",
        actions: placeholderActions(["Constellation", "Systems Map", "Thinking Models"]),
        syntax: { clusters: [] },
      },
    },
    {
      id: "ascent",
      name: "ASCENT",
      tagline: "Trajectory, not trophies",
      year: "ACT IV",
      role: "",
      impact: "",
      tech: [],
      links: [],
      color: "#ff8a65",
      position: [5, -2, -45],
      planet: {
        subtitle: "Trajectory, not trophies",
        poetry: "A distant pull - always upward.",
        actions: placeholderActions(["Milestone Trail", "Certificates Vault", "Awards Proof"]),
        ascent: { milestones: [], certificates: [] },
      },
    },
  ],
  contactInfo: {
    email: "",
    github: "",
    linkedin: "",
    resume: "",
    actions: placeholderActions([
      "Send Signal",
      "GitHub",
      "LinkedIn",
      "Facebook",
      "Resume",
      "Other Link",
    ]),
  },
};

/** Backwards-compatible exports used across the scene. */
export const projects: Project[] = fallbackPortfolio.projects;
export const contactInfo: ContactInfo = fallbackPortfolio.contactInfo;

const clampPlanetId = (id: string): PlanetId | null => {
  if (id === "origin" || id === "forge" || id === "syntax" || id === "ascent") return id;
  return null;
};

const safeArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/** Merge incoming JSON with safe defaults so the experience never breaks. */
export function mergePortfolioJson(json: PortfolioJson | null | undefined): PortfolioData {
  const base = fallbackPortfolio;
  if (!json) return base;

  const brand: Brand = {
    name: (json.brand?.name ?? base.brand.name) as string,
    tagline: (json.brand?.tagline ?? base.brand.tagline) as string,
    logo: (json.brand?.logo ?? base.brand.logo) as string,
  };

  const planetsById = new Map<PlanetId, Project>();
  for (const p of base.projects) planetsById.set(p.id, p);

  for (const raw of safeArray<PortfolioJson["planets"][number]>(json.planets)) {
    if (!raw || typeof raw !== "object") continue;
    const pid = clampPlanetId((raw as any).id);
    if (!pid) continue;

    const prev = planetsById.get(pid)!;
    const title = (raw.title ?? prev.name) as string;
    const subtitle = (raw.subtitle ?? prev.planet.subtitle) as string;
    const poetry = (raw.poetry ?? prev.planet.poetry) as string;
    const color = (raw.color ?? prev.color) as string;
    const position = (raw.position ?? prev.position) as [number, number, number];
    const actions = safeArray<PlanetAction>(raw.actions).length
      ? safeArray<PlanetAction>(raw.actions)
      : prev.planet.actions;

    const next: Project = {
      ...prev,
      name: title,
      tagline: subtitle,
      color,
      position,
      planet: {
        ...prev.planet,
        subtitle,
        poetry,
        actions,
        origin: {
          entries: safeArray<OriginEntry>(raw.origin?.entries ?? prev.planet.origin?.entries),
        },
        forge: {
          projects: safeArray<ForgeProject>(raw.forge?.projects ?? prev.planet.forge?.projects),
        },
        syntax: {
          clusters: safeArray<SyntaxCluster>(raw.syntax?.clusters ?? prev.planet.syntax?.clusters),
        },
        ascent: {
          milestones: safeArray<AscentMilestone>(raw.ascent?.milestones ?? prev.planet.ascent?.milestones),
          certificates: safeArray<Certificate>(raw.ascent?.certificates ?? prev.planet.ascent?.certificates),
        },
      },
    };

    planetsById.set(pid, next);
  }

  const contact: ContactInfo = {
    email: (json.contact?.email ?? base.contactInfo.email) as string,
    github: (json.contact?.github ?? base.contactInfo.github) as string,
    linkedin: (json.contact?.linkedin ?? base.contactInfo.linkedin) as string,
    resume: (json.contact?.resume ?? base.contactInfo.resume) as string,
    actions:
      safeArray<PlanetAction>(json.contact?.actions).length
        ? safeArray<PlanetAction>(json.contact?.actions)
        : base.contactInfo.actions,
  };

  // Preserve the original visual ordering used by CameraRail.
  const ordered = ["origin", "forge", "syntax", "ascent"] as PlanetId[];
  const projects = ordered.map((id) => planetsById.get(id)!).filter(Boolean);

  return {
    brand,
    projects,
    contactInfo: contact,
  };
}
