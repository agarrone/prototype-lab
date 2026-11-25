// Modèle fictif du prototype « Publication de données géographiques ».
//
// Trois niveaux :
//   Jeu de données  → métadonnées générales, règles d’accès, ressources
//   Ressources      → fichiers GeoPackage, services WFS créés (liés à un seul GeoPackage) ou référencés
//   Couches         → tables géographiques d’un GeoPackage (couches sources)
//                     et couches exposées par un WFS (couches publiées, métadonnées propres au service)
//
// Aucun backend géographique : l’analyse, la génération des services et le GetCapabilities sont simulés.

export type GeometryType = "Polygone" | "Ligne" | "Point";

export type AttributeColumn = { name: string; type: string };

/** Table géographique détectée dans un GeoPackage. Les informations techniques sont en lecture seule. */
export type SourceLayer = {
  key: string;
  tableName: string;
  label: string;
  description: string;
  geometry: GeometryType;
  /** Projection source : non modifiable en V1 (la reprojection reste une question ouverte). */
  epsg: string;
  featureCount: number;
  extent: string;
  columns: AttributeColumn[];
};

export type AnalysisIssue = {
  /** error : bloquant, le fichier n’est pas ajouté. warning / info : non bloquant. */
  level: "error" | "warning" | "info";
  table?: string;
  message: string;
};

export type ImportOrigin =
  | { kind: "upload"; fileName: string }
  /** Import par URL : une copie est hébergée sur data.gouv.fr, l’adresse d’origine est conservée et affichée. */
  | { kind: "url"; url: string };

export type ResourceType = "main" | "documentation" | "update" | "other";

export type GeoPackageResource = {
  id: string;
  fileName: string;
  title: string;
  description: string;
  type: ResourceType;
  format: "GeoPackage (.gpkg)";
  sizeLabel: string;
  contentType: "Vecteur";
  extent: string;
  origin: ImportOrigin;
  layers: SourceLayer[];
  issues: AnalysisIssue[];
};

/** Couche exposée par un WFS. Ses métadonnées sont propres au service et ne modifient pas la couche source. */
export type PublishedLayer = {
  /**
   * V1 : une couche publiée correspond à une seule table source.
   * Les correspondances avancées (plusieurs tables, filtres…) sont prévues dans le modèle
   * mais leur fonctionnement reste à définir.
   */
  sourceTables: string[];
  technicalName: string;
  title: string;
  description: string;
  keywords: string;
};

export type ServiceStatus = "generating" | "available" | "error";

/** WFS créé par data.gouv.fr à partir d’un seul GeoPackage. Droits d’accès hérités du jeu de données. */
export type HostedWfs = {
  id: string;
  origin: "hosted";
  sourceResourceId: string;
  title: string;
  description: string;
  technicalName: string;
  /** Tant que le nom technique n’a pas été modifié à la main, il suit le titre. */
  technicalNameTouched: boolean;
  layers: PublishedLayer[];
  status: ServiceStatus;
};

export type ExternalWfsLayer = {
  name: string;
  title: string;
  description: string;
  geometry: GeometryType;
  crs: string;
};

/** WFS public existant, référencé par son URL. Il n’est ni recréé ni synchronisé. */
export type ExternalWfs = {
  id: string;
  origin: "external";
  url: string;
  provider: string;
  version: string;
  title: string;
  description: string;
  layers: ExternalWfsLayer[];
};

export type WfsResource = HostedWfs | ExternalWfs;

// ---------------------------------------------------------------------------
// Données fictives

export const ASYNC_EXPORT_THRESHOLD = 100_000;

export const WFS_RESPONSE_FORMATS = ["GML 3.2 (par défaut)", "GeoJSON"];

const sourceLayers: SourceLayer[] = [
  {
    key: "zones_humides",
    tableName: "zones_humides",
    label: "Zones humides",
    description: "Inventaire des zones humides recensées dans le Bas-Rhin.",
    geometry: "Polygone",
    epsg: "EPSG:2154 — Lambert-93",
    featureCount: 2450,
    extent: "7,46° E · 48,14° N — 8,22° E · 49,07° N",
    columns: [
      { name: "id_zone", type: "Entier" },
      { name: "nom", type: "Texte" },
      { name: "type_milieu", type: "Texte" },
      { name: "surface_ha", type: "Nombre décimal" },
      { name: "date_maj", type: "Date" },
    ],
  },
  {
    key: "cours_eau",
    tableName: "cours_eau",
    label: "Cours d’eau",
    description: "",
    geometry: "Ligne",
    epsg: "EPSG:2154 — Lambert-93",
    featureCount: 580,
    extent: "7,45° E · 48,12° N — 8,23° E · 49,08° N",
    columns: [
      { name: "id_cours", type: "Entier" },
      { name: "nom", type: "Texte" },
      { name: "classement", type: "Texte" },
      { name: "longueur_m", type: "Nombre décimal" },
    ],
  },
  {
    key: "observations_terrain",
    tableName: "observations_terrain",
    label: "Observations de terrain",
    description: "Localisation des observations naturalistes réalisées sur le terrain depuis 2022.",
    geometry: "Point",
    epsg: "EPSG:2154 — Lambert-93",
    featureCount: 126480,
    extent: "7,51° E · 48,20° N — 8,18° E · 49,02° N",
    columns: [
      { name: "id_observation", type: "Entier" },
      { name: "date_observation", type: "Date" },
      { name: "observateur", type: "Texte" },
      { name: "espece", type: "Texte" },
      { name: "commentaire", type: "Texte" },
    ],
  },
];

const analysisIssues: AnalysisIssue[] = [
  {
    level: "warning",
    table: "zones_humides",
    message: "3 géométries invalides (auto-intersections). Le fichier est publié tel quel.",
  },
  {
    level: "warning",
    table: "cours_eau",
    message: "Aucune description renseignée dans le GeoPackage. Complétez-la ci-dessous.",
  },
  {
    level: "info",
    table: "sources_bibliographiques",
    message: "Table non géographique : conservée dans le fichier, non prise en charge dans cette version.",
  },
];

export const invalidFileIssues: AnalysisIssue[] = [
  { level: "error", message: "Le fichier n’est pas un GeoPackage valide : l’en-tête SQLite est illisible." },
  { level: "error", message: "Aucune table géographique n’a pu être détectée." },
];

export const DEFAULT_FILE_NAME = "inventaire-milieux-aquatiques-bas-rhin.gpkg";
export const DEFAULT_IMPORT_URL = "https://www.exemple-dreal-grand-est.fr/donnees/milieux-aquatiques-bas-rhin.gpkg";

export function analysisStepsFor(origin: ImportOrigin) {
  return [
    ...(origin.kind === "url" ? ["Récupération du fichier et hébergement d’une copie sur data.gouv.fr"] : ["Téléversement du fichier"]),
    "Lecture du GeoPackage",
    "Détection des couches, géométries et projections",
    "Contrôle de cohérence",
  ];
}

export function createGeoPackageResource(origin: ImportOrigin): GeoPackageResource {
  const fileName = origin.kind === "url" ? origin.url.split("/").pop()?.split("?")[0] || DEFAULT_FILE_NAME : origin.fileName;
  return {
    id: "gpkg-1",
    fileName,
    title: "Inventaire des milieux aquatiques du Bas-Rhin",
    description: "GeoPackage regroupant les zones humides, les cours d’eau et les observations de terrain.",
    type: "main",
    format: "GeoPackage (.gpkg)",
    sizeLabel: "42,8 Mo",
    contentType: "Vecteur",
    extent: "7,45° E · 48,12° N — 8,23° E · 49,08° N",
    origin,
    layers: sourceLayers.map((layer) => ({ ...layer, columns: [...layer.columns] })),
    issues: analysisIssues,
  };
}

export const externalCapabilitiesMock = {
  provider: "Agence de l’eau (exemple)",
  version: "2.0.0",
  title: "Masses d’eau du bassin Rhin-Meuse",
  description: "Délimitation des masses d’eau superficielles et souterraines et réseau de stations de mesure de la qualité.",
  layers: [
    { name: "eau:masses_eau_superficielles", title: "Masses d’eau superficielles", description: "Masses d’eau de surface au sens de la directive-cadre sur l’eau.", geometry: "Polygone", crs: "EPSG:2154" },
    { name: "eau:masses_eau_souterraines", title: "Masses d’eau souterraines", description: "Entités hydrogéologiques de référence.", geometry: "Polygone", crs: "EPSG:2154" },
    { name: "eau:stations_qualite", title: "Stations de mesure de la qualité", description: "Points de prélèvement du réseau de surveillance.", geometry: "Point", crs: "EPSG:4326" },
  ] satisfies ExternalWfsLayer[],
};

export const DEFAULT_EXTERNAL_WFS_URL = "https://geoservices.exemple-eau-rhin-meuse.fr/geoserver/wfs";

/** Simulation : une URL qui ne ressemble pas à un point d’accès WFS ne renvoie pas de GetCapabilities. */
export function looksLikeWfsEndpoint(url: string) {
  return /^https?:\/\/\S+$/i.test(url) && /wfs|geoserver|service=wfs/i.test(url);
}

// ---------------------------------------------------------------------------
// Noms techniques

const RESERVED_SERVICE_NAMES = ["milieux-aquatiques", "zones-humides"];

export function toTechnicalName(value: string, separator: "-" | "_") {
  const cleaned = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(separator === "-" ? /^-+|-+$/g : /^_+|_+$/g, "")
    .slice(0, 60)
    .replace(separator === "-" ? /-+$/ : /_+$/, "");
  return /^[a-z]/.test(cleaned) ? cleaned : `c${separator}${cleaned}`;
}

function uniqueName(base: string, taken: string[], separator: "-" | "_") {
  let candidate = base;
  let index = 2;
  while (taken.includes(candidate) || RESERVED_SERVICE_NAMES.includes(candidate)) {
    candidate = `${base}${separator}${index}`;
    index += 1;
  }
  return candidate;
}

export function validateServiceName(name: string, otherNames: string[]) {
  if (!name) return "Le nom technique est obligatoire.";
  if (!/^[a-z][a-z0-9-]*$/.test(name)) return "Utilisez des minuscules sans accent, des chiffres et des tirets, en commençant par une lettre.";
  if (name.length < 3 || name.length > 63) return "Le nom technique doit contenir entre 3 et 63 caractères.";
  if (RESERVED_SERVICE_NAMES.includes(name)) return "Ce nom est déjà utilisé par un service sur data.gouv.fr.";
  if (otherNames.includes(name)) return "Ce nom est déjà utilisé par un autre service de ce jeu de données.";
  return null;
}

export function validateLayerName(name: string, otherNames: string[]) {
  if (!name) return "Le nom technique est obligatoire.";
  if (!/^[a-z][a-z0-9_]*$/.test(name)) return "Utilisez des minuscules sans accent, des chiffres et des tirets bas, en commençant par une lettre.";
  if (name.length > 63) return "Le nom technique ne doit pas dépasser 63 caractères.";
  if (otherNames.includes(name)) return "Ce nom est déjà utilisé par une autre couche de ce service.";
  return null;
}

export type ServiceErrors = {
  title?: string;
  technicalName?: string;
  layers?: string;
  layerNames: Record<string, string>;
};

export function getServiceErrors(service: HostedWfs, allServices: HostedWfs[]): ServiceErrors {
  const otherNames = allServices.filter((item) => item.id !== service.id).map((item) => item.technicalName);
  const errors: ServiceErrors = { layerNames: {} };
  if (!service.title.trim()) errors.title = "Le titre du service est obligatoire.";
  const nameError = validateServiceName(service.technicalName, otherNames);
  if (nameError) errors.technicalName = nameError;
  if (service.layers.length === 0) errors.layers = "Sélectionnez au moins une couche pour créer ce service.";
  service.layers.forEach((layer, index) => {
    const others = service.layers.filter((_, otherIndex) => otherIndex !== index).map((item) => item.technicalName);
    const layerError = validateLayerName(layer.technicalName, others);
    if (layerError) errors.layerNames[layer.sourceTables[0]] = layerError;
  });
  return errors;
}

export function hasServiceErrors(errors: ServiceErrors) {
  return Boolean(errors.title || errors.technicalName || errors.layers || Object.keys(errors.layerNames).length);
}

// ---------------------------------------------------------------------------
// Fabriques

/** Préremplit les métadonnées d’une couche publiée depuis la couche source. */
export function createPublishedLayer(source: SourceLayer, keywords: string): PublishedLayer {
  return {
    sourceTables: [source.key],
    technicalName: toTechnicalName(source.tableName, "_"),
    title: source.label,
    description: source.description,
    keywords,
  };
}

export function createHostedWfs(resource: GeoPackageResource, existing: HostedWfs[], keywords: string): HostedWfs {
  const title = existing.length === 0 ? `${resource.title} — WFS` : `${resource.title} — WFS ${existing.length + 1}`;
  const technicalName = uniqueName(toTechnicalName(resource.title, "-"), existing.map((service) => service.technicalName), "-");
  return {
    id: `wfs-${Date.now()}-${existing.length}`,
    origin: "hosted",
    sourceResourceId: resource.id,
    title,
    description: `Accès aux objets géographiques du fichier « ${resource.title} ».`,
    technicalName,
    technicalNameTouched: false,
    layers: existing.length === 0 ? resource.layers.map((layer) => createPublishedLayer(layer, keywords)) : [],
    status: "generating",
  };
}

export function nextTechnicalNameFromTitle(service: HostedWfs, title: string, others: HostedWfs[]) {
  if (service.technicalNameTouched) return service.technicalName;
  return uniqueName(toTechnicalName(title, "-"), others.filter((item) => item.id !== service.id).map((item) => item.technicalName), "-");
}

export function wfsUrl(technicalName: string) {
  return `https://geoservices.data.gouv.fr/wfs/${technicalName}`;
}

export function capabilitiesUrl(serviceUrl: string) {
  return `${serviceUrl}${serviceUrl.includes("?") ? "&" : "?"}SERVICE=WFS&REQUEST=GetCapabilities`;
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export const resourceTypeLabels: Record<ResourceType, string> = {
  main: "Fichier principal",
  documentation: "Documentation",
  update: "Mise à jour",
  other: "Autre",
};
