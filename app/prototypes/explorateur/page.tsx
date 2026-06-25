"use client";

import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import type {
  ComponentType,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  UIEvent,
} from "react";
import {
  RiArrowDownLine,
  RiArrowDropDownLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiBook2Line,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiCloseLine,
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
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiSparklingLine,
  RiTableLine,
  RiTerminalLine,
  RiText,
} from "@remixicon/react";

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
};

const resources: Resource[] = [
  {
    id: "ecoles",
    name: "Ecoles",
    size: "134 Mo",
    format: "CSV",
    updatedAt: "13 octobre 2022",
    downloads: 234,
    type: "table",
    tabs: ["Aperçu", "Carte", "Description", "Structure des données", "Métadonnées", "API"],
  },
  {
    id: "resultats",
    name: "Résultats",
    size: "87 Mo",
    format: "CSV",
    updatedAt: "6 février 2024",
    downloads: 128,
    type: "table",
    tabs: ["Aperçu", "Description", "Métadonnées"],
  },
  {
    id: "secteurs",
    name: "Secteurs",
    size: "245,8 Mo",
    format: "GEOJSON",
    updatedAt: "18 juin 2024",
    downloads: 412,
    type: "geodata",
    tabs: ["Carte", "Métadonnées"],
  },
  {
    id: "schema",
    name: "Schéma",
    size: "18 Ko",
    format: "JSON",
    updatedAt: "4 avril 2024",
    downloads: 76,
    type: "code",
    tabs: ["Aperçu", "Métadonnées"],
  },
  {
    id: "addition",
    name: "Addition",
    size: "42 Ko",
    format: "XML",
    updatedAt: "22 mai 2024",
    downloads: 51,
    type: "code",
    tabs: ["Aperçu", "Métadonnées"],
  },
  {
    id: "guides",
    name: "Guides",
    size: "3,2 Mo",
    format: "PDF",
    updatedAt: "9 janvier 2024",
    downloads: 305,
    type: "documentation",
    tabs: ["Aperçu", "Métadonnées"],
  },
];

const downloadGroups = [
  {
    title: "FORMAT ORIGINAL",
    items: [{ label: "Format CSV", size: "3,5 Mo" }],
    closable: true,
  },
  {
    title: "FORMATS GÉNÉRÉS AUTOMATIQUEMENT",
    items: [
      { label: "Format parquet", size: "3,5 Mo" },
      { label: "Format pmtiles", size: "9,5 Mo" },
      { label: "Format geojson", size: "245,8 Mo" },
    ],
    closable: false,
  },
];

const tableColumns = [
  {
    key: "id",
    label: "Identifiant",
    icon: "identifier",
    width: "w-[132px]",
    widthPx: 132,
    filter: "category",
    type: "identifier",
  },
  {
    key: "nom",
    label: "Nom",
    icon: "text",
    width: "w-[176px]",
    widthPx: 176,
    filter: "category",
    type: "text",
  },
  {
    key: "type",
    label: "Type",
    icon: "category",
    width: "w-[120px]",
    widthPx: 120,
    filter: "category",
    type: "category",
  },
  {
    key: "datePublication",
    label: "Publication",
    icon: "calendar",
    width: "w-[132px]",
    widthPx: 132,
    filter: "date",
    type: "date",
  },
  {
    key: "codeDepartement",
    label: "Département",
    icon: "referenceData",
    width: "w-[136px]",
    widthPx: 136,
    filter: "category",
    type: "referenceData",
  },
  {
    key: "lignes",
    label: "Lignes",
    icon: "number",
    width: "w-[120px]",
    widthPx: 120,
    filter: "number",
    type: "number",
  },
  {
    key: "scoreQualite",
    label: "Score",
    icon: "number",
    width: "w-[104px]",
    widthPx: 104,
    filter: "number",
    type: "number",
  },
  {
    key: "commune",
    label: "Commune",
    icon: "reference",
    width: "w-[148px]",
    widthPx: 148,
    filter: "category",
    type: "reference",
  },
  {
    key: "codeInsee",
    label: "Code INSEE",
    icon: "identifier",
    width: "w-[124px]",
    widthPx: 124,
    filter: "category",
    type: "identifier",
  },
  {
    key: "theme",
    label: "Thème",
    icon: "category",
    width: "w-[132px]",
    widthPx: 132,
    filter: "category",
    type: "category",
  },
  {
    key: "producteur",
    label: "Producteur",
    icon: "reference",
    width: "w-[168px]",
    widthPx: 168,
    filter: "category",
    type: "reference",
  },
  {
    key: "region",
    label: "Région",
    icon: "reference",
    width: "w-[148px]",
    widthPx: 148,
    filter: "category",
    type: "reference",
  },
  {
    key: "departement",
    label: "Département",
    icon: "reference",
    width: "w-[152px]",
    widthPx: 152,
    filter: "category",
    type: "reference",
  },
  {
    key: "statut",
    label: "Statut",
    icon: "category",
    width: "w-[124px]",
    widthPx: 124,
    filter: "category",
    type: "category",
  },
  {
    key: "frequence",
    label: "Fréquence",
    icon: "category",
    width: "w-[132px]",
    widthPx: 132,
    filter: "category",
    type: "category",
  },
  {
    key: "licence",
    label: "Licence",
    icon: "text",
    width: "w-[120px]",
    widthPx: 120,
    filter: "category",
    type: "text",
  },
  {
    key: "urlSource",
    label: "URL source",
    icon: "text",
    width: "w-[176px]",
    widthPx: 176,
    filter: "category",
    type: "text",
  },
  {
    key: "siren",
    label: "SIREN",
    icon: "identifier",
    width: "w-[120px]",
    widthPx: 120,
    filter: "category",
    type: "identifier",
  },
  {
    key: "millesime",
    label: "Millésime",
    icon: "calendar",
    width: "w-[120px]",
    widthPx: 120,
    filter: "date",
    type: "date",
  },
  {
    key: "couverture",
    label: "Couverture",
    icon: "category",
    width: "w-[132px]",
    widthPx: 132,
    filter: "category",
    type: "category",
  },
  {
    key: "derniereRevision",
    label: "Révision",
    icon: "calendar",
    width: "w-[132px]",
    widthPx: 132,
    filter: "date",
    type: "date",
  },
  {
    key: "population",
    label: "Population",
    icon: "number",
    width: "w-[128px]",
    widthPx: 128,
    filter: "number",
    type: "number",
  },
  {
    key: "superficie",
    label: "Superficie",
    icon: "number",
    width: "w-[124px]",
    widthPx: 124,
    filter: "number",
    type: "number",
  },
  {
    key: "densite",
    label: "Densité",
    icon: "number",
    width: "w-[112px]",
    widthPx: 112,
    filter: "number",
    type: "number",
  },
  {
    key: "latitude",
    label: "Latitude",
    icon: "number",
    width: "w-[112px]",
    widthPx: 112,
    filter: "number",
    type: "number",
  },
  {
    key: "longitude",
    label: "Longitude",
    icon: "number",
    width: "w-[116px]",
    widthPx: 116,
    filter: "number",
    type: "number",
  },
  {
    key: "formatOriginal",
    label: "Format original",
    icon: "category",
    width: "w-[148px]",
    widthPx: 148,
    filter: "category",
    type: "category",
  },
  {
    key: "schema",
    label: "Schéma",
    icon: "reference",
    width: "w-[156px]",
    widthPx: 156,
    filter: "category",
    type: "reference",
  },
  {
    key: "qualiteMetadonnees",
    label: "Métadonnées",
    icon: "number",
    width: "w-[132px]",
    widthPx: 132,
    filter: "number",
    type: "number",
  },
  {
    key: "dateCreation",
    label: "Création",
    icon: "calendar",
    width: "w-[132px]",
    widthPx: 132,
    filter: "date",
    type: "date",
  },
  {
    key: "contact",
    label: "Contact",
    icon: "text",
    width: "w-[180px]",
    widthPx: 180,
    filter: "category",
    type: "text",
  },
] as const;

type TableColumn = (typeof tableColumns)[number];
type ColumnKey = (typeof tableColumns)[number]["key"];
type ColumnType = (typeof tableColumns)[number]["type"];
type Row = Record<ColumnKey, string>;
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

function parseDateFilterValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const frenchDateMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (frenchDateMatch) {
    const [, day, month, year] = frenchDateMatch;
    const timestamp = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    ).getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
  }

  const timestamp = new Date(trimmedValue).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
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

const categories = ["Transport", "Education", "Santé", "Budget", "Culture"];
const themes = ["Services publics", "Référentiel", "Observatoire", "Statistiques"];
const communes = ["Paris", "Lyon", "Marseille", "Nantes", "Lille", "Rennes"];
const regions = [
  "Île-de-France",
  "Auvergne-Rhône-Alpes",
  "Provence-Alpes-Côte d’Azur",
  "Pays de la Loire",
  "Hauts-de-France",
  "Bretagne",
];
const departments = ["Paris", "Rhône", "Bouches-du-Rhône", "Loire-Atlantique", "Nord", "Ille-et-Vilaine"];
const departmentReferences = [
  { code: "75", label: "Paris" },
  { code: "69", label: "Rhône" },
  { code: "13", label: "Bouches-du-Rhône" },
  { code: "44", label: "Loire-Atlantique" },
  { code: "59", label: "Nord" },
  { code: "35", label: "Ille-et-Vilaine" },
  { code: "34", label: "Hérault" },
];
const statuses = ["Publié", "Archivé", "Brouillon", "À vérifier"];
const frequencies = ["Quotidienne", "Mensuelle", "Trimestrielle", "Annuelle"];
const licences = ["Licence Ouverte", "ODbL", "Etalab 2.0"];
const coverages = ["Nationale", "Régionale", "Départementale", "Communale"];
const originalFormats = ["CSV", "JSON", "GeoJSON", "Parquet", "XLSX"];
const schemas = [
  "etalab/schema-irve",
  "etalab/schema-adresse",
  "etalab/schema-lieux-culturels",
  "etalab/schema-decp",
];
const contacts = [
  "support@data.gouv.fr",
  "opendata@insee.fr",
  "contact@transport.gouv.fr",
  "donnees@collectivite.fr",
];
const producers = [
  "data.gouv.fr",
  "INSEE",
  "DINUM",
  "Ministère chargé des Transports",
  "Agence nationale de cohésion",
];

const rows: Row[] = Array.from({ length: 30 }, (_, index) => {
  const rank = index + 1;
  const commune = communes[index % communes.length];
  const category = categories[index % categories.length];
  const departmentReference = departmentReferences[index % departmentReferences.length];

  return {
    id: `ds-${String(rank).padStart(4, "0")}`,
    nom: `Jeu de données ${category.toLowerCase()} ${rank}`,
    type: category,
    datePublication: `2024-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
    codeDepartement: departmentReference.code,
    lignes: String(1200 + index * 337),
    scoreQualite: String(48 + ((index * 7) % 52)),
    commune,
    codeInsee: String(75000 + index * 17),
    theme: themes[index % themes.length],
    producteur: producers[index % producers.length],
    region: regions[index % regions.length],
    departement: departments[index % departments.length],
    statut: statuses[index % statuses.length],
    frequence: frequencies[index % frequencies.length],
    licence: licences[index % licences.length],
    urlSource: `https://example.data.gouv.fr/datasets/${String(rank).padStart(4, "0")}`,
    siren: String(100000000 + index * 9137),
    millesime: `202${index % 5}-01-01`,
    couverture: coverages[index % coverages.length],
    derniereRevision: `2024-${String(((index + 5) % 12) + 1).padStart(2, "0")}-${String(((index + 11) % 27) + 1).padStart(2, "0")}`,
    population: String(32000 + index * 4821),
    superficie: String(18 + index * 3),
    densite: String(140 + index * 27),
    latitude: (43.3 + index * 0.12).toFixed(4),
    longitude: (-1.7 + index * 0.18).toFixed(4),
    formatOriginal: originalFormats[index % originalFormats.length],
    schema: schemas[index % schemas.length],
    qualiteMetadonnees: String(56 + ((index * 5) % 44)),
    dateCreation: `2021-${String((index % 12) + 1).padStart(2, "0")}-${String(((index + 3) % 27) + 1).padStart(2, "0")}`,
    contact: contacts[index % contacts.length],
  };
});

function getDepartmentReferenceLabel(value: string) {
  return (
    departmentReferences.find((department) => department.code === value)?.label ??
    "Département"
  );
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
    <div className="flex h-6 w-full items-center justify-between gap-4 text-[13px] leading-[1.4]">
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
      <div className="grid gap-1">{children}</div>
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
          label="Écart-type"
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
    <div className="grid grid-cols-3 gap-5">
      <div className="flex flex-col gap-2">
        <p className="text-[14px] font-bold leading-6 text-[#161616]">
          Valeurs fréquentes
        </p>
        <div className="flex flex-col gap-1">
          {frequentColumnValues.slice(0, 6).map((item) => (
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
      <StructureDetailStat
        label="Usage"
        value={
          column.type === "reference" || column.type === "referenceData"
            ? "Rapprochement avec un référentiel"
            : "Recherche et regroupement"
        }
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
        className="grid w-full grid-cols-[minmax(220px,1.2fr)_150px_150px_90px_120px_140px_130px_130px] text-left text-[12px] leading-4 hover:bg-[#f6f6f6]"
      >
        <div className="flex h-8 min-w-0 items-center gap-1 border-b border-r border-[#E5E5E5] px-2">
          <span className="truncate font-medium text-[#161616]">
            {column.label}
          </span>
        </div>
        <span className="flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          <span className="flex min-w-0 items-center gap-1 rounded-[2px] bg-[#f6f6f6] px-1">
            <Icon path={icons[column.icon]} className="h-4 w-4 shrink-0 text-[#3a3a3a]" />
            <span className="truncate">
            {getColumnTypeLabel(column.type)}
            </span>
          </span>
        </span>
        <span
          className={`flex h-8 items-center border-b border-r border-[#E5E5E5] px-2 ${
            column.type === "number" ? "justify-end" : ""
          }`}
        >
          <TableValuePreview value={previewValue} type={column.type} />
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
        <span className="flex h-8 items-center justify-between gap-2 border-b border-r border-[#E5E5E5] px-2 text-[#3a3a3a]">
          <span>
            {uniqueCount} ({uniquePercent} %)
          </span>
          <Icon
            path={icons.arrowRightS}
            className={`h-4 w-4 text-[#3a3a3a] ${expanded ? "rotate-90" : ""}`}
          />
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
        <div className="grid w-full grid-cols-2 gap-5">
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
            <StructureMetricRow icon="download" label="Poids" value="232Mo" />
          </StructureSection>

          <StructureSection title="Types">
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
          <div className="min-w-[1240px] overflow-hidden border-l border-t border-[#E5E5E5] bg-[#FFFFFF]">
            <div className="grid grid-cols-[minmax(220px,1.2fr)_150px_150px_90px_120px_140px_130px_130px] bg-[#f6f6f6] text-[12px] font-bold leading-4 text-[#161616]">
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Nom de la colonne
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Type
              </span>
              <span className="flex h-12 items-center border-b border-r border-[#E5E5E5] px-3">
                Aperçu
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

function compareRows(first: Row, second: Row, sortState: NonNullable<SortState>) {
  const column = tableColumns.find((item) => item.key === sortState.key);
  const firstValue = getRowValue(first, sortState.key);
  const secondValue = getRowValue(second, sortState.key);
  const direction = sortState.direction === "asc" ? 1 : -1;

  if (column?.type === "number") {
    return (parseNumber(firstValue) - parseNumber(secondValue)) * direction;
  }

  if (column?.type === "date") {
    return (
      (new Date(firstValue).getTime() - new Date(secondValue).getTime()) *
      direction
    );
  }

  return (
    firstValue.localeCompare(secondValue, "fr", {
      numeric: true,
      sensitivity: "base",
    }) * direction
  );
}

function getCategoryOptions(key: ColumnKey) {
  return Array.from(
    rows.reduce((counts, row) => {
      const value = getRowValue(row, key);
      counts.set(value, (counts.get(value) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  )
    .map(([label, count]) => ({ label, count }))
    .slice(0, 8);
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
  conform: RiCheckboxCircleLine,
  arrowDown: RiArrowDownLine,
  arrowDropDown: RiArrowDropDownLine,
  arrowRightS: RiArrowRightSLine,
  arrowUp: RiArrowUpLine,
  issue: RiQuestionLine,
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
}: {
  resource: Resource;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid h-7 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded px-1 py-1 text-left ${
        active ? "bg-[#eeeeee]" : "hover:bg-[#f6f6f6]"
      }`}
    >
      <span
        className={`flex shrink-0 items-center rounded-[1px] p-0.5 ${resourceIconStyles[resource.type]}`}
      >
        <Icon path={icons[resource.type]} className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 items-center gap-0.5 whitespace-nowrap">
        <span
          className={`truncate text-[13px] ${
            active ? "font-extrabold text-[#161616]" : "font-medium text-[#3a3a3a]"
          }`}
        >
          {resource.name}
        </span>
        <span className="text-[13px] text-[#3a3a3a]">·</span>
        <span className="truncate text-[12px] text-[#3a3a3a]">
          {resource.size}
        </span>
      </div>
      <FormatTag>{resource.format}</FormatTag>
    </button>
  );
}

function DatasetContextHeader({
  updatedAt,
  actions,
}: {
  updatedAt: string;
  actions: ReactNode;
}) {
  return (
    <div className="flex h-[58px] shrink-0 items-center justify-between gap-4 border-b border-[#E5E5E5] bg-[#f6f6f6]/95 px-3 backdrop-blur-[5px]">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[2px] border border-[#E5E5E5] bg-[#FFFFFF] p-1">
          <div className="flex h-full w-full items-center justify-center rounded-[1px] border border-[#eeeeee] text-[8px] font-bold leading-3 text-[#000091]">
            DG
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-1 text-[16px] leading-[1.4]">
          <span className="shrink-0 text-[#161616]">
            Direction interministérielle du numérique
          </span>
          <span className="shrink-0 text-[#161616]">/</span>
          <span className="truncate font-bold text-[#161616]">
            Annuaire de l’éducation
          </span>
          <span className="shrink-0 text-[#3a3a3a]">·</span>
          <span className="truncate text-[#3a3a3a]">
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
  selectedColumnKeys,
  onToggleColumn,
  onSelectAll,
  onClearAll,
  onClose,
}: {
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
          {selectedColumnKeys.length} sur {tableColumns.length} colonnes visibles
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
        {tableColumns.map((column) => {
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
  id,
  label,
  left,
  selectedValues,
  searchValue,
  sortState,
  onSearchChange,
  onToggleValue,
  onSort,
  onClose,
}: {
  id: ColumnKey;
  label: string;
  left: number;
  selectedValues: string[];
  searchValue: string;
  sortState: SortState;
  onSearchChange: (key: ColumnKey, value: string) => void;
  onToggleValue: (key: ColumnKey, value: string) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClose: () => void;
}) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  const options = getCategoryOptions(id).filter((option) =>
    option.label.toLowerCase().includes(normalizedSearch),
  );
  const column = tableColumns.find((item) => item.key === id);

  if (!column) {
    return null;
  }

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
        {options.length > 0 ? (
          options.map((option) => (
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
  id,
  label,
  left,
  range,
  sortState,
  onChangeRange,
  onSort,
  onClear,
  onClose,
}: {
  id: ColumnKey;
  label: string;
  left: number;
  range: NumberRange;
  sortState: SortState;
  onChangeRange: (key: ColumnKey, range: NumberRange) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClear: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const column = tableColumns.find((item) => item.key === id);

  if (!column) {
    return null;
  }

  const bounds = getNumberStats(column);

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
            placeholder={String(bounds.min)}
            className="h-6 w-20 rounded border border-[#E5E5E5] px-2 text-[12px] placeholder:text-[#3a3a3a]"
            value={range.min}
            onChange={(event) =>
              onChangeRange(id, { ...range, min: event.target.value })
            }
          />
          <span className="h-px w-10 bg-[#CECECE]" />
          <input
            aria-label="Valeur maximale"
            placeholder={String(bounds.max)}
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
  id,
  label,
  left,
  filter,
  sortState,
  onChangeDate,
  onSort,
  onClear,
  onClose,
}: {
  id: ColumnKey;
  label: string;
  left: number;
  filter: DateFilterValue;
  sortState: SortState;
  onChangeDate: (key: ColumnKey, value: DateFilterValue) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClear: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const column = tableColumns.find((item) => item.key === id);
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

  if (!column) {
    return null;
  }

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
            path={icons.arrowDown}
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
  const column = tableColumns.find((item) => item.key === activeFilter);

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
        id={column.key}
        label={column.label}
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
        id={column.key}
        label={column.label}
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
      id={column.key}
      label={column.label}
      left={left}
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
            <p className="font-bold">Code de département.</p>
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

  const cellClassName = `relative flex h-8 shrink-0 cursor-pointer items-center border-b border-r border-[#E5E5E5] px-2 text-left hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091] ${
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

function MapPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#FFFFFF]">
      <div className="flex h-10 items-center border-b border-[#E5E5E5] px-2">
        <p className="text-[13px] leading-[1.4] text-[#3a3a3a]">
          Dernière mise à jour de l’aperçu : 13/06/2024 17:51
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

export default function ExplorateurPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState("ecoles");
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ColumnKey | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [activeTab, setActiveTab] = useState<ExplorerTab>("Aperçu");
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
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
  const [sortState, setSortState] = useState<SortState>(null);
  const [categoryFilters, setCategoryFilters] = useState<
    Partial<Record<ColumnKey, string[]>>
  >({});
  const [filterSearches, setFilterSearches] = useState<
    Partial<Record<ColumnKey, string>>
  >({});
  const [numberRanges, setNumberRanges] = useState<
    Partial<Record<ColumnKey, NumberRange>>
  >({});
  const [dateFilters, setDateFilters] = useState<
    Partial<Record<ColumnKey, DateFilterValue>>
  >({});
  const [hasTableScrolled, setHasTableScrolled] = useState(false);

  const visibleColumns = useMemo(
    () =>
      tableColumns.filter((column) => visibleColumnKeys.includes(column.key)),
    [visibleColumnKeys],
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

  const activeResource =
    resources.find((resource) => resource.id === activeResourceId) ??
    resources[0];

  const filteredResources = useMemo(() => {
    const normalizedQuery = resourceSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return resources;
    }

    return resources.filter((resource) =>
      [resource.name, resource.format, resource.type]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [resourceSearchQuery]);

  const mainResources = filteredResources.filter(
    (resource) => resource.type !== "documentation",
  );
  const documentationResources = filteredResources.filter(
    (resource) => resource.type === "documentation",
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const searchableContent = tableColumns
        .map((column) => getRowValue(row, column.key))
        .join(" ")
        .toLowerCase();

      if (normalizedQuery && !searchableContent.includes(normalizedQuery)) {
        return false;
      }

      const matchesCategories = Object.entries(categoryFilters).every(
        ([key, selectedValues]) => {
          if (!selectedValues?.length) {
            return true;
          }

          return selectedValues.includes(getRowValue(row, key as ColumnKey));
        },
      );

      if (!matchesCategories) {
        return false;
      }

      const matchesDates = Object.entries(dateFilters).every(([key, filter]) => {
        if (!isDateFilterActive(filter)) {
          return true;
        }

        const rowTimestamp = parseDateFilterValue(getRowValue(row, key as ColumnKey));
        const startTimestamp = parseDateFilterValue(filter.value);
        const endTimestamp = parseDateFilterValue(filter.endValue);

        if (rowTimestamp === null) {
          return false;
        }

        if (filter.mode === "before") {
          return startTimestamp === null ? true : rowTimestamp < startTimestamp;
        }

        if (filter.mode === "after") {
          return startTimestamp === null ? true : rowTimestamp > startTimestamp;
        }

        if (filter.mode === "between") {
          const isAfterStart =
            startTimestamp === null ? true : rowTimestamp >= startTimestamp;
          const isBeforeEnd =
            endTimestamp === null ? true : rowTimestamp <= endTimestamp;

          return isAfterStart && isBeforeEnd;
        }

        if (startTimestamp === null) {
          return true;
        }

        return rowTimestamp === startTimestamp;
      });

      if (!matchesDates) {
        return false;
      }

      return Object.entries(numberRanges).every(([key, range]) => {
        if (!range?.min && !range?.max) {
          return true;
        }

        const value = parseNumber(getRowValue(row, key as ColumnKey));
        const min = range.min ? Number(range.min) : Number.NEGATIVE_INFINITY;
        const max = range.max ? Number(range.max) : Number.POSITIVE_INFINITY;

        return value >= min && value <= max;
      });
    });

    if (!sortState) {
      return filtered;
    }

    return [...filtered].sort((first, second) =>
      compareRows(first, second, sortState),
    );
  }, [categoryFilters, dateFilters, numberRanges, searchQuery, sortState]);

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
    setActiveTab(resource.tabs[0]);
    setActiveFilter(null);
    setActiveCell(null);
    setIsColumnSelectorOpen(false);
    setIsDownloadMenuOpen(false);
  }

  function openCell(cell: NonNullable<ActiveCell>) {
    setActiveCell((current) => (current?.id === cell.id ? null : cell));
    setActiveFilter(null);
    setIsColumnSelectorOpen(false);
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
        [cell.key]: cell.value,
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
  }

  return (
    <main
      className={`h-dvh overflow-hidden text-[#161616] ${
        isExplorerMinimized
          ? "flex items-center justify-center bg-[#f6f6f6] p-6"
          : "bg-[#FFFFFF] p-0"
      }`}
    >
      <div
        className={`explorer-shell flex flex-col bg-[#FFFFFF] transition-[height,width,box-shadow] duration-200 ${
          isExplorerMinimized
            ? "h-[78dvh] w-[82vw] overflow-hidden rounded-lg border border-[#E5E5E5] shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
            : "h-full w-full"
        }`}
      >
        {!isExplorerMinimized ? (
          <DatasetContextHeader
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
            className={`resource-sidebar flex shrink-0 flex-col rounded border-r border-[#E5E5E5] bg-[#FFFFFF] transition-[width] duration-200 ${
              isSidebarCollapsed ? "w-12" : "w-[246px]"
            }`}
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
              <label className="flex h-8 items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2">
                <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                <input
                  value={resourceSearchQuery}
                  onChange={(event) => setResourceSearchQuery(event.target.value)}
                  aria-label="Rechercher une ressource"
                  placeholder="Rechercher une ressource"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                />
              </label>

              <section className="space-y-0.5">
                <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                  {mainResources.length} Fichiers principaux
                </p>
                {mainResources.map((resource) => (
                  <ResourceItem
                    key={resource.id}
                    resource={resource}
                    active={resource.id === activeResource.id}
                    onSelect={() => selectResource(resource)}
                  />
                ))}
              </section>

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
                  />
                ))}
              </section>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#FFFFFF]">
            <header className="flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-3">
              <div className="flex items-center gap-1 text-[13px]">
                <Icon path={icons[activeResource.type]} />
                <span className="font-medium">{activeResource.name}</span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="text-[#3a3a3a]">
                  Mis à jour le {activeResource.updatedAt}
                </span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="text-[#3a3a3a]">{activeResource.size}</span>
                <span className="text-[#3a3a3a]">·</span>
                <FormatTag>{activeResource.format}</FormatTag>
                <span className="text-[#3a3a3a]">·</span>
                <Icon path={icons.download} className="h-3 w-3 text-[#3a3a3a]" />
                <span className="text-[#3a3a3a]">{activeResource.downloads}</span>
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

            <div className="flex h-12 items-center border-b border-[#E5E5E5] bg-[#FFFFFF] px-2">
              <div className="flex flex-wrap items-center rounded border border-[#E5E5E5]">
                {activeResource.tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setActiveFilter(null);
                      setActiveCell(null);
                      setIsColumnSelectorOpen(false);
                      setIsDownloadMenuOpen(false);
                    }}
                    className={`h-7 rounded px-2.5 text-[12px] font-medium leading-6 ${
                      tab === activeTab
                        ? "border border-[#000091] text-[#000091]"
                        : "text-[#161616]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "Description" ? (
              <DescriptionPanel />
            ) : activeTab === "Carte" ? (
              <MapPanel />
            ) : activeTab === "Structure des données" ? (
              <StructurePanel />
            ) : activeTab === "Métadonnées" ? (
              <MetadataPanel />
            ) : activeTab === "API" ? (
              <ApiPanel />
            ) : activeTab === "Aperçu" && activeResource.id === "guides" ? (
              <PdfPreviewPanel />
            ) : activeTab === "Aperçu" &&
              (activeResource.id === "schema" || activeResource.id === "addition") ? (
              <CodePreviewPanel />
            ) : activeTab === "Aperçu" && activeResource.id === "resultats" ? (
              <PreviewUnavailablePanel />
            ) : (
              <>
            <div className="flex h-12 items-center justify-between border-b border-[#E5E5E5] bg-[#FFFFFF] px-2">
              <div className="flex items-center gap-2">
                <label className="flex h-8 w-[200px] items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2">
                  <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Rechercher une valeur"
                    placeholder="Rechercher une valeur"
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                  />
                </label>
                <span className="text-[13px] text-[#3a3a3a]">
                  Dernière mise à jour de l’aperçu : 13/06/2024 17:51
                </span>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-[#3a3a3a]">
                <span className="relative flex items-center gap-1">
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
                    }}
                    className="flex h-6 cursor-pointer items-center gap-1 rounded px-1 hover:bg-[#eeeeee]"
                  >
                    <Icon path={icons.columns} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                    Colonnes {visibleColumns.length} sur {tableColumns.length}
                    <Icon path={icons.arrowDropDown} className="h-4 w-4 text-[#3a3a3a]" />
                  </button>
                  {isColumnSelectorOpen ? (
                    <ColumnSelector
                      selectedColumnKeys={visibleColumnKeys}
                      onToggleColumn={toggleVisibleColumn}
                      onSelectAll={() =>
                        setVisibleColumnKeys(tableColumns.map((column) => column.key))
                      }
                      onClearAll={() => setVisibleColumnKeys([])}
                      onClose={() => setIsColumnSelectorOpen(false)}
                    />
                  ) : null}
                </span>
                <span className="flex items-center gap-1">
                  <Icon path={icons.rows} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  Lignes {filteredRows.length} sur {rows.length}
                </span>
              </div>
            </div>

            <ActiveFiltersBar
              searchQuery={searchQuery}
              sortState={sortState}
              categoryFilters={categoryFilters}
              numberRanges={numberRanges}
              dateFilters={dateFilters}
              onOpenFilter={(key) => {
                setActiveCell(null);
                setActiveFilter(key);
              }}
              onClearSearch={() => setSearchQuery("")}
              onClearCategory={clearCategoryFilter}
              onClearNumber={clearNumberRange}
              onClearDate={clearDateFilter}
              onClearSort={() => setSortState(null)}
              onClearAll={clearAllFilters}
            />

            <div className="relative min-h-0 flex-1">
              {activeFilter || activeCell ? (
                <FilterDismissLayer
                  onClose={() => {
                    setActiveFilter(null);
                    setActiveCell(null);
                  }}
                />
              ) : null}
              <FilterMenus
                activeFilter={activeFilter}
                visibleColumns={visibleColumns}
                sortState={sortState}
                categoryFilters={categoryFilters}
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
                onClose={() => setActiveFilter(null)}
              />

              <div
                className="h-full overflow-auto"
                onScroll={(event: UIEvent<HTMLDivElement>) => {
                  const isScrolled = event.currentTarget.scrollTop > 0;

                  setHasTableScrolled((current) =>
                    current === isScrolled ? current : isScrolled,
                  );
                }}
              >
                <div
                  className={`sticky top-0 z-10 flex h-12 w-max min-w-full border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-150 ${
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
                        setVisibleColumnKeys(tableColumns.map((column) => column.key))
                      }
                      className="cursor-pointer text-[#000091] underline decoration-solid underline-offset-2"
                    >
                      Cocher toutes les colonnes
                    </button>
                  </div>
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex h-8 w-max min-w-full bg-[#FFFFFF]"
                    >
                      {visibleColumns.map((column) => (
                        <DataCell
                          key={column.key}
                          id={`${row.id}-${column.key}`}
                          value={getRowValue(row, column.key)}
                          type={column.type}
                          width={columnWidths[column.key] ?? column.widthPx}
                          isActive={
                            activeCell?.id === `${row.id}-${column.key}`
                          }
                          onOpen={() =>
                            openCell({
                              id: `${row.id}-${column.key}`,
                              key: column.key,
                              value: getRowValue(row, column.key),
                              type: column.type,
                            })
                          }
                          onCopy={() =>
                            copyCellValue(getRowValue(row, column.key))
                          }
                          onFilter={() =>
                            filterByCellValue({
                              id: `${row.id}-${column.key}`,
                              key: column.key,
                              value: getRowValue(row, column.key),
                              type: column.type,
                            })
                          }
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-[#f6f6f6] p-4 text-center text-[16px] leading-6">
                    <p className="text-[#3a3a3a]">
                      Il n’y a pas de résultats pour ces critères
                    </p>
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="cursor-pointer text-[#000091] underline decoration-solid underline-offset-2"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
