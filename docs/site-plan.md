# TVR Works site

## Approved direction

- Visual target: `docs/design/approved-concept.png`.
- Preserve the TVR monogram with only “Works” beside it.
- One marketing page, a short Privacy page, and a useful 404.
- Four services around “One direct partnership”: create something new, modernize what exists, put AI to work, and get technical direction.
- Keep client and employer names out of the public site.
- Keep direct contact personal. No invented availability, results, credentials, testimonials, pricing, or office address.
- Footer: copyright/company identity and Privacy. Email and LinkedIn belong in the closing section.

## Implementation

- React, TypeScript, Base UI/shadcn, Tailwind; Oxlint with `@shadcn/lint`.
- Use Figure’s TanStack Start/Router static-prerender pattern for full HTML, typed client navigation, metadata, and clean privacy/404 routes. Key’s smaller Vite/React prerender pattern was also considered; Start avoids a second custom routing and page-head mechanism and matches Figure’s established setup.
- Output static files for Cloudflare Pages. No server features or external visitor analytics are needed for the initial site.
- Build the approved diagram as SVG geometry with real HTML headings/text. The user explicitly authorized SVG graphics. Keep decoration out of the accessibility tree; reflow the same service content for small screens.
- Self-host the font. No tracking cookies, third-party embeds, contact form, or browser telemetry added by this implementation.
- Keep local/preview builds non-indexable. Prepare canonical metadata, sharing artwork, structured data, sitemap, and an explicit public-build setting.

## Verification and boundaries

- Check keyboard/focus behavior, headings/landmarks, contrast, reduced motion, reflow, no-JavaScript content, clean URLs/404s, metadata, and local production behavior.
- Compare the rendered desktop page against the approved concept and inspect mobile/tablet layouts.
- Use incremental local commits. Do not push, deploy, or change Cloudflare settings.
- Final public domain/contact email are being confirmed. Cloudflare dashboard-injected monitoring must be checked before publication; the source configuration alone cannot establish live practices.

## Secondary visual exploration

- Explore a little more of the approved concept’s glowing, ethereal background lighting, after core correctness and responsive/accessibility checks. Prefer tuning the existing tiny SVG atmosphere. No animation, WebGL, heavy artwork, or complicated rendering machinery. Keep only if it improves the composition without hurting readability or performance.
- Future repository context: the user may later consider a multi-site monorepo. Keep theme/content/graphics owned by this site and align tooling conventions with Figure/Key. Do not migrate repositories or introduce speculative shared packages here.
