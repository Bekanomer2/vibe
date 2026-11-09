// ==========================================
// EzShop - 3D-разбор смартфона при прокрутке (Three.js)
// Телефон собирается процедурно: задняя панель с камерой, аккумулятор,
// плата с чипами, рамка и дисплей. Подписи берутся из данных товара.
// Подключается динамически: import('/js/phone3d.js') из product-detail.js.
// ==========================================
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => smooth(clamp((t - a) / (b - a)));

/* ---------- Цвет корпуса по названию цвета товара ---------- */
const COLOR_RULES = [
    [/natural titanium/i, '#b8b1a5'], [/titanium gray|titanium grey/i, '#8e9298'],
    [/black|midnight|obsidian|graphite|onyx|phantom|volcanic|space/i, '#1d2027'],
    [/white|starlight|cream|pearl|snow/i, '#e8e5de'],
    [/silver|gray|grey|steel/i, '#a3a8b2'],
    [/lemongrass/i, '#cdda76'], [/mint|green|emerald|sage|seafoam|forest|mist/i, '#4fa78a'],
    [/blue|sea|ice|alpine|lagoon|ocean/i, '#5b88d4'], [/purple|violet|lavender|lilac/i, '#8c70d1'],
    [/red|crimson|ruby/i, '#cf4a42'], [/orange|mars|sunset|sunshine/i, '#e8853d'],
    [/yellow|gold|sunrise|beige|sand|sunshower/i, '#e4c98c'], [/pink|rose|coral/i, '#e690b3'],
    [/gold/i, '#d8b868']
];

function colorFromName(name) {
    for (const [re, hex] of COLOR_RULES) if (re.test(name || '')) return hex;
    return '#4b5563';
}

/* ---------- Геометрия ---------- */
function roundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x + w, y + h - r);
    s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
    s.lineTo(x + r, y + h);
    s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x, y + r);
    s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
}

function slab(w, h, r, depth, bevel = 0.02) {
    const g = new THREE.ExtrudeGeometry(roundedRectShape(w, h, r), {
        depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 28
    });
    g.translate(0, 0, -depth / 2);
    return g;
}

/* ---------- Текстуры на canvas ---------- */
function canvasTex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}

const FONT = '700 {S}px Manrope, Inter, system-ui, sans-serif';
const font = (s) => FONT.replace('{S}', s);

function labelTexture(lines, bg, fg, w = 512, h = 256) {
    return canvasTex(w, h, (g) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
        lines.forEach((l, i) => {
            g.font = font(l.size);
            g.fillText(l.text, w / 2, h * l.y);
        });
    });
}

function wallpaperTexture(label, accentHex) {
    return canvasTex(512, 1024, (g, w, h) => {
        const bg = g.createLinearGradient(0, 0, w, h);
        bg.addColorStop(0, '#0b1230'); bg.addColorStop(1, '#1b0f3a');
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        const blob = (x, y, r, c) => {
            const rg = g.createRadialGradient(x, y, 0, x, y, r);
            rg.addColorStop(0, c); rg.addColorStop(1, 'transparent');
            g.fillStyle = rg; g.fillRect(0, 0, w, h);
        };
        blob(w * 0.25, h * 0.25, 360, accentHex + 'cc');
        blob(w * 0.8, h * 0.6, 420, '#a855f7aa');
        blob(w * 0.4, h * 0.95, 380, '#22d3eeaa');
        g.fillStyle = '#fff'; g.textAlign = 'center';
        g.font = font(120); g.fillText('9:41', w / 2, h * 0.3);
        g.globalAlpha = 0.75; g.font = font(34); g.fillText(label, w / 2, h * 0.3 + 62);
        g.globalAlpha = 1;
    });
}

function pcbTexture() {
    return canvasTex(512, 512, (g, w, h) => {
        g.fillStyle = '#0d5a47'; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(255, 214, 120, .5)'; g.lineWidth = 3;
        let s = 7;
        const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
        for (let i = 0; i < 38; i++) {
            g.beginPath();
            let x = rnd() * w, y = rnd() * h;
            g.moveTo(x, y);
            for (let k = 0; k < 4; k++) {
                if (k % 2 === 0) x += (rnd() - 0.5) * 220; else y += (rnd() - 0.5) * 220;
                g.lineTo(x, y);
            }
            g.stroke();
        }
        g.fillStyle = 'rgba(255, 214, 120, .65)';
        for (let i = 0; i < 40; i++) {
            g.beginPath(); g.arc(rnd() * w, rnd() * h, 4, 0, 7); g.fill();
        }
    });
}

/* ---------- Сборка телефона ---------- */
function buildPhone(product, accentHex) {
    const W = 2.9, H = 6.0, R = 0.46, FD = 0.36;
    const base = new THREE.Color(colorFromName(product.color));
    const isDark = base.getHSL({}).l < 0.2;

    const glassMat = new THREE.MeshPhysicalMaterial({
        color: base, metalness: 0.12, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.15
    });
    const frameColor = base.clone().lerp(new THREE.Color('#cfd3da'), isDark ? 0.55 : 0.3);
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 1, roughness: 0.3, envMapIntensity: 1.2 });
    const darkMat = new THREE.MeshStandardMaterial({ color: '#0a0c12', metalness: 0.6, roughness: 0.35 });
    const lensGlass = new THREE.MeshPhysicalMaterial({ color: '#05060a', metalness: 0.2, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6 });
    const ringMat = new THREE.MeshStandardMaterial({ color: '#cfd3da', metalness: 1, roughness: 0.22 });

    const parts = {};
    const make = (key, z) => {
        const g = new THREE.Group();
        g.position.z = z;
        g.userData = { baseZ: z, mats: [] };
        parts[key] = g;
        return g;
    };
    const track = (g, ...mats) => { g.userData.mats.push(...mats); };

    /* Задняя панель + блок камеры */
    const back = make('back', -0.27);
    const backMesh = new THREE.Mesh(slab(W - 0.06, H - 0.06, R - 0.03, 0.07), glassMat);
    back.add(backMesh);
    const camBase = new THREE.Mesh(new RoundedBoxGeometry(1.32, 1.32, 0.09, 4, 0.2), new THREE.MeshPhysicalMaterial({
        color: base.clone().multiplyScalar(0.8), metalness: 0.3, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.15
    }));
    camBase.position.set(-0.68, 2.0, -0.09);
    back.add(camBase);
    [[-0.98, 2.3], [-0.98, 1.7], [-0.4, 2.0]].forEach(([x, y]) => {
        const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.11, 40), ringMat);
        ring.rotation.x = Math.PI / 2; ring.position.set(x, y, -0.18);
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.12, 40), lensGlass);
        glass.rotation.x = Math.PI / 2; glass.position.set(x, y, -0.19);
        back.add(ring, glass);
    });
    const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 24), new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffe9a8', emissiveIntensity: 0.4 }));
    flash.rotation.x = Math.PI / 2; flash.position.set(-0.4, 1.5, -0.16);
    back.add(flash);
    track(back, glassMat);

    /* Аккумулятор */
    const battery = make('battery', -0.17);
    const batMat = new THREE.MeshStandardMaterial({ color: '#d5d9e0', metalness: 0.7, roughness: 0.35 });
    battery.add(new THREE.Mesh(new RoundedBoxGeometry(2.3, 3.5, 0.11, 4, 0.1), batMat));
    const batLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(2.0, 1.1),
        new THREE.MeshStandardMaterial({
            map: labelTexture([
                { text: 'Li-Ion', size: 54, y: 0.3 },
                { text: product.battery + ' мАч', size: 92, y: 0.68 }
            ], '#2a3b52', '#eaf6ff'),
            roughness: 0.6
        })
    );
    batLabel.rotation.y = Math.PI; batLabel.position.set(0, -0.35, -0.062);
    battery.add(batLabel);
    track(battery, batMat);

    /* Плата с чипами */
    const board = make('board', -0.07);
    const pcbMat = new THREE.MeshStandardMaterial({ map: pcbTexture(), roughness: 0.5, metalness: 0.2 });
    const pcb = new THREE.Mesh(new RoundedBoxGeometry(2.5, 2.4, 0.06, 3, 0.05), pcbMat);
    pcb.position.set(0, 1.2, 0);
    board.add(pcb);
    const chip = (w, h, x, y, lines, bg, fg, accent) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), darkMat);
        m.position.set(x, y, -0.08);
        const top = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.94), new THREE.MeshStandardMaterial({
            map: labelTexture(lines, bg, fg, 256, Math.round(256 * h / w)), roughness: 0.45, metalness: 0.4,
            emissive: accent ? new THREE.Color(accentHex) : new THREE.Color('#000'), emissiveIntensity: accent ? 0.25 : 0,
            emissiveMap: accent ? labelTexture(lines, '#000', fg, 256, Math.round(256 * h / w)) : null
        }));
        top.rotation.y = Math.PI; top.position.set(x, y, -0.135);
        board.add(m, top);
        return top.material;
    };
    const cpuMat = chip(0.95, 0.95, 0, 1.55, [{ text: 'SoC', size: 78, y: 0.5 }], '#10131c', '#8ee3ff', true);
    chip(0.72, 0.5, -0.65, 0.55, [{ text: 'RAM', size: 40, y: 0.3 }, { text: product.ram + ' ГБ', size: 62, y: 0.68 }], '#151a26', '#cfe3ff');
    chip(0.8, 0.52, 0.55, 0.55, [{ text: 'ROM', size: 40, y: 0.3 }, { text: product.storage + ' ГБ', size: 58, y: 0.68 }], '#151a26', '#cfe3ff');
    for (let i = 0; i < 9; i++) {
        const sx = -0.95 + (i % 3) * 0.12, sy = 1.9 + Math.floor(i / 3) * 0.12;
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.04), new THREE.MeshStandardMaterial({ color: '#cbb26a', metalness: 0.9, roughness: 0.35 }));
        c.position.set(sx + 1.55, sy - 0.2, -0.06);
        board.add(c);
    }
    track(board, pcbMat, cpuMat);
    board.userData.cpu = cpuMat;

    /* Рамка (мидфрейм) */
    const frame = make('frame', 0);
    const frameShape = roundedRectShape(W, H, R);
    frameShape.holes.push(roundedRectShape(W - 0.2, H - 0.2, R - 0.1));
    const frameGeo = new THREE.ExtrudeGeometry(frameShape, { depth: FD, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3, curveSegments: 28 });
    frameGeo.translate(0, 0, -FD / 2);
    frame.add(new THREE.Mesh(frameGeo, frameMat));
    [[-1, 1.55, 0.7], [-1, 0.6, 0.45]].forEach(([s, y, hh]) => {
        const btn = new THREE.Mesh(new RoundedBoxGeometry(0.06, hh, 0.12, 2, 0.02), frameMat);
        btn.position.set(W / 2 + 0.02, y, 0);
        frame.add(btn);
    });
    track(frame, frameMat);

    /* Дисплей */
    const display = make('display', 0.27);
    const glassFront = new THREE.Mesh(slab(W - 0.06, H - 0.06, R - 0.03, 0.06), new THREE.MeshPhysicalMaterial({
        color: '#05060a', roughness: 0.12, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.04
    }));
    display.add(glassFront);
    const screenMat = new THREE.MeshStandardMaterial({
        map: wallpaperTexture(product.display + ' · ' + product.brand, accentHex),
        emissive: new THREE.Color('#ffffff'), roughness: 0.2
    });
    screenMat.emissiveMap = screenMat.map;
    screenMat.emissiveIntensity = 0.85;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.26, H - 0.26), screenMat);
    screen.position.z = 0.062;
    display.add(screen);
    const punch = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), new THREE.MeshBasicMaterial({ color: '#000' }));
    punch.position.set(0, H / 2 - 0.34, 0.064);
    display.add(punch);
    track(display, screenMat);

    const phone = new THREE.Group();
    Object.values(parts).forEach(p => phone.add(p));
    return { phone, parts, H, W };
}

/* ---------- Поза и «взрыв» по прогрессу ---------- */
const EXPLODED = { back: -4.9, battery: -3.1, board: -1.75, frame: 0, display: 1.7 };
const WINDOWS = { back: [0.12, 0.3], battery: [0.3, 0.48], board: [0.48, 0.66], display: [0.66, 0.84] };
const STEP_BREAKS = [0.12, 0.3, 0.48, 0.66, 0.84];
const STEP_PART = { 1: 'back', 2: 'battery', 3: 'board', 4: 'display' };

const KEYS = [
    // t,    rotY,           rotX, scale
    [0.00, Math.PI + 0.95, 0.12, 1.0],
    [0.12, Math.PI + 0.62, 0.2, 0.96],
    [0.48, Math.PI + 0.8, 0.26, 0.9],
    [0.66, Math.PI + 0.88, 0.22, 0.88],
    [0.84, Math.PI * 2 + 0.72, 0.18, 0.86],
    [1.00, Math.PI * 2 + 1.08, 0.16, 0.88]
];

function poseAt(t) {
    for (let i = 0; i < KEYS.length - 1; i++) {
        const a = KEYS[i], b = KEYS[i + 1];
        if (t <= b[0]) {
            const k = smooth(clamp((t - a[0]) / (b[0] - a[0])));
            return { ry: lerp(a[1], b[1], k), rx: lerp(a[2], b[2], k), s: lerp(a[3], b[3], k) };
        }
    }
    const l = KEYS[KEYS.length - 1];
    return { ry: l[1], rx: l[2], s: l[3] };
}

/* ---------- Подключение к странице ---------- */
export function mountPhoneStory(root, product) {
    const canvas = root.querySelector('canvas');
    const wrap = root.querySelector('.story-canvas-wrap');
    const sticky = root.querySelector('.story-sticky');
    const steps = Array.from(root.querySelectorAll('.story-step'));
    const dots = Array.from(root.querySelectorAll('.story-dot'));
    const bar = root.querySelector('.story-progress-fill');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cssAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const accentHex = /^#([0-9a-f]{6})$/i.test(cssAccent) ? cssAccent : '#38bdf8';

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(4, 6, 8);
    const rim = new THREE.DirectionalLight(accentHex, 1.4); rim.position.set(-6, 2, -6);
    scene.add(key, rim, new THREE.AmbientLight('#8aa0c8', 0.25));

    const { phone, parts } = buildPhone(product, accentHex);
    const rig = new THREE.Group();
    rig.add(phone);
    scene.add(rig);

    /* Размер */
    function resize() {
        const w = wrap.clientWidth, h = wrap.clientHeight;
        if (!w || !h) return;
        const dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // На узких (портретных) экранах отодвигаем камеру, чтобы телефон помещался целиком
        const dist = camera.aspect < 0.9 ? 22.5 : camera.aspect < 1.3 ? 19.5 : 17;
        camera.position.set(0, 0.4, dist);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
        dirty = true;
    }

    /* Состояние */
    let target = reduce ? 1 : 0;
    let current = target;
    let dirty = true;
    let visible = true;
    let activeStep = -1;
    let raf = 0;

    function computeProgress() {
        if (reduce) return 1;
        // Секция «залипает», когда её верх доходит до значения top у sticky-блока
        const stickyTop = parseFloat(getComputedStyle(sticky).top) || 0;
        const rect = root.getBoundingClientRect();
        const total = rect.height - sticky.offsetHeight;
        return total > 0 ? clamp((stickyTop - rect.top) / total) : 0;
    }

    function setStep(i) {
        if (i === activeStep) return;
        activeStep = i;
        steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
        dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
        root.dataset.step = String(i);
        const active = steps[i];
        if (active) animateCounters(active);
    }

    function animateCounters(el) {
        el.querySelectorAll('[data-count]').forEach(n => {
            const end = parseFloat(n.dataset.count);
            if (!isFinite(end)) return;
            if (reduce) { n.textContent = Math.round(end).toLocaleString('ru-RU'); return; }
            const t0 = performance.now();
            const tick = (now) => {
                const k = clamp((now - t0) / 900);
                n.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('ru-RU');
                if (k < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
        el.querySelectorAll('[data-fill]').forEach(f => {
            f.style.setProperty('--fill', '0');
            requestAnimationFrame(() => requestAnimationFrame(() => f.style.setProperty('--fill', f.dataset.fill)));
        });
    }

    function applyPose(t, time) {
        const pose = poseAt(t);
        const idle = reduce ? 0 : Math.sin(time * 0.0007) * 0.05;
        rig.rotation.set(pose.rx, pose.ry + idle, 0);
        rig.scale.setScalar(pose.s);

        for (const key of Object.keys(parts)) {
            const g = parts[key];
            const w = WINDOWS[key];
            const e = w ? seg(t, w[0], w[1]) : (key === 'frame' ? seg(t, 0.84, 1) * 0.25 : 0);
            g.position.z = lerp(g.userData.baseZ, EXPLODED[key], e);
        }
        // Подсветка активной детали
        const partKey = STEP_PART[activeStep];
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.004);
        for (const key of Object.keys(parts)) {
            const on = key === partKey;
            parts[key].userData.mats.forEach(m => {
                if (!m.emissive || key === 'display') return; // экран и так светится
                if (m === parts.board.userData.cpu) {
                    // процессор всегда слегка светится, на главе про память — пульсирует
                    m.emissive.set(accentHex);
                    m.emissiveIntensity = on ? 0.35 + 0.3 * pulse : 0.25;
                    return;
                }
                m.emissive.set(on ? accentHex : '#000000');
                m.emissiveIntensity = on ? 0.18 + 0.22 * pulse : 0;
            });
        }
        // Лёгкое смещение сцены вверх при финальном «взрыве», чтобы всё поместилось
        rig.position.y = lerp(0, 0.1, seg(t, 0.12, 0.84));
        if (bar) bar.style.transform = 'scaleX(' + t.toFixed(4) + ')';
    }

    function stepFor(t) {
        let i = 0;
        for (const b of STEP_BREAKS) if (t >= b) i++;
        return i;
    }

    function frame(time) {
        raf = 0;
        if (!visible || document.hidden) return;
        target = computeProgress();
        const diff = target - current;
        const moving = Math.abs(diff) > 0.0004;
        if (moving) current += diff * (reduce ? 1 : 0.12); else current = target;
        setStep(stepFor(reduce ? 1 : current));
        // Рисуем пока двигаемся, и всегда — для живой подсветки/покачивания
        applyPose(current, time);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
    }

    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }

    const io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
    }, { rootMargin: '200px 0px' });
    io.observe(root);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    window.addEventListener('ez:themechange', () => { dirty = true; start(); });

    // Навигация по точкам: прокручиваем к началу нужной главы
    dots.forEach((d, i) => d.addEventListener('click', () => {
        if (reduce) return;
        const total = root.offsetHeight - sticky.offsetHeight;
        const t = i === 0 ? 0.02 : (STEP_BREAKS[i - 1] + 0.02);
        const top = root.getBoundingClientRect().top + window.scrollY + total * clamp(t);
        window.scrollTo({ top, behavior: 'smooth' });
    }));

    resize();
    setStep(stepFor(reduce ? 1 : computeProgress()));
    start();
    root.classList.add('is-ready');

    return {
        dispose() {
            io.disconnect(); ro.disconnect();
            if (raf) cancelAnimationFrame(raf);
            renderer.dispose(); pmrem.dispose();
        }
    };
}
