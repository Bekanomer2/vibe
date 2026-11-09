// ==========================================
// EzShop - Wishlist / Favorites System
// ==========================================

function getFavoriteIds() {
    try {
        return JSON.parse(localStorage.getItem('ez_fav_ids')) || [];
    } catch (e) {
        return [];
    }
}

function toggleFavorite(id, e) {
    if (e) e.stopPropagation();
    let favs = getFavoriteIds();
    const idx = favs.indexOf(id);
    const prod = productsData.find(p => p.id === id);
    const name = prod ? prod.name : 'Товар';

    if (idx > -1) {
        favs.splice(idx, 1);
        showToast(`${name} удален из избранного`, 'info');
    } else {
        favs.push(id);
        showToast(`${name} добавлен в избранное ❤️`, 'success');
    }
    localStorage.setItem('ez_fav_ids', JSON.stringify(favs));
    updateFavoritesUI();

    // If modal is currently open, re-render it
    const modal = document.getElementById('favoritesModal');
    if (modal && modal.style.display === 'flex') {
        renderFavoritesModalContent();
    }
}

function updateFavoritesUI() {
    const favs = getFavoriteIds();

    // Update header count badges
    document.querySelectorAll('.nav-fav-count').forEach(el => {
        el.textContent = favs.filter(id => productsData.some(p => p.id === id)).length;
    });

    // Update heart icons on cards
    document.querySelectorAll('.btn-fav').forEach(btn => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (favs.includes(id)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
        }
    });
}

function openFavoritesModal() {
    let modal = document.getElementById('favoritesModal');
    if (!modal) {
        createFavoritesModalElement();
        modal = document.getElementById('favoritesModal');
    }

    renderFavoritesModalContent();
    modal.style.display = 'flex';
}

function closeFavoritesModal() {
    const modal = document.getElementById('favoritesModal');
    if (modal) modal.style.display = 'none';
}

function renderFavoritesModalContent() {
    const container = document.getElementById('favoritesModalBody');
    if (!container) return;

    const favIds = getFavoriteIds();
    const items = favIds.map(id => productsData.find(p => p.id === id)).filter(Boolean);

    if (items.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: var(--muted);">
                <div style="font-size: 48px; margin-bottom: 14px;">🤍</div>
                <h3 style="color: var(--text); margin-bottom: 8px;">Список избранного пуст</h3>
                <p style="font-size: 14px;">Нажимайте на сердечко на карточках телефонов, чтобы сохранить понравившиеся модели!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="favorites-grid">
            ${items.map(p => `
                <div class="fav-card">
                    <img src="${p.img}" alt="${p.name}" class="fav-thumb">
                    <div class="fav-info">
                        <h4>${p.name}</h4>
                        <div class="fav-specs">${p.ram}/${p.storage} ГБ • ${p.color} • ${p.inStock !== false ? '<span style="color:var(--success)">В наличии</span>' : '<span style="color:#ef4444">Нет в наличии</span>'}</div>
                        <div class="fav-price">${p.price.toLocaleString()} сом</div>
                    </div>
                    <div class="fav-actions">
                        ${p.inStock !== false
                            ? `<button class="auth-btn" style="padding: 8px 14px; font-size: 13px;" onclick="addToCart(productsData.find(x => x.id === ${p.id}))">В корзину</button>`
                            : `<button class="auth-btn" style="padding: 8px 14px; font-size: 13px; background: #334155; color: #94a3b8; cursor: not-allowed;" disabled>Нет в наличии</button>`
                        }
                        <button class="btn-fav-remove" onclick="toggleFavorite(${p.id})">✕ Убрать</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function createFavoritesModalElement() {
    const div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'favoritesModal';
    div.style.display = 'none';
    div.innerHTML = `
        <div class="modal-content" style="max-width: 650px;">
            <div class="modal-header">
                <h3>❤️ Избранные смартфоны</h3>
                <button class="modal-close" onclick="closeFavoritesModal()">&times;</button>
            </div>
            <div id="favoritesModalBody" style="padding: 24px; max-height: 70vh; overflow-y: auto;"></div>
        </div>
    `;
    document.body.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
    createFavoritesModalElement();
    updateFavoritesUI();
});
