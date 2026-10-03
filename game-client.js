// game-client.js - real-time class games (Socket.IO) shared by klase.html, tower_defence.html and veiksmai.html.
// Needs refresh-token.js (apiBase, refreshAccessToken) to be loaded first.
(function () {
  'use strict';
  var SOCKET_IO_CDN = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
  var socket = null, connecting = null, reconnectFns = [];
  // run fn(socket) whenever the shared connection comes back after dropping (doesn't open a connection itself)
  function onReconnect(fn) { reconnectFns.push(fn); }

  function token() {
    try { return (JSON.parse(localStorage.getItem('userData')) || {}).token || ''; } catch (e) { return ''; }
  }

  function loadScript(src) {
    return new Promise(function (res, rej) {
      if (window.io) return res();
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error('SOCKET_LIB')); };
      document.head.appendChild(s);
    });
  }

  // one shared connection per page; an expired login token is refreshed once and the connection retried
  function connect() {
    if (socket && socket.connected) return Promise.resolve(socket);
    if (connecting) return connecting;
    // already created but between automatic reconnect attempts: wait for it instead of opening a second connection
    if (socket && socket.active) return new Promise(function (res, rej) {
      var t = setTimeout(function () { socket.off('connect', done); rej(new Error('TIMEOUT')); }, 10000);
      function done() { clearTimeout(t); res(socket); }
      socket.once('connect', done);
    });
    connecting = loadScript(SOCKET_IO_CDN).then(function () {
      return new Promise(function (res, rej) {
        var refreshed = false;
        socket = window.io(apiBase, { auth: function (cb) { cb({ token: token() }); }, transports: ['websocket', 'polling'] });
        socket.on('connect', function () { res(socket); });
        socket.io.on('reconnect', function () { reconnectFns.forEach(function (fn) { try { fn(socket); } catch (e) {} }); });
        socket.on('connect_error', function (err) {
          if (!refreshed && /AUTH_EXPIRED|AUTH_REVOKED/.test(err.message) && typeof refreshAccessToken === 'function') {
            refreshed = true;
            refreshAccessToken().then(function (okay) { if (okay) socket.connect(); else rej(err); });
          } else if (!socket.connected && !socket.active) rej(err);
        });
      });
    }).finally(function () { connecting = null; });
    // never leave a caller (and its disabled button) waiting forever, e.g. while the server is restarting
    var pending = connecting;
    return Promise.race([pending, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('TIMEOUT')); }, 12000); })]);
  }

  // emit with an acknowledgement, as a promise: resolves with the server's reply ({ok, ...})
  function request(event, data, timeoutMs) {
    return connect().then(function (s) {
      return new Promise(function (res) {
        s.timeout(timeoutMs || 8000).emit(event, data || {}, function (err, reply) {
          res(err ? { ok: false, error: 'TIMEOUT' } : reply);
        });
      });
    });
  }

  function on(event, fn) { return connect().then(function (s) { s.on(event, fn); }); }

  // ---------- the student's side of a running game (on the question page) ----------
  var SESSION_KEY = 'gameSession';
  function getSession() {
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY));
      return s && Date.now() - s.startedAt < 4 * 60 * 60 * 1000 ? s : null;
    } catch (e) { return null; }
  }
  function setSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  var STREAK_GOAL = 10;

  function studentGame(session) {
    // end screen in the site's own popup style (index.css: object-popup-*), with the site's button look
    var css = document.createElement('style');
    css.textContent =
      // students can't stop a class game on their own (the teacher ends it; "Grįžti" still leads back to the class)
      '#stopButton{display:none!important}' +
      '.sg-end-panel{text-align:center;width:420px}.sg-end-panel .object-popup-title{width:100%}' +
      '.sg-end-panel .object-popup-content{overflow:visible;margin:10px 0 18px}' +
      '.sg-end-btn{position:relative;background:linear-gradient(135deg,#3288AC,#286D8A);border:none;color:#F5F5F7;padding:12px 18px;border-radius:20px;cursor:pointer;font:inherit;font-size:1rem;align-self:center}';
    document.head.appendChild(css);

    // a touch of the game on the question panel (row tasks only)
    gameScene();

    // game answers are not practice results: the task page must not write them to the student's long-term archive
    // (it would when its own countdown reaches zero just before the game's end arrives)
    if (typeof recordTaskToLongTerm === 'function') window.recordTaskToLongTerm = function () { return Promise.resolve(); };

    // "Grįžti" during a game goes back to the games section (the page's own back button would open Klasė's first section)
    window.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('#desktopBackBtn, #mobileBackBtn')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      location.href = 'klase.html?tab=zaidimai';
    }, true);

    var streak = 0, ended = false;
    function showEnd(result, reason) {
      if (ended) return;
      ended = true;
      clearSession();
      clearInterval(watch);
      if (typeof controller !== 'undefined') controller.questionsStopped = true;
      if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);   // the game is over: the clock stops too
      var title = result === 'win' ? 'Pergalė!' : result === 'lose' ? 'Kaimas krito…' : 'Žaidimas baigtas';
      var text = result === 'win' ? 'Klasė apgynė kaimą. Puikiai padirbėjote!' : result === 'lose' ? 'Šį kartą priešai buvo stipresni. Pabandykite dar kartą!' :
        reason === 'gone' ? 'Šis žaidimas jau nebevyksta.' : reason === 'host-gone' ? 'Žaidimas nutrauktas, nes vedėjo žaidimo langas užsidarė.' : 'Mokytojas sustabdė žaidimą.';
      var box = document.createElement('div');
      box.className = 'object-popup-overlay';
      box.innerHTML = '<div class="object-popup-panel sg-end-panel"><div class="object-popup-title">' + title + '</div>' +
        '<div class="object-popup-content">' + text + '</div><button type="button" class="sg-end-btn">Grįžti į klasę</button></div>';
      box.querySelector('button').onclick = function () { location.href = 'klase.html?tab=zaidimai'; };
      document.body.appendChild(box);
    }

    // the timer follows the teacher's game: time left (timed game) or time played (until defeat). Applied only once
    // the task page has started its own timer, so there is never a second one running.
    var pendingClock = null;
    function applyClock(c) {
      if (!c || ended || typeof controller === 'undefined' || controller.taskCompleted) return;
      if (document.readyState !== 'complete') { pendingClock = c; return; }
      if (session.mode === 'timed' && c.remainingMs != null) {
        var cur = parseInt(localStorage.getItem('remainingTime'), 10);
        if (c.remainingMs > 0 && !(Math.abs(cur - c.remainingMs) < 1500)) {
          clearInterval(timerInterval);
          localStorage.setItem('remainingTime', c.remainingMs + 1000);      // countDown() takes one second off at once
          countDown();
        }
      } else if (session.mode === 'endless' && c.elapsedMs != null) {
        var st = parseInt(localStorage.getItem('startTime'), 10), want = Date.now() - c.elapsedMs;
        if (!(Math.abs(st - want) < 1500)) { clearInterval(timerInterval); localStorage.setItem('startTime', want); startTimer(); }
      }
    }
    window.addEventListener('load', function () { setTimeout(function () { var c = pendingClock; pendingClock = null; applyClock(c); }, 50); });

    // until-defeat games run on the page's "number of tasks" mode with no real limit: show "Atlikai: 12", not "12/9999"
    if (session.mode === 'endless') {
      var tracker = document.getElementById('answer-tracker');
      if (tracker) {
        var fix = function () { var t = tracker.textContent, n = t.replace(/\s*\/\s*\d+\s*$/, ''); if (n !== t) tracker.textContent = n; };
        new MutationObserver(fix).observe(tracker, { childList: true, characterData: true, subtree: true });
        fix();
      }
    }

    // watch the task page's own answer counters: every new correct answer is a shot, every mistake resets the streak
    var lastCorrect = null, lastMistakes = null, socketReady = null;
    var watch = setInterval(function () {
      if (typeof controller === 'undefined') return;
      var c = controller.correctAnswersTracker || 0, m = controller.mistakesTracker || 0;
      if (lastCorrect === null) { lastCorrect = c; lastMistakes = m; return; }
      if (m > lastMistakes) streak = 0;
      for (var k = lastCorrect; k < c; k++) {
        if (socketReady) socketReady.then(function (s) { s.emit('game:hit'); });
        if (++streak >= STREAK_GOAL) {
          streak = 0;
          if (socketReady) socketReady.then(function (s) { s.emit('game:upgrade'); });
        }
      }
      lastCorrect = c; lastMistakes = m;
    }, 150);

    socketReady = request('game:rejoin', { code: session.code }).then(function (reply) {
      if (!reply || !reply.ok) { showEnd('stopped', 'gone'); throw new Error('gone'); }
      applyClock(reply.clock);
      return connect();
    });
    socketReady.catch(function () {});
    on('game:end', function (d) { showEnd(d && d.result, d && d.reason); });
    on('lobby:closed', function (d) { showEnd('stopped', d && d.reason); });
    on('game:clock', applyClock);
    // after a dropped connection, tell the server again which game this student is in (or end if it is gone)
    onReconnect(function (s) {
      if (ended) return;
      s.emit('game:rejoin', { code: session.code }, function (r) { if (!r || !r.ok) showEnd('stopped', 'gone'); else applyClock(r.clock); });
    });
  }

  // ---------- the game's look on the task page: a strip of the game field below the equation (row tasks only) ----------
  var FIELDS = '../images/tower-defence-game/themes/fields/background/';
  function pic(src) { var im = new Image(); im.src = src; return im; }

  // Below the equation the question panel turns into the game's grass with trees, bushes and stones, fading in from the
  // equation row; everything above it stays as it is. Only for tasks in a row (eilute): column tasks (stulpeliu / kampu)
  // keep the plain panel. The field lies behind the task (z-index -1), takes no clicks and its top edge only moves down,
  // so it doesn't jump between questions.
  var GRASS_TILE = 38, TS = 32, FADE = 44;
  var BORDER = ['Decor/Tree1', 'Decor/Tree1', 'Bush/1', 'Bush/2', 'Bush/3', 'Bush/4', 'Bush/5', 'Bush/6'];
  var CAMP = ['Decor/Log1', 'Decor/Log3'];
  var PROPS = ['Stone/9', 'Stone/10', 'Stone/12', 'Stone/14', 'Bush/2', 'Bush/5', 'Decor/Tree2'];
  var SMALL = ['Grass/1', 'Grass/2', 'Grass/3', 'Grass/4', 'Grass/5', 'Grass/6', 'Flower/1', 'Flower/3', 'Flower/5', 'Flower/7', 'Flower/9', 'Flower/12', 'Stone/3'];
  var OBJDIR = { Stone: '4 Stone', Grass: '5 Grass', Flower: '6 Flower', Decor: '7 Decor', Bush: '9 Bush' };
  function objPic(name) { return pic(FIELDS + '2 Objects/' + name.replace(/^(\w+)\//, function (m, d) { return OBJDIR[d] + '/'; }) + '.png'); }

  function gameScene() {
    var line = document.getElementById('middle-line');
    if (!line) return;
    var st = document.createElement('style');
    st.textContent =
      // the panel keeps its glass; the field is painted on top of the glass and under the task
      '#middle-line.sg-on{isolation:isolate}' +
      '.sg-field{position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none;z-index:-1}' +
      '.sg-layer{position:absolute;inset:0}.sg-ground{position:absolute;left:0;top:0;image-rendering:pixelated}' +
      '.sg-fire{position:absolute;background-repeat:no-repeat;image-rendering:pixelated}';
    document.head.appendChild(st);
    var box = document.createElement('div'), ground = document.createElement('canvas'), smoke = document.createElement('div'), fire = document.createElement('div');
    box.className = 'sg-field'; box.hidden = true;
    box.setAttribute('aria-hidden', 'true');
    ground.className = 'sg-ground';
    // grass, props and the fire share one layer, so the fade towards the task applies to all of them (smoke included)
    var layer = document.createElement('div');
    layer.className = 'sg-layer';
    box.appendChild(layer);
    layer.appendChild(ground);
    // an animated campfire (6-frame sheets: fire 32x32, smoke 32x64 drawn above it)
    smoke.className = fire.className = 'sg-fire';
    smoke.style.backgroundImage = 'url("' + FIELDS + '3 Animated Objects/2 Campfire/1.png")';
    fire.style.backgroundImage = 'url("' + FIELDS + '3 Animated Objects/2 Campfire/2.png")';
    layer.appendChild(smoke); layer.appendChild(fire);
    line.insertBefore(box, line.firstChild);

    var tileset = pic(FIELDS + '1 Tiles/FieldsTileset.png'), objs = {};
    BORDER.concat(CAMP, PROPS, SMALL).forEach(function (n) { if (!objs[n]) objs[n] = objPic(n); });
    function ready(im) { return im && im.complete && im.naturalWidth; }
    function hits(a, b) { return a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t; }

    // the top and bottom of the visible task (text and answer field), relative to the panel
    function taskExtent() {
      var lr = line.getBoundingClientRect(), t = null, b = null, list = line.querySelectorAll('#middle-line-inner *');
      for (var i = 0; i < list.length; i++) {
        var e = list[i];
        if (e.id === 'hidden-input') continue;
        if (!/^(INPUT|TEXTAREA)$/.test(e.tagName) && (e.children.length || !e.textContent.trim())) continue;
        var r = e.getBoundingClientRect();
        if (r.width && r.height && getComputedStyle(e).visibility !== 'hidden') { t = Math.min(t == null ? 1e9 : t, r.top - lr.top); b = Math.max(b || 0, r.bottom - lr.top); }
      }
      return b == null ? null : { t: t, b: b };
    }

    // the task is lifted (padding at the bottom of the panel) so it sits in the middle of the plain part above the field
    var pad = 0;
    function setPad(p) { p = Math.max(0, Math.round(p)); if (p !== pad) { pad = p; line.style.paddingBottom = p ? p + 'px' : ''; } }

    var P = 2, W = 0, H = 0, top = null, topFor = '', last = '', seed0 = Math.floor(Math.random() * 1e6);
    function fit() {
      var lr = line.getBoundingClientRect(), rows = typeof controller !== 'undefined' && controller.modeChoice7 !== 'C48';
      var on = rows && lr.width > 0 && lr.height > 0;
      box.hidden = !on;
      line.classList.toggle('sg-on', on);
      if (!on) { setPad(0); return; }
      // measured as if the task weren't lifted (the padding moves it up by half its size)
      var size = Math.round(lr.width) + 'x' + Math.round(lr.height), ext = taskExtent(), mid0 = ext && (ext.t + ext.b) / 2 + pad / 2;
      if (topFor !== size) { top = null; topFor = size; }
      if (ext) top = Math.max(top || 0, Math.min(lr.height - 24, ext.b + pad / 2 + 36));   // the field starts a little below the task
      // too little room below the task (small screens, an open on-screen keyboard): no field until there is room again
      if (top == null || lr.height - top < 60) { box.hidden = true; line.classList.remove('sg-on'); last = ''; setPad(0); return; }
      // centre the task (by eye) between the previous answer above it (or the panel's top) and where the grass is fully in
      var prev = line.querySelector('.previous-equation'), pr = null;
      if (prev && prev.textContent.trim() && prev.offsetParent) { var rg = document.createRange(); rg.selectNodeContents(prev); pr = rg.getBoundingClientRect(); }
      var from = pr && pr.height ? pr.bottom - lr.top : 0, to = top + FADE, stopped = typeof controller !== 'undefined' && controller.questionsStopped;
      setPad(stopped || mid0 == null ? 0 : Math.min(lr.height - top, 2 * (mid0 - (from + to) / 2)));
      var key = size + ',' + Math.round(top);
      if (key === last) return;
      last = key;
      P = Math.min(lr.width, lr.height) < 330 ? 1.5 : 2;
      W = Math.ceil(lr.width / P); H = Math.ceil(lr.height / P);
      layer.style.webkitMaskImage = layer.style.maskImage = 'linear-gradient(to bottom,transparent ' + top + 'px,#000 ' + (top + FADE) + 'px)';
      draw(top / P);
    }

    function draw(fieldTop) {
      ground.width = W; ground.height = H;
      ground.style.width = W * P + 'px'; ground.style.height = H * P + 'px';
      var g = ground.getContext('2d'), seed = seed0;
      function rr() { seed = (seed * 16807 + 11) % 2147483647; return seed / 2147483647; }
      g.imageSmoothingEnabled = false;
      if (!ready(tileset)) return;
      var t = GRASS_TILE - 1, y, x;
      for (y = 0; y < H; y += TS) for (x = 0; x < W; x += TS) g.drawImage(tileset, (t % 8) * TS, Math.floor(t / 8) * TS, TS, TS, x, y, TS, TS);
      // props only where the grass is fully there (below the fade)
      var taken = [{ l: -999, t: -999, r: W + 999, b: fieldTop + FADE / P }];
      // the campfire first, a bit right of the middle, with a log beside it; if the field is too low for it, no fire
      var fx = Math.round(W * .62), fy = Math.round(Math.max(fieldTop + FADE / P * .4, H - 56)), campOk = fy + 32 <= H - 4;
      [smoke, fire].forEach(function (e) { e.hidden = !campOk; });
      if (campOk) {
        fire.style.left = smoke.style.left = fx * P + 'px';
        fire.style.top = fy * P + 'px'; smoke.style.top = (fy - 32) * P + 'px';
        fire.style.width = smoke.style.width = 32 * P + 'px'; fire.style.height = 32 * P + 'px'; smoke.style.height = 64 * P + 'px';
        fire.style.backgroundSize = smoke.style.backgroundSize = 192 * P + 'px auto';
        taken.push({ l: fx - 6, t: fy - 24, r: fx + 38, b: fy + 34 });
      }
      function put(name, x, y, edge) {
        var im = objs[name];
        if (!ready(im)) return false;
        var r = { l: x, t: y, r: x + im.naturalWidth, b: y + im.naturalHeight };
        if (!edge && (r.l < 2 || r.r > W - 2 || r.b > H - 2)) return false;
        if (taken.some(function (k) { return hits(r, k); })) return false;
        g.drawImage(im, Math.round(x), Math.round(y));
        taken.push(edge ? { l: r.l + 10, t: r.t + 10, r: r.r - 10, b: r.b - 10 } : r);
        return true;
      }
      if (campOk) put('Decor/Log1', fx + 34, fy + 12) || put('Decor/Log3', fx - 46, fy + 18);
      // trees and bushes along the bottom and the lower sides, partly outside the panel
      for (y = fieldTop; y < H + 20; y += 34 + rr() * 22) { put(BORDER[Math.floor(rr() * BORDER.length)], -30 + rr() * 10, y - 30, true); put(BORDER[Math.floor(rr() * BORDER.length)], W - 40 - rr() * 10, y - 30, true); }
      for (x = -20; x < W; x += 40 + rr() * 26) put(BORDER[Math.floor(rr() * BORDER.length)], x, H - 40 - rr() * 10, true);
      var area = W * Math.max(0, H - fieldTop), n, tries;
      for (n = 0, tries = 0; n < Math.min(5, area / 12000) && tries < 400; tries++) if (put(PROPS[Math.floor(rr() * PROPS.length)], rr() * W, fieldTop + rr() * (H - fieldTop))) n++;
      for (n = 0, tries = 0; n < area / 1600 && tries < 2000; tries++) if (put(SMALL[Math.floor(rr() * SMALL.length)], rr() * W, fieldTop + rr() * (H - fieldTop))) n++;
    }
    // images arrive after the first layout: redraw once they're all in
    var all = [tileset].concat(Object.keys(objs).map(function (k) { return objs[k]; }));
    all.forEach(function (im) { im.addEventListener('load', function () { if (all.every(function (x) { return x.complete; })) { last = ''; fit(); } }); });

    var t0 = performance.now();
    setInterval(function () {
      if (box.hidden || fire.hidden) return;
      var t = (performance.now() - t0) / 1000;
      fire.style.backgroundPositionX = -(Math.floor(t * 9) % 6) * 32 * P + 'px';
      smoke.style.backgroundPositionX = -(Math.floor(t * 7) % 6) * 32 * P + 'px';
    }, 50);

    fit();
    window.addEventListener('resize', fit);
    // the on-screen keyboard shrinks the visible page (and the panel) without always firing a window resize
    if (window.visualViewport) window.visualViewport.addEventListener('resize', function () { setTimeout(fit, 50); });
    setInterval(fit, 500);
  }

  window.addEventListener('pageshow', function (e) { if (e.persisted && /klase|tower_defence|veiksmai/.test(location.pathname)) location.reload(); });

  window.SudGame = { connect: connect, request: request, on: on, onReconnect: onReconnect, getSession: getSession, setSession: setSession, clearSession: clearSession, STREAK_GOAL: STREAK_GOAL };

  if (/veiksmai(\.html)?$/.test(location.pathname)) {
    var s = getSession();
    if (s && s.role === 'player') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { studentGame(s); });
      else studentGame(s);
    }
  }
})();
