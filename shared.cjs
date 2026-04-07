const fs = require("node:fs");
const path = require("node:path");

const DEFAULTS = {
  inlineCss: false,
  emitStylesheetLink: true,
  cssUrlPath: "/assets/masto-share.css",
  jsUrlPath: "/assets/masto-share.js",
  siteUrl: "",
  label: "Share on Mastodon",
  pickerLabel: "Choose instance",
  fallbackHost: "mastodon.social",
  storageKey: "mastoPreferredInstance",
  className: "",

  // Icon control:
  // "svg" = use the bundled Mastodon SVG.
  // "fa" = render your Font Awesome icon class.
  icon: "svg",
  svgUrlPath: "/assets/mastodon.svg",
  faClass: "fa-brands fa-mastodon",

  // Popular instances shown in the picker.
  instances: ["infosec.exchange", "hachyderm.io", "fosstodon.org", "mastodon.social"],
};

const STYLE_ASSET_PATH = path.join(__dirname, "assets", "masto-share.css");
const SCRIPT_ASSET_PATH = path.join(__dirname, "assets", "masto-share.js");
const SVG_ASSET_PATH = path.join(__dirname, "assets", "mastodon.svg");

function eleventyPluginMastoShare(eleventyConfig, userOptions = {}) {
  const options = resolvePluginOptions(userOptions);
  let inlineCssCache;
  const renderShareShortcode = function renderShareShortcode(...args) {
    const request = resolveRenderRequest(normalizeShareArgs(args), options, this);
    return renderShareMarkup(request);
  };
  const renderSharePostShortcode = function renderSharePostShortcode(...args) {
    const request = resolveRenderRequest(normalizePostArgs(args), options, this);
    return renderShareMarkup(request);
  };

  eleventyConfig.addPassthroughCopy({
    [STYLE_ASSET_PATH]: toPassthroughTarget(options.cssUrlPath),
    [SCRIPT_ASSET_PATH]: toPassthroughTarget(options.jsUrlPath),
  });

  if (options.icon === "svg") {
    eleventyConfig.addPassthroughCopy({
      [SVG_ASSET_PATH]: toPassthroughTarget(options.svgUrlPath),
    });
  }

  eleventyConfig.addShortcode("mastodonShareStyles", function mastodonShareStyles() {
    if (options.inlineCss) {
      inlineCssCache ??= fs.readFileSync(STYLE_ASSET_PATH, "utf8");
      return `<style id="masto-share-inline">${inlineCssCache}</style>`;
    }

    return `<link rel="stylesheet" href="${escapeHtml(options.cssUrlPath)}">`;
  });

  eleventyConfig.addShortcode("mastodonShareScript", function mastodonShareScript() {
    return `<script src="${escapeHtml(options.jsUrlPath)}" defer></script>`;
  });

  eleventyConfig.addShortcode("mastodonShareAssets", function mastodonShareAssets() {
    const stylesHtml = options.inlineCss
      ? `<style id="masto-share-inline">${inlineCssCache ??= fs.readFileSync(STYLE_ASSET_PATH, "utf8")}</style>`
      : `<link rel="stylesheet" href="${escapeHtml(options.cssUrlPath)}">`;

    return [stylesHtml, `<script src="${escapeHtml(options.jsUrlPath)}" defer></script>`]
      .filter(Boolean)
      .join("\n");
  });

  eleventyConfig.addShortcode("mastodonShare", renderShareShortcode);
  eleventyConfig.addShortcode("mastodonSharePost", renderSharePostShortcode);

  if (typeof eleventyConfig.addNunjucksShortcode === "function") {
    eleventyConfig.addNunjucksShortcode("mastodonShare", renderShareShortcode);
    eleventyConfig.addNunjucksShortcode("mastodonSharePost", renderSharePostShortcode);
  }

  if (typeof eleventyConfig.addJavaScriptFunction === "function") {
    eleventyConfig.addJavaScriptFunction("mastodonShareStyles", function mastodonShareStylesJs() {
      if (options.inlineCss) {
        inlineCssCache ??= fs.readFileSync(STYLE_ASSET_PATH, "utf8");
        return `<style id="masto-share-inline">${inlineCssCache}</style>`;
      }

      return `<link rel="stylesheet" href="${escapeHtml(options.cssUrlPath)}">`;
    });

    eleventyConfig.addJavaScriptFunction("mastodonShareScript", function mastodonShareScriptJs() {
      return `<script src="${escapeHtml(options.jsUrlPath)}" defer></script>`;
    });

    eleventyConfig.addJavaScriptFunction("mastodonShareAssets", function mastodonShareAssetsJs() {
      const stylesHtml = options.inlineCss
        ? `<style id="masto-share-inline">${inlineCssCache ??= fs.readFileSync(STYLE_ASSET_PATH, "utf8")}</style>`
        : `<link rel="stylesheet" href="${escapeHtml(options.cssUrlPath)}">`;

      return [stylesHtml, `<script src="${escapeHtml(options.jsUrlPath)}" defer></script>`]
        .filter(Boolean)
        .join("\n");
    });

    eleventyConfig.addJavaScriptFunction("mastodonShare", renderShareShortcode);
    eleventyConfig.addJavaScriptFunction("mastodonSharePost", renderSharePostShortcode);
  }
}

function resolvePluginOptions(userOptions) {
  const merged = {
    ...DEFAULTS,
    ...cleanKeywordObject(userOptions),
  };

  return {
    ...merged,
    icon: String(merged.icon || DEFAULTS.icon).toLowerCase() === "fa" ? "fa" : "svg",
    instances: normalizeInstances(merged.instances),
    fallbackHost: normalizeHost(merged.fallbackHost) || DEFAULTS.fallbackHost,
    storageKey: String(merged.storageKey || DEFAULTS.storageKey).trim() || DEFAULTS.storageKey,
    siteUrl: typeof merged.siteUrl === "string" ? merged.siteUrl.trim() : "",
    className: typeof merged.className === "string" ? merged.className.trim() : "",
    emitStylesheetLink: Boolean(merged.emitStylesheetLink),
  };
}

function normalizeShareArgs(args) {
  if (args.length === 1 && isPlainObject(args[0])) {
    return cleanKeywordObject(args[0]);
  }

  const [text = "", hashtags = [], overrides = {}] = args;
  return {
    ...cleanKeywordObject(overrides),
    text,
    hashtags,
  };
}

function normalizePostArgs(args) {
  if (args.length === 1 && isPlainObject(args[0])) {
    return cleanKeywordObject(args[0]);
  }

  const [title = "", maybeDescription = "", maybeHashtags = [], maybeOverrides = {}] = args;

  if (isPlainObject(maybeDescription)) {
    return {
      ...cleanKeywordObject(maybeDescription),
      title,
      description: "",
      hashtags: [],
    };
  }

  if (Array.isArray(maybeDescription)) {
    return {
      ...cleanKeywordObject(maybeHashtags),
      title,
      description: "",
      hashtags: maybeDescription,
    };
  }

  if (isPlainObject(maybeHashtags)) {
    return {
      ...cleanKeywordObject(maybeHashtags),
      title,
      description: maybeDescription,
      hashtags: [],
    };
  }

  return {
    ...cleanKeywordObject(maybeOverrides),
    title,
    description: maybeDescription,
    hashtags: maybeHashtags,
  };
}

function resolveRenderRequest(input, pluginOptions, context) {
  const request = cleanKeywordObject(input);
  const hashtags = normalizeHashtags(request.hashtags ?? context?.ctx?.mastodon_hashtags ?? []);
  const instances = request.instances === undefined
    ? pluginOptions.instances
    : normalizeInstances(request.instances);

  const resolvedUrl = resolveShareUrl(
    request.url ?? request.pageUrl ?? context?.page?.url ?? "",
    request.siteUrl ?? pluginOptions.siteUrl,
  );

  const title = toStringValue(request.title ?? context?.ctx?.title ?? "");
  const description = toStringValue(request.description ?? context?.ctx?.description ?? "");
  const pickerLabel = pick(request.pickerLabel, pluginOptions.pickerLabel);
  const fallbackHost = normalizeHost(request.fallbackHost) || pluginOptions.fallbackHost;
  const storageKey = toStringValue(request.storageKey ?? pluginOptions.storageKey).trim() || pluginOptions.storageKey;
  const className = toStringValue(request.className ?? pluginOptions.className).trim();

  const hasExplicitText = Object.hasOwn(request, "text");
  const text = hasExplicitText
    ? toStringValue(request.text)
    : composeShareText({
        title,
        description,
        url: resolvedUrl,
      });

  return {
    label: toStringValue(request.label ?? pluginOptions.label) || pluginOptions.label,
    pickerLabel: toStringValue(pickerLabel) || pluginOptions.pickerLabel,
    fallbackHost,
    storageKey,
    className,
    icon: normalizeIcon(request.icon ?? pluginOptions.icon),
    svgUrlPath: toStringValue(request.svgUrl ?? request.svgUrlPath ?? pluginOptions.svgUrlPath) || pluginOptions.svgUrlPath,
    faClass: toStringValue(request.faClass ?? pluginOptions.faClass) || pluginOptions.faClass,
    hashtags,
    instances,
    text,
    query: buildShareQuery(text, hashtags),
    cssUrlPath: pluginOptions.cssUrlPath,
    inlineCss: pluginOptions.inlineCss,
    emitStylesheetLink: pluginOptions.emitStylesheetLink,
  };
}

function renderShareMarkup(request) {
  const iconHtml = request.icon === "fa"
    ? `<i class="${escapeHtml(request.faClass)}" aria-hidden="true"></i>`
    : `<img src="${escapeHtml(request.svgUrlPath)}" alt="" aria-hidden="true" />`;

  const rootClasses = ["masto-share"];
  if (request.className) {
    rootClasses.push(request.className);
  }

  const popularInstancesHtml = request.instances.length > 0
    ? `
          <li><hr class="masto-share__divider" /></li>
          <li class="masto-share__section">
            <p class="masto-share__eyebrow">Popular instances</p>
            <div class="masto-share__instance-list" role="list">
              ${request.instances.map((host) => `
                <div class="masto-share__instance" role="listitem">
                  <button type="button"
                          class="masto-share__menu-button"
                          data-masto-host="${escapeHtml(host)}">
                    ${escapeHtml(host)}
                  </button>
                  <button type="button"
                          class="masto-share__save-button"
                          data-masto-save-host="${escapeHtml(host)}"
                          aria-label="Save ${escapeHtml(host)} as your preferred Mastodon instance">
                    Save
                  </button>
                </div>
              `).join("")}
            </div>
          </li>`
    : "";

  const stylesheetHtml = !request.inlineCss && request.emitStylesheetLink
    ? `<link rel="stylesheet" href="${escapeHtml(request.cssUrlPath)}">`
    : "";

  return `
<div class="${escapeHtml(rootClasses.join(" "))}"
     data-masto-query="${escapeHtml(request.query)}"
     data-masto-fallback="${escapeHtml(request.fallbackHost)}"
     data-masto-storage-key="${escapeHtml(request.storageKey)}">
  <a class="masto-share__button masto-share__button--primary"
     data-masto-action="primary-share"
     href="https://${escapeHtml(request.fallbackHost)}/share${escapeHtml(request.query)}"
     target="_blank"
     rel="noopener noreferrer"
     aria-label="${escapeHtml(request.label)}">
    ${iconHtml}
    <span>${escapeHtml(request.label)}</span>
  </a>

  <div class="masto-share__menu">
    <details>
      <summary class="masto-share__button masto-share__button--secondary">
        ${iconHtml}
        <span>${escapeHtml(request.pickerLabel)} <small>(saved: <em data-masto-current>none</em>)</small></span>
      </summary>
      <div class="masto-share__dropdown">
        <ul class="masto-share__sections">
          <li class="masto-share__section">
            <p class="masto-share__eyebrow">Preferred instance</p>
            <button type="button" class="masto-share__menu-button" data-masto-action="use-saved">
              Use saved instance
            </button>
            <button type="button" class="masto-share__menu-button" data-masto-action="set-saved">
              Set or change saved instance...
            </button>
            <button type="button" class="masto-share__menu-button" data-masto-action="clear-saved">
              Clear saved instance
            </button>
          </li>
          ${popularInstancesHtml}
        </ul>
      </div>
    </details>
  </div>

  <p class="masto-share__sr-only" data-masto-status aria-live="polite"></p>

  <noscript>
    <p>
      <a class="masto-share__button masto-share__button--secondary"
         href="https://${escapeHtml(request.fallbackHost)}/share${escapeHtml(request.query)}"
         target="_blank"
         rel="noopener noreferrer">
        Open on ${escapeHtml(request.fallbackHost)}
      </a>
    </p>
  </noscript>
</div>
${stylesheetHtml}
`.trim();
}

function composeShareText({ title = "", description = "", url = "" }) {
  const headline = [title, description].filter(Boolean).join(" - ");
  return [headline, url].filter(Boolean).join("\n\n");
}

function buildShareQuery(text, hashtags) {
  const params = new URLSearchParams();

  if (text) {
    params.set("text", text);
  }

  if (hashtags.length > 0) {
    params.set("hashtags", hashtags.join(","));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function resolveShareUrl(url, siteUrl) {
  const value = toStringValue(url).trim();
  if (!value) {
    return "";
  }

  try {
    return new URL(value).toString();
  } catch {
    if (!siteUrl) {
      return value;
    }
  }

  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return value;
  }
}

function normalizeHashtags(value) {
  if (Array.isArray(value)) {
    return dedupeList(value.map(stripLeadingHash).map(toStringValue).map((tag) => tag.trim()).filter(Boolean));
  }

  if (typeof value === "string") {
    return dedupeList(
      value
        .split(/[,\s]+/)
        .map(stripLeadingHash)
        .map((tag) => tag.trim())
        .filter(Boolean),
    );
  }

  return [];
}

function normalizeInstances(value) {
  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\n]+/)
      : [];

  return dedupeList(
    items
      .map((entry) => normalizeHost(entry))
      .filter(Boolean),
  );
}

function normalizeHost(value) {
  const input = toStringValue(value).trim();
  if (!input) {
    return "";
  }

  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    return url.hostname.toLowerCase();
  } catch {
    return input
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .trim()
      .toLowerCase();
  }
}

function normalizeIcon(value) {
  return String(value || "").toLowerCase() === "fa" ? "fa" : "svg";
}

function cleanKeywordObject(value) {
  if (!isPlainObject(value)) {
    return {};
  }

  const { __keywords, ...rest } = value;
  return rest;
}

function dedupeList(items) {
  return [...new Set(items)];
}

function pick(value, fallback) {
  return value !== undefined && value !== null ? value : fallback;
}

function toStringValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

function stripLeadingHash(value) {
  return toStringValue(value).replace(/^#+/, "");
}

function toPassthroughTarget(urlPath) {
  return toStringValue(urlPath).replace(/^\/+/, "");
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

module.exports = eleventyPluginMastoShare;
module.exports.default = eleventyPluginMastoShare;
