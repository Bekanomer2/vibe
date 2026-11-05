// ==========================================
// EzShop - Cart & Telegram Notification System
// ==========================================

let cart = [];

function loadCart() {
    if (!currentUser) return;
    const key = `cart_${currentUser.id}`;
    cart = JSON.parse(localStorage.getItem(key)) || [];
    updateCartIcon();
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
}

function saveCart() {
    if (!currentUser) return;
    const key = `cart_${currentUser.id}`;
    localStorage.setItem(key, JSON.stringify(cart));
    updateCartIcon();
    if (document.getElementById('items')) renderCart();
}

function updateCartIcon() {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function addToCart(p, qty = 1) {
    if (!p) return;
    const item = cart.find(i => i.id === p.id);
    if (item) {
        item.qty += qty;
    } else {
        cart.push({ ...p, qty: qty });
    }
    saveCart();
    showToast(`${p.name} добавлен в корзину (${qty} шт.)`, 'success');
}

function quickBuy(p, qty = 1) {
    addToCart(p, qty);
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 400);
}

// Telegram Order Notification with "Возврат" status
async function sendTelegramNotification(order) {
    const message = `
📦 <b>Новый заказ #${order.id} от "${order.username}"</b>

👤 <b>Клиент:</b> ${order.customer_name}
📞 <b>Телефон:</b> ${order.customer_phone}
📍 <b>Адрес:</b> ${order.customer_address}

🛒 <b>Товары:</b>
${order.items.map(i => `- ${i.name} (x${i.qty})`).join('\n')}

💰 <b>Итого: ${order.total.toLocaleString()} сом</b>
    `;

    try {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🔨 В работу', callback_data: `status:${order.global_id}:В работе` },
                            { text: '✅ Доставлен', callback_data: `status:${order.global_id}:Доставлен` }
                        ],
                        [
                            { text: '🔄 Возврат', callback_data: `status:${order.global_id}:Возврат` },
                            { text: '❌ Отменить', callback_data: `status:${order.global_id}:Отменен` }
                        ]
                    ]
                }
            })
        });
    } catch (err) {
        console.error('Telegram notification error:', err);
    }
}

// Cart Page Rendering
function renderCart() {
    const itemsEl = document.getElementById('items');
    const totalEl = document.getElementById('total');
    if (!itemsEl || !totalEl) return;

    itemsEl.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p style="text-align:center; color: var(--muted); padding: 40px;">Ваша корзина пуста</p>';
        totalEl.innerHTML = 'Итого: 0 сом';
        const checkoutBtn = document.getElementById('checkout');
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) checkoutBtn.style.display = 'inline-block';

    cart.forEach(item => {
        total += item.price * item.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${item.img}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
            <div style="flex:1;">
                <h4 style="margin:0;">${item.name}</h4>
                <small style="color:var(--muted);">${item.price.toLocaleString()} сом</small>
            </div>
            <div class="cart-qty-ctrl">
                <button onclick="updateQty(${item.id}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <div style="font-weight:700;">${(item.price * item.qty).toLocaleString()} сом</div>
            <button onclick="removeFromCart(${item.id})" class="btn-remove-item">✕</button>
        `;
        itemsEl.appendChild(row);
    });

    totalEl.innerHTML = `Итого: <span style="color: var(--accent); font-weight: 800;">${total.toLocaleString()} сом</span>`;
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    renderCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    showToast('Товар удален из корзины', 'info');
}

// Checkout Logic
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkout');
    if (!checkoutBtn) return;

    const orderBlock = document.getElementById('order');
    const sendBtn = document.getElementById('send');

    checkoutBtn.onclick = () => {
        if (cart.length === 0) return;
        orderBlock.style.display = orderBlock.style.display === 'none' ? 'block' : 'none';
        if (orderBlock.style.display === 'block') {
            orderBlock.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (sendBtn) {
        sendBtn.onclick = async () => {
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();

            if (name.length < 2) {
                showToast('Пожалуйста, укажите корректное имя (не менее 2 букв)', 'error');
                return;
            }

            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            const isKgPlus = /^\+996\d{9}$/.test(cleanPhone);
            const isKgWithoutPlus = /^996\d{9}$/.test(cleanPhone);
            const isKgLocal = /^0\d{9}$/.test(cleanPhone);

            if (!isKgPlus && !isKgWithoutPlus && !isKgLocal) {
                showToast('Номер телефона должен быть в формате +996XXXXXXXXX или 0XXXXXXXXX', 'error');
                return;
            }

            const hasLetters = /[a-zA-Zа-яА-ЯёЁ]/.test(address);
            const hasDigits = /\d/.test(address);

            if (!hasLetters || !hasDigits) {
                showToast('Пожалуйста, укажите полный адрес (улицу и номер дома)', 'error');
                return;
            }

            try {
                // Get user order count for user-friendly order ID
                const { data: userOrders } = await supabaseClient
                    .from('orders')
                    .select('user_order_id')
                    .eq('user_id', currentUser.id);

                const nextId = (userOrders && userOrders.length > 0)
                    ? Math.max(...userOrders.map(o => o.user_order_id || 0)) + 1
                    : 1;

                const { data: orderData, error } = await supabaseClient
                    .from('orders')
                    .insert({
                        user_id: currentUser.id,
                        user_order_id: nextId,
                        date: new Date().toLocaleString('ru-RU'),
                        total: cart.reduce((s, i) => s + i.price * i.qty, 0),
                        items: cart,
                        status: 'В работе',
                        customer_name: name,
                        customer_phone: phone,
                        customer_address: address
                    })
                    .select();

                if (error) throw error;
                const globalId = orderData[0].id;

                sendTelegramNotification({
                    id: nextId,
                    global_id: globalId,
                    username: currentUser.username,
                    customer_name: name,
                    customer_phone: phone,
                    customer_address: address,
                    items: cart,
                    total: cart.reduce((s, i) => s + i.price * i.qty, 0)
                });

                showToast('Заказ оформлен! Спасибо за покупку.', 'success');
                cart = [];
                saveCart();
                orderBlock.style.display = 'none';

                setTimeout(() => {
                    window.location.href = 'orders.html';
                }, 1000);
            } catch (err) {
                showToast(err.message, 'error');
            }
        };
    }
});
