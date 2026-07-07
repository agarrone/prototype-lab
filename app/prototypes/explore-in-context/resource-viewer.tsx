"use client";

import { useState } from "react";
import {
  RiBook2Line,
  RiDownloadLine,
  RiFileListLine,
  RiMap2Line,
  RiMicroscopeLine,
  RiTableLine,
  RiTerminalLine,
} from "@remixicon/react";
import { ExplorerPrototype } from "../explorateur/page";
import type {
  DatagouvDatasetSummary,
  DatagouvResourceSummary,
} from "@/lib/datagouv";

type ResourceViewMode = "explorer" | "list";
type ResourceDisplayType = "table" | "code" | "geodata" | "documentation";

const resourceIconStyles = {
  table: "bg-[#c3fad5] text-[#18753c]",
  geodata: "bg-[#e6eefe] text-[#0063cb]",
  code: "bg-[#fce164] text-[#716043]",
  documentation: "bg-[#fee7fc] text-[#6e445a]",
} satisfies Record<ResourceDisplayType, string>;

const resourceIcons = {
  table: RiTableLine,
  geodata: RiMap2Line,
  code: RiTerminalLine,
  documentation: RiBook2Line,
} satisfies Record<ResourceDisplayType, typeof RiTableLine>;

export function ResourceViewer({ dataset }: { dataset: DatagouvDatasetSummary }) {
  const [mode, setMode] = useState<ResourceViewMode>("explorer");
  const [selectedResourceId, setSelectedResourceId] = useState<
    string | undefined
  >();
  const datasetReference = dataset.slug || dataset.id;

  return (
    <section>
      <div className="mb-2 flex justify-end">
        <div
          aria-label="Mode d’affichage des ressources"
          className="flex flex-wrap items-center rounded border border-[#E5E5E5] bg-[#FFFFFF]"
          role="group"
        >
          <ViewModeButton
            active={mode === "explorer"}
            icon={<RiMicroscopeLine aria-hidden className="h-3.5 w-3.5" />}
            label="Explorer"
            onClick={() => setMode("explorer")}
          />
          <ViewModeButton
            active={mode === "list"}
            icon={<RiFileListLine aria-hidden className="h-3.5 w-3.5" />}
            label="Liste"
            onClick={() => setMode("list")}
          />
        </div>
      </div>

      {mode === "explorer" ? (
        <ExplorerPrototype
          embedded
          datasetReference={datasetReference}
          datasetResources={dataset.resources}
          initialResourceId={selectedResourceId}
          returnTo={`/prototypes/explore-in-context?dataset=${encodeURIComponent(
            datasetReference,
          )}`}
        />
      ) : (
        <ResourceList
          resources={dataset.resources}
          onExplore={(resourceId) => {
            setSelectedResourceId(resourceId);
            setMode("explorer");
          }}
        />
      )}
    </section>
  );
}

function ViewModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12px] font-medium leading-6 ${
        active
          ? "border border-[#000091] text-[#000091]"
          : "text-[#161616] hover:bg-[#f6f6f6]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ResourceList({
  resources,
  onExplore,
}: {
  resources: DatagouvResourceSummary[];
  onExplore: (resourceId: string) => void;
}) {
  if (resources.length === 0) {
    return (
      <section className="flex items-center justify-center border border-[#E5E5E5] bg-[#FFFFFF] p-6">
        <p className="text-[14px] leading-6 text-[#3a3a3a]">
          Aucune ressource disponible pour ce jeu de données.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-x-auto border border-[#E5E5E5] bg-[#FFFFFF]">
      <div className="p-2">
        {resources.map((resource) => (
          <ResourceListItem
            key={resource.id}
            resource={resource}
            onExplore={() => onExplore(resource.id)}
          />
        ))}
      </div>
    </section>
  );
}

function ResourceListItem({
  resource,
  onExplore,
}: {
  resource: DatagouvResourceSummary;
  onExplore: () => void;
}) {
  const type = getResourceDisplayType(resource);
  const Icon = resourceIcons[type];

  return (
    <article className="rounded px-1 py-1 hover:bg-[#f6f6f6]">
      <div className="flex min-h-7 min-w-[1120px] items-center gap-1">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[1px] ${resourceIconStyles[type]}`}
        >
          <Icon aria-hidden className="h-4 w-4 shrink-0" />
        </span>
        <span className="min-w-0 truncate text-[13px] font-medium text-[#3a3a3a]">
          {resource.title}
        </span>
        <span className="shrink-0 whitespace-nowrap px-1 text-[12px] text-[#3a3a3a]">
          ·
        </span>
        <span className="shrink-0 whitespace-nowrap text-[12px] leading-5 text-[#3a3a3a]">
          Mis à jour le {resource.updatedAtLabel}
        </span>
        <span className="shrink-0 whitespace-nowrap px-1 text-[12px] text-[#3a3a3a]">
          ·
        </span>
        <span className="shrink-0 whitespace-nowrap text-[12px] leading-5 text-[#3a3a3a]">
          {resource.sizeLabel}
        </span>
        <span className="shrink-0 whitespace-nowrap px-1 text-[12px] text-[#3a3a3a]">
          ·
        </span>
        <FormatTag>{resource.format}</FormatTag>
        <span className="shrink-0 whitespace-nowrap px-1 text-[12px] text-[#3a3a3a]">
          ·
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] leading-5 text-[#3a3a3a]">
          <RiDownloadLine aria-hidden className="h-3 w-3" />
          {resource.downloads.toLocaleString("fr-FR")}
        </span>
        <span className="ml-auto flex shrink-0 items-center justify-end gap-1 pl-3">
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex h-6 items-center rounded px-2 text-[12px] font-medium leading-5 text-[#000091] hover:bg-[#eeeeee]"
          >
            Explorer
          </button>
          {resource.url ? (
            <a
              href={resource.url}
              className="inline-flex h-6 items-center gap-1 rounded px-2 text-[12px] font-medium leading-5 text-[#000091] hover:bg-[#eeeeee]"
            >
              <RiDownloadLine aria-hidden className="h-3.5 w-3.5" />
              Télécharger
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-6 cursor-not-allowed items-center gap-1 rounded px-2 text-[12px] font-medium leading-5 text-[#929292]"
            >
              <RiDownloadLine aria-hidden className="h-3.5 w-3.5" />
              Télécharger
            </button>
          )}
        </span>
      </div>
    </article>
  );
}

function FormatTag({ children }: { children: string }) {
  return (
    <span className="rounded bg-[#eeeeee] px-2 py-0.5 text-[12px] leading-4 text-[#3a3a3a]">
      {children}
    </span>
  );
}

function getResourceDisplayType(
  resource: DatagouvResourceSummary,
): ResourceDisplayType {
  const format = resource.format.toUpperCase();
  const type = resource.type.toLowerCase();

  if (
    type.includes("documentation") ||
    ["PDF", "DOC", "DOCX", "ODT", "RTF"].includes(format)
  ) {
    return "documentation";
  }

  if (["GEOJSON", "SHP", "SHAPEFILE", "KML", "GPX"].includes(format)) {
    return "geodata";
  }

  if (["JSON", "XML", "XSD", "YAML", "YML"].includes(format)) {
    return "code";
  }

  return "table";
}
