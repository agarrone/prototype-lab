"use client";

import { useMemo, useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowRightLine,
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiDatabase2Line,
  RiExternalLinkLine,
  RiFileList3Line,
  RiFilter3Line,
  RiGithubFill,
  RiGovernmentLine,
  RiLinkedinBoxFill,
  RiLockLine,
  RiMenuLine,
  RiSearchLine,
  RiShieldCheckFill,
  RiTwitterXFill,
  RiUserAddLine,
} from "@remixicon/react";

type Result = {
  title: string;
  producer: string;
  description: string;
  updated: string;
  resources: number;
  formats: string[];
  quality: number;
  certified?: boolean;
};

type FilterGroup = {
  title: string;
  highlighted?: boolean;
  options: { label: string; count: number; checked?: boolean }[];
};

const results: Result[] = [
  {
    title: "Données de pollution de l'air",
    producer: "Ministère de la Transition écologique",
    description:
      "Concentrations horaires, indices de qualité et mesures agrégées par station d'observation.",
    updated: "Mis à jour le 18 avril 2026",
    resources: 7,
    formats: ["CSV", "JSON", "API"],
    quality: 88,
    certified: true,
  },
  {
    title: "Entreprise de la population",
    producer: "INSEE",
    description:
      "Données annuelles de population légale, séries historiques et découpages territoriaux.",
    updated: "Mis à jour le 4 juin 2026",
    resources: 12,
    formats: ["CSV", "XLSX"],
    quality: 96,
    certified: true,
  },
  {
    title: "Données sur les transports publics",
    producer: "Région Île-de-France",
    description:
      "Horaires, arrêts, lignes et informations d'exploitation pour le réseau régional.",
    updated: "Mis à jour le 21 mai 2026",
    resources: 9,
    formats: ["GTFS", "JSON"],
    quality: 91,
  },
  {
    title: "Données météorologiques",
    producer: "Météo-France",
    description:
      "Observations quotidiennes, normales saisonnières et événements climatiques remarquables.",
    updated: "Mis à jour le 2 juillet 2026",
    resources: 18,
    formats: ["CSV", "API"],
    quality: 84,
    certified: true,
  },
  {
    title: "Données sur le logement",
    producer: "Ministère chargé du Logement",
    description:
      "Parc de logements, indicateurs de tension et données relatives aux politiques publiques.",
    updated: "Mis à jour le 9 mai 2026",
    resources: 5,
    formats: ["CSV", "PDF"],
    quality: 76,
  },
  {
    title: "Données sur l'éducation",
    producer: "Ministère de l'Éducation nationale",
    description:
      "Effectifs, établissements, résultats aux examens et indicateurs de réussite scolaire.",
    updated: "Mis à jour le 25 juin 2026",
    resources: 14,
    formats: ["CSV", "XLSX", "JSON"],
    quality: 93,
    certified: true,
  },
  {
    title: "Données sur l'allocation",
    producer: "Caisse nationale des allocations familiales",
    description:
      "Séries statistiques relatives aux prestations sociales et aux bénéficiaires par territoire.",
    updated: "Mis à jour le 17 mars 2026",
    resources: 6,
    formats: ["CSV"],
    quality: 72,
  },
  {
    title: "Données de santé publique",
    producer: "Santé publique France",
    description:
      "Indicateurs sanitaires, surveillance épidémiologique et données de prévention.",
    updated: "Mis à jour le 29 juin 2026",
    resources: 11,
    formats: ["CSV", "JSON"],
    quality: 89,
  },
  {
    title: "Données sur l'énergie renouvelable",
    producer: "Agence ORE",
    description:
      "Installations, production et raccordements d'énergie renouvelable par commune.",
    updated: "Mis à jour le 11 juin 2026",
    resources: 8,
    formats: ["CSV", "GEOJSON"],
    quality: 82,
  },
  {
    title: "Données sur la biodiversité",
    producer: "Office français de la biodiversité",
    description:
      "Observations d'espèces, zonages environnementaux et référentiels naturalistes.",
    updated: "Mis à jour le 30 avril 2026",
    resources: 10,
    formats: ["CSV", "SHP"],
    quality: 78,
  },
];

const filterGroups: FilterGroup[] = [
  {
    title: "Type",
    options: [
      { label: "Jeux de données", count: 49979, checked: true },
      { label: "API", count: 2138 },
      { label: "Réutilisations", count: 1246 },
      { label: "Organisations", count: 2714 },
    ],
  },
  {
    title: "Format",
    options: [
      { label: "CSV", count: 26482, checked: true },
      { label: "JSON", count: 15368 },
      { label: "ZIP", count: 9256 },
      { label: "PDF", count: 3502 },
    ],
  },
  {
    title: "Modification récente",
    highlighted: true,
    options: [
      { label: "3 dernières années", count: 41138 },
      { label: "12 derniers mois", count: 23252, checked: true },
      { label: "30 derniers jours", count: 10970 },
    ],
  },
  {
    title: "Licence",
    highlighted: true,
    options: [
      { label: "Licence Ouverte", count: 36327, checked: true },
      { label: "Non renseignée", count: 14868 },
      { label: "ODbL", count: 4863 },
      { label: "Creative Commons", count: 582 },
    ],
  },
  {
    title: "Organisation",
    highlighted: true,
    options: [
      { label: "Ministère de la Transition écologique", count: 4566 },
      { label: "INSEE", count: 1438, checked: true },
      { label: "Etalab", count: 963 },
      { label: "Région Bretagne", count: 603 },
    ],
  },
  {
    title: "Schéma",
    options: [
      { label: "etalab/schema-irve-statique", count: 1223 },
      { label: "etalab/schema-bal", count: 307 },
      { label: "scdl/budget", count: 76 },
    ],
  },
];

const formatCount = new Intl.NumberFormat("fr-FR").format;

function Header() {
  return (
    <header className="border-b border-[#dddddd] bg-white text-[#161616]">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="flex h-[32px] items-center justify-end gap-4 border-b border-[#eeeeee] text-[11px] font-medium text-[#3a3a3a]">
          <a>Publier des données</a>
          <a>Se documenter</a>
          <a>Données ouvertes</a>
          <a>Nous écrire</a>
        </div>
        <div className="flex h-[66px] items-center justify-between gap-6">
          <div className="flex min-w-[230px] items-center gap-7">
            <div className="border-l-[2px] border-r-[2px] border-[#000091] px-2 text-[10px] font-bold uppercase leading-[1.15]">
              République
              <br />
              Française
            </div>
            <div className="text-[18px] font-extrabold leading-none text-[#000091]">
              data.gouv
            </div>
          </div>
          <div className="hidden flex-1 items-center gap-6 text-[12px] font-medium lg:flex">
            <a className="border-b-2 border-[#000091] py-6 text-[#000091]">
              Données
            </a>
            <a>API</a>
            <a>Réutilisations</a>
            <a>Organisations</a>
            <a>Actualités</a>
            <a>Communauté</a>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button className="inline-flex h-8 items-center gap-1 px-2 text-[12px] font-medium">
              <RiLockLine aria-hidden className="h-3.5 w-3.5" />
              Se connecter
            </button>
            <button className="inline-flex h-8 items-center gap-1 px-2 text-[12px] font-medium">
              <RiUserAddLine aria-hidden className="h-3.5 w-3.5" />
              S&apos;enregistrer
            </button>
            <div className="flex h-8 w-[154px]">
              <input
                aria-label="Recherche globale"
                className="min-w-0 flex-1 rounded-tl bg-[#eeeeee] px-3 text-[12px] shadow-[inset_0_-2px_0_#000091] outline-none"
                placeholder="Recherche"
              />
              <button
                aria-label="Rechercher"
                className="flex w-8 items-center justify-center rounded-tr bg-[#000091] text-white"
              >
                <RiSearchLine aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center border border-[#dddddd] lg:hidden">
            <RiMenuLine aria-hidden className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchForm({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (value: string) => void;
}) {
  return (
    <form
      className="mt-5"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <label className="sr-only" htmlFor="advanced-search">
        Rechercher
      </label>
      <div className="flex h-12 w-full">
        <input
          id="advanced-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 rounded-tl bg-[#eeeeee] px-4 text-[15px] shadow-[inset_0_-2px_0_#000091] outline-none placeholder:italic placeholder:text-[#666666] focus:ring-2 focus:ring-[#000091]"
          placeholder="ex. élections présidentielles"
        />
        <button className="flex w-14 items-center justify-center rounded-tr bg-[#000091] text-white hover:bg-[#1212ff]">
          <RiSearchLine aria-hidden className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
}

function FilterOption({
  option,
}: {
  option: FilterGroup["options"][number];
}) {
  return (
    <label className="grid cursor-pointer grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-1.5 text-[10px] leading-4 text-[#161616]">
      {option.checked ? (
        <RiCheckboxLine aria-hidden className="mt-0.5 h-3.5 w-3.5 text-[#000091]" />
      ) : (
        <RiCheckboxBlankLine
          aria-hidden
          className="mt-0.5 h-3.5 w-3.5 text-[#666666]"
        />
      )}
      <span className="truncate">{option.label}</span>
      <span className="text-[#666666]">{formatCount(option.count)}</span>
    </label>
  );
}

function FilterGroupBlock({ group }: { group: FilterGroup }) {
  return (
    <section>
      <button
        className="mb-2 flex h-7 w-full items-center justify-between bg-[#000091] px-2 text-left text-[11px] font-bold text-white"
      >
        {group.title}
        <RiArrowDownSLine aria-hidden className="h-4 w-4" />
      </button>
      <div className="space-y-1.5 px-1">
        {group.options.map((option) => (
          <FilterOption key={option.label} option={option} />
        ))}
      </div>
    </section>
  );
}

function Filters() {
  return (
    <aside>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <span className="text-[14px] font-bold">Filtres</span>
        <RiFilter3Line aria-hidden className="h-5 w-5 text-[#000091]" />
      </div>
      <div className="space-y-4">
        {filterGroups.map((group) => (
          <FilterGroupBlock key={group.title} group={group} />
        ))}
      </div>
    </aside>
  );
}

function QualityBar({ value }: { value: number }) {
  return (
    <div className="flex w-[92px] items-center gap-1">
      <div className="h-1.5 flex-1 rounded-full bg-[#eeeeee]">
        <div
          className="h-1.5 rounded-full bg-[#1f8d49]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-6 text-right text-[10px] text-[#666666]">
        {value}
      </span>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  return (
    <article className="border border-[#dddddd] bg-white px-3 py-2.5">
      <div className="flex gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#fee7fc] text-[#b34000]">
          <RiDatabase2Line aria-hidden className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[12px] font-bold leading-4 text-[#000091] underline-offset-4 hover:underline">
              {result.title}
            </h3>
            {result.certified ? (
              <RiShieldCheckFill
                aria-label="Certifié"
                className="h-3.5 w-3.5 shrink-0 text-[#000091]"
              />
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] leading-3 text-[#666666]">
            <span className="inline-flex items-center gap-1 text-[#161616]">
              <RiGovernmentLine aria-hidden className="h-3 w-3" />
              {result.producer}
            </span>
            <span>{result.updated}</span>
            <span>{result.resources} ressources</span>
          </div>
          <p className="mt-1.5 truncate text-[10px] leading-4 text-[#3a3a3a]">
            {result.description}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {result.formats.map((format) => (
                <span
                  key={format}
                  className="rounded bg-[#eeeeee] px-1.5 py-0.5 text-[10px] font-bold text-[#3a3a3a]"
                >
                  {format}
                </span>
              ))}
            </div>
            <QualityBar value={result.quality} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ResultsHeader({ count }: { count: number }) {
  return (
    <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="text-[12px] font-bold leading-5">
          {count} résultats sur 49 979 jeux de données
        </p>
      </div>
      <label className="flex items-center gap-2 text-[11px] text-[#3a3a3a]">
        Trier par
        <select className="h-8 rounded-t bg-[#eeeeee] px-2 pr-7 shadow-[inset_0_-2px_0_#000091] outline-none">
          <option>Pertinence</option>
          <option>Les plus récents</option>
          <option>Les plus populaires</option>
        </select>
      </label>
    </div>
  );
}

function Pagination() {
  return (
    <nav
      aria-label="Pagination"
      className="mt-5 flex items-center justify-center gap-1"
    >
      {["1", "2", "3", "4", "...", "1250"].map((page) => (
        <button
          key={page}
          className={`flex h-8 min-w-8 items-center justify-center px-2 text-[12px] font-medium ${
            page === "1"
              ? "bg-[#000091] text-white"
              : "bg-[#eeeeee] text-[#161616]"
          }`}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-14 border-t border-[#dddddd] bg-white">
      <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-8 md:grid-cols-[1.4fr_1fr]">
        <div className="flex items-start gap-4">
          <div className="text-[10px] font-bold uppercase leading-[1.15]">
            République
            <br />
            Française
          </div>
          <div>
            <p className="text-[14px] font-bold">
              Abonnez-vous à notre lettre d&apos;information
            </p>
            <p className="mt-1 max-w-xl text-[12px] leading-5 text-[#666666]">
              Pour ne rien manquer de l&apos;actualité de data.gouv.fr et de l&apos;open
              data, inscrivez-vous à notre lettre d&apos;information.
            </p>
            <button className="mt-3 h-8 bg-[#000091] px-3 text-[12px] font-medium text-white">
              S&apos;abonner
            </button>
          </div>
        </div>
        <div>
          <p className="text-[14px] font-bold">Suivez-nous sur les réseaux</p>
          <div className="mt-3 flex gap-3 text-[#000091]">
            <RiTwitterXFill aria-hidden className="h-5 w-5" />
            <RiGithubFill aria-hidden className="h-5 w-5" />
            <RiLinkedinBoxFill aria-hidden className="h-5 w-5" />
            <RiExternalLinkLine aria-hidden className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="border-t border-[#dddddd] py-5">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-6 text-[11px] text-[#666666]">
          <span>data.gouv.fr</span>
          <span>Accessibilité · Conditions générales · Plan du site</span>
        </div>
      </div>
    </footer>
  );
}

export default function RecherchePage() {
  const [query, setQuery] = useState("");
  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return results;
    }

    return results.filter((result) =>
      [result.title, result.producer, result.description, ...result.formats]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <Header />

      <div className="mx-auto max-w-[1180px] px-6 pb-4 pt-5">
        <nav
          aria-label="Vous êtes ici"
          className="mb-5 text-[11px] leading-4 text-[#666666]"
        >
          Données / API / Réutilisations / Organisations / Actualités /
          Communauté / Recherche
        </nav>

        <h1 className="text-[22px] font-extrabold leading-8">
          Rechercher sur datagouv
        </h1>

        <SearchForm query={query} setQuery={setQuery} />

        <div className="mt-5 grid grid-cols-1 gap-7 lg:grid-cols-[246px_minmax(0,1fr)]">
          <Filters />

          <section>
            <ResultsHeader count={filteredResults.length} />

            {filteredResults.length > 0 ? (
              <div className="space-y-3">
                {filteredResults.map((result) => (
                  <ResultCard key={result.title} result={result} />
                ))}
              </div>
            ) : (
              <div className="border border-[#dddddd] bg-white py-10 text-center">
                <RiFileList3Line
                  aria-hidden
                  className="mx-auto h-8 w-8 text-[#666666]"
                />
                <p className="mt-3 text-[14px] font-bold">
                  Aucun résultat pour “{query}”
                </p>
                <p className="mt-1 text-[12px] text-[#666666]">
                  Retirez un filtre ou essayez une recherche plus large.
                </p>
              </div>
            )}

            <Pagination />

            <div className="mt-5 flex justify-end">
              <button className="inline-flex h-8 items-center gap-1 text-[12px] font-medium text-[#000091]">
                Faire une recherche avancée
                <RiArrowRightLine aria-hidden className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
