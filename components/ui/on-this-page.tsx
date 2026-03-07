"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { getActiveInstanceFromPathname } from "@/lib/wiki-shared"
import type { WikiInstance } from "@/lib/wiki-config"

export type TocHeading = {
  id: string
  text: string
  level: number
}

const INSTANCE_INDICATOR_BG_CLASS: Record<WikiInstance["id"], string> = {
  railyard: "bg-emerald-400",
  "template-mod": "bg-violet-400",
  "creating-custom-maps": "bg-blue-400",
  contributing: "bg-amber-400",
  legacy: "bg-rose-400",
}

export function WikiOnThisPage({ headings }: { headings: TocHeading[] }) {
  const pathname = usePathname()
  const activeInstance = React.useMemo(
    () => getActiveInstanceFromPathname(pathname),
    [pathname]
  )
  const [activeId, setActiveId] = React.useState<string>("")

  React.useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[]

    if (!elements.length) return

    function update() {
      let current = ""
      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 100) {
          current = el.id
        } else {
          break
        }
      }

      if (!current && elements[0]) {
        current = elements[0].id
      }

      setActiveId(current)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [headings])

  if (!headings.length) return null

  const singleHeading = headings.length === 1
  const activeIndicatorClassName = INSTANCE_INDICATOR_BG_CLASS[activeInstance.id]

  return (
    <nav aria-label="On this page" className="xl:w-[19rem] xl:pl-10 2xl:pl-14">
      <div className="relative pl-4 pt-2">
        {!singleHeading ? (
          <div className="pointer-events-none absolute top-2 bottom-3 left-0 w-px bg-border/70" />
        ) : null}

        <ul className="space-y-1 pb-4">
          {headings.map((heading) => {
            const active = activeId === heading.id

            return (
              <li key={heading.id} className="relative">
                <span
                  className={cn(
                    "absolute top-1.5 bottom-1.5 w-[2px] rounded-full transition-all duration-150",
                    activeIndicatorClassName,
                    active ? "opacity-100" : "opacity-0"
                  )}
                  style={{ left: "-16.5px" }}
                />
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "relative block rounded-md py-1.5 pr-2 text-sm transition-colors",
                    heading.level <= 2 && "pl-0",
                    heading.level === 3 && "pl-4",
                    heading.level >= 4 && "pl-7",
                    active
                      ? cn("font-medium", activeInstance.accentClassName)
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {heading.text}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
