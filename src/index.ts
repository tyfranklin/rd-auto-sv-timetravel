import fs from 'fs';
import path from 'path';
import { Page, Browser, launch } from 'puppeteer';
import { kebabCase, isEqual, set } from 'lodash';

import {
  DIR_OUT,
  URL_DEMO,
  OPTS_GOTO,
  SEL_TIMETRAVEL,
  SEL_SCRUBBER,
  SEL_DISMISS,
  SEL_HIDE,
  MSG_SAVED,
  STATIC_DELAY,
} from './consts';

let page: Page;
let browser: Browser;

const justTry = async (cb: Function) => {
  try {
    await cb();
  } catch (ignore) {}
};
const clickIf = async (sel: string) => await justTry(() => page.click(sel));
const setVis = async (sel: string, vis: string) =>
  await justTry(() =>
    page.$eval(sel, (e, v) => set(e, ['style', 'display'], v), vis)
  );

async function keyNext(key = 'Enter', sel = SEL_SCRUBBER) {
  await page.waitForSelector(sel);
  await page.focus(sel);
  await page.keyboard.press(key);
}

async function shoot() {
  if (!fs.existsSync(DIR_OUT)) fs.mkdirSync(DIR_OUT);

  const filePath = path.join(
    DIR_OUT,
    `times-sq-${kebabCase(await aria('text'))}.png`
  );

  await new Promise((res) => setTimeout(res, STATIC_DELAY * 12));
  for (let sel of SEL_HIDE) setVis(sel, 'none');
  await page.screenshot({ path: filePath, fullPage: true });
  for (let sel of SEL_HIDE) setVis(sel, 'block');

  console.log(MSG_SAVED, filePath);
}

async function aria(attr: String) {
  await new Promise((res) => setTimeout(res, STATIC_DELAY));
  await page.waitForSelector(SEL_SCRUBBER);

  return (
    (await page.$eval(
      SEL_SCRUBBER,
      (e, a) => e.getAttribute(a),
      `aria-value${attr}`
    )) || ''
  );
}

async function init() {
  await page.goto(URL_DEMO, OPTS_GOTO);

  for (let sel of SEL_DISMISS) clickIf(sel);

  await keyNext('Enter', SEL_TIMETRAVEL);
}

export async function main() {
  browser = await launch({ headless: false });
  page = await browser.newPage();

  try {
    await init();

    let converged = false;
    do {
      await keyNext();
      await shoot();
      await keyNext('ArrowRight');

      const arr = [await aria('now'), await aria('max')].map((a) =>
        parseInt(a, 10)
      );

      converged = isEqual(arr[0], arr[1]);
    } while (!converged);
  } catch (err) {
    console.error('Time-travel not available.');
    console.error(err);
  } finally {
    page.close();
    browser.close();
  }
}
