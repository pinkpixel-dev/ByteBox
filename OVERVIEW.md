# 📚 ByteBox – Project Overview

**Last Updated**: March 12, 2026
**Version**: 2.5.1
**Author**: [Pink Pixel](https://pinkpixel.dev)
**License**: Apache 2.0
**Status**: ✅ Stable & Complete

---

## 🎯 Project Purpose

**ByteBox** is a lightweight web dashboard designed specifically for developers who want a centralized, beautiful, and efficient way to organize their digital resources. Think of it as **Trello for developer resources** — a Kanban-style board system where you can pin bookmarks, documentation links, API references, command snippets, and code examples.

### Key Goals

- 📦 **Organize** — Group resources into custom categories (e.g., React, APIs, Commands, Images)
- 🏷️ **Tag** — Add multiple tags for flexible filtering and discovery
- ⭐ **Star** — Mark important cards as favorites for quick access
- 🔍 **Search** — Find anything instantly with full-text search
- 🎨 **Drag & Drop** — Visually reorder cards, move them between columns, and reorder the columns themselves
- 💻 **Code-Friendly** — Syntax highlighting for 100+ languages (Shiki)
- 🖼️ **Image Storage** — Save screenshots and images with full-screen lightbox preview, download, and clipboard support
- 📋 **Copy & Delete** — One-click content copying and safe two-step card deletion
- 🌌 **Customize** — Glassmorphic UI with accent/icon themes, saveable custom solids/gradients, wallpaper library or uploads, font/size controls, resizable sidebar/columns, and saveable presets
- 🌫️ **Tune the Glow** — Real-time glass transparency slider that adapts blur, opacity, and shadows to your wallpaper

---

## 🏗️ Architecture

### Tech Stack Overview

| Layer                   | Technology                  | Purpose                                                      |
| ----------------------- | --------------------------- | ------------------------------------------------------------ |
| **Framework**           | Next.js 16.0.6 (App Router) | React-based SSR/SSG framework with modern routing            |
| **Language**            | TypeScript 5.9.x            | Type safety and better DX                                    |
| **Styling**             | Tailwind CSS 4.x            | Utility-first CSS framework                                  |
| **Database**            | SQLite + Prisma 7.0.1       | Local lightweight database with ORM (better-sqlite3 adapter) |
| **Drag & Drop**         | @dnd-kit                    | Accessible drag-and-drop library                             |
| **Syntax Highlighting** | Shiki 3.17.0                | Code highlighting with VS Code themes                        |
| **UI Components**       | @headlessui/react 2.2.9     | Accessible unstyled components                               |
| **Icons**               | @heroicons/react 2.2.0      | Beautiful SVG icons                                          |

### Architecture Diagram (Conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js App Router (React 19 + TypeScript)        │  │
│  │  ├─ Components (Cards, Boards, Modals, UI)         │  │
│  │  ├─ Contexts (ThemeContext)                         │  │
│  │  ├─ Hooks (useSearch, etc.)                         │  │
│  │  └─ Utilities (cn, formatDate, syntax, etc.)       │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↕                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  API Routes (/api/cards, /api/categories,          │  │
│  │              /api/settings, /api/export,           │  │
│  │              /api/import)                          │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM (Server)                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Database Queries (getAllCards, createCard, etc.)   │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│               SQLite Database (dev.db)                      │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Tables: Category, Tag, Card, UserSettings,        │  │
│  │          _CardToTag (join table)                    │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Glass & Theme System

A cohesive customization stack that keeps the UI consistent while giving users deep control over color, texture, and type.

- **Theme Registry (`src/lib/themeRegistry.ts`)** – Curated accent palettes (Byte Classic, Neon Night, Rainbow Sprint, Midnight Carbon, Sunset Espresso, Pastel Haze) and icon palettes (Neon Grid, Carbon Tech, Espresso Circuit, Rainbow Loop, Pink Pulse, Custom Single) plus gradient presets, solid-color presets, and wallpaper metadata.
- **Theme Context (`src/contexts/ThemeContext.tsx`)** – Loads settings from the database API on mount (with localStorage for instant hydration fallback), applies CSS variables (`--accent-*`, `--icon-*`, `--glass-*`, `--font-*`, sizing/width tokens, background tokens), and keeps uploads/gradients/solids/presets in sync. Saves changes to both localStorage and API with 500ms debouncing. Supports 17 UI fonts and 13 mono fonts including stylized options.
- **Global Tokens (`src/app/globals.css`)** – Glass utilities (`.glass`, `.glass--dense`), surface helpers, dynamic typography classes, and configurable background stack (custom gradient, preset wallpaper, or user upload).
- **Settings UI (`src/app/settings/page.tsx`)** – Glass slider, accent/icon pickers, custom accent builder (2–6 colors), solid + gradient editors with saveable custom color/gradient libraries, wallpaper library (12 built-in wallpapers) plus upload support, UI + mono font selectors, UI/body/category/card/code size controls, sidebar/column width controls, and named presets for saving/loading the whole appearance.
- **Component Integration** – Layout, cards, filters, search, and stats all subscribe to the theme hooks so changes propagate instantly across the app.

All customizations are database-backed with localStorage as a fast hydration layer, ensuring consistent rendering on first paint and persistence across browser sessions.

---

# 📁 Project Structure

```
bytebox/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/                       # API routes
│   │   │   ├── cards/                 # Card CRUD operations
│   │   │   │   ├── route.ts           # GET (all), POST (create), PATCH (reorder), DELETE (clear all)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # GET (single), PUT (update), DELETE, PATCH (toggle star)
│   │   │   ├── categories/
│   │   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # PATCH (rename/recolor), DELETE
│   │   │   ├── settings/
│   │   │   │   └── route.ts           # GET, PATCH, PUT (user settings persistence)
│   │   │   ├── export/
│   │   │   │   └── route.ts           # GET (export all data as JSON)
│   │   │   └── import/
│   │   │       └── route.ts           # POST (import JSON backup)
│   │   ├── globals.css                # Tailwind CSS + glass/theming tokens
│   │   ├── layout.tsx                 # Root layout with metadata & ThemeProvider
│   │   ├── page.tsx                   # Main dashboard page (boards)
│   │   ├── search/
│   │   │   └── page.tsx               # Search page with advanced filtering
│   │   ├── settings/
│   │   │   └── page.tsx               # Settings page (theme, data management, about)
│   │   ├── categories/
│   │   │   └── page.tsx               # Categories page with CRUD, color editing, and card counts
│   │   ├── tags/
│   │   │   └── page.tsx               # Tags page with statistics and management
│   │
│   ├── components/
│   │   ├── cards/                     # Card-related components
│   │   │   ├── Card.tsx               # Card display component with backdrop button pattern for accessibility
│   │   │   ├── CardModal.tsx          # Card view/edit modal with full editing, tag management, language dropdown, copy & delete
│   │   │   ├── CreateCardModal.tsx    # New card creation modal with file upload and language dropdown
│   │   │   └── DraggableCard.tsx      # Card with @dnd-kit drag wrapper
│   │   ├── layout/                    # Layout components
│   │   │   ├── AppLayout.tsx          # Main app shell (sidebar with Next.js Link navigation, header, collapsible with icon/banner logo)
│   │   │   ├── Board.tsx              # Kanban board wrapper (drag context)
│   │   │   └── DraggableBoard.tsx     # Board with @dnd-kit drop zones and CSS Grid columns
│   │   └── ui/                        # Reusable UI components
│   │       ├── CodeBlock.tsx          # Syntax-highlighted code display
│   │       ├── ExportImport.tsx       # Export/import UI controls
│   │       ├── FilterPanel.tsx        # Tag filtering sidebar with view mode buttons
│   │       ├── Lightbox.tsx           # Full-screen image preview modal
│   │       ├── SearchBar.tsx          # Global search input (Cmd+K)
│   │       ├── Tag.tsx                # Tag badge component
│   │       └── ViewModeSelector.tsx   # View mode dropdown (All/Recent/Starred/By Tag)
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx           # Theme, accent, icon, background, font, and preset controller
│   │
│   ├── hooks/
│   │   └── useSearch.ts               # Search, filter, view mode, and starred logic hook
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts               # Database exports
│   │   │   ├── prisma.ts              # Prisma client singleton
│   │   │   └── queries.ts             # Database query functions (createCardWithTags, updateCardWithTags, toggleCardStarred, ensureDefaultCategories, etc.)
│   │   ├── themeRegistry.ts           # Accent/icon palettes, gradients, wallpapers, fonts
│   │   └── utils/
│   │       ├── fileUtils.ts           # File processing (PDF/Markdown extraction, validation)
│   │       ├── imageUtils.ts          # Image processing (compress, validate, copy, download)
│   │       ├── index.ts               # Utility exports (cn, formatDate, etc.)
│   │       └── syntax.ts              # Shiki syntax highlighting setup
│   │       ├── imageUtils.ts          # Image processing (compress, validate, copy, download)
│   │       ├── syntax.ts              # Shiki syntax highlighting setup
│   │       └── truncate.ts            # Text truncation utility
│   │
│   └── types/
│       └── index.ts                   # TypeScript type definitions
│
├── prisma/
│   ├── schema.prisma                  # Database schema (Category, Tag, Card)
│   ├── seed.ts                        # Seed script for example data
│   └── migrations/                    # Database migration history
│       └── [timestamp]_init/
│           └── migration.sql          # Initial migration SQL
│
├── scripts/
│   ├── setup.sh                       # One-command first-run setup (env, install, migrate, seed)
│   └── next-with-env.cjs              # Dev/build environment wrapper
│
├── public/
│   └── wallpapers/                    # 12 built-in wallpapers (Abstract, Cyber, Dark, Gradient, etc.)
│
├── .env                               # Environment variables (DATABASE_URL)
├── .env.example                       # Example env file (for contributors)
├── eslint.config.mjs                  # ESLint flat config (v9+)
├── .gitignore                         # Git ignore rules
├── CHANGELOG.md                       # Version history and release notes
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # Apache 2.0 license
├── next.config.ts                     # Next.js configuration
├── OVERVIEW.md                        # This file (project architecture)
├── package.json                       # NPM dependencies and scripts
├── postcss.config.mjs                 # PostCSS configuration
├── prisma.config.ts                   # Prisma configuration (better-sqlite3 adapter)
├── README.md                          # Project introduction and usage guide
├── ROADMAP.md                         # Development plan and completed tasks
└── tsconfig.json                      # TypeScript configuration
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│    Category     │       │       Tag       │
├─────────────────┤       ├─────────────────┤
│ id (String PK)  │       │ id (String PK)  │
│ name (String)   │       │ name (String)   │
│ order (Int)     │       │ color (String)  │
│ cards (Card[])  │       │ cards (Card[])  │
└─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        │   ┌──────────────────┐  │
        └──▶│      Card        │◀─┘
            ├──────────────────┤
            │ id (String PK)   │
            │ type (String)    │
            │ title (String)   │
            │ description (?)  │
            │ content (?)      │
            │ language (?)     │
            │ imageData (?)    │
            │ starred (Bool)   │
            │ order (Int)      │
            │ categoryId (FK)  │
            │ createdAt (Date) │
            │ updatedAt (Date) │
            │ category (Cat.)  │
            │ tags (Tag[])     │
            └──────────────────┘
```

### Schema Details (Prisma)

**Category**

- `id`: Unique identifier (auto-generated)
- `name`: Category name — represents a topic/project (e.g., "Frontend", "Backend", "DevOps")
- `description`: Optional short description
- `color`: Hex color for the column header accent
- `order`: Display order for sorting categories
- `cards`: One-to-many relation with Card model

> On a fresh database, 5 default categories are created automatically: 🌐 Frontend, ⚙️ Backend, 🚀 DevOps, 📚 Learning & Research, 💡 Ideas & Inspiration.

**Tag**

- `id`: Unique identifier (auto-generated)
- `name`: Tag name (e.g., "hooks", "typescript", "frontend")
- `color`: Hex color code for visual differentiation
- `cards`: Many-to-many relation with Card model

**UserSettings** (Singleton)

- `id`: Fixed value "default" (singleton pattern)
- `mode`: Base appearance mode value used by the theme engine
- `accentThemeId`: Selected accent theme ID
- `iconThemeId`: Selected icon theme ID
- `customIconColor`: Custom icon hex color
- `glassIntensity`: Glass transparency level (0-100)
- `backgroundConfig`: JSON object with active background plus saved solid-color and gradient libraries
- `fontConfig`: JSON object with UI/mono font selections, UI/body/category/card/code sizes, and persisted sidebar/column widths
- `customAccentThemes`: JSON array of user-created accent themes
- `settingsPresets`: JSON array of saved settings presets
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated

**Card**

- `id`: Unique identifier (auto-generated)
- `type`: Card type (`'bookmark' | 'snippet' | 'command' | 'doc' | 'image' | 'note'`)
- `title`: Card title
- `description` (optional): Short description
- `content` (optional): Full content (code snippets, URLs, notes)
- `language` (optional): Programming language for syntax highlighting
- `imageData` (optional): Base64-encoded image data for image cards
- `fileData` (optional): Base64-encoded file data for doc cards (markdown, pdf)
- `fileName` (optional): Original filename of uploaded file
- `fileType` (optional): MIME type of file
- `fileSize` (optional): File size in bytes
- `starred`: Whether the card is starred/favorited (default: false)
- `order`: Display order within category
- `categoryId`: Foreign key to Category
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated
- `category`: Many-to-one relation with Category
- `tags`: Many-to-many relation with Tag (via join table `_CardToTag`)

---

## 🧩 Key Features & Implementation

### 1️⃣ Kanban-Style Boards (Drag & Drop)

**Technology**: @dnd-kit (core, sortable, utilities) + CSS Grid

**Implementation**:

- `Board.tsx` wraps the entire dashboard with `DndContext`
- `DraggableBoard.tsx` uses CSS Grid with user-configurable fixed column width (`repeat(n, {width}px)`)
- Columns are drag-reorderable and resizeable via column-edge drag handles
- Default column width is 320px and user-adjustable in Settings or by direct drag
- Horizontal scrolling activates naturally as column count or width grows
- `DraggableCard.tsx` wraps each card with `useDraggable` and `useSortable`
- Drag events (`onDragStart`, `onDragEnd`) handle reordering and category changes
- On drop, PATCH `/api/cards` with updated order/categoryId
- Database updates persist the new state

**User Experience**:

- Column width is user-controlled and persisted as part of appearance settings/presets
- Drag cards within a category to reorder
- Drag cards between categories to move them
- Visual feedback with hover states and active indicators

---

### 2️⃣ Smart Tagging & Filtering

**Technology**: React state + custom `useSearch` hook

**Implementation**:

- Tags are stored as a many-to-many relation (Card ↔ Tag)
- `FilterPanel.tsx` displays all tags with checkboxes
- Clicking a tag toggles it in the filter state
- AND/OR toggle switches between filtering modes:
  - **AND** — Card must have ALL selected tags
  - **OR** — Card must have AT LEAST ONE selected tag
- Filtered results update in real-time

**User Experience**:

- Click tags on cards to add them to filters
- Toggle AND/OR logic for complex queries
- See filtered results immediately

---

### 3️⃣ Lightning Search (`Cmd/Ctrl+K`)

**Technology**: `useSearch` hook + keyboard event listeners

**Implementation**:

- Global keyboard listener captures `Cmd/Ctrl+K`
- `SearchBar.tsx` opens as a modal/overlay
- Search query filters cards by:
  - Title (case-insensitive)
  - Description (case-insensitive)
  - Tags (name match)
  - Content (full-text search)
- Starred filter integration (show only starred cards)
- Debounced search for performance
- `ESC` key closes the search bar

**User Experience**:

- Press `Cmd/Ctrl+K` from anywhere
- Type to search instantly
- Results update as you type
- Filter by starred cards with `Cmd/Ctrl+Shift+S`

---

### 4️⃣ Syntax Highlighting (Shiki)

**Technology**: Shiki 3.17.0 (VS Code-powered highlighter)

**Implementation**:

- `syntax.ts` initializes Shiki with multiple languages
- `CodeBlock.tsx` renders highlighted code blocks
- Supports 100+ languages via validated dropdown (JavaScript, Python, Go, Rust, etc.)
- Syntax theme tokens follow the active appearance profile
- Copy-to-clipboard button for easy code copying

**User Experience**:

- Code snippets are beautifully highlighted
- One-click copy to clipboard
- Theme-aware color tokens from the current appearance profile

---

### 5️⃣ Export/Import & Data Management

**Technology**: JSON export/import with Prisma transactions

**Implementation**:

- **Export** (`/api/export`):
  - Fetches all categories, tags, and cards from database
  - Returns JSON with metadata (version, exportedAt, app name)
  - Client triggers file download
- **Import** (`/api/import`):
  - Accepts JSON file upload
  - Validates structure and version
  - Uses Prisma transaction for atomic import
  - Upserts categories and tags
  - Creates new cards with proper relationships
  - Returns import counts (categories, tags, cards)
- `ExportImport.tsx` renders compact glass tiles so the sidebar module stays slim while the settings card mirrors the new aesthetic.

**User Experience**:

- Tap the **Export Data** tile to download a JSON backup
- Tap the glowing **Import Data** tile to upload and merge a backup
- Success/error messages include import counts
- Auto-refresh after successful import

---

### 6️⃣ Image/Screenshot Cards

**Technology**: Canvas API + Clipboard API + Base64 encoding

**Implementation**:

- **Image Processing** (`imageUtils.ts`):
  - `processImage()` – Compress and resize images (max 1920×1920, 85% quality, 5MB limit)
  - `validateImageFile()` – Type and size validation (PNG, JPEG, WebP, GIF)
  - `downloadImage()` – Save to disk with original filename
  - `copyImageToClipboard()` – Copy to clipboard (auto-converts JPEG to PNG)
- **Lightbox Component** (`Lightbox.tsx`):
  - Full-screen glass-styled modal with backdrop blur
  - Download, copy to clipboard, and close buttons
  - ESC key support for quick closing
  - Title display in header
- **Card Display** (`Card.tsx`):
  - Image thumbnails (max-h-64) with lightbox trigger on click
  - Auto-categorized to "Images" category
- **Upload UI** (`CreateCardModal.tsx`):
  - Drag-and-drop image upload with preview
  - File browser fallback
  - Real-time image preview before saving
- **Database Storage**:
  - Images stored as base64 in `imageData` field
  - Supports all standard web image formats
  - Compressed automatically to reduce storage size

**User Experience**:

- Select "Image" card type in creation modal
- Drag-and-drop or browse for images
- Preview image before saving
- Click thumbnail to view full-screen
- Download or copy images from lightbox
- ESC to close lightbox quickly

---

### 7️⃣ Card Editing, Copy & Delete Functionality

**Technology**: Clipboard API + Two-step confirmation pattern + Form state management

**Implementation**:

- **Edit Cards** (`CardModal.tsx`):
  - Toggle between view and edit modes with Edit/Cancel buttons
  - Edit title, description, content, and language via dropdown (for snippets/commands)
  - Tag management: toggle tags on/off with visual tag pills
  - Star toggle directly in modal header
  - Save changes via PATCH `/api/cards/[id]` with `updateCardWithTags()` query
  - Minimum modal height (400px) prevents cramped appearance with short content
- **Copy Content** (`CardModal.tsx`):
  - Copy button on all text-based cards (bookmarks, snippets, commands, docs)
  - Uses `navigator.clipboard.writeText()` for reliable copying
  - Visual feedback ("Copy" → "Copied!" with 2-second timeout)
  - Icon: `ClipboardIcon` from heroicons
- **Delete Cards** (`CardModal.tsx`):
  - Red trash icon button in footer (left side)
  - Two-step confirmation prevents accidental deletions:
    1. Click trash icon → Shows "Delete this card?" prompt
    2. Click "Yes, delete" to confirm or "Cancel" to abort
  - Calls DELETE `/api/cards/[id]` endpoint
  - Auto-refreshes board after deletion
  - Confirmation state resets when modal closes or different card opens (via `useEffect`)

**User Experience**:

- Click "Edit" to switch to edit mode
- Modify any field: title, description, content, language
- Click tags to add/remove them from the card
- Toggle starred status directly in modal
- Click "Save" to persist changes, "Cancel" to discard
- Click copy button to copy card content to clipboard
- See "Copied!" confirmation for 2 seconds
- Click red trash icon to start deletion
- Confirm or cancel the deletion
- Board refreshes automatically after save or deletion

---

### 8️⃣ Appearance & Theme System

**Technology**: React Context API + localStorage

**Implementation**:

- `ThemeContext.tsx` manages the appearance profile, accent theme, icon palette, custom icon color, wallpaper, and glass intensity state (0–100).
- Preferences persist to localStorage (`bytebox-*`) and hydrate once the app mounts.
- Tailwind + CSS variable tokens style components consistently across customized appearances
- Logo shadow effects are appearance-aware (drop-shadow is only applied where it improves clarity)

**User Experience**:

- Drag the Glass Transparency slider to move from airy to frosted instantly
- All theme settings persist across sessions with smooth transitions

---

### 9️⃣ Collapsible + Resizable Sidebar

**Technology**: React state + Tailwind CSS transitions + Next.js Link

**Implementation**:

- `AppLayout.tsx` manages both `sidebarOpen` (expand/collapse) and persisted `sidebarWidth`
- Uses Next.js `Link` component for all sidebar navigation (Dashboard, Search, Tags, Settings)
- Client-side navigation preserves React state and theme settings across page transitions
- Sidebar transitions between a user-configurable expanded width (240–460px, default 240px) and 96px collapsed width
- **Logo Switching**:
  - Expanded: Shows full `logo_banner.png` (240×120)
  - Collapsed: Shows square `icon.png` (48×48)
  - Both logos use a stable React `key` strategy to avoid visual rendering artifacts during appearance updates
- **Sidebar Button**:
  - Uses `ChevronLeftIcon` when expanded (indicates collapse)
  - Uses `ChevronRightIcon` when collapsed (indicates expand)
  - Dynamic `aria-label` for accessibility
- **Layout Adaptation**:
  - Collapsed state uses vertical flex layout (`flex-col`) to center icon and button
  - Navigation items hide text labels when collapsed, showing only icons
  - Export/Import section and Quick Add text hidden when collapsed
  - Expanded width can be changed by dragging the sidebar edge and is saved in settings/presets

**User Experience**:

- Click chevron arrow to collapse/expand sidebar
- Drag the right edge of the sidebar to resize it
- Icons-only view when collapsed saves screen space
- Square logo icon maintains branding in collapsed state
- Smooth 300ms transition animation

---

### 10️⃣ Starred/Favorited Cards

**Technology**: React state + API route + Prisma

**Implementation**:

- **Database**:
  - `starred Boolean @default(false)` field on Card model
  - `toggleCardStarred()` query toggles starred status
  - `getStarredCards()` fetches all starred cards
- **API Route** (`/api/cards/[id]` PATCH):
  - Accepts `{ action: 'toggleStar' }` body
  - Returns updated card with new starred status
- **Card Component**:
  - Uses backdrop button pattern: non-interactive `<div>` wrapper with hidden `<button>` at z-0 for click handling
  - Interactive elements (star, download, image zoom) are real `<button>` elements at z-10
  - Star button in header (outline/solid star icon)
  - Amber color scheme (#fbbf24) with glow effect
  - Loading state during API call
  - Compliant with SonarQube S6819 and ESLint jsx-a11y accessibility rules
- **Dashboard Filtering**:
  - `useSearch` hook extended with `showStarredOnly` state
  - `starredCount` computed from all cards
  - Starred filter applied before search/tag filters
- **UI Integration**:
  - Header star button with badge count
  - Filter Panel toggle with keyboard shortcut hint
  - Keyboard shortcut `Cmd/Ctrl+Shift+S`

**User Experience**:

- Click star icon on any card to toggle starred status
- Starred cards show solid amber star with subtle glow
- Click header star button to filter to starred only
- See starred count in header and filter panel
- Use keyboard shortcut for quick filter toggle

---

## 🎨 Design System

### Color Palette

| Color                  | Value     | Usage                                   |
| ---------------------- | --------- | --------------------------------------- |
| **Pink**               | `#ec4899` | Primary accent, gradients, focus states |
| **Purple**             | `#8b5cf6` | Secondary accent, gradients             |
| **Surface Base**       | `#0a0a0a` | Primary app background surface          |
| **Surface Contrast**   | `#ffffff` | High-contrast background/surface option |
| **Text Primary Dark**  | `#1f2937` | Dark text token for bright surfaces     |
| **Text Primary Light** | `#f9fafb` | Light text token for deep surfaces      |

### Typography

- **UI Fonts**: 17 customizable fonts (Inter, Geist, Poppins, Raleway, Outfit, etc.)
- **Mono Fonts**: 13 monospace options (JetBrains Mono, Fira Code, SF Mono, etc.)
- **Headings**: Bold, uppercase for section titles
- **Body**: Regular weight, 1.5 line height
- **Code**: Selected mono font for code blocks and technical content

### Spacing

- **Margins**: 0, 1, 2, 3, 4, 6, 8 (Tailwind scale)
- **Padding**: Same as margins
- **Grid Gaps**: 4, 6, 8 for layouts

### Animations

- **Transitions**: All interactive elements have `transition-colors duration-200`
- **Hover States**: Subtle scale/color changes on cards and buttons
- **Drag Feedback**: Active drag state with shadow and opacity change

---

## 🔄 Data Flow

### Creating a Card (Example)

```
1. User clicks "Add Card" button
   ↓
2. CardModal opens (React state)
   ↓
3. User fills form (title, description, tags, etc.)
   ↓
4. User clicks "Create"
   ↓
5. Form submits → POST /api/cards
   ↓
6. API route validates input
   ↓
7. Prisma creates Card in database
   ↓
8. API returns new card data
   ↓
9. Frontend adds card to local state
   ↓
10. Board re-renders with new card
```

### Search Flow

```
1. User presses Cmd/Ctrl+K
   ↓
2. SearchBar opens (React state)
   ↓
3. User types query
   ↓
4. useSearch hook filters cards (local)
   ↓
5. Filtered results update in real-time
   ↓
6. Board shows only matching cards
```

### Drag & Drop Flow

```
1. User starts dragging a card
   ↓
2. @dnd-kit sets active card state
   ↓
3. User drags over a drop zone
   ↓
4. Drop zone highlights (visual feedback)
   ↓
5. User releases card
   ↓
6. onDragEnd calculates new position/category
   ↓
7. PATCH /api/cards with updated order
   ↓
8. Database updates order/categoryId
   ↓
9. Frontend updates local state
   ↓
10. Board re-renders with new card positions
```

---

## 🛠️ Development Workflow

### Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/bytebox.git
cd bytebox

# 2. Install dependencies
npm install

# 3. Set up database
echo 'DATABASE_URL="file:./dev.db"' > .env
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed  # Optional: seed with example data

# 4. Start dev server
npm run dev  # → http://localhost:3000
```

### Available Scripts

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start development server (hot reload) |
| `npm run build`     | Build for production                  |
| `npm run start`     | Start production server               |
| `npm run lint`      | Run ESLint                            |
| `npm run db:seed`   | Seed database with example data       |
| `npx prisma studio` | Open Prisma Studio (database GUI)     |
| `npx tsc --noEmit`  | TypeScript typecheck                  |

### Testing Checklist

- [ ] Lint passes (`npm run lint`)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing (drag & drop, search, filters, etc.)
- [ ] Export/import works
- [ ] Appearance settings apply and persist
- [ ] Keyboard shortcuts work (`Cmd+K`, `ESC`)

---

## 🚀 Deployment Options

### 🖥️ Desktop Installers (Recommended for End Users)

ByteBox ships pre-built native installers via Cloudflare R2. No Node.js or Docker required.

| Platform                   | Download                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Windows (.exe)             | [ByteBox.Setup.2.5.1.exe](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox.Setup.2.5.1.exe) |
| Linux AppImage             | [ByteBox-2.5.1.AppImage](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox-2.5.1.AppImage)   |
| Linux .deb (Debian/Ubuntu) | [bytebox_2.5.1_amd64.deb](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/bytebox_2.5.1_amd64.deb) |

The packaged Electron app runs a bundled Next.js server internally. The SQLite database is stored in the OS user-data directory and survives app updates:

- Linux: `~/.config/ByteBox/bytebox.db`
- Windows: `%APPDATA%\ByteBox\bytebox.db`

### 🐳 Docker

Zero host-dependency deployment with automatic migrations:

```bash
docker compose up --build -d
```

Open `http://localhost:1334`. Data persists in the `bytebox-data` Docker volume.

---

## 📈 Performance Considerations

- **Database Indexing**: Consider adding indexes on frequently queried fields (e.g., `Card.categoryId`, `Tag.name`)
- **Code Splitting**: Next.js automatically code-splits routes
- **Image Optimization**: Use Next.js Image component for logo assets
- **Lazy Loading**: Shiki is loaded only when needed
- **Caching**: API routes can implement caching strategies (e.g., Redis)

---

## 🔐 Security Notes

- **Input Validation**: All API routes validate input before database operations
- **SQL Injection**: Prisma protects against SQL injection
- **XSS**: React sanitizes user input by default
- **Environment Variables**: Sensitive data (e.g., `DATABASE_URL`) is stored in `.env` (not committed)
- **API Rate Limiting**: Consider adding rate limiting for production

---

## 🔮 Future Enhancements

See [ROADMAP.md](./ROADMAP.md) for planned features. Potential ideas:

- [ ] User authentication (multi-user support)
- [ ] Card attachments (file uploads)
- [ ] Real-time collaboration (WebSocket)
- [ ] Mobile app (React Native)
- [ ] Browser extension (quick-add bookmarks)
- [ ] Markdown support for card content
- [ ] Custom categories and tags
- [ ] Public/private sharing
- [ ] Advanced search filters (date ranges, content type)

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](./LICENSE) file for details.

---

## 💖 Credits

**Made with ❤️ by [Pink Pixel](https://pinkpixel.dev)**

- **Website**: [pinkpixel.dev](https://pinkpixel.dev)
- **GitHub**: [@pinkpixel-dev](https://github.com/pinkpixel-dev)
- **Discord**: @sizzlebop
- **Email**: admin@pinkpixel.dev

**Dream it, Pixel it** ✨

---

_For more information, see the [README](./README.md) and [CHANGELOG](./CHANGELOG.md)._
