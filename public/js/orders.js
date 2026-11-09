// ==========================================
// EzShop - Orders History & Tracker Logic
// ==========================================

const ordersListEl = document.getElementById('ordersList');

async function loadOrdersFunc() {
    if (!ordersListEl || !currentUser) return;

    try {
        const { data: rawOrders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .or(REAL_ORDERS_FILTER)
            .eq('user_id', currentUser.id)
            .order('id', { ascending: false });

        if (error) throw error;

        const orders = (rawOrders || []).filter(o => !String(o.status || '').startsWith('__'));

        if (orders.length === 0) {
            ordersListEl.innerHTML = '<p style="text-align:center; color: var(--muted); padding: 40px;">История заказов пуста. Время сделать первую покупку!</p>';
            return;
        }

        ordersListEl.innerHTML = '';
        orders.forEach(o => {
            const statusText = o.status || 'В обработке';
            let statusClass = 'status-pending';
            let statusIcon = '⏳';

            if (statusText === 'В работе') {
                statusClass = 'status-processing';
                statusIcon = '🔨';
            } else if (statusText === 'Доставлен') {
                statusClass = 'status-delivered';
                statusIcon = '✅';
            } else if (statusText === 'Возврат') {
                statusClass = 'status-return';
                statusIcon = '🔄';
            } else if (statusText === 'Отменен') {
                statusClass = 'status-cancelled';
                statusIcon = '❌';
            }

            const el = document.createElement('div');
            el.className = 'order-card';
            el.innerHTML = `
                <div class="order-header">
                    <div>
                        <span class="order-id">Заказ #${o.user_order_id || o.id}</span>
                        <span class="order-date">${o.date}</span>
                    </div>
                    <div class="order-status-badge ${statusClass}">
                        ${statusIcon} ${statusText}
                    </div>
                </div>

                <!-- Визуальный трекер этапа заказа (Оформлен ➔ В обработке ➔ В работе ➔ Доставлен/Возврат) -->
                <div class="order-tracker">
                    <div class="tracker-step active">
                        <span class="tracker-dot"></span>
                        <span class="tracker-label">Оформлен</span>
                    </div>
                    <div class="tracker-line ${statusText !== 'Отменен' ? 'active' : ''}"></div>
                    <div class="tracker-step ${statusText !== 'Отменен' ? 'active' : ''}">
                        <span class="tracker-dot"></span>
                        <span class="tracker-label">В обработке</span>
                    </div>
                    <div class="tracker-line ${statusText === 'В работе' || statusText === 'Доставлен' || statusText === 'Возврат' ? 'active' : ''}"></div>
                    <div class="tracker-step ${statusText === 'В работе' || statusText === 'Доставлен' || statusText === 'Возврат' ? 'active' : ''}">
                        <span class="tracker-dot"></span>
                        <span class="tracker-label">В работе</span>
                    </div>
                    <div class="tracker-line ${statusText === 'Доставлен' || statusText === 'Возврат' ? 'active' : ''}"></div>
                    <div class="tracker-step ${statusText === 'Доставлен' ? 'active done' : (statusText === 'Возврат' ? 'active return' : (statusText === 'Отменен' ? 'active cancelled' : ''))}">
                        <span class="tracker-dot"></span>
                        <span class="tracker-label">${statusText === 'Возврат' ? 'Возврат' : (statusText === 'Отменен' ? 'Отменен' : 'Доставлен')}</span>
                    </div>
                </div>
                
                ${o.customer_name ? `
                <div class="order-customer-info">
                    <div><b>Получатель:</b> ${o.customer_name}</div>
                    <div><b>Телефон:</b> ${o.customer_phone}</div>
                    <div><b>Адрес:</b> ${o.customer_address}</div>
                </div>
                ` : ''}

                <div class="order-items">
                    ${(o.items || []).map(i => `
                        <div class="order-item">
                            <span>${i.name} × ${i.qty}</span>
                            <b>${(i.price * i.qty).toLocaleString()} сом</b>
                        </div>
                    `).join('')}
                </div>

                <div class="order-total-footer">
                    <span>Итого к оплате:</span>
                    <span class="order-total-sum">${o.total.toLocaleString()} сом</span>
                </div>
            `;
            ordersListEl.appendChild(el);
        });
    } catch (err) {
        console.error('Error loading orders:', err);
        ordersListEl.innerHTML = '<p style="text-align:center; color: #ef4444; padding: 40px;">Ошибка загрузки истории заказов</p>';
    }
}
