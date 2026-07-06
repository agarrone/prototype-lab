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
    status: "almost there",
    tags: ["data", "ressources", "tableaux"],
    figmaUrl:
      "https://www.figma.com/design/IyyYD8UbvPyTo7E1rKkiCF/%F0%9F%A6%B7-Nouvelle-navigation-dans-les-ressources?node-id=160-4820&m=dev",
  },
  {
    slug: "explorateur-sql-et-ia",
    title: "Explorateur SQL et IA",
    description:
      "Duplication de l'explorateur de données pour prototyper des interactions SQL et IA autour des ressources tabulaires.",
    status: "exploration",
    tags: ["data", "sql", "ia"],
    figmaUrl: "",
  },
  {
    slug: "enrichissement-donnees",
    title: "Enrichissement de données",
    description:
      "Prototype de parcours d'analyse et d'enrichissement d'une ressource tabulaire.",
    status: "exploration",
    tags: ["données", "analyse", "enrichissement"],
    figmaUrl:
      "https://www.figma.com/design/eYZGImREXHxoGaD3yn9iNz/%E2%9E%95-Enrichissement-de-donn%C3%A9es?node-id=68-6926&m=dev",
  },
  {
    slug: "recherche",
    title: "Recherche",
    description:
      "Prototype haute fidélité de la recherche avancée de jeux de données sur data.gouv.fr.",
    status: "exploration",
    tags: ["recherche", "catalogue", "filtres"],
    figmaUrl: "",
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
    slug: "carte-landing-page",
    title: "Cartes landing page",
    description:
      "Prototype de page de destination avec carte interactive pour découvrir les données géographiques.",
    status: "brouillon",
    tags: ["carte", "géographie", "visualisation"],
    figmaUrl: "",
  },
  {
    slug: "preview-dashboard",
    title: "Preview dashboard",
    description:
      "Dashboard de suivi des familles de formats et de leur capacité à être prévisualisées sur data.gouv.fr.",
    status: "brouillon",
    tags: ["formats", "prévisualisation", "dashboard"],
    figmaUrl: "",
  },
  {
    slug: "templates",
    title: "Templates",
    description:
      "Bibliothèque de gabarits de pages data.gouv.fr pour tester l'intégration de nouveaux modules d'interface.",
    status: "exploration",
    tags: ["templates", "dataset", "intégration"],
    figmaUrl: "",
  },
];

export function getPrototypeBySlug(slug: string) {
  return prototypes.find((prototype) => prototype.slug === slug);
}
