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
  // A shortcode is used here because data is supplied by the image-size package
  eleventyConfig.addAsyncShortcode("landPortClass", async function(photo, filePathStem) {

    const gallery = path.basename(path.dirname(filePathStem));

    // Thumb and large image have same aspect ratio, so no need to specify. Here large is used.
    const imageURL = path.resolve(`_src`, gallery, `large`, `${photo}.jpg`);
    
    const {width, height} = await imageSizeFromFile(imageURL);
    const extraClass = width > height ? 'landscape' : 'portrait';

    return extraClass;
  });

  eleventyConfig.addAsyncShortcode("emailLink", async function(linkText) {
    return `<span class="email" data-link-text="${linkText}"></span>`;
  });

  /**
   * Layout alias
   */
  eleventyConfig.addLayoutAlias('gallery', 'thumb-gallery.njk');
  eleventyConfig.addLayoutAlias('slides', 'slide-page.njk');

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
