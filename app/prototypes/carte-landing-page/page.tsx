import Link from "next/link";
import {
  RiAlertLine,
  RiArrowLeftLine,
  RiCheckDoubleLine,
  RiCheckLine,
  RiCheckboxCircleLine,
  RiMessage3Line,
} from "@remixicon/react";

type FeatureCard = {
  title: string;
  description: string;
  illustration: "discussion" | "schema" | "stats" | "quality";
};

const featureCards: FeatureCard[] = [
  {
    title: "Discussions",
    description:
      "Échangez directement autour d’un jeu de données pour signaler un problème, demander une précision ou suivre la réponse du producteur.",
    illustration: "discussion",
  },
  {
    title: "Schémas de données",
    description:
      "Affichez la structure attendue des fichiers, identifiez les champs clés et facilitez la validation avant publication.",
    illustration: "schema",
  },
  {
    title: "Statistiques",
    description:
      "Suivez les visites, les téléchargements et les tendances d’usage pour mieux comprendre la circulation des données.",
    illustration: "stats",
  },
  {
    title: "Qualité des métadonnées",
    description:
      "Repérez les informations complètes ou manquantes et améliorez progressivement la qualité de description des jeux de données.",
    illustration: "quality",
  },
];

function DiscussionIllustration() {
  return (
    <div className="h-full w-full overflow-hidden bg-white p-3 text-[10px] leading-[1.5] text-[#3a3a3a]">
      <div className="flex items-center gap-2 text-[#161616]">
        <RiMessage3Line aria-hidden className="h-3.5 w-3.5 text-[#000091]" />
        <p className="font-bold">Colonne code_commune manquante</p>
      </div>
      <div className="mt-0.5 flex items-center gap-1 whitespace-nowrap">
        <span className="text-[#000091]">Jena Dalerti</span>
        <span className="text-[#666666]">-</span>
        <span className="text-[#666666]">il y a 2 heures</span>
      </div>
      <div className="mt-3 space-y-1 overflow-hidden">
        <p>Bonjour,</p>
        <p>
          Merci pour la mise à jour du jeu de données ! J’ai remarqué que la
          colonne code_commune est désormais vide pour plusieurs lignes.
        </p>
        <p className="truncate">
          Pouvez-vous confirmer si c’est une évolution du modèle ?
        </p>
      </div>

      <div className="mt-3 border-l-2 border-[#000091] pl-3">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <RiCheckboxCircleLine
            aria-hidden
            className="h-3 w-3 text-[#000091]"
          />
          <span className="text-[#000091]">Ministère de la Culture</span>
          <span className="text-[#666666]">-</span>
          <span className="text-[#666666]">il y a 2 heures</span>
          <span className="rounded-[2px] bg-[#e8edff] px-1 text-[8px] font-bold uppercase tracking-[0.16px] text-[#0063cb]">
            Producteur
          </span>
        </div>
        <p className="mt-2 line-clamp-3">
          Il s’agit effectivement d’un problème lors de l’export. Nous venons de
          corriger le fichier source et une nouvelle version vient d’être publiée.
        </p>
      </div>
    </div>
  );
}

function SchemaIllustration() {
  const rows = [
    ["1", "nom_aménageur", "string", true],
    ["2", "siren_amenageur", "string", true],
    ["3", "contact_amenageur", "email", true],
    ["4", "coordonneesXY", "point_geo", true],
    ["5", "nbre_pdc", "integer", false],
    ["6", "id_pdc_itinerance", "string", false],
  ] as const;

  return (
    <div className="h-full w-full overflow-hidden bg-white p-3">
      <div className="mb-2 inline-flex rounded-xl bg-[#eeeeee] px-2 py-1 text-[10px] text-[#161616]">
        <span>etalab/</span>
        <span className="font-bold">schema-irve-statique</span>
      </div>
      <div className="overflow-hidden rounded-[2px] border border-[#dddddd]">
        {rows.map(([index, name, type, valid]) => (
          <div
            key={name}
            className="flex h-[30px] items-center gap-1 border-b border-[#E5E5E5] bg-white px-2 text-[10px] tracking-[0.5px] last:border-b-0"
          >
            <span className="w-3 font-mono font-bold text-[#E5E5E5]">
              {index}
            </span>
            <span className="w-[150px] truncate font-mono font-bold text-[#000091] underline">
              {name}
            </span>
            <span className="min-w-0 flex-1 truncate font-mono text-[#3a3a3a]">
              {type}
            </span>
            {valid ? (
              <RiCheckDoubleLine
                aria-hidden
                className="h-[18px] w-[18px] shrink-0 text-[#18753c]"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Sparkline({ variant }: { variant: "visits" | "downloads" }) {
  const points =
    variant === "visits"
      ? "0,24 12,18 24,23 36,12 48,14 60,9 72,2 84,11 96,8 108,15"
      : "0,26 12,21 24,24 36,17 48,10 60,14 72,9 84,6 96,11 108,10";

  return (
    <svg
      aria-hidden
      className="h-7 w-[90px]"
      viewBox="0 0 108 28"
      fill="none"
    >
      <polyline
        points={points}
        stroke="#000091"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatsIllustration() {
  return (
    <div className="h-full w-full overflow-hidden bg-white p-3">
      <div>
        <p className="text-[12px] font-bold leading-[1.5] text-[#161616]">
          Visites
        </p>
        <div className="flex items-end gap-2">
          <p className="text-[30px] font-extrabold leading-[1.05] text-[#161616]">
            629k
          </p>
          <div>
            <Sparkline variant="visits" />
            <div className="mt-0.5 flex justify-between text-[6px] text-[#929292]">
              <span>11/24</span>
              <span>11/25</span>
            </div>
          </div>
        </div>
        <span className="mt-1 inline-flex rounded bg-[#e8edff] px-1 text-[10px] font-bold leading-[18px] text-[#0063cb]">
          + 62k en Novembre 2025
        </span>
      </div>

      <div className="ml-[80px] mt-5">
        <p className="text-[12px] font-bold leading-[1.5] text-[#161616]">
          Téléchargements
        </p>
        <div className="flex items-end gap-2">
          <p className="text-[30px] font-extrabold leading-[1.05] text-[#161616]">
            65,9k
          </p>
          <div>
            <Sparkline variant="downloads" />
            <div className="mt-0.5 flex justify-between text-[6px] text-[#929292]">
              <span>11/24</span>
              <span>11/25</span>
            </div>
          </div>
        </div>
        <span className="mt-1 inline-flex rounded bg-[#e8edff] px-1 text-[10px] font-bold leading-[18px] text-[#0063cb]">
          + 54k en Novembre 2025
        </span>
      </div>
    </div>
  );
}

function QualityIllustration() {
  const items = [
    ["ok", "Description des données renseignée"],
    ["ok", "Fichiers documentés"],
    ["ok", "Licence renseignée"],
    ["warning", "Fréquence de mise à jour non renseignée"],
    ["warning", "Formats de fichiers non standards"],
  ] as const;

  return (
    <div className="h-full w-full overflow-hidden bg-white p-3">
      <p className="text-[12px] font-bold leading-[1.5] text-[#161616]">
        Qualité des métadonnées
      </p>
      <div className="mt-1 rounded-full border border-[#27a658] bg-white p-0.5">
        <div className="h-2 w-[60%] rounded-full bg-[#27a658]" />
      </div>
      <div className="mt-4 space-y-2 text-[10px] text-[#161616]">
        {items.map(([status, label]) => (
          <div key={label} className="flex items-center gap-1">
            {status === "ok" ? (
              <RiCheckLine aria-hidden className="h-3 w-3 text-[#161616]" />
            ) : (
              <RiAlertLine aria-hidden className="h-3 w-3 text-[#b34000]" />
            )}
            <span
              className={
                status === "warning" ? "text-[#b34000]" : "text-[#161616]"
              }
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardIllustration({ type }: { type: FeatureCard["illustration"] }) {
  return (
    <div className="flex h-[239px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-[#E5E5E5] bg-gradient-to-b from-[#d5f2ff] from-[40%] to-white p-5">
      <div className="h-full w-full overflow-hidden rounded-[2px] border border-[#E5E5E5] bg-white shadow-[0_4px_4px_rgba(255,255,255,0.5)]">
        {type === "discussion" ? <DiscussionIllustration /> : null}
        {type === "schema" ? <SchemaIllustration /> : null}
        {type === "stats" ? <StatsIllustration /> : null}
        {type === "quality" ? <QualityIllustration /> : null}
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

      <section className="mx-auto grid w-full max-w-[1600px] place-items-center gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((card) => (
          <LandingFeatureCard key={card.title} card={card} />
        ))}
      </section>
    </main>
  );
}
