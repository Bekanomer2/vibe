// ==========================================
// EzShop - Administrator Panel & CRUD System
// ==========================================

// Switch tabs between Phones and Brands
function switchAdminTab(tab) {
    const btnProducts = document.getElementById('tabBtnProducts');
    const btnBrands = document.getElementById('tabBtnBrands');
    const contentProducts = document.getElementById('tabContentProducts');
    const contentBrands = document.getElementById('tabContentBrands');

    if (tab === 'products') {
        btnProducts.classList.add('active');
        btnBrands.classList.remove('active');
        contentProducts.classList.add('active');
        contentBrands.classList.remove('active');
    } else {
        btnBrands.classList.add('active');
        btnProducts.classList.remove('active');
        contentBrands.classList.add('active');
        contentProducts.classList.remove('active');
        renderAdminBrandsList();
    }
}

function initAdminDashboard() {
    if (!isAdmin(currentUser)) {
        showToast('Доступ запрещен. Страница доступна только администраторам!', 'error');
        setTimeout(() => {
            window.location.replace('index.html');
        }, 1200);
        return;
    }

    updateAdminStats();
    populateBrandSelect();
    renderAdminProductsTable();
    renderAdminBrandsList();
    updateLivePreview();
}

function updateAdminStats() {
    const totalCountEl = document.getElementById('statTotalCount');
    const brandCountEl = document.getElementById('statBrandCount');

    if (totalCountEl) totalCountEl.textContent = productsData.length;
    const inEl = document.getElementById('statInStock');
    const outEl = document.getElementById('statOutStock');
    if (inEl) inEl.textContent = productsData.filter(p => p.inStock !== false).length;
    if (outEl) outEl.textContent = productsData.filter(p => p.inStock === false).length;
    if (brandCountEl) brandCountEl.textContent = brandsData.length;
}

// ==========================================
// 📱 PHONES CRUD OPERATIONS
// ==========================================

function populateBrandSelect(selectedVal = '') {
    const select = document.getElementById('prodBrand');
    if (!select) return;

    select.innerHTML = brandsData.map(b => `
        <option value="${b.name}" ${b.name === selectedVal ? 'selected' : ''}>
            ${b.name}
        </option>
    `).join('');
}

function renderAdminProductsTable(filterQuery = '') {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const q = filterQuery.toLowerCase();
    const stockMode = window.__adminStock || 'all';
    const list = productsData.filter(p => {
        const matches = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
        const inStock = p.inStock !== false;
        const stockOk = stockMode === 'all' || (stockMode === 'in' ? inStock : !inStock);
        return matches && stockOk;
    });

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--muted); padding: 30px;">Смартфоны не найдены</td></tr>';
        return;
    }

    list.forEach(p => {
        const inStock = p.inStock !== false;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${esc(p.img)}" class="admin-table-thumb" alt="${esc(p.name)}" onerror="this.src='img/logo.png'"></td>
            <td>
                <strong>${esc(p.name)}</strong><br>
                <small class="admin-brand-tag">${esc(p.brand)}</small>
            </td>
            <td>${p.ram} / ${p.storage} ГБ</td>
            <td><b>${p.price.toLocaleString()} сом</b></td>
            <td>
                <button type="button" class="stock-chip ${inStock ? 'in' : 'out'}" onclick="toggleProductStock(${p.id})" title="Нажмите, чтобы переключить наличие">
                    ${inStock ? '● В наличии' : '● Нет в наличии'}
                </button>
            </td>
            <td>
                <div class="admin-table-actions">
                    <button type="button" class="btn-action-edit" onclick="editProductInAdmin(${p.id})">${ico('edit')} Редакт.</button>
                    <button type="button" class="btn-action-delete" onclick="deleteProductInAdmin(${p.id})" aria-label="Удалить ${esc(p.name)}" title="Удалить">${ico('trash')}</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleProductStock(id) {
    if (!isAdmin(currentUser)) {
        showToast('Только администратор может менять наличие!', 'error');
        return;
    }
    const idx = productsData.findIndex(p => p.id === id);
    if (idx > -1) {
        const currentStock = productsData[idx].inStock !== false;
        const newStock = !currentStock;
        productsData[idx].inStock = newStock;
        if (typeof saveStockOverride === 'function') {
            saveStockOverride(id, newStock);
        }
        // Наличие уже синхронизируется отдельной строкой (__STOCK_SYNC__), полный снимок каталога не нужен
        saveProductsData(productsData, false);
        const statusLabel = newStock ? 'В наличии' : 'Нет в наличии';
        showToast(`${productsData[idx].name}: статус изменен на "${statusLabel}"`, 'info');
        filterAdminProducts();
    }
}

function filterAdminProducts() {
    const q = document.getElementById('adminSearchInput')?.value || '';
    renderAdminProductsTable(q);
}

function choosePresetImage(val) {
    if (val) {
        const input = document.getElementById('prodImg');
        if (input) input.value = val;
        updateLivePreview();
    }
}

function updateLivePreview() {
    const name = document.getElementById('prodName')?.value || 'Название модели';
    const price = document.getElementById('prodPrice')?.value || 0;
    const ram = document.getElementById('prodRam')?.value || 8;
    const storage = document.getElementById('prodStorage')?.value || 256;
    const display = document.getElementById('prodDisplay')?.value || '6.7"';
    const battery = document.getElementById('prodBattery')?.value || 5000;
    const color = document.getElementById('prodColor')?.value || 'Цвет';
    const img = document.getElementById('prodImg')?.value || 'img/iPhone 15 pro max.jpg';
    const inStock = document.getElementById('prodInStock')?.value !== 'false';

    const prevName = document.getElementById('prevName');
    const prevPrice = document.getElementById('prevPrice');
    const prevSpecs = document.getElementById('prevSpecs');
    const prevImg = document.getElementById('prevImg');
    const prevStock = document.getElementById('prevStock');
    const prevBtn = document.getElementById('prevBtn');

    if (prevName) prevName.textContent = name;
    if (prevPrice) prevPrice.textContent = `${parseInt(price || 0).toLocaleString()} сом`;
    if (prevSpecs) prevSpecs.innerHTML = `${display} • ${ram}/${storage} ГБ<br>${battery} мАч • ${color}`;
    if (prevImg) prevImg.src = img;
    if (prevStock) {
        prevStock.className = `card-stock ${inStock ? 'in-stock' : 'out-of-stock'}`;
        prevStock.textContent = inStock ? '● В наличии' : '● Нет в наличии';
    }
    if (prevBtn) {
        prevBtn.textContent = inStock ? 'В корзину' : 'Нет в наличии';
        prevBtn.disabled = !inStock;
    }
}

// CREATE & UPDATE Phone
function handleProductFormSubmit(e) {
    e.preventDefault();
    if (!isAdmin(currentUser)) {
        showToast('Только администратор может изменять каталог!', 'error');
        return;
    }

    const editId = document.getElementById('editProductId').value;
    const name = document.getElementById('prodName').value.trim();
    const brand = document.getElementById('prodBrand').value.trim();
    const price = parseInt(document.getElementById('prodPrice').value);
    const color = document.getElementById('prodColor').value.trim();
    const inStock = document.getElementById('prodInStock') ? document.getElementById('prodInStock').value !== 'false' : true;
    const ram = parseInt(document.getElementById('prodRam').value);
    const storage = parseInt(document.getElementById('prodStorage').value);
    const display = document.getElementById('prodDisplay').value.trim();
    const battery = parseInt(document.getElementById('prodBattery').value);
    const img = document.getElementById('prodImg').value.trim() || 'img/iPhone 15 pro max.jpg';
    const description = document.getElementById('prodDescription').value.trim();

    if (editId) {
        // UPDATE
        const targetId = parseInt(editId);
        const idx = productsData.findIndex(p => p.id === targetId);
        if (idx > -1) {
            productsData[idx] = {
                ...productsData[idx],
                name, brand, price, color, inStock, ram, storage, display, battery, img, description
            };
            if (typeof saveStockOverride === 'function') {
                saveStockOverride(targetId, inStock);
            }
            saveProductsData(productsData);
            showToast(`Телефон "${name}" успешно обновлен!`, 'success');
        }
    } else {
        // CREATE
        const newId = productsData.length > 0 ? Math.max(...productsData.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name, brand, price, color, inStock, ram, storage, display, battery, img, description
        };
        productsData.unshift(newProduct);
        if (typeof saveStockOverride === 'function') {
            saveStockOverride(newId, inStock);
        }
        saveProductsData(productsData);
        showToast(`Смартфон "${name}" успешно добавлен в каталог!`, 'success');
    }

    resetForm();
    initAdminDashboard();
}

function editProductInAdmin(id) {
    const p = productsData.find(x => x.id === id);
    if (!p) return;

    document.getElementById('editProductId').value = p.id;
    document.getElementById('prodName').value = p.name;
    populateBrandSelect(p.brand);
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodColor').value = p.color;
    if (document.getElementById('prodInStock')) {
        document.getElementById('prodInStock').value = p.inStock !== false ? 'true' : 'false';
    }
    document.getElementById('prodRam').value = p.ram;
    document.getElementById('prodStorage').value = p.storage;
    document.getElementById('prodDisplay').value = p.display;
    document.getElementById('prodBattery').value = p.battery;
    document.getElementById('prodImg').value = p.img;
    document.getElementById('prodDescription').value = p.description || '';

    document.getElementById('formTitle').textContent = `Редактирование: ${p.name}`;
    document.getElementById('saveProductBtn').textContent = 'Сохранить изменения';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    updateLivePreview();
}

function cancelEditing() {
    resetForm();
}

function resetForm() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    document.getElementById('editProductId').value = '';
    if (document.getElementById('prodInStock')) {
        document.getElementById('prodInStock').value = 'true';
    }
    document.getElementById('formTitle').textContent = 'Добавить новый телефон';
    document.getElementById('saveProductBtn').textContent = 'Сохранить телефон';
    document.getElementById('cancelEditBtn').style.display = 'none';
    populateBrandSelect();
    updateLivePreview();
}

// DELETE Phone
function deleteProductInAdmin(id) {
    if (!isAdmin(currentUser)) {
        showToast('Действие запрещено!', 'error');
        return;
    }

    const p = productsData.find(x => x.id === id);
    if (!p) return;

    if (confirm(`Вы действительно хотите удалить "${p.name}" из каталога?`)) {
        productsData = productsData.filter(x => x.id !== id);
        saveProductsData(productsData);
        showToast(`"${p.name}" удален из каталога`, 'info');
        initAdminDashboard();
    }
}

// ==========================================
// 🏷️ BRANDS CRUD OPERATIONS (без иконок)
// ==========================================

function renderAdminBrandsList() {
    const container = document.getElementById('adminBrandsGrid');
    const countEl = document.getElementById('brandsListCount');
    if (!container) return;

    if (countEl) countEl.textContent = brandsData.length;
    container.innerHTML = '';

    if (brandsData.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); padding: 20px;">Нет добавленных брендов</p>';
        return;
    }

    brandsData.forEach(b => {
        const count = productsData.filter(p => p.brand.toLowerCase() === b.name.toLowerCase()).length;
        const card = document.createElement('div');
        card.className = 'brand-card';
        card.innerHTML = `
            <div class="brand-card-left">
                <div class="brand-card-info">
                    <h4>${esc(b.name)} <span class="brand-count-badge">${count} шт.</span></h4>
                    <span>${esc(b.country || 'Международный бренд')}</span>
                </div>
            </div>
            <div class="brand-actions">
                <button type="button" class="btn-action-edit" onclick="editBrandInAdmin(${b.id})" title="Редактировать" aria-label="Редактировать">${ico('edit')}</button>
                <button type="button" class="btn-action-delete" onclick="deleteBrandInAdmin(${b.id})" title="Удалить" aria-label="Удалить">${ico('trash')}</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// CREATE & UPDATE Brand
function handleBrandFormSubmit(e) {
    e.preventDefault();
    if (!isAdmin(currentUser)) {
        showToast('Только администратор может изменять бренды!', 'error');
        return;
    }

    const editId = document.getElementById('editBrandId').value;
    const name = document.getElementById('brandName').value.trim();
    const country = document.getElementById('brandCountry').value.trim();

    if (editId) {
        // UPDATE Brand & Cascade update in productsData
        const targetId = parseInt(editId);
        const idx = brandsData.findIndex(b => b.id === targetId);
        if (idx > -1) {
            if (brandsData.some(b => b.id !== targetId && b.name.toLowerCase() === name.toLowerCase())) {
                showToast(`Бренд "${name}" уже существует!`, 'error');
                return;
            }
            const oldName = brandsData[idx].name;
            brandsData[idx] = { id: targetId, name, country };
            saveBrandsData(brandsData);

            // Cascade update in products
            if (oldName.toLowerCase() !== name.toLowerCase()) {
                let updatedCount = 0;
                productsData.forEach(p => {
                    if (p.brand.toLowerCase() === oldName.toLowerCase()) {
                        p.brand = name;
                        updatedCount++;
                    }
                });
                if (updatedCount > 0) saveProductsData(productsData);
            }

            showToast(`Бренд "${name}" обновлен!`, 'success');
        }
    } else {
        // CREATE Brand
        const exists = brandsData.some(b => b.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            showToast(`Бренд "${name}" уже существует!`, 'error');
            return;
        }

        const newId = brandsData.length > 0 ? Math.max(...brandsData.map(b => b.id)) + 1 : 1;
        brandsData.push({ id: newId, name, country });
        saveBrandsData(brandsData);
        showToast(`Бренд "${name}" успешно добавлен!`, 'success');
    }

    resetBrandForm();
    populateBrandSelect();
    renderAdminBrandsList();
    updateAdminStats();
}

function editBrandInAdmin(id) {
    const b = brandsData.find(x => x.id === id);
    if (!b) return;

    document.getElementById('editBrandId').value = b.id;
    document.getElementById('brandName').value = b.name;
    document.getElementById('brandCountry').value = b.country;

    document.getElementById('brandFormTitle').textContent = `Редактирование: ${b.name}`;
    document.getElementById('saveBrandBtn').textContent = 'Сохранить изменения';
    document.getElementById('cancelBrandEditBtn').style.display = 'inline-block';

}

function cancelBrandEditing() {
    resetBrandForm();
}

function resetBrandForm() {
    const form = document.getElementById('brandForm');
    if (form) form.reset();
    document.getElementById('editBrandId').value = '';
    document.getElementById('brandFormTitle').textContent = 'Добавить новый бренд';
    document.getElementById('saveBrandBtn').textContent = 'Сохранить бренд';
    document.getElementById('cancelBrandEditBtn').style.display = 'none';
}

// DELETE Brand
function deleteBrandInAdmin(id) {
    if (!isAdmin(currentUser)) {
        showToast('Действие запрещено!', 'error');
        return;
    }

    const b = brandsData.find(x => x.id === id);
    if (!b) return;

    const count = productsData.filter(p => p.brand.toLowerCase() === b.name.toLowerCase()).length;
    let msg = `Удалить бренд "${b.name}"?`;
    if (count > 0) {
        msg += ` Внимание: у этого бренда ${count} привязанных телефонов. Они останутся в каталоге, а бренд продолжит показываться в фильтрах, пока у него есть телефоны.`;
    }

    if (confirm(msg)) {
        brandsData = brandsData.filter(x => x.id !== id);
        saveBrandsData(brandsData);
        showToast(`Бренд "${b.name}" удален`, 'info');
        populateBrandSelect();
        renderAdminBrandsList();
        updateAdminStats();
    }
}
