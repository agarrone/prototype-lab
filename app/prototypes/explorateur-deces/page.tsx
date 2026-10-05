import type { Metadata } from "next";
import Link from "next/link";
import { RiArrowRightSLine, RiExternalLinkLine } from "@remixicon/react";
import DeathExplorer from "./death-explorer";

export const metadata: Metadata = {
  title: "Explorer le fichier des personnes décédées | Prototype Lab",
  description: "Rechercher dans le fichier des personnes décédées.",
};

export default function DeathExplorerPage() {
  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <div className="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <nav aria-label="Fil d’Ariane" className="flex items-center gap-1 text-xs leading-5 text-[#666666]">
          <Link href="/" className="underline underline-offset-2 hover:text-[#000091]">Exploration</Link>
          <RiArrowRightSLine aria-hidden="true" className="h-4 w-4" />
          <span aria-current="page" className="text-[#161616]">Personnes décédées</span>
        </nav>
        <header className="max-w-[64rem] pb-8 pt-6 sm:pb-10 sm:pt-8">
          <h1 className="text-[32px] font-extrabold leading-10 tracking-[-0.01em] sm:text-[40px] sm:leading-[48px]">Explorer le fichier des personnes décédées</h1>
          <p className="mt-4 max-w-[56rem] text-[17px] leading-7 text-[#3a3a3a] sm:mt-5 sm:text-xl sm:leading-8">Recherchez une personne et retrouvez ses dates et lieux de naissance et de décès dans le fichier de l’Insee.</p>
        </header>
        <DeathExplorer />
        <section aria-labelledby="about-deaths" className="mt-10 grid gap-6 border-t border-[#e5e5e5] pt-8 sm:mt-12">
          <h2 id="about-deaths" className="text-2xl font-bold">À propos des données</h2>
          <div className="max-w-3xl space-y-4 text-sm leading-6 text-[#3a3a3a]">
            <p>Le fichier des personnes décédées est publié par l’Insee depuis 1970. Il contient les noms, prénoms, dates et lieux de naissance et de décès, y compris pour des décès survenus à l’étranger.</p>
            <p>Les données peuvent comporter des omissions ou des erreurs et ne permettent pas de certifier le statut vital d’une personne.</p>
            <a href="https://www.data.gouv.fr/datasets/fichier-des-personnes-decedees" className="inline-flex items-center gap-2 font-medium text-[#000091] underline underline-offset-4">Consulter le jeu de données sur data.gouv.fr<RiExternalLinkLine aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </section>
      </div>
    </main>
  );
}
