import type { Metadata } from "next"
import { Globe } from "lucide-react"
import { WorldMap } from "@/components/railyard/world-map"
import { PageHeader } from "@/components/page/page-header"

export const metadata: Metadata = {
  title: "World Map | Railyard",
  description: "A plain, interactive 2D world map powered by MapLibre GL JS.",
}

export default function WorldMapPage() {
  return (
    <section className="railyard-accent px-5 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
      <div className="w-full">
        <PageHeader
          icon={Globe}
          title="World Map"
          description="Explore a map of all of the user-submitted maps available on Railyard."
        />

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/55 p-2 shadow-sm sm:p-3">
          <div className="h-[72svh] min-h-[24rem] w-full overflow-hidden rounded-xl sm:h-[75svh] lg:h-[78svh]">
            <WorldMap />
          </div>
        </div>
      </div>
    </section>
  )
}
