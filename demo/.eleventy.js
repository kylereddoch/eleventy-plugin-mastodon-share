import path from "node:path";
import { fileURLToPath } from "node:url";

// Import the plugin from the repo root (one level up)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginPath = path.resolve(__dirname, "../index.js");
const { default: mastodonShare } = await import(pluginPath);

export default function (eleventyConfig) {
  eleventyConfig.addFilter("absoluteUrl", (url, base) => {
    if (!url) return base || "/";
    try { return new URL(url, base).toString(); }
    catch { return url; }
  });

  // Register the plugin *before* anything that might call the shortcodes
  eleventyConfig.addPlugin(mastodonShare, {
    // makes {{ mastodonShareStyles() }} output an inline <style>
    inlineCss: true,
    // output URLs for the assets (plugin will passthrough-copy them)
    cssUrlPath: "/assets/masto-share.css",
    jsUrlPath: "/assets/masto-share.js",
    svgUrlPath: "/assets/mastodon.svg",
    // optional label/fallback tweaks if you want
    label: "Share on Mastodon",
    fallbackHost: "mastodon.social",
  });

  return {
    dir: { input: "src", output: "dist", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}
