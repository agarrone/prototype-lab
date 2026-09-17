import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
  RiExternalLinkLine,
  RiInformationLine,
  RiLineChartLine,
  RiPriceTag3Line,
  RiUserLine,
} from "@remixicon/react";
import { ActivityTimeline, type Activity } from "../activity-timeline";

export const metadata: Metadata = {
  title: "Activités Base Sirene - Prototype Lab",
  description: "Application du prototype d’activité aux données réelles de Base Sirene.",
};

const datasetUrl = "https://www.data.gouv.fr/datasets/base-sirene-des-entreprises-et-de-leurs-etablissements-siren-siret";
const activityApiUrl = "https://www.data.gouv.fr/api/1/activity/?related_to=5b7ffc618b4c4169d30727e0";

const resourceDetails = [
  "Fichier StockEtablissementLiensSuccession, septembre 2026 (format parquet)",
  "Fichier StockEtablissementHistorique, septembre 2026 (format parquet)",
  "Fichier StockEtablissement, septembre 2026 (format parquet)",
  "Fichier StockDoublons, septembre 2026 (format parquet)",
  "Fichier StockUniteLegaleHistorique, septembre 2026 (format parquet)",
];

const sireneActivities: Activity[] = [
  {
    id: "sirene-description-septembre",
    actor: "Diffusion Sirene Insee",
    initials: "DS",
    actorType: "human",
    actorHref: "https://www.data.gouv.fr/users/diffusion-sirene-insee",
    summary: "a modifié les métadonnées",
    date: "1 septembre 2026 à 14 h 13",
    details: [{ label: "Métadonnées modifiées", value: "Description" }],
  },
  {
    id: "sirene-ressources-septembre",
    actor: "Michaël GENET",
    initials: "MG",
    actorType: "human",
    actorHref: "https://www.data.gouv.fr/users/michael-genet",
    summary: "a mis à jour plusieurs ressources",
    date: "1 septembre 2026 à 11 h 22",
    rangeStart: "10 h 34",
    details: resourceDetails.map((value) => ({ label: "Ressource mise à jour", value, href: datasetUrl })),
  },
  {
    id: "sirene-description-aout",
    actor: "Diffusion Sirene Insee",
    initials: "DS",
    actorType: "human",
    actorHref: "https://www.data.gouv.fr/users/diffusion-sirene-insee",
    summary: "a modifié les métadonnées",
    date: "26 août 2026 à 14 h 49",
  },
  {
    id: "sirene-ressources-aout",
    actor: "Michaël GENET",
    initials: "MG",
    actorType: "human",
    actorHref: "https://www.data.gouv.fr/users/michael-genet",
    summary: "a mis à jour plusieurs ressources",
    date: "1 août 2026 à 09 h 49",
    rangeStart: "09 h 26",
    details: resourceDetails.map((value) => ({
      label: "Ressource mise à jour",
      value: value.replace("septembre", "août"),
      href: datasetUrl,
    })),
  },
  {
    id: "sirene-metadonnees-juillet",
    actor: "Diffusion Sirene Insee",
    initials: "DS",
    actorType: "human",
    actorHref: "https://www.data.gouv.fr/users/diffusion-sirene-insee",
    summary: "a modifié les métadonnées",
    date: "24 juillet 2026 à 08 h 56",
  },
];

const tabs = ["Métadonnées", "Fichiers", "Discussion", "Réutilisations", "Statistiques", "Activité"];

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eeeeee] text-[7px] font-bold text-[#3a3a3a] ring-1 ring-[#cecece]">
      {initials}
    </span>
  );
}

export default function BaseSireneActivitiesPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] pb-16 text-[#161616]">
      <div className="mx-auto w-full max-w-[78rem] px-4 pt-5 sm:px-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#000091] bg-white px-4 py-3 text-[14px] leading-6">
          <span>Exemple construit à partir des activités publiques de Base Sirene.</span>
          <Link href="/prototypes/activites" className="inline-flex items-center gap-1 font-medium text-[#000091] underline underline-offset-2 hover:decoration-2">
            <RiArrowLeftLine aria-hidden="true" className="h-4 w-4" />
            Revenir au scénario fictif
          </Link>
        </div>

        <nav aria-label="Fil d’Ariane" className="mb-5 text-[12px] leading-5 text-[#666666]">
          <ol className="flex flex-wrap items-center gap-2">
            {["Administration", "Insee", "Jeux de données"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Link href="#" className="underline underline-offset-2 hover:text-[#000091]">{item}</Link>
                <RiArrowRightSLine aria-hidden="true" className="h-4 w-4" />
              </li>
            ))}
            <li className="font-bold text-[#3a3a3a]">Base Sirene des entreprises et de leurs établissements</li>
          </ol>
        </nav>

        <header className="mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold leading-[33px] tracking-[-0.01em]">
              Base Sirene des entreprises et de leurs établissements (SIREN, SIRET)
            </h1>
            <Link href={datasetUrl} aria-label="Voir le jeu de données sur data.gouv.fr" className="text-[#161616] hover:text-[#000091]">
              <RiExternalLinkLine aria-hidden="true" className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-2 space-y-1 text-[14px] leading-6 text-[#666666]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RiPriceTag3Line aria-hidden="true" className="h-4 w-4" />
                <span>Métadonnées :</span>
                <span className="h-2 w-24 overflow-hidden rounded-full border border-[#cecece] bg-white">
                  <span className="block h-full w-full rounded-full bg-[#1f8d49]" />
                </span>
              </div>
              <p className="flex items-center gap-2">
                <RiInformationLine aria-hidden="true" className="h-4 w-4" />
                <span>Informations :</span>
                <span className="flex items-center gap-1">24 fichiers <RiLineChartLine aria-hidden="true" className="inline h-4 w-4" /></span>
              </p>
            </div>

            <dl className="grid gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <RiUserLine aria-hidden="true" className="h-4 w-4" />
                <dt>Créé par :</dt>
                <dd className="flex items-center gap-2">
                  <InitialsAvatar initials="DS" />
                  <Link href="https://www.data.gouv.fr/users/diffusion-sirene-insee" className="font-medium text-[#161616] underline underline-offset-2">Diffusion Sirene Insee</Link>
                  <span aria-hidden="true">·</span>
                  <span>24 août 2018</span>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <RiCalendarEventLine aria-hidden="true" className="h-4 w-4" />
                <dt className="whitespace-nowrap">Dernière modification :</dt>
                <dd className="flex items-center gap-2">
                  <InitialsAvatar initials="DS" />
                  <Link href="https://www.data.gouv.fr/users/diffusion-sirene-insee" className="font-medium text-[#161616] underline underline-offset-2">Diffusion Sirene Insee</Link>
                  <span aria-hidden="true">·</span>
                  <span>1 septembre 2026</span>
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <nav aria-label="Navigation du jeu de données" className="mb-5 overflow-x-auto">
          <ul className="flex w-max min-w-max rounded border border-[#dddddd]">
            {tabs.map((tab) => (
              <li key={tab}>
                <a
                  href={tab === "Activité" ? "#activite" : "#"}
                  aria-current={tab === "Activité" ? "page" : undefined}
                  className={`relative block px-3 py-1 text-[14px] font-medium leading-6 ${tab === "Activité" ? "-m-px rounded border border-[#3558a2] bg-white px-[13px] py-[5px] text-[#3558a2]" : "text-[#161616] hover:bg-white"}`}
                >
                  {tab}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="activite" className="bg-white p-4">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-bold leading-7">Activité</h2>
              <p className="mt-1 text-[14px] leading-6 text-[#666666]">
                Historique des modifications apportées au jeu de données et à ses ressources.
              </p>
            </div>
            <Link href={activityApiUrl} className="inline-flex items-center gap-1 text-[13px] text-[#161616] underline underline-offset-2 hover:decoration-2">
              Consulter la source API
              <RiExternalLinkLine aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <ActivityTimeline activities={sireneActivities} />
        </section>
      </div>
    </main>
  );
}
