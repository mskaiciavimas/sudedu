/* SUDEDU word lists for any page: <script src="../sudedu-words.js"></script> (path relative to the page) → window.SudWords
 *
 *   SudWords.verify('Namas')            → Promise<{ word: 'namas', verdict: 'ok' }>   (the games' word rules, below)
 *   SudWords.verifySync('namas')        → 'ok' (just the verdict) without waiting, or null while the lists are still loading
 *   SudWords.preload('legit', 'names')  → start loading lists early (e.g. when a game opens)
 *   SudWords.load('freq12_5000')        → Promise<Dawg> for walking a list (prefixes, next letters, words)
 *   SudWords.normalize(' Nãmas ')       → 'namas' (lower case, stress marks removed)
 *
 * verify() verdicts:
 *   'ok'        in SUDEDU_legit_words or SUDEDU_legit_words_lemuoklis_unverified_extension, and not in SUDEDU_legit_names
 *               (SUDEDU_legit_words_extended_rare_constructs is only kept for storage: rare constructs are not real words)
 *   'name'      a real word, but it is also in SUDEDU_legit_names (a name or title)
 *   'truncated' not in those two lists, but in SUDEDU_legit_words_with_truncated_endings (a shortened form)
 *   'unknown'   in none of the lists
 *   'invalid'   empty, or letters outside the Lithuanian alphabet
 *
 * Files: databases/sudedu_word_morphology_data/…/*.dawg in the SDA2 format written by build_frequency_lists.py:
 *   "SDA2" | u16 alphabet size | u32 code point per letter | u32 node count |
 *   per node: u16 header (bit 15 = a word ends here, low 15 bits = edge count), then one u32 per edge
 *   (letter index << 24 | target node), edges sorted by letter index; node 0 is the root.
 * A loaded file is not converted into objects: one pass notes where each node starts (4 bytes per node), and lookups
 * read the file itself with a binary search over a node's edges. So a lookup takes microseconds and a list takes about
 * its file size in memory. Each file is downloaded once per page (and then comes from the browser cache).
 */
(function () {
	'use strict';

	const SCRIPT = document.currentScript ? document.currentScript.src : location.href;
	const DIR = new URL('databases/sudedu_word_morphology_data/', new URL('./', SCRIPT)).href;
	const LEGIT = 'legitimate_word_lists/';
	const FREQ = 'most_frequent_words_primary_school/';
	// short names for the lists (load() also takes a path relative to DIR)
	const LISTS = {
		legit:        LEGIT + 'SUDEDU_legit_words.dawg',
		legitExtra:   LEGIT + 'SUDEDU_legit_words_lemuoklis_unverified_extension.dawg',
		truncated:    LEGIT + 'SUDEDU_legit_words_with_truncated_endings.dawg',
		names:        LEGIT + 'SUDEDU_legit_names.dawg',
		// most frequent words in grades 1-2 / 3-4 texts (with their other forms), and all common words (every grade)
		freq12_5000:  FREQ + 'grades_1_2/SUDEDU_word_usage_frequency_top_5000_words.dawg',
		freq12_10000: FREQ + 'grades_1_2/SUDEDU_word_usage_frequency_top_10000_words.dawg',
		freq12_20000: FREQ + 'grades_1_2/SUDEDU_word_usage_frequency_top_20000_words.dawg',
		freq34_5000:  FREQ + 'grades_3_4/SUDEDU_word_usage_frequency_top_5000_words.dawg',
		freq34_10000: FREQ + 'grades_3_4/SUDEDU_word_usage_frequency_top_10000_words.dawg',
		freq34_20000: FREQ + 'grades_3_4/SUDEDU_word_usage_frequency_top_20000_words.dawg',
		freqCommon:   FREQ + 'SUDEDU_word_usage_frequency_all_common_words.dawg'
	};
	const ALPHABET = 'aąbcčdeęėfghiįyjklmnoprsštuųūvzž';
	const WORD_RE = new RegExp('^[' + ALPHABET + ']+$');

	class Dawg {
		constructor(buffer, name) {
			const v = new DataView(buffer);
			if (buffer.byteLength < 10 || String.fromCharCode(v.getUint8(0), v.getUint8(1), v.getUint8(2), v.getUint8(3)) !== 'SDA2') {
				throw new Error('Not an SDA2 word list: ' + name);
			}
			const letters = v.getUint16(4, true);
			this.alphabet = [];
			this.index = new Map();
			for (let i = 0; i < letters; i++) {
				const ch = String.fromCodePoint(v.getUint32(6 + 4 * i, true));
				this.alphabet.push(ch);
				this.index.set(ch, i);
			}
			let off = 6 + 4 * letters;
			const count = v.getUint32(off, true);
			off += 4;
			const at = new Uint32Array(count);
			for (let i = 0; i < count; i++) {
				at[i] = off;
				off += 2 + 4 * (v.getUint16(off, true) & 0x7fff);
			}
			if (off !== buffer.byteLength) throw new Error('Damaged word list: ' + name);
			this.name = name;
			this.view = v;
			this.at = at;
			this.nodes = count;
		}
		// the node reached from `node` by letter `ch`, or -1
		next(node, ch) {
			const a = this.index.get(ch);
			if (a === undefined || node < 0) return -1;
			const v = this.view, off = this.at[node], base = off + 2;
			let lo = 0, hi = v.getUint16(off, true) & 0x7fff;
			while (lo < hi) {
				const mid = (lo + hi) >> 1, e = v.getUint32(base + 4 * mid, true), c = e >>> 24;
				if (c < a) lo = mid + 1;
				else if (c > a) hi = mid;
				else return e & 0xffffff;
			}
			return -1;
		}
		// the node at the end of `prefix` (already normalized), or -1 if no word starts like that
		node(prefix) {
			let n = 0;
			for (const ch of prefix) if ((n = this.next(n, ch)) < 0) return -1;
			return n;
		}
		isWord(node) {
			return node >= 0 && (this.view.getUint16(this.at[node], true) & 0x8000) !== 0;
		}
		has(word) {
			return this.isWord(this.node(word));
		}
		// [[letter, node], …] that can follow `node`, in alphabet order
		children(node) {
			const out = [];
			if (node < 0) return out;
			const v = this.view, off = this.at[node], cnt = v.getUint16(off, true) & 0x7fff;
			for (let i = 0; i < cnt; i++) {
				const e = v.getUint32(off + 2 + 4 * i, true);
				out.push([this.alphabet[e >>> 24], e & 0xffffff]);
			}
			return out;
		}
		// every word under `node` (`prefix` = the letters leading to it; included if it is a word itself), depth first
		words(node, prefix = '', limit = Infinity) {
			const out = [];
			const walk = (n, s) => {
				if (out.length >= limit) return;
				if (this.isWord(n)) out.push(s);
				for (const [ch, c] of this.children(n)) walk(c, s + ch);
			};
			if (node >= 0) walk(node, prefix);
			return out;
		}
		// words under `node` that are longer than `prefix`, shortest first (at most 20000 branches are followed per
		// length, so it stays quick on a list of millions of words)
		longerWords(node, prefix = '', limit = Infinity) {
			const out = [];
			if (node < 0) return out;
			let level = this.children(node).map(([ch, c]) => [c, prefix + ch]);
			while (level.length && out.length < limit) {
				const nextLevel = [];
				for (const [n, s] of level) {
					if (this.isWord(n) && out.length < limit) out.push(s);
					if (nextLevel.length < 20000) for (const [ch, c] of this.children(n)) nextLevel.push([c, s + ch]);
				}
				level = nextLevel;
			}
			return out;
		}

		// --- questions about everything under a node, without listing the words (each node is worked out once and
		//     remembered, so these take microseconds even on SUDEDU_legit_words with its ~28 million forms) ---

		// how many words there are under `node` (the node itself included if a word ends there)
		count(node) {
			if (node < 0) return 0;
			const memo = this._count || (this._count = new Float64Array(this.nodes).fill(-1));
			if (memo[node] >= 0) return memo[node];
			let n = this.isWord(node) ? 1 : 0;
			for (const [, c] of this.children(node)) n += this.count(c);
			return (memo[node] = n);
		}
		// letters in the longest word under `node`, counted from the node (0 = only the node itself is a word)
		height(node) {
			if (node < 0) return -1;
			const memo = this._height || (this._height = new Int16Array(this.nodes).fill(-1));
			if (memo[node] >= 0) return memo[node];
			let h = 0;
			for (const [, c] of this.children(node)) h = Math.max(h, 1 + this.height(c));
			return (memo[node] = h);
		}
		// bit r is set if some word ends at a distance d ≥ 0 letters below `node` with d % m === r (m ≤ 30)
		lengthsMod(node, m) {
			if (node < 0) return 0;
			const memos = this._mod || (this._mod = new Map());
			let memo = memos.get(m);
			if (!memo) memos.set(m, memo = new Int32Array(this.nodes).fill(-1));
			if (memo[node] >= 0) return memo[node];
			const full = (1 << m) - 1;
			let bits = this.isWord(node) ? 1 : 0;
			for (const [, c] of this.children(node)) {
				const b = this.lengthsMod(c, m);
				bits |= ((b << 1) | (b >>> (m - 1))) & full;   // one letter further: rotate by one
			}
			return (memo[node] = bits);
		}
		// a word under `node` picked uniformly at random ('' if none); `prefix` = the letters leading to the node
		randomWord(node, prefix = '', random = Math.random) {
			let n = node, s = prefix;
			while (n >= 0) {
				let r = random() * this.count(n);
				if (this.isWord(n) && (r -= 1) < 0) return s;
				const kids = this.children(n);
				if (!kids.length) return this.isWord(n) ? s : '';
				let next = kids[kids.length - 1];
				for (const k of kids) { if ((r -= this.count(k[1])) < 0) { next = k; break; } }
				s += next[0];
				n = next[1];
			}
			return '';
		}
		// a word under `node` that is longer than `prefix`, picked uniformly at random ('' if none)
		randomLongerWord(node, prefix = '', random = Math.random) {
			if (node < 0) return '';
			const kids = this.children(node);
			const total = kids.reduce((t, [, c]) => t + this.count(c), 0);
			if (!total) return '';
			let r = random() * total, next = kids[kids.length - 1];
			for (const k of kids) { if ((r -= this.count(k[1])) < 0) { next = k; break; } }
			return this.randomWord(next[1], prefix + next[0], random);
		}
	}

	const loading = {};   // path → Promise<Dawg>
	const ready = {};     // path → Dawg, once loaded

	function pathOf(name) { return LISTS[name] || name; }

	function load(name) {
		const path = pathOf(name);
		if (!loading[path]) {
			loading[path] = fetch(new URL(path, DIR))
				.then(r => { if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + path); return r.arrayBuffer(); })
				.then(buf => (ready[path] = new Dawg(buf, path)))
				.catch(e => { delete loading[path]; throw e; });
		}
		return loading[path];
	}

	function loaded(name) { return ready[pathOf(name)] || null; }

	function preload(...names) {
		return Promise.all(names.map(n => load(n).catch(e => { console.error(e); return null; })));
	}

	// lower case, stress marks (grave, acute, tilde) removed, typographic apostrophe unified
	function normalize(word) {
		return String(word == null ? '' : word).normalize('NFD').replace(/[̀́̃]/g, '')
			.normalize('NFC').toLocaleLowerCase('lt').replace(/’/g, "'").trim();
	}

	function verdictFrom(w, legit, extra, names, truncated) {
		if (legit.has(w) || extra.has(w)) return names.has(w) ? 'name' : 'ok';
		return truncated.has(w) ? 'truncated' : 'unknown';
	}

	// The games' word rules (see the verdicts at the top). The truncated-endings list is only fetched when needed.
	async function verify(word) {
		const w = normalize(word);
		if (!w || !WORD_RE.test(w)) return { word: w, verdict: 'invalid' };
		const [legit, extra] = await Promise.all([load('legit'), load('legitExtra')]);
		if (legit.has(w) || extra.has(w)) return { word: w, verdict: (await load('names')).has(w) ? 'name' : 'ok' };
		return { word: w, verdict: (await load('truncated')).has(w) ? 'truncated' : 'unknown' };
	}

	// Same as verify() but immediate: null until all four lists are loaded (preload them first). For checking many words.
	function verifySync(word) {
		const legit = loaded('legit'), extra = loaded('legitExtra'), names = loaded('names'), truncated = loaded('truncated');
		if (!legit || !extra || !names || !truncated) return null;
		const w = normalize(word);
		if (!w || !WORD_RE.test(w)) return 'invalid';
		return verdictFrom(w, legit, extra, names, truncated);
	}

	window.SudWords = { LISTS, ALPHABET, Dawg, load, loaded, preload, normalize, verify, verifySync };
})();
