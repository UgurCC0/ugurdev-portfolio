const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDir = path.join(root, 'assets', 'screenshots', 'readme');
const reportPath = path.join(root, 'docs', 'readme-image-optimization.json');
const width = 1200;
const height = 750;
const quality = 0.84;
const slugs = [
  'industrial-electric',
  'automotive-gallery',
  'clinic-website',
  'appointment-website',
  'barber-studio',
  'hotel-booking',
  'aula-esports',
];

async function convert(page, sourceBuffer) {
  const dataUrl = `data:image/png;base64,${sourceBuffer.toString('base64')}`;
  const bytes = await page.evaluate(async ({ dataUrl: source, width: targetWidth, height: targetHeight, quality: targetQuality }) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = source;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext('2d', { alpha: false });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error('WebP conversion failed')), 'image/webp', targetQuality);
    });
    return [...new Uint8Array(await blob.arrayBuffer())];
  }, { dataUrl, width, height, quality });
  return Buffer.from(bytes);
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const page = await browser.newPage();
  const images = [];

  try {
    for (const slug of slugs) {
      const source = path.join(root, 'assets', 'screenshots', slug, 'desktop-home.png');
      const target = path.join(outputDir, `${slug}-desktop.webp`);
      const sourceBuffer = fs.readFileSync(source);
      const optimizedBuffer = await convert(page, sourceBuffer);
      fs.writeFileSync(target, optimizedBuffer);
      images.push({
        slug,
        source: path.relative(root, source).replaceAll('\\', '/'),
        output: path.relative(root, target).replaceAll('\\', '/'),
        width,
        height,
        quality,
        sourceBytes: sourceBuffer.length,
        optimizedBytes: optimizedBuffer.length,
        savingsPercent: Number(((1 - optimizedBuffer.length / sourceBuffer.length) * 100).toFixed(1)),
      });
      console.log(`${slug}: ${sourceBuffer.length} -> ${optimizedBuffer.length} bytes`);
    }
  } finally {
    await browser.close();
  }

  const sourceBytes = images.reduce((total, image) => total + image.sourceBytes, 0);
  const optimizedBytes = images.reduce((total, image) => total + image.optimizedBytes, 0);
  const report = {
    generatedAt: new Date().toISOString(),
    format: 'WebP',
    dimensions: `${width}x${height}`,
    quality,
    sourceBytes,
    optimizedBytes,
    savingsPercent: Number(((1 - optimizedBytes / sourceBytes) * 100).toFixed(1)),
    originalsPreserved: true,
    images,
  };
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Total savings: ${report.savingsPercent}%`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
