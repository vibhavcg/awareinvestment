/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aware Investments section breaks + section metadata.
 *
 * The source wraps each page section in `main > div.aem-Grid > section.sectioncontainer`.
 * This transformer preserves that structure in the EDS import by:
 *   1. inserting a `<hr>` break before every section except the first, and
 *   2. adding a `Section Metadata` block for sections whose source background
 *      class maps to a non-default EDS section style.
 *
 * Section boundaries are DOM-derived (page-templates.json carries no `sections`
 * array for this site), so we read the sections directly from `main`.
 *
 * Background-class → style map, verified by reading:
 *   migration-work/landing-page/cleaned.html
 *   migration-work/content-page/cleaned.html
 *   - background-colour-white          → default (no metadata)
 *   - background-colour-neutral-yellow → "highlight"
 *
 * Uses BOTH hooks with a marker: block parsers run between the hooks and call
 * `element.replaceWith(block)` on section elements, so the metadata anchor must
 * be a marker `<hr>` (a non-div sibling that never disturbs `:nth-of-type`
 * parser selectors) inserted while the section elements still exist.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';
// The 7 page sections are the only `section.sectioncontainer` elements in the
// captured DOM (chrome uses no such class), and the harness may pass `main` OR
// an ancestor as `element`, so match by descendant class rather than a
// `:scope >` child chain that depends on `element` being `main`.
const SECTION_SELECTOR = 'section.sectioncontainer';

// Maps a source section's background class to an EDS section style.
// Returns null when the section should use the default style (no metadata).
function styleForSection(sectionEl) {
  if (sectionEl.classList.contains('background-colour-neutral-yellow')) return 'highlight';
  // background-colour-white and any unclassed section => default, no metadata.
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    const sections = [...element.querySelectorAll(SECTION_SELECTOR)];

    // Reverse order: inserting relative to a live element only affects nodes
    // after the current position, so walking backwards keeps unprocessed
    // sections exactly where querySelectorAll found them.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const sectionEl = sections[i];
      const style = styleForSection(sectionEl);

      // First section: no leading break, and only mark if it needs metadata.
      if (i === 0 && !style) continue;

      const hr = document.createElement('hr');
      // Tag the break with an index-based id so afterTransform can find it and
      // know which style (if any) to attach.
      if (style) hr.setAttribute(SECTION_MARKER_ATTR, `${i}:${style}`);
      else hr.setAttribute(SECTION_MARKER_ATTR, `${i}:`);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements; the marker
    // <hr> elements survive as stable anchors.
    const markers = [...element.querySelectorAll(`[${SECTION_MARKER_ATTR}]`)];

    // Process in reverse for the same stable-insert reason as above.
    for (let m = markers.length - 1; m >= 0; m -= 1) {
      const marker = markers[m];
      const value = marker.getAttribute(SECTION_MARKER_ATTR) || '';
      const [index, style] = value.split(':');

      if (style) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style },
        });
        marker.after(metadataBlock);
      }

      marker.removeAttribute(SECTION_MARKER_ATTR);
      // The first section never gets a real leading break; drop its marker hr.
      if (index === '0') marker.remove();
    }
  }
}
