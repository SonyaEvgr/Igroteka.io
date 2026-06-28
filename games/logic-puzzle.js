// Игра: Логическая головоломка — продолжи паттерн
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['logic-puzzle'] = {
    id: 'logic-puzzle',
    name: 'Продолжи ассоциацию',
    description: 'Найди закономерность и выбери следующий элемент! Развивает логическое мышление.',
    categoryId: 4,
    image: 'games/logic.png',
    icon: '🧩',
    color: '#e8f5e9',
    rating: 4.5,
    ratingCount: 21,
    createdAt: new Date('2024-01-20').toISOString(),
    render(container) {
        const puzzles = [
            { sequence: ['🔴','🔵','🔴','🔵','🔴'], answer: '🔵', wrong: ['🔴','🟡','🟢'], hint: 'Чередование цветов' },
            { sequence: ['⭐','⭐⭐','⭐⭐⭐','⭐⭐⭐⭐'], answer: '⭐⭐⭐⭐⭐', wrong: ['⭐⭐','⭐⭐⭐','⭐'], hint: '+1 звезда каждый раз' },
            { sequence: ['🐣','🐥','🐔','🥚'], answer: '🐣', wrong: ['🐔','🐥','🦅'], hint: 'Цикл жизни птицы' },
            { sequence: ['1','2','4','8','16'], answer: '32', wrong: ['24','20','18'], hint: 'Каждое число умножается на 2' },
            { sequence: ['🌱','🌿','🌳','🍂'], answer: '☃️', wrong: ['🌱','🌻','🌿'], hint: 'Времена года' },
            { sequence: ['🔺','🔺🔺','🔺🔺🔺'], answer: '🔺🔺🔺🔺', wrong: ['🔺🔺','🔺🔺🔺🔺🔺','🔺'], hint: 'Добавляется по одному треугольнику' },
            { sequence: ['2','3','5','8','13'], answer: '21', wrong: ['17','18','20'], hint: 'Каждое число = сумма двух предыдущих' },
            { sequence: ['🌑','🌒','🌓','🌔'], answer: '🌕', wrong: ['🌑','🌖','🌒'], hint: 'Фазы луны' },
            { sequence: ['А','В','Г','Ж'], answer: 'М', wrong: ['Е','З','И'], hint: 'Каждый раз пропускается столько же букв' },
            { sequence: ['🍎','🍊','🍋','🍈'], answer: ' 🌀', wrong: ['⚫','👾','🍓'], hint: 'Цвета радуги по очереди' },
        ];

        let current = 0, score = 0, order = [...puzzles].sort(() => Math.random()-0.5);

        function render() {
            const p = order[current];
            const opts = [p.answer, ...p.wrong].sort(() => Math.random()-0.5);
            container.innerHTML = `
            <style>
                .lp { font-family:'Nunito',sans-serif; max-width:500px; margin:0 auto; padding:28px 16px; text-align:center; }
                .lp h2 { color:#2e7d32; margin-bottom:8px; }
                .lp-progress { margin-bottom:20px; }
                .lp-bar { height:8px; background:#e0e0e0; border-radius:10px; overflow:hidden; }
                .lp-bar-fill { height:100%; background:linear-gradient(90deg,#66bb6a,#2e7d32); border-radius:10px; transition:width 0.4s; }
                .lp-score { font-size:1rem; color:#666; margin-top:6px; }
                .lp-seq { display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; margin:24px 0; background:#f1f8e9; border-radius:16px; padding:20px; border:2px solid #a5d6a7; }
                .lp-item { font-size:1.8rem; padding:6px; }
                .lp-q { font-size:2rem; padding:6px; width:50px; height:50px; display:flex; align-items:center; justify-content:center; border:3px dashed #66bb6a; border-radius:10px; }
                .lp-hint { font-size:0.85rem; color:#888; margin-bottom:16px; font-style:italic; }
                .lp-opts { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
                .lp-opt { padding:14px; font-size:1.3rem; font-weight:700; border:2.5px solid #a5d6a7; border-radius:12px; background:#f1f8e9; cursor:pointer; transition:all 0.2s; font-family:inherit; }
                .lp-opt:hover { background:#a5d6a7; border-color:#2e7d32; }
                .lp-opt.correct { background:#4caf50!important; border-color:#2e7d32!important; color:white!important; }
                .lp-opt.wrong { background:#f44336!important; border-color:#c62828!important; color:white!important; }
                .lp-result { padding:30px; }
                .lp-final { font-size:3.5rem; font-weight:800; color:#2e7d32; }
                .lp-restart { margin-top:20px; padding:13px 28px; font-size:1rem; font-weight:700; background:#a5d6a7; border:3px solid #2e7d32; border-radius:12px; cursor:pointer; font-family:inherit; }
                .lp-restart:hover { background:#2e7d32; color:white; }
            </style>
            <div class="lp">
                <h2>🧩 Продолжи паттерн</h2>
                <div class="lp-progress">
                    <div class="lp-bar"><div class="lp-bar-fill" style="width:${current/order.length*100}%"></div></div>
                    <div class="lp-score">Вопрос ${current+1} из ${order.length} | Очки: ${score}</div>
                </div>
                <div class="lp-seq">
                    ${p.sequence.map(s=>`<div class="lp-item">${s}</div>`).join('<div style="font-size:1.5rem;color:#aaa">→</div>')}
                    <div style="font-size:1.5rem;color:#aaa">→</div>
                    <div class="lp-q">?</div>
                </div>
                <div class="lp-hint">💡 Подсказка: ${p.hint}</div>
                <div class="lp-opts">
                    ${opts.map(o=>`<button class="lp-opt" onclick="lpCheck(this,'${o}','${p.answer}')">${o}</button>`).join('')}
                </div>
            </div>`;

            window.lpCheck = (btn, chosen, correct) => {
                container.querySelectorAll('.lp-opt').forEach(b => b.onclick = null);
                if (chosen === correct) { btn.classList.add('correct'); score += 10; }
                else { btn.classList.add('wrong'); container.querySelectorAll('.lp-opt').forEach(b=>{ if(b.textContent===correct) b.classList.add('correct'); }); }
                setTimeout(() => {
                    current++;
                    if (current >= order.length) {
                        container.querySelector('.lp').innerHTML = `<div class="lp-result">
                            <div style="font-size:2.5rem">🧩</div>
                            <h2 style="color:#2e7d32">Задания выполнены!</h2>
                            <div class="lp-final">${score}/${order.length*10}</div>
                            <div style="color:#666;margin-bottom:8px">очков</div>
                            <button class="lp-restart" onclick="location.reload()">Ещё раз</button>
                        </div>`;
                        if (typeof window.onBuiltinGameComplete === 'function') window.onBuiltinGameComplete('logic-puzzle', score);
                    } else render();
                }, 900);
            };
        }
        render();
    }
};
