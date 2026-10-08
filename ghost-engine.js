/* ghost-engine.js – the rules of Vaiduoklis (Ghost), without any screen. One GhostGame = one group playing.
 * Used by LT/vaiduoklio_zodziu_zaidimas.html for: one player with bots, the board ("žaisti lentoje"), the runner of a
 * class game group (the one browser that runs the group's game and bots for everyone in it) and the demo's
 * simulated groups. Needs sudedu-words.js (SudWords).
 *
 *   const g = new GhostGame({ players, lives, timeLimit, botLevel, dict, remote, onChange, onPing, onRemoved, onOver })
 *   g.start()            first round (or g.restore(snapshot) to carry on a game another browser was running)
 *   g.act(id, action)    a player's move: {a:'letter', v:'k'} {a:'challenge'} {a:'submit', v:'žodis'} {a:'concede'}
 *                        {a:'next'} (ready for the next round) {a:'pong'} (still here)
 *   g.presence(id, on)   a remote player's connection dropped / came back
 *   g.holdClock(on)      stop / restart the move clock (e.g. while a pop-up is open on the only player's screen)
 *   g.addPlayer(p)       a player joins a running game (moved here from another group): next in turn order, full lives
 *   g.syncPlayers(list, why)  the people who should be playing ([{ id, name }]): newcomers join, people not listed
 *                        leave; why = { id: 'quit' | 'kicked' } (left themselves / removed by the host), else 'moved'
 *   g.snapshot()         the whole game as a small plain object (what every screen draws; what a runner sends)
 *   g.stop()             no more timers
 *
 * players: [{ id, name, av, bot }] in turn order; `sim` marks a demo's simulated student (played by the bot logic).
 * endWhenOut: a player id – the game is over as soon as that player is out (one player with bots).
 * remote: the human players use other devices – then a player who drops out gets RECONNECT_MS to come back when it is
 * their turn (or their turn comes), the round result waits at most CONFIRM_MS for everyone's "next round", and a turn
 * without a time limit asks the player's browser whether it is still there after IDLE_PING_MS.
 */
(function () {
	'use strict';

	// Same values as the prototype server (ghost_game/back-end/src/server.js).
	// move:   a mistake happens when Math.random() > move (challenging a start that is a word but can still get
	//         longer, or playing a random letter). answer: when challenged on a start that is already a word, the bot
	//         gives up although a longer word exists when Math.random() > answer.
	const BOT_LEVELS = {
		easy:   { move: .5,  answer: .65 },
		normal: { move: .75, answer: .8 },
		hard:   { move: 1,   answer: 1 }
	};
	const BOT_DELAY = 1000;          // a bot "thinks" this long
	const SIM_DELAY = [1800, 4500];  // a demo's simulated student takes this long (random within)
	const INTRO_MS = 1700;           // the "IŠŠŪKIS!" announcement, before the challenged player answers
	const RECONNECT_MS = 60000;      // a dropped player whose turn it is gets this long to come back
	const CONFIRM_MS = 120000;       // everyone has this long to confirm the next round (remote games)
	const IDLE_PING_MS = 60000;      // no move for this long (and no time limit): ask the player's browser
	const PING_REPLY_MS = 10000;     // ... which must answer within this long, else counts as dropped

	const pick = arr => arr[Math.floor(Math.random() * arr.length)];
	const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
	// a bot may only use words that pass the word check (while the check lists load, the bots' own list decides)
	const botOk = w => { const v = SudWords.verifySync(w); return v === null || v === 'ok'; };

	class GhostGame {
		constructor(o) {
			this.o = o;
			this.dict = o.dict;
			this.level = BOT_LEVELS[o.botLevel] || BOT_LEVELS.normal;
			this.timers = new Set();
			this.stopped = false;
			this.clockHeld = false;
			const lives = o.lives || 3;
			this.S = {
				v: 1,
				lives, timeLimit: o.timeLimit || 0,
				players: o.players.map(p => ({ id: String(p.id), name: p.name, av: p.av || '🙂', bot: !!p.bot, sim: !!p.sim, lives, gone: false, conn: true })),
				seats: o.players.map(p => String(p.id)),
				order: o.players.map(p => String(p.id)),
				turn: 0, round: 0, word: '', last: null, phase: 'turn',
				challenger: null, challengee: null, hint: null,
				result: null, ready: [], nextStarter: null, over: false, winner: null,
				checking: null            // the word being checked (so a runner taking over can check it again)
			};
			this.deadline = 0;            // move clock (performance.now() based)
			this.waitUntil = 0;           // waiting for a dropped player to come back
			this.confirmUntil = 0;
			this.idleAt = 0;
		}

		// ---------- helpers ----------
		player(id) { return this.S.players.find(p => p.id === id); }
		current() { return this.S.order[this.S.turn]; }
		isBot(id) { const p = this.player(id); return !!(p && p.bot); }
		human(id) { const p = this.player(id); return !!(p && !p.bot); }
		inChallenge() { return ['intro', 'answer', 'checking', 'botAnswer'].includes(this.S.phase); }
		isWord(s) { return this.dict.has(s) && botOk(s); }
		later(fn, ms) {
			const t = setTimeout(() => { this.timers.delete(t); if (!this.stopped) fn(); }, ms / (this.o.speed || 1));   // speed: tests only
			this.timers.add(t);
			return t;
		}
		cancel(t) { if (t) { clearTimeout(t); this.timers.delete(t); } }
		changed(event) { if (!this.stopped && this.o.onChange) this.o.onChange(this, event); }
		stop() { this.stopped = true; this.timers.forEach(clearTimeout); this.timers.clear(); }
		botDelay(id) { const p = this.player(id); return p && p.sim ? SIM_DELAY[0] + Math.random() * (SIM_DELAY[1] - SIM_DELAY[0]) : BOT_DELAY; }

		// ---------- the game ----------
		start() { this.startRound(this.S.order[0]); }

		startRound(starterId) {
			const S = this.S;
			this.cancelWaits();
			S.round++;
			S.word = '';
			S.last = null;
			S.challenger = S.challengee = null;
			S.result = null;
			S.ready = [];
			S.checking = null;
			S.phase = 'turn';
			S.turn = Math.max(0, S.order.indexOf(starterId));
			S.hint = { k: 'start', id: this.current() };
			this.nextTurn();
		}

		// whoever's move it is now: a bot thinks; a person gets the clock (or the reconnect wait)
		nextTurn() {
			const id = this.current();
			this.armFor(id);
			this.changed('turn');
			if (this.isBot(id)) this.botTimer = this.later(() => this.botTurn(), this.botDelay(id));
		}

		// clocks for a person who has to move: the move time limit, or waiting for them to come back, or the idle check
		armFor(id) {
			this.cancelWaits();
			if (!this.human(id)) return;
			const p = this.player(id);
			if (this.o.remote && !p.conn) { this.startWait(id); return; }
			if (this.S.timeLimit) {
				this.deadline = performance.now() + this.S.timeLimit * 1000;
				this.clockTimer = this.later(() => this.timeUp(), this.S.timeLimit * 1000);
				if (this.clockHeld) this.heldAt = performance.now();   // held already: only from now on counts as held
			}
			else if (this.o.remote) this.armIdle(id);
		}
		cancelWaits() {
			this.cancel(this.clockTimer); this.cancel(this.waitTimer); this.cancel(this.idleTimer); this.cancel(this.pingTimer);
			this.deadline = 0; this.waitUntil = 0; this.waitFor = null;
		}
		timeUp() {
			if (this.clockHeld) { this.clockTimer = this.later(() => this.timeUp(), 250); return; }
			this.deadline = 0;
			const S = this.S;
			if (S.phase === 'turn' && this.human(this.current())) this.endRound(this.current(), { type: 'timeout' });
			else if (S.phase === 'answer' && this.human(S.challengee)) this.endRound(S.challengee, { type: 'timeout' });
		}
		// the move clock stands still while held (single player: a pop-up is open)
		holdClock(on) {
			if (on === this.clockHeld) return;
			this.clockHeld = on;
			if (on) this.heldAt = performance.now();
			else if (this.deadline) {
				const d = performance.now() - this.heldAt;
				this.deadline += d;
				this.cancel(this.clockTimer);
				this.clockTimer = this.later(() => this.timeUp(), Math.max(0, this.deadline - performance.now()));
			}
		}

		// no time limit: after a minute without a move, ask the player's browser whether it is still there
		armIdle(id) {
			this.idleTimer = this.later(() => {
				if (this.o.onPing) this.o.onPing(id);
				this.pingTimer = this.later(() => this.presence(id, false), PING_REPLY_MS);
			}, IDLE_PING_MS);
		}

		// a dropped player whose move it is gets RECONNECT_MS to come back, else leaves the game (and the round ends)
		startWait(id) {
			this.waitFor = id;
			this.waitUntil = performance.now() + RECONNECT_MS;
			this.waitTimer = this.later(() => this.removePlayer(id, 'gone'), RECONNECT_MS);
		}

		presence(id, on) {
			const p = this.player(id);
			if (!p || p.gone || p.conn === on) return;
			p.conn = on;
			const S = this.S;
			const theirMove = (S.phase === 'turn' && this.current() === id) || (S.phase === 'answer' && S.challengee === id);
			if (theirMove) {
				if (!on) { this.cancelWaits(); this.startWait(id); }
				else { this.armFor(id); }          // back: the move clock starts again from the full time
			}
			this.changed('presence');
		}

		act(id, x) {
			id = String(id);
			const S = this.S, a = x && x.a;
			if (!this.player(id) || this.player(id).gone || S.over) return false;
			if (a === 'pong') {
				const theirMove = (S.phase === 'turn' && this.current() === id) || (S.phase === 'answer' && S.challengee === id);
				if (this.waitFor !== id) { this.cancel(this.idleTimer); this.cancel(this.pingTimer); if (theirMove && !S.timeLimit) this.armIdle(id); }
				return true;
			}
			if (a === 'next') return this.confirm(id);
			if (a === 'letter') {
				const l = String(x.v || '').toLocaleLowerCase('lt');
				if (S.phase !== 'turn' || this.current() !== id || [...l].length !== 1 || !SudWords.ALPHABET.includes(l)) return false;
				this.placeLetter(id, l);
				return true;
			}
			if (a === 'challenge') {
				if (S.phase !== 'turn' || this.current() !== id || !S.word || !S.last || S.last === id) return false;
				this.challenge(id);
				return true;
			}
			if (a === 'submit') {
				const w = SudWords.normalize(x.v);
				if (S.phase !== 'answer' || S.challengee !== id || !w.startsWith(S.word) || w.length <= S.word.length || w.length > S.word.length + 30) return false;
				this.submit(w);
				return true;
			}
			if (a === 'concede') {
				if (S.phase !== 'answer' || S.challengee !== id) return false;
				this.endRound(id, { type: 'concede' });
				return true;
			}
			return false;
		}

		placeLetter(id, letter) {
			const S = this.S;
			S.word += letter;
			S.last = id;
			S.hint = { k: 'add', id, l: letter };
			S.turn = (S.turn + 1) % S.order.length;
			this.nextTurn();
		}

		challenge(challengerId) {
			const S = this.S;
			this.cancelWaits();
			S.challenger = challengerId;
			S.challengee = S.last;
			S.hint = { k: 'challenge', id: challengerId };
			S.phase = 'intro';
			this.changed('challenge');
			this.later(() => {
				if (this.human(S.challengee)) {
					S.phase = 'answer';
					this.armFor(S.challengee);
					this.changed('answer');
				} else {
					S.phase = 'botAnswer';
					this.changed('botAnswer');
					this.later(() => this.botAnswer(), this.botDelay(S.challengee));
				}
			}, INTRO_MS);
		}

		async check(word) {
			try { return (await SudWords.verify(word)).verdict; }
			catch (e) { console.error('Word check:', e); return this.dict.has(word) ? 'ok' : 'unknown'; }
		}

		// the challenged player's word is checked only when submitted
		async submit(full) {
			const S = this.S;
			this.cancelWaits();
			S.phase = 'checking';
			S.checking = full;
			this.changed('checking');
			const round = S.round;
			const verdict = await this.check(full);
			if (this.stopped || S.round !== round || S.phase !== 'checking') return;
			S.checking = null;
			if (verdict === 'ok') this.endRound(S.challenger, { type: 'valid', word: full });
			else this.endRound(S.challengee, { type: 'invalid', word: full, verdict });
		}

		// a word that was possible (for the result of a give-up): from the bots' list, else from the full word lists (the
		// bots' list is only part of the language, so "no such word" is only said when the full lists have none either)
		example(prefix) {
			const d = this.dict, out = d.longerWords(d.node(prefix), prefix, 160).filter(botOk);
			if (out.length) return pick(out.slice(0, 8));
			for (const name of ['legit', 'legitExtra']) {
				const L = SudWords.loaded(name), n = L && L.node(prefix);
				const more = n != null ? L.longerWords(n, prefix, 40).filter(w => SudWords.verifySync(w) === 'ok') : [];
				if (more.length) return pick(more.slice(0, 8));
			}
			return null;
		}
		// is it a real word by the full word lists (the bots' list when those aren't loaded)?
		fullWord(s) { const v = SudWords.verifySync(s); return v === null ? this.isWord(s) : v === 'ok'; }

		endRound(loserId, info) {
			const S = this.S;
			this.cancelWaits();
			this.cancel(this.botTimer);
			S.checking = null;
			const loser = this.player(loserId);
			let out = false, starter = loserId;
			if (info.type === 'left') {
				// a player left during the round (already taken out of the game): nobody loses a life
				starter = info.starter;
				delete info.starter;
			} else {
				loser.lives--;
				out = loser.lives <= 0;
				if (out) {
					const idx = S.order.indexOf(loserId);
					starter = S.order[(idx + 1) % S.order.length];
					S.order = S.order.filter(id => id !== loserId);
				}
			}
			if (info.type === 'concede') {
				info.example = this.example(S.word);
				if (!info.example) info.noWordIsWord = this.fullWord(S.word);
			}
			S.nextStarter = starter;
			S.over = S.order.length <= 1 || (!!this.o.endWhenOut && !S.order.includes(this.o.endWhenOut));
			S.winner = S.order.length === 1 ? S.order[0] : null;
			S.resultSeq = (S.resultSeq || 0) + 1;
			S.result = { seq: S.resultSeq, loser: loserId, info, out, word: S.word };
			S.phase = S.over ? 'over' : 'roundEnd';
			S.ready = [];
			if (S.over) { this.changed('over'); if (this.o.onOver) this.o.onOver(this); return; }
			this.armConfirm();
			this.changed('roundEnd');
		}

		nextInSeats(idx) {
			const S = this.S;
			for (let k = 1; k <= S.seats.length; k++) {
				const id = S.seats[(idx + k) % S.seats.length];
				if (S.order.includes(id)) return id;
			}
			return S.order[0];
		}

		// everyone still playing confirms the next round: bots at once, simulated students after a moment, people with
		// "Kitas raundas"; in a remote game whoever has not confirmed after CONFIRM_MS is removed
		armConfirm() {
			const S = this.S;
			S.order.forEach(id => { const p = this.player(id); if (p.bot && !p.sim) S.ready.push(id); });
			S.order.forEach(id => { const p = this.player(id); if (p.sim) this.later(() => this.confirm(id), 1500 + Math.random() * 4000); });
			if (this.o.remote) {
				this.confirmUntil = performance.now() + CONFIRM_MS;
				this.confirmTimer = this.later(() => {
					S.order.filter(id => !S.ready.includes(id) && this.human(id)).forEach(id => this.removePlayer(id, 'noconfirm', true));
					if (!this.S.over) this.startRound(this.startable(S.nextStarter));
				}, CONFIRM_MS);
			}
			this.maybeNext();
		}
		confirm(id) {
			const S = this.S;
			if (S.phase !== 'roundEnd' || !S.order.includes(id) || S.ready.includes(id)) return false;
			S.ready.push(id);
			this.changed('ready');
			this.maybeNext();
			return true;
		}
		maybeNext() {
			const S = this.S;
			if (S.phase !== 'roundEnd' || !S.order.every(id => S.ready.includes(id))) return;
			this.cancel(this.confirmTimer);
			this.confirmUntil = 0;
			this.startRound(this.startable(S.nextStarter));
		}
		startable(id) { return this.S.order.includes(id) ? id : this.nextInSeats(Math.max(0, this.S.seats.indexOf(id))); }

		// a player leaves the game (dropped and didn't come back, or didn't confirm the next round)
		removePlayer(id, reason, quiet) {
			const S = this.S, p = this.player(id);
			if (!p || p.gone) return;
			const involved = (S.phase === 'turn' && this.current() === id) || (this.inChallenge() && (S.challengee === id || S.challenger === id));
			const seat = S.seats.indexOf(id), idx = S.order.indexOf(id);
			p.gone = true;
			p.left = reason;
			S.order = S.order.filter(x => x !== id);
			if (this.o.onRemoved) this.o.onRemoved(this, id, reason);
			if (S.order.length <= 1) { this.finish(id); return; }
			if (involved) { this.endRound(id, { type: 'left', starter: this.nextInSeats(seat) }); return; }
			if (S.phase === 'turn' && idx >= 0 && idx < S.turn) S.turn--;
			if (S.turn >= S.order.length) S.turn = 0;
			if (!quiet) { this.changed('left'); this.maybeNext(); }
		}

		// a player joins the running game (the teacher moved them here from another group): they take their turn after
		// everyone already playing, with full lives; someone who was here before comes back the same way
		addPlayer(p) {
			const S = this.S, id = String(p.id);
			if (S.over) return false;
			let pl = this.player(id);
			if (pl && !pl.gone && S.order.includes(id)) return false;
			if (!pl) {
				pl = { id, name: p.name, av: p.av || '🙂', bot: !!p.bot, sim: !!p.sim, lives: S.lives, gone: false, conn: true };
				S.players.push(pl);
			}
			Object.assign(pl, { gone: false, left: undefined, lives: S.lives, conn: p.conn !== false });
			if (!S.seats.includes(id)) S.seats.push(id);
			S.order.push(id);
			this.changed('joined');
			return true;
		}

		// the people who should be in this game: anyone missing joins, any person not listed leaves ("quit" if they left
		// themselves, else "moved")
		syncPlayers(list, why) {
			const want = new Set(list.map(p => String(p.id))), reason = id => (why && why[id]) || 'moved';
			list.forEach(p => { const pl = this.player(String(p.id)); if (!pl || pl.gone || !this.S.order.includes(String(p.id)) && pl.lives > 0) this.addPlayer(p); });
			this.S.players.filter(p => !p.bot && !p.gone && !want.has(p.id)).forEach(p => this.removePlayer(p.id, reason(p.id)));
		}

		// only one player (or none) is left: the game is over
		finish(lastLeftId) {
			const S = this.S;
			this.cancelWaits(); this.cancel(this.botTimer); this.cancel(this.confirmTimer);
			S.over = true;
			S.winner = S.order[0] || null;
			S.phase = 'over';
			if (!S.result || S.result.loser !== lastLeftId) {
				S.resultSeq = (S.resultSeq || 0) + 1;
				S.result = { seq: S.resultSeq, loser: lastLeftId, info: { type: 'left' }, out: false, word: S.word };
			}
			this.changed('over');
			if (this.o.onOver) this.o.onOver(this);
		}

		// ---------- bots (port of the prototype's botMove / challengeWord) ----------
		botTurn() {
			const S = this.S;
			if (S.phase !== 'turn' || !this.isBot(this.current())) return;
			const id = this.current();
			const move = this.botDecide();
			if (move.challenge && S.word && S.last && S.last !== id) this.challenge(id);
			else this.placeLetter(id, move.letter || pick(this.dict.children(0).map(([ch]) => ch)));
		}

		// The prototype listed every word starting like this and analysed them; the lists can hold millions of words, so
		// the same questions are answered from the list's structure (see the Dawg helpers in sudedu-words.js).
		botDecide() {
			const smart = this.level.move, d = this.dict, w = this.S.word, len = w.length;
			const randomLetter = () => pick(d.children(0).map(([ch]) => ch));
			if (!len) return { letter: randomLetter() };
			const node = d.node(w);
			if (node < 0) return { challenge: true };                       // no word starts like this
			const next = d.children(node);
			if (!next.length) return { challenge: true };                   // nothing longer exists
			if (this.isWord(w) && Math.random() > smart) return { challenge: true };   // mistake
			if (Math.random() > smart) return { letter: d.randomLongerWord(node, w)[len] || randomLetter() };   // dumb move
			const m = this.S.order.length - 1;
			const options = new Map();
			for (const [letter, c] of next) {
				let forcesWin = false;
				if (m > 0) {
					let bits = 0;
					for (const [, cc] of d.children(c)) bits |= d.lengthsMod(cc, m);
					forcesWin = (bits & (1 << ((m - 1) % m))) !== 0;
				}
				options.set(letter, { isLosingMove: this.isWord(w + letter), forcesWin, node: c });
			}
			const safe = [...options].filter(([, o]) => !o.isLosingMove).map(([l]) => l);
			if (!safe.length) {
				// every letter completes a word: follow the letter with the longest word behind it
				const opts = [...options], top = Math.max(...opts.map(([, o]) => d.height(o.node)));
				return { letter: pick(opts.filter(([, o]) => d.height(o.node) === top))[0] };
			}
			const winning = safe.filter(l => options.get(l).forcesWin);
			return { letter: pick(winning.length ? winning : safe) };
		}

		// a challenged bot draws random longer words (each equally likely) until one passes the word check
		async botAnswer() {
			const S = this.S, d = this.dict, node = d.node(S.word), round = S.round;
			let found = null;
			const givesUp = this.isWord(S.word) && Math.random() > this.level.answer;
			if (node >= 0 && !givesUp) {
				for (let i = 0; i < 60 && !found; i++) {
					const w = d.randomLongerWord(node, S.word);
					if (!w) break;
					if (await this.check(w) === 'ok') found = w;
				}
			}
			if (this.stopped || S.round !== round || S.phase !== 'botAnswer') return;
			if (found) this.endRound(S.challenger, { type: 'valid', word: found });
			else this.endRound(S.challengee, { type: 'concede' });
		}

		// ---------- snapshot / restore ----------
		// Timers travel as "ms left" (each browser's clock is its own).
		snapshot() {
			const now = performance.now(), S = this.S;
			return Object.assign({}, S, {
				players: S.players.map(p => Object.assign({}, p)),
				seats: S.seats.slice(), order: S.order.slice(), ready: S.ready.slice(),
				tLeft: this.deadline ? Math.max(0, Math.round(this.deadline - now)) : 0,
				waitFor: this.waitFor || null,
				waitLeft: this.waitUntil ? Math.max(0, Math.round(this.waitUntil - now)) : 0,
				confLeft: this.confirmUntil && S.phase === 'roundEnd' ? Math.max(0, Math.round(this.confirmUntil - now)) : 0
			});
		}

		// carry on a game from a snapshot (another browser ran it until now)
		restore(snap) {
			const S = this.S;
			Object.assign(S, JSON.parse(JSON.stringify(snap)));
			['tLeft', 'waitFor', 'waitLeft', 'confLeft'].forEach(k => delete S[k]);
			const now = performance.now();
			switch (S.phase) {
				case 'turn': {
					const id = this.current();
					if (this.isBot(id)) this.botTimer = this.later(() => this.botTurn(), this.botDelay(id));
					else if (snap.waitFor === id) { this.waitFor = id; this.waitUntil = now + snap.waitLeft; this.waitTimer = this.later(() => this.removePlayer(id, 'gone'), snap.waitLeft); }
					else if (snap.tLeft) { this.deadline = now + snap.tLeft; this.clockTimer = this.later(() => this.timeUp(), snap.tLeft); }
					else this.armFor(id);
					break;
				}
				case 'intro': this.later(() => { S.phase = this.human(S.challengee) ? 'answer' : 'botAnswer'; if (S.phase === 'answer') this.armFor(S.challengee); else this.later(() => this.botAnswer(), BOT_DELAY); this.changed(S.phase); }, 500); break;
				case 'answer':
					if (snap.waitFor === S.challengee) { this.waitFor = S.challengee; this.waitUntil = now + snap.waitLeft; this.waitTimer = this.later(() => this.removePlayer(S.challengee, 'gone'), snap.waitLeft); }
					else if (snap.tLeft) { this.deadline = now + snap.tLeft; this.clockTimer = this.later(() => this.timeUp(), snap.tLeft); }
					else this.armFor(S.challengee);
					break;
				case 'botAnswer': this.later(() => this.botAnswer(), BOT_DELAY); break;
				case 'checking': if (S.checking) this.submit(S.checking); break;
				case 'roundEnd':
					S.order.forEach(id => { const p = this.player(id); if (p.bot && !p.sim && !S.ready.includes(id)) S.ready.push(id); if (p.sim && !S.ready.includes(id)) this.later(() => this.confirm(id), 1500); });
					if (this.o.remote) {
						const left = snap.confLeft || CONFIRM_MS;
						this.confirmUntil = now + left;
						this.confirmTimer = this.later(() => {
							S.order.filter(id => !S.ready.includes(id) && this.human(id)).forEach(id => this.removePlayer(id, 'noconfirm', true));
							if (!S.over) this.startRound(this.startable(S.nextStarter));
						}, left);
					}
					this.maybeNext();
					break;
			}
			this.changed('restore');
		}
	}

	GhostGame.BOT_LEVELS = BOT_LEVELS;
	GhostGame.shuffle = shuffle;
	GhostGame.limits = { RECONNECT_MS, CONFIRM_MS, IDLE_PING_MS };
	window.GhostGame = GhostGame;
})();
