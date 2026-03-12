/** ByteBox - Electron afterPack hook
 * Made with ❤️ by Pink Pixel
 *
 * Rebuilds better-sqlite3 for the Electron Node.js ABI after electron-builder
 * copies files to the output directory.  This is needed because
 * electron-builder's built-in npmRebuild doesn't reliably recompile native
 * modules when system Node and Electron ship different ABI versions.
 */

const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function runBin(bin, args, options) {
  if (bin === "node-gyp") {
    const nodeGypCli = require.resolve("node-gyp/bin/node-gyp.js");
    execFileSync(process.execPath, [nodeGypCli, ...args], options);
    return;
  }

  const executable = process.platform === "win32" ? `${bin}.cmd` : bin;
  execFileSync(executable, args, options);
}

/** @param {import("electron-builder").AfterPackContext} context */
module.exports = async function afterPack(context) {
  // Extract Electron version from the packager config — fall back to the
  // locally-installed electron package if the context doesn't expose it.
  const electronVersion =
    context.packager?.config?.electronVersion ||
    context.packager?.electronVersion ||
    require("electron/package.json").version;

  // Source directory (has binding.gyp + C++ source for compilation)
  const projectRoot = path.resolve(__dirname, "..");
  const srcBsqliteDir = path.join(projectRoot, "node_modules", "better-sqlite3");

  // Output directory (packaged app — just needs the compiled .node binary)
  const appDir = path.join(context.appOutDir, "resources", "app");
  const destBinaryDir = path.join(
    appDir, "node_modules", "better-sqlite3", "build", "Release"
  );

  if (!fs.existsSync(srcBsqliteDir) || !fs.existsSync(destBinaryDir)) {
    console.log("[afterPack] better-sqlite3 not found — skipping rebuild");
    return;
  }

  console.log(`[afterPack] Rebuilding better-sqlite3 for Electron ${electronVersion}…`);

  // 1. Rebuild in the SOURCE directory (has binding.gyp + C++ source)
  runBin(
    "node-gyp",
    [
      "rebuild",
      `--target=${electronVersion}`,
      "--arch=x64",
      "--dist-url=https://electronjs.org/headers",
      "--runtime=electron",
    ],
    {
      cwd: srcBsqliteDir,
      stdio: "inherit",
    }
  );

  // 2. Copy the freshly-compiled binary into the packaged output
  const srcBinary = path.join(srcBsqliteDir, "build", "Release", "better_sqlite3.node");
  const destBinary = path.join(destBinaryDir, "better_sqlite3.node");
  fs.copyFileSync(srcBinary, destBinary);

  // 3. Restore system-Node build so `npm run dev` still works after packaging
  if (process.env.CI !== "true") {
    runBin("npm", ["rebuild", "better-sqlite3", "--no-progress"], {
      cwd: projectRoot,
      stdio: "inherit",
    });

    console.log("[afterPack] better-sqlite3 rebuilt for Electron and restored for dev ✓");
  } else {
    console.log("[afterPack] better-sqlite3 rebuilt for Electron ✓");
  }

  // 4. Copy .prisma/client into the packaged app.
  //    electron-builder's glob skips hidden (dot) directories, so the generated
  //    Prisma client never makes it into the output. We copy it manually.
  const srcPrismaClient = path.join(projectRoot, "node_modules", ".prisma", "client");
  const destPrismaClient = path.join(appDir, "node_modules", ".prisma", "client");

  if (fs.existsSync(srcPrismaClient)) {
    console.log("[afterPack] Copying .prisma/client into packaged app…");
    fs.cpSync(srcPrismaClient, destPrismaClient, { recursive: true });
    console.log("[afterPack] .prisma/client copied ✓");
  } else {
    console.warn("[afterPack] WARNING: node_modules/.prisma/client not found — run `npx prisma generate` first");
  }

  // 5. Patch better-sqlite3 binaries inside the turbopack alias packages.
  //
  //    Turbopack (Next.js 16+) copies external packages under .next/node_modules/
  //    with mangled IDs (e.g. "better-sqlite3-<hash>") so that chunks can call
  //    require("better-sqlite3-<hash>") via Node.js directory traversal.
  //    electron-builder.yml explicitly includes .next/node_modules/** so those
  //    files are already present in the output — but the better-sqlite3 binary
  //    inside is a system-Node build.  Replace it with the Electron-ABI binary
  //    compiled in step 1.
  const destNextNodeModules = path.join(appDir, ".next", "node_modules");

  if (fs.existsSync(destNextNodeModules)) {
    let patched = 0;
    for (const entry of fs.readdirSync(destNextNodeModules)) {
      if (!entry.startsWith("better-sqlite3")) continue;

      const aliasBinary = path.join(
        destNextNodeModules, entry, "build", "Release", "better_sqlite3.node"
      );
      if (fs.existsSync(aliasBinary)) {
        // destBinary is the Electron-built binary placed in step 2.
        fs.copyFileSync(destBinary, aliasBinary);
        console.log(`[afterPack] Patched Electron binary → .next/node_modules/${entry} ✓`);
        patched++;
      }
    }
    if (patched === 0) {
      console.warn("[afterPack] WARNING: no better-sqlite3 alias dirs found in .next/node_modules/");
    }
  } else {
    console.warn("[afterPack] WARNING: .next/node_modules not found in packaged app — was npm run build run?");
  }
};
