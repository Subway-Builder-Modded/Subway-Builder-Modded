"use client"

import { useEffect, useState } from "react"
import { ChevronRight, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type GitHubRelease = {
  tag_name: string
  name: string | null
  published_at: string
  prerelease: boolean
  html_url: string
  body: string | null
}

type ReleaseEntry = {
  version: string
  title: string
  date: string
  prerelease: boolean
  url: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function ReleaseCard({
  release,
  isLatest,
  primaryHex,
}: {
  release: ReleaseEntry
  isLatest: boolean
  primaryHex: string
}) {
  return (
    <a
      href={release.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block outline-none"
    >
      <Card
        className={cn(
          "group flex flex-col gap-3 px-6 py-5",
          "sm:flex-row sm:items-center sm:justify-between sm:gap-6",
          "border border-border/60 bg-card/60",
          "transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out",
          "hover:-translate-y-0.5 hover:border-border hover:bg-card",
          "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_rgba(255,255,255,0.04)]",
          "focus-visible:ring-2 focus-visible:ring-ring/40",
        )}
        style={{ borderLeftColor: primaryHex, borderLeftWidth: "3px" }}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xl font-bold leading-tight text-foreground">
            {release.title}
            {release.prerelease && (
              <span className="ml-2 text-sm font-medium text-muted-foreground">(beta)</span>
            )}
          </span>
          <span className="text-sm text-muted-foreground">{release.date}</span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {isLatest && (
            <Badge
              className="shrink-0 border-0 font-semibold"
              style={{
                backgroundColor: "#1f883d",
                color: "#ffffff",
                height: "auto",
                padding: "0.35rem 0.85rem",
                fontSize: "0.9375rem",
                lineHeight: "1.4",
              }}
            >
              Latest
            </Badge>
          )}
          <Badge
            className="shrink-0 border-0 font-semibold"
            style={{
              backgroundColor: release.prerelease ? "#9a6700" : "#0969da",
              color: "#ffffff",
              height: "auto",
              padding: "0.35rem 0.85rem",
              fontSize: "0.9375rem",
              lineHeight: "1.4",
            }}
          >
            {release.prerelease ? "Beta" : "Release"}
          </Badge>
          <ExternalLink className="size-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-muted-foreground sm:ml-1" />
        </div>
      </Card>
    </a>
  )
}

export function GitHubReleases({
  repo,
  primaryHex,
}: {
  repo: string
  primaryHex: string
}) {
  const [releases, setReleases] = useState<ReleaseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`https://api.github.com/repos/${repo}/releases`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: GitHubRelease[]) => {
        setReleases(
          data.map((r) => ({
            version: r.tag_name,
            title: r.name || r.tag_name,
            date: formatDate(r.published_at),
            prerelease: r.prerelease,
            url: r.html_url,
          }))
        )
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [repo])

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <Card
            key={i}
            className="flex h-[76px] animate-pulse items-center border border-border/60 bg-card/60 px-6"
            style={{ borderLeftColor: primaryHex, borderLeftWidth: "3px" }}
          >
            <div className="h-5 w-48 rounded bg-muted" />
          </Card>
        ))}
      </div>
    )
  }

  if (error || releases.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        {error ? "Failed to load releases." : "No releases published yet."}
      </p>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3">
      {releases.map((release, idx) => (
        <ReleaseCard
          key={release.version}
          release={release}
          isLatest={idx === 0}
          primaryHex={primaryHex}
        />
      ))}
    </div>
  )
}
