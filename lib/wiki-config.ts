import {
  RailSymbol,
  FolderCode,
  MapPinPlus,
  GitPullRequestArrow,
  History,
  Tag,
  Archive,
  type LucideIcon,
} from "lucide-react"

export type WikiInstanceId =
  | "railyard"
  | "template-mod"
  | "creating-custom-maps"
  | "contributing"
  | "legacy"

export type WikiVersion = {
  value: string
  label: string
  icon?: LucideIcon
  deprecated?: boolean
}

export type WikiInstance = {
  id: WikiInstanceId
  label: string
  basePath: string
  icon: LucideIcon
  accentClassName: string
  accentSurfaceClassName: string
  accentSurfaceHoverClassName: string
  accentIconSurfaceClassName: string
  versioned: boolean
  latestVersion?: string
  versions?: WikiVersion[]
}

export const WIKI_INSTANCES: WikiInstance[] = [
  {
    id: "railyard",
    label: "Railyard",
    basePath: "/wiki/railyard",
    icon: RailSymbol,
    accentClassName: "text-emerald-400",
    accentSurfaceClassName: "bg-emerald-500/14 border-emerald-500/30",
    accentSurfaceHoverClassName: "hover:bg-emerald-500/18",
    accentIconSurfaceClassName: "bg-emerald-950/80 border-emerald-700/50",
    versioned: true,
    latestVersion: "v1.1",
    versions: [
      { value: "v1.1", label: "v1.1", icon: Tag },
      { value: "v1.0", label: "v1.0", icon: Archive, deprecated: true },
    ],
  },
  {
    id: "template-mod",
    label: "Template Mod",
    basePath: "/wiki/template-mod",
    icon: FolderCode,
    accentClassName: "text-violet-400",
    accentSurfaceClassName: "bg-violet-500/14 border-violet-500/30",
    accentSurfaceHoverClassName: "hover:bg-violet-500/18",
    accentIconSurfaceClassName: "bg-violet-950/80 border-violet-700/50",
    versioned: true,
    latestVersion: "v1.1",
    versions: [
      { value: "v1.1", label: "v1.1", icon: Tag },
      { value: "v1.0", label: "v1.0", icon: Archive, deprecated: true },
    ],
  },
  {
    id: "creating-custom-maps",
    label: "Creating Custom Maps",
    basePath: "/wiki/creating-custom-maps",
    icon: MapPinPlus,
    accentClassName: "text-blue-400",
    accentSurfaceClassName: "bg-blue-500/14 border-blue-500/30",
    accentSurfaceHoverClassName: "hover:bg-blue-500/18",
    accentIconSurfaceClassName: "bg-blue-950/80 border-blue-700/50",
    versioned: false,
  },
  {
    id: "contributing",
    label: "Contributing",
    basePath: "/wiki/contributing",
    icon: GitPullRequestArrow,
    accentClassName: "text-amber-400",
    accentSurfaceClassName: "bg-amber-500/14 border-amber-500/30",
    accentSurfaceHoverClassName: "hover:bg-amber-500/18",
    accentIconSurfaceClassName: "bg-amber-950/80 border-amber-700/50",
    versioned: false,
  },
  {
    id: "legacy",
    label: "Legacy",
    basePath: "/wiki/legacy",
    icon: History,
    accentClassName: "text-rose-400",
    accentSurfaceClassName: "bg-rose-500/14 border-rose-500/30",
    accentSurfaceHoverClassName: "hover:bg-rose-500/18",
    accentIconSurfaceClassName: "bg-rose-950/80 border-rose-700/50",
    versioned: false,
  },
]

export function getWikiInstanceById(id: string) {
  return WIKI_INSTANCES.find((instance) => instance.id === id)
}
