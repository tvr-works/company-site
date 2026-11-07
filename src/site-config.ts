export type SiteIndexing = 'preview' | 'public';

export function resolveSiteIndexing(value: string | undefined, branch?: string): SiteIndexing {
  if (value === undefined || value === '' || value === 'preview') return 'preview';
  if (value !== 'public') throw new Error('VITE_SITE_INDEXING must be preview or public.');
  if (branch && branch !== 'main') throw new Error('Preview branches cannot enable public indexing.');
  return 'public';
}

export function resolveSiteOrigin(value: string | undefined): string {
  const url = new URL(value || 'https://tvr.works');
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('VITE_SITE_ORIGIN must be an HTTPS origin without a path or credentials.');
  }
  return url.origin;
}
