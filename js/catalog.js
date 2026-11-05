// ==========================================
// EzShop - Catalog & Dynamic Filtering System
// ==========================================

const productsEl = document.getElementById('products');

function renderProducts(list) {
    if (!productsEl) return;
    productsEl.innerHTML = '';

    const countEl = document.getElementById('productsCount');
    if (countEl) countEl.textContent = list.length;

    if (list.length === 0) {
        productsEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--muted);">
                <h3>Ничего не найдено 🔍</h3>
                <p style="margin-top: 8px;">Попробуйте изменить параметры фильтрации или поисковый запрос</p>
            </div>
        `;
        return;
    }

    list.forEach(p => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `
            <div class="card-badges">
                <button class="btn-compare" data-id="${p.id}" onclick="toggleCompare(${p.id}, event)" title="Добавить к сравнению">⚖️</button>
                <button class="btn-fav" data-id="${p.id}" onclick="toggleFavorite(${p.id}, event)" title="В избранное">🤍</button>
            </div>
            <a href="product.html?id=${p.id}" class="card-img-link">
                <img src="${p.img}" alt="${p.name}" loading="lazy">
            </a>
            <a href="product.html?id=${p.id}" class="card-title-link">
                <h3>${p.name}</h3>
            </a>
            <div class="specs">
                ${p.display} • ${p.ram}/${p.storage} ГБ<br>
                ${p.battery} мАч • ${p.color}
            </div>
            <div class="price">${p.price.toLocaleString()} сом</div>
            <div class="card-actions">
                <button class="btn-add-cart" onclick="addToCart(productsData.find(x => x.id === ${p.id}))">В корзину</button>
                <a href="product.html?id=${p.id}" class="btn-details" title="Подробнее">Инфо</a>
            </div>
        `;
        productsEl.appendChild(c);
    });

    if (typeof updateFavoritesUI === 'function') updateFavoritesUI();
    if (typeof updateCompareBar === 'function') updateCompareBar();
}

function renderFilters() {
    // Dynamic brands from brandsData + any extra from productsData
    const allBrandNames = [...new Set([
        ...brandsData.map(b => b.name),
        ...productsData.map(p => p.brand)
    ])].sort();

    const rams = [...new Set(productsData.map(p => p.ram))].sort((a, b) => a - b);
    const storages = [...new Set(productsData.map(p => p.storage))].sort((a, b) => a - b);

    const brandContainer = document.getElementById('brandFilters');
    const ramContainer = document.getElementById('ramFilters');
    const storageContainer = document.getElementById('storageFilters');

    if (brandContainer) {
        brandContainer.innerHTML = allBrandNames.map(b => `
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

    if (!search || !sort) return;

    const selectedBrands = Array.from(document.querySelectorAll('#brandFilters input:checked')).map(cb => cb.value.toLowerCase());
    const selectedRam = Array.from(document.querySelectorAll('#ramFilters input:checked')).map(cb => parseInt(cb.value));
    const selectedStorage = Array.from(document.querySelectorAll('#storageFilters input:checked')).map(cb => parseInt(cb.value));

    let list = [...productsData];
    const min = minPrice && minPrice.value ? parseFloat(minPrice.value) : 0;
    const max = maxPrice && maxPrice.value ? parseFloat(maxPrice.value) : Infinity;
    const q = search.value.trim().toLowerCase();

    if (selectedBrands.length > 0) {
        list = list.filter(p => selectedBrands.includes(p.brand.toLowerCase()));
    }
    if (selectedRam.length > 0) {
        list = list.filter(p => selectedRam.includes(p.ram));
    }
    if (selectedStorage.length > 0) {
        list = list.filter(p => selectedStorage.includes(p.storage));
    }

    // Filter only favorites
    const onlyFav = document.getElementById('onlyFavoritesCheck')?.checked;
    if (onlyFav) {
        const favIds = getFavoriteIds();
        list = list.filter(p => favIds.includes(p.id));
    }

    if (sort.value === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort.value === 'za') list.sort((a, b) => b.name.localeCompare(a.name));
    if (sort.value === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort.value === 'price_desc') list.sort((a, b) => b.price - a.price);

    list = list.filter(p => p.price >= min && p.price <= max && (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)));
    renderProducts(list);
}

function resetAllFilters() {
    const search = document.getElementById('search');
    const sort = document.getElementById('sort');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    if (search) search.value = '';
    if (sort) sort.value = 'default';
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';

    document.querySelectorAll('.sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
    applyFilters();
    showToast('Фильтры сброшены', 'info');
}

document.addEventListener('DOMContentLoaded', () => {
    if (productsEl) {
        renderFilters();
        renderProducts(productsData);
    }
});
