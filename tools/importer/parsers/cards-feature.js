/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base block: cards.
 * Source: awareinvestments (flexi-icon-wrapper--card grid, col-3/col-4)
 * Structure (library): 2 columns, multiple rows. Each row = one card.
 *   Row 1: block name
 *   Each card row: [ icon image cell , text cell (heading[link] + body) ]
 */
export default function parse(element, { document }) {
  // Each card is a .flexi-icon block (note: source nests them, so select all descendants).
  let cards = Array.from(element.querySelectorAll('.flexi-icon--card, .flexi-icon'));
  // Deduplicate in case of overlapping matches / nesting.
  cards = cards.filter((c, i) => cards.indexOf(c) === i);

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const icon = card.querySelector(':scope > .icon img, .icon img, img');
    const heading = card.querySelector(':scope > .header h1, :scope > .header h2, :scope > .header h3, .header h1, .header h2, .header h3, h3, h2');
    const body = Array.from(card.querySelectorAll(':scope > .body, .body.cmp-text, .body'));

    const textCell = [];
    if (heading) textCell.push(heading);
    if (body.length) textCell.push(...body);

    const iconCell = icon ? [icon] : [''];
    cells.push([iconCell, textCell.length ? textCell : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
