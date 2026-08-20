import { createOptimizedPicture } from '../../scripts/aem.js';

// Aware Investments hero banner — a 50/50 split page-title banner:
// a magenta card carrying the H1 on one side, a hero image on the other.
//
// Authoring:
//   - Two rows: [ image ] then [ heading ]. Order in the doc doesn't matter —
//     the image row is detected by its <picture>/<img>.
//   - Image placement: default is image-right. Add the block option
//     "image-left" (block name "Hero Banner (image-left)") to flip it.
export default function decorate(block) {
  const rows = [...block.children];

  // Identify the image row and the text (heading) row by content.
  const imageRow = rows.find((r) => r.querySelector('picture, img'));
  const textRow = rows.find((r) => r !== imageRow);

  if (imageRow) {
    imageRow.classList.add('hero-banner-image');
    const img = imageRow.querySelector('img');
    if (img) {
      const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
      img.closest('picture').replaceWith(optimized);
    }
  }
  if (textRow) textRow.classList.add('hero-banner-content');

  // Fallback default when no explicit placement option was authored.
  if (!block.classList.contains('image-left') && !block.classList.contains('image-right')) {
    block.classList.add('image-right');
  }
}
