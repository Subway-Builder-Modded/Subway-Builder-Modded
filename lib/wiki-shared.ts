import {
  WIKI_INSTANCES,
  getWikiInstanceById,
  type WikiInstance,
  type WikiVersion,
} from "@/lib/wiki-config"

export type WikiSidebarPage = {
  kind: "page"
  key: string
  title: string
  href: string
  sidebarPosition: number
}

export type WikiSidebarCategory = {
  kind: "category"
  key: string
  title: string
  href?: string
  items: WikiSidebarEntry[]
  sidebarPosition: number
}

export type WikiSidebarEntry = WikiSidebarPage | WikiSidebarCategory

export type WikiSidebarTree = {
  entries: WikiSidebarEntry[]
}

export type ResolvedWikiRoute = {
  instance: WikiInstance
  version: string | null
  docSlug: string | null
}

export function isLatestVersion(instance: WikiInstance, versionValue: string) {
  return !!instance.currentVersion && instance.currentVersion === versionValue
}

export function buildBaseHomeHref(instance: WikiInstance, version?: string | null) {
  if (instance.versioned) {
    const resolvedVersion = version ?? instance.currentVersion
    return `${instance.basePath}/${resolvedVersion}/home`
  }

  return `${instance.basePath}/home`
}

export function resolveWikiRoute(slug?: string[]): ResolvedWikiRoute | null {
  const parts = slug ?? []
  const [instanceId, maybeVersion, ...rest] = parts
  if (!instanceId) return null

  const instance = getWikiInstanceById(instanceId)
  if (!instance) return null

  if (!instance.versioned) {
    const docSlug = [maybeVersion, ...rest].filter(Boolean).join("/") || null
    return {
      instance,
      version: null,
      docSlug,
    }
  }

  const versionValues = new Set(instance.versions?.map((v) => v.value) ?? [])
  const hasExplicitVersion = !!maybeVersion && versionValues.has(maybeVersion)

  return {
    instance,
    version: hasExplicitVersion ? maybeVersion : instance.currentVersion ?? null,
    docSlug: hasExplicitVersion
      ? rest.join("/") || null
      : [maybeVersion, ...rest].filter(Boolean).join("/") || null,
  }
}

export function getActiveInstanceFromPathname(pathname: string) {
  return (
    WIKI_INSTANCES.find(
      (instance) =>
        pathname === instance.basePath || pathname.startsWith(`${instance.basePath}/`)
    ) ?? WIKI_INSTANCES[0]
  )
}

export function getActiveVersionFromPathname(
  instance: WikiInstance,
  pathname: string
): WikiVersion | null {
  if (!instance.versioned || !instance.versions?.length) return null

  const afterBase = pathname.slice(instance.basePath.length)
  const parts = afterBase.split("/").filter(Boolean)
  const maybeVersion = parts[0]

  return (
    instance.versions.find((version) => version.value === maybeVersion) ??
    instance.versions.find((version) => version.value === instance.currentVersion) ??
    instance.versions[0]
  )
}

export function buildVersionHref(instance: WikiInstance, versionValue: string) {
  return `${instance.basePath}/${versionValue}/home`
}

export function buildDocHref(
  instance: WikiInstance,
  version: string | null,
  docPath: string
) {
  if (instance.versioned && version) {
    return `${instance.basePath}/${version}/${docPath}`
  }

  return `${instance.basePath}/${docPath}`
}
