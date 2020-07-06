const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DIR_OUT = 'screenshots';
const URL_DEMO = 'https://www.google.com/maps/@40.7573787,-73.9860078,3a,'
  + '75y,197.52h,109.03t/data=!3m6!1e1!3m4!1sTaaWxGerYu7hmj4-ATCrLg!2e0!7i16'
  + '384!8i8192';
const SEL_DISMISS = [
  '.widget-consent-button-later',
  '.section-homepage-promo-text-button'
];
const SEL_HIDE = [
  '.widget-image-header-close'
];

async function doIfFound(page, selector, cb) {
  try {
    await page.$(selector);
    await cb();
  } catch (e) {}
}

async function hideIf() {
  await doIfFound(...arguments, async () => page.evaluate((s) => {
    document.querySelector(s).style.visibility = 'hidden';
  }, selector));
}

async function clickIf() {
  await doIfFound(...arguments, async () => page.click(selector));
}

(async function run() {
  const browser = await puppeteer.launch({
      headless: false
  });

  if (!fs.existsSync(DIR_OUT)){
    fs.mkdirSync(DIR_OUT);
  }

  const page = await browser.newPage();
  await page.goto(URL_DEMO, {'waitUntil' : 'networkidle0'});

  for (let sel in SEL_DISMISS) {
    clickIf(page, sel);
  }

  for (let sel in SEL_HIDE) {
    hideIf(page, sel);
  }

  const title = `times-sq.png`;
  await page.screenshot({path: path.join(DIR_OUT, title), fullPage: true});

  page.close();
  browser.close();
})();
