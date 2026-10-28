const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outputRoot = path.join(root, 'assets', 'screenshots');
const manifestPath = path.join(root, 'docs', 'screenshot-manifest.json');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const projects = [
  { slug: 'industrial-electric', name: 'Industrial Electric', url: 'https://ugurweb-elektrik-demo.cancatak59.workers.dev/' },
  { slug: 'automotive-gallery', name: 'Automotive Gallery', url: 'https://ugurweb-automotive-demo.cancatak59.workers.dev/' },
  { slug: 'clinic-website', name: 'Clinic Website', url: 'https://ugurweb-clinic-demo.cancatak59.workers.dev/' },
  { slug: 'appointment-website', name: 'Appointment Website', url: 'https://ugurweb-appointment-demo.cancatak59.workers.dev/' },
  { slug: 'barber-studio', name: 'Barber Studio', url: 'https://ugurweb-barber-sales-demo.cancatak59.workers.dev/' },
  { slug: 'hotel-booking', name: 'Hotel Booking', url: 'https://ugurweb-hotel-demo.cancatak59.workers.dev/' },
  { slug: 'aula-esports', name: 'AULA Esports', url: 'http://127.0.0.1:8088/' },
];

const viewports = [
  { label: 'desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
  { label: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function settlePage(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });

  await page.evaluate(async () => {
    const step = Math.max(320, Math.round(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    window.scrollTo(0, 0);
  });

  await page.waitForFunction(() => {
    const images = [...document.images].filter((image) => image.currentSrc || image.src);
    return images.every((image) => {
      if (image.complete) return true;
      const rect = image.getBoundingClientRect();
      return image.loading === 'lazy' && rect.width === 0 && rect.height === 0;
    });
  }, null, { timeout: 15000 });

  await page.evaluate(async () => {
    const pending = [...document.images]
      .filter((image) => image.complete && image.naturalWidth > 0 && typeof image.decode === 'function')
      .map((image) => image.decode().catch(() => undefined));
    await Promise.all(pending);
    window.scrollTo(0, 0);
  });
  await delay(600);
}

async function waitForCartReady(page) {
  await page.waitForFunction(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const items = [...document.querySelectorAll('.wc-block-cart-items__row')].filter(visible);
    const skeletons = [...document.querySelectorAll('[class*="skeleton"]')].filter(visible);
    const busy = [...document.querySelectorAll('[aria-busy="true"]')].filter(visible);
    return items.length > 0 && skeletons.length === 0 && busy.length === 0;
  }, null, { timeout: 30000 });
}

async function waitForCheckoutReady(page) {
  await page.waitForFunction(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const contactField = document.querySelector('.wc-block-checkout__contact-fields input[type="email"], input#email');
    const skeletons = [...document.querySelectorAll('[class*="skeleton"]')].filter(visible);
    const busy = [...document.querySelectorAll('[aria-busy="true"]')].filter(visible);
    return contactField && visible(contactField) && skeletons.length === 0 && busy.length === 0;
  }, null, { timeout: 30000 });
}

async function commerceReadyState(page, type) {
  return page.evaluate((kind) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    };
    const skeletonCount = [...document.querySelectorAll('[class*="skeleton"]')].filter(visible).length;
    const busyCount = [...document.querySelectorAll('[aria-busy="true"]')].filter(visible).length;
    if (kind === 'cart') {
      const itemCount = [...document.querySelectorAll('.wc-block-cart-items__row')].filter(visible).length;
      return { ready: itemCount > 0 && skeletonCount === 0 && busyCount === 0, itemCount, skeletonCount, busyCount };
    }
    const contactField = document.querySelector('.wc-block-checkout__contact-fields input[type="email"], input#email');
    const contactFormVisible = Boolean(contactField && visible(contactField));
    return { ready: contactFormVisible && skeletonCount === 0 && busyCount === 0, contactFormVisible, skeletonCount, busyCount };
  }, type);
}

async function captureProject(browser, project) {
  const targetDir = path.join(outputRoot, project.slug);
  fs.mkdirSync(targetDir, { recursive: true });
  const result = {
    ...project,
    status: 'pending',
    httpStatus: null,
    title: null,
    h1: null,
    finalUrl: null,
    brokenImages: [],
    consoleErrors: [],
    files: [],
  };

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch,
      deviceScaleFactor: 1,
      colorScheme: 'light',
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('console', (message) => {
      if (message.type() === 'error') result.consoleErrors.push(`${viewport.label}: ${message.text()}`);
    });

    try {
      const response = await page.goto(project.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      if (viewport.label === 'desktop') {
        result.httpStatus = response?.status() ?? null;
        result.finalUrl = page.url();
      }
      await settlePage(page);

      if (viewport.label === 'desktop') {
        result.title = await page.title();
        result.h1 = await page.locator('h1').first().textContent().catch(() => null);
        result.brokenImages = await page.evaluate(() => [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src || image.alt || 'unknown'));
      }

      const viewportFile = `${viewport.label}-home.png`;
      const fullFile = `${viewport.label}-full.png`;
      await page.screenshot({ path: path.join(targetDir, viewportFile), fullPage: false, animations: 'disabled' });
      await page.screenshot({ path: path.join(targetDir, fullFile), fullPage: true, animations: 'disabled' });
      result.files.push(viewportFile, fullFile);
    } finally {
      await context.close();
    }
  }

  result.status = result.httpStatus && result.httpStatus < 400 && result.brokenImages.length === 0
    ? 'captured'
    : 'failed';
  return result;
}

async function captureAulaCommerce(browser, aulaResult) {
  const targetDir = path.join(outputRoot, 'aula-esports');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  const page = await context.newPage();

  try {
    const shopResponse = await page.goto('http://127.0.0.1:8088/shop/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settlePage(page);
    await page.screenshot({ path: path.join(targetDir, 'shop-desktop.png'), fullPage: false, animations: 'disabled' });

    const productUrl = await page.locator('li.product a.woocommerce-LoopProduct-link, li.product a.woocommerce-loop-product__link, li.product a[href*="/product/"]').first().getAttribute('href');
    if (!productUrl) throw new Error('No WooCommerce product link found on Shop');
    const productResponse = await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settlePage(page);
    await page.screenshot({ path: path.join(targetDir, 'product-desktop.png'), fullPage: false, animations: 'disabled' });

    await page.setViewportSize({ width: 390, height: 844 });
    await settlePage(page);
    await page.screenshot({ path: path.join(targetDir, 'product-mobile.png'), fullPage: false, animations: 'disabled' });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:8088/shop/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settlePage(page);
    const variableCard = page.locator('li.product').filter({ hasText: /Select options/i }).first();
    const variableUrl = await variableCard.locator('a.woocommerce-LoopProduct-link, a.woocommerce-loop-product__link, a[href*="/product/"]').first().getAttribute('href');
    if (!variableUrl) throw new Error('No variable WooCommerce product link found on Shop');

    const variableResponse = await page.goto(variableUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await settlePage(page);
    const selects = page.locator('form.variations_form select');
    for (let index = 0; index < await selects.count(); index += 1) {
      const select = selects.nth(index);
      const firstValue = await select.locator('option').evaluateAll((options) => {
        const match = options.find((option) => option.value && !option.disabled);
        return match?.value ?? null;
      });
      if (!firstValue) throw new Error(`No selectable value for variation control ${index + 1}`);
      await select.selectOption(firstValue);
    }
    const addButton = page.locator('form.variations_form .single_add_to_cart_button');
    await addButton.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => {
      const button = document.querySelector('form.variations_form .single_add_to_cart_button');
      return button && !button.disabled && !button.classList.contains('disabled');
    }, null, { timeout: 15000 });
    await page.screenshot({ path: path.join(targetDir, 'variable-product-desktop.png'), fullPage: false, animations: 'disabled' });

    await page.setViewportSize({ width: 390, height: 844 });
    await settlePage(page);
    await page.screenshot({ path: path.join(targetDir, 'variable-product-mobile.png'), fullPage: false, animations: 'disabled' });

    await page.setViewportSize({ width: 1440, height: 900 });
    await addButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.goto('http://127.0.0.1:8088/cart/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await waitForCartReady(page);
    await settlePage(page);
    await waitForCartReady(page);
    await page.screenshot({ path: path.join(targetDir, 'cart-desktop.png'), fullPage: false, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await settlePage(page);
    await waitForCartReady(page);
    await page.screenshot({ path: path.join(targetDir, 'cart-mobile.png'), fullPage: false, animations: 'disabled' });
    const cartState = await commerceReadyState(page, 'cart');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:8088/checkout/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await waitForCheckoutReady(page);
    await settlePage(page);
    await waitForCheckoutReady(page);
    await page.screenshot({ path: path.join(targetDir, 'checkout-desktop.png'), fullPage: false, animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await settlePage(page);
    await waitForCheckoutReady(page);
    await page.screenshot({ path: path.join(targetDir, 'checkout-mobile.png'), fullPage: false, animations: 'disabled' });
    const checkoutState = await commerceReadyState(page, 'checkout');

    aulaResult.additional = {
      shop: { url: 'http://127.0.0.1:8088/shop/', status: shopResponse?.status() ?? null, file: 'shop-desktop.png' },
      product: { url: productUrl, status: productResponse?.status() ?? null, files: ['product-desktop.png', 'product-mobile.png'] },
      variableProduct: { url: variableUrl, status: variableResponse?.status() ?? null, files: ['variable-product-desktop.png', 'variable-product-mobile.png'] },
      cart: { url: 'http://127.0.0.1:8088/cart/', files: ['cart-desktop.png', 'cart-mobile.png'], ...cartState },
      checkout: { url: 'http://127.0.0.1:8088/checkout/', files: ['checkout-desktop.png', 'checkout-mobile.png'], ...checkoutState },
      safety: 'A temporary anonymous browser cart was used. No checkout was submitted, no order was created, and stock was not changed.',
    };
  } finally {
    await context.close();
  }
}

async function main() {
  fs.mkdirSync(outputRoot, { recursive: true });
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const manifest = {
    capturedAt: new Date().toISOString(),
    browser: 'Google Chrome',
    browserVersion: await browser.version(),
    viewports: { desktop: '1440x900', mobile: '390x844' },
    projects: [],
  };

  try {
    for (const project of projects) {
      process.stdout.write(`Capturing ${project.name}... `);
      try {
        const result = await captureProject(browser, project);
        manifest.projects.push(result);
        console.log(`${result.status} (${result.httpStatus ?? 'no status'})`);
      } catch (error) {
        manifest.projects.push({ ...project, status: 'failed', error: error.message, files: [] });
        console.log(`failed: ${error.message}`);
      }
    }

    const aulaResult = manifest.projects.find((project) => project.slug === 'aula-esports');
    if (aulaResult?.status === 'captured') {
      process.stdout.write('Capturing AULA commerce views... ');
      try {
        await captureAulaCommerce(browser, aulaResult);
        console.log('captured');
      } catch (error) {
        aulaResult.additionalError = error.message;
        console.log(`failed: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  const failed = manifest.projects.filter((project) => project.status !== 'captured');
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
