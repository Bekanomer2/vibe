// ==========================================
// EzShop - Сравнение цен в магазинах (график + столбцы)
//
// ВАЖНО: реальных цен других магазинов у проекта нет, поэтому по умолчанию
// показываются ДЕМОНСТРАЦИОННЫЕ данные, которые детерминированно строятся от цены товара.
// Чтобы подключить настоящие цены, заполните PRICE_OVERRIDES (формат ниже) —
// тогда блок автоматически уберёт пометку «демо» для этого товара.
// ==========================================

// Магазины для сравнения. Названия можно заменить на реальные.
const PRICE_STORES = [
    { id: 'ez', name: 'EzShop', own: true },
    { id: 'a', name: 'Магазин А' },
    { id: 'b', name: 'Магазин Б' },
    { id: 'c', name: 'Магазин В' },
    { id: 'd', name: 'Магазин Г' }
];

// Реальные данные (необязательно):
// PRICE_OVERRIDES[productId] = { a: [p1, p2, ..., p7], b: [...], ... }  // 7 значений: от давних к текущей цене
const PRICE_OVERRIDES = {};

const PRICE_MONTHS_COUNT = 7;
const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const round10 = (n) => Math.round(n / 10) * 10;
const fmtSom = (n) => Math.round(n).toLocaleString('ru-RU') + ' сом';

function priceMonthLabels() {
    const now = new Date();
    const out = [];
    for (let i = PRICE_MONTHS_COUNT - 1; i >= 0; i--) {
        out.push(MONTH_NAMES[new Date(now.getFullYear(), now.getMonth() - i, 1).getMonth()]);
    }
    return out;
}

function buildPriceData(product) {
    const overrides = PRICE_OVERRIDES[product.id] || {};
    let demo = false;

    const series = PRICE_STORES.map((store, si) => {
        if (store.own) {
            // Собственная цена всегда реальная (текущая); история — демо
            const rnd = mulberry32(product.id * 9973 + 17);
            const hist = [];
            let v = product.price * (1.03 + rnd() * 0.04);
            for (let i = 0; i < PRICE_MONTHS_COUNT - 1; i++) {
                hist.push(round10(v));
                v = v * (1 + (rnd() - 0.62) * 0.035);
            }
            hist.push(product.price);
            if (!overrides[store.id]) demo = demo || true;
            return { ...store, history: overrides[store.id] || hist, price: product.price };
        }
        if (overrides[store.id]) {
            const h = overrides[store.id];
            return { ...store, history: h, price: h[h.length - 1] };
        }
        demo = true;
        const rnd = mulberry32(product.id * 9973 + si * 131);
        let mult = 0.97 + rnd() * 0.15;                     // 0.97 … 1.12 от нашей цены
        // Разводим цены минимум на 1.5%, чтобы линии на графике не сливались с нашей
        if (Math.abs(mult - 1) < 0.015) mult = 1 + (mult < 1 ? -0.018 : 0.018);
        const end = round10(product.price * mult);
        const hist = [];
        let v = end * (1.02 + rnd() * 0.07);
        for (let i = 0; i < PRICE_MONTHS_COUNT - 1; i++) {
            hist.push(round10(v));
            v = v + (end - v) * 0.28 + v * (rnd() - 0.5) * 0.03;
        }
        hist.push(end);
        return { ...store, history: hist, price: end };
    });

    return { months: priceMonthLabels(), series, demo };
}

/* Плавная линия (Catmull-Rom → Безье) */
function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
}

function renderPriceSection(product) {
    const data = buildPriceData(product);
    const { series, months, demo } = data;
    const own = series.find(s => s.own);
    const others = series.filter(s => !s.own);
    const sorted = [...series].sort((a, b) => a.price - b.price);
    const best = sorted[0];
    const avgOthers = others.reduce((s, x) => s + x.price, 0) / others.length;
    const diffPct = ((own.price - avgOthers) / avgOthers) * 100;
    const maxPrice = Math.max(...series.map(s => s.price));

    // ---- Геометрия графика
    const VW = 760, VH = 320, ML = 70, MR = 18, MT = 18, MB = 38;
    const all = series.flatMap(s => s.history);
    let lo = Math.min(...all), hi = Math.max(...all);
    const pad = (hi - lo) * 0.14 || hi * 0.05;
    lo = Math.floor((lo - pad) / 1000) * 1000;
    hi = Math.ceil((hi + pad) / 1000) * 1000;
    const X = (i) => ML + (i * (VW - ML - MR)) / (PRICE_MONTHS_COUNT - 1);
    const Y = (v) => MT + (1 - (v - lo) / (hi - lo)) * (VH - MT - MB);

    const grid = [];
    for (let i = 0; i <= 4; i++) {
        const v = lo + ((hi - lo) * i) / 4;
        const y = Y(v);
        grid.push(`<line x1="${ML}" y1="${y}" x2="${VW - MR}" y2="${y}" class="pc-grid"/><text x="${ML - 10}" y="${y + 4}" class="pc-ylabel" text-anchor="end">${Math.round(v / 1000)} тыс.</text>`);
    }
    const xlabels = months.map((m, i) => `<text x="${X(i)}" y="${VH - 12}" class="pc-xlabel" text-anchor="middle">${m}</text>`).join('');

    const ownPts = own.history.map((v, i) => [X(i), Y(v)]);
    const areaPath = `${smoothPath(ownPts)} L${X(PRICE_MONTHS_COUNT - 1)},${VH - MB} L${X(0)},${VH - MB} Z`;

    const lines = series.map((s, si) => {
        const pts = s.history.map((v, i) => [X(i), Y(v)]);
        const cls = s.own ? 'pc-line pc-own' : `pc-line pc-c${si}`;
        return `<path d="${smoothPath(pts)}" class="${cls}" data-series="${s.id}" pathLength="1" fill="none"/>`;
    }).join('');

    const legend = series.map((s, si) => `
        <button type="button" class="pc-chip ${s.own ? 'own' : ''}" data-series="${s.id}" aria-pressed="true">
            <i class="pc-dot pc-d${si}"></i>${s.name}
        </button>`).join('');

    // ---- Столбцы текущих цен
    const bars = sorted.map(s => {
        const w = Math.max(8, (s.price / maxPrice) * 100);
        const delta = s.price - own.price;
        const deltaTxt = s.own ? 'наша цена'
            : (delta === 0 ? 'как у нас' : `${delta > 0 ? '+' : '−'}${Math.abs(delta).toLocaleString('ru-RU')}`);
        return `
            <div class="pb-row ${s.own ? 'own' : ''} ${s.id === best.id ? 'best' : ''}">
                <div class="pb-name">${s.name}${s.id === best.id ? '<span class="pb-best">Лучшая цена</span>' : ''}</div>
                <div class="pb-track"><div class="pb-fill" style="--w:${w}%"></div></div>
                <div class="pb-val"><b>${fmtSom(s.price)}</b><small class="${delta > 0 && !s.own ? 'up' : delta < 0 ? 'down' : ''}">${deltaTxt}</small></div>
            </div>`;
    }).join('');

    const tableRows = series.map(s => `<tr><th scope="row">${s.name}</th>${s.history.map(v => `<td>${v.toLocaleString('ru-RU')}</td>`).join('')}</tr>`).join('');

    return `
        <div class="price-head">
            <div>
                <h2 class="section-title" style="margin-bottom:6px;">Цены в магазинах</h2>
                <p class="price-sub">Сравните предложения и динамику цены за ${PRICE_MONTHS_COUNT} мес.</p>
            </div>
            ${demo ? '<span class="price-demo" title="Цены других магазинов — примерные. Подключите реальные данные в js/price-chart.js (PRICE_OVERRIDES).">Демо-данные</span>' : ''}
        </div>

        <div class="price-kpis">
            <div class="kpi"><span class="kpi-label">Лучшая цена</span><b class="kpi-val">${fmtSom(best.price)}</b><span class="kpi-sub">${best.name}</span></div>
            <div class="kpi"><span class="kpi-label">Средняя у других</span><b class="kpi-val">${fmtSom(avgOthers)}</b><span class="kpi-sub">по ${others.length} магазинам</span></div>
            <div class="kpi ${diffPct <= 0 ? 'good' : 'warn'}"><span class="kpi-label">EzShop к рынку</span><b class="kpi-val">${diffPct > 0 ? '+' : diffPct < 0 ? '−' : ''}${Math.abs(diffPct).toFixed(1)}%</b><span class="kpi-sub">${diffPct <= 0 ? 'ниже средней цены' : 'выше средней цены'}</span></div>
        </div>

        <div class="price-grid">
            <div class="price-card">
                <h3 class="price-card-title">Сейчас в продаже</h3>
                <div class="pb-list">${bars}</div>
            </div>

            <div class="price-card">
                <div class="price-card-head">
                    <h3 class="price-card-title">Динамика цены</h3>
                    <div class="pc-legend" role="group" aria-label="Магазины на графике">${legend}</div>
                </div>
                <div class="pc-wrap" id="pcWrap">
                    <svg class="pc-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="График цен на ${product.name} в магазинах за ${PRICE_MONTHS_COUNT} месяцев" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <linearGradient id="pcStroke" x1="0" x2="1" y1="0" y2="0">
                                <stop offset="0" style="stop-color:var(--accent)"/>
                                <stop offset="1" style="stop-color:var(--accent-2)"/>
                            </linearGradient>
                            <linearGradient id="pcArea" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0" style="stop-color:var(--accent);stop-opacity:.28"/>
                                <stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/>
                            </linearGradient>
                        </defs>
                        ${grid.join('')}
                        ${xlabels}
                        <path d="${areaPath}" class="pc-area" fill="url(#pcArea)"/>
                        ${lines}
                        <g class="pc-hover" style="display:none">
                            <line class="pc-cross" y1="${MT}" y2="${VH - MB}"/>
                            ${series.map((s, si) => `<circle class="pc-pt pc-d${si}" r="5" data-series="${s.id}"/>`).join('')}
                        </g>
                        <rect class="pc-hit" x="${ML}" y="${MT}" width="${VW - ML - MR}" height="${VH - MT - MB}" fill="transparent"/>
                    </svg>
                    <div class="pc-tip" id="pcTip" role="status" hidden></div>
                </div>
                <details class="pc-table-wrap">
                    <summary>Показать данные таблицей</summary>
                    <div class="pc-table-scroll"><table class="pc-table"><thead><tr><th></th>${months.map(m => `<th>${m}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table></div>
                </details>
            </div>
        </div>
        ${demo ? '<p class="price-note">Цены других магазинов приведены для примера и не являются реальными предложениями.</p>' : ''}
    `;
}

function initPriceChart(product) {
    const host = document.getElementById('priceSection');
    if (!host) return;
    const data = buildPriceData(product);
    host.innerHTML = renderPriceSection(product);

    const wrap = host.querySelector('#pcWrap');
    const svg = host.querySelector('.pc-svg');
    const hit = host.querySelector('.pc-hit');
    const hover = host.querySelector('.pc-hover');
    const cross = host.querySelector('.pc-cross');
    const tip = host.querySelector('#pcTip');
    if (!wrap || !svg) return;

    const VW = 760, VH = 320, ML = 70, MR = 18, MT = 18, MB = 38;
    const all = data.series.flatMap(s => s.history);
    let lo = Math.min(...all), hi = Math.max(...all);
    const pad = (hi - lo) * 0.14 || hi * 0.05;
    lo = Math.floor((lo - pad) / 1000) * 1000;
    hi = Math.ceil((hi + pad) / 1000) * 1000;
    const X = (i) => ML + (i * (VW - ML - MR)) / (PRICE_MONTHS_COUNT - 1);
    const Y = (v) => MT + (1 - (v - lo) / (hi - lo)) * (VH - MT - MB);

    const off = new Set();

    host.querySelectorAll('.pc-chip').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.series;
        const isOff = off.has(id);
        if (isOff) off.delete(id); else off.add(id);
        btn.setAttribute('aria-pressed', String(isOff));
        btn.classList.toggle('is-off', !isOff);
        svg.querySelectorAll(`[data-series="${id}"]`).forEach(el => el.classList.toggle('is-off', !isOff));
    }));

    function show(clientX) {
        const r = svg.getBoundingClientRect();
        const scale = VW / r.width;
        const sx = (clientX - r.left) * scale;
        let idx = Math.round(((sx - ML) / (VW - ML - MR)) * (PRICE_MONTHS_COUNT - 1));
        idx = Math.max(0, Math.min(PRICE_MONTHS_COUNT - 1, idx));
        const x = X(idx);
        hover.style.display = '';
        cross.setAttribute('x1', x); cross.setAttribute('x2', x);
        hover.querySelectorAll('.pc-pt').forEach(pt => {
            const s = data.series.find(z => z.id === pt.dataset.series);
            pt.setAttribute('cx', x); pt.setAttribute('cy', Y(s.history[idx]));
            pt.style.display = off.has(s.id) ? 'none' : '';
        });
        const rows = data.series
            .filter(s => !off.has(s.id))
            .map(s => ({ s, v: s.history[idx] }))
            .sort((a, b) => a.v - b.v)
            .map(({ s, v }) => `<div class="tip-row"><i class="pc-dot pc-d${data.series.indexOf(s)}"></i><span>${s.name}</span><b>${v.toLocaleString('ru-RU')}</b></div>`)
            .join('');
        tip.innerHTML = `<div class="tip-month">${data.months[idx]}</div>${rows}`;
        tip.hidden = false;
        const wr = wrap.getBoundingClientRect();
        const px = (x / VW) * r.width + (r.left - wr.left);
        const tw = tip.offsetWidth;
        tip.style.left = Math.max(6, Math.min(wr.width - tw - 6, px - tw / 2)) + 'px';
    }

    function hide() {
        hover.style.display = 'none';
        tip.hidden = true;
    }

    hit.addEventListener('pointermove', e => show(e.clientX));
    hit.addEventListener('pointerleave', hide);
    hit.addEventListener('pointerdown', e => show(e.clientX));

    // Рисуем линии при появлении в зоне видимости
    const card = host.querySelector('.price-grid');
    const reveal = () => svg.classList.add('is-drawn');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const io = new IntersectionObserver((en) => {
            if (en[0].isIntersecting) { reveal(); host.classList.add('in-view'); io.disconnect(); }
        }, { threshold: 0.25 });
        io.observe(card);
    } else {
        reveal(); host.classList.add('in-view');
    }
}
