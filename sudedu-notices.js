/* SUDEDU messages and polls from the admin (admin page → "💌 Messages"; server: /notices, utils/notices.js).
 *
 * On the site's pages a signed-in user's waiting messages are shown one after another in the site's own pop-up
 * (openObjectPopup, mental-arithmetic.js) - those meant for this page and those for "any page". A message is done (and
 * its gift added to the pet game, on the server) the moment it is shown; a poll when it is answered, or closed when it
 * may be closed (a poll that must be answered has no close button and comes back until it is answered).
 * The pet room passes window.sudeduNoticesReady (resolves when its room is loaded) and window.sudeduGiftReceived (puts
 * a gift the server just added into the open room). Nothing is shown during an admin's simulation of a user.
 * SudeduNotices.preview(notice) shows a notice as users will see it, without the server (the admin page).
 * A designed message (notice.layout) is a card with text blocks and pictures placed freely (made on the admin page with
 * admin-message-designer.js, which draws it with the same layoutHtml / itemHtml): positions and sizes are % of the
 * card, text sizes px at the card's design width (container query units), so the card scales to any screen as one
 * picture. A plain message may have pictures between its lines: a line [[img:<file>|<width %>]] (formatBody).
 * Pictures are files in the site's images/messages/ (committed there by the server through the GitHub API) and come from
 * GitHub Pages; for the minute after an upload, before Pages has published a new one, from GitHub's raw file server. */
(function () {
    'use strict';
    const PAGES = ['index', 'uzduotys', 'augintiniai', 'klase', 'veiksmai', 'rasyba', 'teksto-suvokimas', 'apie'];
    const EMPTY_KEY = 'sudeduNoticesEmpty';   // sessionStorage: { page: time } of the last check that found nothing
    const RECHECK_MS = 5 * 60 * 1000;
    const pageName = (location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/i, '') || 'index';

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // the admin's text: new lines, **bold**, links (www… / http…); everything else as plain text
    function formatText(text) {
        return esc(text)
            .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
            .replace(/(^|[\s(])((?:https?:\/\/|www\.)[^\s<)]+)/g, (m, pre, url) => `${pre}<a href="${url.startsWith('www.') ? 'https://' + url : url}" target="_blank" rel="noopener">${url}</a>`)
            .replace(/\n/g, '<br>');
    }

    // the admin's text with pictures: a line [[img:<file>|<width %>]] is a picture of its own, as wide as that share of the
    // text - centred, or on the left / right with |left / |right after the width; the other lines as formatText
    const IMAGE_LINE = /^\[\[img:([\w.-]+)\|(\d{1,3})(?:\|(left|center|right))?\]\]$/;
    function formatBody(text) {
        const lines = String(text ?? '').split('\n');
        let out = '';
        lines.forEach((line, i) => {
            const m = line.trim().match(IMAGE_LINE);
            if (m) { out += `<span class="sn-img-line" style="text-align:${m[3] || 'center'}">${imageTag(m[1], `class="sn-img" style="width:${Math.max(10, Math.min(100, Number(m[2])))}%"`)}</span>`; return; }
            out += formatText(line);
            const next = lines[i + 1];
            if (next !== undefined && !IMAGE_LINE.test(next.trim())) out += '<br>';
        });
        return out;
    }

    // ------------------------------------------------------------ pictures (the site's images/messages on GitHub)
    const IMAGES = 'https://www.sudedu.lt/images/messages/';
    const IMAGES_RAW = 'https://raw.githubusercontent.com/mskaiciavimas/sudedu/main/images/messages/';
    const imageUrl = name => IMAGES + encodeURIComponent(name);
    const imageRawUrl = name => IMAGES_RAW + encodeURIComponent(name);
    // an <img> of a message picture: if the site doesn't have it yet (just uploaded), from the raw file server
    const imageTag = (name, attrs = '') => `<img src="${imageUrl(name)}" alt="" ${attrs} onerror="this.onerror=null;this.src='${imageRawUrl(name)}'">`;

    // ------------------------------------------------------------ a designed card
    const FONTS = {
        base: 'inherit',
        round: "'Nunito','Varela Round','Trebuchet MS',system-ui,sans-serif",
        bold: "'Arial Black','Segoe UI Black','Helvetica Neue',sans-serif",
        hand: "'Comic Sans MS','Comic Neue','Chalkboard SE',cursive",
        pixel: "'Pixelify Sans',monospace"
    };
    const hexA = (hex, a) => { const n = parseInt(String(hex).slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
    // one piece of a card (the editor adds data-i and its own handles around it)
    function itemHtml(it, L, extra = '') {
        const pos = `left:${it.x}%;top:${it.y}%;width:${it.w}%;height:${it.h}%;${it.rot ? `transform:rotate(${it.rot}deg);` : ''}`;
        if (it.t === 'img') {
            return `<div class="sn-it sn-it-img" style="${pos}" ${extra}>${imageTag(String(it.src || ''), `draggable="false" style="object-fit:${it.fit === 'cover' || it.fit === 'contain' ? it.fit : 'fill'};border-radius:${Number(it.radius) || 0}%;opacity:${it.opacity ?? 1}"`)}</div>`;
        }
        const style = [`font-size:calc(${Number(it.size) || 24} / ${L.w} * 100cqw)`, `color:${it.color || '#1f2a30'}`, `font-family:${FONTS[it.font] || 'inherit'}`,
            `font-weight:${it.bold || it.font === 'bold' ? 800 : 400}`, `font-style:${it.italic ? 'italic' : 'normal'}`, `text-align:${it.align || 'center'}`,
            `justify-content:${{ top: 'flex-start', bottom: 'flex-end' }[it.valign] || 'center'}`,
            it.fill ? `background:${hexA(it.fill, it.fillA ?? 0.8)}` : '', it.shadow ? 'text-shadow:0 .06em .14em rgba(0,0,0,.5)' : ''].filter(Boolean).join(';');
        return `<div class="sn-it sn-it-text" style="${pos}${style}" ${extra}><div class="sn-it-txt">${formatText(it.text || '')}</div></div>`;
    }
    function layoutHtml(L) {
        if (L.items.some(it => it.font === 'pixel') && !document.querySelector('link[href*="Pixelify"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap';
            document.head.appendChild(link);
        }
        return `<div class="sn-card" style="aspect-ratio:${L.w}/${L.h};background:${L.bg || '#ffffff'}">${L.items.map(it => itemHtml(it, L)).join('')}</div>`;
    }

    let style = null;
    function injectStyle() {
        if (style) return;
        style = document.createElement('style');
        style.textContent = `
.sn-body{font-size:1.05rem;line-height:1.6;color:#1f2a30;overflow-wrap:anywhere}
.sn-body a{color:#286D8A}
.sn-img-line{display:block;text-align:center;margin:10px 0;line-height:0}
.sn-img{display:inline-block;max-width:100%;height:auto;border-radius:10px}
.sn-gift{display:flex;flex-direction:column;align-items:center;gap:6px;margin:14px 0 4px}
.sn-gift-stage{position:relative;width:120px;height:120px}
.sn-gift-box{position:absolute;inset:0;background:center/contain no-repeat;animation:sn-box-out .3s forwards 1.2s}
.sn-gift-item{position:absolute;inset:10px;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.5);animation:sn-item-in .6s ease-out forwards 1.3s;--unit-size:10px;--pet-size:100px}
.sn-gift-item .item-preview{position:static!important;width:100%!important;height:100%!important;margin:0!important;background-repeat:no-repeat;background-position:center}
.sn-gift-item .item-preview:not(.pet){background-size:contain!important}
.sn-gift.wrapped .sn-gift-box,.sn-gift.wrapped .sn-gift-item{animation:none}
.sn-gift.wrapped .sn-gift-item{opacity:0}
.sn-gift-name{font-weight:600;text-align:center}
.sn-gift-note{font-size:.9rem;color:rgba(0,0,0,.6);text-align:center}
@keyframes sn-box-out{to{opacity:0;transform:scale(.8)}}
@keyframes sn-item-in{0%{opacity:0;transform:scale(.5)}60%{opacity:1;transform:scale(1.15)}80%{transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
.sn-poll{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.sn-opt{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;border:2px solid rgba(50,136,172,.25);background:#fff;cursor:pointer;font:inherit;font-size:1rem;text-align:left;color:#1f2a30;transition:border-color .15s,background .15s}
.sn-opt:hover{border-color:rgba(50,136,172,.6)}
.sn-opt.on{border-color:#3288AC;background:rgba(50,136,172,.1)}
.sn-mark{flex:none;width:18px;height:18px;border:2px solid #3288AC;border-radius:50%;display:inline-flex;align-items:center;justify-content:center}
.sn-poll.multi .sn-mark{border-radius:5px}
.sn-opt.on .sn-mark::after{content:'';width:10px;height:10px;border-radius:inherit;background:#3288AC}
.sn-other{width:100%;box-sizing:border-box;min-height:64px;padding:10px 12px;border-radius:12px;border:2px solid rgba(50,136,172,.25);font:inherit;font-size:1rem;resize:vertical;background:#fff}
.sn-other:focus{outline:none;border-color:#3288AC}
.sn-hint{font-size:.9rem;color:rgba(0,0,0,.55)}
.sn-actions{display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:6px}
.sn-send{padding:10px 22px;border:none;border-radius:12px;background:linear-gradient(135deg,#3288AC,#286D8A);color:#F5F5F7;font:inherit;font-size:1rem;font-weight:600;cursor:pointer}
.sn-send:disabled{opacity:.45;cursor:default}
.sn-error{color:#c0392b;font-size:.9rem}
.sn-thanks{text-align:center;font-size:1.1rem;font-weight:600;margin:10px 0}
.object-popup-overlay.sn-required .object-popup-close{display:none}
.sn-card{position:relative;width:100%;container-type:inline-size;overflow:hidden;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
.sn-it{position:absolute;box-sizing:border-box}
.sn-it-img img{display:block;width:100%;height:100%;user-select:none;-webkit-user-drag:none;pointer-events:none}
.sn-it-text{display:flex;flex-direction:column;padding:.25em .35em;border-radius:.35em;line-height:1.22;overflow-wrap:anywhere;overflow:hidden}
.sn-it-text a{color:inherit;text-decoration:underline}
.sn-card + .sn-poll,.sn-card + .sn-gift{margin-top:14px}
`;
        document.head.appendChild(style);
    }

    // the game items (for a gift's picture) and their pictures' styles - loaded only when a gift is shown
    let assetIndex = null;
    async function loadAssets() {
        if (!assetIndex) {
            assetIndex = (typeof gameAssetIndex !== 'undefined' && gameAssetIndex && Object.keys(gameAssetIndex).length)
                ? gameAssetIndex
                : await fetch('gameAssetIndex.json').then(r => r.json()).catch(() => ({}));
        }
        for (const css of ['pet-game-items.css', 'pet-game-pets.css']) {
            if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(l => (l.getAttribute('href') || '').includes(css))) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '../' + css;
                document.head.appendChild(link);
            }
        }
        return assetIndex;
    }

    function giftHtml(notice, wrapped) {
        const item = (assetIndex || {})[notice.giftId] || {};
        const qty = notice.giftQty > 1 ? ` × ${notice.giftQty}` : '';
        const box = `../images/pet-game/gift-box-${1 + Math.floor(Math.random() * 3)}.png`;
        const where = pageName === 'augintiniai' ? 'Ją rasite savo augintinio kambaryje.' : 'Ją rasite <a href="augintiniai.html">augintinio kambaryje</a>.';
        return `<div class="sn-gift${wrapped ? ' wrapped' : ''}">
            <div class="sn-gift-stage"><div class="sn-gift-box" style="background-image:url('${box}')"></div>
            <div class="sn-gift-item"><div class="item-preview ${esc(item['css-class'] || '')}"></div></div></div>
            <div class="sn-gift-name">${wrapped ? 'Atsakiusiems – dovana 🎁' : `Dovana: ${esc(item.title || 'staigmena')}${qty}`}</div>
            ${wrapped ? '' : `<div class="sn-gift-note">${where}</div>`}
        </div>`;
    }

    // ------------------------------------------------------------ the pop-up
    const overlay = () => document.getElementById('object-popup');
    const popupFree = () => { const o = overlay(); return o && getComputedStyle(o).display === 'none'; };
    const waitFree = () => new Promise(resolve => {
        const check = () => popupFree() ? resolve() : setTimeout(check, 700);
        check();
    });

    // one notice in the pop-up → Promise that resolves when it is done (closed, answered). server = { seen, answer }
    // (the preview passes stand-ins)
    function show(notice, server) {
        injectStyle();
        return new Promise(async resolve => {
            if (notice.giftId != null) await loadAssets();
            const root = document.createElement('div');
            root.className = 'sn-root';
            const poll = notice.kind === 'poll' && notice.poll;
            let done = false;
            const finish = () => { if (done) return; done = true; overlay()?.classList.remove('sn-required'); resolve(); };
            // (the page may put something else into the pop-up: then this notice is over for now)
            const watcher = new MutationObserver(() => { if (!root.isConnected) { watcher.disconnect(); finish(); } });

            // a designed card instead of the text, in a pop-up as wide as the card was designed (or the screen)
            const L = notice.layout && Array.isArray(notice.layout.items) && notice.layout.items.length ? notice.layout : null;
            const bodyHtml = L ? layoutHtml(L) : `<div class="sn-body">${formatBody(notice.body)}</div>`;
            const popupOpts = L ? { width: `min(94vw, ${Math.max(320, L.w + 56)}px)`, maxWidth: '94vw' } : {};
            if (!poll) {
                root.innerHTML = `${bodyHtml}${notice.giftId != null ? giftHtml(notice, false) : ''}`;
                openObjectPopup(root, esc(notice.title), '', finish, true, popupOpts);
                server.seen(notice).then(r => { if (r && r.gift && typeof window.sudeduGiftReceived === 'function') window.sudeduGiftReceived(r.gift, notice); });
            } else {
                const multi = !!poll.multiple;
                root.innerHTML = `${bodyHtml}
                    <div class="sn-poll${multi ? ' multi' : ''}">
                        ${multi ? '<div class="sn-hint">Galite pasirinkti kelis atsakymus.</div>' : ''}
                        ${(poll.options || []).map((o, i) => `<button type="button" class="sn-opt" data-i="${i}" aria-pressed="false"><span class="sn-mark"></span><span>${esc(o)}</span></button>`).join('')}
                        ${poll.other ? `<textarea class="sn-other" maxlength="500" placeholder="${(poll.options || []).length ? 'Kita (įrašykite savo atsakymą)' : 'Įrašykite savo atsakymą'}"></textarea>` : ''}
                        <div class="sn-actions"><span class="sn-error" role="alert"></span><button type="button" class="sn-send" disabled>Atsakyti</button></div>
                    </div>
                    ${notice.giftId != null ? giftHtml(notice, true) : ''}`;
                const picked = new Set();
                const send = root.querySelector('.sn-send');
                const other = root.querySelector('.sn-other');
                const error = root.querySelector('.sn-error');
                const update = () => { send.disabled = !picked.size && !(other && other.value.trim()); };
                root.querySelectorAll('.sn-opt').forEach(b => b.addEventListener('click', () => {
                    const i = Number(b.dataset.i);
                    if (!multi) { picked.clear(); root.querySelectorAll('.sn-opt').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); }); }
                    if (picked.has(i)) picked.delete(i); else picked.add(i);
                    b.classList.toggle('on', picked.has(i));
                    b.setAttribute('aria-pressed', String(picked.has(i)));
                    update();
                }));
                if (other) other.addEventListener('input', update);
                send.addEventListener('click', async () => {
                    send.disabled = true;
                    error.textContent = '';
                    const r = await server.answer(notice, { choices: [...picked].sort((a, b) => a - b), other: other ? other.value.trim() : '' });
                    if (!r || !r.ok) { error.textContent = 'Nepavyko išsiųsti. Bandykite dar kartą.'; send.disabled = false; return; }
                    overlay()?.classList.remove('sn-required');
                    watcher.disconnect();
                    root.innerHTML = `<div class="sn-thanks">Ačiū už atsakymą!</div>${notice.giftId != null ? giftHtml(notice, false) : ''}`;
                    watcher.observe(document.getElementById('object-popup-content') || document.body, { childList: true });
                    if (r.gift && typeof window.sudeduGiftReceived === 'function') window.sudeduGiftReceived(r.gift, notice);
                    if (notice.giftId == null) setTimeout(() => { if (root.isConnected) { closeObjectPopup(); finish(); } }, 1600);
                });
                // closing without answering: allowed only when the poll may be closed (then it does not come back)
                openObjectPopup(root, esc(notice.title), '', () => { if (!done && !root.querySelector('.sn-thanks')) server.seen(notice); finish(); }, true, popupOpts);
                // (the admin's preview keeps its close button)
                if (poll.required && !server.preview) overlay()?.classList.add('sn-required');
            }
            watcher.observe(document.getElementById('object-popup-content') || document.body, { childList: true });
        });
    }

    // ------------------------------------------------------------ the server
    const post = (url, body) => apiFetch(apiBase + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
        .then(r => r && r.ok ? r.json() : null).catch(() => null);
    const SERVER = {
        seen: notice => post(`notices/${notice.id}/seen`),
        answer: (notice, answer) => post(`notices/${notice.id}/answer`, answer)
    };

    function signedIn() {
        try {
            if (localStorage.getItem('sudeduAdminSimulation')) return false;
            const u = JSON.parse(localStorage.getItem('userData') || 'null');
            return !!(u && u.token);
        } catch { return false; }
    }
    function recentlyEmpty() {
        try { const t = JSON.parse(sessionStorage.getItem(EMPTY_KEY) || '{}')[pageName]; return t && Date.now() - t < RECHECK_MS; } catch { return false; }
    }
    function markEmpty(empty) {
        try {
            const all = JSON.parse(sessionStorage.getItem(EMPTY_KEY) || '{}');
            if (empty) all[pageName] = Date.now(); else delete all[pageName];
            sessionStorage.setItem(EMPTY_KEY, JSON.stringify(all));
        } catch { /* (private mode) */ }
    }

    let running = false;
    async function run() {
        if (running || !PAGES.includes(pageName) || !signedIn() || recentlyEmpty()) return;
        if (typeof apiFetch !== 'function' || typeof openObjectPopup !== 'function' || !overlay()) return;
        running = true;
        try {
            if (window.sudeduNoticesReady) await window.sudeduNoticesReady;
            const r = await apiFetch(`${apiBase}notices?page=${encodeURIComponent(pageName)}`);
            if (!r || !r.ok) return;
            const { notices } = await r.json();
            markEmpty(!notices.length);
            for (const notice of notices) {
                await waitFree();
                await show(notice, SERVER);
            }
        } catch (e) {
            console.warn('notices:', e);
        } finally {
            running = false;
        }
    }

    // a preview for the admin page: as users see it, nothing sent
    function preview(notice) {
        return show({ id: 0, title: 'Žinutė nuo SUDEDU', body: '', giftQty: 1, ...notice }, {
            preview: true,
            seen: async () => ({ ok: true }),
            answer: async () => ({ ok: true })
        });
    }

    window.SudeduNotices = { preview, run, formatText, formatBody, layoutHtml, itemHtml, imageUrl, imageRawUrl, imageTag, IMAGE_LINE, injectStyle };
    const start = () => setTimeout(run, 1200);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
