import fs from 'fs';
import path from 'path';
import { Page, Browser, launch } from 'puppeteer';
import { kebabCase, isEqual } from 'lodash';

import {
  DIR_OUT,
  URL_DEMO, // This hard-coded URL could be parameterized
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

// Attempts operation, ignores result
const justTry = async (cb: Function) => {
  try {
    await cb();
  } catch (ignore) {}
};

// Clicks an element if available
const clickIf = async (sel: string) => await justTry(() => page.click(sel));

// Sets the visibility attribute of target element
const setVis = async (sel: string, vis: string) =>
  await justTry(() =>
    page.$eval(sel, (e, v) => ((e as HTMLElement).style.display = v), vis)
  );

// Simulates a key press on an element with a given selector
async function keyNext(key = 'Enter', sel = SEL_SCRUBBER) {
  await page.waitForSelector(sel); // Wait for element to render
  await page.focus(sel); // Focus iit
  await page.keyboard.press(key); // Apply keypress event to it
}

// Takes a screenshot of street view at current orientation in time and space
async function shoot() {
  if (!fs.existsSync(DIR_OUT)) fs.mkdirSync(DIR_OUT);

  const animDelay = STATIC_DELAY * 12;
  let nameAvailable = false;
  let count = 0;
  let filePath;
  do {
    count++;
    filePath = path.join(
      DIR_OUT,
      `times-sq-${kebabCase(await aria('text'))}-${count}.png`
    );
    nameAvailable = !fs.existsSync(filePath);
  } while (!nameAvailable);

  await new Promise((res) => setTimeout(res, animDelay)); // Wait for load
  for (let sel of SEL_HIDE) setVis(sel, 'none'); // Hide overlay
  await page.screenshot({ path: filePath, fullPage: true }); // Save screenshot
  for (let sel of SEL_HIDE) setVis(sel, 'block'); // Restore overlay

  console.log(MSG_SAVED, filePath);
}

// Retrieves value of aria attribute of scrubber control
async function aria(attr: String) {
  await new Promise((res) => setTimeout(res, STATIC_DELAY)); // For reliability
  await page.waitForSelector(SEL_SCRUBBER); // Waits until element is available

  return (
    (await page.$eval(
      SEL_SCRUBBER,
      (e, a) => e.getAttribute(a),
      `aria-value${attr}` // A11y attribute
    )) || ''
  );
}

// Navigates to and prepares target street view UI
async function init() {
  await page.goto(URL_DEMO, OPTS_GOTO); // Navigate to target street view

  for (let sel of SEL_DISMISS) clickIf(sel); // Dismiss unuseful components

  await keyNext('Enter', SEL_TIMETRAVEL); // Travel to next timespace
}

// Entry-point
export async function main() {
  browser = await launch({ headless: false }); // Open Chromium
  page = await browser.newPage(); // Open a tab

  try {
    await init(); // Navigate, prep page

    let converged = false;
    do {
      // Until arrived at present
      await keyNext(); // Travel to next timespace
      await shoot(); // Take picture
      await keyNext('ArrowRight'); // Select next timespace

      const arr = [
        await aria('now'), // Scrubber control's a11y 'now'
        await aria('max'), // Scrubber control's a11y 'max'
      ].map((a) => parseInt(a, 10));

      converged = isEqual(arr[0], arr[1]); // Check if arrived at present
    } while (!converged);
  } catch (err) {
    console.error('Time-travel not available.', err);
  } finally {
    page.close();
    browser.close();
  }
}
