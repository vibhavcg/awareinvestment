/* eslint-disable */
// Aware Investments header — content-first, generic (no site-specific names).
// Reads structure from /content/nav.plain.html: section 1 = brand (logo),
// section 2 = nav (alternating <h2> triggers + <ul> panels).

function wrapTextNodes(li) {
  // Wrap the description text (text nodes after the <a>) in a <span>.
  const link = li.querySelector('a');
  if (!link) return;
  const frag = document.createDocumentFragment();
  let desc = '';
  li.childNodes.forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE) desc += n.textContent;
  });
  desc = desc.trim();
  li.textContent = '';
  li.appendChild(link);
  if (desc) {
    const span = document.createElement('span');
    span.className = 'nav-drop-desc';
    span.textContent = desc;
    li.appendChild(span);
  }
}

export default async function decorate(block) {
  // Dual-fetch: localhost/aem-up first, then DA/EDS production path.
  const navMeta = block.querySelector('a')?.getAttribute('href');
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok && navMeta) resp = await fetch(`${navMeta}.plain.html`);
  if (!resp.ok) return;
  const html = await resp.text();

  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const sections = [...tmp.querySelectorAll('main > div, body > div')];
  const brandSection = sections[0];
  const navSection = sections[1];

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Main navigation');

  // --- Brand / logo ---
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandSection) {
    const logoLink = brandSection.querySelector('a');
    if (logoLink) brand.appendChild(logoLink);
  }
  nav.appendChild(brand);

  // --- Nav sections (triggers + panels) ---
  const navList = document.createElement('ul');
  navList.className = 'nav-list';

  if (navSection) {
    const children = [...navSection.children];
    for (let i = 0; i < children.length; i += 1) {
      const el = children[i];
      if (el.tagName === 'H2') {
        const li = document.createElement('li');
        li.className = 'nav-item';

        const trigger = document.createElement('button');
        trigger.className = 'nav-trigger';
        trigger.setAttribute('aria-expanded', 'false');
        const label = el.querySelector('a') ? el.querySelector('a').textContent.trim() : el.textContent.trim();
        trigger.textContent = label;
        li.appendChild(trigger);

        // The next sibling <ul> is this item's panel
        const panelSource = children[i + 1];
        if (panelSource && panelSource.tagName === 'UL') {
          const panel = document.createElement('div');
          panel.className = 'nav-drop';

          // Mobile slide-in: back button at top of the sub-panel
          const back = document.createElement('button');
          back.className = 'nav-drop-back';
          back.type = 'button';
          back.textContent = 'Back';
          back.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            trigger.setAttribute('aria-expanded', 'false');
            nav.classList.remove('nav-open');
          });
          panel.appendChild(back);

          const ul = panelSource.cloneNode(true);
          [...ul.querySelectorAll('li')].forEach(wrapTextNodes);
          panel.appendChild(ul);
          li.appendChild(panel);
        }

        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = trigger.getAttribute('aria-expanded') === 'true';
          // close others
          navList.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => {
            if (t !== trigger) t.setAttribute('aria-expanded', 'false');
          });
          trigger.setAttribute('aria-expanded', String(!isOpen));
          nav.classList.toggle('nav-open', !isOpen);
        });

        navList.appendChild(li);
      }
    }
  }
  nav.appendChild(navList);

  // --- Hamburger (mobile) ---
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('nav-mobile-open', !isOpen);
    document.body.classList.toggle('nav-menu-open', !isOpen);
  });
  nav.insertBefore(hamburger, navList);

  block.appendChild(nav);

  // Close panels on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      navList.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
      nav.classList.remove('nav-open');
    }
  });

  // Viewport resize handling: reset mobile state when crossing to desktop
  const mq = window.matchMedia('(min-width: 900px)');
  const onChange = (e) => {
    if (e.matches) {
      nav.classList.remove('nav-mobile-open');
      document.body.classList.remove('nav-menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      navList.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    }
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
}
