import type { Metadata } from "next";
import {
  RiArrowDownSLine,
  RiAddLine,
  RiDeleteBinLine,
  RiSaveLine,
} from "@remixicon/react";

export const metadata: Metadata = {
  title: "Points de contact - Prototype Lab",
  description: "Prototype de gestion des attributions et points de contact.",
};

type AttributionProps = {
  name: string;
  role?: "CONTACT" | "ÉDITEUR";
  email?: string;
  expanded?: boolean;
};

function RoleBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-[5px] bg-[#e3e8fd] px-3 py-1 text-[17px] font-bold leading-6 text-[#0063cb]">
      {children}
    </span>
  );
}

function Attribution({ name, role, email, expanded }: AttributionProps) {
  return (
    <section className="space-y-3">
      <p className="text-[22px] leading-8 text-[#1e1e1e]">
        Choisissez l&apos;attribution avec laquelle vous voulez publier
      </p>

      <div>
        <button
          type="button"
          aria-expanded={expanded}
          className="flex min-h-20 w-full items-center border-b-[3px] border-[#2a5db0] bg-[#eeeeee] px-8 text-left text-[#3a3a3a] shadow-[0_3px_12px_rgba(0,0,0,0.08)]"
        >
          <span className="min-w-0 flex-1 truncate text-[22px] leading-8">
            {name}
          </span>
          <RiDeleteBinLine
            aria-label={`Supprimer ${name}`}
            className="mr-10 h-6 w-6 shrink-0 text-[#172638]"
          />
          <RiArrowDownSLine
            aria-hidden="true"
            className={`h-6 w-6 shrink-0 text-[#172638] transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded ? (
          <div className="bg-[#f6f6f6] px-6 pb-6 pt-8">
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <label className="space-y-3 text-[21px] leading-7">
                <span>
                  Rôle <span className="text-[#000091]">*</span>
                </span>
                <span className="flex h-20 items-center border-b-[3px] border-[#3a3a3a] bg-[#eeeeee] px-8 text-[22px] text-[#3a3a3a]">
                  <span className="flex-1">Contact</span>
                  <RiArrowDownSLine aria-hidden="true" className="h-6 w-6" />
                </span>
              </label>

              <label className="space-y-3 text-[21px] leading-7">
                <span>
                  Nom <span className="text-[#000091]">*</span>
                </span>
                <input aria-label="Nom" placeholder="ex: le nom du service" className="h-20 w-full border-0 border-b-[3px] border-[#3a3a3a] bg-[#eeeeee] px-8 text-[22px] text-[#3a3a3a] outline-none placeholder:italic placeholder:text-[#6a6a6a] focus:border-[#000091]" />
              </label>

              <label className="space-y-3 text-[21px] leading-7">
                <span>E-mail</span>
                <input aria-label="E-mail" placeholder="contact@organisation.org" className="h-20 w-full border-0 border-b-[3px] border-[#3a3a3a] bg-[#eeeeee] px-8 text-[22px] text-[#3a3a3a] outline-none placeholder:italic placeholder:text-[#6a6a6a] focus:border-[#000091]" />
              </label>

              <label className="space-y-3 text-[21px] leading-7">
                <span>Lien</span>
                <input aria-label="Lien" placeholder="https://..." className="h-20 w-full border-0 border-b-[3px] border-[#3a3a3a] bg-[#eeeeee] px-8 text-[22px] text-[#3a3a3a] outline-none placeholder:italic placeholder:text-[#6a6a6a] focus:border-[#000091]" />
              </label>
            </div>

            <button className="mt-12 inline-flex h-16 items-center gap-3 bg-[#000091] px-8 text-[17px] font-bold text-white hover:bg-[#1212ff]">
              <RiSaveLine aria-hidden="true" className="h-5 w-5" />
              Enregistrer
            </button>
          </div>
        ) : role ? (
          <div className="space-y-4 px-4 pt-4 text-[21px] leading-8 text-[#3a3a3a]">
            <p className="flex items-center gap-2">
              <span>Rôle:</span> <RoleBadge>{role}</RoleBadge>
            </p>
            {email ? <p>E-mail de contact : {email}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function PointsDeContactPage() {
  return (
    <main className="min-h-dvh bg-white px-5 py-10 text-[#1e1e1e] sm:px-8">
      <div className="mx-auto w-full max-w-[78rem]">
        <h1 className="mb-8 text-[20px] font-extrabold uppercase leading-7 tracking-[0.02em]">
          Attributions et points de contact
        </h1>

        <div className="space-y-9">
          <Attribution name="sandre@sandre.eaufrance.fr" role="CONTACT" email="sandre@sandre.eaufrance.fr" />
          <Attribution name="IGN" role="ÉDITEUR" />
          <Attribution name="ST SANDRE" role="ÉDITEUR" />
          <Attribution name="Nouvelle attribution" expanded />
        </div>

        <button className="mt-8 inline-flex h-16 items-center gap-3 border-2 border-[#1e1e1e] bg-white px-8 text-[17px] font-medium hover:bg-[#f6f6f6]">
          <RiAddLine aria-hidden="true" className="h-5 w-5" />
          Nouvelle attribution
        </button>
      </div>
    </main>
  );
}
