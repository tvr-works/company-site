import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { contactHref, site } from '../site';

export function ContactLink({ compact = false }: { compact?: boolean }) {
  return <a href={contactHref} className={buttonVariants({ size: compact ? 'contact-compact' : 'contact' })} aria-label="Let’s talk — email Tim about your project">Let’s talk</a>;
}

function ContactActions({ label }: { label: string }) {
  return <nav className="contact-actions" aria-label={label}>
    <a className="contact-social-link" href={site.linkedin}>LinkedIn <ArrowUpRight aria-hidden="true" /></a>
    <ContactLink compact />
  </nav>;
}

export function SiteHeader() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header page-width">
      <Link to="/" className="brand" aria-label="TVR Works home">
        <img src="/logo.svg" alt="TVR" width="84" height="44" />
        <span>Works</span>
      </Link>
      <ContactActions label="Header contact" />
    </header>
  </>;
}

export function SiteFooter() {
  return <footer className="site-footer page-width">
    <div className="footer-legal">
      <small>© 2026 {site.legalName}</small>
      <span aria-hidden="true">·</span>
      <Link to="/privacy">Privacy</Link>
    </div>
    <ContactActions label="Footer contact" />
  </footer>;
}
