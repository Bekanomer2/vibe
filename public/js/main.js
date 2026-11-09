// ==========================================
// EzShop - Application Bootstrapper
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Burger Menu
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.onclick = (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        };

        // Close burger menu when clicking any nav link or outside
        nav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                nav.classList.remove('active');
                burger.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && !nav.contains(e.target) && !burger.contains(e.target)) {
                nav.classList.remove('active');
                burger.classList.remove('active');
            }
        });
    }

    // 2. Smooth Navigation Transitions (делегирование: работает и для ссылок, созданных позже)
    const loader = document.getElementById('pageLoader');
    document.addEventListener('click', (e) => {
        const link = e.target.closest && e.target.closest('a');
        if (!link || e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (link.target && link.target !== '_self') return;
        if (link.hasAttribute('download')) return;

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || /^(javascript:|tel:|mailto:)/i.test(href)) return;

        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;

        e.preventDefault();
        if (loader) loader.classList.remove('hidden');
        setTimeout(() => {
            window.location.href = link.href;
        }, 200);
    });

    // Возврат кнопкой «Назад» (bfcache): прячем лоадер, иначе он остаётся на экране
    window.addEventListener('pageshow', (e) => {
        if (e.persisted && loader) loader.classList.add('hidden');
    });

    // 3. Initialize Authentication on every page
    initAuth();
});
