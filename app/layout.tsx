import type { Metadata } from 'next';
import './global.css';
import AppFooter from '@/components/layout/app-footer';
import AppNavbar from '@/components/navigation/app-navbar';
import { ScrollRestoration } from '@/components/navigation/scroll-restoration';
import { FooterBars } from '@/components/ui/footer-bars';
import { PageColorSchemeProvider } from '@/components/theme/page-color-scheme-provider';
import { ThemeHydrationScript } from '@/components/theme/theme-hydration-script';
import { ThemeProvider } from '@/components/theme/theme-provider';
import {
  resolveSiteMetadataBase,
  SITE_DESCRIPTION,
  SITE_OG_IMAGE_PATH,
  SITE_NAME,
} from '@/config/site/metadata';

export const metadata: Metadata = {
  metadataBase: resolveSiteMetadataBase(),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    images: [{ url: SITE_OG_IMAGE_PATH }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [SITE_OG_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeHydrationScript />
      </head>
      <body className="antialiased">
        <AppLayoutShell>{children}</AppLayoutShell>
      </body>
    </html>
  );
}

export function AppLayoutShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PageColorSchemeProvider>
        <ScrollRestoration />
        <div
          className="flex min-h-screen flex-col"
          style={{ paddingTop: 'var(--app-navbar-offset, 5.5rem)' }}
        >
          <AppNavbar />
          <main className="flex-1">{children}</main>
          <footer
            id="site-footer"
            className="border-t border-border/50 bg-background backdrop-blur-sm"
          >
            <div className="mx-auto flex items-center justify-center">
              <FooterBars />
            </div>
            <AppFooter />
          </footer>
        </div>
      </PageColorSchemeProvider>
    </ThemeProvider>
  );
}
