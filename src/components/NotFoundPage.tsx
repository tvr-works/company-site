import { Link } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from './SiteChrome';
import { buttonVariants } from './ui/button';

export function NotFoundPage() {
  return <div className="site-shell">
    <SiteHeader />
    <main id="main" className="information-page not-found page-width" tabIndex={-1}>
      <p className="eyebrow">404 · Page not found</p>
      <h1>Let’s get you<br /> back on track.</h1>
      <p>This page may have moved, or the address may be incorrect.</p>
      <Link to="/" className={buttonVariants({ size: 'contact' })}>Back to TVR Works</Link>
    </main>
    <SiteFooter />
  </div>;
}
