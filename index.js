// index.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULTS = {
  inlineCss: false,
  cssUrlPath: "/assets/masto-share.css",
  jsUrlPath: "/assets/masto-share.js",
  label: "Share on Mastodon",
  fallbackHost: "mastodon.social",

  // --- icon control ---
  // "svg" = use an <img> tag that points at the bundled mastodon.svg
  // "fa"  = render <i class="..."> so you can use Font Awesome (you load FA yourself)
  icon: "svg",
  svgUrlPath: "/assets/mastodon.svg",
  faClass: "fa-brands fa-mastodon",

  // --- instance menu (editable) ---
  instances: ["infosec.exchange", "hachyderm.io", "fosstodon.org", "mastodon.social"],
};

export default function eleventyPluginMastoShare(eleventyConfig, userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };

  // Passthrough CSS/JS always
  eleventyConfig.addPassthroughCopy({
    [path.join(__dirname, "assets", "masto-share.css")]: options.cssUrlPath.replace(/^\//, ""),
    [path.join(__dirname, "assets", "masto-share.js")]: options.jsUrlPath.replace(/^\//, ""),
  });

  // Only copy SVG if icon mode is 'svg'
  if (String(options.icon).toLowerCase() === "svg") {
    eleventyConfig.addPassthroughCopy({
      [path.join(__dirname, "assets", "mastodon.svg")]: options.svgUrlPath.replace(/^\//, ""),
    });
  }

  // Optional inline CSS helper
  eleventyConfig.addShortcode("mastodonShareStyles", () => {
    if (!options.inlineCss) return "";
    const css = fs.readFileSync(path.join(__dirname, "assets", "masto-share.css"), "utf8");
    return `<style id="masto-share-inline">${css}</style>`;
  });

  // Script tag helper
  eleventyConfig.addShortcode("mastodonShareScript", () => {
    return `<script src="${options.jsUrlPath}" defer></script>`;
  });

  // Main shortcode
  eleventyConfig.addNunjucksShortcode("mastodonShare", function (args = {}) {
    // Resolve opts (allow per-call overrides)
    const label = pick(args.label, options.label);
    const fallbackHost = pick(args.fallbackHost, options.fallbackHost);

    const iconMode = (args.icon || options.icon || "svg").toLowerCase();
    const svgUrl = pick(args.svgUrl, options.svgUrlPath);
    const faClass = pick(args.faClass, options.faClass);

    // Instances: allow array override, else plugin default
    const instances = Array.isArray(args.instances) ? args.instances : options.instances;

    // Build query (?text=&hashtags=)
    const text = String(args.text || "");
    const hashtags = Array.isArray(args.hashtags) ? args.hashtags : [];
    let qs = "";
    if (text.length) qs = `?text=${encodeURIComponent(text)}`;
    if (hashtags.length) {
      qs += (qs ? "&" : "?") + `hashtags=${encodeURIComponent(hashtags.join(","))}`;
    }

    // Icon HTML
    const iconHtml = iconMode === "fa"
      ? `<i class="${escapeHtml(faClass)}" aria-hidden="true"></i>`
      : `<img src="${escapeHtml(svgUrl)}" alt="" aria-hidden="true" />`;

    // Instance list HTML (menu)
    const listHtml = (instances || []).map(h => `
      <a href="#" data-masto-host="${escapeHtml(h)}">${escapeHtml(h)}</a>
    `).join("");

    // Compose output
    const html = `
<div class="masto-share"
     data-masto-query="${escapeHtml(qs)}"
     data-masto-fallback="${escapeHtml(fallbackHost)}">
  <a class="button no-indicator"
     data-button-variant="tertiary"
     data-masto-action="primary-share"
     href="https://${escapeHtml(fallbackHost)}/share${escapeHtml(qs)}"
     target="_blank"
     rel="noopener noreferrer"
     aria-label="${escapeHtml(label)}">
    ${iconHtml}
    <span>${escapeHtml(label)}</span>
  </a>

  <div class="masto-share__menu">
    <details>
      <summary class="button" data-ghost-button>
        ${iconHtml}
        <span>Choose instance <small>(current: <em data-masto-current>none</em>)</small></span>
      </summary>
      <div class="masto-share__dropdown" role="menu">
        <ul style="list-style:none; margin:0; padding:0">
          <li class="masto-share__section masto-share__section--saved">
            <a href="#" data-masto-action="use-saved">Use saved instance</a>
            <button type="button" data-masto-action="set-saved">Set / change saved instance…</button>
            <button type="button" data-masto-action="clear-saved">Clear saved instance</button>
          </li>

          <li><hr class="masto-share__divider" /></li>

          <li class="masto-share__section">
            ${listHtml}
          </li>
        </ul>
      </div>
    </details>
  </div>

  <noscript>
    <p>
      <a class="button" data-ghost-button
         href="https://${escapeHtml(fallbackHost)}/share${escapeHtml(qs)}"
         target="_blank" rel="noopener">
        Open on ${escapeHtml(fallbackHost)}
      </a>
    </p>
  </noscript>
</div>
${options.inlineCss ? "" : `<link rel="stylesheet" href="${options.cssUrlPath}">`}
`.trim();

    return html;
  });

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function pick(a, b) {
    return (a !== undefined && a !== null) ? a : b;
  }
}
