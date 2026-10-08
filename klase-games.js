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
  var GAME_NAMES = { td: 'Tvirtovės gynyba', ghost: 'Vaiduoklis' };
  // who may host each game (the same rule as the game server): 'teacher', 'student' or 'both'
  var GAME_HOSTS = { td: 'teacher', ghost: 'both' };
  var GHOST_DICT = { easy: 'lengvas', medium: 'vidutinis', hard: 'sunkus', expert: 'ekspertas' };
  var GHOST_BOT = { easy: 'lengvas', normal: 'normalus', hard: 'sunkus' };
  var MODE_TEXT = { timed: 'Atlaikyti nustatytą laiką', endless: 'Atsilaikyti kuo ilgiau (vis stipresnės bangos)' };
  var DIFF_TEXT = { easy: 'lengvas', normal: 'vidutinis', hard: 'sunkus', extreme: 'labai sunkus' };
  var ERR = {
    NOT_FOUND: 'Šis žaidimas jau uždarytas. Sąrašas atnaujintas.', ALREADY_STARTED: 'Šis žaidimas jau prasidėjo.',
    FULL: 'Šis laukiamasis jau pilnas – jame nebėra vietų.', IS_HOST: 'Tai tavo sukurtas laukiamasis.', NOT_HOST: 'Šio žaidimo nebėra.',
    TEACHER_ONLY: 'Kol kas žaidimus kuria tik mokytojai.', NOT_READY: 'Ne visi mokiniai pasiruošę.',
    NO_PLAYERS: 'Dar niekas neprisijungė.', NOT_IN_LOBBY: 'Tu nebe šiame žaidime.', TIMEOUT: 'Žaidimų serveris neatsako. Bandykite dar kartą.',
    STUDENT_ONLY: 'Šį žaidimą kuria tik mokiniai.', NO_CLASS: 'Žaidimą gali kurti tik klasės nariai.',
    GROUP_TOO_SMALL: 'Grupėje vienas žaidėjas negali žaisti – pridėkite žaidėją arba botą.', BOTS_FULL: 'Grupėje gali būti ne daugiau kaip 4 botai.',
    GROUP_FULL: 'Ši grupė pilna.', TOO_MANY_GROUPS: 'Daugiau grupių sukurti negalima.', REMOVED: 'Tu buvai pašalintas iš šio žaidimo.', NO_GROUP: 'Tokios grupės nebėra.',
    SINGLE_GROUP: 'Šiame žaidime žaidžiama viena grupe.', LEFT: 'Tu jau išėjai iš šio žaidimo.', KICKED: 'Vedėjas pašalino tave iš žaidimo.',
    MAX_TOO_SMALL: 'Negalima nustatyti mažiau žaidėjų, nei kiek jau yra laukiamajame.'
  };
  var CLOSED_TEXT = {
    'host-left': 'Vedėjas baigė žaidimą.', 'host-gone': 'Žaidimas baigtas, nes vedėjas išėjo iš žaidimo puslapio.',
    expired: 'Žaidimas baigtas, nes per ilgai nebuvo pradėtas.', replaced: 'Vedėjas sukūrė naują žaidimą.'
  };

  // Lithuanian number agreement: 1 žaidėjas, 2 žaidėjai, 10 žaidėjų, 21 žaidėjas
  function plural(n, one, few, many) { var t = n % 10, h = n % 100; return n + ' ' + (t === 1 && h !== 11 ? one : t >= 2 && t <= 9 && (h < 12 || h > 19) ? few : many); }
  function say(msg, isError) { if (typeof messageToTheUser === 'function') messageToTheUser(msg, isError !== false); }   // the site's own message popup
  function errText(r) { return ERR[r && r.error] || 'Nepavyko. Bandykite dar kartą.'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function show(view) { ['zg-home', 'zg-settings', 'zg-ghost-settings', 'zg-lobby'].forEach(function (id) { $(id).hidden = id !== view; }); }
  // may this user host the game? (teacher-only games: not students; student-only games: not teachers)
  function canHost(game) { var h = GAME_HOSTS[game]; return h === 'both' || (h === 'teacher') === isTeacher; }
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
        var mine = isMine(l), back = l.status !== 'lobby' && l.inGame;
        var full = l.max && l.joined >= l.max && !l.inGame, open = l.status === 'lobby' && !full;
        // how many have joined (out of how many may: a student's game counts bots too; a teacher's is per group)
        var count = l.max ? l.joined + ' / ' + l.max + ' žaidėjų' : plural(l.joined != null ? l.joined : l.players, 'žaidėjas', 'žaidėjai', 'žaidėjų') + (l.perGroup ? ' · po ' + l.perGroup + ' grupėje' : '');
        return '<li class="zg-lobby-row"><div class="zg-code">' + esc(l.code) + '</div>' +
          '<div class="zg-lobby-info"><b>' + esc(GAME_NAMES[l.game] || l.game) + '</b><span>' + esc(l.hostName) +
          (l.hostIsTeacher ? ' <i class="zg-badge">Mokytojo</i>' : '') + (l.visibility === 'private' ? ' <i class="zg-badge">Privatus</i>' : '') + ' · ' + count + '</span></div>' +
          '<button class="zg-btn" type="button" data-code="' + esc(l.code) + '"' + (mine ? ' data-mine="1"' : '') +
          (open || mine || back ? '' : ' disabled') + '>' + (mine ? 'Atidaryti' : open ? 'Prisijungti' : back ? 'Grįžti į žaidimą' : full && l.status === 'lobby' ? 'Pilnas' : 'Vyksta') + '</button></li>';
      }).join('');
    }).catch(function () { btn.disabled = false; list.innerHTML = '<li class="zg-empty">Nepavyko prisijungti prie žaidimų serverio.</li>'; });
  }

  function joinLobby(code) {
    listen();
    code = String(code || '').trim();
    if (!/^\d{4}$/.test(code)) { say('Įrašykite 4 skaitmenų žaidimo numerį.'); return; }
    SudGame.request('lobby:join', { code: code }).then(function (r) {
      if (!r || !r.ok) {
        say(errText(r));
        if (r && (r.error === 'NOT_FOUND' || r.error === 'ALREADY_STARTED' || r.error === 'FULL')) refreshLobbies();
        return;
      }
      $('zg-join-code').value = '';
      // a game that has already started only lets its own players back in: straight to the game, no lobby
      if (r.lobby.status === 'playing') { if (r.lobby.game === 'ghost') goGhost(r.lobby.code); else startStudentGame(r.lobby); }
      else enterLobby(r.lobby);
    }).catch(function () { say('Nepavyko prisijungti prie žaidimų serverio. Bandykite dar kartą.'); });
  }

  // a host coming back to their own lobby (e.g. after reloading the page)
  function reopenOwn(code) {
    listen();
    SudGame.request('game:host', { code: code }).then(function (r) {
      if (!r || !r.ok) { say(ERR.NOT_FOUND); refreshLobbies(); return; }
      if (r.lobby.status === 'playing') { if (r.lobby.game === 'ghost') goGhost(code); else goHost(code); }
      else enterLobby(r.lobby);
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
    return { math: math, tasks: tasks, label: tasks[0] || '', difficulty: $('zg-difficulty').value, mode: $('zg-mode').value, minutes: Math.max(1, Math.min(60, Number($('zg-minutes').value) || 5)),
      visibility: $('zg-visibility').value };
  }

  function createLobby() {
    listen();
    var btn = $('zg-create');
    btn.disabled = true;
    SudGame.request('lobby:create', { game: 'td', settings: collectSettings() }).then(function (r) {
      btn.disabled = false;
      if (!r || !r.ok) { say(errText(r)); return; }
      enterLobby(r.lobby);
    }).catch(function () { btn.disabled = false; say('Nepavyko prisijungti prie žaidimų serverio. Bandykite dar kartą.'); });
  }

  // ---------- Vaiduoklis: settings, the board, a lobby ----------
  // the class's students, as this page already has them (Nariai)
  function classStudents() {
    try {
      var c = JSON.parse(localStorage.getItem('classDataCache')) || {};
      return (c.remainingStudents || []).map(function (x) { return { id: x.id, name: x.nickname || ('ID ' + x.id) }; });
    } catch (e) { return []; }
  }
  // how to play: a student alone with bots or with classmates; a teacher on the students' devices or on the board
  var ghostWay = null;
  function wayName(way) { return way === 'solo' ? 'Vienas su botais' : way === 'board' ? 'Lentoje' : isTeacher ? 'Individualiuose prietaisuose' : 'Su klasės draugais'; }
  function openGhostSettings() { show('zg-ghost-settings'); chooseWay(null); }
  function chooseWay(way) {
    ghostWay = way;
    $('zg-g-ways').hidden = !!way;
    $('zg-g-form').hidden = !way;
    $('zg-g-title').textContent = way ? 'Vaiduoklis · ' + wayName(way) : 'Vaiduoklis';
    $('zg-g-note').textContent = '';
    [].forEach.call($('zg-g-ways').querySelectorAll('[data-who]'), function (b) { b.hidden = (b.dataset.who === 'teacher') !== isTeacher; });
    if (!way) return;
    $('zg-g-game-box').hidden = way === 'multi';
    $('zg-g-board-box').hidden = way !== 'board';
    $('zg-g-multi-box').hidden = way !== 'multi';
    $('zg-g-form').classList.toggle('zg-one', way !== 'board');
    $('zg-g-solo-start').hidden = way !== 'solo';
    // bots: a game alone needs at least one; the board may have none
    var none = $('zg-g-bots').querySelector('option[value="0"]');
    none.hidden = none.disabled = way === 'solo';
    $('zg-g-bots').value = way === 'solo' ? '2' : '0';
    showBotToggle();
    // a teacher's game: players per group (more groups open as students join); a student's: players in the game; bots
    // count in both
    $('zg-g-max-label').textContent = isTeacher ? 'Maksimalus žaidėjų skaičius grupėje (su botais)' : 'Maksimalus žaidėjų skaičius (su botais)';
    if (way === 'board') buildBoardList();
  }
  // the board's class list (built once it is known; until then a note, and it is tried again next time)
  function buildBoardList() {
    if (!$('zg-g-students').querySelector('input')) {
      var list = classStudents();
      $('zg-g-students').innerHTML = list.length ? list.map(function (st) {
        return '<li><label><input type="checkbox" value="' + esc(st.id) + '" data-name="' + esc(st.name) + '" checked><span>' + esc(st.name) + '</span></label></li>';
      }).join('') : '<li class="zg-empty">Klasės mokinių sąrašas dar kraunamas arba klasėje nėra mokinių. Pabandykite po akimirkos.</li>';
    }
    countBoard();
  }
  // the count, and the "Visi" tickbox: ticked when everyone is, half when some are
  function countBoard() {
    var all = $('zg-g-students').querySelectorAll('input').length, n = $('zg-g-students').querySelectorAll('input:checked').length;
    $('zg-g-count').textContent = 'Pasirinkta: ' + n + (all ? ' iš ' + all : '');
    $('zg-g-all').checked = all > 0 && n === all;
    $('zg-g-all').indeterminate = n > 0 && n < all;
  }
  // "Botų nustatymai": a short summary of the choice on the button; no bots, no button
  function botSummary(dict, bot) { return 'Žodynas: ' + (GHOST_DICT[dict] || '') + ' · lygis: ' + (GHOST_BOT[bot] || ''); }
  function showBotToggle() {
    var box = $('zg-g-game-box'), t = box.querySelector('.zg-g-toggle'), none = $('zg-g-bots').value === '0';
    t.hidden = none;
    if (none) { t.setAttribute('aria-expanded', 'false'); t.nextElementSibling.hidden = true; }
    t.querySelector('.zg-g-sum').textContent = botSummary($('zg-g-dict').value, $('zg-g-bot').value);
  }
  function gameSettings() {
    return { dict: $('zg-g-dict').value, bot: $('zg-g-bot').value, lives: $('zg-g-lives').value, time: $('zg-g-time').value, bots: $('zg-g-bots').value };
  }
  // one player with bots: played on the game's page, nothing on the game server
  function startSolo() {
    sessionStorage.setItem('ghostSolo', JSON.stringify(gameSettings()));
    leavingForGame = true;
    location.href = 'vaiduoklio_zodziu_zaidimas.html?solo=1';
  }
  // the whole game runs on this screen; the chosen students take turns at the board
  function startBoardGame() {
    var set = gameSettings(), note = $('zg-g-note');
    var students = [].slice.call($('zg-g-students').querySelectorAll('input:checked')).map(function (c) { return { id: c.value, name: c.dataset.name }; });
    var bots = Number(set.bots) || 0;
    if (!students.length) { note.textContent = 'Pasirinkite bent vieną mokinį.'; return; }
    if (students.length + bots < 2) { note.textContent = 'Reikia bent dviejų žaidėjų – pasirinkite dar vieną mokinį arba pridėkite botą.'; return; }
    sessionStorage.setItem('ghostBoard', JSON.stringify({ students: students, settings: set }));
    leavingForGame = true;
    location.href = 'vaiduoklio_zodziu_zaidimas.html?board=1';
  }
  // a game with others: its size and visibility now, the rest in the lobby
  function createGhost() {
    listen();
    var btn = $('zg-g-create');
    btn.disabled = true;
    SudGame.request('lobby:create', { game: 'ghost', settings: { max: $('zg-g-max').value, visibility: $('zg-g-visibility').value } }).then(function (r) {
      btn.disabled = false;
      if (!r || !r.ok) { say(errText(r)); return; }
      enterLobby(r.lobby);
    }).catch(function () { btn.disabled = false; say('Nepavyko prisijungti prie žaidimų serverio. Bandykite dar kartą.'); });
  }

  // the lobby's settings form (the host of a ghost game): shows the lobby's settings; a change goes to the server at once
  // (the visibility is only shown: it is chosen when the lobby is created)
  function renderLobbyForm(l, force) {
    $('zg-l-max-label').textContent = l.single ? 'Maksimalus žaidėjų skaičius (su botais)' : 'Maksimalus žaidėjų skaičius grupėje (su botais)';
    $('zg-l-visibility').value = l.settings.visibility === 'private' ? 'private' : 'public';
    [].forEach.call($('zg-l-form').querySelectorAll('[data-key]'), function (el) {
      if (force || document.activeElement !== el) el.value = String(l.settings[el.dataset.key]);
    });
    $('zg-l-form').querySelector('.zg-g-sum').textContent = botSummary(l.settings.dict, l.settings.bot);
  }
  function changeLobbySetting(e) {
    var el = e.target.closest('[data-key]');
    if (!el || !current) return;
    var o = {};
    o[el.dataset.key] = el.value;
    SudGame.request('lobby:settings', { settings: o }).then(function (r) {
      if (r && r.ok) return;
      say(errText(r));
      if (current) renderLobbyForm(current, true);
    });
  }

  // the groups of a ghost lobby (who plays with whom): everyone moves themselves, the host anyone and the bots
  function renderGroups(l) {
    var host = isMine(l), byId = {};
    l.players.forEach(function (p) { byId[p.id] = p; });
    GhostGroups.render($('zg-groups'), {
      single: !!l.single, max: l.single ? l.settings.max : 0, maxPeople: l.single ? 0 : l.settings.max, host: host,
      groups: l.groups.map(function (g) {
        return { id: String(g.id), members: g.members.map(function (id) {
          var p = byId[id] || { name: 'ID ' + id }, mine = String(id) === String(me.userId);
          return { id: String(id), name: p.name, avatar: avatarOf(id), me: mine, off: p.connected === false, ready: !!p.ready && p.connected !== false };
        }).concat(g.bots.map(function (b) { return { id: b.id, name: b.name, av: b.av, bot: true }; })) };
      }),
      maxBots: 4,
      canMove: function (m) { return !l.single && (host || m.me); },
      canAddGroup: !l.single, canAddBot: host,
      onMove: function (who, to) { groupOp('ghost:move', { who: /^b\d+$/.test(who) ? who : Number(who), to: Number(to) }); },
      onAddGroup: function () { groupOp('ghost:group:add'); },
      onAddBot: function (to) { groupOp('ghost:bot:add', { to: Number(to) }); },
      onRemove: function (id) { groupOp('ghost:bot:remove', { id: id }); },
      onKick: function (id) { kick(id); }
    });
  }
  // a student's game is one group: its people and bots as cards; the host adds bots (up to the size, at most 4) and
  // removes them
  function botCards(l) {
    var g = l.groups[0], host = isMine(l), max = l.settings.max, full = g.members.length + g.bots.length >= max;
    var cards = g.bots.map(function (b) {
      return '<li class="member-card zg-player zg-bot ready"><div class="member-avatar-outer-div"><div class="member-avatar"><div class="zg-bot-av">' + esc(b.av) + '</div></div></div>' +
        '<div class="member-name"><span class="students-name">' + esc(String(b.name).toUpperCase()) + '</span><span class="students-id zg-state">botas</span></div>' +
        (host ? '<button class="zg-bot-x" type="button" data-rmbot="' + esc(b.id) + '" title="Pašalinti botą" aria-label="Pašalinti botą">✕</button>' : '') + '</li>';
    }).join('');
    if (host) cards += '<li><button class="zg-add-bot" type="button" data-addbot="' + esc(g.id) + '"' + (full || g.bots.length >= 4 ? ' disabled' : '') + '>🤖 + Botas</button></li>';
    return cards;
  }
  // the host removes a student from the lobby (asked first)
  function kick(id) {
    var p = current && current.players.filter(function (x) { return String(x.id) === String(id); })[0];
    if (!p) return;
    var go = function () { groupOp('lobby:kick', { who: Number(id) }); };
    if (typeof showCustomConfirm === 'function') showCustomConfirm('Pašalinti ' + p.name + ' iš žaidimo? Prie jo prisijungti nebegalės.', go); else go();
  }
  function groupOp(ev, data) {
    SudGame.request(ev, data || {}).then(function (r) { if (r && !r.ok) say(errText(r)); });
  }

  // ---------- "Kaip žaisti?": a game's rules in a pop-up ----------
  function openRules(game) {
    if ($('zg-rules').parentNode !== document.body) document.body.appendChild($('zg-rules'));   // above everything on the page
    [].forEach.call($('zg-rules').querySelectorAll('[data-game]'), function (el) { el.hidden = el.dataset.game !== game; });
    $('zg-rules').hidden = false;
    $('zg-rules').querySelector('[data-rules-close]').focus();
  }
  function closeRules() { $('zg-rules').hidden = true; }

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
    var tasks, editable = l.game === 'ghost' && host;
    $('zg-task-label').textContent = l.game === 'ghost' ? 'NUSTATYMAI' : 'UŽDUOTIS';
    $('zg-task-list').hidden = editable;
    $('zg-l-form').hidden = !editable;
    if (editable) renderLobbyForm(l);
    if (l.game === 'ghost') {
      tasks = ['Botų žodynas: ' + (GHOST_DICT[s.dict] || ''), 'Botų lygis: ' + (GHOST_BOT[s.bot] || ''), 'Gyvybės: ' + s.lives,
        l.single ? 'Žaidėjų: iki ' + s.max + ' (su botais)' : 'Grupėje: iki ' + s.max + ' žaidėjų (su botais)',
        'Laikas ėjimui: ' + (s.time ? (s.time === 60 ? '1 min' : s.time + ' s') : 'neribotas')];
    } else {
      tasks = (s.tasks && s.tasks.length ? s.tasks : (s.label ? [s.label] : [])).slice();
      tasks.push(MODE_TEXT[s.mode] + (s.mode === 'timed' ? ': ' + s.minutes + ' min.' : ''));
      tasks.push('Sunkumas: ' + (DIFF_TEXT[s.difficulty] || ''));
    }
    if (s.visibility === 'private') tasks.push('Privatus žaidimas – prisijungiama tik su numeriu');
    $('zg-task-list').innerHTML = tasks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    var grouped = l.game === 'ghost' && !l.single;
    $('zg-players-label').textContent = l.game !== 'ghost' ? 'PRISIJUNGĘ MOKINIAI (' + players.length + ')'
      : l.single ? 'ŽAIDĖJAI · ' + (l.groups[0].members.length + l.groups[0].bots.length) + ' / ' + s.max
      : 'GRUPĖS · ' + plural(players.length, 'mokinys', 'mokiniai', 'mokinių').toUpperCase() + ' · PO ' + s.max + ' GRUPĖJE';
    $('zg-groups').hidden = !grouped;
    $('zg-players').hidden = grouped;
    if (grouped) renderGroups(l);
    // the same member cards as in "Nariai": avatar, name, and the ready state underneath
    var kickable = l.game === 'ghost' && l.single && host;
    $('zg-players').innerHTML = players.length ? players.map(function (p) {
      var isMe = String(p.id) === String(me.userId), svg = avatarOf(p.id);
      return '<li class="member-card zg-player' + (p.ready ? ' ready' : '') + (p.connected ? '' : ' off') + (isMe ? ' member-card-requesting' : '') + '">' +
        (kickable && !isMe ? '<button class="zg-bot-x" type="button" data-kick="' + esc(p.id) + '" title="Pašalinti iš žaidimo" aria-label="Pašalinti iš žaidimo">✕</button>' : '') +
        '<div class="member-avatar-outer-div"><div class="member-avatar">' + (svg || '<div class="avatar-fallback-circle"></div>') + '</div>' +
        (isMe ? '<div class="is-you-div">AŠ</div>' : '') + (p.ready && p.connected ? '<div class="zg-ready-mark">✓</div>' : '') + '</div>' +
        '<div class="member-name"><span class="students-name">' + esc(String(p.name || '').toUpperCase()) + '</span>' +
        '<span class="students-id zg-state">' + (!p.connected ? 'atsijungė' : p.ready ? 'pasiruošęs' : 'ruošiasi…') + '</span></div></li>';
    }).join('') : '<li class="zg-empty">Laukiama žaidėjų. Jie gali prisijungti iš savo klasės puslapio arba įvedę numerį ' + esc(l.code) + '.</li>';
    if (l.game === 'ghost' && l.single) $('zg-players').innerHTML += botCards(l);

    var actions = $('zg-actions'), note = $('zg-action-note'), online = players.filter(function (p) { return p.connected; });
    if (host) {
      var allReady = online.length > 0 && online.every(function (p) { return p.ready; });
      actions.innerHTML = '<button class="zg-btn zg-btn-green" type="button" id="zg-start"' + (allReady ? '' : ' disabled') + '>Pradėti žaidimą</button>' +
        '<button class="zg-btn zg-btn-red" type="button" id="zg-close">Uždaryti</button>';
      note.textContent = !online.length ? 'Laukiama žaidėjų.' : allReady ? 'Visi pasiruošę – galite pradėti!' : 'Laukiama, kol visi paspaus „Pasiruošęs“.';
    } else {
      var mine = players.filter(function (p) { return String(p.id) === String(me.userId); })[0];
      var ready = !!(mine && mine.ready);
      actions.innerHTML = '<button class="zg-btn' + (ready ? ' zg-btn-green' : '') + '" type="button" id="zg-ready">' + (ready ? '✓ Pasiruošęs' : 'Pasiruošęs!') + '</button>' +
        '<button class="zg-btn zg-btn-red" type="button" id="zg-leave">Išeiti</button>';
      note.textContent = ready ? 'Laukiama, kol vedėjas pradės žaidimą.' : 'Paspauskite „Pasiruošęs“, kai būsite pasiruošę.';
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
  // a ghost game is played (and the teacher watches it) on the game's own page
  function goGhost(code) { leavingForGame = true; clearInterval(heartbeat); location.href = 'vaiduoklio_zodziu_zaidimas.html?code=' + encodeURIComponent(code); }

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

    // every game is shown; its create button only works for those who may host it (with the reason underneath)
    $('zg-games-panel').hidden = false;
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
      var small = isTeacher && !bigScreen(), notHost = !canHost('td');
      $('zg-play-td').disabled = small || notHost;
      $('zg-play-note').hidden = !small;
      $('zg-td-host-note').hidden = !notHost;
      $('zg-play-ghost').disabled = !canHost('ghost');
    }
    updatePlayButton();
    window.addEventListener('resize', updatePlayButton);
    $('zg-play-ghost').onclick = function () { if (canHost('ghost')) openGhostSettings(); };
    // "?" (Kaip žaisti?): the game's rules, before starting it
    document.querySelectorAll('#zaidimai [data-rules]').forEach(function (b) { b.addEventListener('click', function () { openRules(b.dataset.rules); }); });
    $('zg-rules').addEventListener('click', function (e) { if (e.target.id === 'zg-rules' || e.target.closest('[data-rules-close]')) closeRules(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('zg-rules').hidden) closeRules(); });
    $('zg-ghost-back').onclick = function () { if (ghostWay) chooseWay(null); else show('zg-home'); };
    $('zg-g-ways').addEventListener('click', function (e) { var b = e.target.closest('[data-way]'); if (b) chooseWay(b.dataset.way); });
    // "Botų nustatymai": opens / closes the bot settings under it
    document.querySelectorAll('#zaidimai .zg-g-toggle').forEach(function (t) {
      t.addEventListener('click', function () {
        var open = t.getAttribute('aria-expanded') !== 'true';
        t.setAttribute('aria-expanded', String(open));
        t.nextElementSibling.hidden = !open;
      });
    });
    $('zg-l-form').addEventListener('change', changeLobbySetting);
    $('zg-players').addEventListener('click', function (e) {
      var add = e.target.closest('[data-addbot]'), rm = e.target.closest('[data-rmbot]');
      if (add && !add.disabled) groupOp('ghost:bot:add', { to: Number(add.dataset.addbot) });
      if (rm) groupOp('ghost:bot:remove', { id: rm.dataset.rmbot });
      var k = e.target.closest('[data-kick]');
      if (k) kick(k.dataset.kick);
    });
    $('zg-g-game-box').addEventListener('change', function (e) { if (/^zg-g-(bots|dict|bot)$/.test(e.target.id)) showBotToggle(); });
    $('zg-g-solo-start').onclick = startSolo;
    $('zg-g-board-start').onclick = startBoardGame;
    $('zg-g-students').addEventListener('change', countBoard);
    $('zg-g-all').onchange = function () { var on = this.checked; $('zg-g-students').querySelectorAll('input').forEach(function (c) { c.checked = on; }); countBoard(); };
    $('zg-g-create').onclick = createGhost;
    $('zg-play-td').onclick = function () {
      if (!canHost('td') || (isTeacher && !bigScreen())) return;
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
    SudGame.on('lobby:kicked', function (d) { if (current && d.code === current.code) exitLobby(ERR.KICKED); });
    SudGame.on('lobby:closed', function (d) {
      if (!current || d.code !== current.code || leavingForGame) return;
      exitLobby(isMine(current) && d.reason === 'host-left' ? null : (CLOSED_TEXT[d.reason] || 'Žaidimas uždarytas.'));
    });
    SudGame.on('game:start', function (v) {
      if (!current || v.code !== current.code) return;
      if (v.game === 'ghost') goGhost(v.code);
      else if (isMine(v)) goHost(v.code); else startStudentGame(v);
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
