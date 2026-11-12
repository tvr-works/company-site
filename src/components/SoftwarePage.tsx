import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowUpRight, Braces, Terminal } from 'lucide-react';
import { SiteLayout } from './SiteLayout';

const software = [
  {
    name: 'Frame',
    platform: 'macOS · Open source',
    image: '/software/frame.png',
    description:
      'A keyboard-first window and workspace manager. Organize your Mac around the way you work.',
    href: 'https://github.com/tvanreenen/frame',
    action: 'View Frame',
  },
  {
    name: 'Key',
    platform: 'macOS · Open source',
    image: '/software/key.png',
    description:
      'A password and secret vault for your Mac’s terminal. Unlock with Touch ID, Apple Watch, or your Mac password.',
    href: 'https://key.tvr.works',
    action: 'Explore Key',
  },
  {
    name: 'Figure',
    platform: 'iPhone',
    image: '/software/figure.svg',
    description:
      'A visual calculator for construction, fabrication, and everyday projects. Trade math, made intuitive.',
    href: 'https://figure.tvr.works',
    action: 'Explore Figure',
  },
  {
    name: 'GolfTally',
    platform: 'iPhone & Apple Watch',
    image: '/software/golf-tally.png',
    description:
      'A private, local-first companion for your round. Keep score, measure yardage, and map your shots.',
    href: undefined,
    action: 'Coming soon',
  },
  {
    name: 'numpy-vector-store',
    platform: 'Python library · Open source',
    description:
      'Lightweight, in-memory vector search powered by NumPy. Bring your own embeddings and keep your stack simple.',
    href: 'https://vectors.tvr.works/',
    icon: Braces,
    action: 'Read docs',
  },
  {
    name: 'xkcdpass',
    platform: 'Command-line tool · Open source',
    description:
      'A small passphrase generator inspired by xkcd. Memorable words, cryptographically secure randomness.',
    href: 'https://xkcdpass.tvr.works',
    icon: Terminal,
    action: 'Explore xkcdpass',
  },
] as const;

export function SoftwarePage() {
  return (
    <SiteLayout mainClassName="software-page page-width">
      <Link to="/" className="back-link software-back">
        <ArrowLeft aria-hidden="true" /> Back to services
      </Link>
      <div className="software-intro">
        <h1>
          Apps, libraries
          <br />
          &amp; tools.
        </h1>
        <p>Independent software, built and maintained by TVR Works.</p>
      </div>
      <ul className="software-grid" aria-label="Software from TVR Works">
        {software.map((project) => (
          <li key={project.name} className="software-card">
            <div className="software-card-heading">
              <span className="software-card-icon">
                {'image' in project ? (
                  <img src={project.image} alt="" width="64" height="64" />
                ) : (
                  <project.icon aria-hidden="true" />
                )}
              </span>
              <div>
                <h2>{project.name}</h2>
                <p className="software-platform">{project.platform}</p>
              </div>
            </div>
            <p className="software-description">{project.description}</p>
            {project.href ? (
              <a className="software-link" href={project.href}>
                {project.action}
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : (
              <p className="software-coming-soon">{project.action}</p>
            )}
          </li>
        ))}
      </ul>
    </SiteLayout>
  );
}
