"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  RiArrowLeftLine,
  RiBarChartLine,
  RiCheckboxCircleLine,
  RiCodeLine,
  RiDatabase2Line,
  RiExternalLinkLine,
  RiFileList3Line,
  RiInformationLine,
  RiPaletteLine,
  RiSearchLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiStackLine,
  RiTableLine,
  type RemixiconComponentType,
} from "@remixicon/react";
import { getPrototypeBySlug } from "@/lib/prototypes";

const prototype = getPrototypeBySlug("design-system");

type Foundation = {
  id: string;
  title: string;
  description: string;
  preview: "button" | "tags" | "card" | "table";
};

type ComponentGroup = {
  id: string;
  title: string;
  description: string;
  icon: RemixiconComponentType;
  components: string[];
};

type FoundationNavigationItem = Foundation & {
  kind: "foundation";
  icon: RemixiconComponentType;
  count: number;
};

type ComponentNavigationItem = ComponentGroup & {
  kind: "component";
  count: number;
};

type NavigationItem = FoundationNavigationItem | ComponentNavigationItem;

const foundations: Foundation[] = [
  {
    id: "boutons",
    title: "Boutons",
    description: "Actions primaires, secondaires et liens d'action.",
    preview: "button",
  },
  {
    id: "tags-et-statuts",
    title: "Tags et statuts",
    description: "Etiquettes compactes pour qualifier une ressource.",
    preview: "tags",
  },
  {
    id: "cartes",
    title: "Cartes",
    description: "Synthese dataset, reutilisation, organisation et service.",
    preview: "card",
  },
  {
    id: "tableaux",
    title: "Tableaux",
    description: "Donnees denses, metadonnees et etats de chargement.",
    preview: "table",
  },
];

const componentGroups: ComponentGroup[] = [
  {
    id: "identite-proprietaires",
    title: "Identite et proprietaires",
    description: "Elements pour afficher auteurs, producteurs et organisations.",
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
    id: "catalogues-cartes",
    title: "Catalogues et cartes",
    description: "Cartes metier pour jeux de donnees, services et reutilisations.",
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
    id: "qualite-details",
    title: "Qualite et details",
    description: "Indicateurs, listes de description et informations qualifiantes.",
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
    id: "ressources-previews",
    title: "Ressources et previews",
    description: "Exploration, previews, schemas et metadonnees de ressources.",
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
    id: "navigation-interaction",
    title: "Navigation et interaction",
    description: "Liens, actions, pagination, onglets et surfaces d'aide.",
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
    id: "donnees-visualisation",
    title: "Donnees et visualisation",
    description: "Activite, statistiques, graphiques et icones de format.",
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
    id: "feedback-utilitaires",
    title: "Feedback et utilitaires",
    description: "Chargement, bannieres, placeholders et composants techniques.",
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

const navigationFoundations: FoundationNavigationItem[] = foundations.map((foundation) => ({
  ...foundation,
  kind: "foundation",
  icon: RiPaletteLine,
  count: 1,
}));

const navigationComponents: ComponentNavigationItem[] = componentGroups.map((group) => ({
  ...group,
  kind: "component",
  count: group.components.length,
}));

const navigationItems = [...navigationFoundations, ...navigationComponents];

function CategoryTag({ children }: { children: string }) {
  return (
    <span className="rounded bg-[#eeeeee] px-2 py-0.5 text-[12px] leading-4 text-[#3a3a3a]">
      {children}
    </span>
  );
}

function NavigationButton({
  item,
  active,
  onSelect,
}: {
  item: NavigationItem;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid h-8 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 rounded px-1 py-1 text-left ${
        active ? "bg-[#eeeeee]" : "hover:bg-[#f6f6f6]"
      }`}
    >
      <span
        className={`flex shrink-0 items-center rounded-[1px] p-0.5 ${
          item.kind === "foundation"
            ? "bg-[#fee7fc] text-[#6e445a]"
            : "bg-[#e8edff] text-[#000091]"
        }`}
      >
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span
        className={`truncate text-[13px] ${
          active ? "font-extrabold text-[#161616]" : "font-medium text-[#3a3a3a]"
        }`}
      >
        {item.title}
      </span>
      <CategoryTag>{String(item.count)}</CategoryTag>
    </button>
  );
}

function FoundationPreview({ type }: { type: Foundation["preview"] }) {
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

function ComponentCard({ name }: { name: string }) {
  const segments = name.split("/");
  const shortName = segments.at(-1) ?? name;
  const namespace = segments.length > 1 ? segments.slice(0, -1).join("/") : null;

  return (
    <article className="rounded border border-[#e5e5e5] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {namespace ? (
            <p className="truncate text-[12px] font-medium text-[#666666]">
              {namespace}
            </p>
          ) : null}
          <h3 className="truncate text-[15px] font-bold text-[#161616]">
            {shortName}
          </h3>
        </div>
        <span className="shrink-0 rounded bg-[#E3E3FD] px-2 py-1 text-[12px] font-bold text-[#000091]">
          Vue
        </span>
      </div>
      <p className="mt-3 text-[13px] leading-5 text-[#666666]">
        Reference officielle dans `@datagouv/components-next`, a transposer en
        React localement si le prototype en a besoin.
      </p>
    </article>
  );
}

export default function DesignSystemPage() {
  const [activeItemId, setActiveItemId] = useState(navigationItems[0].id);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFoundations = useMemo(
    () =>
      navigationFoundations.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [searchQuery],
  );

  const filteredComponents = useMemo(
    () =>
      navigationComponents.filter((item) => {
        const query = searchQuery.trim().toLowerCase();

        return (
          item.title.toLowerCase().includes(query) ||
          item.components.some((component) => component.toLowerCase().includes(query))
        );
      }),
    [searchQuery],
  );

  const activeItem =
    navigationItems.find((item) => item.id === activeItemId) ?? navigationItems[0];
  const ActiveIcon = activeItem.icon;

  if (!prototype) {
    return null;
  }

  return (
    <main className="h-dvh overflow-hidden bg-white text-[#161616]">
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-[#f6f6f6] px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#000091] underline-offset-4 hover:underline"
            >
              <RiArrowLeftLine aria-hidden size={16} />
              Retour vers /
            </Link>
            <div className="mt-3 flex min-w-0 items-center gap-2">
              <h1 className="truncate text-[22px] font-bold leading-8">
                {prototype.title}
              </h1>
              <CategoryTag>Prototype Lab</CategoryTag>
            </div>
          </div>

          <a
            href="https://www.npmjs.com/package/@datagouv/components-next"
            className="hidden h-8 items-center gap-2 rounded bg-[#000091] px-3 text-[13px] font-bold text-white hover:bg-[#1212ff] sm:inline-flex"
          >
            Package npm
            <RiExternalLinkLine aria-hidden size={16} />
          </a>
        </header>

        <div className="flex min-h-0 flex-1">
          <aside
            className={`flex shrink-0 flex-col border-r border-[#e5e5e5] bg-white transition-[width] duration-200 ${
              isSidebarCollapsed ? "w-12" : "w-[276px]"
            }`}
          >
            <div className="flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-[#f6f6f6] px-3">
              {isSidebarCollapsed ? null : (
                <span className="text-[13px] font-medium text-[#161616]">
                  Composants
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((current) => !current)}
                aria-label="Afficher ou masquer la navigation des composants"
                title="Afficher ou masquer la navigation des composants"
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded transition-colors hover:bg-[#eeeeee]"
              >
                {isSidebarCollapsed ? (
                  <RiSidebarUnfoldLine aria-hidden className="h-4 w-4" />
                ) : (
                  <RiSidebarFoldLine aria-hidden className="h-4 w-4" />
                )}
              </button>
            </div>

            <div
              className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-2 ${
                isSidebarCollapsed ? "hidden" : ""
              }`}
            >
              <label className="flex h-8 items-center gap-1 rounded border border-[#e5e5e5] bg-[#f6f6f6] px-2">
                <RiSearchLine aria-hidden className="h-3.5 w-3.5 text-[#3a3a3a]" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  aria-label="Rechercher un composant"
                  placeholder="Rechercher un composant"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#3a3a3a]"
                />
              </label>

              <section className="space-y-0.5">
                <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                  {filteredFoundations.length} Fondations
                </p>
                {filteredFoundations.map((item) => (
                  <NavigationButton
                    key={item.id}
                    item={item}
                    active={item.id === activeItem.id}
                    onSelect={() => setActiveItemId(item.id)}
                  />
                ))}
              </section>

              <section className="space-y-0.5">
                <p className="h-7 px-1 py-2 text-[12px] font-medium leading-3 text-[#3a3a3a]">
                  {filteredComponents.length} Familles
                </p>
                {filteredComponents.map((item) => (
                  <NavigationButton
                    key={item.id}
                    item={item}
                    active={item.id === activeItem.id}
                    onSelect={() => setActiveItemId(item.id)}
                  />
                ))}
              </section>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-[#f6f6f6] px-3">
              <div className="flex min-w-0 items-center gap-2 text-[13px]">
                <ActiveIcon aria-hidden className="h-4 w-4 text-[#000091]" />
                <span className="truncate font-medium">{activeItem.title}</span>
                <span className="text-[#3a3a3a]">·</span>
                <span className="truncate text-[#3a3a3a]">
                  {activeItem.kind === "foundation"
                    ? "Fondation visible"
                    : `${activeItem.count} composants`}
                </span>
              </div>
              <CategoryTag>
                {activeItem.kind === "foundation" ? "React local" : "Vue source"}
              </CategoryTag>
            </header>

            <div className="flex h-12 shrink-0 items-center border-b border-[#e5e5e5] bg-white px-3">
              <div className="flex items-center rounded border border-[#e5e5e5]">
                <button className="h-7 rounded border border-[#000091] px-2.5 text-[12px] font-medium leading-6 text-[#000091]">
                  Apercu
                </button>
                <button className="h-7 px-2.5 text-[12px] font-medium leading-6 text-[#161616]">
                  Usage
                </button>
                <button className="h-7 px-2.5 text-[12px] font-medium leading-6 text-[#161616]">
                  Code
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white p-4 sm:p-6">
              <div className="mx-auto max-w-5xl space-y-6">
                <section className="rounded border border-[#e5e5e5] bg-[#f6f6f6] p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded bg-white text-[#000091]">
                      <ActiveIcon aria-hidden size={18} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[18px] font-bold leading-7">
                        {activeItem.title}
                      </h2>
                      <p className="mt-1 max-w-3xl text-[14px] leading-6 text-[#3a3a3a]">
                        {activeItem.description}
                      </p>
                    </div>
                  </div>
                </section>

                {activeItem.kind === "foundation" ? (
                  <section className="rounded border border-[#e5e5e5] bg-white p-4">
                    <h3 className="text-[16px] font-bold">Apercu</h3>
                    <div className="mt-4">
                      <FoundationPreview type={activeItem.preview} />
                    </div>
                  </section>
                ) : (
                  <section>
                    <div className="flex items-end justify-between gap-4 border-b border-[#e5e5e5] pb-3">
                      <div>
                        <h3 className="text-[16px] font-bold">
                          Composants de la famille
                        </h3>
                        <p className="mt-1 text-[13px] leading-5 text-[#666666]">
                          Inventaire issu du package npm installe. Les composants
                          sont references ici comme source officielle pour les
                          transpositions React.
                        </p>
                      </div>
                      <CategoryTag>{`${activeItem.components.length} items`}</CategoryTag>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {activeItem.components.map((component) => (
                        <ComponentCard key={component} name={component} />
                      ))}
                    </div>
                  </section>
                )}

                <section className="rounded border border-[#e5e5e5] bg-[#f6f6f6] p-4">
                  <div className="flex items-start gap-3">
                    <RiTableLine
                      aria-hidden
                      size={20}
                      className="mt-0.5 text-[#000091]"
                    />
                    <div>
                      <h2 className="text-[16px] font-bold">
                        Regle d&apos;integration
                      </h2>
                      <p className="mt-1 text-[14px] leading-6 text-[#3a3a3a]">
                        Le CSS compile du package est charge globalement. Les
                        composants publies restent des composants Vue : pour les
                        utiliser dans un prototype Next, creer une version React
                        locale dans `/components`.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
