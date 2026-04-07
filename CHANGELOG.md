# Changelog

All notable changes to this project will be documented in this file.

## 0.2.0 - 2026-04-07

### Added

- Added a page-aware `mastodonSharePost` helper shortcode for easier post sharing
- Added support for Nunjucks, Liquid, and Eleventy JavaScript template usage
- Added support for both ESM and CommonJS consumers
- Added a built-in popular-instance save flow in the share menu
- Added CI and npm publish workflows
- Added Eleventy plugin-directory submission helper files

### Changed

- Refactored the plugin around a shared renderer for more consistent output across template engines
- Improved the default UI styling so the plugin works more cleanly out of the box
- Reworked the README to be more project-focused and user-friendly
- Updated the demo and verification fixtures to align with the current plugin API

### Verified

- Verified against `@11ty/eleventy@3.1.5`
- Verified package loading with both `import` and `require()`
