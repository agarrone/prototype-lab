"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Chart from "chart.js/auto";
import type { ChartOptions } from "chart.js";
import {
  RiAlertLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiBarChartBoxLine,
  RiFileCodeLine,
  RiFileTextLine,
  RiFolderZipLine,
  RiMap2Line,
  RiSearchLine,
  RiServerLine,
  RiTableLine,
} from "@remixicon/react";
import type {
  FormatFamily,
  PreviewDashboardData,
} from "./preview-dashboard-data";

const iconByFamily = {
  table: RiTableLine,
  geo: RiMap2Line,
  document: RiFileTextLine,
  code: RiFileCodeLine,
  archive: RiFolderZipLine,
  service: RiServerLine,
} satisfies Record<FormatFamily["icon"], typeof RiTableLine>;

type DashboardTab = "Statistique" | "Ressources";

const dashboardTabs: DashboardTab[] = ["Statistique", "Ressources"];
const lightChartColor = "#B6CFFB";
const chartColor = "#3558A2";
function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 1,
  }).format(value)} %`;
}

function getSourceShare(data: PreviewDashboardData, sourceLabel: string) {
  return (
    data.sourceBreakdown.find(
      (source) => source.label.toLowerCase() === sourceLabel.toLowerCase(),
    )?.share ?? 0
  );
}

function buildFallbackMonthlySeries(value: number, month = "2026-06") {
  return { [`${month}-01`]: value };
}

function getMonthlyMetricSeries(
  data: PreviewDashboardData,
  metric: "totalResources" | "previewableShare",
) {
  const entries = Object.entries(data.monthlyStats ?? {});

  if (!entries.length) {
    return buildFallbackMonthlySeries(
      metric === "totalResources" ? data.totalResources : data.previewableShare,
      data.statsMonth,
    );
  }

  return Object.fromEntries(
    entries.map(([month, stats]) => [month, stats[metric]]),
  );
}

function getMonthYear(dateAsString: string) {
  const date = new Date(dateAsString);
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getFullYear()
    .toString()
    .slice(-2)}`;
}

const smallChartOptions = {
  animation: {
    duration: 400,
  },
  devicePixelRatio: 1,
  responsive: false,
  clip: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  elements: {
    bar: {
      backgroundColor: lightChartColor,
      borderRadius: 2,
      hoverBackgroundColor: chartColor,
    },
    line: {
      backgroundColor: chartColor,
      borderColor: chartColor,
      borderJoinStyle: "round",
      borderWidth: 3,
      tension: 0.35,
    },
    point: {
      radius: 0,
    },
  },
  scales: {
    x: {
      display: false,
      grid: { display: false },
      ticks: { display: false },
    },
    y: {
      display: false,
      grid: { display: false },
      ticks: { display: false },
    },
  },
  layout: {
    padding: {
      top: 2,
      bottom: 2,
    },
  },
} satisfies ChartOptions;

function SmallChart({
  data,
  height = 30,
  showAxisLabel = true,
  type,
  width = 120,
}: {
  data: Record<string, number>;
  height?: number;
  showAxisLabel?: boolean;
  type: "line" | "bar";
  width?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sortedEntries = useMemo(
    () => Object.entries(data).sort(([first], [second]) => first.localeCompare(second)),
    [data],
  );
  const labels = sortedEntries.map(([label]) => label);
  const values = sortedEntries.map(([, value]) => value);
  const startDate = labels.length ? getMonthYear(labels[0]) : null;
  const endDate = labels.length ? getMonthYear(labels[labels.length - 1]) : null;

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");

    if (!context) {
      return undefined;
    }

    const chart = new Chart(context, {
      data: {
        labels,
        datasets: [
          {
            data: values,
            ...(type === "bar"
              ? {
                  type: "bar" as const,
                  barPercentage: 1,
                  categoryPercentage: 0.9,
                  backgroundColor: labels.map((_, index) =>
                    index === labels.length - 1 ? chartColor : lightChartColor,
                  ),
                }
              : {
                  type: "line" as const,
                }),
          },
        ],
      },
      options: smallChartOptions,
    });

    return () => chart.destroy();
  }, [labels, type, values]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width * 2}
        height={height * 2}
        style={{ width, height }}
      />
      {showAxisLabel ? (
        <div className="flex flex-wrap justify-between">
          <p className="m-0 text-[10px] text-[#666666]">{startDate}</p>
          <p className="m-0 text-[10px] text-[#666666]">{endDate}</p>
        </div>
      ) : null}
    </div>
  );
}

function StatChartCard({
  label,
  value,
  note,
  chartData,
  chartType = "line",
}: {
  label: string;
  value: string;
  note?: string;
  chartData: Record<string, number>;
  chartType?: "line" | "bar";
}) {
  return (
    <div className="min-w-0 border-r border-[#E5E5E5] bg-white px-3 py-3 last:border-r-0">
      <dt className="truncate text-[12px] leading-4 text-[#666666]">{label}</dt>
      <dd className="mt-1 flex min-w-0 items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="block truncate text-[20px] font-bold leading-7 text-[#161616]">
            {value}
          </span>
          {note ? (
            <span className="mt-0.5 block truncate text-[12px] leading-4 text-[#666666]">
              {note}
            </span>
          ) : null}
        </div>
        <div className="shrink-0">
          <SmallChart
            data={chartData}
            showAxisLabel={false}
            type={chartType}
            width={96}
          />
        </div>
      </dd>
    </div>
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

function ProgressMetric({
  value,
  tone = "neutral",
}: {
  value: number;
  tone?: "neutral" | "blue";
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-2">
      <div className="h-2 w-24 overflow-hidden rounded-full border border-[#CECECE] bg-[#eeeeee]">
        <div
          className={`h-full rounded-full bg-[#9CA3AF]`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="w-14 text-right text-[12px] text-[#161616]">
        {formatPercent(value)}
      </span>
    </div>
  );
}

function CountMetric({ value }: { value: number }) {
  return (
    <span className="text-[13px] text-[#161616]">{formatNumber(value)}</span>
  );
}

function PercentMetric({ value }: { value: number }) {
  return (
    <span className="text-[13px] text-[#161616]">{formatPercent(value)}</span>
  );
}

function SourcePanel({ data }: { data: PreviewDashboardData }) {
  return (
    <div className="border-b border-[#E5E5E5] bg-white px-3 py-3">
      <div className="grid gap-3 text-[13px] lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-[#161616]">
            Source : statistiques de prévisualisation
          </p>
          <p className="mt-1 text-[12px] text-[#666666]">
            {formatNumber(data.totalResources)} ressources analysées
            {data.statsMonth ? ` · mois ${data.statsMonth}` : ""}
          </p>
        </div>
        <label className="flex h-8 w-full items-center rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2 lg:w-[460px]">
          <input
            value={data.staticCsvUrl ?? data.sourceUrl}
            readOnly
            aria-label="URL source analysée"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none"
          />
        </label>
      </div>
    </div>
  );
}

function LimitationsPanel() {
  return (
    <details className="group mt-3 w-full">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-[13px] text-[#000091] outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[#000091] [&::-webkit-details-marker]:hidden">
        <RiArrowDownSLine
          aria-hidden
          className="h-4 w-4 transition-transform group-open:rotate-180"
        />
        Limitations actuelles
      </summary>
      <div className="mt-2 rounded border border-[#E5E5E5] bg-white p-3 text-[12px] leading-5 text-[#3a3a3a]">
        <ul className="list-disc space-y-1 pl-4">
          <li>JSON : prévisualisation limitée à environ 1 Mo de contenu texte.</li>
          <li>PDF : prévisualisation limitée aux fichiers de 10 Mo maximum.</li>
          <li>XML : prévisualisation limitée à environ 100 Ko de contenu texte.</li>
          <li>Images : prévisualisation limitée aux fichiers de 10 Mo maximum.</li>
          <li>Seuls les formats représentant au moins 100 ressources sont affichés individuellement.</li>
          <li>Certains formats très proches ont été regroupés pour rendre l’analyse plus lisible.</li>
        </ul>
      </div>
    </details>
  );
}

function DashboardTabs({
  activeTab,
  onChange,
}: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}) {
  return (
    <>
      <div className="mobile-preview-dashboard border-b border-[#E5E5E5] bg-white px-2 py-2">
        <label className="flex h-9 w-full items-center gap-2 rounded border border-[#E5E5E5] bg-white px-2">
          <select
            value={activeTab}
            onChange={(event) => onChange(event.target.value as DashboardTab)}
            aria-label="Choisir une vue"
            className="min-w-0 flex-1 appearance-none bg-transparent text-[13px] font-medium text-[#161616] outline-none"
          >
            {dashboardTabs.map((tab) => (
              <option key={tab} value={tab}>
                {tab}
              </option>
            ))}
          </select>
          <RiArrowDownSLine
            aria-hidden
            className="h-4 w-4 shrink-0 text-[#3a3a3a]"
          />
        </label>
      </div>

      <div className="desktop-preview-dashboard border-b border-[#E5E5E5] bg-white px-2 py-2">
        <div className="flex flex-wrap items-center rounded border border-[#E5E5E5] w-fit">
          {dashboardTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
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
    </>
  );
}

function ResourceExplorerPanel({
  resourcePreview,
}: {
  resourcePreview: NonNullable<PreviewDashboardData["resourcePreview"]>;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="border-b border-[#E5E5E5] bg-white px-3 py-2">
        <div className="grid gap-1 text-[13px] sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-[#161616]">Explorateur de ressources</p>
            <p className="mt-1 text-[12px] text-[#666666]">
              20 premières lignes du fichier source.
            </p>
          </div>
          <label className="flex h-8 w-full items-center rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2 sm:w-[460px]">
            <input
              value={resourcePreview.sourceUrl}
              readOnly
              aria-label="URL de la ressource explorée"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none"
            />
          </label>
        </div>
      </div>

      <div className="overflow-auto">
        <div className="min-w-[1320px]">
          <div
            className="sticky top-0 z-10 grid h-10 border-b border-[#E5E5E5] bg-[#f6f6f6] text-[12px] font-bold text-[#161616]"
            style={{
              gridTemplateColumns: `repeat(${resourcePreview.columns.length}, minmax(160px, 1fr))`,
            }}
          >
            {resourcePreview.columns.map((column) => (
              <span
                key={column}
                className="flex min-w-0 items-center border-r border-[#E5E5E5] px-3 last:border-r-0"
              >
                <span className="truncate">{column}</span>
              </span>
            ))}
          </div>

          {resourcePreview.rows.map((row, rowIndex) => (
            <div
              key={`${row[0] ?? "row"}-${rowIndex}`}
              className="grid min-h-10 bg-white text-[12px] text-[#161616]"
              style={{
                gridTemplateColumns: `repeat(${resourcePreview.columns.length}, minmax(160px, 1fr))`,
              }}
            >
              {resourcePreview.columns.map((column, columnIndex) => (
                <span
                  key={`${column}-${columnIndex}`}
                  className="flex min-w-0 items-center border-b border-r border-[#E5E5E5] px-3 py-2 last:border-r-0"
                >
                  <span className="truncate" title={row[columnIndex] ?? ""}>
                    {row[columnIndex] || "—"}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PreviewDashboardClient({
  data,
  error,
}: {
  data: PreviewDashboardData;
  error: string | null;
}) {
  const [expandedRows, setExpandedRows] = useState<string[]>([
    data.families[0]?.id ?? "",
  ]);
  const [activeDashboardTab, setActiveDashboardTab] =
    useState<DashboardTab>("Statistique");
  const [query, setQuery] = useState("");
  const harvestShare = getSourceShare(data, "harvest");
  const remoteShare = getSourceShare(data, "remote");
  const staticShare = getSourceShare(data, "static");

  const filteredFamilies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.families
      .map((family) => {
        const details = family.details.filter((detail) => {
          const matchesQuery =
            !normalizedQuery ||
            [family.family, detail.format]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);

          return matchesQuery;
        });

        const familyMatchesQuery =
          !normalizedQuery || family.family.toLowerCase().includes(normalizedQuery);

        if (familyMatchesQuery || details.length > 0) {
          return { ...family, details };
        }

        return null;
      })
      .filter((family): family is FormatFamily => family !== null);
  }, [data.families, query]);

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
                  Suivi réel des ressources prévisualisables sur data.gouv.fr.
                </p>
              </div>
            </div>

            {error ? (
              <div className="mt-3 flex items-start gap-2 rounded border border-[#f3d8d4] bg-[#fff4f3] p-3 text-[12px] leading-5 text-[#b34000]">
                <RiAlertLine aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

          </header>

          <SourcePanel data={data} />

          <DashboardTabs
            activeTab={activeDashboardTab}
            onChange={setActiveDashboardTab}
          />

          {activeDashboardTab === "Ressources" && data.resourcePreview ? (
            <ResourceExplorerPanel resourcePreview={data.resourcePreview} />
          ) : (
            <>
              <div className="border-b border-[#E5E5E5] bg-white px-3 py-3">
                <LimitationsPanel />

                <dl className="mt-3 grid overflow-hidden rounded border border-[#E5E5E5] bg-white sm:grid-cols-2 lg:grid-cols-5">
                  <StatChartCard
                    label="Ressources analysées"
                    value={formatNumber(data.totalResources)}
                    note={data.statsMonth ? `mois ${data.statsMonth}` : "lignes du CSV"}
                    chartData={getMonthlyMetricSeries(data, "totalResources")}
                    chartType="bar"
                  />
                  <StatChartCard
                    label="Prévisualisation totale"
                    value={formatPercent(data.previewableShare)}
                    note={`${formatNumber(data.previewableResources)} ressources`}
                    chartData={getMonthlyMetricSeries(data, "previewableShare")}
                  />
                  <StatChartCard
                    label="Harvest"
                    value={formatPercent(harvestShare)}
                    note={formatNumber(data.sourceBreakdown.find(s => s.label === "harvest")?.count ?? 0) + " ressources"}
                    chartData={buildFallbackMonthlySeries(harvestShare, data.statsMonth)}
                  />
                  <StatChartCard
                    label="Remote"
                    value={formatPercent(remoteShare)}
                    note={formatNumber(data.sourceBreakdown.find(s => s.label === "remote")?.count ?? 0) + " ressources"}
                    chartData={buildFallbackMonthlySeries(remoteShare, data.statsMonth)}
                  />
                  <StatChartCard
                    label="Static"
                    value={formatPercent(staticShare)}
                    note={formatNumber(data.sourceBreakdown.find(s => s.label === "static")?.count ?? 0) + " ressources"}
                    chartData={buildFallbackMonthlySeries(staticShare, data.statsMonth)}
                  />
                </dl>
              </div>

              <div className="border-b border-[#E5E5E5] bg-white px-3 py-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-[12px] font-bold uppercase leading-4 text-[#666666]">
                    Tableau des formats
                  </p>
                  <label className="flex h-8 min-w-0 items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2 sm:w-[260px]">
                    <RiSearchLine
                      aria-hidden
                      className="h-3.5 w-3.5 text-[#3a3a3a]"
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      aria-label="Rechercher une famille ou un format"
                      placeholder="Rechercher"
                      className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                    />
                  </label>
                </div>
              </div>

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
                          <h2 className="truncate text-[14px] font-medium text-[#161616]">
                            {family.family}
                          </h2>
                        </div>
                        <dl className="mt-3 grid gap-3">
                          <MobileMetric label="Ressources">
                            <CountMetric value={family.count} />
                          </MobileMetric>
                          <MobileMetric label="% Catalogue">
                            <PercentMetric value={family.catalogShare} />
                          </MobileMetric>
                          <MobileMetric label="% Erreur">
                            <PercentMetric value={family.details.reduce((sum, d) => sum + d.errorShare * d.count, 0) / family.count} />
                          </MobileMetric>
                          <MobileMetric label="% Taille trop grande">
                            <PercentMetric value={family.details.reduce((sum, d) => sum + d.tooBigShare * d.count, 0) / family.count} />
                          </MobileMetric>
                          <MobileMetric label="% Prévisualisable">
                            <ProgressMetric
                              value={family.previewableShare}
                              tone="blue"
                            />
                          </MobileMetric>
                        </dl>
                      </div>
                    </button>

                    {isExpanded ? (
                      <div className="border-t border-[#E5E5E5] bg-[#f6f6f6] p-2">
                        <div className="space-y-2 pl-2">
                          {family.details.slice(0, 20).map((detail) => (
                            <div
                              key={detail.id}
                              className="rounded border border-[#E5E5E5] bg-[#f6f6f6] p-2"
                            >
                              <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2 text-[13px] text-[#161616]">
                                <a
                                  href="#"
                                  className="truncate font-medium text-[#000091] underline hover:text-[#3558A2]"
                                >
                                  {detail.format}
                                </a>
                              </div>
                              <dl className="grid gap-2">
                                <MobileMetric label="Ressources">
                                  <CountMetric value={detail.count} />
                                </MobileMetric>
                                <MobileMetric label="% Catalogue">
                                  <PercentMetric value={detail.catalogShare} />
                                </MobileMetric>
                                <MobileMetric label="% Erreur">
                                  <PercentMetric value={detail.errorShare} />
                                </MobileMetric>
                                <MobileMetric label="% Taille trop grande">
                                  <PercentMetric value={detail.tooBigShare} />
                                </MobileMetric>
                                <MobileMetric label="% Prévisualisable">
                                  <ProgressMetric
                                    value={detail.previewableShare}
                                    tone="blue"
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

            <div className="desktop-preview-dashboard min-w-[780px]">
              <div className="sticky top-0 z-10 grid h-12 grid-cols-[minmax(240px,1.3fr)_140px_140px_140px_140px_190px] border-b border-[#E5E5E5] bg-[#f6f6f6] text-[12px] font-bold text-[#161616]">
                <span className="flex items-center border-r border-[#E5E5E5] px-3">
                  Famille ou format
                </span>
                <span className="flex items-center justify-end border-r border-[#E5E5E5] px-3">
                  Ressources
                </span>
                <span className="flex items-center justify-end border-r border-[#E5E5E5] px-3">
                  % Catalogue
                </span>
                <span className="flex items-center justify-end border-r border-[#E5E5E5] px-3">
                  % Erreur
                </span>
                <span className="flex items-center justify-end border-r border-[#E5E5E5] px-3">
                  % Taille trop grande
                </span>
                <span className="flex items-center justify-end border-r border-[#E5E5E5] px-3">
                  % Prévisualisable
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
                      className="grid h-14 w-full grid-cols-[minmax(240px,1.3fr)_140px_140px_140px_140px_190px] bg-white text-left text-[13px] hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]"
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
                        <span className="truncate font-medium text-[#161616]">
                          {family.family}
                        </span>
                      </span>
                      <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                        <CountMetric value={family.count} />
                      </span>
                      <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                        <PercentMetric value={family.catalogShare} />
                      </span>
                      <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                        <PercentMetric value={family.details.reduce((sum, d) => sum + d.errorShare * d.count, 0) / family.count} />
                      </span>
                      <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                        <PercentMetric value={family.details.reduce((sum, d) => sum + d.tooBigShare * d.count, 0) / family.count} />
                      </span>
                      <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                        <ProgressMetric
                          value={family.previewableShare}
                          tone="blue"
                        />
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className="border-b border-[#E5E5E5] bg-[#f6f6f6]">
                        {family.details.map((detail) => (
                          <div
                            key={detail.id}
                            className="grid min-h-10 grid-cols-[minmax(240px,1.3fr)_140px_140px_140px_140px_190px] bg-[#f6f6f6] text-[13px]"
                          >
                            <span className="flex min-w-0 items-center gap-2 border-b border-r border-[#E5E5E5] px-10 py-1.5">
                              <a
                                href="#"
                                className="truncate text-[#000091] underline hover:text-[#3558A2]"
                              >
                                {detail.format}
                              </a>
                            </span>
                            <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                              <CountMetric value={detail.count} />
                            </span>
                            <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                              <PercentMetric value={detail.catalogShare} />
                            </span>
                            <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                              <PercentMetric value={detail.errorShare} />
                            </span>
                            <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                              <PercentMetric value={detail.tooBigShare} />
                            </span>
                            <span className="flex items-center justify-end border-b border-r border-[#E5E5E5] px-3">
                              <ProgressMetric
                                value={detail.previewableShare}
                                tone="blue"
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
