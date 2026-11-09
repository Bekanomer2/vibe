// ==========================================
// EzShop - Smartphone Comparison System
// ==========================================

function getCompareIds() {
    try {
        return JSON.parse(localStorage.getItem('ez_compare_ids')) || [];
    } catch (e) {
        return [];
    }
}

function toggleCompare(id, e) {
    if (e) {
        e.stopPropagation();
        if (e.currentTarget && typeof e.currentTarget.blur === 'function') {
            e.currentTarget.blur();
        }
    }
    let comp = getCompareIds();
    const idx = comp.indexOf(id);
    const prod = productsData.find(p => p.id === id);
    const name = prod ? prod.name : 'Товар';

    if (idx > -1) {
        comp.splice(idx, 1);
        showToast(`${name} убран из сравнения`, 'info');
    } else {
        if (comp.length >= 4) {
            showToast('Максимум 4 модели для одновременного сравнения', 'error');
            return;
        }
        comp.push(id);
        showToast(`${name} добавлен к сравнению ⚖️`, 'success');
    }
    localStorage.setItem('ez_compare_ids', JSON.stringify(comp));
    updateCompareBar();
}

function removeFromCompareModal(id) {
    let comp = getCompareIds();
    const idx = comp.indexOf(id);
    const prod = productsData.find(p => p.id === id);
    const name = prod ? prod.name : 'Товар';

    if (idx > -1) {
        comp.splice(idx, 1);
        localStorage.setItem('ez_compare_ids', JSON.stringify(comp));
        showToast(`${name} убран из сравнения`, 'info');
    }

    updateCompareBar();

    if (comp.length === 0) {
        const container = document.getElementById('compareTableContainer');
        if (container) container.innerHTML = '';
        closeCompareModal();
    } else {
        openCompareModal();
    }
}

function clearCompare() {
    localStorage.removeItem('ez_compare_ids');
    updateCompareBar();
    const container = document.getElementById('compareTableContainer');
    if (container) container.innerHTML = '';
    closeCompareModal();
    showToast('Список сравнения очищен', 'info');
}

function updateCompareBar() {
    const comp = getCompareIds();
    const bar = document.getElementById('compareBar');
    const navCount = document.getElementById('navCompareCount');
    if (navCount) navCount.textContent = comp.filter(id => productsData.some(p => p.id === id)).length;

    if (bar) {
        if (comp.length > 0) {
            bar.style.display = 'flex';
            const textEl = document.getElementById('compareBarText');
            if (textEl) textEl.textContent = `Выбрано для сравнения: ${comp.length} из 4`;
        } else {
            bar.style.display = 'none';
        }
    }

    document.querySelectorAll('.btn-compare').forEach(btn => {
        const id = parseInt(btn.getAttribute('data-id'));
        if (comp.includes(id)) {
            btn.classList.add('active');
            btn.setAttribute('title', 'Убрать из сравнения');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('title', 'Добавить к сравнению');
            if (document.activeElement === btn) btn.blur();
        }
    });
}

function openCompareModal() {
    const comp = getCompareIds();
    const container = document.getElementById('compareTableContainer');
    const modal = document.getElementById('compareModal');

    if (comp.length === 0) {
        if (container) container.innerHTML = '';
        if (modal && modal.style.display === 'flex') {
            closeCompareModal();
        } else {
            showToast('Добавьте хотя бы один смартфон для сравнения (иконка ⚖️)', 'info');
        }
        return;
    }

    const items = comp.map(id => productsData.find(p => p.id === id)).filter(Boolean);
    if (items.length === 0) {
        if (container) container.innerHTML = '';
        closeCompareModal();
        return;
    }

    if (!container || !modal) return;

    let html = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th style="min-width: 140px;">Параметр</th>
                    ${items.map(p => `
                        <th>
                            <div class="compare-th-card">
                                <img src="${p.img}" alt="${p.name}">
                                <h4>${p.name}</h4>
                                <div class="compare-price">${p.price.toLocaleString()} сом</div>
                                <button class="btn-compare-remove" onclick="removeFromCompareModal(${p.id})">✕ Убрать</button>
                            </div>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><b>Наличие</b></td>
                    ${items.map(p => `
                        <td>
                            ${p.inStock !== false
                                ? '<span style="color: var(--success); font-weight: 700;">● В наличии</span>'
                                : '<span style="color: #ef4444; font-weight: 700;">● Нет в наличии</span>'}
                        </td>
                    `).join('')}
                </tr>
                <tr>
                    <td><b>Бренд</b></td>
                    ${items.map(p => `<td>${p.brand}</td>`).join('')}
                </tr>
                <tr>
                    <td><b>Дисплей</b></td>
                    ${items.map(p => `<td><b>${p.display}</b></td>`).join('')}
                </tr>
                <tr>
                    <td><b>ОЗУ (RAM)</b></td>
                    ${items.map(p => `<td><b>${p.ram} ГБ</b></td>`).join('')}
                </tr>
                <tr>
                    <td><b>Память (ROM)</b></td>
                    ${items.map(p => `<td><b>${p.storage} ГБ</b></td>`).join('')}
                </tr>
                <tr>
                    <td><b>Аккумулятор</b></td>
                    ${items.map(p => `<td>${p.battery} мАч</td>`).join('')}
                </tr>
                <tr>
                    <td><b>Цвет</b></td>
                    ${items.map(p => `<td>${p.color}</td>`).join('')}
                </tr>
                <tr>
                    <td><b>Действие</b></td>
                    ${items.map(p => `
                        <td>
                            ${p.inStock !== false
                                ? `<button class="auth-btn" style="padding: 8px 12px; font-size: 13px;" onclick="addToCart(productsData.find(x => x.id === ${p.id}))">В корзину</button>`
                                : `<button class="auth-btn" style="padding: 8px 12px; font-size: 13px; background: #334155; color: #94a3b8; cursor: not-allowed;" disabled>Нет в наличии</button>`}
                        </td>
                    `).join('')}
                </tr>
            </tbody>
        </table>
    `;

    container.innerHTML = html;
    modal.style.display = 'flex';
}

function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    if (modal) modal.style.display = 'none';
}
