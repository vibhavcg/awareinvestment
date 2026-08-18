/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-explore. Base block: cards.
 * Source: awareinvestments (contenttile grid, image-position--top)
 * Structure (library): 2 columns, multiple rows. Each row = one card.
 *   Row 1: block name
 *   Each card row: [ top image cell , text cell (heading + paragraph + CTA link) ]
 */
export default function parse(element, { document }) {
  // Each card is a .contenttile wrapper containing a .contenttile-textimage.
  let cards = Array.from(element.querySelectorAll('.contenttile-textimage'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('.contenttile'));
  }
  cards = cards.filter((c, i) => cards.indexOf(c) === i);

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const image = card.querySelector(
      '.contenttile-textimage__image img, [class*="__image"] img, img'
    );
    const content = card.querySelector(
      '.contenttile-textimage__content, [class*="__content"]'
    ) || card;

    const heading = content.querySelector(
      '.contenttile-textimage__content-title, h1, h2, h3, [class*="content-title"]'
    );
    const description = Array.from(
      content.querySelectorAll(
        '.contenttile-textimage__content-description, [class*="content-description"]'
      )
    );
    const ctaLinks = Array.from(
      content.querySelectorAll(
        '.contenttile-textimage__content-button a, [class*="content-button"] a, .buttons-list a'
      )
    );

    const textCell = [];
    if (heading) textCell.push(heading);
    if (description.length) textCell.push(...description);
    textCell.push(...ctaLinks);

    const imageCell = image ? [image] : [''];
    cells.push([imageCell, textCell.length ? textCell : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-explore', cells });
  element.replaceWith(block);
}
