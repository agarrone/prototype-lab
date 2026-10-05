import { useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";
export type DateRange = { min: string; max: string; mode: string };
export default function TableDateFilter({ range, onChange, onClose }: { range: DateRange; onChange: (range: DateRange) => void; onClose: () => void }) {
  const [month, setMonth] = useState(() => new Date(`${range.min || "2001-01-01"}T12:00:00`));
  const [modeOpen, setModeOpen] = useState(false);
  const [target, setTarget] = useState<"min" | "max">("min");
  const year = month.getFullYear(), index = month.getMonth();
  const offset = (new Date(year,index,1).getDay()+6)%7;
  const length = new Date(year,index+1,0).getDate();
  const labels: Record<string,string> = {before:"Avant",after:"Après",between:"Entre"};
  const invalid = !!range.min && !!range.max && range.min > range.max;
  return <>
    <div className="relative border-b border-[#E5E5E5]"><button aria-expanded={modeOpen} onClick={()=>setModeOpen(!modeOpen)} className="flex h-8 w-full items-center justify-between px-2 font-medium hover:bg-[#f6f6f6]">{labels[range.mode]}<RiArrowDownSLine className="h-3.5 w-3.5" /></button>{modeOpen && <div className="absolute inset-x-1 top-8 z-10 rounded border border-[#E5E5E5] bg-white shadow-lg">{Object.entries(labels).map(([mode,label])=><button key={mode} className="block h-8 w-full px-2 text-left hover:bg-[#f6f6f6]" onClick={()=>{onChange({...range,mode,max:""});setModeOpen(false);setTarget("min");}}>{label}</button>)}</div>}</div>
    <label className="flex h-8 items-center border-b border-[#E5E5E5] px-2"><input aria-label="Entrer une date" type="date" value={range.min} onFocus={()=>setTarget("min")} onChange={e=>onChange({...range,min:e.target.value})} className="w-full bg-transparent text-[12px] outline-none" /></label>
    {range.mode === "between" && <label className="flex h-8 items-center border-b border-[#E5E5E5] px-2"><input aria-label="Entrer une date de fin" type="date" value={range.max} onFocus={()=>setTarget("max")} onChange={e=>onChange({...range,max:e.target.value})} className="w-full bg-transparent text-[12px] outline-none" /></label>}
    <div className="p-2 pt-1.5"><div className="mb-1.5 flex h-7 items-center justify-between"><span className="rounded border border-[#E5E5E5] px-2 py-1 font-medium">{month.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</span><div className="flex gap-1"><button aria-label="Mois précédent" className="h-6 w-6 rounded hover:bg-[#eeeeee]" onClick={()=>setMonth(new Date(year,index-1,1))}>‹</button><button aria-label="Mois suivant" className="h-6 w-6 rounded hover:bg-[#eeeeee]" onClick={()=>setMonth(new Date(year,index+1,1))}>›</button></div></div>
      <div className="mb-1 grid grid-cols-7 text-center text-[11px]">{["Lu","Ma","Me","Je","Ve","Sa","Di"].map(day=><span key={day} className="h-5">{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-0.5">{Array.from({length:Math.ceil((offset+length)/7)*7},(_,i)=>{const date=new Date(year,index,i-offset+1);const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;return <button key={iso} aria-label={date.toLocaleDateString("fr-FR")} aria-pressed={iso===range.min || iso===range.max} className={`h-6 rounded text-center ${iso===range.min || iso===range.max ? "bg-[#000091] text-white" : date.getMonth()!==index ? "text-[#929292]" : "hover:bg-[#eeeeee]"}`} onClick={()=>{onChange({...range,[target]:iso});if(range.mode==="between" && target==="min")setTarget("max");}}>{date.getDate()}</button>;})}</div>
      {invalid && <p role="alert" className="mt-2 text-[#ce0500]">La date de fin doit suivre la date de début.</p>}
      <div className="mt-2 flex justify-end gap-2 border-t border-[#E5E5E5] pt-2"><button className="h-6 rounded px-2 hover:bg-[#eeeeee]" onClick={()=>onChange({...range,min:"",max:""})}>Effacer</button><button disabled={invalid} className="h-6 rounded bg-[#000091] px-2 font-medium text-white disabled:opacity-40" onClick={onClose}>Appliquer</button></div>
    </div>
  </>;
}
