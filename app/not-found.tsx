import Link from "next/link";
import {
  RiArrowLeftLine,
  RiFileWarningLine,
  RiFolderLine,
} from "@remixicon/react";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] px-4 py-10 text-[#161616] sm:px-8 lg:px-12">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-2xl flex-col justify-center gap-8">
        <header className="space-y-3">
          <p className="font-mono text-[14px] leading-6 text-[#3a3a3a]">
            /404
          </p>
          <h1 className="text-[32px] font-semibold leading-10">
            Prototype introuvable
          </h1>
          <p className="max-w-xl text-[14px] leading-6 text-[#3a3a3a]">
            Cette page n’existe pas dans le Prototype Lab. Retournez à l’index
            pour parcourir les prototypes disponibles.
          </p>
        </header>

        <div className="font-mono text-[14px] leading-6 text-[#3a3a3a]">
          <div className="flex items-center gap-2 rounded px-2 py-1.5">
            <RiFolderLine aria-hidden className="h-5 w-5 text-[#3a3a3a]" />
            <span>prototype-lab</span>
          </div>
          <div className="ml-6 mt-1 border-l border-[#e5e5e5] pl-4">
            <div className="flex items-center gap-2 rounded bg-[#FFFFFF] px-2 py-1.5 text-[#161616]">
              <RiFileWarningLine
                aria-hidden
                className="h-5 w-5 text-[#3a3a3a]"
              />
              <span>page-not-found.tsx</span>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex h-9 w-fit items-center gap-2 bg-[#000091] px-3 text-[14px] font-medium leading-6 text-[#FFFFFF]"
        >
          <RiArrowLeftLine aria-hidden className="h-4 w-4" />
          Retour à l’index
        </Link>
      </section>
    </main>
  );
}
