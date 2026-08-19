/* eslint-disable */
// Aware Investments breadcrumb — auto-generated from the current URL path.
// The source site shows a trail like: Investment > Our investment approach >
// <current page>. We derive the same trail from location.pathname so it works
// on every content page without authoring it into each document.

// Ancestor segment -> label overrides (match the source site's exact casing).
// Leaf (current page) label comes from the page <h1>, so it is not listed here.
const LABELS = {
  investment: 'Investment',
  'our-investment-approach': 'Our investment approach',
  'what-we-invest-in': 'What we invest in',
  'about-us': 'About us',
  'our-people': 'Our people',
  'contact-us': 'Contact us',
  infrastructure: 'Infrastructure',
  'private-equity': 'Private equity',
  property: 'Property',
  'investment-strategy': 'Investment strategy',
  'responsible-ownership': 'Responsible Ownership',
  'privacy-uk': 'Privacy',
};

function labelFor(segment) {
  if (LABELS[segment]) return LABELS[segment];
  // Sentence-case fallback: "some-segment" -> "Some segment".
  const words = segment.replace(/-/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export default function decorate(block) {
  const path = window.location.pathname
    .replace(/\.plain\.html$/, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
  const segments = path.split('/').filter(Boolean);

  // Only render a trail on interior pages (2+ segments under the site root).
  if (segments.length < 2) {
    block.remove();
    return;
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list';

  let cumulative = '';
  segments.forEach((seg, i) => {
    cumulative += `/${seg}`;
    const isLast = i === segments.length - 1;
    const li = document.createElement('li');
    li.className = 'breadcrumb-item';

    if (isLast) {
      // Current page: prefer the on-page <h1>, else the segment label.
      const h1 = document.querySelector('main h1');
      const label = (h1 && h1.textContent.trim()) || labelFor(seg);
      const span = document.createElement('span');
      span.setAttribute('aria-current', 'page');
      span.textContent = label;
      li.appendChild(span);
    } else {
      const a = document.createElement('a');
      a.href = cumulative;
      a.textContent = labelFor(seg);
      li.appendChild(a);
    }
    ol.appendChild(li);
  });

  nav.appendChild(ol);
  block.textContent = '';
  block.appendChild(nav);
}
