# TVR Works

The company services site for TVR Works LLC, built from the approved [visual concept](docs/design/approved-concept.png). React, TanStack Start/Router, TypeScript, Tailwind CSS 4, and shadcn components backed by Base UI. No client or employer names appear in the public content.

## Local review

Use the Node version in `.node-version` and npm. Dependencies are pinned in `package-lock.json`.

```sh
npm ci
npm run dev
```

For the production artifact:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Open `http://127.0.0.1:4173/`. The preview serves the actual static output, including `/privacy` and a real 404 response for missing URLs. It applies the generated security headers. It does not use a runtime application server or a catch-all homepage fallback.

## Checks

```sh
npm run check
npm run test:browser
```

`check` runs Oxlint (including `@shadcn/lint` and JSX accessibility rules), route generation, TypeScript, and the indexing/identity tests. The browser suite builds the site and starts a separate static preview on port 4174. It covers Chromium and WebKit, axe scans, keyboard access, contact-link semantics, client navigation/history, no-JavaScript content, 404 status, metadata, reduced motion, normal reflow from 320–1920px, and 200% text. Install the matching Playwright Chromium/WebKit browsers if they are not already available locally.

The shadcn CLI supplied `src/components/ui/button.tsx`; the two contact sizes belong to that primitive. Contact CTAs are actual anchors styled with `buttonVariants`, following Base UI’s link guidance, rather than buttons with link destinations. Keep their native link behavior.

## Editing

| Concern | Source |
| --- | --- |
| Homepage and biography | `src/components/HomePage.tsx` |
| Service labels and semantic diagram content | `src/components/Partnership.tsx` |
| Contact address, LinkedIn, metadata, structured data | `src/site.ts` |
| Theme, typography, layout, responsive rules | `src/styles.css` |
| Diagram and atmosphere | `public/assets/*.svg` |
| Original brand mark | `public/logo.svg` |
| Privacy | `src/components/PrivacyPage.tsx` |
| Site indexing and canonical origin validation | `src/site-config.ts` |
| Static artifact/crawler files/security headers | `scripts/finalize-static.ts` |
| Sharing image and touch icon | `scripts/render-social-card.ts` |

The diagram’s labels are real HTML in one consistent reading order. Its SVG contains only decorative geometry and is hidden from assistive technology. Font-relative container queries let the diagram reflow into a service list on smaller screens and when visitors enlarge text. Theme and content remain owned by this site; no shared package or monorepo migration has been introduced.

## Search and public identity

`VITE_SITE_ORIGIN` defaults provisionally to `https://tvr.works`; `https://llc.tvr.works` is also supported. The public contact currently uses the existing `tim@vanreenen.me` address. Both are centralized for final review.

Ordinary builds have `noindex, follow`, a disallowing `robots.txt`, and an empty sitemap. `VITE_SITE_INDEXING=public` explicitly enables indexing and the two-page sitemap; a non-main Cloudflare branch rejects that setting. Production mode alone does not enable search indexing. No public build has been published.

Pages contain full prerendered HTML and per-route titles, descriptions, canonical URLs, Open Graph/Twitter metadata, and self-hosted sharing artwork. The homepage includes Organization, Person, WebSite, and service-catalog structured data. Authored content dates are maintained deliberately rather than changed on every build. No fabricated address, reviews, ratings, availability, or pricing is used.

`npm run asset:social` regenerates the 1200×630 sharing card and 180px Apple touch icon from the supplied TVR monogram. The site self-hosts Geist Variable and distributes its OFL notice in `public/licenses/`. Vite emits bundled-dependency notices into `dist/client/licenses/dependencies.md`; the generated shadcn source’s MIT notice is also included. Third-party code and fonts retain their own licenses. The diagram/atmosphere are small SVG assets, not a screenshot of the concept or a canvas/WebGL renderer.

## Hosting/privacy boundary

The build prerenders `/`, `/privacy`, and `/404` into `dist/client`. That is the static artifact intended for Cloudflare Pages. The locally generated `dist/server` supports prerendering and is not needed to serve the finished site.

No advertising, visitor-analytics script, third-party embed, contact form, or tracking cookie is added by this source. TanStack Router uses session storage for functional scroll restoration. The preview applies a restrictive CSP with hashes for the generated inline scripts, plus referrer, content-type, and permissions headers.

Before any future publication, confirm the final hostname/email and actual Cloudflare monitoring configuration. Cloudflare can inject Web Analytics outside the source code; if enabled, update the privacy disclosure and CSP to match the actual beacon/endpoints. The current CSP intentionally permits only same-origin script/network resources. Do not claim that absence of a script in source proves absence of dashboard-injected services.

This work is local only. No Git push, Pages project, DNS change, analytics setting, deployment, or indexing change has been performed.
