/**
 * Pure-JS PNG icon generator for Arise PWA
 * No native deps — uses Node's built-in zlib.
 * Generates:
 *   public/icons/icon-192.png  (192x192)
 *   public/icons/icon-512.png  (512x512)
 *
 * Design: dark #0a0a0a background, electric-cyan #00d4ff "A" letterform
 */

import zlib from 'zlib';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'public', 'icons');

// ── colour helpers ─────────────────────────────────────────────────────────
const BG   = [0x0a, 0x0a, 0x0a];   // #0a0a0a
const CYAN = [0x00, 0xd4, 0xff];   // #00d4ff
const GLOW = [0x00, 0x8a, 0xaa];   // softer glow ring (≈50 % cyan)

// ── drawing helpers ────────────────────────────────────────────────────────
function setPixel(buf, W, x, y, rgb, alpha = 1.0) {
  if (x < 0 || y < 0 || x >= W || y >= W) return;
  const idx = (y * W + x) * 3;
  if (alpha >= 1) {
    buf[idx]   = rgb[0];
    buf[idx+1] = rgb[1];
    buf[idx+2] = rgb[2];
  } else {
    buf[idx]   = Math.round(buf[idx]   * (1 - alpha) + rgb[0] * alpha);
    buf[idx+1] = Math.round(buf[idx+1] * (1 - alpha) + rgb[1] * alpha);
    buf[idx+2] = Math.round(buf[idx+2] * (1 - alpha) + rgb[2] * alpha);
  }
}

// Anti-aliased thick line from (x0,y0) to (x1,y1)
function drawLine(buf, W, x0, y0, x1, y1, rgb, thickness) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1) * 4;
  for (let i = 0; i <= steps; i++) {
    const t  = i / steps;
    const px = x0 + dx * t;
    const py = y0 + dy * t;
    // draw thick dot around (px, py)
    const r = thickness / 2;
    for (let oy = -Math.ceil(r); oy <= Math.ceil(r); oy++) {
      for (let ox = -Math.ceil(r); ox <= Math.ceil(r); ox++) {
        const dist = Math.hypot(ox, oy);
        if (dist <= r) {
          const alpha = dist <= r - 1 ? 1 : r - dist; // anti-alias edge
          setPixel(buf, W, Math.round(px + ox), Math.round(py + oy), rgb, alpha);
        }
      }
    }
  }
}

// Draw a stylised "A" centred in a W×W canvas
function drawA(buf, W) {
  const cx   = W / 2;
  const top  = W * 0.12;
  const bot  = W * 0.82;
  const half = W * 0.30;           // half-width of base
  const mid  = top + (bot - top) * 0.54;  // crossbar height
  const th   = W * 0.058;          // stroke thickness

  // subtle glow pass (wider, softer stroke first)
  const glowTh = th * 2.6;
  drawLine(buf, W, cx, top, cx - half, bot, GLOW, glowTh);
  drawLine(buf, W, cx, top, cx + half, bot, GLOW, glowTh);
  drawLine(buf, W, cx - half * 0.45, mid, cx + half * 0.45, mid, GLOW, glowTh * 0.85);

  // main cyan strokes
  drawLine(buf, W, cx, top, cx - half, bot, CYAN, th);
  drawLine(buf, W, cx, top, cx + half, bot, CYAN, th);
  drawLine(buf, W, cx - half * 0.45, mid, cx + half * 0.45, mid, CYAN, th * 0.82);

  // bright apex dot
  const apexR = th * 0.9;
  for (let oy = -Math.ceil(apexR); oy <= Math.ceil(apexR); oy++) {
    for (let ox = -Math.ceil(apexR); ox <= Math.ceil(apexR); ox++) {
      const d = Math.hypot(ox, oy);
      if (d <= apexR) setPixel(buf, W, Math.round(cx + ox), Math.round(top + oy), CYAN, 1);
    }
  }
}

// ── PNG encoding (pure JS + zlib) ──────────────────────────────────────────
function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len     = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf  = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(W, H, rgbBuf) {
  // Build raw scanlines: filter byte 0 + RGB rows
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter=None
    rgbBuf.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const IHDR_data = Buffer.alloc(13);
  IHDR_data.writeUInt32BE(W, 0);
  IHDR_data.writeUInt32BE(H, 4);
  IHDR_data[8]  = 8;   // bit depth
  IHDR_data[9]  = 2;   // colour type RGB
  IHDR_data[10] = 0;   // compression
  IHDR_data[11] = 0;   // filter
  IHDR_data[12] = 0;   // interlace

  return Buffer.concat([
    Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), // PNG sig
    chunk('IHDR', IHDR_data),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── main ───────────────────────────────────────────────────────────────────
function generateIcon(size) {
  const W   = size;
  const buf = Buffer.alloc(W * W * 3);

  // Fill background
  for (let i = 0; i < W * W; i++) {
    buf[i * 3]     = BG[0];
    buf[i * 3 + 1] = BG[1];
    buf[i * 3 + 2] = BG[2];
  }

  // Draw "A"
  drawA(buf, W);

  return encodePNG(W, W, buf);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('Generating icon-192.png …');
fs.writeFileSync(path.join(OUT_DIR, 'icon-192.png'), generateIcon(192));
console.log('Generating icon-512.png …');
fs.writeFileSync(path.join(OUT_DIR, 'icon-512.png'), generateIcon(512));
console.log('Done. Icons saved to public/icons/');
