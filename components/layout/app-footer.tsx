"use client"

import type { CSSProperties } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Link } from "@/components/ui/link"
import { AppIcon } from "@/components/common/app-icon"
import { FOOTER_NAV_SECTIONS, FOOTER_SOCIAL_LINKS, getFooterNavColorScheme } from "@/config/navigation/footer"
import { SITE_DESCRIPTION, SITE_NAME, SITE_LOGO_PATH } from "@/config/site/metadata"

export default function AppFooter() {
  const sectionCount = Math.max(1, FOOTER_NAV_SECTIONS.length)

  return (
    <footer className="bg-sidebar">
      <div className="px-4 py-8">
        <div className="grid gap-10 md:grid-cols-[1fr_max-content] md:gap-x-24 md:items-center">
          <div
            className="grid grid-cols-1 gap-10 md:justify-self-start md:ml-8 md:gap-x-[clamp(2rem,5vw,8rem)] md:[grid-template-columns:repeat(var(--footer-column-count),minmax(0,max-content))]"
            style={{ ["--footer-column-count" as string]: String(sectionCount) }}
          >
            {FOOTER_NAV_SECTIONS.map((section) => {
              const scheme = getFooterNavColorScheme(section.colorScheme)
              const sectionStyle = {
                ["--footer-accent-light" as string]: scheme.accentColor.light,
                ["--footer-accent-dark" as string]: scheme.accentColor.dark,
                ["--footer-muted-light" as string]: scheme.mutedColor.light,
                ["--footer-muted-dark" as string]: scheme.mutedColor.dark,
              } as CSSProperties

              return (
                <div key={section.id} style={sectionStyle} className="flex flex-col items-start text-left">
                  <div className="mb-4 flex items-center justify-start gap-2">
                    <AppIcon
                      icon={section.icon}
                      className="size-5 stroke-[2.25] text-[var(--footer-accent-light)] dark:text-[var(--footer-accent-dark)] md:size-6"
                    />
                    <h3 className="text-base font-bold text-[var(--footer-accent-light)] dark:text-[var(--footer-accent-dark)] md:text-lg">
                      {section.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-start gap-2 text-sm">
                    {section.links.map((link) => {
                      return (
                        <Link
                          key={link.id}
                          href={link.href}
                          className="flex items-center justify-start gap-2 [--text:var(--footer-muted-light)] hover:[--text:var(--footer-accent-light)] dark:[--text:var(--footer-muted-dark)] dark:hover:[--text:var(--footer-accent-dark)]"
                        >
                          <AppIcon icon={link.icon} className="size-4 stroke-[2.25]" />
                          <span>{link.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-3 text-center md:justify-self-end md:mr-8">
            <div className="flex items-center justify-center gap-2">
              <Link href="/" className="flex items-center gap-2 font-bold text-foreground transition-colors hover:text-secondary">
                <Avatar
                  isSquare
                  size="sm"
                  src={SITE_LOGO_PATH}
                  className="outline-hidden ring-0 shadow-none border-0 [&_*]:ring-0 [&_*]:border-0 [&_*]:shadow-none"
                />
                <span className="font-bold">{SITE_NAME}</span>
              </Link>
            </div>

            <p className="max-w-xs text-sm text-muted-foreground">{SITE_DESCRIPTION}</p>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-end md:mr-14">
          <div className="flex items-center gap-4">
            {FOOTER_SOCIAL_LINKS.map((social) => (
              <Link
                key={social.id}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer"
                className="text-muted-fg hover:text-secondary transition-colors"
              >
                <AppIcon icon={social.icon} className="size-5" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-0 mb-8 border-t" />

        <div className="flex flex-col items-stretch gap-4">
          <p className="text-center text-sm text-muted-foreground">
            © {SITE_NAME} {new Date().getFullYear()}. Not affiliated with Subway Builder or Redistricter, LLC. All content is community-created and shared under appropriate licenses.
          </p>
        </div>
      </div>
    </footer>
  )
}
