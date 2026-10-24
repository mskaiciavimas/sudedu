/* Admin page helpers:
 *  - an item picker: a "Choose" button next to every field that wants a game index id / pet id / skin id. It opens a
 *    searchable grid of the game's items (with pictures) filtered to what fits - room items, consumables, pets, or the
 *    skins of the pet the form is for - and fills all the form's fields from the picked item (no more copying css
 *    classes: a pet's id is its first class, a skin's id its second, the index its game index id);
 *  - the password panel in a user's card: passwords are stored only as hashes and cannot be shown; the admin sets a new
 *    one or has one generated (shown once), confirming with the admin's own password (server: POST
 *    /admin/user/:id/password - it also logs the user out everywhere and logs the change). */
(function () {
    'use strict';
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const classes = item => String(item['css-class'] || '').split(/\s+/).filter(Boolean);
    const isConsumable = item => (item.category || []).some(c => c === 'Maistas' || c === 'Skaniukai');
    const isPet = item => item.pet === true;
    const isSkin = item => item.petAsset === true && classes(item).includes('skin');
    const KINDS = {
        object: { title: 'Choose a room item', test: item => !isConsumable(item) && !item.petAsset },
        consumable: { title: 'Choose a consumable (food, treats)', test: isConsumable },
        pet: { title: 'Choose a pet', test: isPet },
        skin: { title: 'Choose a skin', test: isSkin },
        gift: { title: 'Choose a gift', test: () => true }
    };

    // ------------------------------------------------------------ the picker
    // → Promise<{ id, item }> or null when closed
    async function pickAsset(kind, petId) {
        const index = await loadGameAssetIndex();
        const def = KINDS[kind];
        const all = Object.entries(index).filter(([, item]) => def.test(item) && (!petId || kind !== 'skin' || classes(item)[0] === petId));
        return new Promise(resolve => {
            const back = document.createElement('div');
            back.className = 'at-back';
            back.innerHTML = `<div class="at-box" role="dialog" aria-modal="true" aria-label="${esc(def.title)}">
                <div class="at-head"><b>${esc(def.title)}${petId && kind === 'skin' ? ` for ${esc(petId)}` : ''}</b><button type="button" class="at-x" aria-label="Close">×</button></div>
                <input type="search" class="at-search" placeholder="Search by name, category or id…">
                <div class="at-cats"></div>
                <div class="at-grid"></div>
            </div>`;
            document.body.appendChild(back);
            const close = value => { back.remove(); document.removeEventListener('keydown', onKey); resolve(value); };
            const onKey = e => { if (e.key === 'Escape') close(null); };
            document.addEventListener('keydown', onKey);
            back.addEventListener('click', e => { if (e.target === back) close(null); });
            back.querySelector('.at-x').addEventListener('click', () => close(null));
            const cats = [...new Set(all.flatMap(([, item]) => item.category || []))].sort((a, b) => a.localeCompare(b, 'lt'));
            let cat = '';
            const catBox = back.querySelector('.at-cats');
            catBox.innerHTML = cats.length > 1 ? ['', ...cats].map(c => `<button type="button" class="at-cat${c === cat ? ' on' : ''}" data-cat="${esc(c)}">${c ? esc(c) : 'All'}</button>`).join('') : '';
            const search = back.querySelector('.at-search');
            const draw = () => {
                const q = search.value.trim().toLowerCase();
                const list = all.filter(([id, item]) => (!cat || (item.category || []).includes(cat))
                    && (!q || id === q || String(item.title || '').toLowerCase().includes(q) || String(item['css-class']).toLowerCase().includes(q) || (item.category || []).some(c => c.toLowerCase().includes(q))));
                back.querySelector('.at-grid').innerHTML = list.length ? list.map(([id, item]) => `
                    <button type="button" class="at-item" data-id="${esc(id)}" title="${esc(item.title)} (${esc(item['css-class'])})">
                        ${createItemPreview(id)}
                        <span class="at-name">${esc(item.title || 'Item ' + id)}</span>
                        <span class="at-meta">#${esc(id)}${item.cost != null ? ` · ${esc(item.cost)} 💰` : ''}</span>
                    </button>`).join('') : '<p class="at-empty">Nothing found.</p>';
                back.querySelectorAll('.at-item').forEach(b => b.addEventListener('click', () => close({ id: b.dataset.id, item: index[b.dataset.id] })));
            };
            catBox.addEventListener('click', e => {
                const b = e.target.closest('.at-cat');
                if (!b) return;
                cat = b.dataset.cat;
                catBox.querySelectorAll('.at-cat').forEach(x => x.classList.toggle('on', x === b));
                draw();
            });
            search.addEventListener('input', draw);
            draw();
            search.focus();
        });
    }

    // the fields a pick fills: input id (or a function of the input) → { kind, fill(pick) → { inputId: value } }
    const set = (id, value) => { const el = document.getElementById(id); if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); } };
    const petFill = (prefix, nameId) => ({ id, item }) => {
        const c = classes(item);
        set(prefix + 'id', c[0]);
        if (nameId) set(nameId, item.petName || '');
        set(prefix + 'skin-id', c[1] || `${c[0]}-1`);
        set(prefix + 'skin-index', id);
    };
    const FIELDS = [
        { id: 'add-asset-id', kind: 'object', fill: ({ id }) => set('add-asset-id', id) },
        { id: 'add-consumable-id', kind: 'consumable', fill: ({ id }) => set('add-consumable-id', id) },
        { id: 'add-pet-id', kind: 'pet', fill: petFill('add-pet-', 'add-pet-name') },
        { id: 'bulk-item-id', kind: 'object', fill: ({ id }) => set('bulk-item-id', id) },
        { id: 'bulk-consumable-item-id', kind: 'consumable', fill: ({ id }) => set('bulk-consumable-item-id', id) },
        { id: 'bulk-pet-id', kind: 'pet', fill: ({ id, item }) => { const c = classes(item); set('bulk-pet-id', c[0]); set('bulk-pet-name', item.petName || ''); set('bulk-pet-skin-id', c[1] || `${c[0]}-1`); set('bulk-pet-skin-index', id); } },
        { id: 'bulk-skin-id', kind: 'skin', pet: () => document.getElementById('bulk-target-pet-id')?.value.trim(), fill: ({ id, item }) => { const c = classes(item); set('bulk-target-pet-id', c[0]); set('bulk-skin-id', c[1]); set('bulk-skin-index', id); } },
        { id: 'backup-skin-id', kind: 'skin', pet: () => document.getElementById('bulk-target-pet-id')?.value.trim(), fill: ({ id, item }) => { const c = classes(item); set('backup-skin-id', c[1]); set('backup-skin-index', id); } },
        // a user's pet: its own skins (skin-id-{petId})
        { match: /^skin-id-(.+)$/, kind: 'skin', fill: (pick, m) => { set(`skin-id-${m[1]}`, classes(pick.item)[1]); set(`skin-index-${m[1]}`, pick.id); } }
    ];
    function attachPickers(root = document) {
        root.querySelectorAll('input[id]').forEach(input => {
            if (input.dataset.picker) return;
            let field = FIELDS.find(f => f.id === input.id), m = null;
            if (!field) { field = FIELDS.find(f => f.match && (m = input.id.match(f.match))); }
            if (!field) return;
            input.dataset.picker = '1';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn small-btn at-pick';
            btn.textContent = '🔍 Choose';
            btn.title = 'Pick from the game items';
            btn.addEventListener('click', async () => {
                const petId = field.pet ? field.pet() : (m ? m[1] : null);
                const pick = await pickAsset(field.kind, petId || null);
                if (pick) field.fill(pick, m);
            });
            // (the input and its button in one row - the form's layout stays as it was)
            const row = document.createElement('div');
            row.className = 'at-field';
            input.parentNode.insertBefore(row, input);
            row.appendChild(input);
            row.appendChild(btn);
        });
    }

    // ------------------------------------------------------------ the password panel
    function passwordPanel(user) {
        if (!user || user.accType === 'admin') return '';
        return `<div class="at-pw" data-user="${user.id}">
            <h3>🔐 Password</h3>
            <p class="at-pw-note">Passwords are stored encrypted (as a one-way hash), so nobody - not even the admin - can see them.
            You can set a new one; the user is then logged out on every device.</p>
            <div class="at-pw-row">
                <label>New password <input type="text" class="at-pw-new" autocomplete="new-password" minlength="8" maxlength="72" placeholder="8+ characters" spellcheck="false"></label>
                <button type="button" class="btn small-btn at-pw-gen">Generate</button>
            </div>
            <div class="at-pw-row">
                <label>Your admin password <input type="password" class="at-pw-admin" autocomplete="current-password"></label>
                <button type="button" class="btn btn-danger small-btn at-pw-set">Set password</button>
            </div>
            <div class="at-pw-result"></div>
        </div>`;
    }
    function bindPasswordPanel(root = document) {
        root.querySelectorAll('.at-pw:not([data-bound])').forEach(panel => {
            panel.dataset.bound = '1';
            const userId = panel.dataset.user;
            const out = panel.querySelector('.at-pw-result');
            const run = async generate => {
                const adminPassword = panel.querySelector('.at-pw-admin').value;
                const newPassword = panel.querySelector('.at-pw-new').value;
                if (!adminPassword) { out.innerHTML = '<div class="message error">Enter your admin password to confirm.</div>'; return; }
                if (!generate && newPassword.length < 8) { out.innerHTML = '<div class="message error">The new password must be at least 8 characters (or use Generate).</div>'; return; }
                if (!confirm(generate ? 'Generate a new password for this user? Their current password stops working.' : 'Set this new password? Their current password stops working.')) return;
                out.innerHTML = '<div class="loading">Saving…</div>';
                const res = await apiFetch(`${apiBase}admin/user/${userId}/password`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ adminPassword, newPassword: generate ? undefined : newPassword, generate })
                });
                const body = res ? await res.json().catch(() => ({})) : {};
                panel.querySelector('.at-pw-admin').value = '';
                if (!res || !res.ok) { out.innerHTML = `<div class="message error">${esc(body.message || 'Not changed')}</div>`; return; }
                panel.querySelector('.at-pw-new').value = '';
                out.innerHTML = body.generatedPassword
                    ? `<div class="message success">New password for ${esc(body.username)} (shown only now): <code class="at-pw-code">${esc(body.generatedPassword)}</code> <button type="button" class="btn small-btn at-pw-copy">Copy</button></div>`
                    : `<div class="message success">${esc(body.message)}</div>`;
                const copy = out.querySelector('.at-pw-copy');
                if (copy) copy.addEventListener('click', () => navigator.clipboard && navigator.clipboard.writeText(body.generatedPassword).then(() => { copy.textContent = 'Copied'; }));
            };
            panel.querySelector('.at-pw-set').addEventListener('click', () => run(false));
            panel.querySelector('.at-pw-gen').addEventListener('click', () => run(true));
        });
    }

    // ------------------------------------------------------------ the admin's password, asked in a small dialog
    function askAdminPassword(title, text) {
        return new Promise(resolve => {
            const back = document.createElement('div');
            back.className = 'at-back';
            back.innerHTML = `<form class="at-box at-ask" role="dialog" aria-modal="true" aria-label="${esc(title)}">
                <div class="at-head"><b>${esc(title)}</b><button type="button" class="at-x" aria-label="Close">×</button></div>
                <p class="at-pw-note">${esc(text)}</p>
                <label class="at-ask-label">Your admin password <input type="password" class="at-ask-input" autocomplete="current-password" required></label>
                <div class="at-ask-row"><button type="submit" class="btn">Continue</button><button type="button" class="btn btn-secondary at-ask-cancel">Cancel</button></div>
            </form>`;
            document.body.appendChild(back);
            const close = v => { back.remove(); resolve(v); };
            back.querySelector('.at-x').addEventListener('click', () => close(null));
            back.querySelector('.at-ask-cancel').addEventListener('click', () => close(null));
            back.addEventListener('click', e => { if (e.target === back) close(null); });
            back.querySelector('form').addEventListener('submit', e => { e.preventDefault(); close(back.querySelector('.at-ask-input').value); });
            back.querySelector('.at-ask-input').focus();
        });
    }

    // ------------------------------------------------------------ deleting needs the admin's password
    // Every DELETE of the admin API (and deleting game statistics) carries the admin's password (X-Admin-Password);
    // it is asked in the dialog when needed and kept in this tab's memory for 2 minutes (one action deleting several
    // things asks once). A wrong one: a message, nothing deleted, asked again next time.
    let deletePassword = null, deletePasswordUntil = 0;
    function needsPassword(url, opts) {
        const method = String((opts && opts.method) || 'GET').toUpperCase();
        return /\/admin\//.test(url) && ((method === 'DELETE' && !/\/admin\/notices\//.test(url)) || /\/admin\/game-metrics\/delete/.test(url));
    }
    function hookDeletes() {
        if (typeof window.apiFetch !== 'function' || window.apiFetch.__deletes) return;
        const base = window.apiFetch;
        window.apiFetch = async function (url, opts = {}) {
            if (!needsPassword(String(url), opts)) return base(url, opts);
            let pw = Date.now() < deletePasswordUntil ? deletePassword : null;
            if (!pw) pw = await askAdminPassword('Confirm deleting', 'Deleting needs your admin password.');
            if (!pw) return { ok: false, status: 0, json: async () => ({ message: 'Cancelled - nothing was deleted' }), clone() { return this; } };
            const res = await base(url, { ...opts, headers: { ...(opts.headers || {}), 'X-Admin-Password': encodeURIComponent(pw) } });
            if (res && res.ok) { deletePassword = pw; deletePasswordUntil = Date.now() + 2 * 60000; }
            else if (res && (res.status === 403 || res.status === 429)) {
                const body = await res.clone().json().catch(() => ({}));
                if (body.code === 'ADMIN_PASSWORD_WRONG' || res.status === 429) { deletePassword = null; deletePasswordUntil = 0; }
            }
            return res;
        };
        window.apiFetch.__deletes = true;
    }

    // ------------------------------------------------------------ moving between users (User Lookup)
    // A list (search results or "Show list") is kept as it was when someone is picked from it: the card gets "← Back to
    // the list" (no new request, no new sorting - only the Search / Show list buttons ask again). Names in a card (a
    // teacher's students, a student's teacher) open that user's card, with "← back to <name>". Starting a simulation keeps
    // where we were; the admin page opens that card again on the way back.
    const RETURN_KEY = 'sudeduAdminReturn';
    const nav = { list: null, stack: [], current: null };
    const results = () => document.getElementById('lookup-results');
    function bindPicks(root) {
        root.querySelectorAll('.user-pick').forEach(b => b.addEventListener('click', () => openUserById(b.dataset.id)));
    }
    function backToList() {
        const box = results();
        if (!nav.list || !box) return;
        box.innerHTML = nav.list.html;
        bindPicks(box);
        const picked = box.querySelector(`.user-pick[data-id="${CSS.escape(String(nav.list.id))}"]`);
        nav.stack = [];
        nav.current = null;
        if (picked) {
            picked.classList.add('user-pick-last');
            picked.scrollIntoView({ block: 'center' });
        }
    }
    function navBar() {
        const prev = nav.stack[nav.stack.length - 1];
        if (!prev && !nav.list) return '';
        return `<div class="at-nav">
            ${prev ? `<button type="button" class="btn small-btn btn-secondary" data-nav="prev">← ${esc(prev.name)}</button>` : ''}
            ${nav.list ? '<button type="button" class="btn small-btn btn-secondary" data-nav="list">← Back to the list</button>' : ''}
        </div>`;
    }
    document.addEventListener('click', e => {
        const box = results();
        if (!box || !box.contains(e.target)) return;
        const pick = e.target.closest('.user-pick');
        if (pick) { nav.list = { html: box.innerHTML, id: pick.dataset.id }; nav.stack = []; nav.current = null; return; }
        const link = e.target.closest('.user-link');
        if (link) {
            e.preventDefault();
            if (nav.current && String(nav.current.id) !== String(link.dataset.id)) nav.stack.push(nav.current);
            openUserById(link.dataset.id);
            return;
        }
        const back = e.target.closest('[data-nav]');
        if (back) {
            if (back.dataset.nav === 'list') backToList();
            else { const prev = nav.stack.pop(); if (prev) openUserById(prev.id); }
        }
    }, true);
    // a new search started by the admin starts over (the page also searches again after a save - that keeps the way back)
    function hookNewSearch() {
        const reset = () => { nav.list = null; nav.stack = []; nav.current = null; };
        document.querySelector('button[onclick="searchUsers()"]')?.addEventListener('click', reset, true);
        document.getElementById('search-input')?.addEventListener('keypress', e => { if (e.key === 'Enter') reset(); }, true);
    }
    function restoreReturn() {
        let back = null;
        try { back = JSON.parse(sessionStorage.getItem(RETURN_KEY) || 'null'); sessionStorage.removeItem(RETURN_KEY); } catch (e) { back = null; }
        if (!back || !back.userId || (typeof simulationInfo === 'function' && simulationInfo())) return;
        nav.list = back.list || null;
        nav.stack = Array.isArray(back.stack) ? back.stack : [];
        openUserById(back.userId);
    }

    // ------------------------------------------------------------ simulation: the site as the user sees it
    // (refresh-token.js startSimulation / exitSimulation and its floating "Grįžti" button)
    async function simulate(userId, mode, page) {
        if (mode === 'full' && !confirm('Log in as this user? Everything you do is saved to their account (and logged). A button at the bottom left brings you back.')) return;
        const res = await apiFetch(`${apiBase}admin/impersonate/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) });
        const body = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) { alert(body.message || 'Could not start'); return; }
        // (back from the simulation: this user's card again, with the way back to the list)
        try { sessionStorage.setItem(RETURN_KEY, JSON.stringify({ userId, list: nav.list, stack: nav.stack })); } catch (e) { /* (private mode) */ }
        startSimulation(body, page);
    }
    function accessPanel(user) {
        if (!user || user.accType === 'admin') return '';
        return `<div class="at-access">
            <h3>🧭 Account access</h3>
            <p class="at-pw-note">See the site exactly as this user does (2 hours at most). "View" is read-only; "Log in" acts as the user - for fixing things. No password needed.</p>
            <div class="at-pw-row">
                <button type="button" class="btn small-btn" data-sim="view">👁 View as user</button>
                ${user.accType === 'student' ? '<button type="button" class="btn small-btn" data-sim="room">🏠 View pet room</button>' : ''}
                <button type="button" class="btn btn-danger small-btn" data-sim="full">🔓 Log in as user</button>
                ${window.AdminMessages ? '<button type="button" class="btn small-btn" data-sim="msg">💌 Send a message</button>' : ''}
            </div>
        </div>`;
    }
    function bindAccessPanel(user) {
        document.querySelectorAll('#lookup-results .at-access [data-sim]').forEach(b => b.addEventListener('click', () => {
            const kind = b.dataset.sim;
            if (kind === 'msg') { window.AdminMessages.composeFor(user); return; }
            simulate(user.id, kind === 'full' ? 'full' : 'view', kind === 'room' ? '/LT/augintiniai.html' : null);
        }));
    }

    // the user card is drawn by displayUserDetails (admin.html): the access and password panels added at its end
    function hookUserCard() {
        if (typeof window.displayUserDetails !== 'function' || window.displayUserDetails.__hooked) return;
        const original = window.displayUserDetails;
        window.displayUserDetails = function (user, ...rest) {
            const result = original.call(this, user, ...rest);
            const card = document.querySelector('#lookup-results .user-card');
            if (card && !card.querySelector('.at-pw')) card.insertAdjacentHTML('beforeend', accessPanel(user) + passwordPanel(user));
            nav.current = { id: user.id, name: user.nickname || user.username };
            if (card && !card.querySelector('.at-nav')) card.insertAdjacentHTML('afterbegin', navBar());
            bindPasswordPanel();
            bindAccessPanel(user);
            attachPickers();
            return result;
        };
        window.displayUserDetails.__hooked = true;
    }

    // ------------------------------------------------------------ a list of users (students / teachers by consistency)
    async function browseUsers() {
        nav.list = null; nav.stack = []; nav.current = null;
        const out = document.getElementById('lookup-results');
        const type = document.getElementById('browse-type').value;
        const [sort, dir] = document.getElementById('browse-sort').value.split(':');
        out.innerHTML = '<div class="loading">Loading…</div>';
        const min = document.getElementById('browse-min').value, max = document.getElementById('browse-max').value;
        const res = await apiFetch(`${apiBase}admin/users?type=${encodeURIComponent(type)}&sort=${sort}&dir=${dir}&minStudents=${encodeURIComponent(min)}&maxStudents=${encodeURIComponent(max)}`, { headers: { 'Content-Type': 'application/json' } });
        const body = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) { out.innerHTML = `<div class="message error">${esc(body.message || 'Could not load')}</div>`; return; }
        const pct = v => (v == null ? '–' : `${String(Math.round(v * 10) / 10).replace('.', ',')}%`);
        out.innerHTML = `
            <div class="user-card">
                <h3>${body.total > body.users.length ? `${body.users.length} of ${body.total}` : body.users.length} ${type === 'student' ? 'students' : type === 'teacher' ? 'teachers' : 'users'} - select one:</h3>
                ${sort === 'consistency' ? '<p class="at-pw-note">Students with at least 3 full weeks of data (as the progress graphs); a teacher by the class median as Užduotys shows it.</p>' : ''}
                <div class="asset-list user-pick-list">
                    ${body.users.map(u => `
                        <button type="button" class="asset-item user-pick" data-id="${u.id}">
                            <span><strong>${esc(u.nickname || u.username)}</strong> <span class="user-pick-mail">${esc(u.username)}</span> &nbsp;|&nbsp; ID ${u.id} &nbsp;|&nbsp; ${esc(u.accType)}${u.accType === 'teacher' ? ` &nbsp;|&nbsp; ${u.students} students` : ''}</span>
                            <span class="user-pick-stats"><b title="${u.accType === 'teacher' ? 'Median of the class' : 'Average weekly consistency'}">Nuoseklumas ${pct(u.consistency)}</b> · last login ${u.lastLogIn ? new Date(u.lastLogIn).toLocaleDateString('lt-LT') : 'never'}</span>
                        </button>`).join('') || '<p class="at-pw-note">Nobody.</p>'}
                </div>
            </div>`;
        out.querySelectorAll('.user-pick').forEach(b => b.addEventListener('click', () => openUserById(b.dataset.id)));
    }

    // ------------------------------------------------------------ class game statistics (GameMetric)
    const gs = { rows: [], hosts: {}, total: 0 };
    async function loadGameStats() {
        const box = document.getElementById('gamestats-content');
        if (!box) return;
        box.innerHTML = '<div class="loading">Loading…</div>';
        const res = await apiFetch(`${apiBase}admin/game-metrics?limit=500`, { headers: { 'Content-Type': 'application/json' } });
        if (!res || !res.ok) { box.innerHTML = '<div class="message error">Could not load</div>'; return; }
        Object.assign(gs, await res.json());
        drawGameStats();
    }
    // Vaiduoklis: how the shown games went, summed up (each row keeps per round [how it ended, word length, a bot lost,
    // seconds] - no names, no words)
    const GHOST_ENDS = { v: 'challenge: the word existed', i: 'challenge: no such word', c: 'gave up (no word)', t: 'out of time', l: 'a player left', o: 'other' };
    function ghostSummary(rows) {
        const games = rows.filter(r => r.game === 'ghost' && r.data && Array.isArray(r.data.r));
        if (!games.length) return '';
        const rounds = games.flatMap(r => r.data.r);
        const pct = (n, d) => d ? Math.round(n / d * 100) + '%' : '–';
        const avg = (arr, dec = 1) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(dec).replace(/\.0$/, '') : '–';
        const by = key => games.reduce((m, r) => { const k = key(r); m[k] = (m[k] || 0) + 1; return m; }, {});
        const list = o => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${esc(k)} ${n}`).join(' · ');
        const ends = rounds.reduce((m, r) => { m[r[0]] = (m[r[0]] || 0) + 1; return m; }, {});
        const solo = games.filter(r => r.mode === 'solo');
        return `<div class="gs-ghost">
            <h3>👻 Vaiduoklis – ${games.length} game${games.length === 1 ? '' : 's'} shown</h3>
            <div class="gs-ghost-grid">
                <div><b>Ways played</b><span>${list(by(r => r.mode))}</span></div>
                <div><b>Word lists</b><span>${list(by(r => (r.taskSettings && r.taskSettings.dict) || '?'))}</span></div>
                <div><b>Bot level</b><span>${list(by(r => r.difficulty || '?'))}</span></div>
                <div><b>Typical game</b><span>${avg(games.map(r => r.data.r.length))} rounds, ${avg(games.map(r => r.seconds / 60))} min, ${avg(games.map(r => r.players))} people + ${avg(games.map(r => (r.taskSettings && r.taskSettings.bots) || 0))} bots</span></div>
                <div><b>Rounds</b><span>${rounds.length}, typically ${avg(rounds.map(r => r[3]), 0)} s, the word ${avg(rounds.map(r => r[1]))} letters long</span></div>
                <div><b>Who lost the rounds</b><span>bots ${pct(rounds.filter(r => r[2]).length, rounds.length)}, people ${pct(rounds.filter(r => !r[2]).length, rounds.length)}</span></div>
                ${solo.length ? `<div><b>Solo games won</b><span>${pct(solo.filter(r => r.result === 'won').length, solo.length)} of ${solo.length}</span></div>` : ''}
                <div class="gs-ghost-ends"><b>How rounds ended</b><span>${Object.entries(ends).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${esc(GHOST_ENDS[k] || k)} ${pct(n, rounds.length)}`).join(' · ')}</span></div>
            </div>
            ${soloMatrix(solo)}
        </div>`;
    }
    // Vaiduoklis alone with bots: games won for each word list x bot level (and totals) - is a level too easy / hard?
    const GHOST_DICTS = [['easy', 'Easy words'], ['medium', 'Medium words'], ['hard', 'Hard words'], ['expert', 'Expert words']];
    const GHOST_BOTS = [['easy', 'Easy bots'], ['normal', 'Normal bots'], ['hard', 'Hard bots']];
    function soloMatrix(solo) {
        if (!solo.length) return '';
        const cell = list => {
            if (!list.length) return '<td class="gs-empty">–</td>';
            const won = list.filter(r => r.result === 'won').length, p = Math.round(won / list.length * 100);
            return `<td style="background:hsla(${Math.round(p * 1.2)},70%,55%,.28)" title="${won} won of ${list.length}"><b>${p}%</b> <span>${won}/${list.length}</span></td>`;
        };
        const dictOf = r => (r.taskSettings && r.taskSettings.dict) || '';
        return `<div class="gs-matrix-box"><b>Solo games won - word list × bot level</b> <span class="at-pw-note">(cell: won % · won/played; greener = more often won)</span>
            <div class="gs-scroll"><table class="gs-table gs-matrix">
                <thead><tr><th></th>${GHOST_BOTS.map(([, n]) => `<th>${n}</th>`).join('')}<th>All bot levels</th></tr></thead>
                <tbody>${GHOST_DICTS.map(([d, dn]) => `<tr><th>${dn}</th>${GHOST_BOTS.map(([b]) => cell(solo.filter(r => dictOf(r) === d && r.difficulty === b))).join('')}${cell(solo.filter(r => dictOf(r) === d))}</tr>`).join('')}
                    <tr class="gs-total"><th>All word lists</th>${GHOST_BOTS.map(([b]) => cell(solo.filter(r => r.difficulty === b))).join('')}${cell(solo)}</tr></tbody>
            </table></div></div>`;
    }
    // Tower defence: per difficulty - timed games won and the fortress's health left, "until defeat" games and how long
    // the class held out, correct answers a minute per player
    const TD_LEVELS = [['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard'], ['extreme', 'Very hard']];
    function tdSummary(rows) {
        const games = rows.filter(r => r.game === 'td');
        if (!games.length) return '';
        const avg = (arr, dec = 0) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(dec).replace(/\.0$/, '') : '–';
        const pct = (n, d) => d ? Math.round(n / d * 100) + '%' : '–';
        const rate = r => r.correct / Math.max(1, r.seconds / 60) / Math.max(1, r.players);
        const line = list => {
            const timed = list.filter(r => r.mode === 'timed'), finished = timed.filter(r => r.result !== 'stopped');
            const won = finished.filter(r => r.result === 'win').length;
            const endless = list.filter(r => r.mode === 'endless' && r.result !== 'stopped');
            const p = finished.length ? won / finished.length * 100 : null;
            return `<td>${list.length}</td>
                <td${p == null ? '' : ` style="background:hsla(${Math.round(p * 1.2)},70%,55%,.28)"`}>${finished.length ? `<b>${pct(won, finished.length)}</b> <span>${won}/${finished.length}</span>` : '–'}${timed.length > finished.length ? ` <span class="at-pw-note">(+${timed.length - finished.length} stopped)</span>` : ''}</td>
                <td>${finished.length ? avg(finished.map(r => r.endHp)) + '%' : '–'}</td>
                <td>${endless.length ? `${avg(endless.map(r => r.seconds / 60), 1)} min <span>(${endless.length})</span>` : '–'}</td>
                <td>${avg(list.map(r => r.players), 1)}</td>
                <td>${avg(list.map(rate), 1)}</td>`;
        };
        return `<div class="gs-ghost">
            <h3>🏰 Tower defence – ${games.length} game${games.length === 1 ? '' : 's'} shown</h3>
            <div class="gs-scroll"><table class="gs-table gs-matrix">
                <thead><tr><th>Difficulty</th><th>Games</th><th>Timed: won</th><th>Timed: fortress health left</th><th>Until defeat: held out</th><th>Players</th><th>Correct / min / player</th></tr></thead>
                <tbody>${TD_LEVELS.map(([k, n]) => { const l = games.filter(r => r.difficulty === k); return l.length ? `<tr><th>${n}</th>${line(l)}</tr>` : ''; }).join('')}
                    <tr class="gs-total"><th>All</th>${line(games)}</tr></tbody>
            </table></div>
        </div>`;
    }
    function drawGameStats() {
        const box = document.getElementById('gamestats-content');
        const hostName = id => (id == null ? '–' : `${gs.hosts[id] || 'ID ' + id} (${id})`);
        const hostIds = [...new Set(gs.rows.map(r => r.hostId).filter(v => v != null))];
        box.innerHTML = `
            <p class="at-pw-note">Recorded games (Klasė → Žaidimai; Vaiduoklis also alone and on the board), used for tuning the games - the ${gs.rows.length} newest of ${gs.total}. Delete test games so they do not skew it.</p>
            ${tdSummary(gs.rows)}
            ${ghostSummary(gs.rows)}
            <div class="at-pw-row">
                <label>Host <select class="gs-host"><option value="">All</option>${hostIds.map(id => `<option value="${id}">${esc(hostName(id))}</option>`).join('')}</select></label>
                <button type="button" class="btn small-btn gs-select-host">Select the shown games</button>
                <button type="button" class="btn btn-danger small-btn gs-delete" disabled>Delete selected</button>
                <span class="gs-count at-pw-note"></span>
            </div>
            ${gs.rows.length ? `<div class="gs-scroll"><table class="gs-table">
                <thead><tr><th><input type="checkbox" class="gs-all" aria-label="Select all shown"></th><th>When</th><th>Game</th><th>Host</th><th>Players</th><th>Difficulty</th><th>Mode</th><th>Set min</th><th>Task</th><th>Result</th><th>Played</th><th>Correct</th></tr></thead>
                <tbody>${gs.rows.map(r => `<tr data-host="${r.hostId ?? ''}"><td><input type="checkbox" class="gs-row" value="${r.id}"></td>
                    <td>${esc(new Date(r.createdAt).toLocaleString('lt-LT'))}</td><td>${esc(r.game)}</td><td>${esc(hostName(r.hostId))}</td><td>${r.players}</td>
                    <td>${esc(r.difficulty)}</td><td>${esc(r.mode)}</td><td>${r.game === 'ghost' ? '–' : r.minutes}</td><td>${esc(r.task)}${r.game === 'ghost' && r.taskSettings && r.taskSettings.dict ? ` (${esc(r.taskSettings.dict)})` : ''}</td><td>${esc(r.result)}</td>
                    <td>${Math.round(r.seconds / 60)} min</td><td>${r.correct}${r.game === 'ghost' ? ' rounds' : ''}</td></tr>`).join('')}</tbody>
            </table></div>` : '<p class="at-pw-note">No recorded games.</p>'}`;
        const host = box.querySelector('.gs-host');
        const visible = () => [...box.querySelectorAll('tbody tr')].filter(tr => tr.style.display !== 'none');
        const update = () => {
            const n = box.querySelectorAll('.gs-row:checked').length;
            box.querySelector('.gs-delete').disabled = !n;
            box.querySelector('.gs-count').textContent = n ? `${n} selected` : '';
        };
        host.addEventListener('change', () => {
            box.querySelectorAll('tbody tr').forEach(tr => { const show = !host.value || tr.dataset.host === host.value; tr.style.display = show ? '' : 'none'; if (!show) tr.querySelector('.gs-row').checked = false; });
            update();
        });
        box.querySelector('.gs-select-host').addEventListener('click', () => { visible().forEach(tr => { tr.querySelector('.gs-row').checked = true; }); update(); });
        const all = box.querySelector('.gs-all');
        if (all) all.addEventListener('change', e => { visible().forEach(tr => { tr.querySelector('.gs-row').checked = e.target.checked; }); update(); });
        box.querySelectorAll('.gs-row').forEach(c => c.addEventListener('change', update));
        box.querySelector('.gs-delete').addEventListener('click', async () => {
            const ids = [...box.querySelectorAll('.gs-row:checked')].map(c => Number(c.value));
            if (!confirm(`Delete ${ids.length} recorded game(s)? This cannot be undone.`)) return;
            const res = await apiFetch(`${apiBase}admin/game-metrics/delete`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
            if (!res || !res.ok) { alert('Not deleted'); return; }
            loadGameStats();
        });
    }

    // ------------------------------------------------------------ everyone's weekly statistics brought up to date
    // "Check" previews (nothing saved), "Update" saves - the server works it out again then, so practice meanwhile counts.
    async function refreshStats(apply) {
        const box = document.getElementById('stats-refresh-result');
        const check = document.getElementById('stats-refresh-check'), save = document.getElementById('stats-refresh-apply');
        if (apply && !confirm('Update every student\'s weekly stats now?')) return;
        check.disabled = save.disabled = true;
        box.innerHTML = '<div class="loading">Working…</div>';
        try {
            const res = await apiFetch(`${apiBase}admin/stats/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apply }) });
            const j = res ? await res.json().catch(() => ({})) : {};
            if (!res || !res.ok) { box.innerHTML = `<div class="message error">${esc(j.message || 'Could not do it')}</div>`; return; }
            const weeks = c => (c || []).map(v => Math.round(Number(v) * 100)).join(' · ');
            const list = j.examples.length ? `<div class="gs-scroll" style="max-height:260px"><table class="gs-table">
                <thead><tr><th>Student</th><th>Last practice</th><th>Consistency % by week (oldest → this week): before</th><th>after</th></tr></thead>
                <tbody>${j.examples.map(e => `<tr><td>${esc(e.name)} (${e.id})</td><td>${esc(e.lastPractice || '–')}</td><td>${weeks(e.before)}</td><td>${weeks(e.after)}</td></tr>`).join('')}</tbody>
            </table></div>${j.repaired > j.examples.length ? `<p class="at-pw-note">The first ${j.examples.length} of ${j.repaired}.</p>` : ''}` : '';
            box.innerHTML = apply
                ? `<div class="message success">Saved for ${j.saved} of ${j.students} students (${j.rolled} brought up to today, ${j.repaired} with shifted weeks put back).</div>${list}`
                : `<p class="at-pw-note"><b>${j.students}</b> students: <b>${j.rolled}</b> would be brought up to today, <b>${j.repaired}</b> have shifted weeks to put back${j.rolled || j.repaired ? '' : ' - everything is up to date'}.</p>${list}`;
            save.disabled = apply || !(j.rolled || j.repaired);
        } finally {
            check.disabled = false;
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        .at-field{display:flex;align-items:center;gap:6px;width:100%;min-width:0}
        .at-field>input{flex:1 1 auto;min-width:0;width:auto!important;margin:0!important}
        .at-pick{flex:none;white-space:nowrap;margin:0!important}
        .at-back{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,32,38,.45)}
        .at-box{width:min(900px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;gap:10px;background:#fff;border-radius:16px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,.25)}
        .at-head{display:flex;justify-content:space-between;align-items:center;font-size:17px}
        .at-x{width:32px;height:32px;border:0;border-radius:50%;background:rgba(0,0,0,.06);font-size:20px;cursor:pointer}
        .at-search{padding:9px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.15);font:inherit}
        .at-cats{display:flex;flex-wrap:wrap;gap:6px}
        .at-cat{border:1px solid rgba(0,0,0,.12);background:#fff;border-radius:14px;padding:3px 10px;font:inherit;font-size:13px;cursor:pointer}
        .at-cat.on{background:#ffc074;border-color:#e09a3e}
        .at-grid{overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;padding:2px}
        .at-item{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border:1px solid rgba(0,0,0,.1);border-radius:12px;background:#fffaf3;cursor:pointer;font:inherit;text-align:center}
        .at-item:hover,.at-item:focus-visible{border-color:#e09a3e;background:#fff1dc;outline:none}
        .at-name{font-size:13px;font-weight:600;line-height:1.2}
        .at-meta{font-size:12px;color:rgba(0,0,0,.55)}
        .at-empty{color:rgba(0,0,0,.6)}
        .at-pw{margin-top:20px;padding:16px;border-radius:14px;background:rgba(255,255,255,.35)}
        .at-pw-note{font-size:13px;color:rgba(0,0,0,.65);margin:6px 0 10px}
        .at-pw-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:8px}
        .at-pw-row label{display:flex;flex-direction:column;gap:4px;font-size:13px}
        .at-pw-row input{padding:7px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.15);font:inherit;min-width:220px}
        .at-pw-code{font-size:16px;padding:2px 8px;background:#fff;border-radius:6px;user-select:all}
        .at-access{margin-top:20px;padding:16px;border-radius:14px;background:rgba(255,255,255,.35)}
        .at-ask{width:min(440px,100%)}
        .at-ask-label{display:flex;flex-direction:column;gap:4px;font-size:13px}
        .at-ask-label input{padding:8px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.15);font:inherit}
        .at-ask-row{display:flex;gap:8px}
        .user-browse{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:4px 0 14px}
        .user-browse label{display:flex;gap:6px;align-items:center;font-size:14px}
        .user-browse input[type=number]{width:70px;padding:7px 8px;border-radius:10px;border:1px solid rgba(0,0,0,.15);font:inherit;background:rgba(255,255,255,.8)}
        .user-browse select{padding:7px 10px;border-radius:10px;border:1px solid rgba(0,0,0,.15);font:inherit;background:rgba(255,255,255,.8)}
        .user-pick-mail{font-size:13px;color:rgba(0,0,0,.6)}
        .user-pick-stats{font-size:13px;color:rgba(0,0,0,.65)}
        .gs-scroll{overflow:auto;max-height:70vh;margin-top:10px}
        .at-nav{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
        .user-link{color:#1d566e;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
        .user-link:hover{color:#0d3a4c}
        .user-pick-last{outline:2px solid rgba(29,86,110,.55)}
        .gs-ghost{margin:10px 0 14px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.35)}
        .gs-ghost h3{margin:0 0 8px;font-size:16px}
        .gs-ghost-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:6px 18px;font-size:13px}
        .gs-ghost-grid div{display:flex;flex-direction:column}
        .gs-ghost-grid b{font-size:12px;color:rgba(0,0,0,.55);font-weight:600}
        .gs-ghost-ends{grid-column:1/-1}
        .gs-matrix-box{margin-top:12px}
        .gs-matrix{margin-top:6px;font-size:13px}
        .gs-matrix th{text-align:left;white-space:nowrap}
        .gs-matrix td{text-align:center;white-space:nowrap}
        .gs-matrix td span{color:rgba(0,0,0,.55);font-size:12px}
        .gs-matrix .gs-total th,.gs-matrix .gs-total td{border-top:2px solid rgba(0,0,0,.2)}
        .gs-matrix .gs-empty{color:rgba(0,0,0,.35)}
        .gs-table{width:100%;border-collapse:collapse;font-size:13px;background:rgba(255,255,255,.7)}
        .gs-table th,.gs-table td{padding:6px 8px;border-bottom:1px solid rgba(0,0,0,.06);text-align:left;white-space:nowrap}
        .gs-table th{position:sticky;top:0;background:#fff}
    `;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', () => {
        hookUserCard();
        hookDeletes();
        hookNewSearch();
        restoreReturn();
        attachPickers();
        const browse = document.getElementById('browse-users');
        if (browse) browse.addEventListener('click', browseUsers);
        document.getElementById('stats-refresh-check')?.addEventListener('click', () => refreshStats(false));
        document.getElementById('stats-refresh-apply')?.addEventListener('click', () => refreshStats(true));
        // (the class size filter: with teachers only)
        const typeSel = document.getElementById('browse-type'), classBox = document.querySelector('.browse-class');
        const showClass = () => { if (classBox) classBox.hidden = typeSel.value !== 'teacher'; };
        if (typeSel) { typeSel.addEventListener('change', showClass); showClass(); }
        document.getElementById('browse-sort')?.addEventListener('change', e => { if (e.target.value.startsWith('students') && typeSel) { typeSel.value = 'teacher'; showClass(); } });
        // (forms drawn later - a user's card, a pet's skin rows)
        new MutationObserver(() => attachPickers()).observe(document.body, { childList: true, subtree: true });
    });
    window.AdminTools = { pickAsset, attachPickers, loadGameStats };
})();
