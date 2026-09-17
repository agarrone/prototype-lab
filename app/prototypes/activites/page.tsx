import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  RiArrowRightSLine,
  RiCalendarEventLine,
  RiExternalLinkLine,
  RiInformationLine,
  RiLineChartLine,
  RiPriceTag3Line,
  RiUserLine,
} from "@remixicon/react";
import { ActivityTimeline } from "./activity-timeline";

export const metadata: Metadata = {
  title: "Activités - Prototype Lab",
  description: "Redesign de l'activité d'un jeu de données dans son administration.",
};

const tabs = [
  "Métadonnées",
  "Fichiers",
  "Discussion",
  "Réutilisations",
  "Statistiques",
  "Activité",
];

function MiniAvatar({ initials, src }: { initials: string; src?: string }) {
  return (
    <span
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#feecc2] text-[7px] font-bold text-[#714f00] ring-1 ring-[#cecece]"
    >
      {src ? <Image src={src} alt="" width={32} height={32} sizes="16px" quality={100} className="h-full w-full object-cover" /> : initials}
    </span>
  );
}

export default function ActivitiesPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] pb-16 text-[#161616]">
      <div className="mx-auto w-full max-w-[78rem] px-4 pt-5 sm:px-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-l-4 border-[#000091] bg-white px-4 py-3 text-[14px] leading-6">
          <span>Cette page présente un scénario fictif conçu pour explorer l’interface.</span>
          <Link href="/prototypes/activites/base-sirene" className="inline-flex items-center gap-1 font-medium text-[#000091] underline underline-offset-2 hover:decoration-2">
            Voir l’exemple réel Base Sirene
            <RiArrowRightSLine aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <nav aria-label="Fil d’Ariane" className="mb-5 text-[12px] leading-5 text-[#666666]">
          <ol className="flex flex-wrap items-center gap-2">
            {["Administration", "Ministère de la Transition écologique", "Jeux de données"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Link href="#" className="underline underline-offset-2 hover:text-[#000091]">{item}</Link>
                <RiArrowRightSLine aria-hidden="true" className="h-4 w-4" />
              </li>
            ))}
            <li className="font-bold text-[#3a3a3a]">Infrastructures de Recharge pour Véhicules Électriques</li>
          </ol>
        </nav>

        <header className="mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold leading-[33px] tracking-[-0.01em]">
              Infrastructures de Recharge pour Véhicules Électriques
            </h1>
            <span className="text-[12px] font-bold">IRVE</span>
            <RiExternalLinkLine aria-hidden="true" className="h-5 w-5" />
          </div>

          <div className="mt-2 space-y-1 text-[14px] leading-6 text-[#666666]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RiPriceTag3Line aria-hidden="true" className="h-4 w-4" />
                <span className="text-[#666666]">Métadonnées :</span>
                <span className="h-2 w-24 overflow-hidden rounded-full border border-[#cecece] bg-white">
                  <span className="block h-full w-3/4 rounded-full bg-[#1f8d49]" />
                </span>
              </div>
              <p className="flex items-center gap-2">
                <RiInformationLine aria-hidden="true" className="h-4 w-4" />
                <span>Informations :</span>
                <span className="flex items-center gap-1">↓ 12 ☆ 12 <RiLineChartLine aria-hidden="true" className="inline h-4 w-4" /> 12</span>
              </p>
            </div>

            <dl className="grid gap-1">
              <div className="flex items-center gap-2">
                <RiUserLine aria-hidden="true" className="h-4 w-4" />
                <dt>Créé par :</dt>
                <dd className="flex items-center gap-2">
                  <MiniAvatar initials="MD" src="/prototypes/activites/marie-dupont.png" />
                  <Link href="#" className="font-medium text-[#161616] underline underline-offset-2">Marie Dupont</Link>
                  <span aria-hidden="true">·</span>
                  <span>14 janvier 2022</span>
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <RiCalendarEventLine aria-hidden="true" className="h-4 w-4" />
                <dt className="whitespace-nowrap">Dernière modification :</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <MiniAvatar initials="MD" src="/prototypes/activites/marie-dupont.png" />
                  <Link href="#" className="font-medium text-[#161616] underline underline-offset-2">Marie Dupont</Link>
                  <span aria-hidden="true">·</span>
                  <span>16 septembre 2026</span>
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
                  className={`relative block px-3 py-1 text-[14px] font-medium leading-6 ${
                    tab === "Activité"
                      ? "-m-px rounded border border-[#3558a2] bg-white px-[13px] py-[5px] text-[#3558a2]"
                      : "text-[#161616] hover:bg-white"
                  }`}
                >
                  {tab}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="activite" className="bg-white p-4">
          <div className="mb-6">
            <h2 className="text-[18px] font-bold leading-7">Activité</h2>
            <p className="mt-1 text-[14px] leading-6 text-[#666666]">
              Historique des modifications apportées au jeu de données et à ses ressources.
            </p>
          </div>
          <ActivityTimeline />
        </section>
      </div>
    </main>
  );
}
