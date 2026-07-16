import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const OUT = path.join(process.cwd(), "public");

// Logo "EN": due fumetti di chat sovrapposti su sfondo blu
function iconSvg({ rounded }) {
  const bg = rounded
    ? `<rect width="512" height="512" rx="112" fill="url(#bg)"/>`
    : `<rect width="512" height="512" fill="url(#bg)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3f8bd0"/>
      <stop offset="1" stop-color="#2f6cae"/>
    </linearGradient>
  </defs>
  ${bg}
  <!-- Fumetto "E" (bianco) -->
  <g>
    <rect x="80" y="96" width="210" height="168" rx="46" fill="#ffffff"/>
    <path d="M120 250 L120 306 L168 250 Z" fill="#ffffff"/>
    <text x="185" y="232" font-family="Arial, Helvetica, sans-serif" font-size="150" font-weight="700" fill="#2f6cae" text-anchor="middle">E</text>
  </g>
  <!-- Fumetto "N" (verde) -->
  <g>
    <rect x="222" y="234" width="210" height="168" rx="46" fill="#22c58a"/>
    <path d="M392 388 L392 444 L344 388 Z" fill="#22c58a"/>
    <text x="327" y="370" font-family="Arial, Helvetica, sans-serif" font-size="150" font-weight="700" fill="#ffffff" text-anchor="middle">N</text>
  </g>
</svg>`;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const rounded = Buffer.from(iconSvg({ rounded: true }));
  const full = Buffer.from(iconSvg({ rounded: false }));

  await sharp(rounded).resize(192, 192).png().toFile(path.join(OUT, "icon-192.png"));
  await sharp(rounded).resize(512, 512).png().toFile(path.join(OUT, "icon-512.png"));
  await sharp(full).resize(512, 512).png().toFile(path.join(OUT, "icon-maskable-512.png"));
  await sharp(rounded).resize(180, 180).png().toFile(path.join(OUT, "apple-touch-icon.png"));

  console.log("Icone generate: icon-192, icon-512, icon-maskable-512, apple-touch-icon");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
