/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-brand. Base block: hero.
 * Source: https://awareinvestments.aware.com.au/ (banner section)
 * Structure (library): 1 column, 3 rows.
 *   Row 1: block name
 *   Row 2: background image (optional)
 *   Row 3: title (heading), optional subheading, optional CTA
 */
export default function parse(element, { document }) {
  // Heading / title
  const heading = element.querySelector(
    '.banner-content-card__rte-container h1, .banner-content-card__rte-container h2, h1, [class*="content-card"] h1'
  );
  // Background / banner image
  const bgImage = element.querySelector(
    '.banner__image-container img, [class*="image-container"] img, img'
  );
  // Optional CTA buttons inside the content card
  const ctaLinks = Array.from(
    element.querySelectorAll('.banner-content-card__button-container a, [class*="button-container"] a')
  );

  if (!heading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (only if present)
  if (bgImage) cells.push([bgImage]);

  // Row 3: text content (heading + optional CTAs) in a single cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-brand', cells });
  element.replaceWith(block);
}
