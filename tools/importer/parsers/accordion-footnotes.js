/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-footnotes. Base block: accordion.
 * Source: awareinvestments (cmp-accordion--footnotes)
 * Structure (library): 2 columns, multiple rows. Each row = one accordion item.
 *   Row 1: block name
 *   Each item row: [ title cell , content cell (body / footnote lines) ]
 * The footnotes accordion typically has a single "Footnotes" item whose panel
 * contains several footnote paragraphs (from experience-fragment includes).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll(':scope > .cmp-accordion__item, .cmp-accordion__item'))
    .filter((it, i, arr) => arr.indexOf(it) === i);

  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, button');
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    const titleCell = document.createElement('p');
    titleCell.textContent = titleText;

    const panel = item.querySelector('.cmp-accordion__panel') || item;
    // Collect the footnote body paragraphs from the panel.
    const bodyParas = Array.from(panel.querySelectorAll('.cmp-text p, p'))
      .filter((p, i, arr) => arr.indexOf(p) === i);

    const contentCell = bodyParas.length ? bodyParas : [''];
    cells.push([[titleCell], contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-footnotes', cells });
  element.replaceWith(block);
}
