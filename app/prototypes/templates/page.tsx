import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  RiArrowRightSLine,
  RiBankLine,
  RiCheckboxCircleLine,
  RiInformationLine,
} from "@remixicon/react";
import {
  defaultDatasetSummary,
  type DatagouvDatasetSummary,
} from "@/lib/datagouv";
import { DescriptionPreview } from "./description-preview";

export const metadata: Metadata = {
  title: "Templates - Prototype Lab",
  description:
    "Gabarits de pages data.gouv.fr pour tester l'intégration de modules d'interface.",
};

const frContainerClass = "mx-auto w-full max-w-[78rem] px-4 lg:px-6";

function Breadcrumb({ dataset }: { dataset: DatagouvDatasetSummary }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`${frContainerClass} text-[12px] leading-5`}
    >
      <ol className="flex flex-wrap items-center gap-1 text-[#666666]">
        {["Accueil", "Jeux de données"].map((item) => (
          <li key={item} className="flex items-center gap-1">
            <Link
              href="#"
              className="underline decoration-current underline-offset-2 hover:text-[#000091]"
            >
              {item}
            </Link>
            <RiArrowRightSLine aria-hidden="true" className="h-4 w-4" />
          </li>
        ))}
        <li className="max-w-[360px] truncate text-[#161616]">
          {dataset.title}
        </li>
      </ol>
    </nav>
  );
}

function ProducerBlock({ dataset }: { dataset: DatagouvDatasetSummary }) {
  return (
    <section aria-labelledby="producer-title" className="space-y-1">
      <h2
        id="producer-title"
        className="text-[14px] font-bold leading-6 text-[#161616]"
      >
        Producteur
      </h2>
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-[#e5e5e5] bg-white p-2">
          {dataset.organizationLogo ? (
            <img
              src={dataset.organizationLogo}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[10px] font-bold text-[#000091]">DG</span>
          )}
        </div>
        <Link
          href={dataset.organizationPage ?? "#"}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-[14px] font-bold leading-6 text-[#000091] underline underline-offset-4"
        >
          <RiBankLine aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {dataset.organizationName}
          </span>
          <RiCheckboxCircleLine
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
          />
        </Link>
      </div>
    </section>
  );
}

function StatSparkline({ variant }: { variant: "views" | "downloads" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 77 19"
      className="h-[18.5px] w-[77px] text-[#000091]"
      fill="none"
    >
      <path
        d={
          variant === "views"
            ? "M1 11 C7 9 12 12 18 10 C24 8 29 9 35 11 C42 13 47 7 52 9 C58 11 64 7 69 10 C73 12 75 14 76 18"
            : "M1 11 C9 11 15 11 23 11 C30 11 36 12 43 11 C50 10 56 10 62 9 C67 8 70 2 73 4 C75 6 76 10 76 13"
        }
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      {variant === "views" ? (
        <path
          d="M70 12 C73 13 75 15 76 18"
          stroke="currentColor"
          strokeDasharray="2 2"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      ) : null}
    </svg>
  );
}

function DatasetStats({ dataset }: { dataset: DatagouvDatasetSummary }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <section aria-labelledby="views-title" className="min-w-0">
        <h2
          id="views-title"
          className="text-[14px] font-bold leading-6 text-[#161616]"
        >
          Vues
        </h2>
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-[14px] font-extrabold leading-6 text-[#161616]">
            {dataset.viewsLabel}
          </p>
          <StatSparkline variant="views" />
        </div>
        <p className="text-[14px] leading-6 text-[#666666]">
          depuis juil. 2022
        </p>
        <p className="whitespace-nowrap text-[14px] font-bold leading-6 text-[#18753c]">
          + 6.41K en juil. 2026
        </p>
      </section>

      <section aria-labelledby="downloads-title" className="min-w-0">
        <h2
          id="downloads-title"
          className="text-[14px] font-bold leading-6 text-[#161616]"
        >
          Téléchargements
        </h2>
        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-[14px] font-extrabold leading-6 text-[#161616]">
            {dataset.downloadsLabel}
          </p>
          <StatSparkline variant="downloads" />
        </div>
        <p className="text-[14px] leading-6 text-[#666666]">
          depuis juil. 2022
        </p>
        <p className="whitespace-nowrap text-[14px] font-bold leading-6 text-[#18753c]">
          + 1.97K en juil. 2026
        </p>
      </section>
    </div>
  );
}

function SideMetadata({ dataset }: { dataset: DatagouvDatasetSummary }) {
  return (
    <aside className="w-full space-y-4 text-[14px] text-[#161616]">
      <ProducerBlock dataset={dataset} />

      <section aria-labelledby="licence-title" className="space-y-1">
        <h2
          id="licence-title"
          className="text-[14px] font-bold leading-6 text-[#161616]"
        >
          Licence
        </h2>
        <Link
          href="#"
          className="inline-flex max-w-full truncate rounded-[2px] bg-[#f6f6f6] px-1 font-['Inconsolata'] text-[14px] leading-6 tracking-[0.7px] text-[#666666]"
        >
          {dataset.licenseLabel}
        </Link>
      </section>

      <section aria-labelledby="updated-title" className="space-y-1">
        <h2
          id="updated-title"
          className="text-[14px] font-bold leading-6 text-[#161616]"
        >
          Dernière mise à jour
        </h2>
        <p className="text-[14px] leading-6 text-[#161616]">
          {dataset.lastUpdateLabel}
        </p>
      </section>

      <DatasetStats dataset={dataset} />

      <section aria-labelledby="quality-title" className="space-y-1">
        <h2
          id="quality-title"
          className="flex items-center gap-1 text-[14px] font-bold leading-6 text-[#161616]"
        >
          <RiInformationLine aria-hidden="true" className="h-5 w-5" />
          Qualité des métadonnées:
        </h2>
        <div className="h-2 overflow-hidden rounded-full bg-[#eeeeee]">
          <div
            className="h-full rounded-full bg-[#18753c]"
            style={{ width: `${Math.round(dataset.qualityScore * 100)}%` }}
          />
        </div>
      </section>
    </aside>
  );
}

function DatasetTabs({ dataset }: { dataset: DatagouvDatasetSummary }) {
  const tabs = [
    { label: "Fichiers", count: String(dataset.resourceCount), active: true },
    { label: "Réutilisations", count: String(dataset.reuseCount) },
    { label: "Discussions", count: String(dataset.discussionCount) },
    {
      label: "Ressources communautaires",
      count: String(dataset.communityResourceCount),
    },
    { label: "Informations" },
  ];

  return (
    <nav
      aria-label="Navigation du jeu de données"
      className={`${frContainerClass} mt-8`}
    >
      <div className="flex gap-2 overflow-x-auto border-b border-[#e5e5e5]">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={`shrink-0 border px-4 py-2 text-[16px] font-bold leading-6 ${
              tab.active
                ? "border-b-white border-l-[#e5e5e5] border-r-[#e5e5e5] border-t-[#000091] border-t-2 bg-white text-[#000091] hover:bg-white"
                : "border-b-[#e5e5e5] border-l-transparent border-r-transparent border-t-transparent bg-[#e6eefe] text-[#161616] hover:bg-[#d8e5fd]"
            }`}
          >
            {tab.label}
            {tab.count ? (
              <sup className="ml-0.5 align-super text-[10px] font-normal leading-[10px]">
                ({tab.count})
              </sup>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function DatasetPageTemplate({
  children,
  dataset = defaultDatasetSummary,
}: {
  children?: ReactNode;
  dataset?: DatagouvDatasetSummary;
}) {
  return (
    <main className="min-h-dvh bg-white py-3 text-[#161616]">
      <section className="w-full">
        <Breadcrumb dataset={dataset} />

        <div className={`${frContainerClass} pt-3`}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start md:gap-10">
            <div className="min-w-0 overflow-x-hidden md:col-span-2">
              <h1 className="mb-6 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[24px] font-extrabold leading-8 text-[#161616]">
                <span>{dataset.title}</span>
                {dataset.acronym ? (
                  <span className="text-[12px] font-bold leading-5 text-[#161616]">
                    {dataset.acronym}
                  </span>
                ) : null}
              </h1>
              <DescriptionPreview description={dataset.description} />
            </div>

            <div className="min-w-0 md:col-span-1">
              <SideMetadata dataset={dataset} />
            </div>
          </div>
        </div>

        <DatasetTabs dataset={dataset} />
        {children}
      </section>
    </main>
  );
}

export default function TemplatesPage() {
  return <DatasetPageTemplate />;
}
