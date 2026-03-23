'use client';

import { createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';

import {
  resolveSiteColorScheme,
  type SiteColorSchemeId,
} from '@/config/theme/scheme-config';

const PageColorSchemeContext = createContext<SiteColorSchemeId>('default');

export function usePageColorScheme() {
  return useContext(PageColorSchemeContext);
}

export function PageColorSchemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const scheme = useMemo(
    () => resolveSiteColorScheme(pathname ?? '/'),
    [pathname],
  );

  return (
    <PageColorSchemeContext value={scheme}>
      <div data-color-scheme={scheme} className="min-h-screen">
        {children}
      </div>
    </PageColorSchemeContext>
  );
}
