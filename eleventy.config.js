import path from 'node:path';
import * as sass from 'sass';
import { HtmlBasePlugin } from '@11ty/eleventy';
import { imageSizeFromFile } from 'image-size/fromFile'
import galleryOrder from './_src/_data/galleryOrder.json' with { type: 'json' };

const lightboxPath = './node_modules/lightbox2/dist/';
const lightboxImgPath = lightboxPath + 'images';

export default function (eleventyConfig) {
  /**
   * Global data
   */
  eleventyConfig.addGlobalData('layout', 'template.njk');
  eleventyConfig.addGlobalData('lightboxPath', lightboxPath);
  eleventyConfig.addGlobalData('thisYear', () => new Date().getFullYear());

  /**
   * Collections
   */
  eleventyConfig.addCollection('orderedGalleries', function (collectionsApi) {
    const galleries = collectionsApi.getFilteredByTag('gallery');

    const orderedGalleries = galleries.sort((a, b) => {
      const indexA = galleryOrder.indexOf(a.data.slug || a.fileSlug);
      const indexB = galleryOrder.indexOf(b.data.slug || b.fileSlug);

      // Handle items not in the list (optional, places them at the end)
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return indexA - indexB;
    });

    return orderedGalleries;
  });

  /**
   * Shortcodes
   */
  eleventyConfig.addAsyncShortcode("thumbHTML", async function(photo, fileSlug) {
    const imageURL = path.resolve(`_src`, fileSlug, `thumbs`, `${photo}_thumb.jpg`);
    const {width, height} = await imageSizeFromFile(imageURL);

    const extraClass = width > height ? 'thumb--landscape' : 'thumb--portrait';

    return `<div class="thumb ${extraClass}">
              <a href="./large/${photo}.jpg" class="thumb__link" data-lightbox="antwerp-2004" data-title="${photo}">
                <img src="./thumbs/${photo}_thumb.jpg" class="thumb__img" alt="${photo} Thumbnail" loading="lazy">
              </a>
              <div class="thumb__title">${photo}</div>
            </div>`;
  });

  /**
   * Layout alias
   */
  eleventyConfig.addLayoutAlias('gallery', 'thumb-gallery.njk');

  /**
   * Copy
   */
  eleventyConfig.addPassthroughCopy('**/large');
  eleventyConfig.addPassthroughCopy('**/thumbs');
  // Lightbox button images
  eleventyConfig.addPassthroughCopy({
    [lightboxImgPath]: 'images',
  });

  /**
   * Path prefix. Uses pathPrefix, see returned object below.
   */
  eleventyConfig.addPlugin(HtmlBasePlugin);

  /**
   * Add SCSS
   * @link https://www.11ty.dev/docs/languages/sass/
   */
  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    useLayouts: false,

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);

      if (parsed.name.startsWith('_')) {
        return;
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || '.', this.config.dir.includes],
      });

      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    },
  });

  /**
   * Settings
   */
  return {
    dir: {
      input: '_src',
      output: '_dist',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    pathPrefix: '/easton-rescan/',
  };
}
