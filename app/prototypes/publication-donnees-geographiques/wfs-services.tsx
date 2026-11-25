"use client";

import { useState } from "react";
import { RiArrowDownSLine, RiCloseLine, RiDeleteBinLine, RiErrorWarningLine, RiGlobalLine, RiRefreshLine, RiSearchLine, RiServerLine } from "@remixicon/react";
import {
  DEFAULT_EXTERNAL_WFS_URL,
  WFS_RESPONSE_FORMATS,
  capabilitiesUrl,
  createPublishedLayer,
  externalCapabilitiesMock,
  formatCount,
  looksLikeWfsEndpoint,
  nextTechnicalNameFromTitle,
  wfsUrl,
  type ExternalWfs,
  type ExternalWfsLayer,
  type GeoPackageResource,
  type HostedWfs,
  type PublishedLayer,
  type ServiceErrors,
} from "@/lib/publication-geo";
import { MapPreview } from "./map-preview";
import { Badge, Field, OpenQuestion, Spinner, inputClass } from "./ui";

export function HostedWfsEditor({
  index,
  service,
  services,
  resource,
  keywords,
  accessLabel,
  errors,
  showErrors,
  onChange,
  onRemove,
}: {
  index: number;
  service: HostedWfs;
  services: HostedWfs[];
  resource: GeoPackageResource;
  keywords: string;
  accessLabel: string;
  errors: ServiceErrors;
  showErrors: boolean;
  onChange: (service: HostedWfs) => void;
  onRemove: () => void;
}) {
  const visibleError = (message?: string) => (showErrors ? message : undefined);
  const selectedKeys = service.layers.map((layer) => layer.sourceTables[0]);
  const exposedAttributes = resource.layers.filter((layer) => selectedKeys.includes(layer.key)).reduce((total, layer) => total + layer.columns.length, 0);

  const toggleLayer = (key: string) => {
    const source = resource.layers.find((layer) => layer.key === key);
    if (!source) return;
    const layers = selectedKeys.includes(key)
      ? service.layers.filter((layer) => layer.sourceTables[0] !== key)
      // Conserve l’ordre des tables du GeoPackage.
      : resource.layers.filter((layer) => layer.key === key || selectedKeys.includes(layer.key)).map((layer) => service.layers.find((item) => item.sourceTables[0] === layer.key) ?? createPublishedLayer(source, keywords));
    onChange({ ...service, layers });
  };
  const updateLayer = (key: string, patch: Partial<PublishedLayer>) => onChange({ ...service, layers: service.layers.map((layer) => (layer.sourceTables[0] === key ? { ...layer, ...patch } : layer)) });

  return (
    <article className="border border-[#000091] bg-white">
      <header className="flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#ececfe]"><RiServerLine className="h-6 w-6 text-[#000091]" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className="text-[16px] font-medium">Service WFS {index + 1}</h3><Badge tone="info">Hébergé par data.gouv.fr</Badge></div>
          <p className="mt-1 truncate text-[13px] text-[#3a3a3a]">{service.title || "Sans titre"}</p>
          <p className="mt-1 text-[12px] text-[#666]">{service.layers.length} couche{service.layers.length > 1 ? "s" : ""} · source : {resource.fileName}</p>
        </div>
        <button type="button" onClick={onRemove} aria-label={`Retirer le service WFS ${index + 1}`} className="shrink-0 border border-[#ddd] p-2 text-[#666] hover:bg-[#f6f6f6]"><RiDeleteBinLine className="h-4 w-4" /></button>
      </header>

      <div className="space-y-6 border-t border-[#ddd] bg-[#f6f6f6] p-5">
        <div>
          <p className="mb-1 text-[15px]">GeoPackage source</p>
          <p className="min-h-10 bg-[#e3e3e3] px-4 py-2 text-[13px] text-[#3a3a3a]">{resource.title} <span className="font-mono text-[12px] text-[#666]">· {resource.fileName}</span></p>
          <p className="mt-1 text-[12px] text-[#666]">Un service WFS est alimenté par un seul GeoPackage. Sa création ne modifie pas le fichier source.</p>
        </div>

        <div className="grid gap-5">
          <Field label="Titre du service" required error={visibleError(errors.title)}>
            <input value={service.title} aria-invalid={Boolean(visibleError(errors.title))} onChange={(event) => onChange({ ...service, title: event.target.value, technicalName: nextTechnicalNameFromTitle(service, event.target.value, services) })} className={inputClass} />
          </Field>
          <Field label="Nom technique du service" required hint="Généré à partir du titre. Il détermine l’URL du service : minuscules, chiffres et tirets." error={errors.technicalName}>
            <input value={service.technicalName} aria-invalid={Boolean(errors.technicalName)} onChange={(event) => onChange({ ...service, technicalName: event.target.value, technicalNameTouched: true })} className={`${inputClass} font-mono`} spellCheck={false} />
          </Field>
          {service.technicalNameTouched ? <button type="button" onClick={() => onChange({ ...service, technicalNameTouched: false, technicalName: nextTechnicalNameFromTitle({ ...service, technicalNameTouched: false }, service.title, services) })} className="-mt-3 inline-flex items-center gap-1 self-start text-[12px] text-[#000091] underline"><RiRefreshLine className="h-3.5 w-3.5" />Regénérer depuis le titre</button> : null}
          <div><p className="mb-1 text-[12px] text-[#666]">URL du service</p><p className="break-all border-b-2 border-[#929292] bg-[#e3e3e3] px-4 py-2 font-mono text-[12px] text-[#666]">{wfsUrl(service.technicalName || "…")}</p></div>
          <Field label="Description du service"><textarea rows={3} value={service.description} onChange={(event) => onChange({ ...service, description: event.target.value })} className={inputClass} /></Field>
        </div>

        <fieldset>
          <legend className="text-[14px] font-medium">Couches exposées</legend>
          <p className="mt-1 text-[12px] leading-5 text-[#666]">Leurs métadonnées sont préremplies depuis les couches sources et sont propres à ce service : les modifier ne change ni la couche source ni le GeoPackage.</p>
          {visibleError(errors.layers) ? <p role="alert" className="mt-2 text-[12px] text-[#ce0500]">{errors.layers}</p> : null}
          <div className="mt-3 space-y-2">
            {resource.layers.map((source) => {
              const published = service.layers.find((layer) => layer.sourceTables[0] === source.key);
              const nameError = errors.layerNames[source.key];
              return (
                <div key={source.key} className={`border bg-white ${published ? "border-[#000091]" : "border-[#ddd]"}`}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-3 text-[13px]">
                    <input type="checkbox" checked={Boolean(published)} onChange={() => toggleLayer(source.key)} className="h-4 w-4 accent-[#000091]" />
                    <span className="min-w-0 flex-1"><span className="block">{published?.title || source.label}</span><span className="block font-mono text-[11px] text-[#666]">table {source.tableName}</span></span>
                    <span className="text-[11px] text-[#666]">{source.geometry} · {formatCount(source.featureCount)}</span>
                  </label>
                  {published ? (
                    <details open={Boolean(nameError)} className="group border-t border-[#ddd]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-[12px] text-[#000091] [&::-webkit-details-marker]:hidden">
                        <span>Métadonnées de la couche publiée <span className="font-mono text-[#666]">· {published.technicalName || "…"}</span>{nameError ? <span className="ml-2 text-[#ce0500]">· à corriger</span> : null}</span>
                        <RiArrowDownSLine className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
                      </summary>
                      <div className="grid gap-4 bg-[#f6f6f6] p-4 md:grid-cols-2">
                        <Field label="Nom technique" required hint="Minuscules, chiffres et tirets bas." error={nameError}><input value={published.technicalName} aria-invalid={Boolean(nameError)} onChange={(event) => updateLayer(source.key, { technicalName: event.target.value })} className={`${inputClass} font-mono`} spellCheck={false} /></Field>
                        <Field label="Titre"><input value={published.title} onChange={(event) => updateLayer(source.key, { title: event.target.value })} className={inputClass} /></Field>
                        <div className="md:col-span-2"><Field label="Description"><textarea rows={2} value={published.description} onChange={(event) => updateLayer(source.key, { description: event.target.value })} className={inputClass} /></Field></div>
                        <div className="md:col-span-2"><Field label="Mots-clés" hint="Séparés par des virgules."><input value={published.keywords} onChange={(event) => updateLayer(source.key, { keywords: event.target.value })} className={inputClass} /></Field></div>
                        <button type="button" onClick={() => updateLayer(source.key, createPublishedLayer(source, keywords))} className="inline-flex items-center gap-1 justify-self-start text-[12px] text-[#000091] underline md:col-span-2"><RiRefreshLine className="h-3.5 w-3.5" />Reprendre les métadonnées de la couche source</button>
                      </div>
                    </details>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3"><OpenQuestion>Ici, une couche publiée correspond à une table du GeoPackage. Les correspondances avancées entre tables sources et couches publiées restent à définir.</OpenQuestion></div>
        </fieldset>

        <MapPreview
          key={selectedKeys.join("|")}
          title="Prévisualisation avant création"
          layers={service.layers.map((layer) => {
            const source = resource.layers.find((item) => item.key === layer.sourceTables[0]);
            return { id: layer.sourceTables[0], label: layer.title || source?.label || layer.technicalName, geometry: source?.geometry ?? "Point", detail: layer.technicalName };
          })}
        />

        <section className="border-y border-[#ddd] bg-white px-3 py-3" aria-label="Configuration automatique">
          <h4 className="text-[13px] font-medium">Configuration automatique</h4>
          <dl className="mt-2 grid gap-x-5 gap-y-2 text-[12px] sm:grid-cols-2">
            <div><dt className="text-[#666]">Formats de réponse</dt><dd>{WFS_RESPONSE_FORMATS.join(", ")}</dd></div>
            <div><dt className="text-[#666]">Attributs</dt><dd>Tous les attributs exposés ({exposedAttributes})</dd></div>
            <div><dt className="text-[#666]">Projection</dt><dd>Celle des couches sources (EPSG:2154)</dd></div>
            <div><dt className="text-[#666]">Droits d’accès</dt><dd>Hérités du jeu de données ({accessLabel})</dd></div>
          </dl>
        </section>
      </div>
    </article>
  );
}

type ReferencePhase = { phase: "url"; error?: string } | { phase: "analyzing" } | { phase: "select" };

/** Parcours distinct : référencer un WFS public existant sans le recréer. */
export function ExternalWfsReference({ onAdd, onCancel }: { onAdd: (service: ExternalWfs) => void; onCancel: () => void }) {
  const [state, setState] = useState<ReferencePhase>({ phase: "url" });
  const [url, setUrl] = useState(DEFAULT_EXTERNAL_WFS_URL);
  const [title, setTitle] = useState(externalCapabilitiesMock.title);
  const [description, setDescription] = useState(externalCapabilitiesMock.description);
  const [selected, setSelected] = useState<string[]>(externalCapabilitiesMock.layers.map((layer) => layer.name));

  const analyze = () => {
    if (!/^https?:\/\/\S+$/i.test(url.trim())) {
      setState({ phase: "url", error: "Saisissez une URL valide, commençant par https://." });
      return;
    }
    setState({ phase: "analyzing" });
    window.setTimeout(() => {
      if (!looksLikeWfsEndpoint(url.trim())) setState({ phase: "url", error: "Aucun document GetCapabilities WFS n’a été trouvé à cette adresse. Vérifiez qu’il s’agit bien du point d’accès d’un service WFS public." });
      else setState({ phase: "select" });
    }, 1300);
  };

  const add = () => {
    const layers: ExternalWfsLayer[] = externalCapabilitiesMock.layers.filter((layer) => selected.includes(layer.name)) as ExternalWfsLayer[];
    onAdd({ id: `ext-${Date.now()}`, origin: "external", url: url.trim(), provider: externalCapabilitiesMock.provider, version: externalCapabilitiesMock.version, title, description, layers });
  };

  return (
    <article className="border border-[#000091] bg-white">
      <header className="flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#fee7fc]"><RiGlobalLine className="h-6 w-6 text-[#6e445a]" /></span>
        <div className="min-w-0 flex-1"><h3 className="text-[16px] font-medium">Référencer un service WFS externe</h3><p className="mt-1 text-[13px] leading-5 text-[#666]">Le service reste hébergé par son producteur. data.gouv.fr conserve son URL et décrit ses couches.</p></div>
        <button type="button" onClick={onCancel} aria-label="Fermer" className="shrink-0 p-2 text-[#666] hover:bg-[#f6f6f6]"><RiCloseLine className="h-4 w-4" /></button>
      </header>
      <div className="space-y-5 border-t border-[#ddd] bg-[#f6f6f6] p-5">
        <Field label="URL du service WFS" required hint="Point d’accès public du service, avec ou sans paramètres." error={state.phase === "url" ? state.error : undefined}>
          <input value={url} aria-invalid={state.phase === "url" && Boolean(state.error)} onChange={(event) => { setUrl(event.target.value); if (state.phase !== "analyzing") setState({ phase: "url" }); }} className={`${inputClass} font-mono`} spellCheck={false} />
        </Field>
        {state.phase !== "select" ? (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={analyze} disabled={state.phase === "analyzing"} className="inline-flex items-center gap-2 bg-[#000091] px-4 py-2 text-[13px] font-medium text-white disabled:bg-[#e5e5e5] disabled:text-[#929292]">
              {state.phase === "analyzing" ? <><Spinner />Lecture du GetCapabilities…</> : <><RiSearchLine className="h-4 w-4" />Analyser le service</>}
            </button>
            <button type="button" onClick={onCancel} className="text-[13px] text-[#000091] underline">Annuler</button>
          </div>
        ) : (
          <>
            <section className="border-l-4 border-[#18753c] bg-white p-4">
              <p className="text-[13px] font-medium">Service détecté</p>
              <dl className="mt-2 grid gap-2 text-[12px] sm:grid-cols-3">
                <div><dt className="text-[#666]">Fournisseur</dt><dd>{externalCapabilitiesMock.provider}</dd></div>
                <div><dt className="text-[#666]">Version WFS</dt><dd>{externalCapabilitiesMock.version}</dd></div>
                <div><dt className="text-[#666]">Couches annoncées</dt><dd>{externalCapabilitiesMock.layers.length}</dd></div>
              </dl>
              <a href={capabilitiesUrl(url)} onClick={(event) => event.preventDefault()} className="mt-2 inline-block break-all font-mono text-[11px] text-[#000091] underline">{capabilitiesUrl(url)}</a>
            </section>
            <p className="text-[12px] text-[#666]">Titre et description sont repris du GetCapabilities et peuvent être complétés.</p>
            <Field label="Titre" required><input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} /></Field>
            <Field label="Description"><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} /></Field>
            <fieldset>
              <legend className="text-[14px] font-medium">Couches à référencer</legend>
              <div className="mt-3 divide-y divide-[#ddd] border-y border-[#ddd] bg-white">
                {externalCapabilitiesMock.layers.map((layer) => (
                  <label key={layer.name} className="flex cursor-pointer items-center gap-3 px-3 py-3 text-[13px]">
                    <input type="checkbox" checked={selected.includes(layer.name)} onChange={() => setSelected((current) => current.includes(layer.name) ? current.filter((item) => item !== layer.name) : [...current, layer.name])} className="h-4 w-4 accent-[#000091]" />
                    <span className="min-w-0 flex-1"><span className="block">{layer.title}</span><span className="block break-all font-mono text-[11px] text-[#666]">{layer.name}</span></span>
                    <span className="text-[11px] text-[#666]">{layer.geometry} · {layer.crs}</span>
                  </label>
                ))}
              </div>
              {selected.length === 0 ? <p role="alert" className="mt-2 text-[12px] text-[#ce0500]">Sélectionnez au moins une couche.</p> : null}
            </fieldset>
            <p className="flex gap-2 text-[12px] leading-5 text-[#666]"><RiErrorWarningLine className="mt-0.5 h-4 w-4 shrink-0" />Les métadonnées ne sont pas synchronisées automatiquement avec le service après le référencement.</p>
            <div className="flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setState({ phase: "url" })} className="px-3 py-2 text-[13px] text-[#000091] underline">Changer d’URL</button>
              <button type="button" onClick={add} disabled={selected.length === 0 || !title.trim()} className="bg-[#000091] px-4 py-2 text-[13px] font-medium text-white disabled:bg-[#e5e5e5] disabled:text-[#929292]">Référencer ce service</button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

export function ExternalWfsSummary({ service, onRemove }: { service: ExternalWfs; onRemove: () => void }) {
  return (
    <article className="flex items-start gap-4 border border-[#ddd] bg-white p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#fee7fc]"><RiGlobalLine className="h-6 w-6 text-[#6e445a]" /></span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-[15px] font-medium">{service.title}</h3><Badge tone="external">WFS externe</Badge></div>
        <p className="mt-1 break-all font-mono text-[11px] text-[#666]">{service.url}</p>
        <p className="mt-2 text-[12px] text-[#666]">{service.provider} · {service.layers.length} couche{service.layers.length > 1 ? "s" : ""} référencée{service.layers.length > 1 ? "s" : ""} : {service.layers.map((layer) => layer.title).join(", ")}</p>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Retirer ${service.title}`} className="shrink-0 border border-[#ddd] p-2 text-[#666] hover:bg-[#f6f6f6]"><RiDeleteBinLine className="h-4 w-4" /></button>
    </article>
  );
}
