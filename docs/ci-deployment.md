# CI and Cloudflare deployment

The branch model is conventional: main publishes production, and other repository branches publish previews. Cloudflare's existing GitHub App remains the publisher. No Cloudflare API token, deploy hook, personal access token, or stored deployment secret is required in GitHub.

## Validation and browser setup

`.github/workflows/ci.yml` runs on pushes to every branch and on pull requests. Push runs validate the exact branch commit Cloudflare builds; PR runs also check merge integration. The workflow has read-only repository permissions.

Validation runs on Blacksmith's `blacksmith-4vcpu-ubuntu-2404` runner inside Microsoft's Playwright 1.64.1 Noble image, pinned by manifest digest. Chromium, WebKit, and their Linux dependencies are already installed. The image and installed `@playwright/test` version must match; an early compatibility check rejects mismatches. Update the image tag, digest, and compatibility check together when upgrading Playwright.

Node follows `.node-version`; dependencies follow `package-lock.json`. GitHub's setup-node action caches npm downloads. There is no browser-install or apt step and no browser-binary cache to maintain.

Validation includes formatting, typed shadcn/Oxlint, TypeScript, unit tests, high/critical dependency auditing, the full preview browser suite, and the public indexing/delivery suite. Both builds enforce client asset budgets. CI rejects focused tests. Failed browser runs retain HTML reports, screenshots, and traces for seven days. Non-PR runs also retain the tested public artifact for inspection.

Superseded runs are canceled per branch or PR. A canceled run cannot authorize a Cloudflare deployment.

## Publication gate

The Pages project's build command is:

```sh
npm run ci:gate && npm run build
```

`scripts/wait-for-ci.ts` reads Cloudflare's `CF_PAGES_COMMIT_SHA` and `CF_PAGES_BRANCH`. It queries this public repository's GitHub Actions API without credentials and accepts only a successful push-triggered run of `ci.yml` matching both the exact SHA and branch. It never substitutes the latest main result, a different branch, or a manually dispatched run. When more than one matching run is returned, the highest workflow run number and rerun attempt wins; an older success cannot mask a newer failure or active run. Contract tests cover these boundaries, API failures, invalid context, and deadline behavior.

Cloudflare can start a build while CI is running, but the gate must pass before the application build and publication proceed. Failed, canceled, or skipped CI stops publication. Missing context, unreadable GitHub status, rate limiting, invalid responses, and a sixteen-minute timeout also block publication. Retry the Cloudflare build after resolving the cause or after a successful CI rerun; the gate never falls back to publishing unchecked code.

The validation job has a twelve-minute execution limit; the gate allows sixteen minutes including CI queue time, leaving headroom for the application build within Pages' twenty-minute build limit. Polling backs off after 15 and 30 seconds to a 60-second interval, with each request capped at fifteen seconds and the remaining deadline. A prolonged queue can still exhaust the gate; retry after CI succeeds.

The API is readable without a token because the repository is public. If repository visibility changes, reassess the integration before changing that assumption. Public API rate limits remain an availability constraint; a rate-limited check fails closed with a diagnostic.

Cloudflare rebuilds the validated source commit using its pinned Node version, npm lockfile, and normal build checks. The CI artifact is retained for comparison. GitHub does not receive Cloudflare account-write authority.

## Cloudflare configuration

Preserve the existing project, Git connection, domains, and DNS. Set its production branch to main, keep automatic production deployments enabled, and keep preview deployments enabled for non-production branches. Production builds use `VITE_SITE_INDEXING=public`; preview builds retain `preview`. Only the Cloudflare main branch can opt into public indexing.

Feature branches must include this workflow and gate script from main; rebase branches created before the migration. Otherwise a missing gate or absent push validation blocks their preview publication.

## Verification and recovery

After publication, an operational smoke check is available:

```sh
DEPLOYMENT_URL=https://DEPLOYMENT_ID.company-site-8f1.pages.dev \
EXPECTED_COMMIT_SHA=40_CHARACTER_RELEASE_SHA \
DEPLOYMENT_MODE=production node scripts/verify-deployment.ts
```

Replace the deployment ID and expected SHA with the intended release. The build writes `build-info.json` from the Cloudflare or GitHub commit context; verification rejects an older healthy deployment. Local builds without commit context use `null` and cannot masquerade as an identified release.

The script checks the immutable deployment URL and public domain for commit identity, page statuses, actual canonical metadata, HTML and edge indexing, native contact links, security headers, robots, exact sitemap entries, and a real non-indexable 404, with three bounded attempts for edge propagation.

Use `DEPLOYMENT_MODE=preview` for previews. That mode checks only the supplied origin, requires HTML and edge `noindex`, blocked robots, an empty sitemap, and preview build identity. Production mode requires public HTML/build identity, but immutable hash Pages hostnames must still have Cloudflare’s edge `noindex`; the custom production domain must remain indexable. Production mode checks the apex by default; `CHECK_PRODUCTION_ALIAS=0` verifies an immutable production build before checking its alias. Preview mode cannot opt into checking the production alias. Contract tests cover stale commits, wrong canonicals, edge indexing mistakes, leaking preview sitemaps, and soft 404s.

A failed CI run leaves the previous successful production site in place. A later successful CI rerun does not automatically retry a failed Cloudflare build; retry it in Pages. Cloudflare's native `Cloudflare Pages` check reports publication separately from CI. Roll back content with a revert commit through the same gate. Emergency Pages rollback remains available; record the manual action and reconcile main afterward.

The first Blacksmith migration-branch validation on November 9, 2026 took 1 minute 13 seconds, with browser-container initialization taking 17 seconds. A later warm run took 43 seconds. The preceding GitHub-hosted run took 7 minutes 36 seconds, including 6 minutes 26 seconds installing browser dependencies. These are observed samples, not runtime guarantees. [First migration validation](https://github.com/tvr-works/company-site/actions/runs/42633100122).

## Migration record — November 9, 2026

[Main validation](https://github.com/tvr-works/company-site/actions/runs/42640233742) passed before the hosting cutover. A fresh Cloudflare readback confirmed production branch `main` in both project and source configuration, automatic production deployments enabled, all preview branches enabled, and build command `npm run ci:gate && npm run build`. The existing project ID, domains, repository connection, and indexing environments were preserved.

The first gated production publication used commit `6dfb69ad59cc214e13cab94bd9468fdebe2e6968` and deployment `743eccd1-d79d-431e-98b8-f451fda3cac3`. Cloudflare logs showed the gate waiting for [push CI](https://github.com/tvr-works/company-site/actions/runs/42640578219), then accepting its success before starting the application build. Validation took 48 seconds. HTTP smoke checks passed against both the immutable deployment URL and `https://tvr.works`.

A disposable preview branch then added an intentionally failing unit test. [Its CI run](https://github.com/tvr-works/company-site/actions/runs/42640622712) failed, and Cloudflare deployment `abc048f7-a7ac-46c6-9a38-c52d005a4657` stopped at the gate with `CI run 42640622712 concluded failure; refusing deployment.` The application build and deployment stage never started. The failing test was removed on that branch and was never merged into main.

The temporary release-branch approach was removed: no separate `production` branch, associated ruleset, GitHub deployment environment, promotion job, or stored Cloudflare credential remains. Cloudflare's existing GitHub App owns publication; Actions owns validation.

## References

- [Playwright CI containers](https://playwright.dev/docs/ci)
- [Playwright Docker image and version compatibility](https://playwright.dev/docs/docker)
- [GitHub workflow-run API](https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow)
- [Cloudflare production and preview branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Cloudflare build configuration and environment variables](https://developers.cloudflare.com/pages/configuration/build-configuration/)

## Observed retry recovery

On November 9, the first production build of `9f2f8de53cc1e4c91a0c9e471bc90e269171406d` stopped at an anonymous GitHub API denial/rate limit despite successful push CI. The previous site remained live. Retrying that same deployment through Pages succeeded as `1d237f88-998f-4d72-a55f-8fc9c1d1ca7b`, accepting the exact successful CI run before publication. No credential or unchecked-publication fallback was used. This is an observed availability constraint, not just a theoretical limit.
