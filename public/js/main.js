// ==========================================
// EzShop - Application Bootstrapper
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Мобильное меню (бургер). Затемнение и блокировку прокрутки добавляет ui.js
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.onclick = (e) => {
            e.stopPropagation();
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        };

        // Закрываем меню при клике по любой ссылке внутри и вне меню
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

    // 2. Переходы между страницами.
    // Браузеры с cross-document View Transitions (Chrome/Edge 126+) анимируют сами через CSS
    // (@view-transition в base.css). Для остальных — мягкое затухание перед переходом.
    const loader = document.getElementById('pageLoader');
    const nativeTransitions = 'PageSwapEvent' in window;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!nativeTransitions && !reduceMotion) {
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
            document.documentElement.classList.add('page-leaving');
            setTimeout(() => {
                window.location.href = link.href;
            }, 190);
        });
    }

    // Возврат кнопкой «Назад» (bfcache): снимаем состояния ухода и прячем лоадер
    window.addEventListener('pageshow', (e) => {
        document.documentElement.classList.remove('page-leaving');
        if (e.persisted && loader) loader.classList.add('hidden');
    });

    // 3. Авторизация на каждой странице
    initAuth();
});
