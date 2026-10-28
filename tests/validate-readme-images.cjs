const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const reportPath = path.join(root, 'docs', 'readme-image-optimization.json');
const slugs = [
  'industrial-electric',
  'automotive-gallery',
  'clinic-website',
  'appointment-website',
  'barber-studio',
  'hotel-booking',
  'aula-esports',
];

assert(fs.existsSync(reportPath), 'Missing README image optimization report');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

assert.strictEqual(report.images.length, slugs.length, 'Optimization report must cover seven README images');
for (const slug of slugs) {
  const relative = `assets/screenshots/readme/${slug}-desktop.webp`;
  const target = path.join(root, relative);
  const source = path.join(root, 'assets', 'screenshots', slug, 'desktop-home.png');
  const entry = report.images.find((image) => image.slug === slug);

  assert(readme.includes(`](${relative})`), `README does not use optimized image: ${slug}`);
  assert(fs.existsSync(target), `Missing optimized README image: ${target}`);
  assert(entry, `Missing optimization metadata: ${slug}`);
  assert.strictEqual(entry.width, 1200, `Unexpected optimized width: ${slug}`);
  assert.strictEqual(entry.height, 750, `Unexpected optimized height: ${slug}`);
  assert(entry.optimizedBytes < entry.sourceBytes, `Optimized image is not smaller: ${slug}`);
  assert.strictEqual(entry.sourceBytes, fs.statSync(source).size, `Source byte count changed: ${slug}`);
  assert.strictEqual(entry.optimizedBytes, fs.statSync(target).size, `Optimized byte count mismatch: ${slug}`);

  const signature = fs.readFileSync(target).subarray(0, 12);
  assert(signature.subarray(0, 4).toString('ascii') === 'RIFF', `Invalid WebP RIFF header: ${slug}`);
  assert(signature.subarray(8, 12).toString('ascii') === 'WEBP', `Invalid WebP signature: ${slug}`);
}

console.log(`PASS: ${slugs.length} optimized README images preserve originals and reduce transfer size.`);
