const DEFAULT_BULLET_THEME = {
  bulletColor: "#000000",
  textColor: "#FFFFFF",
} as const

const THEMED_BULLET_COLORS: Record<string, { bulletColor: string; textColor: string }> = {
  railyard: {
    bulletColor: "#00A97A",
    textColor: "#FFFFFF",
  },
  "template-mod": {
    bulletColor: "#7D52E8",
    textColor: "#FFFFFF",
  },
  "creating-custom-maps": {
    bulletColor: "#2E6FCC",
    textColor: "#FFFFFF",
  },
  contributing: {
    bulletColor: "#C98600",
    textColor: "#471F07",
  },
  legacy: {
    bulletColor: "#C93A57",
    textColor: "#FFFFFF",
  },
} as const

export function getLineBulletTheme(themeId?: string | null) {
  if (!themeId) return DEFAULT_BULLET_THEME
  return THEMED_BULLET_COLORS[themeId] ?? DEFAULT_BULLET_THEME
}

export const NON_THEMED_LINE_BULLET = DEFAULT_BULLET_THEME

