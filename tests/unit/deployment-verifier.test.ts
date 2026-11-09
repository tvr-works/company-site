import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyDeployment } from '../../scripts/verify-deployment';

const commit = 'a'.repeat(40);
const deployment = 'https://release.example.com';
const canonical = 'https://tvr.works';
const paths = ['/', '/privacy', '/software'];
type Mode = 'production' | 'preview';

function fixture(path: string, mode: Mode): Response {
  const isPublic = mode === 'production';
  if (paths.includes(path))
    return new Response(
      `<link href="${canonical}${path}" rel="canonical"><meta content="${isPublic ? 'index, follow' : 'noindex, follow'}" name="robots"><a href="mailto:tim@tvr.works">Talk</a>`,
      {
        headers: {
          'content-type': 'text/html',
          'content-security-policy': "object-src 'none'; frame-ancestors 'none'",
          'x-content-type-options': 'nosniff',
          ...(isPublic ? {} : { 'x-robots-tag': 'noindex' }),
        },
      },
    );
  if (path === '/build-info.json')
    return Response.json({ commit, indexing: isPublic ? 'public' : 'preview' });
  if (path === '/robots.txt')
    return new Response(
      isPublic
        ? `User-agent: *\nAllow: /\nSitemap: ${canonical}/sitemap.xml\n`
        : 'User-agent: *\nDisallow: /\n',
    );
  if (path === '/sitemap.xml')
    return new Response(
      `<urlset>${isPublic ? paths.map((entry) => `<url><loc>${canonical}${entry}</loc></url>`).join('') : ''}</urlset>`,
    );
  return new Response('<meta name="robots" content="noindex, nofollow">', { status: 404 });
}

function serve(mode: Mode, override?: (path: string) => Response | undefined) {
  const request = vi.fn<typeof fetch>((input) => {
    if (typeof input !== 'string') throw new Error('Expected URL string.');
    const url = new URL(input);
    expect(url.origin).toBe(deployment);
    return Promise.resolve(override?.(url.pathname) ?? fixture(url.pathname, mode));
  });
  vi.stubGlobal('fetch', request);
  return request;
}

afterEach(() => vi.unstubAllGlobals());

describe('mode-aware immutable deployment verification', () => {
  it.each(['production', 'preview'] as const)(
    'verifies the intended commit and %s indexing without checking another origin',
    async (mode) => {
      const request = serve(mode);
      await expect(
        verifyDeployment({ url: deployment, mode, expectedCommit: commit }),
      ).resolves.toBeUndefined();
      expect(request).toHaveBeenCalledTimes(7);
    },
  );

  it('rejects a healthy deployment serving an older commit', async () => {
    serve('production', (path) =>
      path === '/build-info.json'
        ? Response.json({ commit: 'b'.repeat(40), indexing: 'public' })
        : undefined,
    );
    await expect(
      verifyDeployment({ url: deployment, mode: 'production', expectedCommit: commit }),
    ).rejects.toThrow('Deployed commit');
  });

  it('rejects the wrong canonical even when another link contains the expected URL', async () => {
    serve('production', (path) =>
      path === '/'
        ? new Response(
            `<link rel="canonical" href="https://wrong.example.com"><a href="${canonical}/">Expected URL elsewhere</a>`,
            { headers: { 'content-type': 'text/html' } },
          )
        : undefined,
    );
    await expect(
      verifyDeployment({ url: deployment, mode: 'production', expectedCommit: commit }),
    ).rejects.toThrow('Canonical URL');
  });

  it('rejects production blocked by an edge noindex header', async () => {
    serve('production', (path) => {
      if (path !== '/') return undefined;
      const response = fixture(path, 'production');
      response.headers.set('x-robots-tag', 'noindex');
      return response;
    });
    await expect(
      verifyDeployment({ url: deployment, mode: 'production', expectedCommit: commit }),
    ).rejects.toThrow('Edge indexing policy');
  });

  it('rejects previews with missing edge noindex protection', async () => {
    serve('preview', (path) => {
      if (path !== '/') return undefined;
      const response = fixture(path, 'preview');
      response.headers.delete('x-robots-tag');
      return response;
    });
    await expect(
      verifyDeployment({ url: deployment, mode: 'preview', expectedCommit: commit }),
    ).rejects.toThrow('Edge indexing policy');
  });

  it('rejects preview sitemaps that expose production pages', async () => {
    serve('preview', (path) => (path === '/sitemap.xml' ? fixture(path, 'production') : undefined));
    await expect(
      verifyDeployment({ url: deployment, mode: 'preview', expectedCommit: commit }),
    ).rejects.toThrow('Exact sitemap entries');
  });

  it('rejects missing pages that fall back to HTTP 200', async () => {
    serve('production', (path) =>
      path === '/missing-deployment-check' ? new Response('Home') : undefined,
    );
    await expect(
      verifyDeployment({ url: deployment, mode: 'production', expectedCommit: commit }),
    ).rejects.toThrow('real 404');
  });

  it('requires an exact commit before making network requests', async () => {
    const request = serve('production');
    await expect(
      verifyDeployment({ url: deployment, mode: 'production', expectedCommit: 'main' }),
    ).rejects.toThrow('exact deployed commit');
    expect(request).not.toHaveBeenCalled();
  });
});
