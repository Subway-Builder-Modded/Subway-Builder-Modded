import { FolderGit2, TrainTrack, Package, type LucideIcon } from "lucide-react"

export type GitHubDropdownItemColors = {
  light: {
    text: string
    background: string
  }
  dark: {
    text: string
    background: string
  }
}

export type GitHubDropdownItem = {
  id: string
  title: string
  href: string
  icon?: LucideIcon
  colors: GitHubDropdownItemColors
}

export const GITHUB_ORG_URL = "https://github.com/Subway-Builder-Modded"

export const GITHUB_DROPDOWN_ITEMS: GitHubDropdownItem[] = [
  {
    id: "railyard",
    title: "Railyard",
    href: "https://github.com/Subway-Builder-Modded/railyard",
    icon: TrainTrack,
    colors: {
      light: {
        text: "#15803d",
        background: "rgba(34, 197, 94, 0.18)",
      },
      dark: {
        text: "#4ade80",
        background: "rgba(74, 222, 128, 0.20)",
      },
    },
  },
  {
    id: "registry",
    title: "Registry",
    href: "https://github.com/Subway-Builder-Modded/The-Railyard",
    icon: FolderGit2,
    colors: {
      light: {
        text: "#15803d",
        background: "rgba(34, 197, 94, 0.18)",
      },
      dark: {
        text: "#4ade80",
        background: "rgba(74, 222, 128, 0.20)",
      },
    },
  },
  {
    id: "template-mod",
    title: "Template Mod",
    href: "https://github.com/Subway-Builder-Modded/template-mod",
    icon: Package,
    colors: {
      light: {
        text: "#1d4ed8",
        background: "rgba(59, 130, 246, 0.16)",
      },
      dark: {
        text: "#60a5fa",
        background: "rgba(96, 165, 250, 0.22)",
      },
    },
  },
]
