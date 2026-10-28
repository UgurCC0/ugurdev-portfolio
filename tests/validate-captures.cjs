const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'docs', 'screenshot-manifest.json');
const requiredProjects = [
  'industrial-electric',
  'automotive-gallery',
  'clinic-website',
  'appointment-website',
  'barber-studio',
  'hotel-booking',
  'aula-esports',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pngSize(filePath) {
  const data = fs.readFileSync(filePath);
  assert(data.length > 24, `PNG is empty or truncated: ${filePath}`);
  assert(data.subarray(1, 4).toString('ascii') === 'PNG', `Not a PNG: ${filePath}`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

assert(fs.existsSync(manifestPath), `Missing capture manifest: ${manifestPath}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.browser === 'Google Chrome', 'Capture manifest must identify Google Chrome');

for (const slug of requiredProjects) {
  const project = manifest.projects.find((entry) => entry.slug === slug);
  assert(project, `Missing project in manifest: ${slug}`);
  assert(project.status === 'captured', `Project was not captured: ${slug}`);

  const expected = [
    ['desktop-home.png', 1440, 900, false],
    ['mobile-home.png', 390, 844, false],
    ['desktop-full.png', 1440, 900, true],
    ['mobile-full.png', 390, 844, true],
  ];

  for (const [name, width, height, fullPage] of expected) {
    const filePath = path.join(root, 'assets', 'screenshots', slug, name);
    assert(fs.existsSync(filePath), `Missing required screenshot: ${filePath}`);
    const actual = pngSize(filePath);
    assert(actual.width === width, `${name} width for ${slug}: ${actual.width} != ${width}`);
    assert(
      fullPage ? actual.height >= height : actual.height === height,
      `${name} height for ${slug}: ${actual.height}`,
    );
  }
}

const aulaCommerce = [
  ['variable-product-desktop.png', 1440, 900],
  ['variable-product-mobile.png', 390, 844],
  ['cart-desktop.png', 1440, 900],
  ['cart-mobile.png', 390, 844],
  ['checkout-desktop.png', 1440, 900],
  ['checkout-mobile.png', 390, 844],
];
for (const [name, width, height] of aulaCommerce) {
  const filePath = path.join(root, 'assets', 'screenshots', 'aula-esports', name);
  assert(fs.existsSync(filePath), `Missing AULA commerce screenshot: ${filePath}`);
  const actual = pngSize(filePath);
  assert(actual.width === width && actual.height === height, `${name}: ${actual.width}x${actual.height}`);
}

console.log(`PASS: ${requiredProjects.length} projects have validated desktop/mobile viewport and full-page captures.`);
