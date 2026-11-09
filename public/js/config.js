// ==========================================
// EzShop - Global Configuration & Utilities
// ==========================================

// Значения подставляются из .env (VITE_SUPABASE_URL / VITE_SUPABASE_KEY) через vite.config.js
const ENV = window.__ENV__ || {};
const SUPABASE_URL = ENV.VITE_SUPABASE_URL || 'https://vsxvbrjfuhzvdyzbpjmn.supabase.co';
const SUPABASE_KEY = ENV.VITE_SUPABASE_KEY || 'sb_publishable_aGa3JAz9zF_lQA2swDU43A_UA4fKskN';

let supabaseClient;
if (!window.supabaseClient && window.supabase && SUPABASE_URL && SUPABASE_KEY) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
supabaseClient = window.supabaseClient;

// Telegram Config
const TG_BOT_TOKEN = '8163887643:AAG8HCPOrR3Eo4FNgsELS8qWEzmF5Nq1OD0';
const TG_CHAT_ID = '-5049916055';

// PostgREST-фильтр: только настоящие заказы (без служебных строк со статусом __REVIEW__, __STOCK_SYNC__ и т.д.)
const REAL_ORDERS_FILTER = 'status.is.null,status.not.like.\\_\\_*';

// Экранирование текста для Telegram parse_mode=HTML (и вставки в HTML)
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Global Toast Notifications
let activeToastTimer = null;
function showToast(msg, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Clear previous toast to prevent jumping/stacking shift
    if (activeToastTimer) {
        clearTimeout(activeToastTimer);
        activeToastTimer = null;
    }
    container.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'info' ? 'ℹ️' : '⚠️');
    toast.innerHTML = `${icon} <span>${msg}</span>`;
    container.appendChild(toast);

    activeToastTimer = setTimeout(() => {
        toast.classList.add('is-hidden');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// ==========================================
// Telegram Order Status Rules & Keyboard Sync
// ==========================================

// Returns the allowed inline buttons in Telegram based on current order status
function getTelegramReplyMarkupForStatus(globalOrderId, status) {
    const st = status || 'В обработке';

    // Для новых заказов (В обработке) и заказов в процессе (В работе) доступны основные действия
    if (st === 'В обработке' || st === 'В работе') {
        return {
            inline_keyboard: [
                [
                    { text: '🔨 В работу', callback_data: `status:${globalOrderId}:В работе` },
                    { text: '✅ Доставлен', callback_data: `status:${globalOrderId}:Доставлен` }
                ],
                [
                    { text: '🔄 Возврат', callback_data: `status:${globalOrderId}:Возврат` },
                    { text: '❌ Отменить', callback_data: `status:${globalOrderId}:Отменен` }
                ]
            ]
        };
    }

    if (st === 'Доставлен') {
        // Если заказ доставлен, через Telegram можно перевести ТОЛЬКО в "Возврат"
        return {
            inline_keyboard: [
                [
                    { text: '🔄 Возврат', callback_data: `status:${globalOrderId}:Возврат` }
                ]
            ]
        };
    }

    // Если статус "Возврат" или "Отменен" — в Telegram кнопки скрываются (финальный статус)
    return {
        inline_keyboard: []
    };
}

// Updates the inline keyboard of an order message in Telegram
async function updateTelegramMessageKeyboard(tgMsgId, globalOrderId, status) {
    if (!tgMsgId || !globalOrderId) return;
    try {
        const replyMarkup = getTelegramReplyMarkupForStatus(globalOrderId, status);
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/editMessageReplyMarkup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                message_id: tgMsgId,
                reply_markup: replyMarkup
            })
        });
    } catch (err) {
        console.warn('Could not update Telegram message keyboard:', err);
    }
}

// Sends an alert to the Telegram chat when an invalid status transition is attempted via Telegram
async function sendTelegramAlertMessage(text) {
    try {
        await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (err) {
        console.warn('Telegram alert error:', err);
    }
}

// Business logic for status changes coming from Telegram:
// - From "В работе": can change to "Доставлен", "Возврат", "Отменен"
// - From "Доставлен": can ONLY change to "Возврат"
// - From "Возврат" or "Отменен": cannot be changed via Telegram (only Admin on website can override)
function isTelegramTransitionAllowed(oldStatus, newStatus) {
    if (oldStatus === newStatus) return true;
    if (oldStatus === 'В обработке' || oldStatus === 'В работе') return true;
    if (oldStatus === 'Доставлен') {
        return newStatus === 'Возврат';
    }
    if (oldStatus === 'Возврат' || oldStatus === 'Отменен') {
        return false;
    }
    return true;
}

// Validates orders against unauthorized Telegram status transitions and syncs Telegram keyboards
let isValidatingTgOrders = false;
async function validateTelegramOrderTransitions(ordersList) {
    if (!supabaseClient || isValidatingTgOrders || !Array.isArray(ordersList)) return false;
    isValidatingTgOrders = true;
    let anyChanged = false;

    try {
        for (const o of ordersList) {
            if (!o || String(o.status || '').startsWith('__')) continue;
            if (!Array.isArray(o.items) || o.items.length === 0) continue;

            const currentStatus = o.status || 'В обработке';
            const trackedStatus = o.items[0]._tracked_status;
            const tgMsgId = o.items[0]._tg_msg_id;

            // 1. If _tracked_status was never initialized on this order, initialize it now
            if (!trackedStatus) {
                const updatedItems = [...o.items];
                updatedItems[0] = { ...updatedItems[0], _tracked_status: currentStatus };
                o.items = updatedItems;
                await supabaseClient
                    .from('orders')
                    .update({ items: updatedItems })
                    .eq('id', o.id);

                if (tgMsgId) {
                    await updateTelegramMessageKeyboard(tgMsgId, o.id, currentStatus);
                }
                continue;
            }

            // 2. If currentStatus !== trackedStatus, the status was changed externally via Telegram!
            if (currentStatus !== trackedStatus) {
                const allowed = isTelegramTransitionAllowed(trackedStatus, currentStatus);

                if (!allowed) {
                    // Откатываем запрещённую смену из Telegram, но только если статус всё ещё тот,
                    // что мы прочитали (иначе админ уже изменил его на сайте — не затираем его решение)
                    const { data: reverted } = await supabaseClient
                        .from('orders')
                        .update({ status: trackedStatus })
                        .eq('id', o.id)
                        .eq('status', currentStatus)
                        .select('id');

                    if (!reverted || reverted.length === 0) continue;

                    o.status = trackedStatus;
                    anyChanged = true;

                    if (tgMsgId) {
                        await updateTelegramMessageKeyboard(tgMsgId, o.id, trackedStatus);
                    }

                    const orderNum = o.user_order_id || o.id;
                    const reasonText = trackedStatus === 'Доставлен'
                        ? 'Если заказ уже <b>«✅ Доставлен»</b>, через Telegram его можно перевести только в статус <b>«🔄 Возврат»</b>.'
                        : `Статус <b>«${trackedStatus}»</b> является финальным.`;

                    await sendTelegramAlertMessage(
                        `⚠️ <b>Отклонено изменение статуса Заказа #${orderNum} (ID: ${o.id})</b>\n\n` +
                        `Нельзя изменить статус с <b>«${trackedStatus}»</b> на <b>«${currentStatus}»</b> через Telegram.\n` +
                        `${reasonText}\n\n` +
                        `<i>💡 Если статус был выбран сотрудником по ошибке, исправить его на любой статус может Администратор на сайте.</i>`
                    );
                } else {
                    // Valid transition from Telegram! Lock in the new _tracked_status and update TG keyboard
                    const updatedItems = [...o.items];
                    updatedItems[0] = { ...updatedItems[0], _tracked_status: currentStatus };
                    o.items = updatedItems;
                    anyChanged = true;

                    await supabaseClient
                        .from('orders')
                        .update({ items: updatedItems })
                        .eq('id', o.id);

                    if (tgMsgId) {
                        await updateTelegramMessageKeyboard(tgMsgId, o.id, currentStatus);
                    }
                }
            }
        }
    } catch (err) {
        console.warn('Error validating Telegram order transitions:', err);
    } finally {
        isValidatingTgOrders = false;
    }

    return anyChanged;
}

// Background guard to enforce Telegram transition rules while website is open
let tgGuardInterval = null;
function startTelegramStatusGuard() {
    if (tgGuardInterval || !supabaseClient) return;

    const runCheck = async () => {
        if (!currentUser) return;
        try {
            const { data: orders, error } = await supabaseClient
                .from('orders')
                .select('*')
                .or(REAL_ORDERS_FILTER)
                .order('id', { ascending: false })
                .limit(30);

            if (!error && orders) {
                const realOrders = orders.filter(o => !String(o.status || '').startsWith('__'));
                const changed = await validateTelegramOrderTransitions(realOrders);
                if (changed) {
                    if (typeof loadOrdersFunc === 'function' && document.getElementById('ordersList')) {
                        loadOrdersFunc();
                    }
                    if (typeof loadAllOrdersFromDB === 'function' && document.getElementById('adminOrdersList')) {
                        loadAllOrdersFromDB();
                    }
                }
            }
        } catch (e) {
            // Ignore transient network errors
        }
    };

    // Run initial check and then every 4 seconds
    setTimeout(runCheck, 1500);
    tgGuardInterval = setInterval(runCheck, 4000);
}
