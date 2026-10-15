/* Admin page → "⚖️ Coins": how many coins tasks give and the weights behind them (the former main.py analyzer).
 *
 * Coins of a correct answer = base × the weight of each of the task's settings codes (per school period and the
 * student's grade 0-5) × the multiplication table's weight × a per-task adjustment (mental-arithmetic.js
 * pointsPerCorrectForCodes - the same function the tasks use). The results archive keeps each task's correct answers,
 * so every record's coins can be worked out again with any weights: the page shows the saved weights and the draft
 * being edited side by side, and saves the draft to the database (AppSetting "points" → /config/points; browsers keep
 * a copy for a day).
 *
 * Views: grades (typical coins per active day / week / minute per student), tasks (per kind of task as the coin formula
 * sees it - its codes: coins per correct answer, per minute, share of the coins and of the time, flagged when far from
 * the grade's typical rate; "Adjust" sets a per-task factor), weights (codes × grades of a period), adjustments.
 * Grades are the students' knowledge levels now (as main.py did). Students with very few tasks are left out of the grade
 * figures (fewer than max(6, a fifth of the median)). */
(function () {
    'use strict';
    const PERIODS = ['9-10', '11-12', '1-2', '3-8'];
    const PERIOD_NAMES = { '9-10': 'Sep–Oct', '11-12': 'Nov–Dec', '1-2': 'Jan–Feb', '3-8': 'Mar–Aug' };
    const GRADES = [0, 1, 2, 3, 4, 5];
    const DL_NAMES = { DL1: 'table ×1 only', DL2: 'table ×2 only', DL10: 'table of 10 only', DLALL: 'multiplication table (other)' };
    const state = { data: null, saved: null, draft: null, meta: null, grade: 'all', period: 'all', editPeriod: null, sort: { key: 'coins', dir: -1 }, open: null, search: '' };
    let chart = null;

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = (v, d = 1) => (v == null || !isFinite(v) ? '–' : Number(v).toFixed(d).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1'));
    const clone = o => JSON.parse(JSON.stringify(o));
    const median = arr => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
    const periodOf = date => { const m = Number(String(date).slice(5, 7)); return m >= 9 && m <= 10 ? '9-10' : m >= 11 ? '11-12' : m <= 2 ? '1-2' : '3-8'; };
    const builtin = () => ({ v: 1, periods: clone(BUILTIN_POINT_WEIGHTS), overrides: [] });
    const dirty = () => state.saved && state.draft && JSON.stringify({ p: state.saved.periods, o: state.saved.overrides }) !== JSON.stringify({ p: state.draft.periods, o: state.draft.overrides });

    // ------------------------------------------------------------ names
    function codeName(code) {
        if (DL_NAMES[code]) return DL_NAMES[code];
        if (code === 'remainder') return 'with remainder';
        if (code === 'base') return 'base (every task)';
        const d = typeof parameterDictionary !== 'undefined' && parameterDictionary[code] && parameterDictionary[code].decodedParameterText;
        const text = d ? d.normalize('NFC').replace(/^\*/, '').toLowerCase() : '';
        const label = state.draft && Object.values(state.draft.periods)[0][code] && Object.values(state.draft.periods)[0][code].label;
        return text || label || code;
    }
    const kindName = codes => [...codes].sort((a, b) => order(a) - order(b)).map(codeName).join(' · ');
    const order = c => { const i = POINT_CODES.indexOf(c); return i < 0 ? 999 : i; };

    // ------------------------------------------------------------ data
    async function loadAll() {
        const box = document.getElementById('ap-status');
        box.textContent = 'Loading…';
        const from = document.getElementById('ap-from').value, to = document.getElementById('ap-to').value;
        try {
            const [settingsRes, dataRes] = await Promise.all([
                apiFetch(`${apiBase}admin/settings/points`, { headers: { 'Content-Type': 'application/json' } }),
                apiFetch(`${apiBase}admin/points-data?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers: { 'Content-Type': 'application/json' } })
            ]);
            if (!settingsRes || !settingsRes.ok || !dataRes || !dataRes.ok) throw new Error('Could not load (admin only)');
            const settings = await settingsRes.json();
            state.meta = settings.v >= 1 ? { updatedAt: settings.updatedAt, updatedBy: settings.updatedBy, stored: true } : { stored: false };
            state.saved = settings.v >= 1 ? { v: 1, periods: settings.periods, overrides: settings.overrides || [] } : builtin();
            if (!state.draft || !dirty()) state.draft = clone(state.saved);
            prepare(await dataRes.json());
            box.textContent = '';
            render();
        } catch (e) {
            box.innerHTML = `<div class="message error">${esc(e.message)}</div>`;
        }
    }
    // records: { student, grade, date, period, codes (Set), key, correct, minutes }; kinds by key
    function prepare(raw) {
        const codesOf = new Map();
        const kinds = new Map();
        const records = [];
        raw.rows.forEach(([student, grade, date, libId, correct, total, rate]) => {
            if (!(grade >= 0 && grade <= 5)) return;
            if (!codesOf.has(libId)) {
                let info = null;
                try { info = JSON.parse(raw.library[libId]); } catch (e) { info = null; }
                const codes = pointCodesOfTaskInfo(info);
                const key = [...codes].sort().join(',');
                codesOf.set(libId, { codes, key });
                if (!kinds.has(key)) kinds.set(key, { key, codes, name: kindName(codes), variants: new Set() });
                kinds.get(key).variants.add(libId);
            }
            const { codes, key } = codesOf.get(libId);
            records.push({ student, grade, date, period: periodOf(date), codes, key, correct: Number(correct) || 0, minutes: rate > 0 && total > 0 ? total / rate : null });
        });
        state.data = { records, kinds, from: raw.from, to: raw.to };
    }
    // a task below the grade's level: one of its settings weighted under 0.5 for the grade (the weights make such tasks
    // pay little on purpose) - not flagged as low, and left out of the typical rate
    const BELOW_LEVEL = 0.5;
    function belowLevel(r, s) {
        const w = s.periods[r.period] || s.periods['1-2'];
        for (const code of r.codes) {
            const v = w[code] && w[code].values;
            if (v && v[r.grade] != null && Number(v[r.grade]) < BELOW_LEVEL) return true;
        }
        return false;
    }
    // a record's coins with a set of settings
    const coinsOf = (r, s) => pointsPerCorrectForCodes(r.codes, r.grade, s.periods[r.period] || s.periods['1-2'], s.overrides) * r.correct;
    const perCorrect = (codes, grade, period, s) => pointsPerCorrectForCodes(codes, grade, s.periods[period] || s.periods['1-2'], s.overrides);
    function selected() {
        return state.data.records.filter(r => (state.grade === 'all' || r.grade === state.grade) && (state.period === 'all' || r.period === state.period));
    }
    // students with too few tasks left out (main.py's filter_active_students)
    function active(records) {
        const n = new Map();
        records.forEach(r => n.set(r.student, (n.get(r.student) || 0) + 1));
        const limit = Math.max(6, 0.2 * (median([...n.values()]) || 0));
        return records.filter(r => n.get(r.student) >= limit);
    }

    // ------------------------------------------------------------ grade figures
    // typical (median) student: coins per active day, per week (weeks from the student's first record with 3+ active
    // days, as main.py), per minute (all the student's coins / minutes)
    function gradeFigures(records, s) {
        const per = new Map();
        records.forEach(r => {
            const e = per.get(r.student) || { days: new Map(), coins: 0, minutes: 0, first: r.date };
            const c = coinsOf(r, s);
            e.days.set(r.date, (e.days.get(r.date) || 0) + c);
            e.coins += c;
            if (r.minutes) e.minutes += r.minutes;
            if (r.date < e.first) e.first = r.date;
            per.set(r.student, e);
        });
        const daily = [], weekly = [], perMinute = [];
        per.forEach(e => {
            e.days.forEach(v => daily.push(v));
            const weeks = new Map();
            e.days.forEach((v, d) => { const w = Math.floor((Date.parse(d) - Date.parse(e.first)) / (7 * 86400000)); const x = weeks.get(w) || { coins: 0, days: 0 }; x.coins += v; x.days++; weeks.set(w, x); });
            weeks.forEach(x => { if (x.days > 2) weekly.push(x.coins); });
            if (e.minutes > 0) perMinute.push(e.coins / e.minutes);
        });
        return { students: per.size, daily: median(daily), weekly: median(weekly), perMinute: median(perMinute) };
    }
    function renderGrades() {
        const rows = GRADES.map(g => {
            const recs = active(state.data.records.filter(r => r.grade === g && (state.period === 'all' || r.period === state.period)));
            if (!recs.length) return null;
            return { g, now: gradeFigures(recs, state.saved), next: gradeFigures(recs, state.draft) };
        }).filter(Boolean);
        const cell = (a, b, d) => {
            const change = a > 0 && b != null ? (b / a - 1) * 100 : null;
            return `<td><b>${fmt(b, d)}</b>${change != null && Math.abs(change) >= 0.5 ? ` <span class="ap-delta ${change > 0 ? 'up' : 'down'}">${change > 0 ? '+' : ''}${fmt(change, 0)}%</span>` : ''}</td>`;
        };
        document.getElementById('ap-grades').innerHTML = rows.length ? `
            <table class="ap-table">
                <thead><tr><th>Grade</th><th>Active students</th><th>Coins / active day</th><th>Coins / week</th><th>Coins / minute</th></tr></thead>
                <tbody>${rows.map(r => `<tr class="${state.grade === r.g ? 'ap-sel' : ''}" data-grade="${r.g}"><td>${r.g}</td><td>${r.now.students}</td>${cell(r.now.daily, r.next.daily)}${cell(r.now.weekly, r.next.weekly)}${cell(r.now.perMinute, r.next.perMinute, 2)}</tr>`).join('')}</tbody>
            </table>
            <p class="ap-note">The typical (median) active student. A % shows the change the unsaved draft would make. Click a grade to see its tasks.</p>` : '<p class="ap-note">No records in this range.</p>';
        document.querySelectorAll('#ap-grades tr[data-grade]').forEach(tr => tr.addEventListener('click', () => { state.grade = Number(tr.dataset.grade); document.getElementById('ap-grade').value = String(state.grade); render(); }));
        // chart: coins per active day, saved vs draft
        const canvas = document.getElementById('ap-chart');
        if (chart) { chart.destroy(); chart = null; }
        if (typeof Chart !== 'undefined' && rows.length) {
            chart = new Chart(canvas, {
                type: 'bar',
                data: { labels: rows.map(r => `Grade ${r.g}`), datasets: [
                    { label: 'Saved weights', data: rows.map(r => r.now.daily), backgroundColor: 'rgba(95,127,140,0.75)' },
                    { label: 'Draft', data: rows.map(r => r.next.daily), backgroundColor: 'rgba(35,134,111,0.85)' }
                ] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Coins per active day (typical student)' } }, scales: { y: { beginAtZero: true } } }
            });
        }
    }

    // ------------------------------------------------------------ tasks
    function taskRows() {
        const recs = selected();
        const by = new Map();
        let coinsAll = 0, minutesAll = 0;
        recs.forEach(r => {
            const e = by.get(r.key) || { key: r.key, codes: r.codes, students: new Set(), records: 0, correct: 0, coins: 0, saved: 0, coinsTimed: 0, savedTimed: 0, minutes: 0, below: 0 };
            const c = coinsOf(r, state.draft), c0 = coinsOf(r, state.saved);
            e.students.add(r.student); e.records++; e.correct += r.correct; e.coins += c; e.saved += c0;
            if (belowLevel(r, state.draft)) e.below++;
            if (r.minutes) { e.minutes += r.minutes; e.coinsTimed += c; e.savedTimed += c0; minutesAll += r.minutes; }
            coinsAll += c;
            by.set(r.key, e);
        });
        const rows = [...by.values()].map(e => ({
            ...e, name: state.data.kinds.get(e.key).name, variants: state.data.kinds.get(e.key).variants.size,
            perCorrect: e.correct ? e.coins / e.correct : null, perCorrectSaved: e.correct ? e.saved / e.correct : null,
            perMinute: e.minutes ? e.coinsTimed / e.minutes : null, perMinuteSaved: e.minutes ? e.savedTimed / e.minutes : null,
            change: e.saved > 0 ? (e.coins / e.saved - 1) * 100 : (e.coins > 0 ? 100 : 0), belowLevel: e.below / e.records >= 0.5,
            coinShare: coinsAll ? e.coins / coinsAll * 100 : 0, timeShare: minutesAll ? e.minutes / minutesAll * 100 : 0
        }));
        // the typical rate: coins per minute over all the selected records
        const typical = median(rows.filter(r => r.perMinute != null && r.records >= 3 && !r.belowLevel).map(r => r.perMinute));
        rows.forEach(r => { r.ratio = typical && r.perMinute != null ? r.perMinute / typical : null; });
        const k = state.sort.key, d = state.sort.dir;
        rows.sort((a, b) => ((a[k] ?? -1) > (b[k] ?? -1) ? 1 : (a[k] ?? -1) < (b[k] ?? -1) ? -1 : 0) * d);
        return { rows, typical };
    }
    function ruleFor(codes, grade) {
        // the adjustment set for exactly this kind (and grade), if any
        const key = [...codes].sort().join(',');
        return state.draft.overrides.find(o => [...o.codes].sort().join(',') === key && (grade === 'all' ? true : !o.grades || o.grades.includes(grade)));
    }
    function renderTasks() {
        const { rows, typical } = taskRows();
        const head = (key, text, title = '') => `<th data-sort="${key}" title="${esc(title)}" class="ap-sortable">${text}${state.sort.key === key ? (state.sort.dir < 0 ? ' ▼' : ' ▲') : ''}</th>`;
        const maxShare = Math.max(1, ...rows.map(r => r.coinShare));
        document.getElementById('ap-tasks').innerHTML = rows.length ? `
            <p class="ap-note">${state.grade === 'all' ? 'All grades' : `Grade ${state.grade}`}, ${state.period === 'all' ? 'all periods' : PERIOD_NAMES[state.period]} · typical rate ${fmt(typical, 2)} coins / minute. <span class="ap-flag hi">high</span> ≥ 1.5× the typical rate, <span class="ap-flag lo">low</span> ≤ 0.67×; <span class="ap-flag lv">below level</span>: a setting weighted under ${BELOW_LEVEL} for the grade - meant to pay little, not flagged. "Change": the draft against the saved weights.</p>
            <div class="ap-scroll"><table class="ap-table ap-tasks">
                <thead><tr>${head('name', 'Kind of task')}${head('students', 'Students')}${head('records', 'Times')}${head('perCorrect', 'Coins / correct', 'Draft (saved below when different)')}${head('perMinute', 'Coins / minute')}${head('change', 'Change', 'Coins with the draft against the saved weights')}${head('coinShare', 'Share of coins')}${head('timeShare', 'Share of time')}<th></th></tr></thead>
                <tbody>${rows.map(r => {
                    const rule = ruleFor(r.codes, state.grade);
                    const flag = r.belowLevel ? '<span class="ap-flag lv">below level</span>' : r.ratio == null ? '' : r.ratio >= 1.5 ? '<span class="ap-flag hi">high</span>' : r.ratio <= 0.67 ? '<span class="ap-flag lo">low</span>' : '';
                    const changed = r.perCorrectSaved != null && Math.abs(r.perCorrect - r.perCorrectSaved) > 0.005;
                    const minuteChanged = r.perMinuteSaved != null && Math.abs(r.perMinute - r.perMinuteSaved) > 0.005;
                    return `<tr data-key="${esc(r.key)}">
                        <td class="ap-name">${esc(r.name)}${r.variants > 1 ? ` <small>(${r.variants} setting variants)</small>` : ''}${rule ? ` <span class="ap-chip">×${fmt(rule.factor, 2)}${rule.grades ? ' grades ' + rule.grades.join(',') : ''}</span>` : ''}</td>
                        <td>${r.students.size}</td><td>${r.records}</td>
                        <td><b>${fmt(r.perCorrect, 2)}</b>${changed ? `<br><small>was ${fmt(r.perCorrectSaved, 2)}</small>` : ''}</td>
                        <td>${fmt(r.perMinute, 2)} ${flag}${minuteChanged ? `<br><small>was ${fmt(r.perMinuteSaved, 2)}</small>` : ''}</td>
                        <td>${Math.abs(r.change) >= 0.5 ? `<span class="ap-delta ${r.change > 0 ? 'up' : 'down'}">${r.change > 0 ? '+' : ''}${fmt(r.change, 0)}%</span>` : '<small>–</small>'}</td>
                        <td><div class="ap-bar"><i style="width:${(r.coinShare / maxShare * 100).toFixed(1)}%"></i><span>${fmt(r.coinShare)}%</span></div></td>
                        <td>${fmt(r.timeShare)}%</td>
                        <td><button class="btn small-btn ap-adjust" data-key="${esc(r.key)}">Adjust</button></td>
                    </tr>${state.open === r.key ? `<tr class="ap-editor-row"><td colspan="9">${adjustEditor(r)}</td></tr>` : ''}`;
                }).join('')}</tbody>
            </table></div>` : '<p class="ap-note">No records for this grade and period.</p>';
        document.querySelectorAll('#ap-tasks th[data-sort]').forEach(th => th.addEventListener('click', () => {
            const key = th.dataset.sort;
            state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : (key === 'name' ? 1 : -1) };
            renderTasks();
        }));
        document.querySelectorAll('#ap-tasks .ap-adjust').forEach(b => b.addEventListener('click', () => { state.open = state.open === b.dataset.key ? null : b.dataset.key; renderTasks(); }));
        bindAdjustEditor();
    }
    // the per-task factor of one kind of task: its codes exactly, for some or all grades
    function adjustEditor(row) {
        const rule = ruleFor(row.codes, state.grade);
        const grades = rule ? rule.grades : (state.grade === 'all' ? null : [state.grade]);
        const g = state.grade === 'all' ? 2 : state.grade, p = state.period === 'all' ? currentSchoolPeriod : state.period;
        const withoutRule = perCorrect(row.codes, g, p, { ...state.draft, overrides: state.draft.overrides.filter(o => o !== rule) });
        return `<div class="ap-editor" data-key="${esc(row.key)}">
            <div class="ap-editor-line"><b>${esc(row.name)}</b></div>
            <div class="ap-editor-line">
                <label>Factor <input type="number" class="ap-factor" step="0.05" min="0" max="10" value="${rule ? rule.factor : 1}"></label>
                <span class="ap-preview" data-base="${withoutRule}">${fmt(withoutRule, 2)} → <b>${fmt(withoutRule * (rule ? rule.factor : 1), 2)}</b> coins / correct (grade ${g}, ${PERIOD_NAMES[p]})</span>
            </div>
            <div class="ap-editor-line">Grades: ${GRADES.map(x => `<label class="ap-check"><input type="checkbox" class="ap-grade" value="${x}" ${!grades || grades.includes(x) ? 'checked' : ''}> ${x}</label>`).join('')}</div>
            <div class="ap-editor-line"><input type="text" class="ap-note-input" maxlength="200" placeholder="Why (optional)" value="${esc(rule ? rule.note : '')}"></div>
            <div class="ap-editor-line">
                <button class="btn small-btn ap-rule-set">${rule ? 'Update adjustment' : 'Add adjustment'}</button>
                ${rule ? '<button class="btn btn-danger small-btn ap-rule-del">Remove adjustment</button>' : ''}
                <small>Only this exact kind of task. It goes into the draft - save to apply.</small>
            </div>
        </div>`;
    }
    function bindAdjustEditor() {
        const box = document.querySelector('#ap-tasks .ap-editor');
        if (!box) return;
        const key = box.dataset.key;
        const kind = state.data.kinds.get(key);
        const factor = box.querySelector('.ap-factor'), preview = box.querySelector('.ap-preview');
        factor.addEventListener('input', () => {
            const base = Number(preview.dataset.base), f = Number(factor.value);
            preview.querySelector('b').textContent = fmt(base * (isFinite(f) ? f : 1), 2);
        });
        const existing = ruleFor(kind.codes, state.grade);
        box.querySelector('.ap-rule-set').addEventListener('click', () => {
            const f = Number(factor.value);
            if (!isFinite(f) || f < 0 || f > 10) { alert('Factor must be 0–10'); return; }
            const grades = [...box.querySelectorAll('.ap-grade:checked')].map(i => Number(i.value));
            if (!grades.length) { alert('Pick at least one grade'); return; }
            const rule = { id: existing ? existing.id : `r${Date.now()}`, codes: [...kind.codes].sort(), grades: grades.length === 6 ? null : grades, factor: f, note: box.querySelector('.ap-note-input').value.trim() };
            state.draft.overrides = state.draft.overrides.filter(o => o !== existing).concat(rule);
            state.open = null;
            render();
        });
        const del = box.querySelector('.ap-rule-del');
        if (del) del.addEventListener('click', () => { state.draft.overrides = state.draft.overrides.filter(o => o !== existing); state.open = null; render(); });
    }

    // ------------------------------------------------------------ weights
    function renderWeights() {
        const p = state.editPeriod || currentSchoolPeriod;
        const draft = state.draft.periods[p], saved = state.saved.periods[p] || {};
        const q = state.search.toLowerCase();
        const codes = Object.keys(draft).sort((a, b) => (a === 'base' ? -1 : b === 'base' ? 1 : order(a) - order(b) || a.localeCompare(b)))
            .filter(c => !q || c.toLowerCase().includes(q) || codeName(c).toLowerCase().includes(q) || String(draft[c].label).toLowerCase().includes(q));
        document.getElementById('ap-weights').innerHTML = `
            <div class="ap-toolbar">
                <label>Period <select id="ap-edit-period">${PERIODS.map(x => `<option value="${x}" ${x === p ? 'selected' : ''}>${x} (${PERIOD_NAMES[x]})${x === currentSchoolPeriod ? ' – now' : ''}</option>`).join('')}</select></label>
                <input type="search" id="ap-weight-search" placeholder="Filter codes…" value="${esc(state.search)}">
                <button class="btn btn-secondary small-btn" id="ap-reset-period">Undo this period's changes</button>
            </div>
            <div class="ap-scroll"><table class="ap-table ap-weights">
                <thead><tr><th>Code</th><th>Setting</th>${GRADES.map(g => `<th>Grade ${g}</th>`).join('')}</tr></thead>
                <tbody>${codes.map(c => `<tr><td><code>${esc(c)}</code></td><td>${esc(codeName(c))}</td>${GRADES.map(g => {
                    const v = draft[c].values[g], was = saved[c] ? saved[c].values[g] : null;
                    return `<td><input type="number" step="0.05" min="0" max="20" data-code="${esc(c)}" data-grade="${g}" value="${v}" class="${was != null && Number(was) !== Number(v) ? 'ap-changed' : ''}" title="${was != null && Number(was) !== Number(v) ? 'saved: ' + was : ''}"></td>`;
                }).join('')}</tr>`).join('')}</tbody>
            </table></div>
            <p class="ap-note">Grade = the student's knowledge level (0–5). A code's weight multiplies the coins of every task with that setting; 1 = no change, 0 = no coins.</p>`;
        document.getElementById('ap-edit-period').addEventListener('change', e => { state.editPeriod = e.target.value; renderWeights(); });
        document.getElementById('ap-weight-search').addEventListener('input', e => { state.search = e.target.value; renderWeights(); document.getElementById('ap-weight-search').focus(); });
        document.querySelectorAll('#ap-weights input[data-code]').forEach(inp => inp.addEventListener('change', () => {
            const v = Number(inp.value);
            if (!isFinite(v) || v < 0 || v > 20) { alert('A weight must be 0–20'); inp.value = draft[inp.dataset.code].values[inp.dataset.grade]; return; }
            draft[inp.dataset.code].values[Number(inp.dataset.grade)] = v;
            // (the table is not drawn again - the cursor stays - so the changed mark is set here)
            const was = saved[inp.dataset.code] ? Number(saved[inp.dataset.code].values[inp.dataset.grade]) : null;
            inp.classList.toggle('ap-changed', was != null && was !== v);
            inp.title = was != null && was !== v ? 'saved: ' + was : '';
            render(true);
        }));
        document.getElementById('ap-reset-period').addEventListener('click', () => { state.draft.periods[p] = clone(state.saved.periods[p]); render(); });
    }

    // ------------------------------------------------------------ adjustments
    function renderRules() {
        const rules = state.draft.overrides;
        document.getElementById('ap-rules').innerHTML = rules.length ? `
            <table class="ap-table"><thead><tr><th>Kind of task</th><th>Grades</th><th>Factor</th><th>Note</th><th></th></tr></thead>
            <tbody>${rules.map((o, i) => `<tr><td>${esc(kindName(new Set(o.codes)))}</td><td>${o.grades ? o.grades.join(', ') : 'all'}</td><td>×${fmt(o.factor, 2)}</td><td>${esc(o.note || '')}</td>
                <td><button class="btn btn-danger small-btn" data-del="${i}">Remove</button></td></tr>`).join('')}</tbody></table>
            <p class="ap-note">A task gets the factor of the most specific adjustment whose settings it all has.</p>`
            : '<p class="ap-note">No per-task adjustments. Use "Adjust" in the tasks table to add one.</p>';
        document.querySelectorAll('#ap-rules [data-del]').forEach(b => b.addEventListener('click', () => { state.draft.overrides.splice(Number(b.dataset.del), 1); render(); }));
    }

    // ------------------------------------------------------------ save
    function renderStatus() {
        const d = dirty();
        const m = state.meta || {};
        document.getElementById('ap-save').disabled = !d;
        document.getElementById('ap-discard').disabled = !d;
        document.getElementById('ap-state').innerHTML = (d ? '<b class="ap-unsaved">Unsaved changes in the draft.</b> ' : '')
            + (m.stored ? `Saved weights from ${new Date(m.updatedAt).toLocaleString('lt-LT')}.` : 'The database has no weights yet - the built-in ones are shown. Saving stores them.')
            + ` Students' browsers pick up a change within a day.`;
    }
    async function save() {
        if (!dirty() && state.meta.stored) return;
        if (!confirm('Save the draft weights? Students will earn coins with them (browsers update within a day).')) return;
        const res = await apiFetch(`${apiBase}admin/settings/points`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ periods: state.draft.periods, overrides: state.draft.overrides }) });
        const body = res ? await res.json().catch(() => ({})) : {};
        if (!res || !res.ok) { alert('Not saved: ' + (body.message || 'error')); return; }
        state.saved = { v: 1, periods: body.periods, overrides: body.overrides || [] };
        state.draft = clone(state.saved);
        state.meta = { stored: true, updatedAt: body.updatedAt, updatedBy: body.updatedBy };
        // (this browser uses them at once)
        try { localStorage.setItem(POINT_SETTINGS_KEY, JSON.stringify({ at: Date.now(), data: body })); applyPointSettings(body); } catch (e) { /* storage */ }
        render();
    }

    function render(keepWeights) {
        if (!state.data) return;
        document.getElementById('ap-range').textContent = `${state.data.from} – ${state.data.to}: ${state.data.records.length} records`;
        renderStatus();
        renderGrades();
        renderTasks();
        if (!keepWeights) renderWeights();
        renderRules();
    }

    function mount() {
        const host = document.getElementById('points-tab');
        if (!host || host.dataset.ready) return;
        host.dataset.ready = '1';
        const today = new Date().toISOString().slice(0, 10), yearAgo = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
        host.innerHTML = `
            <h2>Coins for tasks</h2>
            <p class="ap-note">How many coins tasks give, worked out again from the results archive. Change weights or adjust single tasks in the draft, compare, then save.</p>
            <div class="ap-toolbar ap-sticky">
                <label>From <input type="date" id="ap-from" value="${yearAgo}"></label>
                <label>To <input type="date" id="ap-to" value="${today}"></label>
                <button class="btn small-btn" id="ap-load">Load</button>
                <label>Grade <select id="ap-grade"><option value="all">All</option>${GRADES.map(g => `<option value="${g}">${g}</option>`).join('')}</select></label>
                <label>Period <select id="ap-period"><option value="all">All</option>${PERIODS.map(p => `<option value="${p}">${p} (${PERIOD_NAMES[p]})</option>`).join('')}</select></label>
                <span id="ap-range" class="ap-note"></span>
                <span class="ap-spacer"></span>
                <button class="btn" id="ap-save" disabled>💾 Save weights</button>
                <button class="btn btn-secondary" id="ap-discard" disabled>Discard draft</button>
            </div>
            <div id="ap-state" class="ap-note"></div>
            <div id="ap-status"></div>
            <div class="ap-section"><h3>Grades</h3><div class="ap-grid"><div id="ap-grades"></div><div class="ap-chart-box"><canvas id="ap-chart"></canvas></div></div></div>
            <div class="ap-section"><h3>Tasks</h3><div id="ap-tasks"></div></div>
            <div class="ap-section"><h3>Per-task adjustments</h3><div id="ap-rules"></div></div>
            <button type="button" id="ap-fab" aria-expanded="false" aria-controls="ap-drawer">⚖️ Weights</button>
            <aside id="ap-drawer" hidden aria-label="Weights">
                <div class="ap-drawer-head"><h3>Weights</h3><button type="button" id="ap-drawer-close" aria-label="Close">×</button></div>
                <p class="ap-note">Changes go into the draft: the tasks and grades behind update at once.</p>
                <div id="ap-weights"></div>
            </aside>`;
        document.getElementById('ap-load').addEventListener('click', loadAll);
        const fab = document.getElementById('ap-fab'), drawer = document.getElementById('ap-drawer');
        // (out of the tab: its blur would make "fixed" relative to the tab, not the window; shown only with the tab open)
        document.body.append(fab, drawer);
        const toggleDrawer = open => { drawer.hidden = !open; fab.setAttribute('aria-expanded', String(open)); fab.classList.toggle('on', open); };
        fab.addEventListener('click', () => toggleDrawer(drawer.hidden));
        document.getElementById('ap-drawer-close').addEventListener('click', () => toggleDrawer(false));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) toggleDrawer(false); });
        document.getElementById('ap-grade').addEventListener('change', e => { state.grade = e.target.value === 'all' ? 'all' : Number(e.target.value); state.open = null; render(true); });
        document.getElementById('ap-period').addEventListener('change', e => { state.period = e.target.value; if (e.target.value !== 'all') state.editPeriod = e.target.value; state.open = null; render(); });
        document.getElementById('ap-save').addEventListener('click', save);
        document.getElementById('ap-discard').addEventListener('click', () => { if (confirm('Discard all unsaved changes?')) { state.draft = clone(state.saved); state.open = null; render(); } });
        window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
        loadAll();
    }

    const style = document.createElement('style');
    style.textContent = `
        #points-tab .ap-note{font-size:13px;color:rgba(0,0,0,.65);margin:6px 0}
        #points-tab .ap-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0}
        #points-tab .ap-toolbar label{display:flex;gap:6px;align-items:center;font-size:14px}
        #points-tab .ap-toolbar input,#points-tab .ap-toolbar select{padding:6px 8px;border-radius:8px;border:1px solid rgba(0,0,0,.15);font:inherit;background:rgba(255,255,255,.8)}
        #points-tab .ap-sticky{position:sticky;top:-25px;z-index:5;background:#ffe2c4;padding:10px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.08)}
        #points-tab .ap-spacer{flex:1}
        #points-tab .ap-section{background:rgba(255,255,255,.35);border-radius:14px;padding:14px;margin:14px 0}
        #points-tab .ap-section h3{margin-bottom:8px}
        #points-tab .ap-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px;align-items:start}
        #points-tab .ap-chart-box{height:260px;background:rgba(255,255,255,.6);border-radius:10px;padding:8px}
        #points-tab .ap-scroll{overflow:auto;max-height:70vh}
        #points-tab .ap-table{width:100%;border-collapse:collapse;font-size:14px;background:rgba(255,255,255,.7);border-radius:10px;overflow:hidden}
        #points-tab .ap-table th,#points-tab .ap-table td{padding:7px 9px;border-bottom:1px solid rgba(0,0,0,.06);text-align:left;vertical-align:top}
        #points-tab .ap-table th{background:rgba(255,255,255,.9);position:sticky;top:0;font-size:13px;white-space:nowrap}
        #points-tab .ap-sortable{cursor:pointer;user-select:none}
        #points-tab tr[data-grade]{cursor:pointer}
        #points-tab tr.ap-sel td{background:rgba(35,134,111,.12)}
        #points-tab .ap-name{min-width:260px}
        #points-tab .ap-name small,#points-tab td small{color:rgba(0,0,0,.55)}
        #points-tab .ap-delta{font-size:12px;font-weight:600}
        #points-tab .ap-delta.up{color:#b0412e} #points-tab .ap-delta.down{color:#2f7f5f}
        #points-tab .ap-flag{display:inline-block;font-size:11px;font-weight:700;padding:1px 6px;border-radius:8px;text-transform:uppercase}
        #points-tab .ap-flag.hi{background:#f8d7d3;color:#9b2c1f} #points-tab .ap-flag.lo{background:#d9e8f2;color:#1d566e}
        #points-tab .ap-chip{display:inline-block;font-size:12px;font-weight:600;padding:1px 7px;border-radius:8px;background:#fde9b8;color:#7a5200}
        #points-tab .ap-bar{position:relative;min-width:110px;height:18px;background:rgba(0,0,0,.05);border-radius:6px}
        #points-tab .ap-bar i{position:absolute;left:0;top:0;bottom:0;background:rgba(35,134,111,.35);border-radius:6px}
        #points-tab .ap-bar span{position:relative;padding-left:6px;font-size:12px;line-height:18px}
        #points-tab .ap-weights input{width:70px;padding:4px 6px;border-radius:6px;border:1px solid rgba(0,0,0,.15);font:inherit}
        #points-tab .ap-weights input.ap-changed{background:#fff3cd;border-color:#e0b400;font-weight:600}
        #points-tab .ap-editor{display:flex;flex-direction:column;gap:8px;background:#fffaf0;padding:10px;border-radius:10px}
        #points-tab .ap-editor-line{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
        #points-tab .ap-editor input[type=number]{width:80px;padding:4px 6px}
        #points-tab .ap-editor .ap-note-input{flex:1;min-width:240px;padding:5px 8px}
        #points-tab .ap-check{display:inline-flex;gap:3px;align-items:center}
        #points-tab .ap-unsaved{color:#9b2c1f}
        #points-tab .ap-flag.lv{background:#e6e6e6;color:#555}
        #ap-fab{position:fixed;right:24px;bottom:24px;z-index:9000;border:0;border-radius:28px;padding:14px 20px;background:#23866f;color:#fff;font:700 15px 'SFpro',sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer}
        #ap-fab.on{background:#1d566e}
        #ap-drawer{position:fixed;top:0;right:0;bottom:0;z-index:9001;width:min(760px,96vw);overflow:auto;background:#fff7ee;box-shadow:-8px 0 30px rgba(0,0,0,.2);padding:16px 18px 90px}
        #ap-drawer[hidden]{display:none}
        #ap-drawer .ap-drawer-head{display:flex;justify-content:space-between;align-items:center;position:sticky;top:-16px;background:#fff7ee;padding:6px 0;z-index:2}
        #ap-drawer-close{width:34px;height:34px;border:0;border-radius:50%;background:rgba(0,0,0,.07);font-size:20px;cursor:pointer}
        #ap-drawer .ap-scroll{max-height:none}
        #ap-drawer .ap-table th{position:static}
        body:not(:has(#points-tab.active)) #ap-fab,body:not(:has(#points-tab.active)) #ap-drawer{display:none}
        #ap-drawer .ap-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0}
        #ap-drawer .ap-toolbar label{display:flex;gap:6px;align-items:center;font-size:14px}
        #ap-drawer .ap-toolbar input,#ap-drawer .ap-toolbar select{padding:6px 8px;border-radius:8px;border:1px solid rgba(0,0,0,.15);font:inherit;background:#fff}
        #ap-drawer .ap-note{font-size:13px;color:rgba(0,0,0,.65);margin:6px 0}
        #ap-drawer .ap-table{width:100%;border-collapse:collapse;font-size:14px;background:#fff;border-radius:10px}
        #ap-drawer .ap-table th,#ap-drawer .ap-table td{padding:6px 8px;border-bottom:1px solid rgba(0,0,0,.06);text-align:left;vertical-align:middle}
        #ap-drawer .ap-weights input{width:74px;padding:4px 6px;border-radius:6px;border:1px solid rgba(0,0,0,.15);font:inherit}
        #ap-drawer .ap-weights input.ap-changed{background:#fff3cd;border-color:#e0b400;font-weight:600}
        @media (max-width:900px){#points-tab .ap-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
    window.AdminPoints = { mount };
})();
