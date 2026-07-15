"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import { useEffect, useRef, useState } from "react";
import { RiFullscreenExitLine, RiFullscreenLine } from "@remixicon/react";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { MapSpec } from "@/app/api/prototypes/explorateur-sql-et-ia/agent/types";

type AssistantMapProps = {
  spec: MapSpec;
  data: Record<string, unknown>[];
  source?: string;
};

const boundaryUrls = {
  "france-regions":
    "/api/prototypes/explorateur-sql-et-ia/agent/boundaries?level=regions",
  "france-departments":
    "/api/prototypes/explorateur-sql-et-ia/agent/boundaries?level=departments",
} as const;

const baseStyle = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

function asNumber(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function displayValue(value: unknown) {
  if (typeof value === "number") {
    return value.toLocaleString("fr-FR");
  }

  return String(value ?? "—");
}

function escapeHtml(value: unknown) {
  return displayValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeGeographicCode(value: unknown) {
  const code = String(value ?? "").trim().toUpperCase();
  return /^\d$/.test(code) ? code.padStart(2, "0") : code;
}

function extractGeographicCode(value: unknown) {
  const normalized = normalizeGeographicCode(value);
  const match = normalized.match(/^(?:FR[- ]?)?(2A|2B|\d{1,3})(?:\b|\s|[-–—_:])/i);
  return match ? normalizeGeographicCode(match[1]) : normalized;
}

function normalizeGeographicName(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^(?:fr[- ]?)?(?:2a|2b|\d{1,3})\s*[-–—_:]\s*/i, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pointCollection(
  spec: Extract<MapSpec, { type: "points" }>,
  rows: Record<string, unknown>[],
): FeatureCollection {
  const features = rows.flatMap<Feature>((row, index) => {
    const latitude = asNumber(row[spec.latitudeField]);
    const longitude = asNumber(row[spec.longitudeField]);

    if (latitude === undefined || longitude === undefined) {
      return [];
    }

    return [{
      type: "Feature",
      id: index,
      geometry: { type: "Point", coordinates: [longitude, latitude] },
      properties: {
        label: spec.labelField ? displayValue(row[spec.labelField]) : `Point ${index + 1}`,
        value: spec.valueField ? asNumber(row[spec.valueField]) ?? 1 : 1,
        valueLabel: spec.valueField ? displayValue(row[spec.valueField]) : undefined,
        category: spec.colorField ? displayValue(row[spec.colorField]) : undefined,
      },
    }];
  });

  return { type: "FeatureCollection", features };
}

function getGeometryBounds(
  geometry: Geometry,
  bounds: [[number, number], [number, number]] | undefined,
  metropolitanOnly = false,
) {
  const visit = (coordinates: unknown): void => {
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      const point: [number, number] = [coordinates[0], coordinates[1]];
      if (
        metropolitanOnly &&
        (point[0] < -6 || point[0] > 10 || point[1] < 41 || point[1] > 52)
      ) {
        return;
      }
      if (!bounds) {
        bounds = [
          [point[0], point[1]],
          [point[0], point[1]],
        ];
      } else {
        bounds[0][0] = Math.min(bounds[0][0], point[0]);
        bounds[0][1] = Math.min(bounds[0][1], point[1]);
        bounds[1][0] = Math.max(bounds[1][0], point[0]);
        bounds[1][1] = Math.max(bounds[1][1], point[1]);
      }
      return;
    }

    if (Array.isArray(coordinates)) {
      coordinates.forEach(visit);
    }
  };

  if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach((item) => {
      bounds = getGeometryBounds(item, bounds, metropolitanOnly);
    });
  } else {
    visit(geometry.coordinates);
  }

  return bounds;
}

export default function AssistantMap({ spec, data, source }: AssistantMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const popupRef = useRef<import("maplibre-gl").Popup | null>(null);
  const fittedBoundsRef = useRef<[[number, number], [number, number]] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsFullscreen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isFullscreen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const frame = window.requestAnimationFrame(() => {
      popupRef.current?.remove();
      popupRef.current = null;
      map.resize();
      const bounds = fittedBoundsRef.current;
      if (bounds) {
        map.fitBounds(bounds, {
          padding: isFullscreen ? 64 : 28,
          maxZoom: 11,
          duration: 0,
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isFullscreen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let resizeFrame: number | undefined;

    async function renderMap() {
      try {
        setError(null);
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !container) return;

        let collection: FeatureCollection<Geometry, GeoJsonProperties>;
        let choroplethRange: [number, number] = [0, 1];
        const availableFields = new Set(data.flatMap((row) => Object.keys(row)));

        if (spec.type === "points") {
          if (
            !availableFields.has(spec.latitudeField) ||
            !availableFields.has(spec.longitudeField)
          ) {
            throw new Error("Les colonnes de latitude et longitude sont absentes du résultat.");
          }
          collection = pointCollection(spec, data);
          if (collection.features.length === 0) {
            throw new Error("Aucune coordonnée valide n’a été trouvée.");
          }
        } else {
          if (
            !availableFields.has(spec.dataKey) ||
            !availableFields.has(spec.valueField)
          ) {
            throw new Error("Le code géographique ou la mesure est absent du résultat.");
          }
          const response = await fetch(boundaryUrls[spec.boundary]);
          if (!response.ok) {
            throw new Error("Les contours géographiques sont indisponibles.");
          }

          const boundaries = (await response.json()) as FeatureCollection;
          if (
            boundaries.type !== "FeatureCollection" ||
            !Array.isArray(boundaries.features)
          ) {
            throw new Error("Le fichier de contours n’est pas un GeoJSON valide.");
          }
          const rowsByCode = new Map<string, Record<string, unknown>>();
          const rowsByName = new Map<string, Record<string, unknown>>();

          data.forEach((row) => {
            const rawKey = row[spec.dataKey];
            rowsByCode.set(extractGeographicCode(rawKey), row);
            rowsByName.set(normalizeGeographicName(rawKey), row);
          });
          let matchedFeatureCount = 0;
          collection = {
            ...boundaries,
            features: boundaries.features
              .filter((feature) => feature?.geometry)
              .map((feature) => {
              const properties = feature.properties ?? {};
              const row =
                rowsByCode.get(
                  normalizeGeographicCode(properties[spec.boundaryKey]),
                ) ?? rowsByName.get(normalizeGeographicName(properties.nom));
              const mapValue = row ? asNumber(row[spec.valueField]) : undefined;

              if (mapValue !== undefined) {
                matchedFeatureCount += 1;
              }

              return {
                ...feature,
                properties: {
                  ...properties,
                  mapValueLabel: row ? displayValue(row[spec.valueField]) : "Aucune donnée",
                  mapLabel:
                    row && spec.labelField
                      ? displayValue(row[spec.labelField])
                      : displayValue(properties.nom),
                  ...(mapValue !== undefined ? { mapValue } : {}),
                },
              };
            }),
          };
          if (matchedFeatureCount === 0) {
            throw new Error(
              "Aucun département ou région du résultat ne correspond aux contours administratifs.",
            );
          }
          const values = collection.features
            .map((feature) => asNumber(feature.properties?.mapValue))
            .filter((value): value is number => value !== undefined);
          if (values.length > 0) {
            choroplethRange = [Math.min(...values), Math.max(...values)];
          }
        }

        map = new maplibregl.Map({
          container,
          style: baseStyle,
          center: [2.4, 46.6],
          zoom: 4.2,
          attributionControl: false,
        });
        mapRef.current = map;
        resizeObserver = new ResizeObserver(() => {
          if (resizeFrame !== undefined) {
            window.cancelAnimationFrame(resizeFrame);
          }
          resizeFrame = window.requestAnimationFrame(() => {
            if (!map || cancelled) return;
            popupRef.current?.remove();
            popupRef.current = null;
            map.resize();
            const bounds = fittedBoundsRef.current;
            if (bounds) {
              map.fitBounds(bounds, {
                padding: Math.max(
                  18,
                  Math.min(64, Math.round(container.clientWidth * 0.06)),
                ),
                maxZoom: 11,
                duration: 0,
              });
            }
          });
        });
        resizeObserver.observe(container);
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          if (!map || cancelled) return;
          map.addSource("assistant-map-data", {
            type: "geojson",
            data: collection,
            cluster: spec.type === "points" && (spec.cluster ?? true),
            clusterMaxZoom: 12,
            clusterRadius: 46,
          });

          if (spec.type === "points") {
            map.addLayer({
              id: "assistant-map-clusters",
              type: "circle",
              source: "assistant-map-data",
              filter: ["has", "point_count"],
              paint: {
                "circle-color": "#000091",
                "circle-opacity": 0.88,
                "circle-radius": ["step", ["get", "point_count"], 16, 100, 22, 750, 28],
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 2,
              },
            });
            map.addLayer({
              id: "assistant-map-cluster-count",
              type: "symbol",
              source: "assistant-map-data",
              filter: ["has", "point_count"],
              layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 11 },
              paint: { "text-color": "#ffffff" },
            });
            map.addLayer({
              id: "assistant-map-points",
              type: "circle",
              source: "assistant-map-data",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-color": "#000091",
                "circle-opacity": 0.8,
                "circle-radius": spec.valueField
                  ? ["interpolate", ["linear"], ["sqrt", ["max", ["get", "value"], 1]], 1, 4, 100, 16]
                  : 6,
                "circle-stroke-color": "#ffffff",
                "circle-stroke-width": 1.5,
              },
            });

            map.on("click", "assistant-map-clusters", async (event) => {
              const feature = event.features?.[0];
              const clusterId = feature?.properties?.cluster_id;
              const sourceObject = map?.getSource("assistant-map-data") as import("maplibre-gl").GeoJSONSource;
              if (!feature || typeof clusterId !== "number") return;
              const zoom = await sourceObject.getClusterExpansionZoom(clusterId);
              const coordinates = (feature.geometry as GeoJSON.Point).coordinates;
              map?.easeTo({ center: [coordinates[0], coordinates[1]], zoom });
            });
            map.on("click", "assistant-map-points", (event) => {
              const feature = event.features?.[0];
              if (!feature || feature.geometry.type !== "Point") return;
              const details = [feature.properties?.label, feature.properties?.valueLabel]
                .filter(Boolean)
                .map((item) => `<div>${escapeHtml(item)}</div>`)
                .join("");
              popupRef.current?.remove();
              popupRef.current = new maplibregl.Popup({
                offset: 10,
                maxWidth: "min(260px, calc(100vw - 32px))",
              })
                .setLngLat(feature.geometry.coordinates as [number, number])
                .setHTML(details)
                .addTo(map as import("maplibre-gl").Map);
            });
          } else {
            map.addLayer({
              id: "assistant-map-polygons",
              type: "fill",
              source: "assistant-map-data",
              paint: {
                "fill-color": [
                  "case",
                  ["has", "mapValue"],
                  [
                    "interpolate",
                    ["linear"],
                    ["get", "mapValue"],
                    choroplethRange[0],
                    "#ececfe",
                    choroplethRange[0] === choroplethRange[1]
                      ? choroplethRange[1] + 1
                      : choroplethRange[1],
                    "#000091",
                  ],
                  "#e5e5e5",
                ],
                "fill-opacity": ["case", ["has", "mapValue"], 0.78, 0.38],
                "fill-outline-color": "#666666",
              },
            });
            map.addLayer({
              id: "assistant-map-borders",
              type: "line",
              source: "assistant-map-data",
              paint: { "line-color": "#6a6a6a", "line-width": 0.7 },
            });
            map.on("click", "assistant-map-polygons", (event) => {
              const feature = event.features?.[0];
              if (!feature) return;
              popupRef.current?.remove();
              popupRef.current = new maplibregl.Popup({
                maxWidth: "min(260px, calc(100vw - 32px))",
              })
                .setLngLat(event.lngLat)
                .setHTML(`<strong>${escapeHtml(feature.properties?.mapLabel)}</strong><div>${escapeHtml(feature.properties?.mapValueLabel)}</div>`)
                .addTo(map as import("maplibre-gl").Map);
            });
          }

          const bounds = collection.features.reduce<[[number, number], [number, number]] | undefined>(
            (current, feature) =>
              getGeometryBounds(
                feature.geometry,
                current,
                spec.type === "choropleth",
              ),
            undefined,
          );
          if (bounds) {
            fittedBoundsRef.current = bounds;
            map.fitBounds(bounds, {
              padding: 28,
              maxZoom: 11,
              duration: 0,
            });
          }
        });
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "La carte n’a pas pu être affichée.");
        }
      }
    }

    void renderMap();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (resizeFrame !== undefined) {
        window.cancelAnimationFrame(resizeFrame);
      }
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current = null;
      fittedBoundsRef.current = null;
      map?.remove();
    };
  }, [data, spec]);

  return (
    <div
      className={
        isFullscreen
          ? "assistant-map fixed inset-0 z-[150] flex flex-col overflow-hidden bg-[#FFFFFF]"
          : "assistant-map overflow-hidden rounded border border-[#E5E5E5] bg-[#FFFFFF]"
      }
      data-fullscreen={isFullscreen ? "true" : "false"}
    >
      <div className="relative z-20 flex min-h-10 shrink-0 items-center justify-between gap-3 border-b border-[#E5E5E5] bg-[#FFFFFF] px-3 py-2">
        <p className="min-w-0 truncate text-[12px] font-medium text-[#161616]">{spec.title}</p>
        <button
          type="button"
          onClick={() => setIsFullscreen((current) => !current)}
          className={`relative z-30 flex h-8 shrink-0 items-center justify-center gap-2 border border-[#E5E5E5] bg-[#FFFFFF] text-[12px] font-medium text-[#3a3a3a] hover:bg-[#f6f6f6] ${
            isFullscreen ? "px-3" : "w-8"
          }`}
          aria-label={isFullscreen ? "Quitter le plein écran" : "Afficher la carte en plein écran"}
          title={isFullscreen ? "Quitter le plein écran" : "Afficher en plein écran"}
        >
          {isFullscreen ? (
            <>
              <RiFullscreenExitLine aria-hidden className="h-4 w-4" />
              <span>Réduire</span>
            </>
          ) : (
            <RiFullscreenLine aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
      {error ? (
        <div className={`flex items-center justify-center px-6 text-center text-[12px] leading-5 text-[#ce0500] ${isFullscreen ? "min-h-0 flex-1" : "h-[280px]"}`}>
          {error}
        </div>
      ) : (
        <div className={isFullscreen ? "relative z-0 min-h-0 w-full flex-1" : "relative z-0 h-[280px] w-full"}>
          <div
            ref={containerRef}
            className="absolute inset-0"
            role="img"
            aria-label={spec.title}
          />
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className={`absolute bottom-1 right-1 z-10 max-w-[calc(100%_-_8px)] truncate bg-white/90 px-1.5 py-0.5 leading-3 text-[#3A3A3A] shadow-[0_1px_3px_rgba(0,0,0,0.12)] hover:text-[#000091] hover:underline ${
              isFullscreen ? "text-[10px]" : "text-[8px]"
            }`}
            title="© OpenStreetMap contributors"
          >
            © OpenStreetMap contributors
          </a>
        </div>
      )}
      {source ? (
        <p className="truncate border-t border-[#E5E5E5] px-3 py-1.5 text-[10px] text-[#666666]" title={source}>
          Source : {source}
        </p>
      ) : null}
    </div>
  );
}
