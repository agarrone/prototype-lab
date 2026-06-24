"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiBook2Line,
  RiCalendarLine,
  RiCheckLine,
  RiCloseLine,
  RiDownloadLine,
  RiDatabase2Line,
  RiFileLine,
  RiFilterLine,
  RiFingerprintLine,
  RiFullscreenLine,
  RiHashtag,
  RiLayoutHorizontalLine,
  RiLayoutVerticalLine,
  RiMap2Line,
  RiPriceTag3Line,
  RiSearchLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiTableLine,
  RiTerminalLine,
  RiText,
} from "@remixicon/react";

type ResourceType = "table" | "code" | "geodata" | "documentation";

type Resource = {
  name: string;
  size: string;
  format: string;
  type: ResourceType;
  active?: boolean;
};

const resources: Resource[] = [
  { name: "Ecoles", size: "134mo", format: "CSV", type: "table", active: true },
  { name: "Résultats", size: "134mo", format: "CSV", type: "table" },
  { name: "Secteurs", size: "134mo", format: "GEOJSON", type: "geodata" },
  { name: "Schéma", size: "134mo", format: "JSON", type: "code" },
  { name: "Addition", size: "134mo", format: "XML", type: "code" },
];

const tableColumns = [
  {
    key: "id",
    label: "Identifiant",
    icon: "identifier",
    width: "w-[132px]",
    filter: "category",
    left: "left-2",
    type: "identifier",
  },
  {
    key: "nom",
    label: "Nom",
    icon: "text",
    width: "w-[176px]",
    filter: "category",
    left: "left-[140px]",
    type: "text",
  },
  {
    key: "type",
    label: "Type",
    icon: "category",
    width: "w-[120px]",
    filter: "category",
    left: "left-[316px]",
    type: "category",
  },
  {
    key: "datePublication",
    label: "Publication",
    icon: "calendar",
    width: "w-[132px]",
    filter: "date",
    left: "left-[436px]",
    type: "date",
  },
  {
    key: "lignes",
    label: "Lignes",
    icon: "number",
    width: "w-[120px]",
    filter: "number",
    left: "left-[568px]",
    type: "number",
  },
  {
    key: "scoreQualite",
    label: "Score",
    icon: "number",
    width: "w-[104px]",
    filter: "number",
    left: "left-[688px]",
    type: "number",
  },
  {
    key: "commune",
    label: "Commune",
    icon: "reference",
    width: "w-[148px]",
    filter: "category",
    left: "left-[792px]",
    type: "reference",
  },
  {
    key: "codeInsee",
    label: "Code INSEE",
    icon: "identifier",
    width: "w-[124px]",
    filter: "category",
    left: "left-[940px]",
    type: "identifier",
  },
  {
    key: "theme",
    label: "Thème",
    icon: "category",
    width: "w-[132px]",
    filter: "category",
    left: "left-[1064px]",
    type: "category",
  },
  {
    key: "producteur",
    label: "Producteur",
    icon: "reference",
    width: "w-[168px]",
    filter: "category",
    left: "left-[1196px]",
    type: "reference",
  },
] as const;

type ColumnKey = (typeof tableColumns)[number]["key"];
type ColumnType = (typeof tableColumns)[number]["type"];
type Row = Record<ColumnKey, string>;
type SortDirection = "asc" | "desc";
type SortState = {
  key: ColumnKey;
  direction: SortDirection;
} | null;

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

  return {
    id: `ds-${String(rank).padStart(4, "0")}`,
    nom: `Jeu de données ${category.toLowerCase()} ${rank}`,
    type: category,
    datePublication: `2024-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 27) + 1).padStart(2, "0")}`,
    lignes: String(1200 + index * 337),
    scoreQualite: String(48 + ((index * 7) % 52)),
    commune,
    codeInsee: String(75000 + index * 17),
    theme: themes[index % themes.length],
    producteur: producers[index % producers.length],
  };
});

function getRowValue(row: Row, key: ColumnKey) {
  return row[key];
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
  filter: RiFilterLine,
  geodata: RiMap2Line,
  check: RiCheckLine,
  close: RiCloseLine,
  arrowDown: RiArrowDownLine,
  arrowUp: RiArrowUpLine,
  identifier: RiFingerprintLine,
  number: RiHashtag,
  columns: RiLayoutVerticalLine,
  documentation: RiBook2Line,
  reference: RiDatabase2Line,
  rows: RiLayoutHorizontalLine,
  sidebarFold: RiSidebarFoldLine,
  sidebarUnfold: RiSidebarUnfoldLine,
  text: RiText,
} satisfies Record<string, RemixIconComponent>;

function FormatTag({ children }: { children: string }) {
  return (
    <span className="rounded bg-black/[0.04] px-2 py-0.5 font-mono text-[12px] leading-4 text-[#3a3a3a] [font-family:Inconsolata,ui-monospace,monospace]">
      {children}
    </span>
  );
}

function ResourceItem({
  resource,
}: {
  resource: (typeof resources)[number];
}) {
  return (
    <div
      className={`flex h-7 items-center gap-1 rounded px-1 py-1 ${
        resource.active ? "bg-black/[0.04]" : ""
      }`}
    >
      <Icon path={icons[resource.type]} />
      <div className="flex min-w-0 flex-1 items-center gap-0.5 whitespace-nowrap">
        <span
          className={`truncate text-[13px] ${
            resource.active ? "font-extrabold text-[#161616]" : "font-medium text-[#5d5d5d]"
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
    </div>
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
      className={`flex h-8 shrink-0 items-center justify-between border-r border-[#e5e5e5] px-2 ${column.width}`}
    >
      <div className="flex min-w-0 items-center gap-1">
        <Icon path={icons[column.icon]} />
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

function CategoryFilterMenu({
  id,
  label,
  left,
  selectedValues,
  sortState,
  onToggleValue,
  onSort,
  onClose,
}: {
  id: ColumnKey;
  label: string;
  left: string;
  selectedValues: string[];
  sortState: SortState;
  onToggleValue: (key: ColumnKey, value: string) => void;
  onSort: (key: ColumnKey, direction: SortDirection) => void;
  onClose: () => void;
}) {
  const options = getCategoryOptions(id);
  const column = tableColumns.find((item) => item.key === id);

  if (!column) {
    return null;
  }

  return (
    <div
      className={`filter-popover filter-popover-${id} absolute ${left} top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
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

      <div className="border-b border-[#e6e6e6] p-1">
        {options.map((option) => (
          <FilterOption
            key={option.label}
            label={option.label}
            count={option.count}
            checked={selectedValues.includes(option.label)}
            onToggle={() => onToggleValue(id, option.label)}
          />
        ))}
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
  left: string;
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
      className={`filter-popover filter-popover-${id} absolute ${left} top-8 z-20 flex w-[260px] flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
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
  left: string;
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
      className={`filter-popover filter-popover-${id} absolute ${left} top-8 z-20 flex w-[320px] flex-col overflow-hidden rounded border border-[#e6e6e6] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]`}
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
  sortState,
  categoryFilters,
  numberRanges,
  dateFilters,
  onToggleCategory,
  onChangeRange,
  onSort,
  onClearRange,
  onChangeDate,
  onClearDate,
  onClose,
}: {
  activeFilter: ColumnKey | null;
  sortState: SortState;
  categoryFilters: Partial<Record<ColumnKey, string[]>>;
  numberRanges: Partial<Record<ColumnKey, NumberRange>>;
  dateFilters: Partial<Record<ColumnKey, string>>;
  onToggleCategory: (key: ColumnKey, value: string) => void;
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

  if (column.filter === "number") {
    return (
      <NumberFilterMenu
        id={column.key}
        label="Nombre"
        left={column.left}
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
        left={column.left}
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
      left={column.left}
      selectedValues={categoryFilters[column.key] ?? []}
      sortState={sortState}
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

function DataCell({
  value,
  type,
  width,
}: {
  value: string;
  type: ColumnType;
  width: string;
}) {
  if (type === "category" || type === "reference") {
    return (
      <div
        className={`flex h-8 shrink-0 items-center border-r border-[#e5e5e5] px-2 ${width}`}
      >
        <span className="truncate rounded bg-black/[0.04] px-2 py-1 text-[12px] leading-3 text-[#6a6a6a]">
          {value}
        </span>
      </div>
    );
  }

  if (type === "identifier") {
    return (
      <div
        className={`flex h-8 shrink-0 items-center border-r border-[#e5e5e5] px-2 font-mono text-[12px] text-[#3a3a3a] [font-family:Inconsolata,ui-monospace,monospace] ${width}`}
      >
        <span className="truncate">{value}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex h-8 shrink-0 items-center border-r border-[#e5e5e5] px-2 text-[12px] text-[#161616] ${width} ${
        type === "number" ? "justify-end" : "justify-start"
      }`}
    >
      <span className="truncate">{value}</span>
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

export default function ExplorateurPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ColumnKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortState, setSortState] = useState<SortState>(null);
  const [categoryFilters, setCategoryFilters] = useState<
    Partial<Record<ColumnKey, string[]>>
  >({});
  const [numberRanges, setNumberRanges] = useState<
    Partial<Record<ColumnKey, NumberRange>>
  >({});
  const [dateFilters, setDateFilters] = useState<
    Partial<Record<ColumnKey, string>>
  >({});

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
    setNumberRanges({});
    setDateFilters({});
    setActiveFilter(null);
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
              <div className="flex h-8 items-center gap-1 rounded border border-[#ebebeb] bg-black/[0.02] px-2">
                <Icon path={icons.search} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                <span className="text-[13px] text-[#3a3a3a]">
                  Rechercher une ressource
                </span>
              </div>

              <section className="space-y-0.5">
                <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                  6 Fichiers principaux
                </p>
                {resources.map((resource) => (
                  <ResourceItem key={resource.name} resource={resource} />
                ))}
              </section>

              <section className="space-y-0.5">
                <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                  1 Documentation
                </p>
                <ResourceItem
                  resource={{
                    name: "Guides",
                    size: "134mo",
                    format: "PDF",
                    type: "documentation",
                  }}
                />
              </section>
            </div>
          </aside>

          <section className="min-w-0 flex-1 overflow-hidden bg-white">
            <header className="flex h-14 items-center justify-between border-b border-[#f1f1f1] bg-white px-3">
              <div className="flex items-center gap-1 text-[13px]">
                <Icon path={icons.table} />
                <span className="font-medium">Ecoles</span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="text-[#3a3a3a]">
                  Mis à jour le 13 octobre 2022
                </span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="text-[#3a3a3a]">134mo</span>
                <span className="text-[#3a3a3a]">·</span>
                <FormatTag>CSV</FormatTag>
                <span className="text-[#3a3a3a]">·</span>
                <Icon path={icons.download} className="h-3 w-3 text-[#3a3a3a]" />
                <span className="text-[#3a3a3a]">234</span>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex h-8 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-white">
                  <Icon path={icons.download} className="h-4 w-4 text-white" />
                  Télécharger
                </button>
                <button
                  aria-label="Agrandir"
                  className="flex h-8 w-8 items-center justify-center border border-[#dddddd] bg-white"
                >
                  <Icon path={icons.expand} />
                </button>
              </div>
            </header>

            <div className="flex h-12 items-center border-b border-[#f1f1f1] bg-white px-2">
              {[
                "Aperçu",
                "Carte",
                "Description",
                "Structure des données",
                "Métadonnées",
                "API",
              ].map((tab) => (
                <button
                  key={tab}
                  className={`h-7 rounded px-2.5 text-[12px] font-medium ${
                    tab === "Aperçu"
                      ? "border border-[#000091] text-[#000091]"
                      : "text-[#161616]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

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
                <span className="flex items-center gap-1">
                  <Icon path={icons.columns} className="h-3.5 w-3.5 text-[#3a3a3a]" />
                  Colonnes {tableColumns.length} sur {tableColumns.length}
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
              onOpenFilter={setActiveFilter}
              onClearSearch={() => setSearchQuery("")}
              onClearCategory={clearCategoryFilter}
              onClearNumber={clearNumberRange}
              onClearDate={clearDateFilter}
              onClearSort={() => setSortState(null)}
              onClearAll={clearAllFilters}
            />

            <div className="relative max-h-[574px] overflow-auto">
              {activeFilter ? (
                <FilterDismissLayer onClose={() => setActiveFilter(null)} />
              ) : null}
              <FilterMenus
                activeFilter={activeFilter}
                sortState={sortState}
                categoryFilters={categoryFilters}
                numberRanges={numberRanges}
                dateFilters={dateFilters}
                onToggleCategory={toggleCategoryFilter}
                onChangeRange={updateNumberRange}
                onSort={updateSort}
                onClearRange={clearNumberRange}
                onChangeDate={updateDateFilter}
                onClearDate={clearDateFilter}
                onClose={() => setActiveFilter(null)}
              />
              <div className="flex h-8 border-b border-[#e5e5e5] bg-white">
                {tableColumns.map((column) => (
                  <HeaderCell
                    key={column.key}
                    column={column}
                    isOpen={activeFilter === column.key}
                    sortDirection={
                      sortState?.key === column.key
                        ? sortState.direction
                        : undefined
                    }
                    onOpen={() =>
                      setActiveFilter((current) =>
                        current === column.key ? null : column.key,
                      )
                    }
                  />
                ))}
              </div>

              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <div
                    key={row.id}
                    className="flex h-8 border-b border-[#e5e5e5] bg-white"
                  >
                    {tableColumns.map((column) => (
                      <DataCell
                        key={column.key}
                        value={getRowValue(row, column.key)}
                        type={column.type}
                        width={column.width}
                      />
                    ))}
                  </div>
                ))
              ) : (
                <div className="flex h-[542px] flex-col items-center justify-center gap-2 border-t border-[#e5e5e5] bg-[#fcfcfc] p-4 text-center text-[16px] leading-6">
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
          </section>
        </div>
      </div>
    </main>
  );
}
