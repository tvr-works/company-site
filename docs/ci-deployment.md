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

`scripts/wait-for-ci.ts` reads Cloudflare's `CF_PAGES_COMMIT_SHA` and `CF_PAGES_BRANCH`. It queries this public repository's GitHub Actions API without credentials and accepts only a successful push-triggered run of `ci.yml` matching both the exact SHA and branch. It never substitutes the latest main result, a different branch, or a manually dispatched run.

Cloudflare can start a build while CI is running, but the gate must pass before the application build and publication proceed. Failed, canceled, or skipped CI stops publication. Missing context, unreadable GitHub status, rate limiting, invalid responses, and an eight-minute timeout also block publication. Retry the Cloudflare build after resolving the cause or after a successful CI rerun; the gate never falls back to publishing unchecked code.

The API is readable without a token because the repository is public. If repository visibility changes, reassess the integration before changing that assumption. Public API rate limits remain an availability constraint; a rate-limited check fails closed with a diagnostic.

Cloudflare rebuilds the validated source commit using its pinned Node version, npm lockfile, and normal build checks. The CI artifact is retained for comparison. GitHub does not receive Cloudflare account-write authority.

## Cloudflare configuration

Preserve the existing project, Git connection, domains, and DNS. Set its production branch to main, keep automatic production deployments enabled, and keep preview deployments enabled for non-production branches. Production builds use `VITE_SITE_INDEXING=public`; preview builds retain `preview`. Only the Cloudflare main branch can opt into public indexing.

Feature branches must include this workflow and gate script from main; rebase branches created before the migration. Otherwise a missing gate or absent push validation blocks their preview publication.

## Verification and recovery

After publication, an operational smoke check is available:

```sh
DEPLOYMENT_URL=https://DEPLOYMENT_ID.company-site-8f1.pages.dev node scripts/verify-deployment.ts
```

The script checks the immutable deployment URL and public domain for page statuses, canonical URLs, indexing, native contact links, security headers, sitemap entries, and a real 404, with three bounded attempts for edge propagation.

A failed CI run leaves the previous successful production site in place. A later successful CI rerun does not automatically retry a failed Cloudflare build; retry it in Pages. Cloudflare's native `Cloudflare Pages` check reports publication separately from CI. Roll back content with a revert commit through the same gate. Emergency Pages rollback remains available; record the manual action and reconcile main afterward.

The first Blacksmith migration-branch validation on November 9, 2026 took 1 minute 13 seconds, with browser-container initialization taking 17 seconds. A later warm run took 43 seconds. The preceding GitHub-hosted run took 7 minutes 36 seconds, including 6 minutes 26 seconds installing browser dependencies. These are observed samples, not runtime guarantees. [First migration validation](https://github.com/tvr-works/company-site/actions/runs/42633100122).

## References

- [Playwright CI containers](https://playwright.dev/docs/ci)
- [Playwright Docker image and version compatibility](https://playwright.dev/docs/docker)
- [GitHub workflow-run API](https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow)
- [Cloudflare production and preview branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [Cloudflare build configuration and environment variables](https://developers.cloudflare.com/pages/configuration/build-configuration/)
