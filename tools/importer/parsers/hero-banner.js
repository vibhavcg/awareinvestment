/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base block: Hero.
 * Source: awareinvestments — the leading `.banner` section with a
 * `.banner-container` holding a background image and a `.banner-content-card`
 * carrying the H1 title.
 *
 * Per the Hero convention this block's table has 1 column and 3 rows:
 *   Row 1: block name (+ optional "image-left" variant for placement)
 *   Row 2: single cell — Background Image (optional)
 *   Row 3: single cell — Title (H1), plus any subheading / CTA
 *
 * Image placement is an authoring choice, not part of the source (which is
 * always image-right). Pages listed in IMAGE_LEFT_PATHS get the `image-left`
 * variant so the preference round-trips through re-imports.
 */
const IMAGE_LEFT_PATHS = new Set([
  '/investment/our-investment-approach',
]);

export default function parse(element, { document, url }) {
  const img = element.querySelector('.banner-background-image, .banner-container img, img');
  const heading = element.querySelector('h1');

  if (!heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Row 2: background image (optional). Row 3: title + any supporting content.
  const titleCell = [heading];
  const card = heading.closest('.banner-content-card') || heading.parentElement;
  if (card) {
    card.querySelectorAll('h2, h3, p, a').forEach((el) => {
      if (el.textContent.trim()) titleCell.push(el);
    });
  }

  const cells = [];
  cells.push([img || '']);
  cells.push(titleCell);

  let path = '';
  try {
    path = new URL(url).pathname.replace(/\.html?$/, '').replace(/\/$/, '');
  } catch (e) { /* url may be undefined in some contexts */ }
  const name = IMAGE_LEFT_PATHS.has(path) ? 'hero-banner (image-left)' : 'hero-banner';

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
}
