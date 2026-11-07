# TVR Works design and implementation QA

final result: passed

## Initial build visual truth and evidence

- Approved source: `docs/design/approved-concept.png`, 1023 × 1538 pixels.
- Local implementation: `http://127.0.0.1:4173/`, static production preview.
- Final comparison viewport: 1023 × 900 CSS pixels, density 1; implementation full-page capture 1023 × 1668 pixels. No scaling or density normalization was applied to either side.
- Full-view evidence: `docs/design/qa/comparison.png` shows the source on the left and implementation on the right, aligned at the top at identical width.
- Focused evidence: `docs/design/qa/diagram-comparison.png` and `docs/design/qa/closing-comparison.png`. Both are crops of that same aligned comparison, not independently rescaled substitutes.
- Additional inspected states: 390 × 844 mobile (`mobile.png`), 768 × 1024 tablet (`tablet.png`), 1440 × 900 desktop (`wide.png`), Privacy navigation and return, and the final default-size local preview (`preview.png`).
- State: English, dark theme, loaded self-hosted Geist font, no active hover/modal, all images loaded. Final in-app browser inspection found no horizontal overflow or app console warnings/errors. Temporary viewport overrides were reset before handoff.

## Comparison history and fixes

1. Initial rendered comparison (`/private/tmp/tvr-works-qa/compare-initial.png`): [P1] contact text inherited white over white button backgrounds. Fixed the unlayered global anchor color rule so semantic Tailwind foreground utilities apply. Final contact links have readable dark text, native anchor semantics, focus treatment, and passing contrast scans.
2. Initial comparison: [P2] hero started too low, headline/body sizes were too small, diagram hub was undersized, and biography density differed materially. Adjusted header/hero spacing, type scale, reading width, circle geometry, and section proportions. Compared the revised and final renders against the source; the large headline, four service branches, central partnership, and editorial close now retain the selected hierarchy.
3. Mobile visual inspection: [P2] the hero stranded “it.” on its own line. Balanced the phrase in an inline-block and retained readable mobile typography. Final mobile capture has a deliberate three-line headline.
4. Browser tests: [P2] 200% text caused contact-button overflow at 320px, then the desktop layout overflowed at 1023px. Bounded contact sizing and used font-relative container queries so enlarged text triggers the readable service-list layout. Both engines now pass 200% text at 320, 640, and 1023px.
5. Secondary atmosphere exploration: compared before/after lighting at identical viewport and preserved the restrained improvement. The SVG is 810 bytes, static, and uses no filters or animation. Final contrast scans still pass.

## Five fidelity surfaces

- **Typography:** self-hosted Geist Variable follows the existing Figure/Key font convention. Display text is large and tightly set; body copy and service captions remain actual HTML. It preserves the approved hierarchy while accepting small glyph/antialiasing differences from the generated reference. No truncated service copy or orphaned final hero word remains.
- **Spacing/layout:** header, centered hero, four branches, circular hub, and two-column close match the selected structure. The additional small copyright/Privacy footer was explicitly requested after the mock was approved; this and practical text metrics explain the longer rendered page. It is an intentional content change, not an accidental extra section. Tablet/mobile use the same service content in a readable grid/list.
- **Colors/tokens:** shared semantic tokens own background, foreground, muted copy, cyan links, borders, and focus. The restrained glow remains behind content. Both browsers’ axe scans report no contrast violations.
- **Asset quality:** the supplied TVR path is preserved in the cropped transparent monogram. The user explicitly authorized SVG graphics; the responsive diagram is vector geometry with separate semantic HTML labels. This avoids rasterized text and keeps the artwork sharp. Font, logo, SVG graphics, touch icon, and 1200 × 630 social image load correctly. Social artwork was separately opened and inspected.
- **Copy/content:** approved headline, four offerings, “Put AI to work / Insight, action & automation,” center label, collaborative biography, broad platform wording, and direct contact are retained. No client/employer names, fabricated proof, unsupported availability, or pricing appear. Privacy and 404 use the same visual language.

## Functional and accessibility verification

The flow under test was homepage → contact links and Privacy → return/history, with direct/static loads of homepage, Privacy, and missing URLs.

- `npm run check`: Oxlint with shadcn/JSX accessibility rules, TypeScript, route generation, and all 4 configuration/indexing tests passed.
- `npm run test:browser`: all 18 Chromium/WebKit checks passed after the final content and atmosphere changes. Includes 6 axe route scans with zero violations, skip-link focus/activation, native link semantics, navigation/history/metadata, no-JavaScript content, 404 response, image availability, preview crawler controls, reduced motion, and responsive checks.
- Normal-width reflow checks: 320, 390, 540, 768, 800, 801, 1023, 1440, and 1920px. Enlarged-text checks: 200% at 320, 640, and 1023px. WebKit link navigation uses Option+Tab; Enter activates the skip link and focuses main content.
- Primary interactions were also exercised in the in-app browser: Privacy navigation, return to homepage, correct route title/content, loaded imagery/font, and clean console. Email links were inspected, not used to send mail.
- Real static HTML contains page content and per-route metadata without JavaScript. An isolated local public build verified indexable metadata, the two-entry sitemap, and `https://llc.tvr.works` canonical identity; default `https://tvr.works` non-indexable output was then restored. The 404 stays non-indexable.
- The local production preview applies generated static security headers, including hashes for inline framework/JSON-LD scripts. No external analytics or embeds are added by the source.
- A packaging-only follow-up build also passed after enabling bundled-dependency notices and including the font/shadcn licenses; it made no layout or content changes.

## User review refinement

- Updated the public email centrally to `tim@tvr.works`, including contact links, Privacy, and structured data. Updated the browser assertion to the confirmed address.
- Increased the desktop CTA-to-diagram margin from 12px to 44px. Mobile retains its already generous spacing.
- The base body font remains 16px. Reduced the desktop homepage lead and narrative maximum from 30px to 26px, with slightly more line height; mobile body remains 18px. Service captions now cap at 22px.
- Consolidated the closing narrative into three complete first-person paragraphs. Removed the detached platform fragment, the separate muted engagement label, and its unused CSS rule.
- Review evidence: `docs/design/qa/review-comparison.png` places the approved 1023px source beside the updated 1023 × 1620px render. The smaller supporting type, increased diagram gap, and updated narrative are explicit user-requested amendments. No new P0/P1/P2 issues were found. `review-desktop.png`, `review-mobile.png` (390px), and `review-preview.png` record the current result. Temporary selection/focus states were cleared for the desktop capture.
- Re-ran `npm run check` and `npm run test:browser`: lint, TypeScript, all 4 configuration tests, the production build, and all 18 Chromium/WebKit checks passed. Final browser inspection confirmed 26px desktop lead/narrative, 44px diagram margin, the new email destination, and no app warnings/errors. Viewport overrides were reset and the local preview remains available.

## Open decisions and limits

- Public hostname remains configurable between `tvr.works` and `llc.tvr.works`. The confirmed contact address is `tim@tvr.works`.
- No physical-device or manual screen-reader audit was performed. Automated scans and engine tests are evidence for the tested states, not a blanket accessibility-conformance claim. Firefox and real network/field performance were not measured.
- No push, deployment, DNS, Cloudflare monitoring change, or public indexing change occurred. Cloudflare-injected monitoring/CSP/privacy must be reconciled against actual settings before future publication.
- Further atmospheric art direction is optional; no unresolved P0/P1/P2 design findings remain.

## Implementation checklist

- [x] Faithful services-first desktop composition and original logo.
- [x] Readable tablet/mobile layouts and enlarged-text reflow.
- [x] Working contact, Privacy, history, and missing-page behavior.
- [x] Static SEO/sharing metadata, crawler controls, and configurable identity.
- [x] Local verification and visual comparison; preview left running for review.
