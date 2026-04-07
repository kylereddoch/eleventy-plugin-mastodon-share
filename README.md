# eleventy-plugin-mastodon-share

[![npm version](https://img.shields.io/npm/v/@kylereddoch/eleventy-plugin-mastodon-share)](https://www.npmjs.com/package/@kylereddoch/eleventy-plugin-mastodon-share)
[![Eleventy](https://img.shields.io/badge/Eleventy-3.x-222222?logo=eleventy&logoColor=white)](https://www.11ty.dev/)
[![License](https://img.shields.io/badge/license-MIT-2ea44f.svg)](#license)

A simple Eleventy plugin that helps readers share your posts to Mastodon without forcing them to manually edit instance URLs.

It adds a share button, an instance picker, a saved-instance flow, and shortcode helpers so Eleventy users can drop it into a site without rewriting the same markup for every post.

## What It Does

- Adds a Mastodon share button for Eleventy sites
- Lets visitors enter their own Mastodon instance
- Offers a list of popular instances
- Lets visitors save a preferred instance for future shares
- Provides shortcodes for Nunjucks, Liquid, and Eleventy JavaScript templates
- Ships with its own styles and front-end behavior

## Why Use It

Mastodon sharing is not as straightforward as networks with one global share endpoint. Readers need a server, and site authors usually end up rebuilding the same UI and logic from scratch.

This plugin gives Eleventy users a reusable solution that feels native to static sites and keeps setup light.

## Requirements

- Node.js `18+`
- Eleventy `3.x`

## Install

```bash
npm install @kylereddoch/eleventy-plugin-mastodon-share
```

## Quick Start

Register the plugin in your Eleventy config:

```js
import mastodonShare from "@kylereddoch/eleventy-plugin-mastodon-share";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(mastodonShare, {
    siteUrl: "https://example.com",
    emitStylesheetLink: false,
  });
}
```

If your Eleventy config is CommonJS:

```js
const mastodonShare = require("@kylereddoch/eleventy-plugin-mastodon-share");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(mastodonShare, {
    siteUrl: "https://example.com",
    emitStylesheetLink: false,
  });
};
```

Load the plugin assets once in your base layout:

```njk
<head>
  {% mastodonShareAssets %}
</head>
```

Render the share UI in your post layout:

```njk
{% mastodonSharePost title=title, description=description, hashtags=mastodon_hashtags %}
```

Front matter example:

```yaml
mastodon_hashtags:
  - eleventy
  - mastodon
  - fediverse
```

## How Visitors Use It

With JavaScript enabled:

1. Clicking the main button opens the visitor's saved instance, if they already chose one.
2. If they have not saved one yet, they are prompted for an instance host.
3. The dropdown lets them choose or save from a list of popular instances.
4. Their preferred instance is stored locally in the browser.

Without JavaScript:

- the button falls back to your configured `fallbackHost`

## Shortcodes

The plugin includes five helpers:

| Shortcode | Purpose |
| --- | --- |
| `mastodonShare` | Render the share UI with custom text you provide |
| `mastodonSharePost` | Render the share UI and build the share text from page data |
| `mastodonShareStyles` | Output the plugin stylesheet |
| `mastodonShareScript` | Output the plugin script |
| `mastodonShareAssets` | Output both stylesheet and script |

### `mastodonShare`

Use this when you want full control over the share text:

```njk
{% mastodonShare text="Read this post on Eleventy and Mastodon.", hashtags=mastodon_hashtags %}
```

### `mastodonSharePost`

Use this when you want the plugin to build the share text from your content metadata:

```njk
{% mastodonSharePost title=title, description=description, hashtags=mastodon_hashtags %}
```

If you provide `siteUrl` in your plugin config, the plugin uses `page.url` to build a full URL automatically.

## Template Examples

### Nunjucks

Use named arguments, separated with commas:

```njk
{% mastodonSharePost title=title, description=description, hashtags=mastodon_hashtags %}
```

### Liquid

Use positional arguments:

```liquid
{% mastodonSharePost title, description, mastodon_hashtags %}
```

### Eleventy JavaScript Templates

```js
export default class PostPage {
  data() {
    return {
      permalink: "posts/example/index.html",
      title: "Example Post",
      description: "A post rendered from a JavaScript template.",
      mastodon_hashtags: ["eleventy", "javascript"],
    };
  }

  render(data) {
    return [
      this.mastodonShareStyles(),
      this.mastodonSharePost({
        title: data.title,
        description: data.description,
        hashtags: data.mastodon_hashtags,
      }),
      this.mastodonShareScript(),
    ].join("\n");
  }
}
```

## Configuration

All options are optional.

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `siteUrl` | `string` | `""` | Base URL used to build full canonical URLs |
| `label` | `string` | `"Share on Mastodon"` | Main button label |
| `pickerLabel` | `string` | `"Choose instance"` | Dropdown trigger label |
| `fallbackHost` | `string` | `"mastodon.social"` | No-JS fallback and first prompt suggestion |
| `instances` | `string[]` | default popular list | Instances shown in the picker |
| `storageKey` | `string` | `"mastoPreferredInstance"` | Browser storage key |
| `className` | `string` | `""` | Extra class added to the root element |
| `inlineCss` | `boolean` | `false` | Inline CSS instead of linking it |
| `emitStylesheetLink` | `boolean` | `true` | Prevent duplicate stylesheet output when assets are loaded globally |
| `cssUrlPath` | `string` | `"/assets/masto-share.css"` | Public stylesheet path |
| `jsUrlPath` | `string` | `"/assets/masto-share.js"` | Public script path |
| `icon` | `"svg" \| "fa"` | `"svg"` | Bundled SVG or Font Awesome |
| `svgUrlPath` | `string` | `"/assets/mastodon.svg"` | Public SVG path |
| `faClass` | `string` | `"fa-brands fa-mastodon"` | Font Awesome class |

Example:

```js
import mastodonShare from "@kylereddoch/eleventy-plugin-mastodon-share";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(mastodonShare, {
    siteUrl: "https://example.com",
    emitStylesheetLink: false,
    label: "Boost this post",
    pickerLabel: "Choose your server",
    fallbackHost: "fosstodon.org",
    instances: [
      "hachyderm.io",
      "fosstodon.org",
      "mastodon.social",
      "infosec.exchange",
    ],
  });
}
```

## Styling

The plugin ships with self-contained default styles so it works out of the box.

The root class is `.masto-share`.

Useful CSS variables:

```css
.masto-share {
  --masto-share-accent: #0f62fe;
  --masto-share-accent-hover: #0043ce;
  --masto-share-border: #d0d7de;
  --masto-share-surface: #ffffff;
  --masto-share-surface-muted: #f6f8fa;
  --masto-share-text: #18212f;
  --masto-share-text-muted: #5f6c80;
  --masto-share-radius: 0.85rem;
}
```

If your site already uses Font Awesome:

```js
eleventyConfig.addPlugin(mastodonShare, {
  icon: "fa",
  faClass: "fa-brands fa-mastodon",
});
```

## Demo

This repository includes a working demo site in [`demo/`](./demo).

Run it locally:

```bash
cd demo
npm install
npm run dev
```

If you want the demo to build full canonical links, set `SITE_URL` before running it.

## Accessibility and Privacy

- Uses a keyboard-friendly `<details>` based instance menu
- Includes live status messaging for saved-instance actions
- Stores only the preferred Mastodon host in `localStorage`
- Does not collect personal data

## Troubleshooting

### The button has no styling

If you set `emitStylesheetLink: false`, make sure you loaded either:

- `mastodonShareStyles`
- `mastodonShareAssets`

### The shared URL is relative instead of absolute

Set `siteUrl` in the plugin config so the plugin can combine it with `page.url`.

### My Nunjucks shortcode will not parse

Named arguments in Nunjucks shortcodes need commas:

```njk
{% mastodonSharePost title=title, description=description, hashtags=mastodon_hashtags %}
```

### I only want one stylesheet tag on the page

Set `emitStylesheetLink: false` and load assets once in your layout with `mastodonShareStyles` or `mastodonShareAssets`.

## Contributing

Contributions are welcome.

If you want to help:

- open an issue for bugs or feature ideas
- submit a pull request with a clear description of the change
- update docs when the public API changes
- add or adjust tests when behavior changes

See [CONTRIBUTING.md](./CONTRIBUTING.md) for a quick contributor guide.
For maintainers and release notes, see [RELEASING.md](./RELEASING.md).

## Development

Install dependencies:

```bash
npm install
npm --prefix demo install
```

Run verification:

```bash
npm run verify
```

The automated checks currently cover:

- Nunjucks
- Liquid
- Eleventy JavaScript templates
- CommonJS package loading
- ESM package loading

## Support

If this project helps you, here are a few great ways to support it:

- star the repository
- share the plugin with other Eleventy users
- open issues when something can be improved
- contribute fixes, docs, or examples
- sponsor the project if you want to support ongoing maintenance

Sponsor links:

- [GitHub Sponsors](https://github.com/sponsors/kylereddoch)
- [Ko-fi](https://ko-fi.com/kylereddoch)
- [Buy Me a Coffee](https://buymeacoffee.com/kylereddoch)

There is also a short support guide in [SUPPORT.md](./SUPPORT.md).

## License

MIT
