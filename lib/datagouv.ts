export type DatagouvDatasetSummary = {
  id: string;
  slug: string;
  title: string;
  acronym?: string;
  description: string;
  organizationName: string;
  organizationLogo?: string;
  organizationPage?: string;
  page: string;
  licenseLabel: string;
  lastUpdateLabel: string;
  viewsLabel: string;
  downloadsLabel: string;
  resourceCount: number;
  reuseCount: number;
  discussionCount: number;
  communityResourceCount: number;
  qualityScore: number;
  resources: DatagouvResourceSummary[];
};

export type DatagouvResourceSummary = {
  id: string;
  title: string;
  format: string;
  sizeLabel: string;
  updatedAtLabel: string;
  downloads: number;
  type: string;
  url?: string;
};

type DatagouvDatasetApi = {
  id?: string;
  slug?: string;
  title?: string;
  acronym?: string | null;
  description?: string | null;
  organization?: {
    name?: string;
    logo_thumbnail?: string | null;
    logo?: string | null;
    page?: string | null;
  } | null;
  page?: string;
  license?: string | null;
  last_update?: string | null;
  last_modified?: string | null;
  metrics?: {
    views?: number;
    resources_downloads?: number;
    reuses?: number;
    discussions?: number;
  };
  resources?: DatagouvResourceApi[];
  community_resources?: unknown[];
  quality?: {
    score?: number;
  } | null;
};

type DatagouvResourceApi = {
  id?: string;
  title?: string;
  format?: string | null;
  filesize?: number | null;
  url?: string | null;
  last_modified?: string | null;
  created_at?: string | null;
  metrics?: {
    downloads?: number;
    views?: number;
  } | null;
  type?: string | null;
};

type DatagouvSearchResponse = {
  data?: DatagouvDatasetApi[];
};

const datagouvApiBaseUrl = "https://www.data.gouv.fr/api/1";

export const defaultDatasetSummary: DatagouvDatasetSummary = {
  id: "5de8f397634f4164071119c5",
  slug: "fichier-des-personnes-decedees",
  title: "Fichier des personnes décédées",
  acronym: "Décès",
  description: `_**Avertissement : L’Insee, en aucune façon, n’est lié au site MatchId comme à tout autre site utilisant les données mises à disposition depuis cette page. Toutes réclamations ou questions concernant ces sites doit leur être adressées directement.**_

**Les fichiers nominatifs diffusés ici ne sont pas des fichiers aisément manipulables pour des calculs statistiques et ne sont actualisés que tous les mois. Ils incluent les décès survenus à l’étranger. Pour avoir les derniers résultats des décès comptabilisés sur le territoire français durant la pandémie du Covid 19 et en suivre l’évolution, il est recommandé de se référer aux données relatives aux décès quotidiens.**

L'Insee reçoit des communes les décès enregistrés.

Les informations des fichiers de personnes décédées ne sont pas des données à caractère personnel, ni ne relèvent du secret de la vie privée.`,
  organizationName:
    "Institut national de la statistique et des études économiques (Insee)",
  organizationLogo:
    "https://udata-avatars.s3.rbx.io.cloud.ovh.net/64/f90b7bc5674a8c9160fad0ec1def4d-100.png",
  organizationPage:
    "https://www.data.gouv.fr/organizations/institut-national-de-la-statistique-et-des-etudes-economiques-insee",
  page: "https://www.data.gouv.fr/datasets/fichier-des-personnes-decedees",
  licenseLabel: "Licence Ouverte / Open Licence version 2.0",
  lastUpdateLabel: "8 juin 2026",
  viewsLabel: "3.61M",
  downloadsLabel: "1.45M",
  resourceCount: 83,
  reuseCount: 34,
  discussionCount: 173,
  communityResourceCount: 0,
  qualityScore: 1,
  resources: [
    {
      id: "deces-2026-m05",
      title: "deces-2026-m05.txt",
      format: "TXT",
      sizeLabel: "9,6 Mo",
      updatedAtLabel: "8 juin 2026",
      downloads: 1450000,
      type: "main",
      url: "https://www.data.gouv.fr/datasets/r/0183f946-4f09-476a-aea1-27f03e80aae3",
    },
    {
      id: "deces-2026-m04",
      title: "deces-2026-m04.txt",
      format: "TXT",
      sizeLabel: "9,4 Mo",
      updatedAtLabel: "7 mai 2026",
      downloads: 32700,
      type: "main",
      url: "https://www.data.gouv.fr/datasets/r/29142f96-5fcc-42c6-966f-60afa5fc706e",
    },
    {
      id: "documentation-fichier-personnes-decedees",
      title: "Documentation du fichier des personnes décédées",
      format: "PDF",
      sizeLabel: "624 Ko",
      updatedAtLabel: "8 juin 2026",
      downloads: 8200,
      type: "documentation",
    },
  ],
};

export function extractDatasetReference(input: string) {
  const value = input.trim();

  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    const resourceMatch = url.pathname.match(/\/datasets\/r\/([^/]+)/);
    if (resourceMatch?.[1]) {
      return resourceMatch[1];
    }

    const datasetMatch = url.pathname.match(/\/datasets\/([^/]+)/);
    if (datasetMatch?.[1]) {
      return datasetMatch[1];
    }
  } catch {
    // The input may already be a slug or UUID.
  }

  return value.replace(/^\/+|\/+$/g, "");
}

export async function searchDatagouvDatasets(query: string) {
  const params = new URLSearchParams({
    q: query,
    page_size: "6",
  });
  const response = await fetch(`${datagouvApiBaseUrl}/datasets/?${params}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`data.gouv.fr search failed with ${response.status}`);
  }

  const payload = (await response.json()) as DatagouvSearchResponse;
  return (payload.data ?? []).map((dataset) => {
    const summary = toDatasetSummary(dataset);

    return {
      ...summary,
      description: "",
    };
  });
}

export async function fetchDatagouvDataset(reference: string) {
  const datasetReference = extractDatasetReference(reference);
  const response = await fetch(
    `${datagouvApiBaseUrl}/datasets/${encodeURIComponent(datasetReference)}/`,
    { headers: { accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`data.gouv.fr dataset fetch failed with ${response.status}`);
  }

  return toDatasetSummary((await response.json()) as DatagouvDatasetApi);
}

export function toDatasetSummary(
  dataset: DatagouvDatasetApi,
): DatagouvDatasetSummary {
  const views = dataset.metrics?.views ?? 0;
  const downloads = dataset.metrics?.resources_downloads ?? 0;
  const resources = dataset.resources ?? [];
  const resourceCount = resources.length;

  return {
    id: dataset.id ?? "",
    slug: dataset.slug ?? dataset.id ?? "",
    title: dataset.title ?? "Jeu de données",
    acronym: dataset.acronym ?? undefined,
    description: dataset.description ?? "",
    organizationName: dataset.organization?.name ?? "Producteur non renseigné",
    organizationLogo:
      dataset.organization?.logo_thumbnail ?? dataset.organization?.logo ?? undefined,
    organizationPage: dataset.organization?.page ?? undefined,
    page:
      dataset.page ??
      `https://www.data.gouv.fr/datasets/${dataset.slug ?? dataset.id ?? ""}`,
    licenseLabel: formatLicense(dataset.license),
    lastUpdateLabel: formatDate(dataset.last_update ?? dataset.last_modified),
    viewsLabel: compactNumber(views),
    downloadsLabel: compactNumber(downloads),
    resourceCount,
    reuseCount: dataset.metrics?.reuses ?? 0,
    discussionCount: dataset.metrics?.discussions ?? 0,
    communityResourceCount: dataset.community_resources?.length ?? 0,
    qualityScore: dataset.quality?.score ?? 0,
    resources: resources.map(toResourceSummary),
  };
}

function toResourceSummary(
  resource: DatagouvResourceApi,
): DatagouvResourceSummary {
  const format = resource.format?.trim().toUpperCase() || "FICHIER";

  return {
    id: resource.id ?? resource.title ?? crypto.randomUUID(),
    title: resource.title?.trim() || "Ressource sans titre",
    format,
    sizeLabel: formatFileSize(resource.filesize),
    updatedAtLabel: formatDate(resource.last_modified ?? resource.created_at),
    downloads: resource.metrics?.downloads ?? resource.metrics?.views ?? 0,
    type: resource.type ?? "main",
    url: resource.url ?? undefined,
  };
}

function formatLicense(license?: string | null) {
  if (!license) {
    return "Licence non renseignée";
  }

  if (license === "lov2") {
    return "Licence Ouverte / Open Licence version 2.0";
  }

  return license;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000 ? 2 : 1,
  }).format(value);
}

function formatFileSize(value?: number | null) {
  if (!value || value <= 0) {
    return "Taille inconnue";
  }

  const units = ["octets", "Ko", "Mo", "Go"];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(size)} ${units[unitIndex]}`;
}
