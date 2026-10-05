"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { RiSearchLine, RiArrowDownSLine, RiFullscreenLine, RiFullscreenExitLine, RiSidebarFoldLine, RiSidebarUnfoldLine, RiCloseLine } from "@remixicon/react";
import { deathRecords, departments, emptyFilters, filterLabels, placeLabel, places, searchDeaths, validateYears, validateAge, type DeathFilters, type DeathRecord } from "@/lib/deces";
import ResultsTable from "./results-table";
import DeathDetail from "./death-detail";
import LocationSearch from "./location-search";

const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a76f6]";

export default function DeathExplorer() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const searchDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!mobileSearch) return;
    const dialog = searchDialog.current;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, [mobileSearch]);
  const [lastName, setLastName] = useState("");
  const [firstNames, setFirstNames] = useState("");
  const [query, setQuery] = useState<{ lastName: string; firstNames: string; filters: DeathFilters } | null>(null);
  const [filters, setFilters] = useState<DeathFilters>(emptyFilters);
  const [advanced, setAdvanced] = useState(false);
  const [selected, setSelected] = useState<DeathRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const expandButton = useRef<HTMLButtonElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("person");
    if (!id) return;
    const task = setTimeout(() => setSelected(deathRecords.find((record) => record.id === id) ?? null), 0);
    return () => clearTimeout(task);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) { setExpanded(false); expandButton.current?.focus(); }
    };
    window.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", escape); };
  }, [expanded]);

  function search(last = lastName, first = firstNames, criteria = filters) {
    if (timer.current) clearTimeout(timer.current);
    if (!last.trim() && !first.trim() && !Object.values(criteria).some((value) => value.trim())) {
      setError("Renseignez au moins un nom, un prénom ou un critère avancé.");
      setLoading(false);
      nameInput.current?.focus();
      return;
    }
    if (!validateYears(criteria.birthYears) || !validateYears(criteria.deathYears)) {
      setError("Indiquez une date valide (05/07/1920), une année (1920) ou une période croissante (1920-1940).");
      setAdvanced(true);
      setLoading(false);
      return;
    }
    if (!validateAge(criteria.age)) { setError("Indiquez un âge entre 0 et 130 ans ou une plage croissante (75-80)."); setAdvanced(true); setLoading(false); return; }
    setError("");
    setLoading(true);
    timer.current = setTimeout(() => {
      setQuery({ lastName: last.trim(), firstNames: first.trim(), filters: { ...criteria } });
      setLoading(false);
      setMobileSearch(false);
    }, 350);
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setFilters(emptyFilters);
    setLastName(""); setFirstNames(""); setQuery(null); setError(""); setLoading(false);
    nameInput.current?.focus();
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); search(); }

  function removeFilter(key: keyof DeathFilters) {
    if (!query) return;
    if (timer.current) clearTimeout(timer.current);
    const next = { ...query.filters, [key]: "" };
    setFilters((current) => ({ ...current, [key]: "" }));
    setQuery(!query.lastName && !query.firstNames && !Object.values(next).some(Boolean) ? null : { ...query, filters: next });
    setLoading(false); setError("");
  }

  const results = query ? searchDeaths(query.lastName, query.firstNames, query.filters) : [];

  const searchForm = (
      <div className="p-4">
        <form onSubmit={submit} className="space-y-4 [&_label]:text-[12px] [&_input]:text-[13px] [&_select]:text-[13px]" noValidate>
          <div className="grid gap-4">
            <label className="block text-sm font-medium" htmlFor="death-name">Nom de naissance<input ref={nameInput} id="death-name" value={lastName} onChange={(event) => { setLastName(event.target.value); setError(""); }} placeholder="Ex. : Martin" autoComplete="off" aria-invalid={!!error} aria-describedby={error ? "death-search-error" : undefined} className={`mt-2 block h-10 w-full rounded border border-[#E5E5E5] bg-[#f6f6f6] px-4 font-normal placeholder:text-[#777777] ${focus}`} /></label>
            <label className="block text-sm font-medium" htmlFor="death-firstnames">Prénom(s)<input id="death-firstnames" value={firstNames} onChange={(event) => { setFirstNames(event.target.value); setError(""); }} placeholder="Ex. : Marie" autoComplete="off" className={`mt-2 block h-10 w-full rounded border border-[#E5E5E5] bg-[#f6f6f6] px-4 font-normal placeholder:text-[#777777] ${focus}`} /></label>

          </div>
          <button type="button" aria-expanded={advanced} aria-controls="death-advanced" onClick={() => setAdvanced(!advanced)} className={`mt-5 flex items-center gap-2 py-1 text-sm font-medium text-[#000091] ${focus}`}><span aria-hidden="true">{advanced ? "−" : "+"}</span>{advanced ? "Moins de critères" : "Plus de critères"}{Object.values(filters).filter(Boolean).length > 0 && ` · ${Object.values(filters).filter(Boolean).length}`}</button>
          <div id="death-advanced" hidden={!advanced} className="mt-4 border-t border-[#e5e5e5] pt-5">
            <label className="mb-6 block max-w-sm text-sm">Sexe<span className="relative mt-2 block"><select value={filters.sex} onChange={(event) => setFilters({ ...filters, sex: event.target.value })} className={`block h-10 w-full appearance-none rounded border border-[#E5E5E5] bg-[#f6f6f6] pl-3 pr-10 ${focus}`}><option value="">Tous</option><option>Féminin</option><option>Masculin</option></select><RiArrowDownSLine aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2" /></span></label>
            <div className="grid gap-6">
              {(["birth", "death"] as const).map((kind) => {
                const label = kind === "birth" ? "naissance" : "décès";
                const inputClass = `mt-2 block h-10 w-full min-w-0 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-3 ${focus}`;
                function update(key: keyof DeathFilters, value: string) { setFilters({ ...filters, [key]: value }); setError(""); }
                return <fieldset key={kind} className="min-w-0"><legend className="mb-3 text-[13px] font-bold leading-5">{kind === "birth" ? "Naissance" : "Décès"}</legend><div className="grid gap-4">
                  <label className="text-sm">Date de {label}<input value={filters[`${kind}Years`]} onChange={(e) => update(`${kind}Years`, e.target.value)} aria-invalid={!!error && !validateYears(filters[`${kind}Years`])} placeholder={kind === "birth" ? "1920-1940 ou 05/07/1920" : "2005 ou 04/04/2005"} className={inputClass} /></label>
                  {kind === "death" && <label className="text-sm">Âge au décès<input value={filters.age} onChange={(e) => update("age", e.target.value)} placeholder="Ex. : 78 ou 75-80" aria-invalid={!!error && !validateAge(filters.age)} className={inputClass} /></label>}
                  <LocationSearch label={`Commune de ${label}`} value={filters[`${kind}Place`]} onChange={(value) => update(`${kind}Place`, value)} options={places.map((place) => ({ value: place.replace(/ \(.*\)/, ""), label: place }))} />
                  <LocationSearch label={`Département de ${label}`} value={filters[`${kind}Department`]} onChange={(value) => update(`${kind}Department`, value)} options={departments.map((place) => ({ value: place.match(/\(([^)]+)\)/)?.[1] ?? place, label: place }))} />
                  <LocationSearch label={`Pays de ${label}`} value={filters[`${kind}Country`]} onChange={(value) => update(`${kind}Country`, value)} options={[{ value: "France (FRA)", label: "France (FRA)" }]} />
                </div></fieldset>;
              })}
            </div>
            <p className="mt-4 text-xs text-[#666666]">Cliquez sur Rechercher pour appliquer vos critères.</p>
          </div>
          {error && <p id="death-search-error" role="alert" className="mt-3 text-sm text-[#ce0500]">{error}</p>}
<div className="sticky bottom-0 mt-4 grid gap-2 border-t border-[#E5E5E5] bg-white py-3">            <button type="submit" disabled={loading} className={`flex h-10 items-center justify-center gap-2 bg-[#000091] px-5 text-sm font-medium text-white hover:bg-[#1212ff] disabled:opacity-60 ${focus}`}><RiSearchLine aria-hidden="true" className="h-5 w-5" />{loading ? "Recherche…" : mobileSearch ? "Afficher les résultats" : "Rechercher"}</button>
            <button type="button" onClick={reset} className={`h-10 px-2 text-sm text-[#000091] underline underline-offset-4 hover:bg-[#f6f6f6] ${focus}`}>Réinitialiser</button></div>
        </form>
      </div>
  );

  return (
    <section aria-label="Explorateur des personnes décédées" className={`${expanded ? "fixed inset-0 z-[300] overflow-y-auto" : "-mx-4 overflow-hidden border-y sm:mx-0 sm:border"} border-[#e5e5e5] bg-white [&_button]:cursor-pointer [&_button:disabled]:cursor-default`}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#e5e5e5] bg-[#f6f6f6] px-4 py-2">
        <h2 className="text-sm font-medium">Explorateur des personnes décédées</h2>
        <button ref={expandButton} onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className={`inline-flex shrink-0 items-center gap-2 px-2 py-1.5 text-[13px] font-medium text-[#000091] hover:bg-[#e3e3fd] ${focus}`}>
          {expanded ? <RiFullscreenExitLine aria-hidden="true" className="h-4 w-4" /> : <RiFullscreenLine aria-hidden="true" className="h-4 w-4" />}<span className="hidden sm:inline">{expanded ? "Quitter le plein écran" : "Plein écran"}</span><span className="sm:hidden">{expanded ? "Fermer" : "Agrandir"}</span>
        </button>
      </div>
      <div className={`md:flex ${expanded ? "md:h-[calc(100dvh-48px)]" : "md:h-[740px]"}`}>
        <>
          <div className="flex items-center justify-between border-b border-[#E5E5E5] p-3 md:hidden"><span className="text-xs">{query ? [query.lastName,query.firstNames].filter(Boolean).join(" ") || "Recherche avancée" : "Votre recherche"}</span><button onClick={()=>setMobileSearch(true)} className="text-sm font-medium text-[#000091]">Modifier la recherche</button></div>
          {!collapsed && <aside aria-label="Votre recherche" className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-[#E5E5E5] md:block"><div className="flex items-center justify-between border-b border-[#E5E5E5] px-4 py-2"><h3 className="text-[14px] font-bold leading-5">Votre recherche</h3><button aria-label="Replier la recherche" onClick={()=>setCollapsed(true)} className="p-2 hover:bg-[#eeeeee]"><RiSidebarFoldLine className="h-4 w-4" /></button></div>{!mobileSearch && searchForm}</aside>}
          {collapsed && <button aria-label="Afficher la recherche" onClick={()=>setCollapsed(false)} className="hidden shrink-0 self-start p-3 text-[#000091] md:block"><RiSidebarUnfoldLine className="h-5 w-5" /></button>}
          {mobileSearch && <dialog ref={searchDialog} aria-label="Votre recherche" onCancel={()=>setMobileSearch(false)} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-white p-0"><header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#E5E5E5] bg-white p-3"><h3 className="text-[14px] font-bold leading-5">Votre recherche</h3><button aria-label="Fermer la recherche" onClick={()=>setMobileSearch(false)} className="p-2"><RiCloseLine className="h-5 w-5" /></button></header>{searchForm}</dialog>}
        </>
        <div className="min-w-0 flex-1 overflow-y-auto">
      {query && Object.values(query.filters).some(Boolean) && <div aria-label="Filtres actifs" className="flex flex-wrap items-center gap-2 border-b border-[#e5e5e5] px-5 py-4 sm:px-8"><span className="mr-1 text-xs text-[#666666]">Votre recherche</span>{(Object.entries(query.filters) as [keyof DeathFilters, string][]).filter(([, value]) => value).map(([key, value]) => <button key={key} onClick={() => removeFilter(key)} aria-label={`Retirer le filtre ${filterLabels[key]} : ${placeLabel(value)}`} className={`rounded-full bg-[#e8edff] px-3 py-1.5 text-xs text-[#000091] hover:bg-[#d5dbef] ${focus}`}>{filterLabels[key]} : {placeLabel(value)}<span aria-hidden="true" className="ml-2">×</span></button>)}</div>}
      <div aria-busy={loading} className="min-h-[340px] p-3">
        <div role="status" aria-live="polite" className="sr-only">{loading ? "Recherche en cours" : query ? `${results.length} résultat${results.length > 1 ? "s" : ""} ${query.lastName || query.firstNames ? `pour ${query.lastName} ${query.firstNames}` : "selon vos critères"}.` : "Saisissez un nom ou un prénom pour commencer."}</div>
        {loading ? <div className="space-y-4 py-4" aria-hidden="true">{[1, 2, 3].map((item) => <div key={item} className="h-16 bg-[#f6f6f6] motion-safe:animate-pulse" />)}</div> : !query ? (
          <div className="mx-auto flex max-w-xl flex-col items-center py-7 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ececfe] text-[#000091]"><RiSearchLine aria-hidden="true" className="h-7 w-7" /></span>
            <p className="mt-5 text-sm leading-6 text-[#666666]">Recherchez une personne et retrouvez ses dates et lieux de naissance et de décès dans le fichier de l’Insee.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="mx-auto max-w-xl py-10 text-center"><RiSearchLine aria-hidden="true" className="mx-auto h-9 w-9 text-[#666666]" /><h3 className="mt-5 text-xl font-bold">Aucun résultat pour cette recherche</h3><p className="mt-3 text-sm leading-6 text-[#666666]">Vérifiez l’orthographe ou essayez avec le nom uniquement.</p><button onClick={reset} className={`mt-5 border border-[#000091] px-4 py-2 text-sm font-medium text-[#000091] hover:bg-[#ececfe] ${focus}`}>Nouvelle recherche</button></div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2"><h3 ref={resultsHeading} tabIndex={-1} className="text-[14px] font-bold outline-none">{results.length} résultat{results.length > 1 ? "s" : ""} <span className="font-normal text-[#666666]">{query.lastName || query.firstNames ? `pour « ${[query.lastName, query.firstNames].filter(Boolean).join(" ")} »` : "selon vos critères"}</span></h3></div>
            <ResultsTable key={JSON.stringify(query)} rows={results} onSelect={setSelected} />
          </>
        )}
      </div>
        </div>
      </div>
      {selected && <DeathDetail person={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
