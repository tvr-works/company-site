import sharp from 'sharp';
import { brandLogo, socialCard } from '../src/site-config.ts';

// The approved raster is the source of truth; re-exporting must preserve its artwork.
await sharp(new URL('../docs/design/social-card-approved.png', import.meta.url).pathname)
  .resize(socialCard.width, socialCard.height, { fit: 'cover' })
  .toColourspace('srgb')
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(new URL(`../public${socialCard.path}`, import.meta.url).pathname);

await sharp(new URL('../public/favicon.svg', import.meta.url).pathname)
  .resize(180, 180)
  .png()
  .toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname);

await sharp(new URL('../public/favicon.svg', import.meta.url).pathname)
  .resize(brandLogo.width, brandLogo.height)
  .flatten({ background: '#080f16' })
  .png({ compressionLevel: 9 })
  .toFile(new URL(`../public${brandLogo.path}`, import.meta.url).pathname);

console.log(`Exported ${socialCard.path}, ${brandLogo.path}, and the touch icon.`);
