/* reveal-expanded.js – window.revealExpanded(element)
 *
 * On smaller screens, after something has been expanded (a task card opened, a filter panel shown …), scrolls it into
 * view inside the element that actually scrolls it (its nearest scrollable parent; the page itself only when no parent
 * scrolls). If the whole item fits in the visible part of that parent, it is moved just enough to be fully visible;
 * if it is taller, its top is put at the top of the visible part. Nothing happens when it is already fully visible.
 * Runs after the layout (and any open/close animation) has settled.
 */
(function () {
	'use strict';
	const SMALL = '(max-width: 1199px), (max-height: 760px)';
	const GAP = 8;   // px left between the item and the edge of the visible area

	function scrollerOf(el) {
		for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
			const oy = getComputedStyle(p).overflowY;
			if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && p.scrollHeight > p.clientHeight + 1) return p;
		}
		return document.scrollingElement || document.documentElement;
	}

	function reveal(el) {
		if (!el || !el.isConnected || !el.getClientRects().length) return;
		// (a page keeping something in place itself just then - Užduotys' Analizė while it loads - is left alone)
		if (typeof window.revealExpandedHeld === 'function' && window.revealExpandedHeld()) return;
		const box = scrollerOf(el);
		const page = box === document.scrollingElement || box === document.documentElement;
		// the visible part of the scrolling parent (also limited to the window)
		let top = 0, bottom = window.innerHeight;
		if (!page) {
			const r = box.getBoundingClientRect();
			top = Math.max(top, r.top + box.clientTop);
			bottom = Math.min(bottom, r.top + box.clientTop + box.clientHeight);
		}
		const r = el.getBoundingClientRect();
		let delta = 0;
		if (r.height > bottom - top - 2 * GAP) delta = r.top - (top + GAP);        // too tall: its top to the top
		else if (r.top < top + GAP) delta = r.top - (top + GAP);                     // cut off above
		else if (r.bottom > bottom - GAP) delta = r.bottom - (bottom - GAP);         // cut off below
		if (Math.abs(delta) < 2) return;
		(page ? window : box).scrollBy({ top: delta, behavior: 'smooth' });
	}

	window.revealExpanded = function (el) {
		if (!el || !(window.matchMedia && matchMedia(SMALL).matches)) return;
		// scroll once, when the item has stopped changing size (an open animation has finished), at most after 0.7 s
		let timer = 0, done = false, ro = null;
		const go = () => { if (done) return; done = true; clearTimeout(timer); if (ro) ro.disconnect(); reveal(el); };
		if (window.ResizeObserver) {
			ro = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(go, 120); });
			ro.observe(el);
		} else timer = setTimeout(go, 350);
		setTimeout(go, 700);
	};
})();
