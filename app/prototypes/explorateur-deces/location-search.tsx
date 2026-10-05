import { useId, useState } from "react";
import { RiSearchLine } from "@remixicon/react";
import { normalizeName } from "@/lib/deces";

type Option = { value: string; label: string };
export default function LocationSearch({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const display = options.find((option) => option.value === value)?.label ?? value;
  const matches = options.filter((option) => normalizeName(option.label).includes(normalizeName(value)) || option.value === value);
  function choose(option: Option) { onChange(option.value); setOpen(false); setActive(-1); }
  return <div className="relative min-w-0 text-sm" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>{label}</label>
    <div className="relative mt-2"><RiSearchLine aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" /><input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && active >= 0 && matches[active] ? `${id}-${active}` : undefined} autoComplete="off" value={display} placeholder="Rechercher…" onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setActive(-1); setOpen(true); }} onKeyDown={(event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((current) => matches.length ? (current + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length : -1); }
      if (event.key === "Enter" && open && active >= 0 && matches[active]) { event.preventDefault(); choose(matches[active]); }
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setOpen(false); }
    }} className="h-10 w-full min-w-0 rounded border border-[#E5E5E5] bg-[#f6f6f6] pl-9 pr-3 text-[13px] focus-visible:outline-2 focus-visible:outline-[#000091]" /></div>
    {open && <div className="absolute top-full z-50 mt-1 w-full rounded border border-[#E5E5E5] bg-white shadow-lg"><ul id={`${id}-list`} role="listbox" aria-label={label} className="max-h-52 overflow-y-auto py-1">{matches.map((option, index) => <li key={option.value} id={`${id}-${index}`} role="option" aria-selected={active === index} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)} className={`cursor-pointer px-3 py-2 text-[13px] hover:bg-[#ececfe] ${active === index ? "bg-[#ececfe] text-[#000091]" : ""}`}>{option.label}</li>)}</ul>{!matches.length && <p role="status" className="px-3 py-2 text-xs text-[#666666]">Aucune suggestion dans l’échantillon. Vous pouvez rechercher le texte saisi.</p>}</div>}
  </div>;
}
