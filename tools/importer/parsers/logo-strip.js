/* eslint-disable */
/* global WebImporter */
/**
 * Parser for logo-strip. Base block: (plain image band).
 * Source: awareinvestments — a section holding a single composite partner-logos
 * image (e.g. responsible-ownership-logos.png), no heading, no text.
 * Structure (library): 1 column, 1 row.
 *   Row 1: block name
 *   Row 2: [ image ]
 */
export default function parse(element, { document }) {
  const img = element.querySelector('img');
  if (!img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[img]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'logo-strip', cells });
  element.replaceWith(block);
}
