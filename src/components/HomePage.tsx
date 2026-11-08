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
          Turn a new idea into working software. Reimagine an existing system. Work directly with an
          engineer who brings product perspective and technical depth.
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
            Whether you’re a founder with a new idea or a business owner who needs a new or better
            system, I can help you design it, build it, and keep it running.
          </p>
          <p>
            I take the time to understand your business, help you weigh the options, and take
            responsibility for the engineering. You’ll work directly with me on your own project or
            one you’re delivering for a client.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
