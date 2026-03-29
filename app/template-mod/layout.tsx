import type { Metadata } from 'next';
import { buildEmbedMetadata } from '@/config/site/metadata';

export const metadata: Metadata = buildEmbedMetadata({
  title: 'Template Mod | Subway Builder Modded',
  description:
    'The all-inclusive TypeScript template to create your own mods for Subway Builder.',
});

export default function TemplateModLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
