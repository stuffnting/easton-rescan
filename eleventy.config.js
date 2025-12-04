import path from 'node:path';
import * as sass from 'sass';
import { HtmlBasePlugin } from '@11ty/eleventy';

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

    const orderMap = galleries[0].data.galleryOrder;

    galleries.sort((itemA, itemB) => {
      const orderA = orderMap[itemA.fileSlug];
      const orderB = orderMap[itemB.fileSlug];

      return orderA - orderB;
    });

    return galleries;
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
