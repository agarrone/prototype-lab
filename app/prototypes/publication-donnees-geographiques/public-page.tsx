"use client";

import { useState, type ReactNode } from "react";
import { RiArrowLeftLine, RiDownloadLine, RiExternalLinkLine, RiFileTextLine, RiGlobalLine, RiLockLine, RiServerLine, RiTimeLine } from "@remixicon/react";
import { DatasetKeyword, DatasetMetadata } from "@/components/dataset-ui";
import {
  ASYNC_EXPORT_THRESHOLD,
  capabilitiesUrl,
  formatCount,
  resourceTypeLabels,
  wfsUrl,
  type ExternalWfs,
  type GeoPackageResource,
  type GeometryType,
  type HostedWfs,
} from "@/lib/publication-geo";
import { MapPreview } from "./map-preview";
import { Badge, CopyField } from "./ui";

export type PublicDataset = {
  title: string;
  acronym: string;
  description: string;
  shortDescription: string;
  producer: string;
  accessType: string;
  theme: string;
  license: string;
  frequency: string;
  tags: string;
  temporalStart: string;
  temporalEnd: string;
  spatial: string;
  granularity: string;
  lineage: string;
};

const CARTES_GOUV_URL = "https://cartes.gouv.fr/explorer-les-cartes/";

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—";
}

/** Téléchargement d’une couche complète ; au-delà d’un seuil, l’export est préparé de façon asynchrone. */
function LayerDownload({ featureCount, label }: { featureCount?: number; label: string }) {
  const [state, setState] = useState<"idle" | "started" | "requested">("idle");
  const isLarge = (featureCount ?? 0) > ASYNC_EXPORT_THRESHOLD;
  if (state === "requested") return <span className="inline-flex items-center gap-1 text-[12px] text-[#0063cb]"><RiTimeLine className="h-4 w-4" />Export en préparation</span>;
  return (
    <button
      type="button"
      aria-label={`${isLarge ? "Demander l’export de" : "Télécharger"} la couche ${label}`}
      onClick={() => {
        if (isLarge) setState("requested");
        else {
          setState("started");
          window.setTimeout(() => setState("idle"), 1600);
        }
      }}
      className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] text-[#000091] underline"
    >
      <RiDownloadLine className="h-4 w-4" />
      {state === "started" ? "Téléchargement lancé" : isLarge ? "Demander l’export" : "Télécharger"}
    </button>
  );
}

type LayerRow = { key: string; title: string; technicalName?: string; geometry: GeometryType; featureCount?: number; crs: string };

function LayersTable({ rows, showTechnicalName }: { rows: LayerRow[]; showTechnicalName?: boolean }) {
  const hasLarge = rows.some((row) => (row.featureCount ?? 0) > ASYNC_EXPORT_THRESHOLD);
  return (
    <>
      <div className="overflow-x-auto border border-[#ddd] bg-white">
        <table className="w-full min-w-[560px] border-collapse text-left text-[12px]">
          <thead className="bg-[#eee]"><tr><th className="px-3 py-2 font-medium">Couche</th>{showTechnicalName ? <th className="px-3 py-2 font-medium">Nom technique</th> : null}<th className="px-3 py-2 font-medium">Géométrie</th><th className="px-3 py-2 font-medium">Objets</th><th className="px-3 py-2 font-medium">Projection</th><th className="px-3 py-2 font-medium"><span className="sr-only">Téléchargement</span></th></tr></thead>
          <tbody className="divide-y divide-[#ddd]">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-3 py-2">{row.title}</td>
                {showTechnicalName ? <td className="px-3 py-2 font-mono">{row.technicalName}</td> : null}
                <td className="px-3 py-2 text-[#666]">{row.geometry}</td>
                <td className="px-3 py-2 text-[#666]">{row.featureCount !== undefined ? formatCount(row.featureCount) : "—"}</td>
                <td className="px-3 py-2 text-[#666]">{row.crs}</td>
                <td className="px-3 py-2 text-right"><LayerDownload featureCount={row.featureCount} label={row.title} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasLarge ? <p className="mt-2 text-[12px] text-[#666]">Les couches de plus de {formatCount(ASYNC_EXPORT_THRESHOLD)} objets sont exportées en différé.</p> : null}
    </>
  );
}

function QgisHelp({ url, layerNames }: { url: string; layerNames: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5 text-[13px] leading-6">
      <li>Dans QGIS, ouvrez <strong className="font-medium">Couche › Ajouter une couche › Ajouter une couche WFS / OGC API – Entités</strong>.</li>
      <li>Cliquez sur <strong className="font-medium">Nouveau</strong>, donnez un nom à la connexion et collez l’URL du service : <code className="break-all bg-[#eee] px-1 font-mono text-[12px]">{url}</code></li>
      <li>Cliquez sur <strong className="font-medium">Connexion</strong> pour lister les couches disponibles.</li>
      <li>Sélectionnez les couches par leur nom technique ({layerNames.map((name, index) => <span key={name}>{index ? ", " : ""}<code className="font-mono text-[12px]">{name}</code></span>)}), puis cliquez sur <strong className="font-medium">Ajouter</strong>.</li>
    </ol>
  );
}

function ResourceCard({ icon, title, badges, meta, actions, tabs }: { icon: ReactNode; title: string; badges: ReactNode; meta: ReactNode; actions: ReactNode; tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <article className="border border-[#ddd] bg-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#f5f5fe]">{icon}</span>
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold leading-6">{title}</h3>
            <div className="mt-2 flex flex-wrap gap-2">{badges}</div>
            <div className="mt-2 text-[12px] leading-5 text-[#666]">{meta}</div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">{actions}</div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-t border-[#ddd] px-3" role="tablist">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" aria-selected={open === tab.id} onClick={() => setOpen(open === tab.id ? null : tab.id)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-[13px] ${open === tab.id ? "border-[#000091] font-medium text-[#000091]" : "border-transparent text-[#3a3a3a] hover:text-[#000091]"}`}>{tab.label}</button>
        ))}
      </div>
      {tabs.map((tab) => (open === tab.id ? <div key={tab.id} role="tabpanel" className="border-t border-[#ddd] bg-[#f6f6f6] p-4 md:p-5">{tab.content}</div> : null))}
    </article>
  );
}

const primaryAction = "inline-flex items-center justify-center gap-2 bg-[#000091] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#1212ff]";
const secondaryAction = "inline-flex items-center justify-center gap-2 border border-[#000091] px-3 py-2 text-[13px] text-[#000091] hover:bg-[#ececfe]";

function CartesLink() {
  return <a href={CARTES_GOUV_URL} target="_blank" rel="noreferrer" className={secondaryAction}>Explorer sur cartes.gouv.fr<RiExternalLinkLine className="h-4 w-4" /></a>;
}

export function PublicDatasetPage({ dataset, resource, hostedServices, externalServices, onBack }: { dataset: PublicDataset; resource: GeoPackageResource | null; hostedServices: HostedWfs[]; externalServices: ExternalWfs[]; onBack: () => void }) {
  // Seuls les WFS disponibles apparaissent sur la fiche publique.
  const visibleHosted = hostedServices.filter((service) => service.status === "available");
  const resourceCount = (resource ? 1 : 0) + visibleHosted.length + externalServices.length;
  const sourceLayer = (key: string) => resource?.layers.find((layer) => layer.key === key);

  return (
    <main className="mx-auto max-w-[1200px] px-5 py-6 md:px-8 md:py-9">
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-[13px] text-[#000091] underline"><RiArrowLeftLine className="h-4 w-4" />Retour à l’administration du jeu de données</button>
      <nav className="mb-6 text-[12px] text-[#666]" aria-label="Fil d’Ariane">Accueil <span className="px-2">›</span> Jeux de données <span className="px-2">›</span> <span className="text-[#161616]">{dataset.title}</span></nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <section className="bg-white p-5 md:p-7">
            <p className="text-[13px] font-medium text-[#000091]">{dataset.producer}</p>
            <h1 className="mt-2 text-[28px] font-extrabold leading-9">{dataset.title}{dataset.acronym ? <span className="ml-2 text-[18px] font-normal text-[#666]">({dataset.acronym})</span> : null}</h1>
            <p className="mt-3 text-[15px] leading-6 text-[#3a3a3a]">{dataset.shortDescription}</p>
            <div className="mt-4 flex flex-wrap gap-2"><DatasetKeyword>{dataset.theme}</DatasetKeyword>{dataset.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => <DatasetKeyword key={tag}>{tag}</DatasetKeyword>)}</div>
            <h2 className="mt-7 text-[16px] font-bold">Description</h2>
            <p className="mt-2 text-[14px] leading-6">{dataset.description}</p>
            {dataset.lineage.trim() ? <><h2 className="mt-6 text-[16px] font-bold">Généalogie</h2><p className="mt-2 whitespace-pre-line text-[14px] leading-6">{dataset.lineage}</p></> : null}
          </section>

          <section className="mt-6" aria-labelledby="resources-title">
            <h2 id="resources-title" className="mb-4 text-[18px] font-extrabold">Fichiers et services <span className="ml-2 text-[14px] font-normal text-[#666]">{resourceCount} ressource{resourceCount > 1 ? "s" : ""}</span></h2>
            {dataset.accessType === "restricted" ? <p className="mb-4 flex gap-2 border-l-4 border-[#c3992a] bg-[#fef7da] p-3 text-[13px]"><RiLockLine className="mt-0.5 h-4 w-4 shrink-0" />Accès restreint : les fichiers et les services de ce jeu de données nécessitent une autorisation.</p> : null}
            <div className="space-y-4">
              {resource ? (
                <ResourceCard
                  icon={<RiFileTextLine className="h-6 w-6 text-[#000091]" />}
                  title={resource.title}
                  badges={<><Badge>GeoPackage</Badge><Badge>{resourceTypeLabels[resource.type]}</Badge></>}
                  meta={<>
                    <p>{resource.sizeLabel} · {resource.layers.length} couches · {resource.contentType}</p>
                    {resource.origin.kind === "url" ? <p className="break-all">URL d’origine : <a href={resource.origin.url} onClick={(event) => event.preventDefault()} className="font-mono text-[11px] text-[#000091] underline">{resource.origin.url}</a> · copie hébergée sur data.gouv.fr</p> : null}
                  </>}
                  actions={<><button type="button" className={primaryAction}><RiDownloadLine className="h-4 w-4" />Télécharger le GeoPackage</button><CartesLink /></>}
                  tabs={[
                    { id: "preview", label: "Aperçu", content: <MapPreview layers={resource.layers.map((layer) => ({ id: layer.key, label: layer.label, geometry: layer.geometry }))} /> },
                    { id: "layers", label: "Couches", content: <><p className="mb-3 text-[13px] text-[#3a3a3a]">Téléchargez une couche complète, ou le GeoPackage original avec toutes ses couches.</p><LayersTable rows={resource.layers.map((layer) => ({ key: layer.key, title: layer.label, technicalName: layer.tableName, geometry: layer.geometry, featureCount: layer.featureCount, crs: layer.epsg.split(" ")[0] }))} showTechnicalName /></> },
                    { id: "info", label: "Informations", content: <><p className="text-[13px] leading-6">{resource.description}</p><dl className="mt-3 grid gap-2 text-[12px] sm:grid-cols-2"><div><dt className="text-[#666]">Fichier</dt><dd className="break-all font-mono">{resource.fileName}</dd></div><div><dt className="text-[#666]">Format</dt><dd>{resource.format}</dd></div><div className="sm:col-span-2"><dt className="text-[#666]">Emprise</dt><dd>{resource.extent}</dd></div></dl></> },
                  ]}
                />
              ) : null}

              {visibleHosted.map((service) => {
                const url = wfsUrl(service.technicalName);
                return (
                  <ResourceCard
                    key={service.id}
                    icon={<RiServerLine className="h-6 w-6 text-[#000091]" />}
                    title={service.title}
                    badges={<><Badge>WFS</Badge><Badge tone="info">Hébergé par data.gouv.fr</Badge></>}
                    meta={<><p>{service.description}</p><p className="mt-1">{service.layers.length} couche{service.layers.length > 1 ? "s" : ""} · généré à partir de « {resource?.title} »</p></>}
                    actions={<CartesLink />}
                    tabs={[
                      { id: "access", label: "Accéder au service", content: <div className="space-y-3"><CopyField label="URL du service" value={url} /><a href={capabilitiesUrl(url)} onClick={(event) => event.preventDefault()} className="inline-flex items-center gap-1 text-[13px] text-[#000091] underline">Consulter le GetCapabilities<RiExternalLinkLine className="h-4 w-4" /></a></div> },
                      { id: "layers", label: "Couches", content: <LayersTable showTechnicalName rows={service.layers.map((layer) => { const source = sourceLayer(layer.sourceTables[0]); return { key: layer.technicalName, title: layer.title, technicalName: layer.technicalName, geometry: source?.geometry ?? "Point", featureCount: source?.featureCount, crs: source?.epsg.split(" ")[0] ?? "—" }; })} /> },
                      { id: "preview", label: "Aperçu", content: <MapPreview layers={service.layers.map((layer) => ({ id: layer.sourceTables[0], label: layer.title, geometry: sourceLayer(layer.sourceTables[0])?.geometry ?? "Point", detail: layer.technicalName }))} /> },
                      { id: "qgis", label: "Utiliser dans QGIS", content: <QgisHelp url={url} layerNames={service.layers.map((layer) => layer.technicalName)} /> },
                    ]}
                  />
                );
              })}

              {externalServices.map((service) => (
                <ResourceCard
                  key={service.id}
                  icon={<RiGlobalLine className="h-6 w-6 text-[#6e445a]" />}
                  title={service.title}
                  badges={<><Badge>WFS</Badge><Badge tone="external">Service externe</Badge></>}
                  meta={<><p>{service.description}</p><p className="mt-1">Fourni par {service.provider} · {service.layers.length} couche{service.layers.length > 1 ? "s" : ""} référencée{service.layers.length > 1 ? "s" : ""}</p></>}
                  actions={<CartesLink />}
                  tabs={[
                    { id: "access", label: "Accéder au service", content: <div className="space-y-3"><CopyField label="URL du service" value={service.url} /><a href={capabilitiesUrl(service.url)} onClick={(event) => event.preventDefault()} className="inline-flex items-center gap-1 text-[13px] text-[#000091] underline">Consulter le GetCapabilities<RiExternalLinkLine className="h-4 w-4" /></a><p className="text-[12px] text-[#666]">Ce service est hébergé par son producteur. Sa disponibilité ne dépend pas de data.gouv.fr.</p></div> },
                    { id: "layers", label: "Couches", content: <LayersTable showTechnicalName rows={service.layers.map((layer) => ({ key: layer.name, title: layer.title, technicalName: layer.name, geometry: layer.geometry, crs: layer.crs }))} /> },
                    { id: "preview", label: "Aperçu", content: <MapPreview layers={service.layers.map((layer) => ({ id: layer.name, label: layer.title, geometry: layer.geometry, detail: layer.name }))} /> },
                    { id: "qgis", label: "Utiliser dans QGIS", content: <QgisHelp url={service.url} layerNames={service.layers.map((layer) => layer.name)} /> },
                  ]}
                />
              ))}

              {resourceCount === 0 ? <p className="bg-white p-6 text-center text-[14px] text-[#666]">Aucune ressource n’est encore disponible.</p> : null}
            </div>
          </section>
        </div>

        <aside className="h-fit bg-white p-5">
          <h2 className="mb-4 text-[16px] font-bold">Informations</h2>
          <DatasetMetadata items={[
            ["Producteur", dataset.producer],
            ["Type d’accès", dataset.accessType === "open" ? "Ouvert" : "Restreint"],
            ...(dataset.accessType === "open" ? [["Licence", dataset.license] as [string, ReactNode]] : []),
            ["Fréquence de mise à jour", dataset.frequency],
            ["Couverture temporelle", `${formatDate(dataset.temporalStart)} – ${formatDate(dataset.temporalEnd)}`],
            ["Couverture spatiale", dataset.spatial],
            ["Granularité spatiale", dataset.granularity],
            ["Point de contact", "Service connaissance et valorisation des données"],
          ]} />
        </aside>
      </div>
    </main>
  );
}
