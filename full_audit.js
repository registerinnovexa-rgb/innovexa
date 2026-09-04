import puppeteer from 'puppeteer';

const delay = ms => new Promise(r => setTimeout(r, ms));
const BASE = 'https://innovexareg.vercel.app';

const PAGES = [
  '/', '/register', '/admin', '/forge', '/atlas',
  '/community', '/packet-route', '/pathfinder', '/status', '/feedback'
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });

  for (const path of PAGES) {
    const page = await browser.newPage();
    const errors = [];
    const warnings = [];
    const failedReqs = [];
    const allLogs = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') errors.push(text);
      else if (msg.type() === 'warning') warnings.push(text);
      allLogs.push(`[${msg.type()}] ${text}`);
    });

    page.on('pageerror', err => {
      errors.push('[PAGEERROR] ' + err.message);
    });

    page.on('requestfailed', req => {
      failedReqs.push(`FAILED: ${req.url()} — ${req.failure()?.errorText}`);
    });

    try {
      const resp = await page.goto(BASE + path, { waitUntil: 'networkidle2', timeout: 20000 });
      await delay(2000);

      console.log(`\n${'='.repeat(60)}`);
      console.log(`PAGE: ${path}`);
      console.log(`HTTP: ${resp.status()}`);
      console.log(`TITLE: ${await page.title()}`);
      
      if (errors.length) {
        console.log(`\n❌ ERRORS (${errors.length}):`);
        errors.forEach(e => console.log('  ' + e));
      } else {
        console.log(`✅ No JS errors`);
      }

      if (warnings.length) {
        console.log(`\n⚠️ WARNINGS (${warnings.length}):`);
        warnings.forEach(w => console.log('  ' + w));
      }

      if (failedReqs.length) {
        console.log(`\n🔴 FAILED REQUESTS (${failedReqs.length}):`);
        failedReqs.forEach(r => console.log('  ' + r));
      }

      // Check for broken links/hrefs
      const brokenLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        return links.map(a => a.href).filter(h => h.includes('.html'));
      });
      if (brokenLinks.length > 0) {
        console.log(`\n⚠️ OLD .html LINKS: ${brokenLinks.join(', ')}`);
      }

      // Check for missing images
      const brokenImgs = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.src);
      });
      if (brokenImgs.length > 0) {
        console.log(`\n🖼️ BROKEN IMAGES (${brokenImgs.length}): ${brokenImgs.join(', ')}`);
      }

    } catch (e) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`PAGE: ${path}`);
      console.log(`💥 FAILED TO LOAD: ${e.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('\n\nAudit complete.');
})();
