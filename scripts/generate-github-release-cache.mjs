import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import process from "node:process"

const BASE_URL = "https://raw.githubusercontent.com/Subway-Builder-Modded/The-Railyard/main"
const OUTPUT_PATH = path.resolve(process.cwd(), "public/railyard/github-releases-cache.json")
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? ""
const WORKER_LIMIT = 8

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`)
  }
  return response.json()
}

function headers() {
  const result = {
    Accept: "application/vnd.github+json",
  }
  if (TOKEN) {
    result.Authorization = `Bearer ${TOKEN}`
  }
  return result
}

function sanitizeRelease(input) {
  const entry = input ?? {}
  const assets = Array.isArray(entry.assets) ? entry.assets : []
  return {
    tag_name: typeof entry.tag_name === "string" ? entry.tag_name : "",
    name: typeof entry.name === "string" ? entry.name : "",
    body: typeof entry.body === "string" ? entry.body : "",
    published_at: typeof entry.published_at === "string" ? entry.published_at : "",
    prerelease: Boolean(entry.prerelease),
    assets: assets.map((asset) => ({
      name: typeof asset?.name === "string" ? asset.name : "",
      browser_download_url:
        typeof asset?.browser_download_url === "string"
          ? asset.browser_download_url
          : "",
      download_count:
        typeof asset?.download_count === "number" && Number.isFinite(asset.download_count)
          ? asset.download_count
          : 0,
      size:
        typeof asset?.size === "number" && Number.isFinite(asset.size)
          ? asset.size
          : 0,
    })),
  }
}

async function fetchIndex(type) {
  const data = await fetchJson(`${BASE_URL}/${type}/index.json`)
  const entries = Array.isArray(data?.[type]) ? data[type] : []
  return entries
}

async function fetchManifest(type, id) {
  return fetchJson(`${BASE_URL}/${type}/${id}/manifest.json`)
}

async function collectGithubRepos() {
  const [modIds, mapIds] = await Promise.all([fetchIndex("mods"), fetchIndex("maps")])

  const [mods, maps] = await Promise.all([
    Promise.all(modIds.map((id) => fetchManifest("mods", id))),
    Promise.all(mapIds.map((id) => fetchManifest("maps", id))),
  ])

  const repos = new Set(["subway-builder-modded/railyard"])
  for (const manifest of [...mods, ...maps]) {
    if (manifest?.update?.type === "github" && typeof manifest?.update?.repo === "string") {
      repos.add(manifest.update.repo.trim().toLowerCase())
    }
  }

  return [...repos].filter(Boolean)
}

async function fetchReleases(repo) {
  const url = `https://api.github.com/repos/${repo}/releases`
  const releases = await fetchJson(url, { headers: headers() })
  return Array.isArray(releases) ? releases.map(sanitizeRelease) : []
}

async function buildReleaseMap(repos) {
  const queue = [...repos]
  const result = {}

  const workers = Array.from({ length: Math.min(WORKER_LIMIT, Math.max(1, queue.length)) }, async () => {
    while (queue.length > 0) {
      const repo = queue.pop()
      if (!repo) return

      try {
        result[repo] = await fetchReleases(repo)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.warn(`[github-cache] Failed ${repo}: ${message}`)
        result[repo] = []
      }
    }
  })

  await Promise.all(workers)
  return result
}

async function main() {
  const repos = await collectGithubRepos()
  const releaseMap = await buildReleaseMap(repos)

  const payload = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    repos: releaseMap,
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8")

  console.log(`[github-cache] wrote ${Object.keys(releaseMap).length} repos to ${OUTPUT_PATH}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.warn(`[github-cache] generation failed: ${message}`)
  process.exitCode = 0
})
