/* Cookies and the privacy notice (LT/privatumas.html), on every page that loads this file.
 *  - Google Analytics loads only after the visitor agrees: localStorage "sudeduCookies" = 'yes' / 'no'; until they choose,
 *    a small banner asks. SudConsent.openSettings() shows the choice again (Klasė → Profilis, the privacy page).
 *  - A signed-in user who hasn't agreed to the current notice (userData.privacyVersion, sent by the server) gets a pop-up
 *    that can't be closed: "Sutinku" saves it (POST account/privacy), "Nesutinku" signs out - nothing is deleted. A
 *    student's parents / guardians are the ones who agree (under 14). Not on the sign-in pages, the notice itself or in
 *    the admin's "View as user". */
(function () {
  var GA_ID = 'G-96Q83PW8XY';
  var KEY = 'sudeduCookies';
  var PRIVACY_VERSION = 1;   // (the server's utils/privacy.js)
  var NOTICE_URL = '/LT/privatumas.html';
  var CONTACT = 'sudedult@gmail.com';

  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, value) { try { localStorage.setItem(key, value); } catch (e) { } }

  // ---------- Google Analytics, only with consent ----------
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var gaLoaded = false;
  function loadAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    window['ga-disable-' + GA_ID] = false;
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }
  // (consent taken back: Analytics stops on this page and its cookies go)
  function stopAnalytics() {
    window['ga-disable-' + GA_ID] = true;
    var host = location.hostname, parts = host.split('.'), domains = ['', host];
    for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (!/^_ga/.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }
  function choose(value) {
    write(KEY, value);
    if (value === 'yes') loadAnalytics(); else stopAnalytics();
    hideBanner();
  }
  if (read(KEY) === 'yes') loadAnalytics();

  // ---------- styles ----------
  function addStyles() {
    if (document.getElementById('sud-consent-css')) return;
    var css = document.createElement('style');
    css.id = 'sud-consent-css';
    css.textContent =
      '.sudc-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:100000;max-width:560px;margin:0 auto;background:#fff;color:#2b2b2b;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.18);padding:16px 18px;font:15px/1.45 inherit;font-family:inherit}' +
      '.sudc-banner p{margin:0 0 12px}.sudc-banner a,.sudc-modal a{color:#1f7f6b;text-decoration:underline}' +
      '.sudc-row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}' +
      '.sudc-btn{border:0;border-radius:10px;padding:9px 16px;font:inherit;font-weight:600;cursor:pointer}' +
      '.sudc-yes{background:#32ac93;color:#fff}.sudc-no{background:#eef1f0;color:#2b2b2b}' +
      '.sudc-state{font-size:13px;color:#666;margin:-4px 0 10px}' +
      '.sudc-overlay{position:fixed;inset:0;z-index:100001;background:rgba(20,30,28,.55);display:flex;align-items:center;justify-content:center;padding:16px}' +
      '.sudc-modal{background:#fff;color:#2b2b2b;border-radius:16px;max-width:480px;width:100%;padding:22px 22px 18px;box-shadow:0 12px 40px rgba(0,0,0,.25);font-family:inherit;font-size:15px;line-height:1.5}' +
      '.sudc-modal h2{margin:0 0 10px;font-size:20px}.sudc-modal p{margin:0 0 12px}';
    document.head.appendChild(css);
  }

  // ---------- the cookie banner / settings ----------
  var banner = null;
  function hideBanner() { if (banner) { banner.remove(); banner = null; } }
  function showBanner(asSettings) {
    addStyles();
    hideBanner();
    var current = read(KEY);
    banner = document.createElement('div');
    banner.className = 'sudc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Slapukų nustatymai');
    banner.innerHTML =
      '<p>SUDEDU naudoja naršyklės saugyklą, kad veiktų prisijungimas ir svetainės funkcijos, o jums sutikus – ' +
      '„Google Analytics“ slapukus lankomumo statistikai. <a href="' + NOTICE_URL + '" target="_blank" rel="noopener">Privatumo pranešimas</a></p>' +
      (asSettings ? '<p class="sudc-state">Dabar: ' + (current === 'yes' ? 'statistikos slapukai leidžiami' : 'tik būtini') + '</p>' : '') +
      '<div class="sudc-row"><button type="button" class="sudc-btn sudc-no">Tik būtini</button>' +
      '<button type="button" class="sudc-btn sudc-yes">Sutinku</button></div>';
    banner.querySelector('.sudc-no').onclick = function () { choose('no'); };
    banner.querySelector('.sudc-yes').onclick = function () { choose('yes'); };
    document.body.appendChild(banner);
  }

  // ---------- the privacy notice, for a signed-in user ----------
  function signedInUser() {
    try {
      var u = JSON.parse(read('userData') || 'null');
      return u && u.token ? u : null;
    } catch (e) { return null; }
  }
  function askPrivacy() {
    var path = location.pathname;
    if (/(privatumas|prisijungimas|reset-password|verify-email)\.html$/.test(path)) return;
    if (typeof simulationInfo === 'function' && simulationInfo()) return;
    var u = signedInUser();
    // (privacyVersion comes with the user's data from the server - until it has, nothing is asked)
    if (!u || u.privacyVersion == null || Number(u.privacyVersion) >= PRIVACY_VERSION) return;
    addStyles();
    var student = u.accType === 'student';
    var overlay = document.createElement('div');
    overlay.className = 'sudc-overlay';
    overlay.innerHTML = '<div class="sudc-modal" role="dialog" aria-modal="true" aria-labelledby="sudc-title"></div>';
    var box = overlay.firstChild;
    function main() {
      box.innerHTML =
        '<h2 id="sudc-title">Privatumo pranešimas</h2>' +
        (student
          ? '<p>Prašome, kad tėvai (globėjai) perskaitytų SUDEDU privatumo pranešimą. Paspausdami „Sutinku“ patvirtinate, kad jie susipažino ir sutinka, kad naudotumėtės SUDEDU.</p>'
          : '<p>Norėdami toliau naudotis SUDEDU, susipažinkite su privatumo pranešimu ir patvirtinkite, kad sutinkate.</p>') +
        '<p><a href="' + NOTICE_URL + '" target="_blank" rel="noopener">Skaityti privatumo pranešimą</a></p>' +
        '<p class="sudc-state" id="sudc-error" hidden>Nepavyko išsaugoti. Bandykite dar kartą.</p>' +
        '<div class="sudc-row"><button type="button" class="sudc-btn sudc-no">Nesutinku</button>' +
        '<button type="button" class="sudc-btn sudc-yes">Sutinku</button></div>';
      box.querySelector('.sudc-yes').onclick = agree;
      box.querySelector('.sudc-no').onclick = declined;
    }
    function declined() {
      box.innerHTML =
        '<h2 id="sudc-title">Be sutikimo SUDEDU naudotis negalima</h2>' +
        '<p>Būsite atjungti. Paskyra ir jos duomenys lieka – kitą kartą prisijungę galėsite sutikti. ' +
        'Jei norite, kad paskyra būtų ištrinta, parašykite <a href="mailto:' + CONTACT + '">' + CONTACT + '</a>.</p>' +
        '<div class="sudc-row"><button type="button" class="sudc-btn sudc-no">Grįžti</button>' +
        '<button type="button" class="sudc-btn sudc-yes">Atsijungti</button></div>';
      box.querySelector('.sudc-no').onclick = main;
      box.querySelector('.sudc-yes').onclick = function () {
        if (typeof logout === 'function') logout(); else location.href = '/LT/prisijungimas.html';
      };
    }
    function agree() {
      var btn = box.querySelector('.sudc-yes');
      btn.disabled = true;
      var send = typeof apiFetch === 'function' && typeof apiBase !== 'undefined'
        ? apiFetch(apiBase + 'account/privacy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        : Promise.resolve(null);
      send.then(function (r) {
        if (!r || !r.ok) throw new Error('privacy: ' + (r ? r.status : 'no response'));
        var now = signedInUser();
        if (now) { now.privacyVersion = PRIVACY_VERSION; write('userData', JSON.stringify(now)); }
        overlay.remove();
      }).catch(function (e) {
        console.error(e);
        btn.disabled = false;
        var err = box.querySelector('#sudc-error');
        if (err) err.hidden = false;
      });
    }
    main();
    document.body.appendChild(overlay);
  }

  function start() {
    if (read(KEY) !== 'yes' && read(KEY) !== 'no') showBanner(false);
    askPrivacy();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.SudConsent = { openSettings: function () { showBanner(true); }, PRIVACY_VERSION: PRIVACY_VERSION };
})();
