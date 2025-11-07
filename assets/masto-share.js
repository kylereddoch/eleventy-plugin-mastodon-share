(function () {
    // --- one-time init guard (prevents double-binding) ---
    if (window.__mastoInit) return;
    window.__mastoInit = true;

    const KEY = 'mastoPreferredInstance';
    let __promptOpen = false; // guard to avoid double prompt re-entry

    // --- storage helpers ---
    const savedHost = () => localStorage.getItem(KEY) || '';
    const setSaved = (h) => { localStorage.setItem(KEY, h); paintIndicators(); };
    const clearSaved = () => { localStorage.removeItem(KEY); paintIndicators(); };

    // --- utils ---
    function normHost(input) {
        if (!input) return '';
        try {
            const u = new URL(input.includes('://') ? input : 'https://' + input);
            return u.hostname.toLowerCase();
        } catch {
            return String(input).replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
        }
    }
    const likelyHost = (h) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(h);

    function openShare(host, query) {
        host = normHost(host);
        if (!host) return;
        window.open(`https://${host}/share${query || ''}`, '_blank', 'noopener');
    }

    function getDetails(fromEl) {
        const wrap = fromEl.closest?.('.masto-share') || fromEl.closest?.('.masto-share__menu') || null;
        return wrap ? wrap.querySelector('.masto-share__menu details') : null;
    }

    function closeMenu(fromEl) {
        const details = getDetails(fromEl);
        if (details) {
            details.open = false;
            const summary = details.querySelector('summary');
            if (summary) summary.focus({ preventScroll: true });
        }
    }

    function paintIndicators() {
        const saved = savedHost();
        document.querySelectorAll('.masto-share').forEach(root => {
            const label = root.querySelector('[data-masto-current]');
            if (label) label.textContent = saved || 'none';

            const has = !!saved;
            root.querySelectorAll("[data-masto-action='use-saved']").forEach(el => el.style.display = has ? '' : 'none');
            root.querySelectorAll("[data-masto-action='clear-saved']").forEach(el => el.style.display = has ? '' : 'none');

            const savedSection = root.querySelector('.masto-share__section--saved');
            const divider = root.querySelector('.masto-share__divider');
            if (savedSection) savedSection.style.display = has ? '' : 'none';
            if (divider) divider.style.display = has ? '' : 'none';
        });
    }

    function askForHost(defaultVal) {
        if (__promptOpen) return null;
        __promptOpen = true;
        const input = prompt('Enter your Mastodon instance (e.g. infosec.exchange):', defaultVal || '');
        __promptOpen = false;
        if (input == null) return null;
        const h = normHost(input || '');
        if (!h) return null;
        if (!likelyHost(h)) { alert('That does not look like a valid instance host.'); return null; }
        return h;
    }

    // Delegated handler for share UI clicks (inside widget)
    document.addEventListener('click', function (ev) {
        const el = ev.target.closest('[data-masto-action],[data-masto-host]');
        if (!el) return;

        const root = el.closest('.masto-share');
        if (!root) return;

        const query = root.getAttribute('data-masto-query') || '';
        const fallback = root.getAttribute('data-masto-fallback') || 'mastodon.social';

        if (el.hasAttribute('data-masto-host')) {
            ev.preventDefault();
            openShare(el.getAttribute('data-masto-host'), query);
            closeMenu(el);
            return;
        }

        const action = el.getAttribute('data-masto-action');

        if (action === 'primary-share') {
            ev.preventDefault();
            const current = savedHost();
            if (current) openShare(current, query);
            else {
                const h = askForHost(fallback);
                if (!h) return;
                setSaved(h);
                openShare(h, query);
            }
            closeMenu(el);
            return;
        }

        if (action === 'use-saved') {
            ev.preventDefault();
            const h = savedHost();
            if (!h) { alert('No saved instance yet. Choose “Set / change saved instance…”.'); return; }
            openShare(h, query);
            closeMenu(el);
            return;
        }

        if (action === 'set-saved') {
            ev.preventDefault();
            const h = askForHost(savedHost() || fallback);
            if (!h) return;
            setSaved(h);
            alert(`Saved: ${h}`);
            closeMenu(el);
            return;
        }

        if (action === 'clear-saved') {
            ev.preventDefault();
            clearSaved();
            alert('Saved instance cleared.');
            closeMenu(el);
            return;
        }
    }, { capture: true });

    // === New: click-outside to close any open menu ===
    document.addEventListener('click', function (ev) {
        // if click happened inside any open details, ignore
        const openDetails = document.querySelectorAll('.masto-share .masto-share__menu details[open]');
        openDetails.forEach(d => {
            if (!d.contains(ev.target)) d.open = false;
        });
    });

    // === New: Escape key closes the nearest open menu ===
    document.addEventListener('keydown', function (ev) {
        if (ev.key !== 'Escape') return;
        const openDetails = document.querySelector('.masto-share .masto-share__menu details[open]');
        if (openDetails) {
            openDetails.open = false;
            const summary = openDetails.querySelector('summary');
            if (summary) summary.focus({ preventScroll: true });
        }
    });

    // Paint indicators on load (including “(none)”)
    document.addEventListener('DOMContentLoaded', paintIndicators);
})();