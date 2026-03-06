"use client"
import { useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import { Avatar } from "@/components/ui/avatar"
import { Link } from "@/components/ui/link"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu"
import {
  Navbar,
  NavbarGap,
  NavbarItem,
  NavbarMobile,
  type NavbarProps,
  NavbarProvider,
  NavbarSection,
  NavbarSpacer,
  NavbarStart,
  NavbarTrigger,
} from "@/components/ui/navbar"
import { BookText, Megaphone, Trophy, RailSymbol } from "lucide-react"

const railyard = [
  { id: 1, label: "Download App", url: "railyard" },
  { id: 2, label: "Browse Maps", url: "railyard/maps" },
  { id: 3, label: "Browse Mods", url: "railyard/mods" },
]

export default function AppNavbar(props: NavbarProps) {
  const [railyardOpen, setRailyardOpen] = useState(false)
  return (
    <NavbarProvider>
      <Navbar isSticky {...props}>
        <NavbarStart>
          <Link
            href="/"
            aria-label="Home"
            className="group flex items-center gap-x-2 font-medium no-underline transition-colors duration-150 ease-out"
          >
            <Avatar
              isSquare
              size="sm"
              className="outline-hidden transition-transform duration-150 ease-out group-hover:scale-[1.02]"
              src="logo.png"
            />
            <span className="font-bold text-muted-fg transition-colors duration-150 ease-out group-hover:text-primary">
              Subway Builder Modded
            </span>
          </Link>
        </NavbarStart>
        <NavbarGap />
        <NavbarSection>
          <NavbarItem isCurrent href="/wiki">
            <BookText data-slot="icon" className="size-5 md:size-4" />
            Wiki
          </NavbarItem>
          <NavbarItem isCurrent href="/updates">
            <Megaphone data-slot="icon" className="size-5 md:size-4" />
            Updates
          </NavbarItem>
          <NavbarItem isCurrent href="/credits">
            <Trophy data-slot="icon" className="size-5 md:size-4" />
            Credits
          </NavbarItem>
          <Menu
            isOpen={railyardOpen}
            onOpenChange={(next) => {
              setRailyardOpen((prev) => (next ? !prev : false))
            }}
          >
            <MenuTrigger
              className="
                flex items-center gap-x-2
                rounded-lg p-2 text-start font-medium text-base/6 md:text-sm/5
                no-underline
                transition-all duration-200 ease-[cubic-bezier(.22,.9,.35,1)]
                hover:scale-[1.035] active:scale-[0.96]

                bg-gradient-to-b from-emerald-400/30 via-emerald-500/20 to-emerald-600/30
                text-emerald-300
                shadow-[0_0_10px_rgba(16,185,129,0.35)]
                ring-1 ring-emerald-400/40
                hover:shadow-[0_0_16px_rgba(16,185,129,0.6)]
                hover:ring-emerald-300

                focus-visible:ring-0 focus-visible:outline-none
              "
            >
              <RailSymbol data-slot="icon" className="size-5 md:size-4 text-emerald-300" />
              <span className="font-semibold tracking-wide">Railyard</span>
              <ChevronDownIcon className="ml-1 size-5 md:size-4 text-emerald-200/90" />
            </MenuTrigger>

            <MenuContent
              nonModal
              popover={{
                // IMPORTANT: we'll make PopoverContent actually respect this in step #2
                shouldCloseOnScroll: false,
                shouldCloseOnInteractOutside: () => true,
              }}
              className="min-w-(--trigger-width) sm:min-w-56 !bg-background ring-1 ring-border rounded-xl"
              items={railyard}
            >
              {(item) => (
                <MenuItem id={item.id} textValue={item.label} href={item.url}>
                  {item.label}
                </MenuItem>
              )}
            </MenuContent>
          </Menu>
        </NavbarSection>
        <NavbarSpacer />
        <NavbarSection className="max-md:hidden">
          <Link
            href="https://discord.gg/YOUR_INVITE"
            aria-label="Discord"
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg p-2 text-muted-fg no-underline transition-all duration-150 ease-out hover:bg-secondary/60 hover:text-primary hover:scale-[1.08] active:scale-[0.94]
transition-all duration-200 ease-[cubic-bezier(.22,.9,.35,1)]"
          >
            <span
              className="block size-5 bg-current transition-colors duration-150"
              style={{
                WebkitMask: "url(/assets/discord.svg) center / contain no-repeat",
                mask: "url(/assets/discord.svg) center / contain no-repeat",
              }}
            />
          </Link>

          <Link
            href="https://github.com/YOUR_ORG_OR_REPO"
            aria-label="GitHub"
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg p-2 text-muted-fg no-underline transition-all duration-150 ease-out hover:bg-secondary/60 hover:text-primary hover:scale-[1.08] active:scale-[0.94]
transition-all duration-200 ease-[cubic-bezier(.22,.9,.35,1)]"
          >
            <span
              className="block size-5 bg-current transition-colors duration-150"
              style={{
                WebkitMask: "url(/assets/github.svg) center / contain no-repeat",
                mask: "url(/assets/github.svg) center / contain no-repeat",
              }}
            />
          </Link>
        </NavbarSection>
      </Navbar>
      <NavbarMobile>
        <NavbarTrigger />
        <NavbarSpacer />

        <a
          href="https://discord.gg/YOUR_INVITE"
          aria-label="Discord"
          target="_blank"
          rel="noreferrer"
          className="group rounded-lg p-2 text-muted-fg no-underline transition-all duration-150 ease-out hover:bg-secondary/60 hover:text-primary hover:scale-[1.08] active:scale-[0.94]
transition-all duration-200 ease-[cubic-bezier(.22,.9,.35,1)]"
        >
          <span
            className="block size-5 bg-current"
            style={{
              WebkitMask: "url(/assets/discord.svg) center / contain no-repeat",
              mask: "url(/assets/discord.svg) center / contain no-repeat",
            }}
          />
        </a>

        <a
          href="https://github.com/YOUR_REPO"
          aria-label="GitHub"
          target="_blank"
          rel="noreferrer"
          className="group rounded-lg p-2 text-muted-fg no-underline transition-all duration-150 ease-out hover:bg-secondary/60 hover:text-primary hover:scale-[1.08] active:scale-[0.94]
transition-all duration-200 ease-[cubic-bezier(.22,.9,.35,1)]"
        >
          <span
            className="block size-5 bg-current"
            style={{
              WebkitMask: "url(/assets/github.svg) center / contain no-repeat",
              mask: "url(/assets/github.svg) center / contain no-repeat",
            }}
          />
        </a>
      </NavbarMobile>
    </NavbarProvider>
  )
}
