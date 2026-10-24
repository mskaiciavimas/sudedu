/* Admin page → "💌 Messages": messages, gifts and polls for the site's users (server: /admin/notices…, the site shows
 * them with sudedu-notices.js).
 *
 * New: a message or a poll (question + answers; several answers / a written answer / must be answered), for everyone,
 * students, teachers, a teacher's class or chosen users (found by id, e-mail or nickname, or a pasted list), opened on
 * a chosen page (or the first page the user opens), optionally from / until a date, optionally with a pet game gift
 * (picked from the items; a poll gives it after the answer), optionally also for accounts created while it is active.
 * Each user sees it once. Preview shows it exactly as users will.
 * The look: plain text with pictures between the lines (admin-message-text.js), or a designed card
 * (admin-message-designer.js: text blocks and pictures - GIFs too - placed, sized and turned freely; the card scales to
 * every screen). Pictures are uploaded to the site's GitHub repository or picked from those uploaded before
 * (admin-message-images.js); if GitHub can't be reached, nothing is uploaded or sent.
 * Sent: the numbers (sent / seen / waiting, poll answers), results with bars per answer (all, students, teachers), the
 * written answers, a CSV; pause / resume, edit the text and dates, send to more users, copy into a new one, delete
 * (deleting removes it from everyone who has not seen it yet, with its answers). */
(function () {
    'use strict';
    const PAGE_NAMES = {
        any: 'Any page (the first one they open)', index: 'Pagrindinis (task choice)', uzduotys: 'Užduotys',
        augintiniai: 'Pet room', klase: 'Klasė', veiksmai: 'Veiksmai (math)', rasyba: 'Rašyba', 'teksto-suvokimas': 'Teksto suvokimas', apie: 'Apie'
    };
    const AUDIENCES = [
        ['all', 'Everyone'], ['students', 'Students'], ['teachers', 'Teachers'], ['class', "A teacher's class"], ['users', 'Chosen users']
    ];
    // the accounts created later that get a message too: the audience's kind only
    const NEW_OF = { all: 'new accounts', students: 'new student accounts', teachers: 'new teacher accounts' };
    const DEFAULT_TITLE = { message: 'Žinutė nuo SUDEDU', poll: 'Trumpa apklausa' };
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmtDate = d => d ? new Date(d).toLocaleString('lt-LT', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
    const localInput = d => { if (!d) return ''; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
    const num = n => Number(n || 0).toLocaleString('lt-LT');
    const api = async (path, opts = {}) => {
        const res = await apiFetch(`${apiBase}admin/${path}`, opts.body !== undefined ? { ...opts, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opts.body) } : opts);
        const body = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) throw new Error(body.message || 'Request failed');
        return body;
    };

    let root = null, mounted = false, list = [];
    const state = { kind: 'message', options: ['', ''], gift: null, audience: null, look: 'text', designer: null, text: null };

    // ------------------------------------------------------------ who: everyone / students / teachers / class / users
    // → { el, value() → { type, ids }, set(type, users) }; onChange is called after any change
    function audiencePicker(onChange, { allowNew = true } = {}) {
        const el = document.createElement('div');
        el.className = 'am-aud';
        let type = 'all';
        const chosen = new Map();   // id → user
        el.innerHTML = `
            <div class="am-seg" role="radiogroup">${AUDIENCES.map(([t, label]) => `<button type="button" class="am-seg-btn" data-t="${t}" role="radio">${label}</button>`).join('')}</div>
            <div class="am-people" hidden>
                <div class="am-find">
                    <input type="search" class="am-find-input" autocomplete="off" placeholder="">
                    <div class="am-suggest" hidden></div>
                </div>
                <div class="am-hint"></div>
                <div class="am-chips"></div>
            </div>
            ${allowNew ? '<label class="am-check am-newacc"><input type="checkbox" class="am-newacc-box" checked> <span class="am-newacc-text">Also accounts created while it is active</span></label>' : ''}
            <div class="am-count"></div>`;
        const input = el.querySelector('.am-find-input'), suggest = el.querySelector('.am-suggest');
        const draw = () => {
            el.querySelectorAll('.am-seg-btn').forEach(b => { b.classList.toggle('on', b.dataset.t === type); b.setAttribute('aria-checked', String(b.dataset.t === type)); });
            const people = type === 'users' || type === 'class';
            el.querySelector('.am-people').hidden = !people;
            const newAcc = el.querySelector('.am-newacc');
            if (newAcc) {
                newAcc.hidden = people;
                if (NEW_OF[type]) newAcc.querySelector('.am-newacc-text').textContent = `Also ${NEW_OF[type]} created while it is active`;
            }
            input.placeholder = type === 'class' ? 'Find a teacher: id, e-mail or name…' : 'Find a user: id, e-mail or name… (or paste a list of ids / e-mails and press Enter)';
            el.querySelector('.am-hint').textContent = type === 'class' ? 'The message goes to the students of the chosen teachers.' : '';
            el.querySelector('.am-chips').innerHTML = [...chosen.values()].map(u => `<span class="am-chip" title="${esc(u.username)}">${u.accType === 'teacher' ? '👩‍🏫' : u.accType === 'admin' ? '🛡️' : '🧒'} ${esc(u.nickname || u.username)} <small>#${u.id}</small><button type="button" data-id="${u.id}" aria-label="Remove">×</button></span>`).join('')
                + (chosen.size > 1 ? `<button type="button" class="am-clear">Clear all (${chosen.size})</button>` : '');
            onChange && onChange();
        };
        const add = users => { users.forEach(u => chosen.set(u.id, u)); draw(); };
        el.querySelector('.am-seg').addEventListener('click', e => {
            const b = e.target.closest('.am-seg-btn');
            if (!b || b.dataset.t === type) return;
            if ((type === 'class') !== (b.dataset.t === 'class')) chosen.clear();   // (teachers ≠ users)
            type = b.dataset.t;
            draw();
        });
        el.querySelector('.am-chips').addEventListener('click', e => {
            if (e.target.closest('.am-clear')) { chosen.clear(); draw(); return; }
            const b = e.target.closest('button[data-id]');
            if (b) { chosen.delete(Number(b.dataset.id)); draw(); }
        });
        let timer = null, seq = 0;
        input.addEventListener('input', () => {
            clearTimeout(timer);
            const q = input.value.trim();
            if (!q || /[,;\s]/.test(q.replace(/\s+$/, '')) && q.split(/[,;\s]+/).filter(Boolean).length > 1) { suggest.hidden = true; return; }
            timer = setTimeout(async () => {
                const mine = ++seq;
                try {
                    const { users } = await api(`notices/find-users?q=${encodeURIComponent(q)}`);
                    if (mine !== seq) return;
                    const shown = type === 'class' ? users.filter(u => u.accType === 'teacher') : users;
                    suggest.innerHTML = shown.length ? shown.map(u => `<button type="button" class="am-sug" data-id="${u.id}">
                        <b>${esc(u.nickname || '—')}</b> <span>${esc(u.username)}</span> <small>#${u.id} · ${esc(u.accType)}${chosen.has(u.id) ? ' · added' : ''}</small></button>`).join('')
                        : `<div class="am-sug-none">${type === 'class' ? 'No teacher found' : 'Nobody found'}</div>`;
                    suggest._users = shown;
                    suggest.hidden = false;
                } catch { suggest.hidden = true; }
            }, 220);
        });
        suggest.addEventListener('click', e => {
            const b = e.target.closest('.am-sug');
            if (!b) return;
            const u = (suggest._users || []).find(x => x.id === Number(b.dataset.id));
            if (u) add([u]);
            input.value = '';
            suggest.hidden = true;
            input.focus();
        });
        input.addEventListener('keydown', async e => {
            if (e.key === 'Escape') { suggest.hidden = true; return; }
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const terms = input.value.split(/[,;\s]+/).map(t => t.trim()).filter(Boolean);
            if (!terms.length) return;
            // one term with suggestions open: the first suggestion
            if (terms.length === 1 && !suggest.hidden && suggest._users && suggest._users.length && !/^\d+$/.test(terms[0]) && !terms[0].includes('@')) {
                add([suggest._users[0]]); input.value = ''; suggest.hidden = true; return;
            }
            try {
                const { users, notFound } = await api('notices/resolve-users', { method: 'POST', body: { terms } });
                add(type === 'class' ? users.filter(u => u.accType === 'teacher') : users);
                input.value = notFound.join(', ');
                el.querySelector('.am-hint').textContent = notFound.length ? `Not found: ${notFound.join(', ')}` : (type === 'class' ? 'The message goes to the students of the chosen teachers.' : '');
                suggest.hidden = true;
            } catch (err) { el.querySelector('.am-hint').textContent = err.message; }
        });
        document.addEventListener('click', e => { if (!el.contains(e.target)) suggest.hidden = true; });
        draw();
        return {
            el,
            value: () => ({ type, ids: type === 'users' || type === 'class' ? [...chosen.keys()] : undefined }),
            forNew: () => !!(el.querySelector('.am-newacc-box') && el.querySelector('.am-newacc-box').checked) && ['all', 'students', 'teachers'].includes(type),
            set(t, users = []) { type = t; chosen.clear(); users.forEach(u => chosen.set(u.id, u)); draw(); }
        };
    }

    // how many users an audience is (shown under the picker)
    function countInto(picker) {
        let timer = null, seq = 0;
        return () => {
            clearTimeout(timer);
            const box = picker.el.querySelector('.am-count');
            const a = picker.value();
            if ((a.type === 'users' || a.type === 'class') && !a.ids.length) { box.textContent = 'Add at least one ' + (a.type === 'class' ? 'teacher.' : 'user.'); return; }
            timer = setTimeout(async () => {
                const mine = ++seq;
                try {
                    const { count } = await api('notices/count', { method: 'POST', body: { audience: a } });
                    if (mine === seq) box.innerHTML = `→ <b>${num(count)}</b> ${count === 1 ? 'user' : 'users'} now`;
                } catch { box.textContent = ''; }
            }, 250);
        };
    }

    // ------------------------------------------------------------ the gift
    const classesOf = item => String(item['css-class'] || '').split(/\s+/).filter(Boolean);
    function giftInfo(item) {
        const c = classesOf(item);
        const kind = item.petAsset !== true ? 'object' : c.includes('skin') ? 'skin' : 'supply';
        return { kind, stack: !!item.stackable, one: !!item.oneOfKind, petType: kind === 'skin' ? c[0] : undefined, petName: kind === 'skin' ? (item.petName || '') : undefined };
    }
    const GIFT_KIND_NAME = { object: 'room item (goes to the storage)', supply: 'pet supply', skin: 'pet / skin' };
    function drawGift() {
        const box = root.querySelector('.am-gift');
        const g = state.gift;
        if (!g) {
            box.innerHTML = `<button type="button" class="btn small-btn am-gift-add">🎁 Add a gift</button><span class="am-muted">optional – a pet game item added to each user's account when they see it${state.kind === 'poll' ? ' (a poll: after answering)' : ''}</span>`;
            return;
        }
        const single = g.info.kind === 'skin' || (g.info.kind === 'object' && g.info.one);
        box.innerHTML = `<div class="am-gift-card">
            ${createItemPreview(g.id)}
            <div class="am-gift-text"><b>${esc(g.item.title || 'Item ' + g.id)}</b><span class="am-muted">#${esc(g.id)} · ${GIFT_KIND_NAME[g.info.kind]}${g.info.kind === 'skin' && g.info.petName ? ` (${esc(g.info.petName)})` : ''}</span></div>
            <label class="am-qty">Qty <input type="number" class="am-gift-qty" min="1" max="99" value="${single ? 1 : g.qty}" ${single ? 'disabled title="One of a kind"' : ''}></label>
            <button type="button" class="btn small-btn am-gift-add">Change</button>
            <button type="button" class="btn small-btn btn-danger am-gift-remove">Remove</button>
        </div>`;
    }
    async function chooseGift() {
        const pick = await AdminTools.pickAsset('gift');
        if (!pick) return;
        state.gift = { id: Number(pick.id), item: pick.item, info: giftInfo(pick.item), qty: 1 };
        drawGift();
    }

    // ------------------------------------------------------------ the form
    function formHtml() {
        return `
        <div class="user-card am-compose">
            <div class="am-compose-head">
                <h3>New</h3>
                <div class="am-seg am-kind">
                    <button type="button" class="am-seg-btn on" data-kind="message">✉️ Message</button>
                    <button type="button" class="am-seg-btn" data-kind="poll">📊 Poll</button>
                </div>
            </div>
            <div class="am-grid">
                <div class="am-col">
                    <div class="form-group"><label for="am-title">Title</label><input id="am-title" maxlength="120" value="${DEFAULT_TITLE.message}"></div>
                    <div class="form-group">
                        <div class="am-look-row"><label class="am-body-label">Message</label>
                            <div class="am-seg am-look"><button type="button" class="am-seg-btn on" data-look="text">✏️ Plain text</button><button type="button" class="am-seg-btn" data-look="design">🎨 Designed card</button></div></div>
                        <div class="am-text-part"></div>
                        <small class="am-muted am-design-note" hidden>Design the card below - it is what users see (a poll's answers come under it).</small>
                    </div>
                    <div class="form-group am-poll" hidden>
                        <label>Answers</label>
                        <div class="am-options"></div>
                        <button type="button" class="btn small-btn am-opt-add">+ Add an answer</button>
                        <div class="am-poll-flags">
                            <label class="am-check"><input type="checkbox" id="am-multiple"> Several answers may be picked</label>
                            <label class="am-check"><input type="checkbox" id="am-other"> A written answer ("Kita")</label>
                            <label class="am-check"><input type="checkbox" id="am-required"> Must be answered (no close button; shown again until answered)</label>
                        </div>
                    </div>
                    <div class="form-group"><label>Gift</label><div class="am-gift"></div></div>
                </div>
                <div class="am-col">
                    <div class="form-group"><label>Who</label><div class="am-aud-slot"></div></div>
                    <div class="form-group">
                        <label for="am-page">Where it opens</label>
                        <select id="am-page">${Object.entries(PAGE_NAMES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>
                    </div>
                    <div class="am-dates">
                        <div class="form-group"><label for="am-starts">Show from <span class="am-muted">(empty = now)</span></label><input type="datetime-local" id="am-starts"></div>
                        <div class="form-group"><label for="am-ends">Until <span class="am-muted">(empty = no end)</span></label><input type="datetime-local" id="am-ends"></div>
                    </div>
                </div>
            </div>
            <div class="am-designer" hidden></div>
            <div class="am-out"></div>
            <div class="am-actions">
                <button type="button" class="btn btn-secondary am-preview">👁 Preview</button>
                <button type="button" class="btn am-send">Send</button>
            </div>
        </div>
        <div class="user-card am-sent">
            <div class="am-sent-head"><h3>Sent</h3><button type="button" class="btn small-btn btn-secondary am-reload">🔄 Refresh</button></div>
            <div class="am-list"><div class="loading">Loading…</div></div>
        </div>`;
    }

    function drawOptions() {
        const box = root.querySelector('.am-options');
        box.innerHTML = state.options.map((o, i) => `<div class="am-opt"><span class="am-opt-n">${i + 1}.</span><input class="am-opt-input" data-i="${i}" maxlength="160" value="${esc(o)}" placeholder="Answer ${i + 1}">${state.options.length > 1 ? `<button type="button" class="am-opt-del" data-i="${i}" aria-label="Remove">×</button>` : ''}</div>`).join('');
    }
    function setKind(kind) {
        const title = root.querySelector('#am-title');
        if (!title.value.trim() || title.value === DEFAULT_TITLE[state.kind]) title.value = DEFAULT_TITLE[kind];
        state.kind = kind;
        root.querySelectorAll('.am-kind .am-seg-btn').forEach(b => b.classList.toggle('on', b.dataset.kind === kind));
        root.querySelector('.am-poll').hidden = kind !== 'poll';
        root.querySelector('.am-body-label').textContent = kind === 'poll' ? 'Question' : 'Message';
        root.querySelector('.am-send').textContent = kind === 'poll' ? 'Send the poll' : 'Send the message';
        drawGift();
    }

    // plain text or a designed card
    function setLook(look) {
        state.look = look;
        root.querySelectorAll('.am-look .am-seg-btn').forEach(b => b.classList.toggle('on', b.dataset.look === look));
        const design = look === 'design';
        root.querySelector('.am-text-part').hidden = design;
        root.querySelector('.am-design-note').hidden = !design;
        root.querySelector('.am-designer').hidden = !design;
        if (design && !state.designer) state.designer = MessageDesigner.create(root.querySelector('.am-designer'));
    }

    // the form → the notice as the server (and the preview) wants it, or an error text
    function readForm({ preview = false } = {}) {
        const title = root.querySelector('#am-title').value.trim();
        const design = state.look === 'design';
        const layout = design && state.designer ? state.designer.get() : null;
        const body = design ? '' : state.text.get();
        if (!title) return { error: 'Add a title.' };
        if (body.length > 5000) return { error: `The text is too long (${body.length} of 5000 characters).` };
        if (design && !layout) return { error: 'The card is empty - add a text or a picture.' };
        if (!design && !body) return { error: state.kind === 'poll' ? 'Write the question.' : 'Write the message.' };
        const n = {
            kind: state.kind, title, body, layout: layout || undefined,
            page: root.querySelector('#am-page').value,
            audience: state.audience.value(),
            forNewAccounts: state.audience.forNew(),
            startsAt: root.querySelector('#am-starts').value ? new Date(root.querySelector('#am-starts').value).toISOString() : null,
            expiresAt: root.querySelector('#am-ends').value ? new Date(root.querySelector('#am-ends').value).toISOString() : null
        };
        if (n.startsAt && n.expiresAt && n.expiresAt <= n.startsAt) return { error: '"Until" must be after "Show from".' };
        if (!preview && n.expiresAt && new Date(n.expiresAt) <= new Date()) return { error: '"Until" is in the past.' };
        if (!preview && (n.audience.type === 'users' || n.audience.type === 'class') && !n.audience.ids.length) return { error: n.audience.type === 'class' ? 'Choose at least one teacher.' : 'Choose at least one user.' };
        if (state.kind === 'poll') {
            const options = state.options.map(o => o.trim()).filter(Boolean);
            const other = root.querySelector('#am-other').checked;
            if (options.length < 2 && !other) return { error: 'A poll needs at least 2 answers (or a written answer).' };
            n.poll = { options, multiple: root.querySelector('#am-multiple').checked, other, required: root.querySelector('#am-required').checked };
        }
        if (state.gift) {
            const single = state.gift.info.kind === 'skin' || (state.gift.info.kind === 'object' && state.gift.info.one);
            const qty = single ? 1 : Math.max(1, Math.min(99, parseInt(root.querySelector('.am-gift-qty').value) || 1));
            Object.assign(n, { giftId: state.gift.id, giftQty: qty, gift: state.gift.info });
        }
        return { notice: n };
    }
    function say(text, type = 'error') {
        const out = root.querySelector('.am-out');
        out.innerHTML = text ? `<div class="message ${type}">${text}</div>` : '';
    }

    async function send() {
        const { notice, error } = readForm();
        if (error) { say(esc(error)); return; }
        say('');
        let count = null;
        try { count = (await api('notices/count', { method: 'POST', body: { audience: notice.audience } })).count; } catch { /* (asked below anyway) */ }
        const what = notice.kind === 'poll' ? 'poll' : 'message';
        const who = count == null ? 'the chosen users' : `${num(count)} ${count === 1 ? 'user' : 'users'}`;
        if (!confirm(`Send this ${what} to ${who}${notice.forNewAccounts ? ` (and ${NEW_OF[notice.audience.type]} while it is active)` : ''}?\nOpens on: ${PAGE_NAMES[notice.page]}${notice.giftId != null ? `\nGift: ${state.gift.item.title || notice.giftId} × ${notice.giftQty}` : ''}`)) return;
        const btn = root.querySelector('.am-send');
        btn.disabled = true;
        try {
            const r = await api('notices', { method: 'POST', body: notice });
            say(`Sent to ${num(r.recipients)} ${r.recipients === 1 ? 'user' : 'users'}${notice.forNewAccounts ? ` (+ ${NEW_OF[notice.audience.type]} while it is active)` : ''}.`, 'success');
            resetForm();
            loadList();
        } catch (err) { say(esc(err.message)); }
        btn.disabled = false;
    }
    function resetForm() {
        state.text.set('');
        if (state.designer) state.designer.set(null);
        root.querySelector('#am-title').value = DEFAULT_TITLE[state.kind];
        root.querySelector('#am-starts').value = '';
        root.querySelector('#am-ends').value = '';
        ['#am-multiple', '#am-other', '#am-required'].forEach(s => { root.querySelector(s).checked = false; });
        state.options = ['', ''];
        state.gift = null;
        drawOptions();
        drawGift();
    }
    const preview = n => SudeduNotices.preview(n);

    // a message from the list back into the form (a copy to change and send again)
    function copyIntoForm(m) {
        setKind(m.kind);
        root.querySelector('#am-title').value = m.title;
        state.text.set(m.layout ? '' : m.body);
        setLook(m.layout ? 'design' : 'text');
        if (m.layout) state.designer.set(m.layout);
        root.querySelector('#am-page').value = m.page;
        root.querySelector('#am-starts').value = '';
        root.querySelector('#am-ends').value = '';
        if (m.kind === 'poll' && m.poll) {
            state.options = m.poll.options.length ? [...m.poll.options] : [''];
            root.querySelector('#am-multiple').checked = !!m.poll.multiple;
            root.querySelector('#am-other').checked = !!m.poll.other;
            root.querySelector('#am-required').checked = !!m.poll.required;
            drawOptions();
        }
        state.gift = null;
        if (m.giftId != null) {
            loadGameAssetIndex().then(index => {
                const item = index[m.giftId];
                if (item) { state.gift = { id: m.giftId, item, info: giftInfo(item), qty: m.giftQty }; drawGift(); }
            });
        }
        drawGift();
        const t = m.audience && m.audience.type;
        if (t === 'users' || t === 'class') {
            api('notices/resolve-users', { method: 'POST', body: { terms: (m.audience.ids || []).map(String) } })
                .then(({ users }) => state.audience.set(t, users)).catch(() => state.audience.set(t, []));
        } else state.audience.set(t || 'all');
        say('Copied into the form – change what you need and send.', 'info');
        root.querySelector('.am-compose').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ------------------------------------------------------------ the list
    function status(m) {
        const now = Date.now();
        if (!m.active) return ['paused', 'Paused'];
        if (m.expiresAt && new Date(m.expiresAt) <= now) return ['ended', 'Ended'];
        if (m.startsAt && new Date(m.startsAt) > now) return ['scheduled', 'From ' + fmtDate(m.startsAt)];
        return ['live', 'Active'];
    }
    function audienceText(m) {
        const a = m.audience || {};
        const base = { all: 'Everyone', students: 'Students', teachers: 'Teachers', users: `${(a.ids || []).length} chosen ${(a.ids || []).length === 1 ? 'user' : 'users'}`, class: `Class of teacher${(a.ids || []).length > 1 ? 's' : ''} #${(a.ids || []).join(', #')}` }[a.type] || '?';
        return base + (m.forNewAccounts ? ` + ${NEW_OF[a.type] || 'new accounts'}` : '');
    }
    function itemHtml(m) {
        const [cls, label] = status(m);
        const gift = m.giftId != null ? `🎁 ${esc((typeof gameAssetIndex !== 'undefined' && gameAssetIndex && gameAssetIndex[m.giftId] && gameAssetIndex[m.giftId].title) || '#' + m.giftId)}${m.giftQty > 1 ? ' × ' + m.giftQty : ''}` : '';
        return `<div class="am-item" data-id="${m.id}">
            <div class="am-item-main">
                <div class="am-item-top">
                    <span class="am-kind-tag">${m.kind === 'poll' ? '📊 Poll' : '✉️ Message'}${m.layout ? ' · 🎨 designed' : ''}</span>
                    <span class="am-status ${cls}">${esc(label)}</span>
                    <b class="am-item-title">${esc(m.title)}</b>
                </div>
                <div class="am-item-body">${esc(shortBody(m.body))}</div>
                <div class="am-item-meta">
                    <span>👥 ${esc(audienceText(m))}</span><span>📍 ${esc(PAGE_NAMES[m.page] || m.page)}</span>
                    ${gift ? `<span>${gift}</span>` : ''}
                    <span>🕒 ${fmtDate(m.createdAt)}${m.expiresAt ? ' → ' + fmtDate(m.expiresAt) : ''}</span>
                </div>
                <div class="am-nums">
                    <span><b>${num(m.sentCount)}</b> sent</span><span><b>${num(m.seenCount)}</b> seen</span><span><b>${num(m.waiting)}</b> waiting</span>
                    ${m.kind === 'poll' ? `<span><b>${num(m.answered)}</b> answered</span><span><b>${num(m.dismissed)}</b> closed</span>` : ''}
                    <span class="am-bar" title="seen of sent"><i style="width:${m.sentCount ? Math.round(100 * m.seenCount / m.sentCount) : 0}%"></i></span>
                </div>
            </div>
            <div class="am-item-btns">
                ${m.kind === 'poll' ? '<button type="button" class="btn small-btn" data-act="results">📊 Results</button>' : ''}
                <button type="button" class="btn small-btn btn-secondary" data-act="preview">👁 Preview</button>
                <button type="button" class="btn small-btn btn-secondary" data-act="edit">✏️ Edit</button>
                <button type="button" class="btn small-btn btn-secondary" data-act="more">➕ Send to more</button>
                <button type="button" class="btn small-btn btn-secondary" data-act="copy">⧉ Copy</button>
                <button type="button" class="btn small-btn btn-secondary" data-act="pause">${m.active ? '⏸ Pause' : '▶ Resume'}</button>
                <button type="button" class="btn small-btn btn-danger" data-act="delete">🗑 Delete</button>
            </div>
            <div class="am-panel" hidden></div>
        </div>`;
    }
    async function loadList() {
        const box = root.querySelector('.am-list');
        try {
            const data = await api('notices');
            list = data.messages;
            if (list.some(m => m.giftId != null)) loadGameAssetIndex().then(() => { box.innerHTML = list.map(itemHtml).join(''); }).catch(() => {});
            box.innerHTML = list.length ? list.map(itemHtml).join('') : '<div class="message info">Nothing sent yet.</div>';
        } catch (err) { box.innerHTML = `<div class="message error">${esc(err.message)}</div>`; }
    }

    async function results(m, panel) {
        panel.innerHTML = '<div class="loading">Loading…</div>';
        const r = await api(`notices/${m.id}/results`);
        const opts = (r.message.poll && r.message.poll.options) || [];
        let who = 'all';
        const draw = () => {
            const counts = r.counts[who], people = r.people[who];
            const max = Math.max(1, ...counts);
            panel.innerHTML = `
                <div class="am-res-head">
                    <div class="am-seg am-res-who">${[['all', 'All'], ['student', 'Students'], ['teacher', 'Teachers']].map(([k, l]) => `<button type="button" class="am-seg-btn${k === who ? ' on' : ''}" data-who="${k}">${l} (${num(r.people[k])})</button>`).join('')}</div>
                    <span class="am-muted">${num(r.dismissed)} closed without answering · ${num(r.message.waiting)} not seen yet${r.message.poll && r.message.poll.multiple ? ' · several answers allowed' : ''}</span>
                </div>
                ${opts.map((o, i) => `<div class="am-res-row">
                    <span class="am-res-label">${esc(o)}</span>
                    <span class="am-res-track"><i style="width:${Math.round(100 * counts[i] / max)}%"></i></span>
                    <span class="am-res-n"><b>${num(counts[i])}</b> ${people ? `(${Math.round(100 * counts[i] / people)}%)` : ''}</span>
                </div>`).join('')}
                ${r.others.length ? `<details class="am-res-other" ${opts.length ? '' : 'open'}><summary>Written answers (${num(r.others.length)})</summary>
                    <ul>${r.others.filter(o => who === 'all' || o.accType === who).map(o => `<li><span>${esc(o.text)}</span><small>${esc(o.accType)} · ${fmtDate(o.at)}</small></li>`).join('')}</ul></details>` : ''}
                <div class="am-res-foot"><button type="button" class="btn small-btn btn-secondary am-csv">⬇ CSV (with e-mails)</button></div>`;
            panel.querySelector('.am-res-who').addEventListener('click', e => { const b = e.target.closest('[data-who]'); if (b) { who = b.dataset.who; draw(); } });
            panel.querySelector('.am-csv').addEventListener('click', () => csv(m));
        };
        draw();
    }
    async function csv(m) {
        const r = await api(`notices/${m.id}/results?full=1`);
        const opts = (r.message.poll && r.message.poll.options) || [];
        const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const lines = [['user id', 'e-mail', 'nickname', 'account', 'answer', 'written', 'time'].map(cell).join(',')]
            .concat(r.rows.map(a => [a.userId, a.email, a.nickname, a.accType, (a.choices || []).length ? a.choices.map(c => opts[c]).join(' | ') : (a.other ? '' : '(closed)'), a.other || '', new Date(a.at).toISOString()].map(cell).join(',')));
        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `poll-${m.id}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    // the list's short text: a picture line as 🖼, at most 180 characters
    function shortBody(body) {
        const text = String(body || '').split('\n').map(l => (SudeduNotices.IMAGE_LINE.test(l.trim()) ? '🖼' : l)).join('\n');
        return text.length > 180 ? text.slice(0, 180) + '…' : text;
    }
    function editPanel(m, panel) {
        panel.innerHTML = `
            <div class="form-group"><label>Title</label><input class="am-e-title" maxlength="120" value="${esc(m.title)}"></div>
            ${m.layout ? `<div class="form-group"><label>The card</label><div class="am-e-designer"></div>
                <small class="am-muted">Users who have not seen it yet get the new card${m.kind === 'poll' ? ' (the answers stay as they are)' : ''}.</small></div>`
            : `<div class="form-group"><label>${m.kind === 'poll' ? 'Question' : 'Message'}</label><div class="am-e-text"></div>
                <small class="am-muted">Users who have not seen it yet get the new text${m.kind === 'poll' ? ' (the answers stay as they are)' : ''}.</small></div>`}
            <div class="am-dates">
                <div class="form-group"><label>Show from</label><input type="datetime-local" class="am-e-starts" value="${localInput(m.startsAt)}"></div>
                <div class="form-group"><label>Until</label><input type="datetime-local" class="am-e-ends" value="${localInput(m.expiresAt)}"></div>
            </div>
            ${NEW_OF[m.audience && m.audience.type] ? `<label class="am-check"><input type="checkbox" class="am-e-new" ${m.forNewAccounts ? 'checked' : ''}> Also ${NEW_OF[m.audience.type]} created while it is active</label>` : ''}
            <div class="am-e-out"></div>
            <div class="am-actions"><button type="button" class="btn small-btn btn-secondary am-e-cancel">Cancel</button><button type="button" class="btn small-btn am-e-save">Save</button></div>`;
        const designer = m.layout ? MessageDesigner.create(panel.querySelector('.am-e-designer'), m.layout) : null;
        const text = m.layout ? null : MessageText.create(panel.querySelector('.am-e-text'), m.body);
        panel.querySelector('.am-e-cancel').addEventListener('click', () => { panel.hidden = true; });
        panel.querySelector('.am-e-save').addEventListener('click', async () => {
            const v = s => panel.querySelector(s).value;
            if (designer && !designer.get()) { panel.querySelector('.am-e-out').innerHTML = '<div class="message error">The card is empty.</div>'; return; }
            const body = {
                title: v('.am-e-title').trim(), ...(designer ? { layout: designer.get(), body: '' } : { body: text.get() }),
                startsAt: v('.am-e-starts') ? new Date(v('.am-e-starts')).toISOString() : null,
                expiresAt: v('.am-e-ends') ? new Date(v('.am-e-ends')).toISOString() : null
            };
            const nb = panel.querySelector('.am-e-new');
            if (nb) body.forNewAccounts = nb.checked;
            try { await api(`notices/${m.id}`, { method: 'PATCH', body }); loadList(); }
            catch (err) { panel.querySelector('.am-e-out').innerHTML = `<div class="message error">${esc(err.message)}</div>`; }
        });
    }
    function morePanel(m, panel) {
        panel.innerHTML = `<p class="am-muted">Send it to more users – those who still have it waiting${m.kind === 'poll' ? ' or have answered' : ''} are skipped.</p><div class="am-more-slot"></div><div class="am-e-out"></div>
            <div class="am-actions"><button type="button" class="btn small-btn btn-secondary am-e-cancel">Cancel</button><button type="button" class="btn small-btn am-e-save">Send to them</button></div>`;
        let recount = () => {};
        const picker = audiencePicker(() => recount(), { allowNew: false });
        recount = countInto(picker);
        picker.set('users');
        panel.querySelector('.am-more-slot').appendChild(picker.el);
        panel.querySelector('.am-e-cancel').addEventListener('click', () => { panel.hidden = true; });
        panel.querySelector('.am-e-save').addEventListener('click', async () => {
            const a = picker.value();
            if ((a.type === 'users' || a.type === 'class') && !a.ids.length) return;
            try {
                const r = await api(`notices/${m.id}/recipients`, { method: 'POST', body: { audience: a } });
                panel.querySelector('.am-e-out').innerHTML = `<div class="message success">Added ${num(r.added)}.</div>`;
                setTimeout(loadList, 900);
            } catch (err) { panel.querySelector('.am-e-out').innerHTML = `<div class="message error">${esc(err.message)}</div>`; }
        });
    }
    async function onListClick(e) {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        const itemEl = b.closest('.am-item');
        const m = list.find(x => x.id === Number(itemEl.dataset.id));
        const panel = itemEl.querySelector('.am-panel');
        const act = b.dataset.act;
        const toggle = fill => {
            if (!panel.hidden && panel.dataset.act === act) { panel.hidden = true; return; }
            panel.dataset.act = act;
            panel.hidden = false;
            Promise.resolve(fill(m, panel)).catch(err => { panel.innerHTML = `<div class="message error">${esc(err.message)}</div>`; });
        };
        try {
            if (act === 'preview') preview(m);
            else if (act === 'results') toggle(results);
            else if (act === 'edit') toggle(editPanel);
            else if (act === 'more') toggle(morePanel);
            else if (act === 'copy') copyIntoForm(m);
            else if (act === 'pause') { await api(`notices/${m.id}`, { method: 'PATCH', body: { active: !m.active } }); loadList(); }
            else if (act === 'delete') {
                if (!confirm(`Delete "${m.title}"?\nIt disappears for the ${num(m.waiting)} users who have not seen it yet${m.kind === 'poll' ? ', and its answers are deleted' : ''}.`)) return;
                await api(`notices/${m.id}`, { method: 'DELETE' });
                loadList();
            }
        } catch (err) { alert(err.message); }
    }

    // ------------------------------------------------------------ mount
    function mount() {
        if (mounted) { loadList(); return; }
        root = document.getElementById('notices-app');
        if (!root) return;
        mounted = true;
        root.innerHTML = formHtml();
        state.text = MessageText.create(root.querySelector('.am-text-part'), '', { placeholder: 'Sveiki! …' });
        let recount = () => {};
        state.audience = audiencePicker(() => recount());
        recount = countInto(state.audience);
        root.querySelector('.am-aud-slot').appendChild(state.audience.el);
        recount();
        drawOptions();
        root.querySelector('.am-kind').addEventListener('click', e => { const b = e.target.closest('[data-kind]'); if (b) setKind(b.dataset.kind); });
        root.querySelector('.am-look').addEventListener('click', e => { const b = e.target.closest('[data-look]'); if (b) setLook(b.dataset.look); });
        root.querySelector('.am-options').addEventListener('input', e => { const i = e.target.dataset.i; if (i != null) state.options[i] = e.target.value; });
        root.querySelector('.am-options').addEventListener('click', e => { const b = e.target.closest('.am-opt-del'); if (b) { state.options.splice(Number(b.dataset.i), 1); drawOptions(); } });
        root.querySelector('.am-options').addEventListener('keydown', e => {
            if (e.key === 'Enter' && e.target.classList.contains('am-opt-input')) {
                e.preventDefault();
                const i = Number(e.target.dataset.i);
                if (i === state.options.length - 1 && state.options.length < 12) { state.options.push(''); drawOptions(); }
                root.querySelector(`.am-opt-input[data-i="${i + 1}"]`)?.focus();
            }
        });
        root.querySelector('.am-opt-add').addEventListener('click', () => {
            if (state.options.length >= 12) return;
            state.options.push('');
            drawOptions();
            root.querySelector(`.am-opt-input[data-i="${state.options.length - 1}"]`).focus();
        });
        root.querySelector('.am-gift').addEventListener('click', e => {
            if (e.target.closest('.am-gift-add')) chooseGift();
            else if (e.target.closest('.am-gift-remove')) { state.gift = null; drawGift(); }
        });
        root.querySelector('.am-gift').addEventListener('input', e => { if (e.target.classList.contains('am-gift-qty') && state.gift) state.gift.qty = parseInt(e.target.value) || 1; });
        root.querySelector('.am-preview').addEventListener('click', () => {
            const { notice, error } = readForm({ preview: true });
            if (error) { say(esc(error)); return; }
            say('');
            preview(notice);
        });
        root.querySelector('.am-send').addEventListener('click', send);
        root.querySelector('.am-reload').addEventListener('click', loadList);
        root.querySelector('.am-list').addEventListener('click', onListClick);
        setKind('message');
        loadList();
    }
    // from a user's card: a message to that user
    function composeFor(user) {
        const btn = [...document.querySelectorAll('.tab-btn')].find(b => /showTab\('messages'/.test(b.getAttribute('onclick') || ''));
        if (btn) btn.click();
        mount();
        state.audience.set('users', [user]);
        state.text.focus();
        root.querySelector('.am-compose').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const style = document.createElement('style');
    style.textContent = `
        .am-compose-head,.am-sent-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
        .am-compose-head h3,.am-sent-head h3{margin:0}
        .am-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        @media (max-width:900px){.am-grid{grid-template-columns:1fr}}
        .am-muted{color:rgba(0,0,0,.55);font-size:13px;font-weight:400}
        .am-seg{display:inline-flex;flex-wrap:wrap;gap:4px;padding:4px;border-radius:14px;background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.35)}
        .am-seg-btn{border:none;background:transparent;padding:7px 12px;border-radius:10px;font:inherit;font-size:14px;font-weight:600;color:rgba(0,0,0,.65);cursor:pointer}
        .am-seg-btn.on{background:rgba(255,255,255,.85);color:rgba(0,0,0,.9);box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .am-people{margin-top:10px}
        .am-find{position:relative}
        .am-suggest{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 4px);background:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.15);max-height:300px;overflow:auto;padding:4px}
        .am-sug{display:block;width:100%;text-align:left;border:none;background:none;padding:8px 10px;border-radius:10px;font:inherit;font-size:14px;cursor:pointer}
        .am-sug:hover{background:rgba(50,136,172,.1)}
        .am-sug span{color:rgba(0,0,0,.6)}
        .am-sug small,.am-chip small{color:rgba(0,0,0,.45)}
        .am-sug-none{padding:8px 10px;color:rgba(0,0,0,.5);font-size:14px}
        .am-hint{font-size:13px;color:rgba(0,0,0,.6);margin:6px 2px 0;min-height:1em}
        .am-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .am-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 6px 4px 10px;border-radius:999px;background:rgba(255,255,255,.7);font-size:13px}
        .am-chip button{border:none;background:rgba(0,0,0,.08);width:20px;height:20px;border-radius:50%;cursor:pointer;line-height:1}
        .am-clear{border:none;background:none;color:#721c24;font:inherit;font-size:13px;cursor:pointer;text-decoration:underline}
        .am-check{display:flex!important;align-items:center;gap:8px;font-weight:500!important;margin:8px 0 0!important;cursor:pointer}
        .am-check input{width:auto}
        .am-check[hidden]{display:none!important}
        .am-count{margin-top:10px;font-size:14px;color:rgba(0,0,0,.75)}
        .am-opt{display:flex;align-items:center;gap:8px;margin-bottom:6px}
        .am-opt-n{width:22px;text-align:right;color:rgba(0,0,0,.5)}
        .am-opt-input{padding:9px 14px}
        .am-opt-del{border:none;background:rgba(0,0,0,.08);width:28px;height:28px;flex:none;border-radius:50%;cursor:pointer;font-size:16px}
        .am-poll-flags{margin-top:6px}
        .am-gift{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .am-gift-card{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px;border-radius:14px;background:rgba(255,255,255,.35)}
        .am-gift-card .item-preview-holder{width:64px;height:64px}
        .am-gift-text{display:flex;flex-direction:column}
        .am-qty{display:flex!important;align-items:center;gap:6px;margin:0!important}
        .am-qty input{width:76px;padding:8px 10px}
        .am-dates{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .am-look-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px}
        .am-look-row label{margin:0}
        .am-designer{margin:6px 0 14px}
        .am-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:8px}
        .am-item{padding:14px;border-radius:14px;background:rgba(255,255,255,.3);margin-bottom:12px}
        .am-item-top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .am-item-title{font-size:16px}
        .am-kind-tag{font-size:12px;font-weight:700;color:rgba(0,0,0,.6)}
        .am-status{font-size:12px;font-weight:700;padding:2px 9px;border-radius:999px}
        .am-status.live{background:rgba(34,197,94,.2);color:#155724}
        .am-status.paused{background:rgba(234,179,8,.25);color:#7a5b00}
        .am-status.scheduled{background:rgba(59,130,246,.2);color:#0c4a6e}
        .am-status.ended{background:rgba(0,0,0,.08);color:rgba(0,0,0,.55)}
        .am-item-body{margin:6px 0;color:rgba(0,0,0,.75);white-space:pre-line;font-size:14px}
        .am-item-meta,.am-nums{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13px;color:rgba(0,0,0,.65)}
        .am-nums{margin-top:6px;align-items:center}
        .am-bar{display:inline-block;width:110px;height:6px;border-radius:3px;background:rgba(0,0,0,.08);overflow:hidden}
        .am-bar i{display:block;height:100%;background:#3288AC}
        .am-item-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
        .am-item-btns .btn{padding:6px 12px;font-size:13px}
        .am-panel{margin-top:12px;padding:12px;border-radius:12px;background:rgba(255,255,255,.45)}
        .am-res-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}
        .am-res-row{display:grid;grid-template-columns:minmax(120px,2fr) 3fr auto;gap:10px;align-items:center;margin:6px 0;font-size:14px}
        .am-res-track{height:12px;border-radius:6px;background:rgba(0,0,0,.07);overflow:hidden}
        .am-res-track i{display:block;height:100%;background:linear-gradient(90deg,#3288AC,#286D8A)}
        .am-res-n{white-space:nowrap}
        .am-res-other{margin-top:10px}
        .am-res-other summary{cursor:pointer;font-weight:600}
        .am-res-other ul{list-style:none;margin:8px 0 0;padding:0;max-height:320px;overflow:auto}
        .am-res-other li{display:flex;justify-content:space-between;gap:12px;padding:6px 8px;border-bottom:1px solid rgba(0,0,0,.06);font-size:14px}
        .am-res-other li small{color:rgba(0,0,0,.45);white-space:nowrap}
        .am-res-foot{margin-top:10px}
        .old-gifts summary{cursor:pointer;font-weight:600}
    `;
    document.head.appendChild(style);

    window.AdminMessages = { mount, composeFor };
})();
