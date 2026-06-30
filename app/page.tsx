import type { Metadata } from "next";
import Link from "next/link";
import {
  RiArrowRightSLine,
  RiBarChartBoxLine,
  RiFolder3Line,
  RiInformationLine,
  RiMicroscopeLine,
  RiPagesLine,
  RiPaletteLine,
  RiSparklingLine,
} from "@remixicon/react";
import { prototypes } from "@/lib/prototypes";

export const metadata: Metadata = {
  title: "Prototype Lab",
  description: "Prototypes de design pour tester des idées et des interactions pour data.gouv.fr.",
};

function FolderIcon() {
  return (
    <RiFolder3Line
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-[#666666]"
    />
  );
}

function ChevronIcon() {
  return (
    <RiArrowRightSLine
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[#666666] transition-transform group-open:rotate-90"
    />
  );
}

const prototypeIcons = {
  explorateur: RiMicroscopeLine,
  "enrichissement-donnees": RiSparklingLine,
  "design-system": RiPaletteLine,
  "carte-landing-page": RiPagesLine,
  "preview-dashboard": RiBarChartBoxLine,
};

function StatusBadge({ status }: { status: string }) {
  const className =
    {
      "almost there": "bg-[#e8edff] text-[#000091]",
      bientôt: "bg-[#e8edff] text-[#000091]",
      brouillon: "bg-[#eeeeee] text-[#3a3a3a]",
      exploration: "bg-[#fee7fc] text-[#6e445a]",
    }[status] ?? "bg-[#eeeeee] text-[#3a3a3a]";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[12px] font-medium leading-4 ${className}`}
    >
      {status}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] px-4 py-10 text-[#161616] sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-2xl flex-col justify-center gap-10">
        <header className="space-y-3">
          <h1 className="text-[32px] font-semibold leading-10">
            Prototype Lab
          </h1>
          <p className="max-w-xl text-[14px] leading-6 text-[#3a3a3a]">
            Prototypes de design pour tester des idées et des interactions pour
            data.gouv.fr, en conditions proches du réel.
          </p>
        </header>

        <nav
          aria-label="Prototype navigation"
          className="text-[14px] leading-6 text-[#3a3a3a]"
        >
          <div className="space-y-1">
            <Link
              href="/a-propos"
              className="flex items-center gap-2 rounded px-2 py-1.5 text-[#161616] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]"
            >
              <span aria-hidden="true" className="h-4 w-4" />
              <RiInformationLine
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-[#666666]"
              />
              <span>à propos</span>
            </Link>

            <details className="group" aria-label="prototypes">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1.5 outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#000091] [&::-webkit-details-marker]:hidden">
                <ChevronIcon />
                <FolderIcon />
                <span>prototypes</span>
              </summary>

              <ul className="ml-6 mt-1 space-y-1 border-l border-[#e5e5e5] pl-4">
                {prototypes.map((prototype) => {
                  const PrototypeIcon =
                    prototypeIcons[prototype.slug as keyof typeof prototypeIcons] ??
                    RiPagesLine;

                  return (
                    <li key={prototype.slug}>
                      <Link
                        href={`/prototypes/${prototype.slug}`}
                        className="flex items-center justify-between gap-4 rounded px-2 py-1.5 text-[#161616] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span aria-hidden="true" className="h-4 w-4" />
                          <PrototypeIcon
                            aria-hidden="true"
                            className="h-5 w-5 shrink-0 text-[#666666]"
                          />
                          <span className="truncate">{prototype.title}</span>
                        </span>
                        <StatusBadge status={prototype.status} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        </nav>
      </section>
    </main>
  );
}
