const puppeteer = require('puppeteer');

(async function run() {
  const browser = await puppeteer.launch({
      headless: false
  });

  const page = await browser.newPage();
  await page.goto("https://www.google.com/maps/@40.7573787,-73.9860078,3a,75y,197.52h,109.03t/data=!3m6!1e1!3m4!1sTaaWxGerYu7hmj4-ATCrLg!2e0!7i16384!8i8192", {"waitUntil" : "networkidle0"});
  
  await new Promise(resolve => setTimeout(resolve, 1e4));

  page.close();
  browser.close();
})();
