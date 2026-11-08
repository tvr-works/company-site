import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const logo = await readFile(new URL('../public/logo.svg', import.meta.url), 'utf8');
const path = /<path[^>]+d="([^"]+)"/.exec(logo)?.[1];
if (!path) throw new Error('TVR source logo is missing');
const social = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><radialGradient id="g"><stop stop-color="#143342"/><stop offset="1" stop-color="#080f16"/></radialGradient></defs>
<rect width="1200" height="630" fill="#080f16"/>
<circle cx="960" cy="320" r="380" fill="url(#g)"/>
<svg x="64" y="55" width="78" height="41" viewBox="90.5 359.5 1070 557"><path fill="#f5f6f7" d="${path}"/></svg>
<g fill="#f5f6f7" font-family="Arial,Helvetica,sans-serif"><text x="153" y="90" font-size="42" font-weight="700" letter-spacing="-2">Works</text>
<text x="64" y="244" font-size="82" font-weight="700" letter-spacing="-3">Your vision.</text>
<text x="64" y="338" font-size="82" font-weight="700" letter-spacing="-3">A partner to build it.</text>
<text x="67" y="425" font-size="25" fill="#b7c1ca">Custom software, applied AI &amp; technical leadership.</text>
<text x="67" y="553" font-size="22" fill="#4be1f0">TVR Works LLC</text></g>
<g fill="none" stroke="#4be1f0" opacity=".18"><circle cx="1010" cy="310" r="200"/><path d="M1010 80v460M780 310h420M868 168l284 284M868 452l284-284"/></g>
</svg>`;
await writeFile(new URL('../public/social-card.svg', import.meta.url), social);
await sharp(Buffer.from(social))
  .png()
  .toFile(new URL('../public/social-card.png', import.meta.url).pathname);
await sharp(new URL('../public/favicon.svg', import.meta.url).pathname)
  .resize(180, 180)
  .png()
  .toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname);
console.log(
  'Generated social-card.png, social-card.svg, and apple-touch-icon.png from the original mark.',
);
