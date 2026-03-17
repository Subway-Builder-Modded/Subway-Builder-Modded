"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import type { NavbarIcon, NavbarItem } from "@/lib/navbar-config"
import { Link } from "@/components/ui/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function NavbarItemIcon({ icon, className }: { icon?: NavbarIcon; className?: string }) {
  if (!icon) return null

  if (typeof icon === "object" && "type" in icon && icon.type === "mask") {
    return (
      <span
        className={cn("block size-5 bg-current", className)}
        style={{
          WebkitMask: `url(${icon.src}) center / contain no-repeat`,
          mask: `url(${icon.src}) center / contain no-repeat`,
        }}
      />
    )
  }

  const Icon = icon
  return <Icon className={cn("size-5 md:size-4", className)} />
}

type NavbarHoverDropdownProps = {
  item: NavbarItem
  className: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NavbarHoverDropdown({ item, className, open, onOpenChange }: NavbarHoverDropdownProps) {
  const { resolvedTheme } = useTheme()
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null)
  const hoverCloseTimeoutRef = React.useRef<number | null>(null)
  const isTriggerHoveredRef = React.useRef(false)
  const isContentHoveredRef = React.useRef(false)

  const isDark = resolvedTheme === "dark"

  const clearHoverClose = React.useCallback(() => {
    if (hoverCloseTimeoutRef.current) {
      window.clearTimeout(hoverCloseTimeoutRef.current)
      hoverCloseTimeoutRef.current = null
    }
  }, [])

  const scheduleHoverClose = React.useCallback(() => {
    clearHoverClose()
    hoverCloseTimeoutRef.current = window.setTimeout(() => {
      if (!isTriggerHoveredRef.current && !isContentHoveredRef.current) {
        onOpenChange(false)
      }
      hoverCloseTimeoutRef.current = null
    }, 120)
  }, [clearHoverClose, onOpenChange])

  const openMenu = React.useCallback(() => {
    clearHoverClose()
    onOpenChange(true)
  }, [clearHoverClose, onOpenChange])

  React.useEffect(() => {
    if (!open) setHoveredItemId(null)
  }, [open])

  React.useEffect(() => {
    return () => {
      if (hoverCloseTimeoutRef.current) {
        window.clearTimeout(hoverCloseTimeoutRef.current)
      }
    }
  }, [])

  const dropdownItems = item.dropdown ?? []

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && (isTriggerHoveredRef.current || isContentHoveredRef.current)) return
        onOpenChange(nextOpen)
      }}
      modal={false}
    >
      <DropdownMenuTrigger asChild>
        <Link
          href={item.href ?? "#"}
          aria-label={item.title ?? item.id}
          target="_blank"
          rel="noreferrer"
          className={cn("outline-none", className)}
          onPointerEnter={() => {
            isTriggerHoveredRef.current = true
            openMenu()
          }}
          onPointerLeave={() => {
            isTriggerHoveredRef.current = false
            scheduleHoverClose()
          }}
        >
          <NavbarItemIcon icon={item.icon} />
        </Link>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        onPointerEnter={() => {
          isContentHoveredRef.current = true
          openMenu()
        }}
        onPointerLeave={() => {
          isContentHoveredRef.current = false
          setHoveredItemId(null)
          scheduleHoverClose()
        }}
        className="min-w-56 !bg-background ring-1 ring-border rounded-xl shadow-lg duration-200 ease-[cubic-bezier(.22,.9,.35,1)] data-open:duration-220 data-open:ease-[cubic-bezier(.22,.9,.35,1)] data-closed:duration-190 data-closed:ease-[cubic-bezier(.3,.0,.2,1)]"
      >
        {dropdownItems.map((dropdownItem) => {
          const Icon = dropdownItem.icon
          const hoverColors = dropdownItem.colors ? (isDark ? dropdownItem.colors.dark : dropdownItem.colors.light) : null
          const isItemHovered = hoveredItemId === dropdownItem.id

          return (
            <DropdownMenuItem
              asChild
              key={dropdownItem.id}
              onPointerEnter={() => setHoveredItemId(dropdownItem.id)}
              onPointerLeave={() => setHoveredItemId((current) => (current === dropdownItem.id ? null : current))}
              onFocus={() => setHoveredItemId(dropdownItem.id)}
              onBlur={() => setHoveredItemId((current) => (current === dropdownItem.id ? null : current))}
              style={
                isItemHovered && hoverColors
                  ? {
                      color: hoverColors.text,
                      backgroundColor: hoverColors.background,
                    }
                  : undefined
              }
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-fg transition-colors duration-250 ease-[cubic-bezier(.22,.9,.35,1)]"
            >
              <Link
                href={dropdownItem.href ?? "#"}
                target={dropdownItem.href?.startsWith("http") ? "_blank" : undefined}
                rel={dropdownItem.href?.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center gap-2 no-underline text-inherit"
              >
                <NavbarItemIcon icon={Icon} className="size-4 shrink-0" />
                <span>{dropdownItem.title}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
