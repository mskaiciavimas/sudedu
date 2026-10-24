/* Admin page → "📰 Naujienos": the news on the site's front page (LT/index.html, the list messagesToUsers). The server
 * reads them from the site's GitHub repository and commits each change there (utils/siteNews.js) - GitHub Pages shows
 * the new list about a minute later. Nothing is kept in the database.
 *
 * Each news item: a title (the pop-up's heading), the text on the board, the full text in the pop-up (both HTML), a date
 * and who sees it (everyone, teachers, students). New items go to the top; ↑ ↓ change the order the board shows.
 * Every change is sent on its own with the page's version: if the page changed on GitHub meanwhile (e.g. a push), the
 * change is refused and the list is to be reloaded. */
(function () {
    'use strict';
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const MONTHS = ['Saus.', 'Vas.', 'Kov.', 'Bal.', 'Geg.', 'Birž.', 'Liep.', 'Rugp.', 'Rugs.', 'Spal.', 'Lap.', 'Gruod.'];
    const WHO = [['all', 'Visi', ['all']], ['teacher', 'Mokytojai', ['teacher']], ['student', 'Mokiniai', ['student']], ['both', 'Mokytojai ir mokiniai', ['student', 'teacher']]];
    const whoKey = target => (target.includes('all') ? 'all' : target.includes('teacher') && target.includes('student') ? 'both' : target[0] || 'all');
    const whoName = target => WHO.find(w => w[0] === whoKey(target))[1];
    const boardDate = d => { const [y, m, day] = String(d).split('-').map(Number); return m ? `${MONTHS[m - 1]} ${day}` : d; };
    const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

    let root = null, state = { news: [], sha: null, busy: false };

    async function api(method, body) {
        let res;
        try {
            res = await apiFetch(`${apiBase}admin/news`, body ? { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { method });
        } catch { res = null; }
        const data = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) { const e = new Error(data.message || 'The server could not be reached'); e.status = res && res.status; throw e; }
        return data;
    }
    function say(text, type = 'error', reload = false) {
        const box = root.querySelector('.nw-msg');
        box.innerHTML = text ? `<div class="message ${type}">${esc(text)}${reload ? ' <button type="button" class="btn small-btn nw-reload2">🔄 Reload the news</button>' : ''}</div>` : '';
    }

    async function load() {
        say('');
        root.querySelector('.nw-list').innerHTML = '<div class="loading">Loading from GitHub…</div>';
        try {
            const r = await api('GET');
            state.news = r.news; state.sha = r.sha;
            draw();
        } catch (err) {
            root.querySelector('.nw-list').innerHTML = '';
            say(`The news could not be loaded: ${err.message}`);
        }
    }
    // one change → the new list (or the error, nothing changed)
    async function change(op, extra, done) {
        if (state.busy) return false;
        state.busy = true;
        root.classList.add('busy');
        say('Saving to GitHub…', 'info');
        try {
            const r = await api('POST', { op, sha: state.sha, ...extra });
            state.news = r.news; state.sha = r.sha;
            draw();
            say(`${done} The front page shows it in about a minute.`, 'success');
            return true;
        } catch (err) {
            say(`Not saved: ${err.message}`, 'error', err.status === 409);
            return false;
        } finally {
            state.busy = false;
            root.classList.remove('busy');
        }
    }

    function draw() {
        const list = root.querySelector('.nw-list');
        if (!state.news.length) { list.innerHTML = '<div class="am-muted">No news.</div>'; return; }
        list.innerHTML = state.news.map((n, i) => `
            <div class="nw-item" data-i="${i}">
                <div class="nw-board"><div class="nw-board-text">${n.text}</div><div class="nw-board-date">${esc(boardDate(n.date))}</div></div>
                <div class="nw-meta"><b>${esc(n.title)}</b><span class="nw-chip">${esc(whoName(n.target))}</span><span>${esc(n.date)}</span></div>
                <div class="nw-btns">
                    <button type="button" class="btn small-btn btn-secondary" data-a="view">👁 Pop-up</button>
                    <button type="button" class="btn small-btn btn-secondary" data-a="edit">✏️ Edit</button>
                    <button type="button" class="btn small-btn btn-secondary" data-a="up" ${i === 0 ? 'disabled' : ''} title="Higher on the board">↑</button>
                    <button type="button" class="btn small-btn btn-secondary" data-a="down" ${i === state.news.length - 1 ? 'disabled' : ''} title="Lower on the board">↓</button>
                    <button type="button" class="btn small-btn nw-del" data-a="del">🗑 Delete</button>
                </div>
                <div class="nw-edit" hidden></div>
            </div>`).join('');
    }

    // the form for a new item or an existing one (into `box`)
    function form(box, n, onSave) {
        const item = n || { title: '', text: '', fullText: '', date: today(), target: ['all'] };
        box.hidden = false;
        box.innerHTML = `
            <div class="form-group"><label>Title <span class="am-muted">(the pop-up's heading)</span></label><input class="nw-f-title" maxlength="200" value="${esc(item.title)}"></div>
            <div class="form-group"><label>Text on the board <span class="am-muted">(short; HTML works, e.g. &lt;b&gt;…&lt;/b&gt;, &lt;a href="apie.html"&gt;…&lt;/a&gt;)</span></label>
                <textarea class="nw-f-text" rows="2" maxlength="3000">${esc(item.text)}</textarea></div>
            <div class="form-group"><label>Full text in the pop-up <span class="am-muted">(HTML)</span></label>
                <div class="nw-tools">${[['b', '<b>B</b>'], ['i', '<i>I</i>'], ['a', '🔗 Link'], ['ul', '• List'], ['br', '↵ New line'], ['img', '🖼 Picture']].map(([t, s]) => `<button type="button" class="nw-tool" data-t="${t}">${s}</button>`).join('')}</div>
                <textarea class="nw-f-full" rows="7" maxlength="30000">${esc(item.fullText.replace(/^\s*\n|\n\s*$/g, ''))}</textarea></div>
            <div class="nw-row">
                <div class="form-group"><label>Date</label><input type="date" class="nw-f-date" value="${esc(item.date)}"></div>
                <div class="form-group"><label>Who sees it</label><select class="nw-f-who">${WHO.map(([k, name]) => `<option value="${k}"${whoKey(item.target) === k ? ' selected' : ''}>${name}</option>`).join('')}</select></div>
            </div>
            <div class="nw-preview-label am-muted">On the board:</div>
            <div class="nw-board nw-live"></div>
            <div class="am-actions"><button type="button" class="btn small-btn btn-secondary nw-f-cancel">Cancel</button><button type="button" class="btn small-btn btn-secondary nw-f-view">👁 Pop-up</button><button type="button" class="btn small-btn nw-f-save">Save</button></div>`;
        const $ = s => box.querySelector(s);
        const read = () => ({ title: $('.nw-f-title').value.trim(), text: $('.nw-f-text').value.trim(), fullText: $('.nw-f-full').value, date: $('.nw-f-date').value, target: WHO.find(w => w[0] === $('.nw-f-who').value)[2] });
        const live = () => { const v = read(); $('.nw-live').innerHTML = `<div class="nw-board-text">${v.text || '<span class="am-muted">(the text on the board)</span>'}</div><div class="nw-board-date">${esc(boardDate(v.date))}</div>`; };
        box.addEventListener('input', live);
        live();
        // the small HTML helpers: wrap the selection (or insert)
        $('.nw-tools').addEventListener('click', async e => {
            const b = e.target.closest('.nw-tool');
            if (!b) return;
            const ta = $('.nw-f-full'), s = ta.selectionStart, en = ta.selectionEnd, sel = ta.value.slice(s, en);
            // a picture (uploaded to / picked from the site's images/messages, like the messages' pictures): centred, 70% wide -
            // its width / place can be changed in the HTML (style="width:…")
            if (b.dataset.t === 'img') {
                const p = await MessageImages.pick();
                if (!p) return;
                const width = p.w && p.h && p.h > p.w * 1.3 ? 45 : 70;
                ta.setRangeText(`\n<div style="text-align:center;margin:10px 0">${SudeduNotices.imageTag(p.name, `style="width:${width}%;max-width:100%;height:auto;border-radius:10px"`)}</div>\n`, s, en, 'end');
                ta.focus();
                ta.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            let ins;
            if (b.dataset.t === 'b' || b.dataset.t === 'i') ins = `<${b.dataset.t}>${sel || 'tekstas'}</${b.dataset.t}>`;
            else if (b.dataset.t === 'a') { const url = prompt('Link address (e.g. apie.html#zaidimai or https://…):', 'https://'); if (!url) return; ins = `<a href="${url}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${sel || 'čia'}</a>`; }
            else if (b.dataset.t === 'ul') ins = `<ul>\n${(sel || 'pirmas\nantras').split('\n').map(l => `<li>${l}</li>`).join('\n')}\n</ul>`;
            else ins = '<br>\n';
            ta.setRangeText(ins, s, en, 'end');
            ta.focus();
        });
        $('.nw-f-view').addEventListener('click', () => { const v = read(); openObjectPopup(v.fullText || v.text, v.title, v.date); });
        $('.nw-f-cancel').addEventListener('click', () => { box.hidden = true; box.innerHTML = ''; });
        $('.nw-f-save').addEventListener('click', async () => {
            const v = read();
            if (!v.title) return say('Add a title.');
            if (!v.text) return say('Add the text on the board.');
            if (!v.date) return say('Choose the date.');
            if (await onSave(v)) { box.hidden = true; box.innerHTML = ''; }
        });
        $('.nw-f-title').focus();
    }

    function onListClick(e) {
        const b = e.target.closest('[data-a]');
        if (!b || state.busy) return;
        const el = b.closest('.nw-item'), i = Number(el.dataset.i), n = state.news[i];
        const a = b.dataset.a;
        if (a === 'view') openObjectPopup(n.fullText || n.text, n.title, n.date);
        else if (a === 'edit') form(el.querySelector('.nw-edit'), n, v => change('edit', { index: i, item: v }, `"${v.title}" saved.`));
        else if (a === 'up' || a === 'down') change('move', { index: i, to: a === 'up' ? i - 1 : i + 1 }, 'Order saved.');
        else if (a === 'del' && confirm(`Delete "${n.title}" from the front page?`)) change('delete', { index: i }, `"${n.title}" deleted.`);
    }

    let mounted = false;
    function mount() {
        root = document.getElementById('news-app');
        if (!root) return;
        if (mounted) { load(); return; }
        mounted = true;
        root.innerHTML = `
            <div class="user-card nw">
                <div class="nw-head">
                    <button type="button" class="btn nw-new">＋ New news item</button>
                    <button type="button" class="btn small-btn btn-secondary nw-reload">🔄 Reload</button>
                    <span class="am-muted">Saved into LT/index.html on GitHub - the front page shows changes in about a minute.</span>
                </div>
                <div class="nw-new-form nw-edit" hidden></div>
                <div class="nw-msg"></div>
                <div class="nw-list"></div>
            </div>`;
        root.querySelector('.nw-new').addEventListener('click', () => form(root.querySelector('.nw-new-form'), null, v => change('add', { item: v }, `"${v.title}" added.`)));
        root.querySelector('.nw-reload').addEventListener('click', load);
        root.addEventListener('click', e => { if (e.target.closest('.nw-reload2')) load(); });
        root.querySelector('.nw-list').addEventListener('click', onListClick);
        load();
    }

    const style = document.createElement('style');
    style.textContent = `
        .nw-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
        .nw-head .btn{margin:0}
        .nw.busy .nw-list,.nw.busy .nw-edit{opacity:.6;pointer-events:none}
        .nw-item{padding:12px;border-radius:14px;background:rgba(255,255,255,.3);margin-bottom:10px}
        .nw-board{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:10px 14px;border-radius:12px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.08);font-size:15px;line-height:1.45}
        .nw-board-text{flex:1;min-width:0;overflow-wrap:anywhere}
        .nw-board-date{flex:none;font-size:13px;color:rgba(0,0,0,.5);white-space:nowrap}
        .nw-board .fake-link{color:#286D8A;text-decoration:underline}
        .nw-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 2px 0;font-size:14px;color:rgba(0,0,0,.7)}
        .nw-chip{font-size:12px;font-weight:700;padding:2px 9px;border-radius:999px;background:rgba(50,136,172,.15);color:#1d5f7a}
        .nw-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .nw-btns .btn{padding:5px 11px;font-size:13px;margin:0}
        .nw-btns .nw-del{background:rgba(179,38,30,.12);color:#8a1c14}
        .nw-edit{margin-top:12px;padding:12px;border-radius:12px;background:rgba(255,255,255,.55)}
        .nw-new-form{margin:0 0 12px}
        .nw-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .nw-tools{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px}
        .nw-tool{border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.8);border-radius:8px;padding:3px 9px;font:inherit;font-size:13px;cursor:pointer}
        .nw-preview-label{margin:4px 0}
        .nw-msg .message{margin:0 0 10px}
        .nw-msg .message.info{background:rgba(50,136,172,.12);color:#1d5f7a}
    `;
    document.head.appendChild(style);

    window.AdminNews = { mount };
})();
