// klase-auction.js - the "Aukcionas" section of klase.html: the teacher offers rewards (fixed price or auction),
// students spend their SUDEDU coins on them, redeem what they own, and the teacher confirms each redemption.
// All rules (prices, limits, who wins, coins) are enforced by the server (back-end/src/routes/auctionRoutes.js);
// this page only shows the state and reports the server's answers. While the section is open the state is
// refreshed every 45 s, and once on page load (for the badge on the section's button).
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var me = (function () { try { return JSON.parse(localStorage.getItem('userData')) || {}; } catch (e) { return {}; } })();
  var isTeacher = me.accType === 'teacher';
  var COIN = '<img class="au-coin" src="../images/icons/icon-sudedu-coin.png" alt="monetos">';
  var POLL_MS = 45000;
  var state = null;            // last /auction/state answer
  var typedBids = {};          // item id -> amount the student typed (kept across refreshes)
  var editingId = null;        // teacher: item being edited (null = new item)
  var pollTimer = 0;
  var busy = false;
  var lastRedeemCount = null;
  var pane = 'offers';         // the section button (pane) that is selected
  var rulesOpen = false;       // student: the class rules ("Taisyklės") are unfolded
  var settingsDirty = false;   // teacher: a setting was changed and not saved yet (refreshes leave the fields alone)
  var autoPane = false;        // the section was just opened: show Žinutės if the fresh data has messages

  // section buttons: [pane, label, icon]; Žinutės is always last
  var ICONS = {
    offers: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0z"/><circle cx="8" cy="8" r="1.6"/></svg>',
    owned: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.5h14l-1.1 11a1 1 0 0 1-1 .9H7.1a1 1 0 0 1-1-.9z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1"/><circle cx="15" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17.5" r="2"/></svg>',
    messages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>'
  };
  function tabs() {
    return state.role === 'teacher'
      ? [['offers', 'Pasiūlymai'], ['owned', 'Mokinių daiktai'], ['settings', 'Nustatymai'], ['messages', 'Žinutės']]
      : [['offers', 'Pasiūlymai'], ['owned', 'Mano daiktai'], ['messages', 'Žinutės']];
  }
  // everything that is waiting for this user: messages (+ redemption requests for the teacher)
  function messageCount() {
    if (!state || state.noTeacher) return 0;
    var n = (state.notices || []).length;
    if (state.role === 'teacher') n += (state.owned || []).filter(function (o) { return o.status === 'redeem'; }).length;
    return n;
  }

  var MONTHS = ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'];
  var ERR = {
    PRICE_CHANGED_BID: 'Kol statei, kažkas pastatė daugiau. Dabar mažiausias statymas: {minBid}.',
    PRICE_CHANGED_BUY: 'Mokytojas pakeitė kainą. Nauja kaina: {price}.',
    BID_TOO_LOW: 'Naujas statymas turi būti didesnis už tavo dabartinį ({myBid}).',
    NOT_ENOUGH_COINS: 'Neužtenka monetų.',
    LIMIT_OWNED: 'Vienu metu gali turėti (kartu su laimimais aukcionais) ne daugiau kaip {limit} daiktų.',
    LIMIT_BIDS: 'Vienu metu gali statyti ne daugiau kaip {limit} aukcionuose.',
    AUCTION_ENDED: 'Šis aukcionas jau baigėsi.',
    SOLD_OUT: 'Šis daiktas jau išparduotas.',
    ALREADY_BOUGHT: 'Šį daiktą jau nusipirkai. Vienas mokinys gali nusipirkti tik vieną.',
    NOT_FOUND: 'Šio daikto nebėra.',
    NO_TEACHER: 'Pirmiausia pridėk mokytoją.',
    NOT_OWNED: 'Šio daikto nebeturi arba jis jau panaudotas.',
    NOT_REDEEMED: 'Mokinys šio daikto dar nepanaudojo.',
    BAD_TITLE: 'Įrašyk pavadinimą (iki 80 simbolių).',
    BAD_DESCRIPTION: 'Aprašymas per ilgas (iki 300 simbolių).',
    BAD_PRICE: 'Kaina turi būti sveikasis skaičius nuo 0 iki 100 000.',
    BAD_QUANTITY: 'Kiekis turi būti nuo 1 iki 100.',
    BAD_DATE: 'Pasirink aukciono pabaigos datą: nuo šiandien iki 9 mėnesių į priekį.',
    BAD_AMOUNT: 'Įrašyk tinkamą statymo sumą.',
    HAS_BIDS: 'Šiam aukcionui jau yra statymų, todėl kainos, kiekio ir pardavimo būdo keisti nebegalima.',
    BAD_LIMIT: 'Apribojimas turi būti skaičius nuo 1 iki 100 arba tuščias laukelis.',
    LIMIT_PERIOD: 'Per šį laikotarpį daugiau daiktų įsigyti nebegali (limitas: {limit}).',
    BAD_PERIOD: 'Pasirink laikotarpį, per kurį skaičiuojami įsigyti daiktai.'
  };

  function say(msg, isError) { if (typeof messageToTheUser === 'function') messageToTheUser(msg, isError !== false); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fill(t, data) { return t.replace(/\{(\w+)\}/g, function (_, k) { return data && data[k] != null ? data[k] : ''; }); }
  function errText(body, kind) {
    var code = body && body.error;
    if (code === 'PRICE_CHANGED') code += kind === 'buy' ? '_BUY' : '_BID';
    return ERR[code] ? fill(ERR[code], body) : 'Nepavyko. Bandyk dar kartą vėliau.';
  }
  function coins(n) { return COIN + '<b>' + esc(Number(n).toLocaleString('lt-LT')) + '</b>'; }
  function niceDay(day) {
    if (!day) return '';
    if (state && day === state.today) return 'šiandien';
    var p = day.split('-');
    var sameYear = state && state.today && state.today.slice(0, 4) === p[0];
    return (sameYear ? '' : p[0] + ' m. ') + MONTHS[Number(p[1]) - 1] + ' ' + Number(p[2]) + ' d.';
  }
  var PERIOD_THIS = { '1w': 'šią savaitę', '2w': 'šias 2 savaites', '1m': 'šį mėnesį', '2m': 'šiuos 2 mėnesius', '3m': 'šiuos 3 mėnesius', semester: 'šį pusmetį', year: 'šiuos mokslo metus' };
  function plusDays(day, n) { var d = new Date(day + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  // first day of semester II for grades 1-4 (key = school year starting in Sept) - the same table and fallback
  // (3rd Monday of January) as back-end auctionRoutes.js, which is what the limit is counted by
  var SEMESTER2_START = { 2025: '2026-01-19', 2026: '2027-01-18' };
  function semester2Start(schoolYear) {
    if (SEMESTER2_START[schoolYear]) return SEMESTER2_START[schoolYear];
    var firstMonday = 1 + ((8 - new Date(Date.UTC(schoolYear + 1, 0, 1)).getUTCDay()) % 7);
    return (schoolYear + 1) + '-01-' + String(firstMonday + 14).padStart(2, '0');
  }
  // the limit choices: "Neribota" or 1-6 (and a larger value saved earlier, so saving the settings doesn't change it)
  var LIMIT_CHOICES = [1, 2, 3, 4, 5, 6];
  function fillLimitSelect(select, value) {
    var values = LIMIT_CHOICES.slice();
    if (value != null && values.indexOf(value) === -1) { values.push(value); values.sort(function (a, b) { return a - b; }); }
    select.innerHTML = '<option value="">Neribota</option>' + values.map(function (v) { return '<option value="' + v + '">' + v + '</option>'; }).join('');
    select.value = value == null ? '' : String(value);
  }
  // under the period choice: what the chosen period means (only pusmečiai and mokslo metai need saying)
  function updatePeriodNote() {
    var kind = $('au-period-kind').value, note = $('au-period-note'), noLimit = $('au-max-period').value === '';
    $('au-period-kind').disabled = noLimit;                     // without a limit the period doesn't matter
    var today = state && state.today;
    if (noLimit || !today || (kind !== 'semester' && kind !== 'year')) { note.hidden = true; return; }
    var y = Number(today.slice(0, 4)), m = Number(today.slice(5, 7)), schoolYear = m >= 9 ? y : y - 1;
    var sept1 = schoolYear + '-09-01', aug31 = (schoolYear + 1) + '-08-31';
    if (kind === 'year') {
      note.textContent = 'Mokslo metai – nuo ' + niceDay(sept1) + ' iki ' + niceDay(aug31);     // (the date ends with "d.")
    } else {
      var s2 = semester2Start(schoolYear);
      note.textContent = 'Pusmečiai (kaip 1–4 klasių ugdymo plane): I – nuo ' + niceDay(sept1) + ' iki ' + niceDay(plusDays(s2, -1)) +
        ', II – nuo ' + niceDay(s2) + ' iki ' + niceDay(aug31);
    }
    note.hidden = false;
  }
  function sectionOpen() { return $('aukcionas').classList.contains('active'); }

  // ---------- talking to the server ----------
  function api(method, path, body) {
    return apiFetch(apiBase + 'auction/' + path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (!r) return { ok: false, body: null };
      return r.json().catch(function () { return null; }).then(function (b) { return { ok: r.ok, status: r.status, body: b }; });
    });
  }

  function load(opts) {
    opts = opts || {};
    if (!opts.silent && !state) showMessage('Kraunama…');
    return api('GET', 'state').then(function (r) {
      if (!r.ok || !r.body) { if (!state) showMessage('Nepavyko gauti aukciono duomenų. Bandyk dar kartą vėliau.'); return; }
      state = r.body;
      updateBadge();
      if (sectionOpen() || opts.render) render();
    }).catch(function () { if (!state) showMessage('Nepavyko susisiekti su serveriu.'); });
  }

  // one request at a time from the buttons; the answer always ends with fresh data from the server
  function act(button, method, path, body, kind) {
    if (busy) return Promise.resolve(null);
    busy = true;
    if (button) button.disabled = true;
    return api(method, path, body).then(function (r) {
      busy = false;
      if (!r.ok) {
        say(errText(r.body, kind));
        if (button) button.disabled = false;
        load({ silent: true });
        return null;
      }
      return load({ silent: true }).then(function () { return r.body; });
    }).catch(function () {
      busy = false;
      if (button) button.disabled = false;
      say('Nepavyko susisiekti su serveriu. Bandyk dar kartą.');
      return null;
    });
  }

  // ---------- rendering ----------
  function showMessage(text) {
    $('au-message').textContent = text;
    $('au-message').hidden = false;
    $('au-teacher').hidden = true;
    $('au-student').hidden = true;
    $('au-tabs').hidden = true;
    document.querySelectorAll('#aukcionas .au-pane').forEach(function (el) { el.hidden = true; });
  }

  // the section buttons and the one pane that is shown
  function renderTabs() {
    var n = messageCount();
    if (pane === 'messages' && !n) pane = 'offers';                 // nothing left to read
    if (!tabs().some(function (t) { return t[0] === pane; })) pane = 'offers';
    var counts = { offers: state.items.length, owned: state.owned.length };
    $('au-tabs').innerHTML = tabs().map(function (t) {
      var id = t[0], on = id === pane, off = id === 'messages' && !n;
      var extra = id === 'messages'
        ? (n ? '<span class="au-tab-badge">' + (n > 9 ? '9+' : n) + '</span>' : '')
        : (counts[id] ? '<span class="au-tab-count">' + counts[id] + '</span>' : '');
      return '<button class="au-tab' + (on ? ' active' : '') + '" type="button" role="tab" data-pane="' + id + '" aria-selected="' + on + '"' +
        (off ? ' disabled title="Naujų žinučių nėra"' : '') + '>' + ICONS[id] + '<span class="au-tab-label">' + t[1] + '</span>' + extra + '</button>';
    }).join('');
    $('au-tabs').hidden = false;
    document.querySelectorAll('#aukcionas .au-pane').forEach(function (el) { el.hidden = el.dataset.pane !== pane; });
  }

  function selectPane(name) {
    autoPane = false;
    if (name === pane) return;
    leavePane();
    pane = name;
    renderTabs();      // each pane keeps its own scroll position
  }
  // whatever was opened in a pane (the new / edited item form, the student's rules) closes when the pane is left
  function leavePane() {
    if (!$('au-form').hidden) closeForm();
    if (rulesOpen) setRulesOpen(false);
  }
  function setRulesOpen(open) {
    rulesOpen = open;
    $('au-limits').hidden = !open;
    $('au-rules-btn').setAttribute('aria-expanded', String(open));
    if (open) setTimeout(function () { $('au-limits').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 80);
  }

  function updateBadge() {
    var badge = $('au-nav-badge');
    if (!badge || !state) return;
    if (state.role === 'teacher') {
      var redeem = (state.owned || []).filter(function (o) { return o.status === 'redeem'; }).length;
      // a new redemption request while the teacher has the page open
      if (lastRedeemCount != null && redeem > lastRedeemCount) say('Mokinys nori panaudoti nupirktą daiktą. Patvirtinkite skiltyje „Aukcionas“ → „Žinutės“.', false);
      lastRedeemCount = redeem;
    }
    var n = messageCount();
    badge.textContent = n > 9 ? '9+' : String(n);
    badge.hidden = n === 0;
  }

  function render() {
    if (!state) return;
    if (state.noTeacher) { showMessage('Aukcionas atsiras, kai pridėsi mokytoją skiltyje „Nariai“.'); return; }
    $('au-message').hidden = true;
    renderNotices();
    if (state.role === 'teacher') renderTeacher(); else renderStudent();
    renderTabs();
  }

  function renderNotices() {
    var list = state.notices || [];
    $('au-notices').hidden = !list.length;
    $('au-notice-list').innerHTML = list.map(function (n) { return '<li>' + esc(n.text) + '</li>'; }).join('');
  }

  function itemMeta(i) {
    var parts = [];
    if (i.isAuction) {
      parts.push('<span>Pradinė kaina: ' + coins(i.price) + '</span>');
      parts.push('<span>Baigiasi: <b>' + esc(niceDay(i.closesOn)) + '</b></span>');
      if (i.quantity > 1) parts.push('<span>Laimėtojų: <b>' + i.quantity + '</b></span>');
    } else {
      parts.push('<span>Kaina: ' + coins(i.price) + '</span>');
      parts.push('<span>Liko: <b>' + i.quantity + '</b></span>');
    }
    return '<div class="au-item-meta">' + parts.join('') + '</div>';
  }
  function itemHead(i) {
    return '<div class="au-item-title">' + esc(i.title) + (i.isAuction ? ' <i class="zg-badge au-badge-auction">Aukcionas</i>' : '') + '</div>' +
      (i.description ? '<div class="au-item-desc">' + esc(i.description) + '</div>' : '');
  }

  // ----- teacher -----
  function renderTeacher() {
    $('au-teacher').hidden = false;
    $('au-student').hidden = true;
    $('au-coins').hidden = true;

    var redeem = state.owned.filter(function (o) { return o.status === 'redeem'; });
    $('au-redeem-box').hidden = !redeem.length;
    $('au-redeem-list').innerHTML = redeem.map(function (o) {
      return '<li class="au-row"><div class="au-row-text"><b>' + esc(o.nickname) + '</b> nori panaudoti „' + esc(o.title) + '“' +
        '<span>' + (o.viaAuction ? 'laimėta aukcione' : 'nupirkta') + ' už ' + coins(o.pricePaid) + '</span></div>' +
        '<button class="zg-btn zg-btn-green au-small" type="button" data-act="confirm" data-id="' + o.id + '">Patvirtinti</button></li>';
    }).join('');

    $('au-t-items').innerHTML = state.items.length ? state.items.map(function (i) {
      var bids = '';
      if (i.isAuction) {
        bids = '<div class="au-bids">' + (i.bids.length
          ? 'Statymai: ' + i.bids.map(function (b, k) { return '<span class="au-bidder' + (k < i.quantity ? ' win' : '') + '">' + esc(b.nickname) + ' ' + coins(b.amount) + '</span>'; }).join('')
          : 'Statymų dar nėra.') + '</div>';
      }
      return '<li class="au-item"><div class="au-item-main">' + itemHead(i) + itemMeta(i) + bids + '</div>' +
        '<div class="au-item-actions">' +
        '<button class="zg-btn zg-btn-light au-small" type="button" data-act="edit" data-id="' + i.id + '">Redaguoti</button>' +
        '<button class="zg-btn zg-btn-red au-small" type="button" data-act="delete" data-id="' + i.id + '">Ištrinti</button></div></li>';
    }).join('') : '<li class="zg-empty">Dar nieko nesiūlote. Paspauskite „+ Naujas daiktas“.</li>';

    // who owns what, grouped by student
    var byStudent = {};
    state.owned.forEach(function (o) { (byStudent[o.studentId] = byStudent[o.studentId] || { name: o.nickname, items: [] }).items.push(o); });
    var groups = Object.keys(byStudent).map(function (k) { return byStudent[k]; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'lt'); });
    $('au-t-owned').innerHTML = groups.length ? groups.map(function (g) {
      return '<li class="au-owner"><div class="au-owner-name">' + esc(g.name.toUpperCase()) + '</div><ul>' + g.items.map(function (o) {
        return '<li><span>' + esc(o.title) + '</span><span class="au-owned-info">' + coins(o.pricePaid) +
          (o.status === 'redeem' ? ' <i class="zg-badge au-badge-wait">Nori panaudoti</i>' : '<span class="au-valid">iki ' + esc(niceDay(o.validUntil)) + '</span>') + '</span></li>';
      }).join('') + '</ul></li>';
    }).join('') : '<li class="zg-empty">Mokiniai dar nieko neįsigijo.</li>';

    // the settings fields follow the server until the teacher changes one of them (then until they are saved)
    var st = state.settings;
    if (!settingsDirty) {
      fillLimitSelect($('au-max-owned'), st.maxOwned);
      fillLimitSelect($('au-max-bids'), st.maxBids);
      fillLimitSelect($('au-max-period'), st.maxPerPeriod);
      $('au-period-kind').value = st.periodKind || 'semester';
    }
    updatePeriodNote();
  }

  function openForm(item) {
    editingId = item ? item.id : null;
    var hasBids = !!(item && item.bids && item.bids.length);
    $('au-form-title').textContent = item ? 'Redaguoti „' + item.title + '“' : 'Naujas daiktas';
    $('au-f-title').value = item ? item.title : '';
    $('au-f-desc').value = item ? item.description : '';
    $('au-f-type').value = item && item.isAuction ? 'auction' : 'fixed';
    $('au-f-price').value = item ? item.price : 10;
    $('au-f-qty').value = item ? item.quantity : 1;
    var today = state.today;
    $('au-f-closes').min = today;
    $('au-f-closes').max = state.maxClosesOn || plusDays(today, 270);   // at most 9 months ahead (the server decides)
    $('au-f-closes').value = item && item.closesOn ? item.closesOn : plusDays(today, 7);
    ['au-f-type', 'au-f-price', 'au-f-qty'].forEach(function (id) { $(id).disabled = hasBids; });
    $('au-f-locked').hidden = !hasBids;
    syncFormType();
    $('au-form').hidden = false;
    $('au-new').hidden = true;
    $('au-f-title').focus({ preventScroll: true });
    // (after the section has made room for it) the form is shown whole, or at least from its top
    setTimeout(function () { if (!$('au-form').hidden) $('au-form').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 80);
  }
  function closeForm() { editingId = null; $('au-form').hidden = true; $('au-new').hidden = false; }
  function syncFormType() {
    var auction = $('au-f-type').value === 'auction';
    $('au-f-price-label').textContent = auction ? 'Pradinė Kaina (SUDEDU monetos)' : 'Kaina (SUDEDU monetos)';
    $('au-f-qty-label').textContent = auction ? 'Kiek bus laimėtojų' : 'Kiekis';
    $('au-f-closes-field').hidden = !auction;
    $('au-f-auction-note').hidden = !auction;
  }
  function saveForm(e) {
    e.preventDefault();
    var body = {
      title: $('au-f-title').value.trim(),
      description: $('au-f-desc').value.trim(),
      isAuction: $('au-f-type').value === 'auction',
      price: Number($('au-f-price').value),
      quantity: Number($('au-f-qty').value),
      closesOn: $('au-f-closes').value
    };
    if (!body.title) { say(ERR.BAD_TITLE); return; }
    var editing = editingId;
    act($('au-f-save'), editing ? 'PUT' : 'POST', 'items' + (editing ? '/' + editing : ''), body).then(function (r) {
      $('au-f-save').disabled = false;
      if (!r) return;
      closeForm();
      say(editing ? 'Pakeitimai išsaugoti.' : 'Daiktas pridėtas.', false);
    });
  }

  // ----- student -----
  function renderStudent() {
    $('au-student').hidden = false;
    $('au-teacher').hidden = true;
    $('au-coins').hidden = false;
    $('au-coins-amount').textContent = Number(state.coins).toLocaleString('lt-LT');

    var s = state.settings, u = state.usage, r = state.reached || {}, rows = [];
    // the class's limits, how much of each is used, and for a reached one exactly what to do
    function rule(label, used, limit, hitText) {
      rows.push('<li' + (hitText ? ' class="hit"' : '') + '><span>' + esc(label) + '</span><b>' + used + ' iš ' + limit + '</b>' +
        (hitText ? '<span class="au-rule-msg">' + esc(hitText) + '</span>' : '') + '</li>');
    }
    if (s.maxOwned != null) rule('Daiktų vienu metu (kartu su aukcionais, kuriuos dabar laimi)', u.owned + u.bids, s.maxOwned,
      r.owned && 'Pasiekta riba. Panaudok turimą daiktą – tada vėl galėsi pirkti ir statyti.');
    if (s.maxBids != null) rule('Aukcionų, kuriuose statai vienu metu', u.bids, s.maxBids,
      r.bids && 'Pasiekta riba. Naujame aukcione galėsi statyti, kai kuris nors iš jų baigsis arba kas nors pastatys už tave daugiau.');
    if (s.maxPerPeriod != null && s.periodKind) rule('Įsigyta ' + (PERIOD_THIS[s.periodKind] || 'per laikotarpį') + ' (kartu su aukcionais, kuriuos dabar laimi)', (u.period || 0) + u.bids, s.maxPerPeriod,
      r.period && 'Pasiekta riba. Vėl galėsi pirkti ir statyti nuo ' + niceDay(r.period.until));   // the date ends with "d."
    var anyHit = !!(r.owned || r.bids || r.period);
    $('au-limits').innerHTML =
      '<div class="au-limits-title">Klasės apribojimai</div>' +
      (rows.length ? '<ul class="au-rule-list">' + rows.join('') + '</ul>' : '<p class="au-limits-none">Mokytojas apribojimų nenustatė.</p>') +
      '<div class="au-limits-title">Kaip tai veikia</div><ul class="au-how">' +
      '<li>Daiktai perkami už SUDEDU monetas.</li>' +
      '<li>Aukcione monetos paimamos statant ir grąžinamos, jei kas nors pastato daugiau.</li>' +
      '<li>Aukcionas baigiasi nurodytos dienos pabaigoje. Laimi didžiausi statymai, kiekvienas moka savo statytą sumą.</li>' +
      '<li>Įsigytą daiktą reikia panaudoti per 12 mėnesių. Paspaudus „Panaudoti“, mokytojas turi tai patvirtinti.</li></ul>';
    // a reached limit is marked on the button, so it is noticed while the rules are folded
    $('au-rules-btn').classList.toggle('au-warn', anyHit);
    $('au-rules-btn').innerHTML = 'Taisyklės' + (anyHit ? '<span class="au-rules-warn" aria-label="pasiektas apribojimas">!</span>' : '');
    $('au-limits').hidden = !rulesOpen;
    var buyBlocked = !!(r.owned || r.period), newBidBlocked = !!(r.owned || r.bids || r.period);

    // keep what the student is typing (and where) across refreshes
    var focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.bidFor : null;
    var ids = {};
    $('au-s-items').innerHTML = state.items.length ? state.items.map(function (i) {
      ids[i.id] = true;
      var action;
      if (i.ended) {
        action = '<div class="au-state">Aukcionas baigėsi – laimėtojai paaiškės netrukus.</div>';
      } else if (i.isAuction) {
        var min = i.myBid != null ? i.myBid + 1 : i.minBid;
        var value = typedBids[i.id] != null ? typedBids[i.id] : min;
        var locked = i.myBid == null && newBidBlocked;      // raising an own bid is always allowed
        var status = i.myBid != null
          ? '<div class="au-state win">Tu laimi! Tavo statymas: ' + coins(i.myBid) + '</div>'
          : (i.topBid != null ? '<div class="au-state">Didžiausias statymas: ' + coins(i.topBid) + '</div>' : '<div class="au-state">Statymų dar nėra</div>');
        action = status + '<div class="au-bid"><input class="zg-input" type="number" inputmode="numeric" min="' + min + '" step="1" value="' + esc(value) + '" data-bid-for="' + i.id + '" aria-label="Statymo suma"' + (locked ? ' disabled' : '') + '>' +
          '<button class="zg-btn zg-btn-green au-small" type="button" data-act="bid" data-id="' + i.id + '"' + (locked ? ' disabled' : '') + '>' + (i.myBid != null ? 'Didinti' : 'Statyti') + '</button></div>' +
          '<div class="au-hint">' + (locked ? 'Pasiektas klasės limitas' : i.myBid != null ? 'Mažiausiai ' + min : 'Mažiausias statymas: ' + min) + '</div>';
      } else if (i.bought) {
        action = '<div class="au-state win">Jau nusipirkai</div>' +
          '<div class="au-hint">Vienas mokinys gali nusipirkti tik vieną</div>';
      } else {
        var short = state.coins < i.price;
        action = '<button class="zg-btn zg-btn-green au-small" type="button" data-act="buy" data-id="' + i.id + '"' + (short || buyBlocked ? ' disabled' : '') + '>Pirkti</button>' +
          (buyBlocked ? '<div class="au-hint">Pasiektas klasės limitas</div>' : short ? '<div class="au-hint">Trūksta ' + coins(Math.ceil((i.price - state.coins) * 10) / 10) + '</div>' : '');
      }
      return '<li class="au-item' + (i.myBid != null ? ' au-winning' : '') + '"><div class="au-item-main">' + itemHead(i) + itemMeta(i) + '</div>' +
        '<div class="au-item-actions au-student-actions">' + action + '</div></li>';
    }).join('') : '<li class="zg-empty">Mokytojas kol kas nieko nesiūlo.</li>';
    Object.keys(typedBids).forEach(function (id) { if (!ids[id]) delete typedBids[id]; });
    if (focused) { var el = document.querySelector('#au-s-items input[data-bid-for="' + focused + '"]'); if (el) el.focus(); }

    $('au-s-owned').innerHTML = state.owned.length ? state.owned.map(function (o) {
      return '<li class="au-row"><div class="au-row-text"><b>' + esc(o.title) + '</b>' +
        (o.description ? '<span>' + esc(o.description) + '</span>' : '') +
        '<span>' + (o.viaAuction ? 'Laimėta aukcione' : 'Nupirkta') + ' už ' + coins(o.pricePaid) + '</span>' +
        (o.status === 'redeem' ? '' : '<span>Panaudok iki <b>' + esc(niceDay(o.validUntil)) + '</b>, vėliau daiktas nebegalios.</span>') + '</div>' +
        (o.status === 'redeem'
          ? '<i class="zg-badge au-badge-wait">Laukia mokytojo patvirtinimo</i>'
          : '<button class="zg-btn au-small" type="button" data-act="redeem" data-id="' + o.id + '">Panaudoti</button>') + '</li>';
    }).join('') : '<li class="zg-empty">Dar nieko neturi. Nusipirk ką nors iš mokytojo pasiūlymų!</li>';
  }

  function find(list, id) { return (list || []).filter(function (x) { return String(x.id) === String(id); })[0]; }

  function onClick(e) {
    var b = e.target.closest('button[data-act]');
    if (!b || b.disabled || !state) return;
    var id = b.dataset.id, act_ = b.dataset.act, item = find(state.items, id);
    if (act_ === 'buy' && item) {
      if (item.bought) { say(ERR.ALREADY_BOUGHT); return; }
      showCustomConfirm('Pirkti „' + esc(item.title) + '“ už ' + coins(item.price) + '?', function () {
        act(b, 'POST', 'items/' + id + '/buy', { seenPrice: item.price }, 'buy').then(function (r) { if (r) say('Nupirkta! Daiktą rasi skiltyje „Mano daiktai“.', false); });
      });
    } else if (act_ === 'bid' && item) {
      var input = document.querySelector('#au-s-items input[data-bid-for="' + id + '"]');
      var amount = Number(input && input.value);
      var min = item.myBid != null ? item.myBid + 1 : item.minBid;
      if (!Number.isInteger(amount) || amount < min) { say('Statymas turi būti sveikasis skaičius, ne mažesnis nei ' + min + '.'); return; }
      if (amount - (item.myBid || 0) > state.coins) { say(ERR.NOT_ENOUGH_COINS); return; }
      var text = item.myBid != null
        ? 'Padidinti statymą aukcione „' + esc(item.title) + '“ iki ' + coins(amount) + '? Papildomai bus paimta ' + coins(amount - item.myBid) + '.'
        : 'Statyti ' + coins(amount) + ' aukcione „' + esc(item.title) + '“? Monetos bus paimtos dabar ir grąžintos, jei kas nors pastatys daugiau.';
      showCustomConfirm(text, function () {
        act(b, 'POST', 'items/' + id + '/bid', { amount: amount }, 'bid').then(function (r) {
          if (!r) return;
          delete typedBids[id];
          render();
          say('Statymas priimtas! Šiuo metu laimi tu.', false);
        });
      });
    } else if (act_ === 'redeem') {
      var o = find(state.owned, id);
      if (!o) return;
      showCustomConfirm('Panaudoti „' + esc(o.title) + '“? Mokytojas gaus pranešimą.', function () {
        act(b, 'POST', 'owned/' + id + '/redeem').then(function (r) { if (r) say('Išsiųsta! Mokytojas turi patvirtinti.', false); });
      });
    } else if (act_ === 'confirm') {
      var ow = find(state.owned, id);
      if (!ow) return;
      showCustomConfirm('Patvirtinti, kad ' + esc(ow.nickname) + ' panaudojo „' + esc(ow.title) + '“? Įrašas bus ištrintas.', function () {
        act(b, 'POST', 'owned/' + id + '/confirm');
      });
    } else if (act_ === 'edit' && item) {
      openForm(item);
    } else if (act_ === 'delete' && item) {
      var refund = item.bids && item.bids.length ? ' Statę mokiniai atgaus savo monetas.' : '';
      showCustomConfirm('Ištrinti „' + esc(item.title) + '“?' + refund, function () {
        act(b, 'DELETE', 'items/' + id).then(function (r) { if (r && editingId === Number(id)) closeForm(); });
      });
    }
  }

  // ---------- refreshing while the section is open ----------
  function startPolling() {
    clearInterval(pollTimer);
    pollTimer = setInterval(function () { if (!document.hidden && sectionOpen() && !busy) load({ silent: true }); }, POLL_MS);
  }
  function stopPolling() { clearInterval(pollTimer); pollTimer = 0; }

  function init() {
    if (!$('aukcionas')) return;

    $('au-refresh').onclick = function () { var b = this; b.disabled = true; load({ render: true }).then(function () { b.disabled = false; }); };
    $('aukcionas').addEventListener('click', onClick);
    $('au-tabs').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-pane]');
      if (b && !b.disabled) selectPane(b.dataset.pane);
    });
    $('au-notices-ok').onclick = function () {
      var ids = (state && state.notices || []).map(function (n) { return n.id; });
      state.notices = [];
      render();
      updateBadge();
      if (ids.length) api('POST', 'notices/seen', { ids: ids });
    };
    $('au-s-items').addEventListener('input', function (e) {
      var id = e.target.dataset && e.target.dataset.bidFor;
      if (id) typedBids[id] = e.target.value;
    });
    $('au-s-items').addEventListener('keydown', function (e) {
      var id = e.target.dataset && e.target.dataset.bidFor;
      if (id && e.key === 'Enter') { var btn = document.querySelector('#au-s-items button[data-act="bid"][data-id="' + id + '"]'); if (btn) btn.click(); }
    });
    $('au-new').onclick = function () { openForm(null); };
    $('au-f-cancel').onclick = closeForm;
    $('au-f-type').onchange = syncFormType;
    $('au-form').addEventListener('submit', saveForm);
    $('au-rules-btn').onclick = function () { setRulesOpen(!rulesOpen); };
    ['au-max-owned', 'au-max-bids', 'au-max-period'].forEach(function (id) { fillLimitSelect($(id), null); });
    ['au-max-owned', 'au-max-bids', 'au-max-period', 'au-period-kind'].forEach(function (id) {
      $(id).addEventListener('change', function () { settingsDirty = true; updatePeriodNote(); });
    });
    $('au-settings-save').onclick = function () {
      var val = function (id) { var v = $(id).value.trim(); return v === '' ? null : Number(v); };
      act(this, 'PUT', 'settings', { maxOwned: val('au-max-owned'), maxBids: val('au-max-bids'), maxPerPeriod: val('au-max-period'), periodKind: $('au-period-kind').value }).then(function (r) {
        $('au-settings-save').disabled = false;
        if (r) { settingsDirty = false; render(); say('Nustatymai išsaugoti.', false); }
      });
    };

    document.querySelectorAll('.nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.target === 'aukcionas') {
          // opening the section: Žinutės if something is waiting, otherwise the offers
          autoPane = true;
          if (state) pane = messageCount() ? 'messages' : 'offers';
          render();
          load({ render: true }).then(function () {
            if (autoPane && state && messageCount() && pane !== 'messages') { pane = 'messages'; render(); }
            autoPane = false;
          });
          startPolling();
        }
        else { stopPolling(); leavePane(); }
      });
    });
    document.addEventListener('visibilitychange', function () { if (!document.hidden && sectionOpen()) load({ silent: true }); });

    // the badge on the section's button: redemption requests (teacher) / unread messages (student)
    load({ silent: true });

    if (new URLSearchParams(location.search).get('tab') === 'aukcionas') {
      window.addEventListener('load', function () { setTimeout(function () { var b = document.querySelector('.nav-item[data-target="aukcionas"]'); if (b) b.click(); }, 0); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Aukcionas fills exactly the visible area and only the open pane's list scrolls. When a card in that list is about as
// tall as the list's visible height (or taller), or the list would be left too little height (a small screen, the item
// form or the rules open above it), scrolling it is awkward; then the section is made taller than the screen: scrolling
// the page moves the title and the section buttons (and the form) out of view and the list gets (almost) the whole
// height, keeping the section's own padding above it. The page scrolls in #main-content, on phones / portrait tablets
// in #content-outer-container.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var PORTRAIT_TABLET = '(min-device-width: 768px) and (max-device-width: 1200px) and (orientation: portrait)';
  var CARD_SHARE = 0.85;     // a card this share of the list's normal height (or more) makes the section taller
  var MIN_LIST = 300;        // the list gets at least this much height (at most half the visible height)…
  var queued = false;

  function reset(panel, outer) {
    if (panel.style.height) panel.style.height = '';
    if (outer && outer.style.height) outer.style.height = '';
  }
  function fit() {
    queued = false;
    var panel = $('aukcionas'), main = $('main-content'), outer = $('content-outer-container');
    if (!panel || !main || !outer) return;
    var big = window.matchMedia('(min-width: 768px)').matches && !window.matchMedia(PORTRAIT_TABLET).matches;
    var scroller = big ? main : outer;
    var box = [].filter.call(panel.querySelectorAll('.au-scroll, .au-messages'), function (b) { return b.offsetParent; })[0];
    if (!panel.classList.contains('active') || !box) { reset(panel, outer); return; }
    var p = panel.getBoundingClientRect(), b = box.getBoundingClientRect();
    var above = b.top - p.top;                          // title, section buttons, the pane's heading, paddings
    var below = p.bottom - b.bottom;                    // paddings under the list
    var padTop = parseFloat(getComputedStyle(panel).paddingTop) || 0;
    var view = scroller.clientHeight;
    var normal = view - above - below;                  // the list's height when the section fits the screen
    // the cards: the top-level items of the pane's lists (not lists inside a card) and an open form
    var cards = [].filter.call(box.querySelectorAll('li, form:not([hidden])'), function (c) {
      var outerItem = c.parentElement && c.parentElement.closest('li');
      return c.offsetParent && !(outerItem && box.contains(outerItem));
    });
    var tallest = 0;
    cards.forEach(function (c) { tallest = Math.max(tallest, c.offsetHeight); });
    var overflows = box.scrollHeight > Math.max(normal, box.clientHeight) + 1;
    var bigCard = overflows && tallest >= CARD_SHARE * normal;
    var cramped = normal < Math.min(MIN_LIST, view / 2) && box.scrollHeight > Math.max(normal, 0) + 1;   // …if it has that much
    if (!bigCard && !cramped) { reset(panel, outer); return; }
    // scrolled to the end, the list starts one padding below the top of the visible area and ends at its bottom
    // (a short list: just its own height)
    var list = Math.min(view - padTop - below, box.scrollHeight);
    var height = Math.round(above + list + below);
    if (Math.abs(parseFloat(panel.style.height || 0) - height) > 1) panel.style.height = height + 'px';
    if (big && outer.style.height !== 'auto') outer.style.height = 'auto';
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(fit); } }
  function init() {
    var panel = $('aukcionas'), main = $('main-content');
    if (!panel || !main) return;
    window.addEventListener('resize', queue);
    if (window.ResizeObserver) { var ro = new ResizeObserver(queue); ro.observe(main); ro.observe(panel); }
    // lists re-rendered, panes switched, forms opened, the section shown / hidden
    new MutationObserver(queue).observe(panel, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    queue();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
