import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightSLine, RiExternalLinkLine } from "@remixicon/react";
import { defaultDatasetSummary } from "@/lib/datagouv";
import { ResourceViewer } from "../explore-in-context/resource-viewer";

export const metadata: Metadata = {
  title: "Explore in a page - Prototype Lab",
  description:
    "Prototype d’intégration d’un explorateur de données dans une page éditoriale.",
};

const frContainerClass = "mx-auto w-full max-w-[78rem] px-4 lg:px-6";

export default function ExploreInAPage() {
  return (
    <main className="min-h-dvh bg-white py-4 text-[#161616]">
      <div className={frContainerClass}>
        <nav aria-label="Fil d’Ariane" className="text-[12px] leading-5">
          <ol className="flex flex-wrap items-center gap-1 text-[#666666]">
            {["Accueil", "Guides et ressources"].map((item) => (
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
            <li className="text-[#161616]">Comprendre les données de décès</li>
          </ol>
        </nav>

        <article className="pt-10">
          <header className="max-w-[50rem]">
            <h1 className="text-[40px] font-extrabold leading-[48px] tracking-[-0.01em] text-[#161616] max-md:text-[32px] max-md:leading-10">
              Comprendre les données relatives aux personnes décédées
            </h1>
            <p className="mt-6 text-[20px] leading-8 text-[#3a3a3a]">
              Consultez les principales informations du jeu de données et explorez
              directement un extrait de ses ressources sans quitter cette page.
            </p>
            <p className="mt-4 text-[14px] leading-6 text-[#666666]">
              Publié le 18 septembre 2026 · 6 minutes de lecture
            </p>
          </header>

          <div className="mt-12 max-w-[50rem] space-y-8 text-[16px] leading-7 text-[#3a3a3a]">
            <section aria-labelledby="article-introduction">
              <h2
                id="article-introduction"
                className="mb-4 text-[28px] font-bold leading-9 text-[#161616]"
              >
                Que contient ce jeu de données ?
              </h2>
              <p>
                L’Insee reçoit des communes les informations relatives aux décès
                enregistrés en France. Les fichiers diffusés couvrent les décès
                connus depuis 1970 et sont actualisés régulièrement.
              </p>
              <p className="mt-4">
                Pour l’année en cours, les ressources sont proposées sous forme de
                fichiers mensuels et trimestriels. L’explorateur ci-dessous permet
                d’en parcourir un aperçu, de rechercher une valeur et d’appliquer
                des filtres aux colonnes disponibles.
              </p>
            </section>
          </div>

          <section
            aria-labelledby="embedded-explorer-title"
            className="mt-12 border-y border-[#e5e5e5] py-8"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-[50rem]">
                <h2
                  id="embedded-explorer-title"
                  className="text-[28px] font-bold leading-9 text-[#161616]"
                >
                  Explorer les données
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-[#666666]">
                  Consultez, recherchez et filtrez les données de cette ressource.
                </p>
              </div>
              <Link
                href="https://www.data.gouv.fr/datasets/fichier-des-personnes-decedees"
                className="inline-flex items-center gap-1 text-[14px] font-medium leading-6 text-[#000091] underline underline-offset-4"
              >
                Voir le jeu de données
                <RiExternalLinkLine aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <ResourceViewer
              dataset={defaultDatasetSummary}
              showResourceNavigation={false}
              contentViewsOnly
            />
          </section>

          <div className="mt-12 max-w-[50rem] space-y-8 text-[16px] leading-7 text-[#3a3a3a]">
            <section aria-labelledby="article-usage">
              <h2
                id="article-usage"
                className="mb-4 text-[28px] font-bold leading-9 text-[#161616]"
              >
                Comment interpréter ces fichiers ?
              </h2>
              <p>
                La date d’enregistrement d’un décès par l’Insee peut différer de sa
                date de survenue. Les fichiers mensuels peuvent donc contenir des
                événements plus anciens transmis tardivement par les communes.
              </p>
              <p className="mt-4">
                Pour une analyse statistique de court terme, il est recommandé de
                consulter également les données quotidiennes consolidées publiées
                par l’Insee.
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
