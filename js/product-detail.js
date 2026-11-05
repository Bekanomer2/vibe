// ==========================================
// EzShop - Product Detail Page & Reviews System
// ==========================================

const REVIEWS_STORAGE_KEY = 'ez_product_reviews';

// Base verified customer reviews
const initialReviewsData = [
    { id: 1, productId: 6, author: 'Нурбек К.', rating: 5, date: '01.11.2026', text: 'Пользуюсь iPhone 15 Pro Max уже две недели. Титановый корпус очень легкий по сравнению с 14 Pro Max. Камера 5x оптического зума снимает невероятно четко!' },
    { id: 2, productId: 6, author: 'Айпери С.', rating: 5, date: '28.10.2026', text: 'Заказывала через доставку по Бишкеку, привезли за 2 часа! Телефон оригинальный, цвет Natural Titanium вживую выглядит просто шикарно.' },
    { id: 3, productId: 6, author: 'Данияр', rating: 4, date: '15.10.2026', text: 'Аппарат топовый, производительность зашкаливает. Единственное — провод в комплекте коротковат, а так все супер.' },
    { id: 4, productId: 7, author: 'Бакыт А.', rating: 5, date: '02.11.2026', text: 'Galaxy S24 Ultra — это настоящий карманный компьютер. Экран совершенно не бликует на солнце, стилус S Pen очень удобен для заметок на работе.' },
    { id: 5, productId: 7, author: 'Мирлан', rating: 5, date: '24.10.2026', text: 'ИИ-функции перевода и обработки фото реально работают. Батарея держит 2 дня без подзарядки.' },
    { id: 6, productId: 1, author: 'Азамат Т.', rating: 5, date: '03.11.2026', text: 'iPhone 13 до сих пор один из лучших вариантов по соотношению цена-качество. Быстрый, компактный и надежный.' },
    { id: 7, productId: 8, author: 'Эркин', rating: 5, date: '30.10.2026', text: 'Xiaomi 14 Ultra — оптика Leica творит чудеса! Профессиональный фотоаппарат в кармане.' },
    { id: 8, productId: 9, author: 'Канат', rating: 5, date: '29.10.2026', text: 'Google Pixel 8 Pro делает лучшие портреты из всех телефонов, что у меня были. Чистый андроид летает.' }
];

function getReviewsData() {
    try {
        const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.warn('Error reading reviews:', e);
    }
    return [...initialReviewsData];
}

function saveReviewsData(reviews) {
    try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
        console.error('Error saving reviews:', e);
    }
}

let reviewsData = getReviewsData();

function getProductReviews(productId) {
    return reviewsData.filter(r => r.productId === productId);
}

function calculateProductRating(productId) {
    const list = getProductReviews(productId);
    if (list.length === 0) {
        return {
            avg: 5.0,
            count: 0,
            stars: '⭐⭐⭐⭐⭐',
            hasReviews: false
        };
    }
    const sum = list.reduce((s, r) => s + r.rating, 0);
    const avg = sum / list.length;
    const roundedStars = Math.round(avg);
    const stars = '⭐'.repeat(roundedStars);
    return {
        avg: avg,
        count: list.length,
        stars: stars,
        hasReviews: true
    };
}

function getReviewsWord(n) {
    const abs = Math.abs(n) % 100;
    const rem = abs % 10;
    if (abs > 10 && abs < 20) return 'отзывов';
    if (rem > 1 && rem < 5) return 'отзыва';
    if (rem === 1) return 'отзыв';
    return 'отзывов';
}

// Current product in view
let currentProductId = null;
let selectedRating = 5;

function initProductPage() {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const prodId = parseInt(params.get('id'));

    const product = productsData.find(p => p.id === prodId) || productsData[0];
    if (!product) {
        container.innerHTML = '<div style="padding:40px; text-align:center;">Товар не найден. <a href="index.html">В каталог</a></div>';
        return;
    }

    currentProductId = product.id;

    // Breadcrumbs
    const bcBrand = document.getElementById('bcBrand');
    const bcName = document.getElementById('bcName');
    if (bcBrand) bcBrand.textContent = product.brand;
    if (bcName) bcName.textContent = product.name;
    document.title = `${product.name} — EzShop`;

    // Calculate real rating from reviews
    const ratingInfo = calculateProductRating(product.id);

    container.innerHTML = `
        <div class="product-gallery">
            <div class="product-main-img-box">
                <span class="product-brand-tag">${product.brand}</span>
                <img src="${product.img}" alt="${product.name}" id="mainProductImg" class="product-detail-img">
            </div>
            <div class="product-quick-features">
                <div class="feature-item">🛡️ 1 год гарантии</div>
                <div class="feature-item">🚚 Быстрая доставка по КР</div>
                <div class="feature-item">🔄 14 дней на обмен и возврат</div>
            </div>
        </div>

        <div class="product-info-panel">
            <div class="product-header-line">
                <h1 class="product-title">${product.name}</h1>
                <div class="product-action-icons">
                    <button class="btn-compare" data-id="${product.id}" onclick="toggleCompare(${product.id}, event)" title="Сравнить">⚖️</button>
                    <button class="btn-fav" data-id="${product.id}" onclick="toggleFavorite(${product.id}, event)" title="В избранное">🤍</button>
                </div>
            </div>

            <!-- Реальный рейтинг на основе отзывов -->
            <div class="product-rating" id="productTopRating" onclick="scrollToReviews()" style="cursor: pointer;" title="Посмотреть отзывы">
                <span class="stars">${ratingInfo.stars}</span>
                <span class="rating-val">${ratingInfo.hasReviews ? ratingInfo.avg.toFixed(1) : '5.0'}</span>
                <span class="reviews-count">(${ratingInfo.count} ${getReviewsWord(ratingInfo.count)})</span>
                <span class="stock-status in-stock">● В наличии</span>
            </div>

            <div class="product-price-box">
                <div class="product-price">${product.price.toLocaleString()} сом</div>
                <div class="product-old-price">${Math.round(product.price * 1.15).toLocaleString()} сом</div>
            </div>

            <div class="product-specs-grid">
                <div class="spec-tile">
                    <span class="spec-tile-label">📱 Экран</span>
                    <span class="spec-tile-val">${product.display}</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-tile-label">⚡ Оперативная память</span>
                    <span class="spec-tile-val">${product.ram} ГБ</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-tile-label">💾 Накопитель</span>
                    <span class="spec-tile-val">${product.storage} ГБ</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-tile-label">🔋 Аккумулятор</span>
                    <span class="spec-tile-val">${product.battery} мАч</span>
                </div>
                <div class="spec-tile">
                    <span class="spec-tile-label">🎨 Цвет корпуса</span>
                    <span class="spec-tile-val">${product.color}</span>
                </div>
            </div>

            <p class="product-description-text">
                ${product.description || 'Современный высокопроизводительный смартфон, сочетающий флагманские технологии, качественный дисплей, передовую камеру и длительное время автономной работы.'}
            </p>

            <div class="purchase-controls">
                <div class="qty-selector">
                    <button type="button" onclick="changeDetailQty(-1)">-</button>
                    <input type="number" id="detailQty" value="1" min="1" max="10" readonly>
                    <button type="button" onclick="changeDetailQty(1)">+</button>
                </div>
                <button class="btn-buy-primary" onclick="addCurrentProductToCart(${product.id})">🛒 Добавить в корзину</button>
                <button class="btn-buy-instant" onclick="buyCurrentProductInstant(${product.id})">⚡ Купить в 1 клик</button>
            </div>
        </div>
    `;

    if (typeof updateFavoritesUI === 'function') updateFavoritesUI();
    if (typeof updateCompareBar === 'function') updateCompareBar();

    // Render Real Reviews Section
    renderReviewsSection(product.id);

    // Render Similar Products
    renderSimilarProducts(product);
}

// Scroll to reviews on rating click
function scrollToReviews() {
    const el = document.getElementById('reviewsSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 💬 REVIEWS SECTION RENDERING & INTERACTION
// ==========================================

function renderReviewsSection(productId) {
    const container = document.getElementById('reviewsSection');
    if (!container) return;

    const reviews = getProductReviews(productId);
    const ratingInfo = calculateProductRating(productId);

    container.innerHTML = `
        <div class="reviews-header-block">
            <div class="reviews-header-left">
                <div class="reviews-big-score">${ratingInfo.hasReviews ? ratingInfo.avg.toFixed(1) : '5.0'}</div>
                <div>
                    <div class="reviews-stars-display">${ratingInfo.stars}</div>
                    <div class="reviews-total-text">Рейтинг на основе ${ratingInfo.count} ${getReviewsWord(ratingInfo.count)}</div>
                </div>
            </div>
            <button class="btn-open-review-form" onclick="toggleReviewForm()">
                ✍️ Написать отзыв
            </button>
        </div>

        <!-- Форма добавления отзыва (скрыта по умолчанию) -->
        <div class="review-form-box" id="reviewFormBox" style="display: none;">
            <h3>Ваш отзыв о смартфоне</h3>
            <form onsubmit="submitReview(event)">
                <div class="star-rating-select" id="starPicker">
                    <span style="font-size: 14px; color: var(--muted); margin-right: 8px;">Ваша оценка:</span>
                    <span class="star-pick active" data-val="1" onclick="setReviewRating(1)">★</span>
                    <span class="star-pick active" data-val="2" onclick="setReviewRating(2)">★</span>
                    <span class="star-pick active" data-val="3" onclick="setReviewRating(3)">★</span>
                    <span class="star-pick active" data-val="4" onclick="setReviewRating(4)">★</span>
                    <span class="star-pick active" data-val="5" onclick="setReviewRating(5)">★</span>
                    <span id="starRatingLabel" style="font-size: 13px; font-weight: 700; color: #facc15; margin-left: 10px;">5 из 5</span>
                </div>

                <div class="form-group" style="margin-bottom: 12px;">
                    <input type="text" id="reviewAuthorInput" class="admin-input" placeholder="Ваше имя" required value="${currentUser ? currentUser.username : ''}">
                </div>

                <textarea id="reviewTextInput" class="review-textarea" rows="3" placeholder="Расскажите о впечатлениях: что понравилось, как держит батарея, как снимает камера..." required></textarea>

                <div class="review-form-actions">
                    <button type="submit" class="auth-btn" style="width: auto; padding: 10px 24px;">Опубликовать отзыв</button>
                    <button type="button" class="admin-btn admin-btn-secondary" onclick="toggleReviewForm()">Отмена</button>
                </div>
            </form>
        </div>

        <!-- Список реальных отзывов -->
        <div class="reviews-list" id="reviewsList">
            ${reviews.length === 0 ? `
                <div style="text-align: center; color: var(--muted); padding: 40px 20px;">
                    <div style="font-size: 36px; margin-bottom: 10px;">💬</div>
                    <h4>Пока нет отзывов</h4>
                    <p style="font-size: 13px; margin-top: 4px;">Будьте первым, кто поделится своим мнением об этом смартфоне!</p>
                </div>
            ` : reviews.map(r => `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-user-info">
                            <div class="review-avatar">${(r.author || 'П')[0].toUpperCase()}</div>
                            <div>
                                <span class="review-author-name">${r.author}</span>
                                <span class="review-badge-verified">✓ Покупатель</span>
                            </div>
                        </div>
                        <div>
                            <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                            <span class="review-date" style="margin-left: 10px;">${r.date}</span>
                        </div>
                    </div>
                    <p class="review-text">${r.text}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function toggleReviewForm() {
    const box = document.getElementById('reviewFormBox');
    if (!box) return;
    const isHidden = box.style.display === 'none';
    box.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        selectedRating = 5;
        setReviewRating(5);
        const nameInput = document.getElementById('reviewAuthorInput');
        if (nameInput && currentUser) nameInput.value = currentUser.username;
        box.scrollIntoView({ behavior: 'smooth' });
    }
}

function setReviewRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll('.star-pick');
    stars.forEach(s => {
        const val = parseInt(s.getAttribute('data-val'));
        if (val <= rating) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });

    const label = document.getElementById('starRatingLabel');
    if (label) label.textContent = `${rating} из 5`;
}

function submitReview(e) {
    e.preventDefault();
    if (!currentProductId) return;

    const author = document.getElementById('reviewAuthorInput')?.value.trim() || 'Покупатель';
    const text = document.getElementById('reviewTextInput')?.value.trim();

    if (!text) {
        showToast('Пожалуйста, напишите текст отзыва', 'error');
        return;
    }

    const newReview = {
        id: Date.now(),
        productId: currentProductId,
        author: author,
        rating: selectedRating,
        date: new Date().toLocaleDateString('ru-RU'),
        text: text
    };

    reviewsData.unshift(newReview);
    saveReviewsData(reviewsData);

    showToast('Спасибо! Ваш отзыв успешно опубликован.', 'success');

    // Update reviews section
    renderReviewsSection(currentProductId);

    // Update top rating in product info panel
    const ratingInfo = calculateProductRating(currentProductId);
    const topRating = document.getElementById('productTopRating');
    if (topRating) {
        topRating.innerHTML = `
            <span class="stars">${ratingInfo.stars}</span>
            <span class="rating-val">${ratingInfo.avg.toFixed(1)}</span>
            <span class="reviews-count">(${ratingInfo.count} ${getReviewsWord(ratingInfo.count)})</span>
            <span class="stock-status in-stock">● В наличии</span>
        `;
    }
}

// Other Product Page Helpers
function changeDetailQty(delta) {
    const el = document.getElementById('detailQty');
    if (!el) return;
    let v = parseInt(el.value) || 1;
    v = Math.max(1, Math.min(10, v + delta));
    el.value = v;
}

function addCurrentProductToCart(id) {
    const qty = parseInt(document.getElementById('detailQty')?.value) || 1;
    const prod = productsData.find(p => p.id === id);
    if (prod) addToCart(prod, qty);
}

function buyCurrentProductInstant(id) {
    const qty = parseInt(document.getElementById('detailQty')?.value) || 1;
    const prod = productsData.find(p => p.id === id);
    if (prod) quickBuy(prod, qty);
}

function renderSimilarProducts(current) {
    const container = document.getElementById('similarProducts');
    if (!container) return;

    let similar = productsData.filter(p => p.id !== current.id && p.brand === current.brand);
    if (similar.length < 4) {
        const others = productsData.filter(p => p.id !== current.id && p.brand !== current.brand);
        similar = [...similar, ...others];
    }
    similar = similar.slice(0, 4);

    container.innerHTML = '';
    similar.forEach(p => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `
            <div class="card-badges">
                <button class="btn-compare" data-id="${p.id}" onclick="toggleCompare(${p.id}, event)" title="Сравнить">⚖️</button>
                <button class="btn-fav" data-id="${p.id}" onclick="toggleFavorite(${p.id}, event)" title="В избранное">🤍</button>
            </div>
            <a href="product.html?id=${p.id}" class="card-img-link">
                <img src="${p.img}" alt="${p.name}">
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
                <a href="product.html?id=${p.id}" class="btn-details">Инфо</a>
            </div>
        `;
        container.appendChild(c);
    });
}
