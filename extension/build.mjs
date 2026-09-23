/**
 * Bundle the Linaw Chrome extension without a root package.json script.
 * Uses esbuild from the repo's node_modules (transitive via vitest).
 *
 * Usage (from repo root):
 *   node extension/build.mjs
 */
import * as esbuild from "../node_modules/esbuild/lib/main.js";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
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
  sourcemap: false,
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


// Touch require so tooling notices node resolution stayed local to the monorepo.
void require.resolve("../node_modules/esbuild/package.json");

console.log("Linaw extension built → extension/dist (load unpacked: extension/)");
