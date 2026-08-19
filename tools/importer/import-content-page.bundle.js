/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-content-page.js
  var import_content_page_exports = {};
  __export(import_content_page_exports, {
    default: () => import_content_page_default
  });

  // tools/importer/parsers/cards-feature.js
  function parse(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".flexi-icon--card, .flexi-icon"));
    cards = cards.filter((c, i) => cards.indexOf(c) === i);
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const icon = card.querySelector(":scope > .icon img, .icon img, img");
      const heading = card.querySelector(":scope > .header h1, :scope > .header h2, :scope > .header h3, .header h1, .header h2, .header h3, h3, h2");
      const body = Array.from(card.querySelectorAll(":scope > .body, .body.cmp-text, .body"));
      const textCell = [];
      if (heading) textCell.push(heading);
      if (body.length) textCell.push(...body);
      const iconCell = icon ? [icon] : [""];
      cells.push([iconCell, textCell.length ? textCell : [""]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-cards.js
  function parse2(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > .cmp-accordion__item, .cmp-accordion__item")).filter((it, i, arr) => arr.indexOf(it) === i);
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title, .cmp-accordion__header, button");
      const titleText = titleEl ? titleEl.textContent.trim() : "";
      const titleCell = document2.createElement("p");
      titleCell.textContent = titleText;
      const panel = item.querySelector(".cmp-accordion__panel") || item;
      const contentCell = [];
      const textWrapper = panel.querySelector(".text .cmp-text, .cmp-text");
      if (textWrapper) {
        contentCell.push(textWrapper);
      } else {
        const paras = Array.from(panel.querySelectorAll("p"));
        const tables = Array.from(panel.querySelectorAll("table"));
        contentCell.push(...paras, ...tables);
      }
      cells.push([[titleCell], contentCell.length ? contentCell : [""]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-nav.js
  function parse3(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".flexi-icon--card, .flexi-icon"));
    cards = cards.filter((c, i) => cards.indexOf(c) === i);
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const icon = card.querySelector(":scope > .icon img, .icon img, img");
      const heading = card.querySelector(
        ":scope > .header h1, :scope > .header h2, :scope > .header h3, .header h1, .header h2, .header h3, h3, h2"
      );
      const iconCell = icon ? [icon] : [""];
      const textCell = heading ? [heading] : [""];
      cells.push([iconCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-nav", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-split.js
  function parse4(element, { document: document2 }) {
    const image = element.querySelector(
      '.contenttile-textimage__image img, [class*="__image"] img, img'
    );
    const contentRoot = element.querySelector(
      '.contenttile-textimage__content, [class*="__content"]'
    ) || element;
    const heading = contentRoot.querySelector(
      '.contenttile-textimage__content-title, h1, h2, h3, [class*="content-title"]'
    );
    const description = Array.from(
      contentRoot.querySelectorAll(
        '.contenttile-textimage__content-description, [class*="content-description"]'
      )
    );
    const ctaLinks = Array.from(
      contentRoot.querySelectorAll(
        '.contenttile-textimage__content-button a, [class*="content-button"] a, .buttons-list a'
      )
    );
    if (!heading && description.length === 0 && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (heading) textCell.push(heading);
    if (description.length) {
      textCell.push(...description);
    }
    textCell.push(...ctaLinks);
    const imageCell = image ? [image] : [""];
    const cells = [];
    cells.push([imageCell, textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-explore.js
  function parse5(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(".contenttile-textimage"));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll(".contenttile"));
    }
    cards = cards.filter((c, i) => cards.indexOf(c) === i);
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(
        '.contenttile-textimage__image img, [class*="__image"] img, img'
      );
      const content = card.querySelector(
        '.contenttile-textimage__content, [class*="__content"]'
      ) || card;
      const heading = content.querySelector(
        '.contenttile-textimage__content-title, h1, h2, h3, [class*="content-title"]'
      );
      const description = Array.from(
        content.querySelectorAll(
          '.contenttile-textimage__content-description, [class*="content-description"]'
        )
      );
      const ctaLinks = Array.from(
        content.querySelectorAll(
          '.contenttile-textimage__content-button a, [class*="content-button"] a, .buttons-list a'
        )
      );
      const textCell = [];
      if (heading) textCell.push(heading);
      if (description.length) textCell.push(...description);
      textCell.push(...ctaLinks);
      const imageCell = image ? [image] : [""];
      cells.push([imageCell, textCell.length ? textCell : [""]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-explore", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/awareinvestments-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // --- Skip-to-main-content link + its clientlib css (both templates, lines 2-5) ---
        ".cmp-page__skiptomaincontent",
        "link",
        // --- Site header / top navigation (both templates, line 9 header.headercontainer,
        //     line 51/53 #aware-top-navigation, cookie/notification/meganav experiencefragments live inside) ---
        "header.headercontainer",
        "#aware-top-navigation",
        // --- Footer + its footer experiencefragment (both templates, line 1171/1405) ---
        "footer.footercontainer",
        ".cmp-experiencefragment--footer",
        // --- Site-wide notification / cookie / unsupported-browser chrome ---
        //     These experience-fragment banners render outside header/footer and
        //     leaked into imported content ("You seem to be using an unsupported
        //     browser", cookie consent, sitewide notification). All non-authorable. ---
        ".browser-popup",
        ".cmp-experiencefragment--investments-notification",
        ".cmp-experiencefragment--uk-site-cookie",
        ".cmp-experiencefragment--uk-sitewide-notification",
        ".cmp-experiencefragment--uk-site-notification",
        "div.cookie",
        "div.notification",
        // --- Content-page breadcrumb + page-utility (text-size/print/share) bar ---
        //     content-page cleaned.html: nav#breadcrumb-* .cmp-breadcrumb (line 870),
        //     wrapper .breadcrumb (line 869), utility cluster .sharing (line 896) ---
        "nav.cmp-breadcrumb",
        ".breadcrumb",
        ".sharing",
        // --- Safe non-authorable leaf elements ---
        "iframe",
        "noscript"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const name = attr.name;
          if (name.startsWith("data-cmp-") || name === "data-tracking" || name === "data-component" || name === "data-icon-blocks" || name === "data-cmp-data-layer" || name === "data-cmp-data-layer-enabled") {
            el.removeAttribute(name);
          }
        });
      });
      WebImporter.DOMUtils.remove(element, ["span.sr-only"]);
    }
  }

  // tools/importer/transformers/awareinvestments-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var SECTION_SELECTOR = "section.sectioncontainer";
  function styleForSection(sectionEl) {
    if (sectionEl.classList.contains("background-colour-neutral-yellow")) return "highlight";
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      const sections = [...element.querySelectorAll(SECTION_SELECTOR)];
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const sectionEl = sections[i];
        const style = styleForSection(sectionEl);
        if (i === 0 && !style) continue;
        const hr = document.createElement("hr");
        if (style) hr.setAttribute(SECTION_MARKER_ATTR, `${i}:${style}`);
        else hr.setAttribute(SECTION_MARKER_ATTR, `${i}:`);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      const markers = [...element.querySelectorAll(`[${SECTION_MARKER_ATTR}]`)];
      for (let m = markers.length - 1; m >= 0; m -= 1) {
        const marker = markers[m];
        const value = marker.getAttribute(SECTION_MARKER_ATTR) || "";
        const [index, style] = value.split(":");
        if (style) {
          const metadataBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style }
          });
          marker.after(metadataBlock);
        }
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (index === "0") marker.remove();
      }
    }
  }

  // tools/importer/transformers/awareinvestments-images.js
  function transform3(hookName, element, payload) {
    if (hookName === "afterTransform") {
      element.querySelectorAll("img[src]").forEach((img) => {
        let src = img.getAttribute("src");
        if (!src) return;
        if (src.startsWith("//")) {
          src = `https:${src}`;
        }
        const damIndex = src.indexOf("/content/dam/");
        if (damIndex !== -1) {
          const q = src.indexOf("?", damIndex);
          if (q !== -1) {
            src = src.slice(0, q);
          }
        }
        if (src !== img.getAttribute("src")) {
          img.setAttribute("src", src);
        }
      });
    }
  }

  // tools/importer/import-content-page.js
  var parsers = {
    "cards-explore": parse5,
    "columns-split": parse4,
    "cards-feature": parse,
    "accordion-cards": parse2,
    "cards-nav": parse3
  };
  var PAGE_TEMPLATE = {
    name: "content-page",
    description: "Interior content page: H1 title on pink banner, intro, feature grid, accordion example cards, where-to-next nav cards.",
    urls: [
      "https://awareinvestments.aware.com.au/investment/what-we-invest-in/infrastructure",
      "https://awareinvestments.aware.com.au/investment/about-us",
      "https://awareinvestments.aware.com.au/investment/about-us/contact-us",
      "https://awareinvestments.aware.com.au/investment/about-us/our-people",
      "https://awareinvestments.aware.com.au/investment/our-investment-approach",
      "https://awareinvestments.aware.com.au/investment/our-investment-approach/investment-strategy",
      "https://awareinvestments.aware.com.au/investment/our-investment-approach/responsible-ownership",
      "https://awareinvestments.aware.com.au/investment/what-we-invest-in",
      "https://awareinvestments.aware.com.au/investment/what-we-invest-in/private-equity",
      "https://awareinvestments.aware.com.au/investment/what-we-invest-in/property",
      "https://awareinvestments.aware.com.au/investment/privacy-uk"
    ],
    blocks: [
      // 3-up "Where to next?" photo cards (image on top) → cards-explore.
      // Target the fixed-grid that holds the top-image tiles.
      { name: "cards-explore", instances: ["div.fixed-grid:has(> div > .contenttile-textimage.contenttile__image-position--top)"] },
      // 50/50 image+text splits (image on right or left) → columns-split.
      { name: "columns-split", instances: ["section.sectioncontainer:has(> div .contenttile-textimage.contenttile__image-position--right)", "section.sectioncontainer:has(> div .contenttile-textimage.contenttile__image-position--left)"] },
      // Feature cards: icon + heading + BODY text (any column count). The body
      // paragraph is what distinguishes feature cards from nav cards.
      { name: "cards-feature", instances: [".flexi-icon-wrapper--card:has(.flexi-icon .body)"] },
      { name: "accordion-cards", instances: [".cmp-accordion.cmp-accordion--default"] },
      // Nav cards: icon + linked heading, NO body text.
      { name: "cards-nav", instances: [".flexi-icon-wrapper--card:not(:has(.flexi-icon .body))"] }
    ]
  };
  var transformers = [
    transform,
    transform3,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements;
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for ${blockDef.name}: ${selector}`);
          return;
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    const filtered = pageBlocks.filter((b, i) => {
      return !pageBlocks.some((other, j) => j !== i && other.name === b.name && other.element !== b.element && other.element.contains(b.element));
    });
    console.log(`Found ${filtered.length} block instances on page`);
    return filtered;
  }
  var import_content_page_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_content_page_exports);
})();
