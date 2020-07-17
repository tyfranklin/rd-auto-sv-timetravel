import { DirectNavigationOptions } from "puppeteer";

export const DIR_OUT = 'screenshots';
export const URL_DEMO =
  'https://www.google.com/maps/@40.7573787,-73.9860078,3a,' +
  '75y,197.52h,109.03t/data=!3m6!1e1!3m4!1sTaaWxGerYu7hmj4-ATCrLg!2e0!7i16' +
  '384!8i8192';
export const SEL_CONTAINER =
  '.tactile-timemachine__seek-bar-container:not(.tactile-timemachine__loading)';
export const OPTS_GOTO: DirectNavigationOptions = { waitUntil: 'networkidle0' };
export const SEL_TIMETRAVEL = '[aria-label="Show historical imagery"]';
export const SEL_SCRUBBER = `.tactile-timemachine__scrubber:not(.tactile-timemachine__scrubber-transitioning)`;
export const SEL_DISMISS = [
  '.widget-consent-button-later',
  '.section-homepage-promo-text-button',
];
export const SEL_HIDE = [
  '.widget-image-header-close',
  '.widget-image-header-scrim',
  '.watermark',
  '.app-viewcard-strip',
  '.scene-footer',
  '.noprint',
  '.gmnoprint',
  '#titlecard',
  '#watermark',
  '#snackbar',
];
export const MSG_SAVED = 'Screenshot saved:';
export const STATIC_DELAY = 50;