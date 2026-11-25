"use client";

import { useMemo, useState } from "react";
import type { GeometryType } from "@/lib/publication-geo";
import { dsfrVisualizationColors } from "@/lib/dsfr-visualization-colors";

export type PreviewLayer = { id: string; label: string; geometry: GeometryType; detail?: string };

// Contour simplifié et fictif d’un département, dans un repère 400 × 300.
const territory = "150,22 228,14 288,38 312,88 302,140 282,190 262,238 232,284 192,280 176,240 150,204 118,172 98,122 114,70";

function seeded(id: string) {
  let seed = Array.from(id).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function featuresFor(id: string, geometry: GeometryType) {
  const random = seeded(id);
  const x = () => 135 + random() * 150;
  const y = () => 40 + random() * 225;
  if (geometry === "Point") return Array.from({ length: 46 }, () => ({ kind: "point" as const, x: x(), y: y() }));
  if (geometry === "Ligne") {
    return Array.from({ length: 6 }, () => {
      let px = x();
      let py = 30 + random() * 40;
      const points = [[px, py]];
      for (let i = 0; i < 7; i += 1) {
        px += (random() - 0.4) * 26;
        py += 22 + random() * 12;
        points.push([px, py]);
      }
      return { kind: "line" as const, d: points.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ") };
    });
  }
  return Array.from({ length: 11 }, () => {
    const cx = x();
    const cy = y();
    const radius = 7 + random() * 12;
    const d = Array.from({ length: 7 }, (_, i) => {
      const angle = (i / 7) * Math.PI * 2;
      const r = radius * (0.65 + random() * 0.5);
      return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
    }).join(" ");
    return { kind: "polygon" as const, d };
  });
}

/** Aperçu cartographique simulé : fond fictif, géométries générées, sélection des couches affichées. */
export function MapPreview({ layers, title = "Aperçu cartographique", emptyLabel = "Sélectionnez au moins une couche pour afficher l’aperçu." }: { layers: PreviewLayer[]; title?: string; emptyLabel?: string }) {
  const [hidden, setHidden] = useState<string[]>([]);
  const colored = useMemo(() => layers.map((layer, index) => ({ ...layer, color: dsfrVisualizationColors[index % dsfrVisualizationColors.length], features: featuresFor(layer.id, layer.geometry) })), [layers]);
  const visible = colored.filter((layer) => !hidden.includes(layer.id));
  // Polygones en dessous, puis lignes, puis points.
  const drawOrder = [...visible].sort((a, b) => ["Polygone", "Ligne", "Point"].indexOf(a.geometry) - ["Polygone", "Ligne", "Point"].indexOf(b.geometry));

  return (
    <figure className="border border-[#ddd] bg-white">
      <figcaption className="flex items-center justify-between gap-3 border-b border-[#ddd] px-3 py-2 text-[12px]">
        <span className="font-medium">{title}</span>
        <span className="text-[#666]">Aperçu simplifié · fond simulé</span>
      </figcaption>
      <div className="grid md:grid-cols-[1fr_220px]">
        <div className="relative bg-[#eef3f6]">
          <svg viewBox="0 0 400 300" className="block h-auto w-full" role="img" aria-label={`${title} : ${visible.map((layer) => layer.label).join(", ") || "aucune couche affichée"}`}>
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dde5ea" strokeWidth="1" /></pattern>
            </defs>
            <rect width="400" height="300" fill="url(#map-grid)" />
            <polygon points={territory} fill="#fbfbf8" stroke="#b9c2c8" strokeWidth="1.5" />
            <path d="M 300 20 C 315 80, 300 150, 285 200 S 255 270, 240 300" fill="none" stroke="#b8d4e6" strokeWidth="5" />
            {drawOrder.map((layer) => (
              <g key={layer.id}>
                {layer.features.map((feature, index) =>
                  feature.kind === "polygon" ? <polygon key={index} points={feature.d} fill={layer.color} fillOpacity={0.32} stroke={layer.color} strokeWidth={1} />
                  : feature.kind === "line" ? <polyline key={index} points={feature.d} fill="none" stroke={layer.color} strokeWidth={1.8} strokeLinejoin="round" />
                  : <circle key={index} cx={feature.x} cy={feature.y} r={2.6} fill={layer.color} stroke="#fff" strokeWidth={0.8} />,
                )}
              </g>
            ))}
          </svg>
          {layers.length === 0 || visible.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-[13px] text-[#3a3a3a]"><span className="bg-white/90 px-3 py-2">{layers.length === 0 ? emptyLabel : "Aucune couche affichée."}</span></p>
          ) : null}
        </div>
        {layers.length ? (
          <fieldset className="border-t border-[#ddd] p-3 md:border-l md:border-t-0">
            <legend className="sr-only">Couches affichées</legend>
            <p className="mb-2 text-[12px] font-medium" aria-hidden="true">Couches affichées</p>
            <div className="space-y-2">
              {colored.map((layer) => (
                <label key={layer.id} className="flex cursor-pointer items-start gap-2 text-[12px]">
                  <input type="checkbox" checked={!hidden.includes(layer.id)} onChange={() => setHidden((current) => current.includes(layer.id) ? current.filter((item) => item !== layer.id) : [...current, layer.id])} className="mt-0.5 h-4 w-4 accent-[#000091]" />
                  <span className="mt-1 h-2.5 w-2.5 shrink-0" style={{ background: layer.color, borderRadius: layer.geometry === "Point" ? "999px" : 0 }} aria-hidden="true" />
                  <span className="min-w-0"><span className="block">{layer.label}</span>{layer.detail ? <span className="block break-all font-mono text-[10px] text-[#666]">{layer.detail}</span> : null}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>
    </figure>
  );
}
