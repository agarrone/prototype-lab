"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  RiArrowLeftLine,
  RiCheckboxCircleLine,
  RiDatabase2Line,
  RiFileTextLine,
  RiFingerprintLine,
  RiHashtag,
  RiInformationLine,
  RiLayoutHorizontalLine,
  RiLayoutVerticalLine,
  RiLoader4Line,
  RiPriceTag3Line,
  RiSparklingLine,
  RiText,
} from "@remixicon/react";
import { getPrototypeBySlug } from "@/lib/prototypes";

const prototype = getPrototypeBySlug("enrichissement-donnees");

const analysisSteps = [
  "Fichiers reçus",
  "Lectures du format CSV",
  "Détection des colonnes",
  "Analyse des données",
  "Recherche de données de référence",
  "Préparation de l'aperçu",
];

type PrototypeStage = "upload" | "analysis" | "review" | "publish";
type ColumnType =
  | "identifier"
  | "text"
  | "category"
  | "date"
  | "number"
  | "reference"
  | "referenceData";

type PreviewColumn = {
  key: string;
  label: string;
  type: ColumnType;
  enrichment?: "commune" | "entreprise";
};

type PreviewRow = Record<string, string>;

const previewColumns: PreviewColumn[] = [
  { key: "id", label: "Identifiant", type: "identifier" },
  { key: "nom", label: "Nom", type: "text" },
  { key: "commune", label: "Commune", type: "referenceData", enrichment: "commune" },
  { key: "codeInsee", label: "Code INSEE", type: "identifier", enrichment: "commune" },
  { key: "departement", label: "Département", type: "reference" },
  { key: "region", label: "Région", type: "reference" },
  { key: "siret", label: "Num entreprise", type: "identifier", enrichment: "entreprise" },
  { key: "categorie", label: "Catégorie", type: "category" },
  { key: "dateOuverture", label: "Ouverture", type: "date" },
  { key: "visiteurs", label: "Visiteurs", type: "number" },
];

const previewRows: PreviewRow[] = [
  {
    id: "MUS-0001",
    nom: "Musée Carnavalet",
    commune: "Paris",
    codeInsee: "75056",
    departement: "Paris",
    region: "Île-de-France",
    siret: "21750001600019",
    categorie: "Musée municipal",
    dateOuverture: "2024-01-12",
    visiteurs: "843210",
  },
  {
    id: "MUS-0002",
    nom: "Musée des Beaux-Arts",
    commune: "Lyon",
    codeInsee: "69123",
    departement: "Rhône",
    region: "Auvergne-Rhône-Alpes",
    siret: "21690123100011",
    categorie: "Beaux-arts",
    dateOuverture: "2024-01-18",
    visiteurs: "512450",
  },
  {
    id: "MUS-0003",
    nom: "Musée d'Histoire de Marseille",
    commune: "Marseille",
    codeInsee: "13055",
    departement: "Bouches-du-Rhône",
    region: "Provence-Alpes-Côte d'Azur",
    siret: "21130055300016",
    categorie: "Histoire",
    dateOuverture: "2024-02-02",
    visiteurs: "394120",
  },
  {
    id: "MUS-0004",
    nom: "Musée d'arts de Nantes",
    commune: "Nantes",
    codeInsee: "44109",
    departement: "Loire-Atlantique",
    region: "Pays de la Loire",
    siret: "21440109300015",
    categorie: "Beaux-arts",
    dateOuverture: "2024-02-17",
    visiteurs: "288930",
  },
  {
    id: "MUS-0005",
    nom: "Palais des Beaux-Arts",
    commune: "Lille",
    codeInsee: "59350",
    departement: "Nord",
    region: "Hauts-de-France",
    siret: "21590350100017",
    categorie: "Beaux-arts",
    dateOuverture: "2024-03-04",
    visiteurs: "476300",
  },
  {
    id: "MUS-0006",
    nom: "Musée de Bretagne",
    commune: "Rennes",
    codeInsee: "35238",
    departement: "Ille-et-Vilaine",
    region: "Bretagne",
    siret: "21350238800018",
    categorie: "Histoire",
    dateOuverture: "2024-03-21",
    visiteurs: "205640",
  },
  {
    id: "MUS-0007",
    nom: "Musée Fabre",
    commune: "Montpellier",
    codeInsee: "34172",
    departement: "Hérault",
    region: "Occitanie",
    siret: "21340172200012",
    categorie: "Beaux-arts",
    dateOuverture: "2024-04-05",
    visiteurs: "335180",
  },
  {
    id: "MUS-0008",
    nom: "Musée Unterlinden",
    commune: "Colmar",
    codeInsee: "68066",
    departement: "Haut-Rhin",
    region: "Grand Est",
    siret: "21680066000012",
    categorie: "Patrimoine",
    dateOuverture: "2024-04-26",
    visiteurs: "198720",
  },
  {
    id: "MUS-0009",
    nom: "Musée Soulages",
    commune: "Rodez",
    codeInsee: "12202",
    departement: "Aveyron",
    region: "Occitanie",
    siret: "21120202300011",
    categorie: "Art moderne",
    dateOuverture: "2024-05-11",
    visiteurs: "224510",
  },
  {
    id: "MUS-0010",
    nom: "Musée des Confluences",
    commune: "Lyon",
    codeInsee: "69123",
    departement: "Rhône",
    region: "Auvergne-Rhône-Alpes",
    siret: "20004697700013",
    categorie: "Sciences",
    dateOuverture: "2024-05-29",
    visiteurs: "738400",
  },
];

const columnIcons = {
  identifier: RiFingerprintLine,
  text: RiText,
  category: RiPriceTag3Line,
  date: RiFileTextLine,
  number: RiHashtag,
  reference: RiDatabase2Line,
  referenceData: RiSparklingLine,
} satisfies Record<ColumnType, typeof RiText>;

const typeLabels = {
  identifier: "Identifiant",
  text: "Texte",
  category: "Catégoriel",
  date: "Date",
  number: "Nombre",
  reference: "Référentiel",
  referenceData: "Données de référence",
} satisfies Record<ColumnType, string>;

const distributionHeights = [42, 68, 88, 104, 78, 52, 38, 72, 96, 58, 34, 46];

function StepIndicator({ stage }: { stage: PrototypeStage }) {
  const stepNumber = stage === "publish" ? 3 : stage === "review" ? 2 : 1;
  const title =
    stage === "publish"
      ? "Finalisez la publication"
      : stage === "review"
        ? "Analyser le fichier"
        : "Ajouter une ressource";

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-[14px] leading-6 text-[#3a3a3a]">
          Étape {stepNumber} sur 3
        </p>
        <h1 className="text-[20px] font-bold leading-7 text-[#161616]">
          {title}
        </h1>
      </div>

      <div className="grid h-2 grid-cols-3 gap-1.5" aria-hidden="true">
        <span className="bg-[#000091]" />
        <span className={stage === "review" || stage === "publish" ? "bg-[#000091]" : "bg-white"} />
        <span className={stage === "publish" ? "bg-[#000091]" : "bg-white"} />
      </div>

      {stage !== "publish" ? (
        <p className="text-[12px] leading-5 text-[#666666]">
          <span className="font-bold">Étape suivante :</span>{" "}
          {stage === "review" ? "Finalisation de la publication" : "Analyse de votre fichier"}
        </p>
      ) : null}
    </div>
  );
}

function Divider() {
  return (
    <div className="flex w-full items-center gap-2.5 text-[10px] leading-6 text-[#666666]">
      <span className="h-px flex-1 bg-[#e5e5e5]" />
      <span>OU</span>
      <span className="h-px flex-1 bg-[#e5e5e5]" />
    </div>
  );
}

function UploadPanel({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="flex flex-col gap-3 border border-[#e5e5e5] bg-white p-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-[14px] font-bold uppercase leading-6 text-[#161616]">
          Ajouter et analyser une ressource
        </h2>

        <label className="flex h-[210px] cursor-pointer flex-col items-center justify-center gap-2.5 border border-dashed border-[#e5e5e5] bg-[#f6f6f6] p-5 text-center transition-colors hover:border-[#000091] hover:bg-[#eeeeee]">
          <input className="sr-only" type="file" accept=".csv,.parquet" />
          <span className="text-[16px] font-bold leading-7 text-[#666666]">
            Glissez et déposez un fichier tabulaire
          </span>
          <span className="flex w-full max-w-80 items-center gap-2.5 text-[10px] leading-6 text-[#666666]">
            <span className="h-px flex-1 bg-[#e5e5e5]" />
            OU
            <span className="h-px flex-1 bg-[#e5e5e5]" />
          </span>
          <span className="rounded-full border border-[#3a3a3a] px-4 py-2.5 text-[14px] font-medium leading-[14px] text-[#3a3a3a]">
            Parcourir
          </span>
        </label>

        <p className="text-[11px] leading-6 text-[#666666]">
          Taille maximale : 420 Mo. Formats supportés : CSV, Parquet.
        </p>
      </section>

      <Divider />

      <section className="flex flex-col gap-2">
        <h2 className="text-[14px] font-bold uppercase leading-6 text-[#161616]">
          Ajouter un lien
        </h2>
        <label className="flex flex-col gap-2">
          <span className="text-[16px] leading-6 text-[#161616]">
            Lien <strong>exact vers le fichier</strong>
          </span>
          <input
            className="h-10 rounded-t bg-[#f6f6f6] border-x-0 border-t-0 border-b-2 border-[#3a3a3a] px-4 text-[14px] leading-6 text-[#161616] outline-none placeholder:italic focus:border-[#000091]"
            placeholder="http://..."
            type="url"
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          className="h-8 bg-[#000091] px-3 text-[14px] font-medium leading-6 text-[#f5f5fe] transition-colors hover:bg-[#1212ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]"
          type="button"
          onClick={onAnalyze}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

function FileSummary() {
  return (
    <div className="border border-[#e5e5e5] bg-white p-2.5">
      <div className="flex min-w-0 flex-col gap-0">
        <div className="flex items-center gap-1 text-[14px] leading-6 text-[#161616]">
          <RiFileTextLine aria-hidden className="h-4 w-4 shrink-0" />
          <span className="font-bold">musees.csv</span>
        </div>
        <p className="text-[12px] leading-5 text-[#666666]">
          export_01.csv — csv (13.7Mo)
        </p>
      </div>
    </div>
  );
}

function AnalysisPanel({
  completedCount,
  onContinue,
}: {
  completedCount: number;
  onContinue: () => void;
}) {
  const progress = Math.round((completedCount / analysisSteps.length) * 100);
  const isComplete = completedCount === analysisSteps.length;

  return (
    <div className="flex flex-col gap-3 border border-[#e5e5e5] bg-white p-5">
      <FileSummary />

      <section className="flex flex-col gap-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-[12px] leading-5 text-[#666666]">
            <span>Analyse de la ressource</span>
            <span>({progress}%)</span>
          </div>
          <div className="h-2 bg-[#eeeeee]">
            <div
              className="h-full bg-[#000091] transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-col gap-1.5">
          {analysisSteps.map((step, index) => {
            const isDone = index < completedCount;
            const isCurrent = index === completedCount && !isComplete;

            return (
              <li
                key={step}
                className="flex h-6 items-center gap-2 text-[14px] leading-6 text-[#3a3a3a]"
              >
                {isDone ? (
                  <RiCheckboxCircleLine
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-[#18753c]"
                  />
                ) : isCurrent ? (
                  <RiLoader4Line
                    aria-hidden
                    className="h-4 w-4 shrink-0 animate-spin text-[#000091]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#929292]"
                  />
                )}
                <span>{step}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex justify-end">
        <button
          className="h-8 bg-[#000091] px-3 text-[14px] font-medium leading-6 text-[#f5f5fe] transition-colors hover:bg-[#1212ff] disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-[#929292] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]"
          type="button"
          disabled={!isComplete}
          onClick={onContinue}
        >
          {isComplete ? "Suivant" : "Analyse en cours"}
        </button>
      </div>
    </div>
  );
}

function StructureMetric({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: typeof RiText;
  label: string;
  value: string;
  tone?: "neutral" | "purple";
}) {
  return (
    <div className="flex h-6 min-w-fit items-center gap-2 text-[13px] leading-[1.4]">
      <div className="flex min-w-0 items-center gap-1">
        <Icon
          aria-hidden
          className={`h-4 w-4 ${tone === "purple" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"}`}
        />
        <span className={tone === "purple" ? "text-[#7b4fbf]" : "text-[#3a3a3a]"}>
          {label}
        </span>
      </div>
      <span className={tone === "purple" ? "font-bold text-[#7b4fbf]" : "font-bold text-[#161616]"}>
        {value}
      </span>
    </div>
  );
}

function getColumnQuality(column: PreviewColumn) {
  if (column.enrichment === "commune") {
    return { valid: 83, nonConforming: 5, missing: 12 };
  }

  if (column.enrichment === "entreprise") {
    return { valid: 93, nonConforming: 2, missing: 5 };
  }

  if (column.type === "number") {
    return { valid: 90, nonConforming: 3, missing: 7 };
  }

  if (column.type === "date") {
    return { valid: 86, nonConforming: 4, missing: 10 };
  }

  return { valid: 88, nonConforming: 3, missing: 9 };
}

function getColumnValues(column: PreviewColumn) {
  return previewRows.map((row) => row[column.key]).filter(Boolean);
}

function getUniqueCount(column: PreviewColumn) {
  return new Set(getColumnValues(column)).size;
}

function getFrequentValues(column: PreviewColumn) {
  const counts = getColumnValues(column).reduce((accumulator, value) => {
    accumulator.set(value, (accumulator.get(value) ?? 0) + 1);
    return accumulator;
  }, new Map<string, number>());

  return Array.from(counts.entries())
    .sort((first, second) => second[1] - first[1])
    .slice(0, 10)
    .map(([label, count]) => ({
      label,
      value: `${count} (${Math.round((count / previewRows.length) * 100)}%)`,
    }));
}

function getNumberStats(column: PreviewColumn) {
  const values = getColumnValues(column)
    .map((value) => Number(value.replace(/[^\d.-]/g, "")))
    .filter((value) => !Number.isNaN(value))
    .sort((first, second) => first - second);
  const average = Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
  const middleIndex = Math.floor(values.length / 2);
  const standardDeviation = Math.round(
    Math.sqrt(
      values.reduce((sum, value) => sum + (value - average) ** 2, 0) /
        values.length,
    ),
  );

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average,
    median:
      values.length % 2 === 0
        ? Math.round((values[middleIndex - 1] + values[middleIndex]) / 2)
        : values[middleIndex],
    standardDeviation,
  };
}

function getDateStats(column: PreviewColumn) {
  const timestamps = getColumnValues(column)
    .map((value) => new Date(value).getTime())
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

function getReferenceDataLabel(column: PreviewColumn) {
  if (column.enrichment === "commune") {
    return "code commune INSEE";
  }

  if (column.enrichment === "entreprise") {
    return "numéro SIRET";
  }

  return "donnée de référence";
}

function getReferenceSourceLabel(column: PreviewColumn) {
  if (column.enrichment === "commune") {
    return "code officiel géographique";
  }

  if (column.enrichment === "entreprise") {
    return "répertoire Sirene";
  }

  return "référentiel public";
}

function FileReviewSummary() {
  const typeCounts = {
    number: previewColumns.filter((column) => column.type === "number").length,
    category: previewColumns.filter((column) => column.type === "category").length,
    text: previewColumns.filter((column) => column.type === "text").length,
    date: previewColumns.filter((column) => column.type === "date").length,
    identifier: previewColumns.filter((column) => column.type === "identifier").length,
    reference: previewColumns.filter(
      (column) => column.type === "reference" || column.type === "referenceData",
    ).length,
  };

  return (
    <section className="flex flex-col gap-3 bg-white">
      <FileSummary />
      <div className="flex min-w-0 items-center gap-4">
        <h2 className="shrink-0 text-[14px] font-bold leading-6 text-[#161616]">
          {"Résumé de l'analyse"}
        </h2>
        <div className="flex min-w-0 flex-1 flex-nowrap gap-x-4 overflow-hidden whitespace-nowrap">
          <StructureMetric
            icon={RiLayoutVerticalLine}
            label="Colonnes"
            value={String(previewColumns.length)}
          />
          <StructureMetric
            icon={RiLayoutHorizontalLine}
            label="Lignes"
            value="12 458"
          />
          <StructureMetric
            icon={RiHashtag}
            label="Nombre"
            value={String(typeCounts.number)}
          />
          <StructureMetric
            icon={RiPriceTag3Line}
            label="Catégoriel"
            value={String(typeCounts.category)}
          />
          <StructureMetric icon={RiText} label="Texte" value={String(typeCounts.text)} />
          <StructureMetric
            icon={RiFileTextLine}
            label="Date"
            value={String(typeCounts.date)}
          />
          <StructureMetric
            icon={RiFingerprintLine}
            label="Identifiant"
            value={String(typeCounts.identifier)}
          />
          <StructureMetric
            icon={RiSparklingLine}
            label="Données de référence"
            value={String(typeCounts.reference)}
            tone="purple"
          />
        </div>
      </div>
    </section>
  );
}

function CellPreview({
  column,
  value,
}: {
  column: PreviewColumn;
  value: string;
}) {
  if (column.type === "referenceData") {
    return (
      <span className="truncate rounded bg-[#f4efff] px-2 py-1 text-[12px] leading-3 text-[#7b4fbf]">
        {value}
      </span>
    );
  }

  if (column.type === "category" || column.type === "reference") {
    return (
      <span className="truncate rounded bg-[#eeeeee] px-2 py-1 text-[12px] leading-3 text-[#3a3a3a]">
        {value}
      </span>
    );
  }

  return <span className="truncate text-[12px] text-[#161616]">{value}</span>;
}

function ColumnTypeTag({ column }: { column: PreviewColumn }) {
  const Icon = columnIcons[column.type];
  const isReferenceData = column.type === "referenceData";

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1 rounded-[2px] px-1 ${
        isReferenceData ? "bg-[#f4efff] text-[#7b4fbf]" : "bg-[#f6f6f6] text-[#3a3a3a]"
      }`}
    >
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      <span className="truncate">{typeLabels[column.type]}</span>
    </span>
  );
}

function DataPreviewTable({
  selectedColumnKey,
  onSelectColumn,
}: {
  selectedColumnKey: string;
  onSelectColumn: (columnKey: string) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-white">
      <div className="min-w-[1120px]">
        <div className="grid grid-cols-10 bg-[#f6f6f6] text-[12px] font-bold leading-4 text-[#161616]">
          {previewColumns.map((column) => {
            const Icon = columnIcons[column.type];
            const isSelected = column.key === selectedColumnKey;

            return (
              <button
                key={column.key}
                type="button"
                className={`flex h-12 min-w-0 items-center justify-between gap-2 border-b border-r border-[#e5e5e5] px-2 text-left hover:bg-[#eeeeee] ${
                  column.type === "referenceData"
                    ? "text-[#7b4fbf]"
                    : "text-[#161616]"
                } ${
                  isSelected
                    ? column.type === "referenceData"
                      ? "bg-[#f4efff]"
                      : "bg-[#e8edff]"
                    : ""
                }`}
                onClick={() => onSelectColumn(column.key)}
              >
                <span className="flex min-w-0 items-center gap-1">
                  <Icon aria-hidden className="h-4 w-4 shrink-0" />
                  <span className="truncate">{column.label}</span>
                </span>
                <RiInformationLine
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#CECECE]"
                />
              </button>
            );
          })}
        </div>

        {previewRows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-10 text-[12px] leading-4 text-[#3a3a3a]"
          >
            {previewColumns.map((column) => (
              <div
                key={`${row.id}-${column.key}`}
                className={`flex h-8 min-w-0 items-center border-b border-r border-[#e5e5e5] px-2 ${
                  column.type === "number" ? "justify-end" : ""
                } ${column.type === "referenceData" ? "bg-[#fbf8ff]" : ""}`}
              >
                <CellPreview column={column} value={row[column.key]} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailStat({
  label,
  value,
  valueTone = "neutral",
}: {
  label: string;
  value: ReactNode;
  valueTone?: "neutral" | "valid" | "invalid" | "missing";
}) {
  const valueClassNames = {
    neutral: "text-[#3a3a3a]",
    valid: "font-bold text-[#18753c]",
    invalid: "font-bold text-[#b34000]",
    missing: "font-bold text-[#716043]",
  };

  return (
    <div className="flex flex-col gap-0.5 text-[13px] leading-5">
      <span className="font-bold text-[#161616]">{label}</span>
      <span className={valueClassNames[valueTone]}>{value}</span>
    </div>
  );
}

function DistributionChart({
  heights,
  minLabel,
  maxLabel,
}: {
  heights: number[];
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-24 items-end gap-0.5 border-b border-[#e5e5e5]">
        {heights.map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="min-w-0 flex-1 rounded-t-[1px] bg-[#b6cffb]"
            style={{ height }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] leading-4 text-[#666666]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function ColumnInformationPanel({ column }: { column: PreviewColumn }) {
  const quality = getColumnQuality(column);
  const validCount = Math.round((quality.valid / 100) * 12458);
  const nonConformingCount = Math.round((quality.nonConforming / 100) * 12458);
  const missingCount = 12458 - validCount - nonConformingCount;
  const frequentValues = getFrequentValues(column);
  const distinctCount = getUniqueCount(column);
  const numberStats = column.type === "number" ? getNumberStats(column) : null;
  const dateStats = column.type === "date" ? getDateStats(column) : null;
  const isReferenceData = column.type === "referenceData";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5 text-[13px] leading-5">
        <span className="font-bold text-[#161616]">Nom de la colonne</span>
        <p className="font-mono text-[14px] font-bold leading-6 text-[#3a3a3a]">
          {column.label}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <DetailStat label="Type détecté" value={<ColumnTypeTag column={column} />} />
        {isReferenceData ? (
          <DetailStat
            label="Donnée identifiée"
            value={getReferenceDataLabel(column)}
          />
        ) : null}
        <DetailStat label="Nombre de valeurs" value="12 458" />
        <DetailStat
          label="Valeurs distinctes"
          value={String(distinctCount)}
        />
        <DetailStat
          label="Valeurs valides"
          value={`${validCount} (${quality.valid}%)`}
          valueTone="valid"
        />
        <DetailStat
          label="Valeurs non conformes"
          value={`${nonConformingCount} (${quality.nonConforming}%)`}
          valueTone="invalid"
        />
        <DetailStat
          label="Valeurs manquantes"
          value={`${missingCount} (${quality.missing}%)`}
          valueTone="missing"
        />
      </div>

      {isReferenceData ? (
        <div className="flex flex-col gap-2 border-t border-[#e5e5e5] pt-3 text-[13px] leading-5 text-[#3a3a3a]">
          <p className="font-bold text-[#7b4fbf]">Enrichissement</p>
          <p>
            Cette colonne a été reconnue comme un{" "}
            <strong>{getReferenceDataLabel(column)}</strong>.
          </p>
          <p>
            Vous pouvez enrichir votre fichier à partir du{" "}
            <strong>{getReferenceSourceLabel(column)}</strong>.
          </p>
          <div>
            <p className="font-bold text-[#161616]">Enrichissements disponibles</p>
            <ul className="mt-1 list-disc pl-4">
              <li>Nom commune</li>
              <li>Département</li>
              <li>Région</li>
              <li>EPCI</li>
            </ul>
          </div>
        </div>
      ) : null}

      {column.type === "number" && numberStats ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <DetailStat label="Minimum" value={String(numberStats.min)} />
            <DetailStat label="Maximum" value={String(numberStats.max)} />
            <DetailStat label="Moyenne" value={String(numberStats.average)} />
            <DetailStat label="Médiane" value={String(numberStats.median)} />
            <DetailStat
              label="Écart type"
              value={String(numberStats.standardDeviation)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold leading-5 text-[#161616]">
              Distribution
            </p>
            <DistributionChart
              heights={distributionHeights}
              minLabel={String(numberStats.min)}
              maxLabel={String(numberStats.max)}
            />
          </div>
        </div>
      ) : null}

      {column.type === "date" && dateStats ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <DetailStat label="Première date" value={dateStats.min} />
            <DetailStat label="Dernière date" value={dateStats.max} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold leading-5 text-[#161616]">
              Distribution
            </p>
            <DistributionChart
              heights={distributionHeights.map((height) => Math.max(10, height - 18))}
              minLabel={dateStats.min}
              maxLabel={dateStats.max}
            />
          </div>
        </div>
      ) : null}

      {column.type !== "number" && column.type !== "date" && !isReferenceData ? (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-bold leading-5 text-[#161616]">
            Valeurs les plus fréquentes
          </p>
          <div className="flex flex-col gap-1">
            {frequentValues.slice(0, 10).map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[minmax(0,1fr)_72px] items-center gap-2 text-[12px] leading-5 text-[#3a3a3a]"
              >
                <span className="truncate rounded-[2px] bg-[#f6f6f6] px-1">
                  {item.label}
                </span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EnrichmentGroup({
  title,
  recognizedAs,
  coverage,
  options,
}: {
  title: string;
  recognizedAs: string;
  coverage: string;
  options: string[];
}) {
  const [selectedOptions, setSelectedOptions] = useState([options[0]]);

  return (
    <div className="rounded-[10px] border border-[#e5e5e5] bg-[#f6f6f6] p-2.5">
      <p className="font-mono text-[14px] font-bold leading-6 text-[#161616]">
        {title}
      </p>
      <p className="flex items-center gap-1 text-[11px] leading-[16.5px] text-[#7b4fbf]">
        <RiSparklingLine aria-hidden className="h-3 w-3 shrink-0" />
        <span>Reconnu comme : {recognizedAs}.</span>
      </p>
      <p className="mt-1 text-[11px] leading-[16.5px] text-[#3a3a3a]">
        <strong>{coverage}%</strong> des lignes peuvent être enrichies.
      </p>
      <div className="mt-1 flex flex-col gap-1">
        {options.map((option) => {
          const checked = selectedOptions.includes(option);

          return (
            <label
              key={option}
              className="flex h-6 cursor-pointer items-center gap-2 text-[11px] leading-6 text-[#3a3a3a]"
            >
              <input
                className="h-4 w-4 accent-[#7b4fbf]"
                type="checkbox"
                checked={checked}
                onChange={() =>
                  setSelectedOptions((currentOptions) =>
                    checked
                      ? currentOptions.filter((item) => item !== option)
                      : [...currentOptions, option],
                  )
                }
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function EnrichmentPanel() {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="flex items-center gap-1 text-[14px] font-bold leading-6 text-[#161616]">
          <RiSparklingLine aria-hidden className="h-4 w-4 shrink-0 text-[#7b4fbf]" />
          <span>Enrichissements disponibles</span>
        </p>
        <p className="text-[11px] leading-[16.5px] text-[#3a3a3a]">
          Des enrichissements sont disponibles à partir de 2 colonnes de votre
          fichier.
        </p>
      </div>
      <EnrichmentGroup
        title="Commune"
        recognizedAs="Code INSEE"
        coverage="83"
        options={["Nom commune", "Département", "Région", "EPCI"]}
      />
      <EnrichmentGroup
        title="Num entreprise"
        recognizedAs="SIRET"
        coverage="93"
        options={["Nom entreprise", "Activité NAF", "Catégorie juridique", "Adresse"]}
      />
    </div>
  );
}

function ReviewPanel({ onContinue }: { onContinue: () => void }) {
  const [selectedColumnKey, setSelectedColumnKey] = useState(previewColumns[0].key);
  const [showEnrichments, setShowEnrichments] = useState(false);
  const selectedColumn =
    previewColumns.find((column) => column.key === selectedColumnKey) ??
    previewColumns[0];

  return (
    <section className="flex flex-col gap-4 border border-[#e5e5e5] bg-white p-4">
      <FileReviewSummary />

      <div className="flex flex-col gap-1">
        <h2 className="text-[14px] font-bold leading-6 text-[#161616]">
          Aperçu
        </h2>
        <p className="text-[12px] leading-5 text-[#666666]">
          {
            "Aperçu des dix premières lignes du fichier. Cliquez sur l'en-tête d'une colonne pour obtenir plus d'informations sur celle-ci."
          }
        </p>
      </div>

      <div className="flex h-[640px] overflow-hidden border border-[#e5e5e5] bg-white">
        <aside className="flex w-[246px] shrink-0 flex-col border-r border-[#e5e5e5] bg-white">
          <div className="flex h-14 shrink-0 items-center border-b border-[#e5e5e5] bg-[#f6f6f6] px-3">
            <span className="text-[13px] font-medium text-[#161616]">
              {showEnrichments ? "Enrichissements" : "Colonne sélectionnée"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {showEnrichments ? (
              <EnrichmentPanel />
            ) : (
              <ColumnInformationPanel column={selectedColumn} />
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e5e5e5] bg-[#f6f6f6] px-3">
            <div className="flex min-w-0 items-center gap-1 text-[13px]">
              <RiFileTextLine aria-hidden className="h-4 w-4 shrink-0 text-[#3a3a3a]" />
              <span className="font-medium text-[#161616]">musees.csv</span>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#3a3a3a]">csv</span>
              <span className="text-[#3a3a3a]">·</span>
              <span className="text-[#3a3a3a]">13.7Mo</span>
              <span className="text-[#3a3a3a]">·</span>
              <span className="truncate text-[#3a3a3a]">12 458 lignes</span>
            </div>
            <button
              className="flex h-8 shrink-0 items-center gap-2 bg-[#7b4fbf] px-3 text-[13px] font-medium text-white transition-colors hover:bg-[#6a40aa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b4fbf]"
              type="button"
              onClick={() => setShowEnrichments(true)}
            >
              <RiSparklingLine aria-hidden className="h-4 w-4 shrink-0" />
              <span>Enrichir les données</span>
            </button>
          </header>

          <DataPreviewTable
            selectedColumnKey={selectedColumnKey}
            onSelectColumn={(columnKey) => {
              setSelectedColumnKey(columnKey);
              setShowEnrichments(false);
            }}
          />
        </section>
      </div>

      <div className="flex justify-end">
        <button
          className="h-8 bg-[#000091] px-3 text-[14px] font-medium leading-6 text-[#f5f5fe] transition-colors hover:bg-[#1212ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]"
          type="button"
          onClick={onContinue}
        >
          Suivant
        </button>
      </div>
    </section>
  );
}

function EnrichmentTag({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[#000091] px-2 py-0.5 text-[12px] leading-5 text-[#f5f5fe]">
      {children}
    </span>
  );
}

function FinalizationPanel() {
  const [autoApply, setAutoApply] = useState(true);

  return (
    <section className="flex flex-col gap-3 border border-[#e5e5e5] bg-white p-5">
      <section className="flex flex-col gap-2">
        <h2 className="text-[14px] font-bold uppercase leading-6 text-[#161616]">
          Votre fichier
        </h2>
        <FileSummary />
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-[14px] font-bold uppercase leading-6 text-[#161616]">
          Enrichissements
        </h2>
        <p className="text-[12px] leading-5 text-[#666666]">
          2 colonnes ajoutées
        </p>
        <div className="flex flex-wrap gap-2">
          <EnrichmentTag>Nom commune (83%)</EnrichmentTag>
          <EnrichmentTag>Nom entreprise (93%)</EnrichmentTag>
        </div>
        <label className="mt-1 flex cursor-pointer items-center gap-2 text-[14px] leading-6 text-[#161616]">
          <input
            className="h-4 w-4 accent-[#000091]"
            type="checkbox"
            checked={autoApply}
            onChange={(event) => setAutoApply(event.target.checked)}
          />
          <span>
            Réappliquer automatiquement ces enrichissements lors des futures mises à jour
          </span>
        </label>
      </section>

      <div className="flex justify-end gap-2">
        <button
          className="h-8 border border-[#161616] bg-white px-3 text-[14px] font-medium leading-6 text-[#161616] transition-colors hover:bg-[#f6f6f6]"
          type="button"
        >
          Suivant
        </button>
        <button
          className="h-8 border border-[#000091] bg-[#000091] px-3 text-[14px] font-medium leading-6 text-[#f5f5fe] transition-colors hover:bg-[#1212ff]"
          type="button"
        >
          Publier
        </button>
      </div>
    </section>
  );
}

export default function EnrichissementDonneesPage() {
  const [stage, setStage] = useState<PrototypeStage>("upload");
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const title = useMemo(
    () => prototype?.title ?? "Enrichissement de données",
    [],
  );

  useEffect(() => {
    if (!analysisStarted || completedCount >= analysisSteps.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCompletedCount((currentCount) =>
        Math.min(currentCount + 1, analysisSteps.length),
      );
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [analysisStarted, completedCount]);

  function startAnalysis() {
    setCompletedCount(0);
    setAnalysisStarted(true);
    setStage("analysis");
  }

  return (
    <main className="min-h-dvh bg-[#f6f6f6] px-4 py-10 text-[#161616] sm:px-8 lg:px-[120px] lg:py-[88px]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-[13px] font-normal leading-6 text-[#161616] underline-offset-4 hover:underline"
        >
          <RiArrowLeftLine aria-hidden className="h-4 w-4" />
          Retour
        </Link>

        <StepIndicator stage={stage} />

        <div aria-label={title}>
          {stage === "publish" ? (
            <FinalizationPanel />
          ) : stage === "review" ? (
            <ReviewPanel onContinue={() => setStage("publish")} />
          ) : analysisStarted ? (
            <AnalysisPanel
              completedCount={completedCount}
              onContinue={() => setStage("review")}
            />
          ) : (
            <UploadPanel onAnalyze={startAnalysis} />
          )}
        </div>
      </div>
    </main>
  );
}
