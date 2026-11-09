# TVR Works

The company services site for TVR Works LLC, built from the approved [visual concept](docs/design/approved-concept.png). React, TanStack Start/Router, TypeScript, Tailwind CSS 4, and shadcn components backed by Base UI. No client or employer names appear in the public content.

This README owns the current setup and maintenance guidance. Historical records: [Cloudflare launch](docs/cloudflare-launch.md), [design and release QA](docs/design-qa.md), and the [archived initial plan](docs/archive/initial-site-plan.md).

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

Open `http://127.0.0.1:4173/`. The preview serves the actual static output, including `/software`, `/privacy`, and a real 404 response for missing URLs. It applies the generated security headers. It does not use a runtime application server or a catch-all homepage fallback.

## Checks

```sh
npm run format
npm run check
npm run test:browser
```

`format` applies the pinned Oxfmt configuration to maintained source, configuration, and documentation. Generated files, public artwork/licenses, design evidence, and archived plans are excluded. `check` verifies formatting, generates the route tree, runs type-aware Oxlint, checks strict TypeScript, and runs the indexing/identity unit tests. Oxlint treats correctness, suspicious-code, and performance findings as errors, with React Hooks, JSX accessibility, import-cycle, promise, and unsafe-type checks. All six shadcn policies apply to application code. The shared UI primitive directory permits component-owned variants, structural values, and styling, as recommended by shadcn. React's automatic JSX runtime needs no React import; browser test loops intentionally run sequentially against the same page. Those exceptions are scoped in `.oxlintrc.json`. Warnings and unused lint suppressions fail checks.

TypeScript also checks indexed access, optional-property semantics, switch fallthrough, return paths, side-effect imports, and filename casing. Vite client environment variables are explicitly typed; `.env` files stay out of Git.

The browser suite builds the site and starts a separate static preview on port 4174. It covers Chromium and WebKit, axe scans, keyboard access, contact-link semantics, client navigation/history, no-JavaScript content, 404 status, metadata and crawler files, CSP script hashes, delivered security headers, Cloudflare email exemptions, reduced motion, normal reflow from 320–1920px, and 200% text. Install the matching Playwright Chromium/WebKit browsers if they are not already available locally.

To verify the public artifact locally as CI does:

```sh
VITE_SITE_INDEXING=public CF_PAGES_BRANCH=production npm run test:artifact
```

`tests/unit/` contains the configuration tests. `tests/browser/experience.spec.ts` covers visitor interactions, accessibility, and reflow; `delivery.spec.ts` covers prerendered content, metadata, and HTTP delivery. The `@artifact` tag selects public-build checks independently of test titles. Browser tests share their base URL and port through `playwright.config.ts`.

Every build also runs `npm run check:budget` against the generated client assets. `build-budgets.json` limits all JavaScript chunks together to 450 KiB raw / 150 KiB gzip, CSS to 36 KiB raw / 8 KiB gzip, and fonts to 36 KiB raw. Gzip sizes use deterministic level-9 compression; they are build guards, not predictions of CDN transfer sizes. Missing asset groups and exceeded limits fail the build, including Cloudflare builds and CI. Investigate dependency or content growth before increasing a limit. Social/search artwork is not loaded by the homepage renderer and is outside these runtime-asset budgets.

The November 8 mobile audit used Lighthouse 13.6.0 against the local public artifact, with its default simulated mobile throttling (4× CPU, 1.6 Mbps). Three baseline runs scored 100/99/99 with a median CLS of 0.082; after the font preload, all three scored 100 with CLS 0. LCP stayed around 0.75 seconds and TBT stayed at zero. Accessibility, best-practices, and SEO categories scored 100 in all six runs. These are local lab results; production network latency and field INP remain unmeasured.

To repeat the lab audit, build with `VITE_SITE_INDEXING=public CF_PAGES_BRANCH=production`, start the static preview, and run pinned `npm exec --yes --package=lighthouse@13.6.0 -- lighthouse http://127.0.0.1:4173/ --chrome-flags="--headless" --output=json --output-path=/private/tmp/tvr-lighthouse.json`. Set `CHROME_PATH` to the executable returned by `chromium.executablePath()` from `playwright-core`. Run serial cold-load samples and compare their distribution; keep raw audit reports outside the repository.

The GitHub Actions workflow runs on Blacksmith, using a digest-pinned Playwright image with Chromium, WebKit, and their Linux dependencies already installed. It checks the source, full preview browser suite, public artifact, and dependency advisories before a separate job can advance the protected production branch. That job uses GitHub's short-lived repository token; no Cloudflare deployment credential is stored in GitHub. Cloudflare's existing GitHub App builds and publishes the validated production commit. Actions are pinned to immutable commits. See [CI and deployment](docs/ci-deployment.md) for branch rules, cutover, and recovery.

The November 7 dependency audit found no production-dependency advisories. Sharp's high-severity build-tool advisory was patched in 0.35.5. Lower-severity advisories remain in shadcn's CLI dependency chain: [deepmerge prototype poisoning](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) and [minimatch denial of service](https://github.com/advisories/GHSA-g3hv-75wg-m249). These tools are not served to visitors. Deepmerge has no patched release; minimatch's patch requires a major change outside ts-morph's declared range. Recheck upstream releases rather than forcing npm's proposed shadcn 1.0.0 downgrade or an unsupported transitive override.

The shadcn CLI supplied `src/components/ui/button.tsx`; the two contact sizes belong to that primitive. Contact CTAs are actual anchors styled with `buttonVariants`, following Base UI’s link guidance, rather than buttons with link destinations. Keep their native link behavior.

## Editing

| Concern                                                   | Source                            |
| --------------------------------------------------------- | --------------------------------- |
| Homepage and biography                                    | `src/components/HomePage.tsx`     |
| Service labels and semantic diagram content               | `src/components/Partnership.tsx`  |
| Shared page shell and focusable main landmark             | `src/components/SiteLayout.tsx`   |
| Header, footer, and contact controls                      | `src/components/SiteChrome.tsx`   |
| Identity, page metadata/dates, origin/indexing validation | `src/site-config.ts`              |
| Runtime page heads and structured data                    | `src/site.ts`                     |
| Theme, typography, layout, responsive rules               | `src/styles.css`                  |
| Diagram and atmosphere                                    | `public/assets/*.svg`             |
| Original brand mark                                       | `public/logo.svg`                 |
| Software collection and project links                     | `src/components/SoftwarePage.tsx` |
| Privacy content                                           | `src/components/PrivacyPage.tsx`  |
| Static artifact/crawler files/security headers            | `scripts/finalize-static.ts`      |
| Sharing image, search logo, and touch icon                | `scripts/render-social-card.ts`   |

The diagram’s labels are real HTML in one consistent reading order. Its SVG contains only decorative geometry and is hidden from assistive technology. Font-relative container queries let the diagram reflow into a service list on smaller screens and when visitors enlarge text. Shared LinkedIn and email controls appear in the header and footer; Software and Privacy sit beside the copyright. A container query changes the footer from a centered stack on phones to two columns as space permits. Email links leave subject and body blank. The closing narrative includes Tim's 20 years of experience and is framed by matching subtle rules. Theme and content remain owned by this site; no shared package or monorepo migration has been introduced.

The single self-hosted Geist Latin font is preloaded with the same Vite-generated URL used by CSS and anonymous CORS mode. The local preview disables Vite’s development CORS headers: their `Vary: Origin` behavior caused WebKit to download the preloaded same-origin font twice. Delivery checks verify one font request in both Chromium and WebKit, along with the prerendered organization/person relationships and opaque search-logo dimensions.

The environment-free `site-config.ts` supplies identity and page definitions to the frontend, Vite prerendering, and static finalization. Keep Vite runtime values in `site.ts`. When adding a route, retain TanStack’s file-route literal and add its metadata/output definition to `sitePages`; prerendered filenames and sitemap entries then follow that definition.

## Search and public identity

The public origin is `https://tvr.works`, and the contact is `tim@tvr.works`. Both values are centralized in the site configuration. The former `llc.tvr.works` hostname redirects to the public origin.

Ordinary local builds have `noindex, follow`, a disallowing `robots.txt`, and an empty sitemap. Cloudflare's production environment explicitly sets `VITE_SITE_INDEXING=public`, enabling indexing and the three-page sitemap; preview builds retain `preview`. Any Cloudflare branch other than `production` rejects public indexing. Production mode alone does not enable search indexing.

Pages contain full prerendered HTML and per-route titles, descriptions, canonical URLs, Open Graph/Twitter metadata, and self-hosted sharing artwork. The homepage includes Organization, Person, WebSite, and service-catalog structured data. Each indexable page owns an authored `lastModified` date in `sitePages`. Update only the page whose content changed. Privacy renders its date from that value with an explicit UTC timezone. Dates do not change automatically on every build. No fabricated address, reviews, ratings, availability, or pricing is used.

`npm run asset:social` exports the approved artwork in `docs/design/social-card-approved.png` as the 1200×630 opaque sRGB PNG at `/social-card-v2.png`, and regenerates the 180px Apple touch icon and opaque 512px search logo from `public/favicon.svg`. The organization’s structured data uses the dark-backed search logo so the white mark stays visible on white search surfaces. Your Person entry links to the organization with `worksFor`, and the organization links to its verified GitHub profile. The [approved source](docs/design/social-card-approved.png) and [built-in Image Gen prompt](docs/design/social-card-prompt.md) are retained under `docs/design/`; the export preserves this artwork.

Open Graph and X metadata use the versioned image URL and matching alt text defined in `src/site-config.ts`; Open Graph also declares the image dimensions and MIME type. Delivery checks inspect the raw prerendered tags and decode the served image to verify its dimensions and format. The original `/social-card.png` remains available for previously cached links. When changing the artwork again, version its URL to distinguish the new image from cached previews.

The site self-hosts Geist Variable and distributes its OFL notice in `public/licenses/`. Vite emits bundled-dependency notices into `dist/client/licenses/dependencies.md`; the generated shadcn source’s MIT notice is also included. Third-party code and fonts retain their own licenses. The diagram/atmosphere are small SVG assets, not a screenshot of the concept or a canvas/WebGL renderer.

## Hosting/privacy boundary

The build prerenders `/`, `/software`, `/privacy`, and `/404` into `dist/client`. That is the static artifact intended for Cloudflare Pages. The locally generated `dist/server` supports prerendering and is not needed to serve the finished site.

No advertising, visitor-analytics script, third-party embed, contact form, or tracking cookie is added by this source. TanStack Router uses session storage for functional scroll restoration. The preview applies a restrictive CSP with hashes for the generated inline scripts, plus referrer, content-type, and permissions headers.

The static finalizer adds Cloudflare's documented email-obfuscation exemptions around native mailto anchors. Hosted verification confirmed the links remain intact and React navigation works. Pages Web Analytics is not configured, the zone's Zaraz configuration has no tools, and no injected visitor-analytics script was observed at launch. If monitoring configuration changes, update the privacy disclosure and CSP for the actual beacon/endpoints. The current CSP permits only same-origin script/network resources.

The site is live at [tvr.works](https://tvr.works) on the existing `company-site` Pages project, connected to [tvr-works/company-site](https://github.com/tvr-works/company-site). The workflow validates pushes to `main` before promoting their commit to the protected `production` branch. Cloudflare watches that branch for automatic production deployments. Pull requests validate without publishing previews. See the [CI deployment runbook](docs/ci-deployment.md). See the [Cloudflare launch record](docs/cloudflare-launch.md) for deployment IDs, verified settings, domain routing, and rollback notes.
