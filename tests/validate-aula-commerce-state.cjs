const fs = require('fs');
const path = require('path');
const assert = require('assert');

const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'docs', 'screenshot-manifest.json'), 'utf8'));
const aula = manifest.projects.find((project) => project.slug === 'aula-esports');

assert(aula?.additional?.cart?.ready === true, 'Cart capture must record a fully loaded WooCommerce block');
assert(aula.additional.cart.itemCount >= 1, 'Cart capture must contain a real product row');
assert(aula.additional.cart.skeletonCount === 0, 'Cart capture must contain zero skeleton placeholders');
assert(aula?.additional?.checkout?.ready === true, 'Checkout capture must record a fully loaded WooCommerce block');
assert(aula.additional.checkout.contactFormVisible === true, 'Checkout contact form must be visible');
assert(aula.additional.checkout.skeletonCount === 0, 'Checkout capture must contain zero skeleton placeholders');

console.log('PASS: AULA Cart and Checkout captures contain loaded WooCommerce content, not skeletons.');
