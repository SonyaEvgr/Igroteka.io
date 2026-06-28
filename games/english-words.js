// Игра: Английские слова
window.BUILTIN_GAMES = window.BUILTIN_GAMES || {};
window.BUILTIN_GAMES['english-words'] = {
    id: 'english-words',
    name: 'Английский словарь',
    description: 'Переводи слова с русского на английский! Учи новые слова играя.',
    categoryId: 2,
    image: 'games/english.png',
    icon: '🇬🇧',
    color: '#fff3e0',
    rating: 4.7,
    ratingCount: 30,
    createdAt: new Date('2024-01-25').toISOString(),
    render(container) {
        const words = [
            {ru:'кот',en:'cat',wrong:['dog','hat','car']},
            {ru:'собака',en:'dog',wrong:['cat','fog','log']},
            {ru:'дом',en:'house',wrong:['mouse','horse','louse']},
            {ru:'яблоко',en:'apple',wrong:['maple','table','cable']},
            {ru:'книга',en:'book',wrong:['cook','hook','look']},
            {ru:'школа',en:'school',wrong:['pool','fool','tool']},
            {ru:'друг',en:'friend',wrong:['fiend','trend','blend']},
            {ru:'солнце',en:'sun',wrong:['gun','fun','run']},
            {ru:'вода',en:'water',wrong:['later','hater','gator']},
            {ru:'небо',en:'sky',wrong:['sly','fly','dry']},
            {ru:'птица',en:'bird',wrong:['word','cord','lord']},
            {ru:'рыба',en:'fish',wrong:['dish','wish','swish']},
            {ru:'дерево',en:'tree',wrong:['free','see','bee']},
            {ru:'цветок',en:'flower',wrong:['power','tower','lower']},
            {ru:'звезда',en:'star',wrong:['car','bar','far']},
            {ru:'луна',en:'moon',wrong:['soon','boon','loon']},
            {ru:'снег',en:'snow',wrong:['slow','flow','glow']},
            {ru:'хлеб',en:'bread',wrong:['head','read','lead']},
            {ru:'молоко',en:'milk',wrong:['silk','bilk','ilk']},
            {ru:'стол',en:'table',wrong:['cable','fable','sable']},
        ];

        let shuffled = [...words].sort(() => Math.random()-0.5);
        let current = 0, score = 0, streak = 0;

        function render() {
            if (current >= shuffled.length) {
                container.innerHTML = `
                <div style="font-family:'Nunito',sans-serif;max-width:460px;margin:0 auto;padding:30px 16px;text-align:center;">
                    <div style="font-size:3rem">🎓</div>
                    <h2 style="color:#e65100;margin:10px 0">Словарь пройден!</h2>
                    <div style="font-size:3rem;font-weight:800;color:#e65100">${score}</div>
                    <div style="color:#888;margin-bottom:20px">очков из ${shuffled.length*10}</div>
                    <button style="padding:13px 28px;font-size:1rem;font-weight:700;background:#ffb74d;border:3px solid #e65100;border-radius:12px;cursor:pointer;font-family:inherit;" onclick="location.reload()">Ещё раз!</button>
                </div>`;
                if (typeof window.onBuiltinGameComplete === 'function') window.onBuiltinGameComplete('english-words', score);
                return;
            }
            const w = shuffled[current];
            const opts = [w.en, ...w.wrong].sort(() => Math.random()-0.5);
            container.innerHTML = `
            <style>
                .ew { font-family:'Nunito',sans-serif; max-width:460px; margin:0 auto; padding:28px 16px; text-align:center; }
                .ew h2 { color:#e65100; margin-bottom:14px; }
                .ew-card { background:linear-gradient(135deg,#fff3e0,#ffe0b2); border:3px solid #ffb74d; border-radius:20px; padding:28px; margin:20px 0; }
                .ew-label { font-size:0.85rem; color:#888; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px; }
                .ew-word { font-size:2.4rem; font-weight:800; color:#e65100; }
                .ew-stats { display:flex; justify-content:space-around; margin-bottom:20px; }
                .ew-stat { background:#fff3e0; border-radius:10px; padding:8px 16px; }
                .ew-stat .val { font-size:1.4rem; font-weight:800; color:#e65100; }
                .ew-stat .lbl { font-size:0.75rem; color:#888; }
                .ew-opts { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
                .ew-opt { padding:14px; font-size:1.05rem; font-weight:700; border:2.5px solid #ffb74d; border-radius:12px; background:#fff8f0; cursor:pointer; transition:all 0.2s; font-family:inherit; text-transform:uppercase; letter-spacing:0.5px; }
                .ew-opt:hover { background:#ffb74d; border-color:#e65100; }
                .ew-opt.correct { background:#4caf50!important; border-color:#2e7d32!important; color:white!important; }
                .ew-opt.wrong { background:#f44336!important; border-color:#c62828!important; color:white!important; }
                .ew-progress { height:8px; background:#ffe0b2; border-radius:10px; overflow:hidden; margin-bottom:16px; }
                .ew-progress-fill { height:100%; background:linear-gradient(90deg,#ffb74d,#e65100); border-radius:10px; }
                .streak-badge { background:#ff9800; color:white; padding:3px 10px; border-radius:20px; font-size:0.8rem; font-weight:700; display:inline-block; margin-top:6px; }
            </style>
            <div class="ew">
                <h2>🇬🇧 Английский словарь</h2>
                <div class="ew-progress"><div class="ew-progress-fill" style="width:${current/shuffled.length*100}%"></div></div>
                <div class="ew-stats">
                    <div class="ew-stat"><div class="val">${score}</div><div class="lbl">Очки</div></div>
                    <div class="ew-stat"><div class="val">${current+1}/${shuffled.length}</div><div class="lbl">Слово</div></div>
                    <div class="ew-stat"><div class="val">${streak}</div><div class="lbl">Серия</div></div>
                </div>
                <div class="ew-card">
                    <div class="ew-label">Переведи слово</div>
                    <div class="ew-word">${w.ru}</div>
                    ${streak >= 3 ? `<div class="streak-badge">🔥 Серия ${streak}!</div>` : ''}
                </div>
                <div class="ew-opts">
                    ${opts.map(o=>`<button class="ew-opt" onclick="ewCheck(this,'${o}','${w.en}')">${o}</button>`).join('')}
                </div>
            </div>`;

            window.ewCheck = (btn, chosen, correct) => {
                container.querySelectorAll('.ew-opt').forEach(b => b.onclick = null);
                if (chosen === correct) {
                    btn.classList.add('correct');
                    streak++;
                    score += 10 + (streak > 2 ? streak : 0);
                } else {
                    btn.classList.add('wrong');
                    container.querySelectorAll('.ew-opt').forEach(b => { if(b.textContent===correct) b.classList.add('correct'); });
                    streak = 0;
                }
                setTimeout(() => { current++; render(); }, 800);
            };
        }
        render();
    }
};
