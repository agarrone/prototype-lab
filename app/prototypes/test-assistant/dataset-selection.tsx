"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiLink,
  RiLoader4Line,
  RiSearchLine,
} from "@remixicon/react";
import type { DatagouvDatasetSummary } from "@/lib/datagouv";
import {
  assistantTestDatasets,
  type AssistantTestDataset,
} from "./datasets";

type SelectableParquetResource = {
  id: string;
  title: string;
  sourceFormat: string;
  url: string;
};

type SelectableDataset = Omit<AssistantTestDataset, "parquetUrl"> & {
  id: string;
  parquetResources: SelectableParquetResource[];
};

type SearchResponse = {
  datasets?: DatagouvDatasetSummary[];
  error?: string;
};

export function DatasetSelection() {
  const router = useRouter();
  const examples = useMemo(
    () =>
      assistantTestDatasets.map((dataset) => ({
        reference: dataset.reference,
        title: dataset.title,
        organization: dataset.organization,
        id: dataset.reference,
        parquetResources: [
          {
            id: `${dataset.reference}-parquet`,
            title: "Version Parquet du jeu de données",
            sourceFormat: "CSV",
            url: dataset.parquetUrl,
          },
        ],
      })),
    [],
  );
  const [selected, setSelected] = useState<SelectableDataset | null>(null);
  const [selectedParquetUrl, setSelectedParquetUrl] = useState("");
  const [query, setQuery] = useState("");
  const [link, setLink] = useState("");
  const [results, setResults] = useState<DatagouvDatasetSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");

  function selectSummary(dataset: DatagouvDatasetSummary) {
    const parquetResources = dataset.resources.flatMap((resource) =>
      resource.parquetUrl
        ? [
            {
              id: resource.id,
              title: resource.title,
              sourceFormat: resource.format,
              url: resource.parquetUrl,
            },
          ]
        : [],
    );
    if (!parquetResources.length) return;

    selectDataset({
      id: dataset.id,
      reference: dataset.slug || dataset.id,
      title: dataset.title,
      organization: dataset.organizationName,
      parquetResources,
    });
    setResults([]);
    setError("");
  }

  function selectDataset(dataset: SelectableDataset) {
    setSelected(dataset);
    setSelectedParquetUrl(dataset.parquetResources[0]?.url ?? "");
  }

  async function selectExample(dataset: SelectableDataset) {
    setIsResolving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/prototypes/test-assistant/datasets/resolve?input=${encodeURIComponent(dataset.reference)}`,
      );
      const payload = (await response.json()) as SearchResponse & {
        dataset?: DatagouvDatasetSummary;
      };
      if (!response.ok || !payload.dataset) throw new Error();
      selectSummary(payload.dataset);
    } catch {
      selectDataset(dataset);
    } finally {
      setIsResolving(false);
    }
  }

  async function search() {
    if (query.trim().length < 2) {
      setError("Saisissez au moins deux caractères.");
      return;
    }
    setIsSearching(true);
    setError("");
    try {
      const response = await fetch(
        `/api/prototypes/test-assistant/datasets/search?q=${encodeURIComponent(query.trim())}`,
      );
      const payload = (await response.json()) as SearchResponse;
      if (!response.ok) throw new Error(payload.error ?? "Recherche impossible.");
      setResults(payload.datasets ?? []);
      if (!payload.datasets?.length) {
        setError("Aucun jeu de données avec une version Parquet disponible n’a été trouvé.");
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Recherche impossible.");
    } finally {
      setIsSearching(false);
    }
  }

  async function resolve() {
    if (!link.trim()) return;
    setIsResolving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/prototypes/test-assistant/datasets/resolve?input=${encodeURIComponent(link.trim())}`,
      );
      const payload = (await response.json()) as SearchResponse & {
        dataset?: DatagouvDatasetSummary;
      };
      if (!response.ok || !payload.dataset) {
        throw new Error(payload.error ?? "Jeu de données introuvable.");
      }
      selectSummary(payload.dataset);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Jeu de données introuvable.");
    } finally {
      setIsResolving(false);
    }
  }

  function continueToDataset() {
    if (!selected || !selectedParquetUrl) return;
    const params = new URLSearchParams({
      dataset: selected.reference,
      parquet: selectedParquetUrl,
    });
    router.push(`/prototypes/test-assistant?${params}`);
  }

  return (
    <section aria-labelledby="choose-dataset" className="border-t border-[#dddddd] pt-8">
      <div className="mb-6 max-w-2xl">
        <h2 id="choose-dataset" className="text-2xl font-bold leading-8 text-[#161616]">
          Choisissez un jeu de données
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-[#3a3a3a]">
          Les fichiers CSV convertis automatiquement par data.gouv.fr en Parquet sont compatibles, tout comme les fichiers Parquet publiés directement.
        </p>
      </div>

      <h3 className="mb-3 text-[16px] font-bold leading-6 text-[#161616]">
        Choisissez parmi cette liste
      </h3>
      <div className="grid gap-2">
        {examples.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            selected={selected?.id === dataset.id}
            onSelect={() => void selectExample(dataset)}
          />
        ))}
      </div>

      <div className="my-7 flex items-center gap-3 text-[13px] font-medium text-[#666666]">
        <span className="h-px flex-1 bg-[#dddddd]" />
        ou choisissez un autre jeu de données
        <span className="h-px flex-1 bg-[#dddddd]" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void search();
          }}
          className="space-y-2"
        >
          <label htmlFor="dataset-search" className="block text-[14px] font-bold text-[#161616]">
            Rechercher sur data.gouv.fr
          </label>
          <div className="flex min-h-10 border-b-2 border-[#000091] bg-[#eeeeee]">
            <RiSearchLine aria-hidden className="ml-3 mt-3 h-4 w-4 shrink-0 text-[#3a3a3a]" />
            <input
              id="dataset-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom du jeu de données"
              className="min-w-0 flex-1 bg-transparent px-2 text-[14px] outline-none placeholder:text-[#666666]"
            />
            <button type="submit" disabled={isSearching} className="inline-flex items-center gap-2 bg-[#000091] px-4 text-[14px] font-medium text-white disabled:opacity-60">
              {isSearching ? <RiLoader4Line aria-hidden className="h-4 w-4 animate-spin" /> : null}
              Rechercher
            </button>
          </div>
        </form>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void resolve();
          }}
          className="space-y-2"
        >
          <label htmlFor="dataset-link" className="block text-[14px] font-bold text-[#161616]">
            Coller le lien d’un jeu de données
          </label>
          <div className="flex min-h-10 border-b-2 border-[#000091] bg-[#eeeeee]">
            <RiLink aria-hidden className="ml-3 mt-3 h-4 w-4 shrink-0 text-[#3a3a3a]" />
            <input
              id="dataset-link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://www.data.gouv.fr/datasets/..."
              className="min-w-0 flex-1 bg-transparent px-2 text-[14px] outline-none placeholder:text-[#666666]"
            />
            <button type="submit" disabled={isResolving} className="inline-flex items-center gap-2 bg-[#000091] px-4 text-[14px] font-medium text-white disabled:opacity-60">
              {isResolving ? <RiLoader4Line aria-hidden className="h-4 w-4 animate-spin" /> : null}
              Vérifier
            </button>
          </div>
        </form>
      </div>

      {error ? <p role="alert" className="mt-3 text-[13px] text-[#ce0500]">{error}</p> : null}

      {results.length ? (
        <div className="mt-4 divide-y divide-[#dddddd] border-y border-[#dddddd]">
          {results.map((dataset) => (
            <button key={dataset.id} type="button" onClick={() => selectSummary(dataset)} className="flex w-full items-center justify-between gap-4 px-1 py-3 text-left hover:bg-[#f6f6f6]">
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-[#161616]">{dataset.title}</span>
                <span className="block truncate text-[13px] text-[#666666]">{dataset.organizationName} · {dataset.resources.filter((resource) => resource.parquetUrl).length} ressource(s) disponible(s) en Parquet</span>
              </span>
              <RiArrowRightLine aria-hidden className="h-5 w-5 shrink-0 text-[#000091]" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 border-t border-[#dddddd] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-h-6 text-[14px] text-[#3a3a3a]">
          {selected ? <><strong>{selected.title}</strong> est sélectionné.</> : "Sélectionnez un jeu de données pour continuer."}
        </p>
        <button type="button" onClick={continueToDataset} disabled={!selected || !selectedParquetUrl} className="inline-flex h-10 items-center justify-center gap-2 bg-[#000091] px-5 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:bg-[#dddddd] disabled:text-[#929292]">
          Continuer
          <RiArrowRightLine aria-hidden className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function DatasetCard({ dataset, selected, onSelect }: { dataset: SelectableDataset; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded px-3 py-2.5 text-left transition-colors ${
        selected ? "bg-[#e8edff]" : "bg-[#f6f6f6] hover:bg-[#eeeeee]"
      }`}
    >
      <span className="min-w-0 text-[14px] leading-5">
        <strong className="font-bold text-[#161616]">{dataset.title}</strong>
        <span className="text-[#666666]"> · {dataset.organization}</span>
      </span>
      {selected ? (
        <RiCheckboxCircleFill aria-hidden className="h-5 w-5 shrink-0 text-[#000091]" />
      ) : (
        <RiArrowRightLine aria-hidden className="h-4 w-4 shrink-0 text-[#000091]" />
      )}
    </button>
  );
}
