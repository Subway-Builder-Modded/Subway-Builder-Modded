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

export interface CustomVersionEntry {
  version: string
  name: string
  changelog: string
  date: string
  download_url: string
  game_version: string
  sha256: string
  downloads: number
  manifest?: string
  prerelease: boolean
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

function sanitizeCustomVersion(input: unknown): CustomVersionEntry {
  const entry = (input ?? {}) as Record<string, unknown>
  return {
    version: typeof entry.version === "string" ? entry.version : "",
    name:
      typeof entry.name === "string"
        ? entry.name
        : (typeof entry.version === "string" ? entry.version : ""),
    changelog: typeof entry.changelog === "string" ? entry.changelog : "",
    date: typeof entry.date === "string" ? entry.date : "",
    download_url: typeof entry.download_url === "string" ? entry.download_url : "",
    game_version: typeof entry.game_version === "string" ? entry.game_version : "",
    sha256: typeof entry.sha256 === "string" ? entry.sha256 : "",
    downloads:
      typeof entry.downloads === "number" && Number.isFinite(entry.downloads)
        ? entry.downloads
        : 0,
    manifest: typeof entry.manifest === "string" ? entry.manifest : undefined,
    prerelease: Boolean(entry.prerelease),
  }
}

export async function getGithubReleases(repo: string): Promise<GithubRelease[]> {
  const normalizedRepo = repo.trim()
  if (!normalizedRepo) return []

  const response = await fetch(`https://api.github.com/repos/${normalizedRepo}/releases`)
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub releases for ${normalizedRepo}`)
  }

  const releases = await response.json() as unknown[]
  return Array.isArray(releases) ? releases.map(sanitizeRelease) : []
}

export async function getCustomVersions(url: string): Promise<CustomVersionEntry[]> {
  const normalizedUrl = url.trim()
  if (!normalizedUrl) return []

  const response = await fetch(normalizedUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch custom versions from ${normalizedUrl}`)
  }

  const data = await response.json() as unknown
  const rawVersions = Array.isArray(data)
    ? data
    : Array.isArray((data as { versions?: unknown[] })?.versions)
      ? (data as { versions: unknown[] }).versions
      : []

  return rawVersions.map((entry) => sanitizeCustomVersion(entry))
}
