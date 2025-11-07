// demo/.eleventy.js
import mastodonShare from "../index.js";

export default function (eleventyConfig) {
  // Register plugin from the repo root (no npm publish needed for the demo)
  eleventyConfig.addPlugin(mastodonShare, {
    inlineCss: true,                 // exposes {% mastodonShareStyles %}
    cssUrlPath: "/assets/masto-share.css",
    jsUrlPath: "/assets/masto-share.js",
    svgUrlPath: "/assets/mastodon.svg",
    label: "Share on Mastodon",
    fallbackHost: "mastodon.social"
  });

  // Only passthrough *demo* assets, not plugin assets (plugin handles its own)
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
