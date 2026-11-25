import type { ReactNode } from "react";
import { RiChat3Line, RiLineChartLine, RiInformationLine } from "@remixicon/react";

// Transpositions React des composants Vue officiels de @datagouv/components-next.
export function DatasetKeyword({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center rounded-xl bg-[#eeeeee] px-2 py-0.5 text-xs text-[#161616]">{children}</span>;
}

export function DatasetMetadata({ items }: { items: [string, ReactNode][] }) {
  return <dl className="space-y-4">{items.map(([label, value]) => <div key={label}><dt className="mb-1 text-sm font-bold">{label}</dt><dd className="text-sm text-[#666666]">{value}</dd></div>)}</dl>;
}

export function DatasetQuality({ score }: { score: number }) {
  const percent = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return <details className="group relative text-sm text-[#666666]">
    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 rounded px-1 py-1 hover:bg-[#eeeeee] focus-visible:outline-2 focus-visible:outline-[#000091] [&::-webkit-details-marker]:hidden"><RiInformationLine aria-hidden="true" size={16}/><span>Métadonnées :</span><span role="meter" aria-label={`Qualité des métadonnées : ${percent >= 67 ? "bon" : "à améliorer"}`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2.5 w-20 overflow-hidden rounded-lg border border-[#ddd] bg-[#f5f5f5]"><span className={`block h-full rounded-lg ${percent >= 67 ? "bg-[#18753c]" : "bg-[#929292]"}`} style={{width:`${percent}%`}}/></span><span>{percent} %</span></summary>
    <div className="mt-2 max-w-sm rounded border border-[#ddd] bg-white p-3 text-xs leading-5"><strong className="text-[#161616]">Qualité des métadonnées</strong><p>Ce score concerne la documentation du jeu. Il ne mesure pas l’exactitude des données.</p><p className="mt-2">Exemple de démonstration : les critères détaillés restent à raccorder.</p></div>
  </details>;
}

export function DatasetStat({ title, value }: { title: string; value: string }) {
  return <div><p className="mb-1 text-sm">{title}</p><p className="text-[2rem] font-extrabold leading-none">{value}</p></div>;
}

export function DatasetContentCard({ title, description, author, date, href, type = "reuse" }: { title: string; description: string; author: string; date: string; href: string; type?: "reuse" | "discussion" }) {
  const Icon = type === "discussion" ? RiChat3Line : RiLineChartLine;
  return <article className="relative border border-[#ddd] bg-white p-4 hover:bg-[#f6f6f6] focus-within:outline-2 focus-within:outline-[#000091]">
    <h3 className="text-base font-bold"><a href={href} className="flex items-start gap-1 text-[#161616]"><Icon aria-hidden="true" size={16} className="mt-1 shrink-0"/>{title}<span className="absolute inset-0"/></a></h3>
    <p className="mt-1 text-sm text-[#666666]">{author} · {date}</p><p className="mt-2 text-sm leading-6 text-[#666666]">{description}</p>
  </article>;
}
