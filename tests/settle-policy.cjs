const assert = require('assert');
const { shouldBlockCapture } = require('../scripts/capture-policy.cjs');

assert.strictEqual(
  shouldBlockCapture({ complete: false, loading: 'eager', rect: { width: 0, height: 0 } }),
  true,
  'Incomplete eager images must block capture',
);
assert.strictEqual(
  shouldBlockCapture({ complete: false, loading: 'lazy', rect: { width: 300, height: 300 } }),
  true,
  'Incomplete rendered lazy images must block capture',
);
assert.strictEqual(
  shouldBlockCapture({ complete: false, loading: 'lazy', rect: { width: 0, height: 0 } }),
  false,
  'Hidden zero-area lazy images must not block capture',
);
assert.strictEqual(
  shouldBlockCapture({ complete: true, loading: 'lazy', rect: { width: 300, height: 300 } }),
  false,
  'Completed images must not block capture',
);

console.log('PASS: capture wait policy ignores only hidden zero-area lazy images.');
