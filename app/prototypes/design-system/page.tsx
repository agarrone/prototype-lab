import Link from "next/link";
import {
  RiArrowLeftLine,
  RiBarChartLine,
  RiCheckboxCircleLine,
  RiCodeLine,
  RiDatabase2Line,
  RiExternalLinkLine,
  RiFileList3Line,
  RiInformationLine,
  RiStackLine,
  RiTableLine,
} from "@remixicon/react";
import { getPrototypeBySlug } from "@/lib/prototypes";

const prototype = getPrototypeBySlug("design-system");

const foundations = [
  {
    title: "Boutons",
    description: "Actions primaires, secondaires et liens d'action.",
    preview: "button",
  },
  {
    title: "Tags et statuts",
    description: "Etiquettes compactes pour qualifier une ressource.",
    preview: "tags",
  },
  {
    title: "Cartes",
    description: "Synthese dataset, reutilisation, organisation et service.",
    preview: "card",
  },
  {
    title: "Tableaux",
    description: "Donnees denses, metadonnees et etats de chargement.",
    preview: "table",
  },
];

const componentGroups = [
  {
    title: "Identite et proprietaires",
    icon: RiInformationLine,
    components: [
      "Avatar",
      "AvatarWithName",
      "OwnerType",
      "OwnerTypeIcon",
      "OrganizationCard",
      "OrganizationNameWithCertificate",
      "UserActivityList",
    ],
  },
  {
    title: "Catalogues et cartes",
    icon: RiDatabase2Line,
    components: [
      "DatasetCard",
      "DataserviceCard",
      "ReuseCard",
      "DatasetInformationPanel",
      "DatasetLabelTag",
      "ReuseDetails",
    ],
  },
  {
    title: "Qualite et details",
    icon: RiCheckboxCircleLine,
    components: [
      "DatasetQuality",
      "DatasetQualityInline",
      "DatasetQualityItem",
      "DatasetQualityItemWarning",
      "DatasetQualityScore",
      "DatasetQualityTooltipContent",
      "DateRangeDetails",
      "DescriptionDetails",
      "DescriptionList",
      "DescriptionTerm",
    ],
  },
  {
    title: "Ressources et previews",
    icon: RiFileList3Line,
    components: [
      "ResourceAccordion",
      "ResourceAccordion/DataStructure",
      "ResourceAccordion/Metadata",
      "ResourceAccordion/Preview",
      "ResourceAccordion/JsonPreview",
      "ResourceAccordion/XmlPreview",
      "ResourceAccordion/PdfPreview",
      "ResourceAccordion/MapContainer",
      "ResourceAccordion/Pmtiles",
      "ResourceAccordion/Swagger",
      "ResourceAccordion/ResourceIcon",
      "ResourceAccordion/SchemaBadge",
      "ResourceAccordion/EditButton",
      "ResourceAccordion/PreviewLoader",
      "ResourceAccordion/SchemaLoader",
    ],
  },
  {
    title: "Navigation et interaction",
    icon: RiStackLine,
    components: [
      "AppLink",
      "BannerAction",
      "BrandedButton",
      "CopyButton",
      "ExtraAccordion",
      "Pagination",
      "ReadMore",
      "Tabs/Tab",
      "Tabs/TabGroup",
      "Tabs/TabList",
      "Tabs/TabPanel",
      "Tabs/TabPanels",
      "Toggletip",
      "Tooltip",
    ],
  },
  {
    title: "Donnees et visualisation",
    icon: RiBarChartLine,
    components: [
      "ActivityList",
      "SmallChart",
      "StatBox",
      "ValueWatcher",
      "Icons/Archive",
      "Icons/Code",
      "Icons/Documentation",
      "Icons/File",
      "Icons/Image",
      "Icons/Link",
      "Icons/Table",
    ],
  },
  {
    title: "Feedback et utilitaires",
    icon: RiCodeLine,
    components: [
      "AnimatedLoader",
      "ClientOnly",
      "LoadingBlock",
      "PaddedContainer",
      "Placeholder",
      "SimpleBanner",
      "TranslationT",
    ],
  },
];

function FoundationPreview({ type }: { type: string }) {
  if (type === "button") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button className="h-9 rounded bg-[#000091] px-4 text-[14px] font-bold text-white">
          Action principale
        </button>
        <button className="h-9 rounded border border-[#000091] px-4 text-[14px] font-bold text-[#000091]">
          Secondaire
        </button>
      </div>
    );
  }

  if (type === "tags") {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="rounded bg-[#E3E3FD] px-2 py-1 text-[12px] font-bold text-[#000091]">
          Publie
        </span>
        <span className="rounded bg-[#B8FEC9] px-2 py-1 text-[12px] font-bold text-[#18753C]">
          Conforme
        </span>
        <span className="rounded bg-[#FEE7FC] px-2 py-1 text-[12px] font-bold text-[#6E445A]">
          Beta
        </span>
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="rounded border border-[#e5e5e5] bg-white p-3">
        <p className="text-[12px] font-bold uppercase text-[#666666]">
          DatasetCard
        </p>
        <p className="mt-1 text-[15px] font-bold text-[#161616]">
          Donnees de reference des communes
        </p>
        <p className="mt-2 text-[13px] leading-5 text-[#666666]">
          Carte compacte avec producteur, qualite et metadonnees.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-[#e5e5e5]">
      <div className="grid grid-cols-3 bg-[#f6f6f6] text-[12px] font-bold text-[#3a3a3a]">
        <span className="border-r border-[#e5e5e5] px-3 py-2">Nom</span>
        <span className="border-r border-[#e5e5e5] px-3 py-2">Type</span>
        <span className="px-3 py-2">Statut</span>
      </div>
      <div className="grid grid-cols-3 text-[13px] text-[#3a3a3a]">
        <span className="border-r border-[#e5e5e5] px-3 py-2">commune</span>
        <span className="border-r border-[#e5e5e5] px-3 py-2">texte</span>
        <span className="px-3 py-2">ok</span>
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  if (!prototype) {
    return null;
  }

  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <section className="border-b border-[#e5e5e5] bg-[#f6f6f6] px-6 py-6 sm:px-10">
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
              Inventaire de travail inspire de `@datagouv/components-next`,
              adapte en React/Tailwind pour le Prototype Lab.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded border border-[#e5e5e5] bg-white p-4">
          <p className="text-[14px] font-bold text-[#161616]">
            Source inspectee
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[#666666]">
            Le package npm expose des composants Vue et des assets. Cette page
            sert de transposition React progressive, sans ajouter la dependance
            Vue au projet.
          </p>
          <a
            href="https://www.npmjs.com/package/@datagouv/components-next"
            className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#000091] underline-offset-4 hover:underline"
          >
            Voir le package
            <RiExternalLinkLine aria-hidden size={16} />
          </a>
        </aside>

        <div className="space-y-10">
          <section>
            <div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] pb-3">
              <div>
                <h2 className="text-[20px] font-bold">Fondations visibles</h2>
                <p className="mt-1 text-[14px] text-[#666666]">
                  Premiere passe : composants usuels rendus dans le style DSFR.
                </p>
              </div>
              <span className="rounded bg-[#E3E3FD] px-2 py-1 text-[12px] font-bold text-[#000091]">
                Etape 1
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {foundations.map((item) => (
                <article
                  key={item.title}
                  className="rounded border border-[#e5e5e5] bg-white p-4"
                >
                  <h3 className="text-[16px] font-bold">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-5 text-[#666666]">
                    {item.description}
                  </p>
                  <div className="mt-4">
                    <FoundationPreview type={item.preview} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="border-b border-[#e5e5e5] pb-3">
              <h2 className="text-[20px] font-bold">
                Inventaire des composants data.gouv
              </h2>
              <p className="mt-1 text-[14px] text-[#666666]">
                Liste issue du package npm, regroupee pour prioriser les
                prochaines iterations de documentation.
              </p>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {componentGroups.map((group) => {
                const Icon = group.icon;

                return (
                  <article
                    key={group.title}
                    className="rounded border border-[#e5e5e5] bg-white"
                  >
                    <header className="flex items-center gap-3 border-b border-[#e5e5e5] bg-[#f6f6f6] px-4 py-3">
                      <span className="flex size-8 items-center justify-center rounded bg-white text-[#000091]">
                        <Icon aria-hidden size={18} />
                      </span>
                      <div>
                        <h3 className="text-[15px] font-bold">
                          {group.title}
                        </h3>
                        <p className="text-[12px] text-[#666666]">
                          {group.components.length} composants
                        </p>
                      </div>
                    </header>
                    <div className="flex flex-wrap gap-2 p-4">
                      {group.components.map((component) => (
                        <span
                          key={component}
                          className="rounded border border-[#e5e5e5] bg-white px-2 py-1 text-[12px] font-bold text-[#3a3a3a]"
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded border border-[#e5e5e5] bg-[#f6f6f6] p-4">
            <div className="flex items-start gap-3">
              <RiTableLine
                aria-hidden
                size={20}
                className="mt-0.5 text-[#000091]"
              />
              <div>
                <h2 className="text-[16px] font-bold">Suite proposee</h2>
                <p className="mt-1 text-[14px] leading-6 text-[#3a3a3a]">
                  Etape suivante : transformer chaque famille en section de
                  documentation avec etats, variantes, exemples d&apos;usage et
                  code React local quand le composant est utile au Prototype
                  Lab.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
