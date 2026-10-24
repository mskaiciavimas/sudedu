/* Admin page → "💌 Messages" → "🎨 Designed card": a free-form editor for a message card (text blocks and pictures,
 * GIFs too, placed anywhere). MessageDesigner.create(container, layout?) → { get() → layout | null, set(layout), focus() }.
 *
 * The card is drawn with SudeduNotices.layoutHtml / itemHtml (sudedu-notices.js) - the same code that shows it to users,
 * so what is seen here is what they get. Positions and sizes are % of the card (it scales to every screen); text sizes
 * are px at the card's width. The layout's shape is checked again on the server (utils/notices.js cleanLayout).
 *
 * Mouse / touch: drag a piece to move it (it snaps to the card's edges and centre and to the other pieces - guide lines
 * show it), the 8 handles resize it (pictures keep their proportions on the corners unless Shift is held), the round
 * handle above turns it (Shift: 15° steps). Double-click a text to type in it. Pictures: "🖼 Picture" (upload one or
 * pick one uploaded before), drop files on the card, or paste one (Ctrl+V). Keys: Delete, arrows (Shift: bigger steps),
 * Ctrl+D duplicate, Ctrl+Z / Ctrl+Y.
 * Pictures go to the site's GitHub repository at once (admin-message-images.js); a picture piece keeps its file name
 * (src) - its width × height are in the name. */
(function () {
    'use strict';
    const PRESETS = [['600x450', 'Landscape 4:3'], ['600x600', 'Square'], ['640x360', 'Wide 16:9'], ['480x640', 'Portrait 3:4'], ['420x740', 'Tall (phone)']];
    const SWATCHES = ['#ffffff', '#fff3d6', '#ffe4ec', '#e6f4ff', '#e8f8e8', '#f3e8ff', '#1f2a30', '#3288AC', '#ff7a59', '#ffd43b', '#51cf66', '#845ef7'];
    const FONTS = [['base', 'Site font'], ['round', 'Rounded'], ['bold', 'Heavy'], ['hand', 'Handwritten'], ['pixel', 'Pixel']];
    const SNAP_PX = 7;                 // snapping distance on the screen
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const kb = n => n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
    const clone = o => JSON.parse(JSON.stringify(o));
    const r2 = v => Math.round(v * 100) / 100;
    const blank = () => ({ v: 1, w: 600, h: 450, bg: '#fff3d6', items: [] });

    function create(container, initial) {
        let L = initial ? clone(initial) : blank();
        let sel = -1, editing = -1, phone = false;
        const undo = [], redo = [];
        container.innerHTML = `
        <div class="md" tabindex="-1">
            <div class="md-bar">
                <button type="button" class="md-btn" data-a="text">＋ Text</button>
                <button type="button" class="md-btn" data-a="pic">🖼 Picture</button>
                <span class="md-sep"></span>
                <label class="md-lab">Card <select class="md-preset">${PRESETS.map(([v, n]) => `<option value="${v}">${n}</option>`).join('')}<option value="custom" hidden>Custom</option></select></label>
                <label class="md-lab">Background <input type="color" class="md-bg"></label>
                <span class="md-sep"></span>
                <button type="button" class="md-btn" data-a="undo" title="Undo (Ctrl+Z)">↶</button>
                <button type="button" class="md-btn" data-a="redo" title="Redo (Ctrl+Y)">↷</button>
                <button type="button" class="md-btn md-phone" data-a="phone" title="How it looks on a phone">📱 Phone view</button>
                <span class="md-weight"></span>
            </div>
            <div class="md-main">
                <div class="md-stage-wrap">
                    <div class="md-stage"></div>
                    <div class="md-height" title="Drag to change the card's height">⇕</div>
                    <div class="md-drop">Drop pictures here</div>
                </div>
                <div class="md-props"></div>
            </div>
            <div class="md-msg" role="status"></div>
        </div>`;
        const root = container.querySelector('.md');
        const stage = root.querySelector('.md-stage'), props = root.querySelector('.md-props'), msg = root.querySelector('.md-msg');
        const say = (text, bad) => { msg.textContent = text || ''; msg.classList.toggle('bad', !!bad); };

        // ---------------- history
        const snapshot = () => JSON.stringify(L);
        let lastSaved = snapshot();
        function commit() {
            const now = snapshot();
            if (now === lastSaved) return;
            undo.push(lastSaved); if (undo.length > 80) undo.shift();
            redo.length = 0;
            lastSaved = now;
        }
        let commitTimer = null;
        const commitSoon = () => { clearTimeout(commitTimer); commitTimer = setTimeout(commit, 450); };
        function travel(from, to) {
            clearTimeout(commitTimer); commit();
            if (!from.length) return;
            to.push(snapshot());
            L = JSON.parse(from.pop());
            lastSaved = snapshot();
            if (sel >= L.items.length) sel = -1;
            editing = -1;
            draw();
        }

        // ---------------- drawing
        const stageRect = () => stage.getBoundingClientRect();
        function draw() {
            SudeduNotices.injectStyle();
            stage.style.aspectRatio = `${L.w} / ${L.h}`;
            stage.style.background = L.bg;
            stage.style.width = phone ? '340px' : `min(100%, ${L.w}px)`;
            stage.innerHTML = L.items.map((it, i) => SudeduNotices.itemHtml(it, L, `data-i="${i}"`)).join('') + '<div class="md-guides"></div>' + selHtml();
            if (editing >= 0) startEditing(editing, true);
            root.querySelector('.md-bg').value = L.bg;
            const preset = `${L.w}x${L.h}`, opt = root.querySelector(`.md-preset option[value="${preset}"]`);
            root.querySelector('.md-preset').value = opt ? preset : 'custom';
            root.querySelector('.md-preset option[value="custom"]').textContent = `Custom ${L.w}×${L.h}`;
            root.querySelector('.md-phone').classList.toggle('on', phone);
            root.querySelector('[data-a="undo"]').disabled = !undo.length;
            root.querySelector('[data-a="redo"]').disabled = !redo.length;
            drawProps();
            weigh();
        }
        // the selection box with its handles (and the turning handle)
        function selHtml() {
            const it = L.items[sel];
            if (!it) return '';
            return `<div class="md-sel" style="left:${it.x}%;top:${it.y}%;width:${it.w}%;height:${it.h}%;${it.rot ? `transform:rotate(${it.rot}deg)` : ''}">
                ${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(d => `<i class="md-h md-h-${d}" data-h="${d}"></i>`).join('')}
                <i class="md-rot" data-h="rot" title="Turn (Shift: 15° steps)"></i></div>`;
        }
        function placeSel() {      // after a move / resize: only the moved piece and the box, not the whole card
            const it = L.items[sel];
            const el = stage.querySelector(`.sn-it[data-i="${sel}"]`), box = stage.querySelector('.md-sel');
            if (!it || !el) return;
            for (const e of [el, box]) {
                if (!e) continue;
                e.style.left = it.x + '%'; e.style.top = it.y + '%'; e.style.width = it.w + '%'; e.style.height = it.h + '%';
                e.style.transform = it.rot ? `rotate(${it.rot}deg)` : '';
            }
        }

        // the downloads a user makes for this card (each picture once; the browser keeps them) - sizes from the library
        let sizesAsked = false;
        function weigh() {
            const names = [...new Set(L.items.filter(it => it.t === 'img').map(it => it.src))];
            if (!sizesAsked && names.some(n => MessageImages.sizeOf(n) == null)) {
                sizesAsked = true;
                MessageImages.list().then(weigh).catch(() => {});
            }
            const sizes = names.map(n => MessageImages.sizeOf(n)).filter(n => n != null);
            const total = sizes.reduce((a, b) => a + b, 0);
            const el = root.querySelector('.md-weight');
            el.textContent = names.length ? `Pictures: ${kb(total)}${sizes.length < names.length ? '+' : ''} per user` : '';
            el.classList.toggle('heavy', total > 1.5 * 1024 * 1024);
            el.title = 'Each user downloads the pictures once (from GitHub Pages; the browser keeps them). Keep it small for phones on mobile data.';
        }

        // ---------------- the properties panel
        function drawProps() {
            const it = L.items[sel];
            if (!it) {
                props.innerHTML = `<div class="md-ptitle">Card</div>
                    <div class="md-row"><span>Background</span><span class="md-sw">${SWATCHES.map(c => `<button type="button" class="md-swatch" data-bg="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</span></div>
                    <div class="md-row"><span>Height</span><input type="range" class="md-hrange" min="150" max="1600" step="10" value="${L.h}"><b>${L.h}</b></div>
                    <p class="md-tip">Click a piece to change it. A picture can fill the whole card (select it → "Fill the card") - a background picture.</p>
                    <p class="md-tip">${L.items.length ? `${L.items.length} piece${L.items.length === 1 ? '' : 's'}` : 'Empty - add a text or a picture.'}</p>`;
                return;
            }
            const common = `
                <div class="md-row md-btns">
                    <button type="button" class="md-mini" data-p="front" title="To the front">⏫</button>
                    <button type="button" class="md-mini" data-p="up" title="One step forward">🔼</button>
                    <button type="button" class="md-mini" data-p="down" title="One step back">🔽</button>
                    <button type="button" class="md-mini" data-p="back" title="To the back">⏬</button>
                    <button type="button" class="md-mini" data-p="cx" title="Centre left-right">↔</button>
                    <button type="button" class="md-mini" data-p="cy" title="Centre up-down">↕</button>
                    <button type="button" class="md-mini" data-p="dup" title="Duplicate (Ctrl+D)">⧉</button>
                    <button type="button" class="md-mini md-del" data-p="del" title="Delete (Del)">🗑</button>
                </div>
                <div class="md-row"><span>Turn</span><input type="range" data-k="rot" min="-180" max="180" step="1" value="${it.rot || 0}"><b>${Math.round(it.rot || 0)}°</b></div>`;
            if (it.t === 'text') {
                props.innerHTML = `<div class="md-ptitle">Text</div>
                    <textarea class="md-text" rows="3" maxlength="1500" placeholder="Your text">${esc(it.text)}</textarea>
                    <p class="md-tip">New lines, **bold** and links work. Tip: double-click the text on the card to type there.</p>
                    <div class="md-row"><span>Size</span><input type="range" data-k="size" min="8" max="140" step="1" value="${it.size}"><b>${it.size}</b></div>
                    <div class="md-row"><span>Colour</span><input type="color" data-k="color" value="${it.color}"><span class="md-sw">${SWATCHES.map(c => `<button type="button" class="md-swatch" data-color="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</span></div>
                    <div class="md-row"><span>Font</span><select data-k="font">${FONTS.map(([v, n]) => `<option value="${v}"${it.font === v ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
                    <div class="md-row md-btns">
                        <button type="button" class="md-mini${it.bold ? ' on' : ''}" data-tog="bold"><b>B</b></button>
                        <button type="button" class="md-mini${it.italic ? ' on' : ''}" data-tog="italic"><i>I</i></button>
                        <button type="button" class="md-mini${it.shadow ? ' on' : ''}" data-tog="shadow" title="Shadow">S̲</button>
                        <span class="md-gap"></span>
                        ${[['left', '⯇'], ['center', '≡'], ['right', '⯈']].map(([v, s]) => `<button type="button" class="md-mini${it.align === v ? ' on' : ''}" data-set="align" data-v="${v}" title="Align ${v}">${s}</button>`).join('')}
                        <span class="md-gap"></span>
                        ${[['top', '⤒'], ['middle', '⇳'], ['bottom', '⤓']].map(([v, s]) => `<button type="button" class="md-mini${it.valign === v ? ' on' : ''}" data-set="valign" data-v="${v}" title="${v}">${s}</button>`).join('')}
                    </div>
                    <div class="md-row"><span>Behind it</span><label class="md-chk"><input type="checkbox" class="md-fill-on"${it.fill ? ' checked' : ''}> colour</label><input type="color" data-k="fill" value="${it.fill || '#ffffff'}"${it.fill ? '' : ' disabled'}><input type="range" data-k="fillA" min="0.1" max="1" step="0.05" value="${it.fillA ?? 0.8}" title="How solid"${it.fill ? '' : ' disabled'}></div>
                    ${common}`;
            } else {
                const meta = { ...MessageImages.dims(it.src), size: MessageImages.sizeOf(it.src) };
                props.innerHTML = `<div class="md-ptitle">Picture <span class="md-tip">${meta.w ? `${meta.w}×${meta.h}` : ''}${meta.size ? ' · ' + kb(meta.size) : ''}</span></div>
                    <div class="md-row"><span>Fit</span><select data-k="fit">${[['fill', 'Stretch to the box'], ['cover', 'Fill the box (crop)'], ['contain', 'Whole picture']].map(([v, n]) => `<option value="${v}"${it.fit === v ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
                    <div class="md-row"><span>Corners</span><input type="range" data-k="radius" min="0" max="50" step="1" value="${it.radius || 0}"><b>${it.radius || 0}%</b></div>
                    <div class="md-row"><span>See-through</span><input type="range" data-k="opacity" min="0.1" max="1" step="0.05" value="${it.opacity ?? 1}"><b>${Math.round((it.opacity ?? 1) * 100)}%</b></div>
                    <div class="md-row md-btns">
                        <button type="button" class="md-mini md-wide" data-p="ratio">Original proportions</button>
                        <button type="button" class="md-mini md-wide" data-p="fillcard">Fill the card</button>
                    </div>
                    ${common}`;
            }
        }
        props.addEventListener('input', e => {
            const it = L.items[sel];
            if (!it) {
                if (e.target.classList.contains('md-hrange')) { setCardSize(L.w, Number(e.target.value)); commitSoon(); }
                return;
            }
            if (e.target.classList.contains('md-text')) { it.text = e.target.value; refreshItem(); commitSoon(); return; }
            const k = e.target.dataset.k;
            if (!k) return;
            it[k] = e.target.type === 'range' ? Number(e.target.value) : e.target.value;
            const out = e.target.parentElement.querySelector('b');
            if (out) out.textContent = k === 'rot' ? Math.round(it[k]) + '°' : k === 'radius' ? it[k] + '%' : k === 'opacity' ? Math.round(it[k] * 100) + '%' : it[k];
            refreshItem();
            commitSoon();
        });
        props.addEventListener('change', e => {
            const it = L.items[sel];
            if (it && e.target.classList.contains('md-fill-on')) { it.fill = e.target.checked ? (it.fill || '#ffffff') : null; draw(); commit(); }
        });
        props.addEventListener('click', e => {
            const b = e.target.closest('button');
            if (!b) return;
            const it = L.items[sel];
            if (b.dataset.bg) { L.bg = b.dataset.bg; draw(); commit(); return; }
            if (!it) return;
            if (b.dataset.color) { it.color = b.dataset.color; draw(); commit(); return; }
            if (b.dataset.tog) { it[b.dataset.tog] = !it[b.dataset.tog]; draw(); commit(); return; }
            if (b.dataset.set) { it[b.dataset.set] = b.dataset.v; draw(); commit(); return; }
            const p = b.dataset.p;
            if (p === 'del') return remove();
            if (p === 'dup') return duplicate();
            if (p === 'front' || p === 'back' || p === 'up' || p === 'down') {
                const [x] = L.items.splice(sel, 1);
                const to = p === 'front' ? L.items.length : p === 'back' ? 0 : Math.max(0, Math.min(L.items.length, sel + (p === 'up' ? 1 : -1)));
                L.items.splice(to, 0, x); sel = to;
            }
            if (p === 'cx') it.x = r2(50 - it.w / 2);
            if (p === 'cy') it.y = r2(50 - it.h / 2);
            if (p === 'ratio') { const m = MessageImages.dims(it.src); if (m.w) it.h = r2(it.w * L.w / L.h * m.h / m.w); }
            if (p === 'fillcard') { Object.assign(it, { x: 0, y: 0, w: 100, h: 100, rot: 0, fit: 'cover' }); const [x] = L.items.splice(sel, 1); L.items.unshift(x); sel = 0; }
            draw(); commit();
        });
        // a property changed: redraw just that piece (fast), keep the panel as it is (the slider being dragged)
        function refreshItem() {
            const el = stage.querySelector(`.sn-it[data-i="${sel}"]`);
            if (!el) return;
            const tmp = document.createElement('div');
            tmp.innerHTML = SudeduNotices.itemHtml(L.items[sel], L, `data-i="${sel}"`);
            el.replaceWith(tmp.firstElementChild);
            placeSel();
        }

        // ---------------- adding, removing
        function add(item) {
            L.items.push(item);
            sel = L.items.length - 1;
            draw(); commit();
        }
        function addText() {
            add({ t: 'text', x: 15, y: 38, w: 70, h: 24, rot: 0, text: 'Jūsų tekstas', size: 36, color: '#1f2a30', bold: true, italic: false, align: 'center', valign: 'middle', font: 'round', fill: null, fillA: 0.8, shadow: false });
            startEditing(sel);
        }
        function remove() {
            if (sel < 0) return;
            L.items.splice(sel, 1);
            sel = -1; editing = -1;
            draw(); commit();
        }
        function duplicate() {
            const it = L.items[sel];
            if (!it) return;
            add(Object.assign(clone(it), { x: r2(it.x + 3), y: r2(it.y + 3) }));
        }
        function setCardSize(w, h) {
            // the pieces keep their place and size on the card (in px), so changing the card doesn't stretch them
            const fx = L.w / w, fy = L.h / h;
            L.items.forEach(it => { it.x = r2(it.x * fx); it.w = r2(it.w * fx); it.y = r2(it.y * fy); it.h = r2(it.h * fy); });
            L.w = w; L.h = h;
            draw();
        }

        // ---------------- pictures (uploaded to GitHub by MessageImages), placed on the card
        function placePicture(p, at) {
            // 40% of the card's width (less for tall pictures), its own proportions, centred (or where it was dropped)
            const pw = p.w || 4, ph = p.h || 3;
            let w = 40, h = r2(w * L.w / L.h * ph / pw);
            if (h > 80) { h = 80; w = r2(h * L.h / L.w * pw / ph); }
            const x = at ? at[0] - w / 2 : 50 - w / 2, y = at ? at[1] - h / 2 : 50 - h / 2;
            add({ t: 'img', src: p.name, x: r2(x), y: r2(y), w, h, rot: 0, fit: 'fill', radius: 0, opacity: 1 });
            say(p.size > 1024 * 1024 ? `${kb(p.size)} - quite big for every user to download.` : '', p.size > 1024 * 1024);
        }
        async function addPictures(files, at) {
            files = [...files].filter(f => f && f.type && f.type.startsWith('image/'));
            for (const file of files) {
                say(`Uploading ${file.name || 'the picture'} to GitHub…`);
                try { placePicture(await MessageImages.upload(file), at); }
                catch (err) { say(`Not uploaded: ${err.message}`, true); }
            }
        }
        async function pickPicture() {
            say('');
            const p = await MessageImages.pick();
            if (p) placePicture(p);
        }

        // ---------------- typing on the card
        function startEditing(i, again) {
            const el = stage.querySelector(`.sn-it[data-i="${i}"] .sn-it-txt`);
            if (!el || L.items[i].t !== 'text') return;
            editing = i;
            el.textContent = L.items[i].text;
            el.contentEditable = 'plaintext-only';
            if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
            el.classList.add('md-editing');
            el.oninput = () => { L.items[i].text = el.innerText.replace(/\n$/, ''); const ta = props.querySelector('.md-text'); if (ta) ta.value = L.items[i].text; commitSoon(); };
            el.onblur = () => stopEditing();
            el.onkeydown = e => { if (e.key === 'Escape') { e.preventDefault(); el.blur(); } e.stopPropagation(); };
            if (!again) {
                el.focus();
                const r = document.createRange(); r.selectNodeContents(el);
                const s = getSelection(); s.removeAllRanges(); s.addRange(r);
            }
        }
        function stopEditing() {
            if (editing < 0) return;
            editing = -1;
            commit();
            draw();
        }

        // ---------------- pointer: select, move, resize, turn (with snapping)
        let drag = null;
        const pct = (dx, dy) => { const r = stageRect(); return [dx / r.width * 100, dy / r.height * 100]; };
        stage.addEventListener('pointerdown', e => {
            if (e.button > 0) return;
            const h = e.target.closest('[data-h]'), itEl = e.target.closest('.sn-it');
            if (editing >= 0 && itEl && Number(itEl.dataset.i) === editing) return;   // typing: the caret moves
            if (editing >= 0) stopEditing();
            if (!h && !itEl) { sel = -1; draw(); return; }
            if (!h) { const i = Number(itEl.dataset.i); if (i !== sel) { sel = i; draw(); } }
            const it = L.items[sel];
            if (!it) return;
            e.preventDefault();
            stage.setPointerCapture(e.pointerId);
            const r = stageRect();
            drag = { id: e.pointerId, mode: h ? h.dataset.h : 'move', sx: e.clientX, sy: e.clientY, start: clone(it), moved: false,
                cx: r.left + (it.x + it.w / 2) / 100 * r.width, cy: r.top + (it.y + it.h / 2) / 100 * r.height };
        });
        stage.addEventListener('pointermove', e => {
            if (!drag || e.pointerId !== drag.id) return;
            const it = L.items[sel], s = drag.start;
            const [dx, dy] = pct(e.clientX - drag.sx, e.clientY - drag.sy);
            if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 3) return;
            drag.moved = true;
            const guides = [];
            if (drag.mode === 'move') {
                it.x = s.x + dx; it.y = s.y + dy;
                if (!e.altKey) snapMove(it, guides);
            } else if (drag.mode === 'rot') {
                let a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI + 90;
                if (a > 180) a -= 360;
                if (e.shiftKey) a = Math.round(a / 15) * 15;
                else for (const t of [-180, -90, 0, 90, 180]) if (Math.abs(a - t) < 4) a = t;
                it.rot = Math.round(a);
            } else resize(it, s, drag.mode, dx, dy, e.shiftKey, guides);
            it.x = r2(it.x); it.y = r2(it.y); it.w = r2(it.w); it.h = r2(it.h);
            placeSel();
            showGuides(guides);
        });
        const endDrag = e => {
            if (!drag || e.pointerId !== drag.id) return;
            const moved = drag.moved;
            drag = null;
            showGuides([]);
            if (moved) { drawProps(); commit(); }
        };
        stage.addEventListener('pointerup', endDrag);
        stage.addEventListener('pointercancel', endDrag);
        stage.addEventListener('dblclick', e => {
            const itEl = e.target.closest('.sn-it-text');
            if (itEl) { sel = Number(itEl.dataset.i); draw(); startEditing(sel); }
        });

        // the edges / centres the moving piece can snap to: the card's and the other pieces'
        function targets(axis) {
            const out = [0, 50, 100];
            L.items.forEach((o, i) => { if (i !== sel) { const a = axis === 'x' ? o.x : o.y, b = axis === 'x' ? o.w : o.h; out.push(a, a + b / 2, a + b); } });
            return out;
        }
        function snapMove(it, guides) {
            const r = stageRect();
            for (const axis of ['x', 'y']) {
                const size = axis === 'x' ? it.w : it.h, tol = SNAP_PX / (axis === 'x' ? r.width : r.height) * 100;
                let best = null;
                for (const t of targets(axis)) for (const [k, off] of [['s', 0], ['c', size / 2], ['e', size]]) {
                    const d = t - (it[axis] + off);
                    if (Math.abs(d) <= tol && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, t };
                }
                if (best) { it[axis] += best.d; guides.push([axis, best.t]); }
            }
        }
        function resize(it, s, dir, dx, dy, free, guides) {
            let { x, y, w, h } = s;
            if (dir.includes('e')) w = s.w + dx;
            if (dir.includes('s')) h = s.h + dy;
            if (dir.includes('w')) { w = s.w - dx; x = s.x + dx; }
            if (dir.includes('n')) { h = s.h - dy; y = s.y + dy; }
            // pictures keep their shape on the corners (Shift: free)
            if (it.t === 'img' && dir.length === 2 && !free) {
                const ratio = (s.w * L.w) / (s.h * L.h);
                const byW = Math.abs(w - s.w) * L.w >= Math.abs(h - s.h) * L.h;
                if (byW) { const nh = w * L.w / L.h / ratio; if (dir.includes('n')) y = s.y + s.h - nh; h = nh; }
                else { const nw = h * L.h / L.w * ratio; if (dir.includes('w')) x = s.x + s.w - nw; w = nw; }
            }
            const min = 2;
            if (w < min) { if (dir.includes('w')) x -= min - w; w = min; }
            if (h < min) { if (dir.includes('n')) y -= min - h; h = min; }
            // the moving edge snaps too
            const r = stageRect(), tolX = SNAP_PX / r.width * 100, tolY = SNAP_PX / r.height * 100;
            if (dir.includes('e') || dir.includes('w')) {
                const edge = dir.includes('e') ? x + w : x;
                for (const t of targets('x')) if (Math.abs(t - edge) <= tolX) { if (dir.includes('e')) w = t - x; else { w += x - t; x = t; } guides.push(['x', t]); break; }
            }
            if (dir.includes('s') || dir.includes('n')) {
                const edge = dir.includes('s') ? y + h : y;
                for (const t of targets('y')) if (Math.abs(t - edge) <= tolY) { if (dir.includes('s')) h = t - y; else { h += y - t; y = t; } guides.push(['y', t]); break; }
            }
            Object.assign(it, { x, y, w, h });
        }
        function showGuides(list) {
            const g = stage.querySelector('.md-guides');
            if (g) g.innerHTML = list.map(([axis, t]) => `<i class="md-guide md-guide-${axis}" style="${axis === 'x' ? 'left' : 'top'}:${t}%"></i>`).join('');
        }

        // the card's height: drag its bottom edge
        const hgrip = root.querySelector('.md-height');
        hgrip.addEventListener('pointerdown', e => {
            e.preventDefault();
            hgrip.setPointerCapture(e.pointerId);
            const sy = e.clientY, sh = L.h, k = L.w / stageRect().width;
            const move = ev => { setCardSize(L.w, Math.max(150, Math.min(1600, Math.round((sh + (ev.clientY - sy) * k) / 10) * 10))); };
            const up = () => { hgrip.removeEventListener('pointermove', move); hgrip.removeEventListener('pointerup', up); commit(); };
            hgrip.addEventListener('pointermove', move);
            hgrip.addEventListener('pointerup', up);
        });

        // ---------------- the bar
        root.querySelector('.md-bar').addEventListener('click', e => {
            const b = e.target.closest('[data-a]');
            if (!b) return;
            const a = b.dataset.a;
            if (a === 'text') addText();
            else if (a === 'pic') pickPicture();
            else if (a === 'undo') travel(undo, redo);
            else if (a === 'redo') travel(redo, undo);
            else if (a === 'phone') { phone = !phone; draw(); }
        });
        root.querySelector('.md-preset').addEventListener('change', e => {
            if (e.target.value === 'custom') return;
            const [w, h] = e.target.value.split('x').map(Number);
            setCardSize(w, h); commit();
        });
        root.querySelector('.md-bg').addEventListener('input', e => { L.bg = e.target.value; stage.style.background = L.bg; commitSoon(); });

        // files dropped on the card / pasted
        const wrap = root.querySelector('.md-stage-wrap');
        wrap.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); wrap.classList.add('dropping'); } });
        wrap.addEventListener('dragleave', e => { if (!wrap.contains(e.relatedTarget)) wrap.classList.remove('dropping'); });
        wrap.addEventListener('drop', e => {
            e.preventDefault(); wrap.classList.remove('dropping');
            const r = stageRect();
            addPictures(e.dataTransfer.files, [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]);
        });
        root.addEventListener('paste', e => {
            if (editing >= 0 || /INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) return;
            const files = [...(e.clipboardData && e.clipboardData.files || [])];
            if (files.length) { e.preventDefault(); addPictures(files); }
        });

        // keys (while the editor has the focus and no field is typed in)
        root.addEventListener('keydown', e => {
            if (editing >= 0 || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); travel(e.shiftKey ? redo : undo, e.shiftKey ? undo : redo); return; }
            if (ctrl && e.key.toLowerCase() === 'y') { e.preventDefault(); travel(redo, undo); return; }
            const it = L.items[sel];
            if (!it) return;
            if (ctrl && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(); return; }
            if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(); return; }
            if (e.key === 'Escape') { sel = -1; draw(); return; }
            if (e.key === 'Enter' && it.t === 'text') { e.preventDefault(); startEditing(sel); return; }
            const step = e.shiftKey ? 5 : 0.5;
            const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
            if (mv) { e.preventDefault(); it.x = r2(it.x + mv[0]); it.y = r2(it.y + mv[1]); placeSel(); commitSoon(); }
        });
        // a click on the card gives the editor the keys
        stage.addEventListener('pointerdown', () => { if (editing < 0) root.focus({ preventScroll: true }); }, true);

        draw();
        return {
            get: () => (L.items.length ? clone(L) : null),
            set(next) { L = next ? clone(next) : blank(); sel = -1; editing = -1; undo.length = redo.length = 0; lastSaved = snapshot(); draw(); },
            focus: () => root.focus({ preventScroll: true })
        };
    }

    const style = document.createElement('style');
    style.textContent = `
        .md{outline:none}
        .md-bar{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-bottom:10px}
        .md-btn{border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.75);border-radius:10px;padding:7px 12px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;color:rgba(0,0,0,.8)}
        .md-btn:hover{background:#fff}
        .md-btn:disabled{opacity:.4;cursor:default}
        .md-btn.on{background:#3288AC;color:#fff;border-color:#3288AC}
        .md-sep{width:1px;height:24px;background:rgba(0,0,0,.15);margin:0 4px}
        .md-lab{display:inline-flex!important;align-items:center;gap:6px;margin:0!important;font-size:14px;font-weight:600!important}
        .md-lab select{width:auto;padding:6px 8px}
        .md-lab input[type=color]{width:38px;height:30px;padding:0;border:none;background:none}
        .md-weight{margin-left:auto;font-size:13px;color:rgba(0,0,0,.6)}
        .md-weight.heavy{color:#b3261e;font-weight:700}
        .md-main{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:14px;align-items:start}
        @media (max-width:1000px){.md-main{grid-template-columns:1fr}}
        .md-stage-wrap{position:relative;display:flex;flex-direction:column;align-items:center;padding:14px;border-radius:14px;background:repeating-conic-gradient(rgba(0,0,0,.04) 0 25%,transparent 0 50%) 0 0/20px 20px,rgba(255,255,255,.35)}
        .md-stage{position:relative;container-type:inline-size;overflow:visible;border-radius:14px;box-shadow:0 2px 14px rgba(0,0,0,.12);touch-action:none;user-select:none}
        .md-stage .sn-it{cursor:move}
        .md-stage .sn-it-text:hover,.md-stage .sn-it-img:hover{outline:1px dashed rgba(50,136,172,.6)}
        .md-editing{outline:2px solid #3288AC;cursor:text;user-select:text;-webkit-user-select:text;min-height:1em}
        .md-sel{position:absolute;outline:2px solid #3288AC;pointer-events:none;box-sizing:border-box}
        .md-h,.md-rot{position:absolute;width:12px;height:12px;background:#fff;border:2px solid #3288AC;border-radius:3px;pointer-events:auto;box-sizing:border-box}
        .md-h-nw{left:-7px;top:-7px;cursor:nwse-resize}.md-h-n{left:calc(50% - 6px);top:-7px;cursor:ns-resize}.md-h-ne{right:-7px;top:-7px;cursor:nesw-resize}
        .md-h-e{right:-7px;top:calc(50% - 6px);cursor:ew-resize}.md-h-se{right:-7px;bottom:-7px;cursor:nwse-resize}.md-h-s{left:calc(50% - 6px);bottom:-7px;cursor:ns-resize}
        .md-h-sw{left:-7px;bottom:-7px;cursor:nesw-resize}.md-h-w{left:-7px;top:calc(50% - 6px);cursor:ew-resize}
        .md-rot{left:calc(50% - 7px);top:-30px;width:14px;height:14px;border-radius:50%;cursor:grab}
        .md-rot::after{content:'';position:absolute;left:4px;top:12px;width:2px;height:14px;background:#3288AC}
        @media (pointer:coarse){.md-h{width:18px;height:18px}.md-h-nw,.md-h-sw,.md-h-w{left:-10px}.md-h-ne,.md-h-se,.md-h-e{right:-10px}.md-h-nw,.md-h-n,.md-h-ne{top:-10px}.md-h-sw,.md-h-s,.md-h-se{bottom:-10px}}
        .md-guides{position:absolute;inset:0;pointer-events:none}
        .md-guide{position:absolute;background:#ff3d8b}
        .md-guide-x{top:-8px;bottom:-8px;width:1px}
        .md-guide-y{left:-8px;right:-8px;height:1px}
        .md-height{margin-top:6px;padding:2px 18px;border-radius:8px;background:rgba(255,255,255,.8);cursor:ns-resize;font-size:14px;color:rgba(0,0,0,.6);touch-action:none;user-select:none}
        .md-drop{display:none;position:absolute;inset:0;align-items:center;justify-content:center;border:3px dashed #3288AC;border-radius:14px;background:rgba(50,136,172,.12);font-weight:700;color:#286D8A;pointer-events:none}
        .md-stage-wrap.dropping .md-drop{display:flex}
        .md-props{padding:12px;border-radius:14px;background:rgba(255,255,255,.45);font-size:14px}
        .md-ptitle{font-weight:700;margin-bottom:8px}
        .md-row{display:flex;align-items:center;gap:8px;margin:8px 0;flex-wrap:wrap}
        .md-row>span:first-child{min-width:74px;color:rgba(0,0,0,.65)}
        .md-row input[type=range]{flex:1;min-width:90px;padding:0}
        .md-row input[type=color]{width:34px;height:28px;padding:0;border:none;background:none}
        .md-row select{width:auto;flex:1;padding:6px 8px}
        .md-row b{min-width:36px;text-align:right}
        .md-text{width:100%;box-sizing:border-box;padding:8px 10px;font:inherit}
        .md-sw{display:flex;flex-wrap:wrap;gap:4px}
        .md-swatch{width:20px;height:20px;border-radius:50%;border:1px solid rgba(0,0,0,.2);cursor:pointer;padding:0}
        .md-btns{gap:4px}
        .md-mini{min-width:32px;height:32px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.8);border-radius:8px;cursor:pointer;font:inherit;font-size:14px}
        .md-mini.on{background:#3288AC;color:#fff;border-color:#3288AC}
        .md-mini.md-wide{padding:0 10px}
        .md-mini.md-del:hover{background:#ffe1e1}
        .md-gap{width:6px}
        .md-chk{display:inline-flex!important;align-items:center;gap:4px;margin:0!important;font-weight:500!important}
        .md-chk input{width:auto}
        .md-tip{margin:4px 0;font-size:12px;color:rgba(0,0,0,.55)}
        .md-msg{min-height:1.2em;margin-top:6px;font-size:13px;color:rgba(0,0,0,.65)}
        .md-msg.bad{color:#b3261e}
    `;
    document.head.appendChild(style);

    window.MessageDesigner = { create };
})();
