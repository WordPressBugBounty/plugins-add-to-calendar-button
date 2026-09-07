# Agent Guide

## Documentation Directive

Read [`.ai/Architecture.md`](.ai/Architecture.md) before making structural or cross-cutting changes.

Always update `AGENTS.md` and `.ai/Architecture.md` when a change makes their guidance inaccurate or incomplete. Keep both files as concise descriptions of the current repository and its rules. Never use either file as a logbook, changelog, status report, implementation diary, or list of completed work. Replace stale guidance instead of appending historical notes.

## Repository Purpose

This is a WordPress plugin around the Add to Calendar Button v3 web component. It supports:

- `[add-to-calendar-button]` shortcodes rendered by PHP.
- A Gutenberg block that previews the component but saves a shortcode.
- Add to Calendar PRO keys and dynamic overrides from post meta, ACF, and nested shortcodes.
- Versioned local loading of all upstream runtime styles and locales without a CDN.

## Technology

- WordPress 6.3+ and PHP 7.4+.
- Vanilla JavaScript Gutenberg block using WordPress packages and `createElement`; no JSX.
- Node.js 24 in CI.
- npm lockfile, webpack 5, Babel preset-env, and WordPress dependency extraction.
- Add to Calendar Button is exactly pinned as a development dependency because its files become release artifacts.

Keep PHP syntax compatible with PHP 7.4 and avoid assuming newer WordPress APIs without handling the declared WordPress floor.

## Read First

- `add-to-calendar-button.php`: bootstrap, hooks, shared allowlist, shortcode renderer, ATCB loading, block registration/localization.
- `block.js`: Gutenberg schema, Inspector UI, free-form parser, preview, and shortcode serialization.
- `atcb-options.php`: settings page and `atcb_global_settings` sanitation.
- `scripts/build-atcb-assets.mjs`: generated ATCB runtime layout.
- `scripts/verify-build.mjs`: enforced version and release invariants.
- `webpack.config.js`: block bundling and WordPress dependency extraction.
- `readme.txt`: WordPress.org metadata and changelog.
- [`.ai/Architecture.md`](.ai/Architecture.md): complete flows and boundaries.

## Commands

```bash
npm ci
npm start
npm run build
npm run verify-build
npm audit
npm audit --omit=dev
```

`npm run build` generates ATCB assets, creates the production Gutenberg bundle and asset manifest, and runs release verification. `npm run verify-build` assumes dependencies and generated output already exist.

For PHP changes, lint every changed PHP file, for example:

```bash
php -l add-to-calendar-button.php
php -l atcb-options.php
php -l atcb-plugin-links.php
```

There is no automated WordPress/PHP, Gutenberg, or browser test suite. Manually verify affected editor and frontend flows when behavior changes.

## Generated Assets

- `node_modules/add-to-calendar-button` is the only source of truth for ATCB browser assets.
- Never manually copy or edit the upstream runtime.
- Never edit or commit `build/` or `node_modules/`.
- Never recreate the removed `lib/` runtime copies or an unstyled bundle.
- `scripts/build-atcb-assets.mjs` may clean only `build/atcb/`, not unrelated build output.
- Runtime release output must contain only `atcb.min.js`, upstream `LICENSE.txt`, `styles/*.css`, and `locales/*.json` under `build/atcb/<upstream-version>/`.
- Do not exclude `build/` in `.distignore`; releases generate it immediately before packaging.
- Webpack generates `build/block.js` and `build/block.asset.php`. PHP requires the asset manifest during block registration.

## Versioning Rules

When changing the plugin version, update all of these together:

- `package.json` `version`.
- `package-lock.json` root package version through npm.
- The plugin header `Version` in `add-to-calendar-button.php`.
- `ATCB_PLUGIN_VERSION` in `add-to-calendar-button.php`.
- `Stable tag` in `readme.txt`.

When changing the upstream runtime:

- Pin `add-to-calendar-button` to an exact version in `devDependencies`; never use `^` or `~`.
- Regenerate `package-lock.json`.
- Set `ATCB_SCRIPT_VERSION` to the exact same version.
- Run `npm run build` and keep the generated directory untracked.

For every minor or major plugin release, update the changelog in `readme.txt`. Release tags must be bare `x.y.z` versions matching `package.json`.

## WordPress Runtime Rules

- `style-source` is plugin-controlled and intentionally absent from the public allowlist. Every shortcode-rendered component and Gutenberg preview must receive the local versioned styles URL.
- Keep the terminal `styles/` path segment: ATCB derives `locales/` by replacing it.
- Preserve official v3 kebab-case attributes and supported v2 aliases. Attribute comparison normalizes case, hyphens, and underscores, while rendered spelling is retained.
- Add public component options to the single `$allowedAttributes` list in `add-to-calendar-button.php`; PHP passes it to the editor.
- Treat the shortcode allowlist and escaping as a security boundary. Do not weaken name validation, value sanitation, or escaping.
- Keep `load-all-styles` opt-in. It exists for runtime style switching and should not become a default.
- English/default styling is embedded. Other component languages/styles load locally on demand.
- `languages/` contains WordPress gettext catalogs for plugin UI. It is unrelated to generated ATCB locale JSON and must remain separate.
- The `atcb_pro_active` option changes plugin UI/editor defaults only; actual PRO behavior requires a `prokey`.
- Dynamic `mf-`, `acf-`, and `sc-` overrides run only with a `prokey` and resolve in the current post context. The ACF path currently assumes `get_field()` exists.
- The runtime script currently loads globally in frontend and admin requests. Treat changing this as an architectural behavior change, not a local optimization.

## Gutenberg Rules

- The block name is `add-to-calendar/button` in both PHP and JavaScript.
- Keep the block on API version 3 in both PHP and JavaScript.
- The ATCB runtime must remain hooked to `enqueue_block_assets` so the custom element is registered inside the iframe editor canvas.
- The block saves a shortcode, not the custom element. PHP performs final frontend rendering and dynamic data resolution.
- Keep the editor preview inside a standard DOM wrapper carrying `useBlockProps()` so clicks select the block in the iframe editor.
- Changes to block attributes, `atcbParseAttributes()`, or `save()` can invalidate stored blocks. Preserve serialized output or add an explicit Gutenberg deprecated version/migration.
- Keep hyphenated attribute parsing and compatibility normalization intact.
- The editor preview must force the plugin-local `style-source` after parsed user attributes.
- Use WordPress-provided UI components and globals. Do not add direct `@wordpress/*`, React, or replacement control dependencies unless the extraction architecture genuinely changes.
- Keep the source JSX-free unless the build deliberately restores a React Babel preset.
- `@wordpress/dependency-extraction-webpack-plugin` must continue generating `block.asset.php`; do not hardcode the dependency list.

## Settings And Documentation

- `atcb_global_settings` currently stores only `atcb_pro_active`. Sanitize every new option explicitly.
- `README.md` is contributor documentation. `readme.txt` is the WordPress.org user-facing readme, metadata source, stable tag, and changelog. Keep their roles distinct.
- Update gettext catalogs when translatable plugin UI strings change; generated ATCB locale JSON must come only from npm.
- Preserve both licenses: root GPLv3-or-later `LICENSE.txt` for the plugin and generated ELv2 `LICENSE.txt` beside the ATCB runtime.

## CI And Release Rules

- CI uses `npm ci`; package and lockfile changes must remain synchronized.
- Dependency security CI runs both audit scopes, custom compromised-package checks, and the production build.
- Pushes to `main` build and deploy to staging independently of the security workflow.
- GitHub releases build before WordPress.org packaging, so ignored generated assets are available to the deploy action.
- `.distignore` controls WordPress.org packaging; `.gitignore` and `.gitattributes` serve different purposes.
- The WordPress Playground blueprint installs the published plugin, not local source. Do not treat it as verification of worktree changes.

## Minimum Verification

For build, dependency, block, asset, version, or release changes, run:

```bash
npm ci
npm run build
npm audit
npm audit --omit=dev
git diff --check
```

For PHP changes, also run applicable `php -l` checks. For shortcode, Gutenberg, PRO, dynamic data, language/style loading, or URL changes, manually test both editor and frontend behavior. Asset URL changes must account for WordPress installed in subdirectories and multisite.
