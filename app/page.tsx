import type { Metadata } from "next";
import Link from "next/link";
import { prototypes } from "@/lib/prototypes";

export const metadata: Metadata = {
  title: "Prototype Lab",
  description: "Index des prototypes data.gouv.fr.",
};

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-[#666666]"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M3 3H9L11 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM4 7V19H20V7H4ZM4 5V7H8.17157L6.17157 5H4Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-[#666666]"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M21 8V20.9932C21 21.5501 20.5552 22 20.0066 22H3.9934C3.44495 22 3 21.556 3 21.0082V2.9918C3 2.44405 3.45531 2 3.9918 2H15L21 8ZM19 9H14V4H5V20H19V9ZM8 7H11V9H8V7ZM8 11H16V13H8V11ZM8 15H16V17H8V15Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[#666666] transition-transform group-open:rotate-90"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    {
      bientôt: "bg-[#e8edff] text-[#000091]",
      brouillon: "bg-[#eeeeee] text-[#3a3a3a]",
      exploration: "bg-[#fee7fc] text-[#6e445a]",
    }[status] ?? "bg-[#eeeeee] text-[#3a3a3a]";

  return (
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {status}
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] px-4 py-10 text-[#161616] [font-family:Marianne,Arial,sans-serif] sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-2xl flex-col justify-center gap-10">
        <header className="space-y-3">
          <h1 className="text-5xl font-semibold leading-none tracking-tight sm:text-7xl">
            Prototype Lab
          </h1>
          <p className="max-w-xl text-lg leading-8 text-[#3a3a3a]">
            Un index minimal de prototypes haute fidélité pour data.gouv.fr.
          </p>
        </header>

        <nav
          aria-label="Navigation des prototypes"
          className="text-base text-[#3a3a3a] [font-family:Inconsolata,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace]"
        >
          <details className="group" aria-label="prototype-lab">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1.5 outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#000091] [&::-webkit-details-marker]:hidden">
              <ChevronIcon />
              <FolderIcon />
              <span>prototype-lab</span>
            </summary>

            <div className="ml-6 mt-1 border-l border-[#dddddd] pl-4">
              <details className="group" aria-label="prototypes">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1.5 outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#000091] [&::-webkit-details-marker]:hidden">
                  <ChevronIcon />
                  <FolderIcon />
                  <span>prototypes</span>
                </summary>

                <ul className="ml-6 mt-1 space-y-1 border-l border-[#dddddd] pl-4">
                  {prototypes.map((prototype) => (
                    <li key={prototype.slug}>
                      <Link
                        href={`/prototypes/${prototype.slug}`}
                        className="flex items-center justify-between gap-4 rounded px-2 py-1.5 text-[#161616] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span aria-hidden="true" className="h-4 w-4" />
                          <FileIcon />
                          <span className="truncate">{prototype.title}</span>
                        </span>
                        <StatusBadge status={prototype.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </details>
        </nav>
      </section>
    </main>
  );
}
