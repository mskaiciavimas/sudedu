// klase-games.js - the "Žaidimai" section of klase.html: class game lobbies (list, join, create, ready, start).
// Uses game-client.js (SudGame) and, for the task settings, the same controls and script as Praktika
// (matematika_options.js). Lobbies only live on the game server; nothing here is stored in the database.
//
// Safeguards: a lobby is only open while its host is on the lobby view (heartbeat every 5 s; leaving the view,
// the section or the page closes it). Everyone in a closed lobby gets a message and is taken back to the list;
// joining a lobby that no longer exists shows a message and refreshes the list; after a dropped connection the
// page re-attaches to its lobby (or reports that it was closed meanwhile).
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var me = (function () { try { return JSON.parse(localStorage.getItem('userData')) || {}; } catch (e) { return {}; } })();
  var isTeacher = me.accType === 'teacher';
  var current = null;                 // the lobby this page is in (as last sent by the server)
  var heartbeat = 0;                  // host only: interval that keeps the lobby open
  var leavingForGame = false;         // the game started: navigating away must not close the lobby
  var GAME_NAMES = { td: 'Klasės gynyba' };
  var MODE_TEXT = { timed: 'Atlaikyti nustatytą laiką', endless: 'Atsilaikyti kuo ilgiau (vis stipresnės bangos)' };
  var DIFF_TEXT = { easy: 'lengvas', normal: 'vidutinis', hard: 'sunkus', extreme: 'labai sunkus' };
  var ERR = {
    NOT_FOUND: 'Šis žaidimas jau uždarytas. Sąrašas atnaujintas.', ALREADY_STARTED: 'Šis žaidimas jau prasidėjo.',
    FULL: 'Žaidime nebėra vietų.', IS_HOST: 'Tai tavo sukurtas žaidimas.', NOT_HOST: 'Šio žaidimo nebėra.',
    TEACHER_ONLY: 'Kol kas žaidimus kuria tik mokytojai.', NOT_READY: 'Ne visi mokiniai pasiruošę.',
    NO_PLAYERS: 'Dar niekas neprisijungė.', NOT_IN_LOBBY: 'Tu nebe šiame žaidime.', TIMEOUT: 'Žaidimų serveris neatsako. Bandyk dar kartą.'
  };
  var CLOSED_TEXT = {
    'host-left': 'Vedėjas uždarė žaidimą.', 'host-gone': 'Žaidimas uždarytas, nes vedėjas išėjo iš žaidimo puslapio.',
    expired: 'Žaidimas uždarytas, nes per ilgai nebuvo pradėtas.', replaced: 'Vedėjas sukūrė naują žaidimą.'
  };

  function say(msg, isError) { if (typeof messageToTheUser === 'function') messageToTheUser(msg, isError !== false); }   // the site's own message popup
  function errText(r) { return ERR[r && r.error] || 'Nepavyko. Bandyk dar kartą.'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function show(view) { ['zg-home', 'zg-settings', 'zg-lobby'].forEach(function (id) { $(id).hidden = id !== view; }); }
  function isMine(lobby) { return String(lobby.hostId) === String(me.userId); }
  // the avatar of a class member, as already rendered and cached by this page (classDataCache.avatarSvg)
  function avatarOf(id) {
    try {
      var c = JSON.parse(localStorage.getItem('classDataCache')) || {};
      var all = (c.remainingStudents || []).concat(c.requestingStudent ? [c.requestingStudent] : []);
      var m = all.filter(function (x) { return String(x.id) === String(id); })[0];
      return m && m.avatarSvg ? m.avatarSvg : '';
    } catch (e) { return ''; }
  }
  // hosting needs the big screen of a laptop or computer; phones and small tablets can only join
  function bigScreen() {
    var a = Math.max(screen.width, screen.height), b = Math.min(screen.width, screen.height);
    return (a >= 1200 && b >= 700) || (window.innerWidth >= 1200 && window.innerHeight >= 650);
  }
  function sectionOpen() { return $('zaidimai').classList.contains('active'); }

  // ---------- active lobbies ----------
  function refreshLobbies() {
    listen();
    var list = $('zg-lobby-list'), btn = $('zg-refresh');
    btn.disabled = true;
    list.innerHTML = '<li class="zg-empty">Ieškoma…</li>';
    SudGame.request('lobby:list').then(function (r) {
      btn.disabled = false;
      if (!r || !r.ok) { list.innerHTML = '<li class="zg-empty">Nepavyko gauti žaidimų sąrašo.</li>'; return; }
      if (!r.lobbies.length) { list.innerHTML = '<li class="zg-empty">Šiuo metu klasėje žaidimų nėra.</li>'; return; }
      list.innerHTML = r.lobbies.map(function (l) {
        var mine = isMine(l), open = l.status === 'lobby', back = !open && l.inGame;
        return '<li class="zg-lobby-row"><div class="zg-code">' + esc(l.code) + '</div>' +
          '<div class="zg-lobby-info"><b>' + esc(GAME_NAMES[l.game] || l.game) + '</b><span>' + esc(l.hostName) +
          (l.hostIsTeacher ? ' <i class="zg-badge">Mokytojo</i>' : '') + ' · ' + l.players + ' žaidėjai</span></div>' +
          '<button class="zg-btn" type="button" data-code="' + esc(l.code) + '"' + (mine ? ' data-mine="1"' : '') +
          (open || mine || back ? '' : ' disabled') + '>' + (mine ? 'Atidaryti' : open ? 'Prisijungti' : back ? 'Grįžti į žaidimą' : 'Vyksta') + '</button></li>';
      }).join('');
    }).catch(function () { btn.disabled = false; list.innerHTML = '<li class="zg-empty">Nepavyko prisijungti prie žaidimų serverio.</li>'; });
  }

  function joinLobby(code) {
    listen();
    code = String(code || '').trim();
    if (!/^\d{4}$/.test(code)) { say('Įrašyk 4 skaitmenų žaidimo numerį.'); return; }
    SudGame.request('lobby:join', { code: code }).then(function (r) {
      if (!r || !r.ok) {
        say(errText(r));
        if (r && (r.error === 'NOT_FOUND' || r.error === 'ALREADY_STARTED')) refreshLobbies();
        return;
      }
      $('zg-join-code').value = '';
      // a game that has already started only lets its own players back in: straight to the questions, no lobby
      if (r.lobby.status === 'playing') startStudentGame(r.lobby); else enterLobby(r.lobby);
    }).catch(function () { say('Nepavyko prisijungti prie žaidimų serverio. Bandyk dar kartą.'); });
  }

  // a host coming back to their own lobby (e.g. after reloading the page)
  function reopenOwn(code) {
    listen();
    SudGame.request('game:host', { code: code }).then(function (r) {
      if (!r || !r.ok) { say(ERR.NOT_FOUND); refreshLobbies(); return; }
      if (r.lobby.status === 'playing') goHost(code); else enterLobby(r.lobby);
    });
  }

  // ---------- creating a game ----------
  function visible(el) { return el && el.offsetParent !== null && getComputedStyle(el).display !== 'none'; }
  function optionText(id) { var el = $(id); return el && el.selectedIndex >= 0 ? el.options[el.selectedIndex].text.trim() : ''; }
  function sentence(t) { t = t.toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); }

  // the chosen tasks as readable lines, for the lobby's task list
  function taskLines() {
    var lines = [], op = optionText('mode_choice_1');
    if (visible($('mode_choice_2'))) lines.push(sentence(op) + ': ' + optionText('mode_choice_2').toLowerCase());
    else lines.push(sentence(op));
    if (visible($('selected_number'))) lines.push('Skaičiai nuo ' + $('selected_number').value + ' iki ' + $('selected_number_2').value);
    if (visible($('remainder-option')) && $('remainder-input').checked) lines.push('Dalyba su liekana');
    if (visible($('mode_choice_3'))) lines.push(sentence(optionText('mode_choice_3')));
    if (visible($('mode_choice_5'))) lines.push(sentence(optionText('mode_choice_5')));
    if (visible($('mode_choice_6'))) lines.push(sentence(optionText('mode_choice_6')));
    if (visible($('mode_choice_7'))) lines.push('Skaičiuoti ' + optionText('mode_choice_7').toLowerCase());
    return lines;
  }

  function collectSettings() {
    var math = {
      modeChoice1: $('mode_choice_1').value, modeChoice2: $('mode_choice_2').value,
      selectedNumbers: [Number($('selected_number').value), Number($('selected_number_2').value)].sort(function (a, b) { return a - b; }),
      withRemainder: $('remainder-input').checked,
      modeChoice3: $('mode_choice_3').value !== 'C38',
      modeChoice5: $('mode_choice_5').value, modeChoice6: $('mode_choice_6').value, modeChoice7: $('mode_choice_7').value
    };
    var tasks = taskLines();
    return { math: math, tasks: tasks, label: tasks[0] || '', difficulty: $('zg-difficulty').value, mode: $('zg-mode').value, minutes: Math.max(1, Math.min(60, Number($('zg-minutes').value) || 5)) };
  }

  function createLobby() {
    listen();
    var btn = $('zg-create');
    btn.disabled = true;
    SudGame.request('lobby:create', { game: 'td', settings: collectSettings() }).then(function (r) {
      btn.disabled = false;
      if (!r || !r.ok) { say(errText(r)); return; }
      enterLobby(r.lobby);
    }).catch(function () { btn.disabled = false; say('Nepavyko prisijungti prie žaidimų serverio. Bandyk dar kartą.'); });
  }

  // ---------- the lobby ----------
  function enterLobby(lobby) {
    current = lobby;
    show('zg-lobby');
    renderLobby();
    // the host keeps the lobby open only while this view is open
    clearInterval(heartbeat);
    if (isMine(lobby)) heartbeat = setInterval(function () { SudGame.connect().then(function (s) { s.emit('host:alive'); }); }, 5000);
  }

  function exitLobby(message) {
    clearInterval(heartbeat);
    current = null;
    if (message) say(message);
    show('zg-home');
    refreshLobbies();
  }

  function renderLobby() {
    var l = current, host = isMine(l), players = l.players, s = l.settings || {};
    $('zg-lobby-code').textContent = l.code;
    $('zg-lobby-title').textContent = GAME_NAMES[l.game] || l.game;
    $('zg-lobby-host').textContent = 'Vedėjas: ' + l.hostName;
    var tasks = (s.tasks && s.tasks.length ? s.tasks : (s.label ? [s.label] : [])).slice();
    tasks.push(MODE_TEXT[s.mode] + (s.mode === 'timed' ? ': ' + s.minutes + ' min.' : ''));
    tasks.push('Sunkumas: ' + (DIFF_TEXT[s.difficulty] || ''));
    $('zg-task-list').innerHTML = tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    $('zg-players-label').textContent = 'PRISIJUNGĘ MOKINIAI (' + players.length + ')';
    // the same member cards as in "Nariai": avatar, name, and the ready state underneath
    $('zg-players').innerHTML = players.length ? players.map(function (p) {
      var isMe = String(p.id) === String(me.userId), svg = avatarOf(p.id);
      return '<li class="member-card zg-player' + (p.ready ? ' ready' : '') + (p.connected ? '' : ' off') + (isMe ? ' member-card-requesting' : '') + '">' +
        '<div class="member-avatar-outer-div"><div class="member-avatar">' + (svg || '<div class="avatar-fallback-circle"></div>') + '</div>' +
        (isMe ? '<div class="is-you-div">AŠ</div>' : '') + (p.ready && p.connected ? '<div class="zg-ready-mark">✓</div>' : '') + '</div>' +
        '<div class="member-name"><span class="students-name">' + esc(String(p.name || '').toUpperCase()) + '</span>' +
        '<span class="students-id zg-state">' + (!p.connected ? 'atsijungė' : p.ready ? 'pasiruošęs' : 'ruošiasi…') + '</span></div></li>';
    }).join('') : '<li class="zg-empty">Laukiama mokinių. Jie gali prisijungti iš savo klasės puslapio arba įvedę numerį ' + esc(l.code) + '.</li>';

    var actions = $('zg-actions'), note = $('zg-action-note'), online = players.filter(function (p) { return p.connected; });
    if (host) {
      var allReady = online.length > 0 && online.every(function (p) { return p.ready; });
      actions.innerHTML = '<button class="zg-btn zg-btn-green" type="button" id="zg-start"' + (allReady ? '' : ' disabled') + '>Pradėti žaidimą</button>' +
        '<button class="zg-btn zg-btn-red" type="button" id="zg-close">Uždaryti</button>';
      note.textContent = !online.length ? 'Laukiama mokinių.' : allReady ? 'Visi pasiruošę – galite pradėti!' : 'Laukiama, kol visi paspaus „Pasiruošęs“.';
    } else {
      var mine = players.filter(function (p) { return String(p.id) === String(me.userId); })[0];
      var ready = !!(mine && mine.ready);
      actions.innerHTML = '<button class="zg-btn' + (ready ? ' zg-btn-green' : '') + '" type="button" id="zg-ready">' + (ready ? '✓ Pasiruošęs' : 'Pasiruošęs!') + '</button>' +
        '<button class="zg-btn zg-btn-red" type="button" id="zg-leave">Išeiti</button>';
      note.textContent = ready ? 'Laukiama, kol vedėjas pradės žaidimą.' : 'Paspausk „Pasiruošęs“, kai būsi pasiruošęs.';
    }
  }

  function leaveLobby(silent) {
    if (!current) return;
    clearInterval(heartbeat);
    current = null;
    SudGame.request('lobby:leave').then(function () { if (!silent) { show('zg-home'); refreshLobbies(); } });
  }

  // ---------- starting ----------
  function goHost(code) { leavingForGame = true; clearInterval(heartbeat); location.href = 'tower_defence.html?code=' + encodeURIComponent(code); }

  // students answer the chosen tasks on the usual question page; game-client.js there sends each correct answer
  function startStudentGame(lobby) {
    leavingForGame = true;
    var s = lobby.settings, m = s.math;
    SudGame.setSession({ code: lobby.code, role: 'player', mode: s.mode, minutes: s.minutes, startedAt: Date.now() });
    try { var saved = JSON.parse(localStorage.getItem('controller')); if (saved) controller = saved; } catch (e) {}
    controller.language = 'LT';
    controller.mode = 'math';
    controller.modeChoice1 = m.modeChoice1;
    controller.modeChoice2 = m.modeChoice2;
    controller.selectedNumbers = m.selectedNumbers;
    controller.withRemainder = m.withRemainder;
    controller.modeChoice3 = m.modeChoice3;
    controller.modeChoice5 = m.modeChoice5;
    controller.modeChoice6 = m.modeChoice6;
    controller.modeChoice7 = m.modeChoice7;
    controller.modeChoice8 = 'C79';
    controller.result = ['', '', '', '', ''];
    controller.task = null;
    controller.taskCompleted = false;
    controller.taskRecorded = false;
    controller.questionsStopped = false;
    // timed game: the task page counts down the game's time; until defeat: it shows the time played, with no
    // real task limit. game-client.js on the task page keeps either in step with the teacher's game clock.
    if (s.mode === 'timed') {
      controller.modeChoice4 = 'C39';
      timerInputElement.value = s.minutes;
      localStorage.setItem('controller', JSON.stringify(controller));
      startQuestionsTimer();
      localStorage.setItem('remainingTime', s.minutes * 60000);
    } else {
      controller.modeChoice4 = 'C40';
      questionNumberInputElement.value = 9999;
      localStorage.setItem('controller', JSON.stringify(controller));
      startQuestionsNumber();
    }
  }

  // ---------- wiring ----------
  var listen = function () {};
  function init() {
    // experimental section: only for approved tester teachers and their students (see the top of klase.html)
    if (!$('zaidimai') || !document.documentElement.classList.contains('experimental-on')) return;
    var s = SudGame.getSession();
    if (s && s.role === 'player') SudGame.clearSession();      // back on the class page: any earlier game is over

    // only teachers create games, so only they see the games to choose from; students just join
    $('zg-games-panel').hidden = !isTeacher;
    $('zg-refresh').onclick = refreshLobbies;
    $('zg-join-btn').onclick = function () { joinLobby($('zg-join-code').value); };
    $('zg-join-code').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 4); });
    $('zg-join-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') joinLobby(this.value); });
    $('zg-lobby-list').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-code]');
      if (!b || b.disabled) return;
      if (b.dataset.mine) reopenOwn(b.dataset.code); else joinLobby(b.dataset.code);
    });
    function updatePlayButton() {
      var blocked = isTeacher && !bigScreen();
      $('zg-play-td').disabled = blocked;
      $('zg-play-note').hidden = !blocked;
    }
    updatePlayButton();
    window.addEventListener('resize', updatePlayButton);
    $('zg-play-td').onclick = function () {
      if (isTeacher && !bigScreen()) return;
      show('zg-settings');
      $('zg-create').disabled = !isTeacher;
    };
    $('zg-settings-back').onclick = function () { show('zg-home'); };
    $('zg-mode').onchange = function () { $('zg-minutes-field').hidden = this.value !== 'timed'; };
    $('zg-create').onclick = createLobby;
    $('zg-actions').addEventListener('click', function (e) {
      var b = e.target.closest('button'), id = b && b.id;
      if (!id || !current) return;
      if (id === 'zg-start') {
        b.disabled = true;
        SudGame.request('lobby:start').then(function (r) {
          if (r && r.ok) return;
          if (r && (r.error === 'NOT_HOST' || r.error === 'NOT_FOUND')) exitLobby(ERR.NOT_FOUND); else { say(errText(r)); renderLobby(); }
        });
      } else if (id === 'zg-close' || id === 'zg-leave') leaveLobby();
      else if (id === 'zg-ready') {
        var mine = current.players.filter(function (p) { return String(p.id) === String(me.userId); })[0];
        SudGame.request('lobby:ready', { ready: !(mine && mine.ready) }).then(function (r) {
          if (r && !r.ok) exitLobby(r.error === 'NOT_FOUND' ? CLOSED_TEXT['host-gone'] : ERR.NOT_IN_LOBBY);
        });
      }
    });

    // server events are only listened to once the section is actually used (no connection for plain page visits)
    listen = function () {
    listen = function () {};
    SudGame.on('lobby:update', function (v) { if (current && v.code === current.code) { current = v; renderLobby(); } });
    SudGame.on('lobby:closed', function (d) {
      if (!current || d.code !== current.code || leavingForGame) return;
      exitLobby(isMine(current) && d.reason === 'host-left' ? null : (CLOSED_TEXT[d.reason] || 'Žaidimas uždarytas.'));
    });
    SudGame.on('game:start', function (v) {
      if (!current || v.code !== current.code) return;
      if (isMine(v)) goHost(v.code); else startStudentGame(v);
    });
    // after a dropped connection: re-attach to the lobby, or report that it was closed meanwhile
    SudGame.onReconnect(function () {
      if (!current) { if (sectionOpen()) refreshLobbies(); return; }
      var code = current.code;
      SudGame.request(isMine(current) ? 'game:host' : 'lobby:join', { code: code }).then(function (r) {
        if (!current || current.code !== code) return;
        if (r && r.ok) { current = r.lobby; renderLobby(); } else exitLobby('Ryšys nutrūko, o žaidimas per tą laiką buvo uždarytas.');
      });
    });
    };

    // leaving the Žaidimai section (another tab of this page) leaves / closes the lobby
    document.querySelectorAll('.nav-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.target === 'zaidimai') { if (!current) { show('zg-home'); refreshLobbies(); } return; }
        if (current) leaveLobby(true);
      });
    });
    // closing / reloading the page: tell the server right away (the heartbeat timeout is the fallback)
    window.addEventListener('pagehide', function () {
      if (current && !leavingForGame) SudGame.connect().then(function (sck) { sck.emit('lobby:leave', {}); });
    });

    // ?tab=zaidimai (coming back from a game) opens the section straight away
    if (new URLSearchParams(location.search).get('tab') === 'zaidimai') {
      window.addEventListener('load', function () { setTimeout(function () { var b = document.querySelector('.nav-item[data-target="zaidimai"]'); if (b) b.click(); }, 0); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
