# 📝 Changelog

All notable changes to **ByteBox** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.1] - 2026-03-12

### 🪟 Windows Installer Release, Packaging Hardening & 2.5.x Rollup

This release rolls the feature work from `2.5.0` forward into a fresh `2.5.1` installer release and focuses on getting desktop distribution into a stable, repeatable state. It includes the UI and data-layer improvements from the original `2.5.0` work alongside Windows packaging fixes, workflow hardening, and updated download references for the new release.

#### Added

- **First Windows NSIS installer release path** — ByteBox now produces a Windows `.exe` installer through GitHub Actions with multi-step verification and release upload support.
- **Windows multi-resolution app icon** — Added `electron/assets/icons/icon.ico` with embedded `16/32/48/64/128/256` sizes so installer, desktop shortcut, Start menu, and taskbar icons render correctly.
- **Manual release build ref support** — The release workflow now accepts a separate manual `ref` input so draft releases can build from `main`, a tag, or a SHA without requiring checkout to match the release tag name exactly.

#### Changed

- **Version bump to `2.5.1`** — Application metadata, lockfile metadata, changelog entries, and desktop download references now point to the new release version.
- **Release workflow hardening** — Windows release automation now uses native runner shells, installs Python explicitly for `node-gyp`, validates installer output before upload, and stores the generated installer as a workflow artifact in addition to attaching it to the GitHub release.
- **Release process updated for mutable drafts** — `2.5.1` is intended to be assembled as a draft release first so assets can be uploaded and checked before publishing.
- **Desktop download references updated** — README and website Electron docs now point Linux download filenames from `2.5.0` to `2.5.1`.

#### Fixed

- **Windows CI `npm ci` failure** — Synced `package-lock.json` so the Windows installer workflow no longer fails immediately on dependency mismatches.
- **Windows native rebuild failure (`spawnSync npx.cmd EINVAL`)** — The Electron `afterPack` hook now invokes `node-gyp` directly through Node instead of shelling through `npx`, which fixes the Windows rebuild path for `better-sqlite3`.
- **Missing Windows installer icon resource** — NSIS packaging no longer fails looking for `electron/assets/icons/icon.ico`; the expected icon file now exists in the repo and is bundled correctly.
- **Manual release/tag coupling issue** — Workflow-dispatch builds no longer assume the release tag is also the ref to check out, which avoids mismatches when preparing a draft release before the final tag flow is settled.
- **Windows installer workflow visibility** — The workflow now surfaces a concrete failure earlier if no installer file is produced, making debugging much clearer.

#### Included from `2.5.0`

- **Column drag-and-drop** with persisted category ordering
- **Card reorder consistency fixes** and optimistic drag/drop updates
- **Expanded personalization settings** including resizable sidebar/columns and typography controls
- **Electron packaging fixes** for Turbopack alias packages, Prisma client bundling, and `better-sqlite3` Electron ABI handling
- **Desktop packaging documentation updates** and refreshed release/download guidance

#### Downloads

| Platform                   | Link                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Windows (.exe)             | [ByteBox.Setup.2.5.1.exe](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox.Setup.2.5.1.exe) |
| Linux AppImage             | [ByteBox-2.5.1.AppImage](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox-2.5.1.AppImage)   |
| Linux .deb (Debian/Ubuntu) | [bytebox_2.5.1_amd64.deb](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/bytebox_2.5.1_amd64.deb) |

## [2.5.0] - 2026-03-04

### 🎯 Category Ordering, Drag-and-Drop, Neon Glow UI & Electron Packaging Fix

This release fixes category creation ordering, extends drag-and-drop to cover full board layout, replaces gradient styles with a unified glass + neon glow design system, and resolves a critical bug where packaged Electron builds (AppImage, .deb) had no default categories and could not create any data.

#### Added

- **Column drag-and-drop** — Category columns can be grabbed by the `⠿` handle in each column header and dragged horizontally to any position. The new order is persisted immediately to the database.
- **`PATCH /api/categories`** — New bulk-reorder endpoint that accepts `{ updates: [{ id, order }] }` and writes all `order` values transactionally.
- **`reorderCategories()`** — New DB helper in `src/lib/db/queries.ts` that transactionally updates `order` for a set of categories.
- **`.accent-glow-active` CSS class** — New utility class for toggle/selection states (sort buttons, filter mode, search type pills) with neon glow border and shadow using the active accent theme color.

#### Changed

- **Gradient → Glass + Neon Glow** — Replaced all `accent-gradient` (multi-color gradient fill) button styles across the app with glass-morphic backgrounds and accent-colored neon glow borders/shadows. Elements now match the existing glass theme and glow in the user's selected accent color on hover/active states. Affected components:
  - `AppLayout.tsx` — "+ Add Card" sidebar button
  - `CreateCardModal.tsx` — "Create Card" submit button
  - `CardModal.tsx` — "Save Changes" and "Visit Link" buttons
  - `FilterPanel.tsx` — "Any/All" filter mode toggles and selected tag pills
  - `search/page.tsx` — "Clear filters" button and search type pills (All/Title/Content/Tags)
  - `categories/page.tsx` — "Save" button and sort toggles (Name/Cards)
  - `tags/page.tsx` — Sort toggles (Name/Usage)
  - `globals.css` — `.accent-gradient` class redefined from gradient fill to glass + neon glow with hover intensification
- **Header button neon glow** — Filter toggle, Docs, Pink Pixel, and GitHub buttons in the header now glow with the accent color on hover instead of using basic shadow styles.
- **ViewModeSelector theme-aware** — Replaced hardcoded `#f72585` color references with `var(--accent-primary)` CSS variables so the dropdown respects the user's selected accent theme. Active items now use neon glow borders instead of dark shadows.
- **Sidebar width reduced** — Expanded sidebar narrowed from `w-80` (320px) to `w-72` (288px) with header padding reduced from `px-5` to `px-4`.
- **Logo banner container** — Resized from `h-24 w-48` (2:1 ratio) to `h-12 w-44` (3.67:1 ratio) to closely match the `logo_banner.png` native aspect ratio (2600×700 = 3.71:1), eliminating whitespace around the image.
- **Docs link** — Header documentation button now points to `https://bytebox.pro` (external link, opens in new tab) instead of the non-functional `/docs` route.
- **Removed ThemeToggle** — Removed the light/dark mode toggle button from the header since the custom theming system supports any color/background and the toggle caused errors with the existing theme infrastructure.

#### Fixed

- **New categories now append to the end** — Previously every new category defaulted to `order: 0`, causing it to sort before all existing columns. `createCategory()` now queries `MAX(order)` and assigns `maxOrder + 1`, so new columns always appear on the right.
- **Card drag-and-drop snap-back** — Cards were reverting to their original position after being dropped because the handler only updated the moved card's `order` value, leaving all other cards with stale/duplicate `order` values and causing an indeterminate sort on the next render. The handler now reorders the entire affected column(s) and sends a complete set of `{ id, order }` updates so the DB is always consistent.
- **Column drag-and-drop snap-back** — Column drags were also reverting because there was no optimistic state update before the async API call. Both card and column moves now update `boardData` optimistically in the same tick, so dnd-kit never re-renders from an unchanged prop.
- **Column drag resolution** — `closestCorners` collision detection sometimes resolved a column drag over a card _inside_ the target column rather than the column itself. The `onDragEnd` handler now walks from any card `over.id` up to its parent category, ensuring column reorder always fires correctly.
- **Electron packaged builds broken** — AppImage and .deb builds had no default categories and could not create any data. Root cause: Turbopack (Next.js 16) generates hashed alias packages under `.next/node_modules/` (e.g. `better-sqlite3-<hash>/`) for external native modules. These are required at runtime via `require("better-sqlite3-<hash>")`, but `electron-builder`'s automatic `!**/node_modules/**` exclusion rule was silently stripping the entire directory from the packaged app, causing all Prisma database operations to fail with 500 errors. Web and Docker versions were unaffected because they run from the project root where `.next/node_modules/` is always present.
- **Native binary ABI mismatch in alias packages** — Even after re-including `.next/node_modules/` in the build, the `better-sqlite3` binary inside the Turbopack alias directory was compiled for the system Node.js ABI, not Electron's. The afterPack hook now replaces the binary in the alias directory with the Electron-ABI version compiled in the same step.

#### Technical Details

- Modified: `electron-builder.yml`, `scripts/electron-rebuild-native.cjs`, `src/app/globals.css`, `src/components/layout/AppLayout.tsx`, `src/components/cards/CardModal.tsx`, `src/components/cards/CreateCardModal.tsx`, `src/components/ui/FilterPanel.tsx`, `src/components/ui/ViewModeSelector.tsx`, `src/app/search/page.tsx`, `src/app/categories/page.tsx`, `src/app/tags/page.tsx`
- `electron-builder.yml` now explicitly includes `.next/node_modules/**` to override the automatic exclusion.
- `scripts/electron-rebuild-native.cjs` Step 5: scans `destApp/.next/node_modules/` for any `better-sqlite3-*` alias directories and patches their `build/Release/better_sqlite3.node` with the Electron-ABI binary compiled in Step 1.
- `ThemeToggle` import and component removed from `AppLayout.tsx`.

### 🎛️ Settings Personalization Expansion (March 5, 2026)

#### Added

- **Resizable sidebar with persisted width** — Sidebar can now be drag-resized from its right edge, with width saved in `fontConfig.sidebarWidth` (and included in settings presets).
- **Resizable board columns with persisted width** — Category columns can now be resized from the board itself, with width saved in `fontConfig.columnWidth`.
- **Advanced typography sizing controls** — Added independent controls for:
  - UI label size
  - Body text size
  - Category header size
  - Card title size
  - Code text size
- **Solid background preset system** — Added built-in solid color swatches plus save/delete support for custom solid colors.
- **Custom gradient preset library** — Added save/delete support for user-created gradients in Settings.

#### Changed

- **Sidebar default width tightened** — Expanded sidebar default is now the minimum width (`240px`) for a cleaner starting layout.
- **Sidebar width persistence model** — Sidebar width moved from session-only state to durable settings persistence so it no longer resets when navigating between pages.
- **Card/category title handling** — Category headers and card titles now support multi-line clamping to reduce clipping with larger fonts.
- **Theme tokens expanded** — Added runtime CSS tokens for `--font-size-ui`, `--font-size-body`, `--font-size-category-title`, `--font-size-card-title`, `--font-size-code`, `--sidebar-width`, and `--board-column-width`.
- **Background config model expanded** — `backgroundConfig` now carries saved solid color and saved gradient libraries so they travel with settings/preset data.

---

## [2.4.0] - 2026-03-01

### 🐳 Docker Deploy & 🖥️ Electron Desktop App

This release adds two new ways to run ByteBox: a Docker container for zero-setup server deployment, and a native Electron desktop app that packages ByteBox as a proper installed application (AppImage, .deb).

#### Added

- **Linux desktop downloads** — Pre-built AppImage and .deb installers now available for direct download from the [ByteBox website](https://bytebox.pro/electron-desktop/), hosted on Cloudflare R2.
- **Docker support** — Full containerised deployment via `docker compose up --build -d`. A two-stage Dockerfile (builder + slim runtime) compiles the app and bundles only what's needed. Data persists in a named Docker volume (`bytebox-data`) that survives restarts and image rebuilds.
- **`docker-compose.yml`** — One-command orchestration with healthcheck, restart policy, and documented backup/restore commands.
- **`docker-entrypoint.sh`** — Container entrypoint that runs `prisma migrate deploy` (idempotent) then starts Next.js — migrations are applied automatically on every boot.
- **`.dockerignore`** — Keeps build context lean by excluding `node_modules`, `.next`, local databases, and Electron artifacts.
- **Electron desktop app** — `npm run electron:dev` launches ByteBox as a native desktop window. The main process starts the Next.js server in-process, applies SQLite migrations directly (no Prisma CLI needed), and stores the database in the OS user-data directory.
- **`electron/main.ts`** — Electron main process with in-process Next.js server, migration runner (pure `better-sqlite3`, no CLI), secure `BrowserWindow` config, and external-link routing to the system browser.
- **`electron/preload.ts`** — Minimal secure preload exposing only `window.electronAPI.isElectron` and `platform` — `contextIsolation: true`, `nodeIntegration: false`.
- **`electron-builder.yml`** — Build config targeting **AppImage** + **.deb** (Linux).
- **`public/icon.png` as app icon** — Set as the BrowserWindow icon so ByteBox appears with its own icon in the taskbar and titlebar.
- **New npm scripts**: `electron:compile`, `electron:dev`, `electron:build`, `electron:build:linux`.
- **New devDependencies**: `electron`, `electron-builder`, `esbuild`, `concurrently`, `wait-on`.

#### Changed

- **Default port changed from 3000 → 1334** — `scripts/next-with-env.cjs` now sets `PORT=1334` as default. All dev, build, start, Docker, and Electron configs updated to match.
- **`@prisma/client` moved to `dependencies`** — Required at runtime by the packaged Electron app, not just at build time.
- **Sidebar logo & icon size reduced** — Expanded logo banner reduced from `h-30 w-60` to `h-24 w-48`; collapsed icon from `h-12 w-12` to `h-10 w-10`.

#### Technical Details

- New files: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `docker-entrypoint.sh`, `electron/main.ts`, `electron/preload.ts`, `electron-builder.yml`
- Modified: `scripts/next-with-env.cjs`, `scripts/setup.sh`, `package.json`, `src/components/layout/AppLayout.tsx`, `.gitignore`
- Electron main + preload are compiled to CommonJS (`.cjs`) via esbuild to avoid ESM/CJS conflicts with `"type": "module"` in `package.json`.

---

## [2.3.0] - 2026-03-01

### 🏷️ Tags Page, Categories Page & Modal Refinements

This release adds dedicated management pages for tags and categories, removes category CRUD from card modals, replaces the free-text language input with a validated dropdown, and ships a unified edit overlay on the categories page.

#### Added

- **Tags management page (`/tags`)** — Full CRUD for tags with 8-color picker, usage stats, live preview, and sort options.
- **Categories management page (`/categories`)** — Full CRUD for categories with card counts, color editing, sort by name or card count, and unified edit overlay (name + color in one panel).
- **`/api/categories/[id]` route** — New REST endpoint (`PATCH` rename/recolor, `DELETE`) for individual category management.
- **Categories & Tags in sidebar navigation** — Both pages accessible from the main sidebar via `FolderIcon` and `TagIcon`.
- **Language dropdown in card modals** — Code snippet and command cards now use a `<select>` dropdown populated with 100+ Shiki-bundled languages instead of a free-text input, preventing invalid language crashes.
- **`LANGUAGE_OPTIONS` export** — New curated array of 100+ language entries with display labels in `syntax.ts`, used by both card modals.

#### Changed

- **Category management removed from card modals** — Create Card and Edit Card modals no longer include category create/rename/delete controls. Categories are now managed exclusively on the dedicated `/categories` page. The category field in both modals is now a simple `<select>` dropdown.
- **Categories page unified edit overlay** — Clicking the edit icon on a category now opens a single overlay with both a name input and an 8-color swatch picker (previously these were separate rename-only and color-only interactions).
- **Syntax highlighting language count** — Updated from "35+" to "100+" across documentation to reflect the full set of Shiki-bundled languages now available in the dropdown.

#### Fixed

- **Shiki crash on invalid language** — Typing an unsupported language name in the free-text input caused a runtime error. Replaced with a validated dropdown so only supported languages can be selected.
- **Nested `<button>` hydration error on categories page** — Changed inner color dot from `<button>` to `<div role="button">` to fix React hydration warning.

#### Technical Details

- New file: `src/app/categories/page.tsx`
- New file: `src/app/api/categories/[id]/route.ts`
- Modified: `src/components/cards/CreateCardModal.tsx`, `src/components/cards/CardModal.tsx`, `src/app/page.tsx`, `src/lib/utils/syntax.ts`, `src/components/layout/AppLayout.tsx`

---

## [2.2.0] - 2026-03-01

### 🛠️ Setup, Categories & Bug Fixes

This release fixes first-run setup errors, introduces topic-based default categories, adds inline category creation, and ships a one-command setup script for new clones.

#### Fixed

- **Turbopack `distDirRoot` panic** – Removed stale hardcoded `turbopack.root` path from `next.config.ts` that pointed to a non-existent directory, causing both `npm run dev` and `npm run build` to crash immediately with a Turbopack internal error.
- **Missing Prisma client on build** – Fresh clones had no `.prisma/client/default` because `prisma generate` was never run. The new setup script and updated README cover this step automatically.
- **Missing `.env` file** – `DATABASE_URL` was not set on fresh clones, causing `prisma generate` and the seed script to fail. The setup script creates `.env` from `.env.example` automatically.
- **Database tables not found on first run** – Migrations had never been applied to `dev.db`, resulting in `P2021` errors for every API call. Fixed by documenting and automating `prisma migrate deploy`.
- **Seed script targeting wrong database** – `npm run db:seed` defaulted to `./data/bytebox.db` when `DATABASE_URL` wasn't loaded from `.env`. Fixed by adding `dotenv/config` import at the top of `prisma/seed.ts`.
- **Category dropdown empty in Create Card modal** – The modal was wrapped in `{boardData && ...}` so it was never mounted when the board had no data. Removed the gate so the modal always renders.
- **No way to create a card on a fresh/empty database** – If there were no categories, the category `<select>` was empty and the form could not be submitted. The modal now detects this and shows an inline text input + "Create" button to add the first category on the fly.

#### Added

- **`scripts/setup.sh`** – One-command setup script for new clones:
  ```bash
  bash scripts/setup.sh
  # or
  npm run setup
  ```
  Automatically: checks Node.js version, creates `.env`, runs `npm install`, `prisma generate`, `prisma migrate deploy`, and `db:seed`.
- **`npm run setup`** – New package.json script alias for the setup script.
- **`/api/categories` route** – New REST endpoint (`GET` list, `POST` create) for category management, used by the inline category creator in the Create Card modal.
- **Auto-seeded default categories** – On a completely empty database, `getBoardData()` now automatically creates 5 sensible topic-based default categories so the dashboard is never blank:
  - 🌐 Frontend
  - ⚙️ Backend
  - 🚀 DevOps
  - 📚 Learning & Research
  - 💡 Ideas & Inspiration
- **Inline category creation in Create Card modal** – When no categories exist, the Category field becomes a text input with a "Create" button so users can create one without leaving the modal.
- **`onCategoryCreated` callback in `CreateCardModal`** – New optional prop; when a category is created inline, the parent page immediately reflects it in the board without a full refresh.

#### Changed

- **Default categories are now topic-based, not type-mirrors** – Previous defaults (Bookmarks, Code Snippets, Commands, Documentation, Notes) were identical to card types and caused confusion. New defaults (Frontend, Backend, DevOps, Learning & Research, Ideas & Inspiration) represent _projects/domains_ so any card type fits naturally into any category.
- **`prisma/seed.ts`** – Now loads `.env` via `dotenv/config` before resolving `DATABASE_URL`, so `npm run db:seed` works without manually exporting the variable.
- **`next.config.ts`** – Removed the stale `turbopack.root` override.

#### Technical Details

- New file: `scripts/setup.sh`
- New file: `src/app/api/categories/route.ts`
- Modified: `next.config.ts`, `prisma/seed.ts`, `src/lib/db/queries.ts`, `src/components/cards/CreateCardModal.tsx`, `src/app/page.tsx`, `package.json`

---

## [2.1.1] - 2025-12-01

### 🐛 Bug Fixes: Theme Persistence & Navigation

This patch release fixes critical theme persistence issues where the dark theme wasn't being applied as default and theme settings would reset when clicking sidebar navigation buttons.

#### Fixed

- **Dark Theme Not Default** – Fixed `getUserSettings()` in `queries.ts` to use correct default values when creating new user settings:
  - Changed `mode` default from `'light'` to `'dark'`
  - Changed `accentThemeId` default from `'default'` to `'byte-classic'`
  - Changed `iconThemeId` default from `'default'` to `'neon-grid'`
  - Changed `glassIntensity` default from `0` to `60`
  - Changed `customIconColor` default from `''` to `'#f472b6'`
  - Changed `backgroundConfig` default from `'{}'` to `'{"type":"default"}'`
  - Changed `fontConfig` default from `'{}'` to `'{"uiFont":"system","monoFont":"geist-mono"}'`
- **Theme Reset on Sidebar Click** – Fixed sidebar navigation causing full page reloads which reset theme to API defaults
  - **Root Cause**: Sidebar navigation items used `<a href={...}>` tags instead of Next.js `<Link>` component
  - **Solution**: Changed all sidebar navigation items in `AppLayout.tsx` from `<a>` to `<Link>` for proper client-side navigation
  - Previously clicking Dashboard, Search, Tags, or Settings would trigger a full page reload
  - Now navigation is instant and preserves all React state including theme settings

#### Technical Details

- **Modified Files**:
  - `src/lib/db/queries.ts`: Fixed `getUserSettings()` default values
  - `src/components/layout/AppLayout.tsx`: Changed `<a>` tags to `<Link>` components for sidebar nav
- **Database**: Cleared existing `user_settings` row to allow fresh creation with correct defaults
- **Import Added**: `import Link from 'next/link'` in AppLayout.tsx

#### Migration Notes

- Users should hard refresh their browser (Ctrl+Shift+R / Cmd+Shift+R) after updating
- If theme issues persist, clear localStorage keys starting with `bytebox-` or clear site data
- New installations will automatically use dark theme as default

---

## [2.1.0] - 2025-12-01

### 🎨 Card Modal Editing & UX Improvements

This release adds full card editing capabilities to the card detail modal and fixes several UI/UX issues.

#### Added

- **Card Editing in Modal** – Full edit mode for cards directly in the detail modal
  - Edit title, description, and content fields
  - Change language for code snippets and commands
  - Add/remove tags with visual toggle buttons
  - Toggle starred status with dedicated button
  - Save/Cancel buttons with loading state
  - Form validation (title required)
- **Star Toggle in Modal Header** – Quick star/unstar button in view mode
  - Shows filled star when starred, outline when not
  - Amber accent color with hover effects
- **Edit Button** – New "Edit" button in modal footer to enter edit mode
  - Only shows when `onUpdate` callback is provided
  - PencilSquareIcon with label
- **Minimum Modal Size** – Card modals now have a 400px minimum height
  - Prevents modals from looking cramped with short content (like single-line commands)
  - Content areas also have minimum heights (120px for code, 80px for general content)

#### Fixed

- **Nested Button Hydration Error** – Fixed HTML validation error where `<button>` contained nested `<button>` elements
  - Refactored Card component to use backdrop button pattern for proper accessibility
  - Main card wrapper is now a non-interactive `<div>` with an absolutely positioned `<button>` at `z-0` for click handling
  - All interactive elements (star, download, image zoom) are proper `<button>` elements positioned at `z-10`
  - Uses `pointer-events-none` on content with `pointer-events-auto` on interactive elements
  - Resolves SonarQube S6819 accessibility warnings ("Use `<button>` instead of `role='button'`")
  - Maintains full keyboard accessibility with proper focus rings
  - Console error "In HTML, `<button>` cannot be a descendant of `<button>`" is now resolved
- **Dark Theme Dropdown Styling** – Fixed select dropdowns appearing white in dark mode
  - Added global CSS for `select` and `option` elements with proper dark theme colors
  - Form inputs in CreateCardModal now use theme-aware styling
  - Select elements use `color-scheme: dark` for native dark theme support
  - Options styled with `--background-muted` and `--text-strong` variables

#### Changed

- **Card Component** – Refactored for proper HTML structure and accessibility compliance
  - Uses backdrop `<button>` pattern instead of `role="button"` on div
  - Non-interactive wrapper `<div>` for styling with hidden backdrop button for clicks
  - Content layered at `z-10` with `pointer-events-none`, interactive elements use `pointer-events-auto`
  - Maintains full keyboard accessibility with proper focus rings on the backdrop button
  - Allows nested interactive elements (buttons) without HTML violations or accessibility warnings
  - Compliant with SonarQube S6819 and ESLint jsx-a11y rules
- **CardModal Props** – Extended interface with new optional props:
  - `onUpdate?: (updatedCard: CardType) => void` – Callback for card updates
  - `allTags?: Tag[]` – Available tags for editing
- **CreateCardModal Styling** – All form inputs now properly themed
  - Inputs use `bg-[color-mix(in_srgb,var(--surface-card)_90%,transparent)]`
  - Borders use `border-[color-mix(in_srgb,var(--card-border)_80%,transparent)]`
  - Text uses `text-(--text-strong)` for proper contrast
  - Focus rings use accent color

#### Technical Details

- **New Database Function**: `updateCardWithTags()` in `queries.ts`
  - Updates card fields and replaces tag associations atomically
  - Uses Prisma's `tags: { set: [...] }` for tag replacement
- **API Enhancement**: PATCH `/api/cards/[id]` now handles `tagNames` parameter
  - When `tagNames` is provided, uses `updateCardWithTags()` instead of `updateCard()`
  - Tag names are resolved to IDs, creating new tags if needed
- **CSS Additions**: New global styles in `globals.css`
  - `select { color-scheme: dark; }`
  - `select option { background-color: var(--background-muted); color: var(--text-strong); }`
  - Firefox-specific `@-moz-document` rules for select styling

---

## [2.0.0] - 2025-12-01

### 🚀 Major Release: Database-Backed Settings & Appearance Overhaul

This major release introduces full database persistence for all user settings, a comprehensive appearance customization system, and significant infrastructure upgrades including Prisma 7 and improved font handling.

### 🔧 Settings & Typography Fixes

#### Added

- **Database-Backed Settings Persistence** – All user settings now persist to SQLite database, not just localStorage
  - New `UserSettings` Prisma model stores all theme/appearance preferences
  - New `/api/settings` API route for GET/PATCH/PUT operations
  - Settings load from API on mount with localStorage as instant-hydration fallback
  - Debounced saves (500ms) prevent excessive API calls during rapid changes
  - Custom accent themes, presets, icon themes, backgrounds, and fonts all persist across sessions
- **Prisma 7 Upgrade** – Updated to Prisma 7.0.1 with better-sqlite3 adapter
  - Removed `url` from datasource block per Prisma 7 requirements
  - Configuration now handled via `prisma.config.ts`

#### Fixed

- **Font Selection Not Applying** – Fixed critical bug where UI and mono fonts wouldn't change
  - **Root Cause**: CSS variables like `var(--font-indie-flower)` are only defined on `<body>` via Next.js font classes, but data attributes were being set on `<html>` where those variables weren't accessible
  - **Solution 1**: Changed `applyFontConfig()` to set data attributes on `<body>` instead of `<html>` (documentElement)
  - **Solution 2**: Updated CSS selectors from `[data-ui-font="..."]` to `body[data-ui-font="..."]` so they have access to Next.js font variables
  - **Solution 3**: Added runtime resolution of computed font values using `getComputedStyle()` instead of passing `var()` references through JavaScript
  - Added proper fallback stacks to all font declarations in CSS
  - Fonts now switch correctly between all 17 UI fonts and 13 mono fonts including stylized options (Indie Flower, Permanent Marker, etc.)

#### Changed

- **ThemeContext Refactored** – Now loads settings from API on mount
  - Uses `useRef` for debounced save timeout management
  - New `settingsLoaded` state prevents saving before initial load completes
  - Syncs localStorage with API values for offline resilience
- **CSS Font Selectors** – All selectors now properly target `body` element
  - Added fallback font stacks to each selector for graceful degradation

#### Database Changes

- **UserSettings Model** – New singleton model for app-wide settings:
  - `mode` (dark/light), `accentThemeId`, `iconThemeId`, `customIconColor`
  - `glassIntensity`, `backgroundConfig` (JSON), `fontConfig` (JSON)
  - `customAccentThemes` (JSON array), `settingsPresets` (JSON array)
  - Uses fixed id "default" for singleton pattern
- **Migration** – `20251130033852_add_user_settings`

---

### 🎨 Appearance & Presets Revamp

#### Added

- **Background playground** – Solid color picker, 2–4 color custom gradients with angle control, and curated gradient presets.
- **Wallpaper library** – Built-in gradient wallpapers (no assets required) plus upload with live preview; unified reset that returns to the default glass backdrop.
- **Typography controls** – Independent UI and code fonts selectable from installed/preset stacks (Geist, Inter, JetBrains Mono, Fira Code, etc.).
- **Custom accent themes** – Build 2–6 color palettes, name them, save them alongside built-ins, and delete when no longer needed.
- **Settings presets** – Save the entire appearance state (mode, accents, icons, background, fonts, glass level, custom themes) as named profiles; apply or delete with one click.

#### Changed

- Background config now clears legacy uploads when switching away from images to prevent stale wallpapers overriding gradients/presets.
- Default wallpapers now ship as data-URI gradients so previews work without `/public/wallpapers` assets.

### 🎯 Customizable Dashboard Filters (Phase 3: ROADMAP)

#### Added

- **View Mode Selector** – Dropdown in dashboard header to switch between view modes
  - **All Cards** – Show all cards (default)
  - **Most Recent** – Cards sorted by newest first (by updatedAt/createdAt)
  - **Starred Only** – Show only favorited cards
  - **By Tag** – Filter by selected tags (auto-switches when tags selected)
- **ViewModeSelector Component** – New glassmorphic dropdown with icons and descriptions
  - Displays current view mode with icon
  - Shows keyboard shortcut hints in menu
  - Accent styling for active view mode
- **Clear Filters Button** – Red "Clear" button next to view selector
  - Appears when any filters are active
  - Resets view mode to "All Cards" and clears search/tags
- **Keyboard Shortcuts for View Modes** – Quick switching with `⌘1-4`
  - `⌘1` – All Cards
  - `⌘2` – Most Recent
  - `⌘3` – Starred Only
  - `⌘4` – By Tag
- **View Mode Persistence** – Selected view mode saved to localStorage
  - Key: `bytebox-view-mode`
  - Persists across sessions and page refreshes
- **Quick View Buttons in Filter Panel** – Grid of 4 buttons for quick mode switching
  - All, Recent, Starred, By Tag with icons
  - Matches current view mode styling

#### Fixed

- **Dropdown Transparency Nightmare** – Fixed ViewModeSelector dropdown being completely transparent and unreadable
  - **Root Cause**: Headless UI Menu.Items was inheriting `backdrop-filter: blur()` from parent `.glass` elements, causing the dropdown background to be transparent despite inline styles
  - **Initial Attempts Failed**: Tried numerous approaches including:
    - Inline styles with `!important` flags
    - CSS classes with z-index manipulation
    - `isolation: isolate` and `transform: translateZ(0)`
    - CSS variables and hardcoded colors
    - Opacity and background-color overrides
  - **Winning Solution**: Used React `createPortal()` to render Menu.Items directly into `document.body`
    - Completely escapes parent glass/backdrop-filter hierarchy in DOM tree
    - Menu.Items no longer inherits any transparency effects from ancestors
    - Used `fixed` positioning with dynamic calculations based on button position
    - Added `data-viewmode-button` attribute for position reference
    - Solid `#0f172a` background with proper borders and shadows
  - **Lessons Learned**:
    - Backdrop-filter inheritance through component trees is extremely aggressive
    - CSS isolation techniques often fail with heavy blur effects
    - Portal rendering is the most reliable solution for escaping style inheritance
    - Always test dropdowns against glass/glassmorphic backgrounds during development
  - **Related Issue**: This is a known challenge with Headless UI + glassmorphism (see GitHub discussions #1346, #1541, #1925)
  - **Technical Details**:
    - Imported `createPortal` from `react-dom`
    - Used `Menu` render prop pattern with `open` state
    - Portal only mounts when dropdown is open (performance optimization)
    - Position calculated via `getBoundingClientRect()` on button element
    - Fallback to `typeof window !== 'undefined'` check for SSR safety

#### Changed

- **useSearch Hook** – Refactored to use ViewMode system
  - Added `viewMode` state with localStorage persistence
  - Added `setViewMode()` function for mode changes
  - Added `sortByRecent()` for Most Recent view
  - `showStarredOnly` is now computed from `viewMode === 'starred'`
  - Auto-switches to "By Tag" mode when selecting tags
  - `clearFilters()` now resets to "All Cards" view mode
- **AppLayout Component** – Added view mode props and keyboard shortcuts
  - `viewMode`, `onViewModeChange`, `hasActiveFilters`, `onClearFilters` props
  - Keyboard handler for `⌘1-4` shortcuts
  - Reduced search bar width to accommodate view selector
- **FilterPanel Component** – Enhanced with view mode controls
  - Quick view buttons grid
  - Updated keyboard shortcut hint for starred (`⌘3`)
- **Active Filters Badge** – Now shows view mode context
  - "(starred only)", "(most recent)", or "(n tags)" based on current mode

#### Technical Details

- New file: `src/components/ui/ViewModeSelector.tsx`
- Updated exports in `src/components/ui/index.ts`
- Type: `ViewMode = 'all' | 'recent' | 'starred' | 'by-tag'`
- localStorage key: `bytebox-view-mode`

---

## [1.4.0] - 2025-11-29

### ⭐ Starred/Favorited Cards (Phase 2: ROADMAP)

#### Added

- **Star Toggle on Cards** — Click the star icon on any card to mark it as a favorite
  - Outline star (empty) for unstarred cards
  - Solid amber star with glow effect for starred cards
  - Optimistic UI updates with loading state
  - Star button positioned in card header next to type badge
- **Starred Filter in Dashboard** — Filter to show only starred cards
  - Star button in header with badge showing starred count
  - Toggle button in Filter Panel sidebar with amber styling
  - Filter state persists across search and tag filters
- **Keyboard Shortcut** — Press `Cmd/Ctrl+Shift+S` to toggle starred filter
  - Uses Shift modifier to avoid conflict with browser save shortcut
- **Starred Count Badge** — Shows total number of starred cards in UI
  - Displayed on header star button
  - Displayed in Filter Panel starred toggle

#### Changed

- **Card Component** — Added `onStarToggle` prop for star functionality
  - Star icon from heroicons (outline and solid variants)
  - Amber color scheme (#fbbf24) with drop shadow
- **DraggableCard Component** — Passes `onStarToggle` to Card
- **DraggableBoard Component** — Added `onStarToggle` prop
- **AppLayout Component** — Added starred filter button in header
  - `showStarredOnly`, `onToggleStarred`, `starredCount` props
- **FilterPanel Component** — Added starred filter section
  - Toggle button with star icon and count
  - Keyboard shortcut hint (`⌘⇧S`)
- **useSearch Hook** — Extended with starred filtering
  - `showStarredOnly` state
  - `toggleStarredFilter()` function
  - `starredCount` computed value
  - Starred filter applied before search/tag filters

#### Database Changes

- **Card Model** — Added `starred Boolean @default(false)` field
- **Migration** — `20251129185730_add_starred_field`

#### API Updates

- **PATCH /api/cards/[id]** — New endpoint for toggling star
  - Accepts `{ action: 'toggleStar' }` body
  - Returns updated card with new starred status
- **Database Queries** — Added helper functions:
  - `toggleCardStarred(id)` — Toggle starred status
  - `getStarredCards()` — Fetch all starred cards

#### Technical Details

- Type updates:
  - Extended `Card` type with `starred: boolean`
  - Updated `toDomainCard()` mapping
- Component updates:
  - `Card.tsx`: Star toggle with loading state
  - `DraggableCard.tsx`: Prop threading
  - `DraggableBoard.tsx`: Prop threading
  - `AppLayout.tsx`: Header star button
  - `FilterPanel.tsx`: Starred section with styling
- Hook updates:
  - `useSearch.ts`: Starred filtering and count

### 📱 Roadmap Update

#### Added

- **Phase 6: Mobile App Layout** — Added comprehensive mobile responsive design phase to ROADMAP.md
  - Responsive sidebar with hamburger menu
  - Mobile-first card layouts (single/double column)
  - Swipe gestures for navigation
  - Bottom navigation component
  - Floating action button (FAB)
  - Touch-optimized modals (full-screen)
  - Pull-to-refresh functionality
  - Safe area insets for notched devices
  - Responsive breakpoint definitions (mobile/tablet/desktop)

### 📄 File Upload for Documentation (Phase 1: ROADMAP)

#### Added

- **Documentation File Upload** – Upload .md and .pdf files to Documentation cards
  - Supports Markdown (.md) and PDF (.pdf) files
  - 10MB file size limit with validation
  - Base64 file storage in database
  - PDF text extraction with `pdf-parse` library
  - Searchable extracted text stored in `content` field
  - File metadata tracking (fileName, fileType, fileSize)
  - Drag-and-drop and click-to-upload UI
  - File preview card with icon, name, size, and text preview
  - Download button for retrieving original files
  - Client-side file processing utilities
  - Optional: Manual text entry if no file uploaded

#### Changed

- **Card Database Schema** – Added file fields to Card model:
  - `fileData String?` – Base64-encoded file data
  - `fileName String?` – Original filename
  - `fileType String?` – MIME type (application/pdf, text/markdown)
  - `fileSize Int?` – File size in bytes
- **CreateCardModal** – Enhanced doc card creation:
  - File upload zone with drag-drop for documentation
  - File metadata display with icon and preview
  - Fallback to manual text entry if no file
  - File type validation and error handling
- **Card Display** – File attachment preview:
  - Shows file icon, name, type, and size
  - Download button (ArrowDownTrayIcon) to save original file
  - Text preview snippet from extracted content
  - Matches existing image card layout pattern

#### Fixed

- **PDF Text Extraction** – Fixed `pdf-parse` module loading and usage errors
  - **Issue 1**: Corrected dynamic import to use `PDFParse` named export from v2.4.5+
    - Switched from synchronous `require()` to async `import()` with proper module handling
    - Resolved "parser is not a function" runtime error
  - **Issue 2**: Fixed PDFParse constructor instantiation
    - Constructor requires `LoadParameters` object with `data` field (buffer) and `verbosity` option
    - Use `getText()` method (not `parse()`) to extract text from PDF
    - `TextResult` returned has `text` property with full extracted content
    - Call `parser.destroy()` to clean up resources after extraction
    - Resolved "Cannot read properties of undefined (reading 'verbosity')" error
  - **Issue 3**: Configured PDF.js worker for client-side parsing
    - PDF.js (used by pdf-parse) requires `GlobalWorkerOptions.workerSrc` to be set
    - Added `PDFParse.setWorker()` call with CDN URL for browser environment
    - Worker configured once on first load to avoid multiple initializations
    - **CDN Version Workaround**: pdf-parse uses pdfjs-dist v5.4.296, but CDN only has v5.4.149
    - Using closest available CDN version: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs`
    - Minor version difference (149 vs 296) appears compatible for basic text extraction
    - If issues arise, will need to bundle worker locally from node_modules
    - Resolved "No 'GlobalWorkerOptions.workerSrc' specified" and CDN 404 errors
  - Graceful fallback to empty string if parsing fails (user can manually enter content)

#### Technical Details

- New files created:
  - `src/lib/utils/fileUtils.ts` (188 lines) – File processing utilities
- Database migration:
  - Added file fields to Card model
  - Migration: `20251025005336_add_file_upload_support`
- Dependencies:
  - `pdf-parse` v1.1.1 – PDF text extraction (13 packages)
- API updates:
  - Updated POST `/api/cards` to handle file fields
  - `createCardWithTags()` now accepts fileData parameters
- Component updates:
  - `CreateCardModal.tsx`: File upload UI for doc type
  - `Card.tsx`: File attachment display with download
- File utilities:
  - `validateDocFile()` – Type & size validation
  - `processDocFile()` – Extract text & convert to base64
  - `extractPdfText()` – PDF parsing with lazy load
  - `extractMarkdownText()` – UTF-8 markdown reading
  - `downloadFile()` – Save original file to disk
  - `formatFileSize()` – Human-readable sizes
  - `getFileIcon()` – Emoji icons (📕 PDF, 📝 Markdown)

### 📝 Notes Category

#### Added

- **Notes Category** – New sixth category for quick thoughts and ideas
  - Purple color scheme (#a855f7)
  - 📝 Note card type with PencilSquareIcon
  - Auto-categorization for note cards
  - Example note card in seed data

#### Fixed

- **Images Category Placeholder** – Added proper base64-encoded gradient image
  - Pink/purple gradient placeholder (400x300 PNG)
  - Ensures Images category is not empty on fresh install
  - Empty state "Add your first card" buttons confirmed functional

### 🛠️ Dashboard Modal

#### Fixed

- **Lingering Overlay** – Closing a card modal now removes the dark backdrop so the dashboard stays bright and interactive.
  - `CardModal` mounts at the page root instead of inside an extra full-screen `<aside>` wrapper.
  - Added a short post-close timeout that clears `selectedCard`, ensuring Headless UI tears down its backdrop before we unmount the modal.

---

## [1.2.0] - 2025-10-24

### 🖼️ Image/Screenshot Cards & Enhanced UX

#### Added

- **Image Card Type** – New card type for saving photos and screenshots
  - Base64 image storage in database (`imageData` field)
  - Image compression and resizing (max 1920×1920, 85% quality, 5MB limit)
  - Support for PNG, JPEG, WebP, and GIF formats
  - Drag-and-drop image upload with preview
  - Auto-categorization to "Images" category
- **Images Category** – Dedicated fifth category on dashboard
  - Positioned next to Documentation category
  - Consistent 340px column width across all categories
  - Placeholder image card included
  - Functional + button for quick image additions
- **Lightbox Preview** – Full-screen image viewer
  - Glass-styled modal with backdrop blur
  - Download image button (saves original filename)
  - Copy to clipboard button (auto-converts JPEG to PNG)
  - ESC key support for quick closing
  - Displays image title in header
- **Copy Functionality** – One-click content copying
  - Copy button on all text-based cards (bookmarks, snippets, commands, docs)
  - Visual feedback ("Copy" → "Copied!" with 2-second timeout)
  - Uses Clipboard API for reliable copying
  - Icon: `ClipboardIcon` from heroicons
- **Delete Functionality** – Safe card deletion
  - Delete button in CardModal footer (red trash icon)
  - Two-step confirmation dialog prevents accidental deletions
  - "Delete this card?" prompt with "Yes, delete" and "Cancel" buttons
  - Auto-refreshes board after deletion
  - Confirmation state resets when modal closes or different card opens

#### Changed

- **Category Column Widths** – All categories now use consistent 340px fixed width
- **CardModal Layout** – Reorganized footer into two sections:
  - Left: Delete button with confirmation UI
  - Right: Copy button, Visit Link (bookmarks), Close button
- **CreateCardModal** – Removed category dropdown (auto-selects based on card type)
- **Auto-Category Mapping** – Card types automatically route to correct categories:
  - `bookmark` → Bookmarks
  - `snippet` → Code Snippets
  - `command` → Commands
  - `doc` → Documentation
  - `image` → Images

#### Fixed

- **JPEG Clipboard Issue** – JPEG images now convert to PNG for clipboard compatibility
  - Uses canvas-based conversion before clipboard write
  - Clipboard API only supports PNG format
  - Original JPEG storage preserved (conversion only for clipboard)
- **Delete Confirmation Persistence** – Confirmation dialog now resets properly
  - Fixed state leak between different cards
  - `useEffect` resets `showDeleteConfirm` when modal closes or card changes
- **Image Display** – Images now render as thumbnails with lightbox trigger
  - Thumbnail max height: 256px (16rem)
  - Click to open full-screen lightbox
  - Removed text-only display of filenames

#### Technical Details

- New files created:
  - `src/lib/utils/imageUtils.ts` (173 lines) – Image processing utilities
  - `src/components/ui/Lightbox.tsx` (181 lines) – Glass lightbox modal
- Database migration:
  - Added `imageData String?` field to Card model
  - Migration: `20251024195709_add_image_support`
- API updates:
  - Updated POST `/api/cards` to handle imageData
  - Existing DELETE `/api/cards/[id]` used for card deletion
- Component updates:
  - `CardModal.tsx`: Added copy, delete, and state management
  - `Card.tsx`: Image rendering with thumbnail and lightbox
  - `CreateCardModal.tsx`: Image upload UI with drag-drop
  - `DraggableBoard.tsx`: Fixed column widths
- Type system:
  - Added `'image'` to `CardType` union
  - Extended `Card` interface with `imageData?: string`
- Image processing:
  - `processImage()` – Compress & resize with quality control
  - `validateImageFile()` – Type & size validation
  - `downloadImage()` – Save to disk with original name
  - `copyImageToClipboard()` – Clipboard write with PNG conversion

---

## [1.1.0] - 2025-10-24

### 🌌 Neon Glass Redesign & Theme Engine

#### Added

- **Glass Transparency Slider** – Users can fine-tune the translucency of the interface, from airy to fully frosted, with instant updates across dark and light modes.
- **Glassmorphic Shell** – Rebuilt the entire UI chrome (sidebar, header, cards, modals, filter panels) using a reusable `glass` utility with density variants, blurred backdrops, and accent-aware tinting.
- **Theme Registry** – Centralized `accentThemes` and `iconThemes` palettes (`src/lib/themeRegistry.ts`) providing curated presets (Byte Classic, Neon Night, Rainbow Sprint, Midnight Carbon, Sunset Espresso, Pastel Haze, and more).
- **Dynamic Icon Palettes** – Each icon theme exposes deterministic color helpers via `useTheme()` so icons, badges, and statistics pick consistent neon hues.
- **Wallpaper Controls** – Added optional wallpaper uploader with preview and one-click reset inside Settings, persisting data URLs in localStorage.
- **Custom Icon Color Picker** – When the “Custom Single” icon theme is active, users can pick any hex color which instantly propagates across the interface.
- **JetBrains Mono Branding** – Introduced a dedicated Dev/Nerd logotype using JetBrains Mono for the ByteBox wordmark in the sidebar.

#### Changed

- **Theme Provider** – Rewrote `ThemeContext` to initialize from localStorage post-hydration, push accent/icon variables into CSS, and support wallpaper tinting without SSR mismatches.
- **Global Tokens** – Expanded `globals.css` with shared CSS variables (`--accent-*`, `--icon-*`, `--glass-*`) and helper classes (`surface-card`, `accent-gradient`, `font-brand`).
- **App Layout** – Sidebar widened to 18rem, navigation buttons restyled with glass panels, animated accent indicator, and gradient quick-add button; header now pulses with the active accent palette. Export/Import controls now use slim glass tiles so the sidebar stays compact.
- **Cards & Columns** – Card surfaces use glass density, monochrome badges give way to accent-aware borders, draggables inherit palette-driven shadows, and column headers pick up category color tints.
- **Search & Tags** – Search filters, tag stats, empty states, and loaders now mirror the new theme system with accent gradients and icon palette usage.
- **Settings Experience** – Redesigned Settings page to showcase accent/icon themes, wallpaper management, and the updated appearance controls. Theme mode is now toggled exclusively via the icon button, and glass intensity has its own slider with contextual guidance.

#### Fixed

- **Hydration Stability** – Theme state now hydrates identically on server/client with hidden pre-mount shell, eliminating mismatched inline styles when switching palettes.
- **Wallpaper Reset** – Added explicit “Reset background” action so user-uploaded wallpapers can be removed without replacing files.

### 📎 Documentation

- Updated `README.md`, `OVERVIEW.md`, and `glass_theming_guide.md` to document the glass system, theme registry, accent/icon presets, wallpaper uploader, and new layout visuals.
- Logged the redesign details and new customization workflow in this changelog.

---

## [1.0.1] - 2025-10-24

### 🎨 UI Polish & Bug Fixes

#### Changed

- **Sidebar Header Cleanup**
  - Removed "by Pink Pixel" subtitle for cleaner look
  - Removed user avatar placeholder
  - Increased logo size from `w-8 h-8` to `w-10 h-10`
  - Increased "ByteBox" title from `text-lg` to `text-xl`
- **Button Color Consistency**
  - Updated all primary action buttons to consistent darker pink (`bg-pink-600 hover:bg-pink-700`)
  - Applied to: Quick Add, Import Data, Search filters, Tag sorting, Create Card modal
  - Exception: Clear All Data button kept as red for safety indication

#### Added

- **Missing Pages**
  - Created comprehensive Settings page with theme toggle, data management, and about section
  - Created Search page with advanced filtering (All/Title/Content/Tags) and tag-based search
  - Created Tags page with statistics dashboard and tag management
- **Quick Add Feature**
  - Implemented full Quick Add functionality from sidebar
  - Quick Add button opens CreateCardModal on Dashboard
  - Quick Add on other pages directs users to Dashboard with helpful message
  - Added + buttons to category column headers with pre-selection
- **Card Creation System**
  - Built CreateCardModal component with comprehensive form
  - Support for 4 card types: Bookmark, Snippet, Command, Doc
  - Language dropdown with 13 programming languages
  - Tag multi-select with inline tag creation
  - Category pre-selection when clicking column + buttons
  - Full validation and error handling

#### Fixed

- **Hydration Mismatch Error**
  - Added `suppressHydrationWarning` to html and body tags
  - Prevented flash of unstyled content on theme load
  - Fixed browser extension attribute conflicts
- **Type Safety**
  - Removed all `any` types, replaced with proper TypeScript interfaces
  - Fixed Card component type compatibility across pages
  - Added proper type guards and null handling
  - All TypeScript compilation errors resolved
- **Code Quality**
  - Fixed all ESLint errors (only minor unused import warnings remain)
  - Used `useCallback` for performSearch to avoid unnecessary re-renders
  - Fixed ThemeContext setState-in-effect warning with proper initialization
  - Project builds successfully with `npm run build`

#### Technical Details

- New files created:
  - `src/app/settings/page.tsx` (241 lines)
  - `src/app/search/page.tsx` (242 lines)
  - `src/app/tags/page.tsx` (243 lines)
  - `src/components/cards/CreateCardModal.tsx` (384 lines)
- Database helper functions:
  - Added `createCardWithTags()` for atomic card creation with tags
  - Added `deleteAllData()` for safe data clearing in Settings
- API enhancements:
  - Updated POST `/api/cards` to handle tag creation
  - Added DELETE `/api/cards` endpoint for data clearing

---

## [1.0.0] - 2025-01-29

### 🎉 Initial Release

The first public release of **ByteBox** — a lightweight web dashboard for developer resources!

### ✨ Added

#### Core Features

- **Kanban-Style Boards** — Organize resources into customizable categories
- **Smart Tagging System** — Add multiple tags to cards with color-coded filtering
- **Lightning-Fast Search** — Global search with `Cmd/Ctrl+K` keyboard shortcut
- **Drag & Drop** — Reorder cards and move them between categories seamlessly
- **CRUD Operations** — Create, read, update, and delete cards with modal interface
- **Syntax Highlighting** — Code blocks with 35+ languages powered by Shiki
- **Copy-to-Clipboard** — One-click copying for code snippets

#### Database & Backend

- **SQLite Database** — Fast local storage with Prisma ORM
- **API Routes** — RESTful endpoints for cards, export, and import
- **Seed Data** — Example cards and categories for quick start
- **Data Validation** — Input validation and error handling

#### UI/UX

- **Dark Mode First** — Beautiful dark theme by default
- **Light Mode** — Optional light theme with theme toggle
- **Theme Persistence** — Theme preference saved to localStorage
- **System Detection** — Respects OS theme preference
- **Pink Pixel Branding** — Pink/purple gradient accents (#ec4899 → #8b5cf6)
- **Responsive Design** — Mobile-friendly layout
- **Smooth Animations** — Tailwind CSS transitions and hover effects

#### Search & Filtering

- **Full-Text Search** — Search across titles, descriptions, tags, and content
- **Tag Filtering** — Filter by one or multiple tags
- **AND/OR Logic** — Toggle between inclusive (OR) and exclusive (AND) filtering
- **Real-Time Results** — Instant search results as you type

#### Export/Import

- **Export Data** — Download all data as JSON backup
- **Import Data** — Restore data from JSON file
- **Validation** — Import validation with error messages
- **Merge Logic** — Import merges data instead of replacing

#### Developer Experience

- **Next.js 16** — Modern React framework with App Router
- **TypeScript 5** — Full type safety
- **Tailwind CSS 4.1.16** — Utility-first styling
- **Prisma 6.18.0** — Next-gen ORM
- **@dnd-kit** — Accessible drag-and-drop library
- **Headless UI** — Accessible UI components

### 🛠️ Technical Details

#### Dependencies

- `next`: 16.0.0
- `react`: 19.2.0
- `typescript`: ^5
- `tailwindcss`: ^4.1.16
- `@prisma/client`: ^6.18.0
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `@headlessui/react`: ^2.2.0
- `@heroicons/react`: ^2.2.0
- `shiki`: ^1.26.0

#### Database Schema

- **Category** — Organizing containers (e.g., React, APIs, Commands)
- **Tag** — Metadata labels (e.g., hooks, typescript, frontend)
- **Card** — Individual resource items with title, description, content, tags, and optional syntax highlighting

#### Project Structure

- `/src/app` — Next.js App Router pages and API routes
- `/src/components` — Reusable React components
- `/src/contexts` — React contexts (ThemeContext)
- `/src/hooks` — Custom React hooks (useSearch)
- `/src/lib` — Utilities, database helpers, and Prisma client
- `/src/types` — TypeScript type definitions
- `/prisma` — Database schema, migrations, and seed script

### 📚 Documentation

- **README.md** — Comprehensive setup and usage guide
- **CONTRIBUTING.md** — Contribution guidelines
- **LICENSE** — Apache License 2.0
- **OVERVIEW.md** — Project architecture and structure
- **ROADMAP.md** — Development plan and completed tasks

### 🎨 Design System

- **Colors** — Pink (#ec4899) and purple (#8b5cf6) gradients
- **Typography** — System fonts with proper hierarchy
- **Spacing** — Tailwind CSS spacing scale
- **Shadows** — Subtle elevation with colored shadows
- **Animations** — Smooth transitions and hover effects

---

## [How to Update]

### From 0.x.x to 1.0.0

This is the initial release. No migration required!

---

## [Contributors]

**Made with ❤️ by [Pink Pixel](https://pinkpixel.dev)**

- **Author**: Pink Pixel
- **Website**: [pinkpixel.dev](https://pinkpixel.dev)
- **GitHub**: [@pinkpixel-dev](https://github.com/pinkpixel-dev)
- **Discord**: @sizzlebop
- **Email**: admin@pinkpixel.dev

**Dream it, Pixel it** ✨

---

_For detailed changes and commit history, see the [GitHub repository](https://github.com/your-username/bytebox)._
