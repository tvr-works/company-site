import { resolveSiteIndexing, resolveSiteOrigin } from './site-config';

export const site = {
  name: 'TVR Works',
  legalName: 'TVR Works LLC',
  origin: resolveSiteOrigin(import.meta.env.VITE_SITE_ORIGIN),
  email: 'tim@vanreenen.me',
  linkedin: 'https://www.linkedin.com/in/tvanreenen/',
  indexing: resolveSiteIndexing(import.meta.env.VITE_SITE_INDEXING),
  updated: '2026-11-07',
};

export const contactHref = `mailto:${site.email}?subject=Let%E2%80%99s%20talk%20about%20a%20project`;

export function pageHead(path: string, title: string, description: string) {
  const url = `${site.origin}${path}`;
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: path === '/404' ? 'noindex, nofollow' : site.indexing === 'public' ? 'index, follow' : 'noindex, follow' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: site.name },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: `${site.origin}/social-card.png` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'TVR Works — Your vision. A partner to build it. Custom software, modernization, AI, and technical direction.' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: `${site.origin}/social-card.png` },
      { name: 'twitter:image:alt', content: 'TVR Works — Your vision. A partner to build it.' },
    ],
    links: [{ rel: 'canonical', href: url }],
  };
}

export const organizationData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': `${site.origin}/#organization`, name: site.name, legalName: site.legalName,
      url: `${site.origin}/`, logo: `${site.origin}/logo.svg`, email: site.email,
      founder: { '@id': `${site.origin}/#tim` },
      description: 'Independent software engineering, application modernization, applied AI, and fractional technical leadership.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog', name: 'Engineering and advisory services',
        itemListElement: ['Custom applications and solutions', 'Software modernization', 'Applied AI and automation', 'Fractional technical leadership and architecture advice'].map(name => ({
          '@type': 'Offer', itemOffered: { '@type': 'Service', name, provider: { '@id': `${site.origin}/#organization` } },
        })),
      },
    },
    { '@type': 'Person', '@id': `${site.origin}/#tim`, name: 'Tim VanReenen', jobTitle: 'Software engineer and architect', sameAs: [site.linkedin] },
    { '@type': 'WebSite', '@id': `${site.origin}/#website`, name: site.name, url: `${site.origin}/`, publisher: { '@id': `${site.origin}/#organization` }, inLanguage: 'en' },
  ],
};
