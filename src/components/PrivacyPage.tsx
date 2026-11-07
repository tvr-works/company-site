import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { SiteFooter, SiteHeader } from './SiteChrome';
import { site } from '../site';

export function PrivacyPage() {
  return <div className="site-shell">
    <SiteHeader />
    <main id="main" className="information-page page-width" tabIndex={-1}>
      <Link to="/" className="back-link"><ArrowLeft aria-hidden="true" /> Back to TVR Works</Link>
      <h1>Privacy</h1>
      <p className="information-intro">This page explains how TVR Works LLC handles visits to this website and messages about working together.</p>
      <p className="updated">Updated <time dateTime={site.updated}>November 7, 2026</time></p>
      <section aria-labelledby="privacy-hosting"><h2 id="privacy-hosting">Website hosting and security</h2>
        <p>This website uses Cloudflare Pages for hosting, delivery, and security. Cloudflare processes connection and request information, which can include IP addresses, browser information, and the pages requested, to provide and protect its services. See <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare’s privacy policy</a>.</p>
      </section>
      <section aria-labelledby="privacy-analytics"><h2 id="privacy-analytics">Analytics and cookies</h2>
        <p>The website itself does not add advertising trackers, visitor analytics, or tracking cookies. You can read the site without creating an account or submitting information.</p>
      </section>
      <section aria-labelledby="privacy-messages"><h2 id="privacy-messages">When you get in touch</h2>
        <p>If you email me, I receive your email address, your message, and any attachments through my email providers. I use that information to respond, discuss your project, and manage our business relationship.</p>
        <p>I retain correspondence as needed for those purposes and for applicable recordkeeping obligations. You can ask about or request deletion of your information by emailing <a href={`mailto:${site.email}`}>{site.email}</a>. Some records may need to be retained to meet legal obligations or resolve disputes.</p>
      </section>
      <section aria-labelledby="privacy-links"><h2 id="privacy-links">Links to other websites</h2>
        <p>Links such as LinkedIn take you to services with their own privacy practices. This policy covers this company website; individual TVR Works products have their own privacy information.</p>
      </section>
      <section aria-labelledby="privacy-questions"><h2 id="privacy-questions">Questions and changes</h2>
        <p>For privacy questions, contact <a href={`mailto:${site.email}`}>{site.email}</a>. I’ll update this page and its date if these practices change.</p>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
