"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ComponentType, KeyboardEvent, ReactNode } from "react";
import {
  RiArrowDownLine,
  RiArrowDropDownLine,
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
  type: ResourceType;
  tabs: ExplorerTab[];
};

const resources: Resource[] = [
  {
    id: "ecoles",
    name: "Ecoles",
    size: "134mo",
    format: "CSV",
    type: "table",
    tabs: ["Aperçu", "Carte", "Description", "Structure des données", "Métadonnées", "API"],
  },
  {
    id: "resultats",
    name: "Résultats",
    size: "134mo",
    format: "CSV",
    type: "table",
    tabs: ["Aperçu", "Description", "Métadonnées"],
  },
  {
    id: "secteurs",
    name: "Secteurs",
    size: "134mo",
    format: "GEOJSON",
    type: "geodata",
    tabs: ["Carte", "Métadonnées"],
  },
  {
    id: "schema",
    name: "Schéma",
    size: "134mo",
    format: "JSON",
    type: "code",
    tabs: ["Aperçu", "Métadonnées"],
  },
  {
    id: "addition",
    name: "Addition",
    size: "134mo",
    format: "XML",
    type: "code",
    tabs: ["Aperçu", "Métadonnées"],
  },
  {
    id: "guides",
    name: "Guides",
    size: "134mo",
    format: "PDF",
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

function parseNumber(value: string) {
  const parsed = Number(value.replace(/[^\d.-]/g, ""));

  return Number.isNaN(parsed) ? 0 : parsed;
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
    neutral: "text-[#666666]",
    success: "text-[#18753c]",
    warning: "text-[#716043]",
    error: "text-[#b34000]",
    purple: "text-[#7b4fbf]",
  };

  return (
    <div className="flex h-6 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-1">
        {icon ? (
          <Icon
            path={icons[icon]}
            className={`h-4 w-4 ${toneClassNames[tone]}`}
          />
        ) : null}
        <span
          className={`truncate text-[12px] leading-[1.4] ${toneClassNames[tone]}`}
        >
          {label}
        </span>
      </div>
      <span
        className={`shrink-0 text-[13px] leading-[1.4] ${toneClassNames[tone]}`}
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
      <h2 className="mb-2 text-[13px] font-medium leading-[1.4] text-[#161616]">
        {title}
      </h2>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  );
}

const frequentValues = Array.from({ length: 10 }, (_, index) => ({
  label: `Option ${index + 1}`,
  value: "2 (32%)",
}));

const distributionHeights = [88, 106, 138, 97, 37, 23, 18, 9, 37, 64, 97, 46];

function StructureColumnDetail({
  icon,
  label,
  expanded = false,
}: {
  icon: keyof typeof icons;
  label: string;
  expanded?: boolean;
}) {
  return (
    <section className="px-1 py-1">
      <div className="flex h-6 items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon path={icons[icon]} className="h-4 w-4 text-[#666666]" />
          <span className="text-[13px] font-medium leading-none text-[#666666]">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px] leading-[1.4]">
          <span className="text-[#3a3a3a]">32 valeurs</span>
          <span className="text-[#18753c]">20(80%)</span>
          <span className="text-[#716043]">12(2%)</span>
          <span className="text-[#b34000]">2(1%)</span>
          <Icon
            path={icons.arrowDown}
            className={`h-4 w-4 text-[#666666] ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 grid grid-cols-[204px_204px_1fr] gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] leading-[1.4] text-[#666666]">
              Valeurs fréquentes
            </p>
            <div className="flex flex-col gap-1">
              {frequentValues.map((item) => (
                <div
                  key={item.label}
                  className="grid h-5 grid-cols-[120px_1fr] items-center gap-2 text-[13px] leading-[1.4] text-[#3a3a3a]"
                >
                  <span className="w-fit rounded bg-[#f6f6f6] px-2 text-[#666666]">
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[13px] font-medium leading-[1.4] text-[#161616]">
              Statistiques
            </h3>
            {[
              ["Min", "1"],
              ["Max", "6"],
              ["Moyenne", "3"],
              ["Médiane", "2"],
              ["Écart-type", "2"],
            ].map(([name, value]) => (
              <div
                key={name}
                className="flex h-6 items-center justify-between text-[12px] leading-[1.4]"
              >
                <span className="text-[#666666]">{name}</span>
                <span className="text-[13px] text-[#3a3a3a]">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex max-w-[204px] flex-col gap-2">
            <h3 className="text-[13px] font-medium leading-[1.4] text-[#161616]">
              Distribution
            </h3>
            <div className="flex h-[146px] items-end gap-[2px] border-b border-[#666666]/40">
              {distributionHeights.map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className="min-w-0 flex-1 rounded-t-[1px] bg-[#b6cffb]"
                  style={{ height }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[8px] leading-none text-[#666666]">
              <span>0</span>
              <span>6</span>
              <span>12</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StructurePanel() {
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
    <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
      <div className="flex max-w-[1180px] flex-col gap-5 text-[#3a3a3a]">
        <div className="grid grid-cols-2 gap-10">
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
            <StructureMetricRow
              icon="conform"
              label="Valeurs valides"
              value="5 (39%)"
              tone="success"
            />
            <StructureMetricRow
              icon="issue"
              label="Valeurs non conformes"
              value="5 (39%)"
              tone="warning"
            />
            <StructureMetricRow
              icon="missing"
              label="Valeurs manquantes"
              value="5 (39%)"
              tone="error"
            />
          </StructureSection>

          <StructureSection title="Colonnes">
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

        <div className="flex flex-col gap-1">
          <StructureColumnDetail icon="category" label="Catégorie" expanded />
          <StructureColumnDetail icon="calendar" label="Date" />
          <StructureColumnDetail
            icon="referenceData"
            label="Données de référence"
          />
        </div>
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
  expand: RiFullscreenLine,
  externalLink: RiExternalLinkLine,
  copy: RiFileCopyLine,
  filter: RiFilterLine,
  geodata: RiMap2Line,
  check: RiCheckLine,
  close: RiCloseLine,
  conform: RiCheckboxCircleLine,
  arrowDown: RiArrowDownLine,
  arrowDropDown: RiArrowDropDownLine,
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
    <span className="rounded bg-black/[0.04] px-2 py-0.5 text-[12px] leading-4 text-[#3a3a3a]">
      {children}
    </span>
  );
}

const resourceIconStyles = {
  table: "bg-[#c3fad5] text-[#18753c]",
  geodata: "bg-[#e9edfe] text-[#0000ff]",
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
      className={`flex h-7 items-center gap-1 rounded px-1 py-1 ${
        active ? "bg-black/[0.04]" : "hover:bg-black/[0.02]"
      }`}
    >
      <span
        className={`flex shrink-0 items-center rounded-[1px] p-0.5 ${resourceIconStyles[resource.type]}`}
      >
        <Icon path={icons[resource.type]} className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-0.5 whitespace-nowrap">
        <span
          className={`truncate text-[13px] ${
            active ? "font-extrabold text-[#161616]" : "font-medium text-[#5d5d5d]"
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

function HeaderCell({
  column,
  isOpen,
  sortDirection,
  onOpen,
}: {
  column: (typeof tableColumns)[number];
  isOpen: boolean;
  sortDirection?: SortDirection;
  onOpen: () => void;
}) {
  return (
    <div
      className={`flex h-8 shrink-0 items-center justify-between border-b border-r border-[#e5e5e5] px-2 ${column.width}`}
    >
      <div className="flex min-w-0 items-center gap-1">
        <Icon
          path={icons[column.icon]}
          className={`h-4 w-4 ${
            column.icon === "referenceData" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"
          }`}
        />
        <span className="truncate text-[12px] font-medium text-[#161616]">
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
        className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded transition-colors hover:bg-black/[0.04] ${
          isOpen ? "bg-[#e8edff]" : ""
        }`}
      >
        <Icon
          path={icons.filter}
          className={`h-4 w-4 ${isOpen ? "text-[#000091]" : "text-[#b4b4b4]"}`}
        />
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
    <div className="flex h-9 items-center justify-between border-b border-[#e6e6e6] px-2 text-[12px]">
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
                  : "text-[#666666] hover:bg-black/[0.04]"
              }`}
            >
              <Icon
                path={direction === "asc" ? icons.arrowUp : icons.arrowDown}
                className={`h-3.5 w-3.5 ${
                  isActive ? "text-[#000091]" : "text-[#666666]"
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
        checked ? "border-[#000091] bg-[#000091]" : "border-[#161616] bg-white"
      }`}
    >
      {checked ? (
        <Icon path={icons.check} className="h-2.5 w-2.5 text-white" />
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
      className="flex h-8 w-full items-center gap-2 rounded px-1 text-left hover:bg-black/[0.04]"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <CheckboxMark checked={checked} />
        <span className="rounded bg-[#e6e6e6] px-2 py-1 text-[12px] leading-3 text-[#5d5d5d]">
          {label}
        </span>
      </div>
      <span className="px-2 text-[12px] text-[#5d5d5d]">{count}</span>
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
    <div className="absolute right-0 top-7 z-30 flex w-60 flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
      <div className="flex h-8 items-center gap-1 border-b border-[#e6e6e6] bg-[#fcfcfc] px-2">
        <p className="min-w-0 flex-1 text-[12px] font-bold text-[#161616]">
          {selectedColumnKeys.length} sur {tableColumns.length} colonnes visibles
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la sélection des colonnes"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-black/[0.04]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <div className="max-h-64 overflow-auto border-b border-[#e6e6e6] p-1">
        {tableColumns.map((column) => {
          const checked = selectedColumnKeys.includes(column.key);

          return (
            <button
              key={column.key}
              type="button"
              onClick={() => onToggleColumn(column.key)}
              className="flex h-8 w-full items-center gap-2 rounded px-1 text-left hover:bg-black/[0.04]"
            >
              <CheckboxMark checked={checked} />
              <span className="truncate text-[13px] font-medium leading-[19.5px] text-[#0a0a0a]">
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
          className="h-6 px-1 text-[11px] font-medium leading-6 text-[#161616] hover:underline"
        >
          Décocher tout
        </button>
        <button
          type="button"
          onClick={onSelectAll}
          className="h-6 px-1 text-[11px] font-medium leading-6 text-[#161616] hover:underline"
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
      className={`filter-popover filter-popover-${id} absolute top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
      style={{ left }}
    >
      <div className="flex h-8 items-center gap-1 border-b border-[#e6e6e6] bg-[#fcfcfc] px-2">
        <p className="min-w-0 flex-1 text-[12px] text-[#161616]">
          <span className="font-bold">Filter : </span>
          <span>{label}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le filtre"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-black/[0.04]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <SortControls column={column} sortState={sortState} onSort={onSort} />

      <label className="flex h-9 items-center gap-1 border-b border-[#e6e6e6] px-2">
        <Icon path={icons.search} className="h-3.5 w-3.5 text-[#5d5d5d]" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(id, event.target.value)}
          aria-label={`Rechercher dans ${column.label}`}
          placeholder="Rechercher"
          className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#5d5d5d] outline-none placeholder:text-[#5d5d5d]"
        />
      </label>

      <div className="border-b border-[#e6e6e6] p-1">
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
          <div className="flex h-8 items-center px-1 text-[12px] text-[#666666]">
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

  return (
    <div
      className={`filter-popover filter-popover-${id} absolute top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
      style={{ left }}
    >
      <div className="flex h-8 items-center gap-1 border-b border-[#e6e6e6] bg-[#fcfcfc] px-2">
        <p className="min-w-0 flex-1 text-[12px] text-[#161616]">
          <span className="font-bold">Filter : </span>
          <span>{label}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le filtre"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-black/[0.04]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <SortControls column={column} sortState={sortState} onSort={onSort} />

      <div className="flex h-9 items-center border-b border-[#e6e6e6] px-2 text-[12px] font-medium text-[#5d5d5d]">
        Rechercher
      </div>

      <div className="border-b border-[#e6e6e6] p-3">
        <div className="mb-2 flex justify-between text-[11px] text-[#666666]">
          <span>Valeurs manquantes</span>
          <span>1323(3%)</span>
        </div>
        <div className="h-2 rounded bg-[#e6e6e6]">
          <div className="h-2 w-10 rounded bg-[#3a3a3a]" />
        </div>
        <div className="mt-3 flex justify-end gap-2 text-[12px] text-[#3a3a3a]">
          <button>Seul.</button>
          <button>Exclure</button>
        </div>
      </div>

      <div className="p-3">
        <div className="mb-1 flex justify-between text-[11px] text-[#666666]">
          <span>Min</span>
          <span>Max</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            aria-label="Valeur minimale"
            className="h-6 w-20 rounded border border-[#e6e6e6] px-2 text-[12px]"
            value={range.min}
            onChange={(event) =>
              onChangeRange(id, { ...range, min: event.target.value })
            }
          />
          <span className="h-px w-10 bg-[#b4b4b4]" />
          <input
            aria-label="Valeur maximale"
            className="h-6 w-20 rounded border border-[#e6e6e6] px-2 text-[12px]"
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
  value,
  sortState,
  onChangeDate,
  onSort,
  onClear,
  onClose,
}: {
  id: ColumnKey;
  label: string;
  left: number;
  value: string;
  sortState: SortState;
  onChangeDate: (key: ColumnKey, value: string) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClear: (key: ColumnKey) => void;
  onClose: () => void;
}) {
  const column = tableColumns.find((item) => item.key === id);
  const days = [
    ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    ["29", "30", "31", "1", "2", "3", "4"],
    ["5", "6", "7", "8", "9", "10", "11"],
    ["12", "13", "14", "15", "16", "17", "18"],
    ["19", "20", "21", "22", "23", "24", "25"],
    ["26", "27", "28", "29", "30", "1", "2"],
  ];

  if (!column) {
    return null;
  }

  return (
    <div
      className={`filter-popover filter-popover-${id} absolute top-8 z-20 flex w-[320px] flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
      style={{ left }}
    >
      <div className="flex h-8 items-center gap-1 border-b border-[#e6e6e6] bg-[#fcfcfc] px-2">
        <p className="min-w-0 flex-1 text-[12px] text-[#161616]">
          <span className="font-bold">Filter : </span>
          <span>{label}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le filtre"
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded hover:bg-black/[0.04]"
        >
          <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        </button>
      </div>

      <SortControls column={column} sortState={sortState} onSort={onSort} />

      <div className="flex h-9 items-center justify-between border-b border-[#e6e6e6] px-2 text-[12px] text-[#3a3a3a]">
        <span>Est</span>
        <span>⌄</span>
      </div>
      <label className="flex h-9 items-center border-b border-[#e6e6e6] px-2">
        <input
          value={value}
          onChange={(event) => onChangeDate(id, event.target.value)}
          aria-label="Entrer une date"
          placeholder="Entrer une date"
          className="w-full bg-transparent text-[12px] text-[#5d5d5d] outline-none placeholder:text-[#5d5d5d]"
        />
      </label>

      <div className="p-2">
        <div className="mb-2 flex h-8 items-center justify-between text-[12px]">
          <span className="rounded border border-[#e6e6e6] px-2 py-1">April</span>
          <span className="rounded border border-[#e6e6e6] px-2 py-1">2024</span>
          <span className="text-[#666666]">‹ ›</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#666666]">
          {days.flat().map((day, index) => (
            <span
              key={`${day}-${index}`}
              className={`flex h-6 items-center justify-center rounded ${
                day === "7" ? "bg-[#000091] text-white" : ""
              }`}
            >
              {day}
            </span>
          ))}
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
  dateFilters: Partial<Record<ColumnKey, string>>;
  onToggleCategory: (key: ColumnKey, value: string) => void;
  onSearchFilter: (key: ColumnKey, value: string) => void;
  onChangeRange: (key: ColumnKey, range: NumberRange) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClearRange: (key: ColumnKey) => void;
  onChangeDate: (key: ColumnKey, value: string) => void;
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
        label="Nombre"
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
        label="Date"
        left={left}
        value={dateFilters[column.key] ?? ""}
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
      label="Catégorie"
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
      className={`absolute left-1 top-7 z-30 flex flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)] ${
        isReferenceData ? "w-[238px]" : "w-[176px]"
      }`}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onCopy();
        }}
        className="flex h-9 w-full items-center gap-1 border-b border-[#e6e6e6] px-2 text-left text-[13px] leading-[1.4] text-[#3a3a3a] hover:bg-black/[0.04]"
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
        className="flex h-9 w-full items-center gap-1 px-2 text-left text-[13px] leading-[1.4] text-[#3a3a3a] hover:bg-black/[0.04]"
      >
        <Icon path={icons.filter} className="h-3.5 w-3.5 text-[#3a3a3a]" />
        Filtrer par cette valeur
      </button>
      {isReferenceData ? (
        <div className="flex flex-col gap-2 border-t border-[#e6e6e6] px-2 py-2">
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
  width: string;
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

  const cellClassName = `relative flex h-8 shrink-0 cursor-pointer items-center border-b border-r border-[#e5e5e5] px-2 text-left hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091] ${width} ${
    isActive ? "bg-[#e8edff]" : ""
  }`;

  if (type === "category" || type === "reference") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className={cellClassName}
        aria-label={`Actions pour ${id} : ${value}`}
      >
        <span className="truncate rounded bg-black/[0.04] px-2 py-1 text-[12px] leading-3 text-[#6a6a6a]">
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
      className="flex h-6 cursor-pointer items-center gap-0.5 rounded border border-[#c2d1ff] bg-[#e8edff] py-0.5 pl-1 pr-0.5 text-[12px] leading-4 text-[#0063cb]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-0.5"
      >
        <Icon path={icons[icon]} className="h-4 w-4 text-[#0063cb]" />
        <span className="font-medium">{label}</span>
        {value ? <span>{value}</span> : null}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer ${label}`}
        className="flex h-5 w-5 items-center justify-center rounded hover:bg-[#dbe5ff]"
      >
        <Icon path={icons.close} className="h-3.5 w-3.5 text-[#0063cb]" />
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
  dateFilters: Partial<Record<ColumnKey, string>>;
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
      value: dateFilters[column.key],
    }))
    .filter((entry) => entry.value?.trim());
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
    <div className="flex h-10 items-center justify-between border-b border-[#f1f1f1] bg-white px-2">
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
        {activeDateEntries.map(({ column, value }) => (
          <ActiveFilterChip
            key={column.key}
            icon="calendar"
            label={`${column.label}:`}
            value={value}
            onOpen={() => onOpenFilter(column.key)}
            onRemove={() => onClearDate(column.key)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        disabled={!hasFilters}
        className="flex h-6 items-center gap-1 rounded px-2 text-[13px] leading-4 text-[#3a3a3a] hover:bg-black/[0.04] disabled:opacity-40"
      >
        <Icon path={icons.close} className="h-4 w-4 text-[#3a3a3a]" />
        Tout effacer
      </button>
    </div>
  );
}

function DescriptionPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white">
      <article className="max-w-[792px] px-3 py-4 text-[14px] leading-6 text-[#3a3a3a]">
        <h1 className="mb-2 text-[24px] font-bold leading-8 text-[#3a3a3a]">
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
            className="flex h-5 w-5 items-center justify-center rounded hover:bg-black/[0.04]"
          >
            <Icon path={icons.copy} className="h-4 w-4 text-[#3a3a3a]" />
          </button>
        ) : null}
      </div>
      {chip ? (
        <span className="w-fit rounded-[2px] bg-[#f6f6f6] px-1 text-[14px] leading-6 tracking-[0.28px] text-[#666666]">
          {value}
        </span>
      ) : (
        <p
          className={`truncate text-[#3a3a3a] ${
            technical ? "tracking-[0.28px]" : ""
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
    <div className="min-h-0 flex-1 overflow-auto bg-white p-4">
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
    <div className="flex min-h-[72px] items-start gap-3 border-b border-[#e5e5e5] px-1 py-3">
      <span className="mt-1 flex w-16 shrink-0 items-center justify-center rounded bg-[#e6eefe] px-1.5 py-0.5 text-[12px] font-bold leading-3 text-[#0063cb]">
        GET
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[14px] font-light leading-5 text-[#161616]">
            {path}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(path)}
            aria-label="Copier le lien"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-black/[0.04]"
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
    <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-1 py-3 last:border-b-0">
      <Icon path={icons.code} className="h-4 w-4 text-[#3a3a3a]" />
      <span className="text-[14px] leading-5 text-[#161616]">
        {name}
      </span>
    </div>
  );
}

function ApiPanel() {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white px-3 py-4">
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
            L’URL de base de l’API est https://tabular-api.data.gouv.fr
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p>
            Version{" "}
            <span>
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
          <div className="flex items-center justify-between border-b border-[#e5e5e5] py-2">
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
          <div className="flex items-center justify-between border-b border-[#e5e5e5] py-2">
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
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex h-10 items-center border-b border-[#f1f1f1] px-2">
        <p className="text-[13px] leading-[1.4] text-[#3a3a3a]">
          Dernière mise à jour de l’aperçu : 13/06/2024 17:51
        </p>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#fcfcfc]">
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
    <div className="min-h-0 flex-1 overflow-auto bg-[#f6f6f6] p-4">
      <div className="mx-auto w-full max-w-[760px] border border-[#e5e5e5] bg-white">
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
    <div className="min-h-0 flex-1 overflow-auto border-t border-[#e5e5e5] bg-white p-4 text-[14px] leading-[18.67px]">
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
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-white py-[30px] text-center">
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
            className="flex h-8 items-center gap-2 bg-[#000091] pl-2 pr-3 text-[14px] font-medium leading-6 text-[#f5f5fe]"
          >
            <Icon path={icons.download} className="h-4 w-4 text-[#f5f5fe]" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

function DownloadMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-10 z-30 w-[270px] overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
      {downloadGroups.map((group, groupIndex) => (
        <div key={group.title}>
          <div className="flex h-8 items-center gap-1 border-b border-[#e6e6e6] bg-[#fcfcfc] px-2">
            <p className="min-w-0 flex-1 truncate text-[12px] font-bold uppercase leading-[1.4] text-[#161616]">
              {group.title}
            </p>
            {group.closable ? (
              <button
                type="button"
                aria-label="Fermer le menu de téléchargement"
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded text-[#666666] hover:bg-[#eeeeee]"
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
                    isLastItem ? "" : "border-b border-[#e5e5e5]"
                  }`}
                >
                  <span className="whitespace-nowrap text-[14px] leading-[1.5] text-[#161616]">
                    {item.label}
                  </span>
                  <span className="rounded bg-[#f6f6f6] px-1 text-[14px] leading-[1.5] text-[#666666]">
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
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<ColumnKey[]>(
    tableColumns.map((column) => column.key),
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
    Partial<Record<ColumnKey, string>>
  >({});

  const visibleColumns = useMemo(
    () =>
      tableColumns.filter((column) => visibleColumnKeys.includes(column.key)),
    [visibleColumnKeys],
  );

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

      const matchesDates = Object.entries(dateFilters).every(
        ([key, value]) => {
          const normalizedValue = value?.trim().toLowerCase();

          if (!normalizedValue) {
            return true;
          }

          return getRowValue(row, key as ColumnKey)
            .toLowerCase()
            .includes(normalizedValue);
        },
      );

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

  function updateDateFilter(key: ColumnKey, value: string) {
    setDateFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function clearDateFilter(key: ColumnKey) {
    setDateFilters((current) => ({
      ...current,
      [key]: "",
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
    <main className="min-h-dvh overflow-hidden bg-white p-0 text-[#161616] [font-family:Marianne,Arial,sans-serif]">
      <div className="h-dvh min-h-[698px] w-full overflow-auto bg-white">
        <div className="explorer-shell flex h-[698px] min-w-[1481px] border border-[#e5e5e5] bg-white">
          <aside
            className={`resource-sidebar flex shrink-0 flex-col rounded border-r border-[#e5e5e5] bg-white transition-[width] duration-200 ${
              isSidebarCollapsed ? "w-12" : "w-[246px]"
            }`}
          >
            <div className="flex h-14 items-center justify-between border-b border-[#f1f1f1] bg-[#fcfcfc] px-3">
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
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-black/[0.04]"
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
              <label className="flex h-8 items-center gap-1 rounded border border-[#ebebeb] bg-black/[0.02] px-2">
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

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
            <header className="flex h-14 items-center justify-between border-b border-[#f1f1f1] bg-[#fcfcfc] px-3">
              <div className="flex items-center gap-1 text-[13px]">
                <Icon path={icons[activeResource.type]} />
                <span className="font-medium">{activeResource.name}</span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="text-[#3a3a3a]">
                  Mis à jour le 13 octobre 2022
                </span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="text-[#3a3a3a]">{activeResource.size}</span>
                <span className="text-[#3a3a3a]">·</span>
                <FormatTag>{activeResource.format}</FormatTag>
                <span className="text-[#3a3a3a]">·</span>
                <Icon path={icons.download} className="h-3 w-3 text-[#3a3a3a]" />
                <span className="text-[#3a3a3a]">234</span>
              </div>

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
                    className="relative z-30 flex h-8 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-white"
                  >
                    <Icon path={icons.download} className="h-4 w-4 text-white" />
                    Télécharger
                  </button>
                  {isDownloadMenuOpen ? (
                    <DownloadMenu onClose={() => setIsDownloadMenuOpen(false)} />
                  ) : null}
                </div>
                <button
                  aria-label="Agrandir"
                  className="flex h-8 w-8 items-center justify-center border border-[#dddddd] bg-white"
                >
                  <Icon path={icons.expand} />
                </button>
              </div>
            </header>

            <div className="flex h-12 items-center border-b border-[#f1f1f1] bg-white px-2">
              <div className="flex flex-wrap items-center rounded border border-[#e5e5e5]">
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
            <div className="flex h-12 items-center justify-between border-b border-[#f1f1f1] bg-white px-2">
              <div className="flex items-center gap-2">
                <label className="flex h-8 w-[200px] items-center gap-1 rounded border border-[#ebebeb] bg-black/[0.02] px-2">
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
                    className="flex h-6 cursor-pointer items-center gap-1 rounded px-1 hover:bg-black/[0.04]"
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

              <div className="h-full overflow-auto">
                <div className="flex h-8 w-max min-w-full bg-[#fcfcfc]">
                  {visibleColumns.map((column) => (
                    <HeaderCell
                      key={column.key}
                      column={column}
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
                    />
                  ))}
                </div>

                {visibleColumns.length === 0 ? (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-[#fcfcfc] p-4 text-center text-[16px] leading-6">
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
                      className="flex h-8 w-max min-w-full bg-white"
                    >
                      {visibleColumns.map((column) => (
                        <DataCell
                          key={column.key}
                          id={`${row.id}-${column.key}`}
                          value={getRowValue(row, column.key)}
                          type={column.type}
                          width={column.width}
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
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 bg-[#fcfcfc] p-4 text-center text-[16px] leading-6">
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
