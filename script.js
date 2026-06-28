// ==================== УТИЛИТЫ ====================

function showToast(msg, type = 'info', dur = 3500) {
    let c = document.getElementById('toastContainer');
    if (!c) { c = document.createElement('div'); c.id = 'toastContainer'; c.className = 'toast-container'; document.body.appendChild(c); }
    const icons = { success: 'check-circle', error: 'times-circle', warning: 'exclamation-triangle', info: 'info-circle' };
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<i class="fas fa-${icons[type]||'info-circle'}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('hiding'); setTimeout(() => t.remove(), 300); }, dur);
}

function showConfirm(msg) {
    return new Promise(resolve => {
        const ov = document.createElement('div');
        ov.className = 'confirm-overlay';
        ov.innerHTML = `<div class="confirm-box"><p>${msg}</p><div class="confirm-buttons"><button class="btn-secondary" id="cNo">Отмена</button><button class="btn-primary" id="cYes">Подтвердить</button></div></div>`;
        document.body.appendChild(ov);
        ov.querySelector('#cYes').onclick = () => { ov.remove(); resolve(true); };
        ov.querySelector('#cNo').onclick = () => { ov.remove(); resolve(false); };
    });
}

function formatDate(ds) {
    return new Date(ds).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatRating(r) {
    if (r == null || isNaN(r)) return '0.0';
    return parseFloat(r).toFixed(1);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

// ==================== ДАННЫЕ ====================

let games = load('igroteka_games', []);
let categories = load('igroteka_categories', [
    { id: 1, name: 'Все игры', count: 0 },
    { id: 2, name: 'Образовательные', count: 0 },
    { id: 3, name: 'Творческие', count: 0 },
    { id: 4, name: 'Логические', count: 0 },
    { id: 5, name: 'Приключения', count: 0 },
    { id: 6, name: 'Спортивные', count: 0 },
    { id: 7, name: 'Музыкальные', count: 0 }
]);
let ratings = load('igroteka_ratings', {});
let currentUser = load('igroteka_current_user', null);
let currentCategory = 1;
let currentSearch = '';
let currentSort = 'newest';

// Роли: admin > manager > moderator > user
const ROLES = { admin: 'Администратор', manager: 'Менеджер', moderator: 'Модератор', user: 'Пользователь' };

function getUsers() { return load('igroteka_users', []); }
function saveUsers(u) { saveToStorage('igroteka_users', u); }
function getChats() { return load('igroteka_chats', []); }
function saveChats(c) { saveToStorage('igroteka_chats', c); }

// ==================== ДЕМО-ДАННЫЕ ====================

if (games.length === 0) {
    games = [
        { id: 1, name: 'Physics Drop', description: 'Увлекательная игра на основе физики, где нужно строить конструкции и решать головоломки. Идеально для развития логического мышления.', url: 'https://spritted.com/en/game/physics-drop', embedCode: '<iframe frameborder="0" src="https://spritted.com/en/game/physics-drop?embed" width="100%" height="480px"></iframe>', categoryId: 5, image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&q=80', rating: 4.5, ratingCount: 12, createdAt: new Date('2023-10-15').toISOString() },
        ];
    saveToStorage('igroteka_games', games);
}

// Первый пользователь при старте → admin
let _users = getUsers();
if (_users.length === 0) {
    _users.push({ username: 'admin', password: 'admin123', name: 'Администратор', role: 'admin', xp: 500, joinedAt: new Date().toISOString() });
    saveUsers(_users);
}

// ==================== ВСТРОЕННЫЕ ИГРЫ ====================

const BUILTIN_GAME_DEFS = window.BUILTIN_GAMES || {};
const BUILTIN_IDS = Object.keys(BUILTIN_GAME_DEFS);

function getAllGames() {
    const extGames = games.map(g => ({ ...g, builtin: false }));
    const builtinRatings = load('igroteka_builtin_ratings', {});
    const builtins = BUILTIN_IDS.map(id => {
        const def = BUILTIN_GAME_DEFS[id];
        const bid = 'b_' + id;
        const saved = builtinRatings[bid] || {};
        return {
            id: bid,
            name: def.name,
            description: def.description,
            categoryId: def.categoryId,
            image: def.image || null,
            icon: def.icon,
            color: def.color,
            rating: saved.rating !== undefined ? saved.rating : def.rating,
            ratingCount: saved.ratingCount !== undefined ? saved.ratingCount : def.ratingCount,
            createdAt: def.createdAt,
            builtin: true,
            builtinId: id
        };
    });
    return [...extGames, ...builtins];
}

// ==================== ДОСТИЖЕНИЯ ====================

const ACHIEVEMENTS = [
    { id: 'first_login', icon: '🎉', name: 'Первый вход', desc: 'Вы вошли первый раз!', xp: 20 },
    { id: 'play_game', icon: '🎮', name: 'Первая игра', desc: 'Откройте любую игру', xp: 30 },
    { id: 'rate_game', icon: '⭐', name: 'Критик', desc: 'Поставьте оценку игре', xp: 20 },
    { id: 'chat_support', icon: '💬', name: 'Общительный', desc: 'Напишите в поддержку', xp: 15 },
    { id: 'play_math', icon: '🔢', name: 'Математик', desc: 'Поиграйте в Математическую викторину', xp: 40 },
    { id: 'play_english', icon: '📕', name: 'Полиглот', desc: 'Поиграйте в Английский словарь', xp: 40 },
    { id: 'play_logic', icon: '🧩', name: 'Логик', desc: 'Пройдите Продолжи паттерн', xp: 40 },
    { id: 'play_memory', icon: '🃏', name: 'Память', desc: 'Найдите все пары в Карточках', xp: 40 },
    { id: 'xp100', icon: '🌟', name: 'Новичок', desc: 'Наберите 100 XP', xp: 0 },
    { id: 'xp500', icon: '🏆', name: 'Знаток', desc: 'Наберите 500 XP', xp: 0 },
    { id: 'xp1000', icon: '👑', name: 'Чемпион', desc: 'Наберите 1000 XP', xp: 0 },
    { id: 'five_stars', icon: '🌠', name: 'Пять звёзд', desc: 'Дайте оценку 5 звёзд', xp: 25 },
];

function getUserAchievements() {
    if (!currentUser) return [];
    return load('igroteka_achievements_' + currentUser.username, []);
}

function unlockAchievement(id) {
    if (!currentUser) return;
    const achieved = getUserAchievements();
    if (achieved.includes(id)) return;
    const def = ACHIEVEMENTS.find(a => a.id === id);
    if (!def) return;
    achieved.push(id);
    saveToStorage('igroteka_achievements_' + currentUser.username, achieved);
    addXP(def.xp);
    showAchievementToast(def);
    updateSidebar();
}

function showAchievementToast(def) {
    const el = document.createElement('div');
    el.className = 'achievement-toast';
    el.innerHTML = `<div class="ach-icon">${def.icon}</div><div class="ach-text"><div class="ach-title">🏆 Достижение разблокировано!</div><div class="ach-desc">${def.name}: ${def.desc}</div></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(-50%) scale(0.8)'; el.style.transition = '0.4s'; setTimeout(() => el.remove(), 400); }, 3500);
}

function addXP(amount) {
    if (!currentUser || !amount) return;
    const users = getUsers();
    const idx = users.findIndex(u => u.username === currentUser.username);
    if (idx === -1) return;
    users[idx].xp = (users[idx].xp || 0) + amount;
    saveUsers(users);
    currentUser.xp = users[idx].xp;
    saveToStorage('igroteka_current_user', currentUser);
    updateXPBar();
    // XP milestones
    if (currentUser.xp >= 1000) unlockAchievement('xp1000');
    else if (currentUser.xp >= 500) unlockAchievement('xp500');
    else if (currentUser.xp >= 100) unlockAchievement('xp100');
}

// ==================== UI ====================

function updateUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');

    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'block';
            document.getElementById('userDisplayName').textContent = currentUser.name || currentUser.username;
            document.getElementById('dropdownName').textContent = currentUser.name || currentUser.username;
            const roleLbl = document.getElementById('dropdownRole');
            roleLbl.textContent = ROLES[currentUser.role] || 'Пользователь';
            roleLbl.className = 'role-badge role-' + (currentUser.role || 'user');
        }
        const adminLink = document.getElementById('adminPanelLink');
        const supportLink = document.getElementById('supportPanelLink');
        if (adminLink) adminLink.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
        if (supportLink) supportLink.style.display = (currentUser.role === 'manager' || currentUser.role === 'admin') ? 'flex' : 'none';
        updateXPBar();
        updateSidebar();
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (registerBtn) registerBtn.style.display = 'inline-flex';
        if (userMenu) userMenu.style.display = 'none';
        const teaser = document.getElementById('achievementTeaser');
        if (teaser) teaser.style.display = 'none';
    }
}

function updateXPBar() {
    if (!currentUser) return;
    const xp = currentUser.xp || 0;
    const lvlXp = 200;
    const fill = Math.min(100, (xp % lvlXp) / lvlXp * 100);
    const xpEl = document.getElementById('dropdownXp');
    const fillEl = document.getElementById('xpFill');
    if (xpEl) xpEl.textContent = xp;
    if (fillEl) fillEl.style.width = fill + '%';
}

function updateSidebar() {
    if (!currentUser) return;
    const teaser = document.getElementById('achievementTeaser');
    const badges = document.getElementById('teaserBadges');
    if (!teaser || !badges) return;
    const achieved = getUserAchievements();
    if (achieved.length === 0) { teaser.style.display = 'none'; return; }
    teaser.style.display = 'block';
    badges.innerHTML = achieved.slice(-5).map(id => {
        const def = ACHIEVEMENTS.find(a => a.id === id);
        return def ? `<span class="teaser-badge" title="${def.name}">${def.icon}</span>` : '';
    }).join('');
}

// ==================== КАТЕГОРИИ ====================

function updateCategoryCounts() {
    const all = getAllGames();
    categories.forEach(cat => {
        cat.count = cat.id === 1 ? all.length : all.filter(g => g.categoryId === cat.id).length;
    });
    saveToStorage('igroteka_categories', categories);
}

function loadCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    const wasCollapsed = list.classList.contains('collapsed');
    list.innerHTML = '';
    categories.forEach(cat => {
        const el = document.createElement('div');
        el.className = 'category' + (cat.id === currentCategory ? ' active' : '');
        el.innerHTML = `<span>${cat.name}</span><span class="category-count">${cat.count}</span>`;
        el.addEventListener('click', () => { currentCategory = cat.id; loadCategories(); loadGames(); });
        list.appendChild(el);
    });
    if (wasCollapsed) list.classList.add('collapsed');
}

window.toggleCategories = function() {
    const list = document.getElementById('categoriesList');
    const btn = document.getElementById('categoriesToggle');
    if (!list || !btn) return;
    const collapsed = list.classList.toggle('collapsed');
    btn.classList.toggle('open', !collapsed);
};

// ==================== ИГРЫ ====================

function loadGames() {
    const container = document.getElementById('gamesList');
    if (!container) return;
    const titleEl = document.getElementById('sectionTitle');

    let all = getAllGames();

    if (currentCategory !== 1) {
        all = all.filter(g => g.categoryId === currentCategory);
    }
    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        all = all.filter(g => g.name.toLowerCase().includes(s) || g.description.toLowerCase().includes(s));
    }
    all.sort((a, b) => {
        if (currentSort === 'rating') return (b.rating||0) - (a.rating||0);
        if (currentSort === 'name') return a.name.localeCompare(b.name);
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const catName = currentCategory === 1 ? 'Все игры' : (categories.find(c => c.id === currentCategory)?.name || 'Игры');
    if (titleEl) titleEl.textContent = catName;

    if (all.length === 0) {
        container.innerHTML = `<div class="empty-message"><i class="fas fa-gamepad"></i><h3>Игры не найдены</h3><p>Попробуйте другой запрос или категорию</p></div>`;
        return;
    }
    container.innerHTML = '';
    const cardColors = ['linear-gradient(135deg, var(--pastel-pink), var(--pastel-purple))', 'linear-gradient(135deg, var(--pastel-green), var(--pastel-yellow))', 'linear-gradient(135deg, var(--pastel-purple), var(--pastel-pink))', 'linear-gradient(135deg, var(--pastel-yellow), var(--pastel-green))', 'linear-gradient(135deg, var(--sky-blue), var(--pastel-pink))', 'linear-gradient(135deg, var(--pastel-green), var(--sky-blue))'];
    all.forEach((game, index) => {
        const cat = categories.find(c => c.id === game.categoryId);
        const el = document.createElement('div');
        el.className = 'game-card' + (game.builtin ? ' builtin-card' : '');
        const imgHtml = game.image
            ? `<img src="${game.image}" alt="${game.name}" onerror="this.parentNode.innerHTML='<span style=font-size:3.5rem>${game.icon||'🎮'}</span>'">`
            : `<span class="builtin-icon">${game.icon||'🎮'}</span>`;
        const cardColor = cardColors[index % cardColors.length];
        el.innerHTML = `
            <div class="game-image" style="background:${game.color||cardColor}">
                ${imgHtml}
               
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.name}</h3>
                <p class="game-description">${game.description}</p>
                <div class="game-meta">
                    <span class="game-category">${cat?.name||'Без категории'}</span>
                    <div class="game-rating">
                        <span class="rating-value">${formatRating(game.rating)}</span>
                        <i class="fas fa-star"></i>
                        <span class="rating-count">(${game.ratingCount||0})</span>
                    </div>
                </div>
                <div class="game-actions">
                    <button class="btn-primary" onclick="openGameModal('${game.id}')"><i class="fas fa-play"></i> Играть</button>
                </div>
            </div>`;
        container.appendChild(el);
    });
}

function performSearch() {
    currentSearch = document.getElementById('searchInput')?.value.trim() || '';
    loadGames();
}

// ==================== МОДАЛ ИГРЫ ====================

window.openGameModal = function(gameId) {
    const all = getAllGames();
    const game = all.find(g => String(g.id) === String(gameId));
    if (!game) return;

    const cat = categories.find(c => c.id === game.categoryId);
    const userRating = currentUser ? ratings[`${currentUser.username}_${gameId}`] || 0 : 0;

    let launchHtml;
    if (game.builtin) {
        launchHtml = `<div class="game-launch-area"><button class="btn-primary" onclick="openBuiltinGame('${game.builtinId}','${escHtml(game.name)}')"><i class="fas fa-play"></i> Запустить игру</button></div>`;
    } else if (game.embedCode) {
        launchHtml = `<div class="game-launch-area">${game.embedCode}<button class="btn-secondary" style="margin-top:10px" onclick="openFullscreen('${game.id}')"><i class="fas fa-expand"></i> Полный экран</button></div>`;
    } else {
        launchHtml = `<div class="game-launch-area"><a href="${escHtml(game.url)}" target="_blank" rel="noopener" class="btn-primary"><i class="fas fa-external-link-alt"></i> Играть на сайте</a></div>`;
    }

    const starsHtml = [1,2,3,4,5].map(s => `<i class="fas fa-star star ${userRating >= s ? 'active' : ''}" onclick="rateGame('${gameId}',${s})" onmouseover="hoverStars(this,${s})" onmouseout="resetStars(this)"></i>`).join('');
    const adminHtml = currentUser?.role === 'admin' ? `<div class="admin-controls"><button class="btn-secondary btn-sm" onclick="editGameAdmin('${gameId}')"><i class="fas fa-edit"></i> Редактировать</button><button class="btn-danger btn-sm" onclick="deleteGameAdmin('${gameId}')"><i class="fas fa-trash"></i> Удалить</button></div>` : '';

    document.getElementById('gameModalContent').innerHTML = `
        <div class="game-detail">
            <div class="game-detail-header">
                <div class="game-detail-image" style="background:${game.color||'linear-gradient(135deg,var(--light-blue),var(--sky-blue))'}">
                    ${game.image ? `<img src="${escHtml(game.image)}" alt="${escHtml(game.name)}">` : `<span style="font-size:4rem">${game.icon||'🎮'}</span>`}
                </div>
                <div class="game-detail-info">
                    <h2 class="game-detail-title">${escHtml(game.name)}</h2>
                    <div class="game-detail-meta">
                        <span class="game-category">${escHtml(cat?.name||'Без категории')}</span>
                        <div class="game-rating"><span class="rating-value">${formatRating(game.rating)}</span><i class="fas fa-star"></i><span class="rating-count">${game.ratingCount||0} оценок</span></div>
                    </div>
                    <p class="game-detail-description">${escHtml(game.description)}</p>
                </div>
            </div>
            ${launchHtml}
            <div class="game-actions-row">
                <div class="rating-control">
                    <span>Ваша оценка:</span>
                    <div class="rating-stars">${starsHtml}</div>
                    ${currentUser ? '' : '<span style="color:#888;font-size:0.85rem">Войдите, чтобы оценить</span>'}
                </div>
            </div>
            ${adminHtml}
        </div>`;

    openModal('gameModal');
    unlockAchievement('play_game');
    // Track game history
    if (currentUser) {
        const histKey = 'igroteka_history_' + currentUser.username;
        const hist = load(histKey, []);
        hist.unshift({ gameId: game.id, gameName: game.name, playedAt: new Date().toISOString() });
        saveToStorage(histKey, hist.slice(0, 50));
    }
    if (game.builtin) {
        const achMap = { 'math-quiz': 'play_math', 'word-memory': 'play_memory', 'logic-puzzle': 'play_logic', 'english-words': 'play_english' };
        if (achMap[game.builtinId]) unlockAchievement(achMap[game.builtinId]);
    }
};

function escHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

window.hoverStars = function(el, n) {
    const stars = el.closest('.rating-stars')?.querySelectorAll('.star');
    if (!stars) return;
    stars.forEach((s, i) => s.style.color = i < n ? 'var(--warning)' : '');
};
window.resetStars = function(el) {
    const stars = el.closest('.rating-stars')?.querySelectorAll('.star');
    if (!stars) return;
    stars.forEach(s => s.style.color = '');
};

// ==================== РЕЙТИНГ ====================

window.rateGame = function(gameId, rating) {
    if (!currentUser) { showToast('Войдите, чтобы оценить игру', 'warning'); return; }

    const isBuiltin = String(gameId).startsWith('b_');
    const key = `${currentUser.username}_${gameId}`;
    const oldVal = ratings[key] || 0;

    if (isBuiltin) {
        let builtinRatings = load('igroteka_builtin_ratings', {});
        if (!builtinRatings[gameId]) {
            // init from def
            const defId = gameId.replace('b_', '');
            const def = BUILTIN_GAME_DEFS[defId] || {};
            builtinRatings[gameId] = { rating: def.rating || 0, ratingCount: def.ratingCount || 0 };
        }
        const br = builtinRatings[gameId];
        if (oldVal > 0) {
            br.rating = (br.rating * br.ratingCount - oldVal + rating) / Math.max(br.ratingCount, 1);
        } else {
            br.rating = (br.rating * br.ratingCount + rating) / (br.ratingCount + 1);
            br.ratingCount++;
        }
        saveToStorage('igroteka_builtin_ratings', builtinRatings);
    } else {
        const game = games.find(g => String(g.id) === String(gameId));
        if (!game) return;
        game.rating = game.rating || 0;
        game.ratingCount = game.ratingCount || 0;
        if (oldVal > 0) {
            game.rating = (game.rating * game.ratingCount - oldVal + rating) / Math.max(game.ratingCount, 1);
        } else {
            game.rating = (game.rating * game.ratingCount + rating) / (game.ratingCount + 1);
            game.ratingCount++;
        }
        saveToStorage('igroteka_games', games);
    }

    ratings[key] = rating;
    saveToStorage('igroteka_ratings', ratings);
    openGameModal(gameId);
    loadGames();
    unlockAchievement('rate_game');
    if (rating === 5) unlockAchievement('five_stars');
    showToast('Оценка сохранена! ⭐', 'success');
};

// ==================== ПОЛНОЭКРАННЫЙ РЕЖИМ ====================

window.openFullscreen = function(gameId) {
    const game = games.find(g => String(g.id) === String(gameId));
    if (!game || !game.embedCode) return;
    document.getElementById('fullscreenGameTitle').textContent = game.name;
    document.getElementById('fullscreenGameFrame').innerHTML = game.embedCode;
    closeModal('gameModal');
    openModal('fullscreenModal');
    document.body.style.overflow = 'hidden';
};

window.exitFullscreen = function() {
    closeModal('fullscreenModal');
    document.body.style.overflow = '';
    document.getElementById('fullscreenGameFrame').innerHTML = '';
};

// ==================== ВСТРОЕННЫЕ ИГРЫ ====================

window.openBuiltinGame = function(builtinId, name) {
    const def = BUILTIN_GAME_DEFS[builtinId];
    if (!def) return;
    document.getElementById('builtinGameTitle').textContent = name || def.name;
    const frame = document.getElementById('builtinGameFrame');
    frame.innerHTML = '';
    closeModal('gameModal');
    openModal('builtinModal');
    document.body.style.overflow = 'hidden';
    def.render(frame);
    window.onBuiltinGameComplete = (id, score) => {
        addXP(Math.floor(score / 10));
        showToast(`Игра завершена! +${Math.floor(score/10)} XP 🎉`, 'success');
    };
};

window.closeBuiltinGame = function() {
    closeModal('builtinModal');
    document.body.style.overflow = '';
    document.getElementById('builtinGameFrame').innerHTML = '';
};

// ==================== АВТОРИЗАЦИЯ ====================

window.switchAuthTab = function(tab) {
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
};

window.togglePassword = function(id) {
    const inp = document.getElementById(id);
    const btn = inp.nextElementSibling;
    if (inp.type === 'password') { inp.type = 'text'; btn.innerHTML = '<i class="fas fa-eye-slash"></i>'; }
    else { inp.type = 'password'; btn.innerHTML = '<i class="fas fa-eye"></i>'; }
};

window.doLogin = function() {
    const login = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!login || !password) { showToast('Заполните все поля', 'warning'); return; }
    const users = getUsers();
    // Поиск по логину ИЛИ по email
    const user = users.find(u => (u.username === login || (u.email && u.email.toLowerCase() === login.toLowerCase())) && u.password === password);
    if (!user) { showToast('Неверный логин, email или пароль', 'error'); return; }
    currentUser = { username: user.username, name: user.name, role: user.role || 'user', xp: user.xp || 0 };
    saveToStorage('igroteka_current_user', currentUser);
    closeModal('authModal');
    updateUI();
    loadGames();
    showToast(`Добро пожаловать, ${user.name || user.username}! 👋`, 'success');
    unlockAchievement('first_login');
};

window.doRegister = function() {
    const name = document.getElementById('regName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail')?.value.trim() || '';
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;
    if (!name || !username || !email || !password || !confirm) { showToast('Заполните все поля', 'warning'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Введите корректный email', 'warning'); return; }
    if (password !== confirm) { showToast('Пароли не совпадают', 'warning'); return; }
    if (password.length < 6) { showToast('Пароль минимум 6 символов', 'warning'); return; }
    const users = getUsers();
    if (users.find(u => u.username === username)) { showToast('Логин уже занят', 'error'); return; }
    if (users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())) { showToast('Email уже используется', 'error'); return; }
    const newUser = { username, password, name, email, role: users.length === 0 ? 'admin' : 'user', xp: 0, joinedAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    currentUser = { username, name, role: newUser.role, xp: 0 };
    saveToStorage('igroteka_current_user', currentUser);
    closeModal('authModal');
    updateUI();
    loadGames();
    showToast(`Добро пожаловать, ${name}! 🎉`, 'success');
    unlockAchievement('first_login');
};

window.logout = function() {
    currentUser = null;
    saveToStorage('igroteka_current_user', null);
    updateUI();
    loadGames();
    showToast('Вы вышли из системы', 'info');
};

window.toggleUserDropdown = function() {
    document.getElementById('userDropdown').classList.toggle('open');
};

// ==================== ПРОФИЛЬ / ДОСТИЖЕНИЯ ====================

window.openProfileModal = function() {
    if (!currentUser) { openModal('authModal'); return; }
    const achieved = getUserAchievements();
    const xp = currentUser.xp || 0;
    const lvl = Math.floor(xp / 200) + 1;
    const pct = ((xp % 200) / 200 * 100).toFixed(0);

    const achHtml = ACHIEVEMENTS.map(a => {
        const unlocked = achieved.includes(a.id);
        return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${a.icon}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}${a.xp ? ` (+${a.xp} XP)` : ''}</div>
        </div>`;
    }).join('');

    document.getElementById('profileModalContent').innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar-lg"><i class="fas fa-user"></i></div>
            <div>
                <div class="profile-name">${escHtml(currentUser.name || currentUser.username)}</div>
                <span class="role-badge role-${currentUser.role||'user'}">${ROLES[currentUser.role]||'Пользователь'}</span>
                <div class="profile-xp">Уровень ${lvl} · <span>${xp} XP</span></div>
                <div style="margin-top:8px"><div class="xp-track" style="width:200px"><div class="xp-fill" style="width:${pct}%"></div></div></div>
            </div>
        </div>
        <h3 style="color:var(--primary-dark);margin-bottom:4px"><i class="fas fa-trophy"></i> Достижения (${achieved.length}/${ACHIEVEMENTS.length})</h3>
        <div class="achievements-grid">${achHtml}</div>`;
    openModal('profileModal');
};

// ==================== СТРАНИЦА ПРОФИЛЯ ====================

window.openProfilePage = function() {
    if (!currentUser) { openModal('authModal'); return; }
    renderProfilePage();
    document.getElementById('profilePage').style.display = 'block';
    document.body.style.overflow = 'hidden';
};

window.closeProfilePage = function() {
    document.getElementById('profilePage').style.display = 'none';
    document.body.style.overflow = '';
};

function renderProfilePage() {
    const achieved = getUserAchievements();
    const xp = currentUser.xp || 0;
    const lvl = Math.floor(xp / 200) + 1;
    const pct = ((xp % 200) / 200 * 100).toFixed(0);

    const histKey = 'igroteka_history_' + currentUser.username;
    const hist = load(histKey, []);

    const histHtml = hist.length === 0
        ? '<p style="color:var(--text-light);font-size:0.9rem;text-align:center;padding:20px 0">Вы ещё не открывали игры</p>'
        : `<div class="game-history-list">${hist.slice(0,20).map(h => `
            <div class="game-history-item">
                <div>
                    <div class="game-history-name">${escHtml(h.gameName)}</div>
                    <div class="game-history-date">${formatDate(h.playedAt)}</div>
                </div>
                <span class="game-history-badge"><i class="fas fa-gamepad"></i> Сыграно</span>
            </div>`).join('')}</div>`;

    const achHtml = ACHIEVEMENTS.map(a => {
        const unlocked = achieved.includes(a.id);
        return `<div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${a.icon}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}${a.xp ? ` (+${a.xp} XP)` : ''}</div>
        </div>`;
    }).join('');

    const users = getUsers();
    const fullUser = users.find(u => u.username === currentUser.username);

    document.getElementById('profilePageContent').innerHTML = `
        <div class="profile-page-content">
            <div class="profile-page-hero">
                <div class="profile-avatar-xl"><i class="fas fa-user"></i></div>
                <div style="flex:1">
                    <div class="profile-page-name">${escHtml(currentUser.name || currentUser.username)}</div>
                    <span class="role-badge role-${currentUser.role||'user'}">${ROLES[currentUser.role]||'Пользователь'}</span>
                    <div class="profile-page-xp" style="margin-top:8px">Уровень ${lvl} · <span>${xp} XP</span></div>
                    <div style="margin-top:8px"><div class="xp-track" style="width:260px"><div class="xp-fill" style="width:${pct}%"></div></div></div>
                    <div style="margin-top:6px;font-size:0.8rem;color:var(--text-light)">Зарегистрирован: ${fullUser?.joinedAt ? formatDate(fullUser.joinedAt) : '—'}</div>
                </div>
            </div>
            <div class="profile-section-card">
                <h3><i class="fas fa-history"></i> История игр (${hist.length})</h3>
                ${histHtml}
            </div>
            <div class="profile-section-card">
                <h3><i class="fas fa-trophy"></i> Достижения (${achieved.length}/${ACHIEVEMENTS.length})</h3>
                <div class="achievements-grid">${achHtml}</div>
            </div>
        </div>`;
}

// ==================== ПОДДЕРЖКА (письма) ====================

window.openChatSupport = function() {
    if (!currentUser) { openModal('authModal'); return; }
    loadMyTickets();
    openModal('chatModal');
    unlockAchievement('chat_support');
};

function loadMyTickets() {
    const chats = getChats();
    const myTickets = chats.filter(c => c.userId === currentUser.username);
    const container = document.getElementById('myTicketsList');
    if (!container) return;

    if (myTickets.length === 0) {
        container.innerHTML = '';
        return;
    }

    const statusLabels = { processing: 'В обработке', closed: 'Закрыто', paused: 'Приостановлено', open: 'В обработке' };
    const statusClasses = { processing: 'status-processing', closed: 'status-closed', paused: 'status-paused', open: 'status-processing' };

    container.innerHTML = `<h4><i class="fas fa-inbox"></i> Мои обращения</h4>` +
        myTickets.slice().reverse().map(t => {
            const status = t.status || 'processing';
            const lastMsg = t.messages[t.messages.length - 1];
            const replyCount = t.messages.filter(m => m.from !== currentUser.username).length;
            return `<div class="my-ticket-item">
                <div class="my-ticket-item-header">
                    <span class="my-ticket-subject">${escHtml(t.subject || 'Без темы')}</span>
                    <span class="ticket-status-badge ${statusClasses[status]||'status-processing'}">${statusLabels[status]||'В обработке'}</span>
                </div>
                <div class="my-ticket-preview">${escHtml(lastMsg?.text || '')}</div>
                ${replyCount > 0 ? `<div class="my-ticket-replies"><i class="fas fa-reply"></i> ${replyCount} ответ${replyCount > 1 ? 'а' : ''} от поддержки</div>` : ''}
                <div style="font-size:0.75rem;color:var(--text-light);margin-top:4px">${formatDate(t.createdAt)}</div>
            </div>`;
        }).join('');
}

window.sendSupportLetter = function() {
    const subject = document.getElementById('supportSubject')?.value.trim();
    const category = document.getElementById('supportCategory')?.value;
    const message = document.getElementById('supportMessage')?.value.trim();
    if (!subject || !message) { showToast('Заполните тему и сообщение', 'warning'); return; }
    if (!currentUser) { showToast('Войдите для отправки', 'warning'); return; }

    const chats = getChats();
    const ticket = {
        id: Date.now(),
        userId: currentUser.username,
        userName: currentUser.name || currentUser.username,
        subject,
        category,
        status: 'processing',
        createdAt: new Date().toISOString(),
        messages: [{ from: currentUser.username, fromName: currentUser.name || currentUser.username, text: message, at: new Date().toISOString() }]
    };
    chats.push(ticket);
    saveChats(chats);

    document.getElementById('supportSubject').value = '';
    document.getElementById('supportMessage').value = '';
    loadMyTickets();
    showToast('Обращение отправлено! Мы свяжемся с вами ✉️', 'success');
};

// old sendChatMessage kept as stub
window.sendChatMessage = window.sendSupportLetter;

// ==================== ADMIN PAGE ====================

window.openAdminPage = function() {
    if (!currentUser || currentUser.role !== 'admin') return;
    document.getElementById('adminPage').style.display = 'block';
    document.body.style.overflow = 'hidden';
    switchAdminTab('games');
};

window.closeAdminPage = function() {
    document.getElementById('adminPage').style.display = 'none';
    document.body.style.overflow = '';
    updateCategoryCounts();
    loadCategories();
    loadGames();
};

let currentAdminTab = 'games';
window.switchAdminTab = function(tab) {
    currentAdminTab = tab;
    ['games','categories','users','chats'].forEach(t => {
        const btn = document.getElementById('at' + t.charAt(0).toUpperCase() + t.slice(1));
        if (btn) btn.classList.toggle('active', t === tab);
    });
    renderAdminTab(tab);
};

function renderAdminTab(tab) {
    const content = document.getElementById('adminTabContent');
    if (tab === 'games') renderAdminGames(content);
    else if (tab === 'categories') renderAdminCategories(content);
    else if (tab === 'users') renderAdminUsers(content);
    else if (tab === 'chats') renderAdminChats(content);
}

// ---- ADMIN: GAMES ----
function renderAdminGames(content) {
    const editingId = content.dataset.editingId || '';
    const editGame = editingId ? games.find(g => String(g.id) === editingId) : null;
    const existingImg = editGame?.image || '';

    const imgPreviewHtml = existingImg
        ? `<div id="af_img_preview" style="margin-top:8px"><img src="${existingImg}" style="max-height:80px;border-radius:8px;border:2px solid var(--border);" onerror="this.style.display='none'"></div>`
        : `<div id="af_img_preview"></div>`;

    const formHtml = `
    <div class="admin-form-section">
        <h3>${editingId ? '✏️ Редактировать игру' : '➕ Добавить игру'}</h3>
        <div class="form-row">
            <div class="form-group"><label>Название *</label><input id="af_name" value="${escHtml(editGame?.name||'')}"></div>
            <div class="form-group"><label>Категория *</label><select id="af_cat">${categories.filter(c=>c.id!==1).map(c=>`<option value="${c.id}" ${editGame?.categoryId===c.id?'selected':''}>${c.name}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label>Описание *</label><textarea id="af_desc" rows="2">${escHtml(editGame?.description||'')}</textarea></div>
        <div class="form-group"><label>URL игры *</label><input id="af_url" value="${escHtml(editGame?.url||'')}"></div>
        <div class="form-group">
            <label>Изображение</label>
            <div class="image-upload-area">
                <div class="image-upload-tabs">
                    <button type="button" class="img-tab active" id="imgTabUrl" onclick="switchImgTab('url')"><i class="fas fa-link"></i> По ссылке</button>
                    <button type="button" class="img-tab" id="imgTabFile" onclick="switchImgTab('file')"><i class="fas fa-upload"></i> Загрузить файл</button>
                </div>
                <div id="imgSrcUrl">
                    <input id="af_img" placeholder="https://example.com/image.jpg" value="${escHtml(existingImg.startsWith('data:') ? '' : existingImg)}" oninput="previewImgUrl(this.value)">
                </div>
                <div id="imgSrcFile" style="display:none">
                    <label class="file-upload-label" for="af_img_file">
                        <i class="fas fa-cloud-upload-alt" style="font-size:1.8rem;color:var(--primary-blue);display:block;margin-bottom:8px"></i>
                        <span>Нажмите или перетащите файл</span>
                        <small style="display:block;color:var(--text-light);margin-top:4px">PNG, JPG, GIF, WebP — до 2 МБ</small>
                    </label>
                    <input type="file" id="af_img_file" accept="image/*" style="display:none" onchange="handleImgFileUpload(this)">
                </div>
                ${imgPreviewHtml}
            </div>
        </div>
        <div class="form-group"><label>Код iframe (необязательно)</label><textarea id="af_embed" rows="2">${editGame?.embedCode||''}</textarea></div>
        <div class="form-buttons">
            <button class="btn-primary" onclick="adminSaveGame('${editingId}')"><i class="fas fa-save"></i> ${editingId ? 'Сохранить' : 'Добавить'}</button>
            ${editingId ? `<button class="btn-secondary" onclick="adminCancelEdit()"><i class="fas fa-times"></i> Отмена</button>` : ''}
        </div>
    </div>`;

    const tableRows = games.map(g => `
        <tr>
            <td>${escHtml(g.name)}</td>
            <td>${escHtml(categories.find(c=>c.id===g.categoryId)?.name||'-')}</td>
            <td>${formatRating(g.rating)} ⭐ (${g.ratingCount||0})</td>
            <td>${formatDate(g.createdAt)}</td>
            <td>
                <button class="btn-secondary btn-sm" onclick="adminEditGame('${g.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-danger btn-sm" onclick="adminDeleteGame('${g.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`).join('');

    content.innerHTML = `
        <div class="admin-section-title"><i class="fas fa-gamepad"></i> Управление играми</div>
        ${formHtml}
        <table class="admin-table"><thead><tr><th>Название</th><th>Категория</th><th>Рейтинг</th><th>Добавлена</th><th>Действия</th></tr></thead><tbody>${tableRows||'<tr><td colspan="5" style="text-align:center;color:#aaa">Нет игр</td></tr>'}</tbody></table>`;
}

window.adminSaveGame = function(editingId) {
    const name = document.getElementById('af_name')?.value.trim();
    const cat = parseInt(document.getElementById('af_cat')?.value);
    const desc = document.getElementById('af_desc')?.value.trim();
    const url = document.getElementById('af_url')?.value.trim();
    const embed = document.getElementById('af_embed')?.value.trim();
    if (!name || !desc || !url) { showToast('Заполните обязательные поля', 'warning'); return; }

    // Image: prefer stored base64 (from file upload), fallback to URL input
    const urlInput = document.getElementById('af_img')?.value.trim() || '';
    const img = window._pendingImgBase64 || urlInput;
    window._pendingImgBase64 = null;

    if (editingId) {
        const idx = games.findIndex(g => String(g.id) === editingId);
        if (idx !== -1) Object.assign(games[idx], { name, description: desc, url, categoryId: cat, image: img, embedCode: embed });
    } else {
        games.push({ id: Date.now(), name, description: desc, url, categoryId: cat, image: img, embedCode: embed, rating: 0, ratingCount: 0, createdAt: new Date().toISOString() });
    }
    saveToStorage('igroteka_games', games);
    showToast(editingId ? 'Игра обновлена ✓' : 'Игра добавлена ✓', 'success');
    const content = document.getElementById('adminTabContent');
    delete content.dataset.editingId;
    renderAdminGames(content);
};

window.adminEditGame = function(id) {
    const content = document.getElementById('adminTabContent');
    content.dataset.editingId = id;
    renderAdminGames(content);
};

window.adminCancelEdit = function() {
    const content = document.getElementById('adminTabContent');
    delete content.dataset.editingId;
    renderAdminGames(content);
};

window.adminDeleteGame = async function(id) {
    if (!await showConfirm('Удалить эту игру?')) return;
    games = games.filter(g => String(g.id) !== id);
    saveToStorage('igroteka_games', games);
    showToast('Игра удалена', 'success');
    renderAdminGames(document.getElementById('adminTabContent'));
};

// используется из модала игры
window.editGameAdmin = function(id) {
    closeModal('gameModal');
    openAdminPage();
    const content = document.getElementById('adminTabContent');
    content.dataset.editingId = id;
    switchAdminTab('games');
};

window.deleteGameAdmin = async function(id) {
    if (!await showConfirm('Удалить эту игру?')) return;
    games = games.filter(g => String(g.id) !== id);
    saveToStorage('igroteka_games', games);
    closeModal('gameModal');
    loadGames();
    showToast('Игра удалена', 'success');
};

// ---- ADMIN: CATEGORIES ----
function renderAdminCategories(content) {
    const rows = categories.filter(c => c.id !== 1).map(c => `
        <tr>
            <td><input class="cat-name-input" data-id="${c.id}" value="${escHtml(c.name)}" style="border:2px solid var(--border);border-radius:6px;padding:6px 10px;font-family:inherit;width:200px;"></td>
            <td>${c.count}</td>
            <td><button class="btn-secondary btn-sm" onclick="adminSaveCategory(${c.id})"><i class="fas fa-save"></i> Сохранить</button>
                <button class="btn-danger btn-sm" onclick="adminDeleteCategory(${c.id})"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('');

    content.innerHTML = `
        <div class="admin-section-title"><i class="fas fa-folder"></i> Управление категориями</div>
        <div class="admin-form-section">
            <h3>➕ Новая категория</h3>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                <input id="newCatInput" placeholder="Название категории" style="flex:1;min-width:180px;padding:10px;border:2px solid var(--border);border-radius:8px;font-family:inherit;">
                <button class="btn-primary" onclick="adminAddCategory()"><i class="fas fa-plus"></i> Добавить</button>
            </div>
        </div>
        <table class="admin-table"><thead><tr><th>Название</th><th>Игр</th><th>Действия</th></tr></thead><tbody>${rows||'<tr><td colspan="3" style="text-align:center">Нет категорий</td></tr>'}</tbody></table>`;
}

window.adminSaveCategory = function(id) {
    const input = document.querySelector(`.cat-name-input[data-id="${id}"]`);
    const name = input?.value.trim();
    if (!name) { showToast('Введите название', 'warning'); return; }
    const idx = categories.findIndex(c => c.id === id);
    if (idx !== -1) categories[idx].name = name;
    saveToStorage('igroteka_categories', categories);
    showToast('Категория обновлена ✓', 'success');
};

window.adminAddCategory = function() {
    const name = document.getElementById('newCatInput')?.value.trim();
    if (!name) { showToast('Введите название', 'warning'); return; }
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) { showToast('Такая категория уже есть', 'warning'); return; }
    categories.push({ id: Math.max(...categories.map(c => c.id)) + 1, name, count: 0 });
    saveToStorage('igroteka_categories', categories);
    showToast('Категория добавлена ✓', 'success');
    renderAdminCategories(document.getElementById('adminTabContent'));
};

window.adminDeleteCategory = async function(id) {
    const cat = categories.find(c => c.id === id);
    const inUse = games.filter(g => g.categoryId === id).length;
    if (inUse > 0) { showToast(`Нельзя удалить: в категории ${inUse} игр`, 'warning'); return; }
    if (!await showConfirm(`Удалить категорию "${cat.name}"?`)) return;
    categories = categories.filter(c => c.id !== id);
    saveToStorage('igroteka_categories', categories);
    showToast('Категория удалена', 'success');
    renderAdminCategories(document.getElementById('adminTabContent'));
};

// ---- ADMIN: USERS ----
function renderAdminUsers(content) {
    const users = getUsers();
    const rows = users.map(u => `
        <tr>
            <td>${escHtml(u.name||u.username)}</td>
            <td>${escHtml(u.username)}</td>
            <td><span class="role-badge role-${u.role||'user'}">${ROLES[u.role]||'Пользователь'}</span></td>
            <td>${u.xp||0} XP</td>
            <td>${formatDate(u.joinedAt||new Date())}</td>
            <td><button class="btn-secondary btn-sm" onclick="adminToggleUserEdit('${u.username}')"><i class="fas fa-edit"></i></button></td>
        </tr>
        <tr><td colspan="6" style="padding:0">
            <div class="user-edit-form" id="ue_${u.username}">
                <div class="form-row">
                    <div class="form-group"><label>Отображаемое имя</label><input id="ue_name_${u.username}" value="${escHtml(u.name||'')}"></div>
                    <div class="form-group"><label>Роль</label><select id="ue_role_${u.username}">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${u.role===k?'selected':''}>${v}</option>`).join('')}</select></div>
                </div>
                <div class="form-group"><label>XP</label><input type="number" id="ue_xp_${u.username}" value="${u.xp||0}" min="0"></div>
                <div class="form-buttons">
                    <button class="btn-primary btn-sm" onclick="adminSaveUser('${u.username}')"><i class="fas fa-save"></i> Сохранить</button>
                    <button class="btn-secondary btn-sm" onclick="adminToggleUserEdit('${u.username}')">Отмена</button>
                    ${u.username !== 'admin' ? `<button class="btn-danger btn-sm" onclick="adminDeleteUser('${u.username}')"><i class="fas fa-trash"></i> Удалить</button>` : ''}
                </div>
            </div>
        </td></tr>`).join('');

    content.innerHTML = `
        <div class="admin-section-title"><i class="fas fa-users"></i> Управление пользователями</div>
        <table class="admin-table"><thead><tr><th>Имя</th><th>Логин</th><th>Роль</th><th>XP</th><th>Зарегистрирован</th><th>Действия</th></tr></thead><tbody>${rows||'<tr><td colspan="6" style="text-align:center">Нет пользователей</td></tr>'}</tbody></table>`;
}

window.adminToggleUserEdit = function(username) {
    const form = document.getElementById('ue_' + username);
    if (form) form.classList.toggle('open');
};

window.adminSaveUser = function(username) {
    const users = getUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) return;
    users[idx].name = document.getElementById('ue_name_' + username)?.value.trim() || users[idx].name;
    users[idx].role = document.getElementById('ue_role_' + username)?.value || users[idx].role;
    users[idx].xp = parseInt(document.getElementById('ue_xp_' + username)?.value) || 0;
    saveUsers(users);
    if (currentUser?.username === username) {
        currentUser.name = users[idx].name;
        currentUser.role = users[idx].role;
        currentUser.xp = users[idx].xp;
        saveToStorage('igroteka_current_user', currentUser);
        updateUI();
    }
    showToast('Пользователь обновлён ✓', 'success');
    renderAdminUsers(document.getElementById('adminTabContent'));
};

window.adminDeleteUser = async function(username) {
    if (!await showConfirm(`Удалить пользователя ${username}?`)) return;
    const users = getUsers().filter(u => u.username !== username);
    saveUsers(users);
    showToast('Пользователь удалён', 'success');
    renderAdminUsers(document.getElementById('adminTabContent'));
};

// ---- ADMIN: CHATS ----
function renderAdminChats(content) {
    const chats = getChats();
    if (chats.length === 0) {
        content.innerHTML = `<div class="admin-section-title"><i class="fas fa-comments"></i> Обращения в поддержку</div><p style="text-align:center;color:#aaa;padding:40px">Обращений пока нет</p>`;
        return;
    }
    const tickets = chats.map(c => renderTicket(c, true)).join('');
    content.innerHTML = `<div class="admin-section-title"><i class="fas fa-comments"></i> Обращения в поддержку</div>${tickets}`;
}

function renderTicket(ticket, showReply) {
    const msgs = ticket.messages.map(m => {
        const isSupport = m.from !== ticket.userId;
        return `<div class="chat-msg ${isSupport ? 'theirs' : 'mine'}">
            <div class="msg-bubble">${escHtml(m.text)}</div>
            <div class="msg-meta">${escHtml(m.fromName||m.from)} · ${formatDate(m.at)}</div>
        </div>`;
    }).join('');

    const statusLabels = { processing: 'В обработке', closed: 'Закрыто', paused: 'Приостановлено', open: 'В обработке' };
    const statusClasses = { processing: 'ticket-open', closed: 'ticket-closed', paused: 'ticket-status', open: 'ticket-open' };
    const status = ticket.status || 'processing';
    const statusBadge = `<span class="ticket-status ${statusClasses[status]||'ticket-open'}">${statusLabels[status]||'В обработке'}</span>`;

    const replyHtml = showReply ? `
        <div class="support-reply-area">
            <select id="status_${ticket.id}" style="padding:8px;border:2px solid var(--border);border-radius:8px;font-family:inherit;font-size:0.85rem">
                <option value="processing" ${status==='processing'||status==='open'?'selected':''}>В обработке</option>
                <option value="paused" ${status==='paused'?'selected':''}>Приостановлено</option>
                <option value="closed" ${status==='closed'?'selected':''}>Закрыто</option>
            </select>
            <input id="reply_${ticket.id}" placeholder="Ответить..." onkeydown="if(event.key==='Enter')replyToTicket('${ticket.id}')">
            <button class="btn-primary btn-sm" onclick="replyToTicket('${ticket.id}')"><i class="fas fa-paper-plane"></i></button>
        </div>` : '';

    return `<div class="support-ticket">
        <div class="support-ticket-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'flex':'none'">
            <span><strong>${escHtml(ticket.userName||ticket.userId)}</strong> · ${escHtml(ticket.subject||'Без темы')} · #${ticket.id}</span>
            <span>${statusBadge} · ${formatDate(ticket.createdAt)}</span>
        </div>
        <div class="support-ticket-messages" style="display:none">${msgs}</div>
        ${replyHtml}
    </div>`;
}

window.replyToTicket = function(ticketId) {
    const inp = document.getElementById('reply_' + ticketId);
    const statusSel = document.getElementById('status_' + ticketId);
    const text = inp?.value.trim();
    if (!currentUser) return;
    const chats = getChats();
    const ticket = chats.find(c => String(c.id) === String(ticketId));
    if (!ticket) return;
    if (statusSel) ticket.status = statusSel.value;
    if (text) {
        ticket.messages.push({ from: currentUser.username, fromName: (currentUser.name||currentUser.username) + ' (Поддержка)', text, at: new Date().toISOString() });
    }
    saveChats(chats);
    if (inp) inp.value = '';
    showToast('Обновлено ✓', 'success');
    renderAdminTab(currentAdminTab);
};

window.closeTicket = function(ticketId) {
    const chats = getChats();
    const t = chats.find(c => String(c.id) === String(ticketId));
    if (t) { t.status = 'closed'; saveChats(chats); }
    showToast('Обращение закрыто', 'success');
    renderAdminTab(currentAdminTab);
};

// ==================== SUPPORT PAGE (MANAGER) ====================

window.openSupportPage = function() {
    if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'admin')) return;
    document.getElementById('supportPage').style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderSupportPage();
};

window.closeSupportPage = function() {
    document.getElementById('supportPage').style.display = 'none';
    document.body.style.overflow = '';
};

function renderSupportPage() {
    const chats = getChats();
    const content = document.getElementById('supportPageContent');
    if (chats.length === 0) {
        content.innerHTML = '<p style="text-align:center;color:#aaa;padding:40px">Нет обращений</p>';
        return;
    }
    content.innerHTML = chats.map(c => renderTicket(c, true)).join('');
}

// ==================== IMAGE UPLOAD HELPERS ====================

window._pendingImgBase64 = null;

window.switchImgTab = function(tab) {
    const urlDiv = document.getElementById('imgSrcUrl');
    const fileDiv = document.getElementById('imgSrcFile');
    const tabUrl = document.getElementById('imgTabUrl');
    const tabFile = document.getElementById('imgTabFile');
    if (!urlDiv || !fileDiv) return;
    if (tab === 'url') {
        urlDiv.style.display = 'block';
        fileDiv.style.display = 'none';
        tabUrl.classList.add('active');
        tabFile.classList.remove('active');
    } else {
        urlDiv.style.display = 'none';
        fileDiv.style.display = 'block';
        tabUrl.classList.remove('active');
        tabFile.classList.add('active');
        // Open file picker immediately
        document.getElementById('af_img_file')?.click();
    }
};

window.handleImgFileUpload = function(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Файл слишком большой. Максимум 2 МБ', 'warning');
        input.value = '';
        return;
    }
    if (!file.type.startsWith('image/')) {
        showToast('Выберите файл изображения (PNG, JPG, GIF, WebP)', 'warning');
        input.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = e => {
        window._pendingImgBase64 = e.target.result;
        const preview = document.getElementById('af_img_preview');
        if (preview) {
            preview.innerHTML = `
                <div style="margin-top:10px;display:flex;align-items:center;gap:12px">
                    <img src="${e.target.result}" style="max-height:80px;border-radius:8px;border:2px solid var(--success);box-shadow:0 2px 8px rgba(0,0,0,0.1)">
                    <div>
                        <div style="font-weight:700;color:var(--success);font-size:0.9rem"><i class="fas fa-check-circle"></i> Файл загружен</div>
                        <div style="font-size:0.8rem;color:var(--text-light)">${file.name} (${(file.size/1024).toFixed(0)} КБ)</div>
                        <button type="button" onclick="clearImgUpload()" style="margin-top:4px;font-size:0.8rem;color:var(--danger);background:none;border:none;cursor:pointer;font-family:inherit;padding:0"><i class="fas fa-times"></i> Удалить</button>
                    </div>
                </div>`;
        }
    };
    reader.readAsDataURL(file);
};

window.previewImgUrl = function(url) {
    const preview = document.getElementById('af_img_preview');
    if (!preview) return;
    window._pendingImgBase64 = null;
    if (!url) { preview.innerHTML = ''; return; }
    preview.innerHTML = `<div style="margin-top:8px"><img src="${escHtml(url)}" style="max-height:80px;border-radius:8px;border:2px solid var(--border);" onerror="this.parentNode.innerHTML='<span style=color:var(--danger);font-size:0.85rem><i class=fas fa-exclamation-triangle></i> Не удалось загрузить изображение</span>'"></div>`;
};

window.clearImgUpload = function() {
    window._pendingImgBase64 = null;
    const preview = document.getElementById('af_img_preview');
    if (preview) preview.innerHTML = '';
    const fileInput = document.getElementById('af_img_file');
    if (fileInput) fileInput.value = '';
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', () => {
    updateCategoryCounts();
    loadCategories();
    loadGames();
    updateUI();

    // Поиск
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchInput')?.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(); });

    // Сортировка
    document.getElementById('sortSelect')?.addEventListener('change', e => { currentSort = e.target.value; loadGames(); });

    // Кнопки авторизации
    document.getElementById('loginBtn')?.addEventListener('click', () => { switchAuthTab('login'); openModal('authModal'); });
    document.getElementById('registerBtn')?.addEventListener('click', () => { switchAuthTab('register'); openModal('authModal'); });

    // Закрытие дропдауна при клике вне
    document.addEventListener('click', e => {
        const wrap = document.getElementById('userMenu');
        if (wrap && !wrap.contains(e.target)) {
            document.getElementById('userDropdown')?.classList.remove('open');
        }
        // Закрытие модалей по оверлею
        document.querySelectorAll('.modal.open').forEach(m => {
            if (e.target === m) closeModal(m.id);
        });
    });

    // Enter в логине/регистрации
    document.getElementById('loginPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    document.getElementById('regConfirm')?.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

    // Сворачиваем категории на мобильном при загрузке
    if (window.innerWidth <= 768) {
        const list = document.getElementById('categoriesList');
        if (list) list.classList.add('collapsed');
    }
});
