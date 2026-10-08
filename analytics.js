/* Hosted-site page counts only. No tool inputs or results are read. */
(function () {
  'use strict';
  if (location.protocol !== 'https:' || location.hostname !== 'baptistsec.github.io') return;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true) return;
  var pages = ['/', '/the-working-day/', '/payment-check-companion/', '/email-header-checker/', '/ai-work-sharing-companion/', '/file-fingerprint-checker/', '/csv-identifier-checker/', '/selected-files-manifest/', '/chain-daily/'];
  var path = location.pathname.replace(/index\.html$/, '');
  if (pages.indexOf(path) === -1) return;
  try {
    if (localStorage.getItem('tidydesk-analytics-off') === '1' || localStorage.getItem('goatcounter') === 'true') return;
  } catch (_) { /* Storage may be blocked; never require it. */ }
  var pixel = new Image(1, 1);
  pixel.referrerPolicy = 'no-referrer';
  pixel.alt = '';
  if (navigator.webdriver === true) return;
  pixel.src = 'https://tidydeskdigital.goatcounter.com/count?p=' + encodeURIComponent(path);
  // Keep the request alive without displaying a counter or changing layout.
  window.tidyDeskPageCountPixel = pixel;
}());
