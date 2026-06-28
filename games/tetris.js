// Игра: Классический Тетрис
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['tetris'] = {
    id: 'tetris',
    name: 'Тетрис',
    description: 'Классический Тетрис! Складывай фигуры, убирай линии и набирай очки.',
    categoryId: 5,
    image: 'games/тетрис.png',
    icon: '🟦',
    color: '#d9edff',
    rating: 4.9,
    ratingCount: 45,
    createdAt: new Date('2024-02-01').toISOString(),
    render(container) {
        container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#f5fbff;overflow:hidden;';

        container.innerHTML = `
        <style>
            .tet-body {
                font-family:'Geologica','Nunito',sans-serif;
                flex:1; display:flex; align-items:center; justify-content:center;
                gap:32px; padding:24px; overflow:auto; background:#f5fbff;
            }
            .tet-board-wrap { position:relative; flex-shrink:0; }
            canvas#tetCanvas {
                display:block;
                border:3px solid #8ac6ff; border-radius:10px;
                box-shadow:0 8px 32px rgba(44,122,211,0.18);
            }
            .tet-mob { display:flex; gap:8px; margin-top:10px; justify-content:center; }
            .tet-mc {
                width:54px; height:54px; font-size:1.2rem;
                border:2px solid #8ac6ff; border-radius:12px;
                background:white; color:#2c7ad3;
                cursor:pointer; display:flex; align-items:center; justify-content:center;
                touch-action:manipulation; box-shadow:0 2px 8px rgba(44,122,211,0.12);
                transition:all 0.12s; font-family:inherit;
            }
            .tet-mc:active { background:#d9edff; transform:scale(0.9); }
            .tet-side { display:flex; flex-direction:column; gap:12px; width:160px; flex-shrink:0; }
            .tet-panel {
                background:white; border:2px solid #d9edff; border-radius:14px;
                padding:12px 16px; text-align:center;
                box-shadow:0 2px 10px rgba(138,198,255,0.13);
            }
            .tet-lbl { font-size:0.68rem; text-transform:uppercase; letter-spacing:1.5px; color:#8ac6ff; margin-bottom:4px; font-weight:700; }
            .tet-val { font-size:2rem; font-weight:800; color:#2c7ad3; line-height:1; }
            canvas#tetNext { border:2px solid #d9edff; border-radius:8px; background:#f5fbff; display:block; margin:0 auto; }
            .tet-start {
                padding:13px; font-size:1rem; font-weight:700;
                border:none; border-radius:12px; background:#2c7ad3; color:white;
                cursor:pointer; font-family:inherit; width:100%;
                box-shadow:0 4px 14px rgba(44,122,211,0.3); transition:background 0.2s;
            }
            .tet-start:hover { background:#1a5fa8; }
            .tet-keys { font-size:0.72rem; color:#8ac6ff; text-align:center; line-height:2.1; }
            .tet-over {
                position:absolute; inset:0;
                background:rgba(245,251,255,0.94);
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                border-radius:10px; gap:10px;
                font-family:'Geologica','Nunito',sans-serif;
            }
            .tet-over h2 { color:#2c7ad3; font-size:1.6rem; margin:0; }
            .tet-over p  { color:#7a7a7a; margin:0; font-size:1.05rem; }
        </style>
        <div class="tet-body">
            <div>
                <div class="tet-board-wrap">
                    <canvas id="tetCanvas"></canvas>
                </div>
                <div class="tet-mob">
                    <button class="tet-mc" id="tmLeft">◀</button>
                    <button class="tet-mc" id="tmRot">↻</button>
                    <button class="tet-mc" id="tmDown">▼</button>
                    <button class="tet-mc" id="tmRight">▶</button>
                    <button class="tet-mc" id="tmDrop">⬇</button>
                </div>
            </div>
            <div class="tet-side">
                <div class="tet-panel"><div class="tet-lbl">Очки</div><div class="tet-val" id="tScore">0</div></div>
                <div class="tet-panel"><div class="tet-lbl">Уровень</div><div class="tet-val" id="tLevel">1</div></div>
                <div class="tet-panel"><div class="tet-lbl">Линии</div><div class="tet-val" id="tLines">0</div></div>
                <div class="tet-panel">
                    <div class="tet-lbl">Следующая</div>
                    <canvas id="tetNext" width="100" height="80"></canvas>
                </div>
                <button class="tet-start" id="tStart">▶ Старт</button>
                <div class="tet-keys">← → Движение<br>↑ Поворот<br>↓ Быстрее<br>Пробел — сброс</div>
            </div>
        </div>`;

        // ── КОНСТАНТЫ ────────────────────────────────────────────────────────
        const COLS = 10, ROWS = 20;
        const COLORS = ['#8ac6ff','#2c7ad3','#bcbbff','#d9c4ff','#86d482','#ffe066','#ff8a80'];
        const SHAPES = [
            [[1,1,1,1]],
            [[1,1],[1,1]],
            [[0,1,0],[1,1,1]],
            [[1,0,0],[1,1,1]],
            [[0,0,1],[1,1,1]],
            [[0,1,1],[1,1,0]],
            [[1,1,0],[0,1,1]],
        ];

        const canvas   = container.querySelector('#tetCanvas');
        const nextCv   = container.querySelector('#tetNext');
        const ctx      = canvas.getContext('2d');
        const nctx     = nextCv.getContext('2d');

        // ── ИГРОВОЕ СОСТОЯНИЕ ────────────────────────────────────────────────
        let board, piece, nextPiece, score, level, lines;
        let running = false, gameOver = false, loopId = null;
        let SZ = 24; // клетка пикселей — вычислим после layout

        // ── ИНИЦИАЛИЗАЦИЯ РАЗМЕРА КАНВАСА ────────────────────────────────────
        // Важно: ctx.scale НЕ накапливаем — задаём размеры через width/height,
        // а все координаты рисуем просто в пикселях (SZ уже учитывает dpr).

        function initCanvas() {
            const body = container.querySelector('.tet-body');
            const avH  = body.offsetHeight - 90;   // место под мобильные кнопки
            const avW  = body.offsetWidth  * 0.58;
            const byH  = Math.floor(avH / ROWS);
            const byW  = Math.floor(avW / COLS);
            SZ = Math.max(20, Math.min(36, byH, byW));

            canvas.width  = COLS * SZ;
            canvas.height = ROWS * SZ;
            canvas.style.width  = canvas.width  + 'px';
            canvas.style.height = canvas.height + 'px';
        }

        // ── РИСОВАНИЕ ────────────────────────────────────────────────────────
        function block(c, x, y, color) {
            c.fillStyle = color;
            c.fillRect(x*SZ+1, y*SZ+1, SZ-2, SZ-2);
            c.fillStyle = 'rgba(255,255,255,0.36)';
            c.fillRect(x*SZ+2, y*SZ+2, SZ-4, 5);
        }

        function drawBoard() {
            const W = COLS*SZ, H = ROWS*SZ;
            ctx.fillStyle = '#e8f4ff';
            ctx.fillRect(0, 0, W, H);

            // сетка
            ctx.strokeStyle = '#c8e8ff';
            ctx.lineWidth = 0.6;
            for (let r = 0; r <= ROWS; r++) {
                ctx.beginPath(); ctx.moveTo(0, r*SZ); ctx.lineTo(W, r*SZ); ctx.stroke();
            }
            for (let c = 0; c <= COLS; c++) {
                ctx.beginPath(); ctx.moveTo(c*SZ, 0); ctx.lineTo(c*SZ, H); ctx.stroke();
            }

            // доска
            if (!board) return;
            for (let r = 0; r < ROWS; r++)
                for (let c = 0; c < COLS; c++)
                    if (board[r][c]) block(ctx, c, r, board[r][c]);

            if (!piece || gameOver) return;

            // ghost
            let gy = piece.y;
            while (valid(piece.shape, piece.x, gy + 1)) gy++;
            piece.shape.forEach((row, r) => row.forEach((v, c) => {
                if (v) {
                    ctx.fillStyle = piece.color + '38';
                    ctx.fillRect((piece.x+c)*SZ+1, (gy+r)*SZ+1, SZ-2, SZ-2);
                }
            }));

            // активная фигура
            piece.shape.forEach((row, r) => row.forEach((v, c) => {
                if (v) block(ctx, piece.x+c, piece.y+r, piece.color);
            }));
        }

        function drawNext() {
            nctx.fillStyle = '#f5fbff';
            nctx.fillRect(0, 0, 100, 80);
            if (!nextPiece) return;
            const ns = 18;
            const ox = Math.floor((4 - nextPiece.shape[0].length) / 2);
            const oy = Math.floor((4 - nextPiece.shape.length)    / 2);
            nextPiece.shape.forEach((row, r) => row.forEach((v, c) => {
                if (!v) return;
                nctx.fillStyle = nextPiece.color;
                nctx.fillRect((ox+c)*ns+2, (oy+r)*ns+2, ns-2, ns-2);
                nctx.fillStyle = 'rgba(255,255,255,0.36)';
                nctx.fillRect((ox+c)*ns+3, (oy+r)*ns+3, ns-4, 4);
            }));
        }

        // ── ЛОГИКА ───────────────────────────────────────────────────────────
        function newBoard() {
            return Array.from({length: ROWS}, () => Array(COLS).fill(0));
        }

        function rndPiece() {
            const i = Math.floor(Math.random() * SHAPES.length);
            return { shape: SHAPES[i], color: COLORS[i], x: Math.floor(COLS/2) - 1, y: 0 };
        }

        function valid(shape, ox, oy) {
            return shape.every((row, r) => row.every((v, c) => {
                if (!v) return true;
                const nx = ox+c, ny = oy+r;
                return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !board[ny][nx]);
            }));
        }

        function rotate(s) {
            return s[0].map((_, i) => s.map(row => row[i]).reverse());
        }

        function lock() {
            piece.shape.forEach((row, r) => row.forEach((v, c) => {
                if (v) board[piece.y+r][piece.x+c] = piece.color;
            }));
            // убрать полные линии
            let cleared = 0;
            for (let r = ROWS-1; r >= 0; r--) {
                if (board[r].every(v => v)) {
                    board.splice(r, 1);
                    board.unshift(Array(COLS).fill(0));
                    cleared++;
                    r++; // проверить ту же строку снова
                }
            }
            score  += ([0, 100, 300, 500, 800][cleared] || 0) * level;
            lines  += cleared;
            level   = Math.floor(lines / 10) + 1;
            updateUI();

            piece     = nextPiece;
            nextPiece = rndPiece();
            drawNext();

            if (!valid(piece.shape, piece.x, piece.y)) {
                gameOver = true;
                running  = false;
                drawBoard();
                showOver();
            }
        }

        function drop() {
            if (!running) return;
            if (valid(piece.shape, piece.x, piece.y + 1)) piece.y++;
            else lock();
            drawBoard();
        }

        function loop() {
            if (!running) return;
            drop();
            loopId = setTimeout(loop, Math.max(80, 800 - (level-1) * 70));
        }

        function updateUI() {
            container.querySelector('#tScore').textContent = score;
            container.querySelector('#tLevel').textContent = level;
            container.querySelector('#tLines').textContent = lines;
        }

        function showOver() {
            const wrap = container.querySelector('.tet-board-wrap');
            const ov   = document.createElement('div');
            ov.className = 'tet-over';
            ov.innerHTML = `
                <h2>Игра окончена!</h2>
                <p>Очки: <b style="color:#2c7ad3">${score}</b></p>
                <button class="tet-start" style="width:150px;margin-top:8px"
                    onclick="this.closest('.tet-over').remove(); startTetris()">Заново</button>`;
            wrap.appendChild(ov);
            if (typeof window.onBuiltinGameComplete === 'function')
                window.onBuiltinGameComplete('tetris', score);
        }

        // ── СТАРТ ИГРЫ ───────────────────────────────────────────────────────
        window.startTetris = function () {
            clearTimeout(loopId);
            board     = newBoard();
            score     = 0; level = 1; lines = 0;
            gameOver  = false; running = true;
            piece     = rndPiece();
            nextPiece = rndPiece();
            updateUI();
            drawBoard();
            drawNext();
            loop();
        };

        container.querySelector('#tStart').addEventListener('click', () => {
            // Пересчитать размер канваса при первом старте (layout уже готов)
            initCanvas();
            window.startTetris();
        });

        // ── УПРАВЛЕНИЕ ───────────────────────────────────────────────────────
        const kh = e => {
            if (!running) return;
            switch (e.key) {
                case 'ArrowLeft':
                    if (valid(piece.shape, piece.x-1, piece.y)) { piece.x--; drawBoard(); }
                    break;
                case 'ArrowRight':
                    if (valid(piece.shape, piece.x+1, piece.y)) { piece.x++; drawBoard(); }
                    break;
                case 'ArrowDown':
                    drop();
                    break;
                case 'ArrowUp': {
                    const r = rotate(piece.shape);
                    if (valid(r, piece.x, piece.y)) { piece.shape = r; drawBoard(); }
                    break;
                }
                case ' ':
                    e.preventDefault();
                    while (valid(piece.shape, piece.x, piece.y+1)) piece.y++;
                    lock(); drawBoard();
                    break;
            }
        };
        document.addEventListener('keydown', kh);

        container.querySelector('#tmLeft') .addEventListener('click', () => { if(running&&valid(piece.shape,piece.x-1,piece.y)){piece.x--;drawBoard();} });
        container.querySelector('#tmRight').addEventListener('click', () => { if(running&&valid(piece.shape,piece.x+1,piece.y)){piece.x++;drawBoard();} });
        container.querySelector('#tmDown') .addEventListener('click', () => { if(running)drop(); });
        container.querySelector('#tmRot')  .addEventListener('click', () => {
            if (!running) return;
            const r = rotate(piece.shape);
            if (valid(r, piece.x, piece.y)) { piece.shape = r; drawBoard(); }
        });
        container.querySelector('#tmDrop') .addEventListener('click', () => {
            if (!running) return;
            while (valid(piece.shape, piece.x, piece.y+1)) piece.y++;
            lock(); drawBoard();
        });

        // ── ОЧИСТКА ──────────────────────────────────────────────────────────
        const obs = new MutationObserver(() => {
            if (!document.contains(canvas)) {
                clearTimeout(loopId);
                running = false;
                document.removeEventListener('keydown', kh);
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });

        // Первоначальная отрисовка пустого поля (до старта игры)
        initCanvas();
        drawBoard();
    }
};
