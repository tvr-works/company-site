import { Link } from '@tanstack/react-router';
import { buttonVariants } from './ui/button';
import { SiteLayout } from './SiteLayout';

export function NotFoundPage() {
  return (
    <SiteLayout mainClassName="information-page not-found page-width">
      <p className="eyebrow">404 · Page not found</p>
      <h1>
        Let’s get you
        <br /> back on track.
      </h1>
      <p>This page may have moved, or the address may be incorrect.</p>
      <Link to="/" className={buttonVariants({ size: 'contact' })}>
        Back to TVR Works
      </Link>
    </SiteLayout>
  );
}
