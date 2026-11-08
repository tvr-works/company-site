import { ContactLink } from './SiteChrome';
import { Partnership } from './Partnership';
import { SiteLayout } from './SiteLayout';

export function HomePage() {
  return (
    <SiteLayout>
      <section className="hero page-width" aria-labelledby="hero-heading">
        <h1 id="hero-heading">
          Your vision.
          <br />
          <span>A partner to build it.</span>
        </h1>
        <p>
          Turn a new idea into working software, or rebuild a system your business depends on. Work
          with one experienced partner from the first decisions through delivery.
        </p>
        <ContactLink />
      </section>
      <Partnership />
      <section className="perspective page-width" aria-labelledby="perspective-heading">
        <h2 id="perspective-heading">
          Product
          <br /> perspective.
          <br /> Engineering
          <br /> depth.
        </h2>
        <div className="perspective-copy">
          <p>
            I’m Tim VanReenen. I bring 20 years of experience across software engineering, product
            design, product management, and technical leadership.
          </p>
          <p>
            I help founders bring new products to life and small and midsize businesses build and
            modernize the systems they rely on.
          </p>
          <p>
            I take the time to understand your business and work through the decisions with you. You
            get one partner to design the system, build the software, and keep it running.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
