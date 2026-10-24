/* Admin page → "💌 Messages": the pictures of messages. They are stored in the site's GitHub repository (images/messages/)
 * by the server (POST admin/notices/images → utils/messageImages.js) and shown to users by GitHub Pages - a message keeps
 * only a picture's file name. When GitHub can't be reached nothing is stored and the admin is told (no fallback).
 *
 * MessageImages.pick() → Promise<{ name, w, h, size } | null>: a window with every picture uploaded so far (newest first)
 *   and "Upload a new picture" (button, drop, paste). Used by the plain message editor and the card designer.
 * MessageImages.upload(file) → Promise<{ name, w, h, size }> (throws with a readable message)
 * MessageImages.dims(name) → { w, h } from the file name (<date>-<hash>-<w>x<h>.<ext>); sizeOf(name) → bytes | null
 * Big photos are shrunk to WebP (≤ 1600 px) before uploading; GIFs go as they are (animated); at most 3 MB. */
(function () {
    'use strict';
    const PHOTO_MAX = 1600;
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const kb = n => n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
    const sizes = new Map();      // file name → bytes (from the library and from uploads)

    function dims(name) {
        const m = String(name || '').match(/-(\d+)x(\d+)\.\w+$/);
        return m ? { w: Number(m[1]), h: Number(m[2]) } : { w: 0, h: 0 };
    }
    const sizeOf = name => (sizes.has(name) ? sizes.get(name) : null);
    const dateOf = name => { const d = String(name).slice(0, 8); return /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : ''; };

    async function api(path, opts) {
        let res;
        try { res = await apiFetch(`${apiBase}admin/${path}`, opts); } catch { res = null; }
        const body = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) throw new Error(body.message || 'The server could not be reached');
        return body;
    }

    // the library (asked once per page; fresh after an upload)
    let library = null;
    async function list(fresh = false) {
        if (library && !fresh) return library;
        const { images } = await api(`notices/images${fresh ? '?fresh=1' : ''}`);
        images.forEach(f => sizes.set(f.name, f.size));
        library = images;
        return images;
    }

    // ---------------- uploading: shrink big photos, send, get the file name
    async function prepare(file) {
        if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) throw new Error(`${file.name || 'The file'}: only PNG, JPEG, GIF or WebP pictures`);
        let bmp;
        try { bmp = await createImageBitmap(file); } catch { throw new Error(`${file.name || 'The file'}: this picture can't be read`); }
        const w = bmp.width, h = bmp.height;
        // GIFs (animations) are sent as they are; other pictures are shrunk when big
        if (file.type === 'image/gif' || (Math.max(w, h) <= PHOTO_MAX && file.size <= 350 * 1024)) return { blob: file, type: file.type, w, h };
        const k = Math.min(1, PHOTO_MAX / Math.max(w, h));
        const c = document.createElement('canvas');
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise(res => c.toBlob(res, 'image/webp', 0.86));
        if (!blob || blob.size >= file.size) return { blob: file, type: file.type, w, h };
        return { blob, type: 'image/webp', w: c.width, h: c.height };
    }
    async function upload(file) {
        const p = await prepare(file);
        if (p.blob.size > 3 * 1024 * 1024) throw new Error(`${file.name || 'The picture'} is ${kb(p.blob.size)} - at most 3 MB (make the GIF shorter or smaller)`);
        const r = await api(`notices/images?w=${p.w}&h=${p.h}`, { method: 'POST', headers: { 'Content-Type': p.type }, body: p.blob });
        sizes.set(r.name, r.size);
        if (library && !library.some(f => f.name === r.name)) library.unshift({ name: r.name, size: r.size });
        return { name: r.name, ...dims(r.name), size: r.size };
    }

    // ---------------- the window
    function pick() {
        injectStyle();
        return new Promise(resolve => {
            const back = document.createElement('div');
            back.className = 'mi-back';
            back.innerHTML = `
                <div class="mi-box" role="dialog" aria-modal="true" aria-label="Pictures">
                    <div class="mi-head"><b>Pictures</b><button type="button" class="mi-x" aria-label="Close">×</button></div>
                    <div class="mi-up">
                        <label class="btn small-btn mi-up-btn">⬆ Upload a new picture<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden></label>
                        <span class="am-muted">or drop / paste it here. PNG, JPEG, WebP or GIF (animated), up to 3 MB; big photos are made smaller.</span>
                    </div>
                    <div class="mi-msg" role="status"></div>
                    <div class="mi-grid"><div class="mi-empty">Loading…</div></div>
                    <div class="mi-foot am-muted">Pictures are kept in the site's GitHub repository (images/messages) and shown to users by GitHub Pages.</div>
                </div>`;
            document.body.appendChild(back);
            const grid = back.querySelector('.mi-grid'), msg = back.querySelector('.mi-msg'), input = back.querySelector('.mi-up input');
            const say = (text, bad) => { msg.textContent = text || ''; msg.classList.toggle('bad', !!bad); };
            let busy = false;
            const close = result => {
                document.removeEventListener('keydown', onKey, true);
                document.removeEventListener('paste', onPaste, true);
                back.remove();
                resolve(result || null);
            };
            const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } };
            const onPaste = e => {
                const file = [...(e.clipboardData ? e.clipboardData.files : [])].find(f => f.type.startsWith('image/'));
                if (file) { e.preventDefault(); e.stopPropagation(); send(file); }
            };
            document.addEventListener('keydown', onKey, true);
            document.addEventListener('paste', onPaste, true);
            back.addEventListener('mousedown', e => { if (e.target === back) close(null); });
            back.querySelector('.mi-x').addEventListener('click', () => close(null));

            function draw(images) {
                if (!images.length) { grid.innerHTML = '<div class="mi-empty">No pictures yet - upload the first one.</div>'; return; }
                grid.innerHTML = images.map(f => {
                    const d = dims(f.name);
                    return `<button type="button" class="mi-tile" data-name="${esc(f.name)}" title="${esc(f.name)}">
                        <span class="mi-thumb">${SudeduNotices.imageTag(f.name, 'loading="lazy"')}</span>
                        <span class="mi-meta">${d.w}×${d.h} · ${kb(f.size)}<br>${dateOf(f.name)}</span></button>`;
                }).join('');
            }
            grid.addEventListener('click', e => {
                const t = e.target.closest('.mi-tile');
                if (!t || busy) return;
                const name = t.dataset.name;
                close({ name, ...dims(name), size: sizeOf(name) });
            });
            async function send(file) {
                if (busy) return;
                busy = true;
                back.classList.add('busy');
                say(`Uploading ${file.name || 'the picture'} to GitHub…`);
                try {
                    const r = await upload(file);
                    close(r);
                } catch (err) {
                    say(`Not uploaded: ${err.message}`, true);
                } finally {
                    busy = false;
                    back.classList.remove('busy');
                }
            }
            input.addEventListener('change', () => { if (input.files[0]) send(input.files[0]); input.value = ''; });
            back.addEventListener('dragover', e => { e.preventDefault(); back.classList.add('drop'); });
            back.addEventListener('dragleave', e => { if (e.target === back) back.classList.remove('drop'); });
            back.addEventListener('drop', e => {
                e.preventDefault();
                back.classList.remove('drop');
                const file = [...e.dataTransfer.files].find(f => f.type.startsWith('image/'));
                if (file) send(file);
            });
            list(true).then(draw).catch(err => { grid.innerHTML = ''; say(`The pictures could not be listed: ${err.message}`, true); });
        });
    }

    let styled = false;
    function injectStyle() {
        if (styled) return;
        styled = true;
        SudeduNotices.injectStyle();
        const style = document.createElement('style');
        style.textContent = `
        .mi-back{position:fixed;inset:0;z-index:10000;background:rgba(15,25,35,.45);display:flex;align-items:center;justify-content:center;padding:16px}
        .mi-box{width:min(860px,100%);max-height:min(88vh,900px);display:flex;flex-direction:column;background:#fdfaf5;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden}
        .mi-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(0,0,0,.08);font-size:17px}
        .mi-x{border:none;background:rgba(0,0,0,.07);width:32px;height:32px;border-radius:50%;font-size:20px;line-height:1;cursor:pointer}
        .mi-up{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 18px}
        .mi-up-btn{cursor:pointer;margin:0}
        .mi-msg{padding:0 18px;min-height:1.2em;font-size:14px;color:rgba(0,0,0,.7)}
        .mi-msg.bad{color:#b3261e;font-weight:600}
        .mi-grid{flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;padding:10px 18px 14px;align-content:start}
        .mi-tile{display:flex;flex-direction:column;gap:6px;padding:6px;border:2px solid transparent;border-radius:12px;background:#fff;cursor:pointer;font:inherit;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.08)}
        .mi-tile:hover,.mi-tile:focus-visible{border-color:#3288AC;outline:none}
        .mi-thumb{display:flex;align-items:center;justify-content:center;height:110px;border-radius:8px;overflow:hidden;background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/16px 16px}
        .mi-thumb img{max-width:100%;max-height:100%;object-fit:contain}
        .mi-meta{font-size:12px;color:rgba(0,0,0,.6);line-height:1.35}
        .mi-empty{grid-column:1/-1;padding:30px;text-align:center;color:rgba(0,0,0,.55)}
        .mi-foot{padding:10px 18px;border-top:1px solid rgba(0,0,0,.08)}
        .mi-back.busy .mi-grid{opacity:.5;pointer-events:none}
        .mi-back.drop .mi-box{outline:3px dashed #3288AC;outline-offset:-6px}
        `;
        document.head.appendChild(style);
    }

    window.MessageImages = { pick, upload, list, dims, sizeOf };
})();
