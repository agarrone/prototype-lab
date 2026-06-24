import Link from "next/link";
import { getPrototypeBySlug } from "@/src/lib/prototypes";

const prototype = getPrototypeBySlug("explorateur");

export default function ExplorateurPage() {
  if (!prototype) {
    return null;
  }

  return (
    <main className="min-h-dvh bg-black px-6 py-10 text-zinc-100 sm:px-10">
      <section className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-2xl flex-col justify-center">
        <p className="mb-4 font-mono text-sm text-zinc-500">
          /prototypes/{prototype.slug}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          {prototype.title}
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-400">
          {prototype.description}
        </p>
        <p className="mt-8 font-mono text-sm uppercase tracking-[0.18em] text-zinc-500">
          Statut: {prototype.status}
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex w-fit items-center rounded-md border border-zinc-700 px-4 py-2 font-mono text-sm text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-900"
        >
          Retour vers /
        </Link>
      </section>
    </main>
  );
}
