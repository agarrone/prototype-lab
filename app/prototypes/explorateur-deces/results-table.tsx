import { ExplorerMobileCard } from "@/components/explorer-mobile-card";
import TableDateFilter from "./table-date-filter";
import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { RiFilterLine, RiSearchLine, RiLayoutColumnLine, RiListUnordered, RiArrowDownSLine, RiText, RiCalendarLine, RiArrowUpLine, RiArrowDownLine, RiCloseLine } from "@remixicon/react";
import { formatDate, normalizeName, type DeathRecord } from "@/lib/deces";

const columns = [
  { key: "lastName", label: "Nom", icon: RiText },
  { key: "firstNames", label: "Prénom(s)", icon: RiText },
  { key: "sex", label: "Sexe", icon: RiText },
  { key: "birthDate", label: "Date de naissance", icon: RiCalendarLine },
  { key: "birthPlace", label: "Commune de naissance", icon: RiText },
  { key: "birthCountry", label: "Pays de naissance", icon: RiText },
  { key: "deathDate", label: "Date de décès", icon: RiCalendarLine },
  { key: "deathPlace", label: "Commune de décès", icon: RiText },
  { key: "sourceFile", label: "Fichier d’origine", icon: RiText },
] as const;
type Key = typeof columns[number]["key"];
function value(row: DeathRecord, key: Key) {
  return key === "birthDate" || key === "deathDate" ? formatDate(row[key]) : row[key];
}
const button = "rounded px-2 py-1.5 hover:bg-[#eeeeee] focus-visible:outline-2 focus-visible:outline-[#000091]";

export default function ResultsTable({ rows, onSelect }: { rows: DeathRecord[]; onSelect: (row: DeathRecord) => void }) {
  const [active, setActive] = useState<Key | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<Record<Key, string[]>>>({});
  const [sort, setSort] = useState<{ key: Key; direction: "asc" | "desc" } | null>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const trigger = useRef<HTMLButtonElement | null>(null);
  const popup = useRef<HTMLElement | null>(null);
  const [ranges, setRanges] = useState<Partial<Record<Key, { min: string; max: string; mode: string }>>>({});
  function close() { setActive(null); trigger.current?.focus({ preventScroll: true }); }
  useEffect(() => {
    if (!active) return;
    function dismiss(event: PointerEvent) { if (!popup.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setActive(null); }
    function reposition() { const rect = trigger.current?.getBoundingClientRect(); if (rect) setPosition({ left: Math.max(8, Math.min((trigger.current?.closest("th")?.getBoundingClientRect().left ?? rect.left) + 8, window.innerWidth - 268)), top: Math.min(rect.bottom + 2, Math.max(8, window.innerHeight - 430)) }); }
    function escape(event: KeyboardEvent) { if (event.key === "Escape") { event.stopPropagation(); setActive(null); trigger.current?.focus({ preventScroll: true }); } }
    document.addEventListener("pointerdown", dismiss); window.addEventListener("resize", reposition); window.addEventListener("scroll", reposition, true); document.addEventListener("keydown", escape, true);
    return () => { document.removeEventListener("pointerdown", dismiss); window.removeEventListener("resize", reposition); window.removeEventListener("scroll", reposition, true); document.removeEventListener("keydown", escape, true); };
  }, [active]);
  const [page, setPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState("");
  const [visible, setVisible] = useState<Key[]>(columns.map(c=>c.key));
  const [selector, setSelector] = useState(false);
  const visibleColumns = columns.filter(c=>visible.includes(c.key));
  const filtered = rows.filter(row => columns.some(c=>normalizeName(value(row,c.key)).includes(normalizeName(globalSearch)))).filter(row => Object.entries(ranges).every(([key, range]) => {
    if (!range.min && !range.max) return true;
    const raw = row[key as "birthDate" | "deathDate"];
    if (raw === null || (typeof raw === "string" && (raw.slice(0,4)==="0000" || raw.slice(4,6)==="00" || raw.slice(6)==="00"))) return false;
    const number = Number(raw);
    const min = range.min ? Number(range.min.replaceAll("-", "")) : null;
    const max = range.max ? Number(range.max.replaceAll("-", "")) : null;
    return range.mode === "before" ? min === null || number < min : range.mode === "after" ? min === null || number > min : (min === null || number >= min) && (max === null || number <= max);
  })).filter((row) => columns.every(({ key }) => !filters[key]?.length || filters[key]?.includes(value(row, key))));
  const sorted = [...filtered].sort((a, b) => {
    if (!sort) return 0;
    const key = sort.key;
    const left = a[key];
    const right = b[key];
    if (left === null || right === null) return left === right ? 0 : left === null ? 1 : -1;
    const order = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "fr", { numeric: true });
    return sort.direction === "asc" ? order : -order;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / 30));
  const current = Math.min(page, pages);
  const activeColumn = columns.find(({ key }) => key === active);
  const options = active ? Array.from(new Set(rows.map((row) => value(row, active)))).filter((item) => normalizeName(item).includes(normalizeName(search))).sort((a,b)=>a.localeCompare(b,"fr",{numeric:true})) : [];
  function clear() { setFilters({}); setRanges({}); setSort(null); setGlobalSearch(""); setPage(1); }
  return <div className="text-[12px] leading-5">
    <div className="flex min-h-12 flex-wrap items-center gap-2 border border-[#E5E5E5] bg-white px-2 py-2">
      <label className="flex h-8 w-[220px] items-center gap-1 rounded border border-[#E5E5E5] bg-[#f6f6f6] px-2"><RiSearchLine aria-hidden className="h-3.5 w-3.5" /><input aria-label="Rechercher une valeur" placeholder="Rechercher une valeur" value={globalSearch} onChange={e=>{setGlobalSearch(e.target.value);setPage(1);}} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none" /></label>
      <div className="ml-auto flex items-center gap-3"><div className="relative"><button aria-expanded={selector} onClick={()=>{setSelector(!selector);setActive(null);}} className="flex h-6 items-center gap-1 rounded px-1 hover:bg-[#eeeeee]"><RiLayoutColumnLine className="h-3.5 w-3.5" />Colonnes {visible.length} sur {columns.length}<RiArrowDownSLine className="h-4 w-4" /></button>{selector && <><button aria-label="Fermer la sélection des colonnes" className="fixed inset-0 z-20" onClick={()=>setSelector(false)} /><div className="absolute right-0 top-8 z-30 w-[260px] rounded border border-[#E5E5E5] bg-white p-2 shadow-lg"><div className="mb-2 flex justify-between"><button onClick={()=>setVisible(columns.map(c=>c.key))}>Tout sélectionner</button><button onClick={()=>setVisible([])}>Tout masquer</button></div>{columns.map(c=><label key={c.key} className="flex h-8 items-center gap-2"><input type="checkbox" checked={visible.includes(c.key)} onChange={()=>setVisible(visible.includes(c.key)?visible.filter(k=>k!==c.key):[...visible,c.key])} className="accent-[#000091]" />{c.label}</label>)}</div></>}</div><span className="flex items-center gap-1"><RiListUnordered className="h-3.5 w-3.5" />{Math.min(current*30,sorted.length)} lignes affichées sur {sorted.length}</span></div>
    </div>
    {(globalSearch || sort || Object.values(filters).some(v=>v?.length) || Object.values(ranges).some(v=>v?.min || v?.max)) && <div className="flex items-center justify-between border-x border-b border-[#E5E5E5] bg-[#f6f6f6] px-2 py-1"><span>Filtres actifs</span><button onClick={clear} className="text-[#000091] underline">Tout effacer</button></div>}
    <div className="flex flex-wrap gap-2 empty:hidden [&:not(:empty)]:py-2">{columns.filter(({ key }) => filters[key]?.length).map(({ key, label }) => <button key={key} className="rounded bg-[#e8edff] px-2 py-1 text-[#000091]" aria-label={`Retirer le filtre ${label}`} onClick={() => { setFilters({ ...filters, [key]: [] }); setPage(1); }}>{label} : {filters[key]?.join(", ")} ×</button>)}{sort && <button className="rounded bg-[#eeeeee] px-2 py-1" onClick={() => setSort(null)}>Tri : {columns.find(c=>c.key===sort.key)?.label} {sort.direction === "asc" ? "↑" : "↓"} ×</button>}</div>
    <div className="flex flex-wrap gap-2 empty:hidden [&:not(:empty)]:py-2">{Object.entries(ranges).filter(([, range]) => range.min || range.max).map(([key, range]) => <button key={key} className="rounded bg-[#e8edff] px-2 py-1 text-[#000091]" onClick={() => { setRanges({ ...ranges, [key]: { min: "", max: "", mode: "between" } }); setPage(1); }}>{columns.find(c=>c.key===key)?.label} : {range.mode === "before" ? "Avant " : range.mode === "after" ? "Après " : ""}{range.mode === "between" && range.min && !range.max ? "≥ " : range.mode === "between" && !range.min && range.max ? "≤ " : ""}{range.min}{range.max ? `${range.min ? " – " : ""}${range.max}` : ""} ×</button>)}</div>
    {activeColumn && createPortal(<section ref={popup} role="dialog" style={position} aria-label={`Trier et filtrer ${activeColumn.label}`} className="fixed z-[400] w-[260px] max-h-[calc(100dvh-16px)] overflow-auto rounded border border-[#E5E5E5] bg-white text-[12px] leading-5 shadow-[0_2px_4px_rgba(0,0,0,0.04),2px_4px_16px_rgba(0,0,0,0.12)]" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setActive(null); } }}>
      <div className="flex h-8 items-center justify-between border-b border-[#E5E5E5] bg-[#f6f6f6] px-2"><span><strong>Filtrer : </strong>{activeColumn.label}</span><button className={button} aria-label="Fermer le filtre" onClick={close}><RiCloseLine className="h-4 w-4" /></button></div>
      <div className="flex h-9 items-center justify-between border-b border-[#E5E5E5] px-2"><span>Trier</span><div className="flex gap-1">{(["asc", "desc"] as const).map(direction => <button key={direction} className={`flex h-6 items-center gap-1 rounded px-2 hover:bg-[#eeeeee] ${sort?.key === active && sort.direction === direction ? "bg-[#e8edff] text-[#000091]" : ""}`} onClick={() => { setSort({ key: activeColumn.key, direction }); setPage(1); }}>{direction === "asc" ? <RiArrowUpLine className="h-3.5 w-3.5" /> : <RiArrowDownLine className="h-3.5 w-3.5" />}{direction === "asc" ? "Croissant" : "Décroissant"}</button>)}</div></div>
      {active === "birthDate" || active === "deathDate" ? <TableDateFilter key={active} range={ranges[active] ?? {min:"",max:"",mode:"before"}} onChange={range=>{setRanges({...ranges,[active]:range});setPage(1);}} onClose={close} /> : <>
      <div><label className="flex h-9 items-center gap-1 border-b border-[#E5E5E5] px-2"><RiSearchLine aria-hidden className="h-3.5 w-3.5" /><input aria-label={`Rechercher une valeur dans ${activeColumn.label}`} placeholder="Rechercher" value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[12px] outline-none" /></label><div className="max-h-64 overflow-auto p-1">{options.map(option=><label key={option} className="flex min-h-8 cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-[#eeeeee]"><input type="checkbox" checked={filters[activeColumn.key]?.includes(option) ?? false} onChange={()=>{ const previous=filters[activeColumn.key] ?? []; setFilters({...filters,[activeColumn.key]:previous.includes(option)?previous.filter(v=>v!==option):[...previous,option]});setPage(1); }} className="accent-[#000091]" /><span className="rounded bg-[#eeeeee] px-2">{option}</span><span className="ml-auto px-2">{rows.filter(row=>value(row,activeColumn.key)===option).length}</span></label>)}{!options.length && <p className="p-2 text-[#666666]">Aucune valeur correspondante.</p>}</div></div>
    </>}</section>, document.body)}
    <div className="hidden md:block max-h-[560px] overflow-auto border border-[#E5E5E5]">
      <table className="table-fixed border-collapse text-left" style={{width: visibleColumns.length * 180}}><caption className="sr-only">Résultats : tri et filtres accessibles dans chaque en-tête de colonne</caption><thead className="sticky top-0 z-10 bg-[#f6f6f6]"><tr>{visibleColumns.map(column=><th key={column.key} scope="col" aria-sort={sort?.key===column.key ? sort.direction === "asc" ? "ascending" : "descending" : "none"} className="h-12 w-[180px] border-b border-r border-[#E5E5E5] px-3"><div className="flex items-center gap-2"><column.icon aria-hidden className="h-4 w-4 shrink-0 text-[#3a3a3a]" /><span className="truncate font-bold">{column.label}</span>{sort?.key===column.key && <span className="text-[#000091]">{sort.direction === "asc" ? "↑" : "↓"}</span>}<button aria-label={`Trier et filtrer ${column.label}`} aria-expanded={active===column.key} onClick={(event)=>{trigger.current=event.currentTarget;const rect=event.currentTarget.getBoundingClientRect();setPosition({left:Math.max(8,Math.min((event.currentTarget.closest("th")?.getBoundingClientRect().left ?? rect.left)+8,window.innerWidth-268)),top:Math.min(rect.bottom+2,Math.max(8,window.innerHeight-430))});setActive(active===column.key?null:column.key);setSearch("");}} className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-[#eeeeee] ${active===column.key || filters[column.key]?.length || ranges[column.key]?.min || ranges[column.key]?.max ? "bg-[#e8edff] text-[#000091]" : "text-[#CECECE]"}`}><RiFilterLine aria-hidden className="h-4 w-4" /></button></div></th>)}</tr></thead><tbody>{sorted.slice(0,current*30).map(row=><tr key={row.id} className="h-8 hover:bg-[#f5f5fe]">{visibleColumns.map(({key})=><td key={key} className="h-8 whitespace-nowrap border-b border-r border-[#E5E5E5] px-3">{key === "lastName" ? <button className="text-[#000091] underline underline-offset-2" aria-label={`Consulter la fiche de ${row.lastName} ${row.firstNames}`} onClick={()=>onSelect(row)}>{row.lastName}</button> : <span className={`block truncate ${["sex", "birthPlace", "deathPlace", "birthCountry"].includes(key) ? "w-fit max-w-full rounded bg-[#eeeeee] px-2 leading-5" : ""}`}>{value(row,key)}</span>}</td>)}</tr>)}</tbody></table>
      {!visible.length && <p className="p-8 text-center">Aucune colonne n’est visible. <button className="text-[#000091] underline" onClick={()=>setVisible(columns.map(c=>c.key))}>Cocher toutes les colonnes</button></p>}
      {!sorted.length && <p role="status" className="p-8 text-center">Aucun résultat pour ces filtres. <button onClick={clear} className="text-[#000091] underline">Réinitialiser le tableau</button></p>}
    </div>
    <div className="grid gap-3 bg-[#f6f6f6] p-3 md:hidden">
      <label className="text-[12px]">Filtrer une colonne<select aria-label="Filtrer une colonne" value={active ?? ""} onChange={event=>{setActive(event.target.value as Key || null);setPosition({left:Math.max(8,(window.innerWidth-260)/2),top:100});}} className="ml-2 rounded border border-[#E5E5E5] bg-white p-2"><option value="">Choisir</option>{visibleColumns.map(c=><option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
      {sorted.slice(0,current*30).map(row=><ExplorerMobileCard key={row.id} fields={visibleColumns.map(c=>({key:c.key,label:c.label,icon:<c.icon aria-hidden className="h-3.5 w-3.5" />,content:<span className={`text-[12px] leading-5 ${["sex","birthPlace","deathPlace","birthCountry"].includes(c.key)?"rounded bg-[#eeeeee] px-2 py-1":""}`}>{value(row,c.key)}</span>}))} footer={<button onClick={()=>onSelect(row)} className="mt-3 border-t border-[#E5E5E5] pt-3 text-[13px] font-medium text-[#000091]">Consulter la fiche →</button>} />)}
      {!sorted.length && <p>Aucun résultat. <button onClick={clear} className="text-[#000091] underline">Tout effacer</button></p>}
    </div>
    <p role="status" className="sr-only">{sorted.length} résultats</p>
    {current < pages && <div className="flex justify-center border-x border-b border-[#E5E5E5] py-3"><button onClick={()=>setPage(current+1)} className="text-[13px] font-medium text-[#000091] hover:underline">Voir 30 lignes de plus</button></div>}
  </div>;
}
