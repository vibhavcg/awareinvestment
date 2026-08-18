/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBrandParser from './parsers/hero-brand.js';
import columnsSplitParser from './parsers/columns-split.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsExploreParser from './parsers/cards-explore.js';
import accordionFootnotesParser from './parsers/accordion-footnotes.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/awareinvestments-cleanup.js';
import sectionsTransformer from './transformers/awareinvestments-sections.js';
import imagesTransformer from './transformers/awareinvestments-images.js';

// PARSER REGISTRY
const parsers = {
  'hero-brand': heroBrandParser,
  'columns-split': columnsSplitParser,
  'cards-feature': cardsFeatureParser,
  'cards-explore': cardsExploreParser,
  'accordion-footnotes': accordionFootnotesParser,
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Marketing landing page: hero, intro split section, feature cards, split image/text section, explore-more card grid.',
  urls: [
    'https://awareinvestments.aware.com.au/',
    'https://awareinvestments.aware.com.au/investment',
  ],
  blocks: [
    { name: 'hero-brand', instances: ['#main > div.aem-Grid > section.sectioncontainer:nth-of-type(1)'] },
    { name: 'columns-split', instances: ['#main > div.aem-Grid > section.sectioncontainer:nth-of-type(2)', '#main > div.aem-Grid > section.sectioncontainer:nth-of-type(5)'] },
    { name: 'cards-feature', instances: ['#main > div.aem-Grid > section.sectioncontainer:nth-of-type(4)'] },
    { name: 'cards-explore', instances: ['#main > div.aem-Grid > section.sectioncontainer:nth-of-type(7)'] },
    { name: 'accordion-footnotes', instances: ['#main > div.aem-Grid > section.sectioncontainer:nth-of-type(8)', '.cmp-accordion--footnotes'] },
  ],
};

// TRANSFORMER REGISTRY (cleanup + images run always; sections handles section breaks/metadata)
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
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // avoid double-mapping same element via fallback selector
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by an earlier parser
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
