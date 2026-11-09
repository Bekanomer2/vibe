// ==========================================
// EzShop - Cart & Telegram Notification System
// ==========================================

let cart = [];
const MAX_CART_QTY = 10;

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
    if (p.inStock === false) {
        showToast('К сожалению, этого товара сейчас нет в наличии', 'error');
        return;
    }
    const item = cart.find(i => i.id === p.id);
    if (item) {
        item.qty = Math.min(MAX_CART_QTY, item.qty + qty);
    } else {
        cart.push({ ...p, qty: qty });
    }
    saveCart();
    showToast(`${p.name} добавлен в корзину (${qty} шт.)`, 'success');
}

function quickBuy(p, qty = 1) {
    if (!p) return;
    if (p.inStock === false) {
        showToast('К сожалению, этого товара сейчас нет в наличии', 'error');
        return;
    }
    addToCart(p, qty);
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 400);
}

// Telegram Order Notification with "Возврат" status
async function sendTelegramNotification(order) {
    const message = `
📦 <b>Новый заказ #${order.id} от "${escapeHtml(order.username)}"</b>

👤 <b>Клиент:</b> ${escapeHtml(order.customer_name)}
📞 <b>Телефон:</b> ${escapeHtml(order.customer_phone)}
📍 <b>Адрес:</b> ${escapeHtml(order.customer_address)}

🛒 <b>Товары:</b>
${order.items.map(i => `- ${escapeHtml(i.name)} (x${i.qty})`).join('\n')}

💰 <b>Итого: ${order.total.toLocaleString()} сом</b>
    `;

    try {
        const replyMarkup = typeof getTelegramReplyMarkupForStatus === 'function'
            ? getTelegramReplyMarkupForStatus(order.global_id, 'В обработке')
            : {
                inline_keyboard: [
                    [
                        { text: '🔨 В работу', callback_data: `status:${order.global_id}:В работе` },
                        { text: '❌ Отменить', callback_data: `status:${order.global_id}:Отменен` }
                    ]
                ]
            };

        const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                reply_markup: replyMarkup
            })
        });

        const json = await res.json();
        if (json && json.ok && json.result && json.result.message_id) {
            const msgId = json.result.message_id;
            const updatedItems = [...order.items];
            updatedItems[0] = {
                ...updatedItems[0],
                _tg_msg_id: msgId,
                _tracked_status: 'В обработке'
            };
            if (supabaseClient) {
                await supabaseClient
                    .from('orders')
                    .update({ items: updatedItems })
                    .eq('id', order.global_id);
            }
        }
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
        itemsEl.innerHTML = `
            <div class="cart-empty">
                <div class="empty-ico">${ico('cart')}</div>
                <h3>Ваша корзина пуста</h3>
                <p>Добавьте смартфоны из каталога — они появятся здесь.</p>
                <a href="index.html" class="btn btn-primary">Перейти в каталог</a>
            </div>`;
        totalEl.innerHTML = '<span>Итого</span><b>0 сом</b>';
        const checkoutBtn = document.getElementById('checkout');
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    const checkoutBtn = document.getElementById('checkout');
    if (checkoutBtn) checkoutBtn.style.display = 'inline-flex';

    cart.forEach(item => {
        total += item.price * item.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.style.setProperty('--i', Math.min(cart.indexOf(item), 8));
        row.innerHTML = `
            <img class="cart-thumb" src="${esc(item.img)}" alt="${esc(item.name)}">
            <div class="cart-item-info">
                <h4>${esc(item.name)}</h4>
                <small>${item.price.toLocaleString()} сом</small>
            </div>
            <div class="cart-qty-ctrl">
                <button type="button" onclick="updateQty(${item.id}, -1)" aria-label="Уменьшить количество">−</button>
                <span>${item.qty}</span>
                <button type="button" onclick="updateQty(${item.id}, 1)" aria-label="Увеличить количество">+</button>
            </div>
            <div class="cart-line-total">${(item.price * item.qty).toLocaleString()} сом</div>
            <button type="button" onclick="removeFromCart(${item.id})" class="btn-remove-item" aria-label="Удалить из корзины" title="Удалить">${ico('trash')}</button>
        `;
        itemsEl.appendChild(row);
    });

    totalEl.innerHTML = `<span>Итого</span><b>${total.toLocaleString()} сом</b>`;
}

function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.min(MAX_CART_QTY, item.qty + delta);
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

            // Актуализируем корзину по текущему каталогу: цены и наличие могли измениться
            const oldTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
            const unavailable = [];
            cart = cart.reduce((acc, i) => {
                const fresh = productsData.find(p => p.id === i.id);
                if (!fresh || fresh.inStock === false) {
                    unavailable.push(i.name);
                } else {
                    acc.push({ ...fresh, qty: i.qty });
                }
                return acc;
            }, []);
            const newTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

            if (unavailable.length > 0 || newTotal !== oldTotal) {
                saveCart();
                showToast(
                    unavailable.length > 0
                        ? `Нет в наличии и убрано из корзины: ${unavailable.join(', ')}`
                        : 'Цены в корзине изменились. Проверьте сумму и подтвердите заказ ещё раз.',
                    'error'
                );
                return;
            }

            sendBtn.disabled = true;
            try {
                // Get user order count for user-friendly order ID
                const { data: userOrders } = await supabaseClient
                    .from('orders')
                    .select('user_order_id, status')
                    .or(REAL_ORDERS_FILTER)
                    .eq('user_id', currentUser.id);

                const realUserOrders = (userOrders || []).filter(o => !String(o.status || '').startsWith('__'));
                const nextId = (realUserOrders.length > 0)
                    ? Math.max(...realUserOrders.map(o => o.user_order_id || 0)) + 1
                    : 1;

                const { data: orderData, error } = await supabaseClient
                    .from('orders')
                    .insert({
                        user_id: currentUser.id,
                        user_order_id: nextId,
                        date: new Date().toLocaleString('ru-RU'),
                        total: cart.reduce((s, i) => s + i.price * i.qty, 0),
                        items: cart,
                        status: 'В обработке',
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
                sendBtn.disabled = false;
                showToast(err.message, 'error');
            }
        };
    }
});
