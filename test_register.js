import puppeteer from 'puppeteer';

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('dialog', async dialog => {
    console.log('ALERT:', dialog.message());
    await dialog.accept();
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/backend')) {
      console.log('API STATUS:', response.status());
      if (response.status() !== 200) {
        console.log('API ERR:', await response.text());
      } else {
        console.log('API RES:', await response.text());
      }
    }
  });

  await page.goto('https://innovexareg.vercel.app/register', { waitUntil: 'networkidle2' });
  
  // Fill Step 1
  await page.evaluate(() => {
    document.getElementById('fullName').value = 'Test User';
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('phone').value = '9876543210';
    document.getElementById('college').value = 'Test College';
    document.getElementById('btn-next-1').click();
  });
  
  await delay(500);
  
  // Fill Step 2
  await page.evaluate(() => {
    document.getElementById('dob').value = '2000-01-01';
    document.getElementById('year').value = '3rd Year';
    document.getElementById('gender').value = 'Male';
    document.getElementById('branch').value = 'CSE';
    document.querySelector('.skill-btn').click();
    document.getElementById('btn-next-2').click();
  });
  
  await delay(1000);
  
  // Fill Step 3
  await page.evaluate(() => {
    // Fake photo and signature
    compressedPhotoBase64 = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    hasSignature = true;
    
    // Fill UTR and Captcha
    document.getElementById('utr').value = '123456789012';
    document.getElementById('captcha-answer').value = currentCaptcha;
    
    // Check Terms
    document.getElementById('termsCheckbox').checked = true;
    
    // Click submit
    document.getElementById('submit-btn').click();
  });
  
  await delay(4000);
  await browser.close();
})();
