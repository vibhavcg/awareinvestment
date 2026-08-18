/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Aware Investments site-wide cleanup.
 *
 * Removes non-authorable AEM site chrome (header/top-nav, footer, breadcrumb +
 * page-utility bar) and strips AEM editor/analytics attributes so only authored
 * page content survives the import. Section boundaries (main > .aem-Grid >
 * section.sectioncontainer) are intentionally preserved for the sectioning logic.
 *
 * ALL selectors verified by reading:
 *   migration-work/landing-page/cleaned.html
 *   migration-work/content-page/cleaned.html
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // --- Skip-to-main-content link + its clientlib css (both templates, lines 2-5) ---
      '.cmp-page__skiptomaincontent',
      'link',

      // --- Site header / top navigation (both templates, line 9 header.headercontainer,
      //     line 51/53 #aware-top-navigation, cookie/notification/meganav experiencefragments live inside) ---
      'header.headercontainer',
      '#aware-top-navigation',

      // --- Footer + its footer experiencefragment (both templates, line 1171/1405) ---
      'footer.footercontainer',
      '.cmp-experiencefragment--footer',

      // --- Site-wide notification / cookie / unsupported-browser chrome ---
      //     These experience-fragment banners render outside header/footer and
      //     leaked into imported content ("You seem to be using an unsupported
      //     browser", cookie consent, sitewide notification). All non-authorable. ---
      '.browser-popup',
      '.cmp-experiencefragment--investments-notification',
      '.cmp-experiencefragment--uk-site-cookie',
      '.cmp-experiencefragment--uk-sitewide-notification',
      '.cmp-experiencefragment--uk-site-notification',
      'div.cookie',
      'div.notification',

      // --- Content-page breadcrumb + page-utility (text-size/print/share) bar ---
      //     content-page cleaned.html: nav#breadcrumb-* .cmp-breadcrumb (line 870),
      //     wrapper .breadcrumb (line 869), utility cluster .sharing (line 896) ---
      'nav.cmp-breadcrumb',
      '.breadcrumb',
      '.sharing',

      // --- Safe non-authorable leaf elements ---
      'iframe',
      'noscript',
    ]);

    // --- Strip AEM editor / analytics / component attributes from every element.
    //     Verified present: data-cmp-data-layer-enabled (body). The rest are
    //     defensively removed in case interior nodes carry them on other pages. ---
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const name = attr.name;
        if (
          name.startsWith('data-cmp-')
          || name === 'data-tracking'
          || name === 'data-component'
          || name === 'data-icon-blocks'
          || name === 'data-cmp-data-layer'
          || name === 'data-cmp-data-layer-enabled'
        ) {
          el.removeAttribute(name);
        }
      });
    });

    // --- Remove sr-only helper spans (e.g. <span class="sr-only">true</span> inside
    //     cmp-image wrappers) that are not authorable content. ---
    WebImporter.DOMUtils.remove(element, ['span.sr-only']);
  }
}
