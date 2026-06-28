// Игра: Карточки-пары
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['word-memory'] = {
    id: 'word-memory',
    name: 'Найди пару',
    description: 'Переворачивай карточки и находи одинаковые пары! Тренируй память и внимание.',
    categoryId: 4,
    image: 'games/memory.png',
    icon: '🃏',
    color: '#f3e5f5',
    rating: 4.4,
    ratingCount: 18,
    createdAt: new Date('2024-01-15').toISOString(),
    render(container) {
        const emojis = ['🦁','🐯','🐻','🐼','🐸','🦊','🐺','🦝','🦋','🐙','🦄','🐬'];
        let cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5)
            .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
        let flippedCards = [], moves = 0, matches = 0, start = null, timer = null, elapsed = 0;

        function render() {
            container.innerHTML = `
            <style>
                .wm { font-family:'Nunito',sans-serif; max-width:520px; margin:0 auto; padding:24px 16px; }
                .wm h2 { color:#658bd1; text-align:center; margin-bottom:16px; }
                .wm-stats { display:flex; justify-content:space-around; margin-bottom:20px; }
                .wm-stat { text-align:center; background:#f3e5f5; border-radius:10px; padding:10px 16px; }
                .wm-stat .val { font-size:1.5rem; font-weight:800; color:#6a1b9a; }
                .wm-stat .lbl { font-size:0.75rem; color:#888; }
                .wm-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
                .wm-card { aspect-ratio:1; border-radius:10px; cursor:pointer; perspective:600px; }
                .wm-card-inner { width:100%; height:100%; position:relative; transform-style:preserve-3d; transition:transform 0.35s; }
                .wm-card.flipped .wm-card-inner, .wm-card.matched .wm-card-inner { transform:rotateY(180deg); }
                .wm-card-front, .wm-card-back { position:absolute; inset:0; border-radius:10px; backface-visibility:hidden; display:flex; align-items:center; justify-content:center; font-size:1.6rem; border:2px solid #ce93d8; }
                .wm-card-front { background:linear-gradient(135deg,#e1bee7,#ce93d8); color:#6a1b9a; font-size:1.2rem; }
                .wm-card-back { background:#fff; transform:rotateY(180deg); }
                .wm-card.matched .wm-card-back { background:#e8f5e9; border-color:#66bb6a; }
                .wm-win { text-align:center; padding:30px; }
                .wm-restart { margin-top:20px; padding:13px 28px; font-size:1rem; font-weight:700; background:#ce93d8; border:3px solid #6a1b9a; border-radius:12px; cursor:pointer; font-family:inherit; }
                .wm-restart:hover { background:#6a1b9a; color:white; }
                @media(max-width:400px){ .wm-grid{gap:5px;} .wm-card-back{font-size:1.1rem;} }
            </style>
            <div class="wm">
                <h2>🃏 Карточки-пары</h2>
                <div class="wm-stats">
                    <div class="wm-stat"><div class="val" id="wmMoves">${moves}</div><div class="lbl">Ходов</div></div>
                    <div class="wm-stat"><div class="val" id="wmTime">0:00</div><div class="lbl">Время</div></div>
                    <div class="wm-stat"><div class="val" id="wmMatches">${matches}/12</div><div class="lbl">Пары</div></div>
                </div>
                <div class="wm-grid" id="wmGrid"></div>
            </div>`;

            const grid = container.querySelector('#wmGrid');
            cards.forEach(card => {
                const el = document.createElement('div');
                el.className = 'wm-card' + (card.flipped ? ' flipped' : '') + (card.matched ? ' matched' : '');
                el.innerHTML = `<div class="wm-card-inner"><div class="wm-card-front"><i class="fas fa-question"></i></div><div class="wm-card-back">${card.emoji}</div></div>`;
                if (!card.matched) el.addEventListener('click', () => flipCard(card));
                grid.appendChild(el);
            });

            if (!timer) {
                timer = setInterval(() => {
                    if (start) {
                        elapsed = Math.floor((Date.now() - start) / 1000);
                        const m = Math.floor(elapsed/60), s = elapsed%60;
                        const el = container.querySelector('#wmTime');
                        if (el) el.textContent = m + ':' + String(s).padStart(2,'0');
                    }
                }, 500);
            }
        }

        function flipCard(card) {
            if (card.flipped || card.matched || flippedCards.length === 2) return;
            if (!start) start = Date.now();
            card.flipped = true;
            flippedCards.push(card);
            if (flippedCards.length === 2) {
                moves++;
                render();
                if (flippedCards[0].emoji === flippedCards[1].emoji) {
                    flippedCards[0].matched = flippedCards[1].matched = true;
                    flippedCards = [];
                    matches++;
                    if (matches === 12) {
                        clearInterval(timer);
                        timer = null;
                        setTimeout(showWin, 400);
                    } else render();
                } else {
                    setTimeout(() => {
                        flippedCards.forEach(c => c.flipped = false);
                        flippedCards = [];
                        render();
                    }, 900);
                }
            } else render();
        }

        function showWin() {
            container.querySelector('.wm').innerHTML = `<div class="wm-win">
                <div style="font-size:3rem">🎉</div>
                <h2 style="color:#658bd1">Все пары найдены!</h2>
                <p style="font-size:1.1rem;margin:10px 0">Ходов: <strong>${moves}</strong> | Время: <strong>${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}</strong></p>
                <button class="wm-restart" onclick="location.reload()">Играть снова</button>
            </div>`;
            if (typeof window.onBuiltinGameComplete === 'function') window.onBuiltinGameComplete('word-memory', Math.max(0, 1000 - moves * 10 - elapsed));
        }

        render();
    }
};
