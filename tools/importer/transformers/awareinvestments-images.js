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
  if (hookName === 'beforeTransform') {
    // Resolve lazy-loaded core-image components: the live page defers loading
    // (data-cmp-lazy) so the captured <img> src is a transient blob: URL. The
    // canonical DAM path lives on the wrapper's data-cmp-src / data-asset. Copy
    // it onto the <img> BEFORE block discovery so selectors and parsers see the
    // real asset URL instead of a blob.
    element.querySelectorAll('[data-cmp-src], [data-asset]').forEach((wrapper) => {
      const real = wrapper.getAttribute('data-cmp-src') || wrapper.getAttribute('data-asset');
      if (!real) return;
      const img = wrapper.querySelector('img');
      if (!img) return;
      const current = img.getAttribute('src') || '';
      if (!current || current.startsWith('blob:') || current.startsWith('data:')) {
        img.setAttribute('src', real);
      }
    });
  }

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
