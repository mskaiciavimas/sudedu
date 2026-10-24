/* SUDEDU written results summary ("Apibendrinimas") - EXPERIMENTAL
 * <script src="../sudedu-insights.js"></script> → window.SudInsights
 *
 * The Analizė cards and every task's mistake categories are for all teachers; a single task's own summary card (the task
 * results window) only for the tester teachers: the page adds the class "experimental-on" to <html> (see
 * EXPERIMENTAL_TESTER_TEACHER_IDS at the top of LT/uzduotys.html).
 *
 * Everything runs in the browser, from the task results the site already stores (archive rows / assigned task results):
 *   SudInsights.analyze(tasks, opts)          → Promise<facts>: amount of practice, teacher / own practice / game split,
 *                                               topics, answering speed and mistake rate (with their trends), and for
 *                                               grammar the mistake patterns (rules below, from grammar_insight_guidelines)
 *   SudInsights.describe(facts)               → { paragraphs: [...], patterns: [...] } - Lithuanian sentences
 *   SudInsights.renderPeriod(el, tasks, opts) → summary card for the analysis (many tasks)
 *   SudInsights.renderTask(el, row, opts)     → summary card for one task result
 *
 * The sentences come from templates with Lithuanian number agreement (1 klaida / 3 klaidos / 12 klaidų), not from a
 * language model: the facts are a plain object, so a model could later rephrase them without changing the analysis.
 *
 * Trends: a weighted least-squares line through the per-task values (weight = number of answers, capped), with a t-test
 * on its slope. "Aiškiai" needs p < .05 and at least 5 tasks on 2+ days; "tendencija" is a smaller, less certain change.
 *
 * Grammar mistakes: each wrong answer is compared with the right one in its word ([before, answer, after] as saved by
 * rasyba.html) and gets every insight whose rule matches (they are not exclusive). Rules that need the word's form
 * (vietininkas, prieveiksmis, dkt. dgs. V.) read databases/rasyba_suitable_words.json; answers no rule explains are
 * checked with SudWords: a word in common use (the all-grades frequency list) and not a name → "skaito pavienius žodžius", otherwise
 * → "nekreipia dėmesio" - or, when the letters are clearly not an attempt at the word, → "įrašinėja bet kokias raides"
 * (randomLetters below: letters Lithuanian doesn't use, a letter 3+ times in a row, a capital inside the word, 2+ letters
 * too many, a combination of letters no common word has, or the same answer typed into 3+ different words of a task).
 * SudInsights.randomLettersOf(tasks) gives the same verdict for one student's tasks (the teacher's student list "!").
 */
(function () {
	'use strict';

	const SCRIPT = document.currentScript ? document.currentScript.src : location.href;
	const ROOT = new URL('./', SCRIPT).href;

	// (the Analizė cards for everyone; a single task's card - the archive popups - still for the testers only)
	function enabled(mode) {
		return mode === 'task' ? document.documentElement.classList.contains('experimental-on') : true;
	}

	// ---------------------------------------------------------------- Lithuanian wording
	// forms: [1, 21, 31… | 2–9, 22–29… | 0, 10–20, 30…], optional 4th for a fraction (vns. kilmininkas: 2,5 klaidos)
	function form(n, forms) {
		if (Math.round(n) !== n) return forms[2];   // (after a decimal fraction the genitive plural: "2,1 klausimų")
		const a = Math.abs(Math.round(n)), d = a % 10, dd = a % 100;
		if (d === 1 && dd !== 11) return forms[0];
		if (d >= 2 && (dd < 12 || dd > 19)) return forms[1];
		return forms[2];
	}
	function round(x, digits) {
		const k = Math.pow(10, digits);
		return Math.round(x * k) / k;
	}
	function num(x, digits = 1) {
		const [whole, frac] = String(round(x, digits)).split('.');
		const grouped = Math.abs(Number(whole)) >= 1000 ? whole.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0') : whole;
		return frac ? `${grouped},${frac}` : grouped;
	}
	function count(n, forms, digits = 1) {
		const r = round(n, digits);
		return `${num(r, digits)} ${form(r, forms)}`;
	}
	// "3 kartus", "10 kartų", "21 kartą", "2,5 karto"
	function timesText(k) {
		return Math.round(k) === k ? count(k, ['kartą', 'kartus', 'kartų']) : `${num(k)} karto`;
	}
	function pct(x) {
		if (x > 0 && Math.round(x) === 0) return '<1%';
		return `${Math.round(x)}%`;   // (as elsewhere on the site, without a space)
	}
	function q(s) {
		return `„${s}“`;
	}
	function joinList(items) {
		if (items.length < 2) return items.join('');
		return `${items.slice(0, -1).join(', ')} ir ${items[items.length - 1]}`;
	}
	function cap(s) {
		if (!s) return s;
		const i = s[0] === '„' ? 1 : 0;
		return s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1);
	}
	function esc(s) {
		return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
	}
	function shortTime(m) {
		return m < 1 ? `apie ${count(Math.max(1, Math.round(m * 60)), ['sekundę', 'sekundes', 'sekundžių'])}` : `apie ${count(m, ['minutę', 'minutes', 'minučių', 'minutės'])}`;
	}
	// after "apie": "apie 33 minutes", from an hour on "apie 1,5 val."
	// standalone (nominative): "6 sekundės", "2 minutės"
	function timeShortNom(m) {
		return m < 1 ? count(Math.max(1, Math.round(m * 60)), ['sekundė', 'sekundės', 'sekundžių']) : count(round(m, 1), ['minutė', 'minutės', 'minučių', 'minutės']);
	}
	function minutesText(m) {
		if (m < 1) return 'mažiau nei minutę';
		if (m < 60) return `apie ${count(Math.round(m), ['minutę', 'minutes', 'minučių'])}`;
		return `apie ${num(m >= 600 ? Math.round(m / 60) : round(m / 60, 1))} val.`;
	}
	// in brackets: "45 min.", "1,5 val."
	function timeBrief(m) {
		return m < 60 ? `${Math.max(1, Math.round(m))} min.` : `${num(m >= 600 ? Math.round(m / 60) : round(m / 60, 1))} val.`;
	}
	const W = {
		task: ['užduotis', 'užduotys', 'užduočių'],
		done: ['atlikta', 'atliktos', 'atlikta'],
		mistake: ['klaida', 'klaidos', 'klaidų', 'klaidos'],
		made: ['padaryta', 'padarytos', 'padaryta'],
		times: ['kartą', 'kartus', 'kartų'],
		timesNom: ['kartas', 'kartai', 'kartų'],
		diffDays: ['dieną', 'skirtingas dienas', 'skirtingų dienų'],
		days: ['dieną', 'dienas', 'dienų', 'dienos'],
		wordAcc: ['žodį', 'žodžius', 'žodžių'],
		topicsDone: ['Praktikuota', 'Praktikuotos', 'Praktikuota'],
		topics: ['skirtinga tema', 'skirtingos temos', 'skirtingų temų'],
		chosen: ['pasirinkta', 'pasirinktos', 'pasirinktų'],
		analysed: ['Analizuojama', 'Analizuojamos', 'Analizuojama']
	};

	// what one "answer" is in each subject, and the verb that goes with it
	const SUBJECTS = {
		math: { gen: 'matematikos', unitAcc: ['veiksmą', 'veiksmus', 'veiksmų'], unit: ['veiksmas', 'veiksmai', 'veiksmų', 'veiksmo'], verb: ['atliktas', 'atlikti', 'atlikta'], speed: 'sprendimo' },
		grammar: { gen: 'rašybos', unitAcc: ['atsakymą', 'atsakymus', 'atsakymų'], unit: ['atsakymas', 'atsakymai', 'atsakymų', 'atsakymo'], verb: ['pateiktas', 'pateikti', 'pateikta'], speed: 'atsakymų' },
		text: { gen: 'teksto supratimo', unitAcc: ['tekstą', 'tekstus', 'tekstų'], unit: ['tekstas', 'tekstai', 'tekstų', 'teksto'], verb: ['sudėliotas', 'sudėlioti', 'sudėliota'], speed: null }
	};

	// ---------------------------------------------------------------- task data
	const GRAMMAR_TOPICS = {
		C61: '„H“, „CH“ ir „F“ rašyba', C62: 'daiktavardžių galūnės', C63: 'būdvardžių galūnės', C64: 'sudurtiniai žodžiai',
		C65: 'veiksmažodžių galūnės', C66: 'įsidėmėtina rašyba', C67: 'panašiai skambančios priebalsės', C68: 'dvibalsiai',
		C69: 'priešdėliai', C70: 'priesagos', C71: 'priebalsių supanašėjimas', C72: 'mišrieji dvigarsiai',
		C85: 'galininko galūnės (ką? vieną)', C86: 'daugiskaitos kilmininko galūnės (ko? daug)',
		C87: 'vietininko galūnės (kur? kame?)', C88: '„E“ ir „Ė“', C89: '„I“ ir „Y“', C90: '„U“ ir „Ū“', C91: 'minkštumo ženklas',
		C92: 'prieveiksmių pabaigos'
	};
	const TEXT_TYPES = { C51: 'turinio komponavimas', C52: 'struktūros išdėstymas' };

	// a parameter's name that stands on its own ("Vienaženkliai skaičiai iki 10"), from parameter_dictionary.js's
	// insightsListLabel; otherwise its text, capitalised
	function standAlone(code) {
		return dictField(code, 'insightsListLabel') || cap(dictText(code));
	}
	// a field of a parameter in parameter_dictionary.js (its header says which sentence each one goes into)
	function dictField(code, field) {
		const dict = typeof parameterDictionary !== 'undefined' ? parameterDictionary : null;
		const text = dict && dict[code] && dict[code][field];
		return text ? text.normalize('NFC') : '';
	}
	/* A task set as the place of a change, "… užduotyse" (Tendencijos: "{phrase} klaidų dažnis sumažėjo 40%"):
	 *  math - insightsTaskSetLocative of the number range with {op} = insightsOperationGenitive of the operation:
	 *    "dviženklio ir vienaženklio skaičių iki 100 sudėties ir atimties užduotyse";
	 *  spelling - up to 3 categories by insightsSpellingGenitive, "rašybos" said once: "„E“ ir „Ė“ bei minkštumo ženklo
	 *    rašybos užduotyse"; all of a class's categories: "užduotyse su visomis rašybos kategorijomis"; otherwise
	 *    "rašybos užduotyse (visos kategorijos, išskyrus …)". '' when there is no phrase (the set's name is quoted then). */
	function taskSetPhrase(t) {
		const info = t.info;
		if (t.subject === 'math') {
			const op = dictField(info[1], 'insightsOperationGenitive'), set = dictField(info[2], 'insightsTaskSetLocative');
			return set && op ? set.replace('{op}', op) : op ? `${op} užduotyse` : '';
		}
		if (t.subject === 'grammar') {
			const keys = Object.keys((info[4] && typeof info[4] === 'object') ? info[4] : {}).sort();
			const all = ALL_GRAMMAR[info[3]];
			if (all && keys.length && all.every(k => keys.includes(k))) return 'užduotyse su visomis rašybos kategorijomis';
			const names = keys.map(k => dictField(k, 'insightsSpellingGenitive'));
			if (keys.length && keys.length <= 3 && names.every(Boolean)) {
				const once = names.every(n => / rašybos$/.test(n));
				const parts = once ? names.map((n, i) => (i < names.length - 1 ? n.replace(/ rašybos$/, '') : n)) : names;
				return `${parts.length < 2 ? parts[0] : `${parts.slice(0, -1).join(', ')} bei ${parts[parts.length - 1]}`} užduotyse`;
			}
			const desc = taskType(t).desc;
			return desc ? `rašybos užduotyse (${desc})` : '';
		}
		return '';
	}
	const lowerFirst = text => text && !/^[„"]/.test(text) && !/^[A-ZĄČĘĖĮŠŲŪŽ]{2}/.test(text) ? text.charAt(0).toLowerCase() + text.slice(1) : text;
	function dictText(code) {
		// parameter_dictionary.js declares a global const (not a window property)
		const dict = typeof parameterDictionary !== 'undefined' ? parameterDictionary : null;
		const text = dict && dict[code] && dict[code].decodedParameterText;
		return text ? text.normalize('NFC').replace(/^\*/, '').toLowerCase() : '';   // (some entries have combining dots)
	}
	function parseJson(value) {
		if (typeof value !== 'string') return value;
		try { return JSON.parse(value); } catch (e) { return null; }
	}
	function subjectOf(info) {
		if (!Array.isArray(info)) return null;
		if (info[0] === 'math') return 'math';
		if (info[0] === 'lang' && info[1] === 'C83') return 'grammar';
		if (info[0] === 'lang' && info[1] === 'C49') return 'text';
		return null;
	}
	function topicsOf(info, subject) {
		if (subject === 'grammar') {
			return Object.keys((info[4] && typeof info[4] === 'object') ? info[4] : {}).map(k => GRAMMAR_TOPICS[k] || dictText(k)).filter(Boolean);
		}
		if (subject === 'math') {
			const op = dictText(info[1]), range = dictText(info[2]).replace(/\s*\((.*)\)/, ', $1');
			return op ? [range ? `${op} (${range})` : op] : [];
		}
		if (subject === 'text') {
			const type = TEXT_TYPES[info[2]], level = dictText(info[6]);
			return type ? [level ? `${type} (${level})` : type] : [];
		}
		return [];
	}
	function defaultKindOf(t) {
		if (t.resultKind) return t.resultKind;
		if (t.teacherTaskId || /^(teacher|assignment):/.test(String(t.taskKey || ''))) return 'teacher';
		if (/^#/.test(String(t.group || ''))) return 'game';
		// older archive rows: no teacher task, group or duration - a teacher task's copy or own practice
		return 'taskInfo' in t && t.duration == null ? 'legacy' : 'self';
	}
	// accepts an assigned task ({taskDescription, completionDate, result}) or an archive row ({taskInfo, date, totalAnswers…})
	function normalizeTask(t, kindOf) {
		const item = normalizeTaskFields(t, kindOf);
		// (the task as the page gave it - e.g. to open an excluded task's results; not enumerable, so not copied around)
		if (item) Object.defineProperty(item, 'source', { value: t, enumerable: false });
		return item;
	}
	function normalizeTaskFields(t, kindOf) {
		const info = parseJson(t.taskDescription ?? t.taskInfo ?? t.taskInstructions);
		const subject = subjectOf(info);
		const r = t.result ? parseJson(t.result) : t;
		if (!subject || !r) return null;
		const answers = Number(r.totalAnswers) || 0;
		const mistakes = Number(r.mistakes) || 0;
		const rate = Number(r.answerRate) || 0;
		const detailNotSent = r.mistakesDetail === undefined;   // (a server of the version before does not send them)
		let detail = parseJson(r.mistakesDetail);
		if (detail && !Array.isArray(detail)) detail = detail.mistakesDetail || detail.mistakes || [];
		// (a record that keeps details - an empty list when there were no mistakes; older records have none: null)
		const detailRecorded = Array.isArray(detail);
		return {
			info, infoKey: JSON.stringify(info), subject,
			date: String(t.completionDate || t.date || '').slice(0, 10),
			answers, mistakes, rate,
			minutes: rate > 0 && answers > 0 ? answers / rate : 0,
			detail: Array.isArray(detail) ? detail : [],
			detailRecorded,
			detailNotSent,
			duration: parseJson(t.duration),
			// (a task narrowed by the filters: the whole task, which is what is replayed)
			replayFrom: t.replayFrom ? { info: parseJson(t.replayFrom.taskDescription), answers: Number(t.replayFrom.totalAnswers) || 0,
				detail: (() => { const d = parseJson(t.replayFrom.mistakesDetail); return Array.isArray(d) ? d : []; })(), duration: parseJson(t.duration) } : null,
			kind: (kindOf || defaultKindOf)(t),
			studentId: t.studentId ?? null,
			// a teacher task with a due date: done by it or not (null - no due date / an older record)
			dueDate: t.dueDate ? String(t.dueDate).slice(0, 10) : null,
			onTime: typeof t.onTime === 'boolean' ? t.onTime : null
		};
	}
	/* Done on time: of the period's tasks with a due date, how many were done after it - "often" next to the class's usual
	 * share (the median of the classmates who had tasks with due dates, at least 3 of them): at least 2 late tasks, 1.5 times
	 * the usual share and 20% or more, and a one-sided binomial test p < 0.05. When the class's usual share is unknown or
	 * none (0%), fixed limits instead: at least 3 late tasks and 30% or more of the tasks with a due date. */
	function binomUpper(k, n, p) {
		if (p <= 0) return k > 0 ? 0 : 1;
		if (p >= 1) return 1;
		let s = 0;
		for (let i = k; i <= n; i++) s += Math.exp(lnChoose(n, i) + i * Math.log(p) + (n - i) * Math.log(1 - p));
		return Math.min(1, s);
	}
	function onTimeStats(list, opts, subject, kindOf) {
		const dated = list.filter(t => t.onTime !== null);
		if (!dated.length) return null;
		const late = dated.filter(t => t.onTime === false).length;
		const period = opts.period || {};
		const inPeriod = d => (!period.start || d >= period.start) && (!period.end || d <= period.end);
		const shares = (Array.isArray(opts.peers) ? opts.peers : []).map(p => {
			const own = (p.tasks || []).map(t => normalizeTask(t, kindOf)).filter(t => t && t.subject === subject && t.onTime !== null && t.date && inPeriod(t.date));
			return own.length ? own.filter(t => t.onTime === false).length / own.length : null;
		}).filter(x => x != null);
		const typical = shares.length >= 3 ? median(shares) : null;
		const share = late / dated.length;
		let often = false;
		if (late >= 2) {
			if (typical != null && typical > 0) often = share >= Math.max(0.2, typical * 1.5) && binomUpper(late, dated.length, typical) < 0.05;
			else often = late >= 3 && share >= 0.3;
		}
		return { n: dated.length, late, share, typical, often };
	}
	// "Visos užduotys atliktos laiku." / "Kelios užduotys neatliktos laiku (2 iš 9)." / "Užduotys dažnai buvo neatliekamos
	// laiku (5 iš 9)." - with all the details always (when there were tasks with a due date), otherwise only when some were late
	// and without the numbers
	function onTimeSentence(f, details) {
		const o = f.onTime;
		if (!o) return '';
		if (!o.late) return details ? (o.n === 1 ? 'Užduotis atlikta laiku.' : 'Visos užduotys atliktos laiku.') : '';
		const nums = details ? ` (${o.late} iš ${o.n})` : '';
		if (o.often) return `Užduotys dažnai buvo neatliekamos laiku${nums}.`;
		if (o.late === 1) return `Viena užduotis neatlikta laiku${nums}.`;
		return `Kelios užduotys neatliktos laiku${nums}.`;
	}
	// A finished teacher task used to be posted to the archive once more without its teacher task id (as own practice /
	// an older row): drop such an exact copy, one per teacher result.
	function dropTeacherCopies(list) {
		// (not the speed: the teacher result and its copy round it differently)
		const sig = t => [t.studentId, t.date, t.infoKey, t.answers, t.mistakes].join('|');
		const teacher = new Map();
		list.forEach(t => { if (t.kind === 'teacher') teacher.set(sig(t), (teacher.get(sig(t)) || 0) + 1); });
		return list.filter(t => {
			if (t.kind !== 'self' && t.kind !== 'legacy') return true;
			const left = teacher.get(sig(t)) || 0;
			if (!left) return true;
			teacher.set(sig(t), left - 1);
			return false;
		});
	}

	// ---------------------------------------------------------------- statistics
	function lgamma(x) {
		const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
		let y = x, tmp = x + 5.5;
		tmp -= (x + 0.5) * Math.log(tmp);
		let ser = 1.000000000190015;
		for (const ci of c) ser += ci / ++y;
		return -tmp + Math.log(2.5066282746310005 * ser / x);
	}
	function betacf(a, b, x) {
		const FPMIN = 1e-300;
		const qab = a + b, qap = a + 1, qam = a - 1;
		let c = 1, d = 1 - qab * x / qap;
		if (Math.abs(d) < FPMIN) d = FPMIN;
		d = 1 / d;
		let h = d;
		for (let m = 1; m <= 200; m++) {
			const m2 = 2 * m;
			let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
			d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
			c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
			d = 1 / d; h *= d * c;
			aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
			d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
			c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
			d = 1 / d;
			const del = d * c;
			h *= del;
			if (Math.abs(del - 1) < 3e-12) break;
		}
		return h;
	}
	function ibeta(x, a, b) {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
		return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
	}
	// two-sided p value of Student's t
	// the one-sided 90% quantile of Student's t (tPValue is two-sided: P(|T| > t) = 0.2)
	function tQuantile90(df) {
		let lo = 0, hi = 10;
		for (let k = 0; k < 50; k++) { const mid = (lo + hi) / 2; if (tPValue(mid, df) > 0.2) lo = mid; else hi = mid; }
		return (lo + hi) / 2;
	}
	function tPValue(t, df) {
		if (!(df > 0) || !isFinite(t)) return isFinite(t) ? 1 : 0;
		return ibeta(df / (df + t * t), df / 2, 0.5);
	}
	function median(values) {
		const s = values.filter(v => isFinite(v)).sort((a, b) => a - b);
		if (!s.length) return 0;
		const m = Math.floor(s.length / 2);
		return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
	}
	function dayNumber(date) {
		return Math.round(Date.parse(date + 'T00:00:00Z') / 86400000);
	}
	// points: [{x: day, y: value, w: weight}] → slope, p, early / late level (first and last third of the tasks)
	function trend(points) {
		const n = points.length;
		if (!n) return null;
		const sorted = [...points].sort((a, b) => a.x - b.x);
		const sw = sorted.reduce((s, p) => s + p.w, 0) || 1;
		const pts = sorted.map(p => ({ x: p.x, y: p.y, w: p.w * n / sw }));
		const wmean = list => list.reduce((s, p) => s + p.w * p.y, 0) / (list.reduce((s, p) => s + p.w, 0) || 1);
		const xbar = pts.reduce((s, p) => s + p.w * p.x, 0) / n;
		const ybar = wmean(pts);
		let sxx = 0, sxy = 0;
		pts.forEach(p => { sxx += p.w * (p.x - xbar) ** 2; sxy += p.w * (p.x - xbar) * (p.y - ybar); });
		const slope = sxx > 0 ? sxy / sxx : 0;
		let p = 1;
		if (sxx > 0 && n > 2) {
			const rss = pts.reduce((s, q) => s + q.w * (q.y - (ybar + slope * (q.x - xbar))) ** 2, 0);
			const se = Math.sqrt(rss / (n - 2) / sxx);
			p = se > 0 ? tPValue(slope / se, n - 2) : (slope !== 0 ? 0 : 1);
		}
		const k = Math.max(1, Math.floor(n / 3));
		return {
			n, slope, p, mean: ybar,
			days: new Set(sorted.map(q => q.x)).size,
			early: wmean(pts.slice(0, k)), late: wmean(pts.slice(-k)),
			min: Math.min(...pts.map(q => q.y)), max: Math.max(...pts.map(q => q.y))
		};
	}
	// 'few' | 'flat' | 'mixed' | 'clear-down' | 'clear-up' | 'tend-down' | 'tend-up'
	function verdict(tr, minAbs, minRel) {
		if (!tr || tr.n < 3 || tr.days < 2) return 'few';
		const diff = tr.late - tr.early;
		const big = Math.abs(diff) >= minAbs && Math.abs(diff) >= minRel * Math.abs(tr.early);
		if (!big) return Math.abs(tr.max - tr.min) >= Math.max(minAbs * 4, minRel * 4 * Math.abs(tr.mean)) ? 'mixed' : 'flat';
		const dir = diff < 0 ? 'down' : 'up';
		if (Math.sign(tr.slope) !== Math.sign(diff)) return 'mixed';
		if (tr.p < 0.05 && tr.n >= 5) return 'clear-' + dir;
		if (tr.p < 0.2) return 'tend-' + dir;   // (some evidence, too little to be sure)
		return 'mixed';
	}
	// ---------------------------------------------------------------- grammar mistake patterns
	// the spelling mistake patterns' texts (label, area, tip, topic) live in parameter_dictionary.js
	// (insightsMistakePatterns - its comment says which sentence each one goes into)
	const INSIGHTS = typeof insightsMistakePatterns !== 'undefined' ? insightsMistakePatterns : {};

	const NOSINES = { 'ą': ['a'], 'ę': ['e', 'ė'], 'į': ['i', 'y'], 'ų': ['u', 'ū'] };
	const NOSINE_OF = { i: 'į', y: 'į', e: 'ę', 'ė': 'ę', u: 'ų', 'ū': 'ų', a: 'ą' };
	const SOFT = ['ia', 'io', 'iu', 'iū'];
	const VOWELS = 'aąeęėiįyouųū';
	const VOICED = [['b', 'p'], ['d', 't'], ['g', 'k'], ['z', 's'], ['ž', 'š']];
	const ASSIM = [...VOICED, ['c', 'dz'], ['č', 'dž']];
	const PREFIXES = ['iš', 'į', 'už', 'at', 'ap', 'nu', 'pa', 'pra', 'pri', 'per', 'su', 'be', 'ne', 'api', 'ati', 'apy', 'ant', 'par'];
	const PREFIX_RULES = [['iš', ['yš', 'įš', 'iž', 'yž', 'įž']], ['į', ['i', 'y']], ['už', ['uz', 'uš']], ['at', ['ad']], ['ap', ['ab']]];
	// the choices rasyba.html shows for įsidėmėtina rašyba
	const ISI_OPTIONS = {
		u: ['u', 'ū', 'ų'], 'ū': ['u', 'ū', 'ų'], 'ų': ['u', 'ū', 'ų'], a: ['a', 'ą'], 'ą': ['a', 'ą'],
		i: ['i', 'į', 'y'], 'į': ['i', 'į', 'y'], y: ['i', 'į', 'y'], uo: ['o', 'uo'], ie: ['e', 'ė', 'ei', 'ie'],
		e: ['e', 'ę', 'ė', 'ia'], 'ę': ['e', 'ę', 'ė', 'ia'], 'ė': ['e', 'ę', 'ė', 'ia'], ia: ['e', 'ę', 'ia'],
		'ž': ['š', 'ž'], j: ['i', 'j']
	};

	// w is a with one occurrence of `from` replaced by `to`
	function swapOnce(a, w, from, to) {
		for (let i = a.indexOf(from); i !== -1; i = a.indexOf(from, i + 1)) {
			if (a.slice(0, i) + to + a.slice(i + from.length) === w) return true;
		}
		return false;
	}
	function swapEither(a, w, x, y) {
		return swapOnce(a, w, x, y) || swapOnce(a, w, y, x);
	}
	function pairSwap(a, w, pairs) {
		return pairs.some(([x, y]) => swapEither(a, w, x, y));
	}

	// one wrong answer → the insight keys whose rules match (empty: none of the specific rules)
	function classifyAnswer(cat, b, a, s, w, morph) {
		const hits = new Set();
		const cw = b + a + s, ww = b + w + s;
		const atEnd = s === '';
		const inMd = cat === 'C72';
		const inPrefix = PREFIXES.some(p => cw.startsWith(p) && b.length < p.length);
		// a letter typed twice (n-uuo-lat): a slip of the hand, not a spelling rule (user, 2026-10-10)
		for (let i = 0; i < ww.length - 1; i++) {
			if (ww[i] === ww[i + 1] && ww.slice(0, i) + ww.slice(i + 1) === cw) return new Set(['nedemesys']);
		}

		// h / ch / f
		if ((a === 'h' && w === 'ch') || (a === 'ch' && w === 'h') || (a === 'f' && (w === 'h' || w === 'ch'))) hits.add('raides');
		if ((a === 'h' && w === 'g') || (a === 'ch' && w === 'k') || (a === 'f' && w === 'p')) hits.add('garsai');
		// švilpiamosios / šnypščiamosios priebalsės mixed up (z for ž, š for s, c for č; dz / dž too)
		if (pairSwap(a, w, [['s', 'š'], ['z', 'ž'], ['c', 'č']])) hits.add('svilp');
		// minkštumo ženklas: i left out, i added after j, an unneeded soft i
		if (SOFT.includes(a.slice(0, 2)) && w === a.slice(1)) hits.add('minkst');
		if (SOFT.includes(a.slice(0, 2)) && pairSwap(a.slice(1), w, [['u', 'ū']])) hits.add('ilgi');
		if (b.endsWith('j') && w === 'i' + a) hits.add('minkst');
		// an unneeded softness i: only i added in front of the right letter (a → ia, u → iu ...). Not ia written for e:
		// before e there is no softness sign (it would make ie), that is e / ia mixed up (user, 2026-10-10)
		if (cat === 'C91' && w === 'i' + a && SOFT.includes(w.slice(0, 2))) hits.add('minkst');
		// a softness sign of the word (rasyba_softness_signs.json) inside the gap left out - only that: the rest of the gap
		// exactly as it should be (gėlų for gėlių; not šie(n)dien for šiandien - a different letter there, not a missing "i")
		const soft = softPositions(cw);
		if (soft) soft.forEach(p => {
			const k = p - b.length;
			if (k >= 0 && k < a.length && a[k] === 'i' && w === a.slice(0, k) + a.slice(k + 1)) hits.add('minkst');
		});
		// an "i" added where none belongs - before a vowel or right after "j" (the rest of the gap as it should be)
		for (let q = 0; q < w.length; q++) {
			if (w[q] !== 'i' || w.slice(0, q) + w.slice(q + 1) !== a) continue;
			const next = (w.slice(q + 1) + s)[0] || '', prev = (b + w.slice(0, q)).slice(-1);
			if (VOWELS.includes(next) || prev === 'j') { hits.add('minkst'); break; }
		}
		// vietininkas: the ending must end in e (a, ia, ą, ią, iaja instead of e / ėje ...)
		if (atEnd && a.endsWith('e') && !w.endsWith('e') && (cat === 'C87' || (morph && morph.has('Vt.')))) hits.add('vietininkas');
		// e/ė, i/y, u/ū (in mišrieji dvigarsiai: their own insight)
		if (pairSwap(a, w, [['e', 'ė']])) hits.add(inMd ? 'md' : 'e_ee');
		if (pairSwap(a, w, [['i', 'y'], ['u', 'ū']])) hits.add(inMd ? 'md' : 'ilgi');
		// a nosinė where none belongs (not in an ending, a prefix or įsidėmėtina rašyba)
		if (!atEnd && !inPrefix && cat !== 'C66' && cat !== 'C69' &&
			Object.entries(NOSINE_OF).some(([x, y]) => x !== 'a' && swapOnce(a, w, x, y))) hits.add('raides');
		// dvibalsiai
		if (swapEither(a, w, 'o', 'uo')) hits.add('dvibalsiai');
		if (swapEither(a, w, 'ė', 'ie')) hits.add('ee_ie');
		if (swapEither(a, w, 'e', 'ie')) hits.add('e_ie');
		if (swapEither(a, w, 'ie', 'ei')) hits.add('ie_ei');
		if (swapEither(a, w, 'ie', 'ia')) hits.add('ie_ia');
		if (swapOnce(a, w, 'ui', 'uj')) hits.add('ui');
		// dž / d / ž, dz / d / z, ią / ę
		if (swapEither(a, w, 'dž', 'd') || swapEither(a, w, 'dž', 'ž')) hits.add('dzh');
		if (swapEither(a, w, 'dz', 'd') || swapEither(a, w, 'dz', 'z')) hits.add('dz');
		if (swapEither(a, w, 'ę', 'ią')) hits.add('ia_e_nos');
		if (swapOnce(a, w, 'iau', 'eu')) hits.add('dvibalsiai');
		// ei instead of iai: prieveiksmis / dkt. dgs. V. / elsewhere
		if (swapOnce(a, w, 'iai', 'ei')) {
			const ending = atEnd && a.endsWith('iai') && w === a.slice(0, -3) + 'ei';
			if (ending && (cat === 'C92' || (morph && morph.has('prv.')))) hits.add('prv_iai');
			else if (ending && morph && morph.has('dkt.') && morph.has('dgs.') && morph.has('V.')) hits.add('dkt_dgs_v');
			else hits.add('dvibalsiai');
		}
		// ia / e not in the ending
		if (!atEnd && swapEither(a, w, 'ia', 'e') && !swapOnce(a, w, 'iau', 'eu')) hits.add('e_ia');
		// priebalsių supanašėjimas
		if (cat === 'C71' && pairSwap(a, w, ASSIM)) hits.add('asim');
		// priešdėliai
		if (PREFIX_RULES.some(([p, bad]) => cw.startsWith(p) && b.length < p.length && bad.some(x => ww === x + cw.slice(p.length)))) hits.add('priesdelis');
		// a nosinė left out at the end of the word
		if (atEnd && NOSINES[a.slice(-1)] && NOSINES[a.slice(-1)].some(x => w === a.slice(0, -1) + x)) hits.add('galune');
		// sudurtiniai žodžiai: any wrong answer in a compound word's gap (it may be another kind of mistake as well)
		if (cat === 'C64') hits.add('sudurt');
		// veiksmažodžių galūnės (compared on the whole word)
		if (cat === 'C65' || (morph && morph.has('vksm.'))) {
			const endSwap = (x, y) => cw.endsWith(x) && ww === cw.slice(0, -x.length) + y;
			if (endSwap('ei', 'ai') || endSwap('ei', 'iai')) hits.add('v_bkl_vns2');
			if (endSwap('ame', 'amia') || endSwap('ome', 'omia')) hits.add('v_esl_dgs1');
			if (endSwap('ate', 'atia') || endSwap('ote', 'otia')) hits.add('v_esl_dgs2');
			if (endSwap('iau', 'eu')) hits.add('v_bkl_vns1');
			if (endSwap('ėme', 'ėmia')) hits.add('v_bkl_dgs1');
			if (endSwap('ime', 'imia')) hits.add('v_busl_dgs1');
			if (endSwap('ite', 'itia')) hits.add('v_busl_dgs2');
		}
		// įsidėmėtina rašyba
		// (a gap of a word to memorise - its letters are learnt with the word: any wrong answer there is that kind of mistake,
		// e.g. šiandien written šiendien; it may be another kind of mistake as well - user, 2026-10-20)
		if (cat === 'C66' && w && w !== a) hits.add('isidemetina');
		// panašiai skambančios priebalsės
		if (cat !== 'C71' && pairSwap(a, w, VOICED)) hits.add('priebalses');
		return hits;
	}

	// the softness signs of the words (databases/rasyba_softness_signs.json: word (homonyms numbered as in the words
	// database) -> the letter index of each softness "i"); null until loaded or when missing - then the letter rules only
	let softDb = null, softDbPromise = null;
	function loadSoftDb() {
		if (!softDbPromise) {
			softDbPromise = fetch(ROOT + 'databases/rasyba_softness_signs.json').then(r => (r.ok ? r.json() : null)).catch(() => null)
				.then(json => { softDb = json; return json; });
		}
		return softDbPromise;
	}
	function softPositions(word) {
		if (!softDb) return null;
		let entry = softDb[word];
		for (let i = 1; !entry && i < 10; i++) entry = softDb[word + i];
		return Array.isArray(entry) ? entry : null;
	}
	let wordsDbPromise = null;
	let wordsDbHash = null;   // (its text's fingerprint: what is kept from it in the browser - see keptReplays)
	function loadWordsDb() {
		if (!wordsDbPromise) {
			wordsDbPromise = fetch(ROOT + 'databases/rasyba_suitable_words.json')
				.then(r => (r.ok ? r.text() : null)).then(text => { if (text == null) return null; wordsDbHash = String(hashString(text)); return JSON.parse(text); }).catch(() => null);
		}
		return wordsDbPromise;
	}
	/* What is kept in the browser between visits (worked out from these files, so valid exactly while they stay the same):
	 * a file's fingerprint is that of its text - fetched again, from the browser's cache - so a changed file drops what was
	 * kept from it, with or without a new ?v=. null: not known (then nothing is kept). */
	const fileHashes = new Map();
	function fileHash(url) {
		if (!url) return Promise.resolve(null);
		if (!fileHashes.has(url)) fileHashes.set(url, fetch(url).then(r => (r.ok ? r.text() : null)).then(text => (text == null ? null : String(hashString(text)))).catch(() => null));
		return fileHashes.get(url);
	}
	const scriptUrl = part => { const el = document.querySelector(`script[src*="${part}"]`); return el ? el.src : null; };
	// (IndexedDB "sudInsights": store "kept" - key → value; every failure is just "not kept")
	let keptDbPromise = null;
	function keptDb() {
		if (!keptDbPromise) keptDbPromise = new Promise(resolve => {
			try {
				const req = indexedDB.open('sudInsights', 1);
				req.onupgradeneeded = () => req.result.createObjectStore('kept');
				req.onsuccess = () => resolve(req.result);
				req.onerror = req.onblocked = () => resolve(null);
			} catch (e) { resolve(null); }
		});
		return keptDbPromise;
	}
	function keptRequest(db, mode, work) {
		return new Promise(resolve => {
			try {
				const tx = db.transaction('kept', mode), out = work(tx.objectStore('kept'));
				tx.oncomplete = () => resolve(out && 'result' in out ? out.result : true);
				tx.onerror = tx.onabort = () => resolve(null);
			} catch (e) { resolve(null); }
		});
	}
	let patternsDbPromise = null;
	function loadPatternsDb() {
		if (!patternsDbPromise) patternsDbPromise = fetch(ROOT + 'databases/rasyba_suitable_words_patterns.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
		return patternsDbPromise;
	}
	// the categories of a word's gap at [start, start + length) in rasyba_suitable_words(.json / _patterns.json): its
	// suitableTasks keys ("C66-C76", "C91-1" → C66, C91) whose pattern [start, end, answers] is that very gap
	function gapCategories(db, patterns, word, start, length, asked) {
		const out = new Set(asked ? [asked] : []);
		if (!db || !patterns) return out;
		let entry = db[word];
		for (let i = 1; !entry && i < 10; i++) entry = db[word + i];
		const tasks = entry && entry.suitableTasks;
		if (!tasks) return out;
		Object.entries(tasks).forEach(([key, ids]) => (ids || []).forEach(id => {
			const pt = patterns[id];
			if (Array.isArray(pt) && pt[0] === start && pt[1] === start + length) out.add(key.split('-')[0]);
		}));
		return out;
	}
	function morphOf(db, word) {
		if (!db) return null;
		let entry = db[word];
		for (let i = 1; !entry && i < 10; i++) entry = db[word + i];   // homonyms carry a number (aidi3)
		return entry ? new Set(entry.morphInfo || []) : null;
	}
	let sudWordsPromise = null;
	function loadSudWords() {
		if (window.SudWords) return Promise.resolve(window.SudWords);
		if (!sudWordsPromise) {
			sudWordsPromise = new Promise(resolve => {
				const s = document.createElement('script');
				s.src = ROOT + 'sudedu-words.js?v=20261024a';
				s.onload = () => resolve(window.SudWords || null);
				s.onerror = () => resolve(null);
				document.head.appendChild(s);
			});
		}
		return sudWordsPromise;
	}

	// mistakesDetail items of grammar tasks: [[before, answer, after], category, [count, wrongAnswers (≤3)], wordId]
	// (tasksKnown: how many tasks' mistakes are known - those with details and those without mistakes; for "dažnai")
	async function analyzeGrammarMistakes(entries, tasksKnown) {
		const answers = [];
		entries.forEach(({ item, task }) => {
			if (!Array.isArray(item) || !Array.isArray(item[0])) return;
			const [b, a, s] = item[0].map(x => String(x ?? '').toLowerCase());
			const aRaw = String(item[0][1] ?? '').replace(/\s+/g, '');
			const cat = String(item[1] || '').split('-')[0];
			const counter = Number(item[2] && item[2][0]) || 1;
			const raws = (item[2] && Array.isArray(item[2][1]) ? item[2][1] : []).map(x => String(x ?? '').replace(/\s+/g, '')).filter(Boolean);
			const wrongs = raws.map(x => x.toLowerCase());
			const weight = wrongs.length ? counter / wrongs.length : 0;
			wrongs.forEach((w, k) => {
				// (the right letters, only the capitals wrong: "Neteisingas didžiųjų raidžių naudojimas")
				if (w !== a || raws[k] !== aRaw) answers.push({ cat, b, a, s, w, raw: raws[k], weight, task, counter, word: b + a + s, item, caseOnly: w === a });
			});
			if (!wrongs.length) answers.push({ cat, b, a, s, w: null, weight: counter, task, counter, word: b + a + s, item });
		});
		if (!answers.length) return null;

		const db = await loadWordsDb();
		const patterns = await loadPatternsDb();
		await loadSoftDb();
		answers.forEach(x => {
			if (x.w === null) { x.keys = new Set(); return; }
			if (x.caseOnly) { x.keys = new Set(['didziosios']); return; }
			// (the gap's categories: the one it was asked in and every other the word database gives the same letters)
			const morph = morphOf(db, x.word);
			x.keys = new Set();
			gapCategories(db, patterns, x.word, x.b.length, x.a.length, x.cat).forEach(cat => classifyAnswer(cat, x.b, x.a, x.s, x.w, morph).forEach(k => x.keys.add(k)));
		});
		const unexplained = answers.filter(x => x.w !== null && !x.keys.size);
		if (unexplained.length) {
			const words = await loadSudWords();
			// (a real word is one in common use - the all-grades frequency list, not every legitimate word: a very rare word
			// a child would not know is not "read as a separate word" - and not a name; without the lists, the full word rules
			// as before)
			let common = null, names = null;
			try { [common, names] = words ? await Promise.all([words.load('freqCommon'), words.load('names')]) : [null, null]; } catch (e) { common = names = null; }
			for (const x of unexplained) {
				let verdict = null;
				try {
					if (common && names) { const w = words.normalize(x.b + x.w + x.s); verdict = !w || !/^[aąbcčdeęėfghiįyjklmnoprsštuųūvzž]+$/.test(w) ? 'invalid' : common.has(w) && !names.has(w) ? 'ok' : 'unknown'; }
					else verdict = words ? (await words.verify(x.b + x.w + x.s)).verdict : null;
				} catch (e) { verdict = null; }
				if (verdict === 'ok' || verdict === 'name') x.keys.add('atskiri');
				else if (verdict) x.keys.add('nedemesys');
			}
		}

		await markRandomLetters(answers);
		answers.forEach(x => { if (!x.keys.size) x.keys.add('kita'); });
		const total = answers.reduce((sum, x) => sum + x.weight, 0);
		const byKey = new Map();
		answers.forEach(x => x.keys.forEach(key => {
			if (!byKey.has(key)) byKey.set(key, { key, ...INSIGHTS[key], count: 0, words: new Set(), tasks: new Set(), examples: [], parts: new Map(), perTask: new Map(), cats: new Set() });
			const g = byKey.get(key);
			g.count += x.weight;
			// this pattern's share of the word's record: its answers only, and their share of the tries
			if (!g.parts.has(x.item)) g.parts.set(x.item, { weight: 0, wrongs: [], task: x.task });
			const part = g.parts.get(x.item);
			part.weight += x.weight;
			if (x.w !== null) part.wrongs.push(x.caseOnly ? x.raw : x.w);   // (capitals: as typed - "F" for "f")
			g.perTask.set(x.task, (g.perTask.get(x.task) || 0) + x.weight);   // for the change of this kind of mistake
			if (x.cat) g.cats.add(x.cat);
			g.tasks.add(x.task);
			if (!g.words.has(x.word) && g.examples.length < 3) g.examples.push({ b: x.b, a: x.caseOnly ? String(x.item[0][1]) : x.a, s: x.s, w: x.caseOnly ? x.raw : x.w });
			g.words.add(x.word);
		}));
		const insights = [...byKey.values()].map(g => ({ ...g, raw: g.count, count: Math.max(1, Math.round(g.count)), share: total > 0 ? g.count / total * 100 : 0, wordCount: g.words.size, taskCount: g.tasks.size,
			items: [...g.parts.entries()].map(([item, part]) => [item[0], item[1], [Math.max(1, Math.round(part.weight)), part.wrongs.length ? part.wrongs : ((item[2] && item[2][1]) || [])], ...item.slice(3)]) }))
			// "kita" (nothing explains it) always last
			.sort((x, y) => (x.key === 'kita') - (y.key === 'kita') || y.count - x.count || y.wordCount - x.wordCount);

		// the same word written wrongly in several tasks; words that needed 3+ tries
		const wordTasks = new Map(), retried = new Set();
		answers.forEach(x => {
			if (!wordTasks.has(x.word)) wordTasks.set(x.word, new Set());
			wordTasks.get(x.word).add(x.task);
			if (x.counter >= 3) retried.add(x.word + '|' + x.task);
		});
		const repeatedWords = [...wordTasks.entries()].filter(([, t]) => t.size >= 2)
			.map(([word, t]) => ({ word, tasks: t.size })).sort((x, y) => y.tasks - x.tasks);

		return { total: Math.round(total), insights, repeatedWords, retried: retried.size, randomLetters: randomSummary(insights, total, tasksKnown || new Set(entries.map(e => e.task)).size) };
	}

	/* "Įrašinėja bet kokias raides": answers that are clearly not an attempt at the word. Only answers no spelling rule
	 * explains and that make no word at all are looked at (not even a rare one in the full SUDEDU_legit_words lists), and
	 * only plain nonsense is moved here - a wrong but possible attempt (ai for ei, uoju for ą, įje for į) stays where it is:
	 *   - signs Lithuanian has no use for: q, w, x, digits, punctuation (iuw)
	 *   - the same letter 3+ times in a row, at least two of them typed (aaa)
	 *   - a capital letter inside the word (not its first letter) - only with wrong letters (vG, knIga); the right letters
	 *     with wrong capitals are "Neteisingas didžiųjų raidžių naudojimas" (didziosios)
	 *   - 2+ typed letters, no vowel among them and none of them in the right answer, where the answer has a vowel (vg for a)
	 *   - 3+ letter combinations that no Lithuanian word form has (of ~28 million in SUDEDU_legit_words), at least half of
	 *     those the typed letters touch (thyhįh)
	 *   - the same answer filling a task: in 5+ different words with 3+ different right answers, and at least 60% of the
	 *     task's wrong answers (the same key pressed in every gap to get to the answers)
	 * Kept as "nekreipia dėmesio" (a slip): a letter typed twice where the word is otherwise right. */
	const LT_LETTERS = /^[aąbcčdeęėfghiįyjklmnoprsštuųūvzž]+$/;
	const LT_VOWELS = /[aąeęėiįyouųū]/;
	/* A slip of the finger: the wrong letters are keys right next to the right ones on a Lithuanian keyboard (QWERTY with
	 * ą č ę ė į š ų ū on the number row), in any direction - y for t, r for e, rn for en - or one extra key next to its
	 * neighbour (ty for t). Only for answers no spelling rule explains (ė sits above e and r: e / ė stays a spelling
	 * mistake). Such answers are "netyčia įrašė ne tą raidę", never "bet kokios raidės". */
	const KEY_AT = (() => {
		const rows = [['ąčęėįšųū', 0], ['qwertyuiop', 0.5], ['asdfghjkl', 0.75], ['zxcvbnm', 1.25]];
		const at = new Map();
		rows.forEach(([keys, shift], y) => [...keys].forEach((k, i) => at.set(k, [i + shift, y])));
		return at;
	})();
	function keysNextTo(x, y) {
		const p = KEY_AT.get(x), q = KEY_AT.get(y);
		if (!p || !q || x === y) return false;
		const dx = Math.abs(p[0] - q[0]), dy = Math.abs(p[1] - q[1]);
		return (dy === 0 && dx <= 1) || (dy === 1 && dx <= 0.75);
	}
	function keyboardSlip(a, w) {
		a = String(a).toLowerCase(); w = String(w).toLowerCase();
		if (!a || !w || a === w) return false;
		if (w.length === a.length) {
			const diff = [...w].map((ch, i) => [ch, a[i]]).filter(([ch, r]) => ch !== r);
			return diff.length <= 2 && diff.every(([ch, r]) => keysNextTo(ch, r));
		}
		if (w.length === a.length + 1) {
			for (let i = 0; i < w.length; i++) {
				if (w.slice(0, i) + w.slice(i + 1) !== a) continue;
				if (keysNextTo(w[i], w[i - 1]) || keysNextTo(w[i], w[i + 1])) return true;
			}
		}
		return false;
	}
	const RANDOM_ODD_MIN = 3, RANDOM_FILL_WORDS = 5, RANDOM_FILL_ANSWERS = 3, RANDOM_FILL_SHARE = 0.6;
	let lexiconPromise = null;
	// the word lists for this: every legitimate word form (to leave real words alone) and every three-letter combination
	// in them ('^' / '$' = a word's start / end), worked out from the list's structure (each node once, ~1 s at most)
	function loadLexicon() {
		if (!lexiconPromise) {
			lexiconPromise = loadSudWords().then(async words => {
				if (!words) return null;
				const [legit, extra] = await Promise.all([words.load('legit'), words.load('legitExtra')]);
				const trigrams = new Set();
				for (const dawg of [legit, extra]) {
					const kids = new Map();
					const childrenOf = n => { let k = kids.get(n); if (!k) kids.set(n, k = dawg.children(n)); return k; };
					for (const [a, n1] of childrenOf(0)) for (const [b, n2] of childrenOf(n1)) trigrams.add('^' + a + b);
					let sliceStart = Date.now();
					for (let n = 0; n < dawg.nodes; n++) {
						// (in slices: the page stays free while the table is built)
						if ((n & 1023) === 0 && Date.now() - sliceStart > 8) { await breathe(); sliceStart = Date.now(); }
						for (const [a, n1] of childrenOf(n)) for (const [b, n2] of childrenOf(n1)) {
							if (dawg.isWord(n2)) trigrams.add(a + b + '$');
							for (const [c] of childrenOf(n2)) trigrams.add(a + b + c);
						}
					}
				}
				return { isWord: w => legit.has(w) || extra.has(w), trigrams };
			}).catch(() => null);
		}
		return lexiconPromise;
	}
	// a letter typed twice where the word would otherwise be right (n-uuo-lat): a slip of the hand
	function typedTwice(cw, ww) {
		for (let i = 0; i < ww.length - 1; i++) if (ww[i] === ww[i + 1] && ww.slice(0, i) + ww.slice(i + 1) === cw) return true;
		return false;
	}
	function randomSign(x, lexicon) {
		const ww = x.b + x.w + x.s, cw = x.b + x.a + x.s;
		if (typedTwice(cw, ww) || keyboardSlip(x.a, x.w)) return false;
		if (!LT_LETTERS.test(x.w)) return true;                                      // q, w, x, digits, signs
		if ([...String(x.raw || '')].some((ch, k) => x.b.length + k > 0 && /[A-ZĄČĘĖĮŠŲŪŽ]/.test(ch))) return true;   // a capital inside the word
		if (lexicon && lexicon.isWord(ww)) return false;                             // a (rare) real word
		// a letter 3+ times in a row, at least two of them typed
		const from = x.b.length, to = x.b.length + x.w.length;
		for (const m of ww.matchAll(/(.)\1\1+/g)) {
			const typed = Math.min(to, m.index + m[0].length) - Math.max(from, m.index);
			if (typed >= 2) return true;
		}
		// consonants only, none of them from the right answer, where the answer has a vowel
		if (x.w.length >= 2 && !LT_VOWELS.test(x.w) && LT_VOWELS.test(x.a) && ![...x.w].some(ch => x.a.includes(ch))) return true;
		// combinations no word form has: the triples touching a typed letter (typed letters are p[from + 1 … to])
		if (lexicon) {
			const p = '^' + ww + '$';
			let odd = 0, all = 0;
			for (let i = Math.max(0, from - 1); i <= to && i + 3 <= p.length; i++) { all++; if (!lexicon.trigrams.has(p.slice(i, i + 3))) odd++; }
			if (odd >= RANDOM_ODD_MIN && odd * 2 >= all) return true;
		}
		return false;
	}
	async function markRandomLetters(answers) {
		const open = x => x.w !== null && x.keys.size === 1 && x.keys.has('nedemesys');
		const candidates = answers.filter(open);
		if (!candidates.length) return;
		const lexicon = await loadLexicon();
		const hits = new Set(candidates.filter(x => randomSign(x, lexicon)));
		// the same answer filling a task
		const wrongInTask = new Map(), byTask = new Map();
		answers.forEach(x => { if (x.w !== null) wrongInTask.set(x.task, (wrongInTask.get(x.task) || 0) + 1); });
		answers.forEach(x => {
			if (x.w === null) return;
			const k = x.task + '|' + x.w;
			if (!byTask.has(k)) byTask.set(k, []);
			byTask.get(k).push(x);
		});
		byTask.forEach(list => {
			if (new Set(list.map(x => x.word)).size >= RANDOM_FILL_WORDS && new Set(list.map(x => x.a)).size >= RANDOM_FILL_ANSWERS
				&& list.length >= RANDOM_FILL_SHARE * wrongInTask.get(list[0].task)) list.forEach(x => { if (open(x)) hits.add(x); });
		});
		hits.forEach(x => { x.keys = new Set(['bet_kokias']); });
	}
	// how much of it there is: in 4+ different words → said in the summary and the "!" in the teacher's list (not a share of
	// the mistakes - many real mistakes would hide it). "dažnai" when it is in 2+ tasks and in at least a fifth of the tasks
	// whose mistakes are known (3 tasks of 60 is "kartais"; one task filled with any letters too)
	const RANDOM_WORDS = 4, RANDOM_OFTEN_TASKS = 2, RANDOM_OFTEN_SHARE = 0.2;
	function randomSummary(insights, total, tasksKnown) {
		const g = insights.find(i => i.key === 'bet_kokias');
		if (!g) return { flagged: false, often: false, words: 0, share: 0, tasks: 0 };
		const share = total > 0 ? g.raw / total * 100 : 0;
		const often = g.taskCount >= RANDOM_OFTEN_TASKS && g.taskCount >= RANDOM_OFTEN_SHARE * Math.max(tasksKnown || 0, g.taskCount);
		return { flagged: g.wordCount >= RANDOM_WORDS, often, words: g.wordCount, share, tasks: g.taskCount, tasksKnown, example: g.examples[0] || null };
	}
	// one student's tasks (as the page gives them) → the same verdict as their summary's: { flagged, words, share, tasks }.
	// The same tasks as their card: the outliers (implausibly many mistakes) left out the way analyze does - against
	// opts.peers (the classmates' tasks, as the card gets them), so the "!" is never shown for mistakes the card leaves out
	async function randomLettersOf(tasks, opts = {}) {
		let list = (tasks || []).map(t => normalizeTask(t, opts.kindOf)).filter(t => t && t.subject === 'grammar' && t.answers > 0 && t.date);
		list = dropTeacherCopies(list);
		const isOutlier = outlierRule(list, opts, 'grammar');
		list = list.filter(t => !isOutlier(t));
		const entries = [];
		list.forEach((t, i) => t.detail.forEach(item => entries.push({ item, task: i })));
		if (!entries.length) return { flagged: false, often: false, words: 0, share: 0, tasks: 0 };
		const g = await analyzeGrammarMistakes(entries, list.filter(t => !t.mistakes || t.detail.length).length);
		return g ? g.randomLetters : { flagged: false, often: false, words: 0, share: 0, tasks: 0 };
	}

	// ---------------------------------------------------------------- the short summary: what the time went to
	/* The kinds of tasks and their shares of the practice time, each named "… užduotims" (dative):
	 *  math - a task set (operation + number range): insightsTaskSetLocative with {op}, "užduotyse" → "užduotims"
	 *    ("dviženklio ir vienaženklio skaičių iki 100 sudėties ir atimties užduotims"; the multiplication table:
	 *    "daugybos lentelės užduotims"); grouped by the numbers' range ("skaičių iki 100 užduotims") and by the operation;
	 *    each with its settings' time (crossing the ten - as the settings generate it -, the unknown, columns, remainder,
	 *    which multiplication tables) for the details said in brackets;
	 *  spelling - the categories (a task's time split between its categories: by the questions asked where replayed,
	 *    evenly otherwise), tasks with all of a class's categories included; their share of the time apart (all) and the
	 *    categories of the other tasks (separate); the classes of the sentences' texts;
	 *  texts - the kind of text task, with the texts' levels and classes.
	 * → { fine, scope, ops, separate: [{ key, dat, gen, share, group, attrs }] (shares 0-1 of all the time, largest
	 *     first), all, kinds: "užduočių rūšių" | "rašybos kategorijų", classes: Map(text class → time share), mine } */
	const TEXT_TYPES_GEN = { C51: 'turinio komponavimo', C52: 'struktūros išdėstymo' };
	const TABLE_OP_GEN = { C4: 'daugybos', C5: 'dalybos', C6: 'daugybos ir dalybos' };
	function practiceFocus(list, minutesOf, subject, gradeOf, isClass, textLibrary) {
		const fine = new Map(), scope = new Map(), ops = new Map(), separate = new Map(), classes = new Map();
		let total = 0, allTime = 0;
		const add = (map, key, area, time) => {
			const e = map.get(key) || { key, ...area, time: 0, attrs: {} };
			e.time += time;
			map.set(key, e);
			return e;
		};
		const tally = (attrs, name, value, time) => { const m = attrs[name] || (attrs[name] = new Map()); m.set(value, (m.get(value) || 0) + time); };
		// (the student's class of texts - known for one student only)
		const mine = !isClass && list.length && typeof gradeOf === 'function' ? studentTextClass(gradeOf(list[0].studentId)) : null;
		list.forEach(t => {
			const time = minutesOf(t) || t.answers;
			if (!(time > 0)) return;
			total += time;
			const info = t.info;
			if (subject === 'math') {
				const op = dictField(info[1], 'insightsOperationGenitive'), tpl = dictField(info[2], 'insightsTaskSetLocative');
				const dat = info[2] === 'C18' && TABLE_OP_GEN[info[1]] ? `${TABLE_OP_GEN[info[1]]} lentelės užduotims`
					: tpl && op ? tpl.replace('{op}', op).replace('lengvesnėse', 'lengvesnėms').replace('užduotyse', 'užduotims').replace(/,$/, '')
					: op ? `${op} užduotims` : `užduotims „${(topicsOf(info, 'math')[0] || '').replace(/\s*\(.*$/, '')}“`;
				// (the range: "… iki 100 …" → "skaičių iki 100"; a set without one is a range of its own)
				const upTo = (tpl.match(/iki ([\d ]+\d)/) || [])[1];
				const group = upTo ? `iki ${upTo}` : `set:${info[2]}`;
				const e = add(fine, `${info[1]}|${info[2]}`, { dat, group, opDat: op ? `${op} užduotims` : dat }, time);
				add(scope, group, { dat: upTo ? `skaičių iki ${upTo} užduotims` : dat }, time);
				add(ops, String(info[1]), { dat: op ? `${op} užduotims` : dat }, time);
				// the settings: crossing per + / − (its share of the task's questions as generated), the unknown, columns,
				// remainder, the multiplication tables
				const letters = (MATH_OPS[info[1]] || []).map(o => OP_LETTERS[o]);
				const comp = mathComposition(info);
				letters.forEach(o => {
					if ((o !== 'A' && o !== 'S') || ['C8', 'C31'].includes(info[2])) return;
					const opShare = comp ? (comp.ops[o] || 0) : 1 / letters.length;
					const cross = comp ? (comp.keys['m_cross_' + o] || 0) : null, plain = comp ? (comp.keys['m_plain_' + o] || 0) : null;
					const crossShare = comp && cross + plain > 0 ? cross / (cross + plain) : info[3] === 'C38' ? 1 : 0;
					tally(e.attrs, 'cross', 'x' + o, time * opShare * crossShare);
					tally(e.attrs, 'cross', 'p' + o, time * opShare * (1 - crossShare));
				});
				if (PLACE_RANGES.includes(info[2])) e.attrs.places = true;
				tally(e.attrs, 'unknown', info[4] === 'C42', time);
				tally(e.attrs, 'columns', info[6] === 'C48', time);
				if (letters.includes('D')) tally(e.attrs, 'remainder', info[8] === true, time);
				if (info[2] === 'C18' && Array.isArray(info[7])) tally(e.attrs, 'tables', info[7].map(Number).join('-'), time);
				return;
			}
			if (subject === 'grammar') {
				const keys = Object.keys((info[4] && typeof info[4] === 'object') ? info[4] : {}).map(k => k.split('-')[0]).filter((k, i, a) => a.indexOf(k) === i);
				const all = ALL_GRAMMAR[info[3]];
				const isAll = Boolean(all && keys.length && all.every(k => keys.includes(k)));
				if (isAll) allTime += time;
				classes.set(info[3], (classes.get(info[3]) || 0) + time);
				const perCat = new Map();
				if (t.asked && t.asked.length) t.asked.forEach(q => perCat.set(q.cat, (perCat.get(q.cat) || 0) + 1 / t.asked.length));
				else keys.forEach(k => perCat.set(k, 1 / keys.length));
				perCat.forEach((part, k) => {
					const gen = dictField(k, 'insightsSpellingGenitive');
					const area = { gen: gen || null, dat: gen ? `${gen} užduotims` : `užduotims „${GRAMMAR_TOPICS[k] || dictText(k)}“` };
					add(fine, k, area, time * part);
					if (!isAll) add(separate, k, area, time * part);
				});
				return;
			}
			const gen = TEXT_TYPES_GEN[info[2]];
			const e = add(fine, String(info[2]), { dat: gen ? `${gen} užduotims` : 'teksto supratimo užduotims' }, time);
			if (['C58', 'C59', 'C60'].includes(info[6])) tally(e.attrs, 'level', info[6], time);
			else if (textLibrary && Array.isArray(t.detail)) {
				// (texts the teacher picked: each text's level for this kind of task from the texts' database, the task's
				// time split between its texts)
				const ids = t.detail.filter(d => Array.isArray(d) && d[0] != null).map(d => String(d[0]));
				ids.forEach(id => {
					const code = textLibrary[id] && textLibrary[id].SF ? textLibrary[id].SF[info[2]] : null;
					if (['C58', 'C59', 'C60'].includes(code)) tally(e.attrs, 'level', code, time / ids.length);
				});
			}
			if (info[5]) classes.set(info[5], (classes.get(info[5]) || 0) + time);
		});
		const out = map => (total ? [...map.values()].map(e => ({ ...e, share: e.time / total })).sort((a, b) => b.share - a.share) : []);
		const shares = new Map([...classes].map(([k, v]) => [k, total ? v / total : 0]));
		return {
			fine: out(fine), scope: subject === 'math' ? out(scope) : null, ops: subject === 'math' ? out(ops) : null,
			separate: subject === 'grammar' ? out(separate) : null, all: total ? allTime / total : 0,
			kinds: subject === 'grammar' ? 'rašybos kategorijų' : 'užduočių rūšių', classes: shares, mine, subject
		};
	}
	// the kinds said together: spelling categories share one "… rašybos užduotims" ("„E“ ir „Ė“ bei minkštumo ženklo rašybos
	// užduotims"); others each with its own name, the last joined with "bei" when a name has "ir" in it
	function focusNames(areas) {
		if (areas.length > 1 && areas.every(a => a.gen && / rašybos$/.test(a.gen))) {
			const gens = areas.map((a, i) => (i < areas.length - 1 ? a.gen.replace(/ rašybos$/, '') : a.gen));
			return `${gens.slice(0, -1).join(', ')} bei ${gens[gens.length - 1]} užduotims`;
		}
		const names = areas.map(a => a.dat);
		if (names.length === 1) return names[0];
		const and = names.some(n => / ir /.test(n)) ? ' bei ' : ' ir ';
		return `${names.slice(0, -1).join(', ')}${and}${names[names.length - 1]}`;
	}
	/* The details of a kind named, in its name - only what clearly holds for its time: a setting in at least 85% of it is
	 * said plainly, in 60-85% "dažniausiai …" (not "daugiausia": that word says the shares of time), a mixed one not at all.
	 * → { pre: before the name, post: after "užduotims" }:
	 *  math - after: "pergrupuojant skaičių skyrius" / "nepergrupuojant skaičių skyrių" (the same words for + and −),
	 *    "su nežinomuoju", "stulpeliu" / "kampu", "su liekana" ("sudėties ir atimties užduotims pergrupuojant skaičių
	 *    skyrius, dažniausiai su nežinomuoju"); the multiplication tables when not the whole table: before -
	 *    "skaičiaus 7 daugybos lentelės užduotims", "skaičių 2–5 …" (one table in 60-85% after: "dažniausiai skaičiaus 7");
	 *  texts - the level before ("sunkaus lygio struktūros išdėstymo užduotims", two levels "lengvo ir vidutinio lygio";
	 *    in 60-85% after: "dažniausiai sunkaus lygio"). Spelling: none (the categories only). */
	const LEVEL_GEN = { C58: 'lengvo', C59: 'vidutinio', C60: 'sunkaus' };
	function focusDetails(areas) {
		const sum = name => {
			const m = new Map();
			areas.forEach(a => a.attrs && a.attrs[name] && a.attrs[name].forEach((v, k) => m.set(k, (m.get(k) || 0) + v)));
			return m;
		};
		const pre = [], post = [];
		// (a setting: plainly after the name, or "dažniausiai …")
		const put = (share, text) => { if (share >= FOCUS.detailPlain) post.push(text); else if (share >= FOCUS.most) post.push(`dažniausiai ${text}`); };
		// crossing the ten (or the places)
		const cross = sum('cross');
		const crossTotal = [...cross.values()].reduce((a, b) => a + b, 0);
		if (crossTotal > 0) {
			const x = [...cross].filter(([k]) => k[0] === 'x').reduce((a, [, v]) => a + v, 0) / crossTotal;
			const opsUsed = ['A', 'S'].filter(o => (cross.get('x' + o) || 0) + (cross.get('p' + o) || 0) > 0);
			const names = areas.some(a => a.attrs.places) ? CROSS_NAME_PLACES : CROSS_NAME;
			const said = i => opsUsed.length === 2 && names.A[i] !== names.S[i] ? `${names.A[i].split(' ')[0]} / ${names.S[i]}` : names[opsUsed[0]][i];
			if (x >= 0.5) put(x, said(0)); else put(1 - x, said(1));
		}
		const yes = (name, text) => {
			const m = sum(name), all = [...m.values()].reduce((a, b) => a + b, 0);
			if (all > 0) put((m.get(true) || 0) / all, text);
		};
		yes('unknown', 'su nežinomuoju');
		yes('columns', areas.every(a => /dalybos/.test(a.dat) && !/daugybos/.test(a.dat)) ? 'kampu' : 'stulpeliu');
		yes('remainder', 'su liekana');
		// the multiplication tables: one table or a part of it
		const tables = sum('tables');
		if (tables.size) {
			const all = [...tables.values()].reduce((a, b) => a + b, 0);
			const spans = [...tables].map(([k, v]) => ({ a: +k.split('-')[0], b: +k.split('-')[1], v })).sort((p, q) => q.v - p.v);
			const name = s => (s.a === s.b ? `skaičiaus ${s.a}` : `skaičių ${s.a}–${s.b}`);
			const lo = Math.min(...spans.map(s => s.a)), hi = Math.max(...spans.map(s => s.b));
			const whole = s => s.a <= 2 && s.b >= 9;
			if (!whole(spans[0]) && spans[0].v / all >= FOCUS.detailPlain) pre.push(name(spans[0]));
			else if (!whole(spans[0]) && spans[0].v / all >= FOCUS.most) post.push(`dažniausiai ${name(spans[0])}`);
			else if (!(lo <= 2 && hi >= 9)) pre.push(name({ a: lo, b: hi }));
		}
		// the texts' level
		const level = sum('level');
		if (level.size) {
			const all = [...level.values()].reduce((a, b) => a + b, 0);
			const ranked = [...level].sort((p, q) => q[1] - p[1]);
			const one = ranked[0][1] / all;
			if (one >= FOCUS.detailPlain) pre.push(`${LEVEL_GEN[ranked[0][0]]} lygio`);
			else if (one >= FOCUS.most) post.push(`dažniausiai ${LEVEL_GEN[ranked[0][0]]} lygio`);
			else if (ranked.length >= 2 && (ranked[0][1] + ranked[1][1]) / all >= FOCUS.detailPlain) {
				const two = ranked.slice(0, 2).map(r => r[0]).sort();
				pre.push(`${LEVEL_GEN[two[0]]} ir ${LEVEL_GEN[two[1]]} lygio`);
			}
		}
		return { pre, post };
	}
	// a kind's name with its details: "skaičiaus 7 daugybos lentelės užduotims", "sudėties ir atimties užduotims pergrupuojant
	// pergrupuojant skaičių skyrius, dažniausiai su nežinomuoju" (and a note in brackets at the end)
	function withDetails(area, name, note) {
		const { pre, post } = focusDetails([area]);
		// (the settings said plainly follow the name; "dažniausiai …" ones after a comma)
		const plain = post.filter(x => !/^dažniausiai /.test(x)), often = post.filter(x => /^dažniausiai /.test(x));
		let text = (pre.length ? `${pre.join(' ')} ` : '') + name;
		if (plain.length) text += ` ${plain.join(', ')}`;
		if (often.length) text += `, ${often.join(', ')}`;
		return text + (note ? ` (${note})` : '');
	}
	// one student's texts of another class than the student's: "3–4 klasės tekstai" (≥60% of the time; spelling: the
	// categories only)
	function focusClassNote(F) {
		if (F.subject !== 'text' || !F.mine || !F.classes || !F.classes.size) return '';
		const [cls, share] = [...F.classes].sort((p, q) => q[1] - p[1])[0];
		if (cls === F.mine || !TEXT_CLASS_NAME[cls] || share < FOCUS.most) return '';
		return `${share >= FOCUS.detailPlain ? '' : 'daugiausia '}${TEXT_CLASS_NAME[cls]}`;
	}
	/* One sentence (two at most) of what the time went to - the cut-offs in FOCUS:
	 *  a share in words: all (≥99.5%) / almost all (≥85%) / most (≥60%) / the most (the largest);
	 *  kinds alike - a group from the largest down while each is within 3 points (or a fifth) of the one before it and at
	 *    least 2/3 of the largest: named together ("Panašiai daug laiko skirta A ir B užduotims");
	 *  concentrated (the largest ≥40%, or 3 kinds at most): that group, then the others of at least 15% after "mažiau –"
	 *    (four named at most);
	 *  math - a range of numbers adding at least 15 points to its largest set: the range, then "daugiausia – {set}";
	 *  spelling - tasks with all categories half the time or more: said so, then the most practised separate categories;
	 *  spread out (4 kinds or more, the largest under 40%): "Laikas paskirstytas tarp N …; daugiausia jo skirta …" with
	 *    the group alike at the top when it stands out (its smallest at least 1.25× the others' average, five at most),
	 *    otherwise "gana tolygiai";
	 *  the details in the name of the one kind named first (withDetails); a second sentence only for the kinds not named
	 *    that together have a fifth of the time or more. */
	const FOCUS = { named: 0.15, similarGap: 0.03, similarRel: 0.2, similarTop: 2 / 3, most: 0.6, almostAll: 0.85, all: 0.995,
		maxNamed: 4, rest: 0.2, concentrated: 0.4, scopeGain: 0.15, standOut: 1.25, maxSpreadNamed: 5, separateMin: 0.1, detailPlain: 0.85 };
	function focusText(f) {
		const F = f.focus;
		const areas = F && F.fine;
		if (!areas || !areas.length) return '';
		const sum = list => list.reduce((x, a) => x + a.share, 0);
		const amount = share => share >= FOCUS.all ? 'Visas laikas buvo skirtas' : share >= FOCUS.almostAll ? 'Beveik visas laikas buvo skirtas'
			: share >= FOCUS.most ? 'Didžioji laiko dalis buvo skirta' : 'Daugiausia laiko buvo skirta';
		// the kinds alike from the top: each close to the one before and to the largest
		const alike = list => {
			const group = [list[0]];
			for (const a of list.slice(1)) {
				const prev = group[group.length - 1];
				if (a.share >= prev.share - Math.max(FOCUS.similarGap, FOCUS.similarRel * prev.share) && a.share >= list[0].share * FOCUS.similarTop) group.push(a);
				else break;
			}
			return group;
		};
		const note = focusClassNote(F);
		// the others: one named, otherwise how many
		const restText = (rest, of) => {
			if (!rest.length || sum(rest) < FOCUS.rest) return '';
			return rest.length === 1 ? ` Likęs laikas buvo skirtas ${focusNames(rest)}.`
				: ` Likęs laikas buvo paskirstytas tarp ${count(rest.length, ['kitos', 'kitų', 'kitų'])} ${of}.`;
		};
		const concentrated = list => {
			const top = list[0].share;
			if (list.length === 1 || top >= FOCUS.almostAll) return `${amount(top)} ${withDetails(list[0], focusNames([list[0]]), note)}.`;
			const lead = alike(list).slice(0, FOCUS.maxNamed);
			const named = [...lead];
			for (const a of list.slice(lead.length)) if (named.length < FOCUS.maxNamed && a.share >= FOCUS.named) named.push(a);
			const less = named.filter(a => !lead.includes(a));
			const start = lead.length > 1 ? 'Panašiai daug laiko buvo skirta' : amount(top);
			// (the details only after one kind: after two they would read as the last one's)
			return `${start} ${lead.length === 1 ? withDetails(lead[0], focusNames(lead), note) : focusNames(lead)}${less.length ? `, mažiau – ${focusNames(less)}` : ''}.` + restText(list.filter(a => !named.includes(a)), F.kinds);
		};
		const top = areas[0].share;
		if (areas.length === 1 || top >= FOCUS.almostAll) return `${amount(top)} ${withDetails(areas[0], focusNames([areas[0]]), note)}.`;
		// math: the range of numbers of the largest set, when it adds much to it
		if (F.scope) {
			const g = F.scope.find(x => x.key === areas[0].group);
			const sets = areas.filter(a => a.group === areas[0].group);
			if (g && sets.length > 1 && g.share >= top + FOCUS.scopeGain) {
				// (the set by its operation only: the range is said just before - "…skaičių iki 100 užduotims, daugiausia – sudėties
				// ir atimties užduotims (pergrupuojant skaičių skyrius)")
				return `${amount(g.share)} ${g.dat}, daugiausia – ${withDetails(areas[0], areas[0].opDat)}.` + restText(F.scope.filter(x => x !== g), F.kinds);
			}
		}
		// spelling: mostly tasks with all the categories
		if (F.all >= 0.5) {
			const sep = F.separate && F.separate.length && F.separate[0].share >= FOCUS.separateMin ? alike(F.separate).filter(a => a.share >= FOCUS.separateMin).slice(0, 3) : [];
			return `${amount(F.all)} užduotims su visomis rašybos kategorijomis${note ? ` (${note})` : ''}${sep.length ? `, atskirai – daugiausia ${focusNames(sep)}` : ''}.`;
		}
		const n = areas.filter(a => a.share >= 0.02).length;
		if (top >= FOCUS.concentrated || n <= 3) return concentrated(areas);
		// spread out: math by operation when that is concentrated
		if (F.ops && F.ops[0].share >= FOCUS.most) return concentrated(F.ops);
		const group = alike(areas);
		const others = areas.slice(group.length).filter(a => a.share > 0);
		const othersMean = others.length ? sum(others) / others.length : 0;
		const standsOut = others.length && group.length <= FOCUS.maxSpreadNamed && group[group.length - 1].share >= FOCUS.standOut * othersMean;
		return `Laikas buvo paskirstytas ${standsOut ? '' : 'gana tolygiai '}tarp ${n} ${F.kinds}${note ? ` (${note})` : ''}${standsOut ? `; daugiausia jo skirta ${focusNames(group)}` : ''}.`;
	}

	// ---------------------------------------------------------------- spelling: the questions asked, replayed
	/* A spelling task's questions follow from its seed, its settings, the student's grade and the texts: the generator the
	 * task page uses (rasyba-generator.js) gives the same sentences again, and the page asks their gaps in that order.
	 * The result keeps the seed and the grade in its duration (["C40", 20, seed, grade]; teacher tasks always kept the
	 * seed, older own practice has none). A replay is used only when it checks out: the gaps of its first sentences add up
	 * to exactly the task's answers, and every saved mistake is one of those gaps (the same word coordinates and the same
	 * word). Otherwise - the texts changed since, a resumed task counted a sentence twice, a restart of the older kind - the
	 * record keeps the estimates. Without a saved grade each grade group is tried, and used only when exactly one checks
	 * out (or all give the same questions). */
	const GRADE_GROUPS = [2, 1, -1];   // (the generator tells apart only grades 2-5, 0-1 and none)
	let replayDbPromise = null;
	function loadReplayDb() {
		if (!replayDbPromise) {
			const hashes = [];
			const json = file => fetch(ROOT + 'databases/' + file).then(r => (r.ok ? r.text() : null))
				.then(text => { if (text == null) return null; hashes.push(file + ':' + hashString(text)); return JSON.parse(text); }).catch(() => null);
			replayDbPromise = Promise.all([json('1_2_klase_gramatika_tekstai.json'), json('3_4_klase_gramatika_tekstai.json'),
				json('rasyba_suitable_words_patterns.json'), loadWordsDb()])
				.then(([c75, c76, patterns, words]) => {
					const G = window.SudRasybaGenerator;
					if (!G || !c75 || !c76 || !patterns || !words) return null;
					return { G, texts: { C75: c75, C76: c76 }, words, patterns, precomputed: G.buildPrecomputedWordPatterns(words, patterns),
						filesHash: wordsDbHash ? hashes.sort().join('|') + '|words:' + wordsDbHash : null };
				}).catch(() => null);
		}
		return replayDbPromise;
	}
	/* The replays kept in the browser (IndexedDB): a stream's first sentences - as many as a task with that many answers
	 * uses - for the very same files (this one, the generator's, the texts and the words: keptReplays' version; any change
	 * and they are not used any more). At most REPLAY_KEEP streams (more: all dropped and kept anew). */
	const REPLAY_KEEP = 6000;
	let keptReplaysPromise = null;
	function keptReplays(db) {
		if (!keptReplaysPromise) keptReplaysPromise = (async () => {
			if (!db.filesHash) return null;
			const parts = await Promise.all([fileHash(SCRIPT), fileHash(scriptUrl('rasyba-generator'))]);
			if (parts.some(x => !x)) return null;
			const version = String(hashString(parts.join('|') + '|' + db.filesHash));
			const idb = await keptDb();
			if (!idb) return null;
			// (each kept stream carries its version: one kept for other files - e.g. by a tab with a newer page - is never
			// used, and is removed here)
			const map = await new Promise(resolve => {
				try {
					const tx = idb.transaction('kept', 'readwrite'), found = new Map(), req = tx.objectStore('kept').openCursor();
					req.onsuccess = () => {
						const c = req.result;
						if (!c) return;
						if (typeof c.key === 'string' && c.key.startsWith('replay|')) {
							if (c.value && c.value.v === version) found.set(c.key.slice(7), c.value); else c.delete();
						}
						c.continue();
					};
					tx.oncomplete = () => resolve(found);
					tx.onerror = tx.onabort = () => resolve(null);
				} catch (e) { resolve(null); }
			});
			if (!map) return null;
			return { idb, map, version };
		})().catch(() => null);
		return keptReplaysPromise;
	}
	function keepReplay(kept, key, sentences, answers, ended) {
		if (!kept) return;
		// (the sentences up to the one where the answers are reached - what replayedQuestions reads for up to that many)
		let gaps = 0, n = 0;
		while (n < sentences.length && gaps < answers) gaps += sentences[n++].length;
		const entry = { v: kept.version, sentences: sentences.slice(0, n), cover: answers, done: ended && n === sentences.length };
		if (kept.map.size >= REPLAY_KEEP) { kept.map.clear(); keptRequest(kept.idb, 'readwrite', store => { store.clear(); }); return; }
		kept.map.set(key, entry);
		keptRequest(kept.idb, 'readwrite', store => { store.put(entry, 'replay|' + key); });
	}
	// the generated sentences' gaps, in the order asked: [[{ cat, b, a, s, coords }, ...] per sentence]
	const streamCache = new Map();
	async function questionStream(db, seed, info, grade, sentencesNeeded, textsMax, textsHash) {
		const key = JSON.stringify([seed, grade, info, textsMax, textsHash]);
		const cached = streamCache.get(key);
		if (cached && (cached.done || cached.sentences.length >= sentencesNeeded)) return cached.sentences;
		const kept = await keptReplays(db);
		const k = kept && kept.map.get(key);
		if (k && Array.isArray(k.sentences) && (k.done || k.cover >= sentencesNeeded)) return k.sentences;
		// the texts the task had: those up to its highest text id (texts added later left out), and the same ids
		let texts = db.texts[info[3]];
		if (texts && Number.isInteger(textsMax)) {
			texts = Object.fromEntries(Object.entries(texts).filter(([id]) => Number(id) <= textsMax));
			if (textsHash && db.G.textIdsFingerprint(Object.keys(texts)) !== textsHash) return null;
		}
		const conditions = info[4] && typeof info[4] === 'object' && !Array.isArray(info[4]) ? info[4] : null;
		if (!texts || !conditions) return null;
		const g = Number(grade);
		const config = {
			textsForGrammar: texts, suitableWords: db.words, suitableWordPatterns: db.patterns, codedConditions: conditions,
			precomputedWordPatterns: db.precomputed, conditionsSet: null,
			allowAdjacentEndlessWords: info[5] === 'C74' ? true : info[5] === 'C73' ? false : undefined,
			MAX_SENTENCE_CHARACTER_NUMBER_FOR_GRADES_0_to_1: 45, MIN_SENTENCE_WORD_NUMBER_FOR_GRADES_0_to_1: 3, MIN_SENTENCE_WORD_NUMBER_FOR_GRADES_2_to_5: 4,
			PRIORITIZED_TASK_CATEGORIES: ['C66-C76', 'C66-C75', 'C64'],
			userInPreSchool: g === 0, userInFirstGrade: g === 1, userInSecondGrade: g === 2, userInThirdGrade: g === 3, userInFourthGrade: g === 4, userInHigherGrade: g === 5,
			generateHelpSpans: () => '', generateConstantHelpSpans: () => '',
			classChoice: info[3], maximumQuestionFrequencyPerWord: info[6], taskFrequency: { 'C91-4': 0.35, 'C91-5': 0.35, 'C91-6': 0.35 }, quiet: true
		};
		const state = { categories: new Map(), items: new Map(), questionIdRef: { value: 1 }, counterRef: { value: 0 }, sakiniaiAndAtsakymai: [] };
		const target = Math.max(sentencesNeeded, 200);
		try { await db.G.prepareSentences(String(seed), 0, target, config, state); } catch (e) { return null; }
		const sentences = state.sakiniaiAndAtsakymai.map(entry => Object.values(entry.answers || {}).map(q => ({
			cat: String(q['kl-grupe'] || '').split('-')[0],
			b: String((q.klausimas || [])[0] ?? ''), a: String(((q.atsakymas || [])[0] || [])[0] ?? ''), s: String((q.klausimas || [])[1] ?? ''),
			coords: q['zodzio-id']
		})));
		streamCache.set(key, { sentences, done: sentences.length < target });
		keepReplay(kept, key, sentences, sentencesNeeded, sentences.length < target);
		return sentences;
	}
	// the task's questions from a stream, or null when it does not check out
	function replayedQuestions(sentences, answers, detail) {
		if (!sentences) return null;
		const asked = [];
		for (const gaps of sentences) {
			if (asked.length >= answers) break;
			asked.push(...gaps);
		}
		if (asked.length !== answers) return null;
		const byCoords = new Map(asked.map(q => [JSON.stringify(q.coords), q]));
		for (const item of detail) {
			if (!Array.isArray(item) || !Array.isArray(item[0]) || !Array.isArray(item[3])) return null;
			const q = byCoords.get(JSON.stringify(item[3]));
			if (!q || [q.b, q.a, q.s].join('|') !== item[0].map(x => String(x ?? '')).join('|')) return null;
		}
		return asked;
	}
	// which kinds of mistakes a question could get: the typical wrong answers (a letter or letters swapped, one added or
	// left out) classified as the mistakes are; the ones made on it are added by the caller
	const ANY_QUESTION = new Set(['nedemesys', 'bet_kokias', 'atskiri', 'didziosios', 'kita']);   // (any word can get these)
	const WRONG_PARTS = ['', 'a', 'ą', 'e', 'ę', 'ė', 'i', 'į', 'y', 'u', 'ų', 'ū', 'o', 'uo', 'ie', 'ei', 'ia', 'ią', 'iu', 'iū', 'eu', 'iau', 'au', 'ai',
		'ui', 'uj', 'j', 'd', 'dž', 'dz', 'z', 'ž', 's', 'š', 't', 'b', 'p', 'g', 'k', 'c', 'č', 'h', 'ch', 'f', 'v', 'm', 'n', 'l', 'r', 'iai', 'ėje', 'oje', 'iaja'];
	const possibleCache = new Map();
	function possibleMistakes(q, morphDb) {
		const b = q.b.toLowerCase(), a = q.a.toLowerCase(), s = q.s.toLowerCase();
		const key = [q.cat, b, a, s].join('|');
		if (possibleCache.has(key)) return possibleCache.get(key);
		const wrongs = new Set(WRONG_PARTS);
		for (let i = 0; i <= a.length; i++) {
			for (let len = 0; len <= Math.min(3, a.length - i); len++) {
				WRONG_PARTS.forEach(part => wrongs.add(a.slice(0, i) + part + a.slice(i + len)));
			}
		}
		wrongs.delete(a);
		const morph = morphOf(morphDb, b + a + s);
		const out = new Set();
		wrongs.forEach(w => { if (w) classifyAnswer(q.cat, b, a, s, w, morph).forEach(k => out.add(k)); });
		possibleCache.set(key, out);
		return out;
	}
	// replays the spelling tasks that have a seed: t.asked = the questions (with what each could get), or left unset
	async function replayGrammarTasks(list, gradeOf) {
		// (a grade's group in the generator: 0-1, 2-5, none)
		const groupOf = g => (g === 0 || g === 1) ? 1 : (g >= 2 && g <= 5) ? 2 : -1;
		const seeded = list.filter(t => (t.replayFrom || Array.isArray(t.duration)) && (t.replayFrom ? t.replayFrom.duration : t.duration)?.[2]);
		if (!seeded.length) return;
		const db = await loadReplayDb();
		if (!db) return;
		await loadSoftDb();   // (what a question could get: with its softness signs)
		for (const t of seeded) {
			const from = t.replayFrom || { info: t.info, answers: t.answers, detail: t.detail, duration: t.duration };
			const [, , seed, grade, textsMax, textsHash] = from.duration;
			const grades = Number.isInteger(grade) ? [grade] : GRADE_GROUPS;
			const found = [];
			for (const g of grades) {
				const asked = replayedQuestions(await questionStream(db, seed, from.info, g, from.answers, textsMax, textsHash), from.answers, from.detail);
				if (asked) found.push({ g, asked });
			}
			// several grade groups check out (an older result, saved without the grade): all the same questions, or the
			// group of the student's grade now when it is one of them; otherwise not used
			let pick = found.length === 1 ? found[0] : null;
			if (found.length > 1) {
				const now = typeof gradeOf === 'function' ? gradeOf(t.studentId) : null;
				pick = found.every(x => JSON.stringify(x.asked) === JSON.stringify(found[0].asked)) ? found[0]
					: Number.isInteger(now) ? found.find(x => x.g === groupOf(now)) || null : null;
			}
			if (!pick) continue;
			let asked = pick.asked.map(q => ({ ...q, possible: possibleMistakes(q, db.words) }));
			// (the kinds of the mistakes made on a question count as possible there)
			const made = new Map(asked.map(q => [JSON.stringify(q.coords), q]));
			from.detail.forEach(item => {
				const q = made.get(JSON.stringify(item[3]));
				const wrongs = (item[2] && Array.isArray(item[2][1]) ? item[2][1] : []).map(x => String(x ?? '').toLowerCase().replace(/\s+/g, ''));
				if (q) wrongs.forEach(w => { if (w && w !== q.a.toLowerCase()) classifyAnswer(q.cat, q.b.toLowerCase(), q.a.toLowerCase(), q.s.toLowerCase(), w, morphOf(db.words, q.b + q.a + q.s)).forEach(k => q.possible = new Set([...q.possible, k])); });
			});
			// a task narrowed to some categories by the filters: its questions of those categories (its answers exactly)
			if (t.replayFrom) {
				const keep = new Set(Object.keys((t.info[4] && typeof t.info[4] === 'object') ? t.info[4] : {}));
				asked = asked.filter(q => keep.has(q.cat));
				if (!asked.length) continue;
				t.answers = asked.length;
				t.minutes = t.rate > 0 ? t.answers / t.rate : 0;
			}
			t.asked = asked;
		}
	}
	// a spelling task's questions where mistake pattern i could happen: [count, exact?] - from the replayed questions, or
	// (no replay) the task's answers in the categories where it happened, split evenly between the task's categories
	function grammarOpportunities(i, t) {
		if (t.asked) return [ANY_QUESTION.has(i.key) ? t.asked.length : t.asked.filter(q => q.possible.has(i.key)).length, true];
		if (ANY_QUESTION.has(i.key)) return [t.answers, true];
		return categoryQuestions(t, i.cats);
	}

	// ---------------------------------------------------------------- analysis
	// Tasks that can be compared with each other: grammar - the same class and mostly the same categories
	// (Jaccard ≥ 0.6), math - the same operation and number range, texts - the same task type and level.
	function similarity(t) {
		const info = t.info;
		if (t.subject === 'grammar') return { key: String(info[3] || ''), set: new Set(Object.keys((info[4] && typeof info[4] === 'object') ? info[4] : {})) };
		if (t.subject === 'math') return { key: [info[1], info[2]].join('|'), set: null };
		return { key: [info[2], info[6]].join('|'), set: null };
	}
	function jaccard(a, b) {
		if (!a.size && !b.size) return 1;
		let both = 0;
		a.forEach(x => { if (b.has(x)) both++; });
		return both / (a.size + b.size - both);
	}
	function isSimilar(a, b) {
		const x = similarity(a), y = similarity(b);
		return x.key === y.key && (!x.set || jaccard(x.set, y.set) >= 0.6);
	}
	function similarGroups(list) {
		const groups = [];
		list.forEach(t => {
			const g = groups.find(group => isSimilar(group[0], t));
			if (g) g.push(t); else groups.push([t]);
		});
		return groups;
	}

	// the categories each class's spelling task offers (LT/uzduotys.html task form): a task with all of them is
	// "užduotys su visomis rašybos kategorijomis"
	const ALL_GRAMMAR = {
		C75: ['C61', 'C66', 'C67', 'C68', 'C85', 'C86', 'C87', 'C88', 'C89', 'C90', 'C91'],
		C76: ['C61', 'C62', 'C63', 'C64', 'C65', 'C66', 'C68', 'C69', 'C70', 'C71', 'C72', 'C92']
	};
	const CLASS_NAMES = { C75: '1–2 kl.', C76: '3–4 kl.' };
	// the categories in the accusative ("visos kategorijos, išskyrus dvibalsius")
	const GRAMMAR_ACC = {
		C61: '„H“, „CH“ ir „F“ rašybą', C62: 'daiktavardžių galūnes', C63: 'būdvardžių galūnes', C64: 'sudurtinius žodžius',
		C65: 'veiksmažodžių galūnes', C66: 'įsidėmėtiną rašybą', C67: 'panašiai skambančias priebalses', C68: 'dvibalsius',
		C69: 'priešdėlius', C70: 'priesagas', C71: 'priebalsių supanašėjimą', C72: 'mišriuosius dvigarsius',
		C85: 'galininko galūnes', C86: 'daugiskaitos kilmininko galūnes', C87: 'vietininko galūnes', C88: '„E“ ir „Ė“',
		C89: '„I“ ir „Y“', C90: '„U“ ir „Ū“', C91: 'minkštumo ženklą', C92: 'prieveiksmių pabaigas'
	};
	// math: each operation of a record, described from the record itself (a mixed task's time is split between its operations)
	const MATH_OPS = { C1: ['sud'], C2: ['atim'], C3: ['sud', 'atim'], C4: ['daug'], C5: ['dal'], C6: ['daug', 'dal'], C7: ['sud', 'atim', 'daug', 'dal'] };
	const OP_NAMES = { sud: 'sudėtis', atim: 'atimtis', daug: 'daugyba', dal: 'dalyba' };
	function mathParts(info) {
		const ops = MATH_OPS[info[1]] || [];
		// the range without the operations' names (they are said by the operation): "lentelinė iki 20"
		let range = dictText(info[2]).replace(/\s*\((.*)\)/, ', $1')
			.replace(/(sudėtis ir atimtis|sudėtis|atimtis|daugyba ir dalyba)\s*/g, '').replace(/\s+,/g, ',').replace(/,\s*$/, '').trim();
		if (info[2] === 'C18' && Array.isArray(info[7])) {
			const [a, b] = info[7].map(Number);
			range = a === b ? `skaičiaus ${a} daugybos lentelė` : `daugybos lentelė nuo ${a} iki ${b}`;
		}
		return ops.map(op => {
			const extra = [];
			if ((op === 'sud' || op === 'atim') && !['C8', 'C31'].includes(info[2])) {
				if (info[3] === 'C37') extra.push('nepergrupuojant skaičių skyrių');
				if (info[3] === 'C38') extra.push('pergrupuojant skaičių skyrius');
			}
			if (info[4] === 'C42') {
				const which = { sud: 'su nežinomu dėmeniu', daug: 'su nežinomu dauginamuoju',
					atim: info[5] === 'C44' ? 'su nežinomu atėminiu' : info[5] === 'C43' ? 'su nežinomu turiniu' : 'su nežinomuoju',
					dal: info[5] === 'C46' ? 'su nežinomu dalikliu' : info[5] === 'C45' ? 'su nežinomu daliniu' : 'su nežinomuoju' }[op];
				extra.push(which);
			}
			if (op === 'dal' && info[8] === true) extra.push('su liekana');
			const what = [range, ...extra].filter(Boolean).join(', ');
			const desc = `${OP_NAMES[op]}${what ? ` (${what})` : ''}`;
			return { key: 'math|' + desc, desc, single: `Užduotis: ${desc}.` };
		});
	}

	/* What was practised, as a tree with each part's share of the practice time (only what was practised):
	 *   math - the number range (the task's mode_choice_2) → the operation → crossing ten (+ / −) → with the unknown,
	 *          with a remainder (÷) → in a row / in a column (only when some work was done in a column);
	 *   texts - the task type → the level → with / without a distractor;  spelling - the categories.
	 * A task's time is split between its operations and crossing by what its settings generate (mathComposition), between
	 * spelling categories by its replayed questions (or evenly). A level where all of a branch is alike is not a level of
	 * its own: said in the branch's line (", pergrupuojant skaičių skyrius"), or not at all when it is the usual case (in a row,
	 * without the unknown, without a distractor). → [{ label, share, children }] */
	const OP_NAME = { A: 'sudėtis', S: 'atimtis', M: 'daugyba', D: 'dalyba' };
	// (as the task form words it: tens up to 100, the places of larger numbers - "skaičių skyrius")
	const CROSS_NAME = { A: ['pergrupuojant skaičių skyrius', 'nepergrupuojant skaičių skyrių'], S: ['pergrupuojant skaičių skyrius', 'nepergrupuojant skaičių skyrių'] };
	const CROSS_NAME_PLACES = { A: ['pergrupuojant skaičių skyrius', 'nepergrupuojant skaičių skyrių'], S: ['pergrupuojant skaičių skyrius', 'nepergrupuojant skaičių skyrių'] };
	const PLACE_RANGES = ['C13', 'C14', 'C15', 'C16', 'C34', 'C35', 'C36'];
	// the texts' database (sudedu_duomenu_baze.json): a text's level per task type (SF), its class - for the tasks with
	// texts the teacher picked, whose settings do not say the level
	let textLibraryPromise = null;
	function loadTextLibrary() {
		if (!textLibraryPromise) textLibraryPromise = fetch(ROOT + 'databases/sudedu_duomenu_baze.json').then(r => (r.ok ? r.json() : null)).catch(() => null);
		return textLibraryPromise;
	}
	// texts' class level: named only when it is not the student's (grades 0-2: 1-2 klasės texts, 3-4: 3-4 klasės texts;
	// a grade not known - not named, unless next to a class that is named)
	const TEXT_CLASS_NAME = { C75: '1–2 klasės tekstai', C76: '3–4 klasės tekstai' };
	function studentTextClass(grade) {
		return !Number.isInteger(grade) || grade < 0 ? null : grade <= 2 ? 'C75' : grade <= 4 ? 'C76' : 'higher';
	}
	function practiceTree(list, minutesOf, subject, textLibrary, gradeOf) {
		const atoms = [];   // { path: [{ key, label, quiet } | null per level], time }
		const columnsUsed = subject === 'math' && list.some(t => t.info[6] === 'C48');
		list.forEach(t => {
			const time = minutesOf(t) || t.answers;
			const info = t.info;
			if (subject === 'math') {
				let rangeLabel = standAlone(info[2]);
				let rangeKey = String(info[2]);
				if (info[2] === 'C18' && Array.isArray(info[7])) {
					const [a, b] = info[7].map(Number);
					rangeLabel = a === b ? `Skaičiaus ${a} daugybos lentelė` : `Daugybos lentelė (${a}–${b})`;
					rangeKey += ':' + a + '-' + b;
				}
				const range = { key: rangeKey, label: rangeLabel };
				const letters = (MATH_OPS[info[1]] || []).map(o => OP_LETTERS[o]);
				const comp = mathComposition(info);
				letters.forEach(op => {
					const opShare = comp ? (comp.ops[op] || 0) : 1 / letters.length;
					if (!(opShare > 0)) return;
					// crossing: + and − outside "iki 10", as the task's settings generate it (else its setting)
					let crossing = [[null, 1]];
					if ((op === 'A' || op === 'S') && !['C8', 'C31'].includes(info[2])) {
						const cross = comp ? (comp.keys['m_cross_' + op] || 0) : null, plain = comp ? (comp.keys['m_plain_' + op] || 0) : null;
						const crossShare = comp && cross + plain > 0 ? cross / (cross + plain) : info[3] === 'C38' ? 1 : 0;
						const names = (PLACE_RANGES.includes(info[2]) ? CROSS_NAME_PLACES : CROSS_NAME)[op];
						crossing = [[{ key: 'x', label: names[0] }, crossShare], [{ key: 'p', label: names[1] }, 1 - crossShare]].filter(([, sh]) => sh > 0);
					}
					// (the usual case - skaitinė lygybė - said only next to the one with the unknown)
					const unknown = info[4] === 'C42' ? { key: 'u', label: 'su nežinomuoju' } : { key: 'n', label: lowerFirst(standAlone('C41')), quiet: true };
					const remainder = op === 'D' ? (info[8] === true ? { key: 'r', label: 'su liekana' } : { key: 'nr', label: 'be liekanos', quiet: true }) : null;
					const notation = columnsUsed ? (info[6] === 'C48' ? { key: 'c', label: op === 'D' ? 'kampu' : 'stulpeliu' } : { key: 'e', label: 'eilute', quiet: true }) : null;
					crossing.forEach(([cr, crShare]) => atoms.push({ path: [range, { key: op, label: OP_NAME[op] }, cr, unknown, remainder, notation], time: time * opShare * crShare }));
				});
				return;
			}
			if (subject === 'text') {
				if (!['C51', 'C52'].includes(info[2])) return;
				const level = dictText(info[6]) ? lowerFirst(standAlone(info[6])) : '';
				const distractor = info[3] === 'C81' ? { key: 'd', label: lowerFirst(standAlone('C81')) } : info[3] === 'C80' ? { key: 'nd', label: lowerFirst(standAlone('C80')), quiet: true } : null;
				const type = { key: info[2], label: standAlone(info[2]) };
				const mine = studentTextClass(typeof gradeOf === 'function' ? gradeOf(t.studentId) : null);
				const classPart = cls => TEXT_CLASS_NAME[cls] ? { key: cls, label: TEXT_CLASS_NAME[cls], quiet: !mine || cls === mine } : null;
				if (level) { atoms.push({ path: [type, classPart(info[5]), { key: String(info[6]), label: level }, distractor], time }); return; }
				// texts the teacher picked: each text's level for this task type from the texts' database (the task's time
				// split between them by the number of texts)
				const ids = t.detail.filter(d => Array.isArray(d) && d[0] != null).map(d => String(d[0]));
				const levelOf = id => { const code = textLibrary && textLibrary[id] && textLibrary[id].SF ? textLibrary[id].SF[info[2]] : null; return ['C58', 'C59', 'C60'].includes(code) ? code : null; };
				// (a text for both classes is the student's class when that is one of them)
				const classOf = id => { const c = textLibrary && textLibrary[id] && Array.isArray(textLibrary[id].class) ? textLibrary[id].class : []; return c.includes(mine) ? mine : c.includes('C76') ? 'C76' : c[0] || null; };
				if (!ids.length) { atoms.push({ path: [type, null, null, distractor], time }); return; }
				ids.forEach(id => {
					const code = levelOf(id);
					atoms.push({ path: [type, classPart(classOf(id)), code ? { key: code, label: lowerFirst(standAlone(code)) } : null, distractor], time: time / ids.length });
				});
				return;
			}
			// spelling: by the questions asked per category where replayed, otherwise evenly between the task's categories
			const counts = new Map();
			if (t.asked) t.asked.forEach(q => counts.set(q.cat, (counts.get(q.cat) || 0) + 1));
			else Object.keys((info[4] && typeof info[4] === 'object') ? info[4] : {}).forEach(k => counts.set(k, 1));
			const all = [...counts.values()].reduce((a, b) => a + b, 0);
			// (a category the dictionary does not know: with the others like it, "Kitos kategorijos")
			counts.forEach((n, k) => atoms.push({ path: [standAlone(k) ? { key: k, label: standAlone(k) } : { key: 'other', label: 'Kitos kategorijos' }], time: time * n / all }));
		});
		const total = atoms.reduce((sum, a) => sum + a.time, 0);
		if (!total) return [];
		const levels = atoms.reduce((m, a) => Math.max(m, a.path.length), 0);
		const shareOf = g => g.reduce((sum, a) => sum + a.time, 0) / total * 100;
		// the parts alike in all of a group at any level below (said once, in the group's line - not again further down;
		// the usual ones and what the name says already - "Daugybos lentelė" needs no "daugyba" - left out)
		// (a usual one - skaitinė lygybė, eilute - is said only next to its other kind in the same branch: parentGroup)
		const alike = (group, from, name, said, parentGroup) => {
			const parts = [], levelsSaid = new Set(said);
			for (let l = from; l < levels; l++) {
				if (said.has(l)) continue;
				const keys = new Set(group.map(a => a.path[l] ? a.path[l].key : null));
				if (keys.size > 1) continue;
				levelsSaid.add(l);
				// (the same kind worded per operation - pergrupuojant skaičių skyrius - in one)
				const first = group[0].path[l];
				const part = first ? { ...first, label: joinVariants([...new Set(group.map(a => a.path[l].label))]) } : null;
				const text = [name, ...parts.map(x => x.label)].join(' ').toLowerCase();
				const differsAround = part && parentGroup && parentGroup.some(a => a.path[l] && !a.path[l].quiet && a.path[l].key !== part.key);
				if (part && (!part.quiet || differsAround) && !text.includes(part.label.slice(0, -2).toLowerCase())) parts.push({ key: part.key, label: part.label, level: l });
			}
			return { parts, levelsSaid };
		};
		// a node: { key, name, parts (alike, said after the name), share, children }
		const node = (group, level, said, parentGroup) => {
			const first = group[0].path[level];
			// (a group without this level, next to groups with it: "kita")
			const name = first ? first.label : 'kita';
			const { parts, levelsSaid } = alike(group, level + 1, name, said, parentGroup);
			return { key: first ? first.key : null, name, level, parts, share: shareOf(group), children: build(group, level + 1, levelsSaid) };
		};
		const build = (group, level, said) => {
			for (let l = level; l < levels; l++) {
				if (said.has(l)) continue;
				const keys = new Set(group.map(a => a.path[l] ? a.path[l].key : null));
				if (keys.size === 1) continue;   // (alike: among the parts of the node above)
				// (a level of only the usual kinds - e.g. texts' class when the student's grade is not known - is not a level)
				if (group.every(a => !a.path[l] || a.path[l].quiet)) continue;
				const byKey = new Map();
				group.forEach(a => {
					const k = a.path[l] ? a.path[l].key : null;
					if (!byKey.has(k)) byKey.set(k, []);
					byKey.get(k).push(a);
				});
				const nodes = [...byKey.values()].map(g => node(g, l, said, group)).filter(n => Math.round(n.share) > 0);
				// (operations practised alike are said together; the other levels' kinds are what the list is for)
				return subject === 'math' && l === 1 ? joinAlike(nodes) : nodes.sort((x, y) => y.share - x.share);
			}
			return [];
		};
		const byTop = new Map();
		atoms.forEach(a => { const k = a.path[0].key; if (!byTop.has(k)) byTop.set(k, []); byTop.get(k).push(a); });
		const top = [...byTop.values()].map(g => node(g, 0, new Set())).filter(n => Math.round(n.share) > 0).sort((x, y) => y.share - x.share);
		return top.map(finishNode);
	}
	// siblings practised alike - about the same time (the larger at most 1.35 times the smaller), the same parts and the
	// same mix below - said together: "sudėtis ir atimtis – 40%: pergrupuojant skaičių skyrius – 30%; …"
	function practisedAlike(x, y) {
		if (Math.max(x.share, y.share) > 1.35 * Math.min(x.share, y.share)) return false;
		return sameMix(x, y);
	}
	function sameMix(x, y) {
		if (x.parts.map(p => p.key).join('|') !== y.parts.map(p => p.key).join('|')) return false;
		if (x.children.map(c => c.key).sort().join('|') !== y.children.map(c => c.key).sort().join('|')) return false;
		return x.children.every(cx => {
			const cy = y.children.find(c => c.key === cx.key);
			return Math.abs(cx.share / x.share - cy.share / y.share) <= 0.1 && sameMix(cx, cy);
		});
	}
	// "pergrupuojant skaičių skyrius" + "pergrupuojant skaičių skyrius" → "pergrupuojant skaičių skyrius"
	function joinVariants(labels) {
		const unique = [...new Set(labels)];
		if (unique.length === 1) return unique[0];
		const words = unique.map(l => l.split(' '));
		let common = 0;
		while (words.every(w => w.length > common + 1 && w[w.length - 1 - common] === words[0][words[0].length - 1 - common])) common++;
		const tail = words[0].slice(words[0].length - common).join(' ');
		return unique.map((l, i) => words[i].slice(0, words[i].length - common).join(' ')).join(' / ') + (tail ? ' ' + tail : '');
	}
	// joined siblings: their names with "ir" ("sudėtis ir atimtis"), the parts and the mix below as variants
	function mergeNodes(group, joinNames = joinList) {
		const names = [...new Set(group.map(n => n.name))];
		return {
			key: group[0].key,
			name: names.length === 1 ? names[0] : joinNames(names),
			level: group[0].level,
			parts: group[0].parts.map((p, i) => ({ key: p.key, level: p.level, label: joinVariants(group.map(n => n.parts[i].label)) })),
			share: group.reduce((sum, n) => sum + n.share, 0),
			children: group[0].children.map(c => mergeNodes(group.map(n => n.children.find(x => x.key === c.key)), joinVariants)).sort((x, y) => y.share - x.share)
		};
	}
	function joinAlike(nodes) {
		const groups = [];
		nodes.sort((x, y) => y.share - x.share).forEach(n => {
			const g = groups.find(gr => practisedAlike(gr[0], n));
			if (g) g.push(n); else groups.push([n]);
		});
		return groups.map(g => (g.length === 1 ? g[0] : mergeNodes(g))).sort((x, y) => y.share - x.share);
	}
	// → { label, share, children }: the name, then the parts alike
	// (a single line left below - its kinds joined - is said in the line itself)
	function finishNode(n) {
		// (the pieces in the order of their levels: range, operation, crossing, the unknown, ...)
		const pieces = [{ level: n.level, label: n.name }, ...n.parts];
		let children = n.children;
		while (children.length === 1) {
			// (not what the line says already: "Lentelinė sudėtis ir atimtis iki 20" needs no "sudėtis ir atimtis")
			const said = pieces.map(x => x.label).join(' ').toLowerCase();
			const name = children[0].name;
			pieces.push({ level: children[0].level, label: said.includes(name.slice(0, -2).toLowerCase()) ? '' : name }, ...children[0].parts);
			children = children[0].children;
		}
		const label = pieces.filter(x => x.label).sort((a, b) => a.level - b.level).map(x => x.label).join(', ');
		return { label, share: n.share, children: children.map(finishNode) };
	}

	// a task's kind, as said in the text: { key, item (in the list of tasks done), single (about one task) }
	function taskType(t, withClass) {
		const info = t.info;
		if (t.subject === 'grammar') {
			const keys = Object.keys((info[4] && typeof info[4] === 'object') ? info[4] : {}).sort();
			const all = ALL_GRAMMAR[info[3]];
			const names = keys.map(k => GRAMMAR_TOPICS[k] || dictText(k)).filter(Boolean);
			const cls = withClass && CLASS_NAMES[info[3]] ? ` (${CLASS_NAMES[info[3]]})` : '';
			const key = info[3] + '|' + keys.join(',');
			const missing = all ? all.filter(k => !keys.includes(k)) : [];
			if (all && !missing.length) {
				return { key, all: true, desc: `visos rašybos kategorijos${cls}`, single: 'Užduotis apėmė visas rašybos kategorijas.' };
			}
			if (all && keys.length > 3 && missing.length <= 3) {
				const except = joinList(missing.map(k => GRAMMAR_ACC[k] || dictText(k)));
				return { key, desc: `visos kategorijos, išskyrus ${except}${cls}`, single: `Užduotis apėmė visas rašybos kategorijas, išskyrus ${except}.` };
			}
			const desc = names.length <= 3 ? joinList(names) : `${names.slice(0, 3).join(', ')} ir dar ${count(names.length - 3, ['kategorija', 'kategorijos', 'kategorijų'])}`;
			return { key, desc: desc + cls, single: `Užduoties ${names.length === 1 ? 'kategorija' : 'kategorijos'}: ${joinList(names)}.` };
		}
		const label = topicsOf(info, t.subject)[0] || '';
		return { key: t.subject + '|' + label, desc: label, single: label ? `Užduotis: ${label}.` : '' };
	}

	// The change of each kind of mistake (not of the tasks' settings): per task, that kind's mistakes per 100 answers,
	// over the tasks that asked words of the categories where it was made (and whose mistakes are known).
	/* The tasks whose mistakes can be told apart by kind. Older records kept no mistake details at all: of those, only the
	 * tasks without mistakes would count (the ones with mistakes are unknown), so the early part of a period looked like
	 * "no mistakes of any kind" and every kind seemed to grow ("nuo apie 0 iki 41"). So a task counts only from the day
	 * details were first recorded - the earliest recorded detail among all the tasks at hand (the student's, the class's,
	 * the classmates' given for comparison: f.detailsFrom), not decided by the student's own mistakes - and only when its
	 * own details are known; a task without mistakes counts when its record keeps details (an empty list - older records
	 * have none). A student with many tasks with mistakes but no details then (over 20 %) is left out. */
	function detailsKnown(list, detailsFrom) {
		const start = Number.isFinite(detailsFrom) ? detailsFrom : Math.min(...list.filter(t => t.mistakes > 0 && t.detail.length).map(t => t.day));
		const missing = new Map();
		list.forEach(t => {
			if (!(t.day >= start && t.mistakes > 0)) return;
			const k = String(t.studentId), m = missing.get(k) || [0, 0];
			m[0]++; if (!t.detail.length) m[1]++;
			missing.set(k, m);
		});
		const leftOut = new Set([...missing].filter(([, [all, none]]) => none > 0.2 * all).map(([k]) => k));
		// with mistakes: when its details are there; without: when the record keeps details (an empty list), or - a record
		// that does not say - from the day details were first recorded on
		return t => !leftOut.has(String(t.studentId)) && (t.mistakes > 0 ? t.detail.length > 0 : (t.detailRecorded || t.day >= start));
	}

	/* ---------------------------------------------------------------- change from the start to the end of the period
	 * The question: did a rate (mistakes per answer, answers per minute, a pattern's mistakes per chance) differ between
	 * the start and the end of the selected period?
	 * 1. Windows, from the design only (days, task kinds, exposure - never the mistakes): an early window grows from the
	 *    first practice day and a late one from the last, a whole day at a time (a day's tasks are never split: their
	 *    order within the day is not stored), until each holds the target exposure (at least a third of the period's) in
	 *    task kinds both windows share and at least WIN_DAYS practice days. When they meet first, the period is split at the day boundary that best
	 *    balances that exposure. Too little (fewer days, too little shared exposure, or a test that could never reach the
	 *    level) - the condition is skipped.
	 * 2. Test: within each stratum (a kind of task; in the class overview a student's kind of task) the late window's
	 *    count against what its exposure share predicts (stratified score statistic). Calibrated exactly by shuffling
	 *    whole (stratum, day) blocks between the two windows: valid however uneven the tasks are.
	 * 3. Size: the windows' rates over the shared kinds with the same weights on both sides (Mantel-Haenszel) - the lines
	 *    of the graph and the numbers in the text.
	 * 4. All conditions of one card (overall mistakes and speed, every task set, every mistake pattern) share one 5% budget
	 *    (weighted Holm: the overall two half of it); only what passes is said. */
	const WIN = { days: 3, mistakes: 300, speed: 60, pattern: 150, share: 1 / 3, B: 1999, alpha: 0.05, tau: 0.5 };
	// (long work in slices: a pause for the page; an analysis whose card is not wanted any more stops with CANCELLED)
	const breathe = () => new Promise(resolve => setTimeout(resolve, 0));
	const CANCELLED = { cancelled: true };
	// a small seeded generator: the same data give the same text on every render
	function seededRandom(seed) {
		let a = seed >>> 0;
		return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
	}
	function hashString(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
	function lnChoose(n, k) { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }
	/* points: [{ x: day, y: count, e: exposure, s: stratum }] → null (too little) or { p, z, early, late, ratio,
	 * windows: [[from, to], [from, to]], blocks } (rates per unit of exposure) */
	function windowTest(points, target, key) {
		const steps = windowTestSteps(points, target, key);
		let step;
		do { step = steps.next(); } while (!step.done);
		return step.value;
	}
	// (the same, pausing about every 8 ms of work - yield - so a page stays responsive; windowChangesAsync drives it)
	function* windowTestSteps(points, target, key) {
		// (stratum, day) blocks
		const blocks = new Map();
		points.forEach(q => {
			if (!(q.e > 0)) return;
			const k = q.s + '|' + q.x;
			const b = blocks.get(k) || { s: String(q.s), x: q.x, y: 0, e: 0 };
			b.y += q.y; b.e += q.e; blocks.set(k, b);
		});
		const all = [...blocks.values()];
		const days = [...new Set(all.map(b => b.x))].sort((a, b) => a - b);
		if (days.length < 2 * WIN.days) return null;
		// (each window at least the target and a third of all the exposure: a long period is compared by its first and last
		// thirds - nearly as sensitive as using every task - not by a few weeks at its very ends)
		target = Math.max(target, WIN.share * all.reduce((t, b) => t + b.e, 0));
		// the exposure in strata both windows have, on each side
		const shared = (lo, hi) => {
			const L = new Map(), R = new Map();
			all.forEach(b => { if (b.x <= days[lo]) L.set(b.s, (L.get(b.s) || 0) + b.e); else if (b.x >= days[hi]) R.set(b.s, (R.get(b.s) || 0) + b.e); });
			let l = 0, r = 0; L.forEach((v, s) => { if (R.has(s)) { l += v; r += R.get(s); } });
			return [l, r];
		};
		// grow both windows a day at a time: first to the minimum days, then the one with less shared exposure
		let lo = WIN.days - 1, hi = days.length - WIN.days;
		if (lo >= hi) return null;
		for (;;) {
			const [l, r] = shared(lo, hi);
			if (l >= target && r >= target) break;
			if (lo + 1 >= hi) { lo = -1; break; }
			if (l < target && (r >= target || l <= r)) lo++; else hi--;
		}
		if (lo < 0) {
			// the windows met: the day boundary that best balances the shared exposure (at least the minimum days each side)
			let best = null;
			for (let j = WIN.days - 1; j <= days.length - WIN.days - 1; j++) {
				const [l, r] = shared(j, j + 1), m = Math.min(l, r);
				if (!best || m > best.m) best = { m, j };
			}
			if (!best || !(best.m > 0)) return null;
			lo = best.j; hi = best.j + 1;
		}
		// the blocks of the strata both windows have
		const side = b => (b.x <= days[lo] ? 0 : b.x >= days[hi] ? 1 : -1);
		const byS = new Map();
		all.forEach(b => { const sd = side(b); if (sd < 0) return; if (!byS.has(b.s)) byS.set(b.s, [[], []]); byS.get(b.s)[sd].push(b); });
		const strata = [...byS.values()].filter(([a, b]) => a.length && b.length);
		if (!strata.length) return null;
		// (a test whose every arrangement is more likely than the level can never say anything: skipped)
		const lnArr = strata.reduce((t, [a, b]) => t + lnChoose(a.length + b.length, b.length), 0);
		if (lnArr < Math.log(2 / WIN.alpha)) return null;
		const used = strata.flatMap(([a, b]) => [...a, ...b]);
		if (used.reduce((t, b) => t + b.y, 0) === 0) return null;   // (no counts at all: nothing to compare)
		// the statistic for an assignment of each stratum's blocks to the late window (each pool's counts and exposures in
		// typed arrays, its totals summed once in the blocks' order, the late ones summed in that same order - the same
		// numbers as summing everything per arrangement, without building arrays 1999 times)
		const pools = strata.map(([a, b]) => {
			const blocks = [...a, ...b], n = blocks.length;
			const ys = new Float64Array(n), es = new Float64Array(n);
			let Y = 0, E = 0;
			blocks.forEach((bl, j) => { ys[j] = bl.y; es[j] = bl.e; Y += bl.y; E += bl.e; });
			return { n, nLate: b.length, ys, es, Y, E, flag: new Uint8Array(n), idx: new Int32Array(n) };
		});
		const stat = () => {
			let U = 0, V = 0;
			for (const pl of pools) {
				let yR = 0, eR = 0;
				for (let j = 0; j < pl.n; j++) if (pl.flag[j]) { yR += pl.ys[j]; eR += pl.es[j]; }
				const { Y, E } = pl;
				if (!(E > 0)) continue;
				U += yR - Y * eR / E; V += Y * (eR / E) * (1 - eR / E);
			}
			return V > 0 ? U / Math.sqrt(V) : 0;
		};
		pools.forEach(pl => { for (let j = 0; j < pl.n; j++) pl.flag[j] = j >= pl.n - pl.nLate ? 1 : 0; });
		const z = stat();
		const rnd = seededRandom(hashString(key + '|' + used.map(b => b.x + ':' + b.y + ':' + Math.round(b.e)).join(',')));
		let ge = 0;
		const clock = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
		let sliceStart = clock();
		for (let r = 0; r < WIN.B; r++) {
			for (const pl of pools) {
				const idx = pl.idx;
				for (let j = 0; j < pl.n; j++) idx[j] = j;
				for (let j = pl.n - 1; j > 0; j--) { const k = Math.floor(rnd() * (j + 1)); const t = idx[j]; idx[j] = idx[k]; idx[k] = t; }
				pl.flag.fill(0);
				for (let j = 0; j < pl.nLate; j++) pl.flag[idx[j]] = 1;
			}
			if (Math.abs(stat()) >= Math.abs(z) - 1e-12) ge++;
			if ((r & 31) === 31 && clock() - sliceStart > 8) { yield; sliceStart = clock(); }
		}
		// the sizes: both windows' rates with the same weights (Mantel-Haenszel)
		let wEarly = 0, wLate = 0, W = 0;
		strata.forEach(([a, b]) => {
			const yL = a.reduce((t, x) => t + x.y, 0), eL = a.reduce((t, x) => t + x.e, 0), yR = b.reduce((t, x) => t + x.y, 0), eR = b.reduce((t, x) => t + x.e, 0);
			const w = eL * eR / (eL + eR);
			wEarly += w * yL / eL; wLate += w * yR / eR; W += w;
		});
		const rawEarly = wEarly / W, rawLate = wLate / W;
		/* (only significant changes are shown, and those are exaggerated by chance - the more, the less data: the change is
		 * pulled towards none by its uncertainty - a normal prior with sd WIN.tau on the log scale - both levels alike,
		 * around their geometric middle. se from the test: |log ratio| / |z|) */
		let early = rawEarly, late = rawLate;
		if (rawEarly > 0 && rawLate > 0 && Math.abs(z) > 1e-9) {
			const lr = Math.log(rawLate / rawEarly), se = Math.abs(lr / z), k = WIN.tau * WIN.tau / (WIN.tau * WIN.tau + se * se);
			const mid = Math.sqrt(rawEarly * rawLate);
			early = mid * Math.exp(-lr * k / 2); late = mid * Math.exp(lr * k / 2);
		}
		return { p: (ge + 1) / (WIN.B + 1), z, early, late, rawEarly, rawLate, ratio: early > 0 ? late / early : Infinity,
			windows: [[days[0], days[lo]], [days[hi], days[days.length - 1]]], blocks: used.map(b => ({ x: b.x, y: b.y, e: b.e, late: b.x >= days[hi] })),
			// (every block, for the graph: the ones between the groups, or without a comparable kind on the other side, too)
			all: all.map(b => ({ x: b.x, y: b.y, e: b.e, used: used.includes(b) })) };
	}
	/* All the conditions of a card, each { key, metric, group: 'overall' | 'set' | 'pattern', label, points, target },
	 * tested and filtered by the weighted Holm procedure → the significant ones, with their direction. */
	function windowChanges(conditions) {
		return chooseChanges(conditions.map(c => ({ ...c, test: windowTest(c.points, c.target, c.key) })).filter(c => c.test));
	}
	// (the same, a little at a time with the page free in between; alive() false - the card is not wanted any more - stops it)
	async function windowChangesAsync(conditions, alive) {
		const tested = [];
		for (const c of conditions) {
			const steps = windowTestSteps(c.points, c.target, c.key);
			let step;
			for (;;) {
				step = steps.next();
				if (step.done) break;
				await breathe();
				if (alive && !alive()) throw CANCELLED;
			}
			if (step.value) tested.push({ ...c, test: step.value });
		}
		return chooseChanges(tested);
	}
	function chooseChanges(tested) {
		windowChanges.tested = tested.length;   // (how many conditions had enough data - for the text)
		windowChanges.all = tested;   // (every tested condition, for checking)
		if (!tested.length) return [];
		// weights: the overall measures half of the budget (when there is anything else), the rest the other half
		const overall = tested.filter(c => c.group === 'overall'), rest = tested.filter(c => c.group !== 'overall');
		tested.forEach(c => { c.w = !rest.length ? 1 / tested.length : c.group === 'overall' ? 0.5 / overall.length : (overall.length ? 0.5 : 1) / rest.length; });
		const order = tested.slice().sort((a, b) => a.test.p / a.w - b.test.p / b.w);
		const found = [];
		let left = tested.reduce((t, c) => t + c.w, 0);
		for (const c of order) {
			if (c.test.p > WIN.alpha * c.w / left) break;
			left -= c.w;
			// (the numbers must go the way the test says - otherwise nothing is said of it)
			if ((c.test.z > 0) !== (c.test.late > c.test.early)) continue;
			found.push({ ...c, direction: c.test.z > 0 ? 'up' : 'down' });
		}
		return found;
	}


	/* the math mistake patterns' texts (label, area, tip) - parameter_dictionary.js, insightsMathPatterns: each with its
	 * {slots} filled ({name} / {inName}: the operation, {n}: the number of the table, {which}: pirmasis / antrasis) */
	function mathText(key, slots = {}) {
		const dict = typeof insightsMathPatterns !== 'undefined' ? insightsMathPatterns : {};
		const fill = text => String(text || '').replace(/\{(\w+)\}/g, (m, k) => (k in slots ? slots[k] : m));
		const d = dict[key] || {};
		return { label: fill(d.label), area: fill(d.area), tip: fill(slots.op && d['tip_' + slots.op] != null ? d['tip_' + slots.op] : d.tip) };
	}
	const mathOperation = op => {
		const dict = typeof insightsMathPatterns !== 'undefined' ? insightsMathPatterns : {};
		return { op, ...((dict.operations || {})[op] || {}) };
	};
	// math examples: the result, the place values crossed (+ carries, − borrows: 10, 100, 1000)
	function mathResult(x) { return { A: x.a + x.b, S: x.a - x.b, M: x.a * x.b, D: x.b ? x.a / x.b : NaN }[x.op]; }
	function mathCrossed(x) {
		const out = [];
		// (every place value: numbers go up to 1 000 000)
		[10, 100, 1000, 10000, 100000, 1000000].forEach(p => {
			if (x.op === 'A' && (x.a % p) + (x.b % p) >= p && x.a + x.b >= p) out.push(p);
			if (x.op === 'S' && (x.a % p) < (x.b % p)) out.push(p);
		});
		return out;
	}
	/* A kind of task as a mistake category (insightsMathPatterns.m_set): the task's number set with the example's
	 * operation (insightsTaskSetLocative), and what makes it harder - crossing ten or not (the example itself), columns,
	 * a remainder: "Triženklio skaičiaus su vienaženkliu dalybos užduotys, su liekana, kampu" / "… užduotyse, …". */
	const SET_OP_GEN = { A: 'sudėties', S: 'atimties', M: 'daugybos', D: 'dalybos' };
	/* Whether crossing ten is a choice in a number set: the page's question generator run for the task's operation and
	 * set with crossing off (C37) and on (C38) - a choice when turning it on makes clearly more examples cross (by half
	 * of them or more). Lentelinė sudėtis ir atimtis iki 20 always crosses, dviženklio ir vienaženklio iki 20 never does:
	 * then crossing is not said. When the generator makes nothing for the settings (or is not on the page): said. */
	const crossingChoiceCache = new Map();
	let crossingProbe = false;
	function crossingIsChoice(op, range, opCode) {
		const cacheKey = op + '|' + range + '|' + opCode;
		if (crossingChoiceCache.has(cacheKey)) return crossingChoiceCache.get(cacheKey);
		if (typeof generateCombinations !== 'function' || typeof controller === 'undefined' || crossingProbe) return true;
		crossingProbe = true;
		const saved = controller;
		const shares = [];
		try {
			for (const setting of ['C37', 'C38']) {
				let crossed = 0, all = 0;
				for (let run = 0; run < 20 && all < 300; run++) {
					controller = { modeChoice1: opCode || (op === 'A' ? 'C1' : 'C2'), modeChoice2: range, modeChoice3: setting === 'C37', selectedNumbers: [], withRemainder: false, combinations: [] };
					generateCombinations();
					const batch = Array.isArray(controller.combinations) ? controller.combinations : [];
					if (!batch.length) break;
					batch.forEach(q => { if (Array.isArray(q) && q[2] === op) { all++; if (mathCrossed({ a: Number(q[0]), b: Number(q[1]), op }).length) crossed++; } });
				}
				shares.push(all ? crossed / all : null);
			}
		} catch (e) {
			shares.length = 0;
		} finally {
			controller = saved;
			crossingProbe = false;
		}
		const choice = shares.length !== 2 || shares[0] == null || shares[1] == null || shares[1] - shares[0] >= 0.5;
		crossingChoiceCache.set(cacheKey, choice);
		return choice;
	}
	function mathSetKey(x, info) {
		const cross = (x.op === 'A' || x.op === 'S') && !['C8', 'C31'].includes(info[2]) ? (mathCrossed(x).length ? 'x' : 'p') : '-';
		const col = info[6] === 'C48' ? 'c' : '';
		const rem = x.op === 'D' && info[8] === true ? 'r' : '';
		const key = `m_set_${x.op}_${info[2]}_${cross}${col}${rem}`;
		const tpl = dictField(info[2], 'insightsTaskSetLocative');
		let head = SET_OP_GEN[x.op], tail = '';
		if (tpl) {
			const t = tpl.replace('{op}', SET_OP_GEN[x.op]);
			const at = t.indexOf('užduotyse');
			head = t.slice(0, at).trim();
			tail = t.slice(at + 'užduotyse'.length).replace(/,\s*$/, '');
		}
		const names = (PLACE_RANGES.includes(info[2]) ? CROSS_NAME_PLACES : CROSS_NAME)[x.op];
		const crossWord = cross !== '-' && crossingIsChoice(x.op, info[2], info[1]) ? (cross === 'x' ? names[0] : names[1]) : '';
		const colWord = col ? (x.op === 'D' ? 'kampu' : 'stulpeliu') : '';
		const slots = d => ({ Set: cap(head.replace(/^lengvesnėse/, 'lengvesnės')), set: head, more: tail, details: d.length ? ' ' + d.join(' ') : '' });
		// (no comma: "… užduotyse pergrupuojant skaičių skyrius stulpeliu")
		const def = mathText('m_set', slots([crossWord, rem ? 'su liekana' : '', colWord].filter(Boolean)));
		// (for the Klaidos sentences: the area without the notation - said there only when one notation clearly has more
		// mistakes, mergeNotation - and the words for both notations)
		def.areaBase = mathText('m_set', slots([crossWord, rem ? 'su liekana' : ''].filter(Boolean))).area;
		def.notationWords = x.op === 'D' ? ['kampu', 'eilute'] : ['stulpeliu', 'eilute'];
		// (the area around its operation word: kinds of task that differ only in the operation are said as one -
		// "skaičių iki 10 000 dalybos ir daugybos užduotyse", joinOperations)
		const opAt = def.areaBase.indexOf(SET_OP_GEN[x.op]);
		if (opAt >= 0) def.opParts = { op: x.op, before: def.areaBase.slice(0, opAt), after: def.areaBase.slice(opAt + SET_OP_GEN[x.op].length) };
		// (addition / subtraction: the crossing advice)
		if (cross === 'x') def.tip = mathText('m_cross', mathOperation(x.op)).tip;
		else if (cross === 'p') def.tip = mathText('m_plain', mathOperation(x.op)).tip;
		return [key, def];
	}
	// a fact of the multiplication table: both factors up to 10 (division: the divisor and the quotient)
	function tableFact(x) {
		const [p, q] = x.op === 'M' ? [x.a, x.b] : [x.b, x.a / x.b];
		return Number.isInteger(p) && Number.isInteger(q) && p >= 1 && q >= 1 && p <= 10 && q <= 10;
	}
	// the patterns an example belongs to by itself (not by the answer given): [key, definition, its share of the example].
	// With its task's settings (info): the kind of task (mathSetKey) - multiplication and division facts of the table
	// by the table's numbers - and, for the generated questions (splitCrossing null), the operation / crossing ones too
	// (the practice summaries count those). Without: by the operation, crossing ten (splitCrossing) and the table's numbers.
	function mathExampleKeys(x, splitCrossing, info) {
		const out = [];
		const bySet = Array.isArray(info) && info[0] === 'math' && dictField(info[2], 'insightsTaskSetLocative') !== '';
		if (bySet && !x.unknown && !((x.op === 'M' || x.op === 'D') && tableFact(x))) {
			const [key, def] = mathSetKey(x, info);
			out.push([key, def, 1]);
			if (splitCrossing !== null) {
				if (x.a === 0 || x.b === 0) out.push(['m_zero', mathText('m_zero'), 1]);
				return out;
			}
		}
		if ((x.op === 'A' || x.op === 'S') && (!bySet || splitCrossing === null || x.unknown)) {
			const op = mathOperation(x.op);
			if (splitCrossing !== true) out.push(['m_op_' + x.op, mathText('m_op', op), 1]);
			if (splitCrossing !== false) {
				if (mathCrossed(x).length) out.push(['m_cross_' + x.op, mathText('m_cross', op), 1]);
				else out.push(['m_plain_' + x.op, mathText('m_plain', op), 1]);
			}
		}
		if ((x.op === 'M' || x.op === 'D') && !x.unknown && (!bySet || tableFact(x))) {
			const nums = new Set(x.op === 'M' ? [x.a, x.b] : [x.b, x.a / x.b]);
			const table = [...nums].filter(n => n > 1 && n <= 10 && Number.isInteger(n));
			table.forEach(n => out.push(['m_table_' + n, mathText('m_table', { n }), 1 / table.length]));
			if (!table.length) out.push(['m_muldiv', mathText('m_muldiv'), 1]);
		}
		if (x.unknown) {
			// (in + and × the place makes no difference: one kind; in − and ÷ the first and the second are different numbers)
			const names = { A: ['dėmuo', 'dėmeniu'], M: ['dauginamasis', 'dauginamuoju'], S: x.unknown === 'F' ? ['turinys', 'turiniu'] : ['atėminys', 'atėminiu'],
				D: x.unknown === 'F' ? ['dalinys', 'daliniu'] : ['daliklis', 'dalikliu'] }[x.op] || ['skaičius', 'skaičiumi'];
			const key = 'm_unknown_' + x.op + (x.op === 'S' || x.op === 'D' ? x.unknown : '');
			out.push([key, mathText('m_unknown', { which: names[0], whichIns: names[1] }), 1]);
		}
		if (x.a === 0 || x.b === 0) out.push(['m_zero', mathText('m_zero'), 1]);
		return out;
	}

	/* What a math task's questions were made of, from its settings: the page's own question generator
	 * (mental-arithmetic-combinations.js, generateCombinations) is run on them a number of times and its questions counted.
	 * A task asks its questions in batches drawn this way (a new one only after a right answer, so every answer counted
	 * is a different question of a batch), so this is the task's mix, up to its last unfinished batch. → { ops: {A: share,
	 * …}, keys: {pattern key: share} } or null (no generator on the page, or it gives nothing for these settings). */
	const compositionCache = new Map();
	/* (kept in the browser between visits too - working them out is the slowest part of a first math summary: valid while
	 * neither this file's version nor the question generator - its file's version and its code - changes; at most
	 * COMPOSITION_KEEP settings, the oldest dropped; an unusable store is simply not used) */
	const COMPOSITION_KEEP = 300, COMPOSITION_STORE = 'sudInsightsMix';
	let compositionStoreVersion = null, compositionSaveTimer = null;
	let compositionsLoading = null;
	function loadKeptCompositions() {
		if (!compositionsLoading) compositionsLoading = (async () => {
			if (typeof generateCombinations !== 'function') return;
			const parts = await Promise.all([fileHash(SCRIPT), fileHash(scriptUrl('mental-arithmetic-combinations'))]);
			if (parts.some(x => !x)) return;
			compositionStoreVersion = String(hashString(parts.join('|')));
			readKeptCompositions();
		})().catch(() => {});
		return compositionsLoading;
	}
	function readKeptCompositions() {
		try {
			const kept = JSON.parse(localStorage.getItem(COMPOSITION_STORE) || 'null');
			if (kept && kept.version === compositionStoreVersion && Array.isArray(kept.items)) {
				kept.items.forEach(([key, value]) => { if (!compositionCache.has(key) && value && value.ops && value.keys) compositionCache.set(key, value); });
			}
		} catch (e) { /* (worked out again) */ }
	}
	function keepCompositions() {
		if (compositionStoreVersion === null || compositionSaveTimer) return;
		compositionSaveTimer = setTimeout(() => {
			compositionSaveTimer = null;
			const items = [...compositionCache].filter(([, value]) => value).slice(-COMPOSITION_KEEP);
			try { localStorage.setItem(COMPOSITION_STORE, JSON.stringify({ version: compositionStoreVersion, items })); }
			catch (e) { try { localStorage.removeItem(COMPOSITION_STORE); } catch (e2) { /* (not kept) */ } }
		}, 1000);
	}
	// (the compositions of tasks' settings not worked out yet, each in its own slice of time; alive() false stops it)
	async function warmMathCompositions(tasks, alive) {
		await loadKeptCompositions();
		const seen = new Set();
		let sliceStart = Date.now();
		for (const t of tasks) {
			const info = t && t.info;
			if (!Array.isArray(info) || info[0] !== 'math') continue;
			const key = JSON.stringify(info.slice(1, 9));
			if (seen.has(key) || compositionCache.has(key)) continue;
			seen.add(key);
			const steps = compositionSteps(info);
			while (!steps.next().done) {
				if (Date.now() - sliceStart > 8) {
					await breathe();
					if (alive && !alive()) throw CANCELLED;
					sliceStart = Date.now();
				}
			}
		}
	}
	function mathComposition(info) {
		if (!Array.isArray(info) || info[0] !== 'math') return null;
		const cacheKey = JSON.stringify(info.slice(1, 9));
		if (compositionCache.has(cacheKey)) return compositionCache.get(cacheKey);
		const steps = compositionSteps(info);
		let step;
		do { step = steps.next(); } while (!step.done);
		return step.value;
	}
	// (the work itself; yields between the generator's runs and every 100 questions - the page's controller is always back
	// in place when it yields - and keeps the result in compositionCache)
	function* compositionSteps(info) {
		const cacheKey = JSON.stringify(info.slice(1, 9));
		let out = null;
		if (typeof generateCombinations === 'function' && typeof controller !== 'undefined') {
			const questions = [];
			let failed = false;
			for (let run = 0; run < 40 && questions.length < 600; run++) {
				// (the generator reads these settings from the page's controller: a stand-in for the run, put back after)
				const saved = controller;
				let batch = [];
				try {
					controller = { modeChoice1: info[1], modeChoice2: info[2], modeChoice3: info[3] === 'C37', selectedNumbers: Array.isArray(info[7]) ? info[7] : [],
						withRemainder: info[8] === true, combinations: [] };
					generateCombinations();
					batch = Array.isArray(controller.combinations) ? controller.combinations : [];
				} catch (e) {
					failed = true;
				} finally {
					controller = saved;
				}
				if (failed || !batch.length) break;
				questions.push(...batch);
				yield;
			}
			if (failed) questions.length = 0;
			const valid = questions.filter(q => Array.isArray(q) && 'ASMD'.includes(q[2]));
			if (valid.length) {
				const ops = {}, keys = {};
				const unknown = info[4] === 'C42';
				for (let n = 0; n < valid.length; n++) {
					const q = valid[n];
					ops[q[2]] = (ops[q[2]] || 0) + 1 / valid.length;
					mathExampleKeys({ a: Number(q[0]), b: Number(q[1]), op: q[2], unknown: unknown ? 'F' : null }, null, info)
						.forEach(([key, , part]) => { if (!/^m_unknown_/.test(key)) keys[key] = (keys[key] || 0) + part / valid.length; });
					if (n % 100 === 99) yield;
				}
				// (rounded: a result kept in the browser is then exactly the same as one worked out now)
				const round = shares => { Object.keys(shares).forEach(k => { shares[k] = Math.round(shares[k] * 1e6) / 1e6; }); return shares; };
				out = { ops: round(ops), keys: round(keys) };
			}
		}
		compositionCache.set(cacheKey, out);
		if (out) keepCompositions();
		return out;
	}

	/* Math mistakes (records keep the example missed: [[a, b, "F"|"S" when a number was unknown], "A"|"S"|"M"|"D"]):
	 * examples missed again and again (in several tasks), mistakes concentrated where ten is crossed, on particular
	 * numbers of the multiplication table, or on the unknown's place. Each only when the evidence is clear. */
	function analyzeMathMistakes(list) {
		const SIGN = { A: '+', S: '−', M: '×', D: '÷' };
		const entries = [];
		list.forEach((t, i) => t.detail.forEach(d => {
			if (!Array.isArray(d) || !Array.isArray(d[0]) || !'ASMD'.includes(d[1])) return;
			const a = Number(d[0][0]), b = Number(d[0][1]), unknown = d[0][2] || null;
			const tries = Array.isArray(d[2]) ? Math.max(1, Number(d[2][0]) || 1) : 1;
			const answers = Array.isArray(d[2]) && Array.isArray(d[2][1]) ? d[2][1].map(x => Number(String(x).split(' ')[0])).filter(x => isFinite(x)) : [];
			entries.push({ d, a, b, op: d[1], unknown, tries, answers, task: i });
		}));
		const total = entries.reduce((s, x) => s + x.tries, 0);
		if (total < 1) return null;
		const result = mathResult;
		const expected = x => x.unknown === 'F' ? x.a : x.unknown === 'S' ? x.b : result(x);
		const crossed = mathCrossed;
		const PLACE = { 10: ['dešimtį', 'dešimtis'], 100: ['šimtą', 'šimtas'], 1000: ['tūkstantį', 'tūkstantis'],
			10000: ['dešimt tūkstančių', 'dešimt tūkstančių'], 100000: ['šimtą tūkstančių', 'šimtas tūkstančių'], 1000000: ['milijoną', 'milijonas'] };
		const orList = arr => arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} ar ${arr[arr.length - 1]}`;
		const groups = new Map();
		// (examples: the example, or with the answer given for the patterns found from answers)
		const show = (x, g) => {
			const fact = x.unknown === 'F' ? `□ ${SIGN[x.op]} ${x.b} = ${result(x)}` : x.unknown === 'S' ? `${x.a} ${SIGN[x.op]} □ = ${result(x)}` : `${x.a} ${SIGN[x.op]} ${x.b}`;
			return g === undefined ? fact : x.unknown ? `${fact}: atsakyta ${g}, o turi būti ${expected(x)}` : `${fact} = ${g}, o turi būti ${expected(x)}`;
		};
		const add = (key, def, x, weight, answers) => {
			if (!groups.has(key)) groups.set(key, { key, ...def, count: 0, facts: new Set(), parts: new Map(), places: new Set(), ranges: new Set(), perTask: new Map() });
			const g = groups.get(key);
			g.count += weight;
			g.perTask.set(x.task, (g.perTask.get(x.task) || 0) + weight);
			const range = rangeLabel(list[x.task].info);
			if (range) g.ranges.add(range);
			g.facts.add(show(x, answers ? answers[0] : undefined));
			if (!g.parts.has(x.d)) g.parts.set(x.d, { weight: 0, answers: [], task: x.task });
			const part = g.parts.get(x.d);
			part.weight += weight;
			if (answers) part.answers.push(...answers);
			crossed(x).forEach(p => g.places.add(p));
		};
		// crossing ten tells something only when examples with and without it were practised: tasks of both settings
		// (C37 nepergrupuojant / C38 pergrupuojant), or a mixed task (įvairūs veiksmai), which mixes them - otherwise it is
		// true of every example
		const crossingTasks = list.filter(t => ['C1', 'C2', 'C3', 'C7'].includes(t.info[1]) && !['C8', 'C31'].includes(t.info[2]));
		const crossingKinds = new Set(crossingTasks.map(t => t.info[3]));
		const splitCrossing = (crossingKinds.has('C37') && crossingKinds.has('C38')) || crossingTasks.some(t => t.info[1] === 'C7');
		entries.forEach(x => {
			const w = x.tries;
			// by the example
			mathExampleKeys(x, splitCrossing, list[x.task].info).forEach(([key, def, part]) => add(key, def, x, w * part));
			// by the answers given (records since answers are saved)
			const each = x.answers.length ? w / x.answers.length : 0;
			x.answers.forEach(g => {
				const c = expected(x);
				if (!isFinite(c) || g === c) return;
				// (off by one: only adding / subtracting within 20 - small enough to be counted one by one, e.g. on the fingers)
				if (Math.abs(g - c) === 1 && (x.op === 'A' || x.op === 'S') && Math.max(x.a, x.b, x.op === 'A' ? x.a + x.b : 0) <= 20) add('m_off1', mathText('m_off1'), x, each, [g]);
				if ([10, 100].includes(Math.abs(g - c))) add('m_off10', mathText('m_off10'), x, each, [g]);
				const others = !x.unknown ? { A: [x.a - x.b, x.b - x.a, x.a * x.b], S: [x.a + x.b], M: [x.a + x.b], D: [x.a * x.b, x.a - x.b] }[x.op] : [];
				if (others.includes(g)) add('m_op', mathText('m_wrong_op'), x, each, [g]);
				if (x.unknown && g === ({ A: result(x) + (x.unknown === 'F' ? x.b : x.a), S: x.unknown === 'F' ? result(x) - x.b : NaN, M: result(x) * (x.unknown === 'F' ? x.b : x.a), D: NaN }[x.op])) {
					add('m_unknown_op', mathText('m_unknown_op'), x, each, [g]);
				}
				const cs = String(c), gs = String(g);
				if (cs.length >= 2 && gs.length === cs.length && gs.split('').reverse().join('') === cs && gs !== cs) add('m_swap', mathText('m_swap'), x, each, [g]);
			});
		});
		const insights = [...groups.values()].filter(g => g.count > 0).map(g => {
			// crossing: name the place values that were crossed
			if (g.key.startsWith('m_cross_') || /^m_set_[AS]_\w+_x/.test(g.key)) {
				const places = [...g.places].sort((a, b) => a - b);
				g.label = g.label.replace('dešimtį', orList(places.map(p => PLACE[p][0])));
				g.area = g.area.replace('dešimtį', orList(places.map(p => PLACE[p][0])));
				g.placesNom = orList(places.map(p => PLACE[p][1]));
			}
			// addition / subtraction: in which number ranges ("sudėtyje iki 20 ir 100 pergrupuojant skaičių skyrius")
			if (/^m_(cross|plain|op)_[AS]$/.test(g.key) && g.ranges.size) {
				const nums = [...g.ranges].map(r => r.slice(4)).sort((a, b) => Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')));
				const text = 'iki ' + (nums.length < 2 ? nums[0] : `${nums.slice(0, -1).join(', ')} ir ${nums[nums.length - 1]}`);
				g.label = g.label.replace(/^(Sudėtis|Atimtis)/, `$1 ${text}`);
				g.area = g.area.replace(/^(sudėtyje|atimtyje)/, `$1 ${text}`);
			}
			return { ...g, raw: g.count, count: Math.max(1, Math.round(g.count)), share: g.count / total * 100, wordCount: g.facts.size,
				examples: [...g.facts].slice(0, 3).map(text => ({ text })),
				items: [...g.parts.entries()].map(([d, part]) => [d[0], d[1], [Math.max(1, Math.round(part.weight)), part.answers.length ? part.answers : ((d[2] && d[2][1]) || [])], ...d.slice(3)]) };   // (d[3]: a column example's fields)
		}).sort((x, y) => y.count - x.count);
		return { total, insights, splitCrossing };
	}

	// a math task's number range as "iki N" (from its range setting)
	function rangeLabel(info) {
		const m = /iki [\d\s\u00a0]+\d/.exec(dictText(info[2]));
		return m ? m[0].replace(/\s+/g, ' ') : '';
	}

	/* "Klaidų kategorijos" are ranked by how often the mistake is made where it can be made, not by how many there are
	 * (a kind practised more gathers more mistakes): mistakes per 100 questions of that kind. The questions of a kind come
	 * from the tasks' settings (operations, number ranges, crossing ten, spelling categories); where a task mixes kinds
	 * and the record does not say how many questions each had, they are split evenly (the rate is then "≈").
	 * The order uses the rate shrunk towards the typical pattern's rate (Gamma–Poisson / empirical-Bayes posterior mean with the
	 * weight of SHRINK questions), so a kind seen in only a few questions does not top the list by chance; kinds with
	 * fewer than FEW questions or a single wrong one say "per mažai duomenų" and go after the rest. "kita" stays last. */
	const SHRINK = 30, FEW = 20;
	// a spelling task's questions in the given categories: [count, exact?] - the task's answers split evenly between its
	// categories
	function categoryQuestions(t, cats) {
		const keys = Object.keys((t.info[4] && typeof t.info[4] === 'object') ? t.info[4] : {});
		if (!keys.length) return [t.answers, true];
		const shared = keys.filter(k => cats.has(k)).length;
		return [t.answers * shared / keys.length, shared === 0 || shared === keys.length];
	}
	const OP_LETTERS = { sud: 'A', atim: 'S', daug: 'M', dal: 'D' };
	/* The tasks "% atvejų" is counted over: those whose mistakes by kind are known - a task with mistakes when its details
	 * are there; one without mistakes when its record keeps details (an empty list) or, a record that does not say, when
	 * the student's records of that kind (teacher / own / legacy …) mostly keep them (80% or more of those with mistakes).
	 * So whole kinds of records without details (older ones) are left out together - not only their tasks with mistakes,
	 * which would make the shares too low - and every student keeps the records that can be counted. */
	function patternTasks(list) {
		const kinds = new Map();
		list.forEach(t => {
			if (!(t.mistakes > 0)) return;
			const k = `${t.studentId}|${t.kind}`, m = kinds.get(k) || [0, 0];
			m[0]++; if (t.detail.length) m[1]++;
			kinds.set(k, m);
		});
		const keeps = t => { const m = kinds.get(`${t.studentId}|${t.kind}`); return Boolean(m && m[1] >= 0.8 * m[0]); };
		return t => t.mistakes > 0 ? t.detail.length > 0 : (t.detailRecorded || keeps(t));
	}
	function rankPatterns(res, list, subject) {
		if (!res || !res.insights || !res.insights.length) return;
		// (the questions of the tasks whose mistakes by kind are known - see patternTasks)
		const detailed = patternTasks(list);
		const known = list.map((t, i) => ({ t, i })).filter(({ t }) => t.answers > 0 && detailed(t));
		const allAnswers = known.reduce((sum, { t }) => sum + t.answers, 0);
		if (!allAnswers) return;
		// math: answers recorded since (the answer-based patterns can only be found in those records)
		const withAnswers = known.filter(({ t }) => t.detail.some(d => Array.isArray(d) && Array.isArray(d[2]) && Array.isArray(d[2][1]) && d[2][1].length));
		const answersSince = withAnswers.length ? Math.min(...withAnswers.map(({ t }) => t.day)) : Infinity;
		const ANSWER_BASED = ['m_off1', 'm_off10', 'm_op', 'm_unknown_op', 'm_swap'];
		// a task's questions where pattern i can happen: [count, exact?]
		const questions = (i, t) => {
			if (subject === 'grammar') return grammarOpportunities(i, t);
			// math: from what the task's settings generate (any record, old or new); without the generator, estimated
			const comp = mathComposition(t.info);
			if (comp && /^m_(op|cross|plain|table|muldiv|zero|set)/.test(i.key)) {
				if (/^m_(op|cross|plain)_/.test(i.key) && i.ranges && i.ranges.size && !i.ranges.has(rangeLabel(t.info))) return [0, true];
				return [t.answers * (comp.keys[i.key] || 0), true];
			}
			const ops = (MATH_OPS[t.info[1]] || []).map(o => OP_LETTERS[o]);
			const share = letters => ops.filter(l => letters.includes(l)).length / (ops.length || 1);
			let m;
			if ((m = /^m_(op|cross|plain)_([AS])$/.exec(i.key))) {
				if (i.ranges && i.ranges.size && !i.ranges.has(rangeLabel(t.info))) return [0, true];
				let part = share([m[2]]);
				let exact = part === 0 || part === 1;
				if (m[1] !== 'op') {
					const noCrossing = t.info[3] === 'C37' || ['C8', 'C31'].includes(t.info[2]);
					const crossing = t.info[3] === 'C38';
					if (crossing || noCrossing) part *= (m[1] === 'cross') === crossing ? 1 : 0;
					else { part /= 2; exact = false; }
				}
				return [t.answers * part, exact];
			}
			if ((m = /^m_table_(\d+)$/.exec(i.key))) {
				const part = share(['M', 'D']);
				if (!part) return [0, true];
				const n = Number(m[1]);
				const [a, b] = t.info[2] === 'C18' && Array.isArray(t.info[7]) ? t.info[7].map(Number) : [2, 10];
				return [n >= a && n <= b ? t.answers * part / (b - a + 1) : 0, false];
			}
			if (i.key === 'm_muldiv') { const part = share(['M', 'D']); return [t.answers * part, part === 0 || part === 1]; }
			if ((m = /^m_set_([ASMD])_(C\d+)_([xp-])(c?)(r?)$/.exec(i.key))) {
				// (the same number set, columns and remainder as the task; crossing split evenly when the task mixes it)
				if (t.info[2] !== m[2] || (t.info[6] === 'C48') !== (m[4] === 'c') || (m[1] === 'D' && (t.info[8] === true) !== (m[5] === 'r'))) return [0, true];
				let part = share([m[1]]), exact = part === 0 || part === 1;
				if (m[3] !== '-') {
					const crossing = t.info[3] === 'C38', noCrossing = t.info[3] === 'C37';
					if (crossing || noCrossing) part *= (m[3] === 'x') === crossing ? 1 : 0;
					else { part /= 2; exact = false; }
				}
				return [t.answers * part, exact];
			}
			if (/^m_unknown_/.test(i.key)) return [t.info[4] === 'C42' ? t.answers : 0, i.key === 'm_unknown_op'];
			if (ANSWER_BASED.includes(i.key)) return [t.day >= answersSince ? t.answers : 0, true];
			return [t.answers, true];
		};
		res.insights.forEach(i => {
			let e = 0, exact = true;
			i.perTaskQ = new Map();   // (each counted task's chances for it - for its change over the period)
			known.forEach(({ t, i: idx }) => {
				let [q, ok] = questions(i, t);
				// (a task where it was made could have it, whatever its settings say)
				const made = i.perTask ? i.perTask.get(idx) || 0 : 0;
				if (made > 0 && q < made) { q = Math.max(made, t.answers * 0.5); ok = false; }
				if (q > 0) { e += q; if (!ok) exact = false; i.perTaskQ.set(idx, q); }
			});
			const raw = i.raw != null ? i.raw : i.count;
			if (e <= 0) e = allAnswers;
			i.questions = e;
			i.rate = raw / e * 100;
			i.approx = !exact;
			// questions answered wrongly (a question with several wrong tries counts once)
			i.wrong = i.parts ? [...i.parts.values()].reduce((sum, part) => sum + Math.min(1, part.weight), 0) : Math.min(raw, e);
			// (per task: the questions answered wrongly - the "% atvejų" of a task)
			i.perTaskWrong = new Map();
			if (i.parts) i.parts.forEach(part => { if (part.task != null) i.perTaskWrong.set(part.task, (i.perTaskWrong.get(part.task) || 0) + Math.min(1, part.weight)); });
			i.few = e < FEW;
			i.general = e >= allAnswers * 0.95;
		});
		// (math: a kind of task's other notation - columns / a row - without a mistake is not a category; its questions are
		// kept with the one that has mistakes, for comparing the two - mergeNotation)
		if (subject === 'math') res.insights.forEach(i => {
			const m = /^(m_set_[ASMD]_C\d+_[xp-])(c?)(r?)$/.exec(i.key);
			if (!m) return;
			const other = m[1] + (m[2] ? '' : 'c') + m[3];
			if (res.insights.some(x => x.key === other)) return;
			const e = known.reduce((sum, { t }) => sum + questions({ key: other }, t)[0], 0);
			if (e > 0) i.otherNotationQuestions = e;
		});
		// (shrunk towards the typical rate of a pattern: all the patterns' mistakes over all their questions)
		const named = res.insights.filter(i => i.key !== 'kita');
		const pooled = named.reduce((sum, i) => sum + (i.raw != null ? i.raw : i.count), 0) / (named.reduce((sum, i) => sum + i.questions, 0) || 1);
		res.insights.forEach(i => { i.score = ((i.raw != null ? i.raw : i.count) + SHRINK * pooled) / (i.questions + SHRINK); });
		/* The order: by how high the "% atvejų" reliably is - a cautious lower estimate (90% one-sided) that is lower the fewer
		 * the chances and the more the wrong answers sit in a few words (examples): its uncertainty on the log scale is the
		 * binomial part (1 - p) / wrong plus 1 / the effective number of words (Kish: (Σ w)² / Σ w², w = a word's wrong
		 * answers) - one hard word is not a general problem. Fewer than FEW chances after them, "kita" last. */
		res.insights.forEach(i => {
			const p = i.wrong / Math.max(i.questions, 1e-9);
			const byWord = new Map();
			if (i.parts) i.parts.forEach((part, item) => {
				const word = Array.isArray(item) && Array.isArray(item[0]) ? item[0].join('') : JSON.stringify(item);
				byWord.set(word, (byWord.get(word) || 0) + Math.min(1, part.weight));
			});
			const ws = [...byWord.values()], W = ws.reduce((a, v) => a + v, 0), W2 = ws.reduce((a, v) => a + v * v, 0);
			i.effectiveWords = W2 > 0 ? W * W / W2 : 0;
			// (the words are the independent pieces: Student's t with effective words - 1 degrees of freedom, at least 1)
			const z = tQuantile90(Math.max(1, i.effectiveWords - 1));
			i.reliableRate = i.wrong > 0 && i.effectiveWords > 0 ? p * Math.exp(-z * Math.sqrt(Math.max(0, 1 - p) / i.wrong + 1 / i.effectiveWords)) : 0;
		});
		res.insights.sort((x, y) => (x.key === 'kita') - (y.key === 'kita') || x.few - y.few || y.reliableRate - x.reliableRate || y.count - x.count);
	}

	// the class overview: each student's own time, frequency and mistakes, and the typical (median) student
	function classStats(list, minutesOf, value, classSize, f) {
		const byStudent = new Map();
		list.forEach(t => {
			const key = t.studentId == null ? '?' : String(t.studentId);
			if (!byStudent.has(key)) byStudent.set(key, []);
			byStudent.get(key).push(t);
		});
		const students = [...byStudent.values()];
		const per = students.map(l => {
			const answers = l.reduce((s, t) => s + t.answers, 0), mistakes = l.reduce((s, t) => s + t.mistakes, 0);
			return {
				minutes: l.reduce((s, t) => s + minutesOf(t), 0),
				days: [...new Set(l.map(t => t.date))].map(dayNumber),
				rate: answers ? (f.perText ? mistakes / answers : mistakes / answers * 100) : 0,
				tasks: l.length, answers,
				// (answers per minute; texts: minutes per text - over the tasks with their own time)
				speed: (() => { const timed = l.filter(t => t.minutes > 0 && t.answers > 0); const a = timed.reduce((s, t) => s + t.answers, 0), m = timed.reduce((s, t) => s + t.minutes, 0); return a && m ? (f.perText ? m / a : a / m) : null; })()
			};
		});
		return {
			students: students.length,
			classSize: classSize && classSize >= students.length ? classSize : null,
			minutes: median(per.map(x => x.minutes)),
			weeks: weekCounts(per.map(x => x.days), f.from, f.to),
			rate: median(per.map(x => x.rate)),
			tasks: median(per.map(x => x.tasks)),
			answers: median(per.map(x => x.answers)),
			speed: per.some(x => x.speed) ? median(per.filter(x => x.speed).map(x => x.speed)) : null
		};
	}

	/* The student next to the classmates, said only when clearly different (most students are around the middle):
	 * time spent (all of it, over the same period and record kinds) and, in tasks similar to the student's own,
	 * the mistake rate and the speed. peers: [{ studentId, tasks: [...] }] */
	function taskDifficulty(info, grade) {
		const weights = typeof pointWeights !== 'undefined' && pointWeights ? pointWeights : null;
		if (!weights || !Array.isArray(info)) return null;
		const g = Number.isInteger(grade) && grade >= 0 && grade <= 5 ? grade : 2;
		const w = code => { const v = weights[code] && weights[code].values; return v && v[g] != null ? Number(v[g]) : 1; };
		let codes = [];
		if (info[0] === 'math') codes = [info[1], info[2], info[3], info[4], info[5]];
		else if (info[1] === 'C49') codes = [info[1], info[2], info[3], info[5], info[6]];
		else if (info[1] === 'C83') codes = [info[2], info[3]];
		let d = codes.filter(c => typeof c === 'string').reduce((x, c) => x * w(c), 1);
		if (info[0] === 'math' && info[8] === true) d *= w('remainder');
		if (info[0] === 'math' && info[2] === 'C18' && Array.isArray(info[7])) {
			const [a, b] = info[7].map(Number);
			d *= b === 1 ? w('DL1') : b === 2 ? w('DL2') : a === 10 && b === 10 ? w('DL10') : w('DLALL');
		}
		return d > 0 && isFinite(d) ? d : null;
	}
	/* The class values below come from a handful of classmates, so they are uncertain too: the same comparison over the
	 * classmates resampled (PEER_BOOT times, seeded - the same data give the same text) gives that spread, added to the
	 * student's own; degrees of freedom by Welch-Satterthwaite (the student's tasks and the classmates). */
	const PEER_BOOT = 999;
	const PEER_TEST = { method: 'new' };   // ('old': the class values taken as exact - only to compare the two; SudInsights._PEER_TEST)
	const welchDf = (v1, df1, v2, df2) => Math.max(1, (v1 + v2) ** 2 / (v1 ** 2 / Math.max(1, df1) + v2 ** 2 / Math.max(1, df2) || 1));
	// kinds: [{ vals: each classmate's value in the kind (null: not done), cv: the class value }]; statOf(class values) → number
	function classSpread(kinds, statOf, key) {
		if (PEER_TEST.method === 'old' || !kinds.length) return { v: 0, pool: 0 };
		const users = [];
		for (let i = 0; i < kinds[0].vals.length; i++) if (kinds.some(k => k.vals[i] != null)) users.push(i);
		const rnd = seededRandom(hashString(key));
		let s = 0, s2 = 0, n = 0;
		const pick = new Array(users.length), v = [];
		for (let b = 0; b < PEER_BOOT; b++) {
			for (let j = 0; j < users.length; j++) pick[j] = users[Math.floor(rnd() * users.length)];
			// (a kind with fewer than 3 of its classmates drawn: the median of those there are - none: the class value)
			const cvs = kinds.map(k => { v.length = 0; for (const i of pick) if (k.vals[i] != null) v.push(k.vals[i]); return v.length ? median(v) : k.cv; });
			const x = statOf(cvs);
			if (isFinite(x)) { s += x; s2 += x * x; n++; }
		}
		return { v: n > 1 ? Math.max(0, (s2 - s * s / n) / (n - 1)) : 0, pool: users.length };
	}
	function comparePeers(list, peers, subject, opts, value, speedOf) {
		const out = {};
		// each classmate's results in this subject (the page passes those of the same period and record kinds)
		const notOutlier = t => !(opts.isOutlier && opts.isOutlier(t));
		const peerLists = peers.map(p => dropTeacherCopies((p.tasks || []).map(t => normalizeTask(t, opts.kindOf)).filter(t => !t || notOutlier(t))
			.filter(t => t && t.subject === subject && t.answers > 0 && t.date)));
		// time spent: the student's against the classmates' (those who did nothing count as 0)
		const minutes = l => {
			const timed = l.filter(t => t.minutes > 0);
			const m = timed.reduce((s, t) => s + t.minutes, 0), rate = m > 0 ? timed.reduce((s, t) => s + t.answers, 0) / m : 0;
			return l.reduce((s, t) => s + (t.minutes > 0 ? t.minutes : rate > 0 ? t.answers / rate : 0), 0);
		};
		const mine = minutes(list);
		const peerMinutes = peerLists.map(minutes).sort((a, b) => a - b);
		// ("typical" in the class: between its quartiles - the middle half of the classmates)
		const quartile = (sorted, q) => { const k = (sorted.length - 1) * q, lo = Math.floor(k); return sorted[lo] + (sorted[Math.ceil(k)] - sorted[lo]) * (k - lo); };
		const med = median(peerMinutes);
		out.time = mine > quartile(peerMinutes, 0.75) ? 'more' : mine < quartile(peerMinutes, 0.25) ? 'less' : 'similar';
		// how often: days with work in the period, the same way
		const myDays = new Set(list.map(t => t.date)).size;
		const peerDays = peerLists.map(l => new Set(l.map(t => t.date)).size).sort((a, b) => a - b);
		const dayMed = median(peerDays);
		// (and by at least one whole day a week: a smaller difference does not matter)
		const weeks = Math.max(1, (dayNumber(opts.period && opts.period.end || list[list.length - 1].date) - dayNumber(opts.period && opts.period.start || list[0].date) + 1) / 7);
		const dayGap = Math.abs(myDays - dayMed) / weeks;
		out.days = dayGap < 1 ? 'similar' : myDays > quartile(peerDays, 0.75) ? 'more' : myDays < quartile(peerDays, 0.25) ? 'less' : 'similar';
		out.myDays = myDays; out.dayMedian = dayMed;
		// the classmates' mistake rates (per 100 answers; texts: per text) - their lower quartile for "Klaidų nedaug"
		const peerRates = peerLists.map(l => { const a = l.reduce((x, t) => x + t.answers, 0); return a ? l.reduce((x, t) => x + t.mistakes, 0) / a * (subject === 'text' ? 1 : 100) : null; })
			.filter(v => v != null).sort((a, b) => a - b);
		out.rateQ1 = peerRates.length >= 4 ? quartile(peerRates, 0.25) : null;
		/* mistakes and speed against the class in the same kinds of tasks: the class's value of a kind (similar settings)
		 * is the median of the classmates who did it (at least 3) of their own average in it; each of the student's tasks is
		 * set against its kind's class value, and the differences are averaged over the tasks (weighted by their answers) -
		 * so the student and the class are compared on the very same mix of tasks. Said only when clear: at least 3 tasks on
		 * 2 days, the tasks' differences on one side beyond chance (weighted t test, p < 0.05) and big enough. */
		const groups = similarGroups(list);
		const wmean = (arr, f) => { const w = arr.reduce((s, t) => s + t.answers, 0); return w ? arr.reduce((s, t) => s + f(t) * t.answers, 0) / w : null; };
		// (the weight of a task in an average: its answers for mistakes; for speed its minutes - answers per minute over all
		// the time - and for texts' minutes per text its texts)
		const speedWeight = t => (subject === 'text' ? t.answers : t.minutes);
		const wmeanBy = (arr, f, wf) => { const w = arr.reduce((s, t) => s + wf(t), 0); return w ? arr.reduce((s, t) => s + f(t) * wf(t), 0) / w : null; };
		// (each classmate's own value in a kind - null when they did none of it; the class value: their median, at least 3)
		const peerValues = (g, f, timedOnly) => peerLists.map(peer => {
			const theirs = peer.filter(o => isSimilar(g[0], o) && (!timedOnly || o.minutes > 0));
			const v = theirs.length ? (timedOnly ? wmeanBy(theirs, f, speedWeight) : wmean(theirs, f)) : null;
			return v != null && isFinite(v) && v >= 0 ? v : null;
		});
		const valueOf = vals => { const v = vals.filter(x => x != null); return v.length >= 3 ? median(v) : null; };
		const classValue = (g, f, timedOnly) => valueOf(peerValues(g, f, timedOnly));
		const rows = [], speedRows = [], classPoints = [], classTimedPoints = [];
		// (the kinds compared, for the class values' uncertainty: the student's answers / time in each)
		const mistakeKinds = [], speedKinds = [];
		// (the graph's class curve on the student's mix of kinds: a kind's classmate tasks together weigh as much as the
		// student's answers in it - the same mix as the text's class average)
		const mixed = (g, pick, f, target, wf) => {
			const each = peerLists.map(peer => peer.filter(o => isSimilar(g[0], o) && pick(o))).filter(l => l.length);
			const out = [];
			each.forEach(l => { const W = l.reduce((a, o) => a + wf(o), 0); if (W > 0) l.forEach(o => out.push({ v: f(o), w: target / each.length * wf(o) / W })); });
			return out;
		};
		groups.forEach(g => {
			const vals = peerValues(g, value, false), cv = valueOf(vals);
			if (cv != null) mistakeKinds.push({ vals, cv, w: g.reduce((a, t) => a + t.answers, 0) });
			if (cv != null) classPoints.push(...mixed(g, () => true, value, g.reduce((a, t) => a + t.answers, 0), o => o.answers));
			const timedMine = g.filter(t => t.minutes > 0 && speedOf(t) > 0);
			if (timedMine.length && classValue(timedMine, speedOf, true) > 0) classTimedPoints.push(...mixed(g, o => o.minutes > 0 && speedOf(o) > 0, speedOf, timedMine.reduce((a, t) => a + speedWeight(t), 0), speedWeight));
			if (cv != null) g.forEach(t => rows.push({ w: t.answers, y: t.mistakes, mu: t.answers * cv / (subject === 'text' ? 1 : 100), mine: value(t), cls: cv, d: value(t) - cv, date: t.date }));
			const timedG = g.filter(t => t.minutes > 0 && speedOf(t) > 0);
			const speedVals = timedG.length ? peerValues(timedG, speedOf, true) : null;
			const cs = speedVals ? valueOf(speedVals) : null;
			if (cs > 0) {
				timedG.forEach(t => speedRows.push({ w: speedWeight(t), mine: speedOf(t), cls: cs, d: Math.log(speedOf(t) / cs), date: t.date }));
				speedKinds.push({ vals: speedVals, cv: cs, w: timedG.reduce((a, t) => a + speedWeight(t), 0) });
			}
		});
		const judge = (rs, big, spread) => {
			if (rs.length < 3 || new Set(rs.map(r => r.date)).size < 2) return { verdict: 'unknown' };
			const W = rs.reduce((a, r) => a + r.w, 0), W2 = rs.reduce((a, r) => a + r.w * r.w, 0);
			const D = rs.reduce((a, r) => a + r.w * r.d, 0) / W;
			const s2 = rs.reduce((a, r) => a + r.w * (r.d - D) ** 2, 0) / Math.max(1e-9, W - W2 / W);
			const varStudent = s2 * W2 / W / W, varClass = spread ? spread.v : 0;
			const se = Math.sqrt(varStudent + varClass);
			const p = se > 0 ? tPValue(D / se, welchDf(varStudent, rs.length - 1, varClass, spread ? spread.pool - 1 : 1)) : (D === 0 ? 1 : 0);
			const verdict = !big(D) ? 'similar' : p < 0.05 ? (D > 0 ? 'more' : 'less') : 'unknown';
			return { verdict, D, mine: rs.reduce((a, r) => a + r.w * r.mine, 0) / W, cls: rs.reduce((a, r) => a + r.w * r.cls, 0) / W };
		};
		/* mistakes are counts: the student's total against what the class's rates would give on the same tasks
		 * (quasi-Poisson rate ratio, the dispersion from the tasks themselves, at least 1; Student's t with n - 1) */
		const judgeCounts = (rs, big, spread) => {
			if (!rs.length) return { verdict: 'none' };   // (no kind of task the classmates did too: nothing to compare)
			const O = rs.reduce((a, r) => a + r.y, 0), E = rs.reduce((a, r) => a + r.mu, 0), A = rs.reduce((a, r) => a + r.w, 0);
			const scale = subject === 'text' ? 1 : 100;
			const out1 = { D: (O - E) / A * scale, mine: O / A * scale, cls: E / A * scale };
			// (too few tasks for a test: the numbers, and "unknown" - said as what it looks like, not as a finding)
			if (rs.length < 3 || new Set(rs.map(r => r.date)).size < 2) return { verdict: 'unknown', ...out1 };
			if (!(E > 0) || !(O > 0)) return { verdict: big(out1.D) ? 'unknown' : 'similar', ...out1 };
			const rr = O / E;
			const phi = Math.max(1, rs.reduce((a, r) => a + (r.mu > 0 ? (r.y - rr * r.mu) ** 2 / (rr * r.mu) : 0), 0) / (rs.length - 1));
			const varStudent = phi / O, varClass = spread ? spread.v : 0;
			const p = tPValue(Math.log(rr) / Math.sqrt(varStudent + varClass), welchDf(varStudent, rs.length - 1, varClass, spread ? spread.pool - 1 : 1));
			return { verdict: !big(out1.D) ? 'similar' : p < 0.05 ? (out1.D > 0 ? 'more' : 'less') : 'unknown', ...out1 };
		};
		/* The numbers said are the ones tested: the student's overall rate on these tasks (mistakes / answers; answers /
		 * minutes) against the typical classmate's (the median of the classmates' overall rates) on the same mix of tasks. */
		// (the uncertainty: the expected mistakes (log) and the class's average speed (log, by the student's time) over
		// resampled classmates; only when there is a test to run)
		const scale = subject === 'text' ? 1 : 100;
		const seedKey = subject + '|' + rows.map(r => r.y + '/' + r.w).join(',') + '|' + speedRows.length;
		const testable = rs => rs.length >= 3 && new Set(rs.map(r => r.date)).size >= 2;
		const mistakeSpread = testable(rows) ? classSpread(mistakeKinds, cvs => Math.log(cvs.reduce((a, cv, k) => a + mistakeKinds[k].w * cv / scale, 0) + 0.5), 'm|' + seedKey) : null;
		const speedW = speedKinds.reduce((a, k) => a + k.w, 0);
		const speedSpread = testable(speedRows) ? classSpread(speedKinds, cvs => cvs.reduce((a, cv, k) => a + speedKinds[k].w * Math.log(cv), 0) / speedW, 's|' + seedKey) : null;
		const m = judgeCounts(rows, d => Math.abs(d) >= (subject === 'text' ? 0.3 : 5), mistakeSpread);
		out.mistakes = m.verdict;
		out.mistakesBy = m.D || 0;
		out.myGroupValue = m.mine != null ? m.mine : null;   // (the class's value over the same tasks: myGroupValue - mistakesBy)
		const sp = judge(speedRows, d => Math.abs(d) >= Math.log(1.2), speedSpread);
		// (speed: answers per minute up = faster; texts: minutes per text)
		out.speed = sp.verdict;
		out.speedBy = sp.D != null ? Math.exp(sp.D) : 1;
		out.mySpeed = sp.mine || 0;
		out.peerSpeed = sp.cls || 0;
		out.mine = mine; out.median = med;
		// (the curves of the comparisons' graphs: each task's value, the student's and the classmates' in the same kinds)
		out.dist = {
			mistakes: rows.length ? { mine: rows.map(r => ({ v: r.mine, w: r.w })), cls: classPoints, mineMean: m.mine, clsMean: m.cls } : null,
			speed: speedRows.length ? { mine: speedRows.map(r => ({ v: r.mine, w: r.w })), cls: classTimedPoints, mineMean: sp.mine, clsMean: sp.cls } : null
		};
		// "clearly" (difficulty): at least 4 classmates to compare with, three quarters of them on the same side, a real difference
		const clear = (arr, side, big) => {
			if (arr.length < 4) return 'unknown';   // (too few to compare with: nothing is said)
			const up = arr.filter(x => side(x) > 0).length / arr.length, down = arr.filter(x => side(x) < 0).length / arr.length;
			if (up >= 0.75 && big(median(arr))) return 'more';
			if (down >= 0.75 && big(median(arr))) return 'less';
			return 'similar';
		};
		// how difficult the tasks done are (by their settings, as "santykinis sudėtingumas"): the student's time-weighted
		// average against each classmate's - said only when clearly different
		const grade = typeof opts.gradeOf === 'function' ? opts.gradeOf(list[0] && list[0].studentId) : null;
		const difficulty = l => {
			let sum = 0, wsum = 0;
			l.forEach(t => { const d = taskDifficulty(t.info, grade); const w = t.minutes > 0 ? t.minutes : t.answers; if (d && w > 0) { sum += Math.log(d) * w; wsum += w; } });
			return wsum ? Math.exp(sum / wsum) : null;
		};
		const myDifficulty = difficulty(list);
		const peerDifficulty = peerLists.map(difficulty).filter(Boolean);
		const ratios = myDifficulty ? peerDifficulty.map(d => myDifficulty / d) : [];
		out.difficulty = clear(ratios, r => r - 1, r => Math.abs(r - 1) >= 0.2);
		out.difficultyBy = ratios.length ? median(ratios) : 1;
		// (the popup: which kinds of tasks - named as in "Mokymosi sritys" - take what share of the practice time, the student's
		// and the typical classmate's (the classmates' shares averaged), from the easiest kind to the hardest)
		if (myDifficulty && peerDifficulty.length) {
			const names = new Map();
			const kindOf = t => {
				const k = JSON.stringify(t.info);
				if (!names.has(k)) {
					let label = '';
					try { const n = subject === 'math' ? practiceTree([t], () => 1, subject, null, opts.gradeOf) : []; label = n.length === 1 ? n[0].label : ''; } catch (e) { label = ''; }
					names.set(k, label || taskType(t, false).desc || '');
				}
				return names.get(k);
			};
			const sharesOf = l => {
				const timed = l.filter(t => t.minutes > 0), m = timed.reduce((a, t) => a + t.minutes, 0);
				const rate = m > 0 ? timed.reduce((a, t) => a + t.answers, 0) / m : 0;
				const by = new Map(); let total = 0;
				l.forEach(t => {
					const d = taskDifficulty(t.info, grade); if (!d) return;
					const w = t.minutes > 0 ? t.minutes : rate > 0 ? t.answers / rate : t.answers;
					const k = kindOf(t); if (!k) return;
					const e = by.get(k) || { w: 0, logD: 0 }; e.w += w; e.logD += Math.log(d) * w; by.set(k, e); total += w;
				});
				return { by, total };
			};
			const me = sharesOf(list), them = peerLists.map(sharesOf).filter(x => x.total > 0);
			const kinds = new Map();
			const add = (x, field, scale) => x.by.forEach((e, k) => {
				const r = kinds.get(k) || { label: k, mine: 0, cls: 0, w: 0, logD: 0 };
				r[field] += e.w / x.total * 100 * scale; r.w += e.w; r.logD += e.logD; kinds.set(k, r);
			});
			add(me, 'mine', 1);
			them.forEach(x => add(x, 'cls', 1 / them.length));
			const rowsAll = [...kinds.values()].map(r => ({ label: r.label, mine: r.mine, cls: r.cls, d: Math.exp(r.logD / r.w) }));
			// (kinds under 3% for both: together, last)
			const shown = rowsAll.filter(r => Math.max(r.mine, r.cls) >= 3).sort((a, b) => a.d - b.d);
			const rest = rowsAll.filter(r => Math.max(r.mine, r.cls) < 3);
			if (rest.length) shown.push({ label: 'Kitos užduotys', mine: rest.reduce((a, r) => a + r.mine, 0), cls: rest.reduce((a, r) => a + r.cls, 0), other: true });
			out.dist.difficulty = { mix: shown, classmates: them.length };
		}
		return out;
	}

	/* tasks: assigned tasks and/or archive rows. opts: {
	 *   subject: 'math' | 'grammar' | 'text', mode: 'period' | 'task', scope: 'period' | 'tasks' (specific tasks chosen),
	 *   period: { start, end } (the analysis dates), isClass, kindOf(task) → 'teacher' | 'self' | 'game' | 'legacy',
	 *   kinds: Set of the kinds included, selfOffered: own practice can be included,
	 *   history: the student's other results (for a single task: what is usual in similar tasks) } */
	/* An obvious outlier - most likely answered at random: a task whose mistakes are practically impossible for its kind
	 * of task. The reference: the upper quartile of the mistakes per answer of the same kind of tasks (similar settings,
	 * the classmates' counted too; with fewer than 8 such tasks, of the subject's), and generous room for the usual
	 * task-to-task variation (negative binomial, dispersion 0.5): an outlier when a count this high or higher would happen
	 * less than once in 10 000 tasks. Works alike for every subject (texts: mistakes per text). */
	const OUTLIER = { minPool: 8, dispersion: 0.5, p: 1e-4 };
	function nbUpperTail(y, mu, phi) {
		// P(Y >= y), Y ~ negative binomial with mean mu and variance mu + phi·mu²
		if (y <= 0) return 1;
		const k = 1 / phi, q = mu / (k + mu);
		let p = Math.pow(k / (k + mu), k), cdf = 0;
		for (let j = 0; j < y; j++) { cdf += p; p *= (j + k) / (j + 1) * q; }
		return Math.max(0, 1 - cdf);
	}
	function outlierRule(list, opts, subject) {
		const all = list.slice();
		(Array.isArray(opts.peers) ? opts.peers : []).forEach(p => (p.tasks || []).forEach(x => {
			const t = normalizeTask(x, opts.kindOf);
			if (t && t.subject === subject && t.answers > 0) all.push(t);
		}));
		const q3 = arr => { const v = arr.map(t => t.mistakes / t.answers).sort((a, b) => a - b); if (!v.length) return 0; const i = (v.length - 1) * 0.75, lo = Math.floor(i); return v[lo] + (v[Math.ceil(i)] - v[lo]) * (i - lo); };
		const subjectQ3 = q3(all), byKind = new Map();
		const reference = t => {
			if (!byKind.has(t.infoKey)) { const same = all.filter(o => isSimilar(t, o)); byKind.set(t.infoKey, same.length >= OUTLIER.minPool ? q3(same) : subjectQ3); }
			return Math.max(byKind.get(t.infoKey), 0.02);
		};
		return t => {
			if (!(t.answers > 0) || !(t.mistakes > 0)) return false;
			const mu = t.answers * reference(t);
			return t.mistakes > mu && nbUpperTail(t.mistakes, mu, OUTLIER.dispersion) < OUTLIER.p;
		};
	}
	/* A pattern's "% atvejų" against the class: the class's value - the median of the classmates with at least FEW chances
	 * of it (at least 3; otherwise all the classmates' together, when they have enough) - and the student's wrong answers task by task against what that rate would give on the same
	 * chances (quasi-Poisson ratio, the dispersion from the tasks, at least 1; t with n - 1); at least FEW chances on 3
	 * tasks on 2 days. All the patterns tested share one 5% budget (Holm); said only when significant and at least 5
	 * percentage points apart. → [{ key, area, direction: 'more' | 'less', mine, cls }] (in %) */
	async function patternStatsOf(tasks, subject, opts) {
		let list = dropTeacherCopies((tasks || []).map(t => normalizeTask(t, opts.kindOf))
			.filter(t => t && t.subject === subject && t.answers > 0 && t.date && !(opts.isOutlier && opts.isOutlier(t))));
		if (!list.length || !list.some(t => t.detail.length)) return null;
		list.forEach(t => { t.day = dayNumber(t.date); });
		list.sort((x, y) => x.date.localeCompare(y.date));
		let res = null;
		if (subject === 'math') res = analyzeMathMistakes(list);
		else {
			if (typeof opts.gradeOf === 'function') await replayGrammarTasks(list, opts.gradeOf);
			const entries = [];
			list.forEach((t, i) => t.detail.forEach(item => entries.push({ item, task: i })));
			res = entries.length ? await analyzeGrammarMistakes(entries) : null;
		}
		if (!res) return null;
		res.detailsFrom = Infinity;
		rankPatterns(res, list, subject);
		const out = new Map();
		(res.insights || []).forEach(i => { if (i.perTaskQ && i.perTaskQ.size) out.set(i.key, { wrong: i.wrong, e: i.questions, tasks: [...i.perTaskQ].map(([idx, q]) => [(i.perTaskWrong && i.perTaskWrong.get(idx)) || 0, q]) }); });
		return out;
	}
	/* One mistake category, a student against the class (comparePatterns). rows: the student's tasks [{ y: wrong, q: chances,
	 * date }]; have / enough: the classmates' { wrong, e: chances } (enough: at least FEW chances).
	 * The class's value: the median classmate's rate (at least 3 classmates with enough chances), else all the classmates'
	 * together. The student's mistakes against what that rate gives on the student's own chances: a rate ratio on the log
	 * scale (a half added to both: a category never got wrong can still be "rečiau"), its variance from the student's
	 * tasks (quasi-Poisson: at least the Poisson one) PLUS the class value's own uncertainty - the class value is an
	 * estimate from a handful of classmates who differ a lot, so it is bootstrapped (the classmates resampled 999 times,
	 * seeded: the same data give the same text); t with Welch-Satterthwaite degrees of freedom. (Simulated 2026-10-24: with
	 * no real difference, reported 1.7% - the class value taken as exact before: 5.4%, up to 20% in small, varied classes.)
	 * → { ref, O, Q, p } or null (too little) */
	const PATTERN_BOOT = 999;
	function patternClassTest(rows, have, enough, key) {
		const pooledE = have.reduce((a, v) => a + v.e, 0);
		const mode = enough.length >= 3 ? 'median' : have.length >= 3 && pooledE >= 3 * FEW ? 'pooled' : null;
		if (!mode) return null;
		const pool = mode === 'median' ? enough : have;
		const refOf = set => (mode === 'median' ? median(set.map(v => v.wrong / v.e)) : set.reduce((a, v) => a + v.wrong, 0) / set.reduce((a, v) => a + v.e, 0));
		const ref = refOf(pool);
		if (rows.length < 3 || new Set(rows.map(r => r.date)).size < 2) return null;
		const O = rows.reduce((a, r) => a + r.y, 0), Q = rows.reduce((a, r) => a + r.q, 0), E = Q * ref;
		if (!(E > 0) || !(Q > 0)) return null;
		const rr = (O + 0.5) / (E + 0.5);
		const phi = Math.max(1, rows.reduce((a, r) => { const mu = r.q * ref; return a + (mu > 0 ? (r.y - rr * mu) ** 2 / (rr * mu) : 0); }, 0) / (rows.length - 1));
		const varStudent = phi / (O + 0.5);
		// the class value's uncertainty: log(expected) over resampled classmates
		const rnd = seededRandom(hashString(key + '|' + pool.map(v => v.wrong + ':' + Math.round(v.e)).join(',') + '|' + Math.round(Q)));
		let s = 0, s2 = 0;
		for (let b = 0; b < PATTERN_BOOT; b++) {
			const sample = pool.map(() => pool[Math.floor(rnd() * pool.length)]);
			const l = Math.log(Q * refOf(sample) + 0.5);
			s += l; s2 += l * l;
		}
		const varClass = Math.max(0, (s2 - s * s / PATTERN_BOOT) / (PATTERN_BOOT - 1));
		// (degrees of freedom: Welch-Satterthwaite for the two variances - the student's tasks and the classmates)
		const df = Math.max(1, (varStudent + varClass) ** 2 / (varStudent ** 2 / Math.max(1, rows.length - 1) + varClass ** 2 / Math.max(1, pool.length - 1) || 1));
		return { ref, O, Q, p: tPValue(Math.log(rr) / Math.sqrt(varStudent + varClass), df) };
	}
	async function comparePatterns(f, list, subject, opts) {
		const res = f.grammar || f.math;
		const peerStats = [];
		for (const p of opts.peers) {
			await breathe();   // (one classmate at a time, the page free in between; stopped if not wanted any more)
			if (opts.alive && !opts.alive()) throw CANCELLED;
			const st = await patternStatsOf(p.tasks, subject, opts);
			if (st) peerStats.push(st);
		}
		if (peerStats.length < 3) { const none = []; none.why = `classmates with patterns: ${peerStats.length}`; return none; }
		const tests = [];
		// (not "kita", nor a broad "sudėtyje" / "atimtyje" when its split by crossing ten is there too - it only repeats them)
		const keys = new Set(res.insights.map(i => i.key));
		const repeats = i => /^m_op_[AS]$/.test(i.key) && (keys.has('m_cross_' + i.key.slice(-1)) || keys.has('m_plain_' + i.key.slice(-1)));
		for (const i of res.insights.filter(i => i.key !== 'kita' && !repeats(i) && i.perTaskQ && i.perTaskQ.size && !i.few && i.area)) {
			await breathe();   // (one category at a time)
			if (opts.alive && !opts.alive()) throw CANCELLED;
			// (the class's value: the median of the classmates with enough chances each - at least 3 of them; otherwise all the
			// classmates' together, when at least 3 have it and they have at least 3·FEW chances together)
			const have = peerStats.map(st => st.get(i.key)).filter(v => v && v.e > 0);
			const enough = have.filter(v => v.e >= FEW);
			const rows = [...i.perTaskQ].map(([idx, q]) => ({ y: (i.perTaskWrong && i.perTaskWrong.get(idx)) || 0, q, date: list[idx].date }));
			const t = patternClassTest(rows, have, enough, i.key);
			if (!t) continue;
			const { ref, O, Q, p: pv } = t;
			// (the class's spread: the same classmates the class value comes from, each counting equally - their tasks shared out
			// by chances within that - so one classmate with very many chances doesn't stand for the whole class)
			const usedPeers = enough.length >= 3 ? enough : have;
			const clsDist = usedPeers.flatMap(v => {
				const own = (v.tasks || []).filter(([, q]) => q > 0), total = own.reduce((a, [, q]) => a + q, 0);
				return total > 0 ? own.map(([y, q]) => ({ v: y / q * 100, w: q / total })) : [];
			});
			tests.push({ key: i.key, area: i.area, p: pv, mine: O / Q * 100, cls: ref * 100,
				dist: { mine: rows.filter(r => r.q > 0).map(r => ({ v: r.y / r.q * 100, w: r.q })), cls: clsDist, mineMean: O / Q * 100, clsMean: ref * 100 } });
		}
		// Holm over the patterns tested
		const order = tests.slice().sort((a, b) => a.p - b.p), found = [];
		found.tested = tests;   // (for checking)
		for (let k = 0; k < order.length; k++) {
			if (order[k].p > 0.05 / (order.length - k)) break;
			const t = order[k];
			if (Math.abs(t.mine - t.cls) >= 5) found.push({ ...t, direction: t.mine > t.cls ? 'more' : 'less' });
		}
		return found;
	}
	async function analyze(tasks, opts = {}) {
		const subject = opts.subject;
		let list = (tasks || []).map(t => normalizeTask(t, opts.kindOf)).filter(t => t && t.subject === subject && t.answers > 0 && t.date);
		list = dropTeacherCopies(list).sort((x, y) => x.date.localeCompare(y.date));
		const f = { subject, mode: opts.mode || 'period', scope: opts.scope || 'period', isClass: Boolean(opts.isClass), n: list.length };
		if (!list.length) return f;
		list.forEach(t => { t.day = dayNumber(t.date); });
		// spelling: the questions asked, replayed from the seed where it checks out (before the totals: a task narrowed by the
		// filters gets its exact answers)
		if (subject === 'grammar') await replayGrammarTasks(list, opts.gradeOf);
		// maths: every task's (and the classmates' tasks') question mix worked out first, one setting at a time with the page
		// free in between - the parts below then find them ready instead of generating them all in one long block
		if (subject === 'math') await warmMathCompositions([...list, ...(Array.isArray(opts.peers) ? opts.peers.flatMap(p => (p.tasks || []).map(t => normalizeTask(t, opts.kindOf)).filter(Boolean)) : [])], opts.alive);

		const sum = (arr, k) => arr.reduce((s, t) => s + t[k], 0);
		f.answers = sum(list, 'answers');
		f.mistakes = sum(list, 'mistakes');
		const timed = list.filter(t => t.minutes > 0);
		f.rate = timed.length ? sum(timed, 'answers') / sum(timed, 'minutes') : 0;
		// the time of a task without a speed is estimated from the usual speed
		const minutesOf = t => t.minutes > 0 ? t.minutes : (f.rate > 0 ? t.answers / f.rate : 0);
		f.minutes = list.reduce((s, t) => s + minutesOf(t), 0);
		f.dates = [...new Set(list.map(t => t.date))];
		f.firstDate = list[0].date;
		f.lastDate = list[list.length - 1].date;
		const period = opts.period || {};
		f.from = f.scope === 'tasks' || !period.start ? f.firstDate : period.start;
		f.to = f.scope === 'tasks' || !period.end ? f.lastDate : period.end;
		f.date = list[0].date;
		f.kind = list[0].kind;
		/* Obvious outliers - most likely answered at random: more mistakes than answers AND far above the subject's other
		 * tasks (above Q3 + 3·IQR of the mistakes per 100 answers, the classmates' tasks counted too - Tukey's "far out").
		 * Their time and answers still count as practice; every analysis of mistakes and speed leaves them out (said). */
		// (done on time - of all the period's tasks with a due date, the outliers too: they were done)
		if (f.mode === 'period' && !f.isClass) f.onTime = onTimeStats(list, opts, subject, opts.kindOf);
		if (f.mode === 'period' && f.isClass) { const dated = list.filter(t => t.onTime !== null); f.classOnTime = { n: dated.length, late: dated.filter(t => t.onTime === false).length }; }
		const isOutlier = outlierRule(list, opts, subject);
		opts = { ...opts, isOutlier };
		f.outliers = f.mode === 'task' ? [] : list.filter(isOutlier);
		const clean = list.filter(t => !f.outliers.includes(t));
		f.mistakes = sum(clean, 'mistakes');

		// value per task: % of mistakes (text: mistakes per text)
		const perText = subject === 'text';
		// mistakes per 100 answers (text: per text); one answer can take several tries, so this is not a share of wrong answers
		const value = t => perText ? t.mistakes / t.answers : t.mistakes / t.answers * 100;
		f.perText = perText;
		f.mistakeValue = perText ? f.mistakes / sum(clean, 'answers') : f.mistakes / sum(clean, 'answers') * 100;

		const kinds = {};
		list.forEach(t => {
			const k = kinds[t.kind] || (kinds[t.kind] = { n: 0, answers: 0, mistakes: 0, minutes: 0 });
			k.n++; k.answers += t.answers; k.mistakes += t.mistakes; k.minutes += minutesOf(t) || t.answers;
		});
		const kindTotal = Object.values(kinds).reduce((s, k) => s + k.minutes, 0) || 1;
		Object.values(kinds).forEach(k => { k.share = k.minutes / kindTotal * 100; });
		f.kinds = kinds;
		f.kindsIncluded = opts.kinds ? [...opts.kinds] : null;
		f.selfOffered = opts.selfOffered !== false && !f.isClass;

		// what was practised, with its share of the time. Grammar: one line per category (a task's time split between its
		// categories), and the tasks with all of a class's categories as one line of their own; other subjects: per task kind.
		const typeTime = new Map();
		const addTime = (key, entry, time) => {
			const e = typeTime.get(key) || { ...entry, time: 0, n: 0 };
			e.time += time;
			e.n++;
			typeTime.set(key, e);
		};
		list.forEach(t => {
			const time = minutesOf(t) || t.answers;
			const type = taskType(t, false);
			if (subject === 'math') {
				const parts = mathParts(t.info);
				// (a mixed task's time by its operations' share of its questions; evenly without the generator)
				const comp = parts.length > 1 ? mathComposition(t.info) : null;
				const letters = (MATH_OPS[t.info[1]] || []).map(o => OP_LETTERS[o]);
				const shareOf = k => comp ? (comp.ops[letters[k]] || 0) : 1 / (parts.length || 1);
				parts.forEach((part, k) => addTime(part.key, { ...part, single: parts.length === 1 ? part.single : `Užduotis: ${joinList(parts.map(x => x.desc))}.` }, time * shareOf(k)));
				return;
			}
			if (subject !== 'grammar') { addTime(type.key, type, time); return; }
			// (by the questions asked per category where replayed; otherwise evenly between the task's categories)
			if (t.asked) {
				const perCat = new Map();
				t.asked.forEach(q => perCat.set(q.cat, (perCat.get(q.cat) || 0) + 1));
				perCat.forEach((n, k) => addTime(k, { desc: GRAMMAR_TOPICS[k] || dictText(k), single: type.single }, time * n / t.asked.length));
				return;
			}
			const keys = Object.keys((t.info[4] && typeof t.info[4] === 'object') ? t.info[4] : {});
			keys.forEach(k => addTime(k, { desc: GRAMMAR_TOPICS[k] || dictText(k), single: type.single }, time / (keys.length || 1)));
		});
		const typeTotal = [...typeTime.values()].reduce((a, e) => a + e.time, 0) || 1;
		f.types = [...typeTime.values()].map(e => ({ ...e, share: e.time / typeTotal * 100 })).sort((x, y) => y.share - x.share);
		// (tasks with texts the teacher picked: their levels from the texts' database)
		const textLibrary = subject === 'text' && list.some(t => !t.info[6] && t.info[4] === 'C84') ? await loadTextLibrary() : null;
		f.focus = practiceFocus(list, minutesOf, subject, opts.gradeOf, f.isClass, textLibrary);
		f.practiceTree = practiceTree(list, minutesOf, subject, textLibrary, opts.gradeOf);
		// (from here on - mistakes, speed, comparisons, changes - without the obvious outliers)
		if (f.outliers.length) {
			list = clean;
			const timedClean = list.filter(t => t.minutes > 0);
			f.rate = timedClean.length ? sum(timedClean, 'answers') / sum(timedClean, 'minutes') : 0;
		}

		// change over time, comparing only similar tasks
		// (groups of similar tasks; in the class overview each student's own: who practised when does not pass for a change)
		const groups = f.isClass ? similarGroups(list).flatMap(group => {
			const byStudent = new Map();
			group.forEach(t => { const k = String(t.studentId); if (!byStudent.has(k)) byStudent.set(k, []); byStudent.get(k).push(t); });
			return [...byStudent.values()];
		}) : similarGroups(list);
		const speedOf = t => perText ? t.minutes / t.answers : t.rate;
		f.minutesPerText = perText && timed.length ? sum(timed, 'minutes') / sum(timed, 'answers') : 0;
		if (f.isClass) {
			f.classStats = classStats(list, minutesOf, value, opts.classSize, f);
			// (the typical student's practice days - the median of each student's own)
			const daysBy = new Map();
			list.forEach(t => { const k = String(t.studentId); if (!daysBy.has(k)) daysBy.set(k, new Set()); daysBy.get(k).add(t.date); });
			f.classStats.daysMedian = median([...daysBy.values()].map(d => d.size));
		}
		if (f.mode === 'period' && f.scope !== 'tasks' && Array.isArray(opts.peers) && opts.peers.length >= 4) {
			f.peers = comparePeers(list, opts.peers, subject, opts, value, speedOf);
		}

		// one task compared with the student's similar tasks
		if (f.mode === 'task' && Array.isArray(opts.history)) {
			const me = list[0];
			const similar = dropTeacherCopies(opts.history.map(t => normalizeTask(t, opts.kindOf)).filter(t => t && t.subject === subject && t.answers > 0))
				.filter(t => !(t.date === me.date && t.infoKey === me.infoKey && t.answers === me.answers && t.mistakes === me.mistakes))
				.filter(t => isSimilar(me, t));
			if (similar.length >= 2) {
				f.usual = {
					n: similar.length,
					mistakeValue: median(similar.map(value)),
					rate: median(similar.filter(t => t.rate > 0).map(speedOf))
				};
			}
		}

		// (the day mistake details were first recorded, among all the tasks at hand - see detailsKnown)
		const withDetails = [...list, ...(Array.isArray(opts.peers) ? opts.peers.flatMap(p => (p.tasks || []).map(t => normalizeTask(t, opts.kindOf)).filter(t => t && t.subject === subject && t.date)) : [])]
			.filter(t => t.mistakes > 0 && t.detail.length).map(t => dayNumber(t.date));
		const detailsFrom = withDetails.length ? Math.min(...withDetails) : Infinity;
		if (subject === 'math') { f.math = analyzeMathMistakes(list); if (f.math) f.math.detailsFrom = detailsFrom; rankPatterns(f.math, list, 'math'); }
		if (subject === 'grammar') {
			f.withMistakes = list.filter(t => t.mistakes > 0).length;
			f.noDetail = list.filter(t => t.mistakes > 0 && !t.detail.length).length;
			f.noDetailNotSent = list.filter(t => t.mistakes > 0 && !t.detail.length && t.detailNotSent).length;
			const entries = [];
			list.forEach((t, i) => t.detail.forEach(item => entries.push({ item, task: i })));
			f.grammar = entries.length ? await analyzeGrammarMistakes(entries, list.filter(t => !t.mistakes || t.detail.length).length) : null;
			if (f.grammar) f.grammar.detailsFrom = detailsFrom;
			rankPatterns(f.grammar, list, 'grammar');
		}
		// the student's mistake patterns against the class's (one student's period, with classmates)
		if (f.mode === 'period' && !f.isClass && f.scope !== 'tasks' && Array.isArray(opts.peers) && opts.peers.length >= 4 && (f.grammar || f.math)) {
			f.patternPeers = await comparePatterns(f, list, subject, opts);
		}
		/* Tendencijos: the change from the start to the end of the period (windowChanges) - overall mistakes and speed,
		 * every task set (mistakes, speed) and every mistake pattern; strata: a kind of similar tasks (in the class overview
		 * a student's own). Only the significant ones are kept. */
		if (f.mode === 'period') {
			const kindOf = new Map();
			groups.forEach((g, k) => g.forEach(t => kindOf.set(t, k)));
			/* (new, harder tasks bring more mistakes - not a worse student: a kind of similar tasks is split further by the task's
			 * difficulty - its coins for a correct answer, the page's point weights (mental-arithmetic.js) - so a harder task is
			 * only ever compared with equally hard ones, and a difficulty met only late in the period is not compared at all.
			 * Maths and texts; spelling - its kinds already follow the categories, finer strata would leave too little to compare) */
			const levelOf = t => {
				if (subject === 'grammar' || typeof pointsPerCorrectForCodes !== 'function' || typeof pointCodesOfTaskInfo !== 'function') return '';
				try { return String(Math.round(pointsPerCorrectForCodes(pointCodesOfTaskInfo(t.info), 2) * 1000) / 1000); } catch (_) { return ''; }
			};
			const stratum = t => `${kindOf.get(t)}|${levelOf(t)}`;
			const pts = (ts, y, e) => ts.filter(t => e(t) > 0).map(t => ({ x: t.day, y: y(t), e: e(t), s: stratum(t) }));
			const timedOf = ts => ts.filter(t => t.minutes > 0);
			const conds = [
				{ key: 'mistakes', metric: 'mistakes', group: 'overall', target: WIN.mistakes, points: pts(list, t => t.mistakes, t => t.answers) },
				{ key: 'speed', metric: 'speed', group: 'overall', target: WIN.speed, points: pts(timedOf(list), t => t.answers, t => t.minutes) }
			];
			// (task sets: when there are several)
			const sets = new Map();
			list.forEach(t => { const type = taskType(t); if (!type.desc) return; if (!sets.has(type.key)) sets.set(type.key, { label: cap(type.desc), phrase: taskSetPhrase(t), tasks: [] }); sets.get(type.key).tasks.push(t); });
			// (one task set only - e.g. narrowed by the filters: the overall change is that set's, said with its name)
			f.onlySet = sets.size === 1 ? [...sets.values()][0] : null;
			if (sets.size > 1) sets.forEach((set, k) => {
				conds.push({ key: `set:${k}:mistakes`, metric: 'mistakes', group: 'set', label: set.label, phrase: set.phrase, target: WIN.mistakes, points: pts(set.tasks, t => t.mistakes, t => t.answers) });
				conds.push({ key: `set:${k}:speed`, metric: 'speed', group: 'set', label: set.label, phrase: set.phrase, target: WIN.speed, points: pts(timedOf(set.tasks), t => t.answers, t => t.minutes) });
			});
			// (mistake patterns: a pattern's mistakes against its chances, in the tasks whose mistakes by kind are known)
			const patterns = f.grammar || f.math;
			if (patterns && patterns.insights) patterns.insights.filter(i => i.key !== 'kita' && i.perTaskQ && i.perTaskQ.size).forEach(i => {
				const points = [...i.perTaskQ].map(([idx, q]) => ({ x: list[idx].day, y: (i.perTask && i.perTask.get(idx)) || 0, e: q, s: stratum(list[idx]) }));
				const area = (INSIGHTS[i.key] && INSIGHTS[i.key].area) || i.area;
				if (area) conds.push({ key: `pattern:${i.key}`, metric: 'pattern', group: 'pattern', label: area, target: WIN.pattern, points });
			});
			// (a task set or pattern whose comparison is the overall one - the same tasks in its groups - adds nothing)
			const exposureOf = c => c.test.blocks.reduce((t, b) => t + b.e, 0);
			// (the heaviest part - done a little at a time, the page answering clicks meanwhile; stopped if not wanted any more)
			await breathe();
			if (opts.alive && !opts.alive()) throw CANCELLED;
			const found0 = await windowChangesAsync(conds, opts.alive);
			f.changesTested = windowChanges.tested;
			f.changesAll = windowChanges.all;
			/* (a mistake pattern's change must not rest on a word or two - which words came up, not how the students do: in the
			 * group where the pattern is more frequent its wrong answers must spread over at least 3 words, Kish's effective
			 * number) */
			// (a change of mistakes must not rest on one day either - one day's task, e.g. a hard task the whole class got that
			// day: in the group where they are more frequent the mistakes must spread over at least 2 days, Kish's number)
			const spreadOverDays = c => {
				if (c.metric === 'speed') return true;
				const w = c.direction === 'up' ? c.test.windows[1] : c.test.windows[0];
				const byDay = new Map();
				c.test.all.forEach(b => { if (b.used && b.x >= w[0] && b.x <= w[1]) byDay.set(b.x, (byDay.get(b.x) || 0) + b.y); });
				const ys = [...byDay.values()], Y = ys.reduce((a, v) => a + v, 0), Y2 = ys.reduce((a, v) => a + v * v, 0);
				return Y2 > 0 && Y * Y / Y2 >= 2;
			};
			const found = found0.filter(spreadOverDays).filter(c => {
				if (c.group !== 'pattern' || !patterns) return true;
				const i = patterns.insights.find(x => 'pattern:' + x.key === c.key);
				if (!i || !i.parts) return true;
				const w = c.direction === 'up' ? c.test.windows[1] : c.test.windows[0];
				const byWord = new Map();
				i.parts.forEach((part, item) => {
					const t = list[part.task];
					if (!t || t.day < w[0] || t.day > w[1]) return;
					const word = Array.isArray(item) && Array.isArray(item[0]) ? item[0].join('') : JSON.stringify(item);
					byWord.set(word, (byWord.get(word) || 0) + Math.min(1, part.weight));
				});
				const ws = [...byWord.values()], W = ws.reduce((a, v) => a + v, 0), W2 = ws.reduce((a, v) => a + v * v, 0);
				return W2 > 0 && W * W / W2 >= 3;
			});
			f.changes = found.filter(c => {
				if (c.group !== 'set') return true;
				const all = found.find(o => o.group === 'overall' && o.metric === c.metric);
				return !(all && all.direction === c.direction && exposureOf(c) >= 0.9 * exposureOf(all));
			});
		}
		return f;
	}

	// ---------------------------------------------------------------- text
	// A summary a teacher can copy into their records: when and how much was practised, how regularly, which tasks (share
	// of the time), who set the work, whether mistakes change (in similar tasks and per kind of mistake) and the common
	// mistakes. Numbers (counts, rates, changes) and examples only with "Rodyti skaičius ir pavyzdžius" (opts.details);
	// a few mistakes are said to be few, not presented as patterns.
	const DATIVE = { math: 'matematikai', grammar: 'rašybai', text: 'teksto supratimui' };
	const TASKS_OF = { math: 'Matematikos užduotims', grammar: 'Rašybos užduotims', text: 'Teksto supratimo užduotims' };
	const PER_100 = { math: 'per 100 veiksmų', grammar: 'per 100 atsakymų', text: '' };
	const KIND_NAMES = { teacher: 'mokytojo skirta', self: 'pasirinkta savarankiškai', game: 'klasės žaidimas', legacy: 'senesnis įrašas – nepažymėta, ar ją skyrė mokytojas' };

	function valueText(f, v) {
		// after "apie": "apie 12 klaidų 100 atsakymų", "apie 1 klaidą vienam tekstui"
		const n = round(v, f.perText ? 1 : 0);
		return `${count(n, ['klaidą', 'klaidas', 'klaidų', 'klaidos'])} ${f.perText ? 'vienam tekstui' : PER_100[f.subject]}`;
	}
	function rangeText(f, from, to) {
		const a = round(from, f.perText ? 1 : 0), b = round(to, f.perText ? 1 : 0);
		// (after "iki", the genitive: "iki 51 klaidos", "iki 25 klaidų", "iki 2,5 klaidų")
		const gen = Math.round(b) === b && b % 10 === 1 && b % 100 !== 11 ? 'klaidos' : 'klaidų';
		return `nuo apie ${num(a)} iki ${num(b)} ${gen} ${f.perText ? 'vienam tekstui' : PER_100[f.subject]}`;
	}
	function speedRange(f, from, to) {
		return f.perText
			? `nuo ${shortTime(from)} iki ${shortTime(to).replace(/^apie /, '')} vienam tekstui`
			: `nuo apie ${num(from)} iki ${num(to)} ${(() => { const r = round(to, 1); return Math.round(r) === r && r % 10 === 1 && r % 100 !== 11 ? SUBJECTS[f.subject].unit[3] : SUBJECTS[f.subject].unit[2]; })()} per minutę`;   // (after "iki" the genitive)
	}
	function exampleText(e) {
		return `${q(e.b + e.w + e.s)} vietoje ${q(e.b + e.a + e.s)}`;
	}
	// how regularly: from the days with work over the period
	const MONTHS = ['sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio', 'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'];
	function dayText(d) {
		const date = new Date(d * 86400000);
		return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()} d.`;
	}
	function periodText(from, to) {
		const [a, b] = [from, to].map(d => new Date(dayNumber(d) * 86400000));
		const y = d => `${d.getUTCFullYear()} m. `, md = d => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
		if (from === to) return `${y(a)}${md(a)} d.`;
		if (a.getUTCFullYear() !== b.getUTCFullYear()) return `${y(a)}${md(a)} d. – ${y(b)}${md(b)} d.`;
		if (a.getUTCMonth() === b.getUTCMonth()) return `${y(a)}${md(a)}–${b.getUTCDate()} d.`;
		return `${y(a)}${md(a)} d. – ${md(b)} d.`;
	}
	const FREQ = ['nesimokyta', 'maždaug kartą per savaitę', 'du–tris kartus per savaitę', 'keturis–penkis kartus per savaitę', 'beveik kasdien', 'kasdien'];
	// "4 dienas per savaitę", "kasdien", "2 dienas per mėnesį", "rečiau nei kartą per mėnesį"; '' when none at all
	function weekDays(avg) {
		const DAYS = ['dieną', 'dienas', 'dienų', 'dienos'];
		const w = Math.round(avg);
		if (w >= 7) return avg >= 6.95 ? 'kasdien' : 'beveik kasdien';
		if (w >= 1) return `${count(w, DAYS)} per savaitę`;
		const m = Math.round(avg * 30 / 7);
		return m >= 1 ? `${count(m, DAYS)} per mėnesį` : avg > 0 ? 'rečiau nei kartą per mėnesį' : '';
	}
	function freqLevel(n) { return n < 0.5 ? 0 : n < 1.5 ? 1 : n < 3.5 ? 2 : n < 5.5 ? 3 : n < 6.5 ? 4 : 5; }
	// weeks with the same frequency joined into phases (a single odd week joins its closest neighbour); null when more than 3
	function weeklyPhases(perWeek, start, end) {
		const runs = [];
		perWeek.forEach((n, i) => {
			const l = freqLevel(n);
			if (runs.length && runs[runs.length - 1].level === l) runs[runs.length - 1].to = i;
			else runs.push({ level: l, from: i, to: i });
		});
		let merged = true;
		while (runs.length > 1 && merged) {
			merged = false;
			for (let i = 0; i < runs.length; i++) {
				const r = runs[i];
				if (r.to > r.from) continue;
				const prev = runs[i - 1], next = runs[i + 1];
				const into = !prev ? next : !next ? prev : Math.abs(prev.level - r.level) <= Math.abs(next.level - r.level) ? prev : next;
				into.from = Math.min(into.from, r.from); into.to = Math.max(into.to, r.to);
				const weeks = perWeek.slice(into.from, into.to + 1);
				into.level = freqLevel(weeks.reduce((a, b) => a + b, 0) / weeks.length);
				runs.splice(i, 1);
				for (let j = 1; j < runs.length; j++) if (runs[j].level === runs[j - 1].level) { runs[j - 1].to = runs[j].to; runs.splice(j, 1); j--; }
				merged = true;
				break;
			}
		}
		if (runs.length > 3) return null;
		// (each phase with its own average days per week - its number, said with all the details)
		return runs.map(r => { const w = perWeek.slice(r.from, r.to + 1); return { level: r.level, avg: w.reduce((a, b) => a + b, 0) / w.length, first: start + r.from * 7, last: Math.min(end, start + r.to * 7 + 6) }; });
	}
	function weekCounts(dayLists, from, to) {
		const all = dayLists.flat();
		const start = Math.min(dayNumber(from), ...all);
		const end = Math.max(dayNumber(to), ...all);
		const weeks = Math.max(1, Math.ceil((end - start + 1) / 7));
		// a short last week: under 3 days it joins the week before, otherwise its count is scaled to a full week
		const lastLen = (end - start + 1) - (weeks - 1) * 7;
		const keep = weeks > 1 && lastLen < 3 ? weeks - 1 : weeks;
		const counts = dayLists.map(days => {
			const perWeek = new Array(keep).fill(0);
			days.forEach(d => { perWeek[Math.min(keep - 1, Math.floor((d - start) / 7))]++; });
			if (keep === weeks && lastLen < 7) perWeek[keep - 1] = perWeek[keep - 1] * 7 / lastLen;
			return perWeek;
		});
		return { start, end, weeks: keep, counts };
	}
	// "iki rugsėjo 27 d. nesimokyta, o nuo rugsėjo 28 d. – kasdien" (subject: "" for a student, or the class's words)
	function phasesText(phases, one, many) {
		if (phases.length === 1) return one(phases[0]);
		return phases.map((ph, i) => i === 0 ? `iki ${dayText(ph.last)} ${one(ph)}`
			: i === phases.length - 1 ? `o vėliau – ${many(ph, phases[i - 1])}`
			: `nuo ${dayText(ph.first)} iki ${dayText(ph.last)} – ${many(ph, phases[i - 1])}`).join(', ');
	}
	/* A long or patchy period summed up by its most active stretches (at most three): the weeks around which practice was
	 * clearly above the rest (a 3-week running average at least 60% of its highest or two-three times a week, and at least once a week; a quiet week
	 * inside one does not split it), each said with its frequency, then the rest of the time in a few words. null when
	 * there is no such stretch (practice about even, or the "peaks" cover most of the period). */
	function activityPeaks(perWeek, start, end) {
		const n = perWeek.length;
		if (n < 6) return null;
		const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
		const run3 = perWeek.map((_, i) => avg(perWeek.slice(Math.max(0, i - 1), i + 2)));
		const thr = Math.max(1, Math.min(0.6 * Math.max(...run3), 1.5));
		const runs = [];
		run3.forEach((v, i) => {
			if (v < thr) return;
			const r = runs[runs.length - 1];
			if (r && i - r.to <= 2) r.to = i; else runs.push({ from: i, to: i });
		});
		// (the running average reaches a week either side: a stretch starts and ends with weeks that are active themselves)
		// (and a weaker stretch's first and last weeks, which the average lowers, belong to it)
		runs.forEach(r => {
			while (r.from < r.to && perWeek[r.from] < thr) r.from++; while (r.to > r.from && perWeek[r.to] < thr) r.to--;
			while (r.from > 0 && perWeek[r.from - 1] >= thr) r.from--; while (r.to < n - 1 && perWeek[r.to + 1] >= thr) r.to++;
		});
		for (let i = 1; i < runs.length; i++) if (runs[i].from <= runs[i - 1].to + 1) { runs[i - 1].to = runs[i].to; runs.splice(i--, 1); }
		if (!runs.length || runs.length > 3) return null;
		const inside = new Set(runs.flatMap(r => Array.from({ length: r.to - r.from + 1 }, (_, k) => r.from + k)));
		const rest = perWeek.filter((_, i) => !inside.has(i));
		if (rest.length < Math.max(2, n / 4)) return null;
		const restAvg = avg(rest);
		const peaks = runs.map(r => { const w = perWeek.slice(r.from, r.to + 1), a = avg(w); return { level: freqLevel(a), avg: a, first: start + r.from * 7, last: Math.min(end, start + r.to * 7 + 6) }; });
		if (peaks.some(p => p.level <= freqLevel(restAvg))) return null;
		return { peaks, rest: { level: freqLevel(restAvg), avg: restAvg, any: rest.some(v => v > 0) } };
	}
	// "aktyviausiai mokytasi nuo rugsėjo 1 d. iki spalio 12 d. ir nuo sausio 5 d. iki vasario 2 d. – keturis–penkis kartus per
	// savaitę; kitu laiku – retai" (lead: who practised; with all the details each frequency's days per week in brackets)
	function peaksText(pk, lead, details, fromYear) {
		// (the year only where it is not the period's first year any more: "… iki lapkričio 2 d. ir nuo 2027 m. vasario 23 d. iki kovo 29 d.")
		let year = fromYear;
		const D = d => { const y = new Date(d * 86400000).getUTCFullYear(); const said = y !== year ? `${y} m. ` : ''; year = y; return said + dayText(d); };
		const range = p => `nuo ${D(p.first)} iki ${D(p.last)}`;
		const join = xs => xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(', ')} ir ${xs[xs.length - 1]}`;
		const P = pk.peaks;
		const same = P.every(p => weekDays(p.avg) === weekDays(P[0].avg));
		const peaksSaid = same
			? `${join(P.map(range))} – vidutiniškai ${weekDays(avg2(P))}`
			: P.map((p, i) => `${range(p)} – ${i === 0 ? 'vidutiniškai ' : ''}${weekDays(p.avg)}`).join(', ');
		const restSaid = weekDays(pk.rest.avg) || 'nesimokyta';
		return `${lead} ${peaksSaid}; kitu laiku – ${restSaid}`;
		function avg2(ps) { const w = ps.map(p => (p.last - p.first + 1)); return ps.reduce((a, p, i) => a + p.avg * w[i], 0) / w.reduce((a, b) => a + b, 0); }
	}
	// (long periods - over 8 weeks - with three or more phases, and patchy practice: the most active stretches instead)
	const longPeriod = (weeks, phases) => !phases || (weeks > 8 && phases.length >= 3);
	// (details: each phase's own days per week in brackets - "… keturis–penkis kartus per savaitę (4,5 dienos per savaitę), o …")
	function regularity(f, details) {
		if (f.from === f.to) return '';   // (a period of one day: nothing to say about how often)
		const days = f.dates.map(dayNumber).sort((a, b) => a - b);
		if (days.length <= 1) return f.n > 1 ? 'visos užduotys atliktos tą pačią dieną' : '';
		const { start, end, counts } = weekCounts([days], f.from, f.to);
		const phases = weeklyPhases(counts[0], start, end);
		const one = ph => weekDays(ph.avg) ? `mokytasi vidutiniškai ${weekDays(ph.avg)}` : 'nesimokyta';
		const pk = longPeriod(counts[0].length, phases) ? activityPeaks(counts[0], start, end) : null;
		if (pk) return peaksText(pk, 'aktyviausiai mokytasi', details, +f.from.slice(0, 4));
		if (phases) return phasesText(phases, one, (ph, prev) => !weekDays(ph.avg) ? 'nesimokyta' : weekDays(prev.avg) ? weekDays(ph.avg) : `mokytasi vidutiniškai ${weekDays(ph.avg)}`);
		return `mokytasi nereguliariai – vidutiniškai ${weekDays(counts[0].reduce((a, b) => a + b, 0) / counts[0].length)}`;
	}
	function kindSentence(f) {
		const k = f.kinds, n = f.n;
		const t = k.teacher ? k.teacher.n : 0, s = k.self ? k.self.n : 0, g = k.game ? k.game.n : 0, old = k.legacy ? k.legacy.n : 0;
		const included = f.kindsIncluded ? new Set(f.kindsIncluded) : null;
		if (old === n) {
			return n === 1
				? 'Tai senesnis įrašas, kuriame nepažymėta, ar užduotį skyrė mokytojas, ar ji atlikta savarankiškai.'
				: 'Tai senesni įrašai, kuriuose nepažymėta, ar užduotis skyrė mokytojas, ar jos atliktos savarankiškai.';
		}
		if (t && !s && !g && !old) {
			if (!f.selfOffered) return '';
			// (own practice left out by the filter: said in the card's "?" note, not in the text)
			if (included && (!included.has('self') || !included.has('legacy'))) return n === 1 ? 'Tai mokytojo skirta užduotis.' : 'Visos analizuojamos užduotys skirtos mokytojo.';
			return n === 1 ? 'Tai mokytojo skirta užduotis; savarankiškai nesimokyta.' : 'Visą praktiką sudarė mokytojo skirtos užduotys; savarankiškai nesimokyta.';
		}
		if (s && !t && !g && !old) return n === 1 ? 'Užduotis pasirinkta savarankiškai.' : 'Visą praktiką sudarė savarankiškai pasirinktos užduotys.';
		if (g && !t && !s && !old) return n === 1 ? 'Užduotis atlikta klasės žaidime.' : 'Visą praktiką sudarė klasės žaidimai.';
		// "Užduočių pobūdis (% viso praktikos laiko): mokytojo skirtos – 60%, savarankiškai pasirinktos – 30% ir …"
		// (largest first; a part under 0.5 % is "<1%")
		const parts = [
			[k.teacher, 'mokytojo skirtos'],
			[k.self, 'savarankiškai pasirinktos'],
			[k.game, 'klasės žaidimai'],
			[k.legacy, 'senesni įrašai, kuriuose nepažymėta, kas skyrė užduotį,']
		].filter(([x]) => x && x.share > 0).sort((a, b) => b[0].share - a[0].share);
		if (!parts.length) return '';
		// "97% praktikos laiko sudarė senesni įrašai, …, o 3% – mokytojo skirtos užduotys."
		const full = { 'mokytojo skirtos': 'mokytojo skirtos užduotys', 'savarankiškai pasirinktos': 'savarankiškai pasirinktos užduotys' };
		const name = n => (full[n] || n).replace(/,$/, '');
		const [first, ...rest] = parts;
		const tail = rest.map(([x, n], i) => `${i === rest.length - 1 ? ' o' : ''} ${pct(x.share)} – ${name(n)}`);
		return `${pct(first[0].share)} praktikos laiko sudarė ${name(first[1])}${tail.length ? ',' + tail.join(',') : ''}.`;
	}
	function mistakeRateSentence(f) {
		const v = round(f.mistakeValue, f.perText ? 1 : 0);
		if (f.mode === 'task') {
			return f.perText
				? `Šioje užduotyje vienam tekstui vidutiniškai ${form(v, ['teko', 'teko', 'teko', 'teko'])} ${count(v, W.mistake)}.`
				: `Šioje užduotyje ${form(v, ['padaryta', 'padarytos', 'padaryta', 'padaryta'])} ${count(v, W.mistake)} ${PER_100[f.subject]}.`;
		}
		return f.perText
			? `Sudėliojant vieną tekstą vidutiniškai ${form(v, ['padaroma', 'padaromos', 'padaroma', 'padaroma'])} ${count(v, W.mistake)}.`
			: `Vidutiniškai ${form(v, ['padaroma', 'padaromos', 'padaroma', 'padaroma'])} ${count(v, W.mistake)} ${PER_100[f.subject]}.`;
	}
	function classRateSentence(f) {
		const v = round(f.classStats.rate, f.perText ? 1 : 0);
		return f.perText
			? `Vienas mokinys, dėliodamas tekstą, vidutiniškai daro ${count(v, ['klaidą', 'klaidas', 'klaidų', 'klaidos'])}.`
			: `Vienas mokinys vidutiniškai daro ${count(v, ['klaidą', 'klaidas', 'klaidų', 'klaidos'])} ${PER_100[f.subject]}.`;
	}
	/* Tendencijos: the changes from the start to the end of the period that passed (windowChanges) - only increases and
	 * decreases. The words of each change open its graph; the numbers (Didelis) are the graph's lines. */
	function trendSentences(f, details) {
		const sentences = [], links = [];
		const changes = f.changes || [];
		// how much: "42%", from twice as much up "2,5 karto"
		const amount = (from, to) => {
			if (!(from > 0) || !(to >= 0)) return '';
			const r = to / from;
			if (r >= 2) { const k = round(r, r >= 10 ? 0 : 1); return ` ${timesText(k)}`; }
			const d = Math.abs(r - 1) * 100;
			return ` ${d >= 99.5 && r < 1 && to > 0 ? '99%' : pct(d)}`;
		};
		const link = (text, key) => { links.push({ text, key }); return text; };
		// (from about nothing a ratio means nothing: "padaugėjo nuo beveik nulio"; to about nothing: "sumažėjo beveik iki nulio";
		// with all the details the numbers say it: "padaugėjo (nuo apie 0% iki 4% atvejų)")
		const nearZero = (v, metric) => metric === 'pattern' ? v * 100 < 0.5 : metric === 'speed' ? false : v * (f.perText ? 1 : 100) < (f.perText ? 0.05 : 0.5);
		const changeWords = (c, upWord, downWord) => {
			const t = c.test, up = c.direction === 'up';
			if (up && nearZero(t.early, c.metric)) return details ? upWord : `${upWord} nuo beveik nulio`;
			if (!up && nearZero(t.late, c.metric)) return details ? downWord : `${downWord} beveik iki nulio`;
			return `${up ? upWord : downWord}${amount(t.early, t.late)}`;
		};
		const where = c => (c.phrase ? cap(c.phrase) : `Užduotyse „${c.label}“`);
		const one = f.onlySet && !f.isClass ? where(f.onlySet) : null;
		const order = { overall: 0, set: 1, pattern: 2 };
		changes.slice().sort((a, b) => order[a.group] - order[b.group] || (a.metric === 'speed') - (b.metric === 'speed') || a.test.p - b.test.p).forEach(c => {
			const t = c.test, up = c.direction === 'up';
			if (c.metric === 'speed') {
				// (texts: minutes per text - the inverse of texts per minute)
				const [from, to] = f.perText ? [1 / t.early, 1 / t.late] : [t.early, t.late];
				const words = link(changeWords(c, 'augo', 'krito'), c.key);
				const nums = details ? ` (${speedRange(f, from, to)})` : '';
				sentences.push(c.group === 'overall' ? (one ? `${one} atlikimo greitis ${words}${nums}.` : `Bendras užduočių atlikimo greitis ${words}${nums}.`) : `${where(c)} atlikimo greitis ${words}${nums}.`);
				return;
			}
			if (c.metric === 'pattern') {
				const words = link(changeWords(c, 'padaugėjo', 'sumažėjo'), c.key);
				const nums = details ? ` (nuo apie ${pct(t.early * 100)} iki ${pct(t.late * 100)} atvejų)` : '';
				sentences.push(`Klaidų ${c.label} ${words}${nums}.`);
				return;
			}
			const scale = f.perText ? 1 : 100;
			const words = link(changeWords(c, 'padidėjo', 'sumažėjo'), c.key);
			const nums = details ? ` (${rangeText(f, t.early * scale, t.late * scale)})` : '';
			sentences.push(c.group === 'overall' ? (one ? `${one} klaidų dažnis ${words}${nums}.` : `Bendras klaidų dažnis analogiškose užduotyse ${words}${nums}.`)
				: `${where(c)} klaidų dažnis ${words}${nums}.`);
		});
		return { sentences, links };
	}
	function mathMistakeSentences(f, details) {
		const m = f.math;
		if (!m) return [];
		const out = [];
		return out;
	}
	function joinAreas(areas) {
		// the same words after different operations: "sudėtyje ir atimtyje pergrupuojant skaičių skyrius"
		const OPS = ['sudėtyje', 'atimtyje', 'daugyboje', 'dalyboje'];
		// (where the first of them was: the list is in order of frequency)
		const byRest = new Map();
		areas = areas.map(text => {
			const m = /^(sudėtyje|atimtyje|daugyboje|dalyboje) (.+)$/.exec(text);
			if (!m) return text;
			const first = !byRest.has(m[2]);
			if (first) byRest.set(m[2], []);
			byRest.get(m[2]).push(m[1]);
			return first ? { rest: m[2] } : null;
		}).filter(Boolean).map(x => typeof x === 'string' ? x
			: `${byRest.get(x.rest).sort((a, b) => OPS.indexOf(a) - OPS.indexOf(b)).join(', ').replace(/, ([^,]+)$/, ' ir $1')} ${x.rest}`);   // ("ir" inside; the list's last item joins with "bei")
		const groups = [];
		areas.forEach(text => {
			const lead = /^(painiojant|rašant|skaitant|įrašant|pamirštant|supainiojant|sukeičiant|apsirinkant|ieškant)\s/.exec(text);
			const tail = !lead && / rašyboje$/.test(text) && !/[()]/.test(text) ? ' rašyboje' : null;
			const key = lead ? 'L' + lead[1] : tail ? 'T' : 'X' + groups.length;
			let g = groups.find(x => x.key === key);
			if (!g) { g = { key, lead: lead ? lead[1] : '', tail: tail || '', parts: [] }; groups.push(g); }
			g.parts.push(lead ? text.slice(lead[0].length) : tail ? text.slice(0, -tail.length) : text);
		});
		const inner = parts => parts.length < 2 ? parts.join('') : `${parts.slice(0, -1).join(', ')} ir ${parts[parts.length - 1]}`;
		let items = groups.map(g => `${g.lead ? g.lead + ' ' : ''}${inner(g.parts)}${g.tail}`);
		// ("… atimties užduotyse ir sudėtyje iki 20 pergrupuojant skaičių skyrius" - the same ending said once)
		['nepergrupuojant skaičių skyrių', 'pergrupuojant skaičių skyrius'].forEach(end => {
			const sharing = items.filter(t => t.endsWith(' ' + end) && (end !== 'pergrupuojant skaičių skyrius' || !t.endsWith(' nepergrupuojant skaičių skyrius')));
			if (sharing.length < 2) return;
			const merged = `${inner(sharing.map(t => t.slice(0, -(end.length + 1))))} ${end}`;
			const at = items.indexOf(sharing[0]);
			items = items.filter(t => !sharing.includes(t));
			items.splice(Math.min(at, items.length), 0, merged);
		});
		// ("… veiksmuose su nuliu bei veiksmuose su nežinomu dėmeniu": the same word twice - the unknown one "užduotyse")
		if (items.filter(t => / ?veiksmuose /.test(' ' + t)).length > 1) items = items.map(t => t.replace(/(^|\s)veiksmuose su nežinomu /, '$1užduotyse su nežinomu '));
		// ("A, B bei C" - "bei" joins the last two; the parts inside an item use "ir")
		return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} bei ${items[items.length - 1]}`;
	}
	/* (math) Kinds of task that differ only in the notation (columns / a row) - separate lines in Klaidų kategorijos - are
	 * one in a sentence, said without the notation; when one of them clearly has more mistakes per question (an exact
	 * binomial test of the two counts against their questions, p < 0.05, with 20 questions in each and 5 mistakes at
	 * least) that is said in a sentence of its own after it (notationSentences: "Daugybą skaičiuojant eilute klystama
	 * dažniau nei stulpeliu."). */
	function binomTwoSided(k, n, p) {
		if (!(n > 0) || !(p > 0 && p < 1)) return 1;
		const lg = x => { let s = 0; for (let i = 2; i <= x; i++) s += Math.log(i); return s; };
		const lgn = lg(n);
		const pmf = i => Math.exp(lgn - lg(i) - lg(n - i) + i * Math.log(p) + (n - i) * Math.log(1 - p));
		const obs = pmf(k);
		let total = 0;
		for (let i = 0; i <= n; i++) { const q = pmf(i); if (q <= obs * (1 + 1e-9)) total += q; }
		return Math.min(1, total);
	}
	function mergeNotation(items) {
		const out = [], byBase = new Map();
		items.forEach(i => {
			const m = /^(m_set_[ASMD]_C\d+_[xp-])(c?)(r?)$/.exec(i.key);
			if (!m || !i.areaBase) { out.push(i); return; }
			const base = m[1] + m[3];
			if (!byBase.has(base)) { const g = { first: i, members: [] }; byBase.set(base, g); out.push(g); }
			byBase.get(base).members.push({ i, columns: m[2] === 'c' });
		});
		return out.map(x => {
			if (!x.members) return x;
			const col = x.members.find(m => m.columns), row = x.members.find(m => !m.columns);
			const area = x.first.areaBase;
			let notation = null;
			// (a notation without mistakes: 0 of its questions - rankPatterns, otherNotationQuestions)
			const only = col || row;
			const mistakesOf = m => (m ? (m.i.raw != null ? m.i.raw : m.i.count) : 0);
			const questionsOf = m => (m ? m.i.questions || 0 : only.i.otherNotationQuestions || 0);
			if ((col && row) || only.i.otherNotationQuestions) {
				const y1 = mistakesOf(col), y2 = mistakesOf(row);
				const e1 = questionsOf(col), e2 = questionsOf(row);
				const n = Math.round(y1 + y2);
				if (e1 >= 20 && e2 >= 20 && n >= 5 && binomTwoSided(Math.round(y1), n, e1 / (e1 + e2)) < 0.05) {
					const [colWord, rowWord] = x.first.notationWords;
					const colWorse = y1 / e1 > y2 / e2;
					notation = { op: x.first.opParts ? x.first.opParts.op : null, area, worse: colWorse ? colWord : rowWord, better: colWorse ? rowWord : colWord };
				}
			}
			const members = x.members.map(m => m.i).sort((a, b) => b.count - a.count);
			return { ...members[0], area, notation, count: members.reduce((t, m) => t + m.count, 0), wordCount: members.reduce((t, m) => t + (m.wordCount || 0), 0),
				examples: members.flatMap(m => m.examples || []) };
		});
	}
	/* (math) The areas said in a sentence: kinds of task of the same number set are one area, the set said once - the
	 * operations with the same details joined ("skaičių iki 10 000 dalybos ir daugybos užduotyse"), ones with other details
	 * after them ("… daugybos užduotyse ir sudėties užduotyse nepergrupuojant skaičių skyrių"); in the order of their
	 * mistakes. "bei" inside when the sentence joins more with "ir". Each part's example (example(item): " (pvz., …)" or '')
	 * right after it. */
	function joinOperations(items, example = () => '') {
		const sets = [];
		items.forEach(i => {
			const p = i.opParts;
			let set = p && sets.find(x => x.before === p.before && !x.items.some(y => y.opParts.op === p.op && y.opParts.after === p.after));
			if (!set) { set = { before: p ? p.before : null, items: [] }; sets.push(set); }
			set.items.push(i);
		});
		const others = sets.length > 1;
		return sets.map(set => {
			if (set.items.length < 2) return set.items[0];
			const parts = [];
			set.items.forEach(i => {
				let part = parts.find(x => x.after === i.opParts.after);
				if (!part) { part = { after: i.opParts.after, ops: [], first: i }; parts.push(part); }
				part.ops.push(SET_OP_GEN[i.opParts.op]);
			});
			// the same operations with and without regrouping: said together - "dviženklių skaičių iki 100 atimties užduotyse
			// – tiek pergrupuojant, tiek nepergrupuojant skaičių skyrius" (not "… pergrupuojant skaičių skyrius ir atimties
			// užduotyse nepergrupuojant skaičių skyrių", which reads as another, wider kind of task)
			const CROSS_WITH = ' pergrupuojant skaičių skyrius', CROSS_WITHOUT = ' nepergrupuojant skaičių skyrių';
			for (let a = 0; a < parts.length; a++) {
				for (let b = parts.length - 1; b > a; b--) {
					const pa = parts[a], pb = parts[b];
					if (pa.ops.join() !== pb.ops.join()) continue;
					const pair = (x, y) => x.after.includes(CROSS_WITH) && x.after.replace(CROSS_WITH, CROSS_WITHOUT) === y.after;
					const withOne = pair(pa, pb) ? pa : pair(pb, pa) ? pb : null;
					if (!withOne) continue;
					pa.after = withOne.after.replace(CROSS_WITH, ' – tiek pergrupuojant, tiek nepergrupuojant skaičių skyrius');
					parts.splice(b, 1);
				}
			}
			const join = (list, word) => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} ${word} ${list[list.length - 1]}`);
			const text = join(parts.map(x => join(x.ops, 'ir') + x.after + example(x.first)), 'ir');   // ("ir" inside: the list joins its last item with "bei")
			// (the examples are in the text already)
			return { ...set.items[0], area: set.before + text, examples: [] };
		});
	}
	// (math) "Daugybą skaičiuojant eilute klystama dažniau nei stulpeliu." - for the areas said, one sentence for the
	// operations with the same two notations (the area's name only when an operation is said in more than one area)
	const SET_OP_ACC = { A: 'sudėtį', S: 'atimtį', M: 'daugybą', D: 'dalybą' };
	function notationSentences(items) {
		const notes = items.map(i => i.notation).filter(Boolean);
		const perOp = op => items.filter(i => i.opParts && i.opParts.op === op).length;
		const groups = new Map();
		notes.forEach(n => {
			const byName = n.op && perOp(n.op) < 2;
			const key = byName ? `${n.worse}|${n.better}` : '\u0000' + n.area;
			if (!groups.has(key)) groups.set(key, { n, ops: [] });
			if (byName) groups.get(key).ops.push(SET_OP_ACC[n.op]);
		});
		return [...groups.values()].map(({ n, ops }) => ops.length
			? `${cap(joinList(ops))} skaičiuojant ${n.worse} klystama dažniau nei ${n.better}.`
			: `${cap(n.area)} dažniau klystama skaičiuojant ${n.worse} nei ${n.better}.`);
	}
	function mistakeSentences(f, details) {
		const out = [];
		if (!f.mistakes || (f.subject !== 'grammar' && f.subject !== 'math')) return out;
		if (f.subject === 'math') out.push(...mathMistakeSentences(f, details));
		const g = f.subject === 'math' ? f.math : f.grammar;
		if (f.subject === 'grammar' && f.noDetail) {
			// not sent (a server of the version before does not send them) / really none stored
			const notSent = f.noDetailNotSent === f.noDetail;
			if (f.mode === 'task' || f.noDetail === f.withMistakes) {
				out.push(notSent
					? (f.mode === 'task' ? 'Šio įrašo klaidų informacija iš serverio negauta.' : 'Šių įrašų klaidų informacija iš serverio negauta.')
					: (f.mode === 'task' ? 'Klaidų informacijos šiame įraše nėra.' : 'Klaidų informacijos šiuose įrašuose nėra.'));
			} else if (details) {
				out.push(`Klaidų pobūdis nustatytas iš ${f.withMistakes - f.noDetail} ${form(f.withMistakes - f.noDetail, ['užduoties', 'užduočių', 'užduočių'])} (dar ${count(f.noDetail, ['įraše', 'įrašuose', 'įrašų'])} klaidų informacijos nėra).`);
			}
		}
		if (!g || !g.insights.length) return out;
		// (plain groupings - other ×÷, all + or all − - are listed in the patterns, but say nothing in a sentence)
		const randomSaid = f.subject === 'grammar' && !f.isClass && g.randomLetters && g.randomLetters.flagged;
		if (randomSaid) {
			// (one task's card: it is said of that task, so "dažnai")
			out.push(`Panašu, kad ${f.mode === 'task' || g.randomLetters.often ? 'dažnai' : 'kartais'} įrašinėjamos bet kokios raidės.`);
		}
		let named = g.insights.filter(i => i.key !== 'kita' && i.key !== 'm_muldiv' && !i.key.startsWith('m_op_') && !(randomSaid && i.key === 'bet_kokias'));
		if (f.subject === 'math') named = mergeNotation(named);
		if (!named.length) return out;
		const example = i => !details || !i.examples || !i.examples[0] ? '' : i.examples[0].text ? ` (pvz., ${i.examples[0].text})` : i.examples[0].w ? ` (pvz., ${exampleText(i.examples[0])})` : '';
		const where = i => i.area + example(i);
		// "Klaidų nedaug" only for a low mistake rate: at most 5 per 100 answers (95 % or better - the usual mastery level, so
		// also in a class where everybody does well), or in the class's lowest quarter
		const LOW_RATE = 5;
		const low = f.mistakeValue <= LOW_RATE || (f.peers && f.peers.rateQ1 != null && f.mistakeValue <= f.peers.rateQ1);
		// (math: the kinds of task differing only in the operation said as one, a clear notation difference after it)
		const said = list => (f.subject === 'math' ? joinOperations(list, example) : list);
		let shown = [];
		if (low) {
			shown = named.slice(0, 3);
			out.push(`Klaidų nedaug – pavieniais atvejais suklysta ${joinAreas(said(shown).map(where))}.`);
		} else if (f.mode === 'task') {
			shown = named.slice(0, 3);
			out.push(`Dažniausiai klystama ${joinAreas(said(shown).map(where))}.`);
		} else if (g.total <= 3) {
			shown = named.slice(0, 3);
			out.push(`Klystama ${joinAreas(said(shown).map(where))}.`);
		} else {
			const recurring = named.filter(i => i.wordCount >= 2 || i.count >= 3);
			shown = recurring.slice(0, 3);
			out.push(recurring.length
				? `Nustatytu laikotarpiu dažniausiai buvo klystama ${joinAreas(said(shown).map(where))}.`
				: 'Klaidos pavienės – pasikartojančių klaidų tipų nepastebėta.');
		}
		if (f.subject === 'math') out.push(...notationSentences(shown));
		return out;
	}

	// math: "sudėtis (…) – 3 %" and "atimtis (…) – 3 %" with the same settings and about the same time → "Sudėtis ir atimtis (…) – 6 %"
	function joinSimilarOperations(types) {
		const ORDER = ['sudėtis', 'atimtis', 'daugyba', 'dalyba'];
		const groups = new Map();
		types.forEach(t => {
			const m = /^(sudėtis|atimtis|daugyba|dalyba)(.*)$/.exec(t.desc || '');
			const key = m ? m[2] : '\u0000' + t.desc;
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push({ ...t, op: m ? m[1] : null, rest: m ? m[2] : '' });
		});
		const out = [];
		groups.forEach(list => {
			const ops = list.filter(t => t.op);
			const shares = ops.map(t => t.share);
			if (ops.length > 1 && Math.max(...shares) <= 1.35 * Math.min(...shares)) {
				ops.sort((a, b) => ORDER.indexOf(a.op) - ORDER.indexOf(b.op));
				out.push({ ...ops[0], desc: joinList(ops.map(t => t.op)) + ops[0].rest, share: shares.reduce((a, b) => a + b, 0) });
			} else out.push(...list);
		});
		return out.sort((a, b) => b.share - a.share);
	}

	// next to the classmates: only what is clearly different is said; the rest is "panašiai kaip dauguma"
	function peerParts(f, details) {
		const c = f.peers;
		if (!c) return null;
		const used = new Set();
		// "gerokai" / "daug" / "žymiai" for a large difference (each once), nothing for a smaller one
		const degree = ratio => {
			if (!(ratio >= 2.5)) return '';
			const word = ['gerokai', 'daug', 'žymiai'].find(x => !used.has(x)) || 'gerokai';
			used.add(word);
			return word + ' ';
		};
		const ratioOf = (mine, theirs) => mine > 0 && theirs > 0 ? Math.max(mine / theirs, theirs / mine) : 1;
		// by how much, in every version: "30% lėčiau", from twice as much "2,5 karto greičiau" (r: mine / the class's)
		const howMuch = r => {
			if (!(r > 0) || !isFinite(r)) return '';
			const big = Math.max(r, 1 / r);
			if (big >= 2) { const k = round(big, big >= 10 ? 0 : 1); return `${timesText(k)} `; }
			const d = Math.abs(r - 1) * 100;
			return Math.round(d) > 0 ? `${pct(d)} ` : '';
		};
		const mistakeNums = details ? ` (skirtumas – apie ${valueText(f, Math.abs(c.mistakesBy))})` : '';
		const out = { links: [] };
		// time and how often against what is usual in the class (its middle half; the numbers are the class's median):
		// "Įdėtos pastangos panašios į klasės vidurkį (2 val., 5 dienos per savaitę).", "Bendras mokymosi laikas panašus į
		// klasės vidurkį (2 val.), tačiau mokytasi rečiau nei vidutiniškai klasėje (5 dienos per savaitę)." … (the class's
		// value: its median - the typical student; "different": outside the classmates' middle half)
		const oneDay = f.from === f.to;
		const tNum = details ? ` (${timeBrief(c.median)})` : '';
		const dNum = details && !oneDay ? ` (${perWeekText(f, c.dayMedian, Math.max(c.myDays, c.dayMedian), ['diena', 'dienos', 'dienų', 'dienos'])})` : '';
		const both = details ? ` (${timeBrief(c.median)}${oneDay ? '' : `, ${perWeekText(f, c.dayMedian, Math.max(c.myDays, c.dayMedian), ['diena', 'dienos', 'dienų', 'dienos'])}`})` : '';
		const longer = c.time === 'more', shorter = c.time === 'less';
		// (worded only when used: a word of degree is spent once)
		const timeAdj = () => `${howMuch(c.mine / c.median)}${longer ? 'ilgesnis' : 'trumpesnis'}`;
		const daysAdv = () => `${degree(ratioOf(c.myDays, c.dayMedian))}${c.days === 'more' ? 'dažniau' : 'rečiau'}`;
		if (oneDay || c.days === 'similar') {
			out.compare = c.time === 'similar'
				? (oneDay ? `Mokymosi laikas panašus į klasės vidurkį${tNum}.` : `Įdėtos pastangos panašios į klasės vidurkį${both}.`)
				: oneDay ? `Mokymosi laikas ${timeAdj()} nei klasės vidurkis${tNum}.`
				: `Mokymosi laikas ${timeAdj()} nei klasės vidurkis${tNum}, o mokytasi taip pat reguliariai${dNum}.`;
		} else if (c.time === 'similar') {
			out.compare = `Bendras mokymosi laikas panašus į klasės vidurkį${tNum}, tačiau mokytasi ${daysAdv()} nei vidutiniškai klasėje${dNum}.`;
		} else if ((longer && c.days === 'more') || (shorter && c.days === 'less')) {
			out.compare = `Įdėta ${degree(Math.min(ratioOf(c.mine, c.median), ratioOf(c.myDays, c.dayMedian)))}${longer ? 'daugiau' : 'mažiau'} pastangų nei klasės vidurkis${both}.`;
		} else {
			out.compare = `Mokymosi laikas ${timeAdj()} nei klasės vidurkis${tNum}, tačiau mokytasi ${daysAdv()}${dNum}.`;
		}
		// (the class's value in the same kinds of tasks: the student's there less the typical difference)
		const classMistakes = Math.max(0, (c.myGroupValue != null ? c.myGroupValue : f.mistakeValue) - c.mistakesBy);
		// (both numbers from the same kinds of tasks - the student's there may differ from the overall rate said before)
		const mineMistakes = c.myGroupValue != null ? c.myGroupValue : f.mistakeValue;
		const digits = f.perText ? 1 : 0;
		const classNums = details ? ` (${count(round(mineMistakes, digits), ['klaida', 'klaidos', 'klaidų'])} ${f.perText ? 'vienam tekstui' : PER_100[f.subject]}, klasės vidurkis – ${num(round(classMistakes, digits))})` : '';
		const mistakesBy = classMistakes > 0 ? howMuch(mineMistakes / classMistakes) : '';
		// (not clear: what it looks like, said as such; nothing comparable in the class: said too)
		const big = Math.abs(c.mistakesBy || 0) >= (f.perText ? 0.3 : 5);
		const looks = !big ? 'tiek pat, kiek klasės vidurkis' : c.mistakesBy > 0 ? 'daugiau nei klasės vidurkis' : 'mažiau nei klasės vidurkis';
		// (the comparison's words open the graph of the student's and the class's tasks)
		const mistakeWords = c.mistakes === 'unknown' ? looks : { more: `${mistakesBy}daugiau nei klasės vidurkis`, less: `${mistakesBy}mažiau nei klasės vidurkis`, similar: 'tiek pat, kiek klasės vidurkis' }[c.mistakes];
		// ("tiek pat" is not a button: only more / less)
		if (mistakeWords && c.dist && c.dist.mistakes && c.mistakes !== 'none' && c.mistakes !== 'similar' && !(c.mistakes === 'unknown' && !big)) out.links.push({ text: mistakeWords, key: 'peer:mistakes', after: 'klaidų daroma' });
		out.mistakes = c.mistakes === 'none' ? 'Su klasės vidurkiu palyginti negalima – tokių pačių užduočių atliko per mažai klasės draugų.'
			: c.mistakes === 'unknown' ? (c.myGroupValue != null ? `Patikimai palyginti su klasės vidurkiu duomenų nepakanka, tačiau panašu, kad analogiškose užduotyse klaidų daroma ${looks}${classNums}.` : '')
			: { more: `Analogiškose užduotyse klaidų daroma ${mistakesBy}daugiau nei klasės vidurkis${classNums}.`, less: `Analogiškose užduotyse klaidų daroma ${mistakesBy}mažiau nei klasės vidurkis${classNums}.`,
			similar: `Analogiškose užduotyse klaidų daroma tiek pat, kiek klasės vidurkis${classNums}.` }[c.mistakes];
		// "Analogiškos užduotys sprendžiamos greičiau nei klasės vidurkis (18 atsakymų per minutę, klasės vidurkis – 4,5)."
		// (the verdict is from the matched tasks; the overall numbers and the percent only when they go the same way)
		const overallFaster = c.mySpeed > 0 && c.peerSpeed > 0 && (f.perText ? c.mySpeed < c.peerSpeed : c.mySpeed > c.peerSpeed);
		const overallAgrees = c.mySpeed > 0 && c.peerSpeed > 0 && c.mySpeed !== c.peerSpeed && overallFaster === (f.perText ? c.speed === 'less' : c.speed === 'more');
		const speedNums = !details || !overallAgrees ? ''
			: f.perText ? ` (${timeShortNom(c.mySpeed)} vienam tekstui, klasės vidurkis – ${timeShortNom(c.peerSpeed)})`
			: ` (${count(round(c.mySpeed, 1), SUBJECTS[f.subject].unit)} per minutę, klasės vidurkis – ${num(c.peerSpeed)})`;
		const faster = f.perText ? c.speed === 'less' : c.speed === 'more';
		const speedDegree = overallAgrees ? howMuch(f.perText ? c.peerSpeed / c.mySpeed : c.mySpeed / c.peerSpeed) : '';
		if (!(c.speed === 'similar' || c.speed === 'unknown') && c.dist && c.dist.speed) out.links.push({ text: `${speedDegree}${faster ? 'greičiau' : 'lėčiau'} nei klasės vidurkis`, key: 'peer:speed', after: f.perText ? 'Analogiškose užduotyse tekstai dėliojami' : 'Analogiškos užduotys sprendžiamos' });
		out.speed = c.speed === 'similar' || c.speed === 'unknown' ? ''
			: `${f.perText ? 'Analogiškose užduotyse tekstai dėliojami' : 'Analogiškos užduotys sprendžiamos'} ${speedDegree}${faster ? 'greičiau' : 'lėčiau'} nei klasės vidurkis${speedNums}.`;
		// the tasks' difficulty, only when clearly different from the class's
		const diffWords = `${degree(c.difficultyBy >= 1 ? c.difficultyBy : 1 / c.difficultyBy)}${c.difficulty === 'more' ? 'sudėtingesnės' : 'lengvesnės'} nei klasės vidurkis`;
		if ((c.difficulty === 'more' || c.difficulty === 'less') && c.dist && c.dist.difficulty) out.links.push({ text: diffWords, key: 'peer:difficulty', after: 'Atliekamos užduotys' });
		out.difficulty = c.difficulty === 'similar' || c.difficulty === 'unknown' || !c.difficulty ? ''
			: `Atliekamos užduotys ${diffWords}${details ? ` (santykinis sudėtingumas – ${num(c.difficultyBy, 1)})` : ''}.`;
		return out;
	}
	// days of practice per week of the period (per month when less than once a week): "6 dienos per savaitę"
	function perWeekText(f, days, scaleDays, forms) {
		const span = dayNumber(f.to) - dayNumber(f.from) + 1;
		if (span < 7) return `${count(round(days, days % 1 ? 1 : 0), forms)} iš ${span}`;   // (under a week: "3 dienos iš 5")
		const weeks = Math.max(1, span / 7);
		const monthly = scaleDays / weeks < 1;
		const v = monthly ? days / weeks * 30 / 7 : days / weeks;
		return `${count(v >= 3 ? Math.round(v) : round(v, 1), forms)} per ${monthly ? 'mėnesį' : 'savaitę'}`;
	}

	// → [{ p: 'text' } | { ol: ['item', ...] }]
	// the class overview: who practised, how long and how often (the typical student) - "laiko skyrė visi klasės mokiniai. …";
	// speed: the typical speed (not in Mažas)
	function classPractice(f, details, short) {
		const S = SUBJECTS[f.subject];
		const c = f.classStats;
		const who = c.classSize && c.students === c.classSize ? 'visi klasės mokiniai' : c.classSize ? `${c.students} iš ${c.classSize} klasės mokinių` : count(c.students, ['mokinys', 'mokiniai', 'mokinių']);
		const amount = details ? ` (${count(Math.round(c.tasks), W.task)}, ${count(Math.round(c.answers), S.unit)})` : '';
		// how often: per week, the median practice days of the students who practised (how many did is said above)
		const all = c.weeks.counts;
		const typicalWeek = c.weeks.counts[0].map((_, w) => median(all.map(perWeek => perWeek[w])));
		const phases = weeklyPhases(typicalWeek, c.weeks.start, c.weeks.end);
		// (the numbers are of the students who practised: when some did not, "Mokiniai, kurie mokėsi, …" and "dauguma jų";
		// "dauguma … nesimokė" only for a stretch of the period - over all of it the typical one practised rarely)
		const several = c.students > 1;
		const part = !(c.classSize && c.students === c.classSize);
		const most = part ? 'dauguma jų' : 'dauguma mokinių';
		const one = ph => !weekDays(ph.avg) ? (several ? `${most} nesimokė` : 'nesimokyta') : several ? `${most} mokėsi ${weekDays(ph.avg)}` : `mokytasi vidutiniškai ${weekDays(ph.avg)}`;
		const pk = longPeriod(typicalWeek.length, phases) ? activityPeaks(typicalWeek, c.weeks.start, c.weeks.end) : null;
		const often = pk ? peaksText(pk, several ? `aktyviausiai ${most} mokėsi` : 'aktyviausiai mokytasi', details, +f.from.slice(0, 4))
			: phases ? phasesText(phases, one, (ph, prev) => !weekDays(ph.avg) ? (several ? 'dauguma nesimokė' : 'nesimokyta') : weekDays(prev.avg) ? weekDays(ph.avg) : `${several ? 'mokėsi' : 'mokytasi'} ${weekDays(ph.avg)}`)
			: `${several ? `${most} mokėsi` : 'mokytasi'} nereguliariai – vidutiniškai ${weekDays(typicalWeek.reduce((a, b) => a + b, 0) / typicalWeek.length)}`;
		const span = dayNumber(f.to) - dayNumber(f.from) + 1;
		const daysEach = c.daysMedian || 0;
		const howOften = f.from === f.to ? '' : span < 7 ? ` ir mokėsi ${count(round(daysEach, daysEach % 1 ? 1 : 0), ['dieną', 'dienas', 'dienų', 'dienos'])} iš ${span}` : `; ${often}`;
		const during = f.from === f.to || short ? '' : 'per šį laikotarpį ';   // (Mažas: the dates are said just before)
		const whoPractised = !several ? cap(`${during}praktikuotasi`) : part ? `Mokiniai, kurie mokėsi, ${during}vidutiniškai praktikavosi` : cap(`${during}vienas mokinys vidutiniškai praktikavosi`);
		const text = `${f.from === f.to ? 'šią dieną ' : ''}laiko skyrė ${who}. ${whoPractised} ${minutesText(c.minutes)}${amount}${howOften}.`;
		// "Vienas mokinys vidutiniškai atlieka 8,5 veiksmo per minutę." (not in the short version)
		let speed = '';
		if (!short && c.speed > 0) {
			const v = round(c.speed, c.speed < 10 ? 1 : 0);
			// (one student: impersonal, as the sentence before; said after the kinds of tasks)
			speed = (f.perText ? `Vienam tekstui sudėlioti ${several ? 'vienas mokinys vidutiniškai skiria' : 'vidutiniškai skiriama'} ${shortTime(c.speed)}.`
				: several ? `Vienas mokinys vidutiniškai ${f.subject === 'math' ? 'atlieka' : 'pateikia'} ${count(v, S.unit)} per minutę.`
				: `Vidutiniškai ${f.subject === 'math' ? 'atliekama' : 'pateikiama'} ${count(v, S.unit)} per minutę.`);
		}
		return { text, speed };
	}
	function describe(f, opts = {}) {
		if (!f || !f.n) return [];
		// (detail: 'low' | 'medium' | 'high' - the numbers and examples with 'high'; the older option details: true / false)
		const details = opts.detail ? opts.detail === 'high' : Boolean(opts.details);
		const S = SUBJECTS[f.subject];
		const blocks = [];
		if (f.mode === 'task') {
			const out = [];
			// (the date, the kind, the time and the settings are shown in the popup itself)
			if (!f.mistakes) {
				out.push('Klaidų nepadaryta.');
			} else {
				if (details) out.push(mistakeRateSentence(f));
				if (f.usual && f.answers >= 5) {
					const d = f.mistakeValue - f.usual.mistakeValue;
					const close = f.perText ? Math.abs(d) < 0.3 : Math.abs(d) < 5;
					out.push(`Klaidų padaryta ${close ? 'tiek pat, kiek' : d < 0 ? 'mažiau nei' : 'daugiau nei'} kitose analogiškose mokinio užduotyse${details ? ` (paprastai apie ${valueText(f, f.usual.mistakeValue)})` : ''}.`);
				}
			}
			if (f.usual && f.answers >= 5) {
				const mine = f.perText ? f.minutesPerText : f.rate;
				if (f.usual.rate > 0 && mine > 0 && Math.abs(mine / f.usual.rate - 1) >= 0.2) {
					const faster = f.perText ? mine < f.usual.rate : mine > f.usual.rate;
					const nums = !details ? '' : f.perText
						? ` (${shortTime(mine).replace(/^apie /, '')} vienam tekstui, paprastai ${shortTime(f.usual.rate)})`
						: ` (${count(mine, S.unit)} per minutę, paprastai apie ${num(f.usual.rate)})`;
					out.push(`Atsakinėta ${faster ? 'greičiau' : 'lėčiau'} nei kitose analogiškose mokinio užduotyse${nums}.`);
				}
			}
			out.push(...mistakeSentences(f, details));
			// (the paragraph starts with "Šioje užduotyje …")
			if (out.length && !/^Šioje užduotyje/.test(out[0])) out[0] = 'Šioje užduotyje ' + lowerFirst(out[0]);
			blocks.push({ p: out.join(' ') });
			return blocks;
		}

		// period: the dates, then small sections (time, what was practised, mistakes, speed)
		blocks.push({ date: periodText(f.from, f.to) });
		// Mažas: one paragraph for the records (a student's); the class overview - what the time went to
		if (opts.detail === 'low') {
			return [{ p: f.isClass ? classShortSummary(f) : shortSummary(f) }];
		}
		const first = [];
		let classSpeed = '';
		if (f.isClass && f.classStats) {
			const cp = classPractice(f, details, opts.detail === 'low');
			first.push(`${TASKS_OF[f.subject]} ${cp.text}`);
			classSpeed = cp.speed;
		}
		const how = f.isClass ? '' : regularity(f, details);
		const amount = details ? ` (${count(f.n, W.task)}, ${count(f.answers, S.unit)})` : '';
		const cmp = peerParts(f, details);
		// "Rašybos užduotims skirta apie 2,5 valandos (32 užduotys, 2 680 atsakymų), mokytasi vidutiniškai kasdien (6 dienos per
		// savaitę)." - one frequency in the same sentence; phases (or irregular practice) in a sentence of their own
		const myDays = new Set(f.dates).size;
		const single = how && /^mokytasi (?!nereguliariai)/.test(how) && !/ iki |, o nuo | d\./.test(how);
		// (phases carry their own numbers; irregular practice: the period's average, said as such)
		const phased = / iki |, o nuo /.test(how);
		const often = !how || single ? '' : `${cap(how)}.`;
		// ("vidutiniškai": words from the same average as the number - days of practice per week over the whole period)
		const avgPerWeek = myDays / Math.max(1, (dayNumber(f.to) - dayNumber(f.from) + 1) / 7);
		let oftenInline = single ? `, mokytasi vidutiniškai ${weekDays(avgPerWeek)}` : '';
		// (a period under a week has no "per week": "mokytasi 3 dienas iš 5"; a single day: "šią dieną")
		const periodDays = dayNumber(f.to) - dayNumber(f.from) + 1;
		let skirta = 'skirta', oftenSaid = often;
		if (periodDays < 7) {
			oftenSaid = '';
			oftenInline = periodDays === 1 ? '' : `, mokytasi ${count(myDays, ['dieną', 'dienas', 'dienų'])} iš ${periodDays}`;
			if (periodDays === 1) skirta = 'šią dieną skirta';
		}
		if (f.isClass && f.classStats) {
			// (said above, as the typical student)
		} else if (f.minutes > 0) {
			// (no second full stop after an abbreviation: "apie 2 val.")
			first.push(`${TASKS_OF[f.subject]} ${skirta} ${minutesText(f.minutes)}${amount}${oftenInline}.`.replace(/\.\.$/, '.'));
			if (oftenSaid) first.push(oftenSaid);
		} else {
			first.push(`${cap(form(f.n, W.done))} ${f.n} ${S.gen} ${form(f.n, W.task)}${periodDays === 1 ? ' šią dieną' : ''}${oftenInline}.`);
			if (oftenSaid) first.push(oftenSaid);
		}
		if (cmp) first.push(cmp.compare);
		const kinds = kindSentence(f);
		if (kinds) first.push(kinds);
		if (classSpeed) first.push(classSpeed);
		if (cmp && cmp.speed) first.push(cmp.speed);
		if (cmp && cmp.difficulty) first.push(cmp.difficulty);
		const onTime = f.isClass ? '' : onTimeSentence(f, details);
		if (onTime) first.push(onTime);
		// ("kasdien" needs no "vidutiniškai")
		blocks.push({ h: 'Praktika' }, { p: first.join(' ').replace(/vidutiniškai (beveik kasdien|kasdien)/g, '$1'), links: cmp ? cmp.links.filter(l => l.key === 'peer:speed' || l.key === 'peer:difficulty') : [] });
		// what was practised: one sentence for one kind of task, otherwise a numbered list with the shares of the time
		// (kinds that round to 0 % are left out)
		const types = (f.types || []).filter(t => Math.round(t.share) > 0);
		const tree = f.practiceTree && f.practiceTree.length ? f.practiceTree
			: types.length > 1 ? joinSimilarOperations(types).map(t => ({ label: cap(t.desc), share: t.share, children: [] })) : [];
		if (tree.length || types.length) blocks.push({ h: 'Mokymosi sritys' });
		// (spelling: categories of the same share - as shown - on one line: "„U“ ir „Ū“, dvibalsiai, „I“ ir „Y“ (po 14%)")
		const sameShare = nodes => {
			if (f.subject !== 'grammar') return nodes;
			const out = [];
			nodes.forEach(n => {
				const last = out[out.length - 1];
				if (last && !n.children.length && !last.children.length && pct(n.share) === pct(last.each || last.share)) {
					if (!last.each) { last.each = last.share; last.label = last.label; }
					last.label += ', ' + lowerFirst(n.label);
					last.share += n.share;
				} else out.push({ ...n });
			});
			return out;
		};
		if (tree.length) {
			// (the outer areas under SMALL% of the time together - when there are at least two of them)
			const SMALL = 7.5;
			const small = tree.filter(n => n.share < SMALL);
			const big = small.length >= 2 ? tree.filter(n => n.share >= SMALL) : tree;
			const rest = small.length >= 2 ? { label: f.subject === 'grammar' ? 'Kitos kategorijos' : 'Kitos užduotys', share: small.reduce((a, n) => a + n.share, 0), nodes: small } : null;
			blocks.push({ tree: sameShare(big), rest: rest && { ...rest, nodes: sameShare(rest.nodes) } });
		} else if (types.length === 1) {
			blocks.push({ p: `Praktikuotasi vienoje srityje – ${types[0].desc}.` });
		}
		// Klaidos: how many, the most common kinds, next to the class
		const mistakes = [];
		if (!f.mistakes) {
			mistakes.push('Nustatytu laikotarpiu klaidų nepadaryta.');
		} else {
			if (details) mistakes.push(f.isClass && f.classStats ? classRateSentence(f) : mistakeRateSentence(f));
			mistakes.push(...mistakeSentences(f, details));
			if (cmp) mistakes.push(cmp.mistakes);
			// "Palyginti su klasės vidurkiu, dažniau klystama minkštumo ženklo rašyboje (24% atvejų, klasės vidurkis – 10%), rečiau – …"
			const pp = f.patternPeers || [];
			if (pp.length) {
				const part = x => `${x.area}${details ? ` (${pct(x.mine)} atvejų, klasės vidurkis – ${pct(x.cls)})` : ''}`;
				const more = pp.filter(x => x.direction === 'more').map(part), less = pp.filter(x => x.direction === 'less').map(part);
				const join = details ? joinList : joinAreas;
				mistakes.push(`Palyginti su klasės vidurkiu, ${[more.length ? `dažniau klystama ${join(more)}` : '', less.length ? `${more.length ? 'rečiau –' : 'rečiau klystama'} ${join(less)}` : ''].filter(Boolean).join(', ')}.`);
			}
		}
		if (details && f.outliers && f.outliers.length) {   // (said only with all the details - Didelis)
			const o = f.outliers;
			const one = o.length === 1 && !f.isClass
				? ` (${periodText(o[0].date, o[0].date).replace(/^\d{4} m\. /, '')}: ${count(o[0].mistakes, W.mistake)} per ${count(o[0].answers, SUBJECTS[f.subject].unitAcc)})` : '';
			mistakes.push(`Į klaidų ir greičio analizę ${form(o.length, ['neįtraukta', 'neįtrauktos', 'neįtraukta'])} ${count(o.length, W.task)} su neįprastai daug klaidų${one}.`);
		}
		const said = mistakes.filter(Boolean);
		const mistakeLinks = (cmp ? cmp.links.filter(l => l.key === 'peer:mistakes') : [])
			.concat((f.patternPeers || []).filter(x => x.dist).map(x => ({ text: x.area, key: 'peerpat:' + x.key, after: 'Palyginti su klasės vidurkiu' })))
			// (the excluded tasks: the words open their list, when the page can show it)
			.concat(details && f.outliers && f.outliers.length && typeof f.openTasks === 'function'
				? [{ text: count(f.outliers.length, W.task), key: 'outliers', after: 'Į klaidų ir greičio analizę', list: true }] : []);
		if (said.length) blocks.push({ h: 'Klaidos' }, { p: said.join(' '), links: mistakeLinks });
		// Tendencijos: the changes from the start to the end of the period that passed the test (the words open the graph), then
		// what the rest showed - "not detected", not "no change" - or that there was too little data to look at all
		const trend = trendSentences(f, details);
		const closing = trend.sentences.length ? 'Kitų patikimų klaidų dažnio ar atlikimo greičio pokyčių neaptikta.'
			: f.changesTested ? 'Nustatytu laikotarpiu patikimų klaidų dažnio ar atlikimo greičio pokyčių neaptikta.'
			: 'Pokyčiams nustatyti duomenų nepakanka.';
		if (f.changesTested != null) blocks.push({ h: 'Tendencijos' }, { p: [...trend.sentences, closing].join(' '), links: trend.links });
		return blocks;
	}

	/* "Mažas" - one paragraph a teacher can copy into the official records or for the parents: when (a month, when the period
	 * is mostly one), how much and how regularly, who chose the tasks, lateness (only when above the class's usual), what was
	 * practised, the main mistakes (few - said so), and the changes - only those found. No speed, no comparison with the class. */
	function periodLead(f) {
		const from = dayNumber(f.from), to = dayNumber(f.to);
		const monthOf = d => { const dt = new Date(d * 86400000); return dt.getUTCFullYear() * 12 + dt.getUTCMonth(); };
		const perMonth = new Map();
		for (let d = from; d <= to; d++) perMonth.set(monthOf(d), (perMonth.get(monthOf(d)) || 0) + 1);
		const [top, topDays] = [...perMonth].sort((a, b) => b[1] - a[1])[0];
		const practice = (f.dates || []).map(dayNumber);
		const inTop = practice.filter(d => monthOf(d) === top).length;
		// (a month by name when at least two thirds of the period and of the practice days are in it - a whole month, or most of it)
		if (to - from + 1 >= 7 && topDays / (to - from + 1) >= 2 / 3 && (!practice.length || inTop / practice.length >= 2 / 3)) {
			return `${Math.floor(top / 12)} m. ${MONTHS[top % 12]} mėnesį`;
		}
		return daysRangeText(f.from, f.to);
	}
	// "2026 m. rugsėjo 17 – spalio 17 dienomis", "2026 m. spalio 3–17 dienomis", one day "2026 m. spalio 17 d."
	function daysRangeText(from, to) {
		if (from === to) return periodText(from, to);
		const [a, b] = [from, to].map(d => new Date(dayNumber(d) * 86400000));
		const y = d => `${d.getUTCFullYear()} m. `, md = d => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
		if (a.getUTCFullYear() !== b.getUTCFullYear()) return `${y(a)}${md(a)} – ${y(b)}${md(b)} dienomis`;
		if (a.getUTCMonth() === b.getUTCMonth()) return `${y(a)}${md(a)}–${b.getUTCDate()} dienomis`;
		return `${y(a)}${md(a)} – ${md(b)} dienomis`;
	}
	function shortKinds(f) {
		const k = f.kinds || {}, n = f.n;
		const t = k.teacher ? k.teacher.n : 0, self = k.self ? k.self.n : 0, g = k.game ? k.game.n : 0, old = k.legacy ? k.legacy.n : 0;
		const kindsPresent = [t, self, g, old].filter(Boolean).length;
		if (!n || !kindsPresent) return '';
		if (kindsPresent === 1) {
			if (t) return `${cap(form(n, W.done))} ${count(n, ['mokytojo skirta užduotis', 'mokytojo skirtos užduotys', 'mokytojo skirtų užduočių'])}; savarankiškai pasirinktų užduočių nebuvo.`;
			if (self) return `${cap(form(n, W.done))} ${count(n, ['savarankiškai pasirinkta užduotis', 'savarankiškai pasirinktos užduotys', 'savarankiškai pasirinktų užduočių'])}.`;
			if (g) return `${cap(form(n, W.done))} ${count(n, ['užduotis klasės žaidime', 'užduotys klasės žaidimuose', 'užduočių klasės žaidimuose'])}.`;
			return '';
		}
		// (as shares of the tasks done: "Iš visų atliktų užduočių 70% skyrė mokytojas ir 30% pasirinkta savarankiškai.")
		const share = k => pct(k / n * 100);
		const parts = [];
		if (t) parts.push(`${share(t)} skyrė mokytojas`);
		if (self) parts.push(`${share(self)} pasirinkta savarankiškai`);
		if (g) parts.push(`${share(g)} atlikta klasės žaidimuose`);
		if (old) parts.push(`${share(old)} – senesni įrašai be šios informacijos`);
		return `Iš visų atliktų užduočių ${parts.slice(0, -1).join(', ')}${parts.length > 1 ? ' ir ' : ''}${parts[parts.length - 1]}.`;
	}
	// lateness: only when above the class's usual share (or, the usual share unknown, when "often" by the fixed limits)
	function shortLate(f) {
		const o = f.onTime;
		if (!o || !o.late) return '';
		const worth = o.typical != null ? o.share > o.typical : o.often;
		if (!worth) return '';
		if (o.often) return 'Mokytojo skirtos užduotys dažnai buvo neatliekamos laiku.';
		return o.late === 1 ? 'Viena mokytojo skirta užduotis neatlikta laiku.' : 'Kelios mokytojo skirtos užduotys neatliktos laiku.';
	}
	// the main mistakes: none, few (said so), the most common one or two kinds, or that they did not repeat
	// the main mistakes: none; few - said so, with the kind that stands out (or that none does); more - the most common one
	// or two kinds, or that they do not repeat / no kind stands out
	function shortMistakes(f, focus = '') {
		if (!f.mistakes) return 'Klaidų nepadaryta.';
		const low = f.perText ? f.mistakeValue <= 0.5 : f.mistakeValue <= 5;
		if (f.subject === 'text') {
			return low ? 'Klaidų padaryta nedaug.'
				: `Sudėliojant vieną tekstą vidutiniškai ${form(round(f.mistakeValue, 1), ['padaroma', 'padaromos', 'padaroma', 'padaroma'])} ${count(round(f.mistakeValue, 1), W.mistake)}.`;
		}
		const g = f.subject === 'math' ? f.math : f.grammar;
		let named = g && g.insights ? g.insights.filter(i => i.key !== 'kita' && i.key !== 'm_muldiv' && !i.key.startsWith('m_op_')) : [];
		if (f.subject === 'math') named = mergeNotation(named);
		const recurring = named.filter(i => i.wordCount >= 2 || i.count >= 3).slice(0, 2);
		// (a "kind of mistake" that is only the very task practised - its name said just before - tells nothing more)
		const stem = area => String(area).replace(/\s+\S+$/, '').toLowerCase();
		const said = recurring.length ? (f.subject === 'math' ? joinOperations(recurring, () => '') : recurring) : [];
		const standsOut = said.length && !(focus && said.every(i => focus.toLowerCase().includes(stem(i.area))));
		if (low) {
			if (!named.length) return 'Klaidų padaryta nedaug.';   // (no details of the mistakes to tell their kind)
			return standsOut ? `Klaidų padaryta nedaug, daugiausia klystama ${joinAreas(said.map(i => i.area))}.`
				: 'Klaidų padaryta nedaug ir vieno vyraujančio klaidų tipo nenustatyta.';
		}
		if (!recurring.length) return named.length ? 'Klaidos pavienės – pasikartojančių klaidų nepastebėta.' : '';
		if (!standsOut) return 'Klaidų pasitaikė įvairių – vieno vyraujančio klaidų tipo nenustatyta.';
		return `Dažniausiai klystama ${joinAreas(said.map(i => i.area))}.`;
	}
	// Mažas: the changes found - mistakes and answering speed (one kind of task practised: without its name again)
	function shortTrends(f) {
		const tr = trendSentences(f, false);
		const oneKind = Boolean(f.onlySet) || (f.focus && f.focus.fine && f.focus.fine.length === 1);
		return tr.sentences.map(t => !oneKind || /^Klaidų /.test(t) ? t
			: t.replace(/^.*? klaidų dažnis /, 'Klaidų dažnis ').replace(/^.*? atlikimo greitis /, 'Atlikimo greitis '));
	}
	/* Mažas: fewer repeated words - where both approved words fit, "užduotims" / "veiksmams" and "užduotyse" / "veiksmuose"
	 * (after an operation: "sudėties ir atimties užduotims" → "… veiksmams"; "užduotyse su nežinomu dėmeniu"), the one less
	 * used around it is picked: the same sentence (counted twice) and the ones just before and after; a tie keeps the word. */
	const VARY_SWAP = { 'užduotims': 'veiksmams', 'veiksmams': 'užduotims', 'užduotyse': 'veiksmuose', 'veiksmuose': 'užduotyse' };
	function varyWords(text) {
		const WORD = /(^|[^\p{L}])(užduo\p{L}*|veiksm\p{L}*)/giu;
		const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZĄČĘĖĮŠŲŪŽ0-9])/u);
		const words = sentences.map(t => [...t.matchAll(WORD)].map(m => ({ at: m.index + m[1].length, word: m[2], before: t.slice(0, m.index + m[1].length) })));
		const root = w => (/^užduo/i.test(w) ? 'U' : 'V');
		words.forEach((list, si) => list.forEach((w, wi) => {
			const swap = VARY_SWAP[w.word];
			if (!swap) return;
			const after = sentences[si].slice(w.at + w.word.length);
			const fits = /(?:sudėties|atimties|daugybos|dalybos) $/.test(w.before) || (/^(užduotyse|veiksmuose)$/.test(w.word) && /^ su nežinomu /.test(after));
			if (!fits) return;
			const weight = { U: 0, V: 0 };
			[si - 1, si + 1].forEach(i => (words[i] || []).forEach(x => { weight[root(x.word)] += 1; }));
			list.forEach((x, i) => { if (i !== wi) weight[root(x.word)] += 2; });
			if (weight[root(w.word)] > weight[root(swap)]) w.word = swap;
		}));
		return sentences.map((t, si) => {
			let out = '', from = 0;
			words[si].forEach(w => { out += t.slice(from, w.at) + w.word; from = w.at + t.slice(w.at).match(/^\p{L}+/u)[0].length; });
			return out + t.slice(from);
		}).join(' ');
	}
	// the class overview's Mažas: who practised, how long and how often, who chose the tasks, lateness, what, the mistakes, changes
	function classShortSummary(f) {
		const out = [];
		const periodDays = dayNumber(f.to) - dayNumber(f.from) + 1;
		const lead = periodDays === 1 ? periodText(f.from, f.to) : periodLead(f);
		if (f.classStats) out.push(`${lead} ${TASKS_OF[f.subject].toLowerCase()} ${classPractice(f, false, true).text}`.replace(/\.\.$/, '.'));
		const kinds = shortKinds(f);
		if (kinds) out.push(kinds);
		const o = f.classOnTime;
		if (o && o.late >= 2 && o.late / o.n >= 0.1) out.push('Dalis mokytojo skirtų užduočių neatlikta laiku.');
		const focus = focusText(f);
		if (focus) out.push(focus);
		const mistakes = shortMistakes(f, focus);
		if (mistakes) out.push(mistakes);
		out.push(...shortTrends(f));
		return varyWords(out.join(' ').replace(/vidutiniškai (beveik kasdien|kasdien)/g, '$1'));
	}
	function shortSummary(f) {
		const out = [];
		const periodDays = dayNumber(f.to) - dayNumber(f.from) + 1;
		const lead = periodDays === 1 ? periodText(f.from, f.to) : periodLead(f);
		// how much and how often: one frequency in the same sentence; phases (or irregular practice) in one of their own
		const how = periodDays < 7 ? '' : regularity(f, false);
		const single = how && /^mokytasi (?!nereguliariai)/.test(how) && !/ iki |, o nuo | d\./.test(how);
		const myDays = new Set(f.dates).size;
		const shortOften = periodDays > 1 && periodDays < 7 ? `, mokytasi ${count(myDays, ['dieną', 'dienas', 'dienų'])} iš ${periodDays}` : '';
		const amount = f.minutes > 0 ? `${DATIVE[f.subject]} skirta ${minutesText(f.minutes)}` : `${form(f.n, W.done)} ${count(f.n, [`${SUBJECTS[f.subject].gen} užduotis`, `${SUBJECTS[f.subject].gen} užduotys`, `${SUBJECTS[f.subject].gen} užduočių`])}`;
		out.push(`${lead} ${amount}${single ? `, ${how}` : shortOften}.`.replace(/\.\.$/, '.').replace(/\. ,/, ',').replace(/val\.,/, 'val.,'));
		if (how && !single) out.push(`${cap(how)}.`);
		const kinds = shortKinds(f);
		if (kinds) out.push(kinds);
		const late = shortLate(f);
		if (late) out.push(late);
		const focus = focusText(f);
		if (focus) out.push(focus);
		// (the one comparison with the class said here: tasks clearly easier than the class's)
		if (f.peers && f.peers.difficulty === 'less') { const cmp = peerParts(f, false); if (cmp && cmp.difficulty) out.push(cmp.difficulty); }
		const mistakes = shortMistakes(f, focus);
		if (mistakes) out.push(mistakes);
		// the changes found (mistakes - overall, per task set, per kind of mistake - and the answering speed; only changes,
		// never the speed itself); one kind of task practised: its name is said above - "Klaidų dažnis sumažėjo 40%"
		out.push(...shortTrends(f));
		return varyWords(out.join(' ').replace(/vidutiniškai (beveik kasdien|kasdien)/g, '$1'));
	}

	// ---------------------------------------------------------------- card and mistake views
	function injectStyle() {
		if (document.getElementById('sud-insights-style')) return;
		const style = document.createElement('style');
		style.id = 'sud-insights-style';
		style.textContent = `
.ins-busy{opacity:.45;pointer-events:none;transition:opacity .15s}
.ins-card{margin:0 0 14px;padding:12px 14px 14px;border-radius:14px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.65);color:#1f2a30;font-size:14.5px;line-height:1.5;text-align:left}
.ins-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.ins-title{font-size:15px;font-weight:600;color:#1d566e}
.ins-head .ti{font-size:18px;color:#1d566e}
.ins-chip{padding:2px 8px;border-radius:999px;background:rgba(29,86,110,.12);color:#1d566e;font-size:12px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap}
.ins-note-wrap{position:relative;display:inline-flex}
.ins-note{width:18px;height:18px;padding:0;border:0;border-radius:50%;background:rgba(29,86,110,.14);color:#1d566e;font-family:inherit;font-size:12px;font-weight:600;line-height:18px;cursor:pointer;-webkit-user-select:none;user-select:none}
.ins-note::before{content:'?'}
.ins-note:hover,.ins-note[aria-expanded="true"]{background:#1d566e;color:#fff}
.ins-note-pop{position:absolute;top:24px;left:-8px;z-index:20;width:min(300px,70vw);padding:9px 11px;border-radius:10px;background:#fff;color:#1f2a30;box-shadow:0 6px 18px rgba(0,0,0,.15);font-size:13.5px;font-weight:400;line-height:1.45;-webkit-user-select:none;user-select:none}
.ins-note-pop[hidden]{display:none}
.ins-copy{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;margin:-4px 0;padding:0;border:0;border-radius:8px;background:transparent;color:#7b8c95;font-size:15px;cursor:pointer;transition:background .15s,color .15s}.ins-copy:hover{background:rgba(40,109,138,.1);color:#1d566e}.ins-copy.done{color:#2f9e7f}
.ins-detail{margin-left:auto;display:inline-flex;align-items:center;gap:10px;color:#3c4f59;font-size:13.5px;white-space:nowrap}
.ins-dots{position:relative;display:inline-flex;align-items:center;gap:13px;padding:0 1px}
.ins-dots::before{content:'';position:absolute;left:4px;right:7px;top:50%;height:2px;margin-top:-1px;border-radius:2px;background:#c6d0d5}
.ins-dot{position:relative;z-index:1;flex:none;padding:0;border:none;border-radius:50%;background:#c6d0d5;cursor:pointer;transition:background .2s,box-shadow .2s,transform .15s}
.ins-dot::after{content:'';position:absolute;inset:-7px;border-radius:50%}
.ins-dot.d0{width:9px;height:9px}
.ins-dot.d1{width:13px;height:13px}
.ins-dot.d2{width:17px;height:17px}
.ins-dot:hover{transform:scale(1.15);background:#a9b8bf}
.ins-dot.on{background:linear-gradient(135deg,#3288AC,#1d566e);box-shadow:0 0 0 3px rgba(50,136,172,.22)}
.ins-dot.on:hover{transform:none}
.ins-dot:focus-visible{outline:2px solid #1d566e;outline-offset:3px}
.ins-body{cursor:text}
.ins-body,.ins-body *{-webkit-user-select:text;user-select:text}
.ins-p{margin:0 0 8px}
.ins-date{margin:0 0 6px;font-weight:600;color:#1d566e}
.ins-h{margin:10px 0 2px;font-size:12.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#5f7f8c}
.ins-h2{margin:4px 0 1px;font-size:13px;font-weight:600;color:#1d566e}
.ins-p:last-child{margin-bottom:0}
.ins-ol{margin:0 0 8px;padding-left:24px}
.ins-ol li{margin:1px 0}
.ins-sub{margin:1px 0 3px;padding-left:20px;list-style:disc}
.ins-sub .ins-sub{list-style:circle}
.ins-sub li{margin:0}
.ins-sub[hidden]{display:none}
.ins-chart-btn{cursor:pointer;border-bottom:1px dashed rgba(29,86,110,.45)}
.ins-chart-btn::after{content:'';display:inline-block;width:11px;height:9px;margin-left:5px;vertical-align:1px;background:linear-gradient(#5f7f8c,#5f7f8c) 0 100%/3px 45% no-repeat,linear-gradient(#5f7f8c,#5f7f8c) 4px 100%/3px 100% no-repeat,linear-gradient(#5f7f8c,#5f7f8c) 8px 100%/3px 70% no-repeat}
.ins-chart-btn:hover{color:#1d566e;border-bottom-color:#1d566e}
.ins-chart-btn.ins-list-btn::after{display:none}
.ins-chart-btn:focus-visible{outline:2px solid #1d566e;outline-offset:2px;border-radius:3px}
.ins-chart-back{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,32,38,.45)}
.ins-chart-box{position:relative;width:min(760px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:16px 18px 14px;border-radius:14px;background:#fff;color:#1f2a30;box-shadow:0 12px 40px rgba(0,0,0,.25);text-align:left}
.ins-chart-title{margin:0 34px 2px 0;font-size:15px;font-weight:600;color:#1d566e;line-height:1.35}
.ins-chart-sub{margin:0 34px 10px 0;font-size:13px;color:#3c4f59;line-height:1.4}
.ins-chart-x{position:absolute;top:10px;right:10px;width:30px;height:30px;padding:0;border:0;border-radius:50%;background:rgba(29,86,110,.1);color:#1d566e;font:inherit;font-size:19px;line-height:30px;cursor:pointer}
.ins-chart-x:hover{background:#1d566e;color:#fff}
.ins-chart-wrap{position:relative;height:320px}
.ins-chart-key{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:8px;font-size:13px;color:#3c4f59}
.ins-chart-key span{display:inline-flex;align-items:center;gap:6px}
.ins-chart-key i{display:inline-block;flex:none}
.ins-chart-note{margin:6px 0 0;font-size:12.5px;color:#5f7f8c;line-height:1.4}
/* (only the list scrolls: the title, the key, the two ends with the strip between them and the note stay in view) */
.ins-mix-box{display:flex;flex-direction:column;overflow:hidden;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px)}
.ins-mix-box>*{flex:none}
.ins-mix-box>.ins-mix{flex:0 1 auto}
.ins-mix{position:relative;margin:10px 0 2px;padding-left:16px;display:flex;flex-direction:column;flex:0 1 auto;min-height:0}
.ins-mix::before{content:'';position:absolute;left:3px;top:4px;bottom:4px;width:4px;border-radius:2px;background:linear-gradient(#c6d0d5,#3c4f59)}
.ins-mix-end{display:block;font-size:11.5px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#5f7f8c}
.ins-mix-list{list-style:none;margin:4px 0;padding:0 6px 0 0;flex:0 1 auto;min-height:72px;overflow-y:auto;overscroll-behavior:contain;border-top:1px solid rgba(0,0,0,.08);border-bottom:1px solid rgba(0,0,0,.08)}
.ins-mix-list:focus-visible{outline:2px solid #1d566e;outline-offset:2px}
.ins-mix-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(90px,34%);gap:1px 12px;align-items:center;padding:6px 0;border-top:1px solid rgba(0,0,0,.06)}
.ins-mix-row:first-child{border-top:0}
.ins-mix-label{grid-row:span 2;font-size:13.5px;line-height:1.3;color:#1f2a30}
.ins-mix-other .ins-mix-label{color:#5f7f8c}
.ins-mix-bar{display:flex;align-items:center;gap:6px;font-size:12px;line-height:1.25}
.ins-mix-bar i{display:block;height:8px;border-radius:4px}
.ins-mix-bar b{font-weight:600;white-space:nowrap}
.ins-mix .m,.ins-mix-dot.m{background:rgb(35,134,111)}
.ins-mix .c,.ins-mix-dot.c{background:rgb(95,127,140)}
.ins-mix-bar:has(.m) b{color:rgb(35,134,111)}
.ins-mix-bar:has(.c) b{color:rgb(95,127,140)}
.ins-mix-dot{display:inline-block;width:10px;height:10px;border-radius:50%}
@media (max-width:560px){.ins-mix-row{grid-template-columns:1fr}.ins-mix-label{grid-row:auto}}
@media (max-width:560px){.ins-chart-wrap{height:250px}.ins-chart-box{padding:14px 12px 12px}}
.ins-more-btn{cursor:pointer;border-bottom:1px dashed rgba(29,86,110,.45)}
.ins-more-btn::after{content:'';display:inline-block;width:0;height:0;margin:0 1px 2px 6px;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid #5f7f8c;transition:transform .15s}
.ins-more-btn[aria-expanded="true"]::after{transform:rotate(180deg)}
.ins-more-btn:hover{color:#1d566e;border-bottom-color:#1d566e}
.ins-more-btn:focus-visible{outline:2px solid #1d566e;outline-offset:2px;border-radius:3px}
.ins-muted{color:#3c4f59}
.ins-hidden{display:none!important}
.ins-loading{display:flex;justify-content:center;padding:14px 0}
.ins-spinner{width:36px;height:36px;border:4px solid rgba(50,172,147,.2);border-top-color:#32ac93;border-radius:50%;animation:ins-spin .8s linear infinite}
@keyframes ins-spin{to{transform:rotate(360deg)}}
.ins-mv{margin:16px 0 8px}
.ins-tabs{display:inline-flex;gap:4px;padding:3px;margin-bottom:10px;border-radius:10px;background:rgba(31,42,48,.08)}
.ins-tab{padding:6px 12px;border:0;border-radius:8px;background:transparent;color:#3c4f59;font:inherit;font-size:14px;font-weight:500;cursor:pointer}
.ins-tab.on{background:#fff;color:#1d566e;box-shadow:0 1px 2px rgba(0,0,0,.08)}
.ins-pats{display:flex;flex-direction:column;gap:6px}
.ins-pats[hidden]{display:none}
.ins-pat{border-radius:10px;background:rgba(255,255,255,.62)}
.ins-pat-head{display:block;width:100%;padding:8px 10px;border:0;background:none;color:#1f2a30;font:inherit;text-align:left;cursor:pointer;border-radius:10px}
.ins-pat-head:hover{background:rgba(255,255,255,.5)}
.ins-pl{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
.ins-pn{font-weight:600}
.ins-pnote{margin:1px 0 0 14px;font-size:12.5px;line-height:1.35;color:#7b8f98;font-weight:400}
.ins-pn::before{content:'›';display:inline-block;width:14px;color:#1d566e;transition:transform .15s}
.ins-pat.open .ins-pn::before{transform:rotate(90deg)}
.ins-pc{color:#3c4f59;font-size:13.5px;text-align:right;flex:0 1 auto;cursor:help}
.ins-pc{position:relative}
.ins-meter{display:inline-block;width:46px;height:5px;border-radius:3px;background:rgba(29,86,110,.12);vertical-align:middle;cursor:pointer;overflow:hidden;opacity:.85}
.ins-meter i{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#3288AC,#1d566e)}
.ins-meter:hover,.ins-meter:focus-visible{opacity:1;outline:none;box-shadow:0 0 0 3px rgba(50,136,172,.18)}

.ins-ex{margin-top:3px;padding-left:14px;display:flex;flex-wrap:wrap;gap:4px 12px;font-size:14px}
.ins-ex b{font-weight:700}
.ins-bad{color:#a8322b}
.ins-bad b{text-decoration:underline}
.ins-good b{color:#1f7a45}
.ins-tip{margin-top:3px;padding-left:14px;color:#3c4f59;font-size:13.5px}
.ins-pat-body{padding:4px 10px 10px}
.ins-pat-body table tr>:nth-child(3),.ins-pat-body .mt-head>:nth-child(3),.ins-pat-body .mt-line>:nth-child(3){display:none!important}
.word-wrong-answers{color:#1f2a30;font-weight:400}
.word-wrong-answers .wa{color:#c0605a}
.clickable-word,.clickable-word *{text-decoration:none!important}
.sentence-occurrence .answered-word{padding:0 2px;border-radius:3px;background:rgba(255,214,102,.35);font-weight:inherit}
`;
		document.head.appendChild(style);
	}
	function wordHtml(b, mid, s, cls) {
		return `<span class="${cls}">${esc(b)}<b>${esc(mid)}</b>${esc(s)}</span>`;
	}

	// notes shown behind the card's "?" button (not part of the copied text)
	function notesFor(f) {
		const notes = [];
		const included = f.kindsIncluded ? new Set(f.kindsIncluded) : null;
		if (f.selfOffered && included && !included.has('self')) {
			notes.push('Vertinamos tik mokytojo skirtos užduotys. Savarankiško mokymosi rezultatus galite įtraukti analizės nustatymuose (meniu „Įrašų tipai“).');
		}
		return notes;
	}

	// "Detalumas": mažas / vidutinis / didelis - one choice for every card, remembered in this browser (didelis: with the
	// numbers and examples; vidutinis and mažas: for now both without them)
	const DETAIL_LEVELS = [['low', 'Mažas'], ['medium', 'Vidutinis'], ['high', 'Didelis']];
	let detailLevel = 'medium';
	try {
		const saved = localStorage.getItem('sudInsightsDetailLevel');
		if (DETAIL_LEVELS.some(([k]) => k === saved)) detailLevel = saved;
	} catch (e) {}
	const cards = new Set();   // the cards on the page (to redraw their text when the choice changes)
	// three dots on a line, growing from mažas to didelis; the chosen one filled (a radio group: click, or the arrow keys)
	function detailToggleHtml() {
		const dots = DETAIL_LEVELS.map(([k, name], i) => `<button type="button" class="ins-dot d${i}${k === detailLevel ? ' on' : ''}" role="radio" aria-checked="${k === detailLevel}" aria-label="${name}" title="${name}" tabindex="${k === detailLevel ? 0 : -1}" data-level="${k}"></button>`).join('');
		return `<div class="ins-detail"><span class="ins-detail-label">Detalumas</span><div class="ins-dots" role="radiogroup" aria-label="Detalumas">${dots}</div></div>`;
	}
	function cardHtml(bodyHtml, withSwitch, notes = [], copyable = false) {
		const noteHtml = notes.length
			? `<span class="ins-note-wrap"><button type="button" class="ins-note" aria-label="Pastaba" aria-expanded="false"></button><span class="ins-note-pop" hidden>${notes.map(esc).join('<br>')}</span></span>`
			: '';
		return `<div class="ins-card">
			<div class="ins-head"><i class="ti ti-sparkles" aria-hidden="true"></i><span class="ins-title">Apibendrinimas</span><span class="ins-chip" title="Apibendrinimas dar tobulinamas - jame gali pasitaikyti netikslumų.">Bandomoji versija</span>${copyable ? '<button type="button" class="ins-copy" title="Kopijuoti apibendrinimą" aria-label="Kopijuoti apibendrinimą"><i class="ti ti-copy" aria-hidden="true"></i></button>' : ''}${noteHtml}
				${withSwitch ? detailToggleHtml() : ''}
			</div>
			<div class="ins-body">${bodyHtml}</div>
		</div>`;
	}
	function treeHtml(nodes, top, rest) {
		const line = n => {
			const leaves = n.children.length && n.children.every(c => !c.children.length) && n.children.length <= 4;
			const inline = leaves ? `: ${n.children.map(c => `${c.label} (${pct(c.share)})`).join('; ')}` : '';
			const nested = n.children.length && !leaves ? treeHtml(n.children, false) : '';
			return `<li>${esc(n.label)} (${esc(n.each ? 'po ' + pct(n.each) : pct(n.share))})${esc(inline)}${nested}</li>`;
		};
		// ("Kitos užduotys (12%)": copied as it is; a click opens the areas in it)
		const more = rest ? `<li class="ins-more"><span class="ins-more-btn" role="button" tabindex="0" aria-expanded="false">${esc(rest.label)}</span> (${esc(pct(rest.share))})${treeHtml(rest.nodes, false).replace('<ul class="ins-sub">', '<ul class="ins-sub" hidden>')}</li>` : '';
		return top ? `<ol class="ins-ol ins-tree">${nodes.map(line).join('')}${more}</ol>` : `<ul class="ins-sub">${nodes.map(line).join('')}</ul>`;
	}
	// the words of a stated change as a button that opens its graph (the text copies as it is)
	function linked(html, links) {
		(links || []).forEach(l => {
			const words = esc(l.text);
			const from = l.after ? Math.max(0, html.indexOf(esc(l.after))) : 0;
			const at = html.indexOf(words, from);
			if (at < 0) return;
			html = html.slice(0, at) + `<span class="ins-chart-btn${l.list ? ' ins-list-btn' : ''}" role="button" tabindex="0" data-key="${esc(l.key)}" title="${l.list ? 'Rodyti užduotis' : 'Rodyti grafiką'}">${words}</span>` + html.slice(at + words.length);
		});
		return html;
	}
	function blocksHtml(blocks) {
		return blocks.map(b => b.date ? `<p class="ins-date">${esc(b.date)}</p>`
			: b.tree ? treeHtml(b.tree, true, b.rest)
			: b.h ? `<p class="ins-h">${esc(b.h)}</p>`
			: b.h2 ? `<p class="ins-h2">${esc(b.h2)}</p>`
			: b.ol ? `<ol class="ins-ol">${b.ol.map(item => `<li>${esc(item)}</li>`).join('')}</ol>`
			: `<p class="ins-p">${linked(esc(b.p.replace(/\.\.(?!\.)/g, '.')), b.links)}</p>`).join('');   // ("min." at a sentence end)
	}
	function drawCard(el) {
		const f = el._insFacts;
		if (!f) { el.innerHTML = ''; return; }
		if (!f.n) { el.innerHTML = cardHtml('<p class="ins-p ins-muted">Šioje srityje pagal pasirinktus nustatymus užduočių nebuvo atlikta.</p>', false); return; }
		// (one task: one version, with all its details - no toggle)
		const single = f.mode === 'task';
		el.innerHTML = cardHtml(blocksHtml(describe(f, { detail: single ? 'high' : detailLevel })), !single, notesFor(f), !single && detailLevel === 'low');
		// Mažas: the paragraph copied as plain text (for the records), the icon a check for a moment
		el.querySelector('.ins-copy')?.addEventListener('click', async event => {
			const btn = event.currentTarget;
			const text = (el.querySelector('.ins-body')?.innerText || '').replace(/\s+/g, ' ').trim();
			let ok = false;
			try { await navigator.clipboard.writeText(text); ok = true; } catch (_) {
				const area = document.createElement('textarea');
				area.value = text; area.style.position = 'fixed'; area.style.opacity = '0';
				document.body.appendChild(area); area.select();
				try { ok = document.execCommand('copy'); } catch (__) { ok = false; }
				area.remove();
			}
			if (!ok) return;
			btn.classList.add('done');
			btn.title = 'Nukopijuota';
			btn.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i>';
			setTimeout(() => { btn.classList.remove('done'); btn.title = 'Kopijuoti apibendrinimą'; btn.innerHTML = '<i class="ti ti-copy" aria-hidden="true"></i>'; }, 1500);
		});
		el.querySelectorAll('.ins-chart-btn').forEach(btn => {
			btn.addEventListener('click', () => openChart(f, btn.dataset.key, btn));
			btn.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openChart(f, btn.dataset.key, btn); } });
		});
		el.querySelectorAll('.ins-more-btn').forEach(btn => {
			const toggle = () => {
				const list = btn.parentElement.querySelector('.ins-sub');
				list.hidden = !list.hidden;
				btn.setAttribute('aria-expanded', list.hidden ? 'false' : 'true');
			};
			btn.addEventListener('click', toggle);
			btn.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); } });
		});
		const note = el.querySelector('.ins-note');
		if (note) note.addEventListener('click', event => {
			event.stopPropagation();
			const pop = note.nextElementSibling;
			pop.hidden = !pop.hidden;
			note.setAttribute('aria-expanded', pop.hidden ? 'false' : 'true');
			if (!pop.hidden) document.addEventListener('click', function close(e) {
				if (!pop.contains(e.target)) { pop.hidden = true; note.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', close); }
			});
		});
		const setLevel = i => {
			detailLevel = DETAIL_LEVELS[Math.max(0, Math.min(2, i))][0];
			try { localStorage.setItem('sudInsightsDetailLevel', detailLevel); } catch (e) {}
			cards.forEach(card => { if (card.isConnected) drawCard(card); else cards.delete(card); });
			el.querySelector('.ins-dot.on')?.focus();
		};
		el.querySelectorAll('.ins-dot').forEach((dot, i) => dot.addEventListener('click', () => { if (dot.dataset.level !== detailLevel) setLevel(i); }));
		el.querySelector('.ins-dots')?.addEventListener('keydown', event => {
			const i = DETAIL_LEVELS.findIndex(([k]) => k === detailLevel);
			const next = { ArrowLeft: i - 1, ArrowDown: i - 1, ArrowRight: i + 1, ArrowUp: i + 1, Home: 0, End: 2 }[event.key];
			if (next == null) return;
			event.preventDefault();
			if (next >= 0 && next <= 2 && next !== i) setLevel(next);
		});
	}

	/* The graph of a change in Tendencijos: the two groups the change is measured between (the start and the end of the
	 * period) - one circle per day (its area by the answers, its fill by the mistakes) - and each group's level (the text's
	 * numbers), on a time axis over the selected period. Chart.js (on the page, or loaded). */
	const MONTHS_SHORT = ['saus.', 'vas.', 'kov.', 'bal.', 'geg.', 'birž.', 'liep.', 'rugp.', 'rugs.', 'spal.', 'lapkr.', 'gruod.'];
	const dayDate = day => new Date(day * 86400000);
	const dayLabel = day => { const d = dayDate(day); return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`; };
	function loadChartJs() {
		if (window.Chart) return Promise.resolve(window.Chart);
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
			script.onload = () => window.Chart ? resolve(window.Chart) : reject(new Error('no Chart'));
			script.onerror = reject;
			document.head.appendChild(script);
		});
	}
	function openChart(f, key, opener) {
		if (key === 'outliers') { if (typeof f.openTasks === 'function') f.openTasks(f.outliers.map(o => o.source).filter(Boolean), { subject: f.subject }); return; }
		if (/^peer(pat)?:/.test(key)) { openPeerChart(f, key, opener); return; }
		const c = (f.changes || []).find(x => x.key === key);
		if (!c) return;
		const S = SUBJECTS[f.subject], t = c.test;
		const isSpeed = c.metric === 'speed', isPattern = c.metric === 'pattern';
		const COLOR = isSpeed ? '47,127,209' : '217,83,79';
		// (texts' speed in minutes per text: the inverse of texts per minute)
		const inverse = isSpeed && f.perText;
		const scale = isPattern ? 100 : isSpeed ? 1 : (f.perText ? 1 : 100);
		const label = isSpeed ? (f.perText ? 'Minutės vienam tekstui' : `${cap(S.unit[2])} per minutę`)
			: isPattern ? 'Klaidos, % atvejų' : (f.perText ? 'Klaidos vienam tekstui' : `Klaidos ${PER_100[f.subject]}`);
		const said = c.group === 'overall' ? (isSpeed ? 'Bendras užduočių atlikimo greitis' : 'Bendras klaidų dažnis analogiškose užduotyse')
			: c.group === 'set' ? `${isSpeed ? 'Atlikimo greitis' : 'Klaidų dažnis'} ${c.phrase ? c.phrase.replace(/,$/, '') : `užduotyse „${c.label}“`}` : `Klaidos ${c.label}`;
		const from = dayNumber(f.from), to = dayNumber(f.to);
		const longDay = day => new Intl.DateTimeFormat('lt-LT', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(dayDate(day));
		/* one circle per day for the tasks the comparison uses (in the two groups, of kinds both groups have), and a grey
		 * one for that day's other tasks (between the groups, or of a kind the other group lacks) - every task is shown */
		const perDay = used => {
			const byDay = new Map();
			t.all.filter(b => b.used === used).forEach(b => { const d = byDay.get(b.x) || { day: b.x, y: 0, e: 0 }; d.y += b.y; d.e += b.e; byDay.set(b.x, d); });
			return [...byDay.values()].filter(d => d.e > 0 && (!inverse || d.y > 0)).sort((a, b) => a.day - b.day);
		};
		const days = perDay(true);
		// (the tasks between the two groups: grey, not part of the comparison)
		const others = (() => {
			const byDay = new Map();
			t.all.filter(b => !b.used && b.x > t.windows[0][1] && b.x < t.windows[1][0]).forEach(b => { const d = byDay.get(b.x) || { day: b.x, y: 0, e: 0 }; d.y += b.y; d.e += b.e; byDay.set(b.x, d); });
			return [...byDay.values()].filter(d => d.e > 0 && (!inverse || d.y > 0)).sort((a, b) => a.day - b.day);
		})();
		const valueOf = d => (inverse ? d.e / d.y : d.y / d.e * scale);
		const levelOf = v => (inverse ? 1 / v : v * scale);
		// (the size: the day's answers - for speed the counted ones; for a pattern its chances)
		const sizeOf = d => (isSpeed ? d.y : d.e);
		const sizeWord = isSpeed || !isPattern ? S.unit[2] : 'galimų atvejų';
		const unitGen = n => Math.round(n) % 10 === 1 && Math.round(n) % 100 !== 11 ? S.unit[3] : S.unit[2];
		const note = `Apskritimas – tos dienos užduotys: kuo didesnis, tuo daugiau ${sizeWord}`
			+ (isSpeed ? '.' : '; kuo ryškesnis, tuo daugiau klaidų (be klaidų – tuščias).')
			+ ` Užduotys automatiškai suskirstytos į dvi grupes – laikotarpio pradžios ir pabaigos – pagal kurias nustatomas ${isSpeed ? 'atlikimo greičio' : 'klaidų dažnio'} pokytis${others.length ? '; pilki apskritimai – užduotys tarp grupių, į palyginimą neįtrauktos' : ''}.`
			+ ` Linijos – kiekvienos grupės vidurkis (${isSpeed ? (f.perText ? 'jos minučių ir tekstų' : `jos ${S.unit[2]} ir minučių`) : isPattern ? 'jos klaidų ir galimų atvejų' : `jos klaidų ir ${S.unit[2]}`} santykis).`;
		const back = document.createElement('div');
		back.className = 'ins-chart-back';
		back.innerHTML = `<div class="ins-chart-box" role="dialog" aria-modal="true" aria-label="${esc(said)}">
			<button type="button" class="ins-chart-x" aria-label="Uždaryti">×</button>
			<p class="ins-chart-title">${esc(said)}</p>
			<p class="ins-chart-sub">${esc(periodText(f.from, f.to))}</p>
			<div class="ins-chart-wrap"><canvas></canvas></div>
			<div class="ins-chart-key"><span><i style="width:11px;height:11px;border-radius:50%;border:1.5px solid rgb(${COLOR});background:rgba(${COLOR},0.45)"></i>Tos dienos užduotys</span><span><i style="width:14px;height:11px;border-radius:2px;background:rgba(${COLOR},0.12)"></i>Grupė</span><span><i style="width:20px;height:0;border-top:3px solid rgb(${COLOR})"></i>Grupės vidurkis</span></div>
			<p class="ins-chart-note">${esc(note)}</p>
		</div>`;
		document.body.appendChild(back);
		const close = () => {
			if (back._chart) back._chart.destroy();
			back.remove();
			document.removeEventListener('keydown', onKey);
			if (opener && opener.isConnected) opener.focus();
		};
		const onKey = event => { if (event.key === 'Escape') close(); };
		document.addEventListener('keydown', onKey);
		back.addEventListener('click', event => { if (event.target === back) close(); });
		back.querySelector('.ins-chart-x').addEventListener('click', close);
		back.querySelector('.ins-chart-x').focus();
		const narrow = () => back.querySelector('.ins-chart-wrap').clientWidth < 480;
		// the circle's area in proportion to its size (smaller when there are many days); the fill by the mistakes (none: empty)
		const every = days.concat(others);
		const maxSize = Math.max(1, ...every.map(sizeOf));
		const maxMistakes = Math.max(1, ...every.map(d => (isSpeed ? 0 : d.y)));
		const nDays = new Set(every.map(d => d.day)).size;
		const radius = d => Math.max(2, (narrow() ? 11 : 14) * Math.min(1, Math.sqrt(30 / Math.max(30, nDays))) * Math.sqrt(sizeOf(d) / maxSize));
		const fill = d => (isSpeed ? `rgba(${COLOR},0.45)` : d.y > 0 ? `rgba(${COLOR},${(0.2 + 0.75 * d.y / maxMistakes).toFixed(2)})` : 'rgba(255,255,255,0.95)');
		const pts = days.map(d => ({ x: d.day, y: valueOf(d), d }));
		// the two groups' levels over their own days
		const levels = [{ a: t.windows[0][0], b: t.windows[0][1], y: levelOf(t.early) }, { a: t.windows[1][0], b: t.windows[1][1], y: levelOf(t.late) }];
		const greyPts = others.map(d => ({ x: d.day, y: valueOf(d), d, grey: true }));
		const datasets = [{
			type: 'scatter', data: greyPts, order: 3, clip: 16,
			pointRadius: greyPts.map(p => radius(p.d)), pointHoverRadius: greyPts.map(p => radius(p.d) + 2),
			backgroundColor: greyPts.map(p => (!isSpeed && p.d.y === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(163,177,184,0.35)')), borderColor: '#a3b1b8', borderWidth: 1.2
		}, {
			type: 'scatter', data: pts, order: 2, clip: 16,
			pointRadius: pts.map(p => radius(p.d)), pointHoverRadius: pts.map(p => radius(p.d) + 2),
			backgroundColor: pts.map(p => fill(p.d)), borderColor: `rgb(${COLOR})`, borderWidth: 1.5
		}, {
			type: 'line', order: 1, isLevel: true,
			data: [{ x: levels[0].a - 0.4, y: levels[0].y }, { x: levels[0].b + 0.4, y: levels[0].y }, { x: levels[0].b + 0.5, y: null }, { x: levels[1].a - 0.4, y: levels[1].y }, { x: levels[1].b + 0.4, y: levels[1].y }],
			borderColor: `rgb(${COLOR})`, borderWidth: 3, pointRadius: 0, pointHoverRadius: 0, spanGaps: false, tension: 0
		}];
		// the levels' values, as in the text's brackets
		const levelText = v => isSpeed ? (f.perText ? shortTime(v) : `apie ${num(v)}`) : isPattern ? `apie ${pct(v)}` : `apie ${num(round(v, f.perText ? 1 : 0))}`;
		const bands = {
			id: 'insBands',
			beforeDatasetsDraw(chart) {
				const { ctx, chartArea: area, scales: { x } } = chart;
				ctx.save();
				ctx.font = '600 11px system-ui, sans-serif';
				ctx.textBaseline = 'top';
				levels.forEach((l, i) => {
					// (a visible gap between the two groups, even when they are next to each other)
					const x0 = Math.max(area.left, x.getPixelForValue(l.a - 0.5) + (i === 1 ? 4 : 0)), x1 = Math.min(area.right, x.getPixelForValue(l.b + 0.5) - (i === 0 ? 4 : 0));
					ctx.fillStyle = `rgba(${COLOR},0.08)`;
					ctx.fillRect(x0, area.top, x1 - x0, area.bottom - area.top);
					const text = i === 0 ? 'Pradžia' : 'Pabaiga', w = ctx.measureText(text).width;
					if (x1 - x0 >= w + 6) { ctx.fillStyle = `rgba(${COLOR},0.75)`; ctx.fillText(text, x0 + (x1 - x0 - w) / 2, area.top + 3); }
				});
				ctx.restore();
			}
		};
		const levelLabels = {
			id: 'insLevelLabels',
			afterDatasetsDraw(chart) {
				const { ctx, scales: { x, y } } = chart;
				ctx.save();
				ctx.font = '600 12px system-ui, sans-serif';
				ctx.textBaseline = 'bottom';
				levels.forEach(l => {
					const text = levelText(l.y), px = Math.max(x.getPixelForValue(l.a - 0.4), x.left) + 2, py = y.getPixelForValue(l.y) - 5;
					const w = ctx.measureText(text).width;
					ctx.fillStyle = 'rgba(255,255,255,0.85)';
					ctx.fillRect(px - 2, py - 14, w + 4, 14);
					ctx.fillStyle = `rgb(${COLOR})`;
					ctx.fillText(text, px, py);
				});
				ctx.restore();
			}
		};
		// a circle's counts (the axis gives the rate)
		const main = d => {
			if (isSpeed) return f.perText ? `${num(round(d.e, 0))} min., ${count(d.y, S.unit)}` : `${count(d.y, S.unit)} per ${num(round(d.e, 1))} min.`;
			if (isPattern) return `${count(d.y, ['klaida', 'klaidos', 'klaidų', 'klaidos'])} iš ${count(round(d.e, 0), ['galimo atvejo', 'galimų atvejų', 'galimų atvejų'])}`;
			return `${count(d.y, ['klaida', 'klaidos', 'klaidų', 'klaidos'])} iš ${num(d.e)} ${unitGen(d.e)}`;
		};
		const SCALES = {
			x: {
				type: 'linear', min: from - 0.5, max: to + 0.5,
				ticks: { color: '#3c4f59', callback: v => Number.isInteger(v) ? dayLabel(v) : '' },
				afterBuildTicks: axis => {
					// (whole days, from the period's first to its last, evenly)
					const n = Math.min(narrow() ? 4 : 7, to - from + 1);
					const ticks = n < 2 ? [from] : [...new Set(Array.from({ length: n }, (_, i) => Math.round(from + (to - from) * i / (n - 1))))];
					axis.ticks = ticks.map(value => ({ value }));
				},
				grid: { color: 'rgba(0,0,0,0.05)' }, border: { display: false }
			},
			y: {
				type: 'linear', beginAtZero: true,
				title: { display: !narrow(), text: label, color: `rgb(${COLOR})`, font: { size: 12, weight: '600' } },
				ticks: { color: `rgb(${COLOR})`, maxTicksLimit: 6, callback: v => num(v) },
				grid: { color: 'rgba(0,0,0,0.07)' }, border: { display: false }
			}
		};
		loadChartJs().then(Chart => {
			if (!back.isConnected) return;
			back._chart = new Chart(back.querySelector('canvas').getContext('2d'), {
				data: { datasets },
				plugins: [bands, levelLabels],
				options: {
					responsive: true, maintainAspectRatio: false, animation: false,
					layout: { padding: { top: 8, right: 8 } },
					interaction: { mode: 'nearest', intersect: true },
					plugins: {
						legend: { display: false },
						tooltip: {
							filter: item => !item.dataset.isLevel,
							callbacks: {
								title: items => items.length ? longDay(items[0].raw.x) : '',
								// (the counts themselves - the axis gives the rate)
								label: item => {
									const d = item.raw.d;
									const tail = item.raw.grey ? ' – į palyginimą neįtraukta' : '';
									return main(d) + tail;
								}
							}
						}
					},
					scales: SCALES
				}
			});
		}).catch(() => {
			back.querySelector('.ins-chart-wrap').innerHTML = '<p class="ins-chart-note">Grafiko nepavyko įkelti.</p>';
		});
	}

	/* The graph of a comparison with the class: for the student's tasks and the classmates' (the same kinds, on the
	 * student's mix), the value and the spread - a dot at the value said in the text, a band over the middle half of
	 * the tasks (25th-75th percentile), a thin line over 8 tasks of 10 (10th-90th) - all weighted as the text's numbers. */
	function weightedQuantile(points, q) {
		const xs = points.filter(p => isFinite(p.v) && p.w > 0).sort((a, b) => a.v - b.v);
		const W = xs.reduce((a, p) => a + p.w, 0);
		let acc = 0; for (const p of xs) { acc += p.w; if (acc >= q * W) return p.v; }
		return xs.length ? xs[xs.length - 1].v : 0;
	}
	// the mix of tasks next to the class's: per kind (easiest first) two bars - the student's share of the practice time, the
	// typical classmate's
	function openMixChart(f, opener) {
		const d = f.peers && f.peers.dist && f.peers.dist.difficulty;
		if (!d || !d.mix || !d.mix.length) return;
		const title = 'Kokios užduotys atliekamos: mokinys ir klasė';
		const top = Math.max(...d.mix.map(r => Math.max(r.mine, r.cls))) || 1;
		const bar = (v, cls) => `<span class="ins-mix-bar"><i class="${cls}" style="width:${Math.max(v > 0 ? 1.5 : 0, v / top * 100).toFixed(1)}%"></i><b>${esc(v > 0 && v < 0.5 ? '<1%' : pct(v))}</b></span>`;
		const rows = d.mix.map(r => `<li class="ins-mix-row${r.other ? ' ins-mix-other' : ''}"><span class="ins-mix-label">${esc(r.label)}</span>${bar(r.mine, 'm')}${bar(r.cls, 'c')}</li>`).join('');
		const back = document.createElement('div');
		back.className = 'ins-chart-back';
		back.innerHTML = `<div class="ins-chart-box ins-mix-box" role="dialog" aria-modal="true" aria-label="${esc(title)}">
			<button type="button" class="ins-chart-x" aria-label="Uždaryti">×</button>
			<p class="ins-chart-title">${esc(title)}</p>
			<p class="ins-chart-sub">${esc(periodText(f.from, f.to))}</p>
			<div class="ins-chart-key"><span><i class="ins-mix-dot m"></i>Mokinys</span><span><i class="ins-mix-dot c"></i>Klasė</span></div>
			<div class="ins-mix"><span class="ins-mix-end">Lengvesnės</span><ol class="ins-mix-list" tabindex="0" aria-label="Užduotys nuo lengviausių iki sudėtingiausių">${rows}</ol><span class="ins-mix-end">Sudėtingesnės</span></div>
			<p class="ins-chart-note">Procentai – kokią viso praktikos laiko dalį sudarė šios užduotys.</p>
		</div>`;
		document.body.appendChild(back);
		const close = () => { back.remove(); document.removeEventListener('keydown', onKey); if (opener && opener.isConnected) opener.focus(); };
		const onKey = event => { if (event.key === 'Escape') close(); };
		document.addEventListener('keydown', onKey);
		back.addEventListener('click', event => { if (event.target === back) close(); });
		back.querySelector('.ins-chart-x').addEventListener('click', close);
		back.querySelector('.ins-chart-x').focus();
	}
	function openPeerChart(f, key, opener) {
		if (key === 'peer:difficulty') { openMixChart(f, opener); return; }
		const S = SUBJECTS[f.subject];
		let d, title, label, unitText;
		if (key === 'peer:mistakes') { d = f.peers && f.peers.dist && f.peers.dist.mistakes; title = 'Klaidos analogiškose užduotyse: mokinys ir klasė'; label = f.perText ? 'Klaidos vienam tekstui' : `Klaidos ${PER_100[f.subject]}`; }
		else if (key === 'peer:speed') { d = f.peers && f.peers.dist && f.peers.dist.speed; title = 'Atlikimo greitis: mokinys ir klasė'; label = f.perText ? 'Minutės vienam tekstui' : `${cap(S.unit[2])} per minutę`; }
		else { const x = (f.patternPeers || []).find(y => 'peerpat:' + y.key === key); d = x && x.dist; title = x ? `Klaidos ${x.area}: mokinys ir klasė` : ''; label = 'Klaidos, % atvejų'; }
		if (!d || !d.mine.length || !d.cls.length) return;
		// (the site's teal for the student, its slate grey for the class: red and blue already mean mistakes and speed)
		const rowsOf = [
			{ name: 'Mokinys', pts: d.mine, mid: d.mineMean, color: '35,134,111', n: d.mine.length },
			{ name: 'Klasė', pts: d.cls, mid: d.clsMean, color: '95,127,140', n: d.cls.length }
		].map(r => ({ ...r, q10: weightedQuantile(r.pts, 0.1), q25: weightedQuantile(r.pts, 0.25), q75: weightedQuantile(r.pts, 0.75), q90: weightedQuantile(r.pts, 0.9) }));
		const fmt = v => (key === 'peer:speed' && f.perText ? shortTime(v).replace(/^apie /, '') : num(round(v, v < 10 ? 1 : 0)));
		// the axis: from 0 to a round number above both rows
		const hi = Math.max(...rowsOf.map(r => Math.max(r.q90, r.mid || 0))) * 1.1 || 1;
		const maxTicks = (window.innerWidth || 640) < 480 ? 4 : 6;
		const step = [1, 2, 2.5, 5, 10, 20, 25, 50, 100].find(st => hi / st <= maxTicks) || Math.ceil(hi / maxTicks);
		const top = Math.ceil(hi / step) * step;
		// (drawn at the screen's width - on a phone the labels keep their size; fewer ticks when narrow)
		const W = Math.max(280, Math.min(640, (window.innerWidth || 640) - 72)), L = W < 420 ? 70 : 86, R = 18, Hrow = 58, T = 18, H = T + rowsOf.length * Hrow + 40;
		const X = v => L + (W - L - R) * Math.max(0, Math.min(1, v / top));
		let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(title)}" style="display:block;font-family:inherit">`;
		for (let v = 0; v <= top + 1e-9; v += step) {
			svg += `<line x1="${X(v)}" x2="${X(v)}" y1="${T - 6}" y2="${T + rowsOf.length * Hrow}" stroke="rgba(0,0,0,0.07)"/>`;
			svg += `<text x="${X(v)}" y="${T + rowsOf.length * Hrow + 16}" text-anchor="middle" font-size="12" fill="#3c4f59">${esc(num(round(v, step % 1 ? 1 : 0)))}</text>`;
		}
		svg += `<text x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle" font-size="12" font-weight="600" fill="#3c4f59">${esc(label)}</text>`;
		rowsOf.forEach((r, i) => {
			const y = T + i * Hrow + Hrow / 2;
			svg += `<text x="${L - 12}" y="${y + 4}" text-anchor="end" font-size="13" font-weight="600" fill="rgb(${r.color})">${esc(r.name)}</text>`;
			svg += `<line x1="${X(r.q10)}" x2="${X(r.q90)}" y1="${y}" y2="${y}" stroke="rgb(${r.color})" stroke-width="2" stroke-linecap="round" opacity="0.7"/>`;
			svg += `<rect x="${X(r.q25)}" y="${y - 9}" width="${Math.max(3, X(r.q75) - X(r.q25))}" height="18" rx="9" fill="rgba(${r.color},0.22)" stroke="rgb(${r.color})" stroke-width="1.2"/>`;
			if (isFinite(r.mid)) {
				svg += `<circle cx="${X(r.mid)}" cy="${y}" r="6.5" fill="rgb(${r.color})" stroke="#fff" stroke-width="2"/>`;
				svg += `<text x="${X(r.mid)}" y="${y - 15}" text-anchor="middle" font-size="12" font-weight="600" fill="rgb(${r.color})">${esc(fmt(r.mid))}</text>`;
			}
		});
		svg += '</svg>';
		const back = document.createElement('div');
		back.className = 'ins-chart-back';
		back.innerHTML = `<div class="ins-chart-box" role="dialog" aria-modal="true" aria-label="${esc(title)}">
			<button type="button" class="ins-chart-x" aria-label="Uždaryti">×</button>
			<p class="ins-chart-title">${esc(title)}</p>
			<p class="ins-chart-sub">${esc(periodText(f.from, f.to))}</p>
			<div class="ins-range">${svg}</div>
			<p class="ins-chart-note">Apskritimas – vidurkis. Storoje juostoje – pusė visų užduočių, plonoje linijoje – 80% užduočių. Lyginamos tik tokios pačios užduotys.</p>
		</div>`;
		document.body.appendChild(back);
		const close = () => { back.remove(); document.removeEventListener('keydown', onKey); if (opener && opener.isConnected) opener.focus(); };
		const onKey = event => { if (event.key === 'Escape') close(); };
		document.addEventListener('keydown', onKey);
		back.addEventListener('click', event => { if (event.target === back) close(); });
		back.querySelector('.ins-chart-x').addEventListener('click', close);
		back.querySelector('.ins-chart-x').focus();
	}

	/* The grammar mistakes as "Klaidų kategorijos" (the patterns; a pattern opens into the table of its mistakes) or
	 * "Klaidų sąrašas" (the page's own table, opts.listEls, shown as before). opts: {
	 *   host: where the views go, listEls: the elements of the page's own list, tableFor(items, id): draws the mistakes
	 *   table into #id, idPrefix: ids of the pattern tables (idPrefix + '-p' + n), sentencePrefix: optional ids for the
	 *   sentences inside them } */
	/* An explanation in the site's own popup (openObjectPopup, mental-arithmetic.js). When that popup already shows something
	 * (a task's popup), the explanation takes its place, and closing it brings that back. */
	function showInfo(title, text, isHtml) {
		const popup = document.getElementById('object-popup');
		const content = document.getElementById('object-popup-content');
		const titleEl = document.getElementById('object-popup-title'), subEl = document.getElementById('object-popup-subtitle');
		const body = isHtml ? text : esc(text);
		if (typeof openObjectPopup !== 'function' || !popup || !content) { window.alert(String(text).replace(/<[^>]+>/g, '')); return; }
		if (popup.style.display !== 'flex') { openObjectPopup(`<p>${body}</p>`, esc(title)); return; }
		const saved = { nodes: [...content.childNodes], title: titleEl ? titleEl.innerHTML : '', sub: subEl ? subEl.innerHTML : '', scroll: content.scrollTop };
		const p = document.createElement('p'); p.innerHTML = body;
		content.replaceChildren(p);
		if (titleEl) titleEl.innerHTML = esc(title);
		if (subEl) subEl.innerHTML = '';
		const closeBtn = popup.querySelector('.object-popup-close');
		// (the close button and the backdrop go back to the task, before the popup's own handlers run)
		const back = event => {
			if (event.currentTarget === popup && event.target !== popup) return;
			event.stopImmediatePropagation(); event.preventDefault();
			content.replaceChildren(...saved.nodes);
			if (titleEl) titleEl.innerHTML = saved.title;
			if (subEl) subEl.innerHTML = saved.sub;
			content.scrollTop = saved.scroll;
			if (closeBtn) closeBtn.removeEventListener('click', back, true);
			popup.removeEventListener('click', back, true);
		};
		if (closeBtn) closeBtn.addEventListener('click', back, true);
		popup.addEventListener('click', back, true);
	}
	let mistakeView = 'patterns';   // the chosen view, kept while the page is open
	function renderMistakeViews(f, opts) {
		const host = opts.host;
		const listEls = (opts.listEls || []).filter(Boolean);
		const patterns = f && f.grammar ? f.grammar.insights : f && f.math ? f.math.insights : [];
		const showList = on => listEls.forEach(el => el.classList.toggle('ins-hidden', !on));
		if (!host) return;
		if (!patterns.length) { host.innerHTML = ''; showList(true); return; }
		// how often it goes wrong: "6% atvejų" - of the words (examples) where this mistake could be made, the share where it
		// was (the Apie page explains it)
		const grammar = Boolean(f && f.grammar);
		/* "Klaidų indeksas": the pattern's place in the list as one small number - the cautious estimate of its "% atvejų"
		 * (reliableRate × 100: how often it goes wrong, lowered the less data there is and the more the mistakes sit in a
		 * few words). The list is ordered by it (the Apie page explains it). */
		const top = Math.max(1e-9, ...patterns.filter(p => !p.few && p.key !== 'kita').map(p => p.reliableRate || 0));
		// (a thin bar: how much this one recurs, against the most recurring - any value, not steps; a click explains it)
		const rateHtml = p => {
			if (p.rate == null || p.few) return esc('Per mažai duomenų');
			const share = Math.max(4, Math.round(100 * (p.reliableRate || 0) / top));
			return `<span class="ins-meter" role="button" tabindex="0" aria-label="Kaip dažnai kartojasi – paaiškinimas"><i style="width:${share}%"></i></span>`;
		};
		// the explanation behind the bar: how often, its share of the mistakes, and what the order takes into account
		// (HTML: "galėjo" in italics)
		const explanation = p => `Šios kategorijos ${grammar ? 'žodžiuose' : 'veiksmuose'} buvo suklysta ${esc(pct(Math.min(100, p.wrong / Math.max(p.questions, 1e-9) * 100)))} atvejų ir tai sudaro ${esc(pct(p.share))} visų į analizę įtrauktų klaidų. `
			+ 'Klaidų kategorijos surikiuotos atsižvelgiant į klaidų skaičių, kaip dažnai ši klaida <i>galėjo</i> būti padaryta ir kiek duomenų buvo tinkami analizei.';
		const rateTitle = p => {
			if (p.rate == null) return '';
			const words = grammar ? ['žodžio', 'žodžių', 'žodžių'] : ['veiksmo', 'veiksmų', 'veiksmų'];
			return `Klaida padaryta ${Math.max(1, Math.round(p.wrong))} iš ${count(Math.max(1, Math.round(p.questions)), words)}, kuriuose ji galėjo pasitaikyti (${pct(Math.min(100, p.wrong / Math.max(p.questions, 1e-9) * 100))} atvejų); tai ${pct(p.share)} visų klaidų.`
				+ ` Juosta rodo, kiek ši klaida pasikartoja, palyginti su labiausiai pasikartojančia: atsižvelgiama į jos dažnį, duomenų kiekį ir į tai, kiek skirtingų ${grammar ? 'žodžių' : 'veiksmų'} ji paliečia. Dėsningumai surikiuoti pagal tai.`
				+ (p.approx ? ' Skaičiai apytiksliai: įrašuose nenurodyta, kiek kurios rūšies klausimų buvo užduotyje, todėl jie padalyti po lygiai.' : '');
		};
		const item = (p, i) => `<div class="ins-pat" data-i="${i}" data-key="${esc(p.key || '')}">
			<button type="button" class="ins-pat-head" aria-expanded="false">
				<div class="ins-pl"><span class="ins-pn">${esc(p.label)}</span><span class="ins-pc">${rateHtml(p)}</span></div>
				${p.note ? `<div class="ins-pnote">${esc(p.note)}</div>` : ''}
				${p.examples.some(e => e.w || e.text) ? `<div class="ins-ex">${p.examples.filter(e => e.w || e.text).map(e => e.text ? `<span>${esc(e.text)}</span>` : `<span>${wordHtml(e.b, e.w, e.s, 'ins-bad')} → ${wordHtml(e.b, e.a, e.s, 'ins-good')}</span>`).join('')}</div>` : ''}
				${p.tip && !String(p.key || '').startsWith('m_') ? `<div class="ins-tip">${esc(p.tip)}</div>` : ''}
			</button>
			<div class="ins-pat-body" hidden>
				<div class="table-container"><div id="${opts.idPrefix}-p${i}"></div></div>
				${opts.sentencePrefix ? `<div id="${opts.sentencePrefix}-p${i}"></div>` : ''}
			</div>
		</div>`;
		host.innerHTML = `<div class="ins-mv">
			<div class="ins-tabs" role="tablist">
				<button type="button" class="ins-tab" data-view="patterns" role="tab">Klaidų kategorijos</button>
				<button type="button" class="ins-tab" data-view="list" role="tab">Klaidų sąrašas</button>
			</div>
			<div class="ins-pats">${patterns.map(item).join('')}</div>
		</div>`;
		const pats = host.querySelector('.ins-pats');
		const setView = view => {
			mistakeView = view;
			host.querySelectorAll('.ins-tab').forEach(b => {
				b.classList.toggle('on', b.dataset.view === view);
				b.setAttribute('aria-selected', b.dataset.view === view ? 'true' : 'false');
			});
			pats.hidden = view !== 'patterns';
			showList(view === 'list');
		};
		host.querySelectorAll('.ins-tab').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
		host.querySelectorAll('.ins-meter').forEach(m => {
			const i = Number(m.closest('.ins-pat').dataset.i);
			const show = event => { event.stopPropagation(); event.preventDefault(); showInfo(patterns[i].label, explanation(patterns[i]), true); };
			m.addEventListener('click', show);
			m.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') show(event); });
		});
		host.querySelectorAll('.ins-pat-head').forEach(head => head.addEventListener('click', () => {
			const box = head.parentElement, body = box.querySelector('.ins-pat-body');
			const open = body.hidden;
			body.hidden = !open;
			box.classList.toggle('open', open);
			head.setAttribute('aria-expanded', open ? 'true' : 'false');
			if (open && !body.dataset.drawn && typeof opts.tableFor === 'function') {
				body.dataset.drawn = '1';
				const i = Number(box.dataset.i);
				opts.tableFor(patterns[i].items, `${opts.idPrefix}-p${i}`);
			}
			if (open && window.revealExpanded) window.revealExpanded(box);
		}));
		setView(mistakeView);
	}

	async function render(el, tasks, opts) {
		if (!el) return;
		const views = opts.mistakeViews;
		// (the written summary only where it is on - a single task's: the testers only; the mistake categories for everyone)
		const summary = enabled(opts.mode);
		if (!summary && !views) { el.innerHTML = ''; return; }
		injectStyle();
		const token = String(Math.random());
		el.dataset.insToken = token;
		// (opts.keep: a card already drawn stays, greyed, until the new one is ready - no spinner in between)
		if (summary && opts.keep && hasCard(el)) el.classList.add('ins-busy');
		else { el.classList.remove('ins-busy'); el.innerHTML = summary ? cardHtml(LOADING_HTML, false) : ''; }
		let f;
		try {
			f = await analyze(tasks, { ...opts, alive: () => el.dataset.insToken === token && (!opts.alive || opts.alive()) });
		} catch (error) {
			if (error === CANCELLED) return;   // (a newer render, or the page moved on)
			console.error('SudInsights: analysis failed', error);
			if (el.dataset.insToken === token) { el.classList.remove('ins-busy'); el.innerHTML = ''; if (views) renderMistakeViews(null, views); }
			return;
		}
		if (el.dataset.insToken !== token) return;   // a newer render has started
		f.openTasks = opts.openTasks;   // (the page's list of tasks - the excluded ones' link)
		el._insFacts = f;   // (also for checking in the console)
		if (views) renderMistakeViews(f, views);
		el.classList.remove('ins-busy');
		if (!summary) return;
		cards.add(el);
		drawCard(el);
	}
	const LOADING_HTML = '<div class="ins-loading" role="status" aria-label="Ruošiamas apibendrinimas"><span class="ins-spinner"></span></div>';
	const hasCard = el => Boolean(el.querySelector('.ins-card')) && !el.querySelector('.ins-loading');
	// a spinner in the card while the page is still gathering what the text needs (opts.keep: a drawn card stays, greyed)
	function showLoading(el, opts = {}) {
		if (!el || !enabled('period')) return;
		injectStyle();
		el.dataset.insToken = String(Math.random());   // (a render in progress is dropped)
		if (opts.keep && hasCard(el)) { el.classList.add('ins-busy'); return; }
		el.classList.remove('ins-busy');
		el.innerHTML = cardHtml(LOADING_HTML, false);
	}
	function renderPeriod(el, tasks, opts = {}) {
		return render(el, tasks, { ...opts, mode: 'period' });
	}
	// one task's result - or (an array) the class's results of one task / task group, read together (isClass)
	function renderTask(el, row, opts = {}) {
		return render(el, Array.isArray(row) ? row : [row], { ...opts, mode: 'task', scope: 'period' });
	}

	window.SudInsights = { _comparePeers: comparePeers, _PEER_TEST: PEER_TEST, _randomSign: randomSign, _markRandomLetters: markRandomLetters, _analyzeGrammar: analyzeGrammarMistakes, _keyboardSlip: keyboardSlip, _loadLexicon: loadLexicon, OUTLIER, showInfo, enabled, analyze, describe, randomLettersOf, renderPeriod, renderTask, showLoading, classifyAnswer, form, trend, verdict, tPValue, INSIGHTS, mathComposition, windowTest, windowChanges, windowChangesAsync, WIN, CANCELLED };
})();
