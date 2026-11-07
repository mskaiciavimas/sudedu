// A results-analysis helper (sudedu-insights.js): replays finished spelling tasks' questions off the page, so a class's
// dozens of replays run side by side on the device's cores and the page stays free. The very same generator file and
// data files as the page (sent by the page: the generator's address and the files' texts), so the same questions.
// Messages in: { type: 'init', generatorUrl, files: { c75, c76, patterns, words } } once, then { type: 'run', id, args };
// out: { type: 'ready' } | { type: 'failed', error } | { type: 'done', id, result } (result: replayStream's, or null) |
// { type: 'error', id } (it threw: the page works that one out itself, as it would have without workers).
self.window = self;   // (the generator file registers itself on window)
let db = null;
self.onmessage = async e => {
    const m = e.data || {};
    if (m.type === 'init') {
        try {
            importScripts(m.generatorUrl);
            const G = self.SudRasybaGenerator, f = m.files;
            const words = JSON.parse(f.words), patterns = JSON.parse(f.patterns);
            db = { texts: { C75: JSON.parse(f.c75), C76: JSON.parse(f.c76) }, words, patterns, precomputed: G.buildPrecomputedWordPatterns(words, patterns) };
            self.postMessage({ type: 'ready' });
        } catch (err) {
            self.postMessage({ type: 'failed', error: String(err && err.message || err) });
        }
        return;
    }
    if (m.type === 'run') {
        let result;
        try { result = await self.SudRasybaGenerator.replayStream(db, ...m.args); } catch (err) { self.postMessage({ type: 'error', id: m.id }); return; }
        self.postMessage({ type: 'done', id: m.id, result });
    }
};
