const puppeteer = require('puppeteer');

(async function run() {
  const browser = await puppeteer.launch({
      headless: false
  });

  browser.close();
})();