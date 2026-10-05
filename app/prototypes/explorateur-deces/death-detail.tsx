import { useEffect, useRef, useState } from "react";
import { RiCloseLine, RiFileCopyLine } from "@remixicon/react";
import { ageLabel, formatDate, placeLabel, type DeathRecord } from "@/lib/deces";

export default function DeathDetail({ person, onClose }: { person: DeathRecord; onClose: () => void }) {
  const [copyStatus, setCopyStatus] = useState("");
  async function copyLink() {
    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("person", person.id);
    try {
      await navigator.clipboard.writeText(url.href);
      setCopyStatus("Lien copié !");
    } catch {
      setCopyStatus("La copie a échoué. Réessayez.");
    }
  }
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previous;
      trigger?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog ref={dialog} aria-labelledby="death-detail-title" onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-xl border-0 bg-white p-0 text-[#161616] shadow-xl backdrop:bg-black/40">
      <div className="flex min-h-full flex-col">
        <header className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#f6f6f6] px-6 py-4"><span className="text-sm font-medium">Fiche de la personne</span><button autoFocus onClick={onClose} className="flex items-center gap-2 p-2 text-sm text-[#000091] hover:bg-[#ececfe] focus-visible:outline-2" aria-label="Fermer la fiche">Fermer<RiCloseLine aria-hidden="true" className="h-5 w-5" /></button></header>
        <div className="space-y-4 p-4 sm:p-5">
          <div><h2 id="death-detail-title" className="text-[20px] leading-7 font-bold">{person.lastName.toLocaleUpperCase("fr-FR")}<span className="mt-1 block font-medium">{person.firstNames}</span></h2><p className="mt-2 text-[12px] leading-5 text-[#666666]">Sexe : {person.sex}</p></div>
          {(["birth", "death"] as const).map((kind) => {
            const rows = kind === "birth" ? [
              ["Date", formatDate(person.birthDate)],
              ["Commune", person.birthPlace.replace(/ \(.*\)/, "")],
              ["Département", placeLabel(`dept:${person.birthPlace.match(/\(([^)]+)\)/)?.[1] ?? ""}`).replace(/^dept:$/, "—")],
              ["Pays", person.birthCountry],
            ] : [
              ["Date", formatDate(person.deathDate)], ["Âge", `${ageLabel(person)}`],
              ["Commune", person.deathPlace.replace(/ \(.*\)/, "")],
              ["Département", placeLabel(`dept:${person.deathPlace.match(/\(([^)]+)\)/)?.[1] ?? ""}`).replace(/^dept:$/, "—")],
              ["Pays", person.deathCountry], ["Acte n°", person.actNumber],
              ["Source Insee", person.sourceFile],
            ];
            return <section key={kind} className="overflow-hidden rounded border border-[#E5E5E5] bg-[#f6f6f6] p-3"><h3 className="mb-2 text-[14px] font-bold leading-5">{kind === "birth" ? "Naissance" : "Décès"}</h3><dl className="divide-y divide-[#E5E5E5] text-[12px] leading-5">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 py-1.5"><dt className="text-[#666666]">{label}</dt><dd className="break-words text-right font-medium">{value}</dd></div>)}</dl></section>;
          })}
          <div className="border-t border-[#E5E5E5] pt-4">
            <button type="button" onClick={copyLink} className="inline-flex items-center gap-2 rounded px-2 py-2 text-sm font-medium text-[#000091] hover:bg-[#ececfe] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]">Copier le lien vers la fiche<RiFileCopyLine aria-hidden="true" className="h-4 w-4 shrink-0" /></button>
            <p role="status" className="mt-1 text-xs text-[#666666]">{copyStatus}</p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
