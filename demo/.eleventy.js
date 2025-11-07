import path from "node:path";
import { fileURLToPath } from "node:url";

// Import the plugin from the repo root (one level up)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginPath = path.resolve(__dirname, "../index.js");
const { default: mastodonShare } = await import(pluginPath);

export default function(eleventyConfig) {
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    if (!url) return base || "/";
    try { return new URL(url, base).toString(); }
    catch { return url; }
  });

  eleventyConfig.addPlugin(mastodonShare, {
    label: "Share on Mastodon",
    fallbackHost: "mastodon.social",
    inlineCss: false
  });

  // Explicit passthroughs for demo clarity
  eleventyConfig.addPassthroughCopy({ "../assets/masto-share.css": "assets/masto-share.css" });
  eleventyConfig.addPassthroughCopy({ "../assets/masto-share.js": "assets/masto-share.js" });
  eleventyConfig.addPassthroughCopy({ "../assets/mastodon.svg": "assets/mastodon.svg" });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
