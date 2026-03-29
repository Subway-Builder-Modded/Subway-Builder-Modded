type EmbedDescriptionOverrideMap = Record<string, string>;

// Define per-page embed descriptions here.
// Keys are absolute pathname values (for example: "/railyard/docs/v0.2/players").
export const EMBED_DESCRIPTION_OVERRIDES: EmbedDescriptionOverrideMap = {
  '/railyard/docs':
    'Documentation for Railyard players and developers, including setup, publishing, and best practices.',
  '/template-mod/docs':
    'Documentation for Template Mod, including setup, architecture, and API usage patterns.',
  '/railyard/updates':
    'Changelogs and release notes for Railyard.',
  '/template-mod/updates':
    'Changelogs and release notes for Template Mod.',
};

export function resolveEmbedDescription(
  pathname: string,
  fallback: string,
): string {
  const override = EMBED_DESCRIPTION_OVERRIDES[pathname]?.trim();
  return override && override.length > 0 ? override : fallback;
}
