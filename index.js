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
const OPTS_GOTO = { waitUntil: 'networkidle0' };
const SEL_TIMETRAVEL = '[aria-label="Show historical imagery"]';
const SEL_SCRUBBER = `.tactile-timemachine__scrubber:not(.tactile-timemachine__scrubber-transitioning)`;
const SEL_DISMISS = [
  '.widget-consent-button-later',
  '.section-homepage-promo-text-button',
];
const SEL_HIDE = [
  '.widget-image-header-close',
  '.widget-image-header-scrim',
  '.watermark',
  '.app-viewcard-strip',
  '.scene-footer',
  '.noprint',
  '.gmnoprint',
  '#titlecard',
  '#watermark',
  '#snackbar'
];
const MSG_SAVED = 'Screenshot saved:';
const STATIC_DELAY = 50;

let page, browser;

const justTry = async (cb) => {try {await cb();} catch (ignore) {}};
const clickIf = async (sel) => await justTry(sel, () => page.click(sel));
const setVis = async (sel, vis) => await justTry(() => page.$eval(sel, (e, v) => e.style.display = v, vis));

async function keyNext(key = 'Enter', sel = SEL_SCRUBBER) {
  await page.waitForSelector(sel);
  await page.focus(sel);
  await page.keyboard.press(key);
}

async function shoot() {
  if (!fs.existsSync(DIR_OUT)) fs.mkdirSync(DIR_OUT);

  const filePath = path.join(DIR_OUT, `times-sq-${kebabCase(await aria('text'))}.png`);
 
  await new Promise(res => setTimeout(res, STATIC_DELAY * 12));
  for (let sel of SEL_HIDE) setVis(sel, 'none');
  await page.screenshot({ path: filePath, fullPage: true });
  for (let sel of SEL_HIDE) setVis(sel, 'block');
  
  console.log(MSG_SAVED, filePath);
}

async function aria(attr) {
  await new Promise(res => setTimeout(res, STATIC_DELAY));
  await page.waitForSelector(SEL_SCRUBBER);

  return page.$eval(SEL_SCRUBBER, (e, a) => e.getAttribute(a), `aria-value${attr}`);
}

async function init() {
  browser = await puppeteer.launch({
    headless: false,
  });
  page = await browser.newPage();
  await page.goto(URL_DEMO, OPTS_GOTO);

  for (let sel of SEL_DISMISS) clickIf(sel);

  await keyNext('Enter', SEL_TIMETRAVEL);
}

(async function run() {
  try {
    await init();

    let converged = false;
    do {
      await keyNext();
      await shoot();
      await keyNext('ArrowRight');

      converged = isEqual(...[
        await aria('now'), 
        await aria('max')
      ].map((a) => parseInt(a, 10)));
    } while (!converged);

  } catch (err) {
    console.error('Time-travel not available.');
    console.error(err);
  } finally {
    page.close();
  }

  browser.close();
})();
