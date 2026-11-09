// ==========================================
// EzShop - Authentication & Admin Role System
// ==========================================

let currentUser = null;

// Built-in Admin Account Configuration
const ADMIN_CONFIG = {
    email: 'admin@ezshop.kg',
    password: 'admin123',
    username: 'Главный Администратор',
    role: 'admin'
};

// Admin Initializer: ensures the admin account exists in Supabase
async function adminInitializer() {
    if (!supabaseClient) return;

    try {
        // Attempt to create system admin user
        const { data, error } = await supabaseClient.auth.signUp({
            email: ADMIN_CONFIG.email,
            password: ADMIN_CONFIG.password,
            options: {
                data: {
                    username: ADMIN_CONFIG.username,
                    role: 'admin'
                }
            }
        });
        if (data && data.user) {
            console.log('EzShop: System admin account initialized');
        }
    } catch (e) {
        // Already exists or network, completely safe to ignore
    }
}

// Check if a user has admin privileges
function isAdmin(user = currentUser) {
    if (!user) return false;
    const emailMatch = user.email && user.email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
    const roleMatch = user.role === 'admin' || user.user_metadata?.role === 'admin';
    return emailMatch || roleMatch;
}

// Show/hide admin-only navigation links based on user role
function updateAdminUI() {
    const adminLinks = document.querySelectorAll('.admin-only-nav');
    const userIsAdmin = isAdmin(currentUser);

    adminLinks.forEach(link => {
        if (userIsAdmin) {
            link.classList.add('visible');
            link.style.display = 'inline-block';
        } else {
            link.classList.remove('visible');
            link.style.display = 'none';
        }
    });
}

// Initialize Auth State on every page
async function initAuth() {
    // Без клиента Supabase (нет .env или не загрузился CDN) страница работать не может
    if (!supabaseClient) {
        console.error('EzShop: клиент Supabase не создан — проверьте .env и подключение к сети');
        showToast('Не удалось подключиться к серверу. Обновите страницу.', 'error');
        const failLoader = document.getElementById('pageLoader');
        if (failLoader) failLoader.classList.add('hidden');
        document.body.classList.remove('auth-loading');
        return;
    }

    // 1. Системного админа создаём один раз на браузер и только со страницы входа
    if (window.location.pathname.includes('login.html') && !localStorage.getItem('ez_admin_init_done')) {
        localStorage.setItem('ez_admin_init_done', '1');
        adminInitializer();
    }

    const hasLocalSession = Object.keys(localStorage).some(k => k.startsWith('sb-'));
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');
    const isAdminPage = path.includes('admin.html') || path.includes('admin-orders.html');

    if (!hasLocalSession && !isLoginPage) {
        window.location.replace('login.html');
        return;
    }

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        currentUser = {
            id: session.user.id,
            username: session.user.user_metadata.username || session.user.email.split('@')[0],
            email: session.user.email,
            role: session.user.user_metadata.role || (session.user.email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase() ? 'admin' : 'user')
        };
    } else if (!isLoginPage) {
        window.location.replace('login.html');
        return;
    }

    if (!currentUser && !isLoginPage) {
        window.location.replace('login.html');
        return;
    }
    if (currentUser && isLoginPage) {
        window.location.replace('index.html');
        return;
    }

    // STRICT ADMIN ROUTE PROTECTION:
    // If the user visits admin.html without admin privileges -> kick out to index.html!
    if (isAdminPage && !isAdmin(currentUser)) {
        showToast('Доступ запрещен. Страница доступна только администратору!', 'error');
        setTimeout(() => {
            window.location.replace('index.html');
        }, 1500);
        return;
    }

    // Display Username in header
    const usernameEl = document.getElementById('usernameDisplay');
    if (usernameEl && currentUser) {
        const adminBadge = isAdmin(currentUser) ? ' 👑 (Admin)' : '';
        usernameEl.textContent = `${currentUser.username}${adminBadge}`;
    }

    // Update visibility of Admin link in navigation
    updateAdminUI();

    // Sync Catalog & Stock Status from Supabase across devices
    if (typeof syncCatalogWithSupabase === 'function') {
        await syncCatalogWithSupabase();
    }

    // Re-render catalog if on index page
    if (typeof renderFilters === 'function' && typeof applyFilters === 'function') {
        renderFilters();
        applyFilters(false);
    }

    // Load Cart for current user
    if (typeof loadCart === 'function') loadCart();

    // Update Favorites & Compare Bars if available
    if (typeof updateFavoritesUI === 'function') updateFavoritesUI();
    if (typeof updateCompareBar === 'function') updateCompareBar();

    // Load orders if on orders page
    if (typeof loadOrdersFunc === 'function') loadOrdersFunc();

    // Initialize Admin Dashboard if on admin page
    if (path.includes('admin.html') && !path.includes('admin-orders.html') && typeof initAdminDashboard === 'function') {
        initAdminDashboard();
    }

    // Initialize Admin Orders Page if on admin-orders page
    if (path.includes('admin-orders.html') && typeof initAdminOrdersPage === 'function') {
        initAdminOrdersPage();
    }

    // Initialize Product Details if on product page
    if (path.includes('product.html') && typeof initProductPage === 'function') {
        await initProductPage();
    }

    // Start background Telegram status guard (protects order status rules)
    if (typeof startTelegramStatusGuard === 'function') {
        startTelegramStatusGuard();
    }

    // Reveal page content
    const loader = document.getElementById('pageLoader');
    if (loader) loader.classList.add('hidden');
    document.body.classList.remove('auth-loading');
}

// Auth Handlers
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value.trim();

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username,
                    role: email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase() ? 'admin' : 'user'
                }
            }
        });

        if (error) throw error;

        // Auto-login immediately after registration
        let session = data.session;
        let user = data.user;

        if (!session) {
            const loginRes = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (loginRes.error) throw loginRes.error;
            session = loginRes.data.session;
            user = loginRes.data.user;
        }

        currentUser = {
            id: user.id,
            username: user.user_metadata?.username || username || email.split('@')[0],
            email: user.email,
            role: user.user_metadata?.role || (user.email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase() ? 'admin' : 'user')
        };

        showToast(`Добро пожаловать, ${currentUser.username}! Входим...`, 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('loginPass').value.trim();

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: login,
            password: password
        });

        if (error) throw error;

        currentUser = {
            id: data.user.id,
            username: data.user.user_metadata.username || data.user.email.split('@')[0],
            email: data.user.email,
            role: data.user.user_metadata?.role || (data.user.email.toLowerCase() === ADMIN_CONFIG.email.toLowerCase() ? 'admin' : 'user')
        };
        window.location.href = 'index.html';
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function logout() {
    try {
        if (supabaseClient) await supabaseClient.auth.signOut({ scope: 'local' });
    } catch (e) { /* выходим локально в любом случае */ }
    Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.startsWith('sb-')) {
            localStorage.removeItem(key);
        }
    });
    currentUser = null;
    window.supabaseClient = null;
    window.location.replace('login.html');
}

// Синхронизация состояния автозаполнения браузера (плавающий label)
function syncAutofillStates() {
    document.querySelectorAll('.auth-input').forEach(input => {
        let isFilled = false;
        try {
            isFilled = Boolean(input.value) || input.matches(':-webkit-autofill');
        } catch (_) {
            isFilled = Boolean(input.value);
        }
        if (isFilled) {
            input.setAttribute('data-filled', 'true');
        } else {
            input.removeAttribute('data-filled');
        }
    });
}

if (typeof window !== 'undefined') {
    ['DOMContentLoaded', 'load', 'pageshow'].forEach(evt => {
        window.addEventListener(evt, () => {
            syncAutofillStates();
            setTimeout(syncAutofillStates, 100);
            setTimeout(syncAutofillStates, 400);
            setTimeout(syncAutofillStates, 1000);
        });
    });
    document.addEventListener('input', e => {
        if (e.target && e.target.classList && e.target.classList.contains('auth-input')) {
            syncAutofillStates();
        }
    });
    document.addEventListener('change', e => {
        if (e.target && e.target.classList && e.target.classList.contains('auth-input')) {
            syncAutofillStates();
        }
    });
}
