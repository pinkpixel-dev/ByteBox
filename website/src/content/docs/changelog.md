---
title: Changelog Highlights
description: Major ByteBox milestones and what changed.
---

For complete historical detail, see root `CHANGELOG.md`. This page captures major platform milestones.

## `2.5.1` (March 12, 2026)

- Rolls the `2.5.0` feature work into a fresh installer-focused release
- Windows NSIS installer pipeline is now working end-to-end through GitHub Actions
- Release workflow hardened for manual draft releases with a separate build ref input
- Windows native-module rebuild no longer shells through `npx`, fixing the `spawnSync npx.cmd EINVAL` failure
- Added a proper multi-size Windows `.ico` for installer, Start menu, taskbar, and desktop shortcut rendering
- Synced the package lockfile so Windows `npm ci` succeeds in CI
- Desktop download references updated to `2.5.1`

## `2.5.0` (March 3, 2026)

- Category column drag-and-drop reordering — grab the `⠿` handle and drag columns into any order
- New categories now append to the end of the board instead of inserting at position 0
- Card drag-and-drop snap-back bug fixed — full column reorder is now written to DB on every move
- Column drag resolution fixed — `closestCorners` collision now correctly resolves drops onto column headers even when hovering over a card inside the target column
- New `PATCH /api/categories` bulk-reorder endpoint
- Optimistic UI updates for both card and column moves — instant visual feedback with background persistence
- **Electron packaging fixed** — AppImage and .deb builds now correctly include Turbopack alias packages; default categories and card creation work in all packaged builds
- Sidebar is now drag-resizable with persisted width (saved in settings/presets)
- Board columns are now drag-resizable with persisted width (saved in settings/presets)
- Added typography size controls: UI labels, body text, category headers, card titles, and code text
- Added built-in solid background swatches plus save/delete for custom solid colors
- Added save/delete support for custom gradient presets in Settings

## `2.4.0` (March 1, 2026)

- Docker deployment flow finalized
- Electron desktop app build and packaging improvements
- Migration and startup hardening for non-web runtimes

## `2.3.0`

- Tags and categories UX improvements
- Modal and workflow refinements

## `2.2.0`

- Setup and onboarding polish
- Category-related fixes and workflow improvements

## `2.1.x`

- Theme persistence fixes
- Card modal editing and behavior improvements

## `2.0.0`

- Database-backed settings and appearance overhaul
- Presets, fonts, and theme configuration maturation

## `1.4.0`

- Starred/favorited cards
- Roadmap phase progression for filtering features

## `1.2.0`

- Image/screenshot cards
- Enhanced media-oriented card interactions

## `1.1.0`

- Neon glass redesign
- Theme engine foundation

## `1.0.0`

- Initial production release
- Core card/category/tag/search/export-import platform
