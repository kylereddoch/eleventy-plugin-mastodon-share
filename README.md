# eleventy-plugin-mastodon-share

[![npm version](https://img.shields.io/npm/v/@kylereddoch/eleventy-plugin-mastodon-share?color=%23cba6f7)](https://www.npmjs.com/package/@kylereddoch/eleventy-plugin-mastodon-share)
[![eleventy](https://img.shields.io/badge/eleventy-%5E3.0-000000.svg?logo=eleventy&logoColor=white)](https://www.11ty.dev/)
[![license](https://img.shields.io/badge/license-MIT-2ea44f.svg)](#license)
[![CI](https://img.shields.io/badge/CI-github--actions-inactive)](#contributing)

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-NETLIFY-BADGE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-NETLIFY-SITE-NAME/deploys)

A drop-in Eleventy plugin that adds a **Share on Mastodon** button and a small **instance picker** with an optional **remember my instance** feature. Works with Nunjucks, Liquid, and JS templates.

- One line in your layout to render the button  
- Uses `https://<instance>/share?...` URLs for broad compatibility  
- Optional instance menu with “use saved instance” and popular servers  
- Ships tiny CSS and a ready SVG icon or you can use Font Awesome  

---

## Table of contents

- [eleventy-plugin-mastodon-share](#eleventy-plugin-mastodon-share)
  - [Table of contents](#table-of-contents)
  - [Install](#install)
  - [Quick start](#quick-start)
  - [Demo](#demo)
    - [▶️ One-click Deploy (Netlify)](#️-one-click-deploy-netlify)
    - [💻 Run the demo locally](#-run-the-demo-locally)
  - [Options](#options)
  - [Usage examples](#usage-examples)
    - [Nunjucks](#nunjucks)
    - [Liquid](#liquid)
    - [JS template](#js-template)
  - [Styling](#styling)
  - [Customizing instances](#customizing-instances)
    - [Global defaults](#global-defaults)
    - [Per-usage override](#per-usage-override)
  - [Using Font Awesome instead of the SVG](#using-font-awesome-instead-of-the-svg)
  - [Hashtags and share text composition](#hashtags-and-share-text-composition)
  - [Accessibility notes](#accessibility-notes)
  - [Troubleshooting](#troubleshooting)
  - [Contributing](#contributing)
  - [License](#license)

---

## Install

```bash
npm i @kylereddoch/eleventy-plugin-mastodon-share
```

Register the plugin in your Eleventy config:

```js
// .eleventy.js
import mastodonShare from "@kylereddoch/eleventy-plugin-mastodon-share";

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(mastodonShare, {
    // All options are optional. See the Options section for full list.
  });
}
```

Add the script once in your base layout footer:

```njk
{% mastodonShareScript %}
```

If you do not plan to inline CSS, either use the default linked stylesheet that the shortcode emits or include it yourself. See Styling.

---

## Quick start

In your post layout (for example `post.njk`):

```njk
{# Build the text you want in the Mastodon composer #}
{% set fullUrl  = page.url | url | absoluteUrl(meta.url) %}
{% set hashtags = mastodon_hashtags | default([]) %}

{% set tagsInline = "" %}
{% if (hashtags | length) > 0 %}
  {% set tagsInline = "\n\n#" ~ (hashtags | join(' #')) %}
{% endif %}

{% set text = (title ~ " — " ~ (description or "")) ~ "\n\n" ~ fullUrl ~ tagsInline %}

{# Render the button + menu #}
{% mastodonShare text=text hashtags=hashtags %}
```

Front matter example:

```yaml
mastodon_hashtags: [cybersecurity, windows, wsus, patching]
```

---

## Demo

See it in action:

- **Live demo:** https://YOUR-DEMO-DOMAIN.example.com
- **Source code:** `demo/` folder in this repo

Want your own copy of the demo? Spin up a working example to see the plugin in action.

### ▶️ One-click Deploy (Netlify)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kylereddoch/eleventy-plugin-mastodon-share&projectName=eleventy-plugin-mastodon-share-demo&message=Deploy%20demo&stack=cms)

This deploys the included `demo/` Eleventy site:

- Build command: `npm run build` (from `demo/`)
- Publish directory: `demo/dist`
- Node: uses Netlify defaults (override in your site settings if needed)

> Netlify will ask for repo access, fork the repo to your account, and create a site from the `demo/` folder using the provided `netlify.toml`.

### 💻 Run the demo locally

```bash
# from the repo root
cd demo
npm install
npm run dev
```

Set your canonical URL in  `demo/src/_data/site.js:`

```js
export default {
  url: "https://your-demo-site.netlify.app",
};
```

---

## Options

Pass options globally in `.eleventy.js`. All are optional.

| Option          | Type        | Default                                         | Purpose |
|-----------------|-------------|-------------------------------------------------|---------|
| `label`         | `string`    | `"Share on Mastodon"`                           | Button text |
| `fallbackHost`  | `string`    | `"mastodon.social"`                             | Used for the primary href and the noscript fallback |
| `instances`     | `string[]`  | `["infosec.exchange","hachyderm.io","fosstodon.org","mastodon.social"]` | Items in the “Choose instance” menu |
| `icon`          | `string`    | `"svg"`                                         | `"svg"` to use the bundled SVG, `"fa"` to use Font Awesome |
| `svgUrlPath`    | `string`    | `"/assets/mastodon.svg"`                        | Path where the bundled SVG will be copied (only when `icon: "svg"`) |
| `faClass`       | `string`    | `"fa-brands fa-mastodon"`                       | Class for your FA icon when `icon: "fa"` |
| `inlineCss`     | `boolean`   | `false`                                         | Inline the component CSS via a `<style>` tag |
| `cssUrlPath`    | `string`    | `"/assets/masto-share.css"`                     | Where the plugin copies its CSS file |
| `jsUrlPath`     | `string`    | `"/assets/masto-share.js"`                      | Where the plugin copies its JS file |

Per-usage overrides are supported by passing the same keys to the shortcode:

```njk
{% mastodonShare
  text=text
  hashtags=hashtags
  label="Boost this"
  fallbackHost="fosstodon.org"
  instances=["infosec.exchange","hachyderm.io","fosstodon.org"]
  icon="fa"
  faClass="fa-brands fa-mastodon"
%}
```

---

## Usage examples

### Nunjucks

```njk
{% mastodonShare text="Hello Fediverse!" hashtags=["eleventy","mastodon"] %}
```

### Liquid

```liquid
{% mastodonShare text: post.data.title, hashtags: post.data.mastodon_hashtags %}
```

### JS template

```js
// inside a JS template file
const { mastodonShare } = eleventyConfig.javascriptFunctions;
mastodonShare({
  text: `${data.title}\n\n${absoluteUrl(data.page.url, data.site.url)}`,
  hashtags: data.mastodon_hashtags || []
});
```

---

## Styling

The shortcode appends a `<link rel="stylesheet">` to the plugin CSS unless you set `inlineCss: true`.

- To inline CSS: add `{% mastodonShareStyles %}` in your `<head>` and set `inlineCss: true`.
- To own styles: set `inlineCss: false` and copy the plugin CSS into your theme, then omit the link tag the shortcode emits by removing it from the returned HTML if you fork. The component root is `.masto-share`. The main button uses your existing `.button` utility.

Example tweaks:

```css
/* Larger icon inside this component only */
.masto-share .button img,
.masto-share .button i.fa-brands {
  width: 1.25em;
  height: 1.25em;
  vertical-align: middle;
}

/* Tighten label spacing */
.masto-share .button { --button-gap: .25rem; }

/* Dropdown panel chrome */
.masto-share__dropdown {
  border: 1px solid color-mix(in oklab, var(--color-text) 20%, transparent);
  border-radius: .5rem;
  padding: .25rem;
}
```

---

## Customizing instances

Pick your path.

### Global defaults

```js
eleventyConfig.addPlugin(mastodonShare, {
  instances: ["infosec.exchange","fosstodon.org","your.instance.tld"]
});
```

### Per-usage override

```njk
{% mastodonShare text=text hashtags=hashtags instances=["your.instance","another.instance"] %}
```

---

## Using Font Awesome instead of the SVG

Prefer the FA icon:

1. Load Font Awesome yourself (kit, CDN, or self hosted).
2. Set globally:

```js
eleventyConfig.addPlugin(mastodonShare, { icon: "fa", faClass: "fa-brands fa-mastodon" });
```

Or per-usage:

```njk
{% mastodonShare text=text icon="fa" faClass="fa-brands fa-mastodon" %}
```

If you set `icon: "svg"`, the plugin will copy `mastodon.svg` to `svgUrlPath` and render an `<img>`.

---

## Hashtags and share text composition

You control the final body text. The plugin passes `text` and `hashtags` to the share URL and preserves your line breaks.

Pattern used in the examples:

```njk
{% set fullUrl  = page.url | url | absoluteUrl(meta.url) %}
{% set hashtags = mastodon_hashtags | default([]) %}

{% set tagsInline = "" %}
{% if (hashtags | length) > 0 %}
  {% set tagsInline = "\n\n#" ~ (hashtags | join(' #')) %}
{% endif %}

{% set text = (title ~ " — " ~ (description or "")) ~ "\n\n" ~ fullUrl ~ tagsInline %}
{% mastodonShare text=text hashtags=hashtags %}
```

---

## Accessibility notes

- The button includes an `aria-label` that mirrors `label`.
- The menu uses native `<details>` with `<summary>` for keyboard and screen reader support.
- The remember feature stores a hostname string in `localStorage`. No PII.

---

## Troubleshooting

**The picker asks me twice**  
Make sure you include the script only once. Use `{% mastodonShareScript %}` a single time in your base layout.

**Changed instances are not reflected**  
If you edit the `instances` option in `.eleventy.js`, restart the dev server. Clear cache if you inlined CSS or changed asset paths.

**Nunjucks “parseAggregate” or “expected block end”**  
These usually come from CSS comments inside Nunjucks blocks or a `{% set %}` line with mismatched braces. Keep comments inside `{# … #}` or in CSS files.

---

## Contributing

Contributions are welcome.

1. **Fork** and create a branch  
   ```bash
   git checkout -b feat/my-improvement
   ```
2. **Install** and run the demo  
   ```bash
   npm i
   npm run dev
   ```
3. **Code style**  
   - Keep the public API simple and documented  
   - Avoid heavy dependencies  
   - Progressive enhancement first
4. **Commit messages**  
   Conventional commits are appreciated
5. **Open a PR**  
   Explain the change, include before and after screenshots for UI changes

Security issues: please open a private report.

---

## License

MIT © Kyle Reddoch
