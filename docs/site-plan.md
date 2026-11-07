# TVR Works site

## Approved direction

- Visual target: `docs/design/approved-concept.png`.
- Preserve the TVR monogram with only “Works” beside it.
- One marketing page, a short Privacy page, and a useful 404.
- Four services around “One direct partnership”: create something new, modernize what exists, put AI to work, and get technical direction.
- Keep client and employer names out of the public site.
- Keep direct contact personal. No invented availability, results, credentials, testimonials, pricing, or office address.
- Header: brand, LinkedIn, and email CTA. Keep the closing narrative free of contact links. Footer: copyright/company identity and Privacy, separated by the same subtle rule that frames the narrative above.
- End the narrative with an explicit invitation to founders with new ideas and business owners with systems to improve. Keep the original hero lead focused on the work. Welcome established businesses without an industry restriction or unsupported price/affordability claim.
- Diagram subtitles use a readable muted blue semantic theme token, distinct from the white service headings.

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
- Public hostname remains under consideration; contact email is confirmed as `tim@tvr.works`. Cloudflare dashboard-injected monitoring must be checked before publication; the source configuration alone cannot establish live practices.

## Secondary visual exploration

- Explore a little more of the approved concept’s glowing, ethereal background lighting, after core correctness and responsive/accessibility checks. Prefer tuning the existing tiny SVG atmosphere. No animation, WebGL, heavy artwork, or complicated rendering machinery. Keep only if it improves the composition without hurting readability or performance.
- Future repository context: the user may later consider a multi-site monorepo. Keep theme/content/graphics owned by this site and align tooling conventions with Figure/Key. Do not migrate repositories or introduce speculative shared packages here.
- Exploration outcome: kept a restrained three-ellipse glow in `public/assets/atmosphere.svg` (810 bytes). It uses no filters, animation, script, or rendering dependency. The main layout and all content stay unchanged. Further art direction remains optional user feedback, not unfinished core work.
