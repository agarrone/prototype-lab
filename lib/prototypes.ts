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
      "Prototype d'interface pour parcourir, filtrer et comprendre les ressources d'un jeu de données.",
    status: "prototype",
    tags: ["data", "ressources", "tableaux"],
    figmaUrl:
      "https://www.figma.com/design/IyyYD8UbvPyTo7E1rKkiCF/%F0%9F%A6%B7-Nouvelle-navigation-dans-les-ressources?node-id=160-4820&m=dev",
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
