/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aware Investments image / media src normalization.
 *
 * Source images are standard AEM DAM assets served from the page host under
 * `/content/dam/...` (verified in migration-work/metadata.json `.images.mapping`
 * — single host https://awareinvestments.aware.com.au, no query strings, no
 * renditions, no `<picture>`/`<source>`, NOT Dynamic Media / Scene7). So there
 * is no Scene7 handling here; this only tidies `<img>` src values so the import
 * carries clean, canonical asset URLs.
 *
 * Runs in afterTransform only: block parsers extract `<img>` references into
 * block cells between the hooks, so `<img>` must still exist during parsing.
 *
 * For each `<img>`:
 *   - normalize a protocol-relative `//host/...` src to `https://host/...`
 *   - strip AEM-appended query/cache params from a `/content/dam/` src (the
 *     core-image component emits these on the live page; the canonical DAM path
 *     is what should round-trip). No-op when the src is already clean, as it is
 *     in the captured snapshot.
 *   - drop leftover empty-string/decorative alt noise is left intact (authorable).
 */

export default function transform(hookName, element, payload) {
  if (hookName === 'afterTransform') {
    element.querySelectorAll('img[src]').forEach((img) => {
      let src = img.getAttribute('src');
      if (!src) return;

      // Protocol-relative -> https (verified host is https-only).
      if (src.startsWith('//')) {
        src = `https:${src}`;
      }

      // Canonicalize DAM asset URLs: keep the /content/dam/... path, drop any
      // AEM-appended query string (cache tokens, rendition params) after it.
      const damIndex = src.indexOf('/content/dam/');
      if (damIndex !== -1) {
        const q = src.indexOf('?', damIndex);
        if (q !== -1) {
          src = src.slice(0, q);
        }
      }

      if (src !== img.getAttribute('src')) {
        img.setAttribute('src', src);
      }
    });
  }
}
