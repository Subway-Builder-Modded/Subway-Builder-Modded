import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, 'public', 'railyard');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'map-bounds.json');

const REPO_OWNER = 'Subway-Builder-Modded';
const REPO_NAME = 'The-Railyard';
const REPO_BRANCH = 'main';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`;

const TOKEN =
  process.env['RAILYARD_GITHUB_TOKEN']?.trim() ||
  process.env['GITHUB_TOKEN']?.trim() ||
  process.env['GH_TOKEN']?.trim() ||
  '';

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function buildHeaders() {
  const headers = {
    Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
    'User-Agent': 'subway-builder-modded-website/map-bounds-cache',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  return headers;
}

async function fetchJson(pathname) {
  const url = `${RAW_BASE}/${pathname}`;
  const response = await fetch(url, { headers: buildHeaders() });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

function extractCoordinates(node, into) {
  if (!node) return;
  if (Array.isArray(node)) {
    if (node.length >= 2 && typeof node[0] === 'number' && typeof node[1] === 'number') {
      into.push([node[0], node[1]]);
      return;
    }
    for (const child of node) {
      extractCoordinates(child, into);
    }
  }
}

function computeBboxFromGeometry(geometry) {
  const coords = [];
  extractCoordinates(geometry?.coordinates, coords);
  if (coords.length === 0) return null;

  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(maxLat)
  ) {
    return null;
  }

  return [minLng, minLat, maxLng, maxLat];
}

function computeBboxFromGeoJson(geojson) {
  if (Array.isArray(geojson?.bbox) && geojson.bbox.length >= 4) {
    const [minLng, minLat, maxLng, maxLat] = geojson.bbox;
    if (
      [minLng, minLat, maxLng, maxLat].every((value) => Number.isFinite(Number(value)))
    ) {
      return [Number(minLng), Number(minLat), Number(maxLng), Number(maxLat)];
    }
  }

  if (geojson?.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
    let aggregate = null;
    for (const feature of geojson.features) {
      const featureBbox = computeBboxFromGeometry(feature?.geometry);
      if (!featureBbox) continue;
      if (!aggregate) {
        aggregate = featureBbox;
        continue;
      }
      aggregate = [
        Math.min(aggregate[0], featureBbox[0]),
        Math.min(aggregate[1], featureBbox[1]),
        Math.max(aggregate[2], featureBbox[2]),
        Math.max(aggregate[3], featureBbox[3]),
      ];
    }
    return aggregate;
  }

  if (geojson?.type === 'Feature') {
    return computeBboxFromGeometry(geojson.geometry);
  }

  return computeBboxFromGeometry(geojson);
}

function readMapIds(indexData) {
  if (Array.isArray(indexData)) {
    return indexData.filter((entry) => typeof entry === 'string');
  }
  if (Array.isArray(indexData?.maps)) {
    return indexData.maps.filter((entry) => typeof entry === 'string');
  }
  return [];
}

async function main() {
  ensureDir(OUTPUT_DIR);

  if (!TOKEN) {
    console.warn(
      '[map-bounds] Missing GitHub token (RAILYARD_GITHUB_TOKEN/GITHUB_TOKEN/GH_TOKEN). Using existing cache if present.',
    );
    return;
  }

  const previous = readJson(OUTPUT_FILE, {
    source: `${REPO_OWNER}/${REPO_NAME}@${REPO_BRANCH}`,
    generatedAt: null,
    boundsByMap: {},
    failedMapIds: [],
  });

  let mapIds = [];
  try {
    const indexData = await fetchJson('maps/index.json');
    mapIds = readMapIds(indexData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[map-bounds] Failed to fetch maps/index.json: ${message}`);
    if (existsSync(OUTPUT_FILE)) {
      console.warn('[map-bounds] Keeping existing map-bounds cache.');
      return;
    }
    throw error;
  }

  const boundsByMap = {};
  const failedMapIds = [];

  await Promise.all(
    mapIds.map(async (mapId) => {
      try {
        const geojson = await fetchJson(`maps/${encodeURIComponent(mapId)}/grid.geojson`);
        const bbox = computeBboxFromGeoJson(geojson);
        if (!bbox) {
          failedMapIds.push(mapId);
          return;
        }
        boundsByMap[mapId] = bbox;
      } catch {
        failedMapIds.push(mapId);
      }
    }),
  );

  const next = {
    ...previous,
    source: `${REPO_OWNER}/${REPO_NAME}@${REPO_BRANCH}`,
    generatedAt: new Date().toISOString(),
    mapCount: mapIds.length,
    cachedCount: Object.keys(boundsByMap).length,
    boundsByMap,
    failedMapIds: failedMapIds.sort((a, b) => a.localeCompare(b)),
  };

  writeJson(OUTPUT_FILE, next);

  console.log(
    `[map-bounds] Cached ${next.cachedCount}/${mapIds.length} map bounding boxes to ${OUTPUT_FILE}.`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[map-bounds] generation failed: ${message}`);
  process.exitCode = 0;
});
