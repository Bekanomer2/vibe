// ==========================================
// EzShop - Application Bootstrapper
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Burger Menu
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger && nav) {
        burger.onclick = () => {
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        };
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
