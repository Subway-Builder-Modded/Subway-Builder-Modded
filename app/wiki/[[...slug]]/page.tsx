import { permanentRedirect } from "next/navigation"
import { WIKI_INSTANCES } from "@/lib/wiki-config"
import { getAllWikiDocSlugs } from "@/lib/wiki.server"

export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = await getAllWikiDocSlugs()

  const baseRouteSlugs = WIKI_INSTANCES.flatMap((instance) => {
    if (!instance.versioned) return [[instance.id]]

    const versionRoots = (instance.versions ?? []).flatMap((version) => [
      [instance.id, version.value],
      [instance.id, "latest"],
    ])

    return [[instance.id], ...versionRoots]
  })

  const latestAliasSlugs = WIKI_INSTANCES.flatMap((instance) => {
    if (!instance.versioned) return []

    return slugs
      .filter(
        (parts) =>
          parts[0] === instance.id &&
          parts[1] &&
          instance.versions?.some((version) => version.value === parts[1])
      )
      .map((parts) => [parts[0], "latest", ...parts.slice(2)])
  })

  const allParamKeys = new Set<string>([
    "",
    ...baseRouteSlugs.map((parts) => parts.join("/")),
    ...slugs.map((parts) => parts.join("/")),
    ...latestAliasSlugs.map((parts) => parts.join("/")),
  ])

  return Array.from(allParamKeys).map((key) => ({
    slug: key === "" ? [""] : key.split("/"),
  }))
}

export default async function LegacyWikiRedirectPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const normalizedSlug = slug?.filter(Boolean)

  const destination = normalizedSlug?.length
    ? `/docs/${normalizedSlug.join("/")}`
    : "/docs"

  permanentRedirect(destination)
}