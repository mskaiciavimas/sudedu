/* ghost-groups.js – the groups editor of a Vaiduoklis (ghost) lobby: who plays in which group. Used by the class
 * lobby (klase-games.js, moves go to the game server) and by the demo on the game page (moves stay local).
 *
 *   GhostGroups.render(container, {
 *     groups: [{ id, members: [{ id, name, av, avatar, bot, sim, me, off, ready }] }]
 *                                  (avatar: the student's avatar as HTML/SVG from this site; av: an emoji for bots)
 *     host: bool                   this viewer runs the game: moves anyone, removes people and bots
 *     canMove(member) -> bool      who this viewer may move (a student: only themselves; the host: anyone)
 *     canAddGroup, canAddBot, canAddSim, maxBots                    (bools / number)
 *     single: one group only (a student's game): titled "Žaidėjai"; max = its size (bots included)
 *     maxPeople: players allowed in one group of a teacher's game (bots included) – a full group takes nobody more
 *     onMove(memberId, groupId), onAddGroup(), onAddBot(groupId), onRemove(botOrSimId), onKick(personId), onAddSim(groupId)
 *   })
 *
 * The host drags a name to another group (mouse), or taps it: a pop-up with the group to move to and "Pašalinti".
 * A student taps the group they want to switch to.
 *
 *   GhostGroups.menu({ title, avatar, note, groups: [{ id, label, disabled }], current, onMove(groupId),
 *                      removeLabel, onRemove() })   – that pop-up on its own (the game page's teacher overview uses it)
 *   GhostGroups.avatar(member)    – the small round avatar used here (HTML)
 */
(function () {
	'use strict';
	const CSS = `
	.gg-wrap { display: grid; gap: 10px; }
	.gg-hint { font-size: 13.5px; color: #3c4f59; margin: 0; }
	.gg-groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr)); gap: 10px; }
	.gg-group { background: rgba(255,255,255,.62); border: 2px solid transparent; border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-width: 0;
		transition: border-color .15s, background .15s; }
	.gg-group.join { cursor: pointer; border-color: rgba(40,109,138,.25); border-style: dashed; }
	.gg-group.join:hover { border-color: #286D8A; background: rgba(255,255,255,.8); }
	.gg-group.drop-ok { border-color: rgba(40,109,138,.45); border-style: dashed; }
	.gg-group.drop-over { border-color: #286D8A; border-style: solid; background: #e7f4fa; }
	/* the title, "Pereiti" and the count: on a narrow card the count moves to its own line (right-aligned) instead of
	   spilling out of the card */
	.gg-head { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 6px; font-weight: 800; color: #1d566e; min-width: 0; }
	.gg-head small { font-weight: 700; color: #3c4f59; margin-left: auto; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
	.gg-head small.bad { color: #b3261e; }
	.gg-join { margin-left: 6px; border: 0; border-radius: 9px; padding: 4px 10px; font: inherit; font-size: 12.5px; font-weight: 800; color: #fff; background: linear-gradient(#3288AC, #286D8A); cursor: pointer; }
	.gg-list { display: flex; flex-wrap: wrap; gap: 6px; min-height: 40px; align-content: flex-start; }
	.gg-chip { display: inline-flex; align-items: center; gap: 7px; max-width: 100%; padding: 3px 10px 3px 3px; border-radius: 999px; border: 2px solid transparent;
		background: #fff; color: #1f2a30; font: inherit; font-size: 14px; font-weight: 700; cursor: default; touch-action: manipulation; user-select: none; }
	.gg-chip .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gg-chip.can { cursor: pointer; }
	.gg-chip.can:hover { border-color: rgba(40,109,138,.35); }
	.gg-chip.drag { cursor: grab; }
	.gg-chip.dragging { opacity: .4; }
	.gg-chip.me { background: #e7f4fa; }
	.gg-chip.bot { background: rgba(255,255,255,.8); color: #3c4f59; }
	.gg-chip.off { opacity: .55; }
	.gg-av { position: relative; flex: none; width: 30px; height: 30px; border-radius: 50%; background: #d8eef7; display: grid; place-items: center; font-size: 17px; line-height: 1; }
	.gg-av > .gg-av-in { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; display: grid; place-items: center; }
	.gg-av svg { width: 100%; height: 100%; }
	.gg-av .gg-ini { font-size: 13px; font-weight: 800; color: #1d566e; }
	.gg-ok { position: absolute; right: -4px; top: -4px; width: 16px; height: 16px; border-radius: 50%; background: #32ac93; color: #F5F5F7; border: 2px solid #F5F5F7;
		display: grid; place-items: center; font-size: 9px; font-style: normal; font-weight: 900; }
	.gg-empty { font-size: 13px; color: #3c4f59; padding: 8px 2px; }
	.gg-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
	.gg-btn { border: 0; border-radius: 10px; padding: 7px 11px; font: inherit; font-size: 13.5px; font-weight: 800; cursor: pointer; background: rgba(40,109,138,.12); color: #1d566e; touch-action: manipulation; }
	.gg-btn:disabled { opacity: .45; cursor: default; }
	.gg-add { justify-self: start; }
	/* the pop-up: move to a group / remove */
	.gg-modal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,.45); font-family: inherit; }
	.gg-sheet { width: min(100%, 360px); background: #F5F5F7; border-radius: 16px; padding: 18px; box-shadow: 0 12px 40px rgba(0,0,0,.25); color: #1f2a30; display: grid; gap: 14px; }
	.gg-sheet-head { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; font-weight: 800; min-width: 0; }
	.gg-sheet-head .gg-av { width: 46px; height: 46px; font-size: 26px; }
	.gg-sheet-head span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gg-sheet-note { margin: -6px 0 0; font-size: .85rem; color: #718096; font-weight: 600; }
	.gg-sheet label { display: grid; gap: 5px; font-weight: 700; font-size: .9rem; }
	.gg-sheet select { width: 100%; box-sizing: border-box; border: 1px solid rgba(40,109,138,.25); background: #fff; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 1rem; color: #212529; }
	.gg-sheet-btns { display: flex; gap: 8px; justify-content: space-between; flex-wrap: wrap; }
	.gg-sheet-btns button { flex: 1 1 auto; border: 0; border-radius: 20px; padding: 10px 16px; font: inherit; font-size: .95rem; font-weight: 700; cursor: pointer; color: #F5F5F7; }
	.gg-sheet-btns .red { background: linear-gradient(135deg, #ff8073, #e74c3c); }
	.gg-sheet-btns .grey { background: linear-gradient(135deg, #95a5a6, #aeb4b5); }
	`;
	let styled = false;
	function style() { if (!styled) { const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st); styled = true; } }
	const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	// Lithuanian number agreement: 1 žaidėjas, 2 žaidėjai, 10 žaidėjų, 21 žaidėjas
	const plural = (n, one, few, many) => { const t = n % 10, h = n % 100; return n + ' ' + (t === 1 && h !== 11 ? one : t >= 2 && t <= 9 && (h < 12 || h > 19) ? few : many); };
	const finePointer = () => window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
	const isBot = m => m.bot && !m.sim;
	const state = new WeakMap();   // container -> { opts, drag, pending }

	// a member's small round avatar: the student's own avatar, a bot's emoji, else their initial; a tick when ready
	function avatar(m) {
		const inner = m.avatar ? m.avatar : m.av ? esc(m.av) : isBot(m) ? '🤖' : `<span class="gg-ini">${esc(String(m.name || '?').trim().charAt(0).toLocaleUpperCase('lt'))}</span>`;
		return `<span class="gg-av"><span class="gg-av-in">${inner}</span>${m.ready ? '<i class="gg-ok">✓</i>' : ''}</span>`;
	}

	const peopleOf = g => g.members.filter(m => !isBot(m)).length;
	const botsOf = g => g.members.filter(isBot).length;
	const findMember = (o, id) => { for (const g of o.groups) { const m = g.members.find(x => String(x.id) === String(id)); if (m) return [g, m]; } return [null, null]; };
	// a group's size (people and bots together): full -> nobody more, bots neither
	const sizeOf = o => (o.single ? o.max : o.maxPeople) || 0;
	const isFull = (o, g) => !!sizeOf(o) && g.members.length >= sizeOf(o);
	// may this member go to group g?
	function fits(o, m, from, g) {
		if (!g || g === from || o.single) return false;
		if (isBot(m) && botsOf(g) >= (o.maxBots || 4)) return false;
		return !isFull(o, g);
	}

	function render(box, opts) {
		style();
		let st = state.get(box);
		if (!st) {
			st = { opts, drag: null, pending: null };
			state.set(box, st);
			box.addEventListener('click', e => click(box, e));
			box.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.gg-chip.can')) { e.preventDefault(); click(box, e); } });
			wireDrag(box, st);
		}
		// a drag in progress keeps its elements: the newest state is drawn when it ends
		if (st.drag) { st.pending = opts; return; }
		st.opts = opts;
		const host = !!opts.host, fine = finePointer();
		const meM = opts.groups.flatMap(g => g.members).find(m => m.me);
		const meG = meM && opts.groups.find(g => g.members.includes(meM));
		const selfMove = !host && meM && opts.canMove(meM) && !opts.single;
		const hint = opts.single ? '' : host
			? (fine ? 'Tempkite mokinį ar botą į kitą grupę arba paspauskite jo vardą – galėsite perkelti ar pašalinti.' : 'Paspauskite mokinio ar boto vardą – galėsite perkelti jį į kitą grupę ar pašalinti.')
			: selfMove ? 'Norite žaisti kitoje grupėje? Paspauskite ją.' : '';
		box.innerHTML = `<div class="gg-wrap">
			${hint ? `<p class="gg-hint">${hint}</p>` : ''}
			<div class="gg-groups">${opts.groups.map((g, i) => {
				const people = peopleOf(g), bots = botsOf(g);
				const small = g.members.length && people && g.members.length < 2;
				const full = isFull(opts, g);
				const join = selfMove && fits(opts, meM, meG, g);
				return `<div class="gg-group${join ? ' join' : ''}" data-g="${esc(g.id)}"${join ? ` data-join="${esc(g.id)}"` : ''}>
					<div class="gg-head">${opts.single ? 'Žaidėjai' : 'Grupė ' + (i + 1)}${join ? '<button class="gg-join" type="button" tabindex="-1">Pereiti</button>' : ''}<small class="${small ? 'bad' : ''}">${plural(people, 'žaidėjas', 'žaidėjai', 'žaidėjų') + (bots ? ' · ' + plural(bots, 'botas', 'botai', 'botų') : '')}</small></div>
					<div class="gg-list">${g.members.length ? g.members.map(m => {
						// the host: anyone (in a one-group game only to remove them, so not themselves)
						const id = String(m.id), can = host && !(opts.single && m.me) && (opts.single || opts.canMove(m));
						return `<span class="gg-chip${can ? ' can' : ''}${can && fine && !opts.single ? ' drag' : ''}${m.me ? ' me' : ''}${isBot(m) ? ' bot' : ''}${m.off ? ' off' : ''}"`
							+ (can ? ` data-m="${esc(id)}" role="button" tabindex="0"${fine && !opts.single ? ' draggable="true"' : ''}` : '') + '>'
							+ avatar(m) + `<span class="nm">${esc(m.me ? m.name + ' (aš)' : m.name)}</span></span>`;
					}).join('') : '<span class="gg-empty">Tuščia grupė</span>'}</div>
					<div class="gg-row">
						${opts.canAddBot ? `<button class="gg-btn" type="button" data-bot="${esc(g.id)}"${bots >= (opts.maxBots || 4) || full ? ' disabled' : ''}>+ Botas</button>` : ''}
						${opts.canAddSim ? `<button class="gg-btn" type="button" data-sim="${esc(g.id)}"${full ? ' disabled' : ''}>+ Mokinys</button>` : ''}
					</div>
				</div>`;
			}).join('')}</div>
			${opts.canAddGroup ? '<button class="gg-btn gg-add" type="button" data-addgroup="1">+ Grupė</button>' : ''}
		</div>`;
	}

	function click(box, e) {
		const st = state.get(box), o = st.opts;
		const t = e.target.closest('[data-m],[data-bot],[data-sim],[data-addgroup],[data-join]');
		if (!t || t.disabled) return;
		if (t.dataset.m) { openMenu(o, t.dataset.m); return; }
		if (t.dataset.bot) { o.onAddBot && o.onAddBot(t.dataset.bot); return; }
		if (t.dataset.sim) { o.onAddSim && o.onAddSim(t.dataset.sim); return; }
		if (t.dataset.addgroup) { o.onAddGroup && o.onAddGroup(); return; }
		if (t.dataset.join) { const meM = o.groups.flatMap(g => g.members).find(m => m.me); if (meM) o.onMove && o.onMove(String(meM.id), t.dataset.join); }
	}

	// the host's pop-up for one member: the group they play in (change it to move them) and "Pašalinti"
	function openMenu(o, id) {
		const [from, m] = findMember(o, id);
		if (!m) return;
		const bot = isBot(m);
		menu({
			title: m.name, avatar: avatar(Object.assign({}, m, { ready: false })),
			note: bot ? 'Botas' : m.sim ? 'Mokinys (demonstracija)' : '',
			groups: o.single ? [] : o.groups.map((g, i) => ({ id: g.id, label: 'Grupė ' + (i + 1) + (g !== from && !fits(o, m, from, g) ? ' (pilna)' : ''), disabled: g !== from && !fits(o, m, from, g) })),
			current: from.id,
			onMove: gid => o.onMove && o.onMove(String(m.id), gid),
			removeLabel: bot || m.sim ? 'Pašalinti botą' : m.me ? '' : 'Pašalinti iš žaidimo',
			onRemove: bot || m.sim ? (o.onRemove && (() => o.onRemove(String(m.id)))) : (o.onKick && (() => o.onKick(String(m.id))))
		});
	}

	function menu(c) {
		style();
		const old = document.querySelector('.gg-modal');
		if (old) old.remove();
		const el = document.createElement('div');
		el.className = 'gg-modal';
		el.innerHTML = `<div class="gg-sheet" role="dialog" aria-modal="true">
			<div class="gg-sheet-head">${c.avatar || ''}<span>${esc(c.title)}</span></div>
			${c.note ? `<p class="gg-sheet-note">${esc(c.note)}</p>` : ''}
			${c.groups && c.groups.length > 1 ? `<label>Grupė<select>${c.groups.map(g => `<option value="${esc(g.id)}"${String(g.id) === String(c.current) ? ' selected' : ''}${g.disabled ? ' disabled' : ''}>${esc(g.label)}</option>`).join('')}</select></label>` : ''}
			<div class="gg-sheet-btns">${c.onRemove && c.removeLabel ? `<button class="red" type="button" data-rm>${esc(c.removeLabel)}</button>` : ''}<button class="grey" type="button" data-close>Uždaryti</button></div>
		</div>`;
		const close = () => { el.remove(); document.removeEventListener('keydown', onKey); };
		const onKey = e => { if (e.key === 'Escape') close(); };
		el.addEventListener('click', e => {
			if (e.target === el || e.target.closest('[data-close]')) close();
			else if (e.target.closest('[data-rm]')) { close(); c.onRemove(); }
		});
		const sel = el.querySelector('select');
		if (sel) sel.addEventListener('change', () => { const v = sel.value; close(); if (String(v) !== String(c.current)) c.onMove(v); });
		document.addEventListener('keydown', onKey);
		document.body.appendChild(el);
		(sel || el.querySelector('[data-close]')).focus();
		return close;
	}

	// drag and drop (mouse): pick up a name, drop it on another group
	function wireDrag(box, st) {
		const groupAt = e => e.target.closest && e.target.closest('.gg-group');
		const clear = () => box.querySelectorAll('.drop-ok,.drop-over,.dragging').forEach(x => x.classList.remove('drop-ok', 'drop-over', 'dragging'));
		box.addEventListener('dragstart', e => {
			const chip = e.target.closest && e.target.closest('.gg-chip[data-m]');
			if (!chip) return;
			const o = st.opts, [from, m] = findMember(o, chip.dataset.m);
			if (!m) return;
			st.drag = { id: chip.dataset.m, from, m };
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', chip.dataset.m);
			chip.classList.add('dragging');
			box.querySelectorAll('.gg-group').forEach(el => { const g = o.groups.find(x => String(x.id) === el.dataset.g); if (fits(o, m, from, g)) el.classList.add('drop-ok'); });
		});
		box.addEventListener('dragover', e => {
			const el = groupAt(e);
			if (!st.drag || !el || !el.classList.contains('drop-ok')) return;
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';
			box.querySelectorAll('.drop-over').forEach(x => { if (x !== el) x.classList.remove('drop-over'); });
			el.classList.add('drop-over');
		});
		box.addEventListener('dragleave', e => { const el = groupAt(e); if (el && !el.contains(e.relatedTarget)) el.classList.remove('drop-over'); });
		box.addEventListener('drop', e => {
			const el = groupAt(e), d = st.drag;
			if (!d || !el || !el.classList.contains('drop-ok')) return;
			e.preventDefault();
			st.opts.onMove && st.opts.onMove(d.id, el.dataset.g);
		});
		box.addEventListener('dragend', () => {
			st.drag = null;
			clear();
			if (st.pending) { const p = st.pending; st.pending = null; render(box, p); }
		});
	}

	// the same start rules as the game server: empty groups and groups with only bots are left out, a group with a
	// single participant blocks the start. -> { groups, error }
	function forStart(groups) {
		const keep = groups.filter(g => g.members.some(m => !m.bot || m.sim));
		if (!keep.length) return { groups: keep, error: 'Grupėse nėra žaidėjų.' };
		const lone = keep.find(g => g.members.length < 2);
		if (lone) return { groups: keep, error: `Grupėje ${groups.indexOf(lone) + 1} tik vienas žaidėjas – pridėkite dar žaidėją arba botą.` };
		return { groups: keep, error: null };
	}

	window.GhostGroups = { render, forStart, menu, avatar };
})();
