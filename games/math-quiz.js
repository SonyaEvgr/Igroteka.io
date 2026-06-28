// Игра: Математическая викторина
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['math-quiz'] = {
    id: 'math-quiz',
    name: 'Математическая викторина',
    description: 'Решай примеры на сложение, вычитание и умножение! Кто наберёт больше очков за 60 секунд?',
    categoryId: 2,
    image: 'games/math.png',
    icon: '🔢',
    color: '#e3f2fd',
    rating: 4.6,
    ratingCount: 24,
    createdAt: new Date('2024-01-10').toISOString(),
    render(container) {
        container.innerHTML = `
        <style>
            .mq { font-family:'Nunito',sans-serif; max-width:480px; margin:0 auto; padding:30px 20px; text-align:center; }
            .mq h2 { color:#658bd1; margin-bottom:6px; font-size:1.8rem; }
            .mq-stats { display:flex; justify-content:space-around; margin:16px 0; }
            .mq-stat { background:#e3f2fd; border-radius:12px; padding:10px 20px; }
            .mq-stat .val { font-size:1.6rem; font-weight:800; color:#658bd1; }
            .mq-stat .lbl { font-size:0.8rem; color:#666; }
            .mq-question { font-size:2.5rem; font-weight:800; color:#333; margin:24px 0; min-height:60px; }
            .mq-answers { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:20px 0; }
            .mq-ans { padding:16px; font-size:1.2rem; font-weight:700; border:3px solid #9dc0f5; border-radius:12px; background:#f5f9ff; cursor:pointer; transition:all 0.2s; font-family:inherit; }
            .mq-ans:hover { background:#9dc0f5; border-color:#658bd1; color:white; }
            .mq-ans.correct { background:#4caf50!important; border-color:#388e3c!important; color:white!important; }
            .mq-ans.wrong { background:#f44336!important; border-color:#c62828!important; color:white!important; }
            .mq-result { padding:30px; }
            .mq-score-big { font-size:4rem; font-weight:800; color:#658bd1; }
            .mq-restart { margin-top:20px; padding:14px 32px; font-size:1.1rem; font-weight:700; background:#9dc0f5; border:3px solid #658bd1; border-radius:12px; cursor:pointer; font-family:inherit; color:#333; }
            .mq-restart:hover { background:#658bd1; color:white; }
            .mq-progress { height:8px; background:#e0e0e0; border-radius:10px; margin-bottom:20px; overflow:hidden; }
            .mq-progress-fill { height:100%; background:linear-gradient(90deg,#9dc0f5,#658bd1); border-radius:10px; transition:width 0.1s linear; }
        </style>
        <div class="mq">
            <h2>🔢 Математика</h2>
            <div id="mqGame">
                <div class="mq-progress"><div class="mq-progress-fill" id="mqProgress" style="width:100%"></div></div>
                <div class="mq-stats">
                    <div class="mq-stat"><div class="val" id="mqScore">0</div><div class="lbl">Очки</div></div>
                    <div class="mq-stat"><div class="val" id="mqTimer">60</div><div class="lbl">Секунд</div></div>
                    <div class="mq-stat"><div class="val" id="mqStreak">0</div><div class="lbl">Серия</div></div>
                </div>
                <div class="mq-question" id="mqQ">Готов?</div>
                <div class="mq-answers" id="mqAnswers"></div>
            </div>
        </div>`;

        let score = 0, timeLeft = 60, streak = 0, timer = null, canAnswer = true;

        function genQuestion() {
            const ops = ['+', '-', '×'];
            const op = ops[Math.floor(Math.random() * ops.length)];
            let a, b, ans;
            if (op === '+') { a = Math.floor(Math.random()*50)+1; b = Math.floor(Math.random()*50)+1; ans = a+b; }
            else if (op === '-') { a = Math.floor(Math.random()*50)+10; b = Math.floor(Math.random()*a)+1; ans = a-b; }
            else { a = Math.floor(Math.random()*10)+1; b = Math.floor(Math.random()*10)+1; ans = a*b; }
            return { text: `${a} ${op} ${b} = ?`, answer: ans };
        }

        function makeWrong(correct) {
            const wrongs = new Set();
            while (wrongs.size < 3) {
                const delta = Math.floor(Math.random()*10)-5;
                const w = correct + delta;
                if (w !== correct && w >= 0) wrongs.add(w);
            }
            return [...wrongs];
        }

        function showQuestion() {
            if (!canAnswer) return;
            const q = genQuestion();
            document.getElementById('mqQ').textContent = q.text;
            const opts = [q.answer, ...makeWrong(q.answer)].sort(() => Math.random()-0.5);
            const answersEl = document.getElementById('mqAnswers');
            answersEl.innerHTML = '';
            opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'mq-ans';
                btn.textContent = opt;
                btn.onclick = () => checkAnswer(opt, q.answer, btn);
                answersEl.appendChild(btn);
            });
        }

        function checkAnswer(chosen, correct, btn) {
            if (!canAnswer) return;
            canAnswer = false;
            const allBtns = document.querySelectorAll('.mq-ans');
            if (chosen === correct) {
                btn.classList.add('correct');
                streak++;
                score += 10 + (streak > 2 ? streak * 2 : 0);
            } else {
                btn.classList.add('wrong');
                allBtns.forEach(b => { if (parseInt(b.textContent) === correct) b.classList.add('correct'); });
                streak = 0;
            }
            document.getElementById('mqScore').textContent = score;
            document.getElementById('mqStreak').textContent = streak;
            setTimeout(() => { canAnswer = true; showQuestion(); }, 700);
        }

        function endGame() {
            clearInterval(timer);
            const game = document.getElementById('mqGame');
            game.innerHTML = `<div class="mq-result">
                <div style="font-size:2.5rem">🎉</div>
                <div style="font-size:1.2rem;font-weight:700;margin:10px 0;color:#333">Игра окончена!</div>
                <div class="mq-score-big">${score}</div>
                <div style="color:#666;margin-bottom:16px">очков набрано</div>
                <button class="mq-restart" onclick="location.reload()">Играть снова</button>
            </div>`;
            if (typeof window.onBuiltinGameComplete === 'function') window.onBuiltinGameComplete('math-quiz', score);
        }

        showQuestion();
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('mqTimer').textContent = timeLeft;
            document.getElementById('mqProgress').style.width = (timeLeft / 60 * 100) + '%';
            if (timeLeft <= 0) endGame();
        }, 1000);
    }
};
