// demo/.eleventy.js
import mastodonShare from "../index.js";

export default function (eleventyConfig) {
  const siteUrl = process.env.SITE_URL || "https://your-demo.vercel.app";

  eleventyConfig.addPlugin(mastodonShare, {
    emitStylesheetLink: false,
    label: "Share on Mastodon",
    fallbackHost: "mastodon.social",
    siteUrl,
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
