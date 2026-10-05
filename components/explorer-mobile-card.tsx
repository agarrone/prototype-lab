"use client";
import { useState, type ReactNode } from "react";
import { RiArrowDownSLine } from "@remixicon/react";

export function ExplorerMobileCard({ fields, footer }: { fields: { key: string; label: string; icon: ReactNode; content: ReactNode }[]; footer?: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="rounded border border-[#E5E5E5] bg-white p-3"><dl className="space-y-3">{(expanded ? fields : fields.slice(0,4)).map(field=><div key={field.key} className="relative space-y-1"><dt className="flex items-center gap-1 text-[12px] leading-4 text-[#666666]">{field.icon}<span className="truncate">{field.label}</span></dt><dd className="pl-5">{field.content}</dd></div>)}</dl>{fields.length>4 && <button type="button" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded} className="mt-3 flex items-center gap-1 text-[13px] font-bold leading-5 text-[#161616]"><RiArrowDownSLine aria-hidden className={`h-3.5 w-3.5 ${expanded ? "rotate-180" : ""}`} />{expanded ? "Réduire" : `+ ${fields.length-4} champs`}</button>}{footer}</article>;
}
