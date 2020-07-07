const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const isEqual = require('lodash/isEqual');
const kebabCase = require('lodash/kebabCase');

const DIR_OUT = 'screenshots';
const URL_DEMO =
  'https://www.google.com/maps/@40.7573787,-73.9860078,3a,' +
  '75y,197.52h,109.03t/data=!3m6!1e1!3m4!1sTaaWxGerYu7hmj4-ATCrLg!2e0!7i16' +
  '384!8i8192';
const SEL_CONTAINER =
  '.tactile-timemachine__seek-bar-container:not(.tactile-timemachine__loading)';
const SEL_TIMETRAVEL = '[aria-label="Show historical imagery"]';
const SEL_SCRUBBER = `.tactile-timemachine__scrubber:not(.tactile-timemachine__scrubber-transitioning)`;
const SEL_DISMISS = [
  '.widget-consent-button-later',
  '.section-homepage-promo-text-button',
];
const SEL_HIDE = ['.widget-image-header-close'];

let page;

async function doIfFound(sel, cb) {
  try {
    await page.$(sel);
    await cb();
  } catch (e) {}
}

async function hideIf() {
  await doIfFound(...arguments, async () =>
    page.evaluate((s) => {
      document.querySelector(s).style.visibility = 'hidden';
    }, sel)
  );
}

async function clickIf() {
  await doIfFound(...arguments, async () => page.click(sel));
}

async function keyNext(sel, key) {
  await page.waitForSelector(sel);
  await page.focus(sel);
  try {
    await page.keyboard.press(key);
  } catch (e) {}
}

async function activateNext() {
  await keyNext(...arguments, 'Enter');
}

async function rightNext() {
  await keyNext(...arguments, 'ArrowRight');
}

async function write(date) {
  if (!fs.existsSync(DIR_OUT)) {
    fs.mkdirSync(DIR_OUT);
  }

  const title = `times-sq-${date}.png`;
  await page.screenshot({ path: path.join(DIR_OUT, title), fullPage: true });

  console.log('Screenshot saved:', title);
}

async function getAttr(attr) {
  await new Promise(res => setTimeout(res, 100));
  await page.waitForSelector(SEL_SCRUBBER);
  return page.$eval(SEL_SCRUBBER, (e, a) => e.getAttribute(a), attr);
}

async function getNowMax() {
  const RADIX = 10;
  return [
    parseInt(await getAttr('aria-valuenow'), RADIX),
    parseInt(await getAttr('aria-valuemax'), RADIX)
  ];
}

async function getDateValue() {
  return kebabCase(await getAttr('aria-valuetext'));
}

(async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  });

  try {
    page = await browser.newPage();
    await page.goto(URL_DEMO, { waitUntil: 'networkidle0' });

    for (let sel of SEL_DISMISS) clickIf(sel);
    for (let sel of SEL_HIDE) hideIf(sel);

    await activateNext(SEL_TIMETRAVEL);

    let selScrub, date, converged = false;
    do {
      await activateNext(SEL_SCRUBBER);

      date = await getDateValue();
      await write(date);
      await rightNext(SEL_SCRUBBER);

      converged = isEqual(...(await getNowMax()));
    } while (!converged);

    console.log('COMPLETE');
    await new Promise(resolve => setTimeout(resolve, 1e5));
    
  } catch (ignore) {
    console.error('Time-travel not available.');
    console.error(ignore);
  } finally {
    page.close();
  }

  browser.close();
})();
