# CI and production deployment

`.github/workflows/ci.yml` owns validation and deployment. Both jobs use the Blacksmith `blacksmith-4vcpu-ubuntu-2404` runner. Pull requests validate without deployment credentials. Production publication runs only for `main`, after the validation job succeeds.

## Validation and browser setup

The validation job runs in Microsoft's Playwright 1.64.1 Noble image, pinned by manifest digest. Chromium, WebKit, and their Linux dependencies are already installed. The image and the installed `@playwright/test` version must match; an early compatibility check fails when they diverge. Update the image tag, digest, and compatibility check when upgrading Playwright.

Node follows `.node-version`; dependencies follow `package-lock.json`. GitHub's setup-node action caches npm downloads using Blacksmith's runner infrastructure. There is no separate browser-install or apt step, and no browser-binary cache to maintain.

Validation includes formatting, typed shadcn/Oxlint, TypeScript, unit tests, high/critical dependency auditing, the full preview browser suite, and a separate public indexing/delivery suite. Both builds enforce the client asset budgets. CI rejects focused tests. Failed browser runs retain HTML reports, screenshots, and traces for seven days.

## Tested artifact publication

After the public-artifact checks pass, the validation job uploads only `dist/client`. The deployment job downloads that immutable artifact by the ID emitted by validation. It does not rebuild the site. This also allows a failed deployment job to be retried while its artifact is retained.

Manual validation runs on migration branches also retain the tested artifact for inspection. The deployment job remains restricted to main. PR validation does not retain a deployable artifact.

The deployment job uses the `production` GitHub environment, which must allow only the `main` branch. `CLOUDFLARE_API_TOKEN` belongs in that environment, not in repository-wide secrets. The token needs only Cloudflare Pages Edit on the personal account that owns `company-site`; Cloudflare scopes this permission to the account, so it can affect other Pages projects in that account. It needs no DNS, Workers, or account-administration permissions.

The pinned Cloudflare deployment action uses Wrangler only to upload the prebuilt Pages artifact to the existing project. The `cf` CLI's current deployment command targets Workers; its Pages API command accepts manifests but does not upload a directory of assets. No Wrangler configuration or runtime server is introduced here.

The workflow serializes main releases and cancels superseded PR checks. Before publishing, it rejects a revision that is no longer the current main commit. After publication, `scripts/verify-deployment.ts` checks the immutable deployment URL and public domain for page statuses, canonical URLs, indexing, native contact links, security headers, sitemap entries, and a real 404. Transient edge propagation gets three bounded attempts.

## Cloudflare cutover

The CI gate is effective only when Cloudflare's independent Git deployment triggers are disabled. Preserve the existing project, Git connection, production branch, domains, and DNS. Disable automatic production deployments and set preview branch deployments to None. PRs then run validation without publishing Cloudflare previews.

Before changing those settings, establish the production environment credential, validate the replacement on Blacksmith, and retain the current Pages deployment as the rollback target. Apply the trigger change immediately before releasing the new workflow on main. Read back the settings, verify a successful gated production release, and confirm that the deployed commit matches the passing workflow.

For a deployment failure after validation succeeds, fix the cause and rerun the failed deployment job within seven days. If the artifact expired or main advanced, run the entire workflow for current main instead. A content rollback should go through a revert commit and the same checks. Emergency Pages rollback is available through Cloudflare; record any manual bypass and reconcile main afterward.

## References

The first migration-branch validation on November 9, 2026 passed on Blacksmith in 1 minute 13 seconds. Browser-container initialization took 17 seconds. The preceding GitHub-hosted validation took 7 minutes 36 seconds, including 6 minutes 26 seconds installing browser dependencies. These are individual observed runs, not a runtime guarantee. [Migration validation](https://github.com/tvr-works/company-site/actions/runs/42633100122).

- [Playwright CI containers](https://playwright.dev/docs/ci)
- [Playwright Docker image and version compatibility](https://playwright.dev/docs/docker)
- [GitHub deployment environments and concurrency](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments)
- [Direct uploads to an existing Git-integrated Pages project](https://developers.cloudflare.com/pages/configuration/git-integration/#disable-automatic-deployments)
- [Cloudflare Pages uploads from CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
