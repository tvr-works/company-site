import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router';
import { NotFoundPage } from '../components/NotFoundPage';
import styles from '../styles.css?url';
import { sitePages } from '../site-config';
import geistFont from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#080f16' },
    ],
    links: [
      { rel: 'preload', href: geistFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: styles },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage,
});

function RootDocument() {
  const staticNotFound = useRouterState({
    select: (state) => state.location.pathname === sitePages.notFound.path,
  });
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        {!staticNotFound && <Scripts />}
      </body>
    </html>
  );
}
