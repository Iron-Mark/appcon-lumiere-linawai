/**
 * Bundle the Linaw Chrome extension without a root package.json script.
 * Uses esbuild from the repo's node_modules (transitive via vitest).
 *
 * Usage (from repo root):
 *   node extension/build.mjs
 */
import * as esbuild from "../node_modules/esbuild/lib/main.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

/** Tiny solid olive PNG so the unpacked extension has real icons. */
function writeIconPng(filePath, size, rgb = [0x4f, 0x5d, 0x2f]) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) {
    const o = 1 + x * 3;
    row[o] = rgb[0];
    row[o + 1] = rgb[1];
    row[o + 2] = rgb[2];
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(filePath, png);
}

mkdirSync(path.join(__dirname, "dist"), { recursive: true });
mkdirSync(path.join(__dirname, "icons"), { recursive: true });
writeIconPng(path.join(__dirname, "icons", "icon16.png"), 16);
writeIconPng(path.join(__dirname, "icons", "icon48.png"), 48);
writeIconPng(path.join(__dirname, "icons", "icon128.png"), 128);

const shared = {
  bundle: true,
  format: "iife",
  target: ["chrome120"],
  platform: "browser",
  // MV3 CSP strictly forbids eval-based or remote sourcemaps
  sourcemap: false,
  legalComments: "none",
  logLevel: "info",
  jsx: "automatic",
  absWorkingDir: __dirname,
  alias: {
    "@": repoRoot,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

await esbuild.build({
  ...shared,
  entryPoints: [path.join(__dirname, "src/content/index.tsx")],
  outfile: path.join(__dirname, "dist/content.js"),
});

const backgroundEntry = existsSync(path.join(__dirname, "src/background/index.ts"))
  ? path.join(__dirname, "src/background/index.ts")
  : path.join(__dirname, "src/background.ts");

await esbuild.build({
  ...shared,
  entryPoints: [backgroundEntry],
  outfile: path.join(__dirname, "dist/background.js"),
});

const sidepanelEntry = path.join(__dirname, "src/sidepanel/index.tsx");
if (existsSync(sidepanelEntry)) {
  await esbuild.build({
    ...shared,
    entryPoints: [sidepanelEntry],
    outfile: path.join(__dirname, "dist/sidepanel.js"),
  });
}

// Validate CSP compliance for Manifest V3 (no eval(), no remote script loading)
for (const file of ["dist/content.js", "dist/background.js", "dist/sidepanel.js"]) {
  const filePath = path.join(__dirname, file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf-8");
    if (/\beval\s*\(/.test(content)) {
      throw new Error(`CSP violation: eval() detected in ${file}`);
    }
  }
}


function writeZip(outputPath, files) {
  const parts = [];
  const central = [];
  let offset = 0;

  for (const { name, data } of files) {
    const nameBuf = Buffer.from(name, "utf8");
    const fileCrc = crc32(data);
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(fileCrc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);

    parts.push(local, data);

    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(fileCrc, 16);
    cd.writeUInt32LE(data.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    central.push(cd);

    offset += local.length + data.length;
  }

  const centralDir = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  writeFileSync(outputPath, Buffer.concat([...parts, centralDir, end]));
}

function collectExtensionFiles() {
  const files = [];
  const addFile = (relPath) => {
    const full = path.join(__dirname, relPath);
    if (!existsSync(full)) return;
    files.push({
      name: relPath.replace(/\\/g, "/"),
      data: readFileSync(full),
    });
  };

  addFile("manifest.json");
  addFile("sidepanel.html");
  for (const name of ["content.js", "background.js", "sidepanel.js"]) {
    addFile(`dist/${name}`);
  }
  for (const name of ["icon16.png", "icon48.png", "icon128.png"]) {
    addFile(`icons/${name}`);
  }
  return files;
}

const publicDir = path.join(repoRoot, "public");
mkdirSync(publicDir, { recursive: true });
writeZip(
  path.join(publicDir, "linaw-chrome-extension.zip"),
  collectExtensionFiles(),
);

// Touch require so tooling notices node resolution stayed local to the monorepo.
void require.resolve("../node_modules/esbuild/package.json");

console.log("Linaw extension built → extension/dist (load unpacked: extension/)");
console.log("Chrome extension ZIP → public/linaw-chrome-extension.zip");

