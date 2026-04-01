'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';

type Bbox = [number, number, number, number];
type MapBoundsSnapshot = {
  boundsByMap?: Record<string, Bbox>;
};

type MapLibreBoundsLike = [[number, number], [number, number]];

type MapInstance = {
  fitBounds: (
    bounds: MapLibreBoundsLike,
    options?: { padding?: number; duration?: number; maxZoom?: number },
  ) => void;
  addSource: (id: string, source: unknown) => void;
  addLayer: (layer: Record<string, unknown>) => void;
  getSource?: (id: string) => unknown;
  remove: () => void;
  on: (...args: unknown[]) => void;
  off: (...args: unknown[]) => void;
  isStyleLoaded?: () => boolean;
};

type MapLibreGlobal = {
  Map: new (options: Record<string, unknown>) => MapInstance;
};

type MapStyle = {
  version: number;
  glyphs?: string;
  sprite?: string;
  sources: Record<string, unknown>;
  layers: Array<Record<string, unknown>>;
};

type ResolvedTheme = 'light' | 'dark';

type SubwayThemeColors = {
  roads: string;
  buildings: string;
  water: string;
  background: string;
  parks: string;
  airports: string;
  runways: string;
  roadLabel: string;
  roadLabelHalo: string;
  neighborhoodLabel: string;
  neighborhoodLabelHalo: string;
  cityLabel: string;
  cityLabelHalo: string;
};

declare global {
  interface Window {
    maplibregl?: MapLibreGlobal;
  }
}

const MAPLIBRE_SCRIPT_SRC =
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
const MAPLIBRE_SCRIPT_ID = 'maplibre-gl-script';
const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const BOUNDS_SOURCE_ID = 'registry-map-preview-bounds';

const THEME_COLORS: Record<ResolvedTheme, SubwayThemeColors> = {
  light: {
    roads: '#DCDCDC',
    buildings: '#DDDDDD',
    water: '#9FC9EA',
    background: '#F2E7D3',
    parks: '#A9D8B6',
    airports: '#F0F1F5',
    runways: '#DFE2E7',
    roadLabel: '#807F7A',
    roadLabelHalo: '#FFFFFF',
    neighborhoodLabel: '#9CA3AF',
    neighborhoodLabelHalo: '#FFFFFF',
    cityLabel: '#5D6066',
    cityLabelHalo: '#FFFFFF',
  },
  dark: {
    roads: '#4A4A4A',
    buildings: '#454957',
    water: '#062036',
    background: '#0F1A24',
    parks: '#0B1715',
    airports: '#181C28',
    runways: '#242938',
    roadLabel: '#6E6E6E',
    roadLabelHalo: '#000000',
    neighborhoodLabel: '#6B7280',
    neighborhoodLabelHalo: '#000000',
    cityLabel: '#AFB3BA',
    cityLabelHalo: '#000000',
  },
};

function isMapTheme(value: string | undefined): value is ResolvedTheme {
  return value === 'light' || value === 'dark';
}

function shouldRemoveOverlayLayer(layerId: string): boolean {
  return (
    layerId === 'natural_earth' ||
    layerId.includes('graticule') ||
    layerId.includes('equator') ||
    layerId.includes('tropic') ||
    layerId.includes('latitude') ||
    layerId.includes('longitude')
  );
}

function isRoadLayer(layerId: string): boolean {
  return (
    layerId.includes('road') ||
    layerId.includes('street') ||
    layerId.includes('highway') ||
    layerId.includes('motorway') ||
    layerId.includes('bridge_') ||
    layerId.includes('tunnel_')
  );
}

function labelStyleForLayer(layerId: string, palette: SubwayThemeColors) {
  if (layerId.includes('highway-name') || layerId.includes('road_shield')) {
    return { text: palette.roadLabel, halo: palette.roadLabelHalo };
  }

  if (
    layerId.includes('city') ||
    layerId.includes('country') ||
    layerId.includes('state')
  ) {
    return { text: palette.cityLabel, halo: palette.cityLabelHalo };
  }

  return {
    text: palette.neighborhoodLabel,
    halo: palette.neighborhoodLabelHalo,
  };
}

async function buildThemedStyle(theme: ResolvedTheme): Promise<MapStyle> {
  const styleResponse = await fetch(BASE_STYLE_URL);
  if (!styleResponse.ok) {
    throw new Error(`Failed to fetch base map style (${styleResponse.status})`);
  }

  const baseStyle = (await styleResponse.json()) as MapStyle;
  const palette = THEME_COLORS[theme];

  const themedLayers = baseStyle.layers
    .filter((layer) => {
      const layerId = String(layer.id ?? '').toLowerCase();
      if (shouldRemoveOverlayLayer(layerId)) return false;

      if (String(layer.type ?? '') === 'symbol') {
        const layout = layer.layout as Record<string, unknown> | undefined;
        const hasText = Boolean(layout?.['text-field']);
        const hasIcon = Boolean(layout?.['icon-image']);
        if (!hasText || hasIcon || layerId.includes('shield')) return false;
      }

      return true;
    })
    .map((layer) => {
      const nextLayer: Record<string, unknown> = { ...layer };
      const originalLayout = layer.layout as
        | Record<string, unknown>
        | undefined;
      const originalPaint = layer.paint as Record<string, unknown> | undefined;
      if (originalLayout) nextLayer.layout = { ...originalLayout };
      if (originalPaint) nextLayer.paint = { ...originalPaint };

      const layerId = String(layer.id ?? '').toLowerCase();
      const layerType = String(layer.type ?? '');
      const layout = nextLayer.layout as Record<string, unknown> | undefined;
      const paint = nextLayer.paint as Record<string, unknown> | undefined;

      if (layerType === 'symbol' && layout?.['text-field']) {
        layout['text-field'] = [
          'coalesce',
          ['get', 'name_en'],
          ['get', 'name:en'],
          ['get', 'name_int'],
          ['get', 'name'],
        ];
      }

      if (!paint) return nextLayer;

      if (layerType === 'background') {
        paint['background-color'] = palette.background;
      }

      if (layerType === 'fill') {
        if ('fill-pattern' in paint) delete paint['fill-pattern'];

        if (layerId.includes('water')) {
          paint['fill-color'] = palette.water;
          paint['fill-outline-color'] = palette.water;
        } else if (layerId.includes('ice')) {
          paint['fill-color'] = palette.buildings;
          paint['fill-outline-color'] = palette.buildings;
        } else if (layerId === 'building' || layerId.includes('building-3d')) {
          paint['fill-color'] = palette.buildings;
          paint['fill-outline-color'] = palette.buildings;
        } else if (layerId.includes('aeroway')) {
          const value = layerId.includes('runway')
            ? palette.runways
            : palette.airports;
          paint['fill-color'] = value;
          paint['fill-outline-color'] = value;
        } else if (
          layerId.includes('park') ||
          layerId.includes('green') ||
          layerId.includes('landcover_wood') ||
          layerId.includes('landcover_grass') ||
          layerId.includes('landcover_wetland')
        ) {
          paint['fill-color'] = palette.parks;
          paint['fill-outline-color'] = palette.parks;
        } else if (
          layerId.includes('natural_earth') ||
          layerId.includes('landuse') ||
          layerId.includes('landcover')
        ) {
          paint['fill-color'] = palette.background;
          paint['fill-outline-color'] = palette.background;
        }
      }

      if (layerType === 'line') {
        if (layerId.includes('water')) {
          paint['line-color'] = palette.water;
        } else if (layerId === 'park_outline') {
          paint['line-color'] = palette.parks;
          paint['line-opacity'] = 0.25;
        } else if (
          layerId.includes('aeroway_runway') ||
          layerId.includes('aeroway_taxiway')
        ) {
          paint['line-color'] = palette.runways;
        } else if (layerId.includes('aeroway')) {
          paint['line-color'] = palette.airports;
        } else if (isRoadLayer(layerId)) {
          paint['line-color'] = palette.roads;
        } else if (layerId.includes('boundary')) {
          paint['line-color'] = palette.neighborhoodLabel;
        }
      }

      if (layerType === 'symbol') {
        const labelStyle = labelStyleForLayer(layerId, palette);
        paint['text-color'] = labelStyle.text;
        paint['text-halo-color'] = labelStyle.halo;
        paint['text-halo-width'] = 1.8;
      }

      return nextLayer;
    });

  return {
    ...baseStyle,
    layers: themedLayers,
  };
}

function isValidBbox(value: unknown): value is Bbox {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((part) => Number.isFinite(Number(part)))
  );
}

function bboxToPolygon(bbox: Bbox) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [minLng, minLat],
              [maxLng, minLat],
              [maxLng, maxLat],
              [minLng, maxLat],
              [minLng, minLat],
            ],
          ],
        },
      },
    ],
  };
}

function loadMapLibre(): Promise<MapLibreGlobal> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'));
  }
  if (window.maplibregl) return Promise.resolve(window.maplibregl);

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(
      MAPLIBRE_SCRIPT_ID,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.maplibregl) resolve(window.maplibregl);
      });
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load MapLibre script')),
      );
      return;
    }

    const script = document.createElement('script');
    script.id = MAPLIBRE_SCRIPT_ID;
    script.src = MAPLIBRE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (!window.maplibregl) {
        reject(
          new Error('MapLibre script loaded but window.maplibregl is missing'),
        );
        return;
      }
      resolve(window.maplibregl);
    };
    script.onerror = () => reject(new Error('Failed to load MapLibre script'));
    document.head.appendChild(script);
  });
}

export function RegistryMapPreview({ mapId }: { mapId: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [bbox, setBbox] = useState<Bbox | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>(
    'loading',
  );

  const mapTheme: ResolvedTheme = isMapTheme(resolvedTheme)
    ? resolvedTheme
    : 'light';

  useEffect(() => {
    let canceled = false;
    setStatus('loading');
    setBbox(null);

    void (async () => {
      try {
        const response = await fetch('/railyard/map-bounds.json', {
          cache: 'no-store',
        });
        if (!response.ok) {
          if (!canceled) setStatus('error');
          return;
        }

        const snapshot = (await response.json()) as MapBoundsSnapshot;
        const raw = snapshot.boundsByMap?.[mapId];
        if (!isValidBbox(raw)) {
          if (!canceled) setStatus('empty');
          return;
        }

        if (!canceled) {
          setBbox(raw);
          setStatus('ready');
        }
      } catch {
        if (!canceled) setStatus('error');
      }
    })();

    return () => {
      canceled = true;
    };
  }, [mapId]);

  useEffect(() => {
    if (status !== 'ready' || !bbox || !containerRef.current) return;

    let disposed = false;
    let map: MapInstance | null = null;
    let handleLoad: (() => void) | null = null;

    void (async () => {
      try {
        const maplibregl = await loadMapLibre();
        const style = await buildThemedStyle(mapTheme);
        if (disposed || !containerRef.current) return;

        map = new maplibregl.Map({
          container: containerRef.current,
          style,
          attributionControl: true,
          interactive: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          renderWorldCopies: false,
        });

        handleLoad = () => {
          if (!map || disposed) return;
          if (!map.getSource?.(BOUNDS_SOURCE_ID)) {
            map.addSource(BOUNDS_SOURCE_ID, {
              type: 'geojson',
              data: bboxToPolygon(bbox),
            });
            map.addLayer({
              id: `${BOUNDS_SOURCE_ID}-fill`,
              type: 'fill',
              source: BOUNDS_SOURCE_ID,
              paint: {
                'fill-color': '#1c7ed6',
                'fill-opacity': 0.12,
              },
            });
            map.addLayer({
              id: `${BOUNDS_SOURCE_ID}-line`,
              type: 'line',
              source: BOUNDS_SOURCE_ID,
              paint: {
                'line-color': '#1c7ed6',
                'line-width': 2,
                'line-opacity': 0.9,
              },
            });
          }
          map.fitBounds(
            [
              [bbox[0], bbox[1]],
              [bbox[2], bbox[3]],
            ],
            { padding: 30, duration: 0, maxZoom: 12 },
          );
        };

        map.on('load', handleLoad);
        if (map.isStyleLoaded?.()) handleLoad();
      } catch {
        if (!disposed) setStatus('error');
      }
    })();

    return () => {
      disposed = true;
      if (map && handleLoad) map.off('load', handleLoad);
      map?.remove();
    };
  }, [bbox, mapTheme, status]);

  if (status === 'loading') {
    return (
      <div className="flex h-[19rem] items-center justify-center rounded-xl border border-border/65 bg-muted/25 text-sm text-muted-foreground">
        Loading map preview...
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="flex h-[19rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center">
        <div className="space-y-2">
          <MapPin className="mx-auto size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Map bounds are not available for this city yet.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-[19rem] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 text-center">
        <div className="space-y-2">
          <AlertCircle className="mx-auto size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Unable to load this map preview right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/65 p-1.5 ring-1 ring-foreground/5">
      <div className="h-[19rem] w-full overflow-hidden rounded-lg">
        <div ref={containerRef} className="h-full w-full" aria-label="City map" />
      </div>
    </div>
  );
}
