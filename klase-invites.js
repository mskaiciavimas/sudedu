// klase-invites.js - class invitations in Klasė → Nariai.
// Teacher: paste / type students' e-mail addresses or user IDs (any mix of spaces, commas, new lines, Excel cells),
// the first 30 are sent to the server, and a popup lists what happened to each one.
// Student: pending invitations are shown under the "add a teacher" card, with "Priimti" / "Atmesti".
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var me = (function () { try { return JSON.parse(localStorage.getItem('userData')) || {}; } catch (e) { return {}; } })();
  var MAX = 30;

  function say(msg, isError) { if (typeof messageToTheUser === 'function') messageToTheUser(msg, isError !== false); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function api(method, path, body) {
    return apiFetch(apiBase + 'class/' + path, { method: method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        if (!r) return { ok: false, body: null };
        return r.json().catch(function () { return null; }).then(function (b) { return { ok: r.ok, status: r.status, body: b }; });
      });
  }

  // ---------- reading what the teacher pasted ----------
  // E-mails written together without a space ("jonas@gmail.comona@mokykla.lt") are split where a known ending
  // (.lt and .com first, then other common ones) is directly followed by the next address.
  var TLDS = ['lt', 'com', 'eu', 'net', 'org', 'info', 'edu', 'gov', 'io', 'me', 'co', 'uk', 'lv', 'ee', 'pl', 'de', 'fr', 'it', 'es',
    'nl', 'be', 'dk', 'se', 'no', 'fi', 'ie', 'ch', 'at', 'cz', 'us', 'ca', 'ru', 'by', 'ua'];
  var GLUED = new RegExp('[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\\.)+?(?:' + TLDS.join('|') + ')(?=$|[A-Za-z0-9_%+-][A-Za-z0-9._%+-]*@)', 'iy');
  var EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  function splitGlued(token) {
    var out = [], pos = 0, m;
    while (pos < token.length) {
      GLUED.lastIndex = pos;
      m = GLUED.exec(token);
      if (!m) break;
      out.push(m[0]);
      pos = GLUED.lastIndex;
    }
    if (pos === token.length) return out;
    // what is left could not be split by the known endings: keep it if it is one ordinary address
    var rest = token.slice(pos);
    if (EMAIL.test(rest)) { out.push(rest); return out; }
    return out.concat([{ invalid: rest }]);
  }

  // -> { entries: [first 30 unique e-mails / IDs], extra: [the ones over the limit], invalid: [unrecognised bits] }
  function parse(text) {
    var tokens = String(text || '').split(/[\s,;]+/), seen = {}, valid = [], invalid = [];
    tokens.forEach(function (t) {
      t = t.replace(/^[<("'\[]+|[>)"'\].:]+$/g, '').replace(/^mailto:/i, '');
      if (!t || /^id:?$/i.test(t)) return;
      var id = t.replace(/^id[:#]?/i, '');
      var parts = /^\d{1,9}$/.test(id) ? [id] : t.indexOf('@') !== -1 ? splitGlued(t) : [{ invalid: t }];
      parts.forEach(function (p) {
        if (typeof p !== 'string') { invalid.push(p.invalid); return; }
        var key = p.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        valid.push(p);
      });
    });
    return { entries: valid.slice(0, MAX), extra: valid.slice(MAX), invalid: invalid };
  }

  // ---------- teacher: inviting ----------
  // The same form is used in Klasė → Nariai (fixed elements) and in the pop-up opened from Užduotys (openPopup):
  // f = { input, count, send, onResults(parsed, answer) }
  function updateCount(f) {
    var p = parse(f.input.value);
    f.count.textContent = 'Atpažinta: ' + (p.entries.length + p.extra.length) + ' · Neatpažinta: ' + p.invalid.length +
      (p.extra.length ? '. Bus apdoroti pirmi ' + MAX + '.' : '');
    f.count.classList.toggle('cl-warn', p.extra.length > 0);
    f.send.disabled = !p.entries.length;
  }

  // a student who was invited earlier and has not answered yet is reported as already invited
  // (an invitation the student declined is deleted, so that student can be invited again)
  var STATUS = {
    invited: ['ok', 'Kvietimas išsiųstas'],
    already_invited: ['info', 'Jau pakviesta – laukiama atsakymo'],
    in_class: ['info', 'Jau jūsų klasėje'],
    not_found: ['bad', 'Paskyra nerasta'],
    not_student: ['warn', 'Ne mokinio paskyra'],
    invalid: ['bad', 'Neatpažintas adresas'],
    skipped: ['muted', 'Neapdorotas – viršytas limitas']
  };

  // -> { html: the list of rows, sub: the line under the title }
  function resultsHtml(p, answer, again) {
    var rows = answer.results.map(function (r) { return r; })
      .concat(p.extra.map(function (e) { return { input: e, status: 'skipped' }; }))
      .concat(p.invalid.map(function (e) { return { input: e, status: 'invalid' }; }));
    var invited = answer.results.filter(function (r) { return r.status === 'invited'; }).length;
    var already = answer.results.filter(function (r) { return r.status === 'already_invited'; }).length;
    var html = '<ul class="cl-res">' + rows.map(function (r) {
      var st = STATUS[r.status] || ['muted', r.status];
      return '<li><span class="cl-res-input">' + esc(r.input) + '</span><span class="cl-chip cl-' + st[0] + '">' + st[1] +
        (r.name ? ' · ' + esc(r.name) : '') + '</span></li>';
    }).join('') + '</ul>';
    var sub = 'Pakviesta mokinių: <b>' + invited + '</b>' + (already ? ', jau pakviesta anksčiau: <b>' + already + '</b>' : '') +
      ' (apdorota ' + answer.results.length + ').';
    if (p.extra.length) sub += '<br><span class="cl-limit">Vienu kartu galima apdoroti iki ' + MAX + ' adresų ar ID. Likę ' + p.extra.length + ' ' + again + '</span>';
    return { html: html, sub: sub };
  }

  function showResults(p, answer) {
    var r = resultsHtml(p, answer, 'palikti laukelyje – spauskite „Kviesti“ dar kartą.');
    if (typeof openObjectPopup === 'function') openObjectPopup(r.html, 'Kvietimai', r.sub, null, false, { className: 'cl-res-popup' });
  }

  function send(f) {
    var btn = f.send, p = parse(f.input.value), label = btn.textContent;
    if (!p.entries.length) return;
    btn.disabled = true;
    btn.textContent = 'Siunčiama…';
    api('POST', 'invites', { entries: p.entries }).then(function (r) {
      btn.textContent = label;
      if (!r.ok || !r.body || !r.body.results) { say('Nepavyko išsiųsti kvietimų. Bandykite dar kartą vėliau.'); updateCount(f); return; }
      // the ones over the limit stay in the box for the next round
      f.input.value = p.extra.join('\n');
      updateCount(f);
      f.onResults(p, r.body);
    }).catch(function () { btn.textContent = label; updateCount(f); say('Nepavyko susisiekti su serveriu.'); });
  }

  function bindForm(f) {
    f.input.addEventListener('input', function () { updateCount(f); });
    f.input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(f); });
    f.send.addEventListener('click', function () { send(f); });
    updateCount(f);
  }

  // Užduotys: the whole form in the site's pop-up. It closes only with its × (not by clicking beside it),
  // so what was typed is not lost by a stray click.
  var HELP = 'Įrašykite arba įklijuokite (pvz., iš Excel) mokinių el. pašto adresus ar ID numerius, atskirtus tarpais, ' +
    'kableliais ar naujomis eilutėmis. Vienu kartu apdorojama iki ' + MAX + '.';
  function openPopup(prefill) {
    if (typeof openObjectPopup !== 'function') return;
    var box = document.createElement('div');
    box.className = 'inv-pop';
    var showForm = function (text) {
      box.innerHTML = '<p class="inv-help">' + HELP + '</p>' +
        '<textarea class="inv-input" rows="5" spellcheck="false" autocomplete="off" placeholder="pvz. jonas@gmail.com, ona@mokykla.lt, 1234"></textarea>' +
        '<div class="inv-foot"><span class="inv-count cl-invite-count"></span>' +
        '<button type="button" class="inv-send aa-btn primary" disabled>Kviesti</button></div>';
      var f = {
        input: box.querySelector('.inv-input'), count: box.querySelector('.inv-count'), send: box.querySelector('.inv-send'),
        onResults: function (p, answer) {
          var r = resultsHtml(p, answer, 'neapdoroti – spauskite „Kviesti likusius“.');
          var rest = f.input.value;
          box.innerHTML = '<div class="inv-sub">' + r.sub + '</div>' + r.html +
            '<div class="inv-foot inv-foot-end"><button type="button" class="inv-again aa-btn primary">' +
            (rest ? 'Kviesti likusius (' + p.extra.length + ')' : 'Kviesti daugiau') + '</button></div>';
          box.querySelector('.inv-again').addEventListener('click', function () { showForm(rest); });
        }
      };
      f.input.value = text || '';
      bindForm(f);
      setTimeout(function () { f.input.focus({ preventScroll: true }); }, 0);
    };
    showForm(prefill);
    openObjectPopup(box, 'Pakviesti mokinius', '', null, true);
  }

  // ---------- student: invitations ----------
  function ago(iso) {
    var days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    return days <= 0 ? 'šiandien' : days === 1 ? 'vakar' : 'prieš ' + days + ' d.';
  }
  var invites = [];
  function renderInvites() {
    $('cl-invites').hidden = !invites.length;
    $('cl-invite-list').innerHTML = invites.map(function (i) {
      return '<li class="cl-invite-row"><div class="cl-invite-text"><b>Mok. ' + esc(i.teacherName) + '</b> kviečia tave prisijungti prie savo klasės' +
        '<span>Mokytojo ID: ' + i.teacherId + ' · ' + ago(i.createdAt) + '</span></div>' +
        '<div class="cl-invite-actions"><button class="zg-btn zg-btn-green au-small" type="button" data-act="accept" data-id="' + i.id + '">Priimti</button>' +
        '<button class="zg-btn zg-btn-light au-small" type="button" data-act="decline" data-id="' + i.id + '">Atmesti</button></div></li>';
    }).join('');
  }
  function loadInvites() {
    api('GET', 'invites').then(function (r) {
      if (!r.ok || !r.body) return;
      invites = r.body.invites || [];
      renderInvites();
    }).catch(function () {});
  }
  function accept(inv, btn) {
    btn.disabled = true;
    api('POST', 'invites/' + inv.id + '/accept').then(function (r) {
      if (!r.ok || !r.body) {
        btn.disabled = false;
        say(r.status === 410 ? 'Šio mokytojo paskyra nebeaktyvi.' : r.status === 404 ? 'Kvietimo nebėra.' : 'Nepavyko priimti kvietimo. Bandyk dar kartą.');
        loadInvites();
        return;
      }
      // the same as adding the teacher by hand: remember the teacher and load the new class
      try {
        var u = JSON.parse(localStorage.getItem('userData')) || {};
        u.teacher = r.body.teacherInfo;
        localStorage.setItem('userData', JSON.stringify(u));
        localStorage.removeItem('classDataCache');
        localStorage.removeItem('classDataCacheExpiry');
      } catch (e) {}
      say('Prisijungei prie mok. ' + inv.teacherName + ' klasės!', false);
      setTimeout(function () { location.reload(); }, 900);
    }).catch(function () { btn.disabled = false; say('Nepavyko susisiekti su serveriu.'); });
  }

  function init() {
    if (!$('members-panel')) return;
    if (me.accType === 'teacher') {
      // the panel stays closed until the teacher opens it from the button next to "Mokiniai"
      var toggle = $('cl-invite-toggle');
      toggle.hidden = false;
      var setOpen = function (open) {
        $('cl-invite-panel').hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Uždaryti' : '+ Pakviesti mokinius';
        if (open) { $('cl-invite-input').focus({ preventScroll: true }); if (window.revealExpanded) revealExpanded($('cl-invite-panel')); }
      };
      toggle.addEventListener('click', function () { setOpen($('cl-invite-panel').hidden); });
      // going to another section closes the panel (what was typed stays in it)
      document.querySelectorAll('.nav-item').forEach(function (btn) {
        btn.addEventListener('click', function () { if (btn.dataset.target !== 'nariai' && !$('cl-invite-panel').hidden) setOpen(false); });
      });
      bindForm({ input: $('cl-invite-input'), count: $('cl-invite-count'), send: $('cl-invite-send'), onResults: showResults });
    } else if (me.accType === 'student') {
      $('cl-invite-list').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-act]');
        if (!b || b.disabled) return;
        var inv = invites.filter(function (i) { return String(i.id) === b.dataset.id; })[0];
        if (!inv) return;
        if (b.dataset.act === 'decline') {
          b.disabled = true;
          api('POST', 'invites/' + inv.id + '/decline').then(function () {
            invites = invites.filter(function (i) { return i !== inv; });
            renderInvites();
          });
          return;
        }
        var current = String(me.teacher || '');
        var text = current && current.indexOf('(ID: ' + inv.teacherId + ')') === -1
          ? 'Priimti mok. ' + esc(inv.teacherName) + ' kvietimą? Pereisi į šio mokytojo klasę (dabar esi mok. ' + esc(current.split(' (ID:')[0]) + ' klasėje).'
          : 'Prisijungti prie mok. ' + esc(inv.teacherName) + ' klasės?';
        showCustomConfirm(text, function () { accept(inv, b); });
      });
      loadInvites();
    }
  }

  window.SudInvites = { parse: parse, openPopup: openPopup };      // parse is used by the tests
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
