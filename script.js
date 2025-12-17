const productsData = [
    // Apple (5)
    { id: 1, name: 'iPhone 13', price: 67500, img: 'img/iphone 13.jpg', brand: 'Apple', ram: 4, storage: 128, color: 'Midnight', display: '6.1"', battery: 3240 },
    { id: 6, name: 'iPhone 15 Pro Max', price: 107910, img: 'img/iPhone 15 pro max.jpg', brand: 'Apple', ram: 8, storage: 256, color: 'Natural Titanium', display: '6.7"', battery: 4441 },
    { id: 10, name: 'iPhone 14 Pro', price: 89910, img: 'img/iPhone 14 Pro.jpg', brand: 'Apple', ram: 6, storage: 256, color: 'Space Black', display: '6.1"', battery: 3200 },
    { id: 15, name: 'iPhone 12 Mini', price: 45000, img: 'img/iphone 12 mini.jpg', brand: 'Apple', ram: 4, storage: 64, color: 'Blue', display: '5.4"', battery: 2227 },
    { id: 19, name: 'iPhone SE 2022', price: 38610, img: 'img/iphone se 2022.webp', brand: 'Apple', ram: 4, storage: 64, color: 'Starlight', display: '4.7"', battery: 2018 },

    // Samsung (5)
    { id: 2, name: 'Samsung S23', price: 61200, img: 'img/samsung s23.webp', brand: 'Samsung', ram: 8, storage: 256, color: 'Phantom Black', display: '6.1"', battery: 3900 },
    { id: 7, name: 'Samsung S24 Ultra', price: 116910, img: 'img/samsung galaxy s24 ultra.jpg', brand: 'Samsung', ram: 12, storage: 512, color: 'Titanium Gray', display: '6.8"', battery: 5000 },
    { id: 11, name: 'Samsung Galaxy S22', price: 49500, img: 'img/Samsung-Galaxy-S22.webp', brand: 'Samsung', ram: 8, storage: 128, color: 'Green', display: '6.1"', battery: 3700 },
    { id: 16, name: 'Samsung Galaxy A54', price: 31500, img: 'img/samsung-galaxy-a54.jpg', brand: 'Samsung', ram: 6, storage: 128, color: 'Awesome Graphite', display: '6.4"', battery: 5000 },
    { id: 21, name: 'Samsung Galaxy Z Flip 5', price: 89910, img: 'img/samsung flip 5.jpg', brand: 'Samsung', ram: 8, storage: 256, color: 'Mint', display: '6.7"', battery: 3700 },

    // Xiaomi (5)
    { id: 3, name: 'Xiaomi Note 13', price: 28800, img: 'img/xiaomi redmi 13.jpg', brand: 'Xiaomi', ram: 8, storage: 256, color: 'Midnight Black', display: '6.67"', battery: 5000 },
    { id: 8, name: 'Xiaomi 14 Ultra', price: 98910, img: 'img/xiaomi 14 ultra.jpg', brand: 'Xiaomi', ram: 16, storage: 512, color: 'Black', display: '6.73"', battery: 5000 },
    { id: 12, name: 'Xiaomi 13T Pro', price: 58500, img: 'img/xiaomi 13t pro.jpg', brand: 'Xiaomi', ram: 12, storage: 512, color: 'Alpine Blue', display: '6.67"', battery: 5000 },
    { id: 18, name: 'Redmi Note 12', price: 18000, img: 'img/Redmi-Note-12.jpg', brand: 'Xiaomi', ram: 4, storage: 128, color: 'Ice Blue', display: '6.67"', battery: 5000 },
    { id: 22, name: 'Xiaomi 12', price: 45000, img: 'img/xiaomi 12.jpg', brand: 'Xiaomi', ram: 8, storage: 256, color: 'Blue', display: '6.28"', battery: 4500 },

    // Realme (5)
    { id: 4, name: 'Realme 11 Pro', price: 36000, img: 'img/realme-11.webp', brand: 'Realme', ram: 8, storage: 256, color: 'Sunrise Beige', display: '6.7"', battery: 5000 },
    { id: 13, name: 'Realme GT 3', price: 52200, img: 'img/realme gt3.jpg', brand: 'Realme', ram: 16, storage: 1024, color: 'Purple', display: '6.74"', battery: 4600 },
    { id: 23, name: 'Realme C55', price: 18000, img: 'img/realme c55.jpg', brand: 'Realme', ram: 8, storage: 256, color: 'Sunshower', display: '6.72"', battery: 5000 },
    { id: 24, name: 'Realme 10', price: 20700, img: 'img/realme 10.jpg', brand: 'Realme', ram: 8, storage: 128, color: 'White', display: '6.4"', battery: 5000 },
    { id: 25, name: 'Realme Narzo 60', price: 22500, img: 'img/realme narzo 60.webp', brand: 'Realme', ram: 8, storage: 128, color: 'Mars Orange', display: '6.43"', battery: 5000 },

    // OnePlus (5)
    { id: 5, name: 'OnePlus Nord CE 3', price: 40500, img: 'img/oneplus.png', brand: 'OnePlus', ram: 12, storage: 256, color: 'Gray Shimmer', display: '6.7"', battery: 5000 },
    { id: 14, name: 'OnePlus 11', price: 63000, img: 'img/oneplus 11.webp', brand: 'OnePlus', ram: 16, storage: 256, color: 'Eternal Green', display: '6.7"', battery: 5000 },
    { id: 26, name: 'OnePlus 12', price: 72000, img: 'img/oneplus 12.webp', brand: 'OnePlus', ram: 16, storage: 512, color: 'Flowy Emerald', display: '6.82"', battery: 5400 },
    { id: 27, name: 'OnePlus 10 Pro', price: 54000, img: 'img/oneplus-10.jpg', brand: 'OnePlus', ram: 12, storage: 256, color: 'Volcanic Black', display: '6.7"', battery: 5000 },
    { id: 28, name: 'OnePlus Nord 3', price: 40500, img: 'img/oneplus nord 3.jpg', brand: 'OnePlus', ram: 16, storage: 256, color: 'Misty Green', display: '6.74"', battery: 5000 },

    // Google (5)
    { id: 9, name: 'Google Pixel 8 Pro', price: 89910, img: 'img/pixel 8 pro.jpeg', brand: 'Google', ram: 12, storage: 128, color: 'Obsidian', display: '6.7"', battery: 5050 },
    { id: 29, name: 'Google Pixel 7', price: 53910, img: 'img/Pixel7-lemongrass .jpg', brand: 'Google', ram: 8, storage: 128, color: 'Lemongrass', display: '6.3"', battery: 4355 },
    { id: 30, name: 'Google Pixel 7a', price: 44910, img: 'img/Google-Pixel-7a.jpg', brand: 'Google', ram: 8, storage: 128, color: 'Sea', display: '6.1"', battery: 4385 },
    { id: 31, name: 'Google Pixel 6', price: 36000, img: 'img/google-pixel-6-seafoam-2.avif', brand: 'Google', ram: 8, storage: 128, color: 'Sorta Seafoam', display: '6.4"', battery: 4614 },
    { id: 32, name: 'Google Pixel 6a', price: 31500, img: 'img/Pixel-6a.avif', brand: 'Google', ram: 6, storage: 128, color: 'Sage', display: '6.1"', battery: 4410 },

    // Poco (5)
    { id: 17, name: 'Poco X6 Pro', price: 27000, img: 'img/poco x6 pro.webp', brand: 'Poco', ram: 8, storage: 256, color: 'Yellow', display: '6.67"', battery: 5000 },
    { id: 33, name: 'Poco F5', price: 36000, img: 'img/poco f5.jpg', brand: 'Poco', ram: 12, storage: 256, color: 'White', display: '6.67"', battery: 5000 },
    { id: 34, name: 'Poco X5', price: 22500, img: 'img/poco x5.webp', brand: 'Poco', ram: 8, storage: 256, color: 'Green', display: '6.67"', battery: 5000 },
    { id: 35, name: 'Poco M6', price: 13500, img: 'img/poco m6.jpg', brand: 'Poco', ram: 6, storage: 128, color: 'Galactic Black', display: '6.79"', battery: 5000 },
    { id: 36, name: 'Poco C65', price: 11700, img: 'img/poco-c65.jpg', brand: 'Poco', ram: 8, storage: 256, color: 'Purple', display: '6.74"', battery: 5000 },

    // Honor (5)
    { id: 20, name: 'Honor 90', price: 40500, img: 'img/honor 90.jpg', brand: 'Honor', ram: 12, storage: 512, color: 'Emerald Green', display: '6.7"', battery: 5000 },
    { id: 37, name: 'Honor Magic 6', price: 81000, img: 'img/magic-6-pro.webp', brand: 'Honor', ram: 12, storage: 512, color: 'Green', display: '6.8"', battery: 5600 },
    { id: 38, name: 'Honor X9b', price: 31500, img: 'img/HONOR-X9b.jpg', brand: 'Honor', ram: 12, storage: 256, color: 'Sunrise Orange', display: '6.78"', battery: 5800 },
    { id: 39, name: 'Honor 70', price: 36000, img: 'img/honor-70.jpg', brand: 'Honor', ram: 8, storage: 256, color: 'Crystal Silver', display: '6.67"', battery: 4800 },
    { id: 40, name: 'Honor X8', price: 18000, img: 'img/honor x8.jpg', brand: 'Honor', ram: 6, storage: 128, color: 'Ocean Blue', display: '6.7"', battery: 4000 }
];




// Supabase Configuration
const SUPABASE_URL = 'https://vsxvbrjfuhzvdyzbpjmn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aGa3JAz9zF_lQA2swDU43A_UA4fKskN';
let supabaseClient;
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
supabaseClient = window.supabaseClient;

// --- Auth System ---
let currentUser = null;

// Initialize auth state
async function initAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentUser = {
            id: session.user.id,
            username: session.user.user_metadata.username || session.user.email.split('@')[0],
            email: session.user.email
        };
    }

    // Protect pages
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');
    if (!currentUser && !isLoginPage) {
        window.location.href = 'login.html';
    }
    if (currentUser && isLoginPage) {
        window.location.href = 'index.html';
    }

    // Display Username
    const usernameEl = document.getElementById('usernameDisplay');
    if (usernameEl && currentUser) {
        usernameEl.textContent = currentUser.username;
    }

    // Load orders if on orders page
    if (loadOrdersFunc) {
        loadOrdersFunc();
    }
}

initAuth();

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Auth Functions
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPass').value;

    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

        if (error) throw error;

        showToast('Регистрация успешна! Войдите.', 'success');
        setTimeout(() => {
            document.querySelectorAll('.auth-tab')[0].click(); // Switch to login tab
        }, 1500);
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
            email: data.user.email
        };
        window.location.href = 'index.html';
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    window.location.href = 'login.html';
}

// --- Shared Functions ---

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
    if (document.getElementById('items')) renderCart(); // Update cart page if open
}

function updateCartIcon() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function addToCart(p) {
    const item = cart.find(i => i.id === p.id);
    item ? item.qty++ : cart.push({ ...p, qty: 1 });
    saveCart();
    showToast(`${p.name} добавлен в корзину`, 'success');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = type === 'success' ? `✅ ${msg}` : `⚠️ ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('is-hidden');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// --- Index Page Logic ---
const productsEl = document.getElementById('products');
if (productsEl) {
    function renderProducts(list) {
        productsEl.innerHTML = '';
        list.forEach(p => {
            const c = document.createElement('div');
            c.className = 'card';
            c.innerHTML = `
                <img src="${p.img}">
                <h3>${p.name}</h3>
                <div class="specs">
                    ${p.display} • ${p.ram}/${p.storage} ГБ<br>
                    ${p.battery} мАч • ${p.color}
                </div>
                <div class="price">${p.price.toLocaleString()} сом</div>
                <button>В корзину</button>
            `;
            c.querySelector('button').onclick = () => addToCart(p);
            productsEl.appendChild(c)
        });
    }

    function renderFilters() {
        const brands = [...new Set(productsData.map(p => p.brand))].sort();
        const rams = [...new Set(productsData.map(p => p.ram))].sort((a, b) => a - b);
        const storages = [...new Set(productsData.map(p => p.storage))].sort((a, b) => a - b);

        const brandContainer = document.getElementById('brandFilters');
        const ramContainer = document.getElementById('ramFilters');
        const storageContainer = document.getElementById('storageFilters');

        if (brandContainer) {
            brandContainer.innerHTML = brands.map(b => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${b}" onchange="applyFilters()"> ${b}
                </label>
            `).join('');
        }

        if (ramContainer) {
            ramContainer.innerHTML = rams.map(r => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${r}" onchange="applyFilters()"> ${r} ГБ
                </label>
            `).join('');
        }

        if (storageContainer) {
            storageContainer.innerHTML = storages.map(s => `
                <label class="checkbox-label">
                    <input type="checkbox" value="${s}" onchange="applyFilters()"> ${s} ГБ
                </label>
            `).join('');
        }
    }

    function applyFilters() {
        const search = document.getElementById('search');
        const sort = document.getElementById('sort');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');

        // Get selected brands
        const selectedBrands = Array.from(document.querySelectorAll('#brandFilters input:checked')).map(cb => cb.value);
        // Get selected RAM
        const selectedRam = Array.from(document.querySelectorAll('#ramFilters input:checked')).map(cb => parseInt(cb.value));
        // Get selected Storage
        const selectedStorage = Array.from(document.querySelectorAll('#storageFilters input:checked')).map(cb => parseInt(cb.value));

        let list = [...productsData];
        const min = minPrice.value || 0, max = maxPrice.value || Infinity;
        const q = search.value.toLowerCase();

        // Filter by Brand
        if (selectedBrands.length > 0) {
            list = list.filter(p => selectedBrands.includes(p.brand));
        }

        // Filter by RAM
        if (selectedRam.length > 0) {
            list = list.filter(p => selectedRam.includes(p.ram));
        }

        // Filter by Storage
        if (selectedStorage.length > 0) {
            list = list.filter(p => selectedStorage.includes(p.storage));
        }

        if (sort.value === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
        if (sort.value === 'za') list.sort((a, b) => b.name.localeCompare(a.name));
        if (sort.value === 'price_asc') list.sort((a, b) => a.price - b.price);
        if (sort.value === 'price_desc') list.sort((a, b) => b.price - a.price);

        list = list.filter(p => p.price >= min && p.price <= max && p.name.toLowerCase().includes(q));
        renderProducts(list);
    }

    // Initial Render
    renderFilters();
    renderProducts(productsData);
    updateCartIcon();

    // Mobile Menu
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    if (burger) burger.onclick = () => nav.classList.toggle('active');

    // Cart Button Logic (Handled by global transition now)
    /* 
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        // Logic removed to avoid conflict with global loader
    } 
    */
}

// --- Cart Page Logic ---
const cartItemsEl = document.getElementById('items');
if (cartItemsEl) {
    const totalEl = document.getElementById('total');

    function renderCart() {
        cartItemsEl.innerHTML = '';
        let sum = 0;
        cart.forEach((i, idx) => {
            sum += i.price * i.qty;
            const d = document.createElement('div');
            d.className = 'item';
            d.innerHTML = `<div class="item-info"><img src="${i.img}" class="cart-img"><span>${i.name} (${i.qty})</span></div><div class="controls"><button class="minus">-</button><button class="plus">+</button><button class="remove">✕</button></div>`;

            d.querySelector('.minus').onclick = () => { if (i.qty > 1) i.qty--; else cart.splice(idx, 1); saveCart(); };
            d.querySelector('.plus').onclick = () => { i.qty++; saveCart(); };
            d.querySelector('.remove').onclick = () => { cart.splice(idx, 1); saveCart(); };

            cartItemsEl.appendChild(d);
        });
        totalEl.textContent = `Итого: ${sum.toLocaleString()} сом`;
    }

    renderCart();

    const checkoutBtn = document.getElementById('checkout');
    const orderBlock = document.getElementById('order');
    const sendBtn = document.getElementById('send');

    if (checkoutBtn) {
        checkoutBtn.onclick = () => {
            if (cart.length === 0) {
                showToast('Корзина пуста', 'error');
                return;
            }
            orderBlock.style.display = 'block';
        };
    }

    if (sendBtn) {
        sendBtn.onclick = async () => {
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();

            if (!name || !phone || !address) {
                showToast('Заполните все поля', 'error');
                return;
            }

            const order = {
                userId: currentUser.id,
                date: new Date().toLocaleString(),
                total: cart.reduce((s, i) => s + i.price * i.qty, 0),
                items: cart,
                status: 'В обработке',
                name: name,
                phone: phone,
                address: address
            };

            try {
                // 1. Get max user_order_id for this user
                const { data: maxData } = await supabaseClient
                    .from('orders')
                    .select('user_order_id')
                    .eq('user_id', currentUser.id)
                    .order('user_order_id', { ascending: false })
                    .limit(1);

                const nextId = (maxData && maxData.length > 0) ? maxData[0].user_order_id + 1 : 1;

                // 2. Insert order
                const { error } = await supabaseClient
                    .from('orders')
                    .insert({
                        user_id: currentUser.id,
                        user_order_id: nextId,
                        date: new Date().toISOString(),
                        total: cart.reduce((s, i) => s + i.price * i.qty, 0),
                        items: cart,
                        status: 'В обработке',
                        customer_name: name,
                        customer_phone: phone,
                        customer_address: address
                    });

                if (error) throw error;

                showToast('Заказ оформлен! Спасибо за покупку.', 'success');
                localStorage.removeItem('cart');
                cart = [];
                saveCart();
                orderBlock.style.display = 'none';
            } catch (err) {
                showToast(err.message, 'error');
            }
        };
    }
}

// --- Orders Page Logic ---
const ordersListEl = document.getElementById('ordersList');
let loadOrdersFunc = null;

if (ordersListEl) {
    loadOrdersFunc = async function () {
        if (!currentUser) {
            console.log('currentUser is null, cannot load orders');
            return;
        }

        try {
            const { data: orders, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('id', { ascending: false });

            if (error) throw error;

            if (orders.length === 0) {
                ordersListEl.innerHTML = '<p style="text-align:center; color: var(--muted); padding: 40px;">История заказов пуста</p>';
            } else {
                ordersListEl.innerHTML = '';
                orders.forEach(o => {
                    const el = document.createElement('div');
                    el.className = 'order-card';
                    el.innerHTML = `
                        <div class="order-header">
                            <span>Заказ #${o.user_order_id || o.id}</span>
                            <span>${o.date}</span>
                        </div>
                        
                        ${o.customer_name ? `
                        <div style="font-size: 13px; color: var(--muted); margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #334155;">
                            <b>Получатель:</b> ${o.customer_name}<br>
                            <b>Телефон:</b> ${o.customer_phone}<br>
                            <b>Адрес:</b> ${o.customer_address}
                        </div>
                        ` : ''}
                        <div class="order-items">
                            ${o.items.map(i => `
                                <div class="order-item">
                                    ${i.name} x${i.qty} — <b>${(i.price * i.qty).toLocaleString()} сом</b>
                                </div>
                            `).join('')}
                        </div>
                        <div class="order-total">
                            Итого: ${o.total.toLocaleString()} сом
                        </div>
                        <div class="order-status">
                            Статус: <span style="color: var(--accent)">${o.status || 'В обработке'}</span>
                        </div>
                    `;
                    ordersListEl.appendChild(el);
                });
            }
        } catch (err) {
            console.error(err);
            ordersListEl.innerHTML = '<p style="text-align:center; color: #ef4444; padding: 40px;">Ошибка загрузки заказов</p>';
        }
    };
}

// --- Page Transition Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('pageLoader');

    // 1. Initial Load Fade Out
    setTimeout(() => {
        if (loader) loader.classList.add('hidden');
    }, 100); // Fast fade out on load (100ms)

    // 2. Link Click Interception
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Allow anchor links (#) or empty links to proceed normally
            if (!href || href.startsWith('#') || href.includes('javascript:')) return;

            e.preventDefault();

            // Show loader
            if (loader) loader.classList.remove('hidden');

            // Wait then navigate
            setTimeout(() => {
                window.location.href = href;
            }, 300); // Match CSS transition (300ms)
        });
    });
});
