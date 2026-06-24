export type Prototype = {
  slug: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  figmaUrl: string;
};

export const prototypes: Prototype[] = [
  {
    slug: "explorateur",
    title: "Explorateur de données",
    description:
      "Prototype d'interface pour parcourir, filtrer et comprendre un jeu de données.",
    status: "bientôt",
    tags: ["data", "recherche", "tableaux"],
    figmaUrl: "https://www.figma.com/file/placeholder/explorateur",
  },
  {
    slug: "design-system",
    title: "Design system",
    description:
      "Prototype de bibliothèque de composants, tokens et règles d'usage.",
    status: "brouillon",
    tags: ["ui", "composants", "documentation"],
    figmaUrl: "https://www.figma.com/file/placeholder/design-system",
  },
  {
    slug: "enrichissement-ia",
    title: "Enrichissement IA",
    description:
      "Prototype de parcours d'enrichissement assisté par intelligence artificielle.",
    status: "exploration",
    tags: ["ia", "automatisation", "workflow"],
    figmaUrl: "https://www.figma.com/file/placeholder/enrichissement-ia",
  },
];

export function getPrototypeBySlug(slug: string) {
  return prototypes.find((prototype) => prototype.slug === slug);
}
