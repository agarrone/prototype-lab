"use client";

import { useRef, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiCloseLine,
  RiEditLine,
  RiErrorWarningFill,
  RiEyeLine,
  RiFileAddLine,
  RiFileTextLine,
  RiGlobalLine,
  RiInformationFill,
  RiLink,
  RiQuestionLine,
  RiSaveLine,
  RiServerLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import {
  DEFAULT_FILE_NAME,
  DEFAULT_IMPORT_URL,
  analysisStepsFor,
  createGeoPackageResource,
  createHostedWfs,
  formatCount,
  getServiceErrors,
  hasServiceErrors,
  invalidFileIssues,
  resourceTypeLabels,
  wfsUrl,
  type AnalysisIssue,
  type ExternalWfs,
  type GeoPackageResource,
  type HostedWfs,
  type ImportOrigin,
  type ResourceType,
  type ServiceStatus,
  type SourceLayer,
} from "@/lib/publication-geo";
import { MapPreview } from "./map-preview";
import { PublicDatasetPage, type PublicDataset } from "./public-page";
import { Field, InfoBanner, OpenQuestion, ServiceStatusBadge, Spinner, Badge, inputClass } from "./ui";
import { ExternalWfsReference, ExternalWfsSummary, HostedWfsEditor } from "./wfs-services";

const steps = [
  "Publier des données sur data.gouv.fr",
  "Décrivez votre jeu de données",
  "Ajoutez des fichiers",
  "Créez ou référencez des services WFS",
  "Finalisez la publication",
];

const initialForm: PublicDataset = {
  title: "Inventaire des milieux aquatiques et zones humides du Bas-Rhin",
  acronym: "IMAZH 67",
  description:
    "Ce jeu de données rassemble l’inventaire des milieux aquatiques et des zones humides du Bas-Rhin. Il comprend les zones humides recensées, les cours d’eau et les observations de terrain associées. Les données sont produites par la Direction régionale de l’environnement, de l’aménagement et du logement Grand Est.",
  shortDescription: "Inventaire géographique des zones humides, cours d’eau et observations de terrain du Bas-Rhin.",
  producer: "DREAL Grand Est",
  accessType: "open",
  theme: "Environnement",
  license: "Licence Ouverte / Open Licence version 2.0",
  frequency: "Annuelle",
  tags: "zones humides, cours d’eau, biodiversité, Bas-Rhin",
  temporalStart: "2022-01-01",
  temporalEnd: "2025-12-31",
  spatial: "Bas-Rhin",
  granularity: "Département",
  lineage:
    "Zones humides issues de la photo-interprétation des orthophotographies 2021, complétée par des relevés de terrain. Cours d’eau dérivés du référentiel hydrographique national. Observations saisies par les agents et partenaires naturalistes, puis validées par la DREAL.",
};

type ImportState =
  | { phase: "idle" }
  | { phase: "form"; mode: "upload" | "url"; error?: string }
  | { phase: "analyzing"; origin: ImportOrigin; progress: number }
  | { phase: "failed"; origin: ImportOrigin; issues: AnalysisIssue[] };

const ANALYSIS_STEP_MS = 650;

function geometryIcon(geometry: SourceLayer["geometry"]) {
  return geometry === "Polygone" ? "▰" : geometry === "Ligne" ? "⌁" : "●";
}

function IssueIcon({ level }: { level: AnalysisIssue["level"] }) {
  if (level === "error") return <RiCloseCircleFill className="mt-0.5 h-4 w-4 shrink-0 text-[#ce0500]" aria-label="Erreur bloquante" />;
  if (level === "warning") return <RiErrorWarningFill className="mt-0.5 h-4 w-4 shrink-0 text-[#b34000]" aria-label="Avertissement" />;
  return <RiInformationFill className="mt-0.5 h-4 w-4 shrink-0 text-[#0063cb]" aria-label="Information" />;
}

function AnalysisReport({ issues }: { issues: AnalysisIssue[] }) {
  const count = (level: AnalysisIssue["level"]) => issues.filter((issue) => issue.level === level).length;
  const warnings = count("warning");
  const infos = count("info");
  return (
    <details className="group border-t border-[#ddd] bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-3 text-[13px] [&::-webkit-details-marker]:hidden">
        <RiCheckboxCircleFill className="h-5 w-5 shrink-0 text-[#18753c]" />
        <span className="flex-1"><span className="font-medium">Analyse terminée</span> · aucune erreur bloquante{warnings ? ` · ${warnings} avertissement${warnings > 1 ? "s" : ""}` : ""}{infos ? ` · ${infos} information${infos > 1 ? "s" : ""}` : ""}</span>
        <RiArrowDownSLine className="h-5 w-5 shrink-0 text-[#000091] transition group-open:rotate-180" />
      </summary>
      <ul className="space-y-2 px-5 pb-4 text-[12px] leading-5">
        {issues.map((issue) => <li key={issue.message} className="flex gap-2"><IssueIcon level={issue.level} /><span>{issue.table ? <span className="font-mono">{issue.table} · </span> : null}{issue.message}</span></li>)}
      </ul>
    </details>
  );
}

function LayerSection({ layer, warnings, onChange, open }: { layer: SourceLayer; warnings: AnalysisIssue[]; onChange: (patch: Partial<SourceLayer>) => void; open?: boolean }) {
  return (
    <details open={open} className="group border border-[#ddd] bg-white">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#ececfe] text-[12px] font-medium text-[#000091]">{geometryIcon(layer.geometry)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{layer.label}</span>
          <span className="mt-1 block text-[11px] text-[#666]">{layer.tableName} · {layer.geometry} · {formatCount(layer.featureCount)} objets</span>
        </span>
        {warnings.length ? <span className="hidden sm:inline-flex"><Badge tone="error">{warnings.length} avertissement{warnings.length > 1 ? "s" : ""}</Badge></span> : null}
        <RiArrowDownSLine className="h-5 w-5 shrink-0 text-[#000091] transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-[#ddd] bg-[#f6f6f6] p-4 md:p-5">
        {warnings.map((warning) => <p key={warning.message} className="mb-4 flex gap-2 text-[12px] leading-5"><IssueIcon level={warning.level} />{warning.message}</p>)}
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Libellé de la couche" required><input value={layer.label} onChange={(event) => onChange({ label: event.target.value })} className={inputClass} /></Field>
          <div><p className="mb-1 text-[15px]">Table source</p><p className="min-h-10 bg-[#e3e3e3] px-4 py-2 font-mono text-[13px] text-[#666]">{layer.tableName}</p></div>
          <div className="md:col-span-2"><Field label="Description"><textarea rows={3} value={layer.description} placeholder="Décrivez le contenu de cette couche." onChange={(event) => onChange({ description: event.target.value })} className={inputClass} /></Field></div>
        </div>
        <p className="mt-2 text-[12px] text-[#666]">Ces informations décrivent la couche : elles ne modifient pas les données du GeoPackage.</p>

        <h4 className="mb-3 mt-6 text-[13px] font-medium uppercase">Informations techniques détectées</h4>
        <dl className="flex flex-wrap gap-x-5 gap-y-2 border-y border-[#ddd] bg-white px-3 py-3 text-[12px]">
          <div className="flex gap-1.5"><dt className="text-[#666]">Géométrie :</dt><dd>{layer.geometry}</dd></div>
          <div className="flex gap-1.5"><dt className="text-[#666]">Projection :</dt><dd>{layer.epsg}</dd></div>
          <div className="flex gap-1.5"><dt className="text-[#666]">Objets :</dt><dd>{formatCount(layer.featureCount)}</dd></div>
          <div className="flex gap-1.5"><dt className="text-[#666]">Emprise :</dt><dd>{layer.extent}</dd></div>
        </dl>

        <h4 className="mb-3 mt-6 text-[13px] font-medium uppercase">Schéma attributaire</h4>
        <div className="overflow-x-auto border border-[#ddd] bg-white">
          <table className="w-full min-w-[420px] border-collapse text-left text-[12px]">
            <thead className="bg-[#eee]"><tr><th className="px-3 py-2 font-medium">Colonne</th><th className="px-3 py-2 font-medium">Type de données</th></tr></thead>
            <tbody className="divide-y divide-[#ddd]">{layer.columns.map((column) => <tr key={column.name}><td className="px-3 py-2 font-mono">{column.name}</td><td className="px-3 py-2 text-[#666]">{column.type}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </details>
  );
}

function Header() {
  return (
    <>
      <div className="bg-[#f5f5fe] py-2 text-center text-[12px] text-[#161616]">
        <span className="font-bold">Ceci est un prototype.</span> Les données et actions sont simulées.
      </div>
      <header className="border-b border-[#e5e5e5] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-5 md:px-8">
          <div className="flex items-center gap-5">
            <div className="border-l-2 border-r-2 border-[#161616] px-2 text-[11px] font-extrabold uppercase leading-[1.08] tracking-[-0.02em]">
              République
              <br />française
              <div className="mt-1 text-[7px] font-normal normal-case italic">Liberté · Égalité · Fraternité</div>
            </div>
            <div>
              <div className="text-[20px] font-extrabold tracking-tight text-[#000091]">data.gouv.fr</div>
              <div className="hidden text-[12px] text-[#666] sm:block">La plateforme ouverte des données publiques françaises</div>
            </div>
          </div>
          <div className="hidden items-center gap-5 text-[14px] md:flex">
            <button className="text-[#000091] hover:underline">Publier des données</button>
            <button className="font-medium text-[#000091] hover:underline">DREAL Grand Est</button>
          </div>
        </div>
      </header>
    </>
  );
}

function Stepper({ current }: { current: number }) {
  const nextStep = steps[current];

  return (
    <section className="mb-8 max-w-[760px]" aria-label="Progression de la publication">
      <h1 className="text-[20px] font-medium leading-7 text-[#161616]">
        {steps[current - 1]}
        <span className="mt-1 block text-[12px] font-normal leading-5 text-[#666]">
          Étape {current} sur {steps.length}
        </span>
      </h1>
      <div className="mt-3 grid h-2 grid-cols-5 gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={current}>
        {steps.map((label, index) => (
          <span key={label} className={index < current ? "bg-[#000091]" : "bg-[#e3e3fd]"} aria-hidden="true" />
        ))}
      </div>
      {nextStep ? (
        <p className="mt-3 text-[13px] leading-5 text-[#3a3a3a]">
          <span className="font-medium">Étape suivante :</span> {nextStep}
        </p>
      ) : null}
    </section>
  );
}

function HelpAside({ kind }: { kind: "description" | "files" }) {
  const items = kind === "description"
    ? ["Nommer son jeu de données", "Ajouter un sigle", "Écrire une bonne description", "Choisir une thématique", "Mettre des mots-clés", "Choisir le type d’accès", "Sélectionner une licence", "Définir un point de contact", "Choisir la fréquence de mise à jour", "Compléter les informations spatiales", "Décrire la généalogie des données"]
    : ["Choisir le bon format", "Ajouter de la documentation"];
  return (
    <aside className="hidden w-[34%] shrink-0 border-r border-[#e5e5e5] pr-8 lg:block">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-medium"><RiQuestionLine className="h-5 w-5" />Aide</h2>
      <div className="divide-y divide-[#e5e5e5] border-y border-[#e5e5e5]">
        {items.map((item, index) => (
          <details key={item} open={index === 0 && kind === "files"} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-normal text-[#000091] [&::-webkit-details-marker]:hidden">
              {item}<RiArrowDownSLine className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="pt-3 text-[12px] leading-5 text-[#666]">
              {kind === "files" ? "Privilégiez des formats ouverts, facilement réutilisables et lisibles par un traitement automatisé." : "Renseignez une information précise et compréhensible pour faciliter la découverte et la réutilisation des données."}
            </p>
          </details>
        ))}
      </div>
    </aside>
  );
}

function Navigation({ previous, next, nextLabel = "Suivant" }: { previous?: () => void; next: () => void; nextLabel?: string }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#e5e5e5] pt-6">
      {previous ? <button onClick={previous} className="inline-flex min-h-10 items-center gap-2 border border-[#000091] px-4 text-[14px] font-medium text-[#000091] hover:bg-[#ececfe]"><RiArrowLeftLine className="h-4 w-4" />Précédent</button> : <span />}
      <button onClick={next} className="inline-flex min-h-10 items-center gap-2 bg-[#000091] px-4 text-[14px] font-normal text-white hover:bg-[#1212ff]">{nextLabel}<RiArrowRightLine className="h-4 w-4" /></button>
    </div>
  );
}

export function PublicationFlow() {
  const [view, setView] = useState<"flow" | "public">("flow");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PublicDataset>(initialForm);
  const [importState, setImportState] = useState<ImportState>({ phase: "idle" });
  const [importUrl, setImportUrl] = useState(DEFAULT_IMPORT_URL);
  const [resource, setResource] = useState<GeoPackageResource | null>(null);
  const [editingFile, setEditingFile] = useState(false);
  const [resourceDraft, setResourceDraft] = useState<Pick<GeoPackageResource, "title" | "description" | "type">>({ title: "", description: "", type: "main" });
  const [resourceSaved, setResourceSaved] = useState(false);
  const [hostedServices, setHostedServices] = useState<HostedWfs[]>([]);
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [externalServices, setExternalServices] = useState<ExternalWfs[]>([]);
  const [referencingExternal, setReferencingExternal] = useState(false);
  const [showServiceErrors, setShowServiceErrors] = useState(false);
  const [published, setPublished] = useState(false);
  const analysisRun = useRef(0);

  const go = (next: number) => {
    if (next === 4 && resource && !servicesInitialized) {
      setHostedServices([createHostedWfs(resource, [], form.tags)]);
      setServicesInitialized(true);
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const update = (key: keyof PublicDataset, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const accessLabel = form.accessType === "open" ? "Ouvert" : "Restreint";

  // Même parcours d’analyse pour un fichier téléversé ou importé par URL.
  const startAnalysis = (origin: ImportOrigin, invalid = false) => {
    const run = ++analysisRun.current;
    const stepsCount = analysisStepsFor(origin).length;
    setImportState({ phase: "analyzing", origin, progress: 0 });
    for (let index = 1; index < stepsCount; index += 1) {
      window.setTimeout(() => {
        if (analysisRun.current === run) setImportState((current) => (current.phase === "analyzing" ? { ...current, progress: index } : current));
      }, index * ANALYSIS_STEP_MS);
    }
    window.setTimeout(() => {
      if (analysisRun.current !== run) return;
      if (invalid) {
        setImportState({ phase: "failed", origin, issues: invalidFileIssues });
        return;
      }
      const created = createGeoPackageResource(origin);
      setResource(created);
      setResourceDraft({ title: created.title, description: created.description, type: created.type });
      setResourceSaved(false);
      setEditingFile(true);
      setHostedServices([]);
      setServicesInitialized(false);
      setImportState({ phase: "idle" });
    }, stepsCount * ANALYSIS_STEP_MS);
  };
  const cancelAnalysis = () => {
    analysisRun.current += 1;
    setImportState({ phase: "idle" });
  };
  const submitUrl = (invalid = false) => {
    if (!/^https?:\/\/\S+$/i.test(importUrl.trim())) {
      setImportState({ phase: "form", mode: "url", error: "Saisissez une URL valide, commençant par https://." });
      return;
    }
    startAnalysis({ kind: "url", url: importUrl.trim() }, invalid);
  };
  const removeResource = () => {
    setResource(null);
    setEditingFile(false);
    setResourceSaved(false);
    setHostedServices([]);
    setServicesInitialized(false);
  };
  const updateSourceLayer = (key: string, patch: Partial<SourceLayer>) => setResource((current) => current && { ...current, layers: current.layers.map((layer) => (layer.key === key ? { ...layer, ...patch } : layer)) });

  const serviceErrors = hostedServices.map((service) => getServiceErrors(service, hostedServices));
  const servicesInvalid = serviceErrors.some(hasServiceErrors);
  const leaveServices = () => {
    if (servicesInvalid) {
      setShowServiceErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setReferencingExternal(false);
    go(5);
  };

  // Génération asynchrone simulée : la publication du jeu de données n’attend pas les services.
  const publish = () => {
    setPublished(true);
    setHostedServices((current) => current.map((service) => ({ ...service, status: "generating" })));
    hostedServices.forEach((service, index) => {
      window.setTimeout(() => setHostedServices((current) => current.map((item) => (item.id === service.id && item.status === "generating" ? { ...item, status: "available" } : item))), 3500 + index * 2500);
    });
  };
  const setServiceStatus = (id: string, status: ServiceStatus) => setHostedServices((current) => current.map((service) => (service.id === id ? { ...service, status } : service)));
  const restart = () => {
    analysisRun.current += 1;
    setPublished(false);
    setResource(null);
    setHostedServices([]);
    setServicesInitialized(false);
    setExternalServices([]);
    setShowServiceErrors(false);
    setImportState({ phase: "idle" });
    go(1);
  };

  if (view === "public") {
    return (
      <div className="min-h-dvh bg-[#f6f6f6] text-[#161616]">
        <Header />
        <PublicDatasetPage dataset={form} resource={resource} hostedServices={hostedServices} externalServices={externalServices} onBack={() => { setView("flow"); window.scrollTo({ top: 0 }); }} />
      </div>
    );
  }

  const analysisSteps = importState.phase === "analyzing" ? analysisStepsFor(importState.origin) : [];

  return (
    <div className="min-h-dvh bg-[#f6f6f6] text-[#161616]">
      <Header />
      <main className="mx-auto max-w-[1200px] px-5 py-6 md:px-8 md:py-9">
        <nav className="mb-7 text-[12px] text-[#666]" aria-label="Fil d’Ariane">
          Accueil <span className="px-2">›</span> Jeux de données <span className="px-2">›</span> <span className="text-[#161616]">Formulaire de publication</span>
        </nav>
        <Stepper current={step} />

        {step === 1 ? (
          <div>
            <section className="bg-white p-5 md:p-7">
              <h1 className="mb-5 text-[14px] font-medium uppercase tracking-[0.03em]">Type de publication</h1>
              <div className="grid gap-5 md:grid-cols-2">
                <article className="flex min-h-[300px] flex-col border border-[#ddd] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <div className="mb-7 flex h-24 items-center justify-center bg-[#f5f5fe]"><RiFileTextLine className="h-14 w-14 text-[#000091]" /></div>
                  <h2 className="text-[20px] font-medium">Publier un jeu de données</h2>
                  <p className="mt-3 flex-1 text-[14px] leading-6 text-[#3a3a3a]">Administration ou société publique, tout le monde peut publier sur data.gouv.fr !</p>
                  <button onClick={() => go(2)} className="mt-6 self-start bg-[#000091] px-4 py-3 text-[14px] font-medium text-white hover:bg-[#1212ff]">Commencer la publication</button>
                </article>
                <article className="flex min-h-[300px] flex-col border border-[#ddd] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
                  <div className="mb-7 flex h-24 items-center justify-center bg-[#f5f5fe]"><span className="text-[44px] font-extrabold text-[#6a6af4]">{`{ }`}</span></div>
                  <h2 className="text-[20px] font-medium">Publier avec un schéma</h2>
                  <p className="mt-3 flex-1 text-[14px] leading-6 text-[#3a3a3a]">Vos données suivent-elles un schéma de référence ? Sélectionnez un schéma et créez vos données structurées !</p>
                  <button className="mt-6 self-start border border-[#000091] px-4 py-3 text-[14px] font-medium text-[#000091] hover:bg-[#ececfe]">Publier avec un schéma</button>
                </article>
              </div>
            </section>
            <section className="mt-7 max-w-[820px] text-[14px] leading-6">
              <h2 className="font-medium">Êtes-vous une administration et voulez-vous automatiser la publication de vos données ?</h2>
              <p className="mt-2">Vous pouvez publier automatiquement via API ou en liant votre portail de données ouvertes à data.gouv.fr avec un moissonneur.</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-[#000091] underline"><a href="https://guides.data.gouv.fr/api-de-data.gouv.fr/reference">Voir la documentation API</a><a href="https://guides.data.gouv.fr/moissonnage">En savoir plus sur le moissonnage</a><a href="https://support.data.gouv.fr/">Nous écrire</a></div>
            </section>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex gap-8">
            <HelpAside kind="description" />
            <section className="w-full bg-white p-5 md:p-7 lg:w-[66%]">
              <InfoBanner title="Qu’est-ce qu’un jeu de données ?">Sur data.gouv.fr, un jeu de données est un ensemble de fichiers.</InfoBanner>
              <p className="mb-7 text-[12px] text-[#666]">Sauf mention contraire, tous les champs sont obligatoires.</p>
              <fieldset className="mb-8">
                <legend className="mb-4 text-[14px] font-medium uppercase">Producteur</legend>
                <Field label="Vérifiez l’identité avec laquelle vous souhaitez publier" required>
                  <select value={form.producer} onChange={(e) => update("producer", e.target.value)} className={inputClass}><option>DREAL Grand Est</option><option>Mon compte personnel</option></select>
                </Field>
              </fieldset>
              <fieldset className="space-y-5">
                <legend className="mb-4 text-[14px] font-medium uppercase">Description</legend>
                <Field label="Titre" required><input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} /></Field>
                <Field label="Acronyme"><input value={form.acronym} onChange={(e) => update("acronym", e.target.value)} className={inputClass} /></Field>
                <Field label="Description" required hint="Décrivez le contenu, le contexte de production et la structure des fichiers."><textarea rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} className={inputClass} /></Field>
                <Field label="Description courte" hint="Une ou deux phrases visibles dans les résultats de recherche."><textarea rows={3} value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} className={inputClass} /></Field>
                <Field label="Thématique"><select value={form.theme} onChange={(e) => update("theme", e.target.value)} className={inputClass}><option>Environnement</option><option>Aménagement du territoire</option><option>Transport et mobilité</option><option>Économie et emploi</option><option>Santé</option></select></Field>
                <Field label="Mots-clés"><input value={form.tags} onChange={(e) => update("tags", e.target.value)} className={inputClass} /></Field>
              </fieldset>
              <fieldset className="mt-8 space-y-5">
                <legend className="mb-4 text-[14px] font-medium uppercase">Accès</legend>
                <div>
                  <p className="mb-2 text-[15px]">Type d’accès <span className="text-[#e1000f]">*</span></p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className={`flex cursor-pointer items-start gap-3 border p-4 ${form.accessType === "open" ? "border-2 border-[#000091] bg-[#f5f5fe]" : "border-[#ddd]"}`}>
                      <input type="radio" name="accessType" value="open" checked={form.accessType === "open"} onChange={(e) => update("accessType", e.target.value)} className="mt-1 h-4 w-4 accent-[#000091]" />
                      <span><span className="block text-[14px] font-medium">Ouvert</span><span className="mt-1 block text-[12px] leading-5 text-[#666]">Les fichiers et services sont accessibles librement et gratuitement.</span></span>
                    </label>
                    <label className={`flex cursor-pointer items-start gap-3 border p-4 ${form.accessType === "restricted" ? "border-2 border-[#000091] bg-[#f5f5fe]" : "border-[#ddd]"}`}>
                      <input type="radio" name="accessType" value="restricted" checked={form.accessType === "restricted"} onChange={(e) => update("accessType", e.target.value)} className="mt-1 h-4 w-4 accent-[#000091]" />
                      <span><span className="block text-[14px] font-medium">Restreint</span><span className="mt-1 block text-[12px] leading-5 text-[#666]">L’accès aux fichiers et services nécessite une autorisation.</span></span>
                    </label>
                  </div>
                  <p className="mt-2 text-[12px] text-[#666]">Les services WFS créés à partir de vos fichiers héritent de ce type d’accès.</p>
                </div>
                {form.accessType === "open" ? <Field label="Licence"><select value={form.license} onChange={(e) => update("license", e.target.value)} className={inputClass}><option>Licence Ouverte / Open Licence version 2.0</option><option>Etalab Open Licence 1.0</option><option>ODbL 1.0</option></select></Field> : <InfoBanner title="Accès restreint">La licence n’est pas demandée tant que l’accès aux fichiers est soumis à autorisation.</InfoBanner>}
              </fieldset>
              <fieldset className="mt-8 space-y-4">
                <legend className="mb-4 text-[14px] font-medium uppercase">Points de contact et attributions</legend>
                <Field label="Point de contact ou attribution existante">
                  <select className={inputClass} defaultValue="service-donnees">
                    <option value="service-donnees">Service connaissance et valorisation des données</option>
                    <option value="dreal">DREAL Grand Est</option>
                    <option value="ajouter">Ajouter une nouvelle attribution…</option>
                  </select>
                </Field>
                <article className="border border-[#ddd] bg-white p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="text-[14px] font-medium">Service connaissance et valorisation des données</h3>
                      <p className="mt-1 text-[12px] text-[#666]">DREAL Grand Est</p>
                    </div>
                    <span className="self-start bg-[#e3e8fd] px-2 py-1 text-[11px] text-[#0063cb]">CONTACT</span>
                  </div>
                  <dl className="mt-4 grid gap-3 text-[12px] sm:grid-cols-2">
                    <div><dt className="text-[#666]">E-mail</dt><dd className="mt-1 break-all">donnees.dreal-grand-est@developpement-durable.gouv.fr</dd></div>
                    <div><dt className="text-[#666]">Rôle</dt><dd className="mt-1">Point de contact</dd></div>
                  </dl>
                </article>
                <button type="button" className="border border-[#000091] px-3 py-2 text-[13px] font-normal text-[#000091] hover:bg-[#ececfe]">Nouvelle attribution</button>
              </fieldset>
              <fieldset className="mt-8 grid gap-5 md:grid-cols-2">
                <legend className="mb-4 text-[14px] font-medium uppercase md:col-span-2">Temps</legend>
                <div className="md:col-span-2"><Field label="Fréquence de mise à jour" required><select value={form.frequency} onChange={(e) => update("frequency", e.target.value)} className={inputClass}><option>Annuelle</option><option>Mensuelle</option><option>Trimestrielle</option><option>Ponctuelle</option></select></Field></div>
                <p className="-mb-2 text-[15px] md:col-span-2">Couverture temporelle</p>
                <Field label="Début de la couverture temporelle"><input type="date" value={form.temporalStart} onChange={(e) => update("temporalStart", e.target.value)} className={inputClass} /></Field>
                <Field label="Fin de la couverture temporelle"><input type="date" value={form.temporalEnd} onChange={(e) => update("temporalEnd", e.target.value)} className={inputClass} /></Field>
              </fieldset>
              <fieldset className="mt-8 grid gap-5 md:grid-cols-2">
                <legend className="mb-4 text-[14px] font-medium uppercase md:col-span-2">Espace</legend>
                <Field label="Couverture spatiale"><input value={form.spatial} onChange={(e) => update("spatial", e.target.value)} className={inputClass} /></Field>
                <Field label="Granularité spatiale"><select value={form.granularity} onChange={(e) => update("granularity", e.target.value)} className={inputClass}><option>Département</option><option>Commune</option><option>Région</option><option>France</option></select></Field>
              </fieldset>
              <fieldset className="mt-8">
                <legend className="mb-4 text-[14px] font-medium uppercase">Généalogie</legend>
                <Field label="Généalogie des données (facultatif)" hint="Origine des données, méthodes de production et traitements appliqués."><textarea rows={4} value={form.lineage} onChange={(e) => update("lineage", e.target.value)} className={inputClass} /></Field>
              </fieldset>
              <Navigation previous={() => go(1)} next={() => go(3)} />
            </section>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex gap-8">
            <HelpAside kind="files" />
            <section className="w-full bg-white p-5 md:p-7 lg:w-[66%]">
              <InfoBanner title="Qu’est-ce qu’un fichier ?">Un jeu de données peut contenir plusieurs types de fichiers : mises à jour, historique, documentation, code source, API, lien, etc.</InfoBanner>
              <div><h1 className="text-[14px] font-medium uppercase">Fichiers</h1><p className="mt-2 text-[13px] text-[#666]">Ajoutez un GeoPackage, par téléversement ou par URL. Il est analysé automatiquement.</p></div>

              {!resource && (importState.phase === "idle" || importState.phase === "failed") ? (
                <>
                  {importState.phase === "failed" ? (
                    <div role="alert" className="mt-5 border-l-4 border-[#ce0500] bg-[#ffe9e9] p-4 text-[13px] leading-5">
                      <p className="font-medium">Le fichier n’a pas pu être ajouté</p>
                      <ul className="mt-2 space-y-1">{importState.issues.map((issue) => <li key={issue.message} className="flex gap-2"><IssueIcon level={issue.level} />{issue.message}</li>)}</ul>
                      <p className="mt-2 text-[12px] text-[#3a3a3a]">Corrigez le fichier puis ajoutez-le de nouveau.</p>
                    </div>
                  ) : null}
                  <div className="mt-5 bg-[#f6f6f6] p-6 text-center md:p-10"><h2 className="font-medium">Ajoutez vos premiers fichiers</h2><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => setImportState({ phase: "form", mode: "upload" })} className="inline-flex items-center justify-center gap-2 bg-[#000091] px-4 py-3 text-[14px] font-medium text-white"><RiUploadCloud2Line className="h-5 w-5" />Déposer un fichier</button><button onClick={() => setImportState({ phase: "form", mode: "url" })} className="inline-flex items-center justify-center gap-2 border border-[#000091] px-4 py-3 text-[14px] font-medium text-[#000091]"><RiLink className="h-5 w-5" />Ajouter une URL</button></div></div>
                </>
              ) : null}

              {importState.phase === "form" && importState.mode === "upload" ? <div className="mt-5 border-2 border-dashed border-[#6a6af4] bg-[#f5f5fe] p-8 text-center"><RiUploadCloud2Line className="mx-auto h-9 w-9 text-[#000091]" /><p className="mt-3 text-[14px]">Déposez votre GeoPackage ici</p><p className="mt-1 text-[12px] text-[#666]">ou sélectionnez-le depuis votre ordinateur</p><div className="mt-4 flex flex-wrap items-center justify-center gap-3"><button onClick={() => startAnalysis({ kind: "upload", fileName: DEFAULT_FILE_NAME })} className="bg-[#000091] px-4 py-2 text-[13px] font-medium text-white">Simuler le dépôt du GeoPackage</button><button onClick={() => setImportState({ phase: "idle" })} className="text-[13px] text-[#000091] underline">Annuler</button></div><button onClick={() => startAnalysis({ kind: "upload", fileName: "export-corrompu.gpkg" }, true)} className="mt-4 text-[12px] text-[#666] underline">Simuler un fichier invalide</button></div> : null}
              {importState.phase === "form" && importState.mode === "url" ? <div className="mt-5 border border-[#ddd] bg-[#f6f6f6] p-5"><Field label="Lien vers le fichier" required hint="Une copie du fichier sera hébergée sur data.gouv.fr. L’URL d’origine restera affichée." error={importState.error}><input value={importUrl} aria-invalid={Boolean(importState.error)} onChange={(event) => { setImportUrl(event.target.value); setImportState({ phase: "form", mode: "url" }); }} className={`${inputClass} font-mono`} spellCheck={false} /></Field><div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={() => submitUrl()} className="bg-[#000091] px-4 py-2 text-[13px] font-medium text-white">Ajouter le fichier</button><button onClick={() => setImportState({ phase: "idle" })} className="text-[13px] text-[#000091] underline">Annuler</button><button onClick={() => submitUrl(true)} className="ml-auto text-[12px] text-[#666] underline">Simuler un fichier invalide</button></div></div> : null}

              {importState.phase === "analyzing" ? (
                <div className="mt-5 border border-[#ddd] bg-[#f6f6f6] p-5" aria-live="polite">
                  <p className="flex items-center gap-3 text-[14px] font-medium"><Spinner className="h-5 w-5" />Analyse du GeoPackage en cours</p>
                  <p className="mt-1 break-all pl-8 font-mono text-[11px] text-[#666]">{importState.origin.kind === "url" ? importState.origin.url : importState.origin.fileName}</p>
                  <ol className="mt-4 space-y-2 pl-8 text-[13px]">
                    {analysisSteps.map((label, index) => (
                      <li key={label} className={`flex items-center gap-2 ${index > importState.progress ? "text-[#929292]" : ""}`}>
                        {index < importState.progress ? <RiCheckboxCircleFill className="h-4 w-4 text-[#18753c]" /> : index === importState.progress ? <Spinner className="h-3.5 w-3.5" /> : <span className="h-4 w-4 rounded-full border border-[#ccc]" />}
                        {label}
                      </li>
                    ))}
                  </ol>
                  <button onClick={cancelAnalysis} className="mt-4 pl-8 text-[13px] text-[#000091] underline">Annuler</button>
                </div>
              ) : null}

              {resource ? <div className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-medium">Fichiers ajoutés</h2><span className="text-[12px] text-[#666]">1 fichier</span></div><article className={`border bg-white ${editingFile ? "border-[#000091]" : "border-[#ddd]"}`}>
                <div className="flex items-start gap-4 p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ececfe]"><RiFileAddLine className="h-6 w-6 text-[#000091]" /></div><div className="min-w-0 flex-1"><h3 className="text-[15px] font-medium">{resource.title}</h3><p className="mt-1 break-all text-[12px] text-[#666]">{resource.fileName} · {resource.sizeLabel}</p>{resource.origin.kind === "url" ? <p className="mt-1 flex items-center gap-1 break-all text-[12px] text-[#666]"><RiLink className="h-3.5 w-3.5 shrink-0" />Importé par URL · copie hébergée sur data.gouv.fr</p> : null}<div className="mt-3 flex flex-wrap items-center gap-2"><span className="bg-[#eee] px-2 py-1 text-[11px]">{resourceTypeLabels[resource.type]}</span>{resourceSaved ? <span className="inline-flex items-center gap-1 text-[11px] text-[#18753c]"><RiCheckboxCircleFill className="h-4 w-4" />Informations enregistrées</span> : null}</div></div><div className="flex shrink-0 gap-2"><button onClick={() => { setResourceDraft({ title: resource.title, description: resource.description, type: resource.type }); setEditingFile((value) => !value); }} aria-label="Modifier les informations du fichier" className="border border-[#000091] p-2 text-[#000091] hover:bg-[#ececfe]"><RiEditLine className="h-4 w-4" /></button><button aria-label="Supprimer le fichier" onClick={removeResource} className="border border-[#ddd] p-2 text-[#666] hover:bg-[#f6f6f6]"><RiCloseLine className="h-4 w-4" /></button></div></div>
                <AnalysisReport issues={resource.issues} />
                {editingFile ? <div className="border-t border-[#ddd] bg-[#f6f6f6] p-5">
                  <h4 className="mb-5 text-[14px] font-medium">Métadonnées de la ressource</h4>
                  <div className="space-y-5">
                    <Field label="Titre" required><input value={resourceDraft.title} onChange={(e) => { setResourceDraft((current) => ({ ...current, title: e.target.value })); setResourceSaved(false); }} className={inputClass} /></Field>
                    <Field label="Type de fichier" required><select value={resourceDraft.type} onChange={(e) => { setResourceDraft((current) => ({ ...current, type: e.target.value as ResourceType })); setResourceSaved(false); }} className={inputClass}><option value="main">Fichier principal</option><option value="documentation">Documentation</option><option value="update">Mise à jour</option><option value="other">Autre</option></select></Field>
                    <Field label="Description" hint="Précisez le contenu et les usages de ce fichier."><textarea rows={4} value={resourceDraft.description} onChange={(e) => { setResourceDraft((current) => ({ ...current, description: e.target.value })); setResourceSaved(false); }} className={inputClass} /></Field>
                    <div>
                      <h5 className="mb-3 text-[13px] font-medium uppercase">Informations détectées automatiquement</h5>
                      <dl className="flex flex-wrap gap-x-5 gap-y-2 border-y border-[#ddd] bg-white px-3 py-3 text-[12px]">
                        <div className="flex gap-1.5"><dt className="text-[#666]">Format :</dt><dd>{resource.format}</dd></div>
                        <div className="flex gap-1.5"><dt className="text-[#666]">Taille :</dt><dd>{resource.sizeLabel}</dd></div>
                        <div className="flex gap-1.5"><dt className="text-[#666]">Couches :</dt><dd>{resource.layers.length}</dd></div>
                        <div className="flex gap-1.5"><dt className="text-[#666]">Contenu :</dt><dd>{resource.contentType}</dd></div>
                        <div className="flex gap-1.5"><dt className="text-[#666]">Emprise :</dt><dd>{resource.extent}</dd></div>
                        {resource.origin.kind === "url" ? <div className="flex min-w-0 basis-full gap-1.5"><dt className="shrink-0 text-[#666]">URL d’origine :</dt><dd className="break-all font-mono text-[11px]">{resource.origin.url}</dd></div> : null}
                      </dl>
                    </div>
                    <div className="flex flex-wrap justify-end gap-3"><button onClick={() => setEditingFile(false)} className="px-3 py-2 text-[13px] text-[#000091] underline">Annuler</button><button onClick={() => { setResource((current) => current && { ...current, ...resourceDraft }); setResourceSaved(true); setEditingFile(false); }} className="inline-flex items-center gap-2 bg-[#000091] px-4 py-2 text-[13px] font-medium text-white"><RiSaveLine className="h-4 w-4" />Enregistrer les informations</button></div>
                  </div>
                </div> : null}
              <section className="border-t border-[#ddd] bg-[#f6f6f6] p-5" aria-labelledby="detected-layers-title">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div><h2 id="detected-layers-title" className="text-[15px] font-medium">Couches du fichier</h2><p className="mt-1 text-[12px] text-[#666]">{resource.layers.length} couches géographiques détectées automatiquement. Les libellés et descriptions restent modifiables.</p></div>
                  <span className="shrink-0 text-[12px] text-[#666]">{resource.layers.length} couches</span>
                </div>
                <div className="mb-4"><MapPreview title="Aperçu des couches" layers={resource.layers.map((layer) => ({ id: layer.key, label: layer.label, geometry: layer.geometry }))} /></div>
                <div className="space-y-3">
                  {resource.layers.map((layer, index) => <LayerSection
                    key={layer.key}
                    layer={layer}
                    warnings={resource.issues.filter((issue) => issue.table === layer.tableName && issue.level !== "info")}
                    onChange={(patch) => updateSourceLayer(layer.key, patch)}
                    open={index === 0}
                  />)}
                </div>
              </section>
              </article>
              </div> : null}
              <Navigation previous={() => go(2)} next={() => go(4)} />
            </section>
          </div>
        ) : null}

        {step === 4 ? (
          <section className="bg-white p-5 md:p-7">
            <InfoBanner title="Les services WFS sont facultatifs">Votre GeoPackage reste intégralement téléchargeable, même sans service. La génération des services se fait après la publication, sans la bloquer. Les droits d’accès des services créés sont hérités du jeu de données ({accessLabel.toLowerCase()}).</InfoBanner>
            {showServiceErrors && servicesInvalid ? <div role="alert" className="mb-6 border-l-4 border-[#ce0500] bg-[#ffe9e9] p-4 text-[13px]"><p className="font-medium">Certains services sont incomplets</p><p className="mt-1">Corrigez les champs signalés avant de continuer.</p></div> : null}
            <div className="mb-6"><h1 className="text-[18px] font-medium">Créez ou référencez des services WFS</h1><p className="mt-2 max-w-[760px] text-[13px] leading-6 text-[#666]">Un service WFS permet d’interroger et de télécharger les objets géographiques depuis un logiciel SIG. Vous pouvez créer plusieurs services à partir d’un même GeoPackage, chacun avec ses propres couches.</p></div>

            <section aria-labelledby="hosted-title">
              <h2 id="hosted-title" className="mb-3 text-[14px] font-medium uppercase">Services créés à partir de vos fichiers</h2>
              {!resource ? (
                <div className="bg-[#f6f6f6] p-6 text-center text-[13px]"><p>Ajoutez un GeoPackage pour créer un service WFS.</p><button onClick={() => go(3)} className="mt-3 text-[#000091] underline">Revenir aux fichiers</button></div>
              ) : (
                <div className="space-y-5">
                  {hostedServices.map((service, index) => (
                    <HostedWfsEditor
                      key={service.id}
                      index={index}
                      service={service}
                      services={hostedServices}
                      resource={resource}
                      keywords={form.tags}
                      accessLabel={accessLabel}
                      errors={serviceErrors[index]}
                      showErrors={showServiceErrors}
                      onChange={(next) => setHostedServices((current) => current.map((item) => (item.id === next.id ? next : item)))}
                      onRemove={() => setHostedServices((current) => current.filter((item) => item.id !== service.id))}
                    />
                  ))}
                  {hostedServices.length === 0 ? <p className="bg-[#f6f6f6] p-5 text-[13px] text-[#3a3a3a]">Aucun service ne sera créé à partir de « {resource.title} ». Le fichier sera publié normalement.</p> : null}
                  <button onClick={() => setHostedServices((current) => [...current, createHostedWfs(resource, current, form.tags)])} className="inline-flex items-center gap-2 border border-[#000091] px-4 py-2 text-[13px] font-medium text-[#000091] hover:bg-[#ececfe]"><RiAddLine className="h-4 w-4" />Ajouter un service WFS à partir de ce GeoPackage</button>
                </div>
              )}
            </section>

            <section className="mt-9" aria-labelledby="external-title">
              <h2 id="external-title" className="mb-1 text-[14px] font-medium uppercase">Services WFS externes</h2>
              <p className="mb-3 text-[13px] text-[#666]">Vous diffusez déjà vos données via un WFS public ? Référencez-le sans le recréer.</p>
              <div className="space-y-4">
                {externalServices.map((service) => <ExternalWfsSummary key={service.id} service={service} onRemove={() => setExternalServices((current) => current.filter((item) => item.id !== service.id))} />)}
                {referencingExternal
                  ? <ExternalWfsReference onCancel={() => setReferencingExternal(false)} onAdd={(service) => { setExternalServices((current) => [...current, service]); setReferencingExternal(false); }} />
                  : <button onClick={() => setReferencingExternal(true)} className="inline-flex items-center gap-2 border border-[#000091] px-4 py-2 text-[13px] font-medium text-[#000091] hover:bg-[#ececfe]"><RiGlobalLine className="h-4 w-4" />Référencer un WFS externe</button>}
              </div>
            </section>

            <section className="mt-9 border-l-4 border-[#000091] bg-[#f5f5fe] p-5" aria-labelledby="services-summary-title">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 id="services-summary-title" className="text-[15px] font-medium">Services qui seront ajoutés au jeu de données</h2><p className="mt-1 text-[12px] text-[#666]">Ils apparaîtront dans la liste des ressources de la fiche publique dès qu’ils seront disponibles.</p></div><span className="self-start bg-[#e3e8fd] px-2 py-1 text-[11px] text-[#0063cb]">{hostedServices.length + externalServices.length} service{hostedServices.length + externalServices.length > 1 ? "s" : ""}</span></div>
              {hostedServices.length + externalServices.length ? (
                <ul className="mt-4 divide-y divide-[#cacafb] border-y border-[#cacafb] text-[13px]">
                  {hostedServices.map((service) => <li key={service.id} className="flex flex-col justify-between gap-1 py-3 sm:flex-row"><span><strong className="font-medium">WFS</strong> · {service.title || "Sans titre"}</span><span className="text-[12px] text-[#666]">{service.layers.length} couche{service.layers.length > 1 ? "s" : ""} · à créer depuis {resource?.fileName}</span></li>)}
                  {externalServices.map((service) => <li key={service.id} className="flex flex-col justify-between gap-1 py-3 sm:flex-row"><span><strong className="font-medium">WFS externe</strong> · {service.title}</span><span className="text-[12px] text-[#666]">{service.layers.length} couche{service.layers.length > 1 ? "s" : ""} · référencé</span></li>)}
                </ul>
              ) : <p className="mt-4 text-[13px]">Aucun service ne sera ajouté. Les fichiers seront publiés normalement.</p>}
              <div className="mt-4"><OpenQuestion>La création de nouveaux services après la publication n’est pas encore définie.</OpenQuestion></div>
            </section>

            <Navigation previous={() => go(3)} next={leaveServices} />
          </section>
        ) : null}

        {step === 5 ? (
          <section className="bg-white p-5 md:p-7">
            {published ? (
              <div className="mx-auto max-w-[760px] py-8"><div className="text-center"><RiCheckboxCircleFill className="mx-auto h-14 w-14 text-[#18753c]" /><h1 className="mt-5 text-[26px] font-medium">Jeu de données publié</h1><p className="mt-3 text-[14px] leading-6 text-[#666]">{resource ? "Le GeoPackage est disponible. " : ""}{hostedServices.length ? "La génération des services WFS se poursuit indépendamment." : ""}</p></div>
                {hostedServices.length || externalServices.length ? <section className="mt-8 border border-[#ddd] p-5"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><h2 className="text-[15px] font-medium">Services WFS</h2><p className="mt-1 text-[12px] text-[#666]">Seuls les services disponibles apparaissent sur la fiche publique. Les états sont simulés.</p></div></div>
                  <div className="mt-4 divide-y divide-[#ddd] border-y border-[#ddd]">
                    {hostedServices.map((service) => <div key={service.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-[13px] font-medium">WFS · {service.title}</p><p className="mt-1 break-all font-mono text-[11px] text-[#666]">{wfsUrl(service.technicalName)}</p>{service.status === "error" ? <p className="mt-1 text-[12px] text-[#ce0500]">La génération a échoué. Le service n’apparaît pas sur la fiche publique.</p> : null}</div><ServiceStatusBadge status={service.status} /><select aria-label={`État simulé du service ${service.title}`} value={service.status} onChange={(event) => setServiceStatus(service.id, event.target.value as ServiceStatus)} className="border-b-2 border-[#3a3a3a] bg-[#eee] px-2 py-1 text-[11px]"><option value="generating">En cours</option><option value="available">Disponible</option><option value="error">Erreur</option></select></div>)}
                    {externalServices.map((service) => <div key={service.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-[13px] font-medium">WFS externe · {service.title}</p><p className="mt-1 break-all font-mono text-[11px] text-[#666]">{service.url}</p></div><Badge tone="external">Référencé</Badge></div>)}
                  </div>
                </section> : null}
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => { setView("public"); window.scrollTo({ top: 0 }); }} className="inline-flex items-center justify-center gap-2 bg-[#000091] px-4 py-3 text-[14px] font-medium text-white hover:bg-[#1212ff]"><RiEyeLine className="h-4 w-4" />Voir la fiche publique</button><button onClick={restart} className="border border-[#000091] px-4 py-3 text-[14px] font-medium text-[#000091]">Recommencer le parcours</button></div>
              </div>
            ) : (
              <>
                <InfoBanner title="Votre jeu de données est prêt">Vérifiez les informations ci-dessous avant de le publier ou de l’enregistrer comme brouillon.</InfoBanner>
                <div className="grid gap-7 lg:grid-cols-[1fr_320px]">
                  <article className="border border-[#ddd] p-6"><p className="text-[12px] font-medium uppercase text-[#666]">Jeu de données</p><h1 className="mt-2 text-[23px] font-medium leading-8">{form.title}</h1><p className="mt-2 text-[13px] text-[#666]">Publié par {form.producer}</p><p className="mt-5 text-[14px] leading-6">{form.shortDescription}</p><div className="mt-5 flex flex-wrap gap-2"><span className="bg-[#e3e8fd] px-2 py-1 text-[11px] text-[#0063cb]">{form.theme}</span>{form.tags.split(",").map((tag) => <span key={tag} className="bg-[#eee] px-2 py-1 text-[11px]">{tag.trim()}</span>)}</div><dl className="mt-6 grid gap-4 border-t border-[#e5e5e5] pt-5 text-[13px] sm:grid-cols-2"><div><dt className="text-[#666]">Type d’accès</dt><dd className="mt-1 font-normal">{accessLabel}</dd></div>{form.accessType === "open" ? <div><dt className="text-[#666]">Licence</dt><dd className="mt-1 font-normal">{form.license}</dd></div> : null}<div><dt className="text-[#666]">Mise à jour</dt><dd className="mt-1 font-normal">{form.frequency}</dd></div><div><dt className="text-[#666]">Point de contact</dt><dd className="mt-1 font-normal">Service connaissance et valorisation des données</dd></div><div><dt className="text-[#666]">Couverture spatiale</dt><dd className="mt-1 font-normal">{form.spatial}</dd></div><div><dt className="text-[#666]">Granularité</dt><dd className="mt-1 font-normal">{form.granularity}</dd></div>{form.lineage.trim() ? <div className="sm:col-span-2"><dt className="text-[#666]">Généalogie</dt><dd className="mt-1 line-clamp-3 font-normal">{form.lineage}</dd></div> : null}</dl></article>
                  <aside className="border border-[#ddd] p-5"><p className="text-[12px] font-medium uppercase text-[#666]">Ressources</p>
                    {!resource && externalServices.length === 0 ? <p className="mt-4 text-[13px] text-[#666]">Aucun fichier ajouté.</p> : null}
                    {resource ? <div className="mt-4"><div className="flex gap-3"><RiFileAddLine className="h-5 w-5 shrink-0 text-[#000091]" /><div className="min-w-0"><p className="text-[13px] font-normal">{resource.title}</p><p className="mt-1 break-all text-[11px] text-[#666]">GeoPackage · {resource.sizeLabel} · {resourceTypeLabels[resource.type]}</p><ul className="mt-2 space-y-1 text-[12px]">{resource.layers.map((layer) => <li key={layer.key}>{layer.label} <span className="text-[#666]">· {layer.geometry}</span></li>)}</ul></div></div>
                      {hostedServices.map((service) => <div key={service.id} className="ml-2 mt-3 flex gap-3 border-l-2 border-[#cacafb] pl-3"><RiServerLine className="h-5 w-5 shrink-0 text-[#000091]" /><div className="min-w-0"><p className="text-[13px]">WFS · {service.title}</p><p className="mt-1 break-all font-mono text-[11px] text-[#666]">{service.layers.map((layer) => layer.technicalName).join(", ")}</p></div></div>)}
                    </div> : null}
                    {externalServices.map((service) => <div key={service.id} className="mt-4 flex gap-3 border-t border-[#ddd] pt-4"><RiGlobalLine className="h-5 w-5 shrink-0 text-[#6e445a]" /><div className="min-w-0"><p className="text-[13px]">WFS externe · {service.title}</p><p className="mt-1 text-[11px] text-[#666]">{service.layers.length} couche{service.layers.length > 1 ? "s" : ""} · {service.provider}</p></div></div>)}
                  </aside>
                </div>
                <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-[#e5e5e5] pt-6 sm:flex-row sm:items-center"><button onClick={() => go(4)} className="inline-flex min-h-10 items-center justify-center gap-2 border border-[#000091] px-4 text-[14px] font-normal text-[#000091]"><RiArrowLeftLine className="h-4 w-4" />Précédent</button><div className="flex flex-col gap-3 sm:flex-row"><button onClick={publish} className="border border-[#000091] px-4 py-3 text-[14px] font-medium text-[#000091]">Sauvegarder le brouillon</button><button onClick={publish} className="bg-[#000091] px-4 py-3 text-[14px] font-medium text-white">Publier le jeu de données</button></div></div>
              </>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
