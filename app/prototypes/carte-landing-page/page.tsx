import Link from "next/link";
import {
  RiArrowLeftLine,
  RiBellLine,
  RiCheckLine,
  RiCodeSSlashLine,
  RiDatabase2Line,
  RiDownloadCloud2Line,
  RiLineChartLine,
} from "@remixicon/react";

type FeatureCard = {
  title: string;
  description: string;
  illustration: "opening" | "subscriptions" | "api";
};

const featureCards: FeatureCard[] = [
  {
    title: "Suivi de l’ouverture",
    description:
      "L’Explorateur permet de visualiser et contrôler vos données directement en ligne. Il facilite leur compréhension et contribue à mieux les valoriser auprès des réutilisateurs.",
    illustration: "opening",
  },
  {
    title: "Abonnements",
    description:
      "L’Explorateur permet de visualiser et contrôler vos données directement en ligne. Il facilite leur compréhension et contribue à mieux les valoriser auprès des réutilisateurs.",
    illustration: "subscriptions",
  },
  {
    title: "API",
    description:
      "L’Explorateur permet de visualiser et contrôler vos données directement en ligne. Il facilite leur compréhension et contribue à mieux les valoriser auprès des réutilisateurs.",
    illustration: "api",
  },
];

function OpeningIllustration() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-[330px] rounded-md border border-[#dddddd] bg-white p-3 shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#e8edff]">
              <RiLineChartLine aria-hidden className="h-4 w-4 text-[#000091]" />
            </span>
            <div>
              <div className="h-2.5 w-28 rounded bg-[#161616]" />
              <div className="mt-1.5 h-2 w-20 rounded bg-[#cecece]" />
            </div>
          </div>
          <span className="rounded bg-[#c3fad5] px-2 py-1 text-[11px] font-bold text-[#18753c]">
            92 %
          </span>
        </div>
        <div className="grid grid-cols-4 items-end gap-2">
          {[42, 72, 54, 86].map((height, index) => (
            <div
              key={height}
              className="flex h-24 items-end rounded bg-[#f6f6f6] px-2 pb-2"
            >
              <div
                className={`w-full rounded-t ${
                  index === 3 ? "bg-[#000091]" : "bg-[#c2d1ff]"
                }`}
                style={{ height }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionsIllustration() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="w-full max-w-[330px] space-y-2 rounded-md border border-[#dddddd] bg-white p-3 shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
        {[
          ["Nouveau fichier disponible", "CSV · il y a 2 min"],
          ["Mise à jour détectée", "API · ce matin"],
          ["Schéma validé", "JSON · hier"],
        ].map(([title, meta], index) => (
          <div
            key={title}
            className="flex items-center gap-2 rounded border border-[#E5E5E5] bg-[#FFFFFF] p-2"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${
                index === 2 ? "bg-[#c3fad5]" : "bg-[#e8edff]"
              }`}
            >
              {index === 2 ? (
                <RiCheckLine aria-hidden className="h-4 w-4 text-[#18753c]" />
              ) : (
                <RiBellLine aria-hidden className="h-4 w-4 text-[#000091]" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-[#161616]">
                {title}
              </div>
              <div className="truncate text-[11px] text-[#666666]">{meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiIllustration() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid w-full max-w-[340px] grid-cols-[112px_1fr] overflow-hidden rounded-md border border-[#dddddd] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.10)]">
        <div className="border-r border-[#E5E5E5] bg-[#f6f6f6] p-3">
          <div className="mb-3 flex h-7 w-7 items-center justify-center rounded bg-[#fee7fc]">
            <RiCodeSSlashLine aria-hidden className="h-4 w-4 text-[#6e445a]" />
          </div>
          {["GET", "POST", "CSV"].map((label) => (
            <div
              key={label}
              className="mb-2 rounded border border-[#E5E5E5] bg-white px-2 py-1 text-[11px] font-bold text-[#3a3a3a]"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <RiDatabase2Line aria-hidden className="h-4 w-4 text-[#18753c]" />
            <div className="h-2.5 w-28 rounded bg-[#161616]" />
          </div>
          <div className="space-y-2">
            {[88, 132, 104, 148].map((width) => (
              <div key={width} className="flex items-center gap-2">
                <RiDownloadCloud2Line
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-[#3a3a3a]"
                />
                <div
                  className="h-2 rounded bg-[#cecece]"
                  style={{ width }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded border border-dashed border-[#CECECE] px-2 py-2 text-[11px] text-[#666666]">
            Illustration à préciser
          </div>
        </div>
      </div>
    </div>
  );
}

function CardIllustration({ type }: { type: FeatureCard["illustration"] }) {
  return (
    <div className="flex h-[239px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-[#E5E5E5] bg-gradient-to-b from-[#d5f2ff] from-[40%] to-white p-5">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded border border-[#E5E5E5] p-0.5 shadow-[0_4px_4px_rgba(255,255,255,0.5)]">
        {type === "opening" ? <OpeningIllustration /> : null}
        {type === "subscriptions" ? <SubscriptionsIllustration /> : null}
        {type === "api" ? <ApiIllustration /> : null}
      </div>
    </div>
  );
}

function LandingFeatureCard({ card }: { card: FeatureCard }) {
  return (
    <article className="flex w-full max-w-[509px] flex-col gap-[9px] rounded-[12px] border border-[#E5E5E5] bg-white p-[9px] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <CardIllustration type={card.illustration} />
      <div className="px-2.5 pb-1 text-[18px] leading-[1.5]">
        <h2 className="font-bold text-[#161616]">{card.title}</h2>
        <p className="mt-[5px] text-[#3c4043]">{card.description}</p>
      </div>
    </article>
  );
}

export default function CarteLandingPage() {
  return (
    <main className="relative min-h-dvh bg-white px-4 py-16 text-[#161616] sm:px-6 lg:px-8">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex h-8 items-center gap-2 px-2 text-[13px] leading-6 text-[#3a3a3a] underline-offset-4 hover:text-[#000091] hover:underline"
      >
        <RiArrowLeftLine aria-hidden className="h-4 w-4" />
        Retour
      </Link>

      <section className="mx-auto grid w-full max-w-[1600px] place-items-center gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((card) => (
          <LandingFeatureCard key={card.title} card={card} />
        ))}
      </section>
    </main>
  );
}
