import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { buttonVariants } from './ui/button';
import { contactHref, site } from '../site';
import { cn } from '../lib/utils';

export function ContactLink({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href={contactHref}
      className={buttonVariants({ size: compact ? 'contact-compact' : 'contact' })}
      aria-label="Let’s talk — email Tim about your project"
    >
      Let’s talk
    </a>
  );
}

function ContactActions({ label, className }: { label: string; className?: string }) {
  return (
    <nav className={cn('contact-actions justify-end', className)} aria-label={label}>
      <a className="contact-social-link" href={site.linkedin}>
        LinkedIn <ArrowUpRight aria-hidden="true" />
      </a>
      <ContactLink compact />
    </nav>
  );
}

export function SiteHeader() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header page-width">
        <Link to="/" className="brand" aria-label="TVR Works home">
          <img src="/logo.svg" alt="TVR" width="84" height="44" />
          <span>Works</span>
        </Link>
        <ContactActions label="Header contact" />
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer page-width grid grid-cols-1 items-center justify-items-center gap-x-8 gap-y-3 text-center @2xl:grid-cols-2 @2xl:text-left">
      <div className="footer-legal flex min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 @2xl:justify-self-start @2xl:justify-start">
        <small>© 2026 {site.legalName}</small>
        <span className="inline-flex items-center gap-2.5">
          <span aria-hidden="true">·</span>
          <Link to="/privacy">Privacy</Link>
        </span>
      </div>
      <ContactActions
        label="Footer contact"
        className="justify-center @2xl:justify-self-end @2xl:justify-end"
      />
    </footer>
  );
}
