import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppLayoutShell } from '@/app/layout';

vi.mock('@/components/navigation/app-navbar', () => ({
  default: () => <nav data-testid="app-navbar">Navbar</nav>,
}));

vi.mock('@/components/layout/app-footer', () => ({
  default: () => <div data-testid="app-footer">Footer</div>,
}));

vi.mock('@/components/ui/footer-bars', () => ({
  FooterBars: () => <div data-testid="footer-bars">Bars</div>,
}));

vi.mock('@/components/navigation/scroll-restoration', () => ({
  ScrollRestoration: () => <div data-testid="scroll-restoration" />,
}));

vi.mock('@/components/theme/theme-hydration-script', () => ({
  ThemeHydrationScript: () => <script data-testid="theme-hydration-script" />,
}));

vi.mock('@/components/theme/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@/components/theme/page-color-scheme-provider', () => ({
  PageColorSchemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-color-scheme-provider">{children}</div>
  ),
}));

describe('AppLayoutShell', () => {
  it('composes navbar, main content, and footer around children', () => {
    render(
      <AppLayoutShell>
        <div data-testid="route-content">Route content</div>
      </AppLayoutShell>,
    );

    expect(screen.getByTestId('app-navbar')).toBeVisible();
    expect(screen.getByTestId('route-content')).toBeVisible();
    expect(screen.getByTestId('footer-bars')).toBeVisible();
    expect(screen.getByTestId('app-footer')).toBeVisible();

    const main = screen.getByRole('main');
    expect(within(main).getByTestId('route-content')).toBeVisible();
  });
});
