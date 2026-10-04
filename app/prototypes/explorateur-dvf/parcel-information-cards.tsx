import { RiExternalLinkLine } from "@remixicon/react";

const cardClass = "overflow-hidden rounded border border-[#E5E5E5] bg-[#f6f6f6]";
const externalLinkClass = "inline-flex items-start gap-1 font-medium text-[#000091] underline underline-offset-2 hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]";

export function DpeInformationCard() {
  return (
    <article className={cardClass}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[14px] font-bold leading-5">Diagnostic énergétique</h4>
          <div className="flex shrink-0 gap-1.5" aria-label="Classe énergie E et classe climat E">
            <span className="inline-flex h-6 items-center gap-1 rounded-sm bg-[#FDCF41] px-2 text-[11px] font-bold text-[#161616]">Énergie E</span>
            <span className="inline-flex h-6 items-center gap-1 rounded-sm bg-[#FDCF41] px-2 text-[11px] font-bold text-[#161616]">GES E</span>
          </div>
        </div>
        <dl className="mt-3 divide-y divide-[#E5E5E5] text-[12px] leading-4">
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Période de construction</dt><dd className="text-right font-medium">Avant 1948</dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Nombre de niveaux</dt><dd className="text-right font-medium">7</dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Surface du bâtiment</dt><dd className="text-right font-medium">1 326,84 m²</dd></div>
        </dl>
        <div className="mt-2 border-t border-[#E5E5E5] pt-2 text-[11px] leading-4">
          <a href="#" className={externalLinkClass}><RiExternalLinkLine aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />Informations complémentaires sur la rénovation</a>
          <p className="mt-1 text-[#666666]">Source : <strong className="font-medium text-[#3a3a3a]">BDNB</strong></p>
        </div>
      </div>
    </article>
  );
}

export function CondominiumInformationCard() {
  return (
    <article className={cardClass}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[14px] font-bold leading-5">Copropriété</h4>
          <p className="shrink-0 text-right text-[12px] font-bold leading-5 text-[#000091]">AB3055084</p>
        </div>
        <dl className="mt-2 divide-y divide-[#E5E5E5] text-[12px] leading-4">
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Nom d’usage</dt><dd className="text-right font-medium">CHARLOT 7 RUE</dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Syndicat coopératif</dt><dd className="text-right font-medium">Non</dd></div>
          <div className="flex items-start justify-between gap-3 py-1.5"><dt className="shrink-0 text-[#666666]">Représentant légal</dt><dd className="max-w-[62%] text-right"><a href="#" className="font-medium text-[#000091] underline underline-offset-2 hover:decoration-2">JEAN CHARPENTIER-SOPAGI SA 43422040600012</a></dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Nombre total de lots</dt><dd className="text-right font-medium">40</dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Lots à usage d’habitation</dt><dd className="text-right font-medium">9</dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Lots de stationnement</dt><dd className="text-right font-medium">18</dd></div>
          <div className="flex justify-between gap-3 py-1.5"><dt className="text-[#666666]">Mandat sur la propriété</dt><dd className="text-right font-medium">Mandat en cours</dd></div>
        </dl>
        <div className="mt-2 border-t border-[#E5E5E5] pt-2 text-[11px] leading-4">
          <a href="#" className={externalLinkClass}><RiExternalLinkLine aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />Consulter l’annuaire des copropriétés</a>
          <p className="mt-1 text-[#666666]">Source : <strong className="font-medium text-[#3a3a3a]">Registre d’immatriculation des copropriétés</strong></p>
        </div>
      </div>
    </article>
  );
}

const usefulLinks = [
  { title: "Couverture des réseaux internet", service: "Ma connexion internet · Arcep", href: "https://maconnexioninternet.arcep.fr" },
  { title: "Risques associés à l’adresse", service: "Géorisques", href: "https://www.georisques.gouv.fr" },
  { title: "Accessibilité des établissements", service: "Acceslibre", href: "https://acceslibre.beta.gouv.fr" },
  { title: "Informations d’urbanisme", service: "Géoportail de l’urbanisme", href: "https://www.geoportail-urbanisme.gouv.fr" },
];

export function UsefulLinksCards() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {usefulLinks.map((link) => (
        <a key={link.title} href={link.href} target="_blank" rel="noreferrer" className="group flex min-h-16 items-center justify-between gap-3 rounded border border-[#E5E5E5] bg-[#f6f6f6] p-3 text-[#161616] hover:border-[#000091] hover:bg-[#ececfe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]">
          <span className="min-w-0"><strong className="block text-[12px] font-medium leading-4 group-hover:text-[#000091]">{link.title}</strong><span className="mt-0.5 block text-[11px] leading-4 text-[#666666]">{link.service}</span></span>
          <RiExternalLinkLine aria-hidden className="h-4 w-4 shrink-0 text-[#000091]" />
        </a>
      ))}
    </div>
  );
}
