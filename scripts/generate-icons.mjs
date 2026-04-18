import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const iconsDir = join(__dirname, "..", "public", "icons");

async function generateIcon(size) {
  const svgPath = join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = join(iconsDir, `icon-${size}x${size}.png`);
  const svgBuffer = readFileSync(svgPath);
  await sharp(svgBuffer).resize(size, size).png().toFile(pngPath);
  console.log(`✓ Generated icon-${size}x${size}.png`);
}

console.log("Generating PWA icons...");
await generateIcon(192);
await generateIcon(512);
console.log("Done! PNG icons are ready at public/icons/");
