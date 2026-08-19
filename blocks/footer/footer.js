/* eslint-disable */
// Aware Investments footer — content-first, generic.
// Reads /footer.plain.html (production) or /content/footer.plain.html (local).
// The EDS pipeline may merge the fragment's sections into a single <div>, so
// this parses by content markers rather than fixed section indexes:
//   - <h2>  => a link column (its following <ul> and/or <p> disclaimer belong to it)
//   - <h3>  => the "Download our app" section (mobile-only)
//   - <p> containing "©" => the bottom bar (its following <ul> = bottom links)

export default async function decorate(block) {
  const footerMeta = block.querySelector('a')?.getAttribute('href');
  let resp = await fetch('/footer.plain.html');
  if (!resp.ok) resp = await fetch('/content/footer.plain.html');
  if (!resp.ok && footerMeta) resp = await fetch(`${footerMeta}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Flatten to the elements we care about, in document order.
  const nodes = [...tmp.querySelectorAll('h2, h3, ul, p')];

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  const top = document.createElement('div');
  top.className = 'footer-top';
  const app = document.createElement('div');
  app.className = 'footer-app';
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  let currentCol = null; // active footer-top column
  let mode = 'top'; // top | app | bottom

  for (let i = 0; i < nodes.length; i += 1) {
    const el = nodes[i];
    const tag = el.tagName;
    const isCopyright = tag === 'P' && /©|\bcopyright\b/i.test(el.textContent);

    if (tag === 'H3') {
      // App-download section
      mode = 'app';
      app.appendChild(el.cloneNode(true));
    } else if (isCopyright) {
      mode = 'bottom';
      bottom.appendChild(el.cloneNode(true));
    } else if (tag === 'H2') {
      mode = 'top';
      currentCol = document.createElement('div');
      currentCol.className = 'footer-col';
      currentCol.appendChild(el.cloneNode(true));
      top.appendChild(currentCol);
    } else if (tag === 'UL') {
      if (mode === 'bottom') bottom.appendChild(el.cloneNode(true));
      else if (currentCol) currentCol.appendChild(el.cloneNode(true));
    } else if (tag === 'P') {
      // Non-copyright paragraph: belongs to the app section (image) or the
      // current column (disclaimer text).
      if (mode === 'app') app.appendChild(el.cloneNode(true));
      else if (currentCol) currentCol.appendChild(el.cloneNode(true));
    }
  }

  if (top.children.length) footer.appendChild(top);
  if (app.children.length) footer.appendChild(app);
  if (bottom.children.length) footer.appendChild(bottom);

  block.appendChild(footer);
}
