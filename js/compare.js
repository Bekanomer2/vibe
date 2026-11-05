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
    if (e) e.stopPropagation();
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

function clearCompare() {
    localStorage.removeItem('ez_compare_ids');
    updateCompareBar();
    closeCompareModal();
    showToast('Список сравнения очищен', 'info');
}

function updateCompareBar() {
    const comp = getCompareIds();
    const bar = document.getElementById('compareBar');
    const navCount = document.getElementById('navCompareCount');
    if (navCount) navCount.textContent = comp.length;

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
        } else {
            btn.classList.remove('active');
        }
    });
}

function openCompareModal() {
    const comp = getCompareIds();
    if (comp.length === 0) {
        showToast('Добавьте хотя бы один смартфон для сравнения (иконка ⚖️)', 'info');
        return;
    }

    const items = comp.map(id => productsData.find(p => p.id === id)).filter(Boolean);
    const container = document.getElementById('compareTableContainer');
    const modal = document.getElementById('compareModal');

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
                                <button class="btn-compare-remove" onclick="toggleCompare(${p.id}); openCompareModal();">✕ Убрать</button>
                            </div>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody>
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
                            <button class="auth-btn" style="padding: 8px 12px; font-size: 13px;" onclick="addToCart(productsData.find(x => x.id === ${p.id}))">В корзину</button>
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
