import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiDatabase2Line,
  RiGitBranchLine,
  RiLoopRightLine,
  RiRobot2Line,
  RiShapesLine,
} from "@remixicon/react";

export const metadata: Metadata = {
  title: "À propos - Prototype Lab",
  description:
    "Pourquoi le Prototype Lab existe et comment il aide à tester les interfaces data.gouv.fr.",
};

const sections = [
  {
    title: "Tester en conditions réelles",
    icon: RiShapesLine,
    text: "Le lab sert à prototyper des parcours crédibles pour les tests utilisateurs, avec des interactions proches du produit final plutôt que des maquettes figées.",
  },
  {
    title: "Préparer le développement",
    icon: RiGitBranchLine,
    text: "Coder les prototypes aide à anticiper les états, les transitions, les contraintes responsive et les nombreux cas limites d’une plateforme alimentée par les utilisateurs.",
  },
  {
    title: "Brancher les données",
    icon: RiDatabase2Line,
    text: "Quand c’est utile, les prototypes peuvent être connectés à la production via les skills et MCP data.gouv.fr pour éprouver les interfaces sur des données réelles.",
  },
  {
    title: "Repérer les écarts",
    icon: RiLoopRightLine,
    text: "Le projet aide aussi à identifier les incohérences entre pages : couleurs, icônes, rayons, boutons, densité d’information ou comportements d’interface.",
  },
  {
    title: "Rester agent-agnostique",
    icon: RiRobot2Line,
    text: "Les prototypes vivent dans le code : chacun peut utiliser l’agent de développement de son choix, sans dépendre d’un outil unique de design.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] px-4 py-10 text-[#161616] sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-3xl flex-col justify-center gap-8">
        <header className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded px-2 py-1 text-[14px] font-bold text-[#000091] underline-offset-4 hover:bg-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]"
          >
            <RiArrowLeftLine aria-hidden className="h-4 w-4" />
            Retour
          </Link>

          <div className="space-y-3">
            <p className="text-[14px] leading-6 text-[#3a3a3a]">/à-propos</p>
            <h1 className="text-[32px] font-semibold leading-10">
              À propos du Prototype Lab
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-[#3a3a3a]">
              Le Prototype Lab sert à tester des idées et des interactions pour
              data.gouv.fr, à faciliter le passage du design au développement et
              à éprouver les interfaces sur les cas complexes du réel.
            </p>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.title}
                className="rounded border border-[#e5e5e5] bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded bg-[#e8edff] text-[#000091]">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[15px] font-bold leading-6">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-[13px] leading-5 text-[#3a3a3a]">
                      {section.text}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="max-w-2xl text-[14px] leading-6 text-[#3a3a3a]">
          À terme, l’objectif est de créer une version Nuxt/Vue dans un nouveau
          repo pour utiliser directement les composants data.gouv.fr et garder
          une lecture claire entre la production actuelle et les pistes de design
          futures.
        </p>
      </section>
    </main>
  );
}
