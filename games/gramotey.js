// Игра: Грамотей
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['gramotey'] = {
    id: 'gramotey',
    name: 'Грамотей',
    description: 'Тренируй орфографию! Вставь пропущенную букву, выбери правильное написание и набирай очки.',
    categoryId: 2,
    image: 'games/грамотей.png',
    icon: '✏️',
    color: '#eef0ff',
    rating: 4.8,
    ratingCount: 32,
    createdAt: new Date('2024-03-01').toISOString(),
    render(container) {
        container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#f5fbff;overflow:hidden;font-family:"Geologica","Nunito",sans-serif;';

        const PRIMARY  = '#2c7ad3';
        const SKY      = '#8ac6ff';
        const LAVENDER = '#eef0ff';
        const ACCENT   = '#bcbbff';
        const SUCCESS  = '#86d482';
        const DANGER   = '#ff8a80';

        // ── ЗАДАНИЯ ──────────────────────────────────────────────────────────
        // Тип 'fill' — вставь букву; 'choose' — выбери правильное слово
        const TASKS = [
            // ВСТАВЬ БУКВУ
            { type:'fill', word:'к_рандаш',    answer:'а', hint:'Каранд..ш — пишем «а»',         rule:'Словарное слово' },
            { type:'fill', word:'м_локо',       answer:'о', hint:'М..локо — пишем «о»',            rule:'Словарное слово' },
            { type:'fill', word:'г_рой',        answer:'е', hint:'Г..рой — пишем «е»',             rule:'Проверка: «герои»' },
            { type:'fill', word:'б_рёза',       answer:'е', hint:'Б..рёза — пишем «е»',            rule:'Словарное слово' },
            { type:'fill', word:'р_бята',       answer:'е', hint:'Р..бята — пишем «е»',            rule:'Проверка: «ребёнок»' },
            { type:'fill', word:'уч_ник',       answer:'е', hint:'Уч..ник — пишем «е»',            rule:'Проверка: «учение»' },
            { type:'fill', word:'п_года',       answer:'о', hint:'П..года — пишем «о»',            rule:'Словарное слово' },
            { type:'fill', word:'з_ма',         answer:'и', hint:'З..ма — пишем «и»',              rule:'Проверка: «зимы»' },
            { type:'fill', word:'в_сна',        answer:'е', hint:'В..сна — пишем «е»',             rule:'Проверка: «вёсны»' },
            { type:'fill', word:'с_бака',       answer:'о', hint:'С..бака — пишем «о»',            rule:'Словарное слово' },
            { type:'fill', word:'д_ревня',      answer:'е', hint:'Д..ревня — пишем «е»',           rule:'Проверка: «деревья»' },
            { type:'fill', word:'в_робей',      answer:'о', hint:'В..робей — пишем «о»',           rule:'Словарное слово' },
            { type:'fill', word:'г_рода',       answer:'о', hint:'Г..рода — пишем «о»',            rule:'Проверка: «город»' },
            { type:'fill', word:'ябл_ко',       answer:'о', hint:'Ябл..ко — пишем «о»',            rule:'Проверка: «яблок»' },
            { type:'fill', word:'п_тух',        answer:'е', hint:'П..тух — пишем «е»',             rule:'Проверка: «петухи»' },
            { type:'fill', word:'з_мля',        answer:'е', hint:'З..мля — пишем «е»',             rule:'Проверка: «земли»' },
            // ВЫБЕРИ ПРАВИЛЬНОЕ
            { type:'choose', question:'Выбери правильное написание', options:['карова','корова','кОрова','КАрова'], answer:'корова',      rule:'Словарное слово' },
            { type:'choose', question:'Выбери правильное написание', options:['медведь','мидведь','мидвидь','медвидь'], answer:'медведь',  rule:'Словарное слово' },
            { type:'choose', question:'Как правильно?', options:['ошипка','ашибка','ошибка','ошыбка'], answer:'ошибка',                   rule:'Словарное слово' },
            { type:'choose', question:'Найди слово без ошибки', options:['агурец','огурец','огурэц','агурэц'], answer:'огурец',            rule:'Словарное слово' },
            { type:'choose', question:'Выбери правильное написание', options:['малако','молако','молоко','малоко'], answer:'молоко',        rule:'Словарное слово' },
            { type:'choose', question:'Как написать правильно?', options:['зонтик','зАнтик','зОнтик','зантик'], answer:'зонтик',           rule:'Словарное слово' },
            { type:'choose', question:'Выбери верное слово', options:['тетрать','тетрадь','титрадь','тетрод'], answer:'тетрадь',           rule:'Словарное слово' },
            { type:'choose', question:'Выбери верное написание', options:['аблако','облака','Облака','оплако'], answer:'облака',            rule:'Проверка: «облако»' },
            { type:'choose', question:'Как пишется слово?', options:['ребята','рибята','рябята','рыбята'], answer:'ребята',                rule:'Проверка: «ребёнок»' },
            { type:'choose', question:'Найди верное слово', options:['дерево','дирево','дырево','дерива'], answer:'дерево',                rule:'Проверка: «деревья»' },
        ];

        let taskOrder = [], taskIdx = 0, score = 0, streak = 0, bestStreak = 0;
        let answered = false;

        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function startGame() {
            taskOrder = shuffle(TASKS.map((_, i) => i));
            taskIdx = 0; score = 0; streak = 0; bestStreak = 0;
            renderTask();
        }

        function renderBase() {
            const pct = Math.round((taskIdx / TASKS.length) * 100);
            container.innerHTML = `
            <style>
                .gr-root { width:100%;height:100%;display:flex;flex-direction:column;font-family:'Geologica','Nunito',sans-serif;background:#f5fbff; }
                .gr-topbar { display:flex;align-items:center;justify-content:space-between;padding:12px 28px;background:white;border-bottom:2px solid #d9edff;flex-shrink:0; }
                .gr-title { font-size:1.1rem;font-weight:800;color:${PRIMARY};display:flex;align-items:center;gap:8px; }
                .gr-meta { display:flex;align-items:center;gap:16px; }
                .gr-score-badge { background:${LAVENDER};color:${PRIMARY};font-weight:800;padding:5px 16px;border-radius:20px;font-size:0.92rem; }
                .gr-streak { background:#fff8e1;color:#f9a825;font-weight:800;padding:5px 12px;border-radius:20px;font-size:0.92rem; }
                .gr-pbar-wrap { height:6px;background:#d9edff;flex-shrink:0; }
                .gr-pbar-fill { height:100%;background:linear-gradient(90deg,${SKY},${PRIMARY});transition:width 0.5s; }
                .gr-center { flex:1;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto; }
                .gr-card {
                    background:white;border-radius:20px;border:2px solid #d9edff;
                    box-shadow:0 8px 32px rgba(44,122,211,0.10);
                    padding:36px 40px;max-width:560px;width:100%;text-align:center;
                }
                .gr-task-num { font-size:0.75rem;font-weight:700;color:${SKY};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px; }
                .gr-word { font-size:2.6rem;font-weight:800;color:${PRIMARY};letter-spacing:4px;margin-bottom:8px;line-height:1.2; }
                .gr-rule-tag { display:inline-block;background:${LAVENDER};color:${PRIMARY};font-size:0.72rem;font-weight:700;padding:3px 12px;border-radius:10px;margin-bottom:22px; }
                .gr-question { font-size:1.1rem;font-weight:700;color:#444;margin-bottom:20px; }
                .gr-input-row { display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:24px; }
                .gr-letter-input {
                    width:54px;height:60px;font-size:2rem;font-weight:800;text-align:center;
                    border:3px solid ${SKY};border-radius:12px;color:${PRIMARY};background:#f5fbff;
                    outline:none;font-family:inherit;text-transform:lowercase;
                    transition:border-color 0.2s,box-shadow 0.2s;
                }
                .gr-letter-input:focus { border-color:${PRIMARY};box-shadow:0 0 0 4px rgba(44,122,211,0.12); }
                .gr-letter-input.correct { border-color:#86d482;background:#f0fff0; }
                .gr-letter-input.wrong   { border-color:#ff8a80;background:#fff5f5; }
                .gr-opts { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px; }
                .gr-opt {
                    padding:14px 10px;font-size:1.05rem;font-weight:700;
                    border:2.5px solid #d9edff;border-radius:14px;background:white;
                    color:#333;cursor:pointer;font-family:inherit;
                    transition:all 0.15s;letter-spacing:1px;
                }
                .gr-opt:hover:not(:disabled) { border-color:${PRIMARY};color:${PRIMARY};background:${LAVENDER}; }
                .gr-opt.correct { border-color:#86d482;background:#f0fff0;color:#2e7d32; }
                .gr-opt.wrong   { border-color:#ff8a80;background:#fff5f5;color:#c62828; }
                .gr-opt:disabled { cursor:default;opacity:0.8; }
                .gr-hint { background:${LAVENDER};border-left:4px solid ${ACCENT};border-radius:10px;padding:10px 16px;font-size:0.9rem;color:${PRIMARY};font-weight:600;margin-bottom:20px;text-align:left;display:none; }
                .gr-hint.show { display:block; }
                .gr-btn-row { display:flex;gap:12px;justify-content:center;flex-wrap:wrap; }
                .gr-btn {
                    padding:13px 28px;font-size:1rem;font-weight:700;border:none;border-radius:14px;
                    cursor:pointer;font-family:inherit;transition:all 0.18s;
                }
                .gr-btn-check { background:${PRIMARY};color:white;box-shadow:0 4px 14px rgba(44,122,211,0.25); }
                .gr-btn-check:hover { background:#1a5fa8; }
                .gr-btn-next  { background:#86d482;color:white;box-shadow:0 4px 14px rgba(134,212,130,0.3);display:none; }
                .gr-btn-next:hover { background:#5cb85c; }
                .gr-result-icon { font-size:3rem;margin-bottom:8px; }
                .gr-finish { text-align:center;padding:10px 0; }
                .gr-finish h2 { font-size:1.8rem;color:${PRIMARY};margin:0 0 8px; }
                .gr-finish p { color:#666;margin:4px 0;font-size:1rem; }
                .gr-finish-score { font-size:3rem;font-weight:800;color:${PRIMARY};margin:16px 0; }
                .gr-btn-restart { background:${PRIMARY};color:white;padding:14px 36px;font-size:1.05rem;font-weight:700;border:none;border-radius:14px;cursor:pointer;font-family:inherit;box-shadow:0 4px 14px rgba(44,122,211,0.25);margin-top:8px; }
                .gr-btn-restart:hover { background:#1a5fa8; }
            </style>
            <div class="gr-root">
                <div class="gr-topbar">
                    <div class="gr-title">✏️ Грамотей</div>
                    <div class="gr-meta">
                        <div class="gr-streak" id="grStreak">🔥 0</div>
                        <div class="gr-score-badge">⭐ <span id="grScore">0</span></div>
                        <div class="gr-score-badge" style="background:#e8f5e9;color:#2e7d32">Задание <span id="grNum">1</span>/${TASKS.length}</div>
                    </div>
                </div>
                <div class="gr-pbar-wrap"><div class="gr-pbar-fill" id="grPbar" style="width:${pct}%"></div></div>
                <div class="gr-center"><div class="gr-card" id="grCard"></div></div>
            </div>`;
        }

        function renderTask() {
            if (taskIdx >= TASKS.length) { renderFinish(); return; }
            renderBase();
            answered = false;
            const task = TASKS[taskOrder[taskIdx]];
            const card = container.querySelector('#grCard');
            container.querySelector('#grScore').textContent = score;
            container.querySelector('#grNum').textContent = taskIdx + 1;
            container.querySelector('#grStreak').textContent = '🔥 ' + streak;

            if (task.type === 'fill') {
                // Build word display with input in place of underscore
                const parts = task.word.split('_');
                const wordDisplay = `<span style="letter-spacing:4px">${parts[0]}</span><input class="gr-letter-input" id="grInput" maxlength="1" placeholder="_" autocomplete="off" /><span style="letter-spacing:4px">${parts[1]}</span>`;

                card.innerHTML = `
                    <div class="gr-task-num">Задание ${taskIdx + 1} из ${TASKS.length} · Вставь букву</div>
                    <div class="gr-word" id="grWordWrap">${wordDisplay}</div>
                    <div class="gr-rule-tag">${task.rule}</div>
                    <div class="gr-hint" id="grHint"></div>
                    <div class="gr-btn-row">
                        <button class="gr-btn gr-btn-check" id="grCheck" onclick="grCheck()">Проверить</button>
                        <button class="gr-btn gr-btn-next" id="grNext" onclick="grNext()">Следующее →</button>
                    </div>`;

                const inp = card.querySelector('#grInput');
                inp.focus();
                inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); grCheck(); } });

            } else {
                // choose type
                const opts = shuffle(task.options);
                card.innerHTML = `
                    <div class="gr-task-num">Задание ${taskIdx + 1} из ${TASKS.length} · Выбери правильное</div>
                    <div class="gr-question">${task.question}</div>
                    <div class="gr-rule-tag">${task.rule}</div>
                    <div class="gr-opts" id="grOpts">
                        ${opts.map(o => `<button class="gr-opt" onclick="grChoose(this,'${o}')">${o}</button>`).join('')}
                    </div>
                    <div class="gr-hint" id="grHint"></div>
                    <div class="gr-btn-row">
                        <button class="gr-btn gr-btn-next" id="grNext" style="display:none" onclick="grNext()">Следующее →</button>
                    </div>`;
            }
        }

        window.grCheck = function() {
            if (answered) return;
            const task = TASKS[taskOrder[taskIdx]];
            const inp = container.querySelector('#grInput');
            if (!inp) return;
            const val = inp.value.trim().toLowerCase();
            if (!val) { inp.focus(); return; }
            answered = true;
            const correct = val === task.answer.toLowerCase();
            inp.disabled = true;
            inp.classList.add(correct ? 'correct' : 'wrong');
            afterAnswer(correct, task);
        };

        window.grChoose = function(btn, choice) {
            if (answered) return;
            answered = true;
            const task = TASKS[taskOrder[taskIdx]];
            const correct = choice === task.answer;
            const opts = container.querySelectorAll('.gr-opt');
            opts.forEach(o => {
                o.disabled = true;
                if (o.textContent === task.answer) o.classList.add('correct');
                else if (o === btn && !correct) o.classList.add('wrong');
            });
            afterAnswer(correct, task);
        };

        function afterAnswer(correct, task) {
            if (correct) {
                score += 10 + streak * 2;
                streak++;
                if (streak > bestStreak) bestStreak = streak;
            } else {
                streak = 0;
            }
            const scoreEl = container.querySelector('#grScore');
            if (scoreEl) scoreEl.textContent = score;
            const streakEl = container.querySelector('#grStreak');
            if (streakEl) streakEl.textContent = '🔥 ' + streak;

            const hint = container.querySelector('#grHint');
            if (hint) {
                hint.textContent = (correct ? '✅ Правильно! ' : '❌ Неверно. ') + task.hint;
                hint.style.background = correct ? '#f0fff0' : '#fff5f5';
                hint.style.borderLeftColor = correct ? '#86d482' : '#ff8a80';
                hint.style.color = correct ? '#2e7d32' : '#c62828';
                hint.classList.add('show');
            }

            const nextBtn = container.querySelector('#grNext');
            if (nextBtn) nextBtn.style.display = 'inline-block';
            const checkBtn = container.querySelector('#grCheck');
            if (checkBtn) checkBtn.style.display = 'none';

            if (typeof window.onBuiltinGameComplete === 'function' && taskIdx === TASKS.length - 1)
                window.onBuiltinGameComplete('gramotey', score);
        }

        window.grNext = function() {
            taskIdx++;
            renderTask();
        };

        function renderFinish() {
            renderBase();
            const card = container.querySelector('#grCard');
            const stars = score >= TASKS.length * 12 ? '🌟🌟🌟' : score >= TASKS.length * 8 ? '🌟🌟' : '🌟';
            card.innerHTML = `
                <div class="gr-finish">
                    <div class="gr-result-icon">${stars}</div>
                    <h2>Молодец, Грамотей!</h2>
                    <p>Все задания пройдены</p>
                    <div class="gr-finish-score">${score} очков</div>
                    <p>Лучшая серия: <b>${bestStreak}</b> правильных подряд</p>
                    <p style="margin-top:6px">Правильных ответов: <b>${Math.round(score / 10)}</b> из ${TASKS.length}</p>
                    <button class="gr-btn-restart" onclick="window.grRestart()">🔄 Играть снова</button>
                </div>`;
        }

        window.grRestart = function() { startGame(); };

        startGame();
    }
};
