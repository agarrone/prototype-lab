"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { RiArrowLeftLine, RiRestartLine } from "@remixicon/react";
import styles from "./page.module.css";

const studies = [
  {
    id: "draw",
    index: "01",
    title: "Construction",
    description: "Le signe apparaît comme s’il était tracé par un seul signal continu.",
  },
  {
    id: "assemble",
    index: "02",
    title: "Assemblage",
    description: "Les six cubes convergent vers le module central et composent la marque.",
  },
  {
    id: "signal",
    index: "03",
    title: "Signal",
    description: "Une impulsion traverse la structure et révèle ses connexions.",
  },
  {
    id: "signature",
    index: "04",
    title: "Signature",
    description: "La chorégraphie originale réorganise les modules avant de retrouver la signature finale.",
  },
] as const;

const pieces = [
  ["top", "0px", "-44px"],
  ["upperLeft", "-42px", "-22px"],
  ["upperRight", "42px", "-22px"],
  ["lowerLeft", "-42px", "22px"],
  ["lowerRight", "42px", "22px"],
  ["bottom", "0px", "44px"],
  ["center", "0px", "0px"],
] as const;

function LogoImage({ className = "" }: { className?: string }) {
  return (
    // The Figma asset is monochromatized with CSS so its geometry stays exact.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/prototypes/animation-logo.svg"
      alt=""
      className={`${styles.logoImage} ${className}`}
      draggable={false}
    />
  );
}

function AnimationPreview({ id }: { id: (typeof studies)[number]["id"] }) {
  if (id === "signature") {
    return (
      // This preserves every frame and pause of the supplied 5.66 s reference loop.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/prototypes/animation-signature.gif"
        alt=""
        className={styles.signatureGif}
        aria-hidden="true"
        draggable={false}
      />
    );
  }

  if (id === "assemble") {
    return (
      <div className={styles.assembly} aria-hidden="true">
        {pieces.map(([piece, x, y], index) => (
          <div
            key={piece}
            className={`${styles.piece} ${styles[piece]}`}
            style={{ "--x": x, "--y": y, "--piece-delay": `${index * 70}ms` } as CSSProperties}
          >
            <LogoImage />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.logoStack} aria-hidden="true">
      <LogoImage className={styles.ghostLogo} />
      <LogoImage className={id === "draw" ? styles.drawLogo : styles.signalLogo} />
    </div>
  );
}

export default function AnimationPage() {
  const [replayKey, setReplayKey] = useState(0);
  const [speed, setSpeed] = useState("normal");

  return (
    <main
      className={styles.page}
      style={{
        "--duration": speed === "slow" ? "4.8s" : speed === "fast" ? "2.2s" : "3.4s",
      } as CSSProperties}
    >
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <RiArrowLeftLine aria-hidden="true" />
          Prototype Lab
        </Link>
        <div className={styles.headerActions}>
          <div className={styles.speedControl} aria-label="Animation speed">
            {(["slow", "normal", "fast"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={speed === value ? styles.activeSpeed : ""}
                onClick={() => setSpeed(value)}
              >
                {value === "slow" ? "Slow" : value === "normal" ? "Normal" : "Fast"}
              </button>
            ))}
          </div>
          <button type="button" className={styles.replayButton} onClick={() => setReplayKey((key) => key + 1)}>
            <RiRestartLine aria-hidden="true" />
            Replay all
          </button>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>Motion studies · data.gouv.fr</p>
        <h1>One mark, three movements.</h1>
        <p>
          Three black-and-white animation directions based on the modular cube system of the data.gouv.fr logo.
        </p>
      </section>

      <section className={styles.grid} key={replayKey} aria-label="Logo animation studies">
        {studies.map((study) => (
          <article className={styles.card} key={study.id}>
            <div className={styles.preview}>
              <AnimationPreview id={study.id} />
            </div>
            <div className={styles.cardCopy}>
              <span>{study.index}</span>
              <div>
                <h2>{study.title}</h2>
                <p>{study.description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
