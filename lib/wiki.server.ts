import "server-only"

import fs from "node:fs"
import path from "node:path"
import { compileMDX } from "next-mdx-remote/rsc"

import type { WikiInstance } from "@/lib/wiki-config"
import {
  buildBaseHomeHref,
  buildDocHref,
  resolveWikiRoute,
  type WikiSidebarCategory,
  type WikiSidebarEntry,
  type WikiSidebarPage,
  type WikiSidebarTree,
} from "@/lib/wiki-shared"

const CONTENT_ROOT = path.join(process.cwd(), "content", "wiki")

export type WikiFrontmatter = {
  title: string
  description?: string
  sidebar_position?: number
}

export type WikiBreadcrumbItem = {
  label: string
  href?: string
}

function getInstanceContentDir(instance: WikiInstance, version: string | null) {
  return instance.versioned
    ? path.join(CONTENT_ROOT, instance.id, version ?? "")
    : path.join(CONTENT_ROOT, instance.id)
}

function exists(filePath: string) {
  return fs.existsSync(filePath)
}

function humanizeSegment(segment: string) {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

async function readFrontmatter(filePath: string) {
  const source = await fs.promises.readFile(filePath, "utf8")
  const { frontmatter } = await compileMDX<WikiFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
    },
  })

  return frontmatter
}

async function readTitleForPath(baseDir: string, relativePath: string) {
  const directFile = path.join(baseDir, `${relativePath}.mdx`)
  const directIndex = path.join(baseDir, relativePath, "index.mdx")

  if (exists(directFile)) {
    const frontmatter = await readFrontmatter(directFile)
    return frontmatter?.title
  }

  if (exists(directIndex)) {
    const frontmatter = await readFrontmatter(directIndex)
    return frontmatter?.title
  }

  return undefined
}

function sortEntries(entries: WikiSidebarEntry[]) {
  return entries.sort((a, b) => {
    if (a.sidebarPosition !== b.sidebarPosition) {
      return a.sidebarPosition - b.sidebarPosition
    }
    return a.title.localeCompare(b.title)
  })
}

async function buildCategoryEntry(
  dirPath: string,
  pathSegments: string[],
  instance: WikiInstance,
  version: string | null
): Promise<WikiSidebarCategory | null> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
  const indexPath = path.join(dirPath, "index.mdx")
  const hasIndex = exists(indexPath)

  const items: WikiSidebarEntry[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const category = await buildCategoryEntry(
        path.join(dirPath, entry.name),
        [...pathSegments, entry.name],
        instance,
        version
      )
      if (category) items.push(category)
    }

    if (entry.isFile() && entry.name.endsWith(".mdx") && entry.name !== "index.mdx") {
      const basename = entry.name.replace(/\.mdx$/, "")
      const relPath = [...pathSegments, basename].join("/")
      const frontmatter = await readFrontmatter(path.join(dirPath, entry.name))

      items.push({
        kind: "page",
        key: relPath,
        title: frontmatter?.title ?? humanizeSegment(basename),
        href: buildDocHref(instance, version, relPath),
        sidebarPosition: frontmatter?.sidebar_position ?? 9999,
      } satisfies WikiSidebarPage)
    }
  }

  const sortedItems = sortEntries(items)

  if (!hasIndex && sortedItems.length === 0) return null

  const lastSegment = pathSegments[pathSegments.length - 1]
  const frontmatter = hasIndex ? await readFrontmatter(indexPath) : undefined
  const relPath = pathSegments.join("/")

  return {
    kind: "category",
    key: relPath,
    title: frontmatter?.title ?? humanizeSegment(lastSegment),
    href: hasIndex ? buildDocHref(instance, version, relPath) : undefined,
    items: sortedItems,
    sidebarPosition: frontmatter?.sidebar_position ?? 9999,
  }
}

export async function getSidebarTree(
  instance: WikiInstance,
  version: string | null
): Promise<WikiSidebarTree> {
  const dir = getInstanceContentDir(instance, version)
  if (!exists(dir)) return { entries: [] }

  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  const treeEntries: WikiSidebarEntry[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const category = await buildCategoryEntry(
        path.join(dir, entry.name),
        [entry.name],
        instance,
        version
      )
      if (category) treeEntries.push(category)
    }

    if (entry.isFile() && entry.name.endsWith(".mdx") && entry.name !== "index.mdx") {
      const basename = entry.name.replace(/\.mdx$/, "")
      const frontmatter = await readFrontmatter(path.join(dir, entry.name))

      treeEntries.push({
        kind: "page",
        key: basename,
        title: frontmatter?.title ?? humanizeSegment(basename),
        href: buildDocHref(instance, version, basename),
        sidebarPosition: frontmatter?.sidebar_position ?? 9999,
      } satisfies WikiSidebarPage)
    }
  }

  return {
    entries: sortEntries(treeEntries),
  }
}

export async function resolveWikiDocFilePath(slug?: string[]) {
  const resolved = resolveWikiRoute(slug)
  if (!resolved) return null

  const dir = getInstanceContentDir(resolved.instance, resolved.version)

  if (!resolved.docSlug) return null

  const directFile = path.join(dir, `${resolved.docSlug}.mdx`)
  const categoryIndex = path.join(dir, resolved.docSlug, "index.mdx")

  if (exists(directFile)) return directFile
  if (exists(categoryIndex)) return categoryIndex

  return null
}

export async function getWikiBreadcrumbs(slug?: string[]): Promise<WikiBreadcrumbItem[]> {
  const resolved = resolveWikiRoute(slug)
  if (!resolved) return []

  const dir = getInstanceContentDir(resolved.instance, resolved.version)
  const items: WikiBreadcrumbItem[] = [
    { label: "Wiki", href: "/wiki" },
    {
      label: resolved.instance.label,
      href: buildBaseHomeHref(resolved.instance, resolved.version),
    },
  ]

  if (!resolved.docSlug) return items

  const segments = resolved.docSlug.split("/").filter(Boolean)

  for (let i = 0; i < segments.length; i++) {
    const prefix = segments.slice(0, i + 1).join("/")
    const title = (await readTitleForPath(dir, prefix)) ?? humanizeSegment(segments[i])

    items.push({
      label: title,
      href:
        i === segments.length - 1
          ? undefined
          : buildDocHref(resolved.instance, resolved.version, prefix),
    })
  }

  return items
}

export async function getWikiDocTitle(slug?: string[]) {
  const filePath = await resolveWikiDocFilePath(slug)
  if (!filePath) return null

  const frontmatter = await readFrontmatter(filePath)
  return frontmatter?.title ?? null
}
