// Игра: Продолжи сказку
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['fairy-tale'] = {
    id: 'fairy-tale',
    name: 'Продолжи сказку',
    description: 'Дополни предложения своими словами и прочитай получившуюся сказку! Развивает воображение и речь.',
    categoryId: 3,
    image: 'games/сказка.png',
    icon: '📖',
    color: '#fff8e7',
    rating: 4.9,
    ratingCount: 27,
    createdAt: new Date('2024-03-05').toISOString(),
    render(container) {
        container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#f5fbff;overflow:hidden;font-family:"Geologica","Nunito",sans-serif;';

        const PRIMARY  = '#2c7ad3';
        const SKY      = '#8ac6ff';
        const LAVENDER = '#eef0ff';
        const ACCENT   = '#bcbbff';
        const GOLD     = '#f9a825';
        const WARM_BG  = '#fffbf2';

        // ── ШАБЛОНЫ СКАЗОК ───────────────────────────────────────────────────
        const TALES = [
            {
                title: '🌲 Сказка о волшебном лесу',
                emoji: '🌲',
                steps: [
                    { prefix: 'В одном', suffix: 'лесу жил маленький', blank: 'волшебном', placeholder: 'каком? (волшебном, тёмном…)', hint: 'Опиши лес' },
                    { prefix: 'Его звали', suffix: ', и он умел', blank: 'Ёжик', placeholder: 'имя героя', hint: 'Дай герою имя' },
                    { prefix: 'Он умел', suffix: 'лучше всех в лесу.', blank: 'находить грибы', placeholder: 'что умел делать?', hint: 'Какой особый талант?' },
                    { prefix: 'Однажды он нашёл', suffix: 'под старым дубом.', blank: 'маленькую шкатулку', placeholder: 'что нашёл?', hint: 'Загадочная находка' },
                    { prefix: 'Внутри лежала', suffix: 'которая могла исполнить', blank: 'золотая монетка,', placeholder: 'что было внутри?', hint: 'Что было в шкатулке?' },
                    { prefix: 'С тех пор наш герой', suffix: 'и все в лесу', blank: 'помогал друзьям', placeholder: 'что делал герой?', hint: 'Хороший конец' },
                    { prefix: 'Все жили', suffix: 'и никогда не забывали о', blank: 'дружно и весело', placeholder: 'как жили?', hint: 'Счастливая концовка' },
                ],
            },
            {
                title: '🐉 Сказка о храбром рыцаре',
                emoji: '🐉',
                steps: [
                    { prefix: 'За', suffix: 'горами стоял замок', blank: 'высокими синими', placeholder: 'какими? (высокими, дальними…)', hint: 'Опиши горы' },
                    { prefix: 'В замке жил', suffix: 'рыцарь по имени', blank: 'храбрый', placeholder: 'какой рыцарь?', hint: 'Опиши характер' },
                    { prefix: 'Его имя было', suffix: '. Однажды к нему', blank: 'Ян', placeholder: 'имя рыцаря', hint: 'Дай имя' },
                    { prefix: 'К нему пришёл', suffix: 'и попросил помочь.', blank: 'маленький дракон', placeholder: 'кто пришёл?', hint: 'Кто попросил помощи?' },
                    { prefix: 'Дракон потерял свои', suffix: 'и не мог', blank: 'крылья', placeholder: 'что потерял?', hint: 'В чём беда дракона?' },
                    { prefix: 'Рыцарь отправился в путь и нашёл', suffix: 'в дремучем лесу.', blank: 'волшебный цветок', placeholder: 'что нашёл?', hint: 'Волшебный предмет' },
                    { prefix: 'Дракон снова мог', suffix: 'и подружился с рыцарем', blank: 'летать', placeholder: 'что мог делать?', hint: 'Финал дружбы' },
                ],
            },
            {
                title: '🌊 Сказка о морской принцессе',
                emoji: '🌊',
                steps: [
                    { prefix: 'Глубоко в', suffix: 'море жила принцесса', blank: 'синем бескрайнем', placeholder: 'каком море?', hint: 'Опиши море' },
                    { prefix: 'Принцессу звали', suffix: '. У неё были', blank: 'Марина', placeholder: 'имя принцессы', hint: 'Красивое морское имя' },
                    { prefix: 'У неё были', suffix: 'и большие', blank: 'длинные волосы', placeholder: 'что было у принцессы?', hint: 'Внешность принцессы' },
                    { prefix: 'Её лучшим другом был', suffix: 'по имени', blank: 'маленький осьминог', placeholder: 'кто был другом?', hint: 'Морской друг' },
                    { prefix: 'Вместе они любили', suffix: 'среди кораллов.', blank: 'играть в прятки', placeholder: 'что любили делать?', hint: 'Любимое занятие' },
                    { prefix: 'Однажды к ним приплыл', suffix: 'и принёс весть о', blank: 'старый кит', placeholder: 'кто приплыл?', hint: 'Новый персонаж' },
                    { prefix: 'С той поры море стало ещё', suffix: 'и все морские жители', blank: 'добрее и светлее', placeholder: 'каким стало море?', hint: 'Волшебный итог' },
                ],
            },
        ];

        let taleIdx = 0;
        let stepIdx = 0;
        let userWords = [];
        let phase = 'choose'; // 'choose' | 'write' | 'read'

        // ── ФУНКЦИИ РЕНДЕРА ──────────────────────────────────────────────────

        function baseStyles() {
            return `
            <style>
                .ft-root { width:100%;height:100%;display:flex;flex-direction:column;font-family:'Geologica','Nunito',sans-serif;background:#f5fbff; }
                .ft-topbar { display:flex;align-items:center;justify-content:space-between;padding:12px 28px;background:white;border-bottom:2px solid #d9edff;flex-shrink:0; }
                .ft-title { font-size:1.1rem;font-weight:800;color:${PRIMARY};display:flex;align-items:center;gap:8px; }
                .ft-pbar-wrap { height:6px;background:#d9edff;flex-shrink:0; }
                .ft-pbar-fill { height:100%;background:linear-gradient(90deg,${GOLD},#ffcc02);transition:width 0.5s; }
                .ft-center { flex:1;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto; }
                .ft-card {
                    background:white;border-radius:20px;border:2px solid #d9edff;
                    box-shadow:0 8px 32px rgba(44,122,211,0.10);
                    padding:36px 40px;max-width:580px;width:100%;
                }

                /* CHOOSE */
                .ft-choose-title { font-size:1.5rem;font-weight:800;color:${PRIMARY};text-align:center;margin-bottom:6px; }
                .ft-choose-sub   { text-align:center;color:#888;margin-bottom:28px;font-size:0.95rem; }
                .ft-tale-btns    { display:flex;flex-direction:column;gap:14px; }
                .ft-tale-btn {
                    padding:18px 22px;border:2.5px solid #d9edff;border-radius:16px;background:white;
                    font-size:1.05rem;font-weight:700;color:#333;cursor:pointer;font-family:inherit;
                    display:flex;align-items:center;gap:14px;text-align:left;
                    transition:all 0.15s;
                }
                .ft-tale-btn:hover { border-color:${PRIMARY};color:${PRIMARY};background:${LAVENDER}; }
                .ft-tale-btn .ft-emoji { font-size:1.8rem;flex-shrink:0; }

                /* WRITE */
                .ft-step-num { font-size:0.75rem;font-weight:700;color:${SKY};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:14px;text-align:center; }
                .ft-prompt {
                    background:${WARM_BG};border:2px solid #ffe0a0;border-radius:14px;
                    padding:18px 22px;font-size:1.1rem;color:#444;line-height:1.9;margin-bottom:22px;
                    font-weight:600;
                }
                .ft-prompt .ft-blank { color:${GOLD};font-weight:800;font-style:italic; }
                .ft-hint { font-size:0.82rem;color:#aaa;margin-bottom:10px;text-align:center; }
                .ft-input {
                    width:100%;box-sizing:border-box;
                    padding:13px 16px;font-size:1.1rem;font-weight:700;
                    border:3px solid ${SKY};border-radius:14px;color:${PRIMARY};
                    background:#f5fbff;outline:none;font-family:inherit;
                    transition:border-color 0.2s,box-shadow 0.2s;margin-bottom:20px;
                }
                .ft-input:focus { border-color:${PRIMARY};box-shadow:0 0 0 4px rgba(44,122,211,0.12); }
                .ft-prev-words {
                    background:#f8f8ff;border-radius:12px;padding:12px 16px;
                    font-size:0.85rem;color:#888;margin-bottom:20px;line-height:1.8;
                    display:none;
                }
                .ft-btn-row { display:flex;gap:12px;justify-content:center; }
                .ft-btn {
                    padding:13px 28px;font-size:1rem;font-weight:700;border:none;border-radius:14px;
                    cursor:pointer;font-family:inherit;transition:all 0.18s;
                }
                .ft-btn-skip { background:${LAVENDER};color:${PRIMARY}; }
                .ft-btn-skip:hover { background:${ACCENT}; }
                .ft-btn-next { background:${PRIMARY};color:white;box-shadow:0 4px 14px rgba(44,122,211,0.25); }
                .ft-btn-next:hover { background:#1a5fa8; }

                /* READ */
                .ft-read-head { text-align:center;margin-bottom:24px; }
                .ft-read-head .ft-big-emoji { font-size:3rem; }
                .ft-read-head h2 { font-size:1.5rem;font-weight:800;color:${PRIMARY};margin:8px 0 0; }
                .ft-story {
                    background:${WARM_BG};border:2px solid #ffe0a0;border-radius:14px;
                    padding:22px 26px;font-size:1.05rem;line-height:2;color:#333;
                    margin-bottom:24px;font-weight:500;
                }
                .ft-story .ft-highlight { color:${PRIMARY};font-weight:800; }
                .ft-read-btns { display:flex;gap:12px;justify-content:center;flex-wrap:wrap; }
                .ft-btn-new   { background:${PRIMARY};color:white;box-shadow:0 4px 14px rgba(44,122,211,0.25); }
                .ft-btn-new:hover { background:#1a5fa8; }
                .ft-btn-again { background:#86d482;color:white;box-shadow:0 4px 14px rgba(134,212,130,0.3); }
                .ft-btn-again:hover { background:#5cb85c; }
            </style>`;
        }

        function renderChoose() {
            phase = 'choose';
            container.innerHTML = `
            ${baseStyles()}
            <div class="ft-root">
                <div class="ft-topbar">
                    <div class="ft-title">📖 Продолжи сказку</div>
                    <div style="font-size:0.85rem;color:#aaa;font-weight:600">Выбери сказку</div>
                </div>
                <div class="ft-pbar-wrap"><div class="ft-pbar-fill" style="width:0%"></div></div>
                <div class="ft-center">
                    <div class="ft-card">
                        <div class="ft-choose-title">🧚 Выбери сказку</div>
                        <div class="ft-choose-sub">Ты будешь дополнять её своими словами!</div>
                        <div class="ft-tale-btns">
                            ${TALES.map((t, i) => `
                                <button class="ft-tale-btn" onclick="ftChooseTale(${i})">
                                    <span class="ft-emoji">${t.emoji}</span>
                                    <span>${t.title}</span>
                                </button>`).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
        }

        window.ftChooseTale = function(idx) {
            taleIdx = idx;
            stepIdx = 0;
            userWords = [];
            renderStep();
        };

        function renderStep() {
            phase = 'write';
            const tale = TALES[taleIdx];
            const step = tale.steps[stepIdx];
            const total = tale.steps.length;
            const pct = Math.round((stepIdx / total) * 100);

            // Show previous contributions
            let prevHtml = '';
            if (userWords.length > 0) {
                prevHtml = '<div class="ft-prev-words" id="ftPrev" style="display:block">📝 Ты уже написал: ' +
                    userWords.map((w, i) => `<b>${tale.steps[i].prefix}… ${w} …${tale.steps[i].suffix}</b>`).join(' &nbsp;·&nbsp; ') +
                    '</div>';
            }

            container.innerHTML = `
            ${baseStyles()}
            <div class="ft-root">
                <div class="ft-topbar">
                    <div class="ft-title">${tale.emoji} ${tale.title}</div>
                    <div style="font-size:0.85rem;color:#aaa;font-weight:700">Шаг ${stepIdx + 1} из ${total}</div>
                </div>
                <div class="ft-pbar-wrap"><div class="ft-pbar-fill" style="width:${pct}%"></div></div>
                <div class="ft-center">
                    <div class="ft-card">
                        <div class="ft-step-num">✍️ Шаг ${stepIdx + 1} из ${total} — Дополни предложение</div>
                        <div class="ft-prompt">
                            ${step.prefix} <span class="ft-blank">[____]</span> ${step.suffix}
                        </div>
                        <div class="ft-hint">💡 ${step.hint} · например: «${step.blank}»</div>
                        ${prevHtml}
                        <input class="ft-input" id="ftInput" placeholder="${step.placeholder}" autocomplete="off" />
                        <div class="ft-btn-row">
                            <button class="ft-btn ft-btn-skip" onclick="ftSkip()">Пропустить</button>
                            <button class="ft-btn ft-btn-next" onclick="ftNextStep()">Дальше →</button>
                        </div>
                    </div>
                </div>
            </div>`;

            const inp = container.querySelector('#ftInput');
            inp.focus();
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ftNextStep(); } });
        }

        window.ftNextStep = function() {
            const inp = container.querySelector('#ftInput');
            let val = inp ? inp.value.trim() : '';
            if (!val) val = TALES[taleIdx].steps[stepIdx].blank; // use default if empty
            userWords.push(val);
            stepIdx++;
            const tale = TALES[taleIdx];
            if (stepIdx >= tale.steps.length) renderRead();
            else renderStep();
        };

        window.ftSkip = function() {
            const tale = TALES[taleIdx];
            userWords.push(tale.steps[stepIdx].blank);
            stepIdx++;
            if (stepIdx >= tale.steps.length) renderRead();
            else renderStep();
        };

        function renderRead() {
            phase = 'read';
            const tale = TALES[taleIdx];

            // Build the story text with highlighted user words
            const sentences = tale.steps.map((step, i) => {
                const word = userWords[i] || step.blank;
                return `${step.prefix} <span class="ft-highlight">${word}</span> ${step.suffix}`;
            });

            container.innerHTML = `
            ${baseStyles()}
            <div class="ft-root">
                <div class="ft-topbar">
                    <div class="ft-title">${tale.emoji} ${tale.title}</div>
                    <div style="font-size:0.85rem;color:#86d482;font-weight:700">✅ Сказка готова!</div>
                </div>
                <div class="ft-pbar-wrap"><div class="ft-pbar-fill" style="width:100%"></div></div>
                <div class="ft-center">
                    <div class="ft-card">
                        <div class="ft-read-head">
                            <div class="ft-big-emoji">${tale.emoji}</div>
                            <h2>${tale.title}</h2>
                        </div>
                        <div class="ft-story">
                            ${sentences.map(s => `<p style="margin:0 0 12px">${s}</p>`).join('')}
                        </div>
                        <div class="ft-read-btns">
                            <button class="ft-btn ft-btn-again" onclick="ftAgain()">🔄 Ещё раз эту сказку</button>
                            <button class="ft-btn ft-btn-new" onclick="ftNew()">📚 Другая сказка</button>
                        </div>
                    </div>
                </div>
            </div>`;

            if (typeof window.onBuiltinGameComplete === 'function')
                window.onBuiltinGameComplete('fairy-tale', 100);
        }

        window.ftAgain = function() {
            stepIdx = 0;
            userWords = [];
            renderStep();
        };

        window.ftNew = function() { renderChoose(); };

        renderChoose();
    }
};
