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

    // 2. Smooth Navigation Transitions
    const loader = document.getElementById('pageLoader');
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.includes('javascript:')) return;
            e.preventDefault();
            if (loader) loader.classList.remove('hidden');
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });

    // 3. Initialize Authentication on every page
    initAuth();
});
