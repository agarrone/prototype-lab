"use client";

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  RiAlertLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiBuilding4Line,
  RiCalendarLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiHome4Line,
  RiInformationLine,
  RiLightbulbLine,
  RiLoader4Line,
  RiMap2Line,
  RiMapPin2Line,
  RiSearchLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiStore2Line,
  RiTableLine,
} from "@remixicon/react";
import DvfMap, { initialDvfMapContext, type DvfMapContext, type DvfMapNavigationTarget } from "./dvf-map";
import DvfChart from "./dvf-chart";
import { CondominiumInformationCard, DpeInformationCard, UsefulLinksCards } from "./parcel-information-cards";
import { ExplorerPrototype } from "../explorateur/page";
import type { DatagouvResourceSummary } from "@/lib/datagouv";

type View = "carte" | "tableau" | "apropos";
type PropertyType = "all" | "apartments" | "houses" | "commercial";
type ParcelSection = "transactions" | "dpe" | "copropriete" | "liens";
type BreadcrumbTarget = "national" | "departement" | "commune" | "section";
type PrototypeResultState = "ready" | "address" | "loading" | "empty" | "error" | "uncovered";

const parcelSections: { id: ParcelSection; label: string }[] = [
  { id: "transactions", label: "Transactions" },
  { id: "dpe", label: "Diagnostics de performance énergétique (DPE)" },
  { id: "copropriete", label: "Informations sur la copropriété" },
  { id: "liens", label: "Liens utiles" },
];

const parcelSectionDescriptions: Record<ParcelSection, string> = {
  transactions: "Consultez les transactions enregistrées sur cette parcelle au cours des cinq dernières années.",
  dpe: "Consultez les diagnostics énergétiques disponibles pour les bâtiments de cette parcelle.",
  copropriete: "Consultez les informations disponibles sur la copropriété associée à cette parcelle.",
  liens: "Accédez aux services publics utiles pour approfondir les informations sur cette parcelle.",
};

const tabs: { id: View; label: string; icon: typeof RiMap2Line }[] = [
  { id: "carte", label: "Carte", icon: RiMap2Line },
  { id: "tableau", label: "Tableau", icon: RiTableLine },
];

const departments = [
  "01 - Ain",
  "02 - Aisne",
  "06 - Alpes-Maritimes",
  "13 - Bouches-du-Rhône",
  "31 - Haute-Garonne",
  "33 - Gironde",
  "44 - Loire-Atlantique",
  "59 - Nord",
  "69 - Rhône",
  "75 - Paris",
  "92 - Hauts-de-Seine",
  "93 - Seine-Saint-Denis",
  "94 - Val-de-Marne",
];

const dvfResources: DatagouvResourceSummary[] = [
  {
    id: "dvf-2025",
    title: "Demandes de valeurs foncières 2025",
    format: "CSV",
    sizeLabel: "2,1 Go",
    updatedAtLabel: "avril 2026",
    downloads: 18425,
    type: "main",
  },
];

const aboutLinkClass = "font-medium text-[#000091] underline underline-offset-2 hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]";

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: "À quoi correspond le prix affiché ?",
    answer: <p>Le prix porte sur les éléments immobiliers enregistrés dans la vente. Le mobilier éventuellement compris dans l’acte n’est pas comptabilisé. Les frais d’agence ne sont inclus que lorsque l’acte précise qu’ils sont à la charge du vendeur.</p>,
  },
  {
    question: "À quoi correspond la surface affichée ?",
    answer: <div className="space-y-3"><p>Il s’agit de la surface réelle bâtie déclarée auprès des services fonciers, et non de la surface Carrez. La valeur présentée est la dernière connue à la date de la vente.</p><p>Si elle n’est plus exacte, une déclaration foncière doit être adressée au service compétent. Le formulaire et les coordonnées du service sont disponibles sur <a className={aboutLinkClass} href="https://www.impots.gouv.fr/" target="_blank" rel="noreferrer">impots.gouv.fr</a>.</p></div>,
  },
  {
    question: "Pourquoi manque-t-il l’Alsace, la Moselle et Mayotte ?",
    answer: <div className="space-y-3"><p>La DGFiP ne dispose pas des mutations du Bas-Rhin, du Haut-Rhin, de la Moselle et de Mayotte dans la base DVF.</p><p>Dans l’ancienne Alsace-Moselle, ces informations relèvent du Livre foncier en application du droit local et ne sont actuellement pas ouvertes.</p></div>,
  },
  {
    question: "Quand aura lieu la prochaine mise à jour ?",
    answer: <div className="space-y-3"><p>La DGFiP publie les <a className={aboutLinkClass} href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/" target="_blank" rel="noreferrer">données brutes</a> deux fois par an, à la fin des mois d’avril et d’octobre. La publication d’avril complète les données jusqu’à décembre de l’année précédente ; celle d’octobre va jusqu’à juin de l’année en cours.</p><p>Chaque mise à jour peut également enrichir les millésimes antérieurs. Pour vérifier l’enregistrement d’une vente, vous pouvez contacter le service de publicité foncière de proximité.</p></div>,
  },
  {
    question: "Comment faire opposition à l’affichage d’une transaction ?",
    answer: <div className="space-y-3"><p>La diffusion de DVF répond à une obligation légale issue de la loi du 10 août 2018 et de <a className={aboutLinkClass} href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037309458" target="_blank" rel="noreferrer">l’article L. 112 A du Livre des procédures fiscales</a>. Elle poursuit un objectif d’intérêt général de transparence du marché immobilier.</p><p>Il n’est donc pas possible de s’opposer à cette diffusion ni de demander l’effacement d’une transaction. Les personnes concernées conservent toutefois leurs droits d’accès, de rectification et de limitation. Une preuve d’identité peut être demandée pour traiter la démarche.</p><p><a className={aboutLinkClass} href="https://static.data.gouv.fr/resources/demandes-de-valeurs-foncieres/20201026-172636/information-des-personnes-concernees-par-le-traitement-informatique-20201016.pdf" target="_blank" rel="noreferrer">Consulter l’information relative au traitement des données personnelles</a>.</p></div>,
  },
  {
    question: "J’ai constaté une erreur",
    answer: <p>Vous pouvez signaler une erreur aux producteurs depuis <a className={aboutLinkClass} href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/" target="_blank" rel="noreferrer">la page du jeu de données</a>, ou écrire au bureau GF3B de la DGFiP à <a className={aboutLinkClass} href="mailto:bureau.gf3b-dvf@dgfip.finances.gouv.fr">bureau.gf3b-dvf@dgfip.finances.gouv.fr</a>.</p>,
  },
  {
    question: "J’ai constaté un manque",
    answer: <div className="space-y-3"><p>Une transaction peut manquer pour plusieurs raisons :</p><ul className="list-disc space-y-1 pl-5"><li>la remontée des ventes récentes peut prendre du temps, y compris pour certains millésimes antérieurs ;</li><li>le cadastre de la zone n’est pas vectorisé ;</li><li>une fusion de communes n’a pas encore été intégrée.</li></ul><p>Le service de publicité foncière de proximité peut confirmer la situation juridique et l’enregistrement d’un immeuble.</p></div>,
  },
  {
    question: "Autres services utiles",
    answer: <div className="space-y-3"><p>L’explorateur combine DVF avec d’autres données publiques, notamment les DPE et le registre des copropriétés. Pour approfondir :</p><ul className="list-disc space-y-2 pl-5"><li>couverture des réseaux sur <a className={aboutLinkClass} href="https://maconnexioninternet.arcep.fr/" target="_blank" rel="noreferrer">Ma connexion internet</a> ;</li><li>accessibilité des lieux sur <a className={aboutLinkClass} href="https://acceslibre.beta.gouv.fr/" target="_blank" rel="noreferrer">AccèsLibre</a> ;</li><li>risques naturels et technologiques sur <a className={aboutLinkClass} href="https://www.georisques.gouv.fr/" target="_blank" rel="noreferrer">Géorisques</a> ;</li><li>règles d’urbanisme sur le <a className={aboutLinkClass} href="https://www.geoportail-urbanisme.gouv.fr/" target="_blank" rel="noreferrer">Géoportail de l’urbanisme</a> ;</li><li>rénovation énergétique sur <a className={aboutLinkClass} href="https://particulier.gorenove.fr/" target="_blank" rel="noreferrer">Go-Rénove</a> ;</li><li>évolution des prix sur <a className={aboutLinkClass} href="https://datafoncier.cerema.fr/" target="_blank" rel="noreferrer">Dynmark</a>.</li></ul></div>,
  },
  {
    question: "J’ai une autre question",
    answer: <div className="space-y-3"><p>Pour une question sur les données, utilisez <a className={aboutLinkClass} href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/discussions" target="_blank" rel="noreferrer">l’espace de discussion DVF</a> ou contactez la DGFiP à <a className={aboutLinkClass} href="mailto:bureau.gf3b-dvf@dgfip.finances.gouv.fr">bureau.gf3b-dvf@dgfip.finances.gouv.fr</a>. Pour une question concernant l’application, écrivez à <a className={aboutLinkClass} href="https://support.data.gouv.fr/" target="_blank" rel="noreferrer">l’équipe data.gouv.fr</a>.</p><p>Les informations DPE proviennent de la <a className={aboutLinkClass} href="https://www.data.gouv.fr/fr/datasets/base-de-donnees-nationale-des-batiments/" target="_blank" rel="noreferrer">Base de données nationale des bâtiments</a>. Les données de copropriété viennent du <a className={aboutLinkClass} href="https://www.data.gouv.fr/fr/datasets/registre-national-dimmatriculation-des-coproprietes/" target="_blank" rel="noreferrer">registre national d’immatriculation des copropriétés</a>.</p></div>,
  },
];

const sourceDatasets = [
  ["Demandes de valeurs foncières (DVF)", "Ministères économiques et financiers", "https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/"],
  ["Demandes de valeurs foncières géolocalisées", "data.gouv.fr", "https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres-geolocalisees/"],
  ["Cadastre", "data.gouv.fr", "https://www.data.gouv.fr/fr/datasets/cadastre/"],
  ["Base Adresse Nationale (BAN)", "Base Adresse Nationale", "https://www.data.gouv.fr/fr/datasets/base-adresse-nationale/"],
  ["Base de données nationale des bâtiments (BDNB)", "Centre scientifique et technique du bâtiment", "https://www.data.gouv.fr/fr/datasets/base-de-donnees-nationale-des-batiments/"],
  ["Registre national d’immatriculation des copropriétés (RNIC)", "Agence nationale de l’habitat", "https://www.data.gouv.fr/fr/datasets/registre-national-dimmatriculation-des-coproprietes/"],
];

const recommendedApplications = [
  ["Couverture des réseaux", "ARCEP", "maconnexioninternet.arcep.fr", "https://maconnexioninternet.arcep.fr/"],
  ["Lieux accessibles", "AccèsLibre", "acceslibre.beta.gouv.fr", "https://acceslibre.beta.gouv.fr/"],
  ["Risques d’une zone géographique", "BRGM", "georisques.gouv.fr", "https://www.georisques.gouv.fr/"],
  ["Données d’urbanisme", "IGN", "geoportail-urbanisme.gouv.fr", "https://www.geoportail-urbanisme.gouv.fr/"],
  ["Performance énergétique", "CSTB", "particulier.gorenove.fr", "https://particulier.gorenove.fr/"],
  ["Évolution des prix immobiliers", "Cerema", "datafoncier.cerema.fr", "https://datafoncier.cerema.fr/"],
];

const legends = {
  national: ["900 €", "2 600 €", "9 000 €"],
  departement: ["1 400 €", "3 500 €", "7 800 €"],
  commune: ["1 800 €", "4 700 €", "10 500 €"],
};

function FranceMap({ context, onContextChange, navigationTarget }: { context: DvfMapContext; onContextChange: (context: DvfMapContext) => void; navigationTarget?: DvfMapNavigationTarget | null }) {
  const legend = context.scale === "parcelle" ? null : legends[context.scale];
  const [colorsVisible, setColorsVisible] = useState(true);
  return (
    <div className="relative h-full min-h-[520px] overflow-hidden bg-[#c8ddf0]">
      <DvfMap onContextChange={onContextChange} navigationTarget={navigationTarget} onColorsVisibilityChange={setColorsVisible} />
      {legend && colorsVisible ? <div className="absolute bottom-12 right-5 w-[240px] max-w-[calc(100%-2.5rem)] rounded border border-[#E5E5E5] bg-white p-3 shadow-[0_2px_4px_rgba(0,0,0,.08),0_4px_12px_rgba(0,0,0,.08)]">
        <div className="flex items-center justify-between gap-3"><p className="text-[12px] font-bold">Prix au m²</p><span className="text-[10px] text-[#666666]">Échelle recalculée</span></div>
        <div className="mt-1.5 h-2 bg-gradient-to-r from-[#028758] via-[#FFF64E] to-[#CC000A]" />
        <div className="mt-1 flex justify-between text-[10px] text-[#666]">
          <span>&lt; {legend[0]}</span><span>{legend[1]}</span><span>&gt; {legend[2]}</span>
        </div>
      </div> : null}
      {context.scale === "parcelle" ? <div className="absolute bottom-12 right-5 flex max-w-[calc(100%-2.5rem)] flex-wrap gap-x-3 gap-y-1 rounded border border-[#E5E5E5] bg-white px-3 py-2 text-[10px] text-[#3a3a3a] shadow-[0_2px_4px_rgba(0,0,0,.08),0_4px_12px_rgba(0,0,0,.08)]">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 bg-[#6A6AF4]" />Vente disponible</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 border border-[#A1000B] bg-[#E1000F]" />Parcelle sélectionnée</span>
      </div> : null}
    </div>
  );
}

function InfoTooltip({ id, text, align = "left" }: { id: string; text: string; align?: "left" | "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const openTooltip = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const preferredLeft = align === "right" ? rect.right - 256 : rect.left;
      setPosition({ top: rect.bottom + 6, left: Math.max(8, Math.min(preferredLeft, window.innerWidth - 264)) });
    }
    setIsOpen(true);
  };

  return (
    <span className="relative inline-flex shrink-0" onMouseEnter={openTooltip} onMouseLeave={() => setIsOpen(false)}>
      <button ref={buttonRef} type="button" title={text} aria-describedby={id} aria-expanded={isOpen} onClick={openTooltip} onFocus={openTooltip} onBlur={() => setIsOpen(false)} onKeyDown={(event) => { if (event.key === "Escape") setIsOpen(false); }} className="flex h-5 w-5 items-center justify-center rounded-full text-[#666666] hover:bg-[#E5E5E5] hover:text-[#161616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#000091]">
        <RiInformationLine aria-hidden className="h-4 w-4" />
        <span className="sr-only">Afficher l’explication</span>
      </button>
      {isOpen ? createPortal(<span id={id} role="tooltip" style={{ top: position.top, left: position.left }} className="pointer-events-none fixed z-[200] w-64 rounded border border-[#E5E5E5] bg-white p-3 text-left text-[12px] font-normal leading-5 text-[#161616] shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]">{text}</span>, document.body) : null}
    </span>
  );
}

type ParcelLot = {
  type: string;
  rooms?: string;
  surface?: string;
};

function ParcelTransactionCard({ date, price, pricePerSquareMeter, address, mutationId, lots }: { date: string; price: string; pricePerSquareMeter?: string; address: string; mutationId: string; lots: ParcelLot[] }) {
  return (
    <article className="overflow-hidden rounded border border-[#E5E5E5] bg-[#f6f6f6]">
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[14px] font-bold leading-5">Vente</p>
          <p className="shrink-0 text-right text-[14px] font-bold leading-5 text-[#000091]">{price}</p>
        </div>
        <div className="mt-1.5 space-y-0.5 text-[12px] leading-4 text-[#666666]">
          <div className="flex items-center justify-between gap-3"><p className="flex min-w-0 items-center gap-1"><RiCalendarLine aria-hidden className="h-3.5 w-3.5 shrink-0" />{date}</p>{pricePerSquareMeter ? <p className="shrink-0 font-medium text-[#000091]">{pricePerSquareMeter} par m²</p> : null}</div>
          <p className="flex items-start gap-1"><RiMapPin2Line aria-hidden className="h-3.5 w-3.5 shrink-0" />{address}</p>
        </div>
        <div className="mt-3">
          <p className="mb-1 text-[13px] font-bold">{`${lots.length} ${lots.length > 1 ? "lots" : "lot"}`}</p>
          <div className="overflow-hidden">
            <table className="w-full table-fixed text-left text-[12px] leading-4">
              <thead className="sr-only"><tr><th>Type de lot</th><th>Pièces</th><th>Surface</th></tr></thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {lots.map((lot, index) => {
                  return <tr key={`${lot.type}-${index}`}>
                    <th scope="row" className="w-[43%] py-1.5 pr-2 font-normal text-[#3a3a3a]">{lot.type}</th>
                    <td className="w-[29%] px-1 py-1.5 text-[#666666]">{lot.rooms ?? "Non renseigné"}</td>
                    <td className="w-[28%] py-1.5 pl-1 text-right text-[#3a3a3a]">{lot.surface ?? "Non renseignée"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-4 text-[#666666]">Référence de la transaction : {mutationId}</p>
      </div>
    </article>
  );
}

function ContextBreadcrumb({ context, onNavigate }: { context: DvfMapContext; onNavigate: (target: BreadcrumbTarget) => void }) {
  const department = context.code?.startsWith("34") ? "Hérault" : "Gironde";
  const commune = context.code?.startsWith("34") ? "Montpellier" : "Bordeaux";
  const items: { label: string; target?: BreadcrumbTarget }[] = [{ label: "France", target: context.scale === "national" ? undefined : "national" }];
  if (context.scale !== "national") items.push({ label: context.scale === "departement" ? context.label : department, target: context.scale === "departement" ? undefined : "departement" });
  if (context.scale === "commune" || context.scale === "parcelle") items.push({ label: context.scale === "commune" ? context.label : commune, target: context.scale === "commune" ? undefined : "commune" });
  if (context.scale === "parcelle" && context.sectionLabel) items.push({ label: context.sectionLabel, target: context.selectedParcel ? "section" : undefined });
  if (context.scale === "parcelle" && (context.selectedParcel || !context.sectionLabel)) items.push({ label: context.label });

  return (
    <nav className="fr-breadcrumb mb-3 text-[12px] leading-5" aria-label="Vous êtes ici :">
      <ol className="fr-breadcrumb__list flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2 before:text-[#929292] before:content-['›'] first:before:hidden">{item.target ? <button type="button" onClick={() => onNavigate(item.target!)} className="truncate text-[#000091] underline underline-offset-2 hover:decoration-2">{item.label}</button> : <span aria-current="page" className="truncate text-[#666666]">{item.label}</span>}</li>)}
      </ol>
    </nav>
  );
}

function ResultStateContent({ state, onRetry, onOpenParcel }: { state: Exclude<PrototypeResultState, "ready">; onRetry: () => void; onOpenParcel: () => void }) {
  if (state === "loading") return <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center" role="status"><RiLoader4Line aria-hidden className="h-7 w-7 animate-spin text-[#000091] motion-reduce:animate-none" /><h3 className="mt-4 text-[17px] font-bold">Chargement des résultats</h3><p className="mt-1 max-w-72 text-[13px] leading-5 text-[#666666]">La nouvelle sélection est en cours d’analyse. Les résultats précédents sont temporairement masqués.</p></div>;
  if (state === "empty") return <div className="px-2 py-6"><h3 className="text-[17px] font-bold">Aucune transaction trouvée</h3><p className="mt-2 text-[13px] leading-5 text-[#666666]">Aucune vente ne correspond à cette sélection sur la période 2021–2025. Une vente récente peut aussi ne pas encore avoir été publiée.</p><button type="button" onClick={onRetry} className="mt-4 text-[13px] font-medium text-[#000091] underline underline-offset-2">Modifier la recherche</button></div>;
  if (state === "error") return <div className="px-2 py-6"><RiAlertLine aria-hidden className="h-6 w-6 text-[#E1000F]" /><h3 className="mt-3 text-[17px] font-bold">Impossible de charger les résultats</h3><p className="mt-2 text-[13px] leading-5 text-[#666666]">Un problème technique est survenu. Votre recherche reste conservée.</p><button type="button" onClick={onRetry} className="mt-4 inline-flex h-9 items-center bg-[#000091] px-3 text-[13px] font-medium text-white">Réessayer</button></div>;
  if (state === "uncovered") return <div className="px-2 py-6"><RiMapPin2Line aria-hidden className="h-6 w-6 text-[#666666]" /><h3 className="mt-3 text-[17px] font-bold">Territoire non couvert</h3><p className="mt-2 text-[13px] leading-5 text-[#666666]">Les données DVF ne sont pas disponibles pour le Bas-Rhin, le Haut-Rhin, la Moselle et Mayotte.</p><button type="button" onClick={onRetry} className="mt-4 text-[13px] font-medium text-[#000091] underline underline-offset-2">Choisir un autre territoire</button></div>;
  return <div className="px-2 py-4"><p className="text-[11px] font-medium uppercase tracking-[.04em] text-[#666666]">Adresse localisée</p><h3 className="mt-1 text-[18px] font-bold">12 rue des Argentiers</h3><p className="mt-1 text-[13px] text-[#666666]">33000 Bordeaux</p><div className="mt-5 border-l-4 border-[#000091] bg-[#f6f6f6] p-4"><p className="text-[13px] font-medium">1 parcelle cadastrale correspond à cette adresse</p><p className="mt-1 text-[12px] leading-5 text-[#666666]">Sélectionnez-la pour consulter les transactions enregistrées.</p></div><button type="button" onClick={onOpenParcel} className="mt-4 inline-flex h-10 items-center bg-[#000091] px-4 text-[13px] font-medium text-white">Voir la parcelle et ses transactions</button></div>;
}

function StatPanel({ context, propertyType, onPropertyTypeChange, onBreadcrumbNavigate, resultState, onRetry, onOpenParcel, onCloseMobile, onCollapse }: { context: DvfMapContext; propertyType: PropertyType; onPropertyTypeChange: (value: PropertyType) => void; onBreadcrumbNavigate: (target: BreadcrumbTarget) => void; resultState: PrototypeResultState; onRetry: () => void; onOpenParcel: () => void; onCloseMobile: () => void; onCollapse: () => void }) {
  const [parcelSection, setParcelSection] = useState<ParcelSection>("transactions");
  const locationScale = context.scale === "national" ? "Vue nationale" : context.scale === "departement" ? "Département" : context.scale === "commune" ? "Commune" : "Parcelle cadastrale";
  const isParcelLevel = context.scale === "parcelle";
  const simulatedOffset = [...(context.code ?? "France")].reduce((total, character) => total + character.charCodeAt(0), 0);
  const medianPrice = context.scale === "national" ? "2 576 €" : `${(1_800 + simulatedOffset * 7).toLocaleString("fr-FR")} €`;
  const salesByProperty = context.scale === "national"
    ? ["2 337 142", "1 931 793", "223 606"]
    : [
        (9_800 + simulatedOffset * 61).toLocaleString("fr-FR"),
        (7_200 + simulatedOffset * 47).toLocaleString("fr-FR"),
        (840 + simulatedOffset * 7).toLocaleString("fr-FR"),
      ];
  const pricesByProperty = [
    medianPrice,
    `${Math.max(900, 1600 + simulatedOffset * 4).toLocaleString("fr-FR")} €`,
    `${Math.max(700, 1100 + simulatedOffset * 2).toLocaleString("fr-FR")} €`,
  ];
  const combinedSales = salesByProperty.slice(0, 2).reduce((sum, value) => sum + Number(value.replace(/\s/g, "")), 0).toLocaleString("fr-FR");
  const propertyRows = [
    { id: "apartments", label: "Appartements", icon: RiBuilding4Line, sales: salesByProperty[0], price: pricesByProperty[0] },
    { id: "houses", label: "Maisons", icon: RiHome4Line, sales: salesByProperty[1], price: pricesByProperty[1] },
    { id: "commercial", label: "Locaux", icon: RiStore2Line, sales: salesByProperty[2], price: pricesByProperty[2] },
  ].filter((row) => propertyType === "all" ? row.id !== "commercial" : row.id === propertyType);

  return (
    <aside className="flex h-full w-[400px] shrink-0 flex-col overflow-hidden border-r border-[#E5E5E5] bg-white max-lg:w-full max-lg:border-0">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-3">
        <button type="button" onClick={onCloseMobile} className="dvf-mobile-back items-center gap-1 text-[13px] font-medium text-[#000091]"><RiArrowLeftLine className="h-4 w-4" />Retour à la carte</button>
        <span className="dvf-desktop-panel-title text-[14px] font-medium text-[#161616]">{isParcelLevel ? "Détail de la parcelle" : "Informations sur le territoire"}</span>
        <div className="flex items-center gap-2"><span className="rounded bg-[#eeeeee] px-2 py-1 text-[12px] leading-4 text-[#3a3a3a]">{resultState === "address" ? "Adresse" : locationScale}</span><button type="button" onClick={onCollapse} aria-label="Replier le panneau d’informations" className="dvf-desktop-panel-title h-8 w-8 items-center justify-center rounded text-[#161616] hover:bg-[#e5e5e5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]"><RiSidebarFoldLine className="h-5 w-5" /></button></div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
      {resultState !== "ready" ? <ResultStateContent state={resultState} onRetry={onRetry} onOpenParcel={onOpenParcel} /> : <>
      <ContextBreadcrumb context={context} onNavigate={onBreadcrumbNavigate} />
      <h2 className="text-[20px] font-bold leading-7">{context.scale === "national" ? "France entière" : context.label}</h2>
      {isParcelLevel && context.selectedParcel ? <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] leading-5 text-[#666666]"><span>Identifiant : <strong className="font-medium text-[#3a3a3a]">{context.selectedParcel}</strong></span><span aria-hidden="true">·</span><span>Surface cadastrale : <strong className="font-medium text-[#3a3a3a]">202 m²</strong></span></p> : null}
      {isParcelLevel && context.selectedParcel ? <label className="mt-4 block text-[12px] font-medium text-[#3a3a3a]">Informations affichées<span className="relative mt-1 block"><select value={parcelSection} onChange={(event) => setParcelSection(event.target.value as ParcelSection)} className="h-10 w-full appearance-none rounded border border-[#E5E5E5] bg-[#f6f6f6] py-0 pl-3 pr-10 text-[13px] font-normal text-[#161616] outline-none focus:border-[#000091] focus:outline focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#000091]">{parcelSections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}</select><RiArrowDownSLine aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#161616]" /></span></label> : null}
      <p className="mt-2 text-[13px] leading-5 text-[#3a3a3a]">{isParcelLevel ? context.selectedParcel ? parcelSectionDescriptions[parcelSection] : "Zoomez puis sélectionnez une parcelle colorée pour consulter le détail de ses mutations." : "Les indicateurs et la palette sont recalculés pour le territoire affiché."}</p>
      {!isParcelLevel ? <><label className="mt-4 block text-[12px] font-medium text-[#3a3a3a]">Type de bien<span className="relative mt-1 block"><select value={propertyType} onChange={(event) => onPropertyTypeChange(event.target.value as PropertyType)} className="h-9 w-full appearance-none rounded border border-[#E5E5E5] bg-[#f6f6f6] py-0 pl-2 pr-9 text-[13px] font-normal text-[#161616] outline-none focus:border-[#000091] focus:outline focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#000091]"><option value="all">Appartements et maisons</option><option value="apartments">Appartements</option><option value="houses">Maisons</option><option value="commercial">Locaux commerciaux</option></select><RiArrowDownSLine aria-hidden className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-[#161616]" /></span></label><p className="mt-2 text-[12px] leading-4 text-[#666666]">Ventes et prix médians observés au cours des 5 dernières années.</p></> : null}

      {isParcelLevel ? context.selectedParcel ? <>
        {parcelSection === "transactions" ? <><div className="mt-5 flex items-center gap-1"><h3 className="text-[18px] font-bold">2 transactions</h3><InfoTooltip id="transactions-help" text="Les résultats correspondent à des ventes enregistrées et regroupées par transaction. Une transaction peut contenir plusieurs biens, dépendances ou parcelles. Son montant ne constitue pas une estimation des biens voisins." /></div>
        <div className="mt-3 space-y-3">
          <ParcelTransactionCard date="18 novembre 2024" price="428 000 €" pricePerSquareMeter="5 214 €" address="12 rue des Argentiers, 33000 Bordeaux" mutationId="2024-1223497" lots={[{ type: "Appartement", rooms: "4 pièces", surface: "82 m²" }, { type: "Dépendance" }]} />
          <ParcelTransactionCard date="4 juin 2019" price="352 000 €" address="12 rue des Argentiers, 33000 Bordeaux" mutationId="2019-0845216" lots={[{ type: "Appartement", rooms: "4 pièces", surface: "82 m²" }]} />
        </div></> : null}
        {parcelSection === "dpe" ? <div className="mt-4"><DpeInformationCard /></div> : null}
        {parcelSection === "copropriete" ? <div className="mt-4"><CondominiumInformationCard /></div> : null}
        {parcelSection === "liens" ? <div className="mt-4"><UsefulLinksCards /></div> : null}
      </> : <div className="mt-6 border-l-4 border-[#000091] bg-[#f6f6f6] p-4 text-[13px] leading-5">Seules les parcelles simulant au moins une mutation sont colorées et sélectionnables.</div> : <>
        <div className="mt-4 overflow-hidden rounded border border-[#E5E5E5]">
          <table className="w-full border-collapse text-right text-[12px] leading-5">
            <thead className="bg-[#f6f6f6] text-[#161616]"><tr><th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 text-left font-medium">Type de bien</th><th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Ventes</th><th scope="col" className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Prix médian au m²</th></tr></thead>
            <tbody>
              {propertyRows.map(({ label, icon: PropertyIcon, sales, price }, index) => { const isLastRow = index === propertyRows.length - 1; const borderClass = isLastRow ? "" : "border-b border-[#E5E5E5]"; return <tr key={label}><th scope="row" className={`${borderClass} px-2 py-1 text-left font-normal text-[#3a3a3a]`}><span className="inline-flex items-center gap-1"><PropertyIcon className="h-3.5 w-3.5" /> {label}</span></th><td className={`${borderClass} px-2 py-1 tabular-nums text-[#3a3a3a]`}>{sales}</td><td className={`${borderClass} px-2 py-1 tabular-nums text-[#3a3a3a]`}>{price}</td></tr>; })}
              {propertyType === "all" ? <tr className="bg-[#f6f6f6] font-bold"><th scope="row" className="border-t border-[#E5E5E5] px-2 py-1 text-left">Total</th><td className="border-t border-[#E5E5E5] px-2 py-1 tabular-nums">{combinedSales}</td><td className="border-t border-[#E5E5E5] px-2 py-1 tabular-nums">{medianPrice}</td></tr> : null}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded border border-[#E5E5E5] p-3"><p className="flex items-center gap-1 text-[12px] font-medium">Évolution du prix de vente médian au m² <InfoTooltip id="evolution-help" text="Ce graphique indique l'évolution du prix au m² pour le type de biens sélectionné et l'échelle sélectionnée. Les prix au m² sont obtenus en divisant la valeur foncière du bien par sa surface au sol." /></p><DvfChart variant="line" /></div>
        <div className="mt-3 rounded border border-[#E5E5E5] p-3"><p className="flex items-center gap-1 text-[12px] font-medium">Distribution du prix de vente au m² <InfoTooltip id="distribution-help" text="Ce graphique montre la répartition des prix des ventes à l'échelle sélectionnée, pour le type de biens sélectionné. En survolant chaque barre, vous pouvez voir combien de ventes se sont faites à un montant compris dans la tranche de prix affichée." /></p><DvfChart variant="bar" /></div>
      </>}
      </>}
      </div>
    </aside>
  );
}

type SearchSuggestion = {
  id: string;
  type: "Adresse" | "Commune" | "Parcelle cadastrale";
  label: string;
  description: string;
  context: DvfMapContext;
  center: [number, number];
  zoom: number;
};

const searchSuggestions: SearchSuggestion[] = [
  { id: "adresse-bordeaux", type: "Adresse", label: "12 rue des Argentiers", description: "33000 Bordeaux", context: { scale: "parcelle", label: "12 rue des Argentiers, Bordeaux", code: "33063", zoom: 15 }, center: [-0.5705, 44.8378], zoom: 15 },
  { id: "commune-bordeaux", type: "Commune", label: "Bordeaux", description: "Gironde · 33063", context: { scale: "commune", label: "Bordeaux", code: "33063", zoom: 12 }, center: [-0.5792, 44.8378], zoom: 12 },
  { id: "commune-montpellier", type: "Commune", label: "Montpellier", description: "Hérault · 34172", context: { scale: "commune", label: "Montpellier", code: "34172", zoom: 12 }, center: [3.8767, 43.6108], zoom: 12 },
  { id: "commune-strasbourg", type: "Commune", label: "Strasbourg", description: "Bas-Rhin · territoire non couvert", context: { scale: "commune", label: "Strasbourg", code: "67482", zoom: 12 }, center: [7.7521, 48.5734], zoom: 12 },
  { id: "parcelle-bordeaux", type: "Parcelle cadastrale", label: "33063 AB 0124", description: "Bordeaux", context: { scale: "parcelle", label: "Parcelle AB 0124", code: "33063AB0124", sectionCode: "33063000AB", sectionLabel: "Section AB", selectedParcel: "33063AB0124", zoom: 17 }, center: [-0.5705, 44.8378], zoom: 17 },
];

function Filters({ onSearchSelect, onResultStateChange, sidebarCollapsed }: { onSearchSelect: (suggestion: SearchSuggestion) => void; onResultStateChange: (state: PrototypeResultState) => void; sidebarCollapsed: boolean }) {
  const [parcelOpen, setParcelOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [department, setDepartment] = useState("");
  const [commune, setCommune] = useState("");
  const [section, setSection] = useState("");
  const [parcel, setParcel] = useState("");
  const parcelFieldClass = "dvf-select mt-1 h-9 w-full rounded border border-[#E5E5E5] bg-white pl-2 text-[12px] text-[#161616] outline-none disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-[#929292] focus:border-[#000091] focus:outline focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#000091]";
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const isLoading = normalizedQuery === "chargement";
  const hasError = normalizedQuery === "erreur";
  const filteredSuggestions = normalizedQuery.length < 2 || isLoading || hasError ? [] : searchSuggestions.filter((suggestion) => `${suggestion.label} ${suggestion.description} ${suggestion.type}`.toLocaleLowerCase("fr").includes(normalizedQuery));

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label);
    setSearchOpen(false);
    onResultStateChange(suggestion.type === "Adresse" ? "address" : suggestion.id === "commune-strasbourg" ? "uncovered" : "ready");
    onSearchSelect(suggestion);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setSearchOpen(true);
    setActiveSuggestion(0);
    const normalized = value.trim().toLocaleLowerCase("fr");
    if (normalized === "chargement") onResultStateChange("loading");
    else if (normalized === "erreur") onResultStateChange("error");
    else if (normalized === "aucun résultat") onResultStateChange("empty");
  };

  return (
    <div className={`absolute top-5 z-10 w-[440px] max-w-[calc(100%-6rem)] rounded border border-[#E5E5E5] bg-white p-2 shadow-[0_2px_4px_rgba(0,0,0,.08),0_4px_12px_rgba(0,0,0,.08)] transition-[left] duration-300 motion-reduce:transition-none ${sidebarCollapsed ? "left-16" : "left-5"}`}>
      <div className="relative"><label className="flex h-9 items-center gap-2 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-[#000091]"><RiSearchLine aria-hidden className="h-4 w-4 shrink-0 text-[#3a3a3a]" /><span className="sr-only">Rechercher une adresse, une ville ou une parcelle</span><input role="combobox" aria-expanded={searchOpen && normalizedQuery.length >= 2} aria-controls="dvf-search-suggestions" aria-activedescendant={filteredSuggestions[activeSuggestion] ? `dvf-suggestion-${filteredSuggestions[activeSuggestion].id}` : undefined} value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => updateQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "ArrowDown" && filteredSuggestions.length) { event.preventDefault(); setActiveSuggestion((current) => (current + 1) % filteredSuggestions.length); } else if (event.key === "ArrowUp" && filteredSuggestions.length) { event.preventDefault(); setActiveSuggestion((current) => (current - 1 + filteredSuggestions.length) % filteredSuggestions.length); } else if (event.key === "Enter" && filteredSuggestions[activeSuggestion]) { event.preventDefault(); selectSuggestion(filteredSuggestions[activeSuggestion]); } else if (event.key === "Escape") { setSearchOpen(false); } }} className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#666666]" placeholder="Rechercher une adresse, une ville, une parcelle" /></label>
      {searchOpen && normalizedQuery.length >= 2 ? <div id="dvf-search-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-20 max-h-72 overflow-y-auto border border-t-0 border-[#E5E5E5] bg-white shadow-[0_4px_12px_rgba(0,0,0,.12)]">{isLoading ? <p className="p-4 text-[13px] text-[#666666]" role="status">Recherche en cours…</p> : hasError ? <div className="p-4"><p className="text-[13px] font-medium">La recherche n’a pas pu aboutir.</p><button type="button" onClick={() => setQuery("Bordeaux")} className="mt-2 text-[13px] font-medium text-[#000091] underline underline-offset-2">Réessayer</button></div> : filteredSuggestions.length ? filteredSuggestions.map((suggestion, index) => <button key={suggestion.id} id={`dvf-suggestion-${suggestion.id}`} role="option" aria-selected={index === activeSuggestion} type="button" onMouseEnter={() => setActiveSuggestion(index)} onClick={() => selectSuggestion(suggestion)} className={`flex w-full items-start justify-between gap-4 border-b border-[#E5E5E5] px-4 py-3 text-left last:border-b-0 ${index === activeSuggestion ? "bg-[#ececfe]" : "bg-white hover:bg-[#f6f6f6]"}`}><span><strong className="block text-[13px] font-medium">{suggestion.label}</strong><span className="mt-0.5 block text-[12px] text-[#666666]">{suggestion.description}</span></span><span className="shrink-0 bg-[#f6f6f6] px-1.5 py-0.5 text-[11px] text-[#3a3a3a]">{suggestion.type}</span></button>) : <div className="p-4"><p className="text-[13px] font-medium">Aucun résultat trouvé</p><p className="mt-1 text-[12px] leading-5 text-[#666666]">Vérifiez l’adresse ou utilisez la recherche avancée pour saisir une référence cadastrale.</p></div>}</div> : null}</div>
      <button type="button" aria-expanded={parcelOpen} onClick={()=>setParcelOpen(!parcelOpen)} className="mt-1 flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] font-medium text-[#666666] hover:bg-[#eeeeee] hover:text-[#161616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]"><span>Recherche avancée</span><RiArrowDownSLine className={`h-4 w-4 shrink-0 transition-transform ${parcelOpen ? "rotate-180" : ""}`} /></button>
      {parcelOpen ? <div className="max-h-[calc(100dvh-240px)] space-y-3 overflow-y-auto border-t border-[#E5E5E5] bg-[#f6f6f6] p-4 text-[12px]">
        <label className="block font-medium">Identifiant complet de la parcelle<input className="mt-1 h-9 w-full rounded border border-[#E5E5E5] bg-white px-2 text-[12px] text-[#161616] outline-none focus:border-[#000091] focus:outline focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#000091]" placeholder="Ex. : 23150000A0001" /></label>
        <p className="font-bold text-[#3a3a3a]">Ou composez-le pas à pas</p>
        <label className="block font-medium">Département<span className="relative block"><select value={department} onChange={(event) => { setDepartment(event.target.value); setCommune(""); setSection(""); setParcel(""); }} className={parcelFieldClass}><option value="">Sélectionner un département</option>{departments.map((value) => <option value={value.slice(0, 2)} key={value}>{value}</option>)}</select><RiArrowDownSLine aria-hidden className="pointer-events-none absolute right-2.5 top-[calc(50%+2px)] h-5 w-5 -translate-y-1/2 text-[#161616]" /></span></label>
        <label className="block font-medium">Commune<span className="relative block"><select disabled={!department} value={commune} onChange={(event) => { setCommune(event.target.value); setSection(""); setParcel(""); }} className={parcelFieldClass}><option value="">Sélectionner une commune</option><option value="achery">Achery (02002)</option><option value="montpellier">Montpellier (34172)</option><option value="paris">Paris (75056)</option></select><RiArrowDownSLine aria-hidden className={`pointer-events-none absolute right-2.5 top-[calc(50%+2px)] h-5 w-5 -translate-y-1/2 ${department ? "text-[#161616]" : "text-[#929292]"}`} /></span></label>
        <label className="block font-medium">Section cadastrale<span className="relative block"><select disabled={!commune} value={section} onChange={(event) => { setSection(event.target.value); setParcel(""); }} className={parcelFieldClass}><option value="">Sélectionner une section</option><option value="000AC">000AC</option><option value="HX">HX</option><option value="AT">AT</option></select><RiArrowDownSLine aria-hidden className={`pointer-events-none absolute right-2.5 top-[calc(50%+2px)] h-5 w-5 -translate-y-1/2 ${commune ? "text-[#161616]" : "text-[#929292]"}`} /></span></label>
        <label className="block font-medium">Parcelle{section ? " (307 trouvées)" : ""}<span className="relative block"><select disabled={!section} value={parcel} onChange={(event) => setParcel(event.target.value)} className={parcelFieldClass}><option value="">Sélectionner une parcelle</option><option value="02002000AC0005">02002000AC0005</option><option value="02002000AC0006">02002000AC0006</option><option value="02002000AC0007">02002000AC0007</option></select><RiArrowDownSLine aria-hidden className={`pointer-events-none absolute right-2.5 top-[calc(50%+2px)] h-5 w-5 -translate-y-1/2 ${section ? "text-[#161616]" : "text-[#929292]"}`} /></span></label>
        {parcel ? <p className="rounded bg-[#E3FDEB] p-2 text-[12px] leading-4 text-[#18753C]">Parcelle sélectionnée : {parcel}</p> : null}
      </div> : null}
    </div>
  );
}

export function DvfAboutContent() {
  return (
    <section className="mx-auto max-w-[1050px] px-5 py-10">
      <h2 className="text-[24px] font-bold">À propos</h2>
      <div className="mt-4 max-w-[850px] space-y-3 text-[15px] leading-7 text-[#3a3a3a]">
        <p>Cette application de data.gouv.fr permet de consulter les demandes de valeurs foncières publiées par la Direction générale des Finances publiques.</p>
        <p>Issues des actes notariés et des informations cadastrales, ces données décrivent les ventes immobilières des cinq dernières années en métropole et dans les territoires ultramarins, à l’exception de l’Alsace, de la Moselle et de Mayotte.</p>
        <p>Les données brutes peuvent être téléchargées et réutilisées selon les conditions indiquées sur <a className={aboutLinkClass} href="https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/" target="_blank" rel="noreferrer">la page du jeu de données</a>.</p>
      </div>

      <h3 className="mt-12 text-[20px] font-bold">Questions fréquentes</h3>
      <div className="mt-4 border-t border-[#E5E5E5]">{faqs.map(({ question, answer })=><details key={question} className="group border-b border-[#E5E5E5]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]">{question}<RiArrowDownSLine className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" /></summary><div className="max-w-[850px] pb-5 text-[14px] leading-6 text-[#3a3a3a]">{answer}</div></details>)}</div>

      <h3 className="mt-14 text-[20px] font-bold">Jeux de données utilisés</h3>
      <p className="mt-3 max-w-[780px] text-[15px] leading-7 text-[#3a3a3a]">Toutes les données qui alimentent l’application sont disponibles en open data sur data.gouv.fr.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{sourceDatasets.map(([title, producer, href]) => <a key={title} href={href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 border border-[#E5E5E5] bg-white p-4 hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091] sm:min-h-24"><span><strong className="block text-[14px] leading-5 text-[#161616]">{title}</strong><span className="mt-2 block text-[12px] leading-5 text-[#666666]">Par {producer}</span></span><RiExternalLinkLine aria-hidden className="h-4 w-4 shrink-0 text-[#000091]" /></a>)}</div>

      <h3 className="mt-12 text-[20px] font-bold">Applications recommandées</h3>
      <p className="mt-3 max-w-[780px] text-[15px] leading-7 text-[#3a3a3a]">Pour aller plus loin, consultez ces applications du service public.</p>
      <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">{recommendedApplications.map(([title, producer, label, href]) => <a key={title} href={href} target="_blank" rel="noreferrer" className="group flex items-start justify-between gap-4 border-b border-[#E5E5E5] py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]"><span><strong className="block text-[14px] leading-5 text-[#161616]">{title} <span className="font-normal text-[#666666]">par {producer}</span></strong><span className="mt-1 block text-[12px] text-[#000091] underline underline-offset-2">{label}</span></span><RiExternalLinkLine aria-hidden className="h-4 w-4 shrink-0 text-[#000091]" /></a>)}</div>

      <h3 className="mt-12 text-[20px] font-bold">Code source</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#3a3a3a]">Le code de l’application est publié sur GitHub.</p>
      <a href="https://github.com/etalab/explore.data.gouv.fr" target="_blank" rel="noreferrer" className={`mt-3 inline-flex items-center gap-2 text-[14px] ${aboutLinkClass}`}>Code source d’Explore data.gouv.fr<RiExternalLinkLine aria-hidden className="h-4 w-4" /></a>
    </section>
  );
}

export function DvfExplorer({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<View>("carte");
  const [mapContext, setMapContext] = useState<DvfMapContext>(initialDvfMapContext);
  const [propertyType, setPropertyType] = useState<PropertyType>("all");
  const [mapResetKey, setMapResetKey] = useState(0);
  const [navigationTarget, setNavigationTarget] = useState<DvfMapNavigationTarget | null>(null);
  const [resultState, setResultState] = useState<PrototypeResultState>("ready");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const selectionLabel = mapContext.selectedParcel ? `Parcelle ${mapContext.selectedParcel}` : mapContext.label;
  const propertyTypeLabel = propertyType === "all" ? "Appartements et maisons" : propertyType === "apartments" ? "Appartements" : propertyType === "houses" ? "Maisons" : "Locaux commerciaux";
  const resultCount = mapContext.selectedParcel ? 2 : mapContext.scale === "national" ? propertyType === "all" ? 4_268_935 : propertyType === "apartments" ? 2_337_142 : propertyType === "houses" ? 1_931_793 : 223_606 : Math.max(24, ((mapContext.code ?? mapContext.label).length * 137) % 1850);

  const resetSelection = () => {
    setMapContext(initialDvfMapContext);
    setPropertyType("all");
    setNavigationTarget(null);
    setMapResetKey((current) => current + 1);
  };

  const selectSearchSuggestion = (suggestion: SearchSuggestion) => {
    const target = { context: suggestion.context, center: suggestion.center, zoom: suggestion.zoom, requestId: Date.now() };
    setMapContext(suggestion.context);
    setNavigationTarget(target);
    if (suggestion.context.selectedParcel) setSidebarCollapsed(false);
    setMobilePanelOpen(suggestion.type === "Adresse" || Boolean(suggestion.context.selectedParcel) || suggestion.id === "commune-strasbourg");
  };

  const changeResultState = (state: PrototypeResultState) => {
    setResultState(state);
    if (state !== "ready") setMobilePanelOpen(true);
  };

  const openLocatedParcel = () => {
    const context: DvfMapContext = { scale: "parcelle", label: "Parcelle AB 0124", code: "33063AB0124", sectionCode: "33063000AB", sectionLabel: "Section AB", selectedParcel: "33063AB0124", zoom: 17 };
    setMapContext(context);
    setNavigationTarget({ context, center: [-0.5705, 44.8378], zoom: 17, requestId: Date.now() });
    setResultState("ready");
    setSidebarCollapsed(false);
    setMobilePanelOpen(true);
  };

  const resetResultState = () => {
    setResultState("ready");
    setMobilePanelOpen(false);
  };

  const navigateFromBreadcrumb = (target: BreadcrumbTarget) => {
    const targetContext: DvfMapContext = target === "national"
      ? initialDvfMapContext
      : target === "departement"
        ? { scale: "departement", label: mapContext.code?.startsWith("34") ? "Hérault" : "Gironde", code: mapContext.code?.startsWith("34") ? "34" : "33", zoom: 8 }
        : target === "commune"
          ? { scale: "commune", label: mapContext.code?.startsWith("34") ? "Montpellier" : "Bordeaux", code: mapContext.code?.startsWith("34") ? "34172" : "33063", zoom: 12 }
          : { scale: "parcelle", label: mapContext.sectionLabel ?? "Section cadastrale", code: mapContext.sectionCode, sectionCode: mapContext.sectionCode, sectionLabel: mapContext.sectionLabel, zoom: 15 };
    const center: [number, number] = target === "national" ? [2.4, 46.6] : mapContext.code?.startsWith("34") ? [3.8767, 43.6108] : [-0.5792, 44.8378];
    const zoom = target === "national" ? 5 : target === "departement" ? 8 : target === "commune" ? 12 : 15;
    setMapContext(targetContext);
    setNavigationTarget({ context: targetContext, center, zoom, requestId: Date.now() });
  };

  return (
    <main className={`${embedded ? "min-h-0" : "min-h-dvh"} bg-white text-[#161616]`}>
      {!embedded ? <header className="flex min-h-[108px] items-center justify-between gap-8 border-b border-[#E5E5E5] px-5 py-4 shadow-[0_2px_4px_rgba(0,0,0,.06)] max-md:flex-col max-md:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[25px] font-extrabold leading-8">Explorateur de données de valeurs foncières</h1>
            <span className="bg-[#e8edff] px-1.5 py-0.5 text-[11px] font-bold text-[#000091]">BETA</span>
          </div>
          <p className="mt-1 text-[14px] leading-6 text-[#3a3a3a]">Consultez les ventes immobilières enregistrées au cours des cinq dernières années.</p>
          <p className="text-[12px] leading-5 text-[#666666]">Ce service ne fournit pas d’estimation immobilière.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3 max-md:items-start">
          <div className="flex items-center gap-5">
            <button type="button" aria-current={view === "apropos" ? "page" : undefined} onClick={() => setView("apropos")} className={`flex items-center gap-2 text-[13px] font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091] ${view === "apropos" ? "text-[#000091] underline" : ""}`}><RiInformationLine className="h-4 w-4" /> À propos</button>
            <a href="#" className="flex items-center gap-2 text-[13px] font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]"><RiLightbulbLine className="h-4 w-4" /> Donnez-nous votre avis</a>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#f6f6f6] px-2 py-1 text-[12px] font-medium text-[#3a3a3a]">Données publiées en avril 2026 · Ventes de 2021 à 2025 <InfoTooltip align="right" id="data-coverage-help" text="Les données sont publiées par la DGFiP et mises à jour deux fois par an. Une vente récente peut apparaître avec un décalage dans le service." /></span>
        </div>
      </header> : null}
      <nav className={`${embedded ? "sticky top-0 z-30 bg-white" : ""} flex border-b border-[#E5E5E5] px-3 py-3 sm:px-5`} aria-label="Vues de l’explorateur">
        <div className="inline-flex w-full divide-x divide-[#E5E5E5] border border-[#E5E5E5] bg-white sm:w-auto">
          {tabs.map(tab=>{const Icon=tab.icon;return <button type="button" aria-pressed={view===tab.id} key={tab.id} onClick={()=>setView(tab.id)} className={`flex h-9 min-w-0 flex-1 items-center justify-center gap-2 px-4 text-[14px] font-medium sm:min-w-[132px] sm:flex-none focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091] ${view===tab.id ? "bg-[#000091] text-white" : "bg-white text-[#161616] hover:bg-[#eeeeee]"}`}><Icon className="h-4 w-4" />{tab.label}</button>})}
        </div>
      </nav>

      {view === "tableau" ? <section aria-label="Sélection active" className="flex min-h-12 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[#E5E5E5] bg-[#f6f6f6] px-5 py-2 text-[13px]"><div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><strong className="text-[#161616]">Sélection : {selectionLabel}</strong><span aria-hidden="true" className="text-[#929292]">·</span><span>{resultCount.toLocaleString("fr-FR")} ventes</span><span aria-hidden="true" className="text-[#929292]">·</span><span>2021–2025</span><span aria-hidden="true" className="text-[#929292]">·</span><span>{propertyTypeLabel}</span></div><button type="button" onClick={resetSelection} disabled={mapContext.scale === "national" && propertyType === "all"} className="shrink-0 font-medium text-[#000091] underline underline-offset-2 disabled:cursor-not-allowed disabled:text-[#929292] disabled:no-underline">Réinitialiser</button></section> : null}

      {view === "carte" ? <section className={`dvf-map-shell flex ${embedded ? "h-[70dvh] min-h-[520px] sm:h-[min(760px,calc(100dvh-7rem))] sm:min-h-[610px]" : "h-[calc(100dvh-169px)] min-h-[610px]"}`}>
        <div className={`t-resize shrink-0 overflow-hidden ${sidebarCollapsed ? "w-0" : "w-[400px]"} ${mobilePanelOpen && (resultState !== "ready" || Boolean(mapContext.selectedParcel)) ? "max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:w-full" : "max-lg:hidden"}`}>
          <StatPanel context={mapContext} propertyType={propertyType} onPropertyTypeChange={setPropertyType} onBreadcrumbNavigate={navigateFromBreadcrumb} resultState={resultState} onRetry={resetResultState} onOpenParcel={openLocatedParcel} onCloseMobile={() => setMobilePanelOpen(false)} onCollapse={() => setSidebarCollapsed(true)} />
        </div>
        {sidebarCollapsed ? <button type="button" onClick={() => setSidebarCollapsed(false)} aria-expanded="false" aria-label="Afficher le panneau d’informations" className="dvf-desktop-sidebar-toggle absolute left-3 top-5 z-30 h-9 w-9 items-center justify-center rounded border border-[#E5E5E5] bg-white shadow"><RiSidebarUnfoldLine className="h-5 w-5" /></button> : null}
        <div className="relative min-w-0 flex-1"><FranceMap key={mapResetKey} context={mapContext} navigationTarget={navigationTarget} onContextChange={(context) => { setMapContext(context); if (context.selectedParcel) { setResultState("ready"); setSidebarCollapsed(false); setMobilePanelOpen(true); } }} /><Filters onSearchSelect={selectSearchSuggestion} onResultStateChange={changeResultState} sidebarCollapsed={sidebarCollapsed} /></div>
      </section> : null}

      {view === "tableau" ? (
        <section className="min-h-[610px] px-5 py-6">
          <ExplorerPrototype
            embedded
            showResourceNavigation={false}
            contentViewsOnly
            showEmbeddedHeader={false}
            showEmbeddedResourceContext={false}
            showEmbeddedFullscreen={false}
            datasetReference="demandes-de-valeurs-foncieres"
            datasetResources={dvfResources}
            initialResourceId="dvf-2025"
            returnTo={embedded ? "/prototypes/explorateur-dvf-in-a-page" : "/prototypes/explorateur-dvf"}
          />
          <div className="mt-4 flex justify-end">
            <a href="https://www.data.gouv.fr/datasets/demandes-de-valeurs-foncieres" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 bg-[#000091] px-4 text-[14px] font-medium text-white hover:bg-[#1212ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]">
              <RiDownloadLine aria-hidden="true" className="h-4 w-4" />
              Télécharger les données
            </a>
          </div>
        </section>
      ) : null}

      {view === "apropos" && !embedded ? <DvfAboutContent /> : null}

    </main>
  );
}

export default function ExplorateurDvfPage() {
  return <DvfExplorer />;
}
