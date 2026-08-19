import { createOptimizedPicture } from '../../scripts/aem.js';

// Aware Investments logo strip — a horizontal band of partner / advocacy logos.
// The source renders these as a single composite image, so the block simply
// presents the image(s) it is given, centered and responsively sized.
export default function decorate(block) {
  block.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '1280' }]);
    img.closest('picture').replaceWith(optimized);
  });
}
