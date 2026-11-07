# Cloudflare launch preparation

Inspected November 7, 2026. The new site remains local; publishing and DNS changes have not been authorized.

## Repository ownership

`company-site` was transferred from `tvanreenen` to [tvr-works/company-site](https://github.com/tvr-works/company-site). GitHub confirmed the same repository ID (`1079037433`), public visibility, and administrator access after the move. The local `origin` now uses `https://github.com/tvr-works/company-site.git`. No commits were pushed; GitHub's `main` remained at `5e72f33f5c6e67174138bb8cd284b9e2f5dfe436` when inspected before the transfer.

The organization's existing Cloudflare Workers and Pages GitHub App uses selected-repository access. Confirm that `company-site` is included without removing the existing selections. The CLI token could transfer the repository but could not administer that app installation; GitHub's browser settings require fresh identity verification.

## Existing hosting

The personal Cloudflare account, **Tim VanReenen**, owns the active `tvr.works` zone and the existing `company-site` Pages project. That project serves `company-site-8f1.pages.dev` and `llc.tvr.works`. Its last deployment is `45f241ce-80b9-42ef-ba03-661b6ad2d892`, from October 19, 2025. Production builds from `main` and preview builds are enabled, but the build command and output directory are still blank.

Immediately after the transfer, Pages still reported `tvanreenen` as the repository owner. A narrow Update Project request supplied the new owner and owner ID for the same repository ID; the response continued to report the old owner, with the same existing deployment. This did not verify a repaired connection. Confirm GitHub App access, then verify or repair the source connection before any push. Cloudflare's [troubleshooting documentation](https://developers.cloudflare.com/pages/configuration/git-integration/troubleshooting/) describes recreating a project when a transferred repository becomes inaccessible. The current API also exposes a Connect Git Repository operation, but reconnection has not been attempted while app access remains unverified. Preserve the existing deployment and custom domain while resolving the connection.

The apex currently has a proxied A record pointing at the placeholder `192.0.2.1`. An enabled redirect rule matches exactly `tvr.works` and returns a 301 to `https://tim.vanreenen.me/work`, preserving the query string. No zone Worker routes or legacy Page Rules were present.

## Build settings for a future release

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist/client` |
| Root directory | Repository root |
| Production `VITE_SITE_ORIGIN` | `https://tvr.works` |
| Production `VITE_SITE_INDEXING` | `public` only at public release |
| Preview `VITE_SITE_ORIGIN` | `https://tvr.works` |
| Preview `VITE_SITE_INDEXING` | `preview` |

Use the checked-in `.node-version`; [Pages supports this runtime pin](https://developers.cloudflare.com/pages/configuration/build-image/). Confirm the actual hosted build image/runtime and successful static output on the first deployment. Only `dist/client` should be uploaded; no server or Pages Functions are needed.

For hosted review before release, retain `preview` indexing in both environments. The `public` production setting enables the generated sitemap and crawler permissions. The source rejects public indexing on a non-main Cloudflare branch.

## Domain cutover after release approval

1. Verify the GitHub App access and Pages source connection, then save the build settings before pushing code. A push to `main` currently triggers production deployment to the existing `llc` hostname.
2. Build and verify the site on a hosted preview, including home/privacy/custom 404, static assets, CSP, contact links, mobile layout, and crawler metadata.
3. Associate `tvr.works` through **Pages → Custom domains**. Replace the conflicting apex placeholder A record with the Pages CNAME as part of this setup; DNS alone is insufficient. Wait for active domain/TLS status. See [Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
4. Disable the old exact-apex redirect at cutover. Verify the apex serves the new site over HTTPS, including `/privacy`, and enable public indexing only for the approved release.
5. Redirect `llc.tvr.works` to the apex, preserving paths and queries. Optionally add DNS and a redirect for `www.tvr.works`. Keep rules hostname-specific so product subdomains are unaffected.

Existing product CNAMEs, MX records, and TXT records do not need changes for this website. Email Routing is ready and an enabled forwarding rule exists for `tim@tvr.works`; message delivery itself has not been tested.

## Edge features to verify

Zone-wide email obfuscation is enabled, Rocket Loader is disabled, and HTTPS redirection is enabled. Before deployment, add the established Figure-style `email_off` exemptions around contact links or configure a hostname-scoped exception; verify React hydration and contact behavior on the deployed artifact. [Cloudflare documents both exemption mechanisms](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/).

Pages Web Analytics is not configured on this project. Enabling it later requires matching CSP permissions and privacy disclosures for the actual injected beacon and endpoints. No analytics configuration was changed during this investigation.
