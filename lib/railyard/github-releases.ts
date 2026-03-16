export interface GithubReleaseAsset {
  name: string
  browser_download_url: string
  download_count: number
  size: number
}

export interface GithubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  prerelease: boolean
  assets: GithubReleaseAsset[]
}

interface GithubReleaseCacheFile {
  schema_version: number
  generated_at: string
  repos: Record<string, GithubRelease[]>
}

const CACHE_URL = "/railyard/github-releases-cache.json"
let cachePromise: Promise<GithubReleaseCacheFile | null> | null = null

function normalizeRepo(repo: string): string {
  return repo.trim().toLowerCase()
}

function sanitizeRelease(input: unknown): GithubRelease {
  const entry = (input ?? {}) as Record<string, unknown>
  const rawAssets = Array.isArray(entry.assets) ? entry.assets : []

  return {
    tag_name: typeof entry.tag_name === "string" ? entry.tag_name : "",
    name: typeof entry.name === "string" ? entry.name : "",
    body: typeof entry.body === "string" ? entry.body : "",
    published_at: typeof entry.published_at === "string" ? entry.published_at : "",
    prerelease: Boolean(entry.prerelease),
    assets: rawAssets.map((asset) => {
      const value = (asset ?? {}) as Record<string, unknown>
      return {
        name: typeof value.name === "string" ? value.name : "",
        browser_download_url:
          typeof value.browser_download_url === "string"
            ? value.browser_download_url
            : "",
        download_count:
          typeof value.download_count === "number" && Number.isFinite(value.download_count)
            ? value.download_count
            : 0,
        size:
          typeof value.size === "number" && Number.isFinite(value.size)
            ? value.size
            : 0,
      }
    }),
  }
}

async function readReleaseCacheFile(): Promise<GithubReleaseCacheFile | null> {
  try {
    const response = await fetch(CACHE_URL, { cache: "no-store" })
    if (!response.ok) return null

    const payload = await response.json() as GithubReleaseCacheFile
    if (!payload || typeof payload !== "object" || !payload.repos) return null
    return payload
  } catch {
    return null
  }
}

async function getReleaseCache(): Promise<GithubReleaseCacheFile | null> {
  if (!cachePromise) {
    cachePromise = readReleaseCacheFile()
  }
  return cachePromise
}

function getCachedReleases(cache: GithubReleaseCacheFile | null, repo: string): GithubRelease[] | null {
  if (!cache) return null
  const releases = cache.repos[normalizeRepo(repo)]
  if (!Array.isArray(releases)) return null
  return releases
}

async function fetchGitHubReleasesDirect(repo: string): Promise<GithubRelease[]> {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases`)
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub releases for ${repo}`)
  }

  const releases = await response.json() as unknown[]
  return Array.isArray(releases) ? releases.map(sanitizeRelease) : []
}

export async function getGithubReleases(repo: string): Promise<GithubRelease[]> {
  const normalizedRepo = repo.trim()
  if (!normalizedRepo) return []

  const cache = await getReleaseCache()
  const cached = getCachedReleases(cache, normalizedRepo)
  if (cached) {
    return cached.map((release) => sanitizeRelease(release))
  }

  return fetchGitHubReleasesDirect(normalizedRepo)
}
