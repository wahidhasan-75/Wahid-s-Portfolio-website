# Wahid's Multiverse

A cinematic, story-driven 3D portfolio experience built with **React + Three.js (React Three Fiber)**.

You don’t scroll a website — you travel through four narrative planets:
- **ORIGIN** (identity + motivation, told emotionally)
- **FORGE** (projects as orbiting artifacts)
- **SYNTAX** (skills as connected systems / constellations)
- **ASCENT** (growth + milestones as trajectory)

---

## Run locally (VS Code + Chrome)

### 1) Install Node.js
Install **Node.js LTS** from the official site (includes npm).

### 2) Install dependencies
Open this folder in VS Code, then open a terminal in the project root and run:

```bash
npm install
```

### 3) Start the dev server

```bash
npm run dev
```

Now open:
- **http://localhost:8080**

---

## Future-proof content system (edit JSON)

All your content is designed to be attached later without redesign.

Edit:
- `public/content/portfolio.json`

Rules:
- Empty `url` → button renders as a **disabled cinematic placeholder**
- Add items to arrays (`entries`, `projects`, `clusters`, `milestones`, `certificates`) → the scene auto-renders

Examples of where to attach future content:
- **ORIGIN** → `origin.entries` (story fragments)
- **FORGE** → `forge.projects` (project portals)
- **SYNTAX** → `syntax.clusters` (skill systems)
- **ASCENT** → `ascent.milestones` + `ascent.certificates` (trajectory + proof)

---

## Build for deployment

```bash
npm run build
npm run preview
```

