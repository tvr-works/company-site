# CI and production deployment

`.github/workflows/ci.yml` owns validation and release promotion. Both jobs use the Blacksmith `blacksmith-4vcpu-ubuntu-2404` runner. Cloudflare's existing GitHub App remains the publisher. No Cloudflare API token, deploy hook, or personal access token is stored in GitHub.

## Validation and browser setup

The validation job runs in Microsoft's Playwright 1.64.1 Noble image, pinned by manifest digest. Chromium, WebKit, and their Linux dependencies are already installed. The image and the installed `@playwright/test` version must match; an early compatibility check fails when they diverge. Update the image tag, digest, and compatibility check when upgrading Playwright.

Node follows `.node-version`; dependencies follow `package-lock.json`. GitHub's setup-node action caches npm downloads. There is no separate browser-install or apt step, and no browser-binary cache to maintain.

Validation includes formatting, typed shadcn/Oxlint, TypeScript, unit tests, high/critical dependency auditing, the full preview browser suite, and a separate public indexing/delivery suite. Both builds enforce the client asset budgets. CI rejects focused tests. Failed browser runs retain HTML reports, screenshots, and traces for seven days. Non-PR runs also retain the tested public artifact for inspection.

## Protected production branch

Development and integration happen on main. After `validate` succeeds, the promotion job advances the `production` branch to that exact commit. It uses GitHub's automatically generated, short-lived `GITHUB_TOKEN` with repository contents-write permission only in this job. Validation retains read-only access. There is no stored deployment credential.

The production GitHub environment permits the promotion job only from main. `scripts/promote-production.ts` also checks that main still points to the tested commit and refuses superseded revisions. Updates are fast-forward only. The workflow serializes main releases and cancels superseded PR checks.

An active repository ruleset covers `refs/heads/production`. It requires a successful `validate` check from the GitHub Actions integration (15368), including branch creation, and prevents force-pushes and deletion. There are no bypass actors. This rule independently enforces the check before the release branch can advance.

Cloudflare Pages watches `production` as its production branch, with automatic production deployments enabled and preview branch deployments set to None. Updating main therefore starts CI without publishing a website. Only advancing the checked production branch triggers publication. The site's public-indexing guard accepts the production branch; other Cloudflare branches cannot opt into public indexing.

Cloudflare rebuilds the validated source commit using its existing pinned Node version, npm lockfile, build command, and build-time checks. This differs from direct artifact upload: the source commit is gated, while Cloudflare owns the final build. It avoids giving GitHub account-wide Pages Edit authority. The archived CI artifact remains available for comparison.

## Cutover and recovery

Validate the replacement on Blacksmith before changing Cloudflare's branch controls. Create and verify the production ruleset, including a rejected attempt to promote an unchecked commit. Bootstrap production from a commit whose validation already passed. Then change the existing Pages project's production branch to production and disable automatic previews, preserving its project ID, Git connection, domains, and DNS.

Integrate the workflow on main and verify an automatic promotion, a Cloudflare build of that same commit, and the live site. Cloudflare's native `Cloudflare Pages` check reports publication separately from the GitHub validation/promotion workflow.

For an operational smoke check after publication, run:

```sh
DEPLOYMENT_URL=https://DEPLOYMENT_ID.company-site-8f1.pages.dev node scripts/verify-deployment.ts
```

The script verifies the immutable deployment URL and public domain for page statuses, canonical URLs, indexing, native contact links, security headers, sitemap entries, and a real 404. Transient edge propagation gets three bounded attempts.

If promotion fails because main advanced, run the workflow for current main. If Cloudflare's build fails after promotion, the previous successful site remains live; inspect its native check and deployment logs, then retry that build or ship a fix through main. Roll back content with a revert commit and the same gate. Emergency Pages rollback remains available through Cloudflare; record the manual action and reconcile main afterward.

## Verification evidence

The first migration-branch validation on November 9, 2026 passed on Blacksmith in 1 minute 13 seconds. Browser-container initialization took 17 seconds. The preceding GitHub-hosted validation took 7 minutes 36 seconds, including 6 minutes 26 seconds installing browser dependencies. These are individual observed runs, not a runtime guarantee. [Migration validation](https://github.com/tvr-works/company-site/actions/runs/42633100122).

## References

- [Playwright CI containers](https://playwright.dev/docs/ci)
- [Playwright Docker image and version compatibility](https://playwright.dev/docs/docker)
- [GitHub's automatic workflow token](https://docs.github.com/en/actions/concepts/security/github_token)
- [GitHub deployment environments and concurrency](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)
- [Cloudflare production branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
