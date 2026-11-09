// ==========================================
// EzShop - Admin All Orders Management System
// ==========================================

let allOrdersList = [];

// Приводит телефон к виду без кода страны и ведущего нуля: +996555123456, 996555123456 и 0555123456 -> 555123456
function normalizePhone(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('996')) digits = digits.slice(3);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
}

async function initAdminOrdersPage() {
    if (!isAdmin(currentUser)) {
        showToast('Доступ запрещен. Страница доступна только администраторам!', 'error');
        setTimeout(() => {
            window.location.replace('index.html');
        }, 1200);
        return;
    }

    await loadAllOrdersFromDB();
}

async function loadAllOrdersFromDB() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center; color: var(--muted); padding: 50px;">Загрузка заказов из базы данных Supabase...</div>';

    try {
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .or(REAL_ORDERS_FILTER)
            .order('id', { ascending: false });

        if (error) throw error;

        allOrdersList = (orders || []).filter(o => !String(o.status || '').startsWith('__'));
        updateOrdersStats();
        filterAdminOrders();
    } catch (err) {
        console.error('Error fetching all orders:', err);
        container.innerHTML = `
            <div style="text-align: center; color: #ef4444; padding: 40px;">
                <h4>Ошибка загрузки заказов из базы данных</h4>
                <p style="font-size: 13px; margin-top: 6px; color: var(--muted);">${err.message}</p>
                <button class="btn-refresh-orders" style="margin-top: 14px;" onclick="loadAllOrdersFromDB()">Повторить попытку</button>
            </div>
        `;
    }
}

function updateOrdersStats() {
    const totalCountEl = document.getElementById('statOrdersCount');
    const revenueEl = document.getElementById('statOrdersRevenue');
    const processingEl = document.getElementById('statOrdersProcessing');
    const returnsEl = document.getElementById('statOrdersReturns');

    if (!totalCountEl) return;

    const total = allOrdersList.length;
    const revenue = allOrdersList.reduce((s, o) => s + (o.total || 0), 0);
    const processing = allOrdersList.filter(o => {
        const s = o.status || 'В обработке';
        return s === 'В обработке' || s === 'В работе';
    }).length;
    const returns = allOrdersList.filter(o => o.status === 'Возврат').length;

    totalCountEl.textContent = total;
    if (revenueEl) revenueEl.textContent = `${revenue.toLocaleString()} сом`;
    if (processingEl) processingEl.textContent = processing;
    if (returnsEl) returnsEl.textContent = returns;
}

function filterAdminOrders() {
    const phoneSearch = document.getElementById('orderPhoneSearch')?.value.trim().toLowerCase() || '';
    const cleanSearch = normalizePhone(phoneSearch);
    const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
    const sortFilter = document.getElementById('orderSortFilter')?.value || 'date_desc';

    let list = [...allOrdersList];

    // 1. Поиск по номеру телефона
    if (cleanSearch) {
        list = list.filter(o => {
            return normalizePhone(o.customer_phone).includes(cleanSearch);
        });
    }

    // 2. Фильтрация по статусу
    if (statusFilter !== 'all') {
        list = list.filter(o => (o.status || 'В обработке') === statusFilter);
    }

    // 3. Сортировка по дате или сумме
    if (sortFilter === 'date_desc') {
        list.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortFilter === 'date_asc') {
        list.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (sortFilter === 'total_desc') {
        list.sort((a, b) => (b.total || 0) - (a.total || 0));
    } else if (sortFilter === 'total_asc') {
        list.sort((a, b) => (a.total || 0) - (b.total || 0));
    }

    renderAdminOrdersList(list);
}

function renderAdminOrdersList(orders) {
    const container = document.getElementById('adminOrdersList');
    const countEl = document.getElementById('filteredOrdersCount');
    if (!container) return;

    if (countEl) countEl.textContent = orders.length;

    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: var(--muted); padding: 50px 20px;">
                <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
                <h3>Заказы не найдены</h3>
                <p style="font-size: 13px; margin-top: 6px;">Попробуйте изменить номер телефона или статус в фильтре</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

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
                    <span class="order-id">Заказ #${o.user_order_id || o.id} <small style="font-size:12px; color:var(--muted); font-weight:normal;">(ID базы: ${o.id})</small></span>
                    <span class="order-date">${o.date}</span>
                </div>
                <div class="order-status-badge ${statusClass}">
                    ${statusIcon} ${statusText}
                </div>
            </div>

            <div class="admin-order-details-grid">
                <!-- Данные клиента -->
                <div class="admin-order-client-box">
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--accent); font-weight:700; margin-bottom:6px;">Клиент и доставка</div>
                    <div><b>👤 Получатель:</b> ${o.customer_name || 'Не указано'}</div>
                    <div style="margin: 4px 0;">
                        <b>📞 Телефон:</b> 
                        <a href="tel:${o.customer_phone}" style="color:var(--accent); font-weight:700; text-decoration:underline;">
                            ${o.customer_phone || 'Не указан'}
                        </a>
                    </div>
                    <div><b>📍 Адрес:</b> ${o.customer_address || 'Самовывоз / Не указан'}</div>
                </div>

                <!-- Управление статусом прямо из карточки (Администратор может выставить любой статус) -->
                <div class="admin-order-status-change-box">
                    <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:var(--muted); font-weight:700; margin-bottom:6px;">Сменить статус заказа:</div>
                    <select class="admin-status-select" onchange="changeOrderStatusFromAdmin(${o.id}, this.value)">
                        <option value="В обработке" ${statusText === 'В обработке' ? 'selected' : ''}>⏳ В обработке</option>
                        <option value="В работе" ${statusText === 'В работе' ? 'selected' : ''}>🔨 В работе</option>
                        <option value="Доставлен" ${statusText === 'Доставлен' ? 'selected' : ''}>✅ Доставлен</option>
                        <option value="Возврат" ${statusText === 'Возврат' ? 'selected' : ''}>🔄 Возврат</option>
                        <option value="Отменен" ${statusText === 'Отменен' ? 'selected' : ''}>❌ Отменен</option>
                    </select>
                </div>
            </div>

            <!-- Список товаров -->
            <div class="order-items" style="margin-top:14px;">
                ${(o.items || []).map(i => `
                    <div class="order-item">
                        <span>📱 ${i.name} × <b>${i.qty} шт.</b></span>
                        <b>${(i.price * i.qty).toLocaleString()} сом</b>
                    </div>
                `).join('')}
            </div>

            <!-- Итог -->
            <div class="order-total-footer">
                <span>Итоговая сумма заказа:</span>
                <span class="order-total-sum">${(o.total || 0).toLocaleString()} сом</span>
            </div>
        `;
        container.appendChild(el);
    });
}

// Изменение статуса заказа администратором в Supabase
async function changeOrderStatusFromAdmin(orderId, newStatus) {
    if (!isAdmin(currentUser)) {
        showToast('Только администратор может менять статус заказа!', 'error');
        return;
    }

    const target = allOrdersList.find(o => o.id === orderId);
    if (!target) return;
    if ((target.status || 'В обработке') === newStatus) return;

    try {
        // Подготавливаем обновленные items с новым _tracked_status для синхронизации с Telegram
        let updatedItems = Array.isArray(target.items) ? [...target.items] : [];
        let tgMsgId = null;

        if (updatedItems.length > 0) {
            tgMsgId = updatedItems[0]._tg_msg_id;
            updatedItems[0] = {
                ...updatedItems[0],
                _tracked_status: newStatus
            };
        }

        const updatePayload = {
            status: newStatus
        };
        if (updatedItems.length > 0) {
            updatePayload.items = updatedItems;
        }

        const { error } = await supabaseClient
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId);

        if (error) throw error;

        // Обновляем локальный кеш
        target.status = newStatus;
        if (updatedItems.length > 0) {
            target.items = updatedItems;
        }

        // Обновляем кнопки в самом сообщении Telegram, если есть msgId
        if (tgMsgId && typeof updateTelegramMessageKeyboard === 'function') {
            await updateTelegramMessageKeyboard(tgMsgId, orderId, newStatus);
        }

        showToast(`Статус заказа #${orderId} изменен на "${newStatus}"`, 'success');
        updateOrdersStats();
        filterAdminOrders();
    } catch (err) {
        console.error('Error updating order status:', err);
        showToast('Ошибка обновления статуса: ' + err.message, 'error');
    }
}
