# ByteBox - Development Guidelines

## General Rules

- Always sound friendly and engaged with this project.
- Use all available agents, skills, and tools autonomously as needed.
- Always refer to all instruction files at the start of new tasks.
- Use Context7 tools for up-to-date framework/API documentation before coding.
- Check the system date/time before updating CHANGELOG.md.
- Thoroughly understand the full codebase context before making any changes. When uncertain, ask for clarification.
- Keep `OVERVIEW.md` (technical overview document), `README.md`, and `CHANGELOG.md` current. Create them if they don't exist.
- Create an Apache 2.0 `LICENSE` file if none exists.
- Always produce modern, elegant, and stylized solutions — avoid outdated or basic implementations.

**Important:** Do NOT change files unless you fully understand the project structure and intent.

## Tech Stack

| Technology        | Version  | Purpose                         |
| ----------------- | -------- | ------------------------------- |
| Next.js           | 16.x     | React framework with App Router |
| React             | 19.x     | UI library                      |
| TypeScript        | 5.9.x    | Type safety                     |
| Tailwind CSS      | 4.x      | Utility-first styling           |
| Prisma            | 7.x      | ORM with better-sqlite3 adapter |
| SQLite            | -        | Local database (`dev.db`)       |
| @dnd-kit          | 6.x/10.x | Accessible drag-and-drop        |
| Shiki             | 4.x      | Syntax highlighting             |
| @heroicons/react  | 2.x      | Icon library                    |
| @headlessui/react | 2.x      | Modal Dialog + Transition       |

## Build & Dev Commands

```bash
npm run dev           # Start dev server — uses wrapper script, do NOT call `next dev` directly
npm run build         # Production build
npm run start         # Start production server
npm run lint          # ESLint check
npx tsc --noEmit      # TypeScript type check
npm run db:seed       # Seed example data
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:migrate    # Run pending migrations (interactive)
npx prisma studio     # Open database GUI
npx prisma migrate dev --name <name>  # Create new migration
npm run db:studio             # Shorthand for npx prisma studio
```

> **Note**: `next.config.ts` sets `typescript.ignoreBuildErrors: true` — TypeScript errors will NOT fail `npm run build`. Always run `npx tsc --noEmit` manually to catch type errors.

All three checks must pass before merging: `npm run lint && npx tsc --noEmit && npm run build`

**No test suite exists** — there are no unit or integration tests, and no CI/CD workflow.

## Project Structure

```
src/
  app/                  # Next.js App Router pages + API routes
    api/                # REST API: /cards, /categories, /tags, /settings, /export, /import
  components/
    cards/              # Card, CardModal, CreateCardModal, DraggableCard
    layout/             # AppLayout, Board, DraggableBoard
    ui/                 # Shared UI (CodeBlock, Lightbox, SearchBar, Tag, etc.)
  contexts/
    ThemeContext.tsx     # Global theme/visual state — the only global store
  hooks/
    useSearch.ts        # Card filtering, search, viewMode logic
  lib/
    db/
      index.ts          # Barrel re-export — always import from here
      queries.ts        # All DB access with domain type mappers
    themeRegistry.ts    # AccentTheme + IconTheme definitions
    utils/              # cn(), fileUtils, imageUtils, syntax helpers
  types/
    index.ts            # Domain types: Card, Category, Tag, Board, etc.
prisma/
  schema.prisma         # DB schema (SQLite)
```

## Naming Conventions

- **Components**: PascalCase, filename matches component name
- **Functions/hooks**: camelCase (`handleCreateCard`, `useSearch`)
- **Constants**: SCREAMING_SNAKE_CASE (`STORAGE_KEYS`, `DEFAULT_GLASS_INTENSITY`)
- **CSS classes**: kebab-case BEM (`glass`, `glass--dense`, `surface-card`)
- **Import alias**: `@/` → `src/` for all internal imports
- **File headers**: `/** ByteBox - [Name]\n * Made with ❤️ by Pink Pixel */`

## Architecture & Key Patterns

### Component File Structure

File order: imports (external then `@/`) → type defs → constants → helper functions → main component (hooks → effects → handlers → return).

### API Routes (Next.js 15)

Dynamic route params are a `Promise` and **must be awaited**:

```typescript
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params; // required — omitting this is a runtime error
}
```

All routes use `NextRequest` / `NextResponse`. Use `Response.json(data)` for responses.

**Error handling convention** — wrap every route handler body in `try/catch`:

```typescript
console.error("VERB /api/route failed:", error);
return NextResponse.json({ error: "Human-readable message" }, { status: 500 });
```

Error responses always use key `"error"`, never `"message"`. Success responses return the data directly or `{ success: true }`.

**Validation**: No schema library (no Zod). Validate manually at the boundary:

```ts
if (!name || typeof name !== "string" || !name.trim()) {
  return NextResponse.json({ error: "..." }, { status: 400 });
}
```

**404 pattern**: Query the record first with `getById()`, return 404 if null — never rely on Prisma to throw.

**Exception**: `src/app/api/import/route.ts` uses `prisma.$transaction` directly (the only route that bypasses `@/lib/db`).

### Database Layer

- **Always import from `@/lib/db`** (barrel), never use `PrismaClient` directly in routes or components.
- `queries.ts` maps Prisma models → domain types (`Card`, `Tag`, `Category`). Routes receive domain types, not Prisma models.
- `getBoardData()` auto-creates 5 default categories if the DB is empty (called on every `GET /api/cards`).

### ThemeContext (`src/contexts/ThemeContext.tsx`)

The only global store. Manages: `mode`, `glassIntensity`, `accentTheme`, `iconTheme`, `backgroundConfig`, `fontConfig`, `customAccentThemes`, `settingsPresets`.

- Tokens are applied by calling `root.style.setProperty('--var', value)` and `data-*` attributes on `<html>`/`<body>` — **not** via CSS class names.
- Persists to both `localStorage` (under `STORAGE_KEYS`) and DB (`PATCH /api/settings`).
- `getIconColor(key)` → hashes `key` to a deterministic palette slot. Use this for card icon colors instead of hardcoding.

### Card Types

All cards share one DB table. Field usage by type:

| Type       | `content` holds  | Special fields                                 |
| ---------- | ---------------- | ---------------------------------------------- |
| `bookmark` | URL              | —                                              |
| `snippet`  | Code string      | `language` (for Shiki syntax highlighting)     |
| `command`  | Shell command    | —                                              |
| `doc`      | Notes/markdown   | `fileData`, `fileName`, `fileType`, `fileSize` |
| `image`    | Alt text/caption | `imageData` (base64 data URI)                  |
| `note`     | Free-form text   | —                                              |

### Types Location

`src/types/index.ts` is just `export * from './indev'`. All actual type definitions live in `src/types/indev.ts`. Edit `indev.ts` when adding or changing domain types.

### Client-Side Guard

Use `globalThis.window !== undefined` (not `typeof window !== 'undefined'`) to gate localStorage and DOM access in hooks and contexts.

### UserSettings Singleton

The `UserSettings` table always has exactly one row with `id = "default"`. Never query it with a dynamic ID. Fields `backgroundConfig`, `fontConfig`, `customAccentThemes`, `settingsPresets` are **JSON strings** in SQLite — always `JSON.parse`/`JSON.stringify` when reading/writing. Use `getUserSettings()` and `updateUserSettings()` from `@/lib/db`.

## Critical Pitfalls

- **`card.cardType[0]` not `card.type`**: Components branch on `card.cardType[0]` (a 1-element array set by the domain mapper). `card.type` has the same value but `card.cardType[0]` is the consistent pattern throughout.
- **`card.url` is always `undefined`**: The field exists on the type but is never populated. For bookmark URLs, use `card.content`.
- **`card.imageData.trim()`**: Always `.trim()` base64 image data before use — whitespace artifacts cause broken images.
- **Next.js 15 async params**: `const { id } = await params` in dynamic routes. Forgetting `await` causes a runtime error.
- **`npm run dev` wraps Next.js**: `scripts/next-with-env.cjs` sets env vars to suppress browser-compat warnings. Never call `next dev` directly.
- **No file storage server**: Images and uploaded files are stored as base64 strings in SQLite. Avoid storing very large files (>1 MB).
- **Tags are sent as `tagNames: string[]`**: The API normalizes both `tagNames` (preferred) and legacy `tags: (string | {name})[]` arrays from the client.
- **`PATCH /api/cards` is bulk reorder only**: Use `PATCH /api/cards/[id]` for single-card updates. For star toggle, send `{ action: 'toggleStar' }`.
- **`deleteAllData()` is destructive**: Exported from `@/lib/db`, wipes all cards, categories, and tags with no confirmation step. Used by `DELETE /api/cards`.
- **PDF lazy-loading**: `src/lib/utils/fileUtils.ts` uses dynamic `import('pdf-parse')` — only runs on first use. Do not import it statically or it will bloat the bundle.

## Styling

- Tailwind 4 utility classes + CSS custom properties for theming.
- Use `var(--accent-primary)`, `var(--glass-bg)`, `var(--text-strong)` etc. in Tailwind `[...]` expressions or inline styles.
- Glass morphism: `.glass` and `.glass--dense` utility classes (defined in `globals.css`).
- Conditional class merging: `cn(...)` from `@/lib/utils` (`clsx` + `tailwind-merge`).
- `<html suppressHydrationWarning>` and `<body suppressHydrationWarning>` suppress expected theme-flicker hydration warnings.

## Security

- Validate all API route inputs before DB operations. Use Prisma's parameterized queries (SQL injection safe by default).
- Never use `any` — use `unknown` when the type is genuinely unknown.
- Don't commit `dev.db`, secrets, or `.env` files.
- React's default escaping handles XSS for rendered content.

## Git

- Branches: `feature/<desc>`, `fix/<desc>`, `docs/<desc>`, `refactor/<desc>`
- All checks must pass before merging: `npm run lint && npx tsc --noEmit && npm run build`
- Update `CHANGELOG.md` for releases.

## Brand

- Primary: Pink `#ec4899` · Secondary: Purple `#8b5cf6`

---

## Owner / Org Branding

- **Name:** Pink Pixel
- **Website:** [pinkpixel.dev](https://pinkpixel.dev)
- **GitHub:** [github.com/pinkpixel-dev](https://github.com/pinkpixel-dev)
- **Email:** admin@pinkpixel.dev
- **Support Email:** support@pinkpixel.dev
- **Discord:** @sizzlebopz
- **Funding:** [buymeacoffee.com/pinkpixel](https://www.buymeacoffee.com/pinkpixel) · [ko-fi.com/sizzlebop](https://ko-fi.com/sizzlebop)
- **Tagline:** "Dream it, Pixel it ✨”
- **Signature:** “Made with 💖 by Pink Pixel”

---
