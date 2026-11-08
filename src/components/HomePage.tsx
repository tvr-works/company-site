import { ContactLink, SiteFooter, SiteHeader } from './SiteChrome';
import { Partnership } from './Partnership';

export function HomePage() {
  return <div className="site-shell">
    <SiteHeader />
    <main id="main" tabIndex={-1}>
      <section className="hero page-width" aria-labelledby="hero-heading">
        <h1 id="hero-heading">Your vision.<br /><span>A partner to build it.</span></h1>
        <p>Turn a new idea into working software. Reimagine an existing system. Work directly with an engineer who brings product perspective and technical depth.</p>
        <ContactLink />
      </section>
      <Partnership />
      <section className="perspective page-width" aria-labelledby="perspective-heading">
        <h2 id="perspective-heading">Product<br /> perspective.<br /> Engineering<br /> depth.</h2>
        <div className="perspective-copy">
          <p>I’m Tim VanReenen. I bring 20 years of experience across software engineering, product design, product management, and technical leadership.</p>
          <p>Whether you’re a founder with a new idea or a business owner looking to build a new system or rebuild an existing one, I can help you design it, build it, and keep it running.</p>
          <p>I’ve partnered directly with clients and supported consulting teams as a subcontractor on their client projects. I build applications and cloud infrastructure on platforms that fit your project. My experience includes Azure and Google Cloud.</p>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
