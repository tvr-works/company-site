# Cloudflare launch record

Published and verified November 7, 2026 at [tvr.works](https://tvr.works). Latest release commit: `6a7473caa81751bd91af41f3b55859c7be568d42`. The initial launch commit was `0a7b039da05741a6e072117d73a4b1ba53ef72b9`.

## Repository ownership

`company-site` was transferred from `tvanreenen` to [tvr-works/company-site](https://github.com/tvr-works/company-site). GitHub confirmed the same repository ID (`1079037433`), public visibility, and administrator access after the move. The local `origin` uses `https://github.com/tvr-works/company-site.git`. The tested release was pushed to `codex/launch-tvr-works` for preview, then to `main` for production.

The organization's existing Cloudflare Workers and Pages GitHub App uses selected-repository access. After the user completed GitHub identity verification, a fresh browser navigation confirmed saved access to exactly `company-site`, `key-site`, and `figure-site`, with Save disabled. No app permission changes were needed in this verification step. The CLI token could transfer the repository but could not administer that app installation.

## Existing hosting

The personal Cloudflare account, **Tim VanReenen**, owns the active `tvr.works` zone and the existing `company-site` Pages project. Production deployment `e4bc11b3-05f2-4ade-bfb2-32b5a49e3a27` serves the current site, with `tvr.works` and `llc.tvr.works` both showing active domain validation and SSL. Earlier deployments, including the footer refinement `396dfd33-678d-4d8d-9d80-51118c09f939`, initial launch `a106f7ec-7274-4048-9c1f-72f41b11f3ab`, and original `45f241ce-80b9-42ef-ba03-661b6ad2d892`, remain in the project's history.

With explicit approval, the existing Pages project's Git source was disconnected and reconnected to `tvr-works/company-site`. Automatic production and preview builds were paused before disconnecting, remained paused while reconnecting, and were then restored to their previous settings: production deployments from `main`, all preview branches, and PR comments enabled. The project was reused; no replacement project was needed.

A fresh API readback after reconnection matched the pre-change snapshot except for the repository owner and owner ID. Project ID `a7ff68c8-81d7-4af2-aa12-a84a616a68e6` was preserved. Subsequent preview and production deployments verified Git cloning, dependency installation, and builds through the organization connection.

The apex record (`30e440d14779cc4ef176d45fcaf90843`) is now a proxied CNAME to `company-site-8f1.pages.dev`, replacing the placeholder A record `192.0.2.1`. The existing redirect rule (`fc6e73b1bc394d01a5b5f75c90e2961c`, ruleset `2894e9db52814ee188575f8f256e01ed`) now matches exactly `llc.tvr.works` and returns a 301 to `concat("https://tvr.works", http.request.uri.path)`, preserving query strings. The former apex-to-personal-work-page redirect is no longer active. No Worker route or legacy Page Rule was added.

## Build settings

| Setting                         | Value               |
| ------------------------------- | ------------------- |
| Production branch               | `main`              |
| Build command                   | `npm run build`     |
| Output directory                | `dist/client`       |
| Root directory                  | Repository root     |
| Production `VITE_SITE_ORIGIN`   | `https://tvr.works` |
| Production `VITE_SITE_INDEXING` | `public`            |
| Preview `VITE_SITE_ORIGIN`      | `https://tvr.works` |
| Preview `VITE_SITE_INDEXING`    | `preview`           |

Pages build image v3 detected Node `26.13.0` and npm `11.20.0`, matching the local pins. [Pages supports the checked-in runtime pin](https://developers.cloudflare.com/pages/configuration/build-image/). The build prerendered three pages, uploaded 22 static files from `dist/client`, parsed the security headers, and deployed no Functions or runtime server.

The `public` production setting enables the generated sitemap and crawler permissions. The source rejects public indexing on a non-main Cloudflare branch. For future review branches, retain `preview` indexing.

## Domain cutover

1. Saved build settings before pushing. The organization-connected GitHub integration built preview `0fbc2621-afe2-4cbe-a1ff-94195131b8d7`, verified before the production push.
2. Verified production deployment `a106f7ec-7274-4048-9c1f-72f41b11f3ab` on its Pages URL before cutover.
3. Associated `tvr.works` with the existing Pages project and changed the apex DNS record to the Pages CNAME. See [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
4. Changed the existing redirect from the old apex destination to an exact-host legacy `llc` redirect. Initial domain validation returned a transient 522/pending CNAME status; after validation completed, both the API and dashboard showed Active with SSL, and the live HTTP checks passed.
5. Verified `https://llc.tvr.works/privacy?source=launch` returns 301 to `https://tvr.works/privacy?source=launch`. No `www` record or redirect was added.

The final DNS readback retained all 16 record IDs; only the apex record was changed. Product CNAMEs and mail records were left in place. Email Routing is ready and an enabled forwarding rule exists for `tim@tvr.works`; message delivery itself has not been tested.

## Edge features

Zone-wide email obfuscation is enabled, Rocket Loader is disabled, and HTTPS redirection is enabled. The static finalizer adds Cloudflare's documented `email_off` exemptions around native mailto anchors in the delivered HTML. This keeps the React components unchanged and preserves readable, usable contact links without JavaScript. Hosted HTTP checks confirmed intact mailto links, no email-protection rewrite, no decoding script, and valid CSP hashes. Live client navigation completed without console warnings or errors. [Cloudflare documents the exemption](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/).

Pages Web Analytics is not configured on this project. The account's one automatically installed Web Analytics site belongs to a different zone; the `tvr.works` Zaraz configuration has no tools. No visitor-analytics injection was observed, and no analytics configuration was changed. Enabling it later requires matching CSP permissions and privacy disclosures for the actual beacon/endpoints.

## Verification and limits

Local checks passed `npm run check` and `npm run test:browser`: shadcn/Oxlint, TypeScript, four configuration tests, and all 18 Chromium/WebKit browser cases. The Browser plugin is not available in this session, so the existing Playwright workflow was used. Its prerender/preview servers required execution outside the filesystem sandbox to bind localhost; the sandboxed attempt failed before running browser tests. Coverage includes static content without JavaScript, contact semantics, client navigation/history, 320–1920px reflow, 200% text, reduced motion, and axe scans.

Preview, production Pages URL, and final apex HTTP checks passed for home/privacy 200 responses, a genuine custom 404, 11 directly referenced assets, native contact links, CSP hashes, canonicals, and crawler files. Production has `index, follow` and a two-page sitemap; preview has `noindex, follow`, a disallowing robots file, and an empty sitemap. The live in-app browser verified home → Privacy → home, correct titles, no app errors/overlays, and no desktop overflow at its actual 1280px viewport. The browser viewport override did not resize this tab, so hosted mobile is not claimed; local Chromium/WebKit responsive checks passed. Physical devices, manual screen-reader use, Firefox, and field performance remain untested.

The browser initially retained the old permanent redirect for the bare apex and tried to open the personal site; automatic review blocked that unrelated origin. The fresh `https://tvr.works/?launch=0a7b039` URL rendered the company site normally, while direct HTTP checks independently confirmed the bare apex returns 200. A browser retaining the former 301 may need its cached redirect cleared or a fresh URL/private window.

HTTP evidence and screenshots were saved outside the repository under `/private/tmp/tvr-*`. The production build/deployment IDs above remain the durable release references.

## Narrative and footer refinement

With approval to proceed on all three refinements, commit `276d132` added the 20-year introduction, removed the email subject query, and mirrored the compact header contact controls in the footer. Privacy now sits beside the copyright. The shared contact navigation has distinct Header contact/Footer contact labels and uses the same button variant; mobile footer groups stack without changing their touch targets.

`npm run check` and all 18 Chromium/WebKit cases passed. Additional inspection at 1440px, 390px, and 320px with 200% text confirmed matching header/footer button geometry, no horizontal overflow, and working footer Privacy navigation. WebKit's screenshot operation itself emitted a CSP stylesheet warning; staged probes isolated it to screenshot capture, with no application load/navigation warnings or errors. No CSP relaxation was introduced.

Preview `691a7a1d-39c8-41d3-a727-06425b7fc85e` passed HTTP artifact checks before promotion. Production `396dfd33-678d-4d8d-9d80-51118c09f939` then passed the same checks at the apex: the new copy, three bare mailto contact CTAs on home, two LinkedIn links, footer navigation on every page, home/privacy 200, custom 404, assets, public crawler files, and CSP hashes. The live in-app browser verified home → footer Privacy → home with no console warnings/errors and captured the updated narrative/footer at `/private/tmp/tvr-refined-live-footer.png`. Local desktop/mobile/enlarged-text captures are `/private/tmp/tvr-footer-*.png`; HTTP reports are `/private/tmp/tvr-refinement-*-http.json`. No DNS or monitoring configuration changed for this release.

## Final narrative release

After local copy review, the user explicitly requested shipping the final three-paragraph narrative. Commit `6a7473c` keeps the 20-year introduction, welcomes founders and business owners who need a new or better system, and closes on business understanding, engineering responsibility, and a direct relationship for the reader's own project or their client's project. The technical-platform sentences were removed from this narrative during the approved revision.

The build, shadcn/Oxlint, TypeScript, and all 18 Chromium/WebKit cases passed. Production deployment `e4bc11b3-05f2-4ade-bfb2-32b5a49e3a27` completed successfully without Functions. Live HTTP probes verified the exact final wording, home/privacy 200, missing-page 404, 11 assets, bare mailto links, CSP hashes, canonicals, public robots, and sitemap. Desktop Chromium at 1440px and mobile WebKit at 390px verified exact paragraph text, no horizontal overflow or console/runtime errors, and home → Privacy → home navigation. Local browser use is disabled in Work settings; the existing headless test tooling was used. Evidence is saved at `/private/tmp/tvr-final-narrative-live.png` and `/private/tmp/tvr-final-narrative-live-http.json`. No DNS or monitoring settings changed.

## Rollback notes

Pages retains the previous production deployment in history. Rolling back would restore its old content, not the current DNS or redirect settings; assess those separately. Before launch, the apex was a proxied A record to `192.0.2.1` and the exact-apex 301 targeted `https://tim.vanreenen.me/work`. Do not restore that placeholder record without also restoring appropriate routing. No rollback was performed.
