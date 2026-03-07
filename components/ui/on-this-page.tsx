"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export type TocHeading = {
  id: string
  text: string
  level: number
}

export function WikiOnThisPage({ headings }: { headings: TocHeading[] }) {
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

  return (
    <aside className="hidden xl:block xl:w-[19rem] xl:pl-10 2xl:pl-14">
      <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-auto">
        <div className="relative pl-4 pt-2">
          {!singleHeading && (
            <div className="pointer-events-none absolute left-0 top-2 bottom-0 w-px bg-border/70" />
          )}

          <ul className="space-y-1 pb-4">
            {headings.map((heading) => {
              const active = activeId === heading.id

              return (
                <li key={heading.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary transition-all duration-150",
                      active ? "opacity-100" : "opacity-0"
                    )}
                    style={{ left: "-16.5px" }}
                  />
                  <Link
                    href={`#${heading.id}`}
                    className={cn(
                      "relative block rounded-md py-1.5 pr-2 text-sm transition-colors",
                      heading.level <= 2 && "pl-0",
                      heading.level === 3 && "pl-4",
                      heading.level >= 4 && "pl-7",
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {heading.text}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </aside>
  )
}

