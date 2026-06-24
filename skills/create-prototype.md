# Create Prototype Skill

## Goal

Create a new high-fidelity prototype for DataGouv Prototype Lab.

The output should be realistic, interactive and close to production quality.

## Accepted starting points

A prototype can start from:

### 1. Figma (priority)

Default source of truth.

Workflow:

- inspect the Figma design through MCP
- understand layout, hierarchy and interactions
- reproduce the design as faithfully as possible
- keep spacing, structure, content hierarchy and states consistent

Rule:

Figma should not be reinterpreted unless explicitly asked.

Improvements can be suggested but not applied by default.

---

### 2. Existing DataGouv page

Workflow:

- analyze the current page
- identify friction points
- preserve useful patterns
- improve UX, IA, density, discoverability or actions

Rule:

optimize without breaking the product logic.

---

### 3. Raw idea / product note

Workflow:

- structure the concept
- identify core user flows
- propose a first interface
- reduce ambiguity before implementation

Rule:

clarify before building if too vague.

---

## Creation rules

Always:

- create a new route in `/app/prototypes/[slug]`
- add the prototype in `/lib/prototypes.ts`
- create a `README.md`
- define a clear status
- add tags

## Quality expectations

The prototype should:

- feel realistic
- include meaningful interactions
- include loading / empty / error states if relevant
- be navigable
- be visually coherent

## Tech rules

Use:

- Next.js App Router
- Tailwind
- reusable components when relevant

Prefer:

- mock data first
- real data later if useful

Avoid:

- unnecessary abstraction
- premature optimization
- production hardening
