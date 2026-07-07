"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RiArrowRightLine,
  RiLink,
  RiLoader4Line,
  RiSearchLine,
} from "@remixicon/react";
import type { DatagouvDatasetSummary } from "@/lib/datagouv";

type SearchResponse = {
  datasets?: DatagouvDatasetSummary[];
  error?: string;
};

type ResolveResponse = {
  dataset?: DatagouvDatasetSummary;
  error?: string;
};

export function DatasetSwitcher({
  currentDataset,
}: {
  currentDataset: DatagouvDatasetSummary;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [results, setResults] = useState<DatagouvDatasetSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");

  async function searchDatasets() {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      setResults([]);
      return;
    }

    setError("");
    setIsSearching(true);

    try {
      const response = await fetch(
        `/api/prototypes/explore-in-context/datasets/search?q=${encodeURIComponent(
          normalizedQuery,
        )}`,
      );
      const payload = (await response.json()) as SearchResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Recherche impossible.");
      }

      setResults(payload.datasets ?? []);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Recherche impossible.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  async function resolveDataset() {
    const normalizedInput = linkInput.trim();
    if (!normalizedInput) {
      return;
    }

    setError("");
    setIsResolving(true);

    try {
      const response = await fetch(
        `/api/prototypes/explore-in-context/datasets/resolve?input=${encodeURIComponent(
          normalizedInput,
        )}`,
      );
      const payload = (await response.json()) as ResolveResponse;

      if (!response.ok || !payload.dataset) {
        throw new Error(payload.error ?? "Dataset introuvable.");
      }

      selectDataset(payload.dataset);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Dataset introuvable.",
      );
    } finally {
      setIsResolving(false);
    }
  }

  function selectDataset(dataset: DatagouvDatasetSummary) {
    router.push(
      `/prototypes/explore-in-context?dataset=${encodeURIComponent(
        dataset.slug || dataset.id,
      )}`,
    );
    setResults([]);
    setQuery("");
    setLinkInput("");
  }

  return (
    <section className="border-b border-[#E5E5E5] pb-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="min-w-0 lg:w-[28rem]">
          <p className="text-[11px] font-medium uppercase leading-4 text-[#666666]">
            Jeu de données
          </p>
          <p className="truncate text-[13px] font-bold leading-5 text-[#161616]">
            {currentDataset.title}
          </p>
        </div>

        <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="flex h-8 min-w-0 items-center gap-2 border border-[#E5E5E5] bg-white px-2">
            <span className="sr-only">Rechercher un dataset sur data.gouv.fr</span>
            <RiSearchLine aria-hidden className="h-4 w-4 text-[#3a3a3a]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchDatasets();
                }
              }}
              placeholder="Rechercher un dataset"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#161616] outline-none placeholder:text-[#666666]"
            />
            <button
              type="button"
              onClick={() => void searchDatasets()}
              className="inline-flex h-6 items-center gap-1 px-1.5 text-[12px] font-medium text-[#000091] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSearching}
            >
              {isSearching ? (
                <RiLoader4Line
                  aria-hidden
                  className="h-3.5 w-3.5 animate-spin"
                />
              ) : null}
              Rechercher
            </button>
          </label>

          <label className="flex h-8 min-w-0 items-center gap-2 border border-[#E5E5E5] bg-white px-2">
            <span className="sr-only">Coller un lien data.gouv.fr</span>
            <RiLink aria-hidden className="h-4 w-4 text-[#3a3a3a]" />
            <input
              value={linkInput}
              onChange={(event) => setLinkInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void resolveDataset();
                }
              }}
              placeholder="https://www.data.gouv.fr/datasets/..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-[#161616] outline-none placeholder:text-[#666666]"
            />
            <button
              type="button"
              onClick={() => void resolveDataset()}
              className="inline-flex h-6 items-center gap-1 px-1.5 text-[12px] font-medium text-[#000091] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isResolving}
            >
              {isResolving ? (
                <RiLoader4Line
                  aria-hidden
                  className="h-3.5 w-3.5 animate-spin"
                />
              ) : null}
              Ajouter
            </button>
          </label>
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-[12px] leading-5 text-[#b34000]">{error}</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-2 grid gap-1.5 md:grid-cols-2">
          {results.map((dataset) => (
            <button
              key={dataset.id}
              type="button"
              onClick={() => selectDataset(dataset)}
              className="flex min-w-0 items-center justify-between gap-3 border border-[#E5E5E5] bg-white px-2 py-1.5 text-left hover:border-[#000091]"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-bold leading-5 text-[#161616]">
                  {dataset.title}
                </span>
                <span className="block truncate text-[12px] leading-5 text-[#666666]">
                  {dataset.organizationName}
                </span>
              </span>
              <RiArrowRightLine
                aria-hidden
                className="h-4 w-4 shrink-0 text-[#000091]"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
