"use client";

import Image from "next/image";
import Link from "next/link";
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
    id: "resultats_electoraux",
    name: "Résultats électoraux consolidés",
    size: "67,5 Mo",
    format: "PARQUET",
    updatedAt: "1 juillet 2026",
    downloads: 0,
    type: "table",
    tabs: ["Aperçu", "Description", "Structure des données", "Métadonnées", "API"],
  },
  {
    id: "deces",
    name: "Fichier des personnes décédées",
    size: "657,9 Mo",
    format: "PARQUET",
    updatedAt: "3 juillet 2026",
    downloads: 0,
    type: "table",
    tabs: ["Aperçu", "Description", "Structure des données", "Métadonnées", "API"],
  },
];

const downloadGroups = [
  {
    title: "FORMAT ORIGINAL",
    items: [
      { label: "Résultats électoraux consolidés", size: "67,5 Mo" },
      { label: "Fichier des personnes décédées", size: "657,9 Mo" },
    ],
    closable: true,
  },
  {
    title: "LIEN SOURCE",
    items: [
      { label: "data.gouv.fr/api/1/datasets/r/ff16d511...", size: "Parquet" },
      { label: "data.gouv.fr/api/1/datasets/r/d7aed239...", size: "Parquet" },
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
    key: "idElection",
    label: "id_election",
    icon: "identifier",
    width: "w-[136px]",
    widthPx: 136,
    filter: "category",
    type: "identifier",
  },
  {
    key: "idBrutMiom",
    label: "id_brut_miom",
    icon: "identifier",
    width: "w-[132px]",
    widthPx: 132,
    filter: "category",
    type: "identifier",
  },
  {
    key: "codeDepartement",
    label: "code_departement",
    icon: "referenceData",
    width: "w-[144px]",
    widthPx: 144,
    filter: "category",
    type: "referenceData",
  },
  {
    key: "libelleDepartement",
    label: "libelle_departement",
    icon: "reference",
    width: "w-[168px]",
    widthPx: 168,
    filter: "category",
    type: "reference",
  },
  {
    key: "codeCommune",
    label: "code_commune",
    icon: "identifier",
    width: "w-[132px]",
    widthPx: 132,
    filter: "category",
    type: "identifier",
  },
  {
    key: "libelleCommune",
    label: "libelle_commune",
    icon: "reference",
    width: "w-[168px]",
    widthPx: 168,
    filter: "category",
    type: "reference",
  },
  {
    key: "codeBv",
    label: "code_bv",
    icon: "identifier",
    width: "w-[104px]",
    widthPx: 104,
    filter: "category",
    type: "identifier",
  },
  {
    key: "inscrits",
    label: "inscrits",
    icon: "number",
    width: "w-[104px]",
    widthPx: 104,
    filter: "number",
    type: "number",
  },
  {
    key: "abstentions",
    label: "abstentions",
    icon: "number",
    width: "w-[116px]",
    widthPx: 116,
    filter: "number",
    type: "number",
  },
  {
    key: "votants",
    label: "votants",
    icon: "number",
    width: "w-[104px]",
    widthPx: 104,
    filter: "number",
    type: "number",
  },
  {
    key: "blancs",
    label: "blancs",
    icon: "number",
    width: "w-[96px]",
    widthPx: 96,
    filter: "number",
    type: "number",
  },
  {
    key: "nuls",
    label: "nuls",
    icon: "number",
    width: "w-[88px]",
    widthPx: 88,
    filter: "number",
    type: "number",
  },
  {
    key: "exprimes",
    label: "exprimes",
    icon: "number",
    width: "w-[104px]",
    widthPx: 104,
    filter: "number",
    type: "number",
  },
  {
    key: "ratioAbstentionsInscrits",
    label: "ratio_abstentions_inscrits",
    icon: "number",
    width: "w-[196px]",
    widthPx: 196,
    filter: "number",
    type: "number",
  },
  {
    key: "ratioVotantsInscrits",
    label: "ratio_votants_inscrits",
    icon: "number",
    width: "w-[176px]",
    widthPx: 176,
    filter: "number",
    type: "number",
  },
  {
    key: "ratioExprimesVotants",
    label: "ratio_exprimes_votants",
    icon: "number",
    width: "w-[184px]",
    widthPx: 184,
    filter: "number",
    type: "number",
  },
];

type ColumnKey = string;
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

const departmentReferences = [
  { code: "01", label: "Ain" },
  { code: "02", label: "Aisne" },
  { code: "59", label: "Nord" },
  { code: "75", label: "Paris" },
  { code: "971", label: "Guadeloupe" },
  { code: "976", label: "Mayotte" },
  { code: "ZZ", label: "Français établis hors de France" },
];

const electionIds = [
  "2002_pres_t1",
  "2002_pres_t2",
  "2007_pres_t1",
  "2007_pres_t2",
  "2012_pres_t1",
  "2014_muni_t1",
  "2015_dpmt_t2",
  "2026_muni_t212_pres_t1",
];

const electoralCommunes = [
  { code: "01001", label: "Abergement-Clémenciat", department: "01" },
  { code: "01004", label: "Ambérieu-en-Bugey", department: "01" },
  { code: "02722", label: "Soissons", department: "02" },
  { code: "59350", label: "Lille", department: "59" },
  { code: "75056", label: "Paris", department: "75" },
  { code: "97105", label: "Basse-Terre", department: "971" },
  { code: "97617", label: "Mamoudzou", department: "976" },
  { code: "ZZ011", label: "A?Cirits-Camou-Suhast", department: "ZZ" },
];

const rows: Row[] = Array.from({ length: 30 }, (_, index) => {
  const rank = index + 1;
  const electionId = electionIds[index % electionIds.length];
  const commune = electoralCommunes[index % electoralCommunes.length];
  const departmentReference =
    departmentReferences.find((department) => department.code === commune.department) ??
    departmentReferences[0];
  const inscrits = 420 + index * 137;
  const abstentions = Math.round(inscrits * (0.18 + (index % 7) * 0.025));
  const votants = inscrits - abstentions;
  const blancs = Math.round(votants * (0.012 + (index % 3) * 0.004));
  const nuls = Math.round(votants * (0.008 + (index % 4) * 0.003));
  const exprimes = votants - blancs - nuls;

  return {
    idElection: electionId,
    idBrutMiom: `${commune.code}_${String(rank).padStart(4, "0")}`,
    codeDepartement: departmentReference.code,
    libelleDepartement: departmentReference.label,
    codeCommune: commune.code,
    libelleCommune: commune.label,
    codeBv: String((rank % 32) + 1).padStart(4, "0"),
    inscrits: String(inscrits),
    abstentions: String(abstentions),
    votants: String(votants),
    blancs: String(blancs),
    nuls: String(nuls),
    exprimes: String(exprimes),
    ratioAbstentionsInscrits: ((abstentions / inscrits) * 100).toFixed(2),
    ratioVotantsInscrits: ((votants / inscrits) * 100).toFixed(2),
    ratioExprimesVotants: ((exprimes / votants) * 100).toFixed(2),
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
  codeAi: RiCodeAiLine,
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
    <div className="flex h-[58px] shrink-0 items-center justify-between gap-2 border-b border-[#E5E5E5] bg-[#f6f6f6]/95 px-3 backdrop-blur-[5px] sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[2px] border border-[#E5E5E5] bg-[#FFFFFF] p-1">
          <div className="flex h-full w-full items-center justify-center rounded-[1px] border border-[#eeeeee] text-[8px] font-bold leading-3 text-[#000091]">
            DG
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-1 text-[13px] leading-[1.4] sm:text-[16px]">
          <span className="min-w-0 truncate text-[#161616]">
            Direction interministérielle du numérique
          </span>
          <span className="shrink-0 text-[#161616]">/</span>
          <span className="min-w-0 truncate font-bold text-[#161616]">
            Annuaire de l’éducation
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
  const categoryOptions = getCategoryOptions(column.key).filter((option) =>
    option.label.toLowerCase().includes(normalizedSearch),
  );
  const range = numberRanges[column.key] ?? { min: "", max: "" };
  const bounds =
    column.filter === "number" ? getNumberStats(column) : { min: 0, max: 0 };
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
                  placeholder={String(bounds.min)}
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
                  placeholder={String(bounds.max)}
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
  onClose,
}: {
  isOpen: boolean;
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
  onClearAll: () => void;
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
                isOpen={openColumnKey === column.key}
                sortState={sortState}
                categoryFilters={categoryFilters}
                filterSearches={filterSearches}
                numberRanges={numberRanges}
                dateFilters={dateFilters}
                onToggleOpen={() =>
                  setOpenColumnKey((current) =>
                    current === column.key ? null : column.key,
                  )
                }
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

type AgentResponse = {
  intent: AssistantIntent;
  answer: string;
  reasoning?: string;
  sql?: string;
  columnsUsed?: string[];
  chart?: AssistantChartSpec;
  queryRows?: Record<string, unknown>[];
  toolTrace?: {
    tool: "get_resource_context" | "execute_query" | "create_chart";
    summary: string;
    show?: boolean;
  }[];
  proposedAction: AssistantProposedAction;
  needsClarification?: boolean;
  clarificationOptions?: AssistantFilterPayload[];
  model?: string;
  status: "success" | "ambiguous" | "empty" | "unable" | "error";
};

type AssistantChartSpec = {
  type: "bar" | "line" | "histogram" | "map";
  title: string;
  xKey: string;
  yKey: string;
  data: Record<string, unknown>[];
};

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AgentResponse;
};

type AssistantConversationContext = {
  filters: AssistantFilterPayload[];
  lastIntent?: AssistantIntent;
};

type AssistantActionHandlers = {
  onApplyFilter: (filters: AssistantFilterPayload[]) => void;
  onApplySort: (sort: AssistantSortPayload) => void;
};

function getAssistantStarterQuestions() {
  const hasGeography = tableColumns.some((column) =>
    ["codeDepartement", "libelleDepartement", "codeCommune", "libelleCommune"].includes(
      column.key,
    ),
  );
  const hasElectionYears = rows.some((row) => /\b(19|20)\d{2}\b/.test(row.idElection));
  const hasCategories = tableColumns.some((column) =>
    ["category", "reference", "referenceData", "identifier"].includes(column.type),
  );

  return [
    "Explique-moi la structure du dataset",
    "Quelles sont les colonnes importantes ?",
    hasElectionYears ? "Quelle période couvre ce jeu de données ?" : null,
    hasGeography ? "Quels territoires sont couverts ?" : null,
    hasCategories ? "Quelles sont les valeurs les plus fréquentes ?" : null,
    "Quelles colonnes contiennent le plus de valeurs manquantes ?",
    hasCategories ? "Fais un graphique des principales catégories" : null,
  ].filter(Boolean) as string[];
}

const assistantLoadingSteps = [
  "Lecture du schéma",
  "Analyse des valeurs",
  "Préparation de l’action",
];

function normalizeAssistantText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeSqlValue(value: string) {
  return value.replace(/'/g, "''");
}

function buildFilterSql(filters: AssistantFilterPayload[]) {
  return `SELECT *\nFROM resultats_electoraux\nWHERE ${filters
    .map((filter) => `${filter.label} = '${escapeSqlValue(filter.value)}'`)
    .join("\n  AND ")};`;
}

function countRowsMatchingFilters(filters: AssistantFilterPayload[]) {
  return rows.filter((row) =>
    filters.every((filter) => getRowValue(row, filter.key) === filter.value),
  ).length;
}

function getColumnByLabelOrKey(value: string) {
  const normalizedValue = normalizeAssistantText(value);

  return tableColumns.find(
    (column) =>
      normalizeAssistantText(column.key) === normalizedValue ||
      normalizeAssistantText(column.label) === normalizedValue,
  );
}

function getColumnCoverageSummary() {
  const typeCounts = tableColumns.reduce<Record<ColumnType, number>>(
    (accumulator, column) => {
      accumulator[column.type] = (accumulator[column.type] ?? 0) + 1;

      return accumulator;
    },
    {
      identifier: 0,
      referenceData: 0,
      reference: 0,
      category: 0,
      number: 0,
      date: 0,
      text: 0,
    },
  );

  return `${tableColumns.length} colonnes, ${rows.length} lignes disponibles dans l’aperçu, dont ${typeCounts.number} colonnes numériques, ${typeCounts.identifier} identifiants et ${typeCounts.reference + typeCounts.referenceData} colonnes territoriales ou référentielles.`;
}

function buildStructureAnswer(question: string): AgentResponse {
  const importantColumns = [
    "id_election",
    "libelle_departement",
    "libelle_commune",
    "inscrits",
    "votants",
    "exprimes",
    "ratio_abstentions_inscrits",
  ];
  const normalizedQuestion = normalizeAssistantText(question);
  const asksImportantColumns =
    normalizedQuestion.includes("colonnes importantes") ||
    normalizedQuestion.includes("importantes");
  const answer = asksImportantColumns
    ? `Les colonnes les plus utiles sont ${importantColumns.join(", ")}. Elles permettent d’identifier l’élection, le territoire et les principaux volumes de participation.`
    : `Cette ressource contient des résultats électoraux consolidés. Elle expose ${getColumnCoverageSummary()}`;

  return {
    intent: "explain_structure",
    answer,
    columnsUsed: asksImportantColumns ? importantColumns : tableColumns.map((column) => column.label),
    proposedAction: { type: "none" },
    status: "success",
  };
}

function buildFrequentValuesAnswer(): AgentResponse {
  const columns = ["idElection", "libelleDepartement", "libelleCommune"]
    .map(getColumnByLabelOrKey)
    .filter(Boolean) as TableColumn[];
  const summary = columns
    .map((column) => {
      const values = getColumnFrequentValues(column)
        .slice(0, 3)
        .map((item) => `${item.label} ${item.value}`)
        .join(", ");

      return `${column.label} : ${values}`;
    })
    .join("\n");

  return {
    intent: "aggregate",
    answer: `Les valeurs les plus fréquentes dans l’aperçu sont :\n${summary}`,
    columnsUsed: columns.map((column) => column.label),
    proposedAction: { type: "none" },
    status: "success",
  };
}

function buildYearsAnswer(): AgentResponse {
  const years = Array.from(
    new Set(
      rows
        .map((row) => getRowValue(row, "idElection").match(/\d{4}/)?.[0])
        .filter(Boolean),
    ),
  ).sort();

  return {
    intent: "aggregate",
    answer: `Les années visibles dans l’aperçu sont ${years.join(", ")}.`,
    sql: "SELECT DISTINCT regexp_extract(id_election, '\\d{4}') AS annee\nFROM resultats_electoraux\nORDER BY annee;",
    columnsUsed: ["id_election"],
    proposedAction: { type: "none" },
    status: "success",
  };
}

function buildTerritoriesAnswer(): AgentResponse {
  const departments = getColumnFrequentValues(tableColumns[3])
    .map((item) => item.label)
    .join(", ");
  const communes = getColumnFrequentValues(tableColumns[5])
    .slice(0, 5)
    .map((item) => item.label)
    .join(", ");

  return {
    intent: "aggregate",
    answer: `Les territoires couverts dans l’aperçu incluent les départements ${departments}. Les communes les plus représentées incluent ${communes}.`,
    columnsUsed: ["libelle_departement", "libelle_commune"],
    proposedAction: { type: "none" },
    status: "success",
  };
}

function buildHighestValuesAnswer(): AgentResponse {
  const numericColumns = tableColumns.filter((column) => column.type === "number");
  const highest = numericColumns
    .map((column) => {
      const stats = getNumberStats(column);

      return `${column.label} : maximum ${stats.max}`;
    })
    .slice(0, 6)
    .join(", ");

  return {
    intent: "aggregate",
    answer: `Voici les valeurs les plus élevées observées : ${highest}.`,
    columnsUsed: numericColumns.slice(0, 6).map((column) => column.label),
    proposedAction: {
      type: "apply_sort",
      payload: {
        key: "inscrits",
        label: "inscrits",
        direction: "desc",
      },
    },
    status: "success",
  };
}

function findAssistantMatches(question: string) {
  const normalizedQuestion = normalizeAssistantText(question);
  const matches: AssistantFilterPayload[] = [];

  tableColumns
    .filter((column) => column.type !== "number")
    .forEach((column) => {
      const counts = rows.reduce<Map<string, number>>((accumulator, row) => {
        const value = getRowValue(row, column.key);

        if (normalizedQuestion.includes(normalizeAssistantText(value))) {
          accumulator.set(value, (accumulator.get(value) ?? 0) + 1);
        }

        return accumulator;
      }, new Map<string, number>());

      counts.forEach((count, value) => {
        matches.push({
          key: column.key,
          label: column.label,
          value,
          type: column.type,
          count,
        });
      });
    });

  return matches;
}

function findYearFilter(question: string): AssistantFilterPayload | null {
  const year = question.match(/\b(19|20)\d{2}\b/)?.[0];

  if (!year) {
    return null;
  }

  const count = rows.filter((row) => getRowValue(row, "idElection").includes(year)).length;

  return {
    key: "idElection",
    label: "id_election",
    value: year,
    type: "identifier",
    count,
  };
}

function answerAssistantQuestion({
  question,
  context,
}: {
  question: string;
  context: AssistantConversationContext;
}): AgentResponse {
  const startedAt = performance.now();
  const normalizedQuestion = normalizeAssistantText(question);
  let response: AgentResponse;

  if (
    normalizedQuestion.includes("structure") ||
    normalizedQuestion.includes("colonnes") ||
    normalizedQuestion.includes("dataset") ||
    normalizedQuestion.includes("jeu de donnees") ||
    normalizedQuestion.includes("contient")
  ) {
    response = buildStructureAnswer(question);
  } else if (normalizedQuestion.includes("frequent")) {
    response = buildFrequentValuesAnswer();
  } else if (normalizedQuestion.includes("annees") || /\b(19|20)\d{2}\b/.test(question)) {
    const yearFilter = findYearFilter(question);
    const filters = yearFilter
      ? [...context.filters.filter((filter) => filter.key !== yearFilter.key), yearFilter]
      : context.filters;
    const count = yearFilter ? countRowsMatchingFilters(filters) : 0;

    response =
      yearFilter && context.filters.length > 0
        ? {
            intent: "search_rows",
            answer:
              count > 0
                ? `J’ai trouvé ${count} lignes correspondant à ${filters.map((filter) => `${filter.label} = ${filter.value}`).join(" et ")}.`
                : `Je n’ai trouvé aucune ligne correspondant à ${filters.map((filter) => `${filter.label} = ${filter.value}`).join(" et ")}.`,
            sql: buildFilterSql(filters),
            columnsUsed: filters.map((filter) => filter.label),
            proposedAction: { type: "apply_filter", payload: { filters } },
            status: count > 0 ? "success" : "empty",
          }
        : buildYearsAnswer();
  } else if (
    normalizedQuestion.includes("territoires") ||
    normalizedQuestion.includes("departements") ||
    normalizedQuestion.includes("communes")
  ) {
    response = buildTerritoriesAnswer();
  } else if (
    normalizedQuestion.includes("plus elevees") ||
    normalizedQuestion.includes("maximum") ||
    normalizedQuestion.includes("plus haut")
  ) {
    response = buildHighestValuesAnswer();
  } else {
    const matches = findAssistantMatches(question);

    if (matches.length > 1 && new Set(matches.map((match) => match.key)).size > 1) {
      response = {
        intent: "clarify",
        answer: `J’ai trouvé des correspondances pour cette question dans plusieurs colonnes. Laquelle voulez-vous explorer ?`,
        columnsUsed: matches.map((match) => match.label),
        proposedAction: { type: "none" },
        needsClarification: true,
        clarificationOptions: matches,
        status: "ambiguous",
      };
    } else if (matches.length === 1) {
      const filters = [
        ...context.filters.filter((filter) => filter.key !== matches[0].key),
        matches[0],
      ];
      const count = countRowsMatchingFilters(filters);

      response = {
        intent: "search_rows",
        answer:
          count > 0
            ? `J’ai trouvé ${count} lignes correspondant à ${matches[0].value} dans la colonne ${matches[0].label}.`
            : `Je n’ai trouvé aucune ligne correspondant à ${matches[0].value} dans la colonne ${matches[0].label}.`,
        sql: buildFilterSql(filters),
        columnsUsed: filters.map((filter) => filter.label),
        proposedAction: { type: "apply_filter", payload: { filters } },
        status: count > 0 ? "success" : "empty",
      };
    } else {
      response = {
        intent: "unable",
        answer:
          "Je n’ai pas trouvé de correspondance exploitable dans les données déjà disponibles. Essayez une commune, un département, une année ou une question sur la structure.",
        proposedAction: { type: "none" },
        status: "unable",
      };
    }
  }

  console.info("prototype-assistant-log", {
    resource_id: "resultats_electoraux",
    dataset_id: "resultats-electoraux-consolides",
    question,
    intent: response.intent,
    sql: response.sql,
    status: response.status,
    duration_ms: Math.round(performance.now() - startedAt),
  });

  return response;
}

function ModelTokenUsage({
  model,
  used,
  limit,
}: {
  model: string;
  used: number;
  limit: number;
}) {
  const percentUsed = Math.min(100, Math.round((used / limit) * 100));
  const circumference = 2 * Math.PI * 7;
  const strokeDashoffset = circumference * (1 - percentUsed / 100);

  return (
    <div className="flex h-6 items-center gap-1 text-[13px] leading-[1.4] text-[#5d5d5d]">
      <details className="relative">
        <summary
          className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded hover:bg-[#eeeeee] [&::-webkit-details-marker]:hidden"
          aria-label={`${percentUsed}% des tokens utilisés`}
          title="Tokens utilisés"
        >
          <span className="relative flex h-4 w-4 items-center justify-center">
            <svg
              aria-hidden="true"
              className="h-4 w-4 -rotate-90"
              viewBox="0 0 18 18"
            >
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="none"
                stroke="#dddddd"
                strokeWidth="2"
              />
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="none"
                stroke="#000091"
                strokeLinecap="round"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className="absolute h-1.5 w-1.5 rounded-full bg-[#5d5d5d]" />
          </span>
        </summary>
        <div className="absolute bottom-7 left-0 z-20 w-[184px] rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2 shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between text-[11px] leading-4 text-[#5d5d5d]">
            <span>Tokens utilisés</span>
            <span>{percentUsed}%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded bg-[#eeeeee]">
            <div
              className="h-full rounded bg-[#000091]"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] leading-4 text-[#5d5d5d]">
            {used.toLocaleString("fr-FR")} / {limit.toLocaleString("fr-FR")}
          </p>
        </div>
      </details>
      <details className="relative">
        <summary className="flex h-6 cursor-pointer list-none items-center rounded px-1 hover:bg-[#eeeeee] [&::-webkit-details-marker]:hidden">
          {model}
        </summary>
        <div className="absolute bottom-7 left-0 z-20 w-[148px] rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2 text-[11px] leading-4 text-[#5d5d5d] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">
          Modèle actif
        </div>
      </details>
    </div>
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
  return splitMarkdownTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function renderAssistantMarkdown(content: string) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const nextLine = lines[index + 1];

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
          <table className="min-w-full border-collapse text-left text-[12px] leading-5">
            <thead className="bg-[#f6f6f6] text-[#161616]">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="border-b border-r border-[#E5E5E5] px-2 py-1 font-medium last:border-r-0"
                  >
                    {header}
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
                      className="border-b border-r border-[#E5E5E5] px-2 py-1 text-[#3a3a3a] last:border-r-0"
                    >
                      {row[cellIndex] ?? ""}
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

    if (line.trim()) {
      nodes.push(
        <p key={`p-${index}`} className="whitespace-pre-wrap">
          {line}
        </p>,
      );
    }

    index += 1;
  }

  return nodes.length > 0 ? nodes : content;
}

function AssistantChart({ chart }: { chart: AssistantChartSpec }) {
  const values = chart.data
    .map((item) => Number(item[chart.yKey]))
    .filter((value) => Number.isFinite(value));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[12px] font-medium text-[#161616]">
          {chart.title}
        </p>
        <span className="shrink-0 rounded bg-[#f6f6f6] px-1.5 py-0.5 text-[11px] text-[#5d5d5d]">
          {chart.type}
        </span>
      </div>
      <div className="space-y-2">
        {chart.data.slice(0, 8).map((item, index) => {
          const label = String(item[chart.xKey] ?? `Valeur ${index + 1}`);
          const value = Number(item[chart.yKey]);
          const percent = Number.isFinite(value)
            ? Math.max(4, Math.round((value / maxValue) * 100))
            : 4;

          return (
            <div key={`${label}-${index}`} className="grid grid-cols-[96px_minmax(0,1fr)_44px] items-center gap-2 text-[11px] leading-4">
              <span className="truncate text-[#5d5d5d]">{label}</span>
              <div className="h-1.5 overflow-hidden rounded bg-[#eeeeee]">
                <div
                  className="h-full rounded bg-[#000091]"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-right text-[#3a3a3a]">
                {Number.isFinite(value) ? value.toLocaleString("fr-FR") : "-"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatSidebar({
  activeResource,
  previewRows,
  conversationContext,
  onApplyFilter,
  onApplySort,
  onClose,
}: {
  activeResource: Resource;
  previewRows: Row[];
  conversationContext: AssistantConversationContext;
  onApplyFilter: AssistantActionHandlers["onApplyFilter"];
  onApplySort: AssistantActionHandlers["onApplySort"];
  onClose: () => void;
}) {
  const [agentQuestion, setAgentQuestion] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [appliedActionMessageIds, setAppliedActionMessageIds] = useState<
    string[]
  >([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [localContext, setLocalContext] =
    useState<AssistantConversationContext>(conversationContext);
  const starterQuestions = useMemo(() => getAssistantStarterQuestions(), []);

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
      status: response.status ?? "success",
    };
  }

  function applyResponseAction(response: AgentResponse, messageId?: string) {
    if (response.proposedAction.type === "apply_filter") {
      onApplyFilter(response.proposedAction.payload.filters);
      if (messageId) {
        setAppliedActionMessageIds((current) =>
          current.includes(messageId) ? current : [...current, messageId],
        );
      }
      setLocalContext({
        filters: response.proposedAction.payload.filters,
        lastIntent: response.intent,
      });
      return;
    }

    if (response.proposedAction.type === "apply_sort") {
      onApplySort(response.proposedAction.payload);
      if (messageId) {
        setAppliedActionMessageIds((current) =>
          current.includes(messageId) ? current : [...current, messageId],
        );
      }
      setLocalContext((current) => ({
        ...current,
        lastIntent: response.intent,
      }));
    }
  }

  function submitAgentQuestion(nextQuestion = agentQuestion) {
    const question = nextQuestion.trim();

    if (!question || isAgentLoading) {
      return;
    }

    setIsAgentLoading(true);
    setLoadingStepIndex(0);
    setAgentQuestion("");

    const loadingInterval = window.setInterval(() => {
      setLoadingStepIndex((current) =>
        current >= assistantLoadingSteps.length - 1 ? current : current + 1,
      );
    }, 260);

    window.setTimeout(() => {
      window.clearInterval(loadingInterval);
      void (async () => {
        let response: AgentResponse;

        try {
          const apiResponse = await fetch(
            "/api/prototypes/explorateur-sql-et-ia/agent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                question,
                resourceName: activeResource.name,
                resourceId: activeResource.id,
                tableName: activeResource.id,
                columns: tableColumns.map((column) => column.label),
                previewRows,
                conversationHistory: messages.slice(-8).map((message) => ({
                  role: message.role,
                  content: message.content,
                })),
              }),
            },
          );
          const data = (await apiResponse.json()) as Partial<AgentResponse> & {
            error?: string;
          };

          if (!apiResponse.ok) {
            throw new Error(data.error ?? "Impossible d’interroger le modèle.");
          }

          response = normalizeRemoteResponse(data);
        } catch (error) {
          const fallbackResponse = answerAssistantQuestion({
            question,
            context: localContext,
          });
          response = {
            ...fallbackResponse,
            reasoning:
              error instanceof Error
                ? `Réponse locale de secours : ${error.message}`
                : "Réponse locale de secours.",
            status:
              fallbackResponse.status === "success"
                ? "success"
                : fallbackResponse.status,
          };
        }

        const userMessageId = `user-${Date.now()}`;
        const assistantMessageId = `assistant-${Date.now()}`;
        const nextMessages: AssistantMessage[] = [
          {
            id: userMessageId,
            role: "user",
            content: question,
          },
          {
            id: assistantMessageId,
            role: "assistant",
            content: response.answer,
            response,
          },
        ];

        setMessages((current) => [...current, ...nextMessages]);
        if (response.proposedAction.type === "apply_filter") {
          applyResponseAction(response, assistantMessageId);
        } else {
          setLocalContext((current) => ({
            ...current,
            lastIntent: response.intent,
          }));
        }
        setIsAgentLoading(false);
      })();
    }, 500);
  }

  return (
    <aside
      className="chat-sidebar flex w-[400px] shrink-0 flex-col overflow-hidden border-l border-[#E5E5E5] bg-[#FFFFFF]"
      data-active-resource={activeResource.id}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#F1F1F1] bg-[#fcfcfc] px-3">
        <p className="min-w-0 truncate text-[13px] font-medium leading-[1.4] text-[#161616]">
          Interroger ces données
        </p>
        <button
          type="button"
          aria-label="Fermer l’assistant"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded text-[#161616] transition-colors hover:bg-[#eeeeee]"
        >
          <Icon path={icons.sidebarFold} className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#FFFFFF] px-2 py-3">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col justify-end pb-2">
            <p className="px-2 text-[14px] font-medium leading-[1.4] text-[#161616]">
              Comment puis-je vous aider
            </p>
            <p className="mt-1 px-2 text-[13px] leading-[1.4] text-[#5d5d5d]">
              Vous pouvez poser une question pour retrouver une information,
              résumer les données, comprendre la structure ou générer une
              visualisation.
            </p>
            <div className="mt-1 flex flex-col items-start gap-0.5">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submitAgentQuestion(question)}
                  className="min-h-6 cursor-pointer rounded px-2 py-0.5 text-left text-[14px] leading-[1.4] text-[#5d5d5d] transition-colors hover:bg-[#f6f6f6] hover:text-[#000091]"
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
                  <p className="max-w-[280px] rounded bg-[#e8edff] px-3 py-2 text-[13px] leading-5 text-[#000091]">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="space-y-2">
                  {message.response?.sql || message.response?.reasoning ? (
                    <details className="rounded border border-[#E5E5E5] bg-[#FFFFFF]">
                      <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[12px] font-medium text-[#3a3a3a]">
                        <Icon path={icons.brain} className="h-4 w-4 text-[#3a3a3a]" />
                        <span>Voir comment cette réponse a été calculée</span>
                      </summary>
                      <div className="border-t border-[#E5E5E5]">
                        {message.response.reasoning ? (
                          <p className="px-3 py-2 text-[12px] leading-5 text-[#3a3a3a]">
                            {message.response.reasoning}
                          </p>
                        ) : null}
                        {message.response.sql ? (
                          <pre className="overflow-auto bg-[#f6f6f6] p-3 font-mono text-[12px] leading-5 text-[#161616]">
                            {message.response.sql}
                          </pre>
                        ) : null}
                        {message.response.columnsUsed?.length ? (
                          <p className="px-3 pb-3 text-[12px] leading-5 text-[#3a3a3a]">
                            Colonnes utilisées : {message.response.columnsUsed.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    </details>
                  ) : null}
                  <div className="rounded border border-[#E5E5E5] bg-[#FFFFFF] p-3 text-[13px] leading-5 text-[#161616]">
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
                    <AssistantChart chart={message.response.chart} />
                  ) : null}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Réponse utile"
                      title="Réponse utile"
                      className="flex h-6 w-6 items-center justify-center rounded text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#000091]"
                    >
                      <Icon path={icons.thumbUp} className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Réponse inutile"
                      title="Réponse inutile"
                      className="flex h-6 w-6 items-center justify-center rounded text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#000091]"
                    >
                      <Icon path={icons.thumbDown} className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ),
            )}
            {isAgentLoading ? (
              <div className="rounded border border-[#E5E5E5] bg-[#f6f6f6] p-3">
                <p className="mb-2 text-[12px] font-bold uppercase leading-4 text-[#666666]">
                  Analyse en cours
                </p>
                <div className="space-y-2">
                  {assistantLoadingSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2 text-[13px] leading-5 ${
                        index <= loadingStepIndex
                          ? "text-[#000091]"
                          : "text-[#666666]"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          index < loadingStepIndex
                            ? "bg-[#18753c]"
                            : index === loadingStepIndex
                              ? "bg-[#000091]"
                              : "bg-[#CECECE]"
                        }`}
                      />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form
        className="shrink-0 bg-[#FFFFFF] px-2 pb-1"
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
            placeholder="posez une question en langage naturel"
            className="min-h-0 flex-1 resize-none bg-transparent text-[13px] leading-[1.4] text-[#161616] outline-none placeholder:text-[#3a3a3a]"
          />
          <div className="flex items-center justify-between">
            <ModelTokenUsage model="gpt-oss-120b" used={18320} limit={32000} />
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
        <div className="flex min-h-5 items-center justify-end gap-1 pt-1 text-right text-[11px] leading-none text-[#5d5d5d]">
          <span>L’assistant peut faire des erreurs.</span>
          <Link
            href="/a-propos"
            className="underline decoration-solid underline-offset-2 hover:text-[#000091]"
          >
            En savoir plus
          </Link>
          <Icon path={icons.externalLink} className="h-2.5 w-2.5 shrink-0" />
        </div>
      </form>
    </aside>
  );
}

export default function ExplorateurSqlEtIaPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState("resultats_electoraux");
  const [resourceSearchQuery, setResourceSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ColumnKey | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [activeTab, setActiveTab] = useState<ExplorerTab>("Aperçu");
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
  const [isFilterFeedbackVisible, setIsFilterFeedbackVisible] = useState(false);

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
        if (!filter || !isDateFilterActive(filter)) {
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
    setIsMobileFiltersOpen(false);
    setIsMobileResourceMenuOpen(false);
    setIsDownloadMenuOpen(false);
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
    setActiveTab("Aperçu");
    setActiveFilter(null);
    setActiveCell(null);
    setIsMobileFiltersOpen(false);
    setIsColumnSelectorOpen(false);
    setIsFilterFeedbackVisible(true);
    window.setTimeout(() => setIsFilterFeedbackVisible(false), 1200);
  }

  function applyAssistantSort(sort: AssistantSortPayload) {
    setSortState({ key: sort.key, direction: sort.direction });
    setActiveTab("Aperçu");
    setActiveFilter(null);
    setActiveCell(null);
    setIsMobileFiltersOpen(false);
    setIsColumnSelectorOpen(false);
    setIsFilterFeedbackVisible(true);
    window.setTimeout(() => setIsFilterFeedbackVisible(false), 1200);
  }

  const assistantConversationContext = useMemo<AssistantConversationContext>(
    () => ({
      filters: Object.entries(categoryFilters).flatMap(([key, values]) => {
        const column = tableColumns.find((item) => item.key === key);

        if (!column || !values?.length) {
          return [];
        }

        return values.map((value) => ({
          key,
          label: column.label,
          value,
          type: column.type,
          count: rows.filter((row) => getRowValue(row, key) === value).length,
        }));
      }),
      lastIntent: undefined,
    }),
    [categoryFilters],
  );

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
                  onClick={() => {
                    setIsChatSidebarOpen((current) => !current);
                    setIsDownloadMenuOpen(false);
                    setIsColumnSelectorOpen(false);
                    setActiveFilter(null);
                    setActiveCell(null);
                  }}
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
            className={`resource-sidebar desktop-resource-sidebar shrink-0 flex-col rounded border-r border-[#E5E5E5] bg-[#FFFFFF] transition-[width] duration-200 ${
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
                          <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                            {mainResources.length} Fichiers principaux
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
                            />
                          ))}
                        </section>
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
                            />
                          ))}
                        </section>
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
                    onClick={() => {
                      setIsChatSidebarOpen((current) => !current);
                      setIsDownloadMenuOpen(false);
                      setIsColumnSelectorOpen(false);
                      setActiveFilter(null);
                      setActiveCell(null);
                    }}
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

            <div className="mobile-explorer-only h-12 items-center border-b border-[#E5E5E5] bg-[#FFFFFF] px-2">
              <label className="flex h-9 w-full items-center gap-2 rounded border border-[#E5E5E5] bg-[#FFFFFF] px-2">
                <select
                  value={activeTab}
                  onChange={(event) => {
                    setActiveTab(event.target.value as ExplorerTab);
                    setActiveFilter(null);
                    setActiveCell(null);
                    setIsColumnSelectorOpen(false);
                    setIsMobileFiltersOpen(false);
                    setIsDownloadMenuOpen(false);
                  }}
                  aria-label="Choisir une vue"
                  className="min-w-0 flex-1 appearance-none bg-transparent text-[13px] font-medium text-[#161616] outline-none"
                >
                  {activeResource.tabs.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
                <Icon path={icons.arrowDownS} className="h-4 w-4 shrink-0 text-[#3a3a3a]" />
              </label>
            </div>

            <div className="desktop-explorer-only h-12 items-center border-b border-[#E5E5E5] bg-[#FFFFFF] px-2">
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
                      setIsMobileFiltersOpen(false);
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
            <div className="flex min-h-12 flex-wrap items-center gap-2 border-b border-[#E5E5E5] bg-[#FFFFFF] px-2 py-2 lg:flex-nowrap lg:py-0">
              <div className="flex shrink-0 items-center gap-2">
                <label className="flex h-8 w-[220px] min-w-0 items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2">
                  <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    aria-label="Rechercher une valeur"
                    placeholder="Rechercher une valeur"
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
                  Dernière mise à jour de l’aperçu : 13/06/2024 17:51
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
                      Colonnes {visibleColumns.length} sur {tableColumns.length}
                    </span>
                    <span className="whitespace-nowrap sm:hidden">
                      {visibleColumns.length}/{tableColumns.length}
                    </span>
                    <Icon path={icons.arrowDownS} className="h-4 w-4 text-[#3a3a3a]" />
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
                  <span className="hidden whitespace-nowrap lg:inline">
                    Lignes {filteredRows.length} sur {rows.length}
                  </span>
                  <span className="whitespace-nowrap lg:hidden">
                    {filteredRows.length}/{rows.length}
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
                className="h-full overflow-auto"
                onScroll={(event: UIEvent<HTMLDivElement>) => {
                  const isScrolled = event.currentTarget.scrollTop > 0;

                  setHasTableScrolled((current) =>
                    current === isScrolled ? current : isScrolled,
                  );
                }}
              >
                {visibleColumns.length > 0 && filteredRows.length > 0 ? (
                  <div className="mobile-data-cards space-y-2 p-2">
                    {filteredRows.map((row) => (
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
                      className="desktop-data-table h-8 w-max min-w-full bg-[#FFFFFF]"
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
          {isChatSidebarOpen ? (
            <ChatSidebar
              activeResource={activeResource}
              previewRows={filteredRows.slice(0, 30)}
              conversationContext={assistantConversationContext}
              onApplyFilter={applyAssistantFilters}
              onApplySort={applyAssistantSort}
              onClose={() => setIsChatSidebarOpen(false)}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}
