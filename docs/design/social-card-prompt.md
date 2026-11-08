# Approved social card

Approved November 8, 2026. Generated with the built-in `image_gen` tool. The final generated raster is preserved as `social-card-approved.png` at 1731×909. The approved raster is the source of truth; `npm run asset:social` makes a deterministic 1200×630 export. The image is used as artwork, not recreated as HTML or SVG.

The final generation used the preceding card as its edit target, the original `approved-concept.png` as a lighting reference, and an earlier social-card concept as a secondary style reference. Intermediate card concepts remain in the conversation; they are not needed to rebuild the public export.

## Final generation prompt

```text
Refine the BACKGROUND ONLY of the TVR Works social-sharing card in reference 1. Preserve its approved logo, exact typography, font sizes, font weights, text positions, single-line service description, comfortable margins, and overall optical balance. This is ONE finished flat landscape card, intended 1200x630, aspect ratio 1.9048:1. References 2 and 3 are historical STYLE REFERENCES: use their softer ethereal cyan glows and selective luminous arc highlights, not their layout, wording, nodes, or central diagrams.

The user says the latest frame is too geometric. Bring back the original atmospheric luminous quality. Replace reference 1's hard, uniformly stroked complete circle and crisp crosshair with softly illuminated PARTIAL drafting arcs and whisper-thin construction traces that dissolve naturally into a rich near-black navy field. The geometry should be sensed through light, not read as an empty target/chart. Study reference 2's upper cyan arc: it has localized bright teal/azure highlights at a couple of intersections, with the rest fading into darkness. That selective lighting is the desired feel. Use one broad cropped arc toward the right, with restrained cyan-blue rim lighting on only a few sections, soft bloom immediately around those sections, and layered broad teal/azure gradient haze that blends outward into the background. A couple of barely visible angled or horizontal drafting lines may remain, fading at their ends, but no prominent central crosshair. Use much lower geometric contrast than reference 1, while making the glow richer and more visible. Keep the left text area deep and clean. Allow the gentle glow to live under the right half and extend subtly toward the lower center, preserving high text contrast.

This is sophisticated restrained atmospheric brand lighting, not a neon sci-fi interface: no perfectly complete bright circle, no hard uniform target frame, no dense grid, no extra outlines, no particles, no stars, no smoke clouds, no lens flare, no beams, no 3D objects, no machinery. Absolutely do not restore the white central hub, connecting branches, junction dots, or any labels from the older references. Do not add any text from the older website screenshot.

EXACT immutable card text:
Authentic TVR monogram plus Works at upper left.
Headline in two lines:
Your vision.
A partner to build it.
Muted cool-blue descriptor in ONE line:
Custom software, modernization, AI & technical leadership.
No URL, no LLC, no footer, no CTA. Keep all copy, scale, spacing, and placement from reference 1. Change the background from hard geometric blueprint to softly glowing, partially revealed blueprint atmosphere inspired by the original references.
```
