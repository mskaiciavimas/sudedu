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
        skin: { title: 'Choose a skin', test: isSkin }
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

    // ------------------------------------------------------------ simulation: the site as the user sees it
    // (refresh-token.js startSimulation / exitSimulation and its floating "Grįžti" button)
    async function simulate(userId, mode, page) {
        const text = mode === 'full'
            ? 'You will act as this user: everything you do is saved to their account (and logged). A button at the bottom left brings you back.'
            : 'You will see the site as this user does. Nothing can be changed. A button at the bottom left brings you back.';
        const adminPassword = await askAdminPassword(mode === 'full' ? 'Log in as this user' : 'View as this user', text);
        if (!adminPassword) return;
        const res = await apiFetch(`${apiBase}admin/impersonate/${userId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword, mode }) });
        const body = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) { alert(body.message || 'Could not start'); return; }
        startSimulation(body, page);
    }
    function accessPanel(user) {
        if (!user || user.accType === 'admin') return '';
        return `<div class="at-access">
            <h3>🧭 Account access</h3>
            <p class="at-pw-note">See the site exactly as this user does (2 hours at most). "View" is read-only; "Log in" acts as the user - for fixing things.</p>
            <div class="at-pw-row">
                <button type="button" class="btn small-btn" data-sim="view">👁 View as user</button>
                ${user.accType === 'student' ? '<button type="button" class="btn small-btn" data-sim="room">🏠 View pet room</button>' : ''}
                <button type="button" class="btn btn-danger small-btn" data-sim="full">🔓 Log in as user</button>
            </div>
        </div>`;
    }
    function bindAccessPanel(user) {
        document.querySelectorAll('#lookup-results .at-access [data-sim]').forEach(b => b.addEventListener('click', () => {
            const kind = b.dataset.sim;
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
            bindPasswordPanel();
            bindAccessPanel(user);
            attachPickers();
            return result;
        };
        window.displayUserDetails.__hooked = true;
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
    function drawGameStats() {
        const box = document.getElementById('gamestats-content');
        const hostName = id => (id == null ? '–' : `${gs.hosts[id] || 'ID ' + id} (${id})`);
        const hostIds = [...new Set(gs.rows.map(r => r.hostId).filter(v => v != null))];
        box.innerHTML = `
            <p class="at-pw-note">Recorded class games (Klasė → Žaidimai), used for tuning game difficulty - the ${gs.rows.length} newest of ${gs.total}. Delete test games so they do not skew it.</p>
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
                    <td>${esc(r.difficulty)}</td><td>${esc(r.mode)}</td><td>${r.minutes}</td><td>${esc(r.task)}</td><td>${esc(r.result)}</td>
                    <td>${Math.round(r.seconds / 60)} min</td><td>${r.correct}</td></tr>`).join('')}</tbody>
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
        .gs-scroll{overflow:auto;max-height:70vh;margin-top:10px}
        .gs-table{width:100%;border-collapse:collapse;font-size:13px;background:rgba(255,255,255,.7)}
        .gs-table th,.gs-table td{padding:6px 8px;border-bottom:1px solid rgba(0,0,0,.06);text-align:left;white-space:nowrap}
        .gs-table th{position:sticky;top:0;background:#fff}
    `;
    document.head.appendChild(style);

    document.addEventListener('DOMContentLoaded', () => {
        hookUserCard();
        attachPickers();
        // (forms drawn later - a user's card, a pet's skin rows)
        new MutationObserver(() => attachPickers()).observe(document.body, { childList: true, subtree: true });
    });
    window.AdminTools = { pickAsset, attachPickers, loadGameStats };
})();
