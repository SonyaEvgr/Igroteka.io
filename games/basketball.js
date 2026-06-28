// Игра: Баскетбол
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['basketball'] = {
    id: 'basketball',
    name: 'Баскетбол',
    description: 'Натяни и отпусти мяч, чтобы запустить его по идеальной дуге прямо в кольцо!',
    categoryId: 6,
    image: 'games/basketball.png',
    icon: '🏀',
    color: '#e0f2fe',
    rating: 4.9,
    ratingCount: 65,
    createdAt: new Date('2024-04-01').toISOString(),

    render(container) {
        container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#dbeafe;overflow:hidden; position:relative;';

        const C = {
            hoop:     '#ff3c00', // Яркий неоново-красный
            hoopRim:  '#ffcc00', // Ярко-золотой обод
            net:      'rgba(255, 255, 255, 0.6)', // Белая, хорошо заметная сетка
            board:    'rgba(255, 255, 255, 0.95)',
            boardBd:  '#cc0000', // Ярко-красный контур щита
            ball:     '#f97316', 
            ballLines:'#331400', 
            text:     '#0f172a', 
            dim:      '#475569', 
            miss:     '#ef4444',
            hit:      '#f59e0b',
            hit2:     '#10b981',
        };

        const TOTAL_TIME = 30;

        container.innerHTML = `
        <style>
            .bk-wrap {
                position:relative; width:100%; height:100%;
                font-family:'Geologica','Nunito',sans-serif;
                overflow:hidden; touch-action:none;
                user-select: none;
            }
            .bk-bg-image {
                position: absolute;
                inset: -20px;
                background: url('games/image_377a40.png') center/cover no-repeat;
                filter: blur(5px);
                opacity: 0.6;
                z-index: 0;
            }
            canvas#bkC { display:block; position:absolute; inset:0; z-index: 1; }
            .bk-ui-layer {
                position: absolute; inset: 0; pointer-events: none;
                display: flex; flex-direction: column; justify-content: space-between;
                padding: 20px; box-sizing: border-box; z-index: 2;
            }
            .bk-header { display: flex; justify-content: space-between; align-items: center; }
            .bk-score-box, .bk-timer-box {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(8px);
                border: 1px solid rgba(15, 23, 42, 0.08);
                box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
                padding: 8px 16px; border-radius: 16px;
                display: flex; flex-direction: column; align-items: center; min-width: 65px;
            }
            .bk-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: ${C.dim}; font-weight: 700; margin-bottom: 2px; }
            .bk-val { font-size: 32px; font-weight: 800; color: ${C.text}; line-height: 1; }
            .bk-timer-box .bk-val { color: ${C.hoop}; }
            
            .bk-msg {
                position:absolute; left:50%; top:38%;
                transform:translate(-50%,-50%) scale(0.8);
                font-size:44px; font-weight:900;
                text-align:center; letter-spacing:1px; line-height:1.1;
                pointer-events:none; opacity:0; z-index: 3;
                transition: all .2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                white-space:pre; text-shadow: 0 2px 8px rgba(255,255,255,0.9);
            }
            .bk-msg.show { opacity:1; transform:translate(-50%,-50%) scale(1); }
            
            .bk-footer { text-align: center; width: 100%; margin-bottom: 10px; }
            .bk-streak {
                font-size:15px; font-weight:800; color:${C.hit2};
                letter-spacing:1px; text-shadow: 0 1px 4px rgba(255,255,255,0.8);
                opacity: 0; transition: opacity 0.3s;
            }
            .bk-streak.active { opacity: 1; }
            .bk-hint { font-size: 13px; color: ${C.dim}; font-weight: 600; letter-spacing: 0.3px; margin-top: 4px; }

            .bk-overlay {
                position:absolute; inset:0; background:rgba(248, 250, 252, 0.85);
                display:flex; flex-direction:column; align-items:center;
                justify-content:center; gap:24px; z-index:10; backdrop-filter: blur(8px);
            }
            .bk-overlay h1 {
                color:${C.text}; font-size:38px; font-weight:900;
                letter-spacing:1px; margin:0; text-align:center;
                background: linear-gradient(135deg, ${C.text} 30%, ${C.hoop} 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            }
            .bk-overlay p {
                color:${C.dim}; font-size:15px; font-weight: 500;
                text-align:center; max-width:280px; line-height:1.6; margin:0;
            }
            .bk-big { color:${C.text}; font-size:76px; font-weight:900; line-height:1; }
            .bk-sub { color:${C.dim}; font-size:14px; letter-spacing:1.5px; text-transform: uppercase; font-weight: 700; }
            .bk-btn {
                background: linear-gradient(135deg, #ff6b35 0%, #ff4500 100%);
                color:#fff; border:none; box-shadow: 0 6px 20px rgba(255, 69, 0, 0.3);
                border-radius:16px; padding:16px 54px; font-size:18px;
                font-weight:800; cursor:pointer; letter-spacing:0.5px;
                font-family:inherit; transition: all 0.2s;
            }
            .bk-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255, 69, 0, 0.45); }
            .bk-btn:active { transform: translateY(1px); }
        </style>
        <div class="bk-wrap" id="bkWrap">
            <div class="bk-bg-image"></div>
            <canvas id="bkC"></canvas>
            
            <div class="bk-ui-layer">
                <div class="bk-header">
                    <div class="bk-score-box">
                        <span class="bk-lbl">Счет</span>
                        <span class="bk-val" id="bkScore">0</span>
                    </div>
                    <div class="bk-timer-box">
                        <span class="bk-lbl">Время</span>
                        <span class="bk-val" id="bkTimer">30</span>
                    </div>
                </div>
                
                <div class="bk-footer">
                    <div class="bk-streak" id="bkStreak">🔥 КОМБО ×2</div>
                    <div class="bk-hint" id="bkHint">Оттяни мяч влево-вниз для прицеливания</div>
                </div>
            </div>

            <div class="bk-msg" id="bkMsg"></div>
            
            <div class="bk-overlay" id="bkOverlay">
                <h1>ТОЧНЫЙ БРОСОК</h1>
                <p>Натяни мяч как рогатку, направь дугу прицела в кольцо и отпусти!</p>
                <button class="bk-btn" id="bkStartBtn">ИГРАТЬ</button>
                <div class="bk-sub" id="bkBestLbl"></div>
            </div>
        </div>`;

        const wrap     = container.querySelector('#bkWrap');
        const canvas   = container.querySelector('#bkC');
        const ctx      = canvas.getContext('2d');
        const scoreEl  = container.querySelector('#bkScore');
        const timerEl  = container.querySelector('#bkTimer');
        const msgEl    = container.querySelector('#bkMsg');
        const streakEl = container.querySelector('#bkStreak');
        const hintEl   = container.querySelector('#bkHint');
        const overlay  = container.querySelector('#bkOverlay');
        const startBtn = container.querySelector('#bkStartBtn');
        const bestLbl  = container.querySelector('#bkBestLbl');

        let W, H;
        function resize() {
            const r = wrap.getBoundingClientRect();
            W = canvas.width  = r.width  || 420;
            H = canvas.height = r.height || 600;
        }
        resize();

        // ── НАСТРОЙКИ КОЛЬЦА И МЯЧА ──────────────────────────────────────────
        const HOOP_RX = 28, HOOP_RY = 8, BOARD_W = 10, BOARD_H = 60;
        const BALL_R = 17;
        let hoop = { x: 0, y: 0 };

        function randomHoop() {
            const minX = W * 0.55; 
            const maxX = W - 50;
            hoop.x = minX + Math.random() * (maxX - minX);
            hoop.y = 120 + Math.random() * (H * 0.35);
        }

        function getBallOrigin() {
            return { x: W * 0.2, y: H * 0.65 };
        }

        // ── СБАЛАНСИРОВАННАЯ ФИЗИКА ─────────────────────────────────────────
        const GRAVITY = 0.21; 

        let dragStart = { x: 0, y: 0 };
        let dragCurrent = { x: 0, y: 0 };
        let phase = 'idle'; 

        let ball = { x: 0, y: 0, vx: 0, vy: 0 };
        let ballTrail = [];
        let hoopAnim = 0;
        let popTexts = [];
        let msgTimer  = null;
        let rafId     = null;
        let particles = [];
        let gameActive = false;
        let score = 0, bestScore = 0, combo = 0;
        let timeLeft = TOTAL_TIME, timerInterval = null;

        function getVelocityFromDrag() {
            if (phase !== 'aiming') return { x: 0, y: 0 };
            const dx = dragStart.x - dragCurrent.x;
            const dy = dragStart.y - dragCurrent.y;
            
            return {
                x: dx * 0.10,
                y: dy * 0.10
            };
        }

        function getSimulatedPath(vx, vy) {
            const path = [];
            const origin = getBallOrigin();
            let sx = origin.x;
            let sy = origin.y;
            let svx = vx;
            let svy = vy;

            for (let i = 0; i < 80; i++) {
                path.push({ x: sx, y: sy });
                sx += svx;
                sy += svy;
                svy += GRAVITY;
                if (sy > H + 20 || sx < -40 || sx > W + 40) break;
            }
            return path;
        }

        function getPos(e) {
            const r = canvas.getBoundingClientRect();
            const src = e.touches ? e.touches[0] : (e.changedTouches ? e.changedTouches[0] : e);
            return { x: src.clientX - r.left, y: src.clientY - r.top };
        }

        // ── КОЛЛИЗИЯ ─────────────────────────────────────────────────────────
        let hoopCrossed = false;

        function checkCross(prevY, curX, curY) {
            if (hoopCrossed) return false;
            if (prevY <= hoop.y && curY > hoop.y) {
                if (Math.abs(curX - hoop.x) < HOOP_RX * 0.95) {
                    hoopCrossed = true;
                    return true;
                }
            }
            return false;
        }

        function spawnParticles(cx, cy, col) {
            for (let i = 0; i < 15; i++) {
                const a = Math.random() * Math.PI * 2;
                const s = 1 + Math.random() * 4;
                particles.push({
                    x: cx, y: cy,
                    vx: Math.cos(a)*s, vy: Math.sin(a)*s - 1.5,
                    color: col, size: 2 + Math.random()*3, life: 1, decay: 0.025
                });
            }
        }

        // ── ПРОСТОЙ ДИЗАЙН МЯЧА ──────────────────────────────────────────────
        function drawBasketball(x, y, r) {
            ctx.save();
            
            if (phase !== 'fly') {
                ctx.shadowColor = 'rgba(15, 23, 42, 0.2)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 4;
            }

            const bGrad = ctx.createRadialGradient(x - r*0.35, y - r*0.35, r*0.05, x, y, r);
            bGrad.addColorStop(0, '#ffa866'); 
            bGrad.addColorStop(0.5, C.ball);  
            bGrad.addColorStop(1, '#b84a00');   
            
            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowColor = 'transparent';
            ctx.strokeStyle = C.ballLines;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.ellipse(x, y, r * 0.45, r, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.arc(x - r*0.4, y - r*0.4, r*0.2, 0, Math.PI*2);
            ctx.fill();

            ctx.restore();
        }

        // ── ОТРИСОВКА СЦЕНЫ ──────────────────────────────────────────────────
        function drawHoop() {
            // ИСПРАВЛЕНО: Правильное извлечение координат из объекта hoop
            const hx = hoop.x;
            const hy = hoop.y;
            const rx = HOOP_RX, ry = HOOP_RY;
            const bw = BOARD_W, bh = BOARD_H;

            const boardSide = 1; 
            const boardX = hx + boardSide * (rx + bw * 0.5 + 4);
            const boardTop = hy - bh * 0.35;

            const flash = hoopAnim > 0;
            const hoopColor = flash ? C.hit2 : C.hoop;

            // Стойка
            ctx.strokeStyle = 'rgba(15, 23, 42, 0.1)';
            ctx.lineWidth   = 4;
            ctx.beginPath();
            ctx.moveTo(boardX, boardTop + bh);
            ctx.lineTo(boardX + boardSide * 20, H);
            ctx.stroke();

            // Кронштейн
            ctx.strokeStyle = C.hoopRim;
            ctx.lineWidth   = 3;
            ctx.beginPath();
            ctx.moveTo(boardX - boardSide * (bw/2), hy);
            ctx.lineTo(hx + boardSide * rx, hy);
            ctx.stroke();

            // Щит
            ctx.fillStyle   = 'rgba(255, 255, 255, 0.9)';
            ctx.strokeStyle = flash ? C.hit2 : C.boardBd;
            ctx.lineWidth   = 2.5;
            ctx.beginPath();
            ctx.roundRect(boardX - bw/2, boardTop, bw, bh, 3);
            ctx.fill(); ctx.stroke();
            
            ctx.strokeStyle = 'rgba(30, 58, 138, 0.5)';
            ctx.lineWidth   = 1.5;
            ctx.strokeRect(boardX - bw/2 + 2, boardTop + bh*0.3, bw - 4, bh * 0.35);

            // Сетка
            const netLines = 10, netH = 34;
            ctx.strokeStyle = flash ? 'rgba(16, 185, 129, 0.7)' : C.net;
            ctx.lineWidth   = 1.5;
            for (let i = 0; i <= netLines; i++) {
                const a  = (i / netLines) * Math.PI * 2;
                const tx = hx + Math.cos(a) * rx;
                const ty = hy + Math.sin(a) * ry;
                const bxt = hx + Math.cos(a) * rx * 0.5;
                const byt = hy + netH;
                ctx.beginPath();
                ctx.moveTo(tx, ty); 
                ctx.lineTo(bxt, byt); 
                ctx.stroke();
            }

            // Кольцо
            ctx.strokeStyle = hoopColor;
            ctx.lineWidth   = 4;
            ctx.beginPath();
            ctx.ellipse(hx, hy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();

            if (hoopAnim > 0) hoopAnim = Math.max(0, hoopAnim - 0.05);
        }

        function drawAimTrajectory() {
            if (phase !== 'aiming') return;

            const vel = getVelocityFromDrag();
            if (Math.hypot(vel.x, vel.y) < 1.5) return;

            const pts = getSimulatedPath(vel.x, vel.y);
            if (pts.length < 2) return;

            ctx.save();
            pts.forEach((pt, idx) => {
                if (idx % 2 !== 0) return;
                const alpha = (1 - idx / pts.length) * 0.85;
                ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
                const size = Math.max(2, 4.5 * (1 - idx / pts.length));
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        function drawBallEntity() {
            const origin = getBallOrigin();
            
            if (phase === 'fly') {
                ballTrail.forEach((p, i) => {
                    const t = (i + 1) / ballTrail.length;
                    ctx.globalAlpha = t * 0.15;
                    ctx.fillStyle   = C.ball;
                    ctx.beginPath(); 
                    ctx.arc(p.x, p.y, BALL_R * t * 0.9, 0, Math.PI*2); 
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
                drawBasketball(ball.x, ball.y, BALL_R);
            } 
            else if (phase === 'aiming') {
                const dx = dragCurrent.x - dragStart.x;
                const dy = dragCurrent.y - dragStart.y;
                
                const dist = Math.hypot(dx, dy);
                const maxVisualDrag = 80;
                let ox = dx;
                let oy = dy;
                if (dist > maxVisualDrag) {
                    ox = (dx / dist) * maxVisualDrag;
                    oy = (dy / dist) * maxVisualDrag;
                }

                ctx.strokeStyle = 'rgba(255, 69, 0, 0.3)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(origin.x, origin.y);
                ctx.lineTo(origin.x + ox, origin.y + oy);
                ctx.stroke();

                drawBasketball(origin.x + ox, origin.y + oy, BALL_R);
            } 
            else {
                drawBasketball(origin.x, origin.y, BALL_R);
                const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.08;
                ctx.strokeStyle = 'rgba(255, 69, 0, 0.2)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(origin.x, origin.y, BALL_R * pulse * 1.35, 0, Math.PI*2);
                ctx.stroke();
            }
        }

        function drawParticles() {
            particles = particles.filter(p => p.life > 0);
            particles.forEach(p => {
                ctx.globalAlpha = p.life;
                ctx.fillStyle   = p.color;
                ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
                p.x += p.vx; p.y += p.vy; p.vy += GRAVITY; p.life -= p.decay;
            });
            ctx.globalAlpha = 1;
        }

        // ИСПРАВЛЕНО: Добавлена недостающая функция добавления всплывающего текста
        function addPop(text, x, y, color, size) {
            popTexts.push({ text, x, y, color, size, life: 1 });
        }

        function drawPopTexts() {
            popTexts = popTexts.filter(p => p.life > 0);
            popTexts.forEach(p => {
                ctx.save();
                ctx.globalAlpha  = Math.min(p.life * 2, 1);
                ctx.fillStyle    = p.color;
                ctx.font         = `900 ${p.size}px 'Geologica',sans-serif`;
                ctx.textAlign    = 'center';
                ctx.fillText(p.text, p.x, p.y);
                ctx.restore();
                p.y   -= 0.8;
                p.life -= 0.015;
            });
        }

        function frame() {
            ctx.clearRect(0, 0, W, H); 
            drawHoop();
            drawAimTrajectory();
            drawBallEntity();
            drawParticles();
            drawPopTexts();
        }

        // ── ЗАПУСК ───────────────────────────────────────────────────────────
        function fireBall(vel) {
            phase = 'fly';
            const origin = getBallOrigin();
            
            ball.x = origin.x;
            ball.y = origin.y;
            ball.vx = vel.x;
            ball.vy = vel.y;
            
            ballTrail = [];
            hoopCrossed = false;
            let scored = false;

            hintEl.style.opacity = '0';

            function flyStep() {
                if (!gameActive) return;

                let lastY = ball.y;

                ball.x += ball.vx;
                ball.y += ball.vy;
                ball.vy += GRAVITY;

                ballTrail.push({ x: ball.x, y: ball.y });
                if (ballTrail.length > 8) ballTrail.shift();

                if (checkCross(lastY, ball.x, ball.y) && !scored) {
                    scored = true;
                    onScore();
                }

                frame();

                if (ball.y < H + 50 && ball.x > -50 && ball.x < W + 50) {
                    rafId = requestAnimationFrame(flyStep);
                } else {
                    if (!scored) onMiss();
                    phase = 'idle';
                    hintEl.style.opacity = '1';
                    frameLoop();
                }
            }
            flyStep();
        }

        // ── ИГРОВАЯ ЛОГИКА ───────────────────────────────────────────────────
        function onScore() {
            combo++;
            const pts = 1 + Math.floor((combo - 1) / 2);
            score += pts;
            scoreEl.textContent = score;

            hoopAnim = 1;
            spawnParticles(hoop.x, hoop.y, combo >= 3 ? C.hit2 : C.hit);

            const label = combo >= 3 ? 'ЧИСТО! +' + pts : '+' + pts;
            const col   = combo >= 3 ? C.hit2 : C.hoop;

            addPop(label, hoop.x, hoop.y - 30, col, combo >= 3 ? 28 : 22);
            showMsg(combo >= 3 ? 'ИДЕАЛЬНО!' : 'ПОПАДАНИЕ!', col, 700);

            if (combo > 1) {
                streakEl.textContent = `🔥 СЕРИЯ ×${combo}`;
                streakEl.classList.add('active');
            }

            setTimeout(randomHoop, 250);

            if (typeof window.onBuiltinGameComplete === 'function' && score > 0)
                window.onBuiltinGameComplete('basketball', score);
        }

        function onMiss() {
            combo = 0;
            streakEl.classList.remove('active');
            showMsg('ПРОМАХ', C.miss, 500);
        }

        function showMsg(text, color, dur) {
            msgEl.style.color   = color;
            msgEl.innerHTML     = text.replace(/\n/g, '<br>');
            msgEl.classList.add('show');
            clearTimeout(msgTimer);
            msgTimer = setTimeout(() => msgEl.classList.remove('show'), dur);
        }

        function startTimer() {
            timeLeft = TOTAL_TIME;
            timerEl.textContent  = timeLeft;
            timerEl.style.color  = C.hoop;
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                if (timeLeft <= 5) timerEl.style.color = C.miss;
                if (timeLeft <= 0) endGame();
            }, 1000);
        }

        function frameLoop() {
            if (!gameActive || phase === 'fly') return;
            frame();
            rafId = requestAnimationFrame(frameLoop);
        }

        function startGame() {
            score = 0; combo = 0; phase = 'idle';
            ballTrail = []; particles = []; popTexts = [];
            hoopAnim = 0;
            scoreEl.textContent  = '0';
            streakEl.classList.remove('active');
            overlay.style.display = 'none';
            gameActive = true;
            randomHoop();
            startTimer();
            frameLoop();
        }

        function endGame() {
            gameActive = false;
            clearInterval(timerInterval);
            cancelAnimationFrame(rafId);
            phase = 'idle';
            if (score > bestScore) bestScore = score;

            overlay.style.display = 'flex';
            overlay.innerHTML = `
                <h1>ВРЕМЯ ВЫШЛО</h1>
                <div class="bk-big">${score}</div>
                <div class="bk-sub">Набранные очки</div>
                <div class="bk-sub" style="margin-top:6px; color:${C.dim}; font-size:13px;">Лучший результат: ${bestScore}</div>
                <button class="bk-btn" id="bkRstBtn">ИГРАТЬ ЕЩЕ</button>`;
            container.querySelector('#bkRstBtn').addEventListener('click', startGame);
        }

        // ── УПРАВЛЕНИЕ ───────────────────────────────────────────────────────
        function onDown(e) {
            if (!gameActive || phase !== 'idle') return;
            const p = getPos(e);
            const origin = getBallOrigin();
            const dist = Math.hypot(p.x - origin.x, p.y - origin.y);
            if (dist > BALL_R * 2.5) return; 

            e.preventDefault();
            phase = 'aiming';
            dragStart = p;
            dragCurrent = p;
        }

        function onMove(e) {
            if (!gameActive || phase !== 'aiming') return;
            e.preventDefault();
            dragCurrent = getPos(e);
        }

        function onUp(e) {
            if (!gameActive || phase !== 'aiming') return;
            e.preventDefault();

            const vel = getVelocityFromDrag();
            const minForce = 2.0;

            if (Math.hypot(vel.x, vel.y) >= minForce) {
                fireBall(vel);
            } else {
                phase = 'idle';
                frameLoop();
            }
        }

        canvas.addEventListener('mousedown',  onDown);
        canvas.addEventListener('mousemove',  onMove);
        canvas.addEventListener('mouseup',    onUp);
        canvas.addEventListener('touchstart', onDown, { passive: false });
        canvas.addEventListener('touchmove',  onMove, { passive: false });
        canvas.addEventListener('touchend',   onUp,   { passive: false });

        startBtn.addEventListener('click', startGame);

        randomHoop();
        frame();

        bestLbl.textContent = bestScore ? 'Рекорд: ' + bestScore : '';

        const obs = new MutationObserver(() => {
            if (!document.contains(canvas)) {
                gameActive = false;
                clearInterval(timerInterval);
                cancelAnimationFrame(rafId);
                obs.disconnect();
            }
        });
        obs.observe(document.body, { childList: true, subtree: true });
    }
};