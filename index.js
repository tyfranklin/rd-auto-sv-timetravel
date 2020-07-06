const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIR_OUT = 'screenshots';
const URL_DEMO = 'https://www.google.com/maps/@40.7573787,-73.9860078,3a,'
  + '75y,197.52h,109.03t/data=!3m6!1e1!3m4!1sTaaWxGerYu7hmj4-ATCrLg!2e0!7i16'
  + '384!8i8192';

(async function run() {
  const browser = await puppeteer.launch({
      headless: false
  });

  if (!fs.existsSync(DIR_OUT)){
    fs.mkdirSync(DIR_OUT);
  }

  const page = await browser.newPage();
  await page.goto(URL_DEMO, {'waitUntil' : 'networkidle0'});
  
  // await new Promise(resolve => setTimeout(resolve, 1e4));

  const title = `times-sq.png`;
  await page.screenshot({path: path.join(DIR_OUT, title), fullPage: true});

  page.close();
  browser.close();
})();
