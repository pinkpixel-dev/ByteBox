---
title: Getting Started
description: Get ByteBox up and running in minutes.
---

ByteBox can be installed as a native desktop app, run via Docker, or self-hosted from source. Choose the method that fits your workflow.

## Option 1 — Desktop Installer (Recommended)

Download a pre-built native installer — no Node.js or Docker required.

| Platform                   | Download                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Windows (.exe)             | [ByteBox.Setup.2.5.1.exe](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox.Setup.2.5.1.exe) |
| Linux AppImage             | [ByteBox-2.5.1.AppImage](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/ByteBox-2.5.1.AppImage)   |
| Linux .deb (Debian/Ubuntu) | [bytebox_2.5.1_amd64.deb](https://pub-52c1c4beebd34721b63e30b05b1b04de.r2.dev/bytebox_2.5.1_amd64.deb) |

**Linux AppImage quickstart:**

```bash
chmod +x ByteBox-2.5.1.AppImage
./ByteBox-2.5.1.AppImage
```

**Linux .deb quickstart:**

```bash
sudo dpkg -i bytebox_2.5.1_amd64.deb
```

**Windows:** Run the `.exe` installer and follow the setup wizard.

The database is stored in the OS user-data directory and survives app updates:

- Linux: `~/.config/ByteBox/bytebox.db`
- Windows: `%APPDATA%\ByteBox\bytebox.db`

## Option 2 — Docker

No Node.js required on the host. Just Docker.

```bash
git clone https://github.com/pinkpixel-dev/bytebox.git
cd bytebox
docker compose up --build -d
```

Open `http://localhost:1334`. Data persists in the `bytebox-data` Docker volume.

## Option 3 — Clone & Run (Dev / Self-Host)

For contributors or advanced users who want to run ByteBox from source.

### Prerequisites

- Node.js 18+ (Node 22 recommended)
- npm 10+

### One-Command Setup

```bash
git clone https://github.com/pinkpixel-dev/bytebox.git
cd bytebox
npm run setup
npm run dev
```

Open `http://localhost:1334`.

The setup script handles `.env` creation, dependency install, Prisma client generation, migration application, and seed data population.

### Manual Setup

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

## Verify Local Health

Run these checks before contributing:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

> `next build` is configured with TypeScript build errors ignored, so always run `npx tsc --noEmit` explicitly.

## Notes

- Dev server defaults to port `1334` through `scripts/next-with-env.cjs`.
- Database defaults to `file:./dev.db` unless overridden by `DATABASE_URL`.
