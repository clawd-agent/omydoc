import sharp from 'sharp';
import path from 'path';

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

const svgPath = path.resolve('src/app/icon.svg');
const publicDir = path.resolve('public');

async function generateIcons() {
  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);
    await sharp(svgPath, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ ${name} (${size}x${size})`);
  }
}

generateIcons().catch(console.error);
