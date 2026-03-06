"use client"

import * as React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Archive,
  Check,
  ChevronDown,
  PanelLeftCloseIcon,
  Search,
  Tag,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  buildBaseHomeHref,
  buildVersionHref,
  getActiveInstanceFromPathname,
  getActiveVersionFromPathname,
  isLatestVersion,
  type WikiSidebarCategory,
  type WikiSidebarEntry,
  type WikiSidebarTree,
} from "@/lib/wiki-shared"
import { WIKI_INSTANCES, type WikiInstance, type WikiVersion } from "@/lib/wiki-config"

type AppWikiSidebarProps = {
  tree?: WikiSidebarTree
}

type OpenDropdown = "instance" | "version" | null

function useOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (!ref.current || ref.current.contains(target)) return
      handler()
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [ref, handler])
}

function InstanceIcon({ instance }: { instance: WikiInstance }) {
  const Icon = instance.icon

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
        instance.accentIconSurfaceClassName
      )}
    >
      <Icon className={cn("size-4", instance.accentClassName)} />
    </div>
  )
}

function VersionIcon({
  instance,
  version,
}: {
  instance: WikiInstance
  version: WikiVersion
}) {
  const Icon = isLatestVersion(instance, version.value) ? Tag : Archive

  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-150",
        isLatestVersion(instance, version.value)
          ? instance.accentIconSurfaceClassName
          : "border-border/80 bg-muted"
      )}
    >
      <Icon
        className={cn(
          "size-4",
          isLatestVersion(instance, version.value)
            ? instance.accentClassName
            : "text-muted-foreground"
        )}
      />
    </div>
  )
}

function StatusBadge({
  kind,
  instance,
}: {
  kind: "latest" | "deprecated"
  instance: WikiInstance
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        kind === "latest"
          ? cn(instance.accentSurfaceClassName, instance.accentClassName)
          : "border-zinc-400/25 bg-zinc-500/12 text-zinc-300"
      )}
    >
      {kind === "latest" ? "Latest" : "Deprecated"}
    </span>
  )
}

function DropdownTrigger({
  open,
  onToggle,
  className,
  children,
}: {
  open: boolean
  onToggle: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(event) => {
        if (
          event.key === "ArrowDown" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault()
          onToggle()
        }
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-150",
        open && "scale-[0.992]",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "ml-auto size-4 shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </button>
  )
}

function DropdownPanel({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid transition-all duration-200 ease-out",
        open ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
          {children}
        </div>
      </div>
    </div>
  )
}

function InstanceSwitcher({
  activeInstance,
  open,
  setOpen,
}: {
  activeInstance: WikiInstance
  open: boolean
  setOpen: (value: boolean) => void
}) {
  return (
    <div>
      <DropdownTrigger
        open={open}
        onToggle={() => setOpen(!open)}
        className={cn(
          "border-transparent text-white",
          activeInstance.accentSurfaceClassName,
          activeInstance.accentSurfaceHoverClassName
        )}
      >
        <InstanceIcon instance={activeInstance} />
        <div className="pr-1">
          <div className="text-[15px] font-semibold leading-tight text-white">
            {activeInstance.label}
          </div>
        </div>
      </DropdownTrigger>

      <DropdownPanel open={open}>
        {WIKI_INSTANCES.map((instance) => {
          const isActive = instance.id === activeInstance.id

          return (
            <NextLink
              key={instance.id}
              href={buildBaseHomeHref(instance)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-all duration-150",
                isActive
                  ? "bg-card"
                  : cn("hover:text-foreground", instance.accentSurfaceHoverClassName)
              )}
            >
              <InstanceIcon instance={instance} />
              <div className="min-w-0 flex-1 pr-1">
                <div className="text-[15px] font-semibold leading-tight text-foreground">
                  {instance.label}
                </div>
              </div>
              {isActive ? <Check className="size-5 text-primary" /> : null}
            </NextLink>
          )
        })}
      </DropdownPanel>
    </div>
  )
}

function VersionSwitcher({
  activeInstance,
  activeVersion,
  open,
  setOpen,
}: {
  activeInstance: WikiInstance
  activeVersion: NonNullable<ReturnType<typeof getActiveVersionFromPathname>>
  open: boolean
  setOpen: (value: boolean) => void
}) {
  if (!activeInstance.versioned || !activeInstance.versions?.length) return null

  return (
    <div>
      <DropdownTrigger
        open={open}
        onToggle={() => setOpen(!open)}
        className="border-transparent bg-card text-foreground hover:bg-card/90"
      >
        <VersionIcon instance={activeInstance} version={activeVersion} />
        <div className="pr-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold leading-tight text-foreground">
              {activeVersion.label}
            </span>
            {isLatestVersion(activeInstance, activeVersion.value) ? (
              <StatusBadge kind="latest" instance={activeInstance} />
            ) : null}
            {activeVersion.deprecated ? (
              <StatusBadge kind="deprecated" instance={activeInstance} />
            ) : null}
          </div>
        </div>
      </DropdownTrigger>

      <DropdownPanel open={open}>
        {activeInstance.versions.map((version) => {
          const isActive = version.value === activeVersion.value
          const latest = isLatestVersion(activeInstance, version.value)

          return (
            <NextLink
              key={version.value}
              href={buildVersionHref(activeInstance, version.value)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-all duration-150",
                isActive
                  ? "bg-card"
                  : latest
                    ? activeInstance.accentSurfaceHoverClassName
                    : "hover:bg-muted"
              )}
            >
              <VersionIcon instance={activeInstance} version={version} />
              <div className="min-w-0 flex-1 pr-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold leading-tight text-foreground">
                    {version.label}
                  </span>
                  {latest ? <StatusBadge kind="latest" instance={activeInstance} /> : null}
                  {version.deprecated ? (
                    <StatusBadge kind="deprecated" instance={activeInstance} />
                  ) : null}
                </div>
              </div>
              {isActive ? <Check className="size-5 text-primary" /> : null}
            </NextLink>
          )
        })}
      </DropdownPanel>
    </div>
  )
}

function SidebarCollapseButton() {
  const { state } = useSidebar()

  return (
    <SidebarTrigger
      className={cn(
        "size-8 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
        state === "collapsed" && "mx-auto"
      )}
    >
      <PanelLeftCloseIcon className="size-4" />
    </SidebarTrigger>
  )
}

function filterTree(entries: WikiSidebarEntry[], query: string): WikiSidebarEntry[] {
  if (!query.trim()) return entries

  const q = query.toLowerCase()

  return entries
    .map((entry) => {
      if (entry.kind === "page") {
        return entry.title.toLowerCase().includes(q) ? entry : null
      }

      const categoryMatches = entry.title.toLowerCase().includes(q)
      const filteredChildren = categoryMatches ? entry.items : filterTree(entry.items, query)

      if (!categoryMatches && filteredChildren.length === 0) return null

      return {
        ...entry,
        items: filteredChildren,
      } satisfies WikiSidebarCategory
    })
    .filter(Boolean) as WikiSidebarEntry[]
}

function collectActiveCategoryKeys(entries: WikiSidebarEntry[], pathname: string, out = new Set<string>()) {
  for (const entry of entries) {
    if (entry.kind === "category") {
      const childActive = entry.items.some((item) =>
        item.kind === "page"
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href ?? ""}/`)
      )

      if (
        (entry.href && (pathname === entry.href || pathname.startsWith(`${entry.href}/`))) ||
        childActive
      ) {
        out.add(entry.key)
      }

      collectActiveCategoryKeys(entry.items, pathname, out)
    }
  }

  return out
}

function SidebarNavEntry({
  entry,
  pathname,
  openKeys,
  setOpenKeys,
}: {
  entry: WikiSidebarEntry
  pathname: string
  openKeys: Set<string>
  setOpenKeys: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  if (entry.kind === "page") {
    const isActive = pathname === entry.href

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={cn(
            "h-9 rounded-xl px-3 text-[14px] font-medium transition-all duration-150",
            "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm",
            "data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:shadow-sm",
            "data-[active=true]:ring-1 data-[active=true]:ring-border/60"
          )}
        >
          <NextLink href={entry.href}>
            <span>{entry.title}</span>
          </NextLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const isOpen = openKeys.has(entry.key)
  const isActive =
    (entry.href && pathname === entry.href) ||
    (entry.href && pathname.startsWith(`${entry.href}/`)) ||
    entry.items.some((child) =>
      child.kind === "page"
        ? pathname === child.href
        : child.href
          ? pathname === child.href || pathname.startsWith(`${child.href}/`)
          : false
    )

  const toggle = () => {
    setOpenKeys((prev) => {
      const next = new Set(prev)
      if (next.has(entry.key)) {
        next.delete(entry.key)
      } else {
        next.add(entry.key)
      }
      return next
    })
  }

  const MainComp = entry.href ? NextLink : "div"
  const mainProps =
    entry.href
      ? {
          href: entry.href,
          onClick: () => {
            setOpenKeys((prev) => {
              const next = new Set(prev)
              next.add(entry.key)
              return next
            })
          },
        }
      : {}

  return (
    <SidebarMenuItem>
      <div
        className={cn(
          "group flex min-w-0 items-center gap-1 rounded-xl transition-all duration-150",
          isActive ? "bg-card ring-1 ring-border/60 shadow-sm" : "hover:bg-card/80"
        )}
      >
        <MainComp
          className={cn(
            "flex h-9 min-w-0 flex-1 items-center rounded-xl px-3 text-[14px] font-medium",
            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
          {...mainProps}
        >
          <span className="truncate">{entry.title}</span>
        </MainComp>

        <button
          type="button"
          aria-label={isOpen ? `Collapse ${entry.title}` : `Expand ${entry.title}`}
          onClick={toggle}
          className={cn(
            "mr-1 flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-150",
            "text-muted-foreground hover:text-foreground",
            "group-hover:bg-muted group-hover:text-foreground"
          )}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mt-1 ml-4 border-l border-border/70 pl-3">
            <SidebarMenu className="gap-1 py-1">
              {entry.items.map((child) => (
                <SidebarNavEntry
                  key={child.key}
                  entry={child}
                  pathname={pathname}
                  openKeys={openKeys}
                  setOpenKeys={setOpenKeys}
                />
              ))}
            </SidebarMenu>
          </div>
        </div>
      </div>
    </SidebarMenuItem>
  )
}

export function AppWikiSidebar({ tree }: AppWikiSidebarProps) {
  const pathname = usePathname()

  const activeInstance = React.useMemo(
    () => getActiveInstanceFromPathname(pathname),
    [pathname]
  )

  const activeVersion = React.useMemo(
    () => getActiveVersionFromPathname(activeInstance, pathname),
    [activeInstance, pathname]
  )

  const [openDropdown, setOpenDropdown] = React.useState<OpenDropdown>(null)
  const [search, setSearch] = React.useState("")
  const [openKeys, setOpenKeys] = React.useState<Set<string>>(new Set())

  const switcherAreaRef = React.useRef<HTMLDivElement | null>(null)

  useOnClickOutside(switcherAreaRef, () => setOpenDropdown(null))

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  React.useEffect(() => {
    setOpenDropdown(null)
  }, [pathname])

  const filteredEntries = React.useMemo(
    () => filterTree(tree?.entries ?? [], search),
    [tree?.entries, search]
  )

  React.useEffect(() => {
    const activeKeys = collectActiveCategoryKeys(tree?.entries ?? [], pathname)
    setOpenKeys((prev) => {
      const next = new Set(prev)
      activeKeys.forEach((key) => next.add(key))
      return next
    })
  }, [pathname, tree?.entries])

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(
        "border-r border-border bg-sidebar md:!absolute md:top-0 md:bottom-0 md:h-auto"
      )}
    >
      <SidebarHeader className="gap-4 px-4 pt-6 pb-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Documentation
          </div>
          <SidebarCollapseButton />
        </div>

        <div
          ref={switcherAreaRef}
          className="space-y-3 group-data-[collapsible=icon]:hidden"
        >
          <InstanceSwitcher
            activeInstance={activeInstance}
            open={openDropdown === "instance"}
            setOpen={(value) => setOpenDropdown(value ? "instance" : null)}
          />

          {activeInstance.versioned && activeVersion ? (
            <VersionSwitcher
              activeInstance={activeInstance}
              activeVersion={activeVersion}
              open={openDropdown === "version"}
              setOpen={(value) => setOpenDropdown(value ? "version" : null)}
            />
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 opacity-70" />

      <SidebarContent className="px-3 py-4">
        <div className="group-data-[collapsible=icon]:hidden">
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <SidebarInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the docs..."
              className="h-8 rounded-xl border-border bg-card pl-9 text-sm"
            />
          </div>
        </div>

        <div className="group-data-[collapsible=icon]:hidden">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-2 shadow-sm">
            <SidebarGroup className="p-0">
              <SidebarMenu className="gap-1">
                {filteredEntries.map((entry) => (
                  <SidebarNavEntry
                    key={entry.key}
                    entry={entry}
                    pathname={pathname}
                    openKeys={openKeys}
                    setOpenKeys={setOpenKeys}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
