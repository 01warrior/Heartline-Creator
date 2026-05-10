import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src  = path.join(__dirname, '../node_modules/@ffmpeg/core/dist/umd');
const dest = path.join(__dirname, '../public');

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

// Create public directory if it doesn't exist
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

for (const file of files) {
  const from = path.join(src, file);
  const to   = path.join(dest, file);
  fs.copyFileSync(from, to);
  console.log(`✅ Copié : ${file} (${(fs.statSync(to).size / 1024 / 1024).toFixed(1)} MB)`);
}
