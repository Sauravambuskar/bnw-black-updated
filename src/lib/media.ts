/**
 * Central media manifest.
 *
 * All image / PDF assets are served from `public/media/**`, so they ship with
 * the app instead of being hot-linked from the Lovable CDN (`/__l5e/assets-v1/...`)
 * or from third-party origins. Vite copies `public/` to the build output
 * untouched, so these paths are stable in dev, preview and production.
 */

export const MEDIA = {
  brand: {
    logo: "/media/brand/bnw-logo.png",
    ogPreview: "/media/brand/og-preview.png",
  },
  backgrounds: {
    hero: "/media/backgrounds/hero.jpg",
    destination: "/media/backgrounds/destination.png",
    rationale: "/media/backgrounds/rationale.jpg",
    wynn: "/media/backgrounds/wynn.jpg",
  },
  projects: {
    orvessa: "/media/projects/orvessa-v3.png",
    orvessaAlt: "/media/projects/orvessa.png",
    orvessaAlt2: "/media/projects/orvessa-v2.png",
    taj: "/media/projects/taj.png",
    radisson: "/media/projects/radisson.png",
    tonino: "/media/projects/tonino.png",
  },
  brochures: {
    orvessa: "/media/brochures/orvessa-brochure.pdf",
    taj: "/media/brochures/taj-brochure.pdf",
    lamborghini: "/media/brochures/lamborghini-brochure.pdf",
    radisson: "/media/brochures/radisson-brochure.pdf",
  },
} as const;

/** Absolute URL for a media path — needed for og:image / twitter:image tags. */
export const SITE_ORIGIN = "https://salesinfopro.com";

export const absoluteMedia = (path: string) => `${SITE_ORIGIN}${path}`;
