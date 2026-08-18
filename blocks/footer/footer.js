/* eslint-disable */
// Aware Investments footer — content-first, generic.
// Reads /content/footer.plain.html: section 1 = link columns + disclaimer,
// section 2 = app download (mobile-only), section 3 = bottom bar (copyright + links).

export default async function decorate(block) {
  const footerMeta = block.querySelector('a')?.getAttribute('href');
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok && footerMeta) resp = await fetch(`${footerMeta}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const sections = [...tmp.querySelectorAll('main > div, body > div')];

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // --- Section 1: link columns + disclaimer ---
  if (sections[0]) {
    const top = document.createElement('div');
    top.className = 'footer-top';
    const children = [...sections[0].children];
    for (let i = 0; i < children.length; i += 1) {
      const el = children[i];
      if (el.tagName === 'H2') {
        const col = document.createElement('div');
        col.className = 'footer-col';
        col.appendChild(el.cloneNode(true));
        const next = children[i + 1];
        if (next && next.tagName === 'UL') col.appendChild(next.cloneNode(true));
        top.appendChild(col);
      } else if (el.tagName === 'P') {
        // disclaimer paragraphs — group under the preceding H2 column (already handled)
        const lastCol = top.querySelector('.footer-col:last-child');
        if (lastCol && !lastCol.querySelector('ul')) lastCol.appendChild(el.cloneNode(true));
      }
    }
    footer.appendChild(top);
  }

  // --- Section 2: app download (mobile-only, controlled by CSS) ---
  if (sections[1]) {
    const app = document.createElement('div');
    app.className = 'footer-app';
    [...sections[1].childNodes].forEach((n) => app.appendChild(n.cloneNode(true)));
    footer.appendChild(app);
  }

  // --- Section 3: bottom bar ---
  if (sections[2]) {
    const bottom = document.createElement('div');
    bottom.className = 'footer-bottom';
    [...sections[2].childNodes].forEach((n) => bottom.appendChild(n.cloneNode(true)));
    footer.appendChild(bottom);
  }

  block.appendChild(footer);
}
