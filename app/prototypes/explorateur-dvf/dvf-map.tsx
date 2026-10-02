"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import { RiAddLine, RiEarthLine, RiFocus3Line, RiMap2Line, RiPaletteLine, RiSubtractLine } from "@remixicon/react";
import type { ExpressionSpecification } from "maplibre-gl";

export type DvfMapScale = "national" | "departement" | "commune" | "parcelle";

export type DvfMapContext = {
  scale: DvfMapScale;
  label: string;
  code?: string;
  zoom: number;
  selectedParcel?: string;
};

export type DvfMapNavigationTarget = {
  context: DvfMapContext;
  center: [number, number];
  zoom: number;
  requestId: number;
};

export const initialDvfMapContext: DvfMapContext = {
  scale: "national",
  label: "France entière",
  zoom: 4.75,
};

const scaleByZoom = (zoom: number): DvfMapScale => {
  if (zoom < 8) return "national";
  if (zoom < 11) return "departement";
  if (zoom < 14) return "commune";
  return "parcelle";
};

const simulatedColor = (property: string): ExpressionSpecification => [
  "case",
  ["==", ["%", ["to-number", ["get", property], 0], 13], 0],
  "rgba(100,100,100,0.55)",
  [
    "interpolate",
    ["linear"],
    ["%", ["to-number", ["get", property], 0], 100],
    0,
    "#028758",
    50,
    "#FFF64E",
    99,
    "#CC000A",
  ],
];

function simulatedMetrics(code: string) {
  const hash = [...code].reduce((total, character) => total + character.charCodeAt(0), 0);
  return {
    price: 900 + (hash * 137) % 8900,
    mutations: 3 + (hash * 17) % 640,
    missing: hash % 13 === 0,
    unavailable: hash % 17 === 0,
  };
}

export default function DvfMap({
  onContextChange,
  navigationTarget,
  onColorsVisibilityChange,
}: {
  onContextChange?: (context: DvfMapContext) => void;
  navigationTarget?: DvfMapNavigationTarget | null;
  onColorsVisibilityChange?: (visible: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const contextRef = useRef<DvfMapContext>(initialDvfMapContext);
  const selectedCameraRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const [canReturnToSelection, setCanReturnToSelection] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const [colorsVisible, setColorsVisible] = useState(true);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !navigationTarget) return;
    contextRef.current = navigationTarget.context;
    selectedCameraRef.current = { center: navigationTarget.center, zoom: navigationTarget.zoom };
    setCanReturnToSelection(true);
    onContextChange?.(navigationTarget.context);
    map.flyTo({ center: navigationTarget.center, zoom: navigationTarget.zoom });
  }, [navigationTarget, onContextChange]);

  useEffect(() => {
    let disposed = false;

    async function renderMap() {
      if (!containerRef.current || mapRef.current) return;
      const maplibregl = await import("maplibre-gl");
      if (disposed || !containerRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: "https://openmaptiles.geo.data.gouv.fr/styles/osm-bright/style.json",
        center: [2.2, 46.45],
        zoom: 4.75,
        minZoom: 4,
        maxZoom: 18,
        attributionControl: { compact: true },
      });
      mapRef.current = map;

      const publishContext = (next: Partial<DvfMapContext>) => {
        const zoom = map.getZoom();
        const scale = next.scale ?? scaleByZoom(zoom);
        const previous = contextRef.current;
        const context: DvfMapContext = {
          scale,
          zoom,
          label:
            next.label ??
            (scale === "national"
              ? "France entière"
              : previous.scale === scale
                ? previous.label
                : scale === "departement"
                  ? "Département sélectionné"
                  : scale === "commune"
                    ? "Commune sélectionnée"
                    : "Sélectionnez une parcelle"),
          code: next.code ?? (previous.scale === scale ? previous.code : undefined),
          selectedParcel:
            scale === "parcelle"
              ? next.selectedParcel ?? previous.selectedParcel
              : undefined,
        };
        contextRef.current = context;
        onContextChange?.(context);
      };

      map.on("load", () => {
        map.addSource("dvf-admin", {
          type: "vector",
          url: "https://openmaptiles.geo.data.gouv.fr/data/decoupage-administratif.json",
        });
        map.addSource("dvf-cadastre", {
          type: "vector",
          url: "https://openmaptiles.geo.data.gouv.fr/data/cadastre.json",
        });
        map.addSource("dvf-satellite", {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256,
          attribution: "Imagerie © Esri",
        });

        const firstLabelLayer = map.getStyle().layers.find(
          (layer) => layer.type === "symbol",
        )?.id;
        map.addLayer({ id: "dvf-satellite", type: "raster", source: "dvf-satellite", layout: { visibility: "none" } }, firstLabelLayer);
        const layers: import("maplibre-gl").LayerSpecification[] = [
          { id: "dvf-epci-fill", type: "fill", source: "dvf-admin", "source-layer": "epcis", minzoom: 3, maxzoom: 8, paint: { "fill-color": simulatedColor("code"), "fill-opacity": 0.8 } },
          { id: "dvf-epci-line", type: "line", source: "dvf-admin", "source-layer": "epcis", minzoom: 3, maxzoom: 8, paint: { "line-color": "rgba(0,0,0,.55)", "line-width": 0.6 } },
          { id: "dvf-departement-hit", type: "fill", source: "dvf-admin", "source-layer": "departements", minzoom: 3, maxzoom: 8, paint: { "fill-color": "#ffffff", "fill-opacity": 0 } },
          { id: "dvf-commune-fill", type: "fill", source: "dvf-admin", "source-layer": "communes", minzoom: 8, maxzoom: 11, paint: { "fill-color": simulatedColor("code"), "fill-opacity": 0.8 } },
          { id: "dvf-commune-line", type: "line", source: "dvf-admin", "source-layer": "communes", minzoom: 8, maxzoom: 11, paint: { "line-color": "rgba(0,0,0,.55)", "line-width": 0.55 } },
          { id: "dvf-section-fill", type: "fill", source: "dvf-cadastre", "source-layer": "sections", minzoom: 11, maxzoom: 14, paint: { "fill-color": simulatedColor("id"), "fill-opacity": 0.8 } },
          { id: "dvf-section-line", type: "line", source: "dvf-cadastre", "source-layer": "sections", minzoom: 11, maxzoom: 14, paint: { "line-color": "rgba(0,0,0,.6)", "line-width": 0.7 } },
          { id: "dvf-parcelle-base", type: "fill", source: "dvf-cadastre", "source-layer": "parcelles", minzoom: 14, paint: { "fill-color": "#E5E5E5", "fill-opacity": 0.48 } },
          { id: "dvf-parcelle-fill", type: "fill", source: "dvf-cadastre", "source-layer": "parcelles", minzoom: 14, filter: ["!=", ["%", ["to-number", ["get", "numero"], 0], 4], 0], paint: { "fill-color": "#6A6AF4", "fill-opacity": 0.58 } },
          { id: "dvf-parcelle-line", type: "line", source: "dvf-cadastre", "source-layer": "parcelles", minzoom: 14, paint: { "line-color": "rgba(80,80,80,.52)", "line-width": 0.6 } },
          { id: "dvf-parcelle-hover", type: "line", source: "dvf-cadastre", "source-layer": "parcelles", minzoom: 14, filter: ["==", ["get", "id"], ""], paint: { "line-color": "#6A6AF4", "line-width": 2 } },
          { id: "dvf-parcelle-selected", type: "line", source: "dvf-cadastre", "source-layer": "parcelles", minzoom: 14, filter: ["==", ["get", "id"], ""], paint: { "line-color": "#000091", "line-width": 3 } },
        ];
        layers.forEach((layer) => map.addLayer(layer, firstLabelLayer));

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        map.on("mousemove", "dvf-parcelle-fill", (event) => {
          const id = String(event.features?.[0]?.properties?.id ?? "");
          map.setFilter("dvf-parcelle-hover", ["==", ["get", "id"], id]);
        });
        map.on("mouseleave", "dvf-parcelle-fill", () => {
          map.setFilter("dvf-parcelle-hover", ["==", ["get", "id"], ""]);
        });
        ["dvf-departement-hit", "dvf-commune-fill", "dvf-section-fill", "dvf-parcelle-fill"].forEach((layerId) => {
          map.on("mouseenter", layerId, () => { map.getCanvas().style.cursor = "pointer"; });
          map.on("mousemove", layerId, (event) => {
            const feature = event.features?.[0];
            if (!feature) return;
            const properties = feature.properties ?? {};
            const code = String(properties.code ?? properties.id ?? properties.numero ?? "0");
            const label = String(properties.nom ?? properties.id ?? `Parcelle ${properties.numero ?? ""}`);
            const metrics = simulatedMetrics(code);
            const mutationLabel = `${metrics.mutations.toLocaleString("fr-FR")} mutation${metrics.mutations > 1 ? "s" : ""}`;
            popup.setLngLat(event.lngLat).setHTML(
              metrics.unavailable
                ? `<strong>${label}</strong><br>Pas de données disponibles<br><span>Consultez notre FAQ pour en savoir plus</span>`
                : metrics.missing
                  ? `<strong>${label}</strong><br><strong>${mutationLabel}</strong><br><span>Pas assez de données pour faire une visualisation</span>`
                  : `<strong>${label}</strong><br><strong>${metrics.price.toLocaleString("fr-FR")} €</strong> par m²<br><strong>${mutationLabel}</strong>`,
            ).addTo(map);
          });
          map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; popup.remove(); });
        });

        map.on("click", "dvf-departement-hit", (event) => {
          const feature = event.features?.[0];
          if (!feature || map.getZoom() >= 8) return;
          const code = String(feature.properties?.code ?? "");
          const zoom = ["75", "92", "93", "94"].includes(code) ? 10.8 : 9;
          selectedCameraRef.current = { center: [event.lngLat.lng, event.lngLat.lat], zoom };
          setCanReturnToSelection(true);
          publishContext({ scale: "departement", code, label: String(feature.properties?.nom ?? "Département") });
          map.flyTo({ center: event.lngLat, zoom });
        });
        map.on("click", "dvf-commune-fill", (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const code = String(feature.properties?.code ?? "");
          const zoom = ["75056", "13055", "69123"].includes(code) ? 13.5 : 12;
          selectedCameraRef.current = { center: [event.lngLat.lng, event.lngLat.lat], zoom };
          setCanReturnToSelection(true);
          publishContext({ scale: "commune", code, label: String(feature.properties?.nom ?? "Commune") });
          map.flyTo({ center: event.lngLat, zoom });
        });
        map.on("click", "dvf-section-fill", (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const id = String(feature.properties?.id ?? "Section");
          selectedCameraRef.current = { center: [event.lngLat.lng, event.lngLat.lat], zoom: 15 };
          setCanReturnToSelection(true);
          publishContext({ scale: "parcelle", code: id, label: `Section ${feature.properties?.code ?? id}` });
          map.flyTo({ center: event.lngLat, zoom: 15 });
        });
        map.on("click", "dvf-parcelle-fill", (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const id = String(feature.properties?.id ?? "");
          selectedCameraRef.current = { center: [event.lngLat.lng, event.lngLat.lat], zoom: map.getZoom() };
          setCanReturnToSelection(true);
          map.setFilter("dvf-parcelle-selected", ["==", ["get", "id"], id]);
          publishContext({ scale: "parcelle", code: id, label: `Parcelle ${feature.properties?.section ?? ""} ${feature.properties?.numero ?? ""}`.trim(), selectedParcel: id });
        });
        publishContext(initialDvfMapContext);
      });

      map.on("zoomend", () => {
        const scale = scaleByZoom(map.getZoom());
        if (scale !== "parcelle" && map.getLayer("dvf-parcelle-selected")) {
          map.setFilter("dvf-parcelle-selected", ["==", ["get", "id"], ""]);
        }
        publishContext({ scale });
      });
    }

    void renderMap();
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onContextChange]);

  return (
    <div className="relative h-full min-h-[520px] w-full">
      <div ref={containerRef} className="dvf-map h-full min-h-[520px] w-full" aria-label="Carte interactive des prix immobiliers en France" />
      <div className="absolute right-5 top-5 z-10 flex flex-col overflow-hidden rounded border border-[#E5E5E5] bg-white shadow-[0_2px_8px_rgba(0,0,0,.15)]">
        <button type="button" onClick={() => mapRef.current?.zoomIn()} className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] text-[#161616] hover:bg-[#eeeeee] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]" aria-label="Zoomer"><RiAddLine aria-hidden className="h-5 w-5" /></button>
        <button type="button" onClick={() => mapRef.current?.zoomOut()} className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] text-[#161616] hover:bg-[#eeeeee] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]" aria-label="Dézoomer"><RiSubtractLine aria-hidden className="h-5 w-5" /></button>
        {canReturnToSelection ? <button type="button" onClick={() => { const camera = selectedCameraRef.current; if (camera) mapRef.current?.flyTo(camera); }} className="flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] text-[#161616] hover:bg-[#eeeeee] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091]" aria-label="Revenir à la zone sélectionnée" title="Revenir à la zone sélectionnée"><RiFocus3Line aria-hidden className="h-5 w-5" /></button> : null}
        <button type="button" aria-pressed={!colorsVisible} onClick={() => { const next = !colorsVisible; setColorsVisible(next); onColorsVisibilityChange?.(next); const opacityByLayer: Record<string, number> = { "dvf-epci-fill": 0.8, "dvf-commune-fill": 0.8, "dvf-section-fill": 0.8, "dvf-parcelle-base": 0.48, "dvf-parcelle-fill": 0.58 }; Object.entries(opacityByLayer).forEach(([layerId, opacity]) => { if (mapRef.current?.getLayer(layerId)) mapRef.current.setPaintProperty(layerId, "fill-opacity", next ? opacity : 0); }); }} className={`flex h-9 w-9 items-center justify-center border-b border-[#E5E5E5] text-[#161616] hover:bg-[#eeeeee] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091] ${!colorsVisible ? "bg-[#ececfe] text-[#000091]" : ""}`} aria-label={colorsVisible ? "Masquer les couleurs de données" : "Afficher les couleurs de données"} title={colorsVisible ? "Masquer les couleurs" : "Afficher les couleurs"}><RiPaletteLine aria-hidden className="h-5 w-5" /></button>
        <button type="button" aria-pressed={isSatellite} onClick={() => { const next = !isSatellite; setIsSatellite(next); if (mapRef.current?.getLayer("dvf-satellite")) mapRef.current.setLayoutProperty("dvf-satellite", "visibility", next ? "visible" : "none"); }} className={`flex h-9 w-9 items-center justify-center text-[#161616] hover:bg-[#eeeeee] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#000091] ${isSatellite ? "bg-[#ececfe] text-[#000091]" : ""}`} aria-label={isSatellite ? "Afficher la vue plan" : "Afficher la vue satellite"} title={isSatellite ? "Vue plan" : "Vue satellite"}>{isSatellite ? <RiMap2Line aria-hidden className="h-5 w-5" /> : <RiEarthLine aria-hidden className="h-5 w-5" />}</button>
      </div>
    </div>
  );
}
