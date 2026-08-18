/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-nav. Base block: cards.
 * Source: awareinvestments "Where to next?" nav grid (flexi-icon-wrapper--card col-3)
 * Structure (library): 2 columns, multiple rows. Each row = one card.
 *   Row 1: block name
 *   Each card row: [ icon image cell , text cell (linked heading only) ]
 * These are navigation tiles: icon + a single linked heading, no body text.
 */
export default function parse(element, { document }) {
  let cards = Array.from(element.querySelectorAll('.flexi-icon--card, .flexi-icon'));
  cards = cards.filter((c, i) => cards.indexOf(c) === i);

  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    const icon = card.querySelector(':scope > .icon img, .icon img, img');
    const heading = card.querySelector(
      ':scope > .header h1, :scope > .header h2, :scope > .header h3, .header h1, .header h2, .header h3, h3, h2'
    );

    const iconCell = icon ? [icon] : [''];
    const textCell = heading ? [heading] : [''];
    cells.push([iconCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-nav', cells });
  element.replaceWith(block);
}
