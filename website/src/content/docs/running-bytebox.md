---
title: Running ByteBox
description: Choose the right runtime mode for development, deployment, or desktop.
---

ByteBox supports three primary runtime modes. The **Electron desktop app** is the recommended default for most users.

## 1. Electron Desktop App (Recommended)

Download a pre-built native installer and run ByteBox as a native application — no Node.js or Docker required.

| Platform                   | Download                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Windows (.exe)             | [ByteBox.Setup.2.5.1.exe](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox.Setup.2.5.1.exe) |
| Linux AppImage             | [ByteBox-2.5.1.AppImage](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox-2.5.1.AppImage)   |
| Linux .deb (Debian/Ubuntu) | [bytebox_2.5.1_amd64.deb](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/bytebox_2.5.1_amd64.deb) |

**Linux AppImage:**

```bash
chmod +x ByteBox-2.5.1.AppImage
./ByteBox-2.5.1.AppImage
```

**Linux .deb:**

```bash
sudo dpkg -i bytebox_2.5.1_amd64.deb
```

**Windows:** Run the `.exe` installer and follow the setup wizard.

Behavior highlights:

- Packaged app runs a local Next server inside Electron
- Database stored in OS user data directory, survives upgrades:
  - Linux: `~/.config/ByteBox/bytebox.db`
  - Windows: `%APPDATA%\ByteBox\bytebox.db`
- Migrations applied automatically on startup

Build from source instead:

```bash
npm run electron:build:linux
npm run electron:build:win
```

## 2. Docker Deployment

Use this for zero-host-dependency server deployment.

```bash
docker compose up --build -d
```

- Exposes `1334`
- Persists data in `bytebox-data` volume
- Runs migrations on container startup via `docker-entrypoint.sh`

Useful commands:

```bash
docker compose down
docker compose up -d
docker compose logs -f
```

## 3. Web Development Mode

Use this when actively building features or self-hosting from source.

```bash
npm run dev
```

- Runs at `http://localhost:1334`
- Hot reload enabled
- Uses your local SQLite database

## Environment Variables

Core values:

- `DATABASE_URL` (default `file:./dev.db`)
- `PORT` (default `1334` in wrapper)
- `NEXT_TELEMETRY_DISABLED` (set in several runtime paths)

## Production Safety Checklist

- Run migrations before app startup (or ensure startup path does it)
- Back up SQLite file/volume
- Verify health endpoint (`/api/cards`)
- Run lint + typecheck + build in CI
