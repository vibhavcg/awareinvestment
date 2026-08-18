/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-split. Base block: columns.
 * Source: https://awareinvestments.aware.com.au/ (contenttile-textimage split section)
 * Structure (library): multiple columns. This variant is a 2-column image + text split.
 *   Row 1: block name
 *   Row 2: [ image cell , text cell (heading + paragraph + optional CTA) ]
 * Image position (left/right) is handled by CSS; source order here is image then content.
 */
export default function parse(element, { document }) {
  const image = element.querySelector(
    '.contenttile-textimage__image img, [class*="__image"] img, img'
  );

  const contentRoot = element.querySelector(
    '.contenttile-textimage__content, [class*="__content"]'
  ) || element;

  const heading = contentRoot.querySelector(
    '.contenttile-textimage__content-title, h1, h2, h3, [class*="content-title"]'
  );
  const description = Array.from(
    contentRoot.querySelectorAll(
      '.contenttile-textimage__content-description, [class*="content-description"]'
    )
  );
  const ctaLinks = Array.from(
    contentRoot.querySelectorAll(
      '.contenttile-textimage__content-button a, [class*="content-button"] a, .buttons-list a'
    )
  );

  if (!heading && description.length === 0 && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build the text column contents
  const textCell = [];
  if (heading) textCell.push(heading);
  if (description.length) {
    textCell.push(...description);
  }
  textCell.push(...ctaLinks);

  const imageCell = image ? [image] : [''];

  const cells = [];
  // Single 2-column row: image | text
  cells.push([imageCell, textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-split', cells });
  element.replaceWith(block);
}
