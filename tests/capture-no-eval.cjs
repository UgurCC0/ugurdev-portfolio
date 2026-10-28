const fs = require('fs');
const path = require('path');
const assert = require('assert');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'scripts', 'capture-portfolio.cjs'), 'utf8');
assert(!source.includes('Function(`'), 'Capture workflow must not use Function(...) because demos may enforce CSP without unsafe-eval');
assert(!source.includes('eval('), 'Capture workflow must not use eval(...)');

console.log('PASS: capture workflow is compatible with strict script-src CSP.');
