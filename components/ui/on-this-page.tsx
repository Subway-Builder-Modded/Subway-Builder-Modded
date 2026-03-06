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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const topA = Math.abs(a.boundingClientRect.top)
            const topB = Math.abs(b.boundingClientRect.top)
            return topA - topB
          })

        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: [0.1, 0.5, 1],
      }
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [headings])

  if (!headings.length) return null

  return (
    <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] self-start xl:block xl:w-64">
      <div className="border-l border-border/70 pl-4 pt-2">
        <ul className="space-y-1">
          {headings.map((heading) => {
            const active = activeId === heading.id

            return (
              <li key={heading.id} className="relative">
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
                  <span
                    className={cn(
                      "absolute -left-[17px] top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary transition-all duration-150",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {heading.text}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
