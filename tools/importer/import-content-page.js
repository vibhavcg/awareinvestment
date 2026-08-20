/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsFeatureParser from './parsers/cards-feature.js';
import accordionCardsParser from './parsers/accordion-cards.js';
import cardsNavParser from './parsers/cards-nav.js';
import columnsSplitParser from './parsers/columns-split.js';
import cardsExploreParser from './parsers/cards-explore.js';
import logoStripParser from './parsers/logo-strip.js';
import heroBannerParser from './parsers/hero-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/awareinvestments-cleanup.js';
import sectionsTransformer from './transformers/awareinvestments-sections.js';
import imagesTransformer from './transformers/awareinvestments-images.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'logo-strip': logoStripParser,
  'cards-explore': cardsExploreParser,
  'columns-split': columnsSplitParser,
  'cards-feature': cardsFeatureParser,
  'accordion-cards': accordionCardsParser,
  'cards-nav': cardsNavParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'content-page',
  description: 'Interior content page: H1 title on pink banner, intro, feature grid, accordion example cards, where-to-next nav cards.',
  urls: [
    'https://awareinvestments.aware.com.au/investment/what-we-invest-in/infrastructure',
    'https://awareinvestments.aware.com.au/investment/about-us',
    'https://awareinvestments.aware.com.au/investment/about-us/contact-us',
    'https://awareinvestments.aware.com.au/investment/about-us/our-people',
    'https://awareinvestments.aware.com.au/investment/our-investment-approach',
    'https://awareinvestments.aware.com.au/investment/our-investment-approach/investment-strategy',
    'https://awareinvestments.aware.com.au/investment/our-investment-approach/responsible-ownership',
    'https://awareinvestments.aware.com.au/investment/what-we-invest-in',
    'https://awareinvestments.aware.com.au/investment/what-we-invest-in/private-equity',
    'https://awareinvestments.aware.com.au/investment/what-we-invest-in/property',
    'https://awareinvestments.aware.com.au/investment/privacy-uk',
  ],
  blocks: [
    // Page-title hero: the leading `.banner` block whose card carries the H1
    // and a background image → hero-banner (50/50 magenta card + image).
    { name: 'hero-banner', instances: ['.banner:has(.banner-container img):has(h1)'] },
    // Partner / advocacy logo band: a section holding a single composite logo
    // image (served from the /custom/ DAM folder), no heading, no text.
    { name: 'logo-strip', instances: ['section.sectioncontainer:has(> div .cmp-image img[src*="/custom/"])'] },
    // 3-up "Where to next?" photo cards (image on top) → cards-explore.
    // Target the fixed-grid that holds the top-image tiles.
    { name: 'cards-explore', instances: ['div.fixed-grid:has(> div > .contenttile-textimage.contenttile__image-position--top)'] },
    // 50/50 image+text splits (image on right or left) → columns-split.
    { name: 'columns-split', instances: ['section.sectioncontainer:has(> div .contenttile-textimage.contenttile__image-position--right)', 'section.sectioncontainer:has(> div .contenttile-textimage.contenttile__image-position--left)'] },
    // Feature cards: icon + heading + BODY text (any column count). The body
    // paragraph is what distinguishes feature cards from nav cards.
    { name: 'cards-feature', instances: ['.flexi-icon-wrapper--card:has(.flexi-icon .body)'] },
    { name: 'accordion-cards', instances: ['.cmp-accordion.cmp-accordion--default'] },
    // Nav cards: icon + linked heading, NO body text.
    { name: 'cards-nav', instances: ['.flexi-icon-wrapper--card:not(:has(.flexi-icon .body))'] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  imagesTransformer,
  sectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements;
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for ${blockDef.name}: ${selector}`);
        return;
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        // avoid mapping a descendant when its ancestor (or vice-versa) is already captured for this block
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  // De-duplicate: if a fallback selector captured a child already inside a captured section, drop the nested one
  const filtered = pageBlocks.filter((b, i) => {
    return !pageBlocks.some((other, j) => j !== i && other.name === b.name && other.element !== b.element && other.element.contains(b.element));
  });
  console.log(`Found ${filtered.length} block instances on page`);
  return filtered;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
