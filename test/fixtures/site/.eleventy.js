import mastodonShare from "../../../index.js";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(mastodonShare, {
    siteUrl: "https://example.com",
    emitStylesheetLink: false,
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
