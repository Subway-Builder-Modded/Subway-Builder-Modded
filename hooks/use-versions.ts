'use client';

import { useState, useEffect } from 'react';
import {
  getCustomVersions,
  getGithubReleases,
} from '@/lib/railyard/github-releases';
import type { UpdateConfig, VersionInfo } from '@/types/registry';

const GAME_DEP_KEY = 'subway-builder';

interface ManifestDeps {
  dependencies?: Record<string, string>;
}

async function fetchManifestDeps(url: string): Promise<ManifestDeps | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as ManifestDeps;
  } catch {
    return null;
  }
}

/**
 * Mirrors the Go backend's enrichVersions: fetches manifest.json for each
 * version that has one, then populates game_version (from the "subway-builder"
 * dependency key) and dependencies (all other deps).
 */
async function enrichVersionsFromManifests(
  versions: VersionInfo[],
): Promise<VersionInfo[]> {
  const results = await Promise.allSettled(
    versions.map(async (v): Promise<VersionInfo> => {
      if (!v.manifest) return v;
      const manifest = await fetchManifestDeps(v.manifest);
      if (!manifest?.dependencies) return v;

      const deps = manifest.dependencies;
      const gameVersion = deps[GAME_DEP_KEY] ?? v.game_version;
      const modDeps: Record<string, string> = {};
      for (const [id, range] of Object.entries(deps)) {
        if (id !== GAME_DEP_KEY) modDeps[id] = range;
      }

      return {
        ...v,
        game_version: gameVersion,
        dependencies:
          Object.keys(modDeps).length > 0 ? modDeps : v.dependencies,
      };
    }),
  );

  return results.map((result, i) =>
    result.status === 'fulfilled' ? result.value : versions[i],
  );
}

interface UseVersionsResult {
  versions: VersionInfo[];
  loading: boolean;
  error: string | null;
}

export function useVersions(update?: UpdateConfig): UseVersionsResult {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUpdate = update;

    if (!currentUpdate) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!currentUpdate) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let mapped: VersionInfo[] = [];

        if (currentUpdate.type === 'github' && currentUpdate.repo) {
          const releases = await getGithubReleases(currentUpdate.repo);

          mapped = releases.map((release) => {
            const manifestAsset = release.assets.find(
              (a) => a.name === 'manifest.json',
            );
            const zipAsset = release.assets.find((a) =>
              a.name.endsWith('.zip'),
            );
            const totalDownloads = release.assets.reduce(
              (sum, a) => sum + a.download_count,
              0,
            );

            return {
              version: release.tag_name,
              name: release.name || release.tag_name,
              changelog: release.body || '',
              date: release.published_at,
              download_url: zipAsset?.browser_download_url ?? '',
              game_version: release.game_version ?? '',
              sha256: '',
              downloads: totalDownloads,
              manifest: manifestAsset?.browser_download_url,
              prerelease: release.prerelease,
              dependencies: release.dependencies,
            };
          });
        } else if (currentUpdate.url) {
          const entries = await getCustomVersions(currentUpdate.url);
          mapped = entries.map((entry) => ({
            version: entry.version,
            name: entry.name || entry.version,
            changelog: entry.changelog,
            date: entry.date,
            download_url: entry.download_url,
            game_version: entry.game_version,
            sha256: entry.sha256,
            downloads: entry.downloads,
            manifest: entry.manifest,
            prerelease: entry.prerelease,
            dependencies: entry.dependencies,
          }));
        }

        // Enrich with manifest data (game_version + dependencies), mirroring
        // the Go backend's enrichVersions call.
        const enriched = await enrichVersionsFromManifests(mapped);

        if (!cancelled) setVersions(enriched);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load versions',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [update]);

  return { versions, loading, error };
}
