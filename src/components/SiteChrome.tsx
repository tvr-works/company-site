import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { contactHref, site } from '../site';

export function ContactLink({ compact = false }: { compact?: boolean }) {
  return <a href={contactHref} className={buttonVariants({ size: compact ? 'contact-compact' : 'contact' })} aria-label="Let’s talk — email Tim about your project">Let’s talk</a>;
}

export function SiteHeader() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header page-width">
      <Link to="/" className="brand" aria-label="TVR Works home">
        <img src="/logo.svg" alt="TVR" width="84" height="44" />
        <span>Works</span>
      </Link>
      <ContactLink compact />
    </header>
  </>;
}

export function ContactLinks() {
  return <div className="contact-links" aria-label="Contact Tim">
    <a href={contactHref}>Email <ArrowUpRight aria-hidden="true" /></a>
    <a href={site.linkedin}>LinkedIn <ArrowUpRight aria-hidden="true" /></a>
  </div>;
}

export function SiteFooter() {
  return <footer className="site-footer page-width">
    <small>© 2026 {site.legalName}</small>
    <Link to="/privacy">Privacy</Link>
  </footer>;
}
