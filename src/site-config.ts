export type SiteIndexing = 'preview' | 'public';

// Shared by the frontend and Node build scripts; keep this module environment-free.
export const siteIdentity = {
  name: 'TVR Works',
  legalName: 'TVR Works LLC',
  origin: 'https://tvr.works',
  email: 'tim@tvr.works',
  linkedin: 'https://www.linkedin.com/in/tvanreenen/',
} as const;

export const sitePages = {
  home: {
    path: '/',
    outputFile: 'index.html',
    title: 'TVR Works — Custom Software, Applied AI & Technical Leadership',
    description:
      'Custom applications for founders and established businesses. Work directly with Tim VanReenen on software modernization, applied AI, and fractional technical leadership.',
    lastModified: '2026-11-08',
    indexable: true,
  },
  privacy: {
    path: '/privacy',
    outputFile: 'privacy.html',
    title: 'Privacy — TVR Works',
    description:
      'How TVR Works LLC handles website visits, hosting information, and project inquiries.',
    lastModified: '2026-11-07',
    indexable: true,
  },
  notFound: {
    path: '/404',
    outputFile: '404.html',
    title: 'Page not found — TVR Works',
    description: 'This page could not be found. Return to TVR Works.',
    indexable: false,
  },
} as const;

export type SitePage = (typeof sitePages)[keyof typeof sitePages];

export function resolveSiteIndexing(value: string | undefined, branch?: string): SiteIndexing {
  if (value === undefined || value === '' || value === 'preview') return 'preview';
  if (value !== 'public') throw new Error('VITE_SITE_INDEXING must be preview or public.');
  if (branch && branch !== 'main')
    throw new Error('Preview branches cannot enable public indexing.');
  return 'public';
}

export function resolveSiteOrigin(value: string | undefined): string {
  const url = new URL(value || siteIdentity.origin);
  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error('VITE_SITE_ORIGIN must be an HTTPS origin without a path or credentials.');
  }
  return url.origin;
}
