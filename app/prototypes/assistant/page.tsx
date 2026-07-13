"use client";

import Link from "next/link";
import { useState } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightSLine,
  RiArrowUpLine,
  RiBrainLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiDashboard2Line,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiFilter3Line,
  RiInformationLine,
  RiRefreshLine,
  RiSparkling2Line,
  RiThumbDownLine,
  RiThumbUpLine,
  RiWrenchLine,
} from "@remixicon/react";
import styles from "./page.module.css";

type SectionId = "overview" | "messages" | "actions" | "data" | "states" | "composer";

const sections: { id: SectionId; label: string; count: number }[] = [
  { id: "overview", label: "Overview", count: 1 },
  { id: "messages", label: "Messages", count: 4 },
  { id: "actions", label: "Actions", count: 5 },
  { id: "data", label: "Data displays", count: 3 },
  { id: "states", label: "System states", count: 5 },
  { id: "composer", label: "Composer", count: 3 },
];

const chartData = [
  ["ODbL", 43820],
  ["Etalab 2.0", 31140],
  ["Licence ouverte", 18990],
  ["CC-BY", 9740],
] as const;

function Disclosure({ type, title, defaultOpen = false, children }: { type: "reasoning" | "tools"; title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = type === "reasoning" ? RiBrainLine : RiWrenchLine;
  return (
    <div className={styles.disclosure} data-open={isOpen}>
      <button type="button" className={styles.disclosureSummary} onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen}>
        <span><Icon /> {title}</span>
        <RiArrowRightSLine className={styles.disclosureArrow} />
      </button>
      <div className={styles.disclosureContent}><div>{children}</div></div>
    </div>
  );
}

function ToolSteps({ quality = false }: { quality?: boolean }) {
  return (
    <div className={styles.toolList}>
      <p className={styles.toolItem}><span>1.</span><span><strong>Inspecter le schéma</strong> — Identifier les colonnes et leurs types.</span></p>
      <p className={styles.toolItem}><span>2.</span><span><strong>Exécuter la requête SQL</strong> — {quality ? "Classer les jeux de données par qualité." : "Compter et classer les licences."}</span></p>
    </div>
  );
}

function SqlCode({ quality = false }: { quality?: boolean }) {
  const [copied, setCopied] = useState(false);
  const sql = quality
    ? "SELECT title, quality_score\nFROM data\nWHERE quality_score IS NOT NULL\nORDER BY quality_score DESC\nLIMIT 10;"
    : "SELECT licence, COUNT(*) AS total\nFROM data\nGROUP BY licence\nORDER BY total DESC\nLIMIT 10;";

  async function copySql() {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className={styles.sqlBlock}>
      <div className={styles.sqlHeader}>
        <span>SQL exécuté</span>
        <button type="button" onClick={() => void copySql()} aria-label="Copier la requête SQL" title="Copier la requête SQL"><RiFileCopyLine />{copied ? <span>Copié</span> : null}</button>
      </div>
      <pre>{quality ? <><i>SELECT</i> title, quality_score{"\n"}<i>FROM</i> <b>data</b>{"\n"}<i>WHERE</i> quality_score <em>IS NOT NULL</em>{"\n"}<i>ORDER BY</i> quality_score <em>DESC</em>{"\n"}<i>LIMIT</i> <u>10</u>;</> : <><i>SELECT</i> licence, <strong>COUNT</strong>(*) <i>AS</i> total{"\n"}<i>FROM</i> <b>data</b>{"\n"}<i>GROUP BY</i> licence{"\n"}<i>ORDER BY</i> total <em>DESC</em>{"\n"}<i>LIMIT</i> <u>10</u>;</>}</pre>
    </div>
  );
}

function FeedbackButtons() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [detailsSent, setDetailsSent] = useState(false);

  function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDetailsSent(true);
    setIsModalOpen(false);
  }

  return (
    <>
      {feedback ? (
        <div className={styles.feedbackConfirmation} role="status">
          <span>{detailsSent ? "Merci pour vos précisions !" : "Merci pour votre retour !"}</span>
          {!detailsSent ? (
            <button type="button" onClick={() => setIsModalOpen(true)}>Partager plus de détails</button>
          ) : null}
        </div>
      ) : (
        <div className={styles.feedback}>
          <button onClick={() => setFeedback("up")} aria-label="Réponse utile">
            <RiThumbUpLine />
          </button>
          <button onClick={() => setFeedback("down")} aria-label="Réponse inutile">
            <RiThumbDownLine />
          </button>
        </div>
      )}

      {isModalOpen ? (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setIsModalOpen(false)}>
          <div className={styles.feedbackModal} role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div><h2 id="feedback-modal-title">Partager plus de détails</h2><p>Votre retour nous aide à améliorer les réponses.</p></div>
              <button type="button" onClick={() => setIsModalOpen(false)} aria-label="Fermer"><RiCloseLine /></button>
            </div>
            <form onSubmit={submitDetails}>
              <label htmlFor="feedback-details">Votre commentaire</label>
              <textarea id="feedback-details" value={details} onChange={(event) => setDetails(event.target.value)} rows={5} placeholder="Qu’est-ce qui était utile ou pourrait être amélioré ?" autoFocus />
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)}>Annuler</button>
                <button type="submit" className={styles.primaryButton} disabled={!details.trim()}>Envoyer</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AssistantAnswer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={styles.answerGroup}>
      <div className={styles.answerCard}>
        <p>
          <strong>ODbL</strong> est la licence la plus utilisée avec <strong>43 820 jeux de données</strong>, soit 34 % du catalogue.
        </p>
        {!compact ? (
          <ul>
            <li>Etalab 2.0 arrive en deuxième position avec 31 140 jeux de données.</li>
            <li>Les quatre premières licences couvrent 81 % du catalogue.</li>
          </ul>
        ) : null}
      </div>
      <FeedbackButtons />
    </div>
  );
}

function FilterProposal() {
  const [applied, setApplied] = useState(false);
  return (
    <div className={styles.proposal}>
      <p className={styles.overline}>Filtre proposé</p>
      <span className={styles.filterChip}>Département = Rhône</span>
      <button className={applied ? styles.appliedButton : styles.primaryButton} onClick={() => setApplied(true)}>
        {applied ? <RiCheckboxCircleLine /> : <RiFilter3Line />}
        {applied ? "Filtre appliqué" : "Appliquer dans le tableau"}
      </button>
    </div>
  );
}

function MiniChart() {
  const max = chartData[0][1];
  return (
    <div className={styles.chart}>
      <div className={styles.chartHeader}>
        <div><strong>Licences les plus fréquentes</strong><span>Nombre de jeux de données</span></div>
      </div>
      <div className={styles.bars}>
        {chartData.map(([label, value]) => (
          <div className={styles.barRow} key={label}>
            <span>{label}</span>
            <div><i style={{ width: `${(value / max) * 100}%` }} /></div>
            <strong>{new Intl.NumberFormat("fr-FR").format(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenUsageToggle() {
  return (
    <details className={styles.infoToggle}>
      <summary className={styles.iconSummary} aria-label="1 248 tokens utilisés" title="Tokens utilisés">
        <RiDashboard2Line />
      </summary>
      <div className={styles.infoPopover}>
        <p>Nombre de tokens utilisés</p>
        <div className={styles.tokenRow}><span>Prompt</span><span>936</span></div>
        <div className={styles.tokenRow}><span>Réponse</span><span>312</span></div>
        <div className={`${styles.tokenRow} ${styles.tokenTotal}`}><strong>Total</strong><strong>1 248</strong></div>
      </div>
    </details>
  );
}

function ModelInfoToggle() {
  return (
    <details className={styles.infoToggle}>
      <summary className={styles.modelSummary} aria-label="Informations sur le modèle gpt-oss-120b" title="Informations sur le modèle">
        gpt-oss-120b
      </summary>
      <div className={`${styles.infoPopover} ${styles.modelPopover}`}>
        Modèle open source exécuté sur une infrastructure opérée par la DINUM.
      </div>
    </details>
  );
}

function Composer({ quiet = false }: { quiet?: boolean }) {
  const [value, setValue] = useState("");
  return (
    <div className={styles.composerWrap}>
      <div className={styles.composer}>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Posez une question sur les données" rows={quiet ? 2 : 4} />
        <div className={styles.composerFooter}>
          <div>
            <TokenUsageToggle />
            <ModelInfoToggle />
          </div>
          <button disabled={!value.trim()} aria-label="Envoyer"><RiArrowUpLine /></button>
        </div>
      </div>
      <p className={styles.disclaimer}>L’assistant peut faire des erreurs. <span className={styles.disclaimerLink}><Link href="/a-propos">En savoir plus</Link><RiExternalLinkLine /></span></p>
    </div>
  );
}

function LiveAssistant() {
  return (
    <aside className={styles.livePanel}>
      <div className={styles.liveHeader}>
        <div><span className={styles.avatar}><RiSparkling2Line /></span><div><strong>Assistant</strong><span>Catalogue des jeux de données</span></div></div>
        <button aria-label="Fermer"><RiCloseLine /></button>
      </div>
      <div className={styles.conversation}>
        <div className={styles.userMessage}>Quelles sont les licences les plus fréquentes ?</div>
        <Disclosure type="reasoning" title="Raisonnement">
          <p>Identifier la colonne de licence, compter les valeurs et classer les résultats.</p>
        </Disclosure>
        <Disclosure type="tools" title="Tools utilisés">
          <ToolSteps />
          <SqlCode />
        </Disclosure>
        <AssistantAnswer compact />
        <MiniChart />
        <div className={styles.userMessage}>Garde uniquement les données du Rhône.</div>
        <div className={styles.answerCard}>J’ai identifié une valeur correspondant au Rhône. Voulez-vous appliquer ce filtre au tableau ?</div>
        <FilterProposal />
      </div>
      <Composer quiet />
    </aside>
  );
}

function Specimen({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <article className={styles.specimen}>
      <div className={styles.specimenHeader}><span>{label}</span>{note ? <small>{note}</small> : null}</div>
      <div className={styles.specimenCanvas}>{children}</div>
    </article>
  );
}

function ComponentCatalogue({ active }: { active: SectionId }) {
  if (active === "overview") {
    return (
      <div className={styles.sectionContent}>
        <div className={styles.sectionIntro}><p>Assistant UI inventory</p><h1>A clearer way to inspect every interaction.</h1><span>This isolated project documents the current assistant interface without running the assistant itself.</span></div>
        <div className={styles.principles}>
          <div><strong>Answer first</strong><span>Keep the useful result visible before technical details.</span></div>
          <div><strong>Actions in context</strong><span>Filters and sorting connect directly to the table.</span></div>
          <div><strong>Progressive disclosure</strong><span>Reasoning and SQL remain optional.</span></div>
        </div>
      </div>
    );
  }

  if (active === "messages") {
    return <div className={styles.specimenGrid}>
      <Specimen label="User message"><div className={styles.userMessage}>Quels producteurs publient le plus ?</div></Specimen>
      <Specimen label="Assistant answer" note="Default"><AssistantAnswer /></Specimen>
      <Specimen label="Rich markdown"><div className={styles.answerCard}><h3>Qualité du catalogue</h3><p>Le score moyen est de <strong>0,71</strong>.</p><ol><li>Documentation</li><li>Mise à jour</li><li>Formats ouverts</li></ol></div></Specimen>
      <Specimen label="Technical disclosure"><div className={styles.stack}><Disclosure type="reasoning" title="Raisonnement" defaultOpen><p>Comparer les scores non nuls puis classer les résultats.</p></Disclosure><Disclosure type="tools" title="Tools utilisés"><ToolSteps quality /><SqlCode quality /></Disclosure></div></Specimen>
    </div>;
  }

  if (active === "actions") {
    return <div className={styles.specimenGrid}>
      <Specimen label="Filter proposal"><FilterProposal /></Specimen>
      <Specimen label="Sort proposal"><div className={styles.proposal}><p className={styles.overline}>Tri proposé</p><span className={styles.filterChip}>Score de qualité · décroissant</span><button className={styles.primaryButton}>Trier le tableau</button></div></Specimen>
      <Specimen label="Clarification choices"><div className={styles.choices}><p>Quelle valeur souhaitez-vous utiliser ?</p><button><span>Rhône</span><strong>4 820</strong></button><button><span>Métropole de Lyon</span><strong>1 204</strong></button><button><span>Auvergne-Rhône-Alpes</span><strong>8 731</strong></button></div></Specimen>
      <Specimen label="Feedback"><div><p className={styles.muted}>Cette réponse vous a-t-elle aidé ?</p><FeedbackButtons /></div></Specimen>
    </div>;
  }

  if (active === "data") {
    return <div className={styles.specimenGrid}>
      <Specimen label="Chart" note="Interactive result"><MiniChart /></Specimen>
      <Specimen label="Inline metrics"><div className={styles.metrics}><div><strong>127 872</strong><span>Jeux de données</span></div><div><strong>94</strong><span>Licences</span></div><div><strong>0,71</strong><span>Qualité moyenne</span></div></div></Specimen>
      <Specimen label="Result table"><div className={styles.resultTable}><div><strong>Producteur</strong><strong>Publications</strong></div><div><span>INSEE</span><span>12 481</span></div><div><span>data.gouv.fr</span><span>9 234</span></div><div><span>IGN</span><span>6 820</span></div></div></Specimen>
    </div>;
  }

  if (active === "states") {
    return <div className={styles.specimenGrid}>
      <Specimen label="Loading"><div className={styles.loading}><span>Analyse de la demande</span><span>Choix des outils</span><span>Exécution locale</span><span>Rédaction</span></div></Specimen>
      <Specimen label="Empty state"><div className={styles.empty}><strong>Assistant d’exploration</strong><p>Posez une question sur les données.</p><div><button>Quelles sont les colonnes ?</button><button>Résume ce fichier</button></div></div></Specimen>
      <Specimen label="Error"><div className={styles.statusMessage}><RiErrorWarningLine /><div><strong>Analyse interrompue</strong><p>La requête n’a pas pu être exécutée. Reformulez la question ou réessayez.</p><button><RiRefreshLine /> Réessayer</button></div></div></Specimen>
      <Specimen label="Ambiguous"><div className={styles.statusMessage}><RiInformationLine /><div><strong>Une précision est nécessaire</strong><p>Deux colonnes peuvent correspondre au « producteur ».</p></div></div></Specimen>
      <Specimen label="Success"><div className={styles.success}><RiCheckboxCircleLine /> Filtre appliqué au tableau</div></Specimen>
    </div>;
  }

  return <div className={styles.specimenGrid}>
    <Specimen label="Default composer"><Composer /></Specimen>
    <Specimen label="Compact composer"><Composer quiet /></Specimen>
    <Specimen label="Disabled submit"><div className={styles.composer}><textarea placeholder="Posez une question" rows={3} disabled /><div className={styles.composerFooter}><div><TokenUsageToggle /><ModelInfoToggle /></div><button disabled><RiArrowUpLine /></button></div></div></Specimen>
  </div>;
}

export default function AssistantPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [showPreview, setShowPreview] = useState(true);

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div><Link href="/"><RiArrowLeftLine /> Prototype Lab</Link><span className={styles.divider} /><strong>Assistant</strong><span className={styles.badge}>UI only</span></div>
        <button className={styles.previewToggle} onClick={() => setShowPreview((visible) => !visible)}>{showPreview ? "Hide" : "Show"} live preview</button>
      </header>
      <div className={`${styles.workspace} ${!showPreview ? styles.previewHidden : ""}`}>
        <nav className={styles.navigation} aria-label="Assistant components">
          <p>Component inventory</p>
          {sections.map((section) => <button key={section.id} className={activeSection === section.id ? styles.activeNav : ""} onClick={() => setActiveSection(section.id)}><span>{section.label}</span><small>{section.count}</small></button>)}
          <div className={styles.navNote}><RiInformationLine /><p>This project contains no agent logic or API calls.</p></div>
        </nav>
        <section className={styles.catalogue}><ComponentCatalogue active={activeSection} /></section>
        {showPreview ? <LiveAssistant /> : null}
      </div>
    </main>
  );
}
