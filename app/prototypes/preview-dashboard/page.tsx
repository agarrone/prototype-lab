"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiBarChartBoxLine,
  RiFileCodeLine,
  RiFileTextLine,
  RiFolderZipLine,
  RiMap2Line,
  RiSearchLine,
  RiTableLine,
} from "@remixicon/react";

type FormatDetail = {
  format: string;
  count: number;
  countDelta: number;
  catalogShare: number;
  catalogDelta: number;
  previewableShare: number;
  previewableDelta: number;
  previewable: boolean;
  note: string;
};

type FormatFamily = {
  id: string;
  family: string;
  count: number;
  countDelta: number;
  catalogShare: number;
  catalogDelta: number;
  previewableShare: number;
  previewableDelta: number;
  icon: "table" | "geo" | "document" | "code" | "archive";
  details: FormatDetail[];
};

const months = ["Juin 2026", "Mai 2026", "Avril 2026"];
const datasetUrl =
  "https://demo.data.gouv.fr/api/1/datasets/r/982d9dd0-365a-4c4b-8a83-75dec40c36bb";

const formatFamilies: FormatFamily[] = [
  {
    id: "tabular",
    family: "Tabulaire",
    count: 182430,
    countDelta: 3240,
    catalogShare: 42,
    catalogDelta: 1.2,
    previewableShare: 91,
    previewableDelta: 2.4,
    icon: "table",
    details: [
      {
        format: "CSV",
        count: 121200,
        countDelta: 2100,
        catalogShare: 28,
        catalogDelta: 0.8,
        previewableShare: 96,
        previewableDelta: 1.1,
        previewable: true,
        note: "Prévisualisation tabulaire native.",
      },
      {
        format: "XLSX",
        count: 34240,
        countDelta: 620,
        catalogShare: 8,
        catalogDelta: 0.2,
        previewableShare: 86,
        previewableDelta: 3.2,
        previewable: true,
        note: "Converti côté aperçu en table lisible.",
      },
      {
        format: "Parquet",
        count: 18610,
        countDelta: 740,
        catalogShare: 4,
        catalogDelta: 0.3,
        previewableShare: 82,
        previewableDelta: 5.4,
        previewable: true,
        note: "Aperçu disponible si le fichier est lisible par le backend.",
      },
      {
        format: "ODS",
        count: 8380,
        countDelta: -220,
        catalogShare: 2,
        catalogDelta: -0.1,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Support à confirmer.",
      },
    ],
  },
  {
    id: "geodata",
    family: "Géographique",
    count: 68520,
    countDelta: 1180,
    catalogShare: 16,
    catalogDelta: 0.4,
    previewableShare: 74,
    previewableDelta: -1.6,
    icon: "geo",
    details: [
      {
        format: "GeoJSON",
        count: 28480,
        countDelta: 920,
        catalogShare: 7,
        catalogDelta: 0.3,
        previewableShare: 94,
        previewableDelta: 0.8,
        previewable: true,
        note: "Prévisualisation cartographique.",
      },
      {
        format: "Shapefile",
        count: 17920,
        countDelta: -140,
        catalogShare: 4,
        catalogDelta: -0.1,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Souvent publié en archive ZIP.",
      },
      {
        format: "KML",
        count: 12220,
        countDelta: 180,
        catalogShare: 3,
        catalogDelta: 0.1,
        previewableShare: 67,
        previewableDelta: -2.2,
        previewable: true,
        note: "Support cartographique partiel.",
      },
      {
        format: "PMTiles",
        count: 9900,
        countDelta: 220,
        catalogShare: 2,
        catalogDelta: 0.1,
        previewableShare: 78,
        previewableDelta: 4.8,
        previewable: true,
        note: "Aperçu vectoriel à tester selon source.",
      },
    ],
  },
  {
    id: "document",
    family: "Document",
    count: 93400,
    countDelta: -820,
    catalogShare: 22,
    catalogDelta: -0.6,
    previewableShare: 58,
    previewableDelta: 1.9,
    icon: "document",
    details: [
      {
        format: "PDF",
        count: 65400,
        countDelta: -420,
        catalogShare: 15,
        catalogDelta: -0.4,
        previewableShare: 100,
        previewableDelta: 0,
        previewable: true,
        note: "Lecture intégrée dans le navigateur.",
      },
      {
        format: "TXT",
        count: 14880,
        countDelta: 310,
        catalogShare: 3,
        catalogDelta: 0.1,
        previewableShare: 100,
        previewableDelta: 0,
        previewable: true,
        note: "Aperçu texte simple.",
      },
      {
        format: "DOCX",
        count: 8120,
        countDelta: -610,
        catalogShare: 2,
        catalogDelta: -0.2,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Pas de prévisualisation fiable aujourd’hui.",
      },
      {
        format: "HTML",
        count: 5000,
        countDelta: -100,
        catalogShare: 1,
        catalogDelta: -0.1,
        previewableShare: 72,
        previewableDelta: 6.1,
        previewable: true,
        note: "Rendu sécurisé à préciser.",
      },
    ],
  },
  {
    id: "structured",
    family: "Données structurées",
    count: 49210,
    countDelta: 940,
    catalogShare: 11,
    catalogDelta: 0.4,
    previewableShare: 67,
    previewableDelta: 2.8,
    icon: "code",
    details: [
      {
        format: "JSON",
        count: 28110,
        countDelta: 720,
        catalogShare: 6,
        catalogDelta: 0.3,
        previewableShare: 84,
        previewableDelta: 2.4,
        previewable: true,
        note: "Vue structurée ou texte formaté.",
      },
      {
        format: "XML",
        count: 12150,
        countDelta: 160,
        catalogShare: 3,
        catalogDelta: 0.1,
        previewableShare: 76,
        previewableDelta: 1.2,
        previewable: true,
        note: "Aperçu texte avec indentation.",
      },
      {
        format: "RDF",
        count: 8950,
        countDelta: 60,
        catalogShare: 2,
        catalogDelta: 0,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Support spécialisé à évaluer.",
      },
    ],
  },
  {
    id: "archive",
    family: "Archive",
    count: 39280,
    countDelta: -430,
    catalogShare: 9,
    catalogDelta: -0.3,
    previewableShare: 18,
    previewableDelta: -0.7,
    icon: "archive",
    details: [
      {
        format: "ZIP",
        count: 30200,
        countDelta: -310,
        catalogShare: 7,
        catalogDelta: -0.2,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Contenu hétérogène, inspection future possible.",
      },
      {
        format: "GZIP",
        count: 5180,
        countDelta: -90,
        catalogShare: 1,
        catalogDelta: -0.1,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Nécessite extraction.",
      },
      {
        format: "TAR",
        count: 3900,
        countDelta: -30,
        catalogShare: 1,
        catalogDelta: 0,
        previewableShare: 0,
        previewableDelta: 0,
        previewable: false,
        note: "Nécessite extraction.",
      },
    ],
  },
];

const iconByFamily = {
  table: RiTableLine,
  geo: RiMap2Line,
  document: RiFileTextLine,
  code: RiFileCodeLine,
  archive: RiFolderZipLine,
} satisfies Record<FormatFamily["icon"], typeof RiTableLine>;

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatDelta(value: number, suffix = "") {
  if (value === 0) {
    return `0${suffix}`;
  }

  return `${value > 0 ? "+" : ""}${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value)}${suffix}`;
}

function DeltaValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const className =
    value > 0
      ? "text-[#18753c]"
      : value < 0
        ? "text-[#b34000]"
        : "text-[#666666]";

  return (
    <span className={`text-[12px] leading-4 ${className}`}>
      {formatDelta(value, suffix)}
    </span>
  );
}

function CountMetric({ value, delta }: { value: number; delta: number }) {
  return (
    <div className="flex min-w-0 flex-col items-end">
      <span className="text-[13px] text-[#161616]">
        {formatNumber(value)}
      </span>
      <DeltaValue value={delta} />
    </div>
  );
}

function ProgressMetric({ value, delta }: { value: number; delta: number }) {
  return (
    <div className="flex min-w-[150px] items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full border border-[#CECECE] bg-[#eeeeee]">
        <div
          className="h-full rounded-full bg-[#CECECE]"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex w-14 flex-col items-end">
        <span className="text-[12px] text-[#161616]">{value} %</span>
        <DeltaValue value={delta} suffix=" pt" />
      </div>
    </div>
  );
}

function NotImplementedTag() {
  return (
    <span className="shrink-0 rounded bg-[#fee7d6] px-2 py-1 text-[12px] leading-3 text-[#b34000]">
      Non implémenté
    </span>
  );
}

function MobileMetric({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] leading-4 text-[#666666]">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

function SourcePanel({ selectedMonth }: { selectedMonth: string }) {
  return (
    <div className="border-b border-[#E5E5E5] bg-white px-3 py-3">
      <div className="grid gap-3 text-[13px] sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <p className="text-[#161616]">Source : dataset de démonstration</p>
          <p className="mt-1 text-[12px] text-[#666666]">
            Dernière analyse mockée : {selectedMonth} · les différentiels sont
            calculés vs mois précédent.
          </p>
        </div>
        <label className="flex h-8 w-full items-center rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2 sm:w-[360px]">
          <input
            value={datasetUrl}
            readOnly
            aria-label="URL de dataset à analyser"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#666666]"
          />
        </label>
      </div>
    </div>
  );
}

export default function PreviewDashboardPage() {
  const [expandedRows, setExpandedRows] = useState<string[]>(["tabular"]);
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const filteredFamilies = formatFamilies.filter((family) => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [family.family, ...family.details.map((detail) => detail.format)]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  function toggleRow(id: string) {
    setExpandedRows((current) =>
      current.includes(id)
        ? current.filter((rowId) => rowId !== id)
        : [...current, id],
    );
  }

  return (
    <main className="min-h-dvh bg-[#f6f6f6] text-[#161616]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-4 inline-flex h-8 w-fit items-center gap-2 px-2 text-[13px] leading-6 text-[#3a3a3a] underline-offset-4 hover:text-[#000091] hover:underline"
        >
          <RiArrowLeftLine aria-hidden className="h-4 w-4" />
          Retour
        </Link>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-[#E5E5E5] bg-white">
          <header className="border-b border-[#E5E5E5] bg-[#f6f6f6] px-3 py-3">
            <div className="flex min-h-14 flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <RiBarChartBoxLine
                    aria-hidden
                    className="h-4 w-4 text-[#3a3a3a]"
                  />
                  <h1 className="truncate text-[16px] font-bold leading-6">
                    Preview dashboard
                  </h1>
                </div>
                <p className="mt-1 text-[13px] leading-5 text-[#666666]">
                  Suivi mocké des formats prévisualisables sur data.gouv.fr.
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <label className="flex h-8 w-full items-center gap-1 rounded border border-[#E5E5E5] bg-white px-2 sm:w-[260px]">
                <RiSearchLine aria-hidden className="h-3.5 w-3.5 text-[#3a3a3a]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Rechercher une famille ou un format"
                  placeholder="Rechercher"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                />
              </label>

              <label className="relative flex h-8 w-full items-center rounded border border-[#E5E5E5] bg-white px-2 sm:w-[150px]">
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  aria-label="Sélectionner un mois"
                  className="w-full appearance-none bg-transparent pr-6 text-[13px] text-[#161616] outline-none"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <RiArrowDownSLine
                  aria-hidden
                  className="pointer-events-none absolute right-2 h-4 w-4 text-[#3a3a3a]"
                />
              </label>
            </div>
            </div>

            <details className="group mt-2 w-full">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-[13px] text-[#000091] outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[#000091] [&::-webkit-details-marker]:hidden">
                <RiArrowDownSLine
                  aria-hidden
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                />
                Limitations actuelles
              </summary>
              <div className="mt-2 rounded border border-[#E5E5E5] bg-white p-3 text-[12px] leading-5 text-[#3a3a3a]">
                <ul className="list-disc space-y-1 pl-4">
                  <li>CSV : 100 Mo maximum par défaut pour l’exploration.</li>
                  <li>Les archives doivent encore être extraites avant analyse.</li>
                  <li>
                    Certains formats géographiques ou sémantiques sont déclarés
                    partiels tant que les tests réels ne sont pas branchés.
                  </li>
                  <li>
                    L’URL source est renseignée, mais les agrégations restent
                    mockées tant que le traitement du CSV n’est pas branché.
                  </li>
                </ul>
              </div>
            </details>
          </header>

          <SourcePanel selectedMonth={selectedMonth} />

          <div className="min-h-0 flex-1 overflow-auto">
            <div className="mobile-preview-dashboard space-y-2 p-2">
              {filteredFamilies.map((family) => {
                const Icon = iconByFamily[family.icon];
                const isExpanded = expandedRows.includes(family.id);

                return (
                  <article
                    key={family.id}
                    className="overflow-hidden rounded border border-[#E5E5E5] bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => toggleRow(family.id)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-start gap-2 p-3 text-left"
                    >
                      <RiArrowDownSLine
                        aria-hidden
                        className={`mt-0.5 h-4 w-4 shrink-0 text-[#3a3a3a] transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <Icon
                            aria-hidden
                            className="h-4 w-4 shrink-0 text-[#3a3a3a]"
                          />
                          <h2
                            className={`truncate text-[14px] text-[#161616] ${
                              isExpanded ? "font-medium" : ""
                            }`}
                          >
                            {family.family}
                          </h2>
                          {family.previewableShare === 0 ? (
                            <NotImplementedTag />
                          ) : null}
                        </div>
                        <dl className="mt-3 grid gap-3">
                          <MobileMetric label="Nombre">
                            <CountMetric
                              value={family.count}
                              delta={family.countDelta}
                            />
                          </MobileMetric>
                          <MobileMetric label="% du catalogue">
                            <ProgressMetric
                              value={family.catalogShare}
                              delta={family.catalogDelta}
                            />
                          </MobileMetric>
                          <MobileMetric label="% prévisualisable">
                            <ProgressMetric
                              value={family.previewableShare}
                              delta={family.previewableDelta}
                            />
                          </MobileMetric>
                        </dl>
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-[#E5E5E5] bg-[#f6f6f6] p-2">
                        <div className="space-y-2 pl-2">
                          {family.details.map((detail) => (
                            <div
                              key={detail.format}
                              className="rounded border border-[#E5E5E5] bg-white p-3"
                            >
                              <div className="mb-3 flex min-w-0 items-center gap-2 text-[13px] text-[#161616]">
                                <span className="truncate">{detail.format}</span>
                                {detail.previewableShare === 0 ? (
                                  <NotImplementedTag />
                                ) : null}
                              </div>
                              <dl className="grid gap-3">
                                <MobileMetric label="Nombre">
                                  <CountMetric
                                    value={detail.count}
                                    delta={detail.countDelta}
                                  />
                                </MobileMetric>
                                <MobileMetric label="% du catalogue">
                                  <ProgressMetric
                                    value={detail.catalogShare}
                                    delta={detail.catalogDelta}
                                  />
                                </MobileMetric>
                                <MobileMetric label="% prévisualisable">
                                  <ProgressMetric
                                    value={detail.previewableShare}
                                    delta={detail.previewableDelta}
                                  />
                                </MobileMetric>
                              </dl>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="desktop-preview-dashboard min-w-[820px]">
              <div className="sticky top-0 z-10 grid h-12 grid-cols-[minmax(220px,1.3fr)_140px_190px_210px] border-b border-[#E5E5E5] bg-[#f6f6f6] text-[12px] font-bold text-[#161616]">
                <span className="flex items-center border-r border-[#E5E5E5] px-3">
                  Famille de format
                </span>
                <span className="flex flex-col justify-center border-r border-[#E5E5E5] px-3 text-right">
                  <span>Nombre</span>
                  <span className="text-[11px] font-normal text-[#666666]">
                    vs mois précédent
                  </span>
                </span>
                <span className="flex flex-col justify-center border-r border-[#E5E5E5] px-3">
                  <span>% du catalogue</span>
                  <span className="text-[11px] font-normal text-[#666666]">
                    vs mois précédent
                  </span>
                </span>
                <span className="flex flex-col justify-center border-r border-[#E5E5E5] px-3">
                  <span>% prévisualisable</span>
                  <span className="text-[11px] font-normal text-[#666666]">
                    vs mois précédent
                  </span>
                </span>
              </div>

              {filteredFamilies.map((family) => {
                const Icon = iconByFamily[family.icon];
                const isExpanded = expandedRows.includes(family.id);

                return (
                  <div key={family.id}>
                    <button
                      type="button"
                      onClick={() => toggleRow(family.id)}
                      aria-expanded={isExpanded}
                      className="grid h-14 w-full grid-cols-[minmax(220px,1.3fr)_140px_190px_210px] bg-white text-left text-[13px] hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]"
                    >
                      <span className="flex min-w-0 items-center gap-2 border-b border-r border-[#E5E5E5] px-3">
                        <RiArrowDownSLine
                          aria-hidden
                          className={`h-4 w-4 shrink-0 text-[#3a3a3a] transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                        <Icon
                          aria-hidden
                          className="h-4 w-4 shrink-0 text-[#3a3a3a]"
                        />
                        <span
                          className={`truncate text-[#161616] ${
                            isExpanded ? "font-medium" : ""
                          }`}
                        >
                          {family.family}
                        </span>
                        {family.previewableShare === 0 ? (
                          <NotImplementedTag />
                        ) : null}
                      </span>
                      <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                        <CountMetric
                          value={family.count}
                          delta={family.countDelta}
                        />
                      </span>
                      <span className="flex items-center border-b border-r border-[#E5E5E5] px-3">
                        <ProgressMetric
                          value={family.catalogShare}
                          delta={family.catalogDelta}
                        />
                      </span>
                      <span className="flex items-center border-b border-[#E5E5E5] px-3">
                        <ProgressMetric
                          value={family.previewableShare}
                          delta={family.previewableDelta}
                        />
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className="border-b border-[#E5E5E5] bg-[#FFFFFF]">
                        <div>
                          {family.details.map((detail) => (
                            <div
                              key={detail.format}
                              className="grid h-12 grid-cols-[minmax(220px,1.3fr)_140px_190px_210px] bg-[#FFFFFF] text-[13px]"
                            >
                              <span className="flex min-w-0 items-center gap-2 border-b border-r border-[#E5E5E5] px-10">
                                <span className="truncate text-[#161616]">
                                  {detail.format}
                                </span>
                                {detail.previewableShare === 0 ? (
                                  <NotImplementedTag />
                                ) : null}
                              </span>
                              <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                                <CountMetric
                                  value={detail.count}
                                  delta={detail.countDelta}
                                />
                              </span>
                              <span className="flex items-center border-b border-r border-[#E5E5E5] px-3">
                                <ProgressMetric
                                  value={detail.catalogShare}
                                  delta={detail.catalogDelta}
                                />
                              </span>
                              <span className="flex items-center border-b border-[#E5E5E5] px-3">
                                <ProgressMetric
                                  value={detail.previewableShare}
                                  delta={detail.previewableDelta}
                                />
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
