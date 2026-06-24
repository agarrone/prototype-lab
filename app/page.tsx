import type { Metadata } from "next";
import Link from "next/link";
import { prototypes } from "@/src/lib/prototypes";

export const metadata: Metadata = {
  title: "Prototype Lab",
  description: "Index minimaliste des prototypes.",
};

function FolderIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative mt-0.5 h-4 w-5 rounded-[3px] border border-zinc-500"
    >
      <span className="absolute -top-1 left-1 h-1.5 w-2.5 rounded-t-[3px] border border-b-0 border-zinc-500 bg-black" />
    </span>
  );
}

function FileIcon() {
  return (
    <span
      aria-hidden="true"
      className="relative mt-0.5 h-5 w-4 rounded-[2px] border border-zinc-500"
    >
      <span className="absolute right-0 top-0 h-1.5 w-1.5 border-b border-l border-zinc-500" />
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh bg-black px-6 py-10 text-zinc-100 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-3xl flex-col justify-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
          index
        </p>
        <h1 className="mb-12 text-4xl font-semibold tracking-tight sm:text-6xl">
          Prototype Lab
        </h1>

        <nav
          aria-label="Index des prototypes"
          className="font-mono text-sm text-zinc-300 sm:text-base"
        >
          <ul className="space-y-2">
            <li>
              <div className="flex items-center gap-3 rounded-md px-2 py-1.5 text-zinc-100">
                <span aria-hidden="true" className="w-4 text-zinc-500">
                  v
                </span>
                <FolderIcon />
                <span>prototype-lab</span>
              </div>

              <ul className="ml-6 mt-2 space-y-2 border-l border-zinc-800 pl-5">
                <li>
                  <div className="flex items-center gap-3 rounded-md px-2 py-1.5">
                    <span aria-hidden="true" className="w-4 text-zinc-500">
                      v
                    </span>
                    <FolderIcon />
                    <span>prototypes</span>
                  </div>

                  <ul className="ml-6 mt-2 space-y-2 border-l border-zinc-800 pl-5">
                    {prototypes.map((prototype) => (
                      <li
                        key={prototype.slug}
                        className="rounded-md transition-colors hover:bg-zinc-900"
                      >
                        <Link
                          href={`/prototypes/${prototype.slug}`}
                          className="flex items-center justify-between gap-4 px-2 py-1.5 text-zinc-200"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span aria-hidden="true" className="w-4" />
                            <FileIcon />
                            <span className="truncate">{prototype.title}</span>
                          </span>
                          <span className="shrink-0 rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                            {prototype.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </section>
    </main>
  );
}
