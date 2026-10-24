/* Admin page → "💌 Messages" → "✏️ Plain text": the message's text with pictures between its lines, like a simple
 * document - text above, a picture in a row of its own (centred), text below. MessageText.create(container, body?,
 * { placeholder }) → { get() → body text, set(body), focus(), el }.
 *
 * The text is stored as before (new lines, **bold**, links); a picture is a line of its own [[img:<file>|<width %>]]
 * or [[img:<file>|<width %>|left|right]] (sudedu-notices.js formatBody shows it to users, the server checks it -
 * utils/notices.js bodyImages). Pictures come from MessageImages.pick() (upload or the library on GitHub); "🖼 Picture"
 * puts one where the cursor is. A picture: drag its corner to make it bigger or smaller (or −/+), ⯇ ≡ ⯈ put it on the
 * left / in the middle / on the right, × removes it. */
(function () {
    'use strict';
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const clampW = w => Math.max(10, Math.min(100, Math.round(w)));

    function create(container, initial = '', opts = {}) {
        injectStyle();
        container.innerHTML = `
            <div class="ate">
                <div class="ate-bar">
                    <button type="button" class="btn small-btn btn-secondary ate-add">🖼 Picture</button>
                    <span class="am-muted">New lines, **bold** and links (https://…) work. A picture goes where the cursor is.</span>
                </div>
                <div class="ate-doc"></div>
                <div class="ate-msg" role="status"></div>
            </div>`;
        const root = container.querySelector('.ate'), doc = root.querySelector('.ate-doc'), msg = root.querySelector('.ate-msg');
        const say = (text, bad) => { msg.textContent = text || ''; msg.classList.toggle('bad', !!bad); };
        let lastText = null, lastPos = 0;       // where a new picture goes: the text box last typed in, the cursor in it

        // ---------------- blocks: a text box (grows with its text) or a picture
        function textBlock(value = '') {
            const t = document.createElement('textarea');
            t.className = 'ate-t';
            t.rows = 1;
            t.value = value;
            t.addEventListener('input', () => grow(t));
            const remember = () => { lastText = t; lastPos = t.selectionStart; };
            ['focus', 'keyup', 'click', 'input', 'select'].forEach(ev => t.addEventListener(ev, remember));
            t.addEventListener('keydown', e => {
                // Backspace at the very start right after a picture: the picture goes (as in a document)
                if (e.key === 'Backspace' && t.selectionStart === 0 && t.selectionEnd === 0 && t.previousElementSibling && t.previousElementSibling.classList.contains('ate-img')) {
                    e.preventDefault();
                    removePicture(t.previousElementSibling);
                }
            });
            return t;
        }
        function grow(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
        function pictureBlock(name, width, align = 'center') {
            const f = document.createElement('div');
            f.className = 'ate-img';
            f.tabIndex = 0;
            f.dataset.name = name;
            f.dataset.w = clampW(width);
            f.innerHTML = `<div class="ate-frame" style="width:${f.dataset.w}%">${SudeduNotices.imageTag(name, 'draggable="false"')}
                <span class="ate-tools">${[['left', '⯇', 'On the left'], ['center', '≡', 'In the middle'], ['right', '⯈', 'On the right']].map(([v, s, t]) => `<button type="button" data-a="align" data-v="${v}" title="${t}">${s}</button>`).join('')}<span class="ate-gap"></span><button type="button" data-a="less" title="Smaller">−</button><b class="ate-pct">${f.dataset.w}%</b><button type="button" data-a="more" title="Bigger">+</button><button type="button" data-a="del" title="Remove the picture">×</button></span>
                <i class="ate-rs" title="Drag to resize"></i></div>`;
            setAlign(f, align);
            f.addEventListener('click', e => {
                const b = e.target.closest('button'), a = b && b.dataset.a;
                if (a === 'del') removePicture(f);
                else if (a === 'align') setAlign(f, b.dataset.v);
                else if (a === 'less') setWidth(f, Number(f.dataset.w) - 10);
                else if (a === 'more') setWidth(f, Number(f.dataset.w) + 10);
            });
            f.addEventListener('keydown', e => {
                if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removePicture(f); }
                else if (e.key === '-' || e.key === 'ArrowLeft') { e.preventDefault(); setWidth(f, Number(f.dataset.w) - 5); }
                else if (e.key === '+' || e.key === '=' || e.key === 'ArrowRight') { e.preventDefault(); setWidth(f, Number(f.dataset.w) + 5); }
            });
            // resizing: a centred picture grows on both sides, so the corner moves half as much as the width changes
            f.querySelector('.ate-rs').addEventListener('pointerdown', e => {
                e.preventDefault();
                const frame = f.querySelector('.ate-frame'), full = doc.clientWidth - 24;
                const startX = e.clientX, startW = frame.getBoundingClientRect().width;
                const k = f.dataset.align === 'center' ? 2 : f.dataset.align === 'right' ? -1 : 1;
                const move = ev => setWidth(f, (startW + k * (ev.clientX - startX)) / full * 100);
                const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); f.classList.remove('sizing'); };
                f.classList.add('sizing');
                window.addEventListener('pointermove', move);
                window.addEventListener('pointerup', up);
            });
            return f;
        }
        function setAlign(f, align) {
            f.dataset.align = ['left', 'right'].includes(align) ? align : 'center';
            f.style.textAlign = f.dataset.align;
            f.querySelectorAll('[data-a="align"]').forEach(b => b.classList.toggle('on', b.dataset.v === f.dataset.align));
        }
        function setWidth(f, w) {
            f.dataset.w = clampW(w);
            f.querySelector('.ate-frame').style.width = f.dataset.w + '%';
            f.querySelector('.ate-pct').textContent = f.dataset.w + '%';
        }
        // a picture out: the text boxes around it become one again
        function removePicture(f) {
            const before = f.previousElementSibling, after = f.nextElementSibling;
            f.remove();
            if (before && after && before.classList.contains('ate-t') && after.classList.contains('ate-t')) {
                const at = before.value.length;
                before.value = before.value && after.value ? `${before.value}\n${after.value}` : before.value + after.value;
                after.remove();
                grow(before);
                before.focus();
                before.setSelectionRange(at, at);
            }
            tidy();
        }
        // always a text box first, last and between two pictures (somewhere to type)
        function tidy() {
            const kids = [...doc.children];
            if (!kids.length || !kids[0].classList.contains('ate-t')) doc.insertBefore(textBlock(), doc.firstChild);
            [...doc.children].forEach(el => {
                if (el.classList.contains('ate-img') && (!el.nextElementSibling || el.nextElementSibling.classList.contains('ate-img'))) el.after(textBlock());
            });
            const first = doc.querySelector('.ate-t');
            doc.querySelectorAll('.ate-t').forEach(t => { t.placeholder = t === first && !doc.querySelector('.ate-img') ? (opts.placeholder || '') : ''; grow(t); });
        }

        // a picture where the cursor was (the text box is split there), or at the end
        function insertPicture(p) {
            const width = p.w && p.h && p.h > p.w * 1.3 ? 45 : 70;
            const f = pictureBlock(p.name, width);
            if (lastText && lastText.isConnected) {
                const v = lastText.value, at = Math.min(lastPos, v.length);
                const before = v.slice(0, at).replace(/\n$/, ''), after = v.slice(at).replace(/^\n/, '');
                lastText.value = before;
                lastText.after(f);
                f.after(textBlock(after));
                grow(lastText);
            } else {
                doc.appendChild(f);
            }
            tidy();
            const next = f.nextElementSibling;
            if (next) { next.focus(); next.setSelectionRange(0, 0); }
        }
        root.querySelector('.ate-add').addEventListener('click', async () => {
            say('');
            const p = await MessageImages.pick();
            if (p) insertPicture(p);
        });

        // ---------------- the text ⇄ the boxes
        function get() {
            const parts = [];
            [...doc.children].forEach(el => {
                if (el.classList.contains('ate-img')) parts.push(`[[img:${el.dataset.name}|${el.dataset.w}${el.dataset.align !== 'center' ? '|' + el.dataset.align : ''}]]`);
                else if (el.value.trim()) parts.push(el.value.replace(/\s+$/, ''));
            });
            return parts.join('\n').trim();
        }
        function set(body) {
            doc.innerHTML = '';
            let buf = [];
            const flush = () => { if (buf.length) doc.appendChild(textBlock(buf.join('\n'))); buf = []; };
            String(body || '').split('\n').forEach(line => {
                const m = line.trim().match(SudeduNotices.IMAGE_LINE);
                if (m) { flush(); doc.appendChild(pictureBlock(m[1], Number(m[2]), m[3])); }
                else buf.push(line);
            });
            flush();
            lastText = null;
            tidy();
        }
        set(initial);
        // a click on the empty part of the page: typing goes on at the end
        doc.addEventListener('mousedown', e => {
            if (e.target !== doc) return;
            const last = [...doc.querySelectorAll('.ate-t')].pop();
            if (last) { e.preventDefault(); last.focus(); last.setSelectionRange(last.value.length, last.value.length); }
        });
        // (sizes once the box is on the screen - a hidden box has no height to measure)
        new ResizeObserver(() => doc.querySelectorAll('.ate-t').forEach(grow)).observe(doc);
        return { get, set, focus: () => { const t = doc.querySelector('.ate-t'); if (t) t.focus(); }, el: root };
    }

    let styled = false;
    function injectStyle() {
        if (styled) return;
        styled = true;
        const style = document.createElement('style');
        style.textContent = `
        .ate-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px}
        .ate-bar .btn{margin:0}
        .ate-doc{background:#fff;border:1px solid rgba(0,0,0,.15);border-radius:12px;padding:8px 12px;min-height:120px;max-height:60vh;overflow:auto;cursor:text}
        .ate-doc:focus-within{border-color:#3288AC;box-shadow:0 0 0 3px rgba(50,136,172,.15)}
        .ate-t{display:block;width:100%;box-sizing:border-box;border:none!important;outline:none;resize:none;background:transparent;padding:4px 0!important;margin:0;font:inherit;font-size:15px;line-height:1.55;overflow:hidden;box-shadow:none!important;min-height:0}
        .ate-img{text-align:center;margin:6px 0;outline:none;line-height:0}
        .ate-frame{position:relative;display:inline-block;max-width:100%}
        .ate-frame img{display:block;width:100%;height:auto;border-radius:10px;user-select:none}
        .ate-img:focus .ate-frame,.ate-img.sizing .ate-frame,.ate-frame:hover{outline:2px solid #3288AC;outline-offset:2px;border-radius:10px}
        .ate-tools{position:absolute;top:6px;right:6px;display:none;align-items:center;gap:4px;padding:3px;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 1px 6px rgba(0,0,0,.2);line-height:1}
        .ate-img:focus .ate-tools,.ate-frame:hover .ate-tools,.ate-img.sizing .ate-tools{display:inline-flex}
        .ate-tools button{border:none;background:rgba(0,0,0,.07);width:26px;height:26px;border-radius:50%;cursor:pointer;font-size:15px;line-height:1}
        .ate-tools button[data-a="del"]{background:rgba(179,38,30,.12);color:#b3261e}
        .ate-tools button.on{background:#3288AC;color:#fff}
        .ate-gap{width:6px}
        .ate-pct{font-size:12px;min-width:34px;text-align:center}
        .ate-rs{position:absolute;right:-7px;bottom:-7px;width:16px;height:16px;border-radius:4px;background:#3288AC;border:2px solid #fff;cursor:nwse-resize;display:none;touch-action:none}
        .ate-img:focus .ate-rs,.ate-frame:hover .ate-rs,.ate-img.sizing .ate-rs{display:block}
        .ate-msg{min-height:1em;font-size:13px;color:rgba(0,0,0,.6);margin-top:4px}
        .ate-msg.bad{color:#b3261e;font-weight:600}
        `;
        document.head.appendChild(style);
    }

    window.MessageText = { create };
})();
