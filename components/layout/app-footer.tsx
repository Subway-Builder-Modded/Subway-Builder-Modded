'use client';

import { Link } from '@/components/ui/link';
import { Avatar } from '@/components/ui/avatar';
import { AppIcon } from '@/components/common/app-icon';
import {
  FOOTER_NAV_SECTIONS,
  FOOTER_SOCIAL_LINKS,
} from '@/config/navigation/footer';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_LOGO_PATH,
} from '@/config/site/metadata';

export default function AppFooter() {
  return (
    <div className="px-[clamp(1rem,4vw,3.5rem)] pb-8 pt-6">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:gap-x-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-x-6">
          {FOOTER_NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                <AppIcon icon={section.icon} className="size-3.5 shrink-0" />
                {section.title}
              </h3>
              <div className="flex flex-col gap-0.5">
                {section.links.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-accent/45 hover:text-primary"
                  >
                    <AppIcon icon={link.icon} className="size-3.5 shrink-0" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-foreground no-underline transition-colors hover:text-primary"
          >
            <Avatar
              isSquare
              size="sm"
              src={SITE_LOGO_PATH}
              className="border-0 shadow-none outline-hidden ring-0 [&_*]:border-0 [&_*]:shadow-none [&_*]:ring-0"
            />
            <span>{SITE_NAME}</span>
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground md:text-right">
            {SITE_DESCRIPTION}
          </p>
          <div className="flex items-center gap-1">
            {FOOTER_SOCIAL_LINKS.map((social) => (
              <Link
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-muted-foreground no-underline transition-colors hover:bg-accent/45 hover:text-primary"
              >
                <AppIcon icon={social.icon} className="size-4 shrink-0" />
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border/60 pt-4">
        <p className="text-center text-sm text-muted-foreground">
          © {SITE_NAME} {new Date().getFullYear()}. Not affiliated with Subway
          Builder or Redistricter, LLC. All content is community-created and
          shared under appropriate licenses.
        </p>
      </div>
    </div>
  );
}
