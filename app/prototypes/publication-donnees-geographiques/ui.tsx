"use client";

import { useState, type ReactNode } from "react";
import { RiCheckLine, RiFileCopyLine, RiInformationLine, RiQuestionLine } from "@remixicon/react";
import type { ServiceStatus } from "@/lib/publication-geo";

export const inputClass = "min-h-10 w-full border-0 border-b-2 border-[#3a3a3a] bg-[#eeeeee] px-4 py-2 text-[14px] text-[#161616] outline-none transition focus:border-[#000091] focus:ring-2 focus:ring-[#ececfe] aria-[invalid=true]:border-[#ce0500]";

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className={`block ${error ? "border-l-2 border-[#ce0500] pl-3" : ""}`}>
      <span className="mb-1 block text-[15px] font-normal text-[#161616]">
        {label} {required ? <span className="text-[#e1000f]">*</span> : null}
      </span>
      {hint ? <span className="mb-2 block text-[12px] leading-5 text-[#666]">{hint}</span> : null}
      {children}
      {error ? <span role="alert" className="mt-2 block text-[12px] leading-5 text-[#ce0500]">{error}</span> : null}
    </label>
  );
}

export function InfoBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 flex gap-4 border-l-4 border-[#6a6af4] bg-[#ececfe] p-4 text-[13px] leading-5">
      <RiInformationLine className="mt-0.5 h-5 w-5 shrink-0 text-[#000091]" />
      <div><p className="font-medium">{title}</p><div className="mt-1 text-[#3a3a3a]">{children}</div></div>
    </div>
  );
}

/** Signale dans l’administration un sujet non arbitré, pour alimenter la discussion d’équipe. */
export function OpenQuestion({ children }: { children: ReactNode }) {
  return (
    <p className="flex gap-2 border-l-2 border-[#c3992a] bg-[#fef7da] px-3 py-2 text-[12px] leading-5 text-[#3a3a3a]">
      <RiQuestionLine className="mt-0.5 h-4 w-4 shrink-0 text-[#716043]" aria-hidden="true" />
      <span><span className="font-medium text-[#716043]">Question ouverte · </span>{children}</span>
    </p>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "info" | "success" | "error" | "external"; children: ReactNode }) {
  const styles = {
    neutral: "bg-[#eee] text-[#161616]",
    info: "bg-[#e3e8fd] text-[#0063cb]",
    success: "bg-[#b8fec9] text-[#18753c]",
    error: "bg-[#ffe9e9] text-[#ce0500]",
    external: "bg-[#fee7fc] text-[#6e445a]",
  }[tone];
  return <span className={`inline-flex items-center px-2 py-1 text-[11px] ${styles}`}>{children}</span>;
}

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  const tone = ({ generating: "info", available: "success", error: "error" } as const)[status];
  const label = { generating: "Génération en cours", available: "Disponible", error: "Erreur" }[status];
  return <Badge tone={tone}>{status === "generating" ? <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-current" aria-hidden="true" /> : null}{label}</Badge>;
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : le retour visuel reste simulé.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div>
      <p className="mb-1 text-[12px] text-[#666]">{label}</p>
      <div className="flex items-stretch">
        <code className="min-w-0 flex-1 break-all border-b-2 border-[#929292] bg-[#eee] px-3 py-2 font-mono text-[12px] text-[#161616]">{value}</code>
        <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 border border-[#000091] px-3 text-[12px] text-[#000091] hover:bg-[#ececfe]" aria-live="polite">
          {copied ? <RiCheckLine className="h-4 w-4" /> : <RiFileCopyLine className="h-4 w-4" />}
          {copied ? "Copiée" : "Copier"}
        </button>
      </div>
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-[#cacafb] border-t-[#000091] ${className}`} aria-hidden="true" />;
}
