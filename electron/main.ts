/** ByteBox - Electron Main Process
 * Made with ❤️ by Pink Pixel
 *
 * In development:  Electron connects to the Next.js dev server (localhost:1334).
 *                  Start the dev server first with `npm run dev`, then run
 *                  `npm run electron:dev` (which does both via concurrently).
 *
 * In production:   Electron starts the Next.js production server in-process,
 *                  applies any pending database migrations, then opens the
 *                  BrowserWindow pointing at the local server.
 */

import { app, BrowserWindow, nativeTheme, shell } from "electron";
import { createServer, get as httpGet } from "http";
import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import path from "path";

// ── Constants ─────────────────────────────────────────────────────────────────

const IS_DEV = !app.isPackaged;
const DEV_PORT = 1334;
const PROD_PORT = 1335; // offset by 1 to avoid clash with the dev server
const PORT = IS_DEV ? DEV_PORT : PROD_PORT;

let mainWindow: BrowserWindow | null = null;

// ── Database migrations (production only) ─────────────────────────────────────
//
// We apply migrations directly with better-sqlite3 rather than bundling the
// full Prisma CLI.  The logic mirrors `prisma migrate deploy` — migrations that
// are already recorded in _prisma_migrations are skipped.

async function applyMigrations(
  dbPath: string,
  migrationsDir: string,
): Promise<void> {
  // Dynamically import so better-sqlite3 is only loaded in production
  // (avoids ABI mismatch when running `electron:dev` with the Node build)
  const { default: Database } = await import("better-sqlite3");

  const dbDir = path.dirname(dbPath);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id                    TEXT PRIMARY KEY,
      checksum              TEXT NOT NULL DEFAULT '',
      finished_at           TEXT,
      migration_name        TEXT NOT NULL,
      logs                  TEXT,
      rolled_back_at        TEXT,
      started_at            TEXT NOT NULL DEFAULT (datetime('now')),
      applied_steps_count   INTEGER NOT NULL DEFAULT 0
    )
  `);

  type MigrationRow = { migration_name: string };
  const applied = new Set(
    (
      db
        .prepare(
          "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL",
        )
        .all() as MigrationRow[]
    ).map((r) => r.migration_name),
  );

  // Migration folder names look like "20251024105814_init" — sort ascending
  const migrationDirs = readdirSync(migrationsDir)
    .filter((d) => /^\d{14}_/.test(d))
    .sort();

  for (const dirName of migrationDirs) {
    if (applied.has(dirName)) continue;

    const sqlFile = path.join(migrationsDir, dirName, "migration.sql");
    if (!existsSync(sqlFile)) continue;

    const sql = readFileSync(sqlFile, "utf-8");
    db.exec(sql);

    db.prepare(
      `INSERT INTO _prisma_migrations
         (id, checksum, finished_at, migration_name, applied_steps_count)
       VALUES (?, '', datetime('now'), ?, 1)`,
    ).run(crypto.randomUUID(), dirName);

    console.log(`[bytebox] Applied migration: ${dirName}`);
  }

  db.close();
}

// ── Production Next.js server ─────────────────────────────────────────────────

async function startProductionServer(): Promise<void> {
  const appPath = app.getAppPath();
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "bytebox.db");
  const migrationsDir = path.join(appPath, "prisma", "migrations");

  // Set environment for Prisma & Next.js before any imports that use them
  process.env.DATABASE_URL = `file:${dbPath}`;
  process.env.NEXT_TELEMETRY_DISABLED = "1";
  process.env.PORT = String(PROD_PORT);

  console.log(`[bytebox] User data: ${userDataPath}`);
  console.log(`[bytebox] Database:  ${dbPath}`);

  await applyMigrations(dbPath, migrationsDir);

  // Start the Next.js server inside the main process.
  // `dir` points to the app root where .next/ lives.
  const { default: nextFactory } = await import("next");
  const nextApp = nextFactory({
    dev: false,
    dir: appPath,
    port: PROD_PORT,
    quiet: true,
  });
  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  await new Promise<void>((resolve, reject) => {
    const server = createServer((req, res) => handle(req, res));
    server.on("error", reject);
    server.listen(PROD_PORT, "127.0.0.1", () => {
      console.log(`[bytebox] Server ready on http://127.0.0.1:${PROD_PORT}`);
      resolve();
    });
  });
}

// ── Wait for dev server ───────────────────────────────────────────────────────

function waitForDevServer(port: number, timeoutMs = 60_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const check = () => {
      const req = httpGet(`http://localhost:${port}`, (res) => {
        if ((res.statusCode ?? 999) < 500) {
          resolve();
        } else if (Date.now() > deadline) {
          reject(new Error(`Dev server did not respond within ${timeoutMs}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
      req.on("error", () => {
        if (Date.now() > deadline) {
          reject(new Error(`Dev server timed out after ${timeoutMs}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
    };

    check();
  });
}

// ── BrowserWindow ─────────────────────────────────────────────────────────────

function createWindow(): void {
  nativeTheme.themeSource = "dark";

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
    backgroundColor: "#0a0a0f", // matches ByteBox dark theme background
    title: "ByteBox",
    icon: path.join(app.getAppPath(), "public", "icon.png"),
    autoHideMenuBar: true,
    // On macOS, use the inset traffic-light style
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    // Open DevTools in dev mode — close the extra window to dismiss
    if (IS_DEV) mainWindow?.webContents.openDevTools({ mode: "detach" });
  });

  // Route external links to the system browser instead of Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(`http://localhost:${PORT}`)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ── App lifecycle ──────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    if (IS_DEV) {
      // Dev: connect to the already-running Next.js dev server
      console.log(`[bytebox] Waiting for dev server on port ${DEV_PORT}…`);
      await waitForDevServer(DEV_PORT);
    } else {
      // Production: start the bundled Next.js server
      await startProductionServer();
    }
    createWindow();
  } catch (err) {
    console.error("[bytebox] Startup failed:", err);
    app.quit();
  }

  // macOS: re-open window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  // On macOS it is conventional to keep the app open until Cmd+Q
  if (process.platform !== "darwin") app.quit();
});
