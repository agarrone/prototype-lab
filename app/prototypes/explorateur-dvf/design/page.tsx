"use client";

import { useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiAlertLine,
  RiAddLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiDownloadLine,
  RiEarthLine,
  RiFocus3Line,
  RiHome4Line,
  RiInformationLine,
  RiLoader4Line,
  RiMap2Line,
  RiMapPin2Line,
  RiPaletteLine,
  RiQuestionLine,
  RiRefreshLine,
  RiSearchLine,
  RiSidebarFoldLine,
  RiSubtractLine,
  RiRulerLine,
  RiCheckboxCircleLine,
  RiTableLine,
  RiEqualizer2Line,
  RiCloseLine,
} from "@remixicon/react";
import DvfChart from "../dvf-chart";

const scales = [
  {
    level: "France",
    eyebrow: "Vue nationale",
    title: "Bonjour ! Bienvenue",
    description:
      "Suivez l’évolution des prix de l’immobilier et trouvez le prix des ventes immobilières sur les 5 dernières années.",
    sales: "4 492 541",
    price: "2 576 €",
    apartmentSales: "2 002 336",
    houseSales: "2 490 205",
    apartmentPrice: "3 342 €",
    housePrice: "2 122 €",
  },
  {
    level: "Département",
    eyebrow: "Gironde · 33",
    title: "Gironde",
    description:
      "Consultez les ventes et l’évolution des prix observés dans le département.",
    sales: "162 483",
    price: "3 418 €",
    apartmentSales: "67 904",
    houseSales: "94 579",
    apartmentPrice: "4 126 €",
    housePrice: "2 984 €",
  },
  {
    level: "Commune",
    eyebrow: "Bordeaux · 33063",
    title: "Bordeaux",
    description:
      "Analysez les transactions enregistrées dans la commune et leurs caractéristiques.",
    sales: "28 742",
    price: "4 788 €",
    apartmentSales: "24 156",
    houseSales: "4 586",
    apartmentPrice: "4 912 €",
    housePrice: "4 231 €",
  },
  {
    level: "Parcelle cadastrale",
    eyebrow: "Bordeaux · Section HX · Parcelle 82",
    title: "12 rue des Argentiers",
    description:
      "Consultez les caractéristiques cadastrales de la parcelle et les mutations qui y ont été enregistrées.",
    sales: "2 mutations",
    price: "5 214 €",
    apartmentSales: "82 m²",
    houseSales: "202 m²",
    apartmentPrice: "Appartement",
    housePrice: "Bâti",
    parcelId: "33063000HX0082",
    lastSaleDate: "18 novembre 2024",
    lastSalePrice: "428 000 €",
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[12px] font-medium uppercase tracking-[.04em] text-[#666666]">
      {children}
    </p>
  );
}

type TransactionCardProps = {
  nature: "Vente" | "Échange";
  price?: string;
  date: string;
  address: string;
  lots: { label: string; rooms?: string; surface?: string }[];
  notice?: string;
  muted?: boolean;
};

function TransactionCard({ nature, price, date, address, lots, notice, muted }: TransactionCardProps) {
  return (
    <article className={`overflow-hidden rounded border border-[#E5E5E5] ${muted ? "bg-[#f6f6f6]" : "bg-white"}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-sm bg-[#eeeeee] px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[.04em] text-[#3a3a3a]">{nature}</span>
            <p className="mt-2 flex items-center gap-1 text-[12px] text-[#666666]"><RiCalendarLine className="h-3.5 w-3.5" />{date}</p>
          </div>
          <p className={`text-right text-[19px] font-bold ${price ? "text-[#000091]" : "text-[#666666]"}`}>{price ?? "Montant non disponible"}</p>
        </div>
        <p className="mt-2 flex items-start gap-1 text-[12px] leading-4 text-[#666666]"><RiMapPin2Line className="mt-0.5 h-3.5 w-3.5 shrink-0" />{address}</p>

        <p className="mt-4 text-[13px] font-bold">{lots.length} lot{lots.length > 1 ? "s" : ""}</p>
        <dl className="mt-2 divide-y divide-[#E5E5E5] text-[12px]">
          {lots.map((lot, index) => <div key={`${lot.label}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2"><dt className="font-medium text-[#3a3a3a]">{lot.label}</dt><dd className="min-w-14 text-right text-[#666666]">{lot.rooms ?? "—"}</dd><dd className="inline-flex min-w-14 items-center justify-end gap-1 text-[#3a3a3a]"><RiRulerLine className="h-3.5 w-3.5 text-[#666666]" />{lot.surface ?? "—"}</dd></div>)}
        </dl>
      </div>
      {notice ? <p className="flex gap-2 border-t border-[#E5E5E5] bg-[#f6f6f6] p-3 text-[12px] leading-5 text-[#3a3a3a]"><RiAlertLine className="mt-0.5 h-4 w-4 shrink-0 text-[#B34000]" />{notice}</p> : null}
    </article>
  );
}

function CompactTransactionConcept() {
  return (
    <article className="relative border border-[#E5E5E5] bg-white px-4 pb-4 pt-5">
      <span className="absolute -top-3 left-4 bg-white px-1.5 text-[11px] font-medium uppercase tracking-[.04em] text-[#3a3a3a]">Vente</span>
      <p className="text-[20px] font-bold">428 000 €</p>
      <div className="mt-1 space-y-1 text-[12px] leading-4 text-[#666666]">
        <p className="flex items-center gap-1"><RiMapPin2Line className="h-3.5 w-3.5" />12 rue des Argentiers, Bordeaux</p>
        <p>Référence de la transaction : 2024-1223497</p>
        <p className="flex items-center gap-1"><RiCalendarLine className="h-3.5 w-3.5" />18 novembre 2024</p>
      </div>
      <dl className="mt-4 space-y-2 text-[12px]">
        <div className="flex items-end gap-2"><dt className="shrink-0 font-medium">Appartement · 4 pièces</dt><span className="mb-1 min-w-3 flex-1 border-b border-[#E5E5E5]" /><dd className="font-bold">82 m²</dd></div>
        <div className="flex items-end gap-2"><dt className="shrink-0 font-medium">Dépendance</dt><span className="mb-1 min-w-3 flex-1 border-b border-[#E5E5E5]" /><dd className="text-[#666666]">Non renseigné</dd></div>
      </dl>
    </article>
  );
}

function AmountFirstTransactionConcept() {
  return (
    <article className="overflow-hidden rounded border border-[#E5E5E5] bg-white">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4"><span className="rounded-sm bg-[#eeeeee] px-1.5 py-0.5 text-[11px] font-medium uppercase">Vente</span><p className="text-[21px] font-bold text-[#000091]">428 000 €</p></div>
        <p className="mt-2 text-right text-[12px] font-medium text-[#3a3a3a]">5 214 € par m²</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[#666666]"><span className="inline-flex items-center gap-1"><RiCalendarLine className="h-3.5 w-3.5" />18 novembre 2024</span><span className="inline-flex items-center gap-1"><RiMapPin2Line className="h-3.5 w-3.5" />12 rue des Argentiers</span></div>
        <dl className="mt-4 divide-y divide-[#E5E5E5] border-t border-[#E5E5E5] text-[12px]"><div className="grid grid-cols-[1fr_auto_auto] gap-3 py-2"><dt className="font-medium">Appartement</dt><dd>4 pièces</dd><dd className="font-medium">82 m²</dd></div><div className="grid grid-cols-[1fr_auto] gap-3 py-2"><dt className="font-medium">Dépendance</dt><dd className="text-[#666666]">Non renseigné</dd></div></dl>
      </div>
    </article>
  );
}

function StructuredTransactionConcept({ nature = "Vente", price = "428 000 €", pricePerSquareMeter = "5 214 €", date = "18 novembre 2024", address = "12 rue des Argentiers, 33000 Bordeaux", mutationId = "2024-1223497", lots = [
    { label: "Appartement", rooms: "4 pièces", surface: "82 m²", icon: RiBuilding2Line },
    { label: "Dépendance", rooms: "Non renseigné", surface: "Non renseignée", icon: RiHome4Line },
  ], notice, muted = false }: {
    nature?: "Vente" | "Échange";
    price?: string;
    pricePerSquareMeter?: string;
    date?: string;
    address?: string;
    mutationId?: string;
    lots?: { label: string; rooms?: string; surface?: string; icon?: typeof RiHome4Line }[];
    notice?: string;
    muted?: boolean;
  } = {}) {

  return (
    <article className={`overflow-hidden rounded border border-[#E5E5E5] ${muted ? "bg-[#f6f6f6]" : "bg-white"}`}>
      <header className="flex items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-3 py-2"><span className="text-[12px] font-medium uppercase">{nature}</span><span className="inline-flex items-center gap-1 text-[12px] text-[#666666]"><RiCalendarLine aria-hidden className="h-3.5 w-3.5" />{date}</span></header>
      <div className="p-4">
        <p className={`text-[20px] font-bold ${price ? "" : "text-[#666666]"}`}>{price || "Montant non disponible"}</p>
        {pricePerSquareMeter ? <p className="mt-1 text-[13px] font-medium text-[#000091]">{pricePerSquareMeter} par m²</p> : null}
        <p className="mt-3 flex items-start gap-1 text-[12px] text-[#666666]"><RiMapPin2Line className="mt-0.5 h-3.5 w-3.5 shrink-0" />{address}</p>
        <div className="mt-4">
          <p className="mb-2 text-[12px] font-bold">{`${lots.length} ${lots.length > 1 ? "lots" : "lot"}`}</p>
          <div className="overflow-hidden border-y border-[#E5E5E5]">
            <table className="w-full table-fixed text-left text-[12px]">
              <thead className="sr-only"><tr><th>Type de lot</th><th>Pièces</th><th>Surface</th></tr></thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {lots.map((lot) => {
                  return <tr key={lot.label}>
                    <th scope="row" className="w-[43%] py-2 pr-2 font-medium">{lot.label}</th>
                    <td className="w-[29%] px-1 py-2 text-[#666666]">{lot.rooms ?? "Non renseigné"}</td>
                    <td className="w-[28%] py-2 pl-1 text-right font-medium text-[#3a3a3a]">{lot.surface ?? "Non renseignée"}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-[#666666]">Référence de la transaction : {mutationId}</p>
      </div>
      {notice ? <p className="flex gap-2 border-t border-[#E5E5E5] bg-[#f6f6f6] p-3 text-[12px] leading-5 text-[#3a3a3a]"><RiAlertLine className="mt-0.5 h-4 w-4 shrink-0 text-[#B34000]" />{notice}</p> : null}
    </article>
  );
}

function ResultStatePreview({ type }: { type: "loading" | "empty" | "error" | "uncovered" | "partial" }) {
  if (type === "loading") return <div className="flex min-h-40 flex-col items-center justify-center border border-[#E5E5E5] bg-white p-6 text-center"><RiLoader4Line aria-hidden className="h-6 w-6 text-[#000091]" /><p className="mt-3 text-[15px] font-bold">Chargement des résultats</p><p className="mt-1 text-[12px] leading-5 text-[#666666]">La nouvelle sélection est en cours d’analyse. Les résultats précédents sont temporairement masqués.</p></div>;
  if (type === "empty") return <div className="min-h-40 border border-[#E5E5E5] bg-white p-5"><p className="text-[15px] font-bold">Aucune vente trouvée</p><p className="mt-2 text-[12px] leading-5 text-[#666666]">Aucune vente ne correspond à cette sélection entre 2021 et 2025. Une vente récente peut ne pas encore avoir été publiée, ou certains filtres peuvent exclure les résultats disponibles.</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2"><button type="button" className="text-[13px] font-medium text-[#000091] underline underline-offset-2">Réinitialiser les filtres</button><button type="button" className="text-[13px] font-medium text-[#000091] underline underline-offset-2">Comprendre les limites des données</button></div></div>;
  if (type === "error") return <div className="min-h-40 border border-[#E5E5E5] bg-white p-5"><div className="flex items-start gap-2"><RiAlertLine aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#E1000F]" /><div><p className="text-[15px] font-bold">Impossible de charger les ventes</p><p className="mt-1 text-[12px] leading-5 text-[#666666]">Un problème technique est survenu. La sélection reste conservée.</p></div></div><button type="button" className="mt-4 inline-flex h-9 items-center gap-2 bg-[#000091] px-3 text-[13px] font-medium text-white"><RiRefreshLine aria-hidden className="h-4 w-4" />Réessayer</button></div>;
  if (type === "uncovered") return <div className="min-h-40 border border-[#E5E5E5] bg-white p-5"><div className="flex items-start gap-2"><RiMapPin2Line aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#666666]" /><div><p className="text-[15px] font-bold">Territoire non couvert</p><p className="mt-1 text-[12px] leading-5 text-[#666666]">Les données DVF ne sont pas disponibles pour le Bas-Rhin, le Haut-Rhin, la Moselle et Mayotte.</p></div></div><button type="button" className="mt-4 text-[13px] font-medium text-[#000091] underline underline-offset-2">Choisir un autre territoire</button></div>;
  return <div className="min-h-40 border border-[#E5E5E5] bg-white p-5"><div className="flex items-start gap-2"><RiInformationLine aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#000091]" /><div><p className="text-[15px] font-bold">Certaines informations sont indisponibles</p><p className="mt-1 text-[12px] leading-5 text-[#666666]">La vente est bien enregistrée, mais son montant ou certaines caractéristiques des lots ne sont pas présents dans la source.</p></div></div><p className="mt-4 text-[12px] font-medium">La transaction reste affichée avec la mention « Non renseigné ».</p></div>;
}

function ParcelSearchPrototype() {
  const [department, setDepartment] = useState("");
  const [commune, setCommune] = useState("");
  const [section, setSection] = useState("");
  const [parcel, setParcel] = useState("");
  const fieldClass = "mt-1 h-10 w-full rounded border border-[#E5E5E5] bg-white px-3 text-[13px] text-[#161616] outline-none disabled:cursor-not-allowed disabled:bg-[#eeeeee] disabled:text-[#929292] focus:border-[#000091] focus:outline focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#000091]";

  return (
    <article className="w-full max-w-[400px] overflow-hidden border border-[#E5E5E5] bg-white">
      <header className="flex h-9 items-center justify-between border-b border-[#E5E5E5] px-4 text-[#666666]"><h3 className="text-[12px] font-medium">Recherche avancée</h3><RiArrowDownSLine className="h-4 w-4 rotate-180" /></header>
      <div className="space-y-4 p-4">
        <label className="block text-[12px] font-medium">Identifiant complet de la parcelle<input className={fieldClass} placeholder="Ex. : 23150000A0001" /></label>
        <p className="text-[12px] font-bold text-[#3a3a3a]">Ou composez-le pas à pas</p>
        <label className="block text-[12px] font-medium">Département<select value={department} onChange={(event) => { setDepartment(event.target.value); setCommune(""); setSection(""); setParcel(""); }} className={fieldClass}><option value="">Sélectionner un département</option><option value="02">02 - Aisne</option><option value="34">34 - Hérault</option><option value="75">75 - Paris</option></select></label>
        <label className="block text-[12px] font-medium">Commune<select disabled={!department} value={commune} onChange={(event) => { setCommune(event.target.value); setSection(""); setParcel(""); }} className={fieldClass}><option value="">Sélectionner une commune</option><option value="achery">Achery (02002)</option><option value="montpellier">Montpellier (34172)</option><option value="paris">Paris (75056)</option></select></label>
        <label className="block text-[12px] font-medium">Section cadastrale<select disabled={!commune} value={section} onChange={(event) => { setSection(event.target.value); setParcel(""); }} className={fieldClass}><option value="">Sélectionner une section</option><option value="000AC">000AC</option><option value="HX">HX</option><option value="AT">AT</option></select></label>
        <label className="block text-[12px] font-medium">Parcelle{section ? " (307 trouvées)" : ""}<select disabled={!section} value={parcel} onChange={(event) => setParcel(event.target.value)} className={fieldClass}><option value="">Sélectionner une parcelle</option><option value="02002000AC0005">02002000AC0005</option><option value="02002000AC0006">02002000AC0006</option><option value="02002000AC0007">02002000AC0007</option></select></label>
        {parcel ? <p className="flex items-start gap-2 rounded bg-[#E3FDEB] p-3 text-[12px] leading-5 text-[#18753C]"><RiCheckboxCircleLine className="mt-0.5 h-4 w-4 shrink-0" />La parcelle {parcel} est sélectionnée. La carte se centre sur son emprise.</p> : null}
      </div>
    </article>
  );
}

function ScaleSidebar({ scale }: { scale: (typeof scales)[number] }) {
  const isParcel = scale.level === "Parcelle cadastrale";
  const [parcelSection, setParcelSection] = useState<"transactions" | "dpe" | "copropriete" | "liens">("transactions");
  const sections = [
    ["transactions", "Transactions"],
    ["dpe", "Diagnostics de performance énergétique (DPE)"],
    ["copropriete", "Informations sur la copropriété"],
    ["liens", "Liens utiles"],
  ] as const;
  const breadcrumbItems = scale.level === "France" ? ["France"] : scale.level === "Département" ? ["France", "Gironde"] : scale.level === "Commune" ? ["France", "Gironde", "Bordeaux"] : ["France", "Gironde", "Bordeaux", "12 rue des Argentiers"];

  return (
    <article className="flex min-h-[760px] w-full flex-col overflow-hidden border border-[#E5E5E5] bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-3"><span className="text-[14px] font-medium">{isParcel ? "Détail de la parcelle" : "Informations sur le territoire"}</span><span className="rounded bg-[#eeeeee] px-2 py-1 text-[12px] text-[#3a3a3a]">{scale.eyebrow}</span></header>
      <div className="flex-1 p-3">
        <nav className="fr-breadcrumb mb-3 text-[11px] leading-5" aria-label="Vous êtes ici :"><ol className="fr-breadcrumb__list flex flex-wrap items-center gap-x-2 gap-y-1">{breadcrumbItems.map((item, index) => <li key={item} className="flex min-w-0 items-center gap-2 before:text-[#929292] before:content-['›'] first:before:hidden">{index < breadcrumbItems.length - 1 ? <button type="button" className="truncate text-[#000091] underline underline-offset-2">{item}</button> : <span aria-current="page" className="truncate text-[#666666]">{item}</span>}</li>)}</ol></nav>
        <h3 className="text-[20px] font-bold leading-7">{scale.title}</h3>
        {isParcel ? <p className="mt-1 text-[12px] leading-5 text-[#666666]">Identifiant : <strong className="font-medium text-[#3a3a3a]">{scale.parcelId}</strong> · Surface cadastrale : <strong className="font-medium text-[#3a3a3a]">{scale.houseSales}</strong></p> : null}
        {isParcel ? <label className="mt-4 block text-[12px] font-medium text-[#3a3a3a]">Informations affichées<span className="relative mt-1 block"><select value={parcelSection} onChange={(event) => setParcelSection(event.target.value as typeof parcelSection)} className="h-10 w-full appearance-none rounded border border-[#E5E5E5] bg-[#f6f6f6] pl-3 pr-10 text-[13px] font-normal">{sections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><RiArrowDownSLine className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2" /></span></label> : <><p className="mt-2 text-[13px] leading-5 text-[#3a3a3a]">{scale.description}</p><label className="mt-4 block text-[12px] font-medium text-[#3a3a3a]">Type de bien<span className="relative mt-1 block"><select className="h-9 w-full appearance-none rounded border border-[#E5E5E5] bg-[#f6f6f6] pl-2 pr-9 text-[13px] font-normal"><option>Appartements et maisons</option></select><RiArrowDownSLine className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2" /></span></label><p className="mt-2 text-[12px] text-[#666666]">Ventes et prix médians observés au cours des 5 dernières années.</p></>}
        {isParcel && parcelSection === "transactions" ? <><p className="mt-2 text-[13px] leading-5 text-[#3a3a3a]">Consultez les ventes enregistrées sur cette parcelle au cours des cinq dernières années.</p><h4 className="mt-5 text-[18px] font-bold">2 transactions</h4><div className="mt-3 space-y-3"><StructuredTransactionConcept /><StructuredTransactionConcept price="352 000 €" pricePerSquareMeter="" date="4 juin 2019" mutationId="2019-0845216" lots={[{ label: "Appartement", rooms: "4 pièces", surface: "82 m²" }]} /></div></> : null}
        {isParcel && parcelSection !== "transactions" ? <div className="mt-5 border-l-4 border-[#000091] bg-[#f6f6f6] p-4 text-[12px] leading-5">Le contenu associé à cette catégorie apparaît ici lorsqu’il est disponible.</div> : null}
        {!isParcel ? <><div className="mt-4 overflow-hidden rounded border border-[#E5E5E5]"><table className="w-full text-right text-[12px]"><thead className="bg-[#f6f6f6]"><tr><th className="border-b border-[#E5E5E5] px-2 py-1 text-left font-medium">Type de bien</th><th className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Ventes</th><th className="border-b border-[#E5E5E5] px-2 py-1 font-medium">Prix médian au m²</th></tr></thead><tbody><tr><th className="border-b border-[#E5E5E5] px-2 py-1 text-left font-normal">Appartements</th><td className="border-b border-[#E5E5E5] px-2 py-1">{scale.apartmentSales}</td><td className="border-b border-[#E5E5E5] px-2 py-1">{scale.apartmentPrice}</td></tr><tr><th className="px-2 py-1 text-left font-normal">Maisons</th><td className="px-2 py-1">{scale.houseSales}</td><td className="px-2 py-1">{scale.housePrice}</td></tr></tbody></table></div><div className="mt-3 rounded border border-[#E5E5E5] p-3"><p className="text-[12px] font-medium">Évolution du prix de vente médian au m²</p><DvfChart variant="line" /></div><div className="mt-3 rounded border border-[#E5E5E5] p-3"><p className="text-[12px] font-medium">Distribution du prix de vente au m²</p><DvfChart variant="bar" /></div></> : null}
      </div>
    </article>
  );
}

type MobileState = "search" | "commune" | "address" | "parcel";

function MobileMapBackground({ parcel = false }: { parcel?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e8eddf]" aria-hidden>
      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(32deg, transparent 46%, #c9c9c9 47%, #c9c9c9 49%, transparent 50%), linear-gradient(112deg, transparent 58%, #ffffff 59%, #ffffff 62%, transparent 63%)", backgroundSize: "96px 82px, 138px 118px" }} />
      {["left-[8%] top-[26%] h-20 w-24", "right-[8%] top-[18%] h-28 w-20", "left-[34%] top-[42%] h-20 w-28", "right-[20%] top-[52%] h-24 w-24", "left-[10%] bottom-[16%] h-24 w-32"].map((position, index) => <span key={position} className={`absolute rotate-${index % 2 ? "3" : "-3"} border border-[#a8b49a] ${index % 3 === 0 ? "bg-[#d9e7bc]" : index % 3 === 1 ? "bg-[#f4d9a8]" : "bg-[#c7dfc0]"} ${position}`} />)}
      {parcel ? <span className="absolute left-[30%] top-[35%] h-28 w-36 rotate-[-4deg] border-2 border-[#6A6AF4] bg-[#A558A0]/30" /> : null}
    </div>
  );
}

function MobileSearchField({ value }: { value?: string }) {
  return (
    <div className="absolute left-3 right-3 top-3 z-20 flex h-11 bg-white shadow-[0_2px_8px_rgba(0,0,0,.18)]">
      <RiSearchLine className="ml-3 mt-3 h-5 w-5 shrink-0 text-[#666666]" />
      <span className={`min-w-0 flex-1 truncate px-2 py-3 text-[13px] ${value ? "text-[#161616]" : "text-[#666666]"}`}>{value ?? "Adresse, ville ou parcelle"}</span>
      {value ? <RiCloseLine className="mr-3 mt-3 h-5 w-5" /> : null}
    </div>
  );
}

function MobileMapControls() {
  return (
    <div className="absolute right-3 top-16 z-20 flex flex-col overflow-hidden rounded bg-white shadow">
      <button type="button" aria-label="Zoomer" className="grid h-9 w-9 place-items-center border-b border-[#E5E5E5]"><RiAddLine className="h-5 w-5" /></button>
      <button type="button" aria-label="Dézoomer" className="grid h-9 w-9 place-items-center border-b border-[#E5E5E5]"><RiSubtractLine className="h-5 w-5" /></button>
      <button type="button" aria-label="Masquer les couleurs de données" className="grid h-9 w-9 place-items-center border-b border-[#E5E5E5]"><RiPaletteLine className="h-4 w-4" /></button>
      <button type="button" aria-label="Afficher la vue satellite" className="grid h-9 w-9 place-items-center"><RiEarthLine className="h-4 w-4" /></button>
    </div>
  );
}

function MobileSheet({ state }: { state: MobileState }) {
  if (state === "search") return (
    <section className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-white px-4 pb-5 pt-2 shadow-[0_-4px_16px_rgba(0,0,0,.18)]">
      <div className="mx-auto h-1 w-10 rounded-full bg-[#929292]" />
      <p className="mt-4 text-[16px] font-bold">Rechercher des ventes</p>
      <p className="mt-1 text-[12px] leading-5 text-[#666666]">Saisissez une adresse, une ville ou une parcelle cadastrale.</p>
      <button type="button" className="mt-3 text-[12px] font-medium text-[#000091] underline underline-offset-2">Recherche avancée</button>
    </section>
  );

  if (state === "commune") return (
    <section className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl bg-white px-4 pb-4 pt-2 shadow-[0_-4px_16px_rgba(0,0,0,.18)]">
      <div className="mx-auto h-1 w-10 rounded-full bg-[#929292]" />
      <div className="mt-3 flex items-start justify-between gap-3"><div><p className="text-[11px] text-[#666666]">Commune sélectionnée</p><h3 className="text-[18px] font-bold">Bordeaux</h3></div><button type="button" className="mt-1 grid h-8 w-8 place-items-center" aria-label="Filtrer"><RiEqualizer2Line className="h-5 w-5" /></button></div>
      <p className="mt-1 text-[12px] text-[#666666]">428 ventes · 2021–2025</p>
      <button type="button" className="mt-3 flex w-full items-center justify-between border-t border-[#E5E5E5] pt-3 text-left text-[13px] font-medium"><span>Afficher les transactions</span><RiArrowDownSLine className="h-5 w-5 rotate-180" /></button>
    </section>
  );

  if (state === "address") return (
    <section className="absolute inset-0 z-30 overflow-y-auto bg-white pb-5">
      <header className="flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-4"><button type="button" className="inline-flex items-center gap-1 text-[12px] font-medium text-[#000091]"><RiArrowLeftLine className="h-4 w-4" />Retour à la carte</button><span className="rounded bg-[#eeeeee] px-2 py-1 text-[11px]">Adresse</span></header>
      <div className="p-4"><p className="text-[10px] font-medium uppercase tracking-[.04em] text-[#666666]">Adresse localisée</p><h3 className="mt-1 text-[18px] font-bold">12 rue des Argentiers</h3><p className="mt-1 text-[12px] text-[#666666]">33000 Bordeaux</p><div className="mt-5 border-l-4 border-[#000091] bg-[#f6f6f6] p-4"><p className="text-[12px] font-medium">1 parcelle cadastrale correspond à cette adresse</p><p className="mt-1 text-[11px] leading-5 text-[#666666]">Sélectionnez-la pour consulter les transactions enregistrées.</p></div><button type="button" className="mt-4 h-10 bg-[#000091] px-4 text-[12px] font-medium text-white">Voir la parcelle et ses transactions</button></div>
    </section>
  );

  return (
    <section className="absolute inset-0 z-30 overflow-y-auto bg-white pb-5">
      <header className="flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-4"><button type="button" className="inline-flex items-center gap-1 text-[12px] font-medium text-[#000091]"><RiArrowLeftLine className="h-4 w-4" />Retour à la carte</button><span className="rounded bg-[#eeeeee] px-2 py-1 text-[11px]">Parcelle cadastrale</span></header>
      <div className="px-4 pb-5 pt-4">
      <nav className="fr-breadcrumb text-[11px] leading-5" aria-label="Vous êtes ici :"><ol className="fr-breadcrumb__list flex flex-wrap items-center gap-x-2"><li><button type="button" className="text-[#000091] underline underline-offset-2">Bordeaux</button></li><li className="flex items-center gap-2 before:text-[#929292] before:content-['›']"><span aria-current="page" className="text-[#666666]">12 rue des Argentiers</span></li></ol></nav>
      <p className="mt-5 text-[11px] text-[#666666]">Parcelle sélectionnée</p>
      <h3 className="text-[18px] font-bold">12 rue des Argentiers</h3>
      <p className="mt-1 text-[11px] leading-4 text-[#666666]">33063000HX0082 · 202 m²</p>
      <h4 className="mt-4 text-[15px] font-bold">2 transactions</h4>
      <button type="button" className="mt-2 w-full rounded border border-[#E5E5E5] p-3 text-left"><span className="flex items-center justify-between"><strong className="text-[15px]">428 000 €</strong><span className="text-[11px] text-[#666666]">18 novembre 2024</span></span><span className="mt-1 block text-[12px] text-[#666666]">Appartement · 4 pièces · 82 m²</span></button>
      <button type="button" className="mt-2 w-full rounded border border-[#E5E5E5] p-3 text-left"><span className="flex items-center justify-between"><strong className="text-[15px]">352 000 €</strong><span className="text-[11px] text-[#666666]">4 juin 2019</span></span><span className="mt-1 block text-[12px] text-[#666666]">Appartement · 4 pièces · 82 m²</span></button>
      </div>
    </section>
  );
}

function MobileExperiencePreview({ state, label }: { state: MobileState; label: string }) {
  const selection = state === "search" ? undefined : state === "commune" ? "Bordeaux" : "12 rue des Argentiers, Bordeaux";
  return (
    <article>
      <Label>{label}</Label>
      <div className="relative mx-auto h-[620px] w-full max-w-[360px] overflow-hidden rounded-[20px] border-[6px] border-[#161616] bg-white shadow-sm">
        <MobileMapBackground parcel={state === "parcel"} />
        {state === "search" || state === "commune" ? <MobileSearchField value={selection} /> : null}
        {state === "search" || state === "commune" ? <MobileMapControls /> : null}
        {state === "search" || state === "commune" ? <div className="absolute bottom-3 right-3 z-20 rounded bg-white/95 px-2 py-1 text-[10px] shadow">Prix médian au m²</div> : null}
        {state === "address" || state === "parcel" ? <MobileSheet state={state} /> : null}
      </div>
    </article>
  );
}

export default function ExplorateurDvfDesignPage() {
  return (
    <main className="min-h-dvh bg-[#f6f6f6] text-[#161616]">
      <header className="border-b border-[#E5E5E5] bg-white px-6 py-5">
        <p className="text-[13px] font-medium text-[#000091]">Explorateur DVF · Documentation interne</p>
        <h1 className="mt-1 text-[32px] font-extrabold leading-10">Composants et échelles cartographiques</h1>
        <p className="mt-2 max-w-[780px] text-[15px] leading-6 text-[#3a3a3a]">
          Planche de référence des composants utilisés dans le prototype et des contenus affichés dans la sidebar selon l’échelle de la carte.
        </p>
      </header>

      <div className="mx-auto max-w-[1440px] space-y-12 px-6 py-10">
        <section aria-labelledby="mobile-experience-title">
          <header>
            <p className="text-[11px] font-medium uppercase tracking-[.06em] text-[#000091]">Expérience mobile</p>
            <h2 id="mobile-experience-title" className="mt-1 text-[24px] font-bold">Carte plein écran et vue parcelle dédiée</h2>
            <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#3a3a3a]">La recherche et l’exploration se font sur une carte réellement plein écran. La sélection d’une parcelle ouvre ensuite une vue dédiée occupant tout l’écran, sur le modèle de Pappers, afin de laisser suffisamment de place aux transactions.</p>
          </header>
          <div className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <MobileExperiencePreview state="search" label="1 · Recherche initiale" />
            <MobileExperiencePreview state="commune" label="2 · Commune cadrée sur la carte" />
            <MobileExperiencePreview state="address" label="3 · Adresse localisée" />
            <MobileExperiencePreview state="parcel" label="4 · Vue plein écran de la parcelle" />
          </div>
          <div className="mt-6 grid gap-4 border border-[#E5E5E5] bg-white p-5 text-[12px] leading-5 text-[#3a3a3a] md:grid-cols-3">
            <p><strong className="block text-[#161616]">Une carte sans obstruction</strong>Aucun panneau permanent ne réduit l’espace cartographique avant la sélection d’une parcelle.</p>
            <p><strong className="block text-[#161616]">Un changement de contexte clair</strong>La parcelle et ses transactions disposent d’un écran complet, avec un retour explicite vers la carte.</p>
            <p><strong className="block text-[#161616]">Une étape avant la parcelle</strong>Une adresse localisée est confirmée avant d’ouvrir la parcelle correspondante et ses transactions.</p>
          </div>
        </section>

        <section aria-labelledby="components-title">
          <h2 id="components-title" className="text-[24px] font-bold">Inventaire des composants</h2>
          <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#3a3a3a]">Cet inventaire ne présente que les composants actuellement intégrés dans l’application. Les variantes abandonnées sont retirées de cette page.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Navigation principale</Label>
              <div className="inline-flex divide-x divide-[#E5E5E5] border border-[#E5E5E5]">
                <button type="button" aria-pressed="true" className="flex h-9 items-center justify-center gap-2 bg-[#000091] px-4 text-[14px] font-medium text-white"><RiMap2Line className="h-4 w-4" />Carte</button>
                <button type="button" aria-pressed="false" className="flex h-9 items-center justify-center gap-2 bg-white px-4 text-[14px] font-medium hover:bg-[#eeeeee]"><RiTableLine className="h-4 w-4" />Tableau</button>
              </div>
              <button type="button" className="mt-4 flex items-center gap-2 text-[13px] font-medium underline-offset-4 hover:underline"><RiInformationLine className="h-4 w-4" />À propos</button>
            </article>

            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Recherche principale</Label>
              <label className="flex h-9 w-full max-w-[440px] items-center gap-2 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-[#000091]"><RiSearchLine aria-hidden className="h-4 w-4 shrink-0 text-[#3a3a3a]" /><span className="sr-only">Rechercher une adresse, une ville ou une parcelle</span><input className="min-w-0 flex-1 bg-transparent text-[13px] text-[#3a3a3a] outline-none placeholder:text-[#666666]" placeholder="Rechercher une adresse, une ville, une parcelle" /></label>
              <div className="border border-t-0 border-[#E5E5E5]"><button type="button" className="flex w-full items-start justify-between gap-3 bg-[#ececfe] px-3 py-2 text-left"><span><strong className="block text-[12px] font-medium">Bordeaux</strong><span className="text-[11px] text-[#666666]">Gironde · 33063</span></span><span className="bg-white px-1.5 py-0.5 text-[10px]">Commune</span></button></div>
              <button type="button" className="mt-3 flex w-full items-center justify-between py-2 text-left text-[12px] font-medium text-[#666666]"><span>Recherche avancée</span><RiArrowDownSLine className="h-4 w-4" /></button>
            </article>

            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Filtre de type de bien</Label>
              <label className="block text-[12px] font-medium text-[#3a3a3a]">Type de bien<span className="relative mt-1 block"><select className="h-9 w-full appearance-none rounded border border-[#E5E5E5] bg-[#f6f6f6] pl-3 pr-9 text-[13px]"><option>Appartements et maisons</option><option>Appartements</option><option>Maisons</option><option>Locaux commerciaux</option></select><RiArrowDownSLine className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2" /></span></label>
              <p className="mt-3 text-[11px] leading-5 text-[#666666]">La valeur est conservée lors du passage entre Carte et Tableau.</p>
            </article>

            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Contrôles cartographiques</Label>
              <div className="flex items-start gap-4"><div className="flex flex-col overflow-hidden rounded border border-[#E5E5E5]"><button type="button" className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5]" aria-label="Zoomer"><RiAddLine className="h-5 w-5" /></button><button type="button" className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5]" aria-label="Dézoomer"><RiSubtractLine className="h-5 w-5" /></button><button type="button" className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5]" aria-label="Masquer les couleurs de données"><RiPaletteLine className="h-5 w-5" /></button><button type="button" className="flex h-9 w-9 items-center justify-center" aria-label="Afficher la vue satellite"><RiEarthLine className="h-5 w-5" /></button></div><p className="max-w-48 text-[12px] leading-5 text-[#666666]">Groupe placé en haut à droite : zoom, retour à la sélection seulement lorsqu’il est disponible, visibilité des couleurs et choix du fond de carte.</p></div>
            </article>

            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Légende choroplèthe</Label>
              <div className="ml-auto w-[240px]"><div className="flex items-center justify-between"><p className="text-[12px] font-bold">Prix au m²</p><span className="text-[10px] text-[#666666]">Échelle recalculée</span></div><div className="mt-1.5 h-2 bg-gradient-to-r from-[#028758] via-[#FFF64E] to-[#CC000A]" /><div className="mt-1 flex justify-between text-[10px] text-[#666666]"><span>&lt; 900 €</span><span>2 600 €</span><span>&gt; 9 000 €</span></div><p className="mt-2 text-right text-[10px] text-[#666666]">Position : bas à droite, au-dessus des crédits</p></div>
            </article>

            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Tableau et téléchargement</Label>
              <div className="bg-[#f6f6f6] px-3 py-2 text-[12px]"><strong>Sélection : Bordeaux</strong><span className="ml-2 text-[#666666]">· 428 ventes · 2021–2025</span></div><button type="button" className="mt-4 inline-flex h-10 items-center gap-2 bg-[#000091] px-4 text-[13px] font-medium text-white"><RiDownloadLine className="h-4 w-4" />Télécharger les données</button>
            </article>

            <article className="border border-[#E5E5E5] bg-white p-5">
              <Label>Sidebar desktop repliable</Label>
              <div className="relative h-28 overflow-hidden border border-[#E5E5E5] bg-[#f6f6f6]"><div className="h-full w-28 border-r border-[#E5E5E5] bg-white" /><button type="button" aria-label="Replier le panneau d’informations" className="absolute left-[94px] top-3 flex h-9 w-9 items-center justify-center border border-[#E5E5E5] bg-white shadow"><RiSidebarFoldLine className="h-5 w-5" /></button></div>
              <p className="mt-3 text-[11px] leading-5 text-[#666666]">Sur desktop, le panneau peut être replié pour agrandir la carte. Le contrôle reste au bord du panneau et l’animation respecte la préférence de réduction des mouvements.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="parcel-search-title">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[.06em] text-[#000091]">Navigation cartographique</p>
              <h2 id="parcel-search-title" className="mt-1 text-[24px] font-bold">Recherche par parcelle cadastrale</h2>
              <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[#3a3a3a]">Deux parcours sont proposés sans les mélanger : saisie directe d’un identifiant complet ou composition progressive. Chaque choix filtre et active le niveau suivant.</p>
              <ul className="mt-5 max-w-[680px] space-y-2 text-[13px] leading-5 text-[#3a3a3a]"><li>• Les champs dépendants restent désactivés tant que le niveau précédent n’est pas renseigné.</li><li>• Modifier un niveau réinitialise automatiquement tous les niveaux suivants.</li><li>• Le nombre de parcelles trouvées apparaît dès qu’une section est sélectionnée.</li><li>• La sélection finale doit centrer la carte et ouvrir la sidebar de la parcelle.</li></ul>
            </div>
            <ParcelSearchPrototype />
          </div>
        </section>

        <section aria-labelledby="transactions-title">
          <header>
            <p className="text-[11px] font-medium uppercase tracking-[.06em] text-[#000091]">Échelle parcelle cadastrale</p>
            <h2 id="transactions-title" className="mt-1 text-[24px] font-bold">Cartes de transaction</h2>
            <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#3a3a3a]">Le composant utilisé conserve la même hiérarchie dans tous les cas : nature et date de la vente, montant, adresse, puis détail des lots sous forme de tableau.</p>
          </header>

          <div className="mt-6 max-w-[400px]"><Label>Composant utilisé</Label><StructuredTransactionConcept /></div>

          <div className="mt-10 border-t border-[#E5E5E5] pt-6">
            <h3 className="text-[18px] font-bold">États du composant</h3>
            <p className="mt-1 max-w-[720px] text-[13px] leading-5 text-[#666666]">Les variantes ci-dessous utilisent la piste C pour vérifier son comportement avec les principaux cas rencontrés dans les données.</p>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <Label>Vente simple</Label>
              <StructuredTransactionConcept lots={[{ label: "Appartement", rooms: "4 pièces", surface: "82 m²", icon: RiBuilding2Line }]} />
            </div>
            <div>
              <Label>Plusieurs lots</Label>
              <StructuredTransactionConcept price="1 075 000 €" pricePerSquareMeter="12 356 €" date="16 mai 2025" address="1 place Paul Painlevé, 75005 Paris" mutationId="2025-0148621" lots={[{ label: "Appartement", rooms: "4 pièces", surface: "87 m²", icon: RiBuilding2Line }, { label: "Dépendance", icon: RiHome4Line }]} />
            </div>
            <div>
              <Label>Transaction particulière</Label>
              <StructuredTransactionConcept nature="Échange" price="100 000 €" pricePerSquareMeter="" date="22 juillet 2021" address="273 chemin des Mûres, 34301 Montpellier" mutationId="2021-0874312" lots={[{ label: "Appartement", rooms: "3 pièces", surface: "90 m²", icon: RiBuilding2Line }, { label: "Sol", surface: "930 m²", icon: RiMap2Line }, { label: "Terrain d’agrément", surface: "201 m²", icon: RiMap2Line }, { label: "Dépendance", icon: RiHome4Line }]} notice="Cette transaction contient des dispositions sur des parcelles adjacentes. La valeur foncière correspond au total." />
            </div>
            <div>
              <Label>Données partielles</Label>
              <StructuredTransactionConcept muted price="" pricePerSquareMeter="" date="4 juin 2019" address="12 rue des Argentiers, 33000 Bordeaux" mutationId="2019-0845216" lots={[{ label: "Appartement", rooms: "Non renseigné", icon: RiBuilding2Line }]} notice="Le montant ou certaines caractéristiques de cette transaction ne sont pas disponibles dans la source." />
            </div>
          </div>

          <div className="mt-6 rounded border border-dashed border-[#929292] bg-white p-5">
            <Label>État vide</Label>
            <p className="text-[15px] font-bold">Aucune transaction connue pour cette parcelle</p>
            <p className="mt-1 max-w-[620px] text-[13px] leading-5 text-[#666666]">La parcelle est identifiable sur le cadastre, mais aucune vente n’est disponible dans les données DVF des cinq dernières années.</p>
          </div>
        </section>

        <section aria-labelledby="result-states-title">
          <header>
            <p className="text-[11px] font-medium uppercase tracking-[.06em] text-[#000091]">États de référence</p>
            <h2 id="result-states-title" className="mt-1 text-[24px] font-bold">États des résultats</h2>
            <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#3a3a3a]">Ces états remplacent la liste de résultats. Les anciennes ventes ne restent jamais visibles pendant une nouvelle recherche, un chargement ou une erreur.</p>
          </header>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div><Label>Chargement</Label><ResultStatePreview type="loading" /></div>
            <div><Label>Aucun résultat</Label><ResultStatePreview type="empty" /></div>
            <div><Label>Erreur technique</Label><ResultStatePreview type="error" /></div>
            <div><Label>Territoire non couvert</Label><ResultStatePreview type="uncovered" /></div>
            <div><Label>Données partielles</Label><ResultStatePreview type="partial" /></div>
          </div>
        </section>

        <section aria-labelledby="charts-title">
          <header>
            <p className="text-[11px] font-medium uppercase tracking-[.06em] text-[#000091]">Décision de design</p>
            <h2 id="charts-title" className="mt-1 text-[24px] font-bold">Visualisations</h2>
            <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#3a3a3a]">
              Les graphiques reprennent les conventions de l’agent data.gouv.fr : palette institutionnelle, courbes lissées, grille discrète et infobulles contrastées.
            </p>
          </header>

          <div className="mt-6 overflow-hidden border border-[#E5E5E5] bg-white">
            <div className="grid gap-px bg-[#E5E5E5] sm:grid-cols-4">
              {[
                ["Série principale", "#000091", "Bleu data.gouv.fr"],
                ["Grille", "#E5E5E5", "Séparation neutre"],
                ["Texte", "#161616", "Marianne, graisse 400"],
                ["Infobulle", "#777777", "Fond blanc, bordure 1 px"],
              ].map(([label, color, description]) => (
                <div key={label} className="bg-white p-4">
                  <div className="h-2 w-12" style={{ backgroundColor: color }} />
                  <p className="mt-3 text-[13px] font-semibold">{label}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#666666]">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="border border-[#E5E5E5] bg-white p-5">
              <h3 className="text-[15px] font-bold">Évolution du prix médian au m²</h3>
              <p className="mt-1 text-[12px] text-[#666666]">Courbe temporelle lissée, sans marqueurs permanents.</p>
              <DvfChart variant="line" height={230} />
              <p className="mt-3 border-t border-[#E5E5E5] pt-3 text-[11px] text-[#666666]">Source : Demandes de valeurs foncières · DGFiP</p>
            </article>
            <article className="border border-[#E5E5E5] bg-white p-5">
              <h3 className="text-[15px] font-bold">Distribution du prix de vente au m²</h3>
              <p className="mt-1 text-[12px] text-[#666666]">Histogramme compact utilisant la même couleur principale.</p>
              <DvfChart variant="bar" height={230} />
              <p className="mt-3 border-t border-[#E5E5E5] pt-3 text-[11px] text-[#666666]">Source : Demandes de valeurs foncières · DGFiP</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="sidebars-title">
          <p className="text-[11px] font-medium uppercase tracking-[.06em] text-[#000091]">Architecture du panneau</p>
          <h2 id="sidebars-title" className="mt-1 text-[24px] font-bold">Un conteneur stable, deux modèles de contenu</h2>
          <p className="mt-2 max-w-[820px] text-[14px] leading-6 text-[#3a3a3a]">
            La position, la largeur, l’en-tête et le défilement restent stables. La hiérarchie interne change lorsque l’utilisateur quitte l’analyse d’un territoire pour consulter une parcelle et ses transactions.
          </p>
          <div className="mt-6 grid gap-px overflow-hidden border border-[#E5E5E5] bg-[#E5E5E5] md:grid-cols-2">
            <article className="bg-white p-5"><p className="text-[11px] font-medium uppercase tracking-[.04em] text-[#666666]">Modèle territorial</p><h3 className="mt-1 text-[18px] font-bold">France, département, commune</h3><ul className="mt-3 space-y-1 text-[13px] leading-5 text-[#3a3a3a]"><li>Fil d’Ariane géographique</li><li>Filtre de type de bien</li><li>Ventes et prix médians</li><li>Graphiques comparatifs</li></ul></article>
            <article className="bg-white p-5"><p className="text-[11px] font-medium uppercase tracking-[.04em] text-[#666666]">Modèle objet</p><h3 className="mt-1 text-[18px] font-bold">Adresse, parcelle, transactions</h3><ul className="mt-3 space-y-1 text-[13px] leading-5 text-[#3a3a3a]"><li>Confirmation de l’adresse localisée</li><li>Retour explicite à la carte sur mobile</li><li>Identité et surface cadastrales</li><li>Transactions avec détail des lots affiché directement</li></ul></article>
          </div>
          <h3 className="mt-8 text-[18px] font-bold">Exemples par échelle</h3>
          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {scales.map((scale) => <ScaleSidebar key={scale.level} scale={scale} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
