const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const caseStudies = [
  'industrial-electric.md',
  'automotive-gallery.md',
  'clinic-website.md',
  'appointment-website.md',
  'barber-studio.md',
  'hotel-booking.md',
  'aula-esports.md',
];
const requiredDocs = [
  'screenshot-inventory.md',
  'evidence-matrix.md',
  'qa-report.md',
  'publication-plan.md',
];

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.name.endsWith('.md') ? [target] : [];
  });
}

function assertLocalLinks(filePath, content) {
  const links = [...content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim());
  for (const rawTarget of links) {
    const target = rawTarget.replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^(https?:\/\/|#)/i.test(rawTarget)) continue;
    assert(!/^(mailto:|file:)/i.test(rawTarget), `Disallowed public link in ${filePath}: ${rawTarget}`);
    const resolved = path.resolve(path.dirname(filePath), decodeURIComponent(target));
    assert(resolved.startsWith(root), `Link escapes portfolio root in ${filePath}: ${rawTarget}`);
    assert(fs.existsSync(resolved), `Broken local link in ${filePath}: ${rawTarget}`);
  }
}

const readmePath = path.join(root, 'README.md');
assert(fs.existsSync(readmePath), 'Missing README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
assert(/approximately one year/i.test(readme), 'README must position experience accurately');
assert(/fictional portfolio project/i.test(readme), 'README must disclose AULA as fictional');
assert(!/cancatak59@gmail\.com/i.test(readme), 'Authenticated account email is not verified public contact information');
assert((readme.match(/assets\/screenshots\//g) || []).length >= 7, 'README must show real screenshots for all seven projects');

for (const file of caseStudies) {
  const filePath = path.join(root, 'projects', file);
  assert(fs.existsSync(filePath), `Missing case study: ${file}`);
  const content = fs.readFileSync(filePath, 'utf8');
  for (const heading of ['Project overview', 'Business purpose', 'Main functionality', 'Technology stack', 'Responsive behavior', 'Technical challenges', 'Implemented solutions', 'Screenshots', 'Demo']) {
    assert(new RegExp(`^## ${heading}`, 'mi').test(content), `${file} is missing section: ${heading}`);
  }
}

for (const file of requiredDocs) {
  assert(fs.existsSync(path.join(root, 'docs', file)), `Missing QA/handoff document: ${file}`);
}

const forbiddenExtensions = new Set(['.sql', '.zip', '.env', '.log', '.key', '.pem', '.php']);
for (const filePath of fs.readdirSync(root, { recursive: true }).map((entry) => path.join(root, entry))) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) continue;
  assert(!forbiddenExtensions.has(path.extname(filePath).toLowerCase()), `Forbidden public file type: ${filePath}`);
}

const secretPatterns = [
  /BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/,
  /DB_PASSWORD\s*=/i,
  /AUTH_KEY\s*['"]?\s*,/i,
  /wp-config\.php/i,
  /cancatak59@gmail\.com/i,
];
for (const filePath of markdownFiles(root)) {
  const content = fs.readFileSync(filePath, 'utf8');
  assertLocalLinks(filePath, content);
  for (const pattern of secretPatterns) {
    assert(!pattern.test(content), `Sensitive pattern ${pattern} in ${filePath}`);
  }
}

console.log('PASS: public portfolio structure, disclosures, local links, and secret boundaries validated.');
