import Link from "next/link";
import {
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiBarChartLine,
  RiCodeLine,
  RiDatabase2Line,
  RiFileList3Line,
  RiInformationLine,
  RiStackLine,
  RiTableLine,
  RiTimelineView,
  RiLightbulbLine,
  RiSearchLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiUser3Line,
} from "@remixicon/react";
import { getPrototypeBySlug } from "@/lib/prototypes";

const prototype = getPrototypeBySlug("carte-landing-page");

// Composant Carte inspiré de Shape of AI - sans images, avec fond coloré et icônes
function PatternCard({
  icon: Icon,
  title,
  description,
  href,
  bgColor = "#f6f6f6",
  iconColor = "#000091",
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  bgColor?: string;
  iconColor?: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-[#e5e5e5] bg-white transition-shadow hover:shadow-md"
    >
      <div className="flex gap-4 p-4">
        {/* Placeholder visuel sans image - utilise une icône + fond coloré */}
        <div
          className="flex size-16 shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: bgColor }}
        >
          <Icon size={24} className="text-[24px]" style={{ color: iconColor }} />
        </div>
        
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-[#161616] group-hover:text-[#000091]">
            {title}
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-[#666666]">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Cartes de la catégorie "Wayfinders"
const wayfinderCards = [
  {
    icon: RiLightbulbLine,
    title: "Suggestions",
    description: "Solves the blank canvas dilemma with clues for how to prompt.",
    href: "/patterns/suggestions",
    bgColor: "#e8edff",
    iconColor: "#000091",
  },
  {
    icon: RiFileList3Line,
    title: "Templates",
    description: "Structured templates that can be filled by the user or pre-filled by the AI.",
    href: "/patterns/templates",
    bgColor: "#e8edff",
    iconColor: "#000091",
  },
  {
    icon: RiSearchLine,
    title: "Gallery",
    description: "Share sample generations, prompts, and parameters to educate and inspire users.",
    href: "/patterns/gallery",
    bgColor: "#e8edff",
    iconColor: "#000091",
  },
  {
    icon: RiTimelineView,
    title: "Nudges",
    description: "Alert users to actions they can take to use AI, especially if they are just getting started.",
    href: "/patterns/nudges",
    bgColor: "#e8edff",
    iconColor: "#000091",
  },
];

// Cartes de la catégorie "Inputs"
const inputCards = [
  {
    icon: RiCodeLine,
    title: "Open Input",
    description: "Open ended prompt inputs that can be used in AI conversations.",
    href: "/patterns/open-input",
    bgColor: "#eeeeee",
    iconColor: "#3a3a3a",
  },
  {
    icon: RiStackLine,
    title: "Auto-fill",
    description: "Extend a prompt to multiple fields or inputs at once.",
    href: "/patterns/auto-fill",
    bgColor: "#eeeeee",
    iconColor: "#3a3a3a",
  },
  {
    icon: RiDatabase2Line,
    title: "Describe",
    description: "Decomposes the course into its fundamental tokens and suggested prompt.",
    href: "/patterns/describe",
    bgColor: "#eeeeee",
    iconColor: "#3a3a3a",
  },
  {
    icon: RiBarChartLine,
    title: "Expand",
    description: "Lengthen the underlying content or add depth and details.",
    href: "/patterns/expand",
    bgColor: "#eeeeee",
    iconColor: "#3a3a3a",
  },
];

// Cartes de la catégorie "Trust Builders"
const trustCards = [
  {
    icon: RiShieldCheckLine,
    title: "Disclosure",
    description: "Clearly mark content and interactions guided or delivered by AI.",
    href: "/patterns/disclosure",
    bgColor: "#fee7fc",
    iconColor: "#6e445a",
  },
  {
    icon: RiUser3Line,
    title: "Consent",
    description: "Only capture data from others with their knowledge and permission.",
    href: "/patterns/consent",
    bgColor: "#fee7fc",
    iconColor: "#6e445a",
  },
  {
    icon: RiInformationLine,
    title: "Caveat",
    description: "Inform users about shortcomings or risks in the model or the technology.",
    href: "/patterns/caveat",
    bgColor: "#fee7fc",
    iconColor: "#6e445a",
  },
  {
    icon: RiSettings3Line,
    title: "Watermark",
    description: "Identifiers on AI Generative content that humans, software, or programs can read.",
    href: "/patterns/watermark",
    bgColor: "#fee7fc",
    iconColor: "#6e445a",
  },
];

export default function CarteLandingPage() {
  if (!prototype) {
    return null;
  }

  return (
    <main className="min-h-dvh bg-[#f6f6f6] text-[#161616]">
      <section className="border-b border-[#e5e5e5] bg-white px-6 py-6 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[14px] font-bold text-[#000091] underline-offset-4 hover:underline"
          >
            <RiArrowLeftLine aria-hidden size={16} />
            Retour vers /
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#666666]">
              Prototype Lab
            </p>
            <h1 className="mt-2 text-[32px] font-bold leading-10">
              {prototype.title}
            </h1>
            <p className="mt-3 text-[16px] leading-7 text-[#3a3a3a]">
              {prototype.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl gap-8 px-6 py-8 sm:px-10">
        <div className="space-y-12">
          {/* Section Wayfinders */}
          <section>
            <div className="mb-4 border-b border-[#e5e5e5] pb-3">
              <h2 className="text-[20px] font-bold">Wayfinders</h2>
              <p className="mt-1 text-[14px] text-[#666666]">
                Help users construct their first prompt and get started.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {wayfinderCards.map((card) => (
                <PatternCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          {/* Section Inputs */}
          <section>
            <div className="mb-4 border-b border-[#e5e5e5] pb-3">
              <h2 className="text-[20px] font-bold">Prompt Actions</h2>
              <p className="mt-1 text-[14px] text-[#666666]">
                Different actions that users can direct AI to complete.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {inputCards.map((card) => (
                <PatternCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          {/* Section Trust Builders */}
          <section>
            <div className="mb-4 border-b border-[#e5e5e5] pb-3">
              <h2 className="text-[20px] font-bold">Trust Builders</h2>
              <p className="mt-1 text-[14px] text-[#666666]">
                Give users confidence that the AI&apos;s results are ethical, accurate, and trustworthy.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {trustCards.map((card) => (
                <PatternCard key={card.title} {...card} />
              ))}
            </div>
          </section>

          {/* Section explicative */}
          <section className="rounded border border-[#e5e5e5] bg-white p-6">
            <h2 className="text-[18px] font-bold mb-4">Analyse des cartes</h2>
            <p className="text-[14px] leading-6 text-[#3a3a3a]">
              Les cartes de <strong>Shape of AI</strong> utilisent une image miniature comme aperçu visuel.
              Ici, chaque carte est reproduite <strong>sans image réelle</strong> : le placeholder visuel
              est remplacé par une icône SVG sur un fond coloré uni.
            </p>
            <p className="mt-4 text-[14px] leading-6 text-[#3a3a3a]">
              Les couleurs de fond correspondent aux catégories du site original :
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#e8edff] px-2 py-0.5 text-[12px] font-medium text-[#000091]">
                Bleu clair = Wayfinders
              </span>
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#eeeeee] px-2 py-0.5 text-[12px] font-medium text-[#3a3a3a]">
                Gris clair = Inputs
              </span>
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-[#fee7fc] px-2 py-0.5 text-[12px] font-medium text-[#6e445a]">
                Rose clair = Trust
              </span>
            </p>
          </section>

          {prototype.figmaUrl && (
            <section>
              <a
                href={prototype.figmaUrl}
                className="inline-flex items-center gap-2 text-[13px] font-bold text-[#000091] underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le design sur Figma
                <RiExternalLinkLine aria-hidden size={16} />
              </a>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
