"use client";

import Link from "next/link";
import "./embedded.css";
import { useEffect, useRef, useState } from "react";
import { RiArrowRightSLine, RiFullscreenExitLine, RiFullscreenLine } from "@remixicon/react";
import FuelExplorer from "../explorateur-carburants/fuel-explorer";

export default function ExplorateurCarburantsInAPage() {
  const explorerRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(document.fullscreenElement === explorerRef.current);
    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  useEffect(() => {
    if (!isImmersive) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsImmersive(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isImmersive]);

  const toggleFullscreen = async () => {
    if (window.matchMedia("(max-width: 767px)").matches) setIsImmersive((current) => !current);
    else if (document.fullscreenElement) await document.exitFullscreen();
    else await explorerRef.current?.requestFullscreen();
  };

  return (
    <main className="min-h-dvh bg-white text-[#161616]">
      <div className="mx-auto w-full max-w-[90rem] px-4 pb-16 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <nav aria-label="Fil d’Ariane" className="text-[12px] leading-5">
          <ol className="flex flex-wrap items-center gap-1 text-[#666666]">
            <li className="flex items-center gap-1">
              <Link href="/" className="underline underline-offset-2 hover:text-[#000091]">
                Exploration
              </Link>
              <RiArrowRightSLine aria-hidden="true" className="h-4 w-4" />
            </li>
            <li aria-current="page" className="text-[#161616]">
              Prix des carburants
            </li>
          </ol>
        </nav>

        <header className="max-w-[58rem] pb-7 pt-6 sm:pb-10 sm:pt-8">
          <h1 className="text-[40px] font-extrabold leading-[48px] tracking-[-0.01em] max-md:text-[32px] max-md:leading-10">
            Explorer les prix des carburants
          </h1>
          <p className="mt-4 max-w-[52rem] text-[17px] leading-7 text-[#3a3a3a] sm:mt-5 sm:text-[20px] sm:leading-8">
            Comparez les prix des carburants, recherchez une adresse et consultez la disponibilité des carburants dans les stations près de vous.
          </p>
        </header>

        <section ref={explorerRef} aria-label="Explorateur des prix des carburants" className={`${isImmersive ? "fixed inset-0 z-[300] h-[100dvh]" : "-mx-4 sm:mx-0"} overflow-hidden border-y border-[#e5e5e5] bg-white sm:border fullscreen:h-screen fullscreen:border-0 [&:fullscreen_.fuel-embed-frame]:h-[calc(100dvh-49px)] ${isImmersive ? "[&_.fuel-embed-frame]:h-[calc(100dvh-49px)]" : ""}`}>
          <div className="relative z-40 flex min-h-12 items-center justify-between gap-4 border-b border-[#e5e5e5] bg-[#f6f6f6] px-4 py-2">
            <strong className="text-[14px] font-medium">Explorateur des prix des carburants</strong>
            <button type="button" onClick={toggleFullscreen} className="inline-flex h-8 items-center gap-2 px-2 text-[13px] font-medium text-[#000091] hover:bg-[#e3e3fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000091]">
              {isFullscreen || isImmersive ? <RiFullscreenExitLine aria-hidden="true" className="h-4 w-4" /> : <RiFullscreenLine aria-hidden="true" className="h-4 w-4" />}
              <span className="sm:hidden">{isImmersive ? "Fermer" : "Ouvrir la carte"}</span>
              <span className="hidden sm:inline">{isFullscreen ? "Quitter le plein écran" : "Plein écran"}</span>
            </button>
          </div>
          <div className="fuel-embed-frame"><FuelExplorer embedded /></div>
        </section>

        <div className="mt-10 border-t border-[#e5e5e5] pt-2 sm:mt-12">
          <section className="max-w-[58rem] py-6">
            <h2 className="text-[28px] font-bold">À propos des données</h2>
            <p className="mt-4 text-[16px] leading-7 text-[#3a3a3a]">Sélectionnez un carburant pour comparer les prix des stations sur la carte. Les informations sur les prix présentent la moyenne et la médiane de chaque carburant, calculées sur l’ensemble des stations disposant d’un prix, hors ruptures.</p>
            <p className="mt-4 text-[14px] leading-6 text-[#666]">Les sources de données utilisées pour réaliser cette application <a className="text-[#000091] underline" href="https://www.data.gouv.fr/datasets/prix-des-carburants-en-france-flux-instantane-v2-amelioree/">sont disponibles sur data.gouv.fr</a>. Pour plus d’informations, <a className="text-[#000091] underline" href="https://www.prix-carburants.gouv.fr/">rendez-vous sur le site officiel</a>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
