"use client"

import Link from "next/link"
import type { CSSProperties } from "react"
import { BookText } from "lucide-react"

import { Card } from "@/components/ui/card"
import { LineBullet } from "@/components/ui/line-bullet"
import { WIKI_INSTANCES, type WikiInstance } from "@/lib/wiki-config"
import { buildBaseHomeHref } from "@/lib/wiki-shared"
import { cn } from "@/lib/utils"

function hexToRgb(hex: string) {
  const h = hex.replace("#", "")
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function hexAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function mixHex(a: string, b: string, t: number) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const clampT = Math.max(0, Math.min(1, t))
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0")
  const r = ca.r + (cb.r - ca.r) * clampT
  const g = ca.g + (cb.g - ca.g) * clampT
  const b2 = ca.b + (cb.b - ca.b) * clampT
  return `#${toHex(r)}${toHex(g)}${toHex(b2)}`
}

const INSTANCE_THEME_COLORS = {
  railyard: {
    accent: "#00D492",
    base: "#032D23",
    mid: "#00A97A",
  },
  "template-mod": {
    accent: "#A684FF",
    base: "#311362",
    mid: "#7D52E8",
  },
  "creating-custom-maps": {
    accent: "#51A2FF",
    base: "#192754",
    mid: "#2E6FCC",
  },
  contributing: {
    accent: "#FFB900",
    base: "#471F07",
    mid: "#C98600",
  },
  legacy: {
    accent: "#FF637E",
    base: "#4D091C",
    mid: "#C93A57",
  },
} satisfies Record<
  string,
  {
    accent: string
    base: string
    mid: string
  }
>

type CardThemeColors = {
  cardBgLight: string
  cardBgDark: string
  titleTextLight: string
  titleTextDark: string
  bulletBgLight: string
  bulletBgDark: string
  borderColorLight: string
  borderColorDark: string
  imageBorderLight: string
  imageBorderDark: string
}

function getColors(instance: WikiInstance): CardThemeColors {
  const theme = INSTANCE_THEME_COLORS[instance.id] ?? {
    accent: instance.primaryHex,
    base: instance.secondaryHex,
    mid: instance.primaryHex,
  }

  const cardBgLight = theme.accent
  const cardBgDark = theme.base
  const titleTextLight = theme.base
  const titleTextDark = theme.accent
  const bulletBgLight = mixHex(cardBgLight, titleTextLight, 0.30)
  const bulletBgDark = mixHex(cardBgDark, titleTextDark, 0.30)
  const imageBorderLight = bulletBgLight
  const imageBorderDark = bulletBgDark
  const borderColorLight = hexAlpha(titleTextLight, 0.3)
  const borderColorDark = hexAlpha(titleTextDark, 0.3)

  return {
    cardBgLight,
    cardBgDark,
    titleTextLight,
    titleTextDark,
    bulletBgLight,
    bulletBgDark,
    borderColorLight,
    borderColorDark,
    imageBorderLight,
    imageBorderDark,
  }
}

function chunkRows<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function WikiCardImagePlaceholder({
  instance,
  borderColor,
  iconColor,
}: {
  instance: WikiInstance
  borderColor: string
  iconColor: string
}) {
  const Icon = instance.icon

  return (
    <div
      className="relative flex w-full aspect-video flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border-2 bg-black/5 dark:bg-white/5"
      style={{ borderColor }}
    >
      <Icon className="size-8 opacity-40" style={{ color: iconColor }} />
      <span className="text-xs font-medium opacity-30" style={{ color: iconColor }}>
        Preview coming soon
      </span>
    </div>
  )
}

function WikiCardRow({ items }: { items: WikiInstance[] }) {
  return (
    <div className="grid items-stretch justify-center gap-7 [grid-template-columns:repeat(auto-fit,minmax(280px,340px))]">
      {items.map((instance) => (
        <WikiHubCard key={instance.id} instance={instance} />
      ))}
    </div>
  )
}

function WikiHubCard({ instance }: { instance: WikiInstance }) {
  const {
    cardBgLight,
    cardBgDark,
    titleTextLight,
    titleTextDark,
    bulletBgLight,
    bulletBgDark,
    borderColorLight,
    borderColorDark,
    imageBorderLight,
    imageBorderDark,
  } = getColors(instance)

  return (
    <Link href={buildBaseHomeHref(instance)} className="block h-full outline-none">
      <Card
        className={cn(
          "group h-full overflow-hidden will-change-transform",
          "border ring-0 transition-transform duration-300",
          "hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-white/5",
          "focus-visible:ring-2 focus-visible:ring-ring/40",
          "hub-theme-card",
        )}
        style={
          {
            ["--hub-card-bg-light" as string]: cardBgLight,
            ["--hub-card-bg-dark" as string]: cardBgDark,
            ["--hub-card-title-light" as string]: titleTextLight,
            ["--hub-card-title-dark" as string]: titleTextDark,
            ["--hub-card-bullet-light" as string]: bulletBgLight,
            ["--hub-card-bullet-dark" as string]: bulletBgDark,
            ["--hub-card-border-light" as string]: borderColorLight,
            ["--hub-card-border-dark" as string]: borderColorDark,
            ["--hub-card-image-border-light" as string]: imageBorderLight,
            ["--hub-card-image-border-dark" as string]: imageBorderDark,
          } as CSSProperties
        }
      >
        <div className="flex h-full flex-col px-6 pb-5 pt-4">
          <div className="mb-4">
            <LineBullet
              bullet={instance.label}
              color="var(--hub-card-bullet)"
              textColor="var(--foreground)"
              shape="circle"
              size="md"
            />
          </div>

          <div className="mb-4">
            <WikiCardImagePlaceholder
              instance={instance}
              borderColor="var(--hub-card-image-border)"
              iconColor="var(--hub-card-title)"
            />
          </div>

          <p className="text-center text-sm leading-relaxed opacity-80" style={{ color: "var(--hub-card-title)" }}>
            {WIKI_DESCRIPTIONS[instance.id]}
          </p>
        </div>
      </Card>
    </Link>
  )
}

const WIKI_DESCRIPTIONS: Record<string, string> = {
  railyard:
    "The map and mod distribution platform for Subway Builder. Browse and publish community-made custom maps and mods.",
  "template-mod":
    "TypeScript template and framework documentation for building your own Subway Builder mods.",
  "creating-custom-maps":
    "A complete guide to creating, packaging, and distributing your own custom Subway Builder maps.",
  contributing:
    "Learn how to contribute to Subway Builder Modded — from documentation and guides to translations.",
  legacy:
    "Legacy documentation covering older installation methods and compatibility guides for previous releases.",
}

export function WikiHubPage() {
  const rows = chunkRows(WIKI_INSTANCES, 3)

  return (
    <section className="px-7 pb-8 pt-8 sm:pb-8 sm:pt-8">
      <div className="mb-12 text-center">
        <div className="flex justify-center">
          <h1 className="inline-flex items-center gap-4 text-4xl font-black tracking-tight sm:text-5xl">
            <BookText aria-hidden="true" className="size-[1.02em]" />
            <span>Wiki</span>
          </h1>
        </div>
        <p className="mt-3 text-lg text-muted-foreground">
          Browse documentation for Subway Builder Modded projects.
        </p>
      </div>

      <div className="space-y-7">
        {rows.map((row, idx) => (
          <WikiCardRow key={idx} items={row} />
        ))}
      </div>
    </section>
  )
}



