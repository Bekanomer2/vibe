// ==========================================
// EzShop - Global Configuration & Utilities
// ==========================================

const SUPABASE_URL = 'https://vsxvbrjfuhzvdyzbpjmn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aGa3JAz9zF_lQA2swDU43A_UA4fKskN';

let supabaseClient;
if (!window.supabaseClient && window.supabase) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
supabaseClient = window.supabaseClient;

// Telegram Config
const TG_BOT_TOKEN = '8163887643:AAG8HCPOrR3Eo4FNgsELS8qWEzmF5Nq1OD0';
const TG_CHAT_ID = '-5049916055';

// Global Toast Notifications
function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'info' ? 'ℹ️' : '⚠️');
    toast.innerHTML = `${icon} ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('is-hidden');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
}
