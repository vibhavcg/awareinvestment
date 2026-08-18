/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-cards. Base block: accordion.
 * Source: awareinvestments (cmp-accordion--default with expandable investment cards)
 * Structure (library): 2 columns, multiple rows. Each row = one accordion item.
 *   Row 1: block name
 *   Each item row: [ title cell , content cell (rich body: paragraphs + detail table) ]
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

    // Rich body: the text container (paragraphs + detail table). Prefer the
    // .text .cmp-text wrapper, which holds paragraphs and the <table>.
    const contentCell = [];
    const textWrapper = panel.querySelector('.text .cmp-text, .cmp-text');
    if (textWrapper) {
      contentCell.push(textWrapper);
    } else {
      // Fallback: grab paragraphs and any tables directly.
      const paras = Array.from(panel.querySelectorAll('p'));
      const tables = Array.from(panel.querySelectorAll('table'));
      contentCell.push(...paras, ...tables);
    }

    cells.push([[titleCell], contentCell.length ? contentCell : ['']]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-cards', cells });
  element.replaceWith(block);
}
