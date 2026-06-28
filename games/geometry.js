// Игра: Геометрия
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['geometry'] = {
    id: 'geometry',
    name: 'Геометрия',
    description: 'Рисуй геометрические фигуры, проводи параллельные и перпендикулярные прямые! Задания на логику и геометрию.',
    categoryId: 2,
    image: 'games/геометрия.png',
    icon: '📐',
    color: '#eef0ff',
    rating: 4.6,
    ratingCount: 18,
    createdAt: new Date('2024-02-10').toISOString(),

    render(container) {
        container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#f5fbff;';

        // ── ПАЛИТРА ──────────────────────────────────────────────────────────
        const PRIMARY  = '#2c7ad3';
        const SKY      = '#8ac6ff';
        const LAVENDER = '#eef0ff';
        const ACCENT   = '#bcbbff';
        const SUCCESS  = '#86d482';
        const DANGER   = '#ff8a80';
        const CARD_BG  = '#fdf8f0';
        const GRID_COL = '#d4c4b0';
        const LINE_COL = '#2a2a2a';
        const PT_COL   = PRIMARY;

        const GCOLS = 13, GROWS = 11;
        let CELL = 36;

        // ── ОДНО ЗАДАНИЕ КАЖДОГО ТИПА ────────────────────────────────────────
        const TASKS = [
            {
                type: 'parallel',
                label: 'Параллельная прямая',
                instruction: 'Проведите через точку A прямую, параллельную данной. Тяните мышью/пальцем.',
                line: { x1:1, y1:9, x2:11, y2:5 },
                point: { x:4, y:3, label:'A' },
            },
            {
                type: 'perp_pick',
                label: 'Перпендикулярные прямые',
                instruction: 'Нажмите на две прямые, которые перпендикулярны друг другу.',
                lines: [
                    { x1:1, y1:5, x2:12, y2:5, id:0 },  // горизонталь
                    { x1:2, y1:1, x2:8,  y2:10, id:1 }, // диагональ
                    { x1:7, y1:0, x2:7,  y2:11, id:2 }, // вертикаль ← ответ
                    { x1:0, y1:9, x2:12, y2:2,  id:3 }, // диагональ
                ],
                answer: [0, 2],
            },
            {
                type: 'symmetry',
                label: 'Симметрия относительно точки',
                instruction: 'Постройте ломаную, симметричную данной относительно точки O. Нажимайте на узлы сетки.',
                polyline: [ {x:1,y:8}, {x:3,y:6}, {x:5,y:8}, {x:8,y:7} ],
                center: { x:6, y:5, label:'O' },
            },
            {
                type: 'midpoint',
                label: 'Середина отрезка',
                instruction: 'Отметьте точку — середину отрезка AB. Нажмите на нужный узел сетки.',
                points: [ {x:2,y:3,label:'A'}, {x:10,y:7,label:'B'} ],
            },
            {
                type: 'altitude',
                label: 'Высота треугольника',
                instruction: 'Проведите высоту треугольника из вершины A на сторону BC. Тяните линию.',
                triangle: { A:{x:3,y:1}, B:{x:1,y:10}, C:{x:12,y:8} },
                fromVertex: 'A',
            },
            {
                type: 'connect3',
                label: 'Построй треугольник',
                instruction: 'Постройте треугольник, нажимая на вершины A → B → C по порядку.',
                points: [ {x:6,y:1,label:'A'}, {x:1,y:10,label:'B'}, {x:12,y:10,label:'C'} ],
            },
        ];

        let taskIdx = 0, score = 0;

        // ── CSS (один раз, не пересоздаётся) ────────────────────────────────
        const STYLE = `
        <style>
            .geo-root{width:100%;height:100%;display:flex;flex-direction:column;font-family:'Geologica','Nunito',sans-serif;background:#f5fbff;}
            .geo-topbar{display:flex;align-items:center;justify-content:space-between;padding:12px 28px;background:white;border-bottom:2px solid #d9edff;flex-shrink:0;}
            .geo-topbar-title{font-size:1.1rem;font-weight:800;color:${PRIMARY};display:flex;align-items:center;gap:8px;}
            .geo-topbar-right{display:flex;align-items:center;gap:20px;}
            .geo-task-label{font-size:0.78rem;font-weight:700;color:#7a7a7a;}
            .geo-score-badge{background:${LAVENDER};color:${PRIMARY};font-weight:800;padding:5px 14px;border-radius:20px;font-size:0.92rem;}
            .geo-pbar-wrap{height:5px;background:#d9edff;flex-shrink:0;}
            .geo-pbar-fill{height:100%;background:linear-gradient(90deg,${SKY},${PRIMARY});transition:width 0.4s;}
            .geo-main{flex:1;display:flex;align-items:center;justify-content:center;padding:0;overflow:hidden;}
            .geo-canvas-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:16px;}
            .geo-card{background:${CARD_BG};border:2.5px solid #c8a97e;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.07);}
            canvas#geoC{display:block;cursor:crosshair;touch-action:none;}
            .geo-instr-bar{background:${LAVENDER};border-top:2px solid ${ACCENT};padding:11px 18px;font-size:0.92rem;font-weight:600;color:${PRIMARY};text-align:center;}
            .geo-ctrl-col{width:220px;flex-shrink:0;display:flex;flex-direction:column;gap:10px;padding:20px 20px 20px 0;align-items:stretch;}
            .geo-btn{padding:11px 18px;font-size:0.92rem;font-weight:700;border-radius:12px;cursor:pointer;font-family:inherit;border:2.5px solid;transition:all 0.2s;text-align:center;}
            .geo-btn-ok{background:${PRIMARY};border-color:#1a5fa8;color:white;box-shadow:0 4px 12px rgba(44,122,211,0.25);}
            .geo-btn-ok:hover{background:#1a5fa8;}
            .geo-btn-clear{background:white;border-color:#d9edff;color:${PRIMARY};}
            .geo-btn-clear:hover{background:#d9edff;}
            .geo-btn-next{background:${PRIMARY};border-color:#1a5fa8;color:white;box-shadow:0 4px 12px rgba(44,122,211,0.25);}
            .geo-btn-next:hover{background:#1a5fa8;}
            .geo-hint{font-size:0.85rem;padding:10px 14px;border-radius:10px;min-height:42px;text-align:center;font-weight:600;}
            .geo-hint.ok{background:#f0faf0;color:#2e7d32;}
            .geo-hint.err{background:#fff5f5;color:#c62828;}
            .geo-hint.tip{background:${LAVENDER};color:${PRIMARY};}
            .geo-label{font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;color:#7a7a7a;font-weight:700;margin-bottom:2px;}
            .geo-section{display:flex;flex-direction:column;gap:6px;}
            .geo-divider{height:1px;background:#e8f4f8;margin:4px 0;}
            .geo-task-title{font-size:1rem;font-weight:800;color:${PRIMARY};margin-bottom:2px;}
            .geo-info{font-size:0.82rem;color:#7a7a7a;line-height:1.5;padding:8px 12px;background:white;border-radius:10px;border:2px solid #d9edff;}
        </style>`;

        // ── РЕНДЕР ЗАДАНИЯ ───────────────────────────────────────────────────
        function render() {
            const task = TASKS[taskIdx];
            container.innerHTML = STYLE + `
            <div class="geo-root">
                <div class="geo-topbar">
                    <div class="geo-topbar-title">📐 Геометрия</div>
                    <div class="geo-topbar-right">
                        <span class="geo-task-label">Задание ${taskIdx+1} / ${TASKS.length}</span>
                        <span class="geo-score-badge">⭐ ${score} очков</span>
                    </div>
                </div>
                <div class="geo-pbar-wrap"><div class="geo-pbar-fill" style="width:${taskIdx/TASKS.length*100}%"></div></div>
                <div class="geo-main">
                    <div class="geo-canvas-col">
                        <div class="geo-card">
                            <canvas id="geoC"></canvas>
                            <div class="geo-instr-bar">${task.instruction}</div>
                        </div>
                    </div>
                    <div class="geo-ctrl-col">
                        <div class="geo-task-title">${task.label}</div>
                        <div class="geo-divider"></div>
                        <div id="geoCtrl"></div>
                        <div id="geoHint" class="geo-hint tip" style="display:none"></div>
                        <div id="geoNextWrap"></div>
                    </div>
                </div>
            </div>`;

            // ── CANVAS ───────────────────────────────────────────────────────
            const canvas   = container.querySelector('#geoC');
            const ctx      = canvas.getContext('2d');
            const hintDiv  = container.querySelector('#geoHint');
            const ctrlDiv  = container.querySelector('#geoCtrl');
            const nextWrap = container.querySelector('#geoNextWrap');
            let answered   = false;
            let currentDraw = null;

            // Пересчёт размеров canvas
            function resize() {
                const col = container.querySelector('.geo-canvas-col');
                const avW = col.offsetWidth - 32;
                const avH = col.offsetHeight - 80;
                const byW = Math.floor(avW / GCOLS);
                const byH = Math.floor(avH / GROWS);
                CELL = Math.max(22, Math.min(48, byW, byH));
                const W = GCOLS * CELL, H = GROWS * CELL;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = W * dpr; canvas.height = H * dpr;
                canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                if (typeof currentDraw === 'function') currentDraw();
            }
            setTimeout(resize, 30);
            const ro = new ResizeObserver(resize);
            ro.observe(container.querySelector('.geo-canvas-col'));

            // ── ХЕЛПЕРЫ КООРДИНАТ ────────────────────────────────────────────
            const gx = v => v * CELL;
            const gy = v => v * CELL;
            const toG = px => Math.round(px / CELL);

            function getPos(e) {
                const r  = canvas.getBoundingClientRect();
                const sc = (GCOLS * CELL) / r.width; // единый масштаб (квадратные ячейки)
                const src = e.touches ? e.touches[0] : e.changedTouches ? e.changedTouches[0] : e;
                return {
                    px: (src.clientX - r.left) * sc,
                    py: (src.clientY - r.top)  * sc,
                };
            }

            function distToSeg(px, py, x1, y1, x2, y2) {
                const dx = x2-x1, dy = y2-y1;
                const t  = Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / (dx*dx+dy*dy)));
                return Math.hypot(px-(x1+t*dx), py-(y1+t*dy));
            }

            // ── ХЕЛПЕРЫ РИСОВАНИЯ ────────────────────────────────────────────
            function clearCanvas() {
                const W = GCOLS*CELL, H = GROWS*CELL;
                ctx.fillStyle = CARD_BG; ctx.fillRect(0, 0, W, H);
                ctx.strokeStyle = GRID_COL; ctx.lineWidth = 0.7;
                for (let c = 0; c <= GCOLS; c++) { ctx.beginPath(); ctx.moveTo(gx(c),0); ctx.lineTo(gx(c),H); ctx.stroke(); }
                for (let r = 0; r <= GROWS; r++) { ctx.beginPath(); ctx.moveTo(0,gy(r)); ctx.lineTo(W,gy(r)); ctx.stroke(); }
            }

            function dLine(x1, y1, x2, y2, color, width, dash) {
                ctx.save();
                ctx.strokeStyle = color; ctx.lineWidth = width || 2.5; ctx.lineCap = 'round';
                if (dash) ctx.setLineDash(dash);
                ctx.beginPath(); ctx.moveTo(gx(x1), gy(y1)); ctx.lineTo(gx(x2), gy(y2)); ctx.stroke();
                ctx.restore();
            }

            function dPoint(x, y, label, color, r) {
                ctx.save();
                ctx.fillStyle = color || PT_COL;
                ctx.beginPath(); ctx.arc(gx(x), gy(y), r || 5.5, 0, Math.PI*2); ctx.fill();
                if (label) { ctx.font = 'bold 13px Geologica,Nunito,sans-serif'; ctx.fillText(label, gx(x)+8, gy(y)-7); }
                ctx.restore();
            }

            function dPolyline(pts, color, width, dash) {
                if (pts.length < 2) return;
                ctx.save();
                ctx.strokeStyle = color || LINE_COL; ctx.lineWidth = width || 2.5;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                if (dash) ctx.setLineDash(dash);
                ctx.beginPath(); ctx.moveTo(gx(pts[0].x), gy(pts[0].y));
                for (let i = 1; i < pts.length; i++) ctx.lineTo(gx(pts[i].x), gy(pts[i].y));
                ctx.stroke(); ctx.restore();
            }

            function showHint(msg, type) {
                hintDiv.textContent = msg;
                hintDiv.className   = 'geo-hint ' + type;
                hintDiv.style.display = 'block';
            }

            function afterAnswer(correct) {
                if (answered) return;
                answered = true;
                if (correct) score += 10;
                showHint(
                    correct ? '✅ Верно! +10 очков' : '❌ Не совсем... Правильный ответ показан пунктиром',
                    correct ? 'ok' : 'err'
                );
                setTimeout(() => {
                    nextWrap.innerHTML = taskIdx + 1 < TASKS.length
                        ? `<button class="geo-btn geo-btn-next" onclick="geoNext()">Следующее →</button>`
                        : `<button class="geo-btn geo-btn-next" onclick="geoFinish()">🎓 Результаты</button>`;
                }, 600);
            }

            window.geoNext   = () => { taskIdx++; render(); };
            window.geoFinish = () => {
                container.innerHTML = `
                <style>.geo-end{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f5fbff;font-family:'Geologica','Nunito',sans-serif;gap:10px;}</style>
                <div class="geo-end">
                    <div style="font-size:4rem">📐</div>
                    <h2 style="color:${PRIMARY};margin:0">Геометрия пройдена!</h2>
                    <div style="font-size:3.5rem;font-weight:800;color:${PRIMARY}">${score}</div>
                    <div style="color:#7a7a7a;font-size:1.1rem">очков из ${TASKS.length * 10}</div>
                    <button style="margin-top:10px;padding:14px 36px;font-size:1rem;font-weight:700;background:${PRIMARY};border:none;border-radius:14px;color:white;cursor:pointer;font-family:inherit;" onclick="window.geoRestart()">Заново</button>
                </div>`;
                if (typeof window.onBuiltinGameComplete === 'function')
                    window.onBuiltinGameComplete('geometry', score);
            };
            window.geoRestart = () => { taskIdx = 0; score = 0; render(); };

            // ── ХЕЛПЕР: drag-линия (переиспользуется в parallel и altitude) ──
            function makeDragLine(onChange) {
                let dragging = false, dragStart = null;
                function start(e) {
                    if (answered) return;
                    dragging  = true;
                    dragStart = getPos(e);
                }
                function move(e) {
                    if (!dragging || answered) return;
                    const p = getPos(e);
                    onChange({
                        x1: dragStart.px / CELL, y1: dragStart.py / CELL,
                        x2: p.px / CELL,         y2: p.py / CELL,
                    });
                }
                function end() { dragging = false; }
                canvas.addEventListener('mousedown',  start);
                canvas.addEventListener('mousemove',  move);
                canvas.addEventListener('mouseup',    end);
                canvas.addEventListener('touchstart', start, { passive: true });
                canvas.addEventListener('touchmove',  move,  { passive: true });
                canvas.addEventListener('touchend',   end);
            }

            // ══════════════════════════════════════════════════════════════════
            // ЗАДАНИЯ
            // ══════════════════════════════════════════════════════════════════

            // ── PARALLEL ────────────────────────────────────────────────────
            if (task.type === 'parallel') {
                let userLine = null;

                currentDraw = () => {
                    clearCanvas();
                    dLine(task.line.x1, task.line.y1, task.line.x2, task.line.y2, LINE_COL, 3.5);
                    dPoint(task.point.x, task.point.y, task.point.label, PT_COL);
                    if (userLine) dLine(userLine.x1, userLine.y1, userLine.x2, userLine.y2, SKY, 2.5);
                };
                currentDraw();

                ctrlDiv.innerHTML = `
                    <div class="geo-info">Зажмите и тяните по холсту, чтобы нарисовать прямую через точку ${task.point.label}.</div>
                    <div class="geo-section" style="margin-top:10px">
                        <button class="geo-btn geo-btn-clear" onclick="geoParClear()">🗑 Стереть</button>
                        <button class="geo-btn geo-btn-ok"    onclick="geoParCheck()">✓ Проверить</button>
                    </div>`;

                window.geoParClear = () => { userLine = null; hintDiv.style.display = 'none'; currentDraw(); };

                makeDragLine(line => { userLine = line; currentDraw(); });

                window.geoParCheck = () => {
                    if (answered) return;
                    if (!userLine) { showHint('Сначала нарисуйте прямую!', 'tip'); return; }
                    const rDx = task.line.x2 - task.line.x1, rDy = task.line.y2 - task.line.y1;
                    const uDx = userLine.x2 - userLine.x1,   uDy = userLine.y2 - userLine.y1;
                    const len = Math.hypot(uDx, uDy);
                    if (len < 1.5) { showHint('Линия слишком короткая!', 'tip'); return; }
                    const sinA = Math.abs(rDx*uDy - rDy*uDx) / (Math.hypot(rDx, rDy) * len);
                    const pt   = task.point;
                    const dPt  = Math.abs(uDy*(pt.x-userLine.x1) - uDx*(pt.y-userLine.y1)) / len;
                    const correct = sinA < 0.15 && dPt < 1.4;
                    clearCanvas();
                    dLine(task.line.x1, task.line.y1, task.line.x2, task.line.y2, LINE_COL, 3.5);
                    dPoint(task.point.x, task.point.y, task.point.label, PT_COL);
                    dLine(userLine.x1, userLine.y1, userLine.x2, userLine.y2, correct ? SUCCESS : DANGER, 2.5);
                    if (!correct) {
                        const t = 8 / Math.hypot(rDx, rDy);
                        dLine(pt.x - rDx*t, pt.y - rDy*t, pt.x + rDx*t, pt.y + rDy*t, SUCCESS, 2, [6,4]);
                    }
                    afterAnswer(correct);
                };
            }

            // ── PERP_PICK ────────────────────────────────────────────────────
            else if (task.type === 'perp_pick') {
                let selected = [];

                currentDraw = () => {
                    clearCanvas();
                    task.lines.forEach(l => {
                        const isSel = selected.includes(l.id);
                        dLine(l.x1, l.y1, l.x2, l.y2, isSel ? PRIMARY : LINE_COL, isSel ? 4 : 2.5);
                        if (isSel) {
                            const mx = (l.x1+l.x2)/2, my = (l.y1+l.y2)/2;
                            ctx.save(); ctx.fillStyle = PRIMARY;
                            ctx.beginPath(); ctx.arc(gx(mx), gy(my), 5, 0, Math.PI*2); ctx.fill();
                            ctx.restore();
                        }
                    });
                };
                currentDraw();

                ctrlDiv.innerHTML = `<div class="geo-info">Нажмите на первую прямую, затем на вторую. Выбрано: <b id="perpCount">0</b>/2</div>`;

                function handlePerpClick(e) {
                    if (answered) return;
                    const { px, py } = getPos(e);
                    const clicked = task.lines.find(l => distToSeg(px, py, gx(l.x1), gy(l.y1), gx(l.x2), gy(l.y2)) < 22);
                    if (!clicked) return;
                    const idx = selected.indexOf(clicked.id);
                    if (idx === -1) { if (selected.length < 2) selected.push(clicked.id); }
                    else selected.splice(idx, 1);
                    container.querySelector('#perpCount').textContent = selected.length;
                    currentDraw();
                    if (selected.length === 2) setTimeout(checkPerp, 300);
                }
                canvas.addEventListener('click', handlePerpClick);
                canvas.addEventListener('touchend', e => { e.preventDefault(); handlePerpClick(e.changedTouches[0]); }, { passive: false });

                function checkPerp() {
                    const correct = task.answer.slice().sort().join(',') === selected.slice().sort().join(',');
                    clearCanvas();
                    task.lines.forEach(l => {
                        const isSel = selected.includes(l.id), isAns = task.answer.includes(l.id);
                        const c = isSel && isAns ? SUCCESS : isSel && !isAns ? DANGER : !isSel && isAns && !correct ? SUCCESS : LINE_COL;
                        dLine(l.x1, l.y1, l.x2, l.y2, c, isSel || isAns ? 4 : 2.5);
                    });
                    afterAnswer(correct);
                }
            }

            // ── SYMMETRY ─────────────────────────────────────────────────────
            else if (task.type === 'symmetry') {
                const O = task.center;
                const answerPts = task.polyline.map(p => ({ x: 2*O.x - p.x, y: 2*O.y - p.y }));
                const needed    = task.polyline.length;
                let userPts     = [];

                currentDraw = () => {
                    clearCanvas();
                    dPolyline(task.polyline, LINE_COL, 3);
                    task.polyline.forEach(p => { ctx.save(); ctx.fillStyle = LINE_COL; ctx.beginPath(); ctx.arc(gx(p.x), gy(p.y), 4, 0, Math.PI*2); ctx.fill(); ctx.restore(); });
                    dPoint(O.x, O.y, O.label, '#e74c3c', 5.5);
                    if (userPts.length > 1) dPolyline(userPts, SKY, 2.5);
                    userPts.forEach(p => { ctx.save(); ctx.fillStyle = PRIMARY; ctx.beginPath(); ctx.arc(gx(p.x), gy(p.y), 5.5, 0, Math.PI*2); ctx.fill(); ctx.restore(); });
                };
                currentDraw();

                ctrlDiv.innerHTML = `
                    <div class="geo-info">Нажмите на <b>${needed} узла</b> сетки — точки симметричной ломаной (по порядку).<br>Отмечено: <b id="symCount">0</b>/${needed}</div>
                    <div class="geo-section" style="margin-top:10px">
                        <button class="geo-btn geo-btn-clear" onclick="geoSymClear()">🗑 Стереть</button>
                        <button class="geo-btn geo-btn-ok"    onclick="geoSymCheck()">✓ Проверить</button>
                    </div>`;

                window.geoSymClear = () => { userPts = []; hintDiv.style.display = 'none'; container.querySelector('#symCount').textContent = '0'; currentDraw(); };

                canvas.addEventListener('click', e => {
                    if (answered || userPts.length >= needed) return;
                    const { px, py } = getPos(e);
                    userPts.push({ x: toG(px), y: toG(py) });
                    container.querySelector('#symCount').textContent = userPts.length;
                    currentDraw();
                });

                window.geoSymCheck = () => {
                    if (answered) return;
                    if (userPts.length < needed) { showHint(`Нужно ещё ${needed - userPts.length} точек!`, 'tip'); return; }
                    const correct = userPts.every((p, i) => Math.abs(p.x - answerPts[i].x) <= 1 && Math.abs(p.y - answerPts[i].y) <= 1);
                    clearCanvas();
                    dPolyline(task.polyline, LINE_COL, 3);
                    task.polyline.forEach(p => { ctx.save(); ctx.fillStyle = LINE_COL; ctx.beginPath(); ctx.arc(gx(p.x), gy(p.y), 4, 0, Math.PI*2); ctx.fill(); ctx.restore(); });
                    dPoint(O.x, O.y, O.label, '#e74c3c', 5.5);
                    dPolyline(userPts, correct ? SUCCESS : DANGER, 2.5);
                    if (!correct) dPolyline(answerPts, SUCCESS, 2, [6,4]);
                    afterAnswer(correct);
                };
            }

            // ── MIDPOINT ─────────────────────────────────────────────────────
            else if (task.type === 'midpoint') {
                const [A, B] = task.points;
                const mx = (A.x+B.x)/2, my = (A.y+B.y)/2;
                let userPt = null;

                currentDraw = () => {
                    clearCanvas();
                    dLine(A.x, A.y, B.x, B.y, LINE_COL, 3);
                    dPoint(A.x, A.y, A.label, PT_COL);
                    dPoint(B.x, B.y, B.label, PT_COL);
                    if (userPt) { ctx.save(); ctx.fillStyle = PRIMARY; ctx.beginPath(); ctx.arc(gx(userPt.x), gy(userPt.y), 7, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
                };
                currentDraw();

                ctrlDiv.innerHTML = `
                    <div class="geo-info">Нажмите на точку сетки, которая является серединой отрезка AB.</div>
                    <div class="geo-section" style="margin-top:10px">
                        <button class="geo-btn geo-btn-clear" onclick="geoMidClear()">🗑 Стереть</button>
                        <button class="geo-btn geo-btn-ok"    onclick="geoMidCheck()">✓ Проверить</button>
                    </div>`;

                window.geoMidClear = () => { userPt = null; hintDiv.style.display = 'none'; currentDraw(); };

                canvas.addEventListener('click', e => {
                    if (answered) return;
                    const { px, py } = getPos(e);
                    userPt = { x: toG(px), y: toG(py) };
                    currentDraw();
                });

                window.geoMidCheck = () => {
                    if (answered) return;
                    if (!userPt) { showHint('Нажмите на середину!', 'tip'); return; }
                    const correct = Math.abs(userPt.x - mx) <= 1 && Math.abs(userPt.y - my) <= 1;
                    clearCanvas();
                    dLine(A.x, A.y, B.x, B.y, LINE_COL, 3);
                    dPoint(A.x, A.y, A.label, PT_COL);
                    dPoint(B.x, B.y, B.label, PT_COL);
                    ctx.save(); ctx.fillStyle = correct ? SUCCESS : DANGER; ctx.beginPath(); ctx.arc(gx(userPt.x), gy(userPt.y), 7, 0, Math.PI*2); ctx.fill(); ctx.restore();
                    if (!correct) { ctx.save(); ctx.fillStyle = SUCCESS; ctx.beginPath(); ctx.arc(gx(mx), gy(my), 7, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
                    afterAnswer(correct);
                };
            }

            // ── ALTITUDE ─────────────────────────────────────────────────────
            else if (task.type === 'altitude') {
                const T    = task.triangle;
                const from = T[task.fromVertex];
                const dx   = T.C.x - T.B.x, dy = T.C.y - T.B.y;
                const t    = ((from.x-T.B.x)*dx + (from.y-T.B.y)*dy) / (dx*dx + dy*dy);
                const foot = { x: T.B.x + t*dx, y: T.B.y + t*dy };
                let userLine = null;

                currentDraw = () => {
                    clearCanvas();
                    dLine(T.A.x, T.A.y, T.B.x, T.B.y, LINE_COL, 3);
                    dLine(T.B.x, T.B.y, T.C.x, T.C.y, LINE_COL, 3);
                    dLine(T.A.x, T.A.y, T.C.x, T.C.y, LINE_COL, 3);
                    ['A','B','C'].forEach(k => dPoint(T[k].x, T[k].y, k, PT_COL));
                    if (userLine) dLine(userLine.x1, userLine.y1, userLine.x2, userLine.y2, SKY, 2.5);
                };
                currentDraw();

                ctrlDiv.innerHTML = `
                    <div class="geo-info">Тяните линию от вершины <b>A</b> до основания высоты на стороне BC. Высота перпендикулярна BC.</div>
                    <div class="geo-section" style="margin-top:10px">
                        <button class="geo-btn geo-btn-clear" onclick="geoAltClear()">🗑 Стереть</button>
                        <button class="geo-btn geo-btn-ok"    onclick="geoAltCheck()">✓ Проверить</button>
                    </div>`;

                window.geoAltClear = () => { userLine = null; hintDiv.style.display = 'none'; currentDraw(); };

                makeDragLine(line => { userLine = line; currentDraw(); });

                window.geoAltCheck = () => {
                    if (answered) return;
                    if (!userLine) { showHint('Нарисуйте высоту!', 'tip'); return; }
                    const uDx = userLine.x2 - userLine.x1, uDy = userLine.y2 - userLine.y1;
                    const len = Math.hypot(uDx, uDy);
                    if (len < 1) { showHint('Линия слишком короткая!', 'tip'); return; }
                    const startNear = Math.hypot(userLine.x1-from.x, userLine.y1-from.y) < 2 || Math.hypot(userLine.x2-from.x, userLine.y2-from.y) < 2;
                    const cross     = Math.abs(uDx*dy - uDy*dx) / (len * Math.hypot(dx, dy));
                    const endNear   = Math.hypot(userLine.x1-foot.x, userLine.y1-foot.y) < 1.8 || Math.hypot(userLine.x2-foot.x, userLine.y2-foot.y) < 1.8;
                    const correct   = startNear && cross < 0.18 && endNear;
                    clearCanvas();
                    dLine(T.A.x, T.A.y, T.B.x, T.B.y, LINE_COL, 3);
                    dLine(T.B.x, T.B.y, T.C.x, T.C.y, LINE_COL, 3);
                    dLine(T.A.x, T.A.y, T.C.x, T.C.y, LINE_COL, 3);
                    ['A','B','C'].forEach(k => dPoint(T[k].x, T[k].y, k, PT_COL));
                    dLine(userLine.x1, userLine.y1, userLine.x2, userLine.y2, correct ? SUCCESS : DANGER, 2.5);
                    if (!correct) dLine(from.x, from.y, foot.x, foot.y, SUCCESS, 2, [6,4]);
                    // угол при основании
                    const bL = 0.6 / Math.hypot(dx, dy);
                    const nx = dx*bL, ny = dy*bL;
                    ctx.save(); ctx.strokeStyle = SUCCESS; ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(gx(foot.x+nx), gy(foot.y+ny));
                    ctx.lineTo(gx(foot.x+nx-ny), gy(foot.y+ny+nx));
                    ctx.lineTo(gx(foot.x-ny), gy(foot.y+nx));
                    ctx.stroke(); ctx.restore();
                    afterAnswer(correct);
                };
            }

            // ── CONNECT3 ─────────────────────────────────────────────────────
            else if (task.type === 'connect3') {
                let userLines = [], step = 0, lastPt = null;

                currentDraw = () => {
                    clearCanvas();
                    task.points.forEach(p => dPoint(p.x, p.y, p.label, PT_COL));
                    userLines.forEach(l => dLine(l.x1, l.y1, l.x2, l.y2, SKY, 2.5));
                    if (lastPt && step < task.points.length) { ctx.save(); ctx.fillStyle = PRIMARY; ctx.beginPath(); ctx.arc(gx(lastPt.x), gy(lastPt.y), 8, 0, Math.PI*2); ctx.fill(); ctx.restore(); }
                };
                currentDraw();

                ctrlDiv.innerHTML = `
                    <div class="geo-info">Нажимайте на вершины <b>A → B → C</b> по порядку. Треугольник замкнётся автоматически.</div>
                    <div class="geo-section" style="margin-top:10px">
                        <button class="geo-btn geo-btn-clear" onclick="geoTri3Clear()">🗑 Стереть</button>
                        <button class="geo-btn geo-btn-ok"    onclick="geoTri3Check()">✓ Проверить</button>
                    </div>`;

                window.geoTri3Clear = () => { userLines = []; step = 0; lastPt = null; hintDiv.style.display = 'none'; currentDraw(); };

                canvas.addEventListener('click', e => {
                    if (answered || step >= task.points.length) return;
                    const { px, py } = getPos(e);
                    const snap = task.points.find(p => Math.abs(p.x - toG(px)) <= 1.2 && Math.abs(p.y - toG(py)) <= 1.2);
                    if (!snap) return;
                    if (step === 0) { lastPt = snap; step = 1; }
                    else {
                        if (snap === lastPt) return;
                        userLines.push({ x1:lastPt.x, y1:lastPt.y, x2:snap.x, y2:snap.y });
                        lastPt = snap; step++;
                        if (step === task.points.length)
                            userLines.push({ x1:snap.x, y1:snap.y, x2:task.points[0].x, y2:task.points[0].y });
                    }
                    currentDraw();
                });

                window.geoTri3Check = () => {
                    if (answered) return;
                    if (userLines.length < 3) { showHint('Соедините все три точки!', 'tip'); return; }
                    clearCanvas();
                    task.points.forEach(p => dPoint(p.x, p.y, p.label, PT_COL));
                    userLines.forEach(l => dLine(l.x1, l.y1, l.x2, l.y2, SUCCESS, 2.5));
                    afterAnswer(true);
                };
            }

            // ── ОЧИСТКА ──────────────────────────────────────────────────────
            const obs = new MutationObserver(() => {
                if (!document.contains(canvas)) { ro.disconnect(); obs.disconnect(); }
            });
            obs.observe(document.body, { childList: true, subtree: true });

        } // end render()

        render();
    }
};
