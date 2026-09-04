import puppeteer from 'puppeteer';

const pages = [
  '/atlas.html', '/community.html', '/packet-route.html', 
  '/pathfinder.html', '/status.html', '/feedback.html'
];
const baseUrl = 'https://innovexareg.vercel.app';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  for (const page of pages) {
    const pageObj = await browser.newPage();
    const errors = [];
    pageObj.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errors.push(`[${msg.type()}] ${msg.text()}`);
      }
    });
    pageObj.on('pageerror', error => {
      errors.push(`[pageerror] ${error.message}`);
    });
    
    try {
      await pageObj.goto(baseUrl + page, { waitUntil: 'networkidle2', timeout: 15000 });
      console.log(`\n=== ${page} ===`);
      if (errors.length > 0) {
        console.log(errors.join('\n'));
      } else {
        console.log("No console errors/warnings.");
      }
    } catch(e) {
      console.log(`\n=== ${page} ===\nFailed to load: ${e.message}`);
    }
    await pageObj.close();
  }
  await browser.close();
})();
