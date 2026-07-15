import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";

const OUT = path.join(process.cwd(), "public");

function iconSvg({ rounded }) {
  const bg = rounded
    ? `<rect width="512" height="512" rx="112" fill="url(#g)"/>`
    : `<rect width="512" height="512" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff5a5f"/>
      <stop offset="1" stop-color="#ff8a5b"/>
    </linearGradient>
  </defs>
  ${bg}
  <g fill="#ffffff">
    <path d="M256 148 L412 210 L256 272 L100 210 Z"/>
    <path d="M158 242 L158 312 Q158 356 256 356 Q354 356 354 312 L354 242 L256 284 Z"/>
    <rect x="405" y="210" width="10" height="96" rx="5"/>
    <circle cx="410" cy="320" r="17"/>
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

  console.log("Icone generate in public/: icon-192, icon-512, icon-maskable-512, apple-touch-icon");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
