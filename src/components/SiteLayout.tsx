import type { ReactNode } from 'react';
import { SiteFooter, SiteHeader } from './SiteChrome';

export function SiteLayout({
  children,
  mainClassName,
}: {
  children: ReactNode;
  mainClassName?: string;
}) {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main" className={mainClassName} tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
