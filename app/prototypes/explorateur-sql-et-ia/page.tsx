"use client";

import Image from "next/image";
import Link from "next/link";
import Chart from "chart.js/auto";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ComponentType,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  UIEvent,
} from "react";
import {
  RiArrowDownLine,
  RiArrowDownSLine,
  RiArrowDropDownLine,
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiBook2Line,
  RiBrainLine,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseLine,
  RiCodeAiLine,
  RiDashboard2Line,
  RiDownloadLine,
  RiDatabase2Line,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiFileLine,
  RiFilterLine,
  RiFingerprintLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiHashtag,
  RiLayoutHorizontalLine,
  RiLayoutVerticalLine,
  RiMap2Line,
  RiPriceTag3Line,
  RiQuestionLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiSparklingLine,
  RiTableLine,
  RiTerminalLine,
  RiText,
  RiThumbDownLine,
  RiThumbUpLine,
  RiWrenchLine,
} from "@remixicon/react";
import {
  configureParquetSource,
  executeSql,
  getColumnValueOptions,
  inspectSchema,
  queryDataset,
  type ExecuteSqlResult,
  type InspectSchemaResult,
} from "./duckdb-wasm-client";

type ResourceType = "table" | "code" | "geodata" | "documentation";

type Resource = {
  id: string;
  name: string;
  size: string;
  format: string;
  updatedAt: string;
  downloads: number;
  type: ResourceType;
  tabs: ExplorerTab[];
  sourceUrl?: string;
};

type ResourceTooltip = {
  resource: Resource;
  top: number;
  left: number;
  width: number;
} | null;

const resourceSidebarDefaultWidth = 300;
const resourceSidebarMinWidth = 260;
const resourceSidebarMaxWidth = 560;
const collapsedResourceSidebarWidth = 48;
const chatSidebarDefaultWidth = 500;
const chatSidebarMinWidth = 340;
const chatSidebarMaxWidth = 640;

function clampResourceSidebarWidth(width: number) {
  return Math.min(
    resourceSidebarMaxWidth,
    Math.max(resourceSidebarMinWidth, Math.round(width)),
  );
}

function getAutoFitResourceSidebarWidth(items: Resource[]) {
  const longestResourceName = items.reduce(
    (longest, resource) =>
      resource.name.length > longest.length ? resource.name : longest,
    "",
  );

  return clampResourceSidebarWidth(longestResourceName.length * 7.2 + 124);
}

function clampChatSidebarWidth(width: number) {
  return Math.min(
    chatSidebarMaxWidth,
    Math.max(chatSidebarMinWidth, Math.round(width)),
  );
}

const resources: Resource[] = [
  {
    id: "catalogue_datasets",
    name: "Catalogue des jeux de données data.gouv.fr",
    size: "31,5 Mo",
    format: "PARQUET",
    updatedAt: "3 juillet 2026",
    downloads: 0,
    type: "table",
    tabs: ["Aperçu", "Description", "Structure des données", "Métadonnées", "API"],
    sourceUrl:
      "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/f868cca6-8da1-4369-a78d-47463f19a9a3.parquet",
  },
  {
    id: "parquet_2876a346",
    name: "Répertoire national des élus · elus-maires-mai.csv",
    size: "—",
    format: "PARQUET",
    updatedAt: "—",
    downloads: 0,
    type: "table",
    tabs: ["Aperçu", "Structure des données"],
    sourceUrl:
      "https://object.files.data.gouv.fr/hydra-parquet/hydra-parquet/2876a346-d50c-4911-934e-19ee07b0e503.parquet",
  },
  {
    id: "parquet_dfb542cd",
    name: "Carte des loyers · Indicateurs de loyer maison",
    size: "—",
    format: "PARQUET",
    updatedAt: "—",
    downloads: 0,
    type: "table",
    tabs: ["Aperçu", "Structure des données"],
    sourceUrl:
      "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/dfb542cd-a808-41e2-9157-8d39b5c24edb.parquet",
  },
];

const defaultParquetFileUrl =
  "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/f868cca6-8da1-4369-a78d-47463f19a9a3.parquet";

const defaultParquetSources = [
  {
    label: "Catalogue des jeux de données data.gouv.fr",
    url: defaultParquetFileUrl,
  },
  {
    label: "Répertoire national des élus · elus-maires-mai.csv",
    url: "https://object.files.data.gouv.fr/hydra-parquet/hydra-parquet/2876a346-d50c-4911-934e-19ee07b0e503.parquet",
  },
  {
    label: "Carte des loyers · Indicateurs de loyer maison",
    url: "https://hydra.s3.rbx.io.cloud.ovh.net/parquet/dfb542cd-a808-41e2-9157-8d39b5c24edb.parquet",
  },
] as const;

const downloadGroups = [
  {
    title: "FORMAT ORIGINAL",
    items: [
      { label: "Catalogue des jeux de données data.gouv.fr", size: "31,5 Mo" },
    ],
    closable: true,
  },
  {
    title: "LIEN SOURCE",
    items: [
      { label: "hydra.s3.rbx.io.cloud.ovh.net/parquet/f868cca6...", size: "Parquet" },
    ],
    closable: false,
  },
];

type ColumnType =
  | "identifier"
  | "referenceData"
  | "reference"
  | "category"
  | "number"
  | "date"
  | "text";

type ColumnFilter = "category" | "number" | "date";

type TableColumn = {
  key: string;
  label: string;
  icon: keyof typeof icons;
  width: string;
  widthPx: number;
  filter: ColumnFilter;
  type: ColumnType;
};

const tableColumns: TableColumn[] = [
  {
    key: "id",
    label: "id",
    icon: "identifier",
    width: "w-[176px]",
    widthPx: 176,
    filter: "category",
    type: "identifier",
  },
  {
    key: "title",
    label: "title",
    icon: "text",
    width: "w-[320px]",
    widthPx: 320,
    filter: "category",
    type: "text",
  },
  {
    key: "slug",
    label: "slug",
    icon: "identifier",
    width: "w-[280px]",
    widthPx: 280,
    filter: "category",
    type: "identifier",
  },
  {
    key: "acronym",
    label: "acronym",
    icon: "text",
    width: "w-[112px]",
    widthPx: 112,
    filter: "category",
    type: "text",
  },
  {
    key: "url",
    label: "url",
    icon: "text",
    width: "w-[280px]",
    widthPx: 280,
    filter: "category",
    type: "text",
  },
  {
    key: "organization",
    label: "organization",
    icon: "reference",
    width: "w-[220px]",
    widthPx: 220,
    filter: "category",
    type: "reference",
  },
  {
    key: "frequency",
    label: "frequency",
    icon: "category",
    width: "w-[136px]",
    widthPx: 136,
    filter: "category",
    type: "category",
  },
  {
    key: "license",
    label: "license",
    icon: "category",
    width: "w-[220px]",
    widthPx: 220,
    filter: "category",
    type: "category",
  },
  {
    key: "spatial.granularity",
    label: "spatial.granularity",
    icon: "geodata",
    width: "w-[152px]",
    widthPx: 152,
    filter: "category",
    type: "category",
  },
  {
    key: "featured",
    label: "featured",
    icon: "category",
    width: "w-[104px]",
    widthPx: 104,
    filter: "category",
    type: "category",
  },
  {
    key: "created_at",
    label: "created_at",
    icon: "calendar",
    width: "w-[144px]",
    widthPx: 144,
    filter: "date",
    type: "date",
  },
  {
    key: "last_modified",
    label: "last_modified",
    icon: "calendar",
    width: "w-[144px]",
    widthPx: 144,
    filter: "date",
    type: "date",
  },
  {
    key: "resources_count",
    label: "resources_count",
    icon: "number",
    width: "w-[136px]",
    widthPx: 136,
    filter: "number",
    type: "number",
  },
  {
    key: "main_resources_count",
    label: "main_resources_count",
    icon: "number",
    width: "w-[176px]",
    widthPx: 176,
    filter: "number",
    type: "number",
  },
  {
    key: "resources_formats",
    label: "resources_formats",
    icon: "category",
    width: "w-[180px]",
    widthPx: 180,
    filter: "category",
    type: "category",
  },
  {
    key: "quality_score",
    label: "quality_score",
    icon: "number",
    width: "w-[128px]",
    widthPx: 128,
    filter: "number",
    type: "number",
  },
  {
    key: "metric.views",
    label: "metric.views",
    icon: "number",
    width: "w-[120px]",
    widthPx: 120,
    filter: "number",
    type: "number",
  },
  {
    key: "metric.resources_downloads",
    label: "metric.resources_downloads",
    icon: "number",
    width: "w-[196px]",
    widthPx: 196,
    filter: "number",
    type: "number",
  },
];

type ColumnKey = string;
type Row = Record<ColumnKey, string>;

function tableColumnFromSchema(
  column: InspectSchemaResult["columns"][number],
): TableColumn {
  const normalizedType = column.type.toUpperCase();
  const isNumber = /\b(?:TINYINT|SMALLINT|INTEGER|BIGINT|HUGEINT|FLOAT|DOUBLE|DECIMAL|NUMERIC)\b/.test(
    normalizedType,
  );
  const isDate = /\b(?:DATE|TIME|TIMESTAMP|INTERVAL)\b/.test(normalizedType);
  const isCategory = /\bBOOLEAN\b/.test(normalizedType);

  return {
    key: column.name,
    label: column.name,
    icon: isNumber ? "number" : isDate ? "calendar" : isCategory ? "category" : "text",
    width: "w-[180px]",
    widthPx: isNumber ? 136 : isDate ? 160 : 220,
    filter: isNumber ? "number" : isDate ? "date" : "category",
    type: isNumber ? "number" : isDate ? "date" : isCategory ? "category" : "text",
  };
}
type SortDirection = "asc" | "desc";
type SortState = {
  key: ColumnKey;
  direction: SortDirection;
} | null;
type ActiveCell = {
  id: string;
  key: ColumnKey;
  value: string;
  type: ColumnType;
} | null;
type ExplorerTab =
  | "Aperçu"
  | "Carte"
  | "Description"
  | "Structure des données"
  | "Métadonnées"
  | "API";

type NumberRange = {
  min: string;
  max: string;
};

type DateFilterMode = "before" | "after" | "between";

type DateFilterValue = {
  mode: DateFilterMode;
  value: string;
  endValue: string;
};

const dateFilterModeLabels = {
  before: "avant",
  after: "après",
  between: "entre",
} satisfies Record<DateFilterMode, string>;

const emptyDateFilter: DateFilterValue = {
  mode: "before",
  value: "",
  endValue: "",
};

function parseNumber(value: string) {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));

  return Number.isNaN(parsed) ? 0 : parsed;
}

function isDateFilterActive(filter?: DateFilterValue) {
  if (!filter) {
    return false;
  }

  return Boolean(filter.value.trim() || filter.endValue.trim());
}

function getDateFilterChipValue(filter: DateFilterValue) {
  if (filter.mode === "between") {
    return `${dateFilterModeLabels[filter.mode]} ${filter.value || "début"} et ${
      filter.endValue || "fin"
    }`;
  }

  return `${dateFilterModeLabels[filter.mode]} ${filter.value}`;
}

const rows: Row[] = [
  {
    id: "6a49d1551d9a958fd2b55a2d",
    title: "Empreinte du classement sonore routier révisé en 2020 sur le département de la Sarthe.",
    slug: "empreinte-du-classement-sonore-routier-revise-en-2020-sur-le-departement-de-la-sarthe-1",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/empreinte-du-classement-sonore-routier-revise-en-2020-sur-le-departement-de-la-sarthe-1",
    organization: "Direction Départementale des Territoires de la Sarthe",
    frequency: "",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "other",
    featured: "false",
    created_at: "2025-08-26",
    last_modified: "2025-08-19",
    resources_count: "6",
    main_resources_count: "2",
    resources_formats: "wms,esri shapefile (shp),wfs",
    quality_score: "0.56",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a4885d38637ecc0d6b55a21",
    title: "Déclaration de l'acquisition de biens issus du réemploi, de la réutilisation ou intégrant des matières recyclées",
    slug: "declaration-de-lacquisition-de-biens-issus-du-reemploi-de-la-reutilisation-ou-integrant-des-matieres-recyclees-8",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/declaration-de-lacquisition-de-biens-issus-du-reemploi-de-la-reutilisation-ou-integrant-des-matieres-recyclees-8",
    organization: "Angers Loire Métropole",
    frequency: "annual",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "",
    featured: "false",
    created_at: "2025-06-29",
    last_modified: "2026-07-03",
    resources_count: "2",
    main_resources_count: "2",
    resources_formats: "json,csv",
    quality_score: "0.89",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a487806f3c8dc19c7398ec0",
    title: "Programme de la fête de la Science 2026",
    slug: "programme-de-la-fete-de-la-science-2026",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/programme-de-la-fete-de-la-science-2026",
    organization: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Espace",
    frequency: "",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-03",
    resources_count: "4",
    main_resources_count: "4",
    resources_formats: "zip,json,csv",
    quality_score: "0.56",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a484e8377fe8edd90b55a12",
    title: "Dernier prix des services de l'eau",
    slug: "dernier-prix-des-services-de-leau",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/dernier-prix-des-services-de-leau",
    organization: "Office Français de la Biodiversité",
    frequency: "",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "other",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-04",
    resources_count: "3",
    main_resources_count: "2",
    resources_formats: "wfs,autre",
    quality_score: "0.67",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a484e7a77fe8edd90b55a11",
    title: "Habitats marins du site Natura 2000 FR5300011 Cap d'Erquy-Cap Fréhel",
    slug: "habitats-marins-du-site-natura-2000-fr5300011-cap-derquy-cap-frehel-etat-1979-2023-synthese-ofb-multisource-version-2026-polygones-point",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/habitats-marins-du-site-natura-2000-fr5300011-cap-derquy-cap-frehel-etat-1979-2023-synthese-ofb-multisource-version-2026-polygones-point",
    organization: "Office Français de la Biodiversité",
    frequency: "irregular",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "other",
    featured: "false",
    created_at: "2025-07-05",
    last_modified: "2026-07-04",
    resources_count: "1",
    main_resources_count: "1",
    resources_formats: "ogc:ows-c",
    quality_score: "1",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a484dde87aaebee80398e9c",
    title: "Sites économiques",
    slug: "sites-economiques-2",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/sites-economiques-2",
    organization: "Géo2France",
    frequency: "severalTimesADay",
    license: "License Not Specified",
    "spatial.granularity": "other",
    featured: "false",
    created_at: "2024-02-19",
    last_modified: "2026-07-04",
    resources_count: "1",
    main_resources_count: "1",
    resources_formats: "ogc:wms",
    quality_score: "0.89",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a477136bf5a20ae0375c229",
    title: "Conseils Municipaux 2025",
    slug: "conseils-municipaux-2025",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/conseils-municipaux-2025",
    organization: "Commune de TEMPLEMARS",
    frequency: "continuous",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "fr:commune",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-03",
    resources_count: "6",
    main_resources_count: "6",
    resources_formats: "pdf",
    quality_score: "0.89",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a484dd38637ecc0d6b559f6",
    title: "Trajectoires passées des bénéficiaires de minima sociaux et Sortie des minima sociaux",
    slug: "trajectoires-passees-des-beneficiaires-de-minima-sociaux-et-sortie-des-minima-sociaux",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/trajectoires-passees-des-beneficiaires-de-minima-sociaux-et-sortie-des-minima-sociaux",
    organization: "Ministère des Solidarités et de la Santé",
    frequency: "",
    license: "License Not Specified",
    "spatial.granularity": "",
    featured: "false",
    created_at: "2026-07-02",
    last_modified: "2026-07-02",
    resources_count: "2",
    main_resources_count: "0",
    resources_formats: "xlsx",
    quality_score: "0.44",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a483641bb48c96e60ad5f3e",
    title: "Annuaire des écoles de danse en France",
    slug: "annuaire-des-ecoles-de-danse-en-france",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/annuaire-des-ecoles-de-danse-en-france",
    organization: "",
    frequency: "weekly",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "fr:commune",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-03",
    resources_count: "1",
    main_resources_count: "1",
    resources_formats: "csv",
    quality_score: "0.89",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a47ce03313cca990f3ef6df",
    title: "1 700 rivières contaminées - jeu de données des moyennes par station et substance",
    slug: "1-700-rivieres-contaminees-jeu-de-donnees-des-moyennes-par-station-et-substance",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/1-700-rivieres-contaminees-jeu-de-donnees-des-moyennes-par-station-et-substance",
    organization: "",
    frequency: "notPlanned",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "other",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-03",
    resources_count: "1",
    main_resources_count: "1",
    resources_formats: "csv",
    quality_score: "1",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a47ac61e410ffaf0d3e6d1c",
    title: "IRVE_STatique_ENGIE_Vianeo_All_Juillet 2026",
    slug: "irve-statique-engie-vianeo-all-juillet-2026",
    acronym: "EME_Juillet2026",
    url: "https://www.data.gouv.fr/datasets/irve-statique-engie-vianeo-all-juillet-2026",
    organization: "Engie Mobilités Electriques",
    frequency: "monthly",
    license: "Licence Ouverte / Open Licence version 2.0",
    "spatial.granularity": "fr:commune",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-03",
    resources_count: "1",
    main_resources_count: "1",
    resources_formats: "csv",
    quality_score: "0.78",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
  {
    id: "6a47864eb28c51db7a844d08",
    title: "SMIC historique France 2001-2026 (brut horaire et mensuel, 34 revalorisations)",
    slug: "smic-historique-france-2001-2026-brut-horaire-et-mensuel-34-revalorisations",
    acronym: "",
    url: "https://www.data.gouv.fr/datasets/smic-historique-france-2001-2026-brut-horaire-et-mensuel-34-revalorisations",
    organization: "MaCalculatriceEnLigne",
    frequency: "annual",
    license: "Creative Commons Attribution",
    "spatial.granularity": "",
    featured: "false",
    created_at: "2026-07-03",
    last_modified: "2026-07-03",
    resources_count: "2",
    main_resources_count: "2",
    resources_formats: "png,csv",
    quality_score: "0.67",
    "metric.views": "0",
    "metric.resources_downloads": "0",
  },
];

function getDepartmentReferenceLabel(value: string) {
  return value || "Donnée de référence";
}

function getRowValue(row: Row, key: ColumnKey) {
  return row[key];
}

function StructureMetricRow({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon?: keyof typeof icons;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "error" | "purple";
}) {
  const toneClassNames = {
    neutral: "text-[#3a3a3a]",
    success: "text-[#18753c]",
    warning: "text-[#716043]",
    error: "text-[#b34000]",
    purple: "text-[#7b4fbf]",
  };

  return (
    <div className="flex h-6 min-w-[128px] items-center gap-2 text-[13px] leading-[1.4]">
      <div className="flex min-w-0 items-center gap-1">
        {icon ? (
          <Icon
            path={icons[icon]}
            className={`h-4 w-4 ${toneClassNames[tone]}`}
          />
        ) : null}
        <span
          className={`truncate ${tone === "neutral" ? "text-[#3a3a3a]" : toneClassNames[tone]}`}
        >
          {label}
        </span>
      </div>
      <span
        className={`shrink-0 font-bold ${tone === "neutral" ? "text-[#161616]" : toneClassNames[tone]}`}
      >
        {value}
      </span>
    </div>
  );
}

function StructureSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <h2 className="mb-2 text-[14px] font-bold leading-6 text-[#161616]">
        {title}
      </h2>
      <div className="flex flex-wrap gap-x-5 gap-y-1">{children}</div>
    </section>
  );
}

const distributionHeights = [88, 106, 138, 97, 37, 23, 18, 9, 37, 64, 97, 46];

function getColumnTypeLabel(type: ColumnType) {
  if (type === "referenceData") {
    return "Données de référence";
  }

  if (type === "reference") {
    return "Référentiel";
  }

  if (type === "identifier") {
    return "Identifiant";
  }

  if (type === "category") {
    return "Catégoriel";
  }

  if (type === "number") {
    return "Nombre";
  }

  if (type === "date") {
    return "Date";
  }

  return "Texte";
}

function getColumnQuality(index: number) {
  const valid = 74 + ((index * 7) % 21);
  const nonConforming = 2 + (index % 5);
  const missing = Math.max(0, 100 - valid - nonConforming);

  return { valid, nonConforming, missing };
}

function getColumnFrequentValues(column: TableColumn) {
  const counts = rows.reduce((accumulator, row) => {
    const value = getRowValue(row, column.key);
    accumulator.set(value, (accumulator.get(value) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 10)
    .map(([label, count]) => ({
      label,
      value: `${count} (${Math.round((count / rows.length) * 100)}%)`,
    }));
}

function getColumnUniqueCount(column: TableColumn) {
  return new Set(rows.map((row) => getRowValue(row, column.key))).size;
}

function getColumnExampleValues(column: TableColumn) {
  return Array.from(new Set(rows.map((row) => getRowValue(row, column.key)))).slice(
    0,
    5,
  );
}

function getNumberStats(column: TableColumn) {
  const values = rows
    .map((row) => parseNumber(getRowValue(row, column.key)))
    .sort((first, second) => first - second);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
  const middleIndex = Math.floor(values.length / 2);
  const median =
    values.length % 2 === 0
      ? Math.round((values[middleIndex - 1] + values[middleIndex]) / 2)
      : values[middleIndex];
  const standardDeviation = Math.round(
    Math.sqrt(
      values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
        values.length,
    ),
  );

  return { min, max, average, median, standardDeviation };
}

function getDateStats(column: TableColumn) {
  const timestamps = rows
    .map((row) => new Date(getRowValue(row, column.key)).getTime())
    .filter((timestamp) => !Number.isNaN(timestamp));

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    min: formatter.format(new Date(Math.min(...timestamps))),
    max: formatter.format(new Date(Math.max(...timestamps))),
  };
}

function StructureDetailStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 text-[14px] leading-6">
      <span className="font-bold text-[#161616]">{label}</span>
      <span className="text-[#3a3a3a]">{value}</span>
    </div>
  );
}

function StructureColumnExpandedContent({
  column,
  quality,
}: {
  column: TableColumn;
  quality: ReturnType<typeof getColumnQuality>;
}) {
  const frequentColumnValues = getColumnFrequentValues(column);
  const exampleValues = getColumnExampleValues(column);

  if (column.type === "number") {
    const stats = getNumberStats(column);

    return (
      <div className="grid grid-cols-5 gap-5">
        <StructureDetailStat label="Minimum" value={String(stats.min)} />
        <StructureDetailStat label="Maximum" value={String(stats.max)} />
        <StructureDetailStat label="Moyenne" value={String(stats.average)} />
        <StructureDetailStat label="Médiane" value={String(stats.median)} />
        <StructureDetailStat
          label="Écart type"
          value={String(stats.standardDeviation)}
        />
        <div className="col-span-5 flex h-[104px] items-end gap-[2px] border-b border-[#E5E5E5]">
          {distributionHeights.map((height, index) => (
            <div
              key={`${height}-${index}`}
              className="min-w-0 flex-1 rounded-t-[1px] bg-[#b6cffb]"
              style={{ height: Math.max(10, height - 28) }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (column.type === "date") {
    const stats = getDateStats(column);

    return (
      <div className="grid grid-cols-3 gap-5">
        <StructureDetailStat label="Première date" value={stats.min} />
        <StructureDetailStat label="Dernière date" value={stats.max} />
        <StructureDetailStat label="Valeurs renseignées" value={`${quality.valid}%`} />
      </div>
    );
  }

  if (column.type === "identifier") {
    return (
      <div className="grid grid-cols-3 gap-5">
        <StructureDetailStat
          label="Unicité"
          value={`${getColumnUniqueCount(column)} valeurs uniques`}
        />
        <StructureDetailStat label="Format" value="Identifiant stable" />
        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-bold leading-6 text-[#161616]">
            Exemples
          </p>
          <div className="flex flex-wrap gap-1">
            {exampleValues.map((value) => (
              <span
                key={value}
                className="rounded-[2px] bg-[#f6f6f6] px-1 font-mono text-[14px] leading-6 text-[#3a3a3a]"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-bold leading-6 text-[#161616]">
          Valeurs les plus fréquentes
        </p>
        <div className="flex flex-col gap-1">
          {frequentColumnValues.slice(0, 10).map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[minmax(0,1fr)_72px] items-center gap-2 text-[14px] leading-6 text-[#3a3a3a]"
            >
              <span className="w-fit max-w-full truncate rounded-[2px] bg-[#f6f6f6] px-1 text-[#3a3a3a]">
                {item.label}
              </span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <StructureDetailStat
        label="Valeurs uniques"
        value={String(getColumnUniqueCount(column))}
      />
    </div>
  );
}

function TableValuePreview({
  value,
  type,
}: {
  value: string;
  type: ColumnType;
}) {
  if (type === "category" || type === "reference") {
    return (
      <span className="truncate rounded bg-[#eeeeee] px-2 py-1 text-[12px] leading-3 text-[#3a3a3a]">
        {value}
      </span>
    );
  }

  if (type === "identifier") {
    return <span className="truncate text-[12px] text-[#3a3a3a]">{value}</span>;
  }

  return <span className="truncate text-[12px] text-[#161616]">{value}</span>;
}

function StructureColumnRow({
  column,
  index,
  expanded,
  onToggle,
}: {
  column: TableColumn;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const quality = getColumnQuality(index);
  const uniqueCount = getColumnUniqueCount(column);
  const previewValue = getColumnExampleValues(column)[0] ?? "—";
  const validCount = Math.round((quality.valid / 100) * rows.length);
  const nonConformingCount = Math.round(
    (quality.nonConforming / 100) * rows.length,
  );
  const missingCount = Math.max(rows.length - validCount - nonConformingCount, 0);
  const validPercent = Math.round((validCount / rows.length) * 100);
  const nonConformingPercent = Math.round(
    (nonConformingCount / rows.length) * 100,
  );
  const missingPercent = Math.round((missingCount / rows.length) * 100);
  const uniquePercent = Math.round((uniqueCount / rows.length) * 100);

  return (
    <Fragment>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="grid w-full grid-cols-[40px_minmax(220px,1.2fr)_150px_90px_120px_140px_130px_130px_minmax(0,150px)] text-left text-[12px] leading-4 hover:bg-[#f6f6f6]"
      >
        <span className="flex h-8 items-center justify-center border-b border-r border-[#E5E5E5]">
          <Icon
            path={icons.arrowRightS}
            className={`h-4 w-4 text-[#3a3a3a] ${expanded ? "rotate-90" : ""}`}
          />
        </span>
        <div className="flex h-8 min-w-0 items-center gap-1 border-b border-r border-[#E5E5E5] px-2">
          <span className="truncate font-medium text-[#161616]">
            {column.label}
          </span>
        </div>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          <span
            className={`flex min-w-0 items-center gap-1 rounded-[2px] px-1 ${
              column.type === "referenceData" ? "bg-[#f4efff]" : "bg-[#f6f6f6]"
            }`}
          >
            <Icon
              path={icons[column.icon]}
              className={`h-4 w-4 shrink-0 ${
                column.type === "referenceData" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"
              }`}
            />
            <span
              className={`truncate ${
                column.type === "referenceData" ? "text-[#7b4fbf]" : ""
              }`}
            >
              {getColumnTypeLabel(column.type)}
            </span>
          </span>
        </span>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          {rows.length}
        </span>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          {validCount} ({validPercent} %)
        </span>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          {nonConformingCount} ({nonConformingPercent} %)
        </span>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          {missingCount} ({missingPercent} %)
        </span>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          <span>
            {uniqueCount} ({uniquePercent} %)
          </span>
        </span>
        <span
          className={`flex h-8 min-w-0 items-center border-b border-r border-[#E5E5E5] px-2 ${
            column.type === "number" ? "text-right" : ""
          }`}
        >
          <span className="min-w-0 max-w-full truncate">
            <TableValuePreview value={previewValue} type={column.type} />
          </span>
        </span>
      </button>
      {expanded ? (
        <div className="border-b border-r border-[#E5E5E5] bg-[#FFFFFF] px-2 py-4">
          <StructureColumnExpandedContent column={column} quality={quality} />
        </div>
      ) : null}
    </Fragment>
  );
}

function StructureColumnCard({
  column,
  index,
  expanded,
  onToggle,
}: {
  column: TableColumn;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const quality = getColumnQuality(index);
  const uniqueCount = getColumnUniqueCount(column);
  const previewValue = getColumnExampleValues(column)[0] ?? "—";
  const validCount = Math.round((quality.valid / 100) * rows.length);
  const nonConformingCount = Math.round(
    (quality.nonConforming / 100) * rows.length,
  );
  const missingCount = Math.max(rows.length - validCount - nonConformingCount, 0);
  const validPercent = Math.round((validCount / rows.length) * 100);
  const nonConformingPercent = Math.round(
    (nonConformingCount / rows.length) * 100,
  );
  const missingPercent = Math.round((missingCount / rows.length) * 100);
  const uniquePercent = Math.round((uniqueCount / rows.length) * 100);

  return (
    <article className="rounded border border-[#E5E5E5] bg-[#FFFFFF]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start gap-2 p-3 text-left"
      >
        <Icon
          path={icons.arrowRightS}
          className={`mt-0.5 h-4 w-4 shrink-0 text-[#3a3a3a] ${
            expanded ? "rotate-90" : ""
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate text-[13px] font-bold leading-5 text-[#161616]">
              {column.label}
            </span>
            <span
              className={`flex min-w-0 shrink-0 items-center gap-1 rounded-[2px] px-1 text-[12px] ${
                column.type === "referenceData" ? "bg-[#f4efff]" : "bg-[#f6f6f6]"
              }`}
            >
              <Icon
                path={icons[column.icon]}
                className={`h-3.5 w-3.5 shrink-0 ${
                  column.type === "referenceData"
                    ? "text-[#7b4fbf]"
                    : "text-[#3a3a3a]"
                }`}
              />
              <span
                className={`truncate ${
                  column.type === "referenceData" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"
                }`}
              >
                {getColumnTypeLabel(column.type)}
              </span>
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] leading-4 text-[#3a3a3a]">
            <div>
              <dt className="text-[#666666]">Valeurs</dt>
              <dd className="font-medium text-[#161616]">{rows.length}</dd>
            </div>
            <div>
              <dt className="text-[#666666]">Distinctes</dt>
              <dd className="font-medium text-[#161616]">
                {uniqueCount} ({uniquePercent} %)
              </dd>
            </div>
            <div>
              <dt className="text-[#666666]">Valides</dt>
              <dd className="font-medium text-[#161616]">
                {validCount} ({validPercent} %)
              </dd>
            </div>
            <div>
              <dt className="text-[#666666]">Manquantes</dt>
              <dd className="font-medium text-[#161616]">
                {missingCount} ({missingPercent} %)
              </dd>
            </div>
            <div>
              <dt className="text-[#666666]">Non conformes</dt>
              <dd className="font-medium text-[#161616]">
                {nonConformingCount} ({nonConformingPercent} %)
              </dd>
            </div>
            <div className="col-span-2 min-w-0">
              <dt className="text-[#666666]">Aperçu</dt>
              <dd className="min-w-0 truncate">
                <TableValuePreview value={previewValue} type={column.type} />
              </dd>
            </div>
          </dl>
        </div>
      </button>
      {expanded ? (
        <div className="border-t border-[#E5E5E5] px-3 py-4">
          <StructureColumnExpandedContent column={column} quality={quality} />
        </div>
      ) : null}
    </article>
  );
}

// Kept for future prototype variants; this route is intentionally table-only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StructurePanel() {
  const [openColumnKey, setOpenColumnKey] = useState<ColumnKey | null>(null);
  const columnTypeCounts = {
    number: tableColumns.filter((column) => column.type === "number").length,
    category: tableColumns.filter((column) => column.type === "category").length,
    text: tableColumns.filter((column) => column.type === "text").length,
    date: tableColumns.filter((column) => column.type === "date").length,
    identifier: tableColumns.filter((column) => column.type === "identifier").length,
    reference: tableColumns.filter(
      (column) =>
        column.type === "reference" || column.type === "referenceData",
    ).length,
  };

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#FFFFFF] p-4">
      <div className="flex w-full flex-col gap-5 text-[#3a3a3a]">
        <div className="flex w-full flex-col gap-4">
          <StructureSection title="Résumé">
            <StructureMetricRow
              icon="columns"
              label="Colonnes"
              value={String(tableColumns.length)}
            />
            <StructureMetricRow
              icon="rows"
              label="Lignes"
              value={String(rows.length)}
            />
            <StructureMetricRow
              icon="number"
              label="Nombre"
              value={String(columnTypeCounts.number)}
            />
            <StructureMetricRow
              icon="category"
              label="Catégoriel"
              value={String(columnTypeCounts.category)}
            />
            <StructureMetricRow
              icon="text"
              label="Texte"
              value={String(columnTypeCounts.text)}
            />
            <StructureMetricRow
              icon="calendar"
              label="Date"
              value={String(columnTypeCounts.date)}
            />
            <StructureMetricRow
              icon="identifier"
              label="Identifiant"
              value={String(columnTypeCounts.identifier)}
            />
            <StructureMetricRow
              icon="referenceData"
              label="Données de références"
              value={String(columnTypeCounts.reference)}
              tone="purple"
            />
          </StructureSection>

        </div>

        <section>
          <h2 className="mb-3 text-[14px] font-bold leading-6 text-[#161616]">
            Colonnes
          </h2>
          <div className="mobile-structure-cards flex-col gap-2">
            {tableColumns.map((column, index) => (
              <StructureColumnCard
                key={column.key}
                column={column}
                index={index}
                expanded={openColumnKey === column.key}
                onToggle={() =>
                  setOpenColumnKey((current) =>
                    current === column.key ? null : column.key,
                  )
                }
              />
            ))}
          </div>
          <div className="desktop-structure-table min-w-[1280px] overflow-hidden border-l border-t border-[#E5E5E5] bg-[#FFFFFF]">
            <div className="grid grid-cols-[40px_minmax(220px,1.2fr)_150px_90px_120px_140px_130px_130px_minmax(0,150px)] bg-[#f6f6f6] text-[12px] font-bold leading-4 text-[#161616]">
              <span className="flex h-12 items-center justify-center border-b border-r border-[#E5E5E5] px-2">
                <span className="sr-only">Déplier</span>
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Nom de la colonne
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Type
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Valeur
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Valides
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Non conformes
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Manquantes
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Distinctes
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Aperçu
              </span>
            </div>
            {tableColumns.map((column, index) => (
              <StructureColumnRow
                key={column.key}
                column={column}
                index={index}
                expanded={openColumnKey === column.key}
                onToggle={() =>
                  setOpenColumnKey((current) =>
                    current === column.key ? null : column.key,
                  )
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

type RemixIconComponent = ComponentType<{
  className?: string;
  size?: number | string;
  color?: string;
}>;

function Icon({
  path: IconComponent,
  className = "h-4 w-4 text-[#3a3a3a]",
}: {
  path: RemixIconComponent;
  className?: string;
}) {
  return <IconComponent aria-hidden="true" className={className} />;
}

const icons = {
  table: RiTableLine,
  search: RiSearchLine,
  file: RiFileLine,
  code: RiTerminalLine,
  category: RiPriceTag3Line,
  calendar: RiCalendarLine,
  download: RiDownloadLine,
  fullscreen: RiFullscreenLine,
  fullscreenExit: RiFullscreenExitLine,
  externalLink: RiExternalLinkLine,
  copy: RiFileCopyLine,
  filter: RiFilterLine,
  geodata: RiMap2Line,
  check: RiCheckLine,
  close: RiCloseLine,
  codeAi: RiCodeAiLine,
  dashboard: RiDashboard2Line,
  conform: RiCheckboxCircleLine,
  arrowDown: RiArrowDownLine,
  arrowDownS: RiArrowDownSLine,
  arrowDropDown: RiArrowDropDownLine,
  arrowRightS: RiArrowRightSLine,
  arrowUp: RiArrowUpLine,
  issue: RiQuestionLine,
  sparkle: RiSparklingLine,
  send: RiSendPlaneLine,
  missing: RiErrorWarningLine,
  identifier: RiFingerprintLine,
  number: RiHashtag,
  columns: RiLayoutVerticalLine,
  documentation: RiBook2Line,
  reference: RiDatabase2Line,
  referenceData: RiSparklingLine,
  rows: RiLayoutHorizontalLine,
  sidebarFold: RiSidebarFoldLine,
  sidebarUnfold: RiSidebarUnfoldLine,
  text: RiText,
  brain: RiBrainLine,
  wrench: RiWrenchLine,
  thumbUp: RiThumbUpLine,
  thumbDown: RiThumbDownLine,
} satisfies Record<string, RemixIconComponent>;

function FormatTag({ children }: { children: string }) {
  return (
    <span className="rounded bg-[#eeeeee] px-2 py-0.5 text-[12px] leading-4 text-[#3a3a3a]">
      {children}
    </span>
  );
}

const resourceIconStyles = {
  table: "bg-[#c3fad5] text-[#18753c]",
  geodata: "bg-[#e6eefe] text-[#0063cb]",
  code: "bg-[#fce164] text-[#716043]",
  documentation: "bg-[#fee7fc] text-[#6e445a]",
} satisfies Record<ResourceType, string>;

function ResourceItem({
  resource,
  active,
  onSelect,
  onShowTooltip,
  onHideTooltip,
}: {
  resource: Resource;
  active: boolean;
  onSelect: () => void;
  onShowTooltip: (resource: Resource, element: HTMLButtonElement) => void;
  onHideTooltip: () => void;
}) {
  function showTooltip(
    event:
      | ReactMouseEvent<HTMLButtonElement>
      | ReactFocusEvent<HTMLButtonElement>,
  ) {
    onShowTooltip(resource, event.currentTarget);
  }

  return (
    <button
      type="button"
      onClick={() => {
        onHideTooltip();
        onSelect();
      }}
      onMouseEnter={showTooltip}
      onMouseLeave={onHideTooltip}
      onFocus={showTooltip}
      onBlur={onHideTooltip}
      className={`group/resource relative grid h-7 w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-1 rounded px-1 py-1 text-left ${
        active ? "bg-[#eeeeee]" : "hover:bg-[#f6f6f6]"
      }`}
    >
      <span
        className={`flex shrink-0 items-center rounded-[1px] p-0.5 ${resourceIconStyles[resource.type]}`}
      >
        <Icon path={icons[resource.type]} className="h-4 w-4" />
      </span>
      <span
        className={`min-w-0 truncate text-[13px] ${
          active ? "font-extrabold text-[#161616]" : "font-medium text-[#3a3a3a]"
        }`}
      >
        {resource.name}
      </span>
      <span className="shrink-0 whitespace-nowrap text-[12px] text-[#3a3a3a]">
        {resource.size}
      </span>
      <FormatTag>{resource.format}</FormatTag>
    </button>
  );
}

function DatasetContextHeader({
  title,
  updatedAt,
  actions,
}: {
  title: string;
  updatedAt: string;
  actions: ReactNode;
}) {
  return (
    <div className="flex h-[58px] shrink-0 items-center justify-between gap-2 border-b border-[#E5E5E5] bg-[#f6f6f6]/95 px-3 backdrop-blur-[5px] sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[2px] border border-[#E5E5E5] bg-[#FFFFFF] p-1">
          <div className="flex h-full w-full items-center justify-center rounded-[1px] border border-[#eeeeee] text-[8px] font-bold leading-3 text-[#000091]">
            DG
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-1 text-[13px] leading-[1.4] sm:text-[16px]">
          <span className="min-w-0 truncate text-[#161616]">
            data.gouv.fr
          </span>
          <span className="shrink-0 text-[#161616]">/</span>
          <span className="min-w-0 truncate font-bold text-[#161616]">
            {title}
          </span>
          <span className="hidden shrink-0 text-[#3a3a3a] sm:inline">·</span>
          <span className="hidden truncate text-[#3a3a3a] sm:inline">
            mis à jour le {updatedAt}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  );
}

function HeaderCell({
  column,
  width,
  isOpen,
  sortDirection,
  onOpen,
  onResizeStart,
}: {
  column: (typeof tableColumns)[number];
  width: number;
  isOpen: boolean;
  sortDirection?: SortDirection;
  onOpen: () => void;
  onResizeStart: (event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div
      className="relative flex h-12 shrink-0 items-center justify-between border-r border-[#E5E5E5] px-3"
      style={{ width }}
    >
      <div className="flex min-w-0 items-center gap-1">
        <Icon
          path={icons[column.icon]}
          className={`h-4 w-4 ${
            column.icon === "referenceData" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"
          }`}
        />
        <span className="truncate text-[12px] font-bold text-[#161616]">
          {column.label}
        </span>
        {sortDirection ? (
          <Icon
            path={sortDirection === "asc" ? icons.arrowUp : icons.arrowDown}
            className="h-3.5 w-3.5 shrink-0 text-[#000091]"
          />
        ) : null}
      </div>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Filtrer ${column.label}`}
        title={`Filtrer ${column.label}`}
        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded transition-colors hover:bg-[#eeeeee] ${
          isOpen ? "bg-[#e8edff]" : ""
        }`}
      >
        <Icon
          path={icons.filter}
          className={`h-4 w-4 ${isOpen ? "text-[#000091]" : "text-[#CECECE]"}`}
        />
      </button>
      <button
        type="button"
        aria-label={`Redimensionner ${column.label}`}
        title={`Redimensionner ${column.label}`}
        onMouseDown={onResizeStart}
        className="absolute -right-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none"
      >
        <span className="mx-auto block h-full w-px bg-transparent transition-colors hover:bg-[#000091]" />
      </button>
    </div>
  );
}

function SortControls({
  column,
  sortState,
  onSort,
}: {
  column: (typeof tableColumns)[number];
  sortState: SortState;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
}) {
  return (
    <div className="flex h-9 items-center justify-between border-b border-[#E5E5E5] px-2 text-[12px]">
      <span className="font-medium text-[#161616]">Trier</span>
      <div className="flex items-center gap-1">
        {(["asc", "desc"] as const).map((direction) => {
          const isActive =
            sortState?.key === column.key && sortState.direction === direction;

          return (
            <button
              key={direction}
              type="button"
              onClick={() => onSort(column.key, direction)}
              className={`flex h-6 items-center gap-1 rounded px-2 ${
                isActive
                  ? "bg-[#e8edff] text-[#000091]"
                  : "text-[#3a3a3a] hover:bg-[#eeeeee]"
              }`}
            >
              <Icon
                path={direction === "asc" ? icons.arrowUp : icons.arrowDown}
                className={`h-3.5 w-3.5 ${
                  isActive ? "text-[#000091]" : "text-[#3a3a3a]"
                }`}
              />
              {direction === "asc" ? "Croissant" : "Décroissant"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxMark({ checked = false }: { checked?: boolean }) {
  return (
    <span
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
        checked ? "border-[#000091] bg-[#000091]" : "border-[#161616] bg-[#FFFFFF]"
      }`}
    >
      {checked ? (
        <Icon path={icons.check} className="h-2.5 w-2.5 text-[#FFFFFF]" />
      ) : null}
    </span>
  );
}

function FilterOption({
  label,
  count,
  checked = false,
  onToggle,
}: {
  label: string;
  count: number;
  checked?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-8 w-full items-center gap-2 rounded px-1 text-left hover:bg-[#eeeeee]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <CheckboxMark checked={checked} />
        <span className="rounded bg-[#eeeeee] px-2 py-1 text-[12px] leading-3 text-[#3a3a3a]">
          {label}
        </span>
      </div>
      <span className="px-2 text-[12px] text-[#3a3a3a]">{count}</span>
    </button>
  );
}

function ColumnSelector({
  columns,
  selectedColumnKeys,
  onToggleColumn,
  onSelectAll,
  onClearAll,
  onClose,
}: {
  columns: TableColumn[];
  selectedColumnKeys: ColumnKey[];
  onToggleColumn: (key: ColumnKey) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-7 z-30 flex w-60 flex-col overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
      <div className="flex h-8 items-center gap-1 border-b border-[#E5E5E5] bg-[#f6f6f6] px-2">
        <p className="min-w-0 flex-1 text-[12px] font-bold text-[#161616]">
          {selectedColumnKeys.length} sur {columns.length} colonnes visibles
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la sélection des colonnes"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#eeeeee]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <div className="max-h-64 overflow-auto border-b border-[#E5E5E5] p-1">
        {columns.map((column) => {
          const checked = selectedColumnKeys.includes(column.key);

          return (
            <button
              key={column.key}
              type="button"
              onClick={() => onToggleColumn(column.key)}
              className="flex h-8 w-full items-center gap-2 rounded px-1 text-left hover:bg-[#eeeeee]"
            >
              <CheckboxMark checked={checked} />
              <span className="truncate text-[13px] font-medium leading-5 text-[#161616]">
                {column.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1 px-2 py-1">
        <button
          type="button"
          onClick={onClearAll}
          className="h-6 px-1 text-[12px] font-medium leading-6 text-[#161616] hover:underline"
        >
          Décocher tout
        </button>
        <button
          type="button"
          onClick={onSelectAll}
          className="h-6 px-1 text-[12px] font-medium leading-6 text-[#161616] hover:underline"
        >
          Cocher tout
        </button>
      </div>
    </div>
  );
}

function CategoryFilterMenu({
  column,
  left,
  options,
  selectedValues,
  searchValue,
  sortState,
  onSearchChange,
  onToggleValue,
  onSort,
  onClose,
}: {
  column: TableColumn;
  left: number;
  options: { label: string; count: number }[];
  selectedValues: string[];
  searchValue: string;
  sortState: SortState;
  onSearchChange: (key: ColumnKey, value: string) => void;
  onToggleValue: (key: ColumnKey, value: string) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClose: () => void;
}) {
  const id = column.key;
  const label = column.label;
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div
      className={`filter-popover filter-popover-${id} absolute top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
      style={{ left }}
    >
      <div className="flex h-8 items-center gap-1 border-b border-[#E5E5E5] bg-[#f6f6f6] px-2">
        <p className="min-w-0 flex-1 text-[12px] text-[#161616]">
          <span className="font-bold">Filtrer : </span>
          <span>{label}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le filtre"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#eeeeee]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <SortControls column={column} sortState={sortState} onSort={onSort} />

      <label className="flex h-9 items-center gap-1 border-b border-[#E5E5E5] px-2">
        <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(id, event.target.value)}
          aria-label={`Rechercher dans ${column.label}`}
          placeholder="Rechercher"
          className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
        />
      </label>

      <div className="border-b border-[#E5E5E5] p-1">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <FilterOption
              key={option.label}
              label={option.label}
              count={option.count}
              checked={selectedValues.includes(option.label)}
              onToggle={() => onToggleValue(id, option.label)}
            />
          ))
        ) : (
          <div className="flex h-8 items-center px-1 text-[12px] text-[#3a3a3a]">
            Aucun résultat
          </div>
        )}
      </div>
    </div>
  );
}

function NumberFilterMenu({
  column,
  left,
  range,
  sortState,
  onChangeRange,
  onSort,
  onClear,
  onClose,
}: {
  column: TableColumn;
  left: number;
  range: NumberRange;
  sortState: SortState;
  onChangeRange: (key: ColumnKey, range: NumberRange) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClear: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const id = column.key;
  const label = column.label;

  return (
    <div
      className={`filter-popover filter-popover-${id} absolute top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
      style={{ left }}
    >
      <div className="flex h-8 items-center gap-1 border-b border-[#E5E5E5] bg-[#f6f6f6] px-2">
        <p className="min-w-0 flex-1 text-[12px] text-[#161616]">
          <span className="font-bold">Filtrer : </span>
          <span>{label}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le filtre"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#eeeeee]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <SortControls column={column} sortState={sortState} onSort={onSort} />

      <div className="flex h-9 items-center border-b border-[#E5E5E5] px-2 text-[12px] font-medium text-[#3a3a3a]">
        Rechercher
      </div>

      <div className="border-b border-[#E5E5E5] p-3">
        <div className="mb-2 flex justify-between text-[12px] text-[#3a3a3a]">
          <span>Valeurs manquantes</span>
          <span>1323(3%)</span>
        </div>
        <div className="h-2 rounded bg-[#eeeeee]">
          <div className="h-2 w-10 rounded bg-[#3a3a3a]" />
        </div>
        <div className="mt-3 flex justify-end gap-2 text-[12px] text-[#3a3a3a]">
          <button>Seul.</button>
          <button>Exclure</button>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-1 flex justify-between text-[12px] text-[#3a3a3a]">
          <span>Min</span>
          <span>Max</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            aria-label="Valeur minimale"
            placeholder="Min"
            className="h-6 w-20 rounded border border-[#E5E5E5] px-2 text-[12px] placeholder:text-[#3a3a3a]"
            value={range.min}
            onChange={(event) =>
              onChangeRange(id, { ...range, min: event.target.value })
            }
          />
          <span className="h-px w-10 bg-[#CECECE]" />
          <input
            aria-label="Valeur maximale"
            placeholder="Max"
            className="h-6 w-20 rounded border border-[#E5E5E5] px-2 text-[12px] placeholder:text-[#3a3a3a]"
            value={range.max}
            onChange={(event) =>
              onChangeRange(id, { ...range, max: event.target.value })
            }
          />
        </div>
        <div className="mt-2 flex justify-end gap-3 text-[12px] text-[#3a3a3a]">
          <button type="button" onClick={() => onClear(id)}>
            Effacer
          </button>
          <button type="button" onClick={onClose}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

function DateFilterMenu({
  column,
  left,
  filter,
  sortState,
  onChangeDate,
  onSort,
  onClear,
  onClose,
}: {
  column: TableColumn;
  left: number;
  filter: DateFilterValue;
  sortState: SortState;
  onChangeDate: (key: ColumnKey, value: DateFilterValue) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClear: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const id = column.key;
  const label = column.label;
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const weekDays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
  const calendarDays = [
    "29",
    "30",
    "31",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
    "1",
    "2",
  ];

  return (
    <div
      className={`filter-popover filter-popover-${id} absolute top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
      style={{ left }}
    >
      <div className="flex h-8 items-center gap-1 border-b border-[#E5E5E5] bg-[#f6f6f6] px-2">
        <p className="min-w-0 flex-1 text-[12px] text-[#161616]">
          <span className="font-bold">Filtrer : </span>
          <span>{label}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le filtre"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-[#eeeeee]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <SortControls column={column} sortState={sortState} onSort={onSort} />

      <div className="relative border-b border-[#E5E5E5]">
        <button
          type="button"
          onClick={() => setIsModeMenuOpen((current) => !current)}
          className="flex h-8 w-full items-center justify-between px-2 text-left text-[12px] text-[#3a3a3a] hover:bg-[#f6f6f6]"
          aria-expanded={isModeMenuOpen}
        >
          <span className="font-medium">
            {dateFilterModeLabels[filter.mode]}
          </span>
          <Icon
            path={icons.arrowDownS}
            className={`h-3.5 w-3.5 ${isModeMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isModeMenuOpen ? (
          <div className="absolute left-1 right-1 top-8 z-40 overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
            {(["before", "after", "between"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onChangeDate(id, { ...filter, mode });
                  setIsModeMenuOpen(false);
                }}
                className={`flex h-8 w-full items-center justify-between px-2 text-left text-[12px] hover:bg-[#f6f6f6] ${
                  filter.mode === mode
                    ? "font-bold text-[#000091]"
                    : "text-[#3a3a3a]"
                }`}
              >
                <span>{dateFilterModeLabels[mode]}</span>
                {filter.mode === mode ? (
                  <Icon path={icons.check} className="h-3.5 w-3.5" />
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <label className="flex h-8 items-center border-b border-[#E5E5E5] px-2">
        <input
          value={filter.value}
          onChange={(event) =>
            onChangeDate(id, { ...filter, value: event.target.value })
          }
          aria-label="Entrer une date"
          placeholder={
            filter.mode === "between" ? "Date de début" : "JJ/MM/AAAA"
          }
          className="w-full bg-transparent text-[12px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
        />
      </label>
      {filter.mode === "between" ? (
        <label className="flex h-8 items-center border-b border-[#E5E5E5] px-2">
          <input
            value={filter.endValue}
            onChange={(event) =>
              onChangeDate(id, { ...filter, endValue: event.target.value })
            }
            aria-label="Entrer une date de fin"
            placeholder="Date de fin"
            className="w-full bg-transparent text-[12px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
          />
        </label>
      ) : null}

      <div className="p-2 pt-1.5">
        <div className="mb-1.5 flex h-7 items-center justify-between text-[12px]">
          <button
            type="button"
            className="rounded border border-[#E5E5E5] px-2 py-1 font-medium"
          >
            Avril 2024
          </button>
          <div className="flex items-center gap-1 text-[#3a3a3a]">
            <button
              type="button"
              aria-label="Mois précédent"
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#eeeeee]"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Mois suivant"
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-[#eeeeee]"
            >
              ›
            </button>
          </div>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-[#3a3a3a]">
          {weekDays.map((day) => (
            <span key={day} className="flex h-5 items-center justify-center">
              {day}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[12px] text-[#3a3a3a]">
          {calendarDays.map((day, index) => (
            <span
              key={`${day}-${index}`}
              className={`flex h-6 items-center justify-center rounded ${
                day === "7" ? "bg-[#000091] text-[#FFFFFF]" : ""
              }`}
            >
              {day}
            </span>
          ))}
        </div>
        <div className="mt-2 flex justify-end gap-2 border-t border-[#E5E5E5] pt-2 text-[12px]">
          <button
            type="button"
            onClick={() => onClear(id)}
            className="h-6 rounded px-2 font-medium text-[#3a3a3a] hover:bg-[#eeeeee]"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-6 rounded bg-[#000091] px-2 font-medium text-[#FFFFFF]"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterMenus({
  activeFilter,
  visibleColumns,
  sortState,
  categoryFilters,
  categoryOptions,
  filterSearches,
  numberRanges,
  dateFilters,
  onToggleCategory,
  onSearchFilter,
  onChangeRange,
  onSort,
  onClearRange,
  onChangeDate,
  onClearDate,
  onClose,
}: {
  activeFilter: ColumnKey | null;
  visibleColumns: readonly TableColumn[];
  sortState: SortState;
  categoryFilters: Partial<Record<ColumnKey, string[]>>;
  categoryOptions: Partial<
    Record<ColumnKey, { label: string; count: number }[]>
  >;
  filterSearches: Partial<Record<ColumnKey, string>>;
  numberRanges: Partial<Record<ColumnKey, NumberRange>>;
  dateFilters: Partial<Record<ColumnKey, DateFilterValue>>;
  onToggleCategory: (key: ColumnKey, value: string) => void;
  onSearchFilter: (key: ColumnKey, value: string) => void;
  onChangeRange: (key: ColumnKey, range: NumberRange) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClearRange: (key: ColumnKey) => void;
  onChangeDate: (key: ColumnKey, value: DateFilterValue) => void;
  onClearDate: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const column = visibleColumns.find((item) => item.key === activeFilter);

  if (!column) {
    return null;
  }

  const range = numberRanges[column.key] ?? { min: "", max: "" };
  const visibleIndex = visibleColumns.findIndex((item) => item.key === column.key);
  const left =
    visibleIndex > -1
      ? visibleColumns
          .slice(0, visibleIndex)
          .reduce((offset, item) => offset + item.widthPx, 8)
      : 8;

  if (column.filter === "number") {
    return (
      <NumberFilterMenu
        column={column}
        left={left}
        range={range}
        sortState={sortState}
        onChangeRange={onChangeRange}
        onSort={onSort}
        onClear={onClearRange}
        onClose={onClose}
      />
    );
  }

  if (column.filter === "date") {
    return (
      <DateFilterMenu
        column={column}
        left={left}
        filter={dateFilters[column.key] ?? emptyDateFilter}
        sortState={sortState}
        onChangeDate={onChangeDate}
        onSort={onSort}
        onClear={onClearDate}
        onClose={onClose}
      />
    );
  }

  return (
    <CategoryFilterMenu
      column={column}
      left={left}
      options={categoryOptions[column.key] ?? []}
      selectedValues={categoryFilters[column.key] ?? []}
      searchValue={filterSearches[column.key] ?? ""}
      sortState={sortState}
      onSearchChange={onSearchFilter}
      onToggleValue={onToggleCategory}
      onSort={onSort}
      onClose={onClose}
    />
  );
}

function FilterDismissLayer({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Fermer le filtre"
      className="absolute inset-0 z-10 cursor-default"
      onClick={onClose}
    />
  );
}

function CellActionMenu({
  value,
  type,
  onCopy,
  onFilter,
}: {
  value: string;
  type: ColumnType;
  onCopy: () => void;
  onFilter: () => void;
}) {
  const isReferenceData = type === "referenceData";
  const referenceLabel = isReferenceData
    ? getDepartmentReferenceLabel(value)
    : null;

  return (
    <div
      className={`absolute left-1 top-7 z-30 flex flex-col overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)] ${
        isReferenceData ? "w-[238px]" : "w-[176px]"
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onCopy();
        }}
        className="flex h-9 w-full items-center gap-1 border-b border-[#E5E5E5] px-2 text-left text-[13px] leading-[1.4] text-[#3a3a3a] hover:bg-[#eeeeee]"
      >
        <Icon path={icons.copy} className="h-3.5 w-3.5 text-[#3a3a3a]" />
        Copier cette valeur
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onFilter();
        }}
        className="flex h-9 w-full items-center gap-1 px-2 text-left text-[13px] leading-[1.4] text-[#3a3a3a] hover:bg-[#eeeeee]"
      >
        <Icon path={icons.filter} className="h-3.5 w-3.5 text-[#3a3a3a]" />
        Filtrer par cette valeur
      </button>
      {isReferenceData ? (
        <div className="flex flex-col gap-2 border-t border-[#E5E5E5] px-2 py-2">
          <div className="flex items-center gap-1 text-[13px] leading-[1.4] text-[#7b4fbf]">
            <Icon path={icons.referenceData} className="h-3.5 w-3.5 text-[#7b4fbf]" />
            Données de référence
          </div>
          <div className="text-[13px] leading-[1.4] text-[#3a3a3a]">
            <p>Il semblerait que ce champ soit un</p>
            <p className="font-bold">Identifiant de référence.</p>
            <p>
              {value} : {referenceLabel}
            </p>
          </div>
        </div>
      ) : null}
      <span className="sr-only">Valeur sélectionnée : {value}</span>
    </div>
  );
}

function DataCell({
  id,
  value,
  type,
  width,
  isActive,
  onOpen,
  onCopy,
  onFilter,
}: {
  id: string;
  value: string;
  type: ColumnType;
  width: number;
  isActive: boolean;
  onOpen: () => void;
  onCopy: () => void;
  onFilter: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  }

  const cellClassName = `relative flex h-7 shrink-0 cursor-pointer items-center border-b border-r border-[#E5E5E5] px-2 text-left hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091] ${
    isActive ? "bg-[#e8edff]" : ""
  }`;
  const cellStyle = { width };

  if (type === "category" || type === "reference") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className={cellClassName}
        style={cellStyle}
        aria-label={`Actions pour ${id} : ${value}`}
      >
        <span className="truncate rounded bg-[#eeeeee] px-2 py-1 text-[12px] leading-3 text-[#3a3a3a]">
          {value}
        </span>
        {isActive ? (
          <CellActionMenu
            value={value}
            type={type}
            onCopy={onCopy}
            onFilter={onFilter}
          />
        ) : null}
      </div>
    );
  }

  if (type === "identifier") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className={`${cellClassName} text-[12px] text-[#3a3a3a]`}
        style={cellStyle}
        aria-label={`Actions pour ${id} : ${value}`}
      >
        <span className="truncate">{value}</span>
        {isActive ? (
          <CellActionMenu
            value={value}
            type={type}
            onCopy={onCopy}
            onFilter={onFilter}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className={`${cellClassName} text-[12px] text-[#161616] ${
        type === "number" ? "justify-end" : "justify-start"
      }`}
      style={cellStyle}
      aria-label={`Actions pour ${id} : ${value}`}
    >
      <span className="truncate">{value}</span>
      {isActive ? (
        <CellActionMenu
          value={value}
          type={type}
          onCopy={onCopy}
          onFilter={onFilter}
        />
      ) : null}
    </div>
  );
}

function MobileFieldValue({
  value,
  type,
}: {
  value: string;
  type: ColumnType;
}) {
  if (type === "category" || type === "reference") {
    return (
      <span className="inline-flex w-fit rounded bg-[#eeeeee] px-2 py-1 text-[12px] leading-3 text-[#3a3a3a]">
        {value}
      </span>
    );
  }

  if (type === "identifier") {
    return <span className="text-[12px] leading-5 text-[#3a3a3a]">{value}</span>;
  }

  if (type === "number") {
    return <span className="text-[12px] leading-5 text-[#161616]">{value}</span>;
  }

  return <span className="text-[12px] leading-5 text-[#161616]">{value}</span>;
}

function MobileDataCard({
  row,
  columns,
  activeCell,
  onOpenCell,
  onCopyCell,
  onFilterCell,
}: {
  row: Row;
  columns: TableColumn[];
  activeCell: ActiveCell;
  onOpenCell: (cell: NonNullable<ActiveCell>) => void;
  onCopyCell: (value: string) => void;
  onFilterCell: (cell: NonNullable<ActiveCell>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const primaryColumns = isExpanded ? columns : columns.slice(0, 4);
  const hiddenColumnCount = Math.max(columns.length - 4, 0);

  return (
    <article className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-3">
      <dl className="space-y-3">
        {primaryColumns.map((column) => {
          const value = getRowValue(row, column.key);

          return (
            <div key={column.key} className="relative space-y-1">
              <dt className="flex items-center gap-1 text-[12px] leading-4 text-[#666666]">
                <Icon
                  path={icons[column.icon]}
                  className={`h-3.5 w-3.5 ${
                    column.icon === "referenceData"
                      ? "text-[#7b4fbf]"
                      : "text-[#666666]"
                  }`}
                />
                <span className="truncate">{column.label}</span>
              </dt>
              <dd className="pl-5">
                <button
                  type="button"
                  onClick={() =>
                    onOpenCell({
                      id: `${row.id}-${column.key}`,
                      key: column.key,
                      value,
                      type: column.type,
                    })
                  }
                  className="block max-w-full text-left"
                  aria-label={`Actions pour ${column.label} : ${value}`}
                >
                  <MobileFieldValue value={value} type={column.type} />
                </button>
                {activeCell?.id === `${row.id}-${column.key}` ? (
                  <CellActionMenu
                    value={value}
                    type={column.type}
                    onCopy={() => onCopyCell(value)}
                    onFilter={() =>
                      onFilterCell({
                        id: `${row.id}-${column.key}`,
                        key: column.key,
                        value,
                        type: column.type,
                      })
                    }
                  />
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>

      {hiddenColumnCount > 0 ? (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="mt-3 flex items-center gap-1 text-[13px] font-bold leading-5 text-[#161616]"
          aria-expanded={isExpanded}
        >
          <Icon
            path={icons.arrowDownS}
            className={`h-3.5 w-3.5 text-[#3a3a3a] ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
          {isExpanded ? "Réduire" : `+ ${hiddenColumnCount} champs`}
        </button>
      ) : null}
    </article>
  );
}

function MobileFilterColumn({
  column,
  options,
  isOpen,
  sortState,
  categoryFilters,
  filterSearches,
  numberRanges,
  dateFilters,
  onToggleOpen,
  onToggleCategory,
  onSearchFilter,
  onChangeRange,
  onSort,
  onClearRange,
  onChangeDate,
  onClearDate,
}: {
  column: TableColumn;
  options: { label: string; count: number }[];
  isOpen: boolean;
  sortState: SortState;
  categoryFilters: Partial<Record<ColumnKey, string[]>>;
  filterSearches: Partial<Record<ColumnKey, string>>;
  numberRanges: Partial<Record<ColumnKey, NumberRange>>;
  dateFilters: Partial<Record<ColumnKey, DateFilterValue>>;
  onToggleOpen: () => void;
  onToggleCategory: (key: ColumnKey, value: string) => void;
  onSearchFilter: (key: ColumnKey, value: string) => void;
  onChangeRange: (key: ColumnKey, range: NumberRange) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClearRange: (key: ColumnKey) => void;
  onChangeDate: (key: ColumnKey, value: DateFilterValue) => void;
  onClearDate: (key: ColumnKey) => void;
}) {
  const selectedValues = categoryFilters[column.key] ?? [];
  const normalizedSearch = (filterSearches[column.key] ?? "")
    .trim()
    .toLowerCase();
  const categoryOptions = options.filter((option) =>
    option.label.toLowerCase().includes(normalizedSearch),
  );
  const range = numberRanges[column.key] ?? { min: "", max: "" };
  const dateFilter = dateFilters[column.key] ?? emptyDateFilter;

  return (
    <section className="border-b border-[#E5E5E5]">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex h-11 w-full items-center gap-2 px-3 text-left"
        aria-expanded={isOpen}
      >
        <Icon
          path={icons[column.icon]}
          className={`h-4 w-4 ${
            column.icon === "referenceData" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"
          }`}
        />
        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#161616]">
          {column.label}
        </span>
        <Icon
          path={icons.arrowDownS}
          className={`h-4 w-4 text-[#3a3a3a] ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="border-t border-[#E5E5E5] bg-[#FFFFFF]">
          <SortControls column={column} sortState={sortState} onSort={onSort} />

          {column.filter === "number" ? (
            <div className="p-3">
              <div className="mb-1 flex justify-between text-[12px] text-[#3a3a3a]">
                <span>Min</span>
                <span>Max</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  aria-label={`Valeur minimale pour ${column.label}`}
                  placeholder="Min"
                  className="h-8 min-w-0 flex-1 rounded border border-[#E5E5E5] px-2 text-[12px] placeholder:text-[#3a3a3a]"
                  value={range.min}
                  onChange={(event) =>
                    onChangeRange(column.key, {
                      ...range,
                      min: event.target.value,
                    })
                  }
                />
                <span className="h-px w-6 bg-[#CECECE]" />
                <input
                  aria-label={`Valeur maximale pour ${column.label}`}
                  placeholder="Max"
                  className="h-8 min-w-0 flex-1 rounded border border-[#E5E5E5] px-2 text-[12px] placeholder:text-[#3a3a3a]"
                  value={range.max}
                  onChange={(event) =>
                    onChangeRange(column.key, {
                      ...range,
                      max: event.target.value,
                    })
                  }
                />
              </div>
              <div className="mt-2 flex justify-end text-[12px]">
                <button
                  type="button"
                  onClick={() => onClearRange(column.key)}
                  className="h-7 px-2 text-[#3a3a3a] hover:underline"
                >
                  Effacer
                </button>
              </div>
            </div>
          ) : column.filter === "date" ? (
            <div className="space-y-2 p-3">
              <select
                value={dateFilter.mode}
                onChange={(event) =>
                  onChangeDate(column.key, {
                    ...dateFilter,
                    mode: event.target.value as DateFilterMode,
                  })
                }
                aria-label={`Mode de filtre pour ${column.label}`}
                className="h-8 w-full rounded border border-[#E5E5E5] bg-[#FFFFFF] px-2 text-[12px] text-[#3a3a3a]"
              >
                {(["before", "after", "between"] as const).map((mode) => (
                  <option key={mode} value={mode}>
                    {dateFilterModeLabels[mode]}
                  </option>
                ))}
              </select>
              <input
                value={dateFilter.value}
                onChange={(event) =>
                  onChangeDate(column.key, {
                    ...dateFilter,
                    value: event.target.value,
                  })
                }
                aria-label={`Date pour ${column.label}`}
                placeholder="JJ/MM/AAAA"
                className="h-8 w-full rounded border border-[#E5E5E5] px-2 text-[12px] text-[#3a3a3a] placeholder:text-[#3a3a3a]"
              />
              {dateFilter.mode === "between" ? (
                <input
                  value={dateFilter.endValue}
                  onChange={(event) =>
                    onChangeDate(column.key, {
                      ...dateFilter,
                      endValue: event.target.value,
                    })
                  }
                  aria-label={`Date de fin pour ${column.label}`}
                  placeholder="Date de fin"
                  className="h-8 w-full rounded border border-[#E5E5E5] px-2 text-[12px] text-[#3a3a3a] placeholder:text-[#3a3a3a]"
                />
              ) : null}
              <div className="flex justify-end text-[12px]">
                <button
                  type="button"
                  onClick={() => onClearDate(column.key)}
                  className="h-7 px-2 text-[#3a3a3a] hover:underline"
                >
                  Effacer
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="flex h-9 items-center gap-1 border-b border-[#E5E5E5] px-3">
                <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                <input
                  value={filterSearches[column.key] ?? ""}
                  onChange={(event) =>
                    onSearchFilter(column.key, event.target.value)
                  }
                  aria-label={`Rechercher dans ${column.label}`}
                  placeholder="Rechercher"
                  className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                />
              </label>
              <div className="max-h-48 overflow-auto p-2">
                {categoryOptions.length > 0 ? (
                  categoryOptions.map((option) => (
                    <FilterOption
                      key={option.label}
                      label={option.label}
                      count={option.count}
                      checked={selectedValues.includes(option.label)}
                      onToggle={() => onToggleCategory(column.key, option.label)}
                    />
                  ))
                ) : (
                  <div className="flex h-8 items-center px-1 text-[12px] text-[#3a3a3a]">
                    Aucun résultat
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

function MobileFiltersPanel({
  isOpen,
  visibleColumns,
  sortState,
  categoryFilters,
  categoryOptions,
  filterSearches,
  numberRanges,
  dateFilters,
  onToggleCategory,
  onSearchFilter,
  onChangeRange,
  onSort,
  onClearRange,
  onChangeDate,
  onClearDate,
  onClearAll,
  onOpenColumn,
  onClose,
}: {
  isOpen: boolean;
  visibleColumns: readonly TableColumn[];
  sortState: SortState;
  categoryFilters: Partial<Record<ColumnKey, string[]>>;
  categoryOptions: Partial<
    Record<ColumnKey, { label: string; count: number }[]>
  >;
  filterSearches: Partial<Record<ColumnKey, string>>;
  numberRanges: Partial<Record<ColumnKey, NumberRange>>;
  dateFilters: Partial<Record<ColumnKey, DateFilterValue>>;
  onToggleCategory: (key: ColumnKey, value: string) => void;
  onSearchFilter: (key: ColumnKey, value: string) => void;
  onChangeRange: (key: ColumnKey, range: NumberRange) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClearRange: (key: ColumnKey) => void;
  onChangeDate: (key: ColumnKey, value: DateFilterValue) => void;
  onClearDate: (key: ColumnKey) => void;
  onClearAll: () => void;
  onOpenColumn: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const [openColumnKey, setOpenColumnKey] = useState<ColumnKey | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-explorer-only fixed inset-0 z-50 items-end bg-[rgba(0,0,0,0.32)]">
      <button
        type="button"
        aria-label="Fermer les filtres"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[82dvh] w-full flex-col overflow-hidden rounded-t-lg border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_-8px_24px_rgba(0,0,0,0.16)]">
        <header className="flex h-12 items-center gap-2 border-b border-[#E5E5E5] bg-[#f6f6f6] px-3">
          <Icon path={icons.filter} className="h-4 w-4 text-[#3a3a3a]" />
          <h2 className="min-w-0 flex-1 text-[14px] font-bold text-[#161616]">
            Filtres
          </h2>
          <button
            type="button"
            onClick={onClearAll}
            className="h-7 px-2 text-[12px] font-medium text-[#3a3a3a] hover:underline"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#eeeeee]"
          >
            <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          {visibleColumns.length > 0 ? (
            visibleColumns.map((column) => (
              <MobileFilterColumn
                key={column.key}
                column={column}
                options={categoryOptions[column.key] ?? []}
                isOpen={openColumnKey === column.key}
                sortState={sortState}
                categoryFilters={categoryFilters}
                filterSearches={filterSearches}
                numberRanges={numberRanges}
                dateFilters={dateFilters}
                onToggleOpen={() => {
                  onOpenColumn(column.key);
                  setOpenColumnKey((current) =>
                    current === column.key ? null : column.key,
                  );
                }}
                onToggleCategory={onToggleCategory}
                onSearchFilter={onSearchFilter}
                onChangeRange={onChangeRange}
                onSort={onSort}
                onClearRange={onClearRange}
                onChangeDate={onChangeDate}
                onClearDate={onClearDate}
              />
            ))
          ) : (
            <div className="p-4 text-[13px] text-[#3a3a3a]">
              Aucune colonne visible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveFilterChip({
  icon,
  label,
  value,
  onOpen,
  onRemove,
}: {
  icon: keyof typeof icons;
  label: string;
  value?: string;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="flex h-6 cursor-pointer items-center gap-0.5 rounded border border-[#c2d1ff] bg-[#e8edff] py-0.5 pl-1 pr-0.5 text-[12px] leading-4 text-[#000091]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-0.5"
      >
        <Icon path={icons[icon]} className="h-4 w-4 text-[#000091]" />
        <span className="font-medium">{label}</span>
        {value ? <span>{value}</span> : null}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${label}`}
        className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#dbe5ff]"
      >
        <Icon path={icons.close} className="h-3.5 w-3.5 text-[#000091]" />
      </button>
    </div>
  );
}

function ActiveFiltersBar({
  searchQuery,
  sortState,
  categoryFilters,
  numberRanges,
  dateFilters,
  onOpenFilter,
  onClearSearch,
  onClearCategory,
  onClearNumber,
  onClearDate,
  onClearSort,
  onClearAll,
}: {
  searchQuery: string;
  sortState: SortState;
  categoryFilters: Partial<Record<ColumnKey, string[]>>;
  numberRanges: Partial<Record<ColumnKey, NumberRange>>;
  dateFilters: Partial<Record<ColumnKey, DateFilterValue>>;
  onOpenFilter: (key: ColumnKey) => void;
  onClearSearch: () => void;
  onClearCategory: (key: ColumnKey) => void;
  onClearNumber: (key: ColumnKey) => void;
  onClearDate: (key: ColumnKey) => void;
  onClearSort: () => void;
  onClearAll: () => void;
}) {
  const activeCategoryEntries = tableColumns
    .map((column) => ({
      column,
      values: categoryFilters[column.key] ?? [],
    }))
    .filter((entry) => entry.values.length > 0);
  const activeNumberEntries = tableColumns
    .map((column) => ({
      column,
      range: numberRanges[column.key],
    }))
    .filter((entry) => entry.range?.min || entry.range?.max);
  const activeDateEntries = tableColumns
    .map((column) => ({
      column,
      filter: dateFilters[column.key],
    }))
    .filter((entry) => isDateFilterActive(entry.filter));
  const sortedColumn = sortState
    ? tableColumns.find((column) => column.key === sortState.key)
    : null;
  const hasFilters =
    Boolean(sortState) ||
    searchQuery.trim() ||
    activeCategoryEntries.length > 0 ||
    activeNumberEntries.length > 0 ||
    activeDateEntries.length > 0;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="flex h-10 items-center justify-between border-b border-[#E5E5E5] bg-[#FFFFFF] px-2">
      <div className="flex min-w-0 items-center gap-1">
        {sortState && sortedColumn ? (
          <ActiveFilterChip
            icon={sortState.direction === "asc" ? "arrowUp" : "arrowDown"}
            label={`${sortedColumn.label}:`}
            value={sortState.direction === "asc" ? "Croissant" : "Décroissant"}
            onOpen={() => onOpenFilter(sortState.key)}
            onRemove={onClearSort}
          />
        ) : null}
        {sortState && (searchQuery.trim() || activeCategoryEntries.length > 0 || activeNumberEntries.length > 0 || activeDateEntries.length > 0) ? (
          <span className="mx-1 h-6 w-px bg-[#ebebeb]" />
        ) : null}
        {searchQuery.trim() ? (
          <ActiveFilterChip
            icon="search"
            label="Any field :"
            value={searchQuery}
            onOpen={() => onOpenFilter("nom")}
            onRemove={onClearSearch}
          />
        ) : null}
        {activeCategoryEntries.map(({ column, values }) => (
          <ActiveFilterChip
            key={column.key}
            icon={column.icon}
            label={`${column.label}:`}
            value={values.join(", ")}
            onOpen={() => onOpenFilter(column.key)}
            onRemove={() => onClearCategory(column.key)}
          />
        ))}
        {activeNumberEntries.map(({ column, range }) => (
          <ActiveFilterChip
            key={column.key}
            icon="number"
            label={`${column.label.replace("# ", "")}:`}
            value={`${range?.min || "min"}-${range?.max || "max"}`}
            onOpen={() => onOpenFilter(column.key)}
            onRemove={() => onClearNumber(column.key)}
          />
        ))}
        {activeDateEntries.map(({ column, filter }) => (
          <ActiveFilterChip
            key={column.key}
            icon="calendar"
            label={`${column.label}:`}
            value={getDateFilterChipValue(filter ?? emptyDateFilter)}
            onOpen={() => onOpenFilter(column.key)}
            onRemove={() => onClearDate(column.key)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        disabled={!hasFilters}
        className="flex h-6 items-center gap-1 rounded px-2 text-[13px] leading-4 text-[#3a3a3a] hover:bg-[#eeeeee] disabled:opacity-40"
      >
        <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        Tout effacer
      </button>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DescriptionPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#FFFFFF]">
      <article className="max-w-[792px] px-3 py-4 text-[14px] leading-6 text-[#3a3a3a]">
        <h1 className="mb-2 text-[20px] font-bold leading-7 text-[#3a3a3a]">
          Analyse des données scolaires 2023
        </h1>

        <section className="space-y-2">
          <h2 className="text-[16px] font-bold leading-6 text-[#3a3a3a]">
            Présentation générale
          </h2>
          <h3 className="text-[14px] font-bold leading-6 text-[#3a3a3a]">
            Détails par région
          </h3>
          <p>
            Les données présentées ci-dessous illustrent les tendances actuelles.
          </p>
          <p>
            Les chiffres en gras indiquent les valeurs clés.
          </p>
          <p>
            Les tendances en italique soulignent les variations importantes.
          </p>
          <p>
            Les valeurs en gras et italique montrent des anomalies significatives.
          </p>
          <blockquote className="border-l-2 border-[#3a3a3a] pl-2">
            « Les données sont extraites des rapports officiels du ministère de
            l’Éducation nationale. »
          </blockquote>
        </section>

        <section className="mt-3">
          <ul className="list-disc space-y-1 pl-5">
            <li>Principaux indicateurs</li>
            <li>Taux de réussite</li>
            <li>Primaire</li>
            <li>Secondaire</li>
            <li>Lycée</li>
          </ul>
        </section>

        <section className="mt-3">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Étapes de l’analyse</li>
            <li>Collecte des données</li>
            <li>Nettoyage des données</li>
            <li>Analyse statistique</li>
            <li>Rapport final</li>
            <li>Validation</li>
            <li>Publication</li>
          </ol>
        </section>

        <a
          href="#"
          className="mt-3 inline-flex text-[14px] leading-6 text-[#000091] underline underline-offset-2"
        >
          Consultez le rapport complet ici
        </a>
      </article>
    </div>
  );
}

function MetadataValue({
  label,
  value,
  technical = false,
  copyable = false,
  chip = false,
}: {
  label: string;
  value: string;
  technical?: boolean;
  copyable?: boolean;
  chip?: boolean;
}) {
  return (
    <div className="flex w-full flex-col gap-0.5 text-[14px] leading-6">
      <div className="flex items-center gap-1">
        <p className="font-bold text-[#161616]">{label}</p>
        {copyable ? (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value)}
            aria-label={`Copier ${label}`}
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#eeeeee]"
          >
            <Icon path={icons.copy} className="h-4 w-4 text-[#3a3a3a]" />
          </button>
        ) : null}
      </div>
      {chip ? (
        <span
          className={`w-fit rounded-[2px] bg-[#f6f6f6] px-1 text-[14px] leading-6 text-[#3a3a3a] ${
            technical ? "font-mono" : ""
          }`}
        >
          {value}
        </span>
      ) : (
        <p
          className={`truncate text-[#3a3a3a] ${
            technical ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MetadataPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#FFFFFF] p-4">
      <div className="grid w-full grid-cols-3 gap-5">
        <div className="flex min-w-0 flex-col gap-3">
          <MetadataValue label="Créé le" value="13 octobre 2022" />
          <MetadataValue label="Modifié le" value="6 octobre 2022" />
          <MetadataValue
            label="Identifiant"
            value="6fb051a0-7606-4144-8387-02a5b2009cd5"
            technical
            copyable
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <MetadataValue label="Taille" value="13.7Mo" />
          <MetadataValue label="Type" value="Fichier principal" />
          <MetadataValue label="Type MIME" value="application/csv" technical chip />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <MetadataValue
            label="URL"
            value="https://data.education.gouv.fr/explore/dataset/fr-en-ips_colleges/download?format=json&timezone=Europe/Berlin&use_labels_for_header=false"
            technical
            copyable
          />
          <MetadataValue
            label="URL Stable"
            value="https://www.data.gouv.fr/fr/datasets/r/6fb051a0-7606-4144-8387-02a5b2009cd5"
            technical
            copyable
          />
          <MetadataValue
            label="SHA-1"
            value="4e82f03680d26f40b29b0bc8c5754cf51d4c8a67"
            technical
            copyable
          />
        </div>
      </div>
    </div>
  );
}

const apiEndpoints = [
  {
    path: "/api/resources/430e13f9-834b-4411-a1a8-da0b4b6e715c/data/",
    description: "Get resource data from its ID",
  },
  {
    path: "/api/resources/430e13f9-834b-4411-a1a8-da0b4b6e715c/data/csv/",
    description: "Get resource data from its ID in CSV format",
  },
  {
    path: "/api/resources/430e13f9-834b-4411-a1a8-da0b4b6e715c/data/json/",
    description: "Get resource data from its ID in JSON format",
  },
];

function ApiEndpointRow({
  path,
  description,
}: {
  path: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[72px] items-start gap-3 border-b border-[#E5E5E5] px-1 py-3">
      <span className="mt-1 flex w-16 shrink-0 items-center justify-center rounded bg-[#e6eefe] px-1.5 py-0.5 font-mono text-[12px] font-bold leading-3 text-[#0063cb]">
        GET
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate font-mono text-[14px] leading-5 text-[#161616]">
            {path}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(path)}
            aria-label="Copier le lien"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#eeeeee]"
          >
            <Icon path={icons.copy} className="h-4 w-4 text-[#3a3a3a]" />
          </button>
        </div>
        <p className="mt-0.5 text-[14px] leading-5 text-[#3a3a3a]">
          {description}
        </p>
      </div>
      <Icon path={icons.arrowDown} className="mt-1 h-4 w-4 text-[#3a3a3a]" />
    </div>
  );
}

function ApiModelRow({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#E5E5E5] px-1 py-3 last:border-b-0">
      <Icon path={icons.code} className="h-4 w-4 text-[#3a3a3a]" />
      <span className="font-mono text-[14px] leading-5 text-[#161616]">
        {name}
      </span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ApiPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#FFFFFF] px-3 py-4">
      <div className="max-w-none text-[14px] leading-6 text-[#3a3a3a]">
        <div className="space-y-2">
          <p>
            Cette API est générée automatiquement par data.gouv.fr à partir du fichier.
          </p>
          <p>
            - Si le fichier est modifié, l’API sera mise à jour et sa structure pourra changer.
          </p>
          <p>
            - Si le fichier est supprimé, l’API sera également supprimée.
          </p>
          <p>
            Pour des usages pérennes, prévoyez que cette API dépend directement du fichier source.
          </p>
          <p>
            L’URL de base de l’API est{" "}
            <span className="font-mono">https://tabular-api.data.gouv.fr</span>
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p>
            Version{" "}
            <span className="font-mono">
              1.0.0
            </span>
          </p>
          <a
            href="#"
            className="flex items-center gap-1 text-[12px] leading-4 text-[#3a3a3a] hover:underline"
          >
            Ouvrir dans Swagger UI
            <Icon path={icons.externalLink} className="h-4 w-4 text-[#3a3a3a]" />
          </a>
        </div>

        <section className="mt-3">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] py-2">
            <h2 className="text-[16px] leading-6 text-[#161616]">
              Endpoints <span className="text-[12px] text-[#3a3a3a]">3</span>
            </h2>
            <Icon path={icons.arrowUp} className="h-5 w-5 text-[#3a3a3a]" />
          </div>
          <div>
            {apiEndpoints.map((endpoint) => (
              <ApiEndpointRow
                key={endpoint.path}
                path={endpoint.path}
                description={endpoint.description}
              />
            ))}
          </div>
        </section>

        <section className="mt-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] py-2">
            <h2 className="text-[16px] leading-6 text-[#161616]">
              Modèles <span className="text-[12px] text-[#3a3a3a]">2</span>
            </h2>
            <Icon path={icons.arrowUp} className="h-5 w-5 text-[#3a3a3a]" />
          </div>
          <ApiModelRow name="Resource" />
          <ApiModelRow name="ResourceData" />
        </section>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MapPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#FFFFFF]">
      <div className="flex h-10 items-center border-b border-[#E5E5E5] px-2">
        <p className="text-[13px] leading-[1.4] text-[#3a3a3a]">
          Dernière mise à jour de l’aperçu : 03/07/2026 00:00
        </p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#f6f6f6]">
        <Image
          src="/prototypes/explorateur/map-preview.png"
          alt="Aperçu cartographique des données"
          fill
          sizes="(min-width: 1024px) 1220px, 100vw"
          className="object-cover object-top"
        />
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PdfPreviewPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-[#f6f6f6]">
      <div className="w-full bg-[#FFFFFF]">
        <Image
          src="/prototypes/explorateur/pdf-preview.png"
          alt="Aperçu PDF du guide"
          width={1710}
          height={2418}
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}

const codePreviewRows = [
  { chefLieu: "97105", code: "01", nom: "Guadeloupe", typeLiaison: 3, zone: "drom" },
  { chefLieu: "97209", code: "02", nom: "Martinique", typeLiaison: 3, zone: "drom" },
  { chefLieu: "97302", code: "03", nom: "Guyane", typeLiaison: 3, zone: "drom" },
  { chefLieu: "97411", code: "04", nom: "La Réunion", typeLiaison: 0, zone: "drom" },
  { chefLieu: "97611", code: "06", nom: "Mayotte", typeLiaison: 0, zone: "drom" },
  { chefLieu: "75056", code: "11", nom: "Île-de-France", typeLiaison: 1, zone: "metro" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CodePreviewPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto border-t border-[#E5E5E5] bg-[#FFFFFF] p-4 font-mono text-[14px] leading-5">
      <div className="flex flex-col gap-3 whitespace-nowrap text-[#161616]">
        {codePreviewRows.map((row) => (
          <div key={row.code} className="relative pl-5">
            <span className="absolute left-0 top-0 text-[#161616]">▾</span>
            <p>{"{"}</p>
            <div className="pl-4">
              <p>
                chefLieu:{" "}
                <span className="text-[#6049b3]">{`"${row.chefLieu}"`}</span>,
              </p>
              <p>
                code: <span className="text-[#6049b3]">{`"${row.code}"`}</span>,
              </p>
              <p>
                nom: <span className="text-[#6049b3]">{`"${row.nom}"`}</span>,
              </p>
              <p>
                typeLiaison:{" "}
                <span className="text-[#aa52a2]">{row.typeLiaison}</span>,
              </p>
              <p>
                zone: <span className="text-[#6049b3]">{`"${row.zone}"`}</span>
              </p>
            </div>
            <p>{"},"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PreviewUnavailablePanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-[#FFFFFF] py-[30px] text-center">
      <Image
        src="/prototypes/explorateur/microscope.svg"
        alt=""
        width={54}
        height={74}
        className="h-[72px] w-[54px]"
      />
      <div className="flex flex-col items-center gap-2">
        <p className="w-[620px] max-w-full text-[16px] font-bold leading-6 text-[#161616]">
          Aperçu indisponible.
        </p>
        <p className="w-[620px] max-w-full text-[16px] leading-6 text-[#161616]">
          Ce fichier est trop volumineux pour être prévisualisé.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 border border-[#161616] px-3 text-[14px] font-medium leading-6 text-[#161616]"
          >
            Demander la prévisualisation
          </button>
          <button
            type="button"
            className="flex h-8 items-center gap-2 bg-[#000091] pl-2 pr-3 text-[14px] font-medium leading-6 text-[#FFFFFF]"
          >
            <Icon path={icons.download} className="h-4 w-4 text-[#FFFFFF]" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-10 z-30 w-[270px] overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
      {downloadGroups.map((group, groupIndex) => (
        <div key={group.title}>
          <div className="flex h-8 items-center gap-1 border-b border-[#E5E5E5] bg-[#f6f6f6] px-2">
            <p className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase leading-[1.4] text-[#161616]">
              {group.title}
            </p>
            {group.closable ? (
              <button
                type="button"
                aria-label="Fermer le menu de téléchargement"
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded text-[#3a3a3a] hover:bg-[#eeeeee]"
              >
                <Icon path={icons.close} className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div>
            {group.items.map((item, itemIndex) => {
              const isLastItem =
                groupIndex === downloadGroups.length - 1 &&
                itemIndex === group.items.length - 1;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={onClose}
                  className={`flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-[#f6f6f6] ${
                    isLastItem ? "" : "border-b border-[#E5E5E5]"
                  }`}
                >
                  <span className="whitespace-nowrap text-[14px] leading-[1.5] text-[#161616]">
                    {item.label}
                  </span>
                  <span className="rounded bg-[#f6f6f6] px-1 text-[14px] leading-[1.5] text-[#3a3a3a]">
                    {item.size}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

type AssistantIntent =
  | "explain_structure"
  | "search_rows"
  | "aggregate"
  | "clarify"
  | "unable";

type AssistantFilterPayload = {
  key: ColumnKey;
  label: string;
  value: string;
  type: ColumnType;
  count: number;
};

type AssistantSortPayload = {
  key: ColumnKey;
  label: string;
  direction: SortDirection;
};

type AssistantProposedAction =
  | {
      type: "apply_filter";
      payload: {
        filters: AssistantFilterPayload[];
      };
    }
  | {
      type: "apply_sort";
      payload: AssistantSortPayload;
    }
  | {
      type: "highlight_rows" | "none";
      payload?: Record<string, never>;
    };

type TokenUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

type AgentResponse = {
  intent: AssistantIntent;
  answer: string;
  reasoning?: string;
  sql?: string;
  columnsUsed?: string[];
  chart?: AssistantChartSpec;
  queryRows?: Record<string, unknown>[];
  toolTrace?: {
    tool: "inspect_schema" | "execute_sql" | "get_resource_context" | "execute_query" | "create_chart";
    summary: string;
    description?: string;
    show?: boolean;
  }[];
  proposedAction: AssistantProposedAction;
  needsClarification?: boolean;
  clarificationOptions?: AssistantFilterPayload[];
  model?: string;
  usage?: TokenUsage;
  status: "success" | "ambiguous" | "empty" | "unable" | "error";
};

type AssistantToolCall =
  | {
      tool: "inspect_schema";
      arguments?: Record<string, never>;
    }
  | {
      tool: "execute_sql";
      arguments: {
        sql: string;
        description?: string;
        show?: boolean;
      };
    }
  | {
      tool: "create_chart";
      arguments: {
        description?: string;
        spec: VegaLiteSpec;
      };
    };

type AgentPhaseResponse = {
  toolCall?: AssistantToolCall;
  answer?: string;
  reasoning?: string;
  sql?: string;
  model?: string;
  usage?: TokenUsage;
  needsClarification?: boolean;
  error?: string;
};

type SqlExecutionEvidence = {
  description?: string;
  sql: string;
  result: ExecuteSqlResult;
};

type SqlExecutionFailure = {
  sql: string;
  error: string;
};

type VegaLiteSpec = Record<string, unknown>;

type AssistantChartSpec = {
  type: "bar" | "line" | "scatter" | "doughnut";
  title: string;
  xKey: string;
  yKey: string;
  data: Record<string, unknown>[];
  spec?: VegaLiteSpec;
};

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AgentResponse;
};

type AssistantActionHandlers = {
  onApplyFilter: (filters: AssistantFilterPayload[]) => void;
  onApplySort: (sort: AssistantSortPayload) => void;
};

function getAssistantStarterQuestions() {
  return [
    "Explique moi ton fonctionnement",
    "Quelles sont les colonnes de ce jeu de données ?",
  ];
}

const assistantLoadingSteps = [
  {
    label: "Analyse de la demande",
    detail: "Le modèle décide si la question nécessite les données.",
  },
  {
    label: "Choix des tools",
    detail: "Je prépare l’action adaptée si les données sont nécessaires.",
  },
  {
    label: "Exécution locale",
    detail: "J’analyse le fichier directement dans le navigateur.",
  },
  {
    label: "Rédaction",
    detail: "La réponse est formulée à partir des preuves disponibles.",
  },
];
const desktopTableHeaderHeight = 48;
const desktopTableRowHeight = 28;
const desktopTableOverscanRows = 24;
const duckdbPreviewPageSize = 500;
const mobilePreviewRowLimit = 250;

function normalizePreviewValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function mergeTokenUsage(...usages: (TokenUsage | undefined)[]) {
  const totals = usages.reduce<TokenUsage>((accumulator, usage) => {
    if (!usage) {
      return accumulator;
    }

    return {
      prompt_tokens:
        (accumulator.prompt_tokens ?? 0) + (usage.prompt_tokens ?? 0),
      completion_tokens:
        (accumulator.completion_tokens ?? 0) +
        (usage.completion_tokens ?? 0),
      total_tokens:
        (accumulator.total_tokens ?? 0) + (usage.total_tokens ?? 0),
    };
  }, {});

  return totals.total_tokens || totals.prompt_tokens || totals.completion_tokens
    ? totals
    : undefined;
}

function getTokenTotal(usage?: TokenUsage) {
  if (!usage) {
    return null;
  }

  if (typeof usage.total_tokens === "number") {
    return usage.total_tokens;
  }

  const computedTotal =
    (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0);

  return computedTotal > 0 ? computedTotal : null;
}

function useCloseDetailsOnOutside() {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const details = detailsRef.current;

      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  return detailsRef;
}

function TokenUsageToggle({ usage }: { usage?: TokenUsage }) {
  const totalTokens = getTokenTotal(usage);
  const detailsRef = useCloseDetailsOnOutside();

  return (
    <div className="flex h-6 items-center gap-1 text-[12px] leading-[1.4] text-[#5d5d5d]">
      <details ref={detailsRef} className="relative">
        <summary
          className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded hover:bg-[#eeeeee] [&::-webkit-details-marker]:hidden"
          aria-label={
            totalTokens
              ? `${totalTokens.toLocaleString("fr-FR")} tokens utilisés`
              : "Tokens indisponibles"
          }
          title="Tokens utilisés"
        >
          <Icon
            path={icons.dashboard}
            className={`h-4 w-4 ${
              totalTokens ? "text-[#5d5d5d]" : "text-[#929292]"
            }`}
          />
        </summary>
        <div className="absolute bottom-7 left-0 z-20 w-[220px] rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2 shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
          {totalTokens ? (
            <>
              <p className="mb-1 text-[11px] font-medium leading-4 text-[#161616]">
                Nombre de tokens utilisés
              </p>
              {typeof usage?.prompt_tokens === "number" ? (
                <div className="mt-1 flex items-center justify-between text-[11px] leading-4 text-[#5d5d5d]">
                  <span>Prompt</span>
                  <span>{usage.prompt_tokens.toLocaleString("fr-FR")}</span>
                </div>
              ) : null}
              {typeof usage?.completion_tokens === "number" ? (
                <div className="mt-1 flex items-center justify-between text-[11px] leading-4 text-[#5d5d5d]">
                  <span>Réponse</span>
                  <span>{usage.completion_tokens.toLocaleString("fr-FR")}</span>
                </div>
              ) : null}
              <div className="mt-2 flex items-center justify-between border-t border-[#E5E5E5] pt-1 text-[11px] font-medium leading-4 text-[#161616]">
                <span>Total</span>
                <span>{totalTokens.toLocaleString("fr-FR")}</span>
              </div>
            </>
          ) : (
            <p className="text-[11px] leading-4 text-[#5d5d5d]">
              Nombre de tokens utilisés indisponible
            </p>
          )}
        </div>
      </details>
    </div>
  );
}

function ModelInfoChip() {
  const detailsRef = useCloseDetailsOnOutside();

  return (
    <details ref={detailsRef} className="relative">
      <summary
        className="flex h-6 max-w-[150px] cursor-pointer list-none items-center rounded-full border border-[#CECECE] bg-transparent px-2 text-[12px] leading-4 text-[#3a3a3a] hover:bg-[#eeeeee] [&::-webkit-details-marker]:hidden"
        aria-label="Informations sur le modèle gpt-oss-120b"
        title="Informations sur le modèle"
      >
        <span className="truncate">gpt-oss-120b</span>
      </summary>
      <div className="absolute bottom-7 left-0 z-20 w-[230px] rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2 text-[11px] leading-4 text-[#5d5d5d] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
        Modèle open source exécuté sur une infrastructure opérée par la DINUM.
      </div>
    </details>
  );
}

function splitMarkdownTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isMarkdownTableSeparator(line: string) {
  const cells = splitMarkdownTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderInlineMarkdown(text: string) {
  const parts = text
    .split(
      /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\[[^\]]+\]\(https?:\/\/[^)]+\)|(?<![\w*])\*[^*\n]+\*(?![\w*])|(?<![\w_])_[^_\n]+_(?![\w_]))/g,
    )
    .filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-[#f6f6f6] px-1 font-mono text-[12px] text-[#161616]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (
      (part.startsWith("**") && part.endsWith("**")) ||
      (part.startsWith("__") && part.endsWith("__"))
    ) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-[#161616]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("~~") && part.endsWith("~~")) {
      return <del key={`${part}-${index}`}>{part.slice(2, -2)}</del>;
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={`${part}-${index}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-[#000091] underline underline-offset-2"
        >
          {linkMatch[1]}
        </a>
      );
    }

    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
  });
}

function renderAssistantMarkdown(content: string) {
  const normalizedContent = content
    .replace(/\r\n?/g, "\n")
    .trim()
    .replace(/^```(?:markdown|md)\s*\n([\s\S]*?)\n```$/i, "$1");
  const lines = normalizedContent.split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const nextLine = lines[index + 1];

    const headingMatch = line.match(/^\s*(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      nodes.push(
        <p
          key={`heading-${index}`}
          role="heading"
          aria-level={level}
          className={`font-semibold text-[#161616] ${
            level === 1
              ? "text-[17px] leading-6"
              : level === 2
                ? "text-[15px] leading-5"
                : "text-[13px] leading-5"
          }`}
        >
          {renderInlineMarkdown(headingMatch[2])}
        </p>,
      );
      index += 1;
      continue;
    }

    const blockquoteMatch = line.match(/^\s*>\s?(.*)$/);
    if (blockquoteMatch) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const quoteMatch = lines[index].match(/^\s*>\s?(.*)$/);
        if (!quoteMatch) break;
        quoteLines.push(quoteMatch[1]);
        index += 1;
      }
      nodes.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-[#929292] pl-3 text-[#666666]"
        >
          {renderInlineMarkdown(quoteLines.join(" "))}
        </blockquote>,
      );
      continue;
    }

    if (/^\s*(?:---+|\*\*\*+)\s*$/.test(line)) {
      nodes.push(<hr key={`hr-${index}`} className="border-0 border-t border-[#E5E5E5]" />);
      index += 1;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      nodes.push(
        <pre
          key={`code-${index}`}
          className="overflow-auto rounded border border-[#E5E5E5] bg-[#f6f6f6] p-2 font-mono text-[12px] leading-5 text-[#161616]"
        >
          {codeLines.join("\n")}
        </pre>,
      );
      index += 1;
      continue;
    }

    if (
      line.includes("|") &&
      nextLine?.includes("|") &&
      isMarkdownTableSeparator(nextLine)
    ) {
      const headers = splitMarkdownTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && lines[index].includes("|")) {
        rows.push(splitMarkdownTableRow(lines[index]));
        index += 1;
      }

      nodes.push(
        <div key={`table-${index}`} className="overflow-auto rounded border border-[#E5E5E5]">
          <table className="min-w-full border-collapse text-left text-[12px] leading-5 [&_tbody_tr:last-child_td]:border-b-0">
            <thead className="bg-[#f6f6f6] text-[#161616]">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-[#E5E5E5] px-2 py-1 font-medium"
                  >
                    {renderInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row.join("-")}-${rowIndex}`}>
                  {headers.map((header, cellIndex) => (
                    <td
                      key={`${header}-${cellIndex}`}
                      className="border-b border-[#E5E5E5] px-2 py-1 text-[#3a3a3a]"
                    >
                      {renderInlineMarkdown(row[cellIndex] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulletMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*[-*]\s+(.+)$/);

        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1]);
        index += 1;
      }

      nodes.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-4">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`} className="pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    const numberedMatch = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*\d+[.)]\s+(.+)$/);

        if (!itemMatch) {
          break;
        }

        items.push(itemMatch[1]);
        index += 1;
      }

      nodes.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-4">
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`} className="pl-1">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim()) {
      nodes.push(
        <p key={`p-${index}`} className="whitespace-pre-wrap leading-5">
          {renderInlineMarkdown(line)}
        </p>,
      );
    }

    index += 1;
  }

  return nodes.length > 0 ? nodes : content;
}

function escapeSvgText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function createChartSvg(chart: AssistantChartSpec) {
  const chartRows = chart.data.slice(0, 8).map((item, index) => ({
    label: String(item[chart.xKey] ?? `Valeur ${index + 1}`),
    value: Number(item[chart.yKey]),
  }));
  const values = chartRows
    .map((item) => item.value)
    .filter((value) => Number.isFinite(value));
  const maxValue = Math.max(...values, 1);
  const width = 760;
  const rowHeight = 30;
  const topPadding = 54;
  const leftPadding = 172;
  const rightPadding = 92;
  const bottomPadding = 24;
  const height = topPadding + chartRows.length * rowHeight + bottomPadding;
  const barWidth = width - leftPadding - rightPadding;

  const rowsMarkup = chartRows
    .map((item, index) => {
      const y = topPadding + index * rowHeight;
      const value = Number.isFinite(item.value) ? item.value : 0;
      const filledWidth = Math.max(3, Math.round((value / maxValue) * barWidth));

      return `
        <text x="16" y="${y + 16}" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12" fill="#5d5d5d">${escapeSvgText(item.label.slice(0, 42))}</text>
        <rect x="${leftPadding}" y="${y + 6}" width="${barWidth}" height="8" rx="4" fill="#eeeeee" />
        <rect x="${leftPadding}" y="${y + 6}" width="${filledWidth}" height="8" rx="4" fill="#000091" />
        <text x="${width - 16}" y="${y + 16}" text-anchor="end" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="12" fill="#3a3a3a">${Number.isFinite(item.value) ? item.value.toLocaleString("fr-FR") : "-"}</text>
      `;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#ffffff" />
    <text x="16" y="28" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="15" font-weight="600" fill="#161616">${escapeSvgText(chart.title)}</text>
    <text x="16" y="44" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="11" fill="#666666">${escapeSvgText(chart.type)}</text>
    ${rowsMarkup}
  </svg>`;
}

async function copySvgChart(chart: AssistantChartSpec) {
  const svg = createChartSvg(chart);

  try {
    if ("ClipboardItem" in window && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/svg+xml": new Blob([svg], { type: "image/svg+xml" }),
          "text/plain": new Blob([svg], { type: "text/plain" }),
        }),
      ]);
      return;
    }
  } catch {
    // Some browsers expose ClipboardItem but reject image/svg+xml.
  }

  await navigator.clipboard?.writeText(svg);
}

async function copyJpgChart(chart: AssistantChartSpec) {
  const svg = createChartSvg(chart);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = document.createElement("img");
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = reject;
      nextImage.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas indisponible.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const jpgBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(new Error("Impossible de créer l'image JPG."));
        },
        "image/jpeg",
        0.92,
      );
    });

    await navigator.clipboard.write([
      new ClipboardItem({ "image/jpeg": jpgBlob }),
    ]);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function AssistantChart({ chart }: { chart: AssistantChartSpec }) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rows = chart.data.slice(0, 30);
    const labels = rows.map((item, index) =>
      String(item[chart.xKey] ?? `Valeur ${index + 1}`),
    );
    const values = rows.map((item) => Number(item[chart.yKey]));
    const colors = [
      "#000091",
      "#6a6af4",
      "#009081",
      "#e1000f",
      "#a558a0",
      "#d64d00",
      "#7d4e24",
      "#18753c",
    ];
    let chartInstance: Chart;

    if (chart.type === "doughnut") {
      chartInstance = new Chart(canvas, {
        type: "doughnut",
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: labels.map(
                (_, index) => colors[index % colors.length],
              ),
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    } else if (chart.type === "scatter") {
      const points = rows
        .map((item) => ({
          x: Number(item[chart.xKey]),
          y: Number(item[chart.yKey]),
        }))
        .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

      chartInstance = new Chart(canvas, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: chart.title,
              data: points,
              backgroundColor: "#000091",
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    } else {
      chartInstance = new Chart(canvas, {
        type: chart.type,
        data: {
          labels,
          datasets: [
            {
              label: chart.title,
              data: values,
              backgroundColor: "#000091",
              borderColor: "#000091",
              borderWidth: 2,
              borderRadius: chart.type === "bar" ? 3 : undefined,
              tension: chart.type === "line" ? 0.25 : undefined,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    return () => chartInstance.destroy();
  }, [chart]);

  async function copyChart(format: "jpg" | "svg") {
    try {
      if (format === "svg") {
        await copySvgChart(chart);
      } else {
        await copyJpgChart(chart);
      }

      setCopyStatus(format === "svg" ? "SVG copié" : "JPG copié");
    } catch {
      setCopyStatus("Copie impossible");
    }

    window.setTimeout(() => setCopyStatus(null), 1600);
  }

  return (
    <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] font-medium text-[#161616]">
          {chart.title}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {chart.type === "bar" ? <details className="relative">
            <summary
              className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#161616] [&::-webkit-details-marker]:hidden"
              aria-label="Copier le graphique"
              title="Copier le graphique"
            >
              <Icon path={icons.copy} className="h-3.5 w-3.5" />
            </summary>
            <div className="absolute right-0 top-7 z-20 w-[150px] rounded border border-[#E5E5E5] bg-[#FFFFFF] p-1 shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
              <button
                type="button"
                onClick={() => void copyChart("jpg")}
                className="flex h-7 w-full items-center px-2 text-left text-[12px] leading-4 text-[#3a3a3a] hover:bg-[#f6f6f6]"
              >
                Copier en JPG
              </button>
              <button
                type="button"
                onClick={() => void copyChart("svg")}
                className="flex h-7 w-full items-center px-2 text-left text-[12px] leading-4 text-[#3a3a3a] hover:bg-[#f6f6f6]"
              >
                Copier en SVG
              </button>
              {copyStatus ? (
                <p className="border-t border-[#E5E5E5] px-2 py-1 text-[11px] leading-4 text-[#5d5d5d]">
                  {copyStatus}
                </p>
              ) : null}
            </div>
          </details> : null}
        </div>
      </div>
      <div className="relative h-[260px] w-full">
        <canvas ref={canvasRef} aria-label={chart.title} role="img" />
      </div>
    </div>
  );
}

function shouldCreateChart(question: string) {
  return /\b(graphique|graphe|graph|visualis|visualis|diagramme|courbe|histogramme|barres?|camembert|chart|plot)\b/i.test(
    question,
  );
}

function getVegaField(channel: unknown) {
  if (
    typeof channel === "object" &&
    channel !== null &&
    "field" in channel &&
    typeof channel.field === "string"
  ) {
    return channel.field;
  }

  return undefined;
}

function getVegaMarkType(mark: unknown): AssistantChartSpec["type"] {
  const markType =
    typeof mark === "string"
      ? mark
      : typeof mark === "object" &&
          mark !== null &&
          "type" in mark &&
          typeof mark.type === "string"
        ? mark.type
        : "bar";

  if (markType === "line") {
    return "line";
  }

  if (markType === "arc") {
    return "doughnut";
  }

  if (markType === "point") {
    return "scatter";
  }

  return "bar";
}

function chartFromVegaSpec(
  spec: VegaLiteSpec,
  fallbackData: Record<string, unknown>[],
  fallbackTitle: string,
): AssistantChartSpec {
  const values = fallbackData;
  const encoding =
    typeof spec.encoding === "object" && spec.encoding !== null
      ? (spec.encoding as Record<string, unknown>)
      : {};
  const firstRow = values[0] ?? {};
  const fields = Object.keys(firstRow);
  const xKey =
    getVegaField(encoding.x) ??
    getVegaField(encoding.color) ??
    fields[0] ??
    "label";
  const yKey =
    getVegaField(encoding.y) ??
    getVegaField(encoding.theta) ??
    fields[1] ??
    "value";
  const title =
    typeof spec.title === "string" && spec.title.trim()
      ? spec.title.trim()
      : fallbackTitle;

  return {
    type: getVegaMarkType(spec.mark),
    title,
    xKey,
    yKey,
    data: values,
    spec,
  };
}

function AssistantDisclosure({
  icon,
  title,
  children,
}: {
  icon: RemixIconComponent;
  title: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-[12px] text-[#777777]">
      <button
        type="button"
        className={`flex w-full cursor-pointer items-center justify-between py-1 font-medium transition-colors ${
          isOpen ? "text-[#161616]" : "text-[#777777]"
        }`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon path={icon} className="h-3.5 w-3.5" />
          <span>{title}</span>
        </span>
        <Icon
          path={icons.arrowRightS}
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${
          isOpen
            ? "grid-rows-[1fr] translate-y-0 opacity-100"
            : "grid-rows-[0fr] -translate-y-1 opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function getAssistantToolLabel(
  tool: NonNullable<AgentResponse["toolTrace"]>[number]["tool"],
) {
  const labels: Record<string, string> = {
    inspect_schema: "Inspecter le schéma",
    execute_sql: "Exécuter la requête SQL",
    get_resource_context: "Lire le contexte de la ressource",
    execute_query: "Interroger les données",
    create_chart: "Créer le graphique",
  };

  return labels[String(tool)] ?? String(tool);
}

function AssistantSqlBlock({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);
  const tokens = sql.split(
    /(\b(?:SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|LIMIT|AS|AND|OR|JOIN|ON|WITH|DESC|ASC|IS\s+NOT\s+NULL|IS\s+NULL)\b|\b(?:COUNT|SUM|AVG|MIN|MAX|ROUND|TRIM|UNNEST|string_split)\b|\b\d+(?:\.\d+)?\b|'[^']*')/gi,
  );

  async function copySql() {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mt-2 overflow-hidden rounded border border-[#dddddd] bg-[#f6f6f6]">
      <div className="flex min-h-8 items-center justify-between border-b border-[#dddddd] px-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.05em] text-[#777777]">
          SQL exécuté
        </span>
        <button
          type="button"
          onClick={() => void copySql()}
          className="flex h-6 items-center gap-1 rounded px-1.5 text-[10px] text-[#555555] hover:bg-[#e5e5e5] hover:text-[#161616]"
          aria-label="Copier la requête SQL"
          title="Copier la requête SQL"
        >
          <Icon path={icons.copy} className="h-3.5 w-3.5" />
          {copied ? <span>Copié</span> : null}
        </button>
      </div>
      <pre className="max-h-44 overflow-auto p-2 font-mono text-[11px] leading-5 text-[#333333]">
        {tokens.map((token, index) => {
          const normalized = token.toUpperCase();
          const className = /^(SELECT|FROM|WHERE|GROUP\s+BY|ORDER\s+BY|LIMIT|AS|AND|OR|JOIN|ON|WITH)$/.test(normalized)
            ? "font-semibold text-[#000091]"
            : /^(DESC|ASC|IS\s+NOT\s+NULL|IS\s+NULL)$/.test(normalized)
              ? "text-[#7b2cbf]"
              : /^(COUNT|SUM|AVG|MIN|MAX|ROUND|TRIM|UNNEST|STRING_SPLIT)$/.test(normalized)
                ? "font-semibold text-[#a55800]"
                : /^\d/.test(token)
                  ? "text-[#ce0500]"
                  : /^'/.test(token)
                    ? "text-[#18753c]"
                    : "";

          return <span key={`${token}-${index}`} className={className}>{token}</span>;
        })}
      </pre>
    </div>
  );
}

function ChatSidebar({
  activeResource,
  sourceName,
  onApplyFilter,
  onApplySort,
  onClose,
}: {
  activeResource: Resource;
  sourceName: string;
  onApplyFilter: AssistantActionHandlers["onApplyFilter"];
  onApplySort: AssistantActionHandlers["onApplySort"];
  onClose: () => void;
}) {
  const [agentQuestion, setAgentQuestion] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [appliedActionMessageIds, setAppliedActionMessageIds] = useState<
    string[]
  >([]);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<string, "up" | "down">
  >({});
  const [feedbackDetailsMessageId, setFeedbackDetailsMessageId] = useState<
    string | null
  >(null);
  const [feedbackDetails, setFeedbackDetails] = useState("");
  const [feedbackDetailsSentIds, setFeedbackDetailsSentIds] = useState<
    string[]
  >([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [chatSidebarWidth, setChatSidebarWidth] = useState(chatSidebarDefaultWidth);
  const [lastTokenUsage, setLastTokenUsage] = useState<TokenUsage | undefined>();
  const starterQuestions = useMemo(() => getAssistantStarterQuestions(), []);
  const inspectedSchemaRef = useRef<InspectSchemaResult | null>(null);
  const messageIdCounterRef = useRef(0);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollContainer = chatScrollRef.current;

    if (!scrollContainer) {
      return;
    }

    requestAnimationFrame(() => {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages.length, isAgentLoading, loadingStepIndex]);

  function startChatSidebarResize(event: ReactMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = chatSidebarWidth;

    function handleMouseMove(moveEvent: MouseEvent) {
      setChatSidebarWidth(
        clampChatSidebarWidth(startWidth - (moveEvent.clientX - startX)),
      );
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function normalizeRemoteResponse(response: Partial<AgentResponse>): AgentResponse {
    return {
      intent: response.intent ?? "aggregate",
      answer:
        response.answer ??
        "Je n’ai pas reçu de réponse exploitable pour cette question.",
      reasoning: response.reasoning,
      sql: response.sql,
      chart: response.chart,
      queryRows: response.queryRows,
      toolTrace: response.toolTrace,
      columnsUsed: response.columnsUsed,
      proposedAction: response.proposedAction ?? { type: "none" },
      needsClarification: response.needsClarification,
      clarificationOptions: response.clarificationOptions,
      model: response.model,
      usage: response.usage,
      status: response.status ?? "success",
    };
  }

  function executionRowsToRecords(result: ExecuteSqlResult) {
    return result.rows.map((row) =>
      Object.fromEntries(result.columns.map((column, index) => [column, row[index]])),
    );
  }

  async function callAgentPhase(payload: Record<string, unknown>) {
    const apiResponse = await fetch(
      "/api/prototypes/explorateur-sql-et-ia/agent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resourceName: sourceName,
          tableName: "data",
          conversationHistory: messages.slice(-8).map((message) => ({
            role: message.role,
            content: message.content,
          })),
          ...payload,
        }),
      },
    );
    const data = (await apiResponse.json()) as AgentPhaseResponse;

    if (!apiResponse.ok || data.error) {
      throw new Error(data.error ?? "Impossible d’interroger le modèle.");
    }

    return data;
  }

  async function runRemoteAssistant(question: string): Promise<AgentResponse> {
    const toolTrace: AgentResponse["toolTrace"] = [];
    const cachedSchema = inspectedSchemaRef.current;
    let plan = await callAgentPhase({
      phase: "plan",
      question,
      schema: cachedSchema,
    });
    let planningUsage = plan.usage;

    if (plan.answer) {
      return normalizeRemoteResponse({
        answer: plan.answer,
        reasoning: plan.reasoning,
        needsClarification: plan.needsClarification,
        proposedAction: { type: "none" },
        model: plan.model,
        usage: plan.usage,
        status: plan.needsClarification ? "ambiguous" : "success",
      });
    }

    if (
      plan.toolCall?.tool !== "inspect_schema" &&
      plan.toolCall?.tool !== "execute_sql"
    ) {
      throw new Error("Le modèle n'a pas choisi un tool exploitable à cette étape.");
    }

    const schema = cachedSchema ?? (await inspectSchema());
    inspectedSchemaRef.current = schema;
    if (!cachedSchema) {
      toolTrace.push({
        tool: "inspect_schema",
        description: "Récupérer le schéma réel avant d'écrire du SQL.",
        summary: `${schema.columns.length} colonnes et ${Number(schema.rows).toLocaleString("fr-FR")} lignes inspectées localement.`,
      });
    }

    if (!cachedSchema || plan.toolCall?.tool === "inspect_schema") {
      const schemaPlan = await callAgentPhase({
        phase: "plan",
        question,
        schema,
      });
      planningUsage = mergeTokenUsage(planningUsage, schemaPlan.usage);
      plan = schemaPlan;

      if (plan.answer) {
        return normalizeRemoteResponse({
          answer: plan.answer,
          reasoning: plan.reasoning,
          needsClarification: plan.needsClarification,
          toolTrace,
          proposedAction: { type: "none" },
          model: plan.model,
          usage: planningUsage,
          status: plan.needsClarification ? "ambiguous" : "success",
        });
      }

      if (plan.toolCall?.tool !== "execute_sql") {
        return normalizeRemoteResponse({
          answer:
            "Je ne suis pas certain de l’analyse à effectuer avec les colonnes disponibles. Peux-tu préciser la mesure, la dimension ou le résultat attendu ?",
          reasoning:
            "La structure du fichier a été inspectée, mais aucune interprétation suffisamment fiable n’a pu être retenue sans précision supplémentaire.",
          needsClarification: true,
          toolTrace,
          proposedAction: { type: "none" },
          model: plan.model,
          usage: planningUsage,
          status: "ambiguous",
        });
      }
    }

    const sqlEvidence: SqlExecutionEvidence[] = [];
    const sqlFailures: SqlExecutionFailure[] = [];
    let finalModel = plan.model;
    let totalUsage = planningUsage;
    let pendingSqlToolCall =
      plan.toolCall?.tool === "execute_sql"
        ? plan.toolCall
        : undefined;

    for (let queryIndex = 0; queryIndex < 3; queryIndex += 1) {
      const sqlPlan = pendingSqlToolCall
        ? { toolCall: pendingSqlToolCall, model: plan.model, usage: undefined }
        : await callAgentPhase({
            phase: "generate_sql",
            question,
            schema,
            previousSqlResults: sqlEvidence,
            previousSqlErrors: sqlFailures,
          });
      pendingSqlToolCall = undefined;

      finalModel = sqlPlan.model ?? finalModel;
      totalUsage = mergeTokenUsage(totalUsage, sqlPlan.usage);

      if (sqlPlan.toolCall?.tool !== "execute_sql") {
        throw new Error("Le modèle doit appeler execute_sql après inspection du schéma.");
      }

      const sql = sqlPlan.toolCall.arguments.sql;
      const sqlDescription =
        sqlPlan.toolCall.arguments.description ||
        "Exécuter une requête sur le fichier chargé.";
      const shouldShow = sqlPlan.toolCall.arguments.show ?? queryIndex >= 2;
      let executionResult: ExecuteSqlResult;

      try {
        executionResult = await executeSql(sql);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erreur SQL inconnue.";

        sqlFailures.push({ sql, error: errorMessage.slice(0, 1200) });
        toolTrace.push({
          tool: "execute_sql",
          description: sqlDescription,
          summary: "La requête a échoué et va être corrigée automatiquement.",
          show: false,
        });
        continue;
      }

      sqlEvidence.push({
        description: sqlDescription,
        sql,
        result: executionResult,
      });
      toolTrace.push({
        tool: "execute_sql",
        description: sqlDescription,
        summary: `${executionResult.rowCount} lignes retournées par l'analyse locale.`,
        show: shouldShow,
      });

      if (shouldShow) {
        break;
      }
    }

    const finalEvidence = sqlEvidence.at(-1);

    if (!finalEvidence) {
      return normalizeRemoteResponse({
        answer:
          "Je n’ai pas réussi à construire une analyse fiable avec les informations actuelles. Peux-tu préciser les colonnes à utiliser ou le résultat que tu attends ?",
        reasoning:
          sqlFailures.length > 0
            ? `Les ${sqlFailures.length} tentatives SQL ont échoué malgré leur correction automatique. Une précision sur la mesure ou la granularité permettra de repartir sur une interprétation différente.`
            : "Aucune requête suffisamment fiable n’a pu être exécutée avec le schéma disponible.",
        needsClarification: true,
        toolTrace,
        proposedAction: { type: "none" },
        model: finalModel,
        usage: totalUsage,
        status: "ambiguous",
      });
    }

    const finalAnswer = await callAgentPhase({
      phase: "synthesize",
      question,
      schema,
      sql: finalEvidence.sql,
      executionResult: finalEvidence.result,
      previousSqlResults: sqlEvidence,
    });

    let generatedChart: AssistantChartSpec | undefined;

    if (shouldCreateChart(question)) {
      try {
        const chartPlan = await callAgentPhase({
          phase: "create_chart",
          question,
          schema,
          sql: finalEvidence.sql,
          executionResult: finalEvidence.result,
        });

        totalUsage = mergeTokenUsage(totalUsage, chartPlan.usage);

        if (chartPlan.toolCall?.tool !== "create_chart") {
          throw new Error("Le modèle n'a pas produit de graphique exploitable.");
        }

        const chartDescription =
          chartPlan.toolCall.arguments.description ||
          "Créer une visualisation à partir du résultat SQL.";
        const chartData = executionRowsToRecords(finalEvidence.result);

        generatedChart = chartFromVegaSpec(
          chartPlan.toolCall.arguments.spec,
          chartData,
          chartDescription,
        );
        toolTrace.push({
          tool: "create_chart",
          description: chartDescription,
          summary: `${generatedChart.data.length} lignes utilisées pour générer le graphique.`,
          show: true,
        });
      } catch {
        toolTrace.push({
          tool: "create_chart",
          description: "Créer une visualisation à partir du résultat SQL.",
          summary: "Le graphique n’a pas pu être généré ; le résultat tabulaire reste disponible.",
          show: false,
        });
      }
    }

    return normalizeRemoteResponse({
      answer:
        finalAnswer.answer ??
        "Je n’ai pas reçu de réponse exploitable pour cette question.",
      reasoning: finalAnswer.reasoning,
      sql: finalAnswer.sql ?? finalEvidence.sql,
      chart: generatedChart,
      queryRows: executionRowsToRecords(finalEvidence.result).slice(0, 12),
      toolTrace,
      proposedAction: { type: "none" },
      model: finalAnswer.model ?? finalModel,
      usage: mergeTokenUsage(totalUsage, finalAnswer.usage),
      status: "success",
    });
  }

  function applyResponseAction(response: AgentResponse, messageId?: string) {
    if (response.proposedAction.type === "apply_filter") {
      onApplyFilter(response.proposedAction.payload.filters);
      if (messageId) {
        setAppliedActionMessageIds((current) =>
          current.includes(messageId) ? current : [...current, messageId],
        );
      }
      return;
    }

    if (response.proposedAction.type === "apply_sort") {
      onApplySort(response.proposedAction.payload);
      if (messageId) {
        setAppliedActionMessageIds((current) =>
          current.includes(messageId) ? current : [...current, messageId],
        );
      }
    }
  }

  function submitAgentQuestion(nextQuestion = agentQuestion) {
    const question = nextQuestion.trim();

    if (!question || isAgentLoading) {
      return;
    }

    messageIdCounterRef.current += 1;
    const messageId = messageIdCounterRef.current;
    setIsAgentLoading(true);
    setLoadingStepIndex(0);
    setAgentQuestion("");
    const userMessageId = `user-${messageId}`;
    const assistantMessageId = `assistant-${messageId}`;

    setMessages((current) => [
      ...current,
      {
        id: userMessageId,
        role: "user",
        content: question,
      },
    ]);

    const loadingInterval = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        current >= assistantLoadingSteps.length - 1 ? current : current + 1,
      );
    }, 900);

    void (async () => {
      let response: AgentResponse;

      try {
        response = await runRemoteAssistant(question);
      } catch (error) {
        console.error("prototype-assistant-remote-error", error);
        response = {
          intent: "clarify",
          answer:
            "Je n’ai pas pu confirmer une réponse fiable. Peux-tu reformuler la demande en précisant le résultat attendu ou les colonnes à utiliser ?",
          reasoning:
            error instanceof Error
              ? `L’analyse a été interrompue avant d’obtenir une preuve exploitable : ${error.message}. Une précision permettra de relancer le parcours avec une interprétation plus ciblée.`
              : "L’analyse a été interrompue avant d’obtenir une preuve exploitable. Une précision permettra de relancer le parcours avec une interprétation plus ciblée.",
          needsClarification: true,
          proposedAction: { type: "none" },
          status: "ambiguous",
        };
      } finally {
        window.clearInterval(loadingInterval);
      }

      setMessages((current) => [
        ...current,
        {
          id: assistantMessageId,
          role: "assistant",
          content: response.answer,
          response,
        },
      ]);
      if (response.proposedAction.type === "apply_filter") {
        applyResponseAction(response, assistantMessageId);
      }
      setLastTokenUsage(response.usage);
      setIsAgentLoading(false);
    })();
  }

  function submitStarterQuestion(question: string) {
    setAgentQuestion(question);
    submitAgentQuestion(question);
  }

  return (
    <aside
      className="chat-sidebar relative flex shrink-0 flex-col overflow-hidden border-l border-[#E5E5E5] bg-[#FFFFFF] transition-[width] duration-200"
      style={{ width: chatSidebarWidth }}
      data-active-resource={activeResource.id}
    >
      <button
        type="button"
        aria-label="Redimensionner l’assistant"
        title="Glisser pour redimensionner, double-cliquer pour réinitialiser"
        onMouseDown={startChatSidebarResize}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setChatSidebarWidth(chatSidebarDefaultWidth);
        }}
        className="absolute -left-1 top-0 z-20 h-full w-2 cursor-col-resize touch-none rounded-l transition-colors hover:bg-[#000091]/10"
      >
        <span className="sr-only">Redimensionner</span>
      </button>

      <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E5E5E5] bg-[#f6f6f6] px-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium leading-[1.4] text-[#161616]">
            Interroger ces données
          </p>
        </div>
        <button
          type="button"
          aria-label="Fermer l’assistant"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-[#161616] transition-colors hover:bg-[#eeeeee]"
        >
          <Icon path={icons.sidebarUnfold} className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={chatScrollRef}
        className="min-h-0 flex-1 overflow-auto bg-[#FFFFFF] px-3 py-3"
      >
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col justify-end pb-2">
            <p className="px-1 text-[14px] font-semibold leading-[1.4] text-[#161616]">
              Assistant d’exploration de données
            </p>
            <p className="mt-1 px-1 text-[13px] leading-5 text-[#5d5d5d]">
              Posez une question sur ces données.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submitStarterQuestion(question)}
                  className="min-h-7 max-w-full cursor-pointer rounded-full border border-[#E5E5E5] bg-[#FFFFFF] px-2.5 py-1 text-left text-[12px] leading-[1.35] text-[#3a3a3a] transition-colors hover:border-[#000091] hover:bg-[#e8edff] hover:text-[#000091]"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[300px] rounded bg-[#eeeeee] px-3 py-2 text-[13px] leading-5 text-[#161616]">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="flex flex-col gap-2">
                  {message.response?.reasoning ? (
                    <div className="order-1">
                      <AssistantDisclosure icon={icons.brain} title="Raisonnement">
                        <p className="px-[22px] py-1 text-[12px] leading-5 text-[#777777]">
                        {message.response.reasoning}
                        </p>
                      </AssistantDisclosure>
                    </div>
                  ) : null}
                  {message.response?.toolTrace?.length || message.response?.sql ? (
                    <div className="order-2">
                      <AssistantDisclosure
                        icon={icons.wrench}
                        title={`${message.response.toolTrace?.length || (message.response.sql ? 1 : 0)} ${
                          (message.response.toolTrace?.length || (message.response.sql ? 1 : 0)) > 1
                            ? "outils utilisés"
                            : "outil utilisé"
                        }`}
                      >
                        <div className="space-y-1 px-[22px] py-1">
                          {message.response.toolTrace?.length ? (
                            message.response.toolTrace.map((trace, index) => (
                                <p
                                  key={`${trace.tool}-${index}`}
                                  className="grid grid-cols-[16px_minmax(0,1fr)] gap-1 text-[11px] leading-5 text-[#777777]"
                                >
                                  <span className="text-[#555555]">{index + 1}.</span>
                                  <span className="min-w-0">
                                    <strong className="font-semibold text-[#333333]">
                                      {getAssistantToolLabel(trace.tool)}
                                    </strong>
                                    {trace.description ? (
                                      <span> — {trace.description}</span>
                                    ) : null}
                                    <span className="block text-[#666666]">
                                      {trace.summary}
                                    </span>
                                  </span>
                                </p>
                              ))
                          ) : (
                            <p className="text-[12px] leading-5 text-[#666666]">
                              Aucun tool n’a été nécessaire pour cette réponse.
                            </p>
                          )}
                        </div>
                        {message.response.sql ? (
                          <div className="px-[22px]">
                            <AssistantSqlBlock sql={message.response.sql} />
                          </div>
                        ) : null}
                        {message.response.columnsUsed?.length ? (
                          <p className="px-[22px] pb-1 pt-2 text-[11px] leading-5 text-[#777777]">
                            Colonnes utilisées : {message.response.columnsUsed.join(", ")}
                          </p>
                        ) : null}
                      </AssistantDisclosure>
                    </div>
                  ) : null}
                  <div className="order-3 text-[13px] leading-5 text-[#161616]">
                    <div className="space-y-2">{renderAssistantMarkdown(message.content)}</div>
                    {message.response?.proposedAction.type === "apply_filter" ? (
                      <div className="mt-3 rounded border border-[#E5E5E5] bg-[#f6f6f6] p-2">
                        <p className="mb-1 text-[11px] font-bold uppercase leading-4 text-[#666666]">
                          Filtre proposé
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.response.proposedAction.payload.filters.map(
                            (filter) => (
                              <span
                                key={`${filter.key}-${filter.value}`}
                                className="rounded bg-[#FFFFFF] px-2 py-1 text-[12px] leading-4 text-[#161616]"
                              >
                                {filter.label} = {filter.value}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}
                    {message.response?.proposedAction.type === "apply_sort" ? (
                      <div className="mt-3 rounded border border-[#E5E5E5] bg-[#f6f6f6] p-2">
                        <p className="mb-1 text-[11px] font-bold uppercase leading-4 text-[#666666]">
                          Tri proposé
                        </p>
                        <span className="rounded bg-[#FFFFFF] px-2 py-1 text-[12px] leading-4 text-[#161616]">
                          {message.response.proposedAction.payload.label} ·{" "}
                          {message.response.proposedAction.payload.direction ===
                          "desc"
                            ? "décroissant"
                            : "croissant"}
                        </span>
                      </div>
                    ) : null}
                    {message.response?.needsClarification &&
                    message.response.clarificationOptions ? (
                      <div className="mt-3 flex flex-col gap-1">
                        {message.response.clarificationOptions.map((option) => (
                          <button
                            key={`${option.key}-${option.value}`}
                            type="button"
                            onClick={() =>
                              applyResponseAction({
                                intent: "search_rows",
                                answer: `J’applique le filtre ${option.label} = ${option.value}.`,
                                columnsUsed: [option.label],
                                proposedAction: {
                                  type: "apply_filter",
                                  payload: { filters: [option] },
                                },
                                status: "success",
                              })
                            }
                            className="flex h-8 items-center justify-between rounded border border-[#E5E5E5] px-2 text-left text-[12px] hover:border-[#000091] hover:text-[#000091]"
                          >
                            <span>{option.label} = {option.value}</span>
                            <span>{option.count}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {message.response?.proposedAction.type === "apply_filter" ? (
                      appliedActionMessageIds.includes(message.id) ? (
                        <div className="mt-3 flex h-8 items-center gap-2 rounded bg-[#e6feda] px-3 text-[13px] font-medium text-[#18753c]">
                          <Icon path={icons.check} className="h-4 w-4 text-[#18753c]" />
                          Filtre appliqué
                        </div>
                      ) : (
                      <button
                        type="button"
                        onClick={() =>
                          applyResponseAction(
                            message.response as AgentResponse,
                            message.id,
                          )
                        }
                        className="mt-3 flex h-8 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-[#FFFFFF]"
                      >
                        <Icon path={icons.filter} className="h-4 w-4 text-[#FFFFFF]" />
                        Appliquer le filtre dans le tableau
                      </button>
                      )
                    ) : null}
                    {message.response?.proposedAction.type === "apply_sort" ? (
                      appliedActionMessageIds.includes(message.id) ? (
                        <div className="mt-3 flex h-8 items-center gap-2 rounded bg-[#e6feda] px-3 text-[13px] font-medium text-[#18753c]">
                          <Icon path={icons.check} className="h-4 w-4 text-[#18753c]" />
                          Tri appliqué
                        </div>
                      ) : (
                      <button
                        type="button"
                        onClick={() =>
                          applyResponseAction(
                            message.response as AgentResponse,
                            message.id,
                          )
                        }
                        className="mt-3 flex h-8 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-[#FFFFFF]"
                      >
                        <Icon path={icons.arrowDown} className="h-4 w-4 text-[#FFFFFF]" />
                        Trier le tableau
                      </button>
                      )
                    ) : null}
                  </div>
                  {message.response?.chart ? (
                    <div className="order-4">
                      <AssistantChart chart={message.response.chart} />
                    </div>
                  ) : null}
                  <div className="order-5">
                    {messageFeedback[message.id] ? (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#555555]" role="status">
                        <span>
                          {feedbackDetailsSentIds.includes(message.id)
                            ? "Merci pour vos précisions !"
                            : "Merci pour votre retour !"}
                        </span>
                        {!feedbackDetailsSentIds.includes(message.id) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFeedbackDetails("");
                              setFeedbackDetailsMessageId(message.id);
                            }}
                            className="font-semibold text-[#000091] underline underline-offset-2"
                          >
                            Partager plus de détails
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          aria-label="Réponse utile"
                          title="Réponse utile"
                          onClick={() =>
                            setMessageFeedback((current) => ({
                              ...current,
                              [message.id]: "up",
                            }))
                          }
                          className="flex h-6 w-6 items-center justify-center rounded text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#000091]"
                        >
                          <Icon path={icons.thumbUp} className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Réponse inutile"
                          title="Réponse inutile"
                          onClick={() =>
                            setMessageFeedback((current) => ({
                              ...current,
                              [message.id]: "down",
                            }))
                          }
                          className="flex h-6 w-6 items-center justify-center rounded text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#000091]"
                        >
                          <Icon path={icons.thumbDown} className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            {isAgentLoading ? (
              <div className="flex flex-col gap-1 px-1">
                {assistantLoadingSteps.map((step, index) => (
                  <p
                    key={step.label}
                    className={`text-[11px] font-medium leading-[1.5] ${
                      index === loadingStepIndex
                        ? "t-shimmer"
                        : "text-[#9c9c9c]"
                    }`}
                    data-text={index === loadingStepIndex ? step.label : undefined}
                  >
                    {step.label}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form
        className="shrink-0 bg-[#FFFFFF] px-3"
        onSubmit={(event) => {
          event.preventDefault();
          submitAgentQuestion();
        }}
      >
        <label className="sr-only" htmlFor="chat-question">
          Question sur les données
        </label>
        <div className="flex h-[161px] flex-col justify-between rounded border border-[#ebebeb] bg-[rgba(0,0,0,0.02)] px-2 py-3">
          <textarea
            id="chat-question"
            rows={4}
            value={agentQuestion}
            onChange={(event) => setAgentQuestion(event.target.value)}
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key !== "Enter" || event.shiftKey) {
                return;
              }

              event.preventDefault();
              submitAgentQuestion();
            }}
            placeholder="Posez une question en langage naturel"
            className="min-h-0 flex-1 resize-none bg-transparent text-[13px] leading-[1.4] text-[#161616] outline-none placeholder:text-[#6a6a6a]"
          />
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-1">
              <TokenUsageToggle usage={lastTokenUsage} />
              <ModelInfoChip />
            </div>
            <button
              type="submit"
              aria-label="Envoyer la question"
              disabled={isAgentLoading || !agentQuestion.trim()}
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center bg-[#000091] text-[#FFFFFF] transition-colors hover:bg-[#1212ff] disabled:cursor-not-allowed disabled:bg-[#929292]"
            >
              <Icon path={icons.arrowUp} className="h-4 w-4 text-[#FFFFFF]" />
            </button>
          </div>
        </div>
        <div className="mt-1 flex min-h-6 flex-wrap items-center justify-end gap-1 bg-[#FFFFFF] pb-1 text-right text-[11px] leading-none text-[#5d5d5d]">
          <span>L’assistant peut faire des erreurs.</span>
          <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
            <Link
              href="/a-propos"
              className="underline decoration-solid underline-offset-2 hover:text-[#000091]"
            >
              En savoir plus
            </Link>
            <Icon path={icons.externalLink} className="block h-2.5 w-2.5 shrink-0" />
          </span>
        </div>
      </form>

      {feedbackDetailsMessageId ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/30 p-5"
          role="presentation"
          onMouseDown={() => setFeedbackDetailsMessageId(null)}
        >
          <div
            className="w-full max-w-[430px] border border-[#cccccc] bg-[#FFFFFF] shadow-[0_18px_55px_rgba(0,0,0,0.2)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assistant-feedback-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5 border-b border-[#E5E5E5] p-4">
              <div>
                <h2 id="assistant-feedback-title" className="text-[15px] font-semibold text-[#161616]">
                  Partager plus de détails
                </h2>
                <p className="mt-1 text-[11px] text-[#666666]">
                  Votre retour nous aide à améliorer les réponses.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackDetailsMessageId(null)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-[#eeeeee]"
                aria-label="Fermer"
              >
                <Icon path={icons.close} className="h-4 w-4" />
              </button>
            </div>
            <form
              className="p-4"
              onSubmit={(event) => {
                event.preventDefault();
                setFeedbackDetailsSentIds((current) =>
                  current.includes(feedbackDetailsMessageId)
                    ? current
                    : [...current, feedbackDetailsMessageId],
                );
                setFeedbackDetailsMessageId(null);
              }}
            >
              <label htmlFor="assistant-feedback-details" className="mb-1.5 block text-[11px] font-semibold text-[#161616]">
                Votre commentaire
              </label>
              <textarea
                id="assistant-feedback-details"
                value={feedbackDetails}
                onChange={(event) => setFeedbackDetails(event.target.value)}
                rows={5}
                autoFocus
                placeholder="Qu’est-ce qui était utile ou pourrait être amélioré ?"
                className="block w-full resize-y border border-[#aaaaaa] p-2 text-[12px] leading-5 outline-none focus:border-[#000091] focus:ring-1 focus:ring-[#000091]"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackDetailsMessageId(null)}
                  className="border border-[#cccccc] px-3 py-2 text-[12px] font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!feedbackDetails.trim()}
                  className="bg-[#000091] px-3 py-2 text-[12px] font-semibold text-[#FFFFFF] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export default function ExplorateurSqlEtIaPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [resourceSidebarWidth, setResourceSidebarWidth] = useState(
    resourceSidebarDefaultWidth,
  );
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState("catalogue_datasets");
  const [parquetFileUrl, setParquetFileUrl] = useState(defaultParquetFileUrl);
  const [activeParquetUrl, setActiveParquetUrl] = useState(defaultParquetFileUrl);
  const [parquetReloadVersion, setParquetReloadVersion] = useState(0);
  const [activeFilter, setActiveFilter] = useState<ColumnKey | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileResourceMenuOpen, setIsMobileResourceMenuOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isExplorerMinimized, setIsExplorerMinimized] = useState(false);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<ColumnKey[]>(
    tableColumns.map((column) => column.key),
  );
  const [columnWidths, setColumnWidths] = useState<Record<ColumnKey, number>>(
    () =>
      Object.fromEntries(
        tableColumns.map((column) => [column.key, column.widthPx]),
      ) as Record<ColumnKey, number>,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortState, setSortState] = useState<SortState>(null);
  const [categoryFilters, setCategoryFilters] = useState<
    Partial<Record<ColumnKey, string[]>>
  >({});
  const [filterSearches, setFilterSearches] = useState<
    Partial<Record<ColumnKey, string>>
  >({});
  const [categoryOptions, setCategoryOptions] = useState<
    Partial<Record<ColumnKey, { label: string; count: number }[]>>
  >({});
  const [numberRanges, setNumberRanges] = useState<
    Partial<Record<ColumnKey, NumberRange>>
  >({});
  const [dateFilters, setDateFilters] = useState<
    Partial<Record<ColumnKey, DateFilterValue>>
  >({});
  const [hasTableScrolled, setHasTableScrolled] = useState(false);
  const [tableScrollTop, setTableScrollTop] = useState(0);
  const [tableViewportHeight, setTableViewportHeight] = useState(640);
  const [isFilterFeedbackVisible, setIsFilterFeedbackVisible] = useState(false);
  const tableViewportRef = useRef<HTMLDivElement | null>(null);
  const pendingDatasetPagesRef = useRef<Set<number>>(new Set());
  const [datasetRowCount, setDatasetRowCount] = useState<number | null>(null);
  const [datasetFilteredRowCount, setDatasetFilteredRowCount] = useState<
    number | null
  >(null);
  const [datasetColumnNames, setDatasetColumnNames] = useState<string[]>([]);
  const [datasetSchemaColumns, setDatasetSchemaColumns] = useState<
    InspectSchemaResult["columns"]
  >([]);
  const [datasetRowsByIndex, setDatasetRowsByIndex] = useState<Record<number, Row>>({});
  const [datasetPreviewError, setDatasetPreviewError] = useState<string | null>(null);
  const [isDatasetPreviewLoading, setIsDatasetPreviewLoading] = useState(true);
  const [resourceTooltip, setResourceTooltip] = useState<ResourceTooltip>(null);

  const availableTableColumns = useMemo(
    () =>
      datasetSchemaColumns.length > 0
        ? datasetSchemaColumns.map((schemaColumn) => {
            const knownColumn = tableColumns.find(
              (column) => column.key === schemaColumn.name,
            );
            return knownColumn ?? tableColumnFromSchema(schemaColumn);
          })
        : tableColumns,
    [datasetSchemaColumns],
  );
  const visibleColumns = useMemo(
    () =>
      availableTableColumns.filter(
        (column) =>
          visibleColumnKeys.includes(column.key),
      ),
    [availableTableColumns, visibleColumnKeys],
  );

  function startColumnResize(
    key: ColumnKey,
    event: ReactMouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth =
      columnWidths[key] ?? tableColumns.find((column) => column.key === key)?.widthPx ?? 120;
    const minWidth = 72;
    const maxWidth = 360;

    function handleMouseMove(moveEvent: MouseEvent) {
      const nextWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth + moveEvent.clientX - startX),
      );

      setColumnWidths((current) => ({
        ...current,
        [key]: nextWidth,
      }));
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  const customParquetResource = useMemo<Resource>(
    () => ({
      id: "custom_parquet",
      name: activeParquetUrl,
      size: "—",
      format: "PARQUET",
      updatedAt: "—",
      downloads: 0,
      type: "table",
      tabs: ["Aperçu", "Structure des données"],
      sourceUrl: activeParquetUrl,
    }),
    [activeParquetUrl],
  );
  const activeResource =
    activeResourceId === customParquetResource.id
      ? customParquetResource
      : resources.find((resource) => resource.id === activeResourceId) ??
        resources[0];
  const activeParquetName = useMemo(() => {
    if (activeResource.sourceUrl === activeParquetUrl) {
      return activeResource.name;
    }

    try {
      return decodeURIComponent(
        new URL(activeParquetUrl).pathname.split("/").filter(Boolean).at(-1) ??
          "Fichier Parquet",
      );
    } catch {
      return "Fichier Parquet";
    }
  }, [activeParquetUrl, activeResource]);

  function loadParquetFileUrl(value: string, isCustomResource = true) {
    const nextUrl = value.trim();

    try {
      const parsedUrl = new URL(nextUrl);
      if (
        (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") ||
        !parsedUrl.pathname.toLowerCase().endsWith(".parquet")
      ) {
        throw new Error();
      }
    } catch {
      setDatasetPreviewError(
        "Collez une URL HTTP ou HTTPS ciblant un fichier .parquet.",
      );
      return;
    }

    setDatasetPreviewError(null);
    if (isCustomResource) {
      setActiveResourceId("custom_parquet");
    }
    setIsDatasetPreviewLoading(true);
    setDatasetColumnNames([]);
    setDatasetSchemaColumns([]);
    setDatasetRowCount(null);
    setDatasetFilteredRowCount(null);
    setDatasetRowsByIndex({});
    pendingDatasetPagesRef.current.clear();

    if (nextUrl === activeParquetUrl) {
      setParquetReloadVersion((current) => current + 1);
    } else {
      setActiveParquetUrl(nextUrl);
    }
    setIsMobileResourceMenuOpen(false);
  }

  function submitParquetFileUrl() {
    loadParquetFileUrl(parquetFileUrl);
  }

  const filteredResources = resources;

  const mainResources = filteredResources.filter(
    (resource) => resource.type !== "documentation",
  );
  const documentationResources = filteredResources.filter(
    (resource) => resource.type === "documentation",
  );

  function toggleResourceSidebarAutoFit() {
    const autoFitWidth = getAutoFitResourceSidebarWidth(resources);
    const isAlreadyAutoFit = Math.abs(resourceSidebarWidth - autoFitWidth) <= 2;

    setResourceSidebarWidth(
      isAlreadyAutoFit ? resourceSidebarDefaultWidth : autoFitWidth,
    );
  }

  function showResourceTooltip(resource: Resource, element: HTMLButtonElement) {
    if (isSidebarCollapsed) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = Math.min(
      360,
      Math.max(180, resource.name.length * 7 + 28),
    );
    const top = Math.min(
      window.innerHeight - 108,
      Math.max(8, rect.top - 8),
    );
    const left = Math.min(
      window.innerWidth - tooltipWidth - 8,
      rect.right + 8,
    );

    setResourceTooltip({ resource, top, left, width: tooltipWidth });
  }

  function startResourceSidebarResize(
    event: ReactMouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = resourceSidebarWidth;

    function handleMouseMove(moveEvent: MouseEvent) {
      setResourceSidebarWidth(
        clampResourceSidebarWidth(startWidth + moveEvent.clientX - startX),
      );
    }

    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  const totalVisibleColumnWidth = useMemo(
    () =>
      visibleColumns.reduce(
        (sum, column) => sum + (columnWidths[column.key] ?? column.widthPx),
        0,
      ),
    [columnWidths, visibleColumns],
  );
  const displayedRowCount = datasetFilteredRowCount ?? datasetRowCount ?? 0;
  const hasActiveDatasetFilters = Boolean(
    debouncedSearchQuery.trim() ||
      Object.values(categoryFilters).some((values) => values?.length) ||
      Object.values(numberRanges).some((range) => range?.min || range?.max) ||
      Object.values(dateFilters).some((filter) =>
        isDateFilterActive(filter),
      ),
  );
  const virtualizedRows = useMemo(() => {
    const rowCount = displayedRowCount;
    const firstVisibleRow = Math.max(
      0,
      Math.floor(
        Math.max(0, tableScrollTop - desktopTableHeaderHeight) /
          desktopTableRowHeight,
      ) - desktopTableOverscanRows,
    );
    const visibleRowCount =
      Math.ceil(tableViewportHeight / desktopTableRowHeight) +
      desktopTableOverscanRows * 2;
    const startIndex = Math.min(rowCount, firstVisibleRow);
    const endIndex = Math.min(rowCount, startIndex + visibleRowCount);

    return {
      indexes: Array.from(
        { length: Math.max(0, endIndex - startIndex) },
        (_, index) => startIndex + index,
      ),
      startIndex,
      endIndex,
      totalHeight: rowCount * desktopTableRowHeight,
    };
  }, [displayedRowCount, tableScrollTop, tableViewportHeight]);
  const mobilePreviewRows = useMemo(() => {
    if (datasetRowCount !== null) {
      return Array.from(
        { length: Math.min(mobilePreviewRowLimit, datasetRowCount) },
        (_, index) => datasetRowsByIndex[index],
      ).filter(Boolean);
    }

    return [];
  }, [datasetRowCount, datasetRowsByIndex]);
  const loadDatasetRows = useCallback(
    async (startIndex: number, requestedLimit = duckdbPreviewPageSize) => {
      const pageOffset =
        Math.floor(Math.max(0, startIndex) / duckdbPreviewPageSize) *
        duckdbPreviewPageSize;
      const pageKey = pageOffset;

      if (pendingDatasetPagesRef.current.has(pageKey)) {
        return;
      }

      if (datasetRowsByIndex[pageOffset]) {
        return;
      }

      const columnsToFetch = availableTableColumns
        .map((column) => column.key)
        .filter(
          (column) =>
            datasetColumnNames.length === 0 || datasetColumnNames.includes(column),
        );

      if (columnsToFetch.length === 0) {
        return;
      }

      pendingDatasetPagesRef.current.add(pageKey);
      setDatasetPreviewError(null);

      try {
        const result = await queryDataset({
          columns: columnsToFetch,
          search: debouncedSearchQuery,
          categoryFilters: Object.fromEntries(
            Object.entries(categoryFilters).filter(([, values]) => values?.length),
          ) as Record<string, string[]>,
          numberRanges: Object.fromEntries(
            Object.entries(numberRanges).filter(
              (entry): entry is [string, NumberRange] => Boolean(entry[1]),
            ),
          ),
          dateFilters: Object.fromEntries(
            Object.entries(dateFilters).filter(
              (entry): entry is [string, DateFilterValue] => Boolean(entry[1]),
            ),
          ),
          sort: sortState,
          limit: Math.max(requestedLimit, duckdbPreviewPageSize),
          offset: pageOffset,
        });

        setDatasetFilteredRowCount(result.totalRows);

        setDatasetRowsByIndex((current) => {
          const nextRows = { ...current };

          result.rows.forEach((row, index) => {
            nextRows[result.offset + index] = Object.fromEntries(
              availableTableColumns.map((column) => [
                column.key,
                normalizePreviewValue(row[column.key]),
              ]),
            );
          });

          return nextRows;
        });
      } catch (error) {
        setDatasetPreviewError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les lignes du fichier.",
        );
      } finally {
        pendingDatasetPagesRef.current.delete(pageKey);
        setIsDatasetPreviewLoading(false);
      }
    },
    [
      availableTableColumns,
      categoryFilters,
      datasetColumnNames,
      datasetRowsByIndex,
      dateFilters,
      debouncedSearchQuery,
      numberRanges,
      sortState,
    ],
  );

  useEffect(() => {
    const viewport = tableViewportRef.current;

    if (!viewport) {
      return;
    }

    function updateViewportHeight() {
      setTableViewportHeight(viewport?.clientHeight ?? 640);
    }

    updateViewportHeight();

    const resizeObserver = new ResizeObserver(updateViewportHeight);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initializeDatasetPreview() {
      try {
        await configureParquetSource(activeParquetUrl);
        const schema = await inspectSchema();

        if (isCancelled) {
          return;
        }

        const rowCount =
          typeof schema.rows === "number" ? schema.rows : Number(schema.rows);
        const schemaColumnNames = schema.columns.map((column) => column.name);

        setDatasetSchemaColumns(schema.columns);
        setDatasetColumnNames(schemaColumnNames);
        setVisibleColumnKeys(schemaColumnNames);
        setColumnWidths(
          Object.fromEntries(
            schema.columns.map((column) => {
              const tableColumn = tableColumnFromSchema(column);
              return [column.name, tableColumn.widthPx];
            }),
          ),
        );
        setDatasetRowCount(Number.isFinite(rowCount) ? rowCount : 0);
        setDatasetFilteredRowCount(Number.isFinite(rowCount) ? rowCount : 0);
        setDatasetPreviewError(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setDatasetPreviewError(
          error instanceof Error
            ? error.message
            : "Impossible d'inspecter le fichier Parquet.",
        );
        setDatasetRowCount(null);
        setDatasetFilteredRowCount(null);
        setIsDatasetPreviewLoading(false);
      }
    }

    void initializeDatasetPreview();

    return () => {
      isCancelled = true;
    };
  }, [activeParquetUrl, parquetReloadVersion]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!activeFilter) return;
    const column = availableTableColumns.find(
      (item) => item.key === activeFilter,
    );
    if (!column || column.filter !== "category") return;

    let isCancelled = false;
    const timeout = window.setTimeout(() => {
      void getColumnValueOptions(
        column.key,
        filterSearches[column.key] ?? "",
      ).then((options) => {
        if (!isCancelled) {
          setCategoryOptions((current) => ({
            ...current,
            [column.key]: options,
          }));
        }
      });
    }, 200);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeout);
    };
  }, [activeFilter, availableTableColumns, filterSearches]);

  useEffect(() => {
    if (datasetRowCount === null) return;

    const timeout = window.setTimeout(() => {
      pendingDatasetPagesRef.current.clear();
      setDatasetRowsByIndex({});
      setDatasetFilteredRowCount(null);
      setIsDatasetPreviewLoading(true);
      setTableScrollTop(0);
      tableViewportRef.current?.scrollTo({ top: 0 });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    categoryFilters,
    dateFilters,
    debouncedSearchQuery,
    numberRanges,
    sortState,
    datasetRowCount,
  ]);

  useEffect(() => {
    if (datasetColumnNames.length === 0 || datasetRowCount === null) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadDatasetRows(0, duckdbPreviewPageSize);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [datasetColumnNames.length, datasetRowCount, loadDatasetRows]);

  useEffect(() => {
    if (datasetColumnNames.length === 0 || datasetRowCount === null) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadDatasetRows(
        virtualizedRows.startIndex,
        Math.max(
          duckdbPreviewPageSize,
          virtualizedRows.endIndex - virtualizedRows.startIndex,
        ),
      );
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [
    datasetColumnNames.length,
    datasetRowCount,
    loadDatasetRows,
    virtualizedRows.endIndex,
    virtualizedRows.startIndex,
  ]);

  function updateSort(key: ColumnKey, direction: SortDirection) {
    setSortState({ key, direction });
  }

  function toggleVisibleColumn(key: ColumnKey) {
    setVisibleColumnKeys((current) =>
      current.includes(key)
        ? current.filter((columnKey) => columnKey !== key)
        : [...current, key],
    );
    if (activeFilter === key) {
      setActiveFilter(null);
    }
    if (activeCell?.key === key) {
      setActiveCell(null);
    }
  }

  function selectResource(resource: Resource) {
    setActiveResourceId(resource.id);
    setActiveFilter(null);
    setActiveCell(null);
    setIsColumnSelectorOpen(false);
    setIsMobileFiltersOpen(false);
    setIsMobileResourceMenuOpen(false);
    setIsDownloadMenuOpen(false);
    if (resource.sourceUrl) {
      setParquetFileUrl(resource.sourceUrl);
      loadParquetFileUrl(resource.sourceUrl, false);
    }
  }

  function openCell(cell: NonNullable<ActiveCell>) {
    setActiveCell((current) => (current?.id === cell.id ? null : cell));
    setActiveFilter(null);
    setIsColumnSelectorOpen(false);
    setIsMobileFiltersOpen(false);
    setIsMobileResourceMenuOpen(false);
  }

  async function copyCellValue(value: string) {
    try {
      await navigator.clipboard?.writeText(value);
    } catch {
      // Clipboard access can be unavailable in some local browser contexts.
    }
    setActiveCell(null);
  }

  function filterByCellValue(cell: NonNullable<ActiveCell>) {
    if (cell.type === "number") {
      setNumberRanges((current) => ({
        ...current,
        [cell.key]: { min: cell.value, max: cell.value },
      }));
    } else if (cell.type === "date") {
      setDateFilters((current) => ({
        ...current,
        [cell.key]: { ...emptyDateFilter, value: cell.value },
      }));
    } else {
      setCategoryFilters((current) => ({
        ...current,
        [cell.key]: [cell.value],
      }));
    }

    setActiveCell(null);
  }

  function toggleCategoryFilter(key: ColumnKey, value: string) {
    setCategoryFilters((current) => {
      const values = current[key] ?? [];
      const nextValues = values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];

      return {
        ...current,
        [key]: nextValues,
      };
    });
  }

  function updateFilterSearch(key: ColumnKey, value: string) {
    setFilterSearches((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearCategoryFilter(key: ColumnKey) {
    setCategoryFilters((current) => ({
      ...current,
      [key]: [],
    }));
  }

  function updateNumberRange(key: ColumnKey, range: NumberRange) {
    setNumberRanges((current) => ({
      ...current,
      [key]: range,
    }));
  }

  function clearNumberRange(key: ColumnKey) {
    setNumberRanges((current) => ({
      ...current,
      [key]: { min: "", max: "" },
    }));
  }

  function updateDateFilter(key: ColumnKey, value: DateFilterValue) {
    setDateFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearDateFilter(key: ColumnKey) {
    setDateFilters((current) => ({
      ...current,
      [key]: emptyDateFilter,
    }));
  }

  function clearAllFilters() {
    setSearchQuery("");
    setSortState(null);
    setCategoryFilters({});
    setFilterSearches({});
    setNumberRanges({});
    setDateFilters({});
    setActiveFilter(null);
    setActiveCell(null);
    setIsColumnSelectorOpen(false);
    setIsMobileFiltersOpen(false);
    setIsMobileResourceMenuOpen(false);
  }

  function applyAssistantFilters(filters: AssistantFilterPayload[]) {
    setCategoryFilters((current) => {
      const nextFilters = { ...current };

      filters.forEach((filter) => {
        if (filter.type === "number") {
          return;
        }

        nextFilters[filter.key] = [filter.value];
      });

      return nextFilters;
    });
    setActiveFilter(null);
    setActiveCell(null);
    setIsMobileFiltersOpen(false);
    setIsColumnSelectorOpen(false);
    setIsFilterFeedbackVisible(true);
    window.setTimeout(() => setIsFilterFeedbackVisible(false), 1200);
  }

  function applyAssistantSort(sort: AssistantSortPayload) {
    setSortState({ key: sort.key, direction: sort.direction });
    setActiveFilter(null);
    setActiveCell(null);
    setIsMobileFiltersOpen(false);
    setIsColumnSelectorOpen(false);
    setIsFilterFeedbackVisible(true);
    window.setTimeout(() => setIsFilterFeedbackVisible(false), 1200);
  }

  function toggleChatSidebar() {
    setIsChatSidebarOpen((current) => {
      const nextIsOpen = !current;

      if (nextIsOpen) {
        setIsSidebarCollapsed(true);
      }

      return nextIsOpen;
    });
    setIsDownloadMenuOpen(false);
    setIsColumnSelectorOpen(false);
    setActiveFilter(null);
    setActiveCell(null);
  }

  return (
    <main
      className={`relative h-dvh overflow-hidden text-[#161616] ${
        isExplorerMinimized
          ? "flex items-center justify-center bg-[#f6f6f6] p-6"
          : "bg-[#FFFFFF] p-0"
      }`}
    >
      {isExplorerMinimized ? (
        <Link
          href="/"
          className="absolute left-4 top-4 z-50 inline-flex h-8 items-center gap-2 px-2 text-[13px] font-normal leading-6 text-[#161616] underline-offset-4 hover:underline"
        >
          <RiArrowLeftLine aria-hidden className="h-4 w-4" />
          Retour
        </Link>
      ) : null}
      <div
        className={`explorer-shell flex flex-col bg-[#FFFFFF] transition-[height,width,box-shadow] duration-200 ${
          isExplorerMinimized
            ? "h-[78dvh] w-[82vw] overflow-hidden rounded-lg border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
            : "h-full w-full"
        }`}
      >
        {!isExplorerMinimized ? (
          <DatasetContextHeader
            title={activeResource.name}
            updatedAt={activeResource.updatedAt}
            actions={
              <>
                <div className="relative">
                  {isDownloadMenuOpen ? (
                    <button
                      type="button"
                      aria-label="Fermer le menu de téléchargement"
                      className="fixed inset-0 z-20 cursor-default bg-transparent"
                      onClick={() => setIsDownloadMenuOpen(false)}
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-expanded={isDownloadMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      setIsDownloadMenuOpen((isOpen) => !isOpen);
                      setActiveFilter(null);
                      setActiveCell(null);
                      setIsColumnSelectorOpen(false);
                    }}
                    className="relative z-30 flex h-8 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-[#FFFFFF]"
                  >
                    <Icon
                      path={icons.download}
                      className="h-4 w-4 text-[#FFFFFF]"
                    />
                    Télécharger
                  </button>
                  {isDownloadMenuOpen ? (
                    <DownloadMenu onClose={() => setIsDownloadMenuOpen(false)} />
                  ) : null}
                </div>
                  <button
                  type="button"
                  aria-expanded={isChatSidebarOpen}
                  onClick={toggleChatSidebar}
                  className={`flex h-8 items-center gap-2 border px-3 text-[13px] font-medium ${
                    isChatSidebarOpen
                      ? "border-[#000091] bg-[#e8edff] text-[#000091]"
                      : "border-[#E5E5E5] bg-[#FFFFFF] text-[#161616] hover:bg-[#f6f6f6]"
                  }`}
                >
                  <Icon
                    path={icons.sparkle}
                    className={`h-4 w-4 ${
                      isChatSidebarOpen ? "text-[#000091]" : "text-[#3a3a3a]"
                    }`}
                  />
                  Poser une question
                </button>
                <button
                  type="button"
                  aria-label="Réduire l’explorateur"
                  onClick={() => {
                    setIsExplorerMinimized(true);
                    setIsDownloadMenuOpen(false);
                    setIsColumnSelectorOpen(false);
                    setActiveFilter(null);
                    setActiveCell(null);
                  }}
                  className="flex h-8 w-8 items-center justify-center border border-[#E5E5E5] bg-[#FFFFFF] text-[#161616] hover:bg-[#f6f6f6]"
                >
                  <Icon
                    path={icons.fullscreenExit}
                    className="h-4 w-4 text-[#3a3a3a]"
                  />
                </button>
              </>
            }
          />
        ) : null}
        <div className="flex min-h-0 flex-1">
          <aside
            className="resource-sidebar desktop-resource-sidebar relative shrink-0 flex-col rounded border-r border-[#E5E5E5] bg-[#FFFFFF] transition-[width] duration-200"
            style={{
              width: isSidebarCollapsed
                ? collapsedResourceSidebarWidth
                : resourceSidebarWidth,
            }}
          >
            <div className="flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-3">
              {isSidebarCollapsed ? null : (
                <span className="resource-sidebar-title text-[13px] font-medium text-[#161616]">
                  Ressources
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((current) => !current)}
                aria-label="Afficher ou masquer la navigation des ressources"
                title="Afficher ou masquer la navigation des ressources"
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-[#eeeeee]"
              >
                <Icon
                  path={
                    isSidebarCollapsed
                      ? icons.sidebarUnfold
                      : icons.sidebarFold
                  }
                />
              </button>
            </div>

            <div
              className={`resource-sidebar-content flex flex-col gap-3 p-2 ${
                isSidebarCollapsed ? "hidden" : ""
              }`}
            >
              <section className="space-y-0.5">
                <p className="px-1 pb-2 text-[12px] font-medium leading-4 text-[#3a3a3a]">
                  Jeux de données d’exemple
                </p>
                {mainResources.map((resource) => (
                  <ResourceItem
                    key={resource.id}
                    resource={resource}
                    active={resource.id === activeResource.id}
                    onSelect={() => selectResource(resource)}
                    onShowTooltip={showResourceTooltip}
                    onHideTooltip={() => setResourceTooltip(null)}
                  />
                ))}
              </section>

              <section className="space-y-2 border-t border-[#E5E5E5] pt-3">
                <p className="px-1 text-[12px] font-medium leading-4 text-[#3a3a3a]">
                  Ou charger un jeu de données Parquet
                </p>
                <div className="flex gap-1">
                  <label className="flex h-8 min-w-0 flex-1 items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2">
                    <Icon path={icons.file} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                    <input
                      type="url"
                      list="default-parquet-sources"
                      value={parquetFileUrl}
                      onChange={(event) => setParquetFileUrl(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") submitParquetFileUrl();
                      }}
                      aria-label="Lien vers un fichier Parquet"
                      placeholder="Coller un lien Parquet S3"
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={submitParquetFileUrl}
                    disabled={isDatasetPreviewLoading}
                    className="h-8 shrink-0 rounded bg-[#000091] px-2 text-[12px] font-medium text-white disabled:cursor-wait disabled:opacity-50"
                  >
                    Charger
                  </button>
                </div>
              </section>

              {documentationResources.length > 0 ? (
                <section className="space-y-0.5">
                  <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                    {documentationResources.length} Documentation
                  </p>
                  {documentationResources.map((resource) => (
                    <ResourceItem
                      key={resource.id}
                      resource={resource}
                      active={resource.id === activeResource.id}
                      onSelect={() => selectResource(resource)}
                      onShowTooltip={showResourceTooltip}
                      onHideTooltip={() => setResourceTooltip(null)}
                    />
                  ))}
                </section>
              ) : null}
            </div>
            {isSidebarCollapsed ? null : (
              <button
                type="button"
                aria-label="Redimensionner la navigation des ressources"
                title="Glisser pour redimensionner, double-cliquer pour ajuster ou réinitialiser"
                onMouseDown={startResourceSidebarResize}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleResourceSidebarAutoFit();
                }}
                className="absolute -right-1 top-0 z-20 h-full w-2 cursor-col-resize touch-none rounded-r transition-colors hover:bg-[#000091]/10"
              >
                <span className="sr-only">Redimensionner</span>
              </button>
            )}
          </aside>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FFFFFF]">
            <header className="flex h-14 items-center justify-between gap-2 border-b border-[#E5E5E5] bg-[#f6f6f6] px-3">
              <div className="flex min-w-0 flex-1 items-center gap-1 text-[13px]">
                <div className="mobile-explorer-only relative min-w-0 flex-1 items-center">
                  {isMobileResourceMenuOpen ? (
                    <button
                      type="button"
                      aria-label="Fermer le menu des ressources"
                      className="fixed inset-0 z-20 cursor-default bg-transparent"
                      onClick={() => setIsMobileResourceMenuOpen(false)}
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-expanded={isMobileResourceMenuOpen}
                    aria-haspopup="menu"
                    onClick={() => {
                      setIsMobileResourceMenuOpen((current) => !current);
                      setIsDownloadMenuOpen(false);
                      setIsColumnSelectorOpen(false);
                      setActiveFilter(null);
                      setActiveCell(null);
                    }}
                    className="relative z-30 flex h-9 w-full min-w-0 items-center gap-1 text-left"
                  >
                    <Icon
                      path={icons[activeResource.type]}
                      className="h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-[#161616]">
                      {activeResource.name}
                    </span>
                    <span className="shrink-0 text-[#3a3a3a]">·</span>
                    <span className="shrink-0 text-[#3a3a3a]">
                      {activeResource.size}
                    </span>
                    <span className="shrink-0 text-[#3a3a3a]">·</span>
                    <FormatTag>{activeResource.format}</FormatTag>
                    <Icon
                      path={icons.arrowDownS}
                      className={`h-4 w-4 shrink-0 text-[#3a3a3a] ${
                        isMobileResourceMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isMobileResourceMenuOpen ? (
                    <div className="absolute left-0 right-0 top-11 z-30 max-h-[70dvh] overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
                      <div className="flex h-8 items-center gap-1 border-b border-[#E5E5E5] bg-[#f6f6f6] px-2">
                        <p className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase leading-[1.4] text-[#161616]">
                          Ressources
                        </p>
                        <button
                          type="button"
                          aria-label="Fermer le menu des ressources"
                          onClick={() => setIsMobileResourceMenuOpen(false)}
                          className="flex h-6 w-6 items-center justify-center rounded text-[#3a3a3a] hover:bg-[#eeeeee]"
                        >
                          <Icon path={icons.close} className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="max-h-[calc(70dvh-2rem)] overflow-auto p-2">
                        <section className="space-y-0.5">
                          <p className="px-1 pb-2 text-[12px] font-medium leading-4 text-[#3a3a3a]">
                            Jeux de données d’exemple
                          </p>
                          {mainResources.map((resource) => (
                            <ResourceItem
                              key={resource.id}
                              resource={resource}
                              active={resource.id === activeResource.id}
                              onSelect={() => {
                                selectResource(resource);
                                setIsMobileResourceMenuOpen(false);
                              }}
                              onShowTooltip={showResourceTooltip}
                              onHideTooltip={() => setResourceTooltip(null)}
                            />
                          ))}
                        </section>
                        <section className="mt-3 space-y-2 border-t border-[#E5E5E5] pt-3">
                          <p className="px-1 text-[12px] font-medium leading-4 text-[#3a3a3a]">
                            Ou charger un jeu de données Parquet
                          </p>
                          <div className="flex gap-1">
                          <label className="flex h-8 min-w-0 flex-1 items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2">
                            <Icon path={icons.file} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                          <input
                              type="url"
                              list="default-parquet-sources"
                              value={parquetFileUrl}
                              onChange={(event) => setParquetFileUrl(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") submitParquetFileUrl();
                              }}
                              aria-label="Lien vers un fichier Parquet"
                              placeholder="Coller un lien Parquet S3"
                              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={submitParquetFileUrl}
                            disabled={isDatasetPreviewLoading}
                            className="h-8 shrink-0 rounded bg-[#000091] px-2 text-[12px] font-medium text-white disabled:cursor-wait disabled:opacity-50"
                          >
                            Charger
                          </button>
                          </div>
                        </section>
                        {documentationResources.length > 0 ? (
                          <section className="mt-3 space-y-0.5">
                            <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                              {documentationResources.length} Documentation
                            </p>
                            {documentationResources.map((resource) => (
                              <ResourceItem
                                key={resource.id}
                                resource={resource}
                                active={resource.id === activeResource.id}
                                onSelect={() => {
                                  selectResource(resource);
                                  setIsMobileResourceMenuOpen(false);
                                }}
                                onShowTooltip={showResourceTooltip}
                                onHideTooltip={() => setResourceTooltip(null)}
                              />
                            ))}
                          </section>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
                <Icon
                  path={icons[activeResource.type]}
                  className="desktop-explorer-only h-4 w-4 shrink-0"
                />
                <span className="desktop-explorer-only min-w-0 truncate font-medium">
                  {activeResource.name}
                </span>
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">·</span>
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">
                  Mis à jour le {activeResource.updatedAt}
                </span>
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">·</span>
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">
                  {activeResource.size}
                </span>
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">·</span>
                <span className="desktop-explorer-only shrink-0">
                  <FormatTag>{activeResource.format}</FormatTag>
                </span>
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">·</span>
                <Icon path={icons.download} className="desktop-explorer-only h-3 w-3 shrink-0 text-[#3a3a3a]" />
                <span className="desktop-explorer-only shrink-0 text-[#3a3a3a]">
                  {activeResource.downloads}
                </span>
              </div>

              {isExplorerMinimized ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {isDownloadMenuOpen ? (
                      <button
                        type="button"
                        aria-label="Fermer le menu de téléchargement"
                        className="fixed inset-0 z-20 cursor-default bg-transparent"
                        onClick={() => setIsDownloadMenuOpen(false)}
                      />
                    ) : null}
                    <button
                      type="button"
                      aria-expanded={isDownloadMenuOpen}
                      aria-haspopup="menu"
                      onClick={() => {
                        setIsDownloadMenuOpen((isOpen) => !isOpen);
                        setActiveFilter(null);
                        setActiveCell(null);
                        setIsColumnSelectorOpen(false);
                      }}
                      className="relative z-30 flex h-8 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-[#FFFFFF]"
                    >
                      <Icon
                        path={icons.download}
                        className="h-4 w-4 text-[#FFFFFF]"
                      />
                      Télécharger
                    </button>
                  {isDownloadMenuOpen ? (
                      <DownloadMenu onClose={() => setIsDownloadMenuOpen(false)} />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-expanded={isChatSidebarOpen}
                    onClick={toggleChatSidebar}
                    className={`flex h-8 items-center gap-2 border px-3 text-[13px] font-medium ${
                      isChatSidebarOpen
                        ? "border-[#000091] bg-[#e8edff] text-[#000091]"
                        : "border-[#E5E5E5] bg-[#FFFFFF] text-[#161616] hover:bg-[#f6f6f6]"
                    }`}
                  >
                    <Icon
                      path={icons.sparkle}
                      className={`h-4 w-4 ${
                        isChatSidebarOpen
                          ? "text-[#000091]"
                          : "text-[#3a3a3a]"
                      }`}
                    />
                    Question
                  </button>
                  <button
                    type="button"
                    aria-label="Afficher l’explorateur en plein écran"
                    onClick={() => {
                      setIsExplorerMinimized(false);
                      setIsDownloadMenuOpen(false);
                      setIsColumnSelectorOpen(false);
                      setActiveFilter(null);
                      setActiveCell(null);
                    }}
                    className="flex h-8 w-8 items-center justify-center border border-[#E5E5E5] bg-[#FFFFFF] text-[#161616] hover:bg-[#f6f6f6]"
                  >
                    <Icon
                      path={icons.fullscreen}
                      className="h-4 w-4 text-[#3a3a3a]"
                    />
                  </button>
                </div>
              ) : null}
            </header>

            <>
            <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-[#E5E5E5] bg-[#FFFFFF] px-2 py-2 lg:flex-nowrap lg:py-0">
              <div className="flex shrink-0 items-center gap-2">
                <label className="flex h-8 w-[220px] min-w-0 items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2">
                  <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Rechercher une valeur"
                    placeholder="Rechercher dans les données"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileFiltersOpen(true);
                    setActiveFilter(null);
                    setActiveCell(null);
                    setIsColumnSelectorOpen(false);
                  }}
                  className="mobile-explorer-only h-8 items-center gap-1 rounded bg-[#FFFFFF] px-3 text-[13px] font-medium text-[#161616] hover:bg-[#f6f6f6]"
                >
                  <Icon path={icons.filter} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  Filtres
                </button>
                <span className="hidden text-[13px] text-[#3a3a3a] lg:inline">
                  Recherche et filtres exécutés localement
                </span>
              </div>
              <div className="ml-auto flex min-w-0 shrink-0 items-center gap-3 text-[12px] text-[#3a3a3a] lg:gap-4 lg:text-[13px]">
                <span className="relative flex shrink-0 items-center gap-1">
                  {isColumnSelectorOpen ? (
                    <button
                      type="button"
                      aria-label="Fermer la sélection des colonnes"
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setIsColumnSelectorOpen(false)}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setIsColumnSelectorOpen((current) => !current);
                      setActiveFilter(null);
                      setActiveCell(null);
                      setIsMobileFiltersOpen(false);
                    }}
                    className="flex h-6 cursor-pointer items-center gap-1 rounded px-1 hover:bg-[#eeeeee]"
                  >
                    <Icon path={icons.columns} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                    <span className="hidden whitespace-nowrap sm:inline">
                      Colonnes {isDatasetPreviewLoading ? "—" : `${visibleColumns.length} sur ${availableTableColumns.length}`}
                    </span>
                    <span className="whitespace-nowrap sm:hidden">
                      {isDatasetPreviewLoading ? "—" : `${visibleColumns.length}/${availableTableColumns.length}`}
                    </span>
                    <Icon path={icons.arrowDownS} className="h-4 w-4 text-[#3a3a3a]" />
                  </button>
                  {isColumnSelectorOpen ? (
                    <ColumnSelector
                      columns={availableTableColumns}
                      selectedColumnKeys={visibleColumnKeys}
                      onToggleColumn={toggleVisibleColumn}
                      onSelectAll={() =>
                        setVisibleColumnKeys(
                          availableTableColumns.map((column) => column.key),
                        )
                      }
                      onClearAll={() => setVisibleColumnKeys([])}
                      onClose={() => setIsColumnSelectorOpen(false)}
                    />
                  ) : null}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.rows} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  <span className="hidden whitespace-nowrap lg:inline">
                    {isDatasetPreviewLoading
                      ? "Lignes —"
                      : hasActiveDatasetFilters
                        ? `Lignes ${displayedRowCount.toLocaleString("fr-FR")} sur ${(datasetRowCount ?? 0).toLocaleString("fr-FR")}`
                        : `${displayedRowCount.toLocaleString("fr-FR")} lignes`}
                  </span>
                  <span className="whitespace-nowrap lg:hidden">
                    {isDatasetPreviewLoading
                      ? "—"
                      : displayedRowCount.toLocaleString("fr-FR")}
                  </span>
                </span>
              </div>
            </div>

            <div
              className={`transition-[box-shadow] duration-300 ${
                isFilterFeedbackVisible
                  ? "shadow-[inset_0_0_0_2px_#000091]"
                  : "shadow-none"
              }`}
            >
              <ActiveFiltersBar
                searchQuery={searchQuery}
                sortState={sortState}
                categoryFilters={categoryFilters}
                numberRanges={numberRanges}
                dateFilters={dateFilters}
                onOpenFilter={(key) => {
                  setActiveCell(null);
                  setActiveFilter(key);
                  setIsMobileFiltersOpen(true);
                }}
                onClearSearch={() => setSearchQuery("")}
                onClearCategory={clearCategoryFilter}
                onClearNumber={clearNumberRange}
                onClearDate={clearDateFilter}
                onClearSort={() => setSortState(null)}
                onClearAll={clearAllFilters}
              />
            </div>

            <div className="relative min-h-0 flex-1">
              {activeFilter || activeCell ? (
                <FilterDismissLayer
                  onClose={() => {
                    setActiveFilter(null);
                    setActiveCell(null);
                  }}
                />
              ) : null}
              {isMobileFiltersOpen ? (
                <MobileFiltersPanel
                  isOpen={isMobileFiltersOpen}
                  visibleColumns={visibleColumns}
                  sortState={sortState}
                  categoryFilters={categoryFilters}
                  categoryOptions={categoryOptions}
                  filterSearches={filterSearches}
                  numberRanges={numberRanges}
                  dateFilters={dateFilters}
                  onToggleCategory={toggleCategoryFilter}
                  onSearchFilter={updateFilterSearch}
                  onChangeRange={updateNumberRange}
                  onSort={updateSort}
                  onClearRange={clearNumberRange}
                  onChangeDate={updateDateFilter}
                  onClearDate={clearDateFilter}
                  onClearAll={clearAllFilters}
                  onOpenColumn={setActiveFilter}
                  onClose={() => {
                    setIsMobileFiltersOpen(false);
                    setActiveFilter(null);
                  }}
                />
              ) : null}
              <FilterMenus
                activeFilter={activeFilter}
                visibleColumns={visibleColumns}
                sortState={sortState}
                categoryFilters={categoryFilters}
                categoryOptions={categoryOptions}
                filterSearches={filterSearches}
                numberRanges={numberRanges}
                dateFilters={dateFilters}
                onToggleCategory={toggleCategoryFilter}
                onSearchFilter={updateFilterSearch}
                onChangeRange={updateNumberRange}
                onSort={updateSort}
                onClearRange={clearNumberRange}
                onChangeDate={updateDateFilter}
                onClearDate={clearDateFilter}
                onClose={() => {
                  setActiveFilter(null);
                  setIsMobileFiltersOpen(false);
                }}
              />

              <div
                ref={tableViewportRef}
                className="relative h-full overflow-auto"
                onScroll={(event: UIEvent<HTMLDivElement>) => {
                  const isScrolled = event.currentTarget.scrollTop > 0;

                  setTableScrollTop(event.currentTarget.scrollTop);
                  setHasTableScrolled((current) =>
                    current === isScrolled ? current : isScrolled,
                  );
                }}
              >
                {isDatasetPreviewLoading ? (
                  <div className="absolute inset-0 z-20 min-h-[360px] bg-[#FFFFFF] p-3" aria-label="Chargement de l’aperçu">
                    <div className="animate-pulse space-y-2">
                      <div className="grid h-10 grid-cols-5 gap-px overflow-hidden rounded border border-[#E5E5E5] bg-[#E5E5E5]">
                        {Array.from({ length: 5 }, (_, index) => (
                          <div key={`skeleton-header-${index}`} className="bg-[#f6f6f6] p-3">
                            <div className="h-3 w-2/3 rounded bg-[#dddddd]" />
                          </div>
                        ))}
                      </div>
                      <div className="overflow-hidden rounded border border-[#E5E5E5]">
                        {Array.from({ length: 9 }, (_, rowIndex) => (
                          <div
                            key={`skeleton-row-${rowIndex}`}
                            className="grid h-8 grid-cols-5 gap-px border-b border-[#eeeeee] last:border-b-0"
                          >
                            {Array.from({ length: 5 }, (_, cellIndex) => (
                              <div key={`skeleton-cell-${rowIndex}-${cellIndex}`} className="px-3 py-2">
                                <div
                                  className="h-2.5 rounded bg-[#eeeeee]"
                                  style={{ width: `${45 + ((rowIndex + cellIndex) % 4) * 12}%` }}
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-center text-[12px] leading-5 text-[#666666]">
                      Chargement du fichier Parquet…
                    </p>
                  </div>
                ) : null}
                {datasetPreviewError && !isDatasetPreviewLoading ? (
                  <div className="absolute inset-0 z-20 flex min-h-[360px] flex-col items-center justify-center gap-2 bg-[#f6f6f6] p-6 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff4f4]">
                      <Icon path={icons.missing} className="h-5 w-5 text-[#ce0500]" />
                    </span>
                    <p className="text-[14px] font-medium leading-5 text-[#161616]">
                      Impossible de charger ce fichier Parquet
                    </p>
                    <p className="max-w-[520px] text-[12px] leading-5 text-[#666666]">
                      {datasetPreviewError}
                    </p>
                  </div>
                ) : null}
                {visibleColumns.length > 0 && displayedRowCount > 0 ? (
                  <div className="mobile-data-cards space-y-2 p-2">
                    {displayedRowCount > mobilePreviewRows.length ? (
                      <p className="rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2 py-1 text-[12px] leading-5 text-[#666666]">
                        Aperçu mobile limité aux {mobilePreviewRowLimit} premières lignes.
                      </p>
                    ) : null}
                    {mobilePreviewRows.map((row) => (
                      <MobileDataCard
                        key={row.id}
                        row={row}
                        columns={visibleColumns}
                        activeCell={activeCell}
                        onOpenCell={openCell}
                        onCopyCell={copyCellValue}
                        onFilterCell={filterByCellValue}
                      />
                    ))}
                  </div>
                ) : null}

                <div
                  className={`desktop-data-table sticky top-0 z-10 h-12 w-max min-w-full border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-150 ${
                    hasTableScrolled
                      ? "border-[#c2d1ff] bg-[#FFFFFF]/72 shadow-[0_8px_16px_rgba(0,0,0,0.10)] backdrop-blur-md"
                      : "border-[#E5E5E5] bg-[#f6f6f6] shadow-none backdrop-blur-0"
                  }`}
                >
                  {visibleColumns.map((column) => (
                    <HeaderCell
                      key={column.key}
                      column={column}
                      width={columnWidths[column.key] ?? column.widthPx}
                      isOpen={activeFilter === column.key}
                      sortDirection={
                        sortState?.key === column.key
                          ? sortState.direction
                          : undefined
                      }
                      onOpen={() => {
                        setIsColumnSelectorOpen(false);
                        setActiveCell(null);
                        setActiveFilter((current) =>
                          current === column.key ? null : column.key,
                        );
                      }}
                      onResizeStart={(event) =>
                        startColumnResize(column.key, event)
                      }
                    />
                  ))}
                </div>

                {visibleColumns.length === 0 ? (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-[#f6f6f6] p-4 text-center text-[16px] leading-6">
                    <p className="text-[#3a3a3a]">
                      Aucune colonne n’est visible
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleColumnKeys(
                          availableTableColumns.map((column) => column.key),
                        )
                      }
                      className="cursor-pointer text-[#000091] underline decoration-solid underline-offset-2"
                    >
                      Cocher toutes les colonnes
                    </button>
                  </div>
                ) : displayedRowCount > 0 ? (
                  <div
                    className="desktop-data-table relative w-max min-w-full bg-[#FFFFFF]"
                    style={{
                      height: virtualizedRows.totalHeight,
                      minWidth: totalVisibleColumnWidth,
                    }}
                  >
                    <div
                      className="absolute left-0 top-0"
                      style={{
                        transform: `translateY(${
                          virtualizedRows.startIndex * desktopTableRowHeight
                        }px)`,
                      }}
                    >
                      {virtualizedRows.indexes.map((rowIndex) => {
                        const row = datasetRowsByIndex[rowIndex];

                        return (
                        <div
                          key={row?.id || `row-${rowIndex}`}
                          className="desktop-data-table h-7 w-max min-w-full bg-[#FFFFFF]"
                        >
                          {visibleColumns.map((column) => {
                            const cellId = `${row?.id || `row-${rowIndex}`}-${column.key}`;
                            const value = row ? getRowValue(row, column.key) : "Chargement...";

                            return (
                              <DataCell
                                key={column.key}
                                id={cellId}
                                value={value}
                                type={column.type}
                                width={columnWidths[column.key] ?? column.widthPx}
                                isActive={activeCell?.id === cellId}
                                onOpen={() => {
                                  if (!row) {
                                    return;
                                  }

                                  openCell({
                                    id: cellId,
                                    key: column.key,
                                    value,
                                    type: column.type,
                                  });
                                }}
                                onCopy={() => {
                                  if (row) {
                                    void copyCellValue(value);
                                  }
                                }}
                                onFilter={() => {
                                  if (!row) {
                                    return;
                                  }

                                  filterByCellValue({
                                    id: cellId,
                                    key: column.key,
                                    value,
                                    type: column.type,
                                  });
                                }}
                              />
                            );
                          })}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-[#f6f6f6] p-4 text-center text-[16px] leading-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeeeee]">
                      <Icon path={icons.table} className="h-5 w-5 text-[#666666]" />
                    </span>
                    <p className="font-medium text-[#3a3a3a]">
                      {datasetRowCount === 0
                        ? "Ce fichier Parquet ne contient aucune ligne"
                        : "Il n’y a pas de résultats pour ces critères"}
                    </p>
                    <p className="max-w-[420px] text-[12px] leading-5 text-[#666666]">
                      {datasetRowCount === 0
                        ? "Choisissez un autre jeu de données d’exemple ou chargez une autre URL Parquet."
                        : "Modifiez ou réinitialisez les filtres pour afficher des lignes."}
                    </p>
                    {datasetRowCount === 0 ? null : (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="cursor-pointer text-[13px] text-[#000091] underline decoration-solid underline-offset-2"
                      >
                        Réinitialiser les filtres
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
              </>
          </section>
          {isChatSidebarOpen ? (
            <ChatSidebar
              key={`${activeParquetUrl}-${parquetReloadVersion}`}
              activeResource={activeResource}
              sourceName={activeParquetName}
              onApplyFilter={applyAssistantFilters}
              onApplySort={applyAssistantSort}
              onClose={() => setIsChatSidebarOpen(false)}
            />
          ) : null}
        </div>
      </div>
      {resourceTooltip ? (
        <div
          className="pointer-events-none fixed z-[80] rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2 text-left shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]"
          style={{
            left: resourceTooltip.left,
            top: resourceTooltip.top,
            width: resourceTooltip.width,
          }}
          role="tooltip"
        >
          <p className="text-[13px] font-medium leading-5 text-[#161616]">
            {resourceTooltip.resource.name}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[12px] leading-4 text-[#3a3a3a]">
            <span>{resourceTooltip.resource.size}</span>
            <FormatTag>{resourceTooltip.resource.format}</FormatTag>
          </div>
          <dl className="mt-2 grid gap-1 border-t border-[#E5E5E5] pt-2 text-[12px] leading-4">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#666666]">Mise à jour</dt>
              <dd className="whitespace-nowrap font-medium text-[#161616]">
                {resourceTooltip.resource.updatedAt}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#666666]">Téléchargements</dt>
              <dd className="whitespace-nowrap font-medium text-[#161616]">
                {resourceTooltip.resource.downloads.toLocaleString("fr-FR")}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
      <datalist id="default-parquet-sources">
        {defaultParquetSources.map((source) => (
          <option key={source.url} value={source.url} label={source.label} />
        ))}
      </datalist>
    </main>
  );
}
